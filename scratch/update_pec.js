const fs = require('fs');
let html = fs.readFileSync('y:/ijigenpocket/PdfEasyConverter.html', 'utf8');

const target1 = 'function downloadProjectFile(){if(processedItems.length===0&&explorerCharacters.length===0){showToast("お知らせ","保存するデータがありません。","info");return}const saveObj={version:"1.0",fileName:currentFileName,savedAt:(new Date).toISOString(),tabColorMapping:tabColorMapping,speakerNames:speakerNames,items:processedItems.map(item=>({id:item.id,original:item.original,text:item.text,bookmarked:item.bookmarked,note:item.note,page:item.page,furiganaHtml:item.furiganaHtml,color:item.color,tabName:item.tabName,charName:item.charName,isCommand:item.isCommand,isToc:item.isToc,tocLevel:item.tocLevel,tocName:item.tocName,isCollapsed:item.isCollapsed,isCopied:item.isCopied})),characters:explorerCharacters};';

const replacement1 = 'function downloadProjectFile(){if(processedItems.length===0&&explorerCharacters.length===0&&npcCharacters.length===0){showToast("お知らせ","保存するデータがありません。","info");return}const saveObj={version:"1.0",fileName:currentFileName,savedAt:(new Date).toISOString(),tabColorMapping:tabColorMapping,speakerNames:speakerNames,items:processedItems.map(item=>({id:item.id,original:item.original,text:item.text,bookmarked:item.bookmarked,note:item.note,page:item.page,furiganaHtml:item.furiganaHtml,color:item.color,tabName:item.tabName,charName:item.charName,isCommand:item.isCommand,isToc:item.isToc,tocLevel:item.tocLevel,tocName:item.tocName,isCollapsed:item.isCollapsed,isCopied:item.isCopied})),characters:explorerCharacters,npcs:npcCharacters};';

const target2 = 'if(Array.isArray(data.characters)){explorerCharacters=data.characters;renderExplorerCards()}processedItems=data.items';

const replacement2 = 'if(Array.isArray(data.characters)){explorerCharacters=data.characters;renderExplorerCards()}if(Array.isArray(data.npcs)){npcCharacters=data.npcs;renderNpcCards()}processedItems=(data.items||[])';

const target3 = '探索者${explorerCharacters.length}人を復元。';
const replacement3 = '探索者${explorerCharacters.length}人、NPC${npcCharacters.length}人を復元。';

if (!html.includes(target1)) {
  console.error('target1 not found');
  process.exit(1);
}
if (!html.includes(target2)) {
  console.error('target2 not found');
  process.exit(1);
}

html = html.replace(target1, replacement1);
html = html.replace(target2, replacement2);
html = html.replace(target3, replacement3);

fs.writeFileSync('y:/ijigenpocket/PdfEasyConverter.html', html, 'utf8');
console.log('Successfully updated PdfEasyConverter.html');
