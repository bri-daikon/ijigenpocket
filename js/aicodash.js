document.addEventListener('DOMContentLoaded', () => {
    console.log('AICoDash initialized.');

    // Simulate real-time updates for AI employees
    const cards = document.querySelectorAll('.card');
    
    function simulateActivity() {
        cards.forEach(card => {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.task-progress span:last-child');
            const statusBadge = card.querySelector('.status-badge');
            
            if (progressFill && progressText) {
                // Get current percentage
                let currentVal = parseInt(progressText.innerText);
                
                // Randomly increment (sometimes reset if near 100)
                if (currentVal >= 99) {
                    currentVal = 0;
                    if (statusBadge) updateStatus(statusBadge);
                } else {
                    currentVal += Math.floor(Math.random() * 2);
                }
                
                progressText.innerText = currentVal + '%';
                progressFill.style.width = currentVal + '%';
            }
        });
    }

    const statuses = ['Online', 'Busy', 'Thinking', 'Coding', 'Researching', 'Testing'];
    
    function updateStatus(badge) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        badge.innerText = randomStatus;
        
        // Add a brief glow effect when status changes
        badge.style.transform = 'scale(1.1)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 300);
    }

    // Run simulation every 3 seconds
    setInterval(simulateActivity, 3000);

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
