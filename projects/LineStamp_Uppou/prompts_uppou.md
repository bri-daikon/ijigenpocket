# ウッポー LINEスタンプ（日常会話・使いやすい基本の挨拶編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **丸っこさの絶対厳守 (Strict Roundness/Chubbiness)**:
   - **【最重要】ウッポーは「完全な球体・おまんじゅう型」であり、首や体は一切細長くしないこと（STRICTLY perfectly sphere-like body, no slim neck, no long body, no tall shape）。**
   - もこもことした極限の丸みとおデブ感を維持するため、`extremely round, plump, fluffy, and chubby body like a big plush bird balloon` の指定を重ねて強調する。
3. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
4. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "おはよう" (yellow font): ...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
5. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。
6. **数字の徹底的な排除 (STRICTLY NO NUMBERS)**:
   - AIが画像の中に「1, 2, 3」といった数字を描画してしまうのを防ぐため、プロンプト内から数字の連番リスト（1. , 2. 等）を完全に排除する。
   - `STRICTLY NO NUMBERS OR LABELS IN THE IMAGE` などのネガティブプロンプト的な指定を重ねて強調する。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: **STRICTLY perfectly sphere-like, chubby, and round body. No slim necks, no long bodies.** The body is extremely round and fat like a plush balloon bird ball. The legs are extremely short, tiny, and thin, less than 10% of the body height. No long legs at all.
- **Head & Body Details**:
  - Extremely fluffy, soft, and fuzzy cotton-like white feather texture.
  - Long, fluffy white bunny ears on top of the head.
  - Fluffy, round white rabbit tail on the rear.
  - Small owl wings with grey-tipped feathers.
- **Face & Expression**:
  - Large round golden eyes with black pupils and catchlights.
  - Cute small orange beak.
- **Colors (Color by Theme)**:
  - White / Grey: Character base and emotional states ("おはよう", "すみません", "ごめんなさい", "ガーン", "ぴえん", "かまって…", "むりです…", "コソコソ…")
  - Mint Green: Nature, healing ("よろしくお願いします", "お疲れ様です", "おっけー！", "なるほど", "行ってらっしゃい", "ゆっくり休んでね", "感謝します")
  - Yellow / Golden: Bright sun, energy ("おはよう", "どういたしまして", "おねだり", "お金を払わせて", "実質無料", "ビジュアルが強い", "わくわく", "優勝しました", "それな！")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, energetic ("ありがとう！", "おめでとう！", "わーい", "現場へ急行中", "爆買いしました", "推しが尊い", "生きがい", "コラボカフェ行こ", "サンキュー！", "沼が深い", "目が足りない", "チラッ", "行ってきます！", "おかえりなさい", "今向かってます", "がんばって！", "ウッポーです")
  - Purple / Red: Intense passion or crisis ("おやすみなさい", "息ができない", "心臓に悪い", "興奮が収まらん", "推しは正義", "沼が深い", "無理しんどい", "到着しました！")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. Must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (日常会話・使いやすい基本の挨拶編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "おはよう" (yellow font): Looking sleepy with half-closed eyes, with messy and slightly drooped giant, long white bunny ears on its head.
- "こんにちは" (green font): Smiling brightly, waving one small wing cheerfully in a greeting, with two giant, long white bunny ears standing on its head.
- "こんばんは" (blue font): Standing in front of a night sky with a yellow crescent moon, holding a small glowing wood lantern, with two giant, long white bunny ears standing on its head.
- "おやすみなさい" (purple font): Wearing a colorful pajamas nightcap, closing its eyes in sleep, cuddling a pillow, with two giant, long white bunny ears visible from under the cap.

**Row 2 (Stickers 5 to 8):**
- "ありがとう！" (pink font): Sparkling eyes full of joy, holding up a giant warm red heart symbol, with two giant, long white bunny ears standing on its head.
- "どういたしまして" (yellow font): Pushing its chest out proudly, looking confident with a smug smile, with two giant, long white bunny ears standing on its head.
- "よろしくお願いします" (green font): Bowing deeply with its two giant, long white bunny ears flopping forward in a polite bow.
- "お疲れ様です" (orange font): Holding a cute hot green tea cup with both wings, looking relieved and peaceful, with two giant, long white bunny ears standing on its head.

**Row 3 (Stickers 9 to 12):**
- "了解です！" (blue font): Saluting with one wing to its head, with two giant, long white bunny ears standing straight up on its head.
- "おっけー！" (green font): Making an OK ring sign, winking one eye playfully, with two giant, long white bunny ears standing straight up on its head.
- "すみません" (grey font): Lowering its eyebrows apologetically, bowing slightly in a polite apology, with two giant, long white bunny ears clearly standing on its head.
- "ごめんなさい" (grey font): Eyes filled with tears, looking very sad, with its two giant, long white bunny ears completely flattened backward in guilt.

**Row 4 (Stickers 13 to 16):**
- "いいね！" (blue font): Giving a cool thumbs-up with its wingtip, looking proud, with two giant, long prominent white bunny ears that are almost half the size of its body clearly growing and standing on top of its head.
- "おめでとう！" (pink font): Pulling a colorful party cracker, with confetti bursting out, with two giant, long white bunny ears clearly visible and standing on its head.
- "わーい" (pink font): Raising both wings high, jumping up in pure excitement, with two giant, long prominent white bunny ears that are almost half the size of its body standing straight up on top of its head.
- "ええっ！？" (orange font): Shocked with its golden eyes wide open in surprise, its two giant, long white bunny ears standing straight up vertically.

**Row 5 (Stickers 17 to 20):**
- "ガーン" (grey font): Face turned pale blue, with dark vertical shock lines above its head, with two giant, long prominent white bunny ears that are almost half the size of its body standing straight up on top of its head.
- "ぴえん" (grey font): Looking up with big watery eyes filled with tears, about to cry, with two giant, long prominent white bunny ears that are almost half the size of its body standing straight up on top of its head.
- "それな！" (yellow font): Pointing a wing directly forward in strong agreement, with two giant, long prominent white bunny ears standing straight up on its head.
- "なるほど" (green font): Placing a wing to its beak thoughtfully, nodding deeply like a wise owl, with two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (日常会話・使いやすい基本の挨拶編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** On top of its head are long, fluffy white bunny ears (THE CREATURE MUST ALWAYS HAVE LONG BUNNY EARS ON TOP OF ITS HEAD IN EVERY SINGLE STICKER. DO NOT FORGET THE BUNNY EARS). It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "チラッ" (pink font): Peeking from behind a white wall, showing only its long bunny ears and one sparkling eye.
- "かまって…" (grey font): Drooping both ears in a sad 'V' shape, looking down and drawing on the ground with a stick.
- "行ってきます！" (orange font): Wearing a small brown backpack, raising one wing high as it starts walking cheerfully, with long white bunny ears visible.
- "行ってらっしゃい" (green font): Standing by a door, waving both wings quickly in a warm farewell, with long white bunny ears visible.

**Row 2 (Stickers 5 to 8):**
- "ただいま！" (orange font): Opening a door, showing a happy relieved smile to be back home, with long white bunny ears visible.
- "おかえりなさい" (pink font): Spreading both wings wide open in a warm welcoming hug gesture, with long white bunny ears visible.
- "今向かってます" (orange font): Running at full speed with a panicked expression, its bunny ears flying backward in the wind.
- "到着しました！" (red font): Standing proudly next to a small red flag planted in the ground that has "到着" written on it, with long white bunny ears visible.

**Row 3 (Stickers 9 to 12):**
- "お願いします！" (pink font): Pressing both wings together in prayer, eyes sparkling and pleading, with long white bunny ears visible.
- "ゆっくり休んでね" (green font): Smiling warmly while gently pulling up a cozy blanket to cover someone, with long white bunny ears visible.
- "無理しないでね" (blue font): Looking concerned with soft caring eyes, tilting its head gently, with long white bunny ears visible.
- "がんばって！" (pink font): Holding pink pom-poms in both wings, waving them energetically like a cheerleader, with long white bunny ears visible.

**Row 4 (Stickers 13 to 16):**
- "またね！" (green font): Walking away but looking back over its shoulder, waving one wing with a bright smile, with long white bunny ears visible.
- "感謝します" (yellow font): Sitting peacefully with a golden divine light shining behind it, wings pressed together in prayer, with long white bunny ears visible.
- "はーい" (orange font): Raising one wing straight up, giving a bright cheerful response, with long white bunny ears visible.
- "むりです…" (grey font): Flattened completely flat like a puddle of dough on the ground, holding a small white flag, with its long white bunny ears still clearly visible and sticking out on its head.

**Row 5 (Stickers 17 to 20):**
- "わくわく" (yellow font): Eyes shining like stars, looking forward to something with extreme excitement, with long white bunny ears visible.
- "びっくり！" (orange font): Leaping in the air in surprise, its bunny ears standing on end and waving.
- "コソコソ…" (dark font): Sneaking around quietly on tip-toe, looking around suspiciously like a spy, with long white bunny ears visible.
- "ウッポーです" (pink font): Proudly holding up a small white nameplate that says "ウッポー" with both wings, with long white bunny ears visible.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 夏！特集！編 Grid 1: No. 1 〜 20 (夏休み・お祭り・サマーバケーション 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "暑い…" (grey font): Melting completely flat on the floor like a soft puddle of dough, with its two giant, long white bunny ears drooped flat sideways on the ground.
- "プール最高" (blue font): Wearing a round red striped swim ring around its chubby waist, floating on water, with two giant, long white bunny ears standing straight up on its head.
- "アイス食べる？" (pink font): Holding a double-scoop colorful ice cream cone with both wings, offering it, with two giant, long white bunny ears standing straight up on its head.
- "スイカ割り" (blue font): Wearing a white blindfold, holding a wooden stick tightly in its wings, standing frozen, with two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "溶けそう" (grey font): Head drooping and melting downward like soft whipped cream, with its two giant, long white bunny ears looking soft and slightly drooped.
- "海にいきたい" (blue font): Wearing a snorkel mask and swim goggles, looking ready for the beach, with two giant, long white bunny ears standing straight up on its head.
- "エアコン命" (blue font): Sitting right in front of a blue air conditioner blowing cool wind lines, with its two giant, long white bunny ears fluttering in the cold wind.
- "かき氷たべたい" (blue font): Balancing a bowl of strawberry shaved ice on top of its head, holding a tiny spoon, with its two giant, long white bunny ears standing straight up on its head and framing the bowl.

**Row 3 (Stickers 9 to 12):**
- "夏バテ中" (grey font): Lying flat on its back with a round ice pack resting on its forehead, with its two giant, long white bunny ears drooped lifelessly sideways.
- "日焼けした？" (grey font): Wearing black sunglasses that are funny-looking and hanging off its face, revealing a white patch, with its two giant, long white bunny ears standing straight up on its head.
- "お祭り！" (orange font): Wearing a red Japanese festival coat (happi) and a twisted headband, holding a paper fan, with its two giant, long white bunny ears sticking out through the headband.
- "花火きれい" (purple font): Standing still and looking up at colorful fireworks in the dark sky, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "夏休み！" (yellow font): Wearing a straw hat, carrying a bug catching net over its shoulder, with its two giant, long white bunny ears sticking out through holes in the straw hat.
- "宿題おわらん" (grey font): Head in wings in front of a huge pile of unfinished summer homework workbooks, with its two giant, long white bunny ears looking bent and stressed.
- "台風きた…" (grey font): Standing still in heavy rain and wind lines with an inside-out broken umbrella, with its two giant, long white bunny ears blown flat backwards by the wind.
- "蚊がうるさい" (green font): Glaring intensely at a tiny mosquito flying around, with one of its two giant, long white bunny ears twitching and bending.

**Row 5 (Stickers 17 to 20):**
- "サマーバカンス" (pink font): Wearing a colorful aloha shirt, relaxing on a beach lounge chair under a palm tree, with its two giant, long white bunny ears relaxed and drooped slightly.
- "麦茶おいしい" (grey font): Drinking cold barley tea through a straw from a large glass, with its two giant, long white bunny ears standing straight up on its head.
- "暑中お見舞い" (pink font): Bowing deeply in a formal greeting, holding a postcard in its beak, with its two giant, long white bunny ears drooped forward.
- "熱中症に注意" (red font): Pointing with a wing to a plastic water bottle to warn about hydration, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 夏！特集！編 Grid 2: No. 21 〜 40 (夏休み・お祭り・サマーバケーション 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "プール開き" (blue font): Wearing tiny swim goggles on its forehead, looking ready to swim, with two giant, long white bunny ears standing straight up on its head.
- "BBQしよ" (grey font): Holding a skewer of grilled meat and vegetables in front of a smoking barbecue grill, with two giant, long white bunny ears standing straight up on its head.
- "夏フェス！" (pink font): Wearing a cool festival T-shirt and a towel wrapped around its neck, raising one wing, with two giant, long white bunny ears standing straight up on its head.
- "ラムネ飲む？" (blue font): Offering a glass bottle of Japanese ramune soda with both wings, with two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "お化け屋敷" (grey font): Wearing a white triangular ghost headband, holding both wings up like a ghost, with its two giant, long white bunny ears drooped forward like a ghost's ears.
- "冷やし中華" (grey font): Balancing a plate of colorful cold ramen noodles on its head, holding chopsticks, with its two giant, long white bunny ears framing the plate.
- "水分補給！" (blue font): Gulping down a blue sports drink bottle dynamically with splash effects, with its two giant, long white bunny ears blown backward.
- "流しそうめん" (blue font): Waiting with its beak open next to a bamboo slide with running water and noodles, with two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "夏バテ防止" (yellow font): Holding a large traditional wooden box of unaju (grilled eel rice bowl), winking, with two giant, long white bunny ears standing straight up on its head.
- "残暑お見舞い" (pink font): Bowing politely while holding a large bright yellow sunflower with both wings, with its two giant, long white bunny ears slightly drooped.
- "アツすぎる" (red font): Body turned completely red, blushing deeply from the heat, with wavy heat shimmer lines rising, with its two giant, long white bunny ears turned bright red and standing straight up on its head.
- "扇風機から離れん" (grey font): Clinging tightly to the front of a blue electric fan, with its two giant, long white bunny ears blown straight backward by the strong wind.

**Row 4 (Stickers 13 to 16):**
- "ひと泳ぎしてくる" (blue font): Wearing goggles, striking a diving pose ready to jump, with its two giant, long white bunny ears pointing straight backward like a swimmer.
- "夏休みの計画" (grey font): Looking at a spread-out map with a spiral confusion mark above its head, with its two giant, long white bunny ears slightly bent in confusion.
- "ビールうまい" (yellow font): Holding up a giant mug of cold frothy beverage (or barley tea) with a happy face, with two giant, long white bunny ears standing straight up on its head.
- "夕涼み" (purple font): Sitting on a wooden porch (engawa) with a glass wind chime hanging nearby under a twilight sky, with its two giant, long white bunny ears relaxed and slightly drooped.

**Row 5 (Stickers 17 to 20):**
- "夏の思い出" (pink font): Writing in a picture diary book with a crayon, drawing a fish, with two giant, long white bunny ears standing straight up on its head.
- "宿題見せて？" (blue font): Looking up with watery pleading eyes, offering a blank notebook, with its two giant, long white bunny ears slightly drooped in a pleading gesture.
- "自由研究" (grey font): Wearing a white lab coat, holding a glass flask and smiling mischievously, with two giant, long white bunny ears standing straight up on its head.
- "また来年！" (pink font): Carrying a swim ring, waving goodbye cheerfully in front of a sunset beach, with two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## くいしんぼう・おやつ＆カフェスイーツ編 Grid 1: No. 1 〜 20 (お腹すいた・いただきます・別腹 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "お腹すいた" (yellow font): Holding an empty white plate and a metal spoon with both wings, looking hungry with drooped ears, with its two giant, long white bunny ears drooped forward.
- "ごはんまだ？" (orange font): Opening its beak slightly with a cute drop of drool, looking expectantly, with its two giant, long white bunny ears standing straight up on its head.
- "いただきます" (green font): Clapping both wings together in a polite greeting, closing its eyes respectfully, with its two giant, long white bunny ears slightly drooped in a bow.
- "ごちそうさま" (purple font): Looking extremely satisfied with closed eyes, rubbing its full round belly, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "おいしい！" (pink font): Placing both wings on its chubby cheeks, smiling warmly with hearts in its eyes, with its two giant, long white bunny ears standing straight up on its head.
- "もぐもぐ" (orange font): Munching happily on a cute carrot-shaped cookie, with crumbs around its beak, with its two giant, long white bunny ears standing straight up on its head.
- "うまうま" (yellow font): Holding a colorful glazed donut with sprinkles, taking a bite, with its two giant, long white bunny ears standing straight up on its head.
- "あまいもの最高" (pink font): Looking at a huge strawberry parfait with sparkling eyes full of excitement, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "別腹です" (blue font): Looking at a slice of strawberry shortcake with a serious, determined glare, with its two giant, long white bunny ears standing straight up on its head.
- "しあわせ…" (pink font): Eating a stack of fluffy pancakes with melting butter and maple syrup, looking blissful, with its two giant, long white bunny ears relaxed and slightly drooped.
- "おやつタイム" (orange font): Holding a cookie in one wing and a cup of tea in the other, with a small clock nearby, with its two giant, long white bunny ears standing straight up on its head.
- "カフェいこ？" (green font): Holding a cute cafe menu board with one wing, looking up invitingly, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "ティータイム" (blue font): Holding a tea cup elegantly, sipping tea peacefully with closed eyes, with its two giant, long white bunny ears standing straight up on its head.
- "コーヒーどうぞ" (brown font): Holding out a hot coffee cup with both wings to offer it, with its two giant, long white bunny ears standing straight up on its head.
- "おかわり！" (yellow font): Holding up an empty bowl with pleading watery eyes, with its two giant, long white bunny ears slightly drooped in an appeal.
- "うらやましい" (grey font): Peeking from behind a wall, staring at a plate of sweets with wide jealous eyes, with only its eyes and its two giant, long white bunny ears visible.

**Row 5 (Stickers 17 to 20):**
- "ひとくちちょうだい" (orange font): Holding a spoon, looking up with big pleading eyes, with its two giant, long white bunny ears slightly drooped.
- "ダイエットは明日から" (red font): Standing on a scale looking shocked at its weight while holding a donut behind its back, with its two giant, long white bunny ears standing straight up on its head.
- "食べすぎた" (grey font): Lying flat on its back with a round full belly, looking bloated and heavy, with its two giant, long white bunny ears drooped flat sideways.
- "ごちそうします！" (green font): Holding up a small wallet proudly with a confident smile, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## くいしんぼう・おやつ＆カフェスイーツ編 Grid 2: No. 21 〜 40 (デザート・ドリンク・満腹満足 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "デリシャス！" (yellow font): Wearing a white chef hat, winking and holding a fork, with its two giant, long white bunny ears sticking out through holes in the chef hat.
- "プリンは飲み物" (yellow font): Holding a huge custard pudding with a straw inserted into it, sipping it, with its two giant, long white bunny ears standing straight up on its head.
- "メロンソーダ" (green font): Gulping a green melon soda float with vanilla ice cream and a cherry on top through a straw, with its two giant, long white bunny ears standing straight up on its head.
- "シュークリーム" (cream font): Having white cream smeared around its beak, looking surprised with wide eyes, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "チョコ大好き" (brown font): Hugging a large chocolate bar tightly with both wings, looking happy, with its two giant, long white bunny ears standing straight up on its head.
- "マカロン可愛い" (pink font): Squished happily between two large colorful macarons (pink and blue), with its two giant, long white bunny ears standing straight up on its head.
- "たい焼き" (brown font): Balancing a warm Japanese fish-shaped cake (taiyaki) on top of its head between its ears, with its two giant, long white bunny ears standing straight up on its head.
- "にんじんジュース" (orange font): Drinking orange juice from a cup with a carrot straw, looking refreshed, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "おなかいっぱい" (green font): Patting its full round belly with both wings, looking satisfied with a gentle smile, with its two giant, long white bunny ears relaxed and slightly drooped.
- "太っちゃった…" (grey font): Pinching its chubby belly feathers, looking worried, with its two giant, long white bunny ears drooped down in sadness.
- "よだれが…" (grey font): Staring through a bakery window glass display at beautiful cakes, with a drop of drool on its beak, with its two giant, long white bunny ears standing straight up on its head.
- "買い出し中" (orange font): Running happily while carrying a big box of cakes and donuts, with its two giant, long white bunny ears flying backward in the wind.

**Row 4 (Stickers 13 to 16):**
- "新作スイーツ" (yellow font): Holding a colorful cafe flyer (with "新作" written on it), looking super excited, with its two giant, long white bunny ears standing straight up on its head.
- "いちご狩り" (pink font): Holding a giant red strawberry with both wings, looking extremely happy, with its two giant, long white bunny ears standing straight up on its head.
- "焼きたて！" (brown font): Holding a baking tray full of freshly baked cookies while wearing oven mitts, with its two giant, long white bunny ears standing straight up on its head.
- "クレープ食べる？" (pink font): Holding out a delicious fruit crepe to offer it, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "ごほうびスイーツ" (purple font): Hugging a giant luxury parfait glass, looking overjoyed, with its two giant, long white bunny ears standing straight up on its head.
- "満腹満足" (green font): Sleeping peacefully with a happy smile, patting its full belly, with its two giant, long white bunny ears relaxed and drooped.
- "お茶しましょう" (green font): Holding a tea cup, smiling warmly and invitingly, with its two giant, long white bunny ears standing straight up on its head.
- "また食べよ！" (pink font): Waving one wing happily with a cookie crumb on its beak, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## オカルト・都市伝説・怪しい魔法魔術編 Grid 1: No. 1 〜 20 (水晶玉・呪わんよ・召喚 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "すべてお見通し" (yellow font): Looking into a mysterious glowing purple crystal ball with both wings, with its two giant, long white bunny ears standing straight up on its head.
- "呪わんよ" (purple font): Holding a tiny straw doll and a metal nail with a serious glaring expression, with its two giant, long white bunny ears standing straight up on its head.
- "召喚！" (blue font): Holding up a small magic wand as a glowing magical circle shines on the floor, with its two giant, long white bunny ears standing straight up on its head.
- "お呼び出し中" (green font): Drawing a magic circle on the floor with white chalk, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "予言します" (pink font): Drawing a tarot card with one wing, looking wise, with its two giant, long white bunny ears standing straight up on its head.
- "UFOなう" (blue font): Floating in mid-air inside a blue tractor beam coming from a tiny UFO above, with its two giant, long white bunny ears standing straight up on its head.
- "異界へようこそ" (purple font): Opening a creaky wooden door of an old mansion, gesturing inside, with its two giant, long white bunny ears standing straight up on its head.
- "中二病" (red font): Wearing a white bandage over one eye, posing dramatically with wings, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "怪奇現象…" (grey font): Watching furniture float around it with a blank, flat expression, with its two giant, long white bunny ears standing straight up on its head.
- "魔術ですね" (yellow font): Wearing glasses and reading an ancient leather-bound spellbook, with its two giant, long white bunny ears standing straight up on its head.
- "念力送信中" (orange font): Bending a metal spoon using telekinesis, with its two giant, long white bunny ears bent in concentration.
- "ポルターガイスト" (blue font): Floating plates and cups around it, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "信じるか信じないかは" (yellow font): Pointing one wing upward with a smug, knowing smile, with its two giant, long white bunny ears standing straight up on its head.
- "テレパシー送信" (pink font): Placing both wingtips to its temples, closing its eyes to send thoughts, with its two giant, long white bunny ears standing straight up on its head.
- "悪魔と契約" (red font): Wearing a headband with small devil horns, sitting in front of a contract paper, with its two giant, long white bunny ears standing straight up on its head.
- "黒魔術" (purple font): Stirring a bubbling purple potion inside a large black cauldron with a wooden ladle, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "未確認飛行物体" (blue font): Flying and piloting a tiny, cute retro saucer UFO, with its two giant, long white bunny ears sticking out from the top of the UFO dome.
- "結界を張る" (green font): Placing paper talismans on the air around it, looking protective, with its two giant, long white bunny ears standing straight up on its head.
- "ミステリーサークル" (yellow font): Looking at a huge wheat field crop circle shaped like itself, looking surprised, with its two giant, long white bunny ears standing straight up on its head.
- "お清めします" (blue font): Throwing salt into the air to purify, looking cheerful, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## オカルト・都市伝説・怪しい魔法魔術編 Grid 2: No. 21 〜 40 (秘密結社・UMA・宇宙人 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "呪文唱え中" (purple font): Whispering magical runic letters, with its two giant, long white bunny ears standing straight up on its head.
- "ツチノコ発見！" (green font): Holding up a funny snake-like tsuchinoko creature, looking proud, with its two giant, long white bunny ears standing straight up on its head.
- "オカルト好き" (yellow font): Reading a magazine titled "OCULT" with wide, excited eyes, with its two giant, long white bunny ears standing straight up on its head.
- "秘密結社" (grey font): Wearing a dark, hooded robe, looking secretive, with its two giant, long white bunny ears sticking out through two holes in the hood.

**Row 2 (Stickers 5 to 8):**
- "怪しい光" (purple font): Glowing in neon purple and green colors like a mysterious cryptid, with its two giant, long white bunny ears standing straight up on its head.
- "霊視中" (blue font): Meditating with closed eyes as a blue fire ghost (hitodama) floats above it, with its two giant, long white bunny ears standing straight up on its head.
- "スプーン曲がった" (orange font): Looking shocked with wide golden eyes at a bent metal spoon, with its two giant, long white bunny ears standing straight up on its head.
- "魔女の使い魔" (purple font): Wearing a black witch hat and riding a flying broom, with its two giant, long white bunny ears sticking out through holes in the witch hat.

**Row 3 (Stickers 9 to 12):**
- "心霊写真？" (grey font): Standing in front, with a semi-transparent ghost version of itself floating behind, looking surprised, with both itself and the ghost having two giant, long white bunny ears.
- "UMAですか？" (green font): Shaking hands with a cute green Loch Ness monster, looking friendly, with its two giant, long white bunny ears standing straight up on its head.
- "ビッグフット！" (brown font): Looking at a huge footprint on the ground with a magnifying glass, with its two giant, long white bunny ears standing straight up on its head.
- "謎の儀式" (red font): Dancing around a campfire in a silly ritual, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "呪文を忘れた" (grey font): Panicking and flipping pages of a spellbook, with a question mark above, with its two giant, long white bunny ears bent in confusion.
- "宇宙人と交信" (blue font): Wearing a helmet with an antenna, touching fingertips with a little grey alien, with its two giant, long white bunny ears sticking out through holes in the helmet.
- "お札貼っとくね" (red font): Holding out a yellow paper talisman towards the screen to ward off evil, with its two giant, long white bunny ears standing straight up on its head.
- "降霊術" (blue font): Placing a wingtip on a planchette on an Ouija board, looking tense, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "呪術" (grey font): Kneading a cute clay doll that looks like a bird, with its two giant, long white bunny ears standing straight up on its head.
- "浮遊中" (green font): Floating in the air in a lotus meditation pose with a peaceful smile, with its two giant, long white bunny ears standing straight up on its head.
- "闇に帰ります" (purple font): Vanishing in a puff of purple smoke, with its two giant, long white bunny ears still visible in the smoke.
- "また異界で！" (purple font): Wearing the dark hooded robe, waving goodbye cheerfully, with its two giant, long white bunny ears sticking out through the hood.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## レトロゲーム世界迷い込み編 Grid 1: No. 1 〜 20 (セーブ・ゲームオーバー・たたかう 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "セーブ中…" (blue font): Writing in a big open magic spellbook with a quill pen, looking focused, with its two giant, long white bunny ears standing straight up on its head.
- "ゲームオーバー" (red font): Looking sad as its round white body is half pixelated into 8-bit blocks and fading away, with its two giant, long white bunny ears also pixelating.
- "レベルアップ！" (yellow font): Looking extremely happy with eyes closed, with a glowing pixel art "LEVEL UP!" logo hovering above its head, with its two giant, long white bunny ears standing straight up on its head.
- "たたかう" (red font): Holding a tiny wooden toy sword in its wings in a fighting stance with a serious glare, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "にげる" (green font): Running away at full speed with sweat drops, with its two giant, long white bunny ears blown backward.
- "お買い物" (yellow font): Opening a treasure chest filled with carrots and glowing gold coins, looking excited, with its two giant, long white bunny ears standing straight up on its head.
- "毒状態" (purple font): Body shaded in purple with a small purple skull icon floating above, looking sick, with its two giant, long white bunny ears standing straight up on its head.
- "こうかばつぐん" (orange font): Being hit by colorful dramatic action lines and sparks (lightning/fire), with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "毒消し草…" (green font): Munched on a green leaf looking blank-faced, with crumbs around its beak, with its two giant, long white bunny ears standing straight up on its head.
- "なかまになりたそう" (pink font): Looking up with big watery eyes, with a retro game dialogue box below saying "なかまにする / しない" with a hand pointer, with its two giant, long white bunny ears standing straight up on its head.
- "かいしんのいちげき" (red font): Striking a cool hero pose with dramatic manga speed lines and a "CRITICAL!" text overlay, with its two giant, long white bunny ears standing straight up on its head.
- "ぼうぎょ" (blue font): Hiding behind a small iron shield painted with a pink bunny face, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "まほう" (purple font): Waving a small glowing wand with magical sparkles and stars flying around, with its two giant, long white bunny ears standing straight up on its head.
- "つうしんエラー" (red font): Looking confused as a red slash mark overlays a Wi-Fi signal icon, with its two giant, long white bunny ears standing straight up on its head.
- "リトライ？" (yellow font): Looking nervous, with a dialogue box overlay saying "Retry? YES / NO" and a pointer, with its two giant, long white bunny ears standing straight up on its head.
- "ログイン！" (green font): Pointing a wing tip to press a big pixelated "START" button on a retro game title screen, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "ボス戦開始" (red font): Surrounded by a dark red and black aura, looking very intense with a grumpy glare, with its two giant, long white bunny ears standing straight up on its head.
- "コマンド？" (blue font): Standing still with a menu box listing "たたかう / まほう / にげる / もぐもぐ", with its two giant, long white bunny ears standing straight up on its head.
- "ドット絵ウッポー" (grey font): The entire character is drawn in a coarse, pixelated 8-bit retro art style, with its two giant, long white bunny ears also pixelated.
- "コンティニュー" (yellow font): Sweating and looking panicked next to a big pixelated number "9", with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## レトロゲーム世界迷い込み編 Grid 2: No. 21 〜 40 (装備・宿屋・バグ 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "装備変更" (grey font): Trying on a grey iron helmet, with its two giant, long white bunny ears sticking out through two holes in the helmet.
- "宝箱はミミック" (red font): Opening a treasure chest that suddenly grows sharp teeth, looking shocked with wide eyes, with its two giant, long white bunny ears standing straight up on its head.
- "MPがたりない" (blue font): Slumped down lazily with a "MP 0" icon above, looking exhausted, with its two giant, long white bunny ears drooped down.
- "毒の沼地" (green font): Standing in a bubbling green slime puddle, looking sick and blue-faced, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "宿屋で回復" (green font): Sleeping peacefully in a tiny bed under a blanket, with a green "+HP" text icon floating above, with its two giant, long white bunny ears visible on the pillow.
- "伝説の装備" (yellow font): Holding a glowing, sparkling gold sword with both wings proudly, with its two giant, long white bunny ears standing straight up on its head.
- "クエストクリア！" (pink font): Looking triumphant with wings raised, with a big golden "QUEST CLEAR" banner overlay, with its two giant, long white bunny ears standing straight up on its head.
- "にげだした！" (grey font): Running away leaving a cloud of white dust, looking back with a grin, with its two giant, long white bunny ears blown backward.

**Row 3 (Stickers 9 to 12):**
- "全滅しました" (purple font): Floating as a cute, transparent ghost next to a grey headstone tomb, with both the ghost and tomb having two giant, long white bunny ears.
- "アイテム" (green font): Taking a potion bottle and a slice of cake out of a brown leather bag, looking happy, with its two giant, long white bunny ears standing straight up on its head.
- "裏技" (blue font): Holding a retro game controller, with a text overlay of arrow symbols "↑↑↓↓←→←→BA", with its two giant, long white bunny ears standing straight up on its head.
- "ステータス" (yellow font): Standing next to a green status screen saying "NAME: UPPOU, JOB: MANJU", with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "強制終了" (red font): Looking shocked with white hollow eyes as the screen around it is filled with retro error noise, with its two giant, long white bunny ears standing straight up on its head.
- "ロード中…" (blue font): Waiting patiently next to a pixelated rotating hourglass icon, with its two giant, long white bunny ears standing straight up on its head.
- "クリティカル！" (red font): A giant red "CRITICAL!" text popping out in front of it with star bursts, with its two giant, long white bunny ears standing straight up on its head.
- "こうげき！" (orange font): Charging forward head-first with a determined look, with its two giant, long white bunny ears pointing straight forward.

**Row 5 (Stickers 17 to 20):**
- "にんじんを装備" (yellow font): Holding a giant orange carrot like a sword in its wing with a smug smile, with its two giant, long white bunny ears standing straight up on its head.
- "ギルド募集中" (green font): Holding a wooden sign that says "GUILD", looking welcoming, with its two giant, long white bunny ears standing straight up on its head.
- "バグ発生？" (purple font): Looking confused as its body is split and glitched sideways with digital noise, with its two giant, long white bunny ears also glitched.
- "またプレイしよ！" (pink font): Waving goodbye cheerfully, with a retro "TO BE CONTINUED..." text at the bottom, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 圧が強すぎる・メンヘラ気味セリフ編 Grid 1: No. 1 〜 20 (監視中・ずっと一緒・逃がさない 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "監視中" (dark purple font): Peeking out from behind a white wall, showing only its long prominent bunny ears and one glaring eye, with dark vertical shadow lines.
- "今何してるの？" (vivid red font): Pushing its round face extremely close to the screen, looking through a smartphone screen with wide eyes, with its two giant, long white bunny ears standing straight up on its head.
- "既読スルー？" (dark grey font): Holding a smartphone with both wings, looking very sad, with its two giant, long white bunny ears drooping down on its head.
- "どこにいるの？" (blue font): Standing in front of a giant smartphone screen showing a GPS map, holding a large magnifying glass in its wings, with two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "返信まだ？" (red font): Glaring angrily at a round wall clock, with its two giant, long white bunny ears twitching and standing straight up on its head.
- "知ってた" (vivid purple font): Standing in pitch black darkness with a purple light shining from below its face, smiling with glowing red eyes, with its two giant, long white bunny ears standing straight up on its head.
- "逃がさない" (red font): Spreading both wings wide open, blocking the path, looking determined with a glare, with its two giant, long white bunny ears standing straight up on its head.
- "圧" (black font): Standing still with a blank face, with a giant, thick black Japanese word "圧" floating in the background, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "嘘でしょ…" (grey font): Face turned pale blue in shock, with its two giant, long white bunny ears standing straight up vertically.
- "ずっと一緒だよ" (pink font): Wrapping a red string around its wings, closing its eyes happily in a smile, with its two giant, long white bunny ears standing straight up on its head.
- "誰といるの？" (purple font): Looking jealous with a dark aura floating behind its body, with its two giant, long white bunny ears standing straight up on its head.
- "信じてるから" (pink font): Looking up with big watery eyes, pressing both wings together in prayer, with its two giant, long white bunny ears slightly drooping inward.

**Row 4 (Stickers 13 to 16):**
- "全部見てるよ" (purple font): Standing still, with multiple cute glowing eyes floating in the background, with its two giant, long white bunny ears standing straight up on its head.
- "どうして？" (dark grey font): Tilting its head slightly, looking with completely hollow golden eyes without catchlights, with its two giant, long white bunny ears standing on its head.
- "私のこと好き？" (pink font): Bending its two giant, long white bunny ears together on top of its head to form a large heart shape.
- "本当に？" (grey font): Glaring with narrow, suspicious eyes, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "返信して…" (grey font): Lying face down on the ground, crying, with its two giant, long white bunny ears drooped flat sideways.
- "私だけでしょ？" (red font): Looking slightly angry with small flame sparks in the background, with its two giant, long white bunny ears standing straight up on its head.
- "言ったよね？" (purple font): Pointing a wing tip directly forward with a serious glare, with its two giant, long white bunny ears standing straight up on its head.
- "逃げられないよ" (dark red font): Smiling creepily with a dark vignette background, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 圧が強すぎる・メンヘラ気味セリフ編 Grid 2: No. 21 〜 40 (無理しんどい・病んでます・愛が重い 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "無理しんどい" (purple font): Holding its head with wings, looking stressed, with its two giant, long white bunny ears bent and messy.
- "病んでます" (grey font): Wearing a white bandage wrapped around its head, with its two giant, long white bunny ears sticking out through the bandage, looking down sadly.
- "もう知らない！" (pink font): Turning its back, showing its round white rear and tail, with its two giant, long white bunny ears turned backward towards the screen.
- "生きててごめん" (dark grey font): Flattened completely flat like a puddle of dough on the ground, with its two giant, long white bunny ears lying flat and limp on the floor.

**Row 2 (Stickers 5 to 8):**
- "かまってくれないと" (orange font): Hugging a carrot plush toy tightly with both wings, looking grumpy with puffed cheeks, with its two giant, long white bunny ears standing straight up on its head.
- "情緒不安定" (purple font): One half of its face smiling and the other half crying, split with a digital glitch noise effect, with its two giant, long white bunny ears also glitched.
- "すきすき大好き" (pink font): Buried in a pile of small pink heart symbols, blushing, with its two giant, long white bunny ears standing straight up on its head.
- "拒絶" (blue font): Crossing both wings in an "X" mark, looking cold with a glare, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "消えたい" (blue font): Floating as a semi-transparent ghost, looking sad, with its two giant, long white bunny ears also semi-transparent.
- "生きてるだけで偉い" (pink font): Placing its own wing on its head, patting itself gently, with its two giant, long white bunny ears standing straight up on its head.
- "世界で一番好き" (pink font): Hugging a giant love letter envelope tightly with both wings, looking happy, with its two giant, long white bunny ears standing straight up on its head.
- "重い？" (dark grey font): Carrying a giant dark 100-ton weight on its back, sweating and looking exhausted, with its two giant, long white bunny ears bent under the weight.

**Row 4 (Stickers 13 to 16):**
- "裏切り？" (grey font): Shocked with white hollow eyes, looking half petrified, with its two giant, long white bunny ears standing straight up.
- "話があるの" (black font): Sitting on a chair behind a small wooden table, looking serious, with its two giant, long white bunny ears standing straight up.
- "捨てないで…" (blue font): Looking up with watery pleading eyes inside a wet cardboard box labeled "Please adopt me" in Japanese, with its two giant, long white bunny ears sticking out through holes in the box.
- "息ができない" (pink font): Blushing deeply with pink heart-shaped smoke coming out of its beak, looking breathless and passionate, with its two giant, long white bunny ears standing straight up on its head.

**Row 5 (Stickers 17 to 20):**
- "もう限界です" (red font): Face turned pale with a spinning red police warning light on its head, looking panicked, with its two giant, long white bunny ears standing straight up on its head.
- "愛が重い" (pink font): Carrying a giant pink heart symbol that is bigger than itself, looking squished and squashed under it, with its two giant, long white bunny ears standing straight up.
- "病み期突入" (purple font): Background dark purple with a tiny grey rain cloud floating above its head, with rain lines falling on it, with its two giant, long white bunny ears drooping.
- "また連絡してね" (pink font): Waving one wing sadly, looking lonely, with its two giant, long white bunny ears slightly drooped.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 世紀末デストピア・ヒャッハー編 Grid 1: No. 1 〜 20 (ヒャッハー！・汚物は消毒・退かぬ！ 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "ヒャッハー！" (vivid orange font): Wearing a colorful mohawk wig between its ears, holding a mini toy flamethrower and shouting, with its two giant, long white bunny ears standing straight up on its head.
- "汚物は消毒" (red font): Blasting bright orange fire from a mini flamethrower, looking fierce with a glare, with its two giant, long white bunny ears standing straight up on its head.
- "水が足りない" (grey font): Holding an empty water bottle, looking dehydrated and sweating with white hollow eyes, with its two giant, long white bunny ears drooped flat sideways.
- "世紀末" (dark grey font): Wearing a dark ragged cloak, standing silently against a background of a ruined desert wasteland, with its two giant, long white bunny ears standing on its head.

**Row 2 (Stickers 5 to 8):**
- "お前はもう…" (vivid blue font): Pointing a wingtip forward, with a dramatic blue energy aura rising behind it, with its two giant, long white bunny ears standing straight up on its head.
- "種モミ…" (green font): Holding a small brown pouch with both wings carefully, looking up with pleading watery eyes, with its two giant, long white bunny ears slightly drooping inward.
- "水だー！" (blue font): Holding a glass of clean water with both wings, looking overjoyed with a drop of drool, with its two giant, long white bunny ears standing straight up.
- "力こそパワー" (yellow font): Wearing spiked black shoulder pads, flexing one wing proud of its "muscle", with its two giant, long white bunny ears standing straight up.

**Row 3 (Stickers 9 to 12):**
- "裏切り者め！" (red font): Looking angry with a glare, with its two giant, long white bunny ears standing straight up vertically.
- "退かぬ！" (black font): Crossing both wings proudly in an arm-fold pose, looking confident with aジト目 (grumpy glare), with its two giant, long white bunny ears standing straight up on its head.
- "媚びぬ！" (pink font): Tilting its head up and turning away stubbornly, looking smug, with its two giant, long white bunny ears standing straight up on its head.
- "省みぬ！" (green font): Striking a cool hero pose with a determined look, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "荒野を爆走" (orange font): Riding a tiny red tricycle decorated with spikes, raising dust in a desert, with its two giant, long white bunny ears blown backward by the wind.
- "世紀末覇者" (yellow font): Sitting on a stone throne, wearing a golden spiked crown with its two giant, long white bunny ears sticking out through holes in the crown.
- "強敵" (blue font): Shoulder-to-shoulder with another similar cute bird, both shedding dramatic tears of friendship, with both having two giant, long white bunny ears.
- "伝説の救世主" (red font): With a glowing Big Dipper constellation pattern on its chest, looking heroic, with its two giant, long white bunny ears standing straight up.

**Row 5 (Stickers 17 to 20):**
- "食糧確保！" (green font): Carrying a bundle of dried carrots with both wings, looking happy, with its two giant, long white bunny ears standing straight up.
- "オアシス発見" (blue font): Eyes sparkling with joy, in front of a small water pond with a palm tree, with its two giant, long white bunny ears standing straight up on its head.
- "悪党め…" (grey font): Peeking from behind a pile of stone rubble, looking around suspiciously, with only its eyes and two giant, long white bunny ears visible.
- "無想転生" (purple font): Body semi-transparent with afterimages floating behind it, looking calm, with its two giant, long white bunny ears also semi-transparent.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## 世紀末デストピア・ヒャッハー編 Grid 2: No. 21 〜 40 (ガソリン満タン・シェルターへ！・天に帰る 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "ガソリン満タン" (yellow font): Holding a red metal jerrycan, smiling with a smug look, with its two giant, long white bunny ears standing straight up on its head.
- "鉄屑集め" (grey font): Picking up metal screws and gears, putting them in a woven basket on its back, with its two giant, long white bunny ears standing straight up.
- "罠に注意" (red font): Pointing a wing tip down at a sharp spiked bear trap on the ground, looking alert, with its two giant, long white bunny ears standing straight up on its head.
- "笑うしかない" (orange font): Laughing hysterically with its mouth wide open, with its two giant, long white bunny ears waving wildly in the air.

**Row 2 (Stickers 5 to 8):**
- "シェルターへ！" (blue font): Wearing a grey steel helmet with its two giant, long white bunny ears sticking out through two holes in the helmet, shouting into a megaphone.
- "文明崩壊" (grey font): Standing next to a smoking, broken old desktop computer, holding both wings out in confusion, with its two giant, long white bunny ears standing on its head.
- "物々交換" (green font): Holding a screw in one wing and a carrot in the other, offering a trade, with its two giant, long white bunny ears standing straight up.
- "百裂拳" (red font): Punching the air at super speed with many punching afterimages, shouting, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "きれい好き" (orange font): Holding a giant green spray bottle, spraying mist everywhere, with its two giant, long white bunny ears standing straight up.
- "世紀末の朝" (orange font): Standing with a mohawk wig, waving hello to a giant red sun rising over a wasteland, with its two giant, long white bunny ears standing straight up.
- "強者求む" (black font): Standing next to a wooden sign post that says "WANTED STRENGTH", with its wings folded in a smug pose, with its two giant, long white bunny ears standing straight up.
- "水がうまい" (blue font): Gulping down brown water from a tin cup through a straw, looking satisfied, with its two giant, long white bunny ears standing straight up.

**Row 4 (Stickers 13 to 16):**
- "世紀末の癒やし" (pink font): Looking warmly at a tiny yellow dandelion flower growing from stone cracks, with its two giant, long white bunny ears relaxed and slightly drooped.
- "サバイバル" (green font): Holding a compass and a worn map, looking around, with its two giant, long white bunny ears standing straight up.
- "ヒャッハれない" (grey font): Looking depressed with its mohawk wig drooping, with its two giant, long white bunny ears drooped flat sideways.
- "世紀末都市" (purple font): Standing on top of a ruined skyscraper ledge under a windy sky, with its two giant, long white bunny ears and a dark cloak blowing in the wind.

**Row 5 (Stickers 17 to 20):**
- "砂嵐きた" (grey font): Wearing goggles (and small mini goggles on its long bunny ears), shielding itself from a heavy sandstorm with both wings, with its two giant, long white bunny ears blown backward.
- "略奪禁止" (red font): Wearing spiked shoulder pads, crossing both wings in a firm "NO" gesture, with its two giant, long white bunny ears standing straight up.
- "天に帰る" (yellow font): Raising one wing high towards a beam of bright divine light from the sky, closing its eyes peacefully, with its two giant, long white bunny ears standing straight up.
- "また荒野で！" (pink font): Waving goodbye from the passenger seat of a spiked motorcycle sidecar, with its two giant, long white bunny ears standing straight up on its head.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## あざと可愛い・煽り系編 Grid 1: No. 1 〜 20 (で？・個人の感想・あざとい 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "で？" (grey font): Tilting its head slightly to the side, looking directly forward with a flat, grumpy, half-closed expressionless eye glare (ジト目), with its two giant, long white bunny ears standing straight up on its head.
- "個人の感想ですよね" (vivid blue font): Pointing one wingtip (pointing finger) straight up, looking calm and smug with a slight smirk, with its two giant, long white bunny ears standing straight up on its head.
- "すごーい（棒）" (green font): Eyes completely hollow and lifeless (no catchlights), clapping both wings together slowly in a lazy, unmotivated applause, with its two giant, long white bunny ears standing straight up on its head.
- "知ってた" (yellow font): Folding both wings proudly (arm-fold), looking extremely confident with a smug grin, with its two giant, long white bunny ears standing straight up on its head.

**Row 2 (Stickers 5 to 8):**
- "きこえなーい" (vivid pink font): Folding its two giant, long white bunny ears down to cover its own face and eyes, turning its body away stubbornly to ignore someone.
- "あざとい" (vivid pink font): Placing both wings on its chubby cheeks, tilting its head, looking up with giant, watery, sparkling eyes full of affection, with its two giant, long white bunny ears standing straight up on its head.
- "知らんけど" (grey font): Waving both wings in a casual, irresponsible shrug, turning its face away with an indifferent look, with its two giant, long white bunny ears standing on its head.
- "何か問題でも？" (vivid blue font): Holding a small green teacup elegantly with both wings, sipping calmly with a smug, polite face, with its two giant, long white bunny ears standing straight up on its head.

**Row 3 (Stickers 9 to 12):**
- "だから何？" (purple font): Raising one ear-base slightly (like a raised eyebrow), looking with a cold, questioning glare, with its two giant, long white bunny ears standing on its head.
- "はいはいそうだね" (orange font): Waving one wing dismissively in a lazy, uncaring gesture, looking bored and looking away, with its two giant, long white bunny ears standing straight up.
- "ご自由にどうぞ" (green font): Gesturing "after you" politely with one wing, but its eyes are focused on reading a book in its wings, looking completely uninterested, with its two giant, long white bunny ears standing straight up.
- "マジで言ってる？" (dark grey font): Glaring with completely serious, wide-open hollow eyes without catchlights, looking deadpan and threatening, with its two giant, long white bunny ears standing stiffly on its head.

**Row 4 (Stickers 13 to 16):**
- "てへぺろ" (pink font): Winking one eye playfully and sticking out a tiny pink tongue from the side of its orange beak, with its two giant, long white bunny ears standing straight up on its head.
- "許してにゃん" (vivid pink font): Bending both wings on top of its head to form cute cat ears, winking, but its two giant, long white bunny ears are still clearly growing and standing tall behind them.
- "可愛すぎてごめん" (pink font): Striking a cute idol pose, winking with sparkling hearts and stars floating in the background, with its two giant, long white bunny ears standing straight up.
- "他力本願" (yellow font): Pressing both wings together in a pleading prayer, looking up with big starry, manipulative eyes, with its two giant, long white bunny ears slightly drooping inward.

**Row 5 (Stickers 17 to 20):**
- "異論は認めない" (red font): Pointing one wing tip directly at the viewer, looking very serious and determined, with its two giant, long white bunny ears standing straight up on its head.
- "気のせいだよ" (green font): Whistling with its beak rounded and looking away to the upper right corner to act innocent, with its two giant, long white bunny ears standing straight up.
- "言われなくても！" (orange font): Turning its face away in a huff, looking pouted and grumpy, with its two giant, long white bunny ears flattened slightly backward.
- "どうでもいいけど" (grey font): Opening its beak wide in a large yawn, with tiny tears at the corners of its closed eyes, with its two giant, long white bunny ears drooped slightly.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## あざと可愛い・煽り系編 Grid 2: No. 21 〜 40 (草・それな・私がルールです 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "お気の毒に" (vivid blue font): Holding a small white handkerchief with both wings and dabbing its eyes, fake crying dramatically, with its two giant, long white bunny ears standing straight up.
- "さすがです〜" (purple font): Smiling widely and clapping enthusiastically, but with a dark shadow aura floating behind it, with its two giant, long white bunny ears standing straight up.
- "自慢ですか？" (grey font): Leaning on a table with its wing supporting its cheek (cheek rest), looking with a cold, bored glare, with its two giant, long white bunny ears standing.
- "はい、論破" (red font): Pointing one wingtip straight up with a smug, triumphant grin, looking proud, with its two giant, long white bunny ears standing straight up.

**Row 2 (Stickers 5 to 8):**
- "草" (green font): Covering its beak with one wing, trying hard to hold back laughter, with small green "w" symbols floating in the background, with its two giant, long white bunny ears standing straight up.
- "それな" (yellow font): Pointing a wing tip forward and nodding casually with a smug smile, with its two giant, long white bunny ears standing straight up.
- "知らんがな" (grey font): Shrugging both wings in a "who cares" gesture, looking exasperated, with its two giant, long white bunny ears standing straight up.
- "まあ、がんばって" (orange font): Waving a small flag that says "がんばれ" with a fake, friendly smile, looking completely indifferent, with its two giant, long white bunny ears standing straight up.

**Row 3 (Stickers 9 to 12):**
- "ふーん" (purple font): Looking down with narrow, half-closed eyes and a tiny smug smirk, looking condescending, with its two giant, long white bunny ears standing straight up.
- "あっ、そっかぁ" (grey font): With a blank, lifeless face and hollow eyes, looking completely unmotivated, with its two giant, long white bunny ears standing straight up.
- "見てるよ" (red font): Pointing two wing tips to its own golden eyes in a "watching you" gesture, looking intense, with its two giant, long white bunny ears standing straight up.
- "気の毒に…" (blue font): Looking with fake concerned, sad eyes but a blank mouth, with its two giant, long white bunny ears slightly drooped.

**Row 4 (Stickers 13 to 16):**
- "時間の無駄" (orange font): Pointing a wing to a carrot-designed pocket watch, looking impatient and annoyed, with its two giant, long white bunny ears standing straight up.
- "無理しんどい" (vivid pink font): Throwing its head back and holding its head with wings in dramatic exhaustion, but looking cute and styled, with its two giant, long white bunny ears bent backward.
- "もう一回言って？" (green font): Tilting its head and cupping one wing to its head, leaning forward, with one of its two giant, long white bunny ears pointing forward to listen.
- "よくできました" (pink font): Patting the head of a tiny, cute chibi bird with one wing, looking superior and smug, with its two giant, long white bunny ears standing straight up.

**Row 5 (Stickers 17 to 20):**
- "で、本題は？" (blue font): Leaning both wings on a table and resting its chin, staring with a bored, half-closed glare, with its two giant, long white bunny ears standing straight up.
- "へぇー" (grey font): Looking completely uninterested while filing its small feather tips with a nail file, with its two giant, long white bunny ears standing straight up.
- "私がルールです" (gold font): Wearing a tiny golden crown on its head, puffing out its chest proudly with a smug grin, with its two giant, long white bunny ears sticking out next to the crown.
- "またね（はぁと）" (vivid pink font): Blowing a kiss with one wing, winking, with a giant pink heart flying forward, with its two giant, long white bunny ears standing straight up.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## お嬢様・ロココ貴族風編 Grid 1: No. 1 〜 20 (おーほっほ・よろしくてよ・お茶にしましょう 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "おーほっほ！" (vivid pink font): Wearing a blonde drill ponytail wig (縦ロール) between its ears, holding one wing tip to its beak laughing elegantly, with its two giant, long white bunny ears sticking out through the blonde hair.
- "よろしくてよ" (vivid blue font): Holding a beautiful white fan (sensu) opened in its wings, smiling gracefully with closed eyes, with its two giant, long white bunny ears standing straight up on its head.
- "お黙りなさい" (red font): Pointing one wing tip forward sharply, glaring with a stern, authoritative eye, with its two giant, long white bunny ears standing straight up.
- "ごきげんよう" (pink font): Tilting its head slightly, holding the hem of a beautiful pink dress, bowing elegantly, with its two giant, long white bunny ears standing straight up.

**Row 2 (Stickers 5 to 8):**
- "庶民的ですわ" (purple font): Holding a golden monocle to one of its large golden eyes with a wing, looking with a cold, condescending glare, with its two giant, long white bunny ears standing on its head.
- "感謝いたしますわ" (vivid pink font): Pressing both wings together over its chest, smiling warmly with closed eyes, with its two giant, long white bunny ears standing straight up.
- "お許しあそばせ" (grey font): Looking up with big watery eyes filled with tears, bowing its head slightly in a polite apology, with its two giant, long white bunny ears slightly drooping forward.
- "よろしくて？" (green font): Tilting its head gently, smiling politely in a question, with its two giant, long white bunny ears also tilted slightly.

**Row 3 (Stickers 9 to 12):**
- "ごめんあそばせ" (blue font): Turning its face away proudly with its eyes closed, with its two giant, long white bunny ears standing straight up on its head.
- "お茶にしましょう" (vivid green font): Holding a luxury golden tea cup and saucer with both wings, looking peaceful, with its two giant, long white bunny ears standing straight up on its head.
- "当然ですわ" (yellow font): Pushing its chest out proudly, looking confident with a smug smirk, with its two giant, long white bunny ears standing straight up.
- "信じられませんわ" (orange font): Covering its beak with a fan, golden eyes wide open in shock and disbelief, with its two giant, long white bunny ears standing straight up.

**Row 4 (Stickers 13 to 16):**
- "お労しいことです" (grey font): Lowering its eyebrows sadly, dabbing one eye gently with a white lace handkerchief, with its two giant, long white bunny ears drooping slightly.
- "お見事ですわ" (pink font): Clapping both wings together gracefully, smiling warmly, with its two giant, long white bunny ears standing straight up.
- "よくてよ" (green font): Winking one eye playfully, smiling, with its two giant, long white bunny ears standing straight up.
- "それはなんですの" (blue font): Peering closely at something with a golden monocle, looking curious but suspicious, with its two giant, long white bunny ears standing on its head.

**Row 5 (Stickers 17 to 20):**
- "興ざめですわ" (grey font): Stirring tea in a cup with a tiny spoon lazily, looking bored with a grumpy glare (ジト目), with its two giant, long white bunny ears standing straight up.
- "お聞きなさい" (purple font): Raising one wing tip straight up to call for attention, looking wise, with its two giant, long white bunny ears standing straight up.
- "あらあら" (orange font): Placing both wings on its cheeks, smiling gently with a soft expression, with its two giant, long white bunny ears standing straight up.
- "おやすみなさいませ" (dark blue font): Sleeping peacefully under a blanket in a canopy bed, wearing a nightcap with its two giant, long white bunny ears sticking out through holes.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## お嬢様・ロココ貴族風編 Grid 2: No. 21 〜 40 (チェス・身分が違いますわ・お覚悟はよろしくて 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "わたくしの勝ちです" (gold font): Holding a white chess queen piece proudly, standing next to a chessboard, with a smug grin, with its two giant, long white bunny ears standing straight up.
- "退屈ですわ" (grey font): Leaning on a table, resting its cheek on one wing (cheek rest), looking bored and sighing, with its two giant, long white bunny ears standing.
- "お祝いいたします" (pink font): Raising a luxury champagne glass with both wings, smiling elegantly, with its two giant, long white bunny ears standing straight up.
- "認めませんわ" (red font): Crossing both wings in an "X" mark, looking strict and stern, with its two giant, long white bunny ears standing straight up.

**Row 2 (Stickers 5 to 8):**
- "お呼びかしら？" (green font): Looking back over its shoulder, tilting its head with a polite smile, with its two giant, long white bunny ears standing straight up.
- "あら、素敵" (vivid pink font): Holding a single red rose gently, eyes sparkling like stars, with its two giant, long white bunny ears standing straight up on its head.
- "目が眩みますわ" (yellow font): Covering its eyes with a white fan in dramatic adoration, with its two giant, long white bunny ears standing straight up.
- "お腹が空きました" (orange font): Holding an empty golden plate and a fork, looking up with big pleading eyes, with its two giant, long white bunny ears slightly drooping.

**Row 3 (Stickers 9 to 12):**
- "結構ですわ" (blue font): Holding one wing flat forward in a polite refusal gesture, looking calm, with its two giant, long white bunny ears standing straight up.
- "身分が違いますわ" (gold font): Wearing a tiny golden tiara between its ears, chest puffed out in a proud pose, looking down smugly, with its two giant, long white bunny ears standing tall.
- "急ぎましょう" (pink font): Running gracefully in a dress with roses fluttering in the background, with its two giant, long white bunny ears flying backward in the wind.
- "おほほほ" (vivid pink font): Smiling widely with closed eyes, with its two giant, long white bunny ears standing straight up on its head.

**Row 4 (Stickers 13 to 16):**
- "お聞き苦しいです" (grey font): Covering its ears with both wings in disgust, looking annoyed, with its two giant, long white bunny ears folded down slightly.
- "失礼いたします" (blue font): Bowing politely with a closed fan held to its chest, with its two giant, long white bunny ears flopping forward in a bow.
- "素晴らしいですわ" (vivid pink font): Pressing both wings to its chest, looking deeply moved and shedding a happy tear, with its two giant, long white bunny ears standing straight up.
- "わたくしがルール" (gold font): Holding a fan high like a sceptre, looking proud and majestic, with its two giant, long white bunny ears standing straight up.

**Row 5 (Stickers 17 to 20):**
- "お覚悟はよろしくて" (red font): Holding a thin fencing foil (rapier) gracefully in one wing, smiling confidently with a sharp look, with its two giant, long white bunny ears standing straight up.
- "まさか…ですわ" (grey font): Shocked with white hollow eyes, leaning backward in shock, with its two giant, long white bunny ears standing straight up on its head.
- "お静かに" (blue font): Placing one wing tip on its beak in a "shh" gesture, winking, with its two giant, long white bunny ears standing straight up.
- "またお会いしましょう" (pink font): Waving goodbye from the window of a classic wooden horse carriage, smiling warmly, with its two giant, long white bunny ears visible.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## ミステリー・名探偵＆事件解決編 Grid 1: No. 1 〜 20 (犯人はお前だ！・真実はいつも…・現場検証中 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. When it wears a hat, cap, or helmet, its two giant bunny ears MUST stick out through holes or gaps in the hat/cap/helmet. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "犯人はお前だ！" (red font): Wearing a plaid detective deerstalker hat, with its two giant, long white bunny ears sticking out through holes in the hat, pointing its wing tip straight forward dynamically, glaring intensely.
- "真実はいつも…" (blue font): Wearing black-rimmed glasses, raising the glasses slightly with one wingtip, looking cool and sharp with a glint in its eyes, with two giant, long white bunny ears standing straight up on its head.
- "アリバイがあります" (green font): Holding up a photo card showing itself eating a carrot happily, looking innocent, with two giant, long white bunny ears standing straight up.
- "迷宮入りです" (grey font): Shrugging both wings in defeat with a helpless sighing expression, with two giant, long white bunny ears drooping sideways.

**Row 2 (Stickers 5 to 8):**
- "じっちゃんの名にかけて" (red font): Closing its eyes solemnly, raising one wingtip (pointing finger) upward with a burning fiery aura in the background, with two giant, long white bunny ears standing straight up.
- "謎はすべて解けた！" (yellow font): With a bright glowing lightbulb shining above its head, smiling brilliantly as it gets a great idea, with two giant, long white bunny ears standing straight up.
- "お呼び出しですか？" (green font): Wearing a blue police officer cap with its two giant, long white bunny ears sticking out through holes in the cap, holding a small notepad and a pencil to take notes.
- "怪盗参上！" (pink font): Wearing a white top hat and a white cape, with its two giant, long white bunny ears sticking out through holes in the hat, holding a playing card (ace of spades) with a smug, mischievous grin.

**Row 3 (Stickers 9 to 12):**
- "予告状を送ります" (blue font): Offering a blue envelope labeled "予告状" with a smug smile, with two giant, long white bunny ears standing straight up.
- "そこまでです！" (red font): Spreading both wings in a "Stop" gesture with a red flashing siren light (patrol lamp) spinning in the background, with two giant, long white bunny ears standing straight up.
- "逮捕します！" (red font): Holding a pair of carrot-shaped orange handcuffs with both wings, glaring intensely, with two giant, long white bunny ears standing straight up.
- "聞き込み中" (green font): Wearing a detective cap, writing secretly in a small memo pad with a pencil, looking around sneakily, with its two giant, long white bunny ears sticking out through holes in the hat.

**Row 4 (Stickers 13 to 16):**
- "犯人を追え！" (orange font): Wearing a detective cap, bending down and looking closely at tiny footprints on the ground with a magnifying glass, with its two giant, long white bunny ears sticking out through holes in the hat.
- "証拠を確保！" (green font): Holding a small plastic zipper bag containing a green carrot leaf (evidence) using tweezers, looking serious, with two giant, long white bunny ears standing straight up.
- "沈黙は金です" (grey font): With a zipper graphic effect drawn over its closed beak, looking troubled and sweat dropping, with its two giant, long white bunny ears drooped.
- "密室殺人事件！？" (grey font): Standing in front of a heavily locked wooden door with multiple chains and locks, golden eyes wide open in shock and shock lines behind, with two giant, long white bunny ears standing straight up.

**Row 5 (Stickers 17 to 20):**
- "不可解ですな" (blue font): Holding a wooden detective pipe (puffing green carrot-leaf shaped smoke puffs) in its beak, looking deep in thought with a questioning glare, with two giant, long white bunny ears standing straight up.
- "容疑者はあなたです" (red font): Pointing a wing tip straight at the viewer, glaring with suspicious half-closed eyes, with two giant, long white bunny ears standing straight up.
- "証言が食い違う？" (purple font): Two identical Uppous standing back-to-back, pointing in opposite directions with confused expressions, each having two giant, long white bunny ears.
- "現場検証中" (yellow font): Standing behind a yellow "KEEP OUT" caution tape, looking serious and examining the ground, with two giant, long white bunny ears standing straight up.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## ミステリー・名探偵＆事件解決編 Grid 2: No. 21 〜 40 (トリックですか？・自白してください・また次の事件で！ 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are very wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated with plenty of blank space and easy to slice.
Character design: **The character is a cute hybrid creature named "Uppou". It has a STRICTLY perfectly sphere-like, chubby, and round body with extremely fluffy, soft, and fuzzy cotton-like white feather texture. No slim neck, no long body.** CRITICAL REQUIREMENT: EVERY SINGLE ONE OF THE 20 STICKERS MUST STRICTLY HAVE TWO GIANT, LONG PROMINENT WHITE BUNNY EARS ON TOP OF ITS HEAD THAT ARE ALMOST HALF THE SIZE OF ITS BODY. A STICKER WITHOUT BUNNY EARS IS AN ABSOLUTE FAILURE. When it wears a hat, cap, or helmet, its two giant bunny ears MUST stick out through holes or gaps in the hat/cap/helmet. It has large, round, glowing golden eyes with black pupils and clear shiny catchlights inside them. It has a cute, small orange beak. The wing tips of its small owl wings are colored grey. On its rear, it has a fluffy, round white rabbit tail. Its legs are extremely short, thin, and tiny under its round body.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "トリックですか？" (blue font): Folding wings in a smug arm-fold pose, looking with a cold, bored half-closed eyes glare after seeing a trick revealed, with two giant, long white bunny ears standing straight up.
- "見逃しませんよ" (red font): Peering closely at the viewer, with one of its golden eyes huge and magnified behind a giant magnifying glass, with two giant, long white bunny ears standing straight up.
- "自白してください" (orange font): Pushing a hot katsudon (carrot rice bowl) across a table under a single interrogation lamp, looking with warm, gentle eyes, with two giant, long white bunny ears standing straight up.
- "完全犯罪！" (black font): Standing in the dark with a mysterious shadow cast over its face, eyes glowing with a wicked grin, with two giant, long white bunny ears standing straight up.

**Row 2 (Stickers 5 to 8):**
- "偽物だ！" (red font): One Uppou dynamically peeling off a mask shaped like another Uppou's face to reveal its real face under it, with both having two giant, long white bunny ears.
- "張り込み中" (grey font): Hiding behind a utility pole, holding a milk carton and an anpan (sweet bun) in wings, peeking out sneakily, with two giant, long white bunny ears sticking out.
- "捜査は足で稼ぐ" (orange font): Wearing small red sneakers, running dynamically across a wasteland with sweat drops flying, with its two giant, long white bunny ears flying backward.
- "怪しいですね…" (purple font): Touching its beak with a wingtip, narrowing its golden eyes in deep suspicion, with two giant, long white bunny ears standing straight up.

**Row 3 (Stickers 9 to 12):**
- "協力しますわ" (pink font): Wearing an elegant pink RoCoCo-style noble dress, offering a folder of case documents gracefully, with its two giant, long white bunny ears standing straight up on its head.
- "罠にかかりましたね" (green font): Smiling smugly and pointing a wing tip at a carrot caught in a metal snap trap (bear trap) on the ground, with two giant, long white bunny ears standing straight up.
- "動かぬ証拠" (red font): Holding up a photo card showing itself sneaking and eating a carrot, sweating guiltily, with two giant, long white bunny ears standing straight up.
- "指紋検出！" (blue font): Dusting a glass cup with a small brush and white powder to lift fingerprints, looking focused, with two giant, long white bunny ears standing straight up.

**Row 4 (Stickers 13 to 16):**
- "緊急逮捕！" (red font): Riding inside a tiny toy police patrol car with siren sound effect lines, rushing forward dynamically, with its two giant, long white bunny ears flying in the wind.
- "私が犯人です…" (grey font): Sweating heavily, hiding wings behind its back, looking down sadly in regret, with its two giant, long white bunny ears completely drooped backward.
- "一件落着！" (orange font): Standing peacefully with a sunset sky background, holding a detective pipe in its beak, looking satisfied, with two giant, long white bunny ears standing straight up.
- "真実を暴け" (blue font): Standing heroically with a dark blue cape fluttering in strong wind, looking forward with sharp determined eyes, with two giant, long white bunny ears standing straight up.

**Row 5 (Stickers 17 to 20):**
- "協力者求む" (yellow font): Shaking wings firmly with a mysterious dark silhouette character, looking determined, with two giant, long white bunny ears standing straight up.
- "謎が深まるばかり" (purple font): With a giant purple question mark "?" floating above its head, tilting its head in complete confusion, with its two giant, long white bunny ears also tilted.
- "監視カメラ作動中" (blue font): Standing next to a security camera, looking in the exact same direction as the camera lens, looking alert, with two giant, long white bunny ears standing straight up.
- "また次の事件で！" (pink font): Waving goodbye cheerfully, throwing a smoke bomb with a purple smoke cloud (smoke screen), with its two giant, long white bunny ears sticking out.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
