import requests
import json

SESSION_ID = "52495434061%3AOe3ESbi19PQvdp%3A27%3AAYgsZlaYJwpM9-_sLsmwrANo4biCcweQB_pqfKSXsg"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "x-ig-app-id": "936619743392459", # Standard web app id for Instagram
    "Sec-Fetch-Site": "same-origin",
    "Cookie": f"sessionid={SESSION_ID};"
}

url = "https://www.instagram.com/api/v1/users/web_profile_info/?username=artbybeckman"
r = requests.get(url, headers=headers)
print(f"Status Code: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    user = data.get("data", {}).get("user", {})
    edges = user.get("edge_owner_to_timeline_media", {}).get("edges", [])
    print(f"Found {len(edges)} posts!")
    for e in edges[:2]:
        node = e.get("node", {})
        print(node.get("shortcode"), "is_video:", node.get("is_video"), "URL:", node.get("video_url") or node.get("display_url"))
else:
    print(r.text[:500])
