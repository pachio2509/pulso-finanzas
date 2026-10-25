#!/bin/zsh
cd -- "${0:A:h}"
if command -v python3 >/dev/null 2>&1; then
 python3 scripts/local_server.py --open
else
 echo 'Instala Python 3 desde python.org o abre docs/index.html para importar datos manualmente.'
 read '?Pulsa Intro para cerrar.'
fi
