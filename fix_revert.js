const fs=require('fs');
let content = fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8');
const search =         let htmlToAdd = node.nodeType === 1 ? node.outerHTML : node.textContent;
        // PタグをDIVタグに変換してコピー時の余分な改行を防ぐ
        if (node.nodeType === 1 && node.tagName === 'P') {
            htmlToAdd = htmlToAdd.replace(/^<p\\b[^>]*>/i, '<div style=\"min-height: 1em;\">').replace(/<\\/p>$/i, '</div>');
        }
        currentPageContent += htmlToAdd;;
const replace =         currentPageContent += node.nodeType === 1 ? node.outerHTML : node.textContent;;
content = content.replace(search, replace).replace(search, replace);
fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', content, 'utf8');
