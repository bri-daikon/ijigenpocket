document.addEventListener('DOMContentLoaded', () => {
    // State
    let config = { source_folder: '', destinations: [] };
    let files = [];
    let currentIndex = 0;

    // DOM Elements
    const sourceFolderInput = document.getElementById('source-folder');
    const destListContainer = document.getElementById('destinations-list');
    const addDestBtn = document.getElementById('add-dest-btn');
    const addDestBottomBtn = document.getElementById('add-dest-bottom-btn');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const configMsg = document.getElementById('config-msg');
    
    const currentFilename = document.getElementById('current-filename');
    const fileCounter = document.getElementById('file-counter');
    const refreshBtn = document.getElementById('refresh-btn');
    const previewContainer = document.getElementById('preview-container');
    const actionBar = document.getElementById('action-bar');
    const browseSourceBtn = document.getElementById('browse-source-btn');

    const skipBtn = document.getElementById('skip-btn');
    const prevBtn = document.getElementById('prev-btn');
    const previewNextBtn = document.getElementById('preview-next-btn');
    const previewPrevBtn = document.getElementById('preview-prev-btn');
    const toast = document.getElementById('toast');

    // Initialize
    loadConfig();

    if (addDestBtn) {
        // 上の＋ボタン：すぐ下（リストの先頭）に追加して即入力可能に
        addDestBtn.addEventListener('click', () => addDestinationInput('', '', null, true, true));
    }
    if (addDestBottomBtn) {
        // 下の＋ボタン：リストの末尾に追加
        addDestBottomBtn.addEventListener('click', () => addDestinationInput('', '', null, false, true));
    }
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', saveConfig);
    }
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadFiles);
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', skipFile);
    }
    if (previewNextBtn) {
        previewNextBtn.addEventListener('click', skipFile);
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', prevFile);
    }
    if (previewPrevBtn) {
        previewPrevBtn.addEventListener('click', prevFile);
    }
    if (browseSourceBtn) {
        browseSourceBtn.addEventListener('click', async () => {
            const selectedPath = await selectFolderDialog();
            if (selectedPath) {
                sourceFolderInput.value = selectedPath;
            }
        });
    }

    const exportConfigBtn = document.getElementById('export-config-btn');
    const importConfigInput = document.getElementById('import-config-input');
    const resetConfigBtn = document.getElementById('reset-config-btn');

    if (exportConfigBtn) {
        exportConfigBtn.addEventListener('click', exportConfig);
    }
    if (importConfigInput) {
        importConfigInput.addEventListener('change', importConfig);
    }
    if (resetConfigBtn) {
        resetConfigBtn.addEventListener('click', resetConfig);
    }

    // Functions
    function exportConfig() {
        const sourceFolder = sourceFolderInput.value.trim();
        const destItems = destListContainer.querySelectorAll('.dest-item');
        const destinations = [];
        
        destItems.forEach(item => {
            const name = item.querySelector('.dest-name').value.trim();
            const path = item.querySelector('.dest-path').value.trim();
            const id = item.dataset.id;
            if (name && path) {
                destinations.push({ id, name, path });
            }
        });

        const currentConfig = {
            source_folder: sourceFolder,
            destinations: destinations
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentConfig, null, 4));
        const downloadAnchor = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `file_sorter_config_${dateStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showMessage('設定をファイルに出力しました', 'success');
    }

    function importConfig(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (typeof imported !== 'object') throw new Error('Invalid JSON');

                sourceFolderInput.value = imported.source_folder || '';
                destListContainer.innerHTML = '';
                if (imported.destinations && imported.destinations.length > 0) {
                    imported.destinations.forEach(dest => {
                        addDestinationInput(dest.name, dest.path, dest.id);
                    });
                } else {
                    addDestinationInput();
                }

                await saveConfig();
                showMessage('設定を読み込みました', 'success');
            } catch (err) {
                alert('設定ファイルの読み込みに失敗しました。形式が正しいか確認してください。');
                console.error(err);
            }
            // Clear input for re-importing the same file if needed
            e.target.value = '';
        };
        reader.readAsText(file);
    }

    async function resetConfig() {
        if (!confirm('設定をリセット（初期化）しますか？\n現在設定されている移動先リストがすべて消去されます。')) {
            return;
        }

        const emptyConfig = {
            source_folder: '',
            destinations: []
        };

        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emptyConfig)
            });

            if (response.ok) {
                config = emptyConfig;
                sourceFolderInput.value = '';
                destListContainer.innerHTML = '';
                addDestinationInput();
                renderActionButtons();
                files = [];
                updatePreview();
                showMessage('設定を初期化しました', 'success');
            }
        } catch (error) {
            showMessage('初期化に失敗しました', 'error');
            console.error(error);
        }
    }
    async function selectFolderDialog() {
        try {
            const response = await fetch('/api/select-folder', { method: 'POST' });
            const data = await response.json();
            if (data.success && data.path) {
                return data.path;
            }
        } catch (error) {
            console.error('Folder selection failed:', error);
        }
        return null;
    }

    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            config = await response.json();
            
            // Populate UI
            sourceFolderInput.value = config.source_folder || '';
            
            destListContainer.innerHTML = '';
            if (config.destinations && config.destinations.length > 0) {
                config.destinations.forEach(dest => {
                    addDestinationInput(dest.name, dest.path, dest.id);
                });
            } else {
                addDestinationInput(); // Add one empty row
            }
            
            renderActionButtons();
            
            if (config.source_folder) {
                loadFiles();
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }

    function addDestinationInput(name = '', path = '', id = null, prepend = false, shouldFocus = false) {
        if (!id) id = 'dest_' + Math.random().toString(36).substr(2, 9);
        
        const div = document.createElement('div');
        div.className = 'dest-item';
        div.dataset.id = id;
        
        div.innerHTML = `
            <div class="dest-item-header">
                <label>移動先名 & パス</label>
                <button class="icon-btn btn-delete" title="削除"><i class="fa-solid fa-trash"></i></button>
            </div>
            <input type="text" class="dest-name" placeholder="ボタン名 (例: お気に入り)" value="${name}">
            <div class="input-with-btn">
                <input type="text" class="dest-path" placeholder="フォルダパス" value="${path}">
                <button class="secondary-btn btn-sm btn-browse-dest" title="フォルダを選択"><i class="fa-solid fa-folder-open"></i> 参照</button>
            </div>
        `;
        
        div.querySelector('.btn-delete').addEventListener('click', () => {
            div.remove();
        });

        const browseBtn = div.querySelector('.btn-browse-dest');
        const pathInput = div.querySelector('.dest-path');
        const nameInput = div.querySelector('.dest-name');

        browseBtn.addEventListener('click', async () => {
            const selectedPath = await selectFolderDialog();
            if (selectedPath) {
                pathInput.value = selectedPath;
                // Auto-fill name with folder name if empty
                if (!nameInput.value.trim()) {
                    const parts = selectedPath.split(/[\\/]/).filter(Boolean);
                    if (parts.length > 0) {
                        nameInput.value = parts[parts.length - 1];
                    }
                }
            }
        });
        
        if (prepend) {
            destListContainer.prepend(div);
        } else {
            destListContainer.appendChild(div);
        }

        if (shouldFocus) {
            nameInput.focus();
            div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    async function saveConfig() {
        const sourceFolder = sourceFolderInput.value.trim();
        const destItems = destListContainer.querySelectorAll('.dest-item');
        const destinations = [];
        
        destItems.forEach(item => {
            const name = item.querySelector('.dest-name').value.trim();
            const path = item.querySelector('.dest-path').value.trim();
            const id = item.dataset.id;
            
            if (name && path) {
                destinations.push({ id, name, path });
            }
        });
        
        const newConfig = {
            source_folder: sourceFolder,
            destinations: destinations
        };
        
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            
            if (response.ok) {
                config = newConfig;
                showMessage('設定を保存しました', 'success');
                renderActionButtons();
                loadFiles();
            } else {
                showMessage('設定の保存に失敗しました', 'error');
            }
        } catch (error) {
            showMessage('エラーが発生しました', 'error');
            console.error(error);
        }
    }

    function showMessage(msg, type) {
        configMsg.textContent = msg;
        configMsg.className = `msg ${type}`;
        setTimeout(() => {
            configMsg.textContent = '';
            configMsg.className = 'msg';
        }, 3000);
    }

    async function loadFiles() {
        if (!config.source_folder) return;
        
        try {
            const response = await fetch('/api/files');
            files = await response.json();
            
            currentIndex = 0;
            updatePreview();
        } catch (error) {
            console.error('Failed to load files:', error);
        }
    }

    let toastTimeout = null;
    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    function skipFile() {
        if (files.length === 0) return;
        if (currentIndex < files.length - 1) {
            currentIndex++;
            updatePreview();
        } else {
            if (files.length > 1) {
                currentIndex = 0;
                updatePreview();
                showToast('最後のファイルに達したため、最初に戻りました');
            } else {
                showToast('ファイルは1件のみです');
            }
        }
    }

    function prevFile() {
        if (files.length === 0) return;
        if (currentIndex > 0) {
            currentIndex--;
            updatePreview();
        } else {
            if (files.length > 1) {
                currentIndex = files.length - 1;
                updatePreview();
                showToast('最後のファイルに移動しました');
            }
        }
    }

    function updatePreview() {
        if (files.length === 0) {
            currentFilename.textContent = 'ファイルがありません';
            fileCounter.textContent = '0 / 0';
            previewContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-circle-check empty-icon"></i>
                    <p>全てのファイルが仕分け完了しました！</p>
                </div>
            `;
            
            // Disable action & nav buttons
            const btns = actionBar.querySelectorAll('.dest-btn');
            btns.forEach(btn => btn.disabled = true);
            if (skipBtn) skipBtn.disabled = true;
            if (prevBtn) prevBtn.disabled = true;
            if (previewNextBtn) previewNextBtn.disabled = true;
            if (previewPrevBtn) previewPrevBtn.disabled = true;
            return;
        }
        
        // Enable action & nav buttons
        const btns = actionBar.querySelectorAll('.dest-btn');
        btns.forEach(btn => btn.disabled = false);
        if (skipBtn) skipBtn.disabled = false;
        if (prevBtn) prevBtn.disabled = false;
        if (previewNextBtn) previewNextBtn.disabled = false;
        if (previewPrevBtn) previewPrevBtn.disabled = false;

        const currentFile = files[currentIndex];
        currentFilename.textContent = currentFile.filename;
        currentFilename.title = currentFile.filename; // Tooltip for long names
        fileCounter.textContent = `${currentIndex + 1} / ${files.length}`;
        
        // Encode filename for URL
        const mediaUrl = `/media/${encodeURIComponent(currentFile.filename)}`;
        
        previewContainer.innerHTML = ''; // Clear current
        
        if (currentFile.type === 'image') {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = currentFile.filename;
            previewContainer.appendChild(img);
        } else if (currentFile.type === 'video') {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.autoplay = true;
            video.loop = true;
            previewContainer.appendChild(video);
        } else if (currentFile.type === 'audio') {
            const audio = document.createElement('audio');
            audio.src = mediaUrl;
            audio.controls = true;
            audio.autoplay = true;
            previewContainer.appendChild(audio);
        }
    }

    function renderActionButtons() {
        actionBar.innerHTML = '';
        
        if (!config.destinations || config.destinations.length === 0) {
            actionBar.innerHTML = '<p class="text-muted">設定から移動先フォルダを追加してください。</p>';
            return;
        }
        
        config.destinations.forEach((dest, index) => {
            const btn = document.createElement('button');
            btn.className = 'dest-btn';
            const keyLabel = index < 9 ? `<span style="font-size: 0.72rem; opacity: 0.6; margin-left: 2px;">[${index + 1}]</span>` : '';
            btn.innerHTML = `
                <i class="fa-regular fa-folder"></i> 
                <span>${dest.name}</span>
                ${keyLabel}
            `;
            btn.disabled = files.length === 0;
            
            btn.addEventListener('click', () => moveCurrentFile(dest.id));
            
            actionBar.appendChild(btn);
        });
    }

    async function moveCurrentFile(destId) {
        if (files.length === 0) return;
        
        const currentFile = files[currentIndex];
        const filename = currentFile.filename;
        
        try {
            const response = await fetch('/api/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, dest_id: destId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Remove from local array
                files.splice(currentIndex, 1);
                
                // Index adjustment (if it was the last file, go back one)
                if (currentIndex >= files.length) {
                    currentIndex = Math.max(0, files.length - 1);
                }
                
                updatePreview();
            } else {
                alert(`エラー: ${result.error}`);
            }
        } catch (error) {
            alert('通信エラーが発生しました');
            console.error(error);
        }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only if we have files and aren't focused on an input
        if (files.length === 0 || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        
        // Skip shortcut: Space, ArrowRight, 's', 'S'
        if (e.code === 'Space' || e.key === 'ArrowRight' || e.key.toLowerCase() === 's') {
            e.preventDefault();
            skipFile();
            return;
        }

        // Previous shortcut: ArrowLeft, 'a', 'A'
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            e.preventDefault();
            prevFile();
            return;
        }

        // Number keys 1-9 for destinations
        const key = parseInt(e.key);
        if (!isNaN(key) && key > 0 && config.destinations && key <= config.destinations.length) {
            moveCurrentFile(config.destinations[key - 1].id);
            return;
        }
        
        // 'r' for refresh
        if (e.key.toLowerCase() === 'r') {
            loadFiles();
        }
    });
});
