@echo off
echo --- Iniciando configuracion de Git para el proyecto ---

:: Verificar si git esta instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta instalado o no se encuentra en el PATH.
    echo Por favor instala Git desde: https://git-scm.com/download/win
    echo Y vuelve a ejecutar este script.
    pause
    exit /b
)

:: Inicializar repositorio
if not exist .git (
    echo [INFO] Creando repositorio nuevo...
    git init
    git branch -M main
) else (
    echo [INFO] El repositorio ya existe. Descartando cambios y volviendo a agregar archivos...
)

:: Agregar archivos
echo [INFO] Agregando archivos al control de versiones...
git add .

:: Commit inicial
echo [INFO] Guardando primera version (commit)...
git commit -m "Primera version beta del Dashboard de Energia"

echo.
echo [EXITO] Tu proyecto esta listo localmente.
echo.
echo AHORA SIGUE ESTOS PASOS EN GITHUB:
echo 1. Crea un repo vacio en https://github.com/new
echo 2. Copia las 2 lineas que aparecen bajo "...or push an existing repository from the command line"
echo 3. Pegalas aqui abajo y presiona Enter.
echo.
cmd /k
