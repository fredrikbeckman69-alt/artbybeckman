import re
import json
import os
import shutil
import base64
import hashlib

html_path = "Instagram2.html"
DEST_DIR = "assets/instagram"
os.makedirs(DEST_DIR, exist_ok=True)

try:
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
except UnicodeDecodeError:
    with open(html_path, "r", encoding="utf-16") as f:
        content = f.read()

# We need to extract the actual image posts.
# Chrome "Save As" rewrites src="Instagram2_files/xxxx.jpg" or keeps it as data URI, or keeps some https:// links
# We will find all jpg links or Local files matching Instagram2_files

feed_data = []

# Method 1: Find all https://*.jpg
jpg_urls = re.findall(r'https?://[^"\'\s>]+\.jpg(?:[^"\'\s>]+)?', content)

# Method 2: Find Local Chrome rewritten files
local_jpgs = re.findall(r'Instagram2_files/[^"\'\s>]+', content)

# Filter out tiny icon images based on standard Instagram url patterns if possible.
# Timeline posts usually have sizing patterns like /s1080x1080/ or /e35/ or just a clean url without 150x150.
valid_urls = []

# Merge both
all_candidates = set(jpg_urls + local_jpgs)
for url in all_candidates:
    # skip obvious icons/logos if url contains standard small resolutions.
    if "150x150" in url or "32x32" in url:
        continue
    # Many of Instagram's image blobs don't have distinct extensions if saved locally.
    valid_urls.append(url)

# But wait, Chrome also downloads without extensions as "nedladdning", "nedladdning (1)" etc.
if os.path.exists("Instagram2_files"):
    for f in os.listdir("Instagram2_files"):
        if f.endswith(".jpg") or "nedladdning" in f.lower():
            # Filter by size to get only real posts (usually > 20KB)
            path = os.path.join("Instagram2_files", f)
            if os.path.isfile(path) and os.path.getsize(path) > 20000:
                shortcode = hashlib.md5(f.encode()).hexdigest()[:10]
                dest = os.path.join(DEST_DIR, f"{shortcode}.jpg")
                shutil.copyfile(path, dest)
                
                post_data = {
                    "shortcode": shortcode,
                    "is_video": False,
                    "caption": "Instagram Artwork",
                    "url": f"assets/instagram/{shortcode}.jpg",
                    "thumbnail": f"assets/instagram/{shortcode}.jpg"
                }
                # Check duplicate
                if post_data not in feed_data:
                    feed_data.append(post_data)

feed_file = os.path.join(DEST_DIR, "feed.json")
with open(feed_file, "w", encoding="utf-8") as f:
    json.dump(feed_data, f, indent=4, ensure_ascii=False)

print(f"Extracted {len(feed_data)} high-quality images from the local save!")
