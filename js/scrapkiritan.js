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

function setResizeMode(mode) {
    resizeMode = mode;
    document.getElementById('mode-px').className = mode === 'px' ? 'flex-1 py-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs' : 'flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-400 font-bold text-xs';
    document.getElementById('mode-percent').className = mode === 'percent' ? 'flex-1 py-2 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs' : 'flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-400 font-bold text-xs';
    document.getElementById('batch-unit-label').innerText = mode === 'px' ? 'px' : '%';
    document.getElementById('batch-resize-value').value = mode === 'px' ? '800' : '50';
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
        const val = parseFloat(document.getElementById('batch-resize-value').value);
        if(!val || val <= 0) return;
        batchBtn.disabled = true;
        document.getElementById('batch-status').innerText = '1枚ずつダウンロード中...';
        document.getElementById('batch-status').classList.remove('hidden');

        for(const file of batchFiles) {
            const img = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = URL.createObjectURL(file); });
            const cv = document.createElement('canvas');
            const tw = resizeMode === 'px' ? val : img.width * (val/100);
            const th = resizeMode === 'px' ? img.height * (val/img.width) : img.height * (val/100);
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
