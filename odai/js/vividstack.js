let canvas;
const gridSize = 50;
let backgroundImageObject = null; // 背景画像を保持
let objectSequence = 0; // 重ね順管理用の連番

// アンドゥ・リドゥ履歴管理
let undoStack = [];
let redoStack = [];
let isUndoRedoing = false;
let isBatchAdding = false;
const MAX_HISTORY = 30;

function setupApp() {
    initCanvas();
    window.addEventListener('resize', updateCanvasZoom);
    window.addEventListener('keydown', handleKeydown);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupApp);
} else {
    setupApp();
}

function saveState() {
    if (isUndoRedoing || isBatchAdding || !canvas) return;
    const json = JSON.stringify(canvas.toJSON(['name', 'zIndex', 'selectable', 'evented', 'lockUniScaling', 'transparentCorners', 'cornerColor', 'cornerSize', 'cornerStrokeColor', 'cornerStyle']));
    undoStack.push(json);
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    redoStack = []; // 新しい操作時はリドゥスタックをクリア
    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = (undoStack.length <= 1);
    if (redoBtn) redoBtn.disabled = (redoStack.length === 0);
}

function undo() {
    if (undoStack.length <= 1 || isUndoRedoing) return;
    isUndoRedoing = true;
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    const prevState = undoStack[undoStack.length - 1];

    loadCanvasState(prevState, () => {
        isUndoRedoing = false;
        updateUndoRedoButtons();
    });
}
window.undo = undo;

function redo() {
    if (redoStack.length === 0 || isUndoRedoing) return;
    isUndoRedoing = true;
    const nextState = redoStack.pop();
    undoStack.push(nextState);

    loadCanvasState(nextState, () => {
        isUndoRedoing = false;
        updateUndoRedoButtons();
    });
}
window.redo = redo;

function loadCanvasState(jsonState, callback) {
    canvas.loadFromJSON(jsonState, () => {
        canvas.getObjects().forEach(obj => {
            if (obj.name !== 'gridLine') {
                setupObjectControls(obj);
            }
        });
        canvas.renderAll();
        if (document.getElementById('zoomFitToggle').checked) {
            updateCanvasZoom();
        }
        if (callback) callback();
    });
}

function handleKeydown(e) {
    // 入力フォーム等の中でのキー押下は無視
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && !active.isEditing) {
            e.preventDefault();
            deleteSelected();
        }
    }
}

function initCanvas() {
    canvas = new fabric.Canvas('mainCanvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
    });

    // discardActiveObject をラップして、選択解除時に元の重ね順が崩れないようにソートする
    const originalDiscard = canvas.discardActiveObject;
    canvas.discardActiveObject = function (e) {
        const activeObject = this.getActiveObject();
        if (activeObject && activeObject.type === 'activeSelection') {
            activeObject._objects.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
        }
        return originalDiscard.call(this, e);
    };

    // オブジェクト追加時にアスペクト比固定設定を適用
    canvas.on('object:added', function (e) {
        const obj = e.target;
        if (obj && obj.name !== 'gridLine') {
            setupObjectControls(obj);
            if (obj.zIndex === undefined) {
                obj.zIndex = objectSequence++;
            }
        }
        if (!isBatchAdding) {
            saveState();
        }
    });

    canvas.on('object:modified', function () {
        if (!isBatchAdding) {
            saveState();
        }
    });

    canvas.on('object:removed', function (e) {
        if (e.target && e.target.name !== 'gridLine' && !isBatchAdding) {
            saveState();
        }
    });

    // スナップ機能
    canvas.on('object:moving', function (options) {
        if (document.getElementById('gridToggle').checked) {
            options.target.set({
                left: Math.round(options.target.left / gridSize) * gridSize,
                top: Math.round(options.target.top / gridSize) * gridSize
            });
        }
    });

    canvas.on('selection:created', updateFontDropdown);
    canvas.on('selection:updated', updateFontDropdown);

    // 初期状態を保存
    saveState();

    // 初期ズーム状態を適用
    setTimeout(updateCanvasZoom, 100);
}

// オブジェクトのコントロール設定（アスペクト比固定など）
function setupObjectControls(obj) {
    // 等倍リサイズのみを許可（角のハンドルのみ表示し、辺のハンドルを隠す）
    obj.set({
        lockUniScaling: true,
        transparentCorners: false,
        cornerColor: '#3b82f6',
        cornerSize: 10,
        cornerStrokeColor: '#ffffff',
        cornerStyle: 'circle'
    });

    // 辺のハンドル（中央上下左右）を非表示にする
    obj.setControlsVisibility({
        mt: false, // middle top
        mb: false, // middle bottom
        ml: false, // middle left
        mr: false  // middle right
    });
}

// 背景画像のアップロード処理
function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            backgroundImageObject = img;
            document.getElementById('blurControl').classList.remove('hidden');
            document.getElementById('bgBlurSlider').value = 0;
            applyBackground();
        });
    };
    reader.readAsDataURL(file);
}
window.handleBackgroundUpload = handleBackgroundUpload;

// 背景画像を適用
function applyBackground() {
    if (!backgroundImageObject) return;

    canvas.setBackgroundImage(backgroundImageObject, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / backgroundImageObject.width,
        scaleY: canvas.height / backgroundImageObject.height,
        originX: 'left',
        originY: 'top'
    });
}
window.applyBackground = applyBackground;

// 背景ぼかしを適用
function applyBlur() {
    if (!backgroundImageObject) return;

    const blurValue = parseFloat(document.getElementById('bgBlurSlider').value);
    backgroundImageObject.filters = [];

    if (blurValue > 0) {
        backgroundImageObject.filters.push(new fabric.Image.filters.Blur({
            blur: blurValue
        }));
    }

    backgroundImageObject.applyFilters();
    canvas.renderAll();
}
window.applyBlur = applyBlur;

// 背景を削除
function removeBackground() {
    backgroundImageObject = null;
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    document.getElementById('bgLoader').value = '';
    document.getElementById('blurControl').classList.add('hidden');
    document.getElementById('bgBlurSlider').value = 0;
    alertBox("背景を削除しました");
}
window.removeBackground = removeBackground;

function updateFontDropdown() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        document.getElementById('fontSelect').value = activeObject.fontFamily;
    }
}

function changeFont() {
    const font = document.getElementById('fontSelect').value;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontFamily', font);
        canvas.renderAll();
    }
}
window.changeFont = changeFont;

function rotateSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) {
        alertBox("オブジェクトを選択してください");
        return;
    }
    activeObjects.forEach(obj => {
        const currentAngle = obj.angle || 0;
        obj.rotate(currentAngle + 90);
    });
    canvas.renderAll();
}
window.rotateSelected = rotateSelected;

function selectAll() {
    const objs = canvas.getObjects().filter(obj => obj.name !== 'gridLine');
    if (objs.length === 0) {
        alertBox("選択できるオブジェクトがありません");
        return;
    }
    const selection = new fabric.ActiveSelection(objs, { canvas: canvas });
    canvas.setActiveObject(selection);
    canvas.renderAll();
}
window.selectAll = selectAll;

function changeCanvasSize() {
    const sizeValue = document.getElementById('canvasSizeSelect').value;
    const [newWidth, newHeight] = sizeValue.split('x').map(Number);
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    if (oldWidth === newWidth && oldHeight === newHeight) return;

    // キャンバスの内部解像度（実描画領域）を更新（画像の実ピクセルサイズは維持）
    canvas.setDimensions({
        width: newWidth,
        height: newHeight
    }, { backstoreOnly: true });

    canvas.width = newWidth;
    canvas.height = newHeight;

    applyBackground();

    if (document.getElementById('gridToggle').checked) toggleGrid(true);
    canvas.renderAll();
    saveState();
    
    // 全体表示がONなら全体フィット、OFFなら現在のズーム倍率でキャンバスを再描画
    if (document.getElementById('zoomFitToggle').checked) {
        fitCanvasToView();
    } else {
        updateCanvasZoom();
    }
    alertBox(`サイズを ${newWidth} x ${newHeight} に変更しました`);
}
window.changeCanvasSize = changeCanvasSize;

// ズーム倍率を適用するコア関数
function applyCanvasScale(scale) {
    if (!canvas) return;
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    scale = Math.max(0.05, Math.min(3.0, scale));

    // Fabric.jsの内部ズームを設定
    canvas.setZoom(scale);

    // CSS上の表示サイズのみを変更（内部バッファ解像度は変更しない）
    canvas.setDimensions({
        width: Math.round(canvas.width * scale),
        height: Math.round(canvas.height * scale)
    }, { cssOnly: true });

    // UIのパーセント表示とスライダーの数値を同期
    const percent = Math.round(scale * 100);
    const label = document.getElementById('zoomPercentLabel');
    const slider = document.getElementById('zoomSlider');
    if (label) label.innerText = `${percent}%`;
    if (slider) slider.value = Math.min(200, Math.max(10, percent));

    // キャンバスコンテナのスタイル
    const container = canvas.getElement().parentElement;
    if (container) {
        container.style.margin = 'auto';
    }

    canvas.renderAll();
}

// 画面枠に合わせて自動フィット
function fitCanvasToView() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper || !canvas) return;

    const paddingX = 40;
    const paddingY = 40;
    const availableWidth = Math.max(50, wrapper.clientWidth - paddingX);
    const availableHeight = Math.max(50, wrapper.clientHeight - paddingY);

    const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
    applyCanvasScale(scale);
    wrapper.style.overflow = 'hidden';
}

function updateCanvasZoom() {
    const isFit = document.getElementById('zoomFitToggle').checked;
    const wrapper = document.getElementById('canvas-wrapper');
    if (isFit) {
        fitCanvasToView();
    } else {
        const slider = document.getElementById('zoomSlider');
        const scale = slider ? parseInt(slider.value, 10) / 100 : 1;
        applyCanvasScale(scale);
        if (wrapper) wrapper.style.overflow = 'auto';
    }
}
window.updateCanvasZoom = updateCanvasZoom;

function toggleZoomFit() {
    const isFit = document.getElementById('zoomFitToggle').checked;
    if (isFit) {
        fitCanvasToView();
    } else {
        resetZoom100();
    }
}
window.toggleZoomFit = toggleZoomFit;

function handleManualZoom(val) {
    const isFitCheckbox = document.getElementById('zoomFitToggle');
    if (isFitCheckbox) isFitCheckbox.checked = false;
    const scale = parseFloat(val) / 100;
    applyCanvasScale(scale);
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.style.overflow = 'auto';
}
window.handleManualZoom = handleManualZoom;

function resetZoom100() {
    const isFitCheckbox = document.getElementById('zoomFitToggle');
    if (isFitCheckbox) isFitCheckbox.checked = false;
    applyCanvasScale(1.0);
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) wrapper.style.overflow = 'auto';
}
window.resetZoom100 = resetZoom100;

function toggleGrid(forceRefresh = false) {
    const isGridVisible = document.getElementById('gridToggle').checked;
    const objects = canvas.getObjects().filter(obj => obj.name === 'gridLine');
    objects.forEach(obj => canvas.remove(obj));

    if (isGridVisible || forceRefresh) {
        for (let i = 0; i <= (canvas.width / gridSize); i++) {
            const lineV = new fabric.Line([i * gridSize, 0, i * gridSize, canvas.height], {
                stroke: '#e5e7eb', selectable: false, evented: false, name: 'gridLine'
            });
            canvas.add(lineV); canvas.sendToBack(lineV);
        }
        for (let i = 0; i <= (canvas.height / gridSize); i++) {
            const lineH = new fabric.Line([0, i * gridSize, canvas.width, i * gridSize], {
                stroke: '#e5e7eb', selectable: false, evented: false, name: 'gridLine'
            });
            canvas.add(lineH); canvas.sendToBack(lineH);
        }
    }
    canvas.renderAll();
}
window.toggleGrid = toggleGrid;

// 画像読み込みと自動整列
async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const showName = document.getElementById('filenameToggle').checked;

    const loadPromises = files.map(file => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
                    resolve({ img: img, fileName: fileNameNoExt });
                });
            };
            reader.readAsDataURL(file);
        });
    });

    const imageDataList = await Promise.all(loadPromises);
    const count = imageDataList.length;

    const margin = gridSize; // グリッド1マス分 (50px)
    const labelHeight = showName ? 18 : 0;
    const targetHeight = 250; // 基準となる画像の高さ

    // 既存のオブジェクトの位置を調べて、次の配置位置を決める
    const existingObjects = canvas.getObjects().filter(o => o.name !== 'gridLine');
    let currentX = margin;
    let currentY = margin;
    let rowMaxHeight = 0;

    if (existingObjects.length > 0) {
        // 最も下にあるオブジェクトの行を見つける
        let maxBottom = 0;
        existingObjects.forEach(obj => {
            const b = obj.getBoundingRect(true);
            maxBottom = Math.max(maxBottom, b.top + b.height);
        });
        currentX = margin;
        currentY = maxBottom + margin;
    }

    isBatchAdding = true; // 追加中の個別saveStateを抑止

    imageDataList.forEach((data, i) => {
        const img = data.img;
        // 基準の高さに合わせてリサイズ
        const scale = targetHeight / img.height;
        img.scale(scale);

        const imgWidth = img.getScaledWidth();
        const imgHeight = img.getScaledHeight();

        // 1行に収まらない場合は改行
        if (currentX + imgWidth + margin > canvas.width && currentX > margin) {
            currentX = margin;
            currentY += rowMaxHeight + margin + labelHeight;
            rowMaxHeight = 0;
        }

        img.set({
            left: currentX,
            top: currentY,
            name: 'userImage',
            customFileName: data.fileName
        });
        img.setCoords();
        canvas.add(img);

        if (showName) {
            const textLabel = new fabric.Text(data.fileName, {
                fontSize: 14,
                fontFamily: 'sans-serif',
                originX: 'center',
                fill: '#555555',
                name: 'filenameLabel',
                left: currentX + imgWidth / 2,
                top: currentY + imgHeight + 5
            });
            canvas.add(textLabel);
        }

        currentX += imgWidth + margin;
        rowMaxHeight = Math.max(rowMaxHeight, imgHeight);
    });

    isBatchAdding = false;
    saveState(); // 一括追加後に1回だけ履歴保存

    // 読み込み後にズームを更新して全体が見えるようにする
    canvas.renderAll();
    if (document.getElementById('zoomFitToggle').checked) {
        fitCanvasToView();
    } else {
        updateCanvasZoom();
    }

    e.target.value = '';
    alertBox(`${count}枚の画像を読み込み、整列しました`);
}
window.handleImageUpload = handleImageUpload;

function toggleFilenameVisibility() {
    const isVisible = document.getElementById('filenameToggle').checked;
    
    // 既存のファイル名ラベルを一旦削除
    const labels = canvas.getObjects().filter(obj => obj.name === 'filenameLabel');
    labels.forEach(l => canvas.remove(l));

    if (isVisible) {
        // 画像オブジェクトの下にファイル名ラベルを再生成
        const images = canvas.getObjects().filter(obj => obj.name === 'userImage' && obj.customFileName);
        images.forEach(img => {
            const textLabel = new fabric.Text(img.customFileName, {
                fontSize: 14,
                fontFamily: 'sans-serif',
                originX: 'center',
                fill: '#555555',
                name: 'filenameLabel',
                left: img.left + img.getScaledWidth() / 2,
                top: img.top + img.getScaledHeight() + 5
            });
            canvas.add(textLabel);
        });
    }
    canvas.renderAll();
}
window.toggleFilenameVisibility = toggleFilenameVisibility;

function addText() {
    const font = document.getElementById('fontSelect').value;
    const text = new fabric.IText('テキスト入力', {
        left: 100, top: 100, fontFamily: font, fontSize: 40, fill: '#333333'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
}
window.addText = addText;

function addStamp(emoji) {
    const stamp = new fabric.Text(emoji, { left: 150, top: 150, fontSize: 60 });
    canvas.add(stamp); canvas.setActiveObject(stamp);
}
window.addStamp = addStamp;

function deleteSelected() {
    canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
}
window.deleteSelected = deleteSelected;

function clearCanvas() {
    if (confirm('すべて削除しますか？')) {
        canvas.clear();
        canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
        backgroundImageObject = null;
        document.getElementById('bgLoader').value = '';
        document.getElementById('blurControl').classList.add('hidden');
        document.getElementById('bgBlurSlider').value = 0;
        if (document.getElementById('gridToggle').checked) toggleGrid();
    }
}
window.clearCanvas = clearCanvas;

function alignHorizontal() {
    const objs = canvas.getActiveObjects();
    if (objs.length < 2) return alertBox("2つ以上選択してください");
    objs.sort((a, b) => a.left - b.left);
    const dist = objs[objs.length - 1].left - objs[0].left;
    const step = dist / (objs.length - 1);
    objs.forEach((obj, i) => {
        obj.set({ left: objs[0].left + (step * i), top: objs[0].top });
        obj.setCoords();
    });
    canvas.renderAll();
}
window.alignHorizontal = alignHorizontal;

function alignVertical() {
    const objs = canvas.getActiveObjects();
    if (objs.length < 2) return alertBox("2つ以上選択してください");
    objs.sort((a, b) => a.top - b.top);
    const dist = objs[objs.length - 1].top - objs[0].top;
    const step = dist / (objs.length - 1);
    objs.forEach((obj, i) => {
        obj.set({ top: objs[0].top + (step * i), left: objs[0].left });
        obj.setCoords();
    });
    canvas.renderAll();
}
window.alignVertical = alignVertical;

function cropToSelection() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return alertBox("切り抜きたい範囲のオブジェクトを選択してください");

    // 選択を解除してオブジェクトの座標を絶対座標に戻す
    canvas.discardActiveObject();

    // 選択されていたオブジェクトの範囲を計算
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    activeObjects.forEach(obj => {
        const bound = obj.getBoundingRect();
        minX = Math.min(minX, bound.left);
        minY = Math.min(minY, bound.top);
        maxX = Math.max(maxX, bound.left + bound.width);
        maxY = Math.max(maxY, bound.top + bound.height);
    });

    // 遊び（パディング）を追加
    const padding = 20;
    minX -= padding; minY -= padding;
    maxX += padding; maxY += padding;

    // キャンバスのサイズを更新
    const newWidth = Math.max(100, maxX - minX);
    const newHeight = Math.max(100, maxY - minY);

    // 全オブジェクトを移動させて新しい原点に合わせる
    const allObjects = canvas.getObjects().filter(o => o.name !== 'gridLine');
    allObjects.forEach(obj => {
        obj.set({
            left: obj.left - minX,
            top: obj.top - minY
        });
        obj.setCoords();
    });

    // 背景画像がある場合はそれも移動・調整が必要だが、複雑なため警告のみ
    if (backgroundImageObject) {
        alertBox("背景画像の位置調整は手動で行ってください");
    }

    canvas.setWidth(newWidth);
    canvas.setHeight(newHeight);

    // グリッドのリフレッシュ
    if (document.getElementById('gridToggle').checked) toggleGrid(true);

    canvas.renderAll();
    updateCanvasZoom();
    alertBox(`キャンバスを ${Math.round(newWidth)} x ${Math.round(newHeight)} に切り抜きました`);
}
window.cropToSelection = cropToSelection;

function downloadImage() {
    const gridState = document.getElementById('gridToggle').checked;
    if (gridState) { document.getElementById('gridToggle').checked = false; toggleGrid(); }
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
    const link = document.createElement('a');
    link.download = `composed-image-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    if (gridState) { document.getElementById('gridToggle').checked = true; toggleGrid(); }
}
window.downloadImage = downloadImage;

function alertBox(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = "fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in-out text-sm";
    msgDiv.innerText = message;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 2500);
}
window.alertBox = alertBox;
