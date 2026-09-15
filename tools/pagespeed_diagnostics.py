import urllib.request
import urllib.parse
import json
import sys

BASE_PAGES = [
    "https://fredrikbeckman69-alt.github.io/artbybeckman/",
    "https://fredrikbeckman69-alt.github.io/artbybeckman/gallery.html",
    "https://fredrikbeckman69-alt.github.io/artbybeckman/walkaround.html",
    "https://fredrikbeckman69-alt.github.io/artbybeckman/videos.html",
    "https://fredrikbeckman69-alt.github.io/artbybeckman/instagram.html"
]

def run_pagespeed(url, strategy="mobile"):
    categories = ["performance", "accessibility", "best-practices", "seo"]
    params = [("url", url), ("strategy", strategy)]
    for cat in categories:
        params.append(("category", cat))
    
    query = urllib.parse.urlencode(params)
    api_url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?{query}"
    
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))

def analyze_result(data, url, strategy):
    lh = data.get("lighthouseResult", {})
    categories = lh.get("categories", {})
    audits = lh.get("audits", {})
    
    print(f"\n=======================================================")
    print(f"URL: {url} [{strategy.upper()}]")
    print(f"=======================================================")
    print("Scores:")
    for cat_id, cat_data in categories.items():
        score = cat_data.get("score")
        score_val = int(score * 100) if score is not None else "N/A"
        print(f"  - {cat_data.get('title')}: {score_val}/100")
        
    print("\nKey Metrics:")
    metrics = [
        "first-contentful-paint",
        "largest-contentful-paint",
        "total-blocking-time",
        "cumulative-layout-shift",
        "speed-index",
        "interactive"
    ]
    for m in metrics:
        if m in audits:
            print(f"  - {audits[m].get('title')}: {audits[m].get('displayValue', audits[m].get('score'))}")
            
    print("\nOpportunities & Diagnostics (score < 0.9):")
    for audit_id, audit in audits.items():
        score = audit.get("score")
        if score is not None and score < 0.9 and audit.get("details"):
            display_val = audit.get("displayValue", "")
            print(f"  * [{score}] {audit.get('title')}: {display_val}")
            items = audit.get("details", {}).get("items", [])
            if items and len(items) <= 5:
                for it in items:
                    if isinstance(it, dict):
                        node = it.get("node", {}).get("snippet", "")
                        url_item = it.get("url", "")
                        wasted = it.get("wastedBytes", "") or it.get("wastedMs", "")
                        msg = node or url_item
                        if wasted:
                            msg += f" (wasted: {wasted})"
                        if msg:
                            print(f"      - {msg[:100]}")
            elif items:
                print(f"      - {len(items)} items affected")

if __name__ == "__main__":
    target_url = sys.argv[1] if len(sys.argv) > 1 else BASE_PAGES[0]
    strategy = sys.argv[2] if len(sys.argv) > 2 else "mobile"
    print(f"Testing {target_url} ({strategy})...")
    res = run_pagespeed(target_url, strategy)
    analyze_result(res, target_url, strategy)
