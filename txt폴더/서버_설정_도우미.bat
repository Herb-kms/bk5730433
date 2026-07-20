@echo off
:: Admin check
net sessions >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run this file as Administrator!
    echo [Right click] -> [Run as administrator]
    pause
    exit /b
)

:: Set current server port
set PORT=8000
set HOSTS_PATH=%WINDIR%\System32\drivers\etc\hosts

echo.
echo =====================================================
echo    OfficeMart Local Server Setup Helper
echo =====================================================
echo.

:: Add localhost entry if missing
findstr /C:"127.0.0.1 localhost" %HOSTS_PATH% >nul
if %errorLevel% neq 0 (
    echo 127.0.0.1 localhost >> %HOSTS_PATH%
    echo [OK] localhost registered.
)

:: Add 8000 as a domain for easy access
findstr /C:"127.0.0.1 8000" %HOSTS_PATH% >nul
if %errorLevel% neq 0 (
    echo 127.0.0.1 8000 >> %HOSTS_PATH%
    echo [OK] '8000' registered as a local domain.
)

:: Add copy_Mart as a domain
findstr /C:"127.0.0.1 www.copy_Mart.com" %HOSTS_PATH% >nul
if %errorLevel% neq 0 (
    echo 127.0.0.1 www.copy_Mart.com >> %HOSTS_PATH%
    echo [OK] 'www.copy_Mart.com' registered.
)

echo.
echo [COMPLETE] All local domains are set!
echo.
echo - PC Access: http://localhost:%PORT% or http://8000:%PORT%
echo - External: npx ngrok http %PORT%
echo.
pause
