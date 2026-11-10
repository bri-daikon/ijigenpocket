const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// 1. Update <title>
html = html.replace('<title>PDF楽々変換ツール - Weby</title>', '<title>セショサポ - Weby</title>');

// 2. Update Header Title & Version badge
html = html.replace('PDF楽々変換ツール', 'セショサポ');
html = html.replace('Ver.1.3.4', 'Ver.2.0.0');

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully updated title and version to セショサポ Ver.2.0.0');
