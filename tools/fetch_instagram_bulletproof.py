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
    print("Launching Chromium via Playwright (Bulletproof Method)...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        
        # Inject cookie
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
        
        print(f"Navigating to https://www.instagram.com/{USERNAME}/")
        response = await page.goto(f"https://www.instagram.com/{USERNAME}/")
        
        # Wait for timeline to render
        await page.wait_for_selector('a[href^="/p/"]', timeout=15000)
        
        # Extract post links
        links = await page.evaluate("() => Array.from(document.querySelectorAll('a[href^=\"/p/\"]')).map(a => a.href)")
        
        # Distinct links, keeping order
        unique_links = []
        for l in links:
            if l not in unique_links:
                unique_links.append(l)
                
        # Limit to 12 recent
        unique_links = unique_links[:12]
        print(f"Found {len(unique_links)} post links on profile. Navigating to them to extract metadata...")
        
        for link in unique_links:
            shortcode = link.split("/p/")[1].replace("/", "")
            print(f"\nProcessing {shortcode}...")
            
            post_page = await context.new_page()
            try:
                await post_page.goto(link)
                # Wait for meta tags to be populated
                await post_page.wait_for_load_state("domcontentloaded")
                await post_page.wait_for_timeout(1500)
                
                # Extract og:video
                video_url = await post_page.evaluate("() => { const v = document.querySelector('meta[property=\"og:video\"]'); return v ? v.content : null; }")
                
                # Extract og:image
                image_url = await post_page.evaluate("() => { const i = document.querySelector('meta[property=\"og:image\"]'); return i ? i.content : null; }")
                
                # Extract caption
                caption = await post_page.evaluate("() => { const title = document.querySelector('meta[property=\"og:title\"]'); return title ? title.content : ''; }")
                
                is_video = bool(video_url)
                print(f"  Is Video: {is_video}")
                
                post_data = {
                    "shortcode": shortcode,
                    "is_video": is_video,
                    "caption": caption.split(" -")[0], # clean up title
                    "url": "",
                    "thumbnail": ""
                }
                
                # We can download from these URLs freely as they are CDN links without strict auth
                if is_video and video_url:
                    video_filename = f"{shortcode}.mp4"
                    video_path = os.path.join(DEST_DIR, video_filename)
                    if not os.path.exists(video_path):
                        print("  -> Downloading video from CDN...")
                        r = requests.get(video_url, stream=True)
                        with open(video_path, 'wb') as f:
                            shutil.copyfileobj(r.raw, f)
                    post_data["url"] = f"assets/instagram/{video_filename}"
                    
                    if image_url:
                        thumb_filename = f"{shortcode}_thumb.jpg"
                        thumb_path = os.path.join(DEST_DIR, thumb_filename)
                        if not os.path.exists(thumb_path):
                            print("  -> Downloading thumbnail from CDN...")
                            r = requests.get(image_url, stream=True)
                            with open(thumb_path, 'wb') as f:
                                shutil.copyfileobj(r.raw, f)
                        post_data["thumbnail"] = f"assets/instagram/{thumb_filename}"
                elif image_url:
                    img_filename = f"{shortcode}.jpg"
                    img_path = os.path.join(DEST_DIR, img_filename)
                    if not os.path.exists(img_path):
                        print("  -> Downloading image from CDN...")
                        r = requests.get(image_url, stream=True)
                        with open(img_path, 'wb') as f:
                            shutil.copyfileobj(r.raw, f)
                    post_data["url"] = f"assets/instagram/{img_filename}"
                else:
                    print("  -> ERROR: No video or image found in meta tags.")
                    await post_page.close()
                    continue
                    
                feed_data.append(post_data)
                
            except Exception as e:
                print(f"  -> Error navigating: {e}")
            finally:
                await post_page.close()
                
        feed_file = os.path.join(DEST_DIR, "feed.json")
        with open(feed_file, "w", encoding="utf-8") as f:
            json.dump(feed_data, f, indent=4, ensure_ascii=False)
            
        await browser.close()
        print(f"\nSuccessfully saved {len(feed_data)} posts to feed.json!")

if __name__ == "__main__":
    asyncio.run(run())
