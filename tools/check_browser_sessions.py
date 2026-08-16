import os
import glob
import sqlite3
import shutil
import json

print("=== CHECKING BROWSER SESSIONS FOR INSTAGRAM ===")

# 1. Firefox
ff_path = os.path.expanduser('~\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles')
if os.path.exists(ff_path):
    profiles = glob.glob(os.path.join(ff_path, '*'))
    for prof in profiles:
        cookie_db = os.path.join(prof, 'cookies.sqlite')
        if os.path.exists(cookie_db):
            temp_db = 'temp_cookies.sqlite'
            try:
                shutil.copy2(cookie_db, temp_db)
                conn = sqlite3.connect(temp_db)
                cur = conn.cursor()
                cur.execute("SELECT name, value, host FROM moz_cookies WHERE host LIKE '%instagram%'")
                rows = cur.fetchall()
                print(f"Firefox profile {os.path.basename(prof)}: {len(rows)} IG cookies")
                for name, val, host in rows:
                    if name in ['sessionid', 'ds_user_id', 'csrftoken']:
                        print(f"  Firefox: {name} = {val[:15]}... ({host})")
                conn.close()
                if os.path.exists(temp_db):
                    os.remove(temp_db)
            except Exception as e:
                print("Firefox error:", e)

# 2. Check if we can launch Playwright with default Chrome or Edge user data directory
print("\nPlaywright browser options available:")
from playwright.sync_api import sync_playwright
try:
    with sync_playwright() as p:
        print("Playwright chromium is ready.")
except Exception as e:
    print("Playwright check:", e)
