@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Antigravity Auto Clicker

echo Starting Antigravity Auto Clicker...
echo.

python gui_clicker.py
if errorlevel 1 (
    echo.
    echo Trying with 'py' launcher...
    py -3 gui_clicker.py
)

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start. Please check if Python is installed and added to PATH.
    pause
)
