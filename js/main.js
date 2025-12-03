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

    // Close Viewer (Back Button in UI)
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Go back in history (which triggers popstate)
            if (history.state) {
                history.back();
            } else {
                // Fallback if opened directly (though unlikely in this flow)
                closeViewer();
            }
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
});
