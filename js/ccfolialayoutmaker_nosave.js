// アイコンの初期化
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// === 状態管理（データ） ===
let frame = null; // { url: url, x: 0, y: 0, width: 1280, height: 720 }
let panels = [];
let selectedPanelIds = []; // 'frame', またはパネルのidの配列
let copiedPanelData = []; // コピーされたパネルデータの配列
let zoomScale = null; // null は自動フィット、数値は固定倍率
let actionHistory = []; // 操作履歴スタック
const bgColors = ['white', 'gray', 'black', 'blue'];
const canvasBgColorsList = ['trans', 'white', 'gray', 'black'];
const canvasTargetMap = { 'trans': 'transparent', 'white': 'white', 'gray': 'gray', 'black': 'black' };
let previewBgColor = 'blue'; // 'white', 'gray', 'black', 'blue' (Undo対象外)
let canvasBgColor = 'black'; // 'transparent', 'white', 'gray', 'black' (Undo対象)

// === フレーム画像編集モーダル用の状態変数 ===
let editOriginalUrl = null;
let editHistory = [];
let activeTool = 'free';
let isDrawingSelection = false;
let startPoint = { x: 0, y: 0 };
let currentPoint = { x: 0, y: 0 };
let freePoints = [];
let editImage = null;

let isDragging = false;
let isResizing = false;
let dragOffset = { x: 0, y: 0 };
let dragStartPositions = []; // 複数移動用：{ id, x, y } の配列

let canvasWidth = 1280;
let canvasHeight = 720;
let showGrid = true;
let snapToGrid = false;

// === DOM要素の取得 ===
const canvasArea = document.getElementById('canvas-area');
const panelList = document.getElementById('panel-list');
const panelCount = document.getElementById('panel-count');
const clearFrameBtn = document.getElementById('clear-frame-btn');
const editFrameBtn = document.getElementById('edit-frame-btn');
const replacePanelUpload = document.getElementById('replace-panel-upload');
const undoActionBtn = document.getElementById('undo-action-btn');

const previewArea = document.getElementById('preview-area');
const alignTopBtn = document.getElementById('align-top-btn');
const alignCenterBtn = document.getElementById('align-center-btn');
const alignBottomBtn = document.getElementById('align-bottom-btn');
const alignLeftBtn = document.getElementById('align-left-btn');
const alignCenterHBtn = document.getElementById('align-center-h-btn');
const alignRightBtn = document.getElementById('align-right-btn');
const distributeHBtn = document.getElementById('distribute-h-btn');
const distributeVBtn = document.getElementById('distribute-v-btn');

// モーダル関連のDOM
const frameEditModal = document.getElementById('frame-edit-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const saveEditBtn = document.getElementById('save-edit-btn');
const frameEditCanvas = document.getElementById('frame-edit-canvas');

// === 操作履歴（Undo）の管理 ===
function saveStateToHistory() {
  const currentState = {
    frame: frame ? JSON.parse(JSON.stringify(frame)) : null,
    panels: JSON.parse(JSON.stringify(panels)),
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    selectedPanelIds: JSON.parse(JSON.stringify(selectedPanelIds)),
    canvasBgColor: canvasBgColor
  };
  actionHistory.push(currentState);
  if (actionHistory.length > 30) {
    actionHistory.shift(); // 最大30件
  }
}

function undoAction() {
  if (actionHistory.length === 0) return;
  const prevState = actionHistory.pop();
  
  frame = prevState.frame ? JSON.parse(JSON.stringify(prevState.frame)) : null;
  panels = JSON.parse(JSON.stringify(prevState.panels));
  canvasWidth = prevState.canvasWidth;
  canvasHeight = prevState.canvasHeight;
  selectedPanelIds = JSON.parse(JSON.stringify(prevState.selectedPanelIds));
  canvasBgColor = prevState.canvasBgColor || 'black';
  
  updateUI();
}
const toolFreeBtn = document.getElementById('tool-free');
const toolRectBtn = document.getElementById('tool-rect');
const toolCircleBtn = document.getElementById('tool-circle');
const applyTransparentBtn = document.getElementById('apply-transparent-btn');
const undoBtn = document.getElementById('undo-btn');
const resetEditBtn = document.getElementById('reset-edit-btn');

const canvasSizeSelect = document.getElementById('canvas-size-select');
const gridShowToggle = document.getElementById('grid-show-toggle');
const gridSnapToggle = document.getElementById('grid-snap-toggle');

// ズームコントロール関連のDOM
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomFitBtn = document.getElementById('zoom-fit-btn');

// === 画面の更新（描画）関数 ===
function updateUI() {
  // 1. キャンバスの再描画
  canvasArea.innerHTML = ''; // 一旦空にする

  let canvasBgClass = 'bg-black';
  if (canvasBgColor === 'transparent') canvasBgClass = 'checkerboard-bg';
  else if (canvasBgColor === 'white') canvasBgClass = 'bg-white';
  else if (canvasBgColor === 'gray') canvasBgClass = 'bg-gray-500';
  canvasArea.className = `relative rounded-lg shadow-2xl overflow-hidden border border-gray-700 origin-center shrink-0 ${canvasBgClass}`;

  canvasArea.style.width = `${canvasWidth}px`;
  canvasArea.style.height = `${canvasHeight}px`;

  const sizeDisplay = document.getElementById('size-display');
  if (sizeDisplay) {
    sizeDisplay.innerText = `${canvasWidth} x ${canvasHeight}`;
  }

  // フレームの描画
  if (frame) {
    const frameEl = document.createElement('div');
    const isSelected = selectedPanelIds.includes('frame');
    frameEl.className = `absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    frameEl.style.left = `${frame.x}px`;
    frameEl.style.top = `${frame.y}px`;
    frameEl.style.width = `${frame.width}px`;
    frameEl.style.height = `${frame.height}px`;
    frameEl.style.backgroundImage = `url(${frame.url})`;
    frameEl.style.backgroundSize = '100% 100%';
    frameEl.style.backgroundRepeat = 'no-repeat';
    frameEl.style.backgroundPosition = 'center';
    frameEl.style.zIndex = '10';
    frameEl.style.pointerEvents = 'auto';
    
    frameEl.addEventListener('mousedown', (e) => handleSpecialMouseDown(e, 'frame'));
    
    if (isSelected && selectedPanelIds.length === 1) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      frameEl.appendChild(resizeHandle);
    }
    canvasArea.appendChild(frameEl);
  }

  // グリッドの描画
  if (showGrid) {
    const grid = document.createElement('div');
    grid.className = 'absolute inset-0 grid-bg';
    grid.style.pointerEvents = 'none';
    grid.style.zIndex = '15';
    canvasArea.appendChild(grid);
  }

  // パネルの描画
  panels.forEach(panel => {
    if (panel.visible === false) return; // 非表示の場合はメインキャンバスに描画しない
    
    const pEl = document.createElement('div');
    const isSelected = selectedPanelIds.includes(panel.id);
    
    pEl.className = `absolute z-20 cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    pEl.style.left = `${panel.x}px`;
    pEl.style.top = `${panel.y}px`;
    pEl.style.width = `${panel.width}px`;
    pEl.style.height = `${panel.height}px`;
    pEl.style.opacity = panel.opacity !== undefined ? panel.opacity : 1;

    // 反転表示のためのインナー要素
    const imgEl = document.createElement('div');
    imgEl.className = 'w-full h-full';
    imgEl.style.backgroundImage = `url(${panel.url})`;
    imgEl.style.backgroundSize = '100% 100%'; // 枠に合わせて伸縮
    imgEl.style.backgroundRepeat = 'no-repeat';
    imgEl.style.backgroundPosition = 'center';
    
    // 反転の適用
    const flipH = panel.flipH ? -1 : 1;
    const flipV = panel.flipV ? -1 : 1;
    if (panel.flipH || panel.flipV) {
      imgEl.style.transform = `scale(${flipH}, ${flipV})`;
    }
    pEl.appendChild(imgEl);
    
    // パネルをマウスで押した時の処理
    pEl.addEventListener('mousedown', (e) => handlePanelMouseDown(e, panel.id));

    // 選択中かつ単一選択ならリサイズ用のツマミとクイックツールバーを表示
    if (isSelected && selectedPanelIds.length === 1) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm z-30';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      pEl.appendChild(resizeHandle);

      // クイックツールバー
      const toolbar = document.createElement('div');
      if (panel.y < 50) {
        toolbar.className = 'quick-toolbar absolute top-full mt-2 left-1/2 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 flex items-center gap-1.5 shadow-xl z-30 pointer-events-auto origin-top';
      } else {
        toolbar.className = 'quick-toolbar absolute -top-11 left-1/2 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 flex items-center gap-1.5 shadow-xl z-30 pointer-events-auto origin-bottom';
      }
      
      toolbar.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      
      const index = panels.findIndex(p => p.id === panel.id);

      // 最前面へ
      const toFrontBtn = document.createElement('button');
      toFrontBtn.className = `text-gray-300 hover:text-blue-400 ${index === panels.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`;
      toFrontBtn.innerHTML = '<i data-lucide="chevrons-up" class="w-4 h-4"></i>';
      toFrontBtn.title = '最前面へ';
      toFrontBtn.disabled = index === panels.length - 1;
      toFrontBtn.onclick = (e) => {
        e.stopPropagation();
        movePanelToExtremity(index, true);
      };
      toolbar.appendChild(toFrontBtn);

      // 前面へ
      const upBtn = document.createElement('button');
      upBtn.className = `text-gray-300 hover:text-blue-400 ${index === panels.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`;
      upBtn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i>';
      upBtn.title = '前面へ';
      upBtn.disabled = index === panels.length - 1;
      upBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index + 1);
      };
      toolbar.appendChild(upBtn);

      // 背面へ
      const downBtn = document.createElement('button');
      downBtn.className = `text-gray-300 hover:text-blue-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`;
      downBtn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i>';
      downBtn.title = '背面へ';
      downBtn.disabled = index === 0;
      downBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index - 1);
      };
      toolbar.appendChild(downBtn);

      // 最背面へ
      const toBackBtn = document.createElement('button');
      toBackBtn.className = `text-gray-300 hover:text-blue-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`;
      toBackBtn.innerHTML = '<i data-lucide="chevrons-down" class="w-4 h-4"></i>';
      toBackBtn.title = '最背面へ';
      toBackBtn.disabled = index === 0;
      toBackBtn.onclick = (e) => {
        e.stopPropagation();
        movePanelToExtremity(index, false);
      };
      toolbar.appendChild(toBackBtn);

      // 区切り線
      const divider = document.createElement('div');
      divider.className = 'w-px h-4 bg-gray-600 mx-1';
      toolbar.appendChild(divider);

      // 左右反転
      const flipHBtn = document.createElement('button');
      flipHBtn.className = `text-gray-300 hover:text-blue-400 ${panel.flipH ? 'text-blue-400 font-bold' : ''}`;
      flipHBtn.innerHTML = '<i data-lucide="flip-horizontal" class="w-4 h-4"></i>';
      flipHBtn.title = '左右反転';
      flipHBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panel.flipH = !panel.flipH;
        updateUI();
      };
      toolbar.appendChild(flipHBtn);

      // 上下反転
      const flipVBtn = document.createElement('button');
      flipVBtn.className = `text-gray-300 hover:text-blue-400 ${panel.flipV ? 'text-blue-400 font-bold' : ''}`;
      flipVBtn.innerHTML = '<i data-lucide="flip-vertical" class="w-4 h-4"></i>';
      flipVBtn.title = '上下反転';
      flipVBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panel.flipV = !panel.flipV;
        updateUI();
      };
      toolbar.appendChild(flipVBtn);

      // 画像を差し替え
      const replaceBtn = document.createElement('button');
      replaceBtn.className = 'text-gray-300 hover:text-blue-400';
      replaceBtn.innerHTML = '<i data-lucide="image" class="w-4 h-4"></i>';
      replaceBtn.title = '画像を差し替え';
      replaceBtn.onclick = (e) => {
        e.stopPropagation();
        replacePanelUpload.click();
      };
      toolbar.appendChild(replaceBtn);

      // 複製
      const copyBtn = document.createElement('button');
      copyBtn.className = 'text-gray-300 hover:text-blue-400';
      copyBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
      copyBtn.title = '複製';
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        duplicatePanel(panel);
      };
      toolbar.appendChild(copyBtn);

      // 非表示にする
      const hideBtn = document.createElement('button');
      hideBtn.className = 'text-gray-300 hover:text-blue-400';
      hideBtn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4"></i>';
      hideBtn.title = '非表示にする';
      hideBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panel.visible = false;
        selectedPanelIds = selectedPanelIds.filter(id => id !== panel.id);
        updateUI();
      };
      toolbar.appendChild(hideBtn);

      // 透過率スライダー
      const opacityContainer = document.createElement('div');
      opacityContainer.className = 'flex items-center gap-1.5 ml-1 mr-1 pointer-events-auto';
      opacityContainer.innerHTML = '<i data-lucide="droplet" class="w-3.5 h-3.5 text-gray-400"></i>';
      opacityContainer.addEventListener('mousedown', (e) => e.stopPropagation());
      opacityContainer.addEventListener('mousemove', (e) => e.stopPropagation());

      const opacityRange = document.createElement('input');
      opacityRange.type = 'range';
      opacityRange.min = '0';
      opacityRange.max = '1';
      opacityRange.step = '0.05';
      opacityRange.value = panel.opacity !== undefined ? panel.opacity : 1;
      opacityRange.className = 'w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500';
      opacityRange.title = `透過率: ${Math.round((panel.opacity !== undefined ? panel.opacity : 1) * 100)}%`;

      opacityRange.addEventListener('input', (e) => {
        panel.opacity = parseFloat(e.target.value);
        opacityRange.title = `透過率: ${Math.round(panel.opacity * 100)}%`;
        pEl.style.opacity = panel.opacity;
      });

      opacityRange.addEventListener('change', () => {
        saveStateToHistory();
        updateUI();
      });

      opacityContainer.appendChild(opacityRange);
      toolbar.appendChild(opacityContainer);

      // 削除
      const delBtn = document.createElement('button');
      delBtn.className = 'text-gray-300 hover:text-red-400';
      delBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      delBtn.title = '削除';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panels = panels.filter(p => p.id !== panel.id);
        selectedPanelIds = selectedPanelIds.filter(id => id !== panel.id);
        updateUI();
      };
      toolbar.appendChild(delBtn);

      pEl.appendChild(toolbar);
    }
    
    canvasArea.appendChild(pEl);
  });

  // ガイドテキストの表示
  if (!frame && panels.length === 0) {
    const guide = document.createElement('div');
    guide.className = 'absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none';
    guide.innerHTML = '<p>左のメニューから画像をアップロードしてください</p>';
    canvasArea.appendChild(guide);
  }

  // 2. パネルリストの再描画
  panelCount.innerText = panels.length;
  panelList.innerHTML = '';
  if (panels.length === 0) {
    panelList.innerHTML = '<p class="text-xs text-gray-500">パネルはありません</p>';
  } else {
    const panelsReversed = [...panels].reverse();
    panelsReversed.forEach((panel, revIndex) => {
      const index = panels.length - 1 - revIndex;
      const li = document.createElement('li');
      const isSelected = selectedPanelIds.includes(panel.id);
      li.className = `flex items-center justify-between p-2 rounded bg-gray-800 border cursor-pointer ${isSelected ? 'border-blue-500' : 'border-gray-600'}`;
      li.onclick = (e) => {
        if (e.shiftKey || e.ctrlKey) {
          if (selectedPanelIds.includes(panel.id)) {
            selectedPanelIds = selectedPanelIds.filter(id => id !== panel.id);
          } else {
            selectedPanelIds.push(panel.id);
            selectedPanelIds = selectedPanelIds.filter(id => id !== 'frame');
          }
        } else {
          selectedPanelIds = [panel.id];
        }
        updateUI();
      };

      const span = document.createElement('span');
      span.className = 'text-sm truncate flex-grow';
      span.innerText = `パネル ${index + 1}`;
      li.appendChild(span);

      const btnContainer = document.createElement('div');
      btnContainer.className = 'flex items-center gap-1.5';

      // 上へ移動
      const upBtn = document.createElement('button');
      upBtn.className = `text-gray-400 hover:text-blue-400 ${index === panels.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`;
      upBtn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i>';
      upBtn.disabled = index === panels.length - 1;
      upBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index + 1);
      };
      btnContainer.appendChild(upBtn);

      // 下へ移動
      const downBtn = document.createElement('button');
      downBtn.className = `text-gray-400 hover:text-blue-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`;
      downBtn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i>';
      downBtn.disabled = index === 0;
      downBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index - 1);
      };
      btnContainer.appendChild(downBtn);

      // 表示/非表示の切り替え
      const toggleVisibleBtn = document.createElement('button');
      toggleVisibleBtn.className = 'text-gray-400 hover:text-blue-400';
      const isVisible = panel.visible !== false;
      toggleVisibleBtn.innerHTML = `<i data-lucide="${isVisible ? 'eye' : 'eye-off'}" class="w-4 h-4"></i>`;
      toggleVisibleBtn.title = isVisible ? '非表示にする' : '表示する';
      toggleVisibleBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panel.visible = isVisible ? false : true;
        if (!panel.visible) {
          selectedPanelIds = selectedPanelIds.filter(id => id !== panel.id);
        }
        updateUI();
      };
      btnContainer.appendChild(toggleVisibleBtn);

      // 複製
      const copyBtn = document.createElement('button');
      copyBtn.className = 'text-gray-400 hover:text-blue-400';
      copyBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
      copyBtn.onclick = (e) => {
        e.stopPropagation();
        duplicatePanel(panel);
      };
      btnContainer.appendChild(copyBtn);

      // 削除
      const trashBtn = document.createElement('button');
      trashBtn.className = 'text-gray-400 hover:text-red-400';
      trashBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      trashBtn.onclick = (e) => {
        e.stopPropagation();
        saveStateToHistory();
        panels = panels.filter(p => p.id !== panel.id);
        selectedPanelIds = selectedPanelIds.filter(id => id !== panel.id);
        updateUI();
      };
      btnContainer.appendChild(trashBtn);

      li.appendChild(btnContainer);
      panelList.appendChild(li);
    });
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // 3. クリアボタンの表示/非表示
  clearFrameBtn.style.display = frame ? 'block' : 'none';
  editFrameBtn.style.display = frame ? 'block' : 'none';

  // 3.3 整列・配置ボタンの有効化/無効化制御
  const selectedPanelCount = selectedPanelIds.filter(id => id !== 'frame').length;
  const hasMultiple = selectedPanelCount >= 2;
  const hasThreeOrMore = selectedPanelCount >= 3;
  if (alignTopBtn) alignTopBtn.disabled = !hasMultiple;
  if (alignCenterBtn) alignCenterBtn.disabled = !hasMultiple;
  if (alignBottomBtn) alignBottomBtn.disabled = !hasMultiple;
  if (alignLeftBtn) alignLeftBtn.disabled = !hasMultiple;
  if (alignCenterHBtn) alignCenterHBtn.disabled = !hasMultiple;
  if (alignRightBtn) alignRightBtn.disabled = !hasMultiple;
  if (distributeHBtn) distributeHBtn.disabled = !hasThreeOrMore;
  if (distributeVBtn) distributeVBtn.disabled = !hasThreeOrMore;

  // 3.5 操作履歴「一つ戻る」ボタンの制御
  if (undoActionBtn) {
    undoActionBtn.disabled = actionHistory.length === 0;
  }

  // キャンバス背景色ボタンのリング表示制御
  const canvasBgColors = ['trans', 'white', 'gray', 'black'];
  const targetMap = { 'trans': 'transparent', 'white': 'white', 'gray': 'gray', 'black': 'black' };
  canvasBgColors.forEach(c => {
    const btn = document.getElementById(`canvas-bg-${c}`);
    if (btn) {
      if (targetMap[c] === canvasBgColor) {
        btn.classList.add('ring-2', 'ring-blue-500');
        if (c === 'black') btn.classList.remove('ring-1');
      } else {
        btn.classList.remove('ring-2', 'ring-blue-500');
        if (c === 'black') btn.classList.add('ring-1', 'ring-blue-500');
      }
    }
  });

  // 4. 表示スケールの調整
  updateCanvasScale();
}

// === 画像の読み込み処理 ===
function handleFileUpload(event, type) {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  saveStateToHistory();

  if (type === 'frame') {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;
        const originalRatio = originalWidth / originalHeight;
        
        const scaleX = canvasWidth / originalWidth;
        const scaleY = canvasHeight / originalHeight;
        const scale = Math.min(1, scaleX, scaleY);
        const initWidth = originalWidth * scale;
        const initHeight = originalHeight * scale;
        
        frame = {
          url: imageUrl,
          x: (canvasWidth - initWidth) / 2,
          y: (canvasHeight - initHeight) / 2,
          width: initWidth,
          height: initHeight,
          originalRatio: originalRatio
        };
        selectedPanelIds = ['frame'];
        updateUI();
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  } else if (type === 'panel') {
    const newPanelIds = [];
    
    const loadFile = (file, index) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          const img = new Image();
          img.onload = () => {
            const originalWidth = img.naturalWidth;
            const originalHeight = img.naturalHeight;
            const originalRatio = originalWidth / originalHeight;
            
            const scale = Math.min(1, 200 / originalWidth, 200 / originalHeight);
            const initWidth = originalWidth * scale;
            const initHeight = originalHeight * scale;
            
            const offset = index * 24;
            const baseX = (canvasWidth - initWidth) / 2 + offset;
            const baseY = (canvasHeight - initHeight) / 2 + offset;
            
            const newPanel = {
              id: Date.now().toString() + '-' + index + '-' + Math.random().toString(36).substr(2, 5),
              url: imageUrl,
              x: baseX,
              y: baseY,
              width: initWidth,
              height: initHeight,
              originalRatio: originalRatio,
              flipH: false,
              flipV: false,
              visible: true,
              opacity: 1
            };
            resolve(newPanel);
          };
          img.src = imageUrl;
        };
        reader.readAsDataURL(file);
      });
    };

    Promise.all(files.map((file, idx) => loadFile(file, idx))).then((newPanels) => {
      newPanels.forEach(panel => {
        panels.push(panel);
        newPanelIds.push(panel.id);
      });
      selectedPanelIds = newPanelIds;
      updateUI();
    });
  }

  event.target.value = '';
}

// イベントリスナーの登録
document.getElementById('frame-upload').addEventListener('change', (e) => handleFileUpload(e, 'frame'));
document.getElementById('panel-upload').addEventListener('change', (e) => handleFileUpload(e, 'panel'));

clearFrameBtn.addEventListener('click', () => { 
  saveStateToHistory();
  frame = null; 
  selectedPanelIds = selectedPanelIds.filter(id => id !== 'frame');
  updateUI(); 
});

// === ドラッグ＆ドロップ、リサイズの処理 ===
function handleSpecialMouseDown(e, type) {
  e.stopPropagation();
  saveStateToHistory();
  
  selectedPanelIds = ['frame'];
  const target = frame;
  
  const rect = canvasArea.getBoundingClientRect();
  const scale = rect.width / canvasWidth;

  if (e.target.classList.contains('resize-handle')) {
    isResizing = true;
  } else {
    isDragging = true;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    dragOffset.x = mouseX - target.x;
    dragOffset.y = mouseY - target.y;
    dragStartPositions = [{ id: 'frame', x: target.x, y: target.y }];
  }
  
  updateUI();
}

function handlePanelMouseDown(e, panelId) {
  e.stopPropagation();
  saveStateToHistory();
  
  // パネルを最前面（配列の末尾）に移動
  const panelIndex = panels.findIndex(p => p.id === panelId);
  if (panelIndex > -1) {
    const clickedPanel = panels[panelIndex];
    panels.splice(panelIndex, 1);
    panels.push(clickedPanel);
  }
  
  const rect = canvasArea.getBoundingClientRect();
  const scale = rect.width / canvasWidth;

  const isResizeHandle = e.target.classList.contains('resize-handle');
  
  if (e.shiftKey || e.ctrlKey) {
    if (selectedPanelIds.includes(panelId)) {
      selectedPanelIds = selectedPanelIds.filter(id => id !== panelId);
    } else {
      selectedPanelIds.push(panelId);
      selectedPanelIds = selectedPanelIds.filter(id => id !== 'frame');
    }
  } else {
    if (!selectedPanelIds.includes(panelId)) {
      selectedPanelIds = [panelId];
    }
  }

  const basePanel = panels.find(p => p.id === panelId);

  if (isResizeHandle && selectedPanelIds.length === 1) {
    isResizing = true;
  } else {
    isDragging = true;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    dragOffset.x = mouseX - basePanel.x;
    dragOffset.y = mouseY - basePanel.y;

    dragStartPositions = selectedPanelIds.map(id => {
      if (id === 'frame') {
        return { id: 'frame', x: frame.x, y: frame.y };
      } else {
        const p = panels.find(panel => panel.id === id);
        return p ? { id: p.id, x: p.x, y: p.y } : null;
      }
    }).filter(Boolean);
  }
  
  updateUI();
}

window.addEventListener('mousemove', (e) => {
  if (!isDragging && !isResizing) return;
  if (selectedPanelIds.length === 0) return;

  const rect = canvasArea.getBoundingClientRect();
  const scale = rect.width / canvasWidth;
  
  const mouseX = (e.clientX - rect.left) / scale;
  const mouseY = (e.clientY - rect.top) / scale;

  if (isDragging) {
    const baseId = selectedPanelIds[0];
    const baseStart = dragStartPositions.find(p => p.id === baseId);
    if (!baseStart) return;

    let targetX = mouseX - dragOffset.x;
    let targetY = mouseY - dragOffset.y;
    if (snapToGrid) {
      targetX = Math.round(targetX / 24) * 24;
      targetY = Math.round(targetY / 24) * 24;
    }

    const deltaX = targetX - baseStart.x;
    const deltaY = targetY - baseStart.y;

    dragStartPositions.forEach(start => {
      let finalX = start.x + deltaX;
      let finalY = start.y + deltaY;
      
      if (start.id === 'frame') {
        if (frame) {
          frame.x = finalX;
          frame.y = finalY;
        }
      } else {
        const p = panels.find(panel => panel.id === start.id);
        if (p) {
          p.x = finalX;
          p.y = finalY;
        }
      }
    });

  } else if (isResizing) {
    const targetId = selectedPanelIds[0];
    let target = null;
    if (targetId === 'frame') {
      target = frame;
    } else {
      target = panels.find(p => p.id === targetId);
    }
    if (!target) return;

    let newWidth = mouseX - target.x;
    let newHeight = mouseY - target.y;

    if (e.shiftKey && target.originalRatio) {
      newHeight = newWidth / target.originalRatio;
    }

    if (snapToGrid) {
      newWidth = Math.round(newWidth / 24) * 24;
      newHeight = Math.round(newHeight / 24) * 24;
      if (e.shiftKey && target.originalRatio) {
        newHeight = newWidth / target.originalRatio;
      }
    }
    target.width = Math.max(24, newWidth);
    target.height = Math.max(24, newHeight);
  }
  updateUI();
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
  dragStartPositions = [];
});

canvasArea.addEventListener('mousedown', (e) => {
  if (selectedPanelIds.length > 0) {
    saveStateToHistory();
  }
  selectedPanelIds = [];
  updateUI();
});

// === スケール更新関数 ===
function updateCanvasScale() {
  const wrapper = document.getElementById('canvas-wrapper');
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  
  if (rect.width <= 32 || rect.height <= 32) {
    canvasArea.style.transform = 'scale(1)';
    const scaleDisplay = document.getElementById('scale-display');
    if (scaleDisplay) {
      scaleDisplay.innerText = '100%';
    }
    return;
  }

  let scale = 1.0;
  
  if (zoomScale === null) {
    const pad = 32;
    const maxW = rect.width - pad;
    const maxH = rect.height - pad;
    const scaleX = maxW / canvasWidth;
    const scaleY = maxH / canvasHeight;
    scale = Math.max(0.05, Math.min(1, scaleX, scaleY));
  } else {
    scale = zoomScale;
  }
  
  canvasArea.style.transform = `scale(${scale})`;
  if (typeof canvasArea.style.setProperty === 'function') {
    canvasArea.style.setProperty('--canvas-scale', scale);
  }
  
  const scaleDisplay = document.getElementById('scale-display');
  if (scaleDisplay) {
    scaleDisplay.innerText = zoomScale === null
      ? `${Math.round(scale * 100)}% (フィット)`
      : `${Math.round(scale * 100)}%`;
  }
}

window.addEventListener('resize', updateCanvasScale);

canvasSizeSelect.addEventListener('change', (e) => {
  saveStateToHistory();
  const value = e.target.value;
  if (value === '1280x720') {
    canvasWidth = 1280;
    canvasHeight = 720;
  } else if (value === '1920x1080') {
    canvasWidth = 1920;
    canvasHeight = 1080;
  }
  updateUI();
});

// グリッドは常に表示するためイベントリスナーは不要

gridSnapToggle.addEventListener('change', (e) => {
  snapToGrid = e.target.checked;
  updateUI();
});

gridShowToggle.checked = showGrid;
gridSnapToggle.checked = snapToGrid;
canvasSizeSelect.value = `${canvasWidth}x${canvasHeight}`;

function movePanel(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= panels.length) return;
  saveStateToHistory();
  const element = panels[fromIndex];
  panels.splice(fromIndex, 1);
  panels.splice(toIndex, 0, element);
  updateUI();
}

function duplicatePanel(panel) {
  saveStateToHistory();
  const offset = snapToGrid ? 24 : 20;
  const newPanel = {
    ...panel,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    x: panel.x + offset,
    y: panel.y + offset,
    flipH: panel.flipH || false,
    flipV: panel.flipV || false
  };
  panels.push(newPanel);
  selectedPanelIds = [newPanel.id];
  updateUI();
}

function movePanelToExtremity(index, toFront) {
  if (index < 0 || index >= panels.length) return;
  const element = panels[index];
  panels.splice(index, 1);
  if (toFront) {
    panels.push(element);
  } else {
    panels.unshift(element);
  }
  updateUI();
}

window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    const copyTargets = selectedPanelIds.filter(id => id !== 'frame')
      .map(id => panels.find(p => p.id === id))
      .filter(Boolean);
    if (copyTargets.length > 0) {
      copiedPanelData = copyTargets.map(p => JSON.parse(JSON.stringify(p)));
      e.preventDefault();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (copiedPanelData && copiedPanelData.length > 0) {
      saveStateToHistory();
      const offset = snapToGrid ? 24 : 20;
      const newPanelIds = [];
      copiedPanelData.forEach(pData => {
        const newPanel = {
          ...pData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          x: pData.x + offset,
          y: pData.y + offset
        };
        panels.push(newPanel);
        newPanelIds.push(newPanel.id);
      });
      selectedPanelIds = newPanelIds;
      updateUI();
      e.preventDefault();
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    undoAction();
    e.preventDefault();
  }

  if (e.key === 'Delete' || e.key === 'Backspace') {
    const deleteTargets = selectedPanelIds.filter(id => id !== 'frame');
    if (deleteTargets.length > 0) {
      saveStateToHistory();
      panels = panels.filter(p => !deleteTargets.includes(p.id));
      selectedPanelIds = [];
      updateUI();
      e.preventDefault();
    }
  }
});



// === フレーム画像編集モーダルの処理関数 ===
function openFrameEditModal() {
  if (!frame) return;
  
  editOriginalUrl = frame.url;
  editHistory = [];
  undoBtn.disabled = true;
  setTool('free');
  
  frameEditModal.classList.remove('hidden');
  
  editImage = new Image();
  editImage.onload = () => {
    frameEditCanvas.width = editImage.naturalWidth;
    frameEditCanvas.height = editImage.naturalHeight;
    const ctx = frameEditCanvas.getContext('2d');
    ctx.clearRect(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    ctx.drawImage(editImage, 0, 0);
    
    saveHistoryState();
  };
  editImage.src = frame.url;
}

function closeModalBtnHandler() {
  frameEditModal.classList.add('hidden');
  editImage = null;
}

closeModalBtn.addEventListener('click', closeModalBtnHandler);
cancelEditBtn.addEventListener('click', closeModalBtnHandler);
saveEditBtn.addEventListener('click', saveFrameEdit);

// 選択ツールの操作
function saveHistoryState() {
  const ctx = frameEditCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, frameEditCanvas.width, frameEditCanvas.height);
  editHistory.push(imgData);
  
  undoBtn.disabled = editHistory.length <= 1;
}

function undoEdit() {
  if (editHistory.length <= 1) return;
  editHistory.pop();
  const prevState = editHistory[editHistory.length - 1];
  const ctx = frameEditCanvas.getContext('2d');
  ctx.putImageData(prevState, 0, 0);
  undoBtn.disabled = editHistory.length <= 1;
  clearSelection();
}

function resetEdit() {
  if (!editOriginalUrl) return;
  const img = new Image();
  img.onload = () => {
    const ctx = frameEditCanvas.getContext('2d');
    ctx.clearRect(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    editHistory = [imgData];
    undoBtn.disabled = true;
    clearSelection();
  };
  img.src = editOriginalUrl;
}

function setTool(tool) {
  activeTool = tool;
  
  const tools = {
    free: toolFreeBtn,
    rect: toolRectBtn,
    circle: toolCircleBtn
  };
  
  Object.keys(tools).forEach(key => {
    const btn = tools[key];
    if (key === tool) {
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600', 'hover:text-white');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-gray-600', 'hover:text-white');
    }
  });
  
  clearSelection();
}

function getCanvasMouseCoords(e) {
  const rect = frameEditCanvas.getBoundingClientRect();
  const scaleX = frameEditCanvas.width / rect.width;
  const scaleY = frameEditCanvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  return { x, y };
}

function startSelection(e) {
  isDrawingSelection = true;
  const coords = getCanvasMouseCoords(e);
  startPoint = coords;
  currentPoint = coords;
  freePoints = [coords];
  redrawCanvasWithSelection();
}

function drawSelection(e) {
  if (!isDrawingSelection) return;
  const coords = getCanvasMouseCoords(e);
  currentPoint = coords;
  
  if (activeTool === 'free') {
    freePoints.push(coords);
  }
  redrawCanvasWithSelection();
}

function endSelection() {
  if (!isDrawingSelection) return;
  isDrawingSelection = false;
  redrawCanvasWithSelection();
}

function clearSelection() {
  isDrawingSelection = false;
  startPoint = { x: 0, y: 0 };
  currentPoint = { x: 0, y: 0 };
  freePoints = [];
  
  if (editHistory.length > 0) {
    const ctx = frameEditCanvas.getContext('2d');
    ctx.putImageData(editHistory[editHistory.length - 1], 0, 0);
  }
}

function redrawCanvasWithSelection() {
  if (editHistory.length === 0) return;
  
  const ctx = frameEditCanvas.getContext('2d');
  ctx.putImageData(editHistory[editHistory.length - 1], 0, 0);
  if (freePoints.length === 0) return;
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = Math.max(2, frameEditCanvas.width / 400);
  ctx.setLineDash([6, 4]);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  
  ctx.beginPath();
  
  if (activeTool === 'free') {
    ctx.moveTo(freePoints[0].x, freePoints[0].y);
    for (let i = 1; i < freePoints.length; i++) {
      ctx.lineTo(freePoints[i].x, freePoints[i].y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  } else if (activeTool === 'rect') {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const w = Math.abs(startPoint.x - currentPoint.x);
    const h = Math.abs(startPoint.y - currentPoint.y);
    
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.fill();
  } else if (activeTool === 'circle') {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const w = Math.abs(startPoint.x - currentPoint.x);
    const h = Math.abs(startPoint.y - currentPoint.y);
    
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
  }
  ctx.setLineDash([]);
}

function applyTransparency() {
  if (editHistory.length === 0) return;
  if (freePoints.length === 0) return;
  
  const ctx = frameEditCanvas.getContext('2d');
  ctx.putImageData(editHistory[editHistory.length - 1], 0, 0);
  
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'black';
  ctx.beginPath();
  
  if (activeTool === 'free') {
    ctx.moveTo(freePoints[0].x, freePoints[0].y);
    for (let i = 1; i < freePoints.length; i++) {
      ctx.lineTo(freePoints[i].x, freePoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (activeTool === 'rect') {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const w = Math.abs(startPoint.x - currentPoint.x);
    const h = Math.abs(startPoint.y - currentPoint.y);
    ctx.fillRect(x, y, w, h);
  } else if (activeTool === 'circle') {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const w = Math.abs(startPoint.x - currentPoint.x);
    const h = Math.abs(startPoint.y - currentPoint.y);
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalCompositeOperation = 'source-over';
  saveHistoryState();
  clearSelection();
}

function saveFrameEdit() {
  if (editHistory.length === 0) return;
  saveStateToHistory();
  const dataURL = frameEditCanvas.toDataURL('image/png');
  frame.url = dataURL;
  closeFrameEditModal();
  updateUI();
}

editFrameBtn.addEventListener('click', openFrameEditModal);
closeModalBtn.addEventListener('click', closeModalBtnHandler);
cancelEditBtn.addEventListener('click', closeModalBtnHandler);
saveEditBtn.addEventListener('click', saveFrameEdit);

toolFreeBtn.addEventListener('click', () => setTool('free'));
toolRectBtn.addEventListener('click', () => setTool('rect'));
toolCircleBtn.addEventListener('click', () => setTool('circle'));

applyTransparentBtn.addEventListener('click', applyTransparency);
undoBtn.addEventListener('click', undoEdit);
resetEditBtn.addEventListener('click', resetEdit);

frameEditCanvas.addEventListener('mousedown', startSelection);
frameEditCanvas.addEventListener('mousemove', drawSelection);
window.addEventListener('mouseup', endSelection);

replacePanelUpload.addEventListener('change', handleReplacePanelUpload);
if (undoActionBtn) {
  undoActionBtn.addEventListener('click', undoAction);
}

if (zoomInBtn && zoomOutBtn && zoomFitBtn) {
  zoomInBtn.addEventListener('click', () => adjustZoom(0.1));
  zoomOutBtn.addEventListener('click', () => adjustZoom(-0.1));
  zoomFitBtn.addEventListener('click', () => {
    zoomScale = null;
    updateUI();
  });
}

function adjustZoom(delta) {
  let currentScale = 1.0;
  if (zoomScale !== null) {
    currentScale = zoomScale;
  } else {
    const wrapper = document.getElementById('canvas-wrapper');
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const pad = 32;
      const maxW = rect.width - pad;
      const maxH = rect.height - pad;
      const scaleX = maxW / canvasWidth;
      const scaleY = maxH / canvasHeight;
      currentScale = Math.max(0.05, Math.min(1, scaleX, scaleY));
    }
  }
  zoomScale = Math.max(0.1, Math.min(2.0, Math.round((currentScale + delta) * 10) / 10));
  updateUI();
}

function handleReplacePanelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (selectedPanelIds.length !== 1) return;

  const panel = panels.find(p => p.id === selectedPanelIds[0]);
  if (!panel) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      saveStateToHistory();
      panel.url = imageUrl;
      panel.originalRatio = img.naturalWidth / img.naturalHeight;
      updateUI();
    };
    img.src = imageUrl;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function alignPanels(type) {
  const targetIds = selectedPanelIds.filter(id => id !== 'frame');
  const targetPanels = panels.filter(p => targetIds.includes(p.id));
  if (targetPanels.length < 2) return;

  saveStateToHistory();

  if (type === 'top') {
    const minY = Math.min(...targetPanels.map(p => p.y));
    targetPanels.forEach(p => {
      p.y = minY;
    });
  } else if (type === 'bottom') {
    const maxY = Math.max(...targetPanels.map(p => p.y + p.height));
    targetPanels.forEach(p => {
      p.y = maxY - p.height;
    });
  } else if (type === 'center') {
    const minY = Math.min(...targetPanels.map(p => p.y));
    const maxY = Math.max(...targetPanels.map(p => p.y + p.height));
    const centerY = (minY + maxY) / 2;
    targetPanels.forEach(p => {
      p.y = centerY - p.height / 2;
    });
  } else if (type === 'left') {
    const minX = Math.min(...targetPanels.map(p => p.x));
    targetPanels.forEach(p => {
      p.x = minX;
    });
  } else if (type === 'right') {
    const maxX = Math.max(...targetPanels.map(p => p.x + p.width));
    targetPanels.forEach(p => {
      p.x = maxX - p.width;
    });
  } else if (type === 'center-h') {
    const minX = Math.min(...targetPanels.map(p => p.x));
    const maxX = Math.max(...targetPanels.map(p => p.x + p.width));
    const centerX = (minX + maxX) / 2;
    targetPanels.forEach(p => {
      p.x = centerX - p.width / 2;
    });
  } else if (type === 'distribute-h') {
    if (targetPanels.length < 3) return;
    const sorted = [...targetPanels].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
    const totalWidth = sorted.reduce((sum, p) => sum + p.width, 0);
    const totalGap = (maxX - minX) - totalWidth;
    const gap = totalGap / (sorted.length - 1);

    let currentX = minX;
    sorted.forEach((p, idx) => {
      p.x = currentX;
      currentX += p.width + gap;
    });
  } else if (type === 'distribute-v') {
    if (targetPanels.length < 3) return;
    const sorted = [...targetPanels].sort((a, b) => a.y - b.y);
    const minY = sorted[0].y;
    const maxY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
    const totalHeight = sorted.reduce((sum, p) => sum + p.height, 0);
    const totalGap = (maxY - minY) - totalHeight;
    const gap = totalGap / (sorted.length - 1);

    let currentY = minY;
    sorted.forEach((p, idx) => {
      p.y = currentY;
      currentY += p.height + gap;
    });
  }
  updateUI();
}

function setPreviewBg(color) {
  previewBgColor = color;
  if (!previewArea) return;

  previewArea.classList.remove('bg-blue-950', 'bg-white', 'bg-gray-500', 'bg-black');
  
  let bgClass = 'bg-blue-950';
  if (color === 'white') bgClass = 'bg-white';
  else if (color === 'gray') bgClass = 'bg-gray-500';
  else if (color === 'black') bgClass = 'bg-black';

  previewArea.classList.add(bgClass);

  const colors = ['white', 'gray', 'black', 'blue'];
  colors.forEach(c => {
    const btn = document.getElementById(`bg-color-${c}`);
    if (btn) {
      if (c === color) {
        btn.classList.add('ring-2', 'ring-blue-500');
        btn.classList.remove('ring-1', 'ring-blue-500');
      } else {
        btn.classList.remove('ring-2', 'ring-blue-500');
        if (c === 'blue') {
          btn.classList.add('ring-1', 'ring-blue-500');
        }
      }
    }
  });
}

if (alignTopBtn) alignTopBtn.addEventListener('click', () => alignPanels('top'));
if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => alignPanels('center'));
if (alignBottomBtn) alignBottomBtn.addEventListener('click', () => alignPanels('bottom'));
if (alignLeftBtn) alignLeftBtn.addEventListener('click', () => alignPanels('left'));
if (alignCenterHBtn) alignCenterHBtn.addEventListener('click', () => alignPanels('center-h'));
if (alignRightBtn) alignRightBtn.addEventListener('click', () => alignPanels('right'));
if (distributeHBtn) distributeHBtn.addEventListener('click', () => alignPanels('distribute-h'));
if (distributeVBtn) distributeVBtn.addEventListener('click', () => alignPanels('distribute-v'));

bgColors.forEach(color => {
  const btn = document.getElementById(`bg-color-${color}`);
  if (btn) {
    btn.addEventListener('click', () => setPreviewBg(color));
  }
});

function setCanvasBg(color) {
  saveStateToHistory();
  canvasBgColor = color;
  updateUI();
}

canvasBgColorsList.forEach(c => {
  const btn = document.getElementById(`canvas-bg-${c}`);
  if (btn) {
    btn.addEventListener('click', () => setCanvasBg(canvasTargetMap[c]));
  }
});

canvasBgColor = 'black';
setPreviewBg('blue');
updateUI();

