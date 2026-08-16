$data = Get-Content 'js/data.js' -Raw -Encoding UTF8
$regex = [regex]'"filename":\s*"([^"]+)"'
$matches = $regex.Matches($data)
$filenamesInData = @($matches | ForEach-Object { $_.Groups[1].Value })

Write-Host "Total filename entries in js/data.js: $($filenamesInData.Count)"
$uniqueFilenames = $filenamesInData | Select-Object -Unique
Write-Host "Unique filename entries in js/data.js: $($uniqueFilenames.Count)"

$assetsImages = @(Get-ChildItem 'assets/images' -File | Select-Object -ExpandProperty Name)
Write-Host "Total files in assets/images: $($assetsImages.Count)"

$missingInAssets = $filenamesInData | Where-Object { $assetsImages -notcontains $_ }
Write-Host "`nFilenames in data.js but missing in assets/images:"
$missingInAssets | Select-Object -Unique | ForEach-Object { Write-Host "  MISSING: $_" }

$extraInAssets = $assetsImages | Where-Object { $filenamesInData -notcontains $_ }
Write-Host "`nFiles in assets/images but NOT in data.js:"
$extraInAssets | ForEach-Object { Write-Host "  EXTRA: $_" }

if (Test-Path 'dist/assets/images') {
    $distImages = @(Get-ChildItem 'dist/assets/images' -File | Select-Object -ExpandProperty Name)
    Write-Host "`nTotal files in dist/assets/images: $($distImages.Count)"
    $missingInDist = $filenamesInData | Where-Object { $distImages -notcontains $_ }
    Write-Host "Filenames in data.js but missing in dist/assets/images:"
    $missingInDist | Select-Object -Unique | ForEach-Object { Write-Host "  MISSING IN DIST: $_" }
}
