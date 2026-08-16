import openpyxl
import os
import json
import re

wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

excel_items = {}
for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx == 1:
        continue # Title row
    if row_idx == 2:
        cols = row
        print("Columns:", [c for c in cols if c is not None])
        continue
    
    name_val = row[0]
    if not name_val:
        continue
    
    size_val = row[1]
    underlag = row[2]
    note = row[3]
    date_val = row[4]
    material_val = row[5]
    private_val = row[6]
    
    # Try to extract ID from name_val
    m = re.match(r'^(\d+)\s*(.*)$', str(name_val).strip())
    if m:
        item_id = int(m.group(1))
        title = m.group(2).strip()
    else:
        item_id = None
        title = str(name_val).strip()
        
    excel_items[row_idx] = {
        'row_idx': row_idx,
        'raw_name': name_val,
        'id': item_id,
        'title': title,
        'size': size_val,
        'date': str(date_val) if date_val else '',
        'material': material_val,
        'note': note,
        'private': private_val
    }

print(f"\nRead {len(excel_items)} items from Excel sheet.")

# Let's inspect missing IDs from data.js: 11, 14, 16, 52, 104, 155, 244, 247
missing_ids_check = [11, 14, 16, 52, 104, 155, 244, 247]
print("\n--- Checking Missing IDs in Excel ---")
for r_idx, item in excel_items.items():
    if item['id'] in missing_ids_check:
        print(f"Excel has ID {item['id']}: Name='{item['raw_name']}', Date='{item['date']}', Size='{item['size']}', Material='{item['material']}'")

# Let's inspect duplicate IDs from data.js: 2, 3, 22, 36, 98, 238, 240, 241, 242, 243
dup_ids = [2, 3, 22, 36, 98, 238, 240, 241, 242, 243]
print("\n--- Checking Duplicate IDs in Excel ---")
for r_idx, item in excel_items.items():
    if item['id'] in dup_ids:
        print(f"Excel ID {item['id']}: Name='{item['raw_name']}', Date='{item['date']}', Size='{item['size']}'")

