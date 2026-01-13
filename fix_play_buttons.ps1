# Remove Unicode play symbols from videos.html

$file = "videos.html"
$content = Get-Content $file -Raw -Encoding UTF8

# Replace all play-button content with empty divs
$content = $content -replace '(\u003cdiv class="play-button"\u003e)[^\u003c]+(\u003c/div\u003e)', '$1$2'

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
Write-Host "Removed Unicode play symbols from all video buttons"
