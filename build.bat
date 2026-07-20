@echo off
REM Leallitja a futo mislenydash appot, majd tisztan ujraepiti es elinditja.
REM
REM FONTOS: csak a megadott porton (alap: 3000) LISTENING allapotban futo
REM folyamatot allitja le a PID-je alapjan. Szandekosan NEM hasznal
REM "taskkill /IM node.exe" parancsot, mert az minden node folyamatot leallitana,
REM koztuk a Claude Code munkafolyamatot is. Igy az erintetlen marad.

setlocal
if "%PORT%"=="" set PORT=3000

echo === Futo app leallitasa a(z) %PORT% porton ===
set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do (
    echo   Leallitas - PID %%p
    taskkill /PID %%p /F >nul 2>&1
    set FOUND=1
)
if "%FOUND%"=="0" echo   Nem futott app a(z) %PORT% porton.

echo === Fuggosegek telepitese ===
call npm install
if errorlevel 1 goto :error

echo === Regi build torlese (tiszta build) ===
if exist ".next" rmdir /s /q ".next"

echo === Build ===
call npm run build
if errorlevel 1 goto :error

echo === Inditas (%PORT% port) ===
call npm run start
if errorlevel 1 goto :error

goto :eof

:error
echo.
echo Hiba tortent (exit code: %errorlevel%). A folyamat leallt.
exit /b %errorlevel%
