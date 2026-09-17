import ftplib
import os
import sys
import time
import ssl

FTP_HOST = 'ftpcluster.loopia.se'
FTP_USER = 'natriumftp'
FTP_PASS = '6fQ3tjTrJguf'
REMOTE_ROOT = '/svavel.se/public_html'

SYNC_FILES = [
    # Meta / Root HTML
    'index.html',
    'gallery.html',
    'videos.html',
    'instagram.html',
    'walkaround.html',
    'favicon.ico',
    'assets/favicon.svg',

    # Stylesheets
    'css/style-v3.css',
    'css/style-v3.min.css',

    # JavaScript
    'js/main.js',

    # Hero WebP Images
    'assets/images/270_ORIGAMI_800.webp',
    'assets/images/hero_tab_origami.webp',
    'assets/images/265_HEART_TEETH_800.webp',
    'assets/images/hero_tab_heart_teeth.webp',
    'assets/images/266_BLACK_MIRROR_800.webp',
    'assets/images/hero_tab_black_mirror.webp',
    'assets/images/267_PINK_DRESS_800.webp',
    'assets/images/hero_tab_pink_dress.webp',

    # Five New Works WebP Images
    'assets/images/267 PINK DRESS_600.webp',
    'assets/images/268 RASPBERRY BERET_600.webp',
    'assets/images/269 VERTIGO_600.webp',
    'assets/images/270 ORIGAMI_600.webp',
    'assets/images/271 GOLDEN TICKET_600.webp',

    # Video Poster
    'assets/Movies/art_film_poster.webp',
    'assets/Movies/art_film_poster.jpg',

    # Featured Movie (~60.7 MB)
    'assets/Movies/20260917_Art_fardig_film.mp4',
]

def ensure_remote_dir(ftp, remote_dir_path):
    parts = [p for p in remote_dir_path.replace(chr(92), '/').split('/') if p]
    cur = ''
    for part in parts:
        cur += '/' + part
        try:
            ftp.cwd(cur)
        except ftplib.error_perm:
            try:
                ftp.mkd(cur)
                ftp.cwd(cur)
            except ftplib.error_perm:
                pass

def upload_file_safe(ftp, local_rel_path):
    local_path = os.path.normpath(local_rel_path)
    if not os.path.exists(local_path):
        print(f'[-] Local file not found: {local_path}')
        return False

    remote_rel = local_rel_path.replace(chr(92), '/')
    remote_dir = REMOTE_ROOT + '/' + os.path.dirname(remote_rel)
    remote_filename = os.path.basename(remote_rel)
    total_size = os.path.getsize(local_path)
    size_mb = total_size / (1024 * 1024)

    print(f'[*] Preparing: {local_rel_path} ({size_mb:.2f} MB)...', flush=True)
    ensure_remote_dir(ftp, remote_dir)

    uploaded_bytes = 0
    start_time = time.time()
    last_print = start_time

    def callback(chunk):
        nonlocal uploaded_bytes, last_print
        uploaded_bytes += len(chunk)
        now = time.time()
        if total_size > 5 * 1024 * 1024 and (now - last_print >= 2.0 or uploaded_bytes >= total_size):
            pct = (uploaded_bytes / total_size) * 100
            elapsed = now - start_time
            speed = (uploaded_bytes / (1024 * 1024)) / elapsed if elapsed > 0 else 0
            print(f'    -> {pct:5.1f}% ({uploaded_bytes / (1024*1024):.1f}/{size_mb:.1f} MB) at {speed:.2f} MB/s', flush=True)
            last_print = now

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {remote_filename}', f, blocksize=128*1024, callback=callback)
            elapsed = max(time.time() - start_time, 0.01)
            avg_speed = size_mb / elapsed
            print(f'[+] SUCCESS: {local_rel_path} uploaded in {elapsed:.1f}s ({avg_speed:.2f} MB/s)\n', flush=True)
            return True
        except Exception as e:
            print(f'[!] Warning on attempt {attempt}: {e}', flush=True)
            if attempt < max_retries:
                time.sleep(3)
            else:
                print(f'[x] FAILED to upload {local_rel_path} after {max_retries} attempts.', flush=True)
                return False

def main():
    print('=' * 60)
    print('SAFE FTP DEPLOYMENT TO SVAVEL.SE (LOOPIA CLUSTER)')
    print('Strategy: Single persistent TLS connection with pacing')
    print(f'Total files to deploy: {len(SYNC_FILES)}')
    print('=' * 60, flush=True)

    missing = [f for f in SYNC_FILES if not os.path.exists(f)]
    if missing:
        print(f'[x] ERROR: Missing local files: {missing}')
        sys.exit(1)

    print('[*] Connecting to Loopia FTP cluster (single TLS session)...', flush=True)
    ftp = ftplib.FTP_TLS(timeout=120)
    ftp.encoding = 'latin-1'
    ftp.connect(FTP_HOST, 21)
    ftp.login(FTP_USER, FTP_PASS)
    ftp.prot_p()
    print('[+] Logged in and established secure TLS data channel.', flush=True)

    success_count = 0
    fail_count = 0

    for i, rel_path in enumerate(SYNC_FILES, 1):
        print(f'[{i}/{len(SYNC_FILES)}] Starting {rel_path}...', flush=True)
        ok = upload_file_safe(ftp, rel_path)
        if ok:
            success_count += 1
        else:
            fail_count += 1
        time.sleep(0.5)

    print('-' * 60)
    print(f'Deployment complete! Successfully uploaded: {success_count}/{len(SYNC_FILES)} (Failed: {fail_count})')
    print('-' * 60, flush=True)

    try:
        ftp.quit()
        print('[+] FTP session closed cleanly.')
    except Exception:
        ftp.close()

if __name__ == '__main__':
    main()
