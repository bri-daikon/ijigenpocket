window.addEventListener('DOMContentLoaded', () => {
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            const textA = document.getElementById('fileA').value;
            const textB = document.getElementById('fileB').value;
            const outputA = document.getElementById('outputA');
            const outputB = document.getElementById('outputB');
            const resultContainer = document.getElementById('resultContainer');

            if (!textA || !textB) {
                showMessage("両方のエリアにHTMLを入力してください。", "bg-red-100 text-red-700");
                return;
            }

            // 行ごとに比較を実行
            const diff = Diff.diffLines(textA, textB);
            
            outputA.innerHTML = '';
            outputB.innerHTML = '';
            let hasDifference = false;

            diff.forEach((part) => {
                const lines = part.value;
                const count = (lines.match(/\n/g) || []).length || (lines.length > 0 ? 1 : 0);

                if (part.removed) {
                    // 左側(A)に削除された内容を表示、右側(B)は空行で埋める
                    hasDifference = true;
                    appendContent(outputA, lines, 'diff-removed diff-removed-line');
                    appendPlaceholder(outputB, count);
                } else if (part.added) {
                    // 右側(B)に追加された内容を表示、左側(A)は空行で埋める
                    hasDifference = true;
                    appendPlaceholder(outputA, count);
                    appendContent(outputB, lines, 'diff-added diff-added-line');
                } else {
                    // 両方に共通する内容を表示
                    appendContent(outputA, lines, '');
                    appendContent(outputB, lines, '');
                }
            });

            resultContainer.classList.remove('hidden');
            if (hasDifference) {
                showMessage("違いが見つかりました。", "bg-green-100 text-green-700");
            } else {
                showMessage("内容は同一です。", "bg-blue-100 text-blue-700");
            }
        });
    }
});

// テキストを1行ずつ要素として追加する関数
function appendContent(container, text, className) {
    const lines = text.split('\n');
    // 最後の空要素を取り除く（diffライブラリの特性上）
    if (lines[lines.length - 1] === '') lines.pop();

    lines.forEach(line => {
        const div = document.createElement('div');
        div.className = 'diff-line ' + className;
        div.textContent = line || ' '; // 空行も維持
        container.appendChild(div);
    });
}

// 行を合わせるためのプレースホルダー（空行）を追加する関数
function appendPlaceholder(container, count) {
    for (let i = 0; i < count; i++) {
        const div = document.createElement('div');
        div.className = 'diff-line diff-placeholder';
        div.textContent = '.'; // 高さを維持するために透明な文字を入れる
        container.appendChild(div);
    }
}

function showMessage(msg, classes) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.className = `mt-4 p-4 rounded-lg text-center font-medium ${classes}`;
    messageBox.classList.remove('hidden');
}
