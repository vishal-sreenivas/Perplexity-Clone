# Quick Start Script for Development Server
# Run this file with: .\start-dev.ps1

Write-Host "Starting Perplexity AI Clone Development Server..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory and change to it safely
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Use LiteralPath to avoid interpretation of special characters like &
Set-Location -LiteralPath $scriptPath

Write-Host "Project Directory: $scriptPath" -ForegroundColor Green
Write-Host "Note: Do NOT double-click this script from Explorer. Run it from PowerShell." -ForegroundColor Yellow

Write-Host "Checking Node and npm availability..." -ForegroundColor Cyan
try {
	$nodeVersion = & node -v 2>$null
	$npmVersion = & npm -v 2>$null
	Write-Host "node: $nodeVersion" -ForegroundColor Green
	Write-Host "npm:  $npmVersion" -ForegroundColor Green
} catch {
	Write-Host "Node or npm not found in PATH. Please install Node.js (https://nodejs.org) and re-open PowerShell." -ForegroundColor Red
	exit 1
}
Write-Host ""

# Start Next.js dev server
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow
Write-Host "The app will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Magenta
Write-Host ""

# If node_modules is missing, run npm install first
if (-Not (Test-Path (Join-Path $scriptPath 'node_modules'))) {
	Write-Host "node_modules not found. Running 'npm install'..." -ForegroundColor Yellow
	& npm install
	if ($LASTEXITCODE -ne 0) {
		Write-Host "'npm install' failed. Inspect the npm output above for errors." -ForegroundColor Red
		exit $LASTEXITCODE
	}
}

# Start the dev server via npm script using PowerShell call operator so output appears inline
Write-Host "Launching: npm run dev (output will appear below)" -ForegroundColor Yellow
try {
	& npm run dev
} catch {
	Write-Host "Failed to launch 'npm run dev' via PowerShell. You can try running it manually:" -ForegroundColor Red
	Write-Host "  Set-Location -LiteralPath '$scriptPath'" -ForegroundColor Yellow
	Write-Host "  npm run dev" -ForegroundColor Yellow
	throw $_
}
