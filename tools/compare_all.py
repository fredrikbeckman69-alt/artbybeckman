import openpyxl
import os
import json
import re

wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

excel_items = []
for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx <= 2 or not row[0]:
        continue
    name_val = str(row[0]).strip()
    m = re.match(r'^(\d+)\.?\s*(.*)$', name_val)
    if m:
        item_id = int(m.group(1))
        title = m.group(2).strip()
    else:
        item_id = None
        title = name_val
    
    excel_items.append({
        'id': item_id,
        'raw_name': name_val,
        'title': title,
        'size': row[1] or '',
        'note': row[3] or '',
        'date': str(row[4]) if row[4] else '',
        'material': row[5] or '',
        'private': row[6] or ''
    })

# Now let's inspect all files in assets/images and root
asset_files = os.listdir('assets/images')
root_files = [f for f in os.listdir('.') if os.path.isfile(f)]

print(f"Total Excel items: {len(excel_items)}")

# Let's inspect what's in data.js
with open('js/data.js', 'r', encoding='utf-8', errors='replace') as f:
    data_content = f.read()

match = re.search(r'const\s+GALLERY_IMAGES\s*=\s*(\[[\s\S]*?\]);', data_content)
clean_js = re.sub(r',\s*([\]}])', r'\1', match.group(1))
gallery_images = json.loads(clean_js)

print(f"Total data.js items: {len(gallery_images)}")

# Let's map each Excel ID to:
# 1. Excel details
# 2. data.js entries with that ID
# 3. disk files matching ID
print("\n=== COMPREHENSIVE ID-BY-ID REPORT ===")
for ex in excel_items:
    eid = ex['id']
    js_matches = [j for j in gallery_images if j.get('id') == eid]
    file_matches = [f for f in asset_files if re.match(rf'^{eid}\b', f)]
    root_matches = [f for f in root_files if re.match(rf'^{eid}\b', f)]
    
    # Check if there is any mismatch or anomaly
    anomaly = False
    reasons = []
    if len(js_matches) == 0:
        anomaly = True
        reasons.append("MISSING IN DATA.JS")
    elif len(js_matches) > 1:
        anomaly = True
        reasons.append(f"DUPLICATE IN DATA.JS ({len(js_matches)} times)")
        
    if len(file_matches) == 0:
        if len(root_matches) > 0:
            anomaly = True
            reasons.append(f"IMAGE IN ROOT: {root_matches}")
        else:
            anomaly = True
            reasons.append("NO IMAGE FILE FOUND")
            
    # Check if filename in data.js exists on disk
    for j in js_matches:
        fn = j.get('filename')
        if fn not in asset_files:
            anomaly = True
            reasons.append(f"DATA.JS FILENAME NOT ON DISK: '{fn}'")
            
    if anomaly:
        print(f"\n[ID {eid}] {ex['title']}")
        print(f"  Excel: Name='{ex['raw_name']}', Date='{ex['date']}', Size='{ex['size']}', Material='{ex['material']}', Note='{ex['note']}'")
        print(f"  Anomalies: {', '.join(reasons)}")
        if js_matches:
            print(f"  data.js entries: {json.dumps(js_matches, ensure_ascii=False)}")
        if file_matches:
            print(f"  asset/images matches: {file_matches}")
