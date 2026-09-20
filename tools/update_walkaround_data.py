import json
import re
import openpyxl
import datetime

# Load Excel data
wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

month_names_sv = {
    1: 'Januari', 2: 'Februari', 3: 'Mars', 4: 'April', 5: 'Maj', 6: 'Juni',
    7: 'Juli', 8: 'Augusti', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'December'
}

def clean_excel_date(date_val):
    if not date_val:
        return ""
    if isinstance(date_val, (datetime.datetime, datetime.date)):
        m = month_names_sv.get(date_val.month, "")
        return f"{m} {date_val.year}".strip() if m else str(date_val.year)
    
    s = str(date_val).strip()
    s = re.sub(r'Septem[pn]er', 'September', s, flags=re.IGNORECASE)
    s = re.sub(r'Dece[mb]ar|Deceber', 'December', s, flags=re.IGNORECASE)
    s = re.sub(r'Nars', 'Mars', s, flags=re.IGNORECASE)
    if 'Maj 2002' in s:
        s = s.replace('Maj 2002', 'Maj 2022')
    if 'Juni 2002' in s:
        s = s.replace('Juni 2002', 'Juni 2022')
    if '4/1/2021' in s:
        s = 'April 2021'
    return s

excel_map = {}
for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx <= 2 or not row[0]:
        continue
    name_raw = str(row[0]).strip()
    m = re.match(r'^(\d+)\.?\s*(.*)$', name_raw)
    if not m:
        continue
    eid = int(m.group(1))
    title = m.group(2).strip()
    size = str(row[1] or '').strip()
    material = str(row[5] or '').strip()
    clean_date = clean_excel_date(row[4])
    excel_map[eid] = {
        'id': eid,
        'title': title,
        'size': size,
        'material': material,
        'date': clean_date
    }

print(f"Loaded {len(excel_map)} artworks from Excel.")

# Update js/walkaround-data.js
with open('js/walkaround-data.js', 'r', encoding='utf-8') as f:
    walk_text = f.read()

# We want to replace each artwork block's "year" field with its corresponding date from Excel
# Let's find all {"id": <id>, ... "year": "..."} blocks
def replace_art_year(match):
    full_block = match.group(0)
    aid = int(match.group(1))
    old_year = match.group(2)
    ex = excel_map.get(aid)
    if ex and ex['date']:
        new_year = ex['date']
        # replace "year": "old_year" with "year": "new_year"
        updated = full_block.replace(f'"year": "{old_year}"', f'"year": "{new_year}"')
        print(f"Updating ID {aid:3d} ({ex['title']}): '{old_year}' -> '{new_year}'")
        return updated
    return full_block

# Regex matching artwork object with id and year
pattern = re.compile(r'\{\s*"id":\s*(\d+),[\s\S]*?"year":\s*"([^"]+)"[\s\S]*?\}')

new_walk_text = pattern.sub(replace_art_year, walk_text)

with open('js/walkaround-data.js', 'w', encoding='utf-8') as f:
    f.write(new_walk_text)

with open('dist/js/walkaround-data.js', 'w', encoding='utf-8') as f:
    f.write(new_walk_text)

print("Updated js/walkaround-data.js and dist/js/walkaround-data.js successfully.")
