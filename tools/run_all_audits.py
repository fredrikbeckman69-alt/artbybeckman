import subprocess
import os
import json
import time

PAGES = [
    ("Home", "https://fredrikbeckman69-alt.github.io/artbybeckman/"),
    ("Gallery", "https://fredrikbeckman69-alt.github.io/artbybeckman/gallery.html"),
    ("Walkaround", "https://fredrikbeckman69-alt.github.io/artbybeckman/walkaround.html"),
    ("Videos", "https://fredrikbeckman69-alt.github.io/artbybeckman/videos.html"),
    ("Instagram", "https://fredrikbeckman69-alt.github.io/artbybeckman/instagram.html")
]

os.makedirs("tools/reports", exist_ok=True)

def audit_url(name, url, preset="mobile"):
    slug = name.lower()
    report_file = f"tools/reports/{slug}_{preset}.json"
    print(f"\n--- Auditing {name} ({preset.upper()}) ---")
    print(f"URL: {url}")
    
    cmd = [
        "npx", "lighthouse", url,
        f"--output-path={report_file}",
        "--output=json",
        '--chrome-flags="--headless=new"',
        "--only-categories=performance,accessibility,best-practices,seo",
        "--quiet"
    ]
    if preset == "desktop":
        cmd.append("--preset=desktop")
        
    subprocess.run(" ".join(cmd), shell=True, capture_output=True, text=True)
    
    if os.path.exists(report_file):
        try:
            with open(report_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            cats = data.get('categories', {})
            audits = data.get('audits', {})
            perf = int((cats.get('performance', {}).get('score') or 0) * 100)
            a11y = int((cats.get('accessibility', {}).get('score') or 0) * 100)
            bp = int((cats.get('best-practices', {}).get('score') or 0) * 100)
            seo = int((cats.get('seo', {}).get('score') or 0) * 100)
            
            lcp = audits.get('largest-contentful-paint', {}).get('displayValue', 'N/A')
            fcp = audits.get('first-contentful-paint', {}).get('displayValue', 'N/A')
            tbt = audits.get('total-blocking-time', {}).get('displayValue', 'N/A')
            cls = audits.get('cumulative-layout-shift', {}).get('displayValue', 'N/A')
            
            print(f"Result for {name} ({preset}):")
            print(f"  Perf: {perf} | A11y: {a11y} | Best Practices: {bp} | SEO: {seo}")
            print(f"  LCP: {lcp} | FCP: {fcp} | TBT: {tbt} | CLS: {cls}")
            return {
                "name": name, "preset": preset, "url": url,
                "perf": perf, "a11y": a11y, "bp": bp, "seo": seo,
                "lcp": lcp, "fcp": fcp, "tbt": tbt, "cls": cls
            }
        except Exception as e:
            print(f"Error parsing report for {name}: {e}")
    else:
        print(f"Failed to produce report for {name}")
    return None

if __name__ == "__main__":
    results = []
    for name, url in PAGES:
        for preset in ["mobile", "desktop"]:
            res = audit_url(name, url, preset)
            if res:
                results.append(res)
    
    print("\n\n=================== ALL PAGES SUMMARY ===================")
    print(f"{'Page':<12} | {'Preset':<7} | {'Perf':<4} | {'A11y':<4} | {'BP':<4} | {'SEO':<4} | {'LCP':<8} | {'TBT':<8}")
    print("-" * 65)
    for r in results:
        print(f"{r['name']:<12} | {r['preset']:<7} | {r['perf']:<4} | {r['a11y']:<4} | {r['bp']:<4} | {r['seo']:<4} | {r['lcp']:<8} | {r['tbt']:<8}")
