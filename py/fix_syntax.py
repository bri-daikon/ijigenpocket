def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # The corrupted block is exactly:
    bad_block = '''window.currentThemeName = themeName;
        }`, color);
            }
        }'''
    
    good_block = '''window.currentThemeName = themeName;
        }'''
    
    if bad_block in text:
        text = text.replace(bad_block, good_block)
        with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
            f.write(text)
        print('Syntax error fixed successfully.')
    else:
        print('Bad block not found!')

if __name__ == '__main__':
    main()
