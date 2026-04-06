import os
import struct

def find_moov(filename):
    try:
        with open(filename, 'rb') as f:
            f.seek(0, os.SEEK_END)
            filesize = f.tell()
            f.seek(0)
            
            while f.tell() < filesize:
                size_bytes = f.read(4)
                if len(size_bytes) < 4: break
                size = struct.unpack(">I", size_bytes)[0]
                
                type_bytes = f.read(4)
                if len(type_bytes) < 4: break
                box_type = type_bytes.decode('ascii', errors='ignore')
                
                print(f"[{filename}] Found box: {box_type} (size: {size})")
                
                if box_type == 'moov':
                    return True
                
                if size == 1: # 64-bit size
                    size = struct.unpack(">Q", f.read(8))[0]
                    f.seek(size - 16, os.SEEK_CUR)
                elif size == 0:
                    break
                else:
                    f.seek(size - 8, os.SEEK_CUR)
        return False
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        return False


files = [
    "assets/Movies/VERTIGO.mp4",
    "assets/Movies/ORIGAMI.mp4",
    "assets/Movies/GOLDEN TICKET.mp4",
    "assets/Movies/gemini_generated_video_F4A39533.mp4"
]

for f in files:
    print(f"--- {f} ---")
    has_moov = find_moov(f)
    print(f"{f}: has_moov={has_moov}\n")
