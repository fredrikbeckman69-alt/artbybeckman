// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle') || document.getElementById('menu-toggle');
    const nav = document.querySelector('nav') || document.getElementById('nav');

    if (!menuToggle || !nav) {
        console.error('Menu toggle or nav not found');
        return;
    }

    // Toggle menu on click
    menuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        console.log('Menu toggled:', nav.classList.contains('active'));
    });

    // Close menu when clicking nav links
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        const isClickInsideMenu = nav.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle && nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });

    // Prevent body scroll when menu is open on mobile
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                if (nav.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        });
    });

    observer.observe(nav, { attributes: true });
});
