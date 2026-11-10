import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8') as f:
        text = f.read()
    
    match = re.search(r'<script type="module">(.*?)</script>', text, re.DOTALL)
    if match:
        script = match.group(1)
        with open('y:\\ijigenpocket\\temp_script_check.js', 'w', encoding='utf-8') as f:
            f.write(script)
        print("Extracted JS successfully.")
    else:
        print("Could not find <script type=\"module\"> block.")

if __name__ == '__main__':
    main()
