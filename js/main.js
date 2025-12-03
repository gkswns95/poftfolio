document.addEventListener('DOMContentLoaded', () => {
    const dashboard = document.getElementById('dashboard');
    const contentViewer = document.getElementById('content-viewer');
    const backBtn = document.getElementById('back-btn');
    const navCards = document.querySelectorAll('.nav-card');
    const viewSections = document.querySelectorAll('.view-section');
    const currentTitle = document.querySelector('.current-section-title');

    // Navigation Mapping
    const sectionTitles = {
        'about': 'About Me',
        'experience': 'Experience',
        'papers': 'Publications',
        'awards': 'Awards'
    };

    // Open Section
    navCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Hide all sections first
                viewSections.forEach(sec => sec.classList.remove('active'));

                // Show target section
                targetSection.classList.add('active');

                // Update Title
                currentTitle.textContent = sectionTitles[targetId] || 'Profile';

                // Show Viewer
                contentViewer.classList.add('active');

                // Scroll to top of viewer
                contentViewer.scrollTop = 0;
            }
        });
    });

    // Close Viewer (Back to Dashboard)
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            contentViewer.classList.remove('active');
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contentViewer.classList.contains('active')) {
            contentViewer.classList.remove('active');
        }
    });
});
