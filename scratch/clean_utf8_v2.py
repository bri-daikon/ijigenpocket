with open('y:/ijigenpocket/scratch/step_1250_replacement.js', 'r', encoding='utf-8') as f:
    content = f.read()

try:
    # Use latin-1 (exactly maps 0-255 code points to bytes)
    reconstructed = content.encode('latin-1').decode('utf-8')
    with open('y:/ijigenpocket/scratch/step_1250_reconstructed_v2.js', 'w', encoding='utf-8') as out_f:
        out_f.write(reconstructed)
    print("Reconstructed step 1250 successfully with latin-1 codec.")
    print("Sample:")
    print(reconstructed[:300])
except Exception as e:
    print(f"Error: {e}")
