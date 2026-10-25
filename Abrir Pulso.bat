@echo off
cd /d "%~dp0"
py -3 scripts\local_server.py --open
if errorlevel 1 pause
