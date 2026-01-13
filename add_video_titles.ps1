# Add video titles to all video items in videos.html

$file = "videos.html"
$content = Get-Content $file -Raw

# Define all videos with their IDs and titles
$videos = @(
    @{id = "6-RP7CArXXs"; title = "EVERYTHING I WANT" },
    @{id = "KBJ8hHoi7Lc"; title = "I GOT EVERYTHING I WANT" },
    @{id = "XUOrs9hbt50"; title = "WHO KNEW?" },
    @{id = "4h0sy6jPq34"; title = "RED RAIN" },
    @{id = "9sKVGpneFKg"; title = "RED RAIN" },
    @{id = "7s8CP5AJuDo"; title = "BLOB 1.0" },
    @{id = "7VLC_BmJuE8"; title = "BROWN SESSIONS" },
    @{id = "X4jP65keGJg"; title = "SILVER TAPESTRY" },
    @{id = "c-EG9mXlzvo"; title = "DAYLIGHT DONE" },
    @{id = "F_9jTAfr7t4"; title = "DAYLIGHT" },
    @{id = "KnZc0v6sx70"; title = "JUNIOR B" },
    @{id = "ovydmw2mIEs"; title = "UNREAL" },
    @{id = "2WJM0PaFPHw"; title = "UNREAL" },
    @{id = "5MZMcHKSK50"; title = "WAKING LIGHT" },
    @{id = "22XeJ4v4YZk"; title = "FUSION 1.0" },
    @{id = "uBrxe4rfMK0"; title = "DEATH IS EVERYWHERE" },
    @{id = "6Xw2sdFPO4I"; title = "LOVE IS MAGIC" },
    @{id = "7OTSsJa0Hh4"; title = "THE WORLD IS MY OYSTER" },
    @{id = "Tv0alpm0zpg"; title = "FUSION 1.0 in the making" },
    @{id = "k4MuZgcseAs"; title = "FLUTE 1.0 in the making" },
    @{id = "JliK-TLWGf8"; title = "PROTECTED FROM THE SUN" },
    @{id = "l0BrfieVHZU"; title = "FROZEN" },
    @{id = "BKK1-DmeMQs"; title = "GRAINES D`ÉTOILES" },
    @{id = "JlZ5jyrhswQ"; title = "BUNGALOW" },
    @{id = "8HNX4JiWfcs"; title = "LOVE IS MAGIC" }
)

foreach ($video in $videos) {
    $pattern = "data-id=`"$($video.id)`"[^>]*>[\s\S]*?<div class=`"play-button`">▶</div>"
    $replacement = "data-id=`"$($video.id)`" onclick=`"loadVideo(this)`">`r`n                    <img src=`"https://img.youtube.com/vi/$($video.id)/maxresdefault.jpg`" alt=`"$($video.title)`"`r`n                        loading=`"lazy`">`r`n                    <div class=`"play-button`">▶</div>`r`n                    <div class=`"video-title`">$($video.title)</div>"
    
    $content = $content -replace $pattern, $replacement
}

Set-Content $file -Value $content -Encoding UTF8
Write-Host "Added titles to all videos!"
