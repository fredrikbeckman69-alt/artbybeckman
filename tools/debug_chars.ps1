
# Check character values
$c_e5 = [char]0xE5
$c_c5 = [char]0xC5
$c_e4 = [char]0xE4
$c_c4 = [char]0xC4
$c_f6 = [char]0xF6
$c_d6 = [char]0xD6

Write-Host "0xE5 (expected small aa): $c_e5  Int: $([int]$c_e5)"
Write-Host "0xC5 (expected cap AA):   $c_c5  Int: $([int]$c_c5)"
Write-Host "0xE4 (expected small ae): $c_e4  Int: $([int]$c_e4)"
Write-Host "0xC4 (expected cap AE):   $c_c4  Int: $([int]$c_c4)"
Write-Host "0xF6 (expected small oe): $c_f6  Int: $([int]$c_f6)"
Write-Host "0xD6 (expected cap OE):   $c_d6  Int: $([int]$c_d6)"

# Check raw bytes of writings.html (first few matches of mojibake)
# We look for "SÃ¥" which should be around line 68
$bytes = Get-Content -Path "writings.html" -Encoding Byte -TotalCount 2000 | Select-Object -Skip 1000

# Simple heuristic scan for C3 followed by A5
# We index from 0 to count-2
Write-Host "`nScanning for C3 A5 (Ã¥) sequence in bytes 1000-2000:"
for ($i = 0; $i -lt $bytes.Count - 1; $i++) {
    if ($bytes[$i] -eq 0xC3) {
        $next = $bytes[$i + 1]
        if ($next -eq 0xA5) {
            Write-Host "Found C3 A5 at offset $i"
        }
        elseif ($next -eq 0x85) {
            Write-Host "Found C3 85 at offset $i (Capital A-ring)"
        }
        elseif ($next -eq 0xA4) {
            Write-Host "Found C3 A4 at offset $i (small a-umlaut)"
        }
        elseif ($next -eq 0x84) {
            Write-Host "Found C3 84 at offset $i (Capital A-umlaut)"
        }
        elseif ($next -eq 0xB6) {
            Write-Host "Found C3 B6 at offset $i (small o-umlaut)"
        }
        elseif ($next -eq 0x96) {
            Write-Host "Found C3 96 at offset $i (Capital O-umlaut)"
        }
    }
}
