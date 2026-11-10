import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Replace colors with primary
    text = text.replace('indigo-', 'primary-')
    text = text.replace('violet-', 'primary-')

    # 2. Add Tailwind Config
    tailwind_script = """<script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: 'var(--color-primary-50)',
                            100: 'var(--color-primary-100)',
                            200: 'var(--color-primary-200)',
                            300: 'var(--color-primary-300)',
                            400: 'var(--color-primary-400)',
                            500: 'var(--color-primary-500)',
                            600: 'var(--color-primary-600)',
                            700: 'var(--color-primary-700)',
                            800: 'var(--color-primary-800)',
                            900: 'var(--color-primary-900)',
                        }
                    }
                }
            }
        }
    </script>"""
    text = text.replace('<script src="https://cdn.tailwindcss.com"></script>', tailwind_script)

    # 3. Add Theme selection to HTML
    theme_html = """
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2">テーマカラー</label>
                        <select id="edit-theme" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                            <option value="indigo">インディゴ</option>
                            <option value="rose">ローズ</option>
                            <option value="emerald">エメラルド</option>
                            <option value="amber">アンバー</option>
                            <option value="sky">スカイ</option>
                            <option value="violet">バイオレット</option>
                            <option value="fuchsia">フクシア</option>
                            <option value="teal">ティール</option>
                            <option value="orange">オレンジ</option>
                            <option value="slate">スレート</option>
                        </select>
                    </div>
    """
    text = text.replace('<!-- 追加: 公開設定 -->', theme_html + '\n                    <!-- 追加: 公開設定 -->')

    # 4. Add top page description to HTML
    desc_html = """<h2 id="home-quiz-title" class="text-xl font-bold text-center text-gray-800 mb-2"></h2>
                    <p id="home-quiz-desc" class="text-sm text-gray-600 text-center mb-6 whitespace-pre-wrap"></p>"""
    text = text.replace('<h2 id="home-quiz-title" class="text-xl font-bold text-center text-gray-800 mb-6"></h2>', desc_html)


    # 5. Add JS Logic for Theme & Google Drive
    js_additions = """
        const colorThemes = {
            indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
            rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
            emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
            amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
            sky: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' },
            violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
            fuchsia: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75' },
            teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
            orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
            slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
        };

        function applyColorTheme(themeName) {
            const theme = colorThemes[themeName] || colorThemes.indigo;
            const root = document.documentElement;
            for (const [weight, color] of Object.entries(theme)) {
                root.style.setProperty(`--color-primary-${weight}`, color);
            }
        }

        function formatImageUrl(url) {
            if (!url) return '';
            const gdriveMatch = url.match(/https:\\/\\/drive\\.google\\.com\\/file\\/d\\/([^/]+)/);
            if (gdriveMatch) {
                return `https://lh3.googleusercontent.com/d/${gdriveMatch[1]}`;
            }
            return url;
        }
"""
    text = text.replace('const DEFAULT_QUIZ = {', js_additions + '\n        const DEFAULT_QUIZ = {')
    
    # 6. Apply themes & description
    text = text.replace('isPublished: false', 'isPublished: false,\n            themeColor: "indigo"')
    text = text.replace('currentQuiz.title = document.getElementById("edit-title").value;', 'currentQuiz.title = document.getElementById("edit-title").value;\n            currentQuiz.themeColor = document.getElementById("edit-theme").value;')
    text = text.replace('document.getElementById("edit-title").value = currentQuiz.title;', 'document.getElementById("edit-title").value = currentQuiz.title;\n            document.getElementById("edit-theme").value = currentQuiz.themeColor || "indigo";')
    text = text.replace('document.getElementById("home-quiz-title").textContent = currentQuiz.title;', 'document.getElementById("home-quiz-title").textContent = currentQuiz.title;\n            document.getElementById("home-quiz-desc").textContent = currentQuiz.description || "";\n            applyColorTheme(currentQuiz.themeColor || "indigo");')

    # 7. Apply formatImageUrl to images
    text = text.replace('homeImgEl.src = currentQuiz.image.trim();', 'homeImgEl.src = formatImageUrl(currentQuiz.image.trim());')
    text = text.replace('imgEl.src = q.image.trim();', 'imgEl.src = formatImageUrl(q.image.trim());')
    text = text.replace('resultImgEl.src = result.image.trim();', 'resultImgEl.src = formatImageUrl(result.image.trim());')

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    main()
