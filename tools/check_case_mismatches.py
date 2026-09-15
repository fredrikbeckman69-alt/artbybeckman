import json
import re
import subprocess

with open('js/data.js', 'r', encoding='utf-8') as f:
    text = f.read()

git_files = set(subprocess.check_output(['git', 'ls-files'], text=True).splitlines())

filenames = re.findall(r'"filename":\s*"([^"]+)"', text)
print(f"Total filenames in data.js: {len(filenames)}")

for fn in filenames:
    path = f"assets/images/{fn}"
    if path not in git_files:
        matches = [gf for gf in git_files if gf.lower() == path.lower()]
        if matches:
            print(f"Case mismatch: '{path}' vs git: '{matches[0]}'")
        else:
            print(f"MISSING in git: '{path}'")
