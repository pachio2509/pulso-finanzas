import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir('docs',{recursive:true});await mkdir('skills/pulso-finanzas/assets',{recursive:true});await mkdir('skills/pulso-finanzas/scripts',{recursive:true});
const vendor=await build({stdin:{contents:"import './src/visuals.js'; import './src/files.js';",resolveDir:process.cwd()},bundle:true,minify:true,format:'iife',write:false,legalComments:'inline',target:'es2022'});
const read=p=>readFile(p,'utf8');
const empty={meta:{name:'',eventCount:0,maxDate:null,coverage:'Importa tus registros para empezar. La cobertura dependerá de tus fuentes.'},events:[],pending:[],controls:[],historical:[]};
const js=(await Promise.all(['src/enhancements.js','src/app.js','src/public.js'].map(read))).join('\n')+'\ninitPublic();initUI();';
const html=(await read('src/template.html')).replace('/*CSS_PLACEHOLDER*/',await read('src/style.css')).replace('/*VENDOR_PLACEHOLDER*/',()=>vendor.outputFiles[0].text).replace('/*DATA_PLACEHOLDER*/',JSON.stringify(empty)).replace('/*JS_PLACEHOLDER*/',()=>js);
for(const path of ['docs/index.html','skills/pulso-finanzas/assets/Dashboard.html'])await writeFile(path,html);
await writeFile('docs/.nojekyll','');
for(const name of ['local_server.py','import_data.py'])await copyFile('scripts/'+name,'skills/pulso-finanzas/scripts/'+name);
console.log('Dashboard público vacío y skill generados. '+Buffer.byteLength(html)+' bytes.');

await cp('licenses','skills/pulso-finanzas/licenses',{recursive:true});
await copyFile('LICENSE','skills/pulso-finanzas/LICENSE');
