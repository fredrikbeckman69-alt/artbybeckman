import json, re

with open('js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const GALLERY_IMAGES = (\[.*\]);', content, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    for item in data:
        if item.get('id') in [269, 270, 271]:
            print("ID:", item['id'])
            print("  title:", item['title'])
            print("  size:", item['size'])
            print("  material:", item['material'])
            print("  year:", item['year'])
