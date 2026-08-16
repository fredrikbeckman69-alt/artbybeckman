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
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close') || document.querySelector('.gallery-modal-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!grid || typeof GALLERY_IMAGES === 'undefined') return;

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

        const fragment = document.createDocumentFragment();

        currentFiltered.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const sizeInfo = img.size ? `<p class="meta">${img.size}</p>` : '';
            const materialInfo = img.material ? `<p class="meta">${img.material}</p>` : '';
            const yearInfo = img.year ? `<span class="year">${img.year}</span>` : '';
            const safeSrc = encodeURI(`assets/images/${img.filename}`);

            item.innerHTML = `
                <img src="${safeSrc}" alt="${img.title}" loading="lazy" decoding="async">
                <div class="gallery-overlay">
                    <div class="gallery-info">
                        <div class="gallery-title">${img.title} ${yearInfo}</div>
                        ${sizeInfo}
                        ${materialInfo}
                    </div>
                </div>
            `;

            // Lightbox trigger
            item.addEventListener('click', () => {
                openLightbox(index);
            });

            // Smooth image load handling
            const imgEl = item.querySelector('img');
            imgEl.onload = () => imgEl.classList.add('loaded');
            imgEl.onerror = () => {
                console.warn(`Could not load image: ${safeSrc}`);
                imgEl.style.opacity = '0.4';
            };

            fragment.appendChild(item);
            observer.observe(item);
        });

        grid.appendChild(fragment);
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
        lightboxImg.alt = img.title;

        if (lightboxCaption) {
            const metaParts = [img.year, img.size, img.material].filter(Boolean).join(' · ');
            lightboxCaption.innerHTML = `
                <h3>${img.title}</h3>
                ${metaParts ? `<p>${metaParts}</p>` : ''}
                ${img.description ? `<p class="desc">${img.description}</p>` : ''}
            `;
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
});
