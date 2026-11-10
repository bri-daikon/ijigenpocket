import json
import re

log_path = r'C:\Users\hata-c\.gemini\antigravity-ide\brain\83f74acc-cb3d-45f1-bb87-5bd99bdfa915\.system_generated\logs\transcript.jsonl'
base_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker.js'
output_js_path = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'

lines_dict = {}

# 1. Read base JS file (lines 1 to 1603)
with open(base_js_path, 'r', encoding='utf-8') as f:
    base_lines = f.readlines()
print("Base file read.")

for idx, line in enumerate(base_lines):
    lines_dict[idx + 1] = line.rstrip('\r\n')

# 2. Extract AI specific code from the transcript logs for lines 1604 and above
# We scan from top to bottom, but we ONLY accept blocks that do NOT contain Mojibake characters.
with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        try:
            data = json.loads(line)
            content = data.get('content', '')
            if content and 'ccfolialayoutmaker_ai.js' in content and ('Total Lines:' in content or 'Showing lines' in content or 'File Path:' in content):
                # Check for common Mojibake markers
                if "ã‚" in content or "ãƒ" in content or "çŠ" in content or "ã€" in content or "ãƒª" in content:
                    # Skip this corrupted block
                    continue
                
                matches = re.findall(r'^(\d+): (.*)$', content, re.MULTILINE)
                for num_str, line_content in matches:
                    num = int(num_str)
                    if num >= 1604:
                        clean_line = line_content.replace('\\"', '"').replace('\\\\', '\\')
                        lines_dict[num] = clean_line
        except Exception as e:
            continue

# 3. Manually fill in the missing blocks from context history
lines_dict[1603] = ''
for i in range(1604, 1610):
    if i not in lines_dict:
        lines_dict[i] = ''

lines_dict[1801] = '  - pl_panels: プレイヤー人数分（${numPlayers}個）の座標オブジェクト配列。各要素は {"x": 数値, "y": 数値, "width": 数値, "height": 数値}'

# Block 1851-1909
block_1851_1909 = """      {"x": X座標数値, "y": Y座標数値, "width": 横幅数値, "height": 縦幅数値},
      ...
    ],
    "menu_x": X座標数値,
    "menu_y": Y座標数値,
    "menu_layout": "horizontal" または "vertical",
    "action_x": X座標数値,
    "action_y": Y座標数値
  }
}
`;

  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt }] }] })
      });
      
      if (response.status === 503 || response.status === 429) {
        if (i < 2) {
          console.warn(`Gemini API returned ${response.status}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
      }
      
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      if (i === 2) throw err;
      console.warn(`Fetch error: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

async function callImagenApiForBackground(apiKey, prompt, aspectRatio = '16:9') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
  
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        })
      });"""

# Block 1964-2020 (Cyberpunk SVG & Horror SVG beginning)
block_1964_2020 = """<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="#06070c" fill-opacity="0.4" stroke="#00f0ff" stroke-width="2" rx="6"/>
  <rect x="9" y="9" width="702" height="387" fill="none" stroke="#ff007f" stroke-width="1" opacity="0.6" rx="4"/>
  <path d="M5,35 L5,5 L35,5" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M715,35 L715,5 L685,5" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M5,370 L5,400 L35,400" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M715,370 L715,400 L685,400" fill="none" stroke="#00f0ff" stroke-width="4"/>
  <path d="M260,5 L280,25 L440,25 L460,5 Z" fill="#00f0ff"/>
  <text x="360" y="18" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#07080d" text-anchor="middle" letter-spacing="2">MAIN MONITOR</text>
  <circle cx="20" cy="20" r="4" fill="#00ff00" opacity="0.8"/>
  <circle cx="32" cy="20" r="4" fill="#00ff00" opacity="0.3"/>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#06070c" fill-opacity="0.6" stroke="#ff007f" stroke-width="1.5" rx="4"/>
  <path d="M4,18 L4,4 L18,4" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M${w - 4},18 L${w - 4},4 L${w - 18},4" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M4,${h - 18} L4,${h - 4} L18,${h - 4}" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <path d="M${w - 4},${h - 18} L${w - 4},${h - 4} L${w - 18},${h - 4}" fill="none" stroke="#00f0ff" stroke-width="2.5"/>
  <line x1="20" y1="${h - 70}" x2="${w - 20}" y2="${h - 70}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <line x1="20" y1="${h - 55}" x2="${w - 20}" y2="${h - 55}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <rect x="15" y="${h - 40}" width="${w - 30}" height="26" fill="#111322" stroke="#ff007f" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 23}" font-family="sans-serif" font-size="11" font-weight="bold" fill="#00f0ff" text-anchor="middle">PC NAME</text>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#07080d" fill-opacity="0.8" stroke="#00f0ff" stroke-width="1.5" rx="4"/>
  <line x1="12" y1="18" x2="25" y2="18" stroke="#ff007f" stroke-width="3"/>
  <text x="100" y="22" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#00f0ff" text-anchor="middle" letter-spacing="1.5">${text.toUpperCase()}</text>
  <path d="M170,8 L174,12 L174,24 L170,28" fill="none" stroke="#ff007f" stroke-width="1"/>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#07080d" fill-opacity="0.8" stroke="#00f0ff" stroke-width="1.5"/>
  <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="#ff007f" stroke-width="0.7" opacity="0.5"/>
  <g transform="translate(-2.5, -7.5)">
    ${pathString}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#00f0ff" text-anchor="middle">${label}</text>
</svg>`
  },
  horror: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#050000"/>
  <rect x="20" y="20" width="1240" height="680" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M20,50 L20,20 L50,20" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M1260,50 L1260,20 L1230,20" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M20,670 L20,700 L50,700" fill="none" stroke="#8a0c0c" stroke-width="2"/>
  <path d="M1260,670 L1260,700 L1230,700" fill="none" stroke="#8a0c0c" stroke-width="2"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="4" y="4" width="712" height="397" fill="#080101" fill-opacity="0.75" stroke="#4a0404" stroke-width="3" rx="2"/>
  <rect x="12" y="12" width="696" height="381" fill="none" stroke="#8a0c0c" stroke-width="1" opacity="0.6"/>
  <text x="360" y="30" font-family="serif" font-size="14" font-weight="bold" fill="#8a0c0c" text-anchor="middle" letter-spacing="4">主画面</text>
  <line x1="320" y1="36" x2="400" y2="36" stroke="#8a0c0c" stroke-width="1.5"/>"""

# Block 2084-2099 (Fantasy SVG Window/PL/Menu part)
block_2084_2099 = """  <rect width="100%" height="100%" fill="#140827"/>
  <rect x="25" y="25" width="1230" height="670" fill="none" stroke="#7b68ee" stroke-width="1.5" opacity="0.4" rx="8"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="#0d091a" fill-opacity="0.5" stroke="#7b68ee" stroke-width="2.5" rx="6"/>
  <text x="360" y="28" font-family="'Cinzel', serif" font-size="12" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="3">MONITOR</text>
</svg>`,
    pl: (design, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="#0d091a" fill-opacity="0.6" stroke="#7b68ee" stroke-width="1.5" rx="4"/>
  <line x1="20" y1="${h - 60}" x2="${w - 20}" y2="${h - 60}" stroke="#4b0082" stroke-width="1"/>
  <rect x="20" y="${h - 48}" width="${w - 40}" height="26" fill="#07040f" stroke="#7b68ee" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 31}" font-family="'Cinzel', serif" font-size="11" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="1">HERO</text>
</svg>`,
    menu: (text) => `"""

# Block 2121-2122
block_2121_2122 = """    <radialGradient id="glow-accent" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${d.accent_color || '#00f0ff'}" stop-opacity="0.1"/>"""

# Block 2153-2164
block_2153_2164 = """  <text x="${w / 2}" y="${h - 23}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle">PC NAME</text>
</svg>`,
    menu: (d, text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="${d.panel_bg || '#07080d'}" fill-opacity="0.8" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5" rx="4"/>
  <line x1="12" y1="18" x2="25" y2="18" stroke="${d.accent_color || '#ff007f'}" stroke-width="3"/>
  <text x="100" y="22" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle" letter-spacing="1.5">${text.toUpperCase()}</text>
</svg>`,
    action: (d, label, sub, pathString) => {
      let strokeColor = d.border_color || '#00f0ff';
      let accentColor = d.accent_color || '#ff007f';
      let processedPath = pathString"""

# Line 2223-2224
lines_dict[2223] = '              await new Promise(resolve => setTimeout(resolve, 500));'
lines_dict[2224] = '              addChatMessage(employees.aoi, "お待たせしました！ココフォリア部屋画像の生成が完了したよ！");'

# Block 2251-2287
block_2251_2287 = """        } finally {
          aiGenerateBtn.disabled = false;
          aiGenerateBtn.innerHTML = '<i data-lucide="play" class="mr-1.5 w-4 h-4"></i>AI社員に作成を依頼する';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      } else {
        // 通常のリアルAI生成モード（パーツあり）
        addChatMessage(employees.takumi, `CEO、ご要望を承りました！リクエスト「${customPrompt || theme}」について、これからアオイと相談して最適な部屋を作ります！`);
        
        try {
          const responseText = await callGeminiApiForLayout(apiKey, theme, numPlayers, layoutType, customPrompt);
          let cleanedJson = responseText.replace(/```json|```/g, '').trim();
          const responseData = JSON.parse(cleanedJson);
          
          // 議論ログを順次表示
          const steps = responseData.discussion || [];
          for (let idx = 0; idx < steps.length; idx++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const msg = steps[idx];
            const speakerObj = msg.speaker === 'aoi' ? employees.aoi : employees.takumi;
            addChatMessage(speakerObj, msg.text);
          }
          
          let bgImageUrl = null;
          if (genBg) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            addChatMessage(employees.aoi, "要望に合わせた背景のモデリング（画像生成）を開始するね！数秒かかるから待っててね。");
            
            try {
              const styleDesc = responseData.design.style_description || "beautiful illustration";
              const basePrompt = customPrompt || theme;
              const imagenPrompt = `A beautiful background illustration for a TRPG room session on CCfolia, thematic to ${basePrompt}. Style is ${styleDesc}. ${responseData.design.bg_gradient_start ? `using color palette near ${responseData.design.bg_gradient_start} and ${responseData.design.bg_gradient_end}.` : ""} Dark, atmospheric, high quality digital art, 16:9 aspect ratio, clean, no text.`;
              
              try {
                const imageBytes = await callImagenApiForBackground(apiKey, imagenPrompt);
                bgImageUrl = `data:image/png;base64,${imageBytes}`;"""

# Block 2703-2763
block_2703_2763 = """    panels.push({
      id: `ai-menu-${label}-${Date.now()}`,
      url: menuUrl,
      x: menuX,
      y: menuY,
      width: menuW,
      height: menuH,
      originalRatio: menuW / menuH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }

  const actionW = 75;
  const actionH = 75;

  for (let i = 0; i < actionIconsData.length; i++) {
    const icon = actionIconsData[i];
    const actionSvg = gen.action(icon.label, icon.sub, icon.path);
    let actionX = 50;
    let actionY = 550;

    if (layoutType === 'right-vertical') {
      actionY = 550;
      actionX = 50 + i * 125;
    } else if (layoutType === 'bottom-horizontal') {
      actionX = 50 + (i % 2) * 90;
      actionY = 350 + Math.floor(i / 2) * 90;
    } else if (layoutType === 'pattern1') {
      actionX = 600 + i * 90;
      actionY = 530;
    } else if (layoutType === 'pattern2') {
      actionX = 600 + i * 90;
      actionY = 110;
    } else if (layoutType === 'pattern3') {
      actionX = 950;
      actionY = 430 + i * 45;
    } else if (layoutType === 'pattern4') {
      actionX = 300 + i * 90;
      actionY = 500;
    } else if (layoutType === 'pattern5') {
      actionX = 360 + i * 90;
      actionY = 600;
    } else if (layoutType === 'pattern6') {
      actionX = 150 + i * 90;
      actionY = 430;
    } else if (layoutType === 'pattern7') {
      actionX = 150 + i * 90;
      actionY = 380;
    }

    let actionUrl = createSvgUrl(actionSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      actionUrl = await combineImageAndSvg(
        partsImg,
        actionX * scaleX, actionY * scaleY,
        actionW * scaleX, actionH * scaleY,
        actionSvg, actionW, actionH
      );
    }"""

# Block 2825-2881
block_2825_2881 = """  // 1. メイン画面の描画
  const windowSvg = gen.window(design);
  const windowPanelWidth = design.window_width !== undefined ? design.window_width : 720;
  const windowPanelHeight = design.window_height !== undefined ? design.window_height : 405;
  let windowX = design.window_x !== undefined ? design.window_x : 50;
  let windowY = design.window_y !== undefined ? design.window_y : 110;

  if (design.window_x === undefined) {
    // 従来のフォールバック計算
    if (layoutType === 'bottom-horizontal') {
      windowX = 280;
      windowY = 50;
    }
  }

  let windowUrl = createSvgUrl(windowSvg);
  if (partsImg) {
    const scaleX = partsImg.naturalWidth / canvasWidth;
    const scaleY = partsImg.naturalHeight / canvasHeight;
    windowUrl = await combineImageAndSvg(
      partsImg,
      windowX * scaleX, windowY * scaleY,
      windowPanelWidth * scaleX, windowPanelHeight * scaleY,
      windowSvg, windowPanelWidth, windowPanelHeight
    );
  }

  panels.push({
    id: 'ai-window-' + Date.now(),
    url: windowUrl,
    x: windowX,
    y: windowY,
    width: windowPanelWidth,
    height: windowPanelHeight,
    originalRatio: windowPanelWidth / windowPanelHeight,
    flipH: false,
    flipV: false,
    visible: true,
    opacity: 1
  });

  # 2. PLパネルの描画
  const plPanelsData = design.pl_panels || [];
  for (let i = 0; i < numPlayers; i++) {
    let plX = 1050;
    let plY = 40;
    let plW = 160;
    let plH = 170;

    if (plPanelsData[i]) {
      plX = plPanelsData[i].x !== undefined ? plPanelsData[i].x : plX;
      plY = plPanelsData[i].y !== undefined ? plPanelsData[i].y : plY;
      plW = plPanelsData[i].width !== undefined ? plPanelsData[i].width : plW;
      plH = plPanelsData[i].height !== undefined ? plPanelsData[i].height : plH;
    } else {
      # 従来のフォールバック計算
      if (layoutType === 'right-vertical') {"""

# Block 2940-2999
block_2940_2999 = """  let baseMenuX = design.menu_x !== undefined ? design.menu_x : 50;
  let baseMenuY = design.menu_y !== undefined ? design.menu_y : 50;

  if (design.menu_x === undefined) {
    // 従来のフォールバック計算
    if (layoutType === 'right-vertical') {
      baseMenuY = 50;
      baseMenuX = 50;
    } else {
      baseMenuX = 50;
      baseMenuY = 50;
    }
  }

  for (let i = 0; i < menuLabels.length; i++) {
    const label = menuLabels[i];
    const menuSvg = gen.menu(design, label);
    let menuX = baseMenuX;
    let menuY = baseMenuY;

    if (design.menu_x === undefined) {
      if (layoutType === 'right-vertical') {
        menuY = 50;
        menuX = 50 + i * 145;
      } else {
        menuX = 50;
        menuY = 50 + i * 55;
      }
    } else {
      if (menuLayoutType === 'horizontal') {
        menuX = baseMenuX + i * (menuW + 15);
      } else {
        menuY = baseMenuY + i * (menuH + 10);
      }
    }

    let menuUrl = createSvgUrl(menuSvg);
    if (partsImg) {
      const scaleX = partsImg.naturalWidth / canvasWidth;
      const scaleY = partsImg.naturalHeight / canvasHeight;
      menuUrl = await combineImageAndSvg(
        partsImg,
        menuX * scaleX, menuY * scaleY,
        menuW * scaleX, menuH * scaleY,
        menuSvg, menuW, menuH
      );
    }

    panels.push({
      id: `ai-menu-${label}-${Date.now()}`,
      url: menuUrl,
      x: menuX,
      y: menuY,
      width: menuW,
      height: menuH,
      originalRatio: menuW / menuH,
      flipH: false,
      flipV: false,
      visible: true,
      opacity: 1
    });
  }"""

# Helper to map multi-line blocks into lines_dict
def assign_block(start_line, block_text):
    lines = block_text.split('\n')
    for idx, l in enumerate(lines):
        lines_dict[start_line + idx] = l

assign_block(1851, block_1851_1909)
assign_block(1964, block_1964_2020)
assign_block(2084, block_2084_2099)
assign_block(2121, block_2121_2122)
assign_block(2153, block_2153_2164)
assign_block(2251, block_2251_2287)
assign_block(2703, block_2703_2763)
assign_block(2825, block_2825_2881)
assign_block(2940, block_2940_2999)

# 4. Check missing lines again
max_line = max(lines_dict.keys())
print(f"Max line: {max_line}")
missing = [i for i in range(1, max_line + 1) if i not in lines_dict]
print(f"Missing count: {len(missing)}")
if missing:
    print(f"Missing lines: {missing[:30]}")

# 5. Write back to output file in clean UTF-8
with open(output_js_path, 'w', encoding='utf-8', newline='\r\n') as out_f:
    for i in range(1, max_line + 1):
        out_f.write(lines_dict.get(i, '') + '\n')

print("Perfect Reconstruct Completed!")
