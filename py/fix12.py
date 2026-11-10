import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text = f.read()

text = re.sub(r'showToast\(\`.*?更新しました.*?\);', 'showToast(`質問${questions.length}問を取り込み更新しました。`);', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f: f.write(text)

with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text2 = f.read()
scripts = re.findall(r'<script>(.*?)</script>', text2, flags=re.DOTALL)
for i, script in enumerate(scripts):
    if 'tailwind.config' not in script:
        with open('y:\\ijigenpocket\\temp_script_check.js', 'w', encoding='utf-8') as sf:
            sf.write(script)
