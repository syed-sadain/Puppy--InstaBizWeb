@echo off
rem One-click launcher for the TeddyPups local website mirror.
cd /d "%~dp0"
echo Starting local site at http://localhost:4173/  (close this window to stop)
start "" http://localhost:4173/
node server.mjs
pause
