import openpyxl
import os
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read Excel file
wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

excel_info = {}
for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx <= 2 or not row[0]:
        continue
    name_raw = str(row[0]).strip()
    m = re.match(r'^(\d+)\.?\s*(.*)$', name_raw)
    if not m:
        continue
    eid = int(m.group(1))
    title_raw = m.group(2).strip()
    
    # Format year/date
    date_val = row[4]
    if hasattr(date_val, 'year'):
        year_str = str(date_val.year)
    elif date_val:
        year_str = str(date_val).strip()
    else:
        year_str = ""
        
    excel_info[eid] = {
        'id': eid,
        'title': title_raw,
        'size': str(row[1] or '').strip(),
        'material': str(row[5] or '').strip(),
        'year': year_str,
        'description': str(row[3] or '').strip()
    }

asset_files = sorted(os.listdir('assets/images'))

def clean_title(raw):
    # Fix any formatting or typos in title
    t = raw.strip()
    # Normalize special titles
    special_map = {
        "GRAINES D´ÉTOILES": "Graines D´Étoiles",
        "LINNÈAS TRILOGI 1": "Linnéas Trilogi 1",
        "LINNÈAS TRILOGI 2": "Linnéas Trilogi 2",
        "LINNÈAS TRILOGI 3": "Linnéas Trilogi 3",
        "ATOMIC #79": "Atomic #79",
        "BRIGHT LIGHTS: LUMIÈRE ÈTINCELANTES": "Bright Lights",
        "HELP ME KOSE MY MIND": "Help Me Lose My Mind",
        "WHO KNEW?": "Who Knew",
        "EVERYTHING I WANT": "Pearls",
        "FALLING IN LOVE IN LO-FI": "Love In Lo-Fi",
        "M;AGNETIC FIELDS 1.0": "Magnetic Fields 1.0",
        "DEATH IS EBVERYWHERE": "Death Is Everywhere 1.0",
        "DEATH IS EVERYWHERE 1.0": "Death Is Everywhere 1.0",
    }
    for k, v in special_map.items():
        if t.upper() == k.upper():
            return v
            
    # Title Case conversion
    words = t.split(' ')
    out = []
    for w in words:
        if not w:
            continue
        if re.match(r'^\d+(\.\d+)*$', w):
            out.append(w)
        elif w.upper() in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'IKEA', 'UV', 'LED', '#79']:
            out.append(w.upper())
        elif len(w) > 1 and w.isupper():
            out.append(w[0].upper() + w[1:].lower())
        else:
            out.append(w[0].upper() + w[1:] if len(w) > 0 else w)
    return ' '.join(out)

gallery_entries = []

for filename in asset_files:
    m = re.match(r'^(\d+)\.?\s*(.*)\.(jpg|jpeg|png|JPG|JPEG|PNG)$', filename)
    if not m:
        continue
    eid = int(m.group(1))
    file_title_part = m.group(2).strip()
    
    ex = excel_info.get(eid, {})
    
    suffix = ""
    if "(1)" in file_title_part:
        suffix = "(1)"
    elif "(2)" in file_title_part:
        suffix = "(2)"
    elif "backside" in file_title_part.lower():
        suffix = "Backside"
    elif "front" in file_title_part.lower():
        suffix = "Front"
    elif "side" in file_title_part.lower():
        suffix = "Side"
        
    base_title = ex.get('title') or file_title_part
    base_title = re.sub(r'\s*\((?:1|2)\)\s*$', '', base_title)
    base_title = re.sub(r'\s*(?:backside|front|side)\s*$', '', base_title, flags=re.IGNORECASE)
    
    display_title = clean_title(base_title)
    if suffix and suffix not in display_title:
        display_title = f"{display_title} {suffix}"
        
    entry = {
        "filename": filename,
        "title": display_title,
        "id": eid,
        "size": ex.get('size', ''),
        "material": ex.get('material', ''),
        "year": ex.get('year', ''),
        "description": ex.get('description', '')
    }
    gallery_entries.append(entry)

gallery_entries.sort(key=lambda x: (x['id'], x['filename']))

# Generate JS
js_content = "// Gallery Data — Art by Beckman\n// Authoritative dataset generated from 'Tavlor dokumentation Fredrik Beckman.xlsx'\n\nconst GALLERY_IMAGES = [\n"

for item in gallery_entries:
    js_content += "    {\n"
    js_content += f'        "filename": {json.dumps(item["filename"], ensure_ascii=False)},\n'
    js_content += f'        "title": {json.dumps(item["title"], ensure_ascii=False)},\n'
    js_content += f'        "id": {item["id"]},\n'
    js_content += f'        "size": {json.dumps(item["size"], ensure_ascii=False)},\n'
    js_content += f'        "material": {json.dumps(item["material"], ensure_ascii=False)},\n'
    js_content += f'        "year": {json.dumps(item["year"], ensure_ascii=False)},\n'
    js_content += f'        "description": {json.dumps(item["description"], ensure_ascii=False)}\n'
    js_content += "    },\n"

js_content += "];\n"

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {len(gallery_entries)} entries in js/data.js.")
