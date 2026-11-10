# エモ・クラゲ LINEスタンプ（まったり、ご自愛、省エネ編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各番号の要素で「セリフ」「ポーズ」「色」を1行で完全にマッピング形式（例: `1. "まったり" (blue font): Sky blue body, drinking cocoa on a cloud...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Perfectly round dome-shaped body. **Tentacles are EXTREMELY SHORT, tiny, round, and stubby, looking like minimal dots or small beads attached directly under the body. No long tentacles at all.**
- **Face & Expression**:
  - Happy/Loving (うれしい/あいしてる): Big cute smile, pink circular blushes.
  - Relaxed/Sleepy (まったり/ねむい): Sleepy curved eyes, calm gentle smile, pink cheeks.
  - Dazed/Exhausted (つかれた/虚無): Staring blankly, small dot eyes, sometimes drooling or slumped body.
- **Colors (Color by Theme)**:
  - Pastel Blue: Cozy slowness, quietness ("まったり", "省エネモード", "また明日", "充電中")
  - Mint Green: Natural healing, deep breathing ("ご自愛ください", "のんびり", "ティータイム", "おちつくー", "すーはー", "のほほん", "息抜きしよ")
  - Pastel Pink: Kind care, soft warmth ("無理しないで", "むりゃ…", "おふとん最高", "マイペース", "お疲れ様", "じわじわ", "よき")
  - Pastel Orange / Yellow / Gold: Warm comfort, light hearts ("ゴロゴロ", "温泉気分", "ぬくぬく", "こたつむり", "ほっこり", "ぽかぽか", "ゆるっと", "はなまる", "なんとかなる")
  - Lavender Purple / Purple / Dark Purple: Deep rest, deep sleep, melting ("ゆっくり休んで", "おやすみ", "あくび", "溶けてる", "思考停止", "パタッ", "すやすや", "無理は禁物")
  - Grey / White: Zero battery, absolute blank ("ライフゼロ", "虚無…")
- **Text Styling**:
  - The Japanese text below each jellyfish is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (まったり編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "まったり" (blue font): Sky blue body, sitting comfortably on a soft white cloud, drinking hot cocoa from a mug.
2. "ご自愛ください" (green font): Mint green body, enveloped in a gentle mist of hot tea, waving its short arm kindly.
3. "無理しないで" (pink font): Pastel pink body, smiling warmly, holding and offering a soft pastel blanket.
4. "ぼー…" (yellow font): Pastel yellow body, dot eyes looking dazed, with a tiny green sprout growing on top of its head.

**Row 2 (Stickers 5 to 8):**
5. "ゴロゴロ" (orange font): Pastel orange body, lying sideways on the floor, rolling left and right with cute rolling motion lines.
6. "ゆっくり休んで" (purple font): Lavender purple body, hugging a big white pillow tightly, giving a gentle wink.
7. "ライフゼロ" (grey font): Faded white body, looking completely drained of energy, a tiny transparent jellyfish ghost escaping from its mouth.
8. "省エネモード" (blue font): Pastel blue body, glowing weakly, with a small digital battery icon showing 10% charge remaining.

**Row 3 (Stickers 9 to 12):**
9. "のんびり" (green font): Mint green body, wearing sunglasses, floating lazily on a yellow swim ring on water.
10. "おやすみ" (purple font): Dark purple body, wearing a starry nightcap, leaning against a crescent moon cushion.
11. "だらだら" (yellow font): Pastel yellow body, relaxed and slightly flattened like a puddle, melting onto the floor.
12. "むにゃ…" (pink font): Pastel pink body, eyes closed, rubbing its eye with a short arm, drooling a tiny bit.

**Row 4 (Stickers 13 to 16):**
13. "温泉気分" (orange font): Pastel orange body, soaking in a hot wooden bucket with a white folded towel on top of its head, feeling bliss.
14. "ぬくぬく" (yellow font): Lemon yellow body, wrapped warmly in a thick red knitted muffler and wool socks.
15. "充電中" (blue font): Pastel blue body, with a small power plug tail extending out, and a green charging progress bar near its head.
16. "ふわぁ（あくび）" (purple font): Lavender purple body, mouth wide open in a big yawn, with small tears in its eyes and a "zzz" icon.

**Row 5 (Stickers 17 to 20):**
17. "ティータイム" (green font): Mint green body, sitting inside a large porcelain teacup, sipping herbal tea happily.
18. "よき" (pink font): Pastel pink body, showing a warm smile and raising a short arm with a thumbs-up.
19. "虚無…" (grey font): Grey body, hollow blank eyes, with a small grey raincloud drizzling drops over its head.
20. "溶けてる" (purple font): Lavender purple body, melting downward like soft ice cream on a warm day.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.

---

## Grid 2: No. 21 〜 40 (まったり編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "思考停止" (purple font): Purple body, head spinning with a colorful loading wheel icon and smoke lines above.
2. "また明日" (blue font): Sky blue body, walking away into a warm sunset backdrop, waving a casual goodbye.
3. "おふとん最高" (pink font): Pastel pink body, fully wrapped in a fluffy futon bed, smiling blissfully.
4. "こたつむり" (orange font): Pastel orange body, hiding inside a traditional Japanese kotatsu, with a small orange fruit on top of its head.

**Row 2 (Stickers 5 to 8):**
5. "ゆるして" (yellow font): Pastel yellow body, clasping short arms together, looking up with large teary pleading eyes.
6. "ほっこり" (orange font): Pastel orange body, holding a hot steamed sweet potato split in half, releasing warm steam.
7. "息抜きしよ" (green font): Mint green body, sitting at a small cafe table, holding a small coffee cup.
8. "マイペース" (pink font): Pastel pink body, carrying a cute spiral snail shell on its back, walking very slowly.

**Row 3 (Stickers 9 to 12):**
9. "おちつくー" (green font): Mint green body, sinking deeply into a huge beanbag chair, letting out a satisfied breath.
10. "パタッ" (purple font): Dark purple body, collapsed face-down flat on the floor in exhaustion.
11. "ゆるっと" (yellow font): Pastel yellow body, smiling gently while holding a pastel balloon, floating slightly.
12. "すやすや" (purple font): Lavender purple body, sleeping peacefully with a growing snot bubble (sleeping bubble) from its nose.

**Row 4 (Stickers 13 to 16):**
13. "のほほん" (green font): Mint green body, with a green four-leaf clover resting on its head, smiling peacefully.
14. "ぽかぽか" (orange font): Pastel orange body, sunbathing under a bright smiling sun, cheeks warm and pink.
15. "お疲れ様" (pink font): Pastel pink body, offering a hot canned coffee can with both short arms.
16. "なんとかなる" (yellow font): Pastel yellow body, shrugging with a relaxed smile, looking carefree.

**Row 5 (Stickers 17 to 20):**
17. "すーはー" (green font): Mint green body, eyes closed, taking a deep breath with blue/green fresh air swirl icons.
18. "無理は禁物" (purple font): Lavender purple body, holding a small red "STOP" sign board in a very relaxed way.
19. "じわじわ" (pink font): Pastel pink body, blushing deeply with happiness slowly filling its cheeks.
20. "はなまる" (yellow font): Lemon yellow body, proudly standing next to a large red hand-drawn flower-shaped "hanamaru" (excellent) mark.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.
