# エモ・クラゲ LINEスタンプ（お仕事・お勉強・作業中応援編）プロンプト

## 重要：画像生成時の成功条件メモ (Image Generation Guidelines)
今後、別のテーマや新規スタンプを画像生成AIで作成する際は、以下の条件記述をプロンプトに必ず含めてください。これらを怠ると、グリッドの崩れやデザイン逸脱が発生します。

1. **足（触手）の極短指定 (Tentacle Ratio)**:
   - 足は「体高の10%未満の極小半円ドット（またはビーズ状の突起）」と指定する。
   - `The tentacles are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is less than 10% of the body height. Absolutely no long, wavy, or dangling legs.` のような記述をプロンプトの最初とキャラクター定義で徹底する。
2. **グリッド崩れ防止 (Grid Integrity - 4x5)**:
   - 単に `4x5 grid` と書くだけではAIが誤って `5x5` 等で出力することが多いため、**行ごと（Row 1〜Row 5）にそれぞれ正確に4枚のスタンプを割り当てる構造**でプロンプトを記述する。
   - 例: `The grid layout consists of 5 rows, with exactly 4 stickers in each row: Row 1 (Stickers 1 to 4): ...`
3. **セリフガチャの防止 (Dialogue Integrity)**:
   - 各イラストのポーズとセリフテキストがランダムに混ざるのを防ぐため、各番号の要素で「セリフ」「ポーズ」「色」を1行で完全にマッピング形式（例: `1. "作業に集中します" (green font): Mint green body, wearing headphones...`）で定義する。
   - セリフは黒一色ではなく「感情に合わせたカラフルなフォントカラーで、太い白フチ付き」であることを明記する。
4. **スライス用の余白確保 (Sticker Spacing)**:
   - `Sticker spacing: Each sticker is completely isolated and has its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が結合するのを防ぐ。

---

## デザイン仕様 (Design Specifications)
- **Style**: Vibrant, high-quality glossy sticker style. Vector-like clean drawing.
- **Shape**: Perfectly round dome-shaped body. **Tentacles are EXTREMELY SHORT, tiny, round, and stubby, looking like minimal dots or small beads attached directly under the body. No long tentacles at all.**
- **Face & Expression**:
  - Concentrating/Studying (集中/勉強): Closed eyes or serious dot eyes, wearing glasses or a headband (hachimaki).
  - Happy/Triumphant (うれしい/ドヤ顔): Smug grin or broad cute smile, pink cheeks.
  - Panicked/Angry (あせる/怒る): Spinning eyes or wide shocked eyes, red cheek marks.
  - Tired (つかれた): Drooping eyes, slumped body.
- **Colors (Color by Theme)**:
  - Mint Green: Deep concentration, careful checking, gratitude ("作業に集中します", "チェックします！", "Web会議中", "学びが深い", "拝受しました")
  - Lemon Yellow: Hard study, active thinking, feedback waiting ("ただいま勉強中", "脳内会議中", "アイデア降臨", "フィードバック求む")
  - Pastel Blue: Daily task flow, return, screen share ("絶賛作業中", "戻りました！", "画面共有します", "定時退社します", "スケジュール調整中", "テスト稼働中")
  - Pink/Cherry Pink: Sparking energy, absolute support, warm welcome ("やる気スイッチON", "全力で応援！", "大歓迎です", "ちょっと休憩します")
  - Gold: Big progress, excellence, triumph ("進捗あります！", "よくできました", "天才かもしれない")
  - Red: Danger, emergency, battle ("締め切りが命", "バグと戦ってます")
  - Orange: Change, rush, transit ("仕様変更？", "大至急対応します", "直帰します！", "お先にどうぞ")
  - Purple/Lavender/Dark Purple: Late work, exhaustion, postpone ("煮詰まり中", "明日やります…", "残業中…")
  - Grey/White: Out of energy, absent, excuse ("進捗ダメです…", "ただいま離席中", "マイクミュート中", "仕様です")
- **Text Styling**:
  - The Japanese text below each jellyfish is NOT black. It must be written in **various bright, colorful fonts** matching the theme (Pink, Ocean Blue, Lime Green, Vivid Orange, Purple, Red), all surrounded by a **thick white border outline**.
- **Layout**:
  - STRICT 4 columns and 5 rows (Total 20 stamps). No missing rows. No numbers or technology labels in the image. Solid bright light green background (#8BC34A).

---

## Grid 1: No. 1 〜 20 (お仕事編 前半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "作業に集中します" (green font): Mint green body, eyes closed, wearing large headphones on its head, concentrating deeply.
2. "ただいま勉強中" (yellow font): Lemon yellow body, wearing a white headband (hachimaki), holding a pencil and writing actively in an open book.
3. "絶賛作業中" (blue font): Pastel blue body, sitting in front of a laptop computer, typing hard on the keyboard with serious focus.
4. "やる気スイッチON" (pink font): Vibrant cherry pink body, clicking a large red push-button switch on top of its head, body glowing brightly.

**Row 2 (Stickers 5 to 8):**
5. "進捗あります！" (gold font): Gold body, wearing a smug proud grin, pointing a short arm at a bright green rising line chart.
6. "進捗ダメです…" (grey font): Grey body, crying face, slumping flat on the floor in front of a falling red line chart.
7. "締め切りが命" (red font): Bright red body, eyes wide with panic, staring desperately at a calendar sheet with a red circle mark.
8. "煮詰まり中" (purple font): Purple body, arms crossed, steam coming out from its head, looking frustrated and stuck.

**Row 3 (Stickers 9 to 12):**
9. "脳内会議中" (yellow font): Pastel yellow body, thinking deeply, with multiple tiny clone jellyfish floating around its head in speech bubbles.
10. "仕様変更？" (orange font): Vivid orange body, eyes wide in surprise, holding a tech manual book and showing a large question mark.
11. "バグと戦ってます" (red font): Red body, holding a small pencil sword, charging bravely at a tiny cartoon insect monster (bug).
12. "チェックします！" (green font): Mint green body, wearing a detective hat, looking through a giant magnifying glass to inspect documents.

**Row 4 (Stickers 13 to 16):**
13. "ただいま離席中" (blue font): Faint transparent light blue body (semi-transparent), sitting in an office chair that has a "Step Out" paper note stuck on it.
14. "戻りました！" (blue font): Sky blue body, opening an office door and waving a short hand cheerfully to say "I'm back!".
15. "大至急対応します" (orange font): Vivid orange body, running extremely fast with cartoon wheel motion lines, carrying paper files.
16. "明日やります…" (purple font): Lavender purple body, half-tucked under a cozy blanket, sleepily showing a thumbs-up.

**Row 5 (Stickers 17 to 20):**
17. "有給休暇です" (pink font): Pastel pink body, wearing a tropical floral aloha shirt and sunglasses, relaxing on a hammock with a coconut drink.
18. "定時退社します" (blue font): Light blue body, carrying a small bag, running away happily while pointing at a wall clock showing exactly "18:00".
19. "残業中…" (purple font): Dark purple body, face glowing in the dark blue light of a laptop screen in a dark room, looking exhausted.
20. "直帰します！" (orange font): Pastel orange body, sitting inside a train, looking peacefully out of the window as scenery moves by.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.

---

## Grid 2: No. 21 〜 40 (お仕事編 後半)

### Prompt
A strict grid layout of **exactly 4 columns and 5 rows** (totaling exactly 20 distinct, vibrant jellyfish stickers) on a solid bright light green (#8BC34A) background. **Do NOT make it 5 columns. Do NOT make it a 5x5 grid.** It must be exactly 4 columns horizontally and 5 rows vertically.
Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are wide, spacious green gutters and clear margins between every sticker, ensuring they are widely separated and easy to slice.
Character design: The jellyfish have round dome-shaped bodies. **The tentacles (legs) are extremely short, stubby, and rounded, like small semi-circular bumps or tiny beads attached directly under the body. The length of each tentacle is very tiny, less than 10% of the body height. Absolutely no long, wavy, or dangling legs.**

The grid layout consists of 5 rows, with exactly 4 stickers in each row:

**Row 1 (Stickers 1 to 4):**
1. "画面共有します" (blue font): Pastel blue body, projecting a green bar chart onto a floating projector screen next to it.
2. "マイクミュート中" (grey font): Grey body, wearing a white face mask with a red "X" mark, showing a microphone symbol with a diagonal cancel line.
3. "Web会議中" (green font): Mint green body, wearing a tiny cute suit collar, sitting politely and smiling at a webcam on top of a screen.
4. "テキストでOKです" (yellow font): Lemon yellow body, holding up a smartphone showing a text bubble with "TEXT" written inside.

**Row 2 (Stickers 5 to 8):**
5. "全力で応援！" (pink font): Cherry pink body, jumping high, waving large pink cheer pom-poms in both arms.
6. "よくできました" (gold font): Gold body, smiling proudly, holding a large red hand-drawn flower shape (hanamaru stamp mark).
7. "学びが深い" (green font): Mint green body, wearing smart round glasses, holding a thick dictionary and nodding wisely.
8. "アイデア降臨" (yellow font): Pastel yellow body, eyes sparkling, with a yellow lightbulb icon glowing brightly above its head.

**Row 3 (Stickers 9 to 12):**
9. "天才かもしれない" (gold font): Gold body, wearing a green laurel wreath on its head, smiling happily under a bright yellow spotlight.
10. "ちょっと休憩します" (pink font): Pastel pink body, holding a hot coffee mug, eating a glazed pink doughnut with a bliss face.
11. "タスク完了！" (green font): Emerald green body, drawing a large red checkmark (✓) on a task list board.
12. "スケジュール調整中" (blue font): Sky blue body, holding a calendar notebook, putting a jigsaw puzzle piece together with a thinking face.

**Row 4 (Stickers 13 to 16):**
13. "大歓迎です" (pink font): Pastel pink body, spreading arms wide with a big cute happy smile, welcoming.
14. "フィードバック求む" (yellow font): Lemon yellow body, holding out a blank notepad eagerly with shining hopeful eyes.
15. "計画通り…" (purple font): Dark purple body, evil smug face, grinning in the shadows with short arms held together.
16. "仕様です" (grey font): Grey body, shrugging its short arms with a flat, calm expression.

**Row 5 (Stickers 17 to 20):**
17. "要件定義中" (navy font): Deep blue body, standing in front of a white whiteboard, writing flowchart shapes with a marker.
18. "テスト稼働中" (blue font): Sky blue body, running smoothly at a steady pace on a gray treadmill machine.
19. "拝受しました" (green font): Mint green body, bowing politely while hugging a sealed white envelope letter with both arms.
20. "お先にどうぞ" (orange font): Pastel orange body, holding open a brown door, gesturing kindly with a hand to let someone pass.

Strictly 4 columns and 5 rows. No numbers or technology labels. STRICTLY NO NUMBERS.
