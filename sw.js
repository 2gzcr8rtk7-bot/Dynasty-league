// Usa sempre la versione più recente quando c'è rete; la copia salvata serve solo offline.
const CACHE="dynasty-v844";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll([/* (856) "reload": la copia salvata va presa dal server, non dalla cache del browser (che può tenere la versione vecchia fino a 10 minuti) */"./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","icon-512-maskable.png","dreamers-data.js","spazio-data.js","tv-data.js","hl-data.js","img/1bbcb183cbd9.png","img/2402cd92d5d7.png","img/447ab01f859c.png","img/616120d5bd88.png","img/756630104519.png","img/80465239f661.png","img/98cb6dfa2b36.png","img/c75de376d2cb.png","img/cc9ccfb8f0bc.png","img/d58d40c4875c.png","img/e5e4d392816e.png","img/f39bda081f60.png","img/f85596a38af8.png","loghi/nba/1610612737.svg","loghi/nba/1610612738.svg","loghi/nba/1610612739.svg","loghi/nba/1610612740.svg","loghi/nba/1610612741.svg","loghi/nba/1610612742.svg","loghi/nba/1610612743.svg","loghi/nba/1610612744.svg","loghi/nba/1610612745.svg","loghi/nba/1610612746.svg","loghi/nba/1610612747.svg","loghi/nba/1610612748.svg","loghi/nba/1610612749.svg","loghi/nba/1610612750.svg","loghi/nba/1610612751.svg","loghi/nba/1610612752.svg","loghi/nba/1610612753.svg","loghi/nba/1610612754.svg","loghi/nba/1610612755.svg","loghi/nba/1610612756.svg","loghi/nba/1610612757.svg","loghi/nba/1610612758.svg","loghi/nba/1610612759.svg","loghi/nba/1610612760.svg","loghi/nba/1610612761.svg","loghi/nba/1610612762.svg","loghi/nba/1610612763.svg","loghi/nba/1610612764.svg","loghi/nba/1610612765.svg","loghi/nba/1610612766.svg"].map(u=>new Request(u,{cache:"reload"})))))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  /* dati esterni (es. NBA live con ?t=…): passano diretti, senza salvarli in memoria, altrimenti la cache cresce a ogni aggiornamento */
  if(new URL(e.request.url).origin!==location.origin)return;
  if(e.request.url.includes("/liveData/"))return; /* dati live NBA: sempre dalla rete, mai in cache */
  /* pagina e file dell'app: chiedi sempre la versione nuova al server, ignorando la cache del browser (GitHub Pages tiene i file fino a 10 minuti) */
  const u=new URL(e.request.url),fresh=e.request.mode==="navigate"||(u.origin===location.origin&&/\.(html|js|webmanifest)$|\/$/.test(u.pathname));
  /* (645) loghi NBA: prima la copia salvata, così non lampeggiano né dipendono dalla rete */
  if(u.pathname.includes("/loghi/nba/")||u.pathname.includes("/img/")){/* (853) anche le immagini dell'app (loghi delle squadre ecc., prima dentro index.html) */e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(k=>k.put(e.request,cp)).catch(()=>{});return r})));return}
  /* (853) APERTURA VELOCE: si chiede la versione nuova alla rete, ma se non arriva entro 1,2 s si usa subito la copia salvata
     (la versione nuova finisce comunque in memoria e si vede alla prossima apertura) */
  /* (1090) chiave di cache senza «?v=…»: così poke.js?v=123 ritrova la copia salvata di poke.js e, se manca, si aspetta la rete (prima si rispondeva con index.html al posto del file JS e il gioco non partiva) */const isNav=e.request.mode==="navigate",ck=isNav?"./":u.origin+u.pathname;
  const net=(fresh?fetch(isNav?u.href:e.request,{cache:"no-cache"}):fetch(e.request)).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(ck,cp)).catch(()=>{})}return r});
  if(fresh){e.respondWith(new Promise(res=>{let done=false;const fb=()=>caches.match(ck).then(c=>c||(isNav?caches.match("index.html"):null)).then(c=>{if(c&&!done){done=true;res(c)}});
    const tm=setTimeout(fb,1200);net.then(r=>{if(!done){done=true;clearTimeout(tm);res(r)}}).catch(()=>{clearTimeout(tm);fb().then(()=>{if(!done){done=true;res(Response.error())}})});e.waitUntil(net.catch(()=>{}))}));return}
  e.respondWith(net.catch(()=>caches.match(ck).then(r=>r||(isNav?caches.match("index.html"):Response.error()))));
});
