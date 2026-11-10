def main():
    with open('y:\\ijigenpocket\\Sindandan_fixed.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        if 'id="edit-theme-color"' in line:
            for j in range(i-2, min(len(lines), i+15)):
                print(f'{j+1}: {lines[j].strip()}')
            break

if __name__ == '__main__':
    main()
