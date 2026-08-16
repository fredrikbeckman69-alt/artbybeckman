param(
    [string]$FtpHost = "ftpcluster.loopia.se",
    [string]$Username = "natriumftp",
    [string]$Password = "6fQ3tjTrJguf",
    [string]$RemotePath = "/svavel.se/public_html"
)

$assetsDir = "assets"
$files = Get-ChildItem -Path $assetsDir -File

Write-Host "Found $($files.Count) files in $assetsDir to upload." -ForegroundColor Cyan

foreach ($file in $files) {
    $remoteFileUrl = "ftp://$FtpHost$RemotePath/assets/$($file.Name)"
    $retry = 0
    $uploaded = $false
    
    while (-not $uploaded -and $retry -lt 2) {
        try {
            Write-Host "Uploading $($file.Name)... " -NoNewline
            $request = [System.Net.FtpWebRequest]::Create($remoteFileUrl)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
            $request.EnableSsl = $true
            $request.UseBinary = $true
            $request.KeepAlive = $false
            $request.Timeout = 15000
            
            $fileBytes = [System.IO.File]::ReadAllBytes($file.FullName)
            $request.ContentLength = $fileBytes.Length
            $stream = $request.GetRequestStream()
            $stream.Write($fileBytes, 0, $fileBytes.Length)
            $stream.Close()
            $request.GetResponse().Close()
            
            Write-Host "[OK]" -ForegroundColor Green
            $uploaded = $true
        } catch {
            $retry++
            if ($retry -lt 2) {
                Write-Host "[RETRY]" -ForegroundColor Yellow
            } else {
                Write-Host "[FAIL: $($_.Exception.Message)]" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nAll assets processed." -ForegroundColor Green
