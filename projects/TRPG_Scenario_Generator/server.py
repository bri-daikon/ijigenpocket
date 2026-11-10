import os
import json
import subprocess
import socket
from http.server import HTTPServer, BaseHTTPRequestHandler

class WebServerHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Server] {format%args}")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            html_path = os.path.join(os.path.dirname(__file__), 'index.html')
            if os.path.exists(html_path):
                with open(html_path, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write("<h1>index.html が見つかりません</h1>".encode('utf-8'))
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write("Not Found".encode('utf-8'))
            
    def do_POST(self):
        if self.path == '/generate':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "output": f"リクエスト解析エラー: {e}"}).encode('utf-8'))
                return
                
            input_text = ""
            fields = [
                ("シナリオタイトル", "title"),
                ("シナリオのテーマ・雰囲気", "theme"),
                ("舞台設定", "setting"),
                ("あらすじ", "synopsis"),
                ("登場人物（NPC）のアイデア", "npc"),
                ("使いたい要素や神話生物", "elements"),
                ("プレイヤーへの初期情報（ハンドアウトなど）", "handout")
            ]
            for label, key in fields:
                val = data.get(key, "").strip()
                if val:
                    input_text += f"【{label}】\n{val}\n\n"
                    
            input_path = os.path.join(os.path.dirname(__file__), 'input.txt')
            try:
                with open(input_path, 'w', encoding='utf-8') as f:
                    f.write(input_text.strip())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "output": f"input.txt の書き込みに失敗しました: {e}"}).encode('utf-8'))
                return
                
            venv_python = os.path.join(os.path.dirname(__file__), 'venv', 'Scripts', 'python.exe')
            if not os.path.exists(venv_python):
                venv_python = 'python'
                
            print(f"[Server] シナリオ生成スクリプトを実行中: {venv_python} scenario_generator.py")
            try:
                env = os.environ.copy()
                env['PYTHONIOENCODING'] = 'utf-8'
                
                result = subprocess.run(
                    [venv_python, 'scenario_generator.py'],
                    cwd=os.path.dirname(__file__),
                    capture_output=True,
                    text=True,
                    encoding='utf-8',
                    env=env
                )
                output = result.stdout + "\n" + result.stderr
                success = result.returncode == 0
            except Exception as e:
                output = f"実行時エラーが発生しました: {e}"
                success = False
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                "success": success,
                "output": output
            }
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))

def find_free_port(start_port=8000, max_port=8100):
    for port in range(start_port, max_port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise IOError("使用可能なポートが見つかりませんでした。")

def run(port=8000):
    try:
        free_port = find_free_port(port)
    except IOError as e:
        print(f"エラー: {e}")
        return
        
    server_address = ('127.0.0.1', free_port)
    httpd = HTTPServer(server_address, WebServerHandler)
    print(f"\n=======================================================")
    print(f" TRPG Scenario Generator Web Server が起動しました。")
    print(f" ブラウザで以下のURLを開いてください:")
    print(f" http://localhost:{free_port}/")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nサーバーを終了します。")
        httpd.server_close()

if __name__ == '__main__':
    run()
