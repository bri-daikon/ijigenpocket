const fs=require('fs');
let c=fs.readFileSync('y:/ijigenpocket/js/kakerukun.js', 'utf8');

c = c.replace(/const str = stats\[0\]\.value \|\| '0';/g, "const str = (stats[0].value || stats[0].innerText || '0').trim();");
c = c.replace(/const con = stats\[1\]\.value \|\| '0';/g, "const con = (stats[1].value || stats[1].innerText || '0').trim();");
c = c.replace(/const pow = stats\[2\]\.value \|\| '0';/g, "const pow = (stats[2].value || stats[2].innerText || '0').trim();");
c = c.replace(/const dex = stats\[3\]\.value \|\| '0';/g, "const dex = (stats[3].value || stats[3].innerText || '0').trim();");
c = c.replace(/const app = stats\[4\]\.value \|\| '0';/g, "const app = (stats[4].value || stats[4].innerText || '0').trim();");
c = c.replace(/const siz = stats\[5\]\.value \|\| '0';/g, "const siz = (stats[5].value || stats[5].innerText || '0').trim();");
c = c.replace(/const int = stats\[6\]\.value \|\| '0';/g, "const int = (stats[6].value || stats[6].innerText || '0').trim();");
c = c.replace(/const edu = stats\[7\]\.value \|\| '0';/g, "const edu = (stats[7].value || stats[7].innerText || '0').trim();");
c = c.replace(/const san = stats\[8\]\.value \|\| '0';/g, "const san = (stats[8].value || stats[8].innerText || '0').trim();");

fs.writeFileSync('y:/ijigenpocket/js/kakerukun.js', c, 'utf8');
console.log("Replaced stats parsing logic");
