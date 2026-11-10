# ハシビロコウ LINEスタンプ（睡眠・おやすみ・だらだらライフ編）プロンプト

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
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "おやすみなさい" (green font): Mint green body...`）で定義する。
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
  - Sleepy/Dozing (眠そう/寝ぼけ): Sleepy half-closed eyes, closed eyes, or blank blank-out eyes while maintaining the signature round body shape.
  - Snoozing/Sleeping (爆睡/すやすや): Peaceful smiling expressions or sleeping face with tiny snot bubbles.
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("二度寝します！", "動きたくない", "ほぼ寝てます", "起きられません…", "ぐーすか…", "枕が友達")
  - Grey / Dark Grey / White: Faded, dark, lazy ("眠すぎる…", "布団から出られん", "魂抜けてます", "今日はもう無理", "オフモード中", "ログアウトします", "意識不明…", "HPがゼロです", "思考停止中", "虚無…", "目が閉じそう", "冬眠します")
  - Mint Green: Nature, healing ("おやすみなさい", "睡眠第一", "体力温存中", "すやすや…", "パジャマです")
  - Yellow / Golden: Bright sun, energy ("おはよう…", "起きたら本気だす", "良い夢を！", "だらけてます", "ヨダレたらーり")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, energetic ("だらだら最高", "充電中…", "ごろごろ…", "まだ起きてる？", "ぬくぬく…", "ベッドが呼んでる", "ハッ！夢か…")
  - Purple / Red: Panic, limit ("夢の中へ…", "静かに寝かせて", "睡魔と戦い中", "もう限界です")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. Must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (睡眠・おやすみ・だらだらライフ編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "おやすみなさい" (green font): Mint green body, wearing a cute water-drop patterned pajamas nightcap on its head, sleeping peacefully with its eyes closed, hugging a fluffy pillow.
- "おはよう…" (yellow font): Light yellow body, looking sleepy with messy, bedhead feathers sticking up, opening only one eye slightly.
- "眠すぎる…" (grey font): Grey body, sitting and dozing off, losing consciousness with white blank eyes, head nodding forward as if falling asleep.
- "二度寝します！" (blue font): Blue-grey body, completely hidden inside a fluffy futon blanket, with only its round, chubby tail and butt sticking out.

**Row 2 (Stickers 5 to 8):**
- "布団から出られん" (grey font): Grey body, tightly wrapped like a cocoon in a futon blanket, looking like a round plump caterpillar, staring with blank eyes.
- "だらだら最高" (pink font): Peach-grey body, lying flat on its back on a giant beanbag cushion, belly up, completely relaxed and melted.
- "オフモード中" (dark font): Dark navy body, sitting next to a wooden signpost that says "OFF", with its body color faded and darkened.
- "魂抜けてます" (grey font): Pale grey body, sitting with a blank, empty look, while a tiny semi-transparent ghost-like shoebill soul is floating out of its beak.

**Row 3 (Stickers 9 to 12):**
- "今日はもう無理" (grey font): Grey body, completely flattened and melted flat on the floor like a puddle of slime, looking exhausted.
- "動きたくない" (blue font): Blue-grey body, half-buried in a giant, comfortable soft cushion, looking cozy but lazy.
- "睡魔と戦い中" (red font): Red body, rubbing its eyes with its wings, trying hard to keep its heavy eyelids open, head tilting.
- "充電中…" (orange font): Orange body, sitting quietly with a power cord plugged into its butt, a small battery charging icon floating next to it.

**Row 4 (Stickers 13 to 16):**
- "ごろごろ…" (pink font): Peach-grey body, a perfect sphere rolling sideways on the floor with motion blur lines.
- "起きたら本気だす" (yellow font): Yellow body, eyes closed in sleep, lazily giving a thumbs-up with one wing.
- "夢の中へ…" (purple font): Purple body, wearing a fluffy sheep costume, floating peacefully in the sky on a soft white cloud bed.
- "ログアウトします" (dark font): Dark navy body, fading away and becoming semi-transparent, disappearing like a computer turning off.

**Row 5 (Stickers 17 to 20):**
- "意識不明…" (grey font): Grey body, sleeping deeply with its beak wide open, a floating bubble with "Zzz" letters rising from its head.
- "HPがゼロです" (grey font): Grey body, collapsed flat on the ground in front of an empty game-style HP bar showing 0%.
- "ほぼ寝てます" (blue font): Blue-grey body, half-closed grumpy glare eyes, head nodding and bowing deeply as if falling asleep.
- "静かに寝かせて" (purple font): Purple body, sleeping peacefully behind a small wooden sign that says "安眠妨害禁止".

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (睡眠・おやすみ・だらだらライフ編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "良い夢を！" (yellow font): Golden-yellow body, riding on a glowing shooting star in the night sky, wearing a cozy pajamas nightcap.
- "睡眠第一" (green font): Mint green body, hugging a giant soft sleeping pillow tightly with both wings with a happy face.
- "まだ起きてる？" (orange font): Orange body, staring with wide glaring eyes at its glowing smartphone screen in a dark room, face lit up by the phone screen.
- "夜更かし中" (dark font): Dark navy body, sitting on a couch with a bag of potato chips, staring at a TV screen with a grumpy glare.

**Row 2 (Stickers 5 to 8):**
- "ぬくぬく…" (pink font): Peach-grey body, completely wrapped in a thick, cozy warm blanket, with only its face and large beak peeking out.
- "思考停止中" (grey font): Grey body, sitting with a totally blank stare, with a loading spinner ring or a tiny hourglass floating above its head.
- "だらけてます" (yellow font): Yellow body, lying down in a lazy posture with its round belly sticking out prominently.
- "虚無…" (grey font): Pale grey body, sitting completely still with empty, hollow eyes lacking highlights, staring into space.

**Row 3 (Stickers 9 to 12):**
- "体力温存中" (green font): Mint green body, curled up tightly like a ball, with a green battery status icon showing 100% full above its head.
- "目が閉じそう" (grey font): Grey body, in three frame-by-frame steps showing its heavy eyelids closing down.
- "起きられません…" (blue font): Blue-grey body, covering its ears with both wings while a noisy, ringing alarm clock shakes next to it.
- "ベッドが呼んでる" (pink font): Peach-grey body, pointing towards a cozy bed, walking slowly like a zombie towards it.

**Row 4 (Stickers 13 to 16):**
- "もう限界です" (purple font): Purple body, pale face, staggering forward towards its futon bed, about to collapse from sleepiness.
- "すやすや…" (green font): Mint green body, curled up asleep with a content expression, a tiny snot bubble inflating and deflating on its beak.
- "ぐーすか…" (blue font): Blue-grey body, sleeping flat on its back with wings spread, a comic snoring bubble rising from its beak.
- "ハッ！夢か…" (orange font): Orange body, jumping up in bed in shock, sweating with wide open eyes, having just woken up from a dream.

**Row 5 (Stickers 17 to 20):**
- "ヨダレたらーり" (yellow font): Yellow body, sleeping deeply with a tiny drop of drool dripping from the corner of its beak.
- "パジャマです" (green font): Mint green body, wearing a slightly tight, cute blue polka-dot pajamas suit, looking slightly grumpy.
- "枕が友達" (blue font): Blue-grey body, sleeping on its side, wearing a pillow on its head, or sleeping in a pile of pillows.
- "冬眠します" (dark font): Dark navy body, curled up deep inside a dark, cave-like pile of heavy blankets, hiding completely.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
