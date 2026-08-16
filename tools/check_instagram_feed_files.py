import json
import os
import re

with open('js/instagram-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'const\s+INSTAGRAM_FEED\s*=\s*(\[[\s\S]*?\]);', text)
feed = json.loads(m.group(1))

print(f"Total items in feed: {len(feed)}")

zero_bytes = []
missing = []
valid = []

for i, item in enumerate(feed):
    sc = item.get("shortcode")
    is_video = item.get("is_video")
    url = item.get("url", "")
    thumb = item.get("thumbnail", "")

    # Check url
    if not os.path.exists(url):
        missing.append((i, sc, "url", url))
    elif os.path.getsize(url) < 1000:
        zero_bytes.append((i, sc, "url", url, os.path.getsize(url)))
    else:
        # Check thumbnail if video
        if is_video and thumb:
            if not os.path.exists(thumb):
                missing.append((i, sc, "thumb", thumb))
            elif os.path.getsize(thumb) < 1000:
                zero_bytes.append((i, sc, "thumb", thumb, os.path.getsize(thumb)))
            else:
                valid.append(item)
        else:
            valid.append(item)

print(f"Valid complete items: {len(valid)}")
print(f"Missing items: {len(missing)}")
print(f"Zero/tiny byte items: {len(zero_bytes)}")

for m in missing[:10]:
    print("  Missing:", m)
for z in zero_bytes[:10]:
    print("  Tiny bytes:", z)
