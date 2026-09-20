/**
 * Optimized Gallery Engine — Art by Beckman
 * - Ultra-fast DocumentFragment rendering
 * - Debounced instant search
 * - Lightbox with keyboard & touch navigation (Next/Prev/Esc)
 * - Safe URL encoding & error handling
 */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('gallery-grid');
    const searchInput = document.getElementById('gallery-search');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxBadge = document.getElementById('lightbox-badge');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const modalFrame = document.getElementById('modal-canvas-frame');
    const closeBtn = document.getElementById('lightbox-close') || document.querySelector('.gallery-modal-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!grid || typeof GALLERY_IMAGES === 'undefined') return;

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches || (window.innerWidth > 768 && !('ontouchstart' in window));

    // Helper: Safe HTML escape
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Interactive 3D Perspective Tilt with Dynamic Shine
    function attachTilt(cardEl) {
        const inner = cardEl.querySelector('.gallery-canvas-inner') || cardEl.querySelector('.modal-canvas-inner');
        const shine = cardEl.querySelector('.gallery-canvas-shine') || cardEl.querySelector('.modal-canvas-shine');
        if (!inner) return;

        let isHovered = false;
        let rafId = null;

        cardEl.addEventListener('mouseenter', () => {
            isHovered = true;
            inner.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease';
            if (shine) shine.style.opacity = '0.35';
        });

        cardEl.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const rect = cardEl.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const normX = (x - centerX) / centerX;
                const normY = (y - centerY) / centerY;

                const rotY = normX * 8.5;  // max 8.5 deg
                const rotX = -normY * 7.5; // max 7.5 deg

                inner.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

                if (shine) {
                    const shineAngle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 90;
                    shine.style.background = `linear-gradient(${shineAngle}deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.0) 65%)`;
                }
            });
        });

        cardEl.addEventListener('mouseleave', () => {
            isHovered = false;
            if (rafId) cancelAnimationFrame(rafId);
            inner.style.transition = 'transform 0.45s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.45s ease';
            inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            if (shine) shine.style.opacity = '0';
        });
    }

    // Pre-sort images descending once (newest first)
    const allImages = [...GALLERY_IMAGES].sort((a, b) => b.id - a.id);
    let currentFiltered = allImages;
    let activeLightboxIndex = -1;

    // Shared IntersectionObserver for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px 80px 0px'
    });

    // 1. Render Gallery via DocumentFragment
    function renderGallery(filter = "") {
        const query = filter.trim().toLowerCase();
        
        currentFiltered = query
            ? allImages.filter(img => 
                (img.title && img.title.toLowerCase().includes(query)) ||
                (img.year && img.year.toLowerCase().includes(query)) ||
                (img.material && img.material.toLowerCase().includes(query)) ||
                (img.size && img.size.toLowerCase().includes(query))
              )
            : allImages;

        grid.innerHTML = "";

        if (currentFiltered.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--ink-secondary); padding: 3rem 1rem; font-size: 1.1rem;';
            emptyMsg.textContent = `No artworks found matching "${filter}".`;
            grid.appendChild(emptyMsg);
            return;
        }

        let renderedCount = 0;
        const BATCH_SIZE = 24;

        function renderBatch() {
            if (renderedCount >= currentFiltered.length) return;
            const end = Math.min(renderedCount + BATCH_SIZE, currentFiltered.length);
            const fragment = document.createDocumentFragment();

            for (let i = renderedCount; i < end; i++) {
                const img = currentFiltered[i];
                const item = document.createElement('div');
                item.className = 'gallery-item';

                const formattedSize = img.size ? img.size.replace(/\s*\*\s*/g, ' × ') : '';
                const dimYear = [formattedSize, img.year].filter(Boolean).join(' · ');
                const material = img.material ? img.material.trim() : '';
                const webpFilename = img.filename.replace(/\.(jpe?g|png)$/i, '.webp');
                const safeWebp = encodeURI(`assets/images/${webpFilename}`);
                const safeSrc = encodeURI(`assets/images/${img.filename}`);

                item.innerHTML = `
                    <div class="gallery-canvas-inner">
                        <div class="gallery-canvas-media">
                            <picture>
                                <source srcset="${safeWebp}" type="image/webp">
                                <img src="${safeSrc}" alt="${escapeHtml(img.title)} — Fredrik Beckman" width="400" height="500" loading="lazy" decoding="async">
                            </picture>
                        </div>
                        <div class="gallery-canvas-shine"></div>
                        <div class="gallery-artwork-badge">
                            <div class="badge-row-main">
                                <span class="badge-title">${escapeHtml(img.title)}</span>
                                ${dimYear ? `<span class="badge-sep">·</span><span class="badge-meta">${escapeHtml(dimYear)}</span>` : ''}
                            </div>
                            ${material ? `
                            <div class="badge-row-material">
                                <span class="badge-material-tag">${escapeHtml(material)}</span>
                            </div>` : ''}
                        </div>
                    </div>
                `;

                const index = i;
                item.addEventListener('click', () => {
                    openLightbox(index);
                });

                if (hasFinePointer) {
                    attachTilt(item);
                }

                const imgEl = item.querySelector('img');
                imgEl.onload = () => imgEl.classList.add('loaded');
                imgEl.onerror = () => {
                    console.warn(`Could not load image: ${safeSrc}`);
                    imgEl.style.opacity = '0.4';
                };

                fragment.appendChild(item);
                observer.observe(item);
            }

            // Insert before sentinel if exists
            const sentinel = document.getElementById('gallery-sentinel');
            if (sentinel) {
                grid.insertBefore(fragment, sentinel);
            } else {
                grid.appendChild(fragment);
            }
            renderedCount = end;

            if (renderedCount < currentFiltered.length && !document.getElementById('gallery-sentinel')) {
                const sentinelEl = document.createElement('div');
                sentinelEl.id = 'gallery-sentinel';
                sentinelEl.style.cssText = 'height: 40px; grid-column: 1 / -1; width: 100%;';
                grid.appendChild(sentinelEl);

                const scrollObserver = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        renderBatch();
                        if (renderedCount >= currentFiltered.length && sentinelEl.parentNode) {
                            sentinelEl.remove();
                            scrollObserver.disconnect();
                        }
                    }
                }, { rootMargin: '300px' });
                scrollObserver.observe(sentinelEl);
            }
        }

        renderBatch();
    }

    // 2. Debounced Search (120ms)
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderGallery(e.target.value);
            }, 120);
        });
    }

    // 3. Lightbox Engine
    function openLightbox(index) {
        if (index < 0 || index >= currentFiltered.length) return;
        activeLightboxIndex = index;
        const img = currentFiltered[index];

        lightboxImg.src = encodeURI(`assets/images/${img.filename}`);
        lightboxImg.alt = `${img.title} — Fredrik Beckman`;

        if (lightboxBadge) {
            const formattedSize = img.size ? img.size.replace(/\s*\*\s*/g, ' × ') : '';
            const dimYear = [formattedSize, img.year].filter(Boolean).join(' · ');
            const material = img.material ? img.material.trim() : '';

            lightboxBadge.innerHTML = `
                <div class="badge-row-main">
                    <span class="badge-title">${escapeHtml(img.title)}</span>
                    ${dimYear ? `<span class="badge-sep">·</span><span class="badge-meta">${escapeHtml(dimYear)}</span>` : ''}
                </div>
                ${material ? `
                <div class="badge-row-material">
                    <span class="badge-material-tag">${escapeHtml(material)}</span>
                </div>` : ''}
            `;
        }

        if (lightboxCaption) {
            lightboxCaption.innerHTML = img.description ? `<p class="desc">${escapeHtml(img.description)}</p>` : '';
        }

        if (modalFrame && hasFinePointer && !modalFrame._tiltAttached) {
            attachTilt(modalFrame);
            modalFrame._tiltAttached = true;
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        activeLightboxIndex = -1;
        if (lightboxImg) lightboxImg.src = "";
    }

    function showPrev() {
        if (activeLightboxIndex > 0) {
            openLightbox(activeLightboxIndex - 1);
        } else if (currentFiltered.length > 0) {
            openLightbox(currentFiltered.length - 1);
        }
    }

    function showNext() {
        if (activeLightboxIndex < currentFiltered.length - 1) {
            openLightbox(activeLightboxIndex + 1);
        } else if (currentFiltered.length > 0) {
            openLightbox(0);
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('gallery-modal-content')) {
                closeLightbox();
            }
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrev();
        } else if (e.key === 'ArrowRight') {
            showNext();
        }
    });

    // Initial render
    renderGallery();

    // Deep link support: ?id=270 or #270 or #painting-270
    function checkUrlDeepLink() {
        const params = new URLSearchParams(window.location.search);
        let targetId = params.get('id');
        if (!targetId && window.location.hash) {
            const hashMatch = window.location.hash.match(/\d+/);
            if (hashMatch) targetId = hashMatch[0];
        }
        if (targetId) {
            const parsedId = parseInt(targetId, 10);
            const foundIndex = currentFiltered.findIndex(img => img.id === parsedId);
            if (foundIndex !== -1) {
                setTimeout(() => openLightbox(foundIndex), 150);
            }
        }
    }
    checkUrlDeepLink();
});
