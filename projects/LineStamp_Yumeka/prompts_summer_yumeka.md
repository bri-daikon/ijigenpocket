# ゆめか LINEスタンプ vol.2 夏休み編 プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)

ゆめかちゃんの夏休み編スタンプ画像を画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやキャラクターデザインの逸脱が発生します。

1. **髪型（たてがみ）の統一 (FLOWING NEAT MANE - CRITICAL)**:
   - 1枚目と髪型を統一するため、たてがみは「ボリュームのある丸い髪型（マッシュルームやおかっぱ）」ではなく、**「後ろに綺麗に流れる、柔らかいたてがみ（flowing, soft, styled neatly mane）」**として指定します。
   - プロンプトで `with her beautiful flowing pastel purple, pink, and sky blue gradient mane clearly visible on her head, styled neatly, not bald` を明記します。
2. **足の数の一致 (STRICTLY EXACTLY 4 LEGS - CRITICAL)**:
   - 手を振る、物を持つ、夏フェスで拳を上げる、自由研究でフラスコを持つ等の「手のように前足を使うポーズ」では、**「後ろ足2本で二足立ちし、前足2本を手として使っている（合計で手2本＋足2本＝4本のみ）」**という二足立ちちびキャラ（chibi character standing on back legs）の指定を徹底し、6本足になるのを完全に防ぎます。
   - 各ポーズで `strictly exactly 4 limbs/legs total, absolutely no extra legs, no 6 legs` を明記します。
3. **角の徹底排除 (ABSOLUTELY ZERO HORNS)**:
   - ゆめかちゃんはポニーであり、**頭部に角（つの）は絶対に生えていません**。
   - 頭部の星は「平らな星型のヘアクリップ（髪飾り）」であり、角ではありません。
   - プロンプトで `Without any horn, completely free of any forehead horn. Absolutely zero horns, no pointed horn, no unicorn horn. The yellow star is a flat star hair clip accessory attached near her ear on her hair, NOT on her forehead, NOT a horn. Only two cute pony ears on top of her head. Her head is smooth with no horns.` を強く強調します。
4. **ポニーの形を保った体型 (Keep Cute Pony Shape)**:
   - 等身が伸びてスマートな馬になってしまわないよう、おまんじゅうのようなぽっちゃりした丸みと、手足が短い低頭身の「ちびポニー（chibi pony filly）」であることを強調します。
   - `She is a low-proportion chibi pony filly (not a tall horse). She has a super chubby, plump, and very cute round body with soft roundness. Her legs are very short and tiny, but clearly recognizable as pony legs. Absolutely no long or tall legs.` と指定します。
5. **特徴的なアクセサリーの指定**:
   - 頭部には黄色い星のヘアアクセサリー（yellow star hair clip / flat hair accessory）を必ず描くように指定します。
6. **パステルグラデーションの維持 (Pastel Gradient Hair & Tail)**:
   - たてがみとしっぽは、単色ではなく「パステルパープル、ピンク、水色のグラデーション（pastel purple, pink, and sky blue gradient）」であることを毎回強調します。
7. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造でプロンプトを記述します。
8. **セリフガチャの防止 (Dialogue Integrity)**:
   - セリフは「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記します。
9. **スライス用の非常に広い余白確保 (Sticker Spacing)**:
   - 個々のイラスト同士が結合するのを防ぐため、余白と白フチを明記します。
   - `Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定します。
10. **数字の徹底的な排除 (STRICTLY NO NUMBERS)**:
    - AIが画像の中に数字を描画してしまうのを防ぐため、`STRICTLY NO NUMBERS OR LABELS IN THE IMAGE` などの指定を強調します。

---

## デザイン仕様 (Design Specifications)

- **Shape**: **Chibi pony filly. Chipped, plump pony body with soft roundness, keeping a clear and cute low-proportion pony shape. She is not a tall horse. STRICTLY has exactly 4 limbs (legs/arms) in total, absolutely no extra legs, no 5 legs, no 6 legs. The legs are short and tiny, but clearly pony legs. Absolutely no long or tall legs. NO horn on her head, absolutely zero horns, no unicorn horns, only cute pony ears are on top of her head. Her forehead is completely bare and smooth. The yellow star on her head is a flat hair clip accessory near her ear, not a horn.** Small pastel purple hooves.
- **Head & Body Details**:
  - Soft white fur body.
  - A beautiful pastel purple, pink, and sky blue gradient mane and tail. The mane (hair) is long, soft, and flows down neatly behind her, never bald, never short bob style.
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

## Summer Grid 1: No. 1 〜 20 (夏休み編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular chibi pony filly named "Yumeka". She is a low-proportion chibi pony, NOT a tall horse. STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). Her forehead is completely smooth and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 5 legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves. She has a beautiful, flowing, soft pastel purple, pink, and sky blue gradient mane clearly visible on her head, long and flowing neatly behind her, never bald, never short bob style.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "暑い…" (grey font): Lying down flat on a pink cloud in a shade, looking completely melted and exhausted, with her ears drooping flat (strictly 4 legs, zero horns, no horn).
- "プール最高" (blue font): Floating peacefully on water inside a pink donut swim ring around her waist (strictly 4 legs, zero horns, no horn).
- "アイス食べる？" (pink font): Holding a colorful double-scoop ice cream cone with her front hooves, offering it with a smile (strictly 4 legs, zero horns, no horn).
- "スイカ割り" (blue font): Wearing a star-patterned blindfold, holding a small wooden stick in her front hooves (strictly 4 legs, zero horns, no horn).

**Row 2 (Stickers 5 to 8):**
- "溶けそう" (grey font): Her mane looking slightly melted like soft ice cream, with a sleepy, blank face (strictly 4 legs, zero horns, no horn).
- "海にいきたい" (blue font): Wearing star-shaped snorkel mask and goggles, looking eager and excited (strictly 4 legs, zero horns, no horn).
- "エアコン命" (blue font): Sitting right in front of a pink electric fan, with cool wind lines blowing her mane backward (strictly 4 legs, zero horns, no horn).
- "かき氷たべたい" (blue font): Balancing a bowl of blue shaved ice on top of her head between her ears, holding a tiny spoon (strictly 4 legs, zero horns, no horn).

**Row 3 (Stickers 9 to 12):**
- "夏バテ中" (grey font): Lying flat on her back with an ice pack resting on her forehead, looking weak (strictly 4 legs, zero horns, no horn).
- "日焼けした？" (grey font): Holding star-shaped sunglasses in one hoof, revealing funny white tan lines around her eyes (strictly 4 legs, zero horns, no horn).
- "お祭り！" (orange font): Wearing a colorful yukata and a cute festival mask placed sideways on her head (strictly 4 legs, zero horns, no horn).
- "花火きれい" (purple font): Standing and looking up at rainbow-colored fireworks in the night sky, showing her side profile (strictly 4 legs, zero horns, no horn).

**Row 4 (Stickers 13 to 16):**
- "夏休み！" (yellow font): Wearing a straw hat with her ears sticking out, holding a bug catching net (strictly 4 legs, zero horns, no horn).
- "宿題おわらん" (grey font): Holding her head with her front hooves in front of a giant pile of homework notebooks (strictly 4 legs, zero horns, no horn).
- "台風きた…" (grey font): Standing in heavy wind and rain, holding an inside-out broken star umbrella (strictly 4 legs, zero horns, no horn).
- "蚊がうるさい" (green font): Glaring angrily at a tiny mosquito flying near her ear (strictly 4 legs, zero horns, no horn).

**Row 5 (Stickers 17 to 20):**
- "サマーバカンス" (pink font): Relaxing on a hammock tied between two palm trees, wearing a tiny aloha shirt (strictly 4 legs, zero horns, no horn).
- "麦茶おいしい" (grey font): Drinking cold tea through a straw from a large glass cup (strictly 4 legs, zero horns, no horn).
- "暑中お見舞い" (pink font): Bowing politely while holding a postcard in her mouth (strictly exactly 4 legs total, zero horns, no horn).
- "熱中症に注意" (red font): Pointing to a plastic water bottle with a serious warning expression (strictly 4 legs, zero horns, no horn).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO HORNS.

---

## Summer Grid 2: No. 21 〜 40 (夏休み編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular chibi pony filly named "Yumeka". She is a low-proportion chibi pony, NOT a tall horse. STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). Her forehead is completely smooth and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump, and round chibi pony body with soft roundness, keeping a clear and cute low-proportion pony shape. Her legs are very short and tiny, but clearly pony legs. Small pastel purple hooves. She has a beautiful, flowing, soft pastel purple, pink, and sky blue gradient mane clearly visible on her head, long and flowing neatly behind her, never bald, never short bob style.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "プール開き" (blue font): Wearing a cute pastel swimsuit, with swimming goggles resting on her forehead, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "BBQしよ" (grey font): Standing in front of a smoking grill, holding a skewer of grilled marshmallows, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "夏フェス！" (pink font): Wearing a cool festival T-shirt and a towel wrapped around her neck, standing on her two back legs like a cute chibi character, raising her two front hooves high to cheer, with exactly 4 limbs total (two front hooves up in the air, two back legs on the ground, strictly exactly 4 limbs total, absolutely no extra legs, no 6 legs, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald).
- "ラムネ飲む？" (blue font): Offering a pastel-colored glass bottle of Japanese ramune soda with her front hooves, standing on two back legs, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).

**Row 2 (Stickers 5 to 8):**
- "お化け屋敷" (grey font): Wearing a white triangle headband, raising both front hooves like a ghost, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).
- "冷やし中華" (grey font): Balancing a plate of cold ramen noodles on her head between her ears, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "水分補給！" (blue font): Gulping down sports drink dynamically with splashing water drops around her, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "流しそうめん" (blue font): Waiting with her mouth open next to a bamboo slide with running water and noodles, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).

**Row 3 (Stickers 9 to 12):**
- "夏バテ防止" (yellow font): Holding a large traditional wooden box of grilled eel rice bowl with her front hooves, standing on two back legs, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).
- "残暑お見舞い" (pink font): Bowing politely while holding a large bright yellow sunflower with her front hooves, standing on two back legs, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).
- "アツすぎる" (red font): Body blushing red from the heat, with heat shimmers rising, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "扇風機から離れん" (grey font): Hugging the front of an electric fan tightly, with her mane blown backward, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).

**Row 4 (Stickers 13 to 16):**
- "ひと泳ぎしてくる" (blue font): Wearing goggles, striking a diving pose ready to jump, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "夏休みの計画" (grey font): Looking at a calendar table with a confused expression, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "ビールうまい" (yellow font): Holding a giant mug of cold tea (looking like beer) with one of her front hooves while standing on three legs, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).
- "夕涼み" (purple font): Sitting on a cloud porch with a glass wind chime hanging nearby, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly 4 legs, zero horns, no horn).

**Row 5 (Stickers 17 to 20):**
- "夏の思い出" (pink font): Drawing a yellow star in a picture diary book with a crayon held in her front hoof, sitting down, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald (strictly exactly 4 legs total, zero horns, no horn).
- "宿題見せて？" (blue font): Looking up with watery pleading eyes, holding out a blank notebook, with her flowing, soft pastel gradient mane clearly visible, long and neat, not bald (strictly 4 legs, zero horns, no horn).
- "自由研究" (grey font): Wearing a tiny white lab coat, standing on her two back legs like a cute chibi character, holding a glass flask in her front hooves, with exactly 4 limbs total (two front hooves holding the flask, two back legs on the ground, strictly exactly 4 limbs total, absolutely no extra legs, no 6 legs, with her beautiful flowing, soft pastel gradient mane clearly visible on her head, long and neat, not bald).
- "また来年！" (pink font): Waving goodbye cheerfully with one of her front hooves in front of a sunset beach, carrying a swim ring, standing on her two back legs like a cute chibi character, with exactly 4 limbs total (one front hoof waving, one front hoof holding the swim ring around her waist, two back legs on the ground, strictly exactly 4 limbs total, absolutely no extra legs, no 6 legs, zero horns, no horn).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO UNICORN HORNS.
