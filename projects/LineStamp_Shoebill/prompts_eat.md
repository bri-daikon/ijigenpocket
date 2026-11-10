# ハシビロコウ LINEスタンプ（くいしんぼう・お腹すいた・カフェご飯編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足の極短指定 (Leg Ratio)**:
   - 足は「体高の10%未満の極細・極小の棒状」と指定する。
   - `The legs are extremely short, thin, and tiny, looking like minimal sticks under the body. The length of each leg is less than 10% of the body height. Absolutely no long, tall, or sturdy legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **丸っこさの絶対厳守 (Strict Roundness/Chubbiness)**:
   - **【最重要】ハシビロコウは「完全な球体・おまんじゅう型」であり、首や体は一切細長くしないこと（STRICTLY perfectly sphere-like body, no slim neck, no long body, no tall shape）。**
   - もこもことした極限の丸みとおデブ感を維持するため、`extremely round, plump, fluffy, and chubby (fat bird) body like a big plush bird balloon` の指定を重ねて強調する。
3. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
4. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "お腹すいた" (yellow font): Light yellow body...`）で定義する。
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
- **Beak & Head**:
  - Very large, flat light yellow beak.
  - Two small feathers sticking up on top of the head like cowlicks.
- **Face & Expression**:
  - Hungry/Eager (お腹すいた/期待): Wide gleaming eyes or determined grumpy glare while looking at food.
  - Eating/Satisfied (食事中/満腹): Cheeks puffed out, happy closed eyes, or dozing off with a full stomach.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("モグモグ…", "ごちそうさま", "動きたくない", "昼ごはん何食べる", "買い出し中", "塩分が足りない", "満腹で眠い…", "枕が友達")
  - Grey / Dark Grey / White: Faded, lazy, or empty ("ごはんまだ？", "デブ活中", "今日はもう無理", "糖分補給中", "味がしない…", "偏食してます", "食が細い日…", "もちもち…")
  - Mint Green: Nature, healing ("カフェ行こう！", "コーヒーブレイク", "夜ごはん何にする", "これおすすめ！", "おやつタイム", "パジャマです")
  - Yellow / Golden: Bright sun, energy ("お腹すいた", "美味しい！", "ラーメン食べたい", "カレーは飲み物", "私が奢ります！", "幸せの味がする", "ごはんですよ！")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, energetic ("スイーツは別腹", "お腹いっぱい", "肉が食べたい！", "乾杯！！！", "おやつタイム", "奢ってください", "甘いもの求む", "コラボカフェ行こ", "ドリンクどうぞ", "カフェオレ気分")
  - Purple / Red: Heat, warning ("飯テロです", "甘いもの求む", "誘惑に負けた…", "激辛に挑戦！")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. Must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (くいしんぼう・お腹すいた・カフェご飯編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "お腹すいた" (yellow font): Light yellow body, holding a spoon and fork in its wings, looking hungry with a rumbling sound effect bubble near its stomach.
- "ごはんまだ？" (grey font): Grey body, sitting in front of a completely empty round plate, tapping the table with a wing in a grumpy glare.
- "モグモグ…" (blue font): Blue-grey body, cheeks puffed out wide and round as it happily chews food.
- "美味しい！" (yellow font): Golden-yellow body, holding a giant round rice ball (onigiri) with both wings, looking extremely happy with sparkling eyes.

**Row 2 (Stickers 5 to 8):**
- "スイーツは別腹" (pink font): Vivid pink body, with its round head poking out from the center hole of a giant colorful strawberry donut.
- "飯テロです" (red font): Red body, holding out a giant steaming bowl of delicious ramen with noodles and eggs, tempting the viewer.
- "デブ活中" (grey font): Grey body, happily buried in a mountain of potato chips bags, pizza slices, and soda cans.
- "カフェ行こう！" (green font): Mint green body, holding a cute stylish coffee cup in its beak, looking ready to go out.

**Row 3 (Stickers 9 to 12):**
- "お腹いっぱい" (pink font): Peach-grey body, perfectly round like a ball, rolling on the floor while rubbing its full round belly with a satisfied face.
- "ごちそうさま" (blue font): Blue-grey body, bowing politely with wings pressed together in front of a clean, empty plate.
- "甘いもの求む" (purple font): Purple body, staggering forward with a blank look while floating illusions of cupcakes and chocolates hover around its head.
- "ラーメン食べたい" (yellow font): Yellow body, wearing a ramen fishcake (naruto) on top of its head like a hat, with a dreamy focused face.

**Row 4 (Stickers 13 to 16):**
- "肉が食べたい！" (orange font): Orange body, holding a giant cartoon bone meat (manga-niku) tightly with both wings with a passionate glare.
- "コーヒーブレイク" (green font): Mint green body, holding a steaming mug cup, relaxing peacefully.
- "カレーは飲み物" (yellow font): Yellow body, drinking curry directly from a large curry boat dish like a beverage.
- "乾杯！！！" (orange font): Orange body, raising a giant overflowing glass of draft beer (or juice) with a proud, confident face.

**Row 5 (Stickers 17 to 20):**
- "朝ごはん何？" (yellow font): Light yellow body, wearing a funny hat shaped like a fried egg and a slice of toast, waiting excitedly.
- "昼ごはん何食べる" (blue font): Blue-grey body, standing in front of a lunch menu blackboard, looking thoughtful and indecisive with a glare.
- "夜ごはん何にする" (green font): Mint green body, holding a supermarket flyer in its beak and carrying a grocery basket on its wing.
- "奢ってください" (pink font): Peach-grey body, looking up with big, watery pleading eyes, holding out a small, completely flat empty wallet.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (くいしんぼう・お腹すいた・カフェご飯編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "私が奢ります！" (yellow font): Golden-yellow body, wearing a tiny black bow tie, proudly presenting a shiny credit card with a dapper smile.
- "糖分補給中" (pink font): Vivid pink body, licking a giant colorful lollipop candy, looking instantly energized with sharp eyes.
- "塩分が足りない" (blue font): Blue-grey body, holding a salt shaker, displaying a pack of sports hydration salt candy with a sweaty face.
- "ダイエットは明日" (grey font): Grey body, eating a cream puff while stepping on a weighing scale, using its wing to hide the weight number.

**Row 2 (Stickers 5 to 8):**
- "誘惑に負けた…" (purple font): Purple body, staring at a half-eaten large chocolate cake with a mixture of guilt and pleasure.
- "つまみ食い" (orange font): Orange body, looking sneaky and tiptoeing to steal a piece of fried chicken (karaage) from a large plate.
- "買い出し中" (blue font): Blue-grey body, carrying a grocery paper bag with a green leek sticking out, walking determinedly.
- "もちもち…" (grey font): Pale grey body, chewing on a round, stretchy white rice cake (mochi), stretching it long like its own round body.

**Row 3 (Stickers 9 to 12):**
- "カフェオレ気分" (pink font): Peach-grey body, floating relaxedly in a swirling coffee-and-milk swimming pool.
- "激辛に挑戦！" (red font): Red body, breathing fire out of its beak with wide shocked eyes after eating a tiny red chili pepper.
- "味がしない…" (grey font): Grey body, looking hollow and pale with a tiny ghost soul escaping its beak, staring at a bowl of soup.
- "これおすすめ！" (green font): Mint green body, holding out a snack box labeled "RECOMMEND" with a proud, friendly face.

**Row 4 (Stickers 13 to 16):**
- "幸せの味がする" (yellow font): Golden-yellow body, scooping a bite of a golden pudding with a spoon, looking towards the sky in pure bliss.
- "コラボカフェ行こ" (pink font): Vivid pink body, wearing a cute character cafe hat, holding a decorative entrance ticket.
- "おやつタイム" (green font): Mint green body, sitting at a table with cookies in front of a clock showing exactly 15:00.
- "ドリンクどうぞ" (orange font): Orange body, offering a giant cup of bubble milk tea (or fruit juice) with a straw in it.

**Row 5 (Stickers 17 to 20):**
- "偏食してます" (grey font): Grey body, pushing away a plate of green peppers and carrots with a grumpy, stubborn glare.
- "満腹で眠い…" (blue font): Blue-grey body, stuffed round and full, dozing off with heavy eyelids closing.
- "ごはんですよ！" (yellow font): Yellow body, banging a frying pan with a spatula to call everyone for dinner with a lively face.
- "食が細い日…" (grey font): Grey body, sitting shrunken and tiny like a small bun, staring at a small bowl of rice porridge.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
