@echo off
setlocal
chcp 65001 >nul

set "ROOT_DIR=%~dp0"
set "APP_DIR=%ROOT_DIR%弹珠姻缘"

cd /d "%APP_DIR%"
if errorlevel 1 (
  echo Cannot enter app directory: %APP_DIR%
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js first:
  echo https://nodejs.org/
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)

echo Starting marble CP dev server...
echo Open http://localhost:3000
call npm run dev
