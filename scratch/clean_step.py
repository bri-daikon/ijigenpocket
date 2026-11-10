import json

with open('y:/ijigenpocket/scratch/step_1250_replacement.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to parse it as JSON if it is a JSON string (with surrounding quotes and escapes)
try:
    # If the content is wrapped in quotes like "..." and contains escaped double quotes
    # we can parse it as a JSON string to unescape it
    # We wrap it as a JSON array or object if needed, or try json.loads directly
    # Since it is a string representation from JSON, we can do json.loads('"' + content + '"') or similar.
    # Let's try parsing directly first, or using eval / ast.literal_eval.
    # Actually, since it was written as args['ReplacementContent'], it's a raw string in python.
    # But in the log, it was JSON encoded. Our extract_full.py did:
    # out_f.write(args['ReplacementContent'])
    # args['ReplacementContent'] should already be a decoded python string!
    # Let's check if there are actual escaped newlines or just literal "\n" strings.
    # If it contains literal '\n' and '\"', we can decode it.
    decoded = content.encode('utf-8').decode('unicode_escape')
    with open('y:/ijigenpocket/scratch/step_1250_clean.js', 'w', encoding='utf-8') as out_f:
        out_f.write(decoded)
    print("Decoded using unicode_escape.")
except Exception as e:
    print(f"Error decoding: {e}")
    # Fallback: just write as is
    with open('y:/ijigenpocket/scratch/step_1250_clean.js', 'w', encoding='utf-8') as out_f:
        out_f.write(content)
