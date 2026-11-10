import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

# We will scan from the bottom (newest) of the log to the top
# and try to extract a clean actionIconsData declaration.
lines = []
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

found = False
for idx in range(len(lines) - 1, -1, -1):
    line = lines[idx]
    if 'actionIconsData' in line:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if not content:
                continue
            
            # Check for Mojibake
            if "ã‚" in content or "ãƒ" in content or "çŠ" in content or "ã€" in content:
                continue
                
            # Let's search for "const actionIconsData = [" up to "];"
            # Using regex with flags=re.DOTALL
            match = re.search(r'const actionIconsData = \[(.*?)\];', content, re.DOTALL)
            if match:
                print(f"Found clean actionIconsData at step {idx}")
                # Save block
                block = "const actionIconsData = [" + match.group(1) + "];"
                with open('y:/ijigenpocket/scratch/action_icons_fixed.js', 'w', encoding='utf-8') as out_f:
                    out_f.write(block)
                print("Saved to y:/ijigenpocket/scratch/action_icons_fixed.js")
                found = True
                break
        except Exception as e:
            continue

if not found:
    print("Could not find clean actionIconsData block.")
