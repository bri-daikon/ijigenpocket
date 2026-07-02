const editor = document.getElementById('editor');
const tocContainer = document.getElementById('toc-container');
const charCountDisplay = document.getElementById('char-count');
const saveStatus = document.getElementById('save-status');
const titleInput = document.getElementById('scenario-title');
const toast = document.getElementById('toast');
let savedSelectionRange = null;

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
        } catch(e) {
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

/* --- ヘルパー: 選択範囲のHTMLを取得して削除 --- */
function getSelectedHtmlAndRemove() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) return null; // 選択なし

        const clonedSelection = range.cloneContents();
        const div = document.createElement('div');
        div.appendChild(clonedSelection);
        const html = div.innerHTML;
        
        range.deleteContents();
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
                updateTOC(); 
                updateCharCount();
                updateEditorWidth();
                updatePageBreakGuides();
                renderAllMermaidCharts();
                saveStatus.textContent = "読み込み完了";
                saveStatus.classList.remove('text-amber-500');
                showToast("読み込みました");
            } catch(err) { alert('読み込み失敗: 正しいファイル形式ではありません。'); }
        };
        reader.readAsText(file);
    }
}

function confirmNewProject() {
    editor.innerHTML = '<p><br></p>';
    titleInput.value = '';
    closeModal('confirm-modal');
    updateTOC(); updateCharCount();
    saveStatus.textContent = "新規作成";
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
                const str = stats[0].value || '0';
                const con = stats[1].value || '0';
                const pow = stats[2].value || '0';
                const dex = stats[3].value || '0';
                const app = stats[4].value || '0';
                const siz = stats[5].value || '0';
                const int = stats[6].value || '0';
                const edu = stats[7].value || '0';
                const san = stats[8].value || '0';
                
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

function exportWord() {
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
    editor.focus(); 
    if (cmd === 'indent') return manualIndent(true);
    if (cmd === 'outdent') return manualIndent(false);
    document.execCommand(cmd, false, null); 
    updateTOC(); autoUpdateUI();
}

function execCommandWithParam(cmd, param) { editor.focus(); document.execCommand(cmd, false, param); autoUpdateUI(); }


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
        btn.textContent = h.textContent.trim() || `無題の見出し ${i+1}`;
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
    switch(type) {
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
    const html = `<div class="${className}" style="background-color:${borderColor}11; border-color:${borderColor}; color:${textColor}"><strong>【${label}】</strong><div class="mt-1">${content}</div></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertBorderBox() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容を入力...";
    const col = document.getElementById('bg-color-picker').value;
    const textColor = darkenColor(col, 0.4);
    const html = `<div class="box-custom" style="border-color:${col}; background-color:${col}22; color:${textColor}; border-width: 2px;">${content}</div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertKPInfo() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容...";
    const borderColor = "#fde047";
    const textColor = darkenColor(borderColor, 0.6);
    const html = `<div class="kp-info" style="background-color:${borderColor}22; border-color:${borderColor}; color:${textColor}; border-width: 2px;"><strong>【KP情報】</strong><div class="mt-1">${content}</div></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertQuote() {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    const content = selectedHtml || "内容...";
    const borderColor = "#94a3b8";
    const textColor = darkenColor(borderColor, 0.4);
    const html = `<div class="quote" style="background-color:${borderColor}22; border-color:${borderColor}; color:${textColor}; border-width: 2px;">${content}</div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
}

function insertSpecialBox(label) {
    editor.focus();
    const selectedHtml = getSelectedHtmlAndRemove();
    let defaultCol = "#64748b";
    let defaultContent = "詳細...";
    switch(label) {
        case '許諾': defaultCol = "#94a3b8"; defaultContent = `本作は、「株式会社アークライト」及び「株式会社KADOKAWA」が権利を有する『クトゥルフ神話TRPG』シリーズの二次創作物です。<br><br>Call of Cthulhu is copyright ©1981, 2015, 2019 by Chaosium Inc. ;all rights reserved. Arranged by Arclight Inc.<br>Call of Cthulhu is a registered trademark of Chaosium Inc.<br>PUBLISHED BY KADOKAWA CORPORATION　「クトゥルフ神話TRPG」「新クトゥルフ神話TRPG」`; break;
        case '諸注意': defaultCol = "#f59e0b"; defaultContent = `・本シナリオには以下の要素が含まれます：<br>・ロストの可能性：あり<br>・PvPの可能性：あり`; break;
        case 'HO': defaultCol = "#6366f1"; defaultContent = `公開HO：<br>貴方は……である。`; break;
        case 'エネミー': defaultCol = "#ef4444"; defaultContent = `名前：<br>STR: / CON: / SIZ: / DEX: / POW: / INT: / EDU: / APP:<br>耐久力: / マジックポイント:<br>ダメージボーナス: / ビルド: / 移動: <br>攻撃：<br>装甲：<br>技能：`; break;
        case 'クレジット': defaultCol = "#64748b"; defaultContent = `著者：<br>協力：<br>画像：`; break;
    }
    const content = selectedHtml || defaultContent;
    const textColor = darkenColor(defaultCol, 0.5);
    const html = `<div class="box-special" style="border-top-color:${defaultCol}; background-color:${defaultCol}22; color:${textColor}"><strong>■ ${label}</strong><div class="mt-2 text-sm">${content}</div></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    updateTOC(); autoUpdateUI();
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


function updateTOC() {
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
    updateTOC(); updateCharCount(); updateEditorWidth(); updatePageBreakGuides(); renderAllMermaidCharts();
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
    
    const html = `<div class="box-custom-snippet" data-snippet-id="${snippet.id}" style="border-color:${col}; background-color:${col}11; color:${textColor}; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border-width: 2px; border-style: solid; clear: both; break-inside: avoid;"><strong>【${snippet.label}】</strong><div class="mt-1">${content}</div></div><p><br></p>`;
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
        } catch(e) {
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
                    <span class="block text-xs font-bold text-slate-400 mb-1">能力値 (STR, CON, POW, DEX, APP, SIZ, INT, EDU, SAN)</span>
                    <div class="char-stats-grid grid grid-cols-9 gap-1.5 text-center" style="display: grid !important; grid-template-columns: repeat(9, minmax(0, 1fr)) !important;">
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">STR</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">CON</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">POW</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">DEX</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">APP</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">SIZ</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">INT</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">EDU</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
                        <div class="bg-slate-50 border border-slate-200 rounded p-1">
                            <div class="text-[9px] font-bold text-slate-500">SAN</div>
                            <input type="number" value="50" class="char-stat-input text-center font-bold text-xs w-full bg-transparent outline-none" oninput="this.setAttribute('value', this.value); autoUpdateUI();">
                        </div>
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
    const str = stats[0].value || '0';
    const con = stats[1].value || '0';
    const pow = stats[2].value || '0';
    const dex = stats[3].value || '0';
    const app = stats[4].value || '0';
    const siz = stats[5].value || '0';
    const int = stats[6].value || '0';
    const edu = stats[7].value || '0';
    const san = stats[8].value || '0';
    
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
    
    switch(action) {
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
