import asyncio
import os
import re
import json
import requests
from playwright.async_api import async_playwright

USER_DATA_DIR = os.path.expanduser('~\\AppData\\Local\\Temp\\artbybeckman_ig_browser')

async def main():
    print("Launching visible browser for Instagram login and full scrape...")
    async with async_playwright() as p:
        # Launch visible browser
        browser = await p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False,
            channel="chrome", # Use installed Google Chrome
            viewport={"width": 1280, "height": 900}
        )
        
        page = browser.pages[0] if browser.pages else await browser.new_page()
        
        print("Opening https://www.instagram.com/artbybeckman/...")
        await page.goto("https://www.instagram.com/artbybeckman/")
        
        # Check if sessionid cookie exists in context
        cookies = await browser.cookies()
        sessionid = next((c['value'] for c in cookies if c['name'] == 'sessionid'), None)
        
        if not sessionid:
            print("\n" + "="*60)
            print("PLEASE LOG IN TO INSTAGRAM IN THE OPEN BROWSER WINDOW.")
            print("Waiting for login...")
            print("="*60)
            
            # Wait up to 120 seconds for user to log in
            for _ in range(60):
                await page.wait_for_timeout(2000)
                cookies = await browser.cookies()
                sessionid = next((c['value'] for c in cookies if c['name'] == 'sessionid'), None)
                if sessionid:
                    print("SUCCESS! Detected active Instagram login!")
                    break
        else:
            print("Active Instagram login detected immediately!")

        if sessionid:
            print(f"Session ID acquired: {sessionid[:15]}...")
            
            # Save session for future automatic runs
            with open("tools/ig_session.json", "w") as f:
                json.dump({"sessionid": sessionid}, f)
                
            # Now navigate back to profile and scroll through all 196 posts!
            await page.goto("https://www.instagram.com/artbybeckman/")
            await page.wait_for_timeout(3000)
            
            all_links = set()
            print("Beginning full infinite scroll to load all 196 posts...")
            
            no_new_count = 0
            for scroll in range(60):
                links = await page.evaluate("() => Array.from(document.querySelectorAll('a')).map(a => a.href)")
                post_links = [l for l in links if '/p/' in l or '/reel/' in l]
                prev = len(all_links)
                all_links.update(post_links)
                print(f"Scroll {scroll+1}: Total {len(all_links)} posts collected (+{len(all_links)-prev})")
                
                if len(all_links) - prev == 0:
                    no_new_count += 1
                    if no_new_count >= 5:
                        print("No new posts loaded after 5 consecutive scrolls. Finished profile scan.")
                        break
                else:
                    no_new_count = 0
                    
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(1500)
                
            print(f"\nDiscovered {len(all_links)} total post links from profile!")
            with open("assets/instagram/discovered_links.json", "w") as f:
                json.dump(list(all_links), f, indent=2)
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
