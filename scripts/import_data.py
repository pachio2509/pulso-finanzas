#!/usr/bin/env python3
"""Validate and install JSON into the private local copy. Original stays unchanged."""
from pathlib import Path
import argparse,json,hashlib,datetime,os

def validate(d):
 if not isinstance(d,dict) or not isinstance(d.get('events'),list):raise ValueError('Se requiere {"events": [...], "pending": [...]}')
 if len(d['events'])>20000:raise ValueError('Máximo 20,000 movimientos.')
 keys=set()
 for i,e in enumerate(d['events']):
  if not isinstance(e,dict) or not isinstance(e.get('description'),str) or not e['description'].strip():raise ValueError('Falta description en evento '+str(i+1))
  key=e.get('key')
  if not isinstance(key,str) or not key.strip() or key in keys:raise ValueError('Cada evento requiere key única y estable.');
  keys.add(key)
  amount=e.get('amount')
  if amount is not None and (isinstance(amount,bool) or not isinstance(amount,(int,float)) or not 0<=amount<=1e12):raise ValueError('Importe no válido.')
  if e.get('date') is not None:datetime.date.fromisoformat(e['date'])
  if e.get('currency') not in ('UNKNOWN',None) and (not isinstance(e['currency'],str) or len(e['currency'])!=3 or not e['currency'].isupper()):raise ValueError('Usa moneda ISO de tres letras o UNKNOWN.')
 pending=d.get('pending',[])
 if not isinstance(pending,list) or len(pending)>20000:raise ValueError('Pendientes inválidos.')
 seen=set()
 for item in pending:
  if not isinstance(item,dict) or item.get('kind') not in ('receivable','payable','renewal'):raise ValueError('Tipo de pendiente inválido.')
  key=item.get('key')
  if not isinstance(key,str) or not key.strip() or key in seen:raise ValueError('Clave de pendiente inválida o repetida.')
  seen.add(key)
  amount=item.get('amount')
  if amount is not None and (isinstance(amount,bool) or not isinstance(amount,(int,float)) or not 0<=amount<=1e12):raise ValueError('Importe de pendiente inválido.')
  if item.get('date') is not None:datetime.date.fromisoformat(item['date'])
 return d

def install(source,destination,replace=False):
 raw=source.read_bytes()
 if len(raw)>10_000_000:raise ValueError('Máximo 10 MB.')
 data=validate(json.loads(raw));destination.parent.mkdir(parents=True,exist_ok=True)
 if destination.exists():
  old=destination.read_bytes()
  if old==raw:return 'Sin cambios.'
  previous=json.loads(old)
  oldkeys={e.get('key') for e in previous.get('events',[])};newkeys={e['key'] for e in data['events']}
  if oldkeys-newkeys and not replace:raise ValueError('Faltan registros que ya existían. Concílialos o usa --replace solo si deseas sustituirlos; se conservará copia.')
  backups=destination.parent/'backups';backups.mkdir(exist_ok=True)
  backup=backups/(destination.stem+'-'+hashlib.sha256(old).hexdigest()[:12]+'.json')
  if not backup.exists():backup.write_bytes(old)
 temp=destination.with_suffix('.tmp');temp.write_bytes(raw);os.replace(temp,destination)
 return str(len(data['events']))+' movimientos instalados en '+str(destination)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('source',type=Path);p.add_argument('--destination',type=Path,default=Path(__file__).resolve().parents[1]/'private'/'data.json');p.add_argument('--replace',action='store_true');a=p.parse_args()
 try:print(install(a.source,a.destination,a.replace))
 except (ValueError,OSError) as e:raise SystemExit(str(e))
