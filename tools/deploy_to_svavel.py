import os
import ftplib
import ssl
import time

FTP_HOST = "ftpcluster.loopia.se"
FTP_USER = "natriumftp"
FTP_PASS = "6fQ3tjTrJguf"
REMOTE_ROOT = "/svavel.se/public_html"
LOCAL_DIR = "dist"

class ReusableFTPTLS(ftplib.FTP_TLS):
    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._cnx:
            conn = self.context.wrap_socket(conn, server_hostname=self.host, session=self.sock.session)
        return conn, size

def connect_ftp():
    print(f"Connecting to {FTP_HOST} (FTPS/Explicit TLS)...")
    ftps = ftplib.FTP_TLS()
    ftps.connect(FTP_HOST, 21, timeout=30)
    ftps.login(FTP_USER, FTP_PASS)
    ftps.prot_p() # Secure data connection
    print("Connected and authenticated successfully!")
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
            except Exception as e:
                pass

def get_remote_file_size(ftps, remote_file):
    try:
        return ftps.size(remote_file)
    except Exception:
        return -1

def upload_all():
    ftps = connect_ftp()
    
    # Priority order: HTML first, then CSS, then JS, then assets
    files_to_upload = []
    
    for root, dirs, files in os.walk(LOCAL_DIR):
        for f in files:
            local_path = os.path.join(root, f).replace('\\', '/')
            rel_path = os.path.relpath(local_path, LOCAL_DIR).replace('\\', '/')
            remote_path = f"{REMOTE_ROOT}/{rel_path}"
            
            # Determine priority
            if f.endswith('.html'):
                prio = 0
            elif f.endswith('.css'):
                prio = 1
            elif f.endswith('.js') or f.endswith('.json'):
                prio = 2
            else:
                prio = 3
                
            files_to_upload.append((prio, local_path, remote_path, os.path.getsize(local_path)))
            
    # Sort by priority
    files_to_upload.sort(key=lambda x: (x[0], x[1]))
    
    total = len(files_to_upload)
    print(f"\nStarting sync of {total} files from '{LOCAL_DIR}' to '{REMOTE_ROOT}'...")
    
    uploaded_count = 0
    skipped_count = 0
    
    for idx, (prio, local_path, remote_path, local_size) in enumerate(files_to_upload, 1):
        remote_dir = os.path.dirname(remote_path).replace('\\', '/')
        file_name = os.path.basename(remote_path)
        
        # Check remote file size to skip if identical (especially for media)
        # Always force upload html, css, js, json
        force_upload = prio < 3
        
        try:
            ensure_remote_dir(ftps, remote_dir)
            ftps.cwd(remote_dir)
            
            remote_size = -1
            if not force_upload:
                remote_size = get_remote_file_size(ftps, file_name)
                
            if not force_upload and remote_size == local_size:
                skipped_count += 1
                if idx % 20 == 0 or idx == total:
                    print(f"[{idx}/{total}] Skipped identical: {file_name}")
                continue
                
            print(f"[{idx}/{total}] Uploading {file_name} ({local_size:,} bytes)...", end="", flush=True)
            
            with open(local_path, "rb") as f_in:
                ftps.storbinary(f"STOR {file_name}", f_in)
                
            print(" [OK]")
            uploaded_count += 1
            
        except Exception as e:
            print(f" [FAILED: {e}] - Reconnecting...")
            try:
                ftps.close()
            except:
                pass
            time.sleep(2)
            ftps = connect_ftp()
            # Retry once
            try:
                ensure_remote_dir(ftps, remote_dir)
                ftps.cwd(remote_dir)
                with open(local_path, "rb") as f_in:
                    ftps.storbinary(f"STOR {file_name}", f_in)
                print(f"  Retry [OK]: {file_name}")
                uploaded_count += 1
            except Exception as e2:
                print(f"  Retry failed for {file_name}: {e2}")

    try:
        ftps.quit()
    except:
        pass
        
    print(f"\n=== DEPLOYMENT TO SVAVEL.SE COMPLETE ===")
    print(f"Uploaded: {uploaded_count} files")
    print(f"Skipped (already identical): {skipped_count} files")
    print(f"Total files on site: {total}")

if __name__ == "__main__":
    upload_all()
