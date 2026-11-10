/**
 * QuickPrompt SidePanel - Main Logic
 */

// プリセットプロンプト定義
const DEFAULT_PRESETS = [
  {
    id: "preset-writing-1",
    title: "文章の校正と自然な表現へのブラッシュアップ",
    category: "writing",
    tags: ["校正", "推敲", "文章改善"],
    content: "以下の文章を、意味やニュアンスを保ちつつ、より自然で読みやすく知的な日本語に推敲・校正してください。\n改善のポイント（どこをどう直したか）も箇条書きで添えてください。\n\n【対象文章】\n{{推敲したい文章}}",
    favorite: true,
    updatedAt: Date.now()
  },
  {
    id: "preset-writing-2",
    title: "箇条書きでの要約と重要ポイント抽出",
    category: "writing",
    tags: ["要約", "要点", "箇条書き"],
    content: "以下の内容を読み込み、多忙な人でも1分で理解できるように、重要なポイントを3〜5個の箇条書きで簡潔に要約してください。\n最後に「一言結論（まとめ）」も添えてください。\n\n【対象テキスト】\n{{要約したいテキスト}}",
    favorite: true,
    updatedAt: Date.now()
  },
  {
    id: "preset-writing-3",
    title: "丁寧なビジネスメールの文面作成",
    category: "writing",
    tags: ["メール", "ビジネス", "敬語"],
    content: "以下の条件に基づいて、相手に失礼のない丁寧でスマートなビジネスメール（件名と本文）を作成してください。\n\n【宛先】{{宛先・取引先名}}\n【件名・用件】{{用件}}\n【伝えたい詳細】{{詳細や条件}}\n【希望する返信期限やアクション】{{アクション}}",
    favorite: false,
    updatedAt: Date.now()
  },
  {
    id: "preset-idea-1",
    title: "多角的なブレインストーミング（10の斬新な切り口）",
    category: "idea",
    tags: ["アイデア", "企画", "発想"],
    content: "以下のテーマについて、常識にとらわれない斬新で魅力的なアイデア・切り口を10個提案してください。\nそれぞれのアイデアに対して、「特徴」「ターゲット」「想定されるメリット」を短く添えてください。\n\n【テーマ】\n{{テーマ・企画内容}}",
    favorite: true,
    updatedAt: Date.now()
  },
  {
    id: "preset-idea-2",
    title: "企画の壁打ち・多角的な改善フィードバック",
    category: "idea",
    tags: ["壁打ち", "レビュー", "改善点"],
    content: "私は以下の企画・アイデアを考えています。客観的なメンター・コンサルタントの視点で、以下の3点から率直にフィードバックしてください。\n\n1. 魅力的な点・強み\n2. 懸念される課題やリスク・弱点\n3. さらに面白く・強力にするための具体的改善アイデア\n\n【企画内容】\n{{企画の概要}}",
    favorite: false,
    updatedAt: Date.now()
  },
  {
    id: "preset-image-1",
    title: "Midjourney/画像生成用プロンプト詳細化 (英語)",
    category: "image",
    tags: ["画像生成", "Midjourney", "英語"],
    content: "以下の日本語のイメージを、高品質なAI画像生成（Midjourney / Stable Diffusion等）用の英語プロンプトに変換してください。\n被写体の詳細、構図、照明、色彩、アートスタイル、カメラアングル、質感などを具体的に補完し、カンマ区切りの洗練された英語タグ形式で出力してください。\n\n【描きたいイメージ】\n{{日本語のイメージ説明}}",
    favorite: true,
    updatedAt: Date.now()
  },
  {
    id: "preset-image-2",
    title: "LINEスタンプ用キャラクターのポーズ・表情アイデア",
    category: "image",
    tags: ["LINEスタンプ", "キャラクター", "ポーズ"],
    content: "以下のキャラクターを活かした、日常使いしやすく使い勝手の良いLINEスタンプの「ポーズ」「表情」「セリフ（文字）」の組み合わせアイデアを10個提案してください。\n感情豊かで、スタンプの絵柄が想像しやすいように描写してください。\n\n【キャラクター設定】\n{{キャラクターの名前や特徴・性格}}",
    favorite: false,
    updatedAt: Date.now()
  },
  {
    id: "preset-code-1",
    title: "コードの解説とリファクタリング・改善提案",
    category: "code",
    tags: ["コード", "リファクタリング", "解説"],
    content: "以下のコードを解析し、次の点について分かりやすく解説してください。\n\n1. このコードが何をしているかの簡潔な説明\n2. 可読性・パフォーマンス・保守性の観点からの改善点\n3. リファクタリング後のクリーンな完成コード例\n\n【コード】\n```\n{{コード}}\n```",
    favorite: true,
    updatedAt: Date.now()
  },
  {
    id: "preset-code-2",
    title: "エラー原因の特定と具体的な解決手順",
    category: "code",
    tags: ["エラー", "デバッグ", "解決策"],
    content: "以下のエラーが発生しました。エラーの原因と、それを解消するための具体的な修正コードまたは手順をステップ形式で教えてください。\n\n【エラーメッセージ/ログ】\n{{エラー内容}}\n\n【発生箇所のコード・環境】\n{{関連コードや環境情報}}",
    favorite: false,
    updatedAt: Date.now()
  }
];

// アプリ状態
let promptsState = [];
let currentCategory = "all";
let currentSearchQuery = "";
let currentTabInfo = null;

// DOM要素
const promptListEl = document.getElementById("prompt-list");
const emptyStateEl = document.getElementById("empty-state");
const searchInputEl = document.getElementById("search-input");
const searchClearBtn = document.getElementById("search-clear-btn");
const categoryTabsEl = document.getElementById("category-tabs");
const promptCountInfoEl = document.getElementById("prompt-count-info");
const targetPageNameEl = document.getElementById("target-page-name");

// モーダル要素
const promptModal = document.getElementById("prompt-modal");
const promptForm = document.getElementById("prompt-form");
const editPromptIdEl = document.getElementById("edit-prompt-id");
const formTitleEl = document.getElementById("form-title");
const formCategoryEl = document.getElementById("form-category");
const formTagsEl = document.getElementById("form-tags");
const formContentEl = document.getElementById("form-content");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelPrompt = document.getElementById("btn-cancel-prompt");
const btnAddPrompt = document.getElementById("btn-add-prompt");
const btnEmptyAdd = document.getElementById("btn-empty-add");

// 変数入力モーダル
const variableModal = document.getElementById("variable-modal");
const variableInputsContainer = document.getElementById("variable-inputs-container");
const variablePreviewText = document.getElementById("variable-preview-text");
const btnCloseVarModal = document.getElementById("btn-close-variable-modal");
const btnCancelVar = document.getElementById("btn-cancel-variable");
const btnVarCopy = document.getElementById("btn-variable-copy");
const btnVarInsert = document.getElementById("btn-variable-insert");
const btnVarInsertSend = document.getElementById("btn-variable-insert-send");
let activeVariablePrompt = null;

// 設定モーダル
const settingsModal = document.getElementById("settings-modal");
const btnOpenSettings = document.getElementById("btn-open-settings");
const btnCloseSettings = document.getElementById("btn-close-settings");
const btnCloseSettingsFooter = document.getElementById("btn-close-settings-footer");
const btnExportJson = document.getElementById("btn-export-json");
const importFileInput = document.getElementById("import-file-input");
const btnResetPresets = document.getElementById("btn-reset-presets");

// 削除確認モーダル（Vivaldi / 全ブラウザ対応）
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const deleteConfirmText = document.getElementById("delete-confirm-text");
const btnCloseDeleteModal = document.getElementById("btn-close-delete-modal");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");
let promptToDelete = null;

// トースト通知
const toastEl = document.getElementById("toast");
let toastTimeout = null;

function showToast(message, duration = 2200) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.style.display = "block";
  toastTimeout = setTimeout(() => {
    toastEl.style.display = "none";
  }, duration);
}

// ----------------------------------------------------
// 初期化 & データ読み込み
// ----------------------------------------------------
async function initApp() {
  await loadPrompts();
  setupEventListeners();
  updateActiveTabInfo();

  // タブが切り替わったときの追跡
  if (chrome.tabs && chrome.tabs.onActivated) {
    chrome.tabs.onActivated.addListener(updateActiveTabInfo);
  }
  if (chrome.tabs && chrome.tabs.onUpdated) {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.status === "complete") {
        updateActiveTabInfo();
      }
    });
  }
}

async function loadPrompts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["quick_prompts"], (result) => {
      if (result.quick_prompts && Array.isArray(result.quick_prompts) && result.quick_prompts.length > 0) {
        promptsState = result.quick_prompts;
      } else {
        // 初回ロード時はプリセットを登録
        promptsState = [...DEFAULT_PRESETS];
        chrome.storage.local.set({ quick_prompts: promptsState });
      }
      renderPrompts();
      resolve();
    });
  });
}

function savePromptsToStorage() {
  chrome.storage.local.set({ quick_prompts: promptsState }, () => {
    renderPrompts();
  });
}

// ----------------------------------------------------
// アクティブタブ検出
// ----------------------------------------------------
async function updateActiveTabInfo() {
  try {
    const tab = await getTargetTab();
    if (tab) {
      currentTabInfo = tab;
      const title = currentTabInfo.title || "";
      const url = currentTabInfo.url || "";
      
      let siteName = "Webページ";
      if (url.includes("chatgpt.com") || url.includes("chat.openai.com")) siteName = "ChatGPT";
      else if (url.includes("claude.ai")) siteName = "Claude";
      else if (url.includes("gemini.google.com")) siteName = "Google Gemini";
      else if (url.includes("copilot.microsoft.com")) siteName = "Copilot";
      else if (url.includes("perplexity.ai")) siteName = "Perplexity";
      else {
        try {
          const host = new URL(url).hostname;
          siteName = host.replace(/^www\./, "");
        } catch (e) {
          siteName = title.slice(0, 20) || "現在のタブ";
        }
      }
      targetPageNameEl.textContent = `接続中: ${siteName}`;
      targetPageNameEl.title = `${title} (${url})`;
    } else {
      targetPageNameEl.textContent = "タブ未検出";
    }
  } catch (err) {
    targetPageNameEl.textContent = "アクティブタブ検出中";
  }
}

// ----------------------------------------------------
// プロンプト一覧レンダリング
// ----------------------------------------------------
function renderPrompts() {
  const query = currentSearchQuery.trim().toLowerCase();
  
  // フィルタリング
  let filtered = promptsState.filter(p => {
    // カテゴリフィルタ
    if (currentCategory === "favorite") {
      if (!p.favorite) return false;
    } else if (currentCategory !== "all") {
      if (p.category !== currentCategory) return false;
    }

    // 検索フィルタ
    if (query) {
      const matchTitle = (p.title || "").toLowerCase().includes(query);
      const matchContent = (p.content || "").toLowerCase().includes(query);
      const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(query));
      return matchTitle || matchContent || matchTags;
    }

    return true;
  });

  // お気に入りを上部にソート、そのあと更新日時降順
  filtered.sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1;
    }
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  promptCountInfoEl.textContent = `${filtered.length} 件`;

  if (filtered.length === 0) {
    promptListEl.innerHTML = "";
    emptyStateEl.style.display = "block";
    return;
  }

  emptyStateEl.style.display = "none";

  const categoryNames = {
    writing: "✍️ 文章・推敲",
    idea: "💡 アイデア",
    image: "🎨 画像生成",
    code: "💻 コード",
    other: "📁 その他"
  };

  promptListEl.innerHTML = filtered.map(prompt => {
    const isFav = !!prompt.favorite;
    const catLabel = categoryNames[prompt.category] || "📁 その他";
    const tagsHtml = (prompt.tags || []).map(t => `<span class="card-tag">#${escapeHtml(t)}</span>`).join("");
    
    // 変数プレースホルダーをハイライト
    const escapedContent = escapeHtml(prompt.content || "");
    const formattedContent = escapedContent.replace(/\{\{([^}]+)\}\}/g, '<code>{{$1}}</code>');

    const hasVariables = /\{\{([^}]+)\}\}/.test(prompt.content || "");

    return `
      <div class="prompt-card ${isFav ? 'is-favorite' : ''}" data-id="${prompt.id}">
        <div class="card-top">
          <div class="card-title-group">
            <span class="card-title" title="${escapeHtml(prompt.title)}">${escapeHtml(prompt.title)}</span>
            <span class="card-category-badge">${catLabel}</span>
          </div>
          <div class="card-top-actions">
            <button class="star-btn ${isFav ? 'active' : ''}" data-action="toggle-fav" title="${isFav ? 'お気に入り解除' : 'お気に入り登録'}">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
        </div>

        <div class="card-body-preview" data-action="toggle-expand" title="クリックで全文を表示/折りたたみ">
          ${formattedContent}
        </div>

        ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}

        <div class="card-actions">
          <div class="action-main-btns">
            <button class="btn-insert" data-action="insert" title="アクティブなタブの入力欄に挿入">
              挿入
            </button>
            <button class="btn-send" data-action="send" title="入力欄に挿入して即送信">
              挿入&送信
            </button>
            <button class="btn-copy" data-action="copy" title="クリップボードにコピー">
              コピー
            </button>
          </div>
          <div class="card-menu-btns">
            <button class="card-icon-action" data-action="edit" title="編集">✏️</button>
            <button class="card-icon-action delete" data-action="delete" title="削除">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ----------------------------------------------------
// イベントリスナー
// ----------------------------------------------------
function setupEventListeners() {
  // 検索
  searchInputEl.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    searchClearBtn.style.display = currentSearchQuery ? "block" : "none";
    renderPrompts();
  });

  searchClearBtn.addEventListener("click", () => {
    searchInputEl.value = "";
    currentSearchQuery = "";
    searchClearBtn.style.display = "none";
    searchInputEl.focus();
    renderPrompts();
  });

  // カテゴリタブ切り替え
  categoryTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".cat-tab");
    if (!tab) return;
    
    categoryTabsEl.querySelectorAll(".cat-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    renderPrompts();
  });

  // カード内クリック委任
  promptListEl.addEventListener("click", handleCardClick);

  // 新規追加ボタン
  btnAddPrompt.addEventListener("click", () => openPromptModal());
  btnEmptyAdd.addEventListener("click", () => openPromptModal());

  // モーダル閉じる
  btnCloseModal.addEventListener("click", closePromptModal);
  btnCancelPrompt.addEventListener("click", closePromptModal);

  // プロンプト保存
  promptForm.addEventListener("submit", handlePromptFormSubmit);

  // 変数モーダル操作
  btnCloseVarModal.addEventListener("click", closeVariableModal);
  btnCancelVar.addEventListener("click", closeVariableModal);
  btnVarCopy.addEventListener("click", () => {
    const text = getFinalVariableReplacedText();
    copyToClipboard(text);
    closeVariableModal();
  });
  btnVarInsert.addEventListener("click", () => {
    const text = getFinalVariableReplacedText();
    executeInsertText(text, false);
    closeVariableModal();
  });
  btnVarInsertSend.addEventListener("click", () => {
    const text = getFinalVariableReplacedText();
    executeInsertText(text, true);
    closeVariableModal();
  });

  // 設定モーダル
  btnOpenSettings.addEventListener("click", () => settingsModal.style.display = "flex");
  btnCloseSettings.addEventListener("click", () => settingsModal.style.display = "none");
  btnCloseSettingsFooter.addEventListener("click", () => settingsModal.style.display = "none");

  // 削除確認モーダル（Vivaldi / 全ブラウザ対応）
  btnCloseDeleteModal.addEventListener("click", closeDeleteModal);
  btnCancelDelete.addEventListener("click", closeDeleteModal);
  btnConfirmDelete.addEventListener("click", () => {
    if (promptToDelete) {
      const deletedTitle = promptToDelete.title;
      promptsState = promptsState.filter(p => p.id !== promptToDelete.id);
      savePromptsToStorage();
      showToast(`🗑️ 「${deletedTitle}」を削除しました`);
      closeDeleteModal();
    }
  });

  // エクスポート / インポート / プリセット復元
  btnExportJson.addEventListener("click", exportPromptsToJson);
  importFileInput.addEventListener("change", importPromptsFromJson);
  btnResetPresets.addEventListener("click", resetToDefaultPresets);
}

function openDeleteModal(prompt) {
  promptToDelete = prompt;
  deleteConfirmText.textContent = `「${prompt.title}」を削除してもよろしいですか？`;
  deleteConfirmModal.style.display = "flex";
}

function closeDeleteModal() {
  deleteConfirmModal.style.display = "none";
  promptToDelete = null;
}

// ----------------------------------------------------
// カード操作ハンドラ
// ----------------------------------------------------
function handleCardClick(e) {
  const card = e.target.closest(".prompt-card");
  if (!card) return;
  const id = card.dataset.id;
  const prompt = promptsState.find(p => p.id === id);
  if (!prompt) return;

  const actionTarget = e.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;

  switch (action) {
    case "toggle-expand":
      actionTarget.classList.toggle("expanded");
      break;

    case "toggle-fav":
      prompt.favorite = !prompt.favorite;
      prompt.updatedAt = Date.now();
      savePromptsToStorage();
      break;

    case "insert":
      handlePromptAction(prompt, false);
      break;

    case "send":
      handlePromptAction(prompt, true);
      break;

    case "copy":
      if (hasVariablePlaceholders(prompt.content)) {
        openVariableModal(prompt, "copy");
      } else {
        copyToClipboard(prompt.content);
      }
      break;

    case "edit":
      openPromptModal(prompt);
      break;

    case "delete":
      openDeleteModal(prompt);
      break;
  }
}

function hasVariablePlaceholders(text) {
  return /\{\{([^}]+)\}\}/.test(text || "");
}

function handlePromptAction(prompt, autoSend = false) {
  if (hasVariablePlaceholders(prompt.content)) {
    openVariableModal(prompt, autoSend ? "send" : "insert");
  } else {
    executeInsertText(prompt.content, autoSend);
  }
}

// ----------------------------------------------------
// 変数入力モーダル
// ----------------------------------------------------
function openVariableModal(prompt, defaultAction = "insert") {
  activeVariablePrompt = prompt;
  document.getElementById("variable-modal-title").textContent = `入力: ${prompt.title}`;

  // 変数抽出
  const matches = [...prompt.content.matchAll(/\{\{([^}]+)\}\}/g)];
  const variableNames = [...new Set(matches.map(m => m[1].trim()))];

  variableInputsContainer.innerHTML = variableNames.map((varName, idx) => `
    <div class="var-input-row">
      <label class="var-input-label">${escapeHtml(varName)}</label>
      <input type="text" class="var-input-field" data-var="${escapeHtml(varName)}" placeholder="${escapeHtml(varName)} を入力..." ${idx === 0 ? 'autofocus' : ''}>
    </div>
  `).join("");

  // リアルタイムプレビュー更新
  const updatePreview = () => {
    variablePreviewText.textContent = getFinalVariableReplacedText();
  };

  variableInputsContainer.querySelectorAll(".var-input-field").forEach(input => {
    input.addEventListener("input", updatePreview);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (defaultAction === "send") {
          btnVarInsertSend.click();
        } else {
          btnVarInsert.click();
        }
      }
    });
  });

  updatePreview();
  variableModal.style.display = "flex";

  // 最初のインプットにフォーカス
  const firstInput = variableInputsContainer.querySelector(".var-input-field");
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

function getFinalVariableReplacedText() {
  if (!activeVariablePrompt) return "";
  let text = activeVariablePrompt.content;

  const inputs = variableInputsContainer.querySelectorAll(".var-input-field");
  inputs.forEach(input => {
    const varName = input.dataset.var;
    const value = input.value.trim() || `[${varName}]`;
    const regex = new RegExp(`\\{\\{\\s*${escapeRegExp(varName)}\\s*\\}\\}`, 'g');
    text = text.replace(regex, value);
  });

  return text;
}

function closeVariableModal() {
  variableModal.style.display = "none";
  activeVariablePrompt = null;
}

// ----------------------------------------------------
// クリップボードコピー
// ----------------------------------------------------
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("📋 クリップボードにコピーしました！");
    }).catch(err => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showToast("📋 クリップボードにコピーしました！");
}

// ----------------------------------------------------
// アクティブタブ取得（サイドパネル対応）
// ----------------------------------------------------
async function getTargetTab() {
  try {
    // 1. 直前にフォーカスがあったウィンドウのアクティブタブ
    let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tabs && tabs[0]) {
      const u = tabs[0].url || "";
      if (!u.startsWith("chrome-extension://")) {
        return tabs[0];
      }
    }

    // 2. カレントウィンドウのアクティブタブ
    tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs[0]) {
      const u = tabs[0].url || "";
      if (!u.startsWith("chrome-extension://")) {
        return tabs[0];
      }
    }

    // 3. 全ウィンドウのアクティブタブから http/https を優先探索
    tabs = await chrome.tabs.query({ active: true });
    if (tabs && tabs.length > 0) {
      const httpTab = tabs.find(t => {
        const u = t.url || "";
        return u.startsWith("http://") || u.startsWith("https://");
      });
      if (httpTab) return httpTab;
      return tabs[0];
    }

    return null;
  } catch (err) {
    console.error("Tab query error:", err);
    return null;
  }
}

// ----------------------------------------------------
// アクティブタブの入力欄へのテキスト挿入＆送信
// ----------------------------------------------------
async function executeInsertText(text, autoSend = false) {
  try {
    const tab = await getTargetTab();
    if (!tab || !tab.id) {
      showToast("⚠️ 有効なブラウザタブが見つかりませんでした");
      copyToClipboard(text);
      return;
    }

    const tabUrl = tab.url || "";

    // chrome:// や edge:// などの保護ページでは拡張機能スクリプトが動かない
    if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("edge://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("about:")) {
      copyToClipboard(text);
      showToast("⚠️ ブラウザ設定ページには挿入できないためコピーしました");
      return;
    }

    // スクリプト注入実行
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: injectPromptIntoWebPage,
      args: [text, autoSend]
    });

    if (results && results[0]) {
      const res = results[0].result;
      if (res && res.success) {
        showToast(autoSend ? "🚀 挿入して送信しました！" : "✨ 入力欄に挿入しました！");
      } else {
        const errorMsg = (res && res.message) ? res.message : "入力欄が見つかりませんでした";
        copyToClipboard(text);
        showToast(`⚠️ ${errorMsg}（コピーしました）`, 3500);
      }
    } else {
      copyToClipboard(text);
      showToast("📋 挿入結果を取得できなかったためコピーしました");
    }
  } catch (err) {
    console.error("Injection error:", err);
    copyToClipboard(text);
    showToast(`⚠️ 挿入エラー: ${err.message || "権限エラー"}（コピーしました）`, 4000);
  }
}

/**
 * ターゲットタブのWebページ側で実行されるスクリプト関数
 */
function injectPromptIntoWebPage(textToInsert, shouldSend) {
  // Shadow DOM を再帰探索する関数
  function findDeep(predicate, root = document) {
    // 現在のルート内の要素を探索
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    const shadowHosts = [];
    while ((node = walker.nextNode())) {
      if (predicate(node)) {
        return node;
      }
      if (node.shadowRoot) {
        shadowHosts.push(node.shadowRoot);
      }
    }

    // Shadow DOM 内を再帰探索
    for (const shadow of shadowHosts) {
      const found = findDeep(predicate, shadow);
      if (found) return found;
    }

    return null;
  }

  // 1. 各主要AIチャットの専用セレクタリスト
  const specificSelectors = [
    // Gemini (Google)
    'rich-textarea .ql-editor',
    'rich-textarea div[contenteditable="true"]',
    'div.ql-editor[contenteditable="true"]',
    'rich-textarea [role="textbox"]',
    'div[contenteditable="true"][aria-label*="プロンプト"]',
    'div[contenteditable="true"][aria-label*="Prompt"]',
    
    // ChatGPT (OpenAI)
    '#prompt-textarea',
    'div#prompt-textarea',
    'div[contenteditable="true"]#prompt-textarea',
    'textarea#prompt-textarea',
    'div[contenteditable="true"][data-placeholder]',
    
    // Claude (Anthropic)
    'div.ProseMirror[contenteditable="true"]',
    'div[contenteditable="true"].ProseMirror',
    'div[contenteditable="true"][aria-label*="Write"]',
    
    // Microsoft Copilot
    'textarea#searchbox',
    '#userInput',
    'textarea[placeholder*="Ask"]',
    'textarea[placeholder*="メッセージ"]',

    // Perplexity
    'textarea[placeholder*="Ask"]',
    'textarea[placeholder*="質問"]',

    // 汎用 contenteditable
    'div[role="textbox"][contenteditable="true"]',
    'div[contenteditable="true"]'
  ];

  let targetEl = null;

  // A. 現在アクティブな要素が入力可能なら最優先
  const active = document.activeElement;
  if (active && (
    active.tagName === 'TEXTAREA' ||
    active.isContentEditable ||
    active.getAttribute('contenteditable') === 'true' ||
    (active.tagName === 'INPUT' && (active.type === 'text' || active.type === 'search'))
  )) {
    targetEl = active;
  }

  // B. 専用セレクタで探索
  if (!targetEl) {
    for (const sel of specificSelectors) {
      try {
        const found = document.querySelector(sel);
        if (found && isVisible(found)) {
          targetEl = found;
          break;
        }
      } catch (e) {}
    }
  }

  // C. Shadow DOM 含む再帰探索
  if (!targetEl) {
    targetEl = findDeep((el) => {
      if (!isVisible(el)) return false;
      if (el.tagName === 'TEXTAREA' && !el.disabled && !el.readOnly) return true;
      if (el.isContentEditable || el.getAttribute('contenteditable') === 'true') return true;
      if (el.getAttribute('role') === 'textbox') return true;
      return false;
    });
  }

  // D. 汎用 textarea 探索
  if (!targetEl) {
    const textareas = document.querySelectorAll('textarea');
    for (const ta of textareas) {
      if (isVisible(ta) && !ta.disabled && !ta.readOnly) {
        targetEl = ta;
        break;
      }
    }
  }

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  if (!targetEl) {
    return { success: false, message: "入力欄を検出できませんでした" };
  }

  // 要素にフォーカス
  targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  targetEl.focus();
  targetEl.click();

  const isEditable = targetEl.isContentEditable || targetEl.getAttribute('contenteditable') === 'true' || targetEl.getAttribute('role') === 'textbox';

  if (isEditable) {
    // --- contenteditable (Gemini, ChatGPT, Claude) ---
    // セレクションを末尾に設定
    const sel = window.getSelection();
    sel.removeAllRanges();
    const range = document.createRange();

    // 内部に段落 p があればその中にフォーカス
    const p = targetEl.querySelector('p');
    if (p) {
      range.selectNodeContents(p);
      range.collapse(false);
    } else {
      range.selectNodeContents(targetEl);
      range.collapse(false);
    }
    sel.addRange(range);

    // 1. execCommand で入力（Undoスタックや各フレームワークの内部状態と調和）
    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, textToInsert);
    } catch (e) {
      inserted = false;
    }

    // 2. execCommand が失敗、または内容が変化しなかった場合のフォールバック
    if (!inserted || !targetEl.textContent.includes(textToInsert.slice(0, 10))) {
      if (p) {
        if (p.textContent === '' || p.innerHTML === '<br>') {
          p.textContent = textToInsert;
        } else {
          p.textContent += '\n' + textToInsert;
        }
      } else {
        const newP = document.createElement('p');
        newP.textContent = textToInsert;
        targetEl.appendChild(newP);
      }
    }

    // イベント発火で React / Angular / Vue / ProseMirror / Quill の状態を同期
    try {
      targetEl.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        composed: true,
        inputType: 'insertText',
        data: textToInsert
      }));
    } catch (e) {}

    targetEl.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    targetEl.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

  } else {
    // --- textarea / input ---
    const start = targetEl.selectionStart || 0;
    const end = targetEl.selectionEnd || 0;
    const val = targetEl.value || '';
    
    const insertPrefix = (start > 0 && !val.endsWith('\n') && val.length === start) ? '\n' : '';
    const updatedVal = val.substring(0, start) + insertPrefix + textToInsert + val.substring(end);
    
    // React 等のネイティブセッター経由で更新
    const proto = targetEl.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) {
      setter.call(targetEl, updatedVal);
    } else {
      targetEl.value = updatedVal;
    }

    const nextPos = start + insertPrefix.length + textToInsert.length;
    try {
      targetEl.selectionStart = nextPos;
      targetEl.selectionEnd = nextPos;
    } catch (e) {}

    targetEl.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    targetEl.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  // 送信処理（shouldSend が true の場合）
  if (shouldSend) {
    setTimeout(() => {
      // 送信ボタンの探索セレクタ
      const sendSelectors = [
        // ChatGPT
        'button[data-testid="send-button"]',
        'button[aria-label="プロンプトを送信する"]',
        'button[aria-label="Send prompt"]',
        'button[aria-label="Send message"]',
        'button[data-testid*="send"]',

        // Gemini
        'button[aria-label*="プロンプトを送信"]',
        'button[aria-label*="Send prompt"]',
        'button[aria-label*="送信"]',
        'button[aria-label*="Send"]',
        'button.send-button',
        'send-button button',
        '.send-button-container button',

        // Claude
        'button[aria-label="Send Message"]',
        'button[aria-label*="Send"]',
        'button[aria-label*="送信"]',
        'fieldset button[type="button"]',

        // 汎用
        'form button[type="submit"]',
        'button.submit-button'
      ];

      let sendBtn = null;
      for (const sel of sendSelectors) {
        try {
          const btn = document.querySelector(sel);
          if (btn && isVisible(btn) && !btn.disabled) {
            sendBtn = btn;
            break;
          }
        } catch (e) {}
      }

      if (sendBtn) {
        sendBtn.click();
      } else {
        // 送信ボタンが見つからない場合は Enter キーイベント
        targetEl.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
          composed: true
        }));
      }
    }, 200);
  }

  return { success: true };
}

// ----------------------------------------------------
// プロンプト追加/編集モーダル
// ----------------------------------------------------
function openPromptModal(promptToEdit = null) {
  if (promptToEdit) {
    document.getElementById("modal-title").textContent = "プロンプト編集";
    editPromptIdEl.value = promptToEdit.id;
    formTitleEl.value = promptToEdit.title || "";
    formCategoryEl.value = promptToEdit.category || "writing";
    formTagsEl.value = (promptToEdit.tags || []).join(", ");
    formContentEl.value = promptToEdit.content || "";
  } else {
    document.getElementById("modal-title").textContent = "新規プロンプト作成";
    editPromptIdEl.value = "";
    formTitleEl.value = "";
    formCategoryEl.value = currentCategory !== "all" && currentCategory !== "favorite" ? currentCategory : "writing";
    formTagsEl.value = "";
    formContentEl.value = "";
  }

  promptModal.style.display = "flex";
  setTimeout(() => formTitleEl.focus(), 50);
}

function closePromptModal() {
  promptModal.style.display = "none";
  promptForm.reset();
}

function handlePromptFormSubmit(e) {
  e.preventDefault();
  const id = editPromptIdEl.value;
  const title = formTitleEl.value.trim();
  const category = formCategoryEl.value;
  const tags = formTagsEl.value.split(/[,、]/).map(t => t.trim()).filter(Boolean);
  const content = formContentEl.value.trim();

  if (!title || !content) {
    showToast("⚠️ タイトルと本文を入力してください");
    return;
  }

  if (id) {
    // 編集
    const existing = promptsState.find(p => p.id === id);
    if (existing) {
      existing.title = title;
      existing.category = category;
      existing.tags = tags;
      existing.content = content;
      existing.updatedAt = Date.now();
    }
    showToast("✨ プロンプトを更新しました！");
  } else {
    // 新規作成
    const newPrompt = {
      id: "prompt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
      title,
      category,
      tags,
      content,
      favorite: false,
      updatedAt: Date.now()
    };
    promptsState.unshift(newPrompt);
    showToast("✨ 新規プロンプトを作成しました！");
  }

  savePromptsToStorage();
  closePromptModal();
}

// ----------------------------------------------------
// エクスポート / インポート / プリセット復元
// ----------------------------------------------------
function exportPromptsToJson() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(promptsState, null, 2));
  const downloadAnchor = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `quickprompt-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("💾 バックアップJSONを出力しました");
}

function importPromptsFromJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        // 既存とIDが重複しないように統合
        const existingIds = new Set(promptsState.map(p => p.id));
        let count = 0;
        imported.forEach(item => {
          if (existingIds.has(item.id)) {
            item.id = "imported-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
          }
          promptsState.push(item);
          count++;
        });

        savePromptsToStorage();
        showToast(`📂 ${count} 件のプロンプトを読み込みました！`);
        settingsModal.style.display = "none";
      } else {
        showToast("⚠️ JSONファイルの形式が正しくありません");
      }
    } catch (err) {
      showToast("⚠️ JSONの解析に失敗しました: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function resetToDefaultPresets() {
  const existingTitles = new Set(promptsState.map(p => p.title));
  let addedCount = 0;
  
  DEFAULT_PRESETS.forEach(preset => {
    if (!existingTitles.has(preset.title)) {
      promptsState.push({
        ...preset,
        id: "preset-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5)
      });
      addedCount++;
    }
  });

  savePromptsToStorage();
  if (addedCount > 0) {
    showToast(`🔄 ${addedCount} 件の定番プリセットを追加しました！`);
  } else {
    showToast("ℹ️ すべての定番プリセットはすでに追加されています");
  }
  settingsModal.style.display = "none";
}

// ----------------------------------------------------
// ユーティリティ
// ----------------------------------------------------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 起動
document.addEventListener("DOMContentLoaded", initApp);
