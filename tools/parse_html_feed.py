import re
import json
import os
import shutil
import requests
import html

html_path = "Instagram2.html"
DEST_DIR = "assets/instagram"
os.makedirs(DEST_DIR, exist_ok=True)

try:
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()
except FileNotFoundError:
    print(f"File {html_path} not found!")
    exit(1)

feed_data = []
processed = set()

shortcodes = re.findall(r'"shortcode":"([^"]+)"', content)

for sc in shortcodes:
    if sc in processed:
        continue
    processed.add(sc)
    
    idx = content.find(f'"shortcode":"{sc}"')
    if idx == -1: continue
    
    chunk = content[max(0, idx-5000):idx+10000]
    
    d_match = re.search(r'"display_url":"([^"]+)"', chunk)
    v_match = re.search(r'"video_url":"([^"]+)"', chunk)
    is_video_match = re.search(r'"is_video":true', chunk)
    
    display_url = None
    video_url = None
    
    if d_match:
        display_url = d_match.group(1).encode('utf-8').decode('unicode_escape')
    if v_match:
        video_url = v_match.group(1).encode('utf-8').decode('unicode_escape')
        
    is_video = bool(video_url) or bool(is_video_match)
    
    if not display_url and not video_url:
        continue
        
    print(f"Extracted {sc} | Video: {is_video}")
    post_data = {
        "shortcode": sc,
        "is_video": is_video,
        "caption": "",
        "url": "",
        "thumbnail": ""
    }
    
    try:
        if is_video and video_url:
            video_filename = f"{sc}.mp4"
            video_path = os.path.join(DEST_DIR, video_filename)
            if not os.path.exists(video_path):
                print("  -> Downloading video...")
                v_req = requests.get(video_url, stream=True)
                with open(video_path, 'wb') as f:
                    shutil.copyfileobj(v_req.raw, f)
            post_data["url"] = f"assets/instagram/{video_filename}"
            
            if display_url:
                thumb_filename = f"{sc}_thumb.jpg"
                thumb_path = os.path.join(DEST_DIR, thumb_filename)
                if not os.path.exists(thumb_path):
                    t_req = requests.get(display_url, stream=True)
                    with open(thumb_path, 'wb') as f:
                        shutil.copyfileobj(t_req.raw, f)
                post_data["thumbnail"] = f"assets/instagram/{thumb_filename}"
                
        elif display_url:
            img_filename = f"{sc}.jpg"
            img_path = os.path.join(DEST_DIR, img_filename)
            if not os.path.exists(img_path):
                print("  -> Downloading image...")
                i_req = requests.get(display_url, stream=True)
                with open(img_path, 'wb') as f:
                    shutil.copyfileobj(i_req.raw, f)
            post_data["url"] = f"assets/instagram/{img_filename}"
            
        feed_data.append(post_data)
        
    except Exception as e:
        print(f"Error downloading {sc}: {e}")
        
    if len(feed_data) >= 12:
        break

feed_file = os.path.join(DEST_DIR, "feed.json")
with open(feed_file, "w", encoding="utf-8") as f:
    json.dump(feed_data, f, indent=4, ensure_ascii=False)

print(f"Successfully processed {len(feed_data)} posts from offline file!")
