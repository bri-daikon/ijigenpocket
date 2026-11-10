import re

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return f'{r} {g} {b}'

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # Update tailwind.config
    for weight in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]:
        old = f"{weight}: 'var(--color-primary-{weight})'"
        new = f"{weight}: 'rgb(var(--color-primary-{weight}) / <alpha-value>)'"
        text = text.replace(old, new)

    # Update colorThemes
    start = text.find('const colorThemes = {')
    end = text.find('};', start)
    if end == -1:
        # try without semicolon
        end = text.find('}', text.find('}', text.find('}', start)+1)+1)+1 # Just a fallback, a bit hacky
        # actually, let's just use regex on the whole file since '#xxxxxx' is only used in colorThemes
    
    def repl(m):
        return "'" + hex_to_rgb(m.group(1)) + "'"
    
    # We only want to replace inside colorThemes to avoid replacing other random hex codes if any exist.
    themes_block_match = re.search(r'(const colorThemes = \{.*?\n        \});', text, re.DOTALL)
    if not themes_block_match:
        # Fallback regex if it lacks semicolon
        themes_block_match = re.search(r'(const colorThemes = \{.*?\n        \})', text, re.DOTALL)
        
    if themes_block_match:
        themes_block = themes_block_match.group(1)
        new_themes_block = re.sub(r"'#([0-9a-fA-F]{3,6})'", repl, themes_block)
        text = text.replace(themes_block, new_themes_block)
    else:
        print("Could not find colorThemes block!")

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Done!')

if __name__ == '__main__':
    main()
