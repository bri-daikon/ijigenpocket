@echo off
cd /d "%~dp0"

echo Installing required libraries...
pip install -q flask werkzeug

echo Starting browser...
start http://127.0.0.1:5000

echo Starting File Sorter...
python app.py

pause
