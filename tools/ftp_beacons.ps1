$Username = 'natriumftp'
$Password = '6fQ3tjTrJguf'
$FtpHost = 'ftpcluster.loopia.se'

function Upload-TextFile($path, $content) {
    try {
        $url = "ftp://$FtpHost$path"
        Write-Host "Uploading to $url..."
        $request = [System.Net.WebRequest]::Create($url)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $request.EnableSsl = $true
        
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        $request.ContentLength = $bytes.Length
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($bytes, 0, $bytes.Length)
        $requestStream.Close()
        $request.GetResponse().Close()
        Write-Host " SUCCESS" -ForegroundColor Green
    } catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Upload-TextFile "/svavel_check_root.txt" "THIS IS THE ROOT DIRECTORY"
Upload-TextFile "/svavel.se/public_html/svavel_check_svavel_path.txt" "THIS IS /svavel.se/public_html/"
Upload-TextFile "/assets/svavel_check_assets_path.txt" "THIS IS THE ROOT ASSETS FOLDER"
