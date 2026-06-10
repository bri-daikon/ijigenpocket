// アイコンの初期?
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// === 状態管??データ?? ===
let frame = null; // { url: url, x: 0, y: 0, width: 1280, height: 720 }
let panels = [];
let selectedPanelIds = []; // 'frame', また?パネルのidの配??
let copiedPanelData = []; // コピ?されたパネル?ータの配??
let zoomScale = null; // null は自動フィ?ト、数値は固定倍率
let actionHistory = []; // 操作履歴スタ?ク
const bgColors = ['white', 'gray', 'black', 'blue'];
const canvasBgColorsList = ['trans', 'white', 'gray', 'black'];
const canvasTargetMap = { 'trans': 'transparent', 'white': 'white', 'gray': 'gray', 'black': 'black' };
let previewBgColor = 'blue'; // 'white', 'gray', 'black', 'blue' (Undo対象?)
let canvasBgColor = 'black'; // 'transparent', 'white', 'gray', 'black' (Undo対象)

// === フレーム画像編?モーダル用の状態変数 ===
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
let dragStartPositions = []; // ?数移動用?{ id, x, y } の配??

let canvasWidth = 1280;
let canvasHeight = 720;
let showGrid = false;
let snapToGrid = false;

// === DOM要素の取? ===
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

// === 操作履歴??Undo??管? ===
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

// === 画面の更新?描画?関数 ===
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

  // グリ?ド?描画
  if (showGrid) {
    const grid = document.createElement('div');
    grid.className = 'absolute inset-0 grid-bg';
    grid.style.pointerEvents = 'none';
    grid.style.zIndex = '15';
    canvasArea.appendChild(grid);
  }

  // パネルの描画
  panels.forEach(panel => {
    if (panel.visible === false) return; // 非表示の場合?メインキャンバスに描画しな?
    
    const pEl = document.createElement('div');
    const isSelected = selectedPanelIds.includes(panel.id);
    
    pEl.className = `absolute z-20 cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    pEl.style.left = `${panel.x}px`;
    pEl.style.top = `${panel.y}px`;
    pEl.style.width = `${panel.width}px`;
    pEl.style.height = `${panel.height}px`;
    pEl.style.opacity = panel.opacity !== undefined ? panel.opacity : 1;

    // 反転表示のためのインナ?要素
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
    
    // パネルを?ウスで押した時?処?
    pEl.addEventListener('mousedown', (e) => handlePanelMouseDown(e, panel.id));

    // 選択中かつ単一選択ならリサイズ用の?マミとクイ?ク?ールバ?を表示
    if (isSelected && selectedPanelIds.length === 1) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm z-30';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      pEl.appendChild(resizeHandle);

      // クイ?ク?ールバ?
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

      // 区?り?
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

      // 画像を差し替?
      const replaceBtn = document.createElement('button');
      replaceBtn.className = 'text-gray-300 hover:text-blue-400';
      replaceBtn.innerHTML = '<i data-lucide="image" class="w-4 h-4"></i>';
      replaceBtn.title = '画像を差し替?';
      replaceBtn.onclick = (e) => {
        e.stopPropagation();
        replacePanelUpload.click();
      };
      toolbar.appendChild(replaceBtn);

      // ?製
      const copyBtn = document.createElement('button');
      copyBtn.className = 'text-gray-300 hover:text-blue-400';
      copyBtn.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i>';
      copyBtn.title = '?製';
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

      // 透過?スライダー
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
      opacityRange.title = `透過?: ${Math.round((panel.opacity !== undefined ? panel.opacity : 1) * 100)}%`;

      opacityRange.addEventListener('input', (e) => {
        panel.opacity = parseFloat(e.target.value);
        opacityRange.title = `透過?: ${Math.round(panel.opacity * 100)}%`;
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

  // ガイドテキスト?表示
  if (!frame && panels.length === 0) {
    const guide = document.createElement('div');
    guide.className = 'absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none';
    guide.innerHTML = '<p>左のメニューから画像をア?プロードしてください</p>';
    canvasArea.appendChild(guide);
  }

  // 2. パネルリスト?再描画
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

      // 上へ移?
      const upBtn = document.createElement('button');
      upBtn.className = `text-gray-400 hover:text-blue-400 ${index === panels.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`;
      upBtn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i>';
      upBtn.disabled = index === panels.length - 1;
      upBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index + 1);
      };
      btnContainer.appendChild(upBtn);

      // 下へ移?
      const downBtn = document.createElement('button');
      downBtn.className = `text-gray-400 hover:text-blue-400 ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`;
      downBtn.innerHTML = '<i data-lucide="chevron-down" class="w-4 h-4"></i>';
      downBtn.disabled = index === 0;
      downBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index - 1);
      };
      btnContainer.appendChild(downBtn);

      // 表示/非表示の?り替?
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

      // ?製
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

  // 3.3 整列?配置ボタンの有効?/無効化制御
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

  // 3.5 操作履歴「一つ戻る」?タンの制御
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

// === 画像?読み込み処? ===
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

// イベントリスナ?の登録
document.getElementById('frame-upload').addEventListener('change', (e) => handleFileUpload(e, 'frame'));
document.getElementById('panel-upload').addEventListener('change', (e) => handleFileUpload(e, 'panel'));

clearFrameBtn.addEventListener('click', () => { 
  saveStateToHistory();
  frame = null; 
  selectedPanelIds = selectedPanelIds.filter(id => id !== 'frame');
  updateUI(); 
});

// === ドラ?グ??ドロ?プ、リサイズの処? ===
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
  
  // パネルを最前面????末尾?に移?
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
      ? `${Math.round(scale * 100)}% (フィ??)`
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
  } else if (value === '720x1280') {
    canvasWidth = 720;
    canvasHeight = 1280;
  } else if (value === '1080x1920') {
    canvasWidth = 1080;
    canvasHeight = 1920;
  }
  updateUI();
});

gridShowToggle.addEventListener('change', (e) => {
  showGrid = e.target.checked;
  updateUI();
});

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

async function exportToPNG() {
  const exportBtn = document.getElementById('export-btn');
  if (!exportBtn) return;
  
  const originalText = exportBtn.innerHTML;
  exportBtn.disabled = true;
  exportBtn.innerHTML = '<i data-lucide="loader" class="animate-spin mr-2 w-4 h-4"></i>出力中...';
  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    const drawTasks = [];

    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('画像?ロードに失敗しました'));
        img.src = url;
      });
    };

    if (frame) {
      drawTasks.push(loadImage(frame.url).then(img => {
        return { img, x: frame.x, y: frame.y, w: frame.width, h: frame.height };
      }));
    }

    panels.forEach(panel => {
      if (panel.visible === false) return;
      
      drawTasks.push(loadImage(panel.url).then(img => {
        return { 
          img, 
          x: panel.x, 
          y: panel.y, 
          w: panel.width, 
          h: panel.height,
          flipH: panel.flipH || false,
          flipV: panel.flipV || false,
          opacity: panel.opacity !== undefined ? panel.opacity : 1
        };
      }));
    });

    const renderItems = await Promise.all(drawTasks);

    if (canvasBgColor !== 'transparent') {
      let fillColor = '#000000';
      if (canvasBgColor === 'white') fillColor = '#ffffff';
      else if (canvasBgColor === 'gray') fillColor = '#6b7280';
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    renderItems.forEach(item => {
      ctx.save();
      if (item.opacity !== undefined) {
        ctx.globalAlpha = item.opacity;
      }
      if (item.flipH || item.flipV) {
        ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
        ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
        ctx.drawImage(item.img, -item.w / 2, -item.h / 2, item.w, item.h);
      } else {
        ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
      }
      ctx.restore();
    });

    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `cocfolia_layout_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error(error);
    alert('画像?出力中にエラーが発生しました?');
  } finally {
    exportBtn.disabled = false;
    exportBtn.innerHTML = originalText;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function exportPartsToZIP() {
  const exportPartsBtn = document.getElementById('export-parts-btn');
  if (!exportPartsBtn) return;
  
  const originalText = exportPartsBtn.innerHTML;
  exportPartsBtn.disabled = true;
  exportPartsBtn.innerHTML = '<i data-lucide="loader" class="animate-spin mr-2 w-4 h-4"></i>圧縮中...';
  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    if (typeof JSZip === 'undefined') {
      throw new Error("JSZipライブラリが読み込まれて?ません?");
    }

    const zip = new JSZip();
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('画像?ロードに失敗しました'));
        img.src = url;
      });
    };

    // 1. フレーム画像?処?
    if (frame) {
      const img = await loadImage(frame.url);
      const canvas = document.createElement('canvas');
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, frame.width, frame.height);
      
      const dataURL = canvas.toDataURL('image/png');
      const b64Data = dataURL.split(',')[1];
      zip.file("00_frame.png", b64Data, {base64: true});
    }

    // 2. ?パネルの処?
    const activePanels = panels.filter(p => p.visible !== false);
    for (let i = 0; i < activePanels.length; i++) {
      const panel = activePanels[i];
      const img = await loadImage(panel.url);
      const canvas = document.createElement('canvas');
      canvas.width = panel.width;
      canvas.height = panel.height;
      const ctx = canvas.getContext('2d');

      ctx.save();
      // 不透?度
      if (panel.opacity !== undefined) {
        ctx.globalAlpha = panel.opacity;
      }
      // 反転
      const flipH = panel.flipH || false;
      const flipV = panel.flipV || false;
      if (flipH || flipV) {
        ctx.translate(panel.width / 2, panel.height / 2);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -panel.width / 2, -panel.height / 2, panel.width, panel.height);
      } else {
        ctx.drawImage(img, 0, 0, panel.width, panel.height);
      }
      ctx.restore();

      const dataURL = canvas.toDataURL('image/png');
      const b64Data = dataURL.split(',')[1];
      
      const numStr = String(i + 1).padStart(2, '0');
      zip.file(`${numStr}_panel.png`, b64Data, {base64: true});
    }

    if (!frame && activePanels.length === 0) {
      alert("配置されて?る画像がありません?");
      return;
    }

    const content = await zip.generateAsync({type: "blob"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `cocfolia_parts_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error(error);
    alert('ZIPファイルの作?中にエラーが発生しました: ' + error.message);
  } finally {
    exportPartsBtn.disabled = false;
    exportPartsBtn.innerHTML = originalText;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

const exportBtnElement = document.getElementById('export-btn');
if (exportBtnElement) {
  exportBtnElement.addEventListener('click', exportToPNG);
}

const exportPartsBtnElement = document.getElementById('export-parts-btn');
if (exportPartsBtnElement) {
  exportPartsBtnElement.addEventListener('click', exportPartsToZIP);
}

// === フレーム画像編?モーダルの処?関数 ===
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

function closeFrameEditModal() {
  frameEditModal.classList.add('hidden');
  editImage = null;
}

// 選択ツールの操?
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
closeModalBtn.addEventListener('click', closeFrameEditModal);
cancelEditBtn.addEventListener('click', closeFrameEditModal);
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
        btn.classList.add('ring-1', 'ring-blue-500');
      }
    }
  });
}

const canvasBgColors = ['trans', 'white', 'gray', 'black'];
const targetMap = { 'trans': 'transparent', 'white': 'white', 'gray': 'gray', 'black': 'black' };
canvasBgColors.forEach(c => {
  const btn = document.getElementById(`canvas-bg-${c}`);
  if (btn) {
    btn.addEventListener('click', () => setCanvasBg(canvasTargetMap[c]));
  }
});

canvasBgColor = 'black';
setPreviewBg('blue');
updateUI();

// ==========================================
// AI Room Generator (AI社員に依頼) 機能
// ==========================================

const SYSTEM_RULE_PORTRAIT = `A highly creative and aesthetically stunning background image layout for a TRPG session room. 
The image must have a vertical aspect ratio.
The layout consists of several frames and buttons arranged vertically from top to bottom.
The layout should have beautiful margin and breathing room. All frames must be separated without overlapping.

CRITICAL DIRECTIVES:
- The ONLY text strings allowed to be printed on the image are the following items:
  * Five menu labels: 'HouseRule', 'Battle', 'Insanity', 'Growth', 'Other' (or their Japanese translations if preferred, but no other text).
  * Six button labels: '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩' (or their English translations if preferred, but no other text).
- The 6 buttons for '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩' must be extremely small and compact. They must be strictly designed to be half (50%) the size of the top menu buttons ('HouseRule', 'Battle', etc.) to maintain a clean layout hierarchy.
- ABSOLUTELY DO NOT print any other words, names, labels, or annotations (such as "Menu", "Title", "Foreground", "PC Standing", "Special Area", "Useful Buttons", "priority", "items", "players", "window", "buttons").
- All other UI boxes and areas must be represented as pure graphical borders, empty slots, or empty frames with ZERO text inside or next to them.

Details of elements from top to bottom:
1) At the very top: 5 small menu buttons containing only the labels: 'HouseRule', 'Battle', 'Insanity', 'Growth', 'Other'.
2) Near the top: An empty decorative title frame (no text).
3) Upper middle: One large main frame (window) for display (no text).
4) Lower middle: [NUM_PLAYERS] very tall, vertically long rectangular slots side-by-side (no text, no character silhouettes). These slots must be elongated vertically to accommodate full-body character illustrations.
5) Near the bottom: One extra empty box/frame (no text).
6) At the very bottom: 6 small buttons containing only the labels: '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩'.`;

const SYSTEM_RULE_LANDSCAPE = `A highly creative and aesthetically stunning background image layout for a TRPG session room. 
The image must have a horizontal aspect ratio.
The layout consists of several frames and buttons arranged beautifully.
The layout should have beautiful margin and breathing room. All frames must be separated without overlapping.

CRITICAL DIRECTIVES:
- The ONLY text strings allowed to be printed on the image are the following items:
  * Five menu labels: 'HouseRule', 'Battle', 'Insanity', 'Growth', 'Other' (or their Japanese translations if preferred, but no other text).
  * Six button labels: '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩' (or their English translations if preferred, but no other text).
- The 6 buttons for '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩' must be extremely small and compact. They must be strictly designed to be half (50%) the size of the top menu buttons ('HouseRule', 'Battle', etc.) to maintain a clean layout hierarchy.
- ABSOLUTELY DO NOT print any other words, names, labels, or annotations (such as "Menu", "Title", "Foreground", "PC Standing", "Special Area", "Useful Buttons", "priority", "items", "players", "window", "buttons").
- All other UI boxes and areas must be represented as pure graphical borders, empty slots, or empty frames with ZERO text inside or next to them.

Details of elements:
1) Top-Left: 5 small menu buttons containing only the labels: 'HouseRule', 'Battle', 'Insanity', 'Growth', 'Other'.
2) Center-Left: One large main frame (window) for display (no text).
3) Bottom-Left: One extra empty box/frame (no text).
4) Center-Right: [NUM_PLAYERS] vertical rectangular slots side-by-side (no text, no character silhouettes).
5) Top-Right: 6 small buttons containing only the labels: '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩'.`;


const aiGenerateBtn = document.getElementById('ai-generate-btn');
const aiThemeSelect = document.getElementById('ai-theme-select');
const aiPlayersSelect = document.getElementById('ai-players-select');
const aiLayoutSelect = document.getElementById('ai-layout-select');
const aiChatBox = document.getElementById('ai-chat-box');
const aiPromptInput = document.getElementById('ai-prompt-input');
const aiGenBgToggle = document.getElementById('ai-gen-bg-toggle');
const aiGenPartsToggle = document.getElementById('ai-gen-parts-toggle');
const aiBgOnlyToggle = document.getElementById('ai-bg-only-toggle');
const aiApiKeyInput = document.getElementById('ai-api-key');

if (aiApiKeyInput) {
  const savedApiKey = localStorage.getItem('stampToolApiKey');
  if (savedApiKey) aiApiKeyInput.value = savedApiKey;
  aiApiKeyInput.addEventListener('input', (e) => {
    localStorage.setItem('stampToolApiKey', e.target.value.trim());
  });
}

const actionIconsData = [
  {
    name: "spot",
    label: "目?",
    sub: "SPOT",
    path: `<path d="M15,40 Q40,15 65,40 Q40,65 15,40 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="3" fill="#ff007f"/>`
  },
  {
    name: "listen",
    label: "聞き耳",
    sub: "LISTEN",
    path: `<path d="M30,30 C30,20 45,15 50,25 C55,35 40,45 45,55 C48,60 40,65 35,60 C30,55 35,45 32,40 C30,38 30,32 30,30 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><path d="M40,35 C42,40 40,45 37,45" fill="none" stroke="#ff007f" stroke-width="1.5"/>`
  },
  {
    name: "library",
    label: "図書館",
    sub: "LIBRARY",
    path: `<path d="M18,25 L38,20 L38,60 L18,65 Z M62,25 L42,20 L42,60 L62,65 Z" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/><path d="M38,20 L42,20 M38,60 L42,60" stroke="#ff007f" stroke-width="2"/>`
  },
  {
    name: "idea",
    label: "アイ?ア",
    sub: "IDEA",
    path: `<path d="M40,20 C28,20 28,38 34,45 L34,55 L46,55 L46,45 C52,38 52,20 40,20 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><line x1="34" y1="58" x2="46" y2="58" stroke="#ff007f" stroke-width="2"/><line x1="40" y1="62" x2="40" y2="62" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>`
  },
  {
    name: "san",
    label: "SANチェ?ク",
    sub: "SAN",
    path: `<path d="M40,40 m-25,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0 M40,40 m-18,0 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0 M40,40 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.6"/><path d="M40,40 L40,22 M40,40 L53,50 M40,40 L27,50" stroke="#ff007f" stroke-width="2"/>`
  },
  {
    name: "salt",
    label: "お祓いの塩",
    sub: "SALT",
    path: `<polygon points="40,20 20,60 60,60" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/><line x1="20" y1="60" x2="60" y2="60" stroke="#ff007f" stroke-width="2"/><path d="M36,35 L44,35 M40,31 L40,39" stroke="#00f0ff" stroke-width="1"/>`
  }
];

const employees = {
  takumi: { name: 'タク? (プランナ?)', color: '#60a5fa', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Takumi' },
  aoi: { name: 'アオイ (?ザイナ?)', color: '#f472b6', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aoi' }
};

function createSvgUrl(svgString) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}

function combineImageAndSvg(img, sx, sy, sw, sh, svgString, targetW, targetH) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    
    // 1. 画像から指定??囲を??り?して描画
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    
    // 2. SVGを重ね?
    const svgImg = new Image();
    svgImg.onload = () => {
      ctx.drawImage(svgImg, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/png'));
    };
    svgImg.onerror = () => {
      resolve(canvas.toDataURL('image/png'));
    };
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    svgImg.src = URL.createObjectURL(svgBlob);
  });
}

function addChatMessage(employee, text) {
  const msgEl = document.createElement('div');
  msgEl.className = 'flex gap-2 items-start mb-2';
  msgEl.innerHTML = `
    <img src="${employee.avatar}" class="w-6 h-6 rounded-full shrink-0 border border-gray-700 bg-gray-800" alt="${employee.name}">
    <div>
      <span class="font-bold block" style="color: ${employee.color}">${employee.name}</span>
      <p class="text-gray-300 leading-relaxed">${text}</p>
    </div>
  `;
  aiChatBox.appendChild(msgEl);
  aiChatBox.scrollTop = aiChatBox.scrollHeight;
}

async function callGeminiApiForLayout(apiKey, theme, numPlayers, layoutType, customPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  let layoutName = '右側に縦並び';
  if (layoutType === 'bottom-horizontal') layoutName = '下部に横並び';
  else if (layoutType === 'pattern1') layoutName = 'パターン1 (メイン左上?立ち絵右・アクション右?)';
  else if (layoutType === 'pattern2') layoutName = 'パターン2 (メイン左下?立ち絵右・アクション右?)';
  else if (layoutType === 'pattern3') layoutName = 'パターン3 (メイン右上?立ち絵下?アクション右縦)';
  else if (layoutType === 'pattern4') layoutName = 'パターン4 (メイン右・立ち絵左・アクション?)';
  else if (layoutType === 'pattern5') layoutName = 'パターン5 (メイン中央上?立ち絵下?メニュー最上?アクション最?)';
  else if (layoutType === 'pattern6') layoutName = 'パターン6 (メイン最上?立ち絵最下?メニュー&アクション中央)';
  else if (layoutType === 'pattern7') layoutName = 'パターン7 (メイン最下?立ち絵上?メニュー最上?アクション中央?)';

  const systemPrompt = `
あなた?ココフォリアの部屋レイアウトを設計するAI社員チ?ムです?
以下?メンバ?構?でCEO?ユーザー??要望を議論し、最終的な?ザイン配色とアセ?ト?方向性を決定してください?

【チームメンバ??
- タク? (プランナ?): 部屋?体?配置?使??すさを企画する
- アオイ (?ザイナ?): 部屋?カラーコー?ィネ?トや?飾のスタイルを担当す?

【CEOからの要望?
- 大枠の?ー?: ${theme}
- プレイヤー人数: ${numPlayers}人部?
- 配置: ${layoutName}
- 追加の要望?フリー入力?: "${customPrompt || '特にな?'}"

【レイアウト?置の動的設計指示?
キャンバス全体?解像度は 1280x720 ピクセルです?
CEOからの追加の要望?フリー入力）に、PLパネル?メイン画面、メニュー、アクションアイコンの配置位置?サイズ、また?背景?フレーム??有無に関する具体的な要望がある場合、その要望を満たすように?コン?ナ?座標?X座標、Y座標、横?、縦??を動的に計算してJSONに出力してください?
特に配置に関する要望がな?場合、また?判断がつかな?場合?、デフォルト?配置ルール??layoutType?に基づく標準的な座標を出力してください?

【?身立ち絵用PLパネル?立ち絵重視）?基本設計?
- CEOから「?身立ち絵」「立ち絵重視」「立ち絵が?るよ?に」などの要望がある場合、PLパネル??pl_panels??縦長?横? 140?160px?高さ 300?350px 程度、アスペクト? 1:2 ? 1:2.5 程度??比率で設計してください。デフォルト?PLパネル?横 160 x 縦 170?とは異なるサイズになります?

【背景透過?フレームなし）?設計?
- CEOから「背景なし」「フレームなし」「背景透過」「グレーの部?は不要」などの要望がある場合、また?ココフォリアで透過PNG枠パ??として使?たいと??意図がある場合?、デザインパラメータの no_background ? true に設定し、背景?フレーム画像）を出力しな?ように?示してください?

?7つの代表?レイアウトパターンと座標ガイド?
CEOから以下?パターン??1?7???定、あるいはそれに類似する配置?示??:「PLパネルは下部、メインは最上部」など?があった場合、以下?座標設計ガイドに従って?パ??をレイアウトしてください?
?各パ??は重なり合わな?ように調整すること??

- パターン1 (メイン画面左上、メニュー左下、PL立ち絵右、アクション右?):
  - メイン画面 (window): X: 50, Y: 50, W: 500, H: 300
  - メニュー (menu): X: 120, Y: 380, 方?: "vertical"
  - PL立ち絵 (pl_panels): Y: 150, W: 140, H: 350 (右側空きスペ?ス X: 600, 760, 920, 1080 に人数?配置)
  - アクション (action): X: 600, Y: 530
- パターン2 (メイン画面左下、メニュー左上、PL立ち絵右、アクション右?):
  - メイン画面 (window): X: 50, Y: 370, W: 500, H: 300
  - メニュー (menu): X: 120, Y: 50, 方?: "vertical"
  - PL立ち絵 (pl_panels): Y: 220, W: 140, H: 350 (右側空きスペ?ス X: 600, 760, 920, 1080 に配置)
  - アクション (action): X: 600, Y: 110
- パターン3 (メイン画面右上、メニュー左上、PL立ち絵下、アクション右下縦並び):
  - メイン画面 (window): X: 350, Y: 80, W: 700, H: 320
  - メニュー (menu): X: 50, Y: 100, 方?: "vertical"
  - PL立ち絵 (pl_panels): Y: 430, W: 140, H: 260 (下部 X: 300, 460, 620, 780 に配置)
  - アクション (action): X: 950, Y: 430, 方?: "vertical"??X固定でYが下に向かって展開??
- パターン4 (PL立ち絵左、メイン画面右、メニュー左下、アクション?):
  - PL立ち絵 (pl_panels): Y: 50, W: 140, H: 350 (左側 X: 50, 210, 370, 530 に配置)
  - メイン画面 (window): X: 720, Y: 50, W: 500, H: 320
  - メニュー (menu): X: 50, Y: 430, 方?: "vertical"
  - アクション (action): X: 300, Y: 500
- パターン5 (メニュー最上部横、メイン画面中央上、PL立ち絵下、アクション最下部):
  - メニュー (menu): X: 200, Y: 30, 方?: "horizontal"
  - メメイン画面 (window): X: 280, Y: 80, W: 720, H: 320
  - PL立ち絵 (pl_panels): Y: 420, W: 140, H: 260 (中央? X: 280, 460, 640, 820 に配置)
  - アクション (action): X: 360, Y: 600
- パターン6 (メイン画面最上部、メニュー中央横、アクション中央横、PL立ち絵最下部):
  - メイン画面 (window): X: 150, Y: 50, W: 980, H: 300
  - メニュー (menu): X: 150, Y: 370, 方?: "horizontal"
  - アクション (action): X: 150, Y: 430
  - PL立ち絵 (pl_panels): Y: 510, W: 140, H: 180 (下部 X: 150, 410, 670, 930 に配置)
- パターン7 (メニュー最上部横、PL立ち絵上、アクション下、メイン画面最下部):
  - メニュー (menu): X: 150, Y: 30, 方?: "horizontal"
  - PL立ち絵 (pl_panels): Y: 80, W: 180, H: 280 (上部 X: 150, 410, 670, 930 に配置)
  - アクション (action): X: 150, Y: 380
  - メイン画面 (window): X: 150, Y: 440, W: 980, H: 250

【各コン?ナ?標準サイズ?デフォルト値??
上記パターンの?定がな?場合?、レイアウトタイプ?layoutType?に基づく標準座標?
- キャンバスサイズ: 1280 x 720
- メイン画面 (window): 横 720 x 縦 405 (右側縦並びな? X: 50, Y: 110、下部横並びな? X: 280, Y: 50)
- PLパネル (pl_panels): 横 160, 縦 170 (右側縦並びな? X: 1050, Y: 40?680等間隔、下部横並びな? Y: 510, X: 280?1000等間?)
- メニュー (menu): 5つのボタン。右側縦並びな? X: 50, Y: 50?横並び?、下部横並びな? X: 50, Y: 50?縦並び??
- アクションアイコン (action): 6つのボタン?横 75 x 縦 75?。右側縦並びな? X: 50, Y: 550?横並び?、下部横並びな? X: 50, Y: 350〜（縦2列?

【?力指示?
1. まず、タクミとアオイがCEOの要望に沿ってどのようなカラー?レイアウトにするかを相?する会話ログを「合計で4回?発話?タク?2回、アオイ2回）」で作?してください?
2. 次に、相?の結果決定した部屋?「デザインパラメータ」を以下?カラーコードおよ?レイアウト座標パラメータで?定してください?
   - bg_gradient_start: 背景のグラ?ーション開始色 (ダークカラー推奨?16進数)
   - bg_gradient_end: 背景のグラ?ーション終?色 (ダークカラー推奨?16進数)
   - accent_color: アクセントとして輝かせるネオン?スリ?トなどの色 (16進数)
   - accent_color_rgb: 上記アクセント色のRGB成?? (?: "0, 240, 255")
   - border_color: 窓やPLパネルの主な枠線?色 (16進数)
   - text_color: ?種ラベルの?キスト文字色 (16進数)
   - panel_bg: 前景窓やPLパネルなどのコン?ナ??側背景色 (透過半透?で表示されるため、暗め?色推奨?16進数)
   - style_description: 今回設計したスタイルの短?説? (?: "夕暮れ?アン?ィークカフェ")
   
   【レイアウト座標パラメータ】※CEOの要望に応じて適?に変更し、?ず含めてください?
   - no_background: 背景を完?に透?（透過?にする場合? true、そ?でな?場合? false?また??定しな???
   - window_x: メイン画面 of X座標（数値??
   - window_y: メイン画面 of Y座標（数値??
   - window_width: メイン画面 of 横??数値??
   - window_height: メイン画面 of 縦??数値??
   - pl_panels: プレイヤー人数???${numPlayers}個）?座標オブジェクト??。各要素は {"x": 数値, "y": 数値, "width": 数値, "height": 数値}
   - menu_x: メニュー開始X座標（数値??
   - menu_y: メニュー開始Y座標（数値??
   - menu_layout: "horizontal" また? "vertical"
   - action_x: アクション開始X座標（数値??
   - action_y: アクション開始Y座標（数値??

出力??ず以下?有効なJSONフォーマット?みとしてください。前置きや\`\`\`json マ?クダウンなどは含めな?でください?

{
  "discussion": [
    {"speaker": "takumi", "text": "タクミ?発言1"},
    {"speaker": "aoi", "text": "アオイの発言1"},
    {"speaker": "takumi", "text": "タクミ?発言2"},
    {"speaker": "aoi", "text": "アオイの発言2"}
  ],
  "design": {
    "bg_gradient_start": "#XXXXXX",
    "bg_gradient_end": "#XXXXXX",
    "accent_color": "#XXXXXX",
    "accent_color_rgb": "R, G, B",
    "border_color": "#XXXXXX",
    "text_color": "#XXXXXX",
    "panel_bg": "#XXXXXX",
    "style_description": "説?",
    "no_background": true また? false,
    "window_x": 座標数値,
    "window_y": 座標数値,
    "window_width": 横?数値,
    "window_height": 縦?数値,
    "pl_panels": [
      {"x": X座標数値, "y": Y座標数値, "width": 横?数値, "height": 縦?数値},
      ...
    ],
    "menu_x": X座標数値,
    "menu_y": Y座標数値,
    "menu_layout": "horizontal" また? "vertical",
    "action_x": X座標数値,
    "action_y": Y座標数値
  }
}
`;

  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] })
      });
      
      if (response.status === 503 || response.status === 429) {
        if (i < 2) {
          console.warn(`Gemini API returned ${response.status}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
      }
      
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      if (i === 2) throw err;
      console.warn(`Fetch error: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

async function callImagenApiForBackground(apiKey, prompt, aspectRatio = '16:9') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
  
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        })
      });
      
      if (response.status === 503 || response.status === 429) {
        if (i < 2) {
          console.warn(`Imagen API returned ${response.status}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
      }
      
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      try {
        const b64Data = data.candidates[0].content.parts[0].inlineData.data;
        if (!b64Data) {
          throw new Error("No inlineData found in response parts.");
        }
        return b64Data;
      } catch (parseErr) {
        throw new Error("Failed to parse image data from response.");
      }
    } catch (err) {
      if (i === 2) throw err;
      console.warn(`Imagen Fetch error: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

// ?ーマ別のSVG生?ロジ?ク
const themeSvgGenerators = {
  cyberpunk: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#07080d"/>
  <rect width="100%" height="100%" fill="none" stroke="#00f0ff" stroke-width="0.5" opacity="0.1"/>
  <path d="M30,30 L200,30 L220,50 L1220,50 L1250,80 L1250,690" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
  <path d="M1250,690 L1080,690 L1060,670 L60,670 L30,640 L30,30" fill="none" stroke="#ff007f" stroke-width="1.5" opacity="0.4"/>
  <circle cx="210" cy="40" r="3" fill="#00f0ff" opacity="0.6"/>
  <circle cx="1070" cy="680" r="3" fill="#ff007f" opacity="0.6"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="#06070c" fill-opacity="0.4" stroke="#00f0ff" stroke-width="2" rx="6"/>
  <rect x="9" y="9" width="702" height="387" fill="none" stroke="#ff007f" stroke-width="1" opacity="0.6" rx="4"/>
  <path d="M5,35 L5,5 L35,5" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M715,35 L715,5 L685,5" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M5,370 L5,400 L35,400" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M715,370 L715,400 L685,400" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M260,5 L280,25 L440,25 L460,5 Z" fill="#00f0ff"/>
  <text x="360" y="18" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#07080d" text-anchor="middle" letter-spacing="2">MAIN MONITOR</text>
  <circle cx="20" cy="20" r="4" fill="#00ff00" opacity="0.8"/>
  <circle cx="32" cy="20" r="4" fill="#00ff00" opacity="0.3"/>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#06070c" fill-opacity="0.6" stroke="#ff007f" stroke-width="1.5" rx="4"/>
  <path d="M4,18 L4,4 L18,4" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M${w - 4},18 L${w - 4},4 L${w - 18},4" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M4,${h - 18} L4,${h - 4} L18,${h - 4}" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M${w - 4},${h - 18} L${w - 4},${h - 4} L${w - 18},${h - 4}" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <line x1="20" y1="${h - 70}" x2="${w - 20}" y2="${h - 70}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <line x1="20" y1="${h - 55}" x2="${w - 20}" y2="${h - 55}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <rect x="15" y="${h - 40}" width="${w - 30}" height="26" fill="#111322" stroke="#ff007f" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 23}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#00f0ff" text-anchor="middle">PC NAME</text>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#07080d" fill-opacity="0.8" stroke="#00f0ff" stroke-width="1.5" rx="4"/>
  <line x1="12" y1="18" x2="25" y2="18" stroke="#ff007f" stroke-width="3"/>
  <text x="100" y="22" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#00f0ff" text-anchor="middle" letter-spacing="1.5">${text.toUpperCase()}</text>
  <path d="M170,8 L174,12 L174,24 L170,28" fill="none" stroke="#ff007f" stroke-width="1"/>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#07080d" fill-opacity="0.8" stroke="#00f0ff" stroke-width="1.5"/>
  <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="#ff007f" stroke-width="0.7" opacity="0.5"/>
  <g transform="translate(-2.5, -7.5)">
    ${pathString}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#00f0ff" text-anchor="middle">${label}</text>
</svg>`
  },
  horror: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#050000"/>
  <rect x="20" y="20" width="1240" height="680" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M20,50 L20,20 L50,20" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M1260,50 L1260,20 L1230,20" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M20,670 L20,700 L50,700" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M1260,670 L1260,700 L1230,700" fill="none" stroke="#8a0c0c" stroke-width="2"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="4" y="4" width="712" height="397" fill="#080101" fill-opacity="0.75" stroke="#4a0404" stroke-width="3" rx="2"/>
  <rect x="12" y="12" width="696" height="381" fill="none" stroke="#8a0c0c" stroke-width="1" opacity="0.6"/>
  <text x="360" y="30" font-family="serif" font-size="14" font-weight="bold" fill="#8a0c0c" text-anchor="middle" letter-spacing="4">主画面</text>
  <line x1="320" y1="36" x2="400" y2="36" stroke="#8a0c0c" stroke-width="1.5"/>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#0c0202" fill-opacity="0.7" stroke="#4a0404" stroke-width="2"/>
  <line x1="10" y1="${h - 50}" x2="${w - 10}" y2="${h - 50}" stroke="#4a0404" stroke-width="1.5"/>
  <rect x="15" y="${h - 42}" width="${w - 30}" height="28" fill="#1a0202" stroke="#8a0c0c" stroke-width="1"/>
  <text x="${w / 2}" y="${h - 24}" font-family="serif" font-size="12" font-weight="bold" fill="#8a0c0c" text-anchor="middle">登 場 人 物</text>
</svg>`,
    menu: (text) => {
      const trans = { "houserule": "定?", "battle": "合戦", "insanity": "狂?", "growth": "成長", "other": "雑?" };
      const jpText = trans[text.toLowerCase()] || text;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#080101" fill-opacity="0.8" stroke="#4a0404" stroke-width="1.5"/>
  <text x="90" y="22" font-family="serif" font-size="12" font-weight="bold" fill="#8a0c0c" text-anchor="middle" letter-spacing="4">${jpText}</text>
</svg>`;
    },
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <rect x="3" y="3" width="69" height="69" fill="#080101" fill-opacity="0.85" stroke="#4a0404" stroke-width="1.5" rx="4"/>
  <g transform="translate(-2.5, -7.5)" stroke="#8a0c0c" stroke-width="2">
    ${pathString.replace(/#00f0ff/g, '#8a0c0c').replace(/#ff007f/g, '#4a0404')}
  </g>
  <text x="37.5" y="64" font-family="serif" font-size="10" font-weight="bold" fill="#8a0c0c" text-anchor="middle">${label}</text>
</svg>`
  },
  classic: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#1b241b"/>
  <rect x="30" y="30" width="1220" height="660" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
  <rect x="25" y="25" width="16" height="16" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
  <rect x="1239" y="25" width="16" height="16" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="#141a14" fill-opacity="0.6" stroke="#d4af37" stroke-width="2.5" rx="2"/>
  <text x="360" y="32" font-family="'Georgia', serif" font-style="italic" font-size="13" font-weight="bold" fill="#d4af37" text-anchor="middle" letter-spacing="2">Theatre</text>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#141a14" fill-opacity="0.65" stroke="#d4af37" stroke-width="1.5" rx="3"/>
  <line x1="20" y1="${h - 60}" x2="${w - 20}" y2="${h - 60}" stroke="#d4af37" stroke-width="0.8" opacity="0.5"/>
  <rect x="20" y="${h - 48}" width="${w - 40}" height="26" fill="#0d120d" stroke="#d4af37" stroke-width="1" rx="1"/>
  <text x="${w / 2}" y="${h - 31}" font-family="'Georgia', serif" font-size="11" font-weight="bold" fill="#d4af37" text-anchor="middle" letter-spacing="1">INVESTIGATOR</text>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#141a14" fill-opacity="0.8" stroke="#d4af37" stroke-width="1.5" rx="2"/>
  <text x="90" y="22" font-family="'Georgia', serif" font-size="11" font-weight="bold" fill="#d4af37" text-anchor="middle" letter-spacing="2">${text.toUpperCase()}</text>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#141a14" fill-opacity="0.8" stroke="#d4af37" stroke-width="1.5"/>
  <g transform="translate(-2.5, -7.5)" stroke="#d4af37" stroke-width="1.8">
    ${pathString.replace(/#00f0ff/g, '#d4af37').replace(/#ff007f/g, '#0c100c')}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d4af37" text-anchor="middle">${label}</text>
</svg>`
  },
  fantasy: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#140827"/>
  <rect x="25" y="25" width="1230" height="670" fill="none" stroke="#7b68ee" stroke-width="1.5" opacity="0.4" rx="8"/>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#0d091a" fill-opacity="0.6" stroke="#7b68ee" stroke-width="1.5" rx="4"/>
  <line x1="20" y1="${h - 60}" x2="${w - 20}" y2="${h - 60}" stroke="#4b0082" stroke-width="1"/>
  <rect x="20" y="${h - 48}" width="${w - 40}" height="26" fill="#07040f" stroke="#7b68ee" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 31}" font-family="'Cinzel', serif" font-size="11" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="1">HERO</text>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#0d091a" fill-opacity="0.8" stroke="#7b68ee" stroke-width="1.5" rx="3"/>
  <text x="95" y="22" font-family="sans-serif" font-size="11" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="2">${text.toUpperCase()}</text>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#0d091a" fill-opacity="0.8" stroke="#7b68ee" stroke-width="1.5"/>
  <g transform="translate(-2.5, -7.5)" stroke="#7b68ee" stroke-width="1.8">
    ${pathString.replace(/#00f0ff/g, '#7b68ee').replace(/#ff007f/g, '#0d091a')}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7b68ee" text-anchor="middle">${label}</text>
</svg>`
  },
  dynamic: {
    bg: (d) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg-grad-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${d.bg_gradient_start || '#07080d'}"/>
      <stop offset="100%" stop-color="${d.bg_gradient_end || '#121420'}"/>
    </linearGradient>
    <radialGradient id="glow-accent" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${d.accent_color || '#00f0ff'}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-grad-dyn)"/>
  <rect width="100%" height="100%" fill="url(#glow-accent)"/>
  <g stroke="${d.border_color || '#00f0ff'}" stroke-width="0.5" opacity="0.1">
    <path d="M0,40 L1280,40 M0,120 L1280,120 M0,200 L1280,200 M0,280 L1280,280 M0,360 L1280,360 M0,440 L1280,440 M0,520 L1280,520 M0,600 L1280,600 M0,680 L1280,680"/>
    <path d="M80,0 L80,720 M200,0 L200,720 M320,0 L320,720 M440,0 L440,720 M560,0 L560,720 M680,0 L680,720 M800,0 L800,720 M920,0 L920,720 M1040,0 L1040,720 M1160,0 L1160,720"/>
  </g>
  <path d="M30,30 L200,30 L220,50 L1220,50 L1250,80 L1250,690" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5" opacity="0.4"/>
  <path d="M1250,690 L1080,690 L1060,670 L60,670 L30,640 L30,30" fill="none" stroke="${d.accent_color || '#ff007f'}" stroke-width="1.5" opacity="0.4"/>
  <circle cx="210" cy="40" r="3" fill="${d.accent_color || '#00f0ff'}" opacity="0.6"/>
  <circle cx="1070" cy="680" r="3" fill="${d.accent_color || '#ff007f'}" opacity="0.6"/>
</svg>`,
    window: (d) => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="${d.panel_bg || '#06070c'}" fill-opacity="0.5" stroke="${d.border_color || '#00f0ff'}" stroke-width="2.5" rx="6"/>
  <rect x="9" y="9" width="702" height="387" fill="none" stroke="${d.accent_color || '#ff007f'}" stroke-width="0.8" opacity="0.4" rx="4"/>
  <path d="M5,35 L5,5 L35,5" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="4"/>
  <path d="M715,35 L715,5 L685,5" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="4"/>
  <path d="M5,370 L5,400 L35,400" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="4"/>
  <path d="M715,370 L715,400 L685,400" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="4"/>
  <path d="M260,5 L280,25 L440,25 L460,5 Z" fill="${d.border_color || '#00f0ff'}"/>
  <text x="360" y="18" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.panel_bg || '#07080d'}" text-anchor="middle" letter-spacing="2">MAIN MONITOR</text>
</svg>`,
    pl: (d, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="${d.panel_bg || '#06070c'}" fill-opacity="0.6" stroke="${d.border_color || '#ff007f'}" stroke-width="1.5" rx="4"/>
  <path d="M4,18 L4,4 L18,4" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M${w - 4},18 L${w - 4},4 L${w - 18},4" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M4,${h - 18} L4,${h - 4} L18,${h - 4}" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M${w - 4},${h - 18} L${w - 4},${h - 4} L${w - 18},${h - 4}" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="2.5"/>
  <line x1="20" y1="${h - 70}" x2="${w - 20}" y2="${h - 70}" stroke="${d.border_color || '#00f0ff'}" stroke-width="1" opacity="0.3"/>
  <line x1="20" y1="${h - 55}" x2="${w - 20}" y2="${h - 55}" stroke="${d.border_color || '#00f0ff'}" stroke-width="1" opacity="0.3"/>
  <rect x="15" y="${h - 40}" width="${w - 30}" height="26" fill="${d.panel_bg || '#111322'}" stroke="${d.border_color || '#ff007f'}" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 23}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle">PC NAME</text>
</svg>`,
    menu: (d, text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="${d.panel_bg || '#07080d'}" fill-opacity="0.8" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5" rx="4"/>
  <line x1="12" y1="18" x2="25" y2="18" stroke="${d.accent_color || '#ff007f'}" stroke-width="3"/>
  <text x="100" y="22" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle" letter-spacing="1.5">${text.toUpperCase()}</text>
</svg>`,
    action: (d, label, sub, pathString) => {
      let strokeColor = d.border_color || '#00f0ff';
      let accentColor = d.accent_color || '#ff007f';
      let processedPath = pathString
        .replace(/#00f0ff/g, strokeColor)
        .replace(/#ff007f/g, accentColor);
      
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="${d.panel_bg || '#07080d'}" fill-opacity="0.8" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5"/>
  <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="${d.accent_color || '#ff007f'}" stroke-width="0.7" opacity="0.4"/>
  <g transform="translate(-2.5, -7.5)">
    ${processedPath}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle">${label}</text>
</svg>`;
    }
  }
};

if (aiGenerateBtn) {
  aiGenerateBtn.addEventListener('click', async () => {
    const theme = aiThemeSelect.value;
    const numPlayers = parseInt(aiPlayersSelect.value, 10);
    const layoutType = aiLayoutSelect.value;
    const customPrompt = aiPromptInput ? aiPromptInput.value.trim() : '';
    const genBg = aiGenBgToggle ? aiGenBgToggle.checked : false;
    const genParts = aiGenPartsToggle ? aiGenPartsToggle.checked : false;
    const bgOnly = aiBgOnlyToggle ? aiBgOnlyToggle.checked : false;
    
    // UIをロード状態にする
    aiGenerateBtn.disabled = true;
    aiGenerateBtn.innerHTML = '<i data-lucide="loader" class="animate-spin mr-1.5 w-4 h-4"></i>作?中...';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    aiChatBox.innerHTML = '';
    aiChatBox.classList.remove('hidden');

    const apiKey = localStorage.getItem('stampToolApiKey');
    
    if (apiKey && (theme === 'custom' || customPrompt !== '')) {
      // リアルAI生?モー?
      if (bgOnly) {
        addChatMessage(employees.takumi, `CEO、ご要望を承りました?パー?は配置せず、ご?示のルール?${customPrompt || theme}」に沿って部屋画像を1枚で美しくレンダリングします！`);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          addChatMessage(employees.aoi, "任せて?指定された要素?枠線?雰囲気を1枚?イラスト背景画像としてしっかりモ?リング?生成）する???");
          
          let bgImageUrl = null;
          if (genBg) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addChatMessage(employees.aoi, "ご指示通りの部屋画像?レンダリング?画像生成）を開始する??数秒かかるから?っててね?");
            
            try {
              const isPortrait = canvasWidth < canvasHeight;
              const aspectRatio = isPortrait ? "9:16" : "16:9";
              const rawSystemRule = isPortrait ? SYSTEM_RULE_PORTRAIT : SYSTEM_RULE_LANDSCAPE;
              const systemRule = rawSystemRule.replace(/\[NUM_PLAYERS\]/g, numPlayers);
              
              let imagenPrompt = `${systemRule}

`;
              if (theme && theme !== 'custom') {
                imagenPrompt += `Theme/Style: ${theme}
`;
              }
              if (customPrompt) {
                imagenPrompt += `User Custom Requirements: ${customPrompt}
`;
              }
              imagenPrompt += `Number of players (PC slots): ${numPlayers}
`;
              
              // Add layout pattern details for the background generator to respect
              const layoutDescriptions = {
                'right-vertical': 'PC slots are vertically aligned on the right side of the screen.',
                'bottom-horizontal': 'PC slots are horizontally aligned at the bottom of the screen.',
                'pattern1': 'The main window is on the top-left, PC slots are vertically aligned on the right, and the actions/menu are on the bottom-right.',
                'pattern2': 'The main window is on the bottom-left, PC slots are vertically aligned on the right, and the actions/menu are on the top-right.',
                'pattern3': 'The main window is on the top-right, PC slots are at the bottom, and the actions/menu are vertically aligned on the right.',
                'pattern4': 'The main window is on the right side, PC slots are on the left side, and the actions/menu are at the bottom.',
                'pattern5': 'The main window is at the center-top, PC slots are aligned horizontally below it, menu buttons are at the very top, and useful buttons are at the very bottom.',
                'pattern6': 'The main window is at the top, PC slots are at the bottom, and the menu and useful buttons are aligned in the center between them.',
                'pattern7': 'The main window is at the bottom, PC slots are aligned horizontally above it, menu buttons are at the very top, and useful buttons are in the middle-bottom.'
              };
              const layoutPatternDesc = layoutDescriptions[layoutType] || '';
              if (layoutPatternDesc) {
                imagenPrompt += `Layout Pattern: ${layoutPatternDesc}
`;
              }

              imagenPrompt += `
CRITICAL Directives for Image Generation:
- The ONLY text strings allowed to be written on the image are the following exact words:
  * 'HouseRule', 'Battle', 'Insanity', 'Growth', 'Other'
  * '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩'
- The 6 buttons for '目星', '聞き耳', '図書館', 'アイデア', 'SANc', '塩' must be extremely small and compact. They must be strictly designed to be half (50%) the size of the top menu buttons ('HouseRule', 'Battle', etc.) to maintain a clean layout hierarchy.
- DO NOT draw any other text, labels, annotations, or explanatory words (such as "Menu", "Foreground", "PC Standing", "Useful Buttons", "Title", "priority", "items", "players").
- All frames, windows, and slots must be represented as pure graphical borders, boxes, or lines with absolutely ZERO alphabetic or Japanese text labels inside or next to them.
- Any specification pointing to area names like "メニュー" (Menu), "クリックアクション/便利ボタン" (Useful Buttons), "前景" (Foreground), "立ち絵" (Standing) are only describing the visual theme or style (e.g., "decorate with stars"). DO NOT write those names as text on the image. Render only the visual stars and styling on the frames, with absolutely ZERO alphabetic or Japanese text labels.
`;
              
              const imageBytes = await callImagenApiForBackground(apiKey, imagenPrompt, aspectRatio);
              bgImageUrl = `data:image/png;base64,${imageBytes}`;
              
              await new Promise(resolve => setTimeout(resolve, 500));
              addChatMessage(employees.aoi, "お?たせしました?ココフォリア部屋画像?生?が完?したよ?");
            } catch (imgErr) {
              console.error(imgErr);
              await new Promise(resolve => setTimeout(resolve, 500));
              if (imgErr.message.includes('429')) {
                addChatMessage(employees.takumi, `画像?生?制限（レートリミット?429?に達しました?Google APIの無料枠制限などの可能性があるため、しばらく時間?数?〜数十???を置?てから再度お試しください。`);
              } else {
                addChatMessage(employees.takumi, `画像?生?中にエラーが発生しました (${imgErr.message})。`);
              }
            }
          }
          
          if (bgImageUrl) {
            frame = {
              url: bgImageUrl,
              x: 0,
              y: 0,
              width: canvasWidth,
              height: canvasHeight,
              originalRatio: canvasWidth / canvasHeight
            };
          }
          panels = [];
          selectedPanelIds = [];
          updateUI();
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          addChatMessage(employees.takumi, "作?完?しました。個別パネルは配置しておりませんので、このまま保存してご活用ください??");
        } catch (err) {
          console.error(err);
          addChatMessage(employees.takumi, `申し訳ありません、API連携中にエラーが発生しました (${err.message})。`);
        } finally {
          aiGenerateBtn.disabled = false;
          aiGenerateBtn.innerHTML = '<i data-lucide="play" class="mr-1.5 w-4 h-4"></i>AI社員に作?を依頼する';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      } else {
        // 通常のリアルAI生?モード（パー?あり??
        addChatMessage(employees.takumi, `CEO、ご要望を承りました?リクエスト?${customPrompt || theme}」につ?て、これからアオイと相?して最適な部屋を作ります！`);
        
        try {
          const responseText = await callGeminiApiForLayout(apiKey, theme, numPlayers, layoutType, customPrompt);
          let cleanedJson = responseText.replace(/```json|```/g, '').trim();
          const responseData = JSON.parse(cleanedJson);
          
          // 議論ログを?次表示
          const steps = responseData.discussion || [];
          for (let idx = 0; idx < steps.length; idx++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const msg = steps[idx];
            const speakerObj = msg.speaker === 'aoi' ? employees.aoi : employees.takumi;
            addChatMessage(speakerObj, msg.text);
          }
          
          let bgImageUrl = null;
          if (genBg) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addChatMessage(employees.aoi, "要望に合わせた背景のモ?リング?画像生成）を開始する??数秒かかるから?っててね?");
            
            try {
              const styleDesc = responseData.design.style_description || "beautiful illustration";
              const basePrompt = customPrompt || theme;
              const imagenPrompt = `A beautiful background illustration for a TRPG room session on CCfolia, thematic to ${basePrompt}. Style is ${styleDesc}. ${responseData.design.bg_gradient_start ? `using color palette near ${responseData.design.bg_gradient_start} and ${responseData.design.bg_gradient_end}.` : ""} Dark, atmospheric, high quality digital art, 16:9 aspect ratio, clean, absolutely no text, no labels, no letters, no numbers, no words. Avoid any UI elements or text overlays on the image.`;
              
              const imageBytes = await callImagenApiForBackground(apiKey, imagenPrompt);
              bgImageUrl = `data:image/png;base64,${imageBytes}`;
              
              await new Promise(resolve => setTimeout(resolve, 500));
              addChatMessage(employees.aoi, "背景アセ?ト?画像生成が完?したよ！キャンバスにロードする???");
            } catch (imgErr) {
              console.error(imgErr);
              await new Promise(resolve => setTimeout(resolve, 500));
              if (imgErr.message.includes('429')) {
                addChatMessage(employees.takumi, `背景画像?生?制限（レートリミット?429?に達しました。少し時間を置?てから再試行するか、安?のため一時的にSVGグラ?ーション背景で代行します。`);
              } else {
                addChatMessage(employees.takumi, `背景画像?生?中にエラーが発生しました (${imgErr.message})。安?のため、SVGグラ?ーション背景で代行します。`);
              }
            }
          }

          let partsImageUrl = null;
          if (genParts && bgImageUrl) {
            partsImageUrl = bgImageUrl;
            await new Promise(resolve => setTimeout(resolve, 500));
            addChatMessage(employees.aoi, "背景画像から各パ???メイン枠?立ち絵枠など?をシームレスに?り?して合?する???");
          }

          await new Promise(resolve => setTimeout(resolve, 1500));
          addChatMessage(employees.aoi, `?ザイン設計完???${responseData.design.style_description}」テーマ?部屋レイアウトをキャンバスに出力したよ?`);
          
          // dynamic?ーマ?レイアウト生?
          await generateAndLoadDynamicLayout(responseData.design, numPlayers, layoutType, bgImageUrl, partsImageUrl);
          
        } catch (err) {
          console.error(err);
          addChatMessage(employees.takumi, `申し訳ありません、API連携中にエラーが発生しました (${err.message})。安?のため、デフォルト??ーマで代行して生?します。`);
          
          // ?モモードへフォールバック
          await new Promise(resolve => setTimeout(resolve, 1000));
          const fallbackTheme = theme === 'custom' ? 'cyberpunk' : theme;
          await generateAndLoadLayout(fallbackTheme, numPlayers, layoutType);
        } finally {
          aiGenerateBtn.disabled = false;
          aiGenerateBtn.innerHTML = '<i data-lucide="play" class="mr-1.5 w-4 h-4"></i>AI社員に作?を依頼する';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      }
      
    } else {
      // 従来通りのモ?ク?モモー?
      const themeNames = {
        custom: 'AIにおまかせ',
        cyberpunk: 'サイバ?パンク',
        horror: '和風ホラー',
        classic: 'クラシ?ク洋館',
        fantasy: 'ファンタジー・魔?'
      };
      const selectedThemeVal = theme === 'custom' ? 'cyberpunk' : theme;
      const themeName = themeNames[theme];

      let layoutName = '右側縦並び';
      if (layoutType === 'bottom-horizontal') layoutName = '下部横並び';
      else if (layoutType.startsWith('pattern')) {
        const pNum = layoutType.replace('pattern', '');
        layoutName = `パターン${pNum}`;
      }

      setTimeout(() => {
        if (bgOnly) {
          addChatMessage(employees.takumi, `CEO、ご?示ありがと?ござ?ます！今回はパ??を?置せず、テーマ?${themeName}】に沿って1枚絵の?モ画像を出力します?。`);
        } else {
          addChatMessage(employees.takumi, `CEO、ご?示ありがと?ござ?ます！テーマ?${themeName}】、人数?${numPlayers}人】?配置?${layoutName}】です?。さっそく企画立案しました。`);
        }
        
        setTimeout(() => {
          if (bgOnly) {
            addChatMessage(employees.aoi, `?解?キャンバスに合わせた比率で1枚?ココフォリア背景?デモ?を描画するね?`);
          } else {
            addChatMessage(employees.aoi, `任せて??${themeName}】?雰囲気を最大限に引き出すカラーパレ?トで背景とパネル?飾を今からモ?リングするね。パー?生?スタート！`);
          }
          
          setTimeout(() => {
            if (!bgOnly) {
              addChatMessage(employees.takumi, `前景くり抜き窓?中央左、PLパネルは?定?置に。メニュー用とクリ?クアクション用?目星、聞き耳、図書館、アイ?ア、SAN、塩??ボタンを綺麗に自動整列させます！`);
            }
            
            if (genBg) {
              setTimeout(() => {
                addChatMessage(employees.aoi, `背景アセ?ト用のイメージ画像（デモ?を取得する?。`);
                
                setTimeout(async () => {
                  addChatMessage(employees.aoi, `画像?読み込みが完?したよ！キャンバスに自動レイアウトを出力する??CEO?`);
                  
                  let mockBgUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1280&q=80"; // ジェネリ?クなグラ?ーション
                  if (customPrompt.includes("彼岸花")) {
                    mockBgUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80"; // ダーク赤?
                  }
                  
                  if (bgOnly) {
                    frame = {
                      url: mockBgUrl,
                      x: 0,
                      y: 0,
                      width: canvasWidth,
                      height: canvasHeight,
                      originalRatio: canvasWidth / canvasHeight
                    };
                    panels = [];
                    selectedPanelIds = [];
                    updateUI();
                  } else {
                    let mockPartsUrl = genParts ? mockBgUrl : null;
                    await generateAndLoadLayout(selectedThemeVal, numPlayers, layoutType, mockBgUrl, mockPartsUrl);
                  }
                  
                  aiGenerateBtn.disabled = false;
                  aiGenerateBtn.innerHTML = '<i data-lucide="play" class="mr-1.5 w-4 h-4"></i>AI社員に作?を依頼する';
                  if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 1500);
              }, 1500);
            } else {
              setTimeout(async () => {
                addChatMessage(employees.aoi, `?み立て完?したよ！キャンバスに出力したから確認してみて?CEO?`);
                
                let mockBgUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1280&q=80";
                
                if (bgOnly) {
                  frame = {
                    url: mockBgUrl,
                    x: 0,
                    y: 0,
                    width: canvasWidth,
                    height: canvasHeight,
                    originalRatio: canvasWidth / canvasHeight
                  };
                  panels = [];
                  selectedPanelIds = [];
                  updateUI();
                } else {
                  let mockPartsUrl = genParts ? mockBgUrl : null;
                  await generateAndLoadLayout(selectedThemeVal, numPlayers, layoutType, null, mockPartsUrl);
                }
                
                aiGenerateBtn.disabled = false;
                aiGenerateBtn.innerHTML = '<i data-lucide="play" class="mr-1.5 w-4 h-4"></i>AI社員に作?を依頼する';
                if (typeof lucide !== 'undefined') lucide.createIcons();
              }, 1500);
            }
          }, 1500);
        }, 1500);
      }, 500);
    }
  });
}

async function generateAndLoadLayout(theme, numPlayers, layoutType, bgImageUrl, partsImageUrl) {
  saveStateToHistory();
  
  const gen = themeSvgGenerators[theme];
  if (!gen) return;

  frame = null;
  panels = [];
  selectedPanelIds = [];

  if (bgImageUrl) {
    frame = {
      url: bgImageUrl,
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      originalRatio: canvasWidth / canvasHeight
    };
  } else {
    const bgSvg = gen.bg();
    frame = {
      url: createSvgUrl(bgSvg),
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      originalRatio: canvasWidth / canvasHeight
    };
  }

  let partsImg = null;
  const genParts = aiGenPartsToggle ? aiGenPartsToggle.checked : false;
  if (genParts && partsImageUrl) {
    partsImg = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = partsImageUrl;
    });
  }

  let windowW = 720;
  let windowH = 405;
  let windowX = 50;
  let windowY = 110;

  if (layoutType === 'bottom-horizontal') {
    windowX = 280;
    windowY = 50;
  } else if (layoutType === 'pattern1') {
    windowX = 50; windowY = 50; windowW = 500; windowH = 300;
  } else if (layoutType === 'pattern2') {
    windowX = 50; windowY = 370; windowW = 500; windowH = 300;
  } else if (layoutType === 'pattern3') {
    windowX = 350; windowY = 80; windowW = 700; windowH = 320;
  } else if (layoutType === 'pattern4') {
    windowX = 720; windowY = 50; windowW = 500; windowH = 320;
  } else if (layoutType === 'pattern5') {
    windowX = 280; windowY = 80; windowW = 720; windowH = 320;
  } else if (layoutType === 'pattern6') {
    windowX = 150; windowY = 50; windowW = 980; windowH = 300;
  } else if (layoutType === 'pattern7') {
    windowX = 150; windowY = 440; windowW = 980; windowH = 250;
  }

  const windowSvg = gen.window();
  let windowUrl = createSvgUrl(windowSvg);
  if (partsImg) {
    const scaleX = partsImg.naturalWidth / canvasWidth;
    const scaleY = partsImg.naturalHeight / canvasHeight;
    windowUrl = await combineImageAndSvg(
      partsImg,
      windowX * scaleX, windowY * scaleY,
      windowW * scaleX, windowH * scaleY,
      windowSvg, windowW, windowH
    );
  }

  panels.push({
    id: 'ai-window-' + Date.now(),
    url: windowUrl,
    x: windowX,
    y: windowY,
    width: windowW,
    height: windowH,
    originalRatio: windowW / windowH,
    flipH: false,
    flipV: false,
    visible: true,
    opacity: 1
  });

  let plW = 160;
  let plH = 170;
  if (layoutType === 'right-vertical') {
    if (numPlayers <= 3) { plW = 180; plH = 200; }
    else if (numPlayers === 4) { plW = 170; plH = 150; }
    else { plW = 160; plH = 120; }
  } else if (layoutType === 'bottom-horizontal') {
    plW = 160; plH = 170;
  } else if (layoutType === 'pattern1' || layoutType === 'pattern2' || layoutType === 'pattern4') {
    plW = 140; plH = 350;
  } else if (layoutType === 'pattern3' || layoutType === 'pattern5') {
    plW = 140; plH = 260;
  } else if (layoutType === 'pattern6') {
    plW = 140; plH = 180;
  } else if (layoutType === 'pattern7') {
    plW = 180; plH = 280;
  }

  for (let i = 0; i < numPlayers; i++) {
    let plX = 1050;
    let plY = 40;
    
    if (layoutType === 'right-vertical') {
      plX = 1050;
      if (numPlayers === 1) {
        plY = 260;
      } else {
        plY = 40 + i * (640 - plH) / (numPlayers - 1);
      }
    } else if (layoutType === 'bottom-horizontal') {
      plY = 510;
      if (numPlayers === 1) {
        plX = 660;
      } else {
        plX = 280 + i * (720 - plW) / (numPlayers - 1);
      }
    } else if (layoutType === 'pattern1') {
      plY = 150;
      if (numPlayers === 1) {
        plX = 600;
      } else {
        plX = 600 + i * 160;
      }
    } else if (layoutType === 'pattern2') {
      plY = 220;
      if (numPlayers === 1) {
        plX = 600;
      } else {
        plX = 600 + i * 160;
      }
    } else if (layoutType === 'pattern3') {
      plY = 430;
      if (numPlayers === 1) {
        plX = 630;
      } else {
        plX = 300 + i * 160;
      }
    } else if (layoutType === 'pattern4') {
      plY = 50;
      if (numPlayers === 1) {
        plX = 290;
      } else {
        plX = 50 + i * 160;
      }
    } else if (layoutType === 'pattern5') {
      plY = 420;
      if (numPlayers === 1) {
        plX = 570;
      } else {
        plX = 280 + i * 180;
      }
    } else if (layoutType === 'pattern6') {
      plY = 510;
      if (numPlayers === 1) {
        plX = 570;
      } else {
        plX = 150 + i * 260;
      }
    } else if (layoutType === 'pattern7') {
      plY = 80;
      if (numPlayers === 1) {
        plX = 550;
      } else {
        plX = 150 + i * 260;
      }
    }

    const plSvg = gen.pl(null, plW, plH);
    let plUrl = createSvgUrl(plSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      plUrl = await combineImageAndSvg(
        partsImg,
        plX * scaleX, plY * scaleY,
        plW * scaleX, plH * scaleY,
        plSvg, plW, plH
      );
    }

    panels.push({
      id: `ai-pl-${i}-${Date.now()}`,
      url: plUrl,
      x: plX,
      y: plY,
      width: plW,
      height: plH,
      originalRatio: plW / plH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  const menuLabels = ["houserule", "battle", "insanity", "growth", "other"];
  
  let menuLayout = 'horizontal';
  if (layoutType === 'bottom-horizontal' || layoutType === 'pattern1' || layoutType === 'pattern2' || layoutType === 'pattern3' || layoutType === 'pattern4') {
    menuLayout = 'vertical';
  } else {
    menuLayout = 'horizontal';
  }

  const menuW = (menuLayout === 'horizontal') ? 180 : 130;
  const menuH = (menuLayout === 'horizontal') ? 36 : 32;

  for (let i = 0; i < menuLabels.length; i++) {
    const label = menuLabels[i];
    const menuSvg = gen.menu(label);
    let menuX = 50;
    let menuY = 50;

    if (layoutType === 'right-vertical') {
      menuY = 50;
      menuX = 50 + i * 145;
    } else if (layoutType === 'bottom-horizontal') {
      menuX = 50;
      menuY = 50 + i * 55;
    } else if (layoutType === 'pattern1') {
      menuX = 120;
      menuY = 380 + i * 40;
    } else if (layoutType === 'pattern2') {
      menuX = 120;
      menuY = 50 + i * 40;
    } else if (layoutType === 'pattern3') {
      menuX = 50;
      menuY = 100 + i * 40;
    } else if (layoutType === 'pattern4') {
      menuX = 50;
      menuY = 430 + i * 40;
    } else if (layoutType === 'pattern5') {
      menuX = 200 + i * 195;
      menuY = 30;
    } else if (layoutType === 'pattern6') {
      menuX = 150 + i * 195;
      menuY = 370;
    } else if (layoutType === 'pattern7') {
      menuX = 150 + i * 195;
      menuY = 30;
    }

    let menuUrl = createSvgUrl(menuSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      menuUrl = await combineImageAndSvg(
        partsImg,
        menuX * scaleX, menuY * scaleY,
        menuW * scaleX, menuH * scaleY,
        menuSvg, menuW, menuH
      );
    }

    panels.push({
      id: `ai-menu-${label}-${Date.now()}`,
      url: menuUrl,
      x: menuX,
      y: menuY,
      width: menuW,
      height: menuH,
      originalRatio: menuW / menuH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  const actionW = 75;
  const actionH = 75;

  for (let i = 0; i < actionIconsData.length; i++) {
    const icon = actionIconsData[i];
    const actionSvg = gen.action(icon.label, icon.sub, icon.path);
    let actionX = 50;
    let actionY = 550;

    if (layoutType === 'right-vertical') {
      actionY = 550;
      actionX = 50 + i * 125;
    } else if (layoutType === 'bottom-horizontal') {
      actionX = 50 + (i % 2) * 90;
      actionY = 350 + Math.floor(i / 2) * 90;
    } else if (layoutType === 'pattern1') {
      actionX = 600 + i * 90;
      actionY = 530;
    } else if (layoutType === 'pattern2') {
      actionX = 600 + i * 90;
      actionY = 110;
    } else if (layoutType === 'pattern3') {
      actionX = 950;
      actionY = 430 + i * 45;
    } else if (layoutType === 'pattern4') {
      actionX = 300 + i * 90;
      actionY = 500;
    } else if (layoutType === 'pattern5') {
      actionX = 360 + i * 90;
      actionY = 600;
    } else if (layoutType === 'pattern6') {
      actionX = 150 + i * 90;
      actionY = 430;
    } else if (layoutType === 'pattern7') {
      actionX = 150 + i * 90;
      actionY = 380;
    }

    let actionUrl = createSvgUrl(actionSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      actionUrl = await combineImageAndSvg(
        partsImg,
        actionX * scaleX, actionY * scaleY,
        actionW * scaleX, actionH * scaleY,
        actionSvg, actionW, actionH
      );
    }

    panels.push({
      id: `ai-action-${icon.name}-${Date.now()}`,
      url: actionUrl,
      x: actionX,
      y: actionY,
      width: actionW,
      height: actionH,
      originalRatio: actionW / actionH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  updateUI();
}

async function generateAndLoadDynamicLayout(design, numPlayers, layoutType, bgImageUrl, partsImageUrl) {
  saveStateToHistory();
  
  const gen = themeSvgGenerators.dynamic;

  frame = null;
  panels = [];
  selectedPanelIds = [];

  if (bgImageUrl) {
    frame = {
      url: bgImageUrl,
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      originalRatio: canvasWidth / canvasHeight
    };
  } else if (design && design.no_background) {
    frame = null;
    canvasBgColor = 'transparent';
  } else {
    const bgSvg = gen.bg(design);
    frame = {
      url: createSvgUrl(bgSvg),
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      originalRatio: canvasWidth / canvasHeight
    };
  }

  let partsImg = null;
  const genParts = aiGenPartsToggle ? aiGenPartsToggle.checked : false;
  if (genParts && partsImageUrl) {
    partsImg = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = partsImageUrl;
    });
  }

  // 1. メイン画面の描画
  const windowSvg = gen.window(design);
  const windowPanelWidth = design.window_width !== undefined ? design.window_width : 720;
  const windowPanelHeight = design.window_height !== undefined ? design.window_height : 405;
  let windowX = design.window_x !== undefined ? design.window_x : 50;
  let windowY = design.window_y !== undefined ? design.window_y : 110;

  if (design.window_x === undefined) {
    // 従来のフォールバック計?
    if (layoutType === 'bottom-horizontal') {
      windowX = 280;
      windowY = 50;
    }
  }

  let windowUrl = createSvgUrl(windowSvg);
  if (partsImg) {
    const scaleX = partsImg.naturalWidth / canvasWidth;
    const scaleY = partsImg.naturalHeight / canvasHeight;
    windowUrl = await combineImageAndSvg(
      partsImg,
      windowX * scaleX, windowY * scaleY,
      windowPanelWidth * scaleX, windowPanelHeight * scaleY,
      windowSvg, windowPanelWidth, windowPanelHeight
    );
  }

  panels.push({
    id: 'ai-window-' + Date.now(),
    url: windowUrl,
    x: windowX,
    y: windowY,
    width: windowPanelWidth,
    height: windowPanelHeight,
    originalRatio: windowPanelWidth / windowPanelHeight,
    flipH: false,
    flipV: false,
    visible: true,
    opacity: 1
  });

  // 2. PLパネルの描画
  const plPanelsData = design.pl_panels || [];
  for (let i = 0; i < numPlayers; i++) {
    let plX = 1050;
    let plY = 40;
    let plW = 160;
    let plH = 170;

    if (plPanelsData[i]) {
      plX = plPanelsData[i].x !== undefined ? plPanelsData[i].x : plX;
      plY = plPanelsData[i].y !== undefined ? plPanelsData[i].y : plY;
      plW = plPanelsData[i].width !== undefined ? plPanelsData[i].width : plW;
      plH = plPanelsData[i].height !== undefined ? plPanelsData[i].height : plH;
    } else {
      // 従来のフォールバック計?
      if (layoutType === 'right-vertical') {
        if (numPlayers <= 3) { plW = 180; plH = 200; }
        else if (numPlayers === 4) { plW = 170; plH = 150; }
        else { plW = 160; plH = 120; }
        
        plX = 1050;
        if (numPlayers === 1) {
          plY = 260;
        } else {
          plY = 40 + i * (640 - plH) / (numPlayers - 1);
        }
      } else {
        plW = 160;
        plH = 170;
        plY = 510;
        if (numPlayers === 1) {
          plX = 660;
        } else {
          plX = 280 + i * (720 - plW) / (numPlayers - 1);
        }
      }
    }

    const plSvg = gen.pl(design, plW, plH);
    let plUrl = createSvgUrl(plSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      plUrl = await combineImageAndSvg(
        partsImg,
        plX * scaleX, plY * scaleY,
        plW * scaleX, plH * scaleY,
        plSvg, plW, plH
      );
    }

    panels.push({
      id: `ai-pl-${i}-${Date.now()}`,
      url: plUrl,
      x: plX,
      y: plY,
      width: plW,
      height: plH,
      originalRatio: plW / plH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  // 3. メニューボタンの描画
  const menuLabels = ["houserule", "battle", "insanity", "growth", "other"];
  const menuLayoutType = design.menu_layout || ((layoutType === 'bottom-horizontal') ? 'horizontal' : 'vertical');
  const menuW = (menuLayoutType === 'horizontal') ? 180 : 130;
  const menuH = (menuLayoutType === 'horizontal') ? 36 : 32;

  let baseMenuX = design.menu_x !== undefined ? design.menu_x : 50;
  let baseMenuY = design.menu_y !== undefined ? design.menu_y : 50;

  if (design.menu_x === undefined) {
    // 従来のフォールバック計?
    if (layoutType === 'right-vertical') {
      baseMenuY = 50;
      baseMenuX = 50;
    } else {
      baseMenuX = 50;
      baseMenuY = 50;
    }
  }

  for (let i = 0; i < menuLabels.length; i++) {
    const label = menuLabels[i];
    const menuSvg = gen.menu(design, label);
    let menuX = baseMenuX;
    let menuY = baseMenuY;

    if (design.menu_x === undefined) {
      if (layoutType === 'right-vertical') {
        menuY = 50;
        menuX = 50 + i * 145;
      } else {
        menuX = 50;
        menuY = 50 + i * 55;
      }
    } else {
      if (menuLayoutType === 'horizontal') {
        menuX = baseMenuX + i * (menuW + 15);
      } else {
        menuY = baseMenuY + i * (menuH + 10);
      }
    }

    let menuUrl = createSvgUrl(menuSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      menuUrl = await combineImageAndSvg(
        partsImg,
        menuX * scaleX, menuY * scaleY,
        menuW * scaleX, menuH * scaleY,
        menuSvg, menuW, menuH
      );
    }

    panels.push({
      id: `ai-menu-${label}-${Date.now()}`,
      url: menuUrl,
      x: menuX,
      y: menuY,
      width: menuW,
      height: menuH,
      originalRatio: menuW / menuH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  // 4. アクションアイコンの描画
  const actionW = 75;
  const actionH = 75;
  const baseActionX = design.action_x !== undefined ? design.action_x : 50;
  const baseActionY = design.action_y !== undefined ? design.action_y : 550;

  for (let i = 0; i < actionIconsData.length; i++) {
    const icon = actionIconsData[i];
    const actionSvg = gen.action(design, icon.label, icon.sub, icon.path);
    let actionX = baseActionX;
    let actionY = baseActionY;

    if (design.action_x === undefined) {
      if (layoutType === 'right-vertical') {
        actionY = 550;
        actionX = 50 + i * 125;
      } else {
        actionX = 50 + (i % 2) * 90;
        actionY = 350 + Math.floor(i / 2) * 90;
      }
    } else {
      actionX = baseActionX + i * (actionW + 15);
    }

    let actionUrl = createSvgUrl(actionSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      actionUrl = await combineImageAndSvg(
        partsImg,
        actionX * scaleX, actionY * scaleY,
        actionW * scaleX, actionH * scaleY,
        actionSvg, actionW, actionH
      );
    }

    panels.push({
      id: `ai-action-${icon.name}-${Date.now()}`,
      url: actionUrl,
      x: actionX,
      y: actionY,
      width: actionW,
      height: actionH,
      originalRatio: actionW / actionH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  updateUI();
}

