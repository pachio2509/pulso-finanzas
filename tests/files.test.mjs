import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
globalThis.window={};
const {normalize,parseDate,parseAmount,csvRows,objects}=await import('../src/files.js');
const e=(extra={})=>({key:'uno',date:'2026-01-15',description:'Ejemplo ficticio',amount:12.5,currency:'MXN',direction:'outgoing',state:'paid',flow:'expense',allocation:'personal',...extra});
test('no inventa ingresos, asignaciones, fechas ni monedas',()=>{
 const d=normalize({events:[e({flow:'unknown',allocation:'unclassified',date:null,currency:null,direction:'incoming',state:'received'})]});
 assert.equal(d.events[0].flow,'unknown');assert.equal(d.events[0].effectiveAllocation,'unclassified');assert.equal(d.events[0].date,null);assert.equal(d.events[0].currency,'UNKNOWN');
});
test('ignora cash aportado y excluye retenidos/rechazados/duplicados',()=>{
 for(const extra of [{state:'hold'},{state:'rejected'},{duplicate:'original'},{amount:null},{direction:'unknown'}])assert.equal(normalize([e({...extra,cash:true})]).events[0].cash,false);
});
test('preserva traspaso como clase separada aunque haya efectivo',()=>{const r=normalize([e({flow:'transfer'})]).events[0];assert.equal(r.flow,'transfer');assert.equal(r.cash,true);});
test('claves repetidas se rechazan antes de sustituir datos',()=>assert.throws(()=>normalize([e(),e()]),/Clave duplicada/));
test('fechas y cantidades ambiguas no se convierten silenciosamente',()=>{
 assert.throws(()=>parseDate('2026-02-30'));assert.throws(()=>parseDate('01/02/2026'));assert.equal(parseDate(null),null);
 assert.throws(()=>parseAmount('1,200'));assert.throws(()=>parseAmount(-1));assert.equal(parseAmount('0'),0);assert.equal(parseAmount(null),null);
});
test('CSV con comillas, comas y saltos conserva texto',()=>{
 const r=objects(csvRows('fecha,descripcion,importe,moneda\n2026-01-15,"Ejemplo, con ""comillas""\ny salto",12.50,MXN\n'));
 assert.equal(r[0].descripcion,'Ejemplo, con "comillas"\ny salto');assert.equal(normalize(r).events[0].amount,12.5);
});
test('pendientes cerrados y demo exportada conservan su significado',()=>{
 const d=normalize({meta:{demo:true},events:[e()],pending:[{key:'p1',kind:'payable',state:'paid',amount:8,currency:'USD'}]});
 assert.equal(d.pending[0].state,'pagado');assert.equal(d.meta.demo,true);
 assert.equal(normalize(JSON.parse(JSON.stringify(d))).meta.demo,true);
});
test('HTML generado contiene solo dos scripts válidos y empieza vacío',()=>{
 const html=readFileSync(new URL('../docs/index.html',import.meta.url),'utf8');
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(scripts.length,2);for(const s of scripts)new vm.Script(s);
 assert.match(scripts[1],/"events":\[\]/);assert.doesNotMatch(html,/PULSO_LOCAL=true/);
});

