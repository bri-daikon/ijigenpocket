import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Add theme selector securely
    html_target_regex = r'(<select id=\"input-app-scoringMode\".*?</select>\s*</div>)'
    theme_html = '''
                                <div class="mt-4">
                                    <label class="block text-xs font-bold text-slate-700 mb-1">テーマカラー</label>
                                    <select id="edit-theme-color" class="w-full p-2.5 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" onchange="applyColorTheme(this.value)">
                                        <option value="indigo">インディゴ (標準)</option>
                                        <option value="rose">ローズ (ピンク系)</option>
                                        <option value="emerald">エメラルド (緑系)</option>
                                        <option value="amber">アンバー (オレンジ系)</option>
                                        <option value="sky">スカイ (水色系)</option>
                                        <option value="purple">パープル (紫系)</option>
                                        <option value="fuchsia">フクシア (赤紫系)</option>
                                        <option value="teal">ティール (青緑系)</option>
                                        <option value="orange">オレンジ</option>
                                        <option value="slate">スレート (グレー系)</option>
                                    </select>
                                </div>'''

    if re.search(html_target_regex, text, re.DOTALL):
        text = re.sub(html_target_regex, r'\1' + theme_html, text, count=1, flags=re.DOTALL)
        print('Theme selector added successfully.')
    else:
        print('Scoring mode select not found!')

    # 2. Add loading logic for theme
    load_target = r'(document\.getElementById\(\"input-app-scoringMode\"\)\.value = currentQuiz\.scoringMode \|\| \"sum\";)'
    load_logic = r'\1\n            const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) themeEl.value = currentQuiz.themeColor || "indigo";'
    if re.search(load_target, text):
        text = re.sub(load_target, load_logic, text, count=1)
        print('Loading logic added.')

    # 3. Add saving logic for theme
    save_target = r'(currentQuiz\.scoringMode = document\.getElementById\(\"input-app-scoringMode\"\)\.value;)'
    save_logic = r'\1\n            const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) currentQuiz.themeColor = themeEl.value;'
    if re.search(save_target, text):
        text = re.sub(save_target, save_logic, text, count=1)
        print('Saving logic added.')

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    main()
