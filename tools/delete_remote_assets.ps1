param(
    [string]$FtpHost = "ftpcluster.loopia.se",
    [string]$Username = "natriumftp",
    [string]$Password = "6fQ3tjTrJguf",
    [string]$RemotePath = "/svavel.se/public_html"
)

$filesToDelete = @(
    "Avslappnad.png",
    "Gemini_Generated_Image_5gv8s75gv8s75gv8.png",
    "Gemini_Generated_Image_5pjxs85pjxs85pjx.png",
    "Gemini_Generated_Image_cvw9sicvw9sicvw9.png",
    "Gemini_Generated_Image_utyq3zutyq3zutyq (1).png",
    "Gemini_Generated_Image_x1fgr7x1fgr7x1fg.png",
    "Generated Image September 05, 2025 - 11_45AM.jpeg",
    "Generated Image September 09, 2025 - 7_26PM.png",
    "IMG_4594.jpg",
    "IMG_4661.jpg",
    "IMG_4779.jpg"
)

Write-Host "Deleting $($filesToDelete.Count) removed files from FTP: $FtpHost$RemotePath/assets/ ..." -ForegroundColor Cyan

foreach ($fileName in $filesToDelete) {
    $remoteUrl = "ftp://$FtpHost$RemotePath/assets/$fileName"
    try {
        Write-Host "Deleting $fileName... " -NoNewline
        $request = [System.Net.FtpWebRequest]::Create($remoteUrl)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $request.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)
        $request.EnableSsl = $true
        $request.KeepAlive = $false
        $request.Timeout = 10000
        $response = $request.GetResponse()
        $response.Close()
        Write-Host "[DELETED]" -ForegroundColor Green
    } catch {
        Write-Host "[SKIPPED/NOT FOUND: $($_.Exception.Message)]" -ForegroundColor Yellow
    }
}

Write-Host "`nAll specified files processed." -ForegroundColor Green
