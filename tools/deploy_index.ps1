$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html'
$files = @('index.html', 'gallery.html', 'videos.html', 'instagram.html')

foreach ($f in $files) {
    Write-Host "Uploading $f..."
    $localPath = ".\$f"
    $remoteUrl = "ftp://$FtpHost$RemotePath/$f"
    $request = [System.Net.WebRequest]::Create($remoteUrl)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
    $request.EnableSsl = $true
    $request.UseBinary = $true
    $request.KeepAlive = $false

    try {
        $fileContent = [System.IO.File]::ReadAllBytes($localPath)
        $request.ContentLength = $fileContent.Length
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        $response = $request.GetResponse()
        Write-Host "Success: $f" -ForegroundColor Green
        $response.Close()
    } catch {
        Write-Host "Failed to upload $f : $($_.Exception.Message)" -ForegroundColor Red
    }
}
