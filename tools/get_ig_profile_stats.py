import asyncio
import re
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

async def get_profile_info():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        )
        await page.goto('https://www.instagram.com/artbybeckman/', timeout=30000)
        await page.wait_for_timeout(3000)
        
        meta_desc = await page.evaluate("() => { const m = document.querySelector('meta[name=\"description\"]') || document.querySelector('meta[property=\"og:description\"]'); return m ? m.content : ''; }")
        print("Meta description:", meta_desc)
        
        header_text = await page.evaluate("() => document.querySelector('header') ? document.querySelector('header').innerText : ''")
        print("Header text:\n", header_text)
        
        # Look for post count number
        # e.g. "123 posts"
        m = re.search(r'(\d+[\d,.]*)\s*(?:inlägg|posts|post)', meta_desc + "\n" + header_text, re.IGNORECASE)
        if m:
            print("Detected total posts:", m.group(1))
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(get_profile_info())
