# ハシビロコウ LINEスタンプ（日常会話・シュールネタ編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "おはよう" (yellow font): Blue-grey body...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。
5. **数字の徹底的な排除 (STRICTLY NO NUMBERS)**:
   - AIが画像の中に「1, 2, 3」といった数字を描画してしまうのを防ぐため、プロンプト内から数字の連番リスト（1. , 2. 等）を完全に排除する。
   - `STRICTLY NO NUMBERS OR LABELS IN THE IMAGE` などのネガティブプロンプト的な指定を重ねて強調する。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Extremely round, plump, fluffy, and chubby body (like an obese bird ball/plush balloon). **The legs are extremely short, tiny, and thin, less than 10% of the body height. No long legs at all.**
- **Beak & Head**:
  - Very large, flat light yellow beak.
  - Two small feathers sticking up on top of the head like cowlicks.
- **Face & Expression**:
  - Grumpy/Glare (ジト目/半目): Sharp, glaring, slightly grumpy half-closed eyes. Sharp三白眼 look.
  - Emotionally soft (尊い/感謝): Eyes slightly watery/sparkling, but still maintaining the signature shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey / Dark blue-grey: Signature colors ("おはよう", "お疲れさま", "了解", "じーっ", "承知いたしました", "既読", "動かざること…", "草", "把握", "それな", "知らんけど", "いいね", "お祝い！", "現実逃避", "お茶どうぞ", "助けて")
  - Grey / Dark Grey / White: Defeated, cold, exhausted ("落ちます", "おやすみ", "(無言の圧力)", "…で？", "遅れます", "無理", "虚無", "フッ…", "へー", "仕様です")
  - Light Grey / Pale Grey: Friendly, moving ("よろしく", "今向かってます", "呼んだ？", "お見事", "すみません", "お先に失礼します")
  - Pinkish-grey / Peach grey: Shy, loving, happy ("ありがとう", "尊い…", "生きがい", "またね")
  - Red / Reddish-grey: Angry, frustrated ("ぐぬぬ…", "激おこ")
  - Gold / Golden-yellow: Godly, excellent ("神", "天才か？")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (日常＆シュール編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "おはよう" (yellow font): Blue-grey body, standing perfectly still, staring straight forward as a bright morning sun rises behind.
- "お疲れさま" (green font): Blue-grey body, holding and offering a cup of warm green tea with its short wing, with a grumpy but caring glare.
- "了解" (blue font): Dark blue-grey body, bowing its head deeply in a formal greeting (shoebill clattering bow).
- "ありがとう" (pink font): Pinkish-grey body, looking away shyly with a slight blush, making a tiny heart symbol with its wings.

**Row 2 (Stickers 5 to 8):**
- "よろしく" (blue font): Light grey body, bowing politely while keeping its sharp, glarey eyes locked on the viewer.
- "おやすみ" (purple font): Dark grey body, standing on one leg with eyes closed under a crescent moon.
- "じーっ" (green font): Blue-grey body, peeking out from the side edge of the sticker with a sharp, unblinking glare.
- "(無言の圧力)" (purple font): Dark grey body, zoomed in close to the viewer, surrounded by a dark purple aura and intense shadow lines.

**Row 3 (Stickers 9 to 12):**
- "承知いたしました" (blue font): Dark blue-grey body, placing one wing on its chest and bowing deeply like a butler.
- "既読" (orange font): Blue-grey body, staring intensely down at a tiny glowing smartphone screen with a serious look.
- "…で？" (grey font): Grey body, crossing its wings, looking down coldly with a condescending glare.
- "動かざること…" (blue font): Blue-grey body, standing perfectly still and unaffected while thunder and lightning strike in the background.

**Row 4 (Stickers 13 to 16):**
- "今向かってます" (orange font): Light grey body, riding very slowly on the back of a cute green turtle, moving at a snail's pace.
- "遅れます" (grey font): Grey body, standing still and pointing at a clock showing a late time, looking completely unbothered.
- "草" (green font): Blue-grey body, standing blankly with a tiny green leaf sprout popping up next to its head feathers.
- "神" (gold font): Golden-yellow body, with a brilliant golden halo and divine light rays shining behind its head, looking holy.

**Row 5 (Stickers 17 to 20):**
- "尊い…" (pink font): Pinkish-grey body, clasping its wings together in prayer, eyes slightly watery and shining.
- "把握" (blue font): Blue-grey body, holding a small notepad with its beak, nodding with a serious expression.
- "無理" (red font): Dark grey body, crossing its wings in a big "X" sign with a stern, unmoving face.
- "それな" (orange font): Blue-grey body, nodding its head up and down so fast it creates blur and motion lines.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (日常＆シュール編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "虚無" (grey font): Grey body, turned completely pale and grey, with a small transparent bird ghost escaping from its beak.
- "呼んだ？" (blue font): Light grey body, body facing forward but its head is turned 180 degrees backward to look at the viewer.
- "挨拶は基本" (blue font): Dark blue-grey body, bowing so deeply that its head is completely buried in the ground, with its body sticking up.
- "知らんけど" (green font): Blue-grey body, looking away sideways and whistling with its beak slightly puckered.

**Row 2 (Stickers 5 to 8):**
- "お見事" (yellow font): Light grey body, clapping its wings together with a completely blank, unamused expression.
- "ぐぬぬ…" (red font): Reddish-grey body, shivering with anger lines and clenching its beak tightly.
- "いいね" (green font): Blue-grey body, raising one wing with a thumbs-up gesture, but keeping a flat, half-closed glare.
- "すみません" (grey font): Grey body, bowing its head slightly with a single blue sweat drop on its temple.

**Row 3 (Stickers 9 to 12):**
- "お祝い！" (pink font): Light blue-grey body, popping a colorful party cracker, standing still as colorful confetti falls around it.
- "現実逃避" (blue font): Blue-grey body, standing straight but with its head buried completely in a pile of sand.
- "フッ…" (dark font): Dark grey body, showing a tiny smirk on the corner of its beak, looking mysterious.
- "生きがい" (pink font): Pinkish-grey body, hugging a large raw fish tightly to its chest with a blissful, half-closed eye expression.

**Row 4 (Stickers 13 to 16):**
- "激おこ" (red font): Red body, surrounded by blazing red fire lines, eyes bloodshot with intense anger.
- "へー" (grey font): Grey body, looking extremely bored, staring down at its own tiny bird feet.
- "お茶どうぞ" (green font): Blue-grey body, balancing a small green teacup and saucer on top of its head while standing still.
- "助けて" (red font): Light blue-grey body, running in panic as a giant fish is biting onto its tail feathers.

**Row 5 (Stickers 17 to 20):**
- "仕様です" (grey font): Grey body, shrugging its wings with a "what can you do" sigh expression.
- "天才か？" (gold font): Golden-yellow body, standing under a bright spotlight, puffing out its round chest proudly.
- "お先に失礼します" (grey font): Light grey body, wearing a tiny school backpack, sliding smoothly horizontally out of the frame.
- "またね" (pink font): Pinkish-grey body, waving one wing friendly, showing a slightly awkward but warm smile.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
