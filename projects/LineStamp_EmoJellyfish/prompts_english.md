# エモ・クラゲ LINEスタンプ（ゆるかわ英語！グローバル日常会話編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各番号の要素で「セリフ」「ポーズ」「色」を1行で完全にマッピング形式（例: `1. "HELLO" (blue font): Sky blue body, waving short hand...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Perfectly round dome-shaped body. **Tentacles are EXTREMELY SHORT, tiny, round, and stubby, looking like minimal dots or small beads attached directly under the body. No long tentacles at all.**
- **Face & Expression**:
  - Happy/Loving (うれしい/あいしてる): Big cute smile, pink blushes.
  - Sad/Lonely (かなしい/さびしい): Large crying eyes with dripping blue tears.
  - Angry (おこる): Angry brow with red anger mark icon (💢).
  - Anxious/Tired (しんぱい/つかれた): Dazed or trembling look, grey or dark purple color.
  - Surprised (びっくり): Round wide-open eyes, sweat drops.
  - Sleepy (ねむい): Closed eyes with small "zzz" icons.
- **Colors (Color by Emotion)**:
  - Pink/Cherry Pink: Joy, love, admiration ("LOVE IT", "HAPPY", "HUGS")
  - Red: Extreme excitement, anger, panic ("NO", "GO!", "LISTEN!")
  - Gold/Yellow/Orange: Bright energy, triumph, work ("OK!", "OMG!", "CONGRATS", "PLEASE", "WOW", "CHEERS", "EXCITED", "NOTED", "WORKING", "GOLDEN")
  - Lime Green/Emerald: Calm, gratitude, approval ("THANK YOU", "AWESOME", "AGREE", "SHARE IT")
  - Light Blue/Deep Blue: Sadness, waiting, sinking ("HELLO", "BYE", "WAIT...", "I'M IN", "YES SIR!")
  - Purple/Dark Purple: Anger, exhaustion, collapse ("SO TIRED", "HMMM", "OH NO", "MELT", "CONFUSED")
  - White: Faded state, ascension, death ("SHOCK", "RIP", "BYE WORLD", "DECEASED")
  - Grey: Shock, apology ("SORRY")
- **Text Styling**:
  - The English text below each jellyfish is NOT black. It must be written in **various bright, colorful uppercase fonts** (such as Pink, Blue, Lime Green, Orange, Purple, Red) matching the emotion, all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (ゆるかわ英語編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "HELLO" (written in blue font): Sky blue body, waving its short arm friendly to greet.
2. "THANK YOU" (written in green font): Emerald green body, bowing politely with a big warm smile.
3. "OK!" (written in yellow font): Lemon yellow body, showing a big smile and making a round OK sign.
4. "NO" (written in red font): Bright red body, making an X shape with its short arms, looking angry.

**Row 2 (Stickers 5 to 8):**
5. "YAY!" (written in pink font): Vivid pink body, popping party crackers and jumping happily with joy.
6. "OMG!" (written in orange font): Orange body, eyes and mouth wide open in huge surprise.
7. "BYE" (written in blue font): Light blue body, waving goodbye while floating slightly.
8. "SORRY" (written in grey font): Grey body, bowing head down apologetically and looking sad.

**Row 3 (Stickers 9 to 12):**
9. "LOVE IT" (written in pink font): Cherry pink body, hugging a big red heart balloon tightly.
10. "CONGRATS" (written in gold font): Gold body, celebrating with colorful confetti and ribbons dancing around.
11. "AWESOME" (written in green font): Emerald green body, giving a big thumbs up and winking cheerfully.
12. "PLEASE" (written in yellow font): Pastel yellow body, joining short hands together with puppy eyes, begging.

**Row 4 (Stickers 13 to 16):**
13. "STUNNING" (written in pink font): Vivid pink body, posing dramatically with a background of blooming red roses.
14. "SO TIRED" (written in purple font): Dark purple body, completely exhausted and slumping down flat.
15. "HAPPY" (written in pink font): Pastel pink body, smiling warmly with a few happy tears of joy.
16. "HMMM" (written in purple font): Purple body, putting a short arm to its chin, thinking deeply.

**Row 5 (Stickers 17 to 20):**
17. "COOL" (written in blue font): Vivid blue body, wearing black sunglasses and posing coolly.
18. "WOW" (written in orange font): Orange body, eyes sparkling and round with amazement.
19. "CHEERS" (written in gold font): Gold body, holding a juice glass and clinking glasses to toast.
20. "GO!" (written in red font): Vivid red body, running forward energetically while holding a red flag.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.

---

## Grid 2: No. 21 〜 40 (ゆるかわ英語編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "WAIT..." (written in blue font): Sky blue body, holding a hand forward to stop and wait patiently.
2. "SHOCK" (written in grey font): Grey body, jaw dropped, dazed as if hit by lightning.
3. "I'M IN" (written in green font): Deep blue body, jumping and diving into water, joining the fun.
4. "OH NO" (written in navy font): Navy body, holding its head in despair and looking worried.

**Row 2 (Stickers 5 to 8):**
5. "PERFECT" (written in gold font): Gold body, holding up a gold cup/medal with a smug, proud face.
6. "EXCITED" (written in yellow-green font): Lemon yellow body, eyes sparkling with diamond shapes, full of anticipation.
7. "AGREE" (written in green font): Mint green body, nodding deeply and giving a thumbs up.
8. "RIP" (written in dark blue font): Navy body, collapsed flat beside a gravestone in absolute exhaustion.

**Row 3 (Stickers 9 to 12):**
9. "NOTED" (written in orange font): Orange body, holding a notebook and pencil, writing notes diligently.
10. "WORKING" (written in yellow font): Yellow body, typing hard on a laptop keyboard with serious focus.
11. "BYE WORLD" (written in light blue font): Transparent light blue body, hiding completely under a cozy blanket.
12. "HUGS" (written in pink font): Pastel pink body, spreading arms wide, ready to give a warm hug.

**Row 4 (Stickers 13 to 16):**
13. "MELT" (written in purple font): Dark purple body, completely melted into a flat puddle on the floor.
14. "GOLDEN" (written in gold font): Gold body, posing happily inside a golden picture frame.
15. "LISTEN!" (written in red font): Red body, speaking passionately into a megaphone to announce something.
16. "HEART EYES" (written in pink font): Rainbow body, eyes glowing and popping out as pink hearts.

**Row 5 (Stickers 17 to 20):**
17. "YES SIR!" (written in blue font): Pastel blue body, saluting with loyalty like a cute soldier.
18. "CONFUSED" (written in purple font): Purple body, head spinning with smoke, stars, and question marks.
19. "DECEASED" (written in white font): White body, floating up like a cute ghost with an angel halo on its head.
20. "SHARE IT" (written in green font): Emerald green body, holding a smartphone showing a screen, recommending it to everyone.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.
