@echo off
REM Automatikus commit + push a GitHub repora.
REM Hasznalat:
REM   commit.bat                -> idobelyeges uzenettel commitol
REM   commit.bat Sajat uzenet   -> a megadott uzenettel commitol
REM
REM Elso futtataskor inicializalja a repot es beallitja a remote-ot.
REM A push-hoz GitHub bejelentkezes kell (a Windows Git Credential Manager
REM elso alkalommal felugrik egy bongeszo-ablakot).

setlocal
cd /d "%~dp0"

set REPO=https://github.com/farjan86/MislenyDash.git
set BRANCH=main

REM 1) Repo inicializalasa, ha meg nincs
if not exist ".git" (
    echo === Git repo inicializalasa ===
    git init
    git branch -M %BRANCH%
)

REM 2) Remote beallitasa, ha meg nincs
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo === Remote hozzaadasa: %REPO% ===
    git remote add origin %REPO%
)

REM 3) Commit uzenet: parameter, vagy idobelyeg
set MSG=%*
if "%MSG%"=="" set MSG=Update %date% %time%

echo === Valtozasok hozzaadasa ===
git add -A

REM 4) Commit csak akkor, ha van staged valtozas
git diff --cached --quiet
if errorlevel 1 (
    echo === Commit: %MSG% ===
    git commit -m "%MSG%"
) else (
    echo Nincs commitolando valtozas.
)

REM 5) Push
echo === Push: origin/%BRANCH% ===
git push -u origin %BRANCH%
if errorlevel 1 goto :error

echo.
echo === Kesz. Feltoltve a GitHubra. ===
goto :eof

:error
echo.
echo Hiba a push soran (exit code %errorlevel%).
echo Lehetseges okok: nincs bejelentkezve a GitHubra, vagy a repo mar tartalmaz
echo commitokat (ez esetben eloszor: git pull --rebase origin %BRANCH%).
exit /b %errorlevel%
