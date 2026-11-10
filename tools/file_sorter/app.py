import os
import json
import shutil
import uuid
import tkinter as tk
from tkinter import filedialog
from flask import Flask, render_template, request, jsonify, send_file
from werkzeug.utils import secure_filename

app = Flask(__name__)
CONFIG_FILE = 'config.json'

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"source_folder": "", "destinations": []}

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=4, ensure_ascii=False)

def get_unique_filename(destination_dir, filename):
    base, ext = os.path.splitext(filename)
    counter = 1
    new_filename = filename
    while os.path.exists(os.path.join(destination_dir, new_filename)):
        new_filename = f"{base}_{counter}{ext}"
        counter += 1
    return new_filename

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/config', methods=['GET'])
def get_config_api():
    return jsonify(load_config())

@app.route('/api/config', methods=['POST'])
def update_config_api():
    new_config = request.json
    save_config(new_config)
    return jsonify({"success": True})

@app.route('/api/select-folder', methods=['POST'])
def select_folder_api():
    try:
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        folder_path = filedialog.askdirectory(parent=root, title="フォルダを選択")
        root.destroy()
        if folder_path:
            folder_path = os.path.normpath(folder_path)
            return jsonify({"success": True, "path": folder_path})
        return jsonify({"success": False, "cancelled": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/files', methods=['GET'])
def get_files_api():
    config = load_config()
    source_folder = config.get('source_folder', '')
    if not source_folder or not os.path.isdir(source_folder):
        return jsonify([])
    
    supported_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp3', '.wav', '.mp4', '.webm')
    files = []
    try:
        for filename in os.listdir(source_folder):
            if filename.lower().endswith(supported_extensions):
                filepath = os.path.join(source_folder, filename)
                if os.path.isfile(filepath):
                    ext = os.path.splitext(filename)[1].lower()
                    file_type = 'image'
                    if ext in ('.mp3', '.wav'):
                        file_type = 'audio'
                    elif ext in ('.mp4', '.webm'):
                        file_type = 'video'
                        
                    files.append({
                        "filename": filename,
                        "type": file_type
                    })
    except Exception as e:
        print(f"Error reading source directory: {e}")
    
    return jsonify(files)

@app.route('/api/move', methods=['POST'])
def move_file_api():
    data = request.json
    filename = data.get('filename')
    dest_id = data.get('dest_id')
    
    config = load_config()
    source_folder = config.get('source_folder', '')
    
    if not filename or not dest_id or not source_folder:
        return jsonify({"success": False, "error": "Invalid request parameters."}), 400
        
    source_path = os.path.join(source_folder, filename)
    if not os.path.exists(source_path):
        return jsonify({"success": False, "error": "Source file does not exist."}), 404
        
    # Find destination path
    dest_path = None
    for dest in config.get('destinations', []):
        if dest.get('id') == dest_id:
            dest_path = dest.get('path')
            break
            
    if not dest_path:
        return jsonify({"success": False, "error": "Destination not found in config."}), 404
        
    if not os.path.exists(dest_path):
        try:
            os.makedirs(dest_path)
        except Exception as e:
            return jsonify({"success": False, "error": f"Failed to create destination folder: {e}"}), 500
            
    unique_filename = get_unique_filename(dest_path, filename)
    final_dest_path = os.path.join(dest_path, unique_filename)
    
    try:
        shutil.move(source_path, final_dest_path)
        return jsonify({"success": True, "new_filename": unique_filename})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/media/<path:filename>')
def serve_media(filename):
    config = load_config()
    source_folder = config.get('source_folder', '')
    if not source_folder:
        return "Source folder not configured", 404
        
    file_path = os.path.join(source_folder, filename)
    if not os.path.exists(file_path):
        return "File not found", 404
        
    return send_file(file_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
