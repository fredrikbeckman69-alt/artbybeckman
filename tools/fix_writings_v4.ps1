
$path = "writings.html"
$outPath = "writings_fixed.html"

# Characters definitions
$char_C3 = [string][char]0x00C3
$str_aa = [string][char]0x00E5 # å (small)
$str_ae = [string][char]0x00E4 # ä (small)
$str_oe = [string][char]0x00F6 # ö (small)
$str_AA = [string][char]0x00C5 # Å (cap)
$str_AE = [string][char]0x00C4 # Ä (cap)
$str_OE = [string][char]0x00D6 # Ö (cap)

# Map for replacements
$map = @{}
$map[$char_C3 + [string][char]0x00A5] = $str_aa # Ã¥ -> å
$map[$char_C3 + [string][char]0x00A4] = $str_ae # Ã¤ -> ä
$map[$char_C3 + [string][char]0x00B6] = $str_oe # Ã¶ -> ö
$map[$char_C3 + [string][char]0x0085] = $str_AA # Ã… -> Å
$map[$char_C3 + [string][char]0x0084] = $str_AE # Ã„ -> Ä
$map[$char_C3 + [string][char]0x0096] = $str_OE # Ã– -> Ö
$map[$char_C3 + [string][char]0x00A9] = "é"     # Ã© -> é

# Setup Reader/Writer
$reader = [System.IO.StreamReader]::new($path, [System.Text.Encoding]::UTF8)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$writer = [System.IO.StreamWriter]::new($outPath, $false, $utf8NoBom)

$inContentBlock = $false
$paragraphBuffer = @()

try {
    while (($line = $reader.ReadLine()) -ne $null) {
        
        # 1. Encoding Fix on the line
        foreach ($key in $map.Keys) {
            if ($line.Contains($key)) {
                $line = $line.Replace($key, $map[$key])
            }
        }

        # 2. State Machine
        if ($line -match '<div class="writing-content">') {
            $inContentBlock = $true
            $writer.WriteLine($line)
            continue
        }
        
        if ($inContentBlock -and $line -match '</div>') {
            # Flush existing paragraph
            if ($paragraphBuffer.Count -gt 0) {
                # Join with spaces
                $pText = $paragraphBuffer -join " "
                $writer.WriteLine("<p>$pText</p>")
                $paragraphBuffer = @()
            }
            $inContentBlock = $false
            $writer.WriteLine($line)
            continue
        }

        if ($inContentBlock) {
            $trimmed = $line.Trim()
            if ($trimmed -eq "") { continue }

            # Header detection
            # Matches "1226", "2021", "FÃ¶rord" (fixed to Förord), "Prolog"
            # Updated header logic to be more inclusive based on file inspection
            # If line is short and uppercase? Or specific keywords.
            
            # Keywords from file: "1226", "2021", "Reflections...", "Om Särskild..."
            # Dates: YYYY-MM-DD
            $isHeader = $false
            
            if ($trimmed -match '^(Förord|Prolog|Kapitel|Del \d+)') { $isHeader = $true }
            elseif ($trimmed -match '^\d{4}-\d{2}-\d{2}') { $isHeader = $true }
            elseif ($trimmed -match '^\d{4}$') { $isHeader = $true } # Year like 1226? No, 1226 is usually not a header but here it looks like one
            
            if ($isHeader) {
                if ($paragraphBuffer.Count -gt 0) {
                    $pText = $paragraphBuffer -join " "
                    $writer.WriteLine("<p>$pText</p>")
                    $paragraphBuffer = @()
                }
                $writer.WriteLine("<h3>$trimmed</h3>")
            }
            else {
                $paragraphBuffer += $trimmed
            }
        }
        else {
            # Just write the line as is (outside content block)
            $writer.WriteLine($line)
        }
    }
}
finally {
    $reader.Close()
    $writer.Close()
}

Write-Host "Processed $outPath"
