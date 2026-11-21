/* (1143) ASSISTENTE GM – area segreta Ducks. Calcoli e pagina.
   Dati: Dynasty TV (TV.days / TV.box: tabellini di TUTTE le partite NBA della stagione) + gm-nba.js (GMNBA: contratti Basketball Reference,
   free agent e cap Spotrac, ruoli/età e notizie ESPN; GitHub lo aggiorna ogni giorno).
   - EMERGENTI: per ogni giocatore minuti e PDK nelle ultime 6 partite contro le prime della stagione, quota dei minuti del suo reparto
     (G/F/C) nella squadra, partenze da titolare. Il punteggio «in crescita» pesa i minuti guadagnati, il PDK guadagnato e la quota presa ai pari ruolo.
   - CHI PERDE IL POSTO: per ogni emergente i pari ruolo della stessa squadra che hanno perso più minuti nello stesso periodo.
   - RISCHIO SCAMBIO: scadenza vicina (soprattutto RFA/UFA o opzioni), squadra sopra luxury tax / apron, reparto affollato, contratto
     pesante rispetto al rendimento, età. Per i più a rischio: squadre che potrebbero prenderlo (reparto più debole + spazio nel cap).
   - CLASSIFICA INVESTIMENTI: crescita + giovane età + possibile scambio verso più minuti. Tutto è una stima: aiuta a guardare prima, non decide. */
(function(){
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>v==null||isNaN(v)?"—":(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const sg=(v,f=f1)=>v==null||isNaN(v)?"—":(v>0?"+":v<0?"−":"±")+f(Math.abs(v));
const nz=n=>String(n).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").replace(/\s+/g," ").trim();
const mins=m=>{const a=String(m||"0").split(":");return(+a[0]||0)+(+a[1]||0)/60};
const G=()=>typeof GMNBA!=="undefined"?GMNBA:null;
const CSS=`.gmas{padding-bottom:30px}.gmhero{margin:8px 0 10px;padding:14px 14px 12px;border-radius:16px;background:linear-gradient(135deg,#1e1b4b,#0f172a);color:#fff;border:1px solid rgba(167,139,250,.35)}.gmhero small{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa}.gmhero b{display:block;font-size:1.45rem;margin:2px 0}.gmhero em{font-style:normal;font-size:.78rem;color:#cbd5e1}
.gmtabs,.gmfil,.gmtms{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}.gmtabs button,.gmfil button,.gmtms button{flex:0 0 auto;border:1px solid var(--line,rgba(128,128,128,.3));background:var(--panel,#fff);color:inherit;border-radius:999px;padding:7px 12px;font:inherit;font-size:.8rem;font-weight:700}.gmfil button,.gmtms button{padding:5px 10px;font-size:.74rem}.gmfil span{flex:0 0 8px}
.gmas [aria-pressed=true]{background:#7c3aed!important;color:#fff!important;border-color:#7c3aed!important}
.gmnote{font-size:.78rem;color:var(--muted,#64748b);margin:4px 2px 10px;line-height:1.4}.gmnote.warn{color:#d97706}.gmnote.small{font-size:.68rem;margin-top:16px}
.gmrw{cursor:pointer;display:grid;grid-template-columns:26px 1fr auto auto auto;gap:8px;align-items:center;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line,rgba(128,128,128,.18));background:none;color:inherit;font:inherit;padding:9px 2px}.gmrw.sq{grid-template-columns:1fr auto auto auto auto}
.gmk{font-size:.8rem;color:var(--muted,#64748b);text-align:center}.gxn{min-width:0}.gxn b{display:block;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gxn small{display:block;font-size:.68rem;color:var(--muted,#64748b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gmper{display:block;font-style:normal;font-size:.68rem;color:#a78bfa;margin-top:2px;white-space:normal}
.gmv{text-align:right;min-width:44px}.gmv b{display:block;font-size:.85rem}.gmv small{display:block;font-size:.64rem;color:var(--muted,#64748b)}.gmas .up{color:#16a34a}.gmas .dn{color:#dc2626}
.gmown{display:inline-flex;align-items:center;gap:3px;color:#7c3aed;font-weight:700}.gmown .gmb,.gmown img{width:13px;height:13px}.gmfa{color:#16a34a;font-weight:700}
.gmrep{margin:16px 2px 6px;font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#7c3aed}
.gmhd{display:grid;grid-template-columns:1fr auto auto auto auto;gap:8px;font-size:.6rem;color:var(--muted,#64748b);text-transform:uppercase;padding:4px 2px;border-bottom:1px solid var(--line,rgba(128,128,128,.3))}.gmhd span:nth-child(n+2){text-align:right;min-width:44px}.gmhd span:last-child{min-width:60px}
.gmcap,.gmcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin:6px 0}.gmcap div,.gmcards div,.gmct div{background:var(--panel,#fff);border:1px solid var(--line,rgba(128,128,128,.2));border-radius:12px;padding:8px 10px}.gmcap small,.gmcards small,.gmct small{display:block;font-size:.62rem;color:var(--muted,#64748b);text-transform:uppercase}.gmcap b,.gmcards b,.gmct b{display:block;font-size:1.05rem}.gmcap em,.gmcards em,.gmct em{display:block;font-style:normal;font-size:.66rem;color:var(--muted,#64748b)}
.gmct{display:flex;gap:6px;overflow-x:auto}.gmct div{flex:0 0 auto;min-width:78px}
.gmph{margin:8px 2px}.gmph b{display:block;font-size:1.35rem}.gmph small{font-size:.78rem;color:var(--muted,#64748b)}
.gmbox{background:#0f172a;border-radius:14px;padding:8px;margin:8px 0}.gmch{width:100%;height:auto;display:block}.gmleg{display:flex;flex-wrap:wrap;gap:10px;font-size:.64rem;color:#cbd5e1;padding:4px 4px 0}.gmleg i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}
.gmpe{display:grid;grid-template-columns:1fr auto auto;gap:8px;padding:7px 2px;border-bottom:1px solid var(--line,rgba(128,128,128,.18));font-size:.8rem}.gmpe span{color:var(--muted,#64748b);font-size:.72rem}.gmpe.me b{color:#7c3aed}.gmpe.gmde{grid-template-columns:44px 1fr}
.gmnw{display:block;text-decoration:none;color:inherit;padding:9px 2px;border-bottom:1px solid var(--line,rgba(128,128,128,.18))}.gmnw small{font-size:.62rem;color:var(--muted,#64748b)}.gmnw b{display:block;font-size:.84rem;margin:1px 0}.gmnw span{display:block;font-size:.72rem;color:var(--muted,#64748b)}
.gmsp{display:block}.gmph{position:relative}.gmseg{float:right;margin:4px 0 0 8px}.gmseg .segi{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;border:1px solid rgba(250,204,21,.5);color:#facc15;font:800 12px system-ui;cursor:pointer}.gmseg .segi svg{width:15px;height:15px}.gmseg .segi em{font-style:normal}.gmseg .segi.on{background:#facc15;color:#1a1200}.gmlet{border:1px solid rgba(124,58,237,.45);background:linear-gradient(135deg,rgba(124,58,237,.12),transparent 70%);border-radius:14px;padding:6px 12px;margin:6px 0 10px}.gmlet p{margin:7px 0;font-size:.82rem;line-height:1.45}.gmfls{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0 1px}.gmfl{font-size:.62rem;font-weight:800;padding:1px 7px;border-radius:999px;background:rgba(124,58,237,.18);color:#a78bfa}.gmfl.w{background:rgba(245,158,11,.18);color:#d97706}.gmtx{white-space:normal}.gmtx b{color:inherit}.gmwin.gm2{grid-template-columns:1fr 1fr}.gmth.gm3,.gmtr.gm3{grid-template-columns:minmax(0,1.3fr) repeat(3,minmax(0,1fr))}.gmpe.gmdv{grid-template-columns:1fr auto auto;align-items:center}.gmpe.gmdv b small{display:block;font-weight:400;font-size:.66rem;color:var(--muted,#64748b)}.gmwin{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.gmwin button{border:1px solid var(--line,rgba(128,128,128,.3));background:var(--panel,transparent);color:inherit;border-radius:10px;padding:8px;font:inherit;font-weight:800;font-size:.82rem}
.gmver{border-radius:14px;padding:12px;margin:6px 0 10px;background:var(--panel,rgba(128,128,128,.08));border:1px solid var(--line,rgba(128,128,128,.25))}.gmver.up{border-color:rgba(34,197,94,.55);background:linear-gradient(135deg,rgba(34,197,94,.14),transparent 70%)}.gmver.dn{border-color:rgba(220,38,38,.5);background:linear-gradient(135deg,rgba(220,38,38,.12),transparent 70%)}
.gmvt{display:grid;grid-template-columns:auto 1fr;gap:0 10px;align-items:center}.gmvt span{grid-row:1/3;font-size:1.9rem}.gmvt b{font-size:1.15rem}.gmvt em{font-style:normal;font-size:.78rem;color:var(--muted,#64748b)}
.gmdec{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 6px}.gmdec div{background:rgba(128,128,128,.1);border-radius:10px;padding:7px 9px}.gmdec small{display:block;font-size:.62rem;text-transform:uppercase;color:var(--muted,#64748b)}.gmdec b{display:block;font-size:1.25rem}.gmdec em{font-style:normal;font-size:.7rem;color:var(--muted,#64748b)}
.gmbar2{display:flex;height:7px;border-radius:4px;overflow:hidden}.gmbar2 .m{background:#38bdf8}.gmbar2 .r{background:#a78bfa}
.gmwhy{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;align-items:center}.gmwhy b{width:100%;font-size:.76rem}.gmwhy span{font-size:.72rem;padding:3px 8px;border-radius:999px;background:rgba(34,197,94,.16);color:#16a34a;font-weight:700}.gmwhy.dn span{background:rgba(220,38,38,.14);color:#dc2626}
.gmtb{margin:8px 0 0;font-size:.76rem}.gmth,.gmtr{display:grid;grid-template-columns:minmax(0,1.35fr) repeat(4,minmax(0,1fr));align-items:center;border-bottom:1px solid var(--line,rgba(128,128,128,.18))}.gmth{font-size:.6rem;text-transform:uppercase;color:var(--muted,#64748b);font-weight:800;padding:4px 0}.gmth span,.gmtr span{text-align:right;padding:6px 3px;white-space:nowrap}.gmth small{display:block;text-transform:none;font-weight:400}.gmth .sel{color:#7c3aed}.gmtr b{font-weight:600;color:var(--muted,#64748b);padding:6px 2px;font-size:.74rem}.gmtr .sel{background:rgba(124,58,237,.12)}.gmtr .up{color:#16a34a;font-weight:800}.gmtr .dn{color:#dc2626;font-weight:800}.gmtr i{font-style:normal;font-size:.55rem;margin-left:2px}.gmtr .nd{color:var(--muted,#64748b)}
.gmmate{border:1px solid var(--line,rgba(128,128,128,.25));border-radius:12px;padding:9px 10px;margin:6px 0;background:var(--panel,transparent)}.gmmate.same{border-left:4px solid #7c3aed}.gmmh{display:grid;grid-template-columns:1fr auto;gap:0 8px}.gmmh b{font-size:.92rem}.gmmh small{grid-row:2;font-size:.68rem;color:var(--muted,#64748b)}.gmd{grid-row:1/3;grid-column:2;align-self:center;font-size:.74rem;font-weight:800;text-align:right}
.gmcmp{margin-top:6px}.gmcmp div{display:grid;grid-template-columns:108px 1fr 98px;gap:6px;align-items:center;font-size:.68rem;padding:2px 0}.gmcmp small{color:var(--muted,#64748b)}.gmcmp i{height:9px;border-radius:5px;background:rgba(128,128,128,.18);overflow:hidden}.gmcmp i b{display:block;height:100%;background:#7c3aed}.gmcmp i b.o{background:#38bdf8}.gmcmp em{font-style:normal;text-align:right;font-weight:700}
.gmmf{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.gmmf span{font-size:.66rem;padding:2px 7px;border-radius:999px;background:rgba(128,128,128,.14)}.gmmf .hot{background:rgba(220,38,38,.16);color:#dc2626;font-weight:700}
.gmyrs{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:6px;margin:6px 0}.gmyrs>div{background:var(--panel,rgba(128,128,128,.08));border:1px solid var(--line,rgba(128,128,128,.2));border-radius:10px;padding:7px 6px;text-align:center;display:flex;flex-direction:column;align-items:center}.gmyrs>div.cur{border-color:#7c3aed}.gmyrs small{font-size:.62rem;color:var(--muted,#64748b)}.gmyrs>div>b{font-size:1.1rem}.gmyrs i{display:flex;align-items:flex-end;width:18px;height:46px;background:rgba(128,128,128,.15);border-radius:4px;margin:3px 0;overflow:hidden}.gmyrs i b{display:block;width:100%;background:#7c3aed}.gmyrs em{font-style:normal;font-size:.6rem;color:var(--muted,#64748b);line-height:1.3}
.gmrisk i{display:block;height:9px;border-radius:5px;background:rgba(128,128,128,.18);overflow:hidden}.gmrisk i b{display:block;height:100%;background:linear-gradient(90deg,#22c55e,#facc15,#dc2626)}.gmw div{display:grid;grid-template-columns:130px 1fr 74px;gap:8px;align-items:center;font-size:.74rem;padding:3px 2px}.gmw i{display:block;height:8px;border-radius:4px;background:rgba(128,128,128,.2);overflow:hidden}.gmw i b{display:block;height:100%;background:#7c3aed}.gmw em{font-style:normal;text-align:right;font-weight:700}.gmrs{color:#7c3aed;font-size:1.05rem!important}.gmpe.gmbt{grid-template-columns:46px 1fr auto}.gmpe.gmbt span{color:inherit;font-size:.74rem}.gmeta{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px 10px;margin:0 0 10px;padding:9px 10px;border:1px solid var(--line,rgba(128,128,128,.3));border-radius:12px;background:var(--panel,transparent)}.gmes{display:flex;gap:4px}.gmes button{border:1px solid var(--line,rgba(128,128,128,.3));background:none;color:inherit;border-radius:999px;padding:5px 10px;font:inherit;font-size:.74rem;font-weight:800}.gmel{text-align:right;font-size:1rem}.gmeta input{grid-column:1/-1;width:100%;accent-color:#7c3aed}.gmeta.o input{accent-color:#dc2626}.gmeta.o .gmel{color:#dc2626}.gmeta [data-gmeta=o27][aria-pressed=true]{background:#dc2626!important;border-color:#dc2626!important}.gmqb{display:flex;height:14px;border-radius:5px;overflow:hidden;margin:4px 0 3px;max-width:260px}.gmqb i{display:block;font-style:normal;font-size:.56rem;font-weight:800;color:#fff;text-align:center;line-height:14px;overflow:hidden}.qG,.gmleg2 .qG{background:#0ea5e9}.qF,.gmleg2 .qF{background:#8b5cf6}.qC,.gmleg2 .qC{background:#f59e0b}
.gmleg2{display:flex;flex-wrap:wrap;gap:10px;font-size:.66rem;color:var(--muted,#64748b);margin:0 2px 6px}.gmleg2 i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}
.gmrw.gmco{grid-template-columns:22px minmax(0,1fr) auto auto;gap:6px}.gmco .gmqb{max-width:100%}.gmqrow{display:grid;grid-template-columns:86px 1fr;align-items:center;gap:8px;font-size:.72rem}.gmqrow .gmqb{max-width:none;height:16px}.gmqrow .gmqb i{line-height:16px}.gmqrow.lg{opacity:.65}
.gmcod{margin:8px 0;border:1px solid var(--line,rgba(128,128,128,.25));border-radius:12px;padding:8px 10px;background:var(--panel,transparent)}.gmcod summary{cursor:pointer;font-size:.8rem;font-weight:700}.gmch1 b{display:block;font-size:1.1rem;margin-top:8px}.gmch1 small{color:var(--muted,#64748b);font-size:.72rem}@media(min-width:800px){.gmas{max-width:900px;margin:0 auto}}`;
{const st=document.createElement("style");st.id="gmcss";st.textContent=CSS;document.head.appendChild(st)}
const RECENT=6;
let CACHE=null;
function lookup(map,n){const g=G();if(!g||!map)return null;if(map[n])return map[n];const k=g.idx&&g.idx[nz(n)];return k&&map[k]?map[k]:null}
const ruolo=n=>{/* prima il ruolo Dreamers (rose e valori), poi quello ESPN */try{for(const t in ROSTER){const q=ROSTER[t].find(x=>x[0]===n);if(q&&q[2])return q[2]}const v=typeof VALMAP!=="undefined"&&typeof vnz==="function"&&VALMAP[vnz(n)];if(v){const m={PG:"G",SG:"G",SF:"F",PF:"F",C:"C",G:"G",F:"F"}[v[0]];if(m)return m}}catch(e){}const r=lookup(G()&&G().ruoli,n);const p=r&&r.p||"";return p==="C"?"C":/G/.test(p)?"G":p?"F":(typeof ruoloDi==="function"&&ruoloDi(n))||"F"};
const owner=n=>{try{for(const t in ROSTER)if(ROSTER[t].some(p=>nz(p[0])===nz(n)))return t}catch(e){}return null};

/* ---------- 1) partite di ogni giocatore dai tabellini ---------- */
function build(){if(typeof TV==="undefined")return null;const key=Object.keys(TV.box).length+"|"+(G()?G().upd:"");if(CACHE&&CACHE.key===key)return CACHE;
 const P={},T={};
 for(const d of Object.keys(TV.days).sort())for(const g of TV.days[d]||[]){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;
  [["a",g[0],g[1]],["h",g[1],g[0]]].forEach(([sd,tm,opp])=>{(T[tm]=T[tm]||{g:[],gm:[]}).g.push(d);const GR={d,r:[]};T[tm].gm.push(GR);(B[sd]||[]).forEach(r=>{GR.r.push({k:nz(r[0]),n:r[0],min:mins(r[2]),tit:!!r[1],pdk:+r[19]||0});const kk=nz(r[0]);const x=P[kk]||(P[kk]={n:r[0],tm,G:[]});x.tm=tm;x.G.push({d,tm,opp,min:mins(r[2]),pdk:+r[19]||0,tit:!!r[1],pt:+r[3]||0,s:[3,4,5,7,8,9,10,12,13,14,15,16,17,18].map(i=>+r[i]||0)})})})}
 /* squadre: partite in ordine e giocatori */
 const out={key,P,T,byTeam:{}};
 /* finestra per squadra: ultime K partite della SQUADRA (chi non gioca conta 0 minuti), così le quote del reparto sommano ai minuti veri */
 for(const tm in T)T[tm].g=[...new Set(T[tm].g)].sort();
 for(const n in P){const x=P[n];const Dt=(T[x.tm]||{g:[]}).g,L=x.G.filter(g=>g.tm===x.tm);if(L.length<3||Dt.length<4)continue;x.r=ruolo(n);
  const K=Math.min(RECENT,Math.max(2,Math.floor(Dt.length/3))),cutD=Dt[Dt.length-K],firstD=L[0].d,oldD=Dt.filter(d=>d<cutD&&d>=firstD).length||1;
  const rec=L.filter(g=>g.d>=cutD),old=L.filter(g=>g.d<cutD),av=(a,f)=>a.length?a.reduce((s,g)=>s+f(g),0)/a.length:0,sum=(a,f)=>a.reduce((s,g)=>s+f(g),0);
  x.n_=L.length;x.min=av(L,g=>g.min);x.minR=sum(rec,g=>g.min)/K;x.minO=old.length?sum(old,g=>g.min)/oldD:0;x.pdk=av(L,g=>g.pdk);x.pdkR=av(rec,g=>g.pdk);x.pdkO=av(old,g=>g.pdk);
  x.titR=rec.filter(g=>g.tit).length/K;x.titO=old.filter(g=>g.tit).length/oldD;x.dMin=x.minR-x.minO;x.dPdk=rec.length?x.pdkR-x.pdkO:-x.pdkO;x.k=Math.max(1,rec.length);x.pl=rec.length;x.K=K;x.Gall=x.Gall||x.G;x.G=L;
  (out.byTeam[x.tm]=out.byTeam[x.tm]||[]).push(x)}
 /* quota dei minuti del reparto e chi perde il posto */
 for(const tm in out.byTeam){const L=out.byTeam[tm];for(const r of["G","F","C"]){const R=L.filter(x=>x.r===r),sR=R.reduce((s,x)=>s+x.minR,0)||1,sO=R.reduce((s,x)=>s+x.minO,0)||1;R.forEach(x=>{x.qR=x.minR/sR;x.qO=x.minO/sO;x.dQ=x.qR-x.qO})}
  L.forEach(x=>{x.perde=L.filter(y=>y!==x&&y.r===x.r&&y.dMin<-2&&y.pl>=Math.ceil(y.K/2))/* chi è fuori (infortunio, riposo) non «perde il posto» */.sort((a,b)=>a.dMin-b.dMin).slice(0,2).map(y=>({n:y.n,d:y.dMin}))})}
 /* punteggio «in crescita» */
 for(const n in P){const x=P[n];if(x.dMin==null)continue;x.cresc=Math.max(-50,Math.min(100,x.dMin*2.2+x.dPdk*1.1+x.dQ*60+(x.titR-x.titO)*12))*(Math.min(1,x.n_/8))}
 CACHE=out;return out}

/* ---------- 2) contratti, cap e rischio scambio ---------- */
function contr(n){return lookup(G()&&G().contratti,n)}
function faTipo(n){return lookup(G()&&G().fa,n)}
function capSq(tm){const g=G();if(!g||!g.cap)return null;const nm={ATL:"atlanta-hawks",BOS:"boston-celtics",BKN:"brooklyn-nets",CHA:"charlotte-hornets",CHI:"chicago-bulls",CLE:"cleveland-cavaliers",DAL:"dallas-mavericks",DEN:"denver-nuggets",DET:"detroit-pistons",GSW:"golden-state-warriors",HOU:"houston-rockets",IND:"indiana-pacers",LAC:"la-clippers",LAL:"los-angeles-lakers",MEM:"memphis-grizzlies",MIA:"miami-heat",MIL:"milwaukee-bucks",MIN:"minnesota-timberwolves",NOP:"new-orleans-pelicans",NYK:"new-york-knicks",OKC:"oklahoma-city-thunder",ORL:"orlando-magic",PHI:"philadelphia-76ers",PHX:"phoenix-suns",POR:"portland-trail-blazers",SAC:"sacramento-kings",SAS:"san-antonio-spurs",TOR:"toronto-raptors",UTA:"utah-jazz",WAS:"washington-wizards"}[tm];return nm?g.cap[nm]||null:null}
function payroll(tm){const g=G();if(!g||!g.contratti)return null;let s=0,n=0;for(const k in g.contratti){const c=g.contratti[k];if(c.t===tm&&c.s[0]!=null){s+=c.s[0];n++}}return n?{s,n}:null}
function rischio(x){const c=contr(x.n),fa=faTipo(x.n),L=(build()||{}).byTeam||{},Lg=G()&&G().capLega,pay=payroll(x.tm);let sc=0;const why=[];
 if(c){const y=c.s.length;if(y<=1){sc+=30;why.push("contratto in scadenza")}else if(y===2){sc+=12;why.push("contratto fino al 2027/28")}
  if(c.o&&/[PS]/.test(c.o[1]||"")){sc+=10;why.push(c.o[1]==="P"?"opzione del giocatore l'anno prossimo":"opzione della squadra l'anno prossimo")}
  if(c.s[0]>=20&&x.pdk<25){sc+=12;why.push(`guadagna ${f1(c.s[0])} M$ con ${f1(x.pdk)} PDK`)}}
 if(fa){if(fa.ty==="RFA"){sc+=14;why.push("restricted free agent: la squadra può pareggiare le offerte, oppure scambiarlo prima")}else if(fa.ty==="UFA"){sc+=10;why.push("free agent senza restrizioni a fine anno")}}
 if(Lg&&pay&&Lg.tax&&pay.s>Lg.tax){sc+=12;why.push(`squadra sopra la luxury tax (${f1(pay.s)} M$)`);if(Lg.apron1&&pay.s>Lg.apron1){sc+=8;why.push("oltre il primo apron")}}
 const peers=(L[x.tm]||[]).filter(y=>y.r===x.r&&y!==x&&y.min>15).length;if(peers>=3){sc+=8;why.push(`reparto affollato (${peers+1} ${({G:"guardie",F:"ali",C:"centri"})[x.r]} sopra i 15 minuti)`)}
 if(x.dMin<-3){sc+=8;why.push("sta perdendo minuti")}
 return{sc:Math.min(100,sc),why}}
/* squadre che potrebbero prenderlo: reparto con meno PDK nelle ultime partite, più spazio nel cap */
function destinazioni(x){const B=build();if(!B)return[];const Lg=G()&&G().capLega,out=[];
 /* rendimento del reparto per 36 minuti nelle ultime partite: più basso = più bisogno (non dipende da quanti giocatori ha il reparto) */
 const p36=tm=>{let m=0,p=0;B.byTeam[tm].filter(y=>y.r===x.r).forEach(y=>{const R=y.G.slice(-y.pl||0);if(!y.pl)return;R.forEach(g=>{m+=g.min;p+=g.pdk})});return m>=30?p/m*36:null};
 const all=Object.keys(B.byTeam).map(t=>p36(t)).filter(v=>v!=null),med=all.reduce((a,b)=>a+b,0)/(all.length||1);
 for(const tm in B.byTeam){if(tm===x.tm)continue;const v=p36(tm);if(v==null)continue;const pay=payroll(tm);
  let sc=(med-v)*2;const why=[`${({G:"guardie",F:"ali",C:"centri"})[x.r]} a ${f1(v)} PDK ogni 36' (media lega ${f1(med)})`];if(Lg&&pay&&Lg.cap){const sp=Lg.cap-pay.s;sc+=sp>0?Math.min(10,sp/2):Lg.tax&&pay.s>Lg.tax?-6:0;why.push(sp>0?`${f1(sp)} M$ di spazio nel cap`:pay.s>(Lg.tax||1e9)?"sopra la tax: deve pareggiare gli stipendi":"sotto la tax")}
  out.push({tm,sc,why})}
 return out.sort((a,b)=>b.sc-a.sc).slice(0,3)}

/* ---------- 3) grafici SVG ---------- */
function spark(L,f,col,w=110,h=28){if(!L.length)return"";const v=L.map(f),mx=Math.max(...v,1),mn=Math.min(...v,0),sx=i=>L.length<2?w/2:i*(w-4)/(L.length-1)+2,sy=y=>h-3-(y-mn)/(mx-mn||1)*(h-6);
 return`<svg class="gmsp" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" points="${v.map((y,i)=>sx(i).toFixed(1)+","+sy(y).toFixed(1)).join(" ")}"/></svg>`}
function grafico(x){const L=x.G,w=330,h=150,pad=26,mx=Math.max(40,...L.map(g=>g.min)),mp=Math.max(30,...L.map(g=>g.pdk)),sx=i=>pad+(L.length<2?0:i*(w-pad-8)/(L.length-1)),sm=v=>h-18-v/mx*(h-30),sp=v=>h-18-Math.max(0,v)/mp*(h-30);
 const roll=(f,k=4)=>L.map((g,i)=>{const a=L.slice(Math.max(0,i-k+1),i+1);return a.reduce((s,q)=>s+f(q),0)/a.length});const rm=roll(g=>g.min),rp=roll(g=>g.pdk);
 const bars=L.map((g,i)=>`<rect x="${(sx(i)-3).toFixed(1)}" y="${sm(g.min).toFixed(1)}" width="6" height="${(h-18-sm(g.min)).toFixed(1)}" rx="2" fill="${g.tit?"rgba(56,189,248,.55)":"rgba(148,163,184,.35)"}"/>`).join("");
 const line=(arr,f,c)=>`<polyline fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" points="${arr.map((v,i)=>sx(i).toFixed(1)+","+f(v).toFixed(1)).join(" ")}"/>`;
 const cut=L.length-x.k;
 return`<svg class="gmch" viewBox="0 0 ${w} ${h}"><rect x="${sx(cut)-5}" y="4" width="${w-sx(cut)+5}" height="${h-22}" fill="rgba(250,204,21,.07)"/>${[10,20,30,40].filter(v=>v<=mx).map(v=>`<line x1="${pad}" x2="${w}" y1="${sm(v)}" y2="${sm(v)}" stroke="rgba(255,255,255,.08)"/><text x="2" y="${sm(v)+4}" font-size="9" fill="#94a3b8">${v}'</text>`).join("")}${bars}${line(rm,sm,"#38bdf8")}${line(rp,sp,"#facc15")}<text x="${w-4}" y="12" text-anchor="end" font-size="9" fill="#facc15">ultime ${x.k}</text></svg>
 <div class="gmleg"><span><i style="background:#38bdf8"></i>minuti (media mobile)</span><span><i style="background:#facc15"></i>PDK (media mobile)</span><span><i style="background:rgba(56,189,248,.55)"></i>titolare</span></div>`}

/* ---------- 4) pagina ---------- */
const S={win:5,tab:"radar",tm:null,pl:null,ruolo:"",solo:"tutti",eta:"u27",etaN:26};window.GMAS=S;
const RN={G:"Guardia",F:"Ala",C:"Centro"};
const tag=x=>{const o=owner(x.n);return o?`<span class="gmown">${typeof badge==="function"?badge(o,"gmb"):""}${E(TEAMS[o].nick)}</span>`:`<span class="gmfa">libero</span>`};
const ctxt=n=>{const c=contr(n),fa=faTipo(n);if(!c&&!fa)return"";return`${c?`${f1(c.s[0])} M$ · ${c.s.length} ${c.s.length===1?"anno":"anni"}`:""}${fa?` · ${fa.ty}`:""}`};
/* (1145) età: di default solo under 27 (≤26 anni); «Over 27 da vendere» mostra solo i 27+. Età ESPN; se manca il giocatore resta negli under. */
const etaDi=n=>{const r=lookup(G()&&G().ruoli,n);return r&&r.e||null};
/* (1161) le liste servono a scovare giocatori poco valorizzati: solo valore Dreamers sotto 1200 (chi non ha valore resta). Non vale per la scheda Squadra né per «Da (da vendere)» */
const VMAX=1150,valD=n=>{try{const v=valOf(n);return v==null?null:+v}catch(e){return null}};/* (1162) 1150, e solo per chi è già in una squadra Dreamers: i free agent restano anche se valgono di più */
function filtra(L,sq){return L.filter(x=>(sq||S.eta==="o27"||!owner(x.n)||(()=>{const v=valD(x.n);return v==null||v<VMAX})())&&(sq||(()=>{const e=etaDi(x.n);return S.eta==="o27"?e!=null&&e>=S.etaN:e==null||e<=S.etaN})())&&(!S.ruolo||x.r===S.ruolo)&&(S.solo==="tutti"||(S.solo==="liberi"?!owner(x.n):!!owner(x.n))))}
function riga(x,i,extra){return`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${etaDi(x.n)?" · "+etaDi(x.n)+" anni":""} · ${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small>${extra||""}</span><span class="gmv"><b class="${x.dMin>=0?"up":"dn"}">${sg(x.dMin)}'</b><small>${f1(x.minO)}' → ${f1(x.minR)}'</small></span><span class="gmv"><b class="${x.dPdk>=0?"up":"dn"}">${sg(x.dPdk)}</b><small>PDK ${f1(x.pdkR)}</small></span>${spark(x.G,g=>g.min,"#38bdf8",70,26)}</div>`}
function vClass(B){const L=filtra(Object.values(B.P).filter(x=>x.cresc!=null&&x.n_>=6&&x.minR>=12)).sort((a,b)=>b.cresc-a.cresc).slice(0,40);
 return`<p class="gmnote">I giocatori che stanno guadagnando più minuti, più PDK e più spazio nel loro reparto: ultime ${RECENT} partite contro quelle di prima. Tocca un nome per grafico, contratto e analisi.</p>${L.map((x,i)=>riga(x,i+1,x.perde&&x.perde.length?`<em class="gmper">prende spazio a ${x.perde.map(y=>E(cog(y.n))+" ("+sg(y.d)+"')").join(", ")}</em>`:"")).join("")}`}
function vRischio(B){const L=filtra(Object.values(B.P).filter(x=>x.n_>=5&&x.min>=10)).map(x=>({x,r:rischio(x)})).filter(o=>o.r.sc>=30).sort((a,b)=>b.r.sc-a.r.sc).slice(0,40);
 const nod=!G()||!Object.keys(G().contratti||{}).length?`<p class="gmnote warn">I contratti non sono ancora arrivati da GitHub: il rischio usa solo minuti e reparto.</p>`:"";
 return`${nod}<p class="gmnote">Chi potrebbe essere scambiato presto: scadenza del contratto, restricted/unrestricted free agent, squadra sopra la luxury tax, reparto affollato, contratto pesante. Per ognuno le squadre che potrebbero prenderlo.</p>${L.map((o,i)=>{const D=destinazioni(o.x);return riga(o.x,i+1,`<em class="gmper">rischio ${o.r.sc}% · ${E(o.r.why.slice(0,2).join(" · "))}${D.length?`<br>possibili destinazioni: ${D.map(d=>d.tm).join(", ")}`:""}</em>`)}).join("")}`}
function vSquadra(B){const tms=Object.keys(B.byTeam).sort();if(!S.tm||!B.byTeam[S.tm])S.tm=tms[0];const L=filtra(B.byTeam[S.tm].slice(),1).sort((a,b)=>b.minR-a.minR),pay=payroll(S.tm),Lg=G()&&G().capLega,N=(G()&&G().news&&G().news[S.tm])||[];
 const tbl=["G","F","C"].map(r=>{const R=L.filter(x=>x.r===r);return R.length?`<div class="gmrep">${({G:"Guardie",F:"Ali",C:"Centri"})[r]}</div>${R.map(x=>`<div role="button" tabindex="0" class="gmrw sq" data-gmpl="${E(x.n)}"><span class="gxn"><b>${E(x.n)}</b><small>${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small></span><span class="gmv"><b>${f1(x.minR)}'</b><small class="${x.dMin>=0?"up":"dn"}">${sg(x.dMin)}'</small></span><span class="gmv"><b>${Math.round(x.qR*100)}%</b><small class="${x.dQ>=0?"up":"dn"}">${sg(x.dQ*100,v=>Math.round(v))}%</small></span><span class="gmv"><b>${f1(x.pdkR)}</b><small class="${x.dPdk>=0?"up":"dn"}">${sg(x.dPdk)}</small></span>${spark(x.G,g=>g.min,"#38bdf8",60,24)}</div>`).join("")}`:""}).join("");
 return`<div class="gmtms">${tms.map(t=>`<button data-gmtm="${t}" aria-pressed="${t===S.tm}">${t}</button>`).join("")}</div>
 <div class="gmcap">${pay?`<div><small>Payroll 2026/27</small><b>${f1(pay.s)} M$</b><em>${pay.n} contratti</em></div>`:""}${Lg&&pay&&Lg.cap?`<div><small>Spazio nel cap</small><b class="${Lg.cap-pay.s>=0?"up":"dn"}">${sg(Lg.cap-pay.s)} M$</b><em>cap ${f1(Lg.cap)}</em></div><div><small>Luxury tax</small><b class="${pay.s>(Lg.tax||1e9)?"dn":"up"}">${pay.s>(Lg.tax||1e9)?"sopra":"sotto"}</b><em>${Lg.tax?"soglia "+f1(Lg.tax):""}</em></div>`:""}${!pay?`<div><small>Contratti</small><b>in arrivo</b><em>da GitHub</em></div>`:""}</div>
 ${(()=>{const C=coachStats(),o=C&&C.R[S.tm];return o?`<details class="gmcod"><summary>🧑‍🏫 ${E(coachNm(S.tm)||"Allenatore")} · ${E(o.tags.join(" · ")||"uso dei giocatori nella media")}</summary>${coachBox(o,C.lg)}</details>`:""})()}<div class="gmhd"><span>Giocatore</span><span>Minuti ult.</span><span>Quota reparto</span><span>PDK ult.</span><span></span></div>${tbl}
 ${N.length?`<div class="gmrep">Notizie (ESPN, in inglese)</div>${N.slice(0,8).map(x=>`<a class="gmnw" href="${E(x.u)}" target="_blank" rel="noopener"><small>${E(x.d)}</small><b>${E(x.h)}</b><span>${E(x.x)}</span></a>`).join("")}`:`<p class="gmnote">Le notizie della squadra arrivano con il prossimo aggiornamento di GitHub.</p>`}`}
/* ---------- SCHEDA GIOCATORE (1150): ultime 5/7/10 contro la stagione, perché migliora, compagni con/senza, negli anni ---------- */
const STO=()=>typeof GMSTO!=="undefined"&&GMSTO?GMSTO:null;
let STOIX=null;
function stoRows(lab,n){const S=STO();if(!S||!S.stagioni[lab])return null;if(!STOIX||STOIX.u!==S.upd){STOIX={u:S.upd,m:{}};for(const l in S.stagioni){const m=STOIX.m[l]={};for(const k in S.stagioni[l])m[nz(k)]=k}}const k=STOIX.m[lab][nz(n)];return k?S.stagioni[lab][k]:null}
const stoLabs=()=>{const S=STO();return S?Object.keys(S.stagioni).sort():[]};
/* riga Basketball Reference [squadra,G,GS,MIN,PT,RO,RD,AS,RU,ST,PP,TR,TT,LR,LT,3R,3T,ruolo,età] → PDK stimati a partita (stessa formula Dunkest, senza bonus vittoria) */
const pdkEst=r=>r[4]+r[6]+1.25*r[5]+1.5*(r[7]+r[8]+r[9])-1.5*r[10]-(r[12]-r[11])-(r[14]-r[13])+(r[1]?r[2]/r[1]:0);
const stoTot=rows=>rows&&(rows.find(r=>r[0]==="TOT")||rows[0]);
const stoTeams=rows=>rows?[...new Set(rows.filter(r=>r[0]!=="TOT").map(r=>r[0]))]:[];
const cog=n=>{const a=String(n).split(" ").filter(w=>!/^(jr\.?|sr\.?|ii|iii|iv)$/i.test(w));return a[a.length-1]||n};
const posR=p=>{p=String(p||"").split("-")[0];return p==="C"?"C":/G/.test(p)?"G":"F"};
/* lunghi: un'ala grande (PF) contende minuti ai centri e viceversa. Ruolo Dreamers + posizione Basketball Reference/ESPN */
const bigPos=p=>/^(PF|C)/.test(String(p||""))||String(p||"")==="C";
function isBig(n){const l=stoLabs().slice().reverse();for(const lb of l){const r=stoRows(lb,n);if(r&&r[0])return bigPos(r[r.length-1][17])}const e=lookup(G()&&G().ruoli,n);return!!(e&&/C/.test(e.p||""))}
const conc=(x,y)=>x.r===y.r||((x.r==="C"||x.r==="F")&&(y.r==="C"||y.r==="F")&&(x.r==="C"||isBig(x.n))&&(y.r==="C"||isBig(y.n)));
const concPos=(x,pos)=>{const pr=posR(pos);return pr===x.r||((x.r==="C"||isBig(x.n))&&bigPos(pos))};
/* s: [PT,RO,RD,AS,RU,ST,PP,TR,TT,3R,3T,LR,LT,+/-] */
function agg(L){const n=L.length;if(!n)return null;const s=i=>L.reduce((a,g)=>a+(g.s?g.s[i]:0),0),M=L.reduce((a,g)=>a+g.min,0),P=L.reduce((a,g)=>a+g.pdk,0);
 const est=(s(0)+s(2)+1.25*s(1)+1.5*(s(3)+s(4)+s(5))-1.5*s(6)-(s(8)-s(7))-(s(12)-s(11))+L.filter(g=>g.tit).length)/n;
 return{n,M,min:M/n,pdk:P/n,p36:M?P/M*36:0,est,pt:s(0)/n,rb:(s(1)+s(2))/n,as:s(3)/n,ru:s(4)/n,st:s(5)/n,pp:s(6)/n,tt:s(8)/n,fg:s(8)?s(7)/s(8):null,tr:s(9)/n,ft:s(12)?s(11)/s(12):null,tit:L.filter(g=>g.tit).length/n,pm:s(13)/n,
  q36:i=>M?s(i)/M*36:0}}
const RIGHE=[["Minuti","min",f1,1,1.5,"'"],["PDK","pdk",f1,1,2],["PDK ogni 36'","p36",f1,1,2],["Punti","pt",f1,1,1.5],["Rimbalzi","rb",f1,1,1],["Assist","as",f1,1,.7],["Rubate","ru",f1,1,.3],["Stoppate","st",f1,1,.3],["Palle perse","pp",f1,-1,.4],["Tiri tentati","tt",f1,1,1.5],["% al tiro","fg",v=>v==null?"—":Math.round(v*100)+"%",1,.03],["Triple","tr",f1,1,.4],["% liberi","ft",v=>v==null?"—":Math.round(v*100)+"%",1,.05],["Titolare","tit",v=>Math.round(v*100)+"%",1,.15],["+/−","pm",v=>sg(v),1,2]];
function confronto(L){const se=agg(L),W=[10,7,5].map(k=>({k,a:L.length>k?agg(L.slice(-k)):null}));
 const cell=(a,r)=>{if(!a)return`<span class="nd">—</span>`;const v=a[r[1]],b=se[r[1]],d=v==null||b==null?0:(v-b)*r[3];const c=d>=r[4]?"up":d<=-r[4]?"dn":"";return`<span class="${c}${W.find(w=>w.a===a).k===S.win?" sel":""}">${r[2](v)}${c?`<i>${c==="up"?"▲":"▼"}</i>`:""}</span>`};
 return`<div class="gmtb"><div class="gmth"><span></span><span>Stagione<small>${se.n} gare</small></span>${W.map(w=>`<span class="${w.k===S.win?"sel":""}">Ultime ${w.k}</span>`).join("")}</div>${RIGHE.map(r=>`<div class="gmtr"><b>${r[0]}</b><span>${r[2](se[r[1]])}</span>${W.map(w=>cell(w.a,r)).join("")}</div>`).join("")}</div><p class="gmnote small">Medie a partita. ▲▼ = meglio o peggio della sua media stagionale in modo netto.</p>`}
/* perché migliora: scomposizione della differenza di PDK in effetto minuti ed effetto rendimento, e le statistiche (ogni 36') che cambiano di più */
function perche(L){const k=S.win,se=agg(L);if(L.length<=k)return`<p class="gmnote">Servono più di ${k} partite per il confronto.</p>`;const w=agg(L.slice(-k)),dP=w.pdk-se.pdk,eM=(w.min-se.min)*se.p36/36,eR=w.min*(w.p36-se.p36)/36;
 const C=[["punti",0,1],["rimbalzi offensivi",1,1.25],["rimbalzi difensivi",2,1],["assist",3,1.5],["rubate",4,1.5],["stoppate",5,1.5],["palle perse",6,-1.5],["triple",9,1]].map(([l,i,p])=>({l,d:w.q36(i)-se.q36(i),v:(w.q36(i)-se.q36(i))*p})).filter(c=>Math.abs(c.d)>=.3).sort((a,b)=>b.v-a.v);
 const fgd=w.fg!=null&&se.fg!=null?w.fg-se.fg:0,meglio=C.filter(c=>c.v>.4).slice(0,3),peggio=C.filter(c=>c.v<-.4).slice(-2).reverse();
 const st=dP>=2?["📈","In crescita","up"]:dP<=-2?["📉","In calo","dn"]:["⚖️","Stabile",""];
 const tot=Math.abs(eM)+Math.abs(eR)||1,pM=Math.round(Math.abs(eM)/tot*100);
 return`<div class="gmver ${st[2]}"><div class="gmvt"><span>${st[0]}</span><b>${st[1]}</b><em>${sg(dP)} PDK a partita nelle ultime ${k} rispetto alla stagione (${f1(se.pdk)} → ${f1(w.pdk)})</em></div>
 <div class="gmdec"><div><small>Effetto minuti</small><b class="${eM>=0?"up":"dn"}">${sg(eM)}</b><em>${f1(se.min)}' → ${f1(w.min)}'</em></div><div><small>Effetto rendimento</small><b class="${eR>=0?"up":"dn"}">${sg(eR)}</b><em>${f1(se.p36)} → ${f1(w.p36)} ogni 36'</em></div></div>
 <div class="gmbar2"><i class="m" style="width:${pM}%"></i><i class="r" style="width:${100-pM}%"></i></div><p class="gmnote small">${Math.abs(eM)>Math.abs(eR)?"Conta soprattutto quanto gioca":"Conta soprattutto come gioca"}: ${pM}% minuti, ${100-pM}% rendimento.</p>
 ${meglio.length||fgd>=.04?`<div class="gmwhy"><b>👍 Cosa fa meglio</b>${meglio.map(c=>`<span>${sg(c.d)} ${c.l} ogni 36'</span>`).join("")}${fgd>=.04?`<span>tira col ${Math.round(w.fg*100)}% (stagione ${Math.round(se.fg*100)}%)</span>`:""}${w.tit-se.tit>=.3?`<span>titolare ${Math.round(w.tit*100)}% delle gare (stagione ${Math.round(se.tit*100)}%)</span>`:""}</div>`:""}
 ${peggio.length||fgd<=-.04?`<div class="gmwhy dn"><b>👎 Cosa fa peggio</b>${peggio.map(c=>`<span>${sg(c.d)} ${c.l} ogni 36'</span>`).join("")}${fgd<=-.04?`<span>tira col ${Math.round(w.fg*100)}% (stagione ${Math.round(se.fg*100)}%)</span>`:""}</div>`:""}</div>`}
function grafico2(L){const w=340,h=180,pl=26,pb=22,n=L.length,se=agg(L),mxP=Math.max(30,...L.map(g=>g.pdk)),mnP=Math.min(0,...L.map(g=>g.pdk)),mxM=Math.max(40,...L.map(g=>g.min)),bw=Math.max(4,Math.min(14,(w-pl-6)/n-3));
 const X=i=>pl+(n<2?(w-pl)/2:i*(w-pl-bw-4)/(n-1))+bw/2,YP=v=>h-pb-(v-mnP)/(mxP-mnP)*(h-pb-12),YM=v=>h-pb-v/mxM*(h-pb-12),k=Math.min(S.win,n);
 const bars=L.map((g,i)=>`<rect x="${(X(i)-bw/2).toFixed(1)}" y="${Math.min(YP(g.pdk),YP(0)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(YP(g.pdk)-YP(0)).toFixed(1)}" rx="2" fill="${g.pdk>=se.pdk?"#22c55e":"#475569"}" opacity="${i>=n-k?1:.55}"/>`).join("");
 const line=`<polyline fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linejoin="round" points="${L.map((g,i)=>X(i).toFixed(1)+","+YM(g.min).toFixed(1)).join(" ")}"/>${L.map((g,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${YM(g.min).toFixed(1)}" r="2.2" fill="#38bdf8"/>`).join("")}`;
 const lab=[0,Math.floor((n-1)/2),n-1].filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${X(i)}" y="${h-6}" font-size="9" text-anchor="middle" fill="#94a3b8">${L[i].d.slice(8)}/${L[i].d.slice(5,7)}</text>`).join("");
 const x0=X(n-k)-bw/2-3;
 return`<svg class="gmch" viewBox="0 0 ${w} ${h}"><rect x="${x0}" y="2" width="${w-x0}" height="${h-pb-2}" rx="6" fill="rgba(124,58,237,.16)"/><text x="${w-4}" y="12" text-anchor="end" font-size="9" fill="#c4b5fd">ultime ${k}</text>
 ${[10,20,30,40].filter(v=>v<=mxP).map(v=>`<line x1="${pl}" x2="${w}" y1="${YP(v)}" y2="${YP(v)}" stroke="rgba(255,255,255,.07)"/><text x="2" y="${YP(v)+3}" font-size="9" fill="#94a3b8">${v}</text>`).join("")}
 <line x1="${pl}" x2="${w}" y1="${YP(se.pdk)}" y2="${YP(se.pdk)}" stroke="#facc15" stroke-dasharray="4 3" stroke-width="1.2"/>${bars}${line}${lab}</svg>
 <div class="gmleg"><span><i style="background:#22c55e"></i>PDK sopra la sua media</span><span><i style="background:#475569"></i>sotto</span><span><i style="background:#facc15"></i>media PDK ${f1(se.pdk)}</span><span><i style="background:#38bdf8"></i>minuti (scala 0-${mxM}')</span></div>`}
/* compagni con / senza: nelle partite giocate da lui, come rende quando il compagno c'è e quando non c'è (solo compagni ancora in squadra) */
function onoff(B,x){const gm=(B.T[x.tm]||{gm:[]}).gm,me=nz(x.n),mine=new Map(x.G.map(g=>[g.d,g])),M={};
 gm.forEach(g=>{if(!mine.has(g.d))return;g.r.forEach(r=>{if(r.k!==me&&r.min>0)(M[r.k]=M[r.k]||{n:r.n,ds:new Set()}).ds.add(g.d)})});
 const res=[],sempre=[];for(const k in M){const y=B.P[k];if(!y||y.tm!==x.tm||(y.min<12&&y.minR<12))continue;/* solo compagni che giocano davvero */const w=[],wo=[];mine.forEach((g,d)=>(M[k].ds.has(d)?w:wo).push(g));
  if(wo.length<3){if(y.min>=15)sempre.push(M[k].n);continue}if(w.length<3)continue;const a=agg(w),b=agg(wo);res.push({y,n:M[k].n,r:y.r,same:conc(x,y),w:a,wo:b,d:b.pdk-a.pdk})}
 return{res,sempre}}
function mateCard(o,x,inv){const ri=rischio(o.y),inj=injMap()[nz(o.n)],c=contr(o.n);const mx=Math.max(o.w.pdk,o.wo.pdk,1);
 return`<div class="gmmate${o.same?" same":""}"><div class="gmmh"><b>${E(o.n)}</b><small>${RN[o.r]}${o.same?" · gli contende i minuti":""} · ${f1(o.y.minR)}' ultime</small><span class="gmd ${inv?"up":"dn"}">${inv?"rende ":""}${sg(Math.abs(o.d))} PDK ${inv?"con lui":"senza di lui"}</span></div>
 <div class="gmcmp"><div><small>Con ${E(cog(o.n))} · ${o.w.n} gare</small><i><b style="width:${Math.max(3,o.w.pdk/mx*100)}%"></b></i><em>${f1(o.w.pdk)} PDK · ${f1(o.w.min)}'</em></div><div><small>Senza · ${o.wo.n} gare</small><i><b class="o" style="width:${Math.max(3,o.wo.pdk/mx*100)}%"></b></i><em>${f1(o.wo.pdk)} PDK · ${f1(o.wo.min)}'</em></div></div>
 <div class="gmmf"><span class="${ri.sc>=40?"hot":""}">🔁 rischio scambio ${ri.sc}%</span>${c?`<span>${c.s.length===1?"⏳ in scadenza":"contratto fino al "+(2026+c.s.length)}</span>`:""}${inj?`<span class="hot">🩹 ${E(inj)}</span>`:""}${etaDi(o.n)?`<span>${etaDi(o.n)} anni</span>`:""}</div>${ri.sc>=30&&ri.why.length?`<p class="gmnote small">${E(ri.why.slice(0,2).join(" · "))}</p>`:""}</div>`}
function vCompagni(B,x){const{res,sempre}=onoff(B,x),dan=res.filter(o=>o.d>=1.5).sort((a,b)=>(b.same-a.same)||b.d-a.d).slice(0,4),aiu=res.filter(o=>o.d<=-1.5).sort((a,b)=>a.d-b.d).slice(0,3);
 return`<div class="gmrep">😤 Chi gli toglie spazio</div><p class="gmnote">Nelle sue partite: quanto rende quando il compagno gioca e quando no. Più la differenza è grande e più quel compagno gli pesa${dan.some(o=>o.same)?" (prima chi gioca nel suo reparto)":""}. Servono almeno 3 partite con e 3 senza.</p>
 ${dan.length?dan.map(o=>mateCard(o,x)).join(""):`<p class="gmnote">Nessun compagno gli toglie spazio in modo netto quest'anno.</p>`}
 ${aiu.length?`<div class="gmrep">🤝 Con chi rende di più</div>${aiu.map(o=>mateCard(o,x,1)).join("")}`:""}
 ${sempre.length?`<p class="gmnote small">Sempre in campo insieme quest'anno (nessun confronto possibile): ${sempre.map(E).join(", ")}. Guarda sotto «Negli anni».</p>`:""}`}
/* negli anni: stagioni passate (Basketball Reference) + questa; arrivi e partenze nel suo reparto; con/senza i compagni di stagione in stagione */
function vAnni(B,x){const labs=stoLabs();if(!labs.length)return`<div class="gmrep">📅 Negli anni</div><p class="gmnote">Le stagioni passate arrivano con il prossimo aggiornamento di GitHub.</p>`;
 const cur=agg(x.Gall||x.G),curLab=(()=>{const y=+labs[labs.length-1].slice(0,4)+1;return`${y}-${String(y+1).slice(2)}`})();
 const SE=labs.map(l=>{const rows=stoRows(l,x.n),t=stoTot(rows);return{l,rows,t,tms:stoTeams(rows),pdk:t?pdkEst(t):null}});
 SE.push({l:curLab,cur:1,tms:[x.tm],t:null,pdk:cur.est,min:cur.min,g:cur.n,pt:cur.pt,rb:cur.rb,as:cur.as});
 const mxp=Math.max(10,...SE.map(s=>s.pdk||0));
 const tab=`<div class="gmyrs">${SE.map(s=>{const t=s.t,min=s.cur?s.min:t&&t[3],g=s.cur?s.g:t&&t[1];return`<div class="${s.cur?"cur":""}"><small>${s.l}${s.cur?" (ora)":""}</small><b>${s.pdk!=null&&(s.cur||t)?f1(s.pdk):"—"}</b><i><b style="height:${s.pdk&&(s.cur||t)?Math.max(4,s.pdk/mxp*100):0}%"></b></i><em>${s.cur||t?`${E(s.tms.join("/"))} · ${g} g · ${f1(min)}'`:"non in NBA"}</em>${s.cur||t?`<em>${f1(s.cur?s.pt:t[4])} pt · ${f1(s.cur?s.rb:t[5]+t[6])} rb · ${f1(s.cur?s.as:t[7])} as</em>`:""}</div>`}).join("")}</div><p class="gmnote small">PDK stimati dalle medie (stessa formula, senza bonus vittoria), anche per quest'anno per confrontarli alla pari.</p>`;
 /* reparto: l'ultima stagione passata con la sua ultima squadra di allora */
 const last=SE.filter(s=>!s.cur&&s.t).pop();let rep="";
 if(last){const S0=STO().stagioni[last.l],team0=last.tms[last.tms.length-1]||last.t[0],prev=[];for(const k in S0){if(nz(k)===nz(x.n))continue;const rr=S0[k].filter(r=>r[0]!=="TOT");const r=rr.find(r=>r[0]===team0);if(r&&concPos(x,r[17])&&r[3]>=10)prev.push({n:k,r})}
  const now=(B.byTeam[x.tm]||[]).filter(y=>y!==x&&conc(x,y)&&(y.min>=8||y.minR>=8));
  const arr=now.filter(y=>!(team0===x.tm&&prev.some(p=>nz(p.n)===nz(y.n)))),par=team0===x.tm?prev.filter(p=>!now.some(y=>nz(y.n)===nz(p.n))):[];
  const me0=last.t,d=cur.est-last.pdk,dm=cur.min-me0[3];
  rep=`<div class="gmrep">🔄 Il suo reparto rispetto al ${last.l}</div><div class="gmver ${d>=2?"up":d<=-2?"dn":""}"><p class="gmnote" style="margin:0">${team0!==x.tm?`L'anno scorso era a <b>${E(team0)}</b>, ora a <b>${E(x.tm)}</b>. `:""}Lui: da <b>${f1(me0[3])}'</b> e <b>${f1(last.pdk)} PDK</b> a <b>${f1(cur.min)}'</b> e <b>${f1(cur.est)} PDK</b> (${sg(dm)}' · ${sg(d)} PDK).</p></div>
  ${arr.length?`<p class="gmnote"><b>Arrivati nel suo reparto${team0!==x.tm?" (nuovi compagni)":""}:</b></p>${arr.map(y=>{const pr=labs.slice().reverse().map(l=>({l,rows:stoRows(l,y.n)})).find(o=>o.rows),pt=pr&&stoTot(pr.rows);return`<div class="gmpe"><b>${E(y.n)}</b><span>${f1(y.min)}' quest'anno${pt?` · ${pr.l}: ${E(stoTeams(pr.rows).join("/")||pt[0])} ${f1(pt[3])}'`:" · prima stagione"}</span><em>${f1(y.pdk)}</em></div>`}).join("")}`:""}
  ${par.length?`<p class="gmnote"><b>Partiti dal suo reparto:</b></p>${par.map(p=>`<div class="gmpe"><b>${E(p.n)}</b><span>${f1(p.r[3])}' a partita nel ${last.l}</span><em>${f1(pdkEst(p.r))}</em></div>`).join("")}`:""}`}
 /* con/senza negli anni: per i compagni del reparto di oggi (e i 3 con più minuti), stagioni insieme contro stagioni separate */
 const mates=(B.byTeam[x.tm]||[]).filter(y=>y!==x&&(conc(x,y)||y.min>=28)).sort((a,b)=>conc(x,b)-conc(x,a)||b.min-a.min).slice(0,6),cy=[];
 for(const y of mates){const ins=[],sep=[];SE.forEach(s=>{if(s.pdk==null||!(s.cur||s.t))return;const g=s.cur?s.g:s.t[1];const yt=s.cur?[x.tm]:stoTeams(stoRows(s.l,y.n));const tog=s.cur?true:yt.some(t=>s.tms.includes(t));(tog?ins:sep).push({l:s.l,p:s.pdk,g})});
  if(ins.length&&sep.length){const av=a=>a.reduce((s,o)=>s+o.p*o.g,0)/(a.reduce((s,o)=>s+o.g,0)||1),key=ins.map(o=>o.l).join();const ex=cy.find(c=>c.key===key);if(ex){ex.ys.push(y);continue}cy.push({key,ys:[y],ins,sep,d:av(ins)-av(sep),a:av(ins),b:av(sep)})}}
 const cyh=cy.length?`<div class="gmrep">📊 Con e senza, stagione per stagione</div>${cy.map(o=>{const sm=o.ys.some(y=>conc(x,y));return`<div class="gmmate${sm?" same":""}"><div class="gmmh"><b>${o.ys.map(y=>E(y.n)).join(", ")}</b><small>${o.ys.length>1?"stesse stagioni insieme":RN[o.ys[0].r]}${sm?" · c'è chi gli contende i minuti":""}</small><span class="gmd ${o.d>=0?"up":"dn"}">${o.d>=0?"rende di più insieme":"rende di più senza"} (${sg(o.d)})</span></div><p class="gmnote small" style="margin:4px 0 0">Insieme: ${o.ins.map(s=>s.l).join(", ")} → <b>${f1(o.a)} PDK</b> · Senza: ${o.sep.map(s=>s.l).join(", ")} → <b>${f1(o.b)} PDK</b></p></div>`}).join("")}<p class="gmnote small">Confronto tra stagioni: conta anche l'età e il ruolo che aveva allora, quindi va letto insieme al resto.</p>`:"";
 return`<div class="gmrep">📅 Negli anni</div>${tab}${cyh}`}/* (1200) arrivi/partenze del reparto sono già nella Lettura */
/* ---------- (1151) SALTO RISPETTO ALL'ANNO SCORSO ----------
   Stagione in corso (tabellini) contro l'ultima stagione conclusa (Basketball Reference), con la stessa formula PDK stimati.
   Perché: crescita sua (rende di più ogni 36') o più minuti; minuti liberati da chi è partito dal reparto o da compagni infortunati
   (con il confronto con/senza di loro); chi gli sta ancora davanti, con contratto e rischio scambio. */
const YST=[["Minuti","min",1,1.5],["PDK stimati","est",1,2],["Punti","pt",1,1.5],["Rimbalzi","rb",1,1],["Assist","as",1,.7],["Rubate","ru",1,.3],["Stoppate","st",1,.3],["Palle perse","pp",-1,.4],["Tiri tentati","tt",1,1.5],["% al tiro","fg",1,.03],["Triple","tr",1,.4],["% liberi","ft",1,.05],["Titolare","tit",1,.15]];
const PESO36={pt:1,rb:1.1,as:1.5,ru:1.5,st:1.5,pp:-1.5,tr:1};
function lastRow(n){const l=stoLabs();for(let i=l.length-1;i>=0;i--){const r=stoRows(l[i],n);if(r)return{l:l[i],rows:r,t:stoTot(r),tms:stoTeams(r)}}return null}
const rowAgg=t=>({min:t[3],est:pdkEst(t),pt:t[4],rb:t[5]+t[6],as:t[7],ru:t[8],st:t[9],pp:t[10],tt:t[12],fg:t[12]?t[11]/t[12]:null,tr:t[15],ft:t[14]?t[13]/t[14]:null,tit:t[1]?t[2]/t[1]:0,n:t[1]});
let SALC=null;
function salto(B,x){const L=x.Gall||x.G;if(L.length<4)return null;const lab=stoLabs().pop();if(!lab)return null;const rows=stoRows(lab,x.n);if(!rows)return null;const t=stoTot(rows);if(!t||t[1]<10)return null;
 const a=rowAgg(t),c=agg(L),p36=(o,k)=>o.min?o[k]/o.min*36:0,e36a=p36(a,"est"),e36c=p36(c,"est");
 const dE=c.est-a.est,d36=e36c-e36a,dm=c.min-a.min,eM=dm*e36a/36,eR=c.min*d36/36;
 const st=Object.keys(PESO36).map(k=>({k,d:p36(c,k)-p36(a,k),v:(p36(c,k)-p36(a,k))*PESO36[k]})).sort((p,q)=>q.v-p.v);
 /* reparto: chi è partito (stessa squadra l'anno scorso), chi è infortunato ora, chi gli sta davanti */
 const tms=stoTeams(rows),team0=tms[tms.length-1]||t[0],S0=STO().stagioni[lab],par=[];
 if(team0===x.tm)for(const k in S0){if(nz(k)===nz(x.n))continue;const r=S0[k].find(r=>r[0]===team0);if(r&&concPos(x,r[17])&&r[3]>=12&&!(B.byTeam[x.tm]||[]).some(y=>nz(y.n)===nz(k)))par.push({n:k,min:r[3]})}
 const IM=injMap(),mates=(B.byTeam[x.tm]||[]).filter(y=>y!==x&&conc(x,y)),inj=mates.filter(y=>IM[nz(y.n)]&&(y.min>=15||(lastRow(y.n)||{t:[0,0,0,0]}).t[3]>=18)).map(y=>({y,st:IM[nz(y.n)]}));
 const oo=onoff(B,x).res;inj.forEach(o=>{o.oo=oo.find(r=>r.y===o.y)||null});
 const dav=mates.filter(y=>y.min>=Math.max(15,c.min-3)).sort((p,q)=>q.min-p.min).slice(0,4);
 const tipo=dE<2?(dE<=-2?"calo":"uguale"):d36>=3&&dm>=3?"tutto":d36>=3?"rendimento":"minuti";
 return{lab,team0,a,c,dE,d36,dm,eM,eR,e36a,e36c,st,par,inj,dav,tipo,score:dE+d36*.6+Math.max(0,dm)*.25}}
const TIPO={tutto:["🚀","Salto vero","gioca di più e rende di più per minuto"],rendimento:["💪","Crescita sua","rende di più per minuto anche senza molti più minuti"],minuti:["⏱️","Più minuti","il salto viene soprattutto dallo spazio in campo"],uguale:["⚖️","Come l'anno scorso",""],calo:["📉","In calo","rende meno dell'anno scorso"]};
function saltoBox(B,x,o){const T=TIPO[o.tipo],fm=(k,v)=>v==null?"—":k==="fg"||k==="ft"||k==="tit"?Math.round(v*100)+"%":f1(v);
 const KL={pt:"punti",rb:"rimbalzi",as:"assist",ru:"rubate",st:"stoppate",pp:"palle perse",tr:"triple"},up=o.st.filter(s=>s.v>=.6).slice(0,4),dn=o.st.filter(s=>s.v<=-.6).slice(-2);
 const tot=Math.abs(o.eM)+Math.abs(o.eR)||1,pM=Math.round(Math.abs(o.eM)/tot*100);
 const card=y=>{const ri=rischio(y),c=contr(y.n),i=injMap()[nz(y.n)];return`<div class="gmpe gmdv"><b>${E(y.n)}<small>${RN[y.r]} · ${f1(y.min)}' · ${etaDi(y.n)||"?"} anni${i?` · <span class="dn">🩹 ${E(i)}</span>`:""}</small></b><span>${c?c.s.length===1?"⏳ scade quest'anno":"fino al "+(2026+c.s.length):"contratto ?"}</span><em class="${ri.sc>=40?"dn":""}">🔁 ${ri.sc}%</em></div>`};
 return`<div class="gmrep">🆚 Rispetto al ${o.lab}</div><div class="gmver ${o.dE>=2?"up":o.dE<=-2?"dn":""}"><div class="gmvt"><span>${T[0]}</span><b>${T[1]}</b><em>${sg(o.dE)} PDK a partita: da ${f1(o.a.est)} a ${f1(o.c.est)}${T[2]?" · "+T[2]:""}${o.team0!==x.tm?` · l'anno scorso a ${E(o.team0)}`:""}</em></div>
 <div class="gmdec"><div><small>Effetto minuti</small><b class="${o.eM>=0?"up":"dn"}">${sg(o.eM)}</b><em>${f1(o.a.min)}' → ${f1(o.c.min)}'</em></div><div><small>Effetto rendimento</small><b class="${o.eR>=0?"up":"dn"}">${sg(o.eR)}</b><em>${f1(o.e36a)} → ${f1(o.e36c)} ogni 36'</em></div></div><div class="gmbar2"><i class="m" style="width:${pM}%"></i><i class="r" style="width:${100-pM}%"></i></div>
 ${up.length?`<div class="gmwhy"><b>👍 Migliorato (ogni 36')</b>${up.map(s=>`<span>${sg(s.d)} ${KL[s.k]}</span>`).join("")}${o.c.fg!=null&&o.a.fg!=null&&o.c.fg-o.a.fg>=.03?`<span>tiro ${Math.round(o.a.fg*100)}% → ${Math.round(o.c.fg*100)}%</span>`:""}</div>`:""}
 ${dn.length?`<div class="gmwhy dn"><b>👎 Peggiorato (ogni 36')</b>${dn.map(s=>`<span>${sg(s.d)} ${KL[s.k]}</span>`).join("")}</div>`:""}</div>
 <div class="gmtb"><div class="gmth gm3"><span></span><span>${o.lab}<small>${o.a.n} gare</small></span><span>Ora<small>${o.c.n} gare</small></span><span>Differenza</span></div>${YST.map(r=>{const v0=o.a[r[1]],v1=o.c[r[1]],d=v0==null||v1==null?0:(v1-v0)*r[2],cl=d>=r[3]?"up":d<=-r[3]?"dn":"";return`<div class="gmtr gm3"><b>${r[0]}</b><span>${fm(r[1],v0)}</span><span>${fm(r[1],v1)}</span><span class="${cl}">${v0==null||v1==null?"—":r[1]==="fg"||r[1]==="ft"||r[1]==="tit"?sg((v1-v0)*100,v=>Math.round(v))+"%":sg(v1-v0)}</span></div>`}).join("")}</div>
 ${o.dav.length?`<div class="gmrep">🧱 Chi gli sta ancora davanti</div>${o.dav.map(card).join("")}<p class="gmnote small">🔁 = probabilità stimata che venga scambiato (contratto, luxury tax, reparto affollato, rendimento). Se parte uno di loro, si liberano minuti.</p>`:""}`}
function vSalto(){const B=build(),L=filtra(Object.values(B.P).filter(x=>x.r&&x.n_>=4)).map(x=>({x,o:salto(B,x)})).filter(p=>p.o&&p.o.dE>=2.5).sort((p,q)=>q.o.score-p.o.score).slice(0,30);
 return`<p class="gmnote">I giocatori che quest'anno rendono molto più dell'anno scorso (PDK stimati con la stessa formula). Per ognuno: se è crescita sua o più minuti, da dove arriva lo spazio (partenze, infortuni) e chi gli sta ancora davanti. Tocca un nome per il dettaglio.</p>
 ${L.length?L.map((p,i)=>{const x=p.x,o=p.o,T=TIPO[o.tipo],KL={pt:"punti",rb:"rimbalzi",as:"assist",ru:"rubate",st:"stoppate",pp:"perse",tr:"triple"},up=o.st.filter(s=>s.v>=.8).slice(0,2);
  const cause=[o.par.length?`partiti ${o.par.slice(0,2).map(q=>E(cog(q.n))).join(", ")}`:"",o.inj.length?`🩹 ${o.inj.map(i=>E(cog(i.y.n))).join(", ")}`:"",o.dav[0]?`davanti ${E(cog(o.dav[0].n))} (🔁 ${rischio(o.dav[0]).sc}%)`:""].filter(Boolean);
  return`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i+1}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${etaDi(x.n)?" · "+etaDi(x.n)+" anni":""} · ${tag(x)}</small><em class="gmper">${T[0]} ${T[1]}${up.length?" · "+up.map(s=>sg(s.d)+" "+KL[s.k]+"/36'").join(", "):""}${cause.length?"<br>"+cause.join(" · "):""}</em></span><span class="gmv"><b class="up">${sg(o.dE)}</b><small>${f1(o.a.est)} → ${f1(o.c.est)}</small></span><span class="gmv"><b class="${o.dm>=0?"up":"dn"}">${sg(o.dm)}'</b><small>${f1(o.c.min)}'</small></span></div>`}).join(""):`<p class="gmnote">${STO()?"Nessuno con questi filtri.":"Le stagioni passate arrivano con il prossimo aggiornamento di GitHub."}</p>`}`}
/* ---------- (1162) ANALISI DEL GIOCATORE: perché cambia, e se è un buon investimento ----------
   Giocatori con la stagione scorsa: coefficiente principale = PDK ogni 36' (stessa formula, stimati) rispetto all'anno scorso
   (20 PDK in 30' → 25 in 30' = +6 ogni 36': entra tra i migliori), poi PDK a partita e minuti.
   Le cause, scritte: compagni infortunati ora (con/senza), arrivi e partenze nel reparto, cambio di allenatore (dubbio dichiarato
   quando non si può separare l'effetto del compagno da quello del coach), strada libera davanti.
   Rookie: niente anno scorso → efficienza (PDK al minuto) contro la soglia del ruolo (guardie 0,60, ali 0,62, centri 0,68),
   età d'ingresso, minuti e quota del reparto in salita, chi gli sta davanti e potrebbe sparire. */
const SOGLIA_RK={G:.60,F:.62,C:.68};
const cogn=n=>cog(n);
function coachPrev(tm){const g=G();return g&&g.coachPrev&&g.coachPrev[tm]?g.coachPrev[tm].n:null}
let ANC=null;
function analisi(B,x){if(!ANC||ANC.k!==B.key)ANC={k:B.key,m:{}};const kk=nz(x.n);if(ANC.m[kk])return ANC.m[kk];
 const L=x.Gall||x.G,c=agg(L);if(!c||c.n<4)return ANC.m[kk]=null;const r=lookup(G()&&G().ruoli,x.n),eta=r&&r.e||etaDi(x.n),exp=r?r.exp:null;
 const lr=lastRow(x.n),hasLast=lr&&lr.t&&lr.t[1]>=15,rookie=exp===0||(!lr&&eta!=null&&eta<=22);
 const o=hasLast?salto(B,x):null,e36c=c.min?c.est/c.min*36:0,effc=c.M?L.reduce((s,g)=>s+g.pdk,0)/c.M:0;
 /* compagni infortunati ora, con il confronto con/senza (PDK stimati, stessa scala dell'anno scorso) */
 const IM=injMap(),oo=onoff(B,x).res,mates=(B.byTeam[x.tm]||[]).filter(y=>y!==x);
 const inj=mates.filter(y=>IM[nz(y.n)]&&y.min>=12&&(y.min>=20||conc(x,y))).map(y=>({y,st:IM[nz(y.n)],oo:oo.find(q=>q.y===y)||null,same:conc(x,y)})).sort((a,b)=>(b.oo?b.oo.d:0)-(a.oo?a.oo.d:0));
 /* arrivi nel reparto rispetto all'anno scorso */
 let arr=[],par=o?o.par:[];if(lr){const team0=lr.tms[lr.tms.length-1]||lr.t[0],S0=STO().stagioni[lr.l];
  arr=mates.filter(y=>conc(x,y)&&(y.min>=12||y.minR>=12)).filter(y=>{if(team0!==x.tm)return false;const yr=stoRows(lr.l,y.n);return!(yr&&yr.some(q=>q[0]===team0))})}
 const cN=coachNm(x.tm),cP=coachPrev(x.tm),cambioCoach=!!(cN&&cP&&nz(cN)!==nz(cP)),cambioSq=!!(lr&&(lr.tms[lr.tms.length-1]||lr.t[0])!==x.tm);
 const dav=mates.filter(y=>conc(x,y)&&y.min>=Math.max(14,c.min-2)).sort((a,b)=>b.min-a.min).slice(0,3);
 const vuln=dav.map(y=>{const e=etaDi(y.n),cc=contr(y.n),ri=rischio(y).sc;let v=0;const w=[];if(e>=31){v+=.5;w.push(e+" anni")}if(cc&&cc.s.length===1){v+=.4;w.push("contratto in scadenza")}if(ri>=40){v+=.4;w.push("rischio scambio "+ri+"%")}return{y,v:Math.min(1,v),w}});
 const T=[],F=[];let sc=0,tipo=null;
 const n1=cogn(x.n);
 if(o&&!rookie){tipo="salto";const d36=o.e36c-o.e36a,dm=o.dm;
  sc=d36*2.2+o.dE*1+Math.max(0,dm)*.3+Math.max(0,x.cresc||0)*.12+(eta<=22?6:eta<=24?3:eta>=27?-4:0)+vuln.reduce((s,q)=>s+q.v*2,0);
  T.push(d36>=1.5?`<b>Rende di più per minuto:</b> ${f1(o.e36a)} PDK ogni 36' nel ${o.lab}, ora ${f1(o.e36c)} (${sg(d36)}). ${Math.abs(dm)<2?"Con gli stessi minuti, quindi è <b>crescita sua</b>.":dm>0?`In più gioca ${f1(dm)}' in più.`:`Anche se gioca ${f1(-dm)}' in meno.`}`
   :d36<=-1.5?`<b>Rende meno per minuto</b> dell'anno scorso: da ${f1(o.e36a)} a ${f1(o.e36c)} PDK ogni 36' (${sg(d36)}).${dm>=2?` I PDK a partita reggono solo perché gioca ${f1(dm)}' in più.`:""}`
   :`Per minuto rende come l'anno scorso (${f1(o.e36a)} → ${f1(o.e36c)} ogni 36')${dm>=2?`: la differenza la fanno i ${f1(dm)} minuti in più`:dm<=-2?`, ma gioca ${f1(-dm)}' in meno`:""}.`);
  /* infortuni: con/senza contro l'anno scorso */
  inj.forEach(i=>{const q=i.oo;if(!q||q.wo.n<2||q.w.n<2){if(i.same)T.push(`🩹 <b>${E(i.y.n)}</b> (${RN[i.y.r]}) è ${E(i.st)}: troppe poche partite per capire quanto pesa.`);return}
   const sw=q.wo.est,cw=q.w.est,last=o.a.est;
   if(sw-cw>=3){F.push("inj");const msg=`🩹 <b>${E(i.y.n)} è ${E(i.st)}</b>. Senza di lui ${n1} fa ${f1(sw)} PDK (${q.wo.n} gare), con lui ${f1(cw)} (${q.w.n} gare); l'anno scorso ${f1(last)}.${sw>=last+2?` <b>Senza ${E(cogn(i.y.n))} è migliore anche dell'anno scorso</b> (${sg(sw-last)}).`:""}`;
    if(cw>=last-1)T.push(msg+` Anche con ${E(cogn(i.y.n))} in campo rende come l'anno scorso: il miglioramento senza di lui è un extra, <b>al rientro dovrebbe tornare intorno a ${f1(cw)}</b>.`);
    else T.push(msg+` <b>Con ${E(cogn(i.y.n))} in campo rende meno dell'anno scorso.</b>`+(cambioCoach?(sw>=last?` C'è anche un <b>nuovo allenatore</b>, ${E(cN)} (l'anno scorso ${E(cP)}), ma con lo stesso coach e senza ${E(cogn(i.y.n))} rende più dell'anno scorso: <b>il freno sembra ${E(cogn(i.y.n))} più che l'allenatore</b>${q.wo.n<6?` (con ${q.wo.n} gare senza di lui non è ancora sicuro)`:""}.`:` Può dipendere da ${E(cogn(i.y.n))} oppure dal <b>nuovo allenatore</b> ${E(cN)} (l'anno scorso ${E(cP)}): finora non si può separare, perché ${E(cogn(i.y.n))} ${arr.includes(i.y)?"è arrivato":"c'era già"} insieme al cambio di coach.`):` Il suo spazio dipende da lui: <b>quando rientra rischia di tornare sotto i livelli dell'anno scorso</b>.`))}
   else if(cw-sw>=3)T.push(`🩹 ${E(i.y.n)} è ${E(i.st)}: senza di lui ${n1} rende <b>meno</b> (${f1(sw)} contro ${f1(cw)}), il rientro lo aiuterà.`)});
  if(arr.length)T.push(`➕ <b>Arrivati nel suo reparto</b> rispetto al ${o.lab}: ${arr.map(y=>`${E(y.n)} (${f1(y.min)}')`).join(", ")}.${o.dE<0?" Possono spiegare parte del calo.":""}`);
  if(par.length)T.push(`➖ <b>Partiti dal suo reparto:</b> ${par.slice(0,3).map(p=>`${E(p.n)} (${f1(p.min)}')`).join(", ")}.`);
  if(cambioSq)T.push(`🚚 Ha cambiato squadra rispetto al ${o.lab}: contesto tutto nuovo.`);
  else if(cambioCoach&&!F.includes("inj"))T.push(`🧑‍🏫 <b>Nuovo allenatore:</b> ${E(cN)} (l'anno scorso ${E(cP)}). ${o.dE>=2?"La crescita può essere anche merito suo: se è graduale e continua, è il segnale da cogliere prima degli altri.":o.dE<=-2?"Il calo può dipendere anche da lui: un coach che lo usa diversamente.":"Finora lo usa in modo simile."}`);
  if(cambioCoach)F.push("coach")}
 else if(rookie){tipo="rookie";const thr=SOGLIA_RK[x.r]||.62;
  sc=(effc-thr)*80*Math.min(1,c.min/22)+(eta<=19?12:eta<=20?10:eta<=21?7:eta<=22?3:-5)+Math.max(0,x.dMin||0)*.6+Math.max(0,x.dQ||0)*30+vuln.reduce((s,q)=>s+q.v*2,0);
  T.push(`🐣 <b>Rookie</b>${eta?` di ${eta} anni`:""}: efficienza <b>${(Math.round(effc*100)/100).toLocaleString("it-IT")}</b> PDK al minuto (soglia ${({G:"guardie",F:"ali",C:"centri"})[x.r]} ${thr.toLocaleString("it-IT")}) in ${f1(c.min)}' a partita.${effc>=thr?" <b>Sopra la soglia: da seguire.</b>":" Ancora sotto la soglia."}`);
  if((x.dMin||0)>=2)T.push(`⏱️ Minuti in salita: ${f1(x.minO)}' → ${f1(x.minR)}' nelle ultime partite${(x.dQ||0)>=.03?`, quota del reparto ${Math.round(x.qO*100)}% → ${Math.round(x.qR*100)}%`:""}.`);
  inj.filter(i=>i.oo&&i.oo.wo.est-i.oo.w.est>=3).forEach(i=>{F.push("inj");T.push(`🩹 Parte dello spazio arriva dall'assenza di <b>${E(i.y.n)}</b> (${E(i.st)}): senza di lui ${f1(i.oo.wo.est)} PDK, con lui ${f1(i.oo.w.est)}.`)});
  if(cambioCoach)T.push(`🧑‍🏫 Allenatore al primo anno con la squadra: ${E(cN)}.`)}
 else return ANC.m[kk]=null;
 if(dav.length&&tipo==="rookie")T.push(`🧱 <b>Davanti a lui:</b> ${vuln.map(q=>`${E(q.y.n)} (${f1(q.y.min)}'${q.w.length?" · "+q.w.join(", "):""})`).join("; ")}.${vuln.some(q=>q.v>=.4)?" <b>Spazio che si può liberare.</b>":""}`);
 /* sconto se il salto dipende da un infortunio */
 if(F.includes("inj")&&sc>0)sc*=.65;
 return ANC.m[kk]={x,tipo,sc,T,F,o,effc,eta,cN,cP,cambioCoach}}
function vInvest(B){const all=Object.values(B.P).filter(x=>x.r&&x.n_>=4&&x.min>=10);const A=filtra(all).map(x=>analisi(B,x)).filter(Boolean);
 const S1=A.filter(a=>a.tipo==="salto"&&a.o&&(a.o.e36c-a.o.e36a>=1.5||a.o.dE>=2)).sort((p,q)=>q.sc-p.sc).slice(0,25),S2=A.filter(a=>a.tipo==="rookie"&&(a.eta==null||a.eta<=22)&&a.effc>=(SOGLIA_RK[a.x.r]||.62)-.06).sort((p,q)=>q.sc-p.sc).slice(0,20);
 const row=(a,i)=>{const x=a.x,io=injMap()[nz(x.n)],tag2=[io?`<span class="gmfl w">🩹 lui ${E(io)}</span>`:"",a.F.includes("inj")?`<span class="gmfl w">🩹 dipende da un infortunio</span>`:"",a.F.includes("coach")?`<span class="gmfl">🧑‍🏫 nuovo coach</span>`:""].join("");
  const big=a.tipo==="salto"?`<span class="gmv"><b class="up">${sg(a.o.e36c-a.o.e36a)}</b><small>ogni 36'</small></span><span class="gmv"><b class="${a.o.dE>=0?"up":"dn"}">${sg(a.o.dE)}</b><small>${f1(a.o.a.est)} → ${f1(a.o.c.est)}</small></span>`:`<span class="gmv"><b class="${a.effc>=(SOGLIA_RK[x.r]||.62)?"up":""}">${(Math.round(a.effc*100)/100).toLocaleString("it-IT")}</b><small>eff.</small></span><span class="gmv"><b>${f1(x.min)}'</b><small>${sg(x.dMin||0)}'</small></span>`;
  return`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i+1}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${a.eta?" · "+a.eta+" anni":""} · ${tag(x)}</small>${tag2?`<span class="gmfls">${tag2}</span>`:""}<em class="gmper gmtx">${a.T[0]}</em></span>${big}</div>`};
 return`<p class="gmnote">Due liste. <b>Migliorati sull'anno scorso</b>: conta prima di tutto il rendimento per minuto (PDK ogni 36' con la stessa formula), poi PDK e minuti; scontato se il salto dipende da un compagno infortunato. <b>Rookie</b>: efficienza al minuto contro la soglia del ruolo, età, minuti in salita, chi hanno davanti. Tocca un nome per la lettura completa.</p>
 <div class="gmrep">📈 Migliorati sull'anno scorso</div>${S1.length?S1.map(row).join(""):`<p class="gmnote">Nessuno con questi filtri.</p>`}
 <div class="gmrep">🐣 Rookie da seguire</div>${S2.length?S2.map(row).join(""):`<p class="gmnote">Nessun rookie sopra la soglia con questi filtri.</p>`}`}
function vLettura(B,x){const a=analisi(B,x);if(!a||!a.T.length)return"";return`<div class="gmrep">🧠 Lettura dell'analista</div><div class="gmlet">${a.T.map(t=>`<p>${t}</p>`).join("")}</div>`}
function vPlayer(B,n){const x=B.P[nz(n)];if(!x)return`<p class="gmnote">Dati non trovati.</p>`;const L=x.Gall||x.G,c=contr(n),fa=faTipo(n),r=lookup(G()&&G().ruoli,n),ri=rischio(x),D=destinazioni(x),N=((G()&&G().news&&G().news[x.tm])||[]).filter(a=>a.pl.some(p=>nz(p)===nz(n))||nz(a.h).includes(nz(cog(n)))),inj=injMap()[nz(n)];
 return`<button class="gback" data-gmback="1">‹ Assistente GM</button>
 <div class="gmph"><span class="gmseg">${typeof segBtn==="function"?segBtn(n,1):""}</span><b>${E(n)}</b><small>${x.tm} · ${RN[x.r]}${r&&r.e?" · "+r.e+" anni":""}${r&&r.exp!=null?" · "+(r.exp||1)+"° anno NBA":""} · ${tag(x)}${inj?` · <span class="dn">🩹 ${E(inj)}</span>`:""}</small></div>
 ${vLettura(B,x)}
 ${(()=>{const o=salto(B,x);return o?saltoBox(B,x,o):lastRow(n)?"":`<p class="gmnote">${STO()?"Nessuna stagione passata con almeno 10 partite: rookie o rientro.":""}</p>`})()}
 <div class="gmrep">⏱️ Questa stagione: ultime partite</div>
 <div class="gmwin">${[5,7,10].map(k=>`<button data-gmwin="${k}" aria-pressed="${S.win===k}">Ultime ${k}</button>`).join("")}</div>
 ${perche(L)}
 <div class="gmbox">${grafico2(L)}</div>
 ${confronto(L)}
 ${vCompagni(B,x)}
 ${vAnni(B,x)}
 <div class="gmrep">📝 Contratto</div>${c?`<div class="gmct">${c.s.map((v,i)=>`<div><small>${2026+i}/${String(27+i).padStart(2,"0")}</small><b>${f1(v)}</b><em>${c.o&&c.o[i]==="P"?"opz. giocatore":c.o&&c.o[i]==="S"?"opz. squadra":"M$"}</em></div>`).join("")}</div>`:`<p class="gmnote">Contratto non trovato (forse two-way o minimo).</p>`}${fa?`<p class="gmnote">Estate ${fa.y}: <b>${fa.ty}</b>${fa.ty==="RFA"?" · restricted: la squadra può pareggiare qualsiasi offerta":fa.ty==="UFA"?" · unrestricted: può firmare con chi vuole":""}.</p>`:""}
 <div class="gmrep">🔁 Rischio scambio · ${ri.sc}%</div><div class="gmrisk"><i><b style="width:${ri.sc}%"></b></i></div><p class="gmnote">${ri.why.length?E(ri.why.join(" · ")):"Nessun segnale particolare."}</p>
 ${D.length?`<div class="gmrep">🧭 Dove potrebbe andare</div>${D.map(d=>`<div class="gmpe gmde"><b>${d.tm}</b><span>${E(d.why.join(" · "))}</span></div>`).join("")}`:""}
 ${N.length?`<div class="gmrep">📰 Notizie (ESPN, in inglese)</div>${N.slice(0,6).map(a=>`<a class="gmnw" href="${E(a.u)}" target="_blank" rel="noopener"><small>${E(a.d)}</small><b>${E(a.h)}</b><span>${E(a.x)}</span></a>`).join("")}`:""}
 <p class="gmnote small">Tabellini Dynasty TV per quest'anno, Basketball Reference per le stagioni passate, ESPN per ruoli, età, infortuni e notizie. Stime, non certezze.</p>`}
/* ---------- ALLENATORI: come usano i giocatori ----------
   Per ogni squadra, sulle partite giocate (stagione) e sulle ultime 10: minuti medi del quintetto più usato (top 5 per minuti a partita),
   minuti dei titolari, lunghezza della rotazione (giocatori sopra i 10'), quota dei minuti per reparto G/F/C contro la media lega,
   quota ai giovani (≤23 anni, età ESPN), quintetti diversi schierati. */
let COACH=null;
function coachStats(){const B=build();if(!B)return null;if(COACH&&COACH.key===B.key)return COACH;const age=n=>{const r=lookup(G()&&G().ruoli,n);return r&&r.e||null};
 const one=gm=>{if(!gm.length)return null;const pm={},nm={},gp={};let tot=0,tit=0,rot=0;const rm={G:0,F:0,C:0},rp={G:0,F:0,C:0},fives=new Set();let yg=0,ygk=0;
  gm.forEach(g=>{const st=[];g.r.forEach(r=>{pm[r.k]=(pm[r.k]||0)+r.min;if(r.min>0)gp[r.k]=(gp[r.k]||0)+1;nm[r.k]=r.n;tot+=r.min;const ro=ruolo(r.n);rm[ro]+=r.min;rp[ro]+=r.pdk;if(r.tit){tit+=r.min;st.push(r.k)}if(r.min>=10)rot++;const e=age(r.n);if(e){ygk+=r.min;if(e<=23)yg+=r.min}});if(st.length===5)fives.add(st.sort().join("|"))});
  const N=gm.length,top=Object.entries(pm).map(([k,m])=>({k,n:nm[k],tot:m,gp:gp[k]||1,m:m/(gp[k]||1)})).sort((a,b)=>b.tot-a.tot)/* i 5 con più minuti totali; media sulle partite giocate */,t5=top.slice(0,5),tp=rp.G+rp.F+rp.C||1;
  return{N,top5:t5.reduce((s,x)=>s+x.m,0)/5,t5,tit:tit/N/5,rot:rot/N,q:{G:rm.G/(tot||1),F:rm.F/(tot||1),C:rm.C/(tot||1)},qp:{G:rp.G/tp,F:rp.F/tp,C:rp.C/tp},yg:ygk?yg/ygk:null,fives:fives.size}};
 const R={};for(const tm in B.T){const gm=B.T[tm].gm;if(gm.length<4)continue;R[tm]={tm,s:one(gm),u:one(gm.slice(-10))}}
 const L=Object.values(R),av=f=>L.reduce((a,o)=>a+f(o),0)/(L.length||1);
 const lg={top5:av(o=>o.s.top5),rot:av(o=>o.s.rot),tit:av(o=>o.s.tit),yg:av(o=>o.s.yg||0),q:{G:av(o=>o.s.q.G),F:av(o=>o.s.q.F),C:av(o=>o.s.q.C)}};
 /* tendenza: reparto con quota minuti più sopra la media lega (soglia 3 punti) */
 L.forEach(o=>{const d=["G","F","C"].map(r=>[r,o.s.q[r]-lg.q[r]]).sort((a,b)=>b[1]-a[1]);o.fav=d[0][1]>=.03?d[0][0]:null;o.dfav=d[0][1];
  const t=[];if(o.s.top5>=lg.top5+1.5)t.push("spreme i titolari");else if(o.s.top5<=lg.top5-1.5)t.push("divide i minuti");
  if(o.s.rot>=lg.rot+.6)t.push("rotazione lunga");else if(o.s.rot<=lg.rot-.6)t.push("rotazione corta");
  if(o.fav)t.push("favorisce "+({G:"le guardie",F:"le ali",C:"i centri"})[o.fav]);if(o.s.yg!=null&&o.s.yg>=lg.yg+.08)t.push("dà spazio ai giovani");
  if(o.s.fives>=Math.max(6,o.s.N*.45))t.push("cambia spesso quintetto");o.tags=t});
 COACH={key:B.key,R,lg};return COACH}
const coachNm=tm=>{const c=G()&&G().coach&&G().coach[tm];return c?c.n:null};
function qBar(q,lg){return`<span class="gmqb">${["G","F","C"].map(r=>`<i class="q${r}" style="width:${(q[r]*100).toFixed(1)}%">${Math.round(q[r]*100)}</i>`).join("")}</span>`}
function coachBox(o,lg){const u=o.u,s=o.s,dl=(a,b,f=f1)=>`<small class="${a-b>=0?"up":"dn"}">${sg(a-b,f)}</small>`;
 return`<div class="gmcoach"><div class="gmch1"><b>${E(coachNm(o.tm)||"Allenatore "+o.tm)}</b><small>${o.tm} · ${s.N} partite</small></div>
 <div class="gmcap"><div><small>Top 5 · minuti medi</small><b>${f1(s.top5)}'</b><em>lega ${f1(lg.top5)}' · ult. 10: ${f1(u.top5)}'</em></div><div><small>Rotazione</small><b>${f1(s.rot)}</b><em>giocatori sopra i 10' · lega ${f1(lg.rot)}</em></div><div><small>Titolari</small><b>${f1(s.tit)}'</b><em>a testa · lega ${f1(lg.tit)}'</em></div><div><small>Giovani ≤23</small><b>${s.yg!=null?Math.round(s.yg*100)+"%":"—"}</b><em>dei minuti · lega ${Math.round(lg.yg*100)}%</em></div><div><small>Quintetti</small><b>${s.fives}</b><em>diversi schierati</em></div></div>
 <div class="gmrep">Minuti per reparto (G · F · C)</div><div class="gmqrow"><span>Stagione</span>${qBar(s.q)}</div><div class="gmqrow"><span>Ultime 10</span>${qBar(u.q)}</div><div class="gmqrow lg"><span>Media lega</span>${qBar(lg.q)}</div>
 <div class="gmqrow"><span>PDK prodotti</span>${qBar(s.qp)}</div>
 ${o.tags.length?`<p class="gmnote"><b>${E(o.tags.join(" · "))}</b></p>`:""}
 <div class="gmrep">I suoi 5 più usati</div>${s.t5.map(x=>`<div class="gmpe"><b>${E(x.n)}</b><span>${RN[ruolo(x.n)]}</span><em>${f1(x.m)}' · ${x.gp} gare</em></div>`).join("")}</div>`}
function vCoach(){const C=coachStats();if(!C)return"";const ord=S.cord||"top5",L=Object.values(C.R);
 const key={top5:o=>-o.s.top5,rot:o=>-o.s.rot,G:o=>-(o.s.q.G-C.lg.q.G),F:o=>-(o.s.q.F-C.lg.q.F),C:o=>-(o.s.q.C-C.lg.q.C),yg:o=>-(o.s.yg||0)}[ord];L.sort((a,b)=>key(a)-key(b));
 return`<p class="gmnote">Come ogni allenatore usa i giocatori, da tutte le partite della stagione: minuti medi dei suoi 5 più usati, quanti giocatori ruota, a quale reparto dà più minuti rispetto alla media lega. Tocca una squadra per il dettaglio.</p>
 <div class="gmfil">${[["top5","Minuti top 5"],["rot","Rotazione"],["G","Guardie"],["F","Ali"],["C","Centri"],["yg","Giovani"]].map(([v,l])=>`<button data-gmco="${v}" aria-pressed="${ord===v}">${l}</button>`).join("")}</div>
 <div class="gmleg2"><span><i class="qG"></i>Guardie</span><span><i class="qF"></i>Ali</span><span><i class="qC"></i>Centri</span><span>lega: G ${Math.round(C.lg.q.G*100)}% · F ${Math.round(C.lg.q.F*100)}% · C ${Math.round(C.lg.q.C*100)}%</span></div>
 ${L.map((o,i)=>`<div role="button" tabindex="0" class="gmrw gmco" data-gmtmgo="${o.tm}"><b class="gmk">${i+1}</b><span class="gxn"><b>${o.tm}${coachNm(o.tm)?" · "+E(coachNm(o.tm)):""}</b>${qBar(o.s.q)}<small>${E(o.tags.join(" · ")||"nella media")}</small></span><span class="gmv"><b>${f1(o.s.top5)}'</b><small>top 5</small></span><span class="gmv"><b>${f1(o.s.rot)}</b><small>rotaz.</small></span></div>`).join("")}`}

/* pesi tarati sulla prova dei dati passati (5 date dal 31/10 al 12/11, esito nei 10 giorni dopo): top 20 esplosi 18% contro 8-9% di media;
   con la data di prova lasciata fuori dalla taratura 13%. L'età e lo spazio per crescere contano più di tutto. */
const RW0={Yoy:.5,P:1.2,Stk:1,Use:1,Room:2.5,Trend:2,Path:1.5,Age:1.8,Team:.5,Coach:.5};
/* (1149) pesi ritarati ogni giorno da GitHub (tools/radar_tune.mjs → radar-pesi.js); se il file manca valgono quelli di partenza */
const RW=Object.assign({},RW0,(typeof RADAR!=="undefined"&&RADAR&&RADAR.W)||{});
const injMap=()=>{const m={};try{(INFLIVE.injuries||[]).forEach(t=>(t.injuries||[]).forEach(i=>{const st=String(i.status||"");if(/out/i.test(st)){const lg=/week|month|surgery|season|indefinitely|re-evaluated/i.test(i.shortComment||"");m[nz(i.athlete.displayName)]=lg?"fuori a lungo":"infortunato"}}))}catch(e){}return m};
function rctx(live){const IM=live?injMap():null,C=coachStats();return{nz,ruolo,eta:etaDi,exp:n=>{const r=lookup(G()&&G().ruoli,n);return r?r.exp:null},contr,yoy:n=>{const o=lastRow(n),t=o&&o.t;if(!t)return null;const e=pdkEst(t);return{lab:o.l,g:t[1],est:e,min:t[3],e36:t[3]?e/t[3]*36:0}},
 inj:IM?n=>IM[nz(n)]||null:null,
 coach:(tm,r)=>{const o=C&&C.R[tm];if(!o)return null;let v=0;const w=[];const dy=(o.s.yg||0)-(C.lg.yg||0);if(dy>.05){v+=Math.min(1,dy*6);w.push("coach che dà spazio ai giovani")}if(o.fav===r){v+=.4;w.push("coach che favorisce il suo reparto")}if(o.s.rot<=C.lg.rot-.6)v+=.2;return{v,why:w.join(" · ")}}}}
const oggi=()=>{const d=new Date();return d.toISOString().slice(0,10)};
let RCACHE=null;
function radarLive(){const B=build();if(!B)return[];if(RCACHE&&RCACHE.key===B.key)return RCACHE.L;const d=new Date(Date.now()+864e5).toISOString().slice(0,10);
 const L=radarAt(TV,d,RW,rctx(true)).filter(x=>x.mR<=26).sort((a,b)=>b.score-a.score);RCACHE={key:B.key,L};return L}
/* lunedì della settimana (YYYY-MM-DD) */
const lun=d=>{const t=new Date(d+"T12:00:00Z"),w=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-w);return t.toISOString().slice(0,10)};
let BTC=null;
function prova(){const B=build();if(BTC&&BTC.key===B.key)return BTC.R;const R=[],ctx=rctx(false),days=Object.keys(TV.days).filter(d=>TV.days[d].some(g=>g[5]!=="S")).sort(),last=days[days.length-1];
 for(let m=lun(days[0]);;){const t=new Date(m+"T12:00:00Z");t.setUTCDate(t.getUTCDate()+7);m=t.toISOString().slice(0,10);if(m>last)break;
  const to=new Date(Date.parse(m)+14*864e5).toISOString().slice(0,10);let L=radarAt(TV,m,RW,ctx).filter(x=>x.mR<=26);radarEsito(TV,m,L,ctx,to);L=L.filter(x=>x.out);if(L.length<30)continue;
  const top=L.slice().sort((a,b)=>b.score-a.score).slice(0,20);R.push({d:m,hit:top.filter(x=>x.boom),n:top.length,base:L.filter(x=>x.boom).length/L.length,fin:to>last})}
 BTC={key:B.key,R};return R}
function vRadarTop(){return`<div class="gmwin gm2">${[["pre","🚀 Prima del salto"],["salto","🆙 Salto sull'anno scorso"]].map(([k,l])=>`<button data-gmrm="${k}" aria-pressed="${(S.rm||"pre")===k}">${l}</button>`).join("")}</div>`}
function vRadar(){if(S.rm==="salto")return vRadarTop()+vSalto();return vRadarTop()+vRadar1()}
function vRadar1(){const L=filtra(radarLive()).slice(0,40),R=prova(),RD=typeof RADAR!=="undefined"&&RADAR?RADAR:null;
 const gd=d=>d.slice(8)+"/"+d.slice(5,7);
 const tot=R.reduce((a,r)=>a+r.hit.length,0),nn=R.reduce((a,r)=>a+r.n,0),bs=R.length?R.reduce((a,r)=>a+r.base,0)/R.length:0;
 /* previsioni vere salvate da GitHub: esito dalla data in cui sono state fatte */
 const salv=((RD&&RD.prev)||[]).slice().reverse().map(h=>{const LL=h.L.map(x=>Object.assign({},x));radarEsito(TV,h.d,LL,{nz});return{d:h.d,hit:LL.filter(x=>x.boom),n:LL.filter(x=>x.out).length,tot:LL.length}});
 const ST=(RD&&RD.storia)||[],ul=ST[ST.length-1],cam=ST.filter(x=>x.cambiati).length;
 const KN={Yoy:"Salto sull'anno scorso",P:"Rendimento ogni 36'",Stk:"Rubate+stoppate",Use:"Tiri",Room:"Spazio per crescere",Trend:"Minuti in salita",Path:"Strada libera",Age:"Età / anni NBA",Team:"Squadra che perde",Coach:"Allenatore"};
 const auto=`<div class="gmrep">🧠 Si migliora da solo</div><p class="gmnote">Ogni giorno GitHub rifà la prova su tutte le date della stagione, cerca pesi migliori sulle date più vecchie e li adotta solo se fanno meglio su quelle più recenti (mai usate per tararli), a metà strada per non stravolgere il radar.${RD?` Ultimo controllo ${new Date(RD.upd).toLocaleDateString("it-IT")}: <b>${E(RD.note)}</b>${ul&&ul.tot!=null?` Sulle ${ul.date} date di prova la top 20 prende il ${Math.round(ul.tot*100)}% contro il ${Math.round(ul.baseTot*100)}% di media.`:""} Aggiornamenti dei pesi finora: ${cam}.`:" Il primo controllo arriva con il prossimo giro di GitHub."}</p>
 <div class="gmw">${Object.keys(KN).map(k=>{const v=RW[k],v0=RW0[k];return`<div><span>${KN[k]}</span><i><b style="width:${Math.min(100,v/3*100)}%"></b></i><em class="${v>v0+.05?"up":v<v0-.05?"dn":""}">${f1(v)}${Math.abs(v-v0)>.05?` (${sg(v-v0)})`:""}</em></div>`}).join("")}</div>
 ${ST.length>1?`<p class="gmnote small">Storico: ${ST.slice(-8).map(x=>`${x.d.slice(8)}/${x.d.slice(5,7)} ${x.cambiati?"🔄":"✔︎"}${x.tot!=null?" "+Math.round(x.tot*100)+"%":""}`).join(" · ")}</p>`:""}`;
 return`<p class="gmnote">Chi può esplodere <b>prima</b> che succeda: produce tanto per minuto ma gioca ancora poco, ha la strada libera (chi gli sta davanti è vecchio, in scadenza o infortunato), è giovane o al 2°-3° anno, ha un allenatore che fa giocare i giovani, la squadra perde. Solo chi gioca 26 minuti o meno.</p>
 ${L.map((x,i)=>`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i+1}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${etaDi(x.n)?" · "+etaDi(x.n)+" anni":""} · ${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small><em class="gmper">${E(x.why.slice(0,4).join(" · "))}</em></span><span class="gmv"><b class="gmrs">${Math.round(x.score*10)}</b><small>radar</small></span><span class="gmv"><b>${f1(x.mR)}'</b><small>${f1(x.p36s)} /36'</small></span></div>`).join("")}
 <div class="gmrep">🎯 Quanto ci prende</div>
 <p class="gmnote">Il radar rifatto ogni lunedì con i soli dati di allora, e controllato nelle 2 settimane dopo. Esploso = almeno +6 minuti e +6 PDK a partita. Finora <b>${tot} su ${nn}</b> (${nn?Math.round(tot/nn*100):0}%) contro il ${Math.round(bs*100)}% di chi non era segnalato.</p>
 ${R.map(r=>`<div class="gmpe gmbt"><b>${gd(r.d)}</b><span>${r.hit.length?r.hit.map(x=>E(x.n)).join(", "):"nessuno"}${r.fin?" · ancora in corso":""}</span><em>${r.hit.length}/${r.n}</em></div>`).join("")}
 ${salv.length?`<div class="gmrep">📒 Previsioni vere</div><p class="gmnote">La top 20 salvata da GitHub ogni settimana, con i pesi di quel giorno: nessun ricalcolo dopo.</p>${salv.map(r=>`<div class="gmpe gmbt"><b>${gd(r.d)}</b><span>${r.hit.length?r.hit.map(x=>E(x.n)).join(", "):r.n?"nessuno per ora":"da valutare (servono 3 partite)"}</span><em>${r.hit.length}/${r.tot}</em></div>`).join("")}`:""}${auto}`}
function vCap(){const g=G(),Lg=g&&g.capLega;const T=Object.keys((build()||{}).byTeam||{}).sort().map(t=>({t,p:payroll(t)})).filter(o=>o.p).sort((a,b)=>b.p.s-a.p.s);
 if(!T.length)return`<p class="gmnote warn">I contratti non sono ancora arrivati da GitHub.</p>`;
 return`<p class="gmnote">Payroll 2026/27 di ogni squadra (somma dei contratti).${Lg?` Cap ${f1(Lg.cap)} M$${Lg.tax?` · tax ${f1(Lg.tax)}`:""}${Lg.apron1?` · primo apron ${f1(Lg.apron1)}`:""}${Lg.apron2?` · secondo apron ${f1(Lg.apron2)}`:""}.${Lg.stima?" Tax e apron sono stimati dal cap (Spotrac non risponde).":""}`:""} Solo i contratti garantiti di Basketball Reference: minimi e two-way possono mancare.</p>${T.map(o=>`<div role="button" tabindex="0" class="gmrw sq" data-gmtmgo="${o.t}"><span class="gxn"><b>${o.t}</b><small>${o.p.n} contratti</small></span><span class="gmv"><b>${f1(o.p.s)} M$</b><small class="${Lg&&Lg.cap&&o.p.s<=Lg.cap?"up":"dn"}">${Lg&&Lg.cap?sg(Lg.cap-o.p.s)+" cap":""}</small></span><span class="gmv"><b class="${Lg&&Lg.tax&&o.p.s>Lg.tax?"dn":"up"}">${Lg&&Lg.tax?(o.p.s>Lg.tax?(Lg.apron2&&o.p.s>Lg.apron2?"2° apron":Lg.apron1&&o.p.s>Lg.apron1?"1° apron":"tax"):"sotto tax"):""}</b></span></div>`).join("")}`}
window.vGmas=function(){const B=build();if(!B)return`<p class="note">Dati Dynasty TV non disponibili.</p>`;if(S.pl)return`<div class="gmas">${vPlayer(B,S.pl)}</div>`;
 const g=G(),up=g&&g.upd?new Date(g.upd).toLocaleDateString("it-IT"):"mai";
 const tabs=[["radar","🚀 Radar"],["cresc","📈 In crescita"],["inv","💎 Investimenti"],["risk","🔁 Rischio scambio"],["sq","🏀 Squadra"],["coach","🧑‍🏫 Allenatori"],["cap","💰 Cap"]];
 return`<div class="gmas"><button class="gback" id="hofback">‹ Hall of Fame Ducks</button>
 <div class="gmhero"><small>Texas Ducks · area riservata</small><b>Assistente GM</b><em>Chi sta emergendo, chi può partire, su chi investire · dati GitHub del ${up}</em></div>
 <div class="gmtabs">${tabs.map(([k,l])=>`<button data-gmtab="${k}" aria-pressed="${S.tab===k}">${l}</button>`).join("")}</div>
 ${S.tab!=="cap"&&S.tab!=="coach"&&S.tab!=="sq"?`<div class="gmeta${S.eta==="o27"?" o":""}"><span class="gmes">${[["u27","Fino a"],["o27","Da (da vendere)"]].map(([v,l])=>`<button data-gmeta="${v}" aria-pressed="${S.eta===v}">${l}</button>`).join("")}</span><b class="gmel">${S.eta==="o27"?`${S.etaN} anni in su`:`${S.etaN} anni`}</b><input type="range" min="19" max="38" step="1" value="${S.etaN}" data-gmeta-r aria-label="Età"></div>`:""}${S.tab!=="cap"&&S.tab!=="coach"?`<div class="gmfil">${[["","Tutti i ruoli"],["G","Guardie"],["F","Ali"],["C","Centri"]].map(([v,l])=>`<button data-gmr="${v}" aria-pressed="${S.ruolo===v}">${l}</button>`).join("")}<span></span>${[["tutti","Tutti"],["liberi","Solo liberi"],["presi","In Dreamers"]].map(([v,l])=>`<button data-gmso="${v}" aria-pressed="${S.solo===v}">${l}</button>`).join("")}</div>`:""}
 ${!["sq","cap","coach"].includes(S.tab)&&S.eta!=="o27"?`<p class="gmnote small">Tolti i giocatori già in una squadra Dreamers con valore ${VMAX} o più: qui servono quelli ancora poco valorizzati.</p>`:""}${S.tab==="radar"?vRadar():S.tab==="cresc"?vClass(B):S.tab==="inv"?vInvest(B):S.tab==="risk"?vRischio(B):S.tab==="sq"?vSquadra(B):S.tab==="coach"?vCoach():vCap()}</div>`};
document.addEventListener("click",e=>{if(typeof cur==="undefined"||cur!=="gmas")return;const t=e.target,k=t.closest("[data-gmtab],[data-gmr],[data-gmso],[data-gmtm],[data-gmpl],[data-gmback],[data-gmtmgo],[data-gmco],[data-gmeta],[data-gmwin],[data-gmrm]");if(!k)return;e.preventDefault();const d=k.dataset;let top=false;
 if(d.gmtab){S.tab=d.gmtab;S.pl=null}else if(d.gmr!=null)S.ruolo=d.gmr;else if(d.gmso)S.solo=d.gmso;else if(d.gmtm)S.tm=d.gmtm;else if(d.gmtmgo){S.tab="sq";S.tm=d.gmtmgo;top=true}else if(d.gmpl){S.pl=d.gmpl;top=true}else if(d.gmback){S.pl=null;top=true}else if(d.gmco){S.cord=d.gmco}else if(d.gmwin){S.win=+d.gmwin}else if(d.gmrm){S.rm=d.gmrm}else if(d.gmeta){S.eta=d.gmeta}
 const y=scrollY;render();scrollTo(0,top?0:y)});
document.addEventListener("input",e=>{const r=e.target.closest&&e.target.closest("[data-gmeta-r]");if(!r)return;const l=r.parentNode.querySelector(".gmel");if(l)l.textContent=S.eta==="o27"?`${r.value} anni in su`:`${r.value} anni`});
document.addEventListener("change",e=>{const r=e.target.closest&&e.target.closest("[data-gmeta-r]");if(!r)return;S.etaN=+r.value;try{localStorage.setItem("gm_eta",S.etaN)}catch(x){}const y=scrollY;render();scrollTo(0,y)});
try{const v=+localStorage.getItem("gm_eta");if(v>=19&&v<=38)S.etaN=v}catch(e){}
try{VIEWS.gmas=window.vGmas}catch(e){}
})();
