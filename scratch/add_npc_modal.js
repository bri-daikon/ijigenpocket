const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// 1. CSS for NPC Editor Modal and Card Actions
const cssToInsert = `
    /* NPC手動登録・編集モーダル & カードアクション */
    .char-action-btn.btn-copy-json:hover {
      color: #4f46e5;
      border-color: #c7d2fe;
      background: #eef2ff;
    }
    .char-action-btn.btn-edit:hover {
      color: #0d9488;
      border-color: #99f6e4;
      background: #f0fdfa;
    }

    .npc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .npc-modal-backdrop.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .npc-modal-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.95);
      transition: transform 0.2s ease;
      border: 1px solid #e2e8f0;
    }

    .npc-modal-backdrop.is-open .npc-modal-card {
      transform: scale(1);
    }

    .npc-modal-header {
      padding: 14px 20px;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .npc-modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .npc-modal-footer {
      padding: 12px 20px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }

    .npc-form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .npc-form-label {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .npc-form-input, .npc-form-select, .npc-form-textarea {
      width: 100%;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      color: #1e293b;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }

    .npc-form-input:focus, .npc-form-select:focus, .npc-form-textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .npc-auto-badge {
      font-size: 10px;
      background: #e0e7ff;
      color: #4338ca;
      padding: 1px 6px;
      border-radius: 9999px;
      font-weight: 700;
    }

    .npc-skill-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ダークモード対応 */
    body[data-theme="dark"] .npc-modal-card {
      background: #1e293b !important;
      border-color: #334155 !important;
    }
    body[data-theme="dark"] .npc-modal-footer {
      background: #0f172a !important;
      border-color: #334155 !important;
    }
    body[data-theme="dark"] .npc-form-label {
      color: #94a3b8 !important;
    }
    body[data-theme="dark"] .npc-form-input,
    body[data-theme="dark"] .npc-form-select,
    body[data-theme="dark"] .npc-form-textarea {
      background: #0f172a !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    body[data-theme="dark"] .npc-auto-badge {
      background: rgba(99, 102, 241, 0.25) !important;
      color: #a5b4fc !important;
    }
  </style>`;

html = html.replace('  </style>', cssToInsert);

// 2. Add "NPCを手動追加" button to NPC toolbar and Empty state
const oldNpcToolbar = `<div class="flex items-center gap-2">
            <label class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5" title="NPCのココフォリア駒JSONファイルを選択">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i>
              NPC駒JSON読込
              <input type="file" id="npc-json-input" accept=".json, application/json" class="hidden" onchange="handleNpcFileSelect(event)" multiple>
            </label>
            <span class="text-[11px] text-slate-400">※画面へのD&Dやクリップボード貼り付け（Ctrl+V）にも対応</span>
          </div>`;

const newNpcToolbar = `<div class="flex items-center gap-2 flex-wrap">
            <button type="button" onclick="openNpcEditorModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5" title="NPCの能力値や技能を手入力して追加">
              <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
              NPCを手動追加
            </button>
            <label class="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5" title="NPCのココフォリア駒JSONファイルを選択">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i>
              NPC駒JSON読込
              <input type="file" id="npc-json-input" accept=".json, application/json" class="hidden" onchange="handleNpcFileSelect(event)" multiple>
            </label>
            <span class="text-[11px] text-slate-400">※画面へのD&Dやクリップボード貼り付け（Ctrl+V）にも対応</span>
          </div>`;

html = html.replace(oldNpcToolbar, newNpcToolbar);

const oldNpcEmpty = `<label class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5 mt-2">
              <i data-lucide="file-code" class="w-4 h-4"></i>
              ファイルから読み込む
              <input type="file" accept=".json, application/json" class="hidden" onchange="handleNpcFileSelect(event)" multiple>
            </label>`;

const newNpcEmpty = `<div class="flex items-center gap-2 mt-2 flex-wrap justify-center">
              <button type="button" onclick="openNpcEditorModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                NPCを手動作成
              </button>
              <label class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5">
                <i data-lucide="file-code" class="w-4 h-4"></i>
                ファイルから読み込む
                <input type="file" accept=".json, application/json" class="hidden" onchange="handleNpcFileSelect(event)" multiple>
              </label>
            </div>`;

html = html.replace(oldNpcEmpty, newNpcEmpty);

// 3. Add Modal HTML before </body>
const modalHtml = `
  <!-- NPC手動入力・編集モーダル -->
  <div id="npc-editor-modal" class="npc-modal-backdrop" onclick="if(event.target===this) closeNpcEditorModal()">
    <div class="npc-modal-card" onclick="event.stopPropagation()">
      <div class="npc-modal-header">
        <div class="flex items-center gap-2 font-bold text-sm">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span id="npc-modal-title">NPC手動登録 / 編集</span>
        </div>
        <button type="button" onclick="closeNpcEditorModal()" class="text-white/80 hover:text-white p-1 rounded-md transition-colors" title="閉じる">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <div class="npc-modal-body">
        <input type="hidden" id="npc-form-edit-index" value="-1">

        <!-- 基本情報（版、名前、HO、ふりがな） -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="npc-form-group sm:col-span-1">
            <label class="npc-form-label">システム (版)</label>
            <select id="npc-form-version" class="npc-form-select font-bold" onchange="handleNpcModalVersionChange()">
              <option value="6">クトゥルフ 6版</option>
              <option value="7">新クトゥルフ 7版</option>
            </select>
          </div>
          <div class="npc-form-group sm:col-span-2">
            <label class="npc-form-label">NPC名前 <span class="text-rose-500 font-bold">*必須</span></label>
            <input type="text" id="npc-form-name" class="npc-form-input font-bold" placeholder="例: 案内人の老人" oninput="calculateNpcModalValues()">
          </div>
          <div class="npc-form-group sm:col-span-1">
            <label class="npc-form-label">役職 / HO</label>
            <input type="text" id="npc-form-ho" class="npc-form-input" placeholder="例: HO案内人">
          </div>
          <div class="npc-form-group sm:col-span-4">
            <label class="npc-form-label">ふりがな</label>
            <input type="text" id="npc-form-furigana" class="npc-form-input" placeholder="例: あんないにんのろうじん">
          </div>
        </div>

        <!-- リソース (HP, MP, SAN, DB) -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>主要リソース</span>
            <span class="text-[10px] text-slate-400 font-normal">※能力値から自動算出（直接変更も可能）</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="npc-form-group">
              <label class="npc-form-label"><span class="text-rose-600 font-bold">HP (耐久力)</span></label>
              <input type="text" id="npc-form-hp" class="npc-form-input text-center font-bold text-rose-700" placeholder="自動">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label"><span class="text-purple-600 font-bold">MP (マジック)</span></label>
              <input type="text" id="npc-form-mp" class="npc-form-input text-center font-bold text-purple-700" placeholder="自動">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label"><span class="text-teal-600 font-bold">SAN (正気度)</span></label>
              <input type="text" id="npc-form-san" class="npc-form-input text-center font-bold text-teal-700" placeholder="自動">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label"><span class="text-slate-600 font-bold">DB (ダメージボーナス)</span></label>
              <input type="text" id="npc-form-db" class="npc-form-input text-center font-bold text-slate-700" placeholder="自動 (例: +1D4)">
            </div>
          </div>
        </div>

        <!-- 基本能力値 (STR, CON, POW, DEX, APP, SIZ, INT, EDU, 7版: BLD, MOV) -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>基本能力値</span>
            <span class="text-[10px] text-indigo-600 font-bold" id="npc-ability-hint">6版: 3〜18目安 / 7版: 1〜100目安</span>
          </div>
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">STR</label>
              <input type="number" id="npc-form-str" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">CON</label>
              <input type="number" id="npc-form-con" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">POW</label>
              <input type="number" id="npc-form-pow" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">DEX</label>
              <input type="number" id="npc-form-dex" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">APP</label>
              <input type="number" id="npc-form-app" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">SIZ</label>
              <input type="number" id="npc-form-siz" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">INT</label>
              <input type="number" id="npc-form-int" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">EDU</label>
              <input type="number" id="npc-form-edu" class="npc-form-input text-center font-bold" oninput="calculateNpcModalValues()">
            </div>
          </div>

          <!-- 7版専用項目 (BLD, MOV) -->
          <div id="npc-7th-extra-fields" class="hidden grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200">
            <div class="npc-form-group">
              <label class="npc-form-label">BLD (ビルド) <span class="npc-auto-badge">自動計算</span></label>
              <input type="text" id="npc-form-bld" class="npc-form-input text-center font-bold" placeholder="0">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label">MOV (移動率) <span class="npc-auto-badge">自動計算</span></label>
              <input type="text" id="npc-form-mov" class="npc-form-input text-center font-bold" placeholder="8">
            </div>
          </div>
        </div>

        <!-- 基本判定 (アイデア, 幸運, 知識) - 自動計算プレビュー & 上書き -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>基本判定 (自動計算)</span>
            <span class="text-[10px] text-slate-400 font-normal">※能力値から自動算出されます（必要に応じて変更可能）</span>
          </div>
          <div class="grid grid-cols-3 gap-2.5">
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">アイデア</label>
              <input type="number" id="npc-form-idea" class="npc-form-input text-center font-bold text-slate-700" placeholder="自動">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">幸運</label>
              <input type="number" id="npc-form-luck" class="npc-form-input text-center font-bold text-slate-700" placeholder="自動">
            </div>
            <div class="npc-form-group">
              <label class="npc-form-label justify-center">知識</label>
              <input type="number" id="npc-form-know" class="npc-form-input text-center font-bold text-slate-700" placeholder="自動">
            </div>
          </div>
        </div>

        <!-- 技能リスト (+ボタンで追加) -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-700">技能設定</span>
            <button type="button" onclick="addNpcModalSkillRow()" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md transition-all flex items-center gap-1 shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              技能を追加
            </button>
          </div>
          <div id="npc-form-skills-list" class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <!-- 動的生成 -->
          </div>
        </div>

        <!-- メモ（自由入力） -->
        <div class="npc-form-group">
          <label class="npc-form-label">メモ・設定・備考（自由入力）</label>
          <textarea id="npc-form-memo" rows="3" class="npc-form-textarea" placeholder="NPCの特徴、秘密、設定、所持品などを記入..."></textarea>
        </div>
      </div>

      <div class="npc-modal-footer">
        <button type="button" onclick="closeNpcEditorModal()" class="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
          キャンセル
        </button>
        <button type="button" onclick="saveNpcFromModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4"></i>
          <span id="npc-modal-save-btn-text">NPCを登録</span>
        </button>
      </div>
    </div>
  </div>
`;

html = html.replace('  <!-- フッター -->', modalHtml + '\n  <!-- フッター -->');

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully added CSS and Modal HTML');
