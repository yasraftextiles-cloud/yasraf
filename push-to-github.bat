@echo off
title Push YASRAF Clothing to GitHub
set "PATH=%LOCALAPPDATA%\Programs\mingit\cmd;%LOCALAPPDATA%\Programs\mingit\mingw64\bin;%PATH%"

echo ========================================================
echo        YASRAF Clothing - Push to GitHub
echo ========================================================
echo.
echo Connecting to GitHub repository...
echo Remote: https://github.com/yasraftextiles-cloud/yasraf.git
echo.

git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All changes have been pushed to GitHub!
    echo ========================================================
) else (
    echo ========================================================
    echo  Authentication required or error occurred.
    echo  Please check the message above and sign in to GitHub.
    echo ========================================================
)
echo.
pause
