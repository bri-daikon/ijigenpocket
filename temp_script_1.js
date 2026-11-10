
        // カラーテーマ定義
        const colorThemes = {
            indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
            rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337' },
            emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
            amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' },
            sky: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' },
            violet: { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
            fuchsia: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75' },
            teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
            orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' },
            slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
        };

        function applyColorTheme(themeName) {
            const theme = colorThemes[themeName] || colorThemes['indigo'];
            const root = document.documentElement;
            for (const [key, value] of Object.entries(theme)) {
                root.style.setProperty(`--color-primary-${key}`, value);
            }
        }

        function formatImageUrl(url) {
            if (!url) return "";
            const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
            const match = url.match(driveRegex);
            if (match && match[1]) {
                return `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
            return url;
        }

        // 画像URLフォーマッター (Google Drive対応)
        function formatImageUrl(url) {
            if (!url) return "";
            // Google Driveの共有リンクを画像リンクに変換
            const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
            const match = url.match(driveRegex);
            if (match && match[1]) {
                // サムネイル用URL。※ファイルの共有設定が「リンクを知っている全員」になっている必要があります
                return `https://drive.google.com/uc?export=view&id=${match[1]}`;
            }
            return url;
        }

        // デフォルトサンプルデータ
        const DEFAULT_QUIZ = {
            id: "default-1",
            title: "あなたの性格タイプ診断",
            description: "直感で質問に答えて、あなたの隠されたタイプをチェックしよう！",
            scoringMode: "sum",
            themeColor: "indigo",
            questions: [
                {
                    text: "休日、予定がないときはどう過ごすことが多い？",
                    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=60",
                    options: [
                        { text: "1日中家でゆっくり読書・動画鑑賞", score: 3 },
                        { text: "趣味の制作や勉強に没頭する", score: 2 },
                        { text: "気まぐれで近所を散歩する", score: 1 },
                        { text: "友達に連絡して出かける", score: 0 },
                        { text: "イベントやパーティーを自分で企画する", score: 0 }
                    ]
                },
                {
                    text: "直感で惹かれる場所はどこ？",
                    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=60",
                    options: [
                        { text: "静寂な森の中のライブラリー", score: 3 },
                        { text: "最先端テクノロジーのラボ", score: 2 },
                        { text: "波音が聞こえる静かなビーチ", score: 1 },
                        { text: "賑やかな夜のテーマパーク", score: 0 },
                        { text: "みんなが集まるフェスティバル", score: 0 }
                    ]
                }
            ],
            results: [
                {
                    minScore: 0,
                    maxScore: 2,
                    title: "【情熱のアクティビスト】",
                    description: "高い行動力とエネルギーを持つタイプ。考えるよりもまず行動を起こし、周りをポジティブな風で巻き込んでいきます。"
                },
                {
                    minScore: 3,
                    maxScore: 4,
                    title: "【バランス重視のナビゲーター】",
                    description: "状況に合わせて柔軟に対応できるバランス派。周囲の意見を優しく聴き入れる頼れる存在です。"
                },
                {
                    minScore: 5,
                    maxScore: 6,
                    title: "【静かな思索家（アナリスト）】",
                    description: "深い観察力と豊かな内心世界を持つタイプ。一人で静かに物事を探求することで真価を発揮します。"
                }
            ]
        };

        // アプリ状態管理
        let quizList = [];
        let currentQuizId = "";
        let currentQuiz = null;
        let currentQuestionIndex = 0;
        let userScore = 0;
        let targetScores = {};
        let currentResult = null;
        let currentUser = null;

        // 初期化処理
        window.addEventListener("DOMContentLoaded", () => {
            if (window.firebaseApp) {
                window.firebaseApp.onAuthStateChanged(window.firebaseApp.auth, async (user) => {
                    currentUser = user;
                    updateAuthUI();
                    await loadAllQuizData();
                    checkUrlParameter();
                    renderHeader();
                    renderHome();
                    updateSettingsVisibility();
                });
            } else {
                // Firebaseが読み込めなかった場合フォールバック
                loadAllQuizData().then(() => {
                    checkUrlParameter();
                    renderHeader();
                    renderHome();
                });
            }
        });

        // データの読み込み・クラウドから取得
        async function loadAllQuizData() {
            if (!window.firebaseApp) return;
            const { db, collection, getDocs } = window.firebaseApp;
            
            try {
                const querySnapshot = await getDocs(collection(db, "quizzes"));
                const loadedQuizzes = [];
                querySnapshot.forEach((doc) => {
                    loadedQuizzes.push(doc.data());
                });

                if (loadedQuizzes.length > 0) {
                    quizList = loadedQuizzes;
                } else {
                    quizList = [JSON.parse(JSON.stringify(DEFAULT_QUIZ))];
                }
            } catch (err) {
                console.error("Firestore loading error:", err);
                quizList = [JSON.parse(JSON.stringify(DEFAULT_QUIZ))];
            }

            const savedCurrentId = localStorage.getItem("shindan_maker_current_id");
            if (savedCurrentId && quizList.some(q => q.id === savedCurrentId)) {
                currentQuizId = savedCurrentId;
            } else {
                currentQuizId = quizList[0].id;
            }

            currentQuiz = quizList.find(q => q.id === currentQuizId) || quizList[0];
            applyColorTheme(currentQuiz.themeColor || "indigo");
        }

        async function saveCurrentQuiz() {
            if (!window.firebaseApp || !currentUser) return;
            const { db, doc, setDoc } = window.firebaseApp;
            
            if (!currentQuiz.ownerId) {
                currentQuiz.ownerId = currentUser.uid;
            } else if (currentQuiz.ownerId !== currentUser.uid) {
                showToast("この診断を編集する権限がありません", "error");
                return;
            }

            try {
                await setDoc(doc(db, "quizzes", currentQuiz.id), currentQuiz);
                localStorage.setItem("shindan_maker_current_id", currentQuizId);
            } catch (err) {
                console.error(err);
                showToast("保存に失敗しました", "error");
            }
        }

        function toggleAuth() {
            if (!window.firebaseApp) return;
            const { auth, provider, signInWithPopup, signOut } = window.firebaseApp;
            if (currentUser) {
                signOut(auth).then(() => showToast("ログアウトしました")).catch(err => console.error(err));
            } else {
                signInWithPopup(auth, provider).then(() => showToast("ログインしました")).catch(err => {
                    console.error(err);
                    showToast("ログインに失敗しました", "error");
                });
            }
        }

        function updateAuthUI() {
            const authIcon = document.getElementById("auth-icon");
            const btnAuth = document.getElementById("btn-auth");
            if (!btnAuth) return;
            if (currentUser) {
                authIcon.className = "fa-solid fa-sign-out-alt text-lg";
                btnAuth.title = "ログアウト";
            } else {
                authIcon.className = "fa-solid fa-user text-lg";
                btnAuth.title = "ログイン";
            }
        }

        function updateSettingsVisibility() {
            const btnSettings = document.getElementById("btn-open-settings");
            const btnNewHome = document.getElementById("btn-new-quiz-home");
            const footerLink = document.getElementById("settings-link-footer");
            
            if (!currentUser) {
                if (btnSettings) btnSettings.classList.add("hidden");
                if (btnNewHome) btnNewHome.classList.add("hidden");
                if (footerLink) footerLink.classList.add("hidden");
                return;
            }

            if (btnNewHome) btnNewHome.classList.remove("hidden");

            if (currentQuiz && (currentQuiz.ownerId === currentUser.uid || !currentQuiz.ownerId)) {
                if (btnSettings) btnSettings.classList.remove("hidden");
                if (footerLink) footerLink.classList.remove("hidden");
            } else {
                if (btnSettings) btnSettings.classList.add("hidden");
                if (footerLink) footerLink.classList.add("hidden");
            }
        }

        // URLパラメータ(?id=xxx)で指定診断を開く機能
        function checkUrlParameter() {
            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('id');
            if (targetId && quizList.some(q => q.id === targetId)) {
                currentQuizId = targetId;
                currentQuiz = quizList.find(q => q.id === currentQuizId);
                localStorage.setItem("shindan_maker_current_id", currentQuizId);
                applyColorTheme(currentQuiz.themeColor || "indigo");
            }
        }

        // 画面切り替え
        function showView(viewId) {
            ["home-view", "quiz-view", "result-view", "settings-view"].forEach(id => {
                document.getElementById(id).classList.add("hidden");
            });
            document.getElementById(viewId).classList.remove("hidden");

            if (viewId === "settings-view") {
                initSettingsView();
            }
        }

        // ヘッダー・ホーム画面の描画
        function renderHeader() {
            document.getElementById("app-title").textContent = currentQuiz.title;
            document.getElementById("app-desc").textContent = currentQuiz.description || "直感で質問に答えてチェックしよう！";
        }

        function renderHome() {
            document.getElementById("home-quiz-title").textContent = currentQuiz.title;
            const descEl = document.getElementById("home-quiz-desc");
            if (descEl) descEl.textContent = currentQuiz.description || "";
            document.getElementById("question-count-badge").textContent = currentQuiz.questions.length;
            document.getElementById("quiz-total-count").textContent = `全${quizList.length}件`;

            const homeImgContainer = document.getElementById("home-quiz-image-container");
            const homeImgEl = document.getElementById("home-quiz-image");
            const homeIcon = document.getElementById("home-quiz-icon");
            if (currentQuiz.image && currentQuiz.image.trim() !== "") {
                homeImgEl.src = currentQuiz.image.trim();
                homeImgContainer.classList.remove("hidden");
                if (homeIcon) homeIcon.classList.add("hidden");
            } else {
                homeImgContainer.classList.add("hidden");
                homeImgEl.src = "";
                if (homeIcon) homeIcon.classList.remove("hidden");
            }

            // ドロチE�E�?ウンセレクター生�E
            const selector = document.getElementById("quiz-selector");
            selector.innerHTML = "";
            let visibleCount = 0;
            quizList.forEach(q => {
                // 公開されてぁE��か�?�現在選択中の診断のみ表示
                if (q.published !== false || q.id === currentQuizId || (currentUser && q.ownerId === currentUser.uid)) {
                    const opt = document.createElement("option");
                    opt.value = q.id;
                    opt.textContent = q.title + (q.published === false ? " (非�E閁E" : "");
                    if (q.id === currentQuizId) opt.selected = true;
                    selector.appendChild(opt);
                    visibleCount++;
                }
            });
            document.getElementById("quiz-total-count").textContent = `全${visibleCount}件`;
        }

        // 診断の刁E��替え（トチE�E画面セレクター�E�E
        function switchQuiz(id) {
            currentQuizId = id;
            currentQuiz = quizList.find(q => q.id === id);
            localStorage.setItem("shindan_maker_current_id", currentQuizId);
            
            // URLパラメータを書き換ぁE(履歴を残さずURLを更新)
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
            window.history.replaceState({ path: newUrl }, '', newUrl);

            renderHeader();
            renderHome();
            updateSettingsVisibility();
            showToast(`、E{currentQuiz.title}」に刁E��替えました`);
        }

        // 新規診断の作�E
        async function createNewQuiz() {
            if (!currentUser) {
                showToast("診断を作�Eするにはログインしてください", "error");
                return;
            }
            const newId = "quiz-" + Date.now();
            const newQuiz = {
                id: newId,
                title: `新しい診断 (${quizList.length + 1})`,
                description: "新しい診断の説明文をここに入力してください、E,
                published: false,
                scoringMode: "target",
                sheetsQUrl: "",
                sheetsRUrl: "",
                ownerId: currentUser.uid,
                questions: [
                    {
                        text: "質問文をここに入力してください",
                        image: "",
                        options: [
                            { text: "選択肢 1", score: 0, targetScores: [{ resultIndex: 0, points: 1 }] },
                            { text: "選択肢 2", score: 0, targetScores: [{ resultIndex: 1, points: 1 }] },
                            { text: "選択肢 3", score: 0, targetScores: [] }
                        ]
                    }
                ],
                results: [
                    { minScore: 0, maxScore: 0, title: "タイチEA", description: "説昁EA" },
                    { minScore: 0, maxScore: 0, title: "タイチEB", description: "説昁EB" }
                ]
            };

            quizList.push(newQuiz);
            currentQuizId = newId;
            currentQuiz = newQuiz;
            await saveCurrentQuiz();
            
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + newId;
            window.history.replaceState({ path: newUrl }, '', newUrl);

            renderHeader();
            renderHome();
            updateSettingsVisibility();
            showToast("新しい診断を作�Eしました�E�設定画面で編雁E��きます�?�E);
        }

        // 診断プレイ処琁E
        function startQuiz() {
            if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
                showToast("質問が登録されてぁE��せん。設定から追�?してください、E, "error");
                return;
            }
            currentQuestionIndex = 0;
            userScore = 0;
            targetScores = {};
            showView("quiz-view");
            displayQuestion();
        }

        function displayQuestion() {
            const q = currentQuiz.questions[currentQuestionIndex];
            const total = currentQuiz.questions.length;

            document.getElementById("current-q-num").textContent = currentQuestionIndex + 1;
            document.getElementById("total-q-num").textContent = total;
            document.getElementById("q-number-badge").textContent = currentQuestionIndex + 1;
            document.getElementById("question-text").textContent = q.text;

            // 質問画像表示の制御
            const imgContainer = document.getElementById("question-image-container");
            const imgEl = document.getElementById("question-image");
            if (q.image && q.image.trim() !== "") {
                imgEl.src = q.image.trim();
                imgContainer.classList.remove("hidden");
            } else {
                imgContainer.classList.add("hidden");
                imgEl.src = "";
            }

            // プログレスバ�E
            const progress = (currentQuestionIndex / total) * 100;
            document.getElementById("progress-bar").style.width = `${progress}%`;

            // 選択肢生�E
            const container = document.getElementById("options-container");
            container.innerHTML = "";

            q.options.forEach((opt) => {
                const btn = document.createElement("button");
                btn.className = "w-full text-left p-4 bg-white hover:bg-primary-50 border-2 border-slate-200 hover:border-primary-400 rounded-xl transition font-medium text-sm md:text-base text-slate-700 flex items-center justify-between group active:scale-[0.99]";
                btn.innerHTML = `
                    <span>${escapeHtml(opt.text)}</span>
                    <i class="fa-solid fa-chevron-right text-slate-300 group-hover:text-primary-500 text-xs transition"></i>
                `;
                btn.onclick = () => selectOption(opt);
                container.appendChild(btn);
            });
        }

        function selectOption(opt) {
            if (currentQuiz.scoringMode === "target") {
                if (opt.targetScores) {
                    opt.targetScores.forEach(ts => {
                        if (!targetScores[ts.resultIndex]) targetScores[ts.resultIndex] = 0;
                        targetScores[ts.resultIndex] += ts.points;
                    });
                }
            } else {
                userScore += opt.score || 0;
            }
            
            currentQuestionIndex++;

            if (currentQuestionIndex < currentQuiz.questions.length) {
                displayQuestion();
            } else {
                finishQuiz();
            }
        }

        function finishQuiz() {
            document.getElementById("progress-bar").style.width = `100%`;

            if (currentQuiz.scoringMode === "target") {
                let maxIndex = 0;
                let maxScore = -1;
                currentQuiz.results.forEach((r, idx) => {
                    let score = targetScores[idx] || 0;
                    if (score > maxScore) {
                        maxScore = score;
                        maxIndex = idx;
                    }
                });
                currentResult = currentQuiz.results[maxIndex];
                document.getElementById("result-score").textContent = maxScore;
            } else {
                currentResult = currentQuiz.results.find(r => userScore >= r.minScore && userScore <= r.maxScore);
                document.getElementById("result-score").textContent = userScore;
            }

            if (!currentResult) {
                currentResult = currentQuiz.results[0] || {
                    title: "診断完亁E,
                    description: "診断結果が見つかりませんでした"
                };
            }

            document.getElementById("result-title").textContent = currentResult.title;
            document.getElementById("result-desc").textContent = currentResult.description;

            // 結果画像�E表示制御
            const resImgContainer = document.getElementById("result-image-container");
            const resImgEl = document.getElementById("result-image");
            if (currentResult.image && currentResult.image.trim() !== "") {
                resImgEl.src = currentResult.image.trim();
                resImgContainer.classList.remove("hidden");
            } else {
                resImgContainer.classList.add("hidden");
                resImgEl.src = "";
            }

            showView("result-view");
        }

        // SNS共朁E(URLパラメータを含めた共有リンクを生戁E
        function getShareUrl() {
            const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            return `${baseUrl}?id=${currentQuizId}`;
        }

        function shareX() {
            if (!currentResult) return;
            let text = `、E{currentQuiz.title}】�E診断結果は…\n${currentResult.title}\n�E�スコア: ${userScore}点�E�\n\n#診断メーカー #Web診断\n`;
            if (currentResult.image && currentResult.image.trim() !== "") {
                text += `\n${currentResult.image.trim()}`;
            }
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
            window.open(twitterUrl, '_blank');
        }

        function shareLine() {
            if (!currentResult) return;
            let text = `、E{currentQuiz.title}】診断結果: ${currentResult.title}`;
            if (currentResult.image && currentResult.image.trim() !== "") {
                text += `\n${currentResult.image.trim()}`;
            }
            const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(text)}`;
            window.open(lineUrl, '_blank');
        }

        function copyResultText() {
            if (!currentResult) return;
            let text = `、E{currentQuiz.title}】\n診断結果: ${currentResult.title}\n${currentResult.description}\n${getShareUrl()}`;
            if (currentResult.image && currentResult.image.trim() !== "") {
                text += `\n${currentResult.image.trim()}`;
            }

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast("共有URL付きで結果をコピ�Eしました�E�E);
                });
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast("共有URL付きで結果をコピ�Eしました�E�E);
            }
        }

        function initSettingsView() {
            if (currentQuiz.ownerId && (!currentUser || currentQuiz.ownerId !== currentUser.uid)) {
                 showView('home-view');
                 showToast("こ�E診断の編雁E��限がありません", "error");
                 return;
            }
            renderQuizManagerList();
            document.getElementById("input-app-published").value = currentQuiz.published !== false ? "true" : "false";
            document.getElementById("input-app-theme").value = currentQuiz.themeColor || "indigo";
            document.getElementById("input-app-scoringMode").value = currentQuiz.scoringMode || "sum";
            document.getElementById("input-app-title").value = currentQuiz.title;
            document.getElementById("input-app-desc").value = currentQuiz.description || "";
            document.getElementById("input-app-image").value = currentQuiz.image || "";
            document.getElementById("csv-input-app-title").value = currentQuiz.title;
            document.getElementById("csv-input-app-desc").value = currentQuiz.description || "";
            document.getElementById("csv-input-app-image").value = currentQuiz.image || "";
            document.getElementById("sheets-q-url").value = currentQuiz.sheetsQUrl || "";
            document.getElementById("sheets-r-url").value = currentQuiz.sheetsRUrl || "";
            renderEditorQuestions();
            renderEditorResults();
        }

        // タチE: 診断�?覧・管琁E��スト�E生�E
        function renderQuizManagerList() {
            const container = document.getElementById("quiz-list-container");
            container.innerHTML = "";

            quizList.forEach((q, index) => {
                const isCurrent = q.id === currentQuizId;
                const card = document.createElement("div");
                card.className = `p-4 border rounded-xl flex items-center justify-between gap-3 transition ${isCurrent ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-300' : 'bg-white border-slate-200'}`;

                card.innerHTML = `
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            ${isCurrent ? '<span class="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">選択中</span>' : ''}
                            ${q.published === false ? '<span class="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">非�E閁</span>' : ''}
                            <h4 class="font-bold text-sm text-slate-800 truncate">${escapeHtml(q.title)}</h4>
                        </div>
                        <p class="text-xs text-slate-500 truncate">${q.questions.length}問�E質啁E/ ${q.results.length}個�E診断結果</p>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        ${!isCurrent ? `
                            <button onclick="switchQuiz('${q.id}'); if(currentQuiz.ownerId && (!currentUser || currentQuiz.ownerId !== currentUser.uid)) { showView('home-view'); showToast('編雁E��限がなぁE��めトチE�E画面に戻りました', 'error'); } else { initSettingsView(); }" class="bg-white hover:bg-slate-100 border text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition">
                                選抁E
                            </button>
                        ` : ''}
                        <button onclick="duplicateQuiz('${q.id}')" class="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg text-xs transition" title="こ�E診断を褁E��">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                        ${(quizList.length > 1 && (!q.ownerId || (currentUser && q.ownerId === currentUser.uid))) ? `
                            <button onclick="deleteQuiz('${q.id}')" class="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg text-xs transition" title="削除">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // 診断の褁E��
        async function duplicateQuiz(id) {
            if (!currentUser) return;
            const target = quizList.find(q => q.id === id);
            if (!target) return;

            const newQuiz = JSON.parse(JSON.stringify(target));
            newQuiz.id = "quiz-" + Date.now();
            newQuiz.title = `${target.title} (コピ�E)`;
            newQuiz.published = false;
            newQuiz.ownerId = currentUser.uid;

            quizList.push(newQuiz);
            currentQuizId = newQuiz.id;
            currentQuiz = newQuiz;
            await saveCurrentQuiz();
            
            const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + newQuiz.id;
            window.history.replaceState({ path: newUrl }, '', newUrl);

            initSettingsView();
            renderHeader();
            renderHome();
            updateSettingsVisibility();
            showToast("診断を褁E��しました�E�E);
        }

        // 診断の削除
        async function deleteQuiz(id) {
            if (quizList.length <= 1) {
                showToast("�?佁Eつの診断が忁E��でぁE, "error");
                return;
            }

            const target = quizList.find(q => q.id === id);
            if (target && target.ownerId && (!currentUser || target.ownerId !== currentUser.uid)) {
                showToast("こ�E診断を削除する権限がありません", "error");
                return;
            }

            if (!confirm("こ�E診断を削除してもよろしぁE��すか�E�E)) return;

            if (window.firebaseApp) {
                const { db, doc, deleteDoc } = window.firebaseApp;
                try {
                    await deleteDoc(doc(db, "quizzes", id));
                } catch (e) {
                    console.error(e);
                    showToast("削除に失敗しました", "error");
                    return;
                }
            }

            quizList = quizList.filter(q => q.id !== id);
            if (currentQuizId === id) {
                currentQuizId = quizList[0].id;
                currentQuiz = quizList[0];
                localStorage.setItem("shindan_maker_current_id", currentQuizId);
            }
            renderHeader();
            renderHome();
            initSettingsView();
            updateSettingsVisibility();
            showToast("診断を削除しました");
        }

        // CSV & スプレチE��シート�?�携機�E
        function parseCSV(text) {
            const lines = text.split(/\r\n|\n/);
            const result = [];
            for (let line of lines) {
                if (!line.trim()) continue;
                const row = [];
                let insideQuote = false;
                let entry = '';
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        insideQuote = !insideQuote;
                    } else if (char === ',' && !insideQuote) {
                        row.push(entry.trim());
                        entry = '';
                    } else {
                        entry += char;
                    }
                }
                row.push(entry.trim());
                result.push(row);
            }
            return result;
        }

        async function loadFromGoogleSheets() {
            const qUrl = document.getElementById("sheets-q-url").value.trim();
            const rUrl = document.getElementById("sheets-r-url").value.trim();

            if (!qUrl) {
                showToast("質問CSVのWeb公開URLを�E力してください", "error");
                return;
            }

            try {
                const resQ = await fetch(qUrl);
                if (!resQ.ok) throw new Error("質問データの取得に失敗しました");
                const textQ = await resQ.text();
                const questions = parseQuestionsCSV(textQ);

                let results = currentQuiz.results;
                if (rUrl) {
                    const resR = await fetch(rUrl);
                    if (resR.ok) {
                        const textR = await resR.text();
                        results = parseResultsCSV(textR);
                    }
                }

                if (questions.length === 0) {
                    showToast("有効な質問データが見つかりませんでした", "error");
                    return;
                }

                currentQuiz.questions = questions;
                currentQuiz.results = results;
                currentQuiz.sheetsQUrl = qUrl;
                currentQuiz.sheetsRUrl = rUrl;
                currentQuiz.title = document.getElementById("csv-input-app-title").value.trim() || "診断メーカー";
                currentQuiz.description = document.getElementById("csv-input-app-desc").value.trim();
                currentQuiz.image = document.getElementById("csv-input-app-image").value.trim();

                await saveCurrentQuiz();
                renderHeader();
                renderHome();
                showToast(`質啁E{questions.length}問を取り込み更新しました�E?);
                showView("home-view");

            } catch (err) {
                console.error(err);
                showToast("読み込み失敁E URLまた�E共有設定を確認してください", "error");
            }
        }

        function importCsvFiles() {
            const fileQ = document.getElementById("input-file-q").files[0];
            const fileR = document.getElementById("input-file-r").files[0];

            if (!fileQ && !fileR) {
                showToast("読み込�?CSVファイルを選択してください", "error");
                return;
            }

            const promises = [];

            if (fileQ) {
                promises.push(new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const qList = parseQuestionsCSV(e.target.result);
                        if (qList.length > 0) currentQuiz.questions = qList;
                        resolve();
                    };
                    reader.readAsText(fileQ);
                }));
            }

            if (fileR) {
                promises.push(new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const rList = parseResultsCSV(e.target.result);
                        if (rList.length > 0) currentQuiz.results = rList;
                        resolve();
                    };
                    reader.readAsText(fileR);
                }));
            }

            Promise.all(promises).then(async () => {
                currentQuiz.title = document.getElementById("csv-input-app-title").value.trim() || "診断メーカー";
                currentQuiz.description = document.getElementById("csv-input-app-desc").value.trim();
                currentQuiz.image = document.getElementById("csv-input-app-image").value.trim();
                await saveCurrentQuiz();
                renderHeader();
                renderHome();
                showToast("CSVファイルを適用しました�E�E);
                showView("home-view");
            });
        }

        function parseQuestionsCSV(text) {
            const rows = parseCSV(text);
            const questions = [];
            const startIdx = (rows[0] && rows[0][0].includes("質啁E)) ? 1 : 0;

            for (let i = startIdx; i < rows.length; i++) {
                const r = rows[i];
                if (r.length < 3) continue;

                const qText = r[0];
                let qImage = "";
                let startOptIdx = 1;

                if (r.length >= 4 && (!isNaN(parseInt(r[3])) || r[3] === "" || r[3] === "0")) {
                    qImage = r[1];
                    startOptIdx = 2;
                }

                const options = [];
                for (let j = startOptIdx; j < r.length; j += 2) {
                    if (r[j] && r[j].trim() !== "") {
                        const scoreField = r[j + 1] || "";
                        if (currentQuiz.scoringMode === "target") {
                            let targetScores = [];
                            if (typeof scoreField === "string" && scoreField.includes(":")) {
                                scoreField.split("|").forEach(tStr => {
                                    let parts = tStr.split(":");
                                    if(parts.length === 2) {
                                        targetScores.push({ resultIndex: parseInt(parts[0]) || 0, points: parseInt(parts[1]) || 0 });
                                    }
                                });
                            }
                            options.push({
                                text: r[j],
                                score: 0,
                                targetScores: targetScores
                            });
                        } else {
                            const rawScore = parseInt(scoreField);
                            options.push({
                                text: r[j],
                                score: isNaN(rawScore) ? 0 : rawScore
                            });
                        }
                    }
                }

                if (qText && options.length > 0) {
                    questions.push({ text: qText, image: qImage, options: options });
                }
            }
            return questions;
        }

        function parseResultsCSV(text) {
            const rows = parseCSV(text);
            const results = [];
            const startIdx = (rows[0] && (rows[0][0].includes("�?封E) || rows[0][2].includes("タイトル"))) ? 1 : 0;

            for (let i = startIdx; i < rows.length; i++) {
                const r = rows[i];
                if (r.length < 4) continue;

                results.push({
                    minScore: parseInt(r[0]) || 0,
                    maxScore: parseInt(r[1]) || 999,
                    title: r[2],
                    description: r[3],
                    image: r[4] ? r[4].trim() : ""
                });
            }
            return results;
        }

        function exportCurrentCsv() {
            let qCsv = "質問文,画像URL,選択肢1,点数(また�EターゲチE��配�E),選択肢2,点数2,選択肢3,点数3,選択肢4,点数4,選択肢5,点数5\n";
            currentQuiz.questions.forEach(q => {
                let row = [
                    `"${q.text.replace(/"/g, '""')}"`,
                    `"${(q.image || '').replace(/"/g, '""')}"`
                ];
                q.options.forEach(opt => {
                    row.push(`"${opt.text.replace(/"/g, '""')}"`);
                    if (currentQuiz.scoringMode === "target") {
                        let tStr = (opt.targetScores || []).map(ts => `${ts.resultIndex}:${ts.points}`).join("|");
                        row.push(`"${tStr}"`);
                    } else {
                        row.push(opt.score !== undefined ? opt.score : 0);
                    }
                });
                qCsv += row.join(",") + "\n";
            });
            downloadFile(qCsv, `${currentQuiz.title}_questions.csv`);

            let rCsv = "�?小点数,�?大点数,診断結果タイトル,診断結果説明文,画像URL\n";
            currentQuiz.results.forEach(r => {
                rCsv += `${r.minScore},${r.maxScore},"${r.title.replace(/"/g, '""')}","${r.description.replace(/"/g, '""')}","${(r.image || '').replace(/"/g, '""')}"\n`;
            });
            downloadFile(rCsv, `${currentQuiz.title}_results.csv`);

            showToast("CSVをダウンロードしました�E�E);
        }

        function downloadSampleCsv() {
            if (currentQuiz.scoringMode === "target") {
                const sampleQ = "質問文,画像URL,選択肢1,配�E(結果番号:点数),選択肢2,配�E2,選択肢3,配�E3\n" +
                    "休日の過ごし方は�E�Ehttps://placehold.co/600x300/e2e8f0/475569?text=Weekend,アクチE��ブに出か�?めE0:3|1:1,家で読書,1:3|0:1,近所を散歩,0:1|1:1";
                const sampleR = "�?小点数(無要E,�?大点数(無要E,診断結果タイトル,診断結果説明文,画像URL\n0,0,【アクチE��ブタイプ�?�E行動力バチE��ンのアクチE��ブ派です！Ehttps://placehold.co/600x400/fee2e2/991b1b?text=Active\n0,0,【インドア・雁E��タイプ�?�E自刁E�E世界を大刁E��する知皁E��雁E��力�E高いタイプです�?�Ehttps://placehold.co/600x400/f3e8ff/6b21a8?text=Indoor";
                downloadFile(sampleQ, "sample_questions.csv");
                downloadFile(sampleR, "sample_results.csv");
            } else {
                const sampleQ = "質問文,画像URL,選択肢1,点数1,選択肢2,点数2,選択肢3,点数3,選択肢4,点数4,選択肢5,点数5\n" +
                    "休日どぁE��ごす�E�Ehttps://placehold.co/600x300/e2e8f0/475569?text=Weekend,1日中家で読書,3,趣味の制佁E2,近所を散歩,1,友達と外�E,0,イベント企画,0\n" +
                    "直感で選ぶ場�?は�E�Ehttps://placehold.co/600x300/e2e8f0/475569?text=Place,静寂なライブラリー,3,�?先端のラチE2,波音の聞こえる海,1,夜�EチE�Eマパーク,0,フェスチE��バル,0";
                const sampleR = "�?小点数,�?大点数,診断結果タイトル,診断結果説明文,画像URL\n0,2,【アクチE��ブタイプ�?�E行動力バチE��ンのアクチE��ブ派です！Ehttps://placehold.co/600x400/fee2e2/991b1b?text=Active\n3,4,【バランスタイプ�?�E状況に合わせて柔軟に対応できるバランス派です�?�Ehttps://placehold.co/600x400/dbeafe/1e40af?text=Balance\n5,6,【インドア・雁E��タイプ�?�E自刁E�E世界を大刁E��する知皁E��雁E��力�E高いタイプです�?�Ehttps://placehold.co/600x400/f3e8ff/6b21a8?text=Indoor";

                downloadFile(sampleQ, "sample_questions.csv");
                downloadFile(sampleR, "sample_results.csv");
            }
            showToast("サンプルCSVをダウンロードしました�E�E);
        }

        function downloadFile(content, filename) {
            const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }

        // 手動編雁E��面機�E
        function renderEditorQuestions() {
            const container = document.getElementById("questions-editor-list");
            document.getElementById("editor-q-count").textContent = currentQuiz.questions.length;
            container.innerHTML = "";

            currentQuiz.questions.forEach((q, qIndex) => {
                const card = document.createElement("div");
                card.className = "p-4 bg-slate-50 border rounded-xl space-y-3 relative";

                let optionsHtml = "";
                q.options.forEach((opt, oIndex) => {
                    if (!opt.targetScores) opt.targetScores = [];
                    let targetsHtml = "";
                    if (currentQuiz.scoringMode === "target") {
                        opt.targetScores.forEach((ts, tsIndex) => {
                            let selectHtml = `<select onchange="updateTargetResult(${qIndex}, ${oIndex}, ${tsIndex}, this.value)" class="p-1 border rounded text-[10px] outline-none max-w-[120px] truncate">`;
                            currentQuiz.results.forEach((res, rIdx) => {
                                selectHtml += `<option value="${rIdx}" ${ts.resultIndex == rIdx ? 'selected' : ''}>結果${rIdx + 1}: ${escapeHtml(res.title)}</option>`;
                            });
                            selectHtml += `</select>`;
                            
                            targetsHtml += `
                                <div class="flex items-center gap-1 mt-1 ml-4 bg-white p-1 rounded border shadow-sm">
                                    <span class="text-slate-400 text-[10px] whitespace-nowrap">�?算�E:</span>
                                    ${selectHtml}
                                    <input type="number" value="${ts.points}" onchange="updateTargetPoints(${qIndex}, ${oIndex}, ${tsIndex}, this.value)" class="w-10 p-1 border rounded text-center text-[10px] outline-none">
                                    <span class="text-slate-400 text-[10px]">点</span>
                                    <button onclick="removeTargetScore(${qIndex}, ${oIndex}, ${tsIndex})" class="text-rose-400 hover:text-rose-600 text-[10px] px-1"><i class="fa-solid fa-xmark"></i></button>
                                </div>
                            `;
                        });
                        targetsHtml += `
                            <button onclick="addTargetScore(${qIndex}, ${oIndex})" class="text-primary-500 hover:text-primary-700 text-[10px] font-bold py-1 ml-4 flex items-center gap-1 transition">
                                + ターゲチE���?算を追�?
                            </button>
                        `;
                    }

                    optionsHtml += `
                        <div class="flex flex-col gap-1 text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400">${oIndex + 1}.</span>
                                <input type="text" value="${escapeHtml(opt.text)}" onchange="updateOptionText(${qIndex}, ${oIndex}, this.value)" placeholder="選択肢" class="flex-1 p-1.5 border rounded outline-none">
                                ${currentQuiz.scoringMode !== "target" ? `
                                <input type="number" value="${opt.score}" onchange="updateOptionScore(${qIndex}, ${oIndex}, this.value)" class="w-14 p-1.5 border rounded text-center outline-none" title="配点">
                                <span class="text-slate-400">点</span>
                                ` : ''}
                                ${q.options.length > 2 ? `<button onclick="removeOptionEditor(${qIndex}, ${oIndex})" class="text-slate-400 hover:text-rose-500 transition px-1" title="選択肢を削除"><i class="fa-solid fa-xmark"></i></button>` : `<span class="w-4"></span>`}
                            </div>
                            ${targetsHtml}
                        </div>
                    `;
                });

                card.innerHTML = `
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-bold text-xs text-primary-600">Q${qIndex + 1}</span>
                        <button onclick="removeQuestion(${qIndex})" class="text-rose-500 hover:text-rose-700 text-xs">
                            <i class="fa-solid fa-trash"></i> 削除
                        </button>
                    </div>
                    <input type="text" value="${escapeHtml(q.text)}" onchange="updateQuestionText(${qIndex}, this.value)" placeholder="質問文を�E劁E class="w-full p-2 border rounded text-xs font-bold outline-none mb-1">
                    <input type="text" value="${escapeHtml(q.image || '')}" onchange="updateQuestionImage(${qIndex}, this.value)" placeholder="画像URL (任愁E https://...)" class="w-full p-1.5 border rounded text-xs outline-none text-slate-600">
                    <div class="space-y-1.5 pl-2 border-l-2 border-primary-200 mt-2">
                        ${optionsHtml}
                        <button onclick="addOptionEditor(${qIndex})" class="text-primary-500 hover:text-primary-700 text-[10px] font-bold py-1 flex items-center gap-1 transition">
                            <i class="fa-solid fa-plus"></i> 選択肢を追�?
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function addQuestionEditor() {
            currentQuiz.questions.push({
                text: "新しい質啁E,
                image: "",
                options: [
                    { text: "選択肢 1", score: 3 },
                    { text: "選択肢 2", score: 2 },
                    { text: "選択肢 3", score: 1 },
                    { text: "選択肢 4", score: 0 },
                    { text: "選択肢 5", score: 0 }
                ]
            });
            renderEditorQuestions();
        }

        function renderEditorResults() {
            const container = document.getElementById("results-editor-list");
            document.getElementById("editor-r-count").textContent = currentQuiz.results.length;
            container.innerHTML = "";

            currentQuiz.results.forEach((r, rIndex) => {
                const card = document.createElement("div");
                card.className = "p-4 bg-slate-50 border rounded-xl space-y-3 relative";

                card.innerHTML = `
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-bold text-xs text-primary-600">結果${rIndex + 1}</span>
                        <button onclick="removeResult(${rIndex})" class="text-rose-500 hover:text-rose-700 text-xs">
                            <i class="fa-solid fa-trash"></i> 削除
                        </button>
                    </div>
                    ${currentQuiz.scoringMode !== "target" ? `
                    <div class="flex gap-2 items-center text-xs text-slate-600 mb-1">
                        <span>スコア篁E��:</span>
                        <input type="number" value="${r.minScore}" onchange="updateResultMinScore(${rIndex}, this.value)" class="w-16 p-1.5 border rounded text-center outline-none">
                        <span>、</span>
                        <input type="number" value="${r.maxScore}" onchange="updateResultMaxScore(${rIndex}, this.value)" class="w-16 p-1.5 border rounded text-center outline-none">
                    </div>
                    ` : ''}
                    <input type="text" value="${escapeHtml(r.title)}" onchange="updateResultTitle(${rIndex}, this.value)" placeholder="診断結果のタイトル" class="w-full p-2 border rounded text-sm font-bold outline-none">
                    <textarea onchange="updateResultDesc(${rIndex}, this.value)" placeholder="診断結果の説明文" rows="2" class="w-full p-2 border rounded text-xs outline-none">${escapeHtml(r.description)}</textarea>
                    <input type="text" value="${escapeHtml(r.image || '')}" onchange="updateResultImage(${rIndex}, this.value)" placeholder="結果の画像URL (任愁E https://...)" class="w-full p-1.5 border rounded text-xs outline-none text-slate-600">
                `;
                container.appendChild(card);
            });
        }

        function addResultEditor() {
            currentQuiz.results.push({
                minScore: 0,
                maxScore: 0,
                title: "新しい診断結果",
                description: "新しい説明文",
                image: ""
            });
            renderEditorResults();
        }

        function updateResultMinScore(rIndex, val) {
            const num = parseInt(val);
            currentQuiz.results[rIndex].minScore = isNaN(num) ? 0 : num;
        }

        function updateResultMaxScore(rIndex, val) {
            const num = parseInt(val);
            currentQuiz.results[rIndex].maxScore = isNaN(num) ? 0 : num;
        }

        function updateResultTitle(rIndex, val) {
            currentQuiz.results[rIndex].title = val;
        }

        function updateResultDesc(rIndex, val) {
            currentQuiz.results[rIndex].description = val;
        }

        function updateResultImage(rIndex, val) {
            currentQuiz.results[rIndex].image = val.trim();
        }

        function removeResult(rIndex) {
            currentQuiz.results.splice(rIndex, 1);
            renderEditorResults();
        }

        function updateQuestionText(qIndex, val) {
            currentQuiz.questions[qIndex].text = val;
        }

        function updateQuestionImage(qIndex, val) {
            currentQuiz.questions[qIndex].image = val.trim();
        }

        function updateOptionText(qIndex, oIndex, val) {
            currentQuiz.questions[qIndex].options[oIndex].text = val;
        }

        function updateOptionScore(qIndex, oIndex, val) {
            const scoreNum = parseInt(val);
            currentQuiz.questions[qIndex].options[oIndex].score = isNaN(scoreNum) ? 0 : scoreNum;
        }

        function updateTargetResult(qIndex, oIndex, tsIndex, val) {
            currentQuiz.questions[qIndex].options[oIndex].targetScores[tsIndex].resultIndex = parseInt(val);
        }

        function updateTargetPoints(qIndex, oIndex, tsIndex, val) {
            const points = parseInt(val);
            currentQuiz.questions[qIndex].options[oIndex].targetScores[tsIndex].points = isNaN(points) ? 0 : points;
        }

        function removeTargetScore(qIndex, oIndex, tsIndex) {
            currentQuiz.questions[qIndex].options[oIndex].targetScores.splice(tsIndex, 1);
            renderEditorQuestions();
        }

        function addTargetScore(qIndex, oIndex) {
            if (!currentQuiz.questions[qIndex].options[oIndex].targetScores) {
                currentQuiz.questions[qIndex].options[oIndex].targetScores = [];
            }
            currentQuiz.questions[qIndex].options[oIndex].targetScores.push({ resultIndex: 0, points: 1 });
            renderEditorQuestions();
        }

        function removeQuestion(qIndex) {
            currentQuiz.questions.splice(qIndex, 1);
            renderEditorQuestions();
        }

        function addOptionEditor(qIndex) {
            currentQuiz.questions[qIndex].options.push({ text: "新しい選択肢", score: 0 });
            renderEditorQuestions();
        }

        function removeOptionEditor(qIndex, oIndex) {
            currentQuiz.questions[qIndex].options.splice(oIndex, 1);
            renderEditorQuestions();
        }

        function changeScoringMode(mode) {
            currentQuiz.scoringMode = mode;
            renderEditorQuestions();
            renderEditorResults();
        }

        function previewTheme(themeName) {
            applyColorTheme(themeName);
        }

        async function saveManualEditor() {
            currentQuiz.published = document.getElementById("input-app-published").value === "true";
            currentQuiz.themeColor = document.getElementById("input-app-theme").value;
            currentQuiz.scoringMode = document.getElementById("input-app-scoringMode").value;
            currentQuiz.title = document.getElementById("input-app-title").value.trim() || "診断メーカー";
            currentQuiz.description = document.getElementById("input-app-desc").value.trim();
            currentQuiz.image = document.getElementById("input-app-image").value.trim();
            await saveCurrentQuiz();
            renderHeader();
            renderHome();
            showToast("現在の診断設定を保存しました�E�E);
            showView("home-view");
        }

        async function saveCsvSettings() {
            currentQuiz.title = document.getElementById("csv-input-app-title").value.trim() || "診断メーカー";
            currentQuiz.description = document.getElementById("csv-input-app-desc").value.trim();
            currentQuiz.image = document.getElementById("csv-input-app-image").value.trim();
            currentQuiz.sheetsQUrl = document.getElementById("sheets-q-url").value.trim();
            currentQuiz.sheetsRUrl = document.getElementById("sheets-r-url").value.trim();
            await saveCurrentQuiz();
            renderHeader();
            renderHome();
            showToast("基本設定とURLを保存しました�E�E);
            showView("home-view");
        }

        function switchTab(tab) {
            ["manager", "editor", "csv"].forEach(t => {
                document.getElementById(`tab-content-${t}`).classList.add("hidden");
                document.getElementById(`tab-btn-${t}`).className = "py-2.5 px-3 md:px-4 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-1.5";
            });

            document.getElementById(`tab-content-${tab}`).classList.remove("hidden");
            document.getElementById(`tab-btn-${tab}`).className = "py-2.5 px-3 md:px-4 border-b-2 border-primary-600 text-primary-600 flex items-center gap-1.5";
        }

        // ユーチE��リチE��
        function escapeHtml(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function showToast(message, type = "success") {
            const toast = document.getElementById("toast");
            const toastMsg = document.getElementById("toast-message");
            const toastIcon = document.getElementById("toast-icon");

            toastMsg.textContent = message;
            if (type === "error") {
                toastIcon.className = "fa-solid fa-circle-exclamation text-rose-400";
            } else {
                toastIcon.className = "fa-solid fa-circle-check text-emerald-400";
            }

            toast.classList.remove("opacity-0", "pointer-events-none");
            setTimeout(() => {
                toast.classList.add("opacity-0", "pointer-events-none");
            }, 3000);
        }
    