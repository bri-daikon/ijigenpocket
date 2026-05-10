const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const sortableList = document.getElementById('sortable-list');
const listSection = document.getElementById('list-section');
const downloadBtn = document.getElementById('download-btn');
const resetBtn = document.getElementById('reset-btn');
const countBadge = document.getElementById('count-badge');
const loadingOverlay = document.getElementById('loading-overlay');

// ファイルを保持する配列
let fileRegistry = new Map();
let nextId = 0;

// Sortableの初期化
const sortable = new Sortable(sortableList, {
    animation: 250,
    handle: '.drag-handle',
    ghostClass: 'bg-indigo-50',
    onEnd: updateNumbers // 並び替えが終わったら数字を更新
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
        if(confirm('リストをクリアしますか？')) {
            fileRegistry.clear();
            sortableList.innerHTML = '';
            listSection.classList.add('hidden');
            dropArea.classList.remove('hidden');
            fileInput.value = '';
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
        fileRegistry.set(id, file);
        addToList(id, file);
    });

    listSection.classList.remove('hidden');
    dropArea.classList.add('hidden');
    updateNumbers();
}

// リストに項目を追加
function addToList(id, file) {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm drag-handle cursor-grab active:cursor-grabbing hover:bg-white transition-colors';
    li.dataset.id = id;

    // 簡易プレビューURL作成
    const previewUrl = URL.createObjectURL(file);

    li.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-mono font-bold num-display">
            --
        </div>
        <img src="${previewUrl}" class="w-12 h-12 object-cover rounded-md bg-slate-200">
        <div class="flex-grow min-w-0">
            <p class="text-xs text-slate-400 truncate">${file.name}</p>
            <p class="text-sm font-bold text-indigo-600 font-mono new-name-display">00.ext</p>
        </div>
        <button class="text-slate-300 hover:text-red-500 p-2" onclick="removeItem('${id}')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;
    sortableList.appendChild(li);
}

// 番号表示の更新
function updateNumbers() {
    const items = sortableList.querySelectorAll('li');
    countBadge.textContent = items.length;

    items.forEach((item, index) => {
        const num = (index + 1).toString().padStart(2, '0');
        const fileId = item.dataset.id;
        const file = fileRegistry.get(fileId);
        const ext = file.name.split('.').pop();

        item.querySelector('.num-display').textContent = num;
        item.querySelector('.new-name-display').textContent = `${num}.${ext}`;
    });
}

// 個別削除
window.removeItem = function(id) {
    const el = sortableList.querySelector(`[data-id="${id}"]`);
    if (el) {
        // メモリ解放
        const img = el.querySelector('img');
        URL.revokeObjectURL(img.src);
        
        el.remove();
        fileRegistry.delete(id);
    }
    
    if (fileRegistry.size === 0) {
        listSection.classList.add('hidden');
        dropArea.classList.remove('hidden');
    } else {
        updateNumbers();
    }
};

// ダウンロード実行
if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
        const items = sortableList.querySelectorAll('li');
        if (items.length === 0) return;

        loadingOverlay.classList.remove('hidden');
        const zip = new JSZip();

        try {
            items.forEach((item, index) => {
                const fileId = item.dataset.id;
                const file = fileRegistry.get(fileId);
                const ext = file.name.split('.').pop();
                
                // 新しいファイル名：数字のみ (例: 01.jpg)
                const newName = `${(index + 1).toString().padStart(2, '0')}.${ext}`;
                zip.file(newName, file);
            });

            const content = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(content);
            
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `renamed_images_${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error(error);
            alert('ZIPの作成中にエラーが発生しました。');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });
}
