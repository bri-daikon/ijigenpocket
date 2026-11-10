import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

# Search for the definition of themeSvgGenerators or cyberpunk bg SVG in transcript logs
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'themeSvgGenerators' in line or 'cyberpunk: {' in line or 'cyberpunk:{\n' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if not content:
                    continue
                # Skip Mojibake
                if "ã‚" in content or "ãƒ" in content or "çŠ" in content:
                    continue
                
                print(f"[{idx}] found match!")
                # Let's save the content to a file to check
                out_name = f"y:/ijigenpocket/scratch/step_{idx}_cyberpunk.txt"
                with open(out_name, 'w', encoding='utf-8') as out_f:
                    out_f.write(content)
                print(f"  Saved to {out_name}")
            except Exception as e:
                continue
