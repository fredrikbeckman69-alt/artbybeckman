import requests
import re

url = "https://imginn.org/artbybeckman/"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}

r = requests.get(url, headers=headers)
print("status", r.status_code)
if r.status_code == 200:
    print("Success! Response size:", len(r.text))
    # Look for links
    items = re.findall(r'<div class="item">.*?</div>', r.text, re.DOTALL)
    print("Found items:", len(items))
else:
    print(r.text[:500])
