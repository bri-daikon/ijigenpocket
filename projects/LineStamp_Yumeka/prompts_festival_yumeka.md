# ゆめか LINEスタンプ vol.3 夏祭り＆花火編 プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)

ゆめかちゃんの夏祭り＆花火編スタンプ画像を画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやキャラクターデザインの逸脱が発生します。

1. **髪型（たてがみ）の統一 (FLOWING NEAT MANE - CRITICAL)**:
   - たてがみは「ボリュームのある丸い髪型（マッシュルームやおかっぱ）」ではなく、**「後ろに綺麗に流れる、柔らかいたてがみ（flowing, soft, styled neatly mane）」**として指定します。
   - プロンプトで `with her beautiful flowing pastel purple, pink, and sky blue gradient mane clearly visible on her head, styled neatly behind her, never bald, never short bob style` を明記します。
2. **足の数の一致 (STRICTLY EXACTLY 4 LEGS - CRITICAL)**:
   - 前足を動かす（物を持つ、手を振る、神輿を担ぐ）動作をする際は、**「後ろ足2本で二足立ちし、前足2本を手として使っている（合計で手2本＋足2本＝4本のみ）」**という二足立ちちびキャラ（chibi character standing on back legs）の指定を徹底し、6本足になるのを完全に防ぎます。
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
   - たてがみとしっぽは、単色ではなく「パステルパープル, ピンク, 水色のグラデーション（pastel purple, pink, and sky blue gradient）」であることを毎回強調します。
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
  - The Japanese text for each sticker must be written as a single, contiguous horizontal block centered directly below each pony.
  - **Do NOT split the words, do NOT write text vertically, and do NOT write different text elements on the left and right sides of the pony.**
  - The Japanese text below each pony is NOT black. Must be written in **various bright, colorful fonts** matching the theme, all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps per sheet). No missing rows. No numbers or technology labels in the image. Solid bright lime green background (#76FF03).

---

## Festival Grid 1: No. 1 〜 20 (夏祭り＆花火編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular chibi pony filly named "Yumeka". She is a low-proportion chibi pony, NOT a tall horse. STRICTLY NO HORN on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn, no pointed horn). Her forehead is completely smooth, flat, and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump pony body with soft roundness, keeping a clear and cute pony shape. STRICTLY has exactly 4 legs on every sticker, absolutely no extra legs, no 5 legs, no 6 legs. Her legs are short and tiny, but clearly pony legs. Small pastel purple hooves. She has a beautiful, flowing, soft pastel purple, pink, and sky blue gradient mane clearly visible on her head, long and flowing neatly behind her, never bald, never short bob style.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.
Text styling: **The Japanese text for each sticker MUST be written as a single, contiguous horizontal block centered directly below each pony. Do NOT split the words (e.g. do NOT write "チョコ" on the left and "バナナ" on the right, write "チョコバナナ" centered below), do NOT write text vertically, and do NOT write different/unrelated text elements on the left and right sides of the pony. All words must be spelled correctly in Japanese, surrounded by a thick white border outline.**
**CRITICAL: ABSOLUTELY ZERO HORNS ON EVERY SINGLE STICKER. NO POINTED HORNS, NO UNICORN HORNS. HER FOREHEAD IS COMPLETELY SMOOTH AND FLAT. THE STICKERS MUST NOT HAVE A HORN.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "お祭り！" (pink font): Wearing a cute pastel yukata, jumping happily surrounded by colorful glowing paper lanterns (strictly 4 legs, zero horns, no horn).
- "わっしょい" (blue font): Wearing a mini festival happi coat, carrying a tiny star-topped mikoshi shrine on her back, standing on her two back legs like a cute chibi character, with two straps held by her two front hooves, with strictly exactly 4 limbs total (two front hooves, two back legs on the ground, strictly exactly 4 limbs total, absolutely no extra legs, no 5 legs, no 6 legs, zero horns, no horn).
- "いこう！" (orange font): Waving her front hoof to invite you, looking back toward a traditional festival torii gate (strictly 4 legs, zero horns, no horn).
- "わくわく" (yellow font): With sparkling eyes, looking eagerly at the festival food stalls in front of her (strictly 4 legs, zero horns, no horn).

**Row 2 (Stickers 5 to 8):**
- "きれい…" (purple font): Looking up at massive colorful fireworks in the sky, eyes glittering with reflection, side profile (strictly 4 legs, zero horns, no horn).
- "たまや〜" (pink font): Shouting cheerfully with her front hooves open wide under a sky lit by sparkling fireworks (strictly 4 legs, zero horns, no horn).
- "屋台めぐり" (orange font): Carrying various street foods in her front hooves, walking happily with a relaxed face (strictly 4 legs, zero horns, no horn).
- "りんご飴" (red font): Holding a shiny red candy apple with her front hooves, licking it happily (strictly 4 legs, zero horns, no horn).

**Row 3 (Stickers 9 to 12):**
- "わたあめ" (pink font): Hugging a giant, fluffy pastel pink cotton candy that is as big as her body (strictly 4 legs, zero horns, no horn).
- "チョコバナナ" (brown font): Holding a colorful chocolate banana with her front hoof, taking a cute bite (strictly 4 legs, zero horns, no horn).
- "金魚すくい" (blue font): Holding a paper scoop (poi) with her front hoof, staring intently at goldfish swimming in a water tub (strictly 4 legs, zero horns, no horn).
- "とれた！" (green font): Holding up a clear plastic bag containing a cute little goldfish, winking happily (strictly 4 legs, zero horns, no horn).

**Row 4 (Stickers 13 to 16):**
- "フランクフルト" (red font): Happily chewing on a large sausage on a stick with ketchup and mustard on it (strictly 4 legs, zero horns, no horn).
- "焼きもろこし" (yellow font): Holding a grilled corn on the cob with her front hooves, munching it eagerly (strictly 4 legs, zero horns, no horn).
- "たこ焼き" (brown font): Holding a takoyaki ball with a toothpick, gently blowing on it to cool it down (strictly 4 legs, zero horns, no horn).
- "あつあつ" (red font): Shuffling a hot takoyaki in her mouth, with cute tiny steam puffs coming out of her mouth (strictly 4 legs, zero horns, no horn).

**Row 5 (Stickers 17 to 20):**
- "ラムネ" (blue font): Surprised but happy as she pops the marble down a glass ramune soda bottle with splashing bubbles (strictly 4 legs, zero horns, no horn).
- "しゅわぁ" (blue font): Looking completely refreshed and bubbly, surrounded by cute soda bubbles (strictly 4 legs, zero horns, no horn).
- "冷え冷え" (blue font): Holding a cold bottle of juice against her cheek, looking chilled and happy (strictly 4 legs, zero horns, no horn).
- "うちわ" (green font): Holding a paper fan with her front hoof, fanning herself to stay cool under the summer breeze (strictly 4 legs, zero horns, no horn).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO HORNS.

---

## Festival Grid 2: No. 21 〜 40 (夏祭り＆花火編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright lime green (#76FF03) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute regular chibi pony filly named "Yumeka". She is a low-proportion chibi pony, NOT a tall horse. STRICTLY NO horn on her head (absolutely zero horns on her head, she is a normal horse filly, NOT a unicorn, without any forehead horn, no unicorn horn). Her forehead is completely smooth and bare. The yellow star is a flat star hair clip accessory attached near her ear, NOT a horn. She has a chubby, plump, and round chibi pony body with soft roundness, keeping a clear and cute low-proportion pony shape. Her legs are very short and tiny, but clearly pony legs. Small pastel purple hooves. She has a beautiful, flowing, soft pastel purple, pink, and sky blue gradient mane clearly visible on her head, long and flowing neatly behind her, never bald, never short bob style.** On top of her head, she has a pastel purple, pink, and sky blue gradient mane, adorned with a bright yellow star hair accessory near her ear. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 21 to 24):**
- "浴衣だよ" (pink font): Showing off her lovely yukata with a star pattern on her belt, looking slightly shy and cute (strictly 4 legs, zero horns, no horn).
- "おめかし" (purple font): Standing in front of a mirror, adjusting her pastel hair and checking the yellow star clip (strictly 4 legs, zero horns, no horn).
- "お面" (red font): Wearing a cute traditional fox mask placed sideways on her head, looking classy and proud (strictly 4 legs, zero horns, no horn).
- "どん！" (grey font): Startled by a loud boom of fireworks, eyes wide and round as she hops up slightly (strictly 4 legs, zero horns, no horn).

**Row 2 (Stickers 25 to 28):**
- "はぐれた…" (blue font): Standing in a crowd, looking teary-eyed and lost while holding her front hooves together (strictly 4 legs, zero horns, no horn).
- "どこー？" (orange font): Looking around left and right, searching for someone in the festival crowd (strictly 4 legs, zero horns, no horn).
- "みつけた！" (pink font): Waving her front hoof happily with a bright smile after finding you (strictly 4 legs, zero horns, no horn).
- "いっしょに" (purple font): Sitting down next to you, looking up at fireworks together, back view layout (strictly 4 legs, zero horns, no horn).

**Row 3 (Stickers 29 to 32):**
- "うっとり" (orange font): Holding a sparkler (sparkling wire firework) with her front hoof, gently watching the small sparks (strictly 4 legs, zero horns, no horn).
- "じんわり" (pink font): Quietly watching the red glowing ember of the sparkler with a warm, cozy look (strictly 4 legs, zero horns, no horn).
- "おちる…" (grey font): Shocked and slumped down as the glowing sparkler ember drops off, looking sad (strictly 4 legs, zero horns, no horn).
- "また来ようね" (pink font): Smiling warmly under the starry night sky with the remnants of fireworks, looking at you (strictly 4 legs, zero horns, no horn).

**Row 4 (Stickers 33 to 36):**
- "満腹〜" (orange font): Lying down on her back on green grass, rubbing her full, round tummy happily (strictly 4 legs, zero horns, no horn).
- "お疲れさま" (purple font): Bowing politely in front of festival lanterns at the end of the day (strictly exactly 4 legs total, zero horns, no horn).
- "足が痛い…" (grey font): Sitting on the ground, rubbing one of her hind legs with her front hoof, looking tired (strictly 4 legs, zero horns, no horn).
- "ねむい…" (blue font): Walking slowly while rubbing her sleepy eyes, looking extremely drowsy (strictly 4 legs, zero horns, no horn).

**Row 5 (Stickers 37 to 40):**
- "おやすみ" (blue font): Sleeping soundly in her yukata on a fluffy cloud bed, holding a star pillow (strictly 4 legs, zero horns, no horn).
- "夏の夜" (green font): Sitting on a wooden veranda (engawa), listening to a wind chime while holding a cold tea cup (strictly 4 legs, zero horns, no horn).
- "ありがとう" (pink font): Holding a paper fan, bowing politely to express gratitude (strictly exactly 4 legs total, zero horns, no horn).
- "たのしかった！" (pink font): Waving both front hooves with a giant happy smile to say goodbye (strictly exactly 4 legs total, zero horns, no horn).

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE. NO UNICORN HORNS.
