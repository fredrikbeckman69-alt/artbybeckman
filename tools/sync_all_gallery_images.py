import os
import ftplib
import urllib.request
import urllib.parse
import time

FTP_HOST = "ftpcluster.loopia.se"
FTP_USER = "natriumftp"
FTP_PASS = "6fQ3tjTrJguf"
REMOTE_DIR = "/svavel.se/public_html/assets/images"
LOCAL_DIR = "assets/images"

def main():
    local_files = sorted(os.listdir(LOCAL_DIR))
    print(f"Total local paintings to sync: {len(local_files)}")

    ftp = ftplib.FTP(FTP_HOST, timeout=30)
    ftp.encoding = "latin-1"
    ftp.login(FTP_USER, FTP_PASS)
    ftp.cwd(REMOTE_DIR)

    # 1. Clean up known corrupted remote names if they exist
    corrupted_names = [
        "242 ATOMIC_",
        "243 FROZEN 1.0.jpg",
        "134 ENDLESS BOTTLES 2.8 _CAF\xc9 CREME).jpg",
        "246 GRAINES D\xc9TOILES.jpg",
        "248 LINN\xc9AS TRILOGI 1.jpg",
        "249 LINN\xc9AS TRILOGI 2 .jpg",
        "250 LINN\xc9AS TRILOGI 3 .jpg"
    ]
    for c in corrupted_names:
        try:
            ftp.delete(c)
            print(f"Deleted corrupted remote file: {repr(c)}")
        except Exception:
            pass

    # 2. Upload/verify all 271 paintings
    for i, filename in enumerate(local_files, 1):
        local_path = os.path.join(LOCAL_DIR, filename)
        file_size = os.path.getsize(local_path)
        
        # Check remote size
        need_upload = True
        try:
            rem_size = ftp.size(filename)
            if rem_size == file_size:
                need_upload = False
        except Exception:
            need_upload = True

        if need_upload:
            print(f"[{i}/{len(local_files)}] Uploading {filename} ({file_size} bytes)... ", end="", flush=True)
            success = False
            for attempt in range(3):
                try:
                    with open(local_path, "rb") as f:
                        ftp.storbinary(f"STOR {filename}", f)
                    print("[OK]")
                    success = True
                    break
                except Exception as e:
                    print(f"[RETRY {attempt+1}: {e}] ", end="", flush=True)
                    time.sleep(1)
                    try:
                        ftp = ftplib.FTP(FTP_HOST, timeout=30)
                        ftp.encoding = "latin-1"
                        ftp.login(FTP_USER, FTP_PASS)
                        ftp.cwd(REMOTE_DIR)
                    except Exception:
                        pass
            if not success:
                print(f"[FAIL: {filename}]")
        else:
            # File matches exact size
            pass

    ftp.quit()
    print("\nFTP sync completed. Now verifying all 271 images over HTTPS...\n")

    # 3. Verify all 271 images via HTTPS on svavel.se
    failed = []
    for i, filename in enumerate(local_files, 1):
        encoded = urllib.parse.quote(filename)
        url = f"https://svavel.se/assets/images/{encoded}"
        req = urllib.request.Request(url, method="HEAD")
        req.add_header("User-Agent", "Mozilla/5.0")
        try:
            resp = urllib.request.urlopen(req, timeout=5)
            if resp.status != 200:
                failed.append((filename, resp.status))
        except Exception as e:
            failed.append((filename, str(e)))

    if not failed:
        print(f"ALL {len(local_files)} PAINTINGS VERIFIED 100% ONLINE AND WORKING (HTTP 200) ON SVAVEL.SE!")
    else:
        print(f"WARNING: {len(failed)} files failed HTTPS check:")
        for fn, err in failed:
            print(f"  - {fn}: {err}")

if __name__ == "__main__":
    main()
