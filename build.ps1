# Build Script for Production
# Run this file with: .\build.ps1

Write-Host "Building Perplexity AI Clone for Production..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the project directory
Set-Location $scriptPath

# Add node_modules/.bin to PATH
$env:Path = "$scriptPath\node_modules\.bin;" + $env:Path

Write-Host "Project Directory: $scriptPath" -ForegroundColor Green
Write-Host ""

# Build the application
Write-Host "Building the application..." -ForegroundColor Yellow
node ./node_modules/next/dist/bin/next build

Write-Host ""
Write-Host "Build completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the production server, run: .\start-prod.ps1" -ForegroundColor Cyan
