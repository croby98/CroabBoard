@echo off
REM Wrapper script - calls the actual start script in docker\scripts\
cd /d "%~dp0"
call docker\scripts\start.bat %*
