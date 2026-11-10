# ハシビロコウ LINEスタンプ（静かに寄り添うなぐさめ＆やさぐれ編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "生きててえらい" (pink font): Pinkish-grey body...`）で定義する。
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
  - Emotionally soft (生きててえらい/ご自愛): Eyes slightly watery/sparkling, but still maintaining the signature shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("現実逃避", "いつでも話聞くよ", "泣いてもいいよ", "雨降ってきた…", "気分転換", "話きくよ？")
  - Grey / Dark Grey / White: Defeated, cold, exhausted ("やらかした", "やさぐれ中", "もうだめだ…", "すねてます", "お布団が待っている", "一旦、寝よ？", "引きこもります", "何もしたくない", "心臓が痛い", "そっとしといて", "充電切れ", "リセット", "ただいま帰還")
  - Light Grey / Pale Grey: Friendly, moving ("よしよし", "美味しいもの食べよ", "のんびりいこう", "おでかけしよ？")
  - Pinkish-grey / Peach grey: Shy, loving, happy, warm ("生きててえらい", "無理しないで", "そっと寄り添う", "味方だよ", "お疲れさまです", "ぬくぬくしよ", "自分を甘やかして", "心から応援", "大丈夫だよ", "がんばり屋さん", "いつもありがとう", "ゆっくり休んでね")
  - Red: Angry, frustrated ("全部投げ出したい", "傷心中")
  - Gold / Golden-yellow: Godly, excellent ("存在するだけで満点", "よく耐えた！", "生き返った！", "生きてるだけで偉業")
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
- "生きててえらい" (pink font): Pinkish-grey body, standing still with warm, gentle half-closed eyes, looking down kindly.
- "存在するだけで満点" (yellow font): Golden-yellow body, puffing out its round chest proudly, with a bright golden halo shining behind its head.
- "無理しないで" (pink font): Pinkish-grey body, holding a hot mug of cocoa with steam rising, looking with a concerned but warm stare.
- "よしよし" (green font): Light grey body, smiling gently, patting a tiny cute baby shoebill on the head with its wing.

**Row 2 (Stickers 5 to 8):**
- "そっと寄り添う" (pink font): Pinkish-grey body, standing quietly side-by-side next to a small sad blue-grey bird.
- "やさぐれ中" (grey font): Grey body, sitting in the corner of a room, hugging its knees, staring blankly at the wall.
- "もうだめだ…" (grey font): Dark grey body, looking completely drained and white, with a tiny transparent bird ghost escaping from its beak.
- "すねてます" (grey font): Grey body, crossing its wings, turning away sideways with a grumpy, pouting expression.

**Row 3 (Stickers 9 to 12):**
- "現実逃避" (blue font): Blue-grey body, standing straight but with its head buried completely in a pile of sand.
- "いつでも話聞くよ" (blue font): Light blue-grey body, tilting its head slightly, looking with a soft, open expression.
- "味方だよ" (pink font): Pinkish-grey body, saluting with its wing next to its head, looking reliable.
- "美味しいもの食べよ" (orange font): Light grey body, holding a fork and knife, standing in front of a giant grilled fish on a plate.

**Row 4 (Stickers 13 to 16):**
- "お疲れさまです" (pink font): Pinkish-grey body, moving its wings in a massage gesture.
- "泣いてもいいよ" (blue font): Light blue-grey body, holding and spreading out a large fluffy bath towel with both wings.
- "お布団が待っている" (purple font): Dark grey body, wearing a nightcap, pointing towards a big fluffy futon bed.
- "一旦、寝よ？" (purple font): Dark grey body, hugging a big white pillow tightly, looking sleepy.

**Row 5 (Stickers 17 to 20):**
- "ぬくぬくしよ" (pink font): Pinkish-grey body, wrapped warmly in a thick red knitted muffler, eyes closed happily.
- "のんびりいこう" (green font): Light grey body, riding very slowly on the back of a cute green snail.
- "自分を甘やかして" (pink font): Pinkish-grey body, surrounded by sweet donuts and strawberry cakes, looking blissfully melted.
- "よく耐えた！" (gold font): Golden-yellow body, standing proudly next to a large red hand-drawn flower-shaped "hanamaru" (excellent) mark.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (日常＆シュール編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "傷心中" (red font): Dark grey body, wearing a white bandage around its head, crying tiny tears.
- "引きこもります" (grey font): Grey body, hiding inside a large brown cardboard box, peeking out of a small hole with its sharp eyes.
- "何もしたくない" (grey font): Grey body, completely flattened and melted like a puddle of blue-grey slime on the floor.
- "心臓が痛い" (grey font): Dark grey body, clutching its chest with both wings, looking shocked and pale.

**Row 2 (Stickers 5 to 8):**
- "雨降ってきた…" (blue font): Blue-grey body, standing still under a small dark raincloud with blue rain drops falling over it.
- "そっとしといて" (grey font): Grey body, standing inside a boundary marked by yellow "DO NOT ENTER" warning tapes.
- "全部投げ出したい" (red font): Red body, throwing papers and fish into the air in frustration.
- "生き返った！" (gold font): Golden-yellow body, glowing with bright energy rays, holding an energy drink can high in the air.

**Row 3 (Stickers 9 to 12):**
- "心から応援" (pink font): Pinkish-grey body, holding two pink pom-poms, waving them with a completely blank, unmoving expression.
- "大丈夫だよ" (pink font): Pinkish-grey body, nodding deeply with a warm, reassuring gaze.
- "がんばり屋さん" (pink font): Pinkish-grey body, holding a small gold medal to place it around someone's neck.
- "いつもありがとう" (pink font): Pinkish-grey body, holding a large beautiful flower bouquet with both wings.

**Row 4 (Stickers 13 to 16):**
- "生きてるだけで偉業" (gold font): Golden-yellow body, holding a shiny gold trophy under falling colorful confetti.
- "充電切れ" (grey font): Grey body, standing motionless with a red "0% Battery" digital icon above its head.
- "おでかけしよ？" (orange font): Light grey body, wearing a cute yellow straw hat, peeking out through a door crack.
- "気分転換" (blue font): Light blue-grey body, blowing round soap bubbles into the wind.

**Row 5 (Stickers 17 to 20):**
- "リセット" (grey font): Grey body, pressing down a giant grey "ESC" computer key with both wings.
- "話きくよ？" (blue font): Light blue-grey body, holding an old-fashioned telephone receiver next to its head.
- "ただいま帰還" (grey font): Light grey body, wearing a small backpack, walking tiredly at the house entrance.
- "ゆっくり休んでね" (pink font): Pinkish-grey body, waving one wing friendly, showing a slightly awkward but warm smile.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
