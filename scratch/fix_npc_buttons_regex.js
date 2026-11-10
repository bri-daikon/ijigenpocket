const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

const toolbarRegex = /<div id="npc-toolbar"[\s\S]*?<div class="flex items-center gap-2">[\s\S]*?<input type="file" id="npc-json-input" accept="\.json, application\/json" class="hidden" onchange="handleNpcFileSelect\(event\)" multiple>[\s\S]*?<\/label>[\s\S]*?<\/div>/;

const newToolbarLeft = `<div id="npc-toolbar"
          class="hidden flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-50 transition-all duration-300">
          <div class="flex items-center gap-2 flex-wrap">
            <button type="button" id="btn-add-npc-toolbar" onclick="openNpcEditorModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5" title="NPCの能力値や技能を手入力して追加">
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

const emptyRegex = /<div id="npc-empty-state"[\s\S]*?<div id="npc-empty-state"[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const oldEmptyFullRegex = /<div id="npc-empty-state" class="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50\/50 mt-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newEmptyFull = `<div id="npc-empty-state" class="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 mt-2">
            <i data-lucide="user-check" class="w-12 h-12 text-indigo-500/50"></i>
            <div class="max-w-md">
              <h3 class="font-bold text-slate-700 text-sm mb-1">NPCデータがまだありません</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                キャラクターシートが無くても「NPCを手動作成」から能力値や技能を直接入力して作成できます。ココフォリア駒JSONのドラッグ＆ドロップや貼り付けにも対応しています。
              </p>
            </div>
            <div class="flex items-center gap-2.5 mt-2 flex-wrap justify-center">
              <button type="button" id="btn-add-npc-empty" onclick="openNpcEditorModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
                <i data-lucide="plus-circle" class="w-4 h-4"></i>
                NPCを手動作成
              </button>
              <label class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5">
                <i data-lucide="file-code" class="w-4 h-4"></i>
                ファイルから読み込む
                <input type="file" accept=".json, application/json" class="hidden" onchange="handleNpcFileSelect(event)" multiple>
              </label>
            </div>
          </div>
        </div>
      </div>`;

if (!toolbarRegex.test(html)) {
  console.error("toolbarRegex did not match!");
  process.exit(1);
}
if (!oldEmptyFullRegex.test(html)) {
  console.error("oldEmptyFullRegex did not match!");
  process.exit(1);
}

html = html.replace(toolbarRegex, newToolbarLeft);
html = html.replace(oldEmptyFullRegex, newEmptyFull);

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully regex-replaced NPC toolbar and empty state in PdfEasyConverter.html');
