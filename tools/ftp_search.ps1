$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'

function Get-FtpRecursive($remotePath) {
    $url = "ftp://$FtpHost$remotePath"
    Write-Host "Listing $remotePath..." -ForegroundColor Gray
    
    $request = [System.Net.WebRequest]::Create($url)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
    $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
    $request.EnableSsl = $true
    
    try {
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()
        
        $lines = $content -split "`r?`n"
        foreach ($line in $lines) {
            if (-not [string]::IsNullOrWhiteSpace($line)) {
                Write-Host $line
                # Basic parsing for directory: Linux format 'drwxr...'
                if ($line.StartsWith("d")) {
                    $parts = $line -split '\s+'
                    $dirName = $parts[-1]
                    if ($dirName -ne "." -and $dirName -ne "..") {
                        Get-FtpRecursive -remotePath "$remotePath/$dirName"
                    }
                }
            }
        }
    } catch {
        Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

try {
    Get-FtpRecursive -remotePath "/"
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
