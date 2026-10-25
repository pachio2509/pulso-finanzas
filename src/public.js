let fileHandle=null,lastSignature=null,localSignature=null;
const EMPTY=()=>window.PulsoFiles.normalize({events:[],pending:[]},'');
const INSTALL_PROMPT='Instala mi dashboard personal desde https://github.com/pachio2509/pulso-finanzas. Si no puedes descargar el repositorio, usa el ZIP de Pulso que adjunte. Lee skills/pulso-finanzas/SKILL.md. Detecta si puedes ejecutar y guardar archivos en mi equipo o solo en un entorno temporal. Usa el paquete incluido, conserva mis datos y abre la interfaz. Empieza vacía; la demo debe estar marcada como ficticia. Ayúdame a conectar mi propio Gmail si este chat dispone del conector, con mi autorización. Si no está disponible, guía la importación de CSV, Excel o JSON. No pidas contraseñas ni publiques mis finanzas. Verifica la pantalla y explícame cómo volver a abrirla.';
function currencies(){
 const all=[...new Set(['MXN','USD','EUR',...DATA.events.map(e=>e.currency),...DATA.pending.map(e=>e.currency)])].filter(c=>c!=='UNKNOWN');
 document.querySelector('.currency-tabs').innerHTML=all.map(c=>`<button data-currency="${esc(c)}" aria-pressed="${c===currency}">${esc(c)}</button>`).join('');
 document.querySelectorAll('[data-currency]').forEach(b=>b.onclick=()=>{currency=b.dataset.currency;currencies();renderOverview();FX?.change();});
 const selected=$('filterCurrency').value;$('filterCurrency').innerHTML='<option value="">Todas · sin sumar</option>'+all.map(c=>`<option>${esc(c)}</option>`).join('')+'<option value="UNKNOWN">Sin confirmar</option>';$('filterCurrency').value=selected;
}
function applyData(data,selectDate=false){
 DATA=data;page=0;if(selectDate&&DATA.meta.maxDate)$('day').value=DATA.meta.maxDate;
 if($('detail').open)$('detail').close();
 currencies();renderMeta();renderOverview();renderPending();renderRows();FX?.icons();FX?.change();
}
async function importFile(file){const result=await window.PulsoFiles.readFile(file);applyData(result,true);notice('Archivo leído: '+result.events.length+' movimientos. No se modificó el original.');}
function download(name,text,type='application/json'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function refreshConnected(force=false){
 if(refreshing)return;refreshing=true;
 try{
  if(fileHandle){
   const file=await fileHandle.getFile(),signature=file.lastModified+':'+file.size;
   if(signature!==lastSignature){await importFile(file);lastSignature=signature;}
   $('liveLabel').textContent='Archivo conectado';$('liveNote').textContent='Se revisa el archivo elegido cada 5 segundos mientras esta pestaña está abierta. No hay conexión a Gmail ni bancos.';
  }else if(window.PULSO_LOCAL){
   const response=await fetch('/api/data',{cache:'no-store',signal:AbortSignal.timeout(4000)});if(!response.ok)throw Error('Servidor local no disponible. Abre el lanzador.');
   const text=await response.text();if(text!==localSignature){const data=window.PulsoFiles.normalize(JSON.parse(text),'Archivo privado local');applyData(data,!localSignature);localSignature=text;}
   $('liveLabel').textContent='Copia local conectada';$('liveNote').textContent='El asistente puede actualizar private/data.json. Esta página revisa cambios cada 5 segundos. Gmail requiere una lectura autorizada aparte.';
  }else{
   $('liveLabel').textContent='Solo en este navegador';$('liveNote').textContent='Tus datos viven en esta pestaña. Guarda una copia privada antes de cerrar o recargar. El tema es la única preferencia guardada automáticamente.';
  }
  document.querySelector('.status-dot').classList.remove('offline');
 }catch(e){$('liveLabel').textContent='Revisar conexión';$('liveNote').textContent=e.message;document.querySelector('.status-dot').classList.add('offline');}
 finally{refreshing=false;if(force)$('liveNote').hidden=false;}
}
function demo(){
 const d=today(),month=d.slice(0,7);let i=0;
 const event=(date,description,amount,direction,flow,allocation='personal',curr='MXN')=>({key:'demo-'+(++i),date,description,amount,currency:curr,direction,flow,allocation,state:direction==='incoming'?'received':'paid',source:'Ejemplo ficticio'});
 const events=[
 event(month+'-01','Sueldo de ejemplo',24500,'incoming','income'),event(month+'-02','Renta de ejemplo',6200,'outgoing','expense'),
 event(month+'-03','Supermercado de ejemplo',923.50,'outgoing','expense'),event(month+'-05','Traspaso a ahorro de ejemplo',1700,'outgoing','transfer'),
 event(d,'Servicio freelance de ejemplo',3600,'incoming','income'),event(d,'Comida de ejemplo',185,'outgoing','expense'),
 event(d,'Depósito por identificar de ejemplo',700,'incoming','unknown','unclassified'),event(d,'Salida por aclarar de ejemplo',90,'outgoing','unknown','unclassified'),
 event(d,'Software de negocio de ejemplo',249,'outgoing','expense','business'),event(d,'Suscripción de ejemplo',14,'outgoing','expense','personal','USD')];
 const data=window.PulsoFiles.normalize({events,pending:[{kind:'receivable',key:'demo-cobro',date:null,party:'Cliente de ejemplo',description:'Proyecto ficticio',amount:2400,currency:'MXN',state:'pendiente'},{kind:'renewal',key:'demo-renovacion',date:d,description:'Renovación ficticia',amount:120,currency:'MXN',state:'previsto'}]},'Demo ficticia');
 data.meta.demo=true;data.meta.coverage='Todos los nombres, importes y movimientos de esta demo son ficticios.';fileHandle=null;applyData(data,true);
}
function initPublic(){
 $('installPrompt').value=INSTALL_PROMPT;
 const setup=()=>{$('setup').showModal();};
 $('showGuide').onclick=e=>{e.preventDefault();setup();};$('startGuide').onclick=setup;$('closeSetup').onclick=()=>$('setup').close();
 $('startImport').onclick=importClick;$('demoButton').onclick=demo;
 $('copyPrompt').onclick=async()=>{try{await navigator.clipboard.writeText(INSTALL_PROMPT);$('copyPrompt').textContent='Copiado';}catch{$('installPrompt').focus();$('installPrompt').select();$('copyPrompt').textContent='Seleccionado: copia el texto';}};
 $('downloadTemplate').onclick=()=>download('plantilla-pulso.csv','fecha,descripcion,importe,moneda,direccion,estado,clase de flujo,asignacion,clave de deduplicación,notas\n','text/csv;charset=utf-8');
 $('connectFile').onclick=async()=>{if(!window.showOpenFilePicker){notice('Este navegador permite importar archivos, pero no seguirlos automáticamente. Usa Importar actualización, o Chrome/Edge para conectar uno.');return;}try{const [handle]=await showOpenFilePicker({multiple:false,types:[{description:'Datos financieros',accept:{'application/json':['.json'],'text/csv':['.csv'],'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx']}}]});fileHandle=handle;lastSignature=null;await refreshConnected(true);}catch(e){if(e.name!=='AbortError')notice(e.message);}};
 $('exportData').onclick=()=>download('pulso-privado-'+today()+'.json',JSON.stringify(DATA,null,2));
 $('clearData').onclick=()=>{if(confirm('¿Vaciar los datos de esta pestaña? El archivo original no se borra. Guarda una copia antes si la necesitas.')){fileHandle=null;window.PULSO_LOCAL=false;applyData(EMPTY());notice('Sesión vacía. No se borró ningún archivo.');refreshConnected();}};
 currencies();
}

