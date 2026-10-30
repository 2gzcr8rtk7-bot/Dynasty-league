// Usa sempre la versione più recente quando c'è rete; la copia salvata serve solo offline.
const CACHE="dynasty-v129";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","icon-512-maskable.png","dreamers-data.js","spazio-data.js","tv-data.js","hl-data.js"])))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  /* dati esterni (es. NBA live con ?t=…): passano diretti, senza salvarli in memoria, altrimenti la cache cresce a ogni aggiornamento */
  if(new URL(e.request.url).origin!==location.origin)return;
  if(e.request.url.includes("/liveData/"))return; /* dati live NBA: sempre dalla rete, mai in cache */
  /* pagina e file dell'app: chiedi sempre la versione nuova al server, ignorando la cache del browser (GitHub Pages tiene i file fino a 10 minuti) */
  const u=new URL(e.request.url),fresh=e.request.mode==="navigate"||(u.origin===location.origin&&/\.(html|js|webmanifest)$|\/$/.test(u.pathname));
  e.respondWith((fresh?fetch(e.request.mode==="navigate"?u.href:e.request,{cache:"no-cache"}):fetch(e.request)).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))));
});
