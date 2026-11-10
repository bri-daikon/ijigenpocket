(() => {
  "use strict";

  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || "";
  const TYPES = ["すべて", "スタンプ", "絵文字", "着せかえ", "その他"];
  const state = { works: [], search: "", type: "すべて", category: "すべて", sort: "default", visible: 48, lastSyncAt: null };
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    grid: $("#workGrid"), empty: $("#emptyState"), more: $("#loadMoreButton"), search: $("#searchInput"),
    category: $("#categorySelect"), sort: $("#sortSelect"), tabs: $("#typeTabs"), status: $("#syncStatus"),
    modal: $("#workModal"), form: $("#workForm"), modalTitle: $("#modalTitle"), imageInput: $("#imageInput"),
    preview: $("#imagePreview"), toast: $("#toast"), importInput: $("#importInput"), sync: $("#syncButton"),
  };

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const initials = (title = "") => title.replace(/[「」（）・：:\s]/g, "").slice(0, 2) || "作";
  const formatDate = (value) => value ? new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`)) : "日付未設定";

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.method && options.method !== "GET") headers["X-CSRF-Token"] = csrf;
    if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
    const response = await fetch(url, { credentials: "same-origin", ...options, headers });
    if (response.status === 401) { location.reload(); throw new Error("ログインの有効期限が切れました。"); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "処理に失敗しました。");
    return data;
  }

  function toast(message, isError = false) {
    elements.toast.textContent = message;
    elements.toast.classList.toggle("error", isError);
    elements.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { elements.toast.hidden = true; }, 4200);
  }

  function filteredWorks() {
    const query = state.search.trim().toLocaleLowerCase("ja");
    const result = state.works.filter((work) => {
      if (state.type !== "すべて" && work.type !== state.type) return false;
      if (state.category !== "すべて" && work.category !== state.category) return false;
      if (!query) return true;
      return [work.title, work.series, work.category, work.description, ...(work.tags || [])].join(" ").toLocaleLowerCase("ja").includes(query);
    });
    if (state.sort === "title") result.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    if (state.sort === "newest") result.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return result;
  }

  function renderStats() {
    const selling = state.works.filter((work) => work.status === "販売中").length;
    $("#totalStat").textContent = String(state.works.length).padStart(2, "0");
    $("#saleStat").textContent = selling;
    $("#seriesStat").textContent = new Set(state.works.map((work) => work.series).filter(Boolean)).size;
    $("#draftStat").textContent = state.works.length - selling;
    $("#allCount").textContent = state.works.length;
  }

  function renderTabs() {
    elements.tabs.innerHTML = TYPES.map((type) => {
      const count = type === "すべて" ? state.works.length : state.works.filter((work) => work.type === type).length;
      return `<button type="button" data-type="${escapeHtml(type)}" class="${state.type === type ? "active" : ""}">${escapeHtml(type)}<span>${count}</span></button>`;
    }).join("");
  }

  function renderCategories() {
    const current = state.category;
    const categories = ["すべて", ...new Set(state.works.map((work) => work.category).filter(Boolean).sort((a, b) => a.localeCompare(b, "ja")))];
    elements.category.innerHTML = categories.map((item) => `<option ${item === current ? "selected" : ""}>${escapeHtml(item)}</option>`).join("");
    if (!categories.includes(current)) state.category = "すべて";
  }

  function workCard(work) {
    const image = work.image
      ? `<img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}の作品画像" loading="lazy" referrerpolicy="no-referrer">`
      : `<div class="coverPlaceholder" style="background:linear-gradient(145deg,${escapeHtml(work.accent)}22,${escapeHtml(work.accent)}55)"><span style="color:${escapeHtml(work.accent)}">${escapeHtml(initials(work.title))}</span><small>IMAGE</small></div>`;
    const tags = (work.tags || []).slice(0, 4).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("");
    const store = work.storeUrl ? `<a href="${escapeHtml(work.storeUrl)}" target="_blank" rel="noreferrer">販売ページ ↗</a>` : '<span class="muted">URL未登録</span>';
    return `<article class="workCard" data-id="${escapeHtml(work.id)}">
      <div class="cover" style="background:${escapeHtml(work.accent)}22">${image}<span class="status status-${escapeHtml(work.status)}">${escapeHtml(work.status)}</span><span class="typeBadge">${escapeHtml(work.type)}</span></div>
      <div class="workBody"><div class="workMeta"><span>${escapeHtml(work.category)}</span><time>${escapeHtml(formatDate(work.releaseDate))}</time></div>
      <h3>${escapeHtml(work.title)}</h3><p class="series">${escapeHtml(work.series || "シリーズ未設定")}</p>
      ${work.description ? `<p class="description">${escapeHtml(work.description)}</p>` : ""}<div class="tags">${tags}</div>
      <div class="cardActions"><button type="button" data-edit>編集</button>${store}<button class="deleteButton" type="button" data-delete>削除</button></div></div>
    </article>`;
  }

  function render() {
    const filtered = filteredWorks();
    const visible = filtered.slice(0, state.visible);
    $("#filteredCount").textContent = filtered.length;
    elements.grid.innerHTML = visible.map(workCard).join("");
    elements.empty.hidden = filtered.length !== 0;
    elements.more.hidden = visible.length >= filtered.length;
    elements.more.textContent = `もっと見る（残り${Math.max(0, filtered.length - visible.length)}件）`;
    renderStats(); renderTabs(); renderCategories();
    elements.status.textContent = state.lastSyncAt ? `最終同期 ${new Date(state.lastSyncAt).toLocaleString("ja-JP")}` : "初期データを表示中";
  }

  async function loadWorks() {
    try {
      const data = await request("api.php?action=list");
      state.works = data.works || [];
      state.lastSyncAt = data.lastSyncAt;
      render();
    } catch (error) { toast(error.message, true); }
  }

  function openModal(work = null) {
    elements.form.reset();
    elements.form.elements.accent.value = work?.accent || "#197a63";
    elements.form.elements.status.value = work?.status || "下書き";
    elements.form.elements.type.value = work?.type || "スタンプ";
    elements.form.elements.category.value = work?.category || "日常";
    if (work) {
      for (const key of ["id", "title", "series", "type", "category", "releaseDate", "status", "description", "storeUrl", "image", "accent"]) {
        if (elements.form.elements[key]) elements.form.elements[key].value = work[key] || "";
      }
      elements.form.elements.tags.value = (work.tags || []).join(", ");
      elements.modalTitle.textContent = "作品を編集";
    } else {
      elements.form.elements.id.value = "";
      elements.form.elements.image.value = "";
      elements.form.elements.tags.value = "";
      elements.modalTitle.textContent = "新しい作品を登録";
    }
    updatePreview();
    elements.modal.hidden = false;
    document.body.classList.add("modalOpen");
    setTimeout(() => elements.form.elements.title.focus(), 30);
  }

  function closeModal() { elements.modal.hidden = true; document.body.classList.remove("modalOpen"); }

  function updatePreview() {
    const url = elements.form.elements.image.value;
    const title = elements.form.elements.title.value;
    elements.preview.innerHTML = url ? `<img src="${escapeHtml(url)}" alt="画像プレビュー">` : escapeHtml(initials(title));
    elements.preview.style.background = `${elements.form.elements.accent.value}22`;
    elements.preview.style.color = elements.form.elements.accent.value;
  }

  async function saveForm(event) {
    event.preventDefault();
    const submit = elements.form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      if (elements.imageInput.files[0]) {
        const upload = new FormData(); upload.append("image", elements.imageInput.files[0]);
        const uploaded = await request("api.php?action=upload", { method: "POST", body: upload });
        elements.form.elements.image.value = uploaded.url;
      }
      const data = Object.fromEntries(new FormData(elements.form).entries());
      data.tags = String(data.tags || "").split(/[,、]/).map((tag) => tag.trim()).filter(Boolean);
      await request("api.php?action=save", { method: "POST", body: JSON.stringify(data) });
      closeModal(); toast("作品情報を保存しました"); await loadWorks();
    } catch (error) { toast(error.message, true); }
    finally { submit.disabled = false; }
  }

  async function syncLine() {
    elements.sync.disabled = true;
    elements.sync.textContent = "同期しています…";
    try {
      const data = await request("api.php?action=sync", { method: "POST", body: "{}" });
      const note = data.sourceStatus === "live" ? "" : "（確認済みデータで不足分を補完）";
      toast(`LINE STOREから${data.count}件を同期しました${note}`);
      await loadWorks();
    } catch (error) { toast(error.message, true); }
    finally { elements.sync.disabled = false; elements.sync.textContent = "↻ LINEから同期"; }
  }

  async function importFile(file) {
    try {
      const parsed = JSON.parse(await file.text());
      const products = Array.isArray(parsed) ? parsed : parsed.products;
      if (!Array.isArray(products)) throw new Error("作品データが見つかりません。");
      const data = await request("api.php?action=import", { method: "POST", body: JSON.stringify({ products }) });
      toast(`${data.count}件を読み込みました`); await loadWorks();
    } catch (error) { toast(error.message || "ファイルを読み込めませんでした。", true); }
  }

  $("#newWorkButton").addEventListener("click", () => openModal());
  $("#heroNewButton").addEventListener("click", () => openModal());
  $("#closeModal").addEventListener("click", closeModal);
  $("#cancelModal").addEventListener("click", closeModal);
  elements.modal.addEventListener("mousedown", (event) => { if (event.target === elements.modal) closeModal(); });
  elements.form.addEventListener("submit", saveForm);
  elements.form.elements.title.addEventListener("input", updatePreview);
  elements.form.elements.accent.addEventListener("input", updatePreview);
  $("#removeImage").addEventListener("click", () => { elements.form.elements.image.value = ""; elements.imageInput.value = ""; updatePreview(); });
  elements.search.addEventListener("input", () => { state.search = elements.search.value; state.visible = 48; render(); });
  $("#clearSearch").addEventListener("click", () => { elements.search.value = ""; state.search = ""; render(); elements.search.focus(); });
  elements.category.addEventListener("change", () => { state.category = elements.category.value; state.visible = 48; render(); });
  elements.sort.addEventListener("change", () => { state.sort = elements.sort.value; state.visible = 48; render(); });
  elements.tabs.addEventListener("click", (event) => { const button = event.target.closest("button[data-type]"); if (!button) return; state.type = button.dataset.type; state.visible = 48; render(); });
  elements.more.addEventListener("click", () => { state.visible += 48; render(); });
  elements.grid.addEventListener("click", async (event) => {
    const card = event.target.closest(".workCard"); if (!card) return;
    const work = state.works.find((item) => item.id === card.dataset.id); if (!work) return;
    if (event.target.closest("[data-edit]")) openModal(work);
    if (event.target.closest("[data-delete]") && confirm(`「${work.title}」を削除しますか？`)) {
      try { await request("api.php?action=delete", { method: "POST", body: JSON.stringify({ id: work.id }) }); toast("作品を削除しました"); await loadWorks(); }
      catch (error) { toast(error.message, true); }
    }
  });
  elements.sync.addEventListener("click", syncLine);
  $("#importButton").addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", () => { if (elements.importInput.files[0]) importFile(elements.importInput.files[0]); elements.importInput.value = ""; });
  $("#logoutButton").addEventListener("click", async () => { try { await request("api.php?action=logout", { method: "POST", body: "{}" }); location.reload(); } catch (error) { toast(error.message, true); } });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !elements.modal.hidden) closeModal(); });

  loadWorks();
})();
