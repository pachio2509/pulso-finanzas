#!/usr/bin/env python3
from pathlib import Path
import argparse,shutil
p=argparse.ArgumentParser(description='Copia la skill Pulso; no instala conectores ni credenciales.')
p.add_argument('--target',choices=['codex','claude'],default='codex');p.add_argument('--destination',type=Path);a=p.parse_args()
source=Path(__file__).resolve().parents[1]/'skills'/'pulso-finanzas'
destination=(a.destination or Path.home()/('.codex' if a.target=='codex' else '.claude')/'skills'/'pulso-finanzas').expanduser()
if destination.exists():raise SystemExit('La carpeta ya existe. No se sobrescribió: '+str(destination))
shutil.copytree(source,destination)
print('Skill instalada: '+str(destination)+'\nInvócala en una nueva sesión. No se crearon credenciales ni conexiones.')
