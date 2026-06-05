import http.server
import socketserver
import urllib.request
import urllib.error
import json
import os
import ssl
import socket

PORT = 8000

# Bypass SSL certificate verification
ssl._create_default_https_context = ssl._create_unverified_context

# Change current working directory to serve files correctly
os.chdir("y:\\ijigenpocket")

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/api/generate-image'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                req_data = json.loads(post_data.decode('utf-8'))
                api_key = req_data.get('apiKey')
                prompt = req_data.get('prompt')
                
                if not api_key or not prompt:
                    self.send_error(400, "Missing apiKey or prompt")
                    return
                
                # Debug: List available models to find active Imagen model names
                list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
                try:
                    with urllib.request.urlopen(list_url) as res:
                        models_data = json.loads(res.read().decode('utf-8'))
                        print("=== Available Models for this API Key ===")
                        for m in models_data.get('models', []):
                            name = m.get('name', '')
                            if 'imagen' in name.lower() or 'image' in name.lower():
                                print(f"- {name}")
                        print("=========================================")
                except Exception as list_err:
                    print(f"Failed to list models: {list_err}")

                # Native Gemini API Endpoint for Image Generation
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key={api_key}"
                
                gemini_req_data = json.dumps({
                    "contents": [{
                        "parts": [{
                            "text": prompt
                        }]
                    }],
                    "generationConfig": {
                        "responseModalities": ["IMAGE"]
                    }
                }).encode('utf-8')
                
                req = urllib.request.Request(
                    url, 
                    data=gemini_req_data, 
                    headers={
                        'Content-Type': 'application/json'
                    }
                )
                
                with urllib.request.urlopen(req) as response:
                    res_raw = response.read()
                    res_json = json.loads(res_raw.decode('utf-8'))
                
                # Extract image Base64 data from response
                try:
                    candidates = res_json.get('candidates', [])
                    part = candidates[0].get('content', {}).get('parts', [])[0]
                    b64_data = part.get('inlineData', {}).get('data')
                    if not b64_data:
                        raise ValueError("No inlineData found in response parts.")
                except Exception as parse_err:
                    print(f"Error parsing Gemini Native image response: {parse_err}")
                    raise parse_err
                
                # Format to OpenAI compatible structure expected by frontend
                formatted_res = json.dumps({
                    "data": [
                        {
                            "b64_json": b64_data
                        }
                    ]
                }).encode('utf-8')
                    
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(formatted_res)
                
            except urllib.error.HTTPError as e:
                err_content = e.read().decode('utf-8')
                print(f"Google API HTTPError: {e.code} - {err_content}")
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(err_content.encode('utf-8'))
            except Exception as e:
                print(f"Internal Proxy Server Error: {str(e)}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            super().do_POST()
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# Avoid socket reuse error
socketserver.TCPServer.allow_reuse_address = True

class DualStackTCPServer(socketserver.TCPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

with DualStackTCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
    print(f"Serving HTTP on port {PORT} with API proxy support...")
    httpd.serve_forever()
