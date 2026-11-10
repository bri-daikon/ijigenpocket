def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    broken_str = 'const descEl = document.getElementById("home-quiz-desc");\\n            if (descEl) descEl.textContent = currentQuiz.description || "";'
    fixed_str = 'const descEl = document.getElementById("home-quiz-desc");\n            if (descEl) descEl.textContent = currentQuiz.description || "";'
    
    if broken_str in text:
        text = text.replace(broken_str, fixed_str)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Syntax error fixed successfully.')
    else:
        print('Broken string not found.')

if __name__ == '__main__':
    main()
