@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "PORT_FRONT=5173"
set "PORT_BACK=3000"

echo ==========================================
echo   Music Guessr - Iniciando prototipo web
echo ==========================================

if not exist "%ROOT%\node_modules" (
  echo Instalando dependencias do frontend...
  call npm install
  if errorlevel 1 goto :error
)

if not exist "%BACKEND%\node_modules" (
  echo Instalando dependencias do backend...
  pushd "%BACKEND%"
  call npm install
  if errorlevel 1 goto :error
  popd
)

echo Iniciando backend em http://localhost:%PORT_BACK% ...
start "" /D "%BACKEND%" cmd /k "npm run dev"

echo Iniciando frontend em http://localhost:%PORT_FRONT% ...
start "" /D "%ROOT%" cmd /k "npm run dev -- --host 0.0.0.0 --port %PORT_FRONT%"

echo Aguardando o frontend subir...
timeout /t 6 /nobreak >nul
start "" "http://localhost:%PORT_FRONT%"

echo.
echo Prototipo iniciado.
echo - Frontend: http://localhost:%PORT_FRONT%
echo - Backend:   http://localhost:%PORT_BACK%
echo.
echo Feche as janelas "Music Guessr API" e "Music Guessr Web" para encerrar.
exit /b 0

:error
echo.
echo Falha ao iniciar o prototipo. Verifique o .env e as dependencias.
exit /b 1