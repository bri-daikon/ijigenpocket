import os
import sys
import time
import json
import threading
import ctypes
import winsound
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from PIL import Image, ImageTk, ImageDraw, ImageFont

# Set DPI awareness on Windows to ensure accurate coordinates
try:
    ctypes.windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    try:
        ctypes.windll.user32.SetProcessDPIAware()
    except Exception:
        pass

import pyautogui
from capture_tool import ScreenSnipper

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
SETTINGS_FILE = os.path.join(BASE_DIR, "settings.json")
os.makedirs(TEMPLATES_DIR, exist_ok=True)

DEFAULT_BUTTONS = [
    {
        "id": "submit_modal",
        "name": "ツール実行確認: Submit（送信）",
        "file": "submit_modal.png",
        "enabled": True
    },
    {
        "id": "proceed_plan",
        "name": "実装計画の承認: Proceed（続行）",
        "file": "proceed_plan.png",
        "enabled": True
    },
    {
        "id": "chat_send",
        "name": "チャット送信ボタン: Submit / Send",
        "file": "chat_send.png",
        "enabled": False
    }
]

def generate_default_templates():
    """Generate default placeholder template images if they do not exist."""
    font_size = 14
    try:
        font = ImageFont.truetype("segoeui.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()

    specs = [
        ("submit_modal.png", "Submit", (59, 130, 246), (255, 255, 255)),
        ("proceed_plan.png", "Proceed", (37, 99, 235), (255, 255, 255)),
        ("chat_send.png", "Submit", (79, 70, 229), (255, 255, 255))
    ]

    for filename, text, bg_color, text_color in specs:
        filepath = os.path.join(TEMPLATES_DIR, filename)
        if not os.path.exists(filepath):
            img = Image.new("RGB", (90, 32), color=bg_color)
            draw = ImageDraw.Draw(img)
            bbox = draw.textbbox((0, 0), text, font=font)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            draw.text(((90 - w) // 2, (32 - h) // 2 - 2), text, fill=text_color, font=font)
            img.save(filepath)

class AutoClickerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Antigravity Auto Clicker")
        self.root.geometry("640x700")
        self.root.minsize(580, 600)

        # Style & Theme
        self.root.configure(bg="#1e1e24")
        self.style = ttk.Style()
        self.style.theme_use("clam")
        self.setup_styles()

        # State
        self.is_running = False
        self.monitor_thread = None
        self.hotkey_thread = None
        self.last_f9_state = False
        self.button_vars = {}
        self.preview_labels = {}

        # Load settings
        self.settings = self.load_settings()

        generate_default_templates()
        self.build_ui()

        # Start background hotkey listener (F9 toggle)
        self.start_hotkey_listener()

        # Save settings on exit
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def setup_styles(self):
        self.style.configure("TFrame", background="#1e1e24")
        self.style.configure("TLabel", background="#1e1e24", foreground="#e2e8f0", font=("Meiryo", 10))
        self.style.configure("TLabelframe", background="#1e1e24", foreground="#94a3b8")
        self.style.configure("TLabelframe.Label", background="#1e1e24", foreground="#38bdf8", font=("Meiryo", 11, "bold"))
        self.style.configure("TCheckbutton", background="#1e1e24", foreground="#f8fafc", font=("Meiryo", 10))
        self.style.map("TCheckbutton", background=[('active', '#1e1e24')])
        self.style.configure("TButton", font=("Meiryo", 10), padding=4)
        self.style.configure("Accent.TButton", font=("Meiryo", 11, "bold"), background="#3b82f6", foreground="#ffffff")
        self.style.map("Accent.TButton", background=[('active', '#2563eb')])
        self.style.configure("Stop.TButton", font=("Meiryo", 11, "bold"), background="#ef4444", foreground="#ffffff")
        self.style.map("Stop.TButton", background=[('active', '#dc2626')])

    def load_settings(self):
        default = {
            "interval": 1.0,
            "cooldown": 2.0,
            "confidence": 0.85,
            "sound": True,
            "topmost": True,
            "buttons": DEFAULT_BUTTONS
        }
        if os.path.exists(SETTINGS_FILE):
            try:
                with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    default.update(loaded)
            except Exception:
                pass
        return default

    def save_settings(self):
        # Update settings object
        self.settings["interval"] = float(self.interval_var.get())
        self.settings["cooldown"] = float(self.cooldown_var.get())
        self.settings["confidence"] = float(self.confidence_var.get())
        self.settings["sound"] = self.sound_var.get()
        self.settings["topmost"] = self.topmost_var.get()

        for btn in self.settings["buttons"]:
            if btn["id"] in self.button_vars:
                btn["enabled"] = self.button_vars[btn["id"]].get()

        try:
            with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.settings, f, ensure_ascii=False, indent=2)
        except Exception as e:
            self.log(f"設定の保存に失敗: {e}")

    def build_ui(self):
        # Header banner
        header = tk.Frame(self.root, bg="#27272a", height=60)
        header.pack(fill=tk.X, padx=0, pady=0)

        title_lbl = tk.Label(header, text="⚡ Antigravity Auto Clicker", font=("Meiryo", 14, "bold"), bg="#27272a", fg="#38bdf8")
        title_lbl.pack(side=tk.LEFT, padx=16, pady=12)

        self.status_lbl = tk.Label(header, text="● 停止中 [F9で開始]", font=("Meiryo", 11, "bold"), bg="#27272a", fg="#ef4444")
        self.status_lbl.pack(side=tk.RIGHT, padx=16, pady=12)

        # Main Container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=12)

        # 1. Target Buttons Section
        btn_frame = ttk.LabelFrame(main_frame, text=" 対象ボタンの選択（チェックしたボタンを自動押下） ")
        btn_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        self.buttons_container = ttk.Frame(btn_frame)
        self.buttons_container.pack(fill=tk.BOTH, expand=True, padx=10, pady=8)

        self.refresh_buttons_list()

        # Add button bar
        action_bar = ttk.Frame(btn_frame)
        action_bar.pack(fill=tk.X, padx=10, pady=(0, 8))
        add_btn = ttk.Button(action_bar, text="＋ 新しいボタンを追加...", command=self.add_custom_button)
        add_btn.pack(side=tk.LEFT)

        # 2. Settings Section
        settings_frame = ttk.LabelFrame(main_frame, text=" 動作パラメータ・安全設定 ")
        settings_frame.pack(fill=tk.X, pady=(0, 10))

        grid = ttk.Frame(settings_frame)
        grid.pack(fill=tk.X, padx=10, pady=8)

        # Interval
        ttk.Label(grid, text="監視間隔:").grid(row=0, column=0, sticky="w", pady=4)
        self.interval_var = tk.DoubleVar(value=self.settings.get("interval", 1.0))
        interval_spin = ttk.Spinbox(grid, from_=0.2, to=5.0, increment=0.2, textvariable=self.interval_var, width=6)
        interval_spin.grid(row=0, column=1, sticky="w", padx=4, pady=4)
        ttk.Label(grid, text="秒").grid(row=0, column=2, sticky="w", pady=4)

        # Cooldown
        ttk.Label(grid, text="連打防止待機:").grid(row=0, column=3, sticky="w", padx=(20, 0), pady=4)
        self.cooldown_var = tk.DoubleVar(value=self.settings.get("cooldown", 2.0))
        cooldown_spin = ttk.Spinbox(grid, from_=0.5, to=10.0, increment=0.5, textvariable=self.cooldown_var, width=6)
        cooldown_spin.grid(row=0, column=4, sticky="w", padx=4, pady=4)
        ttk.Label(grid, text="秒").grid(row=0, column=5, sticky="w", pady=4)

        # Confidence
        ttk.Label(grid, text="判定感度 (一致度):").grid(row=1, column=0, sticky="w", pady=4)
        self.confidence_var = tk.DoubleVar(value=self.settings.get("confidence", 0.85))
        conf_scale = ttk.Scale(grid, from_=0.6, to=0.98, variable=self.confidence_var, orient=tk.HORIZONTAL, length=120)
        conf_scale.grid(row=1, column=1, columnspan=2, sticky="w", padx=4, pady=4)
        self.conf_val_lbl = ttk.Label(grid, text=f"{self.confidence_var.get():.2f}")
        self.conf_val_lbl.grid(row=1, column=3, sticky="w", pady=4)
        self.confidence_var.trace_add("write", lambda *args: self.conf_val_lbl.config(text=f"{self.confidence_var.get():.2f}"))

        # Options
        opts_frame = ttk.Frame(settings_frame)
        opts_frame.pack(fill=tk.X, padx=10, pady=(0, 8))

        self.sound_var = tk.BooleanVar(value=self.settings.get("sound", True))
        sound_chk = ttk.Checkbutton(opts_frame, text="クリック時に通知音（Beep）を鳴らす", variable=self.sound_var)
        sound_chk.pack(side=tk.LEFT, padx=(0, 16))

        self.topmost_var = tk.BooleanVar(value=self.settings.get("topmost", True))
        topmost_chk = ttk.Checkbutton(opts_frame, text="最前面に固定", variable=self.topmost_var, command=self.update_topmost)
        topmost_chk.pack(side=tk.LEFT)
        self.update_topmost()

        # 3. Main Control Buttons
        ctrl_frame = ttk.Frame(main_frame)
        ctrl_frame.pack(fill=tk.X, pady=(0, 10))

        self.toggle_btn = ttk.Button(ctrl_frame, text="▶ 監視スタート (F9)", style="Accent.TButton", command=self.toggle_running)
        self.toggle_btn.pack(fill=tk.X, ipady=6)

        # 4. Log Section
        log_frame = ttk.LabelFrame(main_frame, text=" 動作ログ ")
        log_frame.pack(fill=tk.BOTH, expand=True)

        self.log_text = tk.Text(log_frame, height=7, bg="#111827", fg="#10b981", font=("Consolas", 9), insertbackground="white")
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=8, pady=6)

        self.log("アプリが準備完了しました。[F9] キーで監視の開始/停止が切り替えられます。")

    def update_topmost(self):
        self.root.attributes("-topmost", self.topmost_var.get())

    def refresh_buttons_list(self):
        for widget in self.buttons_container.winfo_children():
            widget.destroy()

        self.button_vars.clear()
        self.preview_labels.clear()

        for idx, btn in enumerate(self.settings["buttons"]):
            row_frame = tk.Frame(self.buttons_container, bg="#27272a", bd=1, relief="solid")
            row_frame.pack(fill=tk.X, pady=3, padx=2)

            var = tk.BooleanVar(value=btn.get("enabled", True))
            self.button_vars[btn["id"]] = var
            chk = ttk.Checkbutton(row_frame, text=btn["name"], variable=var)
            chk.pack(side=tk.LEFT, padx=8, pady=6)

            # Action buttons
            recapture_btn = ttk.Button(row_frame, text="📷 画面から再登録", command=lambda b=btn: self.start_recapture(b))
            recapture_btn.pack(side=tk.RIGHT, padx=6)

            # Preview image
            img_path = os.path.join(TEMPLATES_DIR, btn["file"])
            preview_lbl = tk.Label(row_frame, bg="#27272a")
            preview_lbl.pack(side=tk.RIGHT, padx=6)
            self.preview_labels[btn["id"]] = preview_lbl
            self.update_preview_image(btn["id"], img_path)

            if btn.get("custom", False):
                del_btn = ttk.Button(row_frame, text="🗑 削除", command=lambda b=btn: self.delete_button(b))
                del_btn.pack(side=tk.RIGHT, padx=2)

    def update_preview_image(self, btn_id, img_path):
        lbl = self.preview_labels.get(btn_id)
        if not lbl:
            return
        if os.path.exists(img_path):
            try:
                img = Image.open(img_path)
                img.thumbnail((70, 26))
                photo = ImageTk.PhotoImage(img)
                lbl.config(image=photo, text="")
                lbl.image = photo
                return
            except Exception:
                pass
        lbl.config(text="[未登録]", fg="#f87171", image="")

    def start_recapture(self, btn):
        img_path = os.path.join(TEMPLATES_DIR, btn["file"])
        self.log(f"「{btn['name']}」の登録を開始します。画面上のボタンを囲んでください。")

        def on_complete(saved_path):
            self.update_preview_image(btn["id"], saved_path)
            self.log(f"✔ 「{btn['name']}」の画像を更新しました: {btn['file']}")
            if self.sound_var.get():
                try:
                    winsound.Beep(1200, 150)
                except Exception:
                    pass

        ScreenSnipper(self.root, img_path, on_complete=on_complete)

    def add_custom_button(self):
        dialog = tk.Toplevel(self.root)
        dialog.title("新しいボタンを追加")
        dialog.geometry("380x150")
        dialog.configure(bg="#1e1e24")
        dialog.attributes("-topmost", True)

        tk.Label(dialog, text="ボタンの名前（例: 次へ / Confirm）:", bg="#1e1e24", fg="white", font=("Meiryo", 10)).pack(pady=(12, 4), padx=16, anchor="w")
        name_entry = ttk.Entry(dialog, width=32)
        name_entry.pack(pady=4, padx=16)
        name_entry.focus()

        def confirm():
            name = name_entry.get().strip()
            if not name:
                return
            btn_id = f"btn_{int(time.time())}"
            filename = f"{btn_id}.png"
            new_btn = {
                "id": btn_id,
                "name": name,
                "file": filename,
                "enabled": True,
                "custom": True
            }
            self.settings["buttons"].append(new_btn)
            self.save_settings()
            self.refresh_buttons_list()
            dialog.destroy()
            self.start_recapture(new_btn)

        add_btn = ttk.Button(dialog, text="キャプチャに進む", command=confirm)
        add_btn.pack(pady=12)

    def delete_button(self, btn):
        if messagebox.askyesno("確認", f"「{btn['name']}」をリストから削除しますか？"):
            self.settings["buttons"] = [b for b in self.settings["buttons"] if b["id"] != btn["id"]]
            img_path = os.path.join(TEMPLATES_DIR, btn["file"])
            if os.path.exists(img_path):
                try:
                    os.remove(img_path)
                except Exception:
                    pass
            self.save_settings()
            self.refresh_buttons_list()
            self.log(f"「{btn['name']}」を削除しました。")

    def log(self, message):
        timestamp = time.strftime("%H:%M:%S")
        formatted = f"[{timestamp}] {message}\n"
        self.log_text.insert(tk.END, formatted)
        self.log_text.see(tk.END)

    def toggle_running(self):
        if self.is_running:
            self.stop_monitoring()
        else:
            self.start_monitoring()

    def start_monitoring(self):
        enabled_buttons = [b for b in self.settings["buttons"] if self.button_vars.get(b["id"], tk.BooleanVar()).get()]
        if not enabled_buttons:
            messagebox.showwarning("注意", "監視対象のボタンが1つも選択されていません。\nチェックを入れてから開始してください。")
            return

        self.is_running = True
        self.toggle_btn.config(text="■ 監視停止 (F9)", style="Stop.TButton")
        self.status_lbl.config(text="● 監視中 [稼働中]", fg="#22c55e")
        self.log("▶ 監視を開始しました。対象ボタンの出現を待機しています...")

        if self.sound_var.get():
            try:
                winsound.Beep(800, 100)
                winsound.Beep(1200, 100)
            except Exception:
                pass

        self.monitor_thread = threading.Thread(target=self.monitor_loop, daemon=True)
        self.monitor_thread.start()

    def stop_monitoring(self):
        self.is_running = False
        self.toggle_btn.config(text="▶ 監視スタート (F9)", style="Accent.TButton")
        self.status_lbl.config(text="● 停止中 [F9で開始]", fg="#ef4444")
        self.log("■ 監視を停止しました。")

        if self.sound_var.get():
            try:
                winsound.Beep(800, 150)
            except Exception:
                pass

    def start_hotkey_listener(self):
        def hotkey_loop():
            VK_F9 = 0x78
            while True:
                time.sleep(0.05)
                # Check if F9 is currently pressed
                state = bool(ctypes.windll.user32.GetAsyncKeyState(VK_F9) & 0x8000)
                if state and not self.last_f9_state:
                    # Key down edge
                    self.root.after(0, self.toggle_running)
                self.last_f9_state = state

        self.hotkey_thread = threading.Thread(target=hotkey_loop, daemon=True)
        self.hotkey_thread.start()

    def monitor_loop(self):
        while self.is_running:
            interval = max(0.2, self.interval_var.get())
            cooldown = max(0.5, self.cooldown_var.get())
            confidence = min(0.99, max(0.5, self.confidence_var.get()))

            # Collect active buttons
            active_buttons = [
                b for b in self.settings["buttons"]
                if self.button_vars.get(b["id"], tk.BooleanVar()).get()
            ]

            clicked = False
            for btn in active_buttons:
                if not self.is_running:
                    break
                img_path = os.path.join(TEMPLATES_DIR, btn["file"])
                if not os.path.exists(img_path):
                    continue

                try:
                    # locateCenterOnScreen using confidence (requires opencv)
                    location = pyautogui.locateCenterOnScreen(img_path, confidence=confidence)
                    if location:
                        # Avoid clicking self window
                        wx = self.root.winfo_x()
                        wy = self.root.winfo_y()
                        ww = self.root.winfo_width()
                        wh = self.root.winfo_height()
                        if wx <= location.x <= wx + ww and wy <= location.y <= wy + wh:
                            continue

                        # Perform Click
                        pyautogui.click(location.x, location.y)
                        msg = f"✔ 「{btn['name']}」をクリックしました (x={location.x}, y={location.y})"
                        self.root.after(0, self.log, msg)

                        if self.sound_var.get():
                            try:
                                winsound.Beep(1500, 80)
                            except Exception:
                                pass

                        clicked = True
                        # Enter cooldown to prevent rapid multi-clicks
                        time.sleep(cooldown)
                        break
                except Exception as e:
                    # Occasional pyscreeze / opencv exceptions on rapid screen updates
                    pass

            if not clicked:
                time.sleep(interval)

    def on_close(self):
        self.is_running = False
        self.save_settings()
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = AutoClickerApp(root)
    root.mainloop()
