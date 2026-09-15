import re
import os

with open("css/style-v3.css", "r", encoding="utf-8") as f:
    css = f.read()

# Remove comments
css = re.sub(r'/\*[\s\S]*?\*/', '', css)
# Normalize whitespace
css = re.sub(r'\s+', ' ', css)
# Remove space around punctuation
css = re.sub(r'\s*([\{\}:;,>~+])\s*', r'\1', css)
css = re.sub(r';\}', '}', css)
css = css.strip()

with open("css/style-v3.min.css", "w", encoding="utf-8") as f:
    f.write(css)

os.makedirs("dist/css", exist_ok=True)
with open("dist/css/style-v3.min.css", "w", encoding="utf-8") as f:
    f.write(css)

orig_size = os.path.getsize("css/style-v3.css")
min_size = os.path.getsize("css/style-v3.min.css")
print(f"Minified CSS: {orig_size} bytes -> {min_size} bytes (saved {orig_size - min_size} bytes)")
