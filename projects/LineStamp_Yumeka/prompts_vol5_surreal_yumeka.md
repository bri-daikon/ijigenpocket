# ゆめか LINEスタンプ（深夜のテンション／シュール編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)

ゆめかちゃんのスタンプ画像を画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやキャラクターデザインの逸脱が発生します。

1. **スライス用の余白確保 (Sticker Spacing - CRITICAL)**:
   - 自動切り出し（スライス）を容易にするため、各イラストの間に非常に広い余白と緑の境界（Gutter/Margin）を確保します。
   - `Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定し、イラスト同士が結合するのを絶対に防ぎます。
2. **足の数の一致 (STRICTLY EXACTLY 4 LEGS)**:
   - すべてのポーズにおいて、**足の数は必ず4本**です。
   - プロンプトで `STRICTLY has exactly 4 legs, absolutely no extra legs, no 5 legs, no 6 legs` を強調します。
3. **角の徹底排除 (ABSOLUTELY ZERO HORNS)**:
   - ゆめかちゃんはポニーであり、**頭部に角（つの）は絶対に生えていません**。
   - プロンプトで `Without any horn, completely free of any forehead horn. Absolutely zero horns, no pointed horn, no unicorn horn. The yellow star is a flat hair clip attached to her hair, NOT a horn. Only two cute pony ears on her head. Her head is smooth with no horns.` を強く強調します。
4. **ポニーの形を保った体型 (Keep Cute Pony Shape)**:
   - 体型は、ぽってりとして丸みがありますが、必ずポニー（馬）としての可愛らしい形と輪郭を保ちます。
   - `Chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. The legs are short and tiny, but clearly recognizable as pony legs.`
5. **特徴的なアクセサリーの指定 (Strict Accessory Requirement)**:
   - 頭部には黄色い星のヘアアクセサリー（yellow star hair clip / flat hair accessory）を必ず描くように指定します。
6. **パステルグラデーションの維持 (Pastel Gradient Hair & Tail)**:
   - たてがみとしっぽは、単色ではなく「パステルパープル、ピンク、水色のグラデーション（pastel purple, pink, and sky blue gradient）」であることを毎回強調します。
7. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造でプロンプトを記述します。
8. **背景色の選定 (Background Color)**:
   - 切り出し時にクロマキー処理しやすいため、`solid bright lime green background (#76FF03)` を使用します。
9. **デザインスタイル（可愛さ重視） (Design Style)**:
   - `Japanese anime sticker style, ultra cute chibi style, thick clean vector lines, highly detailed, expressive eyes.` を追加して、より親しみやすく可愛いデザインにします。
10. **テキストスタイル (Text Styling)**:
    - `The Japanese text must be written in various bright, colorful fonts matching the theme, all surrounded by a thick white border outline.`

---

## Grid 1: No. 1 〜 20 (限界突破！深夜のテンション編)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Style: Japanese anime sticker style, ultra cute chibi style, thick clean vector lines, highly detailed, expressive eyes. The Japanese text must be written in various bright, colorful fonts matching the theme, all surrounded by a thick white border outline.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular pony filly named "Yumeka". STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). Her forehead is completely smooth and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 5 legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "無" (purple font): Staring into the void with huge watery purple eyes, completely expressionless and silent (strictly 4 legs, zero horns).
- "予定は未定" (blue font): Lying flat on her back on the ground, exposing her chubby belly, with blank white eyes completely given up on tomorrow (strictly 4 legs, zero horns).
- "……" (grey font): Staring directly forward with a completely deadpan, emotionless face, doing nothing (strictly 4 legs, zero horns).
- "あー…" (pink font): A soul-like ghost escaping from her open mouth, looking completely drained (strictly 4 legs, zero horns).

**Row 2 (Stickers 5 to 8):**
- "動かん" (orange font): Wrapped tightly in a pastel blanket like a burrito, only showing her cute face, determined not to move (strictly 4 legs, zero horns).
- "ムリ" (green font): Trying to pry her own eyelids open with her short tiny hooves because she is too sleepy (strictly 4 legs, zero horns).
- "スヤァ" (blue font): Sleeping and snoring skillfully while standing up perfectly on all four legs (strictly exactly 4 legs on the ground, zero horns).
- "おいで" (pink font): Peeking out from under a blanket, gesturing "come here" with one tiny front hoof to tempt someone back to sleep (strictly 4 legs, zero horns).

**Row 3 (Stickers 9 to 12):**
- "覚醒" (yellow font): Eyes wide open, glowing brightly with manic late-night energy, striking a bizarre dynamic pose (strictly 4 legs, zero horns).
- "糖分" (purple font): Holding a fork and knife, drooling slightly with an intense, obsessed expression but still looking cute (strictly 4 legs, zero horns).
- "カロリーゼロ" (orange font): Eating potato chips from a bag with a completely blank, emotionless face (strictly 4 legs, zero horns).
- "謎ステップ" (green font): Dancing a bizarre, rhythmic step on her back legs with a completely serious face (strictly exactly 4 legs total, zero horns).

**Row 4 (Stickers 13 to 16):**
- "草" (green font): Literally eating green grass from the ground with a deadpan look (strictly 4 legs, zero horns).
- "打てん" (purple font): Frustrated and angry because her hooves are too thick to tap the screen of a smartphone she is holding (strictly 4 legs, zero horns).
- "限界" (grey font): Collapsed on the ground, completely exhausted and worn out like a literal overworked horse (strictly 4 legs, zero horns).
- "届かない" (orange font): Looking desperately at a carrot dangling from a stick in front of her head, but her neck is too short to reach it (strictly 4 legs, zero horns).

**Row 5 (Stickers 17 to 20):**
- "了解！" (blue font): Making an unnecessary smug face while crossing her short front hooves (strictly 4 legs, zero horns).
- "お疲れ" (grey font): Looking like a deflated, flat balloon with her soul completely gone (strictly 4 legs, zero horns).
- "サンキュー" (purple font): Bowing mechanically like a robot with absolutely zero emotion in her face (strictly 4 legs, zero horns).
- "草超えて森" (green font): Buried completely in a massive pile of tall green grass, with only her cute face poking out (strictly 4 legs, zero horns).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO HORNS.

---

## Grid 2: No. 21 〜 40 (圧倒的虚無！限界社会ポニー編)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Style: Japanese anime sticker style, ultra cute chibi style, thick clean vector lines, highly detailed, expressive eyes. The Japanese text must be written in various bright, colorful fonts matching the theme, all surrounded by a thick white border outline.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular pony filly named "Yumeka". STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). The yellow star is a flat hair clip accessory attached to her hair, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "哲学" (purple font): Staring intensely at her own short front legs, having a sudden philosophical crisis about being a pony (strictly 4 legs, zero horns).
- "解せぬ" (blue font): Tilting her head with extreme half-closed skeptical eyes, looking deeply confused and unsatisfied (strictly 4 legs, zero horns).
- "虚無" (grey font): Sitting awkwardly hugging her knees, looking far away in absolute nothingness (strictly 4 legs, zero horns).
- "探さないで" (pink font): Walking away showing her back, carrying a tiny bindle on a stick, escaping from reality (strictly 4 legs, zero horns).

**Row 2 (Stickers 5 to 8):**
- "既読" (orange font): Calmly turning a smartphone face down without looking at the screen, actively ignoring a message (strictly 4 legs, zero horns).
- "へぇ" (grey font): Looking with dead fish eyes, showing absolutely zero interest in the conversation (strictly 4 legs, zero horns).
- "で？" (blue font): Tilting her chin up slightly, looking down with a surreal, mocking expression (strictly 4 legs, zero horns).
- "見なかった事に" (green font): Trying to cover her eyes with her front hooves to pretend she didn't see something, but failing (strictly 4 legs, zero horns).

**Row 3 (Stickers 9 to 12):**
- "帰りたい" (blue font): Crawling on the ground crying waterfalls of tears, desperately wanting to go home (strictly 4 legs, zero horns).
- "楽しいナ" (orange font): Forcing a fake smile with her mouth while her eyes are full of tears from working too hard (strictly 4 legs, zero horns).
- "HP 0" (grey font): Her body is pixelating and fading away into thin air because she has zero energy left (strictly 4 legs, zero horns).
- "降伏" (pink font): Lying flat on her back, waving a tiny white surrender flag with her short hoof (strictly 4 legs, zero horns).

**Row 4 (Stickers 13 to 16):**
- "破壊" (purple font): Firing a massive, destructive pastel-colored laser beam from her cute mouth (strictly 4 legs, zero horns).
- "分身" (orange font): Moving side to side so fast that she creates multiple afterimages and clones of herself (strictly 4 legs, zero horns).
- "神" (yellow font): Floating in mid-air, glowing with a divine pastel aura like she has awakened a hidden power (strictly 4 legs, zero horns).
- "サヨナラ" (blue font): Being abducted by a tractor beam from a UFO, ascending into space with a completely straight face (strictly 4 legs, zero horns).

**Row 5 (Stickers 17 to 20):**
- "おはよう" (orange font): Glaring angrily and terrifyingly at a beautiful rising sun, hating the morning (strictly 4 legs, zero horns).
- "永眠" (purple font): Sleeping peacefully with her hooves crossed over her chest in a luxurious, slightly gothic bed resembling a coffin (strictly 4 legs, zero horns).
- "よろしく" (pink font): Her face zoomed in extremely close to the screen, creating uncomfortable pressure (strictly 4 legs, zero horns).
- "ごめん" (green font): Prostrating completely flat on the ground in dogeza style, stretching her front and back legs out straight (strictly 4 legs, zero horns).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO UNICORN HORNS.
