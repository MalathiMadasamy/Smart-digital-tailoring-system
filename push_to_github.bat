@echo off
echo ===================================================
echo Pushing Smart Digital Tailoring System to GitHub...
echo ===================================================

cd /d "%~dp0"

git status
git add .
git commit -m "Fix Vercel production build imports and finalize deployment"
git push origin main

echo.
echo ===================================================
echo Done! Changes pushed to GitHub successfully.
echo ===================================================
pause
