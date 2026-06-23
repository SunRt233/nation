@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "C:\Obsidion\妙妙屋\11-模板\scripts\render-docx.ps1" %* -EmitPdf
set EXIT_CODE=%ERRORLEVEL%
if not "%EXIT_CODE%"=="0" pause
exit /b %EXIT_CODE%
