const fs = require('fs');
let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// Ensure onclick handlers are intact
if (!html.includes('id="btn-add-npc-toolbar" onclick="openNpcEditorModal()"')) {
  html = html.replace('id="btn-add-npc-toolbar"', 'id="btn-add-npc-toolbar" onclick="openNpcEditorModal()"');
}
if (!html.includes('id="btn-add-npc-empty" onclick="openNpcEditorModal()"')) {
  html = html.replace('id="btn-add-npc-empty"', 'id="btn-add-npc-empty" onclick="openNpcEditorModal()"');
}

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Onclick restored!');
