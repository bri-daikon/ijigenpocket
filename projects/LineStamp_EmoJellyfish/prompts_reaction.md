# エモ・クラゲ LINEスタンプ（リアクション・擬音特化編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "わくわく" (yellow font): Lemon yellow body...`）で定義する。
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
  - Happy/Loving (うれしい/きゅん): Big cute smile, pink circular blushes.
  - Shocked/Sad (ショック/しょぼん): Big teary eyes, pale faces, blank stare.
  - Angry/Frustrated (おこ/ぷんぷん): Glowing red face, steam or popping vein icons.
- **Colors (Color by Theme)**:
  - Pastel Yellow / Gold / Lemon: High energy, sparkle, realization ("わくわく", "ハッ！", "パチパチ", "イソイソ", "おろおろ", "キョロキョロ", "ばちっ！")
  - Grey / White / Dark Purple: Depressed, lifeless, shock ("しょぼん", "ガーン！", "ちーん", "うーん…", "ぐっ…", "ずーーん")
  - Coral Pink / Pastel Pink: Love, cuteness, food, comfort ("きゅん", "もぐもぐ", "てへっ", "ハグッ！", "わーい！", "バイバイ")
  - Mint Green / Sky Blue / Blue: Peeking, observing, cold, cooling down ("じーっ", "うるうる", "すやすや", "だらーん", "シャキーン", "チラッ", "ふむふむ", "スッ…", "ふぅ…", "ヤッホー")
  - Pastel Orange / Orange: Warmth, movement, plotting ("にまにま", "ぬくぬく", "ドタバタ", "にこにこ")
- **Text Styling**:
  - The Japanese text below each jellyfish is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (リアクション・擬音編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "わくわく" (yellow font): Lemon yellow body, eyes sparkling with large stars, bouncing up and down with tiny movement lines.
- "しょぼん" (grey font): Grey body, head slightly drooping, looking sad and lonely, surrounded by a tiny blue teardrop.
- "きゅん" (pink font): Coral pink body, eyes turned into big glowing hearts, holding its cheeks with both short arms.
- "ドヤァ" (gold font): Gold body, crossing its short arms, proudly puffing out its dome chest with a confident smirk.

**Row 2 (Stickers 5 to 8):**
- "じーっ" (green font): Mint green body, eyes wide open, peeking from the side edge of the sticker with a curious stare.
- "ハッ！" (yellow font): Lemon yellow body, eyes wide in sudden realization, with a bright glowing yellow lightbulb icon above its head.
- "ガーン！" (purple font): Deep purple body, turned pale blue in shock, with a small jagged lightning bolt icon cracking over its head.
- "ぷんぷん" (red font): Red body, steam coming from its head, with two small red popping cross vein symbols (anger marks) floating above.

**Row 3 (Stickers 9 to 12):**
- "うるうる" (blue font): Sky blue body, eyes filled with large glistening tears, looking up pleadingly with a cute watery gaze.
- "ちーん" (grey font): Faded white body, looking completely lifeless and flat, with a tiny transparent soul escaping from its mouth.
- "にまにま" (orange font): Pastel orange body, wearing a sly grin with eyes squinting, looking like it's plotting a cute trick.
- "すやすや" (purple font): Lavender purple body, eyes closed peacefully, sleeping with a small growing sleep bubble from its nose.

**Row 4 (Stickers 13 to 16):**
- "パチパチ" (gold font): Gold body, smiling happily and clapping its short arms together, surrounded by small celebratory sparkles.
- "もぐもぐ" (pink font): Pastel pink body, cheeks puffed up large with food, chewing happily with a small strawberry nearby.
- "ぬくぬく" (orange font): Pastel orange body, sitting inside a cozy red kotatsu with a small orange resting on top of its head, looking melted.
- "ぶるぶる" (purple font): Blue-purple body, shaking and vibrating rapidly with cold/shiver lines, teeth chattering.

**Row 5 (Stickers 17 to 20):**
- "てへっ" (pink font): Pastel pink body, winking one eye and sticking out its tongue slightly, tilting its head in a cute embarrassed pose.
- "だらーん" (green font): Mint green body, completely relaxed and flattened like a puddle on the floor, looking jelly-like.
- "シャキーン" (blue font): Sky blue body, wearing tiny cool glasses, pointing forward with a sharp and confident sparkle.
- "ハグッ！" (pink font): Pastel pink body, arms stretched out wide towards the viewer, welcoming a big warm hug.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (リアクション・擬音編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "イソイソ" (yellow font): Pastel yellow body, humming with musical notes, moving quickly with tiny scurrying foot lines.
- "チラッ" (blue font): Sky blue body, peeking out from behind a white wall with only half of its face showing.
- "うとうと" (purple font): Lavender purple body, eyes half-closed and drooping, swaying sleepily as if nodding off.
- "キラキラ" (rainbow font): Rainbow colored body, glowing brightly, surrounded by multiple colorful sparkling stars and bubbles.

**Row 2 (Stickers 5 to 8):**
- "うーん…" (purple font): Purple body, crossing its short arms, with a spiral question mark floating above its head in deep thought.
- "ぐっ…" (dark purple font): Dark purple body, clutching its chest with both arms, shedding a tear of deep emotion or overwhelming cuteness.
- "ドタバタ" (orange font): Pastel orange body, running in a panic with tiny cloud dust puffs behind it, arms flailing.
- "わーい！" (pink font): Vivid pink body, jumping high in the air with arms raised in joy, surrounded by colorful confetti.

**Row 3 (Stickers 9 to 12):**
- "よしよし" (green font): Mint green body, smiling gently, patting a smaller mini-jellyfish on the head.
- "おろおろ" (yellow font): Pastel yellow body, sweating buckets with blue tears, looking completely panicked and confused.
- "ふむふむ" (blue font): Sky blue body, wearing glasses, holding a small notepad and pencil, nodding in agreement.
- "キョロキョロ" (yellow font): Pastel yellow body, looking left and right with wide curious eyes, holding a small magnifying glass.

**Row 4 (Stickers 13 to 16):**
- "にこにこ" (orange font): Pastel orange body, floating with a warm, gentle smile and rosy cheeks, spreading peaceful vibes.
- "スッ…" (blue font): Transparent light blue body, fading away and disappearing into the background with a soft trail.
- "ドキューン" (red font): Red body, shocked with a pink heart-shaped arrow stuck through its chest, eyes turned into big hearts.
- "ずーーん" (blue font): Deep blue body, looking extremely depressed with vertical dark rain lines falling behind it.

**Row 5 (Stickers 17 to 20):**
- "ばちっ！" (yellow font): Lemon yellow body, winking playfully and throwing a tiny bright star from its eye.
- "ふぅ…" (blue font): Sky blue body, wiping sweat from its forehead with a sigh of relief, a small cloud icon next to it.
- "ヤッホー" (blue font): Sky blue body, cupping its short arms around its mouth, calling out toward the distance.
- "バイバイ" (pink font): Pastel pink body, waving goodbye with a big cheerful smile, floating backwards.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
