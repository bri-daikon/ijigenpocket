const saveBtn = document.getElementById('saveBtn');
const canvas = document.getElementById('exportCanvas');
const ctx = canvas.getContext('2d');

const bodyLabels = ["めっちゃ太め", "太め", "やや太め", "普通", "やや細め", "細め", "めっちゃ細め"];
// 丸ゴシックフォント設定
const fontStr = '"Hiragino Maru Gothic ProN", "Rounded Mplus 1c", sans-serif';

saveBtn.addEventListener('click', async () => {
    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // 背景：オレンジ
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(0, 0, width, height);
    
    // 内側の白枠
    ctx.fillStyle = '#FFFFFF';
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(20, 20, width - 40, height - 40, 20);
        ctx.fill();
    } else {
        ctx.fillRect(20, 20, width - 40, height - 40);
    }

    const textStartX = 520;
    let currentY = 55; // 項目が増えたため、少し上に開始位置を調整

    // --- 全体の文字色をオレンジに設定 ---
    ctx.fillStyle = '#FF8C00';
    ctx.font = `bold 24px ${fontStr}`; // 収まりを良くするためフォントサイズを微調整

    const drawInfo = (label, val) => {
        ctx.fillText(`${label}：${val}`, textStartX, currentY);
        currentY += 38; // 行間を詰める
    };

    // 基本情報描画
    drawInfo("名前", document.getElementById('name').value || "未入力");
    drawInfo("誕生日", document.getElementById('birthday').value || "---");
    drawInfo("年齢", (document.getElementById('age').value || "---") + " 歳");
    drawInfo("身長", (document.getElementById('height').value || "---") + " cm");
    drawInfo("一人称", document.getElementById('pronoun').value || "---");
    
    const bIdx = parseInt(document.getElementById('bodyType').value) - 1;
    drawInfo("体型", bodyLabels[bIdx]);
    
    const genderVal = document.querySelector('input[name="gender"]:checked').value;
    drawInfo("性別", genderVal);

    const interestNodes = document.querySelectorAll('input[name="interest"]:checked');
    const interestList = Array.from(interestNodes).map(node => node.value);
    drawInfo("恋愛対象", interestList.length > 0 ? interestList.join(', ') : "未選択");

    currentY += 10; // 隙間

    // --- 特性スライダー (1行にまとめて描画) ---
    const sliders = document.querySelectorAll('.trait-slider');
    ctx.font = `bold 18px ${fontStr}`; // 特性はさらに少し小さめに
    
    sliders.forEach(slider => {
        const label = slider.getAttribute('data-label');
        const leftTxt = slider.getAttribute('data-left');
        const rightTxt = slider.getAttribute('data-right');
        const val = parseInt(slider.value);

        let bar = "";
        for(let i = 1; i <= 8; i++) {
            bar += (i <= val) ? "■" : "□";
        }

        ctx.fillText(`${label}　${leftTxt} ${bar} ${rightTxt}`, textStartX, currentY);
        currentY += 32; // 行間を固定して調整
    });

    // --- 顔画像 (アスペクト比を維持して全体を表示) ---
    const fileInput = document.getElementById('faceImage');
    const imgSize = 420;
    const imgX = 60;
    const imgY = (height - imgSize) / 2;

    if (fileInput.files && fileInput.files[0]) {
        const img = await loadImage(fileInput.files[0]);
        
        const scale = Math.min(imgSize / img.width, imgSize / img.height);
        const renderWidth = img.width * scale;
        const renderHeight = img.height * scale;
        
        const renderX = imgX + (imgSize - renderWidth) / 2;
        const renderY = imgY + (imgSize - renderHeight) / 2;

        ctx.save();
        ctx.fillStyle = '#F9F9F9';
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
        
        ctx.drawImage(img, renderX, renderY, renderWidth, renderHeight);
        
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 10;
        ctx.strokeRect(imgX, imgY, imgSize, imgSize);
        ctx.restore();
    } else {
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
        ctx.fillStyle = '#FF8C00';
        ctx.font = `24px ${fontStr}`;
        ctx.fillText('No Image', imgX + 155, imgY + 220);
    }

    // 保存処理
    const link = document.createElement('a');
    link.download = 'profile_entry_card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

function loadImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
