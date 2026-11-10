import re

filepath = r"y:\ijigenpocket\js\ccfolialayoutmaker_ai.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # 従業員名
    "name: 'タク? (プランナ?)'": "name: 'タクミ (プランナー)'",
    "name: 'アオイ (?ザイナ?)'": "name: 'アオイ (デザイナー)'",
    
    # trans定義 (ホラーのメニュー翻訳)
    'const trans = { "houserule": "?", "battle": "", "insanity": "?", "growth": "", "other": "G?" };': 'const trans = { "houserule": "定義", "battle": "合戦", "insanity": "狂気", "growth": "成長", "other": "雑談" };',
    
    # 雰囲気テーマ名
    "cyberpunk: 'TCo?pN',": "cyberpunk: 'サイバーパンク',",
    "classic: 'NV?Nm',": "classic: 'クラシック洋館',",
    "classic: 'NV?n',": "classic: 'クラシック洋館',",
    "fantasy: 't@^W[E?'": "fantasy: 'ファンタジー・魔法'",
    
    # 作成中... 等のボタン表示
    "class=\"animate-spin mr-1.5 w-4 h-4\"></i>?...';": "class=\"animate-spin mr-1.5 w-4 h-4\"></i>作成中...';",
    "class=\"mr-1.5 w-4 h-4\"></i>AIЈɍ?˗'": "class=\"mr-1.5 w-4 h-4\"></i>AI社員に作成を依頼する'",
    'AIЈɍ?˗': 'AI社員に作成を依頼する',
    
    # タクミの発言（背景のみ・パーツあり）
    "CEOAv]܂?p[?͔zuA?̃[?${customPrompt || theme}vɉĕ摜1Ŕ_O܂I": "CEO、ご要望を承りました。パーツは配置せず、ご指示のテーマ「${customPrompt || theme}」に沿って部屋画像を1枚で美しくレンダリングします！",
    "??܂B•ʃpl͔zuĂ܂̂ŁÂ܂ܕۑĂp??": "作成完了しました。個別パネルは配置しておりませんので、このまま保存してご活用ください。",
    "\\󂠂܂AAPIAgɃG[܂ (${err.message})B?̂߁AftHg??[}ősĐ?܂B": "申し訳ありません、API連携中にエラーが発生しました (${err.message})。安全のため、デフォルトテーマで代行して生成します。",
    "CEOA?肪??܂I̓p???uAe[}?${themeName}zɉ1G?摜o͂܂?B": "CEO、ご指示ありがとうございます！今回はパーツを配置せず、テーマ【${themeName}】に沿って1枚絵のデモ画像を出力します。",
    "CEOA?肪??܂Ie[}?${themeName}zAl?${numPlayers}lz?zu?${layoutName}zł?B旧Ă܂B": "CEO、ご指示ありがとうございます！テーマ【${themeName}】、人数【${numPlayers}人】、配置【${layoutName}】です。さっそく企画立案しました。",
    "Oi蔲?APLpl??uɁBj[pƃN?NANVp?ڐAA}فAAC?AASANA??{^YɎ񂳂܂I": "前景くり抜き窓は中央左、PLパネルは固定位置に。メニュー用とクリックアクション用（目星、聞き耳、図書館、アイデア、SAN、塩）のボタンを綺麗に自動整列させます！",
    "CEOAv]܂?NGXg?${customPrompt || theme}vɂ?āAꂩAICƑ?čœKȕ܂I": "CEO、ご要望を承りました。リクエスト「${customPrompt || theme}」について、これからアオイと相談して最適な部屋を作ります！",
    "wi摜??i[g~bg?429?ɒB܂BԂu?ĂĎs邩A?̂߈ꎞISVGO?[Vwiős܂B": "背景画像生成制限（レートリミット429）に達しました。少し時間を置いてから再試行するか、安全のため一時的にSVGグラデーション背景で代行します。",
    "wi摜??ɃG[܂ (${imgErr.message})B?̂߁ASVGO?[Vwiős܂B": "背景画像生成中にエラーが発生しました (${imgErr.message})。安全のため、SVGグラデーション背景で代行します。",
    
    # アオイの発言
    "C?w肳ꂽvf?g?͋C1?CXgwi摜ƂĂ胂?O?j??": "了解！指定された要素や枠線、雰囲気を1枚のイラスト背景画像としてしっかりモデリング（生成）するよ！",
    "C?w肳ꂽvf?g?͋C1?CXgwi摜ƂĂ胂?O?j???": "了解！指定された要素や枠線、雰囲気を1枚のイラスト背景画像としてしっかりモデリング（生成）するよ！",
    "wʂ̕摜?_O?摜jJn??b邩?ĂĂ?": "ご指示通りの部屋画像レンダリング（画像生成）を開始するよ。数秒かかるから待っててね！",
    "wʂ̕摜?_O?摜jJn??b邩?ĂĂ?": "ご指示通りの部屋画像レンダリング（画像生成）を開始するよ。数秒かかるから待っててね！",
    "?܂?RRtHA摜????": "お待たせしました！ココフォリア部屋画像の生成が完了したよ！",
    "v]ɍッキングwĩ?O?jJn??b邩?ĂĂ?": "要望に合わせた背景のモデリング（画像生成）を開始するよ。数秒かかるから待っててね！",
    "v]ɍキングwĩ?O?摜jJn??b邩?ĂĂ?": "要望に合わせた背景のモデリング（画像生成）を開始するよ。数秒かかるから待っててね！",
    "wiAZ?g?摜?ILoXɃ[h???": "背景アセット（画像生成）が完了したよ！キャンバスにロードするね！",
    "wiAZ?g?摜?ILoXɃ[h??": "背景アセット（画像生成）が完了したよ！キャンバスにロードするね！",
    "wi摜ep???Cg?GgȂ?V[X??č????": "背景画像から各パーツ（メイン枠や立ち絵枠など）をシームレスに切り出して合成するよ！",
    "wi摜ep???Cg?GgȂ?V[X??č???": "背景画像から各パーツ（メイン枠や立ち絵枠など）をシームレスに切り出して合成するよ！",
    "?UC݌v???${responseData.design.style_description}ve[}?CAEgLoXɏo͂?": "デザイン設計完了！「${responseData.design.style_description}」テーマの部屋レイアウトをキャンバスに出力したよ！",
    "??LoXɍッキング䗦1?RRtHAwi?f?`悷?": "了解！キャンバスに合わせた比率で1枚のココフォリア背景（デモ）を描画するね！",
    "??LoXɍキング䗦1?RRtHAwi?f?`悷?": "了解！キャンバスに合わせた比率で1枚のココフォリア背景（デモ）を描画するね！",
    "C??${themeName}z?͋CőɈoJ[p?gŔwiƃpl?烂?OˁBp[??X^[gI": "任せて！【${themeName}】の雰囲気を最大限に引き出すカラーパレットで背景とパネル装飾を今からモデリングするね。パーツ生成スタート！",
    "wiAZ?gp̃C[W摜if?擾?B": "背景アセット用のイメージ画像（デモ）を取得するね。",
    "wiAZ?gp̃C[W摜if?擾?": "背景アセット用のイメージ画像（デモ）を取得するね。",
    "摜?ǂݍ݂?ILoXɎCAEgo͂??CEO?": "画像の読み込みが完了したよ！キャンバスに自動レイアウトを出力するね、CEO！",
    "?ݗĊ?ILoXɏo͂mFĂ݂?CEO?": "組み立て完了したよ！キャンバスに出力したから確認してみてね、CEO！",
    "?ݗ?ILoXɏo͂mFĂ݂?CEO?": "組み立て完了したよ！キャンバスに出力したから確認してみてね、CEO！",
    
    # コメント部分・フォールバック等
    "// AAI?[?": "// リアルAI生成モード",
    "// ʏ̃AAI?[hip[???": "// 通常のリアルAI生成モード（パーツあり）",
    "// c_O?\"": "// 議論ログを順次表示",
    "// c_O?\\": "// 議論ログを順次表示",
    "// ?[hփtH[obN": "// デモモードへフォールバック",
    "// ]ʂ̃?N?[?": "// 従来通りのモックデモモード",
    "// ]̃tH[obNv?": "// 従来のフォールバック計算",
    "// ?[}ʂSVG?W?N": "// テーマ別のSVG生成ロジック",
    "// ?[hʂSVG?W?N": "// テーマ別のSVG生成ロジック",
    
    # 整列パネルの無効化・その他
    "// 3.3 整列?配置ボタンの有効?/無効化制御": "// 3.3 整列・配置ボタンの有効化/無効化制御",
    "// 3.5 操作履歴「一つ戻る」?タンの制御": "// 3.5 操作履歴「一つ戻る」ボタンの制御"
}

for src, dst in replacements.items():
    content = content.replace(src, dst)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete!")
