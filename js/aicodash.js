document.addEventListener('DOMContentLoaded', () => {
    console.log('AICoDash initialized.');

    // 1. Initial State & Data Management (localStorage)
    const defaultEmployees = [
        {
            id: 'emp_pm',
            name: 'アリス',
            role: 'プロダクトマネージャー',
            department: 'planning',
            avatar: 'PM',
            description: 'エモ・クラゲ 40種の画像生成が完了。新設された自作エディタによる、精密な余白調整（10pxルール）と透過処理の最終工程を進行中。',
            status: '完了',
            progress: 100,
            task: 'プロジェクト進捗率'
        },
        {
            id: 'emp_designer',
            name: 'ボブ',
            role: 'UI/UXデザイナー',
            department: 'design',
            avatar: 'Designer',
            description: '4x5レイアウトに最適化されたエモ・クラゲ40ポーズ of 色彩・デザインを確定させました。資産として登録済み。',
            status: '完了',
            progress: 100,
            task: 'デザインアセット確定'
        },
        {
            id: 'emp_developer',
            name: 'チャーリー',
            role: 'リードエンジニア',
            department: 'development',
            avatar: 'Developer',
            description: '『AILineStampProducer』に強力な個別エディタ、Undo機能、精密ガイドを実装。外部ソフト不要の完結型制作環境へと進化させました。',
            status: '待機中',
            progress: 100,
            task: 'ツールエンジン準備完了'
        },
        {
            id: 'emp_marketer',
            name: 'デイヴ',
            role: 'マーケティングスペシャリスト',
            department: 'marketing',
            avatar: 'Marketer',
            description: 'SNSでのトレンド分析を行い、次の製品의 ターゲット層を特定しています。',
            status: '分析中',
            progress: 95,
            task: '市場調査'
        }
    ];

    function getEmployees() {
        const stored = localStorage.getItem('aico_employees');
        if (!stored) {
            localStorage.setItem('aico_employees', JSON.stringify(defaultEmployees));
            return defaultEmployees;
        }
        return JSON.parse(stored);
    }

    function saveEmployees(employees) {
        localStorage.setItem('aico_employees', JSON.stringify(employees));
    }

    // 2. Tab Control (SPA View switcher)
    const navLinks = document.querySelectorAll('.nav-link[data-view]');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.getAttribute('data-view');
            switchView(targetView);
        });
    });

    // Special handling for legacy links or footer links without data-view
    const otherLinks = document.querySelectorAll('.nav-link:not([data-view])');
    otherLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') {
                e.preventDefault();
            }
        });
    });

    function switchView(viewId) {
        // Handle scrolling to portfolio for project link
        if (viewId === 'projects') {
            switchView('dashboard');
            setTimeout(() => {
                const portfolioHeader = document.querySelector('h2[style*="Outfit"]');
                if (portfolioHeader) {
                    portfolioHeader.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
            return;
        }

        // Deactivate all views and links
        viewSections.forEach(section => section.classList.remove('active'));
        navLinks.forEach(link => link.classList.remove('active'));

        // Activate targeted view and navigation link
        const targetSection = document.getElementById(`${viewId}-view`);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            // Fallback to dashboard if view is not implemented
            document.getElementById('dashboard-view').classList.add('active');
            const dashLink = document.querySelector('.nav-link[data-view="dashboard"]');
            if (dashLink) dashLink.classList.add('active');
            return;
        }

        const activeLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Trigger dynamic rendering based on active view
        if (viewId === 'dashboard') {
            renderDashboardEmployees();
        } else if (viewId === 'employees') {
            renderEmployeeManagement();
        } else if (viewId === 'org-chart') {
            renderOrgChart();
        }
    }

    // 3. Hire & Assignment UI Rendering
    function renderDashboardEmployees() {
        const employees = getEmployees();
        const grid = document.getElementById('dashboard-employees-grid');
        if (!grid) return;

        // Update employee count in statistics
        const countBadge = document.getElementById('stats-employee-count');
        if (countBadge) {
            countBadge.innerText = employees.length;
        }

        grid.innerHTML = '';
        employees.forEach((emp, index) => {
            const card = document.createElement('div');
            card.className = 'card animate-fade-in';
            card.style.animationDelay = `${0.5 + index * 0.1}s`;
            
            // Map departments to colors
            let deptColor = 'var(--primary-color)';
            if (emp.department === 'development') deptColor = 'var(--secondary-color)';
            if (emp.department === 'design') deptColor = 'var(--accent-color)';
            if (emp.department === 'marketing') deptColor = 'var(--success)';

            card.innerHTML = `
                <div class="card-header">
                    <div class="avatar" style="border: 2px solid ${deptColor}; padding: 2px;">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${emp.avatar || emp.name}" alt="${emp.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 18px;">
                    </div>
                    <div>
                        <h3>${emp.name}</h3>
                        <div style="font-size: 0.75rem; color: var(--text-dim); margin-bottom: 4px;">${emp.role}</div>
                        <span class="status-badge status-active" style="background: ${deptColor}20; color: ${deptColor}; border: 1px solid ${deptColor}40;">${emp.status || '稼働中'}</span>
                    </div>
                </div>
                <div class="card-body">
                    <p>${emp.description || '特記事項なし。'}</p>
                    <div class="task-progress">
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.3rem;">
                            <span>${emp.task || 'タスク進行'}</span>
                            <span class="progress-pct">${emp.progress || 0}%</span>
                        </div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${emp.progress || 0}%; background: ${deptColor};"></div></div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function renderEmployeeManagement() {
        const employees = getEmployees();
        const grid = document.getElementById('employees-list-grid');
        if (!grid) return;

        grid.innerHTML = '';
        employees.forEach((emp) => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Map departments to labels
            const deptLabels = {
                planning: '企画部門 (Planning)',
                development: '開発部門 (Development)',
                design: 'デザイン部門 (Design)',
                marketing: 'マーケティング部門 (Marketing)'
            };

            card.innerHTML = `
                <div class="card-header">
                    <div class="avatar">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${emp.avatar || emp.name}" alt="${emp.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">
                    </div>
                    <div style="flex-grow: 1;">
                        <h3 style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${emp.name}</span>
                            <button class="btn-delete" data-id="${emp.id}" style="background: none; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center;" title="解雇">
                                <span class="material-icons-round" style="font-size: 1.2rem;">person_remove</span>
                            </button>
                        </h3>
                        <div style="font-size: 0.8rem; color: var(--text-dim);">${emp.role}</div>
                    </div>
                </div>
                <div class="card-body">
                    <p style="font-size: 0.85rem; margin-bottom: 1rem;">${emp.description || '特記事項なし。'}</p>
                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size: 0.75rem; color: var(--text-dim);">部門アサイン</label>
                        <select class="form-control dept-assign-select" data-id="${emp.id}" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                            <option value="planning" ${emp.department === 'planning' ? 'selected' : ''}>企画部門</option>
                            <option value="development" ${emp.department === 'development' ? 'selected' : ''}>開発部門</option>
                            <option value="design" ${emp.department === 'design' ? 'selected' : ''}>デザイン部門</option>
                            <option value="marketing" ${emp.department === 'marketing' ? 'selected' : ''}>マーケティング部門</option>
                        </select>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach event listeners for department changes
        grid.querySelectorAll('.dept-assign-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const empId = select.getAttribute('data-id');
                const newDept = e.target.value;
                updateEmployeeDepartment(empId, newDept);
            });
        });

        // Attach event listeners for delete button
        grid.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const empId = btn.getAttribute('data-id');
                if (confirm('このAI社員との雇用契約を解除しますか？')) {
                    fireEmployee(empId);
                }
            });
        });
    }

    function updateEmployeeDepartment(empId, dept) {
        let employees = getEmployees();
        employees = employees.map(emp => {
            if (emp.id === empId) {
                emp.department = dept;
            }
            return emp;
        });
        saveEmployees(employees);
        renderEmployeeManagement();
    }

    function fireEmployee(empId) {
        let employees = getEmployees();
        employees = employees.filter(emp => emp.id !== empId);
        saveEmployees(employees);
        renderEmployeeManagement();
    }

    // 4. Hire Form Submit Handler
    const hireForm = document.getElementById('hire-form');
    if (hireForm) {
        hireForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('ai-name').value.trim();
            const role = document.getElementById('ai-role').value.trim();
            const department = document.getElementById('ai-department').value;
            const avatarSeed = document.getElementById('ai-avatar-seed').value.trim() || name;
            const description = document.getElementById('ai-description').value.trim();

            if (!name || !role) return;

            const newEmp = {
                id: 'emp_' + Date.now(),
                name: name,
                role: role,
                department: department,
                avatar: avatarSeed,
                description: description,
                status: '待機中',
                progress: 0,
                task: 'アサイン待ち'
            };

            const employees = getEmployees();
            employees.push(newEmp);
            saveEmployees(employees);

            // Reset form
            hireForm.reset();

            // Refresh view
            renderEmployeeManagement();
            alert(`${name} 氏とのAI雇用契約が完了しました！`);
        });
    }

    // 5. Org Chart Dynamic Rendering
    function renderOrgChart() {
        const employees = getEmployees();
        const treeContent = document.getElementById('org-tree-content');
        if (!treeContent) return;

        // Group employees by department
        const depts = {
            planning: [],
            development: [],
            design: [],
            marketing: []
        };

        employees.forEach(emp => {
            if (depts[emp.department]) {
                depts[emp.department].push(emp);
            }
        });

        // Find primary PM (from planning dept)
        const planningLeader = depts.planning.length > 0 ? depts.planning[0] : null;
        const otherPlanners = depts.planning.length > 1 ? depts.planning.slice(1) : [];

        // Build HTML
        let html = '';

        // Level 1: CEO
        html += `
            <!-- CEO Level -->
            <div class="org-node ceo">
                <div class="avatar-small" style="border: 2px solid var(--accent-color); justify-content: center;">
                    <span class="material-icons-round" style="color: var(--accent-color); font-size: 1.8rem; display: flex; align-items: center; justify-content: center; height: 100%;">admin_panel_settings</span>
                </div>
                <div class="org-node-info">
                    <h4>CEO ユーザー</h4>
                    <p>最高経営責任者 (CEO)</p>
                </div>
            </div>
        `;

        // Level 2: PM (Planning Department)
        if (planningLeader) {
            html += `
                <div class="org-level-2">
                    <div class="org-node pm">
                        <div class="avatar-small" style="border: 2px solid var(--primary-color);">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${planningLeader.avatar || planningLeader.name}" style="width:100%;height:100%;object-fit:cover;">
                        </div>
                        <div class="org-node-info">
                            <h4>${planningLeader.name}</h4>
                            <p>${planningLeader.role}</p>
                        </div>
                    </div>
            `;
        } else {
            // Placeholder PM if none hired
            html += `
                <div class="org-level-2">
                    <div class="org-node pm" style="border-style: dashed; opacity: 0.6;">
                        <div class="avatar-small" style="justify-content: center;">
                            <span class="material-icons-round" style="color: var(--text-dim); display: flex; align-items: center; justify-content: center; height: 100%;">person_off</span>
                        </div>
                        <div class="org-node-info">
                            <h4>PM 未アサイン</h4>
                            <p>企画部門長</p>
                        </div>
                    </div>
            `;
        }

        // Level 3: Department Children (Development, Design, Marketing, Extra Planners)
        html += `
                <div class="org-children">
        `;

        // helper to generate sub-node
        const generateDeptBranch = (deptTitle, deptEmployees, colorVar) => {
            let branchHtml = `
                <div class="org-child-branch">
                    <div style="text-align: center; margin-bottom: 0.8rem; font-size: 0.75rem; font-weight: bold; color: var(${colorVar}); border: 1px solid var(${colorVar})40; padding: 2px 10px; border-radius: 12px; background: var(${colorVar})10;">
                        ${deptTitle}
                    </div>
            `;

            if (deptEmployees.length > 0) {
                deptEmployees.forEach(emp => {
                    branchHtml += `
                        <div class="org-node" style="margin-bottom: 0.8rem; border-color: var(${colorVar});">
                            <div class="avatar-small">
                                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${emp.avatar || emp.name}" style="width:100%;height:100%;object-fit:cover;">
                            </div>
                            <div class="org-node-info">
                                <h4>${emp.name}</h4>
                                <p>${emp.role}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                branchHtml += `
                    <div class="org-node" style="border-style: dashed; opacity: 0.5;">
                        <div class="avatar-small" style="justify-content: center;">
                            <span class="material-icons-round" style="color: var(--text-dim); display: flex; align-items: center; justify-content: center; height: 100%;">person_off</span>
                        </div>
                        <div class="org-node-info">
                            <h4>社員不在</h4>
                            <p>アサインなし</p>
                        </div>
                    </div>
                `;
            }

            branchHtml += `</div>`;
            return branchHtml;
        };

        // Planning members (excluding primary leader)
        if (otherPlanners.length > 0) {
            html += generateDeptBranch('企画部門 (企画員)', otherPlanners, '--primary-color');
        }

        // Development branch
        html += generateDeptBranch('開発部門 (Development)', depts.development, '--secondary-color');

        // Design branch
        html += generateDeptBranch('デザイン部門 (Design)', depts.design, '--accent-color');

        // Marketing branch
        html += generateDeptBranch('マーケティング部門 (Marketing)', depts.marketing, '--success');

        html += `
                </div>
            </div>
        `;

        treeContent.innerHTML = html;
    }

    // 6. Meeting Room Simulator
    const btnToggleMeeting = document.getElementById('btn-toggle-meeting');
    const meetingTopicSelect = document.getElementById('meeting-topic-select');
    const chatTopicDisplay = document.getElementById('chat-topic-display');
    const chatContainer = document.getElementById('chat-messages-container');
    const chatUserInput = document.getElementById('chat-user-input');
    const btnSendMessage = document.getElementById('btn-send-message');

    let meetingInterval = null;
    let isMeetingActive = false;
    let currentStepIndex = 0;
    let activeScenario = [];

    // Predefined Meeting Scenarios
    const scenarios = {
        stamp: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: 'みなさん、新しくアップグレードされた「AIスタンプ工場」の制作自動化プロセスについて、現在の進捗と改善点を議論しましょう。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'design', text: 'アバターの余白と透過処理に関して、10pxルールを視覚的にガイドするUI部品をスタンプエディタ側に新規作成しました。直感的になったと思います！' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'development', text: 'デザイン側の提案を受けて、エディタエンジンに自動透過プレビュー機能と、一元的なスタンプ切り出しトリミング処理を実装しました。外部ソフトは不要です。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'marketing', text: '素晴らしいですね。特に外部の画像編集ソフトを使わずにブラウザだけで透過・サイズ調整が完了する点は、SNSでバズるキラー機能になります！' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: '素晴らしい進捗です。この自動化フローを『AILineStampProducer』の標準コアモジュールとして統合して、リリースを急ぎましょう！' }
        ],
        kakeru: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: '「シナリオ書けるくん」のUI/UX改善について、各自からアイデアを出してください。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'design', text: '長時間の執筆でも疲れにくいよう、ダストカラーのフォントとガラス調カードをより落ち着いた透過比率（0.7）に調整するテーマ設定を追加したいです。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'development', text: 'それであれば、設定情報もローカルストレージで保存して永続化できるように対応します。文字数カウンターのリアルタイム処理の最適化も同時に完了しています。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'marketing', text: 'TRPGシナリオ執筆者に刺さるよう、キャラクター発言整形ツールである『LStylist』とワンクリックで連動できるパッケージとしてアピールしましょう！' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: '良い戦略ですね。シナリオ執筆とログ整形をシームレスにつなぐ、TRPGクリエイター向けトータルワークフローとして打ち出します。' }
        ],
        marketing: [
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'marketing', text: '次期ツールのリリースに向けて、SNSの反応を最大化するための施策案を提案します。開発チームとデザインチームにも協力してほしい部分があります。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'design', text: 'プロモーション用のバナーやアイキャッチに、エモ・クラゲのアセットを全面に押し出したネオンブルーのビジュアルを用意できますよ。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'development', text: '開発側としては、LPの表示速度を最適化するためにCSSグラデーションとSVGロゴを活用して、画像の読み込み遅延（Lazy Load）を徹底します。' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: '素晴らしい。デイヴ、このプロモーションパッケージを次のアップデート公開と同時に展開しましょう。事前のアナウンススケジュールを引いておきます。' }
        ],
        schedule: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'planning', text: '新ツール「スケジュールマネージャー」のブロック型予定配置と、既存カレンダー（SSCalendar）との機能重複を避けるためのポジショニングについて。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'development', text: 'SSCalendarは日付単位の簡潔なToDo志向、スケジュールマネージャーは場所と時間帯（ブロック）のドラッグ管理という棲み分けにしました。エンジン側でデータ連携も可能です。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'design', text: 'デザイン的にも、スケジュールマネージャーはガントチャートやタイムラインの視認性を重視し、SSCalendarは月間グリッドをベースにミニマルにまとめました。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'marketing', text: '「ライトに予定を俯瞰するSSCalendar」と「タスク＆タイムブロックを緻密に組むプランナー」という形で対比して、ビジネス用とクリエイター用に切り分け紹介します。' }
        ]
    };

    if (btnToggleMeeting) {
        btnToggleMeeting.addEventListener('click', () => {
            if (isMeetingActive) {
                stopMeeting();
            } else {
                startMeeting();
            }
        });
    }

    function startMeeting() {
        isMeetingActive = true;
        btnToggleMeeting.innerHTML = '<span class="material-icons-round">stop</span><span>会議を停止</span>';
        btnToggleMeeting.style.background = 'linear-gradient(135deg, #ef4444, #f43f5e)';
        
        const selectedTopic = meetingTopicSelect.value;
        const topicText = meetingTopicSelect.options[meetingTopicSelect.selectedIndex].text;
        chatTopicDisplay.innerText = `会議アジェンダ: ${topicText}`;
        
        // Load scenario based on topic
        activeScenario = scenarios[selectedTopic] || [];
        currentStepIndex = 0;
        
        // Clear chat
        chatContainer.innerHTML = '';
        appendSystemMessage('会議を開始しました。AI社員がアジェンダに沿って発言します。');
        
        // Disable topic select
        meetingTopicSelect.disabled = true;

        // Start step loop
        scheduleNextStep();
    }

    function stopMeeting() {
        isMeetingActive = false;
        if (meetingInterval) {
            clearTimeout(meetingInterval);
            meetingInterval = null;
        }
        btnToggleMeeting.innerHTML = '<span class="material-icons-round">play_arrow</span><span>会議を開始</span>';
        btnToggleMeeting.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        meetingTopicSelect.disabled = false;
        appendSystemMessage('会議はCEOによって一時停止されました。');
    }

    function scheduleNextStep() {
        if (!isMeetingActive || currentStepIndex >= activeScenario.length) {
            if (currentStepIndex >= activeScenario.length) {
                stopMeeting();
                appendSystemMessage('会議が正常に終了しました。本日の決定事項をタスクに反映します。');
            }
            return;
        }

        const currentSpeech = activeScenario[currentStepIndex];

        // 1. Show Typing Indicator
        showTypingIndicator(currentSpeech.sender);

        // 2. Wait and post message
        meetingInterval = setTimeout(() => {
            removeTypingIndicator();
            appendSpeechMessage(currentSpeech);
            currentStepIndex++;

            // Wait before next person speaks
            meetingInterval = setTimeout(() => {
                scheduleNextStep();
            }, 2000);
        }, 1500); // Typing simulation delay
    }

    function appendSystemMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chat-message';
        msg.innerHTML = `
            <div class="chat-avatar">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=System" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="chat-bubble-wrapper">
                <span class="chat-sender-name">システム</span>
                <div class="chat-bubble" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); color: var(--text-dim);">
                    ${text}
                </div>
            </div>
        `;
        chatContainer.appendChild(msg);
        scrollToBottom();
    }

    function appendSpeechMessage(speech) {
        // Map departments to colors
        const colors = {
            planning: 'var(--primary-color)',
            development: 'var(--secondary-color)',
            design: 'var(--accent-color)',
            marketing: 'var(--success)'
        };
        const activeColor = colors[speech.dept] || 'var(--text-dim)';

        const msg = document.createElement('div');
        msg.className = 'chat-message';
        msg.innerHTML = `
            <div class="chat-avatar" style="border: 1px solid ${activeColor};">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${speech.avatar || speech.sender}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="chat-bubble-wrapper">
                <span class="chat-sender-name" style="color: ${activeColor};">${speech.sender} (${speech.role})</span>
                <div class="chat-bubble" style="border-left: 4px solid ${activeColor};">
                    ${speech.text}
                </div>
            </div>
        `;
        chatContainer.appendChild(msg);
        scrollToBottom();
    }

    function showTypingIndicator(senderName) {
        removeTypingIndicator(); // Ensure no duplicates
        
        const indicator = document.createElement('div');
        indicator.id = 'chat-typing-indicator';
        indicator.className = 'chat-message';
        indicator.innerHTML = `
            <div class="chat-avatar" style="justify-content: center;">
                <span class="material-icons-round" style="font-size: 1.5rem; display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-dim);">more_horiz</span>
            </div>
            <div class="chat-bubble-wrapper">
                <span class="chat-sender-name" style="font-style: italic;">${senderName} が入力中...</span>
                <div class="chat-bubble typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const element = document.getElementById('chat-typing-indicator');
        if (element) {
            element.remove();
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // CEO Interruption / Message sending
    if (btnSendMessage && chatUserInput) {
        const handleSendMessage = () => {
            const text = chatUserInput.value.trim();
            if (!text) return;

            // Append CEO speech
            const msg = document.createElement('div');
            msg.className = 'chat-message self';
            msg.innerHTML = `
                <div class="chat-avatar" style="border: 1px solid var(--accent-color); justify-content: center;">
                    <span class="material-icons-round" style="color: var(--accent-color); font-size: 1.5rem; display:flex; align-items:center; justify-content:center; height:100%;">face</span>
                </div>
                <div class="chat-bubble-wrapper" style="align-items: flex-end;">
                    <span class="chat-sender-name">CEOユーザー</span>
                    <div class="chat-bubble">
                        ${text}
                    </div>
                </div>
            `;
            chatContainer.appendChild(msg);
            chatUserInput.value = '';
            scrollToBottom();

            // Pause scenario, let random employee answer the CEO
            if (isMeetingActive) {
                if (meetingInterval) {
                    clearTimeout(meetingInterval);
                }
                
                const employees = getEmployees();
                const randomEmp = employees[Math.floor(Math.random() * employees.length)];
                
                showTypingIndicator(randomEmp.name);
                
                setTimeout(() => {
                    removeTypingIndicator();
                    appendSpeechMessage({
                        sender: randomEmp.name,
                        role: randomEmp.role,
                        avatar: randomEmp.avatar,
                        dept: randomEmp.department,
                        text: `CEO、ご指示ありがとうございます。その指示を踏まえ、「${text}」の方針を最優先として各自のタスクへ反映いたします。`
                    });
                    
                    // Resume meeting after a short pause
                    setTimeout(() => {
                        scheduleNextStep();
                    }, 2500);
                }, 1800);
            } else {
                // If meeting is not active, PM answers
                showTypingIndicator('アリス');
                setTimeout(() => {
                    removeTypingIndicator();
                    appendSpeechMessage({
                        sender: 'アリス',
                        role: 'プロダクトマネージャー',
                        avatar: 'PM',
                        dept: 'planning',
                        text: `CEO、ご指摘ありがとうございます。「${text}」の指示について承知いたしました。会議を開始する際は本件を含めてディスカッションします。`
                    });
                }, 1200);
            }
        };

        btnSendMessage.addEventListener('click', handleSendMessage);
        chatUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // 7. Legacies: Real-time update simulation for dashboard
    let activityInterval = null;
    const legacyStatuses = ['オンライン', '取り込み中', '考案中', 'コーディング中', '調査中', 'テスト中', 'レビュー中'];
    const legacyProjects = [
        '書けるくんの統合',
        'UIグラスモルフィズムの修正',
        '共通ナビゲーションの監査',
        'SSCalendar v2アップデート',
        'VividStackレイヤーの修正',
        'LINEスタンプ最適化',
        'リード獲得API'
    ];

    function simulateActivity() {
        const cards = document.querySelectorAll('#dashboard-employees-grid .card');
        if (cards.length === 0) return;

        let employees = getEmployees();
        let changed = false;

        employees.forEach((emp, index) => {
            if (emp.progress !== undefined) {
                let currentVal = emp.progress;
                if (currentVal >= 100) {
                    currentVal = 0;
                    emp.status = legacyStatuses[Math.floor(Math.random() * legacyStatuses.length)];
                    emp.task = legacyProjects[Math.floor(Math.random() * legacyProjects.length)];
                    changed = true;
                } else {
                    currentVal += Math.floor(Math.random() * 5) + 1;
                    if (currentVal > 100) currentVal = 100;
                    changed = true;
                }
                emp.progress = currentVal;
            }
        });

        if (changed) {
            saveEmployees(employees);
            renderDashboardEmployees();
        }
    }

    // Initialize Dashboard rendering and simulation loop
    renderDashboardEmployees();
    activityInterval = setInterval(simulateActivity, 3500);

    // Initial view set
    switchView('dashboard');
});
