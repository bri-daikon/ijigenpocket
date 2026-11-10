def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # The broken line is: <p id="app-desc" ... >直感で質問に答えて、あなたの隠されたタイプをチェックしよう！/p>
    broken_str = 'をチェックしよう！/p>'
    fixed_str = 'をチェックしよう！</p>'
    
    if broken_str in text:
        text = text.replace(broken_str, fixed_str)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Fixed the broken </p> tag.')
    else:
        print('Broken string not found.')

if __name__ == '__main__':
    main()
