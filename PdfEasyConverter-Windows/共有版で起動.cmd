@echo off
setlocal
set "SHARED_EXE=\\LS210D46A\share\ijigenpocket\PdfEasyConverter-Windows\PdfEasyConverter.exe"

if exist "%SHARED_EXE%" (
  start "" "%SHARED_EXE%" %*
  exit /b 0
)

echo 共有フォルダーに接続できないため、同梱のローカル版を起動します。
start "" "%~dp0PdfEasyConverter.exe" %*
exit /b 0
