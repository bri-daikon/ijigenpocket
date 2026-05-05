document.addEventListener('DOMContentLoaded', () => {
    const themeDisplay = document.getElementById('theme-display');
    const generateBtn = document.getElementById('generate-btn');
    const statusEl = document.getElementById('data-status');

    // ＝＝＝ CEO確認事項 ＝＝＝
    // 本番運用時は、ここに公開されたGoogleスプレッドシート(CSV形式)のURLを入れます。
    // 例: const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/あなたのID/pub?output=csv';
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSdu0R7V11WF9P1gU5GxAJ3uzm-6BDa0VRdbcJaeNBUkuFV_sIDo8XuAsrNxerVuYHvYI0kfikJSU8W/pub?output=csv'; 

    // CORSプロキシのリスト（file:///プロトコルで開いた場合の回避策）
    const CORS_PROXIES = [
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];

    // スプレッドシートが設定されていない場合の予備（フォールバック）データ
    const fallbackThemes = [
        "星降る夜の図書館",
        "雨上がりの匂い",
        "言葉にできない感情",
        "忘れられた約束",
        "朝焼けとコーヒー",
        "深海に沈む記憶",
        "踊り出すような喜び",
        "窓辺で微睡む",
        "秋風と金木犀",
        "静かなる決意",
        "ガラス越しの世界",
        "名前のない花",
        "夜明け前の静寂",
        "空を切り裂く雷鳴",
        "そっと手を伸ばす"
    ];

    let currentThemes = [];

    // お題の文字数に応じてフォントサイズを動的に調整する関数
    function adjustFontSize(span, text) {
        const len = text.length;
        if (len <= 8) {
            span.style.fontSize = '3rem';
        } else if (len <= 14) {
            span.style.fontSize = '2.4rem';
        } else if (len <= 20) {
            span.style.fontSize = '1.8rem';
        } else if (len <= 30) {
            span.style.fontSize = '1.4rem';
        } else {
            span.style.fontSize = '1.2rem';
        }
    }

    // アニメーションを伴ってテキストを更新する関数
    function updateThemeText(newText) {
        const span = themeDisplay.querySelector('span');
        
        // フェードアウト
        span.classList.add('fade-out');
        
        setTimeout(() => {
            // テキストを書き換えてフェードイン
            span.textContent = newText;
            span.classList.remove('placeholder', 'fade-out');
            span.classList.add('fade-in');
            adjustFontSize(span, newText);
            
            // アニメーションクラスをクリーンアップ
            setTimeout(() => {
                span.classList.remove('fade-in');
            }, 500);
        }, 500);
    }

    // ランダムにお題を一つ選ぶ関数
    function getRandomTheme() {
        if (currentThemes.length === 0) return "お題がありません";
        const randomIndex = Math.floor(Math.random() * currentThemes.length);
        return currentThemes[randomIndex];
    }

    // お題を生成して表示する
    function generateAndDisplay() {
        generateBtn.classList.add('spinning');
        setTimeout(() => generateBtn.classList.remove('spinning'), 500);

        const theme = getRandomTheme();
        updateThemeText(theme);
    }

    // CSVテキストをパースしてお題の配列にする関数
    function parseCSV(text) {
        return text.split('\n')
                   .map(line => {
                       // \r を除去し、前後の空白・ダブルクォーテーションを取り除く
                       let cleaned = line.trim().replace(/\r/g, '');
                       // CSVのクォート除去（"..." で囲まれている場合）
                       if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                           cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
                       }
                       return cleaned;
                   })
                   .filter(line => line.length > 0);
    }

    // データソースの状態を画面に表示する関数
    function updateStatus(message, isError = false) {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = isError ? '#f87171' : '#94a3b8';
        }
    }

    // 指定URLからfetchを試みる関数
    async function tryFetch(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
    }

    // CSVデータを取得して配列にする関数
    async function fetchThemes() {
        if (!CSV_URL) {
            console.log("CSV URLが設定されていないため、ローカルの予備データを使用します。");
            currentThemes = fallbackThemes;
            updateStatus(`予備データを使用中（${currentThemes.length}件）`);
            generateAndDisplay();
            return;
        }

        updateThemeText("読み込み中...");

        // 1. まず直接fetchを試みる（HTTPサーバー経由で開いている場合は成功する）
        try {
            console.log("直接フェッチを試行中...");
            const text = await tryFetch(CSV_URL);
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
                currentThemes = parsed;
                updateStatus(`スプレッドシートから読み込み完了（${currentThemes.length}件）`);
                console.log(`直接フェッチ成功: ${currentThemes.length}件のお題を読み込みました`);
                generateAndDisplay();
                return;
            }
        } catch (error) {
            console.warn("直接フェッチ失敗:", error.message);
        }

        // 2. CORSプロキシ経由で試みる（file:///プロトコルの場合の回避策）
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            const proxyUrl = CORS_PROXIES[i](CSV_URL);
            try {
                console.log(`CORSプロキシ ${i + 1} を試行中...`);
                const text = await tryFetch(proxyUrl);
                const parsed = parseCSV(text);
                if (parsed.length > 0) {
                    currentThemes = parsed;
                    updateStatus(`スプレッドシートから読み込み完了（${currentThemes.length}件）`);
                    console.log(`プロキシ経由フェッチ成功: ${currentThemes.length}件のお題を読み込みました`);
                    generateAndDisplay();
                    return;
                }
            } catch (error) {
                console.warn(`CORSプロキシ ${i + 1} 失敗:`, error.message);
            }
        }

        // 3. すべて失敗した場合はフォールバック
        console.error("すべてのフェッチ方法が失敗しました。予備データを使用します。");
        currentThemes = fallbackThemes;
        updateStatus("⚠ スプレッドシートの読み込みに失敗。予備データを使用中", true);
        generateAndDisplay();
    }

    // イベントリスナーの登録
    generateBtn.addEventListener('click', generateAndDisplay);

    // 初期ロード時の実行
    fetchThemes();
});
