import json
import sys

def parse_report(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print("=== LIGHTHOUSE CATEGORY SCORES ===")
    for cat_id, cat in data.get('categories', {}).items():
        score = cat.get('score')
        score_val = int(score * 100) if score is not None else "N/A"
        print(f"  {cat.get('title')}: {score_val}/100")

    print("\n=== KEY METRICS ===")
    audits = data.get('audits', {})
    metrics = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index',
        'interactive'
    ]
    for m in metrics:
        if m in audits:
            print(f"  {audits[m].get('title')}: {audits[m].get('displayValue')} (score: {audits[m].get('score')})")

    print("\n=== FAILING AUDITS (score < 0.9) ===")
    for aid, a in audits.items():
        score = a.get('score')
        if score is not None and score < 0.9:
            disp = a.get('displayValue', '')
            print(f"  * [{score}] {a.get('title')}: {disp} ({aid})")
            details = a.get('details', {})
            items = details.get('items', [])
            if items and len(items) <= 5:
                for it in items:
                    if isinstance(it, dict):
                        node = it.get('node', {}).get('snippet', '')
                        url_item = it.get('url', '')
                        wasted = it.get('wastedBytes') or it.get('wastedMs')
                        explanation = it.get('explanation', '') or it.get('subItems', {}).get('type', '')
                        line = node or url_item or explanation
                        if wasted:
                            line += f" (wasted: {wasted})"
                        if line:
                            print(f"      -> {line[:120]}")
            elif items:
                print(f"      -> {len(items)} items affected")

if __name__ == '__main__':
    report_file = sys.argv[1] if len(sys.argv) > 1 else 'tools/report_mobile_initial.json'
    parse_report(report_file)
