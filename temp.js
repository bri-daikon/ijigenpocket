
        // 選択された値を保持するステートオブジェクト
        const state = {
            tabMode: 'character', // 'character' or 'background'
            aiModel: 'sd',
            genMode: 'new',
            aspectRatio: '1:1',
            style: 'anime style',
            quality: 'high',
            gender: '',
            age: '',
            height: '',
            bodyType: '',
            hairLength: '',
            bangs: '',
            hairArrangement: '',
            hairColor: '',
            hairColorLightness: '',
            hairTexture: '',
            hairEffect: '',
            hairEffectColor: '',
            leftEyeColor: '',
            rightEyeColor: '',
            expression: '',
            facialHair: '',
            mole: '',
            accessory: '',
            nailColor: '',
            clothingColor: '',
            outfit: '',
            tops: '',
            bottoms: '',
            outerwear: '',
            shoes: '',
            framing: '',
            pose: '',
            background: 'simple background, white background',
            bgTime: '',
            bgWeather: '',
            bgLighting: '',
            bgSetting: '',
            bgCamera: ''
        };

        // 品質向上呪文
        const qualityPresets = {
            sd: { high: "masterpiece, best quality, high quality, high resolution, highly detailed", ultra: "masterpiece, best quality, high quality, high resolution, ultra-detailed, 8k wallpaper", none: "" },
            nai: { high: "{masterpiece}, {best quality}, high quality, high resolution, highly detailed", ultra: "{{masterpiece}}, {{best quality}}, high quality, high resolution, ultra detailed", none: "" },
            mj: { high: "high quality, high resolution, photorealistic, highly detailed", ultra: "high quality, high resolution, 8k, hyperrealistic, extremely detailed", none: "" },
            dalle: { high: "high quality, high resolution, detailed illustration", ultra: "high quality, high resolution, extremely detailed, masterpiece quality", none: "" },
            nanobanana: { high: "high quality, high resolution, highly detailed, sharp focus", ultra: "high quality, high resolution, masterpiece quality, extremely detailed, 8k resolution", none: "" }
        };

        // ネガティブプロンプト
        const negativePresets = {
            sd: "worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, normal quality, jpeg artifacts, signature, watermark, username, blurry",
            nai: "lowres, worst quality, low quality, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts",
            mj: "blur, low quality, distorted, extra limbs, bad anatomy, watermark",
            dalle: "Avoid blurry lines, bad anatomy, extra limbs, low resolution, or watermarks.",
            nanobanana: "blurry, low quality, bad anatomy, distorted hands, extra fingers, text, watermark, cropped"
        };

        // タブ切り替え
        function switchTab(mode) {
            state.tabMode = mode;
            
            const btnChar = document.getElementById('tabBtnCharacter');
            const btnBg = document.getElementById('tabBtnBackground');
            const contentChar = document.getElementById('characterTabContent');
            const contentBg = document.getElementById('backgroundTabContent');
            
            if (mode === 'character') {
                btnChar.className = "px-5 py-2.5 text-sm font-bold rounded-t-lg bg-indigo-600 text-white transition-colors";
                btnBg.className = "px-5 py-2.5 text-sm font-bold rounded-t-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors";
                
                contentChar.classList.remove('hidden');
                contentBg.classList.add('hidden');
            } else {
                btnBg.className = "px-5 py-2.5 text-sm font-bold rounded-t-lg bg-indigo-600 text-white transition-colors";
                btnChar.className = "px-5 py-2.5 text-sm font-bold rounded-t-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors";
                
                contentBg.classList.remove('hidden');
                contentChar.classList.add('hidden');
            }
            updatePrompts();
        }

        // プロンプト生成＆画面更新
        function updatePrompts() {
            const aiModel = state.aiModel;
            const genMode = state.genMode;
            const aspect = state.aspectRatio;
            const qualityLevel = state.quality;

            // AIモデルの表示更新
            const modelNames = { 
                sd: "Stable Diffusion", 
                mj: "Midjourney v6", 
                nai: "NovelAI", 
                dalle: "DALL-E 3 (Copilot)",
                nanobanana: "Nano Banana (Gemini)"
            };
            document.getElementById('modelTag').innerText = modelNames[aiModel];

            // 1. 各項目の選択値を集計 (英語)
            let terms = [];

            // クオリティ指定
            const qTag = qualityPresets[aiModel][qualityLevel];
            if (qTag) terms.push(qTag);

            // 画風 (共通)
            if (state.style) terms.push(state.style);
            
            // デフォルト基本指示 (文字なし・画像のみ)
            terms.push("no text, image only");
            if (state.tabMode === 'character') {
                terms.push("long legs");
            }

            // ★ 構図・カメラアングルを最優先で追加
            if (state.tabMode === 'character' && state.framing && state.framing.trim() !== '') {
                terms.push(state.framing.trim());
            } else if (state.tabMode === 'background' && state.bgCamera && state.bgCamera.trim() !== '') {
                terms.push(state.bgCamera.trim());
            }

            if (state.tabMode === 'character') {
                // 人物モード
                // 差分・着せ替えモード(ref)の場合は、服装や髪型を除外する
                if (genMode === 'ref') {
                    ['gender', 'age', 'height', 'bodyType'].forEach(key => {
                        if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                    });
                } else {
                    ['gender', 'age', 'height', 'bodyType', 'hairLength', 'bangs', 'sideBangs', 'hairArrangement', 'hairColor', 'hairColorLightness', 'hairTexture', 'hairEffect', 'hairEffectColor'].forEach(key => {
                        if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                    });
                }
                
                ['eyebrows', 'eyeShape'].forEach(key => {
                    if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                });

                const lEye = state.leftEyeColor;
                const rEye = state.rightEyeColor;
                if (lEye && rEye) {
                    if (lEye === rEye) terms.push(`${lEye} eyes`);
                    else terms.push(`heterochromia, left eye ${lEye}, right eye ${rEye}`);
                } else if (lEye) terms.push(`${lEye} eye`);
                else if (rEye) terms.push(`${rEye} eye`);

                if (genMode === 'ref') {
                    ['expression', 'pose', 'background'].forEach(key => {
                        if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                    });
                } else {
                    ['facialHair', 'mole', 'expression', 'accessory', 'nailColor', 'clothingColor', 'outfit', 'tops', 'outerwear', 'bottoms', 'shoes', 'pose', 'background'].forEach(key => {
                        if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                    });
                }
            } else {
                // 背景モード
                ['bgTime', 'bgWeather', 'bgLighting', 'bgSetting'].forEach(key => {
                    if (state[key] && state[key].trim() !== '') terms.push(state[key].trim());
                });
            }

            // 自由入力の追加
            let customInputId = state.tabMode === 'character' ? 'customInput' : 'bgCustomInput';
            const customInput = document.getElementById(customInputId);
            if (customInput && customInput.value.trim() !== '') {
                const val = customInput.value.trim();
                const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(val);
                if (!hasJapanese) {
                    terms.push(val);
                }
            }

            // 3. AIモデル ＆ モードごとの出力フォーマット調整
            let finalPositive = "";

            if (genMode === 'ref') {
                // キャラ維持・着せ替えモード
                if (aiModel === 'dalle' || aiModel === 'nanobanana') {
                    finalPositive = `Keep the character design (facial features, hair) from the uploaded image unchanged. Change the outfit, pose, or expression to: ${terms.join(', ')}. Aspect ratio: ${aspect}.`;
                } else if (aiModel === 'mj') {
                    finalPositive = `${terms.join(', ')} --cref [YOUR_IMAGE_URL] --ar ${aspect} --v 6.0`;
                } else {
                    finalPositive = `[Image-to-Image / Reference Mode] Same character as reference image, ${terms.join(', ')}`;
                }
            } else {
                // 新規作成モード
                if (aiModel === 'mj') {
                    finalPositive = terms.join(', ') + ` --ar ${aspect} --v 6.0`;
                } else if (aiModel === 'dalle') {
                    finalPositive = `A ${terms.join(', ')}. Format aspect ratio ${aspect}.`;
                } else if (aiModel === 'nanobanana') {
                    finalPositive = `Create an image of: ${terms.join(', ')}. Aspect ratio: ${aspect}.`;
                } else {
                    finalPositive = terms.join(', ');
                }
            }

            document.getElementById('positivePrompt').innerText = finalPositive;
            document.getElementById('negativePrompt').innerText = negativePresets[aiModel];

            // 4. 日本語解説プロンプトの作成
            const jpTerms = [];

            if (genMode === 'ref') {
                jpTerms.push(`【モード】🔄 元画像参照（キャラクター維持・着せ替え・差分）`);
            }
            jpTerms.push(`【基本設定】高画質・高品質、文字なし（画像のみ出力）`);

            // アクティブボタンのテキストを取得する関数
            const getActiveBtnText = (groupName) => {
       const group = document.querySelector(`[data-group="${groupName}"]`);
                if (!group) return '';
                const activeBtns = group.querySelectorAll('.chip-btn.active:not(.hidden)');
                if (activeBtns.length === 0) return '';
                return Array.from(activeBtns).map(btn => btn.innerText.trim()).join('・');
            };

            const styleJp = getActiveBtnText('style');
            if (styleJp) jpTerms.push(`【画風】${styleJp}`);

            if (state.tabMode === 'character') {
                const genderJp = getActiveBtnText('gender');
                const ageJp = getActiveBtnText('age');
                const heightJp = getActiveBtnText('height');
                const bodyJp = getActiveBtnText('bodyType');
                const personDetails = [genderJp, ageJp, heightJp, bodyJp, '足が長い'].filter(Boolean).join(' / ');
                if (personDetails) jpTerms.push(`【人物】${personDetails}`);

                const hairLengthJp = getActiveBtnText('hairLength');
                const bangsJp = getActiveBtnText('bangs');
                const sideBangsJp = getActiveBtnText('sideBangs');
                const arrJp = getActiveBtnText('hairArrangement');
                const hairColorJp = getActiveBtnText('hairColor');
                const hairColorLightnessJp = getActiveBtnText('hairColorLightness');
                const hairTextureJp = getActiveBtnText('hairTexture');
                const hairEffectJp = getActiveBtnText('hairEffect');
                const hairEffectColorJp = getActiveBtnText('hairEffectColor');
                
                const hairParts = [hairColorLightnessJp, hairColorJp, hairTextureJp, hairEffectJp, hairEffectColorJp, hairLengthJp, bangsJp, sideBangsJp, arrJp].filter(p => p && p !== '指定なし' && p !== 'なし');
                if (hairParts.length > 0 && genMode !== 'ref') {
                    jpTerms.push(`【髪】${hairParts.join(' / ')}`);
                }

                const eyebrowsJp = getActiveBtnText('eyebrows');
                if (eyebrowsJp) jpTerms.push(`【眉】${eyebrowsJp}`);
                const facialHairJp = getActiveBtnText('facialHair');
                if (facialHairJp && facialHairJp !== 'なし') jpTerms.push(`【髭】${facialHairJp}`);
                const moleJp = getActiveBtnText('mole');
                if (moleJp && moleJp !== 'なし') jpTerms.push(`【ほくろ】${moleJp}`);
                const eyeShapeJp = getActiveBtnText('eyeShape');
                const lEyeJp = getActiveBtnText('leftEyeColor');
                const rEyeJp = getActiveBtnText('rightEyeColor');
                if (lEyeJp && rEyeJp) {
                    const eyeStr = lEyeJp === rEyeJp ? lEyeJp : `オッドアイ (左:${lEyeJp} / 右:${rEyeJp})`;
                    if (eyeShapeJp) jpTerms.push(`【瞳】${eyeStr} / ${eyeShapeJp}`);
                    else jpTerms.push(`【瞳】${eyeStr}`);
                } else if (eyeShapeJp) {
                    jpTerms.push(`【瞳】${eyeShapeJp}`);
                }

                const expJp = getActiveBtnText('expression');
                if (expJp) jpTerms.push(`【表情】${expJp}`);

                if (genMode !== 'ref') {
                    const accJp = getActiveBtnText('accessory');
                    if (accJp && accJp !== 'なし') jpTerms.push(`【装飾】${accJp}`);

                    const nailJp = getActiveBtnText('nailColor');
                    if (nailJp && nailJp !== '指定なし') jpTerms.push(`【ネイル】${nailJp}`);

                    const clothingColorJp = getActiveBtnText('clothingColor');
                    const outfitJp = getActiveBtnText('outfit');
                    const topsJp = getActiveBtnText('tops');
                    const outerwearJp = getActiveBtnText('outerwear');
                    const bottomsJp = getActiveBtnText('bottoms');
                    const shoesJp = getActiveBtnText('shoes');
                    const outfitParts = [clothingColorJp, outfitJp, topsJp, outerwearJp, bottomsJp, shoesJp].filter(p => p && p !== '指定なし');
                    if (outfitParts.length > 0) {
                        jpTerms.push(`【服装】${outfitParts.join(' / ')}`);
                    }
                }

                const framingJp = getActiveBtnText('framing');
                if (framingJp) jpTerms.push(`【構図】${framingJp}`);

                const poseJp = getActiveBtnText('pose');
                if (poseJp) jpTerms.push(`【ポーズ】${poseJp}`);

                const bgJp = getActiveBtnText('background');
                if (bgJp) jpTerms.push(`【背景】${bgJp}`);

                if (customInput && customInput.value.trim() !== '') {
                    jpTerms.push(`【自由入力】${customInput.value.trim()}`);
                }
            } else {
                const timeJp = getActiveBtnText('bgTime');
                if (timeJp) jpTerms.push(`【時間帯】${timeJp}`);
                const weatherJp = getActiveBtnText('bgWeather');
                if (weatherJp) jpTerms.push(`【天気】${weatherJp}`);
                const lightingJp = getActiveBtnText('bgLighting');
                if (lightingJp) jpTerms.push(`【光源】${lightingJp}`);
                const settingJp = getActiveBtnText('bgSetting');
                if (settingJp) jpTerms.push(`【場所】${settingJp}`);
                const camJp = getActiveBtnText('bgCamera');
                if (camJp) jpTerms.push(`【画角】${camJp}`);
            }

            const aspectJp = getActiveBtnText('aspectRatio');
            if (aspectJp) jpTerms.push(`【アスペクト比】${aspectJp}`);

            document.getElementById('japanesePrompt').innerText = jpTerms.join('、 ');
        }

        // 翻訳機能
        async function translateAndApply(inputId, btnId) {
            const inputEl = document.getElementById(inputId);
            const btn = document.getElementById(btnId);
            const text = inputEl.value.trim();
            if (!text) return;
            
            const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
            
            if (hasJapanese) {
                const originalText = btn.innerText;
                btn.innerText = "⏳ 翻訳中...";
                btn.disabled = true;
                
                try {
                    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    let translatedText = '';
                    for(let i = 0; i < data[0].length; i++) {
                        if(data[0][i][0]) translatedText += data[0][i][0];
                    }
                    
                    inputEl.value = translatedText;
                    updatePrompts();
                } catch (e) {
                    alert("翻訳に失敗しました。英語で入力してください。");
                } finally {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } else {
                updatePrompts();
            }
        }

        // コピー機能
        function copyToClipboard(elementId, toastId) {
            const text = document.getElementById(elementId).innerText;
            if (!text) return;

            const temp = document.createElement('textarea');
            temp.value = text;
            document.body.appendChild(temp);
            temp.select();
            document.execCommand('copy');
            document.body.removeChild(temp);

            const toast = document.getElementById(toastId);
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 2000);
        }

        // 性別に応じてボタンの表示・非表示を切り替える関数
        function updateGenderOptions() {
            const currentGender = state.gender;
            let targetGender = 'all';

            if (currentGender.includes('female') || currentGender.includes('1girl')) {
                targetGender = 'female';
            } else if (currentGender.includes('male') || currentGender.includes('1boy')) {
                targetGender = 'male';
            }

            // data-gender属性を持つすべてのボタンを判定
            const genderSensitiveButtons = document.querySelectorAll('button[data-gender]');
            genderSensitiveButtons.forEach(btn => {
                const btnGender = btn.getAttribute('data-gender');
                
                // 表示条件：'all' または 選択中の性別と一致するか ('female'/'male')
                if (btnGender === 'all' || targetGender === 'all' || btnGender === targetGender) {
                    btn.classList.remove('hidden');
                } else {
                    btn.classList.add('hidden');

                    // 非表示になったボタンが現在アクティブだった場合、表示中のボタンへ切り替え
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        const group = btn.closest('[data-group]');
                        const groupName = group.getAttribute('data-group');
                        
                        // グループ内で表示されている最初のボタンをアクティブにする
                        const firstVisibleBtn = group.querySelector('button[data-gender]:not(.hidden), button:not([data-gender])');
                        if (firstVisibleBtn) {
                            firstVisibleBtn.classList.add('active');
                            state[groupName] = firstVisibleBtn.getAttribute('data-value');
                        }
                    }
                }
            });
        }

        function randomizeGroup(groupName) {
            const group = document.querySelector(`[data-group="${groupName}"]`);
            if (!group) return;
            const buttons = Array.from(group.querySelectorAll('.chip-btn')).filter(btn => !btn.classList.contains('hidden'));
            if (buttons.length > 0) {
                buttons.forEach(b => b.classList.remove('active'));
                const randomIdx = Math.floor(Math.random() * buttons.length);
                const btn = buttons[randomIdx];
                btn.classList.add('active');
                state[groupName] = btn.getAttribute('data-value') || '';
                if (groupName === 'gender') updateGenderOptions();
                updatePrompts();
            }
        }

        function randomizeAll(forceGender = null) {
            if (forceGender) {
                const genderGroup = document.querySelector('[data-group="gender"]');
                const genderBtns = Array.from(genderGroup.querySelectorAll('.chip-btn'));
                genderBtns.forEach(b => b.classList.remove('active'));
                const targetBtn = genderBtns.find(b => b.getAttribute('data-value') === forceGender);
                if (targetBtn) targetBtn.classList.add('active');
                state['gender'] = forceGender;
                updateGenderOptions();
            }

            const buttonGroups = document.querySelectorAll('[data-group]');
            buttonGroups.forEach(group => {
                const groupName = group.getAttribute('data-group');
                // ひげ、ほくろ、および基本設定系を除外（性別が固定されている場合は性別も除外）
                if (['facialHair', 'mole', 'aiModel', 'genMode'].includes(groupName)) return;
                if (forceGender && groupName === 'gender') return;

                // 現在表示されているボタンのみを対象とする
                const buttons = Array.from(group.querySelectorAll('.chip-btn')).filter(btn => !btn.classList.contains('hidden'));
                
                if (buttons.length > 0) {
                    buttons.forEach(b => b.classList.remove('active'));
                    const randomIdx = Math.floor(Math.random() * buttons.length);
                    const btn = buttons[randomIdx];
                    btn.classList.add('active');
                    
                    state[groupName] = btn.getAttribute('data-value') || '';
                }
            });
            // 性別等の依存関係を更新してからプロンプトを再構築
            updateGenderOptions();
            updatePrompts();
        }

        // APIキーの保存と読み込み
        function saveApiKey() {
            const key = document.getElementById('geminiApiKey').value.trim();
            if (key) {
                localStorage.setItem('geminiApiKey', key);
                const status = document.getElementById('apiKeyStatus');
                status.classList.remove('hidden');
                setTimeout(() => status.classList.add('hidden'), 2000);
            }
        }

        function loadApiKey() {
            const key = localStorage.getItem('geminiApiKey');
            if (key) {
                document.getElementById('geminiApiKey').value = key;
            }
        }

        // Gemini API呼び出し
        async function generateGeminiPrompt() {
            const apiKey = localStorage.getItem('geminiApiKey');
            if (!apiKey) {
                alert("Gemini APIキーを入力して保存してください。");
                return;
            }

            const currentTerms = document.getElementById('japanesePrompt').innerText;
            if (!currentTerms) {
                alert("先にプロンプトの要素を選択してください。");
                return;
            }

            const btn = document.getElementById('btnGenerateGemini');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>⏳</span> 生成中...';
            btn.disabled = true;

            const systemPrompt = `あなたはプロのAI画像生成プロンプトエンジニアです。
ユーザーが選択した要素（日本語のキーワード）を元に、画像生成AI（Stable DiffusionやMidjourney等）に最適化された高品質な英語プロンプトを作成してください。

出力形式:
以下のJSONフォーマットで出力してください。
{
  "positive": "英語のポジティブプロンプト",
  "negative": "英語のネガティブプロンプト"
}

プロンプト作成のルール:
1. positive は、被写体の詳細、表情、服装、ポーズ、背景、環境、照明、画風、クオリティ（masterpiece, best quality, highly detailed）などを論理的にカンマ区切りで構成してください。
2. negative は、低品質な要素（worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digit 等）や、指定された要素に反するものを除外するために記述してください。
3. 文法的に整った自然な英語、あるいはカンマ区切りのタグ形式で記述してください。
`;

            let success = false;
            let resultData = null;
            let lastErrorDetail = "接続タイムアウト、またはインターネットがオフラインです。";
            let retries = 5;
            let delayMs = 1000;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const payload = {
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{ text: "以下の要素から最適なプロンプトを作成してください:\n" + currentTerms }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    response_mime_type: "application/json"
                }
            };

            try {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (response.ok) {
                            resultData = await response.json();
                            success = true;
                            break;
                        } else {
                            try {
                                const errJson = await response.json();
                                if (errJson.error) {
                                    lastErrorDetail = `${errJson.error.message} (HTTP ${response.status})`;
                                } else {
                                    lastErrorDetail = `HTTP error! status: ${response.status}`;
                                }
                            } catch (e) {
                                lastErrorDetail = `HTTP error! status: ${response.status}`;
                            }
                            if (response.status === 429) {
                                lastErrorDetail += "\n(APIの利用制限に達した可能性があります。クオータを確認してください。)";
                            }
                        }
                    } catch (err) {
                        lastErrorDetail = `${err.message || err}`;
                    }
                    
                    if (!success) {
                        console.warn(`Gemini API attempt ${i+1} failed. Retrying in ${delayMs}ms... Error: ${lastErrorDetail}`);
                        await new Promise(resolve => setTimeout(resolve, delayMs));
                        delayMs *= 2;
                    }
                }

                if (!success || !resultData) {
                    throw new Error(lastErrorDetail);
                }

                let contentText = resultData.candidates[0].content.parts[0].text;
                
                // Fallback for parsing if json format is somehow wrapped in markdown
                contentText = contentText.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(contentText);

                document.getElementById('geminiOutputContainer').classList.remove('hidden');
                document.getElementById('geminiPosPrompt').innerText = parsed.positive;
                document.getElementById('geminiNegPrompt').innerText = parsed.negative;

            } catch (e) {
                console.error(e);
                alert("エラーが発生しました: " + e.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }

        // ボタンのクリックイベント（グループごとのアクティブ切り替え）
        window.onload = function() {
            loadApiKey();
            const buttonGroups = document.querySelectorAll('[data-group]');
            // DOMのアクティブなボタンからstateを初期化する
            buttonGroups.forEach(group => {
                const groupName = group.getAttribute('data-group');
                const isMulti = group.getAttribute('data-multi') === 'true';
                if (isMulti) {
                    const activeVals = Array.from(group.querySelectorAll('.chip-btn.active'))
                                            .map(b => b.getAttribute('data-value'))
                                            .filter(v => v);
                    state[groupName] = activeVals.join(', ');
                } else {
                    const activeBtn = group.querySelector('.chip-btn.active');
                    if (activeBtn) {
                        state[groupName] = activeBtn.getAttribute('data-value') || '';
                    } else {
                        state[groupName] = '';
                    }
                }
                
                // --- 各グループのヘッダーにカテゴリ別ランダムボタンを追加 ---
                const header = group.previousElementSibling;
                // 設定項目以外にカテゴリ別ランダムボタンを追加
                if (header && header.tagName === 'H2' && !['aiModel', 'genMode', 'aspectRatio', 'style'].includes(groupName)) {
                    header.classList.add('flex', 'items-center', 'justify-between');
                    const randBtn = document.createElement('button');
                    randBtn.type = 'button';
                    randBtn.className = 'text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-amber-400 border border-slate-600 transition shadow flex-shrink-0 ml-2 whitespace-nowrap';
                    randBtn.innerHTML = '🎲 ランダム';
                    randBtn.onclick = function() {
                        randomizeGroup(groupName);
                    };
                    header.appendChild(randBtn);
                }
            });

            buttonGroups.forEach(group => {
                const groupName = group.getAttribute('data-group');
                const buttons = group.querySelectorAll('.chip-btn');

                buttons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const isMulti = group.getAttribute('data-multi') === 'true';

                        if (isMulti) {
                            btn.classList.toggle('active');
                            const activeVals = Array.from(group.querySelectorAll('.chip-btn.active'))
                                .map(b => b.getAttribute('data-value'))
                                .filter(v => v);
                            state[groupName] = activeVals.join(', ');
                        } else {
                            buttons.forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            state[groupName] = btn.getAttribute('data-value');
                        }

                        // 性別が変更された場合は選択肢を更新
                        if (groupName === 'gender') {
                            updateGenderOptions();
                        }

                        updatePrompts();
                    });
                });
            });

            // 初回表示時のフィルタリング実行
            updateGenderOptions();
            updatePrompts();
        };
    