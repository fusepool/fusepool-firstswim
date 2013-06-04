@echo off
echo Delete output folder (if exists)
if exist "output" rmdir /s /q "output"
echo Generating new output...
call jsdoc/jsdoc ../src/main/resources/META-INF/resources/firstswim/javascript/controller -r  -d output
echo Generating was success!
pause