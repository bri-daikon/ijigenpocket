import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. HTMLから全IDの抽出
with open('CcfoliaLayoutMaker_AI.html', 'r', encoding='utf-8') as f:
    html_content = f.read()
html_ids = set(re.findall(r'id="([a-zA-Z0-9_-]+)"', html_content))
print(f'HTML has {len(html_ids)} IDs')

# 2. JSからgetElementByIdのID抽出
with open('js/ccfolialayoutmaker_ai.js', 'r', encoding='utf-8') as f:
    js_content = f.read()
js_ids = re.findall(r"getElementById\('([a-zA-Z0-9_-]+)'\)", js_content)
js_ids = set(js_ids)

# 3. HTMLに存在しないがJSで取得されているID
missing_ids = js_ids - html_ids
print('Missing IDs in HTML (requested by JS):')
for mid in missing_ids:
    print(f' - {mid}')
    lines = js_content.split('\n')
    for i, line in enumerate(lines):
        if mid in line:
            print(f'   Line {i+1}: {line.strip()[:100]}')
