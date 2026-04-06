import re

try:
    with open("Instagram2.html", "r", encoding="utf-8") as f:
        content = f.read()
except UnicodeDecodeError:
    with open("Instagram2.html", "r", encoding="utf-16") as f:
        content = f.read()

# Look for mp4 links
mp4s = set(re.findall(r'https?://[^"\'\s>]+\.mp4[^"\'\s>]*', content))
print(f"Found {len(mp4s)} direct mp4 links in HTML")

# Look for image links
jpgs = set(re.findall(r'https?://[^"\'\s>]+\.jpg[^"\'\s>]*', content))
print(f"Found {len(jpgs)} jpg links")

# Look for Instagram post links based on Instagram's typical format if mangled
post_urls = set(re.findall(r'href="([^"]*/p/[^"/]+/?)"', content))
print(f"Found {len(post_urls)} post urls")
if not post_urls:
    # Try finding shortcodes isolated
    shortcodes = set(re.findall(r'"code":"([^"]{11})"', content))
    print(f"Found {len(shortcodes)} 'code' shortcodes")

# Look inside Instagram2_files
import os
if os.path.exists("Instagram2_files"):
    files = os.listdir("Instagram2_files")
    print(f"Instagram2_files has {len(files)} files. Types:")
    exts = {}
    for f in files:
        ext = f.split(".")[-1]
        exts[ext] = exts.get(ext, 0) + 1
    print(exts)
