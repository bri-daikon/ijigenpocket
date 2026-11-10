import re
with open('y:/ijigenpocket/GzsoPronptKun.html', 'r', encoding='utf8') as f:
    lines = f.readlines()
groups = [re.search(r'data-group="(.*?)"', l).group(1) for l in lines if 'data-group=' in l]
print("--- ALL GROUPS ---")
for g in groups:
    print(g)
