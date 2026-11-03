/* (1069) POKE DREAM — avventura a quadretti con i giocatori della nostra app (area riservata Ducks/DAX).
   Tutto originale: mappa, storia, personaggi, grafica pixel disegnata dal codice, musiche e suoni generati.
   Le regole sono quelle classiche del genere: esplorazione dall alto, erba alta, lotte a turni con 4 mosse, tipi, livelli 1-100, cattura con i CONTRATTI, zaino, schedario, centri cura, negozi, capi palestra, Lega.
   I giocatori sono le "creature": statistiche dai dati veri dell app (minuti, PDK, punti, rimbalzi, assist, efficienza, età). */
(function(){
"use strict";
const PD={};window.PDREAM=PD;
/* ---------- utilità ---------- */
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const sR=s=>{let q=(s%2147483646)+1;return()=>{q=(q*16807)%2147483647;return(q-1)/2147483646}};
/* ---------- TIPI ----------
   Il triangolo dei ruoli: GUARDIA batte ALA, ALA batte CENTRO, CENTRO batte GUARDIA.
   Poi gli stili: TIRATORE batte CENTRO e DIFENSORE lo ferma; DIFENSORE batte TIRATORE e ATLETA; REGISTA batte DIFENSORE; ATLETA batte REGISTA. BASE è neutro. */
const TY={BAS:{n:"BASE",c:"#a8a29e"},GUA:{n:"GUARDIA",c:"#38bdf8"},ALA:{n:"ALA",c:"#4ade80"},CEN:{n:"CENTRO",c:"#f97316"},TIR:{n:"TIRATORE",c:"#facc15"},DIF:{n:"DIFENSORE",c:"#64748b"},REG:{n:"REGISTA",c:"#c084fc"},ATL:{n:"ATLETA",c:"#f43f5e"}};
const CH={GUA:{ALA:2,CEN:.5},ALA:{CEN:2,GUA:.5},CEN:{GUA:2,ALA:.5,TIR:1},TIR:{CEN:2,DIF:.5,GUA:1.0},DIF:{TIR:2,ATL:2,REG:.5},REG:{DIF:2,ATL:.5},ATL:{REG:2,DIF:.5,CEN:1}};
const eff=(at,dt)=>dt.reduce((m,t)=>m*((CH[at]&&CH[at][t])||1),1);
/* ---------- CATALOGO MOSSE (circa 1 mossa per giocatore, come nel genere: tante scelte, 4 alla volta) ----------
   [nome, tipo, categoria F=fisica T=tiro S=stato, potenza, precisione, PP, effetto, ruoli che possono impararla dallo SCHEMA (G/F/C, ""=tutti), descrizione] */
const MV_RAW=[
["Palleggio","BAS","F",40,100,35,"","","Un palleggio deciso contro l avversario."],
["Spintarella","BAS","F",35,95,35,"","","Una spinta furba a contatto."],
["Tiro dalla media","BAS","T",50,95,30,"","","Un jumper dal gomito."],
["Corsa","BAS","F",40,100,30,"prio1","","Parte sempre per primo."],
["Rimbalzo","BAS","F",55,100,25,"","","Strappa il pallone e colpisce."],
["Raddoppio","BAS","F",25,90,20,"multi2","","Due colpi di fila."],
["Tuffo sul pallone","BAS","F",80,100,15,"recoil25","","Si butta su tutto: si fa un po male."],
["Grinta","BAS","S",0,0,30,"self:atk+1","","Alza l attacco."],
["Concentrazione","BAS","S",0,0,30,"self:spa+1","","Alza il tiro."],
["Riscaldamento","BAS","S",0,0,30,"self:spe+1","","Alza la velocità."],
["Timeout","BAS","S",0,0,10,"heal50","","Recupera metà dei punti vita."],
["Sguardo duro","BAS","S",0,100,30,"foe:def-1","","Abbassa la difesa avversaria."],
["Urlo del pubblico","BAS","S",0,100,30,"foe:atk-1","","Abbassa l attacco avversario."],
["Trash talk","BAS","S",0,90,15,"cnf","","Manda l avversario IN TILT."],
["Colpo basso","BAS","F",50,95,20,"inj40","","Può INFORTUNARE."],
["Tiro della disperazione","BAS","T",150,50,5,"","","Da metà campo sulla sirena: quasi mai entra."],
["Crossover","GUA","F",60,100,25,"crit","G","Cambio di mano: colpi critici facili."],
["Spin move","GUA","F",70,95,20,"","G","Giro su se stesso e via."],
["Floater","GUA","T",65,100,20,"","G","Tiro morbido sopra le mani dei lunghi."],
["Esitazione","GUA","F",55,100,20,"foe:spe-1","G","Finta che rallenta il difensore."],
["Penetrazione","GUA","F",85,95,15,"","GF","Attacca il ferro a testa bassa."],
["Tiro in corsa","GUA","T",65,95,20,"","G","Arresto e tiro senza fermarsi."],
["Pull-up","GUA","T",80,90,15,"","GF","Si ferma di colpo e spara."],
["Coast to coast","GUA","F",95,90,10,"recoil25","G","Da un canestro all altro da solo."],
["Rompicaviglie","GUA","F",100,85,10,"flinch30","G","Il difensore finisce seduto."],
["Behind the back","GUA","F",50,0,20,"never","G","Non sbaglia mai."],
["Mano veloce","GUA","F",40,100,30,"prio1","G","Primo a toccare palla."],
["Euro step","ALA","F",70,100,20,"","F","Due passi a zig-zag."],
["Taglio backdoor","ALA","F",60,100,20,"prio1","F","Entra alle spalle della difesa."],
["Fadeaway","ALA","T",80,90,15,"","FG","Tiro in allontanamento."],
["Post dell ala","ALA","F",75,95,15,"","F","Spalle a canestro e giro."],
["Tap-in","ALA","F",50,0,25,"never","FC","Tocco a rimbalzo: non sbaglia mai."],
["Putback","ALA","F",90,90,10,"","FC","Rimbalzo offensivo e schiacciata."],
["Close-out","ALA","F",60,100,20,"self:spe+1","F","Chiude e riparte più veloce."],
["Isolamento","ALA","S",0,0,20,"self:atk+1,spa+1","FG","Uno contro uno: alza attacco e tiro."],
["Tiro dall angolo","ALA","T",85,90,15,"","FG","Dall angolo, dove la linea è più vicina."],
["Transizione","ALA","F",80,95,15,"","F","Corre il campo in contropiede."],
["Mid-post","ALA","T",75,95,15,"","F","Gira e tira dal post medio."],
["Schiacciata","CEN","F",90,95,15,"","CF","La firma dei lunghi."],
["Gancio cielo","CEN","T",75,95,15,"","C","Il gancio alto che nessuno stoppa."],
["Post basso","CEN","F",80,95,15,"","C","Lavoro spalle a canestro."],
["Blocco","CEN","F",60,100,20,"flinch30","C","Un blocco duro: può far perdere il turno."],
["Tagliafuori","CEN","S",0,0,20,"self:def+2","C","Alza molto la difesa."],
["Doppia schiacciata","CEN","F",120,90,5,"recoil33","C","Fortissima, ma ci si fa male."],
["Drop step","CEN","F",70,100,20,"","C","Passo di avvicinamento potente."],
["Dream shake","CEN","F",85,95,10,"crit","C","Finte in post: critico facile."],
["Gomitata","CEN","F",70,90,15,"inj30","C","Può INFORTUNARE."],
["Muro","CEN","S",0,0,15,"self:def+1,spd+1","C","Alza difesa e lettura."],
["Pivot","CEN","F",65,100,20,"","CF","Perno e appoggio."],
["Rim run","CEN","F",60,100,20,"prio1","C","Corre verso il ferro per primo."],
["Tripla","TIR","T",90,85,15,"","GF","Da tre punti."],
["Step-back","TIR","T",80,95,15,"crit","G","Passo indietro e tiro: critico facile."],
["Catch and shoot","TIR","T",70,100,20,"","GF","Riceve e tira subito."],
["Tiro libero","TIR","T",40,0,30,"never","","Dalla lunetta: non sbaglia mai."],
["Bomba","TIR","T",110,70,5,"","GF","Da molto lontano."],
["Tiro dal logo","TIR","T",130,60,5,"","G","Dal centrocampo: devastante quando entra."],
["Splash","TIR","T",65,100,20,"","GF","Retina pulita."],
["Uscita dai blocchi","TIR","T",75,95,15,"","GF","Corre tra i blocchi e tira."],
["Mano calda","TIR","S",0,0,15,"self:spa+2","GF","Alza molto il tiro."],
["Mirino","TIR","S",0,0,20,"self:acc+1,crit","","Più precisione e più critici."],
["Tiro in faccia","TIR","T",95,85,10,"foe:spd-1","GF","Gli tira in testa: abbassa la sua lettura."],
["Stoppata","DIF","F",85,95,15,"flinch20","CF","Respinge il tiro."],
["Rubata","DIF","F",40,100,25,"prio1","G","Mani veloci: parte per primo."],
["Pressing","DIF","S",0,95,20,"foe:spe-2","","Abbassa molto la velocità avversaria."],
["Fallo tattico","DIF","S",0,90,15,"par","","Lascia l avversario BLOCCATO."],
["Marcatura","DIF","S",0,100,20,"foe:atk-1,spa-1","","Abbassa attacco e tiro avversari."],
["Raddoppio difensivo","DIF","F",45,90,15,"multi2","","Due difensori addosso."],
["Chiusura","DIF","F",60,100,20,"self:def+1","","Colpisce e si rinforza in difesa."],
["Mani in faccia","DIF","S",0,100,20,"foe:acc-1","","Abbassa la precisione avversaria."],
["Difesa a zona","DIF","S",0,0,20,"self:def+1,spd+1","","Alza difesa e lettura."],
["Muraglia","DIF","S",0,0,10,"protect","","Protegge da tutto per un turno."],
["Sfondamento","DIF","F",75,90,10,"par20","CF","Prende lo sfondamento: può BLOCCARE."],
["Chase-down","DIF","F",90,90,10,"","FG","Rincorre e stoppa da dietro."],
["Assist","REG","T",60,0,25,"never","G","Passaggio perfetto: non sbaglia mai."],
["No-look","REG","T",75,95,15,"crit","G","Passaggio senza guardare: critico facile."],
["Lob","REG","T",70,100,20,"","GC","Pallone alto per il compagno."],
["Pick and roll","REG","T",80,95,15,"","GC","Gioco a due con il lungo."],
["Visione di gioco","REG","S",0,0,20,"self:spa+1,spd+1","G","Alza tiro e lettura."],
["Passaggio dietro la schiena","REG","T",65,100,20,"","G","Elegante e preciso."],
["Skip pass","REG","T",85,90,15,"","G","Cambia lato in un attimo."],
["Chiamata di gioco","REG","S",0,0,10,"heal50","G","Ordina la squadra e recupera."],
["Ritmo","REG","S",0,0,20,"self:spe+1,spa+1","G","Alza velocità e tiro."],
["Outlet","REG","T",60,100,20,"prio1","GC","Lancio immediato: parte per primo."],
["Melina","REG","S",0,75,10,"slp","G","Fa addormentare la partita: STANCO."],
["Passaggio a tutto campo","REG","T",100,85,10,"","GF","Un lancio lungo perfetto."],
["Alley-oop","ATL","F",95,90,10,"","FC","In volo sopra il ferro."],
["Contropiede","ATL","F",40,100,30,"prio1","","Corre più veloce di tutti."],
["Salto verticale","ATL","F",85,95,15,"","FC","Si alza più di tutti."],
["Volo","ATL","F",120,85,5,"recoil33","FC","Schiacciata dal tiro libero."],
["Tomahawk","ATL","F",100,90,10,"flinch20","FC","Schiacciata a una mano da dietro la testa."],
["Windmill","ATL","F",110,85,5,"","FC","Schiacciata a mulino."],
["Esplosività","ATL","S",0,0,20,"self:spe+2","","Alza molto la velocità."],
["Energia","ATL","F",70,100,15,"drain50","","Recupera metà del danno fatto."],
["Rimbalzo atletico","ATL","F",75,95,15,"","FC","Vola a prendersi il pallone."],
["360","ATL","F",130,75,5,"recoil33","F","Schiacciata con giro completo."],
["Seconda giovinezza","ATL","S",0,0,10,"heal50","","Le gambe tornano fresche."],
["Primo passo","ATL","F",80,100,15,"","G","Brucia il difensore sul primo passo."]];
const MV={};MV_RAW.forEach((m,i)=>{MV[m[0]]={id:i,n:m[0],t:m[1],c:m[2],p:m[3],a:m[4],pp:m[5],e:m[6],r:m[7],d:m[8]}});
const MOVES=MV_RAW.map(m=>MV[m[0]]);
/* ---------- I GIOCATORI (le "creature") ---------- */
/* aspetto: pelle 1-5 (chiara→scura), capelli, barba, fascia; i tratti più noti, disegnati in pixel (non ritratti) */
const LOOK={"Victor Wembanyama":"4,short,none,0,tall","Nikola Jokić":"1,short,stubble,0,big","Luka Dončić":"1,short,stubble,0","Jalen Johnson":"4,short,short,0","Jalen Duren":"5,short,stubble,0,big","Cade Cunningham":"4,short,short,0","Shai Gilgeous-Alexander":"4,short,stubble,0","Domantas Sabonis":"1,buzz,stubble,0,big","Donovan Clingan":"1,short,none,0,tall","Josh Giddey":"1,curly,none,0","Giannis Antetokounmpo":"4,buzz,short,0","Alperen Şengün":"1,short,short,0,big","Cameron Boozer":"4,short,none,0","Tyrese Haliburton":"4,short,none,1","Cooper Flagg":"1,short,none,0","Tyrese Maxey":"4,short,stubble,0","Stephon Castle":"4,braids,none,0","Jayson Tatum":"4,short,short,0","Chet Holmgren":"1,short,none,0,tall","Scottie Barnes":"5,locs,none,0","Deni Avdija":"1,long,stubble,0","Karl-Anthony Towns":"3,short,short,0,big","Evan Mobley":"4,short,none,0,tall","LaMelo Ball":"3,short,none,0","Alex Sarr":"5,short,none,0,tall","Trae Young":"3,short,stubble,0","Anthony Davis":"4,short,short,0,big","Paolo Banchero":"3,short,stubble,0","Anthony Edwards":"4,short,stubble,0","AJ Dybantsa":"5,short,none,0","Walker Kessler":"1,short,none,0,tall","Amen Thompson":"4,buzz,none,0","Keyonte George":"4,short,none,0","Caleb Wilson":"4,short,none,0","Kon Knueppel":"1,short,none,0","Jamal Murray":"3,short,short,0","Kel'el Ware":"4,short,none,0,tall","Donovan Mitchell":"4,short,short,0","Dyson Daniels":"1,short,none,0","Darryn Peterson":"4,short,none,0","Bam Adebayo":"4,buzz,short,0,big","Aday Mara":"1,short,none,0,tall","Ja Morant":"4,short,stubble,0","Joel Embiid":"5,short,short,0,big","Brandon Miller":"4,short,none,0","Jarrett Allen":"4,afro,short,0,big","Jaylen Brown":"4,short,short,0","Lauri Markkanen":"1,short,stubble,0,tall","Trey Murphy III":"3,short,short,0","Onyeka Okongwu":"5,short,none,0,big","Michael Porter Jr.":"2,curly,stubble,0","VJ Edgecombe":"4,short,none,0","Darius Acuff Jr.":"4,short,none,0","Isaiah Hartenstein":"1,short,short,0,big","Derik Queen":"4,short,none,0,big","Kawhi Leonard":"4,short,short,0","Mikel Brown Jr.":"4,short,none,0","Jalen Williams":"4,short,stubble,0","Jalen Brunson":"3,short,short,0","Austin Reaves":"1,short,stubble,0","Keaton Wagler":"1,short,none,0","Franz Wagner":"1,short,none,0","Zion Williamson":"4,short,none,0,big","Ryan Rollins":"4,short,none,0","Brayden Burries":"4,short,none,0","Darius Garland":"4,short,none,0","Ivica Zubac":"1,buzz,none,0,big","Devin Booker":"3,short,stubble,0","Zach Edey":"1,short,none,0,tall","Moussa Diabaté":"5,short,none,0,big","Tyler Herro":"1,short,stubble,0","Kyshawn George":"4,short,none,0","Sergio De Larrea":"1,short,none,0","Immanuel Quickley":"4,short,none,0","Matas Buzelis":"1,short,none,0","Damian Lillard":"4,short,full,0","Yaxel Lendeborg":"3,short,none,0","De'Aaron Fox":"4,short,stubble,0","Ausar Thompson":"4,buzz,none,0","Jabari Smith Jr.":"4,short,none,0","Cedric Coward":"4,short,none,0","James Harden":"3,short,huge,0","Julius Randle":"4,short,short,0,big","Dylan Harper":"4,short,none,0","Kingston Flemings":"4,short,none,0","Dejounte Murray":"4,braids,stubble,0","Maxime Raynaud":"1,short,none,0,tall","Collin Murray-Boyles":"4,short,none,0","Pascal Siakam":"5,short,short,0","Desmond Bane":"4,short,short,0","RJ Barrett":"4,short,short,0","Rudy Gobert":"4,short,short,0,tall","Kyrie Irving":"3,short,full,0","Miles Bridges":"4,short,short,0","Jaime Jaquez Jr.":"2,short,stubble,0","Josh Hart":"4,short,short,0","Stephen Curry":"3,short,stubble,0","Brandon Ingram":"4,short,none,0","Ace Bailey":"4,short,none,0","LeBron James":"4,short,full,1","Jeremiah Fears":"4,short,none,0","Kristaps Porziņģis":"1,short,stubble,0,tall","Allen Graves":"4,short,none,0","Morez Johnson Jr.":"4,short,none,0","Kevin Durant":"4,short,short,0,tall","Naz Reid":"4,short,none,0,big","Egor Dëmin":"1,short,none,0","Jalen Green":"3,short,none,0","Paul George":"4,short,short,0","Jonathan Kuminga":"5,short,none,0","Danny Wolf":"1,long,none,0","Oso Ighodaro":"5,short,none,0","Trevon Brazile":"4,short,none,0","Hannes Steinbach":"1,short,none,0,tall","Khaman Maluach":"5,short,none,0,tall"};
/* colori maglia: squadre della nostra lega (dai dati dell app) oppure squadra NBA */
const NBAC={ATL:["#e03a3e","#ffffff"],BOS:["#007a33","#ffffff"],BKN:["#111111","#ffffff"],CHA:["#1d1160","#00788c"],CHI:["#ce1141","#111111"],CLE:["#860038","#fdbb30"],DAL:["#00538c","#ffffff"],DEN:["#0e2240","#fec524"],DET:["#c8102e","#1d42ba"],GSW:["#1d428a","#ffc72c"],HOU:["#ce1141","#ffffff"],IND:["#002d62","#fdbb30"],LAC:["#1d428a","#c8102e"],LAL:["#552583","#fdb927"],MEM:["#5d76a9","#12173f"],MIA:["#98002e","#f9a01b"],MIL:["#00471b","#eee1c6"],MIN:["#0c2340","#78be20"],NOP:["#0c2340","#c8102e"],NYK:["#006bb6","#f58426"],OKC:["#007ac1","#ef3b24"],ORL:["#0077c0","#ffffff"],PHI:["#006bb6","#ed174c"],PHX:["#1d1160","#e56020"],POR:["#e03a3e","#111111"],SAC:["#5a2d81","#ffffff"],SAS:["#c4ced4","#111111"],TOR:["#ce1141","#111111"],UTA:["#002b5c","#f9a01b"],WAS:["#002b5c","#e31837"]};
let SP=[],SPX={};
const buildSpecies=o=>{SP=[];SPX={};(o.players||[]).forEach((p,i)=>{const r=p.role==="C"?"C":p.role==="G"?"G":"F";
    const t1=r==="G"?"GUA":r==="C"?"CEN":"ALA";
    const pts=p.pts??p.pdk*.55??10,reb=p.reb??(r==="C"?8:4),ast=p.ast??(r==="G"?5:2.5),mn=p.min??26,age=p.age??25,pdk=p.pdk??(10+(p.val||500)/80),ef=p.eff??.8;
    let t2=null;if(ast>=6)t2="REG";else if(r!=="C"&&ef>=.85&&pts>=18)t2="TIR";else if(r==="C"&&reb>=10)t2="DIF";else if(age<=23)t2="ATL";else if(r==="C")t2="DIF";else if(pts>=17)t2="TIR";else if(r==="F")t2="ATL";else t2="REG";if(t2===t1)t2=null;
    const BST=cl(Math.round(300+pdk*6.5),300,600);
    let w={hp:1+mn/36+(r==="C"?.35:0),atk:.6+pts/22+(r==="C"?.4:r==="F"?.25:0),def:.5+reb/8+(r==="C"?.35:0),spa:.5+pts/24+ef*.45+(r==="G"?.3:0),spd:.55+ast/7+(age>=28?.3:0),spe:.45+(r==="G"?.6:r==="F"?.35:.1)+(age<=23?.3:0)};
    const ws=Object.values(w).reduce((a,b)=>a+b,0),bs={};Object.keys(w).forEach(k=>bs[k]=cl(Math.round(BST*w[k]/ws),20,170));
    const lk=(LOOK[p.name]||"3,short,none,0").split(",");
    const team=p.team||null,col=p.col||(NBAC[p.nba]||["#475569","#ffffff"]);
    const s={i,n:p.name,short:p.name.split(" ").slice(-1)[0].replace(/\.$/,""),role:r,t:[t1,t2].filter(Boolean),bs,BST,rate:cl(Math.round(200-(p.val||500)/14),3,200),bx:Math.round(60+BST/5),num:p.num!=null?p.num:hsh(p.name)%40,team,nba:p.nba,col,skin:+lk[0],hair:lk[1],beard:lk[2],band:lk[3]==="1",build:lk[4]||(r==="C"?"big":"norm"),val:p.val||500,age,dex:i+1};
    s.learn=learnset(s);SP.push(s);SPX[s.n]=s})};
/* mosse imparate salendo di livello: dalle famiglie dei suoi tipi + BASE, sempre più forti */
const learnset=s=>{const r_=sR(hsh(s.n));const pools=s.t.concat(["BAS"]);const pool=MOVES.filter(m=>pools.includes(m.t)&&(!m.r||m.r.includes(s.role)||m.t===s.t[0]||m.t===s.t[1]));
  const atk=pool.filter(m=>m.c!=="S").sort((a,b)=>a.p-b.p),st=pool.filter(m=>m.c==="S");const L=[];const lv=[1,1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,47,51,55,60,65,70,76,82];
  const weak=atk.filter(m=>m.p<=50),mid=atk.filter(m=>m.p>50&&m.p<=80),str=atk.filter(m=>m.p>80);const take=(a)=>{if(!a.length)return null;const k=Math.floor(r_()*a.length);return a.splice(k,1)[0]};
  const seq=[weak,weak,st,weak,mid,st,mid,mid,st,mid,str,mid,st,str,mid,str,st,str,str,st,str,str,st,str];
  seq.forEach((a,i)=>{let m=take(a)||take(mid)||take(str)||take(weak);if(m)L.push([lv[i],m.n])});return L};
/* ---------- formule classiche del genere ---------- */
const NAT=[["Paziente","",""],["Grintoso","atk","spa"],["Freddo","spa","atk"],["Rapido","spe","def"],["Solido","def","spe"],["Lucido","spd","atk"],["Instancabile","hp?","spe"],["Esplosivo","spe","spd"],["Altruista","spd","atk"],["Egoista","spa","spd"]];
const stat=(m,k)=>{const s=SPX[m.sp],b=s.bs[k],iv=m.iv[k],ev=(m.ev&&m.ev[k])||0,L=m.lv;if(k==="hp")return Math.floor((2*b+iv+Math.floor(ev/4))*L/100)+L+10;let v=Math.floor((2*b+iv+Math.floor(ev/4))*L/100)+5;const n=NAT[m.nat||0];if(n[1]===k)v=Math.floor(v*1.1);if(n[2]===k)v=Math.floor(v*.9);return v};
const expAt=L=>L<=1?0:Math.floor(L*L*L);/* crescita media */
const mkMon=(name,L,o)=>{const s=SPX[name];if(!s)return null;const iv={};["hp","atk","def","spa","spd","spe"].forEach(k=>iv[k]=ri(0,31));const m={sp:name,lv:L,iv,ev:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},nat:ri(0,NAT.length-1),xp:expAt(L),st:null,moves:[],shiny:rnd()<1/512,ot:o&&o.ot||""};
  const kn=s.learn.filter(q=>q[0]<=L).map(q=>q[1]);kn.slice(-4).forEach(n=>m.moves.push({n,pp:MV[n].pp}));m.hp=stat(m,"hp");return m};
/* ---------- ZAINO: tasche e oggetti ---------- */
const IT={
 "Contratto":{p:"con",pr:200,d:"Per mettere sotto contratto un giocatore selvatico.",ball:1},
 "Contratto Pro":{p:"con",pr:600,d:"Più convincente di un contratto normale.",ball:1.5},
 "Contratto Max":{p:"con",pr:1200,d:"Quasi nessuno dice di no.",ball:2},
 "Contratto Rookie":{p:"con",pr:1000,d:"Molto efficace con i giocatori di livello basso.",ball:"rk"},
 "Contratto Veterano":{p:"con",pr:1000,d:"Più efficace sui giocatori già indeboliti.",ball:"vt"},
 "Borraccia":{p:"cur",pr:300,d:"Ridà 20 punti vita.",heal:20},
 "Sali minerali":{p:"cur",pr:700,d:"Ridà 60 punti vita.",heal:60},
 "Flebo":{p:"cur",pr:1200,d:"Ridà 120 punti vita.",heal:120},
 "Massaggio completo":{p:"cur",pr:2500,d:"Ridà tutti i punti vita.",heal:999},
 "Ghiaccio":{p:"cur",pr:200,d:"Cura l INFORTUNIO.",cure:"inj"},
 "Caffè":{p:"cur",pr:250,d:"Sveglia chi è STANCO.",cure:"slp"},
 "Stretching":{p:"cur",pr:200,d:"Sblocca chi è BLOCCATO.",cure:"par"},
 "Camomilla":{p:"cur",pr:200,d:"Calma chi è IN TILT (solo in partita).",cure:"cnf"},
 "Fisioterapia":{p:"cur",pr:600,d:"Cura ogni problema fisico.",cure:"all"},
 "Rientro":{p:"cur",pr:1500,d:"Rimette in campo un giocatore KO con metà dei punti vita.",rev:.5},
 "Bevanda energetica":{p:"cur",pr:400,d:"Ricarica 10 PP di una mossa.",pp:10},
 "Integratore forza":{p:"cur",pr:9800,d:"Allenamento: più attacco per sempre.",ev:"atk"},
 "Integratore tiro":{p:"cur",pr:9800,d:"Allenamento: più tiro per sempre.",ev:"spa"},
 "Integratore difesa":{p:"cur",pr:9800,d:"Allenamento: più difesa per sempre.",ev:"def"},
 "Integratore corsa":{p:"cur",pr:9800,d:"Allenamento: più velocità per sempre.",ev:"spe"},
 "Caramella del coach":{p:"cur",pr:0,d:"Sale subito di un livello.",up:1},
 "Pastiglia di fosforo":{p:"cur",pr:0,d:"Sale di 1 livello e recupera tutto.",up:1},
 "Banana":{p:"fru",pr:0,d:"Frutto: in partita ridà 10 punti vita quando serve.",held:"h10"},
 "Mirtilli":{p:"fru",pr:0,d:"Frutto: cura l infortunio da solo.",held:"inj"},
 "Arancia":{p:"fru",pr:0,d:"Frutto: ridà un quarto dei punti vita sotto la metà.",held:"h25"},
 "Ciliegie":{p:"fru",pr:0,d:"Frutto: sveglia da STANCO.",held:"slp"},
 "Polsino":{p:"ogg",pr:3000,d:"Da tenere: le mosse di tiro fanno più danni.",held:"spa"},
 "Ginocchiera":{p:"ogg",pr:3000,d:"Da tenere: meno danni dalle mosse fisiche.",held:"def"},
 "Fascia lucky":{p:"ogg",pr:3000,d:"Da tenere: più colpi critici.",held:"crit"},
 "Scarpe nuove":{p:"ogg",pr:3000,d:"Da tenere: più veloce.",held:"spe"},
 "Fischietto":{p:"ogg",pr:500,d:"Tiene lontani i giocatori selvatici per un po.",rep:120},
 "Fischietto forte":{p:"ogg",pr:900,d:"Li tiene lontani più a lungo.",rep:250},
 "Uscita d emergenza":{p:"ogg",pr:550,d:"Esci subito da una grotta.",esc:1},
 "Bici":{p:"chi",pr:0,d:"Si va il doppio più veloci (tasto in alto).",key:"bike"},
 "Canna da pesca":{p:"chi",pr:0,d:"Usala davanti all acqua: escono giocatori dal lago.",key:"rod"},
 "Mappa della regione":{p:"chi",pr:0,d:"La mappa di tutta la regione.",key:"map"},
 "Lettera per il professore":{p:"chi",pr:0,d:"Da consegnare al Prof. Parquet.",key:"letter"}};
/* SCHEMI: le mosse si comprano in negozio e si insegnano solo ai ruoli giusti (il centro la schiacciata, la guardia l assist…) */
const SCHEMI=MOVES.filter(m=>m.r!==""||m.t==="BAS").map(m=>({n:"Schema: "+m.n,mv:m.n,pr:m.c==="S"?2000:Math.max(1500,m.p*45)}));
SCHEMI.forEach(s=>{IT[s.n]={p:"sch",pr:s.pr,d:`Insegna «${s.mv}» (${TY[MV[s.mv].t].n}${MV[s.mv].r?" · "+MV[s.mv].r.split("").map(x=>({G:"guardie",F:"ali",C:"centri"})[x]).join(", "):""}). Si può riusare.`,mv:s.mv}});
const POCK=[["cur","CURE"],["con","CONTRATTI"],["fru","FRUTTI"],["ogg","OGGETTI"],["sch","SCHEMI"],["chi","CHIAVE"]];
/* ---------- GRAFICA PIXEL (tutta disegnata qui) ---------- */
const cnv=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.imageSmoothingEnabled=false;return[c,x]};
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>cl(Math.round(k>0?v+(255-v)*k:v*(1+k)),0,255);return"#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("")};
const TS=16;/* tile */
const TILE={};const tile=(k,f)=>{const[c,x]=cnv(TS,TS);f(x);TILE[k]=c};
const px=(x,c,X,Y,w,h)=>{x.fillStyle=c;x.fillRect(X,Y,w||1,h||1)};
const noise=(x,cols,n,seed)=>{const r=sR(seed||7);for(let i=0;i<n;i++)px(x,cols[Math.floor(r()*cols.length)],Math.floor(r()*16),Math.floor(r()*16))};
const buildTiles=()=>{
  tile(".",x=>{px(x,"#7ccf5a",0,0,16,16);noise(x,["#6cbf4c","#8bdb68"],22,1)});
  tile(",",x=>{px(x,"#7ccf5a",0,0,16,16);noise(x,["#6cbf4c","#8bdb68"],18,2);[[3,4],[10,9],[6,12]].forEach(([a,b])=>{px(x,"#5aa83e",a,b,1,2);px(x,"#5aa83e",a+1,b-1,1,2)})});
  tile('"',x=>{px(x,"#5fb444",0,0,16,16);for(let i=0;i<4;i++)for(let j=0;j<2;j++){const X=i*4,Y=j*8;px(x,"#2f7d2a",X,Y+3,4,5);px(x,"#3e9a33",X+1,Y+1,1,6);px(x,"#3e9a33",X+3,Y+2,1,5);px(x,"#8fe06f",X+1,Y+1,1,1);px(x,"#8fe06f",X+3,Y+2,1,1);px(x,"#1f5c1f",X,Y+7,4,1)}});
  tile(":",x=>{px(x,"#e3c98f",0,0,16,16);noise(x,["#d4b97c","#efd9a6"],26,3)});
  tile("=",x=>{px(x,"#cfcbc3",0,0,16,16);px(x,"#b7b2a8",0,0,16,1);px(x,"#b7b2a8",0,8,16,1);px(x,"#b7b2a8",8,0,1,8);px(x,"#b7b2a8",0,8,1,8);noise(x,["#d9d6cf"],10,4)});
  tile("s",x=>{px(x,"#f1dfa6",0,0,16,16);noise(x,["#e6d090","#f8ecc4"],24,5)});
  tile("~",x=>{px(x,"#4a9be0",0,0,16,16);px(x,"#6cb6f0",2,3,5,1);px(x,"#6cb6f0",9,10,5,1);px(x,"#3a84c8",0,15,16,1);px(x,"#9ad2fa",3,3,2,1);px(x,"#9ad2fa",10,10,2,1)});
  tile("T",x=>{px(x,"#7ccf5a",0,0,16,16);px(x,"#5a3a22",6,11,4,5);px(x,"#3f2816",6,11,1,5);x.fillStyle="#1f6a2c";x.beginPath();x.arc(8,7,7,0,7);x.fill();x.fillStyle="#2f8a39";x.beginPath();x.arc(7,6,5.5,0,7);x.fill();x.fillStyle="#4caf4a";x.beginPath();x.arc(6,5,3,0,7);x.fill();px(x,"#7ed36a",5,3,2,1);px(x,"#16502a",3,11,10,1)});
  tile("F",x=>{px(x,"#7ccf5a",0,0,16,16);noise(x,["#6cbf4c"],10,6);[[3,3,"#f43f5e"],[11,4,"#facc15"],[6,11,"#fafafa"],[12,12,"#f43f5e"]].forEach(([a,b,c])=>{px(x,c,a-1,b,3,1);px(x,c,a,b-1,1,3);px(x,"#fde047",a,b)})});
  tile("L",x=>{px(x,"#7ccf5a",0,0,16,16);noise(x,["#6cbf4c"],10,8);px(x,"#4f9a3a",0,10,16,2);px(x,"#3b7a2b",0,12,16,2);px(x,"#9ee07f",0,9,16,1)});
  tile("#",x=>{px(x,"#7ccf5a",0,0,16,16);px(x,"#f5f5f4",1,4,2,11);px(x,"#f5f5f4",13,4,2,11);px(x,"#e7e5e4",0,6,16,2);px(x,"#e7e5e4",0,11,16,2);px(x,"#a8a29e",1,14,2,1);px(x,"#a8a29e",13,14,2,1)});
  tile("S",x=>{px(x,"#7ccf5a",0,0,16,16);px(x,"#7c4a24",7,9,2,6);px(x,"#9a6332",2,3,12,7);px(x,"#c48a4f",3,4,10,5);px(x,"#5a341a",2,9,12,1);px(x,"#7c4a24",4,5,8,1);px(x,"#7c4a24",4,7,6,1)});
  tile("R",x=>{px(x,"#8b8f96",0,0,16,16);noise(x,["#757a82","#a2a6ad"],30,9);px(x,"#5b5f66",0,15,16,1)});/* roccia/montagna */
  tile("C",x=>{px(x,"#d6c8a8",0,0,16,16);noise(x,["#c4b58f","#e2d6bb"],30,10)});/* pavimento grotta */
  /* interni */
  tile("f",x=>{px(x,"#d6a25e",0,0,16,16);for(let j=0;j<16;j+=4){px(x,"#b98443",0,j+3,16,1);px(x,"#e3b678",((j*5)%13),j,4,1)}});/* parquet */
  tile("k",x=>{px(x,"#e9edf2",0,0,16,16);px(x,"#cbd3dc",0,0,16,1);px(x,"#cbd3dc",0,0,1,16);px(x,"#f7f9fb",1,1,6,6)});/* piastrelle */
  tile("X",x=>{px(x,"#e8dcc4",0,0,16,16);px(x,"#cdbd9c",0,13,16,3);px(x,"#b8a580",0,12,16,1);for(let i=0;i<16;i+=4)px(x,"#ddd0b4",i,0,1,12)});/* muro interno */
  tile("Y",x=>{px(x,"#cfe3f0",0,0,16,16);px(x,"#a9c6da",0,13,16,3);px(x,"#8fb2ca",0,12,16,1)});/* muro azzurro (centro/negozio) */
  tile("m",x=>{px(x,"#d6a25e",0,0,16,16);px(x,"#b4342f",1,3,14,10);px(x,"#d9534c",2,4,12,8);px(x,"#f1c40f",2,7,12,1)});/* tappeto uscita */
  tile("_",x=>{px(x,"#111",0,0,16,16)});
};
/* ---------- edifici esterni (disegnati come oggetti) ---------- */
const drawBld=(x,b,X,Y)=>{const W=b.w*TS,Hh=b.h*TS,rh=Math.round(Hh*.45);const rc=b.roof||"#c2410c",wc=b.wall||"#f3ead8";
  x.fillStyle=shade(wc,-.25);x.fillRect(X,Y+rh,W,Hh-rh);x.fillStyle=wc;x.fillRect(X+1,Y+rh,W-2,Hh-rh-1);for(let i=X+3;i<X+W-3;i+=6){x.fillStyle=shade(wc,-.06);x.fillRect(i,Y+rh+2,1,Hh-rh-4)}
  x.fillStyle=shade(rc,-.35);x.fillRect(X-2,Y+rh-3,W+4,4);x.fillStyle=rc;x.fillRect(X-1,Y,W+2,rh-2);for(let j=Y+2;j<Y+rh-2;j+=3){x.fillStyle=shade(rc,-.15);x.fillRect(X-1,j,W+2,1)}x.fillStyle=shade(rc,.25);x.fillRect(X-1,Y,W+2,2);
  /* finestre */const wy=Y+rh+4;for(let i=0;i<b.w;i++){if(b.door!=null&&i===b.door)continue;if(b.w>3&&(i===0||i===b.w-1)&&b.k!=="lab")continue;const wx=X+i*TS+4;x.fillStyle="#5b4630";x.fillRect(wx-1,wy-1,10,8);x.fillStyle="#9fd3f5";x.fillRect(wx,wy,8,6);x.fillStyle="#e6f6ff";x.fillRect(wx,wy,3,2);x.fillStyle="#5b4630";x.fillRect(wx+4,wy,1,6)}
  if(b.door!=null){const dx=X+b.door*TS+3,dy=Y+Hh-12;x.fillStyle="#3b2414";x.fillRect(dx-1,dy-1,12,13);x.fillStyle=b.doorc||"#7a4a26";x.fillRect(dx,dy,10,12);x.fillStyle=shade(b.doorc||"#7a4a26",.2);x.fillRect(dx+1,dy+1,3,10);x.fillStyle="#fcd34d";x.fillRect(dx+7,dy+6,1,1)}
  if(b.sign){x.fillStyle=b.signc||"#1d4ed8";x.fillRect(X+W/2-14,Y+rh-1,28,8);x.fillStyle="#fff";x.font="bold 6px monospace";x.textAlign="center";x.textBaseline="middle";x.fillText(b.sign,X+W/2,Y+rh+3)}};
/* ---------- personaggi in giro (16x20): l allenatore col cappello nei colori della squadra ---------- */
const PEOPLE={};
const drawPerson=(x,o,dir,fr)=>{/* o: {cap,capc,hair,skin,shirt,pants,kind} */const sk=o.skin||"#f1c27d",sh=o.shirt||"#2563eb",pa=o.pants||"#1f2937",hc=o.hairc||"#3b2414";const legA=fr===1?1:fr===3?-1:0;
  const P=(c,X,Y,w,h)=>px(x,c,X,Y,w,h);
  /* gambe */P(pa,5,15,2,3+(legA>0?1:0));P(pa,9,15,2,3+(legA<0?1:0));P("#111",5,18+(legA>0?1:0),3,1);P("#111",8,18+(legA<0?1:0),3,1);
  /* corpo */P(shade(sh,-.3),4,9,8,7);P(sh,5,9,6,6);if(o.kind==="trainer"){P(o.capc,5,12,6,1)}if(o.coat){P("#f8fafc",4,9,8,7);P("#e2e8f0",7,9,2,7);P(sh,5,9,2,2)}
  /* braccia */const sw=fr%2?1:0;P(sk,3,10+sw,1,4);P(sk,12,10+(1-sw),1,4);P(shade(sh,-.3),3,9+sw,1,2);P(shade(sh,-.3),12,9+(1-sw),1,2);
  /* testa */P("#2b1a10",4,2,8,8);P(sk,5,3,6,6);if(dir!=="up"){if(dir==="down"){P("#111",6,5,1,2);P("#111",9,5,1,2);P(shade(sk,-.25),7,8,2,1)}else{const e=dir==="left"?5:10;P("#111",e,5,1,2)}}
  /* capelli / cappello */if(o.cap){P(shade(o.capc,-.35),4,1,8,3);P(o.capc,5,1,6,3);if(dir==="down")P(shade(o.capc,-.2),4,4,8,1);if(dir==="left")P(shade(o.capc,-.2),2,4,4,1);if(dir==="right")P(shade(o.capc,-.2),10,4,4,1);if(dir==="up")P(shade(o.capc,-.35),5,3,6,1);if(o.logo&&dir!=="up"){P(o.logoc||"#111",7,2,2,1)}}
  else{P(hc,4,1,8,3);if(dir==="up")P(hc,4,3,8,5);if(o.long){P(hc,3,3,2,6);P(hc,11,3,2,6)}if(o.bald){P(sk,5,1,6,2)}if(o.white){P("#e5e7eb",4,1,8,3)}}
  if(o.bag&&dir!=="down"){P("#7c2d12",dir==="left"?10:dir==="right"?3:5,10,3,4)}
  x.fillStyle="rgba(0,0,0,.18)";x.fillRect(4,19,8,1)};
const personSheet=o=>{const[c,x]=cnv(16*4,20*4);["down","left","right","up"].forEach((d,r)=>{for(let f=0;f<4;f++){x.save();x.translate(f*16,r*20);drawPerson(x,o,d,f);x.restore()}});return c};
/* ---------- i mini giocatori (56x56): davanti quando li incontri, di spalle quando lottano per te ---------- */
const SKIN=["#f6d2b6","#e9b98f","#c68a5a","#8d5a35","#5e3a22"];
const sprCache={};
const drawPlayer=(s,back,shiny)=>{const key=s.n+(back?"b":"f")+(shiny?"s":"");if(sprCache[key])return sprCache[key];const[c,x]=cnv(56,56);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w,h);
  const sk=SKIN[cl((s.skin||3)-1,0,4)],skd=shade(sk,-.25),jc=shiny?shade(s.col[0],.35):s.col[0],jt=s.col[1]||"#fff",jd=shade(jc,-.3);const big=s.build==="big",tall=s.build==="tall";
  const top=tall?2:big?5:6,bw=big?20:16,cx=28;const head=12;
  /* scarpe e gambe */const ly=top+head+24+(tall?6:0);P("#111",cx-9,ly+12,8,4);P("#111",cx+1,ly+12,8,4);P("#f8fafc",cx-9,ly+12,8,1);P("#f8fafc",cx+1,ly+12,8,1);P(sk,cx-7,ly+4,5,8);P(sk,cx+2,ly+4,5,8);P(skd,cx-3,ly+4,1,8);P(skd,cx+6,ly+4,1,8);
  /* pantaloncini */P(jd,cx-bw/2,ly-4,bw,9);P(jc,cx-bw/2+1,ly-4,bw-2,8);P(jt,cx-bw/2,ly+1,2,4);P(jt,cx+bw/2-2,ly+1,2,4);P(jd,cx,ly,1,5);
  /* canotta */const ty=top+head+3;const th=ly-4-ty;P(jd,cx-bw/2,ty,bw,th);P(jc,cx-bw/2+1,ty,bw-2,th);P(jt,cx-bw/2,ty,bw,1);P(jt,cx-bw/2+3,ty,1,4);P(jt,cx+bw/2-4,ty,1,4);
  /* braccia (spalle scoperte) */const aw=big?6:5;P(sk,cx-bw/2-aw,ty+1,aw,th+4);P(sk,cx+bw/2,ty+1,aw,th+4);P(skd,cx-bw/2-1,ty+2,1,th+2);P(skd,cx+bw/2,ty+2,1,th+2);P(sk,cx-bw/2-aw,ty+th+4,aw,3);P(sk,cx+bw/2,ty+th+4,aw,3);
  if(s.band){P("#fff",cx-bw/2-aw,ty+th-2,aw,2);P("#fff",cx+bw/2,ty+th-2,aw,2)}
  /* numero (davanti) o nome + numero (dietro) */x.fillStyle=jt;x.textAlign="center";x.textBaseline="middle";x.font="bold 9px monospace";x.fillText(String(s.num),cx,ty+th/2+(back?3:1));if(back){x.font="bold 4px monospace";x.fillText(s.short.toUpperCase().slice(0,9),cx,ty+3)}
  /* collo e testa */P(skd,cx-2,top+head-1,4,4);const hx=cx-7,hy=top;P(shade(sk,-.45),hx-1,hy,16,head+1);P(sk,hx,hy+1,14,head-1);P(skd,hx,hy+head-2,14,1);
  if(!back){/* faccia */P("#1f1410",hx+3,hy+5,2,2);P("#1f1410",hx+9,hy+5,2,2);P("#fff",hx+3,hy+5,1,1);P("#fff",hx+9,hy+5,1,1);P(shade(sk,-.35),hx+6,hy+8,2,1);P("#7f1d1d",hx+5,hy+10,4,1);P(skd,hx-1,hy+5,1,3);P(skd,hx+14,hy+5,1,3)}else{P(skd,hx-1,hy+5,1,3);P(skd,hx+14,hy+5,1,3)}
  /* capelli */const HC=s.skin<=1?"#7a5230":s.skin===2?"#3b2414":"#1a120c",hcol=s.n==="Kristaps Porziņģis"||s.n==="Cooper Flagg"||s.n==="Matas Buzelis"?"#8a6a3a":HC;
  const hh=s.hair;if(hh==="buzz"){P(shade(hcol,.15),hx,hy+1,14,2)}else if(hh==="afro"){P(hcol,hx-2,hy-3,18,6);P(hcol,hx-2,hy+2,2,4);P(hcol,hx+14,hy+2,2,4)}else if(hh==="locs"||hh==="braids"){P(hcol,hx-1,hy-1,16,4);for(let i=0;i<8;i++)P(hcol,hx-2+i*2,hy+2,1,back?9:i%7===0?7:2);if(back)P(hcol,hx,hy+2,14,7)}else if(hh==="curly"){P(hcol,hx-1,hy-2,16,5);for(let i=0;i<7;i++)P(shade(hcol,.2),hx+i*2,hy-2,1,1)}else if(hh==="long"){P(hcol,hx-1,hy-1,16,4);P(hcol,hx-2,hy+2,3,9);P(hcol,hx+13,hy+2,3,9);if(back)P(hcol,hx,hy+2,14,9)}else{P(hcol,hx-1,hy-1,16,4);P(hcol,hx-1,hy+2,2,2);P(hcol,hx+13,hy+2,2,2)}
  if(back&&hh!=="locs"&&hh!=="braids"&&hh!=="long")P(hcol,hx,hy+2,14,hh==="buzz"?3:5);
  if(s.band){P("#fff",hx-1,hy+3,16,2);P(jc,hx+5,hy+3,4,2)}
  /* barba */if(!back&&s.beard!=="none"){const bc=hcol;if(s.beard==="stubble"){for(let i=0;i<12;i+=2)P(shade(bc,.15),hx+1+i,hy+10,1,1)}else if(s.beard==="short"){P(bc,hx,hy+9,14,2);P(bc,hx+1,hy+11,12,1);P(shade(sk,-.35),hx+5,hy+10,4,1)}else{P(bc,hx-1,hy+8,16,3);P(bc,hx,hy+11,14,2);P(bc,hx+2,hy+13,10,1);P("#7f1d1d",hx+5,hy+10,4,1);if(s.beard==="huge")P(bc,hx+1,hy+14,12,2)}}
  /* ombra */x.fillStyle="rgba(0,0,0,.2)";x.beginPath();x.ellipse(cx,ly+16,14,2.5,0,0,7);x.fill();
  sprCache[key]=c;return c};
/* ---------- LA REGIONE (originale): Borgo Parquet → Percorso 1 → Canestropoli ---------- */
const MAPS={
 borgo:{n:"BORGO PARQUET",mus:"town",rows:[
  "TTTTTTTT::TTTTTTTTTT",
  "TTTTTTTT::TTTTTTTTTT",
  "TT......::........TT",
  "TT......::........TT",
  "TT.,....::....,...TT",
  "TT......::........TT",
  "TT..:...::......:.TT",
  "TT::::::::::::::::TT",
  "TT..F...::........TT",
  "TT......::........TT",
  "TT......::........TT",
  "TT.,....::........TT",
  "TT..F...::.....:..TT",
  "TT::::::::::::::::TT",
  "TT....S...........TT",
  "TT..~~~~...F...,..TT",
  "TT..~~~~..........TT",
  "TTTTTTTTTTTTTTTTTTTT"],
  blds:[{k:"house",x:3,y:3,w:4,h:3,door:1,roof:"#b45309",to:"casa1",tx:3,ty:7},{k:"house",x:12,y:3,w:4,h:3,door:2,roof:"#1d4ed8",to:"casar",tx:3,ty:7},{k:"lab",x:11,y:9,w:6,h:4,door:3,roof:"#475569",wall:"#e5e7eb",sign:"LAB",to:"lab",tx:4,ty:11}],
  signs:{"6,14":"BORGO PARQUET\nDove ogni carriera comincia."},
  links:{n:{to:"route1",dx:0}},
  npcs:[{id:"kidb",x:14,y:15,spr:"kid",move:"wander",talk:["Dicono che nell erba alta ci siano giocatori che aspettano solo un contratto!"]},{id:"prof_block",x:8,y:2,spr:"none",flag:"!starter",trig:"profstop"}]},
 casa1:{n:"CASA",mus:"home",inside:1,rows:["XXXXXXXX","XXXXXXXX","ffffffff","ffffffff","ffffffff","ffffffff","ffffffff","fffmffff"],
  objs:[{k:"stairs",x:7,y:2,to:"casa2",tx:6,ty:2},{k:"table",x:2,y:3},{k:"tv",x:1,y:1},{k:"shelf",x:4,y:1},{k:"plant",x:0,y:2}],
  exit:{x:3,y:7,to:"borgo",tx:4,ty:6},npcs:[{id:"mom",x:4,y:3,spr:"mom",dir:"left",talk:"mom"}]},
 casa2:{n:"CAMERA",mus:"home",inside:1,rows:["XXXXXXXX","XXXXXXXX","ffffffff","ffffffff","ffffffff","ffffffff"],
  objs:[{k:"stairs",x:7,y:2,to:"casa1",tx:6,ty:2},{k:"bed",x:0,y:3},{k:"pc",x:1,y:1},{k:"console",x:4,y:1},{k:"plant",x:6,y:5}],npcs:[]},
 casar:{n:"CASA DEL RIVALE",mus:"home",inside:1,rows:["XXXXXXXX","XXXXXXXX","ffffffff","ffffffff","ffffffff","ffffffff","ffffffff","fffmffff"],
  objs:[{k:"table",x:3,y:3},{k:"shelf",x:1,y:1},{k:"plant",x:7,y:2},{k:"tv",x:5,y:1}],exit:{x:3,y:7,to:"borgo",tx:14,ty:6},npcs:[{id:"sis",x:5,y:4,spr:"girl",talk:["Mio fratello VITO è già al laboratorio da un ora. Lui vuole sempre arrivare primo!"]}]},
 lab:{n:"LAB. PROF. PARQUET",mus:"lab",inside:1,rows:["YYYYYYYYYY","YYYYYYYYYY","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkmkkkkk"],
  objs:[{k:"shelf",x:0,y:1},{k:"shelf",x:1,y:1},{k:"shelf",x:7,y:1},{k:"shelf",x:8,y:1},{k:"pc",x:3,y:1},{k:"desk3",x:5,y:3},{k:"plant",x:9,y:10},{k:"plant",x:0,y:10},{k:"table",x:1,y:6},{k:"table",x:7,y:6}],
  exit:{x:4,y:11,to:"borgo",tx:14,ty:13},npcs:[{id:"prof",x:4,y:3,spr:"prof",talk:"prof"},{id:"aide",x:1,y:8,spr:"aide",move:"wander",talk:["Il professore studia i giocatori da quarant anni. Dice che ognuno ha un tipo: GUARDIA, ALA, CENTRO… e uno stile!"]},{id:"rival",x:4,y:5,spr:"rival",dir:"up",flag:"!rivaldone",talk:"rival"}]},
 route1:{n:"PERCORSO 1",mus:"route",enc:"r1",rows:[
  "TTTTTTTT::TTTTTTTTTT",
  "TT......::........TT",
  "TT..\"\"\"\"::....\"\"\"\"TT",
  "TT..\"\"\"\"::....\"\"\"\"TT",
  "TT..\"\"\"\"::....\"\"\"\"TT",
  "TT......::........TT",
  "TTLLLLLL::LLLLLL..TT",
  "TT......::........TT",
  "TT.\"\"\"\"\"::\"\"\"\".....TT",
  "TT.\"\"\"\"\"::\"\"\"\".....TT",
  "TT.\"\"\"\"\"::\"\"\"\".....TT",
  "TT......::......F.TT",
  "TT.F....::..TTTT..TT",
  "TT......::..TTTT..TT",
  "TT..TT..::........TT",
  "TT..TT..::\"\"\"\"\"\"..TT",
  "TT......::\"\"\"\"\"\"..TT",
  "TTLLLLLL::LLLLLLLLTT",
  "TT......::........TT",
  "TT\"\"\"\"\"\"::....S...TT",
  "TT\"\"\"\"\"\"::........TT",
  "TT\"\"\"\"\"\"::..\"\"\"\"\"\"TT",
  "TT......::..\"\"\"\"\"\"TT",
  "TT..F...::..\"\"\"\"\"\"TT",
  "TT......::........TT",
  "TTTTTTTT::TTTTTTTTTT"].map(r=>r.replace(/\\"/g,'"')),
  signs:{"14,19":"PERCORSO 1\nNORD: Canestropoli · SUD: Borgo Parquet"},
  links:{s:{to:"borgo",dx:0},n:{to:"canestro",dx:2}},
  items:[{id:"r1a",x:17,y:1,it:"Borraccia"},{id:"r1b",x:3,y:23,it:"Contratto"},{id:"r1c",x:16,y:15,it:"Ghiaccio"}],
  npcs:[{id:"t_r1a",x:11,y:7,spr:"kid",dir:"left",trainer:{n:"RAGAZZO DEL CAMPETTO",party:"r1a",money:120,sight:4,pre:["Ehi! Mi alleno qui tutti i pomeriggi. Facciamo una sfida?"],lose:["Mi hai fatto il cucchiaio!"]}},
        {id:"t_r1b",x:3,y:18,spr:"girl",dir:"right",trainer:{n:"TIFOSA",party:"r1b",money:140,sight:4,pre:["Ho tutte le figurine della stagione! Vediamo i tuoi giocatori!"],lose:["La prossima volta porto la sciarpa portafortuna…"]}},
        {id:"old1",x:15,y:24,spr:"old",move:"turn",talk:["Ai miei tempi si giocava senza la linea da tre!","Se un giocatore è molto stanco, firmare il contratto è più facile."]}]},
 canestro:{n:"CANESTROPOLI",mus:"city",rows:[
  "TTTTTTTTTTTTTTTTTTTTTTTT",
  "TT..................::TT",
  "TT..................::TT",
  "TT..................::TT",
  "TT..................::TT",
  "TT::::::::::::::::::::TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT::::::::::::::::::::TT",
  "TT..F......::......F..TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TT..S......::.........TT",
  "TT::::::::::::::::::::TT",
  "TT..F......::.....,...TT",
  "TT.........::.........TT",
  "TT.........::.........TT",
  "TTTTTTTTTT::TTTTTTTTTTTT"],
  blds:[{k:"center",x:3,y:6,w:5,h:4,door:2,roof:"#dc2626",wall:"#fff7ed",sign:"CURA",signc:"#dc2626",to:"centro",tx:4,ty:7},{k:"shop",x:14,y:6,w:5,h:4,door:2,roof:"#2563eb",wall:"#eff6ff",sign:"SHOP",signc:"#2563eb",to:"shop",tx:3,ty:7},{k:"gym",x:7,y:1,w:9,h:4,door:4,roof:"#7c3aed",wall:"#ede9fe",sign:"PALESTRA",signc:"#7c3aed",to:"gymshut"},{k:"house",x:3,y:12,w:4,h:3,door:1,roof:"#15803d",to:"casac",tx:3,ty:7},{k:"house",x:15,y:12,w:4,h:3,door:2,roof:"#a16207",to:"casac2",tx:3,ty:7}],
  signs:{"4,16":"CANESTROPOLI\nLa città dove ogni tiro fa rumore."},
  links:{s:{to:"route1",dx:-2}},
  npcs:[{id:"guard",x:20,y:1,spr:"guard",talk:["Strada chiusa per lavori: stanno costruendo il PERCORSO 2.","Torna più avanti!"]},{id:"cg1",x:12,y:14,spr:"girl",move:"wander",talk:["Al SHOP vendono anche gli SCHEMI: insegnano mosse nuove, ma solo ai ruoli giusti!"]},{id:"cg2",x:8,y:19,spr:"kid",move:"wander",talk:["Al CENTRO CURA ti rimettono a posto tutta la squadra gratis."]}]},
 centro:{n:"CENTRO CURA",mus:"center",inside:1,rows:["YYYYYYYYYY","YYYYYYYYYY","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkkkkkkk","kkkkmkkkkk"],
  objs:[{k:"counter",x:2,y:2,w:6},{k:"pc",x:9,y:1},{k:"plant",x:0,y:2},{k:"bench",x:7,y:5}],exit:{x:4,y:7,to:"canestro",tx:5,ty:10},npcs:[{id:"nurse",x:4,y:1,spr:"nurse",talk:"nurse"},{id:"cpc",x:9,y:3,spr:"none",talk:"pc"}]},
 shop:{n:"SHOP",mus:"center",inside:1,rows:["YYYYYYYY","YYYYYYYY","kkkkkkkk","kkkkkkkk","kkkkkkkk","kkkkkkkk","kkkkkkkk","kkkmkkkk"],
  objs:[{k:"counter",x:0,y:3,w:2},{k:"shelf",x:4,y:1},{k:"shelf",x:5,y:1},{k:"shelf",x:6,y:1},{k:"shelf",x:7,y:1},{k:"plant",x:7,y:6}],exit:{x:3,y:7,to:"canestro",tx:16,ty:10},npcs:[{id:"clerk",x:0,y:2,spr:"clerk",dir:"down",talk:"shop"},{id:"sh1",x:5,y:5,spr:"old",move:"turn",talk:["Uno SCHEMA si può usare quante volte vuoi: basta che il giocatore sia del ruolo giusto."]}]},
 casac:{n:"CASA",mus:"home",inside:1,rows:["XXXXXXXX","XXXXXXXX","ffffffff","ffffffff","ffffffff","ffffffff","ffffffff","fffmffff"],objs:[{k:"table",x:2,y:3},{k:"shelf",x:5,y:1}],exit:{x:3,y:7,to:"canestro",tx:4,ty:15},npcs:[{id:"cc1",x:5,y:4,spr:"old",talk:["I giocatori con lo stile ATLETA saltano più di tutti, ma i DIFENSORI li fermano.","Le GUARDIE battono le ALI, le ALI battono i CENTRI, i CENTRI battono le GUARDIE."]}]},
 casac2:{n:"CASA",mus:"home",inside:1,rows:["XXXXXXXX","XXXXXXXX","ffffffff","ffffffff","ffffffff","ffffffff","ffffffff","fffmffff"],objs:[{k:"bed",x:0,y:3},{k:"shelf",x:3,y:1}],exit:{x:3,y:7,to:"canestro",tx:17,ty:15},npcs:[{id:"cc2",x:4,y:4,spr:"girl",talk:["Tieni, a me non serve più!"],gift:"Canna da pesca"}]}
};
const ENC={r1:{rate:.1}};/* tabelle riempite all avvio con i giocatori meno quotati */
const TRP={};/* squadre degli allenatori, riempite all avvio */
/* ---------- SUONO: musiche chiptune composte qui (melodie generate da scale, originali) + effetti ---------- */
const AU={ac:null,mg:null,cur:null,timer:null,vol:.5,on:true};
const auInit=()=>{if(AU.ac)return;try{AU.ac=new (window.AudioContext||window.webkitAudioContext)();AU.mg=AU.ac.createGain();AU.mg.gain.value=AU.vol*.35;AU.mg.connect(AU.ac.destination)}catch(e){}};
const note=(f,t,d,type,g)=>{const ac=AU.ac;if(!ac)return;const o=ac.createOscillator(),gg=ac.createGain();o.type=type||"square";o.frequency.value=f;gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(g||.12,t+.01);gg.gain.setValueAtTime(g||.12,t+d*.7);gg.gain.linearRampToValueAtTime(0,t+d*.95);o.connect(gg);gg.connect(AU.mg);o.start(t);o.stop(t+d)};
const midi=n=>440*Math.pow(2,(n-69)/12);
const SONG={};const mkSong=(id,seed,root,scale,bpm,mood)=>{const r_=sR(seed);const sc=scale;const bars=8,steps=bars*8;const mel=[],bas=[];let deg=0;const motif=[];for(let i=0;i<8;i++){deg=cl(deg+[-2,-1,0,1,1,2,3,-3][Math.floor(r_()*8)],-3,9);motif.push(r_()<.18?null:deg)}
  for(let b=0;b<bars;b++){const tr=[0,2,-1,0,3,2,4,0][b%8]+(mood==="battle"?0:0);for(let s=0;s<8;s++){let d=motif[(s+(b%2?0:0))%8];if(b%4===3&&s>=6)d=s===6?tr+2:null;mel.push(d==null?null:d+tr+(b>=4&&r_()<.25?(r_()<.5?1:-1):0))}const chord=[0,3,4,0,5,3,4,0][b%8];for(let s=0;s<8;s++)bas.push(s%2===0||mood==="battle"?chord:null)}
  SONG[id]={root,sc,bpm,mel,bas,mood}};
const SCM=[0,2,4,5,7,9,11],SCm=[0,2,3,5,7,8,10],SCp=[0,2,4,7,9];
const deg2=(sc,root,d)=>{const o=Math.floor(d/sc.length),k=((d%sc.length)+sc.length)%sc.length;return root+o*12+sc[k]};
mkSong("title",11,72,SCM,104);mkSong("town",23,72,SCp,96);mkSong("home",31,69,SCM,84);mkSong("lab",41,67,SCM,100);mkSong("route",53,74,SCM,120);mkSong("city",67,72,SCM,108);mkSong("center",79,76,SCp,92);mkSong("battle",97,69,SCm,150,"battle");mkSong("trainer",113,71,SCm,156,"battle");mkSong("rival",131,70,SCm,160,"battle");mkSong("win",137,76,SCM,140);
const playMus=id=>{if(!AU.ac||!AU.on){AU.want=id;return}if(AU.cur===id)return;AU.cur=id;clearTimeout(AU.timer);const S=SONG[id];if(!S)return;const st=60/S.bpm/2;let i=0;let t0=AU.ac.currentTime+.05;
  const sched=()=>{if(AU.cur!==id)return;while(t0<AU.ac.currentTime+.4){const k=i%S.mel.length;const m=S.mel[k],b=S.bas[k];if(m!=null)note(midi(deg2(S.sc,S.root,m)),t0,st*.95,"square",.07);if(b!=null)note(midi(deg2(S.sc,S.root-24,b)),t0,st*(S.mood==="battle"?.6:1.7),"triangle",.13);if(S.mood==="battle"&&k%2===0)note(midi(deg2(S.sc,S.root+12,(m||0)+2)),t0,st*.4,"square",.025);t0+=st;i++}AU.timer=setTimeout(sched,120)};sched()};
const stopMus=()=>{AU.cur=null;clearTimeout(AU.timer)};
const SFX={sel:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(1320,t,.05,"square",.08)},bump:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(110,t,.08,"square",.1)},
  hit:k=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;const n=AU.ac.createBufferSource(),b=AU.ac.createBuffer(1,4000,22050),d=b.getChannelData(0);for(let i=0;i<4000;i++)d[i]=(Math.random()*2-1)*(1-i/4000);n.buffer=b;const g=AU.ac.createGain();g.gain.value=.25*(k||1);n.connect(g);g.connect(AU.mg);n.start(t)},
  heal:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[72,76,79,84,79,84].forEach((m,i)=>note(midi(m),t+i*.13,.12,"square",.08))},
  lvl:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[72,74,76,77,79].forEach((m,i)=>note(midi(m),t+i*.07,.07,"square",.08))},
  shake:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(300,t,.06,"square",.08);note(240,t+.07,.06,"square",.08)},
  catch:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[67,72,76,79,84].forEach((m,i)=>note(midi(m),t+i*.1,.1,"square",.09))},
  faint:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;for(let i=0;i<8;i++)note(400-i*40,t+i*.05,.05,"square",.06)},
  item:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[79,84,88].forEach((m,i)=>note(midi(m),t+i*.09,.09,"square",.08))},
  ledge:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(500,t,.06,"square",.06);note(700,t+.06,.06,"square",.06)},
  door:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(220,t,.05,"triangle",.15);note(180,t+.06,.05,"triangle",.15)},
  alert:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(988,t,.08,"square",.09);note(1319,t+.09,.12,"square",.09)}};
/* ---------- STATO DELLA PARTITA ---------- */
let G=null;const SAVEK="dl_pdream_save";
const save=()=>{if(!G)return;try{localStorage.setItem(SAVEK,JSON.stringify(G))}catch(e){}};
const loadSave=()=>{try{const s=JSON.parse(localStorage.getItem(SAVEK)||"null");return s&&s.v===1?s:null}catch(e){return null}};
const newGame=(name,team)=>({v:1,name:name||"COACH",team,map:"casa2",x:3,y:3,dir:"down",party:[],box:[],bag:{"Borraccia":1},money:3000,flags:{},seen:{},caught:{},badges:[],time:0,rep:0,opts:{text:1},items:{}});
/* ---------- MOTORE: schermo, comandi, mappa, dialoghi, menu ---------- */
let host,cv,cx,ui,ux,SC=3,VW=240,VH=160,raf=0,alive=false,last=0;const KEY={};
const OBJ_SOLID={stairs:0,table:1,tv:1,shelf:1,plant:1,bed:1,pc:1,console:1,desk3:1,counter:1,bench:1};
let M=null,MK=null;/* mappa corrente */const PL={x:0,y:0,px:0,py:0,dir:"down",mv:0,fr:0,from:null,jump:0,run:false};
let NPCS=[];let mode="title",lock=false;const peopleSpr={};
const sprFor=k=>{if(peopleSpr[k])return peopleSpr[k];const T=TEAM();const D={hero:{cap:1,capc:T.cap,logo:1,logoc:T.capt,shirt:"#1f2937",pants:"#334155",kind:"trainer",bag:1},rival:{cap:1,capc:RIVT().cap,logo:1,logoc:RIVT().capt,shirt:"#7f1d1d",pants:"#1f2937",kind:"trainer"},mom:{hairc:"#7c2d12",long:1,shirt:"#db2777",pants:"#60a5fa"},prof:{white:1,coat:1,shirt:"#475569",pants:"#334155",skin:"#eac39a"},aide:{hairc:"#1f2937",coat:1,shirt:"#0ea5e9"},kid:{cap:1,capc:"#16a34a",shirt:"#f97316",pants:"#1e3a8a"},girl:{hairc:"#a16207",long:1,shirt:"#a855f7",pants:"#f1f5f9"},old:{white:1,shirt:"#78716c",pants:"#57534e",skin:"#e8b98f"},nurse:{hairc:"#be185d",long:1,shirt:"#fda4af",coat:1},clerk:{hairc:"#111827",shirt:"#2563eb",pants:"#1e3a8a"},guard:{cap:1,capc:"#1e3a8a",shirt:"#1e40af",pants:"#111827"}}[k]||{};peopleSpr[k]=personSheet(D);return peopleSpr[k]};
let TEAMS_={},TEAM=()=>TEAMS_[G.team]||{cap:"#facc15",capt:"#111",nick:"Coach"},RIVT=()=>TEAMS_[G.flags.rivTeam]||{cap:"#ef4444",capt:"#fff",nick:"Rivali"};
const tileAt=(x,y)=>{if(!M||y<0||y>=M.rows.length||x<0||x>=M.rows[0].length)return null;return M.rows[y][x]};
const bldAt=(x,y)=>(M.blds||[]).find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
const objAt=(x,y)=>(M.objs||[]).find(o=>x>=o.x&&x<o.x+(o.w||(o.k==="bed"?1:o.k==="desk3"?3:o.k==="table"?2:1))&&y>=o.y&&y<o.y+(o.k==="bed"?2:o.k==="table"?2:1));
const npcAt=(x,y)=>NPCS.find(n=>n.vis&&n.x===x&&n.y===y&&n.spr!=="none");
const solid=(x,y)=>{const t=tileAt(x,y);if(t==null)return true;if("T~R#SXY_".includes(t))return true;if(bldAt(x,y))return true;const o=objAt(x,y);if(o&&OBJ_SOLID[o.k])return true;if(npcAt(x,y))return true;const it=(M.items||[]).find(i=>!G.items[i.id]&&i.x===x&&i.y===y);if(it)return true;return false};
const flagOk=f=>{if(!f)return true;if(f[0]==="!")return!G.flags[f.slice(1)];return!!G.flags[f]};
const loadMap=(k,x,y,dir)=>{M=MAPS[k];MK=k;G.map=k;PL.x=PL.px=x;PL.y=PL.py=y;if(dir)PL.dir=dir;PL.mv=0;NPCS=(M.npcs||[]).map(n=>({...n,ox:n.x,oy:n.y,dir:n.dir||"down",px:n.x,py:n.y,mv:0,t:rnd()*2,vis:flagOk(n.flag)}));NPCS.forEach(n=>{const s=G.flags["pos_"+n.id];if(s){n.x=n.px=s[0];n.y=n.py=s[1]}});playMus(M.mus||"route");G.x=x;G.y=y;save();if(M.n&&!M.inside)banner(M.n)};
let ban={t:0,s:""};const banner=s=>{ban={t:2.2,s}};
/* ---------- testo e menu (disegnati sul livello nitido) ---------- */
let TQ=[],TB=null;/* coda messaggi: {s, cb} */
const say=(lines,cb)=>{lines=(Array.isArray(lines)?lines:[lines]).filter(s=>s!=null&&String(s).trim()!=='');if(!lines.length){if(cb)setTimeout(cb,0);return}lines.forEach((s,i,a)=>TQ.push({s:String(s).replace(/\{N\}/g,G.name).replace(/\{R\}/g,"VITO"),cb:i===a.length-1?cb:null}));if(!TB)nextText()};
const nextText=()=>{const q=TQ.shift();TB=q?{s:q.s,n:0,cb:q.cb}:null};
let MENU=null;/* {items:[[label,fn]], i, x,y,w, title, onB} */
const menu=(items,o)=>{MENU={items,i:0,...(o||{})}};
const textA=()=>{if(!TB)return false;if(TB.n<TB.s.length){TB.n=TB.s.length;return true}const cb=TB.cb;nextText();SFX.sel();if(cb)cb();return true};
/* ---------- input ---------- */
const IN={u:0,d:0,l:0,r:0,a:0,b:0,st:0,se:0};const pressed={};const press=k=>{if(!IN[k]){pressed[k]=1}IN[k]=1};const release=k=>{IN[k]=0};
const takeP=k=>{if(pressed[k]){pressed[k]=0;return true}return false};
const keyMap={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r",z:"a",Z:"a",Enter:"st",x:"b",X:"b"," ":"a",Shift:"se"};
/* ---------- passi nel mondo ---------- */
const DIRV={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const tryMove=dir=>{const[dx,dy]=DIRV[dir];if(PL.dir!==dir&&PL.mv===0&&!PL.held){PL.dir=dir;PL.turnT=.08;return}PL.dir=dir;const nx=PL.x+dx,ny=PL.y+dy;
  /* uscita dal bordo verso la mappa vicina */if(!M.inside&&(nx<0||ny<0||ny>=M.rows.length||nx>=M.rows[0].length)){const L=M.links&&M.links[ny<0?"n":ny>=M.rows.length?"s":nx<0?"w":"e"];if(L){const T=MAPS[L.to];let tx=nx+L.dx,ty=ny<0?T.rows.length-1:ny>=M.rows.length?0:ny;if(nx<0)tx=T.rows[0].length-1;if(nx>=M.rows[0].length)tx=0;loadMap(L.to,tx,ty,dir);return}SFX.bump();return}
  /* porte degli edifici */const b=bldAt(nx,ny);if(b&&dir==="up"&&b.door!=null&&nx===b.x+b.door&&ny===b.y+b.h-1){if(b.to==="gymshut"){say(["La porta è chiusa.","«Il capo palestra è in trasferta con la squadra. Torna più avanti!»"]);return}SFX.door();fade(()=>loadMap(b.to,b.tx,b.ty,"up"));return}
  /* uscita dalle case */if(M.exit&&dir==="down"&&PL.x===M.exit.x&&PL.y===M.exit.y){SFX.door();fade(()=>loadMap(M.exit.to,M.exit.tx,M.exit.ty,"down"));return}
  const t=tileAt(nx,ny);if(t==="L"){if(dir==="down"&&!solid(nx,ny+1)){PL.from=[PL.x,PL.y];PL.x=nx;PL.y=ny+1;PL.mv=1;PL.jump=1;PL.len=2;SFX.ledge();return}SFX.bump();return}
  if(solid(nx,ny)){if(!PL.bumpT){SFX.bump();PL.bumpT=.25}return}PL.from=[PL.x,PL.y];PL.x=nx;PL.y=ny;PL.mv=1;PL.jump=0;PL.len=1};
const stepDone=()=>{G.time+=0;const o=objAt(PL.x,PL.y);if(o&&o.k==="stairs"){SFX.door();fade(()=>loadMap(o.to,o.tx,o.ty,"left"));return}
  if(M.exit&&PL.x===M.exit.x&&PL.y===M.exit.y&&PL.dir==="down"){SFX.door();fade(()=>loadMap(M.exit.to,M.exit.tx,M.exit.ty,"down"));return}
  if(MK==="borgo"&&PL.y<=1&&!G.flags.starter){profStop();return}
  if(G.rep>0){G.rep--;if(G.rep===0)say("L effetto del fischietto è finito.")}
  if(checkTrainers())return;
  if(tileAt(PL.x,PL.y)==='"'&&M.enc&&G.party.length&&G.rep<=0&&rnd()<(ENC[M.enc].rate||.1)){wildBattle(M.enc);return}
  if(G.party.length&&rnd()<.002)G.flags.stepsHappy=(G.flags.stepsHappy||0)+1};
/* allenatori: ti vedono in linea retta e vengono a sfidarti */
const checkTrainers=()=>{for(const n of NPCS){if(!n.vis||!n.trainer||G.flags["tr_"+n.id])continue;const[dx,dy]=DIRV[n.dir];for(let k=1;k<=n.trainer.sight;k++){const x=n.x+dx*k,y=n.y+dy*k;if(x===PL.x&&y===PL.y){trainerSpot(n,k);return true}if(solid(x,y))break}}return false};
const trainerSpot=(n,k)=>{lock=true;SFX.alert();n.alert=1;playMus("trainer");setTimeout(()=>{n.alert=0;let steps=k-1;const go=()=>{if(steps<=0){PL.dir={up:"down",down:"up",left:"right",right:"left"}[n.dir];say(n.trainer.pre,()=>{lock=false;trainerBattle(n)});return}const[dx,dy]=DIRV[n.dir];n.x+=dx;n.y+=dy;n.mv=1;steps--;setTimeout(go,260)};go()},700)};
/* parlare / leggere / raccogliere (tasto A davanti a qualcosa) */
const interact=()=>{const[dx,dy]=DIRV[PL.dir],x=PL.x+dx,y=PL.y+dy;
  const n=NPCS.find(q=>q.vis&&((q.x===x&&q.y===y)||(q.spr==="none"&&q.x===x&&q.y===y)));if(n){talkTo(n);return}
  if(M.objs){const o=objAt(x,y);if(o){if(o.k==="pc")return pcMenu();if(o.k==="tv")return say("Alla TV danno gli highlights di stanotte. Che schiacciata!");if(o.k==="console")return say("Una console. Stasera si gioca, ora c è da allenarsi!");if(o.k==="shelf")return say("Libri di tattica, vecchie riviste di basket…");if(o.k==="counter"){const nn=NPCS.find(q=>q.vis&&Math.abs(q.x-x)<=0&&q.y===y-1);if(nn)return talkTo(nn)}}}
  const it=(M.items||[]).find(i=>!G.items[i.id]&&i.x===x&&i.y===y);if(it){G.items[it.id]=1;addItem(it.it,1);SFX.item();say(`{N} ha trovato: ${it.it}!`);return}
  const sg=M.signs&&M.signs[x+","+y];if(sg){say(sg.split("\n"));return}
  const t=tileAt(x,y);if(t==="~"&&G.bag["Canna da pesca"]){fish();return}};
const fish=()=>{say(["Lanci la lenza…","…","Abbocca qualcuno!"],()=>wildBattle("fish"))};
const addItem=(k,q)=>{G.bag[k]=(G.bag[k]||0)+q};
const fade=cb=>{FADE={t:0,cb}};let FADE=null;
/* ---------- STORIA DELLA PRIMA TAPPA ---------- */
const healAll=()=>{G.party.forEach(m=>{m.hp=stat(m,"hp");m.st=null;m.moves.forEach(x=>x.pp=MV[x.n].pp)})};
const STARTERS=()=>G.flags.starters||[];
const profStop=()=>{lock=true;say(["???: «Ehi! Aspetta! Non andare!»","PROF. PARQUET: «Nell erba alta ci sono giocatori selvatici: senza un giocatore tuo è pericoloso! Vieni con me al laboratorio.»"],()=>{fade(()=>{loadMap("lab",4,5,"up");lock=false;labIntro()})})};
const labIntro=()=>{say(["PROF. PARQUET: «Ecco, {N}. Qui studio i giocatori da una vita.»",`«So che alleni i ${TEAM().nick.toUpperCase()}: ho preparato tre giovani della tua squadra. Uno è una GUARDIA, uno un ALA, uno un CENTRO.»`,"«Le GUARDIE battono le ALI, le ALI battono i CENTRI, i CENTRI battono le GUARDIE. Scegli bene!»"],()=>chooseStarter())};
const chooseStarter=()=>{const S=STARTERS();menu(S.map(n=>{const s=SPX[n];return[`${s.n} · ${s.t.map(t=>TY[t].n).join("/")}`,()=>confirmStarter(n)]}),{title:"SCEGLI IL TUO PRIMO GIOCATORE",preview:i=>S[i],onB:()=>{}})};
const confirmStarter=n=>{const s=SPX[n];yesno(`Vuoi ${s.n}, ${s.t.map(t=>TY[t].n).join("/")}?`,ok=>{if(!ok)return chooseStarter();const m=mkMon(n,5,{ot:G.name});G.party.push(m);G.seen[n]=1;G.caught[n]=1;G.flags.starter=n;SFX.item();
  /* il rivale prende quello che batte il tuo */const role=s.role,beat={G:"C",F:"G",C:"F"}[role];const rv=STARTERS().find(q=>SPX[q].role===beat)||STARTERS().find(q=>q!==n);G.flags.rivalStarter=rv;
  say([`{N} ha firmato con ${s.n}!`,`VITO: «Allora io prendo ${SPX[rv].n}! È perfetto contro il tuo.»`,"VITO: «Prof, posso fare una sfida subito? Dai {N}, vediamo chi è più bravo!»"],()=>{trainerBattle({id:"rival1",trainer:{n:"RIVALE VITO",party:[[rv,5]],money:300,pre:[],lose:["VITO: «Cosa?! Ho scelto quello sbagliato…»"],win:["VITO: «Sì! Sono il più forte!»"],rival:1}},(won)=>{G.flags.rivaldone=1;healAll();say([won?"PROF. PARQUET: «Bella partita! Ora tieni anche questi.»":"PROF. PARQUET: «Non importa, si impara anche perdendo. Ecco, tieni questi.»","{N} ha ricevuto 5 Contratti e lo SCHEDARIO!","«Lo SCHEDARIO registra ogni giocatore che vedi e che metti sotto contratto. Riempilo tutto!»","VITO: «Io vado a Canestropoli! Ci vediamo, lumaca!»"],()=>{addItem("Contratto",5);G.flags.dex=1;NPCS.forEach(q=>{if(q.id==="rival")q.vis=false});save()})})})})};
const yesno=(q,cb)=>{say(q,()=>menu([["SÌ",()=>cb(true)],["NO",()=>cb(false)]],{small:1,onB:()=>cb(false)}))};
const talkTo=n=>{const fp={up:"down",down:"up",left:"right",right:"left"}[PL.dir];if(n.spr!=="none")n.dir=fp;
  if(n.trainer){if(G.flags["tr_"+n.id])return say(n.trainer.after||n.trainer.lose);return say(n.trainer.pre,()=>trainerBattle(n))}
  if(n.talk==="mom"){if(!G.flags.starter)return say(["MAMMA: «{N}! Il PROF. PARQUET ti cercava. Passa dal laboratorio, è quello grande col tetto grigio.»"]);healAll();SFX.heal();return say(["MAMMA: «Sei stanco? Riposati un attimo…»","La squadra è di nuovo in forma!"])}
  if(n.talk==="prof"){if(!G.flags.starter)return labIntro();const c=Object.keys(G.caught).length,s=Object.keys(G.seen).length;return say([`PROF. PARQUET: «Il tuo SCHEDARIO: ${s} visti, ${c} sotto contratto.»`,c<5?"«Vai nell erba alta del Percorso 1: indebolisci i giocatori e poi offri un contratto!»":"«Ottimo lavoro, continua così!»"])}
  if(n.talk==="rival")return say(["VITO: «Muoviti! Il prof ci aspetta!»"]);
  if(n.talk==="nurse")return say(["«Benvenuto al CENTRO CURA. Vuoi che rimettiamo in forma la tua squadra?»"],()=>menu([["SÌ",()=>{healAll();SFX.heal();G.flags.lastHeal=MK;say(["…","Ecco fatto! La tua squadra è in piena forma.","Torna quando vuoi!"])}],["NO",()=>say("Torna quando vuoi!")]],{small:1}));
  if(n.talk==="pc")return pcMenu();
  if(n.talk==="shop")return shopMenu();
  if(n.gift){if(G.flags["gift_"+n.id])return say(["Pescare è rilassante, vero?","Usa la canna davanti all acqua con il tasto A."]);return say(n.talk,()=>{G.flags["gift_"+n.id]=1;addItem(n.gift,1);SFX.item();say([`{N} ha ricevuto: ${n.gift}!`,"Usala davanti all acqua: dal lago escono giocatori che nell erba non ci sono."])})}
  say(n.talk)};
/* ---------- CENTRO: PC con il deposito ---------- */
const pcMenu=()=>{menu([["DEPOSITA UN GIOCATORE",()=>{if(G.party.length<=1)return say("Devi tenere almeno un giocatore in squadra!");menu(G.party.map((m,i)=>[`${SPX[m.sp].n} Lv${m.lv}`,()=>{G.box.push(G.party.splice(i,1)[0]);say(`${SPX[m.sp].n} è nel deposito.`)}]),{title:"DEPOSITA"})}],["RITIRA UN GIOCATORE",()=>{if(!G.box.length)return say("Il deposito è vuoto.");if(G.party.length>=6)return say("La squadra è piena (6).");menu(G.box.map((m,i)=>[`${SPX[m.sp].n} Lv${m.lv}`,()=>{G.party.push(G.box.splice(i,1)[0]);say(`${SPX[m.sp].n} torna in squadra.`)}]),{title:"RITIRA"})}],["ESCI",()=>{}]],{title:"PC DEL DEPOSITO"})};
/* ---------- SHOP ---------- */
const SHOP1=["Contratto","Borraccia","Sali minerali","Ghiaccio","Caffè","Stretching","Camomilla","Fischietto","Uscita d emergenza","Schema: Crossover","Schema: Euro step","Schema: Schiacciata","Schema: Assist","Schema: Tripla","Schema: Stoppata","Schema: Contropiede","Schema: Grinta"];
const shopMenu=()=>{say(["«Benvenuto allo SHOP! Cosa ti serve?»"],()=>menu([["COMPRA",()=>buyMenu()],["VENDI",()=>sellMenu()],["NIENTE",()=>say("Torna presto!")]],{small:1}))};
const buyMenu=()=>menu(SHOP1.map(k=>[`${k} · ${IT[k].pr}₵`,()=>{const P=IT[k].pr;const max=Math.max(0,Math.floor(G.money/P));if(!max)return say("Non hai abbastanza crediti!",()=>buyMenu());qtyMenu(k,max,q=>{G.money-=P*q;addItem(k,q);SFX.item();say(`Hai comprato ${q} × ${k}.`,()=>buyMenu())})}]),{title:`COMPRA · ${G.money}₵`,info:i=>IT[SHOP1[i]].d,onB:()=>say("Torna presto!")});
const sellMenu=()=>{const ks=Object.keys(G.bag).filter(k=>G.bag[k]>0&&IT[k]&&IT[k].pr>0);if(!ks.length)return say("Non hai niente da vendere.");menu(ks.map(k=>[`${k} ×${G.bag[k]} · ${Math.floor(IT[k].pr/2)}₵`,()=>qtyMenu(k,G.bag[k],q=>{G.bag[k]-=q;G.money+=Math.floor(IT[k].pr/2)*q;say(`Venduto! Hai ${G.money}₵.`)})]),{title:"VENDI"})};
const qtyMenu=(k,max,cb)=>{let q=1;const opts=[1,2,3,5,10,20,50,99].filter(v=>v<=max);if(!opts.length)opts.push(max);menu(opts.map(v=>[`× ${v}`,()=>cb(v)]),{title:k,small:1})};
/* ---------- LOTTE A TURNI ---------- */
let B=null;/* stato della lotta */
const STN={inj:"INF",par:"BLC",slp:"STA",cnf:"TLT"};
const mkSide=(mons,ai)=>({mons,cur:0,stg:{atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0},prot:0,ai});
const active=s=>s.mons[s.cur];
const stg=(v,s)=>v*(s>=0?(2+s)/2:2/(2-s));
const effStat=(side,k)=>{const m=active(side);let v=stat(m,k);v=stg(v,side.stg[k]);if(k==="spe"&&m.st==="par")v/=2;return v};
const wildBattle=enc=>{const tab=ENC[enc];if(!tab||!tab.list.length)return;let tot=tab.list.reduce((a,e)=>a+e[3],0),r=rnd()*tot,e=tab.list[0];for(const q of tab.list){r-=q[3];if(r<=0){e=q;break}}const m=mkMon(e[0],ri(e[1],e[2]));G.seen[m.sp]=1;startBattle({wild:m,mus:"battle"})};
const trainerBattle=(n,cb)=>{const tr=n.trainer;const party=(typeof tr.party==="string"?TRP[tr.party]:tr.party).map(([s,l])=>mkMon(s,l));party.forEach(m=>G.seen[m.sp]=1);startBattle({tr,party,npc:n,mus:tr.rival?"rival":"trainer",cb})};
const startBattle=o=>{lock=true;const foe=o.wild?[o.wild]:o.party;const first=G.party.findIndex(m=>m.hp>0);B={o,P:mkSide(G.party,false),F:mkSide(foe,true),phase:"intro",anim:0,log:[],msgs:[],shake:{p:0,f:0},flash:0,partic:new Set([first]),esc:0,ballAnim:null,turn:0};B.P.cur=first;
  playMus(o.mus);flashIn(()=>{const s=SPX[active(B.F).sp];B.phase="msg";bsay(o.wild?[`Un ${s.n} selvatico è apparso!`]:[`${o.tr.n} vuole sfidarti!`,`${o.tr.n} manda in campo ${s.n}!`],()=>{bsay([`Vai, ${SPX[active(B.P).sp].n}!`],()=>mainMenu())})})};
let FLASH=0;const flashIn=cb=>{FLASH=1;mode="battle";setTimeout(()=>{FLASH=0;cb()},700)};
const bsay=(lines,cb)=>say(lines,cb);
const mainMenu=()=>{B.phase="menu";menu([["LOTTA",()=>fightMenu()],["ZAINO",()=>bagMenu(true)],["SQUADRA",()=>partyMenu(true)],["FUGA",()=>runAway()]],{battle:1,grid:1,onB:()=>mainMenu()})};
const fightMenu=()=>{const m=active(B.P);menu(m.moves.map((x,i)=>[`${x.n}`,()=>{if(x.pp<=0)return bsay("Non ci sono più PP per questa mossa!",()=>fightMenu());doTurn({k:"move",i})}]),{battle:1,grid:1,moves:m,onB:()=>mainMenu()})};
const runAway=()=>{if(B.o.tr)return bsay("Non puoi scappare da una sfida ufficiale!",()=>mainMenu());B.esc++;const a=effStat(B.P,"spe"),b=effStat(B.F,"spe");const f=(a*128/Math.max(1,b)+30*B.esc)%256;if(a>=b||rnd()*256<f){bsay("Sei scappato!",()=>endBattle("run"))}else bsay("Non riesci a scappare!",()=>doTurn({k:"none"}))};
/* scelta dell IA: la mossa che fa più danno (con un po di fantasia) */
const aiPick=()=>{const m=active(B.F),P=active(B.P);let best=0,bv=-1;m.moves.forEach((x,i)=>{if(x.pp<=0)return;const mv=MV[x.n];let v=mv.c==="S"?(rnd()*40):mv.p*eff(mv.t,SPX[P.sp].t)*(SPX[m.sp].t.includes(mv.t)?1.5:1)*(mv.a?mv.a/100:1);v*=.85+rnd()*.3;if(v>bv){bv=v;best=i}});return{k:"move",i:best}};
const prio=a=>a.k!=="move"?6:(MV[a.mon.moves[a.i].n].e.includes("prio1")?1:0);
const doTurn=pa=>{B.phase="turn";MENU=null;const fa=aiPick();pa.side=B.P;fa.side=B.F;pa.mon=active(B.P);fa.mon=active(B.F);
  let order=[pa,fa];B.P.flinch=0;B.F.flinch=0;const pp=prio(pa),pf=prio(fa);if(pf>pp||(pf===pp&&(effStat(B.F,"spe")>effStat(B.P,"spe")||(effStat(B.F,"spe")===effStat(B.P,"spe")&&rnd()<.5))))order=[fa,pa];
  firstActor=order[0].side;const Q=[];order.forEach(a=>Q.push(n=>act(a,n)));Q.push(n=>endTurnFx(n));runQ(Q,()=>afterTurn())};
const runQ=(Q,done)=>{const step=()=>{if(!B)return;const f=Q.shift();if(!f)return done();f(step)};step()};
const sideOf=m=>B.P.mons.includes(m)?B.P:B.F;const other=s=>s===B.P?B.F:B.P;
const nm=(s)=>(s===B.F?(B.o.wild?"Il selvatico ":"L avversario "):"")+SPX[active(s).sp].n;
const act=(a,next)=>{if(a.k!=="move"){next();return}const S=a.side,O=other(S),m=active(S);if(!m||m.hp<=0||active(S)!==a.mon){next();return}const mvO=m.moves[a.i],mv=MV[mvO.n];
  const pre=[];if(m.st==="slp"){m.slp=(m.slp||ri(1,3))-1;if(m.slp<=0){m.st=null;return bsay(`${nm(S)} si è ripreso!`,()=>act(a,next))}return bsay(`${nm(S)} è STANCO e non riesce a giocare…`,next)}
  if(m.st==="par"&&rnd()<.25)return bsay(`${nm(S)} è BLOCCATO e non si muove!`,next);
  if(m.cnf){m.cnf--;if(m.cnf<=0){m.cnf=0;pre.push(`${nm(S)} non è più in tilt.`)}else if(rnd()<.33){const d=Math.max(1,Math.floor(((2*m.lv/5+2)*40*effStat(S,"atk")/effStat(S,"def"))/50+2));m.hp=Math.max(0,m.hp-d);B.shake[S===B.P?"p":"f"]=.4;SFX.hit(.6);return bsay([`${nm(S)} è IN TILT!`,"Si è fatto male da solo!"],()=>checkFaint(next))}}
  if(S.flinch){S.flinch=0;return bsay(`${nm(S)} perde il tempo e non riesce a giocare!`,next)}
  mvO.pp--;bsay(pre.concat([`${nm(S)} usa ${mv.n}!`]),()=>{
    if(O.prot&&mv.c!=="S"||(O.prot&&mv.e.startsWith("foe"))){return bsay(`${nm(O)} si protegge!`,next)}
    const acc=mv.a===0||mv.e.includes("never")?999:mv.a*stg(1,S.stg.acc)/stg(1,O.stg.eva);if(rnd()*100>=acc)return bsay(`${nm(S)} sbaglia!`,next);
    if(mv.c==="S")return statusMove(S,O,mv,next);
    const hits=mv.e.includes("multi2")?2:1;let total=0,msgs=[];const T=SPX[active(O).sp].t,ef=eff(mv.t,T);
    for(let h=0;h<hits;h++){const crit=rnd()<(mv.e.includes("crit")?1/8:1/24)*(1+S.stg.crit);const A=effStat(S,mv.c==="F"?"atk":"spa")*(m.st==="inj"&&mv.c==="F"?.5:1),D=effStat(O,mv.c==="F"?"def":"spd");let d=Math.floor(Math.floor(Math.floor(2*m.lv/5+2)*mv.p*A/Math.max(1,D))/50)+2;if(crit)d=Math.floor(d*1.5);if(SPX[m.sp].t.includes(mv.t))d=Math.floor(d*1.5);d=Math.floor(d*ef*(.85+rnd()*.15));if(ef>0)d=Math.max(1,d);const tg=active(O);tg.hp=Math.max(0,tg.hp-d);total+=d;if(crit)msgs.push("Colpo critico!");if(tg.hp<=0)break}
    B.shake[O===B.P?"p":"f"]=.5;SFX.hit(ef>1?1.3:ef<1?.6:1);if(hits>1)msgs.push(`Colpito ${hits} volte!`);if(ef>1)msgs.push("È superefficace!");else if(ef<1)msgs.push("Non è molto efficace…");
    const e=mv.e,tg=active(O);if(e.includes("recoil")){const k=e.includes("33")?3:4;m.hp=Math.max(0,m.hp-Math.max(1,Math.floor(total/k)));msgs.push(`${nm(S)} si è fatto male nel contrasto!`)}if(e.includes("drain50")){m.hp=Math.min(stat(m,"hp"),m.hp+Math.max(1,Math.floor(total/2)));msgs.push(`${nm(S)} recupera energie!`)}
    if(tg.hp>0){const ch=(t,p)=>e.includes(t)&&!tg.st&&rnd()<p/100;if(ch("inj",+((e.match(/inj(\d+)/)||[])[1]||0))){tg.st="inj";msgs.push(`${nm(O)} si è INFORTUNATO!`)}if(ch("par",+((e.match(/par(\d+)/)||[])[1]||0))){tg.st="par";msgs.push(`${nm(O)} è BLOCCATO!`)}const fl=+((e.match(/flinch(\d+)/)||[])[1]||0);if(fl&&rnd()<fl/100&&S===firstActor){O.flinch=1}
      if(e.startsWith("foe:")||e.includes(",foe:"))applyStages(O,e.split("foe:")[1],msgs,O);if(e.startsWith("self:"))applyStages(S,e.slice(5),msgs,S)}
    bsay(msgs,()=>checkFaint(next))})};
let firstActor=null;
const applyStages=(side,spec,msgs,who)=>{spec.split(",").forEach(p=>{const mm=p.match(/(atk|def|spa|spd|spe|acc|eva)([+-]\d)/);if(mm){const k=mm[1],v=+mm[2];const b=side.stg[k];side.stg[k]=cl(b+v,-6,6);const L={atk:"l attacco",def:"la difesa",spa:"il tiro",spd:"la lettura",spe:"la velocità",acc:"la precisione",eva:"l elusione"}[k];msgs.push(side.stg[k]===b?`${nm(who)}: ${L} non può cambiare di più!`:`${nm(who)}: ${L} ${v>0?(v>1?"sale molto":"sale"):(v<-1?"scende molto":"scende")}!`)}if(p==="crit"){side.stg.crit=Math.min(3,side.stg.crit+1);msgs.push(`${nm(who)} prende la mira!`)}})};
const statusMove=(S,O,mv,next)=>{const m=active(S),tg=active(O),e=mv.e,msgs=[];
  if(e==="heal50"){const H=stat(m,"hp");if(m.hp>=H)msgs.push("È già in piena forma!");else{m.hp=Math.min(H,m.hp+Math.floor(H/2));msgs.push(`${nm(S)} recupera energie!`);SFX.heal()}}
  else if(e==="protect"){S.prot=1;msgs.push(`${nm(S)} alza la MURAGLIA!`)}
  else if(e==="cnf"){if(tg.cnf)msgs.push("Non ha effetto…");else{tg.cnf=ri(2,4);msgs.push(`${nm(O)} va IN TILT!`)}}
  else if(e==="slp"){if(tg.st)msgs.push("Non ha effetto…");else{tg.st="slp";tg.slp=ri(1,3);msgs.push(`${nm(O)} è STANCO!`)}}
  else if(e==="par"){if(tg.st)msgs.push("Non ha effetto…");else{tg.st="par";msgs.push(`${nm(O)} è BLOCCATO!`)}}
  else if(e.startsWith("self:"))applyStages(S,e.slice(5),msgs,S);else if(e.startsWith("foe:"))applyStages(O,e.slice(4),msgs,O);
  bsay(msgs,next)};
const endTurnFx=next=>{const msgs=[];[B.P,B.F].forEach(s=>{s.prot=0;const m=active(s);if(m&&m.hp>0&&m.st==="inj"){const d=Math.max(1,Math.floor(stat(m,"hp")/8));m.hp=Math.max(0,m.hp-d);msgs.push(`${nm(s)} soffre per l infortunio!`)}});if(msgs.length)bsay(msgs,()=>checkFaint(next));else next()};
/* KO, esperienza, livelli, nuove mosse */
const checkFaint=next=>{const Q=[];[B.F,B.P].forEach(s=>{const m=active(s);if(m&&m.hp<=0&&!m._ko){m._ko=1;Q.push(n2=>{SFX.faint();B.fall=B.fall||{};B.fall[s===B.P?"p":"f"]=1;bsay(`${nm(s)} è KO!`,()=>{if(s===B.F)giveExp(m,n2);else n2()})})}});runQ(Q,next)};
const giveExp=(foe,next)=>{const s=SPX[foe.sp];const parts=[...B.partic].filter(i=>G.party[i]&&G.party[i].hp>0);if(!parts.length)return next();const xp=Math.max(1,Math.floor(s.bx*foe.lv/7*(B.o.tr?1.5:1)/parts.length));const Q=[];
  parts.forEach(i=>{const m=G.party[i];Q.push(n2=>{m.xp+=xp;Object.keys(s.bs).forEach(k=>{m.ev[k]=Math.min(252,m.ev[k]+(s.bs[k]>=100?2:1))});bsay(`${SPX[m.sp].n} guadagna ${xp} punti esperienza!`,()=>levelUps(m,n2))})});runQ(Q,next)};
const levelUps=(m,next)=>{if(m.lv>=100||m.xp<expAt(m.lv+1))return next();const oldH=stat(m,"hp");m.lv++;m.hp+=stat(m,"hp")-oldH;SFX.lvl();bsay(`${SPX[m.sp].n} sale al livello ${m.lv}!`,()=>{const nw=SPX[m.sp].learn.filter(q=>q[0]===m.lv).map(q=>q[1]);learnChain(m,nw,()=>levelUps(m,next))})};
const learnChain=(m,list,next)=>{if(!list.length)return next();const n=list.shift();if(m.moves.some(x=>x.n===n))return learnChain(m,list,next);if(m.moves.length<4){m.moves.push({n,pp:MV[n].pp});return bsay(`${SPX[m.sp].n} impara ${n}!`,()=>learnChain(m,list,next))}
  bsay([`${SPX[m.sp].n} vuole imparare ${n}…`,"…ma conosce già 4 mosse. Vuoi dimenticarne una?"],()=>menu(m.moves.map((x,i)=>[x.n,()=>{const old=x.n;m.moves[i]={n,pp:MV[n].pp};bsay(["1, 2 e… puff!",`${SPX[m.sp].n} dimentica ${old} e impara ${n}!`],()=>learnChain(m,list,next))}]).concat([["NON IMPARARE",()=>bsay(`${SPX[m.sp].n} non impara ${n}.`,()=>learnChain(m,list,next))]]),{title:"QUALE DIMENTICARE?",info:i=>{const x=m.moves[i];return x?moveInfo(x.n):moveInfo(n)}}))};
const moveInfo=n=>{const v=MV[n];return`${TY[v.t].n} · ${v.c==="F"?"FISICA":v.c==="T"?"TIRO":"STATO"}${v.p?" · POT "+v.p:""}${v.a?" · PREC "+v.a:""} · PP ${v.pp} — ${v.d}`};
const afterTurn=()=>{if(!B)return;firstActor=null;const fo=active(B.F);if(fo.hp<=0){const nx=B.F.mons.findIndex(m=>m.hp>0);if(nx<0)return winBattle();B.F.cur=nx;B.F.stg={atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0};B.fall&&(B.fall.f=0);G.seen[active(B.F).sp]=1;return bsay(`${B.o.tr.n} manda in campo ${SPX[active(B.F).sp].n}!`,()=>afterTurn())}
  const me=active(B.P);if(me.hp<=0){if(!G.party.some(m=>m.hp>0))return loseBattle();return partyMenu(true,true)}mainMenu()};
const winBattle=()=>{if(B.o.wild)return endBattle("win");const tr=B.o.tr;G.money+=tr.money;playMus("win");bsay([`Hai battuto ${tr.n}!`].concat(tr.lose||[]).concat([`Hai vinto ${tr.money}₵!`]),()=>{if(B.o.npc&&B.o.npc.id)G.flags["tr_"+B.o.npc.id]=1;endBattle("win")})};
const loseBattle=()=>{const lost=Math.floor(G.money/2);G.money-=lost;bsay(["Non hai più giocatori in grado di giocare…",`Hai perso ${lost}₵…`,"…e torni di corsa a farti curare."],()=>{const cb=B&&B.o.cb;B=null;mode="world";MENU=null;healAll();if(cb){lock=false;cb(false);return}const back=G.flags.lastHeal==="canestro"?["centro",4,6]:["casa1",4,4];fade(()=>{loadMap(back[0],back[1],back[2],"up");lock=false})})};
const endBattle=res=>{const cb=B.o.cb;G.party.forEach(m=>{delete m._ko;delete m.cnf});B=null;MENU=null;mode="world";lock=false;playMus(M.mus);save();if(cb)cb(res==="win")};
/* contratto: probabilità classica (salute bassa e stati aiutano) */
const throwBall=k=>{const tg=active(B.F),s=SPX[tg.sp],H=stat(tg,"hp");const it=IT[k];let bb=typeof it.ball==="number"?it.ball:it.ball==="rk"?(tg.lv<=15?3:1):(tg.hp<H/3?2.5:1);const stB=tg.st==="slp"?2.5:tg.st?1.5:1;const a=Math.min(255,((3*H-2*tg.hp)*s.rate*bb)/(3*H)*stB);
  const shakes=a>=255?4:(()=>{const b=1048560/Math.sqrt(Math.sqrt(16711680/a));let n=0;for(let i=0;i<4;i++)if(rnd()*65536<b)n++;else break;return n})();
  G.bag[k]--;B.ball={t:0,shakes:Math.min(3,shakes),ok:shakes>=4};SFX.sel();bsay(`{N} offre un ${k} a ${s.n}!`,()=>{let i=0;const sh=()=>{if(i<Math.min(3,shakes)){SFX.shake();i++;setTimeout(sh,520);return}if(shakes>=4){SFX.catch();B.caught=1;G.caught[tg.sp]=1;const nm2=s.n;bsay([`Fatto! ${nm2} ha firmato il contratto!`,`${nm2} è registrato nello SCHEDARIO.`],()=>{tg.ot=G.name;tg._ko=0;tg.st=tg.st;if(G.party.length<6){G.party.push(tg);endBattle("win")}else{G.box.push(tg);bsay(`${nm2} va nel deposito del PC.`,()=>endBattle("win"))}})}else{B.ball=null;bsay(["Oh no! Non ha firmato!","Ci è mancato pochissimo!","Ha strappato il contratto!"][Math.min(2,shakes)],()=>doTurn({k:"none"}))}};setTimeout(sh,400)})};
/* ---------- MENU: squadra, zaino, schedario, coach, opzioni ---------- */
const startMenu=()=>{if(lock||TB||MENU)return;SFX.sel();menu([["SQUADRA",()=>partyMenu(false)],...(G.flags.dex?[["SCHEDARIO",()=>dexMenu()]]:[]),["ZAINO",()=>bagMenu(false)],[G.name.toUpperCase(),()=>cardMenu()],["OPZIONI",()=>optMenu()],["ESCI DAL GIOCO",()=>{save();PD.close()}],["CHIUDI",()=>{}]],{title:"MENU",side:1})};
const partyMenu=(inB,forced)=>{if(!G.party.length)return say("Non hai ancora giocatori.");menu(G.party.map((m,i)=>[`${SPX[m.sp].n}`,()=>{const opts=[];if(inB){opts.push(["IN CAMPO",()=>{if(m.hp<=0)return bsay(`${SPX[m.sp].n} è KO!`,()=>partyMenu(inB,forced));if(i===B.P.cur)return bsay(`${SPX[m.sp].n} è già in campo!`,()=>partyMenu(inB,forced));const old=active(B.P);B.P.cur=i;B.P.stg={atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0};B.partic.add(i);B.fall&&(B.fall.p=0);if(forced)bsay(`Vai, ${SPX[m.sp].n}!`,()=>mainMenu());else bsay([`Torna qui, ${SPX[old.sp].n}!`,`Vai, ${SPX[m.sp].n}!`],()=>doTurn({k:"switch"}))}])}
      opts.push(["SCHEDA",()=>{SUMM={m,i};menu([["CHIUDI",()=>{SUMM=null;partyMenu(inB,forced)}]],{small:1,onB:()=>{SUMM=null;partyMenu(inB,forced)}})}]);if(!inB)opts.push(["SPOSTA",()=>menu(G.party.map((q,j)=>[SPX[q.sp].n,()=>{const t=G.party[i];G.party[i]=G.party[j];G.party[j]=t;partyMenu(false)}]),{title:"SCAMBIA CON…"})]);if(!inB)opts.push(["MOSSE",()=>moveOrder(m,inB)]);opts.push(["INDIETRO",()=>partyMenu(inB,forced)]);menu(opts,{small:1,onB:()=>partyMenu(inB,forced)})}]),{title:forced?"CHI MANDI IN CAMPO?":"SQUADRA",party:1,onB:forced?()=>partyMenu(inB,forced):inB?()=>mainMenu():()=>startMenu()})};
const moveOrder=(m)=>menu(m.moves.map((x,i)=>[`${x.n}  ${x.pp}/${MV[x.n].pp}`,()=>{}]).concat([["INDIETRO",()=>partyMenu(false)]]),{title:SPX[m.sp].n+" · MOSSE",info:i=>m.moves[i]?moveInfo(m.moves[i].n):""});
let SUMM=null;
let bagPocket=0;const bagMenu=inB=>{const pk=POCK[bagPocket];const ks=Object.keys(G.bag).filter(k=>G.bag[k]>0&&IT[k]&&IT[k].p===pk[0]);
  menu([["◀ "+pk[1]+" ▶",()=>{bagPocket=(bagPocket+1)%POCK.length;bagMenu(inB)}]].concat(ks.map(k=>[`${k}  ×${G.bag[k]}`,()=>useItem(k,inB)])),{title:"ZAINO",info:i=>i===0?"Tocca per cambiare tasca":IT[ks[i-1]].d,onB:inB?()=>mainMenu():()=>startMenu(),left:()=>{bagPocket=(bagPocket+POCK.length-1)%POCK.length;bagMenu(inB)},right:()=>{bagPocket=(bagPocket+1)%POCK.length;bagMenu(inB)}})};
const useItem=(k,inB)=>{const it=IT[k];
  if(it.ball){if(!inB)return say("Si usa solo davanti a un giocatore selvatico.");if(B.o.tr)return bsay("Non puoi mettere sotto contratto un giocatore di un altro allenatore!",()=>mainMenu());MENU=null;return throwBall(k)}
  if(it.key){if(it.key==="rod"){if(inB)return bsay("Non adesso!",()=>bagMenu(true));const[dx,dy]=DIRV[PL.dir];if(tileAt(PL.x+dx,PL.y+dy)==="~"){MENU=null;return fish()}return say("Mettiti davanti all acqua per pescare.")}if(it.key==="bike")return say("La bici arriverà nella prossima tappa!");return say(it.d)}
  if(it.rep){if(inB)return bsay("Non adesso!",()=>bagMenu(true));G.rep=it.rep;G.bag[k]--;return say("Fischi forte: per un po i giocatori selvatici stanno alla larga.")}
  if(it.esc)return say("Qui non serve.");
  if(it.mv)return teach(k,inB);
  menu(G.party.map((m,i)=>[`${SPX[m.sp].n}  ${m.hp}/${stat(m,"hp")}`,()=>{const H=stat(m,"hp");let ok=false,msg="";
    if(it.heal){if(m.hp<=0||m.hp>=H)msg="Non avrebbe effetto.";else{const a=Math.min(H-m.hp,it.heal);m.hp+=a;ok=true;msg=`${SPX[m.sp].n} recupera ${a} punti vita.`}}
    else if(it.cure){if(m.hp>0&&((it.cure==="all"&&(m.st||m.cnf))||m.st===it.cure||(it.cure==="cnf"&&m.cnf))){if(it.cure==="cnf"||it.cure==="all")m.cnf=0;m.st=null;ok=true;msg=`${SPX[m.sp].n} sta di nuovo bene.`}else msg="Non avrebbe effetto."}
    else if(it.rev){if(m.hp>0)msg="Non avrebbe effetto.";else{m.hp=Math.floor(H*it.rev);delete m._ko;ok=true;msg=`${SPX[m.sp].n} torna in forma!`}}
    else if(it.pp){const x=m.moves.find(q=>q.pp<MV[q.n].pp);if(!x)msg="Non avrebbe effetto.";else{x.pp=Math.min(MV[x.n].pp,x.pp+it.pp);ok=true;msg=`PP di ${x.n} ricaricati.`}}
    else if(it.ev){m.ev[it.ev]=Math.min(252,m.ev[it.ev]+10);ok=true;msg=`${SPX[m.sp].n} si è allenato!`}
    else if(it.up){if(m.lv>=100)msg="È già al massimo!";else{G.bag[k]--;m.xp=expAt(m.lv+1);MENU=null;return levelUps(m,()=>{if(inB)doTurn({k:"item"});})}}
    else msg="Non si può usare adesso.";
    if(ok){G.bag[k]--;SFX.heal()}MENU=null;if(inB){if(ok)bsay(msg,()=>doTurn({k:"item"}));else bsay(msg,()=>bagMenu(true))}else say(msg)}]),{title:"SU CHI?",party:1,onB:()=>bagMenu(inB)})};
/* SCHEMI: insegnano mosse, solo ai ruoli giusti */
const teach=(k,inB)=>{if(inB)return bsay("Gli schemi si studiano fuori dalla partita.",()=>bagMenu(true));const mv=MV[IT[k].mv];menu(G.party.map(m=>{const s=SPX[m.sp];const ok=!mv.r||mv.r.includes(s.role)||s.t.includes(mv.t);return[`${s.n}  ${ok?"PUÒ":"NO"}`,()=>{if(!ok)return say(`${s.n} non è il tipo di giocatore giusto per «${mv.n}».`);if(m.moves.some(x=>x.n===mv.n))return say(`${s.n} conosce già «${mv.n}».`);MENU=null;learnChain(m,[mv.n],()=>{})}]}),{title:"INSEGNA "+mv.n.toUpperCase(),party:1,info:()=>moveInfo(mv.n),onB:()=>bagMenu(false)})};
let DEXSEL=null;const dexMenu=()=>{const L=SP.slice().sort((a,b)=>a.dex-b.dex);menu(L.map(s=>[`${String(s.dex).padStart(3,"0")} ${G.seen[s.n]?s.n:"????????"} ${G.caught[s.n]?"●":G.seen[s.n]?"○":""}`,()=>{if(!G.seen[s.n])return;DEXSEL=s;menu([["CHIUDI",()=>{DEXSEL=null;dexMenu()}]],{small:1,onB:()=>{DEXSEL=null;dexMenu()}})}]),{title:`SCHEDARIO · visti ${Object.keys(G.seen).length} · presi ${Object.keys(G.caught).length}`,onB:()=>startMenu(),dex:1})};
const cardMenu=()=>{CARD=1;menu([["CHIUDI",()=>{CARD=0;startMenu()}]],{small:1,onB:()=>{CARD=0;startMenu()}})};let CARD=0;
const optMenu=()=>menu([[`MUSICA: ${AU.on?"SÌ":"NO"}`,()=>{AU.on=!AU.on;if(!AU.on)stopMus();else{AU.cur=null;playMus(M?M.mus:"title")}optMenu()}],[`TESTO: ${["LENTO","NORMALE","VELOCE"][G.opts.text]}`,()=>{G.opts.text=(G.opts.text+1)%3;optMenu()}],["INDIETRO",()=>startMenu()]],{title:"OPZIONI"});
/* ---------- DISEGNO ---------- */
const OBJDRAW=(x,o,X,Y)=>{const P=(c,a,b,w,h)=>{x.fillStyle=c;x.fillRect(X+a,Y+b,w,h)};
  if(o.k==="stairs"){for(let i=0;i<4;i++){P(shade("#a16207",-i*.08),0,i*4,16,4);P("#713f12",0,i*4+3,16,1)}}
  else if(o.k==="table"){P("#7c4a24",1,4,30,10);P("#a16207",2,2,28,10);P("#ca8a04",3,3,26,2);P("#5a341a",3,14,3,10);P("#5a341a",26,14,3,10)}
  else if(o.k==="tv"){P("#1f2937",1,2,14,10);P("#38bdf8",2,3,12,8);P("#e0f2fe",3,4,4,2);P("#374151",4,12,8,3)}
  else if(o.k==="shelf"){P("#7c4a24",0,-6,16,22);P("#a16207",1,-5,14,20);[0,7].forEach(j=>{P("#5a341a",1,j,14,1);["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7"].forEach((c,k)=>P(c,2+k*3,j-5,2,5))})}
  else if(o.k==="plant"){P("#9a3412",4,9,8,7);P("#c2410c",5,9,6,2);x.fillStyle="#15803d";x.beginPath();x.arc(X+8,Y+6,6,0,7);x.fill();x.fillStyle="#22c55e";x.beginPath();x.arc(X+7,Y+5,3,0,7);x.fill()}
  else if(o.k==="bed"){P("#7c4a24",0,0,16,32);P("#f8fafc",1,1,14,8);P("#2563eb",1,9,14,22);P("#3b82f6",2,10,12,3)}
  else if(o.k==="pc"){P("#475569",1,2,14,12);P("#0ea5e9",2,3,12,8);P("#94a3b8",5,14,6,2);P("#e0f2fe",3,4,3,2)}
  else if(o.k==="console"){P("#111827",2,8,12,6);P("#ef4444",4,10,2,2);P("#22c55e",10,10,2,2)}
  else if(o.k==="desk3"){P("#64748b",0,4,48,10);P("#94a3b8",1,2,46,10);[8,24,40].forEach(c=>{P("#7c2d12",c-5,0,10,7);P("#fbbf24",c-4,1,8,1);P("#fde68a",c-1,3,2,2)})}
  else if(o.k==="counter"){const w=(o.w||1)*16;P("#b91c1c",0,4,w,12);P("#fecaca",0,2,w,4);P("#7f1d1d",0,15,w,1)}
  else if(o.k==="bench"){P("#78350f",0,6,16,4);P("#451a03",1,10,2,5);P("#451a03",13,10,2,5)}};
const drawWorld=(dt)=>{const W_=M.rows[0].length,H_=M.rows.length;const camX=Math.round((PL.px*TS+8)-VW/2),camY=Math.round((PL.py*TS+8)-VH/2);
  cx.fillStyle=M.inside?"#111":"#2f6d2f";cx.fillRect(0,0,VW,VH);
  const x0=Math.floor(camX/TS)-1,y0=Math.floor(camY/TS)-1;for(let y=y0;y<=y0+VH/TS+2;y++)for(let x=x0;x<=x0+VW/TS+2;x++){let t=tileAt(x,y);if(t==null){if(M.inside)continue;t="T"}const T=TILE[t]||TILE["."];cx.drawImage(T,x*TS-camX,y*TS-camY)}
  (M.objs||[]).forEach(o=>OBJDRAW(cx,o,o.x*TS-camX,o.y*TS-camY));
  (M.items||[]).forEach(it=>{if(G.items[it.id])return;const X=it.x*TS-camX,Y=it.y*TS-camY;cx.fillStyle="#7c2d12";cx.fillRect(X+3,Y+6,10,8);cx.fillStyle="#b45309";cx.fillRect(X+4,Y+7,8,6);cx.fillStyle="#fde68a";cx.fillRect(X+7,Y+4,2,3);cx.fillRect(X+5,Y+9,6,1)});
  const ents=[];(M.blds||[]).forEach(b=>ents.push({y:b.y+b.h-1,d:()=>drawBld(cx,b,b.x*TS-camX,b.y*TS-camY)}));
  NPCS.forEach(n=>{if(!n.vis||n.spr==="none")return;ents.push({y:n.py,d:()=>{const sp=sprFor(n.spr),r=["down","left","right","up"].indexOf(n.dir),f=n.mv?Math.floor((n.wt||0)*4)%4:0;cx.drawImage(sp,f*16,r*20,16,20,Math.round(n.px*TS-camX),Math.round(n.py*TS-camY-6),16,20);if(n.alert){cx.fillStyle="#fff";cx.fillRect(Math.round(n.px*TS-camX)+4,Math.round(n.py*TS-camY)-20,8,10);cx.fillStyle="#dc2626";cx.fillRect(Math.round(n.px*TS-camX)+7,Math.round(n.py*TS-camY)-18,2,5);cx.fillRect(Math.round(n.px*TS-camX)+7,Math.round(n.py*TS-camY)-12,2,2)}}})});
  ents.push({y:PL.py,d:()=>{const sp=sprFor("hero"),r=["down","left","right","up"].indexOf(PL.dir);const f=PL.mv?(Math.floor(PL.wt*4)%4):0;const jy=PL.jump?-Math.sin(Math.min(1,PL.prog||0)*Math.PI)*8:0;cx.drawImage(sp,f*16,r*20,16,20,Math.round(PL.px*TS-camX),Math.round(PL.py*TS-camY-6+jy),16,20);
    if(tileAt(Math.round(PL.px),Math.round(PL.py))==='"'&&!PL.mv){cx.drawImage(TILE['"'],0,8,16,8,Math.round(PL.px*TS-camX),Math.round(PL.py*TS-camY)+8,16,8)}}});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
  if(ban.t>0){ban.t-=dt;const a=Math.min(1,ban.t*2);cx.globalAlpha=a;cx.fillStyle="#f8fafc";cx.fillRect(4,4,110,16);cx.fillStyle="#334155";cx.fillRect(4,4,110,2);cx.fillRect(4,18,110,2);cx.globalAlpha=1}};
const drawBattle=(dt)=>{const P=active(B.P),F=active(B.F);B.anim+=dt;
  /* sfondo: campetto */const g=cx.createLinearGradient(0,0,0,VH);g.addColorStop(0,"#bfe7ff");g.addColorStop(.55,"#e6f6ff");g.addColorStop(.56,"#d9a868");g.addColorStop(1,"#c08a4f");cx.fillStyle=g;cx.fillRect(0,0,VW,VH);
  cx.fillStyle="rgba(255,255,255,.35)";for(let i=0;i<VW;i+=12)cx.fillRect(i,92,1,68);cx.fillStyle="#b97a3c";cx.beginPath();cx.ellipse(176,74,46,10,0,0,7);cx.fill();cx.fillStyle="#c98d4d";cx.beginPath();cx.ellipse(66,124,54,10,0,0,7);cx.fill();cx.strokeStyle="rgba(255,255,255,.7)";cx.lineWidth=1;cx.beginPath();cx.ellipse(176,74,30,6,0,0,7);cx.stroke();
  const sf=B.shake.f>0?Math.sin(B.anim*60)*3:0,sp=B.shake.p>0?Math.sin(B.anim*60)*3:0;B.shake.f=Math.max(0,B.shake.f-dt);B.shake.p=Math.max(0,B.shake.p-dt);
  const slide=Math.min(1,B.anim*2);
  if(F&&!(B.fall&&B.fall.f)&&!B.caught){const im=drawPlayer(SPX[F.sp],false,F.shiny);if(B.ball)cx.globalAlpha=B.ball.ok?0:.15;cx.drawImage(im,Math.round(148+sf+(1-slide)*-120),18,56,56);cx.globalAlpha=1}
  if(B.ball&&!B.caught){cx.fillStyle="#7c2d12";cx.fillRect(170,62,12,9);cx.fillStyle="#fde68a";cx.fillRect(174,59,4,3);cx.fillStyle="#fff";cx.fillRect(172,65,8,1)}
  if(P&&!(B.fall&&B.fall.p)){const im=drawPlayer(SPX[P.sp],true,P.shiny);cx.drawImage(im,Math.round(30+sp+(1-slide)*120),56,72,72)}
  const box=(X,Y,m,mine)=>{if(!m)return;const s=SPX[m.sp],H=stat(m,"hp");cx.fillStyle="#f8fafc";cx.fillRect(X,Y,100,mine?30:24);cx.fillStyle="#334155";cx.fillRect(X,Y,100,1);cx.fillRect(X,Y+(mine?29:23),100,1);cx.fillRect(X,Y,1,mine?30:24);cx.fillRect(X+99,Y,1,mine?30:24);
    const f=m.hp/H;cx.fillStyle="#1f2937";cx.fillRect(X+30,Y+12,64,5);cx.fillStyle=f>.5?"#22c55e":f>.2?"#eab308":"#ef4444";cx.fillRect(X+31,Y+13,Math.round(62*f),3);if(mine){const L=m.lv,x0=expAt(L),x1=expAt(L+1);cx.fillStyle="#1e3a8a";cx.fillRect(X+30,Y+25,64,2);cx.fillStyle="#38bdf8";cx.fillRect(X+30,Y+25,Math.round(64*cl((m.xp-x0)/Math.max(1,x1-x0),0,1)),2)}};
  box(8,10,F,false);box(132,82,P,true)};
/* testo nitido sopra la grafica pixel */
const U=v=>v*SC;
const APO=s=>String(s).replace(/\b(l|L|dell|Dell|nell|Nell|all|All|dall|Dall|sull|Sull|c|C|quest|Quest|un|Un)\s(?=[aeiouàèéìòùAEIOUH])/g,(m,w)=>/^un$/i.test(w)?m:w+"’");
const uiText=(s,X,Y,size,col,al)=>{s=APO(s);ux.fillStyle=col||"#111827";ux.font=`700 ${U(size||8)}px "Trebuchet MS",Verdana,sans-serif`;ux.textAlign=al||"left";ux.textBaseline="top";ux.fillText(s,U(X),U(Y))};
const uiBox=(X,Y,w,h,fill)=>{ux.fillStyle="#334155";ux.fillRect(U(X),U(Y),U(w),U(h));ux.fillStyle=fill||"#f8fafc";ux.fillRect(U(X+1.5),U(Y+1.5),U(w-3),U(h-3));ux.fillStyle="#cbd5e1";ux.fillRect(U(X+1.5),U(Y+h-3),U(w-3),U(1.5))};
const drawUI=()=>{ux.clearRect(0,0,ui.width,ui.height);if(mode==="battle"&&B){const P=active(B.P),F=active(B.F);const lab=(X,Y,m,mine)=>{if(!m)return;const s=SPX[m.sp];uiText(s.n.length>15?s.short:s.n,X+3,Y+2,7);uiText("Lv"+m.lv,X+97,Y+2,7,"#111827","right");uiText("PV",X+20,Y+11,5,"#b45309");if(m.st)uiText(STN[m.st],X+3,Y+11,6,"#dc2626");if(mine)uiText(`${m.hp}/${stat(m,"hp")}`,X+95,Y+17,6,"#111827","right");if(G.caught[m.sp]&&!mine)uiText("●",X+90,Y+11,6,"#dc2626")};lab(8,10,F,false);lab(132,82,P,true)}
  if(mode==="world"&&ban.t>0)uiText(ban.s,59,7,7,"#111827","center");
  if(TB){TB.n=Math.min(TB.s.length,TB.n+[.6,1.2,3][G?G.opts.text:1]);uiBox(2,118,236,40);const words=TB.s.slice(0,Math.floor(TB.n));wrap(words,8,124,226,8,"#111827");if(TB.n>=TB.s.length&&Math.floor(performance.now()/300)%2)uiText("▼",228,148,7,"#dc2626")}
  if(MENU)drawMenu();
  if(SUMM)drawSumm();if(DEXSEL)drawDex();if(CARD)drawCard()};
const wrap=(s,X,Y,w,size,col)=>{s=APO(s);ux.font=`700 ${U(size)}px "Trebuchet MS",Verdana,sans-serif`;const lines=[];s.split("\n").forEach(p=>{let l="";p.split(" ").forEach(wd=>{const t=l?l+" "+wd:wd;if(ux.measureText(t).width>U(w)){lines.push(l);l=wd}else l=t});lines.push(l)});lines.slice(0,3).forEach((l,i)=>uiText(l,X,Y+i*(size+3),size,col))};
let menuRects=[];const drawMenu=()=>{const m=MENU;menuRects=[];
  if(m.battle&&m.grid){const moves=m.moves;uiBox(moves?2:120,118,moves?236:118,40);m.items.forEach((it,i)=>{const X=(moves?10:128)+(i%2)*(moves?112:56),Y=126+Math.floor(i/2)*14;if(i===m.i)uiText("▶",X-7,Y,8,"#dc2626");let lab=it[0];uiText(lab,X+1,Y,moves?7:8,moves&&moves.moves[i]&&moves.moves[i].pp<=0?"#9ca3af":"#111827");if(moves&&moves.moves[i]){const mv=MV[moves.moves[i].n];ux.fillStyle=TY[mv.t].c;ux.fillRect(U(X+70),U(Y+1),U(28),U(7));uiText(TY[mv.t].n.slice(0,4),X+84,Y+1.5,5,"#fff","center");uiText(`${moves.moves[i].pp}/${mv.pp}`,X+102,Y+1,6,"#334155")}menuRects.push([X-8,Y-2,moves?110:54,13,i])});return}
  const n=m.items.length,vis=Math.min(n,m.party?6:9),top=Math.max(0,Math.min(m.i-Math.floor(vis/2),n-vis));const w=m.small?70:m.party?170:m.side?92:200,X=m.small?166:m.side?146:(VW-w)/2,lh=m.party?16:12,h=vis*lh+(m.title?16:8),Y=m.small?Math.max(4,116-h):m.side?4:Math.max(2,(m.info?92:150)-h);
  uiBox(X,Y,w,h);if(m.title)uiText(m.title,X+6,Y+4,6.5,"#1d4ed8");for(let k=0;k<vis;k++){const i=top+k,it=m.items[i];const yy=Y+(m.title?15:6)+k*lh;if(i===m.i)uiText("▶",X+5,yy+(m.party?3:0),8,"#dc2626");
    if(m.party&&G.party[i]&&it[0]!=="INDIETRO"){const mm=G.party[i]||{},s=SPX[mm.sp];if(s){ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false,mm.shiny),U(X+12),U(yy-2),U(16),U(16));uiText(s.n.length>14?s.short:s.n,X+30,yy,6.5);uiText("Lv"+mm.lv,X+30,yy+8,5.5,"#475569");const H=stat(mm,"hp"),f=mm.hp/H;ux.fillStyle="#1f2937";ux.fillRect(U(X+100),U(yy+3),U(50),U(4));ux.fillStyle=f>.5?"#22c55e":f>.2?"#eab308":"#ef4444";ux.fillRect(U(X+100.5),U(yy+3.5),U(49*f),U(3));uiText(`${mm.hp}/${H}`,X+150,yy+8,5.5,"#334155","right");if(mm.st)uiText(STN[mm.st],X+100,yy+8,5.5,"#dc2626")}}
    else uiText(it[0],X+14,yy,m.small?7:7,"#111827");menuRects.push([X,yy-2,w,lh,i])}
  if(n>vis){if(top>0)uiText("▲",X+w-10,Y+3,6,"#475569");if(top+vis<n)uiText("▼",X+w-10,Y+h-9,6,"#475569")}
  if(m.info){const t=m.info(m.i);if(t){uiBox(2,118,236,40);wrap(t,8,123,226,7,"#111827")}}
  if(m.preview){const s=SPX[m.preview(m.i)];if(s){uiBox(8,8,64,72,"#e0f2fe");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false),U(12),U(12),U(56),U(56));uiText(s.t.map(t=>TY[t].n).join("/"),40,70,5.5,"#334155","center")}}};
const drawSumm=()=>{const{m}=SUMM,s=SPX[m.sp];uiBox(4,4,232,112,"#f1f5f9");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false,m.shiny),U(8),U(10),U(64),U(64));uiText(s.n,76,8,8);uiText(`Lv ${m.lv} · ${s.t.map(t=>TY[t].n).join("/")} · ${NAT[m.nat||0][0]}`,76,19,6,"#475569");
  const L=[["PV",`${m.hp}/${stat(m,"hp")}`],["ATTACCO",stat(m,"atk")],["DIFESA",stat(m,"def")],["TIRO",stat(m,"spa")],["LETTURA",stat(m,"spd")],["VELOCITÀ",stat(m,"spe")]];L.forEach(([a,b],i)=>{uiText(a,76+(i%2)*80,30+Math.floor(i/2)*10,6,"#334155");uiText(String(b),146+(i%2)*80,30+Math.floor(i/2)*10,6,"#111827","right")});
  uiText(`Exp ${m.xp} · prossimo livello ${expAt(m.lv+1)}`,76,62,5.5,"#475569");m.moves.forEach((x,i)=>{const mv=MV[x.n];ux.fillStyle=TY[mv.t].c;ux.fillRect(U(10+(i%2)*114),U(78+Math.floor(i/2)*16),U(108),U(13));uiText(`${x.n}  ${x.pp}/${mv.pp}`,14+(i%2)*114,80+Math.floor(i/2)*16,6.5,"#fff")})};
const drawDex=()=>{const s=DEXSEL;uiBox(4,4,232,112,"#fef3c7");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false),U(10),U(10),U(70),U(70));uiText(`#${String(s.dex).padStart(3,"0")} ${s.n}`,86,10,8);uiText(s.t.map(t=>TY[t].n).join(" / ")+` · ruolo ${({G:"guardia",F:"ala",C:"centro"})[s.role]}`,86,22,6,"#92400e");
  const b=s.bs;[["PV",b.hp],["ATT",b.atk],["DIF",b.def],["TIR",b.spa],["LET",b.spd],["VEL",b.spe]].forEach(([k,v],i)=>{uiText(k,86,34+i*9,6,"#334155");ux.fillStyle="#e5e7eb";ux.fillRect(U(104),U(35+i*9),U(100),U(5));ux.fillStyle="#f59e0b";ux.fillRect(U(104),U(35+i*9),U(Math.min(100,v/1.7)),U(5));uiText(String(v),210,34+i*9,6,"#111827")});
  uiText(G.caught[s.n]?"Sotto contratto ●":"Solo visto ○",10,86,6,G.caught[s.n]?"#16a34a":"#475569");uiText(`Squadra: ${s.team?s.team:s.nba||"—"} · maglia #${s.num}`,10,96,6,"#334155")};
const drawCard=()=>{uiBox(10,10,220,100,"#fde68a");uiText("TESSERA ALLENATORE",20,16,8,"#92400e");ux.imageSmoothingEnabled=false;ux.drawImage(sprFor("hero"),0,0,16,20,U(178),U(30),U(40),U(50));const t=G.time|0;uiText(`NOME: ${G.name}`,20,32,7);uiText(`SQUADRA: ${TEAM().nick.toUpperCase()}`,20,44,7);uiText(`CREDITI: ${G.money}₵`,20,56,7);uiText(`SCHEDARIO: ${Object.keys(G.caught).length}`,20,68,7);uiText(`TEMPO: ${Math.floor(t/3600)}h ${String(Math.floor(t/60)%60).padStart(2,"0")}m`,20,80,7);uiText(`MEDAGLIE: ${G.badges.length}/8`,20,92,7)};
/* ---------- CICLO PRINCIPALE ---------- */
let INTRO=null;/* schermate iniziali */
const update=dt=>{if(G)G.time+=dt;
  if(FADE){FADE.t+=dt;if(FADE.t>=.18&&!FADE.done){FADE.done=1;FADE.cb()}if(FADE.t>=.36)FADE=null}
  if(TB){if(takeP("a")||takeP("b"))textA();return}
  if(MENU){const m=MENU;const n=m.items.length,cols=m.grid?2:1;if(takeP("u")){m.i=(m.i-cols+n)%n;SFX.sel()}if(takeP("d")){m.i=(m.i+cols)%n;SFX.sel()}if(takeP("l")){if(m.left){const f=m.left;MENU=null;f()}else if(cols>1){m.i=(m.i+n-1)%n;SFX.sel()}}if(takeP("r")){if(m.right){const f=m.right;MENU=null;f()}else if(cols>1){m.i=(m.i+1)%n;SFX.sel()}}
    if(takeP("a")){SFX.sel();const it=m.items[m.i];MENU=null;it&&it[1]()}else if(takeP("b")&&m.onB){SFX.sel();const f=m.onB;MENU=null;f()}takeP("st");return}
  if(mode==="title"){if(takeP("a")||takeP("st"))titleGo();return}if(mode==="intro"){takeP("a");takeP("b");takeP("st");return}
  if(mode!=="world"||lock||FADE)return;
  if(takeP("st")){startMenu();return}if(takeP("a")&&!PL.mv){interact();return}takeP("b");
  NPCS.forEach(n=>{if(n.mv){n.wt=(n.wt||0)+dt*2;const k=Math.min(1,n.wt*1.6);n.px+=(n.x-n.px)*Math.min(1,dt*10);n.py+=(n.y-n.py)*Math.min(1,dt*10);if(Math.abs(n.px-n.x)<.02&&Math.abs(n.py-n.y)<.02){n.px=n.x;n.py=n.y;n.mv=0;n.wt=0}}else if(!lock){n.t-=dt;if(n.t<=0){n.t=1.5+rnd()*2.5;if(n.move==="turn")n.dir=pick(["down","left","right","up"]);else if(n.move==="wander"){const d=pick(["down","left","right","up"]),[dx,dy]=DIRV[d];n.dir=d;const x=n.x+dx,y=n.y+dy;if(Math.abs(x-n.ox)<=2&&Math.abs(y-n.oy)<=2&&!solid(x,y)&&!(x===PL.x&&y===PL.y)){n.x=x;n.y=y;n.mv=1;n.wt=0}}}}});
  PL.bumpT=Math.max(0,(PL.bumpT||0)-dt);
  if(PL.mv){const sp=(IN.b?2:1)*(PL.jump?3.2:5.2);PL.prog=(PL.prog||0)+dt*sp/(PL.len||1);PL.wt=(PL.wt||0)+dt*(IN.b?1.6:1);const t=Math.min(1,PL.prog);PL.px=PL.from[0]+(PL.x-PL.from[0])*t;PL.py=PL.from[1]+(PL.y-PL.from[1])*t;if(t>=1){PL.mv=0;PL.prog=0;PL.px=PL.x;PL.py=PL.y;G.x=PL.x;G.y=PL.y;G.dir=PL.dir;stepDone();if(!PL.mv&&mode==="world"&&!lock&&!TB&&!FADE)holdMove()}return}
  if(PL.turnT>0){PL.turnT-=dt;return}holdMove()};
const holdMove=()=>{const d=IN.u?"up":IN.d?"down":IN.l?"left":IN.r?"right":null;if(d){PL.held=PL.dir===d||PL.held;tryMove(d)}else PL.held=false};
const frame=now=>{if(!alive)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;try{update(dt);
  if(mode==="title"||mode==="intro")drawTitle(dt);else if(mode==="battle"&&B)drawBattle(dt);else if(M)drawWorld(dt);
  if(FADE){cx.fillStyle=`rgba(0,0,0,${FADE.t<.18?FADE.t/.18:1-(FADE.t-.18)/.18})`;cx.fillRect(0,0,VW,VH)}if(FLASH){cx.fillStyle=Math.floor(now/80)%2?"#000":"#fff";cx.fillRect(0,0,VW,VH)}
  drawUI();if(INTRO)INTRO.draw()}catch(e){console.error(e)}};
/* ---------- titolo e nuova partita ---------- */
let titleT=0;const drawTitle=dt=>{titleT+=dt;const g=cx.createLinearGradient(0,0,0,VH);g.addColorStop(0,"#1e1b4b");g.addColorStop(1,"#7c3aed");cx.fillStyle=g;cx.fillRect(0,0,VW,VH);for(let i=0;i<40;i++){cx.fillStyle="rgba(255,255,255,.5)";cx.fillRect((i*53+titleT*20)%VW,(i*37)%90,1,1)}
  const s=SP.length?SP[Math.floor(titleT/2.5)%SP.length]:null;if(s){cx.drawImage(drawPlayer(s,false),VW/2-36,52,72,72)}cx.fillStyle="#c08a4f";cx.fillRect(0,124,VW,36)};
const titleGo=()=>{auInit();const sv=loadSave();const items=[];if(sv)items.push(["CONTINUA",()=>{G=sv;startWorld()}]);items.push(["NUOVA PARTITA",()=>{if(sv)yesnoT("Cancellare la partita salvata e ricominciare?",ok=>ok?intro():titleGo());else intro()}]);items.push(["ESCI",()=>PD.close()]);menu(items,{title:"POKE DREAM",small:0})};
const yesnoT=(q,cb)=>{say(q,()=>menu([["SÌ",()=>cb(true)],["NO",()=>cb(false)]],{small:1}))};
const intro=()=>{G=newGame("COACH",null);mode="intro";say(["PROF. PARQUET: «Benvenuto nel mondo dei giocatori!»","«In questa regione i giocatori vivono liberi: nei campetti, nell erba alta, perfino nei laghi.»","«Gli allenatori li mettono sotto contratto e li fanno crescere, partita dopo partita.»","«Ma dimmi… per quale squadra alleni?»"],()=>{const ks=Object.keys(TEAMS_);menu(ks.map(k=>[`ALLENATORE ${TEAMS_[k].nick.toUpperCase()}`,()=>{G.team=k;askName()}]),{title:"LA TUA SQUADRA"})})};
const askName=()=>{const d=document.createElement("div");d.id="pdName";d.style.cssText="position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)";d.innerHTML=`<div style="background:#f8fafc;border:4px solid #334155;border-radius:10px;padding:16px;font:700 16px 'Trebuchet MS',sans-serif;color:#111827;text-align:center;width:min(320px,86vw)">Come ti chiami, allenatore?<br><input maxlength="10" value="COACH" style="margin:12px 0;width:85%;font:700 20px monospace;text-align:center;padding:6px;border:2px solid #64748b;border-radius:8px;text-transform:uppercase"><br><button style="padding:10px 26px;border-radius:10px;border:0;background:${TEAM().cap};color:${TEAM().capt};font:900 16px system-ui">OK</button></div>`;host.appendChild(d);const inp=d.querySelector("input");setTimeout(()=>{try{inp.focus();inp.select()}catch(e){}},50);
  const ok=()=>{G.name=(inp.value||"COACH").toUpperCase().slice(0,10);d.remove();const others=Object.keys(TEAMS_).filter(k=>k!==G.team);G.flags.rivTeam=pick(others);G.flags.starters=starterFor(G.team);Object.keys(peopleSpr).forEach(k=>delete peopleSpr[k]);say([`PROF. PARQUET: «${G.name}! Allenatore dei ${TEAM().nick.toUpperCase()}. Bel nome!»`,`«Il mio nipote VITO allena i ${RIVT().nick.toUpperCase()}. Sarà il tuo rivale!»`,"«La tua avventura sta per cominciare. Vieni a trovarmi al laboratorio!»"],()=>startWorld())};d.querySelector("button").onclick=ok;inp.onkeydown=e=>{if(e.key==="Enter")ok()}};
const startWorld=()=>{mode="world";Object.keys(peopleSpr).forEach(k=>delete peopleSpr[k]);loadMap(G.map,G.x,G.y,G.dir);if(G.flags.rivaldone)NPCS.forEach(q=>{if(q.id==="rival")q.vis=false})};
/* i tre giovani della tua squadra: una guardia, un ala, un centro (i meno quotati) */
const starterFor=t=>{const R=(ROST[t]||[]);const by=r=>R.filter(p=>p.role===r).sort((a,b)=>a.val-b.val)[0];const out=[];["G","F","C"].forEach(r=>{let p=by(r);if(!p){p=SP.filter(s=>s.role===r&&!out.includes(s.n)).sort((a,b)=>a.val-b.val)[0];if(p)p={name:p.n}}if(p)out.push(p.name)});return out};
let ROST={};
const setupWorld=()=>{/* erba alta del Percorso 1: i giocatori meno quotati (fuori dalla tua squadra), pesca: lunghi e tiratori */const low=SP.slice().sort((a,b)=>a.val-b.val);const mine=new Set(((G&&ROST[G.team])||[]).map(p=>p.name));const pool=low.filter(s=>!mine.has(s.n)).slice(0,10);
  ENC.r1={rate:.1,list:pool.map((s,i)=>[s.n,2,5,i<4?30:i<7?15:6])};ENC.fish={rate:1,list:low.filter(s=>s.role==="C"||s.t.includes("TIR")).slice(0,8).map(s=>[s.n,5,10,10])};
  TRP.r1a=[[pool[1]&&pool[1].n||SP[0].n,4]];TRP.r1b=[[pool[2]&&pool[2].n||SP[1].n,3],[pool[3]&&pool[3].n||SP[2].n,4]]};
/* ---------- APERTURA ---------- */
PD.open=o=>{if(alive)return;buildSpecies(o);buildTiles();TEAMS_={};Object.entries(o.teams||{}).forEach(([k,t])=>{TEAMS_[k]={nick:t.nick,cap:t.cap||t.bg,capt:t.fg||"#111"}});ROST={};(o.players||[]).forEach(p=>{if(p.team){(ROST[p.team]=ROST[p.team]||[]).push({name:p.name,role:p.role==="G"?"G":p.role==="C"?"C":"F",val:p.val||0})}});
  host=document.createElement("div");host.style.cssText="position:fixed;inset:0;z-index:2147482000;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden";document.body.appendChild(host);
  [cv,cx]=cnv(VW,VH);[ui,ux]=cnv(10,10);[cv,ui].forEach(c=>{c.style.cssText="position:absolute;image-rendering:pixelated;image-rendering:crisp-edges";host.appendChild(c)});
  /* comandi */const mkB=(t,css,k)=>{const b=document.createElement("div");b.textContent=t;b.style.cssText="position:absolute;display:flex;align-items:center;justify-content:center;color:#fff;font:900 18px system-ui;border-radius:50%;background:rgba(51,65,85,.85);border:2px solid rgba(255,255,255,.35);touch-action:none;"+css;host.appendChild(b);const on=e=>{e.preventDefault();auInit();if(AU.want){const w=AU.want;AU.want=null;playMus(w)}press(k);b.style.background="rgba(124,58,237,.9)"},off=e=>{e&&e.preventDefault();release(k);b.style.background="rgba(51,65,85,.85)"};b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off);return b};
  const pad=document.createElement("div");pad.style.cssText="position:absolute;width:150px;height:150px;touch-action:none";host.appendChild(pad);const pc=document.createElement("div");pc.style.cssText="position:absolute;inset:0;";pad.appendChild(pc);
  [["u","▲","left:50px;top:0"],["d","▼","left:50px;top:100px"],["l","◀","left:0;top:50px"],["r","▶","left:100px;top:50px"]].forEach(([k,t,p])=>{const b=document.createElement("div");b.textContent=t;b.style.cssText=`position:absolute;${p};width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:rgba(51,65,85,.85);color:#fff;font:900 18px system-ui;border-radius:10px`;b.dataset.k=k;pc.appendChild(b)});
  const padH=e=>{e.preventDefault();auInit();if(AU.want){const w=AU.want;AU.want=null;playMus(w)}const r=pad.getBoundingClientRect();const dx=e.clientX-r.left-75,dy=e.clientY-r.top-75;["u","d","l","r"].forEach(release);if(Math.hypot(dx,dy)<14)return;const k=Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u");press(k)};let padId=null;pad.addEventListener("pointerdown",e=>{padId=e.pointerId;try{pad.setPointerCapture(padId)}catch(_){}padH(e)});pad.addEventListener("pointermove",e=>{if(e.pointerId===padId)padH(e)});const padE=e=>{if(e.pointerId!==padId)return;padId=null;["u","d","l","r"].forEach(release)};pad.addEventListener("pointerup",padE);pad.addEventListener("pointercancel",padE);
  const bA=mkB("A","width:64px;height:64px;","a"),bB=mkB("B","width:52px;height:52px;","b"),bS=mkB("MENU","width:66px;height:30px;border-radius:15px;font-size:12px","st");
  /* tocco diretto sulle voci dei menu */ui.style.pointerEvents="auto";ui.addEventListener("pointerdown",e=>{auInit();if(TB){textA();return}if(!MENU)return;const r=ui.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*VW,Y=(e.clientY-r.top)/r.height*VH;const hit=menuRects.find(q=>X>=q[0]&&X<=q[0]+q[2]&&Y>=q[1]&&Y<=q[1]+q[3]);if(hit){const m=MENU;if(m.i===hit[4]||m.battle||true){m.i=hit[4];SFX.sel();const it=m.items[m.i];MENU=null;it&&it[1]()}}});
  const lay=()=>{const W=innerWidth,H=innerHeight,land=W>H;SC=land?Math.min((W-340)/VW,H/VH):Math.min(W/VW,(H*.62)/VH);SC=Math.max(1,SC);const cw=VW*SC,ch=VH*SC,l=(W-cw)/2,t=land?(H-ch)/2:Math.max(10,(H*.62-ch)/2);[cv,ui].forEach(c=>{c.style.left=l+"px";c.style.top=t+"px";c.style.width=cw+"px";c.style.height=ch+"px"});const dpr=Math.min(2,devicePixelRatio||1);ui.width=Math.round(cw*dpr);ui.height=Math.round(ch*dpr);SC=SC*dpr;
    if(land){pad.style.left="14px";pad.style.top=(H/2-40)+"px";bA.style.right="18px";bA.style.top=(H/2-10)+"px";bB.style.right="92px";bB.style.top=(H/2+40)+"px";bS.style.right="24px";bS.style.top="14px"}else{const y0=t+ch+20;pad.style.left="18px";pad.style.top=y0+"px";bA.style.right="24px";bA.style.top=(y0+30)+"px";bB.style.right="100px";bB.style.top=(y0+70)+"px";bS.style.right="calc(50% - 33px)";bS.style.top=(y0+160)+"px"}};lay();addEventListener("resize",lay);PD._lay=lay;
  PD._kd=e=>{const k=keyMap[e.key];if(k){press(k);e.preventDefault()}};PD._ku=e=>{const k=keyMap[e.key];if(k)release(k)};addEventListener("keydown",PD._kd);addEventListener("keyup",PD._ku);
  alive=true;mode="title";G=null;setupWorld();last=performance.now();raf=requestAnimationFrame(frame);setTimeout(()=>{if(alive)titleGo()},300);PD._saveT=setInterval(()=>{if(G&&mode==="world")save()},20000);PD.onclose=o.onclose};
PD.close=()=>{alive=false;cancelAnimationFrame(raf);clearInterval(PD._saveT);stopMus();try{save()}catch(e){}removeEventListener("resize",PD._lay);removeEventListener("keydown",PD._kd);removeEventListener("keyup",PD._ku);host&&host.remove();MENU=null;TB=null;TQ=[];B=null;try{AU.ac&&AU.ac.close()}catch(e){}AU.ac=null;AU.cur=null;PD.onclose&&PD.onclose()};
PD._dbg=()=>({G,PL,get M(){return MK},get B(){return B},get MENU(){return MENU},get TB(){return TB},press,release,loadMap,SP,MV,mkMon});
})();
