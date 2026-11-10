import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

# Look for view_file outputs of ccfolialayoutmaker_ai.js that cover lines around 1720-1760
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'ccfolialayoutmaker_ai.js' in line and 'Showing lines' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if not content:
                    continue
                # If content covers lines around 1725-1750
                # "Showing lines 1720 to 1800" or similar
                if 'Showing lines' in content:
                    print(f"[{idx}] {content.splitlines()[3] if len(content.splitlines()) > 3 else content[:50]}")
                    if '1720' in content or '1730' in content or '1740' in content or '1750' in content or '1760' in content:
                        out_name = f"y:/ijigenpocket/scratch/step_{idx}_lines.txt"
                        with open(out_name, 'w', encoding='utf-8') as out_f:
                            out_f.write(content)
                        print(f"  Saved to {out_name}")
            except Exception as e:
                continue
