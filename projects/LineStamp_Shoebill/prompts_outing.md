# ハシビロコウ LINEスタンプ（ゆるっとお出かけ・旅行・アクティブ編）プロンプト

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
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "いま向かってます" (orange font): Light grey body...`）で定義する。
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
  - Grumpy/Glare (ジト目/半目): Sharp, glaring, slightly grumpy half-closed eyes. Sharp三白眼 look.
  - Active/Traveling (お出かけ): Enjoying the trip, but keeping the signature grumpy face and round body shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("どこいく？", "現地にいます", "おでかけ準備中", "寄り道中", "雨男です", "写真送ります")
  - Grey / Dark Grey / White: Defeated, cold, lazy ("渋滞中…", "飛行機なう", "道に迷った…", "お留守番します", "乗り換え中", "お財布忘れた", "お土産よろしく", "満員電車…", "旅のしおり")
  - Light Grey / Pale Grey: Friendly, moving ("いま向かってます", "切符買った？", "ちょっと散歩", "おつかれー", "新幹線なう", "チャリで来た")
  - Pinkish-grey / Peach grey / Orange: Sly, sarcastic joy ("到着しました！", "お土産あるよ", "パスポートヨシ！", "ただいま！", "お見送りします", "食べ歩き最高", "ホテル快適", "記念スタンプ", "温泉最高…", "また旅に出ます", "記念撮影")
  - Red: Danger, warning ("熱中症に注意", "アツすぎる")
  - Sky Blue: Water, train, plane ("旅に出てます", "電車乗ったよ", "新幹線なう")
  - Yellow / Golden: Bright sun, energy ("ドライブしよ", "遠足の前日", "晴れ男です", "チケットヨシ！")
  - Green: Nature, frog ("無事カエル", "美味しい空気")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (お出かけ・旅行・アクティブ編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "いま向かってます" (orange font): Light grey body, sitting on the back of a cute green turtle, moving at a very slow pace.
- "到着しました！" (pink font): Pinkish-grey body, standing politely next to a train station sign saying "到着", bowing deeply.
- "どこいく？" (blue font): Blue-grey body, tilting its head slightly, reading a travel guidebook.
- "渋滞中…" (grey font): Grey body, stuck tightly in a tiny toy red convertible car because its body is too round and fat, looking grumpy.

**Row 2 (Stickers 5 to 8):**
- "お土産あるよ" (pink font): Pinkish-grey body, holding a small souvenir gift box (with dried fish) happily with both wings.
- "旅に出てます" (blue font): Sky blue body, carrying a tiny backpack on its fat round back, wearing black sunglasses and standing still.
- "現地にいます" (blue font): Blue-grey body, standing directly under a large red map pin icon with a flat, blank expression.
- "切符買った？" (grey font): Light grey body, holding a large train ticket in its yellow beak, looking forward.

**Row 3 (Stickers 9 to 12):**
- "電車乗ったよ" (blue font): Sky blue body, pressing its fat round face flat against a train window to look outside.
- "飛行機なう" (purple font): Dark grey body, sitting in an airplane seat, seatbelt tightly squeezing its round belly.
- "おでかけ準備中" (blue font): Light blue-grey body, packing itself completely inside a large open brown travel suitcase.
- "パスポートヨシ！" (pink font): Pinkish-grey body, holding up a small passport with one wing, looking proud.

**Row 4 (Stickers 13 to 16):**
- "ちょっと散歩" (green font): Light grey body, wearing a straw hat, walking slowly with small steps.
- "道に迷った…" (grey font): Grey body, holding a map upside down, looking confused with a spiral thought icon.
- "記念撮影" (orange font): Orange body, sticking its round face through a tourist face cutout board shaped like a fish, staring blankly.
- "ただいま！" (pink font): Pinkish-grey body, opening a front door, dropping its backpack, looking relieved.

**Row 5 (Stickers 17 to 20):**
- "お見送りします" (pink font): Pinkish-grey body, standing on a train platform waving its wing continuously as a train departs.
- "ドライブしよ" (yellow font): Yellow body, holding a toy steering wheel with both wings, pretending to drive.
- "食べ歩き最高" (pink font): Pinkish-grey body, holding a skewer of grilled fish and takoyaki balls, staring at them hungrily.
- "ホテル快適" (pink font): Pinkish-grey body, lying flat on its back (round belly up) on a huge fluffy white hotel bed.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (お出かけ・旅行・アクティブ編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "無事カエル" (green font): Green body, wearing a cute green frog hat, standing still with a blank expression.
- "寄り道中" (blue font): Blue-grey body, sitting outside a cafe, drinking a bubble milk tea through a straw.
- "集合場所は？" (grey font): Grey body, standing next to a giant question mark sign, looking around curiously.
- "遠足の前日" (yellow font): Yellow body, lying in a futon bed with its eyes sparkling bright, unable to sleep.

**Row 2 (Stickers 5 to 8):**
- "お留守番します" (purple font): Dark grey body, sitting quietly holding a key, looking slightly lonely with a soft glare.
- "美味しい空気" (green font): Green body, standing on top of a green mountain peak, eyes closed taking a deep breath.
- "新幹線なう" (blue font): Sky blue body, sitting in a bullet train seat, staring at a bento box on the tray table.
- "乗り換え中" (grey font): Light grey body, staring blankly at a very complex train transit route map.

**Row 3 (Stickers 9 to 12):**
- "お財布忘れた" (grey font): Grey body, holding an empty wallet upside down, face turning blue in panic.
- "雨男です" (blue font): Blue-grey body, standing under a tiny dark raincloud that is pouring heavy rain only on him.
- "晴れ男です" (yellow font): Yellow body, standing under a bright shining sun, looking very pleased and dry.
- "記念スタンプ" (pink font): Pinkish-grey body, proudly showing a stamp book with its own footprint stamped on it.

**Row 4 (Stickers 13 to 16):**
- "お土産よろしく" (grey font): Grey body, looking up with watery eyes, holding a notepad showing "おみやげ (特に魚)".
- "写真送ります" (blue font): Light blue-grey body, holding a smartphone, capturing a photo with a bright camera flash.
- "温泉最高…" (pink font): Pinkish-grey body, soaking in a hot spring wooden tub with a towel on its head, looking melted.
- "チャリで来た" (grey font): Light grey body, riding a tiny tricycle that looks like it will break, striking a smug pose.

**Row 5 (Stickers 17 to 20):**
- "チケットヨシ！" (yellow font): Yellow body, holding concert tickets carefully with both wings, looking excited.
- "満員電車…" (grey font): Grey body, squished tightly between other round birds inside a crowded train.
- "旅のしおり" (grey font): Light grey body, holding a handmade guide notebook titled "たびのしおり" in its beak.
- "また旅に出ます" (pink font): Pinkish-grey body, waving goodbye slowly as it walks toward a beautiful sunset background.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
