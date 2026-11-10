import os
import tkinter as tk
from tkinter import messagebox
from PIL import ImageGrab

class ScreenSnipper:
    def __init__(self, parent, save_path, on_complete=None):
        self.parent = parent
        self.save_path = save_path
        self.on_complete = on_complete

        self.snip_window = tk.Toplevel(parent)
        self.snip_window.attributes("-fullscreen", True)
        self.snip_window.attributes("-alpha", 0.35)
        self.snip_window.attributes("-topmost", True)
        self.snip_window.config(cursor="cross")

        self.canvas = tk.Canvas(self.snip_window, cursor="cross", bg="grey10")
        self.canvas.pack(fill=tk.BOTH, expand=True)

        self.start_x = None
        self.start_y = None
        self.rect_id = None

        self.canvas.bind("<ButtonPress-1>", self.on_button_press)
        self.canvas.bind("<B1-Motion>", self.on_move_press)
        self.canvas.bind("<ButtonRelease-1>", self.on_button_release)
        self.snip_window.bind("<Escape>", lambda e: self.close())

        self.help_text = self.canvas.create_text(
            self.snip_window.winfo_screenwidth() // 2,
            50,
            text="登録したいボタンをマウスでドラッグして四角く囲んでください（ESCでキャンセル）",
            fill="white",
            font=("Meiryo", 14, "bold")
        )

    def on_button_press(self, event):
        self.start_x = self.snip_window.winfo_pointerx()
        self.start_y = self.snip_window.winfo_pointery()
        self.rect_id = self.canvas.create_rectangle(
            self.start_x, self.start_y, self.start_x, self.start_y,
            outline="#00ffcc", width=2
        )

    def on_move_press(self, event):
        cur_x = self.snip_window.winfo_pointerx()
        cur_y = self.snip_window.winfo_pointery()
        if self.rect_id:
            self.canvas.coords(self.rect_id, self.start_x, self.start_y, cur_x, cur_y)

    def on_button_release(self, event):
        end_x = self.snip_window.winfo_pointerx()
        end_y = self.snip_window.winfo_pointery()

        x1 = min(self.start_x, end_x)
        y1 = min(self.start_y, end_y)
        x2 = max(self.start_x, end_x)
        y2 = max(self.start_y, end_y)

        self.close()

        if (x2 - x1) < 8 or (y2 - y1) < 8:
            return

        # Hide main window briefly to ensure clean capture if needed
        self.parent.update_idletasks()
        try:
            bbox = (x1, y1, x2, y2)
            img = ImageGrab.grab(bbox=bbox)
            os.makedirs(os.path.dirname(self.save_path), exist_ok=True)
            img.save(self.save_path)
            if self.on_complete:
                self.on_complete(self.save_path)
        except Exception as e:
            messagebox.showerror("エラー", f"画像の保存に失敗しました: {e}")

    def close(self):
        if self.snip_window:
            self.snip_window.destroy()
            self.snip_window = None
