
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('gallery-grid');
    const searchInput = document.getElementById('gallery-search');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');

    // 1. Render Gallery
    // 1. Render Gallery
    function renderGallery(filter = "") {
        grid.innerHTML = "";

        // Sort by ID descending (Newest to Oldest)
        // We create a copy to avoid mutating the original if we needed the original order elsewhere, 
        // but here we always want newest first.
        const sortedImages = [...GALLERY_IMAGES].sort((a, b) => b.id - a.id);

        const filteredImages = sortedImages.filter(img =>
            img.title.toLowerCase().includes(filter.toLowerCase())
        );

        filteredImages.forEach(img => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            // Lazy loading setup
            const sizeInfo = img.size ? `<p class="meta">${img.size}</p>` : '';
            const materialInfo = img.material ? `<p class="meta">${img.material}</p>` : '';
            const yearInfo = img.year ? `<span class="year">${img.year}</span>` : '';

            item.innerHTML = `
                <img src="assets/images/${img.filename}" alt="${img.title}" loading="lazy">
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
                openLightbox(img);
            });

            // Fade in on load
            const imageElement = item.querySelector('img');
            imageElement.onload = () => imageElement.classList.add('loaded');

            grid.appendChild(item);

            // Observe for scroll animation
            observer.observe(item);
        });
    }

    // 2. Search Logic
    searchInput.addEventListener('input', (e) => {
        renderGallery(e.target.value);
    });

    // 3. Lightbox Logic
    function openLightbox(img) {
        lightboxImg.src = `assets/images/${img.filename}`;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Restore scrolling
        lightboxImg.src = "";
    }

    closeBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // 4. Scroll Reveal Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Initial render
    renderGallery();
});
