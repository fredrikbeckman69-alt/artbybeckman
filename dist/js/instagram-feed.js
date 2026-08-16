/**
 * Instagram Feed Engine — Art by Beckman
 * Clean square grid portfolio, lightbox modal with navigation, and lazy loading
 */

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("instagram-feed-container");
    const modal = document.getElementById("insta-modal");
    const modalBody = document.getElementById("insta-modal-body");
    const modalClose = document.getElementById("insta-modal-close");

    if (!container) return;

    if (typeof INSTAGRAM_FEED === "undefined" || !INSTAGRAM_FEED.length) {
        container.innerHTML = "<p style='color:var(--ink-secondary);text-align:center;padding:3rem 1rem;'>No feed data available.</p>";
        return;
    }

    container.innerHTML = "";

    let currentIndex = 0;

    function renderModal(index) {
        if (!modal || !modalBody || index < 0 || index >= INSTAGRAM_FEED.length) return;
        currentIndex = index;
        const item = INSTAGRAM_FEED[currentIndex];
        modalBody.innerHTML = "";

        if (item.is_video) {
            const video = document.createElement("video");
            video.src = item.url;
            video.className = "insta-modal-media";
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            modalBody.appendChild(video);
            video.play().catch(() => {});
        } else {
            const img = document.createElement("img");
            img.src = item.url;
            img.alt = item.caption || "Instagram Artwork";
            img.className = "insta-modal-media";
            modalBody.appendChild(img);
        }

        if (item.caption) {
            const cap = document.createElement("p");
            cap.className = "insta-modal-caption";
            cap.textContent = item.caption;
            modalBody.appendChild(cap);
        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        if (modalBody) modalBody.innerHTML = "";
        document.body.style.overflow = "";
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (!modal || !modal.classList.contains("active")) return;
        if (e.key === "Escape") {
            closeModal();
        } else if (e.key === "ArrowRight") {
            if (currentIndex < INSTAGRAM_FEED.length - 1) {
                renderModal(currentIndex + 1);
            }
        } else if (e.key === "ArrowLeft") {
            if (currentIndex > 0) {
                renderModal(currentIndex - 1);
            }
        }
    });

    const fragment = document.createDocumentFragment();

    INSTAGRAM_FEED.forEach((item, index) => {
        const element = document.createElement("div");
        element.className = "instagram-item";
        element.setAttribute("title", item.is_video ? "Click to play video" : "Click to view painting");

        const img = document.createElement("img");
        img.src = item.is_video ? item.thumbnail : item.url;
        img.alt = item.caption || "Instagram Artwork";
        img.loading = "lazy";
        img.decoding = "async";

        // Hide completely if image fails to load
        img.onerror = () => {
            element.style.display = 'none';
        };

        element.appendChild(img);

        // Hover overlay
        const overlay = document.createElement("div");
        overlay.className = "instagram-item-overlay";
        if (item.caption) {
            const capSnippet = document.createElement("div");
            capSnippet.className = "instagram-item-caption-snippet";
            capSnippet.textContent = item.caption;
            overlay.appendChild(capSnippet);
        }
        element.appendChild(overlay);

        // Video badge
        if (item.is_video) {
            const badge = document.createElement("div");
            badge.style.cssText = `
                position: absolute;
                top: 14px;
                right: 14px;
                width: 36px;
                height: 36px;
                background: rgba(26, 12, 30, 0.75);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            `;
            badge.setAttribute("aria-hidden", "true");

            const triangle = document.createElement("div");
            triangle.style.cssText = `
                width: 0;
                height: 0;
                border-top: 5px solid transparent;
                border-bottom: 5px solid transparent;
                border-left: 9px solid #FFFFFF;
                margin-left: 2px;
            `;
            badge.appendChild(triangle);
            element.appendChild(badge);
        }

        element.addEventListener("click", () => {
            renderModal(index);
        });

        fragment.appendChild(element);
    });

    container.appendChild(fragment);
});
