const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const sortableList = document.getElementById('sortable-list');
const fixedList = document.getElementById('fixed-list');
const fixedSection = document.getElementById('fixed-section');
const listSection = document.getElementById('list-section');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const countBadge = document.getElementById('count-badge');
const loadingOverlay = document.getElementById('loading-overlay');

// ファイルレジストリ
let seqFileMap = new Map();
let fixedFileMap = new Map();
let nextId = 0;

// 除外対象のファイル名
const EXCLUDED_FILENAMES = ['main.png', 'tab.png'];

// Sortableの初期化 (連番リストのみ)
const sortable = new Sortable(sortableList, {
    animation: 300,
    ghostClass: 'opacity-40',
    filter: 'button',
    onEnd: updateNumbers
});

// イベント設定
if (fileInput) fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

if (dropArea) {
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-indigo-400', 'bg-indigo-50');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('border-indigo-400', 'bg-indigo-50');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-indigo-400', 'bg-indigo-50');
        handleFiles(e.dataTransfer.files);
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if(confirm('すべてのリストをクリアしますか？')) {
            location.reload(); 
        }
    });
}

// ファイル受付処理
function handleFiles(files) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    fileList.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        
        const id = `file-${nextId++}`;
        
        // 特定の名前かチェック
        if (EXCLUDED_FILENAMES.includes(file.name.toLowerCase())) {
            fixedFileMap.set(id, file);
            addFixedItem(id, file);
        } else {
            seqFileMap.set(id, file);
            addSeqItem(id, file);
        }
    });

    if (listSection) listSection.classList.remove('hidden');
    if (dropArea) dropArea.classList.add('hidden');
    updateNumbers();
}

// 連番用アイテム追加
function addSeqItem(id, file) {
    const li = document.createElement('li');
    li.className = 'flex flex-col bg-white p-3 rounded-2xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all group relative';
    li.dataset.id = id;

    const previewUrl = URL.createObjectURL(file);

    li.innerHTML = `
        <div class="absolute top-2 left-2 z-10 bg-indigo-600 text-white text-xs font-black font-mono w-6 h-6 rounded-full flex items-center justify-center shadow-md num-display">
            --
        </div>
        <button class="absolute top-2 right-2 z-10 bg-white/80 hover:bg-red-500 hover:text-white text-slate-500 p-1.5 rounded-full transition-colors shadow-md" onclick="removeItem('${id}', 'seq')">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div class="relative w-full aspect-square mb-2">
            <img src="${previewUrl}" class="w-full h-full object-cover rounded-xl bg-slate-100 border border-slate-100 shadow-inner">
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl pointer-events-none"></div>
        </div>
        <div class="w-full min-w-0 px-1">
            <p class="text-sm font-black text-indigo-600 font-mono new-name-display truncate text-center mb-0.5">00.ext</p>
            <p class="text-[10px] text-slate-400 truncate text-center" title="${file.name}">元: ${file.name}</p>
        </div>
    `;
    sortableList.appendChild(li);
}

// 固定用アイテム追加
function addFixedItem(id, file) {
    if (fixedSection) fixedSection.classList.remove('hidden');
    const li = document.createElement('li');
    li.className = 'flex items-center gap-4 bg-amber-50 p-3 rounded-xl border border-amber-100 shadow-sm';
    li.dataset.id = id;

    const previewUrl = URL.createObjectURL(file);

    li.innerHTML = `
        <img src="${previewUrl}" class="w-16 h-16 object-cover rounded-lg bg-white border border-amber-200">
        <div class="flex-grow min-w-0">
            <p class="text-xs text-amber-600 font-bold">名前固定</p>
            <p class="text-sm font-black text-slate-700 font-mono truncate">${file.name}</p>
        </div>
        <button class="text-amber-300 hover:text-red-500 p-2" onclick="removeItem('${id}', 'fixed')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;
    fixedList.appendChild(li);
}

// 番号表示の更新
function updateNumbers() {
    const items = sortableList.querySelectorAll('li');
    if (countBadge) countBadge.textContent = items.length;

    items.forEach((item, index) => {
        const num = (index + 1).toString().padStart(2, '0');
        const fileId = item.dataset.id;
        const file = seqFileMap.get(fileId);
        const ext = file.name.split('.').pop();

        const numDisplay = item.querySelector('.num-display');
        const newNameDisplay = item.querySelector('.new-name-display');
        if (numDisplay) numDisplay.textContent = num;
        if (newNameDisplay) newNameDisplay.textContent = `${num}.${ext}`;
    });
}

// アイテム削除
window.removeItem = function(id, type) {
    const list = type === 'seq' ? sortableList : fixedList;
    const map = type === 'seq' ? seqFileMap : fixedFileMap;
    
    const el = list.querySelector(`[data-id="${id}"]`);
    if (el) {
        const img = el.querySelector('img');
        if(img) URL.revokeObjectURL(img.src);
        el.remove();
        map.delete(id);
    }
    
    if (seqFileMap.size === 0 && fixedFileMap.size === 0) {
        if (listSection) listSection.classList.add('hidden');
        if (dropArea) dropArea.classList.remove('hidden');
    } else {
        if (fixedFileMap.size === 0 && fixedSection) fixedSection.classList.add('hidden');
        updateNumbers();
    }
};

// ダウンロード実行
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        const seqItems = sortableList.querySelectorAll('li');
        if (seqItems.length === 0 && fixedFileMap.size === 0) return;

        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        const zip = new JSZip();

        try {
            // 1. 連番ファイルの処理
            seqItems.forEach((item, index) => {
                const fileId = item.dataset.id;
                const file = seqFileMap.get(fileId);
                const ext = file.name.split('.').pop();
                const newName = `${(index + 1).toString().padStart(2, '0')}.${ext}`;
                zip.file(newName, file);
            });

            // 2. 固定ファイルの処理
            fixedFileMap.forEach((file) => {
                zip.file(file.name, file);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(content);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `assets_pack_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error(error);
            alert('エラーが発生しました。');
        } finally {
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
        }
    });
}
