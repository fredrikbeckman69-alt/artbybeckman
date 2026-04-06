import os
import json
import re

directory = 'assets/instagram'
data_file = 'js/instagram-data.js'
feed_file = 'assets/instagram/feed.json'

renamed_map = {}

for filename in os.listdir(directory):
    if filename.endswith('.jpg'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'rb') as f:
            header = f.read(4)
            if header == b'RIFF':
                # It's a webp
                new_filename = filename[:-4] + '.webp'
                new_filepath = os.path.join(directory, new_filename)
                
                f.close()
                os.rename(filepath, new_filepath)
                renamed_map[filename] = new_filename
                print(f"Renamed {filename} -> {new_filename}")

if renamed_map:
    # Update js/instagram-data.js
    with open(data_file, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in renamed_map.items():
        content = content.replace(old, new)
    with open(data_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    # Update feed.json
    with open(feed_file, 'r', encoding='utf-8') as f:
        feed_content = f.read()
    for old, new in renamed_map.items():
        feed_content = feed_content.replace(old, new)
    with open(feed_file, 'w', encoding='utf-8') as f:
        f.write(feed_content)
        
    print(f"Updated {len(renamed_map)} references in JS and JSON files.")
else:
    print("No WebP files posing as .jpg found.")
