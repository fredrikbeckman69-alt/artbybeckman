document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("instagram-feed-container");
    const modal = document.getElementById("insta-modal");
    const modalBody = document.getElementById("insta-modal-body");
    const modalClose = document.getElementById("insta-modal-close");

    if (!container) return;

    if (typeof INSTAGRAM_FEED === "undefined" || !INSTAGRAM_FEED.length) {
        container.innerHTML = "<p style='color:var(--ink-secondary);text-align:center;padding:2rem;'>No feed data available.</p>";
        return;
    }

    container.innerHTML = "";

    function openModal(item) {
        if (!modal || !modalBody) return;
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
        document.body.style.overflow = "auto";
    }

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && modal.classList.contains("active")) {
            closeModal();
        }
    });

    INSTAGRAM_FEED.forEach(item => {
        const element = document.createElement("div");
        element.className = "instagram-item";
        element.setAttribute("title", item.is_video ? "Click to play video" : "Click to view painting");

        const img = document.createElement("img");
        img.src = item.is_video ? item.thumbnail : item.url;
        img.alt = item.caption || "Instagram Artwork";
        element.appendChild(img);

        if (item.is_video) {
            const badge = document.createElement("div");
            badge.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, rgba(123, 31, 162, 0.85), rgba(216, 27, 96, 0.85));
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
            `;
            badge.setAttribute("aria-hidden", "true");
            
            const triangle = document.createElement("div");
            triangle.style.cssText = `
                width: 0;
                height: 0;
                border-top: 7px solid transparent;
                border-bottom: 7px solid transparent;
                border-left: 12px solid #FFFFFF;
                margin-left: 3px;
            `;
            badge.appendChild(triangle);
            element.appendChild(badge);
        }

        element.addEventListener("click", () => {
            openModal(item);
        });

        container.appendChild(element);
    });
});
