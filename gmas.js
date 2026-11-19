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
.gmsp{display:block}.gmrs{color:#7c3aed;font-size:1.05rem!important}.gmpe.gmbt{grid-template-columns:46px 1fr auto}.gmpe.gmbt span{color:inherit;font-size:.74rem}.gmeta{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px 10px;margin:0 0 10px;padding:9px 10px;border:1px solid var(--line,rgba(128,128,128,.3));border-radius:12px;background:var(--panel,transparent)}.gmes{display:flex;gap:4px}.gmes button{border:1px solid var(--line,rgba(128,128,128,.3));background:none;color:inherit;border-radius:999px;padding:5px 10px;font:inherit;font-size:.74rem;font-weight:800}.gmel{text-align:right;font-size:1rem}.gmeta input{grid-column:1/-1;width:100%;accent-color:#7c3aed}.gmeta.o input{accent-color:#dc2626}.gmeta.o .gmel{color:#dc2626}.gmeta [data-gmeta=o27][aria-pressed=true]{background:#dc2626!important;border-color:#dc2626!important}.gmqb{display:flex;height:14px;border-radius:5px;overflow:hidden;margin:4px 0 3px;max-width:260px}.gmqb i{display:block;font-style:normal;font-size:.56rem;font-weight:800;color:#fff;text-align:center;line-height:14px;overflow:hidden}.qG,.gmleg2 .qG{background:#0ea5e9}.qF,.gmleg2 .qF{background:#8b5cf6}.qC,.gmleg2 .qC{background:#f59e0b}
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
  [["a",g[0],g[1]],["h",g[1],g[0]]].forEach(([sd,tm,opp])=>{(T[tm]=T[tm]||{g:[],gm:[]}).g.push(d);const GR={d,r:[]};T[tm].gm.push(GR);(B[sd]||[]).forEach(r=>{GR.r.push({k:nz(r[0]),n:r[0],min:mins(r[2]),tit:!!r[1],pdk:+r[19]||0});const kk=nz(r[0]);const x=P[kk]||(P[kk]={n:r[0],tm,G:[]});x.tm=tm;x.G.push({d,tm,opp,min:mins(r[2]),pdk:+r[19]||0,tit:!!r[1],pt:+r[3]||0})})})}
 /* squadre: partite in ordine e giocatori */
 const out={key,P,T,byTeam:{}};
 /* finestra per squadra: ultime K partite della SQUADRA (chi non gioca conta 0 minuti), così le quote del reparto sommano ai minuti veri */
 for(const tm in T)T[tm].g=[...new Set(T[tm].g)].sort();
 for(const n in P){const x=P[n];const Dt=(T[x.tm]||{g:[]}).g,L=x.G.filter(g=>g.tm===x.tm);if(L.length<3||Dt.length<4)continue;x.r=ruolo(n);
  const K=Math.min(RECENT,Math.max(2,Math.floor(Dt.length/3))),cutD=Dt[Dt.length-K],firstD=L[0].d,oldD=Dt.filter(d=>d<cutD&&d>=firstD).length||1;
  const rec=L.filter(g=>g.d>=cutD),old=L.filter(g=>g.d<cutD),av=(a,f)=>a.length?a.reduce((s,g)=>s+f(g),0)/a.length:0,sum=(a,f)=>a.reduce((s,g)=>s+f(g),0);
  x.n_=L.length;x.min=av(L,g=>g.min);x.minR=sum(rec,g=>g.min)/K;x.minO=old.length?sum(old,g=>g.min)/oldD:0;x.pdk=av(L,g=>g.pdk);x.pdkR=av(rec,g=>g.pdk);x.pdkO=av(old,g=>g.pdk);
  x.titR=rec.filter(g=>g.tit).length/K;x.titO=old.filter(g=>g.tit).length/oldD;x.dMin=x.minR-x.minO;x.dPdk=rec.length?x.pdkR-x.pdkO:-x.pdkO;x.k=Math.max(1,rec.length);x.pl=rec.length;x.K=K;x.G=L;
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
const S={tab:"radar",tm:null,pl:null,ruolo:"",solo:"tutti",eta:"u27",etaN:26};window.GMAS=S;
const RN={G:"Guardia",F:"Ala",C:"Centro"};
const tag=x=>{const o=owner(x.n);return o?`<span class="gmown">${typeof badge==="function"?badge(o,"gmb"):""}${E(TEAMS[o].nick)}</span>`:`<span class="gmfa">libero</span>`};
const ctxt=n=>{const c=contr(n),fa=faTipo(n);if(!c&&!fa)return"";return`${c?`${f1(c.s[0])} M$ · ${c.s.length} ${c.s.length===1?"anno":"anni"}`:""}${fa?` · ${fa.ty}`:""}`};
/* (1145) età: di default solo under 27 (≤26 anni); «Over 27 da vendere» mostra solo i 27+. Età ESPN; se manca il giocatore resta negli under. */
const etaDi=n=>{const r=lookup(G()&&G().ruoli,n);return r&&r.e||null};
function filtra(L,sq){return L.filter(x=>(sq||(()=>{const e=etaDi(x.n);return S.eta==="o27"?e!=null&&e>=S.etaN:e==null||e<=S.etaN})())&&(!S.ruolo||x.r===S.ruolo)&&(S.solo==="tutti"||(S.solo==="liberi"?!owner(x.n):!!owner(x.n))))}
function riga(x,i,extra){return`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${etaDi(x.n)?" · "+etaDi(x.n)+" anni":""} · ${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small>${extra||""}</span><span class="gmv"><b class="${x.dMin>=0?"up":"dn"}">${sg(x.dMin)}'</b><small>${f1(x.minO)}' → ${f1(x.minR)}'</small></span><span class="gmv"><b class="${x.dPdk>=0?"up":"dn"}">${sg(x.dPdk)}</b><small>PDK ${f1(x.pdkR)}</small></span>${spark(x.G,g=>g.min,"#38bdf8",70,26)}</div>`}
function vClass(B){const L=filtra(Object.values(B.P).filter(x=>x.cresc!=null&&x.n_>=6&&x.minR>=12)).sort((a,b)=>b.cresc-a.cresc).slice(0,40);
 return`<p class="gmnote">I giocatori che stanno guadagnando più minuti, più PDK e più spazio nel loro reparto: ultime ${RECENT} partite contro quelle di prima. Tocca un nome per grafico, contratto e analisi.</p>${L.map((x,i)=>riga(x,i+1,x.perde&&x.perde.length?`<em class="gmper">prende spazio a ${x.perde.map(y=>E(y.n.split(" ").slice(-1)[0])+" ("+sg(y.d)+"')").join(", ")}</em>`:"")).join("")}`}
function vInvest(B){const L=filtra(Object.values(B.P).filter(x=>x.cresc!=null&&x.n_>=5)).map(x=>{const r=lookup(G()&&G().ruoli,x.n),eta=r&&r.e||null,ri=rischio(x),sc=Math.max(0,x.cresc)*0.6+Math.max(0,x.pdkR-15)*1.2+(eta?Math.max(0,27-eta)*2.2:0)+(ri.sc>=40&&x.minR<28?ri.sc*.25:0);return{x,eta,ri,sc}}).sort((a,b)=>b.sc-a.sc).slice(0,40);
 return`<p class="gmnote">Su chi investire per il futuro: chi cresce, giovane età, rendimento già buono e, se è a rischio scambio, la possibilità di trovare più minuti altrove.</p>${L.map((o,i)=>riga(o.x,i+1,`<em class="gmper">${o.eta?o.eta+" anni · ":""}punteggio ${Math.round(o.sc)}${o.ri.sc>=40?" · possibile scambio":""}</em>`)).join("")}`}
function vRischio(B){const L=filtra(Object.values(B.P).filter(x=>x.n_>=5&&x.min>=10)).map(x=>({x,r:rischio(x)})).filter(o=>o.r.sc>=30).sort((a,b)=>b.r.sc-a.r.sc).slice(0,40);
 const nod=!G()||!Object.keys(G().contratti||{}).length?`<p class="gmnote warn">I contratti non sono ancora arrivati da GitHub: il rischio usa solo minuti e reparto.</p>`:"";
 return`${nod}<p class="gmnote">Chi potrebbe essere scambiato presto: scadenza del contratto, restricted/unrestricted free agent, squadra sopra la luxury tax, reparto affollato, contratto pesante. Per ognuno le squadre che potrebbero prenderlo.</p>${L.map((o,i)=>{const D=destinazioni(o.x);return riga(o.x,i+1,`<em class="gmper">rischio ${o.r.sc}% · ${E(o.r.why.slice(0,2).join(" · "))}${D.length?`<br>possibili destinazioni: ${D.map(d=>d.tm).join(", ")}`:""}</em>`)}).join("")}`}
function vSquadra(B){const tms=Object.keys(B.byTeam).sort();if(!S.tm||!B.byTeam[S.tm])S.tm=tms[0];const L=filtra(B.byTeam[S.tm].slice(),1).sort((a,b)=>b.minR-a.minR),pay=payroll(S.tm),Lg=G()&&G().capLega,N=(G()&&G().news&&G().news[S.tm])||[];
 const tbl=["G","F","C"].map(r=>{const R=L.filter(x=>x.r===r);return R.length?`<div class="gmrep">${({G:"Guardie",F:"Ali",C:"Centri"})[r]}</div>${R.map(x=>`<div role="button" tabindex="0" class="gmrw sq" data-gmpl="${E(x.n)}"><span class="gxn"><b>${E(x.n)}</b><small>${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small></span><span class="gmv"><b>${f1(x.minR)}'</b><small class="${x.dMin>=0?"up":"dn"}">${sg(x.dMin)}'</small></span><span class="gmv"><b>${Math.round(x.qR*100)}%</b><small class="${x.dQ>=0?"up":"dn"}">${sg(x.dQ*100,v=>Math.round(v))}%</small></span><span class="gmv"><b>${f1(x.pdkR)}</b><small class="${x.dPdk>=0?"up":"dn"}">${sg(x.dPdk)}</small></span>${spark(x.G,g=>g.min,"#38bdf8",60,24)}</div>`).join("")}`:""}).join("");
 return`<div class="gmtms">${tms.map(t=>`<button data-gmtm="${t}" aria-pressed="${t===S.tm}">${t}</button>`).join("")}</div>
 <div class="gmcap">${pay?`<div><small>Payroll 2026/27</small><b>${f1(pay.s)} M$</b><em>${pay.n} contratti</em></div>`:""}${Lg&&pay&&Lg.cap?`<div><small>Spazio nel cap</small><b class="${Lg.cap-pay.s>=0?"up":"dn"}">${sg(Lg.cap-pay.s)} M$</b><em>cap ${f1(Lg.cap)}</em></div><div><small>Luxury tax</small><b class="${pay.s>(Lg.tax||1e9)?"dn":"up"}">${pay.s>(Lg.tax||1e9)?"sopra":"sotto"}</b><em>${Lg.tax?"soglia "+f1(Lg.tax):""}</em></div>`:""}${!pay?`<div><small>Contratti</small><b>in arrivo</b><em>da GitHub</em></div>`:""}</div>
 ${(()=>{const C=coachStats(),o=C&&C.R[S.tm];return o?`<details class="gmcod"><summary>🧑‍🏫 ${E(coachNm(S.tm)||"Allenatore")} · ${E(o.tags.join(" · ")||"uso dei giocatori nella media")}</summary>${coachBox(o,C.lg)}</details>`:""})()}<div class="gmhd"><span>Giocatore</span><span>Minuti ult.</span><span>Quota reparto</span><span>PDK ult.</span><span></span></div>${tbl}
 ${N.length?`<div class="gmrep">Notizie (ESPN, in inglese)</div>${N.slice(0,8).map(x=>`<a class="gmnw" href="${E(x.u)}" target="_blank" rel="noopener"><small>${E(x.d)}</small><b>${E(x.h)}</b><span>${E(x.x)}</span></a>`).join("")}`:`<p class="gmnote">Le notizie della squadra arrivano con il prossimo aggiornamento di GitHub.</p>`}`}
function vPlayer(B,n){const x=B.P[nz(n)];if(!x)return`<p class="gmnote">Dati non trovati.</p>`;const c=contr(n),fa=faTipo(n),r=lookup(G()&&G().ruoli,n),ri=rischio(x),D=destinazioni(x),N=((G()&&G().news&&G().news[x.tm])||[]).filter(a=>a.pl.some(p=>nz(p)===nz(n))||nz(a.h).includes(nz(n).split(" ").slice(-1)[0]));
 const peers=(B.byTeam[x.tm]||[]).filter(y=>y.r===x.r).sort((a,b)=>b.minR-a.minR);
 return`<button class="gback" data-gmback="1">‹ Assistente GM</button>
 <div class="gmph"><b>${E(n)}</b><small>${x.tm} · ${RN[x.r]}${r&&r.e?" · "+r.e+" anni":""} · ${tag(x)}</small></div>
 <div class="gmcards"><div><small>Minuti</small><b>${f1(x.minR)}'</b><em class="${x.dMin>=0?"up":"dn"}">${sg(x.dMin)}' (prima ${f1(x.minO)}')</em></div><div><small>PDK</small><b>${f1(x.pdkR)}</b><em class="${x.dPdk>=0?"up":"dn"}">${sg(x.dPdk)} (prima ${f1(x.pdkO)})</em></div><div><small>Quota reparto</small><b>${Math.round(x.qR*100)}%</b><em class="${x.dQ>=0?"up":"dn"}">${sg(x.dQ*100,v=>Math.round(v))}%</em></div><div><small>Titolare</small><b>${Math.round(x.titR*100)}%</b><em>prima ${Math.round(x.titO*100)}%</em></div></div>
 <div class="gmbox">${grafico(x)}</div>
 <div class="gmrep">Il reparto (${({G:"guardie",F:"ali",C:"centri"})[x.r]} ${x.tm})</div>${peers.map(y=>`<div class="gmpe${y===x?" me":""}"><b>${E(y.n)}</b><span>${f1(y.minO)}' → ${f1(y.minR)}'</span><em class="${y.dMin>=0?"up":"dn"}">${sg(y.dMin)}'</em></div>`).join("")}
 ${x.perde&&x.perde.length?`<p class="gmnote">Sta prendendo minuti a <b>${x.perde.map(y=>E(y.n)).join("</b> e <b>")}</b>.</p>`:""}
 <div class="gmrep">Contratto</div>${c?`<div class="gmct">${c.s.map((v,i)=>`<div><small>${2026+i}/${String(27+i).padStart(2,"0")}</small><b>${f1(v)}</b><em>${c.o&&c.o[i]==="P"?"opz. giocatore":c.o&&c.o[i]==="S"?"opz. squadra":""}</em></div>`).join("")}</div>`:`<p class="gmnote">Contratto non trovato${G()&&Object.keys(G().contratti||{}).length?" (forse two-way o minimo)":": i dati arrivano da GitHub"}.</p>`}${fa?`<p class="gmnote">Estate ${fa.y}: <b>${fa.ty}</b>${fa.ty==="RFA"?" · restricted: la squadra può pareggiare qualsiasi offerta":fa.ty==="UFA"?" · unrestricted: può firmare con chi vuole":""}.</p>`:""}
 <div class="gmrep">Rischio scambio · ${ri.sc}%</div><p class="gmnote">${ri.why.length?E(ri.why.join(" · ")):"Nessun segnale particolare."}</p>
 ${D.length?`<div class="gmrep">Dove potrebbe andare</div>${D.map(d=>`<div class="gmpe gmde"><b>${d.tm}</b><span>${E(d.why.join(" · "))}</span></div>`).join("")}`:""}
 ${N.length?`<div class="gmrep">Notizie (ESPN, in inglese)</div>${N.slice(0,6).map(a=>`<a class="gmnw" href="${E(a.u)}" target="_blank" rel="noopener"><small>${E(a.d)}</small><b>${E(a.h)}</b><span>${E(a.x)}</span></a>`).join("")}`:""}
 <p class="gmnote small">Stime calcolate dai tabellini della stagione (Dynasty TV) e dai dati di GitHub (contratti e cap Basketball Reference, free agent Spotrac o dedotti dai contratti, ruoli Dreamers ed ESPN, notizie ESPN). Servono a guardare prima degli altri, non sono certezze.</p>`}
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
/* ---------- RADAR BREAKOUT (core) ----------
   radarAt(cut,W,ctx): usa solo le partite PRIMA di cut. ctx: {nz,ruolo,eta,exp,contr,coach,inj}
   Segnali: fP rendimento ogni 36' sopra la mediana del reparto · fStk rubate+stoppate ogni 36' · fUse tiri ogni 36' · fRoom spazio per crescere
   (pochi minuti) · fTrend minuti in salita · fPath strada libera (chi gioca davanti nel reparto è vecchio, in scadenza o infortunato a lungo)
   · fAge età/anni NBA · fCoach allenatore che dà spazio ai giovani o favorisce il reparto · fTeam squadra che perde. */
function radarAt(TV,cut,W,ctx){const mins=m=>{const a=String(m||"0").split(":");return(+a[0]||0)+(+a[1]||0)/60};
 const P={},T={};
 for(const d of Object.keys(TV.days).sort()){if(d>=cut)break;for(const g of TV.days[d]||[]){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;
  const wa=(+g[2]||0)>(+g[3]||0);[["a",g[0],wa],["h",g[1],!wa]].forEach(([sd,tm,w])=>{const t=T[tm]=T[tm]||{g:[],w:0,l:0};t.g.push(d);w?t.w++:t.l++;
   (B[sd]||[]).forEach(r=>{const k=ctx.nz(r[0]),m=mins(r[2]);if(m<=0)return;const x=P[k]=P[k]||{n:r[0],G:[]};x.tm=tm;x.G.push({d,tm,min:m,pdk:+r[19]||0,stl:+r[8]||0,blk:+r[9]||0,fga:+r[13]||0,fta:+r[17]||0,tit:!!r[1]})})})}}
 const L=[];
 for(const k in P){const x=P[k],Dt=T[x.tm].g;if(Dt.length<4)continue;const last10=Dt.slice(-10),l5=Dt.slice(-5),p5=Dt.slice(-10,-5);
  const Gt=x.G.filter(g=>g.tm===x.tm),in10=Gt.filter(g=>g.d>=last10[0]);if(in10.length<3)continue;
  const M=x.G.reduce((s,g)=>s+g.min,0);if(M<50)continue;const S=f=>x.G.reduce((s,g)=>s+f(g),0);
  const av=(a,f)=>a.length?a.reduce((s,g)=>s+f(g),0)/a.length:0;
  const g5=Gt.filter(g=>g.d>=l5[0]),gp5=p5.length?Gt.filter(g=>g.d>=p5[0]&&g.d<l5[0]):[];
  L.push({k,n:x.n,tm:x.tm,r:ctx.ruolo(x.n),gp10:in10.length,mR:av(in10,g=>g.min),pR:av(in10,g=>g.pdk),M,
   p36:S(g=>g.pdk)/M*36,stk36:S(g=>g.stl+g.blk)/M*36,use36:S(g=>g.fga+.44*g.fta)/M*36,
   dMin:g5.length&&gp5.length?av(g5,g=>g.min)-av(gp5,g=>g.min):0,win:T[x.tm].w/((T[x.tm].w+T[x.tm].l)||1)})}
 const med={};for(const r of["G","F","C"]){const v=L.filter(x=>x.r===r&&x.M>=150).map(x=>x.p36).sort((a,b)=>a-b);med[r]=v.length?v[v.length>>1]:20}
 const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
 const byT={};L.forEach(x=>(byT[x.tm]=byT[x.tm]||[]).push(x));
 for(const x of L){const why=[],e=ctx.eta(x.n),ex=ctx.exp(x.n),c=ctx.contr(x.n);
  /* rendimento ogni 36' «prudente»: tirato verso la mediana del reparto con 250 minuti fittizi (pochi minuti = poco affidabile) */x.p36s=(x.p36*x.M+med[x.r]*250)/(x.M+250);x.fP=cl((x.p36s-med[x.r])/5,-1.5,2.5);x.fStk=cl((x.stk36-2)/1.5,-1,1.5);x.fUse=cl((x.use36-14)/6,-1,1.5);x.fRoom=cl((30-x.mR)/10,0,1.5);x.fTrend=cl(x.dMin/8,-1,1.5);
  const bl=(byT[x.tm]||[]).filter(y=>y!==x&&y.r===x.r&&y.mR>x.mR);let sw=0,sv=0;const blw=[];
  bl.forEach(y=>{const ye=ctx.eta(y.n),yc=ctx.contr(y.n),inj=ctx.inj&&ctx.inj(y.n);let v=0;const t=[];if(ye>=34){v+=.8;t.push(ye+" anni")}else if(ye>=31){v+=.45;t.push(ye+" anni")}
   if(yc&&yc.s.length===1){v+=.3;t.push("in scadenza")}if(inj){v+=inj==="fuori a lungo"?1:.4;t.push(inj)}v=Math.min(1,v);sw+=y.mR;sv+=y.mR*v;if(v>=.45)blw.push(y.n.split(" ").slice(-1)[0]+" ("+t.join(", ")+")")});
  x.fPath=sw?sv/sw:.5;x.blw=blw;
  x.fAge=e==null?0:e<=21?1:e<=23?.7:e<=25?.3:e>=29?-.6:0;if(ex===1||ex===2)x.fAge+=.3;
  const co=ctx.coach&&ctx.coach(x.tm,x.r);x.fCoach=co?co.v:0;x.fTeam=x.win<.35?1:x.win<.45?.5:0;
  x.score=W.P*x.fP+W.Stk*x.fStk+W.Use*x.fUse+W.Room*x.fRoom+W.Trend*x.fTrend+W.Path*x.fPath+W.Age*x.fAge+W.Coach*x.fCoach+W.Team*x.fTeam;
  /* il perché */
  if(x.fP>.4)why.push(`${x.p36.toFixed(1).replace(".",",")} PDK ogni 36' (mediana ${({G:"guardie",F:"ali",C:"centri"})[x.r]} ${med[x.r].toFixed(1).replace(".",",")})`);
  if(x.fStk>.5)why.push(`${x.stk36.toFixed(1).replace(".",",")} rubate+stoppate ogni 36'`);if(x.fUse>.6)why.push("tira tanto quando è in campo");
  if(x.fTrend>.4)why.push(`minuti in salita (+${x.dMin.toFixed(1).replace(".",",")}')`);if(blw.length)why.push("davanti: "+blw.slice(0,2).join(", "));
  if(e!=null&&e<=23)why.push(e+" anni");if(ex===1||ex===2)why.push((ex+1)+"° anno NBA");if(co&&co.why)why.push(co.why);if(x.fTeam>=1)why.push("squadra in fondo: spazio ai giovani");
  x.why=why}
 L.med=med;return L}
/* esito dopo cut: minuti e PDK per partita giocata dopo la data (almeno 3 gare) contro le ultime 10 prima */
function radarEsito(TV,cut,L,ctx,to){const mins=m=>{const a=String(m||"0").split(":");return(+a[0]||0)+(+a[1]||0)/60};const A={};
 for(const d of Object.keys(TV.days).sort()){if(d<cut||(to&&d>=to))continue;for(const g of TV.days[d]||[]){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;for(const sd of["a","h"])(B[sd]||[]).forEach(r=>{const k=ctx.nz(r[0]),m=mins(r[2]);if(m<=0)return;const a=A[k]=A[k]||{n:0,m:0,p:0};a.n++;a.m+=m;a.p+=+r[19]||0})}}
 L.forEach(x=>{const a=A[x.k];x.out=a&&a.n>=3?{n:a.n,dm:a.m/a.n-x.mR,dp:a.p/a.n-x.pR}:null;x.boom=!!(x.out&&x.out.dm>=6&&x.out.dp>=6)});return L}

/* pesi tarati sulla prova dei dati passati (5 date dal 31/10 al 12/11, esito nei 10 giorni dopo): top 20 esplosi 18% contro 8-9% di media;
   con la data di prova lasciata fuori dalla taratura 13%. L'età e lo spazio per crescere contano più di tutto. */
const RW={P:1.2,Stk:1,Use:1,Room:2.5,Trend:2,Path:1.5,Age:1.8,Team:.5,Coach:.5};
const injMap=()=>{const m={};try{(INFLIVE.injuries||[]).forEach(t=>(t.injuries||[]).forEach(i=>{const st=String(i.status||"");if(/out/i.test(st)){const lg=/week|month|surgery|season|indefinitely|re-evaluated/i.test(i.shortComment||"");m[nz(i.athlete.displayName)]=lg?"fuori a lungo":"infortunato"}}))}catch(e){}return m};
function rctx(live){const IM=live?injMap():null,C=coachStats();return{nz,ruolo,eta:etaDi,exp:n=>{const r=lookup(G()&&G().ruoli,n);return r?r.exp:null},contr,
 inj:IM?n=>IM[nz(n)]||null:null,
 coach:(tm,r)=>{const o=C&&C.R[tm];if(!o)return null;let v=0;const w=[];const dy=(o.s.yg||0)-(C.lg.yg||0);if(dy>.05){v+=Math.min(1,dy*6);w.push("coach che dà spazio ai giovani")}if(o.fav===r){v+=.4;w.push("coach che favorisce il suo reparto")}if(o.s.rot<=C.lg.rot-.6)v+=.2;return{v,why:w.join(" · ")}}}}
const oggi=()=>{const d=new Date();return d.toISOString().slice(0,10)};
let RCACHE=null;
function radarLive(){const B=build();if(!B)return[];if(RCACHE&&RCACHE.key===B.key)return RCACHE.L;const d=new Date(Date.now()+864e5).toISOString().slice(0,10);
 const L=radarAt(TV,d,RW,rctx(true)).filter(x=>x.mR<=26).sort((a,b)=>b.score-a.score);RCACHE={key:B.key,L};salvaRadar(L);return L}
/* lunedì della settimana (YYYY-MM-DD) */
const lun=d=>{const t=new Date(d+"T12:00:00Z"),w=(t.getUTCDay()+6)%7;t.setUTCDate(t.getUTCDate()-w);return t.toISOString().slice(0,10)};
function salvaRadar(L){try{const H=JSON.parse(localStorage.getItem("gm_radar_hist")||"[]"),m=lun(oggi());if(H.some(h=>h.d===m))return;H.push({d:m,L:L.slice(0,20).map(x=>({k:x.k,n:x.n,mR:+x.mR.toFixed(1),pR:+x.pR.toFixed(1)}))});localStorage.setItem("gm_radar_hist",JSON.stringify(H.slice(-30)))}catch(e){}}
let BTC=null;
function prova(){const B=build();if(BTC&&BTC.key===B.key)return BTC.R;const R=[],ctx=rctx(false),days=Object.keys(TV.days).filter(d=>TV.days[d].some(g=>g[5]!=="S")).sort(),last=days[days.length-1];
 for(let m=lun(days[0]);;){const t=new Date(m+"T12:00:00Z");t.setUTCDate(t.getUTCDate()+7);m=t.toISOString().slice(0,10);if(m>last)break;
  const to=new Date(Date.parse(m)+14*864e5).toISOString().slice(0,10);let L=radarAt(TV,m,RW,ctx).filter(x=>x.mR<=26);radarEsito(TV,m,L,ctx,to);L=L.filter(x=>x.out);if(L.length<30)continue;
  const top=L.slice().sort((a,b)=>b.score-a.score).slice(0,20);R.push({d:m,hit:top.filter(x=>x.boom),n:top.length,base:L.filter(x=>x.boom).length/L.length,fin:to>last})}
 BTC={key:B.key,R};return R}
function vRadar(){const L=filtra(radarLive()).slice(0,40),R=prova();let H=[];try{H=JSON.parse(localStorage.getItem("gm_radar_hist")||"[]")}catch(e){}
 const gd=d=>d.slice(8)+"/"+d.slice(5,7);
 const tot=R.reduce((a,r)=>a+r.hit.length,0),nn=R.reduce((a,r)=>a+r.n,0),bs=R.length?R.reduce((a,r)=>a+r.base,0)/R.length:0;
 const salv=H.filter(h=>h.d<lun(oggi())).map(h=>{const LL=h.L.map(x=>Object.assign({},x));radarEsito(TV,h.d,LL,{nz});return{d:h.d,hit:LL.filter(x=>x.boom),n:LL.filter(x=>x.out).length}});
 return`<p class="gmnote">Chi può esplodere <b>prima</b> che succeda: produce tanto per minuto ma gioca ancora poco, ha la strada libera (chi gli sta davanti è vecchio, in scadenza o infortunato), è giovane o al 2°-3° anno, ha un allenatore che fa giocare i giovani, la squadra perde. Solo chi gioca 26 minuti o meno.</p>
 ${L.map((x,i)=>`<div role="button" tabindex="0" class="gmrw" data-gmpl="${E(x.n)}"><b class="gmk">${i+1}</b><span class="gxn"><b>${E(x.n)}</b><small>${x.tm} · ${RN[x.r]}${etaDi(x.n)?" · "+etaDi(x.n)+" anni":""} · ${tag(x)}${ctxt(x.n)?" · "+ctxt(x.n):""}</small><em class="gmper">${E(x.why.slice(0,4).join(" · "))}</em></span><span class="gmv"><b class="gmrs">${Math.round(x.score*10)}</b><small>radar</small></span><span class="gmv"><b>${f1(x.mR)}'</b><small>${f1(x.p36s)} /36'</small></span></div>`).join("")}
 <div class="gmrep">🎯 Quanto ci prende</div>
 <p class="gmnote">Il radar rifatto ogni lunedì con i soli dati di allora, e controllato nelle 2 settimane dopo. Esploso = almeno +6 minuti e +6 PDK a partita. Finora <b>${tot} su ${nn}</b> (${nn?Math.round(tot/nn*100):0}%) contro il ${Math.round(bs*100)}% di chi non era segnalato.</p>
 ${R.map(r=>`<div class="gmpe gmbt"><b>${gd(r.d)}</b><span>${r.hit.length?r.hit.map(x=>E(x.n)).join(", "):"nessuno"}${r.fin?" · ancora in corso":""}</span><em>${r.hit.length}/${r.n}</em></div>`).join("")}
 ${salv.length?`<div class="gmrep">📒 Previsioni salvate</div><p class="gmnote">La top 20 salvata davvero quel lunedì, con i pesi di allora.</p>${salv.map(r=>`<div class="gmpe gmbt"><b>${gd(r.d)}</b><span>${r.hit.length?r.hit.map(x=>E(x.n)).join(", "):r.n?"nessuno per ora":"da valutare"}</span><em>${r.hit.length}/${r.n||"—"}</em></div>`).join("")}`:`<p class="gmnote small">Ogni lunedì l'app salva la top 20 del radar: tra qualche settimana qui vedi le previsioni vere e quante ne ha prese.</p>`}`}
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
 ${S.tab==="radar"?vRadar():S.tab==="cresc"?vClass(B):S.tab==="inv"?vInvest(B):S.tab==="risk"?vRischio(B):S.tab==="sq"?vSquadra(B):S.tab==="coach"?vCoach():vCap()}</div>`};
document.addEventListener("click",e=>{if(typeof cur==="undefined"||cur!=="gmas")return;const t=e.target,k=t.closest("[data-gmtab],[data-gmr],[data-gmso],[data-gmtm],[data-gmpl],[data-gmback],[data-gmtmgo],[data-gmco],[data-gmeta]");if(!k)return;e.preventDefault();const d=k.dataset;let top=false;
 if(d.gmtab){S.tab=d.gmtab;S.pl=null}else if(d.gmr!=null)S.ruolo=d.gmr;else if(d.gmso)S.solo=d.gmso;else if(d.gmtm)S.tm=d.gmtm;else if(d.gmtmgo){S.tab="sq";S.tm=d.gmtmgo;top=true}else if(d.gmpl){S.pl=d.gmpl;top=true}else if(d.gmback){S.pl=null;top=true}else if(d.gmco){S.cord=d.gmco}else if(d.gmeta){S.eta=d.gmeta}
 const y=scrollY;render();scrollTo(0,top?0:y)});
document.addEventListener("input",e=>{const r=e.target.closest&&e.target.closest("[data-gmeta-r]");if(!r)return;const l=r.parentNode.querySelector(".gmel");if(l)l.textContent=S.eta==="o27"?`${r.value} anni in su`:`${r.value} anni`});
document.addEventListener("change",e=>{const r=e.target.closest&&e.target.closest("[data-gmeta-r]");if(!r)return;S.etaN=+r.value;try{localStorage.setItem("gm_eta",S.etaN)}catch(x){}const y=scrollY;render();scrollTo(0,y)});
try{const v=+localStorage.getItem("gm_eta");if(v>=19&&v<=38)S.etaN=v}catch(e){}
try{VIEWS.gmas=window.vGmas}catch(e){}
})();
