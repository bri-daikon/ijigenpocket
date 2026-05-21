document.addEventListener('DOMContentLoaded', () => {
    console.log('AICoDash initialized.');

    // Simulate real-time updates for AI employees
    const cards = document.querySelectorAll('.card');
    
    const statuses = ['繧ｪ繝ｳ繝ｩ繧､繝ｳ', '蜿悶ｊ霎ｼ縺ｿ荳ｭ', '閠・｡井ｸｭ', '繧ｳ繝ｼ繝・ぅ繝ｳ繧ｰ荳ｭ', '隱ｿ譟ｻ荳ｭ', '繝・せ繝井ｸｭ', '繝ｬ繝薙Η繝ｼ荳ｭ'];
    const projects = [
        '譖ｸ縺代ｋ縺上ｓ縺ｮ邨ｱ蜷・,
        'UI繧ｰ繝ｩ繧ｹ繝｢繝ｫ繝輔ぅ繧ｺ繝縺ｮ菫ｮ豁｣',
        '蜈ｱ騾壹リ繝薙ご繝ｼ繧ｷ繝ｧ繝ｳ縺ｮ逶｣譟ｻ',
        'SSCalendar v2繧｢繝・・繝・・繝・,
        'VividStack繝ｬ繧､繝､繝ｼ縺ｮ菫ｮ豁｣',
        'LINE繧ｹ繧ｿ繝ｳ繝玲怙驕ｩ蛹・,
        '繝ｪ繝ｼ繝臥佐蠕輸PI'
    ];
    
    function simulateActivity() {
        cards.forEach((card, index) => {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.task-progress span:last-child');
            const taskLabel = card.querySelector('.task-progress span:first-child');
            const statusBadge = card.querySelector('.status-badge');
            
            if (progressFill && progressText) {
                let currentVal = parseInt(progressText.innerText);
                
                if (currentVal >= 100) {
                    currentVal = 0;
                    if (statusBadge) updateStatus(statusBadge);
                    if (taskLabel) {
                        const randomProject = projects[Math.floor(Math.random() * projects.length)];
                        taskLabel.innerText = randomProject;
                    }
                } else {
                    currentVal += Math.floor(Math.random() * 3);
                    if (currentVal > 100) currentVal = 100;
                }
                
                progressText.innerText = currentVal + '%';
                progressFill.style.width = currentVal + '%';
            }
        });
    }

    function updateStatus(badge) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        badge.innerText = randomStatus;
        
        // Change colors based on status
        badge.className = 'status-badge ' + (randomStatus === 'Coding' || randomStatus === 'Busy' ? 'status-active' : 'status-active');
        
        badge.style.transform = 'scale(1.1)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }

    // Run simulation every 2.5 seconds
    setInterval(simulateActivity, 2500);

    // Add click effect to nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href') === '#') e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Add hover sound effect simulation (visual only for now)
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Future: play subtle sound
        });
    });
});
