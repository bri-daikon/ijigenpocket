# 新キャラクター「ゆめか（Yumeka）」デザインマニュアル

ゆめかわポニーのキャラクター「ゆめか（Yumeka）」のデザインが、スタンプ制作や画像生成の過程で崩れないようにするための厳密なデザイン仕様書です。

---

## 1. ビジュアルの約束事 (Design Specifications)

1. **基本デザイン (Base Model)**
   - ゆめかわポニー（子馬）の女の子。
   - **【最重要】足の数は必ず4本です。お辞儀をするポーズや足を動かすポーズであっても、余分な足（5本や6本など）は絶対に描きません (STRICTLY exactly 4 legs, absolutely no extra legs)。**
   - **【最重要】ゆめかは馬なので、ユニコーンのような角（つの）は絶対に生やしません (STRICTLY NO horn on her head, she is a normal horse, absolutely no unicorn horn, completely hornless)。** おでこは平らで、頭の上にあるのは2つの動物の耳とヘアアクセサリー、たてがみのみです。
   - 体型は、ぽってりとして丸みがあるフォルム（球体やおまんじゅう型にしすぎず、ポニーとしての可愛らしい馬の形を保つこと）。
   - 足は短く可愛らしいですが、ポニーの形を保った短い足です。短くしすぎて馬の輪郭が失われないようにしてください。
   - 前髪（たてがみ）の上部には、必ず黄色い星のヘアアクセサリー（おほしさまのヘアアクセサリー）がついている。
   - お尻には「白い雲と黄色い星」が組み合わさったカットマーク（ゆめのあかし）がついている。
2. **カラーリングと毛並み (Color & Texture)**
   - 体のメインカラーは **白** (Soft white base / light pastel pink-white)。
   - たてがみは**少し短めで、毛先が外ハネしているボブカット（short bob-cut with flipped-out ends）**です。内巻きではなく、元気に外側にハネているのが特徴です。たてがみとしっぽは、パステルカラーのグラデーション（パープル、ピンク、水色が混ざり合ったゆめかわな色彩）。
   - 足先（ひづめ）は淡い **パープル** (pastel purple hooves)。
3. **顔のディテール (Facial Details)**
   - 目は大きくてうるうるとした **紫色** (large watery purple eyes)。瞳の中にはきらきらとした光の反射（キャッチライト）が描かれる。
   - ほっぺは丸く、ふんわりとしたピンク色に染まっている。
   - 表情は「のほほん」「おっとり」とした、やさしい表情が基本。

---

## 2. AI画像生成用 共通プロンプトテンプレート (Prompt Template)

AIでゆめかのイラストを生成する際は、キャラクター定義として以下の英文を必ずプロンプトに含めてください。

### 共通キャラクタープロンプト
`Character design: A cute chubby pastel-colored little horse foal named "Yumeka". Her forehead is completely bare, smooth, and flat. She ONLY has two normal animal ears on her head. Completely hornless, a normal horse. Every single sticker MUST STRICTLY have exactly 4 legs, absolutely no extra legs, no 5 legs, no 6 legs. Her legs are short and tiny, but clearly recognizable as pony legs. Small pastel purple hooves. On top of her head, she has a short bob-cut mane with FLIPPED-OUT ends (outward curl at the ends), colored in a pastel purple, pink, and sky blue gradient, adorned with a bright yellow flat star hair clip. Her tail is also a fluffy pastel gradient of purple, pink, and sky blue. On her rear, there is a cute mark of a white cloud with a tiny yellow star. She has large, watery, sparkling purple eyes with cute catchlights, and soft rosy pink cheeks. Her expression is gentle, sleepy, and relaxed.`

---

## 3. シリーズ化に向けた画像生成・スライスの注意点

- **【重要】スライス用の余白確保 (Sticker Spacing)**:
  自動切り出し（スライス）を容易にするため、各イラストの間に非常に広い余白と緑の境界（Gutter/Margin）を確保します。
  生成時は `Sticker spacing: Each sticker is completely isolated with its own thick white border outline. There are extremely wide, extra spacious green gutters and huge clear margins between every sticker, ensuring they are widely separated and easy to slice.` を指定して、個々のイラスト同士が絶対に結合しないようにします。
