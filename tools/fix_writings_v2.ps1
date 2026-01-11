
$path = "writings.html"
$outPath = "writings_fixed.html"

# Force reading as UTF-8
$content = Get-Content $path -Raw -Encoding UTF8

# 1. Fix Encoding (Mojibake) matching C3+XX patterns
# Ã (0xC3) + ¥ (0xA5) -> å
# Ã (0xC3) + ¤ (0xA4) -> ä
# Ã (0xC3) + ¶ (0xB6) -> ö
# Ã (0xC3) + … (0x85) -> Å
# Ã (0xC3) + „ (0x84) -> Ä
# Ã (0xC3) + – (0x96) -> Ö

# Construct search strings programmatically to avoid script encoding issues
$map = @{}
$map[[string][char]0x00C3 + [string][char]0x00A5] = "å"
$map[[string][char]0x00C3 + [string][char]0x00A4] = "ä"
$map[[string][char]0x00C3 + [string][char]0x00B6] = "ö"
$map[[string][char]0x00C3 + [string][char]0x0085] = "Å"
$map[[string][char]0x00C3 + [string][char]0x0084] = "Ä"
$map[[string][char]0x00C3 + [string][char]0x0096] = "Ö"
# Common French/Other ? 
$map[[string][char]0x00C3 + [string][char]0x00A9] = "é" 

foreach ($key in $map.Keys) {
    if ($content.Contains($key)) {
        Write-Host "Found signature: $($map[$key])"
        $content = $content.Replace($key, $map[$key])
    }
}

# 2. Fix Formatting (One word per line -> Paragraphs)
if ($content -match '(?s)(<div class="writing-content">)(.*?)(</div>)') {
    Write-Host "Found writing-content block."
    $startTag = $matches[1]
    $innerContent = $matches[2]
    $endTag = $matches[3]
    
    # Split into lines
    $lines = $innerContent -split "`r`n|`n"
    
    $newLines = @()
    $currentParagraph = @()
    
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "") { 
            continue 
        }
        
        # Heuristic for headers or new sections
        # Match dates YYYY-MM-DD
        # Match "FÃ¶rord" (now "Förord"), "Prolog", "Kapitel"
        if ($trimmed -match '^(Förord|Prolog|\d{4}-\d{2}-\d{2}|Kapitel|Del \d+)') {
            # Flush current paragraph
            if ($currentParagraph.Count -gt 0) {
                $newLines += "<p>" + ($currentParagraph -join " ") + "</p>"
                $currentParagraph = @()
            }
            $newLines += "<h3>$trimmed</h3>"
        }
        else {
            $currentParagraph += $trimmed
        }
    }
    
    if ($currentParagraph.Count -gt 0) {
        $newLines += "<p>" + ($currentParagraph -join " ") + "</p>"
    }
    
    $newInnerContent = "`n" + ($newLines -join "`n") + "`n"
    $content = $content.Replace($matches[0], "$startTag$newInnerContent$endTag")
}
else {
    Write-Warning "Could not find <div class='writing-content'> block."
}

# Write back with UTF8 Encoding (No BOM is preferred usually, but PS default UTF8 has BOM)
# We'll use [System.IO.File] to control this precisely
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$pwd\$outPath", $content, $utf8NoBom)
Write-Host "Written fixed content to $outPath"
