import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # The original line 68
    html_target = '<p class="text-sm text-slate-600 mb-6">全<span id="question-count-badge" class="font-bold text-indigo-600">10</span>問の質問（2択）に回答していただきます。</p>'
    
    html_replacement = '''<p id="home-quiz-desc" class="text-sm text-slate-600 mb-4 whitespace-pre-wrap"></p>
                            <p class="text-xs text-slate-500 mb-6">全<span id="question-count-badge" class="font-bold text-indigo-600">10</span>問の質問（2択）に回答していただきます。</p>'''
    
    # Wait, the Japanese characters might be garbled in text, let's use regex based on question-count-badge
    html_target_regex = r'(<p class="text-sm text-slate-600 mb-6">.*?<span id="question-count-badge".*?</span>.*?</p>)'
    
    html_replacement_regex = r'<p id="home-quiz-desc" class="text-sm text-slate-600 mb-4 whitespace-pre-wrap"></p>\n                            <p class="text-xs text-slate-500 mb-6">\1</p>'
    
    # Wait, I don't want to duplicate the outer <p> tag if I use \1
    html_target_regex2 = r'<p class="text-sm text-slate-600 mb-6">(.*?<span id="question-count-badge".*?</span>.*?)</p>'
    html_replacement_regex2 = r'<p id="home-quiz-desc" class="text-sm text-slate-600 mb-4 whitespace-pre-wrap"></p>\n                            <p class="text-xs text-slate-500 mb-6">\1</p>'

    if re.search(html_target_regex2, text):
        text = re.sub(html_target_regex2, html_replacement_regex2, text, count=1)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Added home-quiz-desc successfully.')
    else:
        print('Could not find question-count-badge paragraph.')

if __name__ == '__main__':
    main()
