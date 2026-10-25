#!/usr/bin/env python3
"""Whitelist distribution: never packages private files, dependencies or Git history."""
from pathlib import Path
import zipfile,hashlib,json
ROOT=Path(__file__).resolve().parents[1]
NAMES=['README.md','COPIAR-Y-PEGAR.txt','LICENSE','.gitignore','package.json','package-lock.json','build.mjs','Abrir Pulso.command','Abrir Pulso.bat','VERIFICACION.md']
FOLDERS=['src','docs','scripts','skills','guides','examples','licenses','tests']
files=[ROOT/n for n in NAMES]
for directory in FOLDERS:
 files.extend(p for p in (ROOT/directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix!='.pyc' and p.name!='.DS_Store')
for p in files:
 if not p.exists() or p.is_symlink():raise SystemExit('Archivo ausente o enlace no permitido: '+str(p))
files=sorted(set(files));out=ROOT/'release';out.mkdir(exist_ok=True)
def create(name,selected,prefix,relative):
 target=out/name
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
  for p in selected:z.write(p,prefix+str(p.relative_to(relative)))
 return {'file':name,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'files':len(selected)}
kit=create('Pulso-kit-1.0.0.zip',files,'pulso-finanzas/',ROOT)
skillroot=ROOT/'skills'/'pulso-finanzas';skill=create('Pulso-skill-1.0.0.zip',[p for p in files if p.is_relative_to(skillroot)],'pulso-finanzas/',skillroot)
manifest={'artifacts':[kit,skill],'files':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in files}}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest['artifacts'],indent=2))
