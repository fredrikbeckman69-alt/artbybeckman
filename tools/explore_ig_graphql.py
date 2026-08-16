import asyncio
import json
import re
from playwright.async_api import async_playwright

async def main():
    print("Launching Playwright to inspect Instagram API/GraphQL...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900}
        )
        
        page = await context.new_page()
        
        captured_json = []
        
        async def handle_response(response):
            url = response.url
            if any(k in url for k in ['graphql', 'web_profile_info', 'feed/user']):
                print("Captured API URL:", url[:100])
                try:
                    data = await response.json()
                    captured_json.append((url, data))
                    print("  JSON keys:", list(data.keys()) if isinstance(data, dict) else type(data))
                except Exception as e:
                    pass
                    
        page.on("response", handle_response)
        
        print("Navigating to https://www.instagram.com/artbybeckman/...")
        await page.goto("https://www.instagram.com/artbybeckman/", timeout=30000)
        await page.wait_for_timeout(4000)
        
        # Check script tags on the page for inline JSON data
        scripts = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script')).map(s => s.innerText);
        }""")
        print(f"Found {len(scripts)} script tags on page.")
        
        all_shortcodes = set()
        for idx, s in enumerate(scripts):
            matches = re.findall(r'"shortcode":\s*"([^"]+)"', s)
            if matches:
                print(f"  Script {idx} has {len(matches)} shortcodes: {matches[:5]}")
                all_shortcodes.update(matches)
                
        # Also check page HTML
        content = await page.content()
        html_shortcodes = set(re.findall(r'/(?:p|reel)/([^/"]+)/', content))
        all_shortcodes.update(html_shortcodes)
        print(f"Total shortcodes found on initial load: {len(all_shortcodes)}")
        
        # Try scrolling and clicking 'Show more' or login dismissal
        try:
            for s_idx in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(2000)
        except:
            pass
            
        await browser.close()
        
        print("\nCaptured API calls count:", len(captured_json))
        for url, d in captured_json:
            print("API:", url)
            if isinstance(d, dict) and 'data' in d:
                print("Data keys:", list(d['data'].keys()))

if __name__ == "__main__":
    asyncio.run(main())
