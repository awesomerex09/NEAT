@echo off
chcp 65001 >nul
echo ----------------------------------------------------
echo Coach System Auto Update and Deploy Tool
echo ----------------------------------------------------
echo.
echo Executing deploy script from admin-server...
cd /d "%~dp0admin-server"
node scripts/deploy.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Deploy failed. Please check the error messages above.
) else (
    echo.
    echo ✅ Deploy completed successfully!
)
pause
