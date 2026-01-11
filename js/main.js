
/**
 * Main JavaScript for Art by Beckman
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Art by Beckman loaded.');

    /**
     * LANDING PAGE ANIMATION
     * Renders the 20 newest images in a scrolling marquee
     */
    const heroAnim = document.getElementById('hero-anim');

    if (heroAnim && typeof GALLERY_IMAGES !== 'undefined') {
        // Get 20 newest images
        const newestImages = [...GALLERY_IMAGES]
            .sort((a, b) => b.id - a.id)
            .slice(0, 20);

        // Split into two rows
        const row1Data = newestImages.slice(0, 10);
        const row2Data = newestImages.slice(10, 20);

        function createMarqueeRow(images, reverse = false) {
            const row = document.createElement('div');
            row.className = `marquee-row ${reverse ? 'reverse' : ''}`;

            const content = document.createElement('div');
            content.className = 'marquee-content';

            // Duplicate images multiple times to ensure seamless infinite scroll
            // 4 sets ensures it covers wide screens before repeating
            const loopSet = [...images, ...images, ...images, ...images];

            loopSet.forEach(img => {
                const item = document.createElement('div');
                item.className = 'marquee-item';

                const imageEl = document.createElement('img');
                imageEl.src = `assets/images/${img.filename}`;
                imageEl.alt = img.title;
                // Don't lazy load these as they are above fold and moving

                item.appendChild(imageEl);
                content.appendChild(item);
            });

            row.appendChild(content);
            return row;
        }

        heroAnim.appendChild(createMarqueeRow(row1Data, false)); // Left to Right
        heroAnim.appendChild(createMarqueeRow(row2Data, true));  // Right to Left
    }
});

/**
 * Tab Switching Logic
 * @param {Event} evt - The click event
 * @param {string} tabId - The ID of the tab content to show
 */
function openTab(evt, tabId) {
    // 1. Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // 2. Deactivate all tab buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show the selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }

    // 4. Activate the clicked button
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
}
