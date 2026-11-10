import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                method = tc.get('method', '')
                if 'replace_file_content' in method or 'write_to_file' in method or 'multi_replace_file_content' in method:
                    args = tc.get('args', {})
                    target = args.get('TargetFile', args.get('targetFile', ''))
                    if 'ccfolialayoutmaker_ai.js' in target:
                        print(f"[{idx}] Tool: {method}")
                        print(f"Description: {args.get('Description', args.get('description', ''))}")
                        # We print keys and brief details
                        for k, v in args.items():
                            if k not in ['CodeContent', 'ReplacementContent', 'ReplacementChunks', 'targetContent', 'replacementContent']:
                                print(f"  {k}: {v}")
                        print("-" * 40)
        except Exception as e:
            continue
