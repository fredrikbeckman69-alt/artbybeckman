$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/'

function Get-FtpList($url) {
    try {
        $request = [System.Net.WebRequest]::Create($url)
        # Use Simple List to see EVERYTHING without permissions overhead
        $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
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
    Write-Host "`n--- ROOT FILE NAMES ONLY ---"
    Write-Host $list
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
}
