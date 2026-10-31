// Usa sempre la versione più recente quando c'è rete; la copia salvata serve solo offline.
const CACHE="dynasty-v243";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","icon-512-maskable.png","dreamers-data.js","spazio-data.js","tv-data.js","hl-data.js","loghi/nba/1610612737.svg","loghi/nba/1610612738.svg","loghi/nba/1610612739.svg","loghi/nba/1610612740.svg","loghi/nba/1610612741.svg","loghi/nba/1610612742.svg","loghi/nba/1610612743.svg","loghi/nba/1610612744.svg","loghi/nba/1610612745.svg","loghi/nba/1610612746.svg","loghi/nba/1610612747.svg","loghi/nba/1610612748.svg","loghi/nba/1610612749.svg","loghi/nba/1610612750.svg","loghi/nba/1610612751.svg","loghi/nba/1610612752.svg","loghi/nba/1610612753.svg","loghi/nba/1610612754.svg","loghi/nba/1610612755.svg","loghi/nba/1610612756.svg","loghi/nba/1610612757.svg","loghi/nba/1610612758.svg","loghi/nba/1610612759.svg","loghi/nba/1610612760.svg","loghi/nba/1610612761.svg","loghi/nba/1610612762.svg","loghi/nba/1610612763.svg","loghi/nba/1610612764.svg","loghi/nba/1610612765.svg","loghi/nba/1610612766.svg"])))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  /* dati esterni (es. NBA live con ?t=…): passano diretti, senza salvarli in memoria, altrimenti la cache cresce a ogni aggiornamento */
  if(new URL(e.request.url).origin!==location.origin)return;
  if(e.request.url.includes("/liveData/"))return; /* dati live NBA: sempre dalla rete, mai in cache */
  /* pagina e file dell'app: chiedi sempre la versione nuova al server, ignorando la cache del browser (GitHub Pages tiene i file fino a 10 minuti) */
  const u=new URL(e.request.url),fresh=e.request.mode==="navigate"||(u.origin===location.origin&&/\.(html|js|webmanifest)$|\/$/.test(u.pathname));
  /* (645) loghi NBA: prima la copia salvata, così non lampeggiano né dipendono dalla rete */
  if(u.pathname.includes("/loghi/nba/")){e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(k=>k.put(e.request,cp)).catch(()=>{});return r})));return}
  e.respondWith((fresh?fetch(e.request.mode==="navigate"?u.href:e.request,{cache:"no-cache"}):fetch(e.request)).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
});
