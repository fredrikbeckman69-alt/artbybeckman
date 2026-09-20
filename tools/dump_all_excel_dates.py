import openpyxl
import re
import datetime

wb = openpyxl.load_workbook('Tavlor dokumentation Fredrik Beckman.xlsx', data_only=True)
sheet = wb.active

for row_idx, row in enumerate(sheet.iter_rows(values_only=True), start=1):
    if row_idx <= 2 or not row[0]:
        continue
    name_raw = str(row[0]).strip()
    m = re.match(r'^(\d+)\.?\s*(.*)$', name_raw)
    if not m:
        continue
    eid = int(m.group(1))
    title = m.group(2).strip()
    created = row[4]
    print(f"Row {row_idx:3d} | ID {eid:3d} | {title:<35} | Type: {type(created).__name__:<10} | Value: {repr(created)}")
