#!/usr/bin/env python3
"""
update_instagram_feed.py
Rebuilds assets/instagram/feed.json from locally saved Instagram images and videos.
Videos with matching _thumb.jpg files are included as video items.
"""

import os
import json
from pathlib import Path

root = Path(__file__).parent.parent
instagram_dir = root / "assets" / "instagram"
output_json   = instagram_dir / "feed.json"

items = []
seen = set()

# Collect all video shortcodes (files with .mp4)
video_codes = set()
for f in instagram_dir.iterdir():
    if f.suffix.lower() == ".mp4":
        code = f.stem  # e.g. "C-0cSF7Ir0t"
        video_codes.add(code)

# First pass: videos (with thumbnails)
for code in sorted(video_codes):
    mp4_file   = instagram_dir / f"{code}.mp4"
    thumb_file = instagram_dir / f"{code}_thumb.jpg"
    # Fallback thumbnail: same name as video
    if not thumb_file.exists():
        thumb_file = instagram_dir / f"{code}.jpg"

    thumb_url = f"assets/instagram/{code}_thumb.jpg" if (instagram_dir / f"{code}_thumb.jpg").exists() else f"assets/instagram/{code}.jpg"

    items.append({
        "shortcode":  code,
        "is_video":   True,
        "caption":    "Instagram Video",
        "url":        f"assets/instagram/{code}.mp4",
        "thumbnail":  thumb_url,
    })
    seen.add(code)

# Second pass: images (jpg files NOT already added as video-thumbs)
for f in sorted(instagram_dir.iterdir()):
    if f.suffix.lower() not in (".jpg", ".jpeg"):
        continue
    stem = f.stem
    # Skip thumbnail files for videos
    if stem.endswith("_thumb"):
        continue
    # Skip if this shortcode was a video
    if stem in video_codes:
        continue
    if stem in seen:
        continue
    seen.add(stem)
    items.append({
        "shortcode": stem,
        "is_video":  False,
        "caption":   "Instagram Artwork",
        "url":       f"assets/instagram/{f.name}",
        "thumbnail": f"assets/instagram/{f.name}",
    })

print(f"Total items: {len(items)} ({sum(1 for i in items if i['is_video'])} videos, {sum(1 for i in items if not i['is_video'])} images)")

with open(output_json, "w", encoding="utf-8") as fout:
    json.dump(items, fout, ensure_ascii=False, indent=4)

print(f"Written to {output_json}")

# Also write js/instagram-data.js (inline variable, avoids CORS/fetch issues)
output_js = root / "js" / "instagram-data.js"
js_content = "const INSTAGRAM_FEED = " + json.dumps(items, ensure_ascii=False, indent=4) + ";"
with open(output_js, "w", encoding="utf-8") as fout:
    fout.write(js_content)
print(f"Written to {output_js}")
