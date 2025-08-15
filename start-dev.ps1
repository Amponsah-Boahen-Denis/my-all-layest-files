# PowerShell script to start the Next.js development server
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Green
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if we're in the right directory
if (Test-Path "package.json") {
    Write-Host "✅ Found package.json, starting development server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "❌ package.json not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the my-app directory" -ForegroundColor Yellow
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "Expected: my-app directory with package.json" -ForegroundColor Yellow
} 