$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html'
$files = @(
    'index.html',
    'gallery.html',
    'js/gallery.js',
    'css/style-v3.css',
    'css/style-v3.min.css'
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING TO SVAVEL.SE VIA LOOPIA FTPS" -ForegroundColor Cyan
Write-Host "Pacing: 1.0s delay between transfers" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

foreach ($f in $files) {
    $localPath = Join-Path $PSScriptRoot "..\$f"
    if (-not (Test-Path $localPath)) {
        $localPath = ".\$f"
    }
    $localPath = (Resolve-Path $localPath).Path
    $remoteFile = $f -replace '\\', '/'
    $remoteUrl = "ftp://$FtpHost$RemotePath/$remoteFile"
    $fileSize = (Get-Item $localPath).Length

    Write-Host "Uploading $f ($fileSize bytes)..." -NoNewline
    
    $output = & curl.exe --ssl-reqd --ftp-create-dirs --silent --show-error -u "${Username}:${Password}" -T "$localPath" "$remoteUrl" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [SUCCESS]" -ForegroundColor Green
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "Error: $output" -ForegroundColor Yellow
    }

    # Strict compliance with Skills.md: 1 second delay between uploads to avoid Loopia WAF/ban
    Start-Sleep -Seconds 1
}

Write-Host "Deployment cycle completed." -ForegroundColor Cyan

