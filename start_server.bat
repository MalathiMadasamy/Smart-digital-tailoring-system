@echo off
title Smart Digital Tailoring System - Server
echo ========================================================
echo   Starting Smart Digital Tailoring System...
echo ========================================================
echo.
cd /d "%~dp0"
echo Running Vite Dev Server on http://localhost:5173...
echo.
start http://localhost:5173
npm run dev
pause
