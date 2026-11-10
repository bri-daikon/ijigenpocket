import os

scratch_dir = 'y:/ijigenpocket/scratch'
files = os.listdir(scratch_dir)

for f_name in files:
    if f_name.startswith('step_') and f_name.endswith('.js'):
        path = os.path.join(scratch_dir, f_name)
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'actionIconsData' in content:
                    print(f"File {f_name} contains 'actionIconsData' (length {len(content)})")
                    # Let's search for the start and end of actionIconsData
                    import re
                    match = re.search(r'const actionIconsData = \[(.*?)\];', content, re.DOTALL)
                    if match:
                        print(f"  Found complete definition! Length: {len(match.group(0))}")
                        # If the match looks clean (no Mojibake), print it or save it
                        if "ã‚" not in match.group(0):
                            out_path = 'y:/ijigenpocket/scratch/action_icons_perfect.js'
                            with open(out_path, 'w', encoding='utf-8') as out_f:
                                out_f.write("const actionIconsData = [" + match.group(1) + "];")
                            print(f"  Saved clean version to {out_path}")
                            break
        except Exception as e:
            continue
