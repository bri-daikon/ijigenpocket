// --- State Management ---
let currentView = 'month';
let referenceDate = new Date();
let events = JSON.parse(localStorage.getItem('weby_events') || '[]');
let categories = JSON.parse(localStorage.getItem('weby_categories') || JSON.stringify([
    { id: 'work', name: '仕事', color: '#3b82f6' },
    { id: 'private', name: 'プライベート', color: '#22c55e' },
    { id: 'important', name: '重要', color: '#ef4444' },
    { id: 'task', name: 'タスク', color: '#8b5cf6' },
    { id: 'other', name: 'その他', color: '#9ca3af' }
]));
// タスクカテゴリが未登録の場合は追加
if (!categories.find(c => c.id === 'task')) {
    categories.push({ id: 'task', name: 'タスク', color: '#8b5cf6' });
}
let editingEventId = null;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

window.onload = () => {
    const savedTheme = localStorage.getItem('weby_theme') || 'default';
    setTheme(savedTheme);
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) themeSelect.value = savedTheme;
    updateCategorySelectors();
    lucide.createIcons();
    render();
};

function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('weby_theme', theme);
    render();
}
window.setTheme = setTheme;

function openCategoryModal() { renderCategoryList(); document.getElementById('categoryModal').classList.remove('hidden'); }
window.openCategoryModal = openCategoryModal;

function closeCategoryModal() { document.getElementById('categoryModal').classList.add('hidden'); }
window.closeCategoryModal = closeCategoryModal;

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    if (!list) return;
    list.innerHTML = '<h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">登録済みカテゴリ</h4>';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 bg-white border p-3 rounded-xl shadow-sm';
        item.innerHTML = `<div class="w-6 h-6 rounded-full" style="background-color: ${cat.color}"></div><span class="flex-1 font-bold">${cat.name}</span><button onclick="deleteCategory('${cat.id}')" class="text-red-400 hover:text-red-600 transition p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
        list.appendChild(item);
    });
    lucide.createIcons();
}

function addCategory() {
    const name = document.getElementById('newCatName').value.trim(); const color = document.getElementById('newCatColor').value;
    if (!name) return;
    const newCat = { id: 'cat_' + Date.now(), name, color };
    categories.push(newCat); saveCategories(); document.getElementById('newCatName').value = ''; renderCategoryList(); updateCategorySelectors();
}
window.addCategory = addCategory;

function deleteCategory(id) {
    if (categories.length <= 1) return;
    if (!confirm('削除しますか？')) return;
    categories = categories.filter(c => c.id !== id); saveCategories(); renderCategoryList(); updateCategorySelectors(); render();
}
window.deleteCategory = deleteCategory;

function saveCategories() { localStorage.setItem('weby_categories', JSON.stringify(categories)); }

function updateCategorySelectors() {
    const select = document.getElementById('eventCategory'); if (!select) return;
    select.innerHTML = '';
    categories.forEach(cat => {
        const opt = document.createElement('option'); opt.value = cat.id; opt.textContent = cat.name; select.appendChild(opt);
    });
}

function getLocalDateString(date) {
    const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
window.getLocalDateString = getLocalDateString;

function isDateInRange(targetDateStr, startDateStr, endDateStr) { 
    const end = endDateStr || startDateStr; 
    return targetDateStr >= startDateStr && targetDateStr <= end; 
}

function toggleTimeInputs() { document.getElementById('timeInputs').style.display = document.getElementById('eventAllDay').checked ? 'none' : 'grid'; }
window.toggleTimeInputs = toggleTimeInputs;

function formatHeaderDate(date, view) {
    const year = date.getFullYear(); const month = date.getMonth() + 1; const day = date.getDate(); const weekday = WEEKDAYS[date.getDay()];
    if (view === 'day' || view === 'hourly') return `${year}年${month}月${day}日 (${weekday})`;
    if (view === 'month' || view === '3months') return `${year}年 ${month}月`;
    if (view === 'year') return `${year}年`;
    if (view === 'week' || view === '2weeks') {
        const start = new Date(date); start.setDate(date.getDate() - date.getDay());
        const end = new Date(start); end.setDate(start.getDate() + (view === 'week' ? 6 : 13));
        return `${start.getMonth() + 1}/${start.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`;
    }
    return `${year}年 ${month}月`;
}

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('bg-black/20', 'shadow-sm');
        if (btn.dataset.view === view) btn.classList.add('bg-black/20', 'shadow-sm');
    });
    render();
}
window.setView = setView;

function changeDate(delta) {
    switch (currentView) {
        case 'hourly': case 'day': referenceDate.setDate(referenceDate.getDate() + delta); break;
        case 'week': referenceDate.setDate(referenceDate.getDate() + (delta * 7)); break;
        case '2weeks': referenceDate.setDate(referenceDate.getDate() + (delta * 14)); break;
        case 'month': referenceDate.setMonth(referenceDate.getMonth() + delta); break;
        case '3months': referenceDate.setMonth(referenceDate.getMonth() + (delta * 3)); break;
        case 'year': referenceDate.setFullYear(referenceDate.getFullYear() + delta); break;
    }
    render();
}
window.changeDate = changeDate;

function goToToday() { referenceDate = new Date(); render(); }
window.goToToday = goToToday;

async function downloadCalendarImage() {
    const target = document.querySelector('.calendar-card');
    if (!target) return;
    
    // 出力時の理想的な横幅（1400px）を設定
    const exportWidth = 1400;

    const tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.top = '-9999px';
    tempWrapper.style.left = '0';
    tempWrapper.style.width = exportWidth + 'px'; // 横幅を固定して広げる
    tempWrapper.style.padding = '32px';
    tempWrapper.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--bg-color');
    tempWrapper.style.color = getComputedStyle(document.body).getPropertyValue('--text-main');
    tempWrapper.style.fontFamily = getComputedStyle(document.body).fontFamily;
    
    // 年月タイトル部分
    const title = document.createElement('h2');
    title.innerText = document.getElementById('currentDateDisplay').innerText;
    title.style.fontSize = '36px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '24px';
    title.style.textAlign = 'center';
    title.style.borderBottom = `3px solid ${getComputedStyle(document.body).getPropertyValue('--border-color')}`;
    title.style.paddingBottom = '16px';
    
    // カレンダー本体をクローンし、幅を100%にする
    const clone = target.cloneNode(true);
    clone.style.width = '100%';
    clone.style.maxWidth = 'none';
    
    tempWrapper.appendChild(title);
    tempWrapper.appendChild(clone);
    document.body.appendChild(tempWrapper);

    try {
        const canvas = await html2canvas(tempWrapper, {
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg-color'),
            scale: 2, // 高解像度
            logging: false, 
            useCORS: true,
            allowTaint: true,
            scrollY: 0,
            width: exportWidth + 64, // パディング分を加味
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `calendar_${getLocalDateString(referenceDate)}.png`;
        link.href = image;
        link.click();
    } catch (err) {
        console.error("Image generation failed", err);
    } finally {
        document.body.removeChild(tempWrapper);
    }
}
window.downloadCalendarImage = downloadCalendarImage;

function sortEvents(eventList) {
    return eventList.sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        return timeA.localeCompare(timeB);
    });
}

function render() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    const dateDisplay = document.getElementById('currentDateDisplay');
    const downloadBtn = document.getElementById('downloadBtn');
    
    container.innerHTML = '';
    if (dateDisplay) dateDisplay.innerText = formatHeaderDate(referenceDate, currentView);
    
    if (downloadBtn) {
        if (currentView === 'month') downloadBtn.classList.remove('hidden');
        else downloadBtn.classList.add('hidden');
    }

    // タスクデータを読み込んでイベントに変換
    const tasks = JSON.parse(localStorage.getItem('bizTasksV6') || '[]');
    const taskEvents = tasks
        .filter(t => !t.completed && t.deadline && t.deadline !== "設定なし")
        .map(t => ({
            id: `task_${t.id}`,
            title: `📌 ${t.text}`,
            start: t.deadline,
            end: t.deadline,
            isAllDay: true,
            category: 'task',
            description: t.memo,
            isTask: true
        }));
    
    const allEvents = [...events, ...taskEvents];

    if (currentView === 'month') renderMonth(container, referenceDate, allEvents);
    else if (currentView === 'week' || currentView === '2weeks' || currentView === 'day') renderWeek(container, referenceDate, (currentView === 'week' ? 7 : (currentView === '2weeks' ? 14 : 1)), allEvents);
    else if (currentView === 'hourly') renderHourly(container, referenceDate, allEvents);
    else if (currentView === '3months') renderMultiMonth(container, referenceDate, 3, allEvents);
    else if (currentView === 'year') renderMultiMonth(container, referenceDate, 12, allEvents);

    lucide.createIcons();
}
window.render = render;

function createEventElement(e, currentStr, showDesc = false) {
    const isStart = e.start === currentStr;
    const cat = categories.find(c => c.id === e.category) || categories[0];
    const ev = document.createElement('div');
    ev.className = 'event-item';
    ev.style.borderColor = cat.color;
    ev.style.backgroundColor = cat.color + '40';
    
    const theme = document.body.getAttribute('data-theme') || 'default';
    const isNeon = theme.startsWith('neon');
    if (isNeon) ev.style.color = cat.color;

    const t = document.createElement('div'); t.className = "font-bold leading-tight";
    const timeInfo = (e.isAllDay ? '終日' : (e.startTime || ''));
    t.innerText = isStart ? `${timeInfo} ${e.title}` : `(続く) ${e.title}`;
    ev.appendChild(t);
    
    if (showDesc && e.description) {
        const d = document.createElement('div'); d.className = "text-[10px] opacity-75 italic leading-tight mt-1";
        d.innerText = e.description; ev.appendChild(d);
    }
    ev.onclick = (event) => { event.stopPropagation(); editEvent(e.id); };
    return ev;
}

function renderMonth(container, date, eventList) {
    const year = date.getFullYear(); const month = date.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); const totalCells = Math.ceil((lastDay.getDate() + startOffset) / 7) * 7;
    const card = document.createElement('div'); card.className = 'calendar-card';
    const grid = document.createElement('div'); grid.className = 'calendar-grid';
    WEEKDAYS.forEach(day => {
        const h = document.createElement('div');
        h.className = `p-2 text-center text-xs font-bold border-r border-b border-inherit bg-black/5 ${day === '日' ? 'text-red-500' : (day === '土' ? 'text-blue-500' : '')}`;
        h.innerText = day; grid.appendChild(h);
    });
    const startDate = new Date(year, month, 1 - startOffset);
    for (let i = 0; i < totalCells; i++) {
        const current = new Date(startDate); current.setDate(startDate.getDate() + i);
        const currentStr = getLocalDateString(current);
        const cell = document.createElement('div');
        cell.className = `day-cell p-1 hover:brightness-95 transition ${current.getMonth() !== month ? 'cell-off' : ''}`;
        cell.innerHTML = `<div class="flex justify-between mb-1 p-1"><span class="day-number text-xs font-bold ${current.toDateString() === new Date().toDateString() ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}">${current.getDate()}</span></div>`;
        
        const dayEvents = eventList.filter(e => isDateInRange(currentStr, e.start, e.end));
        sortEvents(dayEvents).forEach(e => cell.appendChild(createEventElement(e, currentStr)));
        
        cell.onclick = () => openModal(currentStr); grid.appendChild(cell);
    }
    card.appendChild(grid); container.appendChild(card);
}

function renderWeek(container, date, daysCount, eventList) {
    let start = new Date(date); if (daysCount > 1) start.setDate(date.getDate() - date.getDay());
    const card = document.createElement('div'); card.className = 'calendar-card divide-y divide-inherit';
    for (let i = 0; i < daysCount; i++) {
        const current = new Date(start); current.setDate(start.getDate() + i);
        const currentStr = getLocalDateString(current);
        const row = document.createElement('div'); row.className = `week-row ${current.toDateString() === new Date().toDateString() ? 'bg-blue-500/10' : ''}`;
        const info = document.createElement('div'); info.className = `week-date-col flex flex-col items-center justify-center p-3`;
        info.innerHTML = `<span class="text-xs font-bold ${current.getDay() === 0 ? 'text-red-500' : (current.getDay() === 6 ? 'text-blue-500' : '')}">${WEEKDAYS[current.getDay()]}</span><span class="text-3xl font-black">${current.getDate()}</span>`;
        const evArea = document.createElement('div'); evArea.className = 'p-3 flex flex-col gap-1 cursor-pointer w-full';
        
        const dayEvents = eventList.filter(e => isDateInRange(currentStr, e.start, e.end));
        if (dayEvents.length === 0) evArea.innerHTML = `<span class="opacity-30 text-xs italic">予定なし</span>`;
        else sortEvents(dayEvents).forEach(e => evArea.appendChild(createEventElement(e, currentStr, true)));
        
        row.onclick = () => openModal(currentStr); row.appendChild(info); row.appendChild(evArea); card.appendChild(row);
    }
    container.appendChild(card);
}

function renderHourly(container, date, eventList) {
    const dateStr = getLocalDateString(date);
    const rawDayEvents = eventList.filter(e => !e.isAllDay && isDateInRange(dateStr, e.start, e.end));
    const dayEvents = rawDayEvents.map(e => {
        let sMin = 0; let eMin = 1440;
        if (e.start === dateStr && e.startTime) { const [h, m] = e.startTime.split(':').map(Number); sMin = h * 60 + m; } else if (e.start < dateStr) { sMin = 0; }
        if (e.end === dateStr && e.endTime) { const [h, m] = e.endTime.split(':').map(Number); eMin = h * 60 + m; } else if (e.end > dateStr) { eMin = 1440; } else if (e.start === dateStr && !e.endTime) { eMin = sMin + 60; }
        return { ...e, sMin, eMin };
    }).sort((a,b) => a.sMin - b.sMin);

    const columns = [];
    dayEvents.forEach(ev => {
        let colIdx = -1;
        for (let i = 0; i < columns.length; i++) { if (columns[i] <= ev.sMin) { colIdx = i; break; } }
        if (colIdx === -1) { colIdx = columns.length; columns.push(ev.eMin); } else { columns[colIdx] = ev.eMin; }
        ev.colIdx = colIdx;
    });

    const card = document.createElement('div'); card.className = 'calendar-card relative overflow-hidden';
    const grid = document.createElement('div'); grid.className = 'divide-y divide-black/5';
    for (let h = 0; h < 24; h++) {
        const row = document.createElement('div'); row.className = 'time-grid h-16';
        row.innerHTML = `<div class="bg-black/5 flex items-center justify-center text-xs opacity-50 border-r border-inherit w-20">${h}:00</div><div class="flex-1 hover:bg-black/5 cursor-crosshair" onclick="openModal('${dateStr}', '${h.toString().padStart(2,'0')}:00')"></div>`;
        grid.appendChild(row);
    }
    card.appendChild(grid);

    const overlay = document.createElement('div'); overlay.className = 'absolute top-0 right-0 left-20 bottom-0 pointer-events-none';
    dayEvents.forEach(ev => {
        const cat = categories.find(cat => cat.id === ev.category) || categories[0];
        const totalCols = Math.max(1, columns.length);
        const widthPercent = 100 / totalCols;
        const leftPercent = ev.colIdx * widthPercent;
        const topPx = (ev.sMin / 60) * 64;
        const heightPx = Math.max((ev.eMin - ev.sMin) / 60 * 64, 32);
        const block = document.createElement('div'); 
        block.className = `hourly-event pointer-events-auto shadow-md`;
        block.style.top = `${topPx}px`; block.style.height = `${heightPx}px`;
        block.style.width = `calc(${widthPercent}% - 6px)`; block.style.left = `calc(${leftPercent}% + 3px)`;
        block.style.borderLeft = `5px solid ${cat.color}`; block.style.backgroundColor = cat.color + '59';
        const startLabel = (ev.start === dateStr ? ev.startTime : "0:00");
        const endLabel = (ev.end === dateStr ? ev.endTime : "24:00");
        block.innerHTML = `<div class="font-bold text-[12px] leading-snug mb-0.5 truncate">${ev.title}</div><div class="text-[10px] opacity-90 leading-tight">${startLabel} - ${endLabel}</div>`;
        block.onclick = (event) => { event.stopPropagation(); editEvent(ev.id); }; 
        overlay.appendChild(block);
    });

    const allDayRaw = eventList.filter(e => e.isAllDay && isDateInRange(dateStr, e.start, e.end));
    const allDay = sortEvents(allDayRaw);
    if (allDay.length) {
        const bar = document.createElement('div'); bar.className = 'bg-black/5 border-b border-inherit p-3 flex flex-wrap gap-2';
        allDay.forEach(e => {
            const cat = categories.find(cat => cat.id === e.category) || categories[0];
            const tag = document.createElement('div'); tag.className = `px-4 py-2 rounded-full text-xs font-bold cursor-pointer shadow-sm border`;
            tag.style.backgroundColor = cat.color + '40'; tag.style.borderColor = cat.color;
            tag.innerText = `終日: ${e.title}`; tag.onclick = () => editEvent(e.id); bar.appendChild(tag);
        });
        container.prepend(bar);
    }
    card.appendChild(overlay); container.appendChild(card);
}

function renderMultiMonth(container, date, count, eventList) {
    const grid = document.createElement('div'); grid.className = `grid gap-8 ${count === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`;
    for (let i = 0; i < count; i++) {
        const curr = new Date(date.getFullYear(), date.getMonth() + i, 1);
        const box = document.createElement('div'); box.className = 'p-4 rounded-xl calendar-card';
        box.innerHTML = `<h3 class="font-bold mb-3 text-center text-base">${curr.getFullYear()}年 ${curr.getMonth()+1}月</h3>`;
        const mini = document.createElement('div'); mini.className = 'grid grid-cols-7 text-[10px] gap-px bg-black/10';
        WEEKDAYS.forEach(d => mini.innerHTML += `<div class="text-center font-bold opacity-50 py-2 bg-black/5">${d}</div>`);
        const offset = curr.getDay(); const days = new Date(curr.getFullYear(), curr.getMonth()+1, 0).getDate();
        for (let j = 0; j < offset; j++) mini.innerHTML += '<div class="bg-black/5"></div>';
        for (let d = 1; d <= days; d++) {
            const currentDay = new Date(curr.getFullYear(), curr.getMonth(), d); const dStr = getLocalDateString(currentDay);
            const dayEvents = eventList.filter(e => isDateInRange(dStr, e.start, e.end)); const has = dayEvents.length > 0;
            const isToday = currentDay.toDateString() === new Date().toDateString();
            let styleAttr = ""; let classList = "text-center py-3 cursor-pointer transition hover:brightness-95 ";
            if (has) { const cat = categories.find(c => c.id === dayEvents[0].category) || categories[0]; styleAttr = `style="background-color: ${cat.color}22; border-bottom: 3px solid ${cat.color};"`; classList += "font-bold "; } else { classList += "bg-white/90 "; }
            if (isToday) { classList += "ring-2 ring-blue-500 ring-inset "; }
            mini.innerHTML += `<div onclick="referenceDate=new Date('${dStr}');setView('day')" class="${classList}" ${styleAttr}>${d}</div>`;
        }
        box.appendChild(mini); grid.appendChild(box);
    }
    container.appendChild(grid);
}

function openModal(date = '', time = '') {
    editingEventId = null; document.getElementById('modalTitle').innerText = '予定の登録';
    document.getElementById('eventTitle').value = ''; document.getElementById('eventCategory').value = categories[0].id;
    document.getElementById('eventAllDay').checked = false; document.getElementById('eventDescription').value = '';
    document.getElementById('eventStartDate').value = date || getLocalDateString(new Date());
    document.getElementById('eventEndDate').value = date || getLocalDateString(new Date());
    document.getElementById('eventStartTime').value = time || '';
    document.getElementById('eventEndTime').value = time ? (parseInt(time.split(':')[0])+1).toString().padStart(2,'0')+':00' : '';
    document.getElementById('duplicateBtn').classList.add('hidden'); document.getElementById('deleteBtn').classList.add('hidden'); 
    document.getElementById('eventModal').classList.remove('hidden'); toggleTimeInputs();
}
window.openModal = openModal;

function closeModal() { document.getElementById('eventModal').classList.add('hidden'); }
window.closeModal = closeModal;

function saveEvent() {
    const title = document.getElementById('eventTitle').value; const start = document.getElementById('eventStartDate').value;
    if (!title || !start) return alert('入力内容を確認してください');
    const data = { title, start, end: document.getElementById('eventEndDate').value || start, startTime: document.getElementById('eventAllDay').checked ? '' : document.getElementById('eventStartTime').value, endTime: document.getElementById('eventAllDay').checked ? '' : document.getElementById('eventEndTime').value, category: document.getElementById('eventCategory').value, isAllDay: document.getElementById('eventAllDay').checked, description: document.getElementById('eventDescription').value };
    if (editingEventId) { const idx = events.findIndex(e => e.id === editingEventId); events[idx] = { ...data, id: editingEventId }; } else { events.push({ ...data, id: Date.now().toString() }); }
    localStorage.setItem('weby_events', JSON.stringify(events)); closeModal(); render();
}
window.saveEvent = saveEvent;

function editEvent(id) {
    if (id.startsWith('task_')) {
        if (confirm('これはタスク管理ツールのタスクです。タスク管理画面を開きますか？')) {
            window.location.href = 'ijigentask.html';
        }
        return;
    }
    const ev = events.find(e => e.id === id); if (!ev) return;
    editingEventId = id; document.getElementById('modalTitle').innerText = '予定を編集';
    document.getElementById('eventTitle').value = ev.title; document.getElementById('eventCategory').value = categories.some(c => c.id === ev.category) ? ev.category : categories[0].id;
    document.getElementById('eventAllDay').checked = ev.isAllDay; document.getElementById('eventStartDate').value = ev.start;
    document.getElementById('eventEndDate').value = ev.end; document.getElementById('eventStartTime').value = ev.startTime;
    document.getElementById('eventEndTime').value = ev.endTime; document.getElementById('eventDescription').value = ev.description;
    document.getElementById('duplicateBtn').classList.remove('hidden'); document.getElementById('deleteBtn').classList.remove('hidden'); 
    document.getElementById('eventModal').classList.remove('hidden'); toggleTimeInputs();
}
window.editEvent = editEvent;

function duplicateEvent() { editingEventId = null; document.getElementById('modalTitle').innerText = '予定を複製'; document.getElementById('duplicateBtn').classList.add('hidden'); document.getElementById('deleteBtn').classList.add('hidden'); }
window.duplicateEvent = duplicateEvent;

function deleteEvent() { if (confirm('削除しますか？')) { events = events.filter(e => e.id !== editingEventId); localStorage.setItem('weby_events', JSON.stringify(events)); closeModal(); render(); } }
window.deleteEvent = deleteEvent;

function exportToGoogle() {
    const t = document.getElementById('eventTitle').value; const all = document.getElementById('eventAllDay').checked;
    const s = document.getElementById('eventStartDate').value.replace(/-/g, ''); const e = document.getElementById('eventEndDate').value.replace(/-/g, '');
    let dp = all ? `${s}/${getLocalDateString(new Date(new Date(document.getElementById('eventEndDate').value).getTime() + 86400000)).replace(/-/g,'')}` : `${s}T${document.getElementById('eventStartTime').value.replace(/:/g,'')}00/${e}T${document.getElementById('eventEndTime').value.replace(/:/g,'')}00`;
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t)}&dates=${dp}&details=${encodeURIComponent(document.getElementById('eventDescription').value)}`, '_blank');
}
window.exportToGoogle = exportToGoogle;
