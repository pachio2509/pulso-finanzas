function matchesQuery(text,query){const clean=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const words=clean(text).split(/[^a-z0-9]+/).filter(Boolean);return clean(query).split(/[^a-z0-9]+/).filter(Boolean).every(term=>words.some(word=>word.startsWith(term)));}
const FX=window.FinanceUI;
let chartMode='daily',activeDetail=null,refreshing=false,lastConnected=null;
function renderOverview(){originalRenderOverview();renderRing(currencyRows(monthly()));renderMiniAgenda();}
function drawChart(rs){
 const day=$('day').value,month=day.slice(0,7),days=Number(day.slice(8));let incoming=0,outgoing=0;
 const values=Array.from({length:days},(_,i)=>{const date=month+'-'+String(i+1).padStart(2,'0'),events=rs.filter(e=>e.date===date);incoming+=sum(flows(events,'incoming'));outgoing+=sum(flows(events,'outgoing'));return {date,in:chartMode==='daily'?sum(flows(events,'incoming')):incoming,out:chartMode==='daily'?sum(flows(events,'outgoing')):outgoing,count:events.length};});
 const max=Math.max(...values.flatMap(v=>[v.in,v.out]),1),ceiling=max<100?Math.ceil(max/10)*10:Math.ceil(max/1000)*1000;
 const grid=[ceiling,ceiling*.75,ceiling/2,ceiling*.25,0].map(v=>`<div class="gridline"><span>${v>=1000?(v/1000).toLocaleString('es-MX',{maximumFractionDigits:1})+'k':Math.round(v)}</span></div>`).join('');
 const label=v=>`${fmtDate(v.date)}: ${chartMode==='daily'?'flujo del día':'acumulado desde el día 1'}, entró ${money(v.in,currency)}, salió ${money(v.out,currency)}; ${v.count} registros del día`;
 const tick=(i)=>i===0||(i+1)%5===0||i===days-1?`<span class="tick">${i+1}</span>`:'';
 let content='';
 if(chartMode==='daily'){
  content=`<div class="chart-bars">${values.map((v,i)=>`<button class="bar-day ${v.date===day?'selected':''}" data-day="${v.date}" aria-label="${esc(label(v))}"><span class="bar in" style="height:${v.in/ceiling*180}px"></span><span class="bar out" style="height:${v.out/ceiling*180}px"></span>${tick(i)}</button>`).join('')}</div>`;
 }else{
  const x=i=>days===1?300:8+i*584/(days-1),y=v=>180-v/ceiling*180;
  const path=key=>values.map((v,i)=>`${i?'L':'M'} ${x(i)} ${y(v[key])}`).join(' ');
  content=`<svg class="cumulative-svg" viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true"><path d="${path('in')} L ${x(days-1)} 180 L ${x(0)} 180 Z" fill="var(--green)" opacity=".06"/><path d="${path('out')} L ${x(days-1)} 180 L ${x(0)} 180 Z" fill="var(--purple)" opacity=".06"/><path d="${path('in')}" fill="none" stroke="var(--green)" stroke-width="2.5" vector-effect="non-scaling-stroke"/><path d="${path('out')}" fill="none" stroke="var(--purple)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg><div class="chart-bars" style="position:absolute;inset:0 0 auto 35px">${values.map((v,i)=>`<button class="bar-day" data-day="${v.date}" aria-label="${esc(label(v))}" style="background:transparent">${tick(i)}</button>`).join('')}</div>`;
 }
 $('chart').innerHTML=`<div class="chart-grid">${grid}</div>${content}`;$('chartTooltip').hidden=true;
 for(const b of document.querySelectorAll('[data-day]')){
  const v=values.find(v=>v.date===b.dataset.day);
  const show=()=>{$('chartTooltip').innerHTML=`<b>${esc(fmtDate(v.date))}</b>${chartMode==='daily'?'Registrado ese día':'Acumulado del mes'}<br>Entró ${esc(money(v.in,currency))} &nbsp; · &nbsp; Salió ${esc(money(v.out,currency))}`;$('chartTooltip').hidden=false;};
  b.onmouseenter=show;b.onfocus=show;b.onmouseleave=()=>{$('chartTooltip').hidden=true;};b.onblur=b.onmouseleave;
  b.onclick=()=>{$('day').value=b.dataset.day;renderOverview();page=0;renderRows();FX?.change();};
 }
 if(chartMode==='daily')FX?.chart();
}
function renderMiniAgenda(){
 const upcoming=DATA.pending.filter(p=>!isClosed(p)&&p.date&&p.date>=today()&&p.kind!=='receivable').sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2);
 $('miniAgenda').innerHTML=upcoming.length?upcoming.map(p=>`<div class="mini-agenda-row"><div class="agenda-date"><b>${Number(p.date.slice(8))}</b><small>${esc(new Intl.DateTimeFormat('es-MX',{month:'short',timeZone:'UTC'}).format(new Date(p.date+'T12:00:00Z')))}</small></div><div><b class="name" title="${esc(p.description)}">${esc(p.description.replace('Renovación ',''))}</b><span>${p.kind==='renewal'?'Renovación prevista':'Pago pendiente'}</span></div></div>`).join(''):'<p class="tiny">Sin próximas fechas confirmadas. Consulta los pendientes por aclarar.</p>';
}
function renderRing(rs){
 const expenses=flows(rs,'outgoing').filter(e=>e.flow==='expense'),personal=expenses.filter(e=>e.effectiveAllocation==='personal'),business=expenses.filter(e=>e.effectiveAllocation==='business'),other=expenses.filter(e=>!['personal','business'].includes(e.effectiveAllocation));
 const total=sum(expenses),circumference=2*Math.PI*40;let offset=0;
 const arcs=[[sum(personal),'#7059e8'],[sum(business),'#168473'],[sum(other),'#a699d8']].filter(([n])=>n>0).map(([n,c])=>{const len=n/total*circumference;const arc=`<circle cx="52" cy="52" r="40" fill="none" stroke="${c}" stroke-width="12" stroke-dasharray="${Math.max(0,len-2)} ${circumference}" stroke-dashoffset="${-offset}"/>`;offset+=len;return arc;}).join('');
 $('spendRing').innerHTML=`<div class="ring-visual" role="img" aria-label="${expenses.length} compras o pagos identificados, ${esc(total?money(total,currency):'sin registros')}; personal ${esc(money(sum(personal),currency))}, negocio ${esc(money(sum(business),currency))}"><svg viewBox="0 0 104 104"><circle cx="52" cy="52" r="40" fill="none" stroke="var(--soft)" stroke-width="12"/>${arcs}</svg><div class="ring-center"><strong>${expenses.length}</strong>pagos</div></div><div class="ring-info">Compras y pagos identificados<strong>${total?'$'+number(total):'Sin registros'}</strong><small>${esc(currency)} · sin traspasos ni salidas por aclarar</small></div>`;
}
function initUI(){
 FX?.icons();FX?.reveal('.day-grid');
 try{const saved=localStorage.getItem('pulso-theme');if(saved==='dark')document.documentElement.dataset.theme='dark';}catch{}
 function updateThemeButton(){const dark=document.documentElement.dataset.theme==='dark';$('themeButton').setAttribute('aria-label',dark?'Activar modo claro':'Activar modo oscuro');$('themeButton').innerHTML=`<i data-lucide="${dark?'sun':'moon'}"></i>`;FX?.icons();}
 updateThemeButton();
 $('themeButton').onclick=()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';try{localStorage.setItem('pulso-theme',dark?'dark':'light');}catch{}updateThemeButton();};
 $('viewBars').onclick=()=>{chartMode='daily';$('viewBars').setAttribute('aria-pressed','true');$('viewCumulative').setAttribute('aria-pressed','false');renderOverview();};
 $('viewCumulative').onclick=()=>{chartMode='cumulative';$('viewBars').setAttribute('aria-pressed','false');$('viewCumulative').setAttribute('aria-pressed','true');renderOverview();};
 document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('movements').scrollIntoView();$('search').focus();}});
 $('liveButton').onclick=()=>{$('liveNote').hidden=!$('liveNote').hidden;};
 $('checkNow').onclick=()=>refreshConnected(true);
 refreshConnected();setInterval(()=>{if(!document.hidden)refreshConnected();},5000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshConnected();});
}
