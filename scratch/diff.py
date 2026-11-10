import difflib

with open(r"y:\ijigenpocket\js\kakerukun.js", "r", encoding="utf-8") as f1:
    lines1 = f1.readlines()

with open(r"y:\ijigenpocket\js\kakerukun_backup.js", "r", encoding="utf-8") as f2:
    lines2 = f2.readlines()

diff = difflib.unified_diff(lines2, lines1, fromfile="kakerukun_backup.js", tofile="kakerukun.js")
print("".join(diff))
