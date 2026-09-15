import os
import sys
import time
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image, ImageOps

QUALITY = 84

def is_valid_image(filepath):
    try:
        with Image.open(filepath) as img:
            img.verify()
        return True
    except Exception:
        return False

def convert_single_image(src_path, dst_path, quality=QUALITY):
    try:
        with Image.open(src_path) as img:
            img = ImageOps.exif_transpose(img)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img = img.convert('RGBA')
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(dst_path, 'WEBP', quality=quality, method=6)
        return True, os.path.getsize(src_path), os.path.getsize(dst_path), None
    except Exception as e:
        return False, 0, 0, str(e)

def process_directory(dir_path, extensions=('.jpg', '.jpeg', '.png'), recursive=False):
    tasks = []
    skipped = []
    
    entries = sorted(os.listdir(dir_path))
    for entry in entries:
        full_path = os.path.join(dir_path, entry)
        if not os.path.isfile(full_path):
            continue
        ext = os.path.splitext(entry)[1].lower()
        if ext in extensions:
            if not is_valid_image(full_path):
                skipped.append(full_path)
                continue
            base = os.path.splitext(full_path)[0]
            dst_path = base + '.webp'
            tasks.append((full_path, dst_path))
            
    return tasks, skipped

def create_hero_responsive():
    hero_src = 'assets/images/270 ORIGAMI.jpg'
    results = []
    if os.path.exists(hero_src):
        with Image.open(hero_src) as img:
            img = ImageOps.exif_transpose(img)
            w, h = img.size
            target_w = 800
            target_h = int(h * (target_w / w))
            img_800 = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            if img_800.mode != 'RGB':
                img_800 = img_800.convert('RGB')
            
            targets = [
                'assets/images/270_ORIGAMI_800.webp',
                'assets/images/270 ORIGAMI_800.webp'
            ]
            for t in targets:
                img_800.save(t, 'WEBP', quality=QUALITY, method=6)
                results.append((t, os.path.getsize(t)))
    return results

def main():
    start_time = time.time()
    print("=" * 70)
    print("STARTING MEDIA ASSET WEBP OPTIMIZATION")
    print(f"Quality setting: {QUALITY} (optimal balance in 82-85 range)")
    print("=" * 70)

    target_dirs = [
        ('assets', ('assets/images', 'assets/instagram', 'assets/Movies', 'assets/documents')),
        ('assets/images', ()),
        ('assets/instagram', ())
    ]

    all_tasks = []
    all_skipped = []
    dir_stats = {}

    for d, excludes in target_dirs:
        if not os.path.exists(d):
            continue
        tasks, skipped = process_directory(d)
        all_tasks.extend(tasks)
        all_skipped.extend(skipped)
        dir_stats[d] = {
            'task_count': len(tasks),
            'skipped_count': len(skipped),
            'tasks': tasks
        }
        print(f"Found {len(tasks)} images in '{d}' (skipped {len(skipped)} non-images/invalid)")

    print(f"\nTotal image conversions queued: {len(all_tasks)}")
    print("Converting images using ThreadPoolExecutor (max_workers=8)...")

    results_map = {}
    completed_count = 0
    total_orig_bytes = 0
    total_webp_bytes = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_task = {
            executor.submit(convert_single_image, src, dst): (src, dst)
            for src, dst in all_tasks
        }
        for future in as_completed(future_to_task):
            src, dst = future_to_task[future]
            success, orig_sz, webp_sz, err = future.result()
            if success:
                completed_count += 1
                total_orig_bytes += orig_sz
                total_webp_bytes += webp_sz
                results_map[src] = (orig_sz, webp_sz)
            else:
                print(f"FAILED: {src} -> {err}")

    # Generate responsive hero versions
    hero_responsive = create_hero_responsive()
    print("\nHero Image Responsive Versions Created:")
    for path, sz in hero_responsive:
        print(f"  {path}: {sz / 1024:.1f} KB")

    # Sync to dist/assets if dist exists
    dist_synced = 0
    if os.path.exists('dist/assets'):
        print("\nSyncing WebP assets to dist/assets...")
        for src, dst in all_tasks:
            rel = os.path.relpath(dst, 'assets')
            dist_dst = os.path.join('dist/assets', rel)
            dist_dir = os.path.dirname(dist_dst)
            os.makedirs(dist_dir, exist_ok=True)
            if os.path.exists(dst):
                shutil.copy2(dst, dist_dst)
                dist_synced += 1
        for path, _ in hero_responsive:
            rel = os.path.relpath(path, 'assets')
            dist_dst = os.path.join('dist/assets', rel)
            if os.path.exists(path):
                shutil.copy2(path, dist_dst)
                dist_synced += 1
        print(f"Synced {dist_synced} WebP files to dist/assets/")

    elapsed = time.time() - start_time
    total_saved_bytes = total_orig_bytes - total_webp_bytes
    savings_pct = (total_saved_bytes / total_orig_bytes * 100) if total_orig_bytes > 0 else 0

    print("\n" + "=" * 70)
    print("OPTIMIZATION SUMMARY REPORT")
    print("=" * 70)
    print(f"Total images converted:       {completed_count}")
    print(f"Non-images preserved untouched: {len(all_skipped)}")
    print(f"Original total size:          {total_orig_bytes / (1024*1024):.2f} MB ({total_orig_bytes:,} bytes)")
    print(f"WebP total size:              {total_webp_bytes / (1024*1024):.2f} MB ({total_webp_bytes:,} bytes)")
    print(f"Total byte savings:           {total_saved_bytes / (1024*1024):.2f} MB ({total_saved_bytes:,} bytes)")
    print(f"Overall reduction:            {savings_pct:.2f}%")
    print(f"Execution time:               {elapsed:.2f} seconds")

    print("\nDirectory Breakdown:")
    for d, dinfo in dir_stats.items():
        d_orig = sum(results_map.get(src, (0, 0))[0] for src, _ in dinfo['tasks'])
        d_webp = sum(results_map.get(src, (0, 0))[1] for src, _ in dinfo['tasks'])
        d_saved = d_orig - d_webp
        d_pct = (d_saved / d_orig * 100) if d_orig > 0 else 0
        print(f"  {d:20s}: {len(dinfo['tasks']):3d} files | "
              f"Orig: {d_orig / (1024*1024):6.2f} MB -> WebP: {d_webp / (1024*1024):6.2f} MB "
              f"| Saved: {d_saved / (1024*1024):6.2f} MB ({d_pct:5.1f}%)")
    print("=" * 70)

if __name__ == '__main__':
    main()
