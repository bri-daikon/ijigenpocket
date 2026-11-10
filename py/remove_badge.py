import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Remove the paragraph with question-count-badge
    text = re.sub(r'<p class=\"text-xs text-slate-500 mb-6\">.*?question-count-badge.*?</p>\s*', '', text)

    # 2. Safely update any Javascript that tries to modify it
    # We replace lines like: document.getElementById("question-count-badge").textContent = ...;
    text = re.sub(r'document\.getElementById\([\'\"]question-count-badge[\'\"]\)\.textContent = (.*?);', 
                  r'const qBadge = document.getElementById("question-count-badge"); if (qBadge) qBadge.textContent = \1;', text)

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Removed question-count-badge and made JS safe.')

if __name__ == '__main__':
    main()
