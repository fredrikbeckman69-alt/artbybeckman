import json
import os
import re
from PIL import Image

DEST_DIR = "assets/instagram"
DATA_JS = "js/instagram-data.js"
FEED_JSON = "assets/instagram/feed.json"
LINKS_JSON = "assets/instagram/discovered_links.json"

# Load discovered links to preserve timeline order
ordered_shortcodes = []
if os.path.exists(LINKS_JSON):
    with open(LINKS_JSON, "r") as f:
        for link in json.load(f):
            m = re.search(r'/(?:p|reel)/([^/]+)/', link)
            if m:
                ordered_shortcodes.append(m.group(1))

# Load existing feed data to get captions and video flags
existing_metadata = {}
if os.path.exists(FEED_JSON):
    try:
        with open(FEED_JSON, "r", encoding="utf-8") as f:
            for item in json.load(f):
                existing_metadata[item["shortcode"]] = item
    except:
        pass

# Check all media files in assets/instagram
valid_feed = []
seen_shortcodes = set()

# Process ordered shortcodes first
for sc in ordered_shortcodes:
    if sc in seen_shortcodes:
        continue
        
    video_file = f"{DEST_DIR}/{sc}.mp4"
    thumb_file = f"{DEST_DIR}/{sc}_thumb.jpg"
    img_file = f"{DEST_DIR}/{sc}.jpg"
    webp_file = f"{DEST_DIR}/{sc}.webp"

    meta = existing_metadata.get(sc, {})
    caption = meta.get("caption", "Fredrik Beckman Artwork")

    # Check if valid video
    if os.path.exists(video_file) and os.path.getsize(video_file) > 10000:
        # Check thumbnail
        valid_thumb = thumb_file if (os.path.exists(thumb_file) and os.path.getsize(thumb_file) > 2000) else ""
        if not valid_thumb and os.path.exists(img_file):
            try:
                with Image.open(img_file) as im:
                    im.verify()
                valid_thumb = img_file
            except:
                pass
                
        valid_feed.append({
            "shortcode": sc,
            "is_video": True,
            "caption": caption,
            "url": video_file,
            "thumbnail": valid_thumb if valid_thumb else video_file
        })
        seen_shortcodes.add(sc)
        continue

    # Check if valid image (JPG or WebP)
    candidate_img = img_file if os.path.exists(img_file) else (webp_file if os.path.exists(webp_file) else None)
    if candidate_img:
        try:
            with Image.open(candidate_img) as im:
                im.verify()
            valid_feed.append({
                "shortcode": sc,
                "is_video": False,
                "caption": caption,
                "url": candidate_img,
                "thumbnail": candidate_img
            })
            seen_shortcodes.add(sc)
        except Exception as e:
            print(f"Skipping corrupt image {candidate_img}: {e}")

# Also check any remaining files on disk with valid image content
for f in os.listdir(DEST_DIR):
    if f.endswith('.json') or f.endswith('_thumb.jpg') or f.endswith('.mp4'):
        continue
    sc = f.rsplit('.', 1)[0]
    if sc in seen_shortcodes:
        continue
    p = os.path.join(DEST_DIR, f).replace('\\', '/')
    try:
        with Image.open(p) as im:
            im.verify()
        meta = existing_metadata.get(sc, {})
        valid_feed.append({
            "shortcode": sc,
            "is_video": False,
            "caption": meta.get("caption", "Fredrik Beckman Artwork"),
            "url": p,
            "thumbnail": p
        })
        seen_shortcodes.add(sc)
    except:
        pass

print(f"Clean rebuild complete: {len(valid_feed)} verified media items in feed.")
videos_count = len([x for x in valid_feed if x['is_video']])
images_count = len([x for x in valid_feed if not x['is_video']])
print(f"  Videos: {videos_count}")
print(f"  Images: {images_count}")

# Save feed.json
with open(FEED_JSON, "w", encoding="utf-8") as f:
    json.dump(valid_feed, f, indent=4, ensure_ascii=False)

# Save js/instagram-data.js
with open(DATA_JS, "w", encoding="utf-8") as f:
    f.write("// Instagram Feed Data — Art by Beckman\nconst INSTAGRAM_FEED = " + json.dumps(valid_feed, indent=4, ensure_ascii=False) + ";\n")

print(f"Successfully wrote {FEED_JSON} and {DATA_JS}!")
