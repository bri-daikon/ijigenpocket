import sys

sys.stdout.reconfigure(encoding='utf-8')

filepath = r"y:\ijigenpocket\js\ccfolialayoutmaker_ai.js"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in file: {len(lines)}")

# 各行のインデックスは0ベース
checks = [
    (1714, 'label:', '    label: "目星",\n'),
    (1720, 'label:', '    label: "聞き耳",\n'),
    (1726, 'label:', '    label: "図書館",\n'),
    (1732, 'label:', '    label: "アイデア",\n'),
    (1738, 'label:', '    label: "SAN",\n'),
    (1744, 'label:', '    label: "塩",\n'),
    (1751, 'takumi:', "  takumi: { name: 'タクミ (プランナー)', color: '#60a5fa', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Takumi' },\n"),
    (1752, 'aoi:', "  aoi: { name: 'アオイ (デザイナー)', color: '#f472b6', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aoi' }\n"),
    (1767, '// 1.', '    // 1. 画像背景の範囲を切り出して描画\n'),
    (1770, '// 2.', '    // 2. SVG重ね合わせ\n'),
    (1801, 'let layoutName =', "  let layoutName = '右に縦並び';\n"),
    (1802, 'if (layoutType ===', "  if (layoutType === 'bottom-horizontal') layoutName = '下部に横並び';\n"),
    (1803, 'else if (layoutType ===', "  else if (layoutType === 'pattern1') layoutName = 'パターン1 (メイン左・メニュー左・PL枠右・アクション右)';\n"),
    (1804, 'else if (layoutType ===', "  else if (layoutType === 'pattern2') layoutName = 'パターン2 (メイン左下・メニュー左上・PL枠右上・アクション中右)';\n"),
    (1805, 'else if (layoutType ===', "  else if (layoutType === 'pattern3') layoutName = 'パターン3 (メイン中央・メニュー左・PL枠下・アクション右下縦)';\n"),
    (1806, 'else if (layoutType ===', "  else if (layoutType === 'pattern4') layoutName = 'パターン4 (PL枠上・メイン右下・メニュー左・アクション下)';\n"),
    (1807, 'else if (layoutType ===', "  else if (layoutType === 'pattern5') layoutName = 'パターン5 (メニュー最上部・メイン中央・PL枠下・アクション最下部)';\n"),
    (1808, 'else if (layoutType ===', "  else if (layoutType === 'pattern6') layoutName = 'パターン6 (メイン最上部・メニュー下・アクション下・PL枠最下部)';\n"),
    (1809, 'else if (layoutType ===', "  else if (layoutType === 'pattern7') layoutName = 'パターン7 (メニュー最上部・PL枠上・アクション中・メイン最下部)';\n"),
]

# 個別の置換を適用
for idx, key, replacement in checks:
    lines[idx] = replacement

# systemPrompt の置換 (バッククォートを \` にエスケープ)
new_prompt = r"""
あなたはココフォリアの部屋レイアウト設計AI「タクミ＆アオイ」です。
以下のメンバーとCEO（ユーザー）の要望を元に、最終的なデザイン方針とアセットの配置を決定してください。

【チームメンバー】
- タクミ (プランナー): 全体の配置や機能設計を担当。
- アオイ (デザイナー): 色調や各パーツのスタイル、モデリングを担当。

【CEOの要望】
- テーマ: ${theme}
- プレイヤー人数: ${numPlayers}人
- 配置: ${layoutName}
- 追加の要望（フリー入力）: "${customPrompt || '特になし'}"

【レイアウト配置の設計指針】
キャンバス全体の解像度は 1280x720 ピクセルです。

【7つの代表的レイアウトパターンと座標ガイド】
CEOが以下のパターン（1〜7）の指示、あるいはそれに類似する配置を要望した場合（例：「PLパネルは右、メイン枠は最上部」など）、以下の座標設計ガイドに従って各パーツをレイアウトしてください。
（各パーツは重なり合わないように配置すること）

- パターン1 (メイン左・メニュー左・PL枠右・アクション右):
  - メイン (window): X: 50, Y: 50, W: 500, H: 300
  - メニュー (menu): X: 120, Y: 380, 向き: "vertical"
  - PL枠 (pl_panels): Y: 150, W: 140, H: 350 (右側空きスペース X: 600, 760, 920, 1080 に人数分配置)
  - アクション (action): X: 600, Y: 530
- パターン2 (メイン左下・メニュー左上・PL枠右上・アクション中右):
  - メイン (window): X: 50, Y: 370, W: 500, H: 300
  - メニュー (menu): X: 120, Y: 50, 向き: "vertical"
  - PL枠 (pl_panels): Y: 220, W: 140, H: 350 (右側空きスペース X: 600, 760, 920, 1080 に配置)
  - アクション (action): X: 600, Y: 110
- パターン3 (メイン中央・メニュー左・PL枠下・アクション右下縦):
  - メイン (window): X: 350, Y: 80, W: 700, H: 320
  - メニュー (menu): X: 50, Y: 100, 向き: "vertical"
  - PL枠 (pl_panels): Y: 430, W: 140, H: 260 (下部 X: 300, 460, 620, 780 に配置)
  - アクション (action): X: 950, Y: 430, 向き: "vertical"（X固定でYに沿って展開）
- パターン4 (PL枠上・メイン右下・メニュー左・アクション下):
  - PL枠 (pl_panels): Y: 50, W: 140, H: 350 (上部 X: 50, 210, 370, 530 に配置)
  - メイン (window): X: 720, Y: 50, W: 500, H: 320
  - メニュー (menu): X: 50, Y: 430, 向き: "vertical"
  - アクション (action): X: 300, Y: 500
- パターン5 (メニュー最上部・メイン中央・PL枠下・アクション最下部):
  - メニュー (menu): X: 200, Y: 30, 向き: "horizontal"
  - メイン (window): X: 280, Y: 80, W: 720, H: 320
  - PL枠 (pl_panels): Y: 420, W: 140, H: 260 (下部 X: 280, 460, 640, 820 に配置)
  - アクション (action): X: 360, Y: 600
- パターン6 (メイン最上部・メニュー下・アクション下・PL枠最下部):
  - メイン (window): X: 150, Y: 50, W: 980, H: 300
  - メニュー (menu): X: 150, Y: 370, 向き: "horizontal"
  - アクション (action): X: 150, Y: 430
  - PL枠 (pl_panels): Y: 510, W: 140, H: 180 (最下部 X: 150, 410, 670, 930 に配置)
- パターン7 (メニュー最上部・PL枠上・アクション中・メイン最下部):
  - メニュー (menu): X: 150, Y: 30, 向き: "horizontal"
  - PL枠 (pl_panels): Y: 80, W: 180, H: 280 (上部 X: 150, 410, 670, 930 に配置)
  - アクション (action): X: 150, Y: 380
  - メイン (window): X: 150, Y: 440, W: 980, H: 250

【各コンテナの標準サイズ（デフォルト値）】
特定のパターンの指定がない場合、レイアウトタイプ（layoutType）に基づき以下を設計：
- キャンバスサイズ: 1280 x 720
- メイン (window): 横 720 x 縦 405 (右縦並びなら X: 50, Y: 110、下横並びなら X: 280, Y: 50)
- PLパネル (pl_panels): 横 160, 縦 170 (右縦並びなら X: 1050, Y: 40〜680間隔、下横並びなら Y: 510, X: 280〜1000間隔)
- メニュー (menu): 5つのボタン。右縦並びなら X: 50, Y: 50（縦向き）、下横並びなら X: 50, Y: 50（横向き）
- アクションアイコン (action): 6つのボタン（横 75 x 縦 75）。右縦並びなら X: 50, Y: 550（横向き）、下横並びなら X: 50, Y: 350付近（縦2列など）

【出力指示】
1. まず、タクミとアオイがCEOの要望に沿ってどのようなカラーやレイアウトにするかを相談する会話ログを「合計で4回の発話（タクミ2回、アオイ2回）」で作成してください。
2. 次に、相談の後合意した「デザインパラメータ」を以下のカラーコードやレイアウト座標で指定してください。
   - bg_gradient_start: 背景のグラデーション開始色 (ダークカラー、16進数)
   - bg_gradient_end: 背景のグラデーション終了色 (ダークカラー、16進数)
   - accent_color: アクセントとしての輝度高め・コントラストなボタンなどの色 (16進数)
   - accent_color_rgb: 上記アクセント色のRGB値（例: "0, 240, 255"）
   - border_color: PLパネルの周囲枠などの色 (16進数)
   - text_color: 読みやすいテキスト色 (16進数)
   - panel_bg: 前景やPLパネルなどのコンテナ内部背景色 (見やすさを保つため、半透明で表示するため、薄めの色、16進数)
   - style_description: 設計スタイルの短い説明（例: "サイバーパンクなバー"、"アンティークなカフェ"）
   
   【レイアウト座標パラメータ】CEOの要望に合わせて適切に変更、計算してください。
   - no_background: 背景を完全に透過にする場合は true、そうでない場合は false（通常は要望がない限り falseを設定してください）
   - window_x: メイン (window) の X座標値
   - window_y: メイン (window) の Y座標値
   - window_width: メイン (window) の 横幅値
   - window_height: メイン (window) の 縦幅値
   - pl_panels: プレイヤー人数（${numPlayers}人）分の座標オブジェクト配列。各要素は {"x": 値, "y": 値, "width": 値, "height": 値}
   - menu_x: メニュー (menu) の開始X座標値
   - menu_y: メニュー (menu) の開始Y座標値
   - menu_layout: "horizontal" または "vertical"
   - action_x: アクションアイコン (action) の開始X座標値
   - action_y: アクションアイコン (action) の開始Y座標値

出力は必ず以下の有効なJSONフォーマットのみとしてください。前後に \`\`\`json マークダウンなどは含めないでください。

{
  "discussion": [
    {"speaker": "takumi", "text": "タクミの発言1"},
    {"speaker": "aoi", "text": "アオイの発言1"},
    {"speaker": "takumi", "text": "タクミの発言2"},
    {"speaker": "aoi", "text": "アオイの発言2"}
  ],
  "design": {
    "bg_gradient_start": "#XXXXXX",
    "bg_gradient_end": "#XXXXXX",
    "accent_color": "#XXXXXX",
    "accent_color_rgb": "R, G, B",
    "border_color": "#XXXXXX",
    "text_color": "#XXXXXX",
    "panel_bg": "#XXXXXX",
    "style_description": "...",
    "no_background": true または false,
    "window_x": 座標値,
    "window_y": 座標値,
    "window_width": 横幅値,
    "window_height": 縦幅値,
    "pl_panels": [
      {"x": X座標値, "y": Y座標値, "width": 横幅値, "height": 縦幅値},
      ...
    ],
    "menu_x": X座標値,
    "menu_y": Y座標値,
    "menu_layout": "horizontal" または "vertical",
    "action_x": X座標値,
    "action_y": Y座標値
  }
}
"""

# systemPromptの定義開始行(1812)から終了行(1944)までを置換
prompt_lines = ['  const systemPrompt = `\n'] + [line + '\n' for line in new_prompt.strip().split('\n')] + ['`;\n']
lines[1811:1944] = prompt_lines

with open(filepath, 'w', encoding='utf-8', newline='\r\n') as f:
    f.writelines(lines)

print("Mojibake fix successfully applied with escaped backticks!")
