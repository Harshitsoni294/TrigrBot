# Deployment Script for Vercel
# Run this in PowerShell

Write-Host "=== AI Test Assistant - Vercel Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
}

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Make sure your .env file contains:" -ForegroundColor Yellow
    Write-Host "  MONGODB_URI=your_mongodb_uri" -ForegroundColor Yellow
    Write-Host "  GEMINI_API_KEY=your_api_key" -ForegroundColor Yellow
    Write-Host ""
}

# Check if vercel is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Vercel CLI not found. Install it? (Y/N)" -ForegroundColor Yellow
    $install = Read-Host
    if ($install -eq "Y" -or $install -eq "y") {
        npm install -g vercel
    }
}

Write-Host ""
Write-Host "Choose deployment method:" -ForegroundColor Cyan
Write-Host "1. Deploy via GitHub + Vercel Dashboard (Recommended)" -ForegroundColor White
Write-Host "2. Deploy via Vercel CLI" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "=== GitHub Deployment ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Step 1: Commit your changes" -ForegroundColor Yellow
    git add .
    git status
    Write-Host ""
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Deploy to Vercel"
    }
    git commit -m $commitMsg
    
    Write-Host ""
    Write-Host "Step 2: Push to GitHub" -ForegroundColor Yellow
    Write-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git):"
    $repoUrl = Read-Host
    
    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        git remote remove origin -ErrorAction SilentlyContinue
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        
        Write-Host ""
        Write-Host "✓ Code pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 3: Deploy on Vercel" -ForegroundColor Yellow
        Write-Host "1. Go to https://vercel.com/new" -ForegroundColor White
        Write-Host "2. Import your GitHub repository" -ForegroundColor White
        Write-Host "3. Add environment variables:" -ForegroundColor White
        Write-Host "   - MONGODB_URI" -ForegroundColor Gray
        Write-Host "   - GEMINI_API_KEY" -ForegroundColor Gray
        Write-Host "4. Click Deploy" -ForegroundColor White
        Write-Host ""
        Write-Host "Open browser? (Y/N)" -ForegroundColor Yellow
        $openBrowser = Read-Host
        if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
            Start-Process "https://vercel.com/new"
        }
    }
}
elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "=== Vercel CLI Deployment ===" -ForegroundColor Cyan
    Write-Host ""
    vercel
}
else {
    Write-Host "Invalid choice!" -ForegroundColor Red
}

Write-Host ""
Write-Host "✓ Deployment script completed!" -ForegroundColor Green
Write-Host "For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
