# ハシビロコウ LINEスタンプ（推し活・オタク・感情大爆発編）プロンプト

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
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各要素で「セリフ」「ポーズ」「色」を同じ行で完全にマッピング形式（例: `- "尊い…" (pink font): Vivid pink body...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
5. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。
6. **数字 of 徹底的な排除 (STRICTLY NO NUMBERS)**:
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
  - Blushing/Overwhelmed (赤面/限界): Blushing cheeks, emotional tears, closed eyes, or dramatic blank white eyes.
  - Determined/Glares (真剣/ジト目): Signature grumpy look mixed with excitement (e.g. thumbs up, holding megaphones, shaking penlights).
- **Colors (Color by Theme)**:
  - Blue-grey / Light Blue-grey: Signature colors ("推せる…", "感謝しかない", "天才か？", "現場からは以上です", "一生ついていく", "供給過多")
  - Grey / Dark Grey / White: Burned out, shocked, or emotional ("語彙力の喪失", "墓を建てます", "進捗どうですか", "限界オタク", "お疲れ様でした", "涙腺崩壊", "後生だから…", "感情が迷子", "天に召されました")
  - Mint Green: Nature, healing ("わかりみが深い", "拝む", "お疲れ様でした", "解釈一致")
  - Yellow / Golden: Bright sun, energy ("それな！", "神すぎる", "生きててよかった", "お金を払わせて", "実質無料", "ビジュアルが強い", "全人類見て", "優勝しました")
  - Pinkish-grey / Peach grey / Orange / Pink: Happy, warm, energetic ("尊い…", "現場へ急行中", "爆買いしました", "推しが尊い", "生きがい", "コラボカフェ行こ", "サンキュー！", "沼が深い", "目が足りない")
  - Purple / Red: Intense passion or crisis ("息ができない", "心臓に悪い", "興奮が収まらん", "推しは正義", "沼が深い", "無理しんどい")
- **Text Styling**:
  - The Japanese text below each bird is NOT black. Must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (推し活・オタク・感情大爆発編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "尊い…" (pink font): Vivid pink body, hugging a large red heart balloon with both wings, blushing cheeks, eyes closed in happiness.
- "それな！" (yellow font): Yellow body, nodding its head up and down energetically, smiling in strong agreement.
- "神すぎる" (yellow font): Golden-yellow body, standing proudly with a bright divine halo and light rays shining behind its head.
- "語彙力の喪失" (grey font): Grey body, eyes rolled back in shock (white eyes), with a bubble popping from its beak saying "あ…あ…".

**Row 2 (Stickers 5 to 8):**
- "推せる…" (blue font): Blue-grey body, keeping a grumpy glare but giving a confident thumbs-up with one wing.
- "わかりみが深い" (green font): Mint green body, nodding deeply with a satisfied smile, holding one wing to its chest and bowing slightly.
- "息ができない" (red font): Red body, clutching its chest with both wings, staggering back in pure overwhelming joy.
- "心臓に悪い" (purple font): Purple body, looking pale and shocked, with a large cartoon heart beating rapidly "thump-thump" in front of it.

**Row 3 (Stickers 9 to 12):**
- "墓を建てます" (grey font): Grey body, sitting flat and burnt out next to a small grey tombstone that says "墓", looking deceased but peaceful.
- "生きててよかった" (yellow font): Golden-yellow body, looking up at the sky with large emotional eyes shedding giant streams of happy tears.
- "拝む" (green font): Mint green body, holding its wings together in prayer like a Buddha, eyes closed in deep respect.
- "感謝しかない" (blue font): Blue-grey body, completely flattened like an o-manju bun on the floor, prostrating in deep gratitude (dogeza).

**Row 4 (Stickers 13 to 16):**
- "全力待機" (orange font): Orange body, sitting in formal seiza posture on a small cushion, eyes wide and sparkling in anticipation.
- "進捗どうですか" (grey font): Grey body, emerging from the dark with a grumpy glare, pointing a wing to a planner book.
- "現場へ急行中" (orange font): Orange body, running at high speed carrying two glowing colorful lightsticks (penlights) in its wings, speed lines.
- "お金を払わせて" (yellow font): Yellow body, crying emotionally while holding out flat paper bills from a small open wallet.

**Row 5 (Stickers 17 to 20):**
- "爆買いしました" (pink font): Peach-grey body, looking extremely proud (doya-gao) while hugging a mountain of character goods, bags, and plushies.
- "実質無料" (yellow font): Golden-yellow body, staring at a shopping receipt with a peaceful, enlightened smile, ignoring the cost.
- "興興奮が収まらん" (red font): Red body, steam blowing out of its nose, wearing a boiling tea kettle on top of its head.
- "天才か？" (blue font): Blue-grey body, clapping its wings together with a respectful, impressed glare.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.

---

## Grid 2: No. 21 〜 40 (推し活・オタク・感情大爆発編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant shoebill stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: **The shoebill has a STRICTLY perfectly sphere-like, chubby, and round body, with absolutely no slim neck, no long body, and no tall shape. The body is extremely round and fat like a plush balloon bird ball.** The legs are extremely short, thin, and tiny, looking like minimal sticks under the body, less than 10% of the body height. Absolutely no long legs. It has a very large, flat light yellow beak, and two small feathers sticking up on top of its head.

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
- "天に召されました" (grey font): Pale grey body, wearing a tiny angel halo, with small white angel wings on its back, floating up into the sky.
- "限界オタク" (grey font): Grey body, covering its face completely with both wings, crying hysterically in emotional overload.
- "推しが尊い" (pink font): Vivid pink body, hugging a giant circular fan (uchiwa) that has the word "推し" written on it.
- "お疲れ様でした" (green font): Mint green body, turned completely white (burnt out), sitting lifelessly on a chair still holding a dead lightstick.

**Row 2 (Stickers 5 to 8):**
- "現場からは以上です" (blue font): Blue-grey body, holding a tiny reporter microphone to its beak, reporting seriously with one wing raised.
- "沼が深い" (purple font): Purple body, half-submerged in a deep mud puddle (swamp), looking happy and content despite sinking.
- "解釈一致" (green font): Mint green body, nodding vigorously, pointing at a whiteboard with a big red checkmark.
- "涙腺崩壊" (grey font): Grey body, crying a waterfall of tears that floods the floor around its round feet.

**Row 3 (Stickers 9 to 12):**
- "推しは正義" (red font): Red body, proudly holding up a protest sign placard that says "推しは正義" in bold letters.
- "目が足りない" (orange font): Orange body, with its eyes darting in multiple directions, showing multi-eye motion blur to look at everything.
- "生きがい" (pink font): Peach-grey body, cuddling and nuzzling a large soft pink heart cushion with a blissful face.
- "ビジュアルが強い" (yellow font): Golden-yellow body, wearing cool sunglasses, looking stunned and blinded by a bright shining light in front of it.

**Row 4 (Stickers 13 to 16):**
- "無理しんどい" (purple font): Purple body, collapsing onto the floor with its wings over its chest, overwhelmed by happiness.
- "後生だから…" (grey font): Grey body, bowing deeply with its head touching the ground, begging politely.
- "サンキュー！" (orange font): Orange body, winking one eye, giving a cool thumbs-up wing sign with a friendly grin.
- "一生ついていく" (blue font): Blue-grey body, walking slowly and closely behind a larger shadow, following it everywhere.

**Row 5 (Stickers 17 to 20):**
- "全人類見て" (yellow font): Yellow body, shouting loudly into a giant red megaphone (megaphone held in wing) to get attention.
- "感情が迷子" (grey font): Grey body, crying tears of joy (smiling mouth with crying eyes), looking emotionally confused.
- "供給過多" (blue font): Blue-grey body, drowning in a flood of falling merchandise, CDs, and print materials, waving its wings for help.
- "優勝しました" (yellow font): Golden-yellow body, holding a giant golden trophy cup high, standing proudly with a triumphant chest.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS OR LABELS IN THE IMAGE.
