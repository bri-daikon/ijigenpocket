// app.js - 付箋MEMORI (PHPサーバー同期版)

// === サーバーAPI設定 ===
// ・ロリポップサーバー内にHTMLごと配置する場合: "api.php" のままでOK
// ・GitHub Pages等から呼び出す場合: "https://your-domain.lolipop.jp/fusen/api.php" のようにフルURLを指定
const API_URL = "api.php";

// State
let notes = [];
let currentCategoryFilter = 'すべて';
let currentSearchQuery = '';
let isSyncing = false;
const STORAGE_KEY = 'fusen_memori_notes';
const THEME_KEY = 'fusen_memori_theme';

// DOM Elements
const boardContainer = document.getElementById('board-container');
const categoryFilterContainer = document.getElementById('category-filter');
const categoryOptionsDatalist = document.getElementById('category-options');
const searchInput = document.getElementById('search-input');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const refreshBtn = document.getElementById('refresh-btn');
const addNoteBtn = document.getElementById('add-note-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');

// Modal Elements
const noteModal = document.getElementById('note-modal');
const noteForm = document.getElementById('note-form');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const noteIdInput = document.getElementById('note-id');
const noteCategoryInput = document.getElementById('note-category');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const noteUrlInput = document.getElementById('note-url');
const noteColorInput = document.getElementById('note-color');
const modalTitle = document.getElementById('modal-title');

function init() {
    loadTheme();
    
    // 1. まずローカルキャッシュから読み込んで即座に表示
    loadFromLocal();
    renderBoard();
    
    // 2. サーバーと初回同期
    syncWithServer(false);
    
    // 3. 自動同期: 1時間おき (3600秒 = 3600000ミリ秒)
    setInterval(() => syncWithServer(false), 3600000);
    
    setupEventListeners();
}

// Data Management
function loadFromLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                notes = parsed;
            }
        } catch (e) {
            console.error("Local data parse error:", e);
        }
    }
}

function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

async function syncWithServer(isManual = false) {
    if (!API_URL || isSyncing) return;
    isSyncing = true;
    
    if (isManual && refreshBtn) {
        refreshBtn.textContent = '⌛';
    }
    
    try {
        const response = await fetch(API_URL, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        const serverNotes = await response.json();
        
        if (Array.isArray(serverNotes)) {
            if (serverNotes.length > 0) {
                // 内容に変更があるかチェック（チラつき防止）
                const currentStr = JSON.stringify(notes);
                const serverStr = JSON.stringify(serverNotes);
                
                if (currentStr !== serverStr) {
                    notes = serverNotes;
                    saveToLocal();
                    renderBoard();
                }
            } else if (notes.length > 0) {
                // サーバーが空でローカルにデータがある場合は、ローカルデータをサーバーにアップロード
                console.log("Server is empty, uploading local notes to server...");
                await uploadNotesToServer(notes);
            }
        }
        
        if (isManual && refreshBtn) {
            refreshBtn.textContent = '✔️';
            setTimeout(() => {
                refreshBtn.textContent = '🔄';
            }, 1000);
        }
    } catch (error) {
        console.warn("Server sync warning (offline or network issue):", error);
        if (isManual && refreshBtn) {
            refreshBtn.textContent = '❌';
            setTimeout(() => {
                refreshBtn.textContent = '🔄';
            }, 1500);
        }
    } finally {
        isSyncing = false;
    }
}

async function uploadNotesToServer(notesList) {
    if (!API_URL) return;
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'import',
                notes: notesList
            })
        });
        if (!res.ok) {
            console.error("Upload to server failed with status:", res.status);
        }
    } catch (e) {
        console.error("Upload to server error:", e);
    }
}

async function saveNote(noteData) {
    const now = new Date().toISOString();
    let tempId = null;
    
    if (noteData.id) {
        // Local Update (即時反映)
        const index = notes.findIndex(n => n.id === noteData.id);
        if (index > -1) {
            notes[index] = { ...notes[index], ...noteData, updatedAt: now };
        }
    } else {
        // Local Create (即時反映用仮ID)
        tempId = 'temp_' + Date.now();
        const newNote = {
            ...noteData,
            id: tempId,
            createdAt: now,
            updatedAt: now
        };
        notes.unshift(newNote);
    }
    
    saveToLocal();
    renderBoard();

    // サーバーに保存
    if (API_URL) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save',
                    note: noteData
                })
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.note) {
                    const targetId = noteData.id || tempId;
                    const idx = notes.findIndex(n => n.id === targetId);
                    if (idx > -1) {
                        notes[idx] = result.note;
                    }
                    saveToLocal();
                    renderBoard();
                }
            } else {
                console.error("Server save returned status:", response.status);
                if (response.status === 403) {
                    alert("サーバーへの保存が403で拒否されました。ロリポップのWAF設定をご確認ください。");
                }
            }
        } catch (error) {
            console.error("Save to server failed:", error);
        }
    }
}

async function deleteNote(id) {
    if (!confirm('この付箋を削除してもよろしいですか？')) return;

    // ローカルから即時削除
    notes = notes.filter(n => n.id !== id);
    saveToLocal();
    renderBoard();

    // サーバーから削除
    if (API_URL) {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete',
                    id: id
                })
            });
        } catch (error) {
            console.error("Delete on server failed:", error);
        }
    }
}

// Render
function renderBoard() {
    boardContainer.innerHTML = '';
    
    // Get unique categories and their latest colors
    const categoryColors = {};
    const categorySet = new Set();
    const sortedNotesForColors = [...notes].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime() || 0;
        const timeB = new Date(b.updatedAt).getTime() || 0;
        return timeB - timeA;
    });
    
    sortedNotesForColors.forEach(note => {
        const cat = note.category || '未分類';
        categorySet.add(cat);
        if (!categoryColors[cat] && note.color) {
            categoryColors[cat] = note.color;
        }
    });
    const uniqueCategories = Array.from(categorySet).sort();

    // 1. Update Datalist for Modal
    if (categoryOptionsDatalist) {
        categoryOptionsDatalist.innerHTML = '';
        uniqueCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            categoryOptionsDatalist.appendChild(option);
        });
    }

    // 2. Render Category Filters
    if (categoryFilterContainer) {
        categoryFilterContainer.innerHTML = '';
        
        const allBtn = document.createElement('button');
        allBtn.className = 'filter-btn' + (currentCategoryFilter === 'すべて' ? ' active' : '');
        allBtn.textContent = 'すべて';
        allBtn.addEventListener('click', () => {
            currentCategoryFilter = 'すべて';
            renderBoard();
        });
        categoryFilterContainer.appendChild(allBtn);

        uniqueCategories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn' + (currentCategoryFilter === cat ? ' active' : '');
            btn.textContent = cat;
            
            const catColor = categoryColors[cat];
            if (catColor) {
                btn.style.setProperty('--btn-color', catColor);
                btn.classList.add('colored-btn');
            }
            
            btn.addEventListener('click', () => {
                currentCategoryFilter = cat;
                renderBoard();
            });
            categoryFilterContainer.appendChild(btn);
        });
    }
    
    // 3. Filter notes
    let filteredNotes = notes;
    if (currentCategoryFilter !== 'すべて') {
        filteredNotes = notes.filter(n => (n.category || '未分類') === currentCategoryFilter);
    }

    if (currentSearchQuery) {
        const query = currentSearchQuery.toLowerCase();
        filteredNotes = filteredNotes.filter(n => 
            (n.title && n.title.toLowerCase().includes(query)) || 
            (n.content && n.content.toLowerCase().includes(query))
        );
    }
    
    // Sort descending
    filteredNotes.sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime() || 0;
        const timeB = new Date(b.updatedAt).getTime() || 0;
        return timeB - timeA;
    });

    // 4. Render Note Cards
    const fragment = document.createDocumentFragment();
    const nowMs = Date.now();

    filteredNotes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        
        if (note.color) {
            card.style.backgroundColor = note.color;
            card.style.color = '#333';
        }
        
        const dateStr = new Date(note.updatedAt).toLocaleString('ja-JP');
        
        const createdMs = new Date(note.createdAt || note.updatedAt).getTime();
        const updatedMs = new Date(note.updatedAt).getTime();
        const daysSinceCreated = (nowMs - createdMs) / (1000 * 60 * 60 * 24);
        const daysSinceUpdated = (nowMs - updatedMs) / (1000 * 60 * 60 * 24);
        
        let badgeHtml = '';
        if (daysSinceCreated <= 3) {
            badgeHtml = '<span class="badge badge-new">新着</span>';
        } else if (daysSinceUpdated <= 3) {
            badgeHtml = '<span class="badge badge-updated">更新</span>';
        }
        
        let urlHtml = '';
        if (note.url) {
            urlHtml = `<div class="note-card-url"><a href="${escapeHTML(note.url)}" target="_blank" rel="noopener noreferrer">🔗 参照を開く</a></div>`;
        }
        
        card.innerHTML = `
            <div class="note-actions">
                <button class="copy-btn" data-id="${escapeHTML(note.id)}" title="コピー">📋</button>
                <button class="edit-btn" data-id="${escapeHTML(note.id)}" title="編集">✏️</button>
                <button class="delete-btn" data-id="${escapeHTML(note.id)}" title="削除">🗑️</button>
            </div>
            <div class="note-card-title"><span>${escapeHTML(note.title)}</span>${badgeHtml}</div>
            <div class="note-card-date">更新: ${dateStr}</div>
            <div class="note-card-content">${escapeHTML(note.content)}</div>
            ${urlHtml}
        `;
        
        card.querySelector('.note-card-title').addEventListener('click', () => {
            card.classList.toggle('expanded');
        });
        
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(note);
        });
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });
        card.querySelector('.copy-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(note.content);
                const btn = e.target;
                const originalText = btn.textContent;
                btn.textContent = '✔️';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 1500);
            } catch (err) {
                alert('コピーに失敗しました');
            }
        });

        fragment.appendChild(card);
    });
    
    boardContainer.appendChild(fragment);
}

// Modal Management
function openModal(note = null) {
    if (note) {
        modalTitle.textContent = '付箋を編集';
        noteIdInput.value = note.id;
        noteCategoryInput.value = note.category;
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        noteUrlInput.value = note.url || '';
        noteColorInput.value = note.color || '#fff9c4';
    } else {
        modalTitle.textContent = '付箋を追加';
        noteForm.reset();
        noteIdInput.value = '';
        noteUrlInput.value = '';
        noteColorInput.value = '#fff9c4'; // default sticky yellow
    }
    noteModal.classList.remove('hidden');
}

function closeModal() {
    noteModal.classList.add('hidden');
    noteForm.reset();
}

// Event Listeners
function setupEventListeners() {
    addNoteBtn.addEventListener('click', () => openModal());
    cancelNoteBtn.addEventListener('click', closeModal);
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => syncWithServer(true));
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim();
            renderBoard();
        });
    }
    
    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const noteData = {
            id: noteIdInput.value || null,
            category: noteCategoryInput.value.trim() || '未分類',
            title: noteTitleInput.value.trim(),
            content: noteContentInput.value.trim(),
            url: noteUrlInput.value.trim(),
            color: noteColorInput.value
        };
        await saveNote(noteData);
        closeModal();
    });

    // Auto-sync color when category is selected/typed
    noteCategoryInput.addEventListener('input', (e) => {
        const selectedCategory = e.target.value.trim();
        if (selectedCategory) {
            const matchingNotes = notes.filter(n => (n.category || '未分類') === selectedCategory);
            if (matchingNotes.length > 0) {
                matchingNotes.sort((a, b) => {
                    const timeA = new Date(a.updatedAt).getTime() || 0;
                    const timeB = new Date(b.updatedAt).getTime() || 0;
                    return timeB - timeA;
                });
                if (matchingNotes[0].color) {
                    noteColorInput.value = matchingNotes[0].color;
                }
            }
        }
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        themeToggleBtn.textContent = newTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem(THEME_KEY, newTheme);
    });

    // Export
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(notes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fusen_memori_export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Import
    importBtn.addEventListener('click', () => {
        importInput.click();
    });

    importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    if (confirm(`インポートすると現在のデータが上書きされます。よろしいですか？\n（現在のデータを残したい場合は先にエクスポートしてください）`)) {
                        notes = importedNotes;
                        saveToLocal();
                        renderBoard();

                        // サーバーへ一括インポート
                        await uploadNotesToServer(importedNotes);
                        alert('インポートが完了しました。');
                    }
                } else {
                    alert('無効なファイルフォーマットです。');
                }
            } catch (err) {
                alert('ファイルの読み込みに失敗しました。');
                console.error(err);
            }
            importInput.value = ''; // reset
        };
        reader.readAsText(file);
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

// Utility
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Run
init();
