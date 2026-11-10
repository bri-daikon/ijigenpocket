let tasks = JSON.parse(localStorage.getItem('bizTasksV6')) || [];

const pastelColors = [
    { bg: '#E3F2FD', text: '#1E88E5' },
    { bg: '#F3E5F5', text: '#8E24AA' },
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#FFF3E0', text: '#EF6C00' },
    { bg: '#FCE4EC', text: '#C2185B' },
    { bg: '#E0F2F1', text: '#00796B' },
    { bg: '#FFFDE7', text: '#FBC02D' },
    { bg: '#EFEBE9', text: '#5D4037' }
];

function showMessage(msg, callback = null, showCancel = false) {
    const overlay = document.getElementById('modalOverlay');
    const msgDiv = document.getElementById('modalMsg');
    const btnDiv = document.getElementById('modalButtons');
    msgDiv.textContent = msg;
    btnDiv.innerHTML = "";
    const okBtn = document.createElement('button');
    okBtn.textContent = "OK";
    okBtn.onclick = () => { overlay.style.display = 'none'; if (callback) callback(true); };
    btnDiv.appendChild(okBtn);
    if (showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = "キャンセル";
        cancelBtn.style.backgroundColor = "#ccc";
        cancelBtn.onclick = () => { overlay.style.display = 'none'; if (callback) callback(false); };
        btnDiv.appendChild(cancelBtn);
    }
    overlay.style.display = 'flex';
}
window.showMessage = showMessage;

function getTagStyle(tagName) {
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) { hash = tagName.charCodeAt(i) + ((hash << 5) - hash); }
    return pastelColors[Math.abs(hash) % pastelColors.length];
}

// ローカル時刻での YYYY-MM-DD を取得する関数
function getLocalDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getRelativeDateString(deadlineStr) {
    if (!deadlineStr || deadlineStr === "設定なし") return "";
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(deadlineStr); d.setHours(0,0,0,0);
    const diff = Math.ceil((d - today) / (1000*60*60*24));
    if (diff === 0) return { text: "今日まで", class: "urgent" };
    if (diff === 1) return { text: "明日まで", class: "urgent" };
    if (diff === 2) return { text: "明後日まで", class: "" };
    if (diff < 0) return { text: "期限切れ", class: "urgent" };
    return { text: `あと ${diff} 日`, class: "" };
}

function getGoogleCalendarUrl(task) {
    const title = encodeURIComponent(`[タスク] ${task.text}`);
    const details = encodeURIComponent(`${task.memo}\n優先度: ${task.priority}\nタグ: ${task.tags.join(', ')}`);
    let dates = "";
    if (task.deadline && task.deadline !== "設定なし") {
        const d = task.deadline.replace(/-/g, "");
        dates = `&dates=${d}/${d}`;
    }
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${dates}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) monthFilter.value = `${year}-${month}`;

    updateTagUIs();
    renderTasks();
});

function updateTagUIs() { updateTagFilterOptions(); updateTagSelectionChoices(); }

function updateTagSelectionChoices() {
    const container = document.getElementById('tagSelection');
    if (!container) return;
    container.innerHTML = "";
    getAllUniqueTags().forEach(tag => {
        const span = document.createElement('span');
        span.className = "tag-choice";
        span.textContent = `#${tag}`;
        span.onclick = () => {
            const input = document.getElementById('tagInput');
            const current = input.value.split(/[,，、\s]+/).map(t => t.trim()).filter(t => t !== "");
            if (!current.includes(tag)) { current.push(tag); input.value = current.join(', '); }
        };
        container.appendChild(span);
    });
}

function getAllUniqueTags() {
    const all = new Set();
    tasks.forEach(t => t.tags?.forEach(tag => all.add(tag)));
    return Array.from(all).sort();
}

function addTask() {
    const input = document.getElementById('taskInput');
    const memo = document.getElementById('memoInput');
    const tag = document.getElementById('tagInput');
    const priority = document.getElementById('prioritySelect');
    const date = document.getElementById('dateInput');
    if (!input || !input.value.trim()) return;
    const tags = tag.value.split(/[,，、\s]+/).map(t => t.trim()).filter(t => t !== "");
    tasks.push({
        id: Date.now(),
        text: input.value,
        memo: memo.value.trim(),
        tags: tags,
        priority: priority.value,
        deadline: date.value || "設定なし",
        completed: false
    });
    saveData(); updateTagUIs(); renderTasks();
    input.value = ""; memo.value = ""; tag.value = "";
}
window.addTask = addTask;

function toggleComplete(id) { tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t); saveData(); renderTasks(); }
window.toggleComplete = toggleComplete;

function deleteTask(id) { showMessage("このタスクを削除しますか？", (ok) => { if (ok) { tasks = tasks.filter(t => t.id !== id); saveData(); updateTagUIs(); renderTasks(); } }, true); }
window.deleteTask = deleteTask;

function saveData() { localStorage.setItem('bizTasksV6', JSON.stringify(tasks)); }

function updateTagFilterOptions() {
    const filter = document.getElementById('tagFilter');
    if (!filter) return;
    const current = filter.value;
    filter.innerHTML = '<option value="">すべて</option>';
    getAllUniqueTags().forEach(tag => {
        const opt = document.createElement('option');
        opt.value = tag; opt.textContent = tag;
        if (tag === current) opt.selected = true;
        filter.appendChild(opt);
    });
}

function exportCSV() {
    if (tasks.length === 0) return;
    let csv = "タスク名,メモ,タグ,優先度,期限,完了状態\n";
    tasks.forEach(t => {
        const tags = t.tags ? t.tags.join(' ') : "";
        csv += [`"${t.text}"`,`"${t.memo}"`,`"${tags}"`,`"${t.priority}"`,`"${t.deadline}"`,`"${t.completed ? '完了' : '未完了'}"`].join(",") + "\n";
    });
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${getLocalDateString()}.csv`;
    link.click();
}
window.exportCSV = exportCSV;

function parseCSV(text) {
    const res = []; const lines = text.split(/\r?\n/);
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim(); if (!line) continue;
        const cols = []; let cur = ""; let quote = false;
        for (let char of line) {
            if (char === '"') quote = !quote;
            else if (char === ',' && !quote) { cols.push(cur.trim()); cur = ""; }
            else cur += char;
        }
        cols.push(cur.trim()); res.push(cols);
    }
    return res;
}

function importCSV(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const rows = parseCSV(e.target.result);
            const newT = rows.map((c, i) => ({
                id: Date.now() + i, text: c[0] || "無題", memo: c[1] || "",
                tags: c[2] ? c[2].split(/\s+/) : [],
                priority: c[3] || "中", deadline: c[4] || "設定なし", completed: c[5] === '完了'
            }));
            if (newT.length) showMessage(`${newT.length}件読み込みますか？`, (ok) => { if (ok) { tasks = [...tasks, ...newT]; saveData(); updateTagUIs(); renderTasks(); } }, true);
        } catch (err) { showMessage("CSV解析エラー"); }
        event.target.value = "";
    };
    reader.readAsText(file);
}
window.importCSV = importCSV;

function saveAsImage() {
    const target = document.getElementById('captureTarget');
    const ids = ['actionSection', 'inputSection'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    html2canvas(target, { backgroundColor: "#f0f2f5", scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `tasks_${Date.now()}.png`;
        link.href = canvas.toDataURL(); link.click();
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        });
    });
}
window.saveAsImage = saveAsImage;

function renderTasks() {
    const list = document.getElementById('taskList');
    if (!list) return;
    const hideCompletedEl = document.getElementById('hideCompleted');
    const monthFilterEl = document.getElementById('monthFilter');
    const tagFilterEl = document.getElementById('tagFilter');
    
    const hide = hideCompletedEl ? hideCompletedEl.checked : false;
    const month = monthFilterEl ? monthFilterEl.value : "";
    const tag = tagFilterEl ? tagFilterEl.value : "";
    const showAllMonths = document.getElementById('showAllMonths')?.checked || false;
    
    list.innerHTML = "";
    const sorted = [...tasks].sort((a, b) => {
        if (a.deadline === "設定なし") return 1; if (b.deadline === "設定なし") return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });
    sorted.forEach(t => {
        if (hide && t.completed) return;
        if (!showAllMonths) {
            if (month && t.deadline && t.deadline !== "設定なし" && t.deadline.substring(0, 7) !== month) return;
            if (month && (!t.deadline || t.deadline === "設定なし")) return;
        }
        if (tag && !t.tags?.includes(tag)) return;
        const rel = getRelativeDateString(t.deadline);
        const li = document.createElement('li');
        li.className = t.completed ? "completed" : "";
        const pc = t.priority === "高" ? "bg-high" : (t.priority === "中" ? "bg-medium" : "bg-low");
        li.innerHTML = `
            <div class="checkbox-container"><input type="checkbox" ${t.completed ? "checked" : ""} onclick="toggleComplete(${t.id})"></div>
            <div class="task-info">
                <span class="task-text">${t.text}</span>
                ${t.memo ? `<div class="task-memo">${t.memo}</div>` : ""}
                <div class="task-tags">${t.tags.map(tg => `<span class="tag-badge" style="background:${getTagStyle(tg).bg};color:${getTagStyle(tg).text};">#${tg}</span>`).join('')}</div>
                <div class="task-meta"><span class="prio-badge ${pc}">${t.priority}</span><span>📅 ${t.deadline}</span>${rel ? `<span class="deadline-badge ${rel.class}">${rel.text}</span>` : ""}</div>
            </div>
            <div class="btn-action-group">
                <div class="flex gap-1">
                    <a href="${getGoogleCalendarUrl(t)}" target="_blank" class="calendar-btn" title="Googleカレンダーに登録">🗓 Google</a>
                    <a href="SSCalendar.html" class="calendar-btn site-calendar-btn" title="自作カレンダーで表示">📅 連携</a>
                </div>
                <button class="delete-btn" onclick="deleteTask(${t.id})">削除</button>
            </div>
        `;
        list.appendChild(li);
    });
    if (!list.innerHTML) list.innerHTML = `<li style="color:#aaa; justify-content:center;">タスクはありません</li>`;
}
window.renderTasks = renderTasks;

function toggleMonthFilter() {
    const showAll = document.getElementById('showAllMonths').checked;
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
        monthFilter.disabled = showAll;
        monthFilter.style.opacity = showAll ? "0.5" : "1";
    }
    renderTasks();
}
window.toggleMonthFilter = toggleMonthFilter;
