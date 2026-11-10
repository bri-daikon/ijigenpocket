import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

# We look for lines containing "name: \"idea\"" or similar in view_file logs
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'ccfolialayoutmaker_ai.js' in line and 'Showing lines' in line:
            if 'idea' in line or 'library' in line or 'growth' in line:
                try:
                    data = json.loads(line)
                    content = data.get('content', '')
                    if not content:
                        continue
                    # print information
                    lines = content.splitlines()
                    showing_range = ""
                    for l in lines:
                        if 'Showing lines' in l:
                            showing_range = l
                            break
                    print(f"[{idx}] {showing_range} (length {len(content)})")
                    
                    # If this block covers line numbers like 1720-1780
                    # Let's write it to a file
                    out_name = f"y:/ijigenpocket/scratch/step_{idx}_icons_v2.txt"
                    with open(out_name, 'w', encoding='utf-8') as out_f:
                        out_f.write(content)
                    print(f"  Saved to {out_name}")
                except Exception as e:
                    continue
