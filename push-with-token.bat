@echo off
title Push to GitHub with Token
echo ========================================================
echo        YASRAF Clothing - Push with GitHub Token
echo ========================================================
echo.
echo If you have a GitHub Personal Access Token (classic with 'repo' scope):
echo (Get one at: https://github.com/settings/tokens)
echo.
set /p TOKEN="Paste your GitHub Token here: "

if "%TOKEN%"=="" (
    echo Token cannot be empty.
    pause
    exit /b
)

echo.
echo Pushing to GitHub...
git push https://%TOKEN%@github.com/yasraftextiles-cloud/yasraf.git main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! Changes pushed to GitHub!
    echo  Netlify will automatically build and deploy now!
    echo ========================================================
) else (
    echo ========================================================
    echo  Push failed. Please ensure the token has 'repo' access.
    echo ========================================================
)
echo.
pause
