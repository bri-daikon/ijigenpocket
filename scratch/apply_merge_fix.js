const fs = require('fs');

const filePath = 'y:/ijigenpocket/PdfEasyConverter.html';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update renderList(skipCaptureDrafts = false)
const oldRenderList = 'function renderList(){const root=document.getElementById("text-list");if(processedItems.length<=300){if(virtualCards.enabled){virtualCards.enabled=false;root.replaceChildren()}renderAllCards();return}captureVirtualDrafts();';
const newRenderList = 'function renderList(skipCaptureDrafts=false){const root=document.getElementById("text-list");if(processedItems.length<=300){if(virtualCards.enabled){virtualCards.enabled=false;root.replaceChildren()}renderAllCards();return}if(!skipCaptureDrafts){captureVirtualDrafts()}';

if (!content.includes(oldRenderList)) {
  console.error('Could not find oldRenderList');
  process.exit(1);
}
content = content.replace(oldRenderList, newRenderList);

// 2. Update mergeCardWithNext and mergeCardWithPrev and cancelEditCard and saveEditCard
const startTarget = 'function saveEditCard(id){';
const endTarget = 'function deleteCard(id){';

const startIdx = content.indexOf(startTarget);
const endIdx = content.indexOf(endTarget);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find merge functions range:', startIdx, endIdx);
  process.exit(1);
}

const newMergeSection = `function saveEditCard(id){const item=processedItems.find(i=>i.id===id);const ta=document.getElementById(\`edit-textarea-\${id}\`);if(item){saveHistoryState();if(ta&&item.text!==ta.value){item.text=ta.value;item.furiganaHtml=undefined}item.isEditing=false;delete item._editOriginal;delete item._mergedNextItem;delete item._mergedNextInsertIdx;renderList(true);if(kuroshiroEnabled&&!item.furiganaHtml){toggleFurigana()}saveToLocalStorage();showToast("保存完了","テキストを更新しました。","success")}}function cancelEditCard(id){const item=processedItems.find(i=>i.id===id);if(item){if(item._editOriginal!==undefined){item.text=item._editOriginal}if(item._editOriginalFurigana!==undefined){item.furiganaHtml=item._editOriginalFurigana;delete item._editOriginalFurigana}if(item._mergedNextItem!==undefined){const idx=processedItems.findIndex(i=>i.id===id);const insertAt=item._mergedNextInsertIdx!==undefined?item._mergedNextInsertIdx:idx+1;processedItems.splice(insertAt,0,item._mergedNextItem);delete item._mergedNextItem;delete item._mergedNextInsertIdx}item.isEditing=false;delete item._editOriginal;renderList(true);showToast("戻しました","編集をキャンセルしました。","info")}}function splitCardAtCursor(id){const item=processedItems.find(i=>i.id===id);const ta=document.getElementById(\`edit-textarea-\${id}\`);if(!item||!ta)return;const cursorPos=ta.selectionStart;const fullText=ta.value;const before=fullText.substring(0,cursorPos).trimEnd();const after=fullText.substring(cursorPos).trimStart();if(!before&&!after){showToast("分割不可","テキストが空です。","error");return}if(!before||!after){showToast("分割不可","分割後に空のカードが生まれます。カーソルをテキストの中間に置いてください。","error");return}saveHistoryState();const idx=processedItems.findIndex(i=>i.id===id);const newItem={id:globalId++,original:after,text:after,bookmarked:false,note:"",page:item.page,isEditing:false};item.text=before;item.furiganaHtml=undefined;item.isEditing=false;delete item._editOriginal;delete item._mergedNextItem;delete item._mergedNextInsertIdx;processedItems.splice(idx+1,0,newItem);renderList(true);if(kuroshiroEnabled){toggleFurigana()}saveToLocalStorage();showToast("分割完了","カードを分割しました。","success")}function mergeCardWithNext(id){const idx=processedItems.findIndex(i=>i.id===id);if(idx<0||idx>=processedItems.length-1){showToast("結合不可","次のカードがありません。","error");return}const ta=document.getElementById(\`edit-textarea-\${id}\`);const item=processedItems[idx];const nextItem=processedItems[idx+1];saveHistoryState();const currentText=ta?ta.value:item.text;if(item._editOriginal===undefined)item._editOriginal=currentText;if(item._editOriginalFurigana===undefined)item._editOriginalFurigana=item.furiganaHtml;item._mergedNextItem={...nextItem};item._mergedNextInsertIdx=idx+1;item.text=currentText+"\\n"+nextItem.text;item.furiganaHtml=undefined;item.isEditing=true;processedItems.splice(idx+1,1);const targetCard=document.querySelector(\`[data-id="\${item.id}"]\`);if(targetCard)targetCard._cachedHTML=null;const sourceCard=document.querySelector(\`[data-id="\${nextItem.id}"]\`);if(sourceCard)sourceCard.remove();renderList(true);const newTa=document.getElementById(\`edit-textarea-\${id}\`);if(newTa)newTa.focus();saveToLocalStorage();showToast("結合完了","次のカードと結合しました。「戻す」で復元できます。","success")}function mergeCardWithPrev(id){const idx=processedItems.findIndex(i=>i.id===id);if(idx<=0){showToast("結合不可","前のカードがありません。","error");return}const ta=document.getElementById(\`edit-textarea-\${id}\`);const item=processedItems[idx];const prevItem=processedItems[idx-1];saveHistoryState();const currentText=ta?ta.value:item.text;if(prevItem._editOriginal===undefined)prevItem._editOriginal=prevItem.text;if(prevItem._editOriginalFurigana===undefined)prevItem._editOriginalFurigana=prevItem.furiganaHtml;prevItem._mergedNextItem={...item};prevItem._mergedNextInsertIdx=idx;prevItem.text=prevItem.text+"\\n"+currentText;prevItem.furiganaHtml=undefined;prevItem.isEditing=true;processedItems.splice(idx,1);const targetCard=document.querySelector(\`[data-id="\${prevItem.id}"]\`);if(targetCard)targetCard._cachedHTML=null;const sourceCard=document.querySelector(\`[data-id="\${item.id}"]\`);if(sourceCard)sourceCard.remove();renderList(true);const newTa=document.getElementById(\`edit-textarea-\${prevItem.id}\`);if(newTa)newTa.focus();saveToLocalStorage();showToast("結合完了","前のカードと結合しました。","success")}`;

content = content.slice(0, startIdx) + newMergeSection + content.slice(endIdx);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated virtual scroll & merge behavior.');
