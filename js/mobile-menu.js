/**
 * Mobile Menu Controller — Art by Beckman
 * Fast, responsive, accessible mobile navigation toggle with full touch support
 */
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle') || document.querySelector('.menu-toggle');
    const nav = document.getElementById('nav') || document.querySelector('nav');

    if (!menuToggle || !nav) return;

    function toggleMenu(open) {
        const isOpen = open !== undefined ? open : (!nav.classList.contains('active') && !nav.classList.contains('open'));
        
        nav.classList.toggle('active', isOpen);
        nav.classList.toggle('open', isOpen);
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.classList.toggle('open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        
        // Prevent background scrolling when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    // Support both click and touch events
    menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if ((nav.classList.contains('active') || nav.classList.contains('open')) &&
            !nav.contains(e.target) &&
            !menuToggle.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (nav.classList.contains('active') || nav.classList.contains('open'))) {
            toggleMenu(false);
        }
    });
});
