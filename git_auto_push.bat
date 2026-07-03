@echo off
echo ===================================================
echo   [China1k] Git Auto Push Script (Upload)
echo ===================================================
echo.

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set TIMESTAMP=%%i

echo [1/3] Staging all files (git add .)...
git add .
if errorlevel 1 (
    echo [ERROR] Failed to run git add.
    goto :error
)

echo [2/3] Creating commit...
echo Commit message: [Auto-Sync] %TIMESTAMP%
git commit -m "[Auto-Sync] %TIMESTAMP% Auto backup and sync"
if errorlevel 1 (
    echo [NOTICE] No new changes to commit. Proceeding to push existing commits...
)

echo.
echo [3/3] Pushing to GitHub remote (origin main)...
git push origin main
if errorlevel 1 (
    echo [ERROR] Failed to push to origin main. Please check network or permissions.
    goto :error
)

echo.
echo ===================================================
echo   [SUCCESS] All files uploaded to GitHub!
echo   Completed at: %TIMESTAMP%
echo ===================================================
goto :end

:error
echo.
echo ===================================================
echo   [FAILED] Error occurred during upload.
echo ===================================================

:end
echo.
pause
