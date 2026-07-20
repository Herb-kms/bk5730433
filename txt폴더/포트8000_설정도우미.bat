@echo off
:: Admin check
net sessions >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run as Administrator!
    pause
    exit /b
)

set HOSTS_PATH=%WINDIR%\System32\drivers\etc\hosts
:: Add '8000' as a local domain for 127.0.0.1
findstr /C:"127.0.0.1 8000" %HOSTS_PATH% >nul
if %errorLevel% neq 0 (
    echo. >> %HOSTS_PATH%
    echo 127.0.0.1 8000 >> %HOSTS_PATH%
    echo [8000] domain added successfully.
)

echo.
echo SUCCESS!
echo You can now access via: http://8000:8000 or http://localhost:8000
echo.
echo For ngrok, use: npx ngrok http 8000
pause
