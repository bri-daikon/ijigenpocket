let currentSessionId = null;
let config = { numPeople: 3, numRounds: 10, names: [], currentRound: 1 };
let statusEntries = [];
let currentTheme = 'dark';

const themes = {
    dark: { class: "bg-slate-900 text-slate-100 border-slate-700", label: "Dark" },
    light: { class: "bg-slate-50 text-slate-900 border-slate-300", label: "Light" },
    pop: { class: "bg-pink-50 text-indigo-900 border-pink-200", label: "Pop" },
    classic: { class: "bg-amber-50 text-orange-950 border-amber-200 font-serif", label: "Classic" },
    rainbow: { class: "rainbow-theme text-white border-white/20", label: "Rainbow" }
};

const categories = [
    { id: 'status', label: '状態', color: 'bg-slate-500' },
    { id: 'buff', label: 'バフ', color: 'bg-green-600' },
    { id: 'debuff', label: 'デバフ', color: 'bg-red-600' },
    { id: 'other', label: 'その他', color: 'bg-amber-600' }
];

function showMsg(text, type = 'info') {
    const msg = document.getElementById('message-box');
    msg.textContent = text;
    msg.className = `fixed bottom-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 transition-all duration-300 font-bold ${type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`;
    msg.style.opacity = '1';
    msg.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => { 
        msg.style.opacity = '0'; 
        msg.style.transform = 'translate(-50%, 0px)';
    }, 3000);
}

window.changeTheme = (themeKey) => {
    currentTheme = themeKey;
    const theme = themes[themeKey];
    document.body.className = theme.class + " transition-colors duration-500 min-h-screen p-4 pb-32";
    document.getElementById('theme-container').className = theme.class + " max-w-7xl mx-auto border p-4 mb-6 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-4";
};

function initThemes() {
    const container = document.getElementById('theme-buttons');
    Object.keys(themes).forEach(key => {
        const btn = document.createElement('button');
        btn.className = "px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all";
        btn.textContent = themes[key].label;
        btn.onclick = () => changeTheme(key);
        container.appendChild(btn);
    });
}

window.generateNameFields = () => {
    const container = document.getElementById('names-input-container');
    const count = parseInt(document.getElementById('input-num-people').value) || 1;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `PC/NPC ${i + 1} の名前`;
        input.id = `name-input-${i}`;
        input.className = "p-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-blue-500";
        container.appendChild(input);
    }
};

window.deployManager = () => {
    const numPeople = parseInt(document.getElementById('input-num-people').value) || 1;
    const numRounds = parseInt(document.getElementById('input-num-rounds').value) || 10;
    const names = [];
    for (let i = 0; i < numPeople; i++) {
        const el = document.getElementById(`name-input-${i}`);
        names.push(el && el.value ? el.value : `PC ${i + 1}`);
    }
    config = { numPeople, numRounds, names, currentRound: 1 };
    statusEntries = [];
    renderManager();
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('main-manager').classList.remove('hidden');
};

function renderManager() {
    const select = document.getElementById('action-person-select');
    if (!select) return; // Guard for dynamic rendering
    select.innerHTML = '';
    config.names.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name;
        select.appendChild(opt);
    });

    document.getElementById('action-start-round').value = config.currentRound;
    document.getElementById('action-end-round').value = config.currentRound;

    const header = document.getElementById('round-headers');
    header.innerHTML = '<th class="p-4 border-r sticky-col bg-inherit w-[220px] min-w-[220px] z-40 font-bold uppercase tracking-widest text-[10px] opacity-60">キャラクター / 項目</th>';
    for (let r = 1; r <= config.numRounds; r++) {
        const th = document.createElement('th');
        const isCurrent = config.currentRound === r;
        th.className = `p-4 border-r text-center cursor-pointer min-w-[140px] w-[140px] transition-all hover:bg-white/10 ${isCurrent ? 'bg-blue-600 text-white shadow-inner' : ''}`;
        th.innerHTML = `<div class="text-[10px] opacity-70">ROUND</div><div class="text-xl font-black">${r}</div>`;
        th.onclick = () => { config.currentRound = r; renderManager(); };
        header.appendChild(th);
    }

    const body = document.getElementById('status-table-body');
    body.innerHTML = '';
    config.names.forEach((name, pIdx) => {
        const groupClass = pIdx % 2 === 0 ? "person-group-even" : "person-group-odd";
        
        categories.forEach((cat, cIdx) => {
            const tr = document.createElement('tr');
            const borderTopClass = cIdx === 0 ? "border-t-2 border-white/20" : "";
            tr.className = `border-b border-white/5 hover:bg-white/10 transition-colors ${groupClass} ${borderTopClass}`;
            
            const tdLabel = document.createElement('td');
            tdLabel.className = "p-4 border-r sticky-col bg-inherit z-20";
            if (cIdx === 0) {
                tdLabel.innerHTML = `<div class="font-black text-base truncate">${name}</div><div class="text-[9px] opacity-40 font-bold uppercase tracking-tighter mt-1">${cat.label}</div>`;
            } else {
                tdLabel.innerHTML = `<div class="text-[9px] opacity-40 font-bold text-right uppercase tracking-tighter">${cat.label}</div>`;
            }
            tr.appendChild(tdLabel);

            const rowEntries = statusEntries.filter(e => e.personIndex == pIdx && e.category == cat.id);
            const uniqueContents = [...new Set(rowEntries.map(e => e.content))].sort();

            for (let r = 1; r <= config.numRounds; r++) {
                const td = document.createElement('td');
                const isCurrent = config.currentRound === r;
                td.className = `p-2 border-r align-top w-[140px] ${isCurrent ? 'bg-blue-500/10' : ''}`;
                
                const container = document.createElement('div');
                container.className = "flex flex-col gap-1";

                uniqueContents.forEach(content => {
                    const entry = rowEntries.find(e => e.content === content && r >= e.startRound && r <= e.endRound);
                    if (entry) {
                        const badge = document.createElement('div');
                        badge.className = `status-badge ${cat.color} text-white text-[10px] px-3 py-1.5 rounded-lg flex justify-between items-center group shadow-sm animate-in zoom-in-95 duration-200 overflow-hidden`;
                        badge.innerHTML = `<span class="flex-1 truncate font-bold mr-1">${entry.content}</span><button onclick="removeEntry('${entry.id}')" class="opacity-0 group-hover:opacity-100 hover:scale-125 transition-all text-sm leading-none">✕</button>`;
                        container.appendChild(badge);
                    } else {
                        const empty = document.createElement('div');
                        empty.className = "empty-lane";
                        container.appendChild(empty);
                    }
                });
                
                td.appendChild(container);
                tr.appendChild(td);
            }
            body.appendChild(tr);
        });
    });
}

window.applyAction = () => {
    const pIdx = document.getElementById('action-person-select').value;
    const cat = document.querySelector('input[name="action-cat"]:checked').value;
    const start = parseInt(document.getElementById('action-start-round').value);
    const end = parseInt(document.getElementById('action-end-round').value);
    const content = document.getElementById('action-content').value;

    if (!content) return showMsg("内容を入力してください", "error");
    if (start > end) return showMsg("開始ラウンドが終了より後になっています", "error");

    statusEntries = statusEntries.filter(e => !(e.personIndex == pIdx && e.category == cat && e.content === content));
    statusEntries.push({ id: Date.now().toString(), personIndex: pIdx, category: cat, startRound: start, endRound: end, content });
    renderManager();
    document.getElementById('action-content').value = '';
    showMsg("適用しました");
};

window.removeEntry = (id) => {
    statusEntries = statusEntries.filter(e => e.id !== id);
    renderManager();
};

window.clearEntries = () => {
    if (confirm("名前とラウンド設定は維持したまま、すべての状況（バフ・デバフなど）をクリアして新しい戦闘を開始しますか？")) {
        statusEntries = [];
        config.currentRound = 1;
        renderManager();
        showMsg("状況をリセットしました");
    }
};

const STORAGE_KEY = 'weby_trpg_manager_v1';

window.saveSession = () => {
    const name = document.getElementById('save-name').value || `Session_${new Date().toLocaleTimeString()}`;
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const sessionData = { id: currentSessionId || Date.now().toString(), sessionName: name, config, statusEntries, currentTheme, timestamp: Date.now() };
    const idx = sessions.findIndex(s => s.id === sessionData.id);
    if (idx > -1) sessions[idx] = sessionData; else sessions.push(sessionData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    currentSessionId = sessionData.id;
    updateSessionList();
    showMsg("保存しました");
};

function updateSessionList() {
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const select = document.getElementById('session-select');
    if (!select) return;
    select.innerHTML = sessions.length ? '' : '<option value="">-- 保存データなし --</option>';
    sessions.sort((a, b) => b.timestamp - a.timestamp).forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = `${s.sessionName} (${new Date(s.timestamp).toLocaleDateString()})`;
        select.appendChild(opt);
    });
}

window.loadSession = () => {
    const id = document.getElementById('session-select').value;
    if (!id) return;
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const session = sessions.find(s => s.id === id);
    if (session) {
        config = session.config; statusEntries = session.statusEntries || []; currentTheme = session.currentTheme || 'dark'; currentSessionId = session.id;
        document.getElementById('save-name').value = session.sessionName;
        changeTheme(currentTheme); renderManager();
        document.getElementById('setup-section').classList.add('hidden');
        document.getElementById('main-manager').classList.remove('hidden');
        showMsg("読み込みました");
    }
};

window.deleteSession = () => {
    const id = document.getElementById('session-select').value;
    if (!id) return showMsg("削除するデータを選択してください", "error");
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const session = sessions.find(s => s.id === id);
    if (confirm(`セッション「${session.sessionName}」を完全に削除しますか？`)) {
        const newSessions = sessions.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
        updateSessionList();
        showMsg("削除しました");
    }
};

window.newSession = () => {
    if (confirm("新規作成画面に戻りますか？")) {
        currentSessionId = null;
        document.getElementById('setup-section').classList.remove('hidden');
        document.getElementById('main-manager').classList.add('hidden');
        generateNameFields();
    }
};

window.onload = () => { initThemes(); generateNameFields(); updateSessionList(); changeTheme('dark'); };
