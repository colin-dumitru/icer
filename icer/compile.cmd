ECHO OFF

SET files=

for /r %%I in (*.ts) do (
	call :APP %%I
)

ECHO Files: %files%
ECHO -
ECHO Compilling...
tsc --sourcemap %files%
ECHO Done

GOTO :EOF

:APP
SET files=%files% %1%
:EOF