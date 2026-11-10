const fs = require('fs');

let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

// 1. Update saveNpcFromModal commands building
const oldSaveCommands = `  // Build commands
  const prefix = is7th ? "CC" : "CCB";
  let cmdLines = [];
  if (sanVal !== "-") cmdLines.push(\`\${prefix}<=\${sanVal} 【正気度ロール】\`);
  if (basicChecks.idea !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.idea} 【アイデア】\`);
  if (basicChecks.luck !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.luck} 【幸運】\`);
  if (basicChecks.know !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.know} 【知識】\`);

  validSkills.forEach(s => {
    cmdLines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
  });

  const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
  absOrder.forEach(k => {
    if (abilities[k] !== "-") {
      const v = is7th ? abilities[k] : abilities[k] * 5;
      cmdLines.push(\`\${prefix}<=\${v} 【\${k}\${is7th ? "" : "*5"}】\`);
    }
  });`;

const newSaveCommands = `  // Build commands
  const prefix = is7th ? "CC" : "CCB";
  let cmdLines = [];
  if (sanVal !== "-") cmdLines.push(\`\${prefix}<=\${sanVal} 【正気度ロール】\`);
  if (basicChecks.idea !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.idea} 【アイデア】\`);
  if (basicChecks.luck !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.luck} 【幸運】\`);
  if (basicChecks.know !== undefined) cmdLines.push(\`\${prefix}<=\${basicChecks.know} 【知識】\`);

  validSkills.forEach(s => {
    cmdLines.push(\`\${prefix}<=\${s.value} 【\${s.name}】\`);
  });

  const absOrder = ["STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"];
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

// 2. Update generateCcfoliaPieceJson to ensure commands contain //db = ...
const oldGenCommands = `  let commands = char.commands || "";
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

const newGenCommands = `  let commands = char.commands || "";
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
    if (!/(?:^|\\n)\s*\/\/\s*db\s*=/i.test(commands) && res.db !== undefined && res.db !== "-") {
      let cleanDb = String(res.db).trim();
      if (cleanDb.startsWith("+")) cleanDb = cleanDb.substring(1).trim();
      commands += (commands ? "\\n" : "") + \`//db = \${cleanDb}\`;
    }
  }`;

// Use regex with CRLF/LF flexibility for matching
const regexSaveCommands = /let cmdLines = \[\];[\s\S]*?absOrder\.forEach\(k => \{[\s\S]*?cmdLines\.push\(`\${prefix}<=\${v} 【\${k}\${is7th \? "" : "\*5"}】`\);\r?\n\s*\}\);/;

const regexGenCommands = /let commands = char\.commands \|\| "";[\s\S]*?commands = lines\.join\("\\n"\);\r?\n\s*\}/;

if (!regexSaveCommands.test(html)) {
  console.error("regexSaveCommands did not match!");
  process.exit(1);
}
if (!regexGenCommands.test(html)) {
  console.error("regexGenCommands did not match!");
  process.exit(1);
}

const saveMatch = html.match(regexSaveCommands)[0];
const newSaveMatch = saveMatch + `\n\n  // DB variable definition in commands (e.g. //db = 1D6 or //db = +1D4 or //db = 0)\n  if (dbVal !== undefined && dbVal !== "-") {\n    let cleanDb = String(dbVal).trim();\n    if (cleanDb.startsWith("+")) cleanDb = cleanDb.substring(1).trim();\n    cmdLines.push(\`//db = \${cleanDb}\`);\n  }`;

html = html.replace(regexSaveCommands, newSaveMatch);
html = html.replace(regexGenCommands, newGenCommands);

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully updated DB command generation in PdfEasyConverter.html');
