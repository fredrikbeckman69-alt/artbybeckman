$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'

function Check-File($path) {
    $url = "ftp://$FtpHost$path"
    try {
        $request = [System.Net.WebRequest]::Create($url)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::GetFileSize
        $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $request.EnableSsl = $true
        $response = $request.GetResponse()
        Write-Host "File EXISTS at $path (Size: $($response.ContentLength))" -ForegroundColor Green
        $response.Close()
        return $true
    } catch {
        Write-Host "File MISSING at $path" -ForegroundColor Gray
        return $false
    }
}

Check-File "/index.html"
Check-File "/public_html/index.html"
Check-File "/svavel.se/public_html/index.html"
Check-File "/svavel.se/index.html"
Check-File "/www/index.html"
