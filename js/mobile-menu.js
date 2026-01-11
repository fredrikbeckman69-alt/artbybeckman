// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    // Create menu toggle button if it doesn't exist
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');

    // Check if menu toggle already exists
    if (!document.querySelector('.menu-toggle')) {
        const menuToggle = document.createElement('div');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<span></span><span></span><span></span>';

        // Insert menu toggle before nav
        header.insertBefore(menuToggle, nav);

        // Toggle menu on click
        menuToggle.addEventListener('click', function () {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
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
            if (!header.contains(event.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
});
