import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: text = f.read()

# 1. Add formatImageUrl function before DEFAULT_QUIZ
new_code = '''        function applyColorTheme(themeName) {
            const theme = colorThemes[themeName] || colorThemes['indigo'];
            const root = document.documentElement;
            for (const [key, value] of Object.entries(theme)) {
                root.style.setProperty(`--color-primary-${key}`, value);
            }
        }

        function formatImageUrl(url) {
            if (!url) return "";
            const driveRegex = /drive\\.google\\.com\\/file\\/d\\/([^\\/]+)/;
            const match = url.match(driveRegex);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
            return url;
        }

        //'''
text = re.sub(r'        function applyColorTheme\(themeName\).*?\n        //', new_code, text, flags=re.DOTALL)

# 2. Update renderHome
text = text.replace('homeImg.src = currentQuiz.image;', 'homeImg.src = formatImageUrl(currentQuiz.image);')
text = text.replace('imgEl.src = q.image;', 'imgEl.src = formatImageUrl(q.image);')
text = text.replace('imgEl.src = currentResult.image;', 'imgEl.src = formatImageUrl(currentResult.image);')
text = text.replace('document.getElementById("home-quiz-title").textContent = currentQuiz.title;', 'document.getElementById("home-quiz-title").textContent = currentQuiz.title;\n            const descEl = document.getElementById("home-quiz-desc");\n            if (descEl) descEl.textContent = currentQuiz.description || "";')

# 3. Add home-quiz-desc to HTML
text = re.sub(r'(<h2 id="home-quiz-title"[^>]*>.*?</h2>)', r'\1\n                    <p id="home-quiz-desc" class="text-sm text-slate-700 mb-4 whitespace-pre-wrap"></p>', text)

with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f: f.write(text)
