// (1663) PRIMO ANNO NBA dei giocatori delle 8 squadre Dreamers (Assistente GM › «Rookie ever»).
// Gira su GitHub (da lì Basketball Reference risponde). Per ogni giocatore nelle rose:
//  1) trova la prima stagione NBA giocata (pagine «per game» di Basketball Reference, dalla 2003/04 in poi);
//  2) se la prima stagione è prima della 2024/25 scarica il game log di quella stagione (solo regular season) e calcola il PDK
//     di ogni partita con la stessa formula Dunkest dell'app (tvPdk; le stoppate subite non ci sono nei vecchi tabellini: 0);
//  3) anche 2024/25 e 2025/26 dal game log (l'app ci mette sopra i PDK ufficiali per data); la stagione in corso l'app la prende dai tabellini Dynasty TV.
// Scrive primo-anno.js (window.PRIMO_ANNO). I giocatori già scaricati non si riscaricano: un giro nuovo aggiunge solo chi manca.
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),"..");const FILE=path.join(ROOT,"primo-anno.js");
const UA={"user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36","accept-language":"en-US,en;q=0.9"};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url,tries=3){for(let i=0;i<tries;i++){try{const r=await fetch(url,{headers:UA});if(r.ok)return await r.text();console.log("HTTP",r.status,url);if(r.status===429)await sleep(60000)}catch(e){console.log("ERR",url,e.message)}await sleep(4000*(i+1))}return null}
const nz=n=>String(n).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+/g," ").trim();
const nzs=n=>nz(n).replace(/\s+(jr|sr|ii|iii|iv)$/,"");
const strip=s=>String(s||"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&nbsp;/g," ").trim();

/* 1) giocatori delle rose, dall'app (rose vere, con le trade) */
let pw;try{pw=await import("playwright")}catch(e){pw=createRequire(import.meta.url)("playwright")}const {chromium}=pw.default||pw;
const MIME={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const f=path.join(ROOT,u==="/"?"index.html":u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));const port=srv.address().port;
const br=await chromium.launch();const ctx=await br.newContext({serviceWorkers:"block"});await ctx.route(u=>!/^http:\/\/127\.0\.0\.1:/.test(String(u)),r=>r.abort());
const pg=await ctx.newPage();await pg.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:"load"});await pg.waitForFunction(()=>typeof ROSTER!=="undefined",null,{timeout:60000});await pg.waitForTimeout(3000);
const PL=await pg.evaluate(()=>{const o=[];for(const t in ROSTER)for(const p of ROSTER[t])o.push({n:p[0],t,nba:p[3],anno:(typeof NBA_ANNO!=="undefined"&&NBA_ANNO[p[0]])||null});return o});
await br.close();srv.close();
console.log("Giocatori nelle rose:",PL.length);

let OLD={p:{}};try{const t=fs.readFileSync(FILE,"utf8"),m=t.match(/window\.PRIMO_ANNO=([\s\S]*);\s*$/);if(m)OLD=JSON.parse(m[1])}catch(e){console.log("file nuovo")}
const OUT={upd:new Date().toISOString(),p:{}};
const YC0=(()=>{const d=new Date();return d.getUTCMonth()>=7?d.getUTCFullYear()+1:d.getUTCFullYear()})();
/* (1664) game log per TUTTI (anche 2024/25 e 2025/26); la stagione in corso la fa l'app dai tabellini Dynasty TV */
const todo=PL.filter(x=>{const o=OLD.p[x.n];if(o&&((o.g&&o.g.length)||o.y>=YC0))return OUT.p[x.n]=o,false;return true});
console.log("Da cercare:",todo.length);

/* 2) prima stagione: pagine per game 2003/04 → oggi (anno = fine stagione, come Basketball Reference) */
const now=new Date(),YC=now.getUTCMonth()>=7?now.getUTCFullYear()+1:now.getUTCFullYear();
const first={};const want=new Set(todo.map(x=>nz(x.n))),wantS=new Map(todo.map(x=>[nzs(x.n),x.n]));
if(todo.length)for(let y=2004;y<=YC;y++){const h=await get(`https://www.basketball-reference.com/leagues/NBA_${y}_per_game.html`);await sleep(3500);if(!h){console.log("pagina mancante",y);continue}
  const re=/<a href="\/players\/([a-z])\/([a-z0-9]+)\.html">([^<]+)<\/a>/g;let m,c=0;
  while((m=re.exec(h))){const nm=strip(m[3]),k=nz(nm);let who=null;if(want.has(k))who=todo.find(x=>nz(x.n)===k).n;
    if(!who)continue;if(first[who])continue;first[who]={y,l:m[1],id:m[2],bn:nm};c++}
  /* nomi con Jr./II scritti diversamente: secondo giro solo per chi manca, sul nome senza suffisso */
  re.lastIndex=0;while((m=re.exec(h))){const nm=strip(m[3]),ks=nzs(nm),who=wantS.get(ks);if(!who||first[who])continue;if(nz(who)!==nz(nm)&&!/(jr|sr|ii|iii|iv)\.?$/i.test(who+" "+nm))continue;first[who]={y,l:m[1],id:m[2],bn:nm};c++}
  if(c)console.log(y,"nuovi primi anni:",c)}

/* 3) game log della prima stagione (solo se prima del 2024/25) */
const num=v=>{const x=parseFloat(String(v).replace(/[^0-9.\-]/g,""));return isNaN(x)?0:x};
const mins=v=>{const s=String(v||"");if(s.includes(":")){const[a,b]=s.split(":");return(+a||0)+(+b||0)/60}return num(s)};
function pdk(s,starter,win){let v=s.pts+s.drb+1.25*s.orb+1.5*(s.ast+s.stl+s.blk)-1.5*s.tov-(s.fga-s.fgm)-(s.fta-s.ftm)+(starter?1:0);const t=s.tpm;v+=t>=5?5:t>=3?t:0;const c=[s.pts,s.trb,s.ast,s.stl,s.blk].filter(x=>x>=10).length;v+=c>=4?50:c===3?10:c===2?5:0;if(win)v+=.05*Math.abs(v);return Math.round(v*100)/100}
function parseLog(h){h=h.replace(/<!--|-->/g,"");const ti=h.search(/id="(player_game_log_reg|pgl_basic)"/);if(ti<0)return null;const end=h.indexOf("</table>",ti);const T=h.slice(ti,end);
  const rows=T.split(/<tr[^>]*>/).slice(1),G=[];
  for(const r of rows){const cell={};const re=/<t[dh][^>]*data-stat="([^"]+)"[^>]*>([\s\S]*?)<\/t[dh]>/g;let m;while((m=re.exec(r)))cell[m[1]]=strip(m[2]);
    const mp=cell.mp;if(!mp||!/\d/.test(mp))continue;if(cell.reason)continue;const d=cell.date||cell.date_game||"";if(!/\d{4}-\d{2}-\d{2}/.test(d))continue;
    const s={pts:num(cell.pts),orb:num(cell.orb),drb:num(cell.drb),trb:num(cell.trb),ast:num(cell.ast),stl:num(cell.stl),blk:num(cell.blk),tov:num(cell.tov),fgm:num(cell.fg),fga:num(cell.fga),tpm:num(cell.fg3),tpa:num(cell.fg3a),ftm:num(cell.ft),fta:num(cell.fta)};
    if(!cell.orb&&!cell.drb)s.drb=s.trb;
    const gs=/^(1|\*|Y)$/i.test(cell.gs||cell.is_starter||"")||cell.gs==="1",res=cell.game_result||"",win=/^W/.test(res),mn=Math.round(mins(mp)*10)/10;
    const dd=d.match(/(\d{4})-(\d{2})-(\d{2})/);
    G.push([`${+dd[3]}/${dd[2]}`,(cell.opp_name_abbr||cell.opp_id||"").replace(/<[^>]+>/g,""),mn,pdk(s,gs,win),s.pts,s.trb,s.ast,s.stl,s.blk,s.tov,s.fgm,s.fga,s.tpm,s.tpa,s.ftm,s.fta,gs?1:0,win?1:0,cell.team_name_abbr||cell.team_id||""])}
  return G}
let nOk=0,nKo=0;
for(const x of todo){const f=first[x.n];if(!f){console.log("prima stagione NON trovata:",x.n);OUT.p[x.n]={y:x.anno?+x.anno+1:null,src:"?"};continue}
  const o={y:f.y,id:f.id,bn:f.bn};
  if(f.y<YC){const h=await get(`https://www.basketball-reference.com/players/${f.l}/${f.id}/gamelog/${f.y}`);await sleep(3500);const G=h?parseLog(h):null;
    if(G&&G.length){o.g=G;o.tm=[...new Set(G.map(g=>g[18]))].filter(Boolean).join("/");G.forEach(g=>g.pop());nOk++}else{console.log("game log vuoto:",x.n,f.y);nKo++}}
  OUT.p[x.n]=o;console.log(x.n,"→",f.y-1+"/"+String(f.y).slice(2),o.g?o.g.length+" partite":"(dati dall'app)")}
fs.writeFileSync(FILE,"/* PRIMO ANNO NBA dei giocatori Dreamers — file generato da tools/primo_anno.mjs (azione GitHub «primo-anno»), non modificare a mano.\n   g: [data, avversario, minuti, PDK, punti, rimbalzi, assist, rubate, stoppate, perse, tiri fatti, tiri tentati, triple fatte, triple tentate, liberi fatti, liberi tentati, titolare, vittoria] */\nwindow.PRIMO_ANNO="+JSON.stringify(OUT)+";\n");
console.log(`Fatto: ${Object.keys(OUT.p).length} giocatori, ${nOk} game log nuovi, ${nKo} vuoti`);
