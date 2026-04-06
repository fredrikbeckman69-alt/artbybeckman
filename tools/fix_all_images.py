import os

def get_real_ext(filepath):
    with open(filepath, 'rb') as f:
        header = f.read(12)
        if header.startswith(b'\xff\xd8\xff'):
            return '.jpg'
        if header.startswith(b'\x89PNG\r\n\x1a\n'):
            return '.png'
        if header.startswith(b'RIFF') and header[8:12] == b'WEBP':
            return '.webp'
        if header.startswith(b'GIF87a') or header.startswith(b'GIF89a'):
            return '.gif'
    return None

directory = 'assets/instagram'
js_file = 'js/instagram-data.js'
json_file = 'assets/instagram/feed.json'

with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

with open(json_file, 'r', encoding='utf-8') as f:
    json_content = f.read()

fixed_count = 0

for filename in os.listdir(directory):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        filepath = os.path.join(directory, filename)
        real_ext = get_real_ext(filepath)
        
        curr_ext = os.path.splitext(filename)[1].lower()
        if real_ext and curr_ext != real_ext:
            new_filename = os.path.splitext(filename)[0] + real_ext
            new_filepath = os.path.join(directory, new_filename)
            
            # Avoid overwriting if possible
            if os.path.exists(new_filepath):
                # If it's the exact same file, just delete the old one
                # but better to just rename to a temp then rename back
                print(f"Collision: {new_filename} already exists. Renaming with suffix.")
                new_filename = os.path.splitext(filename)[0] + "_fix" + real_ext
                new_filepath = os.path.join(directory, new_filename)

            os.rename(filepath, new_filepath)
            print(f"Fixed: {filename} -> {new_filename} (was actually {real_ext})")
            
            js_content = js_content.replace(filename, new_filename)
            json_content = json_content.replace(filename, new_filename)
            fixed_count += 1

if fixed_count > 0:
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    with open(json_file, 'w', encoding='utf-8') as f:
        f.write(json_content)
    print(f"Successfully fixed {fixed_count} image extensions and updated metadata.")
else:
    print("No extension mismatches found.")
