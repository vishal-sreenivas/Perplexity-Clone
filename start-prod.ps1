# Start Production Server
# Run this file with: .\start-prod.ps1
# Note: You must run .\build.ps1 first!

Write-Host "Starting Perplexity AI Clone Production Server..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the project directory
Set-Location $scriptPath

# Add node_modules/.bin to PATH
$env:Path = "$scriptPath\node_modules\.bin;" + $env:Path

Write-Host "Project Directory: $scriptPath" -ForegroundColor Green
Write-Host ""

# Check if .next directory exists
if (-not (Test-Path ".next")) {
    Write-Host "Error: Build directory not found!" -ForegroundColor Red
    Write-Host "Please run .\build.ps1 first to build the application." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Start Next.js production server
Write-Host "Starting Next.js production server..." -ForegroundColor Yellow
Write-Host "The app will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Magenta
Write-Host ""

node ./node_modules/next/dist/bin/next start
