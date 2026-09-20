import json
import re

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'const\s+GALLERY_IMAGES\s*=\s*(\[[\s\S]*?\]);', text)
clean = re.sub(r',\s*([\]}])', r'\1', m.group(1))
items = json.loads(clean)

print(f"Total items in js/data.js: {len(items)}")

# Print summary of year styles
year_types = {}
for i in items:
    y = i.get('year', '')
    if re.match(r'^\d{4}$', y):
        year_types['4-digit year'] = year_types.get('4-digit year', 0) + 1
    elif re.match(r'^[A-Za-zåäöÅÄÖ/]+\s+\d{4}$', y):
        year_types['Month Year'] = year_types.get('Month Year', 0) + 1
    else:
        year_types[f'Other: {y}'] = year_types.get(f'Other: {y}', 0) + 1

print("Year styles in js/data.js:")
for k, v in year_types.items():
    print(f"  {k}: {v}")
