$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html'

$files = @(
    'index.html',
    'gallery.html',
    'videos.html',
    'instagram.html',
    'walkaround.html',
    'js/data.js',
    'js/walkaround-data.js',
    'js/main.js',
    'js/gallery.js',
    'js/mobile-menu.js',
    'js/scroll-animations.js',
    'js/instagram-feed.js',
    'js/instagram-data.js',
    'js/walkaround-engine.js',
    'css/style-v3.css',
    'css/style-v3.min.css'
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING CORE FILES TO SVAVEL.SE (LOOPIA FTPS)" -ForegroundColor Cyan
Write-Host "Using curl.exe with TLS and 1.0s pacing" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($f in $files) {
    # Check dist first, then root
    $localPath = "dist\$f"
    if (-not (Test-Path $localPath)) {
        $localPath = $f
    }
    
    if (-not (Test-Path $localPath)) {
        Write-Host "[-] Skipping $f (not found)" -ForegroundColor Yellow
        continue
    }

    $remoteFile = $f -replace '\\', '/'
    $remoteUrl = "ftp://$FtpHost$RemotePath/$remoteFile"
    $fileSize = (Get-Item $localPath).Length

    Write-Host "Uploading $f ($fileSize bytes)... " -NoNewline
    
    $output = & curl.exe --ssl-reqd --ftp-create-dirs --silent --show-error -u "${Username}:${Password}" -T "$localPath" "$remoteUrl" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS]" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "[FAILED]" -ForegroundColor Red
        Write-Host "Error: $output" -ForegroundColor Yellow
        $failCount++
    }

    # Strict compliance with Skills.md: 1.0s delay between uploads
    Start-Sleep -Seconds 1
}

Write-Host "-----------------------------------------" -ForegroundColor Cyan
Write-Host "Deployment finished: $successCount succeeded, $failCount failed." -ForegroundColor Cyan
