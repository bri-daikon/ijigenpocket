import os

filepath = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'
encodings = ['utf-8', 'shift_jis', 'cp932', 'latin-1']

content = None
for enc in encodings:
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
        content = raw.decode(enc)
        print(f"Decoded successfully with: {enc}")
        break
    except UnicodeDecodeError:
        continue
    except Exception as e:
        print(f"Error reading with {enc}: {e}")

if content:
    try:
        with open(filepath, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(content)
        print("Re-saved file as clean UTF-8.")
    except Exception as e:
        print(f"Error saving file: {e}")
else:
    print("Failed to decode with any encoding.")
