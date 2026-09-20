import os
import ftplib
import ssl
import time

FTP_HOST = "ftpcluster.loopia.se"
FTP_USER = "natriumftp"
FTP_PASS = "6fQ3tjTrJguf"
REMOTE_ROOT = "/svavel.se/public_html"

class LoopiaFTPTLS(ftplib.FTP_TLS):
    def makepasv(self):
        try:
            untrusted_host, port = ftplib.parse227(self.sendcmd('PASV'))
            if self.trust_server_pasv_ipv4_address:
                host = untrusted_host
            else:
                host = self.sock.getpeername()[0]
            return host, port
        except Exception:
            return ftplib.parse229(self.sendcmd('EPSV'), self.sock.getpeername())

    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            session = getattr(self.sock, 'session', None)
            conn = self.context.wrap_socket(conn, server_hostname=self.host, session=session)
        return conn, size

def connect_ftp():
    print(f"Connecting to {FTP_HOST} (FTPS/Explicit TLS)...")
    ftps = LoopiaFTPTLS()
    ftps.connect(FTP_HOST, 21, timeout=30)
    ftps.login(FTP_USER, FTP_PASS)
    ftps.prot_p()
    print("Connected and authenticated!")
    return ftps

def ensure_remote_dir(ftps, remote_dir):
    dirs = [d for d in remote_dir.split('/') if d]
    current = ""
    for d in dirs:
        current += "/" + d
        try:
            ftps.cwd(current)
        except Exception:
            try:
                ftps.mkd(current)
                ftps.cwd(current)
            except Exception:
                pass

def upload_files():
    files_to_sync = [
        ('dist/index.html', f'{REMOTE_ROOT}/index.html'),
        ('dist/gallery.html', f'{REMOTE_ROOT}/gallery.html'),
        ('dist/videos.html', f'{REMOTE_ROOT}/videos.html'),
        ('dist/instagram.html', f'{REMOTE_ROOT}/instagram.html'),
        ('dist/walkaround.html', f'{REMOTE_ROOT}/walkaround.html'),
        ('dist/js/data.js', f'{REMOTE_ROOT}/js/data.js'),
        ('dist/js/walkaround-data.js', f'{REMOTE_ROOT}/js/walkaround-data.js'),
        ('dist/js/main.js', f'{REMOTE_ROOT}/js/main.js'),
        ('dist/js/gallery.js', f'{REMOTE_ROOT}/js/gallery.js'),
        ('dist/js/mobile-menu.js', f'{REMOTE_ROOT}/js/mobile-menu.js'),
        ('dist/js/scroll-animations.js', f'{REMOTE_ROOT}/js/scroll-animations.js'),
        ('dist/js/instagram-feed.js', f'{REMOTE_ROOT}/js/instagram-feed.js'),
        ('dist/js/instagram-data.js', f'{REMOTE_ROOT}/js/instagram-data.js'),
        ('dist/css/style-v3.css', f'{REMOTE_ROOT}/css/style-v3.css'),
        ('dist/css/style-v3.min.css', f'{REMOTE_ROOT}/css/style-v3.min.css'),
    ]

    ftps = connect_ftp()
    
    for local_path, remote_path in files_to_sync:
        if not os.path.exists(local_path):
            print(f"Skipping {local_path} (not found)")
            continue
            
        remote_dir = os.path.dirname(remote_path)
        file_name = os.path.basename(remote_path)
        ensure_remote_dir(ftps, remote_dir)
        
        success = False
        for attempt in range(3):
            try:
                with open(local_path, 'rb') as fp:
                    ftps.storbinary(f"STOR {file_name}", fp)
                remote_size = ftps.size(file_name)
                local_size = os.path.getsize(local_path)
                print(f"✓ Uploaded {local_path} -> {remote_path} ({remote_size}/{local_size} bytes)")
                success = True
                break
            except Exception as e:
                print(f"Attempt {attempt+1} failed for {file_name}: {e}. Reconnecting...")
                time.sleep(1)
                try:
                    ftps.quit()
                except Exception:
                    pass
                ftps = connect_ftp()
                ensure_remote_dir(ftps, remote_dir)
                
        if not success:
            print(f"✗ FAILED to upload {local_path}")
            
    try:
        ftps.quit()
    except Exception:
        pass
    print("\nCore deployment complete!")

if __name__ == '__main__':
    upload_files()
