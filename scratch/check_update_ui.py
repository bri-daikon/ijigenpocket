import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('js/ccfolialayoutmaker_ai.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# updateUI 関数の範囲を抽出
start_match = re.search(r'function updateUI\(\) \{', js_content)
if not start_match:
    print("updateUI not found!")
    sys.exit(1)

start_pos = start_match.start()
# カッコのネストをカウントして関数の終わりを見つける
brace_count = 0
end_pos = -1
for i in range(start_pos + len('function updateUI() {') - 1, len(js_content)):
    char = js_content[i]
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            end_pos = i + 1
            break

update_ui_code = js_content[start_pos:end_pos]
lines = update_ui_code.split('\n')

print(f"updateUI lines count: {len(lines)}")

# 危険なパターンの検出
# 1. getElementById('...').xxx （NULLチェックなしのプロパティアクセスやメソッド呼び出し）
null_patterns = [
    r"document\.getElementById\('[a-zA-Z0-9_-]+'\)\.[a-zA-Z0-9_]+",
    r"\.[a-zA-Z0-9_]+\s*=\s*", # 何かしらの代入
]

print("Scanning for document.getElementById without check in updateUI:")
for idx, line in enumerate(lines):
    # document.getElementById を直接プロパティアクセスしているか
    m = re.search(r"document\.getElementById\('[a-zA-Z0-9_-]+'\)\.(?!style|classList|appendChild|addEventListener|setAttribute)", line)
    if m:
        print(f"  Line {idx+1}: {line.strip()}")
    
    # 又は、NULLチェックなしでプロパティを直接いじっている箇所
    # 例: document.getElementById('xxx').innerText = ...
    if "document.getElementById" in line and not "const" in line and not "let" in line and not "if" in line:
        if "." in line.split("document.getElementById")[1]:
            print(f"  Line {idx+1} (Direct property access): {line.strip()}")
