import asyncio
import os
import re
import json
import requests
from playwright.async_api import async_playwright

DEST_DIR = "assets/instagram"
DATA_JS = "js/instagram-data.js"
FEED_JSON = "assets/instagram/feed.json"
LINKS_JSON = "assets/instagram/discovered_links.json"
os.makedirs(DEST_DIR, exist_ok=True)

DL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.instagram.com/"
}

def download_file(url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return True
    try:
        r = requests.get(url, headers=DL_HEADERS, timeout=30)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        return False
    except Exception as e:
        print(f"  Download error for {url}: {e}")
        return False

async def process_all_links():
    if not os.path.exists(LINKS_JSON):
        print(f"Error: {LINKS_JSON} not found. Run login_and_scrape_all.py first.")
        return

    with open(LINKS_JSON, "r") as f:
        links = json.load(f)

    print(f"=== PROCESSING {len(links)} INSTAGRAM POSTS ===")
    
    # Load existing feed
    existing_feed = {}
    if os.path.exists(FEED_JSON):
        try:
            with open(FEED_JSON, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    existing_feed[item["shortcode"]] = item
        except:
            pass

    # Read session if available
    sessionid = None
    if os.path.exists("tools/ig_session.json"):
        try:
            with open("tools/ig_session.json", "r") as f:
                sessionid = json.load(f).get("sessionid")
        except:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        if sessionid:
            await context.add_cookies([{
                "name": "sessionid",
                "value": sessionid,
                "domain": ".instagram.com",
                "path": "/",
                "secure": True,
                "httpOnly": True
            }])

        updated_feed = list(existing_feed.values())
        processed_shortcodes = set(existing_feed.keys())

        for idx, link in enumerate(links, 1):
            m = re.search(r'/(?:p|reel)/([^/]+)/', link)
            if not m:
                continue
            shortcode = m.group(1)

            # Check if media already downloaded
            video_file = f"{DEST_DIR}/{shortcode}.mp4"
            thumb_file = f"{DEST_DIR}/{shortcode}_thumb.jpg"
            img_file = f"{DEST_DIR}/{shortcode}.jpg"

            if shortcode in existing_feed:
                curr = existing_feed[shortcode]
                if os.path.exists(curr.get("url", "")):
                    print(f"[{idx}/{len(links)}] Already downloaded: {shortcode}")
                    continue

            print(f"[{idx}/{len(links)}] Fetching post metadata: {shortcode}...")
            page = await context.new_page()
            try:
                await page.goto(link, timeout=25000)
                await page.wait_for_timeout(2000)

                og_data = await page.evaluate("""() => {
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
                caption = re.sub(r'^\d+\s+likes,\s+\d+\s+comments\s*-\s*artbybeckman\s*on\s*[^:]*:\s*', '', caption)
                caption = re.sub(r'^Fredrik Beckman on Instagram:\s*', '', caption, flags=re.IGNORECASE).strip(' "“')

                is_video = bool(video_url)

                if is_video:
                    dl_v = download_file(video_url, video_file)
                    if image_url:
                        download_file(image_url, thumb_file)
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
                        print(f"  Downloaded video: {shortcode}")
                elif image_url:
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
                        print(f"  Downloaded image: {shortcode}")

            except Exception as e:
                print(f"  Error on {shortcode}: {e}")
            finally:
                await page.close()

        await browser.close()

    # Filter only valid local paths
    final_feed = [item for item in updated_feed if os.path.exists(item.get("url", ""))]
    print(f"\nFinal total valid feed items: {len(final_feed)}")

    with open(FEED_JSON, "w", encoding="utf-8") as f:
        json.dump(final_feed, f, indent=4, ensure_ascii=False)
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write("// Instagram Feed Data — Art by Beckman\nconst INSTAGRAM_FEED = " + json.dumps(final_feed, indent=4, ensure_ascii=False) + ";\n")
    print(f"Saved {FEED_JSON} and {DATA_JS}")

if __name__ == "__main__":
    asyncio.run(process_all_links())
