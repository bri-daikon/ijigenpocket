# ハシビロコウ LINEスタンプ（煽り・シュール・ツッコミ編 第二弾）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "それな！" (blue font): Blue-grey body...`）で定義する。
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
  - Sarcastic/Smug (ニヤリ/煽り): Smug grin, raised eyebrow, or winking while keeping the round bird ball shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("それな！", "それマジ？", "何だこれ", "わかったフリ", "えぐいって！", "見えません")
  - Grey / Dark Grey / White: Defeated, cold, lazy ("無理無理", "聞いてる？", "でっていう", "話が長い！", "現実から逃亡", "はい終わり", "お気の毒さま", "帰宅します", "ドン引き", "溶けました", "全力拒否", "めんどくさい", "地獄絵図", "正気を疑う", "意味不明", "暇すぎて死ぬ", "人生オワタ", "アリバイは？", "まだ？", "ゴミ箱行き")
  - Light Grey / Pale Grey: Indifferent, mocking ("おつ！", "しらーーん", "知らんがな", "五体投地", "はいピース")
  - Pinkish-grey / Peach grey / Orange: Sly, sarcastic joy ("自意識過剰", "大 jokes です", "さすがですね", "運命の出会い", "天才の極み")
  - Red: Angry ("怒ってないよ", "ギリギリ…")
  - Yellow / Golden: Smug victory, mock praise ("定時です", "神ですか？")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (煽り・シュール・ツッコミ編2 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "それな！" (blue font): Blue-grey body, nodding its head up and down so fast it creates blur and motion lines.
- "無理無理" (grey font): Dark grey body, waving both wings frantically left and right to reject something.
- "聞いてる？" (grey font): Grey body, picking its ear with a wing tip while staring off with a blank, uncaring glare.
- "おつ！" (grey font): Light grey body, raising a wing slightly in a lazy, cool greeting.

**Row 2 (Stickers 5 to 8):**
- "でっていう" (grey font): Grey body, crossing wings with a giant question mark icon floating above its head, double-taking.
- "しらーーん" (grey font): Light grey body, looking straight up whistle-blowing with a puckered beak.
- "話が長い！" (grey font): Dark grey body, staring down at a giant hourglass that has fully run out, sighing.
- "現実から逃亡" (grey font): Grey body, standing with its entire head and upper body buried deep in sand, leaving its round bottom sticking up.

**Row 3 (Stickers 9 to 12):**
- "それマジ？" (blue font): Blue-grey body, eyes popped out wide, with its lower beak completely dropped to the ground in shock.
- "はい終わり" (grey font): Grey body, dressed as a judge, slamming a wooden gavel onto a desk to end the case.
- "お気の毒さま" (grey font): Grey body, biting a white handkerchief and fake-crying with flat, sarcastic eyes.
- "自意識過剰" (pink font): Pinkish-grey body, looking at itself in a small hand mirror, posing cutely and blushing.

**Row 4 (Stickers 13 to 16):**
- "怒ってないよ" (red font): Red body, showing a forced smile while a massive wall of hot orange flames rages behind it.
- "何だこれ" (blue font): Blue-grey body, examining a small fish bone on the ground through a large magnifying glass.
- "大 jokes です" (pink font): Pinkish-grey body, wearing a white lab coat and holding a stethoscope, staring blankly with cold eyes.
- "帰宅します" (grey font): Grey body, running away horizontally at high speed with speed lines, leaving a dust cloud.

**Row 5 (Stickers 17 to 20):**
- "定時です" (yellow font): Yellow body, pointing at a clock showing 18:00 while holding a briefcase, standing still.
- "ドン引き" (grey font): Dark grey body, pale blue face, stepping backward slowly in shock.
- "溶けました" (grey font): Grey body, completely melted flat on the floor like a puddle of blue-grey slime.
- "全力拒否" (grey font): Dark grey body, holding a big red "NO ENTRY" road sign tightly with both wings.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (煽り・シュール・ツッコミ編2 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "めんどくさい" (grey font): Grey body, fully wrapped in a futon bed, rolling left and right on the floor like a caterpillar.
- "地獄絵図" (grey font): Dark grey body, standing perfectly still and blank-faced in the middle of a burning fire environment.
- "知らんがな" (grey font): Light grey body, shrugging with both wings spread out in a "whatever" gesture.
- "わかったフリ" (blue font): Blue-grey body, nodding with a smile, while a blank white empty thought bubble floats above its head.

**Row 2 (Stickers 5 to 8):**
- "正気を疑う" (grey font): Grey body, pointing a wing to its own head, staring at the viewer with an intense worried glare.
- "意味不明" (grey font): Dark grey body, head spinning with numbers and math equations floating around it.
- "えぐいって！" (blue font): Blue-grey body, shocked with its head feathers (cowlicks) standing straight up in fear.
- "暇すぎて死ぬ" (grey font): Grey body, breathing out multiple transparent bird-shaped souls from its beak.

**Row 3 (Stickers 9 to 12):**
- "人生オワタ" (grey font): Grey body, raising both wings in a Y-shape shrug gesture, standing still with a blank face.
- "神ですか？" (yellow font): Golden-yellow body, tears of joy streaming down its face, clasping wings in mock worship with a golden halo.
- "天才の極み" (orange font): Vivid orange body, wearing black sunglasses and a large gold medal on its chest, posing smugly.
- "五体投地" (grey font): Light grey body, flat-out bowing (dogeza) with its body completely pressed flat on the floor.

**Row 4 (Stickers 13 to 16):**
- "さすがですね" (pink font): Pinkish-grey body, holding a paper fan, fanning towards the viewer with an insincere polite smile.
- "ギリギリ…" (red font): Red body, clenching its beak tightly and biting a pencil in half with frustration.
- "見えません" (blue font): Blue-grey body, covering both eyes with its wings, but peeking through the wing feathers with sharp eyes.
- "証拠は？" (grey font): Grey body, wearing a detective hat, holding a bubble pipe in its beak, playing detective.

**Row 5 (Stickers 17 to 20):**
- "はよ" (grey font): Grey body, tapping its foot  impatiently, pointing at a wrist watch.
- "いらねー" (grey font): Grey body, tossing something into a trash can with a cold, uncaring shrug.
- "運命じゃん" (pink font): Pinkish-grey body, sliding down its sunglasses to wink at the viewer.
- "ピースピース" (green font): Light grey body, flashing double peace signs (V-signs) with its wings in a cocky way.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
