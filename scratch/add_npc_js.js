const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// Use regex with CRLF/LF flexibility
const targetRegex = /actionsDiv\.appendChild\(delBtn\);\r?\n\s*actionsDiv\.appendChild\(dragHandle\);/;

const replaceStr = `// Copy Ccfolia piece JSON button (for both Explorer and NPC)
  const copyJsonBtn = document.createElement("button");
  copyJsonBtn.className = "char-action-btn btn-copy-json";
  copyJsonBtn.title = isNpc ? "NPCのココフォリア駒JSONをコピー（ココフォリアへ貼り付け可能）" : "ココフォリア駒JSONをコピー";
  copyJsonBtn.innerHTML = \`<i data-lucide="copy" class="w-3.5 h-3.5"></i>\`;
  copyJsonBtn.onclick = (e) => {
    e.stopPropagation();
    if (isNpc) {
      copyNpcCcfoliaJson(index);
    } else {
      copyExplorerCcfoliaJson(index);
    }
  };
  actionsDiv.appendChild(copyJsonBtn);

  // If NPC, allow editing all stats/skills in modal
  if (isNpc) {
    const editBtn = document.createElement("button");
    editBtn.className = "char-action-btn btn-edit";
    editBtn.title = "NPCの能力値・技能・ステータスを編集";
    editBtn.innerHTML = \`<i data-lucide="edit-3" class="w-3.5 h-3.5"></i>\`;
    editBtn.onclick = (e) => {
      e.stopPropagation();
      openNpcEditorModal(index);
    };
    actionsDiv.appendChild(editBtn);
  }

  actionsDiv.appendChild(delBtn);
  actionsDiv.appendChild(dragHandle);`;

if (!targetRegex.test(html)) {
  console.error("targetRegex not found!");
  process.exit(1);
}

html = html.replace(targetRegex, replaceStr);

// Add JS Logic before window.onload
const jsLogicToAdd = `
// ==========================================
// NPC 手動入力・編集 & ココフォリア駒JSON生成ロジック
// ==========================================
let npcModalSkillRows = [];

function openNpcEditorModal(editIndex = -1) {
  const modal = document.getElementById("npc-editor-modal");
  const title = document.getElementById("npc-modal-title");
  const saveBtnText = document.getElementById("npc-modal-save-btn-text");
  const editIndexInput = document.getElementById("npc-form-edit-index");
  if (!modal) return;

  editIndexInput.value = editIndex;
  npcModalSkillRows = [];

  if (editIndex >= 0 && editIndex < npcCharacters.length) {
    const char = npcCharacters[editIndex];
    title.textContent = \`NPC編集: \${char.name}\`;
    saveBtnText.textContent = "変更を保存";

    document.getElementById("npc-form-version").value = char.is7th ? "7" : "6";
    document.getElementById("npc-form-name").value = char.name || "";
    document.getElementById("npc-form-ho").value = char.ho || "";
    document.getElementById("npc-form-furigana").value = char.furigana || "";

    document.getElementById("npc-form-hp").value = char.resources.hp !== "-" ? char.resources.hp : "";
    document.getElementById("npc-form-mp").value = char.resources.mp !== "-" ? char.resources.mp : "";
    document.getElementById("npc-form-san").value = char.resources.san !== "-" ? char.resources.san : "";
    document.getElementById("npc-form-db").value = char.resources.db !== "-" ? char.resources.db : "";

    const abs = char.abilities || {};
    document.getElementById("npc-form-str").value = abs.STR !== "-" ? abs.STR : "";
    document.getElementById("npc-form-con").value = abs.CON !== "-" ? abs.CON : "";
    document.getElementById("npc-form-pow").value = abs.POW !== "-" ? abs.POW : "";
    document.getElementById("npc-form-dex").value = abs.DEX !== "-" ? abs.DEX : "";
    document.getElementById("npc-form-app").value = abs.APP !== "-" ? abs.APP : "";
    document.getElementById("npc-form-siz").value = abs.SIZ !== "-" ? abs.SIZ : "";
    document.getElementById("npc-form-int").value = abs.INT !== "-" ? abs.INT : "";
    document.getElementById("npc-form-edu").value = abs.EDU !== "-" ? abs.EDU : "";

    document.getElementById("npc-form-bld").value = char.bld !== undefined ? char.bld : "";
    document.getElementById("npc-form-mov").value = char.mov !== undefined ? char.mov : "";

    const bc = char.basicChecks || {};
    document.getElementById("npc-form-idea").value = bc.idea !== undefined ? bc.idea : "";
    document.getElementById("npc-form-luck").value = bc.luck !== undefined ? bc.luck : "";
    document.getElementById("npc-form-know").value = bc.know !== undefined ? bc.know : "";

    document.getElementById("npc-form-memo").value = char.memo || "";

    if (Array.isArray(char.skills)) {
      npcModalSkillRows = char.skills.map(s => ({ name: s.name, val: s.value }));
    }
  } else {
    title.textContent = "NPC手動登録";
    saveBtnText.textContent = "NPCを登録";

    document.getElementById("npc-form-version").value = "6";
    document.getElementById("npc-form-name").value = "";
    document.getElementById("npc-form-ho").value = "";
    document.getElementById("npc-form-furigana").value = "";

    document.getElementById("npc-form-hp").value = "";
    document.getElementById("npc-form-mp").value = "";
    document.getElementById("npc-form-san").value = "";
    document.getElementById("npc-form-db").value = "";

    document.getElementById("npc-form-str").value = "";
    document.getElementById("npc-form-con").value = "";
    document.getElementById("npc-form-pow").value = "";
    document.getElementById("npc-form-dex").value = "";
    document.getElementById("npc-form-app").value = "";
    document.getElementById("npc-form-siz").value = "";
    document.getElementById("npc-form-int").value = "";
    document.getElementById("npc-form-edu").value = "";

    document.getElementById("npc-form-bld").value = "";
    document.getElementById("npc-form-mov").value = "";

    document.getElementById("npc-form-idea").value = "";
    document.getElementById("npc-form-luck").value = "";
    document.getElementById("npc-form-know").value = "";

    document.getElementById("npc-form-memo").value = "";

    // Default common skills for quick setup
    npcModalSkillRows = [
      { name: "目星", val: 50 },
      { name: "聞き耳", val: 50 },
      { name: "図書館", val: 50 }
    ];
  }

  handleNpcModalVersionChange();
  renderNpcModalSkills();
  calculateNpcModalValues();

  modal.classList.add("is-open");
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons({ root: modal });
  }
  setTimeout(() => {
    document.getElementById("npc-form-name").focus();
  }, 100);
}

function closeNpcEditorModal() {
  const modal = document.getElementById("npc-editor-modal");
  if (modal) modal.classList.remove("is-open");
}

function handleNpcModalVersionChange() {
  const version = document.getElementById("npc-form-version").value;
  const extra7th = document.getElementById("npc-7th-extra-fields");
  const hint = document.getElementById("npc-ability-hint");
  if (version === "7") {
    if (extra7th) {
      extra7th.classList.remove("hidden");
      extra7th.classList.add("grid");
    }
    if (hint) hint.textContent = "7版: 1〜100目安 (5倍値)";
  } else {
    if (extra7th) {
      extra7th.classList.add("hidden");
      extra7th.classList.remove("grid");
    }
    if (hint) hint.textContent = "6版: 3〜18目安";
  }
  calculateNpcModalValues();
}

function calculateNpcModalValues() {
  const version = document.getElementById("npc-form-version").value;
  const is7th = version === "7";

  const getNum = (id) => {
    const v = parseInt(document.getElementById(id)?.value, 10);
    return Number.isNaN(v) ? null : v;
  };

  const str = getNum("npc-form-str");
  const con = getNum("npc-form-con");
  const pow = getNum("npc-form-pow");
  const dex = getNum("npc-form-dex");
  const app = getNum("npc-form-app");
  const siz = getNum("npc-form-siz");
  const intVal = getNum("npc-form-int");
  const edu = getNum("npc-form-edu");

  // HP Auto Calculation
  const hpInput = document.getElementById("npc-form-hp");
  if (con !== null && siz !== null) {
    if (is7th) {
      hpInput.placeholder = \`自動: \${Math.floor((con + siz) / 10)}\`;
    } else {
      hpInput.placeholder = \`自動: \${Math.ceil((con + siz) / 2)}\`;
    }
  } else {
    hpInput.placeholder = "自動";
  }

  // MP Auto Calculation
  const mpInput = document.getElementById("npc-form-mp");
  if (pow !== null) {
    mpInput.placeholder = \`自動: \${is7th ? Math.floor(pow / 5) : pow}\`;
  } else {
    mpInput.placeholder = "自動";
  }

  // SAN Auto Calculation
  const sanInput = document.getElementById("npc-form-san");
  if (pow !== null) {
    sanInput.placeholder = \`自動: \${is7th ? pow : pow * 5}\`;
  } else {
    sanInput.placeholder = "自動";
  }

  // DB Auto Calculation
  const dbInput = document.getElementById("npc-form-db");
  if (str !== null && siz !== null) {
    const total = str + siz;
    let calcDb = "+0";
    if (is7th) {
      if (total <= 64) calcDb = "-2";
      else if (total <= 84) calcDb = "-1";
      else if (total <= 124) calcDb = "+0";
      else if (total <= 164) calcDb = "+1D4";
      else if (total <= 204) calcDb = "+1D6";
      else if (total <= 284) calcDb = "+2D6";
      else if (total <= 364) calcDb = "+3D6";
      else if (total <= 444) calcDb = "+4D6";
      else if (total <= 524) calcDb = "+5D6";
    } else {
      if (total <= 12) calcDb = "-1D6";
      else if (total <= 16) calcDb = "-1D4";
      else if (total <= 24) calcDb = "+0";
      else if (total <= 32) calcDb = "+1D4";
      else if (total <= 40) calcDb = "+1D6";
      else if (total <= 56) calcDb = "+2D6";
      else if (total <= 72) calcDb = "+3D6";
      else if (total <= 88) calcDb = "+4D6";
    }
    dbInput.placeholder = \`自動: \${calcDb}\`;
  } else {
    dbInput.placeholder = "自動";
  }

  // 7th BLD & MOV Auto Calculation
  if (is7th) {
    const bldInput = document.getElementById("npc-form-bld");
    const movInput = document.getElementById("npc-form-mov");
    if (str !== null && siz !== null) {
      const total = str + siz;
      let calcBld = "0";
      if (total <= 64) calcBld = "-2";
      else if (total <= 84) calcBld = "-1";
      else if (total <= 124) calcBld = "0";
      else if (total <= 164) calcBld = "+1";
      else if (total <= 204) calcBld = "+2";
      else if (total <= 284) calcBld = "+3";
      else if (total <= 364) calcBld = "+4";
      else if (total <= 444) calcBld = "+5";
      else if (total <= 524) calcBld = "+6";
      if (!bldInput.value) bldInput.placeholder = calcBld;
    }
    if (str !== null && dex !== null && siz !== null) {
      let calcMov = "8";
      if (dex < siz && str < siz) calcMov = "7";
      else if (dex > siz && str > siz) calcMov = "9";
      else calcMov = "8";
      if (!movInput.value) movInput.placeholder = calcMov;
    }
  }

  // Basic Checks (アイデア, 幸運, 知識)
  const ideaInput = document.getElementById("npc-form-idea");
  const luckInput = document.getElementById("npc-form-luck");
  const knowInput = document.getElementById("npc-form-know");

  if (intVal !== null) {
    ideaInput.placeholder = \`自動: \${is7th ? intVal : intVal * 5}\`;
  } else {
    ideaInput.placeholder = "自動";
  }

  if (pow !== null) {
    luckInput.placeholder = \`自動: \${is7th ? pow : pow * 5}\`;
  } else {
    luckInput.placeholder = "自動";
  }

  if (edu !== null) {
    knowInput.placeholder = \`自動: \${is7th ? edu : edu * 5}\`;
  } else {
    knowInput.placeholder = "自動";
  }
}

function renderNpcModalSkills() {
  const container = document.getElementById("npc-form-skills-list");
  if (!container) return;
  container.innerHTML = "";

  if (npcModalSkillRows.length === 0) {
    container.innerHTML = \`<div class="text-center py-3 text-slate-400 text-xs">登録されている技能はありません。「技能を追加」から登録できます。</div>\`;
    return;
  }

  npcModalSkillRows.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "npc-skill-row";
    row.innerHTML = \`
      <input type="text" class="npc-form-input text-xs" style="flex: 2;" placeholder="技能名 (例: 目星, こぶし)" value="\${escapeHtml(s.name || "")}" oninput="npcModalSkillRows[\${idx}].name = this.value">
      <input type="number" class="npc-form-input text-xs text-center font-bold" style="flex: 1;" placeholder="技能値" value="\${s.val !== undefined ? s.val : ""}" oninput="npcModalSkillRows[\${idx}].val = parseInt(this.value, 10) || 0">
      <button type="button" onclick="removeNpcModalSkillRow(\${idx})" class="text-slate-400 hover:text-rose-500 p-1.5 rounded-md transition-colors flex-shrink-0" title="削除">
        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      </button>
    \`;
    container.appendChild(row);
  });

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons({ root: container });
  }
}

function addNpcModalSkillRow() {
  npcModalSkillRows.push({ name: "", val: 50 });
  renderNpcModalSkills();
  const inputs = document.querySelectorAll("#npc-form-skills-list input");
  if (inputs.length > 0) {
    inputs[inputs.length - 2]?.focus();
  }
}

function removeNpcModalSkillRow(idx) {
  npcModalSkillRows.splice(idx, 1);
  renderNpcModalSkills();
}

function saveNpcFromModal() {
  const name = document.getElementById("npc-form-name").value.trim();
  if (!name) {
    showToast("入力エラー", "NPCの名前を入力してください。", "error");
    document.getElementById("npc-form-name").focus();
    return;
  }

  const is7th = document.getElementById("npc-form-version").value === "7";
  const ho = document.getElementById("npc-form-ho").value.trim();
  const furigana = document.getElementById("npc-form-furigana").value.trim();
  const memo = document.getElementById("npc-form-memo").value.trim();

  const getNumVal = (id) => {
    const v = parseInt(document.getElementById(id)?.value, 10);
    return Number.isNaN(v) ? "-" : v;
  };

  const abilities = {
    STR: getNumVal("npc-form-str"),
    CON: getNumVal("npc-form-con"),
    POW: getNumVal("npc-form-pow"),
    DEX: getNumVal("npc-form-dex"),
    APP: getNumVal("npc-form-app"),
    SIZ: getNumVal("npc-form-siz"),
    INT: getNumVal("npc-form-int"),
    EDU: getNumVal("npc-form-edu")
  };

  // Resources
  let hpVal = document.getElementById("npc-form-hp").value.trim();
  if (!hpVal && abilities.CON !== "-" && abilities.SIZ !== "-") {
    hpVal = is7th ? Math.floor((abilities.CON + abilities.SIZ) / 10) : Math.ceil((abilities.CON + abilities.SIZ) / 2);
  }
  hpVal = hpVal ? (isNaN(hpVal) ? hpVal : Number(hpVal)) : "-";

  let mpVal = document.getElementById("npc-form-mp").value.trim();
  if (!mpVal && abilities.POW !== "-") {
    mpVal = is7th ? Math.floor(abilities.POW / 5) : abilities.POW;
  }
  mpVal = mpVal ? (isNaN(mpVal) ? mpVal : Number(mpVal)) : "-";

  let sanVal = document.getElementById("npc-form-san").value.trim();
  if (!sanVal && abilities.POW !== "-") {
    sanVal = is7th ? abilities.POW : abilities.POW * 5;
  }
  sanVal = sanVal ? (isNaN(sanVal) ? sanVal : Number(sanVal)) : "-";

  let dbVal = document.getElementById("npc-form-db").value.trim();
  if (!dbVal && abilities.STR !== "-" && abilities.SIZ !== "-") {
    dbVal = readDamageBonus([], "", abilities, is7th);
  }
  dbVal = dbVal || "-";

  let bldVal = undefined;
  let movVal = undefined;
  if (is7th) {
    bldVal = document.getElementById("npc-form-bld").value.trim();
    if (!bldVal && abilities.STR !== "-" && abilities.SIZ !== "-") {
      const total = abilities.STR + abilities.SIZ;
      if (total <= 64) bldVal = "-2";
      else if (total <= 84) bldVal = "-1";
      else if (total <= 124) bldVal = "0";
      else if (total <= 164) bldVal = "+1";
      else if (total <= 204) bldVal = "+2";
      else if (total <= 284) bldVal = "+3";
      else if (total <= 364) bldVal = "+4";
      else if (total <= 444) bldVal = "+5";
      else if (total <= 524) bldVal = "+6";
    }
    movVal = document.getElementById("npc-form-mov").value.trim();
    if (!movVal && abilities.STR !== "-" && abilities.DEX !== "-" && abilities.SIZ !== "-") {
      if (abilities.DEX < abilities.SIZ && abilities.STR < abilities.SIZ) movVal = "7";
      else if (abilities.DEX > abilities.SIZ && abilities.STR > abilities.SIZ) movVal = "9";
      else movVal = "8";
    }
  }

  // Basic checks
  let ideaVal = document.getElementById("npc-form-idea").value.trim();
  if (!ideaVal && abilities.INT !== "-") {
    ideaVal = is7th ? abilities.INT : abilities.INT * 5;
  }
  let luckVal = document.getElementById("npc-form-luck").value.trim();
  if (!luckVal && abilities.POW !== "-") {
    luckVal = is7th ? abilities.POW : abilities.POW * 5;
  }
  let knowVal = document.getElementById("npc-form-know").value.trim();
  if (!knowVal && abilities.EDU !== "-") {
    knowVal = is7th ? abilities.EDU : abilities.EDU * 5;
  }

  const basicChecks = {
    idea: ideaVal !== "" ? Number(ideaVal) : undefined,
    luck: luckVal !== "" ? Number(luckVal) : undefined,
    know: knowVal !== "" ? Number(knowVal) : undefined
  };

  // Filter skills
  const validSkills = npcModalSkillRows
    .filter(s => s && s.name && s.name.trim().length > 0)
    .map(s => ({
      name: s.name.trim(),
      value: parseInt(s.val, 10) || 0,
      command: \`\${is7th ? "CC" : "CCB"}<=\${parseInt(s.val, 10) || 0} 【\${s.name.trim()}】\`
    }));

  // Build commands
  const prefix = is7th ? "CC" : "CCB";
  let cmdLines = [];
  if (sanVal !== "-") cmdLines.push(\`\${prefix}<=\${sanVal} 【正気度ロール】\`);
  if (basicChecks.idea !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.idea} 【アイデア】\`);
  if (basicChecks.luck !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.luck} 【幸運】\`);
  if (basicChecks.know !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.know} 【知識】\`);

  validSkills.forEach(s => {
    cmdLines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
  });

  const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
  absOrder.forEach(k => {
    if (abilities[k] !== "-") {
      const v = is7th ? abilities[k] : abilities[k] * 5;
      cmdLines.push(\`\${prefix}<=\${v} 【\${k}\${is7th ? "" : "*5"}】\`);
    }
  });

  const editIndex = parseInt(document.getElementById("npc-form-edit-index").value, 10);
  const npcObj = {
    id: editIndex >= 0 && npcCharacters[editIndex]?.id ? npcCharacters[editIndex].id : Date.now() + Math.floor(Math.random() * 10000),
    name: name,
    furigana: furigana,
    portrait: editIndex >= 0 ? (npcCharacters[editIndex]?.portrait || "") : "",
    externalUrl: editIndex >= 0 ? (npcCharacters[editIndex]?.externalUrl || "") : "",
    memo: memo,
    ho: ho,
    is7th: is7th,
    bld: bldVal,
    mov: movVal,
    commands: cmdLines.join("\\n"),
    resources: {
      hp: hpVal,
      mp: mpVal,
      san: sanVal,
      db: dbVal
    },
    abilities: abilities,
    basicChecks: basicChecks,
    skills: sortSkills(validSkills)
  };

  if (editIndex >= 0 && editIndex < npcCharacters.length) {
    npcCharacters[editIndex] = npcObj;
    showToast("更新完了", \`NPC「\${name}」のデータを更新しました。\`, "success");
  } else {
    npcCharacters.push(npcObj);
    showToast("登録完了", \`NPC「\${name}」を登録しました。\`, "success");
  }

  closeNpcEditorModal();
  renderNpcCards();
}

// ==========================================
// ココフォリア駒JSON生成 & クリップボードコピー
// ==========================================
function generateCcfoliaPieceJson(char) {
  const status = [];
  const res = char.resources || {};

  if (res.hp !== undefined && res.hp !== "-") {
    const v = Number(res.hp) || 0;
    status.push({ label: "HP", value: v, max: v });
  }
  if (res.mp !== undefined && res.mp !== "-") {
    const v = Number(res.mp) || 0;
    status.push({ label: "MP", value: v, max: v });
  }
  if (res.san !== undefined && res.san !== "-") {
    const v = Number(res.san) || 0;
    status.push({ label: "SAN", value: v, max: v });
  }
  if (res.db !== undefined && res.db !== "-") {
    status.push({ label: "DB", value: String(res.db), max: String(res.db) });
  }

  const params = [];
  const abs = char.abilities || {};
  ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"].forEach(k => {
    if (abs[k] !== undefined && abs[k] !== "-") {
      params.push({ label: k, value: String(abs[k]) });
    }
  });

  if (char.is7th) {
    if (char.bld !== undefined && char.bld !== "") {
      params.push({ label: "BLD", value: String(char.bld) });
    }
    if (char.mov !== undefined && char.mov !== "") {
      params.push({ label: "MOV", value: String(char.mov) });
    }
  }

  let commands = char.commands || "";
  if (!commands) {
    const prefix = char.is7th ? "CC" : "CCB";
    const lines = [];
    if (res.san !== undefined && res.san !== "-") lines.push(\`\${prefix}<=\${res.san} 【正気度ロール】\`);
    if (char.basicChecks?.idea) lines.push(\`\${prefix}<=\${char.basicChecks.idea} 【アイデア】\`);
    if (char.basicChecks?.luck) lines.push(\`\${prefix}<=\${char.basicChecks.luck} 【幸運】\`);
    if (char.basicChecks?.know) lines.push(\`\${prefix}<=\${char.basicChecks.know} 【知識】\`);
    if (Array.isArray(char.skills)) {
      char.skills.forEach(s => {
        lines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
      });
    }
    commands = lines.join("\\n");
  }

  const piece = {
    kind: "character",
    data: {
      name: char.furigana ? \`\${char.name} (\${char.furigana})\` : char.name,
      memo: char.memo || "",
      initiative: abs.DEX !== undefined && abs.DEX !== "-" ? Number(abs.DEX) : 0,
      externalUrl: char.externalUrl || "",
      iconUrl: char.portrait || "",
      status: status,
      params: params,
      commands: commands
    }
  };

  return JSON.stringify(piece, null, 2);
}

function copyNpcCcfoliaJson(index) {
  if (index >= 0 && index < npcCharacters.length) {
    const char = npcCharacters[index];
    const jsonStr = generateCcfoliaPieceJson(char);
    copyText(jsonStr, \`NPC「\${char.name}」のココフォリア駒JSON\`);
    showToast("ココフォリア駒コピー", \`「\${char.name}」の駒データをクリップボードにコピーしました！ココフォリア画面で Ctrl+V すると駒が作成されます。\`, "success");
  }
}

function copyExplorerCcfoliaJson(index) {
  if (index >= 0 && index < explorerCharacters.length) {
    const char = explorerCharacters[index];
    const jsonStr = generateCcfoliaPieceJson(char);
    copyText(jsonStr, \`「\${char.name}」のココフォリア駒JSON\`);
    showToast("ココフォリア駒コピー", \`「\${char.name}」の駒データをクリップボードにコピーしました！ココフォリア画面で Ctrl+V すると駒が作成されます。\`, "success");
  }
}
`;

html = html.replace('window.onload=function(){', jsLogicToAdd + '\nwindow.onload=function(){');

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully updated JavaScript in PdfEasyConverter.html');
