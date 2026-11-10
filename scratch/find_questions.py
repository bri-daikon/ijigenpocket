import re

filepath = r"y:\ijigenpocket\js\ccfolialayoutmaker_ai.js"
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '?' in line or '？' in line:
        # 三項演算子や正規表現の \? を簡易的に除外（?の後にスペースがある、または単なる \? などは除外）
        # ただし、確実にするため、怪しい行をすべてリストアップする
        print(f"{i+1}: {line.strip()}")
