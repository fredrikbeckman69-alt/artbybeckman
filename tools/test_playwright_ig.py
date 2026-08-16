import asyncio
import re
import json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        print("Navigating to Instagram profile...")
        try:
            res = await page.goto("https://www.instagram.com/artbybeckman/", timeout=20000)
            print("Response status:", res.status if res else "None")
            await page.wait_for_timeout(4000)
            title = await page.title()
            print("Page Title:", title)
            
            # Check content
            content = await page.content()
            print("Page content length:", len(content))
            
            links = await page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")
            post_links = list(set([l for l in links if '/p/' in l or '/reel/' in l]))
            print(f"Found {len(post_links)} post/reel links:")
            for l in post_links:
                print(" ", l)
                
            imgs = await page.evaluate("() => Array.from(document.querySelectorAll('img')).map(img => ({src: img.src, alt: img.alt}))")
            print(f"Found {len(imgs)} images on page:")
            for img in imgs[:10]:
                print(" ", img['alt'][:40] if img['alt'] else 'No alt', "->", img['src'][:60])
                
        except Exception as e:
            print("Error during fetch:", e)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
