import instaloader
import json
import os
import shutil

# Configuration
USERNAME = "artbybeckman"
PASSWORD = "Autobahn74"  # Extracted from Skills.md
TARGET_PROFILE = "artbybeckman"
DEST_DIR = "assets/instagram"

# Create destination directory if it doesn't exist
os.makedirs(DEST_DIR, exist_ok=True)

# Remove all existing instaloader cache/session logic to prevent stale sessions
# L = instaloader.Instaloader()
L = instaloader.Instaloader(
    download_pictures=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False
)

print(f"Logging in securely to Instagram with {USERNAME}...")
try:
    L.login(USERNAME, PASSWORD)
    print("Login successful.")
except Exception as e:
    print(f"Login failed: {e}")
    print("Trying without login...")

profile = instaloader.Profile.from_username(L.context, TARGET_PROFILE)

posts = profile.get_posts()

feed_data = []
max_posts = 192  # Adjust if needed, fetching all.
count = 0

for post in posts:
    if count >= max_posts:
        break
    
    # We only care about videos per user requirements: "Spela de videos som finns"
    is_video = post.is_video
    
    # If using instaloader download features, it downloads directly.
    # To keep directory clean, we manually download
    shortcode = post.shortcode
    
    # Metadata for the JSON
    post_data = {
        "shortcode": shortcode,
        "is_video": is_video,
        "caption": post.caption if post.caption else "",
        "url": "",
        "thumbnail": ""
    }
    
    try:
        import requests
        print(f"Processing {shortcode} - Video: {is_video}")
        if is_video:
            video_url = post.video_url
            video_filename = f"{shortcode}.mp4"
            video_path = os.path.join(DEST_DIR, video_filename)
            
            if not os.path.exists(video_path):
                print(f"Downloading video: {video_filename}")
                r = requests.get(video_url, stream=True)
                if r.status_code == 200:
                    with open(video_path, 'wb') as f:
                        r.raw.decode_content = True
                        shutil.copyfileobj(r.raw, f)
            post_data["url"] = f"assets/instagram/{video_filename}"
            
            # thumbnail
            thumb_url = post.url
            thumb_filename = f"{shortcode}_thumb.jpg"
            thumb_path = os.path.join(DEST_DIR, thumb_filename)
            if not os.path.exists(thumb_path):
                r = requests.get(thumb_url, stream=True)
                if r.status_code == 200:
                    with open(thumb_path, 'wb') as f:
                        r.raw.decode_content = True
                        shutil.copyfileobj(r.raw, f)
            post_data["thumbnail"] = f"assets/instagram/{thumb_filename}"
            
            feed_data.append(post_data)
        else:
            # For this context, user wants to play videos natively. 
            # We can also fetch some images to show a combined feed.
            img_url = post.url
            img_filename = f"{shortcode}.jpg"
            img_path = os.path.join(DEST_DIR, img_filename)
            
            if not os.path.exists(img_path):
                print(f"Downloading image: {img_filename}")
                r = requests.get(img_url, stream=True)
                if r.status_code == 200:
                    with open(img_path, 'wb') as f:
                        r.raw.decode_content = True
                        shutil.copyfileobj(r.raw, f)
            post_data["url"] = f"assets/instagram/{img_filename}"
            feed_data.append(post_data)
            
    except Exception as e:
        print(f"Error downloading {shortcode}: {e}")
        
    count += 1
    
    # Optional limit to ease network and storage during initial testing
    # if count >= 30:
    #     break

# Output the feed JSON
json_path = os.path.join(DEST_DIR, "feed.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(feed_data, f, indent=4, ensure_ascii=False)

print(f"Successfully generated feed.json with {len(feed_data)} items.")
