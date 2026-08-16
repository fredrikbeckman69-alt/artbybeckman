import os
import re
import json
import time
import requests
import sys

DEST_DIR = "assets/instagram"
DATA_JS = "js/instagram-data.js"
FEED_JSON = "assets/instagram/feed.json"
USERNAME = "artbybeckman"
os.makedirs(DEST_DIR, exist_ok=True)

def download_file(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return True
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=25)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        return False
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False

def fetch_all(sessionid):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "x-ig-app-id": "936619743392459",
        "Sec-Fetch-Site": "same-origin",
        "Cookie": f"sessionid={sessionid};",
        "Referer": "https://www.instagram.com/artbybeckman/"
    }

    print(f"Connecting to Instagram for @{USERNAME}...")
    url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
    r = requests.get(url, headers=headers)
    
    if r.status_code != 200:
        print(f"Failed to connect. HTTP {r.status_code}. The sessionid may be expired or invalid.")
        print(r.text[:300])
        return False

    data = r.json()
    user = data.get("data", {}).get("user", {})
    user_id = user.get("id")
    timeline = user.get("edge_owner_to_timeline_media", {})
    total_count = timeline.get("count", 0)
    edges = timeline.get("edges", [])
    page_info = timeline.get("page_info", {})
    
    print(f"Total posts on profile: {total_count}")
    print(f"First page retrieved: {len(edges)} posts.")

    all_edges = list(edges)

    # Paginate through remaining posts
    while page_info.get("has_next_page"):
        end_cursor = page_info.get("end_cursor")
        print(f"Fetching next page with cursor {end_cursor[:20]}... (total collected so far: {len(all_edges)})")
        
        # Query GraphQL endpoint for next page
        query_url = "https://www.instagram.com/graphql/query/"
        variables = json.dumps({
            "id": user_id,
            "first": 50,
            "after": end_cursor
        })
        
        # doc_id for timeline query or query_hash
        params = {
            "query_hash": "69cba40317214236af40e7efa697781d",
            "variables": variables
        }
        
        time.sleep(1.5)
        res = requests.get(query_url, headers=headers, params=params)
        if res.status_code != 200:
            # Fallback to feed/user endpoint
            fallback_url = f"https://www.instagram.com/api/v1/feed/user/{USERNAME}/?max_id={end_cursor}"
            res = requests.get(fallback_url, headers=headers)
            if res.status_code != 200:
                print(f"Pagination stopped. Status {res.status_code}")
                break
            d_json = res.json()
            items = d_json.get("items", [])
            print(f"  Retrieved {len(items)} items from feed endpoint")
            # Map items
            for it in items:
                all_edges.append({"node": it})
            if not d_json.get("more_available"):
                break
            page_info = {"has_next_page": d_json.get("more_available"), "end_cursor": d_json.get("next_max_id")}
        else:
            q_data = res.json()
            q_timeline = q_data.get("data", {}).get("user", {}).get("edge_owner_to_timeline_media", {})
            new_edges = q_timeline.get("edges", [])
            print(f"  Retrieved {len(new_edges)} posts from GraphQL")
            if not new_edges:
                break
            all_edges.extend(new_edges)
            page_info = q_timeline.get("page_info", {})

    print(f"\nSuccessfully collected {len(all_edges)} total posts! Beginning media download...")

    feed_data = []
    
    for idx, e in enumerate(all_edges, 1):
        node = e.get("node", {})
        shortcode = node.get("shortcode") or node.get("code")
        if not shortcode:
            continue
            
        is_video = node.get("is_video", False)
        
        caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
        if caption_edges:
            caption = caption_edges[0].get("node", {}).get("text", "")
        elif "caption" in node and isinstance(node["caption"], dict):
            caption = node["caption"].get("text", "")
        else:
            caption = "Fredrik Beckman Artwork"

        video_url = node.get("video_url")
        display_url = node.get("display_url") or (node.get("image_versions2", {}).get("candidates", [{}])[0].get("url") if "image_versions2" in node else None)

        print(f"[{idx}/{len(all_edges)}] Processing {shortcode} (Video: {is_video})...")

        if is_video:
            video_file = f"{DEST_DIR}/{shortcode}.mp4"
            thumb_file = f"{DEST_DIR}/{shortcode}_thumb.jpg"
            
            # Download video
            if video_url:
                download_file(video_url, video_file)
            if display_url:
                download_file(display_url, thumb_file)
                
            if os.path.exists(video_file):
                feed_data.append({
                    "shortcode": shortcode,
                    "is_video": True,
                    "caption": caption,
                    "url": video_file,
                    "thumbnail": thumb_file if os.path.exists(thumb_file) else video_file
                })
        else:
            img_file = f"{DEST_DIR}/{shortcode}.jpg"
            if display_url:
                download_file(display_url, img_file)
            if os.path.exists(img_file):
                feed_data.append({
                    "shortcode": shortcode,
                    "is_video": False,
                    "caption": caption,
                    "url": img_file,
                    "thumbnail": img_file
                })

    print(f"\nFinished! Total {len(feed_data)} posts downloaded and ready.")
    
    # Save feed.json
    with open(FEED_JSON, "w", encoding="utf-8") as f:
        json.dump(feed_data, f, indent=4, ensure_ascii=False)
        
    # Save js/instagram-data.js
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write("// Instagram Feed Data — Art by Beckman\nconst INSTAGRAM_FEED = " + json.dumps(feed_data, indent=4, ensure_ascii=False) + ";\n")
        
    print(f"Saved {FEED_JSON} and {DATA_JS}!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sid = sys.argv[1]
    elif os.path.exists("tools/ig_session.json"):
        with open("tools/ig_session.json") as f:
            sid = json.load(f).get("sessionid")
    else:
        print("Usage: python tools/fetch_full_instagram_feed.py <sessionid>")
        sys.exit(1)
        
    fetch_all(sid)
