# ハシビロコウ LINEスタンプ（夏・サマー編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "暑い…" (grey font): Grey body...`）で定義する。
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
  - Summer Energy (夏フェス/お祭り): Vibrant and excited state, but still maintaining the signature face and body shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey / Dark blue-grey: Signature colors ("スイカ割り", "エアコン命", "かき氷たべたい", "蚊がうるさい", "ラムネ飲む？", "流しそうめん", "宿題見せて？")
  - Grey / Dark Grey / White: Defeated, hot, exhausted ("暑い…", "溶けそう", "夏バテ中", "日焼けした？", "花火きれい", "台風きた…", "お化け屋敷", "冷やし中華", "扇風機から離れん", "夏休みの計画", "自由研究", "リセット")
  - Light Grey / Pale Grey: Moving, active ("麦茶おいしい", "BBQしよ", "宿題おわらん", "おでかけしよ？")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, festivals ("アイス食べる？", "お祭り！", "サマーバカンス", "暑中お見舞い", "夏フェス！", "残暑お見舞い", "夏の思い出", "また来年！")
  - Red: Very hot, danger ("熱中症に注意", "アツすぎる")
  - Sky Blue: Water, swimming ("プール最高", "海にいきたい", "プール開き", "水分補給！", "ひと泳ぎしてくる")
  - Yellow / Golden: Bright summer sun, energy ("夏休み！", "夏バテ防止", "ビールうまい", "天才か？")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (夏・サマー編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "暑い…" (grey font): Grey body, completely melted flat on the floor like a blue-grey puddle.
- "プール最高" (blue font): Sky blue body, wearing a round striped swim ring around its chubby waist, floating lazily on water.
- "アイス食べる？" (pink font): Pinkish-grey body, holding a double-scoop colorful ice cream cone with both wings and offering it.
- "スイカ割り" (blue font): Blue-grey body, wearing a white blindfold, holding a wooden stick tightly in its wings, standing frozen.

**Row 2 (Stickers 5 to 8):**
- "溶けそう" (grey font): Grey body, head drooping and melting downward like soft ice cream on a hot day.
- "海にいきたい" (blue font): Sky blue body, wearing a snorkel mask and swim goggles, looking ready for the beach.
- "エアコン命" (blue font): Blue-grey body, sitting right in front of a blue air conditioner blowing cool wind lines.
- "かき氷たべたい" (blue font): Light blue-grey body, balancing a bowl of strawberry shaved ice on top of its head, holding a tiny spoon.

**Row 3 (Stickers 9 to 12):**
- "夏バテ中" (grey font): Grey body, lying flat on its back with a round ice pack resting on its forehead.
- "日焼けした？" (grey font): Dark grey body, removing black sunglasses to reveal a funny white mask-like skin patch where the sunglasses were.
- "お祭り！" (orange font): Vivid orange body, wearing a red Japanese festival coat (happi) and a twisted headband, holding a paper fan.
- "花火きれい" (purple font): Dark grey body, standing still and looking up at colorful fireworks bursting in the dark starry sky.

**Row 4 (Stickers 13 to 16):**
- "夏休み！" (yellow font): Yellow body, wearing a straw hat, carrying a bug catching net over its shoulder.
- "宿題おわらん" (grey font): Grey body, head in wings in front of a huge pile of unfinished summer homework workbooks, looking stressed.
- "台風きた…" (grey font): Dark grey body, standing still in heavy rain and wind lines with an inside-out broken umbrella.
- "蚊がうるさい" (green font): Blue-grey body, glaring intensely with sharp eyes at a tiny mosquito flying around its head.

**Row 5 (Stickers 17 to 20):**
- "サマーバカンス" (pink font): Pinkish-grey body, wearing a colorful aloha shirt, relaxing on a beach lounge chair under a palm tree.
- "麦茶おいしい" (grey font): Light grey body, drinking cold barley tea through a straw from a large glass.
- "暑中お見舞い" (pink font): Pinkish-grey body, bowing deeply in a formal greeting, holding a postcard with a seagull drawing in its beak.
- "熱中症に注意" (red font): Red body, pointing with a wing to a plastic water bottle to warn about hydration, looking serious.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (夏・サマー編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The shoebill has an extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon, with very soft feathers. **The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs.** It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "プール開き" (blue font): Sky blue body, wearing tiny swim goggles on its forehead, looking ready to swim.
- "BBQしよ" (grey font): Light grey body, holding a skewer of grilled meat and vegetables in front of a smoking barbecue grill.
- "夏フェス！" (pink font): Vivid pink body, wearing a cool festival T-shirt and a towel wrapped around its neck, raising one wing in a rock sign.
- "ラムネ飲む？" (blue font): Light blue-grey body, offering a glass bottle of Japanese ramune soda with both wings.

**Row 2 (Stickers 5 to 8):**
- "お化け屋敷" (grey font): Dark grey body, wearing a white triangular ghost headband, holding both wings up like a cute ghost.
- "冷やし中華" (grey font): Light grey body, balancing a plate of colorful cold ramen noodles on its head, holding chopsticks.
- "水分補給！" (blue font): Sky blue body, gulping down a blue sports drink bottle dynamically with splash effects.
- "流しそうめん" (blue font): Light blue-grey body, waiting with its beak open next to a bamboo slide with running water and noodles.

**Row 3 (Stickers 9 to 12):**
- "夏バテ防止" (yellow font): Yellow body, holding a large traditional wooden box of unaju (grilled eel rice bowl), winking.
- "残暑お見舞い" (pink font): Pinkish-grey body, bowing politely while holding a large bright yellow sunflower with both wings.
- "アツすぎる" (red font): Red body, blushing deeply from the heat, with wavy heat shimmer lines rising from its head.
- "扇風機から離れん" (grey font): Grey body, clinging tightly to the front of a blue electric fan to block all the wind.

**Row 4 (Stickers 13 to 16):**
- "ひと泳ぎしてくる" (blue font): Sky blue body, wearing goggles, striking a diving pose ready to jump into water.
- "夏休みの計画" (grey font): Light grey body, looking at a spread-out map with a spiral confusion mark above its head.
- "ビールうまい" (yellow font): Yellow body, holding up a giant mug of cold frothy beer (or barley tea) with a happy face.
- "夕涼み" (purple font): Dark grey body, sitting on a wooden porch (engawa) with a glass wind chime hanging nearby under a twilight sky.

**Row 5 (Stickers 17 to 20):**
- "夏の思い出" (pink font): Pinkish-grey body, writing in a picture diary book with a crayon, drawing a fish.
- "宿題見せて？" (blue font): Blue-grey body, looking up with watery pleading eyes, offering a blank notebook.
- "自由研究" (grey font): Light grey body, wearing a white lab coat, holding a glass flask and smiling mischievously.
- "また来年！" (pink font): Pinkish-grey body, carrying a swim ring, waving goodbye cheerfully in front of a sunset beach.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
