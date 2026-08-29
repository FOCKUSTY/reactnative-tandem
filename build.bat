@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Building release APK
echo ==========================================

echo.
echo [1/3] Running npx expo prebuild...
call npx expo prebuild
if %errorlevel% neq 0 (
    echo ❌ prebuild failed with error %errorlevel%
    exit /b %errorlevel%
)

echo.
echo [2/3] Changing directory to android...
cd android
if %errorlevel% neq 0 (
    echo ❌ Failed to enter android folder
    exit /b %errorlevel%
)

echo.
echo [3/3] Running gradlew assembleRelease...
call .\gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo ❌ assembleRelease failed with error %errorlevel%
    exit /b %errorlevel%
)

echo.
echo ✅ Build completed successfully!
echo APK is located at: android\app\build\outputs\apk\release\
pause