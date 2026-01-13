# Add missing images to data.js

$dataFile = "js\data.js"
$content = Get-Content $dataFile -Raw

# Define the 4 missing entries
$newEntries = @"
    {
        "filename":  "240 RAGE IN EDEN.jpg",
        "title":  "Rage In Eden",
        "id":  240,
        "size":  "",
        "material":  "",
        "year":  "",
        "description":  ""
    },
    {
        "filename":  "241 PROTECTED FROM THE SUN 1.0.jpg",
        "title":  "Protected From The Sun 1.0",
        "id":  241,
        "size":  "",
        "material":  "",
        "year":  "",
        "description":  ""
    },
    {
        "filename":  "242 ATOMIC #79.jpg",
        "title":  "Atomic #79",
        "id":  242,
        "size":  "30 * 30 cm",
        "material":  "Spackel, sprayfärg, akrylfärg, glitterspray, glitter, resin",
        "year":  "Maj 2024",
        "description":  ""
    },
    {
        "filename":  "243 FROZEN 1.0.jpg",
        "title":  "Frozen 1.0",
        "id":  243,
        "size":  "",
        "material":  "",
        "year":  "",
        "description":  ""
    },
"@

# Insert before the closing ];
$content = $content -replace '\];$', "$newEntries`r`n];"

Set-Content $dataFile -Value $content -Encoding UTF8
Write-Host "Added 4 missing images to data.js!"
