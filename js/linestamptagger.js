let resultsData = [];
let overallData = null;

// --- ★追加：自動保存と復元の機能★ ---
// ページ読み込み時に、ブラウザに保存された設定を復元する
document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('stampToolApiKey');
    const savedTagList = localStorage.getItem('stampToolTagList');
    
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
    if (savedTagList) {
        document.getElementById('tagList').value = savedTagList;
    }
});

// 入力内容が変わるたびに、ブラウザに自動保存する
document.getElementById('apiKey').addEventListener('input', (e) => {
    localStorage.setItem('stampToolApiKey', e.target.value.trim());
});
document.getElementById('tagList').addEventListener('input', (e) => {
    localStorage.setItem('stampToolTagList', e.target.value.trim());
});
// -------------------------------------

document.getElementById('startButton').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value.trim();
    const tagList = document.getElementById('tagList').value.trim();
    const fileInput = document.getElementById('imageFiles');
    const files = fileInput.files;

    if (!apiKey) { alert("APIキーを入力してください！"); return; }
    if (!tagList) { alert("タグ一覧を入力してください！"); return; }
    if (files.length === 0) { alert("スクショ画像を選択してください！"); return; }

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
        alert("選択したファイルに画像が見つかりませんでした。");
        return;
    }

    // 画面の初期化
    const startButton = document.getElementById('startButton');
    const statusDiv = document.getElementById('status');
    const progressText = document.getElementById('progressText');
    const resultTableBody = document.getElementById('resultTableBody');
    const downloadArea = document.getElementById('downloadArea');
    const overallInfoArea = document.getElementById('overallInfoArea');
    
    startButton.disabled = true;
    startButton.classList.add('opacity-50');
    statusDiv.classList.remove('hidden');
    statusDiv.classList.remove('text-red-600');
    statusDiv.classList.add('text-gray-600');
    downloadArea.classList.add('hidden');
    overallInfoArea.classList.add('hidden');
    resultTableBody.innerHTML = ''; 
    resultsData = []; 
    overallData = null;

    progressText.textContent = "AIに一括解析をお願いしています（数十秒かかる場合があります）...";

    try {
        // すべての画像をBase64に変換し、AIに送るパーツの配列を作成
        const imageParts = [];
        for (const file of imageFiles) {
            const base64Data = await fileToBase64(file);
            imageParts.push({
                inlineData: { mimeType: file.type, data: base64Data }
            });
        }

        // AIへの指示（プロンプト）
        // 画像内に並んでいるスタンプすべてを抽出し、全体タイトルと各タグを一気に出力させる
        const promptText = `あなたはプロのLINEスタンプクリエイターです。
添付された画像は、複数のLINEスタンプが一覧（グリッド状など）に並んでいるスクリーンショットです。
各スタンプには「01.png」「02.png」のような番号や文字が添えられています。

以下の処理を【1回でまとめて】行ってください。

1. 画像全体の雰囲気から、スタンプセット全体の魅力的な「タイトル」と「説明文」を作成する。
2. 画像内に見えている【すべてのスタンプ（例えば01から40など）を漏らさず】確認し、それぞれのスタンプの絵柄やセリフから、以下の【タグ一覧】から最も関連性の高いタグを【各スタンプにつき正確に9個以内】で選出する。

【全体設定の作成条件】
・英語タイトル（スペース含む40文字以内）
・英語説明文（スペース含む160文字以内）
・日本語タイトル（スペース含む40文字以内）
・日本語説明文（スペース含む160文字以内）

【タグ一覧】
${tagList}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: promptText },
                    ...imageParts // 変換した画像をすべて追加
                ]
            }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        overall_en_title: { type: "STRING" },
                        overall_en_description: { type: "STRING" },
                        overall_ja_title: { type: "STRING" },
                        overall_ja_description: { type: "STRING" },
                        stamps: {
                            type: "ARRAY",
                            description: "画像内に見つかった各スタンプのタグ情報（01から最後までもれなく）",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    number: { type: "STRING", description: "スタンプの番号。例: '01', '02', '40'" },
                                    tags: { type: "ARRAY", items: { type: "STRING" }, description: "選出したタグ（最大9個）" }
                                }
                            }
                        }
                    }
                }
            }
        };

        // AIを呼び出す（今回は1回で完結）
        const aiResult = await callGeminiWithRetry(apiKey, payload);
        const resultJSON = JSON.parse(aiResult.candidates[0].content.parts[0].text);

        // 全体情報を保存・表示
        overallData = {
            en_title: resultJSON.overall_en_title,
            en_description: resultJSON.overall_en_description,
            ja_title: resultJSON.overall_ja_title,
            ja_description: resultJSON.overall_ja_description
        };

        document.getElementById('overallJaTitle').textContent = overallData.ja_title || '';
        document.getElementById('overallJaDesc').textContent = overallData.ja_description || '';
        document.getElementById('overallEnTitle').textContent = overallData.en_title || '';
        document.getElementById('overallEnDesc').textContent = overallData.en_description || '';
        overallInfoArea.classList.remove('hidden');

        // 各スタンプのタグ情報を表示・保存
        // AIが番号順に出してくれない場合があるため、番号でソートする
        const sortedStamps = (resultJSON.stamps || []).sort((a, b) => {
            const numA = parseInt(a.number.replace(/\D/g, '') || 0);
            const numB = parseInt(b.number.replace(/\D/g, '') || 0);
            return numA - numB;
        });

        for (const stamp of sortedStamps) {
            // 番号を01, 02の形式に整える
            let cleanNumber = stamp.number.replace(/\D/g, '');
            if (cleanNumber) {
                cleanNumber = cleanNumber.padStart(2, '0');
            } else {
                cleanNumber = stamp.number;
            }

            const selectedTags = (stamp.tags || []).slice(0, 9);
            addResultToTable(cleanNumber, selectedTags);
            resultsData.push({ number: cleanNumber, tags: selectedTags });
        }

        statusDiv.textContent = `✨ 解析完了！ ${sortedStamps.length}個のスタンプデータを取得しました。下からデータを保存できます。`;
        downloadArea.classList.remove('hidden'); 

    } catch (error) {
        console.error("解析エラー:", error);
        statusDiv.classList.replace('text-gray-600', 'text-red-600');
        statusDiv.innerHTML = `⚠️ エラーが発生しました。<br><span class="text-sm font-normal">${error.message}</span>`;
    }

    startButton.disabled = false;
    startButton.classList.remove('opacity-50');
});

// === ダウンロード処理 ===
document.getElementById('downloadTagsCsv').addEventListener('click', () => {
    if (resultsData.length === 0) { alert("ダウンロードできるデータがありません。"); return; }
    let csvContent = "";
    resultsData.forEach(row => {
        if (row.tags && row.tags.length > 0) {
            csvContent += `${row.number},${row.tags.join(',')}\n`;
        }
    });
    downloadFile(csvContent, "stamp_tags.csv", 'text/csv;charset=utf-8;', false);
});

document.getElementById('downloadTextFile').addEventListener('click', () => {
    if (!overallData) { alert("保存できるタイトル・説明文がありません。"); return; }
    
    const txtContent = `【日本語設定】
タイトル (40文字以内):
${overallData.ja_title || ''}

説明文 (160文字以内):
${overallData.ja_description || ''}

--------------------------------------------------

【英語設定】
Title:
${overallData.en_title || ''}

Description:
${overallData.en_description || ''}
`;
    downloadFile(txtContent, "stamp_title_description.txt", 'text/plain;charset=utf-8;', true); 
});

function downloadFile(content, filename, type, useBom) {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blobParts = useBom ? [bom, content] : [content];
    const blob = new Blob(blobParts, { type: type });
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- 便利関数たち ---
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function callGeminiWithRetry(apiKey, payload, retries = 5) { 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const delays = [5000, 10000, 20000, 30000, 60000];

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                let errorDetail = "";
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.error ? errorData.error.message : response.statusText;
                } catch (e) {
                    errorDetail = response.statusText;
                }

                if ((response.status === 429 || response.status === 503 || response.status === 500) && i < retries - 1) {
                    let waitTime = delays[i];
                    const retryMatch = errorDetail.match(/retry in (\d+(?:\.\d+)?)s/i);
                    if (retryMatch) {
                        waitTime = Math.ceil(parseFloat(retryMatch[1])) * 1000 + 2000; 
                    }
                    
                    const progressText = document.getElementById('progressText');
                    if (progressText) {
                        progressText.textContent = `API混雑中。自動で ${Math.ceil(waitTime/1000)}秒 待機して再挑戦します... (${i+1}/${retries})`;
                    }
                    await new Promise(r => setTimeout(r, waitTime));
                    
                    if (progressText) {
                        progressText.textContent = "AIに一括解析をお願いしています（数十秒かかる場合があります）...";
                    }
                    continue; 
                }
                throw new Error(`エラーコード ${response.status}: ${errorDetail}`);
            }
            return await response.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, delays[i]));
        }
    }
}

function addResultToTable(stampNumber, tags) {
    const tbody = document.getElementById('resultTableBody');
    const tr = document.createElement('tr');
    tr.className = "border-b hover:bg-slate-50 transition-colors";
    
    tr.innerHTML = `
        <td class="py-3 px-4 text-center font-bold text-slate-700">${stampNumber}</td>
        <td class="py-3 px-4">
            <div class="flex flex-wrap gap-1.5">
                ${tags.map(tag => `<span class="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg border border-emerald-200/60 font-medium">${tag}</span>`).join('')}
                ${tags.length === 0 ? '<span class="text-slate-400 text-xs italic">タグが見つかりませんでした</span>' : ''}
            </div>
        </td>
    `;
    tbody.appendChild(tr);
}
