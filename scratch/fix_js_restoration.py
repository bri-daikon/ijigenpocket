import os

filepath = 'y:/ijigenpocket/js/ccfolialayoutmaker_ai.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_start = 'path: `<polygon points="40,20 20,60 60,60" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/><line x1="20" y1="60" x2="60" y2="60" stroke="#ff007f" stroke-width="2"/><path d="M36,35 L44,35 M40,31 L40,39" stroke="#00f0ff" stroke-width="1"/>`'

idx_start = content.find(target_start)
if idx_start == -1:
    print("Error: target_start not found!")
    exit(1)

# Find the start of the event handler
target_end = '// 依頼実行ハンドラ'
idx_end = content.find(target_end, idx_start)
if idx_end == -1:
    print("Error: target_end not found!")
    # Try alternate string just in case
    target_end = '// 依頼実行ハンドラ'
    idx_end = content.find(target_end, idx_start)
    if idx_end == -1:
        exit(1)

replacement = """path: `<polygon points="40,20 20,60 60,60" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linejoin="round"/><line x1="20" y1="60" x2="60" y2="60" stroke="#ff007f" stroke-width="2"/><path d="M36,35 L44,35 M40,31 L40,39" stroke="#00f0ff" stroke-width="1"/>`
  }
];

// テーマ別のSVG生成ロジック
const themeSvgGenerators = {
  cyberpunk: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#07080d"/>
  <rect width="100%" height="100%" fill="none" stroke="#00f0ff" stroke-width="0.5" opacity="0.1"/>
  <path d="M30,30 L200,30 L220,50 L1220,50 L1250,80 L1250,690" fill="none" stroke="#00f0ff" stroke-width="1.5" opacity="0.4"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
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
  <line x1="320" y1="36" x2="400" y2="36" stroke="#8a0c0c" stroke-width="1.5"/>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#141a14" fill-opacity="0.8" stroke="#d4af37" stroke-width="1.5" rx="2"/>
  <text x="90" y="22" font-family="'Georgia', serif" font-size="11" font-weight="bold" fill="#d4af37" text-anchor="middle" letter-spacing="2">${text.toUpperCase()}</text>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#141a14" fill-opacity="0.8" stroke="#d4af37" stroke-width="1.5"/>
  <g transform="translate(-2.5, -7.5)" stroke="#d4af37" stroke-width="1.8">
    ${pathString.replace(/#00f0ff/g, '#d4af37').replace(/#ff007f/g, '#0c100c')}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#d4af37" text-anchor="middle">${label}</text>
</svg>`
  },
  fantasy: {
    bg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#140827"/>
  <rect x="25" y="25" width="1230" height="670" fill="none" stroke="#7b68ee" stroke-width="1.5" opacity="0.4" rx="8"/>
</svg>`,
    window: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="#0d091a" fill-opacity="0.55" stroke="#7b68ee" stroke-width="2" rx="4"/>
  <text x="360" y="30" font-family="'Cinzel', serif" font-size="12" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="3">PORTAL</text>
</svg>`,
    pl: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200" viewBox="0 0 180 200">
  <rect x="4" y="4" width="172" height="192" fill="#0d091a" fill-opacity="0.6" stroke="#7b68ee" stroke-width="1.5" rx="4"/>
  <line x1="20" y1="140" x2="160" y2="140" stroke="#4b0082" stroke-width="1"/>
  <rect x="20" y="152" width="140" height="26" fill="#07040f" stroke="#7b68ee" stroke-width="1" rx="2"/>
  <text x="90" y="169" font-family="sans-serif" font-size="11" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="1">ADVENTURER</text>
</svg>`,
    menu: (text) => `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="36" viewBox="0 0 180 36">
  <rect x="2" y="2" width="176" height="32" fill="#0d091a" fill-opacity="0.8" stroke="#7b68ee" stroke-width="1.5" rx="3"/>
  <text x="95" y="22" font-family="sans-serif" font-size="11" font-weight="bold" fill="#7b68ee" text-anchor="middle" letter-spacing="2">${text.toUpperCase()}</text>
</svg>`,
    action: (label, sub, pathString) => `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="#0d091a" fill-opacity="0.8" stroke="#7b68ee" stroke-width="1.5"/>
  <g transform="translate(-2.5, -7.5)" stroke="#7b68ee" stroke-width="1.8">
    ${pathString.replace(/#00f0ff/g, '#7b68ee').replace(/#ff007f/g, '#0d091a')}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="#7b68ee" text-anchor="middle">${label}</text>
</svg>`
  },
  dynamic: {
    bg: (d) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg-grad-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${d.bg_gradient_start || '#07080d'}"/>
      <stop offset="100%" stop-color="${d.bg_gradient_end || '#121420'}"/>
    </linearGradient>
    <radialGradient id="glow-accent" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${d.accent_color || '#00f0ff'}" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg-grad-dyn)"/>
  <rect width="100%" height="100%" fill="url(#glow-accent)"/>
  <g stroke="${d.border_color || '#00f0ff'}" stroke-width="0.5" opacity="0.1">
    <path d="M0,40 L1280,40 M0,120 L1280,120 M0,200 L1280,200 M0,280 L1280,280 M0,360 L1280,360 M0,440 L1280,440 M0,520 L1280,520 M0,600 L1280,600 M0,680 L1280,680"/>
    <path d="M80,0 L80,720 M200,0 L200,720 M320,0 L320,720 M440,0 L440,720 M560,0 L560,720 M680,0 L680,720 M800,0 L800,720 M920,0 L920,720 M1040,0 L1040,720 M1160,0 L1160,720"/>
  </g>
  <path d="M30,30 L200,30 L220,50 L1220,50 L1250,80 L1250,690" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5" opacity="0.4"/>
  <path d="M1250,690 L1080,690 L1060,670 L60,670 L30,640 L30,30" fill="none" stroke="${d.accent_color || '#ff007f'}" stroke-width="1.5" opacity="0.4"/>
</svg>`,
    window: (d) => `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="405" viewBox="0 0 720 405">
  <rect x="5" y="5" width="710" height="395" fill="${d.panel_bg || '#06070c'}" fill-opacity="0.5" stroke="${d.border_color || '#7b68ee'}" stroke-width="2.5" rx="6"/>
  <text x="360" y="28" font-family="'Cinzel', serif" font-size="12" font-weight="bold" fill="${d.text_color || '#7b68ee'}" text-anchor="middle" letter-spacing="3">MONITOR</text>
</svg>`,
    pl: (d, w = 180, h = 200) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="${d.panel_bg || '#06070c'}" fill-opacity="0.6" stroke="${d.border_color || '#ff007f'}" stroke-width="1.5" rx="4"/>
  <path d="M4,18 L4,4 L18,4" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M${w - 4},18 L${w - 4},4 L${w - 18},4" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M4,${h - 18} L4,${h - 4} L18,${h - 4}" fill="none" stroke="${d.accent_color || '#00f0ff'}" stroke-width="2.5"/>
  <path d="M${w - 4},${h - 18} L${w - 4},${h - 4} L${w - 18},${h - 4}" fill="none" stroke="${d.border_color || '#00f0ff'}" stroke-width="2.5"/>
  <line x1="20" y1="${h - 70}" x2="${w - 20}" y2="${h - 70}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <line x1="20" y1="${h - 55}" x2="${w - 20}" y2="${h - 55}" stroke="#00f0ff" stroke-width="1" opacity="0.3"/>
  <rect x="15" y="${h - 40}" width="${w - 30}" height="26" fill="${d.panel_bg || '#111322'}" stroke="${d.border_color || '#ff007f'}" stroke-width="1" rx="2"/>
  <text x="${w / 2}" y="${h - 23}" font-family="sans-serif" font-size="11" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle">PC NAME</text>
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
      let processedPath = pathString
        .replace(/#00f0ff/g, strokeColor)
        .replace(/#ff007f/g, accentColor);
      
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="34" fill="${d.panel_bg || '#07080d'}" fill-opacity="0.8" stroke="${d.border_color || '#00f0ff'}" stroke-width="1.5"/>
  <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="${d.accent_color || '#ff007f'}" stroke-width="0.7" opacity="0.4"/>
  <g transform="translate(-2.5, -7.5)">
    ${processedPath}
  </g>
  <text x="37.5" y="64" font-family="sans-serif" font-size="10" font-weight="bold" fill="${d.text_color || '#00f0ff'}" text-anchor="middle">${label}</text>
</svg>`;
    }
  }
};


"""

# Replace in content
replaced_content = content[:idx_start] + replacement + content[idx_end:]

with open(filepath, 'w', encoding='utf-8', newline='') as f:
    f.write(replaced_content)

print("Restoration script successfully run and file updated!")
