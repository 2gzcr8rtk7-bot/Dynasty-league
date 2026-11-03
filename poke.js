/* (1069) POKE DREAM — avventura a quadretti con i giocatori della nostra app (area riservata Ducks/DAX).
   Tutto originale: mappa, storia, personaggi, grafica pixel disegnata dal codice, musiche e suoni generati.
   Le regole sono quelle classiche del genere: esplorazione dall alto, erba alta, lotte a turni con 4 mosse, tipi, livelli 1-100, cattura con i PALLONI, zaino, schedario, centri cura, negozi, capi palestra, Lega.
   I giocatori sono le "creature": statistiche dai dati veri dell app (minuti, PDK, punti, rimbalzi, assist, efficienza, età). */
(function(){
"use strict";
const PD={};window.PDREAM=PD;
/* ---------- utilità ---------- */
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const hsh=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
/* ora del giorno (orologio vero): mattina 5-10, giorno 10-18, sera 18-21, notte 21-5 */const dayPhase=()=>{const h=new Date().getHours();return h<5?"notte":h<10?"mattina":h<18?"giorno":h<21?"sera":"notte"};const todayKey=()=>{const d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
const sR=s=>{let q=(s%2147483646)+1;return()=>{q=(q*16807)%2147483647;return(q-1)/2147483646}};
/* ---------- TIPI ----------
   Il triangolo dei ruoli: GUARDIA batte ALA, ALA batte CENTRO, CENTRO batte GUARDIA.
   Poi gli stili: TIRATORE batte CENTRO e DIFENSORE lo ferma; DIFENSORE batte TIRATORE e ATLETA; REGISTA batte DIFENSORE; ATLETA batte REGISTA. BASE è neutro. */
/* colori dei ruoli come nell app: guardie rosse, ali blu, centri gialli */const TY={BAS:{n:"BASE",c:"#9ca3af"},GUA:{n:"GUARDIA",c:"#ef4444"},ALA:{n:"ALA",c:"#2563eb"},CEN:{n:"CENTRO",c:"#fbbf24"},TIR:{n:"TIRATORE",c:"#f97316"},DIF:{n:"DIFENSORE",c:"#475569"},REG:{n:"REGISTA",c:"#a855f7"},ATL:{n:"ATLETA",c:"#14b8a6"}};const TYTX=t=>t==="CEN"?"#111827":"#fff";
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
/* forza complessiva (somma delle 6 stat base) dalla NOSTRA valutazione, a gradini come nel genere:
   comuni (fino a 800) 330-430 · non comuni (800-1300) 430-485 · rari (1300-2000) 485-545 · rarissimi (2000-2400) 545-590 · leggende (oltre 2400) 600-660.
   Il PDK sposta di poco (±3%): conta soprattutto la valutazione, che contiene già rendimento ed età. */
const rateFor=v=>{if(v>2400)return 3;const P=[[0,255],[800,150],[1300,90],[2000,45],[2400,25]];for(let i=1;i<P.length;i++)if(v<=P[i][0]){const[a0,b0]=P[i-1],[a1,b1]=P[i];return Math.round(b0+(b1-b0)*(v-a0)/(a1-a0))}return 25};
const bstFor=(v,pdk)=>{const P=[[0,330],[800,430],[1300,485],[2000,545],[2400,590],[2450,605],[3600,660]];let b=P[P.length-1][1];for(let i=1;i<P.length;i++)if(v<=P[i][0]){const[a0,b0]=P[i-1],[a1,b1]=P[i];b=b0+(b1-b0)*(v-a0)/(a1-a0);break}const m=pdk==null?1:cl(1+(pdk-30)/400,.97,1.03);return Math.round(b*m)};
/* ---------- I GIOCATORI (le "creature") ---------- */
/* aspetto: pelle 1-5 (chiara→scura), capelli, barba, fascia; i tratti più noti, disegnati in pixel (non ritratti) */
const LOOK={"Victor Wembanyama":"4,short,none,0,tall","Nikola Jokić":"1,short,stubble,0,big","Luka Dončić":"1,short,stubble,0","Jalen Johnson":"4,short,short,0","Jalen Duren":"5,short,stubble,0,big","Cade Cunningham":"4,short,short,0","Shai Gilgeous-Alexander":"4,short,stubble,0","Domantas Sabonis":"1,buzz,stubble,0,big","Donovan Clingan":"1,short,none,0,tall","Josh Giddey":"1,curly,none,0","Giannis Antetokounmpo":"4,buzz,short,0","Alperen Şengün":"1,short,short,0,big","Cameron Boozer":"4,short,none,0","Tyrese Haliburton":"4,short,none,1","Cooper Flagg":"1,short,none,0","Tyrese Maxey":"4,short,stubble,0","Stephon Castle":"4,braids,none,0","Jayson Tatum":"4,short,short,0","Chet Holmgren":"1,short,none,0,tall","Scottie Barnes":"5,locs,none,0","Deni Avdija":"1,long,stubble,0","Karl-Anthony Towns":"3,short,short,0,big","Evan Mobley":"4,short,none,0,tall","LaMelo Ball":"3,short,none,0","Alex Sarr":"5,short,none,0,tall","Trae Young":"3,short,stubble,0","Anthony Davis":"4,short,short,0,big","Paolo Banchero":"3,short,stubble,0","Anthony Edwards":"4,short,stubble,0","AJ Dybantsa":"5,short,none,0","Walker Kessler":"1,short,none,0,tall","Amen Thompson":"4,buzz,none,0","Keyonte George":"4,short,none,0","Caleb Wilson":"4,short,none,0","Kon Knueppel":"1,short,none,0","Jamal Murray":"3,short,short,0","Kel'el Ware":"4,short,none,0,tall","Donovan Mitchell":"4,short,short,0","Dyson Daniels":"1,short,none,0","Darryn Peterson":"4,short,none,0","Bam Adebayo":"4,buzz,short,0,big","Aday Mara":"1,short,none,0,tall","Ja Morant":"4,short,stubble,0","Joel Embiid":"5,short,short,0,big","Brandon Miller":"4,short,none,0","Jarrett Allen":"4,afro,short,0,big","Jaylen Brown":"4,short,short,0","Lauri Markkanen":"1,short,stubble,0,tall","Trey Murphy III":"3,short,short,0","Onyeka Okongwu":"5,short,none,0,big","Michael Porter Jr.":"2,curly,stubble,0","VJ Edgecombe":"4,short,none,0","Darius Acuff Jr.":"4,short,none,0","Isaiah Hartenstein":"1,short,short,0,big","Derik Queen":"4,short,none,0,big","Kawhi Leonard":"4,short,short,0","Mikel Brown Jr.":"4,short,none,0","Jalen Williams":"4,short,stubble,0","Jalen Brunson":"3,short,short,0","Austin Reaves":"1,short,stubble,0","Keaton Wagler":"1,short,none,0","Franz Wagner":"1,short,none,0","Zion Williamson":"4,short,none,0,big","Ryan Rollins":"4,short,none,0","Brayden Burries":"4,short,none,0","Darius Garland":"4,short,none,0","Ivica Zubac":"1,buzz,none,0,big","Devin Booker":"3,short,stubble,0","Zach Edey":"1,short,none,0,tall","Moussa Diabaté":"5,short,none,0,big","Tyler Herro":"1,short,stubble,0","Kyshawn George":"4,short,none,0","Sergio De Larrea":"1,short,none,0","Immanuel Quickley":"4,short,none,0","Matas Buzelis":"1,short,none,0","Damian Lillard":"4,short,full,0","Yaxel Lendeborg":"3,short,none,0","De'Aaron Fox":"4,short,stubble,0","Ausar Thompson":"4,buzz,none,0","Jabari Smith Jr.":"4,short,none,0","Cedric Coward":"4,short,none,0","James Harden":"3,short,huge,0","Julius Randle":"4,short,short,0,big","Dylan Harper":"4,short,none,0","Kingston Flemings":"4,short,none,0","Dejounte Murray":"4,braids,stubble,0","Maxime Raynaud":"1,short,none,0,tall","Collin Murray-Boyles":"4,short,none,0","Pascal Siakam":"5,short,short,0","Desmond Bane":"4,short,short,0","RJ Barrett":"4,short,short,0","Rudy Gobert":"4,short,short,0,tall","Kyrie Irving":"3,short,full,0","Miles Bridges":"4,short,short,0","Jaime Jaquez Jr.":"2,short,stubble,0","Josh Hart":"4,short,short,0","Stephen Curry":"3,short,stubble,0","Brandon Ingram":"4,short,none,0","Ace Bailey":"4,short,none,0","LeBron James":"4,short,full,1","Jeremiah Fears":"4,short,none,0","Kristaps Porziņģis":"1,short,stubble,0,tall","Allen Graves":"4,short,none,0","Morez Johnson Jr.":"4,short,none,0","Kevin Durant":"4,short,short,0,tall","Naz Reid":"4,short,none,0,big","Egor Dëmin":"1,short,none,0","Jalen Green":"3,short,none,0","Paul George":"4,short,short,0","Jonathan Kuminga":"5,short,none,0","Danny Wolf":"1,long,none,0","Oso Ighodaro":"5,short,none,0","Trevon Brazile":"4,short,none,0","Hannes Steinbach":"1,short,none,0,tall","Khaman Maluach":"5,short,none,0,tall"};
/* colori maglia: squadre della nostra lega (dai dati dell app) oppure squadra NBA */
/* colori anni 90 (solo colori, niente loghi né scritte) */const NBA90={TOR:["#6d28d9","#ce1141","#111111"],CHA:["#00a3ad","#3b1f7a","#ffffff"],MIL:["#4b2c84","#00653a","#ffffff"],HOU:["#ce1141","#ffc72c","#ffffff"],DEN:["#1d428a","#fec524","#c8102e"],BKN:["#002a60","#ce1141","#ffffff"],ATL:["#c8102e","#ffc72c","#111111"],DET:["#00686b","#8b1a1a","#111111"],PHX:["#5f259f","#e56020","#ffffff"],SAC:["#5a2d81","#c4ced4","#111111"],OKC:["#00653a","#ffc200","#ffffff"],MEM:["#00b2a9","#7a3e1a","#111111"],CLE:["#00a3e0","#f58025","#111111"],ORL:["#111111","#0077c0","#ffffff"],MIN:["#0c2340","#00a651","#ffffff"],GSW:["#1d428a","#f58426","#ffc72c"],LAC:["#e2231a","#1d428a","#ffffff"],UTA:["#3e2680","#00a2b9","#e56020"],WAS:["#002b5c","#c8102e","#ffffff"],NOP:["#00a3ad","#3b1f7a","#ffffff"],SAS:["#111111","#c4ced4","#00b2a9"],POR:["#e03a3e","#111111","#ffffff"],IND:["#002d62","#fdbb30","#ffffff"],DAL:["#00538c","#00a651","#ffffff"],NYK:["#006bb6","#f58426","#ffffff"]};const NBAC={ATL:["#e03a3e","#ffffff"],BOS:["#007a33","#ffffff"],BKN:["#111111","#ffffff"],CHA:["#1d1160","#00788c"],CHI:["#ce1141","#111111"],CLE:["#860038","#fdbb30"],DAL:["#00538c","#ffffff"],DEN:["#0e2240","#fec524"],DET:["#c8102e","#1d42ba"],GSW:["#1d428a","#ffc72c"],HOU:["#ce1141","#ffffff"],IND:["#002d62","#fdbb30"],LAC:["#1d428a","#c8102e"],LAL:["#552583","#fdb927"],MEM:["#5d76a9","#12173f"],MIA:["#98002e","#f9a01b"],MIL:["#00471b","#eee1c6"],MIN:["#0c2340","#78be20"],NOP:["#0c2340","#c8102e"],NYK:["#006bb6","#f58426"],OKC:["#007ac1","#ef3b24"],ORL:["#0077c0","#ffffff"],PHI:["#006bb6","#ed174c"],PHX:["#1d1160","#e56020"],POR:["#e03a3e","#111111"],SAC:["#5a2d81","#ffffff"],SAS:["#c4ced4","#111111"],TOR:["#ce1141","#111111"],UTA:["#002b5c","#f9a01b"],WAS:["#002b5c","#e31837"]};
let SP=[],SPX={};
const buildSpecies=o=>{SP=[];SPX={};(o.players||[]).forEach((p,i)=>{const r=p.role==="C"?"C":p.role==="G"?"G":"F";
    const t1=r==="G"?"GUA":r==="C"?"CEN":"ALA";
    const pts=p.pts??p.pdk*.55??10,reb=p.reb??(r==="C"?8:4),ast=p.ast??(r==="G"?5:2.5),mn=p.min??26,age=p.age??25,pdk=p.pdk??(10+(p.val||500)/80),ef=p.eff??.8;
    let t2=null;if(ast>=6)t2="REG";else if(r!=="C"&&ef>=.85&&pts>=18)t2="TIR";else if(r==="C"&&reb>=10)t2="DIF";else if(age<=23)t2="ATL";else if(r==="C")t2="DIF";else if(pts>=17)t2="TIR";else if(r==="F")t2="ATL";else t2="REG";if(t2===t1)t2=null;
    const BST=bstFor(p.val||500,pdk);
    let w={hp:1+mn/36+(r==="C"?.35:0),atk:.6+pts/22+(r==="C"?.4:r==="F"?.25:0),def:.5+reb/8+(r==="C"?.35:0),spa:.5+pts/24+ef*.45+(r==="G"?.3:0),spd:.55+ast/7+(age>=28?.3:0),spe:.45+(r==="G"?.6:r==="F"?.35:.1)+(age<=23?.3:0)};
    const ws=Object.values(w).reduce((a,b)=>a+b,0),bs={};Object.keys(w).forEach(k=>bs[k]=cl(Math.round(BST*(.72*w[k]/ws+.28/6)),20,190));
    const lk=(LOOK[p.name]||(()=>{/* aspetto generato dal nome per chi non ha una scheda: carnagione, capelli, barba, fascia */const h=hsh(p.name);const skin=1+(h%5),hair=["short","short","short","buzz","curly","long","locs"][(h>>3)%7],beard=["none","none","short","stubble","full"][(h>>6)%5],band=((h>>9)%6===0)?1:0;return`${skin},${hair},${beard},${band}`})()).split(",");
    const team=p.team||null,col=p.col||(NBAC[p.nba]||["#475569","#ffffff"]);
    const c90=NBA90[p.nba]||[col[0],col[1],shade(col[0],.25)];const s={i,col90:c90,n:p.name,short:p.name.split(" ").slice(-1)[0].replace(/\.$/,""),role:r,t:[t1,t2].filter(Boolean),bs,BST,rate:rateFor(p.val||500),bx:Math.round(60+BST/5),num:p.num!=null?p.num:hsh(p.name)%40,team,nba:p.nba,col,skin:+lk[0],hair:lk[1],beard:lk[2],band:lk[3]==="1",build:lk[4]||(r==="C"?"big":"norm"),val:p.val||500,age,dex:i+1};
    s.learn=learnset(s);SP.push(s);SPX[s.n]=s})};
/* mosse imparate salendo di livello: dalle famiglie dei suoi tipi + BASE, sempre più forti */
const learnset=s=>{const r_=sR(hsh(s.n));const pools=s.t.concat(["BAS"]);const pool=MOVES.filter(m=>pools.includes(m.t)&&(!m.r||m.r.includes(s.role)||m.t===s.t[0]||m.t===s.t[1]));
  const atk=pool.filter(m=>m.c!=="S").sort((a,b)=>a.p-b.p),st=pool.filter(m=>m.c==="S");const L=[];const lv=[1,1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,47,51,55,60,65,70,76,82];
  const weak=atk.filter(m=>m.p<=50),mid=atk.filter(m=>m.p>50&&m.p<=80),str=atk.filter(m=>m.p>80);const take=(a)=>{if(!a.length)return null;const k=Math.floor(r_()*a.length);return a.splice(k,1)[0]};
  const seq=[weak,weak,st,weak,mid,st,mid,mid,st,mid,str,mid,st,str,mid,str,st,str,str,st,str,str,st,str];
  seq.forEach((a,i)=>{let m=take(a)||take(mid)||take(str)||take(weak);if(m)L.push([lv[i],m.n])});return L};
/* ---------- formule classiche del genere ---------- */
const NAT=[["Paziente","",""],["Grintoso","atk","spa"],["Freddo","spa","atk"],["Rapido","spe","def"],["Solido","def","spe"],["Lucido","spd","atk"],["Instancabile","hp?","spe"],["Esplosivo","spe","spd"],["Altruista","spd","atk"],["Egoista","spa","spd"]];
const MN=m=>m&&(m.nick||(SPX[m.sp]&&SPX[m.sp].n)||"");const stat=(m,k)=>{const s=SPX[m.sp],b=s.bs[k],iv=m.iv[k],ev=(m.ev&&m.ev[k])||0,L=m.lv;if(k==="hp")return Math.floor((2*b+iv+Math.floor(ev/4))*L/100)+L+10;let v=Math.floor((2*b+iv+Math.floor(ev/4))*L/100)+5;const n=NAT[m.nat||0];if(n[1]===k)v=Math.floor(v*1.1);if(n[2]===k)v=Math.floor(v*.9);return v};
const expAt=L=>L<=1?0:Math.floor(L*L*L);/* crescita media */
const mkMon=(name,L,o)=>{const s=SPX[name];if(!s)return null;const iv={};["hp","atk","def","spa","spd","spe"].forEach(k=>iv[k]=ri(0,31));const m={sp:name,lv:L,iv,ev:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0},nat:ri(0,NAT.length-1),xp:expAt(L),st:null,moves:[],shiny:rnd()<1/512,ot:o&&o.ot||""};
  const kn=s.learn.filter(q=>q[0]<=L).map(q=>q[1]);kn.slice(-4).forEach(n=>m.moves.push({n,pp:MV[n].pp}));m.hp=stat(m,"hp");return m};
/* ---------- ZAINO: tasche e oggetti ---------- */
const IT={
 "Pallone":{p:"con",pr:200,d:"Il pallone da cattura di base. Lancialo a un giocatore selvatico indebolito.",ball:1},
 "Super Pallone":{p:"con",pr:600,d:"Cattura meglio del Pallone normale (×1,5).",ball:1.5},
 "Iper Pallone":{p:"con",pr:1200,d:"Ottimo per i giocatori rari (×2).",ball:2},
 "Pallone MVP":{p:"con",pr:0,d:"Cattura sempre, senza fallire. Ne esiste quasi solo uno: usalo bene!",ball:"mvp"},
 "Pallone Rete":{p:"con",pr:1000,d:"×3,5 sui CENTRI e sui DIFENSORI, ×1 sugli altri.",ball:"rete"},
 "Pallone Tuffo":{p:"con",pr:1000,d:"×3,5 sui giocatori incontrati mentre nuoti, ×1 altrove.",ball:"tuffo"},
 "Pallone Esca":{p:"con",pr:1000,d:"×4 sui giocatori pescati con la canna, ×1 altrove.",ball:"esca"},
 "Pallone Vivaio":{p:"con",pr:1000,d:"Più il giocatore è di livello basso, più funziona (fino a ×4).",ball:"vivaio"},
 "Pallone Bis":{p:"con",pr:1000,d:"×3,5 se quel giocatore l hai già catturato in passato.",ball:"bis"},
 "Pallone Timer":{p:"con",pr:1000,d:"Più dura la lotta, più funziona: fino a ×4 dopo 10 turni.",ball:"timer"},
 "Pallone Rapido":{p:"con",pr:1000,d:"×5 se lo lanci al primo turno della lotta, poi ×1.",ball:"rapido"},
 "Pallone Notte":{p:"con",pr:1000,d:"×3 nelle grotte e nei tunnel, ×1 altrove.",ball:"notte"},
 "Pallone Cura":{p:"con",pr:300,d:"×1, ma il giocatore catturato torna subito in piena forma.",ball:"cura"},
 "Pallone Livello":{p:"con",pr:1500,d:"Funziona se il tuo giocatore in campo ha livello più alto: ×2, ×4 o ×8.",ball:"livello"},
 "Pallone Peso":{p:"con",pr:1500,d:"Migliore sui giocatori grossi e pesanti, peggiore sui piccoli.",ball:"peso"},
 "Pallone Veloce":{p:"con",pr:1500,d:"×4 sui giocatori con velocità base alta (100 o più).",ball:"veloce"},
 "Pallone Leggenda":{p:"con",pr:0,d:"×5 sui giocatori leggendari, quasi inutile (×0,1) sugli altri.",ball:"leggenda"},
 "Pallone Premier":{p:"con",pr:0,d:"Edizione celebrativa: ×1. Lo regalano a chi compra 10 Palloni.",ball:1},
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
 "Bevanda max":{p:"cur",pr:1200,d:"Ricarica tutti i PP di una mossa.",pp:99},
 "Elisir":{p:"cur",pr:2500,d:"Ricarica 10 PP di tutte le mosse.",ppall:10},
 "Elisir max":{p:"cur",pr:5000,d:"Ricarica tutti i PP di tutte le mosse.",ppall:99},
 "Rientro completo":{p:"cur",pr:4000,d:"Rimette in campo un giocatore KO con tutti i punti vita.",rev:1},
 "Kit medico":{p:"cur",pr:3000,d:"Ridà tutti i punti vita e cura ogni problema.",heal:999,cure:"all"},
 "Integratore PP":{p:"cur",pr:9800,d:"Aumenta per sempre i PP massimi di una mossa.",ppup:1},
 "Spinta forza":{p:"cur",pr:500,d:"Solo in partita: alza l ATTACCO.",x:"atk"},
 "Spinta difesa":{p:"cur",pr:550,d:"Solo in partita: alza la DIFESA.",x:"def"},
 "Spinta tiro":{p:"cur",pr:600,d:"Solo in partita: alza il TIRO.",x:"spa"},
 "Spinta corsa":{p:"cur",pr:500,d:"Solo in partita: alza la VELOCITÀ.",x:"spe"},
 "Spinta mira":{p:"cur",pr:950,d:"Solo in partita: alza la PRECISIONE.",x:"acc"},
 "Fascia protezione":{p:"cur",pr:700,d:"Solo in partita: per 5 turni le statistiche non calano.",x:"guard"},
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
 "Fischietto max":{p:"ogg",pr:1500,d:"Li tiene lontani a lungo.",rep:400},
 "Barretta energetica":{p:"ogg",pr:4000,d:"Da tenere: a fine turno recupera un po di punti vita.",held:"left"},
 "Fascia della grinta":{p:"ogg",pr:4000,d:"Da tenere: a volte resiste a un colpo KO con 1 punto vita.",held:"focus"},
 "Biglietto fortunato":{p:"ogg",pr:0,d:"Da tenere: guadagna il 50% di esperienza in più.",held:"egg"},
 "Portafortuna":{p:"ogg",pr:0,d:"Da tenere: il doppio dei crediti dagli allenatori.",held:"coin"},
 "Fischietto dell arbitro":{p:"ogg",pr:4000,d:"Da tenere: i colpi a volte fanno saltare il turno all avversario.",held:"king"},
 "Palla rovente":{p:"ogg",pr:5000,d:"Da tenere: colpi più forti del 30%, ma si fa un po male.",held:"orb"},
 "Borraccia magica":{p:"ogg",pr:4000,d:"Da tenere: recupera parte dei danni che fa.",held:"bell"},
 "Fascia del centro":{p:"ogg",pr:3000,d:"Da tenere: le mosse da CENTRO fanno più danni.",held:"tCEN"},
 "Fascia della guardia":{p:"ogg",pr:3000,d:"Da tenere: le mosse da GUARDIA fanno più danni.",held:"tGUA"},
 "Fascia dell ala":{p:"ogg",pr:3000,d:"Da tenere: le mosse da ALA fanno più danni.",held:"tALA"},
 "Uscita d emergenza":{p:"ogg",pr:550,d:"Esci subito da una grotta.",esc:1},
 "Bici":{p:"chi",pr:0,d:"Si va il doppio più veloci (tasto in alto).",key:"bike"},
 "Canna da pesca":{p:"chi",pr:0,d:"Usala davanti all acqua: escono giocatori dal lago.",key:"rod",rod:1},
 "Canna buona":{p:"chi",pr:0,d:"Pesca giocatori migliori.",key:"rod",rod:2},
 "Super canna":{p:"chi",pr:0,d:"Pesca i giocatori migliori dei laghi.",key:"rod",rod:3},
 "Cuffie da allenamento":{p:"chi",pr:0,d:"Accese, tutta la squadra guadagna esperienza. Usale per accenderle o spegnerle.",key:"share"},
 "Radar strumenti":{p:"chi",pr:0,d:"Dice quanti strumenti restano da trovare in questa zona.",key:"radar"},
 "Agenda sfide":{p:"chi",pr:0,d:"Dopo la Lega: gli allenatori della zona ti sfidano di nuovo.",key:"vs"},
 "Mappa della regione":{p:"chi",pr:0,d:"La mappa di tutta la regione.",key:"map"},
 "Lettera per il professore":{p:"chi",pr:0,d:"Da consegnare al Prof. Parquet.",key:"letter"}};
/* SCHEMI: le mosse si comprano in negozio e si insegnano solo ai ruoli giusti (il centro la schiacciata, la guardia l assist…) */
const SCHEMI=MOVES.filter(m=>m.r!==""||m.t==="BAS").map(m=>({n:"Schema: "+m.n,mv:m.n,pr:m.c==="S"?2000:Math.max(1500,m.p*45)}));
SCHEMI.forEach(s=>{IT[s.n]={p:"sch",pr:s.pr,d:`Insegna «${s.mv}» (${TY[MV[s.mv].t].n}${MV[s.mv].r?" · "+MV[s.mv].r.split("").map(x=>({G:"guardie",F:"ali",C:"centri"})[x]).join(", "):""}). Si può riusare.`,mv:s.mv}});
const POCK=[["cur","CURE"],["con","PALLONI"],["fru","FRUTTI"],["ogg","OGGETTI"],["sch","SCHEMI"],["chi","CHIAVE"]];
/* ---------- GRAFICA PIXEL (tutta disegnata qui) ---------- */
const cnv=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.imageSmoothingEnabled=false;return[c,x]};
const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>cl(Math.round(k>0?v+(255-v)*k:v*(1+k)),0,255);return"#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("")};
const TS=16;/* tile */
const TILE={};const tile=(k,f)=>{const[c,x]=cnv(TS,TS);f(x);TILE[k]=c};
const px=(x,c,X,Y,w,h)=>{x.fillStyle=c;x.fillRect(X,Y,w||1,h||1)};
const noise=(x,cols,n,seed)=>{const r=sR(seed||7);for(let i=0;i<n;i++)px(x,cols[Math.floor(r()*cols.length)],Math.floor(r()*16),Math.floor(r()*16))};
const buildTiles=()=>{
  /* erba: due toni a scacchi morbidi + ciuffetti */const GR=(x,sd)=>{px(x,"#5fb24a",0,0,16,16);for(let j=0;j<16;j+=2)for(let i=(j/2)%2*2;i<16;i+=4)px(x,"#66ba50",i,j,2,2);noise(x,["#55a442","#74c75c"],14,sd);[[2,5],[11,2],[7,12],[13,10]].forEach(([a,b])=>{px(x,"#48963a",a,b,1,2);px(x,"#48963a",a+2,b,1,2);px(x,"#86d46c",a+1,b-1,1,2)})};
  tile(".",x=>GR(x,1));
  tile(",",x=>{GR(x,7);noise(x,["#6cbf4c","#8bdb68"],18,2);[[3,4],[10,9],[6,12]].forEach(([a,b])=>{px(x,"#5aa83e",a,b,1,2);px(x,"#5aa83e",a+1,b-1,1,2)})});
  tile('"',x=>{px(x,"#4ea33c",0,0,16,16);for(let i=0;i<4;i++)for(let j=0;j<2;j++){const X=i*4,Y=j*8;px(x,"#2a7026",X,Y+3,4,5);px(x,"#3a8f30",X+1,Y+1,1,6);px(x,"#3a8f30",X+3,Y+2,1,5);px(x,"#7fd462",X+1,Y+1,1,1);px(x,"#7fd462",X+3,Y+2,1,1);px(x,"#1b511c",X,Y+7,4,1)}});
  tile(":",x=>{px(x,"#dcc08a",0,0,16,16);noise(x,["#cfb077","#e8cf9c","#c6a56c"],30,3);[[4,6],[11,11],[9,3]].forEach(([a,b])=>{px(x,"#b5955c",a,b,2,1);px(x,"#efdcb0",a,b-1,2,1)})});
  tile("=",x=>{px(x,"#cfcbc3",0,0,16,16);px(x,"#b7b2a8",0,0,16,1);px(x,"#b7b2a8",0,8,16,1);px(x,"#b7b2a8",8,0,1,8);px(x,"#b7b2a8",0,8,1,8);noise(x,["#d9d6cf"],10,4)});
  tile("s",x=>{px(x,"#f1dfa6",0,0,16,16);noise(x,["#e6d090","#f8ecc4"],24,5)});
  tile("~",x=>{px(x,"#3f93dc",0,0,16,16);for(let j=0;j<16;j+=4)px(x,"#4aa0e6",0,j,16,2);px(x,"#7cc4f5",2,3,5,1);px(x,"#7cc4f5",9,10,5,1);px(x,"#c9e9ff",3,3,2,1);px(x,"#c9e9ff",10,10,2,1)});tile("~2",x=>{px(x,"#3f93dc",0,0,16,16);for(let j=2;j<16;j+=4)px(x,"#4aa0e6",0,j,16,2);px(x,"#7cc4f5",6,6,5,1);px(x,"#7cc4f5",1,13,5,1);px(x,"#c9e9ff",7,6,2,1);px(x,"#c9e9ff",2,13,2,1)});
  /* albero in pixel art: chioma a pixel con contorno, 4 toni di verde, tronco e ombra */tile("T",x=>{GR(x,2);px(x,"rgba(0,0,0,.18)",2,13,12,2);px(x,"#4a2e18",6,10,4,6);px(x,"#6b4426",7,10,2,5);px(x,"#2e1c0e",6,15,4,1);
    for(let j=0;j<12;j++)for(let i=0;i<16;i++){const dx=i-7.5,dy=(j-5.5)*1.12,d=Math.sqrt(dx*dx+dy*dy);if(d>7.3)continue;const lit=(-dx-dy)/7;let c=d>6.4?"#15421f":lit>.55?"#82d25f":lit>.15?"#45a33f":lit>-.35?"#2b8034":"#1e5f28";if(d<=6.4&&((i*7+j*13)%11===0))c="#1d5e29";if(d<=6.4&&lit>.3&&((i+j)%5===0))c="#b4ec8c";px(x,c,i,j,1,1)}});
  tile("F",x=>{GR(x,7);noise(x,["#6cbf4c"],10,6);[[3,3,"#f43f5e"],[11,4,"#facc15"],[6,11,"#fafafa"],[12,12,"#f43f5e"]].forEach(([a,b,c])=>{px(x,c,a-1,b,3,1);px(x,c,a,b-1,1,3);px(x,"#fde047",a,b)})});
  tile("L",x=>{GR(x,7);noise(x,["#6cbf4c"],10,8);px(x,"#4f9a3a",0,10,16,2);px(x,"#3b7a2b",0,12,16,2);px(x,"#9ee07f",0,9,16,1)});
  tile("#",x=>{GR(x,7);px(x,"#f5f5f4",1,4,2,11);px(x,"#f5f5f4",13,4,2,11);px(x,"#e7e5e4",0,6,16,2);px(x,"#e7e5e4",0,11,16,2);px(x,"#a8a29e",1,14,2,1);px(x,"#a8a29e",13,14,2,1)});
  tile("S",x=>{GR(x,7);px(x,"#7c4a24",7,9,2,6);px(x,"#9a6332",2,3,12,7);px(x,"#c48a4f",3,4,10,5);px(x,"#5a341a",2,9,12,1);px(x,"#7c4a24",4,5,8,1);px(x,"#7c4a24",4,7,6,1)});
  tile("R",x=>{px(x,"#8b8f96",0,0,16,16);noise(x,["#757a82","#a2a6ad"],30,9);px(x,"#5b5f66",0,15,16,1)});/* roccia/montagna */
  tile("C",x=>{px(x,"#d6c8a8",0,0,16,16);noise(x,["#c4b58f","#e2d6bb"],30,10)});/* pavimento grotta */
  /* interni */
  tile("f",x=>{px(x,"#d6a25e",0,0,16,16);for(let j=0;j<16;j+=4){px(x,"#b98443",0,j+3,16,1);px(x,"#e3b678",((j*5)%13),j,4,1)}});/* parquet */
  tile("k",x=>{px(x,"#e9edf2",0,0,16,16);px(x,"#cbd3dc",0,0,16,1);px(x,"#cbd3dc",0,0,1,16);px(x,"#f7f9fb",1,1,6,6)});/* piastrelle */
  tile("X",x=>{px(x,"#e8dcc4",0,0,16,16);px(x,"#cdbd9c",0,13,16,3);px(x,"#b8a580",0,12,16,1);for(let i=0;i<16;i+=4)px(x,"#ddd0b4",i,0,1,12)});/* muro interno */
  tile("Y",x=>{px(x,"#cfe3f0",0,0,16,16);px(x,"#a9c6da",0,13,16,3);px(x,"#8fb2ca",0,12,16,1)});/* muro azzurro (centro/negozio) */
  tile("m",x=>{px(x,"#d6a25e",0,0,16,16);px(x,"#b4342f",1,3,14,10);px(x,"#d9534c",2,4,12,8);px(x,"#f1c40f",2,7,12,1)});/* tappeto uscita */
  tile("_",x=>{px(x,"#111",0,0,16,16)});
  tile("J",x=>{GR(x,11);px(x,"rgba(0,0,0,.18)",2,13,12,2);px(x,"#5b3a1e",6,10,4,6);x.fillStyle="#1f6b2c";x.beginPath();x.arc(8,7,7,0,7);x.fill();x.fillStyle="#2f8f3a";x.beginPath();x.arc(7,6,5.5,0,7);x.fill();[[4,6],[9,4],[11,8],[6,9]].forEach(([a,b])=>{px(x,"#f97316",a,b,2,2);px(x,"#fde68a",a,b,1,1)})});
  tile("b",x=>{GR(x,7);x.fillStyle="#166534";x.beginPath();x.arc(8,9,7,0,7);x.fill();x.fillStyle="#22a045";x.beginPath();x.arc(7,8,5,0,7);x.fill();px(x,"#4ade80",5,5,2,2);px(x,"#0f3d1f",2,14,12,1)});
  tile("o",x=>{if(TILE.C)px(x,"#d6c8a8",0,0,16,16);else GR(x,7);x.fillStyle="#57534e";x.beginPath();x.arc(8,9,7,0,7);x.fill();x.fillStyle="#78716c";x.beginPath();x.arc(7,8,5.5,0,7);x.fill();px(x,"#a8a29e",5,4,3,2);px(x,"#292524",3,15,10,1)});
};
/* ---------- edifici esterni (disegnati come oggetti) ---------- */
const drawBld=(x,b,X,Y)=>{const W=b.w*TS,Hh=b.h*TS,rh=Math.round(Hh*.45);const rc=b.roof||"#c2410c",wc=b.wall||"#f3ead8";
  x.fillStyle=shade(wc,-.25);x.fillRect(X,Y+rh,W,Hh-rh);x.fillStyle=wc;x.fillRect(X+1,Y+rh,W-2,Hh-rh-1);for(let i=X+3;i<X+W-3;i+=6){x.fillStyle=shade(wc,-.06);x.fillRect(i,Y+rh+2,1,Hh-rh-4)}
  x.fillStyle=shade(rc,-.35);x.fillRect(X-2,Y+rh-3,W+4,4);x.fillStyle=rc;x.fillRect(X-1,Y,W+2,rh-2);for(let j=Y+2;j<Y+rh-2;j+=3){x.fillStyle=shade(rc,-.15);x.fillRect(X-1,j,W+2,1)}x.fillStyle=shade(rc,.25);x.fillRect(X-1,Y,W+2,2);
  /* finestre */const wy=Y+rh+4;for(let i=0;i<b.w;i++){if(b.door!=null&&i===b.door)continue;if(b.w>3&&(i===0||i===b.w-1)&&b.k!=="lab")continue;const wx=X+i*TS+4;x.fillStyle="#5b4630";x.fillRect(wx-1,wy-1,10,8);x.fillStyle="#9fd3f5";x.fillRect(wx,wy,8,6);x.fillStyle="#e6f6ff";x.fillRect(wx,wy,3,2);x.fillStyle="#5b4630";x.fillRect(wx+4,wy,1,6)}
  if(b.door!=null){/* porta in scala con le persone (alta ~18px) */const dx=X+b.door*TS+1,dh=Math.min(19,Hh-rh+2),dy=Y+Hh-dh;x.fillStyle="#3b2414";x.fillRect(dx-1,dy-1,16,dh+1);x.fillStyle=b.doorc||"#7a4a26";x.fillRect(dx,dy,14,dh);x.fillStyle=shade(b.doorc||"#7a4a26",.2);x.fillRect(dx+1,dy+1,5,dh-2);x.fillStyle=shade(b.doorc||"#7a4a26",-.2);x.fillRect(dx+7,dy+1,1,dh-1);x.fillStyle="#fcd34d";x.fillRect(dx+10,dy+Math.floor(dh/2),2,2);x.fillStyle="rgba(0,0,0,.25)";x.fillRect(dx-2,Y+Hh,18,2)}
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
const drawPlayer0=(s,back,shiny)=>{const key=s.n+(back?"b":"f")+(shiny?"s":"");if(sprCache[key])return sprCache[key];const[c,x]=cnv(56,56);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w,h);
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
/* ---------- allenatore (eroe e rivale) 16x24: più alto, cappello grande con visiera, viso ben leggibile, scarpe da basket ---------- */
const drawHero=(x,o,dir,fr)=>{const sk=o.skin||"#f6c9a3",skd=shade(sk,-.22),cap=o.capc||o.shoe||"#e5e7eb",capd=shade(cap,-.3),capl=shade(cap,.3),jk=o.shirt||"#1f2937",jkd=shade(jk,-.35),jkl=shade(jk,.25),pa=o.pants||"#334155",pad=shade(pa,-.3),hair=o.white?"#e5e7eb":(o.hairc||"#3b2414");
  const P=(c,X,Y,w,h)=>px(x,c,X,Y,w||1,h||1);const step=fr===1?1:fr===3?-1:0,bob=fr%2?1:0;const Y0=bob;
  /* gambe e scarpe */const lg=(X,off)=>{const u=off>0?1:0;P(pa,X,18+Y0,3,3-u);P(pad,X+2,18+Y0,1,3-u);P("#f8fafc",X-(dir==="left"?1:0),21+Y0-u,4,2);P(cap,X-(dir==="left"?1:0),21+Y0-u,4,1)};
  if(dir==="left"||dir==="right"){lg(6,step);if(step)lg(step>0?8:4,-step)}else{lg(4,step);lg(9,-step)}
  /* giacca */P(jkd,3,12+Y0,10,6);P(jk,4,12+Y0,8,5);P(jkl,4,12+Y0,1,3);if(dir==="down"){P("#f8fafc",6,12+Y0,4,1);P(cap,7,13+Y0,2,4)}if(dir==="up"&&o.bag){P("#7c2d12",4,12+Y0,8,6);P("#9a3412",5,13+Y0,6,4);P(cap,5,15+Y0,6,1)}
  /* braccia (oscillano camminando) */const sw=fr===1?1:fr===3?-1:0;if(dir==="down"||dir==="up"){P(jkd,2,12+Y0+sw,2,4);P(sk,2,16+Y0+sw,2,1);P(jkd,12,12+Y0-sw,2,4);P(sk,12,16+Y0-sw,2,1)}else{const ax=dir==="left"?7+sw:7-sw;P(jkd,ax,13+Y0,2,4);P(sk,ax,17+Y0,2,1);if(o.bag){const bx=dir==="left"?11:2;P("#7c2d12",bx,12+Y0,3,5);P(cap,bx,14+Y0,3,1)}}
  if(o.hs&&o.hs!=="A"){drawHead2(P,o,dir,Y0,o.hs,{sk,skd,cap,capd,capl,hair});return}
  /* testa */P(hair,3,5+Y0,10,7);P(sk,4,6+Y0,8,6);
  if(dir==="down"){P(hair,3,6+Y0,1,4);P(hair,12,6+Y0,1,4);P("#1e1b2e",5,8+Y0,2,2);P("#1e1b2e",9,8+Y0,2,2);P("#fff",5,8+Y0);P("#fff",9,8+Y0);P("#f9a8b8",4,10+Y0);P("#f9a8b8",11,10+Y0);P(skd,7,11+Y0,2,1)}
  else if(dir==="left"){P(hair,9,6+Y0,3,5);P("#1e1b2e",5,8+Y0,2,2);P("#fff",5,8+Y0);P("#f9a8b8",6,10+Y0);P(skd,4,11+Y0,2,1);P(sk,3,9+Y0,1,1)}
  else if(dir==="right"){P(hair,4,6+Y0,3,5);P("#1e1b2e",9,8+Y0,2,2);P("#fff",10,8+Y0);P("#f9a8b8",9,10+Y0);P(skd,10,11+Y0,2,1);P(sk,12,9+Y0,1,1)}
  else{P(hair,4,6+Y0,8,6);P(skd,4,11+Y0,8,1)}
  if(o.coat){P("#f1f5f9",3,12+Y0,10,7);P("#cbd5e1",7,13+Y0,2,6);P(jk,6,12+Y0,4,2)}
  if(o.long&&dir!=="up"){P(hair,2,6+Y0,2,8);P(hair,12,6+Y0,2,8)}if(o.long&&dir==="up")P(hair,3,6+Y0,10,8);
  if(!o.cap){/* capelli al posto del cappello */P(hair,3,2+Y0,10,5);P(shade(hair,.25),5,2+Y0,4,1);if(dir==="down")P(hair,4,6+Y0,8,1);return}
  /* cappello grande con visiera */P(capd,2,1+Y0,12,5);P(cap,3,0+Y0,10,5);P(capl,4,0+Y0,4,2);P(capd,3,4+Y0,10,1);
  if(dir==="down"){P(capd,2,5+Y0,12,2);P(shade(cap,-.15),3,5+Y0,10,1);if(o.logo)P(o.logoc||"#111",7,1+Y0,2,2)}
  else if(dir==="left"){P(capd,0,4+Y0,7,2);P(shade(cap,-.15),0,4+Y0,6,1);if(o.logo)P(o.logoc||"#111",8,1+Y0,2,2)}
  else if(dir==="right"){P(capd,9,4+Y0,7,2);P(shade(cap,-.15),10,4+Y0,6,1);if(o.logo)P(o.logoc||"#111",6,1+Y0,2,2)}
  else{P(capd,6,4+Y0,4,1);P("#e5e7eb",6,5+Y0,4,1)}};
/* varianti di testa per l allenatore: B slanciata · C rotonda · D con collo · E stile GBA · F piccola · G ovale alta */
const HEADS={B:{fx:5,fw:6,fy:5,fh:7,hx:4,hw:8,hy:1,hh:4,brim:1,eye:[1,2],ey:2},C:{fx:4,fw:8,fy:6,fh:6,hx:3,hw:10,hy:1,hh:4,brim:1,round:1,eye:[2,2],ey:2},D:{fx:5,fw:6,fy:4,fh:6,hx:4,hw:8,hy:0,hh:4,brim:2,neck:1,eye:[1,2],ey:2},E:{fx:4,fw:8,fy:6,fh:5,hx:3,hw:10,hy:2,hh:4,brim:1,low:1,eye:[1,2],ey:1},F:{fx:5,fw:6,fy:7,fh:5,hx:4,hw:8,hy:3,hh:3,brim:1,eye:[1,2],ey:1},G:{fx:5,fw:6,fy:4,fh:8,hx:4,hw:8,hy:0,hh:4,brim:1,round:1,eye:[1,2],ey:3}};
const drawHead2=(P,o,dir,Y0,v,C)=>{/* MIX: di fronte la testa rotonda (C), di lato quella con il collo (D) */if(v==="MIX")v=(dir==="down"||dir==="up")?"C":"D";const H=HEADS[v]||HEADS.B,{sk,skd,cap,capd,capl,hair}=C;const fx=H.fx,fw=H.fw,fy=H.fy+Y0,fh=H.fh,cx=fx+fw/2;
  /* capelli dietro e faccia */P(hair,fx-1,fy-1,fw+2,fh+1);P(sk,fx,fy,fw,fh);if(H.round){P(hair,fx,fy,1,1);P(hair,fx+fw-1,fy,1,1);P(hair,fx,fy+fh-1,1,1);P(hair,fx+fw-1,fy+fh-1,1,1)}
  if(H.neck){P(skd,fx+1,fy+fh,fw-2,1);P(sk,fx+2,fy+fh,fw-4,1)}
  const ey=fy+H.ey,[ew,eh]=H.eye;
  if(dir==="down"){P(hair,fx-1,fy,1,Math.min(4,fh-2));P(hair,fx+fw,fy,1,Math.min(4,fh-2));P("#1e1b2e",fx+1,ey,ew,eh);P("#1e1b2e",fx+fw-1-ew,ey,ew,eh);P("#fff",fx+1,ey);P("#fff",fx+fw-1-ew,ey);if(fh>=6){P("#f9a8b8",fx,ey+2);P("#f9a8b8",fx+fw-1,ey+2)}P(skd,fx+Math.floor(fw/2)-1,fy+fh-1,2,1)}
  else if(dir==="left"){P(hair,fx+fw-2,fy,2,fh-1);P("#1e1b2e",fx+1,ey,ew,eh);P("#fff",fx+1,ey);P("#f9a8b8",fx+1,ey+2);P(skd,fx,fy+fh-1,2,1)}
  else if(dir==="right"){P(hair,fx,fy,2,fh-1);P("#1e1b2e",fx+fw-1-ew,ey,ew,eh);P("#fff",fx+fw-1,ey);P("#f9a8b8",fx+fw-2,ey+2);P(skd,fx+fw-2,fy+fh-1,2,1)}
  else{P(hair,fx,fy,fw,fh)}
  if(o.long&&dir!=="up"){P(hair,fx-2,fy,2,fh+2);P(hair,fx+fw,fy,2,fh+2)}
  if(!o.cap){P(hair,fx-1,fy-3,fw+2,4);P(shade(hair,.25),fx+1,fy-3,3,1);return}
  /* cappello */const hx=H.hx,hw=H.hw,hy=H.hy+Y0,hh=H.hh;P(capd,hx-1,hy+1,hw+2,hh);P(cap,hx,hy,hw,hh);P(capl,hx+1,hy,Math.max(2,hw/2-1),2);P(capd,hx,hy+hh-1,hw,1);if(H.round){P(cap,hx,hy,1,1);P(cap,hx+hw-1,hy,1,1)}
  const by=hy+hh;if(dir==="down"){P(capd,hx-1,by,hw+2,H.brim);P(shade(cap,-.15),hx,by,hw,1);if(H.low)P(cap,hx,by-1,hw,1);if(o.logo)P(o.logoc||"#111",Math.floor(cx)-1,hy+1,2,2)}
  else if(dir==="left"){P(capd,hx-3,by-1,Math.floor(hw/2)+3,H.brim+1);P(shade(cap,-.15),hx-3,by-1,Math.floor(hw/2)+2,1);if(o.logo)P(o.logoc||"#111",hx+Math.floor(hw/2),hy+1,2,2)}
  else if(dir==="right"){P(capd,hx+Math.floor(hw/2),by-1,Math.floor(hw/2)+3,H.brim+1);P(shade(cap,-.15),hx+Math.floor(hw/2)+1,by-1,Math.floor(hw/2)+2,1);if(o.logo)P(o.logoc||"#111",hx+Math.floor(hw/2)-2,hy+1,2,2)}
  else{P(capd,Math.floor(cx)-2,by-1,4,1);P("#e5e7eb",Math.floor(cx)-2,by,4,1)}};
const heroSheet=o=>{const[c,x]=cnv(16*4,24*4);["down","left","right","up"].forEach((d,r)=>{for(let f=0;f<4;f++){const[t,tx]=cnv(16,24);drawHero(tx,o,d,f);/* contorno scuro attorno alla figura */const im=tx.getImageData(0,0,16,24),D=im.data,out=tx.createImageData(16,24),O=out.data;const a=(i,j)=>i>=0&&j>=0&&i<16&&j<24&&D[(j*16+i)*4+3]>0;for(let j=0;j<24;j++)for(let i=0;i<16;i++){const k=(j*16+i)*4;if(a(i,j)){O[k]=D[k];O[k+1]=D[k+1];O[k+2]=D[k+2];O[k+3]=255}else if(a(i-1,j)||a(i+1,j)||a(i,j-1)||a(i,j+1)){O[k]=27;O[k+1]=24;O[k+2]=40;O[k+3]=230}}tx.putImageData(out,0,0);x.drawImage(t,f*16,r*24)}});c.fh=24;return c};
/* ---------- icone degli strumenti dello zaino (16x16, pixel art) ---------- */
const ICONC={};
const ICON=k=>{if(ICONC[k])return ICONC[k];const[c,x]=cnv(16,16);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w||1,h||1);const it=IT[k]||{};const ring=(cx_,cy,r,col)=>{for(let j=0;j<16;j++)for(let i=0;i<16;i++){const d=Math.hypot(i+.5-cx_,j+.5-cy);if(d<=r)P(col,i,j)}};
  const out=()=>{const im=x.getImageData(0,0,16,16),D=im.data,o=x.createImageData(16,16),O=o.data;const a=(i,j)=>i>=0&&j>=0&&i<16&&j<16&&D[(j*16+i)*4+3]>0;for(let j=0;j<16;j++)for(let i=0;i<16;i++){const q=(j*16+i)*4;if(a(i,j)){O[q]=D[q];O[q+1]=D[q+1];O[q+2]=D[q+2];O[q+3]=255}else if(a(i-1,j)||a(i+1,j)||a(i,j-1)||a(i,j+1)){O[q]=30;O[q+1]=27;O[q+2]=46;O[q+3]=255}}x.putImageData(o,0,0)};
  if(it.p==="con"){const C=(typeof BALLC!=="undefined"&&BALLC[k])||["#f97316","#431407"];ring(8,8,6.5,C[0]);ring(6,6,2,shade(C[0],.35));for(let i=2;i<14;i++){P(C[1],i,8);P(C[1],8,i)}for(let j=3;j<14;j++){const d=Math.round(Math.sqrt(Math.max(0,25-(j-8)*(j-8))));P(C[1],8-d+ (j<8?0:0),j)}if(C[2])P(C[2],7,7,2,2)}
  else if(it.p==="fru"){if(/Banana/.test(k)){for(let i=0;i<10;i++){P("#facc15",3+i,10-Math.round(Math.sin(i/9*Math.PI)*4),2,3)}P("#713f12",2,9,2,2);P("#713f12",13,9,1,2)}else if(/Mirtilli/.test(k)){[[5,9],[9,9],[7,6],[11,6],[7,11]].forEach(([a,b])=>{ring(a,b,2.6,"#4f46e5");P("#a5b4fc",a-1,b-1)})}else if(/Arancia/.test(k)){ring(8,9,5.5,"#f97316");P("#fdba74",5,6,2,2);P("#15803d",8,2,3,2)}else{ring(5,11,3,"#dc2626");ring(11,11,3,"#dc2626");P("#fca5a5",4,10);P("#fca5a5",10,10);P("#166534",7,3,1,5);P("#166534",8,3,3,1);P("#166534",10,4,1,4)}}
  else if(it.p==="sch"){P("#92400e",3,2,10,13);P("#f8fafc",4,4,8,10);P("#9ca3af",6,1,4,2);const mv=MV[it.mv]||{};const tc=(TY[mv.t]||TY.BAS).c;P(tc,5,5,2,2);P(tc,9,10,2,2);P("#111827",7,6,1,1);P("#111827",8,7,1,2);P("#111827",9,9);P("#dc2626",9,5);P("#dc2626",10,6);P("#dc2626",10,4)}
  else if(it.p==="chi"){if(/Bici/.test(k)){ring(4,11,3.2,"#111827");ring(12,11,3.2,"#111827");ring(4,11,1.5,"#e5e7eb");ring(12,11,1.5,"#e5e7eb");P("#dc2626",4,7,8,2);P("#dc2626",8,7,2,4);P("#111827",11,5,3,1)}else if(/Canna/.test(k)){for(let i=0;i<12;i++)P("#92400e",2+i,13-i);P("#e5e7eb",13,2,1,9);P("#dc2626",12,11,3,2);P("#374151",3,11,3,3)}else if(/Mappa/.test(k)){P("#fef3c7",2,3,12,10);P("#86efac",3,4,4,4);P("#93c5fd",9,8,4,4);P("#d97706",7,5,1,6);P("#dc2626",10,4,2,2)}else{P("#f8fafc",2,4,12,9);P("#cbd5e1",2,4,12,1);for(let i=0;i<6;i++){P("#94a3b8",2+i,5+Math.floor(i/1.5));P("#94a3b8",13-i,5+Math.floor(i/1.5))}P("#dc2626",7,8,2,2)}}
  else if(it.p==="ogg"){if(/Polsino/.test(k)){P("#2563eb",3,5,10,6);P("#93c5fd",3,6,10,1);P("#f8fafc",3,8,10,1)}else if(/Ginocchiera/.test(k)){P("#111827",4,2,8,12);P("#374151",5,3,6,10);ring(8,8,2.5,"#6b7280")}else if(/Fascia/.test(k)){P("#ef4444",1,6,14,4);P("#fca5a5",1,7,14,1);P("#facc15",7,6,2,4)}else if(/Scarpe/.test(k)){P("#f8fafc",2,7,8,5);P("#f8fafc",8,9,6,3);P("#dc2626",4,8,4,1);P("#111827",2,12,12,2);P("#cbd5e1",10,9,1,1)}else if(/Fischietto/.test(k)){ring(10,9,3.5,/forte/.test(k)?"#facc15":"#9ca3af");P(/forte/.test(k)?"#facc15":"#9ca3af",2,7,7,3);P("#111827",10,8,2,2);P("#7c2d12",13,3,1,4);P("#7c2d12",12,2,2,1)}else{P("#16a34a",3,2,10,12);P("#bbf7d0",5,4,6,9);P("#16a34a",7,5,2,2);P("#16a34a",6,7,4,1);P("#16a34a",7,8,1,3);P("#16a34a",8,8,2,1)}}
  else{/* cure */if(/Borraccia/.test(k)){P("#38bdf8",5,4,6,10);P("#7dd3fc",6,5,1,8);P("#1e3a8a",6,2,4,2);P("#f8fafc",5,8,6,2)}else if(/Sali/.test(k)){P("#f472b6",4,3,8,10);P("#fbcfe8",5,4,2,8);P("#f8fafc",6,7,4,2)}else if(/Flebo/.test(k)){P("#e0f2fe",4,2,8,8);P("#7dd3fc",5,5,6,4);P("#94a3b8",7,10,2,1);P("#94a3b8",8,11,1,4)}else if(/Massaggio/.test(k)){P("#a16207",5,4,6,10);P("#facc15",6,6,4,6);P("#111827",6,2,4,2)}else if(/Ghiaccio/.test(k)){P("#bae6fd",3,4,10,9);P("#f0f9ff",4,5,3,3);P("#7dd3fc",3,12,10,1)}else if(/Caffè/.test(k)){P("#f8fafc",3,6,8,8);P("#78350f",4,6,6,2);P("#f8fafc",11,8,2,3);P("#cbd5e1",5,2,1,3);P("#cbd5e1",8,1,1,3)}else if(/Stretching/.test(k)){P("#a855f7",2,4,12,2);P("#a855f7",2,10,12,2);P("#c084fc",2,4,2,8);P("#c084fc",12,4,2,8)}else if(/Camomilla/.test(k)){P("#f8fafc",3,6,8,8);P("#bef264",4,6,6,2);P("#f8fafc",11,8,2,3);P("#facc15",6,10,2,2)}else if(/Fisioterapia/.test(k)){ring(8,8,5.5,"#f5f5f4");ring(8,8,2,"#d6d3d1");P("#ef4444",7,3,2,10);P("#ef4444",3,7,10,2)}else if(/Rientro/.test(k)){for(let j=0;j<16;j++)for(let i=0;i<16;i++){const dx=Math.abs(i-7.5),dy=j-7.5;if(dx+Math.abs(dy)*.9<6.5&&!(dy<-1&&dx<1.5))P("#facc15",i,j)}P("#fef9c3",6,5,2,2)}else if(/Bevanda/.test(k)){P("#22c55e",5,2,6,12);P("#bbf7d0",6,3,1,10);P("#111827",5,6,6,3);P("#facc15",7,7,2,1)}else if(/Integratore/.test(k)){const cc=/forza/.test(k)?"#ef4444":/tiro/.test(k)?"#f97316":/difesa/.test(k)?"#2563eb":"#14b8a6";P("#f8fafc",4,4,8,10);P(cc,4,7,8,4);P("#e5e7eb",5,2,6,2)}else if(/Caramella/.test(k)){P("#f472b6",5,5,6,6);P("#fbcfe8",6,6,2,2);P("#f472b6",2,6,2,4);P("#f472b6",12,6,2,4)}else if(/Pastiglia/.test(k)){P("#facc15",3,6,5,4);P("#f8fafc",8,6,5,4);P("#fef9c3",4,7,2,1)}else{ring(8,8,5,"#dc2626");P("#f8fafc",7,4,2,8);P("#f8fafc",4,7,8,2)}}
  out();ICONC[k]=c;return c};
const POCKICON={cur:"Borraccia",con:"Pallone",fru:"Arancia",ogg:"Scarpe nuove",sch:null,chi:"Bici"};
/* ---------- simboli dei tipi (8x8 pixel art): come foglia/fuoco/acqua, qui palla/ala/canestro… ---------- */
const TICONC={};
const TICON=t=>{if(TICONC[t])return TICONC[t];const[c,x]=cnv(8,8);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w||1,h||1);const C=(TY[t]||TY.BAS).c;
  if(t==="GUA"){/* palla che rimbalza con linee di movimento */P(C,2,1,4,1);P(C,1,2,6,4);P(C,2,6,4,1);P("#fff",3,2,1,1);P("#7f1d1d",4,1,1,6);P("#7f1d1d",1,4,6,1);P("#fca5a5",0,7,2,1);P("#fca5a5",6,7,2,1)}
  else if(t==="ALA"){/* ala spiegata */P(C,0,4,1,2);P(C,1,3,1,3);P(C,2,2,1,4);P(C,3,1,2,5);P(C,5,2,1,4);P(C,6,3,1,3);P(C,7,4,1,2);P("#bfdbfe",3,2,2,1);P("#1e3a8a",3,5,2,2)}
  else if(t==="CEN"){/* canestro con retina */P("#dc2626",1,1,6,1);P(C,0,2,8,1);P("#fff7ed",1,3,1,4);P("#fff7ed",6,3,1,4);P("#fff7ed",3,3,1,2);P("#fff7ed",4,3,1,2);P("#fff7ed",2,5,1,2);P("#fff7ed",5,5,1,2);P("#fff7ed",2,7,4,1)}
  else if(t==="TIR"){/* bersaglio */P(C,2,0,4,1);P(C,1,1,6,6);P(C,2,7,4,1);P("#fff",2,2,4,4);P(C,3,3,2,2)}
  else if(t==="DIF"){/* scudo */P(C,1,0,6,1);P(C,0,1,8,3);P(C,1,4,6,2);P(C,2,6,4,1);P(C,3,7,2,1);P("#cbd5e1",3,1,2,4)}
  else if(t==="REG"){/* lavagna tattica */P(C,0,0,8,8);P("#fff",1,1,6,6);P(C,2,2,1,1);P(C,5,5,1,1);P(C,3,3,2,1);P(C,4,2,1,1);P("#f0abfc",2,5,1,1)}
  else if(t==="ATL"){/* fulmine */P(C,4,0,2,1);P(C,3,1,2,1);P(C,2,2,3,1);P(C,1,3,5,1);P(C,3,4,3,1);P(C,2,5,3,1);P(C,2,6,2,1);P(C,1,7,2,1);P("#ccfbf1",3,3,1,1)}
  else{/* base: pallone grigio */P(C,2,1,4,1);P(C,1,2,6,4);P(C,2,6,4,1);P("#4b5563",4,1,1,6);P("#4b5563",1,4,6,1);P("#fff",2,2,1,1)}
  TICONC[t]=c;return c};
/* (1070) STILI ALTERNATIVI DEI MINI GIOCATORI (si sceglie quale usare) */
const PSTYLE={v:"mini"};
const hairColOf=s=>s.n==="Kristaps Porziņģis"||s.n==="Cooper Flagg"||s.n==="Matas Buzelis"?"#8a6a3a":s.skin<=1?"#7a5230":s.skin===2?"#3b2414":"#1a120c";
const headDraw=(P,s,hx,hy,hw,hh,back,sk,jc)=>{const skd=shade(sk,-.25),hc=hairColOf(s);P(shade(sk,-.45),hx-1,hy,hw+2,hh+1);P(sk,hx,hy+1,hw,hh-1);P(skd,hx,hy+hh-2,hw,1);P(skd,hx-1,hy+Math.round(hh*.4),1,3);P(skd,hx+hw,hy+Math.round(hh*.4),1,3);
  const ey=hy+Math.round(hh*.42),ex=Math.round(hw*.22);if(!back){P("#1f1410",hx+ex,ey,2,2);P("#1f1410",hx+hw-ex-2,ey,2,2);P("#fff",hx+ex,ey,1,1);P("#fff",hx+hw-ex-2,ey,1,1);P(shade(sk,-.4),hx+ex-1,ey-2,3,1);P(shade(sk,-.4),hx+hw-ex-2,ey-2,3,1);P(shade(sk,-.3),hx+(hw>>1)-1,ey+3,2,2);P("#7f1d1d",hx+(hw>>1)-2,ey+6,4,1)}
  const h=s.hair;if(h==="buzz")P(shade(hc,.15),hx,hy+1,hw,2);else if(h==="afro"){P(hc,hx-2,hy-3,hw+4,6);P(hc,hx-2,hy+2,2,4);P(hc,hx+hw,hy+2,2,4)}else if(h==="locs"||h==="braids"){P(hc,hx-1,hy-1,hw+2,4);for(let i=0;i<hw/2+1;i++)P(hc,hx-1+i*2,hy+2,1,back?hh-2:(i===0||i>=hw/2)?hh-4:2)}else if(h==="curly"){P(hc,hx-1,hy-2,hw+2,5);for(let i=0;i<hw/2;i++)P(shade(hc,.2),hx+i*2,hy-2,1,1)}else if(h==="long"){P(hc,hx-1,hy-1,hw+2,4);P(hc,hx-2,hy+2,3,hh-2);P(hc,hx+hw-1,hy+2,3,hh-2)}else{P(hc,hx-1,hy-1,hw+2,4);P(hc,hx-1,hy+2,2,2);P(hc,hx+hw-1,hy+2,2,2)}
  if(back)P(hc,hx,hy+2,hw,h==="buzz"?3:Math.round(hh*.45));if(s.band){P("#fff",hx-1,hy+3,hw+2,2);P(jc,hx+(hw>>1)-2,hy+3,4,2)}
  if(!back&&s.beard!=="none"){const by=hy+hh-4;if(s.beard==="stubble"){for(let i=0;i<hw-2;i+=2)P(shade(hc,.15),hx+1+i,by+1,1,1)}else if(s.beard==="short"){P(hc,hx,by,hw,2);P(hc,hx+1,by+2,hw-2,1);P("#7f1d1d",hx+(hw>>1)-2,by,4,1)}else{P(hc,hx-1,by-1,hw+2,3);P(hc,hx,by+2,hw,2);P(hc,hx+2,by+4,hw-4,1);P("#7f1d1d",hx+(hw>>1)-2,by,4,1);if(s.beard==="huge")P(hc,hx+1,by+5,hw-2,2)}}};
/* B · ATLETA: proporzioni vere, più alto e dettagliato */
const drawAtleta=(s,back,shiny)=>{const[c,x]=cnv(56,56);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w,h);const sk=SKIN[cl((s.skin||3)-1,0,4)],skd=shade(sk,-.25),jc=shiny?shade(s.col[0],.35):s.col[0],jt=s.col[1]||"#fff",jd=shade(jc,-.3);const big=s.build==="big",tall=s.build==="tall";const cx=28,sc=tall?1.08:1;
  const top=2,hw=9,hh=10,bw=big?16:13,ty=top+hh+2,th=15,ly=ty+th+6;
  /* gambe lunghe */P(sk,cx-5,ly+2,4,12);P(sk,cx+1,ly+2,4,12);P(skd,cx-2,ly+2,1,12);P("#f8fafc",cx-6,ly+12,5,2);P("#f8fafc",cx+1,ly+12,5,2);P("#111",cx-7,ly+14,7,3);P("#111",cx+1,ly+14,7,3);P(jc,cx-7,ly+14,7,1);P(jc,cx+1,ly+14,7,1);
  P(jd,cx-bw/2,ly-6,bw,9);P(jc,cx-bw/2+1,ly-6,bw-2,8);P(jt,cx-bw/2,ly,2,3);P(jt,cx+bw/2-2,ly,2,3);
  P(jd,cx-bw/2,ty,bw,th);P(jc,cx-bw/2+1,ty,bw-2,th-1);P(jt,cx-bw/2+2,ty,1,3);P(jt,cx+bw/2-3,ty,1,3);P(jt,cx-2,ty,4,1);
  const aw=big?5:4;P(sk,cx-bw/2-aw,ty+1,aw,th+3);P(sk,cx+bw/2,ty+1,aw,th+3);P(skd,cx-bw/2-1,ty+2,1,th);P(skd,cx+bw/2,ty+2,1,th);P(sk,cx-bw/2-aw,ty+th+4,aw,3);P(sk,cx+bw/2,ty+th+4,aw,3);if(s.band){P("#fff",cx-bw/2-aw,ty+th-1,aw,2);P("#fff",cx+bw/2,ty+th-1,aw,2)}
  x.fillStyle=jt;x.font="bold 8px monospace";x.textAlign="center";x.textBaseline="middle";x.fillText(String(s.num),cx,ty+th/2+(back?2:1));if(back){x.font="bold 4px monospace";x.fillText(s.short.toUpperCase().slice(0,8),cx,ty+3)}
  P(skd,cx-2,top+hh-1,4,3);headDraw(P,s,cx-(hw>>1)-0,top,hw+1,hh,back,sk,jc);x.fillStyle="rgba(0,0,0,.2)";x.beginPath();x.ellipse(cx,ly+17,13,2,0,0,7);x.fill();
  if(tall){const[c2,x2]=cnv(56,56);x2.drawImage(c,0,0,56,56,0,-2,56,58);return c2}return c};
/* C · CARTA: mezzo busto grande, si riconosce la faccia */
const drawBusto=(s,back,shiny)=>{const[c,x]=cnv(56,56);const P=(col,X,Y,w,h)=>px(x,col,X,Y,w,h);const sk=SKIN[cl((s.skin||3)-1,0,4)],skd=shade(sk,-.25),jc=shiny?shade(s.col[0],.35):s.col[0],jt=s.col[1]||"#fff",jd=shade(jc,-.3);
  const g=x.createLinearGradient(0,0,0,56);g.addColorStop(0,shade(jc,.55));g.addColorStop(1,shade(jc,.2));x.fillStyle=g;x.fillRect(4,4,48,48);P(shade(jc,-.4),4,4,48,1);P(shade(jc,-.4),4,51,48,1);P(shade(jc,-.4),4,4,1,48);P(shade(jc,-.4),51,4,1,48);
  P(sk,10,38,36,14);P(skd,10,38,2,14);P(skd,44,38,2,14);P(jd,16,36,24,16);P(jc,17,36,22,16);P(jt,16,36,24,2);P(jt,19,36,2,6);P(jt,35,36,2,6);x.fillStyle=jt;x.font="bold 9px monospace";x.textAlign="center";x.textBaseline="middle";x.fillText(String(s.num),28,46);
  P(skd,24,30,8,7);headDraw(P,s,17,8,22,24,back,sk,jc);if(back){x.fillStyle=jt;x.font="bold 5px monospace";x.fillText(s.short.toUpperCase().slice(0,9),28,40)}return c};
/* D · MINI: piccolissimi e tondi, stile portatile */
const drawMini=(s,back,shiny,jv)=>{jv=jv||PSTYLE.j||"mod";const[c0,x0]=cnv(28,28);const P=(col,X,Y,w,h)=>px(x0,col,X,Y,w,h);const C=jv==="90"?s.col90:s.col;const sk=SKIN[cl((s.skin||3)-1,0,4)],skd=shade(sk,-.25),jc=shiny?shade(C[0],.35):C[0],jt=C[1]||"#fff",j3=C[2]||jt,jd=shade(jc,-.3);const big=s.build==="big";const bx=big?5:6,bw=big?18:16;
  if(jv==="90"){/* anni 90: pantaloncini lunghi e larghi, bande laterali, gessato, bordo spesso */P("#f8fafc",8,25,5,2);P("#f8fafc",15,25,5,2);P("#111",8,26,5,1);P("#111",15,26,5,1);P(sk,9,23,3,2);P(sk,16,23,3,2);P(jd,6,18,16,6);P(jc,7,18,14,5);P(jt,6,18,2,6);P(jt,20,18,2,6);P(j3,13,18,2,4);P(jd,bx,11,bw,8);P(jc,bx+1,11,bw-2,7);for(let xx=bx+2;xx<bx+bw-1;xx+=3)P(shade(jc,-.18),xx,12,1,6);P(jt,bx,11,2,8);P(jt,bx+bw-2,11,2,8);P(j3,bx+2,11,bw-4,1);P(jt,12,11,4,1);P(jt,13,12,2,1);P(sk,big?3:4,12,2,6);P(sk,big?23:22,12,2,6);P("#fff",big?3:4,15,2,1);P("#fff",big?23:22,15,2,1)}
  else{/* moderna: pantaloncini sopra il ginocchio, finiture sottili */P("#111",8,25,5,2);P("#111",15,25,5,2);P(sk,9,21,3,4);P(sk,16,21,3,4);P(jd,7,18,14,4);P(jc,8,18,12,3);P(jt,7,18,1,4);P(jt,20,18,1,4);P(jd,bx,11,bw,8);P(jc,bx+1,11,bw-2,7);P(jt,bx,11,bw,1);P(sk,big?3:4,12,2,6);P(sk,big?23:22,12,2,6)}
  x0.fillStyle=jt;x0.font="bold 5px monospace";x0.textAlign="center";x0.textBaseline="middle";x0.fillText(String(s.num),14,15);
  headDraw(P,s,8,1,12,10,back,sk,jc);const[c,x]=cnv(56,56);x.imageSmoothingEnabled=false;x.drawImage(c0,0,0,28,28,0,0,56,56);return c};
const drawPlayerAny=(s,back,shiny,st)=>{st=st||PSTYLE.v;if(st==="chibi")return drawPlayer0(s,back,shiny);const key=st+(PSTYLE.j||"")+s.n+(back?"b":"f")+(shiny?"s":"");if(sprCache[key])return sprCache[key];const c=st==="mini90"?drawMini(s,back,shiny,"90"):st==="minimod"?drawMini(s,back,shiny,"mod"):(st==="atleta"?drawAtleta:st==="busto"?drawBusto:drawMini)(s,back,shiny);sprCache[key]=c;return c};

const drawPlayer=(s,back,shiny)=>drawPlayerAny(s,back,shiny);
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
  npcs:[{id:"kidb",x:14,y:15,spr:"kid",move:"wander",talk:["Dicono che nell erba alta ci siano giocatori che aspettano solo di essere catturati!"]},{id:"prof_block",x:8,y:2,spr:"none",flag:"!starter",trig:"profstop"}]},
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
  items:[{id:"r1a",x:17,y:1,it:"Borraccia"},{id:"r1b",x:3,y:23,it:"Pallone"},{id:"r1c",x:16,y:15,it:"Ghiaccio"}],
  npcs:[{id:"t_r1a",x:11,y:7,spr:"kid",dir:"left",trainer:{n:"RAGAZZO DEL CAMPETTO",party:"r1a",money:120,sight:4,pre:["Ehi! Mi alleno qui tutti i pomeriggi. Facciamo una sfida?"],lose:["Mi hai fatto il cucchiaio!"]}},
        {id:"t_r1b",x:3,y:18,spr:"girl",dir:"right",trainer:{n:"TIFOSA",party:"r1b",money:140,sight:4,pre:["Ho tutte le figurine della stagione! Vediamo i tuoi giocatori!"],lose:["La prossima volta porto la sciarpa portafortuna…"]}},
        {id:"old1",x:15,y:24,spr:"old",move:"turn",talk:["Ai miei tempi si giocava senza la linea da tre!","Porta il giocatore selvatico in zona rossa o gialla prima di lanciare il Pallone: sfinito si cattura molto più facilmente!"]}]},
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
const auInit=()=>{if(AU.ac)return;try{AU.ac=new (window.AudioContext||window.webkitAudioContext)();AU.mgM=AU.ac.createGain();AU.mgS=AU.ac.createGain();AU.mgM.gain.value=.26*.75;AU.mgS.gain.value=.4*.75;AU.mgM.connect(AU.ac.destination);AU.mgS.connect(AU.ac.destination);AU.mg=AU.mgS;try{applyVol()}catch(e){}}catch(e){}};
const note=(f,t,d,type,g)=>{const ac=AU.ac;if(!ac)return;const o=ac.createOscillator(),gg=ac.createGain();o.type=type||"square";o.frequency.value=f;gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(g||.12,t+.01);gg.gain.setValueAtTime(g||.12,t+d*.7);gg.gain.linearRampToValueAtTime(0,t+d*.95);o.connect(gg);gg.connect(AU.mg);o.start(t);o.stop(t+d)};
const midi=n=>440*Math.pow(2,(n-69)/12);
const SONG={};const mkSong=(id,seed,root,scale,bpm,mood)=>{const r_=sR(seed);const sc=scale;const bars=8,steps=bars*8;const mel=[],bas=[];let deg=0;const motif=[];for(let i=0;i<8;i++){deg=cl(deg+[-2,-1,0,1,1,2,3,-3][Math.floor(r_()*8)],-3,9);motif.push(r_()<.18?null:deg)}
  for(let b=0;b<bars;b++){const tr=[0,2,-1,0,3,2,4,0][b%8]+(mood==="battle"?0:0);for(let s=0;s<8;s++){let d=motif[(s+(b%2?0:0))%8];if(b%4===3&&s>=6)d=s===6?tr+2:null;mel.push(d==null?null:d+tr+(b>=4&&r_()<.25?(r_()<.5?1:-1):0))}const chord=[0,3,4,0,5,3,4,0][b%8];for(let s=0;s<8;s++)bas.push(s%2===0||mood==="battle"?chord:null)}
  SONG[id]={root,sc,bpm,mel,bas,mood}};
const SCM=[0,2,4,5,7,9,11],SCm=[0,2,3,5,7,8,10],SCp=[0,2,4,7,9];
const deg2=(sc,root,d)=>{const o=Math.floor(d/sc.length),k=((d%sc.length)+sc.length)%sc.length;return root+o*12+sc[k]};
mkSong("title",11,72,SCM,104);mkSong("town",23,72,SCp,96);mkSong("home",31,69,SCM,84);mkSong("lab",41,67,SCM,100);mkSong("route",53,74,SCM,120);mkSong("city",67,72,SCM,108);mkSong("center",79,76,SCp,92);mkSong("battle",97,69,SCm,150,"battle");mkSong("trainer",113,71,SCm,156,"battle");mkSong("rival",131,70,SCm,160,"battle");mkSong("win",137,76,SCM,140);mkSong("forest",151,67,SCm,96);mkSong("cave",163,62,SCm,84);mkSong("sea",173,74,SCp,112);mkSong("gym",181,70,SCm,132,"battle");
const playMus=id=>{if(!AU.ac||!AU.on){AU.want=id;return}if(AU.cur===id)return;AU.cur=id;clearTimeout(AU.timer);const S=SONG[id];if(!S)return;const st=60/S.bpm/2;let i=0;let t0=AU.ac.currentTime+.05;
  const sched=()=>{if(AU.cur!==id)return;while(t0<AU.ac.currentTime+.4){const k=i%S.mel.length;const m=S.mel[k],b=S.bas[k];AU.mg=AU.mgM;if(m!=null)note(midi(deg2(S.sc,S.root,m)),t0,st*.95,"square",.07);if(b!=null)note(midi(deg2(S.sc,S.root-24,b)),t0,st*(S.mood==="battle"?.6:1.7),"triangle",.13);if(S.mood==="battle"&&k%2===0)note(midi(deg2(S.sc,S.root+12,(m||0)+2)),t0,st*.4,"square",.025);t0+=st;i++}AU.mg=AU.mgS;AU.timer=setTimeout(sched,120)};sched()};
const stopMus=()=>{AU.cur=null;clearTimeout(AU.timer)};
/* suoni dei colpi in lotta: fruscio del gesto + impatto, più forte se superefficace */
const nz=(t,d,f0,f1,q,g,type)=>{const ac=AU.ac;if(!ac)return;const len=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,len,ac.sampleRate),c=b.getChannelData(0);for(let i=0;i<len;i++)c[i]=(Math.random()*2-1)*(1-i/len);const n=ac.createBufferSource();n.buffer=b;const fl=ac.createBiquadFilter();fl.type=type||"bandpass";fl.Q.value=q||1;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+d);const gg=ac.createGain();gg.gain.setValueAtTime(g,t);gg.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(fl);fl.connect(gg);gg.connect(AU.mg);n.start(t);n.stop(t+d)};
const thump=(t,f0,f1,d,g)=>{const ac=AU.ac;if(!ac)return;const o=ac.createOscillator(),gg=ac.createGain();o.type="sine";o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);gg.gain.setValueAtTime(g,t);gg.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gg);gg.connect(AU.mg);o.start(t);o.stop(t+d)};
const MVSND={GUA:"swish",ALA:"swish",TIR:"shot",CEN:"slam",DIF:"block",REG:"pass",ATL:"slam",BAS:"swish"};
const SFX={cast:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;nz(t,.3,1200,4000,2,.18);note(880,t+.32,.06,"sine",.05);nz(t+.34,.18,300,1200,1.5,.25)},
 bite:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[0,.13,.26].forEach(d=>{thump(t+d,500,200,.08,.4);note(660,t+d,.05,"square",.06)})},
 step:k=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;if(k==="grass")nz(t,.07,900,2500,1.5,.08);else if(k==="sand")nz(t,.06,500,1500,1,.07);else if(k==="wood")thump(t,320,140,.05,.16);else if(k==="water")nz(t,.12,600,1800,1.2,.08);else thump(t,260,120,.045,.12)},
 bike:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(1500,t,.025,"square",.025);note(1900,t+.03,.02,"square",.02)},
 bikeBell:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(2093,t,.12,"sine",.08);note(2637,t+.15,.18,"sine",.07)},
 surf:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;nz(t,.35,300,1400,.8,.1)},
 jump:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(300,t,.06,"square",.05);note(500,t+.06,.06,"square",.05);thump(t+.22,200,80,.1,.25)},
 moveHit:(ty,k)=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;k=k||1;const kind=MVSND[ty]||"swish";
  if(kind==="shot"){note(660,t,.06,"triangle",.07);note(990,t+.05,.08,"triangle",.06);nz(t+.05,.25,3000,6000,2,.12,"highpass")}
  else if(kind==="pass"){nz(t,.12,800,2500,3,.25);note(523,t+.08,.05,"square",.05)}
  else if(kind==="block"){nz(t,.08,300,900,2,.3);thump(t+.04,220,60,.18,.5)}
  else{nz(t,.16,400,2400,2.5,.35)}
  const ti=t+.13;thump(ti,kind==="slam"?150:120,kind==="slam"?35:50,kind==="slam"?.3:.18,.55*k);nz(ti,.12,1800,300,.8,.35*k,"lowpass");
  if(k>1.1){nz(ti+.02,.18,4000,1200,1,.25,"bandpass");thump(ti+.12,180,45,.22,.45);note(1568,ti+.05,.05,"square",.04)}
  if(k<.9)nz(ti,.08,600,300,1,.12,"lowpass")},
 statUp:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[523,659,784,1047].forEach((f,i)=>note(f,t+i*.06,.07,"square",.06))},
 statDown:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[784,659,523,392].forEach((f,i)=>note(f,t+i*.06,.07,"square",.06))},
 miss:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;nz(t,.25,2500,500,2,.25)},sel:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(1320,t,.05,"square",.08)},bump:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(110,t,.08,"square",.1)},
  hit:k=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;const n=AU.ac.createBufferSource(),b=AU.ac.createBuffer(1,4000,22050),d=b.getChannelData(0);for(let i=0;i<4000;i++)d[i]=(Math.random()*2-1)*(1-i/4000);n.buffer=b;const g=AU.ac.createGain();g.gain.value=.25*(k||1);n.connect(g);g.connect(AU.mg);n.start(t)},
  heal:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[72,76,79,84,79,84].forEach((m,i)=>note(midi(m),t+i*.13,.12,"square",.08))},
  lvl:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[72,74,76,77,79].forEach((m,i)=>note(midi(m),t+i*.07,.07,"square",.08))},
  shake:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;/* oscillazione: toc-toc del pallone */thump(t,260,120,.09,.35);note(330,t,.05,"square",.06);thump(t+.12,220,100,.08,.3);note(262,t+.12,.05,"square",.05)},
 throwB:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;nz(t,.35,600,3000,2,.25);note(523,t+.3,.06,"triangle",.07)},
 absorb:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[1047,880,698,523,392].forEach((f,i)=>note(f,t+i*.04,.05,"square",.06));thump(t+.22,200,80,.12,.4)},
 breakOut:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;nz(t,.2,800,4000,1,.35);[392,523,659].forEach((f,i)=>note(f,t+.05+i*.05,.06,"square",.07))},
 /* mosse di stato: suono diverso per ognuna */
 stSleep:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[784,659,523,440,392].forEach((f,i)=>note(f,t+i*.12,.14,"triangle",.07))},
 stConf:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;for(let i=0;i<8;i++)note(i%2?660:520+i*20,t+i*.06,.06,"sine",.08)},
 stPar:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;for(let i=0;i<6;i++){note(1200+((i*397)%600),t+i*.04,.03,"sawtooth",.05)}nz(t,.25,3000,1500,4,.15)},
 stProt:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(392,t,.2,"square",.06);note(523,t+.05,.2,"square",.06);note(784,t+.1,.3,"triangle",.07)},
 fail:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(196,t,.12,"square",.07);note(165,t+.12,.18,"square",.07)},
  catch:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;/* fanfara felice di cattura */thump(t,180,60,.1,.4);const M=[[72,0,.12],[76,.12,.12],[79,.24,.12],[84,.36,.3],[79,.72,.1],[84,.84,.5]];M.forEach(([m,d,l])=>{note(midi(m),t+.15+d,l,"square",.09);note(midi(m-12),t+.15+d,l,"triangle",.07)});[1568,2093].forEach((f,i)=>note(f,t+1.2+i*.08,.08,"square",.04))},
  faint:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;for(let i=0;i<8;i++)note(400-i*40,t+i*.05,.05,"square",.06)},
  item:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;[79,84,88].forEach((m,i)=>note(midi(m),t+i*.09,.09,"square",.08))},
  ledge:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(500,t,.06,"square",.06);note(700,t+.06,.06,"square",.06)},
  door:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(220,t,.05,"triangle",.15);note(180,t+.06,.05,"triangle",.15)},
  alert:()=>{const t=AU.ac&&AU.ac.currentTime;if(!t)return;note(988,t,.08,"square",.09);note(1319,t+.09,.12,"square",.09)}};
/* ---------- STATO DELLA PARTITA ---------- */
let G=null;const SAVEK="dl_pdream_save";
const save=()=>{if(!G)return;try{localStorage.setItem(SAVEK,JSON.stringify(G))}catch(e){}};
const OLDBALL={"Contratto":"Pallone","Contratto Pro":"Super Pallone","Contratto Max":"Iper Pallone","Contratto Rookie":"Pallone Vivaio","Contratto Veterano":"Pallone Timer"};const loadSave=()=>{try{const s=JSON.parse(localStorage.getItem(SAVEK)||"null");if(!(s&&s.v===1))return null;/* vecchi salvataggi: i contratti diventano palloni */Object.entries(OLDBALL).forEach(([o,n])=>{if(s.bag&&s.bag[o]){s.bag[n]=(s.bag[n]||0)+s.bag[o];delete s.bag[o]}});return s}catch(e){return null}};
const newGame=(name,team)=>({v:1,name:name||"COACH",team,map:"casa2",x:3,y:3,dir:"down",party:[],box:[],bag:{"Borraccia":1},money:3000,flags:{},seen:{},caught:{},badges:[],time:0,rep:0,opts:{text:1},items:{}});
/* ---------- MOTORE: schermo, comandi, mappa, dialoghi, menu ---------- */
let host,cv,cx,ui,ux,SC=3,VW=240,VH=160,OX=0,OY=0,CTRLU=0,MENUY=30,raf=0,alive=false,last=0;const KEY={};
const OBJ_SOLID={stairs:0,table:1,tv:1,shelf:1,plant:1,bed:1,pc:1,console:1,desk3:1,counter:1,bench:1};
let M=null,MK=null;/* mappa corrente */const PL={x:0,y:0,px:0,py:0,dir:"down",mv:0,fr:0,from:null,jump:0,run:false};
let NPCS=[];let mode="title",lock=false;const peopleSpr={};
const sprFor=(k,col)=>{if(k==="leader"){const kk="leader"+col;if(!peopleSpr[kk])peopleSpr[kk]=heroSheet({hairc:"#111827",shirt:col||"#7c3aed",pants:"#111827",coat:0,cap:0});return peopleSpr[kk]}if(peopleSpr[k])return peopleSpr[k];const T=TEAM();const D={hero:{cap:1,capc:T.cap,logo:1,logoc:T.capt,shirt:"#1f2937",pants:"#334155",kind:"trainer",bag:1,hs:HEROHS},rival:{cap:1,capc:RIVT().cap,logo:1,logoc:RIVT().capt,shirt:"#7f1d1d",pants:"#1f2937",kind:"trainer",hairc:"#111827"},mom:{hairc:"#7c2d12",long:1,shirt:"#db2777",pants:"#60a5fa"},prof:{white:1,coat:1,shirt:"#475569",pants:"#334155",skin:"#eac39a"},aide:{hairc:"#1f2937",coat:1,shirt:"#0ea5e9"},kid:{cap:1,capc:"#16a34a",shirt:"#f97316",pants:"#1e3a8a"},girl:{hairc:"#a16207",long:1,shirt:"#a855f7",pants:"#f1f5f9"},old:{white:1,shirt:"#78716c",pants:"#57534e",skin:"#e8b98f"},nurse:{hairc:"#be185d",long:1,shirt:"#fda4af",coat:1},clerk:{hairc:"#111827",shirt:"#2563eb",pants:"#1e3a8a"},guard:{cap:1,capc:"#1e3a8a",shirt:"#1e40af",pants:"#111827"}}[k]||{};peopleSpr[k]=heroSheet(D);return peopleSpr[k]};
let HEROHS="MIX";let TEAMS_={},TEAM=()=>TEAMS_[G.team]||{cap:"#facc15",capt:"#111",nick:"Coach"},RIVT=()=>TEAMS_[G.flags.rivTeam]||{cap:"#ef4444",capt:"#fff",nick:"Rivali"};
const tileAt=(x,y)=>{if(!M||y<0||y>=M.rows.length||x<0||x>=M.rows[0].length)return null;const md=G&&G.mods&&G.mods[MK];if(md){const v=md[x+","+y];if(v)return v}return M.rows[y][x]};
const setMod=(x,y,c)=>{G.mods=G.mods||{};(G.mods[MK]=G.mods[MK]||{})[x+","+y]=c};
const bldAt=(x,y)=>(M.blds||[]).find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);
const objAt=(x,y)=>(M.objs||[]).find(o=>x>=o.x&&x<o.x+(o.w||(o.k==="bed"?1:o.k==="desk3"?3:o.k==="table"?2:1))&&y>=o.y&&y<o.y+(o.k==="bed"?2:o.k==="table"?2:1));
const npcAt=(x,y)=>NPCS.find(n=>n.vis&&n.x===x&&n.y===y&&(n.spr!=="none"||n.legend));
const solid=(x,y)=>{const t=tileAt(x,y);if(t==null)return true;if("TR#SXY_boJ".includes(t))return true;if(t==="~"&&!G.surf)return true;if(G.surf&&t!=="~"&&!PL.landing)return true;if(bldAt(x,y))return true;const o=objAt(x,y);if(o&&OBJ_SOLID[o.k])return true;if(npcAt(x,y))return true;const it=(M.items||[]).find(i=>!G.items[i.id]&&i.x===x&&i.y===y);if(it)return true;return false};
const flagOk=f=>{if(!f)return true;if(f.includes("&"))return f.split("&").every(flagOk);if(f[0]==="!")return!G.flags[f.slice(1)];return!!G.flags[f]};
const loadMap=(k,x,y,dir)=>{M=MAPS[k];MK=k;G.map=k;if(M.blds&&M.blds.some(b=>b.k==="center"))G.flags["vis_"+k]=1;if(M.inside||(M.rows[y]&&M.rows[y][x]!=="~"))G.surf=0;PL.x=PL.px=x;PL.y=PL.py=y;if(dir)PL.dir=dir;PL.mv=0;NPCS=(M.npcs||[]).map(n=>({...n,ox:n.x,oy:n.y,dir:n.dir||"down",px:n.x,py:n.y,mv:0,t:rnd()*2,vis:flagOk(n.flag)}));if(G.badges.length>=8)G.flags.allbadges=1;NPCS.forEach(n=>{const s=G.flags["pos_"+n.id];if(s){n.x=n.px=s[0];n.y=n.py=s[1]}});playMus(M.mus||"route");G.x=x;G.y=y;try{roamStep()}catch(e){}save();if(M.n&&!M.inside)banner(M.n)};
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
  /* uscita dal bordo verso la mappa vicina */if(!M.inside&&(nx<0||ny<0||ny>=M.rows.length||nx>=M.rows[0].length)){const dd=ny<0?"n":ny>=M.rows.length?"s":nx<0?"w":"e";const E_=M.ex&&M.ex[dd];if(E_&&E_.to){if(E_.only&&!G.flags[E_.only]){PL.dir={n:"down",s:"up",w:"right",e:"left"}[dd];say(E_.msg||"Una frana blocca il passaggio. Forse un giorno si potrà entrare…");return}const T=MAPS[E_.to];if(!T){SFX.bump();return}let back=null,bd=null;Object.entries(T.ex||{}).forEach(([k,v])=>{if(v.to===MK){back=v;bd=k}});if(!back&&T.links){/* vecchie mappe */const k2={n:"s",s:"n",e:"w",w:"e"}[dd];bd=k2;back={x:T.ex&&T.ex[k2]&&T.ex[k2].x!=null?T.ex[k2].x:(dd==="n"||dd==="s"?PL.x:0),y:0}}if(!back){SFX.bump();return}const off=(dd==="n"||dd==="s")&&(bd==="n"||bd==="s")?cl(PL.x-E_.x,0,1):(dd==="e"||dd==="w")&&(bd==="e"||bd==="w")?cl(PL.y-E_.y,0,1):0;const TW=T.rows[0].length,TH=T.rows.length;let tx,ty;if(bd==="n"){tx=back.x+off;ty=0}else if(bd==="s"){tx=back.x+off;ty=TH-1}else if(bd==="w"){tx=0;ty=back.y+off}else{tx=TW-1;ty=back.y+off}fade(()=>loadMap(E_.to,tx,ty,dir));return}const L=M.links&&M.links[dd];if(L){const T=MAPS[L.to];let tx=nx+L.dx,ty=ny<0?T.rows.length-1:ny>=M.rows.length?0:ny;if(nx<0)tx=T.rows[0].length-1;if(nx>=M.rows[0].length)tx=0;loadMap(L.to,tx,ty,dir);return}SFX.bump();return}
  /* porte degli edifici */const b=bldAt(nx,ny);if(b&&dir==="up"&&b.door!=null&&nx===b.x+b.door&&ny===b.y+b.h-1){if(b.need&&!G.flags[b.need]){say(b.needMsg||"La porta è chiusa.");return}if(b.to==="gymshut"){say(["La porta è chiusa.","«Il capo palestra è in trasferta con la squadra. Torna più avanti!»"]);return}SFX.door();fade(()=>loadMap(b.to,b.tx,b.ty,"up"));return}
  /* uscita dalle case */if(M.exit&&dir==="down"&&PL.x===M.exit.x&&PL.y===M.exit.y){SFX.door();fade(()=>loadMap(M.exit.to,M.exit.tx,M.exit.ty,"down"));return}
  const t=tileAt(nx,ny);if(t==="o"&&POWER("FORZA")){const bx=nx+dx,by=ny+dy,bt=tileAt(bx,by);if(bt&&".:C\"".includes(bt)&&!npcAt(bx,by)){setMod(nx,ny,M.cave?"C":":");setMod(bx,by,"o");SFX.bump();say("Con FORZA sposti il masso!");return}}
  if(G.surf&&t!=="~"&&t!=null&&!solidLand(nx,ny)){G.surf=0;PL.from=[PL.x,PL.y];PL.x=nx;PL.y=ny;PL.mv=1;PL.jump=0;PL.len=1;return}
  if(t==="L"){if(dir==="down"&&!solid(nx,ny+1)){PL.from=[PL.x,PL.y];PL.x=nx;PL.y=ny+1;PL.mv=1;PL.jump=1;PL.len=2;SFX.jump();return}SFX.bump();return}
  if(solid(nx,ny)){if(!PL.bumpT){SFX.bump();PL.bumpT=.25}return}PL.from=[PL.x,PL.y];PL.x=nx;PL.y=ny;PL.mv=1;PL.jump=0;PL.len=1};
const stepDone=()=>{G.time+=0;{const tt=tileAt(PL.x,PL.y);if(G.surf)SFX.surf();else if(G.bike)SFX.bike();else SFX.step(tt==='"'?"grass":tt===":"||tt==="s"?"sand":tt==="f"||tt==="k"||tt==="m"?"wood":"ground")}const o=objAt(PL.x,PL.y);if(o&&o.k==="stairs"){SFX.door();fade(()=>loadMap(o.to,o.tx,o.ty,"left"));return}
  if(M.exit&&PL.x===M.exit.x&&PL.y===M.exit.y&&PL.dir==="down"){SFX.door();fade(()=>loadMap(M.exit.to,M.exit.tx,M.exit.ty,"down"));return}
  if(MK==="borgo"&&PL.y<=1&&!G.flags.starter){profStop();return}
  if(G.rep>0){G.rep--;if(G.rep===0)say("L effetto del fischietto è finito.")}
  if(checkTrainers())return;
  const tt=tileAt(PL.x,PL.y);if(M.enc&&G.party.length&&G.rep<=0){if(tt==='"'&&rnd()<(ENC[M.enc].rate||.1)){wildBattle(M.enc);return}if(M.cave&&tt==="C"&&rnd()<.07){wildBattle(M.enc);return}if(G.surf&&tt==="~"&&rnd()<.07){wildBattle(ENC[M.enc+"_s"]?M.enc+"_s":"fish");return}}
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
  const t=tileAt(x,y);if(t==="J"){const key="fruit_"+MK+"_"+x+"_"+y;if(G.flags[key]===todayKey())return say("L albero oggi non ha più frutti. Torna domani!");G.flags[key]=todayKey();const f=pick(["Banana","Arancia","Mirtilli","Ciliegie"]);addItem(f,1);SFX.item();return say([`Scuoti l albero… cade: ${f}!`,"Domani ne crescerà un altro."])}if(t==="b"){if(POWER("TAGLIO"))return yesno("Un cespuglio. Vuoi usare TAGLIO?",ok=>{if(ok){setMod(x,y,".");SFX.item()}});return say("Un cespuglio fitto. Forse con una medaglia si può tagliare.")}if(t==="o")return say(POWER("FORZA")?"Un masso: camminaci contro per spingerlo con FORZA.":"Un masso enorme. Serve molta FORZA per spostarlo.");
  if(t==="~"&&!G.surf){if(POWER("NUOTO"))return yesno("L acqua è calma. Vuoi NUOTARE?",ok=>{if(ok){G.surf=1;PL.from=[PL.x,PL.y];PL.x=x;PL.y=y;PL.mv=1;PL.len=1;PL.jump=0}});if(hasRod()){fish();return}return say("L acqua è profonda. Serve il potere NUOTO.")}if(t==="~"&&G.surf&&hasRod()){fish();return}};
const solidLand=(x,y)=>{const t=tileAt(x,y);if(t==null)return true;if("TR#SXY_bo~J".includes(t))return true;if(bldAt(x,y)||npcAt(x,y))return true;return false};
const hasRod=()=>G.bag["Super canna"]?3:G.bag["Canna buona"]?2:G.bag["Canna da pesca"]?1:0;
/* pesca: la canna migliore pesca giocatori più forti e di livello più alto; a volte non abbocca nessuno */
const fish=()=>{const r=hasRod();SFX.cast();say(["Lanci la lenza…","…"],()=>{if(rnd()<(r===1?.35:r===2?.22:.1)){SFX.fail();return say("Niente… non abbocca nessuno.")}SFX.bite();say("Abbocca qualcuno!",()=>{const base=ENC[M.enc+"_s"]?M.enc+"_s":"fish";const tab=ENC[base];if(!tab)return;const key="__rod"+r+"_"+base;if(!ENC[key]){const srt=SP.slice().sort((a,b)=>a.val-b.val);const water=srt.filter(s=>s.role==="C"||s.t.includes("TIR")||s.t.includes("ATL"));const n=water.length,lo=r===1?0:r===2?Math.floor(n*.25):Math.floor(n*.5),hi=r===1?Math.floor(n*.35):r===2?Math.floor(n*.7):n;const L0=tab.list.reduce((a,e)=>Math.min(a,e[1]),99),L1=tab.list.reduce((a,e)=>Math.max(a,e[2]),0);ENC[key]={rate:1,list:water.slice(lo,hi).filter(s=>s.val<=2400).map(s=>[s.n,L0+(r-1)*4,L1+(r-1)*6,RARW(s.val)])}}wildBattle(ENC[key].list.length?key:base)})})};
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
  say([`{N} ha scelto ${s.n}!`,`VITO: «Allora io prendo ${SPX[rv].n}! È perfetto contro il tuo.»`,"VITO: «Prof, posso fare una sfida subito? Dai {N}, vediamo chi è più bravo!»"],()=>{trainerBattle({id:"rival1",trainer:{n:"RIVALE VITO",party:[[rv,5]],money:300,pre:[],lose:["VITO: «Cosa?! Ho scelto quello sbagliato…»"],win:["VITO: «Sì! Sono il più forte!»"],rival:1}},(won)=>{G.flags.rivaldone=1;healAll();say([won?"PROF. PARQUET: «Bella partita! Ora tieni anche questi.»":"PROF. PARQUET: «Non importa, si impara anche perdendo. Ecco, tieni questi.»","{N} ha ricevuto 5 Palloni, lo SCHEDARIO e la MAPPA DELLA REGIONE!","«Lo SCHEDARIO registra ogni giocatore che vedi e che metti sotto contratto. Riempilo tutto!»","VITO: «Io vado a Canestropoli! Ci vediamo, lumaca!»"],()=>{addItem("Pallone",5);addItem("Mappa della regione",1);G.flags.dex=1;NPCS.forEach(q=>{if(q.id==="rival")q.vis=false});save()})})})})};
const yesno=(q,cb)=>{say(q,()=>menu([["SÌ",()=>cb(true)],["NO",()=>cb(false)]],{small:1,onB:()=>cb(false)}))};
const talkTo=n=>{const fp={up:"down",down:"up",left:"right",right:"left"}[PL.dir];if(n.spr!=="none")n.dir=fp;if(n.legend){const s=SPX[n.legend];if(!s)return;return say([`È ${s.n}!`,"Un giocatore leggendario si sta allenando da solo, lontano da tutti…","Ti guarda negli occhi: vuole sfidarti!"],()=>{const m=mkMon(s.n,n.lv);G.seen[m.sp]=1;playMus("rival");startBattle({wild:m,mus:"rival",legend:1,cb:w=>{if(w||G.caught[m.sp]){G.flags["leg_"+s.i]=1;n.vis=false}else say(`${s.n} è ancora lì. Torna quando sei pronto.`)}})})}
  if(n.trainer){if(G.flags["tr_"+n.id]&&!n.trainer.rematch)return say(n.trainer.after||n.trainer.lose);return say(n.trainer.pre,()=>trainerBattle(n))}
  if(n.talk==="mom"){if(!G.flags.starter)return say(["MAMMA: «{N}! Il PROF. PARQUET ti cercava. Passa dal laboratorio, è quello grande col tetto grigio.»"]);healAll();SFX.heal();return say(["MAMMA: «Sei stanco? Riposati un attimo…»","La squadra è di nuovo in forma!"])}
  if(n.talk==="prof"){if(!G.flags.starter)return labIntro();const c=Object.keys(G.caught).length,s=Object.keys(G.seen).length;return say([`PROF. PARQUET: «Il tuo SCHEDARIO: ${s} visti, ${c} catturati.»`,c<5?"«Vai nell erba alta del Percorso 1: indebolisci i giocatori e poi offri un contratto!»":"«Ottimo lavoro, continua così!»"])}
  if(n.talk==="rival")return say(["VITO: «Muoviti! Il prof ci aspetta!»"]);
  if(n.talk==="nurse")return say(["«Benvenuto al CENTRO CURA. Vuoi che rimettiamo in forma la tua squadra?»"],()=>menu([["SÌ",()=>{healAll();SFX.heal();G.flags.lastHeal=MK;say(["…","Ecco fatto! La tua squadra è in piena forma.","Torna quando vuoi!"])}],["NO",()=>say("Torna quando vuoi!")]],{small:1}));
  if(n.talk==="pc")return pcMenu();
  if(n.talk==="ldoor"){const i=+MK.slice(2);if(!G.flags["tr_elite"+(i-1)])return say("La porta è chiusa. Prima devi vincere la sfida di questa sala.");if(i>=5)return;return fade(()=>loadMap("lg"+(i+1),4,10,"up"))}
  if(n.talk==="lotto"){if(G.flags.lotto===todayKey())return say("LOTTERIA: «Hai già giocato oggi! Torna domani.»");return say(["LOTTERIA: «Un biglietto al giorno, gratis! Se le ultime cifre del numero di maglia di un tuo giocatore escono, vinci!»","«Estrazione…»"],()=>{G.flags.lotto=todayKey();const n_=ri(0,99);const hit=G.party.concat(G.box).filter(m=>SPX[m.sp]&&SPX[m.sp].num%100===n_);const nums=new Set(G.party.concat(G.box).map(m=>SPX[m.sp]&&SPX[m.sp].num%10));if(hit.length){addItem("Integratore PP",1);SFX.catch();return say([`«È uscito il ${n_}! Il numero di ${MN(hit[0])}!»`,"«Primo premio: INTEGRATORE PP!»"])}if(nums.has(n_%10)){addItem("Rientro completo",1);SFX.item();return say([`«È uscito il ${n_}: l ultima cifra combacia!»`,"«Premio: RIENTRO COMPLETO!»"])}return say([`«È uscito il ${n_}… niente, mi spiace!»`,"«Ritenta domani!»"])})}if(n.talk==="tutor"){return say(["ALLENATORE DELLE MOSSE: «Ogni giocatore ha mosse che ha dimenticato o saltato.»","«Dimmi a chi vuoi far ripassare una mossa: gratis, per amore del basket!»"],()=>menu(G.party.map(m=>[MN(m),()=>{const kn=SPX[m.sp].learn.filter(q=>q[0]<=m.lv).map(q=>q[1]).filter(n_=>!m.moves.some(x=>x.n===n_));const uniq=[...new Set(kn)];if(!uniq.length)return say(`${MN(m)} conosce già tutto quello che può imparare al suo livello.`);menu(uniq.map(n_=>[n_,()=>{MENU=null;learnChain(m,[n_],()=>say("«Bravo! Torna quando vuoi.»"))}]),{title:"QUALE MOSSA?",info:i=>moveInfo(uniq[i]),onB:()=>{}})}]),{title:"CHI RIPASSA?",party:1,onB:()=>{}}))}if(n.talk==="shop"){SHOPCUR=n.shop||null;return shopMenu(n.greet)}
  if(n.gift){if(G.flags["gift_"+n.id])return say(n.after||["Pescare è rilassante, vero?","Usa la canna davanti all acqua con il tasto A."]);return say(n.talk,()=>{G.flags["gift_"+n.id]=1;addItem(n.gift,n.giftQ||1);SFX.item();say([`{N} ha ricevuto: ${n.gift}${(n.giftQ||1)>1?" ×"+n.giftQ:""}!`].concat(n.after||["Usala davanti all acqua: dal lago escono giocatori che nell erba non ci sono."]))})}
  say(n.talk)};
/* ---------- CENTRO: PC con il deposito ---------- */
const pcMenu=()=>{const lst=(arr,title,cb)=>menu(arr.map((m,i)=>[`${MN(m)} Lv${m.lv}`,()=>cb(m,i)]),{title,party:arr===G.party?1:0,pcbox:arr===G.box?1:0,onB:()=>pcMenu()});
  menu([["DEPOSITA UN GIOCATORE",()=>{if(G.party.length<=1)return say("Devi tenere almeno un giocatore in squadra!");lst(G.party,"DEPOSITA",(m,i)=>{G.box.push(G.party.splice(i,1)[0]);SFX.item();say(`${MN(m)} è nel deposito.`,()=>pcMenu())})}],
    ["RITIRA UN GIOCATORE",()=>{if(!G.box.length)return say("Il deposito è vuoto.");if(G.party.length>=6)return say("La squadra è piena (6).");lst(G.box,`RITIRA · nel deposito: ${G.box.length}`,(m,i)=>{G.party.push(G.box.splice(i,1)[0]);SFX.item();say(`${MN(m)} torna in squadra.`,()=>pcMenu())})}],
    ["GUARDA IL DEPOSITO",()=>{if(!G.box.length)return say("Il deposito è vuoto.");lst(G.box,`DEPOSITO · ${G.box.length} giocatori`,(m,i)=>menu([["SCHEDA",()=>{SUMM={m,i};menu([["CHIUDI",()=>{SUMM=null;pcMenu()}]],{small:1,onB:()=>{SUMM=null;pcMenu()}})}],["RILASCIA",()=>yesno(`Vuoi davvero lasciare andare ${MN(m)}? Tornerà libero per sempre.`,ok=>{if(!ok)return pcMenu();G.box.splice(i,1);say(`${MN(m)} saluta e se ne va. Buona fortuna!`,()=>pcMenu())})],["INDIETRO",()=>pcMenu()]],{small:1,onB:()=>pcMenu()}))}],
    ["SCHEDARIO DEL PROF.",()=>{const seen=Object.keys(G.seen).length,c=Object.keys(G.caught).length;say([`PC DEL PROF. PARQUET: «Schedario aggiornato: ${seen} visti, ${c} catturati su ${SP.length}.»`,c>=SP.length?"«Completo! Sei una leggenda dello scouting!»":c>=100?"«Oltre cento! Il tuo nome è nella sala del laboratorio.»":"«Continua così: ogni cattura aggiorna lo schedario di tutti i centri.»"],()=>dexMenu())}],
    ["ESCI",()=>{}]],{title:"PC DEL DEPOSITO",onB:()=>{}})};
/* ---------- SHOP ---------- */
const SHOP1=["Pallone","Borraccia","Sali minerali","Ghiaccio","Caffè","Stretching","Camomilla","Fischietto","Uscita d emergenza","Schema: Crossover","Schema: Euro step","Schema: Schiacciata","Schema: Assist","Schema: Tripla","Schema: Stoppata","Schema: Contropiede","Schema: Grinta"];
const shopMenu=(greet)=>{say([greet||"«Benvenuto allo SHOP! Cosa ti serve?»"],()=>menu([["COMPRA",()=>buyMenu()],["VENDI",()=>sellMenu()],["NIENTE",()=>say("Torna presto!")]],{small:1}))};
const buyMenu=(L0)=>{const L=L0||SHOPCUR||M.shop||SHOP1;menu(L.map(k=>[`${k} · ${IT[k].pr}₵`,()=>{const P=IT[k].pr;const max=Math.max(0,Math.floor(G.money/P));if(!max)return say("Non hai abbastanza crediti!",()=>buyMenu(L));qtyMenu(k,max,q=>{G.money-=P*q;addItem(k,q);SFX.item();const pr=k==="Pallone"&&q>=10?Math.floor(q/10):0;if(pr)addItem("Pallone Premier",pr);say([`Hai comprato ${q} × ${k}.`].concat(pr?[`In omaggio anche ${pr} × Pallone Premier!`]:[]),()=>buyMenu(L))})}]),{title:`COMPRA · hai ${G.money}₵`,keys:L,price:i=>IT[L[i]].pr+"₵",info:i=>IT[L[i]].d,onB:()=>say("Torna presto!")})};let SHOPCUR=null;
const sellMenu=()=>{const ks=Object.keys(G.bag).filter(k=>G.bag[k]>0&&IT[k]&&IT[k].pr>0&&IT[k].p!=="chi");if(!ks.length)return say("Non hai niente da vendere.");menu(ks.map(k=>[`${k} ×${G.bag[k]} · ${Math.floor(IT[k].pr/2)}₵`,()=>qtyMenu(k,G.bag[k],q=>{G.bag[k]-=q;G.money+=Math.floor(IT[k].pr/2)*q;SFX.item();say(`Venduto! Hai ${G.money}₵.`,()=>sellMenu())})]),{title:`VENDI · hai ${G.money}₵`,keys:ks,price:i=>`×${G.bag[ks[i]]} · ${Math.floor(IT[ks[i]].pr/2)}₵`,info:i=>IT[ks[i]].d,onB:()=>say("Torna presto!")})};
const qtyMenu=(k,max,cb)=>{let q=1;const opts=[1,2,3,5,10,20,50,99].filter(v=>v<=max);if(!opts.length)opts.push(max);menu(opts.map(v=>[`× ${v}`,()=>cb(v)]),{title:k,small:1})};
/* ---------- LOTTE A TURNI ---------- */
let B=null;/* stato della lotta */
const STN={inj:"INF",par:"BLC",slp:"STA",cnf:"TLT"};
const mkSide=(mons,ai)=>({mons,cur:0,stg:{atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0},prot:0,ai});
const active=s=>s.mons[s.cur];
const stg=(v,s)=>v*(s>=0?(2+s)/2:2/(2-s));
const effStat=(side,k)=>{const m=active(side);let v=stat(m,k);v=stg(v,side.stg[k]);if(k==="spe"&&m.st==="par")v/=2;if(k==="spe"&&(m.held||"")==="Scarpe nuove")v*=1.15;return v};
const wildBattle=enc=>{const tab=ENC[enc];if(!tab||!tab.list.length)return;const night=dayPhase()==="notte";/* la leggenda errante: dopo la Lega gira per i percorsi e cambia zona */if(G.flags.champion&&G.flags.roam&&G.flags.roam===MK&&!G.flags["leg_roam"]&&rnd()<.12){const s=SP.find(q=>q.n===ROAMER);if(s){const m=mkMon(s.n,62);m.hp=G.flags.roamHp||m.hp;G.seen[m.sp]=1;return startBattle({wild:m,mus:"rival",roam:1,enc,surf:!!G.surf,cb:w=>{}})}}
  const w=q=>q[3]*(night&&q[3]<=2?2.5:1);let tot=tab.list.reduce((a,e)=>a+w(e),0),r=rnd()*tot,e=tab.list[0];for(const q of tab.list){r-=w(q);if(r<=0){e=q;break}}const m=mkMon(e[0],ri(e[1],e[2]));if(rnd()<.08)m.heldWild=pick(["Banana","Arancia","Mirtilli","Ciliegie"]);G.seen[m.sp]=1;startBattle({wild:m,mus:"battle",enc,surf:!!G.surf})};
const ROAMER="Luka Dončić";/* a ogni cambio di zona la leggenda errante si sposta */const roamStep=()=>{if(!G.flags.champion||G.flags.leg_roam)return;const R=["route2","bosco","route3","route4","route5","route6","route7","route8"];if(!G.flags.roam||rnd()<.6)G.flags.roam=pick(R.filter(x=>x!==G.flags.roam))};
const trainerBattle=(n,cb)=>{const tr=n.trainer;let pl=typeof tr.party==="string"?TRP[tr.party]:tr.party;if(tr.rematch)delete G.flags["tr_"+n.id];if(tr.champ||tr.rivalLv){const L=tr.champ?68:tr.rivalLv;const top=SP.slice().sort((a,b)=>b.val-a.val);const pool=tr.champ?top.slice(0,14):top.slice(Math.floor(top.length*(1-L/70)),Math.floor(top.length*(1-L/70))+10);const r_=sR(hsh(G.name+L));const t=[[G.flags.rivalStarter,L]];const k=tr.champ?6:Math.min(5,1+Math.floor(L/12));for(let i=0;i<k;i++){const s=pool[Math.floor(r_()*pool.length)];if(s&&!t.some(q=>q[0]===s.n))t.push([s.n,L-2-i%3,tr.champ?["Barretta energetica","Fascia della grinta","Palla rovente","Fascia lucky","Scarpe nuove","Borraccia magica"][i]:null])}if(tr.champ)t[0][2]="Barretta energetica";pl=t}const party=pl.map(([s,l,h])=>{const m=mkMon(s,l);if(m&&h)m.held=h;return m}).filter(Boolean);party.forEach(m=>G.seen[m.sp]=1);startBattle({tr,party,npc:n,mus:tr.rival?"rival":"trainer",cb})};
const startBattle=o=>{lock=true;const foe=o.wild?[o.wild]:o.party;const first=G.party.findIndex(m=>m.hp>0);B={o,P:mkSide(G.party,false),F:mkSide(foe,true),phase:"intro",anim:0,log:[],msgs:[],shake:{p:0,f:0},flash:0,partic:new Set([first]),esc:0,ballAnim:null,turn:0};B.P.cur=first;
  playMus(o.mus);flashIn(()=>{const s=SPX[active(B.F).sp];B.phase="msg";bsay(o.wild?[`Un ${s.n} selvatico è apparso!`]:[`${o.tr.n} vuole sfidarti!`,`${o.tr.n} manda in campo ${s.n}!`],()=>{bsay([`Vai, ${SPX[active(B.P).sp].n}!`],()=>mainMenu())})})};
let FLASH=0;const flashIn=cb=>{FLASH=1;mode="battle";setTimeout(()=>{FLASH=0;if(B)B.anim=0;cb()},800)};
const bsay=(lines,cb)=>say(lines,cb);
const mainMenu=()=>{B.phase="menu";menu([["LOTTA",()=>fightMenu()],["ZAINO",()=>bagMenu(true)],["SQUADRA",()=>partyMenu(true)],["FUGA",()=>runAway()]],{battle:1,grid:1,onB:()=>mainMenu()})};
const fightMenu=()=>{const m=active(B.P);menu(m.moves.map((x,i)=>[`${x.n}`,()=>{if(x.pp<=0)return bsay("Non ci sono più PP per questa mossa!",()=>fightMenu());doTurn({k:"move",i})}]),{battle:1,grid:1,moves:m,onB:()=>mainMenu()})};
const runAway=()=>{if(B.o.tr)return bsay("Non puoi scappare da una sfida ufficiale!",()=>mainMenu());if(B.o.roam){return bsay("Sei scappato!",()=>{G.flags.roamHp=active(B.F).hp;roamStep();endBattle("run")})}B.esc++;const a=effStat(B.P,"spe"),b=effStat(B.F,"spe");const f=(a*128/Math.max(1,b)+30*B.esc)%256;if(a>=b||rnd()*256<f){bsay("Sei scappato!",()=>endBattle("run"))}else bsay("Non riesci a scappare!",()=>doTurn({k:"none"}))};
/* scelta dell IA: la mossa che fa più danno (con un po di fantasia) */
const aiPick=()=>{const m=active(B.F),P=active(B.P);const smart=!!B.o.tr;const H=stat(m,"hp");let best=0,bv=-1;m.moves.forEach((x,i)=>{if(x.pp<=0)return;const mv=MV[x.n];let v;if(mv.c==="S"){const e=mv.e||"";if(e==="heal50")v=m.hp<H*.4?200:0;else if(e==="slp"||e==="par"||e==="cnf")v=(P.st||(e==="cnf"&&P.cnf))?0:(smart?70:30);else if(e.startsWith("self:"))v=B.turn<=1&&smart?60:20;else if(e==="protect")v=B.F.prot?0:15;else v=rnd()*40}else{v=mv.p*eff(mv.t,SPX[P.sp].t)*(SPX[m.sp].t.includes(mv.t)?1.5:1)*(mv.a?mv.a/100:1);if(smart&&eff(mv.t,SPX[P.sp].t)>1)v*=1.3}v*=.85+rnd()*.3;if(v>bv){bv=v;best=i}});return{k:"move",i:best}};
const prio=a=>a.k!=="move"?6:(MV[a.mon.moves[a.i].n].e.includes("prio1")?1:0);
const doTurn=pa=>{B.turn=(B.turn||0)+1;B.phase="turn";MENU=null;const fa=aiPick();pa.side=B.P;fa.side=B.F;pa.mon=active(B.P);fa.mon=active(B.F);
  let order=[pa,fa];B.P.flinch=0;B.F.flinch=0;const pp=prio(pa),pf=prio(fa);if(pf>pp||(pf===pp&&(effStat(B.F,"spe")>effStat(B.P,"spe")||(effStat(B.F,"spe")===effStat(B.P,"spe")&&rnd()<.5))))order=[fa,pa];
  firstActor=order[0].side;const Q=[];order.forEach(a=>Q.push(n=>act(a,n)));Q.push(n=>endTurnFx(n));runQ(Q,()=>afterTurn())};
const runQ=(Q,done)=>{const step=()=>{if(!B)return;const f=Q.shift();if(!f)return done();f(step)};step()};
const sideOf=m=>B.P.mons.includes(m)?B.P:B.F;const other=s=>s===B.P?B.F:B.P;
const nm=(s)=>(s===B.F?(B.o.wild?"Il selvatico ":"L avversario "):"")+MN(active(s));
const act=(a,next)=>{if(a.k!=="move"){next();return}const S=a.side,O=other(S),m=active(S);if(!m||m.hp<=0||active(S)!==a.mon){next();return}const mvO=m.moves[a.i],mv=MV[mvO.n];
  const pre=[];if(m.st==="slp"){m.slp=(m.slp||ri(1,3))-1;if(m.slp<=0){m.st=null;return bsay(`${nm(S)} si è ripreso!`,()=>act(a,next))}return bsay(`${nm(S)} è STANCO e non riesce a giocare…`,next)}
  if(m.st==="par"&&rnd()<.25)return bsay(`${nm(S)} è BLOCCATO e non si muove!`,next);
  if(m.cnf){m.cnf--;if(m.cnf<=0){m.cnf=0;pre.push(`${nm(S)} non è più in tilt.`)}else if(rnd()<.33){const d=Math.max(1,Math.floor(((2*m.lv/5+2)*40*effStat(S,"atk")/effStat(S,"def"))/50+2));m.hp=Math.max(0,m.hp-d);B.shake[S===B.P?"p":"f"]=.4;SFX.hit(.6);return bsay([`${nm(S)} è IN TILT!`,"Si è fatto male da solo!"],()=>checkFaint(next))}}
  if(S.flinch){S.flinch=0;return bsay(`${nm(S)} perde il tempo e non riesce a giocare!`,next)}
  mvO.pp--;bsay(pre.concat([`${nm(S)} usa ${mv.n}!`]),()=>{
    if(O.prot&&mv.c!=="S"||(O.prot&&mv.e.startsWith("foe"))){return bsay(`${nm(O)} si protegge!`,next)}
    const acc=mv.a===0||mv.e.includes("never")?999:mv.a*stg(1,S.stg.acc)/stg(1,O.stg.eva);if(rnd()*100>=acc){SFX.miss();return bsay(`${nm(S)} sbaglia!`,next)}
    if(mv.c==="S")return statusMove(S,O,mv,next);
    const hits=mv.e.includes("multi2")?2:1;let total=0,msgs=[];const T=SPX[active(O).sp].t,ef=eff(mv.t,T);
    for(let h=0;h<hits;h++){const crit=rnd()<(mv.e.includes("crit")?1/8:1/24)*(1+S.stg.crit+((m.held||"")==="Fascia lucky"?1:0));const A=effStat(S,mv.c==="F"?"atk":"spa")*(m.st==="inj"&&mv.c==="F"?.5:1),D=effStat(O,mv.c==="F"?"def":"spd");let d=Math.floor(Math.floor(Math.floor(2*m.lv/5+2)*mv.p*A/Math.max(1,D))/50)+2;if(crit)d=Math.floor(d*1.5);if(SPX[m.sp].t.includes(mv.t))d=Math.floor(d*1.5);d=Math.floor(d*ef*(.85+rnd()*.15));const hd=m.held||"";if(hd==="Palla rovente")d=Math.floor(d*1.3);if(hd==="Fascia del centro"&&mv.t==="CEN"||hd==="Fascia della guardia"&&mv.t==="GUA"||hd==="Fascia dell ala"&&mv.t==="ALA")d=Math.floor(d*1.2);if(hd==="Polsino"&&mv.c==="T")d=Math.floor(d*1.2);const tg=active(O);if((tg.held||"")==="Ginocchiera"&&mv.c==="F")d=Math.floor(d*.85);if(ef>0)d=Math.max(1,d);if((tg.held||"")==="Fascia della grinta"&&d>=tg.hp&&tg.hp>1&&rnd()<.12){d=tg.hp-1;msgs.push(`${nm(O)} resiste grazie alla FASCIA DELLA GRINTA!`)}tg.hp=Math.max(0,tg.hp-d);total+=d;if(crit)msgs.push("Colpo critico!");if(tg.hp<=0)break}
    B.shake[O===B.P?"p":"f"]=.5;SFX.moveHit(mv.t,ef>1?1.3:ef<1?.6:1);if(hits>1)msgs.push(`Colpito ${hits} volte!`);if(ef>1)msgs.push("È superefficace!");else if(ef<1)msgs.push("Non è molto efficace…");
    const e=mv.e,tg=active(O);if(e.includes("recoil")){const k=e.includes("33")?3:4;m.hp=Math.max(0,m.hp-Math.max(1,Math.floor(total/k)));msgs.push(`${nm(S)} si è fatto male nel contrasto!`)}if(e.includes("drain50")){m.hp=Math.min(stat(m,"hp"),m.hp+Math.max(1,Math.floor(total/2)));msgs.push(`${nm(S)} recupera energie!`)}if((m.held||"")==="Borraccia magica"&&total>0&&m.hp<stat(m,"hp")){m.hp=Math.min(stat(m,"hp"),m.hp+Math.max(1,Math.floor(total/8)));msgs.push(`${nm(S)} si rinfresca con la BORRACCIA MAGICA.`)}if((m.held||"")==="Palla rovente"&&total>0){m.hp=Math.max(1,m.hp-Math.max(1,Math.floor(stat(m,"hp")/10)))}if((m.held||"")==="Fischietto dell arbitro"&&tg.hp>0&&rnd()<.1&&!e.includes("flinch")){O.flinch=1}
    if(tg.hp>0){const ch=(t,p)=>e.includes(t)&&!tg.st&&rnd()<p/100;if(ch("inj",+((e.match(/inj(\d+)/)||[])[1]||0))){tg.st="inj";msgs.push(`${nm(O)} si è INFORTUNATO!`)}if(ch("par",+((e.match(/par(\d+)/)||[])[1]||0))){tg.st="par";msgs.push(`${nm(O)} è BLOCCATO!`)}const fl=+((e.match(/flinch(\d+)/)||[])[1]||0);if(fl&&rnd()<fl/100&&S===firstActor){O.flinch=1}
      if(e.startsWith("foe:")||e.includes(",foe:"))applyStages(O,e.split("foe:")[1],msgs,O);if(e.startsWith("self:"))applyStages(S,e.slice(5),msgs,S)}
    bsay(msgs,()=>checkFaint(next))})};
let firstActor=null;
const applyStages=(side,spec,msgs,who)=>{spec.split(",").forEach(p=>{const mm=p.match(/(atk|def|spa|spd|spe|acc|eva)([+-]\d)/);if(mm){const k=mm[1],v=+mm[2];if(v<0&&side.guard>0){msgs.push("La FASCIA PROTEZIONE impedisce il calo!");return}const b=side.stg[k];side.stg[k]=cl(b+v,-6,6);if(side.stg[k]!==b)(v>0?SFX.statUp:SFX.statDown)();const L={atk:"l attacco",def:"la difesa",spa:"il tiro",spd:"la lettura",spe:"la velocità",acc:"la precisione",eva:"l elusione"}[k];msgs.push(side.stg[k]===b?`${nm(who)}: ${L} non può cambiare di più!`:`${nm(who)}: ${L} ${v>0?(v>1?"sale molto":"sale"):(v<-1?"scende molto":"scende")}!`)}if(p==="crit"){side.stg.crit=Math.min(3,side.stg.crit+1);msgs.push(`${nm(who)} prende la mira!`)}})};
const statusMove=(S,O,mv,next)=>{const m=active(S),tg=active(O),e=mv.e,msgs=[];
  if(e==="heal50"){const H=stat(m,"hp");if(m.hp>=H)msgs.push("È già in piena forma!");else{m.hp=Math.min(H,m.hp+Math.floor(H/2));msgs.push(`${nm(S)} recupera energie!`);SFX.heal()}}
  else if(e==="protect"){S.prot=1;SFX.stProt();msgs.push(`${nm(S)} alza la MURAGLIA!`)}
  else if(e==="cnf"){if(tg.cnf){SFX.fail();msgs.push("Non ha effetto…")}else{SFX.stConf();tg.cnf=ri(2,4);msgs.push(`${nm(O)} va IN TILT!`)}}
  else if(e==="slp"){if(tg.st){SFX.fail();msgs.push("Non ha effetto…")}else{SFX.stSleep();tg.st="slp";tg.slp=ri(1,3);msgs.push(`${nm(O)} è STANCO!`)}}
  else if(e==="par"){if(tg.st){SFX.fail();msgs.push("Non ha effetto…")}else{SFX.stPar();tg.st="par";msgs.push(`${nm(O)} è BLOCCATO!`)}}
  else if(e.startsWith("self:"))applyStages(S,e.slice(5),msgs,S);else if(e.startsWith("foe:"))applyStages(O,e.slice(4),msgs,O);
  bsay(msgs,next)};
const endTurnFx=next=>{const msgs=[];[B.P,B.F].forEach(s=>{s.prot=0;if(s.guard>0)s.guard--;const m=active(s);if(m&&m.hp>0&&m.st==="inj"){const d=Math.max(1,Math.floor(stat(m,"hp")/8));m.hp=Math.max(0,m.hp-d);msgs.push(`${nm(s)} soffre per l infortunio!`)}if(m&&m.hp>0){const H=stat(m,"hp"),hd=m.held||"",it=IT[hd]||{};if(hd==="Barretta energetica"&&m.hp<H){m.hp=Math.min(H,m.hp+Math.max(1,Math.floor(H/16)));msgs.push(`${nm(s)} sgranocchia la BARRETTA.`)}else if(it.held==="h10"&&m.hp<=H/2){m.hp=Math.min(H,m.hp+10);m.held=null;msgs.push(`${nm(s)} mangia la ${hd}: +10 PV!`)}else if(it.held==="h25"&&m.hp<=H/2){m.hp=Math.min(H,m.hp+Math.floor(H/4));m.held=null;msgs.push(`${nm(s)} mangia l ${hd} e recupera!`)}else if(it.held==="inj"&&m.st==="inj"){m.st=null;m.held=null;msgs.push(`${nm(s)} mangia i ${hd}: infortunio curato!`)}else if(it.held==="slp"&&m.st==="slp"){m.st=null;m.held=null;msgs.push(`${nm(s)} mangia le ${hd} e si sveglia!`)}}});if(msgs.length)bsay(msgs,()=>checkFaint(next));else next()};
/* KO, esperienza, livelli, nuove mosse */
const checkFaint=next=>{const Q=[];[B.F,B.P].forEach(s=>{const m=active(s);if(m&&m.hp<=0&&!m._ko){if(s===B.F&&B.o.roam){G.flags.roamHp=null}m._ko=1;Q.push(n2=>{SFX.faint();B.fall=B.fall||{};B.fall[s===B.P?"p":"f"]=1;bsay(`${nm(s)} è KO!`,()=>{if(s===B.F)giveExp(m,n2);else n2()})})}});runQ(Q,next)};
const giveExp=(foe,next)=>{const s=SPX[foe.sp];let parts=[...B.partic].filter(i=>G.party[i]&&G.party[i].hp>0);const base=Math.max(1,Math.floor(s.bx*foe.lv/7*(B.o.tr?1.5:1)));if(G.flags.share)parts=G.party.map((m,i)=>i).filter(i=>G.party[i].hp>0);if(!parts.length)return next();const Q=[];
  parts.forEach(i=>{const m=G.party[i];Q.push(n2=>{let xp=Math.max(1,Math.floor(base/(B.partic.has(i)?Math.max(1,[...B.partic].filter(j=>G.party[j]&&G.party[j].hp>0).length):2)));if((m.held||"")==="Biglietto fortunato")xp=Math.floor(xp*1.5);if(m.lv>=100){n2();return}m.xp+=xp;Object.keys(s.bs).forEach(k=>{m.ev[k]=Math.min(252,m.ev[k]+(s.bs[k]>=100?2:1))});bsay(`${MN(m)} guadagna ${xp} punti esperienza!`,()=>levelUps(m,n2))})});runQ(Q,next)};
const levelUps=(m,next)=>{if(m.lv>=100||m.xp<expAt(m.lv+1))return next();const oldH=stat(m,"hp");m.lv++;m.hp+=stat(m,"hp")-oldH;SFX.lvl();bsay(`${MN(m)} sale al livello ${m.lv}!`,()=>{const nw=SPX[m.sp].learn.filter(q=>q[0]===m.lv).map(q=>q[1]);learnChain(m,nw,()=>levelUps(m,next))})};
const learnChain=(m,list,next)=>{if(!list.length)return next();const n=list.shift();if(m.moves.some(x=>x.n===n))return learnChain(m,list,next);if(m.moves.length<4){m.moves.push({n,pp:MV[n].pp});return bsay(`${MN(m)} impara ${n}!`,()=>learnChain(m,list,next))}
  bsay([`${MN(m)} vuole imparare ${n}…`,"…ma conosce già 4 mosse. Vuoi dimenticarne una?"],()=>menu(m.moves.map((x,i)=>[x.n,()=>{const old=x.n;m.moves[i]={n,pp:MV[n].pp};bsay(["1, 2 e… puff!",`${MN(m)} dimentica ${old} e impara ${n}!`],()=>learnChain(m,list,next))}]).concat([["NON IMPARARE",()=>bsay(`${MN(m)} non impara ${n}.`,()=>learnChain(m,list,next))]]),{title:"QUALE DIMENTICARE?",info:i=>{const x=m.moves[i];return x?moveInfo(x.n):moveInfo(n)}}))};
const moveInfo=n=>{const v=MV[n];return`${TY[v.t].n} · ${v.c==="F"?"FISICA":v.c==="T"?"TIRO":"STATO"}${v.p?" · POT "+v.p:""}${v.a?" · PREC "+v.a:""} · PP ${v.pp} — ${v.d}`};
const afterTurn=()=>{if(!B)return;firstActor=null;const fo=active(B.F);if(B.o.roam&&fo.hp>0&&!B.caught){G.flags.roamHp=fo.hp;return bsay(`${MN(fo)} scappa via! Si è spostato in un altra zona…`,()=>{roamStep();endBattle("run")})}if(fo.hp<=0){const nx=B.F.mons.findIndex(m=>m.hp>0);if(nx<0)return winBattle();B.F.cur=nx;B.F.stg={atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0};B.fall&&(B.fall.f=0);G.seen[active(B.F).sp]=1;return bsay(`${B.o.tr.n} manda in campo ${SPX[active(B.F).sp].n}!`,()=>afterTurn())}
  const me=active(B.P);if(me.hp<=0){if(!G.party.some(m=>m.hp>0))return loseBattle();return partyMenu(true,true)}mainMenu()};
const winBattle=()=>{if(B.o.wild)return endBattle("win");const tr=B.o.tr;const coin=G.party.some(m=>(m.held||"")==="Portafortuna");const prize=tr.money*(coin?2:1);G.money+=prize;playMus("win");bsay([`Hai battuto ${tr.n}!`].concat(tr.lose||[]).concat([`Hai vinto ${prize}₵!`]),()=>{if(B.o.npc&&B.o.npc.id)G.flags["tr_"+B.o.npc.id]=1;if(tr.elite!=null)G.flags["tr_elite"+tr.elite]=1;
    if(tr.gym!=null&&!G.badges.includes(tr.gym)){const gy=GYMS[tr.gym];G.badges.push(tr.gym);G.flags["badge"+G.badges.length]=1;addItem("Schema: "+gy.sch,1);SFX.catch();return bsay([`{N} riceve la ${gy.badge}!`,`E lo SCHEMA di «${gy.sch}».`].concat(gy.pow?[`Con questa medaglia puoi usare ${gy.pow} fuori dalle partite!`]:[]).concat(G.badges.length>=8?["Hai tutte e 8 le medaglie! La LEGA DEI SOGNI ti aspetta oltre la Via della Vittoria."]:[]),()=>endBattle("win"))}
    if(tr.champ){endBattle("win");return hallOfFame()}endBattle("win")})};
const loseBattle=()=>{/* come nel genere: si perdono soldi solo contro gli allenatori (non contro i selvatici né nelle sfide di storia) */const lost=B.o.tr&&!B.o.cb?Math.floor(G.money/2):0;G.money-=lost;bsay(["Non hai più giocatori in grado di giocare…"].concat(lost?[`Hai pagato ${lost}₵ al vincitore…`]:[]).concat(["…e torni di corsa a farti curare."]),()=>{const cb=B&&B.o.cb;B=null;mode="world";MENU=null;healAll();if(cb){lock=false;cb(false);return}["elite0","elite1","elite2","elite3"].forEach(k=>delete G.flags["tr_"+k]);const lh=G.flags.lastHeal;const back=lh==="centro"?["centro",4,6]:lh&&MAPS[lh]&&lh.startsWith("cen_")?[lh,4,6]:["casa1",4,4];fade(()=>{loadMap(back[0],back[1],back[2],"up");lock=false})})};
const endBattle=res=>{const cb=B.o.cb;G.party.forEach(m=>{delete m._ko;delete m.cnf});B=null;MENU=null;mode="world";lock=false;playMus(M.mus);save();if(cb)cb(res==="win")};
/* cattura: probabilità classica (salute bassa e stati aiutano) */
const throwBall=k=>{const tg=active(B.F),s=SPX[tg.sp],H=stat(tg,"hp");const it=IT[k];const bt=it.ball,me=active(B.P),enc=B.o.enc||"";let rate=s.rate,bb=1;if(typeof bt==="number")bb=bt;else if(bt==="rete")bb=s.t.some(t=>t==="CEN"||t==="DIF")?3.5:1;else if(bt==="tuffo")bb=B.o.surf?3.5:1;else if(bt==="esca")bb=enc==="fish"?4:1;else if(bt==="vivaio")bb=Math.max(1,(41-tg.lv)/10);else if(bt==="bis")bb=G.caught[tg.sp]?3.5:1;else if(bt==="timer")bb=Math.min(4,1+B.turn*1229/4096);else if(bt==="rapido")bb=B.turn===0?5:1;else if(bt==="notte")bb=M.cave?3:1;else if(bt==="livello")bb=me.lv>=tg.lv*4?8:me.lv>=tg.lv*2?4:me.lv>tg.lv?2:1;else if(bt==="peso")rate=cl(rate+(s.build==="big"?30:s.role==="G"?-20:0),1,255);else if(bt==="veloce")bb=s.bs.spe>=100?4:1;else if(bt==="leggenda")bb=s.val>2400?5:.1;
  /* stato: dormire 2,5 · infortunio/paralisi/confusione 1,5 (come nel genere) */const stB=tg.st==="slp"?2.5:tg.st?1.5:1;const a=bt==="mvp"?255:Math.min(255,((3*H-2*tg.hp)*rate*bb)/(3*H)*stB);
  const shakes=a>=255?4:(()=>{const b=1048560/Math.sqrt(Math.sqrt(16711680/a));let n=0;for(let i=0;i<4;i++)if(rnd()*65536<b)n++;else break;return n})();
  G.bag[k]--;const nsh=Math.min(3,shakes);B.ball={t0:performance.now(),k,ph:"throw",wob:0,shakes:nsh,ok:shakes>=4};SFX.throwB();bsay(`{N} lancia un ${k}!`,()=>{
    /* il pallone vola, risucchia il giocatore, poi oscilla: 3 oscillazioni = cattura */B.ball.ph="absorb";SFX.absorb();let i=0;const sh=()=>{if(i<nsh){B.ball.ph="wob";B.ball.wob=i+1;B.ball.wt=performance.now();SFX.shake();i++;setTimeout(sh,900);return}
      if(shakes>=4){B.ball.ph="caught";SFX.catch();B.caught=1;G.caught[tg.sp]=1;const nm2=s.n;setTimeout(()=>bsay([`Preso! ${nm2} è stato catturato!`,`${nm2} è registrato nello SCHEDARIO.`],()=>{if(B.o.roam)G.flags.leg_roam=1;tg.ot=G.name;tg._ko=0;tg.ball=k;if(bt==="cura"){tg.hp=H;tg.st=null}if(tg.heldWild){addItem(tg.heldWild,1);delete tg.heldWild}const fin=()=>{if(G.party.length<6){G.party.push(tg);endBattle("win")}else{G.box.push(tg);bsay(`${nm2} va nel deposito del PC.`,()=>endBattle("win"))}};bsay(`Vuoi dare un soprannome a ${nm2}?`,()=>menu([["SÌ",()=>askText(`Soprannome per ${nm2}?`,"",12,v=>{if(v)tg.nick=v;fin()})],["NO",()=>fin()]],{small:1,must:1,onB:()=>fin()}))}),1300)}
      else{B.ball.ph="break";SFX.breakOut();setTimeout(()=>{B.ball=null;bsay(["Oh no! Si è liberato subito!","Accidenti! Sembrava preso!","Argh! Ci è mancato pochissimo!"][Math.min(2,shakes)],()=>doTurn({k:"none"}))},450)}};setTimeout(sh,700)})};
/* ---------- MENU: squadra, zaino, schedario, coach, opzioni ---------- */
const startMenu=()=>{if(lock||TB||MENU)return;SFX.sel();menu([["SQUADRA",()=>partyMenu(false)],...(POWER("VOLO")&&!M.inside&&!M.cave?[["VOLO",()=>flyMenu()]]:[]),...(G.bag["Bici"]&&!M.inside?[[G.bike?"SCENDI DALLA BICI":"BICI",()=>{G.bike=G.bike?0:1;SFX.bikeBell();say(G.bike?"Sali in bici!":"Scendi dalla bici.")}]]:[]),...(G.flags.dex?[["SCHEDARIO",()=>dexMenu()]]:[]),["ZAINO",()=>bagMenu(false)],["TESSERA",()=>cardMenu()],["OPZIONI",()=>optMenu()],["ESCI DAL GIOCO",()=>{save();PD.close()}],["CHIUDI",()=>{}]],{title:"MENU",side:1,main:1,onB:()=>{}})};
const partyMenu=(inB,forced)=>{if(!G.party.length)return say("Non hai ancora giocatori.");menu(G.party.map((m,i)=>[`${MN(m)}`,()=>{const opts=[];if(inB){opts.push(["IN CAMPO",()=>{if(m.hp<=0)return bsay(`${MN(m)} è KO!`,()=>partyMenu(inB,forced));if(i===B.P.cur)return bsay(`${MN(m)} è già in campo!`,()=>partyMenu(inB,forced));const old=active(B.P);B.P.cur=i;B.P.stg={atk:0,def:0,spa:0,spd:0,spe:0,acc:0,eva:0,crit:0};B.partic.add(i);B.fall&&(B.fall.p=0);if(forced)bsay(`Vai, ${MN(m)}!`,()=>mainMenu());else bsay([`Torna qui, ${MN(old)}!`,`Vai, ${MN(m)}!`],()=>doTurn({k:"switch"}))}])}
      opts.push(["SCHEDA",()=>{SUMM={m,i};menu([["CHIUDI",()=>{SUMM=null;partyMenu(inB,forced)}]],{small:1,onB:()=>{SUMM=null;partyMenu(inB,forced)}})}]);if(!inB)opts.push(["SPOSTA",()=>menu(G.party.map((q,j)=>[MN(q),()=>{const t=G.party[i];G.party[i]=G.party[j];G.party[j]=t;partyMenu(false)}]),{title:"SCAMBIA CON…"})]);if(!inB)opts.push(["MOSSE",()=>moveOrder(m,inB)]);if(!inB)opts.push([m.held?"OGGETTO: "+m.held:"DAI OGGETTO",()=>{const ks=Object.keys(G.bag).filter(k=>G.bag[k]>0&&IT[k]&&(IT[k].held));const o=[];if(m.held)o.push(["TOGLI "+m.held.toUpperCase(),()=>takeItem(m)]);ks.forEach(k=>o.push([`${k} ×${G.bag[k]}`,()=>giveItem(m,k)]));if(!o.length)return say("Non hai oggetti da far tenere.");menu(o,{title:"COSA GLI DAI?",info:i=>{const t=o[i][0];const kk=ks.find(k=>t.startsWith(k));return kk?IT[kk].d:""},onB:()=>partyMenu(inB,forced)})}]);opts.push(["INDIETRO",()=>partyMenu(inB,forced)]);menu(opts,{small:1,onB:()=>partyMenu(inB,forced)})}]),{title:forced?"CHI MANDI IN CAMPO?":"SQUADRA",party:1,onB:forced?()=>partyMenu(inB,forced):inB?()=>mainMenu():()=>startMenu()})};
const moveOrder=(m)=>menu(m.moves.map((x,i)=>[`${x.n}  ${x.pp}/${maxPP(0,x)}`,()=>menu([["SPOSTA IN ALTO",()=>{if(i>0){const t=m.moves[i-1];m.moves[i-1]=m.moves[i];m.moves[i]=t}moveOrder(m)}],["DIMENTICA",()=>{if(m.moves.length<=1)return say("Deve conoscere almeno una mossa!",()=>moveOrder(m));yesno(`Dimenticare ${x.n}? (l allenatore delle mosse può farla ripassare)`,ok=>{if(ok)m.moves.splice(i,1);moveOrder(m)})}],["INDIETRO",()=>moveOrder(m)]],{small:1,onB:()=>moveOrder(m)})]).concat([["INDIETRO",()=>partyMenu(false)]]),{title:MN(m)+" · MOSSE",info:i=>m.moves[i]?moveInfo(m.moves[i].n):"",onB:()=>partyMenu(false)});
let SUMM=null;
let bagPocket=0;const bagMenu=inB=>{const pk=POCK[bagPocket];const ks=Object.keys(G.bag).filter(k=>G.bag[k]>0&&IT[k]&&IT[k].p===pk[0]);
  /* zaino grafico: tasche in alto, caselle con il disegno di ogni strumento, descrizione sotto */const go=d=>{bagPocket=(bagPocket+d+POCK.length)%POCK.length;bagMenu(inB)};
  menu(ks.length?ks.map(k=>[k,()=>useItem(k,inB)]):[["",()=>bagMenu(inB)]],{bag:1,keys:ks,cols:6,inB,onB:inB?()=>mainMenu():()=>startMenu(),edgeL:()=>go(-1),edgeR:()=>go(1),tab:t=>{bagPocket=t;bagMenu(inB)}})};
const useItem=(k,inB)=>{const it=IT[k];
  if(it.held&&!it.rep&&!inB){/* fuori partita: darlo da tenere */return menu(G.party.map(m=>[`${MN(m)}${m.held?"  ("+m.held+")":""}`,()=>giveItem(m,k)]),{title:"A CHI LO DAI?",party:1,onB:()=>bagMenu(inB)})}if(it.held&&inB)return bsay("Gli oggetti si danno da tenere fuori dalla partita.",()=>bagMenu(true));
  if(it.ball){if(!inB)return say("Si usa solo davanti a un giocatore selvatico.");if(B.o.tr)return bsay("Non puoi catturare il giocatore di un altro allenatore!",()=>mainMenu());MENU=null;return throwBall(k)}
  if(it.key){if(it.key==="rod"){if(inB)return bsay("Non adesso!",()=>bagMenu(true));const[dx,dy]=DIRV[PL.dir];if(tileAt(PL.x+dx,PL.y+dy)==="~"){MENU=null;return fish()}return say("Mettiti davanti all acqua per pescare.")}if(it.key==="bike"){if(inB||M.inside)return say("Non qui!");MENU=null;G.bike=G.bike?0:1;return say(G.bike?"Sali in bici!":"Scendi dalla bici.")}
    if(it.key==="share"){G.flags.share=G.flags.share?0:1;return say(G.flags.share?"Cuffie accese: tutta la squadra guadagna esperienza.":"Cuffie spente: l esperienza va solo a chi gioca.")}
    if(it.key==="radar"){if(inB)return bsay("Non adesso!",()=>bagMenu(true));const n=(M.items||[]).filter(i=>!G.items[i.id]).length;return say(n?`Il radar vibra: qui restano ${n} strument${n>1?"i":"o"} da trovare.`:"Il radar tace: qui non c è più niente.")}
    if(it.key==="vs"){if(inB||M.inside)return say("Non qui!");if(!G.flags.champion)return say("Gli allenatori accetteranno la rivincita solo dal CAMPIONE della Lega.");const tr=NPCS.filter(n=>n.trainer&&G.flags["tr_"+n.id]&&!n.trainer.gym&&n.trainer.elite==null);if(!tr.length)return say("Nessuno qui vuole la rivincita.");tr.forEach(n=>{delete G.flags["tr_"+n.id];n.trainer.party=n.trainer.party.map(([a,l])=>[a,Math.min(100,l+15)]);n.trainer.money=Math.round(n.trainer.money*1.5)});MENU=null;return say(`${tr.length} allenator${tr.length>1?"i":"e"} di questa zona vogliono la rivincita!`)}
    if(it.key==="map"){MENU=null;return regionMap()}return say(it.d)}
  if(it.x){if(!inB)return say("Si usa solo in partita.");G.bag[k]--;MENU=null;if(it.x==="guard"){B.P.guard=5;return bsay("La squadra è protetta: le statistiche non caleranno!",()=>doTurn({k:"item"}))}const msgs=[];applyStages(B.P,it.x+"+1",msgs,B.P);return bsay(msgs,()=>doTurn({k:"item"}))}
  if(it.rep){if(inB)return bsay("Non adesso!",()=>bagMenu(true));G.rep=it.rep;G.bag[k]--;return say("Fischi forte: per un po i giocatori selvatici stanno alla larga.")}
  if(it.esc){if(!M.cave)return say("Qui non serve.");G.bag[k]--;MENU=null;const lh=G.flags.lastHeal;return fade(()=>{if(lh&&lh.startsWith("cen_"))loadMap(lh.slice(4),5,10,"down");else loadMap("canestro",5,10,"down")})}
  if(it.mv)return teach(k,inB);
  menu(G.party.map((m,i)=>[`${MN(m)}  ${m.hp}/${stat(m,"hp")}`,()=>{const H=stat(m,"hp");let ok=false,msg="";
    if(it.heal){if(m.hp<=0||m.hp>=H)msg="Non avrebbe effetto.";else{const a=Math.min(H-m.hp,it.heal);m.hp+=a;ok=true;msg=`${MN(m)} recupera ${a} punti vita.`}}
    else if(it.cure){if(m.hp>0&&((it.cure==="all"&&(m.st||m.cnf))||m.st===it.cure||(it.cure==="cnf"&&m.cnf))){if(it.cure==="cnf"||it.cure==="all")m.cnf=0;m.st=null;ok=true;msg=`${MN(m)} sta di nuovo bene.`}else msg="Non avrebbe effetto."}
    else if(it.rev){if(m.hp>0)msg="Non avrebbe effetto.";else{m.hp=Math.floor(H*it.rev);delete m._ko;ok=true;msg=`${MN(m)} torna in forma!`}}
    else if(it.pp){const x=m.moves.find(q=>q.pp<maxPP(x_=>x_,q));if(!x)msg="Non avrebbe effetto.";else{x.pp=Math.min(maxPP(0,x),x.pp+it.pp);ok=true;msg=`PP di ${x.n} ricaricati.`}}
    else if(it.ppall){const xs=m.moves.filter(q=>q.pp<maxPP(0,q));if(!xs.length)msg="Non avrebbe effetto.";else{xs.forEach(x=>x.pp=Math.min(maxPP(0,x),x.pp+it.ppall));ok=true;msg=`PP di ${MN(m)} ricaricati.`}}
    else if(it.ppup){const x=m.moves.find(q=>(q.up||0)<3);if(!x)msg="Le sue mosse sono già al massimo.";else{x.up=(x.up||0)+1;x.pp+=Math.floor(MV[x.n].pp/5);ok=true;msg=`I PP di ${x.n} aumentano!`}}
    else if(it.ev){m.ev[it.ev]=Math.min(252,m.ev[it.ev]+10);ok=true;msg=`${MN(m)} si è allenato!`}
    else if(it.up){if(m.lv>=100)msg="È già al massimo!";else{G.bag[k]--;m.xp=expAt(m.lv+1);MENU=null;return levelUps(m,()=>{if(inB)doTurn({k:"item"});})}}
    else msg="Non si può usare adesso.";
    if(ok){G.bag[k]--;SFX.heal()}MENU=null;if(inB){if(ok)bsay(msg,()=>doTurn({k:"item"}));else bsay(msg,()=>bagMenu(true))}else say(msg)}]),{title:"SU CHI?",party:1,onB:()=>bagMenu(inB)})};
const maxPP=(_,q)=>MV[q.n].pp+Math.floor(MV[q.n].pp/5)*(q.up||0);
/* oggetti da tenere: dare / togliere dalla squadra */
const giveItem=(m,k)=>{if(m.held){const old=m.held;G.bag[old]=(G.bag[old]||0)+1;m.held=k;G.bag[k]--;say(`${MN(m)} lascia ${old} e tiene ${k}.`)}else{m.held=k;G.bag[k]--;say(`${MN(m)} ora tiene ${k}.`)}};
const takeItem=m=>{if(!m.held)return say(`${MN(m)} non tiene niente.`);const k=m.held;G.bag[k]=(G.bag[k]||0)+1;m.held=null;say(`Hai ripreso ${k}.`)};
/* mappa della regione: schema delle città con le medaglie */
let MAPVIEW=null;const regionMap=()=>{MAPVIEW=1;menu([["CHIUDI",()=>{MAPVIEW=null}]],{small:1,onB:()=>{MAPVIEW=null}})};
/* SCHEMI: insegnano mosse, solo ai ruoli giusti */
const teach=(k,inB)=>{if(inB)return bsay("Gli schemi si studiano fuori dalla partita.",()=>bagMenu(true));const mv=MV[IT[k].mv];menu(G.party.map(m=>{const s=SPX[m.sp];const ok=!mv.r||mv.r.includes(s.role)||s.t.includes(mv.t);return[`${s.n}  ${ok?"PUÒ":"NO"}`,()=>{if(!ok)return say(`${s.n} non è il tipo di giocatore giusto per «${mv.n}».`);if(m.moves.some(x=>x.n===mv.n))return say(`${s.n} conosce già «${mv.n}».`);MENU=null;learnChain(m,[mv.n],()=>{})}]}),{title:"INSEGNA "+mv.n.toUpperCase(),party:1,info:()=>moveInfo(mv.n),onB:()=>bagMenu(false)})};
let DEXSEL=null;const dexMenu=()=>{const L=SP.slice().sort((a,b)=>a.dex-b.dex);menu(L.map(s=>[`${String(s.dex).padStart(3,"0")} ${G.seen[s.n]?s.n:"????????"} ${G.caught[s.n]?"●":G.seen[s.n]?"○":""}`,()=>{if(!G.seen[s.n])return;DEXSEL=s;menu([["CHIUDI",()=>{DEXSEL=null;dexMenu()}]],{small:1,onB:()=>{DEXSEL=null;dexMenu()}})}]),{title:`SCHEDARIO · visti ${Object.keys(G.seen).length} · presi ${Object.keys(G.caught).length}`,onB:()=>startMenu(),dex:1})};
const cardMenu=()=>{CARD=1;menu([["CHIUDI",()=>{CARD=0;startMenu()}]],{small:1,onB:()=>{CARD=0;startMenu()}})};let CARD=0;
const VOLS=[0,25,50,75,100];const optMenu=()=>{G.opts.mv=G.opts.mv==null?3:G.opts.mv;G.opts.sv=G.opts.sv==null?3:G.opts.sv;applyVol();const bar=v=>"▮".repeat(v)+"▯".repeat(4-v);menu([[`MUSICA  ${bar(G.opts.mv)} ${VOLS[G.opts.mv]}%`,()=>{G.opts.mv=(G.opts.mv+1)%5;applyVol();if(G.opts.mv&&!AU.cur){AU.cur=null;playMus(M?M.mus:"title")}optMenu()}],[`EFFETTI ${bar(G.opts.sv)} ${VOLS[G.opts.sv]}%`,()=>{G.opts.sv=(G.opts.sv+1)%5;applyVol();SFX.sel();optMenu()}],[`TESTO: ${["LENTO","NORMALE","VELOCE"][G.opts.text]}`,()=>{G.opts.text=(G.opts.text+1)%3;optMenu()}],[`TASTI: ${G.opts.big?"GRANDI":"NORMALI"}`,()=>{G.opts.big=G.opts.big?0:1;PD._lay&&PD._lay();optMenu()}],["INDIETRO",()=>startMenu()]],{title:"OPZIONI",info:i=>["Volume della musica (tocca per cambiare)","Volume degli effetti","Velocità del testo","Grandezza dei pulsanti sullo schermo","Torna al menu"][i],onB:()=>startMenu()})};
const applyVol=()=>{if(!AU.ac)return;const mv=G?VOLS[G.opts.mv==null?3:G.opts.mv]/100:.75,sv=G?VOLS[G.opts.sv==null?3:G.opts.sv]/100:.75;AU.mgM.gain.value=.26*mv;AU.mgS.gain.value=.4*sv;AU.on=mv>0;if(!AU.on)stopMus()};

const flyMenu=()=>{const L=[["borgo","BORGO PARQUET"],["canestro","CANESTROPOLI"]].concat(TOWNS.map(t=>[t.id,t.n])).concat([["lega","LEGA DEI SOGNI"]]).filter(([k])=>k==="borgo"||G.flags["vis_"+k]);menu(L.map(([k,n])=>[n,()=>{G.surf=0;fade(()=>{const T=MAPS[k];const c=(T.blds||[]).find(b=>b.k==="center");if(c)loadMap(k,c.x+c.door,c.y+c.h,"down");else loadMap(k,8,6,"down")})}]),{title:"VOLO: DOVE?",onB:()=>startMenu()})};
/* SALA DEI CAMPIONI e titoli di coda */
const hallOfFame=()=>{if(!G.flags.champion){addItem("Pallone MVP",1);addItem("Pallone Leggenda",3)}G.flags.champion=1;G.flags.hof=(G.flags.hof||0)+1;G.flags.hofTeam=G.party.map(m=>[m.sp,m.lv]);save();playMus("win");HOF={t:0};say(["PROF. PARQUET: «Ce l hai fatta, {N}! Sei il nuovo CAMPIONE della Lega dei Sogni!»","«La tua squadra entra nella SALA DEI CAMPIONI.»","«Tieni: un PALLONE MVP, che non fallisce mai, e 3 PALLONI LEGGENDA. Si dice che nella regione si allenino giocatori leggendari…»"].concat(G.party.map(m=>`${MN(m)} · Lv ${m.lv}`)).concat(["Grazie per aver giocato a POKE DREAM!","…ma la regione nasconde ancora giocatori rarissimi: dicono che sul PERCORSO 6 una frana si sia aperta…"]),()=>{HOF=null;healAll();fade(()=>loadMap("casa2",3,3,"down"))})};let HOF=null;
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
/* negli interni la stanza viene ingrandita per riempire lo schermo (orizzontale e verticale) */
const drawWorld=(dt)=>{if(M.inside){const W_=M.rows[0].length*TS,H_=M.rows.length*TS,avH=VH-CTRLU-6;let Z=Math.min(VW/(W_+16),avH/(H_+24));Z=Math.max(1,Math.min(3,Math.floor(Z*4)/4));cx.fillStyle="#1c1917";cx.fillRect(0,0,VW,VH);/* cornice di muro attorno alla stanza */const sw=VW,sh=VH,sc=CTRLU;VW=sw/Z;VH=sh/Z;CTRLU=sc/Z;cx.save();cx.scale(Z,Z);try{drawWorld0(dt,true)}finally{cx.restore();VW=sw;VH=sh;CTRLU=sc}return}drawWorld0(dt,false)};
const drawWorld0=(dt,ins)=>{const W_=M.rows[0].length,H_=M.rows.length;let camX=Math.round((PL.px*TS+8)-VW/2),camY=Math.round((PL.py*TS+8)-(VH-CTRLU/2)/2);if(ins){const mw=W_*TS,mh=H_*TS,vh=VH-CTRLU;camX=mw<=VW?Math.round((mw-VW)/2):Math.max(-8,Math.min(mw-VW+8,camX));camY=mh<=vh?Math.round((mh-vh)/2):Math.max(-8,Math.min(mh-vh+8,camY))}
  if(ins){cx.fillStyle="#3f2a1d";cx.fillRect(-camX-6,-camY-6,W_*TS+12,H_*TS+12);cx.fillStyle="#2a1b12";cx.fillRect(-camX-3,-camY-3,W_*TS+6,H_*TS+6)}else{cx.fillStyle="#2a6a2a";cx.fillRect(0,0,VW,VH)}
  const x0=Math.floor(camX/TS)-1,y0=Math.floor(camY/TS)-1;for(let y=y0;y<=y0+VH/TS+2;y++)for(let x=x0;x<=x0+VW/TS+2;x++){let t=tileAt(x,y);if(t==null){if(M.inside)continue;const W2=M.rows[0].length,H2=M.rows.length,cxx=Math.max(0,Math.min(W2-1,x)),cyy=Math.max(0,Math.min(H2-1,y)),eg=M.rows[cyy][cxx];t=(eg===":"&&Math.abs(cxx-x)+Math.abs(cyy-y)<=3)?":":"T"}const T=t==="~"&&((Math.floor(performance.now()/600)+x+y)%2)?TILE["~2"]:(TILE[t]||TILE["."]);const X=x*TS-camX,Y=y*TS-camY;cx.drawImage(T,X,Y);
   /* bordi: sentiero più scuro dove tocca l erba, riva chiara attorno all acqua */if(t===":"||t==="~"){const nb=(a,b)=>tileAt(x+a,y+b);const edge=t===":"?(q=>q!=null&&q!==":"&&q!=="="&&q!=="s"&&q!=="L"):(q=>q!=null&&q!=="~");const col=t===":"?"rgba(120,85,35,.5)":"#d9f2ff";if(edge(nb(0,-1)))cx.fillStyle=col,cx.fillRect(X,Y,16,1);if(edge(nb(0,1)))cx.fillStyle=col,cx.fillRect(X,Y+15,16,1);if(edge(nb(-1,0)))cx.fillStyle=col,cx.fillRect(X,Y,1,16);if(edge(nb(1,0)))cx.fillStyle=col,cx.fillRect(X+15,Y,1,16)}}
  /* ombre degli edifici */(M.blds||[]).forEach(b=>{cx.fillStyle="rgba(0,0,0,.16)";cx.fillRect(b.x*TS-camX+3,(b.y+b.h)*TS-camY,b.w*TS,3);cx.fillRect((b.x+b.w)*TS-camX,b.y*TS-camY+8,3,b.h*TS-5)});
  (M.objs||[]).forEach(o=>OBJDRAW(cx,o,o.x*TS-camX,o.y*TS-camY));
  (M.items||[]).forEach(it=>{if(G.items[it.id])return;const X=it.x*TS-camX,Y=it.y*TS-camY;cx.fillStyle="#7c2d12";cx.fillRect(X+3,Y+6,10,8);cx.fillStyle="#b45309";cx.fillRect(X+4,Y+7,8,6);cx.fillStyle="#fde68a";cx.fillRect(X+7,Y+4,2,3);cx.fillRect(X+5,Y+9,6,1)});
  const ents=[];(M.blds||[]).forEach(b=>ents.push({y:b.y+b.h-1,d:()=>drawBld(cx,b,b.x*TS-camX,b.y*TS-camY)}));
  NPCS.forEach(n=>{if(n.vis&&n.legend){const s=SPX[n.legend];if(s)ents.push({y:n.py,d:()=>{const b=Math.abs(Math.sin(performance.now()/260))*1.5,X=Math.round(n.px*TS-camX)+1,Y=Math.round(n.py*TS-camY+2-b);cx.fillStyle="rgba(250,204,21,.4)";cx.beginPath();cx.ellipse(X+7,Y+13,7,2.5,0,0,7);cx.fill();cx.drawImage(drawPlayer(s,false),X,Y,14,14);if(Math.floor(performance.now()/250)%4===0){cx.fillStyle="#fde047";cx.fillRect(X,Y,2,2);cx.fillRect(X+12,Y+3,2,2)}}});return}if(!n.vis||n.spr==="none")return;ents.push({y:n.py,d:()=>{const sp=sprFor(n.spr,n.col),r=["down","left","right","up"].indexOf(n.dir),f=n.mv?Math.floor((n.wt||0)*4)%4:0;{const fh=sp.fh||20,k=fh>20?1.17:1,w=Math.round(16*k),h=Math.round(fh*k);cx.drawImage(sp,f*16,r*fh,16,fh,Math.round(n.px*TS-camX-(w-16)/2),Math.round(n.py*TS-camY+15-h),w,h)}if(n.alert){cx.fillStyle="#fff";cx.fillRect(Math.round(n.px*TS-camX)+4,Math.round(n.py*TS-camY)-20,8,10);cx.fillStyle="#dc2626";cx.fillRect(Math.round(n.px*TS-camX)+7,Math.round(n.py*TS-camY)-18,2,5);cx.fillRect(Math.round(n.px*TS-camX)+7,Math.round(n.py*TS-camY)-12,2,2)}}})});
  ents.push({y:PL.py,d:()=>{const sp=sprFor("hero"),r=["down","left","right","up"].indexOf(PL.dir);const hx=Math.round(PL.px*TS-camX),hy=Math.round(PL.py*TS-camY);if(G.surf){cx.fillStyle="#1e40af";cx.beginPath();cx.ellipse(hx+8,hy+12,9,5,0,0,7);cx.fill();cx.fillStyle="#93c5fd";cx.fillRect(hx,hy+12,16,1)}if(G.bike&&!G.surf){cx.fillStyle="#111";cx.beginPath();cx.arc(hx+3,hy+13,3,0,7);cx.arc(hx+13,hy+13,3,0,7);cx.fill();cx.fillStyle=TEAM().cap;cx.fillRect(hx+3,hy+11,10,2)}const f=PL.mv?(Math.floor(PL.wt*4)%4):0;const jy=PL.jump?-Math.sin(Math.min(1,PL.prog||0)*Math.PI)*8:0;{const fh=sp.fh||20,k=fh>20?1.17:1,w=Math.round(16*k),h=Math.round(fh*k);cx.fillStyle="rgba(0,0,0,.2)";cx.beginPath();cx.ellipse(Math.round(PL.px*TS-camX)+8,Math.round(PL.py*TS-camY)+14,7,2.5,0,0,7);cx.fill();cx.drawImage(sp,f*16,r*fh,16,fh,Math.round(PL.px*TS-camX-(w-16)/2),Math.round(PL.py*TS-camY+15-h+jy),w,h)}
    if(tileAt(Math.round(PL.px),Math.round(PL.py))==='"'&&!PL.mv){cx.drawImage(TILE['"'],0,8,16,8,Math.round(PL.px*TS-camX),Math.round(PL.py*TS-camY)+8,16,8)}}});
  ents.sort((a,b)=>a.y-b.y).forEach(e=>e.d());
  /* giorno e notte: tinta leggera sull esterno */if(!M.inside){const ph=dayPhase();const tint=ph==="notte"?"rgba(20,24,80,.42)":ph==="sera"?"rgba(255,120,40,.16)":ph==="mattina"?"rgba(255,230,160,.10)":null;if(tint){cx.fillStyle=tint;cx.fillRect(0,0,VW,VH)}if(ph==="notte"){/* lucine delle finestre */(M.blds||[]).forEach(b=>{for(let i=0;i<b.w;i++){if(b.door!=null&&i===b.door)continue;if(b.w>3&&(i===0||i===b.w-1)&&b.k!=="lab")continue;cx.fillStyle="rgba(255,230,120,.55)";cx.fillRect(b.x*TS+i*TS+4-camX,b.y*TS+Math.round(b.h*TS*.45)+4-camY,8,6)}})}}
  /* ingressi: patina scura sui varchi del bordo che portano a un altra zona */if(!M.inside){const H_=M.rows.length,W_=M.rows[0].length,op=(q)=>q!=null&&!"TR#SXY_".includes(q);const dark=(X,Y,w,h,dir)=>{const g=dir==="n"?cx.createLinearGradient(0,Y,0,Y+h):dir==="s"?cx.createLinearGradient(0,Y+h,0,Y):dir==="w"?cx.createLinearGradient(X,0,X+w,0):cx.createLinearGradient(X+w,0,X,0);g.addColorStop(0,"rgba(0,0,0,1)");g.addColorStop(.4,"rgba(0,0,0,.85)");g.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=g;cx.fillRect(X,Y,w,h)};const has=d=>(M.ex&&M.ex[d]&&M.ex[d].to)||(M.links&&M.links[d]);
    if(has("n"))for(let x=0;x<W_;x++)if(op(M.rows[0][x]))dark(x*TS-camX,-camY-48,16,80,"n");if(has("s"))for(let x=0;x<W_;x++)if(op(M.rows[H_-1][x]))dark(x*TS-camX,H_*TS-camY-32,16,80,"s");if(has("w"))for(let y=0;y<H_;y++)if(op(M.rows[y][0]))dark(-camX-48,y*TS-camY,80,16,"w");if(has("e"))for(let y=0;y<H_;y++)if(op(M.rows[y][W_-1]))dark(W_*TS-camX-32,y*TS-camY,80,16,"e")}
  if(ban.t>0){ban.t-=dt;const a=Math.min(1,ban.t*2);cx.globalAlpha=a;cx.fillStyle="#f8fafc";cx.fillRect(4,4,110,16);cx.fillStyle="#334155";cx.fillRect(4,4,110,2);cx.fillRect(4,18,110,2);cx.globalAlpha=1}};

/* ---------- sfondi della lotta: disegnati su tutto lo schermo, il riquadro 240x160 sta in (OX,OY) ---------- */
const BGT={v:null};
const bgTheme=()=>BGT.v||"palazzetto";
const BGCACHE={};
const drawBattleBG=()=>{const th=bgTheme(),W=VW,H=VH,ox=OX,oy=OY,L_=BL(),hz=oy+L_.hz;const key=th+W+"x"+H+"_"+oy+"_"+L_.hz;let c=BGCACHE[key];
 if(!c){let x;[c,x]=cnv(W,H);const R=sR(hsh(th));const g=(y0,y1,stops)=>{const gr=x.createLinearGradient(0,y0,0,y1);stops.forEach(([p,col])=>gr.addColorStop(p,col));return gr};const rect=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
  if(th==="palazzetto"){x.fillStyle=g(0,hz,[[0,"#0b1026"],[1,"#1e2a52"]]);x.fillRect(0,0,W,hz);
    /* spalti con tifosi */const nr=Math.max(7,Math.ceil((hz-14)/7));for(let r=0;r<nr;r++){const y=hz-4-(nr-r)*7,far=(nr-r)>8;rect(r%2?(far?"#1b2448":"#24315f"):(far?"#202a54":"#2b3a70"),0,y,W,7);for(let i=0;i<W;i+=3){if(R()<(far?.28:.8)){const cols=["#f87171","#fbbf24","#60a5fa","#f472b6","#fff","#a78bfa","#34d399"];rect(cols[Math.floor(R()*cols.length)],i+Math.floor(R()*2),y+1+Math.floor(R()*2),2,2)}}}
    /* luci */for(let i=0;i<6;i++){const lx=ox+20+i*40;rect("#fef9c3",lx,6,10,3);x.fillStyle="rgba(254,249,195,.07)";x.beginPath();x.moveTo(lx,9);x.lineTo(lx+10,9);x.lineTo(lx+40,hz);x.lineTo(lx-30,hz);x.fill()}
    rect("#0f172a",0,hz-3,W,3);rect("#facc15",0,hz-4,W,1);
    /* parquet chiaro a doghe */x.fillStyle=g(hz,H,[[0,"#e9b872"],[1,"#c98c4a"]]);x.fillRect(0,hz,W,H-hz);for(let y=hz;y<H;y+=4){rect("rgba(120,70,20,.18)",0,y,W,1);for(let i=(y/4%2)*13;i<W;i+=26)rect("rgba(120,70,20,.22)",i,y,1,4)}
    x.strokeStyle="rgba(255,255,255,.85)";x.lineWidth=1;x.beginPath();x.moveTo(0,hz+18);x.lineTo(W,hz+18);x.stroke();
    var baseF=["#7c3aed","rgba(255,255,255,.9)"],baseP=["#2563eb","rgba(255,255,255,.9)"]}
  else if(th==="playground"){x.fillStyle=g(0,hz,[[0,"#60a5fa"],[1,"#bfdbfe"]]);x.fillRect(0,0,W,hz);
    for(let i=0;i<5;i++){const cxx=R()*W,cy=10+R()*30;x.fillStyle="rgba(255,255,255,.9)";x.beginPath();x.ellipse(cxx,cy,16,5,0,0,7);x.ellipse(cxx+10,cy-3,10,5,0,0,7);x.fill()}
    /* palazzi */let bx=0;while(bx<W){const bw=14+R()*22,bh=20+R()*36,col=["#94a3b8","#a5b4fc","#fca5a5","#fdba74","#cbd5e1"][Math.floor(R()*5)];rect(col,bx,hz-bh,bw,bh);for(let yy=hz-bh+4;yy<hz-6;yy+=6)for(let xx=bx+3;xx<bx+bw-3;xx+=5)rect("rgba(255,255,255,.55)",xx,yy,2,3);bx+=bw+2}
    /* rete metallica */rect("#475569",0,hz-26,W,1);for(let i=0;i<W;i+=6){x.strokeStyle="rgba(71,85,105,.55)";x.beginPath();x.moveTo(i,hz-26);x.lineTo(i+6,hz);x.moveTo(i+6,hz-26);x.lineTo(i,hz);x.stroke()}
    x.fillStyle=g(hz,H,[[0,"#3b82f6"],[1,"#1d4ed8"]]);x.fillRect(0,hz,W,H-hz);rect("#16a34a",0,hz,W,3);x.strokeStyle="rgba(255,255,255,.9)";x.beginPath();x.moveTo(0,hz+16);x.lineTo(W,hz+16);x.stroke();x.beginPath();x.ellipse(ox+120,hz+44,60,12,0,0,7);x.stroke();
    var baseF=["#f97316","#fff"],baseP=["#f97316","#fff"]}
  else if(th==="tramonto"){x.fillStyle=g(0,hz,[[0,"#4c1d95"],[.45,"#db2777"],[.8,"#fb923c"],[1,"#fde68a"]]);x.fillRect(0,0,W,hz);x.fillStyle="#fef3c7";x.beginPath();x.arc(ox+60,hz-8,18,Math.PI,0);x.fill();
    rect("#0e7490",0,hz-10,W,10);for(let i=0;i<W;i+=7)rect("rgba(254,243,199,.5)",i+Math.floor(R()*4),hz-8+Math.floor(R()*6),4,1);
    /* palme */for(let k=0;k<3;k++){const px0=Math.floor(R()*W);x.strokeStyle="#1f1235";x.lineWidth=3;x.beginPath();x.moveTo(px0,hz);x.quadraticCurveTo(px0+6,hz-24,px0+2,hz-44);x.stroke();x.fillStyle="#1f1235";for(let a=0;a<6;a++){x.beginPath();x.ellipse(px0+2+Math.cos(a)*9,hz-44+Math.sin(a)*3,10,2.5,a,0,7);x.fill()}}x.lineWidth=1;
    x.fillStyle=g(hz,H,[[0,"#f2c48d"],[1,"#d99a5b"]]);x.fillRect(0,hz,W,H-hz);x.strokeStyle="rgba(255,255,255,.75)";x.beginPath();x.moveTo(0,hz+16);x.lineTo(W,hz+16);x.stroke();
    var baseF=["#be185d","#fde68a"],baseP=["#7c3aed","#fde68a"]}
  else if(th==="neon"){x.fillStyle=g(0,hz,[[0,"#0a0118"],[1,"#2e1065"]]);x.fillRect(0,0,W,hz);for(let i=0;i<40;i++)rect("rgba(255,255,255,.6)",Math.floor(R()*W),Math.floor(R()*(hz-30)),1,1);
    let bx=0;while(bx<W){const bw=12+R()*20,bh=16+R()*40;rect("#140a2e",bx,hz-bh,bw,bh);for(let yy=hz-bh+3;yy<hz-4;yy+=5)for(let xx=bx+2;xx<bx+bw-2;xx+=4)if(R()<.4)rect(R()<.5?"#f0abfc":"#67e8f9",xx,yy,2,2);bx+=bw+1}
    rect("#f472b6",0,hz-2,W,2);x.fillStyle=g(hz,H,[[0,"#1e1b4b"],[1,"#0f0a24"]]);x.fillRect(0,hz,W,H-hz);for(let i=-W;i<W*2;i+=16){x.strokeStyle="rgba(34,211,238,.35)";x.beginPath();x.moveTo(ox+120,hz);x.lineTo(i,H);x.stroke()}for(let y=hz+6,k=1;y<H;y+=k*3,k++){rect("rgba(244,114,182,.35)",0,y,W,1)}
    var baseF=["#22d3ee","#f0abfc"],baseP=["#f472b6","#67e8f9"]}
  else if(th==="grotta"){x.fillStyle=g(0,H,[[0,"#1c1917"],[1,"#44403c"]]);x.fillRect(0,0,W,H);for(let i=0;i<60;i++){x.fillStyle=R()<.5?"#292524":"#57534e";x.beginPath();x.ellipse(R()*W,R()*hz,4+R()*10,3+R()*6,0,0,7);x.fill()}for(let i=0;i<W;i+=10+Math.floor(R()*14)){x.fillStyle="#0c0a09";x.beginPath();x.moveTo(i,0);x.lineTo(i+6,0);x.lineTo(i+3,10+R()*16);x.fill()}x.fillStyle=g(hz,H,[[0,"#78716c"],[1,"#57534e"]]);x.fillRect(0,hz,W,H-hz);
    var baseF=["#a8a29e","#d6d3d1"],baseP=["#a8a29e","#d6d3d1"]}
  else{/* prato */x.fillStyle=g(0,hz,[[0,"#7dd3fc"],[1,"#e0f2fe"]]);x.fillRect(0,0,W,hz);for(let i=0;i<4;i++){const cxx=R()*W,cy=10+R()*24;x.fillStyle="#fff";x.beginPath();x.ellipse(cxx,cy,18,5,0,0,7);x.ellipse(cxx+9,cy-3,10,5,0,0,7);x.fill()}
    for(let i=0;i<W;i+=9){x.fillStyle=i%2?"#15803d":"#166534";x.beginPath();x.arc(i,hz-4,9+R()*5,Math.PI,0);x.fill()}x.fillStyle=g(hz,H,[[0,"#86efac"],[1,"#4ade80"]]);x.fillRect(0,hz,W,H-hz);for(let i=0;i<220;i++)rect(R()<.5?"#22c55e":"#bbf7d0",Math.floor(R()*W),hz+Math.floor(R()*(H-hz)),1,2);
    var baseF=["#65a30d","#d9f99d"],baseP=["#65a30d","#d9f99d"]}
  c._bF=baseF;c._bP=baseP;BGCACHE[key]=c}
 cx.drawImage(c,0,0);
 /* basi sotto i giocatori */const bs=(X,Y,rx,ry,b)=>{cx.fillStyle="rgba(0,0,0,.22)";cx.beginPath();cx.ellipse(X,Y+2,rx,ry,0,0,7);cx.fill();cx.fillStyle=b[0];cx.beginPath();cx.ellipse(X,Y,rx,ry,0,0,7);cx.fill();cx.strokeStyle=b[1];cx.lineWidth=1;cx.beginPath();cx.ellipse(X,Y,rx*.7,ry*.6,0,0,7);cx.stroke()};
 bs(ox+L_.fbase[0],oy+L_.fbase[1],L_.fbase[2],L_.fbase[3],c._bF);bs(ox+L_.pbase[0],oy+L_.pbase[1],L_.pbase[2],L_.pbase[3],c._bP)};
/* colori dei palloni da cattura: [fondo, cuciture, stemma] */const BALLC={"Pallone":["#f97316","#431407"],"Super Pallone":["#2563eb","#0b1a4a","#ef4444"],"Iper Pallone":["#1f2937","#facc15","#facc15"],"Pallone MVP":["#7c3aed","#f5f3ff","#f472b6"],"Pallone Rete":["#14b8a6","#042f2e","#fff"],"Pallone Tuffo":["#0ea5e9","#082f49","#fff"],"Pallone Esca":["#16a34a","#052e16","#fde047"],"Pallone Vivaio":["#84cc16","#1a2e05"],"Pallone Bis":["#dc2626","#450a0a","#fde047"],"Pallone Timer":["#f5f5f4","#dc2626","#111"],"Pallone Rapido":["#38bdf8","#facc15","#facc15"],"Pallone Notte":["#111827","#22c55e","#22c55e"],"Pallone Cura":["#f9a8d4","#831843","#fff"],"Pallone Livello":["#b91c1c","#fde047"],"Pallone Peso":["#64748b","#0f172a","#cbd5e1"],"Pallone Veloce":["#fde047","#dc2626","#2563eb"],"Pallone Leggenda":["#0f172a","#fbbf24","#e879f9"],"Pallone Premier":["#f8fafc","#dc2626"]};
/* posizioni della lotta: in verticale si usa lo spazio sopra il riquadro 240x160 (coordinate negative) */
const BL=()=>{const e=(CTRLU>0&&mode==="battle")?OY:0;if(e<40)return{e:0,hz:86,fb:[6,8],pb:[134,86],fs:[156,8,56],ps:[16,44,96],fbase:[184,62,38,8],pbase:[64,136,62,13]};
  const fz=Math.round(Math.min(104,60+e*.2)),fy=Math.round(-e*.5),fx=228-fz,pz=Math.round(Math.min(150,100+e*.22)),py=Math.round(118-pz*.86);
  return{e,hz:fy+fz-14,fb:[6,fy+Math.round(fz*.25)],pb:[134,Math.min(86,py+Math.round(pz*.25))],fs:[fx,fy,fz],ps:[2,py,pz],fbase:[fx+fz/2,fy+fz-4,fz*.55,fz*.13],pbase:[2+pz/2,118,pz*.65,pz*.13]}};
const drawBattle=(dt)=>{const L_=BL();const P=active(B.P),F=active(B.F);B.anim+=dt;
  /* sfondo: campetto */
  
  const sf=B.shake.f>0?Math.sin(B.anim*60)*3:0,sp=B.shake.p>0?Math.sin(B.anim*60)*3:0;B.shake.f=Math.max(0,B.shake.f-dt);B.shake.p=Math.max(0,B.shake.p-dt);
  const slide=Math.min(1,B.anim*2);
  if(F&&!(B.fall&&B.fall.f)&&!B.caught){const im=drawPlayer(SPX[F.sp],false,F.shiny);if(B.ball)cx.globalAlpha=B.ball.ok?0:.15;cx.drawImage(im,Math.round(L_.fs[0]+sf+(1-slide)*-120),L_.fs[1],L_.fs[2],L_.fs[2]);cx.globalAlpha=1}
  if(B.ball||B.caught){const bk=(B.ball&&B.ball.k)||B.lastBall||"Pallone";if(B.ball)B.lastBall=bk;const C=BALLC[bk]||BALLC.Pallone;const bl=B.ball||{ph:"caught"},now=performance.now();let w=0,ox=0,oy=0;if(bl.ph==="throw"){const p=Math.min(1,(now-bl.t0)/650);ox=-(1-p)*(L_.fbase[0]-L_.ps[0]-20);oy=-(1-p)*40-Math.sin(p*Math.PI)*50+(1-p)*60;w=p*12}else if(bl.ph==="wob"){const e=(now-bl.wt)/1000;if(e<.45)w=Math.sin(e*Math.PI*4.4)*.55*(1-e/.45)}else if(bl.ph==="break"){oy=-4}
    cx.save();cx.translate(L_.fbase[0]+ox,L_.fbase[1]-5*L_.fs[2]/56+oy);cx.scale(L_.fs[2]/56,L_.fs[2]/56);cx.rotate(w);cx.fillStyle=C[0];cx.beginPath();cx.arc(0,0,6,0,7);cx.fill();cx.strokeStyle=C[1];cx.lineWidth=1;cx.beginPath();cx.arc(0,0,6,0,7);cx.moveTo(-6,0);cx.lineTo(6,0);cx.moveTo(0,-6);cx.lineTo(0,6);cx.stroke();cx.beginPath();cx.arc(-7,0,5,-1,1);cx.stroke();cx.beginPath();cx.arc(7,0,5,Math.PI-1,Math.PI+1);cx.stroke();if(C[2]){cx.fillStyle=C[2];cx.fillRect(-2,-2,4,4)}cx.fillStyle="rgba(255,255,255,.5)";cx.fillRect(-4,-4,2,2);if(bl.ph==="caught"||B.caught){const e=(now%900)/900;cx.fillStyle="#fde047";[[-12,-10],[12,-12],[0,-16]].forEach(([a,b],q)=>{const k=1+((e+q*.3)%1)*.6;cx.fillRect(a*k-1,b*k-1,2,2)})}if(bl.ph==="absorb"){cx.fillStyle="rgba(255,255,255,.7)";cx.beginPath();cx.arc(0,0,10,0,7);cx.fill()}if(bl.ph==="break"){cx.fillStyle="rgba(255,255,255,.85)";cx.beginPath();cx.arc(0,0,14,0,7);cx.fill()}cx.restore()}
  if(P&&!(B.fall&&B.fall.p)){const im=drawPlayer(SPX[P.sp],true,P.shiny);cx.drawImage(im,Math.round(L_.ps[0]+sp+(1-slide)*120),L_.ps[1],L_.ps[2],L_.ps[2])}
  const box=(X,Y,m,mine)=>{if(!m)return;const s=SPX[m.sp],H=stat(m,"hp"),h=mine?30:24,ac=({G:TY.GUA.c,F:TY.ALA.c,C:TY.CEN.c})[s.role]||"#64748b";/* codina che punta al proprio giocatore */cx.fillStyle="#334155";if(mine){cx.beginPath();cx.moveTo(X+1,Y+h-9);cx.lineTo(X-9,Y+h+3);cx.lineTo(X+1,Y+h-1);cx.fill()}else{cx.beginPath();cx.moveTo(X+99,Y+h-9);cx.lineTo(X+111,Y+h+5);cx.lineTo(X+99,Y+h-1);cx.fill()}cx.fillStyle="#f8fafc";cx.fillRect(X,Y,100,h);cx.fillStyle="#334155";cx.fillRect(X,Y,100,1);cx.fillRect(X,Y+(mine?29:23),100,1);cx.fillRect(X,Y,1,mine?30:24);cx.fillRect(X+99,Y,1,mine?30:24);cx.fillStyle=ac;if(mine)cx.fillRect(X+1,Y+1,2,h-2);else cx.fillRect(X+97,Y+1,2,h-2);
    const f=m.hp/H;cx.fillStyle="#1f2937";cx.fillRect(X+30,Y+12,64,5);cx.fillStyle=f>.5?"#22c55e":f>.2?"#eab308":"#ef4444";cx.fillRect(X+31,Y+13,Math.round(62*f),3);if(mine){const L=m.lv,x0=expAt(L),x1=expAt(L+1);cx.fillStyle="#1e3a8a";cx.fillRect(X+30,Y+25,64,2);cx.fillStyle="#38bdf8";cx.fillRect(X+30,Y+25,Math.round(64*cl((m.xp-x0)/Math.max(1,x1-x0),0,1)),2)}};
  box(L_.fb[0],L_.fb[1],F,false);box(L_.pb[0],L_.pb[1],P,true)};
/* testo nitido sopra la grafica pixel */
const U=v=>v*SC;
const APO=s=>String(s).replace(/\b(l|L|dell|Dell|nell|Nell|all|All|dall|Dall|sull|Sull|c|C|quest|Quest|un|Un)\s(?=[aeiouàèéìòùAEIOUH])/g,(m,w)=>/^un$/i.test(w)?m:w+"’");
const UIF='"Arial Rounded MT Bold","Nunito","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';const uiText=(s,X,Y,size,col,al,maxW)=>{s=APO(String(s));ux.fillStyle=col||"#111827";let sz=size||8;ux.font=`800 ${U(sz)}px ${UIF}`;if(maxW){while(sz>4&&ux.measureText(s).width>U(maxW)){sz-=.25;ux.font=`800 ${U(sz)}px ${UIF}`}}ux.textAlign=al||"left";ux.textBaseline="top";ux.fillText(s,U(X),U(Y))};
const uiBox=(X,Y,w,h,fill)=>{ux.fillStyle="#334155";ux.fillRect(U(X),U(Y),U(w),U(h));ux.fillStyle=fill||"#f8fafc";ux.fillRect(U(X+1.5),U(Y+1.5),U(w-3),U(h-3));ux.fillStyle="#cbd5e1";ux.fillRect(U(X+1.5),U(Y+h-3),U(w-3),U(1.5))};
const drawUI=()=>{ux.setTransform(1,0,0,1,0,0);ux.clearRect(0,0,ui.width,ui.height);ux.setTransform(1,0,0,1,Math.round(U(OX)),Math.round(U(OY)));if(mode==="battle"&&B){const P=active(B.P),F=active(B.F);const lab=(X,Y,m,mine)=>{if(!m)return;const s=SPX[m.sp];uiText(MN(m),X+(mine?6:4),Y+2,7,"#111827","left",68);uiText("Lv"+m.lv,X+97,Y+2,7,"#111827","right");uiText("PV",X+20,Y+11,5,"#b45309");if(m.st)uiText(STN[m.st],X+3,Y+11,6,"#dc2626");if(mine)uiText(`${m.hp}/${stat(m,"hp")}`,X+95,Y+17,6,"#111827","right");if(G.caught[m.sp]&&!mine)uiText("●",X+90,Y+11,6,"#dc2626")};lab(BL().fb[0],BL().fb[1],F,false);lab(BL().pb[0],BL().pb[1],P,true)}
  if(mode==="world"&&ban.t>0)uiText(ban.s,59-OX,7-OY,7,"#111827","center");
  if(TB){TB.n=Math.min(TB.s.length,TB.n+[.6,1.2,3][G?G.opts.text:1]);uiBox(2,118,236,40);const words=TB.s.slice(0,Math.floor(TB.n));wrap(words,8,124,226,8,"#111827");if(TB.n>=TB.s.length&&Math.floor(performance.now()/300)%2)uiText("▼",228,148,7,"#dc2626")}
  if(MENU)drawMenu();
  if(MAPVIEW)drawRegionMap();if(SUMM)drawSumm();if(DEXSEL)drawDex();if(CARD)drawCard()};
const wrap=(s,X,Y,w,size,col)=>{s=APO(s);ux.font=`800 ${U(size)}px ${UIF}`;const lines=[];s.split("\n").forEach(p=>{let l="";p.split(" ").forEach(wd=>{const t=l?l+" "+wd:wd;if(ux.measureText(t).width>U(w)){lines.push(l);l=wd}else l=t});lines.push(l)});lines.slice(0,3).forEach((l,i)=>uiText(l,X,Y+i*(size+3),size,col))};
/* zaino grafico */
const drawBag=m=>{const ks=m.keys,C=m.cols,B=m.inB;/* fondo zaino */ux.fillStyle="#7c2d12";ux.fillRect(U(2),U(2),U(236),U(156));ux.fillStyle="#9a3412";ux.fillRect(U(4),U(4),U(232),U(152));
  /* tasche */POCK.forEach((pk,t)=>{const X=6+t*38,on=t===bagPocket;ux.fillStyle=on?"#fef3c7":"#c2410c";ux.fillRect(U(X),U(5),U(36),U(24));ux.fillStyle=on?"#f59e0b":"#7c2d12";ux.fillRect(U(X),U(on?27:27),U(36),U(2));const ik=POCKICON[pk[0]]||Object.keys(IT).find(k=>IT[k].p===pk[0]);if(ik){ux.imageSmoothingEnabled=false;ux.drawImage(ICON(ik),U(X+12),U(6),U(12),U(12))}uiText(pk[1],X+18,19.5,5.2,on?"#7c2d12":"#fed7aa","center",34);menuRects.push([X,5,36,24,-1,()=>m.tab(t)])});
  /* caselle */ux.fillStyle="#fffbeb";ux.fillRect(U(6),U(31),U(228),U(88));const rows=Math.max(3,Math.ceil(ks.length/C)),vis=3,top=Math.max(0,Math.min(Math.floor(m.i/C)-1,rows-vis));
  for(let r=0;r<vis;r++)for(let c=0;c<C;c++){const i=(top+r)*C+c,X=9+c*37.5,Y=34+r*28.5;const sel=i===m.i&&ks.length;ux.fillStyle=sel?"#fde68a":"#fef3c7";ux.fillRect(U(X),U(Y),U(35),U(26));ux.strokeStyle=sel?"#dc2626":"#e7d3a8";ux.lineWidth=U(sel?1.2:.6);ux.strokeRect(U(X),U(Y),U(35),U(26));const k=ks[i];if(!k)continue;ux.imageSmoothingEnabled=false;ux.drawImage(ICON(k),U(X+7),U(Y+2),U(21),U(21));uiText("×"+G.bag[k],X+34,Y+18.5,5.5,"#7c2d12","right");menuRects.push([X,Y,35,26,i])}
  if(rows>vis){uiText(top>0?"▲":"",230,33,5,"#7c2d12","right");uiText(top+vis<rows?"▼":"",230,112,5,"#7c2d12","right")}
  if(!ks.length)uiText("Tasca vuota",120,70,8,"#a16207","center");
  /* descrizione */ux.fillStyle="#f8fafc";ux.fillRect(U(6),U(121),U(228),U(35));const k=ks[m.i];if(k){ux.drawImage(ICON(k),U(9),U(124),U(16),U(16));uiText(k,29,124,7.5,"#111827","left",160);uiText("×"+G.bag[k],230,124,7,"#7c2d12","right");wrap(IT[k].d||"",29,134,200,5.8,"#334155")}else uiText(B?"B per tornare alla lotta":"◀ ▶ per cambiare tasca · B per chiudere",120,134,6,"#64748b","center")};
let menuRects=[];const drawMenu=()=>{const m=MENU;menuRects=[];if(m.bag)return drawBag(m);
  if(m.battle&&m.grid){const moves=m.moves;if(moves){/* come nel genere: 4 mosse a sinistra, PP e tipo della mossa scelta a destra */uiBox(2,118,160,40);uiBox(164,118,74,40);m.items.forEach((it,i)=>{const X=12+(i%2)*76,Y=125+Math.floor(i/2)*15;if(i===m.i)uiText("▶",X-8,Y,7,"#dc2626");const mm=moves.moves[i];if(mm){const mv=MV[mm.n],own=SPX[moves.sp]&&SPX[moves.sp].t.includes(mv.t);ux.imageSmoothingEnabled=false;ux.drawImage(TICON(mv.t),U(X),U(Y+.5),U(8),U(8));if(own)uiText("★",X+8.5,Y-1,5,"#facc15","left")}uiText(it[0],X+11,Y,7,mm&&mm.pp<=0?"#9ca3af":"#111827","left",59);menuRects.push([X-9,Y-3,76,14,i])});const mm=moves.moves[m.i];if(mm){const mv=MV[mm.n];uiText("PP",170,125,7,"#334155");uiText(`${mm.pp}/${maxPP(0,mm)}`,232,125,7,mm.pp<=0?"#dc2626":"#111827","right");ux.fillStyle=TY[mv.t].c;ux.fillRect(U(170),U(135),U(62),U(12));ux.imageSmoothingEnabled=false;ux.drawImage(TICON(mv.t),U(172),U(137),U(8),U(8));uiText(TY[mv.t].n,205,136.5,7,TYTX(mv.t),"center",48);if(SPX[moves.sp]&&SPX[moves.sp].t.includes(mv.t))uiText("★ del suo ruolo",201,149.5,5,"#334155","center",66);else if(mv.t==="BAS")uiText("mossa base",201,149.5,5,"#334155","center",66)}return}
  uiBox(120,118,118,40);m.items.forEach((it,i)=>{const X=130+(i%2)*56,Y=125+Math.floor(i/2)*15;if(i===m.i)uiText("▶",X-8,Y,8,"#dc2626");uiText(it[0],X,Y,8,"#111827","left",48);menuRects.push([X-9,Y-3,56,14,i])});return}
  const n=m.items.length,vis=Math.min(n,(m.party||m.pcbox)?6:9),top=Math.max(0,Math.min(m.i-Math.floor(vis/2),n-vis));const w=m.small?70:(m.party||m.pcbox)?170:m.side?92:m.keys?216:200,X=m.small?166:m.side?(mode==="battle"?146:VW-OX-94):m.keys?12:(240-w)/2,lh=(m.party||m.pcbox)?16:12,h=vis*lh+(m.title?16:8),Y=m.small?Math.max(4,116-h):m.side?(mode==="battle"?4:MENUY-OY):Math.max(2,(m.info?92:150)-h);
  uiBox(X,Y,w,h);if(m.title)uiText(m.title,X+6,Y+4,6.5,"#1d4ed8");for(let k=0;k<vis;k++){const i=top+k,it=m.items[i];const yy=Y+(m.title?15:6)+k*lh;if(i===m.i)uiText("▶",X+5,yy+((m.party||m.pcbox)?3:0),8,"#dc2626");
    if((m.party&&G.party[i]||m.pcbox&&G.box[i])&&it[0]!=="INDIETRO"){const mm=(m.pcbox?G.box[i]:G.party[i])||{},s=SPX[mm.sp];if(s){ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false,mm.shiny),U(X+12),U(yy-2),U(16),U(16));uiText(MN(mm).length>14?(mm.nick||s.short):MN(mm),X+30,yy,6.5);uiText("Lv"+mm.lv,X+30,yy+8,5.5,"#475569");const H=stat(mm,"hp"),f=mm.hp/H;ux.fillStyle="#1f2937";ux.fillRect(U(X+100),U(yy+3),U(50),U(4));ux.fillStyle=f>.5?"#22c55e":f>.2?"#eab308":"#ef4444";ux.fillRect(U(X+100.5),U(yy+3.5),U(49*f),U(3));uiText(`${mm.hp}/${H}`,X+150,yy+8,5.5,"#334155","right");if(mm.st)uiText(STN[mm.st],X+100,yy+8,5.5,"#dc2626")}}
    else if(m.keys&&m.keys[i]&&IT[m.keys[i]]){const k=m.keys[i],it_=IT[k];ux.imageSmoothingEnabled=false;ux.drawImage(ICON(k),U(X+12),U(yy-1),U(10),U(10));let nm_=it_.mv?it_.mv:k;uiText(nm_,X+25,yy,6.5,"#111827","left",it_.mv?86:118);if(it_.mv){const mv=MV[it_.mv];ux.drawImage(TICON(mv.t),U(X+113),U(yy),U(8),U(8));/* chip dei ruoli che possono impararla */const roles=mv.r?mv.r.split(""):["G","F","C"];["G","F","C"].forEach((r,q)=>{const on=roles.includes(r),col={G:TY.GUA.c,F:TY.ALA.c,C:TY.CEN.c}[r];ux.fillStyle=on?col:"#e5e7eb";ux.fillRect(U(X+124+q*10),U(yy),U(9),U(8));uiText({G:"G",F:"A",C:"C"}[r],X+128.5+q*10,yy+.5,5.5,on?(r==="C"?"#111827":"#fff"):"#9ca3af","center")})}uiText(m.price?m.price(i):"",X+w-6,yy,6.5,"#7c2d12","right")}
    else uiText(it[0],X+14,yy,m.small?7:7,"#111827");menuRects.push([X,yy-2,w,lh,i])}
  if(n>vis){if(top>0)uiText("▲",X+w-10,Y+3,6,"#475569");if(top+vis<n)uiText("▼",X+w-10,Y+h-9,6,"#475569")}
  if(m.info){const t=m.info(m.i);if(t){uiBox(2,118,236,40);wrap(t,8,123,226,7,"#111827")}}
  if(m.preview){const s=SPX[m.preview(m.i)];if(s){uiBox(8,8,64,72,"#e0f2fe");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false),U(12),U(12),U(56),U(56));uiText(s.t.map(t=>TY[t].n).join("/"),40,70,5.5,"#334155","center")}}};
/* mappa della regione: schema con città, percorsi, medaglie e posizione attuale */
const RMAP=[["borgo","Borgo Parquet",30,126,"#f97316","r"],["route1","P1",30,106,null],["canestro","Canestropoli",30,88,"#38bdf8","r"],["route2","P2",30,62,null],["bosco","Bosco",30,40,null],["pineta","Pineta Alta",54,22,"#166534","b"],["route3","P3",82,22,null],["tunnel","Tunnel",106,22,null],["portocampo","Portocampo",132,22,"#0369a1","b"],["route4","P4",132,46,null],["arenapoli","Arenapoli",132,70,"#9a3412","l"],["route5","P5",162,70,null],["isola","Isola Playground",192,70,"#be123c","t"],["route6","P6",192,96,null],["valle","Valle Veterani",192,120,"#57534e","b"],["route7","P7",162,120,null],["metropoli","Metropoli",132,120,"#6d28d9","l"],["route8","P8",132,134,null],["montecima","Montecima",106,140,"#44403c","t"],["vittoria","Via Vittoria",78,142,null],["lega","LEGA",50,144,"#b45309","t"]];
const drawRegionMap=()=>{uiBox(4,4,232,152,"#fef3c7");uiText("MAPPA DELLA REGIONE",120,8,7,"#7c2d12","center");const idx={};RMAP.forEach((r,i)=>idx[r[0]]=i);
  ux.strokeStyle="#c2a46a";ux.lineWidth=U(3);ux.beginPath();RMAP.forEach((r,i)=>{if(i===0)ux.moveTo(U(r[2]),U(r[3]));else ux.lineTo(U(r[2]),U(r[3]))});ux.stroke();
  const cur=(()=>{let k=MK;if(k.startsWith("cen_")||k.startsWith("shp_")||k.startsWith("hse_")||k.startsWith("hs2_")||k.startsWith("gym_"))k=k.slice(4);if(k.startsWith("lg")||k==="mall")k=k==="mall"?"metropoli":"lega";if(["casa1","casa2","casar","lab"].includes(k))k="borgo";if(["centro","shop","casac","casac2"].includes(k))k="canestro";if(k==="grotta")k="route6";return k})();
  RMAP.forEach(([id,n,X,Y,col],i)=>{const town=!!col;const gi=GYMS.findIndex(g=>g.id===id);const badge=gi>=0&&G.flags["badge"+(gi+1)];if(town){ux.fillStyle=col;ux.fillRect(U(X-5),U(Y-5),U(10),U(10));ux.fillStyle="#fff";ux.fillRect(U(X-3),U(Y-3),U(6),U(6));if(badge){ux.fillStyle="#facc15";ux.fillRect(U(X-2),U(Y-2),U(4),U(4))}}else{ux.fillStyle="#a16207";ux.fillRect(U(X-2),U(Y-2),U(4),U(4))}
    if(town){const an=RMAP[i][5]||"r";if(an==="r")uiText(n,X+8,Y-3,5,"#1c1917","left");else if(an==="l")uiText(n,X-8,Y-3,5,"#1c1917","right");else if(an==="b")uiText(n,X,Y+7,5,"#1c1917","center");else uiText(n,X,Y-13,5,"#1c1917","center")}
    if(id===cur){const b=Math.floor(performance.now()/300)%2;ux.fillStyle=b?"#dc2626":"#fff";ux.beginPath();ux.arc(U(X),U(Y),U(4),0,7);ux.fill();uiText("TU",X+((RMAP[i][5]||"r")==="t"?12:0),Y-13,5,"#dc2626","center")}});
  uiText(`Medaglie: ${G.badges.length}/8 · B per chiudere`,120,149,5,"#7c2d12","center")};
const drawSumm=()=>{const{m}=SUMM,s=SPX[m.sp];uiBox(4,4,232,112,"#f1f5f9");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false,m.shiny),U(8),U(10),U(64),U(64));uiText(m.nick?`${m.nick} (${s.n})`:s.n,76,8,8,"#111827","left",150);uiText(`Lv ${m.lv} · ${s.t.map(t=>TY[t].n).join("/")} · ${NAT[m.nat||0][0]}`,76,19,6,"#475569");
  const L=[["PV",`${m.hp}/${stat(m,"hp")}`],["ATTACCO",stat(m,"atk")],["DIFESA",stat(m,"def")],["TIRO",stat(m,"spa")],["LETTURA",stat(m,"spd")],["VELOCITÀ",stat(m,"spe")]];L.forEach(([a,b],i)=>{uiText(a,76+(i%2)*80,30+Math.floor(i/2)*10,6,"#334155");uiText(String(b),146+(i%2)*80,30+Math.floor(i/2)*10,6,"#111827","right")});
  uiText(`Exp ${m.xp} · prossimo livello ${expAt(m.lv+1)}`,76,62,5.5,"#475569");m.moves.forEach((x,i)=>{const mv=MV[x.n];ux.fillStyle=TY[mv.t].c;ux.fillRect(U(10+(i%2)*114),U(78+Math.floor(i/2)*16),U(108),U(13));uiText((s.t.includes(mv.t)?"★ ":"")+x.n,14+(i%2)*114,80+Math.floor(i/2)*16,6.5,TYTX(mv.t),"left",76);uiText(`${x.pp}/${maxPP(0,x)}`,114+(i%2)*114,80+Math.floor(i/2)*16,6.5,TYTX(mv.t),"right")})};
const drawDex=()=>{const s=DEXSEL;uiBox(4,4,232,112,"#fef3c7");ux.imageSmoothingEnabled=false;ux.drawImage(drawPlayer(s,false),U(10),U(10),U(70),U(70));uiText(`#${String(s.dex).padStart(3,"0")} ${s.n}`,86,10,8);uiText(s.t.map(t=>TY[t].n).join(" / ")+` · ruolo ${({G:"guardia",F:"ala",C:"centro"})[s.role]}`,86,22,6,"#92400e");
  const b=s.bs;[["PV",b.hp],["ATT",b.atk],["DIF",b.def],["TIR",b.spa],["LET",b.spd],["VEL",b.spe]].forEach(([k,v],i)=>{uiText(k,86,34+i*9,6,"#334155");ux.fillStyle="#e5e7eb";ux.fillRect(U(104),U(35+i*9),U(100),U(5));ux.fillStyle="#f59e0b";ux.fillRect(U(104),U(35+i*9),U(Math.min(100,v/1.7)),U(5));uiText(String(v),210,34+i*9,6,"#111827")});
  uiText(G.caught[s.n]?"Catturato ●":"Solo visto ○",10,86,6,G.caught[s.n]?"#16a34a":"#475569");uiText(`Squadra: ${s.team?s.team:s.nba||"—"} · maglia #${s.num}`,10,96,6,"#334155")};
const drawCard=()=>{uiBox(10,10,220,100,"#fde68a");uiText("TESSERA ALLENATORE",20,16,8,"#92400e");ux.imageSmoothingEnabled=false;ux.drawImage(sprFor("hero"),0,0,16,24,U(180),U(26),U(40),U(60));const t=G.time|0;uiText(`NOME: ${G.name} · ${dayPhase().toUpperCase()}`,20,32,7);uiText(`SQUADRA: ${TEAM().nick.toUpperCase()}`,20,44,7);uiText(`CREDITI: ${G.money}₵`,20,56,7);uiText(`SCHEDARIO: ${Object.keys(G.caught).length}`,20,68,7);uiText(`TEMPO: ${Math.floor(t/3600)}h ${String(Math.floor(t/60)%60).padStart(2,"0")}m`,20,80,7);uiText(`MEDAGLIE: ${G.badges.length}/8`,20,92,7)};
let _rs=null;const rr=()=>_rs?_rs():Math.random(),rri=(a,b)=>a+Math.floor(rr()*(b-a+1)),rpick=a=>a[Math.floor(rr()*a.length)];
/* ---------- (1071) IL RESTO DELLA REGIONE: percorsi, bosco, grotte, lago, 7 città con palestra, Via della Vittoria, Lega ---------- */
/* generatori: ogni zona è fatta da un seme fisso (sempre uguale), con il sentiero garantito tra le uscite */
const G2D=(w,h,c)=>Array.from({length:h},()=>Array(w).fill(c));
const carve=(g,ax,ay,bx,by,r_,ch,wd)=>{let x=ax,y=ay;const W=g[0].length,H=g.length;let guard=0;while((x!==bx||y!==by)&&guard++<4000){const dx=Math.sign(bx-x),dy=Math.sign(by-y);if(dx&&(r_()<.55||!dy))x+=dx;else y+=dy;if(r_()<.12){x+=r_()<.5?-1:1}x=cl(x,1,W-2);y=cl(y,0,H-1);for(let j=0;j<2;j++)for(let k=0;k<(wd||2);k++){const xx=cl(x+k,0,W-1),yy=cl(y+j,0,H-1);if(g[yy][xx]!=="~"||ch===":")g[yy][xx]=ch}}};
const blob=(g,cx,cy,rx,ry,ch,avoid)=>{for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){if(y<2||x<2||y>=g.length-2||x>=g[0].length-2)continue;if(((x-cx)/rx)**2+((y-cy)/ry)**2>1)continue;if(avoid&&avoid.includes(g[y][x]))continue;g[y][x]=ch}};
const ROUTE=(id,o)=>{const r_=sR(hsh(id));const w=o.w||20,h=o.h||30;const g=G2D(w,h,".");for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<2||x>=w-2||y<1||y>=h-1)g[y][x]="T";
  const ex=o.ex,pts=[];if(ex.n)pts.push([ex.n.x,0]);if(ex.w)pts.push([0,ex.w.y]);if(ex.e)pts.push([w-1,ex.e.y]);if(ex.s)pts.push([ex.s.x,h-1]);
  (o.water||[]).forEach(q=>blob(g,q[0],q[1],q[2],q[3],"~"));
  for(let i=0;i<(o.trees||10);i++)blob(g,rri(3,w-4),rri(3,h-4),rri(1,2),rri(1,2),"T");
  const center=[Math.floor(w/2),Math.floor(h/2)];pts.forEach(p=>carve(g,p[0],p[1],center[0],center[1],r_,":",2));
  for(let i=0;i<(o.grass||6);i++)blob(g,rri(3,w-4),rri(3,h-4),rri(2,4),rri(1,3),'"',["~",":"]);if(o.grassPath)for(let i=0;i<o.grassPath;i++)blob(g,rri(3,w-4),rri(4,h-5),rri(2,3),1,'"',["~"]);
  for(let i=0;i<(o.flowers||3);i++){const x=rri(3,w-4),y=rri(3,h-4);if(g[y][x]===".")g[y][x]="F"}
  /* uscite aperte */pts.forEach(([x,y])=>{for(let k=0;k<2;k++){if(y===0||y===h-1){g[y][cl(x+k,0,w-1)]=":";g[y===0?1:h-2][cl(x+k,0,w-1)]=":"}else{g[cl(y+k,0,h-1)][x]=":";g[cl(y+k,0,h-1)][x===0?1:w-2]=":"}}});
  (o.ledges||[]).forEach(y=>{for(let x=2;x<w-2;x++)if(g[y][x]==="."||g[y][x]==='"')g[y][x]="L"});
  if(o.needSurf)(o.water||[]).forEach(q=>blob(g,q[0],q[1],q[2],q[3],"~"));
  if(o.block){const[x,y,ch]=o.block;if(y!=null&&g[y])for(let xx=2;xx<w-2;xx++){if(g[y][xx]===":")g[y][xx]=ch;else if(g[y][xx]!=="~")g[y][xx]="T"}if(y==null){let first=-1;for(let yy=1;yy<h-1;yy++){if(g[yy][x]===":"&&(ch!=="o"||first<0)){g[yy][x]=ch;if(first<0)first=yy;if(ch==="o"){g[yy][x+1]=":";g[yy][x+2]=":"}}else if(g[yy][x]!=="~")g[yy][x]="T"}if(ch==="o"&&first>1){g[first-1][x-1]="T";g[first-1][x]=".";g[first-1][x+1]=".";g[first-1][x+2]="."}}}
  return g.map(r=>r.join(""))};
const CAVE=(id,o)=>{const r_=sR(hsh(id));const w=o.w||22,h=o.h||22;const g=G2D(w,h,"R");const ex=o.ex,pts=[];if(ex.n)pts.push([ex.n.x,0]);if(ex.w)pts.push([0,ex.w.y]);if(ex.e)pts.push([w-1,ex.e.y]);if(ex.s)pts.push([ex.s.x,h-1]);
  const rooms=[];for(let i=0;i<(o.rooms||6);i++){const cx=rri(4,w-5),cy=rri(4,h-5);rooms.push([cx,cy]);blob(g,cx,cy,rri(2,4),rri(2,3),"C")}const c0=rooms[0];pts.forEach(p=>carve(g,p[0],p[1],c0[0],c0[1],r_,"C",2));for(let i=1;i<rooms.length;i++)carve(g,rooms[i-1][0],rooms[i-1][1],rooms[i][0],rooms[i][1],r_,"C",2);(o.water||[]).forEach(q=>blob(g,q[0],q[1],q[2],q[3],"~",["R"]));
  pts.forEach(([x,y])=>{for(let k=0;k<2;k++){if(y===0||y===h-1)g[y][cl(x+k,0,w-1)]="C";else g[cl(y+k,0,h-1)][x]="C"}});if(o.block){const[x,y,ch]=o.block;if(g[y])for(let xx=1;xx<w-1;xx++){if(g[y][xx]==="C")g[y][xx]=ch;else g[y][xx]="R"}}return g.map(r=>r.join(""))};
/* città: stesso schema, colori e dettagli diversi */
const TOWN=(id,o)=>{const w=24,h=22;const g=G2D(w,h,".");for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<2||x>=w-2||y<1||y>=h-1)g[y][x]="T";[5,11,18].forEach(y=>{for(let x=2;x<w-2;x++)g[y][x]=":"});for(let y=1;y<h-1;y++){g[y][11]=":";g[y][12]=":"}
  const ex=o.ex;if(ex.n){g[0][11]=g[0][12]=":"}if(ex.s){g[h-1][11]=g[h-1][12]=":"}if(ex.e){g[11][w-1]=g[11][w-2]=":";g[12][w-1]=g[12][w-2]=":"}if(ex.w){g[11][0]=g[11][1]=":";g[12][0]=g[12][1]=":"}
  if(o.pond){for(let y=19;y<21;y++)for(let x=15;x<20;x++)g[y][x]="~"}[[4,16],[19,15],[8,20],[16,3],[5,3]].forEach(([x,y])=>{if(g[y]&&g[y][x]===".")g[y][x]="F"});g[16][4]="S";return g.map(r=>r.join(""))};
const townBlds=(id,roof,gymc)=>[{k:"center",x:3,y:6,w:5,h:4,door:2,roof:"#dc2626",wall:"#fff7ed",sign:"CURA",signc:"#dc2626",to:"cen_"+id,tx:4,ty:7},{k:"shop",x:15,y:6,w:5,h:4,door:2,roof:"#2563eb",wall:"#eff6ff",sign:"SHOP",signc:"#2563eb",to:"shp_"+id,tx:3,ty:7},{k:"gym",x:3,y:13,w:7,h:4,door:3,roof:gymc,wall:"#f5f3ff",sign:"PALESTRA",signc:gymc,to:"gym_"+id,tx:4,ty:13},{k:"house",x:15,y:13,w:4,h:3,door:1,roof,to:"hse_"+id,tx:3,ty:7},{k:"house",x:15,y:1,w:4,h:3,door:2,roof:shade(roof,-.2),to:"hs2_"+id,tx:3,ty:7}];
/* interni generici per ogni città */
const mkInteriors=(id,doorC,doorS,doorH,doorH2,shopList,tips)=>{MAPS["cen_"+id]={n:"CENTRO CURA",mus:"center",inside:1,rows:MAPS.centro.rows,objs:MAPS.centro.objs,exit:{x:4,y:7,to:id,tx:doorC[0],ty:doorC[1]},npcs:[{id:"nurse_"+id,x:4,y:1,spr:"nurse",talk:"nurse"},{id:"pc_"+id,x:9,y:3,spr:"none",talk:"pc"},{id:"tip_"+id,x:2,y:5,spr:"kid",move:"wander",talk:[tips[0]]}]};
  MAPS["shp_"+id]={n:"SHOP",mus:"center",inside:1,rows:MAPS.shop.rows,objs:MAPS.shop.objs,exit:{x:3,y:7,to:id,tx:doorS[0],ty:doorS[1]},shop:shopList,npcs:[{id:"clerk_"+id,x:0,y:2,spr:"clerk",dir:"down",talk:"shop"},{id:"shtip_"+id,x:5,y:5,spr:"old",move:"turn",talk:[tips[1]]}]};
  MAPS["hse_"+id]={n:"CASA",mus:"home",inside:1,rows:MAPS.casac.rows,objs:[{k:"table",x:2,y:3},{k:"shelf",x:5,y:1},{k:"plant",x:7,y:2}],exit:{x:3,y:7,to:id,tx:doorH[0],ty:doorH[1]},npcs:[{id:"h1_"+id,x:5,y:4,spr:"girl",talk:[tips[2]]}]};
  MAPS["hs2_"+id]={n:"CASA",mus:"home",inside:1,rows:MAPS.casac.rows,objs:[{k:"bed",x:0,y:3},{k:"tv",x:4,y:1}],exit:{x:3,y:7,to:id,tx:doorH2[0],ty:doorH2[1]},npcs:[{id:"h2_"+id,x:4,y:4,spr:"old",talk:[tips[3]]}]}};
/* ---------- le 8 palestre ---------- */
const GYMS=[
 {id:"canestro",n:"CANESTROPOLI",lead:"COACH LINA",ty:"GUA",lv:12,badge:"MEDAGLIA RETINA",c:"#38bdf8",pow:null,sch:"Crossover",say:["Le guardie decidono le partite. Vediamo se sai fermare la palla!"]},
 {id:"pineta",n:"PINETA ALTA",lead:"MARCO L ALA",ty:"ALA",lv:18,badge:"MEDAGLIA FOGLIA",c:"#22c55e",pow:"TAGLIO",sch:"Euro step",say:["Nel bosco si impara a muoversi tra gli alberi… come tra i difensori!"]},
 {id:"portocampo",n:"PORTOCAMPO",lead:"SARA LA MIRA",ty:"TIR",lv:24,badge:"MEDAGLIA MIRINO",c:"#facc15",pow:"FORZA",sch:"Tripla",say:["Un tiro, una retina. Non sbaglio mai due volte."]},
 {id:"arenapoli",n:"ARENAPOLI",lead:"TONI IL GIGANTE",ty:"CEN",lv:30,badge:"MEDAGLIA PITTURATO",c:"#f97316",pow:"NUOTO",sch:"Schiacciata",say:["In area comando io. Prova a entrare!"]},
 {id:"isola",n:"ISOLA PLAYGROUND",lead:"RICKY VOLANTE",ty:"ATL",lv:36,badge:"MEDAGLIA SALTO",c:"#f43f5e",pow:"VOLO",sch:"Alley-oop",say:["Qui si gioca sopra il ferro!"]},
 {id:"valle",n:"VALLE DEI VETERANI",lead:"NONNA RITA",ty:"DIF",lv:42,badge:"MEDAGLIA MURO",c:"#64748b",pow:null,sch:"Stoppata",say:["Quarant anni di difesa. Non passa nessuno."]},
 {id:"metropoli",n:"METROPOLI DEL DRAFT",lead:"DOTT. SERGIO",ty:"REG",lv:48,badge:"MEDAGLIA VISIONE",c:"#c084fc",pow:null,sch:"No-look",say:["Ogni passaggio è un idea. E io ho idee migliori delle tue."]},
 {id:"montecima",n:"MONTECIMA",lead:"ALDO IL SAGGIO",ty:"BAS",lv:54,badge:"MEDAGLIA VETTA",c:"#a8a29e",pow:null,sch:"Timeout",say:["L ultima medaglia. Dopo di me c è solo la Lega."]}];
const ELITE=[{n:"ELITE: GIADA",ty:"TIR",lv:59},{n:"ELITE: BRUNO",ty:"CEN",lv:60},{n:"ELITE: OLGA",ty:"DIF",lv:61},{n:"ELITE: LEO",ty:"REG",lv:62}];
const POWER=k=>{const i=GYMS.findIndex(g=>g.pow===k);return i>=0&&G.badges.length>i};
/* zone */
const AREAS=[
 {id:"route2",n:"PERCORSO 2",mus:"route",band:[6,20],lv:[4,7],w:28,h:42,ex:{s:{x:13,to:"canestro"},n:{x:13,to:"bosco"}},grass:13,trees:22,ledges:[28],tr:5},
 {id:"bosco",n:"BOSCO DEI RIMBALZI",mus:"forest",band:[10,26],lv:[7,10],w:34,h:42,ex:{s:{x:15,to:"route2"},n:{x:15,to:"pineta"}},grass:22,trees:72,tr:5,forest:1},
 {id:"route3",n:"PERCORSO 3",mus:"route",band:[16,32],lv:[11,14],w:42,h:25,ex:{w:{y:13,to:"pineta"},e:{y:11,to:"tunnel"}},grass:14,trees:25,tr:6,block:[20,null,"b"]},
 {id:"tunnel",n:"TUNNEL DEGLI SPOGLIATOI",mus:"cave",cave:1,band:[18,36],lv:[13,16],w:34,h:31,ex:{w:{y:14,to:"route3"},e:{y:17,to:"portocampo"}},tr:5,rooms:10},
 {id:"route4",n:"PERCORSO 4",mus:"route",band:[24,42],lv:[17,21],w:28,h:48,ex:{n:{x:13,to:"portocampo"},s:{x:13,to:"arenapoli"}},grass:16,trees:25,ledges:[14,34],tr:6,block:[13,22,"o"]},
 {id:"route5",n:"PERCORSO 5 · COSTA",mus:"sea",band:[28,50],lv:[22,26],w:45,h:28,ex:{w:{y:14,to:"arenapoli"},e:{y:13,to:"isola"}},grass:11,trees:18,water:[[22,13,8,13],[34,13,8,13]],tr:6,needSurf:1},
 {id:"route6",n:"PERCORSO 6",mus:"route",band:[38,62],lv:[28,32],w:28,h:45,ex:{n:{x:13,to:"isola"},s:{x:13,to:"valle"}},grass:18,trees:29,ledges:[17],tr:7},
 {id:"route7",n:"PERCORSO 7",mus:"route",band:[48,74],lv:[33,37],w:45,h:25,ex:{w:{y:11,to:"valle"},e:{y:13,to:"metropoli"}},grass:16,trees:29,tr:7,block:[22,null,"o"]},
 {id:"route8",n:"PERCORSO 8 · SALITA",mus:"route",band:[58,88],lv:[39,43],w:28,h:48,ex:{s:{x:13,to:"metropoli"},n:{x:13,to:"montecima"}},grass:18,trees:32,ledges:[11,31],tr:7},
 {id:"vittoria",n:"VIA DELLA VITTORIA",mus:"cave",cave:1,band:[78,108],lv:[46,50],w:36,h:36,ex:{s:{x:17,to:"montecima"},n:{x:17,to:"lega"}},tr:7,rooms:14,block:[17,28,"o"]},
 {id:"grotta",n:"GROTTA DELLE LEGGENDE",mus:"cave",cave:1,band:[100,115],lv:[60,70],w:31,h:31,ex:{s:{x:14,to:"route6"}},tr:0,rooms:9,post:1}];
/* regali nelle case e centro commerciale */
const GIFTS={hse_pineta:["Cuffie da allenamento",["Queste cuffie fanno sentire la partita a tutta la squadra, anche a chi sta in panchina.","Tienile tu: accese, tutti guadagnano esperienza!"],["Dal menu ZAINO, tasca CHIAVE, puoi accenderle o spegnerle."]],hs2_pineta:["Biglietto fortunato",["Ho vinto questo biglietto alla lotteria del torneo… ma io ho smesso di giocare.","Chi lo tiene in tasca impara più in fretta!"],["Dallo da tenere a un giocatore: +50% di esperienza."]],hse_arenapoli:["Canna buona",["Con questa canna peschi giocatori più forti di quelli della canna vecchia.","Prendila, io ormai pesco solo complimenti!"],["Usala davanti all acqua, dallo ZAINO."]],hs2_arenapoli:["Radar strumenti",["Questo radar sente gli strumenti nascosti nella zona.","Usalo dallo ZAINO: ti dice quanti ne restano."],["Cerca negli angoli e dietro gli alberi!"]],hse_isola:["Portafortuna",["Il mio portafortuna! Chi lo tiene vince il doppio dei crediti dagli allenatori.","Ti porterà fortuna, lo sento."],["Dallo da tenere a uno dei tuoi."]],hs2_isola:["Fascia della grinta",["Con questa fascia il mio giocatore ha resistito a mille colpi.","Ora tocca a te."],["Da tenere: a volte si resta con 1 PV invece di andare KO."]],hs2_valle:["Agenda sfide",["In quest agenda ci sono tutti gli allenatori della regione.","Quando sarai CAMPIONE, usala: ti sfideranno di nuovo, più forti!"],["Usala su un percorso dopo aver vinto la Lega."]],hse_metropoli:["Integratore PP",["Alla Metropoli si trova tutto, anche questo integratore raro.","Aumenta i PP di una mossa per sempre!"],["Nel CENTRO COMMERCIALE trovi di tutto, piano per piano."]],hs2_metropoli:["Palla rovente",["Questa palla scotta! Chi la tiene colpisce più forte… ma si fa un po male.","Tienila tu, io mi sono scottato abbastanza."],["Da tenere: +30% danni, un po di rinculo."]],hse_montecima:["Super canna",["Dalla cima si vede tutto il lago. Con questa canna ho pescato i giocatori migliori.","Ora è tua."],["Pesca i giocatori più forti dei laghi."]],hs2_montecima:["Caramella del coach",["Ne ho tre: una per te, una per te e una per te!","Fanno salire di un livello."],["Usale con saggezza."],3]};
const TOWNS=[{id:"pineta",n:"PINETA ALTA",roof:"#166534",ex:{s:"bosco",e:"route3"},pond:0},{id:"portocampo",n:"PORTOCAMPO",roof:"#0369a1",ex:{w:"tunnel",s:"route4"},pond:1},{id:"arenapoli",n:"ARENAPOLI",roof:"#9a3412",ex:{n:"route4",e:"route5"},pond:0},{id:"isola",n:"ISOLA PLAYGROUND",roof:"#be123c",ex:{w:"route5",s:"route6"},pond:1},{id:"valle",n:"VALLE DEI VETERANI",roof:"#57534e",ex:{n:"route6",e:"route7"},pond:0},{id:"metropoli",n:"METROPOLI DEL DRAFT",roof:"#6d28d9",ex:{w:"route7",n:"route8"},pond:0},{id:"montecima",n:"MONTECIMA",roof:"#44403c",ex:{s:"route8",n:"vittoria"},pond:0}];
const TRN=["ALLENATORE","TIFOSO","CHEERLEADER","ARBITRO","GIORNALISTA","STATISTICO","ROOKIE","VETERANO","MASCOTTE","PREPARATORE"];
const SHOPLV=[["Pallone","Super Pallone","Borraccia","Ghiaccio","Caffè","Stretching","Camomilla","Fischietto"],["Super Pallone","Pallone Rete","Pallone Vivaio","Pallone Cura","Sali minerali","Fisioterapia","Uscita d emergenza"],["Flebo","Rientro","Fischietto forte","Pallone Timer","Pallone Rapido","Pallone Tuffo","Pallone Esca","Pallone Notte","Bevanda energetica"],["Iper Pallone","Pallone Bis","Pallone Livello","Pallone Peso","Pallone Veloce","Massaggio completo","Polsino","Ginocchiera","Fascia lucky","Scarpe nuove"],["Integratore forza","Integratore tiro","Integratore difesa","Integratore corsa"]];
const buildRegion=()=>{_rs=sR(424242);try{buildRegion0();placeLegends()}finally{_rs=null}};
/* rarità dalla nostra valutazione: fino a 800 comuni, poi sempre più rari; sopra LEGV solo eventi */const LEGV=2400;const RARW=v=>v<=800?24:v<=1300?8:v<=2000?2:.15;
/* eventi leggendari: i giocatori sopra 2400 compaiono una sola volta in punti speciali, solo dopo la Lega */const LEGSPOTS=[["grotta",70],["vittoria",68],["bosco",66],["route5",66],["montecima",66]];
const placeLegends=()=>{const L=SP.filter(s=>s.val>LEGV&&s.n!=="Luka Dončić").sort((a,b)=>b.val-a.val);L.forEach((s,i)=>{const[mk,lv]=LEGSPOTS[i%LEGSPOTS.length];const M=MAPS[mk];if(!M)return;const H=M.rows.length,W=M.rows[0].length;const cx=Math.floor(W/2),cy=Math.floor(H/3);let best=null,bd=1e9;for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){const c=M.rows[y][x];if(!(c===":"||c==="C"||c==="."))continue;if((M.npcs||[]).some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<3))continue;if((M.blds||[]).some(b=>x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h))continue;const d=Math.abs(x-cx)+Math.abs(y-cy);if(d<bd){bd=d;best=[x,y]}}if(!best)return;M.npcs=M.npcs||[];M.npcs.push({id:"leg_"+s.i,x:best[0],y:best[1],spr:"none",legend:s.n,lv,flag:"champion&!leg_"+s.i,dir:"down"})})};
const buildRegion0=()=>{
  /* Canestropoli: si apre la strada nord dopo la prima medaglia, la palestra è vera */const cz=MAPS.canestro;cz.rows=cz.rows.map((r,y)=>y===0?r.slice(0,20)+"::"+r.slice(22):r);cz.ex={n:{x:20,to:"route2",only:"badge1",msg:["GUARDIA: «Alt! La strada per il PERCORSO 2 è aperta solo a chi ha battuto la palestra di Canestropoli.»","«Prima la MEDAGLIA RETINA, poi si passa!»"]},s:{x:10}};cz.links={s:{to:"route1",dx:-2}};cz.blds.find(b=>b.k==="gym").to="gym_canestro";cz.blds.find(b=>b.k==="gym").tx=4;cz.blds.find(b=>b.k==="gym").ty=13;cz.npcs.find(n=>n.id==="guard").flag="!badge1";cz.npcs.find(n=>n.id==="guard").talk=["La strada per il PERCORSO 2 è aperta solo a chi ha battuto la palestra di Canestropoli.","Prima la MEDAGLIA RETINA, poi si passa!"];
  MAPS.shop.shop=SHOPLV[0].concat(["Schema: Crossover","Schema: Euro step","Schema: Schiacciata","Schema: Assist","Schema: Grinta"]);
  const sorted=SP.slice().sort((a,b)=>a.val-b.val);const band=(a,b)=>{const k=sorted.length/115;return sorted.slice(cl(Math.round(a*k),0,sorted.length-1),cl(Math.round(b*k),1,sorted.length))};
  AREAS.forEach(A=>{if(!A.cave){const rows=MAPS[A.id]&&MAPS[A.id].rows;}const pool=band(A.band[0],A.band[1]);ENC[A.id]={rate:A.cave?.08:.1,list:pool.filter(s=>s.val<=LEGV).map(s=>[s.n,A.lv[0],A.lv[1],Object.values(START3).some(t=>t.includes(s.n))?1:RARW(s.val)]),cave:A.cave};/* colpo di fortuna: un raro fuori fascia */const rare=sorted.filter(s=>s.val>1300&&s.val<=LEGV&&!pool.includes(s));if(rare.length){const s=rare[hsh(A.id)%rare.length];ENC[A.id].list.push([s.n,A.lv[0],A.lv[1],.3])}if(A.needSurf||A.id==="route5")ENC[A.id+"_s"]={rate:.08,list:sorted.filter(s=>s.role==="C"||s.t.includes("TIR")).slice(Math.floor(A.band[0]/2),Math.floor(A.band[0]/2)+8).map(s=>[s.n,A.lv[0],A.lv[1]+2,10])};
    const rows=A.cave?CAVE(A.id,A):ROUTE(A.id,{...A,ex:A.ex,block:A.block||null,water:A.water});
    const exs={};Object.entries(A.ex).forEach(([d,e])=>exs[d]={x:e.x,y:e.y,to:e.to});
    const npcs=[];const r_=sR(hsh(A.id+"npc"));const H=rows.length,W=rows[0].length;for(let i=0;i<A.tr;i++){for(let t=0;t<200;t++){const x=rri(3,W-4),y=rri(3,H-4);const c=rows[y][x];if(!(c===":"||c==="."||c==="C"))continue;if(npcs.some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<5))continue;const dir=rpick(["down","left","right","up"]);const nmT=TRN[(i+hsh(A.id))%TRN.length];const party=[];const np=1+Math.floor(r_()*Math.min(3,1+A.lv[0]/12));for(let k=0;k<np;k++){const s=pool[Math.floor(r_()*pool.length)];party.push([s.n,rri(A.lv[0]+1,A.lv[1]+1)])}
      npcs.push({id:"t_"+A.id+i,x,y,spr:["kid","girl","old","clerk","aide"][i%5],dir,trainer:{n:nmT,party,money:A.lv[1]*40,sight:3+(i%2),pre:[rpick(["Ehi! Sfida!","I nostri sguardi si sono incrociati: si gioca!","Ti ho visto arrivare. Vediamo cosa sai fare!","Il mio giocatore è in forma stasera!","Non si passa senza una partita!"])],lose:[rpick(["Che partita!","Mi hai battuto in volata…","Devo tornare ad allenarmi.","Il mio coach mi sgriderà…"])]}});break}}
    const items=[];for(let i=0;i<2;i++){for(let t=0;t<100;t++){const x=rri(3,W-4),y=rri(3,H-4);if(!".C\"".includes(rows[y][x]))continue;items.push({id:"it_"+A.id+i,x,y,it:rpick(["Borraccia","Sali minerali","Super Pallone","Ghiaccio","Rientro","Caramella del coach","Bevanda energetica","Banana","Arancia","Mirtilli","Fischietto"])});break}}
    if(!A.cave){/* 2 alberi da frutto per percorso, su erba libera */let put=0;for(let t=0;t<300&&put<2;t++){const x=rri(3,W-4),y=rri(3,H-4);if(rows[y][x]!=="."||npcs.some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<2)||items.some(i=>i.x===x&&i.y===y))continue;const r=rows[y].split("");r[x]="J";rows[y]=r.join("");put++}}
    MAPS[A.id]={n:A.n,mus:A.mus,enc:A.id,cave:A.cave,rows,ex:exs,npcs,items,signs:{}}});
  /* boss segreto: IL FONDATORE, in fondo alla grotta, solo da campione */{const Mg=MAPS.grotta,top=SP.slice().sort((a,b)=>b.val-a.val).filter(s=>s.val<=2400).slice(0,6);const rows=Mg.rows;let pos=null;for(let y=rows.length-3;y>2&&!pos;y--)for(let x=2;x<rows[0].length-2;x++){if(rows[y][x]==="C"&&rows[y-1][x]==="C"&&!(Mg.npcs||[]).some(n=>Math.abs(n.x-x)+Math.abs(n.y-y)<3)){pos=[x,y];break}}if(pos){Mg.npcs=Mg.npcs||[];Mg.npcs.push({id:"founder",x:pos[0],y:pos[1],spr:"old",dir:"down",flag:"champion",trainer:{n:"IL FONDATORE",party:top.map((s,k)=>[s.n,78+k,["Barretta energetica","Fascia della grinta","Palla rovente","Fascia lucky","Borraccia magica","Scarpe nuove"][k]]),money:30000,sight:0,pre:["…","«Da quanto tempo nessuno arrivava fin qui.»","«Ho fondato questa lega quando tu non eri ancora nato. Fammi vedere cosa sai fare, CAMPIONE.»"],lose:["«…Bravo. La lega è in buone mani.»","«Torna quando vuoi: io sono sempre qui.»"],after:["«La lega è in buone mani. Torna quando vuoi per un altra partita.»"],rematch:1}})}}
  /* ingresso della grotta delle leggende sul percorso 6 (solo dopo la Lega) */const r6=MAPS.route6;r6.rows=r6.rows.map((r,y)=>y===4?"::::"+r.slice(4):r);r6.ex.w={y:4,to:"grotta",only:"champion"};MAPS.grotta.ex.s.to="route6";MAPS.grotta.ex.s.back={x:3,y:4};
  TOWNS.forEach((T,ti)=>{const gy=GYMS.find(g=>g.id===T.id);MAPS[T.id]={n:T.n,mus:"city",rows:TOWN(T.id,{ex:T.ex,pond:T.pond}),blds:townBlds(T.id,T.roof,gy.c).concat(T.id==="metropoli"?[{k:"mall",x:2,y:1,w:7,h:4,door:3,roof:"#7c3aed",wall:"#f5f3ff",sign:"CENTRO COMM.",signc:"#7c3aed",to:"mall",tx:7,ty:8}]:[]),ex:{},signs:{"4,16":`${T.n}\nPalestra di tipo ${TY[gy.ty].n}.`},npcs:[{id:"tw_"+T.id,x:8,y:9,spr:"kid",move:"wander",talk:[`Il capo palestra qui è ${gy.lead}. Usa giocatori di tipo ${TY[gy.ty].n}!`]},{id:"tw2_"+T.id,x:18,y:19,spr:"girl",move:"wander",talk:["Al CENTRO CURA ti rimettono a posto la squadra gratis.","Lo SHOP di ogni città vende cose diverse."]}]};
    Object.entries(T.ex).forEach(([d,to])=>{MAPS[T.id].ex[d]={x:d==="n"||d==="s"?11:undefined,y:d==="e"||d==="w"?11:undefined,to}});
    const shopL=[].concat(...SHOPLV.slice(0,Math.min(SHOPLV.length,ti+2))).concat(SCHEMI.filter((s,i)=>i%7===ti).slice(0,6).map(s=>s.n));
    mkInteriors(T.id,[5,10],[17,10],[16,16],[17,4],shopL,["Ogni medaglia ti dà un potere nuovo fuori dalle partite.","Gli schemi si possono riusare all infinito!","Il mio giocatore preferito? Quello che hai appena preso, ovvio.","Ho visto giocatori rarissimi in fondo alle grotte…"])});
  /* collegamenti: le uscite delle città sanno dove portano; i percorsi conoscono le città */
  /* palestre */GYMS.forEach((gy,i)=>{let pool=SP.filter(s=>s.t.includes(gy.ty)).sort((a,b)=>a.val-b.val);if(pool.length<4)pool=SP.slice().sort((a,b)=>a.val-b.val);const team=[];const n=Math.min(6,2+Math.floor(i/1.5));const st=Math.floor(pool.length*i/9);for(let k=0;k<n;k++){const s=pool[cl(st+k,0,pool.length-1)];if(s&&!team.some(t=>t[0]===s.n))team.push([s.n,gy.lv-(n-1-k)])}
    const tr=[0,1].map(k=>{const s=pool[cl(st+k+2,0,pool.length-1)]||SP[k];return{id:"gt_"+gy.id+k,x:k?6:3,y:k?9:7,spr:k?"aide":"kid",dir:k?"left":"right",trainer:{n:"ALLIEVO DI "+gy.lead.split(" ")[0],party:[[s.n,gy.lv-3-k]],money:gy.lv*30,sight:3,pre:["Prima di arrivare al capo, devi passare da me!"],lose:["Il capo è molto più forte di me…"]}}});
    const fl=["k","f","k","f","k","f","k","f"][i];MAPS["gym_"+gy.id]={n:"PALESTRA DI "+gy.n,mus:"gym",inside:1,rows:Array.from({length:15},(_,y)=>y<2?"YYYYYYYYYY":y===14?"kkkkmkkkkk":fl.repeat(10)),objs:[{k:"plant",x:0,y:2},{k:"plant",x:9,y:2},{k:"bench",x:1,y:11},{k:"bench",x:8,y:11}],exit:{x:4,y:14,to:gy.id,tx:i===0?11:6,ty:i===0?5:17},gymc:gy.c,
      npcs:tr.concat([{id:"leader_"+gy.id,x:4,y:2,spr:"leader",col:gy.c,dir:"down",trainer:{n:"CAPO PALESTRA "+gy.lead,party:team,money:gy.lv*100,sight:0,pre:gy.say,lose:[`Va bene, te la sei meritata: ecco la ${gy.badge}!`],gym:i},talk:null},{id:"gguide_"+gy.id,x:7,y:12,spr:"old",talk:[`Questa palestra usa il tipo ${TY[gy.ty].n}.`,`Lo batte: ${Object.entries(CH).filter(([a,m])=>m[gy.ty]===2).map(([a])=>TY[a].n).join(", ")||"un po di tutto"}.`]}])}});
  MAPS.canestro.blds.find(b=>b.k==="gym").to="gym_canestro";
  /* LEGA DEI SOGNI: 4 sale + il campione */const lgRows=Array.from({length:12},(_,y)=>y<2?"YYYYYYYYYY":y===11?"kkkkmkkkkk":"kkkkkkkkkk");
  Object.entries(GIFTS).forEach(([mk,[it,talk,after,q]])=>{const M_=MAPS[mk];if(!M_)return;const n=M_.npcs[0];n.gift=it;n.giftQ=q||1;n.talk=talk;n.after=after});
  /* casa di Valle dei Veterani: allenatore delle mosse */MAPS.hse_valle.npcs[0].talk="tutor";MAPS.hse_valle.npcs[0].spr="old";
  /* centro commerciale di Metropoli: 4 reparti */MAPS.mall={n:"CENTRO COMMERCIALE",mus:"center",inside:1,rows:["YYYYYYYYYYYYYYYY","YYYYYYYYYYYYYYYY","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkkkkkkkkkk","kkkkkkkmkkkkkkkk"],objs:[{k:"counter",x:1,y:3,w:3},{k:"counter",x:12,y:3,w:3},{k:"counter",x:1,y:7,w:3},{k:"counter",x:12,y:7,w:3},{k:"shelf",x:5,y:1},{k:"shelf",x:6,y:1},{k:"shelf",x:9,y:1},{k:"shelf",x:10,y:1},{k:"plant",x:0,y:9},{k:"plant",x:15,y:9}],exit:{x:7,y:9,to:"metropoli",tx:5,ty:5},
    npcs:[{id:"mall1",x:2,y:2,spr:"clerk",dir:"down",talk:"shop",greet:"«Reparto PALLONI! Tutti i palloni da cattura.»",shop:["Pallone","Super Pallone","Iper Pallone","Pallone Rete","Pallone Tuffo","Pallone Esca","Pallone Vivaio","Pallone Bis","Pallone Timer","Pallone Rapido","Pallone Notte","Pallone Cura","Pallone Livello","Pallone Peso","Pallone Veloce"]},
      {id:"mall2",x:13,y:2,spr:"clerk",dir:"down",talk:"shop",greet:"«Reparto CURE! Per rimettere in forma la squadra.»",shop:["Borraccia","Sali minerali","Flebo","Massaggio completo","Kit medico","Rientro","Rientro completo","Bevanda energetica","Bevanda max","Elisir","Elisir max","Ghiaccio","Caffè","Stretching","Camomilla","Fisioterapia"]},
      {id:"mall3",x:2,y:6,spr:"girl",dir:"down",talk:"shop",greet:"«Reparto ALLENAMENTO! Integratori e spinte per la partita.»",shop:["Integratore forza","Integratore tiro","Integratore difesa","Integratore corsa","Integratore PP","Spinta forza","Spinta difesa","Spinta tiro","Spinta corsa","Spinta mira","Fascia protezione","Fischietto","Fischietto forte","Fischietto max","Uscita d emergenza"]},
      {id:"mall4",x:13,y:6,spr:"old",dir:"down",talk:"shop",greet:"«Reparto OGGETTI DA TENERE e SCHEMI!»",shop:["Polsino","Ginocchiera","Fascia lucky","Scarpe nuove","Barretta energetica","Fascia della grinta","Fischietto dell arbitro","Palla rovente","Borraccia magica","Fascia della guardia","Fascia dell ala","Fascia del centro"].concat(SCHEMI.map(s=>s.n))},
      {id:"lotto",x:8,y:2,spr:"girl",dir:"down",talk:"lotto"},{id:"mall5",x:7,y:5,spr:"kid",move:"wander",talk:["Che bello il centro commerciale! Quattro reparti, ognuno con la sua commessa.","Gli SCHEMI con la stellina del tuo ruolo sono quelli che rendono di più!"]}]};
  MAPS.lega={n:"LEGA DEI SOGNI",mus:"city",rows:TOWN("lega",{ex:{s:1}}),blds:[{k:"center",x:3,y:6,w:5,h:4,door:2,roof:"#dc2626",wall:"#fff7ed",sign:"CURA",signc:"#dc2626",to:"cen_lega",tx:4,ty:7},{k:"gym",x:7,y:12,w:10,h:5,door:4,roof:"#b45309",wall:"#fef3c7",sign:"LEGA",signc:"#b45309",to:"lg1",tx:4,ty:10,need:"allbadges",needMsg:["Una voce dall interno: «Solo chi ha tutte e 8 le medaglie può entrare nella Lega dei Sogni!»"]},{k:"shop",x:15,y:6,w:5,h:4,door:2,roof:"#2563eb",wall:"#eff6ff",sign:"SHOP",signc:"#2563eb",to:"shp_lega",tx:3,ty:7}],ex:{s:{x:11,to:"vittoria"}},npcs:[{id:"lgguard",x:11,y:17,spr:"guard",flag:"!allbadges",talk:["Solo chi ha tutte e 8 le medaglie può entrare nella Lega."]}]};
  mkInteriors("lega",[5,10],[17,10],[0,0],[0,0],[].concat(...SHOPLV),["Dentro ci sono quattro Elite e poi il Campione: niente cure tra una sfida e l altra!","Fai scorta di cure prima di entrare.","",""]);
  ELITE.concat([{n:"CAMPIONE VITO",ty:null,lv:65,champ:1}]).forEach((E,i)=>{const id="lg"+(i+1);let team;if(E.champ){team=null}else{let pool=SP.filter(s=>s.t.includes(E.ty)).sort((a,b)=>b.val-a.val);if(pool.length<5)pool=SP.slice().sort((a,b)=>b.val-a.val);team=pool.slice(0,5).map((s,k)=>[s.n,E.lv-(4-k),["Barretta energetica","Fascia della grinta","Fascia lucky","Scarpe nuove","Polsino"][k]]).reverse()}
    MAPS[id]={n:E.n,mus:E.champ?"rival":"gym",inside:1,rows:lgRows,objs:[{k:"plant",x:0,y:2},{k:"plant",x:9,y:2}],exit:i===0?{x:4,y:11,to:"lega",tx:11,ty:17}:null,
      npcs:[{id:"elite"+i,x:4,y:3,spr:E.champ?"rival":"leader",col:E.champ?null:(TY[E.ty]||TY.BAS).c,dir:"down",trainer:{n:E.n,party:team,champ:E.champ,money:E.lv*120,sight:0,pre:E.champ?["VITO: «Ce l hai fatta ad arrivare fin qui. Ma il campione sono io!»"]:["Benvenuto nella Lega. Io sono "+E.n.split(": ")[1]+". Pronto?"],lose:E.champ?["VITO: «…Hai vinto tu. Sei tu il nuovo CAMPIONE.»"]:["Prosegui. La prossima sala ti aspetta."],elite:i}},{id:"door"+i,x:4,y:1,spr:"none",talk:"ldoor"}]}});
};
/* ---------- CICLO PRINCIPALE ---------- */
let INTRO=null;/* schermate iniziali */
const update=dt=>{if(G)G.time+=dt;
  if(FADE){FADE.t+=dt;if(FADE.t>=.18&&!FADE.done){FADE.done=1;FADE.cb()}if(FADE.t>=.36)FADE=null}if(FADE&&!FADE.done)return;
  if(TB){if(takeP("a")||takeP("b"))textA();return}
  if(MENU&&MENU.bag){const m=MENU,n=m.keys.length,C=m.cols;if(takeP("u")&&m.i>=C){m.i-=C;SFX.sel()}if(takeP("d")&&m.i+C<n){m.i+=C;SFX.sel()}if(takeP("l")){if(m.i%C===0||!n){SFX.sel();MENU=null;m.edgeL();return}m.i--;SFX.sel()}if(takeP("r")){if(m.i%C===C-1||m.i>=n-1){SFX.sel();MENU=null;m.edgeR();return}m.i++;SFX.sel()}if(takeP("a")){if(!n){takeP("b");return}SFX.sel();const it=m.items[m.i];MENU=null;it[1]()}else if(takeP("b")){SFX.sel();const f=m.onB;MENU=null;f()}takeP("st");return}
  if(MENU){const m=MENU;const n=m.items.length,cols=m.grid?2:1;if(takeP("u")){m.i=(m.i-cols+n)%n;SFX.sel()}if(takeP("d")){m.i=(m.i+cols)%n;SFX.sel()}if(takeP("l")){if(m.left){const f=m.left;MENU=null;f()}else if(cols>1){m.i=(m.i+n-1)%n;SFX.sel()}}if(takeP("r")){if(m.right){const f=m.right;MENU=null;f()}else if(cols>1){m.i=(m.i+1)%n;SFX.sel()}}
    if(takeP("a")){SFX.sel();const it=m.items[m.i];MENU=null;it&&it[1]()}else if(takeP("b")){SFX.sel();if(m.onB){const f=m.onB;MENU=null;f()}else if(!m.battle&&!m.must){MENU=null;SUMM=null;CARD=0;DEXSEL=null}}if(takeP("st")&&m.main){SFX.sel();MENU=null}return}
  if(mode==="title"){if(takeP("a")||takeP("st"))titleGo();return}if(mode==="intro"){takeP("a");takeP("b");takeP("st");return}
  if(mode!=="world"||lock||FADE)return;
  if(takeP("st")){startMenu();return}if(takeP("a")&&!PL.mv){interact();return}takeP("b");
  NPCS.forEach(n=>{if(n.mv){n.wt=(n.wt||0)+dt*2;const k=Math.min(1,n.wt*1.6);n.px+=(n.x-n.px)*Math.min(1,dt*10);n.py+=(n.y-n.py)*Math.min(1,dt*10);if(Math.abs(n.px-n.x)<.02&&Math.abs(n.py-n.y)<.02){n.px=n.x;n.py=n.y;n.mv=0;n.wt=0}}else if(!lock){n.t-=dt;if(n.t<=0){n.t=1.5+rnd()*2.5;if(n.move==="turn")n.dir=pick(["down","left","right","up"]);else if(n.move==="wander"){const d=pick(["down","left","right","up"]),[dx,dy]=DIRV[d];n.dir=d;const x=n.x+dx,y=n.y+dy;if(Math.abs(x-n.ox)<=2&&Math.abs(y-n.oy)<=2&&!solid(x,y)&&!(x===PL.x&&y===PL.y)){n.x=x;n.y=y;n.mv=1;n.wt=0}}}}});
  PL.bumpT=Math.max(0,(PL.bumpT||0)-dt);
  if(PL.mv){const sp=(G.bike?2.2:IN.b?2:1)*(PL.jump?3.2:5.2);PL.prog=(PL.prog||0)+dt*sp/(PL.len||1);PL.wt=(PL.wt||0)+dt*(IN.b?1.6:1);const t=Math.min(1,PL.prog);PL.px=PL.from[0]+(PL.x-PL.from[0])*t;PL.py=PL.from[1]+(PL.y-PL.from[1])*t;if(t>=1){PL.mv=0;PL.prog=0;PL.px=PL.x;PL.py=PL.y;G.x=PL.x;G.y=PL.y;G.dir=PL.dir;stepDone();if(!PL.mv&&mode==="world"&&!lock&&!TB&&!FADE)holdMove()}return}
  if(PL.turnT>0){PL.turnT-=dt;return}holdMove()};
const holdMove=()=>{const d=IN.u?"up":IN.d?"down":IN.l?"left":IN.r?"right":null;if(d){PL.held=PL.dir===d||PL.held;tryMove(d)}else PL.held=false};
const frame=now=>{if(!alive)return;raf=requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;try{update(dt);
  const full=!FLASH&&(mode==="title"||mode==="intro"||(mode==="battle"&&B));OX=Math.floor((VW-240)/2);OY=(full&&mode!=="battle")?Math.max(0,Math.floor((VH-CTRLU-160)/2)):Math.max(0,VH-CTRLU-160);
  if(full){/* schermo più grande del riquadro 240x160: sfondo esteso */const g=cx.createLinearGradient(0,0,0,VH);if(mode==="battle"){drawBattleBG()}else if(0){g.addColorStop(0,"#bfe7ff");g.addColorStop((OY+88)/VH,"#e6f6ff");g.addColorStop((OY+89)/VH,"#d9a868");g.addColorStop(1,"#c08a4f")}else{g.addColorStop(0,"#1e1b4b");g.addColorStop((OY+124)/VH,"#7c3aed");g.addColorStop((OY+124.5)/VH,"#c08a4f");g.addColorStop(1,"#c08a4f")}if(mode!=="battle"){cx.fillStyle=g;cx.fillRect(0,0,VW,VH)}cx.save();cx.translate(OX,OY);const sw=VW,sh=VH;VW=240;VH=160;try{if(mode==="battle")drawBattle(dt);else drawTitle(dt)}finally{VW=sw;VH=sh;cx.restore()}}else if(M)drawWorld(dt);
  if(FADE){cx.fillStyle=`rgba(0,0,0,${FADE.t<.18?FADE.t/.18:1-(FADE.t-.18)/.18})`;cx.fillRect(0,0,VW,VH)}if(FLASH){/* lampeggio sulla mappa come negli originali, senza mostrare ancora la lotta */const ph=Math.floor(now/90)%4;cx.fillStyle=ph===1?"rgba(255,255,255,.9)":ph===3?"rgba(0,0,0,.85)":"rgba(0,0,0,0)";cx.fillRect(0,0,VW,VH)}
  if(!FLASH)drawUI();else{ux.setTransform(1,0,0,1,0,0);ux.clearRect(0,0,ui.width,ui.height)}if(INTRO)INTRO.draw()}catch(e){console.error(e)}};
/* ---------- titolo e nuova partita ---------- */
let titleT=0;const drawTitle=dt=>{titleT+=dt;for(let i=0;i<40;i++){cx.fillStyle="rgba(255,255,255,.5)";cx.fillRect((i*53+titleT*20)%VW,(i*37)%90,1,1)}
  const s=SP.length?SP[Math.floor(titleT/2.5)%SP.length]:null;if(s){cx.drawImage(drawPlayer(s,false),VW/2-36,52,72,72)}};
const titleGo=()=>{auInit();const sv=loadSave();const items=[];if(sv)items.push(["CONTINUA",()=>{G=sv;startWorld()}]);items.push(["NUOVA PARTITA",()=>{if(sv)yesnoT("Cancellare la partita salvata e ricominciare?",ok=>ok?intro():titleGo());else intro()}]);items.push(["ESCI",()=>PD.close()]);menu(items,{title:"POKE DREAM",small:0})};
const yesnoT=(q,cb)=>{say(q,()=>menu([["SÌ",()=>cb(true)],["NO",()=>cb(false)]],{small:1}))};
const intro=()=>{G=newGame("COACH",null);mode="intro";say(["PROF. PARQUET: «Benvenuto nel mondo dei giocatori!»","«In questa regione i giocatori vivono liberi: nei campetti, nell erba alta, perfino nei laghi.»","«Gli allenatori li catturano e li fanno crescere, partita dopo partita.»","«Ma dimmi… per quale squadra alleni?»"],()=>{const ks=Object.keys(TEAMS_);menu(ks.map(k=>[`ALLENATORE ${TEAMS_[k].nick.toUpperCase()}`,()=>{G.team=k;askName()}]),{title:"LA TUA SQUADRA"})})};
const askName=()=>{const d=document.createElement("div");d.id="pdName";d.style.cssText="position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)";d.innerHTML=`<div style="background:#f8fafc;border:4px solid #334155;border-radius:10px;padding:16px;font:800 16px 'Nunito','Segoe UI',Roboto,Arial,sans-serif;color:#111827;text-align:center;width:min(320px,86vw)">Come ti chiami, allenatore?<br><input maxlength="10" value="COACH" style="margin:12px 0;width:85%;font:700 20px monospace;text-align:center;padding:6px;border:2px solid #64748b;border-radius:8px;text-transform:uppercase"><br><button style="padding:10px 26px;border-radius:10px;border:0;background:${TEAM().cap};color:${TEAM().capt};font:900 16px system-ui">OK</button></div>`;host.appendChild(d);const inp=d.querySelector("input");setTimeout(()=>{try{inp.focus();inp.select()}catch(e){}},50);
  const ok=()=>{G.name=(inp.value||"COACH").toUpperCase().slice(0,10);d.remove();const others=Object.keys(TEAMS_).filter(k=>k!==G.team);G.flags.rivTeam=pick(others);G.flags.starters=starterFor(G.team);Object.keys(peopleSpr).forEach(k=>delete peopleSpr[k]);say([`PROF. PARQUET: «${G.name}! Allenatore dei ${TEAM().nick.toUpperCase()}. Bel nome!»`,`«Il mio nipote VITO allena i ${RIVT().nick.toUpperCase()}. Sarà il tuo rivale!»`,"«La tua avventura sta per cominciare. Vieni a trovarmi al laboratorio!»"],()=>startWorld())};d.querySelector("button").onclick=ok;inp.onkeydown=e=>{if(e.key==="Enter")ok()}};
/* finestra per scrivere un nome (soprannomi, ecc.) */
const askText=(title,def,max,cb)=>{const d=document.createElement("div");d.id="pdName";d.style.cssText="position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)";d.innerHTML=`<div style="background:#f8fafc;border:4px solid #334155;border-radius:10px;padding:16px;font:800 16px 'Nunito','Segoe UI',Roboto,Arial,sans-serif;color:#111827;text-align:center;width:min(320px,86vw)">${title}<br><input maxlength="${max||12}" value="${def||""}" style="margin:12px 0;width:85%;font:700 20px monospace;text-align:center;padding:6px;border:2px solid #64748b;border-radius:8px"><br><button style="padding:10px 26px;border-radius:10px;border:0;background:${TEAM().cap};color:${TEAM().capt};font:900 16px system-ui">OK</button></div>`;host.appendChild(d);const inp=d.querySelector("input");setTimeout(()=>{try{inp.focus();inp.select()}catch(e){}},50);const ok=()=>{const v=(inp.value||"").trim().slice(0,max||12);d.remove();cb(v)};d.querySelector("button").onclick=ok;inp.onkeydown=e=>{if(e.key==="Enter")ok()}};
const startWorld=()=>{mode="world";Object.keys(peopleSpr).forEach(k=>delete peopleSpr[k]);loadMap(G.map,G.x,G.y,G.dir);if(G.flags.rivaldone)NPCS.forEach(q=>{if(q.id==="rival")q.vis=false})};
/* i tre giovani della tua squadra: una guardia, un ala, un centro (i meno quotati) */
/* i 3 iniziali di ogni squadra (guardia, ala, centro), scelti tra i giocatori valutati fino a ~800 */const START3={DUC:["Brayden Burries","Matas Buzelis","Hannes Steinbach"],DOL:["De'Aaron Fox","Miles Bridges","Moussa Diabaté"],FOX:["Darius Acuff Jr.","Jabari Smith Jr.","Aday Mara"],PEA:["Immanuel Quickley","Trevon Brazile","Rudy Gobert"],SPI:["Jalen Green","Jaime Jaquez Jr.","Isaiah Hartenstein"],TUR:["Keaton Wagler","Ace Bailey","Zach Edey"],EAG:["Dejounte Murray","Yaxel Lendeborg","Onyeka Okongwu"],MOO:["Jeremiah Fears","Ausar Thompson","Khaman Maluach"]};
const starterFor=t=>{if(START3[t]&&START3[t].every(n=>SPX[n]))return START3[t].slice();const R=(ROST[t]||[]);const by=r=>R.filter(p=>p.role===r).sort((a,b)=>a.val-b.val)[0];const out=[];["G","F","C"].forEach(r=>{let p=by(r);if(!p){p=SP.filter(s=>s.role===r&&!out.includes(s.n)).sort((a,b)=>a.val-b.val)[0];if(p)p={name:p.n}}if(p)out.push(p.name)});return out};
let ROST={};let REGION_OK=false;
const setupWorld=()=>{if(!REGION_OK){REGION_OK=true;buildRegion();const hp=MAPS.hs2_portocampo.npcs[0];hp.gift="Bici";hp.talk=["Questa bici era di mio figlio, ora gioca in Europa. Prendila tu!"];hp.after=["Con la bici vai il doppio più veloce: dal MENU scegli BICI."]}/* erba alta del Percorso 1: i giocatori meno quotati (fuori dalla tua squadra), pesca: lunghi e tiratori */const low=SP.slice().sort((a,b)=>a.val-b.val);const mine=new Set(((G&&ROST[G.team])||[]).map(p=>p.name));const S3=new Set(Object.values(START3).flat());const pool=low.filter(s=>!mine.has(s.n)&&!S3.has(s.n)).slice(0,10);
  ENC.r1={rate:.1,list:pool.map((s,i)=>[s.n,1,3,i<4?30:i<7?15:6])};ENC.fish={rate:1,list:low.filter(s=>s.role==="C"||s.t.includes("TIR")).slice(0,8).map(s=>[s.n,4,8,10])};
  TRP.r1a=[[pool[1]&&pool[1].n||SP[0].n,4]];TRP.r1b=[[pool[2]&&pool[2].n||SP[1].n,3],[pool[3]&&pool[3].n||SP[2].n,4]]};
/* ---------- APERTURA ---------- */
PD.open=o=>{if(alive)return;buildSpecies(o);buildTiles();TEAMS_={};Object.entries(o.teams||{}).forEach(([k,t])=>{TEAMS_[k]={nick:t.nick,cap:t.cap||t.bg,capt:t.fg||"#111"}});ROST={};(o.players||[]).forEach(p=>{if(p.team){(ROST[p.team]=ROST[p.team]||[]).push({name:p.name,role:p.role==="G"?"G":p.role==="C"?"C":"F",val:p.val||0})}});
  host=document.createElement("div");host.style.cssText="position:fixed;inset:0;z-index:2147482000;background:#000;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden;--sat:env(safe-area-inset-top,0px);--sab:env(safe-area-inset-bottom,0px)";document.body.appendChild(host);
  [cv,cx]=cnv(VW,VH);[ui,ux]=cnv(10,10);[cv,ui].forEach(c=>{c.style.cssText="position:absolute;image-rendering:pixelated;image-rendering:crisp-edges";host.appendChild(c)});
  /* comandi */const mkB=(t,css,k)=>{const b=document.createElement("div");b.textContent=t;b.style.cssText="position:absolute;display:flex;align-items:center;justify-content:center;color:#fff;font:900 18px system-ui;border-radius:50%;background:rgba(30,41,59,.9);border:2px solid rgba(255,255,255,.5);box-shadow:0 3px 10px rgba(0,0,0,.35);touch-action:none;"+css;host.appendChild(b);const on=e=>{e.preventDefault();auInit();if(AU.want){const w=AU.want;AU.want=null;playMus(w)}press(k);b.style.background="rgba(124,58,237,.9)"},off=e=>{e&&e.preventDefault();release(k);b.style.background="rgba(51,65,85,.85)"};b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointercancel",off);b.addEventListener("pointerleave",off);return b};
  const pad=document.createElement("div");pad.style.cssText="position:absolute;width:150px;height:150px;touch-action:none";host.appendChild(pad);const pc=document.createElement("div");pc.style.cssText="position:absolute;inset:0;";pad.appendChild(pc);
  [["u","▲","left:50px;top:0"],["d","▼","left:50px;top:100px"],["l","◀","left:0;top:50px"],["r","▶","left:100px;top:50px"]].forEach(([k,t,p])=>{const b=document.createElement("div");b.textContent=t;b.style.cssText=`position:absolute;${p};width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:rgba(30,41,59,.9);border:2px solid rgba(255,255,255,.4);box-sizing:border-box;color:#fff;font:900 18px system-ui;border-radius:12px`;b.dataset.k=k;pc.appendChild(b)});
  const padH=e=>{e.preventDefault();auInit();if(AU.want){const w=AU.want;AU.want=null;playMus(w)}const r=pad.getBoundingClientRect();const dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;["u","d","l","r"].forEach(release);if(Math.hypot(dx,dy)<r.width*.09)return;const k=Math.abs(dx)>Math.abs(dy)?(dx>0?"r":"l"):(dy>0?"d":"u");press(k)};let padId=null;pad.addEventListener("pointerdown",e=>{padId=e.pointerId;try{pad.setPointerCapture(padId)}catch(_){}padH(e)});pad.addEventListener("pointermove",e=>{if(e.pointerId===padId)padH(e)});const padE=e=>{if(e.pointerId!==padId)return;padId=null;["u","d","l","r"].forEach(release)};pad.addEventListener("pointerup",padE);pad.addEventListener("pointercancel",padE);
  const bA=mkB("A","width:64px;height:64px;","a"),bB=mkB("B","width:52px;height:52px;","b"),bS=mkB("MENU","width:66px;height:30px;border-radius:15px;font-size:12px","st");
  /* tocco diretto sulle voci dei menu */ui.style.pointerEvents="auto";ui.addEventListener("pointerdown",e=>{auInit();if(TB){textA();return}if(!MENU)return;const r=ui.getBoundingClientRect(),X=(e.clientX-r.left)/r.width*VW-OX,Y=(e.clientY-r.top)/r.height*VH-OY;const hit=menuRects.find(q=>X>=q[0]&&X<=q[0]+q[2]&&Y>=q[1]&&Y<=q[1]+q[3]);if(hit&&hit[5]){SFX.sel();MENU=null;hit[5]();return}if(hit&&MENU.bag&&!MENU.keys.length)return;if(hit){const m=MENU;if(m.i===hit[4]||m.battle||true){m.i=hit[4];SFX.sel();const it=m.items[m.i];MENU=null;it&&it[1]()}}});
  const lay=()=>{const W=innerWidth,H=innerHeight,land=W>H,big=!!(G&&G.opts&&G.opts.big);let cw,ch,l,t;
    const sat=Math.max(0,parseFloat(getComputedStyle(host).getPropertyValue("--sat"))||0),sab=Math.max(0,parseFloat(getComputedStyle(host).getPropertyValue("--sab"))||0);
    if(land){VH=160;VW=Math.max(240,Math.min(440,Math.round(160*W/H)));SC=H/VH;cw=VW*SC;ch=H;l=(W-cw)/2;t=0}
    else{VW=240;VH=Math.max(160,Math.min(560,Math.round(240*H/W)));SC=W/VW;cw=W;ch=VH*SC;l=0;t=(H-ch)/2}
    const PADS=big?190:160,AS=big?84:72,BS=big?68:58;CTRLU=land?0:Math.ceil((PADS+40+sab)/SC);MENUY=Math.ceil((land?54:104)/SC);
    if(cv.width!==VW||cv.height!==VH){cv.width=VW;cv.height=VH;cx.imageSmoothingEnabled=false}
    [cv,ui].forEach(c=>{c.style.left=l+"px";c.style.top=t+"px";c.style.width=cw+"px";c.style.height=ch+"px"});const dpr=Math.min(2,devicePixelRatio||1);ui.width=Math.round(cw*dpr);ui.height=Math.round(ch*dpr);SC=SC*dpr;
    /* pad: 3x3 con i tasti più grandi */pad.style.width=pad.style.height=PADS+"px";const k=PADS/3;[...pc.children].forEach(b=>{const q=b.dataset.k;b.style.width=b.style.height=k+"px";b.style.left=(q==="l"?0:q==="r"?2*k:k)+"px";b.style.top=(q==="u"?0:q==="d"?2*k:k)+"px";b.style.fontSize=Math.round(k*.38)+"px"});
    bA.style.width=bA.style.height=AS+"px";bA.style.fontSize=Math.round(AS*.36)+"px";bB.style.width=bB.style.height=BS+"px";bB.style.fontSize=Math.round(BS*.34)+"px";
    const op=land?".55":".8";[bA,bB,pc].forEach(b=>{b.style.opacity=op});bS.style.opacity=".85";
    const bot=16+sab;if(land){pad.style.left="14px";pad.style.top=(H-PADS-bot)+"px";bA.style.right="18px";bA.style.top=(H-AS-bot-28)+"px";bB.style.right=(18+AS+10)+"px";bB.style.top=(H-BS-bot)+"px";bS.style.right="14px";bS.style.top=(12+sat)+"px"}
    else{const y0=H-PADS-bot;pad.style.left="16px";pad.style.top=y0+"px";bA.style.right="20px";bA.style.top=(y0+Math.round(PADS*.18))+"px";bB.style.right=(20+AS+8)+"px";bB.style.top=(y0+Math.round(PADS*.18)+AS-BS+26)+"px";bS.style.right="14px";bS.style.top=(sat+58)+"px"}};lay();addEventListener("resize",lay);PD._lay=lay;
  PD._kd=e=>{const k=keyMap[e.key];if(k){press(k);e.preventDefault()}};PD._ku=e=>{const k=keyMap[e.key];if(k)release(k)};addEventListener("keydown",PD._kd);addEventListener("keyup",PD._ku);
  alive=true;mode="title";G=null;setupWorld();last=performance.now();raf=requestAnimationFrame(frame);setTimeout(()=>{if(alive)titleGo()},300);PD._saveT=setInterval(()=>{if(G&&mode==="world")save()},20000);PD.onclose=o.onclose};
PD.close=()=>{alive=false;cancelAnimationFrame(raf);clearInterval(PD._saveT);stopMus();try{save()}catch(e){}removeEventListener("resize",PD._lay);removeEventListener("keydown",PD._kd);removeEventListener("keyup",PD._ku);host&&host.remove();MENU=null;TB=null;TQ=[];B=null;try{AU.ac&&AU.ac.close()}catch(e){}AU.ac=null;AU.cur=null;PD.onclose&&PD.onclose()};
PD.heroPng=(hs)=>{delete peopleSpr.hero;HEROHS=hs||HEROHS;const u=sprFor("hero").toDataURL();delete peopleSpr.hero;return u};PD.bg=v=>{BGT.v=v};PD.spr=(n,st,bk)=>{const s=SPX[n];return s?drawPlayerAny(s,bk,false,st).toDataURL():null};
PD.sheet=(names,styles)=>{const SPl=names.map(n=>SPX[n]).filter(Boolean);const[c,x]=cnv(30+SPl.length*2*60,30+styles.length*70);x.fillStyle="#e2e8f0";x.fillRect(0,0,c.width,c.height);styles.forEach((st,r)=>{x.fillStyle="#111";x.font="bold 10px sans-serif";x.fillText(st.toUpperCase(),4,24+r*70);SPl.forEach((s,i)=>{[false,true].forEach((bk,j)=>{x.drawImage(drawPlayerAny(s,bk,false,st),30+i*120+j*60,10+r*70,56,56)})})});return c.toDataURL()};
PD._dbg=()=>({wild:k=>wildBattle(k),newG:t=>{MENU=null;G=newGame("FRANCI",t);setupWorld();startWorld()},OBJ_SOLID,MAPS,ENC,TRP,GYMS,ELITE,G,PL,get NPCS(){return NPCS},get M(){return MK},get B(){return B},get MENU(){return MENU},get TB(){return TB},press,release,loadMap,SP,MV,mkMon});
})();
