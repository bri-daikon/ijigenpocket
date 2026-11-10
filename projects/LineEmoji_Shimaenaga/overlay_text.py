import os
from PIL import Image, ImageDraw, ImageFont

def overlay_text(image_path, texts, output_path, font_path="C:\\Windows\\Fonts\\HGRSMP.TTF", font_size=36, text_color=(50, 50, 50), custom_offsets=None):
    if not os.path.exists(image_path):
        print(f"Error: {image_path} does not exist.")
        return

    # Load image and convert to RGBA
    img = Image.open(image_path).convert("RGBA")
    draw = ImageDraw.Draw(img)
    
    width, height = img.size
    print(f"Image size: {width}x{height}")
    cols = 4
    rows = 5
    cell_w = width / cols
    cell_h = height / rows
    
    # Load font
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        print(f"Warning: Font {font_path} not found. Falling back to default system font.")
        font = ImageFont.load_default()
        
    for idx, text in enumerate(texts):
        if idx >= cols * rows:
            break
            
        row = idx // cols
        col = idx % cols
        
        # Base center coordinates of the cell
        cx = col * cell_w + cell_w / 2
        cy = row * cell_h + cell_h / 2
        
        # Get offset for this cell
        x_offset = 30
        y_offset = -5
        if custom_offsets and idx < len(custom_offsets):
            x_offset, y_offset = custom_offsets[idx]
            
        tx = cx + x_offset
        ty = cy + y_offset
        
        # Split text into 2 lines (2 chars each)
        if len(text) >= 4:
            line1 = text[:2]
            line2 = text[2:]
        else:
            line1 = text
            line2 = ""
            
        # Draw text with custom centering using textbbox
        l1_bbox = draw.textbbox((0, 0), line1, font=font)
        l1_w = l1_bbox[2] - l1_bbox[0]
        l1_h = l1_bbox[3] - l1_bbox[1]
        l1_offset_x = l1_bbox[0]
        l1_offset_y = l1_bbox[1]
        
        if line2:
            l2_bbox = draw.textbbox((0, 0), line2, font=font)
            l2_w = l2_bbox[2] - l2_bbox[0]
            l2_h = l2_bbox[3] - l2_bbox[1]
            l2_offset_x = l2_bbox[0]
            l2_offset_y = l2_bbox[1]
            
            line_spacing = 2
            total_h = l1_h + l2_h + line_spacing
            
            cy1 = ty - total_h / 2
            cy2 = cy1 + l1_h + line_spacing
            
            x1 = tx - l1_w / 2 - l1_offset_x
            y1 = cy1 - l1_offset_y
            draw.text((x1, y1), line1, font=font, fill=text_color, stroke_width=2, stroke_fill=text_color)
            
            x2 = tx - l2_w / 2 - l2_offset_x
            y2 = cy2 - l2_offset_y
            draw.text((x2, y2), line2, font=font, fill=text_color, stroke_width=2, stroke_fill=text_color)
        else:
            x1 = tx - l1_w / 2 - l1_offset_x
            y1 = ty - l1_h / 2 - l1_offset_y
            draw.text((x1, y1), line1, font=font, fill=text_color, stroke_width=2, stroke_fill=text_color)
            
    img.save(output_path)
    print(f"Successfully saved text-overlayed image to {output_path}")

# Default text mappings for Vol 9
texts_1 = [
    "おはよー", "おやすみ", "ありがと", "おつかれ",
    "おねがい", "おっけー", "だめです", "ごめんね",
    "よろしく", "わーい！", "ぺこりー", "ばいばい",
    "それなー", "はーい！", "じーっ…", "えへへー",
    "なんで？", "がんばれ", "おめでと", "またねー"
]

texts_2 = [
    "びっくり", "はてな？", "すやすや", "るるるん",
    "ちらっ…", "むむむ？", "やったー", "ぷんぷん",
    "しくしく", "どやっ！", "にやり…", "はっっ！",
    "よいしょ", "ぼーっ…", "キリッ★", "うるうる",
    "もふもふ", "ちゅっ❤", "おーい！", "ぺこりっ"
]

offsets_1 = [
    (82, -12),   # 0: おはよー
    (66, -17),   # 1: おやすみ
    (30, 15),    # 2: ありがと
    (29, -12),   # 3: おつかれ
    (82, -22),   # 4: おねがい
    (66, -27),   # 5: おっけー
    (50, -2),    # 6: だめです
    (29, -22),   # 7: ごめんね
    (82, -22),   # 8: よろしく
    (66, -22),   # 9: わーい！
    (50, -22),   # 10: ぺこりー
    (29, -22),   # 11: ばいばい
    (82, -22),   # 12: それなー
    (66, -22),   # 13: はーい！
    (50, 0),     # 14: じーっ…
    (29, -22),   # 15: えへへー
    (82, -22),   # 16: なんで？
    (66, -37),   # 17: がんばれ
    (50, -22),   # 18: おめでと
    (29, -22)    # 19: またねー
]

offsets_2 = [
    (82, -12),   # 20: びっくり
    (66, -17),   # 21: はてな？
    (50, -17),   # 22: すやすや
    (29, -17),   # 23: るるるん
    (82, -17),   # 24: ちらっ…
    (66, -17),   # 25: むむむ？
    (40, -32),   # 26: やったー
    (29, -17),   # 27: ぷんぷん
    (82, -22),   # 28: しくしく
    (66, -22),   # 29: どやっ！
    (50, -22),   # 30: にやり…
    (29, -22),   # 31: はっっ！
    (50, -47),   # 32: よいしょ
    (66, -22),   # 33: ぼーっ…
    (50, -22),   # 34: キリッ★
    (29, -22),   # 35: うるうる
    (82, -22),   # 36: もふもふ
    (66, -22),   # 37: ちゅっ❤
    (50, -22),   # 38: おーい！
    (29, -22)    # 39: ぺこりっ
]

if __name__ == "__main__":
    # Process grid 1
    overlay_text(
        "C:\\Users\\hata-c\\.gemini\\antigravity-ide\\brain\\ea14a645-b8ee-437a-afdf-cc2b85f78177\\emoji_grid_serif_temp1_v3_1780616078389.png",
        texts_1,
        "y:\\ijigenpocket\\projects\\LineEmoji_Shimaenaga\\emoji_grid_serif_1.png",
        font_size=30,
        custom_offsets=offsets_1
    )
    
    # Process grid 2
    overlay_text(
        "C:\\Users\\hata-c\\.gemini\\antigravity-ide\\brain\\ea14a645-b8ee-437a-afdf-cc2b85f78177\\emoji_grid_serif_temp2_v3_1780616164556.png",
        texts_2,
        "y:\\ijigenpocket\\projects\\LineEmoji_Shimaenaga\\emoji_grid_serif_2.png",
        font_size=30,
        custom_offsets=offsets_2
    )


