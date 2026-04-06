document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("instagram-feed-container");
    if (!container) return;

    // Use INSTAGRAM_FEED inline variable (defined in js/instagram-data.js)
    // This avoids CORS/fetch issues when opening via file:// protocol.
    if (typeof INSTAGRAM_FEED === "undefined" || !INSTAGRAM_FEED.length) {
        container.innerHTML = "<p style='color:var(--text-secondary);text-align:center;padding:2rem;'>No feed data available.</p>";
        return;
    }

    container.innerHTML = ""; // Clear skeleton/loading state

    INSTAGRAM_FEED.forEach(item => {
        const element = document.createElement("div");
        element.className = "instagram-item";
        element.style.position = "relative";

        if (item.is_video) {
            // Video: show thumbnail, play on hover/click
            const img = document.createElement("img");
            img.src = item.thumbnail;
            img.alt = item.caption || "Instagram Video";
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.style.display = "block";
            element.appendChild(img);

            // Video badge
            const badge = document.createElement("div");
            badge.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                width: 28px;
                height: 28px;
                background: rgba(0,0,0,0.6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            `;
            badge.setAttribute("aria-hidden", "true");
            // CSS play triangle instead of unicode char (avoids encoding issues)
            const triangle = document.createElement("div");
            triangle.style.cssText = `
                width: 0;
                height: 0;
                border-top: 6px solid transparent;
                border-bottom: 6px solid transparent;
                border-left: 10px solid rgba(255,255,255,0.9);
                margin-left: 2px;
            `;
            badge.appendChild(triangle);
            element.appendChild(badge);

            // Click: swap to inline video
            element.addEventListener("click", () => {
                // Replace image with video
                element.innerHTML = "";
                const video = document.createElement("video");
                video.src = item.url;
                video.muted = false;
                video.controls = true;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                video.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
                element.appendChild(video);
                video.play().catch(() => {});
            });

        } else {
            // Image
            const img = document.createElement("img");
            img.src = item.url;
            img.alt = item.caption || "Instagram Post";
            // Removed loading="lazy" as it causes decoding failures locally.
            element.appendChild(img);
        }

        container.appendChild(element);
    });
});
