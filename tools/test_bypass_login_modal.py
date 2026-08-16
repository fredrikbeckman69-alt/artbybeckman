import asyncio
import re
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 1000}
        )
        page = await context.new_page()
        print("Navigating to https://www.instagram.com/artbybeckman/...")
        await page.goto("https://www.instagram.com/artbybeckman/", timeout=30000)
        await page.wait_for_timeout(3000)
        
        post_links = set()
        
        for i in range(25):
            # 1. Remove any login dialogs / backdrop
            await page.evaluate("""() => {
                document.querySelectorAll('div[role="dialog"]').forEach(d => d.remove());
                document.querySelectorAll('div[class*="backdrop"]').forEach(b => b.remove());
                document.body.style.overflow = 'auto';
                document.body.style.position = 'static';
                document.documentElement.style.overflow = 'auto';
            }""")
            
            # 2. Extract links
            links = await page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")
            new_links = [l for l in links if '/p/' in l or '/reel/' in l]
            prev_count = len(post_links)
            post_links.update(new_links)
            
            print(f"Step {i+1}: total posts found = {len(post_links)} (+{len(post_links) - prev_count})")
            
            # 3. Scroll down
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(2000)
            
        await browser.close()
        print(f"\nFinal total post links found: {len(post_links)}")

if __name__ == "__main__":
    asyncio.run(main())
