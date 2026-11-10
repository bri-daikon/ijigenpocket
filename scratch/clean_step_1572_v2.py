import json

# Let's read from the transcript log directly for step 1572
log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 1572:
            try:
                data = json.loads(line)
                args = data['tool_calls'][0]['args']
                content = args.get('ReplacementContent', '')
                
                # Check for Mojibake and restore
                try:
                    content = content.encode('latin-1').decode('utf-8')
                except Exception:
                    pass
                
                with open('y:/ijigenpocket/scratch/step_1572_clean_v2.js', 'w', encoding='utf-8') as out_f:
                    out_f.write(content)
                print("Step 1572 clean extraction successful!")
                print("Length:", len(content))
                print("Sample:")
                print(content[:300])
            except Exception as e:
                print(f"Error: {e}")
            break
