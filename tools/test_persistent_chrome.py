import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def main():
    chrome_user_data = os.path.expanduser('~\\AppData\\Local\\Google\\Chrome\\User Data')
    temp_profile = os.path.expanduser('~\\AppData\\Local\\Temp\\pw_chrome_profile')
    
    print("Testing persistent context...")
    # Launch Chrome using installed Chrome channel
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch_persistent_context(
                user_data_dir=temp_profile,
                channel="chrome",
                headless=True,
                viewport={"width": 1280, "height": 900}
            )
            page = browser.pages[0] if browser.pages else await browser.new_page()
            print("Navigating to https://www.instagram.com/artbybeckman/...")
            await page.goto("https://www.instagram.com/artbybeckman/", timeout=25000)
            await page.wait_for_timeout(3000)
            
            # Check if logged in or cookie banner
            title = await page.title()
            print("Title:", title)
            
            # Check cookies
            cookies = await browser.cookies()
            ig_cookies = [c['name'] for c in cookies if 'instagram' in c.get('domain', '')]
            print("IG cookies in context:", ig_cookies)
            
            await browser.close()
        except Exception as e:
            print("Persistent context error:", e)

if __name__ == "__main__":
    asyncio.run(main())
