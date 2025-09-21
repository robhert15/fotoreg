@echo off
REM --- Script de Backup Inteligente para FotoReg ---
REM --- Autor: Arquitecto AURA ---

REM --- 1. OBTENER FECHA Y HORA ---
FOR /f "tokens=2 delims==" %%I IN ('wmic os get LocalDateTime /value') DO set "dt=%%I"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "MIN=%dt:~10,2%"
set "SEC=%dt:~12,2%"
set "TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MIN%%SEC%"

REM --- 2. DEFINIR CARPETAS ---
set "SOURCE_FOLDER=E:\proyectos\fotoreg"
set "DESTINATION_FOLDER=E:\proyectos\fotoreg_backup_%TIMESTAMP%"

echo.
echo Creando copia de seguridad INTELIGENTE...
echo.
echo    Origen: %SOURCE_FOLDER%
echo   Destino: %DESTINATION_FOLDER%
echo.
echo Excluyendo carpetas innecesarias...
echo.

REM --- 3. EJECUTAR LA COPIA ---
REM Se ejecuta robocopy con el modificador /XD para EXCLUIR directorios.
REM Añadimos las carpetas que no necesitamos en el backup.
robocopy "%SOURCE_FOLDER%" "%DESTINATION_FOLDER%" /E /COPY:DAT /R:2 /W:5 /XD node_modules .expo .vscode android

echo.
echo -----------------------------------------------------------
echo --- Copia de seguridad completada ---
echo --- Destino: %DESTINATION_FOLDER% ---
echo -----------------------------------------------------------
echo.
pause