import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    unified_text = f.read().replace('\\n', '\n').replace('\\r\\n', '\n')

blocks = re.findall(r'(Showing lines \d+ to \d+|File Path: .*ccfolialayoutmaker_ai.js)([\s\S]*?)(?="type":|"step_index":|$)', unified_text)

clean_lines = {}
for header, block in blocks:
    if "ã‚" in block or "ãƒ" in block or "çŠ" in block:
        continue
    lines = re.findall(r'(?:^|\n)(\d+): (.*)(?=\n|$)', block)
    for num_str, content in lines:
        num = int(num_str)
        clean_lines[num] = content

missing_after_1610 = [i for i in range(1610, 3057) if i not in clean_lines]
print(f"Missing lines after 1610 count: {len(missing_after_1610)}")
if missing_after_1610:
    print(f"All missing lines after 1610: {missing_after_1610}")
else:
    print("No missing lines after 1610. Excellent!")
