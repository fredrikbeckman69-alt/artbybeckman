
$excelPath = "$PSScriptRoot\..\assets\documents\Tavlor dokumentation Fredrik Beckman.xlsx"
$imageDir = "$PSScriptRoot\..\assets\images"
$outputFile = "$PSScriptRoot\..\js\data.js"

if (-not (Test-Path $excelPath)) {
    Write-Error "Excel file not found at $excelPath"
    exit
}

# 1. Read Excel Data
Write-Host "Reading Excel file..."
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$workbook = $excel.Workbooks.Open($excelPath)
$sheet = $workbook.Sheets.Item(1)

# Headers are on row 2, data starts row 3
$row = 3
$metadata = @{}

$consecutiveBox = 0

for ($row = 3; $row -le 500; $row++) {
    $namn = $sheet.Cells.Item($row, 1).Value2
    
    if ([string]::IsNullOrWhiteSpace($namn)) {
        $consecutiveBox++
        if ($consecutiveBox -gt 10) { break }
        continue
    }
    $consecutiveBox = 0

    # Extract ID from Namn (e.g. "1. BLOOD 1.0" -> 1, "34 WHY" -> 34)
    if ($namn -match "^(\d+)") {
        $id = [int]$matches[1]
        
        # Read columns
        $storlek = $sheet.Cells.Item($row, 2).Value2
        # Column 3 (Underlag) skipped
        $anmarkning = $sheet.Cells.Item($row, 4).Value2
        $tillverkadRaw = $sheet.Cells.Item($row, 5).Value2
        $material = $sheet.Cells.Item($row, 6).Value2
        
        # Parse Date (Excel Serial Date or String)
        $year = ""
        if ($tillverkadRaw -is [double] -or $tillverkadRaw -is [int]) {
            try {
                $date = [datetime]::FromOADate($tillverkadRaw)
                $year = $date.ToString("yyyy")
            }
            catch {
                $year = $tillverkadRaw
            }
        }
        elseif ($tillverkadRaw) {
            $year = $tillverkadRaw.ToString()
        }

        $metadata[$id] = @{
            namn        = $namn
            storlek     = if ($storlek) { $storlek } else { "" }
            material    = if ($material) { $material } else { "" }
            year        = $year
            description = if ($anmarkning) { $anmarkning } else { "" }
        }
    }
}

$workbook.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "Read metadata for $($metadata.Count) items."

# 2. Scan Images and Merge
Write-Host "Scanning images..."
$images = @()
$validExtensions = @(".jpg", ".jpeg", ".png", ".gif", ".webp")

Get-ChildItem -Path $imageDir | ForEach-Object {
    if ($validExtensions -contains $_.Extension.ToLower()) {
        $filename = $_.Name
        $nameWithoutExt = $_.BaseName
        
        # Regex to match leading number
        $number = 999999
        $titleRaw = $nameWithoutExt

        if ($nameWithoutExt -match "^(\d+)\.?\s*(.+)$") {
            $number = [int]$matches[1]
            $titleRaw = $matches[2]
        } 

        # Clean title
        $title = $titleRaw -replace "_", " "
        $title = $title.Trim()
        $textInfo = (Get-Culture).TextInfo
        $title = $textInfo.ToTitleCase($title.ToLower())

        # Merge Excel Data
        $data = $metadata[$number]
        $size = ""
        $material = ""
        $year = ""
        $desc = ""

        if ($data) {
            $size = $data.storlek
            $material = $data.material
            $year = $data.year
            $desc = $data.description
        }

        $images += [PSCustomObject]@{
            filename    = $filename
            title       = $title
            id          = $number
            size        = $size
            material    = $material
            year        = $year
            description = $desc
        }
    }
}

# 3. Sort and Save
$sortedImages = $images | Sort-Object id, title
$json = $sortedImages | ConvertTo-Json -Depth 2
$jsContent = "const GALLERY_IMAGES = $json;"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Updated js/data.js with $($sortedImages.Count) images."
