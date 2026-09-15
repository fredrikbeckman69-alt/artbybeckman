import re

with open("videos.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix head: favicons, remove duplicate CSS
head_old = """    <link rel="stylesheet" href="css/style-v3.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style-v3.css">"""

head_new = """    <link rel="icon" href="favicon.ico" sizes="any">
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style-v3.css">"""

content = content.replace(head_old, head_new)

# 2. Fix menu toggle
content = content.replace(
    '<div class="menu-toggle" id="menu-toggle" aria-label="Open navigation" aria-expanded="false">',
    '<button class="menu-toggle" id="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">'
).replace(
    '        </div>\n        <nav id="nav">',
    '        </button>\n        <nav id="nav">'
)

# 3. Enhance video items with accessibility attributes and image dimensions
def fix_video_item(match):
    full = match.group(0)
    # extract title
    title_m = re.search(r'class="video-title">([^<]+)<', full)
    title = title_m.group(1) if title_m else "Artwork Video"
    
    # replace opening div
    full = re.sub(
        r'<div class="video-item video-short" data-id="([^"]+)" onclick="loadVideo\(this\)">',
        r'<div class="video-item video-short" data-id="\1" role="button" tabindex="0" aria-label="Play video: ' + title + r'" onclick="loadVideo(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();loadVideo(this);}">',
        full
    )
    # add image attributes
    full = re.sub(
        r'<img src="([^"]+)" alt="([^"]*)"\s+loading="lazy">',
        r'<img src="\1" alt="\2" width="480" height="360" loading="lazy" decoding="async">',
        full
    )
    return full

content = re.sub(
    r'<div class="video-item video-short"[\s\S]*?</div>\s*</div>',
    fix_video_item,
    content
)

# 4. Standard footer
footer_old = """    <footer>
        &copy; 2026 Art by Beckman. All rights reserved.
    </footer>"""
footer_new = """    <footer>
        <div class="footer-logo">Art by Beckman</div>
        <div class="footer-copy">© 2026 Fredrik Beckman. All rights reserved.</div>
    </footer>"""
content = content.replace(footer_old, footer_new)

with open("videos.html", "w", encoding="utf-8") as f:
    f.write(content)

with open("dist/videos.html", "w", encoding="utf-8") as f:
    f.write(content)

print("videos.html successfully updated and synced to dist/videos.html")
