@echo off
title Smart Digital Tailoring System - Create ZIP
echo ========================================================
echo   Compressing Smart Digital Tailoring System into ZIP...
echo ========================================================
echo.
cd /d "%~dp0"
powershell -Command "Compress-Archive -Path '.\*' -DestinationPath '..\Smart-Digital-Tailoring-System-Fixed.zip' -Force"
echo.
echo ========================================================
echo ✓ ZIP File Created Successfully!
echo Saved File: Smart-Digital-Tailoring-System-Fixed.zip
echo ========================================================
pause
