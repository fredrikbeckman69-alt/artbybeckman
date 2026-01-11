
$path = "writings.html"
$outPath = "writings_fixed.html"

# Define characters
$small_aa = [string][char]229 # å
$small_ae = [string][char]228 # ä
$small_oe = [string][char]246 # ö

$cap_AA = [string][char]197 # Å
$cap_AE = [string][char]196 # Ä
$cap_OE = [string][char]214 # Ö

# Double check what we defined
Write-Host "Diagnostic: small_aa is ASCII $([int][char]$small_aa)"
Write-Host "Diagnostic: cap_AA   is ASCII $([int][char]$cap_AA)"

# Map for replacements
# Ã (0xC3) + char
$char_C3 = [string][char]0xC3

$map = @{}
# Lowercase mappings
$map[$char_C3 + [string][char]0xA5] = $small_aa # Ã¥ -> å
$map[$char_C3 + [string][char]0xA4] = $small_ae # Ã¤ -> ä
$map[$char_C3 + [string][char]0xB6] = $small_oe # Ã¶ -> ö

# Uppercase mappings
$map[$char_C3 + [string][char]0x85] = $cap_AA   # Ã… -> Å
$map[$char_C3 + [string][char]0x84] = $cap_AE   # Ã„ -> Ä
$map[$char_C3 + [string][char]0x96] = $cap_OE   # Ã– -> Ö

$map[$char_C3 + [string][char]0xA9] = "é"       # Ã© -> é

# Setup Reader/Writer
$reader = [System.IO.StreamReader]::new($path, [System.Text.Encoding]::UTF8)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$writer = [System.IO.StreamWriter]::new($outPath, $false, $utf8NoBom)

$inContentBlock = $false
$paragraphBuffer = @()

try {
    while (($line = $reader.ReadLine()) -ne $null) {
        
        # 1. Encoding Fix
        foreach ($key in $map.Keys) {
            # Note: Contains is simple text check.
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
            if ($paragraphBuffer.Count -gt 0) {
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

            # Header handling
            # Regex handles optional leading dot/space
            $headerRegex = '^[\.\s]*(Förord|Prolog|Kapitel|Del \d+|\d{4}-\d{2}-\d{2}|\d{4})'
            
            if ($trimmed -match $headerRegex) {
                # Flush previous paragraph
                if ($paragraphBuffer.Count -gt 0) {
                    $pText = $paragraphBuffer -join " "
                    $writer.WriteLine("<p>$pText</p>")
                    $paragraphBuffer = @()
                }
                
                # Clean up header text (remove leading dot)
                $headerText = $trimmed.TrimStart('.', ' ')
                
                # Write header
                $writer.WriteLine("<h3>$headerText</h3>")
            }
            else {
                # Regular text
                $paragraphBuffer += $trimmed
            }
        }
        else {
            $writer.WriteLine($line)
        }
    }
}
finally {
    $reader.Close()
    $writer.Close()
}

Write-Host "Processed $outPath done."
