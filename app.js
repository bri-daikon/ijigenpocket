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

    const fallbackThemes = ["星降る夜の図書館", "雨上がりの匂い", "言葉にできない感情", "忘れられた約束", "朝焼けとコーヒー", "深海に沈む記憶", "踊り出すような喜び", "窓辺で微睡む", "秋風と金木犀", "静かなる決意", "ガラス越しの世界", "名前のない花", "夜明け前の静寂", "空を切り裂く雷鳴", "そっと手を伸ばす"];
    let currentThemes = [...fallbackThemes];

    function adjustFontSize(span, text) {
        const len = text.length;
        if (len <= 8) span.style.fontSize = '2.8rem';
        else if (len <= 14) span.style.fontSize = '2.2rem';
        else if (len <= 20) span.style.fontSize = '1.8rem';
        else span.style.fontSize = '1.4rem';
    }

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
            setTimeout(() => span.classList.remove('fade-in'), 500);
        }, 500);
    }

    function generateAndDisplay() {
        if (!generateBtn) return;
        generateBtn.classList.add('spinning');
        setTimeout(() => generateBtn.classList.remove('spinning'), 500);
        const theme = currentThemes[Math.floor(Math.random() * currentThemes.length)];
        updateThemeText(theme);
    }

    // パース用ヘルパー
    function parseCSV(text) {
        if (!text || text.includes('html>')) return [];
        return text.split('\n')
            .map(l => l.trim().replace(/\r/g, '').replace(/^"|"$/g, '').replace(/""/g, '"'))
            .filter(l => l.length > 0);
    }

    async function fetchThemes() {
        // 最初にお題を一つ出しておく（予備データ）
        generateAndDisplay();
        
        if (statusEl) statusEl.textContent = "最新のデータを同期中...";

        // 1. 直接フェッチ試行
        try {
            const res = await fetch(CSV_URL);
            const text = await res.text();
            const parsed = parseCSV(text);
            if (parsed.length > 0) {
                currentThemes = parsed;
                if (statusEl) statusEl.textContent = `同期完了（${currentThemes.length}件）`;
                return;
            }
        } catch (e) {
            console.warn("Direct fetch failed, trying proxies...");
        }

        // 2. プロキシ経由で試行
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            try {
                const res = await fetch(CORS_PROXIES[i](CSV_URL));
                const text = await res.text();
                const parsed = parseCSV(text);
                if (parsed.length > 0) {
                    currentThemes = parsed;
                    if (statusEl) statusEl.textContent = `プロキシ経由で同期完了`;
                    return;
                }
            } catch (e) {
                console.warn(`Proxy ${i} failed`);
            }
        }

        if (statusEl) statusEl.textContent = "予備データで動作中";
    }

    // --- X共有 ---
    window.shareOnX = () => {
        const themeTextEl = document.querySelector('#theme-display span');
        if (!themeTextEl) return;
        const text = themeTextEl.textContent;
        if (text === "準備中..." || text === "読み込み中...") return;
        const tweetText = `今日のお題は「${text}」です！`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(SITE_URL)}&hashtags=${encodeURIComponent('今日のお題,異次元ポケット工房')}`, '_blank');
    };

    // --- 画像保存 ---
    window.saveAsImage = async (event) => {
        const captureArea = document.getElementById('capture-area'); 
        const themeTextEl = document.querySelector('#theme-display span');
        if (!captureArea || !themeTextEl) return;

        const text = themeTextEl.textContent;
        if (text === "準備中..." || text === "読み込み中...") return;

        const btn = event.currentTarget;
        const originalHTML = btn.innerHTML;
        btn.innerText = "生成中...";
        btn.disabled = true;

        if (generateBtn) generateBtn.style.visibility = 'hidden';

        try {
            const canvas = await html2canvas(captureArea, {
                backgroundColor: "#0f172a", 
                scale: 2,                  
                useCORS: true,
                borderRadius: 32           
            });

            if (generateBtn) generateBtn.style.visibility = 'visible';

            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `today_odai_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            btn.innerText = "保存完了！";
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 2000);

        } catch (e) {
            if (generateBtn) generateBtn.style.visibility = 'visible';
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    };

    // --- コピー ---
    window.copyToClipboard = (e) => {
        const themeTextEl = document.querySelector('#theme-display span');
        if (!themeTextEl) return;
        const text = themeTextEl.textContent;
        if (text === "準備中..." || text === "読み込み中...") return;

        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = `今日のお題：${text}\nURL：${SITE_URL}\n#今日のお題 #異次元ポケット工房`;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        const btn = e.currentTarget;
        const original = btn.innerHTML;
        btn.innerText = "コピー完了！";
        setTimeout(() => btn.innerHTML = original, 2000);
    };

    if (generateBtn) generateBtn.addEventListener('click', generateAndDisplay);
    fetchThemes();
});