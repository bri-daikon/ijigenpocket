const editor = document.getElementById('editor');
const tocContainer = document.getElementById('toc-container');
const charCountDisplay = document.getElementById('char-count');
const saveStatus = document.getElementById('save-status');
const titleInput = document.getElementById('scenario-title');
const toast = document.getElementById('toast');
let savedSelectionRange = null;
let isDirty = false; // 未保存の変更フラグ

// セクション編集モード用変数
let isSectionMode = false;
let sectionsData = [];
let currentSectionIndex = -1;

/* --- 文字サイズ管理（修正：正確なサイズの取得と反映） --- */
function changeSelectionFontSize(deltaPx) {
    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let target = selection.anchorNode;
    if (target.nodeType === 3) target = target.parentElement;

    // 直近の明示的なスタイルを持つ要素を探してサイズを取得
    let currentSize = 16;
    let el = target;
    while (el && el !== editor) {
        if (el.style && el.style.fontSize) {
            currentSize = parseInt(el.style.fontSize);
            break;
        }
        el = el.parentElement;
    }

    // 明示的なスタイルがなければ計算されたスタイルを使用
    if (currentSize === 16 && target) {
        currentSize = parseInt(window.getComputedStyle(target).fontSize) || 16;
    }

    let newSize = Math.max(8, Math.min(72, currentSize + deltaPx));

    if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = newSize + 'px';
        try {
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);

            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.addRange(newRange);
        } catch (e) {
            document.execCommand('fontSize', false, deltaPx > 0 ? "4" : "2");
        }
    } else {
        const span = document.createElement('span');
        span.style.fontSize = newSize + 'px';
        span.innerHTML = '&#8203;';
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.setStart(span.firstChild, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }

    document.getElementById('current-font-size-display').textContent = newSize;
    autoUpdateUI();
}

function updateEditorStyles() {
    const fontFamily = document.getElementById('font-family-select').value;
    const lineHeight = document.getElementById('line-height-select').value;

    let fontCSS = '';
    if (fontFamily === 'sans-serif') {
        fontCSS = "system-ui, -apple-system, sans-serif";
    } else if (fontFamily === 'serif') {
        fontCSS = 'Georgia, Cambria, "Times New Roman", Times, "YuMincho", "Hiragino Mincho ProN", serif';
    } else if (fontFamily === 'monospace') {
        fontCSS = 'Consolas, Monaco, "Courier New", monospace';
    } else if (fontFamily === 'yu-gothic') {
        fontCSS = '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif';
    } else if (fontFamily === 'yu-mincho') {
        fontCSS = '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", serif';
    } else if (fontFamily === 'meiryo') {
        fontCSS = '"Meiryo", "MS PGothic", sans-serif';
    } else if (fontFamily === 'rounded-gothic') {
        fontCSS = '"Hiragino Maru Gothic ProN", "Kosugi Maru", "HGMaruGothicMPRO", sans-serif';
    } else if (fontFamily === 'ms-pgothic') {
        fontCSS = '"MS PGothic", "MS UI Gothic", sans-serif';
    } else if (fontFamily === 'ms-pmincho') {
        fontCSS = '"MS PMincho", serif';
    }

    editor.style.fontFamily = fontCSS;
    editor.style.lineHeight = lineHeight;

    autoUpdateUI();
}

/* --- ヘルパー: 色を濃くする --- */
function darkenColor(hex, percent) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * (1 - percent));
    g = Math.floor(g * (1 - percent));
    b = Math.floor(b * (1 - percent));
    return `rgb(${r}, ${g}, ${b})`;
}

/* --- ヘルパー: 選択範囲のHTMLを取得（アンドゥ時にテキストが復元できるよう、削除はinsertHTMLに任せる） --- */
function getSelectedHtmlAndRemove() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) return null; // 選択なし

        const clonedSelection = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(clonedSelection);
        const html = div.innerHTML;

        // 注意: ここで range.deleteContents() を呼ぶとブラウザのUndoスタック外でDOMが削除され、
        // 枠挿入後にアンドゥ（Ctrl+Z）した際に枠ごと文字が消滅してしまいます。
        // 削除は後続の document.execCommand('insertHTML', ...) による選択範囲の一括置換（アトミックなUndo操作）に委ねます。
        return html;
    }
    return null;
}

/* --- UI制御 --- */
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function setTheme(theme) { document.body.setAttribute('data-theme', theme); localStorage.setItem('weby_theme', theme); }
function toggleToolbar() {
    const settings = document.getElementById('settings-wrapper');
    const headerTitle = document.getElementById('header-title');
    const currentSection = document.getElementById('current-section-display');
    const toolbarWrapper = document.getElementById('toolbar-wrapper');

    if (settings) settings.classList.toggle('hidden');
    if (headerTitle) headerTitle.classList.toggle('hidden');
    if (currentSection) currentSection.classList.toggle('hidden');
    if (toolbarWrapper) toolbarWrapper.classList.remove('collapsed');
}
function toggleSearchReplace() { document.getElementById('search-replace-bar').classList.toggle('active'); }

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2000);
}

/* --- プロジェクト管理 --- */

function autoUpdateUI() {
    updateTOC();
    updateCharCount();
    updatePageBreakGuides();
    saveStatus.textContent = "変更あり（未保存）";
    saveStatus.classList.add('text-amber-500');
    isDirty = true;
}

// 保存を実行
function executeDirectSave() {
    const title = titleInput.value.trim() || 'シナリオ';
    const content = {
        title,
        content: editor.innerHTML,
        lineLimit: document.getElementById('page-line-limit')?.value || '35',
        charLimit: document.getElementById('page-char-limit')?.value || '40',
        fontFamily: document.getElementById('font-family-select')?.value || 'sans-serif',
        lineHeight: document.getElementById('line-height-select')?.value || '1.8',
        exportLayout: document.getElementById('export-layout-select')?.value || '1',
        exportSettings: {
            paperSize: document.getElementById('export-paper-size')?.value || 'A4',
            marginTop: document.getElementById('export-margin-top')?.value || '20',
            marginBottom: document.getElementById('export-margin-bottom')?.value || '20',
            marginLeft: document.getElementById('export-margin-left')?.value || '20',
            marginRight: document.getElementById('export-margin-right')?.value || '20',
            indentParagraph: document.getElementById('export-indent-paragraph')?.checked || false
        },
        snippets: getSnippets()
    };
    const jsonStr = JSON.stringify(content, null, 2);

    saveStatus.textContent = "保存ダイアログを確認中...";
    saveStatus.classList.remove('text-amber-500');
    isDirty = false;

    try {
        localStorage.setItem('weby_autosave', editor.innerHTML);
        localStorage.setItem('weby_autosave_title', titleInput.value);
        localStorage.setItem('weby_autosave_fontFamily', document.getElementById('font-family-select')?.value || 'sans-serif');
        localStorage.setItem('weby_autosave_lineHeight', document.getElementById('line-height-select')?.value || '1.8');
        localStorage.setItem('weby_autosave_lineLimit', document.getElementById('page-line-limit')?.value || '35');
        localStorage.setItem('weby_autosave_charLimit', document.getElementById('page-char-limit')?.value || '40');
        localStorage.setItem('weby_autosave_exportLayout', document.getElementById('export-layout-select')?.value || '1');
    } catch (e) { console.warn("バックアップ失敗: 容量不足"); }

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.weby`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setTimeout(() => {
        saveStatus.textContent = "保存操作を完了しました";
        showToast("保存操作を実行しました");
        isDirty = false;
    }, 1000);
}

function loadProjectWithPicker() {
    document.getElementById('project-load-fallback').click();
}

function loadProjectFallback(input) {
    if (input.files?.[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                editor.innerHTML = data.content;
                upgradeBoxes(editor); // 古い枠があれば新形式にアップグレード
                titleInput.value = data.title;
                if (data.lineLimit) {
                    const limitInput = document.getElementById('page-line-limit');
                    if (limitInput) limitInput.value = data.lineLimit;
                }
                if (data.charLimit) {
                    const limitInput = document.getElementById('page-char-limit');
                    if (limitInput) limitInput.value = data.charLimit;
                }
                if (data.fontFamily) {
                    const fontSelect = document.getElementById('font-family-select');
                    if (fontSelect) fontSelect.value = data.fontFamily;
                }
                if (data.lineHeight) {
                    const lhSelect = document.getElementById('line-height-select');
                    if (lhSelect) lhSelect.value = data.lineHeight;
                }
                if (data.exportLayout) {
                    const layoutSelect = document.getElementById('export-layout-select');
                    if (layoutSelect) layoutSelect.value = data.exportLayout;
                }
                if (data.exportSettings) {
                    if (document.getElementById('export-paper-size')) document.getElementById('export-paper-size').value = data.exportSettings.paperSize || 'A4';
                    if (document.getElementById('export-margin-top')) document.getElementById('export-margin-top').value = data.exportSettings.marginTop || '20';
                    if (document.getElementById('export-margin-bottom')) document.getElementById('export-margin-bottom').value = data.exportSettings.marginBottom || '20';
                    if (document.getElementById('export-margin-left')) document.getElementById('export-margin-left').value = data.exportSettings.marginLeft || '20';
                    if (document.getElementById('export-margin-right')) document.getElementById('export-margin-right').value = data.exportSettings.marginRight || '20';
                    if (document.getElementById('export-indent-paragraph')) document.getElementById('export-indent-paragraph').checked = data.exportSettings.indentParagraph || false;
                }
                if (data.snippets) {
                    saveSnippets(data.snippets);
                }
                updateEditorStyles();
                if (isSectionMode) {
                    currentSectionIndex = -1; // 読み込み前にリセット
                    parseIntoSections(editor.innerHTML);
                    if (sectionsData.length > 0) {
                        loadSection(0);
                    } else {
                        sectionsData = [{ id: 'sec_0', title: '本文', level: 1, content: editor.innerHTML }];
                        loadSection(0);
                    }
                } else {
                    updateTOC();
                }
                updateCharCount();
                updateEditorWidth();
                updatePageBreakGuides();
                renderAllMermaidCharts();
                saveStatus.textContent = "読み込み完了";
                saveStatus.classList.remove('text-amber-500');
                isDirty = false;
                showToast("読み込みました");
            } catch (err) { alert('読み込み失敗: 正しいファイル形式ではありません。'); }
        };
        reader.readAsText(file);
    }
}

function upgradeBoxes(container) {
    const boxes = container.querySelectorAll('.box-custom, .box-special, .box-custom-snippet, .box-summary, .box-check, .box-spot, .box-listen, .box-library, .box-san, .box-search, .box-secret, .box-gimmick, .box-tendency, .kp-info, .quote');
    boxes.forEach(box => {
        // すでにラップされているかチェック
        if (box.parentElement && box.parentElement.classList.contains('box-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'box-wrapper group relative my-4 block';
        wrapper.setAttribute('contenteditable', 'false');
        wrapper.setAttribute('draggable', 'true');
        wrapper.style.clear = 'both';
        wrapper.style.userSelect = 'none';

        const handleContainer = document.createElement('div');
        handleContainer.className = 'drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10';
        handleContainer.setAttribute('contenteditable', 'false');
        handleContainer.innerHTML = `
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        `;

        box.setAttribute('contenteditable', 'true');
        box.style.margin = '0'; // ラッパー側にマージンを任せる
        box.style.userSelect = 'text';

        box.parentNode.insertBefore(wrapper, box);
        wrapper.appendChild(handleContainer);
        wrapper.appendChild(box);
    });
}

function confirmNewProject() {
    editor.innerHTML = '<p><br></p>';
    titleInput.value = '';
    if (isSectionMode) {
        currentSectionIndex = -1; // 新規作成時にリセット
        sectionsData = [{ id: 'sec_0', title: '本文', level: 1, content: editor.innerHTML }];
        loadSection(0);
    } else {
        updateTOC();
    }
    closeModal('confirm-modal');
    updateTOC(); updateCharCount();
    saveStatus.textContent = "新規作成";
    saveStatus.classList.remove('text-amber-500');
    isDirty = false;
    showToast("新規作成しました");
}

/* --- 書き出し機能 --- */
function exportHTML() {
    updateTOC();
    const title = titleInput.value || '無題のシナリオ';
    const layout = document.getElementById('export-layout-select').value;
    const fontFamily = document.getElementById('font-family-select').value;
    const lineHeight = document.getElementById('line-height-select').value;
    let fontCSS = fontFamily === 'sans-serif' ? "system-ui, -apple-system, sans-serif" :
        fontFamily === 'serif' ? 'Georgia, Cambria, "Times New Roman", Times, "YuMincho", "Hiragino Mincho ProN", serif' :
            fontFamily === 'monospace' ? 'Consolas, Monaco, "Courier New", monospace' :
                fontFamily === 'yu-gothic' ? '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif' :
                    fontFamily === 'yu-mincho' ? '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", serif' :
                        fontFamily === 'meiryo' ? '"Meiryo", "MS PGothic", sans-serif' :
                            fontFamily === 'rounded-gothic' ? '"Hiragino Maru Gothic ProN", "Kosugi Maru", "HGMaruGothicMPRO", sans-serif' :
                                fontFamily === 'ms-pgothic' ? '"MS PGothic", "MS UI Gothic", sans-serif' :
                                    fontFamily === 'ms-pmincho' ? '"MS PMincho", serif' :
                                        "system-ui, -apple-system, sans-serif";

    // ページ分割ロジック
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;

    // HTML出力用の調整: 古い能力値グリッドを横一列のテキストに変換 (旧バージョンのキャラシ救済)
    tempDiv.querySelectorAll('.char-stats-grid').forEach(grid => {
        if (grid.tagName === 'DIV' || grid.tagName === 'TABLE') {
            const newContainer = document.createElement('div');
            newContainer.className = 'char-stats-container';
            newContainer.style.lineHeight = '2';

            const labels = ['STR', 'CON', 'POW', 'DEX', 'APP', 'SIZ', 'INT', 'EDU', 'SAN'];
            const inputs = grid.querySelectorAll('.char-stat-input');

            for (let i = 0; i < Math.min(labels.length, inputs.length); i++) {
                const input = inputs[i];
                let val = '0';
                if (input.tagName === 'INPUT') {
                    val = input.value || input.getAttribute('value') || '0';
                } else {
                    val = input.innerText || input.textContent || '0';
                }
                const span = document.createElement('span');
                span.style.whiteSpace = 'nowrap';
                span.style.marginRight = '12px';
                span.innerHTML = '<strong style="color:gray; font-size:10px;">' + labels[i] + ':</strong> <span style="font-weight:bold;">' + val + '</span>';
                newContainer.appendChild(span);
            }
            grid.parentNode.replaceChild(newContainer, grid);
        }
    });

    const nodes = Array.from(tempDiv.childNodes);

    let pagesHtml = '', currentPageContent = '', currentLineCount = 0, pageNum = 1;
    // ユーザー指定の行数またはデフォルト35行
    const MAX_LINES = parseInt(document.getElementById('page-line-limit').value) || 35;

    const flushPage = () => {
        pagesHtml += `
            <div class="page">
                <div class="page-content ${layout === '2' ? 'col-2' : ''}">
                    ${currentPageContent}
                </div>
                <div class="page-footer">- ${pageNum} -</div>
            </div>
        `;
        currentPageContent = '';
        currentLineCount = 0;
        pageNum++;
    };

    nodes.forEach(node => {
        // 手動改ページマークの検出
        let isManualPageBreak = false;
        if (node.nodeType === 1 && (node.classList.contains('page-break') || node.querySelector('.page-break'))) {
            isManualPageBreak = true;
            flushPage();
            if (!node.textContent.trim() && !node.querySelector('img, table')) {
                return;
            }
        }

        let weight = 1; // 基本1行分
        if (node.nodeType === 1) { // Element node
            const tag = node.tagName;
            const text = node.innerText || "";

            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;

            // 段組みに合わせて1行あたりの文字数を緩和して計算
            const charLimit = parseInt(document.getElementById('page-char-limit')?.value) || 40;
            const textLines = Math.ceil(text.length / (layout === '2' ? Math.ceil(charLimit / 2) : charLimit)) || 1;

            const pbH1 = document.getElementById('export-page-break-h1');
            if (tag === 'H1' && pbH1 && pbH1.checked && typeof currentLineCount !== 'undefined' && currentLineCount > 0) {
                if (typeof flushPage === 'function') {
                    flushPage();
                    if (typeof isManualPageBreak !== 'undefined') isManualPageBreak = true;
                } else if (typeof pageNum !== 'undefined') {
                    pageNum++;
                    currentLineCount = 0;
                }
            }

            if (tag === 'H1') weight = 3;
            else if (tag === 'H2') weight = 2;
            else if (tag === 'H3') weight = 2;
            else if (tag === 'IMG') weight = 10;
            else if (node.classList.contains('divider')) weight = 1;
            else if (node.tagName === 'TABLE') weight = 6;
            else if (node.classList.contains('kp-info') || node.className.includes('box-')) weight = 4;
            else weight = textLines * sizeRatio;
        }

        // ページ溢れチェック
        if (!isManualPageBreak && currentLineCount + weight > MAX_LINES && currentPageContent !== '') {
            flushPage();
        }

        currentPageContent += node.nodeType === 1 ? node.outerHTML : node.textContent;
        currentLineCount += weight;
    });

    if (currentPageContent !== '') flushPage();

    // 目次生成          
    const headings = Array.from(editor.querySelectorAll('h1, h2, h3, h4, h5, h6, .h7, .h8'));
    let tocHtml = '';
    headings.forEach(h => {
        const lv = h.tagName.startsWith('H') ? parseInt(h.tagName[1]) : (h.classList.contains('h7') ? 7 : 8);
        const padding = (lv - 1) * 15;
        tocHtml += `<a href="#${h.id}" class="toc-link" style="padding-left: ${padding + 12}px;">${h.textContent}</a>`;
    });

    // 出力用CSS（エディタのスタイルを再現）
    const exportStyles = `
        :root { --bg-body: #e2e8f0; --bg-page: #ffffff; --text-main: #0f172a; --border-editor: #e2e8f0; --accent: #4f46e5; }
        * { box-sizing: border-box; }
        body { font-family: ${fontCSS}; line-height: ${lineHeight}; color: var(--text-main); margin: 0; padding: 0; background-color: var(--bg-body); display: flex; scroll-behavior: smooth; }
        
        aside { width: 280px; height: 100vh; position: fixed; top: 0; left: 0; background: white; border-right: 1px solid var(--border-editor); overflow-y: auto; padding: 20px; z-index: 100; }
        .toc-title { font-weight: bold; font-size: 1.1rem; border-bottom: 2px solid var(--accent); padding-bottom: 8px; margin-bottom: 15px; color: var(--accent); }
        .toc-link { display: block; padding: 6px 12px; font-size: 0.9rem; text-decoration: none; color: #64748b; border-left: 3px solid transparent; transition: 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .toc-link:hover { background: #f8fafc; color: var(--accent); border-left-color: var(--accent); }

        main { flex: 1; margin-left: 280px; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        
        /* ページ設定 */
        .page { 
            width: 800px; 
            min-height: 1130px; 
            background: var(--bg-page); 
            padding: 40px 60px 60px; 
            margin-bottom: 30px; 
            position: relative; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            border: 1px solid var(--border-editor);
            display: flex;
            flex-direction: column;
        }
        .page-content { flex: 1; overflow: hidden; }
        .page-footer { 
            position: absolute; 
            bottom: 25px; 
            left: 0; 
            width: 100%; 
            text-align: center; 
            font-size: 0.8rem; 
            color: #94a3b8; 
        }

        .col-2 {
            column-count: 2;
            column-gap: 2.5rem;
            column-rule: 1px solid #eee;
        }
        
        h1 { font-size: 2.2rem; font-weight: 800; color: var(--accent); border-bottom: 4px solid var(--accent); padding-bottom: 0.5rem; margin-top: 0; margin-bottom: 1.5rem; }
        h2 { font-size: 1.6rem; font-weight: 700; border-left: 8px solid var(--accent); padding-left: 1rem; margin-top: 1.5rem; margin-bottom: 1rem; background-color: rgba(79, 70, 229, 0.05); }
        h3 { font-size: 1.3rem; font-weight: 700; border-bottom: 1px solid var(--border-editor); margin-top: 1.2rem; margin-bottom: 0.5rem; }
        h4, h5, h6 { font-weight: 700; margin-top: 1.25rem; }
        .h7 { font-size: 0.95rem; font-weight: 700; color: #64748b; margin-top: 0.5rem; border-left: 2px solid #64748b; padding-left: 0.5rem; display: block; }
        .h8 { font-size: 0.9rem; font-weight: 700; color: #64748b; font-style: italic; margin-top: 0.5rem; opacity: 0.8; display: block; }
        p { margin: 0; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; break-inside: avoid; }
        .img-left { float: left; margin: 0 1.5rem 1rem 0; max-width: 45%; }
        .img-right { float: right; margin: 0 0 1rem 1.5rem; max-width: 45%; }
        .img-center { display: block; margin: 1.5rem auto; float: none; clear: both; }

        table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; break-inside: avoid; }
        td, th { border: 1px solid var(--border-editor); padding: 8px; text-align: left; }
        th { background-color: #f8fafc; font-weight: bold; }
        .divider { border: 0; height: 1px; background-image: linear-gradient(to right, rgba(79, 70, 229, 0), rgba(79, 70, 229, 0.75), rgba(79, 70, 229, 0)); margin: 2rem 0; clear: both; }
        details { border: 1px solid var(--border-editor); border-radius: 8px; padding: 1rem; background: rgba(0,0,0,0.02); margin: 1rem 0; break-inside: avoid; }
        summary { cursor: pointer; font-weight: bold; color: var(--accent); }
        
        .kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet { padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border: 1px solid transparent; clear: both; break-inside: avoid; }
        .box-special { border-top-width: 4px; border-left: 0; border-right: 0; border-bottom: 0; border-style: solid; }
        .box-secret { border-style: dashed; }
        .quote { border-left: 4px solid #94a3b8; border-radius: 0; font-style: italic; background: #f8fafc; }

        @media (max-width: 1100px) {
            aside { display: none; }
            main { margin-left: 0; }
        }
        @media print {
            body { background: white; }
            aside { display: none; }
            main { margin-left: 0; padding: 0; }
            .page { 
                margin: 0; 
                box-shadow: none; 
                border: none; 
                page-break-after: always; 
                width: 100%; 
            }
            .box-char-sheet .char-image-placeholder {
                display: none !important;
            }
            .box-char-sheet .char-image-container {
                border: 1px solid #e2e8f0 !important;
                background: transparent !important;
            }
        }
        .scenario-text-block, .page-content > ul, .page-content > ol, .page-content > blockquote {
            cursor: pointer;
            transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
            border-radius: 6px;
            padding: 4px 8px;
            margin: 0.5rem -8px;
            border: 1px solid transparent;
        }
        .scenario-text-block:hover, .page-content > ul:hover, .page-content > ol:hover, .page-content > blockquote:hover {
            background-color: rgba(79, 70, 229, 0.08);
            border-color: rgba(79, 70, 229, 0.35);
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
        }
        .kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet {
            cursor: pointer;
            transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
        .kp-info:hover, .quote:hover, .box-summary:hover, .box-check:hover, .box-spot:hover, .box-search:hover, .box-listen:hover, .box-library:hover, .box-san:hover, .box-secret:hover, .box-gimmick:hover, .box-tendency:hover, .box-custom:hover, .box-special:hover, .box-custom-snippet:hover {
            border-color: rgba(79, 70, 229, 0.6) !important;
            background-color: rgba(79, 70, 229, 0.08) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .box-flowchart {
            margin: 1.5rem 0;
            padding: 1.5rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            clear: both;
            break-inside: avoid;
            cursor: pointer;
            transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
        .box-flowchart:hover {
            border-color: rgba(79, 70, 229, 0.6) !important;
            background-color: rgba(79, 70, 229, 0.08) !important;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
        }
        .box-flowchart .flowchart-actions {
            display: none;
        }
        
        /* キャラクターシートのスタイル */
        .box-char-sheet {
            margin: 1.5rem 0;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            clear: both;
            break-inside: avoid;
            font-family: sans-serif;
            text-align: left;
            border: 1px solid #e2e8f0;
        }
        .box-char-sheet input, .box-char-sheet textarea {
            color: #0f172a !important;
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            font-size: 11px !important;
            width: 100% !important;
            outline: none !important;
            transition: border-color 0.15s !important;
        }
        .box-char-sheet input:focus, .box-char-sheet textarea:focus {
            border-color: #6366f1 !important;
            background-color: #ffffff !important;
        }
        .box-char-sheet .char-stat-input {
            text-align: center !important;
            font-weight: bold !important;
            font-size: 13px !important;
            padding: 2px 4px !important;
        }
        .box-char-sheet .char-stats-grid {
            display: grid !important;
            grid-template-columns: repeat(9, minmax(0, 1fr)) !important;
            gap: 4px !important;
            margin-top: 0.25rem !important;
        }
        @media (max-width: 640px) {
            .box-char-sheet .char-stats-grid {
                grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            }
        }
        .box-char-sheet .char-skill-value {
            width: 45px !important;
            text-align: right !important;
            font-weight: bold !important;
        }
        .box-char-sheet .char-skill-name {
            font-weight: 500 !important;
        }
        .box-char-sheet .char-image-container {
            border: 2px dashed #e2e8f0 !important;
            background-color: #f8fafc !important;
            transition: all 0.2s ease !important;
        }
        .box-char-sheet .char-image-container:hover {
            border-color: #6366f1 !important;
            background-color: #f1f5f9 !important;
        }

        /* 技能項目の横並び用フレックスボックス */
        .box-char-sheet .char-skill-row {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            padding: 2px 6px !important;
        }
        .box-char-sheet .char-skill-row input {
            background: transparent !important;
            border: none !important;
            padding: 2px 0 !important;
            border-radius: 0 !important;
        }
        .box-char-sheet .char-skill-row input:focus {
            background: transparent !important;
            border-bottom: 1px solid #6366f1 !important;
        }
        .box-char-sheet .char-skill-name {
            width: auto !important;
            flex: 1 !important;
            font-weight: 500 !important;
        }
        .box-char-sheet .char-skill-value {
            width: 40px !important;
            text-align: right !important;
            font-weight: bold !important;
        }

        /* プロフィール行・列のレイアウト */
        .box-char-sheet .char-profile-row {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        .box-char-sheet .char-profile-row-multi {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }
        .box-char-sheet .char-profile-col {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex: 1 !important;
            min-width: 80px !important;
        }
        .box-char-sheet .char-profile-label {
            font-size: 11px !important;
            font-weight: bold !important;
            color: #64748b !important;
            white-space: nowrap !important;
            min-width: 40px !important;
        }
        .box-char-sheet .char-profile-col .char-profile-label {
            min-width: 50px !important;
        }
        /* 強制100%幅スタイルの上書き */
        .box-char-sheet .char-profile-row input,
        .box-char-sheet .char-profile-col input {
            flex: 1 !important;
            width: 0 !important;
            min-width: 0 !important;
        }
    `;
    // Pタグをまとめてコピーしやすくする（空行を段落区切りとする）
    {
        const outDiv = document.createElement('div');
        outDiv.innerHTML = pagesHtml;
        const pTags = Array.from(outDiv.querySelectorAll('p, div:not([class])'));
        for (let i = 0; i < pTags.length; i++) {
            let p = pTags[i];
            if (!p.parentNode) continue;

            const isPEmpty = p.innerHTML.trim() === '' || p.innerHTML === '<br>' || p.querySelector('img, table, div');
            if (isPEmpty) {
                if (p.innerHTML.trim() === '') p.innerHTML = '<br>';
                continue;
            }

            p.style.marginTop = '0';
            p.style.marginBottom = '0';

            let next = p.nextElementSibling;

            while (next && (next.tagName === 'P' || (next.tagName === 'DIV' && !next.className))) {
                const isNextEmpty = next.innerHTML.trim() === '' || next.innerHTML === '<br>' || next.querySelector('img, table, div');
                if (isNextEmpty) {
                    if (next.innerHTML.trim() === '') next.innerHTML = '<br>';
                    break;
                }
                // margin-leftが異なる場合は結合しない（インデントを維持するため）
                if (p.style.marginLeft !== next.style.marginLeft) {
                    break;
                }
                p.innerHTML += '<br>' + next.innerHTML;
                let toRemove = next;

                next = next.nextElementSibling;
                toRemove.remove();
            }
        }
        pagesHtml = outDiv.innerHTML;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${exportStyles}</style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            mermaid.initialize({ startOnLoad: true, theme: 'default' });
        });
    </script>
</head>
<body>
    <aside>
        <div class="toc-title">📋 目次</div>
        ${tocHtml}
    </aside>
    <main>
        ${pagesHtml}
    </main>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // 各 .page-content 内で、連続する p タグを .scenario-text-block でラップする
            document.querySelectorAll('.page-content').forEach(pageContent => {
                const children = Array.from(pageContent.children);
                let currentGroup = null;

                children.forEach(child => {
                    const isBox = child.matches('.kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet, .box-char-sheet');
                    const isHeading = child.tagName.startsWith('H') || child.classList.contains('h7') || child.classList.contains('h8');
                    const isDivider = child.classList.contains('divider');
                    const isTable = child.tagName === 'TABLE';
                    const isDetails = child.tagName === 'DETAILS';

                    const isParagraph = child.tagName === 'P';
                    const isEmpty = isParagraph && (child.innerHTML.trim() === '<br>' || child.innerText.trim() === '');

                    if (isParagraph && !isEmpty && !isBox && !isHeading && !isDivider && !isTable && !isDetails) {
                        if (!currentGroup) {
                            currentGroup = document.createElement('div');
                            currentGroup.className = 'scenario-text-block';
                            pageContent.insertBefore(currentGroup, child);
                        }
                        currentGroup.appendChild(child);
                    } else {
                        currentGroup = null;
                    }
                });
            });

            const toast = document.createElement('div');
            toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 8px 16px; border-radius: 9999px; font-size: 12px; font-weight: bold; opacity: 0; transition: opacity 0.3s ease; z-index: 10000; pointer-events: none;';
            toast.textContent = 'コピーしました';
            document.body.appendChild(toast);

            const showToast = () => {
                toast.style.opacity = '1';
                setTimeout(() => { toast.style.opacity = '0'; }, 1500);
            };

            // コピー用共通ヘルパー関数（セキュアコンテキスト外/file://対応）
            const copyTextToClipboard = (text) => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    return navigator.clipboard.writeText(text).catch(err => {
                        return fallbackCopyTextToClipboard(text);
                    });
                } else {
                    return Promise.resolve(fallbackCopyTextToClipboard(text));
                }
            };

            const fallbackCopyTextToClipboard = (text) => {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.top = "-9999px";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                let successful = false;
                try {
                    successful = document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
                if (!successful) {
                    throw new Error('execCommand copy failed');
                }
            };

            // コピー可能な要素にツールチップを設定 (キャラクターシートは除外)
            document.querySelectorAll('.page-content .scenario-text-block, .page-content .kp-info, .page-content .quote, .page-content .box-summary, .page-content .box-check, .page-content .box-spot, .page-content .box-search, .page-content .box-listen, .page-content .box-library, .page-content .box-san, .page-content .box-secret, .page-content .box-gimmick, .page-content .box-tendency, .page-content .box-custom, .page-content .box-special, .page-content .box-custom-snippet, .page-content > ul, .page-content > ol, .page-content > blockquote').forEach(el => {
                el.setAttribute('title', 'クリックでテキストをコピー');
            });

            document.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' || e.target.closest('a')) return;
                // インプットやボタン、キャラクターシート関連の要素をクリックした時はコピー処理をスキップ
                if (e.target.closest('input') || e.target.closest('button') || e.target.closest('textarea')) return;

                // TRPGボックスのいずれかをクリックしたか判定 (キャラクターシートは除外)
                const box = e.target.closest('.kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet');
                if (box) {
                    copyTextToClipboard(box.innerText).then(() => showToast('コピーしました')).catch(console.error);
                    return;
                }

                const targetEl = e.target.closest('.page-content > div, .page-content > ul, .page-content > ol, .page-content > blockquote');
                if (targetEl && targetEl.classList.contains('box-char-sheet')) return; // キャラクターシート自体は除外
                if (targetEl) {
                    copyTextToClipboard(targetEl.innerText).then(() => showToast('コピーしました')).catch(console.error);
                    return;
                }
            });

            // 技能追加
            window.addSkillToSheet = (sheetId) => {
                const sheet = document.getElementById(sheetId);
                if (!sheet) return;
                const container = sheet.querySelector('#skill-container-' + sheetId.replace('char-sheet-', ''));
                if (!container) return;
                
                const div = document.createElement('div');
                div.className = "char-skill-row flex items-center gap-1 border border-slate-100 rounded px-1.5 py-0.5 bg-slate-50";
                
                const inputName = document.createElement('input');
                inputName.type = 'text';
                inputName.placeholder = '技能名';
                inputName.className = 'char-skill-name text-[10px] w-full bg-transparent outline-none border-b border-transparent focus:border-slate-300';
                inputName.addEventListener('input', (e) => e.target.setAttribute('value', e.target.value));

                const inputValue = document.createElement('input');
                inputValue.type = 'number';
                inputValue.placeholder = '初期値';
                inputValue.className = 'char-skill-value text-right font-bold text-[10px] w-10 bg-transparent outline-none border-b border-transparent focus:border-slate-300';
                inputValue.addEventListener('input', (e) => e.target.setAttribute('value', e.target.value));

                const span = document.createElement('span');
                span.className = 'text-[9px] text-slate-400';
                span.textContent = '%';

                const btn = document.createElement('button');
                btn.className = 'text-slate-300 hover:text-rose-500 font-bold text-xs no-print shrink-0 px-0.5';
                btn.textContent = '×';
                btn.addEventListener('click', () => div.remove());

                div.appendChild(inputName);
                div.appendChild(inputValue);
                div.appendChild(span);
                div.appendChild(btn);

                container.appendChild(div);
            };

            // キャラクター画像アップロード
            window.triggerCharImageUpload = (container) => {
                const fileInput = container.querySelector('input[type="file"]');
                if (fileInput) fileInput.click();
            };

            window.handleCharImageUpload = (input) => {
                if (input.files && input.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target.result;
                        const container = input.closest('.char-image-container');
                        const preview = container.querySelector('.char-image-preview');
                        const placeholder = container.querySelector('.char-image-placeholder');
                        
                        if (preview && placeholder) {
                            preview.src = dataUrl;
                            preview.setAttribute('src', dataUrl);
                            preview.classList.remove('hidden');
                            placeholder.classList.add('hidden');
                        }
                    };
                    reader.readAsDataURL(input.files[0]);
                }
            };

            // ココフォリアコピー
            window.copyToCcfolia = (sheetId) => {
                const sheet = document.getElementById(sheetId);
                if (!sheet) return;
                
                const inputs = sheet.querySelectorAll('.char-sheet-body .char-input');
                const name = inputs[0].value || '無題の探索者';
                const job = inputs[1].value || '';
                const age = inputs[2].value || '';
                const gender = inputs[3].value || '';
                const height = inputs[4].value || '';
                const weight = inputs[5].value || '';
                const birthday = inputs[6].value || '';
                const color = inputs[7].value || '';
                
                const memo = '職業: ' + job + '\\n' +
                             '年齢: ' + age + ' / 性別: ' + gender + '\\n' +
                             '身長: ' + height + ' / 体重: ' + weight + '\\n' +
                             '誕生日: ' + birthday + '\\n' +
                             '髪/目の色: ' + color;
                
                const stats = sheet.querySelectorAll('.char-stat-input');
                const str = (stats[0].value || stats[0].innerText || '0').trim();
                const con = (stats[1].value || stats[1].innerText || '0').trim();
                const pow = (stats[2].value || stats[2].innerText || '0').trim();
                const dex = (stats[3].value || stats[3].innerText || '0').trim();
                const app = (stats[4].value || stats[4].innerText || '0').trim();
                const siz = (stats[5].value || stats[5].innerText || '0').trim();
                const int = (stats[6].value || stats[6].innerText || '0').trim();
                const edu = (stats[7].value || stats[7].innerText || '0').trim();
                const san = (stats[8].value || stats[8].innerText || '0').trim();
                
                const hp = Math.ceil((parseInt(con) + parseInt(siz)) / 2) || 0;
                const mp = parseInt(pow) || 0;
                
                const skillNames = sheet.querySelectorAll('.char-skill-name');
                const skillValues = sheet.querySelectorAll('.char-skill-value');
                
                const commands = [];
                
                commands.push('CCB<=' + (parseInt(san) || 0) + ' 【SAN値チェック】');
                commands.push('CCB<=' + ((parseInt(str) || 0) * 5) + ' 【STR×5】');
                commands.push('CCB<=' + ((parseInt(con) || 0) * 5) + ' 【CON×5】');
                commands.push('CCB<=' + ((parseInt(pow) || 0) * 5) + ' 【POW×5】');
                commands.push('CCB<=' + ((parseInt(dex) || 0) * 5) + ' 【DEX×5】');
                commands.push('CCB<=' + ((parseInt(app) || 0) * 5) + ' 【APP×5】');
                commands.push('CCB<=' + ((parseInt(int) || 0) * 5) + ' 【アイデア（INT×5）】');
                commands.push('CCB<=' + ((parseInt(edu) || 0) * 5) + ' 【知識（EDU×5）】');
                
                skillNames.forEach((sNameEl, i) => {
                    const sName = sNameEl.value.trim();
                    const sVal = skillValues[i].value.trim();
                    if (sName) {
                        commands.push('CCB<=' + (parseInt(sVal) || 0) + ' 【' + sName + '】');
                    }
                });
                
                const ccfoliaData = {
                    kind: "character",
                    data: {
                        name: name,
                        memo: memo,
                        initiatives: {
                            "DEX": parseInt(dex) || 0
                        },
                        params: [
                            { label: "STR", value: str },
                            { label: "CON", value: con },
                            { label: "POW", value: pow },
                            { label: "DEX", value: dex },
                            { label: "APP", value: app },
                            { label: "SIZ", value: siz },
                            { label: "INT", value: int },
                            { label: "EDU", value: edu },
                            { label: "SAN", value: san },
                            { label: "HP", value: hp.toString() },
                            { label: "MP", value: mp.toString() }
                        ],
                        status: [
                            { label: "HP", value: hp, max: hp },
                            { label: "MP", value: mp, max: mp },
                            { label: "SAN", value: parseInt(san) || 0, max: 99 }
                        ],
                        commands: commands.join('\\n')
                    }
                };
                
                copyTextToClipboard(JSON.stringify(ccfoliaData, null, 2)).then(() => {
                    if (typeof showToast === 'function') {
                        showToast("ココフォリア用データをコピーしました！");
                    } else {
                        alert("ココフォリア用データ（貼り付け用JSON）をコピーしました！");
                    }
                }).catch(err => {
                    console.error("CCFOLIAコピー失敗", err);
                    alert("コピーに失敗しました。");
                });
            };
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("サイドバー付きHTMLを書き出しました");
}

async function exportWord() {
    const title = titleInput.value || '無題のシナリオ';
    const fontFamily = document.getElementById('font-family-select').value;
    const lineHeight = document.getElementById('line-height-select').value;
    let fontCSS = fontFamily === 'sans-serif' ? '"ＭＳ ゴシック", sans-serif' :
        fontFamily === 'serif' ? '"ＭＳ 明朝", serif' :
            fontFamily === 'monospace' ? '"Courier New", monospace' :
                fontFamily === 'yu-gothic' ? '"游ゴシック", "Yu Gothic", sans-serif' :
                    fontFamily === 'yu-mincho' ? '"游明朝", "Yu Mincho", serif' :
                        fontFamily === 'meiryo' ? '"メイリオ", "Meiryo", sans-serif' :
                            fontFamily === 'rounded-gothic' ? '"ＭＳ ゴシック", sans-serif' :
                                fontFamily === 'ms-pgothic' ? '"ＭＳ Ｐゴシック", sans-serif' :
                                    fontFamily === 'ms-pmincho' ? '"ＭＳ Ｐ明朝", serif' :
                                        '"ＭＳ ゴシック", sans-serif';

    // ページ分割ロジック
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;

    // エクスポート用：ドラッグハンドルを削除
    tempDiv.querySelectorAll('.drag-handle, .drag-handle-container').forEach(el => el.remove());

    // Word出力用の調整: フローチャート(SVG)をPNG画像に変換
    const svgs = Array.from(tempDiv.querySelectorAll('svg'));
    if (svgs.length > 0) {
        const btn = document.querySelector('button[onclick="exportWord()"]');
        const origText = btn ? btn.textContent : '';
        if (btn) btn.textContent = '画像変換中...';

        await Promise.all(svgs.map(svg => {
            return new Promise((resolve) => {
                try {
                    const box = svg.closest('.box-flowchart');
                    if (box) {
                        const actions = box.querySelector('.flowchart-actions');
                        if (actions) actions.remove();
                    }

                    if (!svg.getAttribute('xmlns')) {
                        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    }

                    svg.style.backgroundColor = '#ffffff';

                    let width = svg.getAttribute('width') || svg.getBoundingClientRect().width || 600;
                    let height = svg.getAttribute('height') || svg.getBoundingClientRect().height || 400;
                    width = parseInt(width) || 600;
                    height = parseInt(height) || 400;

                    const xml = new XMLSerializer().serializeToString(svg);
                    const svg64 = btoa(unescape(encodeURIComponent(xml)));
                    const image64 = 'data:image/svg+xml;base64,' + svg64;

                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const scale = 2;
                        canvas.width = (img.width || width) * scale;
                        canvas.height = (img.height || height) * scale;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        const newImg = document.createElement('img');
                        newImg.src = canvas.toDataURL('image/png');
                        newImg.style.width = (img.width || width) + 'px';
                        newImg.style.maxWidth = '100%';
                        newImg.style.height = 'auto';

                        const parentPre = svg.closest('pre.mermaid');
                        if (parentPre) {
                            parentPre.innerHTML = '';
                            parentPre.appendChild(newImg);
                        } else {
                            svg.parentNode.replaceChild(newImg, svg);
                        }
                        resolve();
                    };
                    img.onerror = () => resolve();
                    img.src = image64;
                } catch (e) {
                    console.error('SVG conversion error:', e);
                    resolve();
                }
            });
        }));
        if (btn) btn.textContent = origText;
    }

    // Word出力用の調整: 古い能力値グリッドを横一列のテキストに変換 (旧バージョンのキャラシ救済)
    tempDiv.querySelectorAll('.char-stats-grid').forEach(grid => {
        if (grid.tagName === 'DIV' || grid.tagName === 'TABLE') {
            const newContainer = document.createElement('div');
            newContainer.className = 'char-stats-container';
            newContainer.style.lineHeight = '2';

            const labels = ['STR', 'CON', 'POW', 'DEX', 'APP', 'SIZ', 'INT', 'EDU', 'SAN'];
            const inputs = grid.querySelectorAll('.char-stat-input');

            for (let i = 0; i < Math.min(labels.length, inputs.length); i++) {
                const input = inputs[i];
                let val = '0';
                if (input.tagName === 'INPUT') {
                    val = input.value || input.getAttribute('value') || '0';
                } else {
                    val = input.innerText || input.textContent || '0';
                }
                const span = document.createElement('span');
                span.style.whiteSpace = 'nowrap';
                span.style.marginRight = '12px';
                span.innerHTML = '<strong style="color:gray; font-size:10px;">' + labels[i] + ':</strong> <span style="font-weight:bold;">' + val + '</span>';
                newContainer.appendChild(span);
            }
            grid.parentNode.replaceChild(newContainer, grid);
        }
    });

    // Word出力用の調整: 入力欄をテキストに変換 (キャラクターシート等)
    tempDiv.querySelectorAll('input, textarea').forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || input.getAttribute('value') || '';
        if (input.classList.contains('char-stat-input') || input.classList.contains('char-skill-value')) {
            span.style.fontWeight = 'bold';
        }
        if (input.classList.contains('char-skill-name')) {
            span.style.marginRight = '5px';
        }
        input.parentNode.replaceChild(span, input);
    });

    // Word出力用の調整: 画像サイズ
    tempDiv.querySelectorAll('img').forEach(img => {
        img.setAttribute('width', '450');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });

    // Word出力用の調整: 内部リンク (Wordはname属性のアンカーが必要)
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, .h7, .h8').forEach(h => {
        if (h.id) {
            const anchor = document.createElement('a');
            anchor.setAttribute('name', h.id);
            h.insertBefore(anchor, h.firstChild);
        }
    });

    const nodes = Array.from(tempDiv.childNodes);

    let pagesHtml = '', currentPageContent = '', currentLineCount = 0;
    const limitInput = document.getElementById('page-line-limit');
    const MAX_LINES = limitInput ? (parseInt(limitInput.value) || 35) : 35;
    const layout = document.getElementById('export-layout-select').value;

    const flushPage = () => {
        if (pagesHtml !== '') {
            // Word用の改ページコードを挿入
            pagesHtml += `<br style="page-break-before:always; clear:both; mso-break-type:section-break">`;
        }
        pagesHtml += `<div class="page-section">${currentPageContent}</div>`;
        currentPageContent = '';
        currentLineCount = 0;
    };

    nodes.forEach(node => {
        // 手動改ページマークの検出
        let isManualPageBreak = false;
        if (node.nodeType === 1 && (node.classList.contains('page-break') || node.querySelector('.page-break'))) {
            isManualPageBreak = true;
            flushPage();
            if (!node.textContent.trim() && !node.querySelector('img, table')) {
                return;
            }
        }

        let weight = 1; // 基本1行分
        if (node.nodeType === 1) { // Element node
            const tag = node.tagName;
            const text = node.innerText || "";

            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;

            const charLimit = parseInt(document.getElementById('page-char-limit')?.value) || 40;
            const textLines = Math.ceil(text.length / (layout === '2' ? Math.ceil(charLimit / 2) : charLimit)) || 1;

            const pbH1 = document.getElementById('export-page-break-h1');
            if (tag === 'H1' && pbH1 && pbH1.checked && typeof currentLineCount !== 'undefined' && currentLineCount > 0) {
                if (typeof flushPage === 'function') {
                    flushPage();
                    if (typeof isManualPageBreak !== 'undefined') isManualPageBreak = true;
                }
            }

            if (tag === 'H1') weight = 3;
            else if (tag === 'H2') weight = 2;
            else if (tag === 'H3') weight = 2;
            else if (tag === 'IMG') weight = 10;
            else if (node.classList.contains('divider')) weight = 1;
            else if (node.tagName === 'TABLE') weight = 6;
            else if (node.classList.contains('kp-info') || node.className.includes('box-')) weight = 4;
            else weight = textLines * sizeRatio;
        }

        // Word出力時は自然な改ページに任せるため、行数による自動改ページを無効化
        // if (!isManualPageBreak && currentLineCount + weight > MAX_LINES && currentPageContent !== '') {
        //     flushPage();
        // }

        currentPageContent += node.nodeType === 1 ? node.outerHTML : node.textContent;
        currentLineCount += weight;
    });

    if (currentPageContent !== '') flushPage();

    const marginTop = document.getElementById('export-margin-top')?.value || '20';
    const marginBottom = document.getElementById('export-margin-bottom')?.value || '20';
    const marginLeft = document.getElementById('export-margin-left')?.value || '20';
    const marginRight = document.getElementById('export-margin-right')?.value || '20';
    const paperSize = document.getElementById('export-paper-size')?.value || 'A4';
    const isIndent = document.getElementById('export-indent-paragraph')?.checked || false;
    const snapToGrid = document.getElementById('export-snap-to-grid')?.checked || false;
    const paragraphIndentLeft = document.getElementById('export-paragraph-indent-left')?.value || '8.5';

    const paperSizeStr = paperSize === 'B5' ? '182mm 257mm' : paperSize === 'A5' ? '148mm 210mm' : '210mm 297mm';
    const gridStyle = snapToGrid ? 'mso-layout-grid-align: auto;' : 'mso-layout-grid-align: none;';
    let pStyles = `margin-top: 0; margin-bottom: 0; margin-left: ${paragraphIndentLeft}mm; ${gridStyle}`;
    if (isIndent) pStyles += ' text-indent: 1em; mso-char-indent-count: 1.0;';
    const paragraphStyle = `p { ${pStyles} }`;

    const wordContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: ${paperSizeStr};
                    margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
                    mso-page-orientation: portrait;
                }
                body, p, div, td { font-family: ${fontCSS}; line-height: ${lineHeight}; }
                ${paragraphStyle}
                h1 { color: #4f46e5; font-size: 24pt; border-bottom: 2px solid #4f46e5; }
                h2 { color: #4f46e5; font-size: 18pt; border-left: 10px solid #4f46e5; padding-left: 10px; background: #f0f0ff; }
                .kp-info, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet, .quote, .box-char-sheet, .box-flowchart {
                    border: 1px solid #ccc; background: #f9f9f9; padding: 10px; margin: 10px 0;
                }
                .box-special { border-top-width: 4px; border-left: 0; border-right: 0; border-bottom: 0; border-style: solid; }
                .box-secret { border-style: dashed; }
                .quote { border-left: 4px solid #94a3b8; border-radius: 0; font-style: italic; background: #f8fafc; }
                .box-char-sheet { border-color: #ccd3e0; background: #ffffff; }
                .page-section {
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body><h1>${title}</h1>${pagesHtml}</body>
        </html>
    `;
    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Wordファイルを書き出しました");
}

function exportGoogleDocs() {
    const title = titleInput.value || '無題のシナリオ';
    const fontFamily = document.getElementById('font-family-select').value;
    const lineHeight = document.getElementById('line-height-select').value;
    let fontCSS = fontFamily === 'sans-serif' ? '"Arial", "MS PGothic", sans-serif' :
        fontFamily === 'serif' ? '"Times New Roman", "MS PMincho", serif' :
            '"Arial", "MS PGothic", sans-serif';

    // ページ分割ロジック
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;

    // Word/GDocs出力用の調整: drag-handleを削除
    tempDiv.querySelectorAll('.drag-handle, .drag-handle-container').forEach(el => el.remove());

    // Word/GDocs出力用の調整: 入力欄をテキストに変換 (キャラクターシート等)
    tempDiv.querySelectorAll('input, textarea').forEach(input => {
        const span = document.createElement('span');
        span.textContent = input.value || input.getAttribute('value') || '';
        if (input.classList.contains('char-stat-input') || input.classList.contains('char-skill-value')) {
            span.style.fontWeight = 'bold';
        }
        if (input.classList.contains('char-skill-name')) {
            span.style.marginRight = '5px';
        }
        input.parentNode.replaceChild(span, input);
    });

    // Word/GDocs出力用の調整: 画像サイズ
    tempDiv.querySelectorAll('img').forEach(img => {
        img.setAttribute('width', '450');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
    });

    // Word/GDocs出力用の調整: 内部リンク (Wordはname属性のアンカーが必要)
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, .h7, .h8').forEach(h => {
        if (h.id) {
            const anchor = document.createElement('a');
            anchor.setAttribute('name', h.id);
            h.insertBefore(anchor, h.firstChild);
        }
    });

    const nodes = Array.from(tempDiv.childNodes);

    let pagesHtml = '', currentPageContent = '', currentLineCount = 0;
    const limitInput = document.getElementById('page-line-limit');
    const MAX_LINES = limitInput ? (parseInt(limitInput.value) || 35) : 35;
    const layout = document.getElementById('export-layout-select').value;

    const flushPage = () => {
        if (pagesHtml !== '') {
            pagesHtml += `<br style="page-break-before:always; clear:both;">`;
        }
        pagesHtml += `<div class="page-section">${currentPageContent}</div>`;
        currentPageContent = '';
        currentLineCount = 0;
    };

    nodes.forEach(node => {
        let isManualPageBreak = false;
        if (node.nodeType === 1 && (node.classList.contains('page-break') || node.querySelector('.page-break'))) {
            isManualPageBreak = true;
            flushPage();
            if (!node.textContent.trim() && !node.querySelector('img, table')) {
                return;
            }
        }

        let weight = 1;
        if (node.nodeType === 1) {
            const tag = node.tagName;
            const text = node.innerText || "";
            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;
            const charLimit = parseInt(document.getElementById('page-char-limit')?.value) || 40;
            const textLines = Math.ceil(text.length / (layout === '2' ? Math.ceil(charLimit / 2) : charLimit)) || 1;

            const pbH1 = document.getElementById('export-page-break-h1');
            if (tag === 'H1' && pbH1 && pbH1.checked && typeof currentLineCount !== 'undefined' && currentLineCount > 0) {
                if (typeof flushPage === 'function') {
                    flushPage();
                    if (typeof isManualPageBreak !== 'undefined') isManualPageBreak = true;
                }
            }

            if (tag === 'H1') weight = 3;
            else if (tag === 'H2') weight = 2;
            else if (tag === 'H3') weight = 2;
            else if (tag === 'IMG') weight = 10;
            else if (node.classList.contains('divider')) weight = 1;
            else if (node.tagName === 'TABLE') weight = 6;
            else if (node.classList.contains('kp-info') || node.className.includes('box-')) weight = 4;
            else weight = textLines * sizeRatio;
        }

        if (!isManualPageBreak && currentLineCount + weight > MAX_LINES && currentPageContent !== '') {
            flushPage();
        }

        currentPageContent += node.nodeType === 1 ? node.outerHTML : node.textContent;
        currentLineCount += weight;
    });

    if (currentPageContent !== '') flushPage();

    const marginTop = document.getElementById('export-margin-top')?.value || '20';
    const marginBottom = document.getElementById('export-margin-bottom')?.value || '20';
    const marginLeft = document.getElementById('export-margin-left')?.value || '20';
    const marginRight = document.getElementById('export-margin-right')?.value || '20';
    const paperSize = document.getElementById('export-paper-size')?.value || 'A4';
    const isIndent = document.getElementById('export-indent-paragraph')?.checked || false;
    const snapToGrid = document.getElementById('export-snap-to-grid')?.checked || false;
    const paragraphIndentLeft = document.getElementById('export-paragraph-indent-left')?.value || '8.5';

    const paperSizeStr = paperSize === 'B5' ? '182mm 257mm' : paperSize === 'A5' ? '148mm 210mm' : '210mm 297mm';
    let pStyles = `margin-top: 0; margin-bottom: 0; margin-left: ${paragraphIndentLeft}mm;`;
    if (isIndent) pStyles += ' text-indent: 1em;';
    const paragraphStyle = `p { ${pStyles} }`;

    const gdocsContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {
                    size: ${paperSizeStr};
                    margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
                }
                body, p, div, td { font-family: ${fontCSS}; line-height: ${lineHeight}; }
                ${paragraphStyle}
                h1 { color: #4f46e5; font-size: 24pt; border-bottom: 2px solid #4f46e5; }
                h2 { color: #4f46e5; font-size: 18pt; border-left: 10px solid #4f46e5; padding-left: 10px; background: #f0f0ff; }
                .kp-info, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet, .quote, .box-char-sheet, .box-flowchart {
                    border: 1px solid #ccc; background: #f9f9f9; padding: 10px; margin: 10px 0;
                }
                .box-special { border-top-width: 4px; border-left: 0; border-right: 0; border-bottom: 0; border-style: solid; }
                .box-secret { border-style: dashed; }
                .quote { border-left: 4px solid #94a3b8; border-radius: 0; font-style: italic; background: #f8fafc; }
                .box-char-sheet { border-color: #ccd3e0; background: #ffffff; }
                .page-section { margin-bottom: 20px; }
            </style>
        </head>
        <body><h1>${title}</h1>${pagesHtml}</body>
        </html>
    `;
    const blob = new Blob(['\ufeff', gdocsContent], { type: 'application/msword;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}_GDocs.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("GDocs用ファイルを書き出しました。Googleドライブにアップロードしてください。");
}

/* --- 折りたたみ機能 --- */
function insertFold() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "折りたたみ内の内容をここに...";
    const html = `<details><summary>クリックで開閉</summary><div>${content}</div></details><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

/* --- インデントと見出し --- */
function manualIndent(isIndent) {
    editor.focus();
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let blocks = [];
    if (range.collapsed) {
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentNode;
        let target = node.closest('p, h1, h2, h3, h4, h5, h6, .h7, .h8, div, table, blockquote');

        // もし枠（box-wrapper）の中であれば、枠全体をインデントの対象にする
        const wrapper = node.closest('.box-wrapper');
        if (wrapper) {
            target = wrapper;
        }
        if (!target || target === editor) {
            document.execCommand('formatBlock', false, 'p');
            const newRange = window.getSelection().getRangeAt(0);
            let newContainer = newRange.commonAncestorContainer;
            if (newContainer.nodeType === 3) newContainer = newContainer.parentNode;
            target = newContainer.closest('p, div');
        }
        if (target && target !== editor) blocks.push(target);
    } else {
        Array.from(editor.children).forEach(child => {
            if (selection.containsNode(child, true)) { blocks.push(child); }
        });
        // 選択状態によっては containsNode が拾えない場合があるためフォールバック
        if (blocks.length === 0) {
            let node = range.commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode;
            let target = node.closest('.box-wrapper') || node.closest('p, h1, h2, h3, h4, h5, h6, .h7, .h8, div, table, blockquote');
            if (target && target !== editor) blocks.push(target);
        }
    }
    blocks.forEach(block => {
        if (block === editor) return;
        let currentMargin = parseFloat(block.style.marginLeft) || 0;
        block.style.marginLeft = isIndent ? (currentMargin + 1) + 'em' : Math.max(0, currentMargin - 1) + 'em';
    });
    autoUpdateUI();
}

function handleHeadingChange(val) {
    if (val === 'P') {
        // 本文（リセット）
        document.execCommand('formatBlock', false, 'p');
        // フォーマット後に現在の要素からスタイルやクラスを除去する
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            let node = sel.getRangeAt(0).commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode;
            let target = node.closest('p, div, h1, h2, h3, h4, h5, h6, .h7, .h8');
            if (target && target !== editor) {
                target.className = '';
                target.removeAttribute('style');
            }
        }
    } else if (val.startsWith('div_')) {
        const cls = val.replace('div_', '');
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const div = document.createElement('div');
            div.className = cls;
            div.innerHTML = range.toString() || (cls === 'h7' ? '見出し7' : '見出し8');
            range.deleteContents();
            range.insertNode(div);
        }
    } else {
        document.execCommand('formatBlock', false, val);
    }

    setTimeout(() => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            let node = sel.getRangeAt(0).commonAncestorContainer;
            if (node.nodeType === 3) node = node.parentNode;
            let target = node.closest('h1, h2, h3, h4, h5, h6, .h7, .h8, p');
            if (target) {
                let level = 0;
                if (target.tagName.startsWith('H')) level = parseInt(target.tagName[1]) - 1;
                else if (target.classList.contains('h7')) level = 6;
                else if (target.classList.contains('h8')) level = 7;
                target.style.marginLeft = level + 'em';
            }
        }
        updateTOC(); autoUpdateUI();
    }, 10);
    editor.focus();
}

/* --- 記号挿入機能 --- */
function insertQuickSymbol(left, right) {
    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // 記号を構築
    const fullInsert = left + selectedText + right;

    // 挿入実行
    document.execCommand('insertText', false, fullInsert);

    // 括弧で何も選択していなかった場合、カーソルを中に入れる
    if (!selectedText && right !== '') {
        const currentSelection = window.getSelection();
        const currentRange = currentSelection.getRangeAt(0);

        // カーソルを閉じ括弧の前に戻す
        currentRange.setStart(currentRange.startContainer, currentRange.startOffset - right.length);
        currentRange.collapse(true);
        currentSelection.removeAllRanges();
        currentSelection.addRange(currentRange);
    }
    autoUpdateUI();
}


/* --- 編集機能 --- */
function execCommand(cmd) { 
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        if (savedSelectionRange) restoreRange();
    }
    if (cmd === 'indent') return manualIndent(true);
    if (cmd === 'outdent') return manualIndent(false);
    document.execCommand(cmd, false, null);
    updateTOC(); autoUpdateUI();
}

function execCommandWithParam(cmd, param) { 
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        if (savedSelectionRange) restoreRange();
    }
    document.execCommand(cmd, false, param); 
    autoUpdateUI(); 
}

// 枠内外を問わず選択した文字カラーを変更する関数
function changeTextColor(color) {
    if (!color) return;
    const sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) ? sel.getRangeAt(0) : savedSelectionRange;

    if (!range || range.collapsed) return;

    // 選択範囲をアクティブ化
    sel.removeAllRanges();
    sel.addRange(range);

    let editableParent = range.commonAncestorContainer;
    if (editableParent.nodeType === 3) editableParent = editableParent.parentElement;
    const closestEditable = editableParent.closest('[contenteditable="true"]');
    if (closestEditable) {
        closestEditable.focus();
    }

    document.execCommand('styleWithCSS', false, true);
    let success = false;
    try {
        success = document.execCommand('foreColor', false, color);
    } catch (_) {}

    // execCommandで反映されなかった場合の確実なフォールバック
    if (!success) {
        try {
            const span = document.createElement('span');
            span.style.color = color;
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);

            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRange = newRange.cloneRange();
        } catch (err) {
            console.error('changeTextColor error:', err);
        }
    } else {
        if (sel.rangeCount > 0) {
            savedSelectionRange = sel.getRangeAt(0).cloneRange();
        }
    }
    autoUpdateUI();
}

// カラーピッカーをクリックした際に現在の色を即時適用する関数
// （同じ色を連続して適用する際、Chromiumがvalue変化なしとしてinputイベントを発火させない仕様への対策）
function handleColorPickerClick(input) {
    if (!input) return;
    const sel = window.getSelection();
    const range = (sel && sel.rangeCount > 0 && !sel.isCollapsed) ? sel.getRangeAt(0) : savedSelectionRange;
    if (range && !range.collapsed) {
        changeTextColor(input.value);
    }
}
window.handleColorPickerClick = handleColorPickerClick;


/* --- 配置処理（画像対応版） --- */
function handleAlignment(cmd) {
    const sel = window.getSelection();
    let targetImg = null;

    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // 画像が選択されているかチェック
        if (range.startContainer.nodeType === 1 && range.startContainer.tagName === 'IMG') {
            targetImg = range.startContainer;
        } else if (range.startContainer.childNodes[range.startOffset] && range.startContainer.childNodes[range.startOffset].tagName === 'IMG') {
            targetImg = range.startContainer.childNodes[range.startOffset];
        } else {
            let node = range.startContainer;
            if (node.nodeType === 3) node = node.parentNode;
            targetImg = node.closest('img');
        }
    }

    if (targetImg) {
        // 回り込みクラスをリセット
        targetImg.classList.remove('img-left', 'img-right', 'img-center');
        if (cmd === 'justifyLeft') targetImg.classList.add('img-left');
        else if (cmd === 'justifyCenter') targetImg.classList.add('img-center');
        else if (cmd === 'justifyRight') targetImg.classList.add('img-right');

        autoUpdateUI();
    } else {
        document.execCommand(cmd, false, null);
        autoUpdateUI();
    }
}



/* --- 検索置換機能 --- */
function findNext() {
    const query = document.getElementById('search-input').value;
    if (query) window.find(query, false, false, true);
}
function replaceAll() {
    const query = document.getElementById('search-input').value;
    const replace = document.getElementById('replace-input').value;
    if (query) { editor.innerHTML = editor.innerHTML.split(query).join(replace); autoUpdateUI(); }
}

function insertLink() {
    updateTOC();
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelectionRange = sel.getRangeAt(0).cloneRange();
    const list = document.getElementById('heading-link-list');
    list.innerHTML = '';
    const headers = Array.from(editor.querySelectorAll('h1, h2, h3, h4, h5, h6, .h7, .h8'));
    headers.forEach((h, i) => {
        if (!h.id) h.id = `h-${i}`;
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-2 hover:bg-slate-100 rounded text-xs truncate border-l-2 border-indigo-400 mb-1 text-slate-700";
        btn.textContent = h.textContent.trim() || `無題の見出し ${i + 1}`;
        btn.onclick = (e) => {
            e.preventDefault();
            if (!savedSelectionRange) return;
            editor.focus();
            const currentSel = window.getSelection();
            currentSel.removeAllRanges();
            currentSel.addRange(savedSelectionRange);
            document.execCommand('createLink', false, `#${h.id}`);
            closeModal('link-modal');
            autoUpdateUI();
        };
        list.appendChild(btn);
    });
    openModal('link-modal');
}

function applyExternalLink() {
    const url = document.getElementById('external-url-input').value;
    if (url && savedSelectionRange) {
        editor.focus();
        const currentSel = window.getSelection();
        currentSel.removeAllRanges();
        currentSel.addRange(savedSelectionRange);
        document.execCommand('createLink', false, url);
        autoUpdateUI();
    }
    closeModal('link-modal');
}

/* --- 挿入 --- */
function saveRange() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        savedSelectionRange = sel.getRangeAt(0).cloneRange();
    } else {
        // フォーカスがない場合でも最後尾を保持するように試みる
        editor.focus();
        const newSel = window.getSelection();
        if (newSel.rangeCount > 0) savedSelectionRange = newSel.getRangeAt(0).cloneRange();
    }
}

function restoreRange() {
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (savedSelectionRange) sel.addRange(savedSelectionRange);
}

function insertTRPGBox(type) {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    let className = "", label = "", defaultContent = "内容を入力...";
    const checkTpl = "成功：<br>失敗：";
    const col = document.getElementById('bg-color-picker').value;
    let borderColor = col;
    switch (type) {
        case 'summary': className = "box-summary"; label = "概要"; borderColor = "#7dd3fc"; break;
        case 'check': className = "box-check"; label = "判定：＜＞"; defaultContent = checkTpl; borderColor = "#86efac"; break;
        case 'spot': className = "box-spot"; label = "判定：＜目星＞"; defaultContent = checkTpl; borderColor = "#34d399"; break;
        case 'listen': className = "box-listen"; label = "判定：＜聞き耳＞"; defaultContent = checkTpl; borderColor = "#fbbf24"; break;
        case 'library': className = "box-library"; label = "判定：＜図書館＞"; defaultContent = checkTpl; borderColor = "#22d3ee"; break;
        case 'san': className = "box-san"; label = "正気度チェック"; defaultContent = "正気度喪失：()"; borderColor = "#fb7185"; break;
        case 'search': className = "box-search"; label = "探索箇所：　"; defaultContent = "詳細..."; borderColor = "#10b981"; break;
        case 'secret': className = "box-secret"; label = "HO ：秘匿描写"; defaultContent = "内容を入力..."; borderColor = "#d8b4fe"; break;
        case 'gimmick': className = "box-gimmick"; label = "ギミック：　"; defaultContent = "内容を入力..."; borderColor = "#fb923c"; break;
        case 'tendency': className = "box-tendency"; label = "傾向"; defaultContent = "舞台：<br>人数：<br>時間：<br>ロスト："; borderColor = "#d946ef"; break;
    }
    const content = selectedHtml || defaultContent;
    const textColor = darkenColor(borderColor, 0.4);
    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="${className}" contenteditable="true" style="background-color:${borderColor}11; border-color:${borderColor}; color:${textColor}; user-select:text; margin: 0;"><strong>【${label}】</strong><div class="mt-1">${content}</div></div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertBorderBox() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容を入力...";
    const col = document.getElementById('bg-color-picker').value;
    const textColor = darkenColor(col, 0.4);
    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="box-custom" contenteditable="true" style="border-color:${col}; background-color:${col}22; color:${textColor}; border-width: 2px; margin: 0; user-select:text;">${content}</div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertKPInfo() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容...";
    const borderColor = "#fde047";
    const textColor = darkenColor(borderColor, 0.6);
    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="kp-info" contenteditable="true" style="background-color:${borderColor}22; border-color:${borderColor}; color:${textColor}; border-width: 2px; margin: 0; user-select:text;"><strong>【KP情報】</strong><div class="mt-1">${content}</div></div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertQuote() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容...";
    const borderColor = "#94a3b8";
    const textColor = darkenColor(borderColor, 0.4);
    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="quote" contenteditable="true" style="background-color:${borderColor}22; border-color:${borderColor}; color:${textColor}; border-width: 2px; margin: 0; user-select:text;">${content}</div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertSpecialBox(label) {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    let defaultCol = "#64748b";
    let defaultContent = "詳細...";
    switch (label) {
        case '許諾': defaultCol = "#94a3b8"; defaultContent = `本作は、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。<br><br>Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc. ;all rights reserved. Arranged by Arclight Inc.<br>Call of Cthulhu is a registered trademark of Chaosium Inc.<br>PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」`; break;
        case '諸注意': defaultCol = "#f59e0b"; defaultContent = `・本シナリオには以下の要素が含まれます：<br>・ロストの可能性：あり<br>・PvPの可能性：あり`; break;
        case 'HO': defaultCol = "#6366f1"; defaultContent = `公開HO：<br>貴方は……である。`; break;
        case 'エネミー': defaultCol = "#ef4444"; defaultContent = `名前：<br>STR: / CON: / SIZ: / DEX: / POW: / INT: / EDU: / APP:<br>耐久力: / マジックポイント:<br>ダメージボーナス: / ビルド: / 移動: <br>攻撃：<br>装甲：<br>技能：`; break;
        case 'クレジット': defaultCol = "#64748b"; defaultContent = `著者：<br>協力：<br>画像：`; break;
    }
    const content = selectedHtml || defaultContent;
    const textColor = darkenColor(defaultCol, 0.5);
    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-rose-400 hover:text-rose-600 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="box-special" contenteditable="true" style="border-top-color:${defaultCol}; background-color:${defaultCol}22; color:${textColor}; margin: 0; user-select:text;"><strong>■ ${label}</strong><div class="mt-2 text-sm">${content}</div></div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

/* --- 枠消しゴム機能（文字がある場合は文字を残して枠解除、空・デフォルトのみなら枠ごと削除） --- */
function eraseOrUnwrapBox(targetBox = null) {
    let box = targetBox;
    if (!box) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            let node = sel.anchorNode;
            while (node && node !== editor) {
                if (node.classList && (
                    node.classList.contains('box-wrapper') ||
                    node.classList.contains('box-char-sheet') ||
                    node.classList.contains('table-container') ||
                    node.tagName === 'BLOCKQUOTE'
                )) {
                    box = node;
                    break;
                }
                node = node.parentNode;
            }
        }
    }

    if (!box) {
        showToast("消去対象の枠を選択するか、枠内にカーソルを置いてください");
        return;
    }

    // デフォルト文言（初期状態で挿入されるテンプレート文言）の判定パターン
    const defaultPatterns = [
        /^内容を入力[\.…]*$/,
        /^内容[\.…]*$/,
        /^詳細[\.…]*$/,
        /^成功[：:]\s*(?:<br>|\n)?\s*失敗[：:]*$/,
        /^正気度喪失[：:]\s*\(\s*\)$/,
        /^舞台[：:]\s*(?:<br>|\n)?\s*人数[：:]\s*(?:<br>|\n)?\s*時間[：:]\s*(?:<br>|\n)?\s*ロスト[：:]*$/,
        /^公開HO[：:]\s*(?:<br>|\n)?\s*貴方は……である。*$/,
        /^著者[：:]\s*(?:<br>|\n)?\s*協力[：:]\s*(?:<br>|\n)?\s*画像[：:]*$/,
        /^名前[：:]\s*(?:<br>|\n)?\s*STR:[\s\S]*装甲[：:]\s*(?:<br>|\n)?\s*技能[：:]*$/
    ];

    // コンテンツ要素を取得
    const innerContent = box.querySelector('.mt-1, .mt-2, .text-sm, .box-custom, [contenteditable="true"]') || box;

    // ヘッダーやドラッグ要素を除いた実質テキストを取得して判定
    const clone = innerContent.cloneNode(true);
    clone.querySelectorAll('.drag-handle-container, .drag-handle, .no-print, script, style').forEach(el => el.remove());
    clone.querySelectorAll('strong').forEach(s => {
        if (/^[【■]/.test(s.innerText.trim())) s.remove();
    });
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const contentText = clone.textContent.trim();

    // スクロールコンテナのスクロール位置を保持
    const scrollContainer = editor.closest('main') || document.documentElement || document.body;
    const savedScrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

    // 空またはデフォルト文言のみか判定
    const isDefaultOrEmpty = !contentText || defaultPatterns.some(pat => pat.test(contentText.replace(/\s+/g, ' ').trim()));

    let caretTarget = null;

    if (isDefaultOrEmpty) {
        // 枠しかない場合 → 枠ごと削除
        const nextElem = box.nextElementSibling;
        const prevElem = box.previousElementSibling;

        if (nextElem && nextElem.tagName === 'P') {
            caretTarget = nextElem;
        } else if (prevElem) {
            caretTarget = prevElem;
        } else {
            const emptyP = document.createElement('p');
            emptyP.innerHTML = '<br>';
            box.parentNode.insertBefore(emptyP, box);
            caretTarget = emptyP;
        }

        box.remove();
        showToast("枠を削除しました");
    } else {
        // 中に文字が入っている場合 → 文字を残して枠を消す
        const fullClone = box.cloneNode(true);
        fullClone.querySelectorAll('.drag-handle-container, .drag-handle, .no-print, script, style').forEach(el => el.remove());
        fullClone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
        fullClone.querySelectorAll('p, div, li, tr').forEach(b => b.appendChild(document.createTextNode('\n')));

        const rawText = fullClone.textContent;
        const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

        const fragment = document.createDocumentFragment();
        let firstP = null;
        if (lines.length > 0) {
            lines.forEach((line, idx) => {
                const p = document.createElement('p');
                p.textContent = line;
                fragment.appendChild(p);
                if (idx === 0) firstP = p;
            });
        } else {
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            fragment.appendChild(p);
            firstP = p;
        }

        caretTarget = firstP;
        box.parentNode.replaceChild(fragment, box);
        showToast("文字を残して枠を解除しました");
    }

    // キャレットを安全に配置（画面が最上部にスクロールするのを防ぐ）
    if (caretTarget) {
        try {
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(caretTarget);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch (_) {}
    }

    // スクロール位置の跳躍を確実に抑止
    if (scrollContainer && scrollContainer.scrollTop !== savedScrollTop) {
        scrollContainer.scrollTop = savedScrollTop;
    }
    if (window.scrollY !== savedScrollTop && !scrollContainer) {
        window.scrollTo(0, savedScrollTop);
    }

    updateTOC();
    autoUpdateUI();
}

function insertDivider() { document.execCommand('insertHTML', false, '<div class="divider"></div><p><br></p>'); autoUpdateUI(); }

function insertPageBreak() {
    editor.focus();
    const html = `<div class="page-break" contenteditable="false"></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    autoUpdateUI();
}

/* --- 画像アップロード処理 --- */
function handleImageUpload(input) {
    if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            restoreRange();
            // デフォルトは中央配置で挿入
            const imgHtml = `<img src="${e.target.result}" class="img-center">`;
            document.execCommand('insertHTML', false, imgHtml);

            autoUpdateUI();
            input.value = '';
        };
        reader.readAsDataURL(input.files[0]);
    }
}


function parseIntoSections(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    sectionsData = [];
    let currentSection = { id: 'sec_intro', title: '導入', level: 1, content: '' };
    const tempContainer = document.createElement('div');

    let secCounter = 1;
    const nodes = Array.from(tempDiv.childNodes);
    let hasContentInIntro = false;

    nodes.forEach(node => {
        const isHeading = node.nodeType === 1 && (node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3');
        if (isHeading) {
            currentSection.content = tempContainer.innerHTML;
            if (currentSection.id === 'sec_intro' && !hasContentInIntro && tempContainer.innerHTML.trim() === '') {
                // skip
            } else {
                sectionsData.push({ ...currentSection });
            }
            tempContainer.innerHTML = '';
            tempContainer.appendChild(node.cloneNode(true));
            currentSection = {
                id: 'sec_' + secCounter++,
                title: node.textContent || '無題',
                level: parseInt(node.tagName[1]),
                content: ''
            };
            hasContentInIntro = true;
        } else {
            tempContainer.appendChild(node.cloneNode(true));
            if (node.nodeType === 1 || (node.nodeType === 3 && node.textContent.trim() !== '')) {
                hasContentInIntro = true;
            }
        }
    });

    currentSection.content = tempContainer.innerHTML;
    sectionsData.push({ ...currentSection });
}

// セクション並び替え用変数
let draggedSectionIndex = null;

function handleDragStart(e, index) {
    draggedSectionIndex = index;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e, dropIndex) {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === dropIndex) return;

    saveCurrentSection();

    const moved = sectionsData.splice(draggedSectionIndex, 1)[0];
    sectionsData.splice(dropIndex, 0, moved);

    if (currentSectionIndex === draggedSectionIndex) {
        currentSectionIndex = dropIndex;
    } else if (currentSectionIndex > draggedSectionIndex && currentSectionIndex <= dropIndex) {
        currentSectionIndex--;
    } else if (currentSectionIndex < draggedSectionIndex && currentSectionIndex >= dropIndex) {
        currentSectionIndex++;
    }

    draggedSectionIndex = null;
    updateTOC();

    // 新しい位置のセクションを再描画
    editor.innerHTML = sectionsData[currentSectionIndex].content;
}

function addNewSection() {
    if (!isSectionMode) return;
    saveCurrentSection();
    const newId = 'sec_' + Date.now();
    const newSection = {
        id: newId,
        title: '新しい見出し',
        level: 1,
        content: '<h1>新しい見出し</h1><p><br></p>'
    };
    sectionsData.push(newSection);
    loadSection(sectionsData.length - 1);
}

function saveCurrentSection() {
    if (isSectionMode && currentSectionIndex >= 0) {
        sectionsData[currentSectionIndex].content = editor.innerHTML;
    }
}

function loadSection(index) {
    saveCurrentSection();
    currentSectionIndex = index;
    editor.innerHTML = sectionsData[index].content;
    const currentSectionSpan = document.querySelector('#current-section-display span');
    if (currentSectionSpan) {
        currentSectionSpan.className = 'text-emerald-600 font-bold';
        currentSectionSpan.textContent = sectionsData[index].title;
    }
    updateTOC();

    // スクロールを一番上に戻す (ページ全体スクロール対応)
    window.scrollTo({ top: 0, behavior: 'instant' });
    const mainArea = document.querySelector('main');
    if (mainArea) {
        mainArea.scrollTop = 0;
    }
}

function toggleEditMode() {
    const btn = document.getElementById('mode-toggle-btn');
    if (!isSectionMode) {
        isSectionMode = true;
        if (btn) {
            btn.textContent = "📝 全文モード";
            btn.classList.replace('bg-indigo-100', 'bg-emerald-100');
            btn.classList.replace('text-indigo-700', 'text-emerald-700');
        }
        parseIntoSections(editor.innerHTML);
        if (sectionsData.length > 0) {
            loadSection(0);
        } else {
            sectionsData = [{ id: 'sec_0', title: '本文', level: 1, content: editor.innerHTML }];
            loadSection(0);
        }
    } else {
        saveCurrentSection();
        isSectionMode = false;
        if (btn) {
            btn.textContent = "📑 セクションモード";
            btn.classList.replace('bg-emerald-100', 'bg-indigo-100');
            btn.classList.replace('text-emerald-700', 'text-indigo-700');
        }
        const fullHtml = sectionsData.map(sec => sec.content).join('');
        editor.innerHTML = fullHtml;
        const currentSectionSpan = document.querySelector('#current-section-display span');
        if (currentSectionSpan) currentSectionSpan.className = '';
        updateTOC();
    }
}

function updateTOC() {
    if (isSectionMode) {
        tocContainer.innerHTML = sectionsData.length ? '' : '<p class="p-4 text-slate-400 italic">見出しなし</p>';
        sectionsData.forEach((sec, i) => {
            const item = document.createElement('div');
            item.className = 'flex items-center group ' + (currentSectionIndex === i ? 'bg-emerald-50 border-emerald-500' : 'border-transparent hover:bg-slate-50');
            item.style.borderRightWidth = '4px';
            item.draggable = true;
            item.ondragstart = (e) => handleDragStart(e, i);
            item.ondragover = handleDragOver;
            item.ondrop = (e) => handleDrop(e, i);

            // ドラッグハンドル
            const handle = document.createElement('div');
            handle.className = 'w-6 h-full flex items-center justify-center cursor-move text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition';
            handle.innerHTML = '≡';
            handle.title = 'ドラッグで並び替え';

            const link = document.createElement('a');
            link.href = '#';
            link.textContent = sec.title;
            link.className = 'flex-1 py-2 px-1 truncate block text-slate-600 ' + (currentSectionIndex === i ? 'text-emerald-700 font-bold' : '');
            link.style.paddingLeft = sec.level > 1 ? ((sec.level - 1) * 0.75) + 'em' : '0.25em';
            link.onclick = (e) => { e.preventDefault(); loadSection(i); };

            item.appendChild(handle);
            item.appendChild(link);
            tocContainer.appendChild(item);
        });

        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'p-4 border-t border-slate-100 mt-2';
        const addBtn = document.createElement('button');
        addBtn.className = 'w-full py-2 bg-indigo-50 border border-indigo-100 rounded text-xs text-indigo-600 hover:bg-indigo-100 transition font-bold flex items-center justify-center gap-1';
        addBtn.innerHTML = '➕ セクション追加';
        addBtn.onclick = addNewSection;
        addBtnContainer.appendChild(addBtn);
        tocContainer.appendChild(addBtnContainer);

        updateCharCount();
        return;
    }

    const hs = Array.from(editor.querySelectorAll('h1, h2, h3, h4, h5, h6, .h7, .h8'));
    tocContainer.innerHTML = hs.length ? '' : '<p class="p-4 text-slate-400 italic">見出しなし</p>';
    hs.forEach((h, i) => {
        if (!h.id) h.id = `h-${i}`;
        const link = document.createElement('a');
        link.href = `#${h.id}`;
        link.textContent = h.textContent.trim() || '無題';
        link.className = 'block py-2 px-4 hover:bg-slate-50 truncate border-r-4 border-transparent text-slate-600';
        let lv = 0;
        if (h.tagName.startsWith('H')) lv = parseInt(h.tagName[1]) - 1;
        else if (h.classList.contains('h7')) lv = 6;
        else if (h.classList.contains('h8')) lv = 7;
        link.style.paddingLeft = `${lv + 1}em`;
        link.onclick = (e) => { e.preventDefault(); h.scrollIntoView({ behavior: 'smooth' }); };
        tocContainer.appendChild(link);
    });
    updateCharCount();
    const currentSectionSpan = document.querySelector('#current-section-display span');
    if (currentSectionSpan && hs.length > 0) currentSectionSpan.textContent = hs[hs.length - 1].textContent;
}

function updateCharCount() { charCountDisplay.textContent = (editor.innerText || "").replace(/\n/g, "").length; }

/* --- 表の挿入 --- */
function openTableModal() {
    saveRange(); // 現在のカーソル位置を保存
    const container = document.getElementById('table-grid-container');
    container.innerHTML = '';
    for (let r = 1; r <= 10; r++) {
        for (let c = 1; c <= 10; c++) {
            const sq = document.createElement('div');
            sq.className = 'grid-square';
            sq.onmouseover = () => {
                document.getElementById('table-size-display').textContent = `${c} x ${r}`;
                Array.from(container.children).forEach((child, i) => {
                    const curR = Math.floor(i / 10) + 1, curC = (i % 10) + 1;
                    if (curR <= r && curC <= c) child.classList.add('active');
                    else child.classList.remove('active');
                });
            };
            sq.onclick = () => {
                const col = document.getElementById('bg-color-picker').value;
                let table = `<table style="width:100%; border-collapse:collapse; margin:1rem 0; border:1px solid #ccc;">`;
                for (let i = 0; i < r; i++) {
                    table += '<tr>';
                    for (let j = 0; j < c; j++) {
                        // 1行目はヘッダー色、それ以外は白背景
                        const bgColor = (i === 0) ? col : '#ffffff';
                        const textColor = (i === 0) ? '#ffffff' : 'inherit';
                        const fontWeight = (i === 0) ? 'bold' : 'normal';
                        table += `<td style="border:1px solid #ccc; padding:8px; background-color:${bgColor}; color:${textColor}; font-weight:${fontWeight}; min-height:1.5em;">&nbsp;</td>`;
                    }
                    table += '</tr>';
                }
                table += '</table><p><br></p>';

                restoreRange(); // 保存した位置にフォーカスを戻す
                document.execCommand('insertHTML', false, table);
                closeModal('table-modal');
                autoUpdateUI();
            };
            container.appendChild(sq);
        }
    }
    openModal('table-modal');
}


window.onload = () => {
    document.execCommand('styleWithCSS', false, true);
    document.execCommand('defaultParagraphSeparator', false, 'p');
    renderSnippetSelector();
    const savedContent = localStorage.getItem('weby_autosave');
    const savedTitle = localStorage.getItem('weby_autosave_title');
    if (savedContent) { editor.innerHTML = savedContent; saveStatus.textContent = "ブラウザから復元済み"; }
    if (savedTitle) titleInput.value = savedTitle;
    setTheme(localStorage.getItem('weby_theme') || 'standard');

    const savedFont = localStorage.getItem('weby_autosave_fontFamily');
    const savedLH = localStorage.getItem('weby_autosave_lineHeight');
    const savedLineLimit = localStorage.getItem('weby_autosave_lineLimit');
    const savedCharLimit = localStorage.getItem('weby_autosave_charLimit');
    const savedExportLayout = localStorage.getItem('weby_autosave_exportLayout');

    if (savedFont) {
        const fontSelect = document.getElementById('font-family-select');
        if (fontSelect) fontSelect.value = savedFont;
    }
    if (savedLH) {
        const lhSelect = document.getElementById('line-height-select');
        if (lhSelect) lhSelect.value = savedLH;
    }
    if (savedLineLimit) {
        const lineInput = document.getElementById('page-line-limit');
        if (lineInput) lineInput.value = savedLineLimit;
    }
    if (savedCharLimit) {
        const charInput = document.getElementById('page-char-limit');
        if (charInput) charInput.value = savedCharLimit;
    }
    if (savedExportLayout) {
        const layoutSelect = document.getElementById('export-layout-select');
        if (layoutSelect) layoutSelect.value = savedExportLayout;
    }
    updateEditorStyles();
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); manualIndent(!e.shiftKey); }
        if (e.key === 'Enter') {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                let node = sel.getRangeAt(0).commonAncestorContainer;
                if (node.nodeType === 3) node = node.parentNode;
                const wrapper = node.closest('.box-wrapper');
                if (wrapper) {
                    // 枠の中でのEnterは、枠を分割（破損）させずに単純な改行(<br>)を挿入する
                    e.preventDefault();
                    document.execCommand('insertLineBreak');
                }
            }
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                let node = sel.getRangeAt(0).commonAncestorContainer;
                if (node.nodeType === 3) node = node.parentNode;
                const wrapper = node.closest('.box-wrapper');
                if (wrapper) {
                    const inner = wrapper.querySelector('.mt-1, .mt-2, .text-sm, .box-custom, [contenteditable="true"]') || wrapper;
                    const clone = inner.cloneNode(true);
                    clone.querySelectorAll('.drag-handle-container, .drag-handle, .no-print, script, style').forEach(x => x.remove());
                    clone.querySelectorAll('strong').forEach(s => {
                        if (/^[【■]/.test(s.innerText.trim())) s.remove();
                    });
                    const rawContent = clone.textContent.replace(/\s+/g, '');
                    const selectedText = sel.toString().replace(/\s+/g, '');
                    if (!rawContent || (selectedText.length >= rawContent.length && rawContent.length > 0)) {
                        e.preventDefault();
                        eraseOrUnwrapBox(wrapper);
                    }
                }
            }
        }
    });
    // 画像クリック時に選択状態にする
    editor.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG' && !e.target.classList.contains('char-image-preview')) {
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNode(e.target);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    // --- TRPG枠内のテキストコピー＆ペースト制御 ---
    // 目星等のTRPG枠内の文字をコピー/カットした際、文字色や背景色などの書式を含めずプレーンテキストのみをコピーする
    const trpgBoxSelector = '.box-wrapper, .kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet';
    const isInsideTRPGBox = (node) => {
        if (!node) return null;
        const el = node.nodeType === 1 ? node : node.parentElement;
        return el ? el.closest(trpgBoxSelector) : null;
    };

    const handleTRPGBoxCopy = (e, isCut = false) => {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const commonBox = isInsideTRPGBox(range.commonAncestorContainer);
        const startBox = isInsideTRPGBox(range.startContainer);
        const endBox = isInsideTRPGBox(range.endContainer);

        let isTarget = !!(commonBox || startBox || endBox);
        if (!isTarget) {
            try {
                const clone = range.cloneContents();
                if (clone && clone.querySelector && clone.querySelector(trpgBoxSelector)) {
                    isTarget = true;
                }
            } catch (_) { }
        }

        if (isTarget) {
            const text = selection.toString();
            if (text) {
                e.preventDefault();
                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', text);
                } else if (window.clipboardData) {
                    window.clipboardData.setData('Text', text);
                }
                if (isCut) {
                    document.execCommand('delete');
                }
            }
        }
    };

    document.addEventListener('copy', (e) => handleTRPGBoxCopy(e, false));
    document.addEventListener('cut', (e) => handleTRPGBoxCopy(e, true));

    // エディタ内貼り付け（ペースト）制御
    const handlePaste = (e) => {
        if (e.defaultPrevented) return;

        // 入力欄やテキストエリアでの通常のペーストは除外
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }

        const selection = window.getSelection();
        const range = (selection && selection.rangeCount > 0) ? selection.getRangeAt(0) : null;

        // 1. 貼り付け先がTRPG枠内の場合：
        // 貼り付け元の背景色や文字色などの書式を引き継がず、枠本来の文字色・背景色になるようプレーンテキストとして挿入
        const isTargetInsideBox = isInsideTRPGBox(e.target)
            || (range && (isInsideTRPGBox(range.commonAncestorContainer) || isInsideTRPGBox(range.startContainer) || isInsideTRPGBox(range.endContainer)));

        if (isTargetInsideBox) {
            const plainText = e.clipboardData ? e.clipboardData.getData('text/plain') : '';
            if (plainText) {
                e.preventDefault();
                const success = document.execCommand('insertText', false, plainText);
                if (!success && range) {
                    range.deleteContents();
                    const textNode = document.createTextNode(plainText);
                    range.insertNode(textNode);
                    range.setStartAfter(textNode);
                    range.setEndAfter(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                autoUpdateUI();
                return;
            }
        }

        // 2. 枠外への貼り付け時：TRPG枠スタイルのHTML断片が不完全にペーストされるのを防ぐフォールバック
        const html = e.clipboardData ? e.clipboardData.getData('text/html') : '';
        if (html) {
            const hasTrpgBoxClass = /box-(spot|check|listen|library|san|search|secret|gimmick|tendency|summary|custom|special|custom-snippet)|kp-info|quote/i.test(html);
            if (hasTrpgBoxClass && !/<div[^>]*class=["'][^"']*box-wrapper/i.test(html)) {
                const plainText = e.clipboardData.getData('text/plain');
                if (plainText) {
                    e.preventDefault();
                    document.execCommand('insertText', false, plainText);
                    autoUpdateUI();
                }
            }
        }
    };

    document.addEventListener('paste', handlePaste);
    updateTOC(); updateCharCount(); updateEditorWidth(); updatePageBreakGuides(); renderAllMermaidCharts();
    isDirty = false; // 初回読み込み完了時は未保存フラグをリセット
};


const throttle = (fn, wait) => {
    let lastTime = 0;
    let timer = null;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= wait) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            fn(...args);
            lastTime = now;
        } else if (!timer) {
            timer = setTimeout(() => {
                fn(...args);
                lastTime = Date.now();
                timer = null;
            }, wait - (now - lastTime));
        }
    };
};
editor.addEventListener('input', throttle(() => { autoUpdateUI(); }, 500));
titleInput.oninput = () => { autoUpdateUI(); };

// エディタ内の選択範囲を常に最新に保持（ツールバー操作時に選択範囲を失わないようにする）
document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        if (editor && editor.contains(range.commonAncestorContainer)) {
            savedSelectionRange = range.cloneRange();
        }
    }
});

// 未保存時のページ離脱・リロード防止警告
window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // ブラウザ標準の離脱確認ダイアログを表示
        return '';
    }
});

/* --- 改ページ境界線表示ロジック --- */
function updatePageBreakGuides() {
    const container = document.getElementById('page-break-guides-container');
    if (!container) return;
    container.innerHTML = '';

    const nodes = Array.from(editor.childNodes);
    const limitInput = document.getElementById('page-line-limit');
    const MAX_LINES = limitInput ? (parseInt(limitInput.value) || 35) : 35;
    const layout = document.getElementById('export-layout-select').value;

    let currentLineCount = 0;
    let pageNum = 1;

    nodes.forEach((node) => {
        // 手動改ページマークの検出
        let isManualPageBreak = false;
        if (node.nodeType === 1 && (node.classList.contains('page-break') || node.querySelector('.page-break'))) {
            isManualPageBreak = true;
            pageNum++;
            currentLineCount = 0;
            if (!node.textContent.trim() && !node.querySelector('img, table')) {
                return;
            }
        }

        let weight = 1; // 基本1行分
        if (node.nodeType === 1) { // Element node
            const tag = node.tagName;
            const text = node.innerText || "";

            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;

            const charLimit = parseInt(document.getElementById('page-char-limit')?.value) || 40;
            const textLines = Math.ceil(text.length / (layout === '2' ? Math.ceil(charLimit / 2) : charLimit)) || 1;

            const pbH1 = document.getElementById('export-page-break-h1');
            if (tag === 'H1' && pbH1 && pbH1.checked && typeof currentLineCount !== 'undefined' && currentLineCount > 0) {
                if (typeof pageNum !== 'undefined') {
                    pageNum++;
                    currentLineCount = 0;
                }
            }

            if (tag === 'H1') weight = 3;
            else if (tag === 'H2') weight = 2;
            else if (tag === 'H3') weight = 2;
            else if (tag === 'IMG') weight = 10;
            else if (node.classList.contains('divider')) weight = 1;
            else if (node.tagName === 'TABLE') weight = 6;
            else if (node.classList.contains('kp-info') || node.className.includes('box-')) weight = 4;
            else weight = textLines * sizeRatio;
        }

        // ページ溢れチェック
        if (!isManualPageBreak && currentLineCount + weight > MAX_LINES) {
            if (node.nodeType === 1) {
                const offsetTop = node.offsetTop;
                // ガイド線を配置
                const line = document.createElement('div');
                line.className = 'page-break-line';
                line.style.top = `${offsetTop - 8}px`; // 少し上に配置

                const labelLeft = document.createElement('span');
                labelLeft.className = 'page-break-label';
                labelLeft.textContent = `✂️ ページ境界 (約 ${MAX_LINES} 行目安)`;

                const labelRight = document.createElement('span');
                labelRight.className = 'page-break-label';
                labelRight.textContent = `${pageNum} ページ目 | 次は ${pageNum + 1} ページ目`;

                line.appendChild(labelLeft);
                line.appendChild(labelRight);
                container.appendChild(line);

                pageNum++;
                currentLineCount = 0;
            }
        }

        currentLineCount += weight;
    });
}

// リサイズ時にもガイド線を再描画
window.addEventListener('resize', throttle(() => { updatePageBreakGuides(); }, 300));

/* --- PDF（プレビュー・印刷）書き出し機能 --- */
function exportPDF() {
    updateTOC();
    const title = titleInput.value || '無題のシナリオ';
    const layout = document.getElementById('export-layout-select').value;
    const fontFamily = document.getElementById('font-family-select').value;
    const lineHeight = document.getElementById('line-height-select').value;
    let fontCSS = fontFamily === 'sans-serif' ? "system-ui, -apple-system, sans-serif" :
        fontFamily === 'serif' ? 'Georgia, Cambria, "Times New Roman", Times, "YuMincho", "Hiragino Mincho ProN", serif' :
            fontFamily === 'monospace' ? 'Consolas, Monaco, "Courier New", monospace' :
                fontFamily === 'yu-gothic' ? '"Yu Gothic", "YuGothic", "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif' :
                    fontFamily === 'yu-mincho' ? '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", serif' :
                        fontFamily === 'meiryo' ? '"Meiryo", "MS PGothic", sans-serif' :
                            fontFamily === 'rounded-gothic' ? '"Hiragino Maru Gothic ProN", "Kosugi Maru", "HGMaruGothicMPRO", sans-serif' :
                                fontFamily === 'ms-pgothic' ? '"MS PGothic", "MS UI Gothic", sans-serif' :
                                    fontFamily === 'ms-pmincho' ? '"MS PMincho", serif' :
                                        "system-ui, -apple-system, sans-serif";

    // ページ分割ロジック
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;
    const nodes = Array.from(tempDiv.childNodes);

    let pagesHtml = '', currentPageContent = '', currentLineCount = 0, pageNum = 1;
    const limitInput = document.getElementById('page-line-limit');
    const MAX_LINES = limitInput ? (parseInt(limitInput.value) || 35) : 35;

    const flushPage = () => {
        pagesHtml += `
            <div class="page">
                <div class="page-content ${layout === '2' ? 'col-2' : ''}">
                    ${currentPageContent}
                </div>
                <div class="page-footer">- ${pageNum} -</div>
            </div>
        `;
        currentPageContent = '';
        currentLineCount = 0;
        pageNum++;
    };

    nodes.forEach(node => {
        // 手動改ページマークの検出
        let isManualPageBreak = false;
        if (node.nodeType === 1 && (node.classList.contains('page-break') || node.querySelector('.page-break'))) {
            isManualPageBreak = true;
            flushPage();
            if (!node.textContent.trim() && !node.querySelector('img, table')) {
                return;
            }
        }

        let weight = 1; // 基本1行分
        if (node.nodeType === 1) { // Element node
            const tag = node.tagName;
            const text = node.innerText || "";

            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;

            const charLimit = parseInt(document.getElementById('page-char-limit')?.value) || 40;
            const textLines = Math.ceil(text.length / (layout === '2' ? Math.ceil(charLimit / 2) : charLimit)) || 1;

            const pbH1 = document.getElementById('export-page-break-h1');
            if (tag === 'H1' && pbH1 && pbH1.checked && typeof currentLineCount !== 'undefined' && currentLineCount > 0) {
                if (typeof flushPage === 'function') {
                    flushPage();
                    if (typeof isManualPageBreak !== 'undefined') isManualPageBreak = true;
                }
            }

            if (tag === 'H1') weight = 3;
            else if (tag === 'H2') weight = 2;
            else if (tag === 'H3') weight = 2;
            else if (tag === 'IMG') weight = 10;
            else if (node.classList.contains('divider')) weight = 1;
            else if (node.tagName === 'TABLE') weight = 6;
            else if (node.classList.contains('kp-info') || node.className.includes('box-')) weight = 4;
            else weight = textLines * sizeRatio;
        }

        if (!isManualPageBreak && currentLineCount + weight > MAX_LINES && currentPageContent !== '') {
            flushPage();
        }

        currentPageContent += node.nodeType === 1 ? node.outerHTML : node.textContent;
        currentLineCount += weight;
    });

    if (currentPageContent !== '') flushPage();

    // PDF用印刷スタイル（エディタのスタイルを完全に再現）
    const printStyles = `
        * { box-sizing: border-box; }
        body { font-family: ${fontCSS}; line-height: ${lineHeight}; color: #0f172a; margin: 0; padding: 0; background-color: #ffffff; }
        main { display: flex; flex-direction: column; align-items: center; }
        
        .page { 
            width: 172mm; /* A4幅印刷最適サイズ */
            height: 251mm; /* A4高印刷最適サイズ */
            padding: 20mm 15mm; 
            position: relative; 
            display: flex;
            flex-direction: column;
            page-break-after: always;
            box-sizing: border-box;
        }
        .page-content { flex: 1; overflow: hidden; }
        .page-footer { 
            position: absolute; 
            bottom: 10mm; 
            left: 0; 
            width: 100%; 
            text-align: center; 
            font-size: 10pt; 
            color: #94a3b8; 
        }
        .col-2 {
            column-count: 2;
            column-gap: 15mm;
        }
        
        h1 { font-size: 24pt; font-weight: bold; color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 5px; margin-top: 0; margin-bottom: 20px; }
        h2 { font-size: 18pt; font-weight: bold; border-left: 6px solid #4f46e5; padding-left: 10px; margin-top: 20px; margin-bottom: 10px; background-color: rgba(79, 70, 229, 0.05); }
        h3 { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #e2e8f0; margin-top: 15px; margin-bottom: 5px; }
        h4, h5, h6 { font-weight: bold; margin-top: 15px; }
        .h7 { font-size: 11pt; font-weight: bold; color: #64748b; margin-top: 5px; border-left: 2px solid #64748b; padding-left: 5px; display: block; }
        .h8 { font-size: 10pt; font-weight: bold; color: #64748b; font-style: italic; margin-top: 5px; opacity: 0.8; display: block; }
        p { margin: 0; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; break-inside: avoid; }
        
        table { border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 10pt; break-inside: avoid; }
        td, th { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f8fafc; font-weight: bold; }
        .divider { border: 0; height: 1px; background-image: linear-gradient(to right, rgba(79, 70, 229, 0), rgba(79, 70, 229, 0.75), rgba(79, 70, 229, 0)); margin: 20px 0; clear: both; }
        details { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: rgba(0,0,0,0.02); margin: 15px 0; break-inside: avoid; }
        summary { cursor: pointer; font-weight: bold; color: #4f46e5; }
        
        .kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special, .box-custom-snippet, .box-flowchart { padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid transparent; clear: both; break-inside: avoid; }
        .box-special { border-top-width: 4px; border-left: 0; border-right: 0; border-bottom: 0; border-style: solid; }
        .box-secret { border-style: dashed; }
        .quote { border-left: 4px solid #94a3b8; border-radius: 0; font-style: italic; background: #f8fafc; }
        .box-flowchart {
            border: 2px solid #e2e8f0;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .box-flowchart .flowchart-actions {
            display: none;
        }
        /* キャラクターシートの印刷用スタイル */
        .box-char-sheet {
            border: 1px solid #ccd3e0;
            background: #ffffff;
            margin: 15px 0;
            border-radius: 8px;
        }
        .box-char-sheet .char-stats-grid {
            display: grid !important;
            grid-template-columns: repeat(9, minmax(0, 1fr)) !important;
            gap: 4px !important;
            margin-top: 0.25rem !important;
        }
        @media (max-width: 640px) {
            .box-char-sheet .char-stats-grid {
                grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
            }
        }
        .box-char-sheet input, .box-char-sheet textarea {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            color: #0f172a !important;
        }
        .box-char-sheet .char-skill-row {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            background-color: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            padding: 2px 6px !important;
        }
        .box-char-sheet .char-skill-row input {
            background: transparent !important;
            border: none !important;
            padding: 2px 0 !important;
            border-radius: 0 !important;
        }
        .box-char-sheet .char-skill-name {
            width: auto !important;
            flex: 1 !important;
            font-weight: 500 !important;
        }
        .box-char-sheet .char-skill-value {
            width: 40px !important;
            text-align: right !important;
            font-weight: bold !important;
        }
        
        /* プロフィール行・列のレイアウト */
        .box-char-sheet .char-profile-row {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
        }
        .box-char-sheet .char-profile-row-multi {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }
        .box-char-sheet .char-profile-col {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            flex: 1 !important;
            min-width: 80px !important;
        }
        .box-char-sheet .char-profile-label {
            font-size: 11px !important;
            font-weight: bold !important;
            color: #64748b !important;
            white-space: nowrap !important;
            min-width: 40px !important;
        }
        .box-char-sheet .char-profile-col .char-profile-label {
            min-width: 50px !important;
        }
        /* 強制100%幅スタイルの上書き */
        .box-char-sheet .char-profile-row input,
        .box-char-sheet .char-profile-col input {
            flex: 1 !important;
            width: 0 !important;
            min-width: 0 !important;
        }
        
        @media print {
            body { background: white; }
            .page { 
                margin: 0; 
                border: none; 
                page-break-after: always; 
                width: 100%; 
                height: 100%;
            }
        }
    `;

    // Pタグをまとめてコピーしやすくする（空行を段落区切りとする）
    {
        const outDiv = document.createElement('div');
        outDiv.innerHTML = pagesHtml;
        const pTags = Array.from(outDiv.querySelectorAll('p, div:not([class])'));
        for (let i = 0; i < pTags.length; i++) {
            let p = pTags[i];
            if (!p.parentNode) continue;

            const isPEmpty = p.innerHTML.trim() === '' || p.innerHTML === '<br>' || p.querySelector('img, table, div');
            if (isPEmpty) {
                if (p.innerHTML.trim() === '') p.innerHTML = '<br>';
                continue;
            }

            p.style.margin = '0';

            let next = p.nextElementSibling;

            while (next && (next.tagName === 'P' || (next.tagName === 'DIV' && !next.className))) {
                const isNextEmpty = next.innerHTML.trim() === '' || next.innerHTML === '<br>' || next.querySelector('img, table, div');
                if (isNextEmpty) {
                    if (next.innerHTML.trim() === '') next.innerHTML = '<br>';
                    break;
                }
                p.innerHTML += '<br>' + next.innerHTML;
                let toRemove = next;

                next = next.nextElementSibling;
                toRemove.remove();
            }
        }
        pagesHtml = outDiv.innerHTML;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>${printStyles}</style>
</head>
<body>
    <main>
        ${pagesHtml}
    </main>
    <script>
        window.onload = () => {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(htmlContent);
    win.document.close();
}

/* --- エディタ幅制御ロジック --- */
function updateEditorWidth() {
    const editor = document.getElementById('editor');
    const limitInput = document.getElementById('page-char-limit');
    if (!editor || !limitInput) return;
    const maxChars = parseInt(limitInput.value) || 40;

    // エディタのmax-widthを設定 (文字数 * 1em + 左右パディング 6rem)
    const wrapper = editor.parentElement;
    if (wrapper) {
        wrapper.style.maxWidth = `calc(${maxChars}em + 6rem)`;
    }
}

/* --- ユーザースニペット管理機能 --- */

// スニペット一覧をlocalStorageから取得
function getSnippets() {
    try {
        const data = localStorage.getItem('weby_snippets');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("スニペット取得失敗", e);
        return [];
    }
}

// スニペット一覧をlocalStorageに保存し、UIを更新
function saveSnippets(snippets) {
    try {
        localStorage.setItem('weby_snippets', JSON.stringify(snippets));
    } catch (e) {
        console.error("スニペット保存失敗", e);
    }
    renderSnippetSelector();
}

// ツールバーのスニペット選択セレクトボックスを描画
function renderSnippetSelector() {
    const selector = document.getElementById('snippet-selector');
    if (!selector) return;

    selector.innerHTML = `
        <option value="">スニペット...</option>
        <option value="manage">⚙️ 管理...</option>
    `;

    const snippets = getSnippets();
    snippets.forEach(snippet => {
        const opt = document.createElement('option');
        opt.value = snippet.id;
        opt.textContent = snippet.name;
        selector.appendChild(opt);
    });
}

// スニペット選択時の制御
function handleSnippetSelect(val) {
    if (!val) return;
    if (val === 'manage') {
        openSnippetManageModal();
    } else {
        insertSnippet(val);
    }
}

// スニペット管理モーダルを開く
function openSnippetManageModal() {
    hideSnippetForm();
    renderSnippetList();
    openModal('snippet-modal');
}

// モーダル内に登録済みスニペット一覧を描画
function renderSnippetList() {
    const container = document.getElementById('snippet-list-container');
    if (!container) return;

    const snippets = getSnippets();
    if (snippets.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 italic p-4 text-center">登録されたスニペットはありません</p>';
        return;
    }

    container.innerHTML = '';
    snippets.forEach(snippet => {
        const item = document.createElement('div');
        item.className = "flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm gap-2";

        const colorIndicator = `<span class="w-3 h-3 rounded-full inline-block" style="background-color: ${snippet.color || '#3b82f6'}"></span>`;

        item.innerHTML = `
            <div class="flex items-center gap-2 overflow-hidden flex-1">
                ${colorIndicator}
                <div class="font-bold text-xs text-slate-700 truncate flex-1">${snippet.name}</div>
                <div class="text-[10px] text-slate-400 shrink-0">【${snippet.label}】</div>
            </div>
            <div class="flex gap-1 shrink-0">
                <button onclick="editSnippet('${snippet.id}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold transition">編集</button>
                <button onclick="deleteSnippet('${snippet.id}')" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] font-bold transition">削除</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// 編集・作成フォームの表示
function showSnippetForm(isEdit = false) {
    document.getElementById('snippet-list-view').classList.add('hidden');
    document.getElementById('snippet-form-view').classList.remove('hidden');
    document.getElementById('snippet-form-view').classList.add('flex');

    if (!isEdit) {
        document.getElementById('snippet-edit-id').value = '';
        document.getElementById('snippet-name-input').value = '';
        document.getElementById('snippet-label-input').value = '';
        document.getElementById('snippet-color-input').value = '#3b82f6';
        document.getElementById('snippet-content-input').value = '';
    }
}

// 編集・作成フォームの非表示（一覧へ戻る）
function hideSnippetForm() {
    document.getElementById('snippet-form-view').classList.remove('flex');
    document.getElementById('snippet-form-view').classList.add('hidden');
    document.getElementById('snippet-list-view').classList.remove('hidden');
}

// スニペット編集開始
function editSnippet(id) {
    const snippets = getSnippets();
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) return;

    document.getElementById('snippet-edit-id').value = snippet.id;
    document.getElementById('snippet-name-input').value = snippet.name;
    document.getElementById('snippet-label-input').value = snippet.label;
    document.getElementById('snippet-color-input').value = snippet.color || '#3b82f6';
    document.getElementById('snippet-content-input').value = snippet.content || '';

    showSnippetForm(true);
}

// スニペット削除
function deleteSnippet(id) {
    if (!confirm('このスニペットを削除しますか？')) return;
    const snippets = getSnippets();
    const filtered = snippets.filter(s => s.id !== id);
    saveSnippets(filtered);
    renderSnippetList();
}

// スニペット保存
function saveSnippetForm() {
    const name = document.getElementById('snippet-name-input').value.trim();
    const label = document.getElementById('snippet-label-input').value.trim();
    const color = document.getElementById('snippet-color-input').value;
    const content = document.getElementById('snippet-content-input').value;
    const editId = document.getElementById('snippet-edit-id').value;

    if (!name || !label) {
        alert('スニペット名と表示ラベルを入力してください。');
        return;
    }

    const snippets = getSnippets();
    if (editId) {
        const index = snippets.findIndex(s => s.id === editId);
        if (index !== -1) {
            snippets[index] = { id: editId, name, label, color, content };
        }
    } else {
        const newId = 'snippet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        snippets.push({ id: newId, name, label, color, content });
    }

    saveSnippets(snippets);
    hideSnippetForm();
    renderSnippetList();
}

// スニペット挿入
function insertSnippet(id) {
    const snippets = getSnippets();
    const snippet = snippets.find(s => s.id === id);
    if (!snippet) return;

    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const col = snippet.color || '#3b82f6';

    const defaultContent = (snippet.content || "内容を入力...").replace(/\n/g, '<br>');
    const content = selectedHtml || defaultContent;
    const textColor = darkenColor(col, 0.4);

    const html = `<div class="box-wrapper group relative my-4 block" contenteditable="false" draggable="true" style="clear:both; break-inside: avoid; user-select:none;">
        <div class="drag-handle-container absolute -left-10 top-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 no-print select-none z-10" contenteditable="false">
            <button type="button" class="box-erase-btn cursor-pointer text-slate-400 hover:text-rose-500 hover:scale-125 text-xs p-0.5 transition" onclick="eraseOrUnwrapBox(this.closest('.box-wrapper'))" title="枠を消す（文字があれば文字を残して枠解除、枠のみなら枠ごと削除）">🧹</button>
            <div class="drag-handle cursor-move text-slate-300 hover:text-slate-600 font-bold" title="ドラッグで移動">≡</div>
        </div>
        <div class="box-custom-snippet" contenteditable="true" data-snippet-id="${snippet.id}" style="border-color:${col}; background-color:${col}11; color:${textColor}; padding: 1rem; border-radius: 0.5rem; margin: 0; border-width: 2px; border-style: solid; user-select:text;"><strong>【${snippet.label}】</strong><div class="mt-1">${content}</div></div>
    </div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

/* --- フローチャート管理機能 (Mermaid.js) --- */

// エディタ内のすべてのフローチャートをレンダリング
function renderAllMermaidCharts() {
    const charts = document.querySelectorAll('#editor .box-flowchart');
    if (charts.length === 0) return;

    let needsRender = false;
    charts.forEach((chart, index) => {
        const code = chart.getAttribute('data-mermaid-code');
        if (!code) return;

        // ユニークIDを生成
        const uniqueId = `mermaid-chart-${Date.now()}-${index}`;

        // 既存のSVGレンダリング結果を破棄し、pre.mermaid要素を再構成する
        chart.innerHTML = `
            <pre class="mermaid" id="${uniqueId}">${code}</pre>
            <div class="flowchart-actions no-print">
                <button onclick="editFlowchart(this.parentNode.parentNode)" class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition">✏️ 編集</button>
            </div>
        `;
        needsRender = true;
    });

    if (needsRender && typeof mermaid !== 'undefined') {
        try {
            mermaid.run({
                nodes: document.querySelectorAll('#editor .mermaid')
            });
        } catch (e) {
            console.error("Mermaid.js レンダリングエラー", e);
        }
    }
}

// 新規作成用のフローチャートモーダルを開く
function openFlowchartModal() {
    saveRange(); // 現在のカーソル位置を保存

    document.getElementById('flowchart-edit-id').value = '';
    document.getElementById('flowchart-code-input').value = `graph TD\n  Start[開始] --> End[終了]`;
    document.getElementById('flowchart-save-btn').textContent = 'エディタに挿入';

    openModal('flowchart-modal');
    updateFlowchartPreview();
}

// テンプレートの適用
function applyFlowchartTemplate(type) {
    const textarea = document.getElementById('flowchart-code-input');
    if (!textarea) return;

    let code = '';
    if (type === 'simple') {
        code = `graph TD\n  Start[オープニング] --> Event1[事件発生]\n  Event1 --> Event2[探索開始]\n  Event2 --> Boss[決戦クライマックス]\n  Boss --> Ending[エンディング]`;
    } else if (type === 'branch') {
        code = `graph TD\n  Start[オープニング] --> Branch{ルート分岐}\n  Branch -->|ルートA| RouteA[探索場所A]\n  Branch -->|ルートB| RouteB[探索場所B]\n  RouteA --> Boss[ボス戦]\n  RouteB --> Boss\n  Boss --> End[エンディング]`;
    } else if (type === 'complex') {
        code = `graph TD\n  Start[オープニング] --> Event1[探索場所A]\n  Start --> Event2[探索場所B]\n  Event1 --> GetItem[フラグ鍵を入手]\n  GetItem & Event2 --> Boss[決戦]\n  Boss --> End[エンディング]`;
    }

    textarea.value = code;
    updateFlowchartPreview();
}

// リアルタイムプレビューのレンダリング
async function updateFlowchartPreview() {
    const code = document.getElementById('flowchart-code-input').value.trim();
    const container = document.getElementById('flowchart-preview-rendered');
    if (!container) return;
    if (!code) {
        container.innerHTML = '<span class="text-slate-400">コードを入力してください</span>';
        return;
    }

    const uniqueId = `mermaid-preview-${Date.now()}`;
    try {
        if (typeof mermaid !== 'undefined') {
            const { svg } = await mermaid.render(uniqueId, code);
            container.innerHTML = svg;
        } else {
            container.innerHTML = '<span class="text-slate-400">Mermaid.js が読み込まれていません</span>';
        }
    } catch (e) {
        container.innerHTML = `<span class="text-rose-500 text-xs font-mono whitespace-pre-wrap">${e.message || "構文エラーがあります"}</span>`;
        const errEl = document.getElementById(`d${uniqueId}`);
        if (errEl) errEl.remove();
    }
}

// プレビュー表示のスロットル処理
const updateFlowchartPreviewThrottled = throttle(updateFlowchartPreview, 300);

// フローチャートの保存（挿入または更新）
function saveFlowchart() {
    const code = document.getElementById('flowchart-code-input').value.trim();
    const editId = document.getElementById('flowchart-edit-id').value;
    if (!code) return;

    if (editId) {
        // 編集モードでの更新
        const target = document.getElementById(editId);
        if (target) {
            target.setAttribute('data-mermaid-code', code);
            const uniqueId = `mermaid-chart-${Date.now()}`;
            target.innerHTML = `
                <pre class="mermaid" id="${uniqueId}">${code}</pre>
                <div class="flowchart-actions no-print">
                    <button onclick="editFlowchart(this.parentNode.parentNode)" class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition">✏️ 編集</button>
                </div>
            `;
        }
    } else {
        // 新規作成での挿入
        editor.focus();
        restoreRange();

        const targetId = `flowchart-box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const uniqueId = `mermaid-chart-${Date.now()}`;
        const escapedCode = code.replace(/"/g, '&quot;');

        const html = `
            <div id="${targetId}" class="box-flowchart" contenteditable="false" data-mermaid-code="${escapedCode}">
                <pre class="mermaid" id="${uniqueId}">${code}</pre>
                <div class="flowchart-actions no-print">
                    <button onclick="editFlowchart(this.parentNode.parentNode)" class="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition">✏️ 編集</button>
                </div>
            </div>
            <p><br></p>
        `;
        document.execCommand('insertHTML', false, html);
    }

    closeModal('flowchart-modal');

    // レンダリングを即時リフレッシュ
    setTimeout(() => {
        renderAllMermaidCharts();
        autoUpdateUI();
    }, 50);
}

// 既存のフローチャート編集開始
function editFlowchart(el) {
    if (!el) return;
    if (!el.id) el.id = `flowchart-box-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    saveRange(); // 現在のカーソル位置をバックアップ

    document.getElementById('flowchart-edit-id').value = el.id;
    const code = el.getAttribute('data-mermaid-code') || '';
    document.getElementById('flowchart-code-input').value = code;
    document.getElementById('flowchart-save-btn').textContent = '更新';

    openModal('flowchart-modal');
    updateFlowchartPreview();
}

/* --- クトゥルフキャラクターシート機能 --- */

// キャラクターシートの新規挿入
function insertCharacterSheet() {
    editor.focus();

    const uniqueId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const sheetId = `char-sheet-${uniqueId}`;
    const skillContainerId = `skill-container-${uniqueId}`;

    const html = `
        <div class="box-char-sheet" contenteditable="false" id="${sheetId}">
            <div class="char-sheet-header bg-slate-100 p-3 rounded-t-lg border border-slate-200 border-b-0 flex justify-between items-center">
                <span class="font-bold text-slate-700 text-sm">👤 クトゥルフ神話TRPG キャラクターシート</span>
                <button onclick="copyToCcfolia('${sheetId}')" class="ccfolia-copy-btn px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition no-print">ココフォリア用データをコピー</button>
            </div>
            <div class="char-sheet-body p-4 bg-white border border-slate-200 rounded-b-lg space-y-4">
                <!-- プロフィール -->
                <div>
                    <span class="block text-xs font-bold text-slate-400 mb-1">プロフィール</span>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <!-- 画像登録枠 -->
                        <div class="char-image-container shrink-0 w-24 h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition relative overflow-hidden" onclick="triggerCharImageUpload(this)">
                            <input type="file" accept="image/*" class="hidden no-print" onchange="handleCharImageUpload(this)" onclick="event.stopPropagation()">
                            <div class="char-image-placeholder flex flex-col items-center text-slate-400 text-[10px] no-print">
                                <span class="text-base">📷</span>
                                <span class="mt-1">画像登録</span>
                            </div>
                            <img class="char-image-preview hidden absolute inset-0 w-full h-full object-cover">
                        </div>
                        <!-- 入力欄 -->
                        <div class="flex-1 flex flex-col gap-2">
                            <!-- 行1: 名前 -->
                            <div class="char-profile-row">
                                <span class="char-profile-label">名前</span>
                                <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            </div>
                            <!-- 行2: 職業、年齢、性別 -->
                            <div class="char-profile-row-multi">
                                <div class="char-profile-col">
                                    <span class="char-profile-label">職業</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                                <div class="char-profile-col">
                                    <span class="char-profile-label">年齢</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                                <div class="char-profile-col">
                                    <span class="char-profile-label">性別</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                            </div>
                            <!-- 行3: 身長、体重 -->
                            <div class="char-profile-row-multi">
                                <div class="char-profile-col">
                                    <span class="char-profile-label">身長</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                                <div class="char-profile-col">
                                    <span class="char-profile-label">体重</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                            </div>
                            <!-- 行4: 誕生日、髪・目の色 -->
                            <div class="char-profile-row-multi">
                                <div class="char-profile-col">
                                    <span class="char-profile-label">誕生日</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                                <div class="char-profile-col">
                                    <span class="char-profile-label">髪・目の色</span>
                                    <input type="text" class="char-input text-xs border border-slate-200 rounded px-2 py-1 outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 能力値 -->
                <div>
                    <span class="block text-xs font-bold text-slate-400 mb-2">能力値</span>
                    <div class="char-stats-container" style="line-height: 2;">
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">STR:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">CON:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">POW:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">DEX:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">APP:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">SIZ:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">INT:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap; margin-right: 12px;"><strong class="text-[10px] text-slate-500">EDU:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                        <span style="white-space: nowrap;"><strong class="text-[10px] text-slate-500">SAN:</strong> <span class="char-stat-input inline-block text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded px-1 outline-none" style="min-width: 30px;" contenteditable="true" oninput="autoUpdateUI();">50</span></span>
                    </div>
                </div>
                
                <!-- 技能リスト -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs font-bold text-slate-400">技能リスト</span>
                        <button onclick="addSkillToSheet('${sheetId}')" class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold transition no-print">＋ 技能追加</button>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" id="${skillContainerId}">
                        <div class="char-skill-row flex items-center gap-1 border border-slate-100 rounded px-1.5 py-0.5 bg-slate-50">
                            <input type="text" value="目星" placeholder="技能名" class="char-skill-name text-[10px] w-full bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <input type="number" value="25" class="char-skill-value text-right font-bold text-[10px] w-10 bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <span class="text-[9px] text-slate-400">%</span>
                            <button onclick="this.parentNode.remove(); autoUpdateUI();" class="text-slate-300 hover:text-rose-500 font-bold text-xs no-print shrink-0 px-0.5">×</button>
                        </div>
                        <div class="char-skill-row flex items-center gap-1 border border-slate-100 rounded px-1.5 py-0.5 bg-slate-50">
                            <input type="text" value="聞き耳" placeholder="技能名" class="char-skill-name text-[10px] w-full bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <input type="number" value="25" class="char-skill-value text-right font-bold text-[10px] w-10 bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <span class="text-[9px] text-slate-400">%</span>
                            <button onclick="this.parentNode.remove(); autoUpdateUI();" class="text-slate-300 hover:text-rose-500 font-bold text-xs no-print shrink-0 px-0.5">×</button>
                        </div>
                        <div class="char-skill-row flex items-center gap-1 border border-slate-100 rounded px-1.5 py-0.5 bg-slate-50">
                            <input type="text" value="図書館" placeholder="技能名" class="char-skill-name text-[10px] w-full bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <input type="number" value="20" class="char-skill-value text-right font-bold text-[10px] w-10 bg-transparent outline-none border-b border-transparent focus:border-slate-300" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                            <span class="text-[9px] text-slate-400">%</span>
                            <button onclick="this.parentNode.remove(); autoUpdateUI();" class="text-slate-300 hover:text-rose-500 font-bold text-xs no-print shrink-0 px-0.5">×</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p><br></p>
    `;

    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

// 技能欄の動的追加
function addSkillToSheet(sheetId) {
    const sheet = document.getElementById(sheetId);
    if (!sheet) return;
    const container = sheet.querySelector('#skill-container-' + sheetId.replace('char-sheet-', ''));
    if (!container) return;

    const div = document.createElement('div');
    div.className = "char-skill-row flex items-center gap-1 border border-slate-100 rounded px-1.5 py-0.5 bg-slate-50";

    const inputName = document.createElement('input');
    inputName.type = 'text';
    inputName.placeholder = '技能名';
    inputName.className = 'char-skill-name text-[10px] w-full bg-transparent outline-none border-b border-transparent focus:border-slate-300';
    inputName.addEventListener('input', (e) => {
        e.target.setAttribute('value', e.target.value);
        autoUpdateUI();
    });

    const inputValue = document.createElement('input');
    inputValue.type = 'number';
    inputValue.placeholder = '初期値';
    inputValue.className = 'char-skill-value text-right font-bold text-[10px] w-10 bg-transparent outline-none border-b border-transparent focus:border-slate-300';
    inputValue.addEventListener('input', (e) => {
        e.target.setAttribute('value', e.target.value);
        autoUpdateUI();
    });

    const span = document.createElement('span');
    span.className = 'text-[9px] text-slate-400';
    span.textContent = '%';

    const btn = document.createElement('button');
    btn.className = 'text-slate-300 hover:text-rose-500 font-bold text-xs no-print shrink-0 px-0.5';
    btn.textContent = '×';
    btn.addEventListener('click', () => {
        div.remove();
        autoUpdateUI();
    });

    div.appendChild(inputName);
    div.appendChild(inputValue);
    div.appendChild(span);
    div.appendChild(btn);

    container.appendChild(div);
    autoUpdateUI();
}

// ココフォリア用キャラクター貼り付けデータの生成とコピー
function copyToCcfolia(sheetId) {
    const sheet = document.getElementById(sheetId);
    if (!sheet) return;

    const inputs = sheet.querySelectorAll('.char-sheet-body .char-input');
    const name = inputs[0].value || '無題の探索者';
    const job = inputs[1].value || '';
    const age = inputs[2].value || '';
    const gender = inputs[3].value || '';
    const height = inputs[4].value || '';
    const weight = inputs[5].value || '';
    const birthday = inputs[6].value || '';
    const color = inputs[7].value || '';

    const memo = `職業: ${job}\n年齢: ${age} / 性別: ${gender}\n身長: ${height} / 体重: ${weight}\n誕生日: ${birthday}\n髪/目の色: ${color}`;

    const stats = sheet.querySelectorAll('.char-stat-input');
    const str = (stats[0].value || stats[0].innerText || '0').trim();
    const con = (stats[1].value || stats[1].innerText || '0').trim();
    const pow = (stats[2].value || stats[2].innerText || '0').trim();
    const dex = (stats[3].value || stats[3].innerText || '0').trim();
    const app = (stats[4].value || stats[4].innerText || '0').trim();
    const siz = (stats[5].value || stats[5].innerText || '0').trim();
    const int = (stats[6].value || stats[6].innerText || '0').trim();
    const edu = (stats[7].value || stats[7].innerText || '0').trim();
    const san = (stats[8].value || stats[8].innerText || '0').trim();

    // HP, MP の自動算出 (HP: (CON+SIZ)/2 切り上げ, MP: POW)
    const hp = Math.ceil((parseInt(con) + parseInt(siz)) / 2) || 0;
    const mp = parseInt(pow) || 0;

    const skillNames = sheet.querySelectorAll('.char-skill-name');
    const skillValues = sheet.querySelectorAll('.char-skill-value');

    const skills = [];
    const commands = [];

    // 基本ステータスロール
    commands.push(`CCB<=${parseInt(san) || 0} 【SAN値チェック】`);
    commands.push(`CCB<=${(parseInt(str) || 0) * 5} 【STR×5】`);
    commands.push(`CCB<=${(parseInt(con) || 0) * 5} 【CON×5】`);
    commands.push(`CCB<=${(parseInt(pow) || 0) * 5} 【POW×5】`);
    commands.push(`CCB<=${(parseInt(dex) || 0) * 5} 【DEX×5】`);
    commands.push(`CCB<=${(parseInt(app) || 0) * 5} 【APP×5】`);
    commands.push(`CCB<=${(parseInt(int) || 0) * 5} 【アイデア（INT×5）】`);
    commands.push(`CCB<=${(parseInt(edu) || 0) * 5} 【知識（EDU×5）】`);

    // 技能ロールの追加
    skillNames.forEach((sNameEl, i) => {
        const sName = sNameEl.value.trim();
        const sVal = skillValues[i].value.trim();
        if (sName) {
            skills.push({ label: sName, value: sVal });
            commands.push(`CCB<=${parseInt(sVal) || 0} 【${sName}】`);
        }
    });

    // ココフォリア互換JSONオブジェクト
    const ccfoliaData = {
        kind: "character",
        data: {
            name: name,
            memo: memo,
            initiatives: {
                "DEX": parseInt(dex) || 0
            },
            params: [
                { label: "STR", value: str },
                { label: "CON", value: con },
                { label: "POW", value: pow },
                { label: "DEX", value: dex },
                { label: "APP", value: app },
                { label: "SIZ", value: siz },
                { label: "INT", value: int },
                { label: "EDU", value: edu },
                { label: "SAN", value: san },
                { label: "HP", value: hp.toString() },
                { label: "MP", value: mp.toString() }
            ],
            status: [
                { label: "HP", value: hp, max: hp },
                { label: "MP", value: mp, max: mp },
                { label: "SAN", value: parseInt(san) || 0, max: 99 }
            ],
            commands: commands.join('\n')
        }
    };

    copyTextToClipboard(JSON.stringify(ccfoliaData, null, 2)).then(() => {
        showToast("ココフォリア用データをコピーしました！");
    }).catch(err => {
        console.error("CCFOLIAコピー失敗", err);
        alert("コピーに失敗しました。");
    });
}

// コピー用共通ヘルパー関数（セキュアコンテキスト外/file://対応）
function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(err => {
            return fallbackCopyTextToClipboard(text);
        });
    } else {
        return Promise.resolve(fallbackCopyTextToClipboard(text));
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
    if (!successful) {
        throw new Error('execCommand copy failed');
    }
}

function triggerCharImageUpload(container) {
    const fileInput = container.querySelector('input[type="file"]');
    if (fileInput) fileInput.click();
}

function handleCharImageUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const container = input.closest('.char-image-container');
            const preview = container.querySelector('.char-image-preview');
            const placeholder = container.querySelector('.char-image-placeholder');

            if (preview && placeholder) {
                preview.src = dataUrl;
                preview.setAttribute('src', dataUrl); // HTML上に固定して保存可能にする
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
                autoUpdateUI();
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// グローバルスコープバインド
window.insertCharacterSheet = insertCharacterSheet;
window.addSkillToSheet = addSkillToSheet;
window.copyToCcfolia = copyToCcfolia;
window.copyTextToClipboard = copyTextToClipboard;
window.triggerCharImageUpload = triggerCharImageUpload;
window.handleCharImageUpload = handleCharImageUpload;

/* --- Note風「＋」ボタンとフローティングメニュー --- */
let currentFloatingNode = null;

function updateFloatingMenuPosition() {
    const btn = document.getElementById('floating-plus-btn');
    const menu = document.getElementById('floating-menu');
    if (!btn || !menu) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        hideFloatingMenuUI(btn, menu);
        return;
    }

    const range = selection.getRangeAt(0);
    // エディタ外にフォーカスがある場合は非表示
    if (!editor.contains(range.startContainer)) {
        hideFloatingMenuUI(btn, menu);
        return;
    }

    let targetNode = range.startContainer;
    if (targetNode.nodeType === 3) targetNode = targetNode.parentNode;
    while (targetNode && targetNode !== editor && targetNode.tagName !== 'P') {
        targetNode = targetNode.parentNode;
    }

    if (targetNode && targetNode.tagName === 'P' && targetNode.parentNode === editor) {
        const text = targetNode.textContent.trim();
        const hasImgOrTable = targetNode.querySelector('img, table, div, iframe');

        // 空の段落の場合
        if (text === '' && !hasImgOrTable) {
            currentFloatingNode = targetNode;

            const editorRect = editor.getBoundingClientRect();
            const nodeRect = targetNode.getBoundingClientRect();

            const container = btn.parentElement;
            const containerRect = container.getBoundingClientRect();

            const topOffset = nodeRect.top - containerRect.top;
            const leftOffset = editorRect.left - containerRect.left - 16; // エディタの左端より少し左

            btn.style.top = `${topOffset}px`;
            btn.style.left = `${leftOffset}px`;

            btn.classList.remove('hidden');
            btn.classList.add('flex');

            if (!menu.classList.contains('hidden')) {
                menu.style.top = `${topOffset}px`;
                menu.style.left = `${leftOffset + 36}px`;
            }
            return;
        }
    }

    hideFloatingMenuUI(btn, menu);
}

function hideFloatingMenuUI(btn, menu) {
    if (btn) {
        btn.classList.add('hidden');
        btn.classList.remove('flex');
    }
    if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
    }
    currentFloatingNode = null;
}

function toggleFloatingMenu() {
    const btn = document.getElementById('floating-plus-btn');
    const menu = document.getElementById('floating-menu');
    if (!btn || !menu) return;

    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');

        const top = parseInt(btn.style.top || 0);
        const left = parseInt(btn.style.left || 0);
        menu.style.top = `${top}px`;
        menu.style.left = `${left + 36}px`;
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
    }
}

function handleFloatingAction(action) {
    const menu = document.getElementById('floating-menu');
    if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
    }

    if (currentFloatingNode) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(currentFloatingNode);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    switch (action) {
        case 'image':
            saveRange();
            document.getElementById('image-upload').click();
            break;
        case 'divider':
            insertDivider();
            break;
        case 'table':
            openTableModal();
            break;
        case 'flowchart':
            openFlowchartModal();
            break;
        case 'character':
            insertCharacterSheet();
            break;
        case 'snippet':
            openSnippetManageModal();
            break;
        case 'spot':
            insertTRPGBox('spot');
            break;
        case 'listen':
            insertTRPGBox('listen');
            break;
        case 'library':
            insertTRPGBox('library');
            break;
        case 'san':
            insertTRPGBox('san');
            break;
        case 'kp':
            insertKPInfo();
            break;
        case 'enemy':
            insertSpecialBox('エネミー');
            break;
        case 'gimmick':
            insertTRPGBox('gimmick');
            break;
    }
}

document.addEventListener('click', (e) => {
    const btn = document.getElementById('floating-plus-btn');
    const menu = document.getElementById('floating-menu');
    if (!btn || !menu) return;

    if (!btn.contains(e.target) && !menu.contains(e.target)) {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        }
    }
});

editor.addEventListener('keyup', updateFloatingMenuPosition);
editor.addEventListener('mouseup', updateFloatingMenuPosition);
editor.addEventListener('focus', updateFloatingMenuPosition);
editor.addEventListener('input', updateFloatingMenuPosition);

/* --- カラーパレットの保存・復元 --- */
function loadColorPalette() {
    const paletteStr = localStorage.getItem('weby_recent_colors');
    const colors = paletteStr ? JSON.parse(paletteStr) : ['#ff0000', '#0000ff', '#008000', '#ffff00', '#ffa500', '#800080', '#000000', '#ffffff'];
    updateColorPaletteUI(colors);
}

function saveColorToPalette(color) {
    if (!color) return;
    const paletteStr = localStorage.getItem('weby_recent_colors');
    let colors = paletteStr ? JSON.parse(paletteStr) : [];

    colors = colors.filter(c => c.toLowerCase() !== color.toLowerCase());
    colors.unshift(color);

    if (colors.length > 20) {
        colors = colors.slice(0, 20);
    }

    localStorage.setItem('weby_recent_colors', JSON.stringify(colors));
    updateColorPaletteUI(colors);
}

function updateColorPaletteUI(colors) {
    const datalist = document.getElementById('color-palette');
    if (!datalist) return;
    datalist.innerHTML = '';
    colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        datalist.appendChild(option);
    });
}

window.addEventListener('load', loadColorPalette);

/* --- ポモドーロタイマー機能 --- */
let pomodoroTimer = null;
let pomodoroTimeRemaining = 25 * 60;
let isPomodoroWorking = true;
let isPomodoroRunning = false;

function togglePomodoroVisibility() {
    const pTimer = document.getElementById('pomodoro-timer');
    if (pTimer) {
        if (pTimer.style.display === 'none') {
            pTimer.style.display = 'block';
        } else {
            pTimer.style.display = 'none';
        }
    }
}

function togglePomodoroSettings() {
    const settings = document.getElementById('pomodoro-settings');
    if (settings) {
        settings.classList.toggle('hidden');
    }
}

function updatePomodoroDisplay() {
    const min = Math.floor(pomodoroTimeRemaining / 60);
    const sec = pomodoroTimeRemaining % 60;
    const display = document.getElementById('pomodoro-time-display');
    if (display) {
        display.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
}

function playBeep() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.log("Audio API not supported");
    }
}

function updatePomodoroSettings() {
    if (isPomodoroRunning) return;
    const workMin = parseInt(document.getElementById('pomo-work-time').value) || 25;
    const breakMin = parseInt(document.getElementById('pomo-break-time').value) || 5;
    pomodoroTimeRemaining = (isPomodoroWorking ? workMin : breakMin) * 60;
    updatePomodoroDisplay();
}

function startPomodoro() {
    if (isPomodoroRunning) return;
    isPomodoroRunning = true;
    document.getElementById('pomodoro-start-btn').classList.add('hidden');
    document.getElementById('pomodoro-pause-btn').classList.remove('hidden');

    pomodoroTimer = setInterval(() => {
        pomodoroTimeRemaining--;
        if (pomodoroTimeRemaining <= 0) {
            playBeep();
            isPomodoroWorking = !isPomodoroWorking;
            const workMin = parseInt(document.getElementById('pomo-work-time').value) || 25;
            const breakMin = parseInt(document.getElementById('pomo-break-time').value) || 5;
            pomodoroTimeRemaining = (isPomodoroWorking ? workMin : breakMin) * 60;
            const statusEl = document.getElementById('pomodoro-status');
            if (statusEl) {
                statusEl.textContent = isPomodoroWorking ? "作業中" : "休憩中";
                statusEl.className = isPomodoroWorking ? "text-xs text-rose-500 font-bold mt-1" : "text-xs text-emerald-500 font-bold mt-1";
            }
        }
        updatePomodoroDisplay();
    }, 1000);
}

function pausePomodoro() {
    if (!isPomodoroRunning) return;
    isPomodoroRunning = false;
    clearInterval(pomodoroTimer);
    document.getElementById('pomodoro-start-btn').classList.remove('hidden');
    document.getElementById('pomodoro-pause-btn').classList.add('hidden');
}

function resetPomodoro() {
    pausePomodoro();
    isPomodoroWorking = true;
    const statusEl = document.getElementById('pomodoro-status');
    if (statusEl) {
        statusEl.textContent = "作業中";
        statusEl.className = "text-xs text-slate-500 font-bold mt-1";
    }
    updatePomodoroSettings();
}

// Drag functionality for Pomodoro Timer
document.addEventListener('DOMContentLoaded', () => {
    const pTimer = document.getElementById('pomodoro-timer');
    if (!pTimer) return;
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    pTimer.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return;
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === pTimer || pTimer.contains(e.target)) {
            isDragging = true;
        }
    }
    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            pTimer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }
});

// ==========================================
// TRPG枠のドラッグ＆ドロップ処理
// ==========================================
let currentDraggedBox = null;

document.addEventListener('dragstart', (e) => {
    const box = e.target.closest('.box-wrapper');
    if (box && box.getAttribute('draggable') === 'true') {
        currentDraggedBox = box;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', 'box');
        setTimeout(() => box.style.opacity = '0.5', 0);
    }
});

document.addEventListener('dragend', (e) => {
    if (currentDraggedBox) {
        currentDraggedBox.style.opacity = '1';
        currentDraggedBox = null;
    }
});

const editorArea = document.getElementById('editor');
if (editorArea) {
    editorArea.addEventListener('dragover', (e) => {
        if (currentDraggedBox) {
            e.preventDefault(); // ドロップを許可
            e.dataTransfer.dropEffect = 'move';
        }
    });

    editorArea.addEventListener('drop', (e) => {
        if (currentDraggedBox) {
            e.preventDefault();

            let range;
            if (document.caretRangeFromPoint) {
                range = document.caretRangeFromPoint(e.clientX, e.clientY);
            } else if (e.rangeParent) {
                range = document.createRange();
                range.setStart(e.rangeParent, e.rangeOffset);
            }

            if (range) {
                // 自分自身の中へのドロップを防止
                let node = range.startContainer;
                while (node) {
                    if (node === currentDraggedBox) return;
                    node = node.parentNode;
                }

                // ドロップ位置に挿入
                range.insertNode(currentDraggedBox);

                // 挿入後に改行（空パラグラフ）を挟むことで、続けて文字を入力しやすくする
                const p = document.createElement('p');
                p.innerHTML = '<br>';
                currentDraggedBox.parentNode.insertBefore(p, currentDraggedBox.nextSibling);

                updateTOC();
                autoUpdateUI();
            }

            currentDraggedBox.style.opacity = '1';
            currentDraggedBox = null;
        }
    });
}

/* ==========================================================================
   セショサポ (PdfEasyConverter) .pec エクスポート機能
   ========================================================================== */

const pecCardColors = [
    { id: "slate", name: "カラーなし (標準)", bg: "#94a3b8" },
    { id: "red", name: "赤 (red)", bg: "#ef4444" },
    { id: "orange", name: "オレンジ (orange)", bg: "#f97316" },
    { id: "amber", name: "黄 (amber)", bg: "#f59e0b" },
    { id: "green", name: "緑 (green)", bg: "#22c55e" },
    { id: "teal", name: "青緑 (teal)", bg: "#14b8a6" },
    { id: "blue", name: "青 (blue)", bg: "#3b82f6" },
    { id: "indigo", name: "藍色 (indigo)", bg: "#6366f1" },
    { id: "purple", name: "紫 (purple)", bg: "#a855f7" },
    { id: "pink", name: "ピンク (pink)", bg: "#ec4899" }
];

const PEC_SETTINGS_VERSION = 2;

const defaultPecSettings = {
    _version: PEC_SETTINGS_VERSION,
    types: {
        kp: { label: "KP情報", tab: "KP", color: "slate", speaker: "" },
        secret: { label: "秘匿描写 (通常)", tab: "秘匿", color: "purple", speaker: "" },
        ho1: { label: "HO1 (秘匿/個別)", tab: "HO1", color: "orange", speaker: "" },
        ho2: { label: "HO2 (秘匿/個別)", tab: "HO2", color: "amber", speaker: "" },
        ho3: { label: "HO3 (秘匿/個別)", tab: "HO3", color: "green", speaker: "" },
        ho4: { label: "HO4 (秘匿/個別)", tab: "HO4", color: "teal", speaker: "" },
        info: { label: "情報・探索・概要", tab: "情報", color: "green", speaker: "" },
        check: { label: "判定・チェック", tab: "判定", color: "teal", speaker: "" },
        speech: { label: "会話・セリフ", tab: "メイン", color: "slate", speaker: "" },
        narrative: { label: "描写・地の文", tab: "", color: "slate", speaker: "" },
        heading: { label: "見出し (目次)", tab: "", color: "slate", speaker: "" },
        enemy: { label: "エネミー・敵", tab: "エネミー", color: "red", speaker: "" },
        notice: { label: "諸注意・許諾", tab: "注意", color: "amber", speaker: "" }
    },
    extractSpeakers: true,
    stripSpeakerPrefix: true,
    defaultKpSpeaker: "",
    splitParagraphs: true,
    splitDialogues: true,
    includeBoxHeader: true,
    tocHeadings: true
};

// HO番号・名前を抽出するヘルパー（例: 【HO1：秘匿描写】 / ■ {HO1}秘匿 -> "HO1"）
function extractHoName(text) {
    if (!text) return null;
    const firstLine = text.split('\n')[0] || text;
    const m = firstLine.match(/(?:【|■|[\(\{\[（『]?)\s*(HO\s*[\d０-９A-Za-z]+)\s*(?:[：:\s】\)\}\]）』]|$)/i) ||
        firstLine.match(/\b(HO\s*[\d０-９A-Za-z]+)\b/i) ||
        text.match(/(?:【|■)\s*[\(\{（]?\s*(HO\s*[\d０-９A-Za-z]+)/i);
    if (!m) return null;
    let hoRaw = m[1].replace(/\s+/g, '');
    hoRaw = hoRaw.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    hoRaw = hoRaw.replace(/[Ａ-Ｚａ-ｚ]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    return hoRaw.toUpperCase();
}

// HO名から対応するタブ名とカラーを決定
function resolveHoTabAndColor(hoName, settings) {
    const hoKey = hoName.toLowerCase();
    const customSetting = settings.types[hoKey];
    const tab = customSetting?.tab || hoName;
    let color = customSetting?.color;
    if (!color) {
        if (hoName === "HO1") color = "orange";
        else if (hoName === "HO2") color = "amber";
        else if (hoName === "HO3") color = "green";
        else if (hoName === "HO4") color = "teal";
        else color = settings.types.secret?.color || "purple";
    }
    return { tab, color };
}

function getPecSettings() {
    try {
        const raw = localStorage.getItem('kakerukun_pec_export_settings');
        if (raw) {
            const parsed = JSON.parse(raw);
            // バージョンが異なる場合は新しい初期設定にリセットして適用
            if (parsed._version !== PEC_SETTINGS_VERSION) {
                localStorage.removeItem('kakerukun_pec_export_settings');
                return JSON.parse(JSON.stringify(defaultPecSettings));
            }
            return {
                ...defaultPecSettings,
                ...parsed,
                types: {
                    ...defaultPecSettings.types,
                    ...(parsed.types || {})
                }
            };
        }
    } catch (e) {
        console.warn('getPecSettings parse error:', e);
    }
    return JSON.parse(JSON.stringify(defaultPecSettings));
}

function savePecSettings(settings) {
    try {
        settings._version = PEC_SETTINGS_VERSION;
        localStorage.setItem('kakerukun_pec_export_settings', JSON.stringify(settings));
    } catch (e) {
        console.warn('savePecSettings error:', e);
    }
}

function resetPecExportSettings() {
    if (!confirm("PEC出力設定を初期値に戻しますか？")) return;
    localStorage.removeItem('kakerukun_pec_export_settings');
    renderPecSettingsUI();
    showToast("出力設定を初期値に戻しました");
}

function renderPecSettingsUI() {
    const settings = getPecSettings();
    const container = document.getElementById('pec-type-settings-list');
    if (!container) return;

    let html = '';
    const colorOptionsHtml = (selectedId) => {
        return pecCardColors.map(c => `
            <option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.name}</option>
        `).join('');
    };

    for (const [key, typeInfo] of Object.entries(settings.types)) {
        const badgeColor = pecCardColors.find(c => c.id === typeInfo.color)?.bg || '#94a3b8';
        html += `
            <div class="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded border border-slate-200">
                <div class="col-span-4 font-bold text-slate-700 flex items-center gap-1.5 truncate">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0 border border-slate-300" style="background-color: ${badgeColor};"></span>
                    <span title="${typeInfo.label}">${typeInfo.label}</span>
                </div>
                <div class="col-span-4">
                    <input type="text" id="pec-tab-${key}" value="${typeInfo.tab || ''}" placeholder="(未指定・全体)" class="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-teal-500 font-bold">
                </div>
                <div class="col-span-4">
                    <select id="pec-color-${key}" onchange="this.closest('.grid').querySelector('.rounded-full').style.backgroundColor = pecCardColors.find(c => c.id === this.value)?.bg || '#94a3b8';" class="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-teal-500 font-bold">
                        ${colorOptionsHtml(typeInfo.color)}
                    </select>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;

    // チェックボックス・テキスト値の反映
    const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.value = val !== undefined ? val : ''; };

    setCheck('pec-extract-speakers', settings.extractSpeakers);
    setCheck('pec-strip-speaker-prefix', settings.stripSpeakerPrefix);
    setText('pec-default-kp-speaker', settings.defaultKpSpeaker || '');
    setCheck('pec-split-paragraphs', settings.splitParagraphs);
    setCheck('pec-split-dialogues', settings.splitDialogues);
    setCheck('pec-include-box-header', settings.includeBoxHeader);
    setCheck('pec-toc-headings', settings.tocHeadings);
}

function openPecExportModal() {
    renderPecSettingsUI();
    openModal('pec-export-modal');
}

function collectPecSettingsFromUI() {
    const current = getPecSettings();
    const updatedTypes = {};

    for (const key of Object.keys(current.types)) {
        const tabEl = document.getElementById(`pec-tab-${key}`);
        const colorEl = document.getElementById(`pec-color-${key}`);
        updatedTypes[key] = {
            ...current.types[key],
            tab: tabEl ? tabEl.value.trim() : current.types[key].tab,
            color: colorEl ? colorEl.value : current.types[key].color
        };
    }

    const getVal = (id, defaultVal) => {
        const el = document.getElementById(id);
        if (!el) return defaultVal;
        return el.type === 'checkbox' ? el.checked : el.value;
    };

    const newSettings = {
        types: updatedTypes,
        extractSpeakers: getVal('pec-extract-speakers', true),
        stripSpeakerPrefix: getVal('pec-strip-speaker-prefix', true),
        defaultKpSpeaker: (document.getElementById('pec-default-kp-speaker')?.value || '').trim(),
        splitParagraphs: getVal('pec-split-paragraphs', true),
        splitDialogues: getVal('pec-split-dialogues', true),
        includeBoxHeader: getVal('pec-include-box-header', true),
        tocHeadings: getVal('pec-toc-headings', true)
    };

    savePecSettings(newSettings);
    return newSettings;
}

// ボックス要素からプレーンテキストを抽出
function extractBoxPlainText(el, includeHeader = true) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.drag-handle, .no-print, .flowchart-actions, script, style').forEach(x => x.remove());

    // ヘッダー除外の場合
    if (!includeHeader) {
        const strongHeader = clone.querySelector('strong');
        if (strongHeader && /^[【■]/.test(strongHeader.innerText.trim())) {
            strongHeader.remove();
        }
    }

    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    clone.querySelectorAll('p, div, li, tr').forEach(block => {
        block.appendChild(document.createTextNode('\n'));
    });

    return clone.textContent
        .split('\n')
        .map(l => l.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// 一般ブロック（p, div 等）からテキストを抽出
function extractBlockPlainText(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.drag-handle, .no-print, script, style').forEach(x => x.remove());
    clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    clone.querySelectorAll('p, div, li, tr').forEach(block => {
        block.appendChild(document.createTextNode('\n'));
    });
    return clone.textContent
        .split('\n')
        .map(l => l.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// エネミー情報等の簡易NPCパーサー
function parseNpcFromBoxText(text, defaultName = "") {
    if (!text) return null;
    let name = defaultName;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const l of lines) {
        const nameMatch = l.match(/^(?:名前|NAME)[：:]\s*(.+)$/i);
        if (nameMatch) {
            name = nameMatch[1].trim();
            break;
        }
        if (/^■\s*エネミー/i.test(l)) continue;
        if (!/^(STR|CON|POW|DEX|APP|SIZ|INT|EDU|HP|MP|SAN|技能|能力値|攻撃|装甲|耐久力)/i.test(l)) {
            if (!name) name = l.replace(/^[【\[「『(（](.*?)[】\]」』)）]$/, "$1").trim();
        }
    }

    return {
        version: "6",
        name: name || "エネミー",
        ho: "",
        furigana: "",
        rawCardText: text.trim(),
        abilities: {},
        resources: {},
        basicChecks: {},
        skills: [],
        customCommands: "",
        memo: text.trim()
    };
}

// セショサポ用PECデータ構築
function generatePecData(settings) {
    const title = (titleInput && titleInput.value.trim()) || "無題のシナリオ";

    // セクションモード判定
    let sourceHtml = "";
    if (isSectionMode && Array.isArray(sectionsData) && sectionsData.length > 0) {
        if (currentSectionIndex >= 0 && sectionsData[currentSectionIndex]) {
            sectionsData[currentSectionIndex].content = editor.innerHTML;
        }
        sourceHtml = sectionsData.map(sec => sec.content || "").join('\n');
    }
    if (!sourceHtml || !sourceHtml.trim()) {
        sourceHtml = editor.innerHTML;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sourceHtml;
    tempDiv.querySelectorAll('.drag-handle, .drag-handle-container, .no-print, script, style').forEach(el => el.remove());

    const items = [];
    const npcs = [];
    let itemId = 0;
    let currentPage = 1;
    const detectedSpeakers = new Set();
    if (settings.defaultKpSpeaker) {
        detectedSpeakers.add(settings.defaultKpSpeaker);
    }

    // 1行から発言者とセリフを判定する正規表現
    // パターン1: KP「こんにちは」 / 【KP】「こんにちは」 / 執事:「こんにちは」
    const speechPattern1 = /^(?:【([^】\n]+)】|([^\s\n:：【】「」『』]{1,16})[ \t]*[:：]?)[ \t]*([「『][\s\S]*?[」』])$/;
    // パターン2: 執事: こんにちは
    const speechPattern2 = /^([^\s\n:：【】「」『』]{1,16})[ \t]*[:：][ \t]+(.+)$/;
    // パターン3: 「こんにちは」 (発言者未設定)
    const speechPattern3 = /^[「『]([\s\S]*?)[」』]$/;

    function createCard(text, typeKey, overrideSpeaker = null, isToc = false, tocLevel = 1, tocName = "") {
        const trimmed = (text || "").trim();
        if (!trimmed && !isToc) return;

        const typeInfo = settings.types[typeKey] || { tab: "", color: "slate", speaker: "" };
        const tab = typeInfo.tab || "";
        const color = typeInfo.color || "slate";
        const speaker = overrideSpeaker !== null ? overrideSpeaker : (typeInfo.speaker || "");

        if (speaker) detectedSpeakers.add(speaker);

        items.push({
            id: itemId++,
            original: trimmed,
            text: trimmed,
            bookmarked: false,
            note: "",
            page: currentPage,
            furiganaHtml: undefined,
            color: color,
            tabName: tab,
            charName: speaker,
            isCommand: false,
            isToc: !!isToc,
            tocLevel: isToc ? tocLevel : 1,
            tocName: isToc ? (tocName || trimmed) : "",
            isCollapsed: false,
            isCopied: false
        });
    }

    function createCardExplicit(text, tab, color, speaker = "", isToc = false, tocLevel = 1, tocName = "") {
        const trimmed = (text || "").trim();
        if (!trimmed && !isToc) return;
        if (speaker) detectedSpeakers.add(speaker);

        items.push({
            id: itemId++,
            original: trimmed,
            text: trimmed,
            bookmarked: false,
            note: "",
            page: currentPage,
            furiganaHtml: undefined,
            color: color || "slate",
            tabName: tab || "",
            charName: speaker || "",
            isCommand: false,
            isToc: !!isToc,
            tocLevel: isToc ? tocLevel : 1,
            tocName: isToc ? (tocName || trimmed) : "",
            isCollapsed: false,
            isCopied: false
        });
    }

    // ボックス内のテキストを、そのボックスのタブ・カラーを固定（ロック）してカード化
    // ※ 秘匿枠やHO枠内のセリフであってもメインタブにならず、その秘匿タブ（HO1等）とカラーを厳格に保持する
    function processBoxParagraphs(boxText, targetTab, targetColor, defaultSpeaker = "KP") {
        if (!boxText || !boxText.trim()) return;

        if (!settings.splitDialogues) {
            let speaker = defaultSpeaker;
            let text = boxText.trim();
            if (settings.extractSpeakers) {
                const m1 = text.match(speechPattern1);
                if (m1) {
                    speaker = (m1[1] || m1[2] || "").trim();
                    if (settings.stripSpeakerPrefix) text = m1[3].trim();
                }
            }
            createCardExplicit(text, targetTab, targetColor, speaker);
            return;
        }

        const lines = boxText.split('\n');
        let narrativeBuffer = [];

        function flushNarrative() {
            if (narrativeBuffer.length === 0) return;
            const combined = narrativeBuffer.join('\n').trim();
            if (combined) {
                createCardExplicit(combined, targetTab, targetColor, defaultSpeaker);
            }
            narrativeBuffer = [];
        }

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }

            let matchedSpeaker = null;
            let speechContent = null;

            const m1 = line.match(speechPattern1);
            if (m1 && settings.extractSpeakers) {
                matchedSpeaker = (m1[1] || m1[2] || "").trim();
                speechContent = settings.stripSpeakerPrefix ? m1[3] : line;
            } else {
                const m2 = line.match(speechPattern2);
                if (m2 && settings.extractSpeakers) {
                    matchedSpeaker = m2[1].trim();
                    speechContent = settings.stripSpeakerPrefix ? m2[2] : line;
                } else if (speechPattern3.test(line)) {
                    matchedSpeaker = defaultSpeaker || "";
                    speechContent = line;
                }
            }

            if (speechContent !== null) {
                flushNarrative();
                let combinedSpeech = speechContent;
                if (/^[「『]/.test(speechContent) && !/[」』]$/.test(speechContent)) {
                    while (i + 1 < lines.length) {
                        i++;
                        const nextLine = lines[i].trim();
                        combinedSpeech += '\n' + nextLine;
                        if (/[」』]$/.test(nextLine)) break;
                    }
                }
                // ★超重要：セリフであってもタブ・カラーは秘匿枠(targetTab/targetColor)のまま出力！
                createCardExplicit(combinedSpeech, targetTab, targetColor, matchedSpeaker || defaultSpeaker);
            } else {
                narrativeBuffer.push(line);
            }
            i++;
        }
        flushNarrative();
    }

    // 段落テキストをセリフ/地の文に分解してカード化（見出しのHO指定があれば自動継承）
    function processTextParagraph(paragraphText, activeHo = null) {
        if (!paragraphText || !paragraphText.trim()) return;

        let targetTab = null;
        let targetColor = null;
        if (activeHo) {
            const res = resolveHoTabAndColor(activeHo, settings);
            targetTab = res.tab;
            targetColor = res.color;
        }

        if (!settings.splitDialogues) {
            // セリフ分解を行わない場合
            let speaker = "";
            let text = paragraphText.trim();
            if (settings.extractSpeakers) {
                const m1 = text.match(speechPattern1);
                if (m1) {
                    speaker = (m1[1] || m1[2] || "").trim();
                    if (settings.stripSpeakerPrefix) text = m1[3].trim();
                }
            }
            const isSpeech = /^「|『/.test(text) || !!speaker;
            if (activeHo) {
                createCardExplicit(text, targetTab, targetColor, speaker || (isSpeech ? "" : settings.defaultKpSpeaker));
            } else {
                createCard(text, isSpeech ? 'speech' : 'narrative', speaker || (isSpeech ? "" : settings.defaultKpSpeaker));
            }
            return;
        }

        // 行ごとにセリフと地の文を判別
        const lines = paragraphText.split('\n');
        let narrativeBuffer = [];

        function flushNarrative() {
            if (narrativeBuffer.length === 0) return;
            const combined = narrativeBuffer.join('\n').trim();
            if (combined) {
                if (activeHo) {
                    createCardExplicit(combined, targetTab, targetColor, settings.defaultKpSpeaker || "");
                } else {
                    createCard(combined, 'narrative', settings.defaultKpSpeaker || "");
                }
            }
            narrativeBuffer = [];
        }

        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();
            if (!line) {
                i++;
                continue;
            }

            // セリフ行の判定
            let matchedSpeaker = null;
            let speechContent = null;

            const m1 = line.match(speechPattern1);
            if (m1 && settings.extractSpeakers) {
                matchedSpeaker = (m1[1] || m1[2] || "").trim();
                speechContent = settings.stripSpeakerPrefix ? m1[3] : line;
            } else {
                const m2 = line.match(speechPattern2);
                if (m2 && settings.extractSpeakers) {
                    matchedSpeaker = m2[1].trim();
                    speechContent = settings.stripSpeakerPrefix ? m2[2] : line;
                } else if (speechPattern3.test(line)) {
                    matchedSpeaker = "";
                    speechContent = line;
                }
            }

            if (speechContent !== null) {
                flushNarrative();
                // 複数行にわたるセリフ（閉じ括弧が同一行にない場合）の結合
                let combinedSpeech = speechContent;
                if (/^[「『]/.test(speechContent) && !/[」』]$/.test(speechContent)) {
                    while (i + 1 < lines.length) {
                        i++;
                        const nextLine = lines[i].trim();
                        combinedSpeech += '\n' + nextLine;
                        if (/[」』]$/.test(nextLine)) break;
                    }
                }
                if (activeHo) {
                    createCardExplicit(combinedSpeech, targetTab, targetColor, matchedSpeaker);
                } else {
                    createCard(combinedSpeech, 'speech', matchedSpeaker);
                }
            } else {
                narrativeBuffer.push(line);
            }
            i++;
        }
        flushNarrative();
    }

    // DOMツリーの子要素を走査（段落バッファリングにより、空行のない連続した行を1つのカードに結合）
    let paragraphBuffer = [];
    let currentSectionHo = null;

    function flushParagraphBuffer() {
        if (paragraphBuffer.length === 0) return;
        const fullParagraph = paragraphBuffer.join('\n').trim();
        paragraphBuffer = [];
        if (fullParagraph) {
            processTextParagraph(fullParagraph, currentSectionHo);
        }
    }

    const children = Array.from(tempDiv.childNodes);
    for (const node of children) {
        if (node.nodeType === Node.COMMENT_NODE) continue;
        if (node.nodeType === Node.TEXT_NODE) {
            const txt = node.textContent.trim();
            if (txt) {
                if (settings.splitParagraphs) {
                    paragraphBuffer.push(txt);
                } else {
                    paragraphBuffer.push(txt);
                }
            }
            continue;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const el = node;

        // 改ページ判定
        if (el.classList.contains('page-break')) {
            flushParagraphBuffer();
            currentPage++;
            continue;
        }

        // 見出し判定
        const tagName = el.tagName.toUpperCase();
        const isHTag = /^H[1-6]$/.test(tagName);
        const isDivH = el.classList.contains('h7') || el.classList.contains('div_h7') ||
            el.classList.contains('h8') || el.classList.contains('div_h8');

        if (isHTag || isDivH) {
            flushParagraphBuffer();
            const hText = el.innerText.trim();
            if (hText) {
                let level = 1;
                if (isHTag) level = parseInt(tagName.substring(1), 10);
                else level = 6;

                // 見出し内に HO 指定（例: ■ {HO1}秘匿, ■ (HO2)など）があるか確認
                const headingHo = extractHoName(hText);
                if (headingHo) {
                    currentSectionHo = headingHo;
                } else {
                    // HO指定がない汎用見出しならセクションHOをリセット
                    currentSectionHo = null;
                }

                if (currentSectionHo) {
                    const { tab: hoTab, color: hoColor } = resolveHoTabAndColor(currentSectionHo, settings);
                    createCardExplicit(hText, hoTab, hoColor, "", settings.tocHeadings, level, hText);
                } else {
                    createCard(hText, 'heading', "", settings.tocHeadings, level, hText);
                }
            }
            continue;
        }

        // ボックス判定
        let boxContentEl = null;
        if (el.classList.contains('box-wrapper')) {
            boxContentEl = el.querySelector('.kp-info, .box-secret, .box-summary, .box-check, .box-spot, .box-listen, .box-library, .box-san, .box-search, .box-gimmick, .box-tendency, .box-special, .box-custom-snippet, .quote, .box-custom');
        } else if (el.matches && el.matches('.kp-info, .box-secret, .box-summary, .box-check, .box-spot, .box-listen, .box-library, .box-san, .box-search, .box-gimmick, .box-tendency, .box-special, .box-custom-snippet, .quote, .box-custom')) {
            boxContentEl = el;
        }

        if (boxContentEl) {
            flushParagraphBuffer();
            const rawBoxText = extractBoxPlainText(boxContentEl, settings.includeBoxHeader);
            if (!rawBoxText) continue;

            const hoName = extractHoName(rawBoxText);

            if (boxContentEl.classList.contains('kp-info')) {
                const kpTab = settings.types.kp?.tab || "KP";
                const kpColor = settings.types.kp?.color || "amber";
                processBoxParagraphs(rawBoxText, kpTab, kpColor, settings.defaultKpSpeaker || "KP");
            } else if (boxContentEl.classList.contains('box-secret')) {
                if (hoName) {
                    const { tab, color } = resolveHoTabAndColor(hoName, settings);
                    processBoxParagraphs(rawBoxText, tab, color, settings.defaultKpSpeaker || "KP");
                } else {
                    const secTab = settings.types.secret?.tab || "秘匿";
                    const secColor = settings.types.secret?.color || "purple";
                    processBoxParagraphs(rawBoxText, secTab, secColor, settings.defaultKpSpeaker || "KP");
                }
            } else if (boxContentEl.classList.contains('box-summary')) {
                processBoxParagraphs(rawBoxText, settings.types.info?.tab || "情報", settings.types.info?.color || "green", "");
            } else if (boxContentEl.matches('.box-check, .box-spot, .box-listen, .box-library, .box-san')) {
                processBoxParagraphs(rawBoxText, settings.types.check?.tab || "判定", settings.types.check?.color || "teal", "");
            } else if (boxContentEl.matches('.box-search, .box-gimmick, .box-tendency')) {
                processBoxParagraphs(rawBoxText, settings.types.info?.tab || "情報", settings.types.info?.color || "green", "");
            } else if (boxContentEl.classList.contains('box-special')) {
                const lower = rawBoxText.toLowerCase();
                if (rawBoxText.includes('エネミー') || lower.includes('str:') || lower.includes('con:')) {
                    processBoxParagraphs(rawBoxText, settings.types.enemy?.tab || "エネミー", settings.types.enemy?.color || "red", "");
                    const npcObj = parseNpcFromBoxText(rawBoxText);
                    if (npcObj) npcs.push(npcObj);
                } else if (rawBoxText.includes('諸注意') || rawBoxText.includes('注意')) {
                    processBoxParagraphs(rawBoxText, settings.types.notice?.tab || "注意", settings.types.notice?.color || "amber", "");
                } else if (rawBoxText.includes('HO') || hoName) {
                    if (hoName) {
                        const { tab, color } = resolveHoTabAndColor(hoName, settings);
                        processBoxParagraphs(rawBoxText, tab, color, settings.defaultKpSpeaker || "KP");
                    } else {
                        const secTab = settings.types.secret?.tab || "秘匿";
                        const secColor = settings.types.secret?.color || "purple";
                        processBoxParagraphs(rawBoxText, secTab, secColor, settings.defaultKpSpeaker || "KP");
                    }
                } else {
                    processBoxParagraphs(rawBoxText, settings.types.info?.tab || "情報", settings.types.info?.color || "green", "");
                }
            } else if (boxContentEl.classList.contains('box-custom-snippet')) {
                const label = boxContentEl.querySelector('strong')?.innerText || '';
                const snippetHo = extractHoName(label) || hoName;
                if (snippetHo) {
                    const { tab, color } = resolveHoTabAndColor(snippetHo, settings);
                    processBoxParagraphs(rawBoxText, tab, color, settings.defaultKpSpeaker || "KP");
                } else if (label.includes('KP')) {
                    processBoxParagraphs(rawBoxText, settings.types.kp?.tab || "KP", settings.types.kp?.color || "amber", settings.defaultKpSpeaker || "KP");
                } else if (label.includes('秘匿') || label.includes('HO')) {
                    processBoxParagraphs(rawBoxText, settings.types.secret?.tab || "秘匿", settings.types.secret?.color || "purple", settings.defaultKpSpeaker || "KP");
                } else {
                    processBoxParagraphs(rawBoxText, settings.types.info?.tab || "情報", settings.types.info?.color || "green", "");
                }
            } else if (boxContentEl.classList.contains('quote')) {
                processBoxParagraphs(rawBoxText, settings.types.narrative?.tab || "描写", settings.types.narrative?.color || "orange", settings.defaultKpSpeaker || "KP");
            } else {
                processBoxParagraphs(rawBoxText, settings.types.info?.tab || "情報", settings.types.info?.color || "green", "");
            }
            continue;
        }

        // 一般ブロック (p, div, blockquote, ul, ol 等)
        const blockText = extractBlockPlainText(el);
        if (!blockText) {
            // 空行（<p><br></p>等）に遭遇したら直前の段落をフラッシュしてカードを区切る
            flushParagraphBuffer();
            continue;
        }

        if (settings.splitParagraphs) {
            const paragraphs = blockText.split(/\n{2,}/);
            if (paragraphs.length > 1) {
                for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
                    const p = paragraphs[pIdx].trim();
                    if (pIdx > 0) flushParagraphBuffer();
                    if (p) paragraphBuffer.push(p);
                    if (pIdx < paragraphs.length - 1) flushParagraphBuffer();
                }
            } else {
                paragraphBuffer.push(blockText);
            }
        } else {
            paragraphBuffer.push(blockText);
        }
    }
    // 残りの段落バッファをフラッシュ
    flushParagraphBuffer();

    // tabColorMapping の構築（全使用タブに対応するカラーIDを設定）
    const tabColorMapping = {
        "": "slate",
        "メイン": "blue",
        "KP": "amber",
        "秘匿": "purple",
        "HO1": settings.types.ho1?.color || "orange",
        "HO2": settings.types.ho2?.color || "amber",
        "HO3": settings.types.ho3?.color || "green",
        "HO4": settings.types.ho4?.color || "teal",
        "情報": "green",
        "描写": "orange",
        "判定": "teal",
        "注意": "amber",
        "エネミー": "red"
    };

    for (const typeInfo of Object.values(settings.types)) {
        if (typeInfo.tab) {
            tabColorMapping[typeInfo.tab] = typeInfo.color;
        }
    }

    // items に含まれるすべてのタブ名も確実に網羅
    items.forEach(it => {
        if (it.tabName && !tabColorMapping[it.tabName]) {
            tabColorMapping[it.tabName] = it.color || "slate";
        }
    });

    const speakerList = Array.from(detectedSpeakers).filter(Boolean);
    if (!speakerList.includes("KP")) speakerList.unshift("KP");

    return {
        saveObj: {
            version: "1.1",
            fileName: title,
            savedAt: (new Date()).toISOString(),
            tabColorMapping: tabColorMapping,
            speakerNames: speakerList,
            items: items,
            characters: [],
            npcs: npcs,
            report: {
                scenario: title
            }
        },
        items: items,
        itemCount: items.length,
        npcCount: npcs.length,
        title: title
    };
}

// PECファイルの出力実行
function executePecExport() {
    const settings = collectPecSettingsFromUI();
    const result = generatePecData(settings);
    const items = result.items || result.saveObj?.items || [];

    if (!items || items.length === 0) {
        alert("出力するテキストが存在しません。エディタに本文を入力してください。");
        return;
    }

    let encoded = "";
    try {
        const jsonStr = JSON.stringify(result.saveObj);
        const bytes = new TextEncoder().encode(jsonStr);
        let binStr = "";
        const len = bytes.byteLength;
        const chunk = 8192;
        for (let i = 0; i < len; i += chunk) {
            binStr += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        encoded = btoa(binStr);
    } catch (err) {
        console.warn("Base64エンコードフォールバック使用:", err);
        encoded = btoa(unescape(encodeURIComponent(JSON.stringify(result.saveObj))));
    }

    const blob = new Blob([encoded], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = result.title.replace(/[\\/:*?"<>|]/g, "_");
    a.href = url;
    a.download = `${safeTitle}.pec`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    closeModal('pec-export-modal');
    showToast(`セショサポ用 .pec を出力しました（カード ${result.itemCount} 枚）`);
}

