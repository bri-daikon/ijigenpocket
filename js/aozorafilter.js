    // Lucideアイコンを初期化
    lucide.createIcons();

    // HTML要素を取得する
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const resetImageBtn = document.getElementById('resetImage');
    
    const previewCanvas = document.getElementById('previewCanvas');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const downloadBtn = document.getElementById('downloadBtn');

    const filterButtons = document.querySelectorAll('.filter-btn');
    const weatherButtons = document.querySelectorAll('.weather-btn');

    // --- 各種スライダー・表示ラベル要素 ---
    const sliderBrightness = document.getElementById('sliderBrightness');
    const sliderSaturation = document.getElementById('sliderSaturation');
    const sliderContrast = document.getElementById('sliderContrast');
    const sliderOverlay = document.getElementById('sliderOverlay');
    const sliderRain = document.getElementById('sliderRain');
    const sliderSnow = document.getElementById('sliderSnow');
    const sliderSnowSize = document.getElementById('sliderSnowSize');

    const valBrightness = document.getElementById('valBrightness');
    const valSaturation = document.getElementById('valSaturation');
    const valContrast = document.getElementById('valContrast');
    const valOverlay = document.getElementById('valOverlay');
    const valRain = document.getElementById('valRain');
    const valSnow = document.getElementById('valSnow');
    const valSnowSize = document.getElementById('valSnowSize');

    // --- タブ要素 ---
    const tabFilter = document.getElementById('tabFilter');
    const tabVariation = document.getElementById('tabVariation');
    const panelFilterLeft = document.getElementById('panelFilterLeft');
    const panelVariationLeft = document.getElementById('panelVariationLeft');
    const panelFilterRight = document.getElementById('panelFilterRight');
    const panelVariationRight = document.getElementById('panelVariationRight');

    // --- カラーバリエーション用要素 ---
    const varCanvas = document.getElementById('varCanvas');
    const downloadVarBtn = document.getElementById('downloadVarBtn');
    const btnResetVariation = document.getElementById('btnResetVariation');
    const varPresetSelect = document.getElementById('varPresetSelect');
    const varHueRange = document.getElementById('varHueRange');
    const varBrightRange = document.getElementById('varBrightRange');
    const varSaturateRange = document.getElementById('varSaturateRange');
    const varContrastRange = document.getElementById('varContrastRange');
    const valVarHue = document.getElementById('valVarHue');
    const valVarBright = document.getElementById('valVarBright');
    const valVarSaturate = document.getElementById('valVarSaturate');
    const valVarContrast = document.getElementById('valVarContrast');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const variationsGrid = document.getElementById('variationsGrid');
    const varPlaceholder = document.getElementById('varPlaceholder');

    // アプリの状態を管理する変数
    let loadedImage = null; // アップロードされた元の画像データ
    let currentFilter = 'normal'; // 現在選ばれている時間帯
    let currentWeather = 'none'; // 現在選ばれている天気プリセット
    let activeTab = 'filter'; // 現在アクティブなタブ

    const varPresets = {
        bw: { hue: 0, bright: 100, sat: 0, contrast: 100 },
        metallic: { hue: 0, bright: 120, sat: 50, contrast: 150 },
        cyber: { hue: 200, bright: 110, sat: 200, contrast: 120 },
        pastel: { hue: 0, bright: 130, sat: 40, contrast: 90 },
        glitter: { hue: 0, bright: 150, sat: 120, contrast: 180 }
    };

    // --- タブ切り替えロジック ---
    function switchTab(tab) {
      activeTab = tab;
      if (tab === 'filter') {
        tabFilter.className = "flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm flex items-center justify-center space-x-1.5";
        tabVariation.className = "flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:bg-slate-50 flex items-center justify-center space-x-1.5";
        
        panelFilterLeft.classList.remove('hidden');
        panelFilterRight.classList.remove('hidden');
        panelVariationLeft.classList.add('hidden');
        panelVariationRight.classList.add('hidden');
      } else {
        tabFilter.className = "flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-slate-600 hover:bg-slate-50 flex items-center justify-center space-x-1.5";
        tabVariation.className = "flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm flex items-center justify-center space-x-1.5";
        
        panelFilterLeft.classList.add('hidden');
        panelFilterRight.classList.add('hidden');
        panelVariationLeft.classList.remove('hidden');
        panelVariationRight.classList.remove('hidden');

        // タブ切り替え時に描画更新
        if (loadedImage) {
          updateVariationFilters();
        }
      }
    }

    tabFilter.addEventListener('click', () => switchTab('filter'));
    tabVariation.addEventListener('click', () => switchTab('variation'));

    // --- 1. ファイル読み込みのイベント設定 ---

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
      dropZone.addEventListener(type, () => {
        dropZone.classList.remove('drop-zone--over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drop-zone--over');
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });

    resetImageBtn.addEventListener('click', () => {
      fileInput.value = '';
      fileInput.click();
    });

    function handleFiles(files) {
      const file = files[0];
      if (!file || !file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        return;
      }

      fileName.textContent = file.name;
      fileInfo.classList.remove('hidden');
      fileInfo.classList.add('flex');

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          loadedImage = img;
          
          // フィルター加工プレビュー表示初期化
          previewPlaceholder.classList.add('hidden');
          previewCanvas.classList.remove('hidden');
          
          downloadBtn.removeAttribute('disabled');
          downloadBtn.className = "w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5";

          // カラーバリエーションプレビュー表示初期化
          varPlaceholder.classList.add('hidden');
          variationsGrid.classList.remove('hidden');

          downloadVarBtn.removeAttribute('disabled');
          downloadVarBtn.className = "w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5";
          downloadAllBtn.classList.remove('hidden');

          processImage();
          generateVariations();
          updateVariationFilters();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }

    // --- 2. プリセットボタン & スライダー連動のイベント設定 ---

    // 時間帯ボタンクリック時
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => {
          btn.classList.remove('active', 'border-2', 'border-blue-500', 'bg-blue-50/50');
          btn.classList.add('border-slate-200');
        });
        
        button.classList.add('active', 'border-2', 'border-blue-500', 'bg-blue-50/50');
        button.classList.remove('border-slate-200');

        currentFilter = button.getAttribute('data-filter');
        
        // プリセットに合わせてスライダーの値を自動更新
        applyFilterPresetValues(currentFilter);
        updateSliderLabels();
        processImage();
      });
    });

    // 各プリセットに応じたパラメータ設定
    function applyFilterPresetValues(filter) {
      switch (filter) {
        case 'morning':
          sliderBrightness.value = 115;
          sliderSaturation.value = 125;
          sliderContrast.value = 105;
          sliderOverlay.value = 20; // 20%
          break;
        case 'noon':
          sliderBrightness.value = 105;
          sliderSaturation.value = 105;
          sliderContrast.value = 95;
          sliderOverlay.value = 25; // 25%
          break;
        case 'evening':
          sliderBrightness.value = 95;      // 夕方の少し落ち着いた光
          sliderSaturation.value = 135;      // 夕焼けの赤み・鮮やかさをグッと引き出す
          sliderContrast.value = 105;        // シルエットが少し際立つメリハリ
          sliderOverlay.value = 45;          // 夕焼けグラデーションをしっかり重ねる (45%)
          break;
        case 'night':
          sliderBrightness.value = 55;
          sliderSaturation.value = 70;
          sliderContrast.value = 110;
          sliderOverlay.value = 40; // 40%
          break;
        case 'normal':
        default:
          sliderBrightness.value = 100;
          sliderSaturation.value = 100;
          sliderContrast.value = 100;
          sliderOverlay.value = 0; // 0%
          break;
      }
    }

    // 天候ボタンクリック時
    weatherButtons.forEach(button => {
      button.addEventListener('click', () => {
        weatherButtons.forEach(btn => {
          btn.classList.remove('active', 'border-2', 'border-blue-500', 'bg-blue-50/50');
          btn.classList.add('border-slate-200');
        });
        
        button.classList.add('active', 'border-2', 'border-blue-500', 'bg-blue-50/50');
        button.classList.remove('border-slate-200');

        currentWeather = button.getAttribute('data-weather');

        // 天気プリセットに合わせて雨・雪スライダーを更新
        if (currentWeather === 'rain') {
          sliderRain.value = 100;
          sliderSnow.value = 0;
        } else if (currentWeather === 'snow') {
          sliderRain.value = 0;
          sliderSnow.value = 60;
          sliderSnowSize.value = 4;
        } else {
          sliderRain.value = 0;
          sliderSnow.value = 0;
        }
        
        updateSliderLabels();
        processImage();
      });
    });

    // スライダーの「現在の値」表示を更新する
    function updateSliderLabels() {
      valBrightness.textContent = `${sliderBrightness.value}%`;
      valSaturation.textContent = `${sliderSaturation.value}%`;
      valContrast.textContent = `${sliderContrast.value}%`;
      valOverlay.textContent = `${sliderOverlay.value}%`;
      valRain.textContent = sliderRain.value === '0' ? 'なし' : sliderRain.value;
      valSnow.textContent = sliderSnow.value === '0' ? 'なし' : sliderSnow.value;
      
      const snowSize = parseInt(sliderSnowSize.value);
      if (snowSize <= 2) valSnowSize.textContent = "小粒";
      else if (snowSize <= 5) valSnowSize.textContent = "標準";
      else if (snowSize <= 8) valSnowSize.textContent = "大粒";
      else valSnowSize.textContent = "巨大";
    }

    // スライダーを動かしたときにリアルタイムに数値を更新＆画像に反映
    const allSliders = [
      sliderBrightness, sliderSaturation, sliderContrast, 
      sliderOverlay, sliderRain, sliderSnow, sliderSnowSize
    ];

    allSliders.forEach(slider => {
      slider.addEventListener('input', () => {
        updateSliderLabels();
        processImage();
      });
    });


    // --- 3. 画像の加工・描画メイン処理 ---

    function processImage() {
      if (!loadedImage) return;

      const ctx = previewCanvas.getContext('2d');
      
      previewCanvas.width = loadedImage.width;
      previewCanvas.height = loadedImage.height;

      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctx.globalCompositeOperation = 'source-over';

      // 1. スライダーに基づいた色補正フィルターの適用
      applyTimeFilter(ctx);

      // 元の画像をキャンバスに描画（色調補正をかけながら）
      ctx.drawImage(loadedImage, 0, 0, previewCanvas.width, previewCanvas.height);

      // フィルター効果を確定させるため一時的にリセット
      ctx.filter = 'none';

      // 2. 光効果（朝日のグラデーション等）を重ねる
      applyLightOverlay(ctx);

      // 3. 雨や雪をスライダーの量に合わせて描画
      applyWeatherEffect(ctx);
    }

    // A. スライダーから取得した値で色調を調整する
    function applyTimeFilter(ctx) {
      const b = sliderBrightness.value;
      const s = sliderSaturation.value;
      const c = sliderContrast.value;
      
      // CSS風のフィルター構文を使ってブレンドします
      ctx.filter = `brightness(${b}%) saturate(${s}%) contrast(${c}%)`;
    }

    // B. 光のグラデーションをブレンドする（不透明度はスライダーと連動）
    function applyLightOverlay(ctx) {
      const w = previewCanvas.width;
      const h = previewCanvas.height;
      
      // スライダー（0〜100）を不透明度（0.0〜1.0）に変換
      const opacity = sliderOverlay.value / 100;
      if (opacity <= 0) return;

      if (currentFilter === 'morning') {
        // 朝日のオレンジ・ピンクの爽やかなグラデーション
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, `rgba(255, 180, 100, ${opacity * 0.9})`); 
        grad.addColorStop(0.5, `rgba(255, 230, 200, ${opacity * 0.25})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

      } else if (currentFilter === 'noon') {
        // 昼：ぽかぽかした太陽光の広がり（黄色の円形グラデーション）
        const centerX = w * 0.7;
        const centerY = h * 0.2;
        const maxRadius = Math.max(w, h);

        const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxRadius);
        grad.addColorStop(0, `rgba(255, 245, 200, ${opacity * 1.0})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.2})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

      } else if (currentFilter === 'evening') {
        // 夕方：オレンジ、赤、少し紫が混ざったエモーショナルな夕焼け空
        const grad = ctx.createLinearGradient(0, 0, 0, h); // 上から下へ流れるグラデーション
        grad.addColorStop(0, `rgba(100, 30, 120, ${opacity * 0.45})`); // 上空は少し深みのある紫（薄暮）
        grad.addColorStop(0.4, `rgba(255, 50, 40, ${opacity * 0.85})`); // 中間は強い夕焼けの赤
        grad.addColorStop(0.8, `rgba(255, 140, 0, ${opacity * 0.95})`); // 下部は温かみのあるオレンジ
        grad.addColorStop(1, `rgba(255, 200, 50, ${opacity * 0.6})`);  // 地平線近くは眩しい太陽の黄

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

      } else if (currentFilter === 'night') {
        // 夜：深みのある青色のレイヤーを「乗算」で重ねて暗く落ち着かせる
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgba(15, 25, 75, ${opacity * 0.95})`;
        ctx.fillRect(0, 0, w, h);

        // さらに、夜空から光がグラデーションする様子を重ねる（通常描画に戻して上から重ねる）
        ctx.globalCompositeOperation = 'source-over';
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgba(10, 10, 30, ${opacity * 0.6})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    }

    // C. 雨や雪をスライダーで指定された量に合わせて描画
    function applyWeatherEffect(ctx) {
      const w = previewCanvas.width;
      const h = previewCanvas.height;
      const area = w * h;

      const rainVal = parseInt(sliderRain.value);
      const snowVal = parseInt(sliderSnow.value);
      const snowSize = parseFloat(sliderSnowSize.value);

      // 1. 雨の描画
      if (rainVal > 0) {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.42)'; // 雨の色
        ctx.lineWidth = Math.max(1, w / 800);
        
        // スライダーの値（0〜250）に応じて雨の数を計算
        const rainCount = Math.floor((area / 8000) * (rainVal / 100)); 
        
        for (let i = 0; i < rainCount; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const length = (20 + Math.random() * 30) * (w / 1000); 
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - (length * 0.15), y + length); // 斜めに降る表現
          ctx.stroke();
        }
      }

      // 2. 雪の描画
      if (snowVal > 0) {
        // スライダーの値（0〜200）に応じて雪の数を計算
        const snowCount = Math.floor((area / 12000) * (snowVal / 60));
        
        for (let i = 0; i < snowCount; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          
          // 雪 of 粒の大きさ（ベースのランダム * サイズ調節値）
          const radius = (1.5 + Math.random() * 3.5) * (w / 1000) * (snowSize / 4);
          
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); 
          grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.55)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }


    // --- 4. 画像ダウンロードのイベント設定 ---

    downloadBtn.addEventListener('click', () => {
      if (!loadedImage) return;

      const baseName = fileName.textContent.substring(0, fileName.textContent.lastIndexOf('.')) || 'filtered_image';
      // カスタマイズされたことがわかるように、カスタム接尾辞をつけます
      const outputName = `${baseName}_custom_filtered.png`;

      const dataURL = previewCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = outputName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    // --- 5. カラーバリエーション処理ロジック ---

    function generateVariations() {
      if (!loadedImage) return;
      variationsGrid.innerHTML = '';
      for (let i = 0; i < 15; i++) {
        const hue = Math.round(i * 360 / 15);
        const div = document.createElement('div');
        div.className = 'variation-card';
        if (hue === parseInt(varHueRange.value)) {
          div.classList.add('active');
        }

        const canvas = document.createElement('canvas');
        const maxPreviewWidth = 300;
        const scale = Math.min(1, maxPreviewWidth / loadedImage.width);
        canvas.width = loadedImage.width * scale;
        canvas.height = loadedImage.height * scale;

        const c = canvas.getContext('2d');
        c.filter = `hue-rotate(${hue}deg)`;
        c.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

        div.appendChild(canvas);
        
        div.onclick = () => {
          const cards = variationsGrid.querySelectorAll('.variation-card');
          cards.forEach(card => card.classList.remove('active'));
          div.classList.add('active');
          selectVariation(hue);
        };
        variationsGrid.appendChild(div);
      }
    }

    function selectVariation(hue) {
      varPresetSelect.value = 'none';
      varHueRange.value = hue;
      updateVarSliderLabels();
      updateVariationFilters();
    }

    function updateVariationFilters() {
      if (!loadedImage) return;
      const hue = varHueRange.value;
      const bright = varBrightRange.value;
      const saturate = varSaturateRange.value;
      const contrast = varContrastRange.value;

      varCanvas.width = loadedImage.width;
      varCanvas.height = loadedImage.height;
      const ctx = varCanvas.getContext('2d');
      ctx.clearRect(0, 0, varCanvas.width, varCanvas.height);
      ctx.filter = `hue-rotate(${hue}deg) brightness(${bright}%) saturate(${saturate}%) contrast(${contrast}%)`;
      ctx.drawImage(loadedImage, 0, 0);
    }

    function updateVarSliderLabels() {
      valVarHue.textContent = `${varHueRange.value}°`;
      valVarBright.textContent = `${varBrightRange.value}%`;
      valVarSaturate.textContent = `${varSaturateRange.value}%`;
      valVarContrast.textContent = `${varContrastRange.value}%`;
    }

    varPresetSelect.addEventListener('change', (e) => {
      const p = varPresets[e.target.value];
      if (p) {
        varHueRange.value = p.hue;
        varBrightRange.value = p.bright;
        varSaturateRange.value = p.sat;
        varContrastRange.value = p.contrast;
        updateVarSliderLabels();
        updateVariationFilters();
      }
    });

    [varHueRange, varBrightRange, varSaturateRange, varContrastRange].forEach(el => {
      el.addEventListener('input', () => {
        varPresetSelect.value = 'none';
        updateVarSliderLabels();
        updateVariationFilters();
      });
    });

    btnResetVariation.addEventListener('click', () => {
      varPresetSelect.value = 'none';
      varHueRange.value = 0;
      varBrightRange.value = 100;
      varSaturateRange.value = 100;
      varContrastRange.value = 100;
      
      updateVarSliderLabels();
      updateVariationFilters();

      const cards = variationsGrid.querySelectorAll('.variation-card');
      cards.forEach(card => card.classList.remove('active'));
      if (cards.length > 0) {
        cards[0].classList.add('active');
      }
    });

    downloadVarBtn.addEventListener('click', () => {
      if (!loadedImage) return;
      const baseName = fileName.textContent.substring(0, fileName.textContent.lastIndexOf('.')) || 'variation_image';
      const outputName = `${baseName}_var_edited.png`;

      const dataURL = varCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = outputName;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    downloadAllBtn.addEventListener('click', async () => {
      if (!loadedImage) return;

      const baseName = fileName.textContent.substring(0, fileName.textContent.lastIndexOf('.')) || 'variation';
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = loadedImage.width;
      tempCanvas.height = loadedImage.height;
      const tempCtx = tempCanvas.getContext('2d');

      for (let i = 0; i < 15; i++) {
        const hue = Math.round(i * 360 / 15);
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.filter = `hue-rotate(${hue}deg)`;
        tempCtx.drawImage(loadedImage, 0, 0);

        const link = document.createElement('a');
        link.download = `${baseName}_variation_hue_${hue}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await new Promise(resolve => setTimeout(resolve, 300));
      }
    });
