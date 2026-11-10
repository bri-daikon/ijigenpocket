import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'actionIconsData' in line or 'name: "spot"' in line or 'name: \\"spot\\"' in line:
            print(f"[{idx}] found match!")
            # Print around match
            pos = line.find('spot')
            start = max(0, pos - 500)
            end = min(len(line), pos + 1000)
            print(line[start:end])
            print("=" * 60)
