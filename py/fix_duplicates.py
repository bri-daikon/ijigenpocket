import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # Remove duplicated load logic
    duplicate_load = 'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) themeEl.value = currentQuiz.themeColor || "indigo";\n            const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) themeEl.value = currentQuiz.themeColor || "indigo";'
    fixed_load = 'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) themeEl.value = currentQuiz.themeColor || "indigo";'
    text = text.replace(duplicate_load, fixed_load)

    # Remove duplicated save logic
    duplicate_save = 'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) currentQuiz.themeColor = themeEl.value;\n            const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) currentQuiz.themeColor = themeEl.value;'
    fixed_save = 'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) currentQuiz.themeColor = themeEl.value;'
    text = text.replace(duplicate_save, fixed_save)

    # Also handle the case where whitespace is slightly different using regex if direct replace fails
    text = re.sub(
        r'const themeEl = document\.getElementById\(\"edit-theme-color\"\);\s*if \(themeEl\) themeEl\.value = currentQuiz\.themeColor \|\| \"indigo\";\s*const themeEl = document\.getElementById\(\"edit-theme-color\"\);\s*if \(themeEl\) themeEl\.value = currentQuiz\.themeColor \|\| \"indigo\";',
        r'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) themeEl.value = currentQuiz.themeColor || "indigo";',
        text
    )

    text = re.sub(
        r'const themeEl = document\.getElementById\(\"edit-theme-color\"\);\s*if \(themeEl\) currentQuiz\.themeColor = themeEl\.value;\s*const themeEl = document\.getElementById\(\"edit-theme-color\"\);\s*if \(themeEl\) currentQuiz\.themeColor = themeEl\.value;',
        r'const themeEl = document.getElementById("edit-theme-color");\n            if (themeEl) currentQuiz.themeColor = themeEl.value;',
        text
    )

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Duplicates fixed.')

if __name__ == '__main__':
    main()
