// app.js

// === Firebase Config ===
// ユーザーが自分のFirebaseを使用する場合は、ここの設定を書き換える
const firebaseConfig = {
  apiKey: "AIzaSyDGFygrkRwp5rcClriBNyc2u_DwDIC_DHI",
  authDomain: "fusen-memori.firebaseapp.com",
  projectId: "fusen-memori",
  storageBucket: "fusen-memori.firebasestorage.app",
  messagingSenderId: "41552418931",
  appId: "1:41552418931:web:c2fc9d9ac03a1472477206",
  measurementId: "G-MV7FVHWNJQ"
};


let db = null;
const useFirebase = Object.keys(firebaseConfig).length > 0 && firebaseConfig.apiKey;

if (useFirebase) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("Firebase initialized");
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

// State
let notes = [];
let currentCategoryFilter = 'すべて';
let currentSearchQuery = '';
const STORAGE_KEY = 'fusen_memori_notes';
const THEME_KEY = 'fusen_memori_theme';

// DOM Elements
const boardContainer = document.getElementById('board-container');
const categoryFilterContainer = document.getElementById('category-filter');
const categoryOptionsDatalist = document.getElementById('category-options');
const searchInput = document.getElementById('search-input');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
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
    
    // まずローカルストレージから読み込んで即座に表示（表示の高速化＆オフライン/エラー時の対策）
    loadFromLocal();
    renderBoard();
    
    if (useFirebase && db) {
        // Firebase Sync (データが取得できたら上書きして再描画)
        db.collection("notes").onSnapshot((snapshot) => {
            const fetchedNotes = [];
            snapshot.forEach((doc) => {
                fetchedNotes.push({ ...doc.data(), id: doc.id });
            });
            notes = fetchedNotes;
            saveToLocal(); // Backup locally
            renderBoard();
        }, (error) => {
            console.error("Firebaseの同期中にエラーが発生しました:", error);
        });
    }
    
    setupEventListeners();
}

// Data Management
function loadFromLocal() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        notes = JSON.parse(saved);
    }
}

function saveToLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

async function saveNote(noteData) {
    const now = new Date().toISOString();
    
    // Create a copy without the id field for Firebase payload
    const payload = { ...noteData };
    delete payload.id;
    
    if (noteData.id) {
        // Update
        if (useFirebase && db) {
            await db.collection("notes").doc(noteData.id).update({
                ...payload,
                updatedAt: now
            });
        } else {
            const index = notes.findIndex(n => n.id === noteData.id);
            if (index > -1) {
                notes[index] = { ...notes[index], ...noteData, updatedAt: now };
            }
        }
    } else {
        // Create
        if (useFirebase && db) {
            await db.collection("notes").add({
                ...payload,
                createdAt: now,
                updatedAt: now
            });
        } else {
            const newNote = {
                ...noteData,
                createdAt: now,
                updatedAt: now,
                id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)
            };
            notes.push(newNote);
        }
    }

    if (!useFirebase) {
        saveToLocal();
        renderBoard();
    }
}

async function deleteNote(id) {
    if (!confirm('この付箋を削除してもよろしいですか？')) return;

    if (useFirebase && db) {
        await db.collection("notes").doc(id).delete();
    } else {
        notes = notes.filter(n => n.id !== id);
        saveToLocal();
        renderBoard();
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
                <button class="copy-btn" data-id="${note.id}" title="コピー">📋</button>
                <button class="edit-btn" data-id="${note.id}" title="編集">✏️</button>
                <button class="delete-btn" data-id="${note.id}" title="削除">🗑️</button>
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

    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    if (useFirebase && db) {
                        alert("クラウド同期中はインポートできません。ローカルモードで使用してください。");
                        return;
                    }
                    if (confirm(`インポートすると現在のデータが上書きされます。よろしいですか？\n（現在のデータを残したい場合は先にエクスポートしてください）`)) {
                        notes = importedNotes;
                        saveToLocal();
                        renderBoard();
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
