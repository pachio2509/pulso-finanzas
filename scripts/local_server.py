#!/usr/bin/env python3
"""On-demand localhost only. No app account, telemetry or automatic external connections."""
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse,json,urllib.request,webbrowser

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/'docs'/'index.html'
if not HTML.exists():HTML=ROOT/'assets'/'Dashboard.html'

def main():
 p=argparse.ArgumentParser(description='Abre Pulso solo en este equipo.')
 p.add_argument('--port',type=int,default=8766);p.add_argument('--open',action='store_true');p.add_argument('--data',type=Path,default=ROOT/'private'/'data.json');a=p.parse_args()
 source=a.data.expanduser().resolve();source.parent.mkdir(parents=True,exist_ok=True)
 if not source.exists():source.write_text('{"events":[],"pending":[]}',encoding='utf8')
 url='http://127.0.0.1:'+str(a.port)
 class Handler(BaseHTTPRequestHandler):
  def log_message(self,*args):pass
  def do_GET(self):
   if self.headers.get('Host') not in ('127.0.0.1:'+str(a.port),'localhost:'+str(a.port)):
    self.send_error(403);return
   route=self.path.split('?')[0]
   if route=='/api/status':body=json.dumps({'app':'pulso-local-v1','dataPath':str(source)}).encode();typ='application/json'
   elif route=='/api/data':
    try:
     body=source.read_bytes()
     if len(body)>10_000_000:raise ValueError()
     json.loads(body);typ='application/json'
    except Exception:self.send_error(400,'Revisa el archivo privado');return
   elif route=='/':body=HTML.read_text().replace('<!-- LOCAL_BOOT -->','<script>window.PULSO_LOCAL=true;</script>').encode();typ='text/html; charset=utf-8'
   elif route=='/favicon.ico':self.send_response(204);self.end_headers();return
   else:self.send_error(404);return
   self.send_response(200);self.send_header('Content-Type',typ);self.send_header('Content-Length',str(len(body)));self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');self.send_header('X-Frame-Options','DENY');self.send_header('Referrer-Policy','no-referrer');self.end_headers();self.wfile.write(body)
 try:server=ThreadingHTTPServer(('127.0.0.1',a.port),Handler)
 except OSError:
  try:
   status=json.loads(urllib.request.urlopen(url+'/api/status',timeout=2).read())
   if status.get('app')!='pulso-local-v1' or status.get('dataPath')!=str(source):raise ValueError()
   if a.open:webbrowser.open(url)
   print('Pulso ya está abierto: '+url);return
  except Exception:raise SystemExit('Puerto ocupado. Prueba --port 8767; no se reemplazó el servidor existente.')
 print('Pulso: '+url+'\nConserva esta ventana abierta mientras lo usas. Ctrl+C lo detiene.',flush=True)
 if a.open:webbrowser.open(url)
 try:server.serve_forever()
 except KeyboardInterrupt:pass
 finally:server.server_close()
if __name__=='__main__':main()
