let canvas;
const gridSize = 50;
let backgroundImageObject = null; // 背景画像を保持

window.onload = function() {
    initCanvas();
    const loader = document.getElementById('imageLoader');
    if (loader) loader.addEventListener('change', handleImageUpload);
    
    // ウィンドウリサイズ時にズームを更新
    window.addEventListener('resize', updateCanvasZoom);
};

function initCanvas() {
    canvas = new fabric.Canvas('mainCanvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
    });

    // オブジェクト追加時にアスペクト比固定設定を適用
    canvas.on('object:added', function(e) {
        const obj = e.target;
        if (obj && obj.name !== 'gridLine') {
            setupObjectControls(obj);
        }
    });

    // スナップ機能
    canvas.on('object:moving', function(options) {
        if (document.getElementById('gridToggle').checked) {
            options.target.set({
                left: Math.round(options.target.left / gridSize) * gridSize,
                top: Math.round(options.target.top / gridSize) * gridSize
            });
        }
    });

    canvas.on('selection:created', updateFontDropdown);
    canvas.on('selection:updated', updateFontDropdown);
    
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
    const [width, height] = sizeValue.split('x').map(Number);
    canvas.setWidth(width);
    canvas.setHeight(height);
    
    applyBackground();
    
    if (document.getElementById('gridToggle').checked) toggleGrid(true);
    canvas.renderAll();
    updateCanvasZoom(); // サイズ変更後にズームを更新
    alertBox(`サイズを ${width} x ${height} に変更しました`);
}
window.changeCanvasSize = changeCanvasSize;

function updateCanvasZoom() {
    const isFit = document.getElementById('zoomFitToggle').checked;
    const wrapper = document.getElementById('canvas-wrapper');
    const container = canvas.getElement().parentElement;

    if (isFit) {
        // ラッパーのサイズに合わせて倍率を計算
        const padding = 40;
        const availableWidth = wrapper.clientWidth - padding;
        const availableHeight = wrapper.clientHeight - padding;
        
        const scale = Math.min(availableWidth / canvas.width, availableHeight / canvas.height, 1);
        
        // Fabric.jsのズームを設定（座標計算を正しく保つ）
        canvas.setZoom(scale);
        
        // CSS上の表示サイズのみを変更（画質は落とさない）
        canvas.setDimensions({
            width: canvas.width * scale,
            height: canvas.height * scale
        }, { cssOnly: true });

        // スクロールバーを消して中央寄せ
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
    } else {
        // 元に戻す
        canvas.setZoom(1);
        canvas.setDimensions({
            width: canvas.width,
            height: canvas.height
        }, { cssOnly: true });

        wrapper.style.overflow = 'auto';
        wrapper.style.display = 'block';
    }
}
window.updateCanvasZoom = updateCanvasZoom;

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
    const margin_default = 20; 
    const labelHeight_default = 30;
    
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
    
    // キャンバスサイズに合わせて1行の枚数を決定
    const sizeValue = document.getElementById('canvasSizeSelect').value;
    let cols = 3; // 低画質 (800x600) のデフォルト
    if (sizeValue === '1200x900') cols = 5;
    else if (sizeValue === '1920x1080') cols = 10;
    else if (sizeValue === '3840x2160') cols = 18;

    // 枚数が少ない場合はその枚数に合わせる
    const actualCols = Math.min(count, cols);
    const rows = Math.ceil(count / actualCols);
    
    const margin = count > 12 ? 8 : (count > 4 ? 12 : 15); 
    const labelHeight = showName ? 18 : 0; 

    const availableWidth = canvas.width - (margin * 2); 
    const availableHeight = canvas.height - (margin * 2); 
    
    const targetCellWidth = (availableWidth - (margin * (actualCols - 1))) / actualCols;
    const targetCellHeight = (availableHeight - (margin * (rows - 1))) / rows;

    // 全体の配置範囲を計算して中央に寄せるためのオフセット
    const totalGridWidth = actualCols * targetCellWidth + (actualCols - 1) * margin;
    const totalGridHeight = rows * targetCellHeight + (rows - 1) * margin;
    const offsetX = (canvas.width - totalGridWidth) / 2;
    const offsetY = (canvas.height - totalGridHeight) / 2;

    imageDataList.forEach((data, i) => {
        const img = data.img;
        const scale = Math.min(targetCellWidth / img.width, (targetCellHeight - labelHeight) / img.height);
        img.scale(scale);

        const textLabel = new fabric.Text(data.fileName, {
            fontSize: Math.max(10, 14 * scale),
            fontFamily: 'sans-serif',
            originX: 'center',
            fill: '#555555',
            visible: showName,
            name: 'filenameLabel',
            top: img.getScaledHeight() + 5,
            left: img.getScaledWidth() / 2
        });

        const group = new fabric.Group([img, textLabel], {
            name: 'imageGroup',
            originX: 'left',
            originY: 'top'
        });

        const colIdx = i % actualCols;
        const rowIdx = Math.floor(i / actualCols);
        
        group.set({
            left: offsetX + colIdx * (targetCellWidth + margin),
            top: offsetY + rowIdx * (targetCellHeight + margin)
        });

        group.setCoords();
        canvas.add(group);
    });

    canvas.renderAll();
    e.target.value = '';
    alertBox(`${count}枚の画像を読み込み、整列しました`);
}
window.handleImageUpload = handleImageUpload;

function toggleFilenameVisibility() {
    const isVisible = document.getElementById('filenameToggle').checked;
    canvas.getObjects().forEach(obj => {
        if (obj.name === 'imageGroup') {
            const label = obj.item(1);
            if (label && label.name === 'filenameLabel') label.set('visible', isVisible);
        }
    });
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
    if(confirm('すべて削除しますか？')) {
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
    const dist = objs[objs.length-1].left - objs[0].left;
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
    const dist = objs[objs.length-1].top - objs[0].top;
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

    // 選択されているオブジェクトの範囲を計算
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
