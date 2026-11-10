import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 1572:
            try:
                data = json.loads(line)
                args = data['tool_calls'][0]['args']
                content = args.get('ReplacementContent', '')
                
                # If it is double-quoted, decode JSON string
                if content.startswith('"') and content.endswith('"'):
                    content = json.loads(content)
                else:
                    # Sometimes content is already string but we need to unescape newlines
                    # We can use unicode_escape or raw_unicode_escape
                    content = content.encode('utf-8').decode('unicode_escape')
                
                # Check for Mojibake and restore
                # If we encode as cp1252/latin-1 and decode as utf-8, it restores the original text
                try:
                    content = content.encode('cp1252').decode('utf-8')
                except Exception:
                    try:
                        content = content.encode('latin-1').decode('utf-8')
                    except Exception:
                        pass
                
                with open('y:/ijigenpocket/scratch/step_1572_perfect.js', 'w', encoding='utf-8') as out_f:
                    out_f.write(content)
                print("Step 1572 perfect extraction successful!")
                print("Length:", len(content))
                print("Sample:")
                print(content[:300])
            except Exception as e:
                print(f"Error: {e}")
            break
