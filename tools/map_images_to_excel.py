import openpyxl, os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

excel_paintings = {}
for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx <= 2 or not row[0]: continue
    name_val = str(row[0]).strip()
    m = re.match(r'^(\d+)\.?\s*(.*)$', name_val)
    if not m: continue
    eid = int(m.group(1))
    title = m.group(2).strip()
    
    date_val = row[4]
    if hasattr(date_val, 'year'):
        year_str = str(date_val.year)
    elif date_val:
        year_str = str(date_val)
    else:
        year_str = ""
        
    excel_paintings[eid] = {
        'id': eid,
        'raw_name': name_val,
        'title': title,
        'size': str(row[1] or '').strip(),
        'material': str(row[5] or '').strip(),
        'year': year_str,
        'description': str(row[3] or '').strip()
    }

print(f"Total excel paintings parsed: {len(excel_paintings)}")

asset_files = sorted(os.listdir('assets/images'))
print(f"Total files in assets/images: {len(asset_files)}")

# Check root files
root_files = [f for f in os.listdir('.') if os.path.isfile(f) and ('Flower' in f or 'FLUTE' in f)]
print("Root image files:", root_files)

# Map files in assets/images to IDs
file_to_id = {}
unmatched_files = []
id_to_files = {}

for f in asset_files:
    m = re.match(r'^(\d+)\.?\s*(.*)$', f)
    if m:
        fid = int(m.group(1))
        file_to_id[f] = fid
        id_to_files.setdefault(fid, []).append(f)
    else:
        unmatched_files.append(f)

print(f"Files matched to IDs: {len(file_to_id)}")
print(f"Unmatched files in assets/images: {unmatched_files}")

# Check IDs with multiple files
for fid, flist in id_to_files.items():
    if len(flist) > 1:
        print(f"ID {fid} has {len(flist)} image files: {flist}")

# Check Excel IDs without any image files in assets/images
missing_img_ids = [eid for eid in sorted(excel_paintings.keys()) if eid not in id_to_files]
print(f"\nExcel IDs with NO images in assets/images ({len(missing_img_ids)}): {missing_img_ids}")
for eid in missing_img_ids:
    print(f"  ID {eid}: {excel_paintings[eid]}")

# Check image files with IDs not in Excel
extra_file_ids = [fid for fid in sorted(id_to_files.keys()) if fid not in excel_paintings]
print(f"\nImage IDs on disk NOT in Excel: {extra_file_ids}")

