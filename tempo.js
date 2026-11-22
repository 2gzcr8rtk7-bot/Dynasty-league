/* (1211) MACCHINA DEL TEMPO — Giochi › Fanta Dreamers.
   Tutto si gioca sulla stagione in corso (3° anno, 2026/27) con i PDK veri notte per notte; le squadre possono essere quelle di oggi
   oppure le rose del 1° anno (2024/25) e del 2° anno (2025/26) di ogni franchigia (TT_ROSE, con i ruoli di allora).
   Punteggio di un turno = stesse regole di Dreamers: per ogni giocatore il miglior PDK del turno; per ruolo entrano i migliori (4 G, 4 A, 2 C);
   in ordine il 1° è capitano ×1,5, dal 2° al 6° pieno, dal 7° al 10° metà; tra i primi 5 almeno un G, un'A e un C. Chi non gioca in NBA vale 0.
   Modalità: «Lega» = tutte e 8 le franchigie (ognuna con l'anno scelto) con il calendario vero degli scontri diretti; «Somma punti» = 2-8 squadre
   a scelta (anche la stessa franchigia in anni diversi), classifica per punti totali come la G League. Contano solo i turni chiusi (più quello in corso, provvisorio). */
(function(){
/* rose storiche: TT_ROSE[anno][squadra] = [[nome, ruolo G/F/C], ...] — si riempiono con le rose che manda Francesco */
window.TT_ROSE=window.TT_ROSE||{1:{},2:{}};
/* 2° anno 2025/26 (arrivano una alla volta) */
Object.assign(TT_ROSE[2],{"SPI":[["Ja Morant","G"],["Donovan Mitchell","G"],["Stephon Castle","G"],["VJ Edgecombe","G"],["Kyrie Irving","G"],["LeBron James","F"],["Franz Wagner","F"],["Lauri Markkanen","F"],["Giannis Antetokounmpo","F"],["Jonathan Kuminga","F"],["Joel Embiid","C"],["Nikola Vucevic","C"],["Mark Williams","C"],["Khaman Maluach","C"]],"FOX":[["Devin Booker","G"],["Josh Giddey","G"],["Austin Reaves","G"],["Desmond Bane","G"],["Ryan Rollins","G"],["Paolo Banchero","F"],["Jayson Tatum","F"],["Jimmy Butler","F"],["Josh Hart","F"],["Kawhi Leonard","F"],["Domantas Sabonis","C"],["Ivica Zubac","C"],["Yves Missi","C"]],"EAG":[["Stephen Curry","G"],["Jalen Brunson","G"],["Dejounte Murray","G"],["De'Aaron Fox","G"],["Keyonte George","G"],["Jamal Murray","G"],["Pascal Siakam","F"],["Deni Avdija","F"],["Jaylen Brown","F"],["Kristaps Porzingis","F"],["Miles Bridges","F"],["Anthony Davis","C"],["Jalen Duren","C"],["Jakob Poeltl","C"],["Yang Hansen","C"],["Jusuf Nurkic","C"]],"TUR":[["Shai Gilgeous-Alexander","G"],["Darius Garland","G"],["Tre Johnson","G"],["Dylan Harper","G"],["Jalen Green","G"],["Kasparas Jakucionis","G"],["Ace Bailey","F"],["Chet Holmgren","F"],["Jabari Smith Jr.","F"],["Cam Whitmore","F"],["Brandon Miller","F"],["Zaccharie Risacher","F"],["Donovan Clingan","C"],["Alex Sarr","C"],["Derik Queen","C"]],"MOO":[["LaMelo Ball","G"],["Tyler Herro","G"],["Payton Pritchard","G"],["Andrew Nembhard","G"],["James Harden","G"],["Tyrese Haliburton","G"],["Jalen Williams","F"],["Evan Mobley","F"],["Zion Williamson","F"],["Trey Murphy III","F"],["Andrew Wiggins","F"],["Karl-Anthony Towns","C"],["Walker Kessler","C"],["Rudy Gobert","C"]],"DUC":[["Cade Cunningham","G"],["Anthony Edwards","G"],["Derrick White","G"],["Immanuel Quickley","G"],["Kon Knueppel","G"],["Isaiah Collier","G"],["Kyshawn George","G"],["Cedric Coward","G"],["Victor Wembanyama","F"],["Jalen Johnson","F"],["Michael Porter Jr.","F"],["Brandon Ingram","F"],["Matas Buzelis","F"],["Nikola Jokic","C"],["Kel'el Ware","C"],["Deandre Ayton","C"],["Onyeka Okongwu","C"]],"DOL":[["Luka Doncic","G"],["Amen Thompson","G"],["De'Aaron Fox","G"],["Egor Demin","G"],["Shaedon Sharpe","G"],["Kevin Durant","F"],["Scottie Barnes","F"],["Julius Randle","F"],["Aaron Gordon","F"],["Collin Murray-Boyles","F"],["Jaren Jackson Jr.","F"],["Jarrett Allen","C"],["Bam Adebayo","C"],["Jakob Poeltl","C"]],"PEA":[["Trae Young","G"],["Tyrese Maxey","G"],["Dyson Daniels","G"],["Ausar Thompson","G"],["Jeremiah Fears","G"],["Cooper Flagg","F"],["Moussa Diabate","F"],["Jaime Jaquez Jr.","F"],["RJ Barrett","F"],["Danny Wolf","F"],["Alperen Sengun","C"],["Isaiah Hartenstein","C"],["Zach Edey","C"]]});
/* 1° anno 2024/25 (Walruses→Mooses, Sharks→Spiders, Cats→Turtles, Dolphins→Peacocks, Predators→Dolphins) */
if(!Object.keys(TT_ROSE[1]).length)TT_ROSE[1]={"MOO":[["Tyrese Haliburton","G"],["LaMelo Ball","G"],["Karl-Anthony Towns","C"],["Evan Mobley","F"],["Jalen Williams","F"],["Damian Lillard","G"],["Tyler Herro","G"],["Jalen Green","G"],["Zion Williamson","F"],["RJ Barrett","F"],["Trey Murphy III","F"],["Jakob Poeltl","C"],["Walker Kessler","C"]],"FOX":[["Devin Booker","G"],["Josh Hart","G"],["Jayson Tatum","F"],["Domantas Sabonis","C"],["Ivica Zubac","C"],["Darius Garland","G"],["Josh Giddey","G"],["Austin Reaves","G"],["Jimmy Butler","G"],["Julius Randle","F"],["Aaron Gordon","F"],["Cameron Johnson","F"],["Alex Sarr","C"]],"EAG":[["Stephen Curry","G"],["Jalen Brunson","G"],["Jaren Jackson Jr.","F"],["Anthony Davis","C"],["Jalen Duren","C"],["De'Aaron Fox","G"],["Derrick White","G"],["Dejounte Murray","G"],["Jaylen Brown","F"],["Kyle Kuzma","F"],["Zaccharie Risacher","F"],["Deni Avdija","F"],["Rudy Gobert","C"]],"SPI":[["Donovan Mitchell","G"],["Ja Morant","G"],["Joel Embiid","C"],["LeBron James","F"],["Giannis Antetokounmpo","F"],["Kyrie Irving","G"],["Devin Vassell","G"],["Dalton Knecht","G"],["Franz Wagner","F"],["Jabari Smith Jr.","F"],["Jonathan Kuminga","F"],["Nikola Vucevic","C"],["Mark Williams","C"]],"DUC":[["Cade Cunningham","G"],["Amen Thompson","G"],["Nikola Jokic","C"],["Victor Wembanyama","F"],["Jalen Johnson","F"],["Ausar Thompson","G"],["Jamal Murray","G"],["Jordan Poole","G"],["Brandon Miller","F"],["Jeremy Sochan","F"],["Michael Porter Jr.","F"],["Kel'el Ware","C"],["Isaiah Hartenstein","C"]],"TUR":[["Shai Gilgeous-Alexander","G"],["Tyrese Maxey","G"],["Chet Holmgren","C"],["Lauri Markkanen","F"],["Kristaps Porzingis","F"],["Desmond Bane","G"],["Bennedict Mathurin","G"],["Cam Thomas","G"],["Miles Bridges","F"],["Brandon Ingram","F"],["Keegan Murray","F"],["Deandre Ayton","C"],["Dereck Lively II","C"]],"PEA":[["Trae Young","G"],["Paolo Banchero","F"],["Pascal Siakam","F"],["Bam Adebayo","C"],["Alperen Sengun","C"],["Bradley Beal","G"],["Coby White","G"],["Fred VanVleet","G"],["Bub Carrington","G"],["John Collins","F"],["Andrew Wiggins","F"],["Paul George","F"],["Nic Claxton","C"]],"DOL":[["Luka Doncic","G"],["Anthony Edwards","G"],["Jarrett Allen","C"],["Scottie Barnes","F"],["Kevin Durant","F"],["James Harden","G"],["Jared McCain","G"],["Dyson Daniels","G"],["Tari Eason","F"],["Jaime Jaquez Jr.","F"],["DeMar DeRozan","F"],["Zach Edey","C"],["Yves Missi","C"]]};
const ANNI={1:"1° anno · 24/25",2:"2° anno · 25/26",3:"3° anno · oggi"};
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const TT=window.TT={mode:"lega",sel:{},entries:[],view:null};
const rosa=(t,y)=>+y===3?{real:t}:((TT_ROSE[y]||{})[t]||null);/* squadre di oggi = punteggio vero di Dreamers (rosa e formazione di quel turno) */
const has=(t,y)=>{const r=rosa(t,y);return!!(r&&(r.real||r.length))};
const tag=(t,y)=>`${TEAMS[t].nick}${y===3?"":` <i class="tty">${y===1?"24/25":"25/26"}</i>`}`;
/* migliori PDK del turno k per TUTTI i giocatori NBA: notti ufficiali Dreamers (con le correzioni) e, per chi non è nelle rose di oggi, tabellini Dynasty TV */
const ACC={};
function acc(k){const W=drWeek(k),key=k+"|"+W.closed+"|"+(W.nights||0);if(ACC[k]&&ACC[k].key===key)return ACC[k];const A={},N=drNotti();
 const put=(n,v)=>{const x=tvNm(n);if(A[x]==null||v>A[x])A[x]=v};
 for(let d=W.start;d<=W.end;d=drAdd(d,1)){const o=N[d]||{},seen=new Set();for(const n in o){const v=typeof o[n]==="number"?o[n]:null;if(v!=null){put(n,v);seen.add(tvNm(n))}}
  for(const g of (TV.days[d]||[])){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;for(const sd of["a","h"])for(const r of B[sd]||[]){const x=tvNm(r[0]);if(seen.has(x))continue;if(String(r[2]||"0")==="0:00")continue;put(r[0],+r[19]||0)}}}
 return ACC[k]={key,A,W}}
/* (1216) LEGA A 8: contano 8 giocatori (3 G, 3 A, 2 C; i primi 6 pieni con il capitano ×1,5, 7° e 8° a metà), tribuna minima 5.
   Anche le squadre di oggi sono simulate a 8, con la rosa vera di quel turno (titolari + riserve). */
const F8=()=>TT.mode==="lega8",Q8={G:3,F:3,C:2};
function score(k,R){if(R&&R.real&&F8()){const F=drForm(k)[R.real]||{t:[],r:[]};R=[...F.t,...F.r].map(n=>[n,ruoloDi(n)||"F"])}
 if(R&&R.real){const W=drWeek(k),T=drTeam(k,R.real,W);return{top:T.top.map(x=>({n:x.n,r:x.r,e:x.e,m:x.m})),score:T.score||0,played:T.played,closed:W.closed,started:W.started}}const{A,W}=acc(k);if(!R)return null;
 const pool=R.map(([n,r],i)=>({n,r:r==="A"?"F":r,i,e:A[tvNm(n)]??null}));
 const key=x=>x.e==null?-1e9:x.e,ord=(p,q)=>key(q)-key(p)||p.i-q.i;let sel=[];
 for(const r of["G","F","C"])sel.push(...pool.filter(x=>x.r===r).sort(ord).slice(0,(F8()?Q8:DR_QUOTE)[r]));
 sel.sort(ord);let a=sel.slice(0,5),b=sel.slice(5);
 for(const r of["C","F","G"]){if(a.some(x=>x.r===r))continue;const up=b.find(x=>x.r===r);if(!up)continue;const cnt=x=>a.filter(y=>y.r===x.r).length,down=[...a].reverse().find(x=>cnt(x)>1);if(!down)continue;a=a.filter(x=>x!==down).concat(up).sort(ord);b=b.filter(x=>x!==up).concat(down).sort(ord)}
 const top=[...a,...b];top.forEach((x,i)=>{x.m=i===0?1.5:i>=6?.5:1;x.f=(x.e||0)*x.m});
 const played=top.filter(x=>x.e!=null).length;return{top,score:top.reduce((s,x)=>s+x.f,0),played,closed:W.closed,started:W.started}}
const turni=()=>{const L=[];for(let k=1;k<=DR_REG;k++){const W=drWeek(k);if(W.closed||W.started)L.push(k)}return L};
/* --- LEGA: 8 franchigie, calendario vero --- */
function lega(){const T=Object.keys(TEAMS),y=t=>TT.sel[t]||3,S={};T.forEach(t=>S[t]={t,y:y(t),w:0,l:0,pf:0,pa:0,res:[]});
 for(const k of turni()){const pairs=DR_SCHED[k-1]||[];for(const[a,b]of pairs){const A=score(k,rosa(a,y(a))),B=score(k,rosa(b,y(b)));if(!A||!B)continue;const W=acc(k).W;
  S[a].pf+=A.score;S[a].pa+=B.score;S[b].pf+=B.score;S[b].pa+=A.score;if(W.closed){if(A.score>=B.score){S[a].w++;S[b].l++}else{S[b].w++;S[a].l++}}S[a].res.push({k,o:b,me:A.score,vs:B.score,fin:W.closed});S[b].res.push({k,o:a,me:B.score,vs:A.score,fin:W.closed})}}
 /* parte dalla stessa base di Dreamers (giornate 1-2 Dunkest) */try{for(const t of T){const b=DR_BASE[t];if(b&&S[t].y===3&&!F8()){S[t].w+=b.w;S[t].l+=b.l;S[t].pf+=b.pf;S[t].pa+=b.pa}else if(b){S[t].w+=b.w;S[t].l+=b.l}}}catch(e){}
 return Object.values(S).sort((p,q)=>q.w-p.w||q.pf-p.pf)}
function somma(){return TT.entries.map(([t,y],i)=>{let tot=0,n=0;const res=[];for(const k of turni()){const s=score(k,rosa(t,y));if(!s)continue;tot+=s.score;n++;res.push({k,v:s.score,fin:s.closed})}return{i,t,y,tot,n,avg:n?tot/n:0,res}}).sort((p,q)=>q.tot-p.tot)}
const reale=()=>{try{return drStand().map(x=>x.t)}catch(e){return[]}};
/* --- grafica --- */
const lg=t=>`<span class="ttlg">${badge(t)}</span>`;
function yearChips(t){return`<span class="ttyc">${[1,2,3].map(y=>`<button data-tt="y|${t}|${y}" aria-pressed="${(TT.sel[t]||3)===y}"${has(t,y)?"":" disabled"}>${y===3?"Oggi":y===1?"24/25":"25/26"}</button>`).join("")}</span>`}
function vLega(){const L=lega(),R=reale();
 return`${F8()?`<p class="ttn"><b>Lega a 8:</b> come Dreamers ma contano solo <b>8 giocatori</b> (3 guardie, 3 ali, 2 centri): i primi 6 pieni con il capitano ×1,5, il 7° e l’8° a metà. La tribuna diventa di almeno 5: chi oggi non gioca più pesa molto meno, come se la squadra lo avesse sostituito. Anche le squadre di oggi sono simulate a 8.</p>`:""}<p class="ttn">Scegli per ogni franchigia con quale rosa gioca la stagione di oggi. Il calendario e i punteggi sono quelli veri del 3° anno, dal 1° turno.</p>
 <div class="ttsel">${Object.keys(TEAMS).map(t=>`<div class="ttrow">${lg(t)}<b>${TEAMS[t].nick}</b>${yearChips(t)}</div>`).join("")}</div>
 <div class="tth">Classifica «come sarebbe andata»</div>
 <div class="ttcla">${L.map((x,i)=>{const r=R.indexOf(x.t)+1,d=r?r-(i+1):0;return`<button class="ttcr" data-tt="team|${x.t}">${`<b class="ttp">${i+1}</b>`}${lg(x.t)}<span class="ttnm">${tag(x.t,x.y)}<small>${x.w}-${x.l} · ${f1(x.pf)} PDK</small></span><span class="ttd ${d>0?"up":d<0?"dn":""}">${r?`realtà ${r}°`:""}${d?` (${d>0?"+":""}${d})`:""}</span></button>`}).join("")}</div>
 ${TT.team?vTeamRes(L.find(x=>x.t===TT.team)):""}
 ${[1,2].some(y=>!Object.keys(TT_ROSE[y]||{}).length)?`<p class="ttn small">Le rose del 1° e del 2° anno non sono ancora caricate: per ora si può giocare solo con le squadre di oggi.</p>`:""}`}
/* (1213) rose consultabili: dalla scheda squadra si vedono le rose di tutti e tre gli anni, con PDK medi e partite di questa stagione */
let MED=null;function med(){if(MED&&MED.n===Object.keys(TV.box).length)return MED.m;const m={};for(const id in TV.box){const B=TV.box[id];for(const sd of["a","h"])for(const r of B[sd]||[]){if(String(r[2]||"0")==="0:00")continue;const x=tvNm(r[0]);(m[x]=m[x]||{s:0,g:0});m[x].s+=+r[19]||0;m[x].g++}}MED={n:Object.keys(TV.box).length,m};return m}
function roseOf(t,y){if(+y===3)return(ROSTER[t]||[]).map(x=>[x[0],x[2]]);return(TT_ROSE[y]||{})[t]||[]}
function vRosa(t,y0){const y=TT.rv&&TT.rv[t]||y0,R=roseOf(t,y),M=med(),RN={G:"Guardie",F:"Ali",C:"Centri"};
 const grp=r=>{const L=R.map(([n,q])=>({n,r:q==="A"?"F":q,m:M[tvNm(n)]})).filter(x=>x.r===r).sort((a,b)=>(b.m?b.m.s/b.m.g:-1)-(a.m?a.m.s/a.m.g:-1));
  return L.length?`<div class="ttrg"><h6>${RN[r]}</h6>${L.map(x=>`<div class="ttrp${x.m?"":" no"}"><i>${r==="F"?"A":r}</i><b>${E(x.n)}</b><em>${x.m?f1(x.m.s/x.m.g):"—"}<small>${x.m?x.m.g+" p":"non gioca"}</small></em></div>`).join("")}</div>`:""};
 return`<div class="tth">Rosa ${TEAMS[t].nick}</div><div class="ttry">${[1,2,3].map(k=>`<button data-tt="rv|${t}|${k}" aria-pressed="${+y===k}">${ANNI[k].split(" · ")[1]==="oggi"?"Oggi":ANNI[k].split(" · ")[1]}</button>`).join("")}</div>
 ${R.length?`<div class="ttros">${grp("G")}${grp("F")}${grp("C")}</div><p class="ttn small">PDK medi e partite di questa stagione. «Non gioca» = nessuna partita quest'anno: nella Macchina del tempo conta 0.</p>`:`<p class="ttn small">Rosa non caricata.</p>`}`}
function vTeamRes(x){if(!x)return"";return`${vRosa(x.t,x.y)}<div class="tth">${tag(x.t,x.y)} · turno per turno</div><div class="ttres">${x.res.map(r=>`<button class="ttm ${r.fin?(r.me>=r.vs?"w":"l"):"lv"}" data-tt="duel|${r.k}|${x.t}|${x.y}|${r.o}|${TT.sel[r.o]||3}"><span>T${r.k+DR_OFF}</span>${lg(r.o)}<b>${f1(r.me)}–${f1(r.vs)}</b><em>${r.fin?(r.me>=r.vs?"V":"P"):"live"}</em></button>`).join("")}</div>`}
/* ---------- (1215) ANALISI · la rubrica della Macchina del tempo: come sono cambiate le franchigie tra 24/25, 25/26 e oggi.
   Metro unico per tutti gli anni = i PDK veri di QUESTA stagione (stessa misura per tutte le rose). ---------- */
const YN={1:"24/25",2:"25/26",3:"oggi"};
let NAS=null;const nasc=n=>{if(!NAS){NAS={};try{for(const k in NASCITA)NAS[tvNm(k)]=NASCITA[k]}catch(e){}}return NAS[tvNm(n)]||null};
const etaY=(n,y)=>{const d=nasc(n);if(!d)return null;return(Date.now()-new Date(d+"T00:00:00Z"))/(365.25*864e5)-(3-y)};
const pmed=n=>{const m=med()[tvNm(n)];return m?{v:m.s/m.g,g:m.g}:null};
const dove=n=>{const x=tvNm(n);for(const t in ROSTER)if((ROSTER[t]||[]).some(p=>tvNm(p[0])===x))return t;return null};
const vo=t=>/^[AEIOU]/.test(TEAMS[t].nick),ART=(p,t)=>({i:vo(t)?"gli":"i",ai:vo(t)?"agli":"ai",dai:vo(t)?"dagli":"dai",con:vo(t)?"con gli":"con i"})[p]+" "+TEAMS[t].nick;
const pc=v=>(v>0?"+":"")+Math.round(v)+"%";
const nomi=L=>L.length?L.map(x=>`<b>${E(x.n)}</b>${x.p?` (${f1(x.p.v)})`:""}`).join(", "):"nessuno";
const lista=a=>a.length<=1?a.join(""):a.slice(0,-1).join(", ")+" e "+a[a.length-1];
let AN=null;
function analisiData(){const key=turni().join(",")+"|"+Object.keys(TV.box).length;if(AN&&AN.key===key)return AN;
 const T=Object.keys(TEAMS),K=turni().filter(k=>drWeek(k).closed),V=[];
 const forza=(t,y,R)=>{let s=0,n=0;for(const k of K){const x=score(k,R||rosa(t,y));if(!x)continue;s+=x.score;n++}return n?s/n:0};
 const F={};for(const t of T){F[t]={};for(const y of[1,2,3]){if(!has(t,y))continue;const R=roseOf(t,y).map(([n,r])=>({n,r:r==="A"?"F":r,p:pmed(n),e:etaY(n,y)}));
   const val=R.filter(x=>x.p).sort((a,b)=>b.p.v-a.p.v),top=val.slice(0,10),et=top.filter(x=>x.e!=null);
   F[t][y]={t,y,R,f:forza(t,y),top,eta:et.length?et.reduce((s,x)=>s+x.e,0)/et.length:null,zero:R.filter(x=>!x.p)};V.push(F[t][y])}}
 V.sort((a,b)=>b.f-a.f);V.forEach((x,i)=>x.rk=i+1);
 /* movimenti tra un anno e l'altro */
 const mov=(t,a,b)=>{const A=F[t][a],B=F[t][b];if(!A||!B)return null;const sa=new Set(A.R.map(x=>tvNm(x.n))),sb=new Set(B.R.map(x=>tvNm(x.n)));
  const by=(L)=>L.sort((p,q)=>(q.p?q.p.v:-1)-(p.p?p.p.v:-1));return{in:by(B.R.filter(x=>!sa.has(tvNm(x.n)))),out:by(A.R.filter(x=>!sb.has(tvNm(x.n)))),stay:by(B.R.filter(x=>sa.has(tvNm(x.n))))}};
 const M={};for(const t of T)M[t]={12:mov(t,1,2),23:mov(t,2,3),13:mov(t,1,3)};
 /* rosa «di sempre»: il meglio delle tre rose della franchigia */
 const ALL={};for(const t of T){const seen=new Set(),U=[];for(const y of[3,2,1])for(const[n,r]of roseOf(t,y)){const x=tvNm(n);if(seen.has(x))continue;seen.add(x);U.push([n,r])}ALL[t]={R:U,f:forza(t,0,U)};
   const best=U.map(([n,r])=>({n,r:r==="A"?"F":r,p:pmed(n)})).filter(x=>x.p).sort((a,b)=>b.p.v-a.p.v);ALL[t].best=best}
 /* fedelissimi e giramondo */
 const giro={};for(const t of T)for(const y of[1,2,3])for(const[n]of roseOf(t,y)){const x=tvNm(n);(giro[x]=giro[x]||{n,t:new Set(),y:[]}).t.add(t);giro[x].y.push([y,t])}
 const fede=[];for(const t of T){const a=F[t][1],b=F[t][2],c=F[t][3];if(!a||!b||!c)continue;const s2=new Set(b.R.map(x=>tvNm(x.n))),s3=new Set(c.R.map(x=>tvNm(x.n)));a.R.forEach(x=>{if(s2.has(tvNm(x.n))&&s3.has(tvNm(x.n)))fede.push({t,n:x.n,p:x.p})})}
 const viaggi=Object.values(giro).filter(x=>x.t.size>=3).map(x=>({...x,p:pmed(x.n)})).sort((a,b)=>b.t.size-a.t.size||(b.p?b.p.v:0)-(a.p?a.p.v:0));
 return AN={key,T,F,V,M,ALL,fede,viaggi,K}}
function verdetto(d){return d>=15?["🚀","Rinascita"]:d>=5?["📈","In crescita"]:d>-5?["⚖️","Stabile"]:d>-15?["📉","In calo"]:["🧨","Crollo"]}
function forma(a,b,c){const u=b.f>=a.f,v=c.f>=b.f;return u&&v?"sempre in salita":!u&&!v?"in discesa anno dopo anno":u&&!v?"su e poi giù: il 25/26 resta il picco":"giù e poi su: oggi la risalita"}
function articolo(t,D){const A=D.F[t],a=A[1],b=A[2],c=A[3];if(!a||!b||!c)return"";const nk=TEAMS[t].nick,d=(c.f/a.f-1)*100,[ic,vd]=verdetto(d),m=D.M[t][13],m23=D.M[t][23];
 const P=[];
 P.push(`Con i PDK di questa stagione, ${ART("i",t)} del 24/25 farebbero <b>${f1(a.f)}</b> a turno, quelli del 25/26 <b>${f1(b.f)}</b>, quelli di oggi <b>${f1(c.f)}</b>: ${pc(d)} dal primo anno, ${forma(a,b,c)}.`);
 const stay=m.stay.filter(x=>x.p);P.push(m.stay.length?`Del primo anno sono rimasti in ${m.stay.length}: ${nomi(m.stay.slice(0,5))}${m.stay.length>5?"…":""}.${m.stay.length<=3?" Una rivoluzione quasi totale.":m.stay.length>=7?" Lo zoccolo duro c'è ancora.":""}`:`Del primo anno non è rimasto <b>nessuno</b>: un'altra squadra.`);
 const ins=m.in.filter(x=>x.p).slice(0,3),outs=m.out.filter(x=>x.p).slice(0,3);
 if(ins.length)P.push(`I colpi: ${nomi(ins)}. ${ins[0].p.v>=35?`${E(ins[0].n)} da solo ha cambiato la dimensione della squadra.`:""}`);
 if(outs.length){const o=outs[0],w=dove(o.n);P.push(`Il rimpianto: <b>${E(o.n)}</b>, oggi ${f1(o.p.v)} PDK di media${w&&w!==t?` ${ART("con",w).replace(/ (\S+)$/," <b>$1</b>")}`:w===t?"":" fuori dalle nostre rose"}.${outs.length>1?` Sono partiti anche ${nomi(outs.slice(1))}.`:""}`)}
 if(a.eta&&c.eta){const de=c.eta-a.eta;P.push(`Età media dei 10 migliori: da ${f1(a.eta)} a ${f1(c.eta)} anni ${de<=-1?"→ <b>ringiovanimento</b>, il progetto guarda avanti.":de>=1?"→ squadra <b>più esperta</b>, costruita per vincere subito.":"→ età quasi invariata."}`)}
 const z=[a,b,c].map(x=>x.zero.length);if(z.some(v=>v))P.push(`Giocatori a zero quest'anno (infortunati o fuori dalla NBA): ${z.map((v,i)=>`${YN[i+1]} ${v}`).join(" · ")}.`);
 const L=D.ALL[t];P.push(`<i>La rosa di sempre</i> (il meglio delle tre annate insieme) farebbe <b>${f1(L.f)}</b> a turno, ${L.f>c.f?`${f1(L.f-c.f)} più di oggi`:"quanto oggi: il meglio è già in squadra"}. Il trio di punta: ${nomi(L.best.slice(0,3))}.`);
 const rk=[a,b,c].map(x=>x.rk);
 return`<details class="ttart"${TT.art===t?" open":""}><summary>${lg(t)}<span><b>${nk}</b><small>${ic} ${vd} · ${pc(d)}</small></span><span class="ttspk">${[a,b,c].map(x=>`<i style="height:${Math.max(8,Math.round(x.f/D.V[0].f*34))}px" title="${YN[x.y]}"></i>`).join("")}</span></summary>
 <div class="ttart-b"><div class="ttrks">${[a,b,c].map(x=>`<div><small>${YN[x.y]}</small><b>${f1(x.f)}</b><em>${x.rk}° di sempre</em></div>`).join("")}</div>${P.map(p=>`<p>${p}</p>`).join("")}</div></details>`}
function vAnalisi(){const D=analisiData();if(!D.K.length)return`<p class="ttn">Servono turni chiusi per le analisi.</p>`;
 const T=D.T.filter(t=>D.F[t][1]&&D.F[t][3]),dd=t=>(D.F[t][3].f/D.F[t][1].f-1)*100,S=[...T].sort((p,q)=>dd(q)-dd(p));
 const up=S[0],dn=S[S.length-1];
 const col=[];T.forEach(t=>{const m=D.M[t][13];m.in.filter(x=>x.p).forEach(x=>col.push({t,...x}))});col.sort((a,b)=>b.p.v-a.p.v);
 const rim=[];T.forEach(t=>{const m=D.M[t][13];m.out.filter(x=>x.p).forEach(x=>rim.push({t,...x,w:dove(x.n)}))});rim.sort((a,b)=>b.p.v-a.p.v);if(col[0]&&rim.length>1&&tvNm(rim[0].n)===tvNm(col[0].n))rim.shift();
 const ver=[...D.ALL?T.map(t=>({t,f:D.ALL[t].f})):[]].sort((a,b)=>b.f-a.f);
 const card=(ic,ti,body)=>`<div class="ttcard"><small>${ic} ${ti}</small>${body}</div>`;
 return`<div class="ttrub"><div class="ttmast"><small>Rubrica</small><b>Ieri, oggi, domani</b><em>Come sono cambiate le franchigie dal 24/25 a oggi. Unico metro per tutti gli anni: i PDK veri di questa stagione, ${D.K.length} turni chiusi.</em></div>
 <div class="ttcards">
 ${card("🚀","La più cresciuta",`<b>${lg(up)} ${TEAMS[up].nick}</b><em>${pc(dd(up))} rispetto al 24/25</em>`)}
 ${card("🧨","La più in calo",`<b>${lg(dn)} ${TEAMS[dn].nick}</b><em>${pc(dd(dn))} rispetto al 24/25</em>`)}
 ${col[0]?card("💎","Il colpo più grande",`<b>${E(col[0].n)}</b><em>arrivato ${ART("ai",col[0].t)} · ${f1(col[0].p.v)} PDK</em>`):""}
 ${rim[0]?card("💔","Il rimpianto più grande",`<b>${E(rim[0].n)}</b><em>lasciato ${ART("dai",rim[0].t)}${rim[0].w&&rim[0].w!==rim[0].t?`, ora ${ART("ai",rim[0].w)}`:""} · ${f1(rim[0].p.v)} PDK</em>`):""}
 </div>
 <div class="tth">Power ranking di tutte le epoche</div><p class="ttn small">Le 24 versioni delle franchigie (8 × 3 anni), ordinate per PDK medi a turno con la formula Dreamers.</p>
 <div class="ttpr">${D.V.map(x=>`<div class="ttprr${x.y===3?" now":""}"><b>${x.rk}</b>${lg(x.t)}<span>${TEAMS[x.t].nick} <i class="tty">${YN[x.y]}</i></span><span class="ttbar"><i style="width:${Math.round(x.f/D.V[0].f*100)}%"></i></span><em>${f1(x.f)}</em></div>`).join("")}</div>
 <div class="tth">Le franchigie, una per una</div><p class="ttn small">Tocca una squadra per l'articolo. Le barrette sono la forza di 24/25, 25/26 e oggi.</p>
 ${S.map(t=>articolo(t,D)).join("")}
 <div class="tth">La rosa di sempre</div><p class="ttn small">Se ogni franchigia potesse mettere insieme il meglio delle sue tre annate.</p>
 <div class="ttpr">${ver.map((x,i)=>`<div class="ttprr"><b>${i+1}</b>${lg(x.t)}<span>${TEAMS[x.t].nick}<small>${nomi(D.ALL[x.t].best.slice(0,3)).replace(/ \([^)]*\)/g,"")}</small></span><em>${f1(x.f)}</em></div>`).join("")}</div>
 ${D.fede.length?`<div class="tth">I fedelissimi</div><p class="ttn small">Nella stessa franchigia in tutte e tre le stagioni.</p><div class="ttchips">${D.fede.sort((a,b)=>(b.p?b.p.v:0)-(a.p?a.p.v:0)).map(x=>`<span>${lg(x.t)}${E(x.n)}${x.p?` <small>${f1(x.p.v)}</small>`:""}</span>`).join("")}</div>`:""}
 ${D.viaggi.length?`<div class="tth">I giramondo</div><p class="ttn small">Tre franchigie diverse in tre stagioni.</p><div class="ttchips">${D.viaggi.map(x=>`<span>${x.y.sort((a,b)=>a[0]-b[0]).map(([y,t])=>lg(t)).join("›")} ${E(x.n)}${x.p?` <small>${f1(x.p.v)}</small>`:""}</span>`).join("")}</div>`:""}
 </div>`}
function vSomma(){const L=somma();
 return`<p class="ttn">Da 2 a 8 squadre, anche la stessa franchigia in anni diversi (es. Ducks 24/25 contro Ducks di oggi). Si sommano i punti di ogni turno della stagione di oggi, come la G League.</p>
 <div class="ttsel">${Object.keys(TEAMS).map(t=>`<div class="ttrow">${lg(t)}<b>${TEAMS[t].nick}</b><span class="ttyc">${[1,2,3].map(y=>{const on=TT.entries.some(e=>e[0]===t&&e[1]===y);return`<button data-tt="add|${t}|${y}" aria-pressed="${on}"${has(t,y)?"":" disabled"}>${on?"✓ ":"+ "}${y===3?"Oggi":y===1?"24/25":"25/26"}</button>`}).join("")}</span></div>`).join("")}</div>
 ${L.length<2?`<p class="ttn">Aggiungi almeno 2 squadre.</p>`:`<div class="tth">Classifica punti totali · ${L[0].n} turni</div><div class="ttcla">${L.map((x,i)=>`<button class="ttcr" data-tt="steam|${x.t}|${x.y}">${`<b class="ttp">${i+1}</b>`}${lg(x.t)}<span class="ttnm">${tag(x.t,x.y)}<small>media ${f1(x.avg)} a turno</small></span><span class="ttd"><b>${f1(x.tot)}</b></span></button>`).join("")}</div>
 ${L.length===2?`<div class="tth">Turno per turno</div><div class="ttres">${L[0].res.map((r,j)=>{const o=L[1].res[j];return`<button class="ttm ${r.v>=o.v?"w":"l"}" data-tt="duel|${r.k}|${L[0].t}|${L[0].y}|${L[1].t}|${L[1].y}"><span>T${r.k+DR_OFF}</span>${lg(L[1].t)}<b>${f1(r.v)}–${f1(o.v)}</b><em>${r.fin?"":"live"}</em></button>`}).join("")}</div>`:""}`}`}
function vDuel(v){const[k,a,ya,b,yb]=v.map((x,i)=>i===1||i===3?x:+x),A=score(k,rosa(a,ya)),B=score(k,rosa(b,yb)),W=acc(k).W;
 const col=(t,y,S,win)=>`<div class="ttdc${win?" win":""}"><div class="ttdh">${lg(t)}<b>${tag(t,y)}</b><span>${f1(S.score)}</span></div>${S.top.map((x,i)=>`<div class="ttpl${i===0?" cap":""}${x.m===.5?" half":""}"><i>${i===0?"C":x.r==="F"?"A":x.r}</i><b>${E(x.n)}</b><em>${x.e==null?"—":f1(x.e)}${x.m!==1&&x.e!=null?` <small>${x.m===1.5?"×1,5":"×½"}</small>`:""}</em></div>`).join("")}</div>`;
 return`<button class="gback" data-tt="back">‹ Macchina del tempo</button><div class="ttneb"><div class="ttfog"></div><div class="ttin">
 <div class="ttdt"><small>⏳ Macchina del tempo</small><b>Turno ${+k+DR_OFF}</b><em>${W.closed?"Finale":"In corso"} · stagione 2026/27</em></div>
 <div class="ttds"><span>${lg(a)}<b>${f1(A.score)}</b></span><i>VS</i><span><b>${f1(B.score)}</b>${lg(b)}</span></div>
 <div class="ttdg">${col(a,+ya,A,A.score>=B.score)}${col(b,+yb,B,B.score>A.score)}</div>
 <p class="ttn small">Miglior PDK del turno di ogni giocatore, regole Dreamers: capitano ×1,5, dal 7° al 10° ×½. Chi in questa stagione non gioca vale 0.</p></div></div>`}
window.vTempo=function(){if(TT.view)return vDuel(TT.view);
 return`<div class="ttwrap"><div class="tthero"><div class="ttfog"></div><small>Fanta Dreamers</small><b>⏳ Macchina del tempo</b><em>La stagione di oggi, giocata con le rose di ieri</em></div>
 <div class="ttmod">${[["lega","🏆 Lega · scontri diretti"],["lega8","🎯 Lega a 8"],["somma","➕ Somma punti"],["analisi","📰 Analisi"]].map(([m,l])=>`<button data-tt="mode|${m}" aria-pressed="${TT.mode===m}">${l}</button>`).join("")}</div>
 ${TT.mode==="lega"||TT.mode==="lega8"?vLega():TT.mode==="analisi"?vAnalisi():vSomma()}</div>`};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-tt]");if(!b||typeof cur==="undefined"||cur!=="giochi")return;e.preventDefault();e.stopPropagation();const p=b.dataset.tt.split("|");let top=false;
 if(p[0]==="mode")TT.mode=p[1];else if(p[0]==="y"){TT.sel[p[1]]=+p[2];}else if(p[0]==="team"){TT.team=TT.team===p[1]?null:p[1];TT.rv={}}else if(p[0]==="rv"){TT.rv=TT.rv||{};TT.rv[p[1]]=+p[2]}
 else if(p[0]==="add"){const i=TT.entries.findIndex(x=>x[0]===p[1]&&x[1]===+p[2]);if(i>=0)TT.entries.splice(i,1);else if(TT.entries.length<8)TT.entries.push([p[1],+p[2]])}
 else if(p[0]==="steam"){}else if(p[0]==="duel"){TT.view=p.slice(1);top=true}else if(p[0]==="back"){TT.view=null;top=true}
 const y=scrollY;render();scrollTo(0,top?0:y)},true);
const st=document.createElement("style");st.textContent=`
.ttmod{grid-template-columns:1fr 1fr!important}
.ttrub{display:grid;gap:4px}.ttmast{padding:14px 14px 12px;border-radius:16px;background:linear-gradient(135deg,#1e1b4b,#4c1d95);color:#fff;border:1px solid rgba(196,181,253,.4)}.ttmast small{display:block;font:800 10px var(--display);letter-spacing:.2em;text-transform:uppercase;color:#c4b5fd}.ttmast b{display:block;font:800 italic 24px var(--display);margin:2px 0 4px}.ttmast em{font-style:normal;font-size:12px;color:#e0e7ff;line-height:1.4}
.ttcards{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}.ttcard{padding:10px;border-radius:14px;background:rgba(124,58,237,.12);border:1px solid rgba(139,92,246,.35)}.ttcard small{display:block;font:800 10px system-ui;letter-spacing:.05em;text-transform:uppercase;opacity:.8;margin-bottom:4px}.ttcard b{display:flex;align-items:center;gap:5px;font-size:14px;line-height:1.15}.ttcard em{display:block;font-style:normal;font-size:11px;opacity:.8;margin-top:3px}.ttcard .ttlg{width:22px;height:22px}
.ttpr{display:grid;gap:3px}.ttprr{display:grid;grid-template-columns:20px 24px 1fr 70px 40px;gap:6px;align-items:center;font-size:12px;padding:3px 4px;border-radius:8px}.ttprr.now{background:rgba(124,58,237,.12)}.ttprr>b{font:800 12px var(--display);text-align:center}.ttprr .ttlg{width:22px;height:22px}.ttprr span small{display:block;font-size:10px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttprr span{min-width:0}.ttprr em{font-style:normal;font-weight:800;text-align:right}.ttbar{height:6px;border-radius:9px;background:rgba(148,163,184,.2);overflow:hidden}.ttbar i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#c084fc);border-radius:9px}
.ttart{border-radius:14px;border:1px solid rgba(139,92,246,.35);background:rgba(124,58,237,.07);margin-bottom:6px;overflow:hidden}.ttart summary{list-style:none;display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center;padding:9px 10px;cursor:pointer}.ttart summary::-webkit-details-marker{display:none}.ttart summary .ttlg{width:28px;height:28px}.ttart summary b{display:block;font:800 15px var(--display)}.ttart summary small{font-size:11px;opacity:.85}
.ttspk{display:flex;align-items:flex-end;gap:3px;height:34px}.ttspk i{width:9px;border-radius:3px 3px 0 0;background:#a78bfa}.ttspk i:last-child{background:#7c3aed}
.ttart-b{padding:0 12px 10px}.ttart-b p{margin:6px 0;font-size:12.5px;line-height:1.45}.ttrks{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:2px 0 6px}.ttrks div{text-align:center;padding:6px 2px;border-radius:10px;background:rgba(124,58,237,.12)}.ttrks small{display:block;font-size:10px;opacity:.75}.ttrks b{display:block;font:800 16px var(--display)}.ttrks em{font-style:normal;font-size:9.5px;opacity:.75}
.ttchips{display:flex;flex-wrap:wrap;gap:5px}.ttchips span{display:inline-flex;align-items:center;gap:4px;padding:4px 8px 4px 4px;border-radius:999px;background:rgba(124,58,237,.12);font-size:11.5px;font-weight:700}.ttchips .ttlg{width:18px;height:18px}.ttchips small{opacity:.7}
.ttry{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 8px}.ttry button{padding:7px;border-radius:10px;border:1px solid rgba(139,92,246,.45);background:transparent;color:inherit;font:800 12px system-ui}.ttry button[aria-pressed="true"]{background:#7c3aed;color:#fff;border-color:#7c3aed}
.ttros{display:grid;gap:8px;margin-bottom:6px}.ttrg h6{margin:2px 0 4px;font:800 11px var(--display);letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.ttrp{display:grid;grid-template-columns:18px 1fr auto;gap:6px;align-items:center;padding:5px 6px;border-radius:9px;background:rgba(124,58,237,.08);margin-bottom:3px;font-size:12.5px}.ttrp i{font:800 9px system-ui;font-style:normal;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:rgba(139,92,246,.25)}.ttrp b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttrp em{font-style:normal;font-weight:800;text-align:right}.ttrp em small{display:block;font-weight:600;font-size:9.5px;opacity:.65}.ttrp.no{opacity:.55}
.ttwrap{padding-bottom:20px}.tthero{position:relative;overflow:hidden;margin:6px 0 10px;padding:18px 16px;border-radius:18px;color:#fff;background:radial-gradient(120% 140% at 20% 0%,#7c3aed 0%,#312e81 45%,#0b1026 100%);border:1px solid rgba(196,181,253,.45)}
.tthero small{position:relative;display:block;font:800 11px var(--display);letter-spacing:.14em;text-transform:uppercase;color:#c4b5fd}.tthero b{position:relative;display:block;font:800 italic 30px var(--display);margin:2px 0;text-shadow:0 0 18px rgba(196,181,253,.6)}.tthero em{position:relative;font-style:normal;font-size:13px;color:#e0e7ff}
.ttfog{position:absolute;inset:-40%;background:radial-gradient(closest-side,rgba(255,255,255,.18),transparent 70%) 10% 20%/45% 45% no-repeat,radial-gradient(closest-side,rgba(196,181,253,.25),transparent 70%) 70% 60%/55% 55% no-repeat,radial-gradient(closest-side,rgba(56,189,248,.18),transparent 70%) 40% 80%/50% 50% no-repeat;filter:blur(8px);animation:ttfog 18s ease-in-out infinite alternate;pointer-events:none}
@keyframes ttfog{0%{transform:translate(0,0) rotate(0)}50%{transform:translate(6%,-4%) rotate(8deg)}100%{transform:translate(-5%,5%) rotate(-6deg)}}
.ttmod{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px}.ttmod button,.ttyc button{border:1px solid rgba(148,163,184,.3);background:var(--panel,#0b1020);color:inherit;border-radius:10px;padding:9px 6px;font:800 13px var(--display);cursor:pointer}.ttmod [aria-pressed=true],.ttyc [aria-pressed=true]{background:#7c3aed;border-color:#7c3aed;color:#fff}
.ttyc button{padding:5px 8px;font-size:11.5px}.ttyc button:disabled{opacity:.35}.ttyc{display:flex;gap:4px;margin-left:auto}
.ttn{font-size:12.5px;color:var(--muted,#94a3b8);margin:4px 2px 10px;line-height:1.4}.ttn.small{font-size:11px}
.ttsel{border:1px solid rgba(148,163,184,.22);border-radius:14px;overflow:hidden;margin-bottom:12px}.ttrow{display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid rgba(148,163,184,.12)}.ttrow:last-child{border:0}.ttrow>b{font:800 14px var(--display)}
.ttlg{width:24px;height:24px;display:inline-flex;flex:none}.ttlg .badge{width:24px!important;height:24px!important}
.tth{font:800 13px var(--display);letter-spacing:.1em;text-transform:uppercase;color:#c4b5fd;margin:14px 2px 6px}
.ttcla{border:1px solid rgba(148,163,184,.22);border-radius:14px;overflow:hidden}.ttcr{display:grid;grid-template-columns:22px 26px 1fr auto;gap:8px;align-items:center;width:100%;text-align:left;padding:8px 10px;border:0;border-bottom:1px solid rgba(148,163,184,.12);background:none;color:inherit;font:inherit;cursor:pointer}.ttcr:last-child{border:0}
.ttp{font:800 italic 16px var(--display);color:#c4b5fd}.ttnm{font:800 14px var(--display)}.ttnm small{display:block;font:600 11px system-ui;color:var(--muted,#94a3b8)}.tty{font-style:normal;font:800 10px system-ui;padding:1px 6px;border-radius:6px;background:rgba(124,58,237,.25);color:#c4b5fd;margin-left:3px;vertical-align:middle}
.ttd{font:700 11px system-ui;color:var(--muted,#94a3b8);text-align:right}.ttd b{font:800 italic 17px var(--display);color:#fff}.ttd.up{color:#4ade80}.ttd.dn{color:#f87171}
.ttres{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.ttm{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:10px;border:1px solid rgba(148,163,184,.22);background:var(--panel,#0b1020);color:inherit;font:inherit;cursor:pointer}.ttm span{font:800 11px system-ui;color:var(--muted,#94a3b8)}.ttm b{font:800 italic 13px var(--display);margin-left:auto}.ttm em{font:800 10px system-ui;font-style:normal;padding:1px 5px;border-radius:5px}.ttm.w em{background:rgba(34,197,94,.2);color:#4ade80}.ttm.l em{background:rgba(239,68,68,.2);color:#f87171}.ttm.lv em{background:rgba(124,58,237,.25);color:#c4b5fd}
.ttneb{position:relative;overflow:hidden;border-radius:20px;margin:8px 0;padding:14px 12px;color:#fff;background:radial-gradient(120% 90% at 50% 0%,#4c1d95 0%,#1e1b4b 45%,#05040f 100%);border:1px solid rgba(196,181,253,.45);box-shadow:0 0 30px rgba(124,58,237,.35) inset}
.ttneb::after{content:"";position:absolute;inset:0;background:repeating-radial-gradient(circle at 50% 120%,transparent 0 18px,rgba(196,181,253,.05) 19px 20px);animation:ttring 6s linear infinite;pointer-events:none}@keyframes ttring{to{background-position:0 -40px}}
.ttin{position:relative;z-index:1;filter:drop-shadow(0 0 6px rgba(124,58,237,.35))}.ttdt{text-align:center}.ttdt small{display:block;font:800 11px var(--display);letter-spacing:.16em;color:#c4b5fd;text-transform:uppercase}.ttdt b{display:block;font:800 italic 26px var(--display)}.ttdt em{font-style:normal;font-size:12px;color:#c7d2fe}
.ttds{display:flex;align-items:center;justify-content:center;gap:14px;margin:10px 0}.ttds span{display:flex;align-items:center;gap:8px}.ttds b{font:800 italic 30px var(--display)}.ttds i{font:800 13px var(--display);color:#c4b5fd;font-style:normal}.ttds .ttlg,.ttds .ttlg .badge{width:34px!important;height:34px!important}
.ttdg{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ttdc{background:rgba(15,10,40,.55);border:1px solid rgba(196,181,253,.25);border-radius:14px;padding:6px;backdrop-filter:blur(2px)}.ttdc.win{border-color:rgba(74,222,128,.6);box-shadow:0 0 14px rgba(74,222,128,.2)}
.ttdh{display:flex;align-items:center;gap:6px;padding:4px 4px 6px;border-bottom:1px solid rgba(196,181,253,.2);margin-bottom:4px}.ttdh b{font:800 12.5px var(--display)}.ttdh span{margin-left:auto;font:800 italic 16px var(--display)}
.ttpl{display:grid;grid-template-columns:16px 1fr auto;gap:5px;align-items:center;padding:3px 2px;font-size:11.5px}.ttpl i{font:800 9px system-ui;font-style:normal;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:rgba(148,163,184,.2)}.ttpl.cap i{background:#8b5cf6;color:#fff}.ttpl b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttpl em{font-style:normal;font-weight:800}.ttpl em small{font-weight:600;color:#c4b5fd}.ttpl.half{opacity:.7}
@media (prefers-reduced-motion:reduce){.ttfog,.ttneb::after{animation:none}}
`;document.head.appendChild(st);
})();
