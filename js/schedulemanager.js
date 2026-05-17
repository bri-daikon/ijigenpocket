let currentSessionId = null;
let config = { numPeople: 4, numDays: 3, dayStartH: 9, dayStartM: 0, dayEndH: 22, dayEndM: 0, names: [], viewMode: 'hourly', currentBlock: 'all' };
let scheduleEntries = [];
let currentTheme = 'dark';
let selectedColumnIndex = -1;
let editingEntryId = null;

const THEMES = {
    dark: { label: 'BLACK', bodyClass: 'theme-dark bg-slate-900 text-slate-100', hex: '#0f172a', btnClass: 'bg-slate-800 border-slate-600 hover:bg-slate-700 text-white' },
    light: { label: 'WHITE', bodyClass: 'theme-light bg-slate-50 text-slate-900', hex: '#f8fafc', btnClass: 'bg-white border-slate-300 hover:bg-slate-100 text-slate-900' },
    navy: { label: 'NAVY', bodyClass: 'theme-navy bg-blue-950 text-blue-50', hex: '#172554', btnClass: 'bg-blue-900 border-blue-700 hover:bg-blue-800 text-white' },
    forest: { label: 'FOREST', bodyClass: 'theme-forest bg-emerald-950 text-emerald-50', hex: '#022c22', btnClass: 'bg-emerald-900 border-emerald-700 hover:bg-emerald-800 text-white' },
    wine: { label: 'WINE', bodyClass: 'theme-wine bg-rose-950 text-rose-50', hex: '#4c0519', btnClass: 'bg-rose-900 border-rose-700 hover:bg-rose-800 text-white' },
    purple: { label: 'PURPLE', bodyClass: 'theme-purple bg-fuchsia-950 text-fuchsia-50', hex: '#4a044e', btnClass: 'bg-fuchsia-900 border-fuchsia-700 hover:bg-fuchsia-800 text-white' }
};

const TIME_BLOCKS = [
    { id: 'early-morning', label: '早朝', sh: 3, eh: 9 },
    { id: 'morning', label: '午前', sh: 9, eh: 12 },
    { id: 'afternoon', label: '午後', sh: 12, eh: 18 },
    { id: 'evening', label: '夜', sh: 18, eh: 22 },
    { id: 'late-night', label: '深夜', sh: 22, eh: 28 }
];

function showMsg(text, type = 'info') {
    const msg = document.getElementById('message-box');
    msg.textContent = text;
    msg.className = `fixed bottom-24 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl shadow-2xl z-50 transition-all duration-300 font-bold ${type === 'error' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'}`;
    msg.style.opacity = '1';
    msg.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => { 
        msg.style.opacity = '0'; 
        msg.style.transform = 'translate(-50%, 0px)';
    }, 3000);
}

window.changeTheme = (themeKey) => {
    if (!THEMES[themeKey]) return;
    currentTheme = themeKey;
    document.body.className = THEMES[themeKey].bodyClass + " transition-colors duration-500 min-h-screen p-4 pb-32";
    
    // Update theme container
    const tc = document.getElementById('theme-container');
    if (tc) tc.className = `max-w-7xl mx-auto border-b border-white/10 p-4 mb-6 rounded-2xl shadow-sm flex flex-wrap justify-between items-center gap-4 theme-bg-color`;
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === themeKey) {
            btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-slate-900');
        } else {
            btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-slate-900');
        }
    });
};

function initThemes() {
    const container = document.getElementById('theme-buttons');
    if (!container) return;
    container.innerHTML = '';
    
    Object.keys(THEMES).forEach(key => {
        const t = THEMES[key];
        const btn = document.createElement('button');
        btn.dataset.theme = key;
        btn.className = `theme-btn px-4 py-1 rounded-full border text-[11px] font-bold transition-all ${t.btnClass}`;
        btn.textContent = t.label;
        btn.onclick = () => changeTheme(key);
        container.appendChild(btn);
    });
    
    changeTheme('dark');
}

function initSelects() {
    const hourSelects = ['input-day-start-h', 'input-day-end-h', 'action-start-h', 'action-end-h'];
    hourSelects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = '';
        for (let i = 0; i <= 28; i++) { // 翌朝04時まで選択可能に拡張
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i.toString().padStart(2, '0');
            select.appendChild(opt);
        }
    });
    document.getElementById('input-day-start-h').value = 9;
    document.getElementById('input-day-end-h').value = 22;
}

window.applyTimePreset = () => {
    const preset = document.getElementById('input-time-preset').value;
    const startH = document.getElementById('input-day-start-h');
    const startM = document.getElementById('input-day-start-m');
    const endH = document.getElementById('input-day-end-h');
    const endM = document.getElementById('input-day-end-m');

    const ranges = {
        'early-morning': { sh: 3, sm: 0, eh: 9, em: 0 },
        'morning': { sh: 9, sm: 0, eh: 12, em: 0 },
        'afternoon': { sh: 12, sm: 0, eh: 18, em: 0 },
        'evening': { sh: 18, sm: 0, eh: 22, em: 0 },
        'late-night': { sh: 22, sm: 0, eh: 28, em: 0 } // 28 = 翌04時
    };

    if (ranges[preset]) {
        startH.value = ranges[preset].sh;
        startM.value = ranges[preset].sm;
        endH.value = ranges[preset].eh;
        endM.value = ranges[preset].em;
    }
};

window.generateNameFields = () => {
    const container = document.getElementById('names-input-container');
    const count = parseInt(document.getElementById('input-num-people').value) || 1;
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `場所 ${i + 1} の名前`;
        input.id = `name-input-${i}`;
        input.className = "p-3 rounded-xl bg-white/5 border border-white/10 text-sm outline-none focus:ring-2 focus:ring-indigo-500";
        container.appendChild(input);
    }
};

window.deployManager = () => {
    const numPeople = parseInt(document.getElementById('input-num-people').value) || 1;
    const numDays = parseInt(document.getElementById('input-num-days').value) || 1;
    const dayStartH = parseInt(document.getElementById('input-day-start-h').value);
    const dayStartM = parseInt(document.getElementById('input-day-start-m').value);
    const dayEndH = parseInt(document.getElementById('input-day-end-h').value);
    const dayEndM = parseInt(document.getElementById('input-day-end-m').value);

    if (dayStartH * 60 + dayStartM >= dayEndH * 60 + dayEndM) {
        return showMsg("終了時間は開始時間より後に設定してください", "error");
    }

    const names = [];
    for (let i = 0; i < numPeople; i++) {
        const el = document.getElementById(`name-input-${i}`);
        names.push(el && el.value ? el.value : `場所${i + 1}`);
    }

    config = { numPeople, numDays, dayStartH, dayStartM, dayEndH, dayEndM, names, viewMode: 'hourly' };
    scheduleEntries = [];
    
    updateFormOptions();
    renderManager();
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('main-manager').classList.remove('hidden');
};

function updateFormOptions() {
    const daySelect = document.getElementById('action-day-select');
    daySelect.innerHTML = '';
    for (let d = 1; d <= config.numDays; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d}日目`;
        daySelect.appendChild(opt);
    }

    const personSelect = document.getElementById('action-person-select');
    personSelect.innerHTML = '';
    config.names.forEach((name, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = name;
        personSelect.appendChild(opt);
    });

    syncEndTime();
}

window.syncEndTime = () => {
    const startH = parseInt(document.getElementById('action-start-h').value);
    const startM = parseInt(document.getElementById('action-start-m').value);
    const endHSelect = document.getElementById('action-end-h');
    const endMSelect = document.getElementById('action-end-m');

    // 終了時間を開始時間の30分後にデフォルト設定
    let nextH = startH;
    let nextM = startM + 30;
    if (nextM >= 60) { nextH++; nextM = 0; }
    if (nextH > 23) { nextH = 23; nextM = 30; }

    endHSelect.value = nextH;
    endMSelect.value = nextM;
};

function renderManager() {
    const header = document.getElementById('timeline-headers');
    header.innerHTML = '<th class="p-4 border-r sticky-time-col theme-bg-color z-50 font-bold uppercase tracking-widest text-[10px] opacity-60">時間軸</th>';
    config.names.forEach((name, i) => {
        const th = document.createElement('th');
        th.className = "p-4 border-r text-center min-w-[160px] w-[160px] header-person cursor-pointer hover-highlight";
        if (i % 2 === 0) th.classList.add('col-even');
        else th.classList.add('col-odd');
        if (i === selectedColumnIndex) th.classList.add('col-selected');
        th.textContent = name;
        th.onclick = () => selectColumn(i);
        header.appendChild(th);
    });

    const body = document.getElementById('schedule-table-body');
    body.innerHTML = '';

    if (config.viewMode === 'hourly') {
        renderHourlyRows(body);
    } else if (config.viewMode === 'block') {
        renderBlockRows(body);
    } else {
        renderDailyRows(body);
    }
}

function renderBlockRows(body) {
    for (let d = 1; d <= config.numDays; d++) {
        TIME_BLOCKS.forEach((block, bIdx) => {
            const tr = document.createElement('tr');
            tr.className = bIdx % 2 === 0 ? "time-row-even" : "time-row-odd";
            if (bIdx === 0 && d > 1) tr.classList.add('day-divider');

            const tdLabel = document.createElement('td');
            tdLabel.className = "p-2 border-r sticky-time-col font-bold text-[11px] text-center";
            tdLabel.innerHTML = `<div class="text-indigo-400 text-[10px] font-black">${d}日目</div><div>${block.label}</div>`;
            tr.appendChild(tdLabel);

            config.names.forEach((_, pIdx) => {
                const td = document.createElement('td');
                if (pIdx % 2 === 0) td.classList.add('col-even');
                else td.classList.add('col-odd');
                if (pIdx === selectedColumnIndex) td.classList.add('col-selected');
                td.dataset.pIdx = pIdx;
                td.dataset.day = d;
                td.dataset.blockId = block.id;
                td.ondragover = (e) => { e.preventDefault(); td.classList.add('drop-target'); };
                td.ondragleave = () => td.classList.remove('drop-target');
                td.ondrop = (e) => handleDrop(e, pIdx, d, null, block.id);
                td.onclick = (e) => {
                    if (e.target.closest('.schedule-bar')) return;
                    populateInput(pIdx, d, null, block.id);
                };

                const container = document.createElement('div');
                container.className = "flex flex-row flex-wrap gap-1 items-start h-full";

                const entries = scheduleEntries.filter(e => {
                    const entryBlock = TIME_BLOCKS.find(b => e.startMin >= b.sh * 60 && e.startMin < b.eh * 60);
                    return parseInt(e.personIndex) === pIdx && parseInt(e.day) === d && entryBlock?.id === block.id;
                });

                entries.forEach(entry => {
                    const bar = document.createElement('div');
                    bar.className = "schedule-bar relative h-auto py-1 flex-1 min-w-[120px] max-w-full"; 
                    bar.style.backgroundColor = entry.color || '#6366f1';
                    bar.style.position = 'static'; 
                    bar.draggable = true;
                    bar.ondragstart = (e) => e.dataTransfer.setData("entryId", entry.id);
                    bar.onclick = (e) => { e.stopPropagation(); editEntry(entry.id); };
                    bar.innerHTML = `<span class="text-[10px] block w-full pointer-events-none">${entry.content}</span><button onclick="event.stopPropagation(); removeEntry('${entry.id}')" class="delete-btn absolute top-1 right-1 z-50">✕</button>`;
                    container.appendChild(bar);
                });

                td.appendChild(container);
                tr.appendChild(td);
            });
            body.appendChild(tr);
        });
    }
}

function renderHourlyRows(body) {
    const ranges = {
        'early-morning': { sh: 3, eh: 9 },
        'morning': { sh: 9, eh: 12 },
        'afternoon': { sh: 12, eh: 18 },
        'evening': { sh: 18, eh: 22 },
        'late-night': { sh: 22, eh: 28 }
    };

    let startTotal = config.dayStartH * 60 + config.dayStartM;
    let endTotal = config.dayEndH * 60 + config.dayEndM;

    if (config.viewMode === 'block' && ranges[config.currentBlock]) {
        startTotal = ranges[config.currentBlock].sh * 60;
        endTotal = ranges[config.currentBlock].eh * 60;
    }

    for (let d = 1; d <= config.numDays; d++) {
        for (let m = startTotal; m <= endTotal; m += 30) {
            const tr = document.createElement('tr');
            const h = Math.floor(m / 60);
            const min = m % 60;
            const isDayStart = m === startTotal;

            tr.className = (m / 30) % 2 === 0 ? "time-row-even" : "time-row-odd";
            if (isDayStart && d > 1) tr.classList.add('day-divider');

            // 時間軸ラベル
            const tdTime = document.createElement('td');
            tdTime.className = "p-2 border-r sticky-time-col font-bold text-[11px] text-center";
            if (isDayStart) {
                tdTime.innerHTML = `<div class="text-indigo-400 text-[10px] font-black">${d}日目</div><div>${h}:${min.toString().padStart(2, '0')}</div>`;
            } else {
                tdTime.textContent = `${h}:${min.toString().padStart(2, '0')}`;
            }
            tr.appendChild(tdTime);

            // 各参加者のセル
            config.names.forEach((_, pIdx) => {
                const td = document.createElement('td');
                if (pIdx % 2 === 0) td.classList.add('col-even');
                else td.classList.add('col-odd');
                if (pIdx === selectedColumnIndex) td.classList.add('col-selected');
                td.dataset.pIdx = pIdx;
                td.dataset.day = d;
                td.dataset.min = m;
                td.ondragover = (e) => { e.preventDefault(); td.classList.add('drop-target'); };
                td.ondragleave = () => td.classList.remove('drop-target');
                td.ondrop = (e) => handleDrop(e, pIdx, d, m);
                td.onclick = (e) => {
                    if (e.target.closest('.schedule-bar')) return;
                    populateInput(pIdx, d, m, null);
                };

                const container = document.createElement('div');
                container.className = "flex flex-col gap-0.5";

                const entries = scheduleEntries.filter(e => 
                    parseInt(e.personIndex) === pIdx && 
                    parseInt(e.day) === d && 
                    parseInt(e.startMin) === m
                );

                entries.forEach((entry, eIdx) => {
                    const bar = document.createElement('div');
                    bar.className = "schedule-bar";
                    bar.style.backgroundColor = entry.color || '#6366f1';
                    bar.draggable = true;
                    bar.ondragstart = (e) => e.dataTransfer.setData("entryId", entry.id);
                    bar.onclick = (e) => { e.stopPropagation(); editEntry(entry.id); };
                    
                    // スパン表示のための高さ計算
                    const durationMins = entry.endMin - entry.startMin;
                    const height = (durationMins / 30) * 50 - 2;
                    bar.style.height = `${height}px`;

                    // 横並びのための幅と位置計算
                    const width = 100 / entries.length;
                    bar.style.width = `calc(${width}% - 4px)`;
                    bar.style.left = `calc(${eIdx * width}% + 2px)`;
                    
                    const durationText = durationMins >= 60 ? `${durationMins/60}h` : `${durationMins}m`;
                    bar.innerHTML = `<span class="text-[10px] block w-full pointer-events-none">${entry.content} <small class="opacity-70 pointer-events-none">(${durationText})</small></span><button onclick="event.stopPropagation(); removeEntry('${entry.id}')" class="delete-btn absolute top-1 right-1 z-50">✕</button>`;
                    container.appendChild(bar);
                });

                td.appendChild(container);
                tr.appendChild(td);
            });
            body.appendChild(tr);
        }
    }
}

function renderDailyRows(body) {
    for (let d = 1; d <= config.numDays; d++) {
        const tr = document.createElement('tr');
        tr.className = d % 2 === 0 ? "time-row-even border-b border-white/5" : "time-row-odd border-b border-white/5";

        const tdDay = document.createElement('td');
        tdDay.className = "p-4 border-r sticky-time-col font-bold text-center text-indigo-400";
        tdDay.textContent = `${d}日目`;
        tr.appendChild(tdDay);

        config.names.forEach((_, pIdx) => {
            const td = document.createElement('td');
            if (pIdx % 2 === 0) td.classList.add('col-even');
            else td.classList.add('col-odd');
            if (pIdx === selectedColumnIndex) td.classList.add('col-selected');
            td.dataset.pIdx = pIdx;
            td.dataset.day = d;
            td.ondragover = (e) => { e.preventDefault(); td.classList.add('drop-target'); };
            td.ondragleave = () => td.classList.remove('drop-target');
            td.ondrop = (e) => handleDrop(e, pIdx, d, null);
            td.onclick = (e) => {
                if (e.target.closest('.schedule-bar')) return;
                populateInput(pIdx, d, null, null);
            };

            const container = document.createElement('div');
            container.className = "flex flex-row flex-wrap gap-1 items-start";

            const entries = scheduleEntries.filter(e => 
                parseInt(e.personIndex) === pIdx && 
                parseInt(e.day) === d
            );

            entries.sort((a,b) => a.startMin - b.startMin).forEach(entry => {
                const h = Math.floor(entry.startMin / 60);
                const min = entry.startMin % 60;
                const item = document.createElement('div');
                item.className = "schedule-bar relative h-auto py-1 flex-1 min-w-[120px] max-w-full";
                item.style.backgroundColor = entry.color || '#6366f1';
                item.style.position = 'static';
                item.draggable = true;
                item.ondragstart = (e) => e.dataTransfer.setData("entryId", entry.id);
                item.onclick = (e) => { e.stopPropagation(); editEntry(entry.id); };
                item.innerHTML = `<span class="text-[10px] block w-full pointer-events-none">${h}:${min.toString().padStart(2,'0')} ${entry.content}</span><button onclick="event.stopPropagation(); removeEntry('${entry.id}')" class="delete-btn absolute top-1 right-1 z-50">✕</button>`;
                container.appendChild(item);
            });

            td.appendChild(container);
            tr.appendChild(td);
        });
        body.appendChild(tr);
    }
}

window.applyAction = () => {
    const pIdx = document.getElementById('action-person-select').value;
    const day = document.getElementById('action-day-select').value;
    const content = document.getElementById('action-content').value;
    const color = document.getElementById('action-color').value;

    let startMin, endMin;

    if (config.viewMode === 'block') {
        const blockId = document.getElementById('action-block-select').value;
        const block = TIME_BLOCKS.find(b => b.id === blockId);
        startMin = block.sh * 60;
        endMin = block.eh * 60;
    } else {
        const startH = parseInt(document.getElementById('action-start-h').value);
        const startM = parseInt(document.getElementById('action-start-m').value);
        const endH = parseInt(document.getElementById('action-end-h').value);
        const endM = parseInt(document.getElementById('action-end-m').value);
        startMin = startH * 60 + startM;
        endMin = endH * 60 + endM;
    }

    if (!content) return showMsg("内容を入力してください", "error");
    if (startMin >= endMin) return showMsg("終了時間は開始時間より後にしてください", "error");

    if (editingEntryId) {
        const entry = scheduleEntries.find(e => e.id === editingEntryId);
        if (entry) {
            entry.personIndex = pIdx;
            entry.day = day;
            entry.startMin = startMin;
            entry.endMin = endMin;
            entry.content = content;
            entry.color = color;
        }
        cancelEdit(); // Reset form state
        showMsg("更新しました");
    } else {
        scheduleEntries.push({
            id: Date.now().toString(),
            personIndex: pIdx,
            day,
            startMin,
            endMin,
            content,
            color
        });
        document.getElementById('action-content').value = '';
        showMsg("追加しました");
    }

    renderManager();
};

window.populateInput = (pIdx, day, startMin, blockId) => {
    document.getElementById('action-person-select').value = pIdx;
    document.getElementById('action-day-select').value = day;
    
    if (config.viewMode === 'block' && blockId) {
        document.getElementById('action-block-select').value = blockId;
    } else if (startMin !== null) {
        const h = Math.floor(startMin / 60);
        const m = startMin % 60;
        document.getElementById('action-start-h').value = h;
        document.getElementById('action-start-m').value = m;
        syncEndTime();
    }
};

window.editEntry = (id) => {
    const entry = scheduleEntries.find(e => e.id === id);
    if (!entry) return;
    
    editingEntryId = id;
    document.getElementById('action-person-select').value = entry.personIndex;
    document.getElementById('action-day-select').value = entry.day;
    document.getElementById('action-content').value = entry.content;
    document.getElementById('action-color').value = entry.color || '#6366f1';
    
    if (config.viewMode === 'block') {
        const block = TIME_BLOCKS.find(b => b.sh * 60 === entry.startMin);
        if (block) document.getElementById('action-block-select').value = block.id;
    } else {
        document.getElementById('action-start-h').value = Math.floor(entry.startMin / 60);
        document.getElementById('action-start-m').value = entry.startMin % 60;
        document.getElementById('action-end-h').value = Math.floor(entry.endMin / 60);
        document.getElementById('action-end-m').value = entry.endMin % 60;
    }
    
    document.getElementById('btn-apply-action').textContent = '更新する';
    document.getElementById('btn-apply-action').className = "flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95";
    document.getElementById('btn-cancel-action').classList.remove('hidden');
    
    document.getElementById('main-manager').scrollIntoView({ behavior: 'smooth' });
    showMsg("予定を編集します");
};

window.cancelEdit = () => {
    editingEntryId = null;
    document.getElementById('action-content').value = '';
    document.getElementById('btn-apply-action').textContent = '適用する';
    document.getElementById('btn-apply-action').className = "w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95";
    document.getElementById('btn-cancel-action').classList.add('hidden');
};

window.removeEntry = (id) => {
    scheduleEntries = scheduleEntries.filter(e => e.id !== id);
    renderManager();
};

function handleDrop(e, pIdx, day, min, blockId = null) {
    e.preventDefault();
    const entryId = e.dataTransfer.getData("entryId");
    const entry = scheduleEntries.find(e => e.id === entryId);
    if (!entry) return;

    const duration = entry.endMin - entry.startMin;
    entry.personIndex = pIdx;
    entry.day = day;

    if (blockId) {
        const block = TIME_BLOCKS.find(b => b.id === blockId);
        entry.startMin = block.sh * 60;
        entry.endMin = block.eh * 60;
    } else if (min !== null) {
        entry.startMin = min;
        entry.endMin = min + duration;
    }

    renderManager();
    showMsg("移動しました");
}

window.switchView = (mode) => {
    config.viewMode = mode;

    const btns = ['hourly', 'block', 'daily'];
    btns.forEach(b => {
        const el = document.getElementById(`view-btn-${b}`);
        if (!el) return;
        el.className = `px-6 py-2 rounded-lg text-xs font-bold transition-all ${mode === b ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white'}`;
    });

    // 入力フォームの切り替え
    const hourlyForm = document.getElementById('action-time-hourly');
    const blockForm = document.getElementById('action-time-block');
    if (mode === 'block') {
        hourlyForm.classList.add('hidden');
        blockForm.classList.remove('hidden');
    } else if (mode === 'daily') {
        hourlyForm.classList.add('hidden');
        blockForm.classList.add('hidden');
    } else {
        hourlyForm.classList.remove('hidden');
        blockForm.classList.add('hidden');
    }

    renderManager();
};

window.selectColumn = (idx) => {
    // 選択をトグルする
    if (selectedColumnIndex === idx) {
        selectedColumnIndex = -1;
    } else {
        selectedColumnIndex = idx;
    }

    // DOMのクラスを更新して色を反映
    document.querySelectorAll('.header-person').forEach((th, i) => {
        if (i === selectedColumnIndex) th.classList.add('col-selected');
        else th.classList.remove('col-selected');
    });

    document.querySelectorAll('td[data-p-idx]').forEach(td => {
        if (parseInt(td.dataset.pIdx) === selectedColumnIndex) td.classList.add('col-selected');
        else td.classList.remove('col-selected');
    });
};

const STORAGE_KEY = 'weby_schedule_manager_v2';

window.saveSession = () => {
    const name = document.getElementById('save-name').value || `Schedule_${new Date().toLocaleTimeString()}`;
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const sessionData = { id: currentSessionId || Date.now().toString(), sessionName: name, config, scheduleEntries, timestamp: Date.now() };
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
        config = session.config; scheduleEntries = session.scheduleEntries || []; currentSessionId = session.id;
        document.getElementById('save-name').value = session.sessionName;
        updateFormOptions(); 
        switchView(config.viewMode);
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
    if (confirm(`スケジュール「${session.sessionName}」を完全に削除しますか？`)) {
        const newSessions = sessions.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
        updateSessionList();
        showMsg("削除しました");
    }
};

window.newSession = () => { if (confirm("最初から作り直しますか？")) location.reload(); };

window.saveAsImage = () => {
    const captureArea = document.getElementById('schedule-capture-area');
    if (!captureArea) return showMsg("エラー：キャプチャエリアが見つかりません", "error");

    showMsg("画像を生成中です...");

    // 保存用に一時的にスタイルを変更して全体を描画させる
    const originalHeight = captureArea.style.height || '';
    const originalMaxHeight = captureArea.style.maxHeight || '';
    const originalOverflow = captureArea.style.overflow || '';
    
    // スクロールで隠れている部分も全て含めるために高さをリセット
    captureArea.classList.remove('h-[600px]');
    captureArea.style.height = 'auto';
    captureArea.style.maxHeight = 'none';
    captureArea.style.overflow = 'visible';

    html2canvas(captureArea, {
        backgroundColor: THEMES[currentTheme].hex,
        scale: 2 // 高画質化
    }).then(canvas => {
        // スタイルを元に戻す
        captureArea.classList.add('h-[600px]');
        captureArea.style.height = originalHeight;
        captureArea.style.maxHeight = originalMaxHeight;
        captureArea.style.overflow = originalOverflow;

        // ダウンロード
        const link = document.createElement('a');
        const saveName = document.getElementById('save-name').value || `Schedule_${new Date().toLocaleTimeString().replace(/:/g, '-')}`;
        link.download = `${saveName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showMsg("画像を保存しました");
    }).catch(err => {
        console.error(err);
        captureArea.classList.add('h-[600px]');
        captureArea.style.height = originalHeight;
        captureArea.style.maxHeight = originalMaxHeight;
        captureArea.style.overflow = originalOverflow;
        showMsg("画像の生成に失敗しました", "error");
    });
};

window.onload = () => { 
    initThemes();
    initSelects();
    generateNameFields(); 
    updateSessionList(); 
};
