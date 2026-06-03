// アイコンの初期化
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// === 状態管理（データ） ===
let background = null; // { url: url, x: 0, y: 0, width: 1280, height: 720 }
let foreground = null; // { url: url, x: 0, y: 0, width: 1280, height: 720 }
let panels = [];
let selectedPanelId = null; // 'background', 'foreground', またはパネルのid
let copiedPanelData = null; // コピーされたパネルデータ

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
const clearBgBtn = document.getElementById('clear-bg-btn');
const clearFgBtn = document.getElementById('clear-fg-btn');

const canvasSizeSelect = document.getElementById('canvas-size-select');
const gridShowToggle = document.getElementById('grid-show-toggle');
const gridSnapToggle = document.getElementById('grid-snap-toggle');

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

  // 背景の描画
  if (background) {
    const bgEl = document.createElement('div');
    const isSelected = selectedPanelId === 'background';
    bgEl.className = `absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    bgEl.style.left = `${background.x}px`;
    bgEl.style.top = `${background.y}px`;
    bgEl.style.width = `${background.width}px`;
    bgEl.style.height = `${background.height}px`;
    bgEl.style.backgroundImage = `url(${background.url})`;
    bgEl.style.backgroundSize = '100% 100%';
    bgEl.style.backgroundRepeat = 'no-repeat';
    bgEl.style.backgroundPosition = 'center';
    bgEl.style.zIndex = '0';
    bgEl.style.pointerEvents = 'auto';
    
    bgEl.addEventListener('mousedown', (e) => handleSpecialMouseDown(e, 'background'));
    
    if (isSelected) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      bgEl.appendChild(resizeHandle);
    }
    canvasArea.appendChild(bgEl);
  }

  // 前景の描画
  if (foreground) {
    const fgEl = document.createElement('div');
    const isSelected = selectedPanelId === 'foreground';
    fgEl.className = `absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    fgEl.style.left = `${foreground.x}px`;
    fgEl.style.top = `${foreground.y}px`;
    fgEl.style.width = `${foreground.width}px`;
    fgEl.style.height = `${foreground.height}px`;
    fgEl.style.backgroundImage = `url(${foreground.url})`;
    fgEl.style.backgroundSize = '100% 100%';
    fgEl.style.backgroundRepeat = 'no-repeat';
    fgEl.style.backgroundPosition = 'center';
    fgEl.style.zIndex = '10';
    fgEl.style.pointerEvents = 'auto';
    
    fgEl.addEventListener('mousedown', (e) => handleSpecialMouseDown(e, 'foreground'));
    
    if (isSelected) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      fgEl.appendChild(resizeHandle);
    }
    canvasArea.appendChild(fgEl);
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
    const pEl = document.createElement('div');
    const isSelected = selectedPanelId === panel.id;
    
    pEl.className = `absolute z-20 cursor-move ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'hover:ring-1 hover:ring-gray-400'}`;
    pEl.style.left = `${panel.x}px`;
    pEl.style.top = `${panel.y}px`;
    pEl.style.width = `${panel.width}px`;
    pEl.style.height = `${panel.height}px`;
    pEl.style.backgroundImage = `url(${panel.url})`;
    pEl.style.backgroundSize = '100% 100%'; // 枠に合わせて伸縮
    pEl.style.backgroundRepeat = 'no-repeat';
    pEl.style.backgroundPosition = 'center';
    
    // パネルをマウスで押した時の処理
    pEl.addEventListener('mousedown', (e) => handlePanelMouseDown(e, panel.id));

    // 選択中ならリサイズ用のツマミを表示
    if (isSelected) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-sm';
      resizeHandle.style.transform = 'translate(50%, 50%)';
      pEl.appendChild(resizeHandle);
    }
    
    canvasArea.appendChild(pEl);
  });

  // ガイドテキストの表示
  if (!background && !foreground && panels.length === 0) {
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
  clearBgBtn.style.display = background ? 'block' : 'none';
  clearFgBtn.style.display = foreground ? 'block' : 'none';

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
      
      if (type === 'background') {
        const scaleX = canvasWidth / originalWidth;
        const scaleY = canvasHeight / originalHeight;
        const scale = Math.min(1, scaleX, scaleY);
        const initWidth = originalWidth * scale;
        const initHeight = originalHeight * scale;
        
        background = {
          url: imageUrl,
          x: (canvasWidth - initWidth) / 2,
          y: (canvasHeight - initHeight) / 2,
          width: initWidth,
          height: initHeight,
          originalRatio: originalRatio
        };
        selectedPanelId = 'background';
      } else if (type === 'foreground') {
        const scaleX = canvasWidth / originalWidth;
        const scaleY = canvasHeight / originalHeight;
        const scale = Math.min(1, scaleX, scaleY);
        const initWidth = originalWidth * scale;
        const initHeight = originalHeight * scale;
        
        foreground = {
          url: imageUrl,
          x: (canvasWidth - initWidth) / 2,
          y: (canvasHeight - initHeight) / 2,
          width: initWidth,
          height: initHeight,
          originalRatio: originalRatio
        };
        selectedPanelId = 'foreground';
      } else if (type === 'panel') {
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
          originalRatio: originalRatio
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
document.getElementById('bg-upload').addEventListener('change', (e) => handleFileUpload(e, 'background'));
document.getElementById('fg-upload').addEventListener('change', (e) => handleFileUpload(e, 'foreground'));
document.getElementById('panel-upload').addEventListener('change', (e) => handleFileUpload(e, 'panel'));

clearBgBtn.addEventListener('click', () => { 
  background = null; 
  if (selectedPanelId === 'background') selectedPanelId = null;
  updateUI(); 
});
clearFgBtn.addEventListener('click', () => { 
  foreground = null; 
  if (selectedPanelId === 'foreground') selectedPanelId = null;
  updateUI(); 
});

// === ドラッグ＆ドロップ、リサイズの処理 ===
function handleSpecialMouseDown(e, type) {
  e.stopPropagation();
  selectedPanelId = type;
  const target = type === 'background' ? background : foreground;
  
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
  updateUI();
}

function handlePanelMouseDown(e, panelId) {
  e.stopPropagation();
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
  updateUI();
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
  if (selectedPanelId === 'background') {
    target = background;
  } else if (selectedPanelId === 'foreground') {
    target = foreground;
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

  const pad = 32; // 余白
  const maxW = rect.width - pad;
  const maxH = rect.height - pad;
  
  const scaleX = maxW / canvasWidth;
  const scaleY = maxH / canvasHeight;
  const scale = Math.max(0.05, Math.min(1, scaleX, scaleY));
  
  canvasArea.style.transform = `scale(${scale})`;
  
  const scaleDisplay = document.getElementById('scale-display');
  if (scaleDisplay) {
    scaleDisplay.innerText = `${Math.round(scale * 100)}%`;
  }
}

window.addEventListener('resize', updateCanvasScale);

// キャンバス設定のイベントハンドラ
canvasSizeSelect.addEventListener('change', (e) => {
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
  const element = panels[fromIndex];
  panels.splice(fromIndex, 1);
  panels.splice(toIndex, 0, element);
  updateUI();
}

// パネル複製関数
function duplicatePanel(panel) {
  const offset = snapToGrid ? 24 : 20;
  const newPanel = {
    ...panel,
    id: Date.now().toString(),
    x: panel.x + offset,
    y: panel.y + offset
  };
  panels.push(newPanel);
  selectedPanelId = newPanel.id;
  updateUI();
}

// キーボードショートカットの登録 (Ctrl+C / Ctrl+V)
window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') {
    return;
  }

  // Ctrl+C / Cmd+C (コピー)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedPanelId && selectedPanelId !== 'background' && selectedPanelId !== 'foreground') {
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

    // 1. 背景の描画タスク
    if (background) {
      drawTasks.push(loadImage(background.url).then(img => {
        return { img, x: background.x, y: background.y, w: background.width, h: background.height };
      }));
    }

    // 2. 前景の描画タスク
    if (foreground) {
      drawTasks.push(loadImage(foreground.url).then(img => {
        return { img, x: foreground.x, y: foreground.y, w: foreground.width, h: foreground.height };
      }));
    }

    // 3. 各パネルの描画タスク
    panels.forEach(panel => {
      drawTasks.push(loadImage(panel.url).then(img => {
        return { img, x: panel.x, y: panel.y, w: panel.width, h: panel.height };
      }));
    });

    // すべての画像を並列で読み込み
    const renderItems = await Promise.all(drawTasks);

    // キャンバスに描画
    renderItems.forEach(item => {
      ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
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

// 初期描画
updateUI();
