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

git.exe push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! Tamam files GitHub par upload ho chuki hain!
    echo ========================================================
) else (
    echo ========================================================
    echo  Kuch masla hua. Baraye meharbani upar ka error check karein.
    echo ========================================================
)
echo.
pause
