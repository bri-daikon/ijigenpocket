document.addEventListener('DOMContentLoaded', () => {
    const themeDisplay = document.getElementById('theme-display');
    const generateBtn = document.getElementById('generate-btn');
    const statusEl = document.getElementById('data-status');

    // ＝＝＝ 設定 ＝＝＝
    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSdu0R7V11WF9P1gU5GxAJ3uzm-6BDa0VRdbcJaeNBUkuFV_sIDo8XuAsrNxerVuYHvYI0kfikJSU8W/pub?output=csv'; 
    const SITE_URL = 'https://bri-daikon.github.io/ijigenpocket/odaiindex.html';

    const CORS_PROXIES = [
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    ];

    // 予備データ
    const fallbackThemes = [
        "星降る夜の図書館", "雨上がりの匂い", "言葉にできない感情",
        "忘れられた約束", "朝焼けとコーヒー", "深海に沈む記憶",
        "踊り出すような喜び", "窓辺で微睡む", "秋風と金木犀",
        "静かなる決意", "ガラス越しの世界", "名前のない花",
        "夜明け前の静寂", "空を切り裂く雷鳴", "そっと手を伸ばす"
    ];

    // 最初から予備データを入れておくことで「出ない」を防ぐ
    let currentThemes = [...fallbackThemes];

    // 文字数によるフォントサイズ調整
    function adjustFontSize(span, text) {
        const len = text.length;
        if (len <= 8) span.style.fontSize = '3rem';
        else if (len <= 14) span.style.fontSize = '2.4rem';
        else if (len <= 20) span.style.fontSize = '1.8rem';
        else if (len <= 30) span.style.fontSize = '1.4rem';
        else span.style.fontSize = '1.2rem';
    }

    // テキスト更新アニメーション
    function updateThemeText(newText) {
        if (!themeDisplay) return;
        const span = themeDisplay.querySelector('span');
        if (!span) return;

        span.classList.add('fade-out');
        
        setTimeout(() => {
            span.textContent = newText;
            span.classList.remove('placeholder', 'fade-out');
            span.classList.add('fade-in');
            adjustFontSize(span, newText);
            
            setTimeout(() => {
                span.classList.remove('fade-in');
            }, 500);
        }, 500);
    }

    // お題をランダム取得
    function getRandomTheme() {
        if (currentThemes.length === 0) return "お題が見つかりません";
        const randomIndex = Math.floor(Math.random() * currentThemes.length);
        return currentThemes[randomIndex];
    }

    // 表示実行
    function generateAndDisplay() {
        if (!generateBtn) return;
        generateBtn.classList.add('spinning');
        setTimeout(() => generateBtn.classList.remove('spinning'), 500);

        const theme = getRandomTheme();
        updateThemeText(theme);
    }

    // CSVパース
    function parseCSV(text) {
        if (!text || text.includes('<!DOCTYPE html>') || text.includes('<html')) return []; 
        return text.split('\n')
                   .map(line => {
                       let cleaned = line.trim().replace(/\r/g, '');
                       if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                           cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
                       }
                       return cleaned;
                   })
                   .filter(line => line.length > 0);
    }

    // ステータス更新
    function updateStatus(message, isError = false) {
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = isError ? '#f87171' : '#94a3b8';
        }
    }

    // Fetch試行
    async function tryFetch(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4秒でタイムアウト

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    // データ読み込み
    async function fetchThemes() {
        // 最初にお題を一つ出しておく（予備データから）
        generateAndDisplay();
        updateStatus("最新のデータを取得中...");

        // 1. 直接フェッチ試行
        try {
            const text = await tryFetch(CSV_URL);
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
                currentThemes = parsed;
                updateStatus(`スプレッドシートから同期完了（${currentThemes.length}件）`);
                return;
            }
        } catch (e) {
            console.warn("Direct fetch failed:", e);
        }

        // 2. プロキシ経由で試行
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            try {
                const text = await tryFetch(CORS_PROXIES[i](CSV_URL));
                const parsed = parseCSV(text);
                if (parsed.length > 0) {
                    currentThemes = parsed;
                    updateStatus(`最新データと同期しました`);
                    return;
                }
            } catch (e) {
                console.warn(`Proxy ${i} failed:`, e);
            }
        }

        updateStatus("⚠ オフライン/予備データで動作中", true);
    }

    // --- 公開用関数の登録 ---

    window.shareOnX = async () => {
        const card = document.querySelector('.card.glass');
        const themeTextEl = document.querySelector('#theme-display span');
        if (!card || !themeTextEl) return;

        const text = themeTextEl.textContent;
        if (themeTextEl.classList.contains('placeholder') || text === "読み込み中...") return;

        if (typeof html2canvas === 'undefined') {
            openTwitterIntent(text);
            return;
        }

        if (generateBtn) generateBtn.style.visibility = 'hidden';

        try {
            const canvas = await html2canvas(card, {
                backgroundColor: null, 
                scale: 2,             
                logging: false,
                useCORS: true
            });

            if (generateBtn) generateBtn.style.visibility = 'visible';

            const tweetText = `今日のお題は「${text}」です！`;
            const hashtags = '今日のお題,異次元ポケット工房';

            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    if (!blob) {
                        openTwitterIntent(tweetText, hashtags);
                        return;
                    }
                    const file = new File([blob], 'today_theme.png', { type: 'image/png' });
                    const shareData = {
                        text: `${tweetText}\n${SITE_URL}\n#今日のお題 #異次元ポケット工房`,
                        files: [file]
                    };

                    if (navigator.canShare(shareData)) {
                        try {
                            await navigator.share(shareData);
                            return; 
                        } catch (err) {
                            console.warn("Share API Failed:", err);
                        }
                    }
                    openTwitterIntent(tweetText, hashtags);
                });
            } else {
                const dataUrl = canvas.toDataURL("image/png");
                const link = document.createElement('a');
                link.download = `today_odai_${new Date().getTime()}.png`;
                link.href = dataUrl;
                link.click();
                setTimeout(() => openTwitterIntent(tweetText, hashtags), 1000);
            }
        } catch (e) {
            if (generateBtn) generateBtn.style.visibility = 'visible';
            openTwitterIntent(`今日のお題は「${text}」です！`, '今日のお題,異次元ポケット工房');
        }
    };

    function openTwitterIntent(tweetText, hashtags) {
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(SITE_URL)}&hashtags=${encodeURIComponent(hashtags)}`;
        window.open(shareUrl, '_blank');
    }

    window.copyToClipboard = (event) => {
        const themeTextEl = document.querySelector('#theme-display span');
        if (!themeTextEl) return;

        const text = themeTextEl.textContent;
        if (themeTextEl.classList.contains('placeholder') || text === "読み込み中...") return;

        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = `今日のお題：${text}\nURL：${SITE_URL}\n#今日のお題 #異次元ポケット工房`;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        
        const ev = event || window.event;
        const btn = ev ? (ev.currentTarget || ev.target) : null;
        
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerText = "コピーしました！";
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }
    };

    if (generateBtn) {
        generateBtn.addEventListener('click', generateAndDisplay);
    }

    // 実行開始
    fetchThemes();
});