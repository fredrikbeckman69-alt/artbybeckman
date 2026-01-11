
$imageDir = "assets\images"
$outputFile = "js\data.js"

if (-not (Test-Path $imageDir)) {
    Write-Error "Directory $imageDir not found."
    exit
}

$images = @()
$validExtensions = @(".jpg", ".jpeg", ".png", ".gif", ".webp")

Get-ChildItem -Path $imageDir | ForEach-Object {
    if ($validExtensions -contains $_.Extension.ToLower()) {
        $filename = $_.Name
        $nameWithoutExt = $_.BaseName
        
        # Regex to match leading number
        if ($nameWithoutExt -match "^(\d+)\.?\s*(.+)$") {
            $number = [int]$matches[1]
            $titleRaw = $matches[2]
        } else {
            $number = 999999
            $titleRaw = $nameWithoutExt
        }

        # Clean title: Replace underscore with space, trim
        $title = $titleRaw -replace "_", " "
        $title = $title.Trim()
        
        # Title Case (simple)
        $textInfo = (Get-Culture).TextInfo
        $title = $textInfo.ToTitleCase($title.ToLower())

        $images += [PSCustomObject]@{
            filename = $filename
            title = $title
            original_number = $number
        }
    }
}

# Sort by number, then title
$sortedImages = $images | Sort-Object original_number, title

# Convert to JSON
$json = $sortedImages | ConvertTo-Json -Depth 2

# Write to JS file
$jsContent = "const GALLERY_IMAGES = $json;"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Found $($sortedImages.Count) images."
Write-Host "Written metadata to $outputFile"
