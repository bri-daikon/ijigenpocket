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
        if (len <= 6) span.style.fontSize = '3.5rem';
        else if (len <= 10) span.style.fontSize = '2.8rem';
        else if (len <= 15) span.style.fontSize = '2.2rem';
        else if (len <= 20) span.style.fontSize = '1.8rem';
        else span.style.fontSize = '1.5rem';
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
            
            setTimeout(() => {
                span.classList.remove('fade-in');
            }, 600);
        }, 400);
    }

    function generateAndDisplay() {
        if (!generateBtn) return;
        generateBtn.classList.add('spinning');
        setTimeout(() => generateBtn.classList.remove('spinning'), 800);
        
        const theme = currentThemes[Math.floor(Math.random() * currentThemes.length)];
        updateThemeText(theme);
    }

    // パース用ヘルパー
    function parseCSV(text) {
        if (!text || text.includes('html>')) return [];
        return text.split(/\r?\n/)
            .map(l => l.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
            .filter(l => l.length > 0 && !l.startsWith('http')); // URL等を除外
    }

    async function fetchThemes() {
        // 最初にお題を一つ出しておく（予備データ）
        generateAndDisplay();
        
        if (statusEl) statusEl.textContent = "最新データを同期中...";

        let success = false;

        // 1. 直接フェッチ試行
        try {
            const res = await fetch(CSV_URL);
            if (res.ok) {
                const text = await res.text();
                const parsed = parseCSV(text);
                if (parsed.length > 0) {
                    currentThemes = parsed;
                    success = true;
                }
            }
        } catch (e) {
            console.warn("Direct fetch failed, trying proxies...");
        }

        // 2. プロキシ経由で試行
        if (!success) {
            for (let i = 0; i < CORS_PROXIES.length; i++) {
                try {
                    const res = await fetch(CORS_PROXIES[i](CSV_URL));
                    if (res.ok) {
                        const text = await res.text();
                        const parsed = parseCSV(text);
                        if (parsed.length > 0) {
                            currentThemes = parsed;
                            success = true;
                            break;
                        }
                    }
                } catch (e) {
                    console.warn(`Proxy ${i} failed`);
                }
            }
        }

        if (success) {
            if (statusEl) statusEl.textContent = `同期完了（${currentThemes.length}件）`;
            // 最新データから再度お題を選び直す
            generateAndDisplay();
        } else {
            if (statusEl) statusEl.textContent = "予備データで動作中";
        }
    }

    // --- X共有 ---
    window.shareOnX = () => {
        const themeTextEl = document.querySelector('#theme-display span');
        if (!themeTextEl) return;
        const text = themeTextEl.textContent;
        if (text === "準備中..." || text === "読み込み中...") return;
        const tweetText = `今日のお題は「${text}」です！`;
        const tags = '今日のお題,異次元ポケット工房';
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(SITE_URL)}&hashtags=${encodeURIComponent(tags)}`, '_blank');
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
        btn.innerHTML = '<span>生成中...</span>';
        btn.disabled = true;

        if (generateBtn) generateBtn.style.display = 'none';

        try {
            // 少し待機してアニメーションを落ち着かせる
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(captureArea, {
                backgroundColor: null, // 透明を維持
                scale: 3,             // 高解像度
                useCORS: true,
                logging: false,
                borderRadius: 36
            });

            if (generateBtn) generateBtn.style.display = 'flex';

            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `today_odai_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            
            btn.innerHTML = '<span>保存完了！</span>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            }, 2000);

        } catch (e) {
            console.error(e);
            if (generateBtn) generateBtn.style.display = 'flex';
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

        const copyText = `今日のお題：${text}\nURL：${SITE_URL}\n#今日のお題 #異次元ポケット工房`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(copyText).then(() => {
                const btn = e.currentTarget;
                const original = btn.innerHTML;
                btn.innerHTML = '<span>コピー完了！</span>';
                setTimeout(() => btn.innerHTML = original, 2000);
            }).catch(err => {
                fallbackCopy(copyText, e.currentTarget);
            });
        } else {
            fallbackCopy(copyText, e.currentTarget);
        }
    };

    function fallbackCopy(text, btn) {
        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        const original = btn.innerHTML;
        btn.innerHTML = '<span>コピー完了！</span>';
        setTimeout(() => btn.innerHTML = original, 2000);
    }

    if (generateBtn) generateBtn.addEventListener('click', generateAndDisplay);
    fetchThemes();
});