const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// The new CSS to override and style all modal elements in light, dark, beige, and light-green modes
const newModalCss = `    /* ========================================================
       NPC手動登録・編集モーダル スタイル（全テーマ完全対応）
       ======================================================== */
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
      background: #ffffff !important;
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
      border: 1px solid #e2e8f0 !important;
      color: #1e293b !important;
    }

    .npc-modal-backdrop.is-open .npc-modal-card {
      transform: scale(1);
    }

    .npc-modal-header {
      padding: 14px 20px;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
      color: #ffffff !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .npc-modal-header * {
      color: #ffffff !important;
    }

    .npc-modal-body {
      padding: 18px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: inherit;
    }

    .npc-modal-section {
      background: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px;
      padding: 12px;
    }

    .npc-modal-section-title {
      font-size: 12px;
      font-weight: 700;
      color: #334155 !important;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .npc-modal-footer {
      padding: 12px 20px;
      background: #f8fafc !important;
      border-top: 1px solid #e2e8f0 !important;
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
      color: #334155 !important;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .npc-form-input, .npc-form-select, .npc-form-textarea {
      width: 100%;
      font-size: 12px;
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid #cbd5e1 !important;
      background-color: #ffffff !important;
      color: #0f172a !important;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }

    .npc-form-input::placeholder, .npc-form-textarea::placeholder {
      color: #94a3b8 !important;
    }

    .npc-form-input:focus, .npc-form-select:focus, .npc-form-textarea:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .npc-auto-badge {
      font-size: 10px;
      background: #e0e7ff !important;
      color: #4338ca !important;
      padding: 1px 6px;
      border-radius: 9999px;
      font-weight: 700;
    }

    .npc-skill-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* --- ダークモード対応 --- */
    body[data-theme="dark"] .npc-modal-card {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    body[data-theme="dark"] .npc-modal-section {
      background: #0f172a !important;
      border-color: #334155 !important;
    }
    body[data-theme="dark"] .npc-modal-section-title {
      color: #e2e8f0 !important;
    }
    body[data-theme="dark"] .npc-modal-footer {
      background: #0f172a !important;
      border-color: #334155 !important;
    }
    body[data-theme="dark"] .npc-form-label {
      color: #cbd5e1 !important;
    }
    body[data-theme="dark"] .npc-form-input,
    body[data-theme="dark"] .npc-form-select,
    body[data-theme="dark"] .npc-form-textarea {
      background-color: #0f172a !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    body[data-theme="dark"] .npc-form-input::placeholder,
    body[data-theme="dark"] .npc-form-textarea::placeholder {
      color: #64748b !important;
    }
    body[data-theme="dark"] .npc-auto-badge {
      background: rgba(99, 102, 241, 0.25) !important;
      color: #a5b4fc !important;
    }

    /* --- ベージュモード対応 --- */
    body[data-theme="beige"] .npc-modal-card {
      background: #fdf6e3 !important;
      border-color: #d2cbb5 !important;
      color: #586e75 !important;
    }
    body[data-theme="beige"] .npc-modal-section {
      background: #eee8d5 !important;
      border-color: #d2cbb5 !important;
    }
    body[data-theme="beige"] .npc-modal-section-title {
      color: #586e75 !important;
    }
    body[data-theme="beige"] .npc-modal-footer {
      background: #eee8d5 !important;
      border-color: #d2cbb5 !important;
    }
    body[data-theme="beige"] .npc-form-label {
      color: #586e75 !important;
    }
    body[data-theme="beige"] .npc-form-input,
    body[data-theme="beige"] .npc-form-select,
    body[data-theme="beige"] .npc-form-textarea {
      background-color: #fdf6e3 !important;
      border-color: #d2cbb5 !important;
      color: #586e75 !important;
    }
    body[data-theme="beige"] .npc-form-input::placeholder,
    body[data-theme="beige"] .npc-form-textarea::placeholder {
      color: #93a1a1 !important;
    }
    body[data-theme="beige"] .npc-auto-badge {
      background: #e4dfcb !important;
      color: #073642 !important;
    }

    /* --- 薄いグリーンモード対応 --- */
    body[data-theme="light-green"] .npc-modal-card {
      background: #f2fbf5 !important;
      border-color: #c0e0cc !important;
      color: #334b3e !important;
    }
    body[data-theme="light-green"] .npc-modal-section {
      background: #e6f7ec !important;
      border-color: #c0e0cc !important;
    }
    body[data-theme="light-green"] .npc-modal-section-title {
      color: #334b3e !important;
    }
    body[data-theme="light-green"] .npc-modal-footer {
      background: #e6f7ec !important;
      border-color: #c0e0cc !important;
    }
    body[data-theme="light-green"] .npc-form-label {
      color: #334b3e !important;
    }
    body[data-theme="light-green"] .npc-form-input,
    body[data-theme="light-green"] .npc-form-select,
    body[data-theme="light-green"] .npc-form-textarea {
      background-color: #ffffff !important;
      border-color: #c0e0cc !important;
      color: #166534 !important;
    }
    body[data-theme="light-green"] .npc-form-input::placeholder,
    body[data-theme="light-green"] .npc-form-textarea::placeholder {
      color: #6a8b78 !important;
    }
    body[data-theme="light-green"] .npc-auto-badge {
      background: #d3f0de !important;
      color: #166534 !important;
    }
  </style>`;

// Replace old CSS block for modal
const oldModalCssRegex = /\/\* NPC手動登録・編集モーダル & カードアクション \*\/[\s\S]*?<\/style>/;
if (!oldModalCssRegex.test(html)) {
  console.error("oldModalCssRegex did not match!");
  process.exit(1);
}
html = html.replace(oldModalCssRegex, newModalCss);

// Update section divs in modal HTML to have npc-modal-section class and npc-modal-section-title
html = html.replace(
  '<div class="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">',
  '<div class="npc-modal-section grid grid-cols-1 sm:grid-cols-4 gap-3">'
);

html = html.replace(
  '<div class="bg-slate-50 p-3 rounded-xl border border-slate-200">\n          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">\n            <span>主要リソース</span>',
  '<div class="npc-modal-section">\n          <div class="npc-modal-section-title">\n            <span>主要リソース</span>'
);

html = html.replace(
  '<div class="bg-slate-50 p-3 rounded-xl border border-slate-200">\n          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">\n            <span>基本能力値</span>',
  '<div class="npc-modal-section">\n          <div class="npc-modal-section-title">\n            <span>基本能力値</span>'
);

html = html.replace(
  '<div class="bg-slate-50 p-3 rounded-xl border border-slate-200">\n          <div class="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">\n            <span>基本判定 (自動計算)</span>',
  '<div class="npc-modal-section">\n          <div class="npc-modal-section-title">\n            <span>基本判定 (自動計算)</span>'
);

html = html.replace(
  '<div class="bg-slate-50 p-3 rounded-xl border border-slate-200">\n          <div class="flex items-center justify-between mb-2">\n            <span class="text-xs font-bold text-slate-700">技能設定</span>',
  '<div class="npc-modal-section">\n          <div class="npc-modal-section-title">\n            <span>技能設定</span>'
);

// Also check buttons inside modal for contrast:
// "キャンセル" button
html = html.replace(
  '<button type="button" onclick="closeNpcEditorModal()" class="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">',
  '<button type="button" onclick="closeNpcEditorModal()" class="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 transition-colors">'
);

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully fixed modal contrast and styles for all themes!');
