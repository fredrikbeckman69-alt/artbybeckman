# Aggressive image compression - target all images over 2 MB
# This will reduce repository size to under 400 MB

$imageDir = "assets\images"
$targetSizeMB = 2
$qualityLevel = 80  # Lower quality for more compression

Write-Host "`nAGGRESSIVE IMAGE COMPRESSION" -ForegroundColor Cyan
Write-Host "Target: Compress images larger than $targetSizeMB MB`n" -ForegroundColor Yellow

# Find large images
$largeImages = Get-ChildItem $imageDir -File | Where-Object { 
    $_.Length -gt ($targetSizeMB * 1MB) 
} | Sort-Object Length -Descending

Write-Host "Found $($largeImages.Count) images larger than $targetSizeMB MB`n"

if ($largeImages.Count -eq 0) {
    Write-Host "No images need compression!" -ForegroundColor Green
    exit
}

$totalSizeBefore = ($largeImages | Measure-Object -Property Length -Sum).Sum
Write-Host "Total size before: $([math]::Round($totalSizeBefore / 1MB, 2)) MB`n" -ForegroundColor Yellow

# Compress using .NET
Add-Type -AssemblyName System.Drawing

$compressed = 0
$totalSaved = 0

foreach ($img in $largeImages) {
    try {
        $fullPath = $img.FullName
        $backupPath = $fullPath + ".backup"
        
        Copy-Item $fullPath $backupPath -Force
        
        $bitmap = [System.Drawing.Image]::FromFile($fullPath)
        
        # More aggressive resizing
        $newWidth = [int]($bitmap.Width * 0.65)
        $newHeight = [int]($bitmap.Height * 0.65)
        
        $newBitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($bitmap, 0, 0, $newWidth, $newHeight)
        
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, $qualityLevel
        )
        
        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | 
        Where-Object { $_.MimeType -eq 'image/jpeg' }
        
        $bitmap.Dispose()
        $newBitmap.Save($fullPath, $jpegCodec, $encoderParams)
        $newBitmap.Dispose()
        $graphics.Dispose()
        
        $newSize = (Get-Item $fullPath).Length
        $oldSize = (Get-Item $backupPath).Length
        $saved = $oldSize - $newSize
        $savedMB = [math]::Round($saved / 1MB, 2)
        $totalSaved += $saved
        
        Write-Host "  OK $($img.Name): $([math]::Round($oldSize/1MB,2)) MB to $([math]::Round($newSize/1MB,2)) MB" -ForegroundColor Green
        
        Remove-Item $backupPath -Force
        $compressed++
    }
    catch {
        Write-Host "  FAILED $($img.Name)" -ForegroundColor Red
        if (Test-Path $backupPath) {
            Move-Item $backupPath $fullPath -Force
        }
    }
}

Write-Host "`nCOMPRESSION COMPLETE" -ForegroundColor Cyan
Write-Host "Compressed $compressed images" -ForegroundColor Green
Write-Host "Total saved: $([math]::Round($totalSaved / 1MB, 2)) MB" -ForegroundColor Green
