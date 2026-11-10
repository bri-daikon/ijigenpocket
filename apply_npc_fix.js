const fs = require('fs');
let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

const npcExtraStyles = `
    /* ========================================================
       NPC専用ボタン & 空状態 & 各種テーマ完全対応スタイル
       ======================================================== */
    .btn-npc-primary {
      background: #4f46e5 !important;
      background-color: #4f46e5 !important;
      color: #ffffff !important;
      border: 1px solid #4338ca !important;
      font-weight: 700 !important;
      box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      cursor: pointer !important;
      border-radius: 8px !important;
      transition: all 0.15s ease !important;
      text-decoration: none !important;
    }
    .btn-npc-primary * {
      color: #ffffff !important;
    }
    .btn-npc-primary:hover {
      background: #4338ca !important;
      background-color: #4338ca !important;
      color: #ffffff !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4) !important;
    }
    .btn-npc-primary:active {
      transform: translateY(0) !important;
    }

    .btn-npc-secondary {
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #334155 !important;
      border: 1px solid #cbd5e1 !important;
      font-weight: 700 !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;
      cursor: pointer !important;
      border-radius: 8px !important;
      transition: all 0.15s ease !important;
    }
    .btn-npc-secondary * {
      color: #334155 !important;
    }
    .btn-npc-secondary:hover {
      background: #f8fafc !important;
      background-color: #f8fafc !important;
      border-color: #94a3b8 !important;
      color: #0f172a !important;
    }

    .npc-empty-box {
      border: 2px dashed #cbd5e1 !important;
      background-color: rgba(248, 250, 252, 0.8) !important;
    }
    .npc-empty-title {
      color: #1e293b !important;
      font-weight: 700 !important;
    }
    .npc-empty-desc {
      color: #475569 !important;
    }

    /* 各テーマでの空状態 & セカンダリボタン対応 */
    body[data-theme="dark"] .npc-empty-box {
      border-color: #334155 !important;
      background-color: rgba(30, 41, 59, 0.5) !important;
    }
    body[data-theme="dark"] .npc-empty-title {
      color: #f1f5f9 !important;
    }
    body[data-theme="dark"] .npc-empty-desc {
      color: #94a3b8 !important;
    }
    body[data-theme="dark"] .btn-npc-secondary {
      background: #1e293b !important;
      background-color: #1e293b !important;
      border-color: #475569 !important;
      color: #e2e8f0 !important;
    }
    body[data-theme="dark"] .btn-npc-secondary * {
      color: #e2e8f0 !important;
    }
    body[data-theme="dark"] .btn-npc-secondary:hover {
      background: #334155 !important;
      background-color: #334155 !important;
      color: #ffffff !important;
    }

    body[data-theme="beige"] .npc-empty-box {
      border-color: #d2cbb5 !important;
      background-color: rgba(238, 232, 213, 0.5) !important;
    }
    body[data-theme="beige"] .npc-empty-title {
      color: #073642 !important;
    }
    body[data-theme="beige"] .npc-empty-desc {
      color: #586e75 !important;
    }
    body[data-theme="beige"] .btn-npc-secondary {
      background: #fdf6e3 !important;
      background-color: #fdf6e3 !important;
      border-color: #d2cbb5 !important;
      color: #586e75 !important;
    }
    body[data-theme="beige"] .btn-npc-secondary * {
      color: #586e75 !important;
    }
    body[data-theme="beige"] .btn-npc-secondary:hover {
      background: #eee8d5 !important;
      background-color: #eee8d5 !important;
      color: #073642 !important;
    }

    body[data-theme="light-green"] .npc-empty-box {
      border-color: #c0e0cc !important;
      background-color: rgba(230, 247, 236, 0.5) !important;
    }
    body[data-theme="light-green"] .npc-empty-title {
      color: #14532d !important;
    }
    body[data-theme="light-green"] .npc-empty-desc {
      color: #166534 !important;
    }
    body[data-theme="light-green"] .btn-npc-secondary {
      background: #ffffff !important;
      background-color: #ffffff !important;
      border-color: #c0e0cc !important;
      color: #166534 !important;
    }
    body[data-theme="light-green"] .btn-npc-secondary * {
      color: #166534 !important;
    }
    body[data-theme="light-green"] .btn-npc-secondary:hover {
      background: #e6f7ec !important;
      background-color: #e6f7ec !important;
      color: #14532d !important;
    }
`;

if (!html.includes('.btn-npc-primary')) {
  html = html.replace('</style>', npcExtraStyles + '\n  </style>');
}

// Replace toolbar add button
html = html.replace(
  /id="btn-add-npc-toolbar"[^>]*class="[^"]*"/,
  'id="btn-add-npc-toolbar" class="btn-npc-primary text-xs px-3 py-1.5"'
);

// Replace empty state box
html = html.replace(
  /id="npc-empty-state"[^>]*class="[^"]*"/,
  'id="npc-empty-state" class="text-center py-16 flex flex-col items-center justify-center gap-3 rounded-xl npc-empty-box mt-2"'
);

// Replace empty state button
html = html.replace(
  /id="btn-add-npc-empty"[^>]*class="[^"]*"/,
  'id="btn-add-npc-empty" class="btn-npc-primary text-xs px-4 py-2"'
);

// Replace modal save button
html = html.replace(
  /onclick="saveNpcFromModal\(\)"[^>]*class="[^"]*"/,
  'onclick="saveNpcFromModal()" class="btn-npc-primary text-xs px-5 py-2"'
);

// Replace upload labels in toolbar
html = html.replace(
  /<label class="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5" title="NPCのココフォリア駒JSONファイルを選択">/,
  '<label class="btn-npc-secondary text-xs px-3 py-1.5 cursor-pointer" title="NPCのココフォリア駒JSONファイルを選択">'
);

// Replace upload labels in empty state
html = html.replace(
  /<label class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-1.5">/,
  '<label class="btn-npc-secondary text-xs px-4 py-2 cursor-pointer">'
);

// Replace empty state headings
html = html.replace(
  '<h3 class="font-bold text-slate-700 text-sm mb-1">',
  '<h3 class="font-bold text-sm mb-1 npc-empty-title">'
);

html = html.replace(
  '<p class="text-xs text-slate-500 leading-relaxed">',
  '<p class="text-xs leading-relaxed npc-empty-desc">'
);

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Update completed successfully!');
