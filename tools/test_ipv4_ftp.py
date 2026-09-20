import ftplib
import socket
import ssl
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

FTP_HOST = 'ftpcluster.loopia.se'
FTP_USER = 'natriumftp'
FTP_PASS = '6fQ3tjTrJguf'
REMOTE_ROOT = '/svavel.se/public_html'

class LoopiaFTPTLS(ftplib.FTP_TLS):
    def makepasv(self):
        try:
            return ftplib.parse229(self.sendcmd('EPSV'), self.sock.getpeername())
        except Exception:
            host, port = ftplib.parse227(self.sendcmd('PASV'))
            return self.sock.getpeername()[0], port

    def ntransfercmd(self, cmd, rest=None):
        conn, size = ftplib.FTP.ntransfercmd(self, cmd, rest)
        if self._prot_p:
            session = getattr(self.sock, 'session', None)
            conn = self.context.wrap_socket(conn, server_hostname=FTP_HOST, session=session)
        return conn, size

# Force IPv4
ipv4 = socket.getaddrinfo(FTP_HOST, 21, socket.AF_INET, socket.SOCK_STREAM)[0][4][0]
print(f"Connecting to {FTP_HOST} via IPv4 ({ipv4})...")

ftp = LoopiaFTPTLS(timeout=60)
ftp.connect(ipv4, 21)
ftp.login(FTP_USER, FTP_PASS)
ftp.prot_p()
print("Successfully logged in and established TLS channel with session resumption!")

# Test upload of index.html
ftp.cwd(REMOTE_ROOT)
print(f"Current remote directory: {ftp.pwd()}")

with open('dist/index.html', 'rb') as f:
    ftp.storbinary('STOR index.html', f)
print(f"Uploaded dist/index.html! Remote size: {ftp.size('index.html')} bytes")

ftp.quit()
print("Done!")
