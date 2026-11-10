# Rules

## UI / CSS (Tailwind)
- プルダウンメニュー（select と option）のデザイン規則: Tailwindのクラス指定だけでなく、WindowsなどのOSで発生する「OSネイティブの白背景」を防ぐため、必ず style 内で select option { background-color: [背景色]; color: [文字色]; } のように明示的な背景色・文字色のCSSを指定すること。
