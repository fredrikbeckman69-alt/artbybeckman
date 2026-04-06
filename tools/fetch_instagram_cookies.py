import browser_cookie3
import instaloader
import json
import os
import shutil
import sys
import requests

DEST_DIR = "assets/instagram"
TARGET_PROFILE = "artbybeckman"
os.makedirs(DEST_DIR, exist_ok=True)

print("Extracting cookies from local browsers...")
try:
    # Get cookies from all supported browsers
    cj = browser_cookie3.load(domain_name="instagram.com")
    
    # Verify we got the sessionid
    sessionid = None
    for cookie in cj:
        if cookie.name == "sessionid":
            sessionid = cookie.value
            break
            
    if not sessionid:
        print("Could not find an active Instagram session (sessionid cookie) in any local browser.")
        sys.exit(1)
        
    print(f"Found active Instagram session! Using it to log in...")
    
    L = instaloader.Instaloader(
        download_pictures=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False
    )
    
    # Inject the session into instaloader's requests session
    for cookie in cj:
        L.context._session.cookies.set(cookie.name, cookie.value, domain=cookie.domain, path=cookie.path)
    
    # We must also set the username because instaloader checks it:
    # L.context.username = "artbybeckman" # Wait, instaloader uses context.is_logged_in flag.
    # To trick instaloader, we just let it use the session. It usually works.
    L.context.username = "artbybeckman"
    L.context.is_logged_in = True
    
    print("Fetching profile...")
    profile = instaloader.Profile.from_username(L.context, TARGET_PROFILE)
    posts = profile.get_posts()
    
    feed_data = []
    count = 0
    max_posts = 15 # Download latest 15 to prevent huge sizes initially
    
    for post in posts:
        if count >= max_posts:
            break
            
        shortcode = post.shortcode
        is_video = post.is_video
        print(f"[{count+1}/{max_posts}] Processing {shortcode} - Video: {is_video}")
        
        post_data = {
            "shortcode": shortcode,
            "is_video": is_video,
            "caption": post.caption if post.caption else "",
            "url": "",
            "thumbnail": ""
        }
        
        try:
            if is_video:
                video_url = post.video_url
                video_filename = f"{shortcode}.mp4"
                video_path = os.path.join(DEST_DIR, video_filename)
                
                if not os.path.exists(video_path):
                    print(f"  -> Downloading video...")
                    r = requests.get(video_url, stream=True)
                    if r.status_code == 200:
                        with open(video_path, 'wb') as f:
                            r.raw.decode_content = True
                            shutil.copyfileobj(r.raw, f)
                post_data["url"] = f"assets/instagram/{video_filename}"
                
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
            else:
                img_url = post.url
                img_filename = f"{shortcode}.jpg"
                img_path = os.path.join(DEST_DIR, img_filename)
                
                if not os.path.exists(img_path):
                    print(f"  -> Downloading image...")
                    r = requests.get(img_url, stream=True)
                    if r.status_code == 200:
                        with open(img_path, 'wb') as f:
                            r.raw.decode_content = True
                            shutil.copyfileobj(r.raw, f)
                post_data["url"] = f"assets/instagram/{img_filename}"
                
            feed_data.append(post_data)
        except Exception as e:
            print(f"Error on {shortcode}: {e}")
            
        count += 1
        
    json_path = os.path.join(DEST_DIR, "feed.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully generated feed.json with {len(feed_data)} items.")

except Exception as e:
    print(f"Fatal error: {e}")
    import traceback
    traceback.print_exc()
