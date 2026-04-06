import requests
print(requests.get("https://dumpoir.com/v/artbybeckman", headers={"User-Agent": "Mozilla/5.0"}).status_code)
