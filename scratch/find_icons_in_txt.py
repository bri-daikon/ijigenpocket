import os
import re

scratch_dir = 'y:/ijigenpocket/scratch'
files = os.listdir(scratch_dir)

for f_name in files:
    if f_name.startswith('step_') and f_name.endswith('_lines.txt'):
        path = os.path.join(scratch_dir, f_name)
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'actionIconsData' in content:
                    print(f"File {f_name} contains 'actionIconsData' (length {len(content)})")
                    match = re.search(r'const actionIconsData = \[(.*?)\];', content, re.DOTALL)
                    if match:
                        print("  Found [ ... ] match!")
                        # check if it contains "library" and "idea" and "san"
                        sub_content = match.group(1)
                        if 'library' in sub_content and 'idea' in sub_content and 'san' in sub_content:
                            print("  -> CONTAINS ALL ICONS!")
                            out_path = 'y:/ijigenpocket/scratch/action_icons_perfect_from_txt.js'
                            with open(out_path, 'w', encoding='utf-8') as out_f:
                                out_f.write("const actionIconsData = [" + sub_content + "];")
                            print(f"  Saved to {out_path}")
                            break
                    else:
                        # Maybe it doesn't end with ]; in this specific view but contains most lines
                        # let's print lines starting with number: actionIconsData
                        lines = content.splitlines()
                        for line in lines:
                            if 'actionIconsData' in line or 'name:' in line or 'label:' in line:
                                print(f"    {line[:100]}")
        except Exception as e:
            print(f"Error reading {f_name}: {e}")
