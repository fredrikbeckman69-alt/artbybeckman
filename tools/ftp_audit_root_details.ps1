$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/'

function Get-FtpList($url) {
    try {
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
    } catch { return "ERROR: $($_.Status)" }
}

try {
    $list = Get-FtpList "ftp://$FtpHost$RemotePath"
    Write-Host "`n--- ROOT LS -LA ---"
    Write-Host $list
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
