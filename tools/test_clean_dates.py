import openpyxl
import re
import datetime
import json

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
    
    # Fix known typos
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

all_cleaned = []
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
    
    clean_d = clean_excel_date(created)
    all_cleaned.append({
        'id': eid,
        'title': title,
        'size': size,
        'support': support,
        'notes': notes,
        'created_raw': str(created),
        'created_clean': clean_d,
        'material': material,
        'private': private
    })

print(f"Cleaned {len(all_cleaned)} items.")
for item in all_cleaned[-30:]:
    print(f"ID {item['id']:3d}: {item['title']:<30} | Clean Date: {item['created_clean']:<20} | Raw: {item['created_raw']:<25}")
