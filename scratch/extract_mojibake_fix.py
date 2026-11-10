import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

def fix_mojibake(text):
    if not text:
        return text
    # Character by character fallback to avoid encoder errors on non-latin-1 characters like quotes
    res = []
    for char in text:
        try:
            # latin-1 maps 1-to-1 to codepoints 0-255
            b = char.encode('latin-1')
            res.append(b)
        except Exception:
            # If it cannot be encoded in latin-1, it's a native unicode char, keep it as is (but as bytes)
            res.append(char.encode('utf-8'))
    # Join bytes and decode as utf-8
    try:
        return b"".join(res).decode('utf-8')
    except Exception:
        return text

# Let's extract step 1250 and output the fixed version
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if idx == 1250:
            try:
                data = json.loads(line)
                args = data['tool_calls'][0]['args']
                content = args.get('ReplacementContent', '')
                fixed = fix_mojibake(content)
                with open('y:/ijigenpocket/scratch/step_1250_fixed.js', 'w', encoding='utf-8') as out_f:
                    out_f.write(fixed)
                print("Step 1250 extracted and fixed.")
                print(fixed[:300])
            except Exception as e:
                print(f"Error: {e}")
            break
