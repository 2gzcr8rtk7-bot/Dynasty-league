/* (1259) LABORATORIO MAGLIE · interfaccia (area riservata Ducks › Laboratorio maglie). Caricato solo quando si apre la sezione.
   Anteprima grande: tocchi un elemento per sceglierlo, lo trascini col dito, con due dita lo ingrandisci e lo ruoti.
   Schede: Basi · Colori · Bordi · Fantasia · Elementi · Scritte · Salva. Le maglie restano su questo telefono (dl_lab)
   e si esportano come prompt unico per Claude, che le rende ufficiali. */
(function(){
const L=window.LAB;const KS="dl_lab";
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let SAVED=[];try{SAVED=JSON.parse(localStorage.getItem(KS)||"[]")||[]}catch(e){SAVED=[]}
const saveAll=()=>{try{localStorage.setItem(KS,JSON.stringify(SAVED))}catch(e){alert("Memoria del telefono piena: elimina qualche maglia salvata.")}};
let S={d:null,name:"",id:null,tab:"basi",sel:-1,num:1,hist:[],fut:[],bt:"DUC",eg:"Texas"};
try{const j=JSON.parse(localStorage.getItem("dl_lab_cur")||"null");if(j&&j.d)Object.assign(S,{d:j.d,name:j.name||"",id:j.id||null,num:j.num||1})}catch(e){}
if(!S.d)S.d=clone(L.BASI[3][1]);
const keep=()=>{try{localStorage.setItem("dl_lab_cur",JSON.stringify({d:S.d,name:S.name,id:S.id,num:S.num}))}catch(e){}};
const push=()=>{S.hist.push(JSON.stringify(S.d));if(S.hist.length>60)S.hist.shift();S.fut=[]};
const SW=[["#facc15","Giallo Ducks"],["#fde047","Giallo chiaro"],["#eab308","Giallo scuro"],["#ca8a04","Oro"],["#111111","Nero"],["#000000","Nero pieno"],["#ffffff","Bianco"],["#f1f5f9","Ghiaccio"],["#c0c4cc","Silver"],["#71717a","Grigio"],["#3f3f46","Antracite"],["#1e3a8a","Blu Texas"],["#38bdf8","Azzurro"],["#b91c1c","Rosso Texas"],["#f97316","Arancio"],["#7c2d12","Cuoio"],["#92400e","Marrone"],["#d6c08a","Sabbia"],["#fef3c7","Crema"],["#15803d","Verde cactus"],["#7c3aed","Viola"],["#ec4899","Rosa"]];
/* lettura e scrittura per «percorso» (es. "tr.a", "bg.1", "el.b") */
function getP(p){const d=S.d;if(p.startsWith("el.")){const e=d.els[S.sel];return e?e[p.slice(3)]:null}const [a,b]=p.split(".");if(b==null)return d[a];return d[a]?d[a][b]:null}
function setP(p,v){const d=S.d;if(p.startsWith("el.")){const e=d.els[S.sel];if(e)e[p.slice(3)]=v;return}const [a,b]=p.split(".");if(b==null){d[a]=v;return}if(a==="bg"){d.bg=d.bg||[];d.bg[+b]=v;return}d[a]=d[a]||{};d[a][b]=v}
const sw=(p,lab)=>{const v=getP(p);return`<div class="lbrow"><b>${lab}</b><div class="lbsw">${SW.map(([c,n])=>`<button data-lsw="${p}" data-c="${c}" title="${n}" style="background:${c}"${v===c?' class="on"':""}></button>`).join("")}<label class="lbcus" title="Altro colore"><input type="color" data-lcol="${p}" value="${/^#[0-9a-f]{6}$/i.test(v||"")?v:"#ffffff"}">🎨</label></div></div>`};
const sl=(p,lab,min,max,step,v,unit="")=>`<div class="lbrow"><b>${lab}</b><div class="lbsl"><input type="range" data-lsl="${p}" min="${min}" max="${max}" step="${step}" value="${v}"><span>${unit==="%"?Math.round(v*100)+"%":Math.round(v*10)/10+unit}</span></div></div>`;
const chips=(p,opts,v)=>`<div class="lbchips">${opts.map(([k,n])=>`<button data-lch="${p}" data-v="${esc(k)}"${String(v)===String(k)?' class="on"':""}>${n}</button>`).join("")}</div>`;
const mini=(d,n)=>L.labSvg(d,n==null?S.num:n);
/* ===== anteprima ===== */
function prev(){const b=document.getElementById("lbprev");if(!b)return;b.innerHTML=L.labSvg(S.d,S.num,{attr:' id="lbsvg"'});selBox();keep()}
function selBox(){const o=document.getElementById("lbsel"),b=document.getElementById("lbprev");if(!o||!b)return;const g=b.querySelector(`[data-li="${S.sel}"]`);if(!g){o.style.display="none";return}
 const r=g.getBoundingClientRect(),q=b.getBoundingClientRect();Object.assign(o.style,{display:"block",left:(r.left-q.left-4)+"px",top:(r.top-q.top-4)+"px",width:(r.width+8)+"px",height:(r.height+8)+"px"})}
/* ===== schede ===== */
function elPanel(){const e=S.d.els[S.sel];if(!e)return"";const D=L.EL[e.k]||{n:e.k};
 return`<section class="lbcard lbelp"><div class="lbhd"><b>✋ ${esc(D.n)}</b><button data-lact="desel">Fatto</button></div>
 ${e.k==="testo"?`<div class="lbrow"><b>Testo</b><input class="lbin" data-ltx="el.txt" value="${esc(e.txt||"TEXAS")}" maxlength="18"></div><div class="lbrow"><b>Carattere</b>${chips("el.font",[["sport","Sport"],["western","Western"],["college","College"],["classica","Classica"],["block","Block"]],e.font||"sport")}</div>`:""}
 ${sl("el.s","Grandezza",.2,4,.02,e.s||1,"×")}${sl("el.r","Rotazione",-180,180,1,e.r||0,"°")}${sl("el.o","Trasparenza",.05,1,.01,e.o==null?1:e.o,"%")}
 ${sw("el.a","Colore 1")}${sw("el.b","Colore 2")}
 <div class="lbbtns"><button data-lact="fx">↔ Specchia</button><button data-lact="fy">↕ Capovolgi</button><button data-lact="top">${e.top?"⬇ Sotto le scritte":"⬆ Sopra le scritte"}</button>
 <button data-lact="fwd">Avanti</button><button data-lact="back">Indietro</button><button data-lact="cx">⊕ Al centro</button><button data-lact="dup">⧉ Duplica</button><button data-lact="del" class="lbdel">🗑 Elimina</button></div>
 <p class="lbnote">Trascina l'elemento sulla maglia con il dito · con due dita lo ingrandisci e lo ruoti.</p></section>`}
function tabBasi(){const own=window.PREMI?(()=>{const t=S.bt;let L2=[];try{L2=PREMI.items(t).map(x=>[x.code,x.name])}catch(e){}if(t==="DUC")L2=[[115,"Stella gialla"],[116,"Stella nera"],[117,"Stella bianca"]].concat(L2.filter(x=>x[0]<115||x[0]>117));return L2})():[];
 const teams=typeof TEAMS!=="undefined"?Object.keys(TEAMS):["DUC"];
 return`<section class="lbcard"><h4>Basi modificabili</h4><p class="lbnote">Ogni parte si cambia: colori, bordi, fantasia, elementi e scritte.</p><div class="lbgrid">${L.BASI.map(([n,d],i)=>`<button class="lbth" data-lbase="${i}">${mini(d)}<small>${esc(n)}</small></button>`).join("")}</div></section>
 <section class="lbcard"><h4>Maglie che abbiamo già</h4><p class="lbnote">Si parte dall'immagine della maglia: ci aggiungi sopra elementi e scritte.</p>
 <div class="lbrow"><b>Squadra</b><select class="lbin" data-lbt>${teams.map(t=>`<option value="${t}"${t===S.bt?" selected":""}>${esc((TEAMS[t]&&TEAMS[t].nick)||t)}</option>`).join("")}</select></div>
 <div class="lbgrid">${own.map(([c,n])=>{let s="";try{s=PREMI.svg(S.bt,c,S.num)||""}catch(e){}return s?`<button class="lbth" data-limg="${c}">${s}<small>${esc(n)}</small></button>`:""}).join("")}</div></section>`}
function tabColori(){const d=S.d;if(d.img)return`<section class="lbcard"><p class="lbnote">Questa maglia parte da un'immagine: i colori della base non si cambiano. Aggiungi elementi o scegli una base modificabile in «Basi».</p><button class="lbbig" data-lact="unimg">Trasforma in base modificabile vuota</button></section>`;
 const T=[["Gialla Ducks",["#fde047","#facc15","#eab308"],"#111111","#ffffff","#111111","#ffffff"],["Nera",["#000000","#0b0b0b","#1c1c1c"],"#facc15","#111111","#facc15","#111111"],["Bianca",["#ffffff","#f8fafc","#f1f5f9"],"#111111","#facc15","#111111","#facc15"],["Silver",["#e5e7eb","#c0c4cc","#9ca3af"],"#111111","#facc15","#111111","#ffffff"],["Oro",["#fde68a","#ca8a04","#854d0e"],"#111111","#fde68a","#111111","#fde68a"],["Texas",["#ffffff","#f1f5f9","#e2e8f0"],"#1e3a8a","#b91c1c","#1e3a8a","#ffffff"],["Deserto",["#fde68a","#fbbf24","#d97706"],"#7c2d12","#fef3c7","#7c2d12","#fef3c7"],["Notte",["#0b1026","#1e1b4b","#312e81"],"#facc15","#ffffff","#facc15","#111111"]];
 return`<section class="lbcard"><h4>Temi veloci</h4><div class="lbchips">${T.map((t,i)=>`<button data-lthm="${i}"><i style="background:linear-gradient(${t[1].join(",")})"></i>${t[0]}</button>`).join("")}</div></section>
 <section class="lbcard"><h4>Colore della maglia</h4>${chips("gd",[["v","⬇ Verticale"],["h","➡ Orizzontale"],["d","↘ Diagonale"],["r","◉ Dal centro"],["u","▮ Tinta unita"]],d.bg&&d.bg.length===1?"u":(d.gd||"v"))}
 ${sw("bg.0",d.bg.length===1?"Colore":"In alto")}${d.bg.length>1?sw("bg.1","Al centro")+sw("bg.2","In basso"):""}${sl("sh","Ombre e tessuto",0,1,.05,d.sh==null?1:d.sh,"%")}</section>`}
function tabBordi(){const tr=S.d.tr||{};return`<section class="lbcard"><h4>Stile di collo e spalline</h4><div class="lbgrid lbg4">${Object.entries(L.TR).map(([k,t])=>{const x=clone(S.d);x.tr={...tr,k};x.els=[];x.w={on:false};x.nm={on:false};delete x.img;return`<button class="lbth${(tr.k||"classico")===k?" on":""}" data-lch="tr.k" data-v="${k}">${mini(x)}<small>${t.n}</small></button>`}).join("")}</div>
 ${sw("tr.a","Colore bordo")}${sw("tr.b","Colore filetto")}</section>`}
function tabFant(){const p=S.d.pat||{k:"nessuna"};return`<section class="lbcard"><h4>Fantasia su tutta la maglia</h4><div class="lbgrid lbg4">${Object.entries(L.PAT).map(([k,t])=>{const x=clone(S.d);x.pat={c:"#111111",c2:"#ffffff",o:.45,...p,k};x.els=[];x.w={on:false};x.nm={on:false};delete x.img;return`<button class="lbth${p.k===k?" on":""}" data-lpat="${k}">${mini(x)}<small>${t.n}</small></button>`}).join("")}</div>
 ${p.k!=="nessuna"?sw("pat.c","Colore")+sw("pat.c2","Secondo colore")+sl("pat.o","Intensità",.03,1,.01,p.o==null?.35:p.o,"%"):""}</section>`}
function tabEl(){const G=[...new Set(Object.values(L.EL).map(e=>e.g))];
 return`<section class="lbcard"><h4>Aggiungi un elemento</h4>${chips("eg",G.map(g=>[g,g]),S.eg)}<div class="lbgrid lbg5">${Object.entries(L.EL).filter(([k,e])=>e.g===S.eg).map(([k,e])=>`<button class="lbth lbic" data-ladd="${k}"><svg viewBox="-26 -26 52 52">${e.d("#111111","#ffffff",{})}</svg><small>${e.n}</small></button>`).join("")}</div></section>
 <section class="lbcard"><h4>Elementi sulla maglia (${S.d.els.length})</h4>${S.d.els.length?`<div class="lbchips">${S.d.els.map((e,i)=>`<button data-lpick="${i}"${i===S.sel?' class="on"':""}>${esc((L.EL[e.k]||{n:e.k}).n)}${e.k==="testo"?" «"+esc(e.txt||"")+"»":""}</button>`).join("")}</div>`:`<p class="lbnote">Nessuno: tocca un elemento qui sopra per aggiungerlo.</p>`}</section>`}
function tabScritte(){const w=S.d.w||{},n=S.d.nm||{};const F=[["sport","Sport"],["western","Western"],["college","College"],["classica","Classica"],["block","Block"]];
 return`<section class="lbcard"><div class="lbhd"><h4>Scritta sul petto</h4><button data-ltog="w.on" class="${w.on===false?"":"on"}">${w.on===false?"Spenta":"Accesa"}</button></div>
 <div class="lbrow"><b>Testo</b><input class="lbin" data-ltx="w.txt" value="${esc(w.txt==null?"TEXAS":w.txt)}" maxlength="14"></div>
 <div class="lbrow"><b>Forma</b>${chips("w.arc",[["","Dritta"],["1","Ad arco"]],w.arc?"1":"")}</div><div class="lbrow"><b>Carattere</b>${chips("w.font",F,w.font||"sport")}</div>
 ${sl("w.s","Grandezza",8,30,.5,w.s||17)}${sl("w.y","Altezza",30,90,.5,w.y==null?58:w.y)}${sw("w.c","Colore")}${sw("w.st","Contorno")}${sl("w.sw","Contorno spessore",0,6,.1,w.sw==null?2.6:w.sw)}</section>
 <section class="lbcard"><div class="lbhd"><h4>Numero</h4><button data-ltog="nm.on" class="${n.on===false?"":"on"}">${n.on===false?"Spento":"Acceso"}</button></div>
 <div class="lbrow"><b>Prova numero</b><input class="lbin" data-lnum type="number" min="0" max="99" value="${S.num}"></div><div class="lbrow"><b>Carattere</b>${chips("nm.font",F,n.font||"sport")}</div>
 ${sl("nm.s","Grandezza",20,70,.5,n.s||44)}${sl("nm.y","Altezza",70,130,.5,n.y==null?102:n.y)}${sw("nm.c","Colore")}${sw("nm.st","Contorno")}${sl("nm.sw","Contorno spessore",0,7,.1,n.sw==null?3.4:n.sw)}</section>`}
function descr(m){const d=m.d,b=[];b.push(d.img?`base: immagine della maglia esistente ${d.img.t} codice ${d.img.code}`:`colore maglia ${d.bg.join(" → ")} (${{v:"verticale",h:"orizzontale",d:"diagonale",r:"dal centro"}[d.gd||"v"]||"tinta unita"})`);
 if(!d.img){b.push(`bordo «${(L.TR[(d.tr||{}).k||"classico"]||{}).n}» ${(d.tr||{}).a||""}/${(d.tr||{}).b||""}`);if(d.pat&&d.pat.k!=="nessuna")b.push(`fantasia «${L.PAT[d.pat.k].n}» ${d.pat.c} ${Math.round((d.pat.o||.35)*100)}%`);
  b.push(d.w&&d.w.on===false?"senza scritta":`scritta «${(d.w||{}).txt==null?"TEXAS":d.w.txt}»`);b.push(d.nm&&d.nm.on===false?"senza numero":"numero del giocatore")}
 if(d.els.length)b.push("elementi: "+d.els.map(e=>(L.EL[e.k]||{n:e.k}).n+(e.k==="testo"?` «${e.txt}»`:"")).join(", "));return b.join("; ")}
function prompt(list){if(!list.length)return"";return"Ciao Claude, nel Laboratorio maglie dell'app Dreamers (area riservata Ducks) ho disegnato "+(list.length>1?list.length+" maglie":"questa maglia")+". "+(list.length>1?"Aggiungile":"Aggiungila")+" alle maglie dei Ducks nel tasto maglia, uguali a come le vedo nel laboratorio (stesso disegno di labcore.js):\n\n"+
 list.map((m,i)=>`${i+1}. «${m.name||"Senza nome"}» — ${descr(m)}`).join("\n")+"\n\nDati del laboratorio (non modificare):\n"+JSON.stringify(list.map(m=>({nome:m.name,d:m.d})))}
function tabSalva(){return`<section class="lbcard"><h4>Salva questa maglia</h4><div class="lbrow"><b>Nome</b><input class="lbin" data-lname value="${esc(S.name)}" placeholder="es. Stella del deserto" maxlength="30"></div>
 <div class="lbbtns"><button class="lbbig" data-lact="save">💾 ${S.id?"Salva le modifiche":"Salva"}</button>${S.id?`<button data-lact="saveas">⧉ Salva come nuova</button>`:""}<button data-lact="new">＋ Nuova (vuota gialla)</button></div></section>
 <section class="lbcard"><h4>Le mie maglie (${SAVED.length})</h4>${SAVED.length?`<div class="lbgrid">${SAVED.map((m,i)=>`<div class="lbth${m.id===S.id?" on":""}">${mini(m.d)}<small>${esc(m.name||"Senza nome")}</small><div class="lbmb"><button data-lopen="${i}">Apri</button><button data-lrm="${i}">✕</button></div></div>`).join("")}</div>`:`<p class="lbnote">Ancora nessuna.</p>`}</section>
 <section class="lbcard"><h4>Prompt per Claude</h4><p class="lbnote">Un unico messaggio con ${SAVED.length>1?"tutte le "+SAVED.length+" maglie salvate":"le maglie salvate"}: copialo e incollalo in chat.</p><textarea id="lbout" readonly>${esc(prompt(SAVED))}</textarea>
 <div class="lbbtns"><button class="lbbig" data-lact="copy"${SAVED.length?"":" disabled"}>📋 Copia prompt</button></div></section>`}
const TABS=[["basi","Basi"],["colori","Colori"],["bordi","Bordi"],["fant","Fantasia"],["el","Elementi"],["scritte","Scritte"],["salva","Salva"]];
function panel(){const p=document.getElementById("lbpan");if(!p)return;const f={basi:tabBasi,colori:tabColori,bordi:tabBordi,fant:tabFant,el:tabEl,scritte:tabScritte,salva:tabSalva}[S.tab];
 p.innerHTML=(S.sel>=0?elPanel():"")+f();document.querySelectorAll("[data-ltab]").forEach(b=>b.classList.toggle("on",b.dataset.ltab===S.tab))}
function full(){prev();panel();const u=document.querySelector("[data-lact=undo]"),r=document.querySelector("[data-lact=redo]");if(u)u.disabled=!S.hist.length;if(r)r.disabled=!S.fut.length;const t=document.getElementById("lbtit");if(t)t.textContent=S.name||"Nuova maglia"}
window.vLab=function(){return`<div class="hof lab"><button class="gback" id="hofback">‹ Hall of Fame Ducks</button>
 <div class="hofhd"><div style="grid-column:1/3"><small>Texas Ducks · area riservata del GM</small><b>Laboratorio maglie</b><em>Disegna, modifica, prova e manda a Claude</em></div></div>
 <div class="lbstage"><div class="lbtop"><b id="lbtit">${esc(S.name||"Nuova maglia")}</b><span><button data-lact="undo">↶</button><button data-lact="redo">↷</button></span></div>
 <div id="lbprev"></div><div id="lbsel"></div>
 <div class="lbbtns lbsb"><button data-lact="prova">👕 Prova sul campo</button><button data-ltab="salva" class="lbsv">💾 Salva</button></div></div>
 <div class="lbtabs">${TABS.map(([k,n])=>`<button data-ltab="${k}">${n}</button>`).join("")}</div><div id="lbpan"></div></div>`};
VIEWS.lab=window.vLab;
/* dopo ogni disegno della pagina riempio anteprima e schede */
const R0=render;render=function(){const x=R0.apply(this,arguments);if(cur==="lab")requestAnimationFrame(full);if(window.LABP&&cur!=="campo"&&cur!=="lab")window.LABP=null;
 if(window.LABP&&cur==="campo"){const m=document.getElementById("main");if(m&&!m.querySelector(".lbpbar")){const b=document.createElement("div");b.className="lbpbar";b.innerHTML=`<span>👕 Prova: ${esc(S.name||"maglia del laboratorio")}</span><button data-lbpx="1">‹ Torna al laboratorio</button>`;m.prepend(b)}}return x};
/* maglia del laboratorio sul campo durante la prova */
const J0=window.jersey;window.jersey=function(t,num,name){if(window.LABP&&t===LABP.t&&cur==="campo")return L.labSvg(LABP.d,num);return J0.apply(this,arguments)};
function upd(){prev();const u=document.querySelector("[data-lact=undo]");if(u)u.disabled=!S.hist.length}
function addEl(k){push();const tr=S.d.tr||{};const e={k,x:60,y:80,s:k==="fascia"||k==="filo"?1:1.2,r:0,a:tr.a||"#111111",b:tr.b||"#ffffff"};if(k==="testo"){e.txt="TEXAS";e.s=1.4;e.a=(S.d.w||{}).c||"#111111";e.b=(S.d.w||{}).st||"#ffffff"}if(k==="bandiera"){e.a="#1e3a8a";e.b="#b91c1c"}if(k==="bluebonnet"){e.a="#2563eb";e.b="#15803d"}if(k==="cactus"){e.a="#15803d";e.b="#bbf7d0"}
 S.d.els.push(e);S.sel=S.d.els.length-1;full();document.getElementById("lbprev").scrollIntoView({block:"nearest"})}
document.addEventListener("click",e=>{if(cur!=="lab"&&!e.target.closest("[data-lbpx]"))return;const t=e.target;let b;
 if((b=t.closest("[data-lbpx]"))){e.preventDefault();e.stopImmediatePropagation();window.LABP=null;cur="lab";render();scrollTo(0,0);return}
 if((b=t.closest("[data-ltab]"))){S.tab=b.dataset.ltab;panel();if(b.classList.contains("lbsv"))document.getElementById("lbpan").scrollIntoView({behavior:"smooth"});return}
 if((b=t.closest("[data-lbase]"))){push();S.d=clone(L.BASI[+b.dataset.lbase][1]);S.sel=-1;S.id=null;S.name="";full();scrollTo({top:0,behavior:"smooth"});return}
 if((b=t.closest("[data-limg]"))){push();S.d={bg:["#facc15"],els:[],img:{t:S.bt,code:+b.dataset.limg},w:{on:false},nm:{on:false}};S.sel=-1;S.id=null;S.name="";S.tab="el";full();scrollTo({top:0,behavior:"smooth"});return}
 if((b=t.closest("[data-lsw]"))){push();setP(b.dataset.lsw,b.dataset.c);full();return}
 if((b=t.closest("[data-lch]"))){push();let v=b.dataset.v,p=b.dataset.lch;if(p==="eg"){S.eg=v;S.hist.pop();panel();return}
  if(p==="gd"){if(v==="u"){S.d.bg=[S.d.bg[1]||S.d.bg[0]]}else{if(S.d.bg.length===1)S.d.bg=[S.d.bg[0],S.d.bg[0],S.d.bg[0]];S.d.gd=v}}else if(p==="w.arc")setP(p,!!v);else setP(p,v);full();return}
 if((b=t.closest("[data-lpat]"))){push();S.d.pat={c:"#111111",c2:"#ffffff",o:.35,...(S.d.pat||{}),k:b.dataset.lpat};full();return}
 if((b=t.closest("[data-lthm]"))){push();const T=[["#fde047","#facc15","#eab308","#111111","#ffffff","#111111","#ffffff"],["#000000","#0b0b0b","#1c1c1c","#facc15","#111111","#facc15","#111111"],["#ffffff","#f8fafc","#f1f5f9","#111111","#facc15","#111111","#facc15"],["#e5e7eb","#c0c4cc","#9ca3af","#111111","#facc15","#111111","#ffffff"],["#fde68a","#ca8a04","#854d0e","#111111","#fde68a","#111111","#fde68a"],["#ffffff","#f1f5f9","#e2e8f0","#1e3a8a","#b91c1c","#1e3a8a","#ffffff"],["#fde68a","#fbbf24","#d97706","#7c2d12","#fef3c7","#7c2d12","#fef3c7"],["#0b1026","#1e1b4b","#312e81","#facc15","#ffffff","#facc15","#111111"]][+b.dataset.lthm];
  const d=S.d;d.bg=T.slice(0,3);d.tr={...(d.tr||{}),a:T[3],b:T[4]};d.w={...(d.w||{}),c:T[5],st:T[6]};d.nm={...(d.nm||{}),c:T[5],st:T[6]};full();return}
 if((b=t.closest("[data-ltog]"))){push();const p=b.dataset.ltog;setP(p,getP(p)===false?true:false);full();return}
 if((b=t.closest("[data-ladd]"))){addEl(b.dataset.ladd);return}
 if((b=t.closest("[data-lpick]"))){S.sel=+b.dataset.lpick;full();document.getElementById("lbprev").scrollIntoView({block:"nearest"});return}
 if((b=t.closest("[data-lopen]"))){const m=SAVED[+b.dataset.lopen];if(m){push();S.d=clone(m.d);S.name=m.name;S.id=m.id;S.sel=-1;full();scrollTo({top:0,behavior:"smooth"})}return}
 if((b=t.closest("[data-lrm]"))){const i=+b.dataset.lrm;if(!b.dataset.ok){b.dataset.ok=1;b.textContent="Sicuro?";return}if(SAVED[i]&&SAVED[i].id===S.id)S.id=null;SAVED.splice(i,1);saveAll();panel();return}
 if((b=t.closest("[data-lact]"))){const a=b.dataset.lact,d=S.d,el=d.els[S.sel];
  if(a==="undo"){if(!S.hist.length)return;S.fut.push(JSON.stringify(d));S.d=JSON.parse(S.hist.pop());if(S.sel>=S.d.els.length)S.sel=-1;full();return}
  if(a==="redo"){if(!S.fut.length)return;S.hist.push(JSON.stringify(d));S.d=JSON.parse(S.fut.pop());full();return}
  if(a==="desel"){S.sel=-1;full();return}
  if(a==="prova"){window.LABP={t:"DUC",d:clone(d)};curTeam="DUC";cur="campo";render();scrollTo(0,0);setTimeout(()=>{try{const c=document.querySelector("main .court");if(c)c.scrollIntoView({block:"center"})}catch(_){}},300);return}
  if(a==="save"||a==="saveas"){const nm=(document.querySelector("[data-lname]")||{}).value;S.name=(nm||"").trim()||S.name||"Maglia "+(SAVED.length+1);const i=a==="save"&&S.id?SAVED.findIndex(m=>m.id===S.id):-1;
   if(i>=0)SAVED[i]={...SAVED[i],name:S.name,d:clone(d)};else{S.id="m"+Date.now().toString(36);SAVED.push({id:S.id,name:S.name,d:clone(d)})}saveAll();full();b.textContent="✔ Salvata";return}
  if(a==="new"){push();S.d=clone(L.BASI[0][1]);S.sel=-1;S.id=null;S.name="";full();return}
  if(a==="copy"){const x=document.getElementById("lbout");x.select();try{navigator.clipboard.writeText(x.value)}catch(_){try{document.execCommand("copy")}catch(__){}}b.textContent="✔ Copiato";return}
  if(a==="unimg"){push();S.d=clone(L.BASI[0][1]);S.d.els=d.els;full();return}
  if(!el)return;push();
  if(a==="fx")el.fx=!el.fx;else if(a==="fy")el.fy=!el.fy;else if(a==="top")el.top=!el.top;else if(a==="cx"){el.x=60;el.y=80}
  else if(a==="dup"){const c=clone(el);c.x+=8;c.y+=8;d.els.push(c);S.sel=d.els.length-1}
  else if(a==="del"){d.els.splice(S.sel,1);S.sel=-1}
  else if(a==="fwd"&&S.sel<d.els.length-1){d.els.splice(S.sel+1,0,d.els.splice(S.sel,1)[0]);S.sel++}
  else if(a==="back"&&S.sel>0){d.els.splice(S.sel-1,0,d.els.splice(S.sel,1)[0]);S.sel--}
  full();return}},true);
let SLP=false;
document.addEventListener("input",e=>{if(cur!=="lab")return;const t=e.target;let p;
 if((p=t.dataset.lsl)){if(!SLP){push();SLP=true}setP(p,+t.value);const sp=t.nextElementSibling;if(sp)sp.textContent=/\.o$/.test(p)||p==="sh"?Math.round(t.value*100)+"%":Math.round(t.value*10)/10+(p==="el.s"?"×":p==="el.r"?"°":"");upd();return}
 if((p=t.dataset.lcol)){if(!SLP){push();SLP=true}setP(p,t.value);upd();return}
 if((p=t.dataset.ltx)){if(!SLP){push();SLP=true}setP(p,t.value);upd();return}
 if(t.matches("[data-lnum]")){S.num=Math.max(0,Math.min(99,+t.value||0));upd();return}
 if(t.matches("[data-lname]")){S.name=t.value;const x=document.getElementById("lbtit");if(x)x.textContent=t.value||"Nuova maglia";keep()}});
document.addEventListener("change",e=>{if(cur!=="lab")return;const t=e.target;if(t.matches("[data-lbt]")){S.bt=t.value;panel();return}if(t.dataset.lsl||t.dataset.lcol||t.dataset.ltx){SLP=false;if(t.dataset.lcol)panel();const u=document.querySelector("[data-lact=undo]");if(u)u.disabled=!S.hist.length}});
/* ===== tocco sull'anteprima: scegli, trascina, due dita = grandezza e rotazione ===== */
const PT=new Map();let G=null;
const svgPt=(x,y)=>{const s=document.getElementById("lbsvg");if(!s)return{x:0,y:0};const m=s.getScreenCTM();if(!m)return{x:0,y:0};const p=s.createSVGPoint();p.x=x;p.y=y;const q=p.matrixTransform(m.inverse());return{x:q.x,y:q.y}};
document.addEventListener("pointerdown",e=>{if(cur!=="lab")return;const b=e.target.closest&&e.target.closest("#lbprev");if(!b)return;e.preventDefault();PT.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(PT.size===1){const g=e.target.closest("[data-li]");if(g){const i=+g.dataset.li;const was=S.sel;S.sel=i;if(was!==i)panel();const el=S.d.els[i],p=svgPt(e.clientX,e.clientY);G={i,dx:el.x-p.x,dy:el.y-p.y,moved:false,h:false};selBox()}else{G=null;if(S.sel>=0){S.sel=-1;panel();selBox()}}}
 else if(PT.size===2&&S.sel>=0){const [a,c]=[...PT.values()],el=S.d.els[S.sel];G={i:S.sel,pinch:true,d0:Math.hypot(c.x-a.x,c.y-a.y),a0:Math.atan2(c.y-a.y,c.x-a.x),s0:el.s||1,r0:el.r||0,h:G&&G.h}}},{passive:false});
document.addEventListener("pointermove",e=>{if(!G||!PT.has(e.pointerId))return;e.preventDefault();PT.set(e.pointerId,{x:e.clientX,y:e.clientY});const el=S.d.els[G.i];if(!el)return;if(!G.h){push();G.h=true}
 if(G.pinch&&PT.size>=2){const [a,c]=[...PT.values()];const d=Math.hypot(c.x-a.x,c.y-a.y),an=Math.atan2(c.y-a.y,c.x-a.x);el.s=Math.max(.15,Math.min(5,G.s0*d/G.d0));let r=G.r0+(an-G.a0)*180/Math.PI;r=((r+540)%360)-180;el.r=Math.round(r)}
 else if(!G.pinch){const p=svgPt(e.clientX,e.clientY);el.x=Math.round((p.x+G.dx)*2)/2;el.y=Math.round((p.y+G.dy)*2)/2;G.moved=true}upd()},{passive:false});
const pend=e=>{PT.delete(e.pointerId);if(PT.size===0&&G){const h=G.h;G=null;if(h)panel()}else if(PT.size===1&&G&&G.pinch){G=null}};
document.addEventListener("pointerup",pend);document.addEventListener("pointercancel",pend);
addEventListener("resize",()=>{if(cur==="lab")selBox()});addEventListener("scroll",()=>{if(cur==="lab")selBox()},{passive:true});
/* ===== stile ===== */
if(!document.getElementById("lbfont")){const l=document.createElement("link");l.id="lbfont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Rye&family=Graduate&display=swap";document.head.appendChild(l)}
const st=document.createElement("style");st.textContent=`
.lab .lbstage{position:relative;background:radial-gradient(ellipse at 50% 30%,#3b2a5e,#16121f 70%);border-radius:18px;padding:10px 10px 12px;margin:10px 0;border:1px solid rgba(255,255,255,.12)}
.lab .lbtop{display:flex;justify-content:space-between;align-items:center;color:#fde68a;font:900 italic 16px var(--display,Arial)}
.lab .lbtop button{width:40px;height:36px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35)!important;color:#fff!important;font-size:18px;margin-left:6px}.lab .lbtop button:disabled{opacity:.3}
.lab #lbprev{width:min(78vw,300px);margin:4px auto 0;touch-action:none;user-select:none;-webkit-user-select:none}.lab #lbprev svg{width:100%;height:auto;display:block}
.lab #lbsel{position:absolute;display:none;pointer-events:none;border:2px dashed #ff2bd6;border-radius:6px;box-shadow:0 0 10px #ff2bd6}
.lab .lbbtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.lab .lbbtns button{flex:1 1 auto;padding:10px 8px;border-radius:11px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;font:800 13px system-ui}
.lab .lbsb button{background:#7c3aed;border-color:#7c3aed}.lab .lbsb .lbsv{background:#facc15;border-color:#facc15;color:#111}
.lab .lbtabs{display:flex;gap:4px;overflow-x:auto;padding:6px 0;background:inherit;scrollbar-width:none}.lab .lbtabs::-webkit-scrollbar{display:none}
.lab .lbtabs button{flex:0 0 auto;padding:9px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:#241c36;color:#e9d5ff;font:900 italic 14px var(--display,Arial)}.lab .lbtabs button.on{background:#facc15;color:#111;border-color:#facc15}
.lab .lbcard{background:#1d1630;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:12px;margin:8px 0;color:#f5f3ff}.lab .lbcard h4{margin:0 0 6px;font:900 italic 15px var(--display,Arial);color:#fde68a}
.lab .lbelp{border:2px solid #ff2bd6;background:#2a1640}.lab .lbhd{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}.lab .lbhd b{font-size:15px}
.lab .lbhd button{padding:8px 14px;border-radius:10px;border:1px solid #fff;background:#111;color:#fff;font:800 13px system-ui}.lab .lbhd button.on{background:#16a34a;border-color:#16a34a}
.lab .lbnote{font-size:12px;color:#c4b5fd;margin:2px 0 6px}
.lab .lbgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.lab .lbg4{grid-template-columns:repeat(4,1fr)}.lab .lbg5{grid-template-columns:repeat(4,1fr)}
.lab .lbth{background:#2a2142;border:2px solid transparent;border-radius:12px;padding:4px 2px;color:#fff;text-align:center;font:inherit}.lab .lbth.on{border-color:#facc15}.lab .lbth svg{width:100%;height:auto;display:block}
.lab .lbth small{display:block;font:800 10.5px system-ui;line-height:1.15;margin-top:2px}.lab .lbic{background:#facc15;color:#111}.lab .lbic svg{width:70%;margin:2px auto}
.lab .lbmb{display:flex;gap:3px;margin-top:3px}.lab .lbmb button{flex:1;padding:6px 0;border-radius:8px;border:0;background:#7c3aed;color:#fff;font:800 11px system-ui}.lab .lbmb button+button{flex:0 0 30px;background:#3f3f46}
.lab .lbrow{margin:8px 0 2px}.lab .lbrow>b{display:block;font:800 12px system-ui;color:#ddd6fe;margin-bottom:4px}
.lab .lbsw{display:flex;flex-wrap:wrap;gap:5px}.lab .lbsw button,.lab .lbcus{width:30px;height:30px;border-radius:8px;border:2px solid rgba(255,255,255,.35);padding:0}.lab .lbsw button.on{border:3px solid #ff2bd6;box-shadow:0 0 0 1px #fff}
.lab .lbcus{position:relative;display:inline-flex;align-items:center;justify-content:center;background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);font-size:14px;overflow:hidden}.lab .lbcus input{position:absolute;inset:0;opacity:0;width:100%;height:100%}
.lab .lbsl{display:flex;align-items:center;gap:10px}.lab .lbsl input{flex:1;accent-color:#facc15;height:30px}.lab .lbsl span{min-width:46px;text-align:right;font:800 13px system-ui}
.lab .lbchips{display:flex;flex-wrap:wrap;gap:5px}.lab .lbchips button{padding:8px 11px;border-radius:999px;border:1px solid rgba(255,255,255,.3);background:#2a2142;color:#fff;font:800 12.5px system-ui;display:inline-flex;align-items:center;gap:5px}.lab .lbchips button.on{background:#facc15;color:#111;border-color:#facc15}
.lab .lbchips i{width:14px;height:14px;border-radius:4px;display:inline-block;border:1px solid #fff}
.lab .lbin{width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:#0f0b1a!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font:700 15px system-ui}
.lab textarea{width:100%;box-sizing:border-box;height:110px;font-size:11px;border-radius:10px;background:#0f0b1a;color:#e9d5ff;border:1px solid rgba(255,255,255,.2);padding:8px}
.lab .lbbig{background:#facc15!important;color:#111!important;border-color:#facc15!important}.lab .lbdel{background:#7f1d1d!important;border-color:#b91c1c!important}
html body main .lab .lbth small,html body main .lab .lbsl span{color:#fff!important;-webkit-text-fill-color:#fff!important}html body main .lab .lbic small{color:#111!important;-webkit-text-fill-color:#111!important}html body main .lab input.lbin:not(#z1):not(#z2),html body main .lab select.lbin:not(#z1):not(#z2),html body main .lab textarea:not(#z1):not(#z2){background:#0f0b1a!important;background-color:#0f0b1a!important;color:#fff!important;-webkit-text-fill-color:#fff!important}
.lab .lbcard,.lab .lbth,.lab .lbhd b,.lab .lbsl span,.lab .lbbtns button,.lab .lbchips button,.lab .lbmb button{color:#fff!important;-webkit-text-fill-color:currentColor}.lab .lbcard h4,.lab .lbtop,.lab #lbtit{color:#fde68a!important}.lab .lbrow>b{color:#ddd6fe!important}.lab .lbnote{color:#c4b5fd!important}
.lab .lbtabs button{color:#e9d5ff!important}.lab .lbtabs button.on,.lab .lbchips button.on,.lab .lbic,.lab .lbic small,.lab .lbsb .lbsv,.lab .lbbig{color:#111!important}.lab textarea{color:#e9d5ff!important;background:#0f0b1a!important}.lab .lbin{background:#0f0b1a!important}
.lbpbar{position:sticky;top:0;z-index:30;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;margin:0 0 8px;border-radius:0 0 14px 14px;background:#7c3aed;color:#fff;font:800 13px system-ui}.lbpbar button{padding:8px 10px;border-radius:10px;border:0;background:#fff;color:#4c1d95;font:900 12.5px system-ui}`;
document.head.appendChild(st);
})();
