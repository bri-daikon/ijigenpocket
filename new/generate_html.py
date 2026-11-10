import re

def parse_text(file_path):
    categories = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    current_cat = None
    current_options = []
    
    for line in lines:
        line = line.strip()
        if not line:
            if current_cat and current_options:
                categories.append({'name': current_cat, 'options': current_options})
                current_cat = None
                current_options = []
            elif current_cat:
                current_cat = None
            continue
            
        if current_cat is None:
            if line == "キャラちょすおーとらんだむ！":
                continue
            current_cat = line
        else:
            items = line.split(',')
            for item in items:
                item = item.strip()
                if item:
                    # Remove "1.", "100.", "1．" etc. prefix
                    item = re.sub(r'^\d+[.．]', '', item).strip()
                    if item:
                        current_options.append(item)
    
    if current_cat and current_options:
        categories.append({'name': current_cat, 'options': current_options})
        
    return categories

def generate_html(categories, output_path):
    html = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>キャラちょすおーとらんだむ</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
        .chip-btn {
            transition: all 0.15s ease-in-out;
        }
        .chip-btn.active {
            background-color: #4f46e5;
            color: #ffffff;
            border-color: #6366f1;
            box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
        }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 font-sans min-h-screen p-3 md:p-6">
    <div class="max-w-7xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col md:flex-row h-[90vh]">
        
        <!-- 左側：選択エリア -->
        <div class="flex-1 space-y-6 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl md:text-3xl font-extrabold tracking-wide">🎲 キャラちょすおーとらんだむ</h1>
                    <p class="text-indigo-100 text-xs md:text-sm mt-1">TRPGキャラクターの性格・設定を自動生成</p>
                    <p class="text-indigo-200 text-xs mt-2">※ 項目を「指定なし」にすると出力されないので、いらない項目は指定なしにしてください。</p>
                </div>
                <button type="button" onclick="randomizeAll()" class="px-4 py-2 font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors shadow-lg flex items-center gap-2">
                    🎲 全てランダム
                </button>
            </header>

            <div id="optionsContainer" class="space-y-4">
"""
    
    for i, cat in enumerate(categories):
        html += f"""
                <section class="bg-slate-700/50 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                    <div class="flex items-center justify-between mb-2">
                        <h2 class="font-bold text-indigo-300 text-sm">{cat['name']}</h2>
                        <button type="button" onclick="randomizeCategory(this)" class="text-xs px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors" title="この項目だけランダム">🎲</button>
                    </div>
                    <div class="flex flex-wrap gap-1.5" data-category="{cat['name']}">
"""
        html += f"""                        <button type="button" data-value="" class="chip-btn active text-xs px-2.5 py-1 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700" onclick="selectChip(this)">指定なし</button>\n"""
        for opt in cat['options']:
            html += f"""                        <button type="button" data-value="{opt}" class="chip-btn text-xs px-2.5 py-1 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700" onclick="selectChip(this)">{opt}</button>\n"""
        html += """                    </div>
                </section>"""
        
    html += """
            </div>
        </div>

        <!-- 右側：出力エリア -->
        <div class="w-full md:w-1/3 bg-slate-800 border-l border-slate-700 p-4 md:p-6 flex flex-col">
            <h2 class="font-bold text-lg text-slate-200 mb-4">📋 出力結果</h2>
            <div class="flex gap-2 mb-2">
                <button type="button" onclick="copyResult()" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition shadow">
                    結果をコピー
                </button>
            </div>
            <textarea id="resultTextarea" class="w-full flex-1 bg-slate-900 text-slate-300 border border-slate-600 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar" readonly></textarea>
        </div>
    </div>

    <!-- フッター -->
    <footer class="max-w-7xl mx-auto mt-4 text-center text-slate-400 text-xs md:text-sm">
        Product by <a href="https://ijigenpocket.booth.pm/" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline">異次元ポケット</a>
    </footer>

    <script>
        function selectChip(btn) {
            const group = btn.parentElement;
            const buttons = group.querySelectorAll('button');
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateResult();
        }

        function randomizeAll() {
            const groups = document.querySelectorAll('#optionsContainer > section > div[data-category]');
            groups.forEach(group => {
                const buttons = group.querySelectorAll('button:not([data-value=""])');
                if (buttons.length > 0) {
                    const randomIndex = Math.floor(Math.random() * buttons.length);
                    const selectedBtn = buttons[randomIndex];
                    
                    const allButtons = group.querySelectorAll('button');
                    allButtons.forEach(b => b.classList.remove('active'));
                    selectedBtn.classList.add('active');
                }
            });
            updateResult();
        }

        function randomizeCategory(btn) {
            const section = btn.closest('section');
            const group = section.querySelector('div[data-category]');
            if (group) {
                const buttons = group.querySelectorAll('button:not([data-value=""])');
                if (buttons.length > 0) {
                    const randomIndex = Math.floor(Math.random() * buttons.length);
                    const selectedBtn = buttons[randomIndex];
                    
                    const allButtons = group.querySelectorAll('button');
                    allButtons.forEach(b => b.classList.remove('active'));
                    selectedBtn.classList.add('active');
                }
                updateResult();
            }
        }

        function updateResult() {
            const groups = document.querySelectorAll('#optionsContainer > section > div[data-category]');
            let result = "";
            
            groups.forEach(group => {
                const categoryName = group.getAttribute('data-category');
                const activeBtn = group.querySelector('button.active');
                if (activeBtn) {
                    const value = activeBtn.getAttribute('data-value');
                    if (value) {
                        result += `${categoryName}：${value}\\n`;
                    }
                }
            });
            
            document.getElementById('resultTextarea').value = result.trim();
        }

        function copyResult() {
            const textarea = document.getElementById('resultTextarea');
            textarea.select();
            document.execCommand('copy');
            alert('コピーしました！');
        }
    </script>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == "__main__":
    cats = parse_text("y:/ijigenpocket/new/本文.txt")
    generate_html(cats, "y:/ijigenpocket/CharachosAutoRandom.html")
