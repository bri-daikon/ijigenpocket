/**
 * LogStylist Pro 
 * メインロジック（修正版）
 */
document.addEventListener('DOMContentLoaded', () => {
    let logData = [];
    let tabSettings = {};
    let userSettings = {};
    let selectedUsers = new Set();

    const COLOR_PALETTE = ['#fff5f5', '#f0f7ff', '#f2faf2', '#f8f2ff', '#fff0f6', '#fcf5ed'];

    // DOM要素の取得
    const fileInput = document.getElementById('fileInput');
    const logDisplay = document.getElementById('logDisplay');
    const logContentArea = document.getElementById('logContentArea');
    const dropZone = document.getElementById('dropZone');
    const tabControls = document.getElementById('tabControls');
    const userControls = document.getElementById('userControls');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const syncColorToggle = document.getElementById('syncColorToggle');
    const statsArea = document.getElementById('statsArea');
    const logTitleInput = document.getElementById('logTitle');
    const bulkPanel = document.getElementById('bulkPanel');
    const bulkNameInput = document.getElementById('bulkNameInput');
    const applyBulkNameBtn = document.getElementById('applyBulkName');
    const bulkColorInput = document.getElementById('bulkColorInput');
    const downloadBtn = document.getElementById('downloadBtn');

    // ダークモード切り替え
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeToggle.checked);
        });
    }

    if (syncColorToggle) {
        syncColorToggle.addEventListener('change', () => render());
    }

    // ドラッグ＆ドロップ設定
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());

    if (logDisplay) {
        logDisplay.addEventListener('dragover', (e) => {
            e.preventDefault();
            logDisplay.classList.add('drag-over');
        });

        logDisplay.addEventListener('dragleave', () => logDisplay.classList.remove('drag-over'));

        logDisplay.addEventListener('drop', (e) => {
            e.preventDefault();
            logDisplay.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) processFile(file);
        });
    }

    // 一括編集の適用
    if (applyBulkNameBtn) {
        applyBulkNameBtn.onclick = () => {
            const newName = bulkNameInput.value.trim();
            if (!newName) return;
            selectedUsers.forEach(userId => {
                if (userSettings[userId]) userSettings[userId].displayName = newName;
            });
            updateControlUI();
            render();
        };
    }

    if (bulkColorInput) {
        bulkColorInput.oninput = (e) => {
            const newColor = e.target.value;
            selectedUsers.forEach(userId => {
                if (userSettings[userId]) userSettings[userId].color = newColor;
            });
            updateControlUI();
            render();
        };
    }

    // ファイル処理
    async function processFile(file) {
        try {
            if (logTitleInput) {
                logTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
            }
            const text = await file.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const paragraphs = Array.from(doc.querySelectorAll('p'));

            if (paragraphs.length === 0) {
                console.warn("ログが見つかりませんでした。");
                return;
            }

            logData = [];
            const tabs = new Set();
            const users = new Set();

            paragraphs.forEach((p) => {
                const spans = p.querySelectorAll('span');
                if (spans.length < 3) return;
                
                let rawTab = spans[0].innerText.trim().replace(/[\[\]]/g, '');
                if (rawTab === 'おはらい' || rawTab === 'お祓い') return;
                if (rawTab.toLowerCase() === 'other') rawTab = '雑談';
                
                const user = spans[1].innerText.trim().replace(/\s*:\s*$/, '');
                const content = spans[2].innerHTML.trim();
                const color = p.style.color || '#333';
                
                logData.push({ tab: rawTab, user, content, color });
                tabs.add(rawTab);
                users.add(user);
            });

            // タブ設定の初期化
            let otherTabIdx = 0;
            tabs.forEach(t => {
                if (!tabSettings[t]) {
                    let priority = 'other-tab';
                    let bgColor = 'rgba(0,0,0,0)';
                    const lowerT = t.toLowerCase();
                    if (lowerT === 'main') priority = 'main';
                    else if (lowerT === 'info') { priority = 'info'; bgColor = '#fffde7'; }
                    else if (lowerT === '雑談' || lowerT === 'other') { priority = 'lowest'; bgColor = '#f5f5f5'; }
                    else { bgColor = COLOR_PALETTE[otherTabIdx % COLOR_PALETTE.length]; otherTabIdx++; }
                    tabSettings[t] = { color: bgColor, priority, visible: true };
                }
            });

            // ユーザー設定の初期化
            users.forEach(u => {
                if (!userSettings[u]) {
                    const firstColor = logData.find(d => d.user === u)?.color || '#333';
                    userSettings[u] = { visible: true, color: firstColor, displayName: u };
                }
            });

            updateControlUI();
            render();
        } catch (err) {
            console.error("ファイル処理中にエラーが発生しました:", err);
        }
    }

    // 設定UIの更新
    function updateControlUI() {
        if (!tabControls || !userControls) return;
        
        tabControls.innerHTML = '';
        Object.keys(tabSettings).forEach(tab => {
            const conf = tabSettings[tab];
            const div = document.createElement('div');
            div.className = 'p-2 bg-black/5 dark:bg-white/5 rounded space-y-2';
            div.innerHTML = `
                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 truncate">
                        <input type="checkbox" ${conf.visible ? 'checked' : ''} class="tab-vis accent-indigo-500">
                        <span class="font-bold truncate w-24">${tab}</span>
                    </label>
                    <input type="color" value="${rgbaToHex(conf.color)}" class="tab-color">
                </div>
                <select class="tab-prio w-full bg-transparent border rounded text-[10px] p-1">
                    <option value="main" ${conf.priority === 'main' ? 'selected' : ''}>1. [main] (標準)</option>
                    <option value="info" ${conf.priority === 'info' ? 'selected' : ''}>2. [Info] (中)</option>
                    <option value="other-tab" ${conf.priority === 'other-tab' ? 'selected' : ''}>3. その他 (小)</option>
                    <option value="lowest" ${conf.priority === 'lowest' ? 'selected' : ''}>4. [雑談/other] (最小)</option>
                </select>
            `;
            div.querySelector('.tab-vis').onchange = (e) => { tabSettings[tab].visible = e.target.checked; render(); };
            div.querySelector('.tab-color').oninput = (e) => { tabSettings[tab].color = e.target.value; render(); };
            div.querySelector('.tab-prio').onchange = (e) => { tabSettings[tab].priority = e.target.value; render(); };
            tabControls.appendChild(div);
        });

        userControls.innerHTML = '';
        Object.keys(userSettings).forEach(userId => {
            const setting = userSettings[userId];
            const isSelected = selectedUsers.has(userId);
            const div = document.createElement('div');
            div.className = `flex flex-col gap-1 p-2 border-b border-black/5 dark:border-white/5 ${isSelected ? 'user-row-selected' : ''}`;
            div.innerHTML = `
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 truncate flex-1">
                        <input type="checkbox" class="bulk-check accent-indigo-500" ${isSelected ? 'checked' : ''}>
                        <input type="checkbox" ${setting.visible ? 'checked' : ''} class="user-vis accent-indigo-500">
                        <span class="truncate font-medium" style="color:${setting.color}">${setting.displayName}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="edit-btn text-[10px] opacity-40 hover:opacity-100 px-1 border rounded">編集</button>
                        <input type="color" value="${rgbaToHex(setting.color)}" class="user-color w-5 h-5 border-0 bg-transparent cursor-pointer">
                    </div>
                </div>
                <div class="edit-area hidden mt-1">
                    <input type="text" value="${setting.displayName}" class="name-edit-input w-full p-1 text-[10px] border rounded bg-transparent">
                </div>
            `;
            div.querySelector('.bulk-check').onchange = (e) => {
                if (e.target.checked) selectedUsers.add(userId); else selectedUsers.delete(userId);
                if (bulkPanel) bulkPanel.classList.toggle('hidden', selectedUsers.size === 0);
                updateControlUI();
            };
            div.querySelector('.user-vis').onchange = (e) => { setting.visible = e.target.checked; render(); };
            div.querySelector('.user-color').oninput = (e) => { setting.color = e.target.value; render(); updateControlUI(); };
            div.querySelector('.edit-btn').onclick = () => div.querySelector('.edit-area').classList.toggle('hidden');
            div.querySelector('.name-edit-input').onchange = (e) => { setting.displayName = e.target.value; render(); updateControlUI(); };
            userControls.appendChild(div);
        });
    }

    // メイン描画
    function render() {
        if (!logContentArea) return;
        logContentArea.innerHTML = '';
        const stats = {};
        const syncColor = syncColorToggle ? syncColorToggle.checked : false;
        const visibleLogs = logData.filter(item => tabSettings[item.tab]?.visible && userSettings[item.user]?.visible);

        visibleLogs.forEach(item => {
            const setting = userSettings[item.user];
            const isCrit = item.content.includes('決定的成功');
            const isFumb = item.content.includes('致命的失敗');
            const isSpec = item.content.includes('スペシャル') && !isCrit;

            if (!stats[item.user]) stats[item.user] = { criticals: [], fumbles: [], specials: [] };
            if (isCrit) stats[item.user].criticals.push(item);
            else if (isFumb) stats[item.user].fumbles.push(item);
            else if (isSpec) stats[item.user].specials.push(item);

            const line = document.createElement('div');
            line.className = `log-line prio-${tabSettings[item.tab].priority} log-row`;
            line.setAttribute('data-tab', item.tab);
            line.setAttribute('data-user', setting.displayName);
            line.style.backgroundColor = tabSettings[item.tab].color;
            line.innerHTML = `
                <div class="user-name" style="color: ${setting.color}">${setting.displayName}</div>
                <div class="content-text" style="color: ${syncColor ? setting.color : 'inherit'}">${highlight(item.content)}</div>
            `;
            logContentArea.appendChild(line);
        });
        
        if (dropZone) dropZone.style.display = visibleLogs.length > 0 ? 'none' : 'flex';
        updateStatsUI(stats);
    }

    function highlight(html) {
        return html.replace(/決定的成功/g, '<span class="critical">$&</span>')
                   .replace(/致命的失敗/g, '<span class="fumble">$&</span>')
                   .replace(/スペシャル/g, '<span class="special">$&</span>');
    }

    function updateStatsUI(stats) {
        if (!statsArea) return;
        const contentArea = document.getElementById('statsContent');
        if (!contentArea) return;
        
        contentArea.innerHTML = '';
        let hasStats = false;
        Object.keys(stats).forEach(user => {
            const s = stats[user];
            if (s.criticals.length + s.fumbles.length + s.specials.length > 0) {
                hasStats = true;
                const div = document.createElement('div');
                div.className = 'bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 overflow-hidden';
                div.innerHTML = `
                    <div class="p-3 flex items-center justify-between cursor-pointer header-click">
                        <div class="font-bold flex items-center gap-2" style="color:${userSettings[user].color}">
                            <span>${userSettings[user].displayName}</span>
                            <span class="text-[10px] opacity-40">▼ 詳細</span>
                        </div>
                        <div class="flex gap-3 text-[10px] font-bold">
                            <span class="text-pink-500">C: ${s.criticals.length}</span>
                            <span class="text-blue-500">F: ${s.fumbles.length}</span>
                        </div>
                    </div>
                    <div class="hidden p-4 bg-black/5 dark:bg-black/40 text-[10px] space-y-2 border-t details-body">
                        ${s.criticals.map(i => `<div class="opacity-80">[${i.tab}] ${stripHtml(i.content)}</div>`).join('')}
                        ${s.fumbles.map(i => `<div class="opacity-80">[${i.tab}] ${stripHtml(i.content)}</div>`).join('')}
                    </div>
                `;
                div.querySelector('.header-click').onclick = () => div.querySelector('.details-body').classList.toggle('hidden');
                contentArea.appendChild(div);
            }
        });
        statsArea.classList.toggle('hidden', !hasStats);
    }

    function stripHtml(html) {
        let t = document.createElement("DIV");
        t.innerHTML = html;
        return t.textContent || "";
    }

    // rgb(r, g, b)形式を #rrggbb形式に変換する
    function rgbaToHex(color) {
        if (!color || color === 'rgba(0,0,0,0)' || color === 'transparent') return '#ffffff';
        if (color.startsWith('#')) return color;
        
        const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }
        return '#ffffff';
    }

    // 書き出し機能
    if (downloadBtn) {
        downloadBtn.onclick = function() {
            const title = (logTitleInput ? logTitleInput.value : '') || 'SessionLog';
            const isDark = (darkModeToggle && darkModeToggle.checked);
            const bgColor = isDark ? '#2d2d2d' : '#fdfaf0';
            const txtColor = isDark ? '#e0e0e0' : '#3e3e3e';
            
            const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { background: ${bgColor}; color: ${txtColor}; font-family: sans-serif; padding: 40px; margin:0; }
        .log-line { padding: 12px 20px; border-bottom: 1px solid rgba(0,0,0,0.1); display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: baseline; }
        .user-name { font-weight: bold; }
        .critical { color: #e84393; font-weight: bold; text-decoration: underline; }
        .fumble { color: #0984e3; font-weight: bold; text-decoration: underline; }
        .special { color: #6c5ce7; font-weight: bold; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="log-container">
        ${logContentArea ? logContentArea.innerHTML : ''}
    </div>
</body>
</html>`;
            const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = title + ".html";
            a.click();
        };
    }
});