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

SESSION_ID = "52495434061%3AgTESyu249rFfke%3A2%3AAYhpbE1F1O-wMzXFoZ1WK-plKe42EY2BDsoKojFGHA"

DL_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Referer": "https://www.instagram.com/"
}

def download_file(url, dest_path):
    if not url:
        return False
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 500:
        return True
    try:
        r = requests.get(url, headers=DL_HEADERS, timeout=25)
        if r.status_code == 200 and len(r.content) > 500:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        return False
    except Exception as e:
        return False

async def process_batch(links_batch, worker_id, context, feed_dict, lock):
    page = await context.new_page()
    for idx, link in enumerate(links_batch):
        m = re.search(r'/(?:p|reel)/([^/]+)/', link)
        if not m:
            continue
        shortcode = m.group(1)

        video_file = f"{DEST_DIR}/{shortcode}.mp4"
        thumb_file = f"{DEST_DIR}/{shortcode}_thumb.jpg"
        img_file = f"{DEST_DIR}/{shortcode}.jpg"

        # If already downloaded and in feed
        if shortcode in feed_dict:
            curr = feed_dict[shortcode]
            if os.path.exists(curr.get("url", "")):
                continue

        # If files exist on disk already
        if os.path.exists(video_file):
            async with lock:
                feed_dict[shortcode] = {
                    "shortcode": shortcode,
                    "is_video": True,
                    "caption": "Fredrik Beckman Artwork",
                    "url": video_file,
                    "thumbnail": thumb_file if os.path.exists(thumb_file) else video_file
                }
            continue
        elif os.path.exists(img_file):
            async with lock:
                feed_dict[shortcode] = {
                    "shortcode": shortcode,
                    "is_video": False,
                    "caption": "Fredrik Beckman Artwork",
                    "url": img_file,
                    "thumbnail": img_file
                }
            continue

        print(f"[Worker {worker_id}] Fetching {shortcode}...")
        try:
            await page.goto(link, timeout=20000)
            await page.wait_for_timeout(1500)

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
                    async with lock:
                        feed_dict[shortcode] = {
                            "shortcode": shortcode,
                            "is_video": True,
                            "caption": caption,
                            "url": video_file,
                            "thumbnail": thumb_file if os.path.exists(thumb_file) else video_file
                        }
                    print(f"  [Worker {worker_id}] Saved video: {shortcode}")
            elif image_url:
                dl_i = download_file(image_url, img_file)
                if dl_i:
                    async with lock:
                        feed_dict[shortcode] = {
                            "shortcode": shortcode,
                            "is_video": False,
                            "caption": caption,
                            "url": img_file,
                            "thumbnail": img_file
                        }
                    print(f"  [Worker {worker_id}] Saved image: {shortcode}")

        except Exception as e:
            print(f"  [Worker {worker_id}] Error {shortcode}: {e}")

    await page.close()

async def main():
    if not os.path.exists(LINKS_JSON):
        print(f"Error: {LINKS_JSON} not found.")
        return

    with open(LINKS_JSON, "r") as f:
        links = json.load(f)

    print(f"=== PARALLEL DOWNLOADING FOR {len(links)} POSTS ===")

    feed_dict = {}
    if os.path.exists(FEED_JSON):
        try:
            with open(FEED_JSON, "r", encoding="utf-8") as f:
                for item in json.load(f):
                    feed_dict[item["shortcode"]] = item
        except:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        await context.add_cookies([{
            "name": "sessionid",
            "value": SESSION_ID,
            "domain": ".instagram.com",
            "path": "/",
            "secure": True,
            "httpOnly": True
        }])

        lock = asyncio.Lock()
        
        # Split links into 4 worker batches
        NUM_WORKERS = 4
        batches = [[] for _ in range(NUM_WORKERS)]
        for i, link in enumerate(links):
            batches[i % NUM_WORKERS].append(link)

        tasks = [
            process_batch(batches[w_idx], w_idx + 1, context, feed_dict, lock)
            for w_idx in range(NUM_WORKERS)
        ]
        
        await asyncio.gather(*tasks)
        await browser.close()

    # Sort items matching the original discovered order
    final_feed = []
    for link in links:
        m = re.search(r'/(?:p|reel)/([^/]+)/', link)
        if m and m.group(1) in feed_dict:
            item = feed_dict[m.group(1)]
            if os.path.exists(item.get("url", "")):
                final_feed.append(item)

    # Append any remaining items not in discovered_links
    for sc, item in feed_dict.items():
        if item not in final_feed and os.path.exists(item.get("url", "")):
            final_feed.append(item)

    print(f"\n=== COMPLETE: {len(final_feed)} VALID LOCAL POSTS IN FEED ===")

    with open(FEED_JSON, "w", encoding="utf-8") as f:
        json.dump(final_feed, f, indent=4, ensure_ascii=False)
        
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write("// Instagram Feed Data — Art by Beckman\nconst INSTAGRAM_FEED = " + json.dumps(final_feed, indent=4, ensure_ascii=False) + ";\n")
        
    print(f"Saved {FEED_JSON} and {DATA_JS}!")

if __name__ == "__main__":
    asyncio.run(main())
