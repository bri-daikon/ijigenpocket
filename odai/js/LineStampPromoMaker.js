/**
 * LINEスタンプ一括告知バナー＆モックアップメーカー (LineStampPromoMaker)
 * ロジック & 画像生成・モックアップ管理モジュール
 */

// アプリケーション状態
const state = {
    stamps: [],             // 読み込まれたスタンプ画像一覧 { id, name, dataUrl, selected }
    selectedTemplate: 'chat-mockup', // 'chat-mockup', 'grid-showcase', 'poster-40', 'highlight-card'
    aspectRatio: '16-9',    // '16-9', '1-1', '9-16'
    colorTheme: 'line-green', // 'line-green', 'pastel-pink', 'cyber-dark', 'warm-craft', 'vibrant-blue'
    
    // バナーメタ情報
    title: '子狐たちのゆるかわ日常スタンプ',
    author: '異次元ポケット工房',
    copy: '日常で毎日使える♪ 待望の第1弾が登場！',
    price: '190円 / 70コイン',
    badgeText: 'NEW 発売中！',
    stampUrl: 'https://line.me/S/shop/sticker/author/12345',
    
    // チャットモックアップ設定
    chatMessages: [
        { sender: 'other', text: '今日のご飯どこ行く〜？', stampIndex: -1 },
        { sender: 'me', text: '', stampIndex: 0 },
        { sender: 'other', text: 'やったー！楽しみ！', stampIndex: -1 },
        { sender: 'me', text: '', stampIndex: 1 }
    ],

    // グリッド表示設定（選択されたスタンプIDの配列）
    featuredStampIds: [],

    // 背景パターン
    bgPattern: 'dots', // 'dots', 'grid', 'confetti', 'none'

    // カスタムグラデーション背景設定
    customGradient: {
        color1: '#062b1a',
        color2: '#03150d',
        angle: 135,
        enabled: false
    },

    // 表示パーツ＆配置カスタマイズ
    parts: {
        showQrCode: true,
        showSideStamps: true,
        showPrice: true,
        showBadge: true,
        showCopy: true,
        showAuthor: true,
        stampScale: 'normal' // 'compact', 'normal', 'large'
    }
};

// カラーテーマ定義
const THEMES = {
    'line-green': {
        name: 'LINEグリーン',
        primary: '#06c755',
        primaryDark: '#04a847',
        bg: 'linear-gradient(135deg, #0e1e17 0%, #062b1a 50%, #03150d 100%)',
        cardBg: '#112219',
        border: '#1a432b',
        text: '#ffffff',
        subtext: '#98cbb0',
        badgeBg: '#06c755',
        badgeText: '#ffffff'
    },
    'pastel-pink': {
        name: 'パステルチェリー',
        primary: '#ec4899',
        primaryDark: '#db2777',
        bg: 'linear-gradient(135deg, #2a111f 0%, #3d142b 50%, #1a0812 100%)',
        cardBg: '#2f1223',
        border: '#582142',
        text: '#ffffff',
        subtext: '#e8a5cb',
        badgeBg: '#ec4899',
        badgeText: '#ffffff'
    },
    'cyber-dark': {
        name: 'サイバーナイト',
        primary: '#38bdf8',
        primaryDark: '#0284c7',
        bg: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #020617 100%)',
        cardBg: '#131e35',
        border: '#1e3056',
        text: '#ffffff',
        subtext: '#94a3b8',
        badgeBg: '#0ea5e9',
        badgeText: '#ffffff'
    },
    'warm-craft': {
        name: 'ウォームクラフト',
        primary: '#f59e0b',
        primaryDark: '#d97706',
        bg: 'linear-gradient(135deg, #24160a 0%, #361f09 50%, #140c04 100%)',
        cardBg: '#2a1a0d',
        border: '#543315',
        text: '#ffffff',
        subtext: '#e2ba8c',
        badgeBg: '#f59e0b',
        badgeText: '#1c1917'
    },
    'vibrant-blue': {
        name: 'オーシャンブルー',
        primary: '#3b82f6',
        primaryDark: '#2563eb',
        bg: 'linear-gradient(135deg, #0b1528 0%, #11254a 50%, #050b17 100%)',
        cardBg: '#132852',
        border: '#1f3e7c',
        text: '#ffffff',
        subtext: '#93b5ec',
        badgeBg: '#3b82f6',
        badgeText: '#ffffff'
    }
};

// サンプルスタンプ画像（SVGデータURIで初期化）
const SAMPLE_STAMPS = [
    {
        name: 'おつかれさま！',
        emoji: '🦊☕',
        bg: '#f59e0b',
        text: 'おつかれさま！'
    },
    {
        name: '了解です！',
        emoji: '🦊👍',
        bg: '#06c755',
        text: '了解です！'
    },
    {
        name: 'ありがとう♡',
        emoji: '🦊✨',
        bg: '#ec4899',
        text: 'ありがとう♡'
    },
    {
        name: 'よろしくね！',
        emoji: '🦊🌸',
        bg: '#38bdf8',
        text: 'よろしくね！'
    },
    {
        name: 'ごめんなさい…',
        emoji: '🦊💧',
        bg: '#64748b',
        text: 'ごめんね…'
    },
    {
        name: 'わーい！',
        emoji: '🦊🎉',
        bg: '#8b5cf6',
        text: 'わーい！'
    },
    {
        name: 'おやすみ〜',
        emoji: '🦊🌙',
        bg: '#475569',
        text: 'おやすみ〜'
    },
    {
        name: 'チラッ',
        emoji: '🦊👀',
        bg: '#eab308',
        text: 'チラッ…'
    }
];

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initSampleStamps();
    bindEvents();
    renderAll();
});

// --- サンプルスタンプの生成 ---
function initSampleStamps() {
    state.stamps = SAMPLE_STAMPS.map((s, index) => {
        // スタンプ風SVGの生成
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="370" height="320" viewBox="0 0 370 320">
                <rect width="370" height="320" rx="36" fill="${s.bg}" fill-opacity="0.12"/>
                <rect x="6" y="6" width="358" height="308" rx="30" stroke="${s.bg}" stroke-width="4" stroke-dasharray="12 8" fill="none"/>
                <circle cx="185" cy="135" r="75" fill="${s.bg}" fill-opacity="0.25"/>
                <text x="185" y="160" font-size="80" text-anchor="middle" font-family="'Zen Maru Gothic', 'M PLUS Rounded 1c', sans-serif">${s.emoji}</text>
                <rect x="40" y="235" width="290" height="54" rx="27" fill="${s.bg}"/>
                <text x="185" y="271" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="'Zen Maru Gothic', 'M PLUS Rounded 1c', sans-serif">${s.text}</text>
            </svg>
        `;
        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        return {
            id: 'sample_' + index,
            name: s.name,
            dataUrl: dataUrl,
            selected: true
        };
    });

    state.featuredStampIds = state.stamps.map(s => s.id);
}

// --- イベントバインド ---
function bindEvents() {
    // 入力項目同期
    const inputs = [
        ['inputTitle', 'title'],
        ['inputAuthor', 'author'],
        ['inputCopy', 'copy'],
        ['inputPrice', 'price'],
        ['inputBadgeText', 'badgeText'],
        ['inputStampUrl', 'stampUrl']
    ];

    inputs.forEach(([id, prop]) => {
        const el = document.getElementById(id);
        if (el) {
            el.value = state[prop];
            el.addEventListener('input', (e) => {
                state[prop] = e.target.value;
                renderBanner();
            });
        }
    });

    // ZIP / 画像ドロップエリア
    const dropArea = document.getElementById('stampDropArea');
    const fileInput = document.getElementById('stampFileInput');

    if (dropArea && fileInput) {
        dropArea.addEventListener('click', () => fileInput.click());
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.classList.add('border-emerald-500', 'bg-emerald-950/20');
        });
        dropArea.addEventListener('dragleave', () => {
            dropArea.classList.remove('border-emerald-500', 'bg-emerald-950/20');
        });
        dropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dropArea.classList.remove('border-emerald-500', 'bg-emerald-950/20');
            handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            e.target.value = '';
        });
    }
}

// --- ファイル処理（ZIP解凍 or 複数画像） ---
async function handleFiles(files) {
    if (!files || files.length === 0) return;

    showToast('ファイルを解析しています...', 'info');

    const newStamps = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // ZIPファイルの場合（JSZip）
        if (file.name.endsWith('.zip') || file.type.includes('zip')) {
            try {
                const zip = new JSZip();
                const contents = await zip.loadAsync(file);
                const imagePromises = [];

                contents.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir && relativePath.match(/\.(png|jpe?g|webp)$/i) && !relativePath.includes('__MACOSX')) {
                        // main.png や tab.png 以外のスタンプ画像を優先
                        imagePromises.push(
                            zipEntry.async('base64').then(base64 => {
                                const ext = relativePath.split('.').pop().toLowerCase();
                                const mime = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');
                                return {
                                    id: 'stamp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                                    name: relativePath.split('/').pop(),
                                    dataUrl: `data:${mime};base64,${base64}`,
                                    selected: true
                                };
                            })
                        );
                    }
                });

                const extracted = await Promise.all(imagePromises);
                // 連番などでソート
                extracted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
                newStamps.push(...extracted);
            } catch (err) {
                console.error('ZIP解凍失敗:', err);
                showToast('ZIPファイルの展開に失敗しました', 'error');
            }
        } 
        // 通常の画像ファイルの場合
        else if (file.type.startsWith('image/')) {
            const dataUrl = await readFileAsDataUrl(file);
            newStamps.push({
                id: 'stamp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                name: file.name,
                dataUrl: dataUrl,
                selected: true
            });
        }
    }

    if (newStamps.length > 0) {
        // 連番ソート
        newStamps.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        state.stamps = newStamps;
        state.featuredStampIds = newStamps.slice(0, 8).map(s => s.id);
        
        // チャットメッセージにスタンプを再割当
        state.chatMessages[1].stampIndex = 0;
        state.chatMessages[3].stampIndex = Math.min(1, newStamps.length - 1);

        renderAll();
        showToast(`${newStamps.length} 枚のスタンプを読み込みました！`, 'success');
    }
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- 全体の描画 ---
function renderAll() {
    renderStampSelectorList();
    renderBanner();
    lucide.createIcons();
}

// --- スタンプ選択グリッド（サイドバー） ---
function renderStampSelectorList() {
    const container = document.getElementById('stampThumbnailsList');
    const countBadge = document.getElementById('stampTotalCount');
    if (!container) return;

    container.innerHTML = '';
    if (countBadge) countBadge.textContent = `${state.stamps.length}個`;

    if (state.stamps.length === 0) {
        container.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-500">スタンプがまだありません</div>`;
        return;
    }

    state.stamps.forEach((s, idx) => {
        const isFeatured = state.featuredStampIds.includes(s.id);
        const item = document.createElement('div');
        item.className = `relative p-1.5 rounded-xl border transition-all cursor-pointer group flex flex-col items-center justify-center ${isFeatured ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_10px_rgba(6,199,85,0.2)]' : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'}`;

        item.innerHTML = `
            <img src="${s.dataUrl}" class="w-12 h-12 object-contain rounded-lg">
            <span class="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[50px]">${idx + 1}</span>
            <div class="absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${isFeatured ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 opacity-0 group-hover:opacity-100'}">
                <i data-lucide="check" class="w-2.5 h-2.5"></i>
            </div>
        `;

        item.onclick = () => {
            toggleFeaturedStamp(s.id);
        };

        container.appendChild(item);
    });

    lucide.createIcons();
}

function toggleFeaturedStamp(id) {
    if (state.featuredStampIds.includes(id)) {
        state.featuredStampIds = state.featuredStampIds.filter(x => x !== id);
    } else {
        state.featuredStampIds.push(id);
    }
    renderStampSelectorList();
    renderBanner();
}

function selectAllStamps() {
    state.featuredStampIds = state.stamps.map(s => s.id);
    renderStampSelectorList();
    renderBanner();
}

function clearSelectedStamps() {
    state.featuredStampIds = [];
    renderStampSelectorList();
    renderBanner();
}

// --- テンプレート / アスペクト比 / テーマの変更 ---
function togglePart(partKey, value) {
    if (state.parts.hasOwnProperty(partKey)) {
        state.parts[partKey] = value;
        renderBanner();
    }
}

function setStampScale(scale) {
    state.parts.stampScale = scale;
    document.querySelectorAll('.scale-btn').forEach(btn => {
        const isActive = btn.dataset.scale === scale;
        btn.classList.toggle('active-pill', isActive);
        btn.classList.toggle('text-slate-300', !isActive);
    });
    renderBanner();
}

function setTemplate(templateName) {
    state.selectedTemplate = templateName;
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.toggle('active-pill', btn.dataset.template === templateName);
    });
    renderBanner();
}

function setAspectRatio(ratio) {
    state.aspectRatio = ratio;
    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.classList.toggle('active-pill', btn.dataset.ratio === ratio);
    });
    renderBanner();
}

function setColorTheme(themeName) {
    state.colorTheme = themeName;
    state.customGradient.enabled = false;
    
    // プリセットボタンのハイライト
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const isActive = btn.dataset.theme === themeName;
        btn.classList.toggle('ring-2', isActive);
        btn.classList.toggle('ring-white', isActive);
    });

    // カスタムグラデーショントグルボタンの見た目更新
    const customBtn = document.getElementById('btnCustomGradientToggle');
    if (customBtn) {
        customBtn.classList.remove('border-amber-500', 'bg-amber-950/40', 'text-amber-300');
    }
    const themeLabel = document.getElementById('currentThemeLabel');
    if (themeLabel) {
        themeLabel.textContent = THEMES[themeName]?.name || themeName;
    }

    renderBanner();
}

function toggleCustomGradient(forceOpen) {
    const controls = document.getElementById('customGradientControls');
    const customBtn = document.getElementById('btnCustomGradientToggle');
    if (!controls) return;

    if (forceOpen === true) {
        controls.classList.remove('hidden');
        state.customGradient.enabled = true;
    } else {
        controls.classList.toggle('hidden');
        state.customGradient.enabled = !controls.classList.contains('hidden');
    }

    if (state.customGradient.enabled) {
        // プリセットボタンの選択解除
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-white');
        });
        if (customBtn) {
            customBtn.classList.add('border-amber-500', 'bg-amber-950/40', 'text-amber-300');
        }
        const themeLabel = document.getElementById('currentThemeLabel');
        if (themeLabel) {
            themeLabel.textContent = 'カスタムグラデーション';
        }
        updateCustomGradientInputs();
    }
    renderBanner();
}

function updateCustomGradient() {
    const c1 = document.getElementById('gradientColor1')?.value || state.customGradient.color1;
    const c2 = document.getElementById('gradientColor2')?.value || state.customGradient.color2;
    const angle = parseInt(document.getElementById('gradientAngle')?.value || state.customGradient.angle, 10);

    state.customGradient.color1 = c1;
    state.customGradient.color2 = c2;
    state.customGradient.angle = angle;
    state.customGradient.enabled = true;

    // 表示更新
    const hex1 = document.getElementById('gradientColor1Hex');
    if (hex1) hex1.textContent = c1;
    const hex2 = document.getElementById('gradientColor2Hex');
    if (hex2) hex2.textContent = c2;
    const angleVal = document.getElementById('gradientAngleVal');
    if (angleVal) angleVal.textContent = `${angle}°`;

    // プリセットボタンの選択解除
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white');
    });
    const customBtn = document.getElementById('btnCustomGradientToggle');
    if (customBtn) {
        customBtn.classList.add('border-amber-500', 'bg-amber-950/40', 'text-amber-300');
    }
    const themeLabel = document.getElementById('currentThemeLabel');
    if (themeLabel) {
        themeLabel.textContent = 'カスタムグラデーション';
    }

    renderBanner();
}

function updateCustomGradientInputs() {
    const c1El = document.getElementById('gradientColor1');
    const c2El = document.getElementById('gradientColor2');
    const angleEl = document.getElementById('gradientAngle');
    const hex1 = document.getElementById('gradientColor1Hex');
    const hex2 = document.getElementById('gradientColor2Hex');
    const angleVal = document.getElementById('gradientAngleVal');

    if (c1El) c1El.value = state.customGradient.color1;
    if (c2El) c2El.value = state.customGradient.color2;
    if (angleEl) angleEl.value = state.customGradient.angle;
    if (hex1) hex1.textContent = state.customGradient.color1;
    if (hex2) hex2.textContent = state.customGradient.color2;
    if (angleVal) angleVal.textContent = `${state.customGradient.angle}°`;
}

function resetCustomGradient() {
    state.customGradient = {
        color1: '#062b1a',
        color2: '#03150d',
        angle: 135,
        enabled: true
    };
    updateCustomGradientInputs();
    renderBanner();
    showToast('カスタムグラデーションをリセットしました', 'info');
}

// --- メインバナーの描画 ---
function renderBanner() {
    const banner = document.getElementById('previewBanner');
    if (!banner) return;

    const theme = THEMES[state.colorTheme] || THEMES['line-green'];

    // アスペクト比クラスの適用
    banner.className = 'relative shadow-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between';
    if (state.aspectRatio === '16-9') {
        banner.style.aspectRatio = '16 / 9';
        banner.style.width = '100%';
        banner.style.maxWidth = '960px';
    } else if (state.aspectRatio === '1-1') {
        banner.style.aspectRatio = '1 / 1';
        banner.style.width = '100%';
        banner.style.maxWidth = '680px';
    } else if (state.aspectRatio === '9-16') {
        banner.style.aspectRatio = '9 / 16';
        banner.style.width = '100%';
        banner.style.maxWidth = '460px';
    }

    // テーマ背景（カスタムグラデーション有効時はカスタムを優先）
    if (state.customGradient.enabled) {
        banner.style.background = `linear-gradient(${state.customGradient.angle}deg, ${state.customGradient.color1} 0%, ${state.customGradient.color2} 100%)`;
    } else {
        banner.style.background = theme.bg;
    }
    banner.style.color = theme.text;
    banner.style.border = `1px solid ${theme.border}`;

    // テンプレートごとの内部コンテンツ生成
    if (state.selectedTemplate === 'chat-mockup') {
        banner.innerHTML = renderChatMockupTemplate(theme);
    } else if (state.selectedTemplate === 'grid-showcase') {
        banner.innerHTML = renderGridShowcaseTemplate(theme);
    } else if (state.selectedTemplate === 'poster-40') {
        banner.innerHTML = renderPosterTemplate(theme);
    } else if (state.selectedTemplate === 'highlight-card') {
        banner.innerHTML = renderHighlightCardTemplate(theme);
    }

    // QRコードの生成・再描画
    renderQrCode();
    lucide.createIcons();
}

// --- テンプレート 1: チャット実機モックアップ (Chat Mockup) ---
function renderChatMockupTemplate(theme) {
    const isStory = state.aspectRatio === '9-16';
    const stampA = state.stamps[state.chatMessages[1]?.stampIndex] || state.stamps[0];
    const stampB = state.stamps[state.chatMessages[3]?.stampIndex] || state.stamps[1] || stampA;
    const p = state.parts;
    const scale = p.stampScale || 'normal';

    // サイドバーでチェックを入れたスタンプを取得（横にスタンプ枠に掲載）
    const featured = state.stamps.filter(s => state.featuredStampIds.includes(s.id));
    const sideStamps = featured.length > 0 ? featured.slice(0, 4) : state.stamps.slice(2, 6);

    // スケールに応じたサイズ定義
    const phoneWidth = scale === 'compact' ? 'w-48 md:w-52' : (scale === 'large' ? 'w-56 md:w-60' : 'w-52 md:w-56');
    const stampASize = scale === 'compact' ? 'w-14 h-14' : (scale === 'large' ? 'w-18 h-18' : 'w-16 h-16');
    const stampBSize = scale === 'compact' ? 'w-12 h-12' : (scale === 'large' ? 'w-16 h-16' : 'w-14 h-14');
    const sideStampSize = scale === 'compact' ? 'w-11 h-11 md:w-12 md:h-12' : (scale === 'large' ? 'w-14 h-14 md:w-16 md:h-16' : 'w-12 h-12 md:w-14 md:h-14');

    if (isStory) {
        // 9:16 縦長ストーリー専用レイアウト (はみ出し防止・コンパクト最適化)
        return `
            <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:18px_18px]"></div>
            
            <div class="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-between items-center text-center w-full h-full overflow-hidden">
                <!-- 上部: タイトル -->
                <div class="w-full shrink-0">
                    ${p.showBadge ? `
                        <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow mb-1.5" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                            <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHtml(state.badgeText)}
                        </div>
                    ` : ''}
                    <h2 class="text-lg sm:text-xl font-black tracking-tight leading-tight mb-1">
                        ${escapeHtml(state.title)}
                    </h2>
                    ${p.showCopy ? `
                        <p class="text-[10px] sm:text-[11px] font-bold opacity-80" style="color: ${theme.subtext};">
                            ${escapeHtml(state.copy)}
                        </p>
                    ` : ''}
                </div>

                <!-- 中央: スマホフレーム -->
                <div class="w-56 max-w-[85%] rounded-3xl p-2 shadow-2xl border-4 border-slate-700/80 bg-slate-900 my-auto shrink-0">
                    <div class="w-12 h-2 bg-slate-800 rounded-full mx-auto mb-1.5"></div>
                    <div class="rounded-2xl p-2 bg-[#7292ab] flex flex-col justify-between shadow-inner">
                        <div class="flex items-center justify-between pb-1 mb-1 border-b border-black/10 text-white text-[9px] font-bold">
                            <span>💬 トーク画面</span>
                            <span class="text-[8px] opacity-75">12:34</span>
                        </div>
                        <div class="space-y-1.5">
                            <div class="flex items-start gap-1 text-left">
                                <div class="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] shadow shrink-0">🦊</div>
                                <div class="bg-white text-slate-800 px-2 py-0.5 rounded-lg rounded-tl-none text-[9px] font-bold shadow-sm leading-tight">
                                    ${escapeHtml(state.chatMessages[0].text)}
                                </div>
                            </div>
                            <div class="flex flex-col items-end">
                                ${stampA ? `<img src="${stampA.dataUrl}" class="w-14 h-14 object-contain drop-shadow-md">` : ''}
                                <span class="text-[7px] text-white/70 font-mono">既読 12:35</span>
                            </div>
                            <div class="flex items-start gap-1 text-left">
                                <div class="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] shadow shrink-0">🦊</div>
                                <div class="bg-white text-slate-800 px-2 py-0.5 rounded-lg rounded-tl-none text-[9px] font-bold shadow-sm leading-tight">
                                    ${escapeHtml(state.chatMessages[2].text)}
                                </div>
                            </div>
                            <div class="flex flex-col items-end">
                                ${stampB ? `<img src="${stampB.dataUrl}" class="w-12 h-12 object-contain drop-shadow-md">` : ''}
                                <span class="text-[7px] text-white/70 font-mono">既読 12:36</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 下部: フッター＆QRコード -->
                <div class="w-full pt-2 border-t flex items-center justify-between shrink-0" style="border-color: ${theme.border};">
                    <div class="text-left">
                        ${p.showAuthor ? `<div class="text-xs font-bold">${escapeHtml(state.author)}</div>` : ''}
                        ${p.showPrice ? `<div class="text-xs font-mono font-bold" style="color: ${theme.primary};">${escapeHtml(state.price)}</div>` : ''}
                        ${p.showAuthor ? `<div class="text-[9px] opacity-75 font-mono truncate max-w-[160px]">${escapeHtml(state.stampUrl)}</div>` : ''}
                    </div>
                    ${p.showQrCode ? `
                        <div class="p-1 bg-white rounded-xl shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 16:9 または 1:1 レイアウト (横長で見切れないよう縦幅・余白を完全最適化)
    return `
        <!-- 背景装飾 -->
        <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <!-- バナー上部ヘッダー -->
        <div class="relative z-10 px-4 md:px-6 pt-3 md:pt-4 pb-1 flex items-start justify-between gap-4 shrink-0">
            <div>
                ${p.showBadge ? `
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-black shadow-md mb-1" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                        <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHtml(state.badgeText)}
                    </div>
                ` : ''}
                <h2 class="text-lg md:text-2xl font-black tracking-tight leading-tight drop-shadow-md">
                    ${escapeHtml(state.title)}
                </h2>
                ${p.showCopy ? `
                    <p class="text-[11px] md:text-xs font-bold opacity-80 mt-0.5" style="color: ${theme.subtext};">
                        ${escapeHtml(state.copy)}
                    </p>
                ` : ''}
            </div>
            ${p.showPrice ? `
                <div class="shrink-0 text-right">
                    <span class="inline-block px-2.5 py-0.5 md:px-3 md:py-1 rounded-lg text-xs font-mono font-bold border" style="background: ${theme.cardBg}; border-color: ${theme.border}; color: ${theme.primary};">
                        ${escapeHtml(state.price)}
                    </span>
                </div>
            ` : ''}
        </div>

        <!-- メインビジュアル: スマホモックアップ ＆ 横サブスタンプ枠 -->
        <div class="relative z-10 px-4 md:px-6 flex-1 min-h-0 flex items-center justify-center gap-4 md:gap-7 my-auto py-1">
            <!-- スマホ本体 (高さを抑えてはみ出しを防止) -->
            <div class="${phoneWidth} rounded-2xl md:rounded-3xl p-2 shadow-2xl border-2 md:border-4 border-slate-700/80 bg-slate-900 shrink-0">
                <div class="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-1.5"></div>
                <div class="rounded-xl p-2 bg-[#7292ab] flex flex-col justify-between shadow-inner">
                    <div class="flex items-center justify-between pb-1 mb-1 border-b border-black/10 text-white text-[9px] font-bold">
                        <span>💬 トーク画面</span>
                        <span class="text-[7px] opacity-75">12:34</span>
                    </div>
                    <div class="space-y-1.5">
                        <div class="flex items-start gap-1">
                            <div class="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] shadow shrink-0">🦊</div>
                            <div class="bg-white text-slate-800 px-2 py-0.5 rounded-lg rounded-tl-none text-[9px] font-bold shadow-sm leading-tight">
                                ${escapeHtml(state.chatMessages[0].text)}
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            ${stampA ? `<img src="${stampA.dataUrl}" class="${stampASize} object-contain drop-shadow-md">` : ''}
                            <span class="text-[7px] text-white/70 font-mono">既読 12:35</span>
                        </div>
                        <div class="flex items-start gap-1">
                            <div class="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[8px] shadow shrink-0">🦊</div>
                            <div class="bg-white text-slate-800 px-2 py-0.5 rounded-lg rounded-tl-none text-[9px] font-bold shadow-sm leading-tight">
                                ${escapeHtml(state.chatMessages[2].text)}
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            ${stampB ? `<img src="${stampB.dataUrl}" class="${stampBSize} object-contain drop-shadow-md">` : ''}
                            <span class="text-[7px] text-white/70 font-mono">既読 12:36</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 横サブスタンプトレイ（チェックを入れたスタンプを表示） -->
            ${p.showSideStamps ? `
                <div class="flex flex-col gap-1.5 items-center shrink-0">
                    <div class="grid grid-cols-2 gap-1.5 p-2 md:p-2.5 rounded-2xl border backdrop-blur shadow-xl" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                        ${sideStamps.map(s => `
                            <div class="p-1 rounded-xl bg-black/25 flex flex-col items-center">
                                <img src="${s.dataUrl}" class="${sideStampSize} object-contain drop-shadow-md">
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-[9px] md:text-[10px] font-bold tracking-wider uppercase opacity-75 font-mono" style="color: ${theme.subtext};">
                        ★ 全${state.stamps.length}種類のスタンプを収録 ★
                    </div>
                </div>
            ` : ''}
        </div>

        <!-- バナー下部フッター -->
        <div class="relative z-10 px-4 md:px-6 py-2 flex items-center justify-between border-t shrink-0" style="border-color: ${theme.border}; background: rgba(0,0,0,0.25);">
            <div class="flex items-center gap-2.5">
                ${p.showAuthor ? `
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md" style="background: ${theme.primary}; color: ${theme.badgeText};">
                        <i data-lucide="store" class="w-3.5 h-3.5"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold leading-tight">${escapeHtml(state.author)}</div>
                        <div class="text-[9px] opacity-75 font-mono truncate max-w-[220px] md:max-w-xs">${escapeHtml(state.stampUrl)}</div>
                    </div>
                ` : `<div></div>`}
            </div>
            ${p.showQrCode ? `
                <div class="flex items-center gap-2">
                    <span class="hidden sm:inline-block text-[10px] font-bold text-right leading-tight" style="color: ${theme.subtext};">
                        ストア直通 ➔
                    </span>
                    <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                        <div id="bannerQrCodeContainer"></div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// --- テンプレート 2: 4〜8分割ピックアップ (Grid Showcase) ---
function renderGridShowcaseTemplate(theme) {
    const isStory = state.aspectRatio === '9-16';
    const isSquare = state.aspectRatio === '1-1';
    const p = state.parts;
    const scale = p.stampScale || 'normal';
    const featuredStamps = state.stamps.filter(s => state.featuredStampIds.includes(s.id));
    const displayStamps = featuredStamps.length > 0 ? featuredStamps : state.stamps;

    // スケールに応じたスタンプ画像サイズ
    const imgSize = scale === 'compact' ? 'w-11 h-11 md:w-13 md:h-13' : (scale === 'large' ? 'w-16 h-16 md:w-18 md:h-18' : 'w-13 h-13 md:w-15 md:h-15');

    if (isStory) {
        // 9:16 縦長ストーリー専用レイアウト
        return `
            <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:18px_18px]"></div>

            <div class="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
                <!-- ヘッダー -->
                <div class="text-center mb-1 shrink-0">
                    ${p.showBadge ? `
                        <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow mb-1" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                            <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHtml(state.badgeText)}
                        </div>
                    ` : ''}
                    <h2 class="text-base sm:text-lg font-black tracking-tight leading-tight mb-0.5 drop-shadow-md">
                        ${escapeHtml(state.title)}
                    </h2>
                    ${p.showCopy ? `
                        <p class="text-[9px] sm:text-[10px] font-bold opacity-80" style="color: ${theme.subtext};">
                            ${escapeHtml(state.copy)}
                        </p>
                    ` : ''}
                </div>

                <!-- スタンプグリッド (2列 × 3行 = 6個) -->
                <div class="grid grid-cols-2 gap-1.5 max-w-sm mx-auto w-full my-auto shrink-0">
                    ${displayStamps.slice(0, 6).map(s => `
                        <div class="p-1 rounded-xl border backdrop-blur flex flex-col items-center justify-center shadow-md" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                            <img src="${s.dataUrl}" class="w-12 h-12 object-contain drop-shadow-sm">
                            <span class="text-[8px] font-bold text-center mt-0.5 truncate w-full opacity-90">${escapeHtml(s.name.replace(/\.[^/.]+$/, ''))}</span>
                        </div>
                    `).join('')}
                </div>

                <!-- フッター情報 -->
                <div class="pt-2 border-t flex items-center justify-between shrink-0" style="border-color: ${theme.border};">
                    <div class="text-left">
                        ${p.showPrice ? `
                            <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border mb-0.5" style="background: ${theme.cardBg}; border-color: ${theme.border}; color: ${theme.primary};">
                                ${escapeHtml(state.price)}
                            </span>
                        ` : ''}
                        ${p.showAuthor ? `<div class="text-[10px] font-bold opacity-80">${escapeHtml(state.author)}</div>` : ''}
                    </div>
                    ${p.showQrCode ? `
                        <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 16:9 または 1:1 (縦幅540pxに余裕で収まるようサイズ調整)
    const gridCols = isSquare ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-4';
    const stampLimit = isSquare ? 6 : 8;

    return `
        <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:18px_18px]"></div>

        <div class="relative z-10 px-4 md:px-6 py-3 md:py-4 flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            <!-- ヘッダー -->
            <div class="text-center mb-1 shrink-0">
                ${p.showBadge ? `
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow mb-1" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                        <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHtml(state.badgeText)}
                    </div>
                ` : ''}
                <h2 class="text-lg md:text-2xl font-black tracking-tight leading-tight mb-0.5 drop-shadow-md">
                    ${escapeHtml(state.title)}
                </h2>
                ${p.showCopy ? `
                    <p class="text-[10px] md:text-xs font-bold opacity-80" style="color: ${theme.subtext};">
                        ${escapeHtml(state.copy)}
                    </p>
                ` : ''}
            </div>

            <!-- スタンプグリッド (コンパクト設計でフッターが見切れない) -->
            <div class="grid ${gridCols} gap-2 md:gap-2.5 max-w-3xl mx-auto w-full my-auto shrink-0">
                ${displayStamps.slice(0, stampLimit).map(s => `
                    <div class="p-1.5 md:p-2 rounded-xl border backdrop-blur flex flex-col items-center justify-center shadow-lg transition-transform hover:-translate-y-0.5" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                        <img src="${s.dataUrl}" class="${imgSize} object-contain drop-shadow-md">
                        <span class="text-[8px] md:text-[9px] font-bold text-center mt-1 truncate w-full opacity-90">${escapeHtml(s.name.replace(/\.[^/.]+$/, ''))}</span>
                    </div>
                `).join('')}
            </div>

            <!-- フッター情報 -->
            <div class="pt-2 border-t flex items-center justify-between shrink-0" style="border-color: ${theme.border};">
                <div class="flex items-center gap-2">
                    ${p.showPrice ? `
                        <span class="px-2 py-0.5 rounded-lg text-xs font-bold font-mono border" style="background: ${theme.cardBg}; border-color: ${theme.border}; color: ${theme.primary};">
                            ${escapeHtml(state.price)}
                        </span>
                    ` : ''}
                    ${p.showAuthor ? `<span class="text-xs font-bold opacity-75">${escapeHtml(state.author)}</span>` : ''}
                </div>
                ${p.showQrCode ? `
                    <div class="flex items-center gap-2">
                        <span class="hidden sm:inline-block text-[10px] font-bold" style="color: ${theme.subtext};">ストア直通 ➔</span>
                        <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// --- テンプレート 3: 全体一覧ポスター (Full Grid Poster) ---
function renderPosterTemplate(theme) {
    const isStory = state.aspectRatio === '9-16';
    const isSquare = state.aspectRatio === '1-1';
    const p = state.parts;
    const scale = p.stampScale || 'normal';

    if (isStory) {
        // 9:16 縦長ストーリー専用レイアウト (5列 × 8行 = 40個 全て綺麗に収まる)
        return `
            <div class="relative z-10 p-4 flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
                <!-- ヘッダー: タイトル ＋ 右上QRコード -->
                <div class="flex items-center justify-between mb-1.5 border-b pb-1.5 shrink-0" style="border-color: ${theme.border};">
                    <div>
                        ${p.showBadge ? `<span class="text-[8px] font-black px-2 py-0.5 rounded font-mono" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">${escapeHtml(state.badgeText)}</span>` : ''}
                        <h2 class="text-base sm:text-lg font-black mt-0.5 leading-tight">${escapeHtml(state.title)}</h2>
                    </div>
                    ${p.showQrCode ? `
                        <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    ` : ''}
                </div>

                <!-- スタンプグリッド (5列 × 8行 = 40個) -->
                <div class="grid grid-cols-5 gap-1 my-auto w-full">
                    ${state.stamps.slice(0, 40).map(s => `
                        <div class="p-0.5 rounded-lg border flex items-center justify-center shadow-xs" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                            <img src="${s.dataUrl}" class="w-8 h-8 object-contain">
                        </div>
                    `).join('')}
                </div>

                <!-- フッター -->
                <div class="mt-1 pt-1.5 border-t flex items-center justify-between text-[10px] shrink-0" style="border-color: ${theme.border}; color: ${theme.subtext};">
                    <span class="font-bold">全${state.stamps.length}種類収録！</span>
                    ${p.showPrice ? `<span class="font-mono font-bold" style="color: ${theme.primary};">${escapeHtml(state.price)}</span>` : ''}
                    ${p.showAuthor ? `<span class="truncate max-w-[120px]">${escapeHtml(state.author)}</span>` : ''}
                </div>
            </div>
        `;
    }

    // 16:9 または 1:1
    // ★ 16:9横長では 10列×4行（4行）にすることで、従来の5行による下部はみ出し・見切れを根本解消！
    const colsClass = isSquare ? 'grid-cols-6 sm:grid-cols-7' : 'grid-cols-8 sm:grid-cols-10';
    const imgSize = isSquare 
        ? (scale === 'compact' ? 'w-8 h-8' : (scale === 'large' ? 'w-11 h-11' : 'w-9 h-9'))
        : (scale === 'compact' ? 'w-8 h-8 md:w-9 md:h-9' : (scale === 'large' ? 'w-11 h-11 md:w-12 md:h-12' : 'w-9 h-9 md:w-10 md:h-10'));
    const maxStamps = isSquare ? 35 : 40;

    return `
        <div class="relative z-10 px-4 md:px-6 py-2.5 md:py-3.5 flex-1 flex flex-col justify-between w-full h-full overflow-hidden">
            <!-- 上部ヘッダー -->
            <div class="flex items-center justify-between mb-1.5 border-b pb-1.5 shrink-0" style="border-color: ${theme.border};">
                <div>
                    ${p.showBadge ? `<span class="text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded font-mono" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">${escapeHtml(state.badgeText)}</span>` : ''}
                    <h2 class="text-base md:text-xl font-black mt-0.5 leading-tight">${escapeHtml(state.title)}</h2>
                </div>
                ${p.showQrCode ? `
                    <div class="flex items-center gap-2 shrink-0">
                        <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- スタンプグリッド (10列×4行で縦スペースを大幅節約、切れない設計) -->
            <div class="grid ${colsClass} gap-1 md:gap-1.5 my-auto w-full">
                ${state.stamps.slice(0, maxStamps).map(s => `
                    <div class="p-0.5 md:p-1 rounded-lg border flex items-center justify-center shadow-xs" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                        <img src="${s.dataUrl}" class="${imgSize} object-contain">
                    </div>
                `).join('')}
            </div>

            <!-- 下部フッター（見切れずに必ず表示） -->
            <div class="pt-1.5 border-t flex items-center justify-between text-[11px] shrink-0" style="border-color: ${theme.border}; color: ${theme.subtext};">
                <span class="font-bold">全${state.stamps.length}種類収録！</span>
                ${p.showPrice ? `<span class="font-mono font-bold" style="color: ${theme.primary};">${escapeHtml(state.price)}</span>` : ''}
                ${p.showAuthor ? `<span>${escapeHtml(state.author)}</span>` : ''}
            </div>
        </div>
    `;
}

// --- テンプレート 4: ハイライトカード (Highlight Card) ---
function renderHighlightCardTemplate(theme) {
    const isStory = state.aspectRatio === '9-16';
    const p = state.parts;
    const featured = state.stamps.filter(s => state.featuredStampIds.includes(s.id));
    const stampsToUse = featured.length > 0 ? featured : state.stamps;
    const mainStamp = stampsToUse[0] || state.stamps[0] || { dataUrl: '' };
    const subStamps = stampsToUse.slice(1, 4);

    if (isStory) {
        // 9:16 縦長ストーリー専用レイアウト
        return `
            <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:18px_18px]"></div>

            <div class="relative z-10 p-4 sm:p-5 flex-1 flex flex-col justify-between items-center text-center w-full h-full overflow-hidden">
                <!-- 上部: タイトル -->
                <div class="w-full shrink-0">
                    ${p.showBadge ? `
                        <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow mb-1.5" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                            <i data-lucide="sparkles" class="w-3 h-3"></i> ${escapeHtml(state.badgeText)}
                        </div>
                    ` : ''}
                    <h2 class="text-lg sm:text-xl font-black tracking-tight leading-tight mb-1">
                        ${escapeHtml(state.title)}
                    </h2>
                    ${p.showCopy ? `
                        <p class="text-[10px] sm:text-[11px] font-bold opacity-80" style="color: ${theme.subtext};">
                            ${escapeHtml(state.copy)}
                        </p>
                    ` : ''}
                </div>

                <!-- 中央: メインスタンプ特大カード -->
                <div class="flex flex-col items-center gap-2 my-auto shrink-0">
                    <div class="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl border-2 flex flex-col items-center justify-center p-3 shadow-2xl relative" 
                         style="background: ${theme.cardBg}; border-color: ${theme.border};">
                        <span class="absolute top-2.5 left-2.5 text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border opacity-80" 
                              style="background: ${theme.cardBg}; border-color: ${theme.border}; color: ${theme.primary};">
                            FEATURED
                        </span>
                        <img src="${mainStamp.dataUrl}" class="w-full h-full object-contain drop-shadow-xl">
                    </div>

                    ${(p.showSideStamps && subStamps.length > 0) ? `
                        <div class="flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur shadow-md" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                            <span class="text-[9px] font-bold px-1 opacity-75" style="color: ${theme.subtext};">収録 ➔</span>
                            ${subStamps.map(s => `
                                <div class="w-9 h-9 rounded-xl bg-black/25 p-1 border flex items-center justify-center" style="border-color: ${theme.border};">
                                    <img src="${s.dataUrl}" class="w-full h-full object-contain drop-shadow-sm">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <!-- 下部: フッター＆QRコード -->
                <div class="w-full pt-2 border-t flex items-center justify-between shrink-0" style="border-color: ${theme.border};">
                    <div class="text-left">
                        ${p.showAuthor ? `<div class="text-xs font-bold">${escapeHtml(state.author)}</div>` : ''}
                        ${p.showPrice ? `<div class="text-xs font-mono font-bold" style="color: ${theme.primary};">${escapeHtml(state.price)}</div>` : ''}
                        ${p.showAuthor ? `<div class="text-[9px] opacity-75 font-mono truncate max-w-[160px]">${escapeHtml(state.stampUrl)}</div>` : ''}
                    </div>
                    ${p.showQrCode ? `
                        <div class="p-1 bg-white rounded-lg shadow-md shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // 16:9 または 1:1 レイアウト
    return `
        <div class="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(${theme.primary}_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div class="relative z-10 px-5 md:px-8 py-4 md:py-6 flex-1 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 w-full h-full overflow-hidden">
            <!-- 左側: 告知テキスト & QR -->
            <div class="flex-1 space-y-2.5 max-w-lg">
                ${p.showBadge ? `
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black shadow-md" style="background: ${theme.badgeBg}; color: ${theme.badgeText};">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> ${escapeHtml(state.badgeText)}
                    </div>
                ` : ''}
                
                <h2 class="text-xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-md">
                    ${escapeHtml(state.title)}
                </h2>
                
                ${p.showCopy ? `
                    <p class="text-xs md:text-sm font-bold opacity-80 leading-relaxed" style="color: ${theme.subtext};">
                        ${escapeHtml(state.copy)}
                    </p>
                ` : ''}

                <!-- ストア情報 ＆ QRコード -->
                <div class="pt-2.5 flex items-center gap-3.5 border-t" style="border-color: ${theme.border};">
                    ${p.showQrCode ? `
                        <div class="p-1.5 bg-white rounded-xl shadow-lg shrink-0">
                            <div id="bannerQrCodeContainer"></div>
                        </div>
                    ` : ''}
                    <div>
                        ${p.showAuthor ? `<div class="text-xs font-bold leading-snug">${escapeHtml(state.author)}</div>` : ''}
                        ${p.showPrice ? `<div class="text-sm font-mono font-black mt-0.5" style="color: ${theme.primary};">${escapeHtml(state.price)}</div>` : ''}
                        ${p.showAuthor ? `<div class="text-[9px] opacity-75 font-mono truncate max-w-[200px] mt-0.5">${escapeHtml(state.stampUrl)}</div>` : ''}
                    </div>
                </div>
            </div>

            <!-- 右側: メインスタンプ ＆ サブスタンプトレイ -->
            <div class="flex flex-col items-center gap-2.5 shrink-0">
                <div class="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-3xl border-2 flex flex-col items-center justify-center p-3.5 shadow-2xl relative" 
                     style="background: ${theme.cardBg}; border-color: ${theme.border};">
                    <span class="absolute top-2.5 left-2.5 text-[8px] md:text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border opacity-80" 
                          style="background: ${theme.cardBg}; border-color: ${theme.border}; color: ${theme.primary};">
                        FEATURED
                    </span>
                    <img src="${mainStamp.dataUrl}" class="w-full h-full object-contain drop-shadow-xl transition-transform hover:scale-105">
                </div>

                ${(p.showSideStamps && subStamps.length > 0) ? `
                    <div class="flex items-center gap-1.5 p-1.5 rounded-2xl border backdrop-blur shadow-md" style="background: ${theme.cardBg}; border-color: ${theme.border};">
                        <span class="text-[9px] font-bold px-1.5 opacity-75 whitespace-nowrap" style="color: ${theme.subtext};">こちらも収録 ➔</span>
                        ${subStamps.map(s => `
                            <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-black/25 p-1 border flex items-center justify-center" style="border-color: ${theme.border};">
                                <img src="${s.dataUrl}" class="w-full h-full object-contain drop-shadow-sm">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// --- QRコード生成 (qrcodejs) ---
function renderQrCode() {
    const containers = document.querySelectorAll('#bannerQrCodeContainer');
    if (!containers || containers.length === 0) return;

    const rawUrl = (state.stampUrl || 'https://line.me/').trim();
    const isStory = state.aspectRatio === '9-16';
    const isPoster = state.selectedTemplate === 'poster-40';
    const qrSize = isPoster ? 48 : (isStory ? 60 : 68);

    containers.forEach(container => {
        container.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: rawUrl,
                width: qrSize,
                height: qrSize,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    });
}

// --- 画像エクスポート（html2canvas） ---
async function exportBannerImage() {
    const banner = document.getElementById('previewBanner');
    if (!banner) return;

    showToast('告知バナー画像を生成中……', 'info');

    try {
        const canvas = await html2canvas(banner, {
            scale: 2, // 高解像度（Retina対応）
            useCORS: true,
            logging: false,
            backgroundColor: null
        });

        const link = document.createElement('a');
        const safeTitle = (state.title || 'stamp_promo').replace(/[\\/:*?"<>|]/g, '_');
        link.download = `${safeTitle}_告知バナー.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('高画質PNG画像を出力しました！🎉', 'success');
    } catch (e) {
        console.error('画像生成エラー:', e);
        showToast('画像の生成に失敗しました: ' + e.message, 'error');
    }
}

// --- X（Twitter）投稿用文面のコピー ---
function copyXPromoText() {
    const tags = '#LINEスタンプ #LINEスタンプクリエイターズ #クリエイターズスタンプ';
    const text = `📢 【${state.badgeText}】
『${state.title}』

${state.copy}

日常で使いやすいスタンプが盛りだくさんです✨
ぜひチェックしてね！

👇 LINEストアはこちら
${state.stampUrl}

${tags}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast('X(Twitter)用告知文をコピーしました！📋', 'success');
    }).catch(() => {
        showToast('コピーに失敗しました', 'error');
    });
}

// --- トースト通知 ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('promoToast');
    const msgEl = document.getElementById('promoToastMessage');
    const iconEl = document.getElementById('promoToastIcon');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    if (type === 'success') {
        iconEl.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>';
    } else if (type === 'error') {
        iconEl.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>';
    } else {
        iconEl.innerHTML = '<i data-lucide="info" class="w-4 h-4 text-sky-400"></i>';
    }
    lucide.createIcons();

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
}

// --- HTMLエスケープ ---
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
