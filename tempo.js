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
/* (1217) DRAFT INIZIALE (asta, prima di tutto): TT_DRAFT[squadra] = [[nome, ruolo, crediti pagati], ...] */
window.TT_DRAFT=window.TT_DRAFT||{};
/* (1218) PREZZI DEI DRAFT ANNUALI (asta di rookie e free agent, crediti d'asta): TT_ASTA[anno][giocatore] = crediti. «dopo» = preso dopo il draft.
   Quando c'è il prezzo d'asta di un anno, si usa quello (non lo stipendio della rosa) per pesare le scoperte. */
window.TT_ASTA=window.TT_ASTA||{};
TT_ASTA[3]=Object.assign(TT_ASTA[3]||{},{"Mikel Brown Jr.":30,"Keaton Wagler":36,"Caleb Wilson":242,"Aday Mara":50,"Cameron Boozer":242,"Yaxel Lendeborg":64,"AJ Dybantsa":242,"Darryn Peterson":242,"Morez Johnson Jr.":54,"Kingston Flemings":7,"Brayden Burries":7,"Trevon Brazile":14,"Darius Acuff Jr.":100,"Hannes Steinbach":40,"Allen Graves":14,"Sergio De Larrea":15});
/* draft 2025 (25/26): prezzi d'asta dei rookie principali */
TT_ASTA[2]=Object.assign(TT_ASTA[2]||{},{"Cooper Flagg":600,"Dylan Harper":250,"Ace Bailey":250,"VJ Edgecombe":200,"Kon Knueppel":30});
window.TT_ASTA_DOPO=Object.assign(window.TT_ASTA_DOPO||{},{3:["Trevon Brazile","Allen Graves","Sergio De Larrea"]});
/* chi ha scelto il rookie al draft, se poi è stato scambiato: la scoperta va a chi lo ha scelto */
window.TT_ASTA_CHI=Object.assign(window.TT_ASTA_CHI||{},{3:{"Allen Graves":"DUC","Hannes Steinbach":"DUC","Morez Johnson Jr.":"DUC"}});
/* crediti passati di mano negli scambi (contano nel voto «Scambi»): {da, a, cr, nota} */
window.TT_CR_SCAMBI=Object.assign(window.TT_CR_SCAMBI||{},{3:[{da:"DUC",a:"MOO",cr:300,nota:"Scottie Barnes ai Ducks; Graves, Steinbach, Morez Johnson Jr. e 300 crediti ai Mooses"}]});
window.TT_ASTA_NOTE=Object.assign(window.TT_ASTA_NOTE||{},{3:{"Sergio De Larrea":"dopo il draft · 30 cr come speciale, conta 15"}});
Object.assign(TT_DRAFT,{"DUC":[["Nikola Jokic","C",76],["Jusuf Nurkic","C",3],["Donovan Clingan","C",3],["Victor Wembanyama","F",76],["Jalen Johnson","F",60],["Brandon Miller","F",9],["Jeremy Sochan","F",4],["Michael Porter Jr.","F",2],["Cade Cunningham","G",42],["Jamal Murray","G",5],["Fred VanVleet","G",5],["Jordan Poole","G",3],["Bennedict Mathurin","G",null]],
 "SPI":[["Joel Embiid","C",43],["Nikola Vucevic","C",12],["Mark Williams","C",10],["LeBron James","F",26],["Giannis Antetokounmpo","F",68],["Jonathan Kuminga","F",1],["Jabari Smith Jr.","F",8],["Franz Wagner","F",18],["Donovan Mitchell","G",26],["Ja Morant","G",53],["Kyrie Irving","G",27],["Devin Vassell","G",2],["Dalton Knecht","G",3]],
 "DOL":[["Jarrett Allen","C",34],["Zach Edey","C",12],["Yves Missi","C",1],["Scottie Barnes","F",58],["Pascal Siakam","F",33],["Kevin Durant","F",22],["Tari Eason","F",2],["Santi Aldama","F",1],["Luka Doncic","G",72],["Anthony Edwards","G",54],["Coby White","G",8],["Amen Thompson","G",1],["Bub Carrington","G",1]],
 "EAG":[["Anthony Davis","C",50],["Jalen Duren","C",42],["Rudy Gobert","C",20],["DeMar DeRozan","F",5],["Jaylen Brown","F",16],["Zaccharie Risacher","F",6],["Jaren Jackson Jr.","F",24],["De'Aaron Fox","G",45],["Stephen Curry","G",17],["Jalen Brunson","G",31],["Derrick White","G",4],["Dejounte Murray","G",33]],
 "PEA":[["Alperen Sengun","C",61],["Bam Adebayo","C",50],["Nic Claxton","C",3],["Paolo Banchero","F",81],["Paul George","F",5],["Mikal Bridges","F",3],["John Collins","F",5],["Andrew Wiggins","F",1],["Trae Young","G",66],["Bradley Beal","G",1],["Dyson Daniels","G",1],["Jared McCain","G",1]],
 "TUR":[["Chet Holmgren","C",62],["Jakob Poeltl","C",10],["Deandre Ayton","C",6],["Lauri Markkanen","F",42],["Brandon Ingram","F",24],["Kristaps Porzingis","F",5],["Miles Bridges","F",18],["Keegan Murray","F",9],["Tyrese Maxey","G",35],["Shai Gilgeous-Alexander","G",64],["Damian Lillard","G",12],["Chris Paul","G",3]],
 "FOX":[["Domantas Sabonis","C",67],["Ivica Zubac","C",13],["Alex Sarr","C",3],["Jayson Tatum","F",69],["Julius Randle","F",30],["Jimmy Butler","F",8],["Josh Hart","F",11],["Cameron Johnson","F",2],["Devin Booker","G",45],["Darius Garland","G",44],["Josh Giddey","G",4],["Austin Reaves","G",2]],
 "MOO":[["Karl-Anthony Towns","C",43],["Walker Kessler","C",9],["Dereck Lively II","C",3],["Jalen Williams","F",36],["Zion Williamson","F",17],["Evan Mobley","F",51],["RJ Barrett","F",22],["Trey Murphy III","F",1],["Tyrese Haliburton","G",52],["James Harden","G",21],["Jalen Green","G",1],["Tyler Herro","G",16],["LaMelo Ball","G",42]]});
/* 2° anno 2025/26 (arrivano una alla volta) */
Object.assign(TT_ROSE[2],{"SPI":[["Ja Morant","G"],["Donovan Mitchell","G"],["Stephon Castle","G"],["VJ Edgecombe","G"],["Kyrie Irving","G"],["LeBron James","F"],["Franz Wagner","F"],["Lauri Markkanen","F"],["Giannis Antetokounmpo","F"],["Jonathan Kuminga","F"],["Joel Embiid","C"],["Nikola Vucevic","C"],["Mark Williams","C"],["Khaman Maluach","C"]],"FOX":[["Devin Booker","G"],["Josh Giddey","G"],["Austin Reaves","G"],["Desmond Bane","G"],["Ryan Rollins","G"],["Paolo Banchero","F"],["Jayson Tatum","F"],["Jimmy Butler","F"],["Josh Hart","F"],["Kawhi Leonard","F"],["Domantas Sabonis","C"],["Ivica Zubac","C"],["Yves Missi","C"]],"EAG":[["Stephen Curry","G"],["Jalen Brunson","G"],["Dejounte Murray","G"],["De'Aaron Fox","G"],["Keyonte George","G"],["Jamal Murray","G"],["Pascal Siakam","F"],["Deni Avdija","F"],["Jaylen Brown","F"],["Kristaps Porzingis","F"],["Miles Bridges","F"],["Anthony Davis","C"],["Jalen Duren","C"],["Jakob Poeltl","C"],["Yang Hansen","C"],["Jusuf Nurkic","C"]],"TUR":[["Shai Gilgeous-Alexander","G"],["Darius Garland","G"],["Tre Johnson","G"],["Dylan Harper","G"],["Jalen Green","G"],["Kasparas Jakucionis","G"],["Ace Bailey","F"],["Chet Holmgren","F"],["Jabari Smith Jr.","F"],["Cam Whitmore","F"],["Brandon Miller","F"],["Zaccharie Risacher","F"],["Donovan Clingan","C"],["Alex Sarr","C"],["Derik Queen","C"]],"MOO":[["LaMelo Ball","G"],["Tyler Herro","G"],["Payton Pritchard","G"],["Andrew Nembhard","G"],["James Harden","G"],["Tyrese Haliburton","G"],["Jalen Williams","F"],["Evan Mobley","F"],["Zion Williamson","F"],["Trey Murphy III","F"],["Andrew Wiggins","F"],["Karl-Anthony Towns","C"],["Walker Kessler","C"],["Rudy Gobert","C"]],"DUC":[["Cade Cunningham","G"],["Anthony Edwards","G"],["Derrick White","G"],["Immanuel Quickley","G"],["Kon Knueppel","G"],["Isaiah Collier","G"],["Kyshawn George","G"],["Cedric Coward","G"],["Victor Wembanyama","F"],["Jalen Johnson","F"],["Michael Porter Jr.","F"],["Brandon Ingram","F"],["Matas Buzelis","F"],["Nikola Jokic","C"],["Kel'el Ware","C"],["Deandre Ayton","C"],["Onyeka Okongwu","C"]],"DOL":[["Luka Doncic","G"],["Amen Thompson","G"],["De'Aaron Fox","G"],["Egor Demin","G"],["Shaedon Sharpe","G"],["Kevin Durant","F"],["Scottie Barnes","F"],["Julius Randle","F"],["Aaron Gordon","F"],["Collin Murray-Boyles","F"],["Jaren Jackson Jr.","F"],["Jarrett Allen","C"],["Bam Adebayo","C"],["Jakob Poeltl","C"]],"PEA":[["Trae Young","G"],["Tyrese Maxey","G"],["Dyson Daniels","G"],["Ausar Thompson","G"],["Jeremiah Fears","G"],["Cooper Flagg","F"],["Moussa Diabate","F"],["Jaime Jaquez Jr.","F"],["RJ Barrett","F"],["Danny Wolf","F"],["Alperen Sengun","C"],["Isaiah Hartenstein","C"],["Zach Edey","C"]]});
/* 1° anno 2024/25 (Walruses→Mooses, Sharks→Spiders, Cats→Turtles, Dolphins→Peacocks, Predators→Dolphins) */
if(!Object.keys(TT_ROSE[1]).length)TT_ROSE[1]={"MOO":[["Tyrese Haliburton","G"],["LaMelo Ball","G"],["Karl-Anthony Towns","C"],["Evan Mobley","F"],["Jalen Williams","F"],["Damian Lillard","G"],["Tyler Herro","G"],["Jalen Green","G"],["Zion Williamson","F"],["RJ Barrett","F"],["Trey Murphy III","F"],["Jakob Poeltl","C"],["Walker Kessler","C"]],"FOX":[["Devin Booker","G"],["Josh Hart","G"],["Jayson Tatum","F"],["Domantas Sabonis","C"],["Ivica Zubac","C"],["Darius Garland","G"],["Josh Giddey","G"],["Austin Reaves","G"],["Jimmy Butler","G"],["Julius Randle","F"],["Aaron Gordon","F"],["Cameron Johnson","F"],["Alex Sarr","C"]],"EAG":[["Stephen Curry","G"],["Jalen Brunson","G"],["Jaren Jackson Jr.","F"],["Anthony Davis","C"],["Jalen Duren","C"],["De'Aaron Fox","G"],["Derrick White","G"],["Dejounte Murray","G"],["Jaylen Brown","F"],["Kyle Kuzma","F"],["Zaccharie Risacher","F"],["Deni Avdija","F"],["Rudy Gobert","C"]],"SPI":[["Donovan Mitchell","G"],["Ja Morant","G"],["Joel Embiid","C"],["LeBron James","F"],["Giannis Antetokounmpo","F"],["Kyrie Irving","G"],["Devin Vassell","G"],["Dalton Knecht","G"],["Franz Wagner","F"],["Jabari Smith Jr.","F"],["Jonathan Kuminga","F"],["Nikola Vucevic","C"],["Mark Williams","C"]],"DUC":[["Cade Cunningham","G"],["Amen Thompson","G"],["Nikola Jokic","C"],["Victor Wembanyama","F"],["Jalen Johnson","F"],["Ausar Thompson","G"],["Jamal Murray","G"],["Jordan Poole","G"],["Brandon Miller","F"],["Jeremy Sochan","F"],["Michael Porter Jr.","F"],["Kel'el Ware","C"],["Isaiah Hartenstein","C"]],"TUR":[["Shai Gilgeous-Alexander","G"],["Tyrese Maxey","G"],["Chet Holmgren","C"],["Lauri Markkanen","F"],["Kristaps Porzingis","F"],["Desmond Bane","G"],["Bennedict Mathurin","G"],["Cam Thomas","G"],["Miles Bridges","F"],["Brandon Ingram","F"],["Keegan Murray","F"],["Deandre Ayton","C"],["Dereck Lively II","C"]],"PEA":[["Trae Young","G"],["Paolo Banchero","F"],["Pascal Siakam","F"],["Bam Adebayo","C"],["Alperen Sengun","C"],["Bradley Beal","G"],["Coby White","G"],["Fred VanVleet","G"],["Bub Carrington","G"],["John Collins","F"],["Andrew Wiggins","F"],["Paul George","F"],["Nic Claxton","C"]],"DOL":[["Luka Doncic","G"],["Anthony Edwards","G"],["Jarrett Allen","C"],["Scottie Barnes","F"],["Kevin Durant","F"],["James Harden","G"],["Jared McCain","G"],["Dyson Daniels","G"],["Tari Eason","F"],["Jaime Jaquez Jr.","F"],["DeMar DeRozan","F"],["Zach Edey","C"],["Yves Missi","C"]]};
/* (1216) STAGIONI AUTOMATICHE: la stagione in corso si ricava da STAGIONE_CORRENTE (26/27 = 3° anno, 27/28 = 4°…).
   Le rose degli anni passati: 1° e 2° anno scritte qui (TT_ROSE), dal 3° in poi dall'archivio automatico tempo-archivio.js (TT_ARCH),
   che un'azione GitHub aggiorna ogni giorno: rosa della stagione (fotografata fino alla fine dei playoff, quindi con tutte le trade)
   e, a regular season finita, calendario e PDK di ogni turno, così una stagione passata si può rigiocare «a ritroso» con qualsiasi rosa. */
const SNOW=(()=>{try{const m=String(STAGIONE_CORRENTE).match(/(\d\d)/);return m?+m[1]-23:3}catch(e){return 3}})();
const ARCH=window.TT_ARCH||{};
const YL=y=>+y===SNOW?"Oggi":+y===0?"Draft":`${+y+23}/${+y+24}`,YLs=y=>+y===SNOW?"oggi":+y===0?"draft":YL(y),SLAB=y=>`20${+y+23}/${+y+24}`;
const rosList=(t,y)=>{y=+y;if(y===SNOW)return(ROSTER[t]||[]).map(x=>[x[0],x[2]]);if(y===0)return TT_DRAFT[t]?TT_DRAFT[t].map(x=>[x[0],x[1]]):null;return(TT_ROSE[y]&&TT_ROSE[y][t])||(ARCH[y]&&ARCH[y].rose&&ARCH[y].rose[t])||null};
const YS=()=>{const L=[];if(Object.keys(window.TT_DRAFT||{}).length)L.push(0);for(let y=1;y<=SNOW;y++){if(y===SNOW||Object.keys(TT_ROSE[y]||(ARCH[y]&&ARCH[y].rose)||{}).length)L.push(y)}return L};
const CAMPI=()=>[SNOW,...Object.keys(ARCH).map(Number).filter(y=>y<SNOW&&ARCH[y].acc&&ARCH[y].turni&&ARCH[y].turni.length).sort((a,b)=>b-a)];
const live=()=>!TT.camp||TT.camp===SNOW,DEFY=()=>live()?SNOW:TT.camp,CA=()=>ARCH[TT.camp]||{},OFF=()=>live()?DR_OFF:(CA().off||0);
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const TT=window.TT={mode:"lega",sel:{},entries:[],view:null,camp:0};
const rosa=(t,y)=>+y===SNOW&&live()?{real:t}:rosList(t,y);/* squadre di oggi = punteggio vero di Dreamers (rosa e formazione di quel turno) */
const has=(t,y)=>{const r=rosa(t,y);return!!(r&&(r.real||r.length))};
const tag=(t,y)=>`${TEAMS[t].nick}${+y===SNOW&&live()?"":` <i class="tty">${YL(y)}</i>`}`;
/* migliori PDK del turno k per TUTTI i giocatori NBA: notti ufficiali Dreamers (con le correzioni) e, per chi non è nelle rose di oggi, tabellini Dynasty TV */
const ACC={};
/* (1627) GIORNATE 1-2 (giocate su Dunkest prima dell'app): non ci sono formazioni né punteggi per giornata, ma ci sono i tabellini di quelle notti.
   Quando una lega simulata non può usare i risultati veri (rose del passato, Lega a 8), le giornate 1-2 si ricostruiscono dai tabellini con il calendario
   vero di Dunkest (DR_DK[0], DR_DK[1]): giornata 1 = notti 20-22/10, giornata 2 = 23-24/10. Così tutte le squadre giocano le stesse partite. */
const G12={"-1":["2026-10-20","2026-10-22"],"0":["2026-10-23","2026-10-24"]};
function acc(k){if(k<=0&&G12[k]){if(ACC[k])return ACC[k];const A={},N=drNotti(),[a,b]=G12[k];const put=(n,v)=>{const x=tvNm(n);if(A[x]==null||v>A[x])A[x]=v};
  for(let d=a;d<=b;d=drAdd(d,1)){const o=N[d]||{},seen=new Set();for(const n in o){const v=typeof o[n]==="number"?o[n]:null;if(v!=null){put(n,v);seen.add(tvNm(n))}}for(const g of(TV.days[d]||[])){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;for(const sd of["a","h"])for(const r of B[sd]||[]){const x=tvNm(r[0]);if(seen.has(x))continue;if(String(r[2]||"0")==="0:00")continue;put(r[0],+r[19]||0)}}}
  return ACC[k]={key:"g12",A,W:{closed:true,started:true,start:a,end:b}}}
 if(!live())return{A:(CA().acc||{})[k]||{},W:{closed:true,started:true}};const W=drWeek(k),key=k+"|"+W.closed+"|"+(W.nights||0);if(ACC[k]&&ACC[k].key===key)return ACC[k];const A={},N=drNotti();
 const put=(n,v)=>{const x=tvNm(n);if(A[x]==null||v>A[x])A[x]=v};
 for(let d=W.start;d<=W.end;d=drAdd(d,1)){const o=N[d]||{},seen=new Set();for(const n in o){const v=typeof o[n]==="number"?o[n]:null;if(v!=null){put(n,v);seen.add(tvNm(n))}}
  for(const g of (TV.days[d]||[])){const B=g[7]&&TV.box[g[7]];if(!B||g[5]==="S")continue;for(const sd of["a","h"])for(const r of B[sd]||[]){const x=tvNm(r[0]);if(seen.has(x))continue;if(String(r[2]||"0")==="0:00")continue;put(r[0],+r[19]||0)}}}
 return ACC[k]={key,A,W}}
/* (1216) LEGA A 8: contano 8 giocatori (3 G, 3 A, 2 C; i primi 6 pieni con il capitano ×1,5, 7° e 8° a metà), tribuna minima 5.
   Anche le squadre di oggi sono simulate a 8, con la rosa vera di quel turno (titolari + riserve). */
const F8=()=>TT.mode==="lega8",Q8={G:3,F:3,C:2};
function score(k,R){if(k<=0&&R&&R.real){const F=drForm(1)[R.real];R=F&&(F.t.length+F.r.length)?[...F.t,...F.r].map(n=>[n,ruoloDi(n)||"F"]):(ROSTER[R.real]||[]).map(x=>[x[0],x[2]])}/* giornate 1-2 rigiocate con le regole Dreamers: la rosa vera è quella del 1° turno Dreamers */if(R&&R.real&&F8()){const F=drForm(k)[R.real]||{t:[],r:[]};R=[...F.t,...F.r].map(n=>[n,ruoloDi(n)||"F"])}
 if(R&&R.real){const W=drWeek(k),T=drTeam(k,R.real,W);return{top:T.top.map(x=>({n:x.n,r:x.r,e:x.e,m:x.m})),score:T.score||0,played:T.played,closed:W.closed,started:W.started}}const{A,W}=acc(k);if(!R)return null;
 const pool=R.map(([n,r],i)=>({n,r:r==="A"?"F":r,i,e:A[tvNm(n)]??null}));
 const key=x=>x.e==null?-1e9:x.e,ord=(p,q)=>key(q)-key(p)||p.i-q.i;let sel=[];
 for(const r of["G","F","C"])sel.push(...pool.filter(x=>x.r===r).sort(ord).slice(0,(F8()?Q8:DR_QUOTE)[r]));
 sel.sort(ord);let a=sel.slice(0,5),b=sel.slice(5);
 for(const r of["C","F","G"]){if(a.some(x=>x.r===r))continue;const up=b.find(x=>x.r===r);if(!up)continue;const cnt=x=>a.filter(y=>y.r===x.r).length,down=[...a].reverse().find(x=>cnt(x)>1);if(!down)continue;a=a.filter(x=>x!==down).concat(up).sort(ord);b=b.filter(x=>x!==up).concat(down).sort(ord)}
 const top=[...a,...b];top.forEach((x,i)=>{x.m=i===0?1.5:i>=6?.5:1;x.f=(x.e||0)*x.m});
 const played=top.filter(x=>x.e!=null).length;return{top,score:top.reduce((s,x)=>s+x.f,0),played,closed:W.closed,started:W.started}}
const turni=()=>{if(!live())return(CA().turni||[]).slice();const L=[];for(let k=1;k<=DR_REG;k++){const W=drWeek(k);if(W.closed||W.started)L.push(k)}return L};
/* --- LEGA: 8 franchigie, calendario vero --- */
function lega(){const T=Object.keys(TEAMS),y=t=>(TT.sel[t]??DEFY()),S={};T.forEach(t=>S[t]={t,y:y(t),w:0,l:0,pf:0,pa:0,res:[]});
 /* (1629) le giornate 1-2 si rigiocano SEMPRE con le regole Dreamers (formazione ottimizzata sui migliori PDK), anche con tutte le squadre vere: niente risultati Dunkest */
 const g12=live()&&TT.g12!==false;
 for(const k of[...(g12?[-1,0]:[]),...turni()]){const pairs=k<=0?DR_DK[k+1]:((live()?DR_SCHED:(CA().sched||[]))[k-1]||[]);for(const[a,b]of pairs){const A=score(k,rosa(a,y(a))),B=score(k,rosa(b,y(b)));if(!A||!B)continue;const W=acc(k).W;
  S[a].pf+=A.score;S[a].pa+=B.score;S[b].pf+=B.score;S[b].pa+=A.score;if(W.closed){if(A.score>=B.score){S[a].w++;S[b].l++}else{S[b].w++;S[a].l++}}S[a].res.push({k,o:b,me:A.score,vs:B.score,fin:W.closed});S[b].res.push({k,o:a,me:B.score,vs:A.score,fin:W.closed})}}
 /* parte dalla stessa base di Dreamers (giornate 1-2 Dunkest) *//* (1623) le giornate 1-2 (giocate su Dunkest prima dell'app) si possono aggiungere solo se TUTTE le squadre sono quelle vere di quella stagione:
    una rosa del passato non ha quei risultati, e non può ereditare quelli della rosa vera. Altrimenti la lega parte per tutti dalla 3ª giornata. */
 try{if(!live()&&T.every(t=>S[t].y===TT.camp)){const BA=CA().base||{};for(const t of T){const b=BA[t];if(b){S[t].w+=b.w;S[t].l+=b.l;S[t].pf+=b.pf;S[t].pa+=b.pa}}}}catch(e){}
 return Object.values(S).sort((p,q)=>q.w-p.w||q.pf-p.pf)}
function somma(){return TT.entries.map(([t,y],i)=>{let tot=0,n=0;const res=[];for(const k of[...(live()?[-1,0]:[]),...turni()]){const s=score(k,rosa(t,y));if(!s)continue;tot+=s.score;n++;res.push({k,v:s.score,fin:s.closed})}return{i,t,y,tot,n,avg:n?tot/n:0,res}}).sort((p,q)=>q.tot-p.tot)}
const reale=()=>{if(!live())return CA().reale||[];try{return drStand().map(x=>x.t)}catch(e){return[]}};
/* --- grafica --- */
const lg=t=>`<span class="ttlg">${badge(t)}</span>`;
function yearChips(t){return`<span class="ttyc">${YS().map(y=>`<button data-tt="y|${t}|${y}" aria-pressed="${((TT.sel[t]??DEFY()))===y}"${has(t,y)?"":" disabled"}>${YL(y)}</button>`).join("")}</span>`}
function campoSel(){const C=CAMPI();if(C.length<2)return"";return`<div class="ttcamp"><small>Stagione giocata</small>${C.map(y=>`<button data-tt="camp|${y}" aria-pressed="${(TT.camp||SNOW)===y}">${SLAB(y)}${y===SNOW?" · in corso":""}</button>`).join("")}</div>`}
function vLega(){const L=lega(),R=reale();
 return`${F8()?`<p class="ttn"><b>Lega a 8:</b> come Dreamers ma contano solo <b>8 giocatori</b> (3 guardie, 3 ali, 2 centri): i primi 6 pieni con il capitano ×1,5, il 7° e l’8° a metà. La tribuna diventa di almeno 5: chi oggi non gioca più pesa molto meno, come se la squadra lo avesse sostituito. Anche le squadre di oggi sono simulate a 8.</p>`:""}${campoSel()}<p class="ttn">«E se fossi rimasto con quella squadra?» Scegli per ogni franchigia con quale rosa gioca: i giocatori di quella rosa fanno i PDK veri di questa stagione, turno per turno. Anche le giornate 1-2 (giocate su Dunkest prima dell'app) si rigiocano con le regole Dreamers, con i tabellini di quelle notti (20-22 e 23-24 ottobre) e gli scontri diretti veri: tutte le squadre giocano le stesse partite. Calendario e PDK: stagione ${SLAB(TT.camp||SNOW)}${live()?" (in corso)":""}.</p>
 <div class="ttsel">${Object.keys(TEAMS).map(t=>`<div class="ttrow">${lg(t)}<b>${TEAMS[t].nick}</b>${yearChips(t)}</div>`).join("")}</div>
 <div class="tth">Classifica «come sarebbe andata»</div>
 <div class="ttcla">${L.map((x,i)=>{const r=R.indexOf(x.t)+1,d=r?r-(i+1):0;return`<button class="ttcr" data-tt="team|${x.t}">${`<b class="ttp">${i+1}</b>`}${lg(x.t)}<span class="ttnm">${tag(x.t,x.y)}<small>${x.w}-${x.l} · ${f1(x.pf)} PDK</small></span><span class="ttd ${d>0?"up":d<0?"dn":""}">${r?`realtà ${r}°`:""}${d?` (${d>0?"+":""}${d})`:""}</span></button>`}).join("")}</div>
 ${TT.team?vTeamRes(L.find(x=>x.t===TT.team)):""}
 ${shBtn("cla","Condividi la classifica")}`}
/* (1213) rose consultabili: dalla scheda squadra si vedono le rose di tutti e tre gli anni, con PDK medi e partite di questa stagione */
let MED=null;function med(){if(MED&&MED.n===Object.keys(TV.box).length)return MED.m;const m={};for(const id in TV.box){const B=TV.box[id];for(const sd of["a","h"])for(const r of B[sd]||[]){if(String(r[2]||"0")==="0:00")continue;const x=tvNm(r[0]);(m[x]=m[x]||{s:0,g:0});m[x].s+=+r[19]||0;m[x].g++}}MED={n:Object.keys(TV.box).length,m};return m}
function roseOf(t,y){return rosList(t,y)||[]}
function vRosa(t,y0){const y=TT.rv&&TT.rv[t]!=null?TT.rv[t]:y0,R=roseOf(t,y),M=med(),RN={G:"Guardie",F:"Ali",C:"Centri"};
 const grp=r=>{const L=R.map(([n,q])=>({n,r:q==="A"?"F":q,m:M[tvNm(n)]})).filter(x=>x.r===r).sort((a,b)=>(b.m?b.m.s/b.m.g:-1)-(a.m?a.m.s/a.m.g:-1));
  return L.length?`<div class="ttrg"><h6>${RN[r]}</h6>${L.map(x=>`<div class="ttrp${x.m?"":" no"}"><i>${r==="F"?"A":r}</i><b>${E(x.n)}</b><em>${x.m?f1(x.m.s/x.m.g):"—"}<small>${x.m?x.m.g+" p":"non gioca"}</small></em></div>`).join("")}</div>`:""};
 return`<div class="tth">Rosa ${TEAMS[t].nick}</div><div class="ttry">${YS().map(k=>`<button data-tt="rv|${t}|${k}" aria-pressed="${+y===k}">${YL(k)}</button>`).join("")}</div>
 ${R.length?`<div class="ttros">${grp("G")}${grp("F")}${grp("C")}</div><p class="ttn small">PDK medi e partite di questa stagione. «Non gioca» = nessuna partita quest'anno: nella Macchina del tempo conta 0.</p>`:`<p class="ttn small">Rosa non caricata.</p>`}`}
function vTeamRes(x){if(!x)return"";return`${vRosa(x.t,x.y)}<div class="tth">${tag(x.t,x.y)} · turno per turno</div><div class="ttres">${x.res.map(r=>`<button class="ttm ${r.fin?(r.me>=r.vs?"w":"l"):"lv"}" data-tt="duel|${r.k}|${x.t}|${x.y}|${r.o}|${(TT.sel[r.o]??DEFY())}"><span>T${r.k+OFF()}</span>${lg(r.o)}<b>${f1(r.me)}–${f1(r.vs)}</b><em>${r.fin?(r.me>=r.vs?"V":"P"):"live"}</em></button>`).join("")}</div>`}
/* ---------- (1215) ANALISI · la rubrica della Macchina del tempo: come sono cambiate le franchigie tra 24/25, 25/26 e oggi.
   Metro unico per tutti gli anni = i PDK veri di QUESTA stagione (stessa misura per tutte le rose). ---------- */
const YN=new Proxy({},{get:(o,y)=>YLs(y)});
let NAS=null;const nasc=n=>{if(!NAS){NAS={};try{for(const k in NASCITA)NAS[tvNm(k)]=NASCITA[k]}catch(e){}}return NAS[tvNm(n)]||null};
const etaY=(n,y)=>{const d=nasc(n);if(!d)return null;return(Date.now()-new Date(d+"T00:00:00Z"))/(365.25*864e5)-(SNOW-(+y||.6))};/* il draft è dell'estate 2024, pochi mesi prima del 24/25 */
const pmed=n=>{const m=med()[tvNm(n)];return m?{v:m.s/m.g,g:m.g}:null};
const dove=n=>{const x=tvNm(n);for(const t in ROSTER)if((ROSTER[t]||[]).some(p=>tvNm(p[0])===x))return t;return null};
const vo=t=>/^([AEIOU]|S[^aeiou]|Z)/i.test(TEAMS[t].nick),ART=(p,t)=>({i:vo(t)?"gli":"i",ai:vo(t)?"agli":"ai",dai:vo(t)?"dagli":"dai",con:vo(t)?"con gli":"con i"})[p]+" "+TEAMS[t].nick;
const pc=v=>(v>0?"+":"")+Math.round(v)+"%";
const nomi=L=>L.length?L.map(x=>`<b>${E(x.n)}</b>${x.p?` (${f1(x.p.v)})`:""}`).join(", "):"nessuno";
const lista=a=>a.length<=1?a.join(""):a.slice(0,-1).join(", ")+" e "+a[a.length-1];
let AN=null;
function analisiData(){const sv=TT.camp,s8=TT.mode;TT.camp=SNOW;if(s8==="lega8")TT.mode="analisi";try{return analisiData0()}finally{TT.camp=sv;TT.mode=s8}}
function analisiData0(){const key=turni().join(",")+"|"+Object.keys(TV.box).length+"|"+JSON.stringify(Object.keys(ROSTER).map(t=>(ROSTER[t]||[]).length));if(AN&&AN.key===key)return AN;const Y=YS(),FY=Y[0];
 const T=Object.keys(TEAMS),K=turni().filter(k=>drWeek(k).closed),V=[];
 const forza=(t,y,R)=>{let s=0,n=0;for(const k of K){const x=score(k,R||rosa(t,y));if(!x)continue;s+=x.score;n++}return n?s/n:0};
 const F={};for(const t of T){F[t]={};for(const y of Y){if(!has(t,y))continue;const R=roseOf(t,y).map(([n,r])=>({n,r:r==="A"?"F":r,p:pmed(n),e:etaY(n,y)}));
   const val=R.filter(x=>x.p).sort((a,b)=>b.p.v-a.p.v),top=val.slice(0,10),et=top.filter(x=>x.e!=null);
   F[t][y]={t,y,R,f:forza(t,y),top,eta:et.length?et.reduce((s,x)=>s+x.e,0)/et.length:null,zero:R.filter(x=>!x.p)};V.push(F[t][y])}}
 V.sort((a,b)=>b.f-a.f);V.forEach((x,i)=>x.rk=i+1);
 /* movimenti tra un anno e l'altro */
 const mov=(t,a,b)=>{const A=F[t][a],B=F[t][b];if(!A||!B)return null;const sa=new Set(A.R.map(x=>tvNm(x.n))),sb=new Set(B.R.map(x=>tvNm(x.n)));
  const by=(L)=>L.sort((p,q)=>(q.p?q.p.v:-1)-(p.p?p.p.v:-1));return{in:by(B.R.filter(x=>!sa.has(tvNm(x.n)))),out:by(A.R.filter(x=>!sb.has(tvNm(x.n)))),stay:by(B.R.filter(x=>sa.has(tvNm(x.n))))}};
 const M={};for(const t of T){M[t]={};Y.forEach((y,i)=>{if(i)M[t][Y[i-1]+"-"+y]=mov(t,Y[i-1],y)});M[t].tot=mov(t,FY,SNOW)}
 /* rosa «di sempre»: il meglio delle tre rose della franchigia */
 const ALL={};for(const t of T){const seen=new Set(),U=[];for(const y of[...Y].reverse())for(const[n,r]of roseOf(t,y)){const x=tvNm(n);if(seen.has(x))continue;seen.add(x);U.push([n,r])}ALL[t]={R:U,f:forza(t,0,U)};
   const best=U.map(([n,r])=>({n,r:r==="A"?"F":r,p:pmed(n)})).filter(x=>x.p).sort((a,b)=>b.p.v-a.p.v);ALL[t].best=best}
 /* fedelissimi e giramondo */
 const giro={};for(const t of T)for(const y of Y)for(const[n]of roseOf(t,y)){const x=tvNm(n);(giro[x]=giro[x]||{n,t:new Set(),y:[]}).t.add(t);giro[x].y.push([y,t])}
 const fede=[];if(Y.length>=3)for(const t of T){const L=Y.map(y=>F[t][y]);if(L.some(x=>!x))continue;const S=L.slice(1).map(z=>new Set(z.R.map(x=>tvNm(x.n))));L[0].R.forEach(x=>{if(S.every(q=>q.has(tvNm(x.n))))fede.push({t,n:x.n,p:x.p})})}
 const viaggi=Object.values(giro).filter(x=>x.t.size>=3).map(x=>({...x,p:pmed(x.n)})).sort((a,b)=>b.t.size-a.t.size||(b.p?b.p.v:0)-(a.p?a.p.v:0));
 return AN={key,T,F,V,M,ALL,fede,viaggi,K,Y,FY}}
function verdetto(d){return d>=15?["🚀","Rinascita"]:d>=5?["📈","In crescita"]:d>-5?["⚖️","Stabile"]:d>-15?["📉","In calo"]:["🧨","Crollo"]}
function forma(L){if(L.length<2)return"";const up=L.slice(1).map((x,i)=>x.f>=L[i].f);if(up.every(Boolean))return"sempre in salita";if(!up.some(Boolean))return"in discesa anno dopo anno";const pk=L.reduce((a,b)=>b.f>a.f?b:a);return pk.y===SNOW?"con alti e bassi, ma oggi è il punto più alto":`con alti e bassi: il picco resta il ${YL(pk.y)}`}
/* (1216) PAGELLA DEI GM: le mosse di ogni franchigia nelle due estati (24/25→25/26 e 25/26→oggi), saldo di mercato, direzione presa e voto */
const rk10=F=>new Set(F.top.map(x=>tvNm(x.n)));
function estate(t,D,a,b){const A=D.F[t][a],B=D.F[t][b],m=D.M[t][a+"-"+b];if(!A||!B||!m)return null;
 const tA=rk10(A),tB=rk10(B),pv=x=>x.p?x.p.v:0;
 const inn=m.in.filter(x=>tB.has(tvNm(x.n))),out=m.out.filter(x=>tA.has(tvNm(x.n)));
 const saldo=inn.reduce((s,x)=>s+pv(x),0)-out.reduce((s,x)=>s+pv(x),0);
 const giov=m.in.filter(x=>x.e!=null&&x.e<22.5&&x.p).length;
 const best=inn.slice().sort((p,q)=>pv(q)-pv(p))[0]||null,lost=out.slice().sort((p,q)=>pv(q)-pv(p))[0]||null;
 return{a,b,in:m.in,out:m.out,inn,out10:out,saldo,giov,best,lost,df:(B.f/A.f-1)*100,stay:m.stay.length}}
/* ---------- (1623) TESTI DELL'ANALISI: tutti sul valore dei giocatori nel tempo (permanenze) ---------- */
const nomiS=L=>L.map(x=>`<b>${E(x.n)}</b>`).join(", ").replace(/, ([^,]*)$/," e $1"),mig=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,"."),r0=x=>mig(Math.round(x/10)*10),crs=v=>`${v>=0?"+":"−"}${mig(Math.round(Math.abs(v)/10)*10)}`;
const quando=y=>y===0?"all'asta":y===SNOW?"quest'anno":`nel ${YL(y)}`;
function dopoAltrove(x){/* cosa ha dato un giocatore DOPO essere stato ceduto: PDK prodotti altrove + valore di oggi */if(x.a==null)return null;let p=0;for(let s=x.a;s<=SNOW;s++)p+=resa(x.n,s);return p*pvFit().a+pvOggi(x.n)}
function mossaTxt(x,t,full){/* valori in punti della scala della lega; per i giocatori dell'asta anche il prezzo pagato e il prezzo giusto col senno di poi (crediti d'asta) */
 const pre=x.pre&&x.pre.g>=15&&x.da>0?`, ${f1(x.pre.p)} PDK`:x.rk?", da rookie":x.pre&&x.pre.g<15&&x.da>0?", da infortunato":"";
 const pn=x.a==null?stat(x.n,SNOW):null,fine=x.a!=null?`ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)} a ${r0(x.fin)}`:`oggi vale ${r0(x.oggi)}${pn&&pn.g>=3?` (${f1(pn.p)} PDK)`:""}`;
 const pr=x.prod>=100?`, più ${r0(x.prod)} di rendimento con loro`:"";
 const ini=x.da===0?`all'asta a ${x.c!=null?String(x.c).replace(".",","):"?"} cr (col senno di poi ne valeva ${Math.round(valoreVero(x.n))}): all'inizio valeva ${r0(x.costo)} punti`:`preso ${quando(x.da)}${x.c!=null?` a ${String(x.c).replace(".",",")} cr`:""}${pre}: valeva ${r0(x.costo)} punti`;
 /* (1634) i giocatori dell'asta iniziale si raccontano SOLO con i crediti dell'asta (300 a testa, 13 posti per tutti): prezzo pagato contro prezzo giusto
    col senno di poi. I punti valore di oggi qui non c'entrano; dove è andato a finire si dice a parole. */
 if(x.da===0){const vv=valoreVero(x.n),d=x.c!=null?vv-x.c:null;const dopo=x.a!=null?`, ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)}`:", è ancora in squadra";
  return`<b>${E(x.n)}</b> pagato ${x.c!=null?String(x.c).replace(".",","):"?"} ${x.c===1?"credito":"crediti"} all'asta: col senno di poi andava pagato ${Math.round(vv)}${x.picco>=25?`, con loro una stagione da ${pk(x.picco)} PDK`:""}${dopo}${d!=null?` <b class="${d>=0?"up":"dn"}">${d>=0?"+":"−"}${Math.abs(Math.round(d))} cr</b>`:""}`}
 return`<b>${E(x.n)}</b> ${ini} → ${fine}${pr} <b class="${x.gain>=0?"up":"dn"}">${crs(x.gain)}</b>`}
function rimpianti(t,D){return(permanenze(D)[t]||[]).filter(x=>x.a!=null).map(x=>{const d=dopoAltrove(x);return{...x,dopo:d,rimp:d-x.fin}}).filter(x=>x.rimp>=175).sort((a,b)=>b.rimp-a.rimp)}
function rimpTxt(x,t){const w=dove(x.n);return`<b>${E(x.n)}</b>: ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)} quando valeva ${r0(x.fin)}, poi ${w&&w!==t?ART("con",w)+" ":"altrove "}ha dato ${r0(x.dopo)} <b class="dn">(${crs(-x.rimp)})</b>`}
/* ---------- (1625) «E SE NON AVESSE CAMBIATO NIENTE?» — per ogni squadra: in che posizione sarebbe oggi tenendo la rosa di ogni anno passato
   (le altre 7 restano quelle vere, PDK veri di quest'anno, dalla 3ª giornata per tutti), quanto varrebbe quella rosa oggi e quanti anni avrebbe,
   contro la rosa vera di oggi (valore, età) e i crediti in cassa. Da qui il giudizio sulle scelte: hanno pagato, sono state una scommessa sul futuro,
   oppure tenere la squadra vecchia sarebbe stato meglio. ---------- */
let CFX=null;
function controfattuale(D){const key=D.key;if(CFX&&CFX.k===key)return CFX.v;const T=D.T,R={},sv={sel:TT.sel,mode:TT.mode,camp:TT.camp},K=kCred();
 try{TT.mode="lega";TT.camp=0;TT.__noBase=1;
  const rank=sel=>{TT.sel=sel;return lega().map(x=>x.t)};const base=rank({});
  const vRosa=L=>L.reduce((s,[n])=>s+pvOggi(n),0),eRosa=L=>{const X=L.map(([n])=>({a:etaY(n,SNOW),p:(stat(n,SNOW)||{}).p||0})).filter(x=>x.a!=null).sort((a,b)=>b.p-a.p).slice(0,10);return X.length?X.reduce((s,x)=>s+x.a,0)/X.length:null};
  for(const t of T){const oggi=roseOf(t,SNOW)||[];const o={t,real:base.indexOf(t)+1,valNow:vRosa(oggi),etaNow:eRosa(oggi),cred:(typeof CREDITI!=="undefined"&&CREDITI[t]!=null)?+CREDITI[t]:null,alt:[]};
   for(const y of D.Y){if(y===SNOW)continue;const L=roseOf(t,y)||[];if(!L.length)continue;o.alt.push({y,pos:rank({[t]:y}).indexOf(t)+1,val:vRosa(L),eta:eRosa(L)})}
   R[t]=o}}finally{TT.sel=sv.sel;TT.mode=sv.mode;TT.camp=sv.camp;delete TT.__noBase}
 const cr=T.map(t=>R[t].cred).filter(x=>x!=null),crM=cr.length?cr.reduce((a,b)=>a+b,0)/cr.length:null;
 for(const t of T){const o=R[t];if(!o.alt.length)continue;const best=[...o.alt].sort((a,b)=>a.pos-b.pos||b.val-a.val)[0],last=o.alt[o.alt.length-1];o.best=best;o.last=last;
  const dPos=best.pos-o.real/* >0: le mosse hanno fatto salire */,dVal=o.valNow-best.val,dEta=best.eta!=null&&o.etaNow!=null?best.eta-o.etaNow:0;
  /* il FUTURO mette insieme valore della rosa, età e crediti in cassa (contro la media della lega) */
  const fCr=crM!=null&&o.cred!=null?Math.max(-1,Math.min(1.5,(o.cred-crM)/60)):0,fut=dVal/900+dEta/1.5+fCr;
  const lab=y=>y===0?"la rosa del draft":"la rosa del "+YL(y);
  const fatti=`Rispetto ${lab(best.y).replace(/^la /,"alla ")}, la squadra di oggi ${Math.abs(dVal)<200?"vale più o meno lo stesso":dVal>0?`vale di più (${r0(o.valNow)} punti contro ${r0(best.val)})`:`vale meno (${r0(o.valNow)} punti contro ${r0(best.val)})`}, ${Math.abs(dEta)<.5?"ha la stessa età":dEta>0?`è più giovane di ${f1(dEta)} anni`:`è più vecchia di ${f1(-dEta)} anni`}${o.cred!=null&&crM!=null?` e ha ${o.cred} crediti in cassa (la media è ${r0(crM)})`:""}.`;
  const pos=`Con ${lab(best.y)}${best===o.alt.reduce((a,b)=>b.pos<a.pos?b:a)&&o.alt.length>1?", la migliore che ha avuto,":""} oggi sarebbe ${best.pos}°; con quella vera è ${o.real}°.`;
  let g;
  if(dPos>=1)g=["✅","Le mosse hanno pagato",`${pos} ${fatti}${fut<=-1?" Ha guadagnato posizioni, ma il futuro è più corto.":""}`];
  else if(dPos<=-2)g=fut>=1.5?["🔭","Scommessa sul futuro",`${pos} In classifica ha perso. ${fatti} Il conto si farà nelle prossime stagioni.`]:["❌","Era meglio non toccare niente",`${pos} ${fatti} Le mosse hanno tolto più di quanto hanno dato.`];
  else g=fut>=.7?["👍","Scelta giusta",`${pos} Restare fermi non avrebbe cambiato la classifica. ${fatti} Ha fatto bene a cambiare.`]
   :fut<=-1?["🕰️","Futuro più corto",`${pos} In classifica sarebbe lo stesso. ${fatti} Ha cambiato per restare dov'era, ma con una squadra che durerà meno.`]
   :["⚖️","Né meglio né peggio",`${pos} ${fatti} Le mosse non hanno spostato niente.`];
  o.giud=g}
 CFX={k:key,v:R};return R}
function vControfatt(t,D){const o=controfattuale(D)[t];if(!o||!o.giud)return"";
 return`<div class="ttcf"><div class="ttcfh"><b>🔮 E se non avesse cambiato niente?</b><span>${o.giud[0]} ${o.giud[1]}</span></div>
 <div class="ttcfg"><div class="now"><small>Rosa vera</small><b>${o.real}°</b><em>${r0(o.valNow)} pt · ${o.etaNow!=null?f1(o.etaNow):"—"} anni</em></div>${o.alt.map(a=>`<div${a===o.best?' class="best"':""}><small>${a.y===0?"Draft":YL(a.y)}</small><b>${a.pos}°</b><em>${r0(a.val)} pt · ${a.eta!=null?f1(a.eta):"—"} anni</em></div>`).join("")}</div>
 <p>${o.giud[2]}</p></div>`}
function pagella(t,D){const A=D.F[t],Y=D.Y.filter(y=>A[y]),a=A[Y[0]],c=A[SNOW];if(!a||!c||Y.length<2)return null;
 const es=Y.slice(1).map((y,i)=>estate(t,D,Y[i],y)).filter(Boolean),d=(c.f/a.f-1)*100,de=a.eta&&c.eta?c.eta-a.eta:0,stay=D.M[t].tot.stay.length;
 /* posizione nel power ranking delle 8 versioni «oggi» rispetto a quelle «24/25» */
 const GP=gmAll(D)[t],pos=y=>1+D.T.filter(u=>D.F[u][y]&&D.F[u][y].f>A[y].f).length,p1=GP?GP.pos[0]:pos(Y[0]),p3=GP?GP.pos[GP.pos.length-1]:pos(SNOW);
 /* (1618) voto nuovo: risultati, traiettoria, tempismo delle mosse e asta (gmAll) */const G=gmAll(D)[t];let v=G?G.v:6;
 /* (1623) DIREZIONE dai piazzamenti veri (non dalla forza simulata): dinastia, ascesa, risalita, occasione persa, mai in corsa, ricostruzione */
 const pz=GP?GP.pos:[p1,p3],pn=pz[pz.length-1],pp=pz.length>1?pz[pz.length-2]:pn,f0=pz[0],bst=Math.min(...pz);
 const dir=GP&&GP.ric?["🌱","Ricostruzione",`ha scelto il futuro: l'età media dei 10 migliori è scesa da ${f1(GP.eta[0])} a ${f1(GP.eta[1])} anni. Oggi lo paga in classifica, il conto si farà più avanti`]
  :pz.every(p=>p===1)?["👑","Dinastia","è primo da quando esiste la lega, e ha cambiato la squadra per restarci"]
  :pn<pp&&pp>f0&&pn<=3?["🔁","Risalita","dopo un anno storto è tornato in alto, senza smontare la squadra"]
  :(pn<pp&&pn<=f0)||(pn<f0&&pn<=pp)?["📈","In ascesa","sale in classifica anno dopo anno"]
  :pn>pp&&bst<=3?["📉","Occasione persa","era arrivato in alto ma è tornato indietro invece di andare a vincere"]
  :bst>3?["⏳","Mai in corsa","non è mai entrato nei primi 3: deve ancora trovare la strada"]
  :["⚖️","Stabile","resta più o meno dov'era"];
 return{t,v,dir,es,d,de,p1,p3,fy:Y[0]}}
function vEstate(e,t,i){if(!e)return"";const nm=e.a===0?`Primi mesi · draft → ${YLs(e.b)}`:`${YS()[0]===0?i:i+1}ª estate · ${YLs(e.a)} → ${YLs(e.b)}`,D=analisiData(),PM=permanenze(D)[t]||[];
 /* chi è entrato in questa finestra (valore all'arrivo → resa finora) e chi è uscito (valore alla cessione → cosa ha dato dopo, altrove) */
 const ins=PM.filter(x=>x.da===e.b).sort((a,b)=>b.costo+b.ret-a.costo-a.ret),outs=PM.filter(x=>x.a===e.b).map(x=>({...x,dopo:dopoAltrove(x)})).sort((a,b)=>b.fin-a.fin);
 const ch=(L,c)=>L.length?L.slice(0,6).map(x=>`<span class="ttmv ${c}">${c==="in"?"＋":"－"} ${E(x.n)} <small>${c==="in"?`${r0(x.costo)}→${r0(x.ret)}`:`${r0(x.fin)}→${r0(x.dopo)}`}</small></span>`).join("")+(L.length>6?`<span class="ttmv">+${L.length-6}</span>`:""):`<span class="ttmv">nessuno</span>`;
 const vIn=ins.reduce((s,x)=>s+x.costo,0),rIn=ins.reduce((s,x)=>s+x.ret,0),vOut=outs.reduce((s,x)=>s+x.fin,0),dOut=outs.reduce((s,x)=>s+x.dopo,0),bil=(rIn-vIn)-(dOut-vOut);
 const best=[...ins].sort((a,b)=>b.gain-a.gain)[0],rim=[...outs].sort((a,b)=>(b.dopo-b.fin)-(a.dopo-a.fin))[0],sold=[...outs].sort((a,b)=>(a.dopo-a.fin)-(b.dopo-b.fin))[0];
 const fr=[];if(best&&best.gain>=100)fr.push(`La mossa migliore: ${mossaTxt(best,t)}.`);
 if(sold&&sold.fin-sold.dopo>=175)fr.push(`Venduto al momento giusto: <b>${E(sold.n)}</b>, ceduto a ${r0(sold.fin)}, poi ha dato ${r0(sold.dopo)}.`);
 if(rim&&rim.dopo-rim.fin>=175)fr.push(`Il rimpianto: ${rimpTxt({...rim,rimp:rim.dopo-rim.fin},t)}.`);
 return`<div class="ttest"><div class="ttesth"><b>${nm}</b><span class="${bil>=0?"up":"dn"}">${crs(bil)}</span></div>
 <div class="ttmvs">${ch(ins,"in")}</div><div class="ttmvs">${ch(outs,"out")}</div>
 <p>Presi giocatori che all'arrivo valevano <b>${r0(vIn)}</b> punti e che finora hanno dato <b>${r0(rIn)}</b> (PDK prodotti + valore di oggi o alla cessione); ceduti giocatori che valevano <b>${r0(vOut)}</b> e che dopo, altrove, hanno dato <b>${r0(dOut)}</b>. Bilancio della finestra: <b class="${bil>=0?"up":"dn"}">${crs(bil)}</b>. ${fr.join(" ")}</p></div>`}
/* (1217) PAGELLE PER CATEGORIA: asta (draft iniziale), scambi, scopritore di talenti, progetto. Metro = PDK veri di questa stagione;
   voto da 4,5 a 9,5 in proporzione tra la peggiore e la migliore delle 8. Si ricalcolano da sole con trade, turni e stagioni nuove. */
const CATS=[["asta","🔨","Asta"],["scambi","🔁","Mercato e gestione"],["talenti","🔭","Scopritore di talenti"],["progetto","🛡️","Progetto"]];
let CATC=null;
/* prezzo pagato e rookie, anno per anno: asta iniziale (TT_DRAFT), rose di oggi (ROSTER: 5° campo = crediti), archivio automatico delle stagioni */
const entryOf=(t,y,n)=>{const k=tvNm(n);return(roseOf(t,y)||[]).find(z=>tvNm(z[0])===k)||null};
const astaY=y=>{const A=window.TT_ASTA&&TT_ASTA[y];if(!A)return null;if(!A.__k){Object.defineProperty(A,"__k",{value:{},enumerable:false});for(const k in A)A.__k[tvNm(k)]=A[k]}return A.__k};
const chiDi=(y,n)=>{const C=(window.TT_ASTA_CHI||{})[y]||{};for(const k in C)if(tvNm(k)===tvNm(n))return C[k];return null};
const dopoDi=(y,n)=>((window.TT_ASTA_DOPO||{})[y]||[]).some(z=>tvNm(z)===tvNm(n));
function prezzoDi(t,y,n){y=+y;if(y>0){const A=astaY(y);if(A){const v=A[tvNm(n)];if(v!=null)return+v;return null}const e=entryOf(t,y,n);if(y<SNOW&&e&&e[4]!=null)return+e[4]}if(y===0){const z=(TT_DRAFT[t]||[]).find(q=>tvNm(q[0])===tvNm(n));return z?z[2]:null}if(y===SNOW){const z=(ROSTER[t]||[]).find(q=>tvNm(q[0])===tvNm(n));return z&&z[4]!=null?+z[4]:null}const e=entryOf(t,y,n);return e&&e[2]!=null?+e[2]:null}
function rookieDi(t,y,n){y=+y;if(y===SNOW){try{return!!isRookie(n)}catch(e){return false}}const e=entryOf(t,y,n);if(e&&e[3]!=null)return!!e[3];/* (1631) rookie di quell'anno = nessuna partita NBA nella stagione prima, partite da quella stagione in poi (incrocio coi dati, non con l'età) */if(y<1)return false;if(stat(n,y-1))return false;for(let s=y;s<=SNOW;s++)if(stat(n,s))return true;return false}
const MAXP={};function maxPrezzo(y){y=+y;if(MAXP[y]!=null)return MAXP[y];let m=0,mr=0;for(const t of Object.keys(TEAMS))for(const[n]of(roseOf(t,y)||[])){const c=prezzoDi(t,y,n);if(c==null)continue;m=Math.max(m,c);if(y>0&&rookieDi(t,y,n))mr=Math.max(mr,c)}return MAXP[y]=mr||m}
/* (1220) VALORE DI UN ROOKIE (primo anno): conta soprattutto l'EFFICIENZA (PDK al minuto), poi i PDK concreti (12-13 normali, 15-17 già tanta roba),
   poi la CRESCITA (minuti e PDK delle ultime 5 partite contro la media: se gli danno sempre più spazio, il giudizio sale da solo). */
let RKL=null;function rkLog(){const n=Object.keys(TV.box).length;if(RKL&&RKL.n===n)return RKL.m;const m={};
 for(const d of Object.keys(TV.days).sort())for(const g of TV.days[d]||[]){const B=g[7]&&TV.box[g[7]];if(!B)continue;for(const sd of["a","h"])for(const r of B[sd]||[]){const mm=String(r[2]||"0:00").split(":");const mi=(+mm[0]||0)+(+mm[1]||0)/60;if(mi<=0)continue;(m[tvNm(r[0])]=m[tvNm(r[0])]||[]).push([d,mi,+r[19]||0])}}
 RKL={n,m};return m}
function rookieVal(n){const L=rkLog()[tvNm(n)]||[];if(!L.length)return{g:0,V:0};const g=L.length,mi=L.reduce((s,x)=>s+x[1],0),pk=L.reduce((s,x)=>s+x[2],0),eff=mi?pk/mi:0,mpg=mi/g,ppg=pk/g;
 const R=L.slice(-5),rm=R.reduce((s,x)=>s+x[1],0)/R.length,rp=R.reduce((s,x)=>s+x[2],0)/R.length,trM=g>=6&&mpg?(rm-mpg)/mpg:0,trP=g>=6?(rp-ppg)/Math.max(8,ppg):0;
 const effI=(eff-.55)/.25,pdkI=(ppg-11)/6,trI=Math.max(-.5,Math.min(.8,trM*.6+trP*.4));
 let mxg=0;const M=med();for(const k in M)mxg=Math.max(mxg,M[k].g);const disp=mxg?Math.sqrt(Math.min(1,g/mxg)):1;
 /* (1633) ETÀ: un rookie di 19-20 anni che rende già ha davanti molta più crescita di uno di 23-24 (che deve rendere subito): il valore si pesa sull'età */
 const age=etaY(n,SNOW),fA=age==null?1:Math.max(.7,Math.min(1.3,1+.12*(21.5-age)));
 const V=Math.max(0,.5*effI+.35*pdkI+.15*trI*2+.25)*disp*fA;return{g,eff,mpg,ppg,rm,rp,trM,trP,V,age,fA}}
function crPdk(){try{const M=med();let mxg=0;for(const k in M)mxg=Math.max(mxg,M[k].g);let SP=0,SV=0;for(const t of Object.keys(TEAMS))for(const z of(ROSTER[t]||[])){const c=prezzoDi(t,SNOW,z[0]);let rk=false;try{rk=isRookie(z[0])}catch(e){}if(!rk||c==null)continue;const p=pmed(z[0]);SP+=c;SV+=p?Math.max(0,p.v-8)*(mxg?p.g/mxg:1):0}return SV&&SP?SP/SV:11}catch(e){return 11}}
function categorie(D){if(CATC&&CATC.k===D.key)return CATC.v;for(const k in MAXP)delete MAXP[k];const T=D.T,pv=n=>{const p=pmed(n);return p?p.v:0},R={};
 for(const t of T){const o={t,det:{}};
  /* ASTA: forza della rosa del draft sui PDK di oggi (60%) + affari (giocatori pagati ≤5 cr che oggi fanno ≥25 PDK) (40%) */
  const DR=(TT_DRAFT[t]||[]).map(([n,r,c])=>({n,c,p:pv(n)}));
  const AS=astaData().T[t];if(AS){o.asta={x:AS.voto*100+AS.gain/100,det:{as:AS}}}else if(DR.length&&D.F[t][0]){const aff=DR.filter(x=>x.c!=null&&x.c<=5&&x.p>=25).sort((a,b)=>b.p-a.p),spe=DR.filter(x=>x.c!=null).reduce((s,x)=>s+x.c,0);
   const flop=DR.filter(x=>x.c!=null&&x.c>=20).sort((a,b)=>(a.p/a.c)-(b.p/b.c))[0],top=DR.filter(x=>x.c!=null&&x.p>0).sort((a,b)=>(b.p-(b.c||0)*.25)-(a.p-(a.c||0)*.25))[0];
   o.asta={x:D.F[t][0].f*.6+aff.reduce((s,y)=>s+(y.p-20),0)*1.2,det:{f:D.F[t][0].f,aff,spe,flop,top}}}
  /* SCAMBI: somma dei saldi di tutte le finestre di mercato (chi entra nei 10 migliori meno chi ne esce, PDK di oggi) */
  const Y=D.Y.filter(y=>D.F[t][y]),es=Y.slice(1).map((y,i)=>estate(t,D,Y[i],y)).filter(Boolean);
  const bestIn=es.flatMap(e=>e.inn).sort((a,b)=>pv(b.n)-pv(a.n))[0],worstOut=es.flatMap(e=>e.out10.map(x=>({...x,w:dove(x.n)}))).filter(x=>x.w!==t).sort((a,b)=>pv(b.n)-pv(a.n))[0];
  const CRL=Object.values(window.TT_CR_SCAMBI||{}).flat().filter(z=>z.da===t||z.a===t),crN=CRL.reduce((s,z)=>s+(z.a===t?z.cr:-z.cr),0),k10=crPdk();
  /* (1620) SCAMBI = stesso metro del tempismo delle mosse della pagella (valore che entra contro valore che esce, PDK prima e dopo, età),
     non più «PDK di oggi di chi entra meno chi esce»: chi vende un campione al massimo e diventa più forte non va punito. I crediti dati o presi contano poco (metà). */
  const G=gmAll(D)[t];o.scambi={x:(G?G.mer:es.reduce((s,e)=>s+e.saldo,0))+crN/k10*.5,det:{n:es.length,bestIn,worstOut,crN,crL:CRL}};
  /* TALENTI (1218): chi è stato preso giovane (≤23 anni), da rookie o quasi gratis, e oggi rende: rookie da almeno 15 PDK, gli altri da almeno 25,
     ovunque giochino adesso. Pesa il prezzo: chi lo ha pagato poco rispetto al più caro dei rookie (o dell'asta) di quell'anno vale di più
     (Burries a 7 crediti è una vera scoperta; un rookie pagato al massimo lo volevano tutti). Vale per l'asta iniziale e per ogni draft annuale. */
  const seen=new Set(),hits=[],extra=Object.entries((window.TT_ASTA_CHI||{})[SNOW]||{}).filter(([n,ch])=>ch===t).map(([n])=>[n]);Y.forEach((y,i)=>{for(const[n]of(y===SNOW?[...roseOf(t,y),...extra]:roseOf(t,y))){const k=tvNm(n);if(seen.has(k))continue;const ch=chiDi(y,n);if(ch&&ch!==t)continue;seen.add(k);const p=pv(n),e=etaY(n,y),c=prezzoDi(t,y,n),rk=rookieDi(t,y,n),mx=maxPrezzo(y);
    const cheap=c!=null&&(y===0?c<=5:mx&&c/mx<=.35),young=e!=null&&e<=23.5;
    const RV=rk&&y===SNOW?rookieVal(n):null;if((RV&&RV.V>=.6)||(rk&&!RV&&p>=15)||(p>=25&&(young||cheap))){const f=c==null||!mx?1:Math.max(.4,Math.min(1.5,1.5-c/mx));hits.push({n,y,e,c,p,rk,f,sc:(RV?RV.V*8:p-(rk?12:20))*f,qui:(ROSTER[t]||[]).some(z=>tvNm(z[0])===k)})}}});
  hits.sort((a,b)=>b.sc-a.sc);o.talenti={x:hits.reduce((s,h)=>s+h.sc,0),det:{hits}};
  /* (1622) TALENTI = i colpi del GM (presi quando valevano meno di quanto hanno reso con loro: mosse, rookie, asta, infortunati) */
  {const GG=gmAll(D)[t];o.talenti={x:GG.tal,det:{scop:GG.scop}}}
  /* PROGETTO: quota dei PDK dei 10 migliori di oggi che arriva da giocatori in squadra da almeno 2 stagioni */
  const now=D.F[t][SNOW];if(now&&Y.length>=3){const prev=Y.slice(-3,-1).map(y=>new Set(roseOf(t,y).map(z=>tvNm(z[0]))));const core=now.top.filter(x=>prev.every(S=>S.has(tvNm(x.n))));
   const tot=now.top.reduce((s,x)=>s+x.p.v,0);o.progetto={x:tot?core.reduce((s,x)=>s+x.p.v,0)/tot*100:0,det:{core,da:YL(Y[Y.length-3])}}}
  R[t]=o}
 for(const[k]of CATS){const L=T.filter(t=>R[t][k]);if(!L.length)continue;const xs=L.map(t=>R[t][k].x),mn=Math.min(...xs),mx=Math.max(...xs);
  [...L].sort((a,b)=>R[b][k].x-R[a][k].x).forEach((t,i)=>{const c=R[t][k];c.rk=i+1;c.v=Math.round((4.5+(mx>mn?(c.x-mn)/(mx-mn):.5)*5)*2)/2})}
 for(const t of T){const c=R[t].asta;if(c&&c.det.as){c.v=c.det.as.voto;c.rk=c.det.as.pos}}
 CATC={k:D.key,v:R};return R}
const vf=v=>String(v).replace(".",",");
function catTxt(k,c,t){const d=c.det,D=analisiData(),G=gmAll(D)[t];
 if(k==="asta"&&d.as)return astaGiudizio(d.as).slice(0,3).join(" ");
 if(k==="scambi"&&G){const b=G.top[0],w=G.flop[0],rp=rimpianti(t,D)[0];return`Valore creato con le mosse dopo l'asta: <b>${crs(G.mvTot)}</b> punti; tempismo nel cedere i giocatori presi all'asta (valore alla cessione contro quello che hanno dato dopo): <b>${crs(G.gd)}</b>${G.crN?` (${G.crN>0?"in più ha incassato":"in più ha speso"} ${Math.abs(G.crN)} crediti negli scambi: non contano nel voto, conta quanto rende chi è arrivato)`:""}.${b?` La mossa migliore: <b>${E(b.n)}</b> (${crs(b.gain)}).`:""}${w?` La peggiore: <b>${E(w.n)}</b> (${crs(w.gain)}).`:""}`}
 if(k==="talenti")return d.scop&&d.scop.length?`Le scoperte (giovani, rookie, presi a poco o da infortunati, che poi sono cresciuti): ${d.scop.slice(0,4).map(x=>mossaTxt(x,t)).join(" · ")}.`:"Nessuna scoperta finora.";
 if(k==="progetto")return`${Math.round(c.x)}% dei PDK dei 10 migliori di oggi arriva da chi è in squadra almeno dal ${d.da}${d.core.length?`: ${d.core.slice(0,4).map(x=>`<b>${E(x.n)}</b>`).join(", ")}`:""}.`;return""}
function vCatPag(t,D){const C=categorie(D)[t];if(!C)return"";return`<div class="ttcats">${CATS.filter(([k])=>C[k]).map(([k,ic,l])=>`<div class="ttcat"><span class="ttvoto sm v${Math.floor(C[k].v)}">${vf(C[k].v)}</span><span><b>${ic} ${l}</b><small>${C[k].rk}° su 8</small><em>${catTxt(k,C[k],t)}</em></span></div>`).join("")}</div>`}
function vCatClass(D){const C=categorie(D);return`<div class="tth">Le classifiche per categoria</div><p class="ttn small">Asta = prezzo pagato contro valore vero dei giocatori negli anni · Scambi = saldo di tutte le finestre di mercato · Talenti = presi giovani o quasi gratis e oggi forti · Progetto = quanto della squadra di oggi è cresciuto in casa.</p>
 <div class="ttcatg">${CATS.map(([k,ic,l])=>{const L=D.T.filter(t=>C[t][k]).sort((a,b)=>C[a][k].rk-C[b][k].rk);return L.length?`<div class="ttcatb"><h6>${ic} ${l}</h6>${L.map(t=>`<div class="ttcr2">${lg(t)}<span>${TEAMS[t].nick}</span><span class="ttvoto xs v${Math.floor(C[t][k].v)}">${vf(C[t][k].v)}</span></div>`).join("")}</div>`:""}).join("")}</div>${shBtn("cat","Condividi le categorie")}`}
async function shareCat(btn){const D=analisiData(),C=categorie(D);try{await document.fonts.load('800 italic 40px "Barlow Condensed"')}catch(e){}
 const H=300+2*(8*66+90)+120,{cv,X}=ttCanvas(H);ttTop(X,"I GM per categoria",`Asta, scambi, talenti e progetto dal draft a oggi · PDK veri di questa stagione`);
 for(let i=0;i<4;i++){const[k,ic,l]=CATS[i],x0=40+(i%2)*510,y0=300+Math.floor(i/2)*(8*66+90);X.fillStyle="rgba(255,255,255,.07)";shRR(X,x0,y0,490,8*66+70,22);X.fill();
  X.fillStyle="#fff";X.textAlign="left";X.font=CF(800,40);X.fillText(`${ic} ${l.toUpperCase()}`,x0+24,y0+50);
  const L=D.T.filter(t=>C[t][k]).sort((a,b)=>C[a][k].rk-C[b][k].rk);for(let j=0;j<L.length;j++){const t=L[j],y=y0+70+j*66,v=C[t][k].v;await shLogoAt(X,t,x0+20,y+4,52);X.fillStyle="#fff";X.textAlign="left";X.font=CF(800,36);X.fillText(TEAMS[t].nick.toUpperCase(),x0+86,y+44);
   X.fillStyle=v>=8?"#8b5cf6":v>=7?"#16a34a":v>=6?"#d97706":"#dc2626";shRR(X,x0+390,y+8,80,48,12);X.fill();X.fillStyle="#fff";X.textAlign="center";X.font=CF(800,36);X.fillText(vf(v),x0+430,y+45)}}
 ttFoot(X,H);shSend(cv,"gm-categorie.png","⏳ I GM per categoria · Dreamers",btn)}
/* ---------- (1217) PAGELLA DELL'ASTA (draft iniziale: 8 squadre, 300 crediti a testa, base 1 per giocatore).
   Valore di ogni giocatore negli anni dopo l'asta = PDK sopra il «rimpiazzo» (il 104° giocatore della lega, quanti ne servono a 8 squadre × 13)
   per la disponibilità (partite giocate), stagione per stagione: 24/25 e 25/26 da Basketball Reference (stessa formula PDK dell'Assistente GM),
   la stagione in corso dai tabellini (pesata per la parte di stagione già giocata). Prezzo giusto «a posteriori» = 1 credito + la parte del montepremi
   (2400 crediti meno 1 per ogni giocatore preso) in proporzione al valore. Guadagno = prezzo giusto − prezzo pagato. ---------- */
const STOP=()=>typeof GMSTO!=="undefined"&&GMSTO&&GMSTO.stagioni?GMSTO.stagioni:{};
const pdkEstT=r=>r[4]+r[6]+1.25*r[5]+1.5*(r[7]+r[8]+r[9])-1.5*r[10]-(r[12]-r[11])-(r[14]-r[13])+(r[1]?r[2]/r[1]:0);
/* (1618) VALORI STAGIONE PER STAGIONE per la pagella dei GM e dell'asta: 0 = 23/24 (formula su Basketball Reference, riscalata sui PDK veri del 24/25),
   le stagioni chiuse con i PDK VERI partita per partita (pdk-stagioni.js; se manca una stagione, la formula), la stagione in corso dai tabellini. */
let SVC=null;
function svData(){const key=Object.keys(TV.box).length+"|"+(STOP().upd||"");if(SVC&&SVC.key===key)return SVC;const S={},PS=window.PDK_STAG||{};
 const fromSto=lab=>{const st=STOP()[lab]||{},m={};for(const k in st){const r=st[k].find(x=>x[0]==="TOT")||st[k][0];if(r&&r[1])m[tvNm(k)]={p:pdkEstT(r),g:r[1],n:k}}return m};
 for(let y=1;y<SNOW;y++){const P=PS[y];if(P){const m={};for(const k in P)m[tvNm(k)]={p:P[k][0],g:P[k][1],n:k};S[y]=m}else S[y]=fromSto(`20${y+23}-${y+24}`)}
 {const f0=fromSto("2023-24"),f1=fromSto("2024-25"),rat=[];for(const k in f1){const v=S[1]&&S[1][k];if(v&&v.g>=30&&f1[k].g>=30&&f1[k].p>10)rat.push(v.p/f1[k].p)}rat.sort((a,b)=>a-b);const K=rat.length?rat[rat.length>>1]:1;for(const k in f0)f0[k].p*=K;S[0]=f0}
 const M=med(),m={};let mx=0;for(const k in M)mx=Math.max(mx,M[k].g);for(const k in M)m[k]={p:M[k].s/M[k].g,g:M[k].g};S[SNOW]=m;
 return SVC={key,S,mx}}
/* valore di un giocatore in una stagione = PDK medio × disponibilità (partite giocate) */
function svVal(n,y){const V=svData(),x=V.S[y]&&V.S[y][tvNm(n)];if(!x)return 0;const a=y===SNOW?Math.min(1,x.g/(.8*Math.max(1,V.mx))):Math.min(1,x.g/60);return x.p*a}
function svNoto(n,w){const V=svData(),p=V.S[w-1]&&V.S[w-1][tvNm(n)],q=V.S[SNOW][tvNm(n)];if(!p||p.g<20)return false;if(w===SNOW&&(!q||q.g<3))return false;return true}
const GM_PT=[10,8.5,7.5,6.5,6,5.5,5,4.5];
/* piazzamento finale vero della stagione y (Sala trofei: STORIA); null se la stagione non è finita */
function posFin(t,y){try{const h=(typeof STORIA!=="undefined"?STORIA:[]).find(x=>x.anno===y);if(h){const i=h.ordine.indexOf(t);if(i>=0)return i+1}}catch(e){}return null}
/* (1618) VOTO DEL GM (richiesta di Imma, 22/11/2026): RISULTATI 35% (piazzamenti veri di ogni stagione e posizione di oggi, i più recenti pesano di più),
   TRAIETTORIA 20% (posizioni guadagnate o perse nel tempo, non la crescita assoluta), TEMPISMO DELLE MOSSE 30% (per ogni giocatore entrato o uscito:
   PDK prima della mossa contro PDK dopo, più il valore che è rimasto, pesato sull'età: vendere al massimo prima del calo e comprare prima della crescita
   valgono di più; rookie e chi non ha una stagione vera prima della mossa non contano qui), ASTA 15% (pagella dell'asta).
   Mai nei primi 3 e senza ricostruzione (età dei 10 migliori scesa di almeno 2 anni) = mediocrità: voto massimo 7, meno mezzo punto. */
/* ==========================================================================================================================
   (1623) IL VALORE DEI GIOCATORI NEL TEMPO — la base di tutta l'analisi dei GM (richiesta di Imma: «un'analisi seria»).
   Per ogni giocatore e per ogni momento (draft, ogni finestra di mercato, oggi) si calcola quanto VALEVA in quel momento, con quello che si sapeva allora:
   · PDK delle ultime stagioni (la più recente pesa 70%, quella prima 30%; una stagione con meno di 15 partite non fa testo: si usa quella prima, scontata);
   · EFFICIENZA (PDK al minuto) per i giovani: un under 25 efficiente con pochi minuti vale per quello che farà con più spazio;
   · ETÀ: proiezione dei 5 anni successivi (fino a 22 anni +2,5 PDK l'anno, 23-24 +1,5, 25-26 +0,5, 27-28 fermo, 29-30 −1, 31-32 −2, poi −3);
   · VALORE = PDK sopra il rimpiazzo (15) nei 5 anni successivi, scontati (×0,85 l'anno): in una dynasty un fuoriclasse giovane vale per tutta la carriera. Un rookie vale la sua attesa (più alta se pagato di più).
   Poi per ogni giocatore passato da una squadra («permanenza»): COSTO = valore all'arrivo; RESA = PDK sopra il rimpiazzo prodotti con la squadra
   stagione per stagione (gli anni di mezzo contano tutti) + valore all'uscita (quello che la squadra ha «incassato» cedendolo) o di oggi se è ancora lì.
   VALORE CREATO = resa − costo. Tutto è espresso in CREDITI D'ASTA: 1 credito = 1/2400 del valore di tutti i giocatori presi all'asta iniziale.
   ========================================================================================================================== */
const VSEAS=y=>y===SNOW?null:`20${+y+23}-${+y+24}`;
function stat(n,y){const V=svData(),x=V.S[y]&&V.S[y][tvNm(n)];if(!x)return null;let m=null;
 if(y===SNOW){const L=rkLog()[tvNm(n)];if(L&&L.length)m=L.reduce((s,q)=>s+q[1],0)/L.length}
 else{const S=STOP()[VSEAS(y)];if(S){const k=Object.keys(S).find(k=>tvNm(k)===tvNm(n));if(k){const r=S[k].find(q=>q[0]==="TOT")||S[k][0];if(r)m=r[3]}}}
 return{p:x.p,g:x.g,m,eff:m?x.p/m:null}}
const ageD=a=>a<=22?2.5:a<=24?1.5:a<=26?.5:a<=28?0:a<=30?-1:a<=32?-2:-3;
function proj0(n,y,now,neu){/* PDK attesi per la stagione che inizia al momento y (now = oggi, con la stagione in corso) */
 const age=etaY(n,now?SNOW:y);let L,P,base=null;
 if(now){L=stat(n,SNOW);P=stat(n,SNOW-1);if(L&&L.g>=3){const w=L.g/(L.g+12);base=w*L.p+(1-w)*(P&&P.g>=15?P.p:L.p)}else if(P&&P.g>=15)base=P.p*.92;else if(P&&P.g>=1)base=P.p*.8}
 else{const last=Math.max(0,y-1);L=stat(n,last);P=last>0?stat(n,last-1):null;if(L&&L.g>=15)base=.7*L.p+.3*(P&&P.g>=15?P.p:L.p);else if(P&&P.g>=15)base=P.p*.85;else if(L&&L.g>=1)base=L.p*.8}
 if(base==null)return{p:null,age};
 const Q=L&&L.g>=3?L:P;if(!neu&&age!=null&&age<25&&Q&&Q.eff&&Q.m){const up=Math.min(base*1.4,Q.eff*Math.min(34,Q.m+4));if(up>base)base=.65*base+.35*up}
 return{p:base,age}}
function valore(n,y,now,rookieC,neu){const o=proj0(n,y,now,neu);let p=o.p,a=neu?27:o.age;
 if(p==null){/* rookie o giocatore senza stagione vera: vale la sua attesa, più alta se è stato pagato di più */const mx=maxPrezzo(now?SNOW:y)||0;p=rookieC!=null&&mx?11+6*Math.min(1,rookieC/mx):12.5;if(a==null)a=20}
 let v=0;for(let k=0;k<5;k++){if(k)p+=ageD((a||27)+k);v+=Math.max(0,p-15)*Math.pow(.85,k)}return v}
function resa(n,s){/* PDK sopra il rimpiazzo prodotti nella stagione s. Disponibilità = partite giocate, ma gli infortuni sono sfortuna, non errori del GM:
   una stagione giocata almeno a metà conta piena, una con almeno 10 partite conta almeno al 60%, una saltata quasi tutta al 30% */const x=stat(n,s);if(!x)return 0;if(s===SNOW)return Math.max(0,x.p-15)*x.g/82;const av=x.g>=41?1:x.g>=10?Math.max(.6,x.g/70):.3;return Math.max(0,x.p-15)*av}
/* (1628) PUNTI VALORE: dopo l'asta tutto si misura nella scala dei VALORI della lega (Wembanyama ~4000, Flagg ~2000, Burries ~600).
   Oggi = valore ufficiale (VALORI); per il passato (arrivo, cessione) lo stesso modello tradotto nella scala della lega con una retta
   calcolata ogni volta su tutti i giocatori che hanno un valore ufficiale (VALORI ≈ a × modello + b, correlazione ~0,9). */
let PVF=null,PVK=null;function pvFit(){const k=JSON.stringify(Object.keys(VALORI).length)+"|"+Object.keys(TV.box).length;if(PVF&&PVK===k)return PVF;const P=[];
 for(const n in VALORI){const v=VALORI[n]&&VALORI[n][1];if(v!=null)P.push([valore(n,SNOW,true,null),+v])}const N=P.length;if(N<10)return PVF={a:22,b:190,m:{}};
 const mx=P.reduce((s,x)=>s+x[0],0)/N,my=P.reduce((s,x)=>s+x[1],0)/N;let sxy=0,sxx=0;P.forEach(([x,y])=>{sxy+=(x-mx)*(y-my);sxx+=(x-mx)**2});const a=sxx?sxy/sxx:22;
 const m={};for(const n in VALORI)if(VALORI[n]&&VALORI[n][1]!=null)m[tvNm(n)]=+VALORI[n][1];PVK=k;return PVF={a,b:my-a*mx,m}}
const toPV=v=>Math.max(50,pvFit().a*v+pvFit().b);
/* un rookie (o chi non ha ancora una stagione NBA vera) vale quanto valgono oggi, nella scala della lega, i rookie appena scelti: la mediana dei loro
   valori ufficiali, più alta se è stato pagato di più rispetto al rookie più caro di quell'anno */
let RKM=null;function pvRookie(c,y){if(RKM==null){const v=[];for(const n in VALORI){let rk=false;try{rk=isRookie(n)}catch(e){}if(rk&&VALORI[n]&&VALORI[n][1]!=null)v.push(+VALORI[n][1])}v.sort((a,b)=>a-b);RKM=v.length?v[v.length>>1]:700}
 const mx=maxPrezzo(y);return RKM*(c!=null&&mx?.7+.6*Math.min(1,c/mx):1)}
/* (1640) VALORE «NEUTRO» = solo quello che il giocatore produce (PDK), senza il premio per l'età né per l'efficienza da giovane:
   serve per il MERCATO, che deve premiare chi ha preso giocatori che rendono davvero, non chi accumula giovani che devono ancora esplodere */
function valN(n,y,now){const o=proj0(n,y,now,true);if(o.p==null)return toPV(0);return toPV(valore(n,y,now,null,true))}
function valPV(n,y,now,c){const o=proj0(n,y,now);if(o.p==null)return pvRookie(c,y);return toPV(valore(n,y,now,c))}
function pvOggi(n,v){const u=pvFit().m[tvNm(n)];return u!=null?u:toPV(v==null?valore(n,SNOW,true,null):v)}
let VK=null;function kCred(){if(VK!=null)return VK;let S=0;for(const t in TT_DRAFT)for(const[n,r,c]of TT_DRAFT[t])S+=valore(n,0,false,c);VK=S?2400/S:10;return VK}
let PERM=null;
function permanenze(D){if(PERM&&PERM.k===D.key)return PERM.v;const Y=D.Y,A=pvFit().a,R={};
 for(const t of D.T){const L=[];const inR=(y,n)=>(roseOf(t,y)||[]).some(z=>tvNm(z[0])===tvNm(n));
  Y.forEach((y,i)=>{for(const z of roseOf(t,y)||[]){const n=z[0];if(i&&inR(Y[i-1],n))continue;/* nuova permanenza che inizia al momento y */
    let j=i;while(j+1<Y.length&&inR(Y[j+1],n))j++;const end=j+1<Y.length?Y[j+1]:null,lastY=Y[j];
    const c=prezzoDi(t,y,n),rk=y>0&&rookieDi(t,y,n),costo=valPV(n,y,false,c);
    let prod=0;const ss=[];for(let s=Math.max(1,y);s<=lastY;s++){let r=resa(n,s);if(y===0&&lastY===0&&s===1)r*=.35;prod+=r;ss.push([s,stat(n,s)])}if(y===0&&lastY===0){prod+=resa(n,1)*.35;ss.push([1,stat(n,1)])}
    const uscita=end!=null?valPV(n,end,false,null):null,oggi=pvOggi(n,valore(n,SNOW,true,c)),fin=end!=null?uscita:oggi;
    const ret=prod*A+fin,ch=y===SNOW?chiDi(SNOW,n):null;
    const costoN=valN(n,y,false),finN=end!=null?valN(n,end,false):valN(n,SNOW,true),retN=prod*A+finN;
    L.push({t,n,da:y,a:end,c,rk,eta:etaY(n,y),costo,prod:prod*A,fin,oggi,ret,gain:ret-costo,costoN,finN,retN,gainN:retN-costoN,ss,pre:stat(n,Math.max(0,y-1)),ora:end!=null?dove(n):t,ch})}});
  R[t]=L}
 PERM={k:D.key,v:R};return R}
/* ---------- (1622) PAGELLA DEI GM · rifatta sul metro della lega (richiesta di Imma, 22/11/2026).
   Dati: PDK VERI di ogni stagione (pdk-stagioni.js per 24/25 e 25/26, tabellini per oggi; il draft si misura sul 24/25), classifiche vere (STORIA) e di oggi.
   · RISULTATI 40%: piazzamento di oggi 50%, ultima stagione 30%, prima 20% (1° 10 · 2° 9 · 3° 8 · 4° 7 · 5° 6 · 6° 5,5 · 7° 5 · 8° 4,5).
   · TRAIETTORIA 20%: posizioni guadagnate (sull'anno scorso ×0,5, sul primo ×0,3); chi sta scendendo dal suo punto più alto perde 0,4 a posizione
     (2° e poi 5° non è andare avanti). Chi è sempre stato 1° = 9,5.
   · MERCATO 25%: ogni giocatore entrato o uscito, con i PDK VERI della stagione prima della mossa contro quelli dopo (con la squadra se è arrivato,
     ovunque sia andato se è partito), pesato su quanto conta il giocatore: vendere al massimo (Jokić 56 → 46) e comprare prima della crescita
     (Amen 19 → 27-30, Flagg 27 → 34) sono le mosse migliori. Mosse sotto i 18 PDK non contano; stagioni con meno di 15 partite non si usano.
   · ASTA 15%: la pagella dell'asta (forza della rosa del draft sul 24/25, resa dei giocatori dell'asta finché sono rimasti, piazzamento del 1° anno).
   · RICOSTRUZIONE: se l'età media dei 10 migliori è scesa di almeno 2 anni dal draft, la squadra si giudica a parte: risultati 20%, traiettoria 15%,
     mercato 45%, asta 20%.
   · MEDIOCRITÀ: mai nei primi 3 (né a fine stagione né oggi), senza ricostruire e senza salire = voto massimo 7, meno mezzo punto.
   Tutto si ricalcola da solo con nuovi turni, trade, stagioni archiviate e draft. ---------- */
const GM2_PT=[10,9,8,7,6,5.5,5,4.5];
const svP=(n,y)=>{const V=svData(),x=V.S[y]&&V.S[y][tvNm(n)];if(!x)return null;return(y===SNOW?x.g>=3:x.g>=15)?x.p:null};
function forzaVera(t,y){const yy=y===0?1:y,R=roseOf(t,y)||[];const pool=R.map(([n,r])=>({n,r:r==="A"?"F":r,e:svP(n,yy)||0}));
 const Q={G:4,F:4,C:2};let sel=[];for(const r of["G","F","C"])sel.push(...pool.filter(x=>x.r===r).sort((a,b)=>b.e-a.e).slice(0,Q[r]));sel.sort((a,b)=>b.e-a.e);return sel.reduce((s,x,i)=>s+x.e*(i===0?1.5:i>=6?.5:1),0)}
function etaTop(t,y){const yy=y===0?1:y,R=(roseOf(t,y)||[]).map(([n])=>({p:svP(n,yy)||0,a:etaY(n,y)})).sort((a,b)=>b.p-a.p).slice(0,10).filter(x=>x.a!=null);return R.length?R.reduce((s,x)=>s+x.a,0)/R.length:null}
function posAnni(t){const T=Object.keys(TEAMS),L=[];for(let y=1;y<SNOW;y++){const p=posFin(t,y);if(p)L.push(p)}let st=[];try{st=drStand().map(x=>x.t)}catch(e){}L.push(st.indexOf(t)+1||T.length);return L}
const nrm45=o=>{const v=Object.values(o),mn=Math.min(...v),mx=Math.max(...v),r={};for(const k in o)r[k]=4.5+(mx>mn?(o[k]-mn)/(mx-mn):.5)*5;return r};
function mosse(t,D){const Y=D.Y,L=[];Y.forEach((y,i)=>{if(!i)return;const a=Y[i-1],A=new Set((roseOf(t,a)||[]).map(z=>tvNm(z[0]))),B=new Set((roseOf(t,y)||[]).map(z=>tvNm(z[0])));
  const pre=n=>svP(n,a);
  const conLoro=(n,from)=>{const v=[];for(let s=from;s<=SNOW;s++){if(!(roseOf(t,s)||[]).some(z=>tvNm(z[0])===tvNm(n)))break;const q=svP(n,s);if(q!=null)v.push(q)}return v.length?v.reduce((x,y)=>x+y,0)/v.length:null};
  const altrove=(n,from)=>{const v=[];for(let s=from;s<=SNOW;s++){const q=svP(n,s);if(q!=null)v.push(q)}return v.length?v.reduce((x,y)=>x+y,0)/v.length:null};
  for(const z of roseOf(t,y)||[])if(!A.has(tvNm(z[0])))L.push({d:"+",n:z[0],a,y,bf:pre(z[0]),af:conLoro(z[0],y)});
  for(const z of roseOf(t,a)||[])if(!B.has(tvNm(z[0])))L.push({d:"-",n:z[0],a,y,bf:pre(z[0]),af:altrove(z[0],y)})});
 return L.map(m=>{if(m.bf==null||m.af==null||Math.max(m.bf,m.af)<18)return{...m,ok:false,sc:0};const s=Math.max(-15,Math.min(15,m.d==="+"?m.af-m.bf:m.bf-m.af));return{...m,ok:true,s,sc:s*Math.max(m.bf,m.af)/30}})}
/* fattore «scoperta» del prezzo: pagato poco rispetto al più caro di quell'anno (rookie) o all'asta iniziale = scoperta vera */
const fPrezzo=x=>{if(x.c==null)return 1;if(x.da===0)return Math.max(.4,Math.min(1.5,1.5-x.c/40));const mx=maxPrezzo(x.da);return mx?Math.max(.3,Math.min(1.5,1.5-x.c/mx)):1};
/* scoperta = preso quando valeva poco: rookie, affare d'asta (≤10 cr), giovane (≤24 anni) o infortunato preso a un valore basso (≤15). Non lo è chi è stato pagato da stella. */
/* scelta alta = tra le prime 5 del draft NBA, presa da una squadra arrivata tra le ultime 3 l'anno prima (i crediti per la scelta alta vengono dal perdere),
   oppure rookie pagato almeno il 60% del più caro di quell'anno: li avrebbe presi chiunque, non sono scoperte */
const pickNBA=n=>{try{for(const y in DRAFT_RAW){const L=String(DRAFT_RAW[y]).split("|"),i=L.findIndex(z=>tvNm(z)===tvNm(n));if(i>=0)return i+1}}catch(e){}return null};
const sceltaAlta=x=>{if(!x.rk)return false;const mx=maxPrezzo(x.da);if(x.c!=null&&mx&&x.c>=.6*mx)return true;const pk=pickNBA(x.n),pp=x.da>=2?posFin(x.t,x.da-1):null;return pk!=null&&pk<=5&&pp!=null&&pp>=6};
const scoperta=x=>!sceltaAlta(x)&&(x.rk||(x.da===0?x.c!=null&&x.c<=10:(x.eta!=null&&x.eta<=24.5&&x.costo<=900)||(x.costo<=650&&((x.pre&&x.pre.g<15)||x.pre==null))));
let GMV=null;
/* (1624) VOTO DEL GM — il metro della lega: l'obiettivo è VINCERE.
   · RISULTATI: conta la posizione di oggi (75%) più le stagioni passate (25%); ogni titolo vale +0,75. Un buon piazzamento passato senza titolo,
     se poi sei tornato indietro, vale poco: «è come se non avessi fatto niente».
   · TRAIETTORIA: posizioni guadagnate dal primo anno a oggi (non i picchi): chi sale stabilmente (Eagles 4→2, Spiders 7→4) è premiato;
     chi risale dopo un anno storto recupera; chi torna indietro dal suo punto più alto senza aver vinto perde. Chi vince sempre = 9,5.
   · MERCATO: valore creato con le mosse dopo l'asta (valore all'arrivo → quanto hanno dato) + tempismo nel cedere i giocatori dell'asta
     (valore alla cessione contro quello che hanno dato dopo, altrove: Jokić ceduto al massimo +, Amen ceduto troppo presto −).
   · TALENTI: scoperte fatte DOPO l'asta (rookie, svincolati, giovani o infortunati presi quando valevano poco), pesate sul prezzo.
   · ASTA: solo la pagella dell'asta. · ROSA DI OGGI: quanto vale la squadra adesso.
   · Chi vince e intanto ringiovanisce la squadra: +0,5. Mai nei primi 3, senza crescere né ricostruire: massimo 6,5. Chi ricostruisce si giudica a parte. */
function gmAll(D){if(GMV&&GMV.k===D.key)return GMV.v;const T=D.T,R={},PM=permanenze(D);
 for(const t of T){const pos=posAnni(t),n=pos.length,pn=pos[n-1],prev=n>1?pos[n-2]:pn,first=pos[0],past=pos.slice(0,-1),tit=past.filter(p=>p===1).length,best=Math.min(...pos);
  const PT=[10,8.5,7.5,6.5,6,5.5,5,4.5],pm=past.length?past.reduce((s,p)=>s+PT[p-1],0)/past.length:PT[pn-1];
  const ris=Math.min(10,PT[pn-1]*.75+pm*.25+.75*tit);
  let tr;if(pn===1&&tit===past.length&&tit>0)tr=9.5;else{tr=6+.6*(first-pn);if(prev>pn)tr+=.4*(prev-pn);if(pn>best&&!(best===1))tr-=.2*(pn-best);tr=Math.max(4.5,Math.min(9.5,tr))}
  const a0=etaTop(t,D.FY),a1=etaTop(t,SNOW),ric=a0!=null&&a1!=null&&a0-a1>=2;
  /* le scelte alte prese grazie al tanking non sono mercato: le avrebbe prese chiunque */
  const L=PM[t]||[],mv=L.filter(x=>x.da>0&&!sceltaAlta(x)),mvTot=mv.reduce((s,x)=>s+x.gainN,0);
  const ced=L.filter(x=>x.da===0&&x.a!=null).map(x=>{let p=0;for(let s=x.a;s<=SNOW;s++)p+=resa(x.n,s);return{...x,dopo:dopoAltrove(x),dopoN:p*pvFit().a+valN(x.n,SNOW,true)}}),gd=ced.reduce((s,x)=>s+(x.finN-x.dopoN),0);
  const crN=Object.values(window.TT_CR_SCAMBI||{}).flat().reduce((s,z)=>s+(z.a===t?z.cr:z.da===t?-z.cr:0),0);
  const tl=mv.filter(scoperta),tal=tl.reduce((s,x)=>s+Math.max(0,x.gainN)*fPrezzo(x),0);
  const giov=!ric&&a0!=null&&a1!=null&&a1<=a0-.5&&pn<=first&&pn<=2;
  /* (1641) i crediti dati o presi negli scambi non entrano più nel mercato: sono solo la moneta; conta quanto rende quello che si è preso (Barnes per 300 crediti: se rende, è un'ottima mossa) */
  R[t]={t,pos,tit,ris,tr,ric,giov,eta:[a0,a1],mvL:mv,mer:mvTot+gd,mvTot,gd,ced,crN,tal,saldo:mvTot,tim:0,
   top:[...mv].sort((a,b)=>b.gain-a.gain).filter(x=>x.gain>=100).slice(0,4),
   flop:[...mv].filter(x=>{if(x.gain<=-100)return true;const q=x.a==null?stat(x.n,SNOW):null;return q&&q.g>=5&&x.pre&&x.pre.g>=15&&x.pre.p>=25&&x.pre.p-q.p>=6}).sort((a,b)=>a.gain-b.gain).slice(0,3),
   scop:[...tl].filter(x=>x.gainN>=100).sort((a,b)=>b.gainN*fPrezzo(b)-a.gainN*fPrezzo(a)).slice(0,8),
   valOggi:L.filter(x=>x.a==null).reduce((s,x)=>s+x.oggi,0)}}
 const MO=nrm45(Object.fromEntries(T.map(t=>[t,R[t].mer]))),TA=nrm45(Object.fromEntries(T.map(t=>[t,R[t].tal]))),VO=nrm45(Object.fromEntries(T.map(t=>[t,R[t].valOggi]))),AS=astaData().T;
 const rk=k=>[...T].sort((a,b)=>R[b][k]-R[a][k]).forEach((t,i)=>R[t]["rk_"+k]=i+1);rk("mer");rk("tal");rk("valOggi");
 for(const t of T){const o=R[t];o.mo=MO[t];o.ta=TA[t];o.vo=VO[t];o.as=AS[t]?AS[t].vx:6;
  let v=o.ric?o.ris*.2+o.tr*.15+o.mo*.3+o.ta*.15+o.as*.05+o.vo*.15:o.ris*.3+o.tr*.2+o.mo*.25+o.ta*.1+o.as*.05+o.vo*.1;if(o.giov)v+=.5;
  o.medio=!o.ric&&!o.pos.some(p=>p<=3)&&o.tr<7;if(o.medio)v=Math.min(v,6.5);o.v=Math.max(4,Math.min(10,Math.round(v*2)/2))}
 GMV={k:D.key,v:R};return R}
/* (1619) I COLPI DEI GM (richiesta di Imma): per ogni franchigia gli acquisti che hanno reso PIÙ di quanto valevano quando sono arrivati.
   Mossa (scambio o svincolato): PDK della stagione prima dell'arrivo contro PDK medi nelle stagioni passate in squadra (almeno +4, e almeno 18 PDK).
   Rookie: almeno 18 PDK nelle stagioni in squadra (rookie di quest'anno: almeno 15). Asta iniziale: pagato fino a 10 crediti e almeno 20 PDK nel 1° anno.
   Non è un colpo chi è stato pagato al massimo ed è calato (Jokić 56 → 46). */
let COLPI=null;
/* (1623) I COLPI = le permanenze che hanno creato più valore di quanto costavano all'arrivo, pesate sul prezzo (le scoperte a poco valgono di più) */
/* (1635) RACCONTO IN PDK delle mosse dopo l'asta: quanto faceva quando è arrivato, quanto ha fatto con la squadra stagione per stagione, dov'è finito */
const pk=v=>String(Math.round(v*10)/10).replace(".",",");
function storiaPDK(x){const sea=[];for(let s=Math.max(1,x.da);s<=(x.a!=null?x.a-1:SNOW);s++){const q=stat(x.n,s);if(q&&q.g>=(s===SNOW?3:10))sea.push(`${pk(q.p)} ${s===SNOW?"quest'anno":"nel "+YL(s)}`)}return sea}
function delta(x){/* PDK con la squadra (media delle stagioni giocate con loro) meno PDK della stagione prima dell'arrivo */const v=[];for(let s=Math.max(1,x.da);s<=(x.a!=null?x.a-1:SNOW);s++){const q=stat(x.n,s);if(q&&q.g>=(s===SNOW?3:10))v.push(q.p)}if(!v.length)return null;const m=v.reduce((a,b)=>a+b,0)/v.length;return x.pre&&x.pre.g>=15?m-x.pre.p:null}
function mossaPDK(x,t){const st=storiaPDK(x),d=delta(x),arr=`preso ${quando(x.da)}${x.rk?" da rookie":x.pre&&x.pre.g>=15?`, quando faceva ${pk(x.pre.p)} PDK`:x.pre&&x.pre.g<15?" mentre era infortunato":""}`;
 const fine=x.a!=null?(()=>{const w=dove(x.n);return` · ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)}${w&&w!==t?` (oggi ${ART("ai",w)})`:""}`})():" · è ancora in squadra";
 return`<b>${E(x.n)}</b> ${arr} → con loro ${st.length?st.join(", "):"poche partite"}${fine}${d!=null?` <b class="${d>=0?"up":"dn"}">${d>=0?"+":"−"}${pk(Math.abs(d))} PDK</b>`:""}`}
function venditaPDK(x,t){const b=stat(x.n,x.a-1),q=stat(x.n,SNOW),w=dove(x.n),c=x.ctx;
 const cambio=c&&c.tipo==="scambio"?` In cambio${c.data?` (${c.data})`:""}: ${c.pr.map(z=>`<b>${E(z.n)}</b> ${pk(z.p)}`).join(", ")}${c.cred&&c.cred.length?` e ${c.cred.join(", ")}`:""}`:c&&c.ins&&c.ins.length?` Nella stessa finestra sono arrivati ${c.ins.map(z=>`<b>${E(z.n)}</b> (oggi ${pk(pdkOra(z.n))})`).join(", ")}`:"";
 return`<b>${E(x.n)}</b> ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)} dopo una stagione da ${pk(b.p)} PDK${w&&w!==t?`: ${ART("con",w)} oggi ne fa ${pk(q.p)}`:`: oggi ne fa ${pk(q.p)}`} <b class="up">(${pk(b.p-q.p)} PDK in meno)</b>${cambio?"."+cambio:""}`}
function erroreVenditaPDK(x,t){const w=dove(x.n),q=stat(x.n,SNOW),b=x.a-1>=0?stat(x.n,x.a-1):null;return`<b>${E(x.n)}</b> ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)}${b&&b.g>=10?` quando faceva ${pk(b.p)} PDK`:x.rk||!b?" da giovane":""}${w&&w!==t?`: ${ART("con",w)}`:": oggi"} ne fa ${q?pk(q.p):"—"}`}
/* (1635) I COLPI DEI GM: asta (crediti), mosse dopo l'asta (scambi, svincolati, rookie: in PDK), vendite al momento giusto; e GLI ERRORI */
/* (1637) SCAMBI VERI di questa stagione (TRADES): chi ha dato chi, e cosa ha ricevuto in cambio */
function scambioDi(n,t){try{if(typeof TRADES==="undefined")return null;const k=tvNm(n);
 for(const tr of TRADES){const L=tr.lati||[];if(L.length<2)continue;const rec=L.filter(l=>(l[1]||[]).some(z=>tvNm(String(z))===k));if(!rec.length)continue;const dest=rec[0][0];
  const giver=tr.da&&Object.keys(tr.da).find(z=>tvNm(z)===k)?tr.da[Object.keys(tr.da).find(z=>tvNm(z)===k)]:(L.length===2?L.find(l=>l[0]!==dest)[0]:null);if(giver!==t)continue;
  const mio=L.filter(l=>l[0]===t).flatMap(l=>l[1]||[]),gioc=mio.filter(z=>!/\bcr\b|crediti|slot/i.test(z)),cred=mio.filter(z=>/\bcr\b|crediti/i.test(z));return{data:tr.data,gioc,cred,dest}}}catch(e){}return null}
/* giudizio della finestra (anni passati, senza lo scambio esatto): valore creato da chi è arrivato meno quello che hanno dato altrove chi è partito */
function bilFinestra(t,y,D){const PM=permanenze(D)[t]||[],ins=PM.filter(x=>x.da===y),outs=PM.filter(x=>x.a===y);return{bil:ins.reduce((s,x)=>s+x.ret-x.costo,0)-outs.reduce((s,x)=>s+(dopoAltrove(x)-x.fin),0),ins}}
function pdkOra(n){const q=stat(n,SNOW);return q&&q.g>=3?q.p:null}
function colpiData(D){if(COLPI&&COLPI.k===D.key)return COLPI.v;const PM=permanenze(D),R={};
 for(const t of D.T){const L=PM[t]||[],C=[],X=[];
  for(const x of L){if(x.da===0){if(x.c!=null){const d=valoreVero(x.n)-x.c;
     /* (1638) il colpo d'asta pesa soprattutto per la stagione migliore fatta CON LA SQUADRA rispetto al prezzo: Giddey a pochi crediti e 34,5 PDK per un anno intero è il colpo più grande */
     let pk0=0;for(let s=1;s<=(x.a!=null?x.a-1:SNOW);s++){const q=stat(x.n,s);if(q&&q.g>=(s===SNOW?10:40))pk0=Math.max(pk0,q.p)}const fp=Math.max(.4,Math.min(1.5,1.5-x.c/40));
     const cheap=x.c<=10;if(d>=15||(pk0>=25&&cheap))C.push({...x,tipo:"asta",picco:pk0,sc:Math.max(d*20,cheap&&pk0>=20?(pk0-15)*60*fp:0)})}continue}
   const d=delta(x);if(x.gain>=175||(d!=null&&d>=4))C.push({...x,tipo:x.rk?"rookie":x.pre&&x.pre.g<15?"infortunato":"mossa",sc:Math.max(x.gain*fPrezzo(x),d!=null?d*90*Math.min(1.4,(x.pre.p+d)/30):0)});/* il salto in PDK pesa di più se porta a un livello alto (19→32 vale più di 10→25) */
   /* errore di acquisto: preso al massimo e poi calato (PDK), o valore crollato; non si giudica chi ha giocato meno di 5 partite quest'anno né un rookie appena preso */
   const q=x.a==null?stat(x.n,SNOW):null,dd=delta(x),presto=(x.a==null&&(!q||q.g<5))||(x.rk&&x.da===SNOW);if(!presto&&((dd!=null&&dd<=-4)||(q&&q.g>=5&&x.pre&&x.pre.g>=15&&x.pre.p>=25&&x.pre.p-q.p>=6)||(x.gain<=-175&&dd!=null&&dd<=-2)))X.push({...x,tipo:"presa",sc:x.gain})}
  /* vendite: ceduto dopo una stagione da almeno 25 PDK e oggi ne fa almeno 5 in meno = venduto al momento giusto; ceduto e poi esploso = errore */
  for(const x of L.filter(x=>x.a!=null)){const b=stat(x.n,x.a-1),q=stat(x.n,SNOW);/* una vendita al momento giusto è una buona mossa, ma pesa meno di un acquisto che cresce: conta quanto era importante il giocatore e fino a 10 PDK di calo */
   /* una vendita è un colpo solo se quello che è arrivato in cambio rende: con lo scambio vero (quest'anno) si confrontano i PDK di oggi;
      per gli anni passati, la finestra di mercato in cui è partito deve essere in attivo (chi è arrivato ha reso più di chi è partito) */
   if(b&&q&&b.g>=15&&q.g>=5&&b.p>=25&&b.p-q.p>=5){const tr=scambioDi(x.n,t);let ok=false,ctx=null;
    if(tr&&tr.gioc.length){const pr=tr.gioc.map(z=>({n:z,p:pdkOra(z)})).filter(z=>z.p!=null);const tot=pr.reduce((s,z)=>s+z.p,0);ok=tot>=q.p;ctx={tipo:"scambio",data:tr.data,pr,cred:tr.cred}}
    else{const F=bilFinestra(t,x.a,D),arr=F.ins.filter(z=>pdkOra(z.n)!=null).sort((a,b)=>pdkOra(b.n)-pdkOra(a.n)),top2=arr.slice(0,2).reduce((s,z)=>s+pdkOra(z.n),0);ok=F.bil>0&&top2>=q.p;ctx={tipo:"finestra",ins:arr.slice(0,3)}}
    if(ok)C.push({...x,tipo:"vendita",ctx,sc:Math.min(10,b.p-q.p)*25*(b.p/30)})}
   /* errore di cessione: dopo la cessione è cresciuto (oggi almeno 3 PDK in più della stagione prima della cessione; un giovane senza stagione vera: oggi almeno 22) */
   const dp=dopoAltrove(x);if(q&&q.g>=5&&((b&&b.g>=10&&q.p-b.p>=3&&q.p>=18)||((!b||b.g<10)&&q.p>=22)))X.push({...x,tipo:"cessione",sc:-Math.max(1,dp-x.fin)})}
  C.sort((a,b)=>b.sc-a.sc);X.sort((a,b)=>a.sc-b.sc);R[t]=C;R[t].errori=X}
 COLPI={k:D.key,v:R};return R}
function colpoTxt(o,t){return o.tipo==="asta"?mossaTxt(o,t):o.tipo==="vendita"?venditaPDK(o,t):mossaPDK(o,t)}
function vColpi(D){const C=colpiData(D),sc=t=>(C[t]||[]).reduce((s,x)=>s+x.sc,0)+(C[t].errori||[]).reduce((s,x)=>s+x.sc,0)*.5,V=nrm45(Object.fromEntries(D.T.map(t=>[t,sc(t)]))),L=D.T.slice().sort((a,b)=>sc(b)-sc(a));
 const ic={asta:"🔨",rookie:"🍼",infortunato:"🩹",mossa:"💥",vendita:"💰"};
 return`<div class="tth">💥 I colpi dei GM</div><p class="ttn small">Per ogni squadra i colpi di tutta la sua storia: <b>🔨 l'asta iniziale</b> (pagato quanto, e quanto andava pagato col senno di poi, in crediti d'asta), <b>💥 gli scambi e gli svincolati</b> presi prima che crescessero e <b>🍼 i rookie</b> (quanto faceva quando è arrivato, quanto ha fatto con loro, in PDK), <b>💰 le vendite al momento giusto</b> (ceduto al suo massimo, poi calato). Sotto, <b>gli errori</b>: presi al massimo e calati, o ceduti troppo presto. Il voto mette insieme colpi ed errori, confrontati con le altre squadre. Tocca una squadra per i dettagli.</p>
 <div class="ttpr">${L.map((t,i)=>{const c=C[t]||[],x=c.errori||[];return`<details class="ttasd ttcol"><summary class="ttprr gm"><b>${i+1}</b>${lg(t)}<span>${TEAMS[t].nick}<small class="wrap">${c.length?`${c.length} colp${c.length===1?"o":"i"}, ${x.length} error${x.length===1?"e":"i"} · il migliore: ${E((c.find(o=>o.tipo!=="vendita")||c[0]).n)}`:"nessun colpo finora"}</small></span><span class="ttvr"><span class="ttvoto sm v${Math.floor(V[t])}">${vf(Math.round(V[t]*2)/2)}</span><i class="ttchev">▾</i></span></summary><div class="ttcolpi">${c.length?c.slice(0,20).map(o=>`<p class="ttn small">${ic[o.tipo]||"💥"} ${colpoTxt(o,t)}.</p>`).join(""):`<p class="ttn small">Nessun colpo finora.</p>`}${x.length?`<p class="ttn small"><b>❌ Gli errori</b></p>${x.slice(0,6).map(o=>`<p class="ttn small">${o.tipo==="cessione"?"💔":"📉"} ${o.tipo==="cessione"?erroreVenditaPDK(o,t):mossaPDK(o,t)}.</p>`).join("")}`:""}</div></details>`}).join("")}</div>`}
window.ttGmAll=()=>gmAll(analisiData());window.ttColpi=()=>colpiData(analisiData());window.ttAsta=()=>astaData();/* per controllare i voti dalla console */
function vGmComp(t,D){const o=gmAll(D)[t];if(!o)return"";const rp=rimpianti(t,D).slice(0,2);
 return`<div class="ttasv">${[["🏆","Risultati",o.ris,o.pos.map(p=>p+"°").join(" → ")],["🧭","Traiettoria",o.tr,""],["🔁","Mercato",o.mo,o.rk_mer+"° su 8"],["🔭","Talenti",o.ta,o.rk_tal+"° su 8"],["🔨","Asta",o.as,""],["💼","Rosa oggi",o.vo,r0(o.valOggi)+" pt"]].map(([ic,l,v,e])=>`<div><small>${ic} ${l}</small><span class="ttvoto xs v${Math.floor(v)}">${vf(Math.round(v*2)/2)}</span><em>${e}</em></div>`).join("")}</div>
 ${o.top.length?`<p class="ttn small">✅ <b>Le mosse migliori</b>: ${o.top.slice(0,3).map(x=>mossaTxt(x,t)).join(" · ")}.</p>`:""}${o.flop.length?`<p class="ttn small">❌ <b>Le peggiori</b>: ${o.flop.map(x=>mossaTxt(x,t)).join(" · ")}.</p>`:""}${rp.length?`<p class="ttn small">💔 <b>Ceduti troppo presto</b>: ${rp.map(x=>rimpTxt(x,t)).join(" · ")}.</p>`:""}
 ${o.medio?`<p class="ttn small">➖ Mai nei primi 3, senza crescere e senza ricostruire: voto frenato.</p>`:""}${o.giov?`<p class="ttn small">🌱 Vince e intanto ringiovanisce: età media dei 10 migliori da ${f1(o.eta[0])} a ${f1(o.eta[1])} anni (+0,5).</p>`:""}${o.tit?`<p class="ttn small">🏆 ${o.tit} ${o.tit===1?"titolo":"titoli"} vinti.</p>`:""}`}
let ASTA=null;
/* valore «col senno di poi» di un giocatore dal draft a oggi: PDK sopra il rimpiazzo prodotti in ogni stagione (con chiunque) + quanto vale oggi */
function valoreVero(n){let v=0;for(let y=1;y<=SNOW;y++)v+=resa(n,y);return(v+valore(n,SNOW,true,null))*kCred()}
function astaData(){const D=analisiData(),key=D.key+"|"+JSON.stringify(Object.keys(TT_DRAFT).map(t=>TT_DRAFT[t].length));if(ASTA&&ASTA.key===key)return ASTA;
 /* (1624) PAGELLA DELL'ASTA = solo il lavoro fatto all'asta. Per ogni giocatore preso: «VALEVA» = il suo valore vero col senno di poi
    (PDK sopra il rimpiazzo prodotti in ogni stagione dal 24/25 a oggi, con chiunque abbia giocato, + quanto vale oggi), in crediti.
    Non conta se la squadra lo ha ancora: cederlo bene o male è MERCATO, non asta (Amen Thompson a 1 credito è un affare d'asta dei Dolphins;
    averlo ceduto subito per poco è un errore di mercato dei Dolphins). Voto: 80% valore ricavato contro crediti spesi, 20% forza della rosa costruita (PDK veri del 24/25). */
 const K=kCred(),SS=[];for(let y=1;y<=SNOW;y++)SS.push({lab:YL(y)+(y===SNOW?" (in corso)":""),y});
 const PM=permanenze(D),P=[];for(const t in TT_DRAFT)for(const[n,r,c]of TT_DRAFT[t]){const st=(PM[t]||[]).find(x=>x.da===0&&tvNm(x.n)===tvNm(n)),fair=valoreVero(n);
  P.push({t,n,r,c,fair,gain:c!=null?fair-c:null,st,per:SS.map(s=>({lab:s.lab,u:resa(n,s.y)*K})),via:st&&st.a!=null?st.a:null})}
 const preso=new Set(P.map(x=>tvNm(x.n))),V=svData(),nomi={};for(let y=1;y<=SNOW;y++){const S=V.S[y]||{};for(const k in S)if(!preso.has(k))nomi[k]=S[k].n||nomi[k]||k}
 /* (1631) «dimenticato» = un giocatore che all'asta (estate 2024) si poteva prendere: già in NBA nel 23/24, oppure rookie del draft NBA 2024
    (prima stagione 24/25). Chi è arrivato in NBA dopo (Flagg, rookie 2025) all'asta non esisteva e non può essere un dimenticato. */
 const ok=k=>!!((V.S[0]&&V.S[0][k])||(V.S[1]&&V.S[1][k]));
 const dim=Object.keys(nomi).filter(ok).map(k=>({n:nomi[k],fair:valoreVero(nomi[k])})).filter(x=>x.fair>=30).sort((a,b)=>b.fair-a.fair);
 const nmOf=k=>{for(const t in ROSTER){const p=(ROSTER[t]||[]).find(z=>tvNm(z[0])===k);if(p)return p[0]}return null};dim.forEach(x=>{const r=nmOf(tvNm(x.n));if(r)x.n=r});
 const T={};for(const t of Object.keys(TEAMS)){const L=P.filter(x=>x.t===t);if(!L.length)continue;const KK=L.filter(x=>x.c!=null);
  const spent=KK.reduce((s,x)=>s+x.c,0),got=KK.reduce((s,x)=>s+x.fair,0),gain=got-spent;
  const gems=KK.filter(x=>x.c<=10&&x.gain>=15).sort((a,b)=>b.gain-a.gain),stars=KK.filter(x=>x.c>=40),flops=KK.filter(x=>x.gain<=-15).sort((a,b)=>a.gain-b.gain);
  const per=SS.map((s,i)=>({lab:s.lab,u:L.reduce((q,x)=>q+x.per[i].u,0)}));
  T[t]={t,L:L.sort((a,b)=>(b.gain??-1e9)-(a.gain??-1e9)),spent,got,gain,gems,stars,flops,per,fz:forzaVera(t,0),
   x:{tot:gain,gems:gems.reduce((s,x)=>s+x.gain,0),stars:stars.reduce((s,x)=>s+x.gain,0),spreco:-flops.reduce((s,x)=>s+x.gain,0)}}}
 const sc=(k,inv)=>{const L=Object.values(T),xs=L.map(o=>inv?-o.x[k]:o.x[k]),mn=Math.min(...xs),mx=Math.max(...xs);L.forEach((o,i)=>{o.v=o.v||{};o.v[k]=Math.round((4.5+(mx>mn?(xs[i]-mn)/(mx-mn):.5)*5)*2)/2});[...L].sort((a,b)=>(inv?a.x[k]-b.x[k]:b.x[k]-a.x[k])).forEach((o,i)=>{o.rk=o.rk||{};o.rk[k]=i+1})};
 sc("tot");sc("gems");sc("stars");sc("spreco",true);
 const mmv=f=>{const L=Object.values(T),xs=L.map(f),mn=Math.min(...xs),mx=Math.max(...xs);return L.map((o,i)=>4.5+(mx>mn?(xs[i]-mn)/(mx-mn):.5)*5)};
 {const L=Object.values(T),fz=mmv(o=>o.fz),gn=mmv(o=>o.gain);L.forEach((o,i)=>{o.vx=gn[i]*.8+fz[i]*.2;o.voto=Math.round(o.vx*2)/2})}
 [...Object.values(T)].sort((a,b)=>b.vx-a.vx).forEach((o,i)=>o.pos=i+1);
 return ASTA={key,SS,P,T,dim}}
const cr=v=>`${v>=0?"+":""}${Math.round(v)}`;
function astaGiudizio(o){const g=o.gems[0],s=[...o.stars].sort((a,b)=>b.gain-a.gain)[0],f=o.flops[0],P=[];
 P.push(`Ha speso <b>${o.spent}</b> crediti per giocatori che, visto come sono andati (PDK prodotti dal 24/25 a oggi + quanto valgono oggi), ne valgono <b>${Math.round(o.got)}</b>: ${o.gain>=0?`<b class="up">${cr(o.gain)}</b> di valore creato`:`<b class="dn">${cr(o.gain)}</b>, ha pagato più di quanto ha avuto`}.`);
 if(s)P.push(s.gain>=0?`La stella giusta: <b>${E(s.n)}</b>, pagato ${s.c} e valso ${Math.round(s.fair)}${s.gain>=30?" — anche a quella cifra conveniva prenderlo":""}.`:`La stella pagata cara: <b>${E(s.n)}</b>, ${s.c} crediti per un valore di ${Math.round(s.fair)}.`);
 if(g)P.push(`Il talento nascosto: <b>${E(g.n)}</b> a ${g.c} ${g.c===1?"credito":"crediti"}, valso ${Math.round(g.fair)}.${o.gems.length>1?` Altri affari: ${o.gems.slice(1,4).map(x=>`<b>${E(x.n)}</b> ${x.c}→${Math.round(x.fair)}`).join(", ")}.`:""}`);
 if(f)P.push(`Lo spreco: <b>${E(f.n)}</b>, ${f.c} crediti per un valore di ${Math.round(f.fair)}.`);
 return P}
function vAstaTeam(t,full){const A=astaData(),o=A.T[t];if(!o)return"";
 return`<div class="ttasta"><div class="ttpagh"><span class="ttvoto v${Math.floor(o.voto)}">${vf(o.voto)}</span><span><small>Pagella dell'asta · draft iniziale</small><b>${o.pos}° su 8 · ${o.gain>=0?"+":""}${Math.round(o.gain)} crediti di valore</b><em>${astaGiudizio(o).join(" ")}</em></span></div>
 <div class="ttasv">${[["tot","💰","Valore creato"],["gems","💎","Talenti nascosti"],["stars","⭐","Big pagati bene"],["spreco","🗑️","Zero sprechi"]].map(([k,ic,l])=>`<div><small>${ic} ${l}</small><span class="ttvoto xs v${Math.floor(o.v[k])}">${vf(o.v[k])}</span><em>${o.rk[k]}° su 8</em></div>`).join("")}</div>
 <div class="ttasy">${o.per.map(p=>`<span><small>${p.lab}</small><b>${Math.round(p.u)}</b></span>`).join("")}<em>Valore in crediti prodotto, anno per anno, dai giocatori presi all'asta (con qualunque squadra)</em></div>
 ${full?`<div class="ttasl"><div class="ttash"><span>Giocatore</span><span>Pagato</span><span>Valeva</span><span>±</span></div>${o.L.map(x=>`<div class="ttasr"><span><i>${x.r==="F"?"A":x.r}</i><b>${E(x.n)}${x.via!=null?` <small>ceduto ${x.via===SNOW?"quest'anno":"nel "+YL(x.via)}</small>`:""}</b></span><span>${x.c??"?"}</span><span>${Math.round(x.fair)}</span><span class="${x.gain==null?"":x.gain>=0?"up":"dn"}">${x.gain==null?"—":cr(x.gain)}</span></div>`).join("")}</div>`:""}
 </div>`}
/* (1218) I ROOKIE DI QUEST'ANNO: chi li ha scoperti meglio, pesando il prezzo pagato (vale anche per i draft futuri: si legge dalle rose di ogni stagione) */
function vRookie(){const L=[];let mxg=0;const M=med();for(const k in M)mxg=Math.max(mxg,M[k].g);
 for(const t of Object.keys(TEAMS))for(const z of(ROSTER[t]||[])){const n=z[0];let rk=false;try{rk=isRookie(n)}catch(e){}if(!rk)continue;const c=prezzoDi(t,SNOW,n),ch=chiDi(SNOW,n),R=rookieVal(n);L.push({t:ch||t,ora:ch&&ch!==t?t:null,n,c,dopo:dopoDi(SNOW,n),p:R.ppg||0,g:R.g,V:R.V,R})}
 if(!L.length)return"";const K=L.filter(x=>x.c!=null),SP=K.reduce((s,x)=>s+x.c,0),SV=K.reduce((s,x)=>s+x.V,0);
 /* come per l'asta iniziale: i crediti spesi per i rookie si ridistribuiscono in proporzione a quanto rendono (PDK sopra 8, per le partite giocate) */
 L.forEach(x=>{x.fair=SV?SP*x.V/SV:null;x.gain=x.c!=null&&x.fair!=null?x.fair-x.c:null});L.sort((a,b)=>(b.gain??-1e9)-(a.gain??-1e9)||b.p-a.p);
 const sq={};L.forEach(x=>{if(x.gain!=null)sq[x.t]=(sq[x.t]||0)+x.gain});const best=Object.keys(sq).sort((a,b)=>sq[b]-sq[a])[0];
 return`<div class="tth">🍼 La caccia ai rookie · ${SLAB(SNOW)}</div><p class="ttn small">I rookie di quest'anno con il prezzo pagato all'asta del draft. «Valeva» = i crediti spesi per tutti i rookie ridistribuiti in base al loro valore da rookie: conta soprattutto l'<b>efficienza</b> (PDK al minuto), poi i <b>PDK</b> che fanno già (12-13 normali, 15-17 tanta roba), la <b>crescita</b> (minuti e PDK delle ultime 5 partite) e l'<b>età</b>: un rookie di 19-20 anni che rende già vale molto più di uno di 23-24, che deve rendere subito. Si aggiorna da solo a ogni partita. ${best&&sq[best]>0?`Per ora il miglior cacciatore: <b>${TEAMS[best].nick}</b> (${cr(sq[best])} crediti di valore).`:""}</p>
 <div class="ttasl"><div class="ttash rk"><span>Rookie</span><span>Costo</span><span>PDK</span><span>Eff.</span><span>Valeva</span><span>±</span></div>${L.map(x=>`<div class="ttasr rk"><span>${lg(x.t)}<b>${E(x.n)}${x.R&&x.R.age!=null?` <small>${Math.floor(x.R.age)} anni</small>`:""}${(()=>{const nt=((window.TT_ASTA_NOTE||{})[SNOW]||{})[x.n];return(nt?` <small>${E(nt)}</small>`:x.dopo?" <small>dopo il draft</small>":"")+(x.ora?` <small>scelto da loro, ora ${ART("ai",x.ora)}</small>`:"")})()}</b></span><span>${x.c!=null?String(x.c).replace(".",","):"?"}</span><span>${x.g?f1(x.p):"—"}</span><span title="${x.g?`${f1(x.R.mpg)} min${x.R.trM>.1?", minuti in crescita":x.R.trM<-.1?", minuti in calo":""}`:""}">${x.g?(Math.round(x.R.eff*100)/100).toLocaleString("it-IT",{minimumFractionDigits:2})+(x.R.trM>.1?"↑":x.R.trM<-.1?"↓":""):"—"}</span><span>${x.c!=null&&x.fair!=null?Math.round(x.fair):"—"}</span><span class="${x.gain==null?"":x.gain>=0?"up":"dn"}">${x.gain==null?"—":(x.gain>=50?"💎 ":"")+cr(x.gain)}</span></div>`).join("")}</div>
 ${L.some(x=>x.c==null)?`<p class="ttn small">Senza prezzo d'asta (non entrano nel conto): ${L.filter(x=>x.c==null).map(x=>E(x.n)).join(", ")}.</p>`:""}`}
function vAstaLega(){const A=astaData(),L=Object.values(A.T).sort((a,b)=>a.pos-b.pos);if(!L.length)return"";
 const all=A.P.filter(x=>x.gain!=null),best=[...all].sort((a,b)=>b.gain-a.gain)[0],worst=[...all].sort((a,b)=>a.gain-b.gain)[0],steal=[...all].filter(x=>x.c<=3).sort((a,b)=>b.fair-a.fair)[0];
 const card=(ic,ti,body)=>`<div class="ttcard"><small>${ic} ${ti}</small>${body}</div>`;
 return`<div class="tth">🔨 La pagella dell'asta</div><p class="ttn small">Solo il lavoro fatto all'asta del draft iniziale (8 squadre, 300 crediti, base 1). Per ogni giocatore preso, «valeva» = il suo valore vero col senno di poi: PDK sopra il rimpiazzo prodotti in ogni stagione dal 24/25 a oggi, con qualunque squadra, più quanto vale oggi. Non conta se la squadra lo ha ancora: averlo ceduto bene o male si giudica nel mercato. Voto: 80% valore ricavato contro crediti spesi, 20% forza della rosa costruita all'asta (PDK veri del 24/25).</p>
 <div class="ttcards">${best?card("💰","Il miglior acquisto",`<b>${lg(best.t)} ${E(best.n)}</b><em>pagato ${best.c} crediti, ne valeva ${Math.round(best.fair)}</em>`):""}${steal?card("💎","Il furto",`<b>${lg(steal.t)} ${E(steal.n)}</b><em>pagato ${steal.c} ${steal.c===1?"credito":"crediti"}, ne valeva ${Math.round(steal.fair)}</em>`):""}
 ${worst?card("🗑️","Il più strapagato",`<b>${lg(worst.t)} ${E(worst.n)}</b><em>pagato ${worst.c} crediti, ne valeva ${Math.round(worst.fair)}</em>`):""}${A.dim[0]?card("👻","Il dimenticato",`<b>${E(A.dim[0].n)}</b><em>nessuno lo ha preso, ne valeva ${Math.round(A.dim[0].fair)}</em>`):""}</div>
 <div class="ttpr">${L.map(o=>`<details class="ttasd"><summary class="ttprr gm"><b>${o.pos}</b>${lg(o.t)}<span>${TEAMS[o.t].nick}<small>ha speso ${o.spent} crediti per giocatori che ne valevano ${Math.round(o.got)}: <b class="${o.gain>=0?"up":"dn"}">${cr(o.gain)}</b></small></span><span class="ttvr"><span class="ttvoto sm v${Math.floor(o.voto)}">${vf(o.voto)}</span><i class="ttchev">▾</i></span></summary>${vAstaTeam(o.t,true)}</details>`).join("")}</div>
 ${A.dim.length?`<p class="ttn small">👻 <b>I dimenticati dell'asta</b> (all'asta c'erano, ma nessuno li ha presi): ${A.dim.slice(0,8).map(x=>`${E(x.n)} (ne valeva ${Math.round(x.fair)})`).join(", ")}.</p>`:""}
 ${shBtn("asta","Condividi la pagella dell'asta")}`}
async function shareAsta(btn){const A=astaData(),L=Object.values(A.T).sort((a,b)=>a.pos-b.pos);try{await document.fonts.load('800 italic 40px "Barlow Condensed"')}catch(e){}
 const RH=118,top=300,H=top+L.length*RH+110,{cv,X}=ttCanvas(H);ttTop(X,"La pagella dell'asta",`Draft iniziale · 300 crediti a testa · quanto valevano davvero i giocatori, visto come sono andati`);
 for(let i=0;i<L.length;i++){const o=L[i],y=top+i*RH;X.fillStyle=i%2?"rgba(255,255,255,.05)":"rgba(255,255,255,.10)";shRR(X,40,y,1000,RH-12,18);X.fill();
  X.fillStyle="#fff";X.font=CF(800,50);X.textAlign="center";X.fillText(String(i+1),95,y+66);await shLogoAt(X,o.t,135,y+12,80);
  X.textAlign="left";X.font=CF(800,46);X.fillText(TEAMS[o.t].nick.toUpperCase(),232,y+54);X.fillStyle="#c7d2fe";X.font=CB(600,25);
  const g=o.gems[0];X.fillText(`spesi ${o.spent} crediti, valevano ${Math.round(o.got)} (${cr(o.gain)})${g?` · 💎 ${g.n} ${g.c}→${Math.round(g.fair)}`:""}`.slice(0,64),232,y+90);
  const vc=o.voto>=8?"#8b5cf6":o.voto>=7?"#16a34a":o.voto>=6?"#d97706":"#dc2626";X.fillStyle=vc;shRR(X,900,y+18,110,70,16);X.fill();X.fillStyle="#fff";X.textAlign="center";X.font=CF(800,50);X.fillText(vf(o.voto),955,y+70)}
 ttFoot(X,H);shSend(cv,"pagella-asta.png","⏳ La pagella dell'asta · Dreamers",btn)}
/* nella pagina della squadra (Roster): pagella del GM e pagella dell'asta, con il tasto per aprire tutto nella Macchina del tempo */
window.ttTeamCard=function(t){try{const D=analisiData(),P=pagella(t,D),C=categorie(D)[t]||{};if(!P)return"";
 return`<section class="ttteam"><h4>🧠 Pagella del GM <small>Macchina del tempo</small></h4>
 <div class="ttpagh"><span class="ttvoto v${Math.floor(P.v)}">${vf(P.v)}</span><span><b>${P.dir[0]} ${P.dir[1]}</b><em>Il GM ${vo(t)?"degli":"dei"} ${TEAMS[t].nick} ${P.dir[2]}. Tra le 8: ${P.p1}° nel ${YL(1)} → ${P.p3}° oggi.</em></span></div>
 <div class="ttasv">${CATS.filter(([k])=>C[k]).map(([k,ic,l])=>`<div><small>${ic} ${l==="Scopritore di talenti"?"Talenti":l}</small><span class="ttvoto xs v${Math.floor(C[k].v)}">${vf(C[k].v)}</span><em>${C[k].rk}° su 8</em></div>`).join("")}</div>
 ${vAstaTeam(t,true)}
 <button class="ttsh" type="button" data-ttgo="${t}">⏳ Apri l'analisi completa</button></section>`}catch(e){console.error(e);return""}};
{const sync=()=>{try{if(typeof cur==="undefined"||cur!=="roster"||typeof curTeam==="undefined")return;const v=document.querySelector("main .rostc");if(!v)return;const ex=document.getElementById("ttteamw");if(ex&&ex.dataset.t===curTeam)return;if(ex)ex.remove();
  const h=window.ttTeamCard(curTeam);if(!h)return;v.insertAdjacentHTML("afterend",`<div id="ttteamw" data-t="${curTeam}">${h}</div>`)}catch(e){}};
 new MutationObserver(sync).observe(document.getElementById("main")||document.body,{childList:true,subtree:true});
 document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ttgo]");if(!b)return;e.preventDefault();e.stopPropagation();cur="giochi";GAME="tempo";TT.mode="analisi";TT.view=null;TT.art=b.dataset.ttgo;render();setTimeout(()=>{const d=[...document.querySelectorAll(".ttart")].find(x=>x.open);if(d)d.scrollIntoView({block:"start"});else scrollTo(0,0)},60)},true)}
function vPagella(t,D){const P=pagella(t,D);if(!P)return"";const nk=TEAMS[t].nick;
 return`<div class="ttpag"><div class="ttpagh"><span class="ttvoto v${Math.floor(P.v)}">${String(P.v).replace(".",",")}</span><span><small>Pagella del GM</small><b>${P.dir[0]} ${P.dir[1]}</b><em>Il GM ${vo(t)?"degli":"dei"} ${nk} ${P.dir[2]}. Tra le 8 franchigie: ${P.p1}° nel ${YL(1)} → ${P.p3}° oggi.</em></span></div>
 ${vGmComp(t,D)}${vCatPag(t,D)}${P.es.map((e,i)=>vEstate(e,t,i)).join("")}${shBtn("pag|"+t,"Condividi la pagella")}</div>`}
function vClassGM(D){const G=gmAll(D),L=D.T.map(t=>pagella(t,D)).filter(Boolean).sort((a,b)=>b.v-a.v||b.d-a.d),C=L.filter(x=>!G[x.t].ric),R=L.filter(x=>G[x.t].ric);
 const row=(x,i)=>`<div class="ttprr gm"><b>${i+1}</b>${lg(x.t)}<span>${TEAMS[x.t].nick}<small>${G[x.t].ric?"🌱 In ricostruzione":x.dir[0]+" "+x.dir[1]} · ${G[x.t].pos.map(p=>p+"°").join(" → ")}</small></span><span class="ttvoto sm v${Math.floor(x.v)}">${String(x.v).replace(".",",")}</span></div>`;
 return`<div class="tth">La classifica dei GM</div><p class="ttn small">Il voto si basa sul <b>valore dei giocatori nel tempo</b>: per ogni giocatore passato da una squadra, quanto valeva quando è arrivato (PDK delle stagioni prima, efficienza, età) e quanto ha dato (PDK prodotti stagione per stagione + valore alla cessione o di oggi), in crediti d'asta. Pesi: <b>risultati</b> 30% (soprattutto la posizione di oggi), <b>traiettoria</b> 20% (chi sale; chi scende dal suo punto più alto perde), <b>mercato e gestione</b> 25%, <b>talenti</b> 10%, <b>valore della rosa di oggi</b> 10%, <b>asta</b> 5%. Chi non arriva mai nei primi 3, senza crescere né ricostruire, ha il voto frenato; chi ricostruisce si giudica a parte, su mercato, talenti e valore. Gli infortuni contano come sfortuna, non come errori. Si riscrive da solo con ogni turno, trade e stagione.</p>
 <div class="ttpr">${C.map(row).join("")}</div>${R.length?`<div class="tth">🌱 In ricostruzione</div><div class="ttpr">${R.map(row).join("")}</div>`:""}${shBtn("gm","Condividi la classifica dei GM")}`}
function articolo(t,D){const A=D.F[t],YY=D.Y.filter(y=>A[y]),L3=YY.map(y=>A[y]),a=L3[0],c=A[SNOW];if(!a||!c||L3.length<2)return"";const nk=TEAMS[t].nick,G=gmAll(D)[t],P0=pagella(t,D),PM=permanenze(D)[t]||[];
 const P=[],ord=p=>p+"°",anni=G.pos.map((p,i)=>i===G.pos.length-1?`oggi ${ord(p)}`:`${ord(p)} nel ${YL(i+1)}`).join(", ");
 /* 1. il percorso vero */
 P.push(`<b>Il percorso.</b> ${anni[0].toUpperCase()+anni.slice(1)}. ${P0.dir[0]} <b>${P0.dir[1]}</b>: il GM ${P0.dir[2]}.`);
 /* 2. il mercato, in valore */
 const top=G.top.slice(0,3),flop=G.flop.slice(0,2);
 const fin=D.Y.slice(1).map((y,i)=>{const a=D.Y[i],ins=PM.filter(x=>x.da===y),outs=PM.filter(x=>x.a===y).map(x=>({...x,dopo:dopoAltrove(x)}));return{a,y,b:ins.reduce((s,x)=>s+x.ret-x.costo,0)-outs.reduce((s,x)=>s+x.dopo-x.fin,0),ins,outs}}).sort((p,q)=>q.b-p.b);const fb=fin[0],fw=fin[fin.length-1];
 P.push(`<b>Il mercato.</b> Con le mosse fatte dopo l'asta ha creato <b>${crs(G.mvTot)}</b> punti di valore (${G.rk_mer}° tra le 8 per mercato e gestione).${fb&&fb.b>0?` La finestra migliore: ${fb.a===0?"i primi mesi dopo il draft":`l'estate ${YLs(fb.a)} → ${YLs(fb.y)}`} (${crs(fb.b)}), quando ${fb.outs.length?`ha ceduto ${nomiS(fb.outs.sort((p,q)=>q.fin-p.fin).slice(0,2))} e `:""}ha preso ${nomiS(fb.ins.sort((p,q)=>q.ret-p.ret).slice(0,3))}.`:""}${fw&&fw!==fb&&fw.b<-200?` La peggiore: ${fw.a===0?"i primi mesi dopo il draft":`l'estate ${YLs(fw.a)} → ${YLs(fw.y)}`} (${crs(fw.b)}).`:""}${top[0]?` Il colpo: ${mossaTxt(top[0],t)}.`:""}${flop[0]?` L'errore: ${mossaTxt(flop[0],t)}.`:""}`);
 /* 3. vendite al momento giusto e rimpianti */
 const ven=PM.filter(x=>x.a!=null).map(x=>({...x,dopo:dopoAltrove(x)})).filter(x=>{if(x.fin-x.dopo>=175&&x.fin>=600)return true;const b=stat(x.n,x.a-1),q=stat(x.n,SNOW);return b&&q&&b.g>=15&&q.g>=5&&b.p>=25&&b.p-q.p>=6}).sort((a,b)=>(b.fin-b.dopo)-(a.fin-a.dopo)).slice(0,2),rp=rimpianti(t,D).slice(0,2);
 if(ven.length||rp.length)P.push(`<b>Le cessioni.</b>${ven.length?` Venduti al momento giusto: ${ven.map(x=>{const b=stat(x.n,x.a-1),q=stat(x.n,SNOW);return`<b>${E(x.n)}</b> ceduto ${x.a===SNOW?"quest'anno":"nel "+YL(x.a)}${b&&b.g>=15?` dopo una stagione da ${f1(b.p)} PDK`:""}${q&&q.g>=5?`, oggi ne fa ${f1(q.p)}`:`, poi ha dato ${r0(x.dopo)}`}`}).join("; ")}.`:""}${rp.length?` Ceduti troppo presto: ${rp.map(x=>rimpTxt(x,t)).join("; ")}.`:""}`);
 /* 4. talenti */
 /* 5. oggi e domani: valore della rosa, età, prospettiva */
 const eta=G.eta[1],vo=G.valOggi,rk=G.rk_valOggi;const fut=eta==null?"":eta<=25.5&&rk<=4?"una rosa giovane e già di valore: il futuro è suo":eta<=25.5?"una rosa giovane: il valore deve ancora arrivare":eta>=29&&rk<=3?"una rosa forte ma avanti con l'età: la finestra per vincere è adesso, poi andrà rinnovata":eta>=29?"una rosa vecchia e senza tanto valore: va rinnovata presto":rk<=3?"una rosa forte e nel pieno della carriera":"una rosa di mezzo, né da titolo né da ricostruzione";
 P.push(`<b>Oggi e domani.</b> La rosa di oggi vale <b>${r0(vo)}</b> punti (${rk}° tra le 8), età media dei 10 migliori ${eta!=null?f1(eta):"—"} anni: ${fut}.`);
 /* 6. la simulazione «e se fossi rimasto» */
 P.push(`<i>La rosa di sempre</i> (il meglio di tutte le annate) farebbe ${f1(D.ALL[t].f)} a turno: ${nomi(D.ALL[t].best.slice(0,3))}.`);
 return`<details class="ttart"${TT.art===t?" open":""}><summary>${lg(t)}<span><b>${nk}</b><small>${P0.dir[0]} ${P0.dir[1]} · GM ${vf(G.v)}</small></span><span class="ttspk">${L3.map(x=>`<i style="height:${Math.max(8,Math.round(x.f/D.V[0].f*34))}px" title="${YN[x.y]}"></i>`).join("")}</span></summary>
 <div class="ttart-b"><div class="ttrks" style="grid-template-columns:repeat(${L3.length},1fr)">${L3.map(x=>`<div><small>${YN[x.y]}</small><b>${f1(x.f)}</b><em>${x.rk}° di sempre</em></div>`).join("")}</div>${P.slice(0,-1).map(p=>`<p>${p}</p>`).join("")}${vControfatt(t,D)}<p>${P[P.length-1]}</p>${vPagella(t,D)}</div></details>`}
function vAnalisi(){const D=analisiData();if(!D.K.length)return`<p class="ttn">Servono turni chiusi per le analisi.</p>`;
 const fy=t=>D.F[t][D.Y.find(y=>D.F[t][y])],T=D.T.filter(t=>fy(t)&&D.F[t][SNOW]&&fy(t)!==D.F[t][SNOW]),dd=t=>(D.F[t][SNOW].f/fy(t).f-1)*100,S=[...T].sort((p,q)=>dd(q)-dd(p));
 const up=S[0],dn=S[S.length-1];
 const CP=colpiData(D),col=[];T.forEach(t=>(CP[t]||[]).filter(x=>x.tipo!=="vendita").forEach(x=>col.push({...x,t})));col.sort((a,b)=>b.sc-a.sc);
 const rim=[];T.forEach(t=>rimpianti(t,D).forEach(x=>rim.push({...x,t,w:dove(x.n)})));rim.sort((a,b)=>b.rimp-a.rimp);
 const ver=[...D.ALL?T.map(t=>({t,f:D.ALL[t].f})):[]].sort((a,b)=>b.f-a.f);
 const card=(ic,ti,body)=>`<div class="ttcard"><small>${ic} ${ti}</small>${body}</div>`;
 return`<div class="ttrub"><div class="ttmast"><small>Rubrica</small><b>Ieri, oggi, domani</b><em>Come sono cambiate le franchigie dal ${YL(D.FY)} a oggi. Unico metro per tutti gli anni: i PDK veri di questa stagione, ${D.K.length} turni chiusi.</em></div>
 <div class="ttcards">
 ${card("🚀","La più cresciuta",`<b>${lg(up)} ${TEAMS[up].nick}</b><em>${pc(dd(up))} rispetto al ${YL(D.FY)}</em>`)}
 ${card("🧨","La più in calo",`<b>${lg(dn)} ${TEAMS[dn].nick}</b><em>${pc(dd(dn))} rispetto al ${YL(D.FY)}</em>`)}
 
 ${rim[0]?card("💔","Il rimpianto più grande",`<b>${lg(rim[0].t)} ${E(rim[0].n)}</b><em>${ART("i",rim[0].t).replace(/^./,c=>c.toUpperCase())} l'hanno ${erroreVenditaPDK(rim[0],rim[0].t).replace(/^<b>[^<]*<\/b>\s*/,"")}</em>`):""}
 </div>
 ${vClassGM(D)}
 ${vCatClass(D)}
 ${vAstaLega()}
 ${vRookie()}
 <div class="tth">Power ranking di tutte le epoche</div><p class="ttn small">Le ${D.V.length} versioni delle franchigie (8 × ${D.Y.length} anni), ordinate per PDK medi a turno con la formula Dreamers.</p>
 <div class="ttpr">${D.V.map(x=>`<div class="ttprr${x.y===SNOW?" now":""}"><b>${x.rk}</b>${lg(x.t)}<span>${TEAMS[x.t].nick} <i class="tty">${YN[x.y]}</i></span><span class="ttbar"><i style="width:${Math.round(x.f/D.V[0].f*100)}%"></i></span><em>${f1(x.f)}</em></div>`).join("")}</div>
 <div class="tth">Le franchigie, una per una</div><p class="ttn small">Tocca una squadra per l'articolo. Le barrette sono la forza di ogni annata, da ${YL(D.FY)} a oggi.</p>
 ${S.map(t=>articolo(t,D)).join("")}
 <div class="tth">La rosa di sempre</div><p class="ttn small">Se ogni franchigia potesse mettere insieme il meglio di tutte le sue annate.</p>
 <div class="ttpr">${ver.map((x,i)=>`<div class="ttprr"><b>${i+1}</b>${lg(x.t)}<span>${TEAMS[x.t].nick}<small>${nomi(D.ALL[x.t].best.slice(0,3)).replace(/ \([^)]*\)/g,"")}</small></span><em>${f1(x.f)}</em></div>`).join("")}</div>
 ${D.fede.length?`<div class="tth">I fedelissimi</div><p class="ttn small">Nella stessa franchigia in tutte le stagioni.</p><div class="ttchips">${D.fede.sort((a,b)=>(b.p?b.p.v:0)-(a.p?a.p.v:0)).map(x=>`<span>${lg(x.t)}${E(x.n)}${x.p?` <small>${f1(x.p.v)}</small>`:""}</span>`).join("")}</div>`:""}
 ${D.viaggi.length?`<div class="tth">I giramondo</div><p class="ttn small">Almeno tre franchigie diverse.</p><div class="ttchips">${D.viaggi.map(x=>`<span>${x.y.sort((a,b)=>a[0]-b[0]).map(([y,t])=>lg(t)).join("›")} ${E(x.n)}${x.p?` <small>${f1(x.p.v)}</small>`:""}</span>`).join("")}</div>`:""}
 </div>`}
function vSomma(){const L=somma();
 return`${campoSel()}<p class="ttn">Da 2 a 8 squadre, anche la stessa franchigia in anni diversi (es. Ducks 24/25 contro Ducks di oggi). Si sommano i punti di ogni turno della stagione ${SLAB(TT.camp||SNOW)}, come la G League.</p>
 <div class="ttsel">${Object.keys(TEAMS).map(t=>`<div class="ttrow">${lg(t)}<b>${TEAMS[t].nick}</b><span class="ttyc">${YS().map(y=>{const on=TT.entries.some(e=>e[0]===t&&e[1]===y);return`<button data-tt="add|${t}|${y}" aria-pressed="${on}"${has(t,y)?"":" disabled"}>${on?"✓ ":"+ "}${YL(y)}</button>`}).join("")}</span></div>`).join("")}</div>
 ${L.length<2?`<p class="ttn">Aggiungi almeno 2 squadre.</p>`:`<div class="tth">Classifica punti totali · ${L[0].n} turni</div><div class="ttcla">${L.map((x,i)=>`<button class="ttcr" data-tt="steam|${x.t}|${x.y}">${`<b class="ttp">${i+1}</b>`}${lg(x.t)}<span class="ttnm">${tag(x.t,x.y)}<small>media ${f1(x.avg)} a turno</small></span><span class="ttd"><b>${f1(x.tot)}</b></span></button>`).join("")}</div>
 ${L.length===2?`<div class="tth">Turno per turno</div><div class="ttres">${L[0].res.map((r,j)=>{const o=L[1].res[j];return`<button class="ttm ${r.v>=o.v?"w":"l"}" data-tt="duel|${r.k}|${L[0].t}|${L[0].y}|${L[1].t}|${L[1].y}"><span>T${r.k+OFF()}</span>${lg(L[1].t)}<b>${f1(r.v)}–${f1(o.v)}</b><em>${r.fin?"":"live"}</em></button>`}).join("")}</div>`:""}${shBtn("cla","Condividi la classifica")}`}`}
function vDuel(v){const[k,a,ya,b,yb]=v.map((x,i)=>i===1||i===3?x:+x),A=score(k,rosa(a,ya)),B=score(k,rosa(b,yb)),W=acc(k).W;
 const col=(t,y,S,win)=>`<div class="ttdc${win?" win":""}"><div class="ttdh">${lg(t)}<b>${tag(t,y)}</b><span>${f1(S.score)}</span></div>${S.top.map((x,i)=>`<div class="ttpl${i===0?" cap":""}${x.m===.5?" half":""}"><i>${i===0?"C":x.r==="F"?"A":x.r}</i><b>${E(x.n)}</b><em>${x.e==null?"—":f1(x.e)}${x.m!==1&&x.e!=null?` <small>${x.m===1.5?"×1,5":"×½"}</small>`:""}</em></div>`).join("")}</div>`;
 return`<button class="gback" data-tt="back">‹ Macchina del tempo</button><div class="ttneb"><div class="ttfog"></div><div class="ttin">
 <div class="ttdt"><small>⏳ Macchina del tempo</small><b>Turno ${+k+OFF()}</b><em>${W.closed?"Finale":"In corso"} · stagione ${SLAB(TT.camp||SNOW)}</em></div>
 <div class="ttds"><span>${lg(a)}<b>${f1(A.score)}</b></span><i>VS</i><span><b>${f1(B.score)}</b>${lg(b)}</span></div>
 <div class="ttdg">${col(a,+ya,A,A.score>=B.score)}${col(b,+yb,B,B.score>A.score)}</div>
 <p class="ttn small">Miglior PDK del turno di ogni giocatore, regole Dreamers: capitano ×1,5, ${F8()?"7° e 8°":"dal 7° al 10°"} ×½. Chi in questa stagione non gioca vale 0.</p></div></div>`}
/* ---------- (1216) CONDIVIDI: classifica di qualsiasi campionato simulato, pagella del GM, classifica dei GM (immagini 1080 px) ---------- */
const shBtn=(k,l)=>`<button class="ttsh" type="button" data-ttsh="${k}">📤 ${l}</button>`;
const CF=(w,z)=>`italic ${w} ${z}px "Barlow Condensed","Arial Narrow",Arial,sans-serif`,CB=(w,z)=>`${w} ${z}px "Barlow","Helvetica Neue",Arial,sans-serif`;
function ttWrap(X,t,w){const L=[];let cu="";String(t).split(" ").forEach(x=>{const q=cu?cu+" "+x:x;if(X.measureText(q).width>w&&cu){L.push(cu);cu=x}else cu=q});if(cu)L.push(cu);return L}
const strip=h=>String(h).replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">");
function ttCanvas(H){const cv=document.createElement("canvas");cv.width=1080;cv.height=H;const X=cv.getContext("2d");try{shRecolor(X)}catch(e){}
 const g=X.createRadialGradient(300,0,40,540,H/2,H);g.addColorStop(0,"#5b21b6");g.addColorStop(.45,"#1e1b4b");g.addColorStop(1,"#070a1a");X.fillStyle=g;X.fillRect(0,0,1080,H);
 for(let i=0;i<70;i++){X.fillStyle=`rgba(196,181,253,${Math.random()*.35})`;X.beginPath();X.arc(Math.random()*1080,Math.random()*H,Math.random()*2.2,0,7);X.fill()}return{cv,X}}
function ttTop(X,title,sub){X.textAlign="left";X.fillStyle="#c4b5fd";X.font=CF(800,34);X.fillText("⏳ MACCHINA DEL TEMPO · DREAMERS",60,84);X.fillStyle="#fff";X.font=CF(800,84);X.fillText(title.toUpperCase(),60,170);X.fillStyle="#e0e7ff";X.font=CB(500,32);ttWrap(X,sub,960).slice(0,2).forEach((l,i)=>X.fillText(l,60,222+i*40))}
function ttFoot(X,H){X.textAlign="center";X.fillStyle="#8b8fc7";X.font=CF(700,28);X.fillText(`Dreamers · stagione ${SLAB(TT.camp||SNOW)} · PDK veri · ${typeof EFF!=="undefined"&&EFF.agg?EFF.agg:""}`,540,H-40)}
async function shareCla(btn){const LG=TT.mode==="somma"?null:lega(),SM=TT.mode==="somma"?somma():null,R=reale(),rows=LG||SM;if(!rows||!rows.length)return;
 try{await document.fonts.load('800 italic 40px "Barlow Condensed"')}catch(e){}
 const RH=104,top=300,H=top+rows.length*RH+110,{cv,X}=ttCanvas(H);
 ttTop(X,TT.mode==="somma"?"Somma punti":TT.mode==="lega8"?"Lega a 8":"Lega · scontri diretti",TT.mode==="somma"?`${rows.length} squadre · ${rows[0].n} turni · punti totali`:`Classifica «come sarebbe andata» · ${rows.filter(x=>x.y!==SNOW||!live()).length} franchigie con una rosa del passato`);
 for(let i=0;i<rows.length;i++){const x=rows[i],y=top+i*RH;X.fillStyle=i%2?"rgba(255,255,255,.05)":"rgba(255,255,255,.10)";shRR(X,40,y,1000,RH-12,18);X.fill();
  X.fillStyle=i===0?"#fbbf24":"#fff";X.font=CF(800,52);X.textAlign="center";X.fillText(String(i+1),95,y+64);await shLogoAt(X,x.t,135,y+8,76);
  X.textAlign="left";X.fillStyle="#fff";X.font=CF(800,48);const nm=TEAMS[x.t].nick.toUpperCase();X.fillText(nm,228,y+58);const w=X.measureText(nm).width;
  if(!(x.y===SNOW&&live())){X.font=CF(800,30);const tl=YL(x.y).toUpperCase(),tw=X.measureText(tl).width+26;X.fillStyle="#7c3aed";shRR(X,240+w,y+24,tw,42,21);X.fill();X.fillStyle="#fff";X.fillText(tl,253+w,y+55)}
  X.fillStyle="#c7d2fe";X.font=CB(600,26);X.fillText(SM?`media ${f1(x.avg)} a turno`:`${f1(x.pf)} PDK`,228,y+86);
  X.textAlign="right";X.fillStyle="#fff";X.font=CF(800,56);X.fillText(SM?f1(x.tot):`${x.w}-${x.l}`,1010,y+60);
  if(!SM){const r=R.indexOf(x.t)+1;if(r){X.font=CB(600,24);X.fillStyle="#a5b4fc";X.fillText(`realtà ${r}°`,1010,y+88)}}}
 ttFoot(X,H);shSend(cv,`macchina-del-tempo-${TT.mode}.png`,"⏳ Macchina del tempo · Dreamers",btn)}
async function sharePag(t,btn){const D=analisiData(),P=pagella(t,D);if(!P)return;try{await document.fonts.load('800 italic 40px "Barlow Condensed"')}catch(e){}
 const mc=document.createElement("canvas").getContext("2d");mc.font=CB(500,30);
 const txt=`Il GM ${vo(t)?"degli":"dei"} ${TEAMS[t].nick} ${P.dir[2]}. Tra le 8 franchigie: ${P.p1}° nel ${YL(1)} → ${P.p3}° oggi.`,TL=ttWrap(mc,txt,700);
 const blocks=P.es.map((e,i)=>{const fr=[];if(e.best)fr.push(`Mossa migliore: ${e.best.n} (${f1(e.best.p?e.best.p.v:0)})`);if(e.lost){const w=dove(e.lost.n);fr.push(`Sacrificio: ${e.lost.n}${w&&w!==t?", oggi "+ART("ai",w):""} (${f1(e.lost.p?e.lost.p.v:0)})`)}
   const n=Math.max(Math.min(e.in.length,6),Math.min(e.out.length,6),1);mc.font=CB(500,26);const FL=fr.flatMap(f=>ttWrap(mc,f,940));return{e,i,n,FL,h:100+n*40+20+FL.length*34+34}});
 const CC=categorie(D)[t]||{},CK=CATS.filter(([k])=>CC[k]),top=430,HD=Math.max(190,150+TL.length*40)+(CK.length?160:0),H=top+HD+blocks.reduce((s,b)=>s+b.h,0)+120;
 const cv=document.createElement("canvas");cv.width=1080;cv.height=H;const X=cv.getContext("2d");try{shRecolor(X)}catch(e){}
 const bg=X.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#1e1b4b");bg.addColorStop(1,"#070a1a");X.fillStyle=bg;X.fillRect(0,0,1080,H);
 await shHead(X,1080,t,"PAGELLA DEL GM",1);
 let y=top;const vc=P.v>=8?"#8b5cf6":P.v>=7?"#16a34a":P.v>=6?"#d97706":"#dc2626";X.fillStyle=vc;shRR(X,60,y,170,170,30);X.fill();X.fillStyle="#fff";X.textAlign="center";X.font=CF(800,96);X.fillText(String(P.v).replace(".",","),145,y+118);
 X.textAlign="left";X.fillStyle="#c4b5fd";X.font=CF(800,30);X.fillText("⏳ MACCHINA DEL TEMPO",270,y+30);X.fillStyle="#fff";X.font=CF(800,56);X.fillText(`${P.dir[0]} ${P.dir[1]}`.toUpperCase(),270,y+86);
 X.fillStyle="#e0e7ff";X.font=CB(500,30);TL.forEach((l,i)=>X.fillText(l,270,y+130+i*40));if(CK.length){const yc=y+Math.max(190,150+TL.length*40)-10,cw=(1000-(CK.length-1)*14)/CK.length;CK.forEach(([k,ic,l],i)=>{const x=40+i*(cw+14),c=CC[k];X.fillStyle="rgba(255,255,255,.08)";shRR(X,x,yc,cw,140,20);X.fill();X.textAlign="center";X.fillStyle="#c4b5fd";X.font=CF(800,28);X.fillText(`${ic} ${({talenti:"TALENTI"})[k]||l.toUpperCase()}`,x+cw/2,yc+38);X.fillStyle=c.v>=8?"#a78bfa":c.v>=7?"#4ade80":c.v>=6?"#fbbf24":"#f87171";X.font=CF(800,58);X.fillText(vf(c.v),x+cw/2,yc+98);X.fillStyle="#a5b4fc";X.font=CB(600,22);X.fillText(`${c.rk}° su 8`,x+cw/2,yc+126)})}y+=HD;
 for(const b of blocks){const e=b.e;y+=20;X.fillStyle="rgba(255,255,255,.07)";shRR(X,40,y,1000,b.h-20,22);X.fill();
  X.fillStyle="#fff";X.font=CF(800,40);X.textAlign="left";X.fillText(`${e.a===0?"PRIMI MESI":`${YS()[0]===0?b.i:b.i+1}ª ESTATE`} · ${YLs(e.a).toUpperCase()} → ${YLs(e.b).toUpperCase()}`,70,y+54);
  X.textAlign="right";X.fillStyle=e.df>=0?"#4ade80":"#f87171";X.fillText(pc(e.df),1010,y+54);
  const col=(L,x,c,s)=>{X.textAlign="left";L.slice(0,6).forEach((p,j)=>{X.fillStyle=c;X.font=CB(700,27);const nm=`${s} ${p.n}`;let z=27;while(X.measureText(nm).width>360&&z>18){z-=1;X.font=CB(700,z)}X.fillText(nm,x,y+108+j*40);X.fillStyle="#a5b4fc";X.font=CB(600,24);X.textAlign="right";X.fillText(p.p?f1(p.p.v):"0",x+455,y+108+j*40);X.textAlign="left"})};
  col(e.in,70,"#86efac","＋");col(e.out,560,"#fca5a5","－");
  let yy=y+108+b.n*40+10;X.fillStyle="#fff";X.font=CB(700,28);X.textAlign="left";X.fillText(`Saldo di mercato: ${e.saldo>=0?"+":""}${f1(e.saldo)} PDK`,70,yy);yy+=36;X.fillStyle="#c7d2fe";X.font=CB(500,26);b.FL.forEach(l=>{X.fillText(l,70,yy);yy+=34});y+=b.h}
 ttFoot(X,H);shSend(cv,`pagella-gm-${TEAMS[t].nick.toLowerCase()}.png`,`⏳ Pagella del GM · ${TEAMS[t].name||TEAMS[t].nick}`,btn)}
async function shareGM(btn){const D=analisiData(),L=D.T.map(t=>pagella(t,D)).filter(Boolean).sort((a,b)=>b.v-a.v||b.d-a.d);try{await document.fonts.load('800 italic 40px "Barlow Condensed"')}catch(e){}
 const RH=110,top=300,H=top+L.length*RH+110,{cv,X}=ttCanvas(H);ttTop(X,"La classifica dei GM",`Chi ha lavorato meglio dal ${YL(D.FY)} a oggi: crescita, posizioni, mercato, età`);
 for(let i=0;i<L.length;i++){const x=L[i],y=top+i*RH;X.fillStyle=i%2?"rgba(255,255,255,.05)":"rgba(255,255,255,.10)";shRR(X,40,y,1000,RH-12,18);X.fill();
  X.fillStyle="#fff";X.font=CF(800,50);X.textAlign="center";X.fillText(String(i+1),95,y+64);await shLogoAt(X,x.t,135,y+10,78);
  X.textAlign="left";X.font=CF(800,48);X.fillText(TEAMS[x.t].nick.toUpperCase(),230,y+56);X.fillStyle="#c7d2fe";X.font=CB(600,26);X.fillText(`${x.dir[0]} ${x.dir[1]} · ${x.p1}° → ${x.p3}°`,230,y+88);
  const vc=x.v>=8?"#8b5cf6":x.v>=7?"#16a34a":x.v>=6?"#d97706":"#dc2626";X.fillStyle=vc;shRR(X,900,y+14,110,70,16);X.fill();X.fillStyle="#fff";X.textAlign="center";X.font=CF(800,50);X.fillText(String(x.v).replace(".",","),955,y+66)}
 ttFoot(X,H);shSend(cv,"classifica-gm.png","⏳ La classifica dei GM · Dreamers",btn)}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-ttsh]");if(!b||typeof cur==="undefined"||cur!=="giochi")return;e.preventDefault();e.stopPropagation();const k=b.dataset.ttsh;
 (k==="cla"?shareCla(b):k==="gm"?shareGM(b):k==="cat"?shareCat(b):k==="asta"?shareAsta(b):sharePag(k.split("|")[1],b)).catch(er=>console.error(er))},true);
/* ---------- (1216) ARCHIVIO: fotografia della stagione in corso per tempo-archivio.js (la usa l'azione GitHub «tempo») ---------- */
window.ttArchivia=function(force){const sv=TT.camp,sm=TT.mode;TT.camp=0;TT.mode="lega";try{
 const oggi=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(new Date());
 const rose={};for(const t of Object.keys(TEAMS))rose[t]=(ROSTER[t]||[]).map(x=>{let rk=0;try{rk=isRookie(x[0])?1:0}catch(e){}const A=astaY(SNOW);return[x[0],x[2],x[4]??null,rk,A&&A[tvNm(x[0])]!=null?A[tvNm(x[0])]:null]});
 const regFin=oggi>drWeekEnd(DR_REG),chiusa=oggi>drWeekEnd(DR_TOT);
 const o={idx:SNOW,lab:String(STAGIONE_CORRENTE),upd:oggi,chiusa,rose};
 if(regFin||force){const K=[];for(let k=1;k<=DR_REG;k++)if(drWeek(k).closed)K.push(k);o.turni=K;o.sched=DR_SCHED.slice(0,DR_REG);o.off=DR_OFF;o.base=DR_BASE;o.reale=reale();o.acc={};
  for(const k of K){const A=acc(k).A,q={};for(const n in A)q[n]=Math.round(A[n]*100)/100;o.acc[k]=q}}
 return o}finally{TT.camp=sv;TT.mode=sm}};
window.vTempo=function(){if(TT.view)return vDuel(TT.view);
 return`<div class="ttwrap"><div class="tthero"><div class="ttfog"></div><small>Fanta Dreamers</small><b>⏳ Macchina del tempo</b><em>La stagione di oggi, giocata con le rose di ieri</em></div>
 <div class="ttmod">${[["lega","🏆 Lega · scontri diretti"],["lega8","🎯 Lega a 8"],["somma","➕ Somma punti"],["analisi","📰 Analisi"]].map(([m,l])=>`<button data-tt="mode|${m}" aria-pressed="${TT.mode===m}">${l}</button>`).join("")}</div>
 ${TT.mode==="lega"||TT.mode==="lega8"?vLega():TT.mode==="analisi"?vAnalisi():vSomma()}</div>`};
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-tt]");if(!b||typeof cur==="undefined"||cur!=="giochi")return;e.preventDefault();e.stopPropagation();const p=b.dataset.tt.split("|");let top=false;
 if(p[0]==="mode")TT.mode=p[1];else if(p[0]==="camp"){TT.camp=+p[1]===SNOW?0:+p[1];TT.team=null;TT.sel={}}else if(p[0]==="y"){TT.sel[p[1]]=+p[2];}else if(p[0]==="team"){TT.team=TT.team===p[1]?null:p[1];TT.rv={}}else if(p[0]==="rv"){TT.rv=TT.rv||{};TT.rv[p[1]]=+p[2]}
 else if(p[0]==="add"){const i=TT.entries.findIndex(x=>x[0]===p[1]&&x[1]===+p[2]);if(i>=0)TT.entries.splice(i,1);else if(TT.entries.length<8)TT.entries.push([p[1],+p[2]])}
 else if(p[0]==="steam"){}else if(p[0]==="duel"){TT.view=p.slice(1);top=true}else if(p[0]==="back"){TT.view=null;top=true}
 const y=scrollY;render();scrollTo(0,top?0:y)},true);
const st=document.createElement("style");st.textContent=`
.ttcats{display:grid;gap:6px;margin:10px 0 2px}.ttcat{display:grid;grid-template-columns:auto 1fr;gap:8px;align-items:start;padding:7px;border-radius:10px;background:rgba(124,58,237,.08)}.ttcat b{display:inline;font:800 12.5px system-ui}.ttcat small{margin-left:6px;font-size:10.5px;opacity:.7}.ttcat em{display:block;font-style:normal;font-size:11.5px;line-height:1.4;margin-top:2px}
.ttcatg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.ttcatb{padding:8px;border-radius:12px;background:rgba(124,58,237,.08);border:1px solid rgba(139,92,246,.3)}.ttcatb h6{margin:0 0 5px;font:800 11px system-ui}.ttcr2{display:grid;grid-template-columns:20px 1fr auto;gap:5px;align-items:center;font-size:11.5px;font-weight:700;padding:2px 0}.ttcr2 .ttlg{width:20px;height:20px}.ttvoto.xs{min-width:30px;height:22px;font-size:13px;border-radius:7px}
.ttpagh em b{display:inline!important;font:inherit!important;font-weight:800!important}.ttasta{margin-top:10px;padding:10px;border-radius:12px;background:rgba(234,179,8,.08);border:1px dashed rgba(234,179,8,.5)}.ttasta em .up,.ttasr .up{color:#16a34a}.ttasta em .dn,.ttasr .dn{color:#dc2626}
.ttasv{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:8px 0}.ttasv>div{display:grid;justify-items:center;gap:3px;padding:6px 2px;border-radius:10px;background:rgba(124,58,237,.08);text-align:center}.ttasv small{font:800 9.5px system-ui;line-height:1.2}.ttasv em{font-style:normal;font-size:9.5px;opacity:.7}
.ttasy{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:4px 0 8px}.ttasy span{padding:4px 8px;border-radius:9px;background:rgba(148,163,184,.15);font-size:11px}.ttasy small{opacity:.7;margin-right:4px}.ttasy em{width:100%;font-style:normal;font-size:10px;opacity:.65}
.ttasl{display:grid;gap:2px}.ttash,.ttasr{display:grid;grid-template-columns:1fr 46px 46px 46px;gap:4px;align-items:center;font-size:11.5px;padding:3px 4px}.ttash{font:800 10px system-ui;opacity:.7;text-transform:uppercase}.ttash span:not(:first-child),.ttasr span:not(:first-child){text-align:right}.ttasr{border-radius:7px;background:rgba(148,163,184,.08)}.ttasr span:first-child{display:flex;gap:5px;align-items:center;min-width:0}.ttasr i{font:800 9px system-ui;font-style:normal;width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:rgba(139,92,246,.25);flex:none}.ttasr b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttasr span:last-child{font-weight:800}
.ttash.rk,.ttasr.rk{grid-template-columns:1fr 34px 36px 40px 38px 54px}.ttasr small{font-weight:600;opacity:.6;font-size:9.5px}.ttasd summary{list-style:none;cursor:pointer}.ttvr{display:flex;align-items:center;gap:6px}.ttchev{font-style:normal;font-size:14px;opacity:.7;transition:transform .2s}.ttasd[open] .ttchev{transform:rotate(180deg)}.ttprr small.wrap{white-space:normal;overflow:visible}.ttcol .ttcolpi{padding:4px 6px 8px}.ttasd summary::-webkit-details-marker{display:none}
.ttteam{margin:14px 0;padding:12px;border-radius:16px;border:1px solid rgba(139,92,246,.45);background:rgba(124,58,237,.07)}.ttteam h4{margin:0 0 8px;font:800 italic 18px var(--display)}.ttteam h4 small{font:700 10px system-ui;opacity:.7;margin-left:6px;font-style:normal}
.ttcf{margin:10px 0;padding:10px;border-radius:12px;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.4)}.ttcfh{display:flex;justify-content:space-between;gap:6px;flex-wrap:wrap;align-items:center}.ttcfh b{font:800 13px system-ui}.ttcfh span{font:800 12px system-ui}
.ttcfg{display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));gap:5px;margin:8px 0}.ttcfg>div{text-align:center;padding:6px 2px;border-radius:10px;background:rgba(148,163,184,.12)}.ttcfg .now{background:rgba(124,58,237,.18)}.ttcfg .best{outline:1px solid rgba(56,189,248,.6)}.ttcfg small{display:block;font-size:10px;opacity:.75}.ttcfg b{display:block;font:800 18px var(--display)}.ttcfg em{font-style:normal;font-size:9.5px;opacity:.75}.ttcf p{font-size:12px;margin:0}
.ttsh{display:block;width:100%;margin:10px 0 4px;padding:10px 14px;border-radius:12px;border:1px solid rgba(139,92,246,.55);background:linear-gradient(135deg,rgba(124,58,237,.22),rgba(192,38,211,.18));color:inherit;font:800 13px system-ui;cursor:pointer}.ttsh.done{opacity:.6}
.ttcamp{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 8px}.ttcamp small{width:100%;font:800 10px system-ui;letter-spacing:.1em;text-transform:uppercase;opacity:.75}.ttcamp button{padding:7px 10px;border-radius:10px;border:1px solid rgba(139,92,246,.45);background:transparent;color:inherit;font:800 12px system-ui}.ttcamp button[aria-pressed="true"]{background:#7c3aed;color:#fff}
.ttmod{grid-template-columns:1fr 1fr!important}
.ttvoto{display:grid;place-items:center;min-width:48px;height:48px;border-radius:14px;font:800 italic 22px var(--display);color:#fff;background:#64748b}.ttvoto.sm{min-width:36px;height:30px;font-size:16px;border-radius:9px}.ttvoto.v4,.ttvoto.v5{background:#dc2626}.ttvoto.v6{background:#d97706}.ttvoto.v7{background:#16a34a}.ttvoto.v8,.ttvoto.v9,.ttvoto.v10{background:linear-gradient(135deg,#7c3aed,#c026d3)}
.ttprr.gm{grid-template-columns:20px 24px 1fr auto}
.ttpag{margin-top:10px;padding:10px;border-radius:12px;background:rgba(124,58,237,.1);border:1px dashed rgba(139,92,246,.5)}.ttpagh{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center}.ttpagh small{display:block;font:800 10px system-ui;letter-spacing:.1em;text-transform:uppercase;opacity:.7}.ttpagh b{display:block;font:800 15px var(--display)}.ttpagh em{display:block;font-style:normal;font-size:12px;line-height:1.4;margin-top:2px}
.ttest{margin-top:9px;padding-top:8px;border-top:1px solid rgba(139,92,246,.25)}.ttesth{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}.ttesth b{font:800 12px system-ui}.ttesth span,.ttest .up,.ttest .dn{font-weight:800}.ttest .up{color:#16a34a}.ttest .dn{color:#dc2626}
.ttmvs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px}.ttmv{font-size:11px;font-weight:700;padding:3px 7px;border-radius:999px;background:rgba(148,163,184,.18)}.ttmv.in{background:rgba(34,197,94,.16)}.ttmv.out{background:rgba(239,68,68,.14)}.ttmv small{opacity:.7}.ttest p{font-size:12px!important;margin:4px 0 0!important}
.ttrub{display:grid;gap:4px}.ttmast{padding:14px 14px 12px;border-radius:16px;background:linear-gradient(135deg,#1e1b4b,#4c1d95);color:#fff;border:1px solid rgba(196,181,253,.4)}.ttmast small{display:block;font:800 10px var(--display);letter-spacing:.2em;text-transform:uppercase;color:#c4b5fd}.ttmast b{display:block;font:800 italic 24px var(--display);margin:2px 0 4px}.ttmast em{font-style:normal;font-size:12px;color:#e0e7ff;line-height:1.4}
.ttcards{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}.ttcard{padding:10px;border-radius:14px;background:rgba(124,58,237,.12);border:1px solid rgba(139,92,246,.35)}.ttcard small{display:block;font:800 10px system-ui;letter-spacing:.05em;text-transform:uppercase;opacity:.8;margin-bottom:4px}.ttcard b{display:flex;align-items:center;gap:5px;font-size:14px;line-height:1.15}.ttcard em{display:block;font-style:normal;font-size:11px;opacity:.8;margin-top:3px}.ttcard .ttlg{width:22px;height:22px}
.ttpr{display:grid;gap:3px}.ttprr{display:grid;grid-template-columns:20px 24px 1fr 70px 40px;gap:6px;align-items:center;font-size:12px;padding:3px 4px;border-radius:8px}.ttprr.now{background:rgba(124,58,237,.12)}.ttprr>b{font:800 12px var(--display);text-align:center}.ttprr .ttlg{width:22px;height:22px}.ttprr span small{display:block;font-size:10px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ttprr span{min-width:0}.ttprr em{font-style:normal;font-weight:800;text-align:right}.ttbar{height:6px;border-radius:9px;background:rgba(148,163,184,.2);overflow:hidden}.ttbar i{display:block;height:100%;background:linear-gradient(90deg,#7c3aed,#c084fc);border-radius:9px}
.ttart{border-radius:14px;border:1px solid rgba(139,92,246,.35);background:rgba(124,58,237,.07);margin-bottom:6px;overflow:hidden}.ttart summary{list-style:none;display:grid;grid-template-columns:30px 1fr auto;gap:8px;align-items:center;padding:9px 10px;cursor:pointer}.ttart summary::-webkit-details-marker{display:none}.ttart summary .ttlg{width:28px;height:28px}.ttart summary b{display:block;font:800 15px var(--display)}.ttart summary small{font-size:11px;opacity:.85}
.ttspk{display:flex;align-items:flex-end;gap:3px;height:34px}.ttspk i{width:9px;border-radius:3px 3px 0 0;background:#a78bfa}.ttspk i:last-child{background:#7c3aed}
.ttart-b{padding:0 12px 10px}.ttart-b p{margin:6px 0;font-size:12.5px;line-height:1.45}.ttrks{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:2px 0 6px}.ttrks div{text-align:center;padding:6px 2px;border-radius:10px;background:rgba(124,58,237,.12)}.ttrks small{display:block;font-size:10px;opacity:.75}.ttrks b{display:block;font:800 16px var(--display)}.ttrks em{font-style:normal;font-size:9.5px;opacity:.75}
.ttchips{display:flex;flex-wrap:wrap;gap:5px}.ttchips span{display:inline-flex;align-items:center;gap:4px;padding:4px 8px 4px 4px;border-radius:999px;background:rgba(124,58,237,.12);font-size:11.5px;font-weight:700}.ttchips .ttlg{width:18px;height:18px}.ttchips small{opacity:.7}
.ttry{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:6px;margin:0 0 8px}.ttry button{padding:7px;border-radius:10px;border:1px solid rgba(139,92,246,.45);background:transparent;color:inherit;font:800 12px system-ui}.ttry button[aria-pressed="true"]{background:#7c3aed;color:#fff;border-color:#7c3aed}
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
