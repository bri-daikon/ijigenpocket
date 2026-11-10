
    // PDFJSの設定
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // 内部ステート
    let rawTextBlocks = []; // 解析された生テキストデータ [{page: Number, height: Number, items: [{str: String, y: Number, x: Number}]}]
    let processedItems = []; // 画面表示用の整形データ [{id: Number, original: String, text: String, bookmarked: Boolean, note: String, page: Number}]
    let splitMode = 'paragraph'; // 'paragraph' または 'line'
    let currentFileName = ""; // 現在読み込んでいるファイル名
    let pdfDoc = null; // プレビュー用のPDFドキュメントインスタンス
    let currentPreviewPage = 1; // 現在プレビュー表示中のページ
    let previewScale = 0.55; // プレビューの拡大率倍率（初期は横幅が収まる55%）
    let pdfOutline = []; // PDFのしおりツリー
    let isOutlineOpen = false; // 目次パネルが開いているかどうか
    let detectedSpeakers = new Set(); // PDF全体から検出された話者名リスト
    let globalId = 0; // カードID採番カウンター（splitCardAtCursorで使用）
    let kuroshiroEnabled = false; // ふりがな表示ON/OFF
    let kuroshiroReady = false;   // Kuroshiro初期化済みフラグ
    let kuroshiroWorker = null;   // Kuroshiro用Web Worker
    let furiganaQueue = [];       // 変換待ちキュー
    let isFuriganaConverting = false;
    let isCurrentFileText = false; // 現在読み込んでいるのがテキストファイルかどうか

    // モード管理と選択状態
    let globalMode = 'edit'; // 'edit' or 'copy'
    let selectedCardIds = new Set();
    let lastSelectedId = null;
    let draggedCardId = null;

    // カードのカラーパレット定義
    const cardColors = [
      { id: 'slate', name: '標準', bg: 'bg-slate-50', border: 'border-slate-200', hoverBg: 'hover:bg-slate-100', hoverBorder: 'hover:border-slate-300' },
      { id: 'red', name: '赤 (秘匿など)', bg: 'bg-red-50', border: 'border-red-200', hoverBg: 'hover:bg-red-100', hoverBorder: 'hover:border-red-300' },
      { id: 'orange', name: 'オレンジ', bg: 'bg-orange-50', border: 'border-orange-200', hoverBg: 'hover:bg-orange-100', hoverBorder: 'hover:border-orange-300' },
      { id: 'amber', name: '黄 (情報)', bg: 'bg-amber-50', border: 'border-amber-200', hoverBg: 'hover:bg-amber-100', hoverBorder: 'hover:border-amber-300' },
      { id: 'green', name: '緑', bg: 'bg-green-50', border: 'border-green-200', hoverBg: 'hover:bg-green-100', hoverBorder: 'hover:border-green-300' },
      { id: 'teal', name: '青緑 (KP用)', bg: 'bg-teal-50', border: 'border-teal-200', hoverBg: 'hover:bg-teal-100', hoverBorder: 'hover:border-teal-300' },
      { id: 'blue', name: '青 (セリフ)', bg: 'bg-blue-50', border: 'border-blue-200', hoverBg: 'hover:bg-blue-100', hoverBorder: 'hover:border-blue-300' },
      { id: 'indigo', name: '藍色', bg: 'bg-indigo-50', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-100', hoverBorder: 'hover:border-indigo-300' },
      { id: 'purple', name: '紫', bg: 'bg-purple-50', border: 'border-purple-200', hoverBg: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300' },
      { id: 'pink', name: 'ピンク', bg: 'bg-pink-50', border: 'border-pink-200', hoverBg: 'hover:bg-pink-100', hoverBorder: 'hover:border-pink-300' }
    ];



    // タブ名とカラーの相互変換用マッピング
    let tabColorMapping = {
      '情報': 'green',
      '秘匿': 'red',
      '描写': 'orange',
      '注意': 'amber',
      'メイン': 'blue',
      '雑談': 'slate'
    };

    function loadTabColorMapping() {
      const saved = localStorage.getItem('pdf_tool_tab_colors');
      if (saved) {
        try {
          tabColorMapping = JSON.parse(saved);
        } catch(e) {}
      }
    }
    loadTabColorMapping();

    function saveTabColorMapping() {
      const inputs = document.querySelectorAll('.tab-color-input');
      const newMapping = {};
      inputs.forEach(input => {
        const color = input.dataset.color;
        const val = input.value.trim();
        if (val) {
          newMapping[val] = color;
        }
      });
      tabColorMapping = newMapping;
      localStorage.setItem('pdf_tool_tab_colors', JSON.stringify(tabColorMapping));
      showToast('設定保存', 'タブとカラーの連携設定を保存しました。', 'success');
    }
    
    function resetTabColorMapping() {
      if (!confirm('タブとカラーの連携設定を初期値に戻しますか？')) return;
      localStorage.removeItem('pdf_tool_tab_colors');
      tabColorMapping = {
        '情報': 'green',
        '秘匿': 'red',
        '描写': 'orange',
        '注意': 'amber',
        'メイン': 'blue',
        '雑談': 'slate'
      };
      renderTabColorSettings();
      showToast('リセット', '初期設定に戻しました。', 'info');
    }

    function renderTabColorSettings() {
      const container = document.getElementById('tab-color-settings-list');
      if (!container) return;
      
      let html = '';
      cardColors.forEach(c => {
        const mappedTab = Object.keys(tabColorMapping).find(k => tabColorMapping[k] === c.id) || '';
        html += `
          <div class="flex items-center gap-2">
            <div class="${c.bg} border ${c.border} w-4 h-4 rounded-full flex-shrink-0 shadow-sm" title="${c.name}"></div>
            <input type="text" value="${escapeHtml(mappedTab)}" data-color="${c.id}" placeholder="${c.name}に紐づくタブ名" class="tab-color-input w-full text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none">
          </div>
        `;
      });
      container.innerHTML = html;
    }




    // テーマ管理
    function initTheme() {
      const savedTheme = localStorage.getItem('pdf-converter-theme') || 'light';
      changeTheme(savedTheme);
      const selector = document.getElementById('theme-selector');
      if (selector) selector.value = savedTheme;
    }
    
    function changeTheme(themeName) {
      if (themeName === 'light') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', themeName);
      }
      localStorage.setItem('pdf-converter-theme', themeName);
    }

    // ドロップエリアの設定
    const dropZone = document.getElementById('drop-zone');
    const pdfInput = document.getElementById('pdf-input');

    // ドラッグ＆ドロップイベントのハンドリング
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-teal-500', 'bg-teal-50/50');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-teal-500', 'bg-teal-50/50');
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length) {
        pdfInput.files = files;
        handleFileSelect(files[0]);
      }
    });

    pdfInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFileSelect(e.target.files[0]);
      }
    });

    // ファイル処理の開始
    function handleFileSelect(file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

      if (!isPdf && !isTxt) {
        showToast('エラー', 'PDFまたはテキストファイル(.txt)を選択してください。', 'error');
        return;
      }
      currentFileName = file.name;
      if (isPdf) {
        loadPdf(file);
      } else {
        loadTextFile(file);
      }
    }

    // テキストファイルの読み込み
    async function loadTextFile(file) {
      updateStatus('loading', 'テキストファイルを読み込み中...');
      isCurrentFileText = true;
      rawTextBlocks = [];
      processedItems = [];
      pdfDoc = null;
      currentPreviewPage = 1;

      // プレビューの画面初期化
      document.getElementById('preview-canvas').classList.add('hidden');
      const placeholder = document.getElementById('preview-placeholder');
      placeholder.classList.remove('hidden');
      placeholder.innerHTML = `<i data-lucide="file-text" class="w-8 h-8 text-slate-300 mb-2"></i><p class="text-xs">テキストファイルが読み込まれました。プレビュー機能はPDF専用です。</p>`;
      lucide.createIcons();

      document.getElementById('preview-total-pages').innerText = '1';
      document.getElementById('preview-page-input').value = 1;
      document.getElementById('btn-prev-page').disabled = true;
      document.getElementById('btn-next-page').disabled = true;

      try {
        const encoding = document.getElementById('text-encoding-select').value;
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsText(file, encoding);
        });
        const lines = text.split('\n');
        let items = [];
        let y = lines.length * 30;
        for (const line of lines) {
          if (line.trim() === '') {
            y -= 30; // 空行は大きくYを下げて段落区切り(\n\n)を誘発
          } else {
            items.push({ str: line, x: 0, y: y });
            y -= 20; // 連続する行は改行(\n)を誘発
          }
        }

        rawTextBlocks.push({
          page: 1,
          height: lines.length * 30 + 40,
          items: items
        });

        updateStatus('success', 'ロード完了！');

        buildSpeakerSet();
        processAndDisplay(true);

      } catch (error) {
        console.error(error);
        updateStatus('error', 'ファイルの読み込みに失敗しました。');
      }
    }

    // PDFの読み込み、テキスト抽出 ＆ プレビュー本紙の読み込み
    async function loadPdf(file) {
      updateStatus('loading', 'PDFを解析 ＆ 本紙ロード中...');
      isCurrentFileText = false;
      rawTextBlocks = [];
      processedItems = [];
      pdfDoc = null;
      currentPreviewPage = 1;

      // プレビューの画面初期化
      document.getElementById('preview-canvas').classList.add('hidden');
      const placeholder = document.getElementById('preview-placeholder');
      placeholder.classList.remove('hidden');
      placeholder.innerHTML = `<i data-lucide="book-open" class="w-8 h-8 text-slate-300 mb-2"></i><p class="text-xs">PDFを読み込むとここに元のPDFが表示されます。ページの挿絵や全体のルビ確認に便利！</p>`;
      lucide.createIcons();

      try {
        const fileReader = new FileReader();
        fileReader.onload = async function () {
          const typedarray = new Uint8Array(this.result);

          try {
            // PDFJSドキュメントロード
            pdfDoc = await pdfjsLib.getDocument({ data: typedarray }).promise;
            const maxPages = pdfDoc.numPages;

            // プレビューコントローラのアクティブ化
            document.getElementById('preview-total-pages').innerText = maxPages;
            document.getElementById('preview-page-input').value = 1;
            document.getElementById('btn-prev-page').disabled = false;
            document.getElementById('btn-next-page').disabled = false;

            updateStatus('loading', `テキスト抽出中... (0/${maxPages}ページ)`);

            for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
              updateStatus('loading', `テキスト抽出中... (${pageNum}/${maxPages}ページ)`);
              const page = await pdfDoc.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.0 });
              const pageHeight = viewport.height;
              const textContent = await page.getTextContent();

              // 座標情報を保持して取得
              const pageItems = textContent.items.map(item => ({
                str: item.str,
                y: item.transform[5],
                x: item.transform[4]
              }));

              rawTextBlocks.push({
                page: pageNum,
                height: pageHeight,
                items: pageItems
              });
            }

            updateStatus('success', 'ロード完了！');

            // 1. 本紙プレビューの初回描画
            renderPreviewPage(1);

            // 2. 話者名の自動抽出
            buildSpeakerSet();

            // 3. 整形テキストのロード
            processAndDisplay(true);

            // 4. PDFしおりの抽出
            await extractPdfOutline(pdfDoc);
          } catch (error) {
            console.error(error);
            updateStatus('error', 'PDFの解析に失敗しました。');
            showToast('エラー', 'PDFデータの読み込み中にエラーが発生しました。', 'error');
          }
        };
        fileReader.readAsArrayBuffer(file);
      } catch (error) {
        console.error(error);
        updateStatus('error', 'ファイルの読み込みに失敗しました。');
      }
    }

    // PDF本紙をCanvasに美しく描画する関数
    async function renderPreviewPage(pageNum) {
      if (!pdfDoc) return;

      const canvas = document.getElementById('preview-canvas');
      const container = document.getElementById('canvas-container');
      const placeholder = document.getElementById('preview-placeholder');

      placeholder.classList.add('hidden');
      canvas.classList.remove('hidden');

      try {
        const page = await pdfDoc.getPage(pageNum);
        const ctx = canvas.getContext('2d');

        // 拡大率の調整
        const viewport = page.getViewport({ scale: previewScale * 1.3 }); // 綺麗に見えるよう係数1.3を乗算
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        await page.render(renderContext).promise;

        // 【カイゼン】ページ遷移時に、プレビューのスクロール位置を一番上にリセットします
        if (container) {
          container.scrollTop = 0;
          container.scrollLeft = 0;
        }

        // ページ番号表示の更新
        currentPreviewPage = pageNum;
        const pageInput = document.getElementById('preview-page-input');
        if (pageInput) pageInput.value = pageNum;

        // ボタン制御
        document.getElementById('btn-prev-page').disabled = (pageNum <= 1);
        document.getElementById('btn-next-page').disabled = (pageNum >= pdfDoc.numPages);
      } catch (e) {
        console.error("PDFプレビュー描画中にエラーが発生しました", e);
      }
    }

    // プレビューのズーム
    function zoomPreview(factor) {
      if (!pdfDoc) return;
      const newScale = previewScale + factor;
      if (newScale >= 0.5 && newScale <= 2.5) {
        previewScale = newScale;
        document.getElementById('zoom-percent').innerText = `${Math.round(previewScale * 100)}%`;
        renderPreviewPage(currentPreviewPage);
      }
    }

    // プレビューページの変更
    function changePreviewPage(direction) {
      if (!pdfDoc) return;
      const targetPage = currentPreviewPage + direction;
      if (targetPage >= 1 && targetPage <= pdfDoc.numPages) {
        renderPreviewPage(targetPage);
      }
    }

    // ページ番号入力欄から直接ジャンプ
    function jumpToPageInput() {
      if (!pdfDoc) return;
      const input = document.getElementById('preview-page-input');
      const page = parseInt(input.value, 10);
      if (!isNaN(page) && page >= 1 && page <= pdfDoc.numPages) {
        renderPreviewPage(page);
      } else {
        // 範囲外の場合は元の値に戻す
        input.value = currentPreviewPage;
      }
    }

    // PDF全体から話者名を自動抽出してリスト化する
    function buildSpeakerSet() {
      detectedSpeakers.clear();
      if (rawTextBlocks.length === 0) return;

      let fullText = '';
      rawTextBlocks.forEach(block => {
        block.items.forEach(item => {
          fullText += item.str;
        });
        fullText += '\n';
      });

      // 行頭（スペースを許容）の1〜8文字で、直後に「や『、またはコロンが続くものを話者名とする
      const speakerRegex = /^[\s　]*([^「」『』\n\s　：:]{1,8})(?=[「『：:])/gm;
      let match;
      while ((match = speakerRegex.exec(fullText)) !== null) {
        if (match[1] && match[1].trim()) {
          detectedSpeakers.add(match[1].trim());
        }
      }
      console.log("検出された話者名リスト:", Array.from(detectedSpeakers));
    }

    // ※ splitIntoParagraphs は下部（701行付近）に新アルゴリズム版として定義されています

    // 指定されたページ番号へジャンプ（連動用）
    function jumpToPreviewPage(pageNum) {
      if (!pdfDoc) return;
      if (pageNum >= 1 && pageNum <= pdfDoc.numPages) {
        renderPreviewPage(pageNum);
        showToast(`プレビュー切替`, `本紙プレビューの P. ${pageNum} に移動しました。`, 'info');
      }
    }

    // ステータス表示の更新
    function updateStatus(type, message) {
      const container = document.getElementById('status-container');
      const spinner = document.getElementById('status-spinner');
      const icon = document.getElementById('status-icon');
      const text = document.getElementById('status-text');

      container.classList.remove('hidden', 'bg-teal-50', 'bg-rose-50', 'bg-amber-50');
      spinner.classList.add('hidden');
      icon.classList.remove('hidden');

      if (type === 'loading') {
        container.classList.add('bg-amber-50');
        spinner.classList.remove('hidden');
        icon.classList.add('hidden');
        text.className = 'font-medium text-amber-700';
      } else if (type === 'success') {
        container.classList.add('bg-teal-50');
        text.className = 'font-medium text-teal-700';
        icon.setAttribute('data-lucide', 'check-circle');
        icon.className = 'w-4 h-4 text-teal-600';
      } else if (type === 'error') {
        container.classList.add('bg-rose-50');
        text.className = 'font-medium text-rose-700';
        icon.setAttribute('data-lucide', 'alert-circle');
        icon.className = 'w-4 h-4 text-rose-600';
      }
      text.innerText = message;
      lucide.createIcons();
    }

    // 表示分割モードの変更 ('paragraph' or 'line')
    function setSplitMode(mode) {
      splitMode = mode;

      const btnPara = document.getElementById('btn-mode-paragraph');
      const btnLine = document.getElementById('btn-mode-line');

      if (mode === 'paragraph') {
        btnPara.className = "py-1 px-2 rounded text-xs font-semibold transition-all bg-white text-teal-700 shadow-sm";
        btnLine.className = "py-1 px-2 rounded text-xs font-semibold transition-all text-slate-600 hover:text-slate-800";
      } else {
        btnLine.className = "py-1 px-2 rounded text-xs font-semibold transition-all bg-white text-teal-700 shadow-sm";
        btnPara.className = "py-1 px-2 rounded text-xs font-semibold transition-all text-slate-600 hover:text-slate-800";
      }

      processAndDisplay(false);
    }

    // ローカルストレージにデータを保存する関数
    function saveToLocalStorage() {
      if (!currentFileName || processedItems.length === 0) return;

      const saveData = processedItems
        .filter(item => item.bookmarked || item.note || item.furiganaHtml || item.tabName || item.isCommand || item.isCopied)
        .map((item, index) => {
          let prevOriginal = null;
          if (item.isCommand) {
            for (let i = index - 1; i >= 0; i--) {
              if (processedItems[i] && !processedItems[i].isCommand) {
                prevOriginal = processedItems[i].original;
                break;
              }
            }
          }
          return {
            original: item.original,
            bookmarked: item.bookmarked,
            note: item.note,
            furiganaHtml: item.furiganaHtml,
            color: item.color,
            tabName: item.tabName,
            isCommand: item.isCommand,
            isCopied: item.isCopied,
            text: item.isCommand ? item.text : undefined, // コマンドカードの場合はテキストも保存
            insertAfterOriginal: item.isCommand ? prevOriginal : undefined
          };
        });

      localStorage.setItem('pdf_tool_save_' + currentFileName, JSON.stringify(saveData));
    }

    // スマートに段落を判定してテキストを配列に分割する処理
    // アルゴリズム：
    //   1. まず 2個以上の改行（\n\n）で大きく段落に分割する
    //   2. 各段落ブロック内で、行頭に「名前「」の形式」を検出したらセリフカードとして確定する
    //   3. セリフでない行は地の文として蓄積し、ブロック内の単一改行（\n）はそのまま保持する
    function splitIntoParagraphs(text) {
      const result = [];

      // 「行頭が 名前「 の形でセリフ行として確定できるか」を判定する
      function isSpeechStart(line) {
        return /^[^「」『』\n]{0,12}[「『]/.test(line.trim());
      }

      // 閉じカッコで行が終わっているか
      function isSpeechEnd(line) {
        return /[」』][。\s]*$/.test(line.trim());
      }

      // 2個以上の改行で段落ブロックに分割（ここがカード分割の基本ルール）
      const rawBlocks = text.split(/\n{2,}/);

      rawBlocks.forEach(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return;

        const lines = trimmedBlock.split('\n');
        let narrativeBuffer = [];

        // 地の文バッファをカード化してフラッシュする
        function flushNarrative() {
          if (narrativeBuffer.length === 0) return;
          // 単一改行（\n）はそのまま保持して結合する
          const joined = narrativeBuffer.join('\n').trim();
          if (joined) result.push(joined);
          narrativeBuffer = [];
        }

        let i = 0;
        while (i < lines.length) {
          const lineTrimmed = lines[i].trim();

          if (!lineTrimmed) {
            i++;
            continue;
          }

          if (isSpeechStart(lineTrimmed)) {
            // 地の文バッファを先にフラッシュ
            flushNarrative();

            // 複数行にまたがるセリフをひとつに結合する
            let speechLines = [lineTrimmed];
            let closed = isSpeechEnd(lineTrimmed);

            while (!closed && i + 1 < lines.length) {
              i++;
              const nextTrimmed = lines[i].trim();

              // 次の行が新しいセリフ開始なら、ここで打ち切る
              if (nextTrimmed && isSpeechStart(nextTrimmed)
                  && !speechLines[speechLines.length - 1].endsWith('「')
                  && !speechLines[speechLines.length - 1].endsWith('『')) {
                i--;
                break;
              }

              if (nextTrimmed) {
                speechLines.push(nextTrimmed);
                closed = isSpeechEnd(nextTrimmed);
              }
            }

            // セリフを1枚のカードとして登録
            const speechText = speechLines.join('').trim();
            if (speechText) result.push(speechText);

          } else {
            // 地の文として蓄積（\n は保持）
            narrativeBuffer.push(lineTrimmed);
          }

          i++;
        }

        flushNarrative();
      });

      return result;
    }

    // 各行頭の全角・半角スペース、タブを完全に取り除く処理
    function removeLeadingSpaces(text) {
      return text.split('\n').map(line => {
        // 全角スペース(　)、半角スペース(\s)、タブなどを先頭から徹底除去
        return line.replace(/^[\s　]+/g, '');
      }).join('\n').trim();
    }

    // 目次（TOC）行の自動判別ロジック
    function isTocLine(text) {
      const trimmed = text.trim();
      if (/^(目\s*次|目\s*録|CONTENTS|Contents|Index|インデックス)$/i.test(trimmed)) {
        return true;
      }
      if (/([\.・…\-\s_~＝=]{3,})\s*\d+\s*$/.test(trimmed)) {
        return true;
      }
      return false;
    }

    // ページ番号（ノンブル）の自動判別ロジック
    function isPageNumberLine(text) {
      const trimmed = text.trim();
      // "1", "12", "P.1", "p. 12", "- 1 -", "— 1 —", "page 1", "Page 1", "[1]", "【1】"
      return /^(page\s*)?\d+$/i.test(trimmed) || 
             /^p\.\s*\d+$/i.test(trimmed) || 
             /^[-—－—\s]*\d+[-—－—\s]*$/.test(trimmed) ||
             /^\[\s*\d+\s*\]$/.test(trimmed) ||
             /^【\s*\d+\s*】$/.test(trimmed);
    }

    // 全角英数字を半角英数字に変換する関数
    function convertZenToHan(str) {
      return str.replace(/[０-９ａ-ｚＡ-Ｚ]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
    }

    // テキストデータの加工と画面表示への出力
    function processAndDisplay(isNewFileLoad = false) {
      if (rawTextBlocks.length === 0) return;

      const cleanNewlines = document.getElementById('chk-clean-newlines').checked;
      const excludeHeaderFooter = document.getElementById('chk-exclude-header-footer').checked;
      const excludeToc = document.getElementById('chk-exclude-toc').checked;

      let tempItems = [];
      globalId = 0; // グローバル変数をリセット（ローカル宣言しないことでID衝突を防ぐ）

      // ローカルストレージから保存されているデータを取得
      let savedData = [];
      if (currentFileName) {
        const rawSaved = localStorage.getItem('pdf_tool_save_' + currentFileName);
        if (rawSaved) {
          try {
            savedData = JSON.parse(rawSaved);
          } catch (e) {
            console.error("保存データの読み込みに失敗しました", e);
          }
        }
      }

      rawTextBlocks.forEach(block => {
        // 1. 各ページアイテムから文字列を結合
        let pageText = '';
        let lastY = null;

        block.items.forEach(item => {
          if (excludeHeaderFooter && !isCurrentFileText) {
            if (item.y < block.height * 0.10 || item.y > block.height * 0.90) {
              return; // 端領域を除外（上下 10% に拡大）
            }
          }

          if (lastY !== null) {
            const yDiff = Math.abs(item.y - lastY);
            if (yDiff > 25) { // 閾値を25pxに広げて、通常の改行が空行と誤判定されるのを防ぐ
              pageText += '\n\n';
            } else if (yDiff > 8) {
              pageText += '\n';
            } else if (pageText.length > 0 && !pageText.endsWith('\n') && item.str.trim() !== '') {
              pageText += '';
            }
          }
          pageText += item.str;
          lastY = item.y;
        });

        // 2. 段落 or 行に分割
        let items = [];
        if (splitMode === 'paragraph') {
          items = splitIntoParagraphs(pageText);
        } else {
          items = pageText.split('\n');
        }

        items.forEach(text => {
          let cleanedText = text.trim();
          if (!cleanedText) return;

          // 全角英数字を半角に変換
          if (document.getElementById('chk-convert-alphanum').checked) {
            cleanedText = convertZenToHan(cleanedText);
          }

          if (excludeToc && isTocLine(cleanedText)) {
            return;
          }

          // ページ番号の除外
          if (isPageNumberLine(cleanedText)) {
            return;
          }

          // 改行をマージする前に行頭スペースを削除
          cleanedText = removeLeadingSpaces(cleanedText);

          if (cleanNewlines) {
            cleanedText = cleanJapaneseNewlines(cleanedText);
            // マージされた結果によって再び生じる可能性のある行頭スペースも再度徹底クリーン
            cleanedText = removeLeadingSpaces(cleanedText);
          }

          // 半角スペース削除
          if (document.getElementById('chk-remove-half-spaces').checked) {
            cleanedText = cleanedText.replace(/ /g, '');
          }

          if (!cleanedText.trim()) return;

          let existingItem = processedItems.find(item => item.original === text);
          let savedItem = savedData.find(item => item.original === text);

          let isBookmarked = false;
          let noteText = "";
          let savedFurigana = undefined;
          let savedColor = 'slate';
          let savedTabName = undefined;
          let savedIsCopied = false;

          if (existingItem) {
            isBookmarked = existingItem.bookmarked;
            noteText = existingItem.note;
            savedColor = existingItem.color || 'slate';
            savedTabName = existingItem.tabName;
            savedIsCopied = existingItem.isCopied || false;
            if (existingItem.text === cleanedText) {
              savedFurigana = existingItem.furiganaHtml;
            }
          } else if (savedItem) {
            isBookmarked = savedItem.bookmarked;
            noteText = savedItem.note;
            savedFurigana = savedItem.furiganaHtml;
            savedColor = savedItem.color || 'slate';
            savedTabName = savedItem.tabName;
            savedIsCopied = savedItem.isCopied || false;
          }

          tempItems.push({
            id: globalId++,
            original: text,
            text: cleanedText, // 画面表示側で動的に話者名除外をするため、ここには原本を保持
            bookmarked: isBookmarked,
            note: noteText,
            page: block.page,
            isEditing: false,
            furiganaHtml: savedFurigana,
            color: savedColor,
            tabName: savedTabName,
            isCopied: savedIsCopied
          });
        });
        // globalIdはグローバルスコープで宣言済み
      });

      processedItems = tempItems;

      // コマンドカード（isCommand）の復元処理
      if (savedData && savedData.length > 0) {
        const commandItems = savedData.filter(d => d.isCommand);
        commandItems.forEach(cmd => {
          let insertIdx = 0;
          if (cmd.insertAfterOriginal) {
            const foundIdx = processedItems.findIndex(p => p.original === cmd.insertAfterOriginal);
            if (foundIdx !== -1) insertIdx = foundIdx + 1;
          }
          
          processedItems.splice(insertIdx, 0, {
            id: Date.now() + Math.floor(Math.random() * 1000), // unique ID
            page: processedItems[insertIdx > 0 ? insertIdx - 1 : 0]?.page || 1,
            text: cmd.text,
            color: cmd.color || 'slate',
            isCommand: true,
            tabName: cmd.tabName,
            isCopied: cmd.isCopied || false
          });
        });
      }

      renderList();

      if (kuroshiroEnabled) {
        toggleFurigana();
      }

      if (isNewFileLoad && savedData.length > 0) {
        showToast('データを復元しました', `このPDF用に保存されていた しおり/メモ/コマンド などを復元しました。`, 'success');
      }
    }

    // 日本語の文章内での不自然な改行を排除するロジック（もともとの改行は美しく残す）
    function cleanJapaneseNewlines(text) {
      const lines = text.split('\n');
      let result = [];

      for (let i = 0; i < lines.length; i++) {
        let currentLine = lines[i].trim();
        if (!currentLine) {
          result.push('');
          continue;
        }

        if (i === lines.length - 1) {
          result.push(currentLine);
          break;
        }

        let nextLine = lines[i + 1].trim();
        if (!nextLine) {
          result.push(currentLine);
          continue;
        }

        const lastChar = currentLine.slice(-1);
        const firstChar = nextLine.charAt(0);

        const isLastCharJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF]/.test(lastChar);
        const isNotSentenceEnd = !/[。！？」』！？?!）\)\>＞\]］｝\}]/.test(lastChar);
        const isNextCharNormal = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\w]/.test(firstChar);
        const isNextNotStartBracket = !/[「『（｛【\[＜＜]/.test(firstChar);

        // 強力な改行維持条件
        let preventJoin = false;

        // 1. 次の行が検出された話者名で始まっている場合
        let isNextSpeaker = false;
        for (const speaker of detectedSpeakers) {
          if (nextLine.startsWith(speaker)) {
            const rest = nextLine.substring(speaker.length).trim();
            if (/^[「『：:]/.test(rest)) {
              isNextSpeaker = true;
              break;
            }
          }
        }
        if (isNextSpeaker) {
          preventJoin = true;
        }

        // 2. 次の行が特定の記号（――、・、-、*）で始まっている場合
        if (/^(――|・|\-|\*)/.test(nextLine)) {
          preventJoin = true;
        }

        if (isLastCharJapanese && isNotSentenceEnd && isNextCharNormal && isNextNotStartBracket && !preventJoin) {
          lines[i + 1] = currentLine + nextLine;
        } else {
          result.push(currentLine);
        }
      }

      return result.filter(line => line !== null).join('\n').trim();
    }


    // リストのHTMLレンダリング
    function renderList() {
      const container = document.getElementById('text-list');
      const countBadge = document.getElementById('items-count');

      if (processedItems.length === 0) {
        container.innerHTML = `
          <div class="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-3">
            <i data-lucide="file-question" class="w-10 h-10 text-slate-300"></i>
            <p class="text-sm">左側のパネルからPDFファイルを読み込んでください</p>
          </div>
        `;
        countBadge.innerText = '0件の項目';
        lucide.createIcons();
        updateBookmarkAndNoteLists();
        return;
      }

      countBadge.innerText = `${processedItems.length}件の項目`;
      container.innerHTML = '';

      processedItems.forEach(item => {
        const card = document.createElement('div');
        let isSelected = selectedCardIds.has(item.id);
        const cardBg = item.isEditing ? 'bg-amber-50 border-amber-300' : 
                       isSelected ? 'bg-teal-100 border-teal-400 outline outline-2 outline-teal-400' : 
                       `${colorObj.bg} ${colorObj.hoverBg} ${colorObj.border} ${colorObj.hoverBorder}`;
        
        card.className = `group relative ${cardBg} border rounded-xl p-3.5 transition-all duration-150 flex flex-col justify-between gap-2 shadow-sm ${item.isCopied ? 'border-l-4 border-l-teal-500' : ''}`;
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-page', item.page);

        // ドラッグ＆ドロップ設定 (編集モード時のみ)
        if (globalMode === 'edit' && !item.isEditing) {
          card.draggable = true;
          card.ondragstart = (e) => handleDragStart(e, item.id);
          card.ondragover = (e) => handleDragOver(e);
          card.ondrop = (e) => handleDrop(e, item.id);
          card.ondragenter = (e) => handleDragEnter(e, card);
          card.ondragleave = (e) => handleDragLeave(e, card);
        }

        // 表示時は常に話者名を残して表示する
        const displayText = item.text;

        card.innerHTML = `
          ${item.isCopied ? `
            <div class="absolute -top-2 -right-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
              <i data-lucide="check-circle-2" class="w-3 h-3"></i> コピー済み
              <button onclick="event.stopPropagation(); removeCopiedMark(${item.id})" class="ml-1 hover:text-teal-200 transition-colors" title="コピー済みマークを消す">
                <i data-lucide="x" class="w-3 h-3"></i>
              </button>
            </div>
          ` : ''}
          <div class="flex justify-between items-start gap-4">
            <!-- ページバッジとタブ設定 -->
            <div class="flex items-center gap-2">
              ${globalMode === 'edit' ? `
                <div class="cursor-pointer p-0.5 rounded transition-all flex items-center justify-center ${isSelected ? 'bg-teal-500 text-white' : 'border border-slate-300 text-transparent hover:border-teal-400'} shadow-sm bg-white" onclick="toggleCardSelection(${item.id}, event)" style="width: 20px; height: 20px;" title="選択 (Shift+クリックで範囲選択)">
                  <i data-lucide="check" class="w-3 h-3 ${isSelected ? 'text-white' : 'hidden group-hover:block text-teal-400'}"></i>
                </div>
              ` : ''}
              <button onclick="event.stopPropagation(); jumpToPreviewPage(${item.page})" class="text-[10px] font-bold bg-slate-200 hover:bg-teal-600 hover:text-white text-slate-600 px-2 py-0.5 rounded transition-all flex-shrink-0" title="本紙プレビューをP. ${item.page}に切り替える">
                P. ${item.page}
              </button>
              <div class="flex items-center bg-white/60 border border-slate-200 rounded px-1.5 py-0.5 shadow-sm hover:border-teal-400 transition-colors" title="このカードの送信先タブ（ココフォリア連携用）" onclick="event.stopPropagation()">
                <i data-lucide="send" class="w-3 h-3 text-teal-600 mr-1"></i>
                <input type="text" value="${escapeHtml(item.tabName || '')}" onchange="updateCardTab(${item.id}, this.value)" placeholder="タブ指定..." class="bg-transparent text-[10px] w-20 outline-none text-slate-700 placeholder-slate-400" />
              </div>
            </div>
            <!-- アクションボタン群 -->
            <div class="flex items-center gap-1" onclick="event.stopPropagation()">
              ${item.isEditing ? `
                <!-- 編集モード中ボタン -->
                <button onclick="splitCardAtCursor(${item.id})" class="text-slate-400 hover:text-violet-600 p-0.5 rounded transition-all" title="カーソル位置で分割">
                  <i data-lucide="split" class="w-4 h-4"></i>
                </button>
                <button onclick="mergeCardWithNext(${item.id})" class="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-all" title="次のカードと結合">
                  <i data-lucide="merge" class="w-4 h-4"></i>
                </button>
                <button onclick="saveEditCard(${item.id})" class="text-white bg-teal-600 hover:bg-teal-700 px-2 py-0.5 rounded text-[10px] font-bold transition-all" title="変更を保存">
                  保存
                </button>
                <button onclick="cancelEditCard(${item.id})" class="text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold transition-all" title="キャンセル">
                  戻す
                </button>
              ` : `
                <!-- 通常モードボタン -->
                <div class="relative inline-block" title="カードの色を変更">
                  <button onclick="toggleColorPalette(${item.id}, event)" class="text-slate-400 hover:text-indigo-500 p-0.5 rounded transition-all">
                    <i data-lucide="palette" class="w-4 h-4"></i>
                  </button>
                  <div id="palette-popup-${item.id}" class="absolute right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg rounded-lg p-2 hidden gap-1.5 z-10 w-[160px] flex-wrap">
                    ${cardColors.map(c => `
                      <button onclick="changeCardColor(${item.id}, '${c.id}'); toggleColorPalette(${item.id}, event)" title="${c.name}" class="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform ${c.bg}"></button>
                    `).join('')}
                  </div>
                </div>
                <button onclick="startEditCard(${item.id})" class="text-slate-400 hover:text-amber-600 p-0.5 rounded transition-all" title="テキストを編集">
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="toggleNoteInput(${item.id})" class="text-slate-400 hover:text-emerald-600 p-0.5 rounded transition-all" title="付箋（メモ）を貼る">
                  <i data-lucide="sticky-note" class="w-4 h-4 ${item.note ? 'text-emerald-500 fill-emerald-100' : ''}"></i>
                </button>
                <button onclick="toggleBookmark(${item.id})" class="text-slate-400 hover:text-amber-500 p-0.5 rounded transition-all" title="しおりを挟む">
                  <i data-lucide="bookmark" class="w-4 h-4 ${item.bookmarked ? 'text-amber-500 fill-amber-500' : ''}"></i>
                </button>
                <button onclick="deleteCard(${item.id})" class="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all" title="このカードを削除">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </button>
                <div class="w-px h-4 bg-slate-200 mx-1"></div>
                <button onclick="insertSceneCommandBelow(${item.id})" class="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition-all" title="直下にシーン変更コマンドを挿入">
                  <i data-lucide="list-plus" class="w-4 h-4"></i>
                </button>
              `}
            </div>
          </div>

          <!-- テキスト中身（通常表示: クリックでコピー / 編集モード: textarea） -->
          ${item.isEditing ? `
            <textarea id="edit-textarea-${item.id}"
              class="w-full text-sm text-slate-800 leading-relaxed border border-amber-300 rounded-lg p-2 resize-none focus:ring-1 focus:ring-amber-400 outline-none bg-white min-h-[80px]"
              rows="${Math.max(3, (displayText.match(/\n/g) || []).length + 2)}"
            >${escapeHtml(displayText)}</textarea>
          ` : `
            ${globalMode === 'copy' ? `
              <div class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed select-all cursor-pointer" onclick="copyItemText(${item.id})" title="クリックでコピー">${kuroshiroEnabled && item.furiganaHtml ? item.furiganaHtml : escapeHtml(displayText)}</div>
            ` : `
              <div class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed cursor-text outline-none focus:ring-1 focus:ring-teal-400 focus:bg-white rounded px-1 -mx-1" contenteditable="true" onkeydown="handleCardTextKeydown(event, ${item.id})" onblur="handleCardTextBlur(event, ${item.id})" title="クリックしてカーソルを置き、Enterキーで分割">${kuroshiroEnabled && item.furiganaHtml ? item.furiganaHtml : escapeHtml(displayText)}</div>
            `}
          `}

          <!-- メモ入力エリア / 表示エリア -->
          <div class="mt-1.5 text-xs border-t border-dashed border-slate-200/60 pt-2 ${item.note || item.isEditingNote ? '' : 'hidden'}" id="note-wrapper-${item.id}" onclick="event.stopPropagation()">
            <div id="note-view-${item.id}" class="${item.note && !item.isEditingNote ? 'flex justify-between items-center bg-emerald-50/50 p-2 rounded-lg border border-emerald-100' : 'hidden'}">
              <span class="text-emerald-800 font-medium flex items-center gap-1">
                <i data-lucide="pencil" class="w-3 h-3 text-emerald-600"></i>
                <span class="italic font-normal">${escapeHtml(item.note)}</span>
              </span>
              <div class="flex items-center gap-1">
                <button onclick="editNote(${item.id})" class="text-slate-400 hover:text-teal-600 p-0.5"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteNote(${item.id})" class="text-slate-400 hover:text-rose-500 p-0.5"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
              </div>
            </div>
            
            <div id="note-edit-${item.id}" class="${item.isEditingNote || (!item.note) ? '' : 'hidden'} flex gap-1 items-center">
              <input type="text" id="note-input-${item.id}" value="${escapeHtml(item.note)}" placeholder="ここにメモ（付箋）を入力..." class="flex-grow text-xs px-2 py-1.5 border border-slate-300 rounded outline-none focus:ring-1 focus:ring-teal-500">
              <button onclick="saveNote(${item.id})" class="bg-emerald-600 text-white px-2.5 py-1.5 rounded hover:bg-emerald-700 font-bold"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
              <button onclick="cancelNoteEdit(${item.id})" class="bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded hover:bg-slate-300"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      lucide.createIcons();
      updateBookmarkAndNoteLists();
    }

    // カードの色変更
    function changeCardColor(id, colorId) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.color = colorId;
        const mappedTab = Object.keys(tabColorMapping).find(k => tabColorMapping[k] === colorId);
        if (mappedTab) {
          item.tabName = mappedTab;
        }
        renderList();
        saveToLocalStorage();
      }
    }

    // しおりのON/OFF切り替え
    function toggleBookmark(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.bookmarked = !item.bookmarked;
        renderList();
        saveToLocalStorage();
        showToast(item.bookmarked ? 'しおりを挟みました' : 'しおりを外しました', item.text.substring(0, 15) + '...', 'info');
      }
    }

    // メモ入力エリアのトグル表示
    function toggleNoteInput(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.isEditingNote = !item.isEditingNote;
        renderList();
      }
    }

    // メモの保存
    function saveNote(id) {
      const item = processedItems.find(i => i.id === id);
      const input = document.getElementById(`note-input-${id}`);
      if (item && input) {
        item.note = input.value.trim();
        item.isEditingNote = false;
        renderList();
        saveToLocalStorage();
        showToast('付箋を貼りました', item.note ? `「${item.note}」` : '空の付箋', 'success');
      }
    }

    // メモの編集
    function editNote(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.isEditingNote = true;
        renderList();
      }
    }

    // メモのキャンセル
    function cancelNoteEdit(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.isEditingNote = false;
        renderList();
      }
    }

    // メモの削除
    function deleteNote(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.note = "";
        item.isEditingNote = false;
        renderList();
        saveToLocalStorage();
        showToast('付箋を剥がしました', '', 'info');
      }
    }

    // 右側サイドバー（しおり・付箋）の更新
    function updateBookmarkAndNoteLists() {
      const bList = document.getElementById('bookmark-list');
      const nList = document.getElementById('note-list');
      const bCount = document.getElementById('bookmark-count');
      const nCount = document.getElementById('note-count');

      const bookmarks = processedItems.filter(i => i.bookmarked);
      bCount.innerText = bookmarks.length;
      if (bookmarks.length === 0) {
        bList.innerHTML = `<p class="text-[11px] text-slate-400 text-center py-6">しおりのある項目はありません</p>`;
      } else {
        bList.innerHTML = '';
        bookmarks.forEach(item => {
          const div = document.createElement('div');
          div.className = "p-2 bg-amber-50/50 hover:bg-amber-100/40 border border-amber-100 rounded-lg text-xs text-slate-700 cursor-pointer transition-all flex justify-between items-center gap-2";
          div.setAttribute('title', 'クリックで該当箇所にジャンプ');

          div.onclick = () => {
            const targetCard = document.querySelector(`[data-id="${item.id}"]`);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetCard.classList.add('bg-amber-100/60', 'border-amber-400');
              setTimeout(() => {
                targetCard.classList.remove('bg-amber-100/60', 'border-amber-400');
              }, 800);
            }
          };

          div.innerHTML = `
            <span class="truncate flex-grow">${escapeHtml(item.text)}</span>
            <button onclick="event.stopPropagation(); toggleBookmark(${item.id})" class="text-amber-500 hover:text-rose-500 p-0.5" title="しおりを外す">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          `;
          bList.appendChild(div);
        });
      }

      const notes = processedItems.filter(i => i.note);
      nCount.innerText = notes.length;
      if (notes.length === 0) {
        nList.innerHTML = `<p class="text-[11px] text-slate-400 text-center py-6">メモ付きのカードがありません</p>`;
      } else {
        nList.innerHTML = '';
        notes.forEach(item => {
          const div = document.createElement('div');
          div.className = "p-2.5 bg-emerald-50/50 hover:bg-emerald-100/40 border border-emerald-100 rounded-lg text-xs text-slate-700 cursor-pointer transition-all flex flex-col gap-1";
          div.setAttribute('title', 'クリックでメモをコピー');
          div.onclick = () => copyText(item.note, 'メモ（付箋）の内容');
          div.innerHTML = `
            <div class="flex justify-between items-start gap-2">
              <span class="font-semibold text-emerald-800 flex items-center gap-1">
                <i data-lucide="sticky-note" class="w-3 h-3 text-emerald-600 fill-emerald-100"></i>
                ${escapeHtml(item.note)}
              </span>
              <button onclick="event.stopPropagation(); deleteNote(${item.id})" class="text-slate-400 hover:text-rose-500 p-0.5" title="付箋を剥がす">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <p class="text-[10px] text-slate-400 truncate italic">原文: "${escapeHtml(item.text)}"</p>
          `;
          nList.appendChild(div);
        });
      }

      lucide.createIcons();
    }

    // カードのタブ設定を更新
    function updateCardTab(id, tabName) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.tabName = tabName;
        if (tabColorMapping[tabName]) {
          item.color = tabColorMapping[tabName];
        }
        saveToLocalStorage();
        renderList();
      }
    }

    // シーンコマンドを直下に挿入
    function insertSceneCommandBelow(id) {
      const index = processedItems.findIndex(i => i.id === id);
      if (index !== -1) {
        const withoutBgm = confirm('BGMなしのシーン変更にしますか？\n（OKでBGMなし、キャンセルで通常）');
        const sceneName = prompt('シーン名を入力してください:');
        if (sceneName !== null) {
          const commandText = withoutBgm ? `/scene-without-bgm ${sceneName}` : `/scene ${sceneName}`;
          const newItem = {
            id: Date.now(),
            page: processedItems[index].page,
            text: commandText,
            color: 'slate',
            isCommand: true
          };
          processedItems.splice(index + 1, 0, newItem);
          saveToLocalStorage();
          renderList();
          
          setTimeout(() => {
            const targetCard = document.querySelector(`[data-id="${newItem.id}"]`);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetCard.classList.add('bg-teal-50', 'border-teal-400');
              setTimeout(() => {
                targetCard.classList.remove('bg-teal-50', 'border-teal-400');
              }, 1500);
            }
          }, 50);
        }
      }
    }

    // リストアイテムのコピー
    function copyItemText(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        let textToCopy = item.text;
        if (item.tabName) {
          textToCopy = `__CCFOLIA_TAB:${item.tabName}__\n` + textToCopy;
        }
        copyText(textToCopy, 'テキスト');

        item.isCopied = true;
        saveToLocalStorage();
        renderList();

        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
          card.classList.add('bg-teal-100/30', 'border-teal-500');
          setTimeout(() => {
            card.classList.remove('bg-teal-100/30', 'border-teal-500');
          }, 400);
        }
      }
    }

    // コピー済みマークの個別削除
    function removeCopiedMark(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item.isCopied = false;
        saveToLocalStorage();
        renderList();
      }
    }

    // 全てのコピー済みマークを消去
    function clearAllCopied() {
      if (confirm('すべてのコピー済みマークを消去しますか？')) {
        let changed = false;
        processedItems.forEach(item => {
          if (item.isCopied) {
            item.isCopied = false;
            changed = true;
          }
        });
        if (changed) {
          saveToLocalStorage();
          renderList();
        }
      }
    }

    // 汎用クリップボードコピー処理
    function copyText(text, typeLabel = 'テキスト') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        const success = document.execCommand('copy');
        if (success) {
          showToast('コピー成功！', `${typeLabel}をクリップボードにコピーしました。`, 'success');
        } else {
          showToast('コピー失敗', 'コピーに失敗しました。手動で選択してコピーしてください。', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('コピーエラー', 'ブラウザ制限のためコピーできません。', 'error');
      } finally {
        document.body.removeChild(textarea);
      }
    }

    // TRPGキーワード一括カッコ {} 変換ロジック
    function applyKeywordWrapping() {
      if (processedItems.length === 0) {
        showToast('お知らせ', 'PDFテキストが読み込まれていません。', 'info');
        return;
      }

      const inputKeywords = document.getElementById('replace-keywords').value;
      if (!inputKeywords.trim()) {
        showToast('エラー', 'キーワードを入力してください。', 'error');
        return;
      }

      const keywords = inputKeywords.split(/[,,、]/).map(k => k.trim()).filter(k => k);

      if (keywords.length === 0) {
        showToast('エラー', '有効なキーワードが見つかりませんでした。', 'error');
        return;
      }

      let replaceCount = 0;

      processedItems.forEach(item => {
        let currentText = item.text;
        keywords.forEach(keyword => {
          const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(?<!\\{)${escapedKeyword}(?!\\})`, 'g');

          const newText = currentText.replace(regex, `{${keyword}}`);
          if (newText !== currentText) {
            currentText = newText;
            replaceCount++;
          }
        });
        if (item.text !== currentText) {
          item.text = currentText;
          item.furiganaHtml = undefined;
        }
      });

      renderList();
      if (kuroshiroEnabled) {
        toggleFurigana();
      }
      saveToLocalStorage();
      showToast('一括変換完了！', `${replaceCount}箇所のワードを {} で囲みました。`, 'success');
    }

    // {} を全てのカードから消去する
    function removeAllBraces() {
      if (processedItems.length === 0) {
        showToast('お知らせ', 'PDFテキストが読み込まれていません。', 'info');
        return;
      }
      let count = 0;
      processedItems.forEach(item => {
        const newText = item.text.replace(/\{([^}]+)\}/g, '$1');
        if (newText !== item.text) {
          item.text = newText;
          item.furiganaHtml = undefined;
          count++;
        }
      });
      renderList();
      if (kuroshiroEnabled) {
        toggleFurigana();
      }
      saveToLocalStorage();
      showToast('{} 消去完了', `${count}カードの {} を取り除きました。`, 'info');
    }

    // カスタム一括置換
    function applyCustomReplace() {
      if (processedItems.length === 0) {
        showToast('お知らせ', 'PDFテキストが読み込まれていません。', 'info');
        return;
      }
      
      const fromStr = document.getElementById('custom-replace-from').value;
      const toStr = document.getElementById('custom-replace-to').value;
      
      if (!fromStr) {
        showToast('エラー', '置換前の文字を入力してください。', 'error');
        return;
      }
      
      let replaceCount = 0;
      processedItems.forEach(item => {
        if (item.text.includes(fromStr)) {
          item.text = item.text.split(fromStr).join(toStr);
          item.original = item.original.split(fromStr).join(toStr);
          item.furiganaHtml = undefined;
          replaceCount++;
        }
      });
      
      if (replaceCount > 0) {
        renderList();
        if (kuroshiroEnabled) {
          toggleFurigana();
        }
        saveToLocalStorage();
        showToast('一括置換完了', `${replaceCount}個のカードで「${fromStr}」を置換しました。`, 'success');
      } else {
        showToast('お知らせ', `「${fromStr}」は見つかりませんでした。`, 'info');
      }
    }

    // テキストリストを1カードずつスクロールする（▲ = -1 / ▼ = +1）
    function scrollTextList(direction) {
      const list = document.getElementById('text-list');
      if (!list) return;

      const cards = Array.from(list.querySelectorAll('[data-id]'));
      if (cards.length === 0) return;

      const listRect = list.getBoundingClientRect();
      let currentIdx = 0;
      for (let i = 0; i < cards.length; i++) {
        const cardRect = cards[i].getBoundingClientRect();
        // コンテナの上端に最も近い（見えている）カードを探す
        // 少し余裕を持たせて +10 
        if (cardRect.bottom > listRect.top + 10) {
          currentIdx = i;
          break;
        }
      }

      // 前後に1カード移動
      let targetIdx = Math.max(0, Math.min(cards.length - 1, currentIdx + direction));

      const targetCard = cards[targetIdx];
      if (!targetCard) return;

      // カードをスクロールコンテナの先頭に合わせて表示
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // 一瞬ハイライト
      targetCard.style.outline = '2px solid #0d9488';
      setTimeout(() => { targetCard.style.outline = ''; }, 600);
    }

    // --- ふりがな機能 (Kuroshiro.js) ---

    let isFuriganaProcessing = false;

    // Web Worker 用のコード
    const workerScript = `
      importScripts(
        'https://cdn.jsdelivr.net/npm/kuroshiro@1.1.2/dist/kuroshiro.min.js',
        'https://cdn.jsdelivr.net/npm/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js'
      );
      
      let kuroshiroInstance = null;
      
      self.onmessage = async function(e) {
        const { type, payload, id } = e.data;
        
        if (type === 'init') {
          try {
            kuroshiroInstance = new Kuroshiro();
            await kuroshiroInstance.init(new KuromojiAnalyzer({
              dictPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict'
            }));
            self.postMessage({ type: 'init_success' });
          } catch (err) {
            self.postMessage({ type: 'init_error', error: err.message });
          }
        } 
        else if (type === 'convert') {
          try {
            if (!kuroshiroInstance) throw new Error("Not initialized");
            const result = await kuroshiroInstance.convert(payload, { mode: 'furigana', to: 'hiragana' });
            self.postMessage({ type: 'convert_success', id: id, result: result });
          } catch (err) {
            self.postMessage({ type: 'convert_error', id: id, error: err.message });
          }
        }
      };
    `;

    // ふりがなチェックボックスのON/OFF
    async function toggleFurigana() {
      if (isFuriganaProcessing) return;
      
      const chk = document.getElementById('chk-furigana');
      kuroshiroEnabled = chk.checked;

      if (!kuroshiroEnabled) {
        renderList();
        return;
      }

      isFuriganaProcessing = true;
      try {
        // 辞書の初期化（初回のみ）
        const ok = await initKuroshiroWorker();
        if (!ok) {
          chk.checked = false;
          kuroshiroEnabled = false;
          return;
        }

        // まだ変換していないカードのみ処理する
        const toProcess = processedItems.filter(item => !item.furiganaHtml);
        if (toProcess.length > 0) {
          showToast('ふりがな生成中', `${toProcess.length}件のカードをバックグラウンドで変換しています...`, 'info');
          updateStatus('loading', `ふりがな生成中... (0/${toProcess.length})`);
          
          let count = 0;
          for (const item of toProcess) {
            // チェックが外されたら中断
            if (!document.getElementById('chk-furigana').checked) {
              break;
            }
            try {
              const raw = await convertFuriganaWorker(item.text, item.id);
              item.furiganaHtml = rubyToFuriganaSpan(raw, item.id);
            } catch (e) {
              item.furiganaHtml = escapeHtml(item.text);
            }
            count++;
            updateStatus('loading', `ふりがな生成中... (${count}/${toProcess.length})`);
          }
          updateStatus('success', 'ふりがな生成完了！');
        }

        if (document.getElementById('chk-furigana').checked) {
          renderList();
          showToast('ふりがな表示ON', '漢字にカーソルを乗せると読み仮名が表示されます。', 'success');
        }
      } finally {
        isFuriganaProcessing = false;
      }
    }

    // KuroshiroのWeb Worker初期化
    function initKuroshiroWorker() {
      return new Promise((resolve) => {
        if (kuroshiroReady) {
          resolve(true);
          return;
        }

        showToast('辞書を読み込み中...', 'バックグラウンドで辞書データを解析しています。画面は固まりませんのでそのままお待ちください（初回のみ）。', 'info');
        updateStatus('loading', '辞書データを解析中...（バックグラウンド処理）');

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        kuroshiroWorker = new Worker(URL.createObjectURL(blob));

        kuroshiroWorker.onmessage = function(e) {
          if (e.data.type === 'init_success') {
            kuroshiroReady = true;
            resolve(true);
          } else if (e.data.type === 'init_error') {
            console.error('Kuroshiro Worker Init Error:', e.data.error);
            showToast('エラー', 'ふりがな辞書の読み込みに失敗しました。ネットワーク接続を確認してください。', 'error');
            updateStatus('error', '辞書の読み込みに失敗しました。');
            resolve(false);
          }
        };

        kuroshiroWorker.onerror = function(err) {
          console.error('Worker Error:', err);
          showToast('エラー', 'Web Workerの起動に失敗しました。', 'error');
          resolve(false);
        };

        kuroshiroWorker.postMessage({ type: 'init' });
      });
    }

    // Workerを使ってふりがなを変換する
    function convertFuriganaWorker(text, id) {
      return new Promise((resolve, reject) => {
        const messageHandler = function(e) {
          if (e.data.id === id) {
            if (e.data.type === 'convert_success') {
              kuroshiroWorker.removeEventListener('message', messageHandler);
              resolve(e.data.result);
            } else if (e.data.type === 'convert_error') {
              kuroshiroWorker.removeEventListener('message', messageHandler);
              reject(new Error(e.data.error));
            }
          }
        };
        kuroshiroWorker.addEventListener('message', messageHandler);
        kuroshiroWorker.postMessage({ type: 'convert', payload: text, id: id });
      });
    }

    // Kuroshiroの<ruby>出力をカスタムtooltipスパンに変換する
    function rubyToFuriganaSpan(rubyHtml, itemId) {
      // 改行を保持するためプレースホルダーに退避
      const NL = '\uE000'; // PUA文字を改行の仮置き
      let html = rubyHtml.replace(/\n/g, NL);

      // <ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby> もしくは <ruby>漢字<rt>かんじ</rt></ruby> に対応
      html = html.replace(/<ruby>([^<]*)(?:<rp>[^<]*<\/rp>)?<rt>([^<]*)<\/rt>(?:<rp>[^<]*<\/rp>)?<\/ruby>/g, (match, base, reading) => {
        const safeBase = base.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeReading = reading.replace(/"/g, '&quot;').replace(/&/g, '&amp;');
        return `<span class="furigana-word" data-reading="${safeReading}" onclick="editFurigana(event, this, ${itemId})">${safeBase}</span>`;
      });

      // 改行を復元
      return html.replace(new RegExp(NL, 'g'), '\n');
    }

    // ふりがなを修正する
    function editFurigana(event, element, itemId) {
      event.stopPropagation(); // コピーイベントを防止
      const currentReading = element.getAttribute('data-reading');
      const baseText = element.innerText;

      const newReading = prompt(`「${baseText}」のふりがなを修正してください:`, currentReading);

      if (newReading !== null && newReading.trim() !== "") {
        element.setAttribute('data-reading', newReading.trim());
        
        // 元のDOM文字列も更新しておく
        const item = processedItems.find(i => i.id === itemId);
        if (item) {
          const textDiv = element.closest('div.text-sm.text-slate-700');
          if (textDiv) {
            item.furiganaHtml = textDiv.innerHTML;
            saveToLocalStorage();
          }
        }
        showToast('ふりがな修正', `「${baseText}」の読み方を「${newReading.trim()}」に変更しました。`, 'success');
      }
    }

    // --- カード編集機能 ---

    // 編集モードを開始する
    function startEditCard(id) {
      // 他のカードの編集モードを閉じてから開く
      processedItems.forEach(item => { item.isEditing = false; });
      const item = processedItems.find(i => i.id === id);
      if (item) {
        item._editOriginal = item.text; // キャンセル用に元テキストを保存
        item.isEditing = true;
        renderList();
        // textareaにフォーカス
        const ta = document.getElementById(`edit-textarea-${id}`);
        if (ta) ta.focus();
      }
    }

    // 編集内容を保存して編集モードを終了
    function saveEditCard(id) {
      const item = processedItems.find(i => i.id === id);
      const ta = document.getElementById(`edit-textarea-${id}`);
      if (item && ta) {
        if (item.text !== ta.value) {
          item.text = ta.value;
          item.furiganaHtml = undefined;
        }
        item.isEditing = false;
        delete item._editOriginal;
        renderList();
        if (kuroshiroEnabled && !item.furiganaHtml) {
          toggleFurigana();
        }
        saveToLocalStorage();
        showToast('保存完了', 'テキストを更新しました。', 'success');
      }
    }

    // 編集をキャンセルして元テキストに戻す。結合した場合は次のカードも復元する
    function cancelEditCard(id) {
      const item = processedItems.find(i => i.id === id);
      if (item) {
        // テキストを元に戻す
        if (item._editOriginal !== undefined) {
          item.text = item._editOriginal;
        }
        if (item._editOriginalFurigana !== undefined) {
          item.furiganaHtml = item._editOriginalFurigana;
          delete item._editOriginalFurigana;
        }
        // 結合の戻し: 削除した次のカードを復元する
        if (item._mergedNextItem !== undefined) {
          const idx = processedItems.findIndex(i => i.id === id);
          const insertAt = item._mergedNextInsertIdx !== undefined ? item._mergedNextInsertIdx : idx + 1;
          processedItems.splice(insertAt, 0, item._mergedNextItem);
          delete item._mergedNextItem;
          delete item._mergedNextInsertIdx;
        }
        item.isEditing = false;
        delete item._editOriginal;
        renderList();
        showToast('戻しました', '編集をキャンセルしました。', 'info');
      }
    }

    // カーソル位置でカードを分割する
    function splitCardAtCursor(id) {
      const item = processedItems.find(i => i.id === id);
      const ta = document.getElementById(`edit-textarea-${id}`);
      if (!item || !ta) return;

      const cursorPos = ta.selectionStart;
      const fullText = ta.value;

      const before = fullText.substring(0, cursorPos).trimEnd();
      const after = fullText.substring(cursorPos).trimStart();

      if (!before && !after) {
        showToast('分割不可', 'テキストが空です。', 'error');
        return;
      }
      if (!before || !after) {
        showToast('分割不可', '分割後に空のカードが生まれます。カーソルをテキストの中間に置いてください。', 'error');
        return;
      }

      const idx = processedItems.findIndex(i => i.id === id);
      const newItem = {
        id: globalId++,
        original: after,
        text: after,
        bookmarked: false,
        note: '',
        page: item.page,
        isEditing: false
      };

      item.text = before;
      item.furiganaHtml = undefined;
      item.isEditing = false;
      delete item._editOriginal;

      processedItems.splice(idx + 1, 0, newItem);
      renderList();
      if (kuroshiroEnabled) {
        toggleFurigana();
      }
      saveToLocalStorage();
      showToast('分割完了', 'カードを分割しました。', 'success');
    }

    // 次のカードと結合する
    function mergeCardWithNext(id) {
      const idx = processedItems.findIndex(i => i.id === id);
      if (idx < 0 || idx >= processedItems.length - 1) {
        showToast('結合不可', '次のカードがありません。', 'error');
        return;
      }
      const ta = document.getElementById(`edit-textarea-${id}`);
      const item = processedItems[idx];
      const nextItem = processedItems[idx + 1];

      // テキストエリアの現在の内容を使用（未保存の編集内容も反映）
      const currentText = ta ? ta.value : item.text;

      // キャンセル用に元情報を保存（次のカードも丸ごと保存）
      if (item._editOriginal === undefined) item._editOriginal = currentText;
      if (item._editOriginalFurigana === undefined) item._editOriginalFurigana = item.furiganaHtml;
      item._mergedNextItem = { ...nextItem }; // 削除する次のカードを保存
      item._mergedNextInsertIdx = idx + 1;    // 復元時の挿入位置

      item.text = currentText + '\n' + nextItem.text;
      item.furiganaHtml = undefined;
      item.isEditing = true;

      processedItems.splice(idx + 1, 1);
      renderList();
      const newTa = document.getElementById(`edit-textarea-${id}`);
      if (newTa) newTa.focus();
      showToast('結合完了', '次のカードと結合しました。「戻す」で天克復元できます。', 'success');
    }

    // カードを削除する
    function deleteCard(id) {
      const idx = processedItems.findIndex(i => i.id === id);
      if (idx >= 0) {
        processedItems.splice(idx, 1);
        renderList();
        saveToLocalStorage();
      }
    }

    // --- 新機能（モード切替・複数選択・一括操作・ドラッグ＆ドロップ） ---

    function setGlobalMode(mode) {
      globalMode = mode;
      
      const btnEdit = document.getElementById('btn-mode-edit');
      const btnCopy = document.getElementById('btn-mode-copy');
      
      if (mode === 'edit') {
        btnEdit.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-white text-teal-600 shadow-sm transition-all flex items-center gap-1";
        btnCopy.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1";
      } else {
        btnCopy.className = "px-2.5 py-1 text-xs font-bold rounded-md bg-white text-teal-600 shadow-sm transition-all flex items-center gap-1";
        btnEdit.className = "px-2.5 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1";
      }
      
      clearSelection();
    }

    function toggleCardSelection(id, event) {
      if (globalMode !== 'edit') return;
      
      const itemIndex = processedItems.findIndex(i => i.id === id);
      if (itemIndex === -1) return;

      if (event.shiftKey && lastSelectedId !== null) {
        const lastIndex = processedItems.findIndex(i => i.id === lastSelectedId);
        if (lastIndex !== -1) {
          const start = Math.min(itemIndex, lastIndex);
          const end = Math.max(itemIndex, lastIndex);
          
          const isSelecting = !selectedCardIds.has(id);
          
          for (let i = start; i <= end; i++) {
            if (isSelecting) {
              selectedCardIds.add(processedItems[i].id);
            } else {
              selectedCardIds.delete(processedItems[i].id);
            }
          }
        }
      } else {
        if (selectedCardIds.has(id)) {
          selectedCardIds.delete(id);
        } else {
          selectedCardIds.add(id);
        }
      }
      
      lastSelectedId = id;
      updateBulkActionBar();
      renderList();
    }

    function clearSelection() {
      selectedCardIds.clear();
      lastSelectedId = null;
      updateBulkActionBar();
      renderList();
    }

    function updateBulkActionBar() {
      const bar = document.getElementById('bulk-action-bar');
      const count = document.getElementById('selected-count');
      if (selectedCardIds.size > 0) {
        bar.classList.remove('hidden');
        count.innerText = selectedCardIds.size;
      } else {
        bar.classList.add('hidden');
      }
    }

    function bulkMergeSelected() {
      if (selectedCardIds.size < 2) {
        showToast('結合エラー', '結合するには2つ以上のカードを選択してください。', 'error');
        return;
      }
      
      const selectedItems = processedItems.filter(item => selectedCardIds.has(item.id));
      const firstItem = selectedItems[0];
      const mergedText = selectedItems.map(item => item.text).join('\\n');
      
      firstItem.text = mergedText;
      firstItem.furiganaHtml = undefined;
      
      const idsToRemove = new Set(selectedItems.map(item => item.id).slice(1));
      processedItems = processedItems.filter(item => !idsToRemove.has(item.id));
      
      clearSelection();
      saveToLocalStorage();
      showToast('一括結合', `${selectedItems.length}個のカードを結合しました。`, 'success');
    }

    function bulkSetTab() {
      const tabName = document.getElementById('bulk-tab-input').value.trim();
      if (!tabName) {
        showToast('エラー', 'タブ名を入力してください。', 'error');
        return;
      }
      
      if (selectedCardIds.size === 0) return;
      
      processedItems.forEach(item => {
        if (selectedCardIds.has(item.id)) {
          item.tabName = tabName;
          if (tabColorMapping[tabName]) {
            item.color = tabColorMapping[tabName];
          }
        }
      });
      
      clearSelection();
      saveToLocalStorage();
      showToast('タブ一括設定', '選択したカードにタブを設定しました。', 'success');
    }

    // --- ドラッグ＆ドロップ関連 ---
    function handleDragStart(e, id) {
      draggedCardId = id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      setTimeout(() => {
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) card.classList.add('opacity-50');
      }, 0);
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }

    function handleDragEnter(e, card) {
      e.preventDefault();
      if (draggedCardId && draggedCardId !== parseInt(card.getAttribute('data-id'))) {
        card.classList.add('border-indigo-400', 'bg-indigo-50');
      }
    }

    function handleDragLeave(e, card) {
      card.classList.remove('border-indigo-400', 'bg-indigo-50');
    }

    function handleDrop(e, targetId) {
      e.preventDefault();
      const card = document.querySelector(`[data-id="${targetId}"]`);
      if (card) card.classList.remove('border-indigo-400', 'bg-indigo-50');
      
      const sourceId = draggedCardId;
      draggedCardId = null;
      
      const draggedCardEl = document.querySelector(`[data-id="${sourceId}"]`);
      if (draggedCardEl) draggedCardEl.classList.remove('opacity-50');

      if (!sourceId || sourceId === targetId) return;

      const sourceIndex = processedItems.findIndex(i => i.id === sourceId);
      const targetIndex = processedItems.findIndex(i => i.id === targetId);
      
      if (sourceIndex === -1 || targetIndex === -1) return;

      const sourceItem = processedItems[sourceIndex];
      const targetItem = processedItems[targetIndex];
      
      const mergedText = sourceIndex < targetIndex 
        ? sourceItem.text + '\\n' + targetItem.text 
        : targetItem.text + '\\n' + sourceItem.text;
        
      targetItem.text = mergedText;
      targetItem.furiganaHtml = undefined;
      
      processedItems.splice(sourceIndex, 1);
      
      renderList();
      saveToLocalStorage();
      showToast('結合完了', 'カードをドラッグして結合しました。', 'success');
    }

    // --- エンターキーでのクイック分割 ---
    function handleCardTextKeydown(e, id) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // デフォルトの改行を防ぐ
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const textElement = e.currentTarget;
        
        const preRange = range.cloneRange();
        preRange.selectNodeContents(textElement);
        preRange.setEnd(range.startContainer, range.startOffset);
        
        const beforeText = preRange.toString();
        const fullText = textElement.innerText;
        const afterText = fullText.substring(beforeText.length);
        
        if (!beforeText.trim() || !afterText.trim()) {
          showToast('分割不可', 'カーソルをテキストの中間に置いてください。', 'error');
          return;
        }

        const itemIndex = processedItems.findIndex(i => i.id === id);
        if (itemIndex === -1) return;
        
        const item = processedItems[itemIndex];
        item.text = beforeText.trimEnd();
        item.furiganaHtml = undefined;
        
        const newItem = {
          id: globalId++,
          original: afterText.trimStart(),
          text: afterText.trimStart(),
          bookmarked: false,
          note: '',
          page: item.page,
          isEditing: false
        };
        
        processedItems.splice(itemIndex + 1, 0, newItem);
        renderList();
        saveToLocalStorage();
        showToast('分割完了', 'Enterキーでカードを分割しました。', 'success');
      }
    }
    
    function handleCardTextBlur(e, id) {
      const textElement = e.currentTarget;
      const newText = textElement.innerText;
      const item = processedItems.find(i => i.id === id);
      if (item && item.text !== newText) {
        item.text = newText;
        item.furiganaHtml = undefined;
        saveToLocalStorage();
      }
    }

    // --- プロジェクトファイル保存・読み込み ---

    // 編集データを .pec ファイルとしてダウンロード（Base64エンコードした JSON）
    function downloadProjectFile() {
      if (processedItems.length === 0) {
        showToast('お知らせ', '保存するデータがありません。', 'info');
        return;
      }
      const saveObj = {
        version: '1.0',
        fileName: currentFileName,
        savedAt: new Date().toISOString(),
        items: processedItems.map(item => ({
          id: item.id,
          original: item.original,
          text: item.text,
          bookmarked: item.bookmarked,
          note: item.note,
          page: item.page,
          furiganaHtml: item.furiganaHtml
        }))
      };
      // Base64エンコードして人が読みにくいファイルに
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(saveObj))));
      const blob = new Blob([encoded], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = currentFileName.replace(/\.pdf$/i, '');
      a.href = url;
      a.download = `${baseName}.pec`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('保存完了', `${a.download} で保存しました。`, 'success');
    }

    // .pec ファイルを読み込んで processedItems を復元する
    function loadProjectFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          // ArrayBufferからUint8Array経由でバイナリ文字列を安全に生成する
          const bytes = new Uint8Array(e.target.result);
          let binaryStr = '';
          for (let i = 0; i < bytes.length; i++) {
            binaryStr += String.fromCharCode(bytes[i]);
          }
          const decoded = decodeURIComponent(escape(atob(binaryStr)));
          const data = JSON.parse(decoded);
          if (!data.version || !data.items) {
            showToast('読込エラー', '有効な .pec ファイルではありません。', 'error');
            return;
          }
          processedItems = data.items.map(item => ({
            id: item.id,
            original: item.original || item.text,
            text: item.text,
            bookmarked: !!item.bookmarked,
            note: item.note || '',
            page: item.page || 1,
            isEditing: false,
            furiganaHtml: item.furiganaHtml
          }));
          // globalIdを更新してID重複を防ぐ
          const maxId = processedItems.length > 0 ? Math.max(...processedItems.map(i => i.id)) : 0;
          globalId = Math.max(maxId, globalId) + 1;
          currentFileName = data.fileName || '';
          renderList();
          showToast('読込完了', `${file.name} を読み込みました。${processedItems.length}件の項目を復元。`, 'success');
        } catch (err) {
          console.error('PEC読込エラー:', err);
          showToast('読込エラー', 'ファイルの解析に失敗しました。保存と同じブラウザで開いているか確認してください。', 'error');
        } finally {
          event.target.value = ''; // 同じファイルを再度選択できるようにリセット
        }
      };
      reader.readAsArrayBuffer(file); // バイナリ安全読み込みに変更
    }

    // 全クリア
    function clearText() {
      rawTextBlocks = [];
      processedItems = [];
      pdfDoc = null;
      pdfOutline = [];
      isOutlineOpen = false;
      detectedSpeakers.clear();
      document.getElementById('pdf-input').value = '';
      currentFileName = "";

      const statusContainer = document.getElementById('status-container');
      statusContainer.classList.add('hidden');

      // プレビューのクリーンアップ
      document.getElementById('preview-canvas').classList.add('hidden');
      document.getElementById('preview-placeholder').classList.remove('hidden');
      document.getElementById('preview-total-pages').innerText = "0";
      document.getElementById('preview-page-input').value = 0;

      // 目次のクリーンアップ
      const outlineContainer = document.getElementById('preview-outline-container');
      if (outlineContainer) outlineContainer.classList.add('hidden');
      const outlineTree = document.getElementById('preview-outline-tree');
      if (outlineTree) outlineTree.innerHTML = '';

      const btnToggle = document.getElementById('btn-toggle-pdf-outline');
      if (btnToggle) {
        btnToggle.disabled = true;
        btnToggle.classList.add('opacity-50', 'cursor-not-allowed');
        btnToggle.classList.remove('opacity-100', 'bg-slate-200', 'text-slate-800');
        btnToggle.classList.add('text-slate-400');
      }

      renderList();
      showToast('クリア完了', '読み込んだデータをすべて削除しました。', 'info');
    }

    // トースト通知（トーストメッセージ表示）
    function showToast(title, message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');

      let bg = 'bg-white';
      let text = 'text-slate-800';
      let border = 'border-slate-200';
      let iconColor = 'text-teal-500';
      let iconName = 'check-circle';

      if (type === 'error') {
        border = 'border-rose-100';
        bg = 'bg-rose-50';
        iconColor = 'text-rose-500';
        iconName = 'alert-triangle';
      } else if (type === 'info') {
        border = 'border-blue-100';
        bg = 'bg-blue-50';
        iconColor = 'text-blue-500';
        iconName = 'info';
      }

      toast.className = `${bg} ${text} border ${border} rounded-xl shadow-lg p-3 w-72 flex items-start gap-3 pointer-events-auto transition-all duration-300 opacity-0 transform translate-y-2`;

      toast.innerHTML = `
        <div class="${iconColor} flex-shrink-0 mt-0.5">
          <i data-lucide="${iconName}" class="w-5 h-5"></i>
        </div>
        <div class="flex-grow">
          <h4 class="text-xs font-bold">${escapeHtml(title)}</h4>
          ${message ? `<p class="text-[10px] text-slate-500 mt-0.5 leading-tight">${escapeHtml(message)}</p>` : ''}
        </div>
        <button class="text-slate-400 hover:text-slate-600 self-start" onclick="this.parentElement.remove()">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
      }, 50);

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 4000);
    }

    // PDFしおりツリーの抽出
    async function extractPdfOutline(doc) {
      const btn = document.getElementById('btn-toggle-pdf-outline');
      try {
        const outline = await doc.getOutline();
        if (!outline || outline.length === 0) {
          pdfOutline = [];
          if (btn) {
            btn.disabled = true;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.classList.remove('opacity-100');
          }
          return;
        }

        // 非同期で再帰的にしおりノードを解決する
        async function resolveNode(node) {
          let pageNum = null;
          if (node.dest) {
            try {
              let destObj = node.dest;
              if (typeof destObj === 'string') {
                destObj = await doc.getDestination(destObj);
              }
              if (Array.isArray(destObj) && destObj.length > 0) {
                const pageRef = destObj[0];
                if (pageRef && typeof pageRef === 'object') {
                  const pageIndex = await doc.getPageIndex(pageRef);
                  pageNum = pageIndex + 1;
                }
              }
            } catch (e) {
              console.error("しおりの宛先解決中にエラー:", e);
            }
          }

          const resolvedChildren = [];
          if (node.items && node.items.length > 0) {
            for (const child of node.items) {
              resolvedChildren.push(await resolveNode(child));
            }
          }

          return {
            title: node.title,
            page: pageNum,
            items: resolvedChildren
          };
        }

        const resolvedOutline = [];
        for (const item of outline) {
          resolvedOutline.push(await resolveNode(item));
        }

        pdfOutline = resolvedOutline;

        if (btn) {
          btn.disabled = false;
          btn.classList.remove('opacity-50', 'cursor-not-allowed');
          btn.classList.add('opacity-100');
        }

        renderPdfOutline();
      } catch (e) {
        console.error("しおり抽出エラー:", e);
        pdfOutline = [];
        if (btn) {
          btn.disabled = true;
          btn.classList.add('opacity-50', 'cursor-not-allowed');
          btn.classList.remove('opacity-100');
        }
      }
    }

    // PDFしおりのHTML描画
    function renderPdfOutline() {
      const container = document.getElementById('preview-outline-tree');
      if (!container) return;

      if (pdfOutline.length === 0) {
        container.innerHTML = `<p class="text-slate-400 text-center py-6">目次（しおり）はありません</p>`;
        return;
      }

      container.innerHTML = '';

      function buildTreeHtml(nodes, depth = 0) {
        let html = '';
        nodes.forEach(node => {
          const paddingLeft = depth * 12; // pxでの左パディング
          const pageBadge = node.page ? `<span class="ml-auto bg-slate-100 text-slate-500 text-[10px] px-1 rounded">P.${node.page}</span>` : '';
          const clickableClass = node.page ? 'cursor-pointer hover:bg-slate-100 text-slate-700 font-medium' : 'text-slate-400 cursor-default';
          const clickHandler = node.page ? `onclick="jumpToPageFromOutline(${node.page})"` : '';

          html += `
            <div class="flex items-center py-1 px-1.5 rounded transition-all ${clickableClass}" style="padding-left: ${paddingLeft + 6}px" ${clickHandler}>
              <i data-lucide="chevron-right" class="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0 ${node.items.length > 0 ? '' : 'opacity-0'}"></i>
              <span class="truncate" title="${escapeHtml(node.title)}">${escapeHtml(node.title)}</span>
              ${pageBadge}
            </div>
          `;

          if (node.items && node.items.length > 0) {
            html += buildTreeHtml(node.items, depth + 1);
          }
        });
        return html;
      }

      container.innerHTML = buildTreeHtml(pdfOutline);
      lucide.createIcons();
    }

    // PDF目次パネルの表示切り替え
    function togglePdfOutlinePanel() {
      const container = document.getElementById('preview-outline-container');
      const btn = document.getElementById('btn-toggle-pdf-outline');
      if (!container || !btn) return;

      isOutlineOpen = !isOutlineOpen;

      if (isOutlineOpen) {
        container.classList.remove('hidden');
        btn.classList.add('bg-slate-200', 'text-slate-800');
        btn.classList.remove('text-slate-400');
      } else {
        container.classList.add('hidden');
        btn.classList.remove('bg-slate-200', 'text-slate-800');
        btn.classList.add('text-slate-400');
      }
    }

    // 目次から指定ページへジャンプ ＆ スクロール連動
    function jumpToPageFromOutline(pageNum) {
      if (!pageNum) return;

      // 1. 本紙プレビューのページ切り替え
      jumpToPreviewPage(pageNum);

      // 2. テキスト一覧の対象ページの最初のカードへスクロール
      const targetCard = document.querySelector(`#text-list [data-page="${pageNum}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // 一時的にハイライトする
        targetCard.classList.add('bg-teal-50', 'border-teal-400');
        setTimeout(() => {
          targetCard.classList.remove('bg-teal-50', 'border-teal-400');
        }, 1500);
      }
    }

    // カラーパレットのトグル
    let openPaletteId = null;

    function toggleColorPalette(id, event) {
      if (event) event.stopPropagation();
      const popup = document.getElementById(`palette-popup-${id}`);
      
      if (openPaletteId !== null && openPaletteId !== id) {
        const oldPopup = document.getElementById(`palette-popup-${openPaletteId}`);
        if (oldPopup) {
          oldPopup.classList.add('hidden');
          oldPopup.classList.remove('flex');
        }
      }

      if (popup) {
        if (popup.classList.contains('hidden')) {
          popup.classList.remove('hidden');
          popup.classList.add('flex');
          openPaletteId = id;
        } else {
          popup.classList.add('hidden');
          popup.classList.remove('flex');
          openPaletteId = null;
        }
      }
    }

    // 外側クリックでパレットを閉じる
    document.addEventListener('click', (e) => {
      if (openPaletteId !== null) {
        const popup = document.getElementById(`palette-popup-${openPaletteId}`);
        if (popup && !popup.contains(e.target)) {
          popup.classList.add('hidden');
          popup.classList.remove('flex');
          openPaletteId = null;
        }
      }
    });

    // HTMLエスケープ
    function escapeHtml(str) {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // 右ペインの開閉
    function toggleRightPane() {
      const pane = document.getElementById('right-pane');
      const btn = document.getElementById('btn-toggle-right');
      if (pane.classList.contains('hidden')) {
        pane.classList.remove('hidden');
        btn.innerHTML = '<i data-lucide="panel-right-close" class="w-3.5 h-3.5"></i>\nツールを隠す';
      } else {
        pane.classList.add('hidden');
        btn.innerHTML = '<i data-lucide="panel-right-open" class="w-3.5 h-3.5"></i>\nツールを表示';
      }
      lucide.createIcons();
    }

    // 初期化
    window.onload = function () {
      initTheme();
      renderTabColorSettings();
      lucide.createIcons();
    }
  