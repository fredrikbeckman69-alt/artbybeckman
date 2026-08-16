import os
import shutil
from PIL import Image

images_dir = 'assets/images'

print("=== STEP 1: PROCESSING IMAGE FILES ===")

# 1. 104 Flower 1.0 -> assets/images/104 FLOWER 1.0.jpg
if os.path.exists('104 Flower 1.0'):
    target_104 = os.path.join(images_dir, '104 FLOWER 1.0.jpg')
    print(f"Converting and saving '104 Flower 1.0' -> '{target_104}'...")
    im = Image.open('104 Flower 1.0')
    # Resize slightly if larger than 2600px to optimize while maintaining high quality
    max_dim = 2600
    if max(im.size) > max_dim:
        scale = max_dim / max(im.size)
        new_size = (int(im.size[0] * scale), int(im.size[1] * scale))
        im = im.resize(new_size, Image.Resampling.LANCZOS)
    im.save(target_104, 'JPEG', quality=90, optimize=True)
    os.remove('104 Flower 1.0')
    print(f"Saved {target_104}, size: {os.path.getsize(target_104)} bytes")

# 2. 243 FLUTE 1.0 -> assets/images/243 FLUTE 1.0.jpg
if os.path.exists('243 FLUTE 1.0'):
    target_243 = os.path.join(images_dir, '243 FLUTE 1.0.jpg')
    print(f"Moving '243 FLUTE 1.0' -> '{target_243}'...")
    im = Image.open('243 FLUTE 1.0')
    im.save(target_243, 'JPEG', quality=92, optimize=True)
    os.remove('243 FLUTE 1.0')
    print(f"Saved {target_243}, size: {os.path.getsize(target_243)} bytes")

# 3. Rename assets/images/243 FROZEN 1.0.jpg -> 244 FROZEN 1.0.jpg
old_243_frozen = os.path.join(images_dir, '243 FROZEN 1.0.jpg')
new_244_frozen = os.path.join(images_dir, '244 FROZEN 1.0.jpg')
if os.path.exists(old_243_frozen):
    print(f"Renaming '{old_243_frozen}' -> '{new_244_frozen}'...")
    if os.path.exists(new_244_frozen):
        os.remove(new_244_frozen)
    os.rename(old_243_frozen, new_244_frozen)

# 4. Rename 242 ATOMIC #79.jpg -> 242 ATOMIC 79.jpg
old_atomic = os.path.join(images_dir, '242 ATOMIC #79.jpg')
new_atomic = os.path.join(images_dir, '242 ATOMIC 79.jpg')
if os.path.exists(old_atomic):
    print(f"Renaming '{old_atomic}' -> '{new_atomic}'...")
    if os.path.exists(new_atomic):
        os.remove(new_atomic)
    os.rename(old_atomic, new_atomic)

# 5. Fix corrupted filenames in assets/images
for fname in os.listdir(images_dir):
    full_path = os.path.join(images_dir, fname)
    if fname.startswith('134') and 'CAF' in fname:
        target = os.path.join(images_dir, '134 ENDLESS BOTTLES 2.8 (CAFE CREME).jpg')
        if full_path != target:
            print(f"Renaming '{fname}' -> '134 ENDLESS BOTTLES 2.8 (CAFE CREME).jpg'")
            if os.path.exists(target): os.remove(target)
            os.rename(full_path, target)
    elif fname.startswith('246') and 'GRAINES' in fname:
        target = os.path.join(images_dir, "246 GRAINES D'ETOILE.jpg")
        if full_path != target:
            print(f"Renaming '{fname}' -> \"246 GRAINES D'ETOILE.jpg\"")
            if os.path.exists(target): os.remove(target)
            os.rename(full_path, target)
    elif fname.startswith('248') and 'LINN' in fname:
        target = os.path.join(images_dir, '248 LINNEAS TRILOGI 1.jpg')
        if full_path != target:
            print(f"Renaming '{fname}' -> '248 LINNEAS TRILOGI 1.jpg'")
            if os.path.exists(target): os.remove(target)
            os.rename(full_path, target)
    elif fname.startswith('249') and 'LINN' in fname:
        target = os.path.join(images_dir, '249 LINNEAS TRILOGI 2.jpg')
        if full_path != target:
            print(f"Renaming '{fname}' -> '249 LINNEAS TRILOGI 2.jpg'")
            if os.path.exists(target): os.remove(target)
            os.rename(full_path, target)
    elif fname.startswith('250') and 'LINN' in fname:
        target = os.path.join(images_dir, '250 LINNEAS TRILOGI 3.jpg')
        if full_path != target:
            print(f"Renaming '{fname}' -> '250 LINNEAS TRILOGI 3.jpg'")
            if os.path.exists(target): os.remove(target)
            os.rename(full_path, target)

print("\nFiles in assets/images now:", len(os.listdir(images_dir)))
