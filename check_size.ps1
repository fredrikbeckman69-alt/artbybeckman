# Check repository size for GitHub Pages limits

Write-Host "`n=== REPOSITORY SIZE CHECK ===" -ForegroundColor Cyan

# Total repository size
$total = Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum
$totalMB = [math]::Round($total.Sum / 1MB, 2)
Write-Host "`nTotal repository size: $totalMB MB" -ForegroundColor Yellow
Write-Host "Total files: $($total.Count)"

# Images folder size
$images = Get-ChildItem 'assets\images' -File | Measure-Object -Property Length -Sum
$imagesMB = [math]::Round($images.Sum / 1MB, 2)
Write-Host "`nImages folder size: $imagesMB MB" -ForegroundColor Yellow
Write-Host "Image count: $($images.Count)"

# Top 10 largest files
Write-Host "`n=== TOP 10 LARGEST FILES ===" -ForegroundColor Cyan
Get-ChildItem 'assets\images' -File | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $sizeMB = [math]::Round($_.Length / 1MB, 2)
    Write-Host "$($_.Name): $sizeMB MB"
}

# GitHub Pages limits
Write-Host "`n=== GITHUB PAGES LIMITS ===" -ForegroundColor Cyan
Write-Host "Recommended max: 1 GB (1000 MB)"
Write-Host "Soft limit: 1 GB"
Write-Host "Hard limit: 100 MB per file"

if ($totalMB -gt 1000) {
    Write-Host "`nWARNING: Repository exceeds 1 GB!" -ForegroundColor Red
}
elseif ($totalMB -gt 500) {
    Write-Host "`nCAUTION: Repository is getting large ($totalMB MB)" -ForegroundColor Yellow
}
else {
    Write-Host "`nOK: Repository size is within limits" -ForegroundColor Green
}
