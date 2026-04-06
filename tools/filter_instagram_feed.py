import os
import json
import re

def is_valid_image(filepath):
    if not filepath or not os.path.exists(filepath):
        return False
    try:
        with open(filepath, 'rb') as f:
            header = f.read(12)
            if header.startswith(b'\xff\xd8\xff'):
                return True # JPEG
            if header.startswith(b'\x89PNG\r\n\x1a\n'):
                return True # PNG
            if header.startswith(b'RIFF') and header[8:12] == b'WEBP':
                return True # WEBP
            if header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
                return True # GIF
    except:
        pass
    return False

js_file = 'js/instagram-data.js'
json_file = 'assets/instagram/feed.json'

with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

match = re.search(r'const INSTAGRAM_FEED = (\[.*\]);', js_content, re.DOTALL)
if not match:
    print("Could not find INSTAGRAM_FEED in js/instagram-data.js")
    exit(1)

feed_data = json.loads(match.group(1))
original_count = len(feed_data)
filtered_feed = []

for item in feed_data:
    is_video = item.get('is_video', False)
    url_path = item.get('url', '')
    thumb_path = item.get('thumbnail', '')
    
    if is_video:
        # For videos, check the thumbnail
        valid = is_valid_image(thumb_path)
    else:
        # For images, check the URL
        valid = is_valid_image(url_path)
    
    if valid:
        filtered_feed.append(item)
    else:
        ptr = thumb_path if is_video else url_path
        print(f"Removing invalid item: {ptr} (Video={is_video})")

new_js_content = f"const INSTAGRAM_FEED = {json.dumps(filtered_feed, indent=4)};"
with open(js_file, 'w', encoding='utf-8') as f:
    f.write(new_js_content)

with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(filtered_feed, f, indent=4)

print(f"Done. Filtered from {original_count} to {len(filtered_feed)} items.")
