import re
with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f: lines = f.readlines()
with open('y:\\ijigenpocket\\corrupted_lines.txt', 'w', encoding='utf-8') as out:
    for i, line in enumerate(lines):
        if re.search(r'E(?:</|/|\))', line) or 'E>' in line or 'E<' in line or 'ぁE' in line or 'チE' in line or 'めE' in line or '問E' in line or 'てぁE' in line or 'E?' in line or 'E\"' in line or 'E=' in line or 'E ' in line or ' E' in line or 'E\\' in line or 'E,' in line or 'E.' in line or 'E:' in line or 'E;' in line or 'E-' in line or 'E_' in line or 'E+' in line or 'E*' in line or 'E&' in line or 'E%' in line or 'E$' in line or 'E#' in line or 'E@' in line or 'E!' in line or 'E~' in line or 'E`' in line or 'E|' in line or 'E\\\\' in line or 'E/' in line or 'E{' in line or 'E}' in line or 'E[' in line or 'E]' in line or 'E(' in line or 'E)' in line:
            out.write(f'{i+1}: {line.strip()}\\n')
