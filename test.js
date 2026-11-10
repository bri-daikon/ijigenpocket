const { JSDOM } = require('jsdom');
const dom = new JSDOM();
const document = dom.window.document;
const html = '<div class="page"><p>Line 1</p> <p>Line 2</p></div>';
const outDiv = document.createElement('div');
outDiv.innerHTML = html;
const pTags = Array.from(outDiv.querySelectorAll('p'));
for (let i = 0; i < pTags.length; i++) {
    let p = pTags[i];
    if (!p.parentNode) continue;
    p.style.margin = '0';
    let next = p.nextSibling;
    while (next && next.nodeType === 3 && next.textContent.trim() === '') next = next.nextSibling;
    while (next && next.nodeType === 1 && next.tagName === 'P') {
        p.innerHTML += '<br>' + next.innerHTML;
        let toRemove = next;
        next = next.nextSibling;
        while (next && next.nodeType === 3 && next.textContent.trim() === '') next = next.nextSibling;
        toRemove.remove();
    }
}
console.log(outDiv.innerHTML);
