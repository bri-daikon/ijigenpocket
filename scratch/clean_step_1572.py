import json

with open('y:/ijigenpocket/scratch/step_1572_replacement.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Since step_1572_replacement.js was output directly from json string, let's decode it
try:
    # If the file starts with a double quote, we can load it as JSON string
    # Actually, we can just use json.loads('{"c":' + content + '}')['c']
    # Let's write a robust parser
    if content.startswith('"') and content.endswith('"'):
        # JSON string
        decoded = json.loads(content)
    else:
        # Wrap it if needed
        decoded = json.loads('"' + content + '"')
    
    # Also, we need to fix any Mojibake in this string
    # Mojibake recovery
    try:
        decoded = decoded.encode('latin-1').decode('utf-8')
    except Exception:
        pass
        
    with open('y:/ijigenpocket/scratch/step_1572_clean.js', 'w', encoding='utf-8') as out_f:
        out_f.write(decoded)
    print("Decoded step 1572 successfully.")
    print("Length:", len(decoded))
except Exception as e:
    print(f"Error: {e}")
