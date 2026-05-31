@echo off
title VexWard - Iniciando...
echo ============================================
echo        VEXWARD - Iniciando Servicios
echo ============================================
echo.

cd /d "c:\Users\Administrator\Desktop\VexWard"

echo [1/2] Iniciando servidor backend (puerto 3001)...
start "VexWard - Backend" cmd /k "cd /d "c:\Users\Administrator\Desktop\VexWard" && node server.js"

echo [2/2] Iniciando servidor frontend (Vite)...
start "VexWard - Frontend" cmd /k "cd /d "c:\Users\Administrator\Desktop\VexWard" && npm run dev"

echo.
echo ============================================
echo  Ambos servidores se estan iniciando...
echo  - Backend:  http://localhost:3001
echo  - Frontend: http://localhost:5173
echo ============================================
echo.

timeout /t 4 /nobreak >nul
start http://localhost:5173

echo Navegador abierto. Puedes cerrar esta ventana.
timeout /t 3 /nobreak >nul
exit
