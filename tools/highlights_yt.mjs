// DYNASTY TV – associa i video del canale YouTube "The Game Time Highlights" alle partite NBA di tv-data.js
// e scrive hl-data.js ({"2026-10-28_MIAATL":"<id video>",...}). Lo esegue GitHub (workflow highlights.yml).
// Usa SOLO l'API ufficiale YouTube Data v3: serve la chiave nel segreto YT_API_KEY (se manca esce senza fare nulla).
// Opzioni: --prova (stampa gli abbinamenti senza scrivere).
import fs from "node:fs";
const KEY=process.env.YT_API_KEY,HANDLE="@thegametimehighlights",PROVA=process.argv.includes("--prova");
if(!KEY){console.log("YT_API_KEY mancante: niente da fare");process.exit(0)}
const api=async(path,q)=>{const u=new URL("https://www.googleapis.com/youtube/v3/"+path);for(const[k,v]of Object.entries({...q,key:KEY}))u.searchParams.set(k,v);
  const r=await fetch(u);if(!r.ok)throw new Error(`YouTube API ${path}: ${r.status} ${(await r.text()).slice(0,300)}`);return r.json()};
const load=f=>{const s=fs.readFileSync(f,"utf8");return Function(s.replace(/^\s*const\s+(\w+)\s*=/m,"return "))()};
const TV=load("tv-data.js"),TVHL0=fs.existsSync("hl-data.js")?load("hl-data.js"):{};

// 1) ultimi video caricati dal canale (playlist "uploads")
const ch=await api("channels",{part:"contentDetails",forHandle:HANDLE});
const up=ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;if(!up)throw new Error("canale non trovato");
const vids=[];let tok="";
for(let i=0;i<3;i++){const r=await api("playlistItems",{part:"snippet",playlistId:up,maxResults:50,...(tok?{pageToken:tok}:{})});
  for(const it of r.items||[])vids.push({id:it.snippet.resourceId.videoId,t:it.snippet.title,pub:it.snippet.publishedAt});
  tok=r.nextPageToken;if(!tok)break}

// 2) nomi delle squadre come appaiono nei titoli
const norm=s=>s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
const EXTRA={PHI:["sixers"],MIN:["wolves","t wolves"],POR:["blazers"],LAL:["la lakers"],LAC:["la clippers"],GSW:["dubs"],OKC:["okc"],NYK:["ny knicks"]};
const ALIAS=Object.entries(TV.teams).map(([c,[full]])=>{const w=full.split(" "),nick=w.at(-1)==="Blazers"?"trail blazers":norm(w.at(-1));
  return[c,[norm(full),nick,...(EXTRA[c]||[])]]});
const teamsIn=t=>{const s=" "+norm(t)+" ",hit=[];for(const[c,al]of ALIAS){let p=-1;for(const a of al){const i=s.indexOf(" "+a+" ");if(i>=0&&(p<0||i<p))p=i}if(p>=0)hit.push([p,c])}
  return hit.sort((x,y)=>x[0]-y[0]).map(x=>x[1])};
const MESI=["january","february","march","april","may","june","july","august","september","october","november","december"];
const dateIn=t=>{const s=norm(t);let m=s.match(new RegExp(`(${MESI.map(x=>x.slice(0,3)).join("|")})[a-z]* (\\d{1,2})(?: (20\\d\\d))?`));
  if(m)return{m:MESI.findIndex(x=>x.startsWith(m[1]))+1,d:+m[2],y:m[3]?+m[3]:null};
  m=t.match(/\b(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?\b/);if(m)return{m:+m[1],d:+m[2],y:m[3]?(+m[3]<100?2000+ +m[3]:+m[3]):null};return null};
const games=[];for(const[d,L]of Object.entries(TV.days))for(const g of L)if(g[5]==="F")games.push({d,a:g[0],h:g[1],key:g[7]});
const day=s=>Date.parse(s+"T12:00:00Z");
// esclude video che non sono la sintesi della partita (giocatori singoli, top 10, ecc.)
const NOGAME=/\b(top \d+|top plays|mix|career|all time|press conference|postgame|interview|full game replay)\b/;

// 3) abbinamento: le due squadre nel titolo + data (dal titolo se c'è, altrimenti la partita più recente prima della pubblicazione, entro 3 giorni)
const out={...TVHL0},nuovi=[],dubbi=[];
for(const v of vids.sort((x,y)=>x.pub.localeCompare(y.pub))){const T=teamsIn(v.t);if(T.length!==2||NOGAME.test(norm(v.t)))continue;
  const pub=Date.parse(v.pub),dt=dateIn(v.t);
  let c=games.filter(g=>[g.a,g.h].sort().join()===[...T].sort().join()&&day(g.d)<=pub+864e5&&pub-day(g.d)<4*864e5);
  if(dt)c=c.filter(g=>{const[y,m,d]=g.d.split("-").map(Number);return m===dt.m&&d===dt.d&&(!dt.y||dt.y===y)});
  if(!c.length)continue;const g=c.sort((x,y)=>y.d.localeCompare(x.d))[0];
  if(out[g.key]){if(out[g.key]!==v.id)dubbi.push(`${g.key}: già ${out[g.key]}, ignorato ${v.id} "${v.t}"`);continue}
  out[g.key]=v.id;nuovi.push(`${g.key} ← ${v.id} "${v.t}"`)}
console.log(`Video letti: ${vids.length} · abbinati nuovi: ${nuovi.length}`);nuovi.forEach(x=>console.log("  "+x));dubbi.forEach(x=>console.log("  (doppio) "+x));
const senza=vids.filter(v=>!Object.values(out).includes(v.id)).slice(-15);if(senza.length)console.log("Non abbinati (ultimi):\n"+senza.map(v=>`  ${v.pub.slice(0,10)} ${v.t}`).join("\n"));
if(PROVA||!nuovi.length)process.exit(0);
const ord=Object.fromEntries(Object.entries(out).sort());
fs.writeFileSync("hl-data.js","/* DYNASTY TV – video highlights YouTube per partita, generato da tools/highlights_yt.mjs (GitHub), non modificare a mano */\nconst TVHL="+JSON.stringify(ord)+";\n");
console.log("Scritto hl-data.js");
