import os
import json
import re

def get_real_ext(filepath):
    try:
        with open(filepath, 'rb') as f:
            header = f.read(12)
            if header.startswith(b'\xff\xd8\xff'): return '.jpg'
            if header.startswith(b'\x89PNG\r\n\x1a\n'): return '.png'
            if header.startswith(b'RIFF') and header[8:12] == b'WEBP': return '.webp'
            if header.startswith(b'GIF87a') or header.startswith(b'GIF89a'): return '.gif'
    except: pass
    return None

def is_valid_image(filepath):
    if not filepath or not os.path.exists(filepath): return False
    ext = get_real_ext(filepath)
    return ext is not None

def fix_path_extension(path):
    if not path or not os.path.exists(path):
        # Maybe it was renamed already? Check other extensions
        base, ext = os.path.splitext(path)
        for e in ['.jpg', '.webp', '.png']:
            if os.path.exists(base + e):
                return base + e
        return path
    
    real_ext = get_real_ext(path)
    curr_ext = os.path.splitext(path)[1].lower()
    if real_ext and curr_ext != real_ext:
        new_path = os.path.splitext(path)[0] + real_ext
        if not os.path.exists(new_path):
            os.rename(path, new_path)
            print(f"Renamed {path} -> {new_path}")
        return new_path
    return path

js_backup = 'js/instagram-data-utf8.js'
js_target = 'js/instagram-data.js'
json_target = 'assets/instagram/feed.json'

with open(js_backup, 'r', encoding='utf-8-sig') as f:
    js_content = f.read()

match = re.search(r'const INSTAGRAM_FEED = (\[.*\]);', js_content, re.DOTALL)
feed_data = json.loads(match.group(1))

original_count = len(feed_data)
filtered_feed = []

for item in feed_data:
    # First, fix extensions on disk and in data
    if item.get('url'):
        item['url'] = fix_path_extension(item['url'])
    if item.get('thumbnail'):
        item['thumbnail'] = fix_path_extension(item['thumbnail'])
    
    is_video = item.get('is_video', False)
    target_path = item.get('thumbnail') if is_video else item.get('url')
    
    if is_valid_image(target_path):
        filtered_feed.append(item)
    else:
        print(f"Removing invalid item: {target_path} (Video={is_video})")

# Write back
new_js_content = f"const INSTAGRAM_FEED = {json.dumps(filtered_feed, indent=4)};"
with open(js_target, 'w', encoding='utf-8') as f:
    f.write(new_js_content)

with open(json_target, 'w', encoding='utf-8') as f:
    json.dump(filtered_feed, f, indent=4)

print(f"Restored and filtered from {original_count} to {len(filtered_feed)} items.")
