param(
    [Parameter(Mandatory = $true)][string]$FtpHost,
    [Parameter(Mandatory = $true)][string]$Username,
    [Parameter(Mandatory = $true)][string]$Password,
    [string]$RemotePath = "/"
)

# 1. Build DIST folder
$dist = "dist"
Write-Host "Building website package in '$dist'..." -ForegroundColor Cyan

if (Test-Path $dist) {
    Remove-Item $dist -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$filesToCopy = @("index.html", "gallery.html", "videos.html", "instagram.html", "css", "js", "assets")
Copy-Item $filesToCopy -Destination $dist -Recurse

Write-Host "Build complete." -ForegroundColor Green

# 2. Upload to FTP
Write-Host "Connecting to FTP $FtpHost..." -ForegroundColor Cyan

# Helper function to recursively upload files
function Upload-FtpDirectory($localPath, $remotePath) {
    $targetUrl = "ftp://$FtpHost$remotePath"
    
    # Create the directory on the server (ignore error if exists)
    try {
        $request = [System.Net.WebRequest]::Create($targetUrl)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $request.EnableSsl = $true
        $request.GetResponse().Close()
    }
    catch {
        # Directory likely exists
    }

    $files = Get-ChildItem -Path $localPath

    foreach ($file in $files) {
        if ($file.Attributes -band [System.IO.FileAttributes]::Directory) {
            # Recurse
            Upload-FtpDirectory -localPath $file.FullName -remotePath "$remotePath/$($file.Name)"
        }
        else {
            # Upload file
            $uploadUrl = "ftp://$FtpHost$remotePath/$($file.Name)"
            Write-Host "Uploading $($file.Name)..." -ForegroundColor Gray
            
            $request = [System.Net.WebRequest]::Create($uploadUrl)
            $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
            $request.EnableSsl = $true
            $request.UseBinary = $true
            $request.KeepAlive = $true
            
            $fileContent = [System.IO.File]::ReadAllBytes($file.FullName)
            $request.ContentLength = $fileContent.Length
            $requestStream = $request.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            $request.GetResponse().Close()
        }
    }
}

try {
    # Ensure remote path ends with / if not empty and not just /
    if ($RemotePath -ne "/" -and -not $RemotePath.EndsWith("/")) {
        $RemotePath += "/"
    }
    
    # Start upload
    Upload-FtpDirectory -localPath $dist -remotePath $RemotePath
    
    Write-Host "`nSuccessfully deployed to $FtpHost!" -ForegroundColor Green
}
catch {
    Write-Host "`nError during upload: $($_.Exception.Message)" -ForegroundColor Red
}
