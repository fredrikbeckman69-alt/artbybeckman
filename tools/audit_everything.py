import os
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== 1. CHECKING INSTAGRAM POSTS ===")
with open('js/instagram-data.js', 'r', encoding='utf-8', errors='replace') as f:
    ig_text = f.read()

m = re.search(r'const\s+INSTAGRAM_POSTS\s*=\s*(\[[\s\S]*?\]);', ig_text)
if m:
    ig_posts = json.loads(m.group(1))
    print(f"Instagram posts in js/instagram-data.js: {len(ig_posts)}")
    missing_ig = []
    for post in ig_posts:
        media = post.get('media', '')
        thumb = post.get('thumbnail', '')
        if media and not os.path.exists(media):
            missing_ig.append(media)
        if thumb and not os.path.exists(thumb):
            missing_ig.append(thumb)
    if missing_ig:
        print(f"Missing Instagram assets ({len(missing_ig)}):", missing_ig)
    else:
        print("ALL Instagram assets exist on disk!")

print("\n=== 2. CHECKING VIDEOS.HTML EMBEDS AND THUMBNAILS ===")
with open('videos.html', 'r', encoding='utf-8') as f:
    v_text = f.read()

yt_ids = re.findall(r'data-id="([^"]+)"', v_text)
print(f"Total YouTube videos in videos.html: {len(yt_ids)}")
img_srcs = re.findall(r'<img[^>]+src="([^"]+)"', v_text)
print(f"Total img tags in videos.html: {len(img_srcs)}")

print("\n=== 3. CHECKING INDEX.HTML ASSETS ===")
with open('index.html', 'r', encoding='utf-8') as f:
    idx_text = f.read()

idx_imgs = re.findall(r'<img[^>]+src="([^"]+)"', idx_text)
idx_videos = re.findall(r'<source[^>]+src="([^"]+)"', idx_text)
print("index.html images:", idx_imgs)
print("index.html videos:", idx_videos)
for s in idx_imgs + idx_videos:
    clean = s.replace('%20', ' ')
    if not os.path.exists(clean):
        print(f"  MISSING from index.html: {s} -> {clean}")
    else:
        print(f"  OK: {clean}")

