/**
 * LogStylist Pro 
 * メインロジック（新HTML・JSON・顔アイコン対応版）
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
    const showAvatarToggle = document.getElementById('showAvatarToggle');
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

    if (showAvatarToggle) {
        showAvatarToggle.addEventListener('change', () => render());
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

    // ファイル処理（HTML / JSON自動判別）
    async function processFile(file) {
        try {
            if (logTitleInput) {
                logTitleInput.value = file.name.replace(/\.[^/.]+$/, "");
            }
            const text = await file.text();
            
            if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
                parseJsonLog(text);
            } else {
                parseHtmlLog(text);
            }

            if (logData.length === 0) {
                console.warn("ログが見つかりませんでした。");
                return;
            }

            // タブ設定・ユーザー設定の初期化
            initSettings();
            updateControlUI();
            render();
        } catch (err) {
            console.error("ファイル処理中にエラーが発生しました:", err);
        }
    }

    // 新旧HTMLログのパース
    function parseHtmlLog(text) {
        logData = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // 新形式: <article class="message">
        const articles = Array.from(doc.querySelectorAll('article.message'));
        if (articles.length > 0) {
            // CSSスタイルから .avatar-image-X の background-image をマップ化
            const avatarMap = {};
            const styleTags = doc.querySelectorAll('style');
            styleTags.forEach(style => {
                const content = style.textContent;
                const re = /\.avatar-image-(\d+)\s*\{\s*background-image:\s*url\(["']?([^"'\)]+)["']?\)/g;
                let match;
                while ((match = re.exec(content)) !== null) {
                    avatarMap[`avatar-image-${match[1]}`] = match[2];
                }
            });

            articles.forEach(article => {
                let rawTab = article.getAttribute('data-channel') || '';
                const channelNameEl = article.querySelector('.channel-name');
                if (!rawTab && channelNameEl) {
                    rawTab = channelNameEl.innerText.trim().replace(/[\[\]]/g, '');
                }
                if (!rawTab) rawTab = 'main';

                if (rawTab === 'おはらい' || rawTab === 'お祓い') return;
                if (rawTab.toLowerCase() === 'other') rawTab = '雑談';

                const speakerEl = article.querySelector('.speaker');
                const user = speakerEl ? speakerEl.innerText.trim() : 'system';
                
                // カラー取得
                let color = '#333';
                if (speakerEl) {
                    const styleAttr = speakerEl.getAttribute('style') || '';
                    const colorMatch = styleAttr.match(/--speaker-color:\s*([^;]+)/);
                    if (colorMatch) color = colorMatch[1].trim();
                    else if (speakerEl.style.color) color = speakerEl.style.color;
                }

                // 本文 & ダイス
                const msgTextEl = article.querySelector('.message-text');
                const rollEl = article.querySelector('.roll-result');
                let content = msgTextEl ? msgTextEl.innerHTML.trim() : '';
                if (rollEl) {
                    content += (content ? '<br>' : '') + `<span class="roll-text">${rollEl.innerHTML.trim()}</span>`;
                }

                // アイコン取得
                let avatarUrl = '';
                const avatarEl = article.querySelector('.avatar');
                if (avatarEl) {
                    avatarEl.classList.forEach(cls => {
                        if (avatarMap[cls]) avatarUrl = avatarMap[cls];
                    });
                    if (!avatarUrl && avatarEl.style.backgroundImage) {
                        const m = avatarEl.style.backgroundImage.match(/url\(["']?([^"'\)]+)["']?\)/);
                        if (m) avatarUrl = m[1];
                    }
                }

                logData.push({ tab: rawTab, user, content, color, avatarUrl });
            });
            return;
        }

        // 旧形式: <p><span>[tab]</span> <span>name:</span> <span>content</span></p>
        const paragraphs = Array.from(doc.querySelectorAll('p'));
        paragraphs.forEach((p) => {
            const spans = p.querySelectorAll('span');
            if (spans.length < 3) return;
            
            let rawTab = spans[0].innerText.trim().replace(/[\[\]]/g, '');
            if (rawTab === 'おはらい' || rawTab === 'お祓い') return;
            if (rawTab.toLowerCase() === 'other') rawTab = '雑談';
            
            const user = spans[1].innerText.trim().replace(/\s*:\s*$/, '');
            const content = spans[2].innerHTML.trim();
            const color = p.style.color || '#333';
            
            logData.push({ tab: rawTab, user, content, color, avatarUrl: '' });
        });
    }

    // JSONログのパース
    function parseJsonLog(text) {
        logData = [];
        const json = JSON.parse(text);
        const messages = json.messages || [];
        const images = json.images || {};

        messages.forEach(msg => {
            let rawTab = msg.channel || msg.channelName || 'main';
            if (rawTab === 'おはらい' || rawTab === 'お祓い') return;
            if (rawTab.toLowerCase() === 'other') rawTab = '雑談';

            const user = msg.name || 'system';
            const color = msg.color || '#333';
            let content = (msg.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

            // ダイス結果などのextend
            if (msg.extend && msg.extend.roll && msg.extend.roll.result) {
                content += (content ? '<br>' : '') + `<span class="roll-text">${msg.extend.roll.result}</span>`;
            }

            let avatarUrl = '';
            if (msg.iconImage && images[msg.iconImage]) {
                avatarUrl = images[msg.iconImage];
            }

            logData.push({ tab: rawTab, user, content, color, avatarUrl });
        });
    }

    // 設定の初期化
    function initSettings() {
        const tabs = new Set(logData.map(d => d.tab));
        const users = new Set(logData.map(d => d.user));

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

        users.forEach(u => {
            if (!userSettings[u]) {
                const firstColor = logData.find(d => d.user === u)?.color || '#333';
                const firstAvatar = logData.find(d => d.user === u && d.avatarUrl)?.avatarUrl || '';
                userSettings[u] = { visible: true, color: firstColor, displayName: u, avatarUrl: firstAvatar };
            }
        });
    }

    // 設定UIの更新
    function updateControlUI() {
        if (!tabControls || !userControls) return;
        
        tabControls.innerHTML = '';
        const sortedTabKeys = Object.keys(tabSettings).sort((a, b) => {
            const order = { 'main': 1, 'info': 2, '雑談': 3, 'other': 3 };
            const aIdx = order[a.toLowerCase()] || 99;
            const bIdx = order[b.toLowerCase()] || 99;
            return aIdx - bIdx;
        });

        sortedTabKeys.forEach(tab => {
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
                        ${setting.avatarUrl ? `<div class="w-4 h-4 rounded-full bg-cover bg-center shrink-0" style="background-image: url('${setting.avatarUrl}')"></div>` : ''}
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
        const showAvatar = showAvatarToggle ? showAvatarToggle.checked : true;
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
            line.className = `log-line prio-${tabSettings[item.tab].priority} log-row ${showAvatar ? '' : 'no-avatar'}`;
            line.setAttribute('data-tab', item.tab);
            line.setAttribute('data-user', setting.displayName);
            line.style.backgroundColor = tabSettings[item.tab].color;

            // アバターHTML
            let avatarHtml = '';
            if (showAvatar) {
                const avatar = item.avatarUrl || setting.avatarUrl;
                if (avatar) {
                    avatarHtml = `<div class="log-avatar" style="background-image: url('${avatar}');"></div>`;
                } else {
                    avatarHtml = `<div class="log-avatar-spacer"></div>`;
                }
            }

            line.innerHTML = `
                <div class="speaker-col">
                    ${avatarHtml}
                    <div class="user-name" style="color: ${setting.color}">${setting.displayName}</div>
                </div>
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
            const setting = userSettings[user];
            if (s.criticals.length + s.fumbles.length + s.specials.length > 0) {
                hasStats = true;
                const div = document.createElement('div');
                div.className = 'bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 overflow-hidden';
                div.innerHTML = `
                    <div class="p-3 flex items-center justify-between cursor-pointer header-click">
                        <div class="font-bold flex items-center gap-2" style="color:${setting.color}">
                            <span>${setting.displayName}</span>
                            <span class="text-[10px] opacity-40">▼ 詳細表示</span>
                        </div>
                        <div class="flex gap-3 text-[10px] font-bold">
                            <span class="text-pink-500">Crit: ${s.criticals.length}</span>
                            <span class="text-blue-500">Funb: ${s.fumbles.length}</span>
                            <span class="text-indigo-500">Spec: ${s.specials.length}</span>
                        </div>
                    </div>
                    <div class="hidden p-4 bg-black/5 dark:bg-black/40 text-[10px] space-y-4 border-t border-black/5 details-body">
                        ${s.criticals.length ? `<div><p class="font-bold text-pink-500 mb-1">【決定的成功】</p>${s.criticals.map(i => `<div class="opacity-80 mb-1">[${i.tab}] ${stripHtml(i.content)}</div>`).join('')}</div>` : ''}
                        ${s.fumbles.length ? `<div><p class="font-bold text-blue-500 mb-1">【致命的失敗】</p>${s.fumbles.map(i => `<div class="opacity-80 mb-1">[${i.tab}] ${stripHtml(i.content)}</div>`).join('')}</div>` : ''}
                        ${s.specials.length ? `<div><p class="font-bold text-indigo-500 mb-1">【スペシャル】</p>${s.specials.map(i => `<div class="opacity-80 mb-1">[${i.tab}] ${stripHtml(i.content)}</div>`).join('')}</div>` : ''}
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
            const showAvatar = (showAvatarToggle && showAvatarToggle.checked);
            const logContentHtml = logContentArea ? logContentArea.innerHTML : '';
            const statsContentHtml = (statsArea && !statsArea.classList.contains('hidden')) ? statsArea.innerHTML : '';
            
            const activeTabs = Object.keys(tabSettings)
                .filter(t => tabSettings[t].visible)
                .sort((a, b) => {
                    const order = { 'main': 1, 'info': 2, '雑談': 3, 'other': 3 };
                    const aIdx = order[a.toLowerCase()] || 99;
                    const bIdx = order[b.toLowerCase()] || 99;
                    return aIdx - bIdx;
                });
                
            const activeUsers = Object.keys(userSettings)
                .filter(u => userSettings[u].visible)
                .map(u => userSettings[u].displayName);
            
            const uniqueUsers = Array.from(new Set(activeUsers));

            const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { background: ${isDark ? '#2d2d2d' : '#fdfaf0'}; color: ${isDark ? '#e0e0e0' : '#3e3e3e'}; font-family: sans-serif; margin: 0; padding: 40px 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: ${isDark ? '#1e1e1e' : '#fff'}; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
        .controls { padding: 20px; background: rgba(0,0,0,0.05); font-size: 12px; }
        .filter-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .filter-chip { padding: 4px 12px; border-radius: 20px; border: 1px solid #ccc; cursor: pointer; transition: 0.2s; }
        .filter-chip.active { background: #6c5ce7; color: white; border-color: #6c5ce7; }
        .log-line { border-bottom: 1px solid rgba(0,0,0,0.05); padding: 12px 20px; display: grid; grid-template-columns: ${showAvatar ? '240px' : '200px'} 1fr; gap: 16px; align-items: flex-start; }
        .prio-main { padding-left: 20px; font-size: 1.0em; }
        .prio-info { padding-left: 40px; font-size: 0.9em; opacity: 0.9; }
        .prio-other-tab { padding-left: 60px; font-size: 0.8em; opacity: 0.75; }
        .prio-lowest { padding-left: 80px; font-size: 0.7em; opacity: 0.6; }
        .speaker-col { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .log-avatar { width: 36px; height: 36px; min-width: 36px; border-radius: 50%; background-size: cover; background-position: center; background-repeat: no-repeat; box-shadow: 0 1px 3px rgba(0,0,0,0.15); background-color: rgba(0,0,0,0.05); }
        .log-avatar-spacer { width: 36px; min-width: 36px; height: 36px; }
        .user-name { font-weight: bold; padding-right: 0.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
        .content-text { line-height: 1.8; word-break: break-all; text-align: left; }
        .roll-text { display: block; color: #888; font-size: 0.95em; margin-top: 4px; }
        .critical { color: #e84393; font-weight: bold; text-decoration: underline; }
        .fumble { color: #0984e3; font-weight: bold; text-decoration: underline; }
        .special { color: #6c5ce7; font-weight: bold; }
        .stats-area { padding: 20px; background: rgba(0,0,0,0.03); }
        .hidden { display: none !important; }
        .header-click { cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
        footer { margin-top: 40px; text-align: center; font-size: 10px; opacity: 0.5; line-height: 1.6; }
        footer a { color: inherit; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="container">
        <div class="controls">
            <div class="filter-group">
                ${activeTabs.map(t => `<div class="filter-chip active" onclick="toggleFilter(this, 'tab', '${t}')">${t}</div>`).join('')}
            </div>
            <div class="filter-group">
                ${uniqueUsers.map(u => `<div class="filter-chip active" onclick="toggleFilter(this, 'user', '${u}')">${u}</div>`).join('')}
            </div>
        </div>
        <div class="stats-area">${statsContentHtml}</div>
        <div id="log-body">${logContentHtml}</div>
    </div>
    <footer>
        <p>Product by 異次元ポケット</p>
        <p><a href="https://ijigenpocket.booth.pm/" target="_blank">https://ijigenpocket.booth.pm/</a></p>
    </footer>
    <script>
        const states = { tab: {}, user: {} };
        document.querySelectorAll('.filter-chip').forEach(el => {
            const onclickText = el.getAttribute('onclick');
            const parts = onclickText.match(/'([^']+)'/g);
            states[parts[0].replace(/'/g,'')][parts[1].replace(/'/g,'')] = true;
        });

        function toggleFilter(el, type, val) {
            el.classList.toggle('active');
            states[type][val] = el.classList.contains('active');
            document.querySelectorAll('.log-row').forEach(row => {
                const visible = states.tab[row.dataset.tab] && states.user[row.dataset.user];
                row.classList.toggle('hidden', !visible);
            });
        }

        document.querySelectorAll('.header-click').forEach(el => {
            el.onclick = () => {
                const body = el.nextElementSibling;
                if (body) body.classList.toggle('hidden');
            };
        });
    <\/script>
</body>
</html>`;
            
            try {
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = title + ".html";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (err) { console.error(err); }
        };
    }
});