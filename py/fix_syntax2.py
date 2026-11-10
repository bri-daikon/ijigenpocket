def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # The broken line is:
    # description: "直感で質問に答えて、あなたの隠されたタイプをチェックしよう！,
    
    broken_str = 'description: "直感で質問に答えて、あなたの隠されたタイプをチェックしよう！,'
    fixed_str = 'description: "直感で質問に答えて、あなたの隠されたタイプをチェックしよう！",'
    
    if broken_str in text:
        text = text.replace(broken_str, fixed_str)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Syntax error fixed successfully.')
    else:
        print('Broken string not found.')

if __name__ == '__main__':
    main()
