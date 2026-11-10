const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'CcfoliaLayoutMaker.html');
const jsPath = path.join(__dirname, '..', 'js', 'ccfolialayoutmaker.js');

try {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  // JS内から document.getElementById(...) や document.getElementByIdElement(...) などを簡易抽出
  // または静的にチェックしたいID一覧を定義
  const idsToCheck = [
    'canvas-area', 'panel-list', 'panel-count', 'clear-frame-btn',
    'edit-frame-btn', 'replace-panel-upload', 'undo-action-btn',
    'frame-edit-modal', 'close-modal-btn', 'cancel-edit-btn',
    'save-edit-btn', 'frame-edit-canvas', 'tool-free', 'tool-rect',
    'tool-circle', 'apply-transparent-btn', 'undo-btn', 'reset-edit-btn',
    'canvas-size-select', 'grid-show-toggle', 'grid-snap-toggle',
    'zoom-in-btn', 'zoom-out-btn', 'zoom-fit-btn', 'size-display',
    'scale-display', 'canvas-wrapper', 'export-btn', 'frame-upload',
    'panel-upload'
  ];

  console.log('--- HTML IDs Verification ---');
  let missingCount = 0;
  idsToCheck.forEach(id => {
    // id="..." または id='...' を検索
    const regex = new RegExp(`id=["']${id}["']`);
    const hasId = regex.test(htmlContent);
    if (!hasId) {
      console.error(`Missing ID in HTML: ${id}`);
      missingCount++;
    } else {
      console.log(`OK: ${id}`);
    }
  });

  if (missingCount === 0) {
    console.log('All essential IDs exist in HTML!');
  } else {
    console.error(`Total missing IDs: ${missingCount}`);
  }

} catch (err) {
  console.error(err);
}
