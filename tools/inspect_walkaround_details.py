import json
import re

with open('tools/excel_dump.json', 'r', encoding='utf-8') as f:
    excel_items = json.load(f)

with open('js/walkaround-data.js', 'r', encoding='utf-8') as f:
    walk_text = f.read()

m = re.search(r'const\s+WALKAROUND_ROOMS\s*=\s*(\{[\s\S]*?\});\s*(?:if|$)', walk_text)
if not m:
    print('Could not find WALKAROUND_ROOMS')
else:
    raw_js = m.group(1)
    clean_js = re.sub(r',\s*([\]}])', r'\1', raw_js)
    clean_js = re.sub(r'//.*?\n', '\n', clean_js)
    clean_js = re.sub(r'/\*[\s\S]*?\*/', '', clean_js)
    data = json.loads(clean_js)
    print(f'Rooms found in walkaround-data.js: {list(data.keys())}')
    
    for room_id, room in data.items():
        print(f'\n--- Room: {room_id} ({room.get("name")}) ---')
        for art in room.get('artworks', []):
            aid = str(art.get('id'))
            ex = excel_items.get(aid, {})
            print(f'Art ID {aid:>3}: "{art.get("title")}"')
            print(f'   Walkaround: size="{art.get("size")}", year="{art.get("year")}", material="{art.get("material")}"')
            print(f'   Excel:      size="{ex.get("size")}", date="{ex.get("created_formatted")}", raw_date="{ex.get("created_raw")}", material="{ex.get("material")}"')
