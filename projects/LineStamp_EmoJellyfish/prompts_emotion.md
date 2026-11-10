# エモ・クラゲ LINEスタンプ（推し活・オタ活・感情大爆発編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各番号の要素で「セリフ」「ポーズ」「色」を1行で完全にマッピング形式（例: `1. "推しが尊い" (pink font): Rainbow/Pink body, holding pink glowsticks...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Perfectly round dome-shaped body. **Tentacles are EXTREMELY SHORT, tiny, round, and stubby, looking like minimal dots or small beads attached directly under the body. No long tentacles at all.**
- **Face & Expression**:
  - Happy/Loving (うれしい/あいしてる): Big cute smile, pink circular blushes.
  - Sad/Lonely (かなしい/さびしい): Large crying eyes with dripping blue tears.
  - Angry (おこる): Angry brow with red anger mark icon (💢) near the head.
  - Anxious/Tired (しんぱい/つかれた): Dazed or trembling look, grey or dark grey color.
  - Surprised (びっくり): Round wide-open eyes, sweat drops.
  - Sleepy (ねむい): Closed eyes with small "zzz" icons.
- **Colors (Color by Emotion)**:
  - Pink/Cherry Pink: Joy, love, admiration ("推しが尊い", "生きててよかった", "あいしてる")
  - Red: Extreme excitement, panic ("心臓が持たない", "語らせて")
  - Gold/Yellow/Orange: Bright energy, triumph, calendar mark ("天才か？", "優勝", "予定空けました", "それな！")
  - Lime Green/Emerald: Calm, gratitude, approval ("公式ありがとう", "解釈一致", "布教します")
  - Light Blue/Deep Blue: Sadness, sinking ("全米が泣いた", "沼が深い", "待機")
  - Purple/Dark Purple: Anger, exhaustion, collapse ("無理しんどい", "むり", "情報過多で混乱")
  - White: Faded state, ascension, death ("息してない", "昇天", "尊死")
  - Grey/Dark Grey: Shock, speechless ("語彙力失った", "語彙力消滅")
- **Text Styling**:
  - The Japanese text below each jellyfish is NOT black. It must be written in **various bright, colorful fonts** (such as Cherry Pink, Ocean Blue, Lime Green, Vivid Orange, Purple, Red) matching the emotion, all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (尊い！感情大爆発編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "推しが尊い" (pink font): Rainbow/Pink body, holding pink glowsticks in short hands, crying tears of joy.
2. "供給過多" (red font): Cherry pink body, face-planted backwards and lying flat with blushing.
3. "天才か？" (orange font): Gold body, doing a standing ovation and clapping hands actively.
4. "息してない" (grey font): White body, completely faded into white ash under a bright spotlight.

**Row 2 (Stickers 5 to 8):**
5. "それな！" (orange font): Vivid orange body, vibrating and shaking vertically with motion lines.
6. "神頼み" (yellow font): Pastel yellow body, joining short hands together praying desperately.
7. "語彙力失った" (grey font): Grey body, staring blankly with wide open mouth in absolute shock.
8. "生きててよかった" (pink font): Pastel pink body, smiling warmly while shedding streams of happy tears.

**Row 3 (Stickers 9 to 12):**
9. "拝む" (orange font): Gold body, halo glowing behind, hands clasped together in divine prayer.
10. "公式ありがとう" (green font): Emerald green body, holding a banner of gratitude high above.
11. "期待しかない" (yellow-green font): Lemon yellow body, eyes sparkling with excitement and hope.
12. "優勝" (red font): Pastel pink body, proudly raising a gold trophy with a smug, proud face.

**Row 4 (Stickers 13 to 16):**
13. "全米が泣いた" (blue font): Light blue body, crying heavily with tears filling up a bucket placed underneath.
14. "無理しんどい" (purple font): Dark purple body, crouching down and holding its head in distress.
15. "昇天" (light blue font): White body, floating upwards with an angel halo and tiny wings.
16. "感情の起伏" (red font): Rainbow body, screaming in fear on a roller coaster cart.

**Row 5 (Stickers 17 to 20):**
17. "概念が尊い" (purple font): Lavender body, staring wistfully up at a starry night sky.
18. "狂喜乱舞" (orange font): Neon orange body, wearing samba feathers and dancing dynamically.
19. "実質無料" (yellow font): Gold body, smiling while holding an upside down empty wallet with zero coins.
20. "予定空けました" (blue font): Sky blue body, drawing a red circle on a wall calendar.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.

---

## Grid 2: No. 21 〜 40 (尊い！感情大爆発編 後半)

### Prompt
A strict, perfectly aligned 4x5 grid layout (exactly 4 columns and 5 rows) containing exactly 20 distinct, vibrant jellyfish stickers on a solid bright light green (#8BC34A) background.
Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, making them very easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 15% of the body height. Absolutely no long, wavy, or dangling legs.**

Dialogues, colors, and active poses for each of the 20 stickers in the grid are:
1. "待機" (written in blue font): Sky blue body, sitting straight on the floor waiting patiently.
2. "震えが止まらん" (written in purple font): Purple-blue body, shaking and vibrating violently with wavy motion lines.
3. "沼が深い" (written in dark blue font): Deep blue body, sinking deep into a dark swamp.
4. "心臓が持たない" (written in red font): Bright red body, holding chest in panic with a fast racing heart symbol.
5. "圧倒的ビジュアル" (written in pink font): Vivid pink body, posing dramatically with a background of blooming red roses.
6. "語彙力消滅" (written in grey font): Grey body, dazed and saying "Ah..." with a blank look.
7. "解釈一致" (written in green font): Mint green body, giving a big thumbs up with a short arm and nodding.
8. "墓を建てて" (written in dark blue font): Navy body, collapsed flat beside a gravestone in exhaustion.
9. "私が育てた" (written in orange font): Orange body, crossing short arms with a warm, proud look.
10. "推し事中" (written in yellow font): Yellow body, wearing a headband and sorting fan badges and goods.
11. "現実逃避" (written in light blue font): Transparent light blue body, hiding completely under a cozy blanket.
12. "感謝永遠に" (written in pink font): Pastel pink body, bowing deeply under falling cherry blossoms.
13. "むり" (written in purple font): Dark purple body, completely melted into a flat puddle on the floor.
14. "後世に残したい" (written in orange font): Gold body, posing happily inside a golden picture frame.
15. "語らせて" (written in red font): Red body, holding and speaking passionately into a stand microphone.
16. "目が幸せ" (written in vivid pink font): Rainbow body, eyes glowing and popping out as pink hearts.
17. "一生推します" (written in blue font): Pastel blue body, saluting with loyalty like a soldier.
18. "情報過多で混乱" (written in purple font): Purple body, head spinning with smoke and stars.
19. "尊死" (written in red font): White body, lying flat on the floor with cross eyes (X X) like a ghost.
20. "布教します" (written in green font): Emerald green body, holding a megaphone and shouting.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.
