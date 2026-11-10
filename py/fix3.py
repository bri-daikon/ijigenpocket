import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Fix the known broken JS string
text = text.replace('description: "新しい診断の説明文をここに入力してください、E,', 'description: "新しい診断の説明文をここに入力してください。",')

# Also fix the mojibake that didn't get fixed earlier because of \ufffd
text = re.sub(r'問.\?*質問！.\?*択）に回答してぁ.\?*ます\?', '問の質問（5択）に回答していきます。', text)
text = re.sub(r'全<span([^>]+)>10</span>問の質問（5択）に回答していきます。', r'全<span\1>10</span>問の質問（5択）に回答していきます。', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
    f.write(text)
