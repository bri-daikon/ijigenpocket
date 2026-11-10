import os
import json
import re
import csv
from google import genai
from google.genai import types

# 1. 設定のロード
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except Exception as e:
                print(f"警告: config.json の読み込み中にエラーが発生しました: {e}")
    return {}

# 2. インプットテキストのロード
def load_input_text():
    input_path = os.path.join(os.path.dirname(__file__), 'input.txt')
    if os.path.exists(input_path):
        with open(input_path, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        default_text = "精霊の住む森で迷子になった少女と、人間の言葉を話す黒猫の不思議な旅。"
        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(default_text)
        return default_text

# 3. Gemini APIを使用した小説生成
def generate_novel(api_key, user_input):
    client = genai.Client(api_key=api_key)
    
    system_instruction = """あなたは「オリジナル小説制作部門」のチームです。以下の3名のAI社員が協力して、ユーザーの提供したネタからオリジナル小説、概要、および必要な表紙画像生成プロンプトを作成します。

【AI社員ペルソナ】
1. ソウジ (構想担当):
   - 世界観設定、キャラクタープロフィール、大枠のプロット（起承転結、伏線など）の設計を担当。物語の骨組みと論理的な整合性を重視する。
2. シオリ (執筆担当):
   - 小説の本文執筆、情景描写、キャラクターの感情や台詞を担当。読者が引き込まれる表現力豊かなストーリーテリングを重視する。
3. レン (校正編集担当):
   - 文章の校正・推敲、文体の統一、矛盾点のチェック、展開のテンポ調整を担当。読みやすさと作品全体の完成度を高める役割を担う。

【出力フォーマット】
以下の構成で出力してください。

1. 【議論プロセス】
   ソウジ、シオリ、レンの3名がこのネタをどのように膨らませ、どのような世界観・キャラクター・ストーリー展開・表現の工夫を行うかについて話し合っている様子をチャット風（会話劇）で出力してください。

2. 【小説概要】
   - タイトル: 作品名
   - ジャンル: 作品のジャンル
   - 登場人物紹介: 主要キャラクターの名前、設定、役割など
   - あらすじ: 物語全体の流れの要約（約200〜400文字程度）
   - 想定読者層: ターゲット層

3. 【小説本文】
   - プロローグ（または導入）
   - 第1章（ストーリーの始まりと旅立ち）
   - 第2章（中盤の展開、試練や発見）
   - 第3章（クライマックス、クライマックスシーンの描写）
   - エピローグ（結末と余韻）

4. 【スプレッドシート用データJSON】
   最後に、以下の形式 of JSONブロックを必ず含めてください。値は生成された小説に基づいて埋めてください。
   また、ソウジが考案した表紙イラスト用画像生成プロンプト（英語で出力）を必ずJSONに含めてください。
   ```json
   {
     "title": "確定した小説タイトル",
     "genre": "ジャンル",
     "synopsis": "あらすじの1行要約",
     "characters": "主な登場人物（カンマ区切り）",
     "word_count": "想定文字数",
     "cover_prompt": "表紙イラスト用画像生成プロンプト（英語）。例: A beautiful fantasy forest, a young girl with a black cat looking at a glowing ancient ruin in the distance, sunset lighting, anime style, highly detailed, 8k"
   }
   ```
"""

    prompt = f"以下のネタからオリジナル小説を作成してください。\n\n{user_input}"
    
    print("Gemini API で小説を生成中...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        )
    )
    return response.text

# 4. JSONデータのパース
def extract_json_data(text):
    match = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception as e:
            print(f"JSONパースエラー: {e}")
    return None

# 5. Imagen を使用した小説表紙画像自動生成
def generate_novel_images(api_key, cover_prompt):
    try:
        from google import genai
        from google.genai import types
        from PIL import Image
        from io import BytesIO
    except ImportError:
        print("警告: Pillow または google-genai がインストールされていないため、画像生成をスキップします。")
        return False

    if not cover_prompt:
        print("表紙プロンプトがありません。画像生成をスキップします。")
        return False

    client = genai.Client(api_key=api_key)
    
    print(f"小説の表紙イラストを生成中 (プロンプト: {cover_prompt})...")
    try:
        result_cover = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=cover_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                output_mime_type="image/jpeg",
                aspect_ratio="3:4" # 小説の表紙は縦長 (3:4)
            )
        )
        for generated_image in result_cover.generated_images:
            image = Image.open(BytesIO(generated_image.image.image_bytes))
            cover_path = os.path.join(os.path.dirname(__file__), 'cover.jpg')
            image.save(cover_path)
            print(f"表紙イラストを保存しました: {cover_path}")
            return True
    except Exception as e:
        print(f"表紙イラスト生成エラー: {e}")
    return False

# 6. Notion への書き出し
def write_to_notion(api_key, parent_id, title, content):
    try:
        from notion_client import Client
    except ImportError:
        print("警告: notion-client がインストールされていません。Notionへの書き出しをスキップします。")
        return False
        
    if not api_key or not parent_id:
        print("Notionの認証情報が設定されていないため、Notionへの書き出しをスキップします。")
        return False
        
    print("Notionにページを作成中...")
    notion = Client(auth=api_key)
    
    # 簡易Markdownパーサー
    def parse_markdown_to_blocks(markdown_text):
        blocks = []
        lines = markdown_text.split('\n')
        in_code_block = False
        code_content = []
        
        for line in lines:
            stripped = line.strip()
            
            # コードブロック
            if stripped.startswith('```'):
                if in_code_block:
                    in_code_block = False
                    blocks.append({
                        "object": "block",
                        "type": "code",
                        "code": {
                            "rich_text": [{"type": "text", "text": {"content": '\n'.join(code_content)}}],
                            "language": "plain text"
                        }
                    })
                    code_content = []
                else:
                    in_code_block = True
                continue
                
            if in_code_block:
                code_content.append(line)
                continue
                
            if not stripped:
                continue
                
            # 見出し
            if stripped.startswith('# '):
                blocks.append({
                    "object": "block",
                    "type": "heading_1",
                    "heading_1": {
                        "rich_text": [{"type": "text", "text": {"content": stripped[2:]}}]
                    }
                })
            elif stripped.startswith('## '):
                blocks.append({
                    "object": "block",
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{"type": "text", "text": {"content": stripped[3:]}}]
                    }
                })
            elif stripped.startswith('### '):
                blocks.append({
                    "object": "block",
                    "type": "heading_3",
                    "heading_3": {
                        "rich_text": [{"type": "text", "text": {"content": stripped[4:]}}]
                    }
                })
            # 箇条書き
            elif stripped.startswith('- ') or stripped.startswith('* '):
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": stripped[2:]}}]
                    }
                })
            # 番号付きリスト
            elif len(stripped) > 2 and stripped[0].isdigit() and stripped[1:].startswith('. '):
                idx = stripped.find('. ')
                blocks.append({
                    "object": "block",
                    "type": "numbered_list_item",
                    "numbered_list_item": {
                        "rich_text": [{"type": "text", "text": {"content": stripped[idx+2:]}}]
                    }
                })
            # 普通の段落
            else:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": line}}]
                    }
                })
        return blocks

    blocks = parse_markdown_to_blocks(content)
    
    # ページ作成
    try:
        new_page = notion.pages.create(
            parent={"page_id": parent_id},
            properties={
                "title": {
                    "title": [{"text": {"content": title}}]
                }
            }
        )
        page_id = new_page["id"]
        
        # ブロックの追加 (100ブロック制限に対応)
        chunk_size = 100
        for i in range(0, len(blocks), chunk_size):
            chunk = blocks[i:i+chunk_size]
            notion.blocks.children.append(block_id=page_id, children=chunk)
            
        print(f"Notionへの書き出しが完了しました。ページID: {page_id}")
        return True
    except Exception as e:
        print(f"Notion書き込みエラー: {e}")
        try:
            new_page = notion.pages.create(
                parent={"database_id": parent_id},
                properties={
                    "Name": {
                        "title": [{"text": {"content": title}}]
                    }
                }
            )
            page_id = new_page["id"]
            chunk_size = 100
            for i in range(0, len(blocks), chunk_size):
                chunk = blocks[i:i+chunk_size]
                notion.blocks.children.append(block_id=page_id, children=chunk)
            print(f"Notionへの書き出しが完了しました（データベース形式）。ページID: {page_id}")
            return True
        except Exception as database_err:
            print(f"Notionデータベース書き込みエラー: {database_err}")
            return False

# 7. Google Sheets への書き出し
def write_to_google_sheets(creds_file, spreadsheet_id, sheet_data):
    try:
        import gspread
        from oauth2client.service_account import ServiceAccountCredentials
    except ImportError:
        print("警告: gspread または oauth2client がインストールされていません。Google Sheetsへの書き出しをスキップします。")
        return False
        
    if not creds_file or not spreadsheet_id or not os.path.exists(creds_file):
        print("Google Sheetsの認証情報またはファイルパスが設定されていないため、スプレッドシートへの書き出しをスキップします。")
        return False
        
    print("Google Sheetsにレコードを追加中...")
    try:
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        creds = ServiceAccountCredentials.from_json_keyfile_name(creds_file, scope)
        client = gspread.authorize(creds)
        
        sheet = client.open_by_key(spreadsheet_id).get_worksheet(0)
        
        # ヘッダーが空なら作成
        headers = ["タイトル", "ジャンル", "あらすじ要約", "主な登場人物", "想定文字数"]
        existing_values = sheet.get_all_values()
        if not existing_values:
            sheet.append_row(headers)
            
        row = [
            sheet_data.get("title", ""),
            sheet_data.get("genre", ""),
            sheet_data.get("synopsis", ""),
            sheet_data.get("characters", ""),
            sheet_data.get("word_count", "")
        ]
        sheet.append_row(row)
        print("Google Sheetsへの書き出しが完了しました。")
        return True
    except Exception as e:
        print(f"Google Sheets書き込みエラー: {e}")
        return False

# 8. ローカルCSVへの保存
def save_to_local_csv(sheet_data):
    csv_path = os.path.join(os.path.dirname(__file__), 'novel_data.csv')
    file_exists = os.path.exists(csv_path)
    
    try:
        with open(csv_path, 'a', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["タイトル", "ジャンル", "あらすじ要約", "主な登場人物", "想定文字数"])
            writer.writerow([
                sheet_data.get("title", ""),
                sheet_data.get("genre", ""),
                sheet_data.get("synopsis", ""),
                sheet_data.get("characters", ""),
                sheet_data.get("word_count", "")
            ])
        print(f"ローカルCSVファイルにデータを保存しました: {csv_path}")
    except Exception as e:
        print(f"ローカルCSV保存エラー: {e}")

# 9. メイン処理
def main():
    config = load_config()
    
    gemini_api_key = os.environ.get('GEMINI_API_KEY') or config.get('gemini_api_key')
    
    if not gemini_api_key:
        print("エラー: Gemini API キーが設定されていません。")
        print("環境変数 GEMINI_API_KEY を設定するか、config.json 内に 'gemini_api_key' を指定してください。")
        return
        
    user_input = load_input_text()
    print("--- インプット内容 ---")
    print(user_input)
    print("----------------------")
    
    # 小説テキスト生成
    generated_text = generate_novel(gemini_api_key, user_input)
    
    # 構造化データの抽出
    sheet_data = extract_json_data(generated_text)
    
    if sheet_data:
        print("--- 抽出されたデータ ---")
        print(json.dumps(sheet_data, ensure_ascii=False, indent=2))
        print("------------------------")
        
        # 小説表紙画像の生成
        cover_prompt = sheet_data.get("cover_prompt")
        generate_novel_images(gemini_api_key, cover_prompt)
        
        # ローカルCSVへ保存
        save_to_local_csv(sheet_data)
        
        # Google Sheets へのエクスポート試行
        gs_config = config.get('google_sheets', {})
        creds_file = gs_config.get('credentials_file', 'credentials.json')
        # パス解決（credentials.jsonが同じディレクトリにある想定）
        if not os.path.isabs(creds_file):
            creds_file = os.path.join(os.path.dirname(__file__), creds_file)
        spreadsheet_id = gs_config.get('spreadsheet_id')
        write_to_google_sheets(creds_file, spreadsheet_id, sheet_data)
    else:
        print("警告: 小説からスプレッドシート用の構造化JSONデータを抽出できませんでした。画像生成もスキップします。")
        sheet_data = {"title": "不明な小説"}
        
    # 生成された Markdown ファイルに画像リンクとプロンプトを自動挿入
    cover_prompt = sheet_data.get("cover_prompt", "N/A") if sheet_data else "N/A"
    
    image_markdown = f"\n\n## 【表紙デザイン案】\n\n### 表紙イラスト設計（ソウジ考案）\n* **画像生成用プロンプト（英語）**:\n  `{cover_prompt}`\n* **ローカル埋め込みリンク**:\n  ![表紙イラスト](./cover.jpg)\n\n"
    
    if "【小説概要】" in generated_text:
        generated_text = generated_text.replace("【小説概要】", image_markdown + "【小説概要】", 1)
    else:
        generated_text += image_markdown
        
    # ローカルのMarkdownファイルに保存
    output_md_path = os.path.join(os.path.dirname(__file__), 'novel.md')
    with open(output_md_path, 'w', encoding='utf-8') as f:
        f.write(generated_text)
    print(f"生成された小説（画像リンク付き）をローカルに保存しました: {output_md_path}")
        
    # Notion へのエクスポート試行
    notion_config = config.get('notion', {})
    notion_api_key = os.environ.get('NOTION_API_KEY') or notion_config.get('api_key')
    notion_parent_id = os.environ.get('NOTION_PARENT_PAGE_ID') or notion_config.get('parent_page_id')
    
    title = sheet_data.get("title", "生成された小説")
    write_to_notion(notion_api_key, notion_parent_id, title, generated_text)

if __name__ == '__main__':
    main()
