/**
 * Scroll Animations & Parallax Effects
 * Apple-inspired smooth interactions
 */

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, observerOptions);

// Observe all gallery items and fade-in elements
document.addEventListener('DOMContentLoaded', () => {
    // Gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        fadeObserver.observe(item);
    });

    // General fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });

    // Parallax effect on scroll
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
});

function handleParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add stagger animation to muse gallery
document.addEventListener('DOMContentLoaded', () => {
    const museGallery = document.querySelector('.muse-gallery');
    if (museGallery) {
        const images = museGallery.querySelectorAll('img');
        images.forEach((img, index) => {
            img.style.opacity = '0';
            img.style.transform = 'translateY(30px)';
            img.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        img.style.opacity = '1';
                        img.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(img);
        });
    }
});

// Enhanced search input focus effect
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.style.borderColor = 'var(--accent-blue)';
            searchInput.style.boxShadow = '0 0 0 4px rgba(0, 113, 227, 0.1)';
        });

        searchInput.addEventListener('blur', () => {
            searchInput.style.borderColor = 'var(--glass-border)';
            searchInput.style.boxShadow = 'none';
        });
    }
});
