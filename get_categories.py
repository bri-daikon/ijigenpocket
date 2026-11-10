import re
with open(r'y:\ijigenpocket\new\本文.txt', 'r', encoding='utf-8') as f:
    text = f.read()
lines = text.split('\n')
categories = []
current_cat = None
current_items = []
for line in lines:
    line = line.strip()
    if "キャラちょすおーとらんだむ！" in line:
        continue
    if not line:
        if current_cat and current_items:
            categories.append(current_cat)
            current_cat = None
            current_items = []
        continue
    if current_cat is None:
        if not re.match(r'^\d+[.．]', line):
            current_cat = line
    else:
        parts = line.replace('，', ',').split(',')
        for p in parts:
            if p.strip(): current_items.append(p.strip())
if current_cat and current_items:
    categories.append(current_cat)
for i, c in enumerate(categories, 1):
    print(f"{i}. {c}")
