import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'
base_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker.js'
output_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'

lines_dict = {}

# 1. Read base JS file (lines 1 to 1603)
with open(base_js_path, 'r', encoding='utf-8') as f:
    base_lines = f.readlines()
print("Base file read.")

for idx, line in enumerate(base_lines):
    lines_dict[idx + 1] = line.rstrip('\r\n')

# 2. Extract AI specific code from the transcript logs for lines 1604 and above
# We scan logs from top to bottom.
# We look for all VIEW_FILE blocks of ccfolialayoutmaker_ai.js
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if content and 'ccfolialayoutmaker_ai.js' in content and ('Total Lines:' in content or 'Showing lines' in content or 'File Path:' in content):
                # Skip if it contains Mojibake
                if "ã‚" in content or "ãƒ" in content or "çŠ" in content or "ã€" in content or "ãƒª" in content:
                    continue
                
                # Check line range
                matches = re.findall(r'^(\d+): (.*)$', content, re.MULTILINE)
                for num_str, line_content in matches:
                    num = int(num_str)
                    if num >= 1604:
                        clean_line = line_content.replace('\\"', '"').replace('\\\\', '\\')
                        lines_dict[num] = clean_line
        except Exception as e:
            continue

# Let's inspect the reconstructed dictionary before applying manual patches
max_line = max(lines_dict.keys())
print(f"Before manual patches: max line = {max_line}")
missing = [i for i in range(1, max_line + 1) if i not in lines_dict]
print(f"Missing count: {len(missing)}")

# 3. Apply manual patches to fix known broken parts in transcript logs

# SYSTEM_RULE_PORTRAIT and SYSTEM_RULE_LANDSCAPE
lines_dict[1613] = 'const SYSTEM_RULE_PORTRAIT = `◯ココフォリア部屋縦長用'
lines_dict[1614] = 'まず下記のココフォリア部屋画像生成ルールを学習して下さい。'
lines_dict[1615] = ''
lines_dict[1616] = '＜ルール＞'
lines_dict[1617] = '指示されたテーマにそって独創的で魅力的にデザインする。'
lines_dict[1618] = 'ココフォリアの基本構造（メニュー、タイトル、前景、立ち絵置き場、特殊エリア、便利ボタン）を維持し、縦長の画像範囲内に縦に順に並べて(最上にメニュー、その下にタイトル、前景、立ち絵置き場、特殊エリア、最下に便利ボタン)美しく配置されたレイアウトにする。'
lines_dict[1619] = 'タイトルとメニューと便利ボタン以外の文字情報を画像内に描画しないこと。（エリア名、枠の解説、項目名などの文字は一切描写しない）'
lines_dict[1620] = 'エリアの大きさ（占有率）の優先順位は、PC立ち絵置き場 ＞ 前景窓 ＞ 特殊エリア ＞ メニュー ＞ タイトル ＞ 便利ボタン とする。'
lines_dict[1621] = '画面全体にギチギチに配置せず、TRPGのセッション時に窮屈さを感じないよう、美しい余白 and ゆとりを持たせ、全てのパーツは重ならないようにする。'
lines_dict[1622] = ''
lines_dict[1623] = '1) 前景エリア（優先度：高）'
lines_dict[1624] = 'ゲームのシーン写真や背景が表示される主要な窓（フレーム）。四角や丸型など、全体のデザインテーマに合わせた枠線や装飾で表現する。文字情報はなし。'
lines_dict[1625] = ''
lines_dict[1626] = '2) PC立ち絵エリア'
lines_dict[1627] = 'キャラクターの全身立ち絵が並ぶための透過スペース、または枠線を確保する。'
lines_dict[1628] = 'ユーザーから指定された人数分の縦長のスペースを、横に並べる。'
lines_dict[1629] = '※重要：キャラクターのイラストやシルエット、は一切画像内に描かないでください。純粋な「スペース・枠」のみを描写します。文字情報はなし。'
lines_dict[1630] = ''
lines_dict[1631] = '3) メニュー'
lines_dict[1632] = "全体の雰囲気に合わせ、小洒落たデザインで配置する。メニューという項目名はなし。"
lines_dict[1633] = ''
lines_dict[1634] = '4) 便利ボタン'
lines_dict[1635] = '全体の雰囲気に合わせ、小洒落たアイコンで配置する。便利ボタンという項目名はなし。'
lines_dict[1636] = ''
lines_dict[1637] = '5) 特殊エリア'
lines_dict[1638] = 'ユーザーから明示的な指示があった場合のみ、そのスペースを確保する。指示がない場合は描かない。文字情報はなし。'
lines_dict[1639] = ''
lines_dict[1640] = '6) タイトル'
lines_dict[1641] = 'ユーザーから明示的な指示があった場合のみ、装飾した文字で描画する。指示がない場合は描かない。'
lines_dict[1642] = ''
lines_dict[1643] = '学習した指示に基づき、以下の指定でココフォリア部屋画像を生成してください。`;'
lines_dict[1644] = ''
lines_dict[1645] = 'const SYSTEM_RULE_LANDSCAPE = `◯ココフォリア部屋横長用'
lines_dict[1646] = '（ルールは縦長と同様で、ココフォリアの基本構造を維持し、横長の画像範囲内に美しく配置されたレイアウトにする）`;'
lines_dict[1647] = ''

# actionIconsData definition (lines 1648 to 1675)
lines_dict[1648] = 'const actionIconsData = ['
lines_dict[1649] = '  {'
lines_dict[1650] = '    name: "spot",'
lines_dict[1651] = '    label: "目星",'
lines_dict[1652] = '    sub: "SPOT",'
lines_dict[1653] = '    path: `<path d="M15,40 Q40,15 65,40 Q40,65 15,40 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="8" fill="none" stroke="#00f0ff" stroke-width="2"/><circle cx="40" cy="40" r="3" fill="#ff007f"/>`'
lines_dict[1654] = '  },'
lines_dict[1655] = '  {'
lines_dict[1656] = '    name: "listen",'
lines_dict[1657] = '    label: "聞き耳",'
lines_dict[1658] = '    sub: "LISTEN",'
lines_dict[1659] = '    path: `<path d="M30,30 C30,20 45,15 50,25 C55,35 40,45 45,55 C48,60 40,65 35,60 C30,55 35,45 32,40 C30,38 30,32 30,30 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><path d="M40,35 C42,40 40,45 37,45" fill="none" stroke="#ff007f" stroke-width="1.5"/>`'
lines_dict[1660] = '  },'
lines_dict[1661] = '  {'
lines_dict[1662] = '    name: "library",'
lines_dict[1663] = '    label: "図書館",'
lines_dict[1664] = '    sub: "LIBRARY",'
lines_dict[1665] = '    path: `<path d="M18,25 L38,20 L38,60 L18,65 Z M62,25 L42,20 L42,60 L62,65 Z" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/><path d="M38,20 L42,20 M38,60 L42,60" stroke="#ff007f" stroke-width="2"/>`'
lines_dict[1666] = '  },'
lines_dict[1667] = '  {'
lines_dict[1668] = '    name: "idea",'
lines_dict[1669] = '    label: "アイデア",'
lines_dict[1670] = '    sub: "IDEA",'
lines_dict[1671] = '    path: `<path d="M40,20 C28,20 28,38 34,45 L34,55 L46,55 L46,45 C52,38 52,20 40,20 Z" fill="none" stroke="#00f0ff" stroke-width="2"/><line x1="34" y1="58" x2="46" y2="58" stroke="#ff007f" stroke-width="2"/><line x1="40" y1="62" x2="40" y2="62" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"/>`'
lines_dict[1672] = '  },'
lines_dict[1673] = '  {'
lines_dict[1674] = '    name: "san",'
lines_dict[1675] = '    label: "SANチェック",'
lines_dict[1676] = '    sub: "SAN",'
lines_dict[1677] = '    path: `<path d="M40,40 m-25,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0 M40,40 m-18,0 a18,18 0 1,0 36,0 a18,18 0 1,0 -36,0 M40,40 m-10,0 a10,10 0 1,0 20,0 a10,10 0 1,0 -20,0" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.6"/><path d="M40,40 L40,22 M40,40 L53,50 M40,40 L27,50" fill="none" stroke="#ff007f" stroke-width="2"/>`'
lines_dict[1678] = '  }'
lines_dict[1679] = '];'
lines_dict[1680] = ''

# Ensure UI elements and variables are clean
lines_dict[1681] = 'const aiGenerateBtn = document.getElementById("ai-generate-btn");'
lines_dict[1682] = 'const aiThemeSelect = document.getElementById("ai-theme-select");'
lines_dict[1683] = 'const aiPlayersSelect = document.getElementById("ai-players-select");'
lines_dict[1684] = 'const aiLayoutSelect = document.getElementById("ai-layout-select");'
lines_dict[1685] = 'const aiChatBox = document.getElementById("ai-chat-box");'
lines_dict[1686] = 'const aiPromptInput = document.getElementById("ai-prompt-input");'
lines_dict[1687] = 'const aiGenBgToggle = document.getElementById("ai-gen-bg-toggle");'
lines_dict[1688] = 'const aiGenPartsToggle = document.getElementById("ai-gen-parts-toggle");'
lines_dict[1689] = 'const aiBgOnlyToggle = document.getElementById("ai-bg-only-toggle");'
lines_dict[1690] = 'const aiApiKeyInput = document.getElementById("ai-api-key");'
lines_dict[1691] = ''

# The rest from 1692 to 1750 can be mapped or left clean if they were mapped correctly
# Let's verify line count and fill missing spaces.
max_line = max(lines_dict.keys())
print(f"After manual patches: max line = {max_line}")
missing = [i for i in range(1, max_line + 1) if i not in lines_dict]
print(f"Missing count: {len(missing)}")

# Write to file
with open(output_js_path, 'w', encoding='utf-8', newline='\r\n') as out_f:
    for i in range(1, max_line + 1):
        out_f.write(lines_dict.get(i, '') + '\n')

print("Assembled JS file written successfully.")
