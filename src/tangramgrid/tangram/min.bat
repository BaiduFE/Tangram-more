echo minify tangram.grid*.js to folder min....
@echo off
set CURRENT_DIR=%cd%
set mindir=%CURRENT_DIR%\min
if exist %mindir%  rd /s /q min
mkdir %mindir%
for %%i in (tangram.grid*.js) do java -jar %cd%\yuicompressor-2.4.6.jar --type js -o %cd%\min\%%~ni.min.js %%i
@echo on
echo done!
pause
exit