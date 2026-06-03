// アイコンの初期化
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// === 状態管理（データ） ===
let frame = null; // { url: url, x: 0, y: 0, width: 1280, height: 720 }
let panels = [];
let selectedPanelId = null; // 'frame', またはパネルのid
let copiedPanelData = null; // コピーされたパネルデータ
let zoomScale = null; // null は自動フィット、数値は固定倍率
let actionHistory = []; // 操作履歴スタック

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

let canvasWidth = 1280;
let canvasHeight = 720;
let showGrid = false;
let snapToGrid = false;

// === DOM要素の取得 ===
const canvasArea = document.getElementById('canvas-area');
const panelList = document.getElementById('panel-list');
const panelCount = document.getElementById('panel-count');
const clearFrameBtn = document.getElementById('clear-frame-btn');
const editFrameBtn = document.getElementById('edit-frame-btn');
const replacePanelUpload = document.getElementById('replace-panel-upload');
const undoActionBtn = document.getElementById('undo-action-btn');

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
    selectedPanelId: selectedPanelId
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
  selectedPanelId = prevState.selectedPanelId;
  
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
// データが変わるたびにこの関数を呼んで、画面を書き換えます
function updateUI() {
  // 1. キャンバスの再描画
  canvasArea.innerHTML = ''; // 一旦空にする

  canvasArea.style.width = `${canvasWidth}px`;
  canvasArea.style.height = `${canvasHeight}px`;

  const sizeDisplay = document.getElementById('size-display');
  if (sizeDisplay) {
    sizeDisplay.innerText = `${canvasWidth} x ${canvasHeight}`;
  }

  // フレームの描画
  if (frame) {
    const frameEl = document.createElement('div');
    const isSelected = selectedPanelId === 'frame';
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
    
    if (isSelected) {
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
    const isSelected = selectedPanelId === panel.id;
    
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

    // 選択中ならリサイズ用のツマミとクイックツールバーを表示
    if (isSelected) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm z-30';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      pEl.appendChild(resizeHandle);

      // クイックツールバー
      const toolbar = document.createElement('div');
      // Y座標が 50px 未満なら下側に配置、そうでなければ上側に配置
      if (panel.y < 50) {
        toolbar.className = 'quick-toolbar absolute top-full mt-2 left-1/2 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 flex items-center gap-1.5 shadow-xl z-30 pointer-events-auto origin-top';
      } else {
        toolbar.className = 'quick-toolbar absolute -top-11 left-1/2 bg-gray-800 border border-gray-600 rounded px-1.5 py-1 flex items-center gap-1.5 shadow-xl z-30 pointer-events-auto origin-bottom';
      }
      
      // ツールバー上でのmousedownがパネルのドラッグを引き起こさないようにバブリングを防止
      toolbar.addEventListener('mousedown', (e) => {
        e.stopPropagation();
      });
      
      // index を探す
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
        if (selectedPanelId === panel.id) selectedPanelId = null;
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
        selectedPanelId = null;
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

  // 2. パネルリストの再描画 (レイヤー構造：上が手前)
  panelCount.innerText = panels.length;
  panelList.innerHTML = '';
  if (panels.length === 0) {
    panelList.innerHTML = '<p class="text-xs text-gray-500">パネルはありません</p>';
  } else {
    const panelsReversed = [...panels].reverse();
    panelsReversed.forEach((panel, revIndex) => {
      const index = panels.length - 1 - revIndex;
      const li = document.createElement('li');
      const isSelected = selectedPanelId === panel.id;
      li.className = `flex items-center justify-between p-2 rounded bg-gray-800 border cursor-pointer ${isSelected ? 'border-blue-500' : 'border-gray-600'}`;
      li.onclick = () => {
        selectedPanelId = panel.id;
        updateUI();
      };

      const span = document.createElement('span');
      span.className = 'text-sm truncate flex-grow';
      span.innerText = `パネル ${index + 1}`;
      li.appendChild(span);

      const btnContainer = document.createElement('div');
      btnContainer.className = 'flex items-center gap-1.5';

      // 上へ移動（前面へ ＝ 配列インデックスを増やす）
      const upBtn = document.createElement('button');
      upBtn.className = `text-gray-400 hover:text-blue-400 ${index === panels.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`;
      upBtn.innerHTML = '<i data-lucide="chevron-up" class="w-4 h-4"></i>';
      upBtn.disabled = index === panels.length - 1;
      upBtn.onclick = (e) => {
        e.stopPropagation();
        movePanel(index, index + 1);
      };
      btnContainer.appendChild(upBtn);

      // 下へ移動（背面へ ＝ 配列インデックスを減らす）
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
        if (!panel.visible && selectedPanelId === panel.id) {
          selectedPanelId = null; // 非表示にしたら選択解除
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
        if (selectedPanelId === panel.id) selectedPanelId = null;
        updateUI();
      };
      btnContainer.appendChild(trashBtn);

      li.appendChild(btnContainer);
      panelList.appendChild(li);
    });
    if (typeof lucide !== 'undefined') {
      lucide.createIcons(); // 新しく追加したアイコンを描画
    }
  }

  // 3. クリアボタンの表示/非表示
  clearFrameBtn.style.display = frame ? 'block' : 'none';
  editFrameBtn.style.display = frame ? 'block' : 'none';

  // 3.5 操作履歴「一つ戻る」ボタンの制御
  if (undoActionBtn) {
    undoActionBtn.disabled = actionHistory.length === 0;
  }

  // 4. 表示スケールの調整
  updateCanvasScale();
}

// === 画像の読み込み処理 ===
function handleFileUpload(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const imageUrl = e.target.result;
    
    // 画像オブジェクトを作成してアスペクト比を計測
    const img = new Image();
    img.onload = () => {
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;
      const originalRatio = originalWidth / originalHeight;
      
      if (type === 'frame') {
        saveStateToHistory();
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
        selectedPanelId = 'frame';
      } else if (type === 'panel') {
        saveStateToHistory();
        // パネルは最大200x200に収まるようにアスペクト比を維持
        const scale = Math.min(1, 200 / originalWidth, 200 / originalHeight);
        const initWidth = originalWidth * scale;
        const initHeight = originalHeight * scale;
        
        const newPanel = {
          id: Date.now().toString(),
          url: imageUrl,
          x: (canvasWidth - initWidth) / 2,
          y: (canvasHeight - initHeight) / 2,
          width: initWidth,
          height: initHeight,
          originalRatio: originalRatio,
          flipH: false,
          flipV: false,
          visible: true,
          opacity: 1
        };
        panels.push(newPanel);
        selectedPanelId = newPanel.id;
      }
      updateUI();
    };
    img.src = imageUrl;
  };
  reader.readAsDataURL(file);
  event.target.value = ''; // 同じ画像を連続で選べるようにリセット
}

// イベントリスナーの登録
document.getElementById('frame-upload').addEventListener('change', (e) => handleFileUpload(e, 'frame'));
document.getElementById('panel-upload').addEventListener('change', (e) => handleFileUpload(e, 'panel'));

clearFrameBtn.addEventListener('click', () => { 
  saveStateToHistory();
  frame = null; 
  if (selectedPanelId === 'frame') selectedPanelId = null;
  updateUI(); 
});

// === ドラッグ＆ドロップ、リサイズの処理 ===
function handleSpecialMouseDown(e, type) {
  e.stopPropagation();
  saveStateToHistory();
  
  const wasSelected = selectedPanelId === type;
  selectedPanelId = type;
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
  }
  
  if (!wasSelected) {
    updateUI();
  }
}

function handlePanelMouseDown(e, panelId) {
  e.stopPropagation();
  saveStateToHistory();
  
  const wasSelected = selectedPanelId === panelId;
  selectedPanelId = panelId;
  const panel = panels.find(p => p.id === panelId);
  
  const rect = canvasArea.getBoundingClientRect();
  const scale = rect.width / canvasWidth;

  if (e.target.classList.contains('resize-handle')) {
    isResizing = true;
  } else {
    isDragging = true;
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;
    dragOffset.x = mouseX - panel.x;
    dragOffset.y = mouseY - panel.y;
  }
  
  if (!wasSelected) {
    updateUI();
  }
}

// 画面全体でマウスの動きを監視
window.addEventListener('mousemove', (e) => {
  if (!isDragging && !isResizing) return;
  if (!selectedPanelId) return;

  const rect = canvasArea.getBoundingClientRect();
  const scale = rect.width / canvasWidth;
  
  const mouseX = (e.clientX - rect.left) / scale;
  const mouseY = (e.clientY - rect.top) / scale;
  
  let target = null;
  if (selectedPanelId === 'frame') {
    target = frame;
  } else {
    target = panels.find(p => p.id === selectedPanelId);
  }

  if (!target) return;

  if (isDragging) {
    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;
    if (snapToGrid) {
      newX = Math.round(newX / 24) * 24;
      newY = Math.round(newY / 24) * 24;
    }
    target.x = newX;
    target.y = newY;
  } else if (isResizing) {
    let newWidth = mouseX - target.x;
    let newHeight = mouseY - target.y;

    // Shiftキー押下時にアスペクト比を維持
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

// マウスを離した時
window.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
});

// キャンバスの背景をクリックした時は選択解除
canvasArea.addEventListener('mousedown', () => {
  if (selectedPanelId !== null) {
    saveStateToHistory();
  }
  selectedPanelId = null;
  updateUI();
});

// === スケール更新関数 ===
function updateCanvasScale() {
  const wrapper = document.getElementById('canvas-wrapper');
  if (!wrapper) return;
  const rect = wrapper.getBoundingClientRect();
  
  // ラッパーの幅や高さが取得できない、または極端に小さい場合はデフォルト1倍にする
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
    // 自動フィット
    const pad = 32; // 余白
    const maxW = rect.width - pad;
    const maxH = rect.height - pad;
    const scaleX = maxW / canvasWidth;
    const scaleY = maxH / canvasHeight;
    scale = Math.max(0.05, Math.min(1, scaleX, scaleY));
  } else {
    // 固定ズーム
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

// キャンバス設定のイベントハンドラ
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

gridShowToggle.addEventListener('change', (e) => {
  showGrid = e.target.checked;
  updateUI();
});

gridSnapToggle.addEventListener('change', (e) => {
  snapToGrid = e.target.checked;
  updateUI();
});

// 初期状態の同期
gridShowToggle.checked = showGrid;
gridSnapToggle.checked = snapToGrid;
canvasSizeSelect.value = `${canvasWidth}x${canvasHeight}`;

// パネルの順序移動関数 (インデックスの入れ替え)
function movePanel(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= panels.length) return;
  saveStateToHistory();
  const element = panels[fromIndex];
  panels.splice(fromIndex, 1);
  panels.splice(toIndex, 0, element);
  updateUI();
}

// パネル複製関数
function duplicatePanel(panel) {
  saveStateToHistory();
  const offset = snapToGrid ? 24 : 20;
  const newPanel = {
    ...panel,
    id: Date.now().toString(),
    x: panel.x + offset,
    y: panel.y + offset,
    flipH: panel.flipH || false,
    flipV: panel.flipV || false
  };
  panels.push(newPanel);
  selectedPanelId = newPanel.id;
  updateUI();
}

// パネルを最前面/最背面に移動する関数
function movePanelToExtremity(index, toFront) {
  if (index < 0 || index >= panels.length) return;
  const element = panels[index];
  panels.splice(index, 1);
  if (toFront) {
    panels.push(element); // 最前面（末尾）
  } else {
    panels.unshift(element); // 最背面（先頭）
  }
  updateUI();
}

// キーボードショートカットの登録 (Ctrl+C / Ctrl+V / Ctrl+Z)
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
    return;
  }

  // Ctrl+C / Cmd+C (コピー)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedPanelId && selectedPanelId !== 'frame') {
      const panel = panels.find(p => p.id === selectedPanelId);
      if (panel) {
        copiedPanelData = { ...panel };
        e.preventDefault();
      }
    }
  }

  // Ctrl+V / Cmd+V (ペースト)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (copiedPanelData) {
      duplicatePanel(copiedPanelData);
      e.preventDefault();
    }
  }

  // Ctrl+Z / Cmd+Z (元に戻す)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    undoAction();
    e.preventDefault();
  }
});

// === PNG画像のエクスポート処理 ===
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

    // 描画タスクのリスト
    const drawTasks = [];

    // 画像ロード用のPromise生成ヘルパー
    const loadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CORS対策
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('画像のロードに失敗しました'));
        img.src = url;
      });
    };

    // 2. フレームの描画タスク
    if (frame) {
      drawTasks.push(loadImage(frame.url).then(img => {
        return { img, x: frame.x, y: frame.y, w: frame.width, h: frame.height };
      }));
    }

    // 3. 各パネルの描流タスク (表示されているパネルのみ)
    panels.forEach(panel => {
      if (panel.visible === false) return; // 非表示はスキップ
      
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

    // すべての画像を並列で読み込み
    const renderItems = await Promise.all(drawTasks);

    // キャンバスに描画
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

    // PNGファイルを生成してダウンロード
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `cocfolia_layout_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

  } catch (error) {
    console.error(error);
    alert('画像の出力中にエラーが発生しました。');
  } finally {
    exportBtn.disabled = false;
    exportBtn.innerHTML = originalText;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// エクスポートボタンのイベント登録
const exportBtnElement = document.getElementById('export-btn');
if (exportBtnElement) {
  exportBtnElement.addEventListener('click', exportToPNG);
}

// === フレーム画像編集モーダルの処理関数 ===

function openFrameEditModal() {
  if (!frame) return;
  
  editOriginalUrl = frame.url;
  editHistory = [];
  undoBtn.disabled = true;
  setTool('free');
  
  // モーダルを表示
  frameEditModal.classList.remove('hidden');
  
  // 画像をロードしてCanvasに描画
  editImage = new Image();
  editImage.onload = () => {
    frameEditCanvas.width = editImage.naturalWidth;
    frameEditCanvas.height = editImage.naturalHeight;
    const ctx = frameEditCanvas.getContext('2d');
    ctx.clearRect(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    ctx.drawImage(editImage, 0, 0);
    
    // 最初の状態を履歴に追加
    saveHistoryState();
  };
  editImage.src = frame.url;
}

function closeFrameEditModal() {
  frameEditModal.classList.add('hidden');
  editImage = null;
}

function saveHistoryState() {
  const ctx = frameEditCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, frameEditCanvas.width, frameEditCanvas.height);
  editHistory.push(imgData);
  
  // 履歴が2件以上（初期状態 + 1回以上の編集）あればUndo可能
  undoBtn.disabled = editHistory.length <= 1;
}

function undoEdit() {
  if (editHistory.length <= 1) return;
  
  // 最新（現在の状態）をポップ
  editHistory.pop();
  
  // 1つ前の状態を復元
  const prevState = editHistory[editHistory.length - 1];
  const ctx = frameEditCanvas.getContext('2d');
  ctx.putImageData(prevState, 0, 0);
  
  undoBtn.disabled = editHistory.length <= 1;
  
  // 選択範囲を消して再描画
  clearSelection();
}

function resetEdit() {
  if (!editOriginalUrl) return;
  
  const img = new Image();
  img.onload = () => {
    const ctx = frameEditCanvas.getContext('2d');
    ctx.clearRect(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    ctx.drawImage(img, 0, 0);
    
    // 履歴をリセットして初期状態のみにする
    const imgData = ctx.getImageData(0, 0, frameEditCanvas.width, frameEditCanvas.height);
    editHistory = [imgData];
    undoBtn.disabled = true;
    clearSelection();
  };
  img.src = editOriginalUrl;
}

function setTool(tool) {
  activeTool = tool;
  
  // ボタンのスタイル更新
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
  
  // 表示サイズと物理解像度の比率
  const scaleX = frameEditCanvas.width / rect.width;
  const scaleY = frameEditCanvas.height / rect.height;
  
  // マウス座標を取得して物理座標に変換
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
  
  // ドラッグ終了時も最終描画を維持
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
  
  // 1. まず現在の透明化適用済みの画像を復元
  ctx.putImageData(editHistory[editHistory.length - 1], 0, 0);
  
  // ドラッグしていない、またはドラッグ開始直後は選択枠を描画しない
  if (freePoints.length === 0) return;
  
  // 2. 選択枠のスタイル設定
  ctx.strokeStyle = '#3b82f6'; // blue-500
  ctx.lineWidth = Math.max(2, frameEditCanvas.width / 400); // 解像度に合わせて太さを調整
  ctx.setLineDash([6, 4]); // 破線
  
  // 塗りつぶしの半透明色（選択範囲内をわかりやすくする）
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // 半透明ブルー
  
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
  
  ctx.setLineDash([]); // ダッシュ設定を戻す
}

function applyTransparency() {
  if (editHistory.length === 0) return;
  if (freePoints.length === 0) return;
  
  const ctx = frameEditCanvas.getContext('2d');
  
  // 1. まず一旦選択枠のない状態に復元
  ctx.putImageData(editHistory[editHistory.length - 1], 0, 0);
  
  // 2. 選択された形状をマスクして透明化する
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
  
  // 4. 現在の状態を履歴に保存
  saveHistoryState();
  
  // 5. 選択範囲をクリアして再描画
  clearSelection();
}

function saveFrameEdit() {
  if (editHistory.length === 0) return;
  saveStateToHistory();
  const dataURL = frameEditCanvas.toDataURL('image/png');
  
  // アスペクト比に影響がないか確認しつつ、フレーム画像のURLを更新
  frame.url = dataURL;
  
  closeFrameEditModal();
  updateUI();
}

// === イベントリスナーの登録 ===
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

// ズームイベントリスナー
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
    // 現在の自動フィット時のスケールを算出
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
  
  // スケールを 0.1刻みで増減 (最小 0.1, 最大 2.0)
  zoomScale = Math.max(0.1, Math.min(2.0, Math.round((currentScale + delta) * 10) / 10));
  updateUI();
}

function handleReplacePanelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!selectedPanelId) return;

  const panel = panels.find(p => p.id === selectedPanelId);
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
  event.target.value = ''; // リセット
}

// 初期描画
updateUI();
