#!/usr/bin/env python3
"""
update_gallery_python.py
Reads Excel metadata and generates js/data.js without requiring Excel COM.
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime, timedelta

# Paths
root = Path(__file__).parent.parent
excel_path = root / "assets" / "documents" / "Tavlor dokumentation Fredrik Beckman.xlsx"
image_dir  = root / "assets" / "images"
output_js  = root / "js" / "data.js"

print(f"Excel: {excel_path}")
print(f"Exists: {excel_path.exists()}")

import openpyxl

# 1. Read Excel metadata
wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
ws = wb.active

metadata = {}  # id -> {storlek, material, year, description}

consecutive_blank = 0
for row_idx, row in enumerate(ws.iter_rows(min_row=3, max_row=600, values_only=True), start=3):
    namn = row[0]  # Column A

    if not namn or str(namn).strip() == "":
        consecutive_blank += 1
        if consecutive_blank > 10:
            break
        continue
    consecutive_blank = 0

    namn_str = str(namn).strip()
    m = re.match(r"^(\d+)", namn_str)
    if m:
        id_num = int(m.group(1))
        storlek     = row[1]  # Column B
        # row[2] = Column C (Underlag, skipped)
        anmarkning  = row[3]  # Column D
        tillverkad  = row[4]  # Column E
        material    = row[5]  # Column F

        # Parse year from Excel date serial or string
        year = ""
        if tillverkad is not None:
            if isinstance(tillverkad, (int, float)):
                # Excel serial date
                try:
                    base = datetime(1899, 12, 30)
                    dt = base + timedelta(days=float(tillverkad))
                    year = str(dt.year)
                except Exception:
                    year = str(tillverkad)
            elif hasattr(tillverkad, 'year'):
                year = str(tillverkad.year)
            else:
                year = str(tillverkad).strip()

        metadata[id_num] = {
            "storlek":     str(storlek).strip() if storlek else "",
            "material":    str(material).strip() if material else "",
            "year":        year,
            "description": str(anmarkning).strip() if anmarkning else "",
        }

wb.close()
print(f"Read metadata for {len(metadata)} Excel rows.")

# 2. Scan images
valid_exts = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".JPG", ".JPEG", ".PNG"}
images = []

for f in image_dir.iterdir():
    if f.suffix in valid_exts or f.suffix.lower() in valid_exts:
        filename = f.name
        basename = f.stem

        # Strip leading number from filename (e.g. "34 WHY 1.0" -> id=34, raw="WHY 1.0")
        m = re.match(r"^(\d+)\.?\s*(.*)$", basename)
        if m:
            id_num   = int(m.group(1))
            title_raw = m.group(2)
        else:
            id_num   = 999999
            title_raw = basename

        # Clean title: replace underscores, title-case
        title = title_raw.replace("_", " ").strip()
        title = title.title()

        # Merge Excel metadata
        data = metadata.get(id_num, {})
        images.append({
            "filename":    filename,
            "title":       title,
            "id":          id_num,
            "size":        data.get("storlek", ""),
            "material":    data.get("material", ""),
            "year":        data.get("year", ""),
            "description": data.get("description", ""),
        })

# Sort by id then title
images_sorted = sorted(images, key=lambda x: (x["id"], x["title"]))

# Check how many have metadata
with_meta = sum(1 for i in images_sorted if i["size"] or i["year"] or i["material"])
print(f"Scanned {len(images_sorted)} images, {with_meta} have Excel metadata.")

# 3. Write data.js
js_content = "const GALLERY_IMAGES = " + json.dumps(images_sorted, ensure_ascii=False, indent=4) + ";"
with open(output_js, "w", encoding="utf-8") as fout:
    fout.write(js_content)

print(f"Written to {output_js}")
