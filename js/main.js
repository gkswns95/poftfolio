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
        'awards': 'Awards',
        'etc': 'Recommendations'
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

    // Close on Escape key (only if modal is not active)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contentViewer.classList.contains('active')) {
            // Check if paper modal is active - if so, let modal handler deal with it
            const modalOverlay = document.getElementById('paper-modal-overlay');
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                return; // Let modal handler handle this
            }

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


    /* =========================================
       Selected Papers Modal Logic
       ========================================= */
    const paperCards = document.querySelectorAll('.paper-card');
    const modalOverlay = document.getElementById('paper-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const prevPaperBtn = document.getElementById('prev-paper-btn');
    const nextPaperBtn = document.getElementById('next-paper-btn');

    // Modal Elements to Populate
    const modalVenue = document.getElementById('modal-venue');
    const modalTitle = document.getElementById('modal-title');
    const modalAuthors = document.getElementById('modal-authors');
    const modalAbstract = document.getElementById('modal-abstract');
    const modalPoints = document.getElementById('modal-points');
    const modalTags = document.getElementById('modal-tags');
    const modalLinks = document.getElementById('modal-links');

    let currentPaperIndex = 0;
    let currentLang = 'ko'; // Track current language

    function openPaperModal(index) {
        currentPaperIndex = index;
        currentLang = 'ko'; // Reset to Korean when opening modal
        updateModalContent(index);
        updateLanguageDisplay();
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closePaperModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    function updateModalContent(index) {
        const card = paperCards[index];
        const details = card.querySelector('.paper-details-content');

        // Basic Info from Card
        modalVenue.textContent = card.querySelector('.paper-card-venue').textContent;
        modalTitle.textContent = card.querySelector('.paper-card-title').textContent;
        modalAuthors.textContent = card.querySelector('.paper-card-authors').textContent;

        // Detailed Content from Hidden Div - Get all language versions
        const abstractKo = details.querySelector('.detail-abstract[data-lang="ko"]');
        const abstractEn = details.querySelector('.detail-abstract[data-lang="en"]');

        // Clear and set content based on language
        modalAbstract.innerHTML = '';
        if (abstractKo && abstractEn) {
            // Has both languages
            modalAbstract.appendChild(abstractKo.cloneNode(true));
            modalAbstract.appendChild(abstractEn.cloneNode(true));
            updateLanguageDisplay();
        } else {
            // Fallback to old content
            const singleAbstract = details.querySelector('.detail-abstract');
            if (singleAbstract) {
                modalAbstract.innerHTML = singleAbstract.innerHTML;
            }
        }

        modalPoints.innerHTML = details.querySelector('.detail-points').innerHTML;
        modalTags.innerHTML = details.querySelector('.detail-tags').innerHTML;
        modalLinks.innerHTML = details.querySelector('.detail-links').innerHTML;

        // Visual Content
        const detailVisual = details.querySelector('.detail-visual');
        const modalVisuals = document.querySelector('.modal-visuals');

        if (detailVisual && modalVisuals) {
            const visualPath = detailVisual.textContent.trim();
            if (visualPath.toLowerCase().endsWith('.pdf')) {
                modalVisuals.innerHTML = `<embed src="${visualPath}" type="application/pdf" width="100%" height="400px" style="border-radius: 8px;">`;
            } else {
                modalVisuals.innerHTML = `<img src="${visualPath}" alt="Paper Visual" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;">`;
            }
        } else if (modalVisuals) {
            // Restore placeholder
            modalVisuals.innerHTML = `
                <div class="visual-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1" style="margin-bottom: 10px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p>Visual / Diagram Placeholder</p>
                </div>`;
        }

        // Update Button States (Optional: Disable if start/end)
        prevPaperBtn.style.opacity = index === 0 ? '0.5' : '1';
        prevPaperBtn.style.pointerEvents = index === 0 ? 'none' : 'auto';

        nextPaperBtn.style.opacity = index === paperCards.length - 1 ? '0.5' : '1';
        nextPaperBtn.style.pointerEvents = index === paperCards.length - 1 ? 'none' : 'auto';
    }

    function updateLanguageDisplay() {
        const langLabel = document.getElementById('lang-label');
        const abstractKo = modalAbstract.querySelector('[data-lang="ko"]');
        const abstractEn = modalAbstract.querySelector('[data-lang="en"]');

        if (abstractKo && abstractEn) {
            if (currentLang === 'ko') {
                abstractKo.style.display = 'block';
                abstractEn.style.display = 'none';
            } else {
                abstractKo.style.display = 'none';
                abstractEn.style.display = 'block';
            }
            // Always show 'Ko/En' regardless of current language
            if (langLabel) langLabel.textContent = 'Ko/En';
        }
    }

    function toggleLanguage() {
        currentLang = currentLang === 'ko' ? 'en' : 'ko';
        updateLanguageDisplay();
    }

    // Event Listeners for Cards
    paperCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            // Prevent triggering if clicking a link inside the card (if any)
            if (e.target.tagName === 'A') return;
            openPaperModal(index);
        });
    });

    // Close Button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closePaperModal);
    }

    // Language Toggle Button
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', toggleLanguage);
    }

    // Overlay Click to Close
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closePaperModal();
            }
        });
    }

    // Navigation Buttons
    if (prevPaperBtn) {
        prevPaperBtn.addEventListener('click', () => {
            if (currentPaperIndex > 0) {
                currentPaperIndex--;
                updateModalContent(currentPaperIndex);
            }
        });
    }

    if (nextPaperBtn) {
        nextPaperBtn.addEventListener('click', () => {
            if (currentPaperIndex < paperCards.length - 1) {
                currentPaperIndex++;
                updateModalContent(currentPaperIndex);
            }
        });
    }

    // Keyboard Navigation for Modal
    document.addEventListener('keydown', (e) => {
        if (!modalOverlay.classList.contains('active')) return;

        if (e.key === 'Escape') {
            e.stopPropagation(); // Prevent event from bubbling to content viewer handler
            closePaperModal();
        } else if (e.key === 'ArrowLeft') {
            if (currentPaperIndex > 0) {
                currentPaperIndex--;
                updateModalContent(currentPaperIndex);
            }
        } else if (e.key === 'ArrowRight') {
            if (currentPaperIndex < paperCards.length - 1) {
                currentPaperIndex++;
                updateModalContent(currentPaperIndex);
            }
        }
    });

    /* =========================================
       Recommendations Password Logic
       ========================================= */
    const recPasswordInput = document.getElementById('rec-password-input');
    const recPasswordSubmit = document.getElementById('rec-password-submit');
    const recPasswordError = document.getElementById('rec-password-error');
    const recPasswordContainer = document.getElementById('rec-password-container');
    const recContent = document.getElementById('rec-content');

    function checkPassword() {
        if (!recPasswordInput) return;

        const password = recPasswordInput.value;
        if (password === '1234') {
            // Correct Password
            recPasswordContainer.style.display = 'none';
            recContent.style.display = 'block';
            recPasswordError.style.display = 'none';
        } else {
            // Incorrect Password
            recPasswordError.style.display = 'block';
            recPasswordInput.classList.add('shake-animation');

            // Clear input for better UX? No, usually keep it.

            setTimeout(() => {
                recPasswordInput.classList.remove('shake-animation');
            }, 500);
        }
    }

    if (recPasswordSubmit) {
        recPasswordSubmit.addEventListener('click', checkPassword);
    }

    if (recPasswordInput) {
        recPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                checkPassword();
            }
        });
    }

});
