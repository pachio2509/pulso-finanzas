import {unzipSync,strFromU8} from 'fflate';
const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const first=(r,...keys)=>{for(const k of keys){if(r[k]!==undefined&&r[k]!==null&&r[k]!=='')return r[k];}return null;};
const maps={
 direction:{entrada:'incoming',ingreso:'incoming',salida:'outgoing',gasto:'outgoing',incoming:'incoming',outgoing:'outgoing'},
 state:{pagado:'paid',paid:'paid',recibido:'received',received:'received',devolucion:'refund',refund:'refund',retenido:'hold',hold:'hold',rechazado:'rejected',rejected:'rejected',facturado:'invoiced'},
 flow:{ingreso:'income',income:'income',gasto:'expense',expense:'expense',traspaso:'transfer',transferencia:'transfer',transfer:'transfer',unknown:'unknown',desconocido:'unknown'},
 allocation:{personal:'personal',business:'business',empresa:'business',empresarial:'business',negocio:'business',other:'other'}
};
export function parseDate(v,excel1904=false){
 if(v==null||v==='')return null;
 if(typeof v==='number'){if(v<0||v>200000)throw Error('Fecha Excel fuera de rango.');return new Date(Date.UTC(excel1904?1904:1899,excel1904?0:11,excel1904?1:30)+Math.floor(v)*864e5).toISOString().slice(0,10);}
 const s=String(v).trim().slice(0,10);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s+'T12:00:00Z'))||new Date(s+'T12:00:00Z').toISOString().slice(0,10)!==s)throw Error('Usa fechas AAAA-MM-DD; deja vacías las desconocidas.');
 return s;
}
export function parseAmount(v){
 if(v===null||v===undefined||v==='')return null;
 const s=typeof v==='string'?v.trim():v;
 if(typeof s==='string'&&!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('Importes positivos, sin separadores de miles y con punto decimal.');
 const n=Number(s);if(!Number.isFinite(n)||n<0||n>1e12)throw Error('Importe inválido.');
 return Math.round(n*100)/100;
}
const currency=v=>/^[A-Z]{3}$/.test(String(v??'').trim().toUpperCase())?String(v).trim().toUpperCase():'UNKNOWN';
const fieldMap={'fecha':'date','direccion':'direction','categoria':'category','descripcion':'description','concepto':'description','importe':'amount','moneda':'currency','estado':'state','asignacion':'allocation','notas':'notes','fuente':'source','clase de flujo':'flow','gmail id':'gmail','referencia / uuid':'reference','clave de deduplicacion':'key','vinculo factura / pago':'link','url fuente':'url','possible_duplicate_of':'duplicate','id':'key','tipo':'flow'};
function canonical(row){const r={};for(const [k,v]of Object.entries(row))r[fieldMap[clean(k)]||k]=v;return r;}
export function normalize(input,name='Mis datos'){
 let raw=Array.isArray(input)?input:input.events;
 if(!Array.isArray(raw)||raw.length>20000)throw Error('Se requiere un arreglo events de hasta 20,000 registros.');
 const keys=new Set();
 const events=raw.map((row,i)=>{
  const r=canonical(row),amount=parseAmount(r.amount),direction=maps.direction[clean(r.direction)]||'unknown',state=maps.state[clean(r.state)]||'unknown',flow=maps.flow[clean(r.flow)]||'unknown';
  if(!String(r.description??'').trim())throw Error('Falta descripción en el registro '+(i+1));
  const key=String(r.key||'fila-'+(i+1));if(keys.has(key))throw Error('Clave duplicada: '+key+'. Revisa el archivo; no se importó.');keys.add(key);
  const duplicate=r.duplicate?String(r.duplicate):null;
  return {row:i+1,date:parseDate(r.date),description:String(r.description),amount,currency:currency(r.currency),direction,state,flow,key,duplicate,allocation:String(r.allocation||'unclassified'),effectiveAllocation:maps.allocation[clean(r.allocation)]||'unclassified',personalRule:false,
   cash:!duplicate&&amount>0&&((direction==='incoming'&&['received','refund'].includes(state))||(direction==='outgoing'&&state==='paid')),
   category:String(r.category||''),notes:String(r.notes||''),reference:String(r.reference||''),source:String(r.source||''),url:String(r.url||''),link:String(r.link||'')};
 });
 const pendingKeys=new Set();
 const pending=(Array.isArray(input.pending)?input.pending:[]).map((p,i)=>{
  if(!['receivable','payable','renewal'].includes(p.kind))throw Error('Tipo de pendiente inválido.');
  const key=String(p.key||'pendiente-'+(i+1));if(pendingKeys.has(key))throw Error('Clave de pendiente repetida.');pendingKeys.add(key);
  return {row:i+1,key,kind:p.kind,date:parseDate(p.date),timing:String(p.timing||''),party:String(p.party||''),description:String(p.description||'Pendiente'),amount:parseAmount(p.amount),currency:currency(p.currency),state:({paid:'pagado',received:'cobrado',cancelled:'cancelado',completed:'completado'})[p.state]||String(p.state||'pendiente'),notes:String(p.notes||''),source:String(p.source||''),link:String(p.link||''),sheet:'Pendientes'};
 });
 return {meta:{name,importedAt:new Date().toISOString(),maxDate:events.map(e=>e.date).filter(Boolean).sort().at(-1)||null,eventCount:events.length,demo:input.meta?.demo===true,timezone:'America/Merida',coverage:String(input.meta?.coverage||'Vista parcial de los registros importados. No constituye conciliación ni saldo bancario.')},events,pending,controls:[],historical:[]};
}
export function csvRows(text){
 if(text.length>10e6)throw Error('CSV demasiado grande.');
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
 else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('CSV con comillas sin cerrar.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 return rows;
}
export function objects(rows){
 const at=rows.findIndex(row=>row.some(v=>['descripcion','description','concepto'].includes(clean(v)))&&row.some(v=>['importe','amount'].includes(clean(v))));
 if(at<0)throw Error('Faltan columnas descripcion e importe. Descarga la plantilla.');
 const headers=rows[at].map(v=>String(v??'').trim());
 return rows.slice(at+1).filter(row=>row.some(v=>v!==null&&v!=='')).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??null])));
}
function xml(bytes){const s=strFromU8(bytes);if(/<!DOCTYPE|<!ENTITY/i.test(s))throw Error('XML no admitido.');const d=new DOMParser().parseFromString(s,'application/xml');if(d.getElementsByTagName('parsererror').length)throw Error('Excel inválido.');return d;}
const tags=(root,tag)=>Array.from(root.getElementsByTagNameNS('*',tag));
export function xlsx(bytes){
 let expanded=0;
 const zip=unzipSync(bytes,{filter:f=>{expanded+=f.originalSize;if(expanded>50e6)throw Error('El Excel excede 50 MB descomprimidos.');return /^(xl\/(worksheets\/sheet\d+\.xml|workbook\.xml|_rels\/workbook\.xml.rels|sharedStrings\.xml))$/.test(f.name);}});
 if(!zip['xl/workbook.xml'])throw Error('No es un archivo XLSX válido.');
 const shared=zip['xl/sharedStrings.xml']?tags(xml(zip['xl/sharedStrings.xml']),'si').map(si=>tags(si,'t').map(t=>t.textContent).join('')):[];
 const workbook=xml(zip['xl/workbook.xml']),rels=Object.fromEntries(tags(xml(zip['xl/_rels/workbook.xml.rels']),'Relationship').map(e=>[e.getAttribute('Id'),e.getAttribute('Target')]));
 const excel1904=tags(workbook,'workbookPr').some(p=>['1','true'].includes(p.getAttribute('date1904')));
 const sheets={};
 for(const sheet of tags(workbook,'sheet')){
  const id=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),target=rels[id];
  const path=target?.startsWith('/')?target.slice(1):'xl/'+target;
  if(!zip[path])continue;
  sheets[sheet.getAttribute('name')]=tags(xml(zip[path]),'row').map(row=>{
   const a=[];for(const c of tags(row,'c')){const ref=c.getAttribute('r')||'A1';let col=0;for(const ch of ref.match(/^[A-Z]+/)[0])col=col*26+ch.charCodeAt(0)-64;
    const type=c.getAttribute('t');let v=tags(c,'v')[0]?.textContent??null;
    if(type==='s')v=shared[Number(v)];else if(type==='inlineStr')v=tags(c,'t').map(t=>t.textContent).join('');else if(v!==null&&!['str','e','d'].includes(type))v=Number(v);
    a[col-1]=v;
   }return a;
  });
 }
 if(!sheets.Registro)throw Error('El Excel necesita una hoja llamada Registro. Usa la plantilla o pide a tu asistente adaptar una copia.');
 const events=objects(sheets.Registro).map(row=>{const r=canonical(row);r.date=parseDate(r.date,excel1904);return r;});
 const pending=[];
 for(const [sheet,kind]of [['Cobros pendientes','receivable'],['Pagos pendientes','payable']]){
  if(!sheets[sheet])continue;
  const rows=sheets[sheet],index=rows.findIndex(r=>r.includes('Concepto')&&r.includes('Estado'));if(index<0)continue;
  const headers=rows[index];for(const row of rows.slice(index+1)){const r=Object.fromEntries(headers.map((h,i)=>[h,row[i]??null]));if(!r['Clave única'])continue;
   pending.push({kind:r.Estado==='previsto'?'renewal':kind,key:r['Clave única'],description:r.Concepto,party:r.Pagador||r['Proveedor / acreedor'],date:parseDate(r['Fecha esperada']??r['Fecha exacta'],excel1904),timing:r['Plazo indicado'],amount:r.Importe,currency:r.Moneda,state:r.Estado,notes:r.Notas,source:r.Fuente,link:r['Vínculo a pago(s)']});
  }
 }
 return {events,pending};
}
export async function readFile(file){
 if(file.size>10e6)throw Error('Selecciona un archivo de hasta 10 MB.');
 const ext=file.name.split('.').at(-1).toLowerCase();
 if(ext==='xlsx')return normalize(xlsx(new Uint8Array(await file.arrayBuffer())),file.name);
 if(ext==='csv')return normalize(objects(csvRows(await file.text())),file.name);
 if(ext==='json')return normalize(JSON.parse(await file.text()),file.name);
 throw Error('Formatos admitidos: .xlsx, .csv y .json.');
}
window.PulsoFiles={readFile,normalize,csvRows,objects};

