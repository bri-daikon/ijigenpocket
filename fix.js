const fs=require('fs');
let c=fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8');
const search =         const pTags = Array.from(outDiv.querySelectorAll('p'));
        for (let i = 0; i < pTags.length; i++) {
            let p = pTags[i];
            if (!p.parentNode) continue;
            
            const isPEmpty = p.innerHTML.trim() === '' || p.innerHTML === '<br>' || p.querySelector('img, table, div');
            if (isPEmpty) {
                if (p.innerHTML.trim() === '') p.innerHTML = '<br>';
                continue;
            }
            
            p.style.margin = '0';
            
            let next = p.nextSibling;
            while (next && next.nodeType === 3 && next.textContent.trim() === '') {
                next = next.nextSibling;
            }
            
            while (next && next.nodeType === 1 && next.tagName === 'P') {
                const isNextEmpty = next.innerHTML.trim() === '' || next.innerHTML === '<br>' || next.querySelector('img, table, div');
                if (isNextEmpty) {
                    if (next.innerHTML.trim() === '') next.innerHTML = '<br>';
                    break;
                }
                p.innerHTML += '<br>' + next.innerHTML;
                let toRemove = next;
                
                next = next.nextSibling;
                while (next && next.nodeType === 3 && next.textContent.trim() === '') {
                    next = next.nextSibling;
                }
                toRemove.remove();
            }
        };
const replace =         const blocks = Array.from(outDiv.querySelectorAll('p, div:not([class])'));
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
c = c.replace(search, replace).replace(search, replace);
fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', c, 'utf8');
