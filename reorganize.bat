@echo off
echo ==========================================
echo Project Reorganization Script
echo Moving frontend files to frontend/ folder...
echo ==========================================

mkdir frontend

move package.json frontend\
move package-lock.json frontend\
move vite.config.js frontend\
move index.html frontend\

REM Rename old root .env to avoid conflicts, we will create a clean one for frontend
if exist .env move .env frontend\.env.backup
if exist .env.example move .env.example frontend\
move new_frontend_env.txt frontend\.env

move src frontend\
move public frontend\
move dist frontend\
move node_modules frontend\

echo.
echo ==========================================
echo Reorganization complete!
echo Please verify the frontend/ and backend/ folders.
echo ==========================================
pause
