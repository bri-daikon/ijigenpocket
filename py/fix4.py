import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Fix the broken JS string
text = re.sub(r'showToast\("新しい診断を作.*?E\);', 'showToast("新しい診断を作成しました。設定画面で編集できます。");', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
    f.write(text)
