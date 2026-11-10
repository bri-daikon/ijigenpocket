# ゆめか LINEスタンプ（日常会話・のほほん癒やし編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)

ゆめかちゃんのスタンプ画像を画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやキャラクターデザインの逸脱が発生します。

1. **スライス用の余白確保 (Sticker Spacing - CRITICAL)**:
   - 自動切り出し（スライス）を容易にするため、各イラストの間に非常に広い余白と緑の境界（Gutter/Margin）を確保します。
   - `Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定し、イラスト同士が結合するのを絶対に防ぎます。
2. **足の数の一致 (STRICTLY EXACTLY 4 LEGS)**:
   - すべてのポーズにおいて、**足の数は必ず4本**です。お辞儀や旗を持つなどの特殊なポーズであっても、余分な足（5本や6本など）は絶対に描かれません。
   - プロンプトで `STRICTLY has exactly 4 legs, absolutely no extra legs, no 5 legs, no 6 legs` を強調します。
3. **角の徹底排除 (ABSOLUTELY ZERO HORNS)**:
   - ゆめかちゃんはポニーであり、**頭部に角（つの）は絶対に生えていません**。
   - 頭部の星は「平らな星型のヘアクリップ（髪飾り）」であり、角ではありません。
   - プロンプトで `Without any horn, completely free of any forehead horn. Absolutely zero horns, no pointed horn, no unicorn horn. The yellow star is a flat hair clip attached to her hair, NOT a horn. Only two cute pony ears on her head. Her head is smooth with no horns.` を強く強調します。
4. **ポニーの形を保った体型 (Keep Cute Pony Shape)**:
   - 体型は、ぽってりとして丸みがありますが、球体やおまんじゅう型にしすぎず、**必ずポニー（馬）としての可愛らしい形と輪郭を保ちます**。
   - `Chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. The legs are short and tiny, but clearly recognizable as pony legs. Absolutely no long, tall, or sturdy legs.` と指定します。
5. **特徴的なアクセサリーの指定 (Strict Accessory Requirement)**:
   - 頭部には黄色い星のヘアアクセサリー（yellow star hair clip / flat hair accessory）を必ず描くように指定します。
6. **パステルグラデーションの維持 (Pastel Gradient Hair & Tail)**:
   - たてがみとしっぽは、単色ではなく「パステルパープル、ピンク、水色のグラデーション（pastel purple, pink, and sky blue gradient）」であることを毎回強調します。
7. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造でプロンプトを記述します。
8. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式で定義します。
   - セリフは「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記します。
9. **背景色の選定 (Background Color)**:
   - 切り出し時にクロマキー処理しやすいため、`solid bright lime green background (#76FF03)` を使用します。
10. **数字の徹底的な排除 (STRICTLY NO NUMBERS)**:
    - AIが画像の中に数字を描画してしまうのを防ぐため、`STRICTLY NO NUMBERS OR LABELS IN THE IMAGE` などの指定を強調します。

---

## デザイン仕様 (Design Specifications)

- **Shape**: **Chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs, absolutely no extra legs, no 5 legs, no 6 legs. The legs are short and tiny, but clearly pony legs. Absolutely no long or tall legs. NO horn on her head, absolutely zero horns, no unicorn horns, only cute pony ears are on top of her head. The yellow star on her head is a flat hair clip accessory near her ear, not a horn.** Small pastel purple hooves.
- **Head & Body Details**:
  - Soft white fur body.
  - A beautiful pastel purple, pink, and sky blue gradient mane and tail.
  - A bright yellow star flat hair clip on her mane near her ear.
  - A cute mark of a white cloud with a tiny yellow star on her rear.
- **Face & Expression**:
  - Large, watery, sparkling purple eyes with cute catchlights.
  - Soft rosy pink cheeks.
  - Gentle, sleepy, and relaxed expression.
- **Text Styling**:
  - The Japanese text below each pony is NOT black. Must be written in **various bright, colorful fonts** matching the theme, all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps per sheet). No missing rows. No numbers or technology labels in the image. Solid bright lime green background (#76FF03).

---

## Grid 1: No. 1 〜 20 (日常会話・のほほん癒やし編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular pony filly named "Yumeka". STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). Her forehead is completely smooth and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 5 legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "おつかれさま〜" (purple font): Lying down on a big fluffy pink cloud, looking extremely relaxed and sleepy (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "ありがとう〜" (pink font): Waving happily from inside a giant purple mug cup decorated with a crescent moon and clouds (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "おやすみ〜" (blue font): Wearing a cute blue nightcap, cuddling a yellow star-shaped cushion on a small cloud (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "了解です" (green font): Waving one hand cheerfully inside a clear glass jar filled with tiny sparkling stars (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).

**Row 2 (Stickers 5 to 8):**
- "だいすき" (pink font): Hugging a giant hot pink heart symbol tightly with her front hooves, looking happy (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "のほほん〜" (green font): Floating on a fluffy white cloud, with two tiny yellow chicks resting on her back (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "ごめんね…" (blue font): Lowering her head apologetically, with teardrops splashing around her (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "がんばって〜！" (orange font): Waving blue and pink pom-poms energetically with a bright smile (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).

**Row 3 (Stickers 9 to 12):**
- "きれいだね…" (purple font): Looking out of a window at a starry night sky, showing her side profile (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "わーい！" (pink font): Riding a cute blue toy rocking horse, looking very happy and waving (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "おなかすいた…" (blue font): Lying flat on her stomach, with a thought bubble showing a carrot (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "OK" (green font): Holding a blue flag that has "OK" written on it with one of her front hooves, while standing on three legs on the ground (strictly exactly 4 legs total, absolutely no extra legs, no 5 legs, zero horns, no horn, smooth forehead).

**Row 4 (Stickers 13 to 16):**
- "ちらっ" (purple font): Peeking from behind purple star-patterned curtains, showing her cute face (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "すやぁ…" (blue font): Sleeping soundly, curled up on a large yellow crescent moon (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "気をつけてね" (green font): Holding a purple umbrella under rain drops, standing next to a cute teruteru-bozu doll (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "またね〜" (pink font): Sitting on a pink cloud surrounded by colorful balloons, waving goodbye (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).

**Row 5 (Stickers 17 to 20):**
- "よろしく〜" (orange font): Smiling warmly with her hands held out in front of her (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "はーい" (orange font): Raising one hand high to reply, smiling brightly (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "びっくり！" (purple font): Watery eyes wide open in surprise, jumping slightly in the air (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).
- "うるうる" (pink font): Looking up with big watery pleading eyes, placing her hands under her chin (strictly 4 legs, zero horns, no horn, no unicorn horn, smooth forehead).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO HORNS.

---

## Grid 2: No. 21 〜 40 (日常会話・のほほん癒やし編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute "Yumekawa Pony" filly named "Yumeka". STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal pony without any forehead horn, no unicorn horn). The yellow star is a flat hair clip accessory attached to her hair, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "よろしくお願いします" (purple font): Bowing deeply and politely, joining her two front legs in front, with exactly two back legs visible on the ground (strictly exactly 4 legs total, absolutely no extra legs, no 6 legs, zero horns).
- "どういたしまして" (green font): Winking with a confident smile, looking proud (strictly 4 legs, zero horns).
- "それな！" (orange font): Pointing her front hoof straight forward dynamically in strong agreement (strictly 4 legs, zero horns).
- "なるほど" (blue font): Placing one front hoof near her chin thoughtfully, nodding (strictly 4 legs, zero horns).

**Row 2 (Stickers 5 to 8):**
- "すみません" (grey font): Lowering her eyebrows and bowing in a polite apology, joining her two front legs in front, with exactly two back legs visible on the ground (strictly exactly 4 legs total, absolutely no extra legs, no 6 legs, zero horns).
- "いいね！" (blue font): Giving a thumbs-up gesture with her front hoof, smiling brightly (strictly 4 legs, zero horns).
- "おめでとう！" (pink font): Pulling a party cracker with colorful star confetti bursting around her (strictly 4 legs, zero horns).
- "ええっ！？" (orange font): Shocked with her purple eyes wide open, with vertical shadow lines on her face (strictly 4 legs, zero horns).

**Row 3 (Stickers 9 to 12):**
- "ガーン" (grey font): Face turning pale blue with dark shock lines, looking disappointed (strictly 4 legs, zero horns).
- "ぴえん" (blue font): Eyes filled with tears, looking very sad and crying (strictly 4 legs, zero horns).
- "わくわく" (yellow font): Eyes shining like bright stars, looking forward to something with extreme excitement (strictly 4 legs, zero horns).
- "はっ" (orange font): Posing as if she just realized something, with a glowing yellow star light bulb shining above her head (strictly 4 legs, zero horns).

**Row 4 (Stickers 13 to 16):**
- "コソコソ…" (purple font): Sneaking around quietly on tip-toe, looking around like a cute spy (strictly 4 legs, zero horns).
- "ゆっくり休んでね" (green font): Smiling warmly while pulling a cozy pastel blanket to cover someone (strictly 4 legs, zero horns).
- "むりです…" (grey font): Flattened completely flat like a puddle of dough on the ground, holding a small white flag (strictly 4 legs, zero horns).
- "はっぴー" (pink font): Wearing a flower crown on her head, surrounded by colorful flowers and a rainbow (strictly 4 legs, zero horns).

**Row 5 (Stickers 17 to 20):**
- "メモメモ" (blue font): Holding a notebook and pencil, writing notes diligently with a focused face (strictly 4 legs, zero horns).
- "いってきます！" (orange font): Walking away cheerfully while wearing a small pastel backpack and waving (strictly 4 legs, zero horns).
- "ただいま！" (orange font): Opening a door with a relieved, happy smile to be back home (strictly 4 legs, zero horns).
- "ゆめかです" (pink font): Holding up a small pastel nameplate that says "ゆめか" with both front hooves (strictly 4 legs, zero horns).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO UNICORN HORNS.
