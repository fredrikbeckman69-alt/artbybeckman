import requests
import json
import os
import shutil

SESSION_ID = "52495434061%3AOe3ESbi19PQvdp%3A27%3AAYgsZlaYJwpM9-_sLsmwrANo4biCcweQB_pqfKSXsg"
DEST_DIR = "assets/instagram"
USERNAME = "artbybeckman"

os.makedirs(DEST_DIR, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "x-ig-app-id": "936619743392459",
    "Sec-Fetch-Site": "same-origin",
    "Cookie": f"sessionid={SESSION_ID};"
}

url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
print(f"Fetching Instagram profile data for {USERNAME} natively...")
r = requests.get(url, headers=headers)

if r.status_code != 200:
    print(f"Failed to fetch data. Status: {r.status_code}")
    print(r.text)
    exit(1)

data = r.json()
user = data.get("data", {}).get("user", {})
edges = user.get("edge_owner_to_timeline_media", {}).get("edges", [])

print(f"Found {len(edges)} recent posts. Beginning download...")

feed_data = []

for e in edges:
    node = e.get("node", {})
    shortcode = node.get("shortcode")
    is_video = node.get("is_video", False)
    
    caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
    caption = caption_edges[0].get("node", {}).get("text", "") if caption_edges else ""
    
    # We want video URLs and thumbnail URLs
    video_url = node.get("video_url")
    display_url = node.get("display_url")
    
    post_data = {
        "shortcode": shortcode,
        "is_video": is_video,
        "caption": caption,
        "url": "",
        "thumbnail": ""
    }
    
    print(f"Processing {shortcode} | Video: {is_video}")
    try:
        if is_video and video_url:
            video_filename = f"{shortcode}.mp4"
            video_path = os.path.join(DEST_DIR, video_filename)
            if not os.path.exists(video_path):
                print(f"  -> Downloading video...")
                v_req = requests.get(video_url, stream=True)
                with open(video_path, 'wb') as f:
                    shutil.copyfileobj(v_req.raw, f)
            post_data["url"] = f"assets/instagram/{video_filename}"
            
            thumb_filename = f"{shortcode}_thumb.jpg"
            thumb_path = os.path.join(DEST_DIR, thumb_filename)
            if not os.path.exists(thumb_path):
                t_req = requests.get(display_url, stream=True)
                with open(thumb_path, 'wb') as f:
                    shutil.copyfileobj(t_req.raw, f)
            post_data["thumbnail"] = f"assets/instagram/{thumb_filename}"
            
        elif display_url:
            img_filename = f"{shortcode}.jpg"
            img_path = os.path.join(DEST_DIR, img_filename)
            if not os.path.exists(img_path):
                print(f"  -> Downloading image...")
                i_req = requests.get(display_url, stream=True)
                with open(img_path, 'wb') as f:
                    shutil.copyfileobj(i_req.raw, f)
            post_data["url"] = f"assets/instagram/{img_filename}"
            
        feed_data.append(post_data)
        
    except Exception as ex:
        print(f"  -> Failed to download media for {shortcode}: {ex}")

# Write to JSON layout
feed_file = os.path.join(DEST_DIR, "feed.json")
with open(feed_file, "w", encoding="utf-8") as f:
    json.dump(feed_data, f, indent=4, ensure_ascii=False)

print(f"ALL DONE! Saved {len(feed_data)} items directly.")
