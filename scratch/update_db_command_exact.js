const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// Target 1: saveNpcFromModal commands
const target1 = `  const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
  absOrder.forEach(k => {
    if (abilities[k] !== "-") {
      const v = is7th ? abilities[k] : abilities[k] * 5;
      cmdLines.push(\`\${prefix}<=\${v} 【\${k}\${is7th ? "" : "*5"}】\`);
    }
  });`;

const replacement1 = `  const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
  absOrder.forEach(k => {
    if (abilities[k] !== "-") {
      const v = is7th ? abilities[k] : abilities[k] * 5;
      cmdLines.push(\`\${prefix}<=\${v} 【\${k}\${is7th ? "" : "*5"}】\`);
    }
  });

  // DB variable definition in commands (e.g. //db = 1D6 or //db = +1D4 or //db = 0)
  if (dbVal !== undefined && dbVal !== "-") {
    let cleanDb = String(dbVal).trim();
    if (cleanDb.startsWith("+")) cleanDb = cleanDb.substring(1).trim();
    cmdLines.push(\`//db = \${cleanDb}\`);
  }`;

// Target 2: generateCcfoliaPieceJson commands
const target2 = `  let commands = char.commands || "";
  if (!commands) {
    const prefix = char.is7th ? "CC" : "CCB";
    const lines = [];
    if (res.san !== undefined && res.san !== "-") lines.push(\`\${prefix}<=\${res.san} 【正気度ロール】\`);
    if (char.basicChecks?.idea) lines.push(\`\${prefix}<=\${char.basicChecks.idea} 【アイデア】\`);
    if (char.basicChecks?.luck) lines.push(\`\${prefix}<=\${char.basicChecks.luck} 【幸運】\`);
    if (char.basicChecks?.know) lines.push(\`\${prefix}<=\${char.basicChecks.know} 【知識】\`);
    if (Array.isArray(char.skills)) {
      char.skills.forEach(s => {
        lines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
      });
    }
    commands = lines.join("\\n");
  }`;

const replacement2 = `  let commands = char.commands || "";
  if (!commands) {
    const prefix = char.is7th ? "CC" : "CCB";
    const lines = [];
    if (res.san !== undefined && res.san !== "-") lines.push(\`\${prefix}<=\${res.san} 【正気度ロール】\`);
    if (char.basicChecks?.idea) lines.push(\`\${prefix}<=\${char.basicChecks.idea} 【アイデア】\`);
    if (char.basicChecks?.luck) lines.push(\`\${prefix}<=\${char.basicChecks.luck} 【幸運】\`);
    if (char.basicChecks?.know) lines.push(\`\${prefix}<=\${char.basicChecks.know} 【知識】\`);
    if (Array.isArray(char.skills)) {
      char.skills.forEach(s => {
        lines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
      });
    }
    const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
    absOrder.forEach(k => {
      if (abs[k] !== undefined && abs[k] !== "-") {
        const v = char.is7th ? abs[k] : Number(abs[k]) * 5;
        lines.push(\`\${prefix}<=\${v} 【\${k}\${char.is7th ? "" : "*5"}】\`);
      }
    });
    if (res.db !== undefined && res.db !== "-") {
      let cleanDb = String(res.db).trim();
      if (cleanDb.startsWith("+")) cleanDb = cleanDb.substring(1).trim();
      lines.push(\`//db = \${cleanDb}\`);
    }
    commands = lines.join("\\n");
  } else {
    // If commands exist but //db is not yet present and DB is valid, append //db
    if (!/(?:^|\\n)\\s*\\/\\/\\s*db\\s*=/i.test(commands) && res.db !== undefined && res.db !== "-") {
      let cleanDb = String(res.db).trim();
      if (cleanDb.startsWith("+")) cleanDb = cleanDb.substring(1).trim();
      commands += (commands ? "\\n" : "") + \`//db = \${cleanDb}\`;
    }
  }`;

// Normalize line endings for replacement
const normalizeLineEndings = (str) => str.replace(/\r\n/g, '\n');

html = normalizeLineEndings(html);
const normTarget1 = normalizeLineEndings(target1);
const normTarget2 = normalizeLineEndings(target2);

if (!html.includes(normTarget1)) {
  console.error("normTarget1 not found!");
  process.exit(1);
}
if (!html.includes(normTarget2)) {
  console.error("normTarget2 not found!");
  process.exit(1);
}

html = html.replace(normTarget1, normalizeLineEndings(replacement1));
html = html.replace(normTarget2, normalizeLineEndings(replacement2));

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully updated DB command in PdfEasyConverter.html');
