import os
from PIL import Image

broken = []
valid = 0
all_files = os.listdir('assets/instagram')

for f in all_files:
    if f.endswith('.jpg') or f.endswith('.png') or f.endswith('.webp'):
        p = os.path.join('assets/instagram', f)
        try:
            with Image.open(p) as im:
                im.verify()
            valid += 1
        except Exception as e:
            broken.append((f, os.path.getsize(p), str(e)))

print(f"Total images checked: {len(all_files)}")
print(f"Valid images: {valid}")
print(f"Broken images: {len(broken)}")

for b in broken:
    print("  Broken:", b)
    # Check first 50 bytes of broken file
    with open(os.path.join('assets/instagram', b[0]), 'rb') as f_in:
        header = f_in.read(100)
        print("    Header:", repr(header))
