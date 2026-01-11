
import os
import json
import re

IMAGE_DIR = r"assets\images"
OUTPUT_FILE = r"js\data.js"

def parse_filename(filename):
    # Remove extension
    name = os.path.splitext(filename)[0]
    
    # Try to extract leading number if present (e.g., "100 A DREAM...")
    match = re.match(r"^(\d+)\.?\s*(.+)$", name)
    if match:
        number = match.group(1)
        title_raw = match.group(2)
    else:
        number = None
        title_raw = name
        
    # Clean up title:
    # 1. Replace underscores with spaces
    # 2. Fix common messy patterns (like "1.0", "1.1" at end if desired, or keep them)
    # For now, let's keep version numbers as they might be significant to the artist.
    # But let's Title Case it to look nice.
    
    title = title_raw.replace("_", " ").strip()
    
    # Heuristic: Convert ALL CAPS to Title Case, but keep mixed case as is?
    # Or just enforce Title Case for consistency?
    # Let's simple title case it for now.
    title = title.title()
    
    return {
        "filename": filename,
        "title": title,
        "original_number": number
    }

def main():
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: Directory {IMAGE_DIR} not found.")
        return

    images = []
    valid_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
    
    print(f"Scanning {IMAGE_DIR}...")
    
    for filename in os.listdir(IMAGE_DIR):
        ext = os.path.splitext(filename)[1].lower()
        if ext in valid_extensions:
            file_path = os.path.join(IMAGE_DIR, filename)
            # You could add image dimension check here if needed, but skipping for speed
            
            meta = parse_filename(filename)
            images.append(meta)
    
    # Sort images. 
    # Logic: If they have numbers, sort by number. If not, sort by filename.
    # We need to handle mixed cases safely.
    def sort_key(item):
        if item["original_number"]:
            try:
                return float(item["original_number"])
            except ValueError:
                return 999999
        return 999999 # Put unnumbered at the end? Or start? Let's put at end.

    images.sort(key=sort_key)
    
    # Generate JS content
    js_content = f"const GALLERY_IMAGES = {json.dumps(images, indent=2)};"
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    print(f"Found {len(images)} images.")
    print(f"Written metadata to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
