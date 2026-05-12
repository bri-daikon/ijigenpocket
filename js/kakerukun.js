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
function toggleToolbar() { document.getElementById('toolbar-wrapper').classList.toggle('collapsed'); }
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
    saveStatus.textContent = "変更あり（未保存）";
    saveStatus.classList.add('text-amber-500');
}

// 保存を実行
function executeDirectSave() {
    const title = titleInput.value.trim() || 'シナリオ';
    const content = { title, content: editor.innerHTML };
    const jsonStr = JSON.stringify(content, null, 2);
    
    saveStatus.textContent = "保存ダイアログを確認中...";
    saveStatus.classList.remove('text-amber-500');

    try {
        localStorage.setItem('weby_autosave', editor.innerHTML); 
        localStorage.setItem('weby_autosave_title', titleInput.value);
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
                updateTOC(); 
                updateCharCount();
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
    
    // ページ分割ロジック
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;
    const nodes = Array.from(tempDiv.childNodes);

    let pagesHtml = '', currentPageContent = '', currentLineCount = 0, pageNum = 1;
    // 文字サイズに合わせて1ページあたりの収容行数を調整
    const MAX_LINES = 40; 
   
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
        let weight = 1; // 基本1行分
        if (node.nodeType === 1) { // Element node
            const tag = node.tagName;
            const text = node.innerText || "";

            const fontSize = parseInt(window.getComputedStyle(node).fontSize) || 16;
            const sizeRatio = fontSize / 16;

            // 段組みに合わせて1行あたりの文字数を緩和して計算
            const textLines = Math.ceil(text.length / (layout === '2' ? 35 : 70)) || 1;
            
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
        if (currentLineCount + weight > MAX_LINES && currentPageContent !== '') {
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
        body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.8; color: var(--text-main); margin: 0; padding: 0; background-color: var(--bg-body); display: flex; scroll-behavior: smooth; }
        
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
        p { margin-bottom: 0.8rem; }
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
        
        .kp-info, .quote, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special { padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; border: 1px solid transparent; clear: both; break-inside: avoid; }
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
        }
    `;
    const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${exportStyles}</style>
</head>
<body>
    <aside>
        <div class="toc-title">📋 目次</div>
        ${tocHtml}
    </aside>
    <main>
        ${pagesHtml}
    </main>
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
    const content = editor.innerHTML;
    const wordContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'MS Mincho', 'serif'; }
                h1 { color: #4f46e5; font-size: 24pt; border-bottom: 2px solid #4f46e5; }
                h2 { color: #4f46e5; font-size: 18pt; border-left: 10px solid #4f46e5; padding-left: 10px; background: #f0f0ff; }
                .kp-info, .box-summary, .box-check, .box-spot, .box-search, .box-listen, .box-library, .box-san, .box-secret, .box-gimmick, .box-tendency, .box-custom, .box-special {
                    border: 1px solid #ccc; background: #f9f9f9; padding: 10px; margin: 10px 0;
                }
            </style>
        </head>
        <body><h1>${title}</h1>${content}</body>
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
    const savedContent = localStorage.getItem('weby_autosave'); 
    const savedTitle = localStorage.getItem('weby_autosave_title');
    if (savedContent) { editor.innerHTML = savedContent; saveStatus.textContent = "ブラウザから復元済み"; }
    if (savedTitle) titleInput.value = savedTitle;
    setTheme(localStorage.getItem('weby_theme') || 'standard');
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); manualIndent(!e.shiftKey); }
    });
    // 画像クリック時に選択状態にする
    editor.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNode(e.target);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });
    updateTOC(); updateCharCount();
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
