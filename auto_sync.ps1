
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "."
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Write-Host "Monitoring for changes in $(Get-Location)..." -ForegroundColor Cyan

function Sync-Video {
    Write-Host "Change detected. Syncing to GitHub..." -ForegroundColor Yellow
    
    $status = git status --porcelain
    if ($status) {
        Write-Host "Changes found:" -ForegroundColor Gray
        Write-Host $status
        
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-sync: $timestamp"
        git push
        
        if ($?) {
            Write-Host "Successfully synced at $timestamp" -ForegroundColor Green
        } else {
            Write-Host "Sync failed." -ForegroundColor Red
        }
    } else {
        Write-Host "No changes to commit." -ForegroundColor Gray
    }
}

# Simple polling loop to avoid complexity with events in simple console
while ($true) {
    if (git status --porcelain) {
        Sync-Video
    }
    Start-Sleep -Seconds 10
}
