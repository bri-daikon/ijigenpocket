import re

with open(r'y:\ijigenpocket\PdfEasyConverter.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Kuroshiro & Furigana
content = re.sub(r'<!-- Kuroshiro[^\n]*\n', '', content)
content = re.sub(r'/\* ふりがなツールチップ \*/[\s\S]*?\.furigana-word:hover::after\s*\{\s*opacity:\s*1;\s*\}', '', content)
content = re.sub(r'<!-- ふりがな表示 -->[\s\S]*?</div>\s*</div>', '</div>', content) # Removes furigana UI
# JS vars & functions for furigana
content = re.sub(r'let kuroshiroEnabled.*?\n', '', content)
content = re.sub(r'let kuroshiroReady.*?\n', '', content)
content = re.sub(r'let kuroshiroWorker.*?\n', '', content)
content = re.sub(r'let furiganaQueue.*?\n', '', content)
content = re.sub(r'let isFuriganaConverting.*?\n', '', content)
content = re.sub(r'let isFuriganaProcessing.*?\n', '', content)

content = re.sub(r'// --- ふりがな機能 \(Kuroshiro\.js\) ---[\s\S]*?// --- カード編集機能 ---', '// --- カード編集機能 ---', content)
content = re.sub(r'if \(kuroshiroEnabled\)\s*\{\s*toggleFurigana\(\);\s*\}', '', content)
content = re.sub(r'if \(kuroshiroEnabled && !item.furiganaHtml\)\s*\{\s*toggleFurigana\(\);\s*\}', '', content)
content = re.sub(r'\$\{kuroshiroEnabled.*?item\.furiganaHtml : escapeHtml\(displayText\)\}', '${escapeHtml(displayText)}', content)
content = re.sub(r'item\.furiganaHtml\s*=\s*undefined;', '', content)

# 2. Remove Bookmarks and Notes (Shiori / Fusen) UI
content = re.sub(r'<!-- しおり（ブックマーク）リスト -->[\s\S]*?<!-- 付箋（メモ）リスト -->[\s\S]*?</div>\s*</div>\s*</div>', '</div>', content)
# Remove bookmark and note icons from card UI
content = re.sub(r'<button onclick="toggleNoteInput.*?</button>', '', content)
content = re.sub(r'<button onclick="toggleBookmark.*?</button>', '', content)
content = re.sub(r'<!-- メモ入力エリア / 表示エリア -->[\s\S]*?</div>\s*</div>', '', content)
content = re.sub(r'updateBookmarkAndNoteLists\(\);', '', content)

# Remove functions
content = re.sub(r'// しおりのON/OFF切り替え[\s\S]*?// リストアイテムのコピー', '// リストアイテムのコピー', content)

# 3. Remove CCFOLIA Integration
content = re.sub(r'<!-- 4\. ココフォリア連携用ブックマークレット -->[\s\S]*?<!-- 5\. カスタム一括置換 -->', '<!-- カスタム一括置換 -->', content)

# 4. Remove Text file import
content = re.sub(r'<!-- エンコード設定 \(テキスト用\) -->[\s\S]*?</div>\s*</div>', '</div>', content)
content = re.sub(r'accept="application/pdf, text/plain, \.pdf, \.txt"', 'accept="application/pdf, .pdf"', content)
content = re.sub(r'PDF / Text ファイルを読込', 'PDFファイルを読込', content)

content = re.sub(r'// テキストファイルの読み込み[\s\S]*?// PDFの読み込み', '// PDFの読み込み', content)
content = re.sub(r'const isTxt =.*?;\n', '', content)
content = re.sub(r'if \(!isPdf && !isTxt\) \{[\s\S]*?\} else \{[\s\S]*?loadTextFile\(file\);[\s\S]*?\}', 'if (!isPdf) { showToast("エラー", "PDFファイルを選択してください。", "error"); return; }\n      currentFileName = file.name;\n      loadPdf(file);', content)

# 5. Remove Save/Load
content = re.sub(r'<!-- 保存・読み込みボタン -->[\s\S]*?<button onclick="clearText\(\)"', '<button onclick="clearText()"', content)
content = re.sub(r'// ローカルストレージにデータを保存する関数[\s\S]*?// スマートに段落を判定してテキストを配列に分割する処理', '// スマートに段落を判定してテキストを配列に分割する処理', content)
content = re.sub(r'// --- プロジェクトファイル保存・読み込み ---[\s\S]*?// 全クリア', '// 全クリア', content)
content = re.sub(r'saveToLocalStorage\(\);', '', content)
# local storage logic inside processAndDisplay
content = re.sub(r'// ローカルストレージから保存されているデータを取得[\s\S]*?rawTextBlocks\.forEach\(block => \{', 'rawTextBlocks.forEach(block => {', content)
# remove savedItem logic
content = re.sub(r'let savedItem = savedData\.find.*?;\n', '', content)
content = re.sub(r'\} else if \(savedItem\) \{[\s\S]*?\}', '', content)

# 6. Remove One-click copy
content = re.sub(r'onclick="copyItemText\(\$\{item\.id\}\)"', '', content)
content = re.sub(r'title="クリックでコピー"', '', content)
content = re.sub(r'// リストアイテムのコピー[\s\S]*?// 汎用クリップボードコピー処理[\s\S]*?// TRPGキーワード一括カッコ', '// TRPGキーワード一括カッコ', content)
content = re.sub(r'select-all cursor-pointer', 'select-text', content)

# Write out the modified file
with open(r'y:\ijigenpocket\PdfEasyConverter_Sample.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Created PdfEasyConverter_Sample.html")
