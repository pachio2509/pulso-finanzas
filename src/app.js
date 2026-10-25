const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Merida',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const fmtDate=d=>d?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z')):'Sin fecha';
const number=n=>new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const money=(n,c)=>n==null?'Importe por confirmar':c==='UNKNOWN'?`${number(n)} · moneda por confirmar`:`$${number(n)} ${c}`;
const sum=rs=>Math.round(rs.reduce((n,r)=>n+Math.round(r.amount*100),0))/100;
const total=rs=>rs.length?sum(rs):null;
const stateNames={paid:'Pagado',received:'Recibido',hold:'Retenido',rejected:'Rechazado',invoiced:'Facturado',unknown:'Por confirmar',refund:'Devolución',pendiente:'Pendiente',parcial:'Parcial',cobrado:'Cobrado',pagado:'Pagado',previsto:'Previsto',liquidado:'Liquidado'};
let currency='MXN',pendingKind='receivable',page=0,shown=[];
const PAGE_SIZE=15;
$('day').value=today();
const isClosed=p=>/^(cobrado|pagado|liquidado|cancelado|completado)/i.test(p.state||'');
const monthly=()=>DATA.events.filter(e=>e.date&&e.date.slice(0,7)===$('day').value.slice(0,7)&&e.date<=$('day').value);
const currencyRows=rs=>rs.filter(e=>e.currency===currency);
const flows=(rs,d)=>rs.filter(e=>e.cash&&e.flow!=='transfer'&&e.direction===d);
const displayTotal=(rs,c=currency)=>rs.length?money(sum(rs),c):'Sin registros';
function metric(id,rows){$(id).innerHTML=rows.length?`$${number(sum(rows))}<small>${esc(currency)}</small>`:'—';}
function notice(text){$('notice').textContent=text;$('notice').hidden=false;}
function className(e){if(e.duplicate)return 'Duplicidad reservada';if(e.flow==='transfer')return /probab|provisional/i.test(e.category||'')?'Traspaso provisional':'Traspaso propio';if(e.flow==='income')return 'Ingreso identificado';if(e.flow==='expense')return e.effectiveAllocation==='personal'?'Gasto personal':e.effectiveAllocation==='business'?'Gasto empresarial':e.effectiveAllocation==='other'?'Otro destino':'Gasto por clasificar';return 'Naturaleza desconocida';}
function breakdown(rs){
 const outgoing=flows(rs,'outgoing');const totalAmount=sum(outgoing);
 const items=[['Gasto personal',outgoing.filter(e=>e.flow==='expense'&&e.effectiveAllocation==='personal'),'#7059e8'],['Negocio pagado por ti',outgoing.filter(e=>e.flow==='expense'&&e.effectiveAllocation==='business'),'#168473'],['Otros gastos identificados',outgoing.filter(e=>e.flow==='expense'&&!['personal','business'].includes(e.effectiveAllocation)),'#a699d8'],['Salidas de naturaleza desconocida',outgoing.filter(e=>e.flow!=='expense'),'#df896e']];
 $('breakdown').innerHTML=items.map(([label,rows,color])=>`<div class="breakdown-row"><div class="line"><span>${label}</span><b>${rows.length?'$'+number(sum(rows)):'Sin registros'}</b></div><div class="meter"><span style="width:${totalAmount?sum(rows)/totalAmount*100:0}%;background:${color}"></span></div></div>`).join('');
 $('identifiedIncome').textContent=displayTotal(flows(rs,'incoming').filter(e=>e.flow==='income'));
}
function basicDrawChart(rs){
 const day=$('day').value,month=day.slice(0,7),days=Number(day.slice(8));
 const values=Array.from({length:days},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0'),events=rs.filter(e=>e.date===date);return {date,in:sum(flows(events,'incoming')),out:sum(flows(events,'outgoing')),count:events.length};});
 const max=Math.max(...values.flatMap(v=>[v.in,v.out]),1),ceiling=max<100?Math.ceil(max/10)*10:Math.ceil(max/1000)*1000;
 const grid=[ceiling,ceiling/2,0].map(v=>`<div class="gridline"><span>${v>=1000?(v/1000).toLocaleString('es-MX',{maximumFractionDigits:1})+'k':Math.round(v)}</span></div>`).join('');
 $('chart').innerHTML=`<div class="chart-grid">${grid}</div><div class="chart-bars">${values.map((v,i)=>`<button class="bar-day ${v.date===day?'selected':''}" data-day="${v.date}" aria-label="${esc(fmtDate(v.date))}: entró ${esc(money(v.in,currency))}, salió ${esc(money(v.out,currency))}; ${v.count} registros" title="${esc(fmtDate(v.date))}\nEntró ${esc(money(v.in,currency))}\nSalió ${esc(money(v.out,currency))}"><span class="bar in" style="height:${v.in/ceiling*170}px"></span><span class="bar out" style="height:${v.out/ceiling*170}px"></span>${i===0||(i+1)%5===0||i===days-1?`<span class="tick">${i+1}</span>`:''}</button>`).join('')}</div>`;
 document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{$('day').value=b.dataset.day;renderOverview();page=0;renderRows();});
}
function originalRenderOverview(){
 const day=$('day').value;if(!day)return;
 const daily=DATA.events.filter(e=>e.date===day),known=currencyRows(daily),ins=flows(known,'incoming'),outs=flows(known,'outgoing');
 $('inLabel').textContent=day===today()?'Hoy entró':'Entró el '+fmtDate(day);$('outLabel').textContent=day===today()?'Hoy salió':'Salió el '+fmtDate(day);
 metric('dayIn',ins);metric('dayOut',outs);
 $('dayInMeta').textContent=ins.length?`${ins.length} entrada${ins.length===1?'':'s'} registrada${ins.length===1?'':'s'} · no todo es ingreso ganado`:'Sin entradas registradas en '+currency;
 $('dayOutMeta').textContent=outs.length?`${outs.length} salida${outs.length===1?'':'s'} registrada${outs.length===1?'':'s'} · ${outs.some(e=>e.flow==='unknown')?'incluye naturaleza por aclarar':'pagos identificados'}`:'Sin salidas registradas en '+currency;
 const unknown=daily.filter(e=>e.currency==='UNKNOWN').length,excluded=known.filter(e=>!e.cash).length;
 $('dayCautions').innerHTML=[unknown?`${unknown} registro(s) del día sin moneda confirmada.`:'',excluded?`${excluded} registro(s) de ${currency} sin salida o entrada sumable.`:'',DATA.meta.maxDate&&day>DATA.meta.maxDate?'La fecha elegida es posterior al último evento fechado del libro.':''].filter(Boolean).map(esc).join('<br>')||'Solo evidencia registrada en la copia local.';
 const month=currencyRows(monthly());const date=new Date(day+'T12:00:00Z');
 const monthName=new Intl.DateTimeFormat('es-MX',{month:'long',year:'numeric',timeZone:'UTC'}).format(date);
 $('monthTitle').textContent=monthName.charAt(0).toUpperCase()+monthName.slice(1)+' · parcial';
 $('monthSubtitle').textContent=`Del 1 al ${Number(day.slice(8))} · ${currency} · según fecha de operación`;
 $('monthIn').textContent=displayTotal(flows(month,'incoming'));$('monthOut').textContent=displayTotal(flows(month,'outgoing'));
 drawChart(month);breakdown(month);
 const transfers=month.filter(e=>e.cash&&e.flow==='transfer');
 $('transfers').innerHTML=['incoming','outgoing'].map(d=>`<div>${d==='incoming'?'Entraron':'Salieron'}<b>${esc(displayTotal(transfers.filter(e=>e.direction===d)))}</b></div>`).join('');
}
function pendingCard(p){return `<button class="pending-card" data-key="${esc(p.key)}"><span class="date">${esc(p.date?fmtDate(p.date):p.timing||'Fecha por confirmar')}</span><h3>${esc(p.kind==='receivable'?p.party:p.description)}</h3><p>${esc(p.kind==='receivable'?p.description:p.party)}</p><strong>${p.amount==null?'Por confirmar':p.currency==='UNKNOWN'?esc(number(p.amount)):esc(money(p.amount,p.currency))}</strong><small>${esc(p.currency==='UNKNOWN'?'Moneda por confirmar · sin sumar':stateNames[p.state]||p.state)}${p.state==='parcial'?' · importe original; saldo por conciliar':''}</small></button>`;}
function renderPending(){
 const open=DATA.pending.filter(p=>!isClosed(p));
 for(const k of ['receivable','payable','renewal'])$(k+'Count').textContent=open.filter(p=>p.kind===k).length;
 $('pendingCount').textContent=open.length+' asuntos abiertos';
 const rows=open.filter(p=>p.kind===pendingKind),known=rows.filter(p=>p.currency!=='UNKNOWN'&&typeof p.amount==='number'),unknown=rows.filter(p=>p.currency==='UNKNOWN').length;
 const sums=[...new Set(known.map(p=>p.currency))].map(c=>money(sum(known.filter(p=>p.currency===c)),c));
 $('pendingSummary').textContent=(pendingKind==='renewal'?'Previstas, no deuda exigible. ':'Importes originales pendientes, no saldo neto conciliado. ')+(sums.length?sums.join(' / ')+'. ':'')+(unknown?`${unknown} registro(s) sin moneda confirmada; no se suman. `:'')+(rows.filter(p=>p.amount==null).length?`${rows.filter(p=>p.amount==null).length} sin importe confirmado.`:'');
 $('pendingCards').innerHTML=rows.length?rows.map(pendingCard).join(''):'<div class="empty">No hay pendientes de este tipo en la copia local.</div>';
 const closed=DATA.pending.filter(isClosed);$('settled').hidden=!closed.length;$('settledCards').innerHTML=closed.map(pendingCard).join('');
 document.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>openPending(DATA.pending.find(p=>p.key===b.dataset.key)));
}
function filtered(){
 const q=$('search').value.toLocaleLowerCase('es'),c=$('filterCurrency').value,t=$('filterType').value,p=$('filterPeriod').value,d=$('day').value;
 return DATA.events.filter(e=>{
 if(c&&e.currency!==c)return false;
 if(p==='day'&&e.date!==d)return false;
 if(p==='month'&&(!e.date||e.date.slice(0,7)!==d.slice(0,7)||e.date>d))return false;
 if(p==='undated'&&e.date)return false;
 if(q&&!matchesQuery([e.description,e.category,e.reference,e.notes,e.key,e.source].join(' '),q))return false;
 if(t==='incoming'||t==='outgoing')return e.cash&&e.direction===t&&e.flow!=='transfer';
 if(t==='transfer')return e.flow==='transfer';if(t==='personal')return e.flow==='expense'&&e.effectiveAllocation==='personal';if(t==='business')return e.flow==='expense'&&e.effectiveAllocation==='business';if(t==='unknown')return e.flow==='unknown';if(t==='excluded')return !e.cash;if(t==='duplicate')return !!e.duplicate;return true;
 }).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.row-a.row);
}
function renderRows(){
 shown=filtered();const pages=Math.max(1,Math.ceil(shown.length/PAGE_SIZE));page=Math.min(page,pages-1);const rows=shown.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 $('resultCount').textContent=shown.length+' registros';$('empty').hidden=!!rows.length;
 $('rows').innerHTML=rows.map(e=>`<tr><td>${esc(fmtDate(e.date))}</td><td class="description"><b>${esc(e.description)}</b><small>${esc(e.category)} · Registro ${e.row}</small></td><td><span class="tag ${e.flow==='unknown'||e.duplicate?'amber':''}">${esc(className(e))}</span></td><td><span class="tag ${e.state==='received'?'green':['hold','rejected'].includes(e.state)?'amber':''}">${esc(stateNames[e.state]||e.state)}</span></td><td class="amount ${e.cash&&e.direction==='incoming'&&e.flow!=='transfer'?'positive':''}"><b>${e.amount==null?'Por confirmar':esc(number(e.amount))}</b><small>${esc(e.currency==='UNKNOWN'?'Moneda por confirmar':e.currency)}</small></td><td><button class="details-button" data-row="${e.row}" aria-label="Ver detalle de ${esc(e.description)}">Ver</button></td></tr>`).join('');
 $('pageInfo').textContent=`${shown.length?page*PAGE_SIZE+1:0}–${Math.min((page+1)*PAGE_SIZE,shown.length)} de ${shown.length}`;$('previous').disabled=page===0;$('next').disabled=page===pages-1;
 document.querySelectorAll('[data-row]').forEach(b=>b.onclick=()=>openEvent(DATA.events.find(e=>e.row===Number(b.dataset.row))));
}
function openDetail(label,title,amount,currency,fields,notes,extra=''){
 $('detailSource').textContent=label;
 $('detailBody').innerHTML=`<h2>${esc(title)}</h2><div class="detail-amount">${esc(money(amount,currency))}</div><dl>${fields.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v||'Por confirmar')}</dd>`).join('')}</dl><div class="note-block"><h3>Notas del libro</h3><p>${esc(notes||'Sin notas adicionales.')}</p></div>${extra}`;if(!$('detail').open)$('detail').showModal();FX?.detail();
}
function openEvent(e){
 activeDetail={kind:"event",key:e.key};
 let url='';try{const u=new URL(e.url);if(u.protocol==='https:')url=u.href;}catch{}
 openDetail('Registro · fila '+e.row,e.description,e.amount,e.currency,[['Fecha de operación',fmtDate(e.date)],['Estado',stateNames[e.state]||e.state],['Clasificación',className(e)],['Asignación del libro',e.allocation],['Asignación de la vista',e.effectiveAllocation],['Cuenta en el flujo',e.cash?(e.flow==='transfer'?'Solo en traspasos':'Sí, si tiene fecha y moneda conocida'):'No; sin efectivo sumable o duplicidad reservada'],['Fuente',e.source],['Referencia',e.reference],['Clave única',e.key],['Vínculo a otro registro',e.link],['Posible duplicado de',e.duplicate||'Sin marca de duplicidad']],e.notes,(url?`<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir evidencia</a></p>`:''));
}
function openPending(p){activeDetail={kind:"pending",key:p.key};openDetail(p.sheet+' · fila '+p.row,p.kind==='receivable'?p.party+' · '+p.description:p.description,p.amount,p.currency,[['Estado',stateNames[p.state]||p.state],['Fecha',fmtDate(p.date)],['Plazo indicado',p.timing],['Contraparte',p.party],['Vínculo al pago',p.link],['Fuente',p.source],['Clave única',p.key]],p.notes,p.extract?'<p><b>Extracto de la fuente:</b> '+esc(p.extract)+'</p>':'');}
function filterTo(type,period){$('filterType').value=type;$('filterPeriod').value=period;$('filterCurrency').value=currency;$('search').value='';page=0;renderRows();$('movements').scrollIntoView();}
function renderMeta(){
 const m=DATA.meta,v=m.demo?'Datos ficticios de ejemplo':DATA.events.length?'Tus datos · sesión privada':'Sin datos importados';
 $('sourceVersion').textContent=v;$('versionBadge').textContent=DATA.events.length+' movimientos';$('footerVersion').textContent='Último evento: '+fmtDate(m.maxDate);
 $('coverageText').textContent=m.coverage;$('coverageDetail').textContent=m.coverage;
 const items=[['Sin moneda confirmada',DATA.events.filter(e=>e.currency==='UNKNOWN').length],['Sin fecha',DATA.events.filter(e=>!e.date).length],['Duplicidad reservada',DATA.events.filter(e=>e.duplicate).length],['Sin importe',DATA.events.filter(e=>e.amount==null).length]];
 $('qualityCounts').innerHTML=items.map(([l,n])=>`<div class="quality-item"><span>${l}</span><b>${n}</b></div>`).join('');
 $('fileMeta').textContent=m.name?m.name+' · '+DATA.events.length+' eventos':'Todavía no has cargado datos.';
 $('importHint').textContent='Excel, CSV o JSON. Se procesan en este navegador; no se envían al repositorio ni al autor.';
 $('sourceControls').textContent='Las clasificaciones y los estados provienen del archivo. Los datos desconocidos se conservan como desconocidos.';
 $('demoBanner').hidden=!m.demo;$('welcome').hidden=DATA.events.length>0;
}
document.querySelectorAll('[data-currency]').forEach(b=>b.onclick=()=>{currency=b.dataset.currency;document.querySelectorAll('[data-currency]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderOverview();FX?.change();});
document.querySelectorAll('[data-pending]').forEach(b=>b.onclick=()=>{pendingKind=b.dataset.pending;document.querySelectorAll('[data-pending]').forEach(x=>x.classList.toggle('selected',x===b));renderPending();FX?.reveal('#pendingCards');});
$('day').onchange=()=>{if(!$('day').value)return;renderOverview();page=0;renderRows();};$('today').onclick=()=>{$('day').value=today();renderOverview();page=0;renderRows();};
for(const id of ['search','filterCurrency','filterType','filterPeriod'])$(id).addEventListener(id==='search'?'input':'change',()=>{page=0;renderRows();});
$('resetFilters').onclick=()=>{$('search').value='';$('filterCurrency').value='';$('filterType').value='';$('filterPeriod').value='month';page=0;renderRows();};
$('seeIncoming').onclick=()=>filterTo('incoming','day');$('seeOutgoing').onclick=()=>filterTo('outgoing','day');$('seeTransfers').onclick=()=>filterTo('transfer','month');
$('previous').onclick=()=>{page--;renderRows();};$('next').onclick=()=>{page++;renderRows();};$('closeDetail').onclick=()=>$('detail').close();$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
function importClick(){$('file').click();}
$('importButton').onclick=importClick;$('importAgain').onclick=importClick;
$('file').onchange=async()=>{const f=$('file').files[0];if(!f)return;try{await importFile(f);fileHandle=null;}catch(e){notice(e.message);}finally{$('file').value='';}};
const obs=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===e.target.id));}},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('section[id]').forEach(s=>obs.observe(s));
renderMeta();renderOverview();renderPending();renderRows();
