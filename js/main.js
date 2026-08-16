/**
 * Art by Beckman — Core Global Scripts
 */
document.addEventListener('DOMContentLoaded', () => {
    // Header scroll background effect
    const header = document.querySelector('header');
    if (header) {
        let lastScrolled = window.pageYOffset;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            lastScrolled = currentScroll;
        }, { passive: true });
    }
});
