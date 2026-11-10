def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    broken_str = 'btnAuth.title = "ログアウチE;'
    fixed_str = 'btnAuth.title = "ログアウト";'
    
    if broken_str in text:
        text = text.replace(broken_str, fixed_str)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Syntax error fixed successfully.')
    else:
        print('Broken string not found.')
        
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'E;' in line or 'E,' in line or 'E"' in line or 'E)' in line:
            print(f'{i+1}: {line.strip()}')

if __name__ == '__main__':
    main()
