import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        if 'ccfolialayoutmaker_ai.js' in line:
            try:
                data = json.loads(line)
                print(f"[{idx}] Keys: {list(data.keys())}")
                print(f"Type: {data.get('type')}, Source: {data.get('source')}, Status: {data.get('status')}")
                # Print sample content if it's not too long
                content = data.get('content', '')
                if content:
                    print(f"Content length: {len(content)}")
                    print(f"Content sample: {content[:200]}")
                # Check tool calls
                # It might be 'tool_calls' in planner response or similar
                for k, v in data.items():
                    if 'tool' in k or 'call' in k:
                        print(f"Found key: {k} -> {str(v)[:200]}")
                print("-" * 50)
                if idx > 1000: # Limit output
                    break
            except Exception as e:
                print(f"Error parsing line {idx}: {e}")
