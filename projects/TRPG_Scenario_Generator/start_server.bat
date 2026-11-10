@echo off
cd /d %~dp0
echo Starting TRPG Scenario Generator API Server...
venv\Scripts\python.exe -u scenario_generator.py --server > server_stdout.log 2>&1
