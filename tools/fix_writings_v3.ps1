
$path = "writings.html"
$outPath = "writings_fixed.html"

# Force reading as UTF-8
$content = Get-Content $path -Raw -Encoding UTF8

# Define characters using ASCII-safe char casting to avoid script encoding artifacts
$char_C3 = [string][char]0x00C3
$char_A5 = [string][char]0x00A5
$char_A4 = [string][char]0x00A4
$char_B6 = [string][char]0x00B6
$char_85 = [string][char]0x0085
$char_84 = [string][char]0x0084
$char_96 = [string][char]0x0096
$char_A9 = [string][char]0x00A9

$char_aa = [string][char]0x00E5 # å
$char_ae = [string][char]0x00E4 # ä
$char_oe = [string][char]0x00F6 # ö
$char_AA = [string][char]0x00C5 # Å
$char_AE = [string][char]0x00C4 # Ä
$char_OE = [string][char]0x00D6 # Ö
$char_ea = [string][char]0x00E9 # é

$map = @{}
$map[$char_C3 + $char_A5] = $char_aa
$map[$char_C3 + $char_A4] = $char_ae
$map[$char_C3 + $char_B6] = $char_oe
$map[$char_C3 + $char_85] = $char_AA
$map[$char_C3 + $char_84] = $char_AE
$map[$char_C3 + $char_96] = $char_OE
$map[$char_C3 + $char_A9] = $char_ea

foreach ($key in $map.Keys) {
    if ($content.Contains($key)) {
        Write-Host "Found signature matching one of the keys"
        $content = $content.Replace($key, $map[$key])
    }
}

# Fix Formatting
# Look for <div class="writing-content">
if ($content -match '(?s)(<div class="writing-content">)(.*?)(</div>)') {
    Write-Host "Found writing-content block."
    $startTag = $matches[1]
    $innerContent = $matches[2]
    $endTag = $matches[3]
    
    $lines = $innerContent -split "`r`n|`n"
    
    $newLines = @()
    $currentParagraph = @()
    
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "") { 
            continue 
        }
        
        # Match headers: "Förord", "Prolog", Dates
        # Förord = F + ö + rord
        $headerRegex = "^(F" + $char_oe + "rord|Prolog|\d{4}-\d{2}-\d{2}|Kapitel|Del \d+)"
        
        if ($trimmed -match $headerRegex) {
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
    Write-Warning "Could not find writing-content block."
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$pwd\$outPath", $content, $utf8NoBom)
Write-Host "Written fixed content to $outPath"
