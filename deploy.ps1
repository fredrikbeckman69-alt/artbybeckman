param(
    [Parameter(Mandatory = $true)][string]$FtpHost,
    [Parameter(Mandatory = $true)][string]$Username,
    [Parameter(Mandatory = $true)][string]$Password,
    [string]$RemotePath = "/"
)

# 1. Build DIST folder
$dist = "dist"
Write-Host "Building web package in '$dist'..." -ForegroundColor Cyan

if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dist | Out-Null

# Copy web files
$filesToCopy = @("index.html", "gallery.html", "videos.html", "instagram.html")
foreach ($f in $filesToCopy) {
    if (Test-Path $f) { Copy-Item $f -Destination $dist }
}
if (Test-Path "css") { Copy-Item "css" -Destination "$dist" -Recurse }
if (Test-Path "js") { Copy-Item "js" -Destination "$dist" -Recurse }

# Skip heavy assets for the initial "core" sync if needed, 
# but let's try to copy them all while excluding problematic docs
if (Test-Path "assets") {
    New-Item -ItemType Directory -Force -Path "$dist\assets" | Out-Null
    # Exclude 'documents' and optionally 'Movies' to speed up the main redesign deploy
    Get-ChildItem -Path "assets" -Exclude "documents", "Movies" | Copy-Item -Destination "$dist\assets" -Recurse
}

Write-Host "Build complete." -ForegroundColor Green

# 2. Robust FTP Upload function
function Robust-FtpUpload($localPath, $remotePath) {
    $targetUrl = "ftp://$FtpHost$remotePath"
    $files = Get-ChildItem -Path $localPath

    # Create directory logic
    try {
        $request = [System.Net.WebRequest]::Create($targetUrl)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $request.EnableSsl = $true
        $request.GetResponse().Close()
    } catch { } # Standard for directory already exists

    # Sort files so HTML/JS/CSS go first
    $sortedFiles = $files | Sort-Object { 
        if ($_.Attributes -band [System.IO.FileAttributes]::Directory) { 1 }
        elseif ($_.Extension -match "\.(html|js|css)$") { 0 }
        else { 2 }
    }

    foreach ($file in $sortedFiles) {
        if ($file.Attributes -band [System.IO.FileAttributes]::Directory) {
            Robust-FtpUpload -localPath $file.FullName -remotePath "$remotePath/$($file.Name)"
        }
        else {
            $uploadUrl = "ftp://$FtpHost$remotePath/$($file.Name)"
            $retryCount = 0
            $success = $false
            
            while (-not $success -and $retryCount -lt 2) {
                try {
                    Write-Host "Uploading $($file.Name)..." -ForegroundColor Gray -NoNewline
                    $request = [System.Net.WebRequest]::Create($uploadUrl)
                    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
                    $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
                    $request.EnableSsl = $true
                    $request.UseBinary = $true
                    $request.KeepAlive = $false
                    
                    $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
                    $request.ContentLength = $fileContent.Length
                    $requestStream = $request.GetRequestStream()
                    $requestStream.Write($fileContent, 0, $fileContent.Length)
                    $requestStream.Close()
                    $request.GetResponse().Close()
                    
                    Write-Host " [OK]" -ForegroundColor Green
                    $success = $true
                } catch {
                    $retryCount++
                    if ($retryCount -lt 2) {
                        Write-Host " [RETRY]" -ForegroundColor Yellow
                    } else {
                        Write-Host " [FAIL: $($_.Exception.Message)]" -ForegroundColor Red
                    }
                }
            }
        }
    }
}

try {
    if ($RemotePath -ne "/" -and -not $RemotePath.EndsWith("/")) { $RemotePath += "/" }
    Robust-FtpUpload -localPath $dist -remotePath $RemotePath
    Write-Host "`nSuccessfully finished deployment cycle to $FtpHost!" -ForegroundColor Green
} catch {
    Write-Host "Fatal deployment error: $($_.Exception.Message)" -ForegroundColor Red
}
