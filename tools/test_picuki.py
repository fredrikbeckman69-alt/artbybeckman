import requests
import re

url = "https://www.picuki.com/profile/artbybeckman"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers)
print(r.status_code)
if r.status_code == 200:
    # Find post links
    links = re.findall(r'href="(https://www.picuki.com/media/\d+)"', r.text)
    print("Found links:", len(set(links)))
    
    # Check if we can get video URL from a post
    if links:
        post_url = links[0]
        r2 = requests.get(post_url, headers=headers)
        if '<video' in r2.text:
            print("Found a video post!")
            video_match = re.search(r'<video[^>]*src="([^"]+)"', r2.text)
            if video_match:
                print("Video URL:", video_match.group(1))
        else:
            print("Image post")
else:
    print(r.text[:500])
