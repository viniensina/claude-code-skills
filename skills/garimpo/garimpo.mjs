// Garimpo de vídeo validado no YouTube (skill .claude/skills/garimpo).
// Precisa do yt-dlp: usa o de <projeto>/.tools/ (via python) se existir; senão, o yt-dlp instalado no sistema.
//   busca    <pasta> "q1" "q2" ...   → busca.jsonl (25 resultados por busca, sem baixar nada)
//   detalhes <pasta> [--min-views N] [--min-min N] [--max-min N] → info.jsonl (inscritos, data, idioma, capítulos); 1 s entre vídeos
//   ranking  <pasta> [--dias N]      → ranking.json + tabela no terminal (views ÷ inscritos, sem canais em português)
//   brasil   <pasta> "q1" ...        → brasil.jsonl + lista do que já existe em PT
//   legenda  <pasta> <id>            → legendas/<id>.txt (blocos de 30 s) pra montar o esqueleto
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const tools=path.join(raiz,'.tools');
const [cmd,pastaArg,...resto]=process.argv.slice(2);
if(!cmd||!pastaArg){console.log(fs.readFileSync(fileURLToPath(import.meta.url),'utf8').split('\n').slice(0,6).join('\n'));process.exit(1);}
const pasta=path.resolve(raiz,pastaArg);fs.mkdirSync(pasta,{recursive:true});
const opt=(nome,padrao)=>{const i=resto.indexOf(nome);return i>=0?Number(resto[i+1]):padrao;};
const livres=resto.filter((a,i)=>!a.startsWith('--')&&!resto[i-1]?.startsWith('--'));
const espera=ms=>Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);
const temTools=fs.existsSync(path.join(tools,'yt_dlp'));
function yt(args){
  const r=temTools
    ?spawnSync('python',['-I','-c',`import sys;sys.path.insert(0,${JSON.stringify(tools)});import yt_dlp;yt_dlp.main()`,...args],{encoding:'utf8',maxBuffer:64*1024*1024})
    :spawnSync('yt-dlp',args,{encoding:'utf8',maxBuffer:64*1024*1024});
  if(r.error)throw new Error('yt-dlp não encontrado. Instale com: pip install yt-dlp');
  if(/HTTP Error 429/.test(r.stderr))console.error('[429] YouTube pediu calma: espere uns minutos e rode de novo.');
  return r.stdout;
}
const linhas=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8').split('\n').filter(Boolean).map(l=>JSON.parse(l)):[];
const dias=d=>Math.round((Date.now()-Date.parse(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6)}`))/864e5);

if(cmd==='busca'||cmd==='brasil'){
  const out=path.join(pasta,cmd==='busca'?'busca.jsonl':'brasil.jsonl');
  for(const q of livres){
    const txt=yt(['--flat-playlist','--dump-json',...(cmd==='busca'?['--extractor-args','youtube:lang=en']:[]),`ytsearch${cmd==='busca'?25:15}:${q}`]);
    for(const l of txt.split('\n').filter(Boolean)){const j=JSON.parse(l);fs.appendFileSync(out,JSON.stringify({q,id:j.id,t:j.title,c:j.channel,v:j.view_count,d:j.duration})+'\n');}
    console.log(q,'ok');espera(2000);
  }
  if(cmd==='brasil')for(const x of linhas(out).filter(x=>x.v>=3000).sort((a,b)=>b.v-a.v))console.log(String(x.v).padStart(9),Math.round((x.d??0)/60)+'m',x.c,'|',x.t);
}else if(cmd==='detalhes'){
  const vistos=new Map();for(const x of linhas(path.join(pasta,'busca.jsonl')))if(!vistos.has(x.id))vistos.set(x.id,x);
  const ja=new Set(linhas(path.join(pasta,'info.jsonl')).map(x=>x.id));
  const alvo=[...vistos.values()].filter(x=>!ja.has(x.id)&&x.v>=opt('--min-views',30000)&&x.d>=opt('--min-min',2)*60&&x.d<=opt('--max-min',45)*60);
  console.log(`${alvo.length} vídeos pra detalhar`);
  for(const [i,x] of alvo.entries()){
    const txt=yt(['--skip-download','-j','--no-warnings',`https://www.youtube.com/watch?v=${x.id}`]);
    if(txt.trim()){const j=JSON.parse(txt);fs.appendFileSync(path.join(pasta,'info.jsonl'),JSON.stringify({id:j.id,t:j.title,c:j.channel,subs:j.channel_follower_count,v:j.view_count,date:j.upload_date,d:j.duration,lang:j.language,chap:(j.chapters??[]).map(c=>[Math.round(c.start_time),c.title])})+'\n');}
    if(i%10===0)console.log(`${i+1}/${alvo.length}`);
    espera(1000);// sem isso o YouTube bloqueia (429)
  }
}else if(cmd==='ranking'){
  const lim=opt('--dias',75);
  const r=linhas(path.join(pasta,'info.jsonl')).filter(x=>x.date&&!(x.lang??'').startsWith('pt')).map(x=>({...x,idade:dias(x.date),ratio:x.v/Math.max(1,x.subs)})).filter(x=>x.idade<=lim).sort((a,b)=>b.ratio-a.ratio);
  fs.writeFileSync(path.join(pasta,'ranking.json'),JSON.stringify(r,null,1));
  for(const x of r.slice(0,30))console.log(`${x.ratio.toFixed(1).padStart(6)}×`,String(x.v).padStart(9),'insc',String(x.subs).padStart(8),`${x.idade}d`,`${Math.round(x.d/60)}m`,x.c,'|',x.t,x.id);
}else if(cmd==='legenda'){
  const id=livres[0],dirL=path.join(pasta,'legendas');fs.mkdirSync(dirL,{recursive:true});
  yt(['--skip-download','--write-auto-subs','--sub-langs','en-orig,en','--sub-format','json3','--no-warnings','-o',path.join(dirL,`${id}.%(ext)s`),`https://www.youtube.com/watch?v=${id}`]);
  const f=fs.readdirSync(dirL).find(f=>f.startsWith(id)&&f.endsWith('.json3'));if(!f)throw new Error('sem legenda (ou 429): tente de novo em alguns minutos');
  const j=JSON.parse(fs.readFileSync(path.join(dirL,f),'utf8')),out=[];let cur={t:0,s:''};
  for(const e of j.events.filter(e=>e.segs)){const t=e.tStartMs/1000;if(t-cur.t>30){out.push(cur);cur={t,s:''};}cur.s+=e.segs.map(s=>s.utf8).join('');}
  out.push(cur);const txt=out.map(o=>`[${Math.floor(o.t/60)}:${String(Math.floor(o.t%60)).padStart(2,'0')}] ${o.s.replace(/\s+/g,' ').trim()}`).join('\n');
  fs.writeFileSync(path.join(dirL,`${id}.txt`),txt);console.log(path.join(dirL,`${id}.txt`));
}else{console.error('comando desconhecido:',cmd);process.exit(1);}
