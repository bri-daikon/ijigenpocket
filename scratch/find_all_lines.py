import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'
output_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    full_text = f.read()

# Replace escaped newlines with actual newlines to simplify regex
unified_text = full_text.replace('\\n', '\n').replace('\\r\\n', '\n')

# Find all occurrences of "<line_number>: <content>"
# We look for lines starting with digits followed by a colon and a space
matches = re.findall(r'(?:^|\n)(\d+): (.*)(?=\n|$)', unified_text)

lines_dict = {}
for num_str, content in matches:
    num = int(num_str)
    # Latin-1 decoded garbled content might be present in the logs from the very end of the file.
    # We should avoid overwriting clean content with the garbled version if the content looks heavily corrupted.
    # Clean lines in js file usually don't have excessive "ã‚" or similar characters unless it's the broken version.
    is_garbled = "ã‚" in content or "ãƒ" in content or "çŠ" in content
    
    if num not in lines_dict or not is_garbled:
        # If it's not in dict, or if we have a clean version, save it.
        # Clean version from previous steps will not contain these Mojibake.
        lines_dict[num] = content

# If there's an existing clean line, but the latest matched is garbled, we prefer the clean one.
# Let's filter matches. We can do a second pass to look for the view_file logs specifically from ccfolialayoutmaker_ai.js.
# Actually, the best way is to only parse view_file sections that do NOT contain Mojibake.
# In unified_text, view_file output starts with "Showing lines" or "File Path:".
# Let's find all blocks of view_file of ccfolialayoutmaker_ai.js.
blocks = re.findall(r'(Showing lines \d+ to \d+|File Path: .*ccfolialayoutmaker_ai.js)([\s\S]*?)(?="type":|"step_index":|$)', unified_text)

clean_lines = {}
for header, block in blocks:
    # If the block contains Mojibake, skip it (it's from the failed fix attempt at the end of logs)
    if "ã‚" in block or "ãƒ" in block or "çŠ" in block:
        continue
    
    # Extract lines
    lines = re.findall(r'(?:^|\n)(\d+): (.*)(?=\n|$)', block)
    for num_str, content in lines:
        num = int(num_str)
        # Clean lines only
        clean_lines[num] = content

print(f"Total clean lines found in view_file blocks: {len(clean_lines)}")
if clean_lines:
    max_line = max(clean_lines.keys())
    print(f"Max line: {max_line}")
    missing = [i for i in range(1, max_line + 1) if i not in clean_lines]
    print(f"Missing count: {len(missing)}")
    if missing:
        print(f"Missing lines: {missing[:20]}")
        
    # Let's see if we can restore
    with open(output_js_path, 'w', encoding='utf-8', newline='\r\n') as out_f:
        for i in range(1, max_line + 1):
            line_content = clean_lines.get(i, '')
            # Clean up JSON escapes if any
            line_content = line_content.replace('\\"', '"').replace('\\\\', '\\')
            out_f.write(line_content + '\n')
    print("Restore attempt completed.")
else:
    print("No clean lines found.")
