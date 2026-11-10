import json

# Read step_1250_replacement.js (which was written as args['ReplacementContent'])
with open('y:/ijigenpocket/scratch/step_1250_replacement.js', 'r', encoding='utf-8') as f:
    content = f.read()

try:
    # Try decoding latin-1 mojibake into utf-8
    # Since content was written as utf-8, it contains characters like 'ä¾ é ¼'
    # We can encode it to latin-1 (or iso-8859-1) and decode as utf-8.
    reconstructed = content.encode('iso-8859-1', errors='ignore').decode('utf-8', errors='ignore')
    with open('y:/ijigenpocket/scratch/step_1250_reconstructed.js', 'w', encoding='utf-8') as out_f:
        out_f.write(reconstructed)
    print("Reconstructed step 1250 successfully.")
    print("Sample:")
    print(reconstructed[:300])
except Exception as e:
    print(f"Error: {e}")
