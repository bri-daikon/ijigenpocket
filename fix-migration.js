const fs=require('fs');
let c=fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8');

const migrationScript = 
    // Word/HTML出力用の調整: 古い能力値グリッドを横一列のテキストに変換 (旧バージョンのキャラシ救済)
    tempDiv.querySelectorAll('.char-stats-grid').forEach(grid => {
        if (grid.tagName === 'DIV' || grid.tagName === 'TABLE') {
            const newContainer = document.createElement('div');
            newContainer.className = 'char-stats-container';
            newContainer.style.lineHeight = '2';
            
            const labels = ['STR', 'CON', 'POW', 'DEX', 'APP', 'SIZ', 'INT', 'EDU', 'SAN'];
            const inputs = grid.querySelectorAll('.char-stat-input');
            
            for (let i = 0; i < Math.min(labels.length, inputs.length); i++) {
                const input = inputs[i];
                let val = '0';
                if (input.tagName === 'INPUT') {
                    val = input.value || input.getAttribute('value') || '0';
                } else {
                    val = input.innerText || input.textContent || '0';
                }
                const span = document.createElement('span');
                span.style.whiteSpace = 'nowrap';
                span.style.marginRight = '12px';
                span.innerHTML = '<strong style="color:gray; font-size:10px;">' + labels[i] + ':</strong> <span style="font-weight:bold;">' + val + '</span>';
                newContainer.appendChild(span);
            }
            grid.parentNode.replaceChild(newContainer, grid);
        }
    });
;

// Insert into exportWord
c = c.replace(/tempDiv\.innerHTML = editor\.innerHTML;\n\n    \/\/ Word出力用の調整: 入力欄をテキストに変換/g, 
"tempDiv.innerHTML = editor.innerHTML;\n" + migrationScript + "\n    // Word出力用の調整: 入力欄をテキストに変換");

// Insert into exportHTML
c = c.replace(/tempDiv\.innerHTML = editor\.innerHTML;\n    const nodes = Array\.from\(tempDiv\.childNodes\);/g,
"tempDiv.innerHTML = editor.innerHTML;\n" + migrationScript + "\n    const nodes = Array.from(tempDiv.childNodes);");

fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', c, 'utf8');
console.log("Migration script injected into exportWord and exportHTML");
