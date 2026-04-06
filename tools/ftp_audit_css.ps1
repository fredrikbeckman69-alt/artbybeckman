$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html/css'

function Get-FtpList($url) {
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
    $list = Get-FtpList "ftp://$FtpHost$RemotePath"
    Write-Host "`n--- CONTENTS OF $RemotePath ---"
    Write-Host $list
}
catch {
    Write-Host "Error auditing FTP: $($_.Exception.Message)" -ForegroundColor Red
}
