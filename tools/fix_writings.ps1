
$path = "writings.html"
$content = Get-Content $path -Raw -Encoding UTF8

# 1. Fix Encoding (Mojibake)
# Common UTF-8 interpreted as Windows-1252/Latin-1 artifacts
$replacements = @{
    'Ã¥' = 'å'
    'Ã¤' = 'ä'
    'Ã¶' = 'ö'
    'Ã…' = 'Å'
    'Ã„' = 'Ä'
    'Ã–' = 'Ö'
    'Ã©' = 'é'
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# 2. Fix Formatting (One word per line -> Paragraphs)
# We target the content inside <div class="writing-content">...</div>
# This regex looks for the div and captures the content
if ($content -match '(?s)(<div class="writing-content">)(.*?)(</div>)') {
    $startTag = $matches[1]
    $innerContent = $matches[2]
    $endTag = $matches[3]
    
    # Process inner content
    # Replace single newlines with spaces
    # But try to preserve paragraphs if there are double newlines (though the file view showed mostly single)
    
    # Split into lines
    $lines = $innerContent -split "`r`n|`n"
    
    $newLines = @()
    $currentParagraph = @()
    
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        if ($trimmed -eq "") { 
            continue 
        }
        
        # Heuristic: If line looks like a header or matches specific keywords, start a new paragraph
        if ($trimmed -match '^(FÃ¶rord|Prolog|\d{4}-\d{2}-\d{2}|Kapitel|Del \d+)') {
            # Flush current paragraph
            if ($currentParagraph.Count -gt 0) {
                $newLines += "<p>" + ($currentParagraph -join " ") + "</p>"
                $currentParagraph = @()
            }
            # Add header (maybe as h3 or just separate p)
            $newLines += "<h3>$trimmed</h3>"
        }
        else {
            $currentParagraph += $trimmed
        }
    }
    
    # Flush remaining
    if ($currentParagraph.Count -gt 0) {
        $newLines += "<p>" + ($currentParagraph -join " ") + "</p>"
    }
    
    $newInnerContent = "`n" + ($newLines -join "`n") + "`n"
    
    # Replace in original content
    # We use string replacement on the exact match to avoid regex complexity with large strings
    $content = $content.Replace($matches[0], "$startTag$newInnerContent$endTag")
}

# Write back
Set-Content $path -Value $content -Encoding UTF8
Write-Host "Fixed encoding and formatting in $path"
