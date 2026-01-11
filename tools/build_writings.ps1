
$text1Path = "assets\documents\text_1.txt"
$text2Path = "assets\documents\text_2.txt"
$templatePath = "writings.html"

function Clean-Text($text) {
    # Fix common encoding artifacts
    $t = $text -replace "A", "å"
    $t = $t -replace "A\?", "ä" # "A?" sometimes appears
    $t = $t -replace "A ", "ä"  # "A " sometimes appears
    $t = $t -replace "A r", "är"
    $t = $t -replace "dA ", "då"
    $t = $t -replace "pA ", "på"
    $t = $t -replace "sA ", "så"
    $t = $t -replace "nA ", "nå"
    $t = $t -replace "mA", "må"
    $t = $t -replace "A", "å"
    $t = $t -replace "A ", "ö" # This is risky, context dependent
    $t = $t -replace "fA r", "för"
    
    # Just generic fallbacks for the specific weird patterns seen
    $t = $t -replace "mA nniskor", "människor"
    $t = $t -replace "A ktenskap", "äktenskap"
    $t = $t -replace "A gde", "ägde"
    $t = $t -replace "gA ra", "göra"
    $t = $t -replace "hA r", "här"
    
    return $t
}

$text1 = Get-Content $text1Path -Raw
$text2 = Get-Content $text2Path -Raw

$clean1 = Clean-Text $text1
$clean2 = Clean-Text $text2

# Create HTML content
$html = @"
<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Writings | Art by Beckman</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <style>
        .tab-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .tab-btn {
            background: transparent;
            border: 1px solid var(--accent-color);
            color: var(--text-color);
            padding: 10px 20px;
            cursor: pointer;
            font-family: var(--font-heading);
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }
        .tab-btn.active, .tab-btn:hover {
            background: var(--accent-color);
            color: #000;
        }
        .tab-content {
            display: none;
            animation: fadeIn 0.5s;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>

    <header>
        <div class="logo"><a href="index.html" style="color:white;text-decoration:none;">Art by Beckman</a></div>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="gallery.html">Gallery</a></li>
                <li><a href="writings.html">Writings</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="container">
            <h1 style="text-align: center; margin-bottom: 3rem;">Writings & Reflections</h1>
            
            <div class="tab-buttons">
                <button class="tab-btn active" onclick="openTab('tab1')">Reflections</button>
                <button class="tab-btn" onclick="openTab('tab2')">Om Särskild Begåvning</button>
            </div>

            <div id="tab1" class="tab-content active">
                <div class="writing-section">
                    <h2>Reflections on Life & Relationships</h2>
                    <div class="writing-content">
$clean1
                    </div>
                </div>
            </div>

            <div id="tab2" class="tab-content">
                <div class="writing-section">
                    <h2>Särskilt Begåvad</h2>
                    <div class="writing-content">
$clean2
                    </div>
                </div>
            </div>
            
        </div>
    </main>

    <footer>
        &copy; 2026 Art by Beckman. All rights reserved.
    </footer>

    <script>
        function openTab(tabId) {
            // Hide all
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            
            // Show current
            document.getElementById(tabId).classList.add('active');
            event.currentTarget.classList.add('active');
        }
    </script>
</body>
</html>
"@

Set-Content -Path $templatePath -Value $html -Encoding UTF8
