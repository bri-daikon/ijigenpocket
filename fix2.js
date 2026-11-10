const fs=require('fs');
let lines=fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8').split('\n');

const replaceStr =         const blocks = Array.from(outDiv.querySelectorAll('p, div:not([class])'));
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i];
            if (!block.parentNode) continue;
            
            const isBlockEmpty = block.innerHTML.trim() === '' || block.innerHTML === '<br>' || block.querySelector('img, table, div');
            if (isBlockEmpty) {
                if (block.innerHTML.trim() === '') block.innerHTML = '<br>';
                continue;
            }
            
            block.style.margin = '0';
            
            let next = block.nextElementSibling;
            
            while (next && (next.tagName === 'P' || (next.tagName === 'DIV' && !next.className))) {
                const isNextEmpty = next.innerHTML.trim() === '' || next.innerHTML === '<br>' || next.querySelector('img, table, div');
                if (isNextEmpty) {
                    if (next.innerHTML.trim() === '') next.innerHTML = '<br>';
                    break;
                }
                block.innerHTML += '<br>' + next.innerHTML;
                let toRemove = next;
                
                next = next.nextElementSibling;
                toRemove.remove();
            }
        };

let newLines1 = lines.slice(0, 643).join('\n') + '\n' + replaceStr + '\n' + lines.slice(676).join('\n');
fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', newLines1, 'utf8');

lines = fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8').split('\n');
let newLines2 = lines.slice(0, 2060).join('\n') + '\n' + replaceStr + '\n' + lines.slice(2093).join('\n');
fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', newLines2, 'utf8');

