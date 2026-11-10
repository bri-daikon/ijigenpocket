import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

# We will scan transcript.jsonl and look for the VIEW_FILE or similar blocks
# where actionIconsData is defined and print the surrounding lines.
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'actionIconsData' in line:
            try:
                data = json.loads(line)
                content = data.get('content', '')
                if not content:
                    continue
                # If content is a view_file with line numbers, let's look for actionIconsData
                if 'actionIconsData' in content:
                    print(f"[{idx}] found in content (length {len(content)})")
                    # Save the content block to a file for review
                    out_name = f"y:/ijigenpocket/scratch/step_{idx}_actionIconsData.txt"
                    with open(out_name, 'w', encoding='utf-8') as out_f:
                        out_f.write(content)
                    print(f"  Saved to {out_name}")
            except Exception as e:
                print(f"Error on step {idx}: {e}")
