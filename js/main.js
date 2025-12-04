document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const contentViewer = document.getElementById('content-viewer');
    const backBtn = document.getElementById('back-btn');
    const navCards = document.querySelectorAll('.nav-card');
    const viewSections = document.querySelectorAll('.view-section');
    const navItems = document.querySelectorAll('.nav-item');

    // Navigation Mapping
    const sectionTitles = {
        'about': 'About Me',
        'experience': 'Experience',
        'papers': 'Publications',
        'awards': 'Awards'
    };

    // Function to open a section
    function openSection(targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            // Hide all sections first
            viewSections.forEach(sec => sec.classList.remove('active'));

            // Show target section
            targetSection.classList.add('active');

            // Update Menu Active State
            navItems.forEach(item => {
                if (item.getAttribute('data-target') === targetId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Show Viewer
            contentViewer.classList.add('active');

            // Scroll to top of viewer
            contentViewer.scrollTop = 0;
        }
    }

    // Function to close the viewer
    function closeViewer() {
        contentViewer.classList.remove('active');
        // Clear active sections after transition (optional, but good for clean state)
        setTimeout(() => {
            viewSections.forEach(sec => sec.classList.remove('active'));
            navItems.forEach(item => item.classList.remove('active'));
        }, 500);
    }

    // Open Section on Card Click
    navCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');

            // Push state to history
            history.pushState({ section: targetId }, '', `#${targetId}`);

            openSection(targetId);
        });
    });

    // Open Section on Menu Click (Inside Viewer)
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            // Push state to history
            history.pushState({ section: targetId }, '', `#${targetId}`);

            openSection(targetId);
        });
    });

    // Handle Browser Back Button (Popstate)
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.section) {
            // If there is a state (e.g., forward navigation), open it
            openSection(event.state.section);
        } else {
            // If no state (back to root), close viewer
            closeViewer();
        }
    });

    // Close Viewer (Back Button in UI) - Always go to Home
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeViewer();
            // Reset URL to root (remove hash) so it looks like Home
            // We use pushState to add a "Home" entry, so browser Back button works as expected (returns to previous section)
            history.pushState(null, '', window.location.pathname);
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contentViewer.classList.contains('active')) {
            if (history.state) {
                history.back();
            } else {
                closeViewer();
            }
        }
    });

    // Handle initial load with hash (e.g., refreshing on #about)
    const initialHash = window.location.hash.substring(1);
    if (initialHash && sectionTitles[initialHash]) {
        openSection(initialHash);
    }

    // Award Medal Celebration Animation with Cooldown
    const awardBadges = document.querySelectorAll('.award-badge');
    const cooldownTime = 10000; // 10 seconds
    const lastCelebrationTime = new Map();

    console.log('Award badges found:', awardBadges.length);

    awardBadges.forEach((badge, index) => {
        badge.addEventListener('mouseenter', () => {
            console.log('Mouse entered badge', index);
            const now = Date.now();
            const lastTime = lastCelebrationTime.get(index) || 0;

            // Check if cooldown has passed
            if (now - lastTime >= cooldownTime) {
                console.log('Triggering celebration for badge', index);
                // Add celebrating class
                badge.classList.add('celebrating');

                // Create confetti particles
                createConfetti(badge);

                // Update last celebration time
                lastCelebrationTime.set(index, now);

                // Remove class after animation completes
                setTimeout(() => {
                    badge.classList.remove('celebrating');
                }, 1500);
            } else {
                console.log('Cooldown active for badge', index, 'Time remaining:', (cooldownTime - (now - lastTime)) / 1000, 'seconds');
            }
        });
    });

    // Function to create confetti particles
    function createConfetti(badge) {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FFA500', '#FF1493'];
        const particleCount = 16; // Doubled for more dramatic effect

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';

            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = (360 / particleCount) * i;
            const distance = 60 + Math.random() * 30;

            const x = Math.cos(angle * Math.PI / 180) * distance;
            const y = Math.sin(angle * Math.PI / 180) * distance;

            particle.style.setProperty('--x', `${x}px`);
            particle.style.setProperty('--y', `${y}px`);
            particle.style.background = color;
            particle.style.animationDelay = `${i * 0.05}s`; // Staggered burst

            badge.appendChild(particle);

            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 1500);
        }
    }
});
