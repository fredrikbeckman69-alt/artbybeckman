---
name: artbybeckman_portfolio_guidelines
description: Core technical and aesthetic guidelines for developing the Artbybeckman portfolio website.
---

# Artbybeckman Project Guidelines

This document outlines the core skills, instructions, and technical constraints required for the **Artbybeckman** portfolio website. When working on this repository, strictly adhere to the following rules.

## 1. Design & Aesthetic System (Phase 13)
The project currently adheres to a **High-Impact Colorful Typography** design philosophy.
*   **Backgrounds:** Strictly use clean, white backgrounds across primary views.
*   **Gradients:** Utilize static, high-fidelity Siri-inspired colorful gradients for visual interest.
*   **Typography Constraint:** Absolutely **NO plain black text on primary headers**. Typography must be colorful and impactful.
*   **Core Vibe:** The aesthetic should feel premium, dynamic, and integrate subtle glassmorphism effects where appropriate.

## 2. Technical Stack
*   **Core:** HTML5, CSS3 (Vanilla), and Vanilla JavaScript. (Avoid adding heavy frontend frameworks).
*   **Performance:** All UI animations and transitions must be optimized for performance. Utilize GPU acceleration (e.g., `transform`, `opacity`) where possible to ensure smooth interactions.
*   **Compatibility:** Universal cross-browser compatibility is a hard requirement.

## 3. Data & Architecture
*   **Metadata Pipeline:** The core data (e.g., for the gallery) is driven by a robust **Excel-to-JSON metadata pipeline** (`Tavlor dokumentation Fredrik Beckman.xlsx`). Do not alter the structure of generated JSON data or the scripts responsible for this conversion without explicitly keeping the pipeline intact.

## 4. Deployment & Infrastructure
*   **CI/CD:** The website is deployed using a custom **GitHub Actions** deployment workflow. The repository has a history of resolving persistent queuing delays by moving to this automated system.
*   **FTP Upload (`deploy.ps1`):** In case manual deployment to Loopia FTP is required, use `deploy.ps1`. 
    *   **Crucial Fix (TLS/SSL):** Loopia's Pure-FTPd requires explicit SSL for data connections. The powershell script uses `$request.EnableSsl = $true` to prevent `(425) Can't open data connection` errors.
    *   **Remote Path:** Do NOT deploy to the FTP root (`/`). You must supply `-RemotePath "/svavel.se/public_html"` to ensure the files land in the correct mapped loopia public directory.

## 5. Repository Size Constraints
*   **Crucial Rule:** Following the 2026 repository compression (which reduced size from ~769MB to ~200MB), the project footprint must be kept strictly minimal.
*   **Media Handling:** All images and media must be appropriately compressed before committing. Do not add raw, uncompressed files to the repository. Use available powershell scripts like `compress_images.ps1` or `compress_more.ps1`.

## Commands and Workflow
*   Always verify UI changes locally in the browser.
*   Leverage existing PowerShell utilities in the repository to format, check sizes, and manage assets before attempting alternative methods.

## 6. Credentials

### Loopia (Kundzon & FTP)
*   **Kundzon Inloggning:** natrium.se
*   **Kundzon Lösenord:** 6fQ3tjTrJguf
*   **FTP Server:** ftpcluster.loopia.se
*   **FTP Användarnamn:** natriumftp
*   **FTP Lösenord:** 6fQ3tjTrJguf

### GitHub
*   **Email:** fredrik.beckman69@gmail.com
*   **Password:** (Samma som för Google-kontot)

### Meta / Instagram
*   **Email:** fredrik.beckman69@gmail.com
*   **Password:** Autobahn74