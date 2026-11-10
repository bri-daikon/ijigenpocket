import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 1572:
            try:
                data = json.loads(line)
                args = data['tool_calls'][0]['args']
                content = args.get('ReplacementContent', '')
                
                # In the log, content is a serialized JSON string.
                # If we parse it twice:
                # 1. json.loads(line) parses the JSON line, which decodes the outermost string wrappers.
                # 2. But the value in the log itself was a double-encoded string literal like '"\"const ...\""'.
                # So we can decode it again using json.loads
                try:
                    # Let's try parsing it as a JSON string to resolve all escapes
                    # Note: We must make sure it is wrapped in double quotes for json.loads to treat it as a string
                    if not content.startswith('"'):
                        content = '"' + content + '"'
                    decoded_content = json.loads(content)
                except Exception as e:
                    print(f"Second json.loads failed: {e}. Fallback to manual replace.")
                    decoded_content = content.replace('\\n', '\n').replace('\\r\\n', '\n').replace('\\t', '\t').replace('\\"', '"').replace('\\\\', '\\')
                
                # Check for Mojibake and restore
                # If it was written from a cp1252 source but mis-decoded as utf-8,
                # we encode as cp1252/latin-1 and decode as utf-8
                try:
                    decoded_content = decoded_content.encode('cp1252').decode('utf-8')
                except Exception:
                    try:
                        decoded_content = decoded_content.encode('latin-1').decode('utf-8')
                    except Exception:
                        pass
                
                with open('y:/ijigenpocket/scratch/step_1572_correct.js', 'w', encoding='utf-8') as out_f:
                    out_f.write(decoded_content)
                print("Step 1572 correct extraction successful!")
            except Exception as e:
                print(f"Error: {e}")
            break
