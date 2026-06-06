document.addEventListener('DOMContentLoaded', () => {
    console.log('AICoDash initialized.');

    // 1. Initial State & Data Management (localStorage)
    const defaultEmployees = [
        {
            id: 'emp_pm',
            name: 'アリス',
            role: 'プロダクトマネージャー',
            department: 'linestamp',
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
            department: 'linestamp',
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
            department: 'linestamp',
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
            department: 'linestamp',
            avatar: 'Marketer',
            description: 'SNSでのトレンド分析を行い、次の製品のターゲット層を特定しています。',
            status: '分析中',
            progress: 95,
            task: '市場調査'
        },
        {
            id: 'emp_emoji_designer',
            name: 'エマ',
            role: '絵文字デザイナー',
            department: 'emoji',
            avatar: 'EmojiDesigner',
            description: '新規「絵文字部門」の立ち上げメンバー。感情表現豊かな絵文字パックのデザインを設計中。',
            status: '考案中',
            progress: 40,
            task: '絵文字ラフデザイン'
        },
        {
            id: 'emp_emoji_developer',
            name: 'フェリックス',
            role: '絵文字プログラマー',
            department: 'emoji',
            avatar: 'EmojiDeveloper',
            description: '新規「絵文字部門」の立ち上げメンバー。キーボードアプリやチャットアプリ用の絵文字挿入エンジンの開発を担当。',
            status: 'コーディング中',
            progress: 30,
            task: '挿入エンジンの実装'
        },
        {
            id: 'emp_trpg_planner',
            name: 'ガクト',
            role: 'TRPGシナリオ構成者',
            department: 'trpg_scenario',
            avatar: 'TRPGPlanner',
            description: '新規「TRPGシナリオ構成担当部門」の立ち上げメンバー。シナリオ全体のプロット設計と分岐ルートの整合性確認を担当。',
            status: 'オンライン',
            progress: 80,
            task: 'プロット構成案作成'
        },
        {
            id: 'emp_trpg_writer',
            name: 'ヒカリ',
            role: 'TRPGシナリオライター',
            department: 'trpg_scenario',
            avatar: 'TRPGWriter',
            description: '新規「TRPGシナリオ構成担当部門」の執筆コア。NPCの台詞回しや描写テキストの肉付けを得意とする。',
            status: 'オンライン',
            progress: 70,
            task: 'イベントテキスト執筆'
        },
        {
            id: 'emp_trpg_editor',
            name: 'ミヤビ',
            role: 'TRPGシナリオ校正者',
            department: 'trpg_scenario',
            avatar: 'TRPGEditor',
            description: '新規「TRPGシナリオ構成担当部門」の品質保証。表記揺れのチェックや、システムルールとの整合性確認を担当。',
            status: '待機中',
            progress: 100,
            task: '校正エンジン設定完了'
        },
        {
            id: 'emp_trpg_map',
            name: 'カイ',
            role: 'TRPGマップデザイナー',
            department: 'trpg_scenario',
            avatar: 'TRPGMapDesigner',
            description: '「TRPGシナリオ構成担当部門」の空間設計士。探索マップやダンジョンのグリッド配置、見取り図のデザインを担当。',
            status: 'オンライン',
            progress: 90,
            task: 'マッププロトタイプ作成'
        },
        {
            id: 'emp_trpg_graphic',
            name: 'ユウ',
            role: 'TRPGグラフィックデザイナー',
            department: 'trpg_scenario',
            avatar: 'TRPGGraphicDesigner',
            description: '「TRPGシナリオ構成担当部門」のビジュアル担当。トレーラー画像やNPCの立ち絵、セッション用背景イラストの作成を担当。',
            status: 'オンライン',
            progress: 85,
            task: 'イメージイラスト制作'
        }
    ];

    function getEmployees() {
        const stored = localStorage.getItem('aico_employees');
        if (!stored) {
            localStorage.setItem('aico_employees', JSON.stringify(defaultEmployees));
            return defaultEmployees;
        }
        let employees = JSON.parse(stored);
        
        let migrated = false;
        employees = employees.map(emp => {
            if (['planning', 'development', 'design', 'marketing'].includes(emp.department)) {
                emp.department = 'linestamp';
                migrated = true;
            }
            return emp;
        });

        const hasEmma = employees.some(emp => emp.id === 'emp_emoji_designer');
        const hasFelix = employees.some(emp => emp.id === 'emp_emoji_developer');
        const hasGakuto = employees.some(emp => emp.id === 'emp_trpg_planner');
        const hasHikari = employees.some(emp => emp.id === 'emp_trpg_writer');
        const hasMiyabi = employees.some(emp => emp.id === 'emp_trpg_editor');
        const hasKai = employees.some(emp => emp.id === 'emp_trpg_map');
        const hasYu = employees.some(emp => emp.id === 'emp_trpg_graphic');

        if (!hasEmma) {
            const emma = defaultEmployees.find(emp => emp.id === 'emp_emoji_designer');
            if (emma) {
                employees.push(emma);
                migrated = true;
            }
        }
        if (!hasFelix) {
            const felix = defaultEmployees.find(emp => emp.id === 'emp_emoji_developer');
            if (felix) {
                employees.push(felix);
                migrated = true;
            }
        }
        if (!hasGakuto) {
            const gakuto = defaultEmployees.find(emp => emp.id === 'emp_trpg_planner');
            if (gakuto) {
                employees.push(gakuto);
                migrated = true;
            }
        }
        if (!hasHikari) {
            const hikari = defaultEmployees.find(emp => emp.id === 'emp_trpg_writer');
            if (hikari) {
                employees.push(hikari);
                migrated = true;
            }
        }
        if (!hasMiyabi) {
            const miyabi = defaultEmployees.find(emp => emp.id === 'emp_trpg_editor');
            if (miyabi) {
                employees.push(miyabi);
                migrated = true;
            }
        }
        if (!hasKai) {
            const kai = defaultEmployees.find(emp => emp.id === 'emp_trpg_map');
            if (kai) {
                employees.push(kai);
                migrated = true;
            }
        }
        if (!hasYu) {
            const yu = defaultEmployees.find(emp => emp.id === 'emp_trpg_graphic');
            if (yu) {
                employees.push(yu);
                migrated = true;
            }
        }

        if (migrated) {
            localStorage.setItem('aico_employees', JSON.stringify(employees));
        }

        return employees;
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
        } else if (viewId === 'meeting') {
            const topic = meetingTopicSelect ? meetingTopicSelect.value : '';
            const trpgPanel = document.getElementById('trpg-generator-panel');
            if (topic === 'trpg_scenario' && trpgPanel) {
                trpgPanel.style.display = 'block';
                if (typeof checkApiStatus === 'function') checkApiStatus();
            } else if (trpgPanel) {
                trpgPanel.style.display = 'none';
            }
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
            if (emp.department === 'linestamp') deptColor = 'var(--primary-color)';
            if (emp.department === 'emoji') deptColor = 'var(--accent-color)';
            if (emp.department === 'trpg_scenario') deptColor = 'var(--secondary-color)';

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
                linestamp: 'LINEスタンプ部門 (Line Stamp)',
                emoji: '絵文字部門 (Emoji)',
                trpg_scenario: 'TRPGシナリオ構成担当部門 (TRPG Scenario)'
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
                            <option value="linestamp" ${emp.department === 'linestamp' ? 'selected' : ''}>LINEスタンプ部門</option>
                            <option value="emoji" ${emp.department === 'emoji' ? 'selected' : ''}>絵文字部門</option>
                            <option value="trpg_scenario" ${emp.department === 'trpg_scenario' ? 'selected' : ''}>TRPGシナリオ構成担当部門</option>
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
            linestamp: [],
            emoji: [],
            trpg_scenario: []
        };

        employees.forEach(emp => {
            if (depts[emp.department]) {
                depts[emp.department].push(emp);
            }
        });

        // Find primary PM / Leader (from linestamp dept)
        const linestampLeader = depts.linestamp.length > 0 ? depts.linestamp.find(e => e.role.includes('マネージャー') || e.role.includes('PM')) || depts.linestamp[0] : null;
        const otherLinestamp = depts.linestamp.filter(e => e !== linestampLeader);

        // Build HTML
        let html = `
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

        if (linestampLeader) {
            html += `
                <div class="org-level-2">
                    <div class="org-node pm">
                        <div class="avatar-small" style="border: 2px solid var(--primary-color);">
                            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${linestampLeader.avatar || linestampLeader.name}" style="width:100%;height:100%;object-fit:cover;">
                        </div>
                        <div class="org-node-info">
                            <h4>${linestampLeader.name}</h4>
                            <p>${linestampLeader.role}</p>
                        </div>
                    </div>
            `;
        } else {
            html += `
                <div class="org-level-2">
                    <div class="org-node pm" style="border-style: dashed; opacity: 0.6;">
                        <div class="avatar-small" style="justify-content: center;">
                            <span class="material-icons-round" style="color: var(--text-dim); display: flex; align-items: center; justify-content: center; height: 100%;">person_off</span>
                        </div>
                        <div class="org-node-info">
                            <h4>PM 未アサイン</h4>
                            <p>LINEスタンプ部門長</p>
                        </div>
                    </div>
            `;
        }

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

        html += generateDeptBranch('LINEスタンプ部門 (LINE Stamp)', otherLinestamp, '--primary-color');
        html += generateDeptBranch('絵文字部門 (Emoji)', depts.emoji, '--accent-color');
        html += generateDeptBranch('TRPGシナリオ構成担当部門 (TRPG Scenario)', depts.trpg_scenario, '--secondary-color');

        html += `</div></div>`;
        treeContent.innerHTML = html;
    }

    const btnToggleMeeting = document.getElementById('btn-toggle-meeting');
    const meetingTopicSelect = document.getElementById('meeting-topic-select');
    const chatTopicDisplay = document.getElementById('chat-topic-display');
    const chatContainer = document.getElementById('chat-messages-container');
    const chatUserInput = document.getElementById('chat-user-input');
    const btnSendMessage = document.getElementById('btn-send-message');
    const meetingApiKeyInput = document.getElementById('meeting-api-key');

    let meetingInterval = null;
    let isMeetingActive = false;
    let currentStepIndex = 0;
    let activeScenario = [];
    let meetingHistory = [];
    let activeEmployees = [];

    if (meetingApiKeyInput) {
        const savedApiKey = localStorage.getItem('stampToolApiKey');
        if (savedApiKey) meetingApiKeyInput.value = savedApiKey;
        meetingApiKeyInput.addEventListener('input', (e) => {
            localStorage.setItem('stampToolApiKey', e.target.value.trim());
        });
    }

    async function callGeminiApi(apiKey, contents, retries = 3, delay = 1000) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: contents })
                });
                
                if (response.status === 503 || response.status === 429) {
                    if (i < retries - 1) {
                        console.warn(`Gemini API returned ${response.status}. Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2;
                        continue;
                    }
                }
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            } catch (error) {
                if (i === retries - 1) throw error;
                console.warn(`Fetch error: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            }
        }
    }

    const scenarios = {
        stamp: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: 'みなさん、新しくアップグレードされた「AIスタンプ工場」の制作自動化プロセスについて、現在の進捗と改善点を議論しましょう。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'linestamp', text: 'アバターの余白と透過処理に関して、10pxルールを視覚的にガイドするUI部品をスタンプエディタ側に新規作成しました。直感的になったと思います！' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'linestamp', text: 'デザイン側の提案を受けて、エディタエンジンに自動透過プレビュー機能と、一元的なスタンプ切り出しトリミング処理を実装しました。外部ソフトは不要です。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'linestamp', text: '素晴らしいですね。特に外部の画像編集ソフトを使わずにブラウザだけで透過・サイズ調整が完了する点は、SNSでバズるキラー機能になります！' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '素晴らしい進捗です。この自動化フローを『AILineStampProducer』の標準コアモジュールとして統合して、リリースを急ぎましょう！' }
        ],
        kakeru: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '「シナリオ書けるくん」のUI/UX改善について、各自からアイデアを出してください。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'linestamp', text: '長時間の執筆でも疲れにくいよう、ダストカラーのフォントとガラス調カードをより落ち着いた透過比率（0.7）に調整するテーマ設定を追加したいです。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'linestamp', text: 'それであれば、設定情報もローカルストレージで保存して永続化できるように対応します。文字数カウンターのリアルタイム処理の最適化も同時に完了しています。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'linestamp', text: 'TRPGシナリオ執筆者に刺さるよう、キャラクター発言整形ツールである『LStylist』とワンクリックで連動できるパッケージとしてアピールしましょう！' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '良い戦略ですね。シナリオ執筆とログ整形をシームレスにつなぐ、TRPGクリエーター向けトータルワークフローとして打ち出します。' }
        ],
        marketing: [
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'linestamp', text: '次期ツールのリリースに向けて、SNSの反応を最大化するための施策案を提案します。開発チームとデザインチームにも協力してほしい部分があります。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'linestamp', text: 'プロモーション用のバナーやアイキャッチに、エモ・クラゲのアセットを全面に押し出したネオンブルーのビジュアルを用意できますよ。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'linestamp', text: '開発側としては、LP の表示速度を最適化するためにCSSグラデーションとSVGロゴを活用して、画像の読み込み遅延（Lazy Load）を徹底します。' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '素晴らしい。デイヴ、このプロモーションパッケージを次のアップデート公開と同時に展開しましょう。事前のアナウンススケジュールを引いておきます。' }
        ],
        schedule: [
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '新ツール「スケジュールマネージャー」のブロック型予定配置と、既存カレンダー（SSCalendar）との機能重複を避けるためのポジショニングについて。' },
            { sender: 'チャーリー', role: 'リードエンジニア', avatar: 'Developer', dept: 'linestamp', text: 'SSCalendarは日付単位の簡潔なToDo志向、スケジュールマネージャーは場所と時間帯（ブロック）のドラッグ管理という棲み分けにしました。エンジン側でデータ連携も可能です。' },
            { sender: 'ボブ', role: 'UI/UXデザイナー', avatar: 'Designer', dept: 'linestamp', text: 'デザイン的に、スケジュールマネージャーはガントチャートやタイムラインの視認性を重視し、SSCalendarは月間グリッドをベースにミニマルにまとめました。' },
            { sender: 'デイヴ', role: 'マーケティングスペシャリスト', avatar: 'Marketer', dept: 'linestamp', text: '「ライトに予定を俯瞰するSSCalendar」と「タスク＆タイムブロックを緻密に組むプランナー」という形で対比して、ビジネス用とクリエイター用に切り分け紹介します。' }
        ],
        emoji: [
            { sender: 'エマ', role: '絵文字デザイナー', avatar: 'EmojiDesigner', dept: 'emoji', text: 'CEO！新設された「絵文字部門」の初ミーティングです。現在、感情表現が豊かな新しい絵文字パックのデザインを制作しています。' },
            { sender: 'フェリックス', role: '絵文字プログラマー', avatar: 'EmojiDeveloper', dept: 'emoji', text: '開発側では、キーボードやチャット画面で絵文字をスムーズに検索・挿入できる軽量な挿入エンジンのプロトタイプを開発中です。' },
            { sender: 'アリス', role: 'プロダクトマネージャー', avatar: 'PM', dept: 'linestamp', text: '絵文字部門の立ち上げ、順調そうですね。LINEスタンプ部門で培ったアセット管理や透過処理のノウハウはいつでも共有しますよ！' },
            { sender: 'エマ', role: '絵文字デザイナー', avatar: 'EmojiDesigner', dept: 'emoji', text: 'ありがとうございます、アリスさん！スタンプの画像サイズやフォーマット調整の自動化エンジンは、絵文字制作でも大いに活用できそうです。' },
            { sender: 'フェリックス', role: '絵文字プログラマー', avatar: 'EmojiDeveloper', dept: 'emoji', text: 'そうですね。APIの共通化などを進めて、両部門でシナジーを生み出せるような設計を目指します。' }
        ],
        trpg_scenario: [
            { sender: 'ガクト', role: 'TRPGシナリオ構成者', avatar: 'TRPGPlanner', dept: 'trpg_scenario', text: 'CEO、TRPGシナリオ構成担当部門のミーティングを開始します。現在、複数ルート分岐型シナリオのプロット設計と、新規メンバーを含めた制作体制を話し合っています。' },
            { sender: 'ヒカリ', role: 'TRPGシナリオライター', avatar: 'TRPGWriter', dept: 'trpg_scenario', text: 'プロットに沿って、NPC of セリフやイベントの情景描写を執筆中です！今回はビジュアルとマップの表現力も大幅に強化できそうですね。' },
            { sender: 'カイ', role: 'TRPGマップデザイナー', avatar: 'TRPGMapDesigner', dept: 'trpg_scenario', text: 'はい！探索フェーズの楽しさを引き出すため、詳細なダンジョンマップや洋館の間取り図などのマップデータを用意し、シナリオと連動させていきます。' },
            { sender: 'ユウ', role: 'TRPGグラフィックデザイナー', avatar: 'TRPGGraphicDesigner', dept: 'trpg_scenario', text: '私はトレーラー用バナーやNPCのビジュアル、シーンのイメージイラストを担当します。生成AIと連携して、キービジュアルも自動で作り出せますよ！' },
            { sender: 'ミヤビ', role: 'TRPGシナリオ校正者', avatar: 'TRPGEditor', dept: 'trpg_scenario', text: '執筆されたテキストの表記揺れチェックやルールの整合性確認に加え、マップの部屋構成と描写文の矛盾がないかも含めて校正フローに入れました。' },
            { sender: 'ガクト', role: 'TRPGシナリオ構成者', avatar: 'TRPGPlanner', dept: 'trpg_scenario', text: '心強いですね。執筆・マップ設計・グラフィック制作がシームレスに回るよう、AI画像生成も含めた統合ワークフローを構築していきましょう！' }
        ]
    };

    if (btnToggleMeeting) {
        btnToggleMeeting.addEventListener('click', () => {
            isMeetingActive ? stopMeeting() : startMeeting();
        });
    }

    function selectActiveEmployees(topic) {
        const allEmployees = getEmployees();
        let targetDept = topic === 'emoji' ? 'emoji' : (topic === 'trpg_scenario' ? 'trpg_scenario' : 'linestamp');
        let members = allEmployees.filter(emp => emp.department === targetDept);
        if (members.length === 0) members = allEmployees.slice(0, 4);
        const alice = allEmployees.find(e => e.role.includes('PM'));
        if (alice && !members.some(m => m.id === alice.id)) members.unshift(alice);
        return members;
    }

    function startMeeting() {
        isMeetingActive = true;
        btnToggleMeeting.innerHTML = '<span class="material-icons-round">stop</span><span>会議を停止</span>';
        btnToggleMeeting.style.background = 'linear-gradient(135deg, #ef4444, #f43f5e)';
        const selectedTopic = meetingTopicSelect.value;
        const topicText = meetingTopicSelect.options[meetingTopicSelect.selectedIndex].text;
        chatTopicDisplay.innerText = `会議アジェンダ: ${topicText}`;
        chatContainer.innerHTML = '';
        meetingTopicSelect.disabled = true;
        if (meetingApiKeyInput) meetingApiKeyInput.disabled = true;

        const apiKey = localStorage.getItem('stampToolApiKey');
        if (apiKey) {
            activeEmployees = selectActiveEmployees(selectedTopic);
            meetingHistory = [];
            appendSystemMessage('リアルAI会議を開始しました。Gemini API を使って社員たちが自律的に議論します。');
            const pm = activeEmployees.find(e => e.role.includes('PM')) || activeEmployees[0];
            const speech = { sender: pm.name, role: pm.role, avatar: pm.avatar, dept: pm.department, text: `みなさん、本日の会議を始めます。議題は「${topicText}」です。自由に進捗や意見を出してください。` };
            showTypingIndicator(pm.name);
            setTimeout(() => {
                removeTypingIndicator();
                appendSpeechMessage(speech);
                meetingHistory.push(speech);
                scheduleNextRealAiSpeech();
            }, 1200);
        } else {
            activeScenario = scenarios[selectedTopic] || [];
            currentStepIndex = 0;
            appendSystemMessage('会議を開始しました。(デモモード)');
            scheduleNextStep();
        }
    }

    function stopMeeting() {
        isMeetingActive = false;
        if (meetingInterval) clearTimeout(meetingInterval);
        btnToggleMeeting.innerHTML = '<span class="material-icons-round">play_arrow</span><span>会議を開始</span>';
        btnToggleMeeting.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        meetingTopicSelect.disabled = false;
        if (meetingApiKeyInput) meetingApiKeyInput.disabled = false;
        appendSystemMessage('会議はCEOによって停止されました。');
    }

    function scheduleNextStep() {
        if (!isMeetingActive || currentStepIndex >= activeScenario.length) {
            if (currentStepIndex >= activeScenario.length) {
                stopMeeting();
                appendSystemMessage('会議が正常に終了しました。');
            }
            return;
        }
        const currentSpeech = activeScenario[currentStepIndex];
        showTypingIndicator(currentSpeech.sender);
        meetingInterval = setTimeout(() => {
            removeTypingIndicator();
            appendSpeechMessage(currentSpeech);
            currentStepIndex++;
            meetingInterval = setTimeout(scheduleNextStep, 2500);
        }, 1500);
    }

    function scheduleNextRealAiSpeech() {
        if (!isMeetingActive) return;
        meetingInterval = setTimeout(async () => {
            const apiKey = localStorage.getItem('stampToolApiKey');
            if (!apiKey) { stopMeeting(); return; }
            
            const activeMemberNames = activeEmployees.map(e => e.name).join(', ');
            const membersInfo = activeEmployees.map(e => `${e.name} (${e.role}, ID: ${e.id})`).join('\n');
            
            let lastSpeakerName = "";
            if (meetingHistory.length > 0) {
                lastSpeakerName = meetingHistory[meetingHistory.length - 1].sender;
            }
            const candidateSpeakers = activeEmployees.filter(e => e.name !== lastSpeakerName);
            const tempSpeaker = candidateSpeakers.length > 0 ? candidateSpeakers[Math.floor(Math.random() * candidateSpeakers.length)] : activeEmployees[0];
            
            showTypingIndicator(tempSpeaker.name);
            
            try {
                const formattedHistory = meetingHistory.map(h => `${h.sender} (${h.role}): ${h.text}`).join('\n');
                
                const systemPrompt = `
あなたは有能なAI会議ファシリテーターです。
現在、以下のメンバーで会議を行っています。

【メンバー一覧】
${membersInfo}

【アジェンダ（議題）】
"${meetingTopicSelect.options[meetingTopicSelect.selectedIndex].text}"

【これまでの発言履歴】
${formattedHistory}

【指示】
発言履歴の流れを読み、次に発言するのに最も適した社員を【メンバー一覧】から1名選んでください。
選んだ社員のキャラクターや役割（PM、エンジニア、デザイナー、マーケター等）にふさわしい、具体的で前向きな発言（2〜3文）を生成してください。
発言は「です・ます」調で、その社員の口調にしてください。
会議がマンネリ化しないよう、前の発言への同意だけでなく、新しい提案や課題定義、自分の専門領域からの視点（デザイン、技術、マーケ等）を含めてください。

出力は必ず以下の有効なJSONフォーマットのみとしてください。余計な説明や前置き、\`\`\`json マークダウンなどは含めないでください。
{
  "next_speaker_id": "選んだ社員のID",
  "speech": "発言内容"
}
`;
                const rawResponse = await callGeminiApi(apiKey, [{ role: 'user', parts: [{ text: systemPrompt }] }]);
                let cleanedJson = rawResponse.replace(/```json|```/g, '').trim();
                const responseData = JSON.parse(cleanedJson);
                
                const nextSpeaker = activeEmployees.find(e => e.id === responseData.next_speaker_id) || tempSpeaker;
                
                removeTypingIndicator();
                showTypingIndicator(nextSpeaker.name);
                
                setTimeout(() => {
                    removeTypingIndicator();
                    const speech = {
                        sender: nextSpeaker.name,
                        role: nextSpeaker.role,
                        avatar: nextSpeaker.avatar,
                        dept: nextSpeaker.department,
                        text: responseData.speech
                    };
                    appendSpeechMessage(speech);
                    meetingHistory.push(speech);
                    if (meetingHistory.length > 30) meetingHistory.shift();
                    
                    scheduleNextRealAiSpeech();
                }, 1000);
            } catch (err) {
                console.error(err);
                removeTypingIndicator();
                appendSystemMessage(`通信エラーが発生しました (${err.message})。デモメッセージで会議を代行・継続します。`);
                
                const randomEmp = activeEmployees[Math.floor(Math.random() * activeEmployees.length)];
                showTypingIndicator(randomEmp.name);
                
                setTimeout(() => {
                    removeTypingIndicator();
                    const mockTexts = [
                        "その点については同意です。現在直面している課題に対して、優先度をつけて順次解決していきましょう。",
                        "確かに、ユーザーの利便性を最優先に考えるべきですね。その方向でアセットの再設計を進めてみます。",
                        "開発側としても、その方針であれば実装の目処が立ちます。データの整合性を保ちつつ、統合を進めます。",
                        "マーケティングの観点からも、その追加機能はプロモーションの大きな強みになります。ぜひ進めましょう！"
                    ];
                    const speech = {
                        sender: randomEmp.name,
                        role: randomEmp.role,
                        avatar: randomEmp.avatar,
                        dept: randomEmp.department,
                        text: mockTexts[Math.floor(Math.random() * mockTexts.length)]
                    };
                    appendSpeechMessage(speech);
                    meetingHistory.push(speech);
                    if (meetingHistory.length > 30) meetingHistory.shift();
                    
                    scheduleNextRealAiSpeech();
                }, 2000);
            }
        }, 3500);
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
        const colors = {
            linestamp: 'var(--primary-color)',
            emoji: 'var(--accent-color)',
            trpg_scenario: 'var(--secondary-color)',
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
        removeTypingIndicator();
        
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

    if (btnSendMessage && chatUserInput) {
        const handleSendMessage = () => {
            const text = chatUserInput.value.trim();
            if (!text) return;

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

            const apiKey = localStorage.getItem('stampToolApiKey');

            if (isMeetingActive) {
                if (meetingInterval) {
                    clearTimeout(meetingInterval);
                }
                
                if (apiKey) {
                    meetingHistory.push({
                        sender: 'CEO',
                        role: '最高経営責任者',
                        avatar: 'CEO',
                        dept: 'ceo',
                        text: text
                    });
                    scheduleNextRealAiSpeech();
                } else {
                    const employeesList = getEmployees();
                    const randomEmp = employeesList[Math.floor(Math.random() * employeesList.length)];
                    
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
                        
                        setTimeout(() => {
                            scheduleNextStep();
                        }, 2500);
                    }, 1800);
                }
            } else {
                if (apiKey) {
                    showTypingIndicator('アリス');
                    setTimeout(async () => {
                        try {
                            const systemPrompt = `
あなたはプロダクトマネージャーの「アリス」です。
現在、CEOから「${text}」という個別の指示を受け取りました。
アリスのキャラクター（冷静で有能なPM、スタンプ部門所属）になりきって、この指示に対する丁寧な承諾や意見を1〜2文でCEOに返答してください。
他の説明や余計な修飾、JSON構造などは含めず、純粋な発言テキストのみを出力してください。
`;
                            const contents = [{ role: 'user', parts: [{ text: systemPrompt }] }];
                            const responseText = await callGeminiApi(apiKey, contents);
                            
                            removeTypingIndicator();
                            appendSpeechMessage({
                                sender: 'アリス',
                                role: 'プロダクトマネージャー',
                                avatar: 'PM',
                                dept: 'linestamp',
                                text: responseText.trim()
                            });
                        } catch (err) {
                            removeTypingIndicator();
                            appendSpeechMessage({
                                sender: 'アリス',
                                role: 'プロダクトマネージャー',
                                avatar: 'PM',
                                dept: 'linestamp',
                                text: `CEO、ご指示を承知いたしました。API呼び出しに失敗しましたが、後ほど対応いたします。`
                            });
                        }
                    }, 1200);
                } else {
                    showTypingIndicator('アリス');
                    setTimeout(() => {
                        removeTypingIndicator();
                        appendSpeechMessage({
                            sender: 'アリス',
                            role: 'プロダクトマネージャー',
                            avatar: 'PM',
                            dept: 'linestamp',
                            text: `CEO、ご指摘ありがとうございます。「${text}」の指示について承知いたしました。会議を開始する際は本件を含めてディスカッションします。`
                        });
                    }, 1200);
                }
            }
        };

        btnSendMessage.addEventListener('click', handleSendMessage);
        chatUserInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

        // --- TRPG シナリオ自動生成 UI & API 連携の実装 ---
        const trpgPanel = document.getElementById('trpg-generator-panel');
        const trpgIdeaInput = document.getElementById('trpg-idea-input');
        const btnRunTrpgGen = document.getElementById('btn-run-trpg-generator');
        const trpgGenStatus = document.getElementById('trpg-gen-status');
        const apiStatusDot = document.getElementById('api-status-dot');
        const apiStatusText = document.getElementById('api-status-text');

        // APIサーバーの稼働状況を確認する関数 (グローバル公開して switchView からも呼べるようにする)
        window.checkApiStatus = async function() {
            if (!trpgPanel || !btnRunTrpgGen) return;
            try {
                const response = await fetch('http://localhost:8080', { method: 'GET' });
                if (response.ok) {
                    apiStatusDot.style.backgroundColor = 'var(--success)';
                    apiStatusText.innerText = 'Online';
                    btnRunTrpgGen.disabled = false;
                    btnRunTrpgGen.style.opacity = '1';
                    btnRunTrpgGen.style.cursor = 'pointer';
                } else {
                    throw new Error('Not ok');
                }
            } catch (err) {
                apiStatusDot.style.backgroundColor = 'var(--danger)';
                apiStatusText.innerText = 'Offline';
                btnRunTrpgGen.disabled = true;
                btnRunTrpgGen.style.opacity = '0.5';
                btnRunTrpgGen.style.cursor = 'not-allowed';
            }
        };

        // アジェンダ変更時の表示切り替え & ステータスチェック
        if (meetingTopicSelect) {
            meetingTopicSelect.addEventListener('change', () => {
                const topic = meetingTopicSelect.value;
                if (topic === 'trpg_scenario') {
                    trpgPanel.style.display = 'block';
                    window.checkApiStatus();
                } else {
                    trpgPanel.style.display = 'none';
                }
            });
        }

        // 自動生成を実行するボタン処理
        if (btnRunTrpgGen) {
            btnRunTrpgGen.addEventListener('click', async () => {
                const idea = trpgIdeaInput.value.trim();
                if (!idea) {
                    alert('シナリオのアイデア（ネタ）を入力してください。');
                    return;
                }

                // 進行中ステータスに変更
                btnRunTrpgGen.disabled = true;
                btnRunTrpgGen.style.opacity = '0.5';
                trpgGenStatus.innerHTML = `
                    <span class="typing-dot" style="animation: typingBounce 1.4s infinite -0.32s both; width: 6px; height: 6px; background-color: var(--secondary-color); border-radius: 50%; display: inline-block;"></span>
                    <span class="typing-dot" style="animation: typingBounce 1.4s infinite -0.16s both; width: 6px; height: 6px; background-color: var(--secondary-color); border-radius: 50%; display: inline-block; margin-left: 2px;"></span>
                    <span class="typing-dot" style="animation: typingBounce 1.4s infinite both; width: 6px; height: 6px; background-color: var(--secondary-color); border-radius: 50%; display: inline-block; margin-left: 2px;"></span>
                    <span style="margin-left: 0.5rem; color: var(--secondary-color); font-weight: bold;">AI社員たちが執筆・画像設計・エクスポートを処理中... (約1〜2分かかります)</span>
                `;

                try {
                    const response = await fetch('http://localhost:8080/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ idea: idea })
                    });

                    const result = await response.json();
                    
                    if (response.ok && result.status === 'success') {
                        trpgGenStatus.innerHTML = `
                            <span class="material-icons-round" style="color: var(--success); font-size: 1.2rem; vertical-align: middle;">check_circle</span>
                            <span style="color: var(--success); font-weight: bold; vertical-align: middle;">${result.message}</span>
                        `;
                        trpgIdeaInput.value = '';
                    } else {
                        throw new Error(result.message || '生成エラーが発生しました。');
                    }
                } catch (err) {
                    trpgGenStatus.innerHTML = `
                        <span class="material-icons-round" style="color: var(--danger); font-size: 1.2rem; vertical-align: middle;">error</span>
                        <span style="color: var(--danger); font-weight: bold; vertical-align: middle;">エラー: ${err.message}</span>
                    `;
                } finally {
                    setTimeout(() => {
                        window.checkApiStatus();
                    }, 4000);
                }
            });
        }
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
