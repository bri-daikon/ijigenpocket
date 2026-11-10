log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

found = False
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if '1851' in line:
            found = True
            print(f"Log line {idx} contains '1851':")
            pos = line.find('1851')
            start = max(0, pos - 200)
            end = min(len(line), pos + 200)
            print(line[start:end])
            print("=" * 50)

if not found:
    print("No line in transcript.jsonl contains '1851'.")
