/**
 * Art by Beckman — Core Global Scripts
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll background effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 40) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }, { passive: true });
    }

    // 2. Hero Masterpiece Showcase Interactivity
    const heroImg = document.getElementById('hero-img');
    const heroSource = document.getElementById('hero-source');
    const heroBadgeTitle = document.getElementById('hero-badge-title');
    const heroBadgeMeta = document.getElementById('hero-badge-meta');
    const heroGlow = document.getElementById('hero-ambient-glow');
    const heroTabs = document.querySelectorAll('.hero-switcher-tab');
    const canvasFrame = document.getElementById('hero-canvas-frame');
    const canvasInner = document.getElementById('hero-canvas-inner');
    const canvasShine = document.getElementById('hero-canvas-shine');

    if (heroImg && heroTabs.length > 0) {
        let currentIdx = 0;
        let isTransitioning = false;
        let autoCycleTimer = null;
        let userInteracted = false;

        const setMasterpiece = (idx, manual = false) => {
            if (isTransitioning) return;
            const tab = heroTabs[idx];
            if (!tab) return;

            if (manual) userInteracted = true;
            currentIdx = idx;

            // Update tab states
            heroTabs.forEach((t, i) => {
                const isActive = i === idx;
                t.classList.toggle('active', isActive);
                t.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            // Smooth cross-fade image
            isTransitioning = true;
            heroImg.style.opacity = '0';
            heroImg.style.transform = 'scale(0.97)';

            setTimeout(() => {
                const imgSrc = tab.getAttribute('data-img');
                const title = tab.getAttribute('data-title');
                const meta = tab.getAttribute('data-meta');
                const glowColor = tab.getAttribute('data-color') || '#BA1655';

                if (heroSource) heroSource.srcset = imgSrc;
                heroImg.src = imgSrc;
                heroImg.alt = `${title} — Fredrik Beckman`;

                if (heroBadgeTitle) heroBadgeTitle.textContent = title;
                if (heroBadgeMeta) heroBadgeMeta.textContent = meta;

                if (heroGlow) {
                    heroGlow.style.background = `radial-gradient(circle, ${glowColor} 0%, rgba(123, 31, 162, 0.12) 45%, transparent 70%)`;
                }

                heroImg.onload = () => {
                    heroImg.style.opacity = '1';
                    heroImg.style.transform = 'scale(1)';
                    isTransitioning = false;
                };
                // Fallback in case onload fires before or cached
                setTimeout(() => {
                    heroImg.style.opacity = '1';
                    heroImg.style.transform = 'scale(1)';
                    isTransitioning = false;
                }, 80);
            }, 200);
        };

        // Tab click listeners
        heroTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => setMasterpiece(index, true));
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setMasterpiece(index, true);
                }
            });
        });

        // Gentle auto-cycle every 8.5s if user hasn't interacted
        const startAutoCycle = () => {
            if (autoCycleTimer) clearInterval(autoCycleTimer);
            autoCycleTimer = setInterval(() => {
                if (!userInteracted) {
                    const nextIdx = (currentIdx + 1) % heroTabs.length;
                    setMasterpiece(nextIdx, false);
                }
            }, 8500);
        };
        startAutoCycle();

        // Pause cycle on hover
        const heroSection = document.getElementById('hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                if (autoCycleTimer) clearInterval(autoCycleTimer);
            });
            heroSection.addEventListener('mouseleave', () => {
                if (!userInteracted) startAutoCycle();
            });
        }
    }

    // 3. Tactile 3D Canvas Tilt on Mouse Hover
    if (canvasFrame && canvasInner && window.matchMedia('(pointer: fine)').matches) {
        let isHovered = false;

        canvasFrame.addEventListener('mouseenter', () => {
            isHovered = true;
            canvasInner.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
            if (canvasShine) canvasShine.style.opacity = '0.35';
        });

        canvasFrame.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            const rect = canvasFrame.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const normX = (x - centerX) / centerX; // -1 to +1
            const normY = (y - centerY) / centerY; // -1 to +1

            const rotY = normX * 9.0;  // max 9 deg
            const rotX = -normY * 8.0; // max 8 deg

            canvasInner.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

            if (canvasShine) {
                const shineAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
                canvasShine.style.background = `linear-gradient(${shineAngle}deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.0) 65%)`;
            }
        });

        canvasFrame.addEventListener('mouseleave', () => {
            isHovered = false;
            canvasInner.style.transition = 'transform 0.45s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.45s ease';
            canvasInner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (canvasShine) canvasShine.style.opacity = '0';
        });
    }

    // 4. Smooth scroll for video presentation button
    const videoBtn = document.getElementById('hero-video-btn');
    if (videoBtn) {
        videoBtn.addEventListener('click', (e) => {
            const target = document.getElementById('featured-film') || document.getElementById('video-presentation');
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const mainVideo = target.querySelector('video');
                if (mainVideo) {
                    mainVideo.focus();
                }
            }
        });
    }
});

