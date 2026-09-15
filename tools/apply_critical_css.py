with open('css/style-v3.min.css', 'r', encoding='utf-8') as f:
    full_css = f.read()

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_link = '<link rel="stylesheet" href="css/style-v3.min.css">'
new_block = f"""    <style>{full_css}</style>
    <link rel="preload" as="style" href="css/style-v3.min.css" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="css/style-v3.min.css"></noscript>"""

if old_link in html:
    html = html.replace(old_link, new_block)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    with open('dist/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Successfully inlined CSS and set preload for secondary stylesheet.")
else:
    print("old_link not found!")
