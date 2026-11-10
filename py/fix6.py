import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text = f.read()

text = re.sub(r'title: \"診断完亁.*?E,', 'title: \"診断完了\",', text)
text = re.sub(r'description: \"すべての質問.*?E,', 'description: \"すべての質問に回答し、診断結果が表示されています。\",', text)
text = re.sub(r'title: \"診断結.*?E,', 'title: \"診断結果\",', text)
text = re.sub(r'description: \"あな.*?E,', 'description: \"あなたの診断結果です。\",', text)
text = re.sub(r'、E,', '。",', text)
text = re.sub(r'、E', '。"', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f: f.write(text)

with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text2 = f.read()
scripts = re.findall(r'<script>(.*?)</script>', text2, flags=re.DOTALL)
for i, script in enumerate(scripts):
    if 'tailwind.config' not in script:
        with open('y:\\ijigenpocket\\temp_script_check.js', 'w', encoding='utf-8') as sf:
            sf.write(script)
