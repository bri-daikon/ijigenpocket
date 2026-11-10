import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text = f.read()

# Fix all common corrupted string ends
text = re.sub(r'、E,', '。",', text)
text = re.sub(r'、E\)', '。")', text)
text = re.sub(r'、E;', '。";', text)
text = re.sub(r'\?E,', '。",', text)
text = re.sub(r'\?E\)', '。")', text)
text = re.sub(r'\?E;', '。";', text)
text = re.sub(r'ます\?E', 'ます。', text)
text = re.sub(r'、E', '。"', text)
text = re.sub(r'\?E', '。"', text)

text = re.sub(r'質問が登録されて.*?Eせん。設定から.*?ください.*?\"error\"\)', '質問が登録されていません。設定から追加してください。\", \"error\")', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f: f.write(text)

with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text2 = f.read()
scripts = re.findall(r'<script>(.*?)</script>', text2, flags=re.DOTALL)
for i, script in enumerate(scripts):
    if 'tailwind.config' not in script:
        with open('y:\\ijigenpocket\\temp_script_check.js', 'w', encoding='utf-8') as sf:
            sf.write(script)
