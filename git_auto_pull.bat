@echo off
echo ===================================================
echo   [China1k] Git Auto Pull Script (Download)
echo ===================================================
echo.

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set TIMESTAMP=%%i

echo [1/1] Downloading latest changes from GitHub (origin main)...
git pull origin main
if errorlevel 1 (
    echo.
    echo ===================================================
    echo   [ERROR] Failed to run git pull.
    echo   Please check for merge conflicts or network connection.
    echo ===================================================
    goto :end
)

echo.
echo ===================================================
echo   [SUCCESS] Latest code downloaded and applied!
echo   Completed at: %TIMESTAMP%
echo ===================================================

:end
echo.
pause
