# エモ・クラゲ LINEスタンプ（ゲーマー・ゲーム実況・オンライン交流編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "ログイン！" (yellow font): Lemon yellow body...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。
5. **数字の徹底的な排除 (STRICTLY NO NUMBERS)**:
   - AIが画像の中に「1, 2, 3」といった数字を描画してしまうのを防ぐため、プロンプト内から数字の連番リスト（1. , 2. 等）を完全に排除する。
   - `STRICTLY NO NUMBERS OR LABELS IN THE IMAGE` などのネガティブプロンプト的な指定を重ねて強調する。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Perfectly round dome-shaped body. **Tentacles are EXTREMELY SHORT, tiny, round, and stubby, looking like minimal dots or small beads attached directly under the body. No long tentacles at all.**
- **Face & Expression**:
  - Happy/Excited (たのしい/ナイス！): Big cute smile, pink circular blushes, sparkling eyes.
  - Defeated/Sad (まけ/勝てない…): Pale faces, melt-down shape, tiny teardrops.
  - Focused/Angry (集中/ラスト1戦！): Determined eyes, headbands, or steam/fire effects.
- **Colors (Color by Theme)**:
  - Pastel Yellow / Gold / Lemon: High energy, winning, stars ("ログイン！", "ナイス！", "GG", "わこつです！", "キャリー求む", "神プレイ！", "GGWP！", "強すぎる", "神エイム！", "情報求む", "ドン勝！")
  - Grey / White / Dark Purple: Disconnected, tired, defeated ("落ちます", "回線落ちした", "やらかした…", "勝てない…", "裏で作業中")
  - Coral Pink / Pastel Pink: Appreciative, welcoming, friendly ("感謝！", "初見です！", "お疲れ様でした", "また遊ぼうね")
  - Mint Green / Sky Blue / Blue: Online, talking, calm ("どんまい", "通話OKです", "聞き専です", "VC中", "乙でした！", "ただいま！", "待機中", "観戦中")
  - Pastel Orange / Orange / Red: Active movement, passion ("いま向かう！", "ラスト1戦！", "お茶どうぞ", "生存報告", "天才のそれ", "お見事！", "助けて！")
  - Purple / Blue-Purple: Lagging, shocked ("ラグい…", "煽られた…", "沼プレイ")
  - Rainbow: Magical state ("チート級！")
- **Text Styling**:
  - The Japanese text below each jellyfish is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (ゲーマー編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "ログイン！" (yellow font): Lemon yellow body, sitting in front of a glowing PC screen with a wide excited smile.
- "落ちます" (grey font): Grey body, waving a hand sleepily and yawning, closing a laptop screen.
- "ナイス！" (yellow font): Lemon yellow body, winking and raising a short arm in a cute thumbs-up.
- "どんまい" (green font): Mint green body, gently patting a crying blue jellyfish on the shoulder to comfort it.

**Row 2 (Stickers 5 to 8):**
- "GG" (gold font): Gold body, offering a friendly handshake with its short arm, with warm sparkles.
- "通話OKです" (blue font): Sky blue body, wearing a headset with a mic, smiling and signaling "come in" with a short arm.
- "聞き専です" (green font): Mint green body, wearing a headset over its ears, with a small red "mute" (X) mask on its mouth.
- "いま向かう！" (orange font): Pastel orange body, frantically pressing buttons on a red game controller, moving fast with speed lines.

**Row 3 (Stickers 9 to 12):**
- "ラグい…" (purple font): Purple body, vibrating rapidly with a digital pixelated glitch effect around its body.
- "回線落ちした" (dark purple font): White drained body, frozen and pale, with a red disconnected Wi-Fi symbol floating above.
- "ラスト1戦！" (red font): Red body, wearing a red headband, eyes burning with fire, holding a controller tightly.
- "VC中" (blue font): Sky blue body, wearing a headset, laughing and chatting happily with a music note icon.

**Row 4 (Stickers 13 to 16):**
- "わこつです！" (yellow font): Lemon yellow body, waving at a computer monitor displaying scrolling chat comments.
- "乙でした！" (purple font): Lavender purple body, sipping hot tea from a green cup next to a closed PC, sighing in relief.
- "キャリー求む" (yellow font): Lemon yellow body, looking up with watery pleading eyes, clinging onto the back of a giant golden jellyfish.
- "神プレイ！" (gold font): Gold body, striking a confident pose with a halo of golden divine light shining behind it.

**Row 5 (Stickers 17 to 20):**
- "やらかした…" (dark purple font): Deep purple body, facepalming in front of a blue monitor displaying a red "GAME OVER" screen.
- "勝てない…" (grey font): Grey body, completely melted and flat on the floor, next to a dropped game controller.
- "GGWP！" (gold font): Gold body, wearing a tiny gold crown, clapping its short arms with colorful confetti falling around.
- "感謝！" (pink font): Coral pink body, throwing small pink hearts toward a green health potion bottle nearby.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (ゲーマー編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "強すぎる" (yellow font): Lemon yellow body, bowing deeply in respect with eyes wide in awe.
- "煽られた…" (purple font): Blue-purple body, eyes filled with tears, shaking slightly while staring at a game screen.
- "神エイム！" (yellow font): Lemon yellow body, pointing confidently at the center of a red crosshair bullseye target.
- "初見です！" (pink font): Pastel pink body, peeking shyly from the bottom edge of the screen, waving its hand gently.

**Row 2 (Stickers 5 to 8):**
- "お茶どうぞ" (green font): Mint green body, smiling warmly and offering a cup of green tea with steam rising.
- "沼プレイ" (blue font): Deep blue body, looking silly and embarrassed, sinking slowly into a mud puddle.
- "生存報告" (green font): Mint green body, peeking out from green grass bushes, smiling brightly to show it is alive.
- "ただいま！" (blue font): Sky blue body, wearing headphones around its neck, waving cheerfully at the doorway.

**Row 3 (Stickers 9 to 12):**
- "お疲れ様でした" (pink font): Pastel pink body, bowing politely and fading away into a soft white mist.
- "待機中" (blue font): Sky blue body, sitting with its knees hugged to its chest, waiting next to a spinning loading circle.
- "天才のそれ" (orange font): Pastel orange body, wearing black sunglasses and striking a cool victory pose.
- "チート級！" (rainbow font): Rainbow colored body, glowing with intense magical runes and digital binary codes around it.

**Row 4 (Stickers 13 to 16):**
- "もう寝ます" (navy font): Navy blue body, wearing a nightcap, holding a big white pillow and walking sleepily.
- "情報求む" (yellow font): Lemon yellow body, wearing a detective hat, looking through a giant open book with a magnifying glass.
- "お見事！" (orange font): Pastel orange body, clapping happily with tiny colorful party crackers popping.
- "助けて！" (red font): Red body, fleeing in panic with teary eyes, chased by a silly dark monster shadow.

**Row 5 (Stickers 17 to 20):**
- "ドン勝！" (gold font): Gold body, holding a giant delicious bowl of katsudon (pork cutlet bowl) above its head, jumping in triumph.
- "観戦中" (blue font): Sky blue body, munching on popcorn while watching a large TV screen showing a video game.
- "裏で作業中" (grey font): Grey body, holding a tiny pickaxe and mining a grey rock, working hard on grind.
- "また遊ぼうね" (pink font): Pastel pink body, waving goodbye with both short arms, wearing a warm affectionate smile.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
