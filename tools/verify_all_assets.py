import os
import re
import json

print("=== CHECKING ALL HTML AND JS ASSET REFERENCES ===")

def check_file_refs(html_file):
    if not os.path.exists(html_file):
        print(f"File {html_file} does not exist")
        return
    with open(html_file, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Check src and href
    srcs = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', content)
    missing = []
    for s in srcs:
        if s.startswith('http') or s.startswith('//') or s.startswith('#') or s.startswith('mailto:') or s.startswith('tel:'):
            continue
        # Strip query params like ?v=3
        clean_path = s.split('?')[0]
        if not os.path.exists(clean_path):
            missing.append(s)
    print(f"\n{html_file}: Checked {len(srcs)} links/sources. Missing: {missing}")

for f in ['index.html', 'gallery.html', 'videos.html', 'instagram.html', 'dist/index.html', 'dist/gallery.html', 'dist/videos.html', 'dist/instagram.html']:
    check_file_refs(f)

# Check instagram-data.js
print("\n=== CHECKING INSTAGRAM DATA ===")
for ig_file in ['js/instagram-data.js', 'js/instagram-data-utf8.js', 'dist/js/instagram-data.js']:
    if not os.path.exists(ig_file):
        continue
    with open(ig_file, 'r', encoding='utf-8', errors='replace') as f:
        c = f.read()
    
    # find images and videos
    media_paths = re.findall(r'["\'](assets/instagram/[^"\']+)["\']', c)
    missing_ig = [m for m in media_paths if not os.path.exists(m.split('?')[0])]
    print(f"{ig_file}: Checked {len(media_paths)} assets. Missing: {len(missing_ig)}")
    if missing_ig:
        for m in missing_ig[:10]:
            print(f"  Missing: {m}")

