import os
import re

scratch_dir = 'y:/ijigenpocket/scratch'
files = os.listdir(scratch_dir)

for f_name in files:
    if f_name.endswith('_theme_def.txt'):
        path = os.path.join(scratch_dir, f_name)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'themeSvgGenerators' in content and 'cyberpunk' in content:
                    print(f"File {f_name} (length {len(content)})")
                    # Let's search for "themeSvgGenerators" up to the next theme "horror"
                    match = re.search(r'const themeSvgGenerators = \{(.*?)(?=horror:|$)', content, re.DOTALL)
                    if match:
                        sub = match.group(1)
                        print(f"  Found match of length {len(sub)}")
                        if len(sub) > 500:
                            print("  -> Looks like it contains most of cyberpunk!")
                            print("  Sample:")
                            print(sub[:400])
                            print("...")
                            print(sub[-300:])
        except Exception as e:
            continue
