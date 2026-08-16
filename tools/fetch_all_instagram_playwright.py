import asyncio
import os
import re
import json
import requests
from playwright.async_api import async_playwright

DEST_DIR = "assets/instagram"
DATA_JS = "js/instagram-data.js"
FEED_JSON = "assets/instagram/feed.json"
os.makedirs(DEST_DIR, exist_ok=True)

# Headers for downloading media
DL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.instagram.com/"
}

def download_file(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return True
    try:
        r = requests.get(url, headers=DL_HEADERS, timeout=25)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        else:
            print(f"  Download failed for {url} with status {r.status_code}")
            return False
    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        return False

async def fetch_all_instagram():
    print("=== STARTING FULL INSTAGRAM SCRAPER VIA PLAYWRIGHT ===")
    
    # Load existing feed if available
    existing_feed = {}
    if os.path.exists(FEED_JSON):
        try:
            with open(FEED_JSON, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    existing_feed[item["shortcode"]] = item
        except:
            pass
    if os.path.exists("assets/instagram/feed-utf8.json"):
        try:
            with open("assets/instagram/feed-utf8.json", "r", encoding="utf-8-sig") as f:
                for item in json.load(f):
                    if item["shortcode"] not in existing_feed:
                        existing_feed[item["shortcode"]] = item
        except:
            pass
            
    print(f"Loaded {len(existing_feed)} existing feed items from local cache.")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        page = await context.new_page()
        print("Navigating to https://www.instagram.com/artbybeckman/...")
        
        try:
            await page.goto("https://www.instagram.com/artbybeckman/", timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Dismiss any cookie / login banners if present
            try:
                dismiss_btn = await page.query_selector('button:has-text("Decline"), button:has-text("Not now"), button:has-text("Avvisa"), button:has-text("Endast nödvändiga")')
                if dismiss_btn:
                    await dismiss_btn.click()
                    await page.wait_for_timeout(1000)
            except:
                pass
                
            # Scroll down multiple times to collect all post links
            post_links = set()
            for scroll_idx in range(12):
                links = await page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")
                new_links = [l for l in links if '/p/' in l or '/reel/' in l]
                post_links.update(new_links)
                print(f"Scroll {scroll_idx + 1}/12: found {len(post_links)} unique posts so far...")
                
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1500)
                
            print(f"\nTotal unique post URLs discovered: {len(post_links)}")
            
        except Exception as e:
            print("Error scrolling profile:", e)

        # Now process each post link
        updated_feed = list(existing_feed.values())
        processed_shortcodes = set(existing_feed.keys())
        
        for idx, link in enumerate(list(post_links), 1):
            m = re.search(r'/(?:p|reel)/([^/]+)/', link)
            if not m:
                continue
            shortcode = m.group(1)
            
            print(f"\n[{idx}/{len(post_links)}] Checking post {shortcode} ({link})...")
            
            # If already downloaded with both video/thumb or image on disk, skip network navigation
            if shortcode in existing_feed:
                curr = existing_feed[shortcode]
                url_exists = os.path.exists(curr.get("url", ""))
                thumb_exists = os.path.exists(curr.get("thumbnail", "")) if curr.get("is_video") else True
                if url_exists and thumb_exists:
                    print(f"  Already cached and present locally: {curr.get('url')}")
                    continue

            post_page = await context.new_page()
            try:
                await post_page.goto(link, timeout=20000)
                await post_page.wait_for_timeout(2500)
                
                # Extract og metadata
                og_data = await post_page.evaluate("""() => {
                    const video = document.querySelector('meta[property="og:video"]');
                    const image = document.querySelector('meta[property="og:image"]');
                    const desc = document.querySelector('meta[property="og:description"]');
                    const title = document.querySelector('meta[property="og:title"]');
                    
                    const videoEl = document.querySelector('video');
                    const imgEl = document.querySelector('article img');
                    
                    return {
                        videoUrl: video ? video.content : (videoEl ? videoEl.src : null),
                        imageUrl: image ? image.content : (imgEl ? imgEl.src : null),
                        caption: desc ? desc.content : (title ? title.content : "")
                    };
                }""")
                
                video_url = og_data.get("videoUrl")
                image_url = og_data.get("imageUrl")
                caption = og_data.get("caption") or "Fredrik Beckman Artwork"
                # Clean up generic Instagram title from caption
                caption = re.sub(r'^\d+\s+likes,\s+\d+\s+comments\s*-\s*artbybeckman\s*on\s*[^:]*:\s*', '', caption)
                caption = re.sub(r'^Fredrik Beckman on Instagram:\s*', '', caption, flags=re.IGNORECASE)
                caption = caption.strip(' "“')
                
                is_video = bool(video_url)
                
                if is_video:
                    video_file = f"{DEST_DIR}/{shortcode}.mp4"
                    thumb_file = f"{DEST_DIR}/{shortcode}_thumb.jpg"
                    
                    print(f"  Downloading video: {video_url[:60]}...")
                    dl_v = download_file(video_url, video_file)
                    
                    if image_url:
                        print(f"  Downloading video thumbnail: {image_url[:60]}...")
                        download_file(image_url, thumb_file)
                    else:
                        thumb_file = ""
                        
                    if dl_v:
                        entry = {
                            "shortcode": shortcode,
                            "is_video": True,
                            "caption": caption,
                            "url": video_file,
                            "thumbnail": thumb_file if os.path.exists(thumb_file) else video_file
                        }
                        if shortcode not in processed_shortcodes:
                            updated_feed.insert(0, entry)
                            processed_shortcodes.add(shortcode)
                        else:
                            for i, it in enumerate(updated_feed):
                                if it["shortcode"] == shortcode:
                                    updated_feed[i] = entry
                        print(f"  Successfully added video post: {shortcode}")
                elif image_url:
                    img_file = f"{DEST_DIR}/{shortcode}.jpg"
                    print(f"  Downloading image: {image_url[:60]}...")
                    dl_i = download_file(image_url, img_file)
                    if dl_i:
                        entry = {
                            "shortcode": shortcode,
                            "is_video": False,
                            "caption": caption,
                            "url": img_file,
                            "thumbnail": img_file
                        }
                        if shortcode not in processed_shortcodes:
                            updated_feed.insert(0, entry)
                            processed_shortcodes.add(shortcode)
                        else:
                            for i, it in enumerate(updated_feed):
                                if it["shortcode"] == shortcode:
                                    updated_feed[i] = entry
                        print(f"  Successfully added image post: {shortcode}")
            except Exception as e:
                print(f"  Error processing post {shortcode}: {e}")
            finally:
                await post_page.close()

        await browser.close()

    # Normalize existing feed entries to ensure valid local file paths
    final_feed = []
    for item in updated_feed:
        url = item.get("url", "")
        thumb = item.get("thumbnail", "")
        
        # Check .webp fallback
        if not os.path.exists(url) and url.endswith(".jpg"):
            webp_candidate = url[:-4] + ".webp"
            if os.path.exists(webp_candidate):
                url = webp_candidate
                item["url"] = url
                
        if not os.path.exists(thumb) and thumb.endswith(".jpg"):
            webp_candidate = thumb[:-4] + ".webp"
            if os.path.exists(webp_candidate):
                thumb = webp_candidate
                item["thumbnail"] = thumb
                
        if os.path.exists(url):
            final_feed.append(item)

    print(f"\n=== SCRAPING COMPLETE: {len(final_feed)} VALID POSTS IN FEED ===")
    
    # Save feed.json
    with open(FEED_JSON, "w", encoding="utf-8") as f:
        json.dump(final_feed, f, indent=4, ensure_ascii=False)
    print(f"Saved {FEED_JSON}")
    
    # Save js/instagram-data.js
    js_content = "// Instagram Feed Data — Art by Beckman\nconst INSTAGRAM_FEED = " + json.dumps(final_feed, indent=4, ensure_ascii=False) + ";\n"
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Saved {DATA_JS}")
    
    return final_feed

if __name__ == "__main__":
    asyncio.run(fetch_all_instagram())
