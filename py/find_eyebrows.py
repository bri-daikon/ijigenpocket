with open('y:/ijigenpocket/GzsoPronptKun.html', 'r', encoding='utf8') as f:
    for i, l in enumerate(f):
        if 'eyebrows' in l:
            print(f"{i+1}: {l.strip()}")
