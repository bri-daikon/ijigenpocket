import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
ROOT_HTML = ROOT_DIR / "PdfEasyConverter.html"
WIN_DIR = ROOT_DIR / "PdfEasyConverter-Windows"
WIN_SOURCE_HTML = WIN_DIR / "source" / "PdfEasyConverter.light.source.html"
WIN_WWW_HTML = WIN_DIR / "www" / "index.html"
BUILD_PS1 = WIN_DIR / "source" / "build.ps1"

REPLACEMENTS = [
    ("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap", "vendor/fonts/fonts.css"),
    ("https://unpkg.com/lucide@latest", "https://pdfeasyconverter.local/vendor/lucide.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js", "https://pdfeasyconverter.local/vendor/pdf.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js", "https://pdfeasyconverter.local/vendor/pdf.worker.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", "https://pdfeasyconverter.local/vendor/jszip.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js", "https://pdfeasyconverter.local/vendor/mammoth.browser.min.js"),
]

def sync(build=False):
    if not ROOT_HTML.exists():
        print(f"Error: {ROOT_HTML} not found.", file=sys.stderr)
        return False

    with open(ROOT_HTML, "r", encoding="utf-8") as f:
        content = f.read()

    for src, dst in REPLACEMENTS:
        if src not in content:
            print(f"Warning: CDN URL pattern '{src}' not found in {ROOT_HTML.name}")
        content = content.replace(src, dst)

    WIN_SOURCE_HTML.parent.mkdir(parents=True, exist_ok=True)
    with open(WIN_SOURCE_HTML, "w", encoding="utf-8") as f:
        f.write(content)

    WIN_WWW_HTML.parent.mkdir(parents=True, exist_ok=True)
    with open(WIN_WWW_HTML, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Successfully synced {ROOT_HTML.name} -> {WIN_SOURCE_HTML.relative_to(ROOT_DIR)} & {WIN_WWW_HTML.relative_to(ROOT_DIR)}")

    if build and BUILD_PS1.exists():
        print("Running Windows build...")
        res = subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", str(BUILD_PS1)], capture_output=True, text=True)
        print(res.stdout)
        if res.returncode != 0:
            print(res.stderr, file=sys.stderr)
            return False

    return True

if __name__ == "__main__":
    run_build = "--build" in sys.argv
    success = sync(build=run_build)
    sys.exit(0 if success else 1)

