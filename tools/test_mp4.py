import os

files = [
    "assets/Movies/VERTIGO.mp4",
    "assets/Movies/ORIGAMI.mp4",
    "assets/Movies/GOLDEN TICKET.mp4",
    "assets/Movies/gemini_generated_video_F4A39533.mp4"
]

for f in files:
    if os.path.exists(f):
        size = os.path.getsize(f)
        try:
            with open(f, 'rb') as file:
                header = file.read(16)
                print(f"{f}: {size} bytes | Header: {header}")
                
        except Exception as e:
            print(f"{f}: Error {e}")
    else:
        print(f"{f}: MISSING")
