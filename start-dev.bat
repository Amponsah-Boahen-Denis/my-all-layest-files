@echo off
echo 🚀 Starting Next.js development server...
echo 📁 Current directory: %CD%

REM Check if package.json exists
if exist "package.json" (
    echo ✅ Found package.json, starting development server...
    npm run dev
) else (
    echo ❌ package.json not found in current directory
    echo Please run this script from the my-app directory
    echo Current directory: %CD%
    echo Expected: my-app directory with package.json
    pause
) 