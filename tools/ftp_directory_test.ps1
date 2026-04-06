$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'
$RemotePath = '/svavel.se/public_html'
$TempName = '/svavel.se/public_html_TMP'

function Rename-FtpFolder($oldPath, $newPath) {
    Write-Host "Renaming $oldPath to $newPath..."
    $request = [System.Net.WebRequest]::Create("ftp://$FtpHost$oldPath")
    $request.Method = [System.Net.WebRequestMethods+Ftp]::Rename
    $request.RenameTo = $newPath
    $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
    $request.EnableSsl = $true
    
    $response = $request.GetResponse()
    Write-Host "Rename result: $($response.StatusDescription)"
    $response.Close()
}

try {
    Rename-FtpFolder -oldPath $RemotePath -newPath $TempName
    Write-Host "FOLDER RENAMED. NOW VERIFY THE SITE IN THE BROWSER."
    
    # Wait 20 seconds for user/model to check
    Start-Sleep -Seconds 20
    
    # Restore
    Rename-FtpFolder -oldPath $TempName -newPath $RemotePath
    Write-Host "FOLDER RESTORED."
}
catch {
    Write-Host "Error during rename test: $($_.Exception.Message)" -ForegroundColor Red
}
