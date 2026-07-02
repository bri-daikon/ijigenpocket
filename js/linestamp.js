// ==========================================
// アプリケーションの状態管理 (State)
// ==========================================
const appState = {
  step: 1,
  sourceImage: null,
  gridRows: 3,
  gridCols: 3,
  splitLinesX: [],
  splitLinesY: [],
  pieces: [],
  selectedPieceIndex: 0,
  zoom2: 1.0, // 分割画面のズーム倍率
  zoom3: 1.0  // 透過画面のズーム倍率
};

const stepsInfo = [
  { id: 1, label: '1. 画像選択', icon: 'upload-cloud' },
  { id: 2, label: '2. 分割', icon: 'scissors' },
  { id: 3, label: '3. 透過・編集', icon: 'droplet' },
  { id: 4, label: '4. ダウンロード', icon: 'download' }
];

// ==========================================
// ユーティリティ関数
// ==========================================

const loadImage = (source) => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'string') {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.readAsDataURL(source);
    }
  });
};

const updateIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

// ==========================================
// UI制御関数
// ==========================================

function updateStepIndicators() {
  const container = document.getElementById('step-indicators');
  if (!container) return;
  container.innerHTML = '';
  stepsInfo.forEach(s => {
    const isActive = appState.step === s.id;
    const isPast = appState.step > s.id;
    const div = document.createElement('div');
    
    let classes = "flex items-center px-4 py-2 rounded-md transition-all ";
    if (isActive) classes += "bg-slate-800 text-white font-bold shadow-sm";
    else if (isPast) classes += "text-blue-600";
    else classes += "text-slate-400";
    
    div.className = classes;
    div.innerHTML = `<i data-lucide="${s.icon}" class="mr-2 w-[18px] h-[18px]"></i> <span class="hidden sm:inline">${s.label}</span>`;
    container.appendChild(div);
  });
  updateIcons();
}

function setStep(newStep) {
  appState.step = newStep;
  document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
  const targetStep = document.getElementById(`step-${newStep}`);
  if (targetStep) targetStep.classList.remove('hidden');
  updateStepIndicators();
  
  if (newStep === 2) renderStep2();
  if (newStep === 3) renderStep3();
  if (newStep === 4) renderStep4();
}

function resetApp() {
  appState.sourceImage = null;
  appState.pieces = [];
  const uploadInput = document.getElementById('file-upload');
  if (uploadInput) uploadInput.value = '';
  setStep(1);
}

// ==========================================
// Step 1: ファイルアップロード処理
// ==========================================
const fileUpload = document.getElementById('file-upload');
if (fileUpload) {
  fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      appState.sourceImage = await loadImage(file);
      
      // 画像が大きすぎる場合は初期ズームを縮小
      appState.zoom2 = 1.0;
      const maxWidth = 450;
      if (appState.sourceImage.width > maxWidth) {
         appState.zoom2 = maxWidth / appState.sourceImage.width;
      }

      initializeSplitLines(3, 3);
      setStep(2);
    } catch (error) {
      alert("画像の読み込みに失敗しました。");
    }
  });
}

// ==========================================
// Step 2: 分割処理とドラッグUI・ズーム
// ==========================================
function initializeSplitLines(rows, cols) {
  appState.gridRows = rows;
  appState.gridCols = cols;
  
  appState.splitLinesX = [];
  for (let i = 1; i < cols; i++) appState.splitLinesX.push(i / cols);
  
  appState.splitLinesY = [];
  for (let i = 1; i < rows; i++) appState.splitLinesY.push(i / rows);
  
  if (appState.step === 2) renderStep2();
}

// ズーム（拡大縮小）機能 - Step 2
function updateZoom2Display() {
  const container = document.getElementById('split-container');
  if (!container) return;
  const newWidth = appState.sourceImage.width * appState.zoom2;
  const newHeight = appState.sourceImage.height * appState.zoom2;
  
  // 画像の元サイズにズーム倍率を掛けてコンテナの幅・高さを決定
  container.style.width = `${newWidth}px`;
  container.style.height = `${newHeight}px`;
  const zoomVal = document.getElementById('zoom-val-2');
  if (zoomVal) zoomVal.textContent = Math.round(appState.zoom2 * 100) + '%';
  
  // スクロール制御: 画像が枠より大きくなったら中央揃えを解除して左上起点に変更
  const scrollArea = document.getElementById('step2-scroll-area');
  const wrapper = document.getElementById('split-wrapper');
  if (scrollArea && wrapper) {
    if (newWidth + 32 > scrollArea.clientWidth || newHeight + 32 > scrollArea.clientHeight) {
      wrapper.classList.remove('items-center', 'justify-center');
      wrapper.classList.add('items-start', 'justify-start');
    } else {
      wrapper.classList.remove('items-start', 'justify-start');
      wrapper.classList.add('items-center', 'justify-center');
    }
  }
}

function changeZoom2(delta) {
  appState.zoom2 = Math.max(0.2, Math.min(5.0, appState.zoom2 + delta)); // 20% 〜 500%
  updateZoom2Display();
}

function renderStep2() {
  const rowsRange = document.getElementById('range-rows');
  const rowsVal = document.getElementById('val-rows');
  const colsRange = document.getElementById('range-cols');
  const colsVal = document.getElementById('val-cols');

  if (rowsRange) rowsRange.value = appState.gridRows;
  if (rowsVal) rowsVal.textContent = appState.gridRows;
  if (colsRange) colsRange.value = appState.gridCols;
  if (colsVal) colsVal.textContent = appState.gridCols;

  const imgPreview = document.getElementById('source-image-preview');
  if (imgPreview) imgPreview.src = appState.sourceImage.src;
  
  updateZoom2Display();
  renderSplitLines();
}

// 分割線の描画とドラッグ処理
let draggingLine = null; // { type: 'x'|'y', index: 0 }

function handleLineMouseDown(type, index, e) {
  e.preventDefault();
  draggingLine = { type, index };
}

window.addEventListener('mousemove', (e) => {
  if (!draggingLine) return;
  const container = document.getElementById('split-container');
  if (!container) return;
  const rect = container.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

  if (draggingLine.type === 'x') {
    appState.splitLinesX[draggingLine.index] = x;
  } else {
    appState.splitLinesY[draggingLine.index] = y;
  }
  renderSplitLines();
});

window.addEventListener('mouseup', () => {
  draggingLine = null;
});

function renderSplitLines() {
  const container = document.getElementById('split-lines-container');
  if (!container) return;
  container.innerHTML = '';
  
  // 縦線 (X座標)
  appState.splitLinesX.forEach((posX, i) => {
    const line = document.createElement('div');
    line.className = "absolute top-0 bottom-0 cursor-col-resize group z-10 flex justify-center";
    line.style.left = `${posX * 100}%`;
    line.style.width = '10px';
    line.style.transform = 'translateX(-50%)';
    line.innerHTML = `
      <div class="h-full w-[2px] bg-blue-400 border-x border-white group-hover:bg-blue-500 group-hover:w-[4px] transition-all ${draggingLine?.type==='x' && draggingLine?.index===i ? '!bg-blue-600' : ''}"></div>
      <div class="absolute top-1/2 -mt-3 bg-white border border-blue-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-blue-500 text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none">↔</div>
    `;
    line.onmousedown = (e) => handleLineMouseDown('x', i, e);
    container.appendChild(line);
  });

  // 横線 (Y座標)
  appState.splitLinesY.forEach((posY, i) => {
    const line = document.createElement('div');
    line.className = "absolute left-0 right-0 cursor-row-resize group z-10 flex flex-col items-center";
    line.style.top = `${posY * 100}%`;
    line.style.height = '10px';
    line.style.transform = 'translateY(-50%)';
    line.innerHTML = `
      <div class="w-full h-[2px] bg-blue-400 border-y border-white group-hover:bg-blue-500 group-hover:h-[4px] transition-all ${draggingLine?.type==='y' && draggingLine?.index===i ? '!bg-blue-600' : ''}"></div>
      <div class="absolute left-1/2 -ml-3 bg-white border border-blue-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm text-blue-500 text-[10px] opacity-0 group-hover:opacity-100 pointer-events-none">↕</div>
    `;
    line.onmousedown = (e) => handleLineMouseDown('y', i, e);
    container.appendChild(line);
  });
}

const rangeRows = document.getElementById('range-rows');
if (rangeRows) {
  rangeRows.addEventListener('input', (e) => initializeSplitLines(parseInt(e.target.value), appState.gridCols));
}
const rangeCols = document.getElementById('range-cols');
if (rangeCols) {
  rangeCols.addEventListener('input', (e) => initializeSplitLines(appState.gridRows, parseInt(e.target.value)));
}

// 分割実行
async function handleApplySplit() {
  if (!appState.sourceImage) return;
  
  const xPositions = [0, ...[...appState.splitLinesX].sort((a,b)=>a-b), 1];
  const yPositions = [0, ...[...appState.splitLinesY].sort((a,b)=>a-b), 1];
  
  appState.pieces = [];
  let idCounter = 1;

  for (let row = 0; row < yPositions.length - 1; row++) {
    for (let col = 0; col < xPositions.length - 1; col++) {
      const startX = Math.round(xPositions[col] * appState.sourceImage.width);
      const endX = Math.round(xPositions[col + 1] * appState.sourceImage.width);
      const startY = Math.round(yPositions[row] * appState.sourceImage.height);
      const endY = Math.round(yPositions[row + 1] * appState.sourceImage.height);
      
      const width = endX - startX;
      const height = endY - startY;

      // 1. 分割された元画像をそのまま保存する Canvas (リサイズしない)
      const rawCanvas = document.createElement('canvas');
      rawCanvas.width = width;
      rawCanvas.height = height;
      rawCanvas.getContext('2d').drawImage(appState.sourceImage, startX, startY, width, height, 0, 0, width, height);

      // 元画像のバックアップ（リセット用）
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = width;
      originalCanvas.height = height;
      originalCanvas.getContext('2d').drawImage(rawCanvas, 0, 0);

      const piece = {
        id: idCounter++,
        rawCanvas: rawCanvas,
        originalCanvas: originalCanvas,
        threshold: 30,
        smoothEdge: true,
        clicks: [],
        history: [],
        processedDataUrl: ''
      };
      
      compileProcessedDataUrl(piece);
      appState.pieces.push(piece);
    }
  }
  appState.selectedPieceIndex = 0;
  appState.zoom3 = 1.0; 
  setStep(3);
}

// 画像をデータURL化し保存する
function compileProcessedDataUrl(piece) {
  piece.processedDataUrl = piece.rawCanvas.toDataURL('image/png');
}

// ==========================================
// Step 3: 背景透過機能・ズーム・背景切り替え
// ==========================================

// キャンバスの確認用背景を切り替える機能
function changeCanvasBg(type) {
  const container = document.getElementById('canvas-container');
  const btnChecker = document.getElementById('bg-btn-checker');
  const btnBlack = document.getElementById('bg-btn-black');
  const btnWhite = document.getElementById('bg-btn-white');

  if (!container) return;

  // リセット
  container.classList.remove('checkerboard');
  container.style.backgroundColor = '';
  
  if (btnChecker) btnChecker.className = "p-1 px-3 text-xs font-bold bg-white text-slate-700 rounded hover:bg-slate-100 transition-colors";
  if (btnBlack) btnBlack.className = "p-1 px-3 text-xs font-bold bg-white text-slate-700 rounded hover:bg-slate-100 transition-colors";
  if (btnWhite) btnWhite.className = "p-1 px-3 text-xs font-bold bg-white text-slate-700 rounded hover:bg-slate-100 transition-colors";

  // 適用
  if (type === 'checker') {
    container.classList.add('checkerboard');
    if (btnChecker) btnChecker.className = "p-1 px-3 text-xs font-bold bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors";
  } else if (type === 'black') {
    container.style.backgroundColor = '#1e293b'; // slate-800
    if (btnBlack) btnBlack.className = "p-1 px-3 text-xs font-bold bg-slate-800 text-white rounded hover:bg-slate-900 transition-colors";
  } else if (type === 'white') {
    container.style.backgroundColor = '#ffffff';
    if (btnWhite) btnWhite.className = "p-1 px-3 text-xs font-bold bg-slate-200 text-slate-800 rounded hover:bg-slate-300 transition-colors";
  }
}

// ズーム（拡大縮小）機能 - Step 3
function updateZoom3Display() {
  const canvas = document.getElementById('transparency-canvas');
  if (!canvas) return;
  const newWidth = canvas.width * appState.zoom3;
  const newHeight = canvas.height * appState.zoom3;
  
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
  const zoomVal = document.getElementById('zoom-val-3');
  if (zoomVal) zoomVal.textContent = Math.round(appState.zoom3 * 100) + '%';
  
  // スクロール制御: 画像が枠より大きくなったら中央揃えを解除して左上起点に変更
  const scrollArea = document.getElementById('step3-scroll-area');
  const wrapper = document.getElementById('transparency-wrapper');
  if (scrollArea && wrapper) {
    if (newWidth + 32 > scrollArea.clientWidth || newHeight + 32 > scrollArea.clientHeight) {
      wrapper.classList.remove('items-center', 'justify-center');
      wrapper.classList.add('items-start', 'justify-start');
    } else {
      wrapper.classList.remove('items-start', 'justify-start');
      wrapper.classList.add('items-center', 'justify-center');
    }
  }
}

function changeZoom3(delta) {
  appState.zoom3 = Math.max(0.2, Math.min(5.0, appState.zoom3 + delta));
  updateZoom3Display();
}

function renderStep3() {
  const pieceCount = document.getElementById('piece-count');
  const totalTargets = document.getElementById('total-targets');
  const currentTarget = document.getElementById('current-target');
  
  if (pieceCount) pieceCount.textContent = appState.pieces.length;
  if (totalTargets) totalTargets.textContent = appState.pieces.length;
  if (currentTarget) currentTarget.textContent = appState.selectedPieceIndex + 1;
  
  const piece = appState.pieces[appState.selectedPieceIndex];
  if (!piece) return;

  const thresholdRange = document.getElementById('threshold-range');
  const thresholdVal = document.getElementById('threshold-val');
  const smoothEdgeCheck = document.getElementById('smooth-edge-check');

  if (thresholdRange) thresholdRange.value = piece.threshold;
  if (thresholdVal) thresholdVal.textContent = piece.threshold;
  if (smoothEdgeCheck) smoothEdgeCheck.checked = piece.smoothEdge;

  // 左側リスト描画
  const listContainer = document.getElementById('piece-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    appState.pieces.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = `cursor-pointer rounded-lg border-2 overflow-hidden relative checkerboard transition-colors ${appState.selectedPieceIndex === i ? 'border-blue-500 shadow' : 'border-transparent hover:border-slate-300'}`;
      div.onclick = () => {
        appState.selectedPieceIndex = i;
        renderStep3();
      };
      div.innerHTML = `
        <img src="${p.processedDataUrl}" class="w-full h-auto object-contain" />
        <div class="absolute top-1 left-1 bg-slate-900 bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">${i + 1}</div>
      `;
      listContainer.appendChild(div);
    });
  }

  // メインキャンバス描画
  drawPieceCanvas(appState.selectedPieceIndex);
  updateZoom3Display();
}

// メインキャンバスを描画する
function drawPieceCanvas(pieceIndex) {
  const piece = appState.pieces[pieceIndex];
  if (!piece) return;
  const canvas = document.getElementById('transparency-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  
  canvas.width = piece.rawCanvas.width;
  canvas.height = piece.rawCanvas.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.drawImage(piece.rawCanvas, 0, 0);
}

// 透過処理メインロジック
async function applyTransparency(pieceIndex) {
  const piece = appState.pieces[pieceIndex];
  if (!piece) return;
  
  const ctx = piece.rawCanvas.getContext('2d', { willReadFrequently: true });
  ctx.clearRect(0, 0, piece.rawCanvas.width, piece.rawCanvas.height);
  ctx.drawImage(piece.originalCanvas, 0, 0);
  
  if (piece.clicks && piece.clicks.length > 0) {
    const imageData = ctx.getImageData(0, 0, piece.rawCanvas.width, piece.rawCanvas.height);
    const data = imageData.data;
    const width = piece.rawCanvas.width;
    const height = piece.rawCanvas.height;
    const featherRange = piece.smoothEdge ? 20 : 0;
    
    for (const click of piece.clicks) {
      const [tr, tg, tb] = click.color;
      
      const visited = new Uint8Array(width * height);
      const stack = [Math.floor(click.pos.x), Math.floor(click.pos.y)];
      
      while(stack.length > 0) {
        const y = stack.pop();
        const x = stack.pop();
        
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx1D = y * width + x;
        if (visited[idx1D]) continue;
        visited[idx1D] = 1;
        
        const idx = idx1D * 4;
        const a = data[idx+3];
        if (a === 0) continue; 
        
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        
        const distance = Math.sqrt(Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2));
        if (distance <= piece.threshold) {
          data[idx+3] = 0; 
          stack.push(x - 1, y);
          stack.push(x + 1, y);
          stack.push(x, y - 1);
          stack.push(x, y + 1);
        } else if (piece.smoothEdge && distance <= piece.threshold + featherRange) {
          const ratio = (distance - piece.threshold) / featherRange;
          data[idx+3] = Math.min(a, Math.floor(a * ratio));
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  compileProcessedDataUrl(piece);
  
  if (appState.step === 3 && appState.selectedPieceIndex === pieceIndex) {
    drawPieceCanvas(pieceIndex);
    const thumbs = document.querySelectorAll('#piece-list img');
    if (thumbs[pieceIndex]) {
      thumbs[pieceIndex].src = piece.processedDataUrl;
    }
  }
}

function updateLeftPanelPreview(pieceIndex) {
  const piece = appState.pieces[pieceIndex];
  compileProcessedDataUrl(piece);
  
  const thumbs = document.querySelectorAll('#piece-list img');
  if (thumbs[pieceIndex]) {
    thumbs[pieceIndex].src = piece.processedDataUrl;
  }
}

function saveToHistory(piece) {
  const canvas = document.createElement('canvas');
  canvas.width = piece.rawCanvas.width;
  canvas.height = piece.rawCanvas.height;
  canvas.getContext('2d').drawImage(piece.rawCanvas, 0, 0);
  piece.history.push(canvas);
  if (piece.history.length > 20) piece.history.shift(); // 履歴サイズ制限
}

// クリックイベントリスナー設定
const transparencyCanvas = document.getElementById('transparency-canvas');
if (transparencyCanvas) {
  transparencyCanvas.addEventListener('click', (e) => {
    const rect = transparencyCanvas.getBoundingClientRect();
    const scaleX = transparencyCanvas.width / rect.width;
    const scaleY = transparencyCanvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;
    
    const piece = appState.pieces[appState.selectedPieceIndex];
    if (!piece) return;
    const rx = canvasX;
    const ry = canvasY;
    
    if (rx >= 0 && rx < piece.rawCanvas.width && ry >= 0 && ry < piece.rawCanvas.height) {
      const ctx = piece.rawCanvas.getContext('2d', { willReadFrequently: true });
      const pixel = ctx.getImageData(Math.floor(rx), Math.floor(ry), 1, 1).data;
      if (pixel[3] > 0) {
        saveToHistory(piece);
        
        piece.clicks.push({ color: [pixel[0], pixel[1], pixel[2]], pos: { x: rx, y: ry } });
        applyTransparency(appState.selectedPieceIndex);
      }
    }
  });
}

const thresholdRange = document.getElementById('threshold-range');
if (thresholdRange) {
  thresholdRange.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    const piece = appState.pieces[appState.selectedPieceIndex];
    piece.threshold = val;
    applyTransparency(appState.selectedPieceIndex);
  });
}

const smoothEdgeCheck = document.getElementById('smooth-edge-check');
if (smoothEdgeCheck) {
  smoothEdgeCheck.addEventListener('change', (e) => {
    const piece = appState.pieces[appState.selectedPieceIndex];
    piece.smoothEdge = e.target.checked;
    applyTransparency(appState.selectedPieceIndex);
  });
}

function undoLastTransparency() {
  const piece = appState.pieces[appState.selectedPieceIndex];
  if (piece && piece.history.length > 0) {
    const prevCanvas = piece.history.pop();
    const ctx = piece.rawCanvas.getContext('2d');
    ctx.clearRect(0, 0, piece.rawCanvas.width, piece.rawCanvas.height);
    ctx.drawImage(prevCanvas, 0, 0);
    
    if (piece.clicks.length > 0) {
      piece.clicks.pop();
    }
    
    compileProcessedDataUrl(piece);
    drawPieceCanvas(appState.selectedPieceIndex);
    updateLeftPanelPreview(appState.selectedPieceIndex);
  }
}

function undoTransparency() {
  const piece = appState.pieces[appState.selectedPieceIndex];
  if (!piece) return;
  piece.clicks = []; 
  piece.history = [];
  
  const ctx = piece.rawCanvas.getContext('2d');
  ctx.clearRect(0, 0, piece.rawCanvas.width, piece.rawCanvas.height);
  ctx.drawImage(piece.originalCanvas, 0, 0);
  
  compileProcessedDataUrl(piece);
  drawPieceCanvas(appState.selectedPieceIndex);
  updateLeftPanelPreview(appState.selectedPieceIndex);
}

async function handleAutoTransparency() {
  const piece = appState.pieces[appState.selectedPieceIndex];
  if (!piece) return;
  const ctx = piece.originalCanvas.getContext('2d', { willReadFrequently: true });
  const pixel = ctx.getImageData(0, 0, 1, 1).data;
  
  saveToHistory(piece);
  piece.clicks.push({ color: [pixel[0], pixel[1], pixel[2]], pos: { x: 0, y: 0 } });
  applyTransparency(appState.selectedPieceIndex);
}

// ==========================================
// Step 4: ダウンロード
// ==========================================
async function renderStep4() {
  const list = document.getElementById('download-list');
  if (!list) return;
  list.innerHTML = '';

  appState.pieces.forEach((piece, index) => {
    const div = document.createElement('div');
    div.className = "flex flex-col items-center bg-white p-2 rounded-lg shadow-sm border border-slate-200";
    div.innerHTML = `
      <div class="w-full mb-2 rounded border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden checkerboard">
        <img src="${piece.processedDataUrl}" class="max-w-full max-h-full object-contain" />
      </div>
      <button onclick="downloadSingle('${piece.processedDataUrl}', 'transparent_${String(index+1).padStart(2, '0')}.png')" class="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold py-1.5 px-3 rounded w-full transition-colors">
        DL (${index + 1})
      </button>
    `;
    list.appendChild(div);
  });
}

function downloadSingle(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

async function downloadAll() {
  if (window.JSZip) {
    const zip = new JSZip();
    const folder = zip.folder("images");
    
    appState.pieces.forEach((piece, index) => {
      const base64Data = piece.processedDataUrl.split(',')[1];
      folder.file(`transparent_${String(index + 1).padStart(2, '0')}.png`, base64Data, {base64: true});
    });
    
    try {
      const content = await zip.generateAsync({type: "blob"});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = "images.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
      alert("ZIPファイルの生成に失敗しました。");
    }
  } else {
    appState.pieces.forEach((piece, index) => {
      setTimeout(() => {
        downloadSingle(piece.processedDataUrl, `transparent_${String(index + 1).padStart(2, '0')}.png`);
      }, index * 200);
    });
  }
}

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  updateStepIndicators();
  updateIcons();
});
