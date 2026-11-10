import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Remove the colors.primary extension from tailwind.config
    config_start = text.find('colors: {')
    config_end = text.find('}', text.find('}', text.find('primary: {', config_start)) + 1) + 1
    # Actually it's easier to just strip out the custom tailwind config script completely 
    # since we won't need custom variables if we use standard Tailwind colors.
    
    # Let's replace the whole tailwind.config block to be empty or minimal
    tailwind_script_match = re.search(r'<script>\s*tailwind\.config = \{.*?\n\s*\}\s*</script>', text, re.DOTALL)
    if tailwind_script_match:
        text = text.replace(tailwind_script_match.group(0), '<script>\n        tailwind.config = {\n            theme: {\n                extend: {}\n            }\n        }\n    </script>')

    # 2. Replace all instances of `primary-` with `indigo-` in the HTML (but NOT in the JS logic for theme selection yet)
    # Actually just replace globally since `primary-` is exclusively used for Tailwind classes in this file.
    text = text.replace('primary-50', 'indigo-50')
    text = text.replace('primary-100', 'indigo-100')
    text = text.replace('primary-200', 'indigo-200')
    text = text.replace('primary-300', 'indigo-300')
    text = text.replace('primary-400', 'indigo-400')
    text = text.replace('primary-500', 'indigo-500')
    text = text.replace('primary-600', 'indigo-600')
    text = text.replace('primary-700', 'indigo-700')
    text = text.replace('primary-800', 'indigo-800')
    text = text.replace('primary-900', 'indigo-900')

    # 3. Update applyColorTheme
    old_apply_func_match = re.search(r'function applyColorTheme\(themeName\) \{.*?\}', text, re.DOTALL)
    new_apply_func = """function applyColorTheme(themeName) {
            if (!themeName) themeName = 'indigo';
            const oldTheme = window.currentThemeName || 'indigo';
            if (oldTheme === themeName) return;

            const elements = document.querySelectorAll('*');
            const regex = new RegExp(`(^|\\\\s)([a-zA-Z0-9:-]+-)${oldTheme}(-\\\\d{1,3}(/\\\\d+)?|\\\\b)`, 'g');
            
            elements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    if (el.className.includes(oldTheme + '-')) {
                        el.className = el.className.replace(regex, `$1$2${themeName}$3`);
                    }
                }
            });
            window.currentThemeName = themeName;
        }"""
    
    if old_apply_func_match:
        text = text.replace(old_apply_func_match.group(0), new_apply_func)
    else:
        print("Warning: Could not find applyColorTheme function!")

    # 4. Remove `const colorThemes = { ... };` since we don't need it anymore!
    themes_match = re.search(r'const colorThemes = \{.*?\n        \};?', text, re.DOTALL)
    if themes_match:
        text = text.replace(themes_match.group(0), '')
    
    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully migrated to native Tailwind colors!")

if __name__ == '__main__':
    main()
