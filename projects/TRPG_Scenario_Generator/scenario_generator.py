import os
import json
import re
import csv
import sys
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
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
        # デフォルトのテキストを作成
        default_text = "霧雨の降る洋館からの脱出。植物と同化していく恐怖。"
        with open(input_path, 'w', encoding='utf-8') as f:
            f.write(default_text)
        return default_text

# 3. Gemini APIを使用したシナリオ生成
def generate_scenario(api_key, user_input):
    client = genai.Client(api_key=api_key)
    
    system_instruction = """あなたは「TRPGシナリオ構成担当部門」のチームです。以下の5名のAI社員が協力して、ユーザーの提供したネタからクトゥルフ神話TRPG（6版または7版）のシナリオ、トレーラー、概要、および必要な画像生成プロンプトを作成します。

【AI社員ペルソナ】
1. ガクト (TRPGシナリオ構成者):
   - 全体のプロット、分岐ルート、謎解きの整合性、ギミックの設計を担当。ゲームとしての面白さと論理性を重視する。
2. ヒカリ (TRPGシナリオライター):
   - NPCのセリフ、情景描写、感情的なテキスト、トレーラーのキャッチコピーを担当。プレイヤーが没入できる物語性を重視する。
3. カイ (TRPGマップデザイナー):
   - 探索マップやダンジョン、洋館の見取り図の構造設計を担当。探索の楽しさを引き出すマップ構成を考える。
4. ユウ (TRPGグラフィックデザイナー):
   - キービジュアル、シーンイラスト、NPCビジュアルのコンセプト設計を担当。雰囲気抜群の絵作りを考える。
5. ミヤビ (TRPGシナリオ校正者):
   - クトゥルフ神話TRPGのゲームシステム（技能ロール、SAN値チェックなど）との整合性をチェックし、表記揺れや難易度のバランスを調整する。

【出力フォーマット】
以下の構成で出力してください。

1. 【議論プロセス】
   ガクト、ヒカリ、カイ、ユウ、ミヤビの5名がこのネタをどのように膨らませ、どのような構成・演出・マップ・ビジュアル設計・ルール調整を行うかについて話し合っている様子をチャット風（会話劇）で出力してください。

2. 【TRPGシナリオトレーラー】
   - ヒカリが作成した、プレイヤーの興味を惹くキャッチコピーとイントロダクション（約200〜400文字程度）。

3. 【シナリオ概要】
   - 推奨人数、想定時間、推奨技能、ロスト率、シナリオの傾向（クローズド/シティ等）などのスペック情報。

4. 【シナリオ本文】
   - 導入部（ハンドアウトと合流）
   - 探索フェーズ（探索場所ごとの描写、ギミック、技能ロール指示。カイが設計したマップの間取り解説も含める）
   - クライマックス（神話生物との対峙、決戦ルール、SAN値チェック）
   - エンディング分岐（グッドエンディング、バッドエンディング等の条件と描写）
   - NPCデータ（ステータス、台詞例、およびユウが考案した「キャラクター外見の画像生成用プロンプト（英語、アニメ風）」を含む。プロンプトには必ず anime style, character design などのキーワードを含めること）
   - 神話生物・怪異データ

5. 【スプレッドシート用データJSON】
   最後に、以下の形式のJSONブロックを必ず含めてください。値は生成されたシナリオに基づいて埋めてください。
   また、ユウが考案したシーンイラスト用画像生成プロンプトと、カイが考案した探索マップ用画像生成プロンプト（どちらも英語で出力）を必ずJSONに含めてください。
   ```json
   {
     "title": "確定したシナリオタイトル",
     "trailer": "トレーラーの1行要約",
     "players": "推奨人数",
     "duration": "想定時間",
     "skills": "推奨技能",
     "lost_rate": "ロスト率",
     "map_prompt": "探索マップ用画像生成プロンプト（英語）。例: A gridded floor plan of a mysterious mansion, top-down view, grimoires and plants scattered, game asset style, 8k",
     "scene_prompt": "シーンイラスト用画像生成プロンプト（英語）。例: A spooky retro Japanese mansion deep in a rainy dark mountain forest at night, anime key visual style, cinematic lighting"
   }
   ```
"""

    prompt = f"以下のネタからシナリオを作成してください。\n\n{user_input}"
    
    print("Gemini API でシナリオを生成中...")
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

# 5. Imagen を使用したTRPG用画像自動生成
def generate_trpg_images(api_key, map_prompt, scene_prompt):
    try:
        from google import genai
        from google.genai import types
        from PIL import Image
        from io import BytesIO
    except ImportError:
        print("警告: Pillow または google-genai がインストールされていないため、画像生成をスキップします。")
        return False

    client = genai.Client(api_key=api_key)
    
    # 5-1. マップ画像の生成
    if map_prompt:
        print(f"探索マップ画像を生成中 (プロンプト: {map_prompt})...")
        try:
            result_map = client.models.generate_images(
                model='imagen-4.0-generate-001',
                prompt=map_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                    aspect_ratio="1:1" # マップは正方形
                )
            )
            for generated_image in result_map.generated_images:
                image = Image.open(BytesIO(generated_image.image.image_bytes))
                map_path = os.path.join(os.path.dirname(__file__), 'map.jpg')
                image.save(map_path)
                print(f"マップ画像を保存しました: {map_path}")
        except Exception as e:
            print(f"マップ画像生成エラー: {e}")
            
    # 5-2. シーンイメージ画像の生成
    if scene_prompt:
        print(f"イメージイラストを生成中 (プロンプト: {scene_prompt})...")
        try:
            result_scene = client.models.generate_images(
                model='imagen-4.0-generate-001',
                prompt=scene_prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    output_mime_type="image/jpeg",
                    aspect_ratio="16:9" # イラストはワイド画面
                )
            )
            for generated_image in result_scene.generated_images:
                image = Image.open(BytesIO(generated_image.image.image_bytes))
                scene_path = os.path.join(os.path.dirname(__file__), 'scene.jpg')
                image.save(scene_path)
                print(f"イメージイラストを保存しました: {scene_path}")
        except Exception as e:
            print(f"イメージイラスト生成エラー: {e}")
    return True

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
    
    # ページ作成 (タイトルのみ)
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
        headers = ["タイトル", "トレーラー要約", "推奨人数", "想定時間", "推奨技能", "ロスト率"]
        existing_values = sheet.get_all_values()
        if not existing_values:
            sheet.append_row(headers)
            
        row = [
            sheet_data.get("title", ""),
            sheet_data.get("trailer", ""),
            sheet_data.get("players", ""),
            sheet_data.get("duration", ""),
            sheet_data.get("skills", ""),
            sheet_data.get("lost_rate", "")
        ]
        sheet.append_row(row)
        print("Google Sheetsへの書き出しが完了しました。")
        return True
    except Exception as e:
        print(f"Google Sheets書き込みエラー: {e}")
        return False

# 8. ローカルCSVへの保存
def save_to_local_csv(sheet_data):
    csv_path = os.path.join(os.path.dirname(__file__), 'scenario_data.csv')
    file_exists = os.path.exists(csv_path)
    
    try:
        with open(csv_path, 'a', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(["タイトル", "トレーラー要約", "推奨人数", "想定時間", "推奨技能", "ロスト率"])
            writer.writerow([
                sheet_data.get("title", ""),
                sheet_data.get("trailer", ""),
                sheet_data.get("players", ""),
                sheet_data.get("duration", ""),
                sheet_data.get("skills", ""),
                sheet_data.get("lost_rate", "")
            ])
        print(f"ローカルCSVファイルにデータを保存しました: {csv_path}")
    except Exception as e:
        print(f"ローカルCSV保存エラー: {e}")

# 9. シナリオ自動生成一連パイプライン
def run_generation_pipeline(user_input):
    config = load_config()
    
    # APIキーの取得優先順位: 環境変数 > config.json
    gemini_api_key = os.environ.get('GEMINI_API_KEY') or config.get('gemini_api_key')
    
    if not gemini_api_key:
        return False, "Gemini API キーが設定されていません。環境変数 GEMINI_API_KEY を設定するか、config.json 内に 'gemini_api_key' を指定してください。"
        
    try:
        # シナリオテキスト生成
        generated_text = generate_scenario(gemini_api_key, user_input)
        
        # 構造化データの抽出 (画像用プロンプトを含む)
        sheet_data = extract_json_data(generated_text)
        
        if sheet_data:
            print("--- 抽出されたデータ ---")
            print(json.dumps(sheet_data, ensure_ascii=False, indent=2))
            print("------------------------")
            
            # マップ＆シーン画像の生成
            map_prompt = sheet_data.get("map_prompt")
            scene_prompt = sheet_data.get("scene_prompt")
            generate_trpg_images(gemini_api_key, map_prompt, scene_prompt)
            
            # ローカルCSVへ保存
            save_to_local_csv(sheet_data)
            
            # Google Sheets へのエクスポート試行
            gs_config = config.get('google_sheets', {})
            creds_file = gs_config.get('credentials_file', 'credentials.json')
            spreadsheet_id = gs_config.get('spreadsheet_id')
            write_to_google_sheets(creds_file, spreadsheet_id, sheet_data)
        else:
            print("警告: シナリオからスプレッドシート用の構造化JSONデータを抽出できませんでした。画像生成もスキップします。")
            sheet_data = {"title": "不明なシナリオ"}
            
        # 生成された Markdown ファイルに画像リンクとプロンプトを自動挿入
        map_prompt_val = sheet_data.get("map_prompt", "N/A") if sheet_data else "N/A"
        scene_prompt_val = sheet_data.get("scene_prompt", "N/A") if sheet_data else "N/A"
        
        image_markdown = f"\n\n## 【ビジュアル＆マップ設計案】\n\n### イメージイラスト設計（ユウ考案）\n* **画像生成用プロンプト（英語、アニメ風）**:\n  `{scene_prompt_val}`\n* **ローカル埋め込みリンク**:\n  ![イメージイラスト](./scene.jpg)\n\n### 探索マップ設計（カイ考案）\n* **画像生成用プロンプト（英語）**:\n  `{map_prompt_val}`\n* **ローカル埋め込みリンク**:\n  ![探索マップ](./map.jpg)\n\n"
        if "【シナリオ概要】" in generated_text:
            generated_text = generated_text.replace("【シナリオ概要】", image_markdown + "【シナリオ概要】", 1)
        else:
            generated_text += image_markdown
            
        # ローカルのMarkdownファイルに保存
        output_md_path = os.path.join(os.path.dirname(__file__), 'scenario.md')
        with open(output_md_path, 'w', encoding='utf-8') as f:
            f.write(generated_text)
        print(f"生成されたシナリオ（画像リンク付き）をローカルに保存しました: {output_md_path}")
            
        # Notion へのエクスポート試行
        notion_config = config.get('notion', {})
        notion_api_key = os.environ.get('NOTION_API_KEY') or notion_config.get('api_key')
        notion_parent_id = os.environ.get('NOTION_PARENT_PAGE_ID') or notion_config.get('parent_page_id')
        
        title = sheet_data.get("title", "生成されたTRPGシナリオ")
        write_to_notion(notion_api_key, notion_parent_id, title, generated_text)
        
        return True, "TRPGシナリオの自動生成と外部ツール（Notion / Google Sheets）への出力が完了しました！"
    except Exception as e:
        return False, f"生成パイプラインエラー: {str(e)}"

# 10. ローカルAPIサーバーリクエストハンドラー
class TRPGRequestHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json_response(self, status_code, data):
        response_bytes = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(response_bytes)))
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Length', '0')
        self.send_header('Connection', 'close')
        self.end_headers()

    def do_GET(self):
        # ヘルスチェック用
        self._send_json_response(200, {"status": "online"})

    def do_POST(self):
        if self.path == '/generate':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(post_data)
                idea = data.get('idea', '')
                
                if not idea:
                    self._send_json_response(400, {"status": "error", "message": "アイデア（ネタ）が入力されていません。"})
                    return

                print(f"\n[API] アイデアを受信しました: {idea}")
                
                # パイプラインの実行
                success, msg = run_generation_pipeline(idea)
                
                if success:
                    self._send_json_response(200, {"status": "success", "message": msg})
                else:
                    self._send_json_response(500, {"status": "error", "message": msg})
            except Exception as e:
                self._send_json_response(500, {"status": "error", "message": f"サーバーエラー: {str(e)}"})
        else:
            self._send_json_response(404, {"status": "error", "message": "Not Found"})

def start_api_server():
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, TRPGRequestHandler)
    print("--------------------------------------------------")
    print("TRPG Scenario Generator API Server is running...")
    print("Endpoint: http://localhost:8080/generate")
    print("Press Ctrl+C to stop the server.")
    print("--------------------------------------------------")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nAPI Server stopped.")

# 11. メイン処理
def main():
    parser = argparse.ArgumentParser(description="TRPG Scenario Generator & Server")
    parser.add_argument("--server", action="store_true", help="Start local API server on port 8080")
    args = parser.parse_args()
    
    if args.server:
        start_api_server()
        return
        
    # CLIモードでの実行
    user_input = load_input_text()
    print("--- インプット内容 ---")
    print(user_input)
    print("----------------------")
    
    success, msg = run_generation_pipeline(user_input)
    print(msg)

if __name__ == '__main__':
    main()
