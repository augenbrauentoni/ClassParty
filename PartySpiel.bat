@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>nul
title PartySpiel - Class Party Online

echo ===================================================================
echo   PARTY-SPIEL - 2D Mario-Party-Brettspiel fuer die Klasse
echo   (100%% Online-Multiplayer ueber Browser / Einladungs-Link)
echo ===================================================================
echo.
echo Arbeitsverzeichnis: %CD%
echo.

REM 1. Pruefe Node.js Pfade
echo [1/3] Pruefe Node.js Installation...

where node >nul 2>nul
if %ERRORLEVEL% equ 0 goto :node_found

REM Versuche gaengige Installationspfade
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
    goto :node_found
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
    goto :node_found
)
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
    goto :node_found
)

REM Falls als Admin gestartet, versuche Benutzerordner
for /f "tokens=*" %%u in ('echo %USERPROFILE%') do (
    if exist "%%u\AppData\Local\Programs\nodejs\node.exe" (
        set "PATH=%%u\AppData\Local\Programs\nodejs;%PATH%"
        goto :node_found
    )
)

:node_not_found
echo.
echo ===================================================================
echo  [FEHLER] Node.js konnte nicht gefunden werden!
echo  Bitte installiere Node.js von https://nodejs.org/ (LTS-Version).
echo ===================================================================
echo.
echo Druecke eine beliebige Taste, um das Fenster zu schliessen...
pause >nul
exit /b 1

:node_found
for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo Node.js gefunden: %NODE_VER%
echo.

REM 2. Pruefe ob PartySpiel.js vorhanden ist
if exist "PartySpiel.js" goto :file_found

echo ===================================================================
echo  [FEHLER] PartySpiel.js wurde nicht im Ordner gefunden:
echo  %CD%
echo ===================================================================
echo.
echo Druecke eine beliebige Taste, um das Fenster zu schliessen...
pause >nul
exit /b 1

:file_found

REM 3. Pruefe node_modules
echo [2/3] Pruefe Bibliotheken...
if exist "node_modules\" goto :modules_ok

echo Installiere benoetigte Bibliotheken via npm install...
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo ===================================================================
    echo  [FEHLER] Paket-Installation fehlgeschlagen!
    echo ===================================================================
    echo.
    echo Druecke eine beliebige Taste, um das Fenster zu schliessen...
    pause >nul
    exit /b 1
)

:modules_ok
echo Bibliotheken sind einsatzbereit.
echo.

REM 4. Server Startmodus (Zifferneingabe sauber verarbeiten)
set "START_MODE=1"

if not "%~1"=="" goto :check_arg

echo [3/3] Waehle den Start-Modus:
echo ===================================================================
echo   [1] Weltweiter Online-Internet-Modus (Standard - Ueberall spielbar)
echo   [2] Nur Lokales Netzwerk (Offline / ohne Internet-Tunnel)
echo ===================================================================
echo.
set "USER_INPUT=1"
set /p "USER_INPUT=Auswahl eingeben [1 oder 2, danach Enter - Standard: 1]: "
if "%USER_INPUT%"=="2" set "START_MODE=2"
if "%USER_INPUT%"==" 2" set "START_MODE=2"
if "%USER_INPUT%"=="2 " set "START_MODE=2"
goto :launch_server

:check_arg
if "%~1"=="2" set "START_MODE=2"
if "%~1"=="--local" set "START_MODE=2"
if "%~1"=="--no-tunnel" set "START_MODE=2"
if "%~1"=="local" set "START_MODE=2"
if "%~1"=="1" set "START_MODE=1"
if "%~1"=="--tunnel" set "START_MODE=1"
if "%~1"=="online" set "START_MODE=1"

:launch_server

echo.
if "%START_MODE%"=="2" goto :start_local

echo ===================================================================
echo   Starte PartySpiel im Online-Internet-Modus...
echo   (Weltweit fuer Mitschueler ueber Internet & MS Teams erreichbar)
echo   Der Browser oeffnet sich automatisch.
echo ===================================================================
echo.
node PartySpiel.js
goto :server_finished

:start_local
echo ===================================================================
echo   Starte PartySpiel im Lokalen Offline-Modus...
echo   (Nur dieser PC und Geraete im selben WLAN)
echo   Der Browser oeffnet sich automatisch.
echo ===================================================================
echo.
node PartySpiel.js --no-tunnel

:server_finished

set "SERVER_EXIT=%ERRORLEVEL%"
echo.
echo ===================================================================
echo  PartySpiel Server wurde beendet (Exit-Code: %SERVER_EXIT%).
echo ===================================================================
echo.
echo Druecke eine beliebige Taste, um das Fenster zu schliessen...
pause >nul