/**
 * 共通ナビゲーション制御スクリプト
 */
document.addEventListener('DOMContentLoaded', () => {
    const tools = [
        { name: "クリファンチェック表", url: "crifancheck.html" },
        { name: "ディスプレイジェネレーター", url: "DGenerator.html" },
        { name: "LogStylist", url: "LStylist.html" },
        { name: "書けるくん", url: "KakeruKun.html" },
        { name: "今日のお題", url: "odaiindex.html" },
        { name: "FriendsEntry", url: "FriendsEntry.html" },
        { name: "連番リネーム", url: "RenReNm.html" },
        { name: "ScrapKiritan", url: "ScrapKiritan.html" },
        { name: "VividStack", url: "VividStack.html" },
        { name: "LINEスタンプメーカー", url: "LINESTMPkiritoru.html" },
        { name: "タスク管理", url: "ijigentask.html" },
        { name: "SSCalendar", url: "SSCalendar.html" },
        { name: "HTML比較", url: "HtmlCompare.html" }
    ];

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // ナビゲーションHTMLの構築
    const nav = document.createElement('nav');
    nav.id = 'common-nav';
    nav.innerHTML = `
        <div class="nav-container">
            <a href="index_true.html" class="nav-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span>INDEX</span>
            </a>
            <div class="nav-spacer"></div>
            <div class="nav-dropdown">
                <button class="nav-dropbtn">
                    <span>ツールを切り替え</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <div class="nav-dropdown-content">
                    ${tools.map(tool => `
                        <a href="${tool.url}" class="${currentPath === tool.url ? 'active' : ''}">
                            ${tool.name}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // bodyの先頭に挿入
    document.body.prepend(nav);

    // スクロール時に影をつける
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
});
