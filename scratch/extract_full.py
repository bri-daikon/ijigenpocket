import json
import os

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        try:
            data = json.loads(line)
            tool_calls = data.get('tool_calls', [])
            if not tool_calls:
                continue
            for tc in tool_calls:
                name = tc.get('name', '')
                if name in ['replace_file_content', 'write_to_file', 'multi_replace_file_content']:
                    args = tc.get('args', {})
                    target = args.get('TargetFile', args.get('targetFile', ''))
                    if 'ccfolialayoutmaker_ai.js' in target:
                        print(f"=== STEP {idx}: {name} ===")
                        print(f"Description: {args.get('Description', args.get('description'))}")
                        print(f"StartLine: {args.get('StartLine')} | EndLine: {args.get('EndLine')}")
                        if 'TargetContent' in args:
                            print(f"TargetContent Length: {len(args['TargetContent'])}")
                        if 'ReplacementContent' in args:
                            print(f"ReplacementContent Length: {len(args['ReplacementContent'])}")
                            # Write this replacement content to a temporary file for analysis
                            out_name = f"y:/ijigenpocket/scratch/step_{idx}_replacement.js"
                            with open(out_name, 'w', encoding='utf-8') as out_f:
                                out_f.write(args['ReplacementContent'])
                            print(f"Saved replacement to {out_name}")
                        if 'ReplacementChunks' in args:
                            print(f"ReplacementChunks count: {len(args['ReplacementChunks'])}")
                            for c_idx, chunk in enumerate(args['ReplacementChunks']):
                                out_name = f"y:/ijigenpocket/scratch/step_{idx}_chunk_{c_idx}.js"
                                with open(out_name, 'w', encoding='utf-8') as out_f:
                                    out_f.write(chunk.get('ReplacementContent', ''))
                                print(f"  Saved chunk {c_idx} to {out_name}")
                        print("-" * 50)
        except Exception as e:
            # print(f"Error at line {idx}: {e}")
            continue
