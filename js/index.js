const searchInput = document.getElementById('toolSearch');
const toolCards = document.querySelectorAll('.tool-card');
const toolSections = document.querySelectorAll('.tool-section');
const noResults = document.getElementById('noResults');

// 検索機能のロジック
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    let totalVisible = 0;

    toolSections.forEach(section => {
        let sectionHasVisibleCard = false;
        const cards = section.querySelectorAll('.tool-card');

        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const filename = card.querySelector('span').textContent.toLowerCase();

            if (title.includes(query) || desc.includes(query) || filename.includes(query)) {
                card.classList.remove('card-hidden');
                sectionHasVisibleCard = true;
                totalVisible++;
            } else {
                card.classList.add('card-hidden');
            }
        });

        // セクション内に表示するカードが1つもなければセクションごと隠す
        if (sectionHasVisibleCard) {
            section.classList.remove('card-hidden');
        } else {
            section.classList.add('card-hidden');
        }
    });

    // 全て非表示の場合はメッセージを出す
    if (totalVisible === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
    }
});

function clearSearch() {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.focus();
}
