import re

path = r"C:\Users\fredr\OneDrive - Skyddsprodukter i Sverige AB\Tor Finans\Personligt\Antigravity Git\artbybeckman\js\data.js"

with open(path, 'r', encoding='utf-8-sig') as f:
    content = f.read()

# Check what we're working with
print("File length:", len(content))
idx = content.find('269 VERTIGO')
print("Found '269 VERTIGO' at index:", idx)
if idx > -1:
    print("Context:", repr(content[idx-20:idx+200]))

# Patch: for each of the three paintings, replace the empty fields
patches = [
    (
        '"269 VERTIGO.jpg"',
        '"Vertigo"',
        '269',
        '40 * 100 cm',
        'Akrylfärg, glitter',
        'April 2026'
    ),
    (
        '"270 ORIGAMI.jpg"',
        '"Origami"',
        '270',
        '100 * 120 cm',
        'Akrylfärg, glitter',
        'April 2026'
    ),
    (
        '"271 GOLDEN TICKET.jpg"',
        '"Golden Ticket"',
        '271',
        '40 * 100 cm',
        'Akrylfärg, glitter',
        'April 2026'
    ),
]

for filename, title, id_num, size, material, year in patches:
    # Pattern covers the block from filename to the closing brace
    pattern = (
        r'("filename":\s*' + re.escape(filename) + r'.*?'
        r'"size":\s*"".*?'
        r'"material":\s*"".*?'
        r'"year":\s*"")'
    )
    replacement_fn = lambda m, s=size, mat=material, yr=year: (
        m.group(0)
        .replace('"size":  ""', f'"size":  "{s}"')
        .replace('"material":  ""', f'"material":  "{mat}"')
        .replace('"year":  ""', f'"year":  "{yr}"')
    )
    new_content, count = re.subn(pattern, replacement_fn, content, flags=re.DOTALL)
    if count:
        content = new_content
        print(f"Patched {filename} ({count} match)")
    else:
        print(f"WARNING: Could not patch {filename}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")

# Verify
with open(path, 'r', encoding='utf-8') as f:
    verify = f.read()

for keyword in ['269 VERTIGO', '270 ORIGAMI', '271 GOLDEN TICKET']:
    idx = verify.find(keyword)
    if idx > -1:
        print(f"\n{keyword} block:")
        print(verify[idx:idx+200])
