function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('⚔️ Battle Manager')
      .addItem('初期セットアップ', 'showSetupDialog')
      .addItem('サイドバーを開く', 'showSidebar')
      .addToUi();
}

function showSetupDialog() {
  var ui = SpreadsheetApp.getUi();
  var html = HtmlService.createHtmlOutputFromFile('Setup')
      .setWidth(300)
      .setHeight(250);
  ui.showModalDialog(html, 'バトルマネージャーの初期設定');
}

function setupBattle(numChars, numRounds) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();
  
  // Set header
  sheet.getRange(1, 1).setValue("キャラクター名").setFontWeight("bold").setBackground("#f3f4f6");
  for (var i = 1; i <= numRounds; i++) {
    sheet.getRange(1, i + 1).setValue(i + "Rd").setFontWeight("bold").setBackground("#f3f4f6").setHorizontalAlignment("center");
  }
  
  // Format character rows
  for (var i = 1; i <= numChars; i++) {
    sheet.getRange(i + 1, 1).setValue("キャラ" + i).setBackground("#ffffff").setFontWeight("bold");
  }
  
  // Resize columns
  sheet.setColumnWidth(1, 150);
  for (var i = 1; i <= numRounds; i++) {
    sheet.setColumnWidth(i + 1, 100);
  }
  
  // Add some borders
  var range = sheet.getRange(1, 1, parseInt(numChars) + 1, parseInt(numRounds) + 1);
  range.setBorder(true, true, true, true, true, true);
  
  return true;
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle('⚔️ Battle Manager')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getCharacters() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  // " └ " で始まる行は状態異常行として除外する
  var chars = [];
  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    var name = values[i][0].toString();
    if (name !== "" && !name.startsWith(" └ ")) {
      chars.push({ name: name, row: i + 2 });
    }
  }
  return chars;
}

function applyStatus(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  var charRow = parseInt(data.charRow);
  var startRd = parseInt(data.startRound);
  var endRd = parseInt(data.endRound);
  
  // Ensure start <= end
  if (startRd > endRd) {
    var temp = startRd;
    startRd = endRd;
    endRd = temp;
  }
  
  var categoryColors = {
    'status': '#94a3b8', // slate-400
    'buff': '#4ade80',   // green-400
    'debuff': '#f87171', // red-400
    'other': '#fbbf24'   // amber-400
  };
  
  var bgColor = categoryColors[data.category] || '#ffffff';
  
  // 状態を追加するために対象キャラクターのすぐ下に行を挿入
  sheet.insertRowAfter(charRow);
  var newRow = charRow + 1;
  
  // Set the category name in the first column as a sub-item
  sheet.getRange(newRow, 1).setValue(" └ " + data.content).setFontSize(10).setFontColor(bgColor).setFontWeight("bold");
  
  var startCol = startRd + 1;
  var numCols = endRd - startRd + 1;
  
  var range = sheet.getRange(newRow, startCol, 1, numCols);
  range.setBackground(bgColor);
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  
  // Put text in the first cell of the range
  sheet.getRange(newRow, startCol).setValue(data.content);
  
  // Merge the range so it looks like a continuous bar
  if (numCols > 1) {
    range.merge();
  }
  
  return true;
}
