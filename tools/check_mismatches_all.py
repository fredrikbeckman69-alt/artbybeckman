import openpyxl
import re
import json
import datetime

wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

month_names_sv = {
    1: 'Januari', 2: 'Februari', 3: 'Mars', 4: 'April', 5: 'Maj', 6: 'Juni',
    7: 'Juli', 8: 'Augusti', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'December'
}

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
    support = str(row[2] or '').strip()
    notes = str(row[3] or '').strip()
    created = row[4]
    material = str(row[5] or '').strip()
    private = str(row[6] or '').strip()
    
    # Clean/standardize date from Excel
    if isinstance(created, (datetime.datetime, datetime.date)):
        std_date = f"{month_names_sv[created.month]} {created.year}"
        std_year = str(created.year)
    elif created:
        c_str = str(created).strip()
        # Clean known typos in Excel
        c_str = re.sub(r'Septem[pn]er', 'September', c_str, flags=re.IGNORECASE)
        c_str = re.sub(r'Dece[mb]ar|Deceber', 'December', c_str, flags=re.IGNORECASE)
        c_str = re.sub(r'Nars', 'Mars', c_str, flags=re.IGNORECASE)
        if c_str == 'Maj 2002': c_str = 'Maj 2022'
        if c_str == 'Juni 2002': c_str = 'Juni 2022'
        std_date = c_str
        ym = re.search(r'\b(20\d\d)\b', c_str)
        std_year = ym.group(1) if ym else ''
    else:
        std_date = ''
        std_year = ''

    excel_map[eid] = {
        'id': eid,
        'title': title,
        'size': size,
        'support': support,
        'notes': notes,
        'created_raw': str(created),
        'std_date': std_date,
        'std_year': std_year,
        'material': material,
        'private': private
    }

print(f"Total parsed items in Excel: {len(excel_map)}")

# 1. Check walkaround-data.js
print("\n--- CHECKING WALKAROUND DATA ---")
with open('js/walkaround-data.js', 'r', encoding='utf-8') as f:
    walk_text = f.read()

for m in re.finditer(r'\{\s*"id":\s*(\d+),\s*"title":\s*"([^"]+)",\s*"size":\s*"([^"]+)",\s*"year":\s*"([^"]+)"', walk_text):
    aid = int(m.group(1))
    title = m.group(2)
    size = m.group(3)
    year = m.group(4)
    ex = excel_map.get(aid, {})
    ex_date = ex.get('std_date', '')
    ex_raw = ex.get('created_raw', '')
    if ex_date != year:
        print(f"Mismatch in walkaround-data.js: ID {aid:3d} ({title}) -> has year='{year}', Excel date='{ex_date}' (raw: '{ex_raw}')")

# 2. Check index.html
print("\n--- CHECKING INDEX.HTML ---")
with open('index.html', 'r', encoding='utf-8') as f:
    index_text = f.read()

for m in re.finditer(r'data-id="(\d+)"\s+data-title="([^"]+)"\s+data-meta="([^"]+)"', index_text):
    aid = int(m.group(1))
    title = m.group(2)
    meta = m.group(3)
    ex = excel_map.get(aid, {})
    print(f"Hero tab: ID {aid} ({title}) -> meta='{meta}' | Excel date='{ex.get('std_date')}' | Excel size='{ex.get('size')}'")

# 3. Check data.js
print("\n--- CHECKING DATA.JS ---")
with open('js/data.js', 'r', encoding='utf-8') as f:
    data_text = f.read()

m = re.search(r'const\s+GALLERY_IMAGES\s*=\s*(\[[\s\S]*?\]);', data_text)
clean = re.sub(r',\s*([\]}])', r'\1', m.group(1))
items = json.loads(clean)

for i in items:
    aid = i.get('id')
    title = i.get('title')
    year = i.get('year')
    ex = excel_map.get(aid, {})
    ex_date = ex.get('std_date', '')
    ex_year = ex.get('std_year', '')
    # Check if year is different from std_date or std_year
    if year != ex_date and year != ex_year:
        print(f"Data.js mismatch: ID {aid:3d} ({title}) -> year='{year}' vs Excel date='{ex_date}' (raw: '{ex.get('created_raw')}')")
