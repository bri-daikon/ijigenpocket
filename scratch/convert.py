import os

filepath = 'js/ccfolialayoutmaker_ai.js'

with open(filepath, 'rb') as f:
    raw_lines = f.readlines()

decoded_lines = []
for idx, line in enumerate(raw_lines):
    try:
        decoded = line.decode('utf-8')
    except UnicodeDecodeError:
        try:
            decoded = line.decode('cp932')
        except UnicodeDecodeError:
            decoded = line.decode('utf-8', errors='ignore')
            print(f"Warning: Line {idx+1} could not be cleanly decoded.")
    decoded_lines.append(decoded)

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.writelines(decoded_lines)

print("Conversion complete.")
