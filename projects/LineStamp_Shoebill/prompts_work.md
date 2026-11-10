# ハシビロコウ LINEスタンプ（お仕事・お勉強・作業中応援編）プロンプト

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
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "作業に集中します" (green font): Mint green body...`）で定義する。
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
  - Silent Focus (作業/勉強): Focused, determined, or sleepily exhausted while maintaining the signature round body shape.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("絶賛作業中", "戻りました！", "定時退社します", "画面共有します", "スケジュール調整中", "テスト稼働中")
  - Grey / Dark Grey / White: Defeated, cold, lazy ("進捗ダメです…", "ただいま離席中", "明日やります…", "残業中…", "マイクミュート中", "計画通り…", "仕様です", "要件定義中")
  - Light Grey / Pale Grey: Friendly, moving ("ただいま勉強中", "学びが深い", "お留守番します", "お先にどうぞ")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, energetic ("やる気スイッチON", "仕様変更？", "大至急対応します", "有給休暇です", "直帰します！", "全力で応援！", "ちょっと休憩します", "大歓迎です", "また来年！")
  - Red: Danger, focus ("締め切りが命", "バグと戦ってます")
  - Mint Green: Nature, healing ("作業に集中します", "チェックします！", "Web会議中", "学びが深い", "タスク完了！", "拝受しました")
  - Yellow / Golden: Bright sun, energy ("進捗あります！", "脳内会議中", "テキストでOKです", "よくできました", "アイデア降臨", "天才かもしれない", "フィードバック求む")
  - Purple: Confusion ("煮詰まり中")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (お仕事・お勉強・作業中応援編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "作業に集中します" (green font): Mint green body, wearing large headphones over its ears, eyes closed, sitting peacefully in deep concentration.
- "ただいま勉強中" (yellow font): Yellow body, wearing a red headband, staring intensely at a large open textbook on a desk.
- "絶賛作業中" (blue font): Blue-grey body, sitting in front of a computer, typing on a keyboard with a serious glare.
- "やる気出すぞ！" (pink font): Vivid pink body, looking determined and full of energy with a passionate glare, body glowing brightly.

**Row 2 (Stickers 5 to 8):**
- "進捗あります！" (yellow font): Golden-yellow body, looking proud and confident, pointing at a chart showing a rising red progress line.
- "進捗ダメです…" (grey font): Grey body, face pale in panic, looking depressed in front of a chart with a declining line.
- "締め切りが命" (red font): Red body, staring intensely with bloodshot eyes at a wall calendar with a giant red circle on a date.
- "煮詰まり中" (purple font): Purple body, crossing its wings, with grey steam and smoke clouds rising from its head.

**Row 3 (Stickers 9 to 12):**
- "脳内会議中" (yellow font): Yellow body, with multiple tiny chibified shoebill heads popping up above its head with chat bubbles.
- "仕様変更？" (orange font): Orange body, eyes wide open in shock, double-taking a document with a big question mark.
- "バグと戦ってます" (red font): Red body, holding a giant pen like a sword, charging toward a tiny silly green bug monster.
- "チェックします！" (green font): Mint green body, wearing a detective hat, looking closely at documents through a giant magnifying glass.

**Row 4 (Stickers 13 to 16):**
- "ただいま離席中" (grey font): Empty wooden desk with a small note saying "離席中", with the shoebill's body semi-transparent and fading away.
- "戻りました！" (blue font): Blue-grey body, opening a door, raising one wing cheerfully in a greeting.
- "大至急対応します" (orange font): Orange body, running at high speed carrying documents, with speed lines and wheel-like blurs on its feet.
- "明日やります…" (grey font): Grey body, snuggled halfway inside a futon bed, sleepily giving a thumbs-up with one wing.

**Row 5 (Stickers 17 to 20):**
- "有給休暇です" (pink font): Pinkish-grey body, wearing a colorful aloha shirt and sunglasses, relaxing on a hammock with a tropical drink.
- "定時退社します" (blue font): Blue-grey body, holding a briefcase, pointing at a clock showing 18:00, running away quickly.
- "残業中…" (purple font): Dark grey body, sitting in a dark room illuminated only by the blue light of a PC screen, looking pale.
- "直帰します！" (orange font): Orange body, sitting in a train seat, looking out the window with a relaxed, relieved expression.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (お仕事・お勉強・作業中応援編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "画面共有します" (blue font): Blue-grey body, projecting a digital slideshow presentation onto its own large round belly screen.
- "マイクミュート中" (grey font): Grey body, wearing a red "X" mask on its beak, with a grey microphone icon showing a diagonal red slash.
- "Web会議中" (green font): Mint green body, wearing a tiny suit tie, looking straight and smiling politely toward a computer webcam.
- "テキストでOKです" (yellow font): Yellow body, holding up a smartphone showing a text bubble with "TEXT" written inside.

**Row 2 (Stickers 5 to 8):**
- "全力で応援！" (pink font): Vivid pink body, holding two pink pom-poms, waving them energetically with a determined face.
- "よくできました" (yellow font): Golden-yellow body, standing proudly next to a large red hand-drawn flower-shaped "hanamaru" (excellent) mark.
- "学びが深い" (green font): Mint green body, wearing glasses, hugging a giant dictionary book and nodding thoughtfully.
- "アイデア降臨" (yellow font): Yellow body, with a bright yellow lightbulb icon lighting up above its head feathers, looking surprised.

**Row 3 (Stickers 9 to 12):**
- "天才かもしれない" (gold font): Golden-yellow body, wearing a laurel crown, standing proudly under a bright spotlight.
- "ちょっと休憩します" (pink font): Pinkish-grey body, sitting at a table with a coffee cup and taking a bite from a sweet donut.
- "タスク完了！" (green font): Mint green body, writing a giant red checkmark on a to-do list clipboard.
- "スケジュール調整中" (blue font): Blue-grey body, holding a schedule planner book, trying to fit a puzzle piece in with a worried look.

**Row 4 (Stickers 13 to 16):**
- "大歓迎です" (pink font): Pinkish-grey body, spreading its wings wide open with a warm, welcoming smile.
- "フィードバック求む" (yellow font): Yellow body, offering a notebook with both wings, looking with sparkling, eager eyes.
- "計画通り…" (grey font): Dark grey body, showing a sinister smirk on the corner of its beak in a dark, shaded background.
- "仕様です" (grey font): Grey body, shrugging its wings with a calm, indifferent "what can you do" expression.

**Row 5 (Stickers 17 to 20):**
- "要件定義中" (purple font): Dark grey body, standing in front of a whiteboard filled with flowcharts and arrows, drawing on it.
- "テスト稼働中" (blue font): Blue-grey body, running at a steady pace on a grey treadmill machine.
- "拝受しました" (green font): Mint green body, holding a paper document envelope carefully with both wings, bowing politely.
- "お先にどうぞ" (orange font): Orange body, holding a door open, gesturing politely with one wing to invite someone in.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
