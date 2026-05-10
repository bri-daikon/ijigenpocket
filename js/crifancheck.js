let ROWS = 5, COLS = 8;
const MAX_ROWS = 20, MAX_COLS = 20;

const STORAGE_KEY = "crit_fumble_paged_v1";
const INPUTTER_KEY = "crit_fumble_inputter";

// DOM 取得
const inputterEl = document.getElementById("inputter");
const inputterDisplay = document.getElementById("inputterDisplay");

const charNameEl = document.getElementById("charName");
const criticalEl = document.getElementById("critical");
const fumbleEl = document.getElementById("fumble");
const dateInput = document.getElementById("dateInput");
const scenarioEl = document.getElementById("scenario");

const addBtn = document.getElementById("addBtn");
const clearBtn = document.getElementById("clearBtn");

const exportAllBtn = document.getElementById("exportAllBtn");
const exportPageBtn = document.getElementById("exportPageBtn");

const gridCritical = document.getElementById("gridCritical");
const gridFumble = document.getElementById("gridFumble");

const countEl = document.getElementById("count");
const sumCriticalEl = document.getElementById("sumCritical");
const sumFumbleEl = document.getElementById("sumFumble");

const monthSelect = document.getElementById("monthSelect");
const characterSelect = document.getElementById("characterSelect"); 

const rowsInput = document.getElementById("rowsInput");
const colsInput = document.getElementById("colsInput");
const applyGridBtn = document.getElementById("applyGridBtn");

const syncPageSize = document.getElementById("syncPageSize");
const pageSizeSelect = document.getElementById("pageSizeSelect");

const firstPageBtn = document.getElementById("firstPage");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const lastPageBtn = document.getElementById("lastPage");

const currentPageEl = document.getElementById("currentPage");
const totalPagesEl = document.getElementById("totalPages");

const jumpInput = document.getElementById("jumpInput");
const jumpBtn = document.getElementById("jumpBtn");



// データ読み込み
let data = load();
let currentPage = 1;
let pageSize = ROWS * COLS;

// グリッド生成
function buildGrid(table, cols = COLS, rows = ROWS) {
  table.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < cols; c++) {
      const td = document.createElement("td");
      td.classList.add("empty");
      td.dataset.slot = r * cols + c;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}



function updateCharacterList() {
  if (!characterSelect) return; // 要素が無ければ何もしない

  const chars = new Set();

  data.forEach(entry => {
    if (entry.character && entry.character.trim() !== "") {
      chars.add(entry.character.trim());
    }
  });

  const sorted = Array.from(chars).sort();

  characterSelect.innerHTML =
    `<option value="all">全キャラ</option>` +
    sorted.map(c => `<option value="${c}">${c}</option>`).join("");

  characterSelect.value = "all";
}


// 月一覧を更新
function updateMonthList() {
  const months = new Set();

  data.forEach(entry => {
    if (entry.date) {
      months.add(entry.date.slice(0, 7)); // YYYY-MM
    }
  });

  const sorted = Array.from(months).sort();

  // 先頭に「全件」を追加
  monthSelect.innerHTML = `<option value="all">全件</option>` +
    sorted.map(m => `<option value="${m}">${m}</option>`).join("");

  // デフォルトは全件
  monthSelect.value = "all";
}


// 月かキャらでフィルタ
function getFilteredData() {
  const month = monthSelect ? monthSelect.value : "all";
  const char = characterSelect ? characterSelect.value : "all";

  let filtered = data;

  if (month !== "all") {
    filtered = filtered.filter(entry =>
      entry.date && entry.date.startsWith(month)
    );
  }

  if (char !== "all") {
    filtered = filtered.filter(entry =>
      entry.character && entry.character.trim() === char
    );
  }

  return filtered;
}

// 合計計算
function computeTotals(filtered) {
  const count = filtered.length;
  const sumC = filtered.reduce((s, e) => s + Number(e.critical || 0), 0);
  const sumF = filtered.reduce((s, e) => s + Number(e.fumble || 0), 0);
  return { count, sumC, sumF };
}

// 入力者表示
function updateInputterDisplay(name) {
  inputterDisplay.textContent = name && name.trim() !== "" ? name : "（未設定）";
}

characterSelect.addEventListener("change", () => {
  currentPage = 1;
  renderPage();
});


/* ============================
   月別背景色（背景テーマ）
   ============================ */

// 月 → 背景色 のマップ
const monthColors = {};

// 背景色パレット（淡い色）
const colorPalette = [
  "#60a5fa33", // 青
  "#5eead433", // 緑
  "#f472b633", // ピンク
  "#facc1533", // 黄
  "#a78bfa33", // 紫
  "#34d39933", // エメラルド
  "#fb718533", // 赤
  "#38bdf833", // 水色
];

// 月の背景色を取得（未登録なら自動割り当て）
function getMonthColor(ym) {
  if (!monthColors[ym]) {
    const index = Object.keys(monthColors).length;
    monthColors[ym] = colorPalette[index % colorPalette.length];
  }
  return monthColors[ym];
}
/* ============================
   月別枠線色（背景より濃い色）
   ============================ */

// 月 → 枠線色 のマップ
const monthBorderColors = {};

// 枠線色パレット（背景色より濃い）
const borderPalette = [
  "#60a5fa88", // 青
  "#5eead488", // 緑
  "#f472b688", // ピンク
  "#facc1588", // 黄
  "#a78bfa88", // 紫
  "#34d39988", // エメラルド
  "#fb718588", // 赤
  "#38bdf888", // 水色
];

// 月の枠線色を取得（未登録なら自動割り当て）
function getMonthBorderColor(ym) {
  if (!monthBorderColors[ym]) {
    const index = Object.keys(monthBorderColors).length;
    monthBorderColors[ym] = borderPalette[index % borderPalette.length];
  }
  return monthBorderColors[ym];
}

/* ============================
   renderPage（完全版）
   ============================ */

function renderPage() {

  let filtered = getFilteredData();

// ソート適用（none でなければコピーしてソート）
if (sortColumn && sortColumn !== "none") {
  filtered = filtered.slice().sort(compareEntries);
}

  // グリッド再生成
  buildGrid(gridCritical, COLS, ROWS);
  buildGrid(gridFumble, COLS, ROWS);

  // ページ数計算
  const total = filtered.length;
  const tp = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > tp) currentPage = tp;

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(total, start + pageSize);

  // セル描画
// renderPage() 内のセル描画ループ部分をこれに置き換えてください
for (let i = start; i < end; i++) {
  const pageIdx = i - start;
  const entry = filtered[i]; // ← ここで必ず entry を先に宣言

  if (!entry) continue; // 念のためのガード

  const tdC = gridCritical.querySelector(`td[data-slot="${pageIdx}"]`);
  const tdF = gridFumble.querySelector(`td[data-slot="${pageIdx}"]`);

  // entry のプロパティを先に取得
  const critText = String(entry.critical);
  const fumbleText = String(entry.fumble);
  const charText = entry.character || "(無名)";
  const scenarioText = entry.scenario || "";
  const dateText = entry.date || "";

  // 月（YYYY-MM）
  const ym = entry.date ? entry.date.slice(0, 7) : "";

  // 月別背景色・枠線色
  const bgColor = ym ? getMonthColor(ym) : "transparent";
  const borderColor = ym ? getMonthBorderColor(ym) : "rgba(255,255,255,0.05)";

  // data 配列における実インデックスを取得（重要）
  const globalIndex = data.indexOf(entry);
  if (globalIndex === -1) {
    // 通常は起きないが、起きたらそのセルは描画しない（安全策）
    continue;
  }

  if (tdC) {
    tdC.innerHTML =
      `<div class="cell-value">${critText}</div>` +
      `<div class="cell-meta char">${charText}</div>` +
      `<div class="cell-meta scenario">${scenarioText}</div>` +
      `<div class="cell-meta date">${dateText}</div>`;

    tdC.classList.remove("empty");
    tdC.classList.add("filled");

    tdC.style.backgroundColor = bgColor;
    tdC.style.borderColor = borderColor;

    tdC.dataset.globalIndex = globalIndex;
  }

  if (tdF) {
    tdF.innerHTML =
      `<div class="cell-value">${fumbleText}</div>` +
      `<div class="cell-meta char">${charText}</div>` +
      `<div class="cell-meta scenario">${scenarioText}</div>` +
      `<div class="cell-meta date">${dateText}</div>`;

    tdF.classList.remove("empty");
    tdF.classList.add("filled");

    tdF.style.backgroundColor = bgColor;
    tdF.style.borderColor = borderColor;

    tdF.dataset.globalIndex = globalIndex;
  }
}

  // 件数表示
  const totals = computeTotals(filtered);
  countEl.textContent = totals.count;
  sumCriticalEl.textContent = totals.sumC;
  sumFumbleEl.textContent = totals.sumF;

  // ページ表示
  currentPageEl.textContent = currentPage;
  totalPagesEl.textContent = tp;

  // 入力者表示
  const currentInputter =
    inputterEl.value.trim() ||
    (data.length ? data[data.length - 1].inputter || "" : "");
  updateInputterDisplay(currentInputter);
}

// --- ソート状態
let sortColumn = "none"; // none | critical | fumble | date | character | scenario | inputter
let sortDir = 1; // 1 = 昇順, -1 = 降順

const sortSelect = document.getElementById("sortSelect");
const sortDirBtn = document.getElementById("sortDirBtn");

// 比較関数（列に応じて型を扱う）
function compareEntries(a, b) {
  if (sortColumn === "none") return 0;

  let va = a[sortColumn];
  let vb = b[sortColumn];

  // 数値列
  if (sortColumn === "critical" || sortColumn === "fumble") {
    va = Number(va) || 0;
    vb = Number(vb) || 0;
    return (va - vb) * sortDir;
  }

  // 日付（YYYY-MM-DD 形式を想定。任意文字列でも比較可能）
  if (sortColumn === "date") {
    // 空文字は末尾に回す
    if (!va) return 1 * sortDir;
    if (!vb) return -1 * sortDir;
    // ISO 形式なら文字列比較でOK
    if (va === vb) return 0;
    return (va > vb ? 1 : -1) * sortDir;
  }

  // 文字列列（大文字小文字を無視）
  va = (va || "").toString().toLowerCase();
  vb = (vb || "").toString().toLowerCase();
  if (va === vb) return 0;
  return (va > vb ? 1 : -1) * sortDir;
}

// ソート UI イベント
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    sortColumn = sortSelect.value;
    currentPage = 1;
    renderPage();
  });
}

if (sortDirBtn) {
  sortDirBtn.addEventListener("click", () => {
    sortDir = -sortDir;
    sortDirBtn.textContent = sortDir === 1 ? "▲" : "▼";
    currentPage = 1;
    renderPage();
  });
}


// DOM
const csvFileInput = document.getElementById("csvFileInput");
const csvAppendBtn = document.getElementById("csvAppendBtn");
const csvReplaceBtn = document.getElementById("csvReplaceBtn");

// シンプルな CSV パーサ（引用符対応）
function parseCSV(text) {
  const rows = [];
  let cur = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' ) {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = "";
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur !== "" || row.length > 0) {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      }
      // handle CRLF by skipping the next char if it's the pair
      if (ch === '\r' && text[i + 1] === '\n') i++;
      continue;
    }

    cur += ch;
  }

  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

// CSV の行をオブジェクトに変換するヘルパ
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const header = rows[0].map(h => h.trim().replace(/^"|"$/g, ""));
  const objs = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 0) continue;
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      const key = header[j] || `col${j}`;
      obj[key] = (r[j] || "").trim().replace(/^"|"$/g, "");
    }
    objs.push(obj);
  }
  return objs;
}

// CSV の列名期待値
// 出力時のヘッダ: index,time,date,character,scenario,critical,fumble,inputter
function normalizeCsvObject(o) {
  return {
    time: o.time || o.Time || "",
    date: o.date || o.Date || "",
    character: o.character || o.Character || o.character || "",
    scenario: o.scenario || o.Scenario || "",
    critical: Number(o.critical || o.Critical || 0),
    fumble: Number(o.fumble || o.Fumble || 0),
    inputter: o.inputter || o.Inputter || ""
  };
}

// ファイル読み込み共通処理
function handleCsvFile(file, mode = "append") {
  if (!file) {
    alert("CSVファイルを選択してください");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const text = e.target.result;
      const rows = parseCSV(text);
      const objs = rowsToObjects(rows);

      if (objs.length === 0) {
        alert("CSVにデータが見つかりませんでした");
        return;
      }

      const imported = objs.map(normalizeCsvObject).map(o => ({
        critical: isNaN(o.critical) ? 0 : o.critical,
        fumble: isNaN(o.fumble) ? 0 : o.fumble,
        character: o.character,
        scenario: o.scenario,
        date: o.date,
        time: o.time || new Date().toLocaleString(),
        inputter: o.inputter
      }));

      if (mode === "replace") {
        data = imported;
      } else {
        // append: 重複チェックは行わないが必要なら追加可能
        data = data.concat(imported);
      }

      save();
      updateMonthList();
      updateCharacterList();
      currentPage = 1;
      renderPage();

      alert(`CSVを${mode === "replace" ? "置換" : "追記"}で読み込みました。読み込み件数: ${imported.length}`);
    } catch (err) {
      console.error(err);
      alert("CSV読み込み中にエラーが発生しました");
    }
  };

  reader.onerror = function() {
    alert("ファイルの読み込みに失敗しました");
  };

  reader.readAsText(file, "UTF-8");
}

// ボタンに紐付け
csvAppendBtn.addEventListener("click", () => {
  const f = csvFileInput.files[0];
  handleCsvFile(f, "append");
});

csvReplaceBtn.addEventListener("click", () => {
  const f = csvFileInput.files[0];
  if (!f) {
    alert("CSVファイルを選択してください");
    return;
  }
  if (!confirm("既存データを置換してCSVを読み込みますか？ 元に戻せません。")) return;
  handleCsvFile(f, "replace");
});

/* ============================
   データ追加
   ============================ */

addBtn.addEventListener("click", () => {
  const aRaw = criticalEl.value.trim();
  const bRaw = fumbleEl.value.trim();

  if (aRaw === "" || bRaw === "") {
    alert("クリティカルとファンブルの両方に数値を入力してください");
    return;
  }

  const aNum = Number(aRaw);
  const bNum = Number(bRaw);

  if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
    alert("有効な数値を入力してください");
    return;
  }

  if (aNum < 0 || bNum < 0) {
    alert("負の数は入力できません");
    return;
  }

  const inputterName = inputterEl.value.trim();
  localStorage.setItem(INPUTTER_KEY, inputterName);

  const entry = {
    critical: aNum,
    fumble: bNum,
    character: charNameEl.value.trim(),
    scenario: scenarioEl.value.trim(),
    date: dateInput.value || "",
    time: new Date().toLocaleString(),
    inputter: inputterName
  };

  data.push(entry);
  save();

  // 月一覧更新
  updateMonthList();

  // キャラ一覧更新
  updateCharacterList();

  // ページを先頭に戻す
  currentPage = 1;

  // 再描画
  renderPage();

  // 入力欄リセット
  criticalEl.value = "0";
  fumbleEl.value = "0";
  charNameEl.value = "";
  scenarioEl.value = "";
});

//全クリア

const clearAllBtn = document.getElementById("clearAllBtn");

clearAllBtn.addEventListener("click", () => {
  if (!confirm("本当に全データを削除しますか？\nこの操作は元に戻せません。")) return;

  // データを空にする
  data = [];

  // 保存
  save();

  // 月一覧・キャラ一覧を更新
  updateMonthList();
  updateCharacterList();

  // ページを先頭に戻す
  currentPage = 1;

  // 再描画
  renderPage();

  alert("全データを削除しました");
});

/* ============================
   セルクリック（削除）
   ============================ */

function onCellClick(e) {
  const td = e.target.closest("td");
  if (!td) return;

  const idx = Number(td.dataset.globalIndex);
  if (Number.isNaN(idx)) return;

  const entry = data[idx];

  if (!confirm(
    `#${idx + 1} を削除しますか？\n` +
    `キャラ: ${entry.character || "(無名)"}\n` +
    `シナリオ: ${entry.scenario || ""}\n` +
    `日付: ${entry.date || "未入力"}\n` +
    `入力者: ${entry.inputter || "未設定"}`
  )) return;

  data.splice(idx, 1);
  save();

  updateMonthList();
  renderPage();
}

gridCritical.addEventListener("click", onCellClick);
gridFumble.addEventListener("click", onCellClick);

/* ============================
   ページング
   ============================ */

firstPageBtn.addEventListener("click", () => {
  currentPage = 1;
  renderPage();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) currentPage--;
  renderPage();
});

nextPageBtn.addEventListener("click", () => {
  currentPage++;
  renderPage();
});

lastPageBtn.addEventListener("click", () => {
  const filtered = getFilteredData();
  currentPage = Math.ceil(filtered.length / pageSize);
  renderPage();
});

jumpBtn.addEventListener("click", () => {
  const v = Number(jumpInput.value);
  if (!v || v < 1) return;

  const filtered = getFilteredData();
  const tp = Math.ceil(filtered.length / pageSize);

  currentPage = Math.min(tp, Math.max(1, v));
  renderPage();
});

/* ============================
   月変更
   ============================ */

monthSelect.addEventListener("change", () => {
  currentPage = 1;
  renderPage();
});

/* ============================
   グリッドサイズ変更
   ============================ */

applyGridBtn.addEventListener("click", () => {
  let r = Number(rowsInput.value);
  let c = Number(colsInput.value);

  r = Math.max(1, Math.min(MAX_ROWS, r));
  c = Math.max(1, Math.min(MAX_COLS, c));

  ROWS = r;
  COLS = c;

  // ★ ここが重要：同期チェックが ON のときは rows×cols を pageSize にする
  if (syncPageSize.checked) {
    pageSize = ROWS * COLS;
    pageSizeSelect.disabled = true;
  } else {
    pageSize = Number(pageSizeSelect.value);
    pageSizeSelect.disabled = false;
  }

  // グリッド再生成 → 再描画
  renderPage();
});

/* ============================
   CSV 出力
   ============================ */

function downloadCsv(rows, filename) {
  const header = [
    "index","time","date","character","scenario",
    "critical","fumble","inputter"
  ];

  const csv = [header, ...rows]
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

exportAllBtn.addEventListener("click", () => {
  if (data.length === 0) {
    alert("データがありません");
    return;
  }

  const rows = data.map((d, i) => [
    i + 1, d.time, d.date, d.character, d.scenario,
    d.critical, d.fumble, d.inputter
  ]);

  downloadCsv(rows, "crit_fumble_all.csv");
});

exportPageBtn.addEventListener("click", () => {
  const filtered = getFilteredData();

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(filtered.length, start + pageSize);

  if (start >= end) {
    alert("このページにデータがありません");
    return;
  }

  const rows = filtered.slice(start, end).map((d, idx) => [
    start + idx + 1, d.time, d.date, d.character, d.scenario,
    d.critical, d.fumble, d.inputter
  ]);

  downloadCsv(rows, `crit_fumble_page${currentPage}.csv`);
});

/* ============================
   保存・読み込み
   ============================ */

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ============================
   初期化
   ============================ */

// 今日の日付
(function initDate() {
  const today = new Date();
  dateInput.value =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
})();

// 入力者復元
(function initInputter() {
  const saved = localStorage.getItem(INPUTTER_KEY);
  if (saved) {
    inputterEl.value = saved;
    updateInputterDisplay(saved);
  }
})();

// 月一覧生成
updateMonthList();
updateCharacterList();

// 初期ページサイズ
pageSize = ROWS * COLS;
pageSizeSelect.disabled = true;

// 初回描画
renderPage();


document.getElementById('saveImageBtn').addEventListener('click', async () => {
  const area = document.getElementById('captureArea');
  if (!area) { alert('キャプチャ領域が見つかりません'); return; }

  // オプション: scale を上げると高解像度になるがメモリを使う
  const options = {
    backgroundColor: '#000000', // 背景色を白にする
    scale: 2,                   // 画像解像度を2倍にする
    useCORS: true               // 外部画像がある場合にCORSを試みる
  };

  try {
    const canvas = await html2canvas(area, options);
    // PNG データURL を作成
    const dataUrl = canvas.toDataURL('image/png');

    // ダウンロード用リンクを作ってクリック
    const a = document.createElement('a');
    a.href = dataUrl;
    // ファイル名にページ番号や日時を付ける
    const now = new Date();
    const filename = `crit_fumble_page${currentPage || 1}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.png`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error('画像化でエラー', err);
    alert('画像化に失敗しました。Consoleを確認してください。');
  }
});
