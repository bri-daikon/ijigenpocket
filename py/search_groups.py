lines = open('y:/ijigenpocket/GzsoPronptKun.html', encoding='utf8').readlines()
for i, l in enumerate(lines):
    if 'data-group="leftEyeColor"' in l or 'data-group="nailColor"' in l:
        print(f'{i+1}: {l.strip()}')
