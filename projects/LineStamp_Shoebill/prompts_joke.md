# ハシビロコウ LINEスタンプ（煽り・シュール・ツッコミ編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "はい論破" (yellow font): Yellow body...`）で定義する。
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
  - Blue-grey / Light Blue-grey: Signature colors ("草", "それマ？", "現実見よ？", "何言ってんの", "あーね", "えぐいて", "見なかった事に")
  - Grey / Dark Grey / White: Defeated, cold, lazy ("へー", "で？", "(無言の圧力)", "お気の毒に", "話なっが", "帰っていい？", "やば", "つら", "無理", "だるい", "正気？", "まともか？", "暇", "オワタ", "証拠は？", "はよ", "いらねー")
  - Light Grey / Pale Grey: Indifferent, mocking ("知らんけど", "誰が言った？", "おつかれー", "圧倒的感謝", "ピースピース")
  - Pinkish-grey / Peach grey / Orange: Sly, sarcastic joy ("効いてて草", "大丈夫そ？", "ぴえん", "天才のそれ", "さすがです", "運命じゃん")
  - Red: Angry ("は？", "許さん", "ぐぬぬ")
  - Yellow / Golden: Smug victory, mock praise ("はい論破", "神かよ")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (煽り・シュール・ツッコミ編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "へー" (grey font): Grey body, staring blankly down at its own toes, looking completely uninterested.
- "で？" (blue font): Blue-grey body, crossing its wings, looking down with a cold, condescending glare.
- "(無言の圧力)" (purple font): Dark grey body, zoomed in close, surrounded by a dark purple aura and dramatic shadow lines.
- "お気の毒に" (grey font): Grey body, covering one eye with a wing, fake-crying with a completely flat, sarcastic look.

**Row 2 (Stickers 5 to 8):**
- "草" (green font): Blue-grey body, standing still while a large patch of green weeds grows on top of its head.
- "知らんけど" (green font): Light grey body, looking away sideways and whistling with its beak slightly puckered.
- "話なっが" (grey font): Grey body, standing with white blank eyes, sleeping standing up with a snot bubble.
- "現実見よ？" (blue font): Light blue-grey body, holding a giant magnifying glass with both wings, peeking through it.

**Row 3 (Stickers 9 to 12):**
- "それマ？" (blue font): Blue-grey body, looking extremely shocked as its lower beak is detached and lying on the ground.
- "はい論破" (yellow font): Yellow body, pointing one wing forward with a proud smirk, puffing out its round chest.
- "効いてて草" (pink font): Pinkish-grey body, pointing and laughing with a mischievous, smug grin.
- "誰が言った？" (grey font): Light grey body, looking left and right with a blank, clueless expression.

**Row 4 (Stickers 13 to 16):**
- "は？" (red font): Red body, neck tilted with an anger vein icon on its forehead, staring with dead eyes.
- "何言ってんの" (blue font): Blue-grey body, glaring down coldly as if looking at garbage.
- "大丈夫そ？" (pink font): Pinkish-grey body, looking concerned but showing a tiny sly grin on the corner of its beak.
- "おつかれー" (green font): Light grey body, waving one wing lazily while walking away out of the frame.

**Row 5 (Stickers 17 to 20):**
- "帰っていい？" (grey font): Grey body, wearing a backpack, holding a doorknob with a wing, looking back.
- "やば" (grey font): Dark grey body, stepping back in absolute disgust with wide eyes.
- "つら" (grey font): Grey body, completely melted flat on the floor like a puddle of blue-grey slime.
- "無理" (red font): Dark grey body, crossing its wings in a big "X" sign with a flat, stubborn face.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (煽り・シュール・ツッコミ編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "だるい" (grey font): Grey body, lying lazily on the floor, typing on a smartphone with one wing.
- "許さん" (red font): Red body, surrounded by dramatic fire lines, looking extremely angry.
- "ぴえん" (pink font): Pinkish-grey body, crying fake watery tears to act cute.
- "あーね" (blue font): Blue-grey body, nodding rapidly with empty, hollow eyes.

**Row 2 (Stickers 5 to 8):**
- "正気？" (grey font): Grey body, pale and blue-faced, shaking and shivering in fear.
- "まともか？" (grey font): Dark grey body, holding its head with wings, shaking its head in disbelief.
- "えぐいて" (blue font): Blue-grey body, leaning backwards with white blank eyes in shock.
- "暇" (grey font): Grey body, exhaling a tiny transparent bird-shaped soul from its beak, staring blankly.

**Row 3 (Stickers 9 to 12):**
- "オワタ" (grey font): Grey body, standing frozen and pale grey under a single white spotlight.
- "神かよ" (yellow font): Golden-yellow body, tears of joy streaming down its face, clasping wings in mock worship.
- "天才のそれ" (orange font): Vivid orange body, wearing cool black sunglasses, crossing wings in a cocky pose.
- "圧倒的感謝" (grey font): Light grey body, bowing so hard (dogeza) that its head is completely buried in the ground.

**Row 4 (Stickers 13 to 16):**
- "さすがです" (pink font): Pinkish-grey body, showing a fake, overly polite smile while clapping its wings.
- "ぐぬぬ" (red font): Red body, clenching its beak tightly and shivering with frustration.
- "見なかった事に" (blue font): Blue-grey body, covering both of its eyes with its wings to ignore reality.
- "証拠は？" (grey font): Grey body, wearing a detective hat, holding a bubble pipe in its beak, playing detective.

**Row 5 (Stickers 17 to 20):**
- "はよ" (grey font): Grey body, tapping its foot impatiently, pointing at a wrist watch.
- "いらねー" (grey font): Grey body, tossing something into a trash can with a cold, uncaring shrug.
- "運命じゃん" (pink font): Pinkish-grey body, sliding down its sunglasses to wink at the viewer.
- "ピースピース" (green font): Light grey body, flashing double peace signs (V-signs) with its wings in a cocky way.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
