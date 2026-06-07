// --- Navigation Logic ---
function switchMainTab(tab) {
    document.querySelectorAll('.main-view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-blue-600', 'shadow-sm', 'bg-white');
        b.classList.add('text-slate-500');
    });

    document.getElementById(`view-${tab}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`main-tab-${tab}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.classList.remove('text-slate-500');
    }

    if (tab === 'editor' && cropper) {
        cropper.resize();
    } else if (tab === 'cropper1280' && cropper1280) {
        cropper1280.resize();
    }
}

// Global scope expose for onclick handlers
window.switchMainTab = switchMainTab;

// --- Core Variables ---
const fileInput = document.getElementById('fileInput');
const imageToCrop = document.getElementById('imageToCrop');
const cropButton = document.getElementById('cropButton');
const downloadButton = document.getElementById('downloadButton');
const resultWrapper = document.getElementById('resultWrapper');
const dropZone = document.getElementById('dropZone');
const initialGuide = document.getElementById('initialGuide');
const canvas = document.getElementById('editorCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let cropper = null;
let originalCroppedImage = null; 
let currentTool = 'mosaic';
let isDrawing = false;
let selectedEmoji = '❤️';
let startX, startY, snapshot = null;

// --- Editor Logic ---
function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        if (cropper) cropper.destroy();
        imageToCrop.src = e.target.result;
        imageToCrop.classList.remove('hidden');
        initialGuide.classList.add('hidden');
        cropButton.classList.remove('hidden');
        resultWrapper.classList.add('hidden');
        cropper = new Cropper(imageToCrop, { viewMode: 1, aspectRatio: NaN });
    };
    reader.readAsDataURL(file);
}

// Global Paste Event logic
document.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (!activeTabBtn) return;
    const activeTab = activeTabBtn.id;
    
    for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (activeTab === 'main-tab-editor') {
                loadFile(blob);
            } else if (activeTab === 'main-tab-resizer') {
                addFileToBatch(blob);
            } else if (activeTab === 'main-tab-cropper1280') {
                loadCropper1280File(blob);
            } else if (activeTab === 'main-tab-iconmaker') {
                loadIconMakerFile(blob);
            } else if (activeTab === 'main-tab-texteditor') {
                loadTextEditorFile(blob);
            }
        }
    }
});

if (fileInput) fileInput.addEventListener('change', (e) => loadFile(e.target.files[0]));
if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drop-active'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-active'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drop-active'); loadFile(e.dataTransfer.files[0]); });
}

if (cropButton) {
    cropButton.addEventListener('click', () => {
        if (!cropper) return;
        const cropped = cropper.getCroppedCanvas();
        canvas.width = cropped.width;
        canvas.height = cropped.height;
        ctx.drawImage(cropped, 0, 0);
        originalCroppedImage = cropped;
        resultWrapper.classList.remove('hidden');
        setTimeout(() => resultWrapper.scrollIntoView({ behavior: 'smooth' }), 100);
    });
}

const getPos = (e) => {
    if (!canvas) return {x:0, y:0};
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
};

const drawMosaic = (x, y) => {
    const sz = parseInt(document.getElementById('brushSize').value);
    const px = 10;
    const sx = Math.max(0, x - sz/2), sy = Math.max(0, y - sz/2);
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = sz/px;
    tmp.getContext('2d').drawImage(canvas, sx, sy, sz, sz, 0, 0, tmp.width, tmp.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, sx, sy, sz, sz);
    ctx.imageSmoothingEnabled = true;
};

const drawStamp = (x, y) => {
    const sz = parseInt(document.getElementById('brushSize').value) * 1.5;
    ctx.font = `${sz}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(selectedEmoji, x, y);
};

const drawRect = (x1, y1, x2, y2, pre) => {
    if (pre && snapshot) ctx.putImageData(snapshot, 0, 0);
    ctx.beginPath(); ctx.strokeStyle = document.getElementById('mainColor').value;
    ctx.lineWidth = Math.max(1, parseInt(document.getElementById('brushSize').value)/4);
    ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.stroke();
};

const drawText = (x, y) => {
    const txt = document.getElementById('textToInsert').value; if(!txt) return;
    const sz = parseInt(document.getElementById('brushSize').value);
    ctx.font = `bold ${sz}px Inter`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'white'; ctx.lineWidth = sz*0.15; ctx.strokeText(txt, x, y);
    ctx.fillStyle = document.getElementById('mainColor').value; ctx.fillText(txt, x, y);
};

if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true; const p = getPos(e); startX = p.x; startY = p.y;
        if(currentTool === 'rect') snapshot = ctx.getImageData(0,0,canvas.width,canvas.height);
        else if(currentTool === 'mosaic') drawMosaic(p.x, p.y);
        else if(currentTool === 'stamp') drawStamp(p.x, p.y);
        else if(currentTool === 'text') drawText(p.x, p.y);
    });
    canvas.addEventListener('mousemove', (e) => {
        if(!isDrawing) return; e.preventDefault(); const p = getPos(e);
        if(currentTool === 'mosaic') drawMosaic(p.x, p.y);
        else if(currentTool === 'rect') drawRect(startX, startY, p.x, p.y, true);
    });
    window.addEventListener('mouseup', (e) => {
        if(!isDrawing) return;
        if(currentTool === 'rect') drawRect(startX, startY, getPos(e).x, getPos(e).y, false);
        isDrawing = false;
    });
}

// --- Batch Resizer Logic ---
let batchFiles = [];
let resizeMode = 'px';
const batchInput = document.getElementById('batch-file-input');
const batchPreview = document.getElementById('batch-preview-container');
const batchBtn = document.getElementById('batch-exec-btn');

function toggleResizeAxis() {
    const selectedRadio = document.querySelector('input[name="resize-axis"]:checked');
    const axis = selectedRadio ? selectedRadio.value : 'width';
    const widthInput = document.getElementById('batch-width-value');
    const heightInput = document.getElementById('batch-height-value');
    
    if (widthInput && heightInput) {
        if (axis === 'width') {
            widthInput.disabled = false;
            heightInput.disabled = true;
        } else {
            widthInput.disabled = true;
            heightInput.disabled = false;
        }
    }
}
window.toggleResizeAxis = toggleResizeAxis;

function setResizeMode(mode) {
    resizeMode = mode;
    document.getElementById('mode-px').className = mode === 'px' ? 'flex-1 py-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs transition-all' : 'flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-400 font-bold text-xs transition-all';
    document.getElementById('mode-percent').className = mode === 'percent' ? 'flex-1 py-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs transition-all' : 'flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-400 font-bold text-xs transition-all';
    
    const pxGroup = document.getElementById('px-settings-group');
    const pctGroup = document.getElementById('percent-settings-group');
    if (pxGroup && pctGroup) {
        if (mode === 'px') {
            pxGroup.classList.remove('hidden');
            pctGroup.classList.add('hidden');
            toggleResizeAxis();
        } else {
            pxGroup.classList.add('hidden');
            pctGroup.classList.remove('hidden');
        }
    }
}
window.setResizeMode = setResizeMode;

function addFileToBatch(file) {
    batchFiles.push(file);
    if (batchBtn) batchBtn.disabled = false;
    const reader = new FileReader();
    reader.onload = (ev) => {
        const d = document.createElement('div');
        d.className = 'aspect-square bg-slate-100 rounded-lg bg-cover bg-center border border-slate-200';
        d.style.backgroundImage = `url(${ev.target.result})`;
        if (batchPreview) batchPreview.appendChild(d);
    };
    reader.readAsDataURL(file);
}

if (batchInput) {
    batchInput.addEventListener('change', (e) => {
        batchFiles = Array.from(e.target.files);
        if (batchPreview) batchPreview.innerHTML = '';
        if (batchBtn) batchBtn.disabled = batchFiles.length === 0;
        batchFiles.forEach(f => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const d = document.createElement('div');
                d.className = 'aspect-square bg-slate-100 rounded-lg bg-cover bg-center border border-slate-200';
                d.style.backgroundImage = `url(${ev.target.result})`;
                if (batchPreview) batchPreview.appendChild(d);
            };
            reader.readAsDataURL(f);
        });
    });
}

if (batchBtn) {
    batchBtn.addEventListener('click', async () => {
        let val;
        let axis = 'width'; // 'width' | 'height' | 'percent'
        
        if (resizeMode === 'px') {
            const selectedRadio = document.querySelector('input[name="resize-axis"]:checked');
            axis = selectedRadio ? selectedRadio.value : 'width';
            if (axis === 'width') {
                val = parseFloat(document.getElementById('batch-width-value').value);
            } else {
                val = parseFloat(document.getElementById('batch-height-value').value);
            }
        } else {
            axis = 'percent';
            val = parseFloat(document.getElementById('batch-resize-value').value);
        }

        if(!val || val <= 0) return;
        batchBtn.disabled = true;
        document.getElementById('batch-status').innerText = '1枚ずつダウンロード中...';
        document.getElementById('batch-status').classList.remove('hidden');

        for(const file of batchFiles) {
            const img = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = URL.createObjectURL(file); });
            const cv = document.createElement('canvas');
            
            let tw, th;
            if (axis === 'width') {
                tw = val;
                th = img.height * (val / img.width);
            } else if (axis === 'height') {
                th = val;
                tw = img.width * (val / img.height);
            } else { // percent
                tw = img.width * (val / 100);
                th = img.height * (val / 100);
            }
            
            cv.width = tw; cv.height = th;
            cv.getContext('2d').drawImage(img, 0, 0, tw, th);
            
            const blob = await new Promise(res => cv.toBlob(res, 'image/png'));
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${file.name.split('.')[0]}_res.png`;
            a.click();
            await new Promise(r => setTimeout(r, 300));
        }
        batchBtn.disabled = false;
        document.getElementById('batch-status').innerText = '完了しました！';
    });
}

// --- Color Utility Logic ---
const utilColor = document.getElementById('utility-color-input');
if (utilColor) {
    utilColor.addEventListener('input', (e) => {
        const hex = e.target.value.toUpperCase();
        document.getElementById('utility-hex').innerText = hex;
        const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
        document.getElementById('utility-rgb').innerText = `rgb(${r}, ${g}, ${b})`;
    });
}

function copyToClipboard(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const txt = el.innerText;
    const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t);
    const n = document.getElementById('utility-notif'); if (n) { n.style.opacity = '1'; setTimeout(() => n.style.opacity = '0', 2000); }
}
window.copyToClipboard = copyToClipboard;

// --- Tool Switching (Editor) ---
function switchTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const toolBtn = document.getElementById(`tool${tool.charAt(0).toUpperCase() + tool.slice(1)}`);
    if (toolBtn) toolBtn.classList.add('active');
    
    const stampList = document.getElementById('stampList');
    if (stampList) stampList.classList.toggle('hidden', tool !== 'stamp');
    
    const colorPanel = document.getElementById('colorPanel');
    if (colorPanel) colorPanel.classList.toggle('hidden', !['rect', 'text'].includes(tool));
    
    const textInputWrapper = document.getElementById('textInputWrapper');
    if (textInputWrapper) textInputWrapper.classList.toggle('hidden', tool !== 'text');
    
    const brushSize = document.getElementById('brushSize');
    if (brushSize) brushSize.min = tool === 'rect' ? "2" : "10";
}
window.switchTool = switchTool;

['toolMosaic','toolStamp','toolRect','toolText'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => switchTool(id.replace('tool','').toLowerCase()));
});

document.querySelectorAll('.stamp-option').forEach(b => {
    b.addEventListener('click', () => {
        selectedEmoji = b.dataset.emoji;
        document.querySelectorAll('.stamp-option').forEach(x => x.classList.remove('ring-2','ring-blue-500','rounded-lg'));
        b.classList.add('ring-2','ring-blue-500','rounded-lg');
    });
});

const resetEdit = document.getElementById('resetEdit');
if (resetEdit) resetEdit.addEventListener('click', () => { if(originalCroppedImage) ctx.drawImage(originalCroppedImage,0,0); });

if (downloadButton) {
    downloadButton.addEventListener('click', () => {
        const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `scrap-kiritan-${Date.now()}.png`; a.click();
    });
}

// --- 1280x670 Cropper Logic ---
const crop1280FileInput = document.getElementById('crop1280-file-input');
const crop1280Image = document.getElementById('crop1280-image');
const crop1280ExecBtn = document.getElementById('crop1280-exec-btn');
const crop1280DropZone = document.getElementById('crop1280-drop-zone');
const crop1280InitialGuide = document.getElementById('crop1280-initial-guide');

let cropper1280 = null;
let currentCrop1280FileName = 'cropped_image';

function loadCropper1280File(file) {
    if (!file || !file.type.startsWith('image/')) return;
    currentCrop1280FileName = file.name ? file.name.split('.')[0] : 'cropped_image';
    const reader = new FileReader();
    reader.onload = (e) => {
        if (cropper1280) cropper1280.destroy();
        crop1280Image.src = e.target.result;
        crop1280Image.classList.remove('hidden');
        crop1280InitialGuide.classList.add('hidden');
        crop1280ExecBtn.classList.remove('hidden');
        
        cropper1280 = new Cropper(crop1280Image, {
            viewMode: 1,
            aspectRatio: 1280 / 670,
            autoCropArea: 0.9,
            responsive: true,
            restore: false,
            checkCrossOrigin: false,
            modal: true,
            guides: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false
        });
    };
    reader.readAsDataURL(file);
}

if (crop1280FileInput) crop1280FileInput.addEventListener('change', (e) => loadCropper1280File(e.target.files[0]));

if (crop1280DropZone) {
    crop1280DropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        crop1280DropZone.classList.add('drop-active'); 
    });
    crop1280DropZone.addEventListener('dragleave', () => {
        crop1280DropZone.classList.remove('drop-active');
    });
    crop1280DropZone.addEventListener('drop', (e) => { 
        e.preventDefault(); 
        crop1280DropZone.classList.remove('drop-active'); 
        loadCropper1280File(e.dataTransfer.files[0]); 
    });
}

if (crop1280ExecBtn) {
    crop1280ExecBtn.addEventListener('click', () => {
        if (!cropper1280) return;
        const croppedCanvas = cropper1280.getCroppedCanvas({
            width: 1280,
            height: 670,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        
        croppedCanvas.toBlob((blob) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${currentCrop1280FileName}_1280x670.png`;
            a.click();
        }, 'image/png');
    });
}

// --- Icon Maker Logic ---
const iconImageInput = document.getElementById('icon-imageInput');
const iconColorTop = document.getElementById('icon-colorTop');
const iconColorBottom = document.getElementById('icon-colorBottom');
const iconTextInput = document.getElementById('icon-textInput');
const iconCanvas = document.getElementById('icon-previewCanvas');
const iconCtx = iconCanvas ? iconCanvas.getContext('2d') : null;
const iconDownloadBtn = document.getElementById('icon-downloadBtn');
const iconPlaceholderText = document.getElementById('icon-placeholderText');

let iconUploadedImage = new Image();

function loadIconMakerFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        iconUploadedImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

if (iconUploadedImage) {
    iconUploadedImage.onload = () => {
        if (iconPlaceholderText) iconPlaceholderText.classList.add('hidden');
        if (iconCanvas) iconCanvas.classList.remove('hidden');
        if (iconDownloadBtn) iconDownloadBtn.disabled = false;
        drawIconMaker();
    };
}

if (iconImageInput) {
    iconImageInput.addEventListener('change', (e) => {
        loadIconMakerFile(e.target.files[0]);
    });
}

const updateIconOnColorOrTextChange = () => {
    if (iconUploadedImage.src) {
        drawIconMaker();
    }
};

if (iconColorTop) iconColorTop.addEventListener('input', updateIconOnColorOrTextChange);
if (iconColorBottom) iconColorBottom.addEventListener('input', updateIconOnColorOrTextChange);
if (iconTextInput) iconTextInput.addEventListener('input', updateIconOnColorOrTextChange);

function drawIconMaker() {
    if (!iconCanvas || !iconCtx || !iconUploadedImage.src) return;

    const size = Math.min(iconUploadedImage.width, iconUploadedImage.height);
    iconCanvas.width = size;
    iconCanvas.height = size;

    iconCtx.clearRect(0, 0, iconCanvas.width, iconCanvas.height);

    // 円形にクリップ
    iconCtx.save();
    iconCtx.beginPath();
    iconCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    iconCtx.closePath();
    iconCtx.clip();

    // グラデーション背景
    const gradient = iconCtx.createLinearGradient(0, 0, 0, iconCanvas.height);
    gradient.addColorStop(0, iconColorTop.value);
    gradient.addColorStop(1, iconColorBottom.value);
    iconCtx.fillStyle = gradient;
    iconCtx.fillRect(0, 0, iconCanvas.width, iconCanvas.height);

    // 画像描画
    const x = (size - iconUploadedImage.width) / 2;
    const y = (size - iconUploadedImage.height) / 2;
    iconCtx.drawImage(iconUploadedImage, x, y);

    // テキスト描画
    const text = iconTextInput.value;
    if (text) {
        const fontSize = size * 0.06;
        iconCtx.font = `bold ${fontSize}px sans-serif`;
        iconCtx.textAlign = 'center';
        iconCtx.textBaseline = 'bottom';

        iconCtx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        iconCtx.shadowBlur = 8;
        iconCtx.shadowOffsetX = 0;
        iconCtx.shadowOffsetY = 2;

        iconCtx.fillStyle = '#ffffff';
        iconCtx.fillText(text, size / 2, size - (size * 0.08));

        // 影設定をリセット
        iconCtx.shadowBlur = 0;
    }
    iconCtx.restore();
}

if (iconDownloadBtn) {
    iconDownloadBtn.addEventListener('click', () => {
        if (!iconCanvas) return;
        const link = document.createElement('a');
        link.download = 'icon_ijigenpocket.png';
        link.href = iconCanvas.toDataURL('image/png');
        link.click();
    });
}

// --- Text Editor & Image Adjuster Logic ---
const texteditorFileInput = document.getElementById('texteditor-file-input');
const texteditorDropzone = document.getElementById('texteditor-dropzone');
const texteditorAddBtn = document.getElementById('texteditor-add-btn');
const texteditorCanvas = document.getElementById('texteditor-canvas');
const texteditorCtx = texteditorCanvas ? texteditorCanvas.getContext('2d') : null;
const texteditorDownloadBtn = document.getElementById('texteditor-download-btn');
const texteditorPlaceholder = document.getElementById('texteditor-placeholder');
const texteditorCanvasContainer = document.getElementById('texteditor-canvas-container');

const texteditorTextInput = document.getElementById('texteditor-text-input');
const texteditorFontSelect = document.getElementById('texteditor-font-select');
const texteditorBoldCb = document.getElementById('texteditor-bold-cb');
const texteditorItalicCb = document.getElementById('texteditor-italic-cb');
const texteditorFillColor = document.getElementById('texteditor-fill-color');
const texteditorStrokeColor = document.getElementById('texteditor-stroke-color');
const texteditorSizeSlider = document.getElementById('texteditor-size-slider');
const texteditorStrokeSlider = document.getElementById('texteditor-stroke-slider');
const texteditorBrightSlider = document.getElementById('texteditor-bright-slider');
const texteditorContrastSlider = document.getElementById('texteditor-contrast-slider');
const texteditorLayerList = document.getElementById('texteditor-layer-list');

let texteditorTexts = []; // { id, text, x, y, font, size, bold, italic, color, strokeColor, strokeWidth }
let selectedTextIndex = -1;
let isTextDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let texteditorBgImage = new Image();

// フィルター値
let texteditorBrightness = 100;
let texteditorContrast = 100;

function loadTextEditorFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        texteditorBgImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

if (texteditorBgImage) {
    texteditorBgImage.onload = () => {
        if (texteditorPlaceholder) texteditorPlaceholder.classList.add('hidden');
        if (texteditorCanvasContainer) texteditorCanvasContainer.classList.remove('hidden');
        if (texteditorDownloadBtn) texteditorDownloadBtn.disabled = false;

        // キャンバスサイズを元画像サイズに設定
        texteditorCanvas.width = texteditorBgImage.width;
        texteditorCanvas.height = texteditorBgImage.height;

        // 初期状態で再リセット
        texteditorTexts = [];
        selectedTextIndex = -1;
        
        drawTextEditor();
        updateTextEditorLayerList();
    };
}

if (texteditorFileInput) {
    texteditorFileInput.addEventListener('change', (e) => {
        loadTextEditorFile(e.target.files[0]);
    });
}

if (texteditorDropzone) {
    texteditorDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        texteditorDropzone.classList.add('drop-active');
    });
    texteditorDropzone.addEventListener('dragleave', () => {
        texteditorDropzone.classList.remove('drop-active');
    });
    texteditorDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        texteditorDropzone.classList.remove('drop-active');
        loadTextEditorFile(e.dataTransfer.files[0]);
    });
}

// フィルター調整
if (texteditorBrightSlider) {
    texteditorBrightSlider.addEventListener('input', (e) => {
        texteditorBrightness = e.target.value;
        document.getElementById('texteditor-bright-val').innerText = `${texteditorBrightness}%`;
        drawTextEditor();
    });
}
if (texteditorContrastSlider) {
    texteditorContrastSlider.addEventListener('input', (e) => {
        texteditorContrast = e.target.value;
        document.getElementById('texteditor-contrast-val').innerText = `${texteditorContrast}%`;
        drawTextEditor();
    });
}

// スタイル変更時の即時反映（選択中テキストがある場合）
const syncStyleToSelectedText = () => {
    if (selectedTextIndex === -1 || !texteditorTexts[selectedTextIndex]) return;
    const txt = texteditorTexts[selectedTextIndex];
    txt.font = texteditorFontSelect.value;
    txt.bold = texteditorBoldCb.checked;
    txt.italic = texteditorItalicCb.checked;
    txt.color = texteditorFillColor.value;
    txt.strokeColor = texteditorStrokeColor.value;
    txt.size = parseInt(texteditorSizeSlider.value);
    txt.strokeWidth = parseInt(texteditorStrokeSlider.value);
    drawTextEditor();
};

if (texteditorFontSelect) texteditorFontSelect.addEventListener('change', syncStyleToSelectedText);
if (texteditorBoldCb) texteditorBoldCb.addEventListener('change', syncStyleToSelectedText);
if (texteditorItalicCb) texteditorItalicCb.addEventListener('change', syncStyleToSelectedText);
if (texteditorFillColor) texteditorFillColor.addEventListener('input', syncStyleToSelectedText);
if (texteditorStrokeColor) texteditorStrokeColor.addEventListener('input', syncStyleToSelectedText);

if (texteditorSizeSlider) {
    texteditorSizeSlider.addEventListener('input', (e) => {
        document.getElementById('texteditor-size-val').innerText = `${e.target.value}px`;
        syncStyleToSelectedText();
    });
}
if (texteditorStrokeSlider) {
    texteditorStrokeSlider.addEventListener('input', (e) => {
        document.getElementById('texteditor-stroke-val').innerText = `${e.target.value}px`;
        syncStyleToSelectedText();
    });
}

// 文字の追加
if (texteditorAddBtn) {
    texteditorAddBtn.addEventListener('click', () => {
        const textStr = texteditorTextInput.value.trim();
        if (!textStr || !texteditorBgImage.src) return;

        // キャンバスの中央付近に配置
        const newText = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            text: textStr,
            x: texteditorCanvas.width / 2,
            y: texteditorCanvas.height / 2,
            font: texteditorFontSelect.value,
            size: parseInt(texteditorSizeSlider.value),
            bold: texteditorBoldCb.checked,
            italic: texteditorItalicCb.checked,
            color: texteditorFillColor.value,
            strokeColor: texteditorStrokeColor.value,
            strokeWidth: parseInt(texteditorStrokeSlider.value)
        };

        texteditorTexts.push(newText);
        selectedTextIndex = texteditorTexts.length - 1;
        texteditorTextInput.value = ''; // 入力欄をクリア
        
        drawTextEditor();
        updateTextEditorLayerList();
    });
}

// レイヤーリストの更新
function updateTextEditorLayerList() {
    if (!texteditorLayerList) return;
    if (texteditorTexts.length === 0) {
        texteditorLayerList.innerHTML = '<p class="text-slate-400 text-center py-4">文字がまだ追加されていません</p>';
        return;
    }

    texteditorLayerList.innerHTML = '';
    // 上のレイヤー（配列の末尾）がリストでも上にくるように逆順ループ
    for (let i = texteditorTexts.length - 1; i >= 0; i--) {
        const txt = texteditorTexts[i];
        const item = document.createElement('div');
        const isActive = (i === selectedTextIndex);
        item.className = `flex items-center justify-between p-2.5 rounded-xl border transition-all ${
            isActive ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
        }`;

        item.innerHTML = `
            <span class="truncate max-w-[150px] cursor-pointer flex-grow" onclick="selectTextLayer(${i})">${txt.text}</span>
            <div class="flex items-center gap-1">
                <button onclick="moveLayerUp(${i})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="前面へ">▲</button>
                <button onclick="moveLayerDown(${i})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700" title="背面へ">▼</button>
                <button onclick="deleteLayer(${i})" class="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600" title="削除">❌</button>
            </div>
        `;
        texteditorLayerList.appendChild(item);
    }
}

function selectTextLayer(index) {
    selectedTextIndex = index;
    const txt = texteditorTexts[index];
    if (txt) {
        // UIフォームの値を同期
        texteditorTextInput.value = txt.text;
        texteditorFontSelect.value = txt.font;
        texteditorBoldCb.checked = txt.bold;
        texteditorItalicCb.checked = txt.italic;
        texteditorFillColor.value = txt.color;
        texteditorStrokeColor.value = txt.strokeColor;
        texteditorSizeSlider.value = txt.size;
        document.getElementById('texteditor-size-val').innerText = `${txt.size}px`;
        texteditorStrokeSlider.value = txt.strokeWidth;
        document.getElementById('texteditor-stroke-val').innerText = `${txt.strokeWidth}px`;
    }
    updateTextEditorLayerList();
    drawTextEditor();
}
window.selectTextLayer = selectTextLayer;

function deleteLayer(index) {
    texteditorTexts.splice(index, 1);
    if (selectedTextIndex === index) {
        selectedTextIndex = -1;
    } else if (selectedTextIndex > index) {
        selectedTextIndex--;
    }
    updateTextEditorLayerList();
    drawTextEditor();
}
window.deleteLayer = deleteLayer;

function moveLayerUp(index) {
    if (index >= texteditorTexts.length - 1) return;
    const temp = texteditorTexts[index];
    texteditorTexts[index] = texteditorTexts[index + 1];
    texteditorTexts[index + 1] = temp;
    
    if (selectedTextIndex === index) selectedTextIndex = index + 1;
    else if (selectedTextIndex === index + 1) selectedTextIndex = index;

    updateTextEditorLayerList();
    drawTextEditor();
}
window.moveLayerUp = moveLayerUp;

function moveLayerDown(index) {
    if (index <= 0) return;
    const temp = texteditorTexts[index];
    texteditorTexts[index] = texteditorTexts[index - 1];
    texteditorTexts[index - 1] = temp;

    if (selectedTextIndex === index) selectedTextIndex = index - 1;
    else if (selectedTextIndex === index - 1) selectedTextIndex = index;

    updateTextEditorLayerList();
    drawTextEditor();
}
window.moveLayerDown = moveLayerDown;

// キャンバス描画
function drawTextEditor(hideSelection = false) {
    if (!texteditorCanvas || !texteditorCtx || !texteditorBgImage.src) return;

    // 画面クリア
    texteditorCtx.clearRect(0, 0, texteditorCanvas.width, texteditorCanvas.height);

    // フィルターの適用と画像描画
    texteditorCtx.save();
    texteditorCtx.filter = `brightness(${texteditorBrightness}%) contrast(${texteditorContrast}%)`;
    texteditorCtx.drawImage(texteditorBgImage, 0, 0);
    texteditorCtx.restore();

    // テキストの描画
    texteditorTexts.forEach((txt, index) => {
        texteditorCtx.save();
        
        let fontStyle = '';
        if (txt.italic) fontStyle += 'italic ';
        if (txt.bold) fontStyle += 'bold ';
        texteditorCtx.font = `${fontStyle}${txt.size}px ${txt.font}`;
        
        texteditorCtx.textAlign = 'center';
        texteditorCtx.textBaseline = 'middle';

        // 縁取り描画
        if (txt.strokeWidth > 0) {
            texteditorCtx.strokeStyle = txt.strokeColor;
            texteditorCtx.lineWidth = txt.strokeWidth;
            texteditorCtx.lineJoin = 'round';
            texteditorCtx.strokeText(txt.text, txt.x, txt.y);
        }

        // 塗りつぶし描画
        texteditorCtx.fillStyle = txt.color;
        texteditorCtx.fillText(txt.text, txt.x, txt.y);

        // 選択枠の描画 (hideSelectionがfalseのときのみ)
        if (!hideSelection && index === selectedTextIndex) {
            const metrics = texteditorCtx.measureText(txt.text);
            const w = metrics.width + 16;
            const h = txt.size + 16;
            
            texteditorCtx.strokeStyle = '#3b82f6';
            texteditorCtx.lineWidth = 2;
            texteditorCtx.setLineDash([6, 4]);
            texteditorCtx.strokeRect(txt.x - w / 2, txt.y - h / 2, w, h);
            
            // 角にマーカーを描画
            texteditorCtx.fillStyle = '#3b82f6';
            texteditorCtx.fillRect(txt.x - w / 2 - 4, txt.y - h / 2 - 4, 8, 8);
            texteditorCtx.fillRect(txt.x + w / 2 - 4, txt.y - h / 2 - 4, 8, 8);
            texteditorCtx.fillRect(txt.x - w / 2 - 4, txt.y + h / 2 - 4, 8, 8);
            texteditorCtx.fillRect(txt.x + w / 2 - 4, txt.y + h / 2 - 4, 8, 8);
        }

        texteditorCtx.restore();
    });
}

// キャンバス座標変換
const getTextEditorPos = (e) => {
    if (!texteditorCanvas) return { x: 0, y: 0 };
    const rect = texteditorCanvas.getBoundingClientRect();
    const sx = texteditorCanvas.width / rect.width;
    const sy = texteditorCanvas.height / rect.height;
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
};

// マウスイベントによるドラッグ＆ドロップと選択
if (texteditorCanvas) {
    const handleStart = (e) => {
        if (!texteditorBgImage.src) return;
        const p = getTextEditorPos(e);
        
        // 当たり判定：上にあるレイヤー（配列末尾）から順にチェック
        let clickedIndex = -1;
        
        for (let i = texteditorTexts.length - 1; i >= 0; i--) {
            const txt = texteditorTexts[i];
            
            // テキスト幅の計測
            texteditorCtx.save();
            let fontStyle = '';
            if (txt.italic) fontStyle += 'italic ';
            if (txt.bold) fontStyle += 'bold ';
            texteditorCtx.font = `${fontStyle}${txt.size}px ${txt.font}`;
            const metrics = texteditorCtx.measureText(txt.text);
            texteditorCtx.restore();
            
            const w = metrics.width + 16;
            const h = txt.size + 16;
            
            if (p.x >= txt.x - w / 2 && p.x <= txt.x + w / 2 &&
                p.y >= txt.y - h / 2 && p.y <= txt.y + h / 2) {
                clickedIndex = i;
                break;
            }
        }

        if (clickedIndex !== -1) {
            isTextDragging = true;
            selectTextLayer(clickedIndex);
            dragStartX = p.x - texteditorTexts[clickedIndex].x;
            dragStartY = p.y - texteditorTexts[clickedIndex].y;
            e.preventDefault();
        } else {
            // 背景クリック時は選択解除
            selectedTextIndex = -1;
            updateTextEditorLayerList();
            drawTextEditor();
        }
    };

    const handleMove = (e) => {
        if (!isTextDragging || selectedTextIndex === -1) return;
        e.preventDefault();
        const p = getTextEditorPos(e);
        const txt = texteditorTexts[selectedTextIndex];
        txt.x = p.x - dragStartX;
        txt.y = p.y - dragStartY;
        drawTextEditor();
    };

    const handleEnd = () => {
        isTextDragging = false;
    };

    texteditorCanvas.addEventListener('mousedown', handleStart);
    texteditorCanvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    // タッチ対応
    texteditorCanvas.addEventListener('touchstart', handleStart, { passive: false });
    texteditorCanvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
}

// ダウンロード
if (texteditorDownloadBtn) {
    texteditorDownloadBtn.addEventListener('click', () => {
        if (!texteditorCanvas) return;
        
        // 選択枠を非表示にして描画
        drawTextEditor(true);
        
        const link = document.createElement('a');
        link.download = `scrap-texteditor-${Date.now()}.png`;
        link.href = texteditorCanvas.toDataURL('image/png');
        link.click();
        
        // 選択枠を再表示
        drawTextEditor(false);
    });
}
