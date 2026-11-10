import json

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            output = data.get('output', '')
            if output and 'Total Lines' in output and 'ccfolialayoutmaker_ai.js' in output:
                print(f"Step {data.get('step_index')} output preview:")
                print(output[:250])
                print("-" * 50)
                # ファイルに保存
                with open(f'scratch/recovered_step_{data.get("step_index")}.txt', 'w', encoding='utf-8') as out_f:
                    out_f.write(output)
        except Exception as e:
            pass
