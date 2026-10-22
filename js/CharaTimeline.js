/**
 * 運命の刻録：探索者クロニクル (CharaTimeline)
 * ロジック & データ管理モジュール
 */

// ストレージキー定義
const STORAGE_KEYS = {
    CHARACTERS: 'weby_trpg_characters',        // CharaCompare / CharaRelation 共通
    TIMELINES: 'weby_trpg_timelines',           // 保存された年表一覧
    CURRENT_ID: 'weby_trpg_timeline_active_id',  // 現在編集中の年表ID
    THEME: 'weby_trpg_timeline_theme'           // 現在のデザインテーマ
};

// カテゴリプリセット定義
const EVENT_CATEGORIES = {
    encounter: { label: '出会い・邂逅', icon: 'sparkles', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    daily: { label: '穏やかな日常', icon: 'coffee', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    battle: { label: '事件・共闘', icon: 'swords', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    conflict: { label: 'すれ違い・葛藤', icon: 'cloud-rain', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    bond: { label: '誓約・信頼', icon: 'heart', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
    parting: { label: '別離・岐路', icon: 'hourglass', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
    future: { label: '未来・IF', icon: 'stars', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' }
};

// アプリケーション状態
let currentTimeline = {
    id: '',
    title: 'ふたりの奇跡と軌跡',
    subtitle: '運命の糸が紡いだ出会いから現在までの歩み',
    characters: [
        {
            name: '探索者 A',
            role: '先見の観察者',
            iconUrl: '',
            color: '#d97706',
            initialSentiment: 50
        },
        {
            name: '探索者 B',
            role: '寡黙な守護者',
            iconUrl: '',
            color: '#3b82f6',
            initialSentiment: 30
        }
    ],
    episodes: []
};

let allTimelines = [];
let trpgCharacters = [];
let chartInstance = null;
let sortableInstance = null;
let activeModalCharSlot = 0; // 0: Char A, 1: Char B
let activeEmojiCharSlot = 0; // 0: Char A, 1: Char B
let charSearchKeyword = '';

// 絵文字プリセットリスト
const PRESET_EMOJIS = {
    animal: ['🦊', '🐱', '🐶', '🐺', '🐰', '🕊️', '🦉', '🐻', '🐼', '🐧', '🐸', '🐙', '🦋', '🐉'],
    item: ['⚔️', '🗡️', '🛡️', '🏹', '🪄', '🔮', '📜', '🗝️', '🧭', '🕵️', '🧑‍⚕️', '👑', '🎩', '👓'],
    symbol: ['🌙', '☀️', '⭐', '⚡', '🔥', '💧', '❄️', '🌿', '🌸', '☕', '🍷', '🎲', '🎭', '💖']
};

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadTrpgCharacters();
    loadAllTimelines();
    loadTheme();
    setupSortable();
    initChart();
    initEmojiPalettes();
    renderAll();
});

// --- キャラクターデータの読込 (CharaCompare / CharaRelation 連携) ---
function loadTrpgCharacters() {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    if (raw) {
        try {
            trpgCharacters = JSON.parse(raw);
        } catch (e) {
            console.error('魔導書データの読み込みに失敗しました', e);
            trpgCharacters = [];
        }
    } else {
        trpgCharacters = [];
    }
}

// --- 年表データの保存と読込 ---
function loadAllTimelines() {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMELINES);
    if (raw) {
        try {
            allTimelines = JSON.parse(raw);
        } catch (e) {
            allTimelines = [];
        }
    }

    const activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_ID);
    if (activeId && allTimelines.length > 0) {
        const found = allTimelines.find(t => t.id === activeId);
        if (found) {
            currentTimeline = found;
            return;
        }
    }

    if (allTimelines.length > 0) {
        currentTimeline = allTimelines[0];
    } else {
        loadSampleData();
    }
}

function saveCurrentTimeline() {
    if (!currentTimeline.id) {
        currentTimeline.id = 'timeline_' + Date.now();
    }
    const idx = allTimelines.findIndex(t => t.id === currentTimeline.id);
    if (idx >= 0) {
        allTimelines[idx] = JSON.parse(JSON.stringify(currentTimeline));
    } else {
        allTimelines.push(JSON.parse(JSON.stringify(currentTimeline)));
    }
    localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(allTimelines));
    localStorage.setItem(STORAGE_KEYS.CURRENT_ID, currentTimeline.id);
    showToast('写本に刻録を記録しました', 'success');
}

// --- サンプルデータの読み込み ---
function loadSampleData() {
    currentTimeline = {
        id: 'sample_chronicle_' + Date.now(),
        title: '終焉と黎明のクロニクル',
        subtitle: '霧深き街での出会いから、世界を分かつ決断に至るふたりの記録',
        characters: [
            {
                name: 'エリス・ヴァレンシュタイン',
                role: '真理を追う魔術鑑定士',
                iconUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                color: '#d97706',
                initialSentiment: 40
            },
            {
                name: 'レイン・アークライト',
                role: '影を歩く放浪の祓魔師',
                iconUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                color: '#3b82f6',
                initialSentiment: 25
            }
        ],
        episodes: [
            {
                id: 'ep_1',
                period: 'プロローグ：雨宿りの廃教会',
                title: '刃と古書が交差した夜',
                date: '新暦842年 霜月',
                category: 'encounter',
                relation: '警戒・素性不明',
                sentimentA: 35,
                sentimentB: 30,
                content: '追手から逃れて飛び込んだ崩れかけの礼拝堂。暗闇の奥、冷たい抜き身の切っ先を突きつけてきたのが彼だった。\n「動くな。……魔導書を持ったただの学者か？」\n互いに背後を警戒しながら、夜が明けるまで一言も交わさず背中を預けた。',
                quote: '「名前は名乗らないでおこう。明日の朝には互いに死んでいるかもしれないからね」',
                imageUrl: ''
            },
            {
                id: 'ep_2',
                period: '第1章：路地裏の奇妙な共犯',
                title: '錆びた鍵と淹れたての珈琲',
                date: '新暦843年 芽吹月',
                category: 'daily',
                relation: '利害の一致・ビジネス相手',
                sentimentA: 55,
                sentimentB: 45,
                content: '街外れの古書店に彼がふらりと現れるようになった。持ち込まれるのは呪われた遺物ばかり。鑑定のお礼にと彼が淹れる珈琲は、呆れるほど苦くて美味しかった。\nいつの間にか、危険な調査には必ず彼が同行するようになっていた。',
                quote: '「君が死ぬと、この街でまともな古代語が読めるやつがいなくなる。それだけだ」',
                imageUrl: ''
            },
            {
                id: 'ep_3',
                period: '第2章：深淵の儀式',
                title: '紅蓮の火炎と絶望の誓い',
                date: '新暦843年 狩猟月',
                category: 'battle',
                relation: '唯一無二の共犯者・背中を預ける仲',
                sentimentA: 80,
                sentimentB: 75,
                content: '教団の地下聖堂にて。暴走した禁忌の門を閉じるため、エリスは命を削る詠唱に入った。迫り来る無数の異形を、レインは血みどろになりながら一歩も引かず斬り伏せ続けた。\n「お前の背中は、俺が地獄の底まで守る」',
                quote: '「詠唱を止めるな、エリス！ お前が前を向いている限り、俺は絶対に倒れない！」',
                imageUrl: ''
            },
            {
                id: 'ep_4',
                period: '第3章：すれ違いの雨',
                title: '隠された宿命の刻印',
                date: '新暦844年 凍結月',
                category: 'conflict',
                relation: '秘匿・苦悩する絆',
                sentimentA: 65,
                sentimentB: 60,
                content: 'レインの右腕に浮かぶ狂気の紋章――それはいつか自我を失い、エリスが封印すべき宿敵と同じ刻印だった。彼が真実を隠していたことに激怒したエリスと、彼女を巻き込みたくなかったレイン。激しい口論の末、冷たい雨の中にレインは姿を消した。',
                quote: '「どうして頼ってくれなかったの……！ 私は、あなたを救うためにここにいるのに」',
                imageUrl: ''
            },
            {
                id: 'ep_5',
                period: 'エピローグ：夜明けの水平線',
                title: '未来への契約',
                date: '新暦845年 陽光月',
                category: 'bond',
                relation: '魂の伴侶・運命の共鳴',
                sentimentA: 95,
                sentimentB: 92,
                content: '地の果ての灯台にて再会。互いの不器用さと孤独を認め合い、ふたりだけの新しい契約を結んだ。世界の理がふたりを引き裂こうとも、光が尽きるその瞬間まで共に歩むことを誓った。',
                quote: '「神が定めた運命なんて書き換えてみせる。君とふたりでね」',
                imageUrl: ''
            }
        ]
    };
    saveCurrentTimeline();
    renderAll();
}

// --- 全体の再描画 ---
function renderAll() {
    renderHeaderInfo();
    renderTimelinePreview();
    renderEpisodeEditorList();
    updateChart();
    lucide.createIcons();
}

// --- キャラクターアイコン表示HTMLヘルパー ---
function getCharIconHtml(char, size = 'editor', fallbackColor = '#d97706') {
    const isPreview = size === 'preview';
    const isSmall = size === 'sm';
    const emojiClass = isPreview ? 'text-3xl sm:text-4xl' : (isSmall ? 'text-sm' : 'text-2xl');
    const lucideSize = isPreview ? 'w-8 h-8' : (isSmall ? 'w-3 h-3' : 'w-6 h-6');

    // 1. 絵文字アイコン
    if (char && char.iconType === 'emoji' && char.iconEmoji) {
        return `<div class="w-full h-full flex items-center justify-center select-none ${emojiClass} leading-none">${escapeHtml(char.iconEmoji)}</div>`;
    }
    // 2. 画像アイコン
    if (char && char.iconUrl && char.iconType !== 'none') {
        return `<img src="${char.iconUrl}" class="w-full h-full object-cover object-top rounded-full">`;
    }
    // 3. 画像なし（シルエット）
    return `<div class="w-full h-full flex items-center justify-center"><i data-lucide="user" class="${lucideSize}" style="color: ${char?.color || fallbackColor};"></i></div>`;
}

// --- ヘッダー・キャラクター情報の描画 ---
function renderHeaderInfo() {
    document.getElementById('timelineTitleInput').value = currentTimeline.title || '';
    document.getElementById('timelineSubtitleInput').value = currentTimeline.subtitle || '';

    // キャラクターA
    const charA = currentTimeline.characters[0] || { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#d97706' };
    document.getElementById('charANameInput').value = charA.name || '';
    document.getElementById('charARoleInput').value = charA.role || '';
    document.getElementById('charAColorInput').value = charA.color || '#d97706';
    const charAIconPreview = document.getElementById('charAIconPreview');
    charAIconPreview.innerHTML = getCharIconHtml(charA, 'editor', '#d97706');

    // キャラクターB
    const charB = currentTimeline.characters[1] || { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#3b82f6' };
    document.getElementById('charBNameInput').value = charB.name || '';
    document.getElementById('charBRoleInput').value = charB.role || '';
    document.getElementById('charBColorInput').value = charB.color || '#3b82f6';
    const charBIconPreview = document.getElementById('charBIconPreview');
    charBIconPreview.innerHTML = getCharIconHtml(charB, 'editor', '#3b82f6');

    // プレビュー側タイトル反映
    document.getElementById('previewTitle').textContent = currentTimeline.title || '（無題のクロニクル）';
    document.getElementById('previewSubtitle').textContent = currentTimeline.subtitle || '運命の糸が紡ぐ歩みの記録';

    // プレビュー側キャラバナー
    const dispNameA = charA.name || '探索者 A';
    const dispNameB = charB.name || '探索者 B';
    document.getElementById('previewCharAName').textContent = dispNameA;
    document.getElementById('previewCharARole').textContent = charA.role || '（役割未定）';
    document.getElementById('previewCharAName').style.color = charA.color || '#d97706';
    document.getElementById('previewCharAIcon').innerHTML = getCharIconHtml(charA, 'preview', '#d97706');

    document.getElementById('previewCharBName').textContent = dispNameB;
    document.getElementById('previewCharBRole').textContent = charB.role || '（役割未定）';
    document.getElementById('previewCharBName').style.color = charB.color || '#3b82f6';
    document.getElementById('previewCharBIcon').innerHTML = getCharIconHtml(charB, 'preview', '#3b82f6');

    // カウンター
    document.getElementById('episodeCountBadge').textContent = `${currentTimeline.episodes.length} 件の記録`;
}

// --- キャラクター情報の更新ハンドラ ---
function updateCharacterMeta() {
    currentTimeline.title = document.getElementById('timelineTitleInput').value;
    currentTimeline.subtitle = document.getElementById('timelineSubtitleInput').value;

    currentTimeline.characters[0] = {
        ...currentTimeline.characters[0],
        name: document.getElementById('charANameInput').value,
        role: document.getElementById('charARoleInput').value,
        color: document.getElementById('charAColorInput').value || '#d97706'
    };

    currentTimeline.characters[1] = {
        ...currentTimeline.characters[1],
        name: document.getElementById('charBNameInput').value,
        role: document.getElementById('charBRoleInput').value,
        color: document.getElementById('charBColorInput').value || '#3b82f6'
    };

    renderHeaderInfo();
    updateChart();
    saveCurrentTimeline();
}

// --- 魔導書（CharaCompare）からのキャラインポートモーダル ---
function openCharSelectModal(slotIndex) {
    activeModalCharSlot = slotIndex;
    const modal = document.getElementById('charSelectModal');
    const slotLabel = slotIndex === 0 ? '探索者 A' : '探索者 B';
    document.getElementById('modalSlotLabel').textContent = slotLabel;

    const searchInput = document.getElementById('charSearchInput');
    if (searchInput) searchInput.value = '';
    charSearchKeyword = '';
    const clearBtn = document.getElementById('charSearchClearBtn');
    if (clearBtn) clearBtn.classList.add('hidden');

    loadTrpgCharacters();
    renderCharSelectList();
    modal.classList.remove('hidden');
    if (searchInput) setTimeout(() => searchInput.focus(), 50);
}

function filterCharSelectList() {
    const searchInput = document.getElementById('charSearchInput');
    const clearBtn = document.getElementById('charSearchClearBtn');
    charSearchKeyword = (searchInput?.value || '').trim().toLowerCase();

    if (charSearchKeyword) {
        clearBtn?.classList.remove('hidden');
    } else {
        clearBtn?.classList.add('hidden');
    }
    renderCharSelectList();
}

function clearCharSearch() {
    const searchInput = document.getElementById('charSearchInput');
    if (searchInput) searchInput.value = '';
    charSearchKeyword = '';
    document.getElementById('charSearchClearBtn')?.classList.add('hidden');
    renderCharSelectList();
    searchInput?.focus();
}

function renderCharSelectList() {
    const list = document.getElementById('charSelectList');
    if (!list) return;
    list.innerHTML = '';

    if (trpgCharacters.length === 0) {
        list.innerHTML = `
            <div class="col-span-full py-8 text-center text-stone-500">
                <i data-lucide="book-x" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                <p class="text-xs">探索者比較の魔導書に登録されたキャラクターが見つかりません</p>
                <p class="text-[11px] text-stone-600 mt-1">「新規作成」で入力するか、CharaCompare.html でいあきゃらJSONを読み込んでください</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const filtered = trpgCharacters.filter(c => {
        if (!charSearchKeyword) return true;
        const name = (c.name || '').toLowerCase();
        const job = (c.job || c.occupation || c.role || '').toLowerCase();
        const memo = (c.memo || c.summary || '').toLowerCase();
        const tags = Array.isArray(c.tags) ? c.tags.join(' ').toLowerCase() : (c.tags || '').toLowerCase();
        return name.includes(charSearchKeyword) || job.includes(charSearchKeyword) || memo.includes(charSearchKeyword) || tags.includes(charSearchKeyword);
    });

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="py-8 text-center text-stone-500 text-xs">
                <i data-lucide="search-x" class="w-6 h-6 mx-auto mb-1.5 opacity-40"></i>
                「${escapeHtml(charSearchKeyword)}」に一致するキャラクターはいません
            </div>
        `;
        lucide.createIcons();
        return;
    }

    filtered.forEach(c => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 p-2.5 rounded-xl bg-stone-900/60 border border-amber-950/40 hover:border-amber-600 hover:bg-amber-950/30 cursor-pointer transition-all group';
        
        const iconHtml = c.iconUrl 
            ? `<img src="${c.iconUrl}" class="w-10 h-10 rounded-full object-cover object-top border border-amber-900/50 shrink-0">`
            : `<div class="w-10 h-10 rounded-full bg-stone-800 border border-amber-900/50 flex items-center justify-center shrink-0"><i data-lucide="user" class="w-5 h-5 text-stone-500"></i></div>`;
        
        const occupation = c.job || c.occupation || c.role || '探索者';
        
        item.innerHTML = `
            ${iconHtml}
            <div class="overflow-hidden flex-1">
                <div class="text-xs font-bold text-stone-200 group-hover:text-amber-300 truncate">${escapeHtml(c.name || '名無し')}</div>
                <div class="text-[10px] text-stone-500 truncate">${escapeHtml(occupation)}</div>
            </div>
            <i data-lucide="check-circle-2" class="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        `;

        item.onclick = () => {
            selectCharFromModal(c);
            closeCharSelectModal();
        };

        list.appendChild(item);
    });

    lucide.createIcons();
}

function closeCharSelectModal() {
    document.getElementById('charSelectModal').classList.add('hidden');
}

function selectCharFromModal(charData) {
    const slot = activeModalCharSlot;
    currentTimeline.characters[slot].name = charData.name || (slot === 0 ? '探索者 A' : '探索者 B');
    currentTimeline.characters[slot].role = charData.job || charData.occupation || charData.role || '探索者';
    if (charData.iconUrl) {
        currentTimeline.characters[slot].iconUrl = charData.iconUrl;
        currentTimeline.characters[slot].iconType = 'image';
        currentTimeline.characters[slot].iconEmoji = '';
    } else {
        currentTimeline.characters[slot].iconUrl = '';
        currentTimeline.characters[slot].iconType = 'none';
        currentTimeline.characters[slot].iconEmoji = '';
    }
    renderHeaderInfo();
    saveCurrentTimeline();
    showToast(`${currentTimeline.characters[slot].name} をセットしました`, 'success');
}

// --- アイコン画像の直接アップロード ---
function triggerIconUpload(slotIndex) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            currentTimeline.characters[slotIndex].iconUrl = event.target.result;
            currentTimeline.characters[slotIndex].iconType = 'image';
            currentTimeline.characters[slotIndex].iconEmoji = '';
            renderHeaderInfo();
            saveCurrentTimeline();
            showToast('画像を登録しました', 'success');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// --- 絵文字パレット・絵文字設定 ---
function initEmojiPalettes() {
    const bindPalette = (containerId, emojis) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'w-9 h-9 rounded-lg bg-stone-900 hover:bg-amber-950/60 border border-amber-950/60 hover:border-amber-500 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm text-lg';
            btn.textContent = emoji;
            btn.onclick = () => {
                setCharEmoji(activeEmojiCharSlot, emoji);
                closeEmojiModal();
            };
            container.appendChild(btn);
        });
    };

    bindPalette('presetEmojiAnimal', PRESET_EMOJIS.animal);
    bindPalette('presetEmojiItem', PRESET_EMOJIS.item);
    bindPalette('presetEmojiSymbol', PRESET_EMOJIS.symbol);
}

function openEmojiModal(slotIndex) {
    activeEmojiCharSlot = slotIndex;
    const modal = document.getElementById('emojiSelectModal');
    const label = document.getElementById('emojiModalTargetLabel');
    const customInput = document.getElementById('customEmojiInput');
    
    const char = currentTimeline.characters[slotIndex] || {};
    label.textContent = char.name ? char.name : (slotIndex === 0 ? '探索者 A' : '探索者 B');
    
    if (customInput) {
        customInput.value = (char.iconType === 'emoji' && char.iconEmoji) ? char.iconEmoji : '';
    }

    modal.classList.remove('hidden');
    if (customInput) setTimeout(() => customInput.focus(), 50);
}

function closeEmojiModal() {
    document.getElementById('emojiSelectModal').classList.add('hidden');
}

function applyCustomEmoji() {
    const input = document.getElementById('customEmojiInput');
    const val = (input?.value || '').trim();
    if (!val) {
        showToast('絵文字を入力してください', 'error');
        return;
    }
    setCharEmoji(activeEmojiCharSlot, val);
    closeEmojiModal();
}

function setCharEmoji(slotIndex, emoji) {
    if (!currentTimeline.characters[slotIndex]) return;
    currentTimeline.characters[slotIndex].iconType = 'emoji';
    currentTimeline.characters[slotIndex].iconEmoji = emoji;
    currentTimeline.characters[slotIndex].iconUrl = '';
    renderHeaderInfo();
    saveCurrentTimeline();
    showToast(`アイコンを「${emoji}」に設定しました`, 'success');
}

function clearCharIcon(slotIndex) {
    if (!currentTimeline.characters[slotIndex]) return;
    currentTimeline.characters[slotIndex].iconType = 'none';
    currentTimeline.characters[slotIndex].iconEmoji = '';
    currentTimeline.characters[slotIndex].iconUrl = '';
    renderHeaderInfo();
    saveCurrentTimeline();
    showToast('アイコンを画像なし（初期シルエット）に戻しました', 'success');
}

// --- タイムラインプレビューの描画 ---
function renderTimelinePreview() {
    const container = document.getElementById('timelineContainer');
    container.innerHTML = '';

    if (currentTimeline.episodes.length === 0) {
        container.innerHTML = `
            <div class="py-16 text-center text-stone-500">
                <i data-lucide="feather" class="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-500"></i>
                <p class="text-sm font-header text-amber-600/70">まだエピソードが記録されていません</p>
                <p class="text-xs text-stone-600 mt-1">「エピソードを追加」ボタンから最初の出会いを刻録してください</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const charA = currentTimeline.characters[0] || { name: '探索者 A', color: '#d97706' };
    const charB = currentTimeline.characters[1] || { name: '探索者 B', color: '#3b82f6' };

    currentTimeline.episodes.forEach((ep, index) => {
        const isLeft = index % 2 === 0;
        const cat = EVENT_CATEGORIES[ep.category] || EVENT_CATEGORIES.encounter;
        
        const card = document.createElement('div');
        card.className = `timeline-item relative flex flex-col md:flex-row items-center gap-6 mb-12 ${isLeft ? 'md:flex-row-reverse' : ''}`;

        // 中央のマーカーノード
        const nodeHtml = `
            <div class="timeline-node shrink-0 z-20 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-transform hover:scale-110"
                 style="background: #14100c; border-color: ${cat.color}; color: ${cat.color};">
                <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
            </div>
        `;

        // 挿絵画像
        const imageHtml = ep.imageUrl ? `
            <div class="w-full mt-3 rounded-lg overflow-hidden border border-amber-950/40">
                <img src="${ep.imageUrl}" class="w-full max-h-48 object-cover">
            </div>
        ` : '';

        // セリフ抜粋
        const quoteHtml = ep.quote ? `
            <div class="mt-3 p-2.5 rounded-lg bg-[#0c0a09]/80 border-l-2 border-amber-500 text-xs italic text-amber-200/90 font-serif leading-relaxed">
                ${escapeHtml(ep.quote)}
            </div>
        ` : '';

        // 関係性バッジ
        const relationBadge = ep.relation ? `
            <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border"
                  style="background: ${cat.bg}; border-color: ${cat.color}40; color: ${cat.color};">
                <i data-lucide="${cat.icon}" class="w-3 h-3"></i> ${escapeHtml(ep.relation)}
            </span>
        ` : '';

        // 感情メーター
        const sentA = ep.sentimentA ?? 50;
        const sentB = ep.sentimentB ?? 50;
        const sentimentHtml = `
            <div class="mt-3 pt-2.5 border-t border-amber-950/40 flex items-center justify-between text-[11px] text-stone-400 gap-4">
                <div class="flex items-center gap-1.5 flex-1 min-w-0">
                    <span class="truncate max-w-[85px] font-bold leading-normal pb-0.5 inline-block" style="color: ${charA.color};">${escapeHtml(charA.name || '探索者 A')}</span>
                    <div class="flex-1 bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${sentA}%; background: ${charA.color};"></div>
                    </div>
                    <span class="text-[10px] font-mono shrink-0">${sentA}%</span>
                </div>
                <div class="flex items-center gap-1.5 flex-1 min-w-0">
                    <span class="truncate max-w-[85px] font-bold leading-normal pb-0.5 inline-block" style="color: ${charB.color};">${escapeHtml(charB.name || '探索者 B')}</span>
                    <div class="flex-1 bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                        <div class="h-full rounded-full transition-all duration-500" style="width: ${sentB}%; background: ${charB.color};"></div>
                    </div>
                    <span class="text-[10px] font-mono shrink-0">${sentB}%</span>
                </div>
            </div>
        `;

        // カード本体
        const contentHtml = `
            <div class="timeline-content w-full md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-[#14100c]/90 border border-amber-950/60 shadow-xl backdrop-blur relative magic-border group hover:border-amber-700/60 transition-all">
                <div class="flex items-center justify-between gap-2 mb-1.5">
                    <span class="text-[11px] font-header tracking-wider text-amber-500 font-bold">${escapeHtml(ep.period || '時期未定')}</span>
                    ${ep.date ? `<span class="text-[10px] font-mono text-stone-500">${escapeHtml(ep.date)}</span>` : ''}
                </div>

                <h3 class="text-base font-bold text-stone-100 mb-2 leading-snug group-hover:text-amber-200 transition-colors">
                    ${escapeHtml(ep.title || '無題のエピソード')}
                </h3>

                <div class="mb-2">
                    ${relationBadge}
                </div>

                <p class="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">
                    ${escapeHtml(ep.content || '')}
                </p>

                ${quoteHtml}
                ${imageHtml}
                ${sentimentHtml}
            </div>
        `;

        // 左右配置のダミー空白（PCレイアウトのバランス用）
        const spacerHtml = `<div class="hidden md:block w-[calc(50%-2.5rem)]"></div>`;

        if (isLeft) {
            card.innerHTML = `${contentHtml} ${nodeHtml} ${spacerHtml}`;
        } else {
            card.innerHTML = `${spacerHtml} ${nodeHtml} ${contentHtml}`;
        }

        container.appendChild(card);
    });

    lucide.createIcons();
}

// --- 左側エピソード編集リストの描画 ---
function renderEpisodeEditorList() {
    const list = document.getElementById('editorEpisodeList');
    list.innerHTML = '';

    currentTimeline.episodes.forEach((ep, index) => {
        const cat = EVENT_CATEGORIES[ep.category] || EVENT_CATEGORIES.encounter;
        const item = document.createElement('div');
        item.className = 'p-3.5 rounded-xl bg-stone-900/80 border border-amber-950/60 mb-2.5 relative group hover:border-amber-700/60 transition-all cursor-move';
        item.dataset.id = ep.id;

        item.innerHTML = `
            <div class="flex items-center justify-between gap-2 mb-2">
                <div class="flex items-center gap-2">
                    <span class="drag-handle text-stone-600 group-hover:text-amber-500 cursor-grab"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-500 font-bold">#${index + 1}</span>
                    <span class="text-xs font-bold text-stone-200 truncate max-w-[150px]">${escapeHtml(ep.title || '無題')}</span>
                </div>
                <div class="flex items-center gap-1">
                    <button onclick="editEpisode('${ep.id}')" class="p-1 rounded text-stone-400 hover:text-amber-400 hover:bg-stone-800" title="編集">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="duplicateEpisode('${ep.id}')" class="p-1 rounded text-stone-400 hover:text-blue-400 hover:bg-stone-800" title="複製">
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteEpisode('${ep.id}')" class="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800" title="削除">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-2 text-[10px] text-stone-500">
                <span class="truncate">${escapeHtml(ep.period || '時期未設定')}</span>
                <span>•</span>
                <span style="color: ${cat.color};">${cat.label}</span>
            </div>
        `;

        list.appendChild(item);
    });

    lucide.createIcons();
}

// --- 並び替え（Sortable.js）のセットアップ ---
function setupSortable() {
    const el = document.getElementById('editorEpisodeList');
    if (!el) return;
    sortableInstance = new Sortable(el, {
        handle: '.drag-handle',
        animation: 200,
        ghostClass: 'opacity-40',
        onEnd: () => {
            const newOrder = Array.from(el.children).map(child => child.dataset.id);
            currentTimeline.episodes.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
            renderTimelinePreview();
            updateChart();
            saveCurrentTimeline();
        }
    });
}

// --- エピソードの新規作成・編集モーダル ---
let activeEditingEpisodeId = null;

function openEpisodeModal(epId = null) {
    activeEditingEpisodeId = epId;
    const modal = document.getElementById('episodeEditModal');
    const modalTitle = document.getElementById('episodeModalTitle');

    const charA = currentTimeline.characters[0] || { name: '探索者 A' };
    const charB = currentTimeline.characters[1] || { name: '探索者 B' };
    document.getElementById('modalCharALabel').textContent = charA.name || '探索者 A';
    document.getElementById('modalCharBLabel').textContent = charB.name || '探索者 B';

    let ep;
    if (epId) {
        modalTitle.textContent = 'エピソードの刻録を編集';
        ep = currentTimeline.episodes.find(e => e.id === epId);
    } else {
        modalTitle.textContent = '新たなエピソードを刻録';
        ep = {
            id: 'ep_' + Date.now(),
            period: '',
            title: '',
            date: '',
            category: 'encounter',
            relation: '',
            sentimentA: 50,
            sentimentB: 50,
            content: '',
            quote: '',
            imageUrl: ''
        };
    }

    document.getElementById('epPeriodInput').value = ep.period || '';
    document.getElementById('epTitleInput').value = ep.title || '';
    document.getElementById('epDateInput').value = ep.date || '';
    document.getElementById('epCategoryInput').value = ep.category || 'encounter';
    document.getElementById('epRelationInput').value = ep.relation || '';
    document.getElementById('epSentimentAInput').value = ep.sentimentA || 50;
    document.getElementById('epSentimentAVal').textContent = `${ep.sentimentA || 50}%`;
    document.getElementById('epSentimentBInput').value = ep.sentimentB || 50;
    document.getElementById('epSentimentBVal').textContent = `${ep.sentimentB || 50}%`;
    document.getElementById('epContentInput').value = ep.content || '';
    document.getElementById('epQuoteInput').value = ep.quote || '';
    document.getElementById('epImageUrlInput').value = ep.imageUrl || '';

    modal.classList.remove('hidden');
}

function closeEpisodeModal() {
    document.getElementById('episodeEditModal').classList.add('hidden');
    activeEditingEpisodeId = null;
}

function saveEpisodeFromModal() {
    const period = document.getElementById('epPeriodInput').value.trim();
    const title = document.getElementById('epTitleInput').value.trim();
    if (!title) {
        showToast('タイトルを入力してください', 'error');
        return;
    }

    const newEp = {
        id: activeEditingEpisodeId || ('ep_' + Date.now()),
        period: period,
        title: title,
        date: document.getElementById('epDateInput').value.trim(),
        category: document.getElementById('epCategoryInput').value,
        relation: document.getElementById('epRelationInput').value.trim(),
        sentimentA: parseInt(document.getElementById('epSentimentAInput').value, 10),
        sentimentB: parseInt(document.getElementById('epSentimentBInput').value, 10),
        content: document.getElementById('epContentInput').value.trim(),
        quote: document.getElementById('epQuoteInput').value.trim(),
        imageUrl: document.getElementById('epImageUrlInput').value.trim()
    };

    if (activeEditingEpisodeId) {
        const idx = currentTimeline.episodes.findIndex(e => e.id === activeEditingEpisodeId);
        if (idx >= 0) currentTimeline.episodes[idx] = newEp;
    } else {
        currentTimeline.episodes.push(newEp);
    }

    closeEpisodeModal();
    renderAll();
    saveCurrentTimeline();
    showToast('エピソードを刻録しました', 'success');
}

function editEpisode(id) {
    openEpisodeModal(id);
}

function duplicateEpisode(id) {
    const target = currentTimeline.episodes.find(e => e.id === id);
    if (!target) return;
    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = 'ep_' + Date.now();
    cloned.title = cloned.title + ' (写し)';
    const idx = currentTimeline.episodes.findIndex(e => e.id === id);
    currentTimeline.episodes.splice(idx + 1, 0, cloned);
    renderAll();
    saveCurrentTimeline();
    showToast('エピソードを複製しました', 'success');
}

function deleteEpisode(id) {
    showConfirm('このエピソードを年表から抹消しますか？', () => {
        currentTimeline.episodes = currentTimeline.episodes.filter(e => e.id !== id);
        renderAll();
        saveCurrentTimeline();
        showToast('エピソードを削除しました', 'success');
    }, '抹消する', 'キャンセル');
}

// --- 感情推移グラフ（Chart.js） ---
function initChart() {
    const ctx = document.getElementById('sentimentChartCanvas');
    if (!ctx) return;

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '探索者 A',
                    data: [],
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#d97706',
                    pointRadius: 4
                },
                {
                    label: '探索者 B',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(217, 119, 6, 0.1)'
                    },
                    ticks: {
                        color: '#78716c',
                        font: { family: 'Cinzel, sans-serif', size: 10 },
                        callback: v => v + '%'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a8a29e',
                        font: { size: 10 }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e7e5e4',
                        font: { family: 'M PLUS Rounded 1c, sans-serif', size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: '#14100c',
                    borderColor: '#78350f',
                    borderWidth: 1,
                    titleColor: '#fbbf24',
                    bodyColor: '#e7e5e4'
                }
            }
        }
    });
}

function updateChart() {
    if (!chartInstance) return;

    const charA = currentTimeline.characters[0] || { name: '探索者 A', color: '#d97706' };
    const charB = currentTimeline.characters[1] || { name: '探索者 B', color: '#3b82f6' };

    const labels = currentTimeline.episodes.map(e => e.period || e.title || '無題');
    const dataA = currentTimeline.episodes.map(e => e.sentimentA ?? 50);
    const dataB = currentTimeline.episodes.map(e => e.sentimentB ?? 50);

    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].label = charA.name || '探索者 A';
    chartInstance.data.datasets[0].borderColor = charA.color;
    chartInstance.data.datasets[0].pointBackgroundColor = charA.color;
    chartInstance.data.datasets[0].backgroundColor = charA.color + '20';
    chartInstance.data.datasets[0].data = dataA;

    chartInstance.data.datasets[1].label = charB.name || '探索者 B';
    chartInstance.data.datasets[1].borderColor = charB.color;
    chartInstance.data.datasets[1].pointBackgroundColor = charB.color;
    chartInstance.data.datasets[1].backgroundColor = charB.color + '20';
    chartInstance.data.datasets[1].data = dataB;

    chartInstance.update();
}

function toggleChartDisplay() {
    const wrapper = document.getElementById('chartWrapper');
    wrapper.classList.toggle('hidden');
}

// --- 確認モーダル（魔導書の問いかけ） ---
let confirmCallback = null;

function showConfirm(message, onConfirm, okText = '実行する', cancelText = 'キャンセル') {
    const modal = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');

    if (msgEl) msgEl.textContent = message;
    if (okBtn) okBtn.textContent = okText;
    if (cancelBtn) cancelBtn.textContent = cancelText;

    confirmCallback = onConfirm;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function closeConfirmModal(isOk = false) {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    if (isOk && typeof confirmCallback === 'function') {
        confirmCallback();
    }
    confirmCallback = null;
}

// --- 年表の新規作成・切替マネージャー ---
function createNewTimeline(skipConfirm = false) {
    const execute = () => {
        currentTimeline = {
            id: 'timeline_' + Date.now(),
            title: '',
            subtitle: '',
            characters: [
                { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#d97706', initialSentiment: 50 },
                { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#3b82f6', initialSentiment: 50 }
            ],
            episodes: []
        };
        saveCurrentTimeline();
        closeTimelineListModal(); // 書架モーダルが開いていれば閉じる
        renderAll();

        // タイトル入力欄にフォーカスを当ててすぐ入力できるようにする
        const titleInput = document.getElementById('timelineTitleInput');
        if (titleInput) {
            setTimeout(() => titleInput.focus(), 100);
        }
        showToast('まっさらな新しい年表を作成しました', 'success');
    };

    if (skipConfirm) {
        execute();
    } else {
        showConfirm('新しい年表を作成しますか？\n（現在の年表内容は書架に自動保存されています）', execute, '新規作成', 'キャンセル');
    }
}

function openTimelineListModal() {
    const modal = document.getElementById('timelineListModal');
    const container = document.getElementById('timelineItemsList');
    container.innerHTML = '';

    if (allTimelines.length === 0) {
        container.innerHTML = '<div class="text-xs text-stone-500 text-center py-6">保存された年表はありません</div>';
    } else {
        allTimelines.forEach(t => {
            const item = document.createElement('div');
            const isActive = t.id === currentTimeline.id;
            item.className = `p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${isActive ? 'bg-amber-950/40 border-amber-600' : 'bg-stone-900/60 border-amber-950/40 hover:border-amber-700'}`;
            
            const charAName = t.characters?.[0]?.name || '探索者 A';
            const charBName = t.characters?.[1]?.name || '探索者 B';
            const charNames = `${charAName} × ${charBName}`;
            const displayTitle = t.title || '（無題のクロニクル）';

            item.innerHTML = `
                <div class="overflow-hidden flex-1" onclick="switchTimeline('${t.id}')">
                    <div class="text-xs font-bold ${isActive ? 'text-amber-300' : 'text-stone-200'} truncate">${escapeHtml(displayTitle)}</div>
                    <div class="text-[10px] text-stone-500 truncate">${escapeHtml(charNames)} (${(t.episodes || []).length}件)</div>
                </div>
                <div class="flex items-center gap-1">
                    ${!isActive ? `<button onclick="deleteTimeline('${t.id}'); event.stopPropagation();" class="p-1 text-stone-500 hover:text-rose-400" title="削除"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>` : '<span class="text-[9px] bg-amber-600/30 text-amber-300 border border-amber-600/50 px-1.5 py-0.5 rounded font-mono">編集中</span>'}
                </div>
            `;
            container.appendChild(item);
        });
    }

    lucide.createIcons();
    modal.classList.remove('hidden');
}

function closeTimelineListModal() {
    document.getElementById('timelineListModal').classList.add('hidden');
}

function switchTimeline(id) {
    const target = allTimelines.find(t => t.id === id);
    if (!target) return;
    currentTimeline = JSON.parse(JSON.stringify(target));
    localStorage.setItem(STORAGE_KEYS.CURRENT_ID, id);
    closeTimelineListModal();
    renderAll();
    showToast(`年表「${currentTimeline.title || '無題'}」を開きました`, 'success');
}

function deleteTimeline(id) {
    showConfirm('この年表を書架から完全に抹消しますか？', () => {
        allTimelines = allTimelines.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(allTimelines));

        // もし現在編集中だった年表が削除された場合、残りの年表か新規のまっさらな年表に切り替える
        if (currentTimeline.id === id) {
            if (allTimelines.length > 0) {
                currentTimeline = JSON.parse(JSON.stringify(allTimelines[0]));
            } else {
                // 全て削除された場合はまっさらな年表を作成
                currentTimeline = {
                    id: 'timeline_' + Date.now(),
                    title: '',
                    subtitle: '',
                    characters: [
                        { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#d97706', initialSentiment: 50 },
                        { name: '', role: '', iconUrl: '', iconEmoji: '', iconType: 'none', color: '#3b82f6', initialSentiment: 50 }
                    ],
                    episodes: []
                };
                allTimelines.push(JSON.parse(JSON.stringify(currentTimeline)));
                localStorage.setItem(STORAGE_KEYS.TIMELINES, JSON.stringify(allTimelines));
            }
            localStorage.setItem(STORAGE_KEYS.CURRENT_ID, currentTimeline.id);
            renderAll();
        }

        // 書架一覧を即時再描画
        openTimelineListModal();
        showToast('年表を削除しました', 'success');
    }, '抹消する', 'キャンセル');
}

// --- JSON エクスポート / インポート ---
function exportTimelineJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentTimeline, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    const safeTitle = (currentTimeline.title || 'chronicle').replace(/[\\/:*?"<>|]/g, '_');
    downloadAnchor.setAttribute("download", `${safeTitle}_timeline.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('写本（JSON）を出力しました', 'success');
}

function triggerJsonImport() {
    document.getElementById('importTimelineInput').click();
}

function importTimelineJson(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!imported.episodes || !imported.characters) {
                throw new Error('形式が年表データと一致しません');
            }
            imported.id = 'imported_' + Date.now();
            currentTimeline = imported;
            saveCurrentTimeline();
            renderAll();
            showToast('写本を正常に読み込みました', 'success');
        } catch (err) {
            showToast('読み込み失敗: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// --- 画像エクスポート（html2canvas） ---
async function exportTimelineImage() {
    const target = document.getElementById('captureTarget');
    if (!target) return;

    showToast('画像を生成中……少々お待ちください', 'success');

    try {
        // html2canvas の実行
        const canvas = await html2canvas(target, {
            scale: 2, // 高解像度
            backgroundColor: '#0e0b08',
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0
        });

        const link = document.createElement('a');
        const safeTitle = (currentTimeline.title || 'chronicle').replace(/[\\/:*?"<>|]/g, '_');
        link.download = `${safeTitle}_年表.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('画像を出力しました！', 'success');
    } catch (e) {
        console.error('画像生成エラー:', e);
        showToast('画像の生成に失敗しました: ' + e.message, 'error');
    }
}

// --- Markdown/テキストコピー ---
function copyTimelineMarkdown() {
    let md = `# ${currentTimeline.title || '無題のクロニクル'}\n`;
    if (currentTimeline.subtitle) md += `> ${currentTimeline.subtitle}\n\n`;

    const charA = currentTimeline.characters[0] || { name: '探索者 A' };
    const charB = currentTimeline.characters[1] || { name: '探索者 B' };
    const charAName = charA.name || '探索者 A';
    const charBName = charB.name || '探索者 B';
    md += `**登場人物**: ${charAName} × ${charBName}\n\n---\n\n`;

    currentTimeline.episodes.forEach((ep, i) => {
        const sentA = ep.sentimentA ?? 50;
        const sentB = ep.sentimentB ?? 50;
        md += `### ${i + 1}. 【${ep.period || '時期未定'}】${ep.title || '無題'}\n`;
        if (ep.date) md += `- **年代/日付**: ${ep.date}\n`;
        if (ep.relation) md += `- **関係性**: ${ep.relation}\n`;
        md += `- **感情パラメータ**: ${charAName}: ${sentA}% / ${charBName}: ${sentB}%\n\n`;
        if (ep.content) md += `${ep.content}\n\n`;
        if (ep.quote) md += `> ${ep.quote}\n\n`;
        md += `---\n\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
        showToast('Markdownテキストをクリップボードにコピーしました', 'success');
    }).catch(err => {
        showToast('コピーに失敗しました', 'error');
    });
}

// --- デザインテーマの切り替え ---
function setTheme(themeName) {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-stellar', 'theme-parchment');
    body.classList.add(`theme-${themeName}`);
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
    showToast(`テーマ「${themeName}」を適用しました`, 'success');
}

function loadTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    setTheme(saved);
}

// --- トースト通知 ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');

    msgEl.textContent = message;
    if (type === 'success') {
        iconEl.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i>';
    } else if (type === 'error') {
        iconEl.innerHTML = '<i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>';
    }
    lucide.createIcons();

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
    }, 3200);
}

// --- ユーティリティ ---
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- モーダルの背景クリックおよびEscキー操作 ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEpisodeModal();
        closeCharSelectModal();
        closeTimelineListModal();
        closeEmojiModal();
        closeConfirmModal(false);
    }
});

['episodeEditModal', 'charSelectModal', 'timelineListModal', 'emojiSelectModal', 'confirmModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (id === 'confirmModal') {
                    closeConfirmModal(false);
                } else {
                    modal.classList.add('hidden');
                }
            }
        });
    }
});
