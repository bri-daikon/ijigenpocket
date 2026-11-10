import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'
output_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'

lines_dict = {}

def extract_from_text(text):
    if 'ccfolialayoutmaker_ai.js' in text and ('Total Lines:' in text or 'Showing lines' in text or 'File Path:' in text):
        matches = re.findall(r'^(\d+): (.*)$', text, re.MULTILINE)
        for num_str, content in matches:
            num = int(num_str)
            lines_dict[num] = content

with open(log_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            
            # Check content
            if 'content' in data and data['content']:
                extract_from_text(data['content'])
            
            # Check tool_calls outputs
            if 'tool_calls' in data and data['tool_calls']:
                for tc in data['tool_calls']:
                    if isinstance(tc, dict):
                        # check tool output in various shapes
                        for k, v in tc.items():
                            if isinstance(v, str):
                                extract_from_text(v)
                            elif isinstance(v, dict):
                                if 'output' in v and isinstance(v['output'], str):
                                    extract_from_text(v['output'])
            
            # Check direct output
            if 'output' in data and data['output'] and isinstance(data['output'], str):
                extract_from_text(data['output'])
                
        except Exception as e:
            continue

print(f"Total lines extracted: {len(lines_dict)}")
if len(lines_dict) > 0:
    max_line = max(lines_dict.keys())
    print(f"Max line number: {max_line}")
    
    missing = [i for i in range(1, max_line + 1) if i not in lines_dict]
    print(f"Missing lines count: {len(missing)}")
    if missing:
        print(f"First few missing lines: {missing[:10]}")
        
    with open(output_js_path, 'w', encoding='utf-8', newline='\r\n') as out_f:
        for i in range(1, max_line + 1):
            out_f.write(lines_dict.get(i, '') + '\n')
    print(f"Successfully restored JS file to {output_js_path}!")
else:
    print("No lines extracted from transcript.")
