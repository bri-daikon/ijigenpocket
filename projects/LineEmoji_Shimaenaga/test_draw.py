from PIL import Image, ImageDraw, ImageFont

def test():
    img = Image.new("RGBA", (256, 256), "lightgreen")
    draw = ImageDraw.Draw(img)
    
    font_path = "C:\\Windows\\Fonts\\HGRSMP.TTF"
    font = ImageFont.truetype(font_path, 36)
    
    # Draw a cross at the center (128, 128)
    draw.line([(128, 0), (128, 256)], fill="red", width=1)
    draw.line([(0, 128), (256, 128)], fill="red", width=1)
    
    # Draw text at center
    text = "おは"
    bbox = draw.textbbox((0, 0), text, font=font)
    print(f"bbox: {bbox}")
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    offset_x = bbox[0]
    offset_y = bbox[1]
    
    tx = 128
    ty = 128
    x = tx - w/2 - offset_x
    y = ty - h/2 - offset_y
    
    draw.text((x, y), text, font=font, fill="black")
    
    # Also draw using anchor='mm' to compare
    draw.text((128, 64), "おは", font=font, fill="blue", anchor="mm")
    draw.line([(128, 64-10), (128, 64+10)], fill="blue", width=1)
    draw.line([(118, 64), (138, 64)], fill="blue", width=1)
    
    img.save("test_draw.png")
    print("Saved test_draw.png")

if __name__ == "__main__":
    test()
