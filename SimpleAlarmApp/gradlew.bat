@ECHO OFF

SETLOCAL

set DIR=%~dp0
IF "%DIR%" == "" SET DIR=.
SET APP_BASE_NAME=%~n0
SET APP_HOME=%DIR%

set CLASSPATH=

set DEFAULT_JVM_OPTS=

IF EXIST "%JAVA_HOME%\bin\java.exe" goto findJavaFromJavaHome

echo ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
goto fail

:findJavaFromJavaHome
set JAVA_EXE=%JAVA_HOME%\bin\java.exe

IF EXIST "%JAVA_EXE%" goto init

echo ERROR: JAVA_HOME is set to an invalid directory: %JAVA_HOME%
goto fail

:init
SET CMD_LINE_ARGS=
:execute
"%JAVA_EXE%" %DEFAULT_JVM_OPTS% %JAVA_OPTS% %GRADLE_OPTS% "-Dorg.gradle.appname=%APP_BASE_NAME%" -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %CMD_LINE_ARGS%
goto end

:fail
REM Set variable GRADLE_EXIT_CONSOLE if you need the _script_ return code instead of
REM the _cmd.exe /c_ return code!
IF NOT "%GRADLE_EXIT_CONSOLE%"=="" EXIT /B 1
EXIT /B 1

:end
ENDLOCAL

:omega
