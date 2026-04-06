$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html'

function Get-FtpList($url) {
    Write-Host "Fetching list for $url"
    $request = [System.Net.WebRequest]::Create($url)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
    $request.EnableSsl = $true
    
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $list = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
    return $list
}

try {
    $rootList = Get-FtpList "ftp://$FtpHost$RemotePath"
    Write-Host "`n--- CONTENTS OF $RemotePath ---"
    Write-Host $rootList
}
catch {
    Write-Host "Error auditing FTP: $($_.Exception.Message)" -ForegroundColor Red
}
