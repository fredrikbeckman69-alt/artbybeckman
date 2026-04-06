import asyncio
import json
import os
import shutil
import requests
from playwright.async_api import async_playwright

SESSION_ID = "52495434061%3AOe3ESbi19PQvdp%3A27%3AAYgsZlaYJwpM9-_sLsmwrANo4biCcweQB_pqfKSXsg"
DEST_DIR = "assets/instagram"
USERNAME = "artbybeckman"
os.makedirs(DEST_DIR, exist_ok=True)

feed_data = []

async def run():
    print("Launching Chromium via Playwright...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        
        await context.add_cookies([
            {
                "name": "sessionid",
                "value": SESSION_ID,
                "domain": ".instagram.com",
                "path": "/",
                "secure": True,
                "httpOnly": True
            }
        ])
        
        page = await context.new_page()
        # Navigate to instagram homepage to set up tokens securely (csrf etc)
        await page.goto("https://www.instagram.com/")
        await page.wait_for_timeout(2000)
        
        print("Using Playwright internal fetch to call the web_profile_info api...")
        api_url = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
        response = await page.request.get(api_url, headers={"x-ig-app-id": "936619743392459"})
        
        if response.status != 200:
            print(f"Failed API. Status {response.status}")
            return
            
        data = await response.json()
        user = data.get("data", {}).get("user", {})
        edges = user.get("edge_owner_to_timeline_media", {}).get("edges", [])
        print(f"Successfully fetched {len(edges)} items!")
        
        count = 0
        for e in edges:
            if count >= 15:
                break
            
            node = e.get("node", {})
            shortcode = node.get("shortcode")
            is_video = node.get("is_video", False)
            caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
            caption = caption_edges[0].get("node", {}).get("text", "") if caption_edges else ""
            
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
                        i_req = requests.get(display_url, stream=True)
                        with open(img_path, 'wb') as f:
                            shutil.copyfileobj(i_req.raw, f)
                    post_data["url"] = f"assets/instagram/{img_filename}"
                    
                feed_data.append(post_data)
            except Exception as ex:
                print(f"  -> Error: {ex}")
            count += 1
            
        feed_file = os.path.join(DEST_DIR, "feed.json")
        with open(feed_file, "w", encoding="utf-8") as f:
            json.dump(feed_data, f, indent=4, ensure_ascii=False)
            
        await browser.close()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(run())
