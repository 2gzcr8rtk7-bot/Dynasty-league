// (1216) MACCHINA DEL TEMPO · archivio automatico delle stagioni.
// Apre l'app in un browser senza schermo, chiede a tempo.js la fotografia della stagione in corso (window.ttArchivia)
// e la salva in tempo-archivio.js: rosa di ogni franchigia (con le trade) fino alla fine dei playoff; a regular season finita
// anche calendario, PDK di ogni turno, base e classifica vera, così la stagione si potrà rigiocare «a ritroso» con qualsiasi rosa.
// Una stagione chiusa non viene più toccata.
import http from "node:http";import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),"..");const FILE=path.join(ROOT,"tempo-archivio.js");
let pw;try{pw=await import("playwright")}catch(e){pw=createRequire(import.meta.url)("playwright")}const {chromium}=pw.default||pw;
const MIME={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".jpg":"image/jpeg",".webmanifest":"application/manifest+json"};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split("?")[0]);const f=path.join(ROOT,u==="/"?"index.html":u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{"content-type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(r)});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));const port=srv.address().port;
const b=await chromium.launch();const ctx=await b.newContext({serviceWorkers:"block"});
await ctx.route(u=>!/^http:\/\/127\.0\.0\.1:/.test(String(u)),r=>r.abort());
const p=await ctx.newPage();await p.goto(`http://127.0.0.1:${port}/index.html`,{waitUntil:"load"});
await p.waitForFunction(()=>typeof window.ttArchivia==="function"&&typeof ROSTER!=="undefined",null,{timeout:60000});await p.waitForTimeout(4000);
const o=await p.evaluate(()=>window.ttArchivia());await b.close();srv.close();
let A={};try{const t=fs.readFileSync(FILE,"utf8"),m=t.match(/window\.TT_ARCH=([\s\S]*);\s*$/);if(m)A=JSON.parse(m[1])}catch(e){console.log("archivio nuovo")}
const old=A[o.idx];
if(old&&old.chiusa){console.log(`Stagione ${o.lab} già chiusa: non la tocco`);process.exit(0)}
const same=old&&JSON.stringify({...old,upd:0})===JSON.stringify({...o,upd:0});
if(same){console.log("Nessuna novità");process.exit(0)}
A[o.idx]=o;
fs.writeFileSync(FILE,"/* MACCHINA DEL TEMPO · archivio delle stagioni — file generato da tools/tempo_archivio.mjs (azione GitHub «tempo»), non modificare a mano. */\nwindow.TT_ARCH="+JSON.stringify(A)+";\n");
console.log(`Stagione ${o.lab} salvata: ${Object.keys(o.rose).length} rose${o.acc?`, ${o.turni.length} turni`:""}${o.chiusa?" · CHIUSA":""}`);
