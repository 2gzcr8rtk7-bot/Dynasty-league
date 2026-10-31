/* HOOP DREAMERS — basket 5 contro 5 visto di lato, con omini stilizzati, giocabile su telefono (area riservata Ducks).
   Grafica originale disegnata sul momento (nessuna immagine di altri giochi). Dati veri: rose ROSTER, valori valOf, ruoli ruoloDi, loghi LOGO.
   Mondo in piedi (ft): campo 94 × 50, canestri a x=5,25 e x=88,75, ferro a 10 piedi. Schermo virtuale 960×540. */
(function(){
"use strict";
const VW=960,VH=540,G=32;
const L=94,W=50,RIM_Z=10,RIMS=[5.25,88.75];
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0)/4294967295};
const PREF_K="dl_hoop";
const DEF={arena:"home",auto:false,home:"DUC",away:"DOL",qlen:3,diff:1,speed:1,sound:true,crowd:0.5,left:false,subs:true,names:true,fouls:true};
const pref=()=>{try{return{...DEF,...JSON.parse(localStorage.getItem(PREF_K)||"{}")}}catch(e){return{...DEF}}};
const savePref=p=>{try{localStorage.setItem(PREF_K,JSON.stringify(p))}catch(e){}};
const shade=(hex,f)=>{let c=String(hex||"#888").replace("#","");if(c.length===3)c=c.split("").map(x=>x+x).join("");const n=parseInt(c,16);let r=n>>16,g=n>>8&255,b=n&255;
  if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}return`rgb(${r|0},${g|0},${b|0})`};
const lum=hex=>{let c=String(hex||"#888").replace("#","");if(c.length===3)c=c.split("").map(x=>x+x).join("");const n=parseInt(c,16);return(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255};

/* ===== SONORO (sintetizzato, niente file) ===== */
const SND={ctx:null,on:true,crowd:null,cg:null,master:null};
function sndInit(on,cv){SND.on=on;if(!on)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;SND.ctx=SND.ctx||new A();const c=SND.ctx;if(c.state==="suspended")c.resume();
  SND.master=c.createGain();SND.master.gain.value=.8;SND.master.connect(c.destination);
  const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}
  const src=c.createBufferSource();src.buffer=b;src.loop=true;const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=700;f.Q.value=.5;SND.cg=c.createGain();SND.cg.gain.value=.05+.25*cv;src.connect(f);f.connect(SND.cg);SND.cg.connect(SND.master);src.start();SND.crowd=src;SND.cbase=.05+.25*cv}catch(e){SND.ctx=null}}
function sndStop(){try{SND.crowd&&SND.crowd.stop()}catch(e){}SND.crowd=null;try{SND.master&&SND.master.disconnect()}catch(e){}}
function tone(type,f0,f1,dur,vol,delay){const c=SND.ctx;if(!c||!SND.on)return;const t=c.currentTime+(delay||0),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(SND.master);o.start(t);o.stop(t+dur+.02)}
function noise(dur,freq,q,vol,delay){const c=SND.ctx;if(!c||!SND.on)return;const t=c.currentTime+(delay||0),b=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(SND.master);s.start(t)}
const SFX={
  dribble:()=>tone("sine",120,55,.09,.5),
  swish:()=>{noise(.28,5200,1.2,.35);noise(.18,2600,2,.15,.04)},
  rim:()=>{tone("triangle",620,560,.25,.25);tone("triangle",930,880,.18,.15)},
  board:()=>tone("square",140,80,.12,.18),
  squeak:()=>tone("sine",1900,2700,.07,.12),
  whistle:()=>{tone("sine",2900,2950,.35,.18);tone("sine",3100,3080,.35,.12)},
  buzzer:()=>tone("square",196,190,.9,.22),
  steal:()=>{tone("square",500,900,.08,.12)},
  block:()=>{tone("sawtooth",220,90,.18,.22);noise(.12,900,1,.2)},
  pass:()=>tone("sine",300,200,.05,.15),
  cheer:(k)=>{const c=SND.ctx;if(!c||!SND.cg)return;const t=c.currentTime,g=SND.cg.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(SND.cbase*(k||3.5),t+.25);g.linearRampToValueAtTime(SND.cbase,t+2.2)},
  dunk:()=>{tone("square",110,50,.25,.3);noise(.25,1500,.8,.25)}
};

/* ===== SQUADRE E GIOCATORI (dati veri della lega) ===== */
function teamColors(t){const T=(typeof TEAMS!=="undefined"?TEAMS:{})[t]||{};const bg=T.bg||"#1e3a8a";const alt=T.fg&&T.fg!==bg?T.fg:(lum(bg)>.6?"#111":"#fff");return{bg,alt,dark:shade(bg,-.45),light:shade(bg,.55)}}
function mkPlayer(n,team,i){const v=(typeof valOf==="function"&&valOf(n))||400,r=(typeof ruoloDi==="function"&&ruoloDi(n))||"F",h=hash(n),h2=hash(n+"x"),h3=hash(n+"y");
  const ovr=clamp(48+48*Math.sqrt(v/3300),48,99);const j=(k,amp)=>clamp(ovr+amp+(hash(n+k)-.5)*18,30,99);
  const R={G:{spd:6,sht3:6,shtM:3,ins:-6,pas:7,drb:8,def:0,stl:5,blk:-10,reb:-10,hgt:6.3},F:{spd:1,sht3:0,shtM:3,ins:2,pas:0,drb:0,def:3,stl:1,blk:0,reb:2,hgt:6.8},C:{spd:-7,sht3:-15,shtM:-4,ins:9,pas:-5,drb:-10,def:4,stl:-5,blk:10,reb:11,hgt:7.1}}[r]||{};
  let age=26;try{age=eta(n)||26}catch(e){}
  return{n,sur:String(n).replace(/\s+(Jr\.?|II|III|IV)$/i,"").split(" ").slice(-1)[0],team,i,role:r,num:1+Math.floor(h*45),v,ovr:Math.round(ovr),age,
    spd:j("s",R.spd),sht3:j("3",R.sht3),shtM:j("m",R.shtM),ins:j("i",R.ins),pas:j("p",R.pas),drb:j("d",R.drb),def:j("e",R.def),stl:j("t",R.stl),blk:j("b",R.blk),reb:j("r",R.reb),
    hgt:R.hgt+(h2-.5)*.4,skin:["#f1c9a5","#e0ac7e","#c68642","#8d5524","#5a3825"][Math.floor(h3*5)],
    x:0,y:0,z:0,vx:0,vy:0,vz:0,face:1,st:"idle",t:0,cd:0,stun:0,phase:Math.random()*6,en:1,
    s:{pts:0,reb:0,ast:0,stl:0,blk:0,fgm:0,fga:0,tpm:0,tpa:0,to:0,min:0}}}
function mkTeam(code,side){const R=((typeof ROSTER!=="undefined"?ROSTER:{})[code]||[]).filter(p=>p[5]!=="G");const L=R.map(p=>p[0]).filter(n=>{try{return valOf(n)>0}catch(e){return true}});
  L.sort((a,b)=>(valOf(b)||0)-(valOf(a)||0));const roles={G:[],F:[],C:[]};L.forEach(n=>{const r=ruoloDi(n)||"F";(roles[r]||roles.F).push(n)});
  const st=[];const take=(r,k)=>{for(let i=0;i<k&&roles[r].length;i++)st.push(roles[r].shift())};take("G",2);take("F",2);take("C",1);
  while(st.length<5){const rest=[...roles.G,...roles.F,...roles.C];if(!rest.length)break;const n=rest[0];["G","F","C"].forEach(r=>{const i=roles[r].indexOf(n);if(i>=0)roles[r].splice(i,1)});st.push(n)}
  const bench=[...roles.G,...roles.F,...roles.C].sort((a,b)=>(valOf(b)||0)-(valOf(a)||0)).slice(0,8);
  const P=[...st,...bench].map((n,i)=>mkPlayer(n,side,i));const T=(typeof TEAMS!=="undefined"?TEAMS:{})[code]||{nick:code,name:code};
  return{code,nick:T.nick||code,name:T.name||code,col:teamColors(code),all:P,on:P.slice(0,5),fouls:0,to:0,logo:null}}

/* ===== STATO DELLA PARTITA ===== */
let C=null,cv=null,ctx=null,raf=0,last=0,acc=0,ov=null,cfg=null;
const IN={ax:0,ay:0,stick:null,btn:{},kb:{},press:{},rel:{}};
function newGame(c){cfg=c;const A=mkTeam(c.home,0),B=mkTeam(c.away,1);
  C={T:[A,B],q:1,clock:720,shot:24,score:[0,0],poss:0,phase:"tip",pt:1.6,ball:{x:47,y:25,z:3,vx:0,vy:0,vz:0,h:null,st:"tip",last:0,sh:null,pass:null,t:0},
    ctl:null,msg:"",msgT:0,camX:47,arrow:1,over:false,shake:0,parts:[],tipWin:0,box:false,paused:false,fx:[],firstPoss:null,lastShooter:null,ft:null,deadT:0};
  [A,B].forEach(T=>{try{const im=new Image();im.src=(typeof LOGO2!=="undefined"&&LOGO2[T.code])||(typeof LOGO!=="undefined"&&LOGO[T.code])||"";T.logo=im}catch(e){}});
  placeTip();}
const allOn=()=>C.T[0].on.concat(C.T[1].on);
const attRight=t=>(t===0)===(C.q<=2||(C.q>4&&C.q%2===1));/* la squadra 0 attacca a destra nel primo tempo, a sinistra nel secondo */
const rimX=t=>attRight(t)?RIMS[1]:RIMS[0];
const ownX=t=>attRight(t)?RIMS[0]:RIMS[1];
const isThree=(x,y,rx)=>{const d=dist(x,y,rx,25);if(Math.abs(y-25)>=22&&Math.abs(x-rx)<=9)return true;return d>=23.75};
function placeTip(){const T=C.T;T.forEach((tm,t)=>tm.on.forEach((p,i)=>{const sgn=t===0?-1:1;const off=[[3,10],[6,40],[8,18],[10,32],[1,25]][i]||[5,25];p.x=47+sgn*(i===4?1.2:off[0]);p.y=i===4?25:off[1];p.z=0;p.vx=p.vy=p.vz=0;p.st="idle";p.face=-sgn}));
  const b=C.ball;b.h=null;b.st="tip";b.x=47;b.y=25;b.z=8;C.phase="tip";C.pt=1.4;C.msg="Palla a due";C.msgT=1.4}
function giveBall(p,dead){const b=C.ball;b.h=p;b.st="held";b.sh=null;b.pass=null;b.last=p.team;if(C.poss!==p.team){C.poss=p.team;C.shot=24;resetUser()}if(dead){C.phase="dead";C.deadT=dead}userCtl()}
function resetUser(){C.ctl=null}
function userCtl(){if(cfg&&cfg.auto){C.ctl=null;return}const U=C.T[0];const b=C.ball;if(b.h&&b.h.team===0){C.ctl=b.h;return}if(C.poss===0){if(!C.ctl||C.ctl.team!==0)C.ctl=U.on[0];return}
  if(!C.ctl||C.ctl.team!==0||!U.on.includes(C.ctl)){const h=b.h;C.ctl=h?guardOf(h):U.on[0]}}
function guardOf(p){const D=C.T[1-p.team].on;return D[p.i%5]||D[C.T[p.team].on.indexOf(p)]||D[0]}
function matchup(p){const O=C.T[1-p.team].on;return O[C.T[p.team].on.indexOf(p)]||O[0]}
function say(m,t){C.msg=m;C.msgT=t||1.4}

/* posizioni in attacco (rispetto al canestro attaccato), indice = posto in quintetto */
const SPOT=[[22,25],[20,8],[18,42],[4,4],[6,46],[8,18],[3,32]];
function spotFor(p,team){const i=C.T[team].on.indexOf(p),rx=rimX(team),dir=rx>47?-1:1;let s=[[23,25],[19,7],[19,43],[6,4],[5,30]][i]||[15,25];
  if(p.role==="C")s=[5+hash(p.n)*3,30+(hash(p.n+"c")-.5)*8];if(p.role==="F"&&i>=2)s=[[16,46],[7,6]][i%2];return{x:rx+dir*s[0],y:s[1]}}

/* ===== INPUT ===== */
function bindInput(){
  const pt=e=>{const r=cv.getBoundingClientRect();const k=Math.min(r.width/VW,r.height/VH),ox=(r.width-VW*k)/2,oy=(r.height-VH*k)/2;return{x:(e.clientX-r.left-ox)/k,y:(e.clientY-r.top-oy)/k}};
  cv.addEventListener("pointerdown",e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}const p=pt(e);
    if(C.over){endTap(p);return}if(C.paused){pauseTap(p);return}
    if(p.x>VW-70&&p.y<60){C.paused=true;SFX.whistle();return}
    const b=btnAt(p);if(b){IN.btn[b]=e.pointerId;IN.press[b]=1;return}
    const leftSide=cfg.left?p.x>VW*.55:p.x<VW*.5;if(leftSide&&!IN.stick){const ox=clamp(p.x,78,VW-78),oy=clamp(p.y,150,VH-75);IN.stick={id:e.pointerId,ox,oy,x:p.x,y:p.y}}},{passive:false});
  cv.addEventListener("pointermove",e=>{if(IN.stick&&IN.stick.id===e.pointerId){const p=pt(e);IN.stick.x=p.x;IN.stick.y=p.y}});
  const up=e=>{if(IN.stick&&IN.stick.id===e.pointerId)IN.stick=null;for(const k in IN.btn)if(IN.btn[k]===e.pointerId){delete IN.btn[k];IN.rel[k]=1}};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  window.addEventListener("keydown",kd);window.addEventListener("keyup",ku)}
const KEYS={KeyJ:"a",KeyK:"b",KeyL:"c",Space:"a",KeyX:"b",KeyC:"c",KeyZ:"a"};
function kd(e){if(!C)return;if(e.code==="Escape"||e.code==="KeyP"){C.paused=!C.paused;return}const b=KEYS[e.code];if(b&&!IN.kb[e.code]){IN.press[b]=1;IN.btn[b]="kb"}IN.kb[e.code]=1;if(/Arrow|Key[WASDJKLXCZ]|Space/.test(e.code))e.preventDefault()}
function ku(e){if(!C)return;const b=KEYS[e.code];if(b&&IN.btn[b]==="kb"){delete IN.btn[b];IN.rel[b]=1}delete IN.kb[e.code]}
function axis(){let x=0,y=0;const k=IN.kb;if(k.ArrowLeft||k.KeyA)x-=1;if(k.ArrowRight||k.KeyD)x+=1;if(k.ArrowUp||k.KeyW)y-=1;if(k.ArrowDown||k.KeyS)y+=1;
  if(IN.stick){const dx=IN.stick.x-IN.stick.ox,dy=IN.stick.y-IN.stick.oy,m=Math.hypot(dx,dy);if(m>6){x=dx/Math.max(m,50);y=dy/Math.max(m,50)}}const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}return{x,y}}
const BTN=()=>{const R=cfg.left?[[90,440],[200,470],[110,320]]:[[VW-90,440],[VW-200,470],[VW-110,320]];return{a:{x:R[0][0],y:R[0][1],r:58},b:{x:R[1][0],y:R[1][1],r:46},c:{x:R[2][0],y:R[2][1],r:44}}};
function btnAt(p){const B=BTN();for(const k in B){if(dist(p.x,p.y,B[k].x,B[k].y)<B[k].r+10)return k}return null}

/* ===== LOGICA ===== */
function rate(p,k){return p[k]*(.82+.18*p.en)}
function update(dt){if(C.over||C.paused){IN.press={};IN.rel={};return}
  const sp=cfg.speed;dt*=sp;C.t=(C.t||0)+dt;if(C.msgT>0)C.msgT-=dt;
  if(C.phase==="tip"){C.pt-=dt;C.ball.z=8+Math.sin(C.t*6)*.3;if(C.pt<=0){const a=C.T[0].on[4],b=C.T[1].on[4];const w=Math.random()<(.5+(a.hgt-b.hgt)*.3+(a.reb-b.reb)/400)?0:1;C.tipWin=w;C.arrow=1-w;
      const getter=C.T[w].on[0];giveBall(getter);C.phase="live";SFX.whistle();say("Palla a due vinta dai "+C.T[w].nick)}
    tickPlayers(dt);IN.press={};IN.rel={};return}
  if(C.phase==="dead"){C.deadT-=dt;tickPlayers(dt,true);if(C.deadT<=0)C.phase="live";IN.press={};IN.rel={};return}
  if(C.phase==="ft"){ftTick(dt);IN.press={};IN.rel={};return}
  if(C.phase==="inb"){inbTick(dt);IN.press={};IN.rel={};C.camX+=(clamp(C.ball.x,21,73)-C.camX)*Math.min(1,dt*3);return}
  if(C.phase==="qend"){C.deadT-=dt;if(C.deadT<=0)nextQuarter();IN.press={};IN.rel={};return}
  /* orologi */
  const live=C.ball.st!=="shot"||true;C.clock-=dt*(12/cfg.qlen);C.shot-=dt*clamp(12/cfg.qlen/2.5,1,2);/* 24 secondi accelerati quanto basta: le partite corte restano giocabili */
  if(C.shot<=0&&C.ball.st==="held"){SFX.buzzer();say("24 secondi!");turnover(C.poss,"sideline");}
  if(C.clock<=0){C.clock=0;if(C.ball.st!=="shot"){endQuarter();return}}
  userControl(dt);ai(dt);tickPlayers(dt);ballTick(dt);fatigue(dt);
  IN.press={};IN.rel={};C.camX+=(clamp(C.ball.x,21,73)-C.camX)*Math.min(1,dt*3)}
function fatigue(dt){C.T.forEach(T=>{T.all.forEach(p=>{if(T.on.includes(p)){p.en=Math.max(.2,p.en-dt*(Math.hypot(p.vx,p.vy)>5?.0045:.0015));p.s.min+=dt*(12/cfg.qlen)/60}else p.en=Math.min(1,p.en+dt*.01)})})}
function trySubs(){if(!cfg.subs)return;C.T.forEach((T,t)=>{T.on.forEach((p,i)=>{if(p.en>.55)return;const B=T.all.filter(x=>!T.on.includes(x)&&x.en>p.en+.25);if(!B.length)return;
  const same=B.filter(x=>x.role===p.role);const q=(same.length?same:B).sort((a,b)=>b.ovr*b.en-a.ovr*a.en)[0];q.x=p.x;q.y=p.y;q.z=0;q.st="idle";T.on[i]=q;if(C.ball.h===p)C.ball.h=q;if(C.ctl===p)C.ctl=q})})}

function userControl(dt){if(cfg.auto){C.ctl=null;return}userCtl();const p=C.ctl;if(!p)return;const a=axis();const b=C.ball;const off=b.h===p;
  if(p.stun>0)return;
  if(p.st!=="shoot"&&p.st!=="dunk"){const s=(13+rate(p,"spd")*.08)*(p.st==="drib"?1.55:1)*(off?.93:1);if(Math.hypot(a.x,a.y)>.15){p.vx=a.x*s;p.vy=a.y*s*.85;if(Math.abs(a.x)>.2)p.face=a.x>0?1:-1;p.idleT=0}else{p.vx*=.6;p.vy*=.6;p.idleT=(p.idleT||0)+dt}}
  if(off){/* ATTACCO: A tiro (tieni e lascia), B passaggio, C palleggio */
    if(IN.press.a&&p.st!=="shoot")startShot(p,true);
    if(IN.rel.a&&p.st==="shoot")release(p);
    if(IN.press.b)doPass(p,a);
    if(IN.press.c)dribMove(p,a)}
  else if(C.poss===1||!C.ball.h||C.ball.h.team!==0){/* DIFESA: A salto, B ruba, C cambia giocatore */
    if(IN.press.a)jump(p,12.5);
    if(IN.press.b)stealTry(p);
    if(IN.press.c){const h=b.h||{x:b.x,y:b.y};const D=C.T[0].on.slice().sort((u,v)=>dist(u.x,u.y,h.x,h.y)-dist(v.x,v.y,h.x,h.y));C.ctl=D[0]===p?D[1]:D[0];SFX.squeak()}
    if(p.idleT>1.2)defendAI(p,dt)}
  else{/* compagno con la palla in aria / passaggio: muoviti */ if(IN.press.a)jump(p,12.5)}}

function jump(p,v){if(p.z>.05||p.stun>0)return;p.vz=v*(.85+p.hgt/45);p.st=p.st==="shoot"?"shoot":"jump";p.jt=0}
function startShot(p,user){const rx=rimX(p.team),d=dist(p.x,p.y,rx,25);p.vx*=.2;p.vy*=.2;
  if(d<5.5&&(p.ins+p.hgt*4>95||Math.random()<.35)&&Math.abs(p.x-rx)>.8){p.st="dunk";p.jt=0;p.vz=15;p.face=rx>p.x?1:-1;p.dunkFrom={x:p.x,y:p.y};p.user=user;return}
  p.st="shoot";p.jt=0;p.vz=10.5;p.user=user;p.face=rx>p.x?1:-1;p.shotT0=C.t}
function release(p){if(p.st!=="shoot"||p.released)return;p.released=true;const apex=10.5/G;const e=Math.abs(p.jt-apex);
  let q=p.user?(e<.055?1.18:e<.12?1.0:e<.22?.82:.62):({0:.88,1:1,2:1.08}[cfg.diff]*rnd(.9,1.08));if(!p.user&&p.team===0)q=rnd(.92,1.05);
  if(p.user)p.rel=e<.055?"PERFETTO":e<.12?"BUONO":e<.22?(p.jt<apex?"PRESTO":"TARDI"):(p.jt<apex?"TROPPO PRESTO":"TROPPO TARDI");
  shoot(p,q)}
function contest(p){const D=C.T[1-p.team].on;let best=null,bd=99;D.forEach(d=>{const k=dist(p.x,p.y,d.x,d.y);if(k<bd){bd=k;best=d}});return{d:best,k:bd}}
function shoot(p,q){const b=C.ball;if(b.h!==p)return;const rx=rimX(p.team),d=dist(p.x,p.y,rx,25),three=isThree(p.x,p.y,rx);
  let base,r;if(d<=4.5){base=.6;r=rate(p,"ins")}else if(d<=10){base=.47;r=(rate(p,"ins")+rate(p,"shtM"))/2}else if(!three){base=d<16?.42:.39;r=rate(p,"shtM")}else{base=.385-Math.max(0,d-27)*.025;r=rate(p,"sht3")}
  const c=contest(p);let f=c.k<1.5?.62:c.k<3?.8:c.k<5?.93:1;if(c.d&&c.d.z>.6&&c.k<4)f*=.9;
  let pm=clamp(base*(.55+.9*r/100)*q*f,.02,.95);
  /* stoppata */
  if(c.d&&c.k<2.6&&c.d.z>1.4&&Math.random()<.05+rate(c.d,"blk")/450+(d<6?.06:0)){b.h=null;b.st="loose";b.x=p.x;b.y=p.y;b.z=p.z+8;b.vx=(p.x-c.d.x)*2+rnd(-4,4);b.vy=rnd(-6,6);b.vz=rnd(2,6);b.last=c.d.team;c.d.s.blk++;p.s.fga++;if(three)p.s.tpa++;SFX.block();say("STOPPATA di "+c.d.sur+"!");C.shake=.3;p.st="idle";C.lastShooter=null;return}
  b.h=null;b.st="shot";b.t=0;b.sh={p,rx,x0:p.x+p.face*.6,y0:p.y,z0:p.z+8.2,T:.55+d*.022,H:3+d*.11,pm,make:Math.random()<pm,three,d};b.last=p.team;p.s.fga++;if(three)p.s.tpa++;C.lastShooter=p;
  if(c.d&&c.k<2.2&&cfg.fouls&&Math.random()<.07+(cfg.diff===0&&p.team===0?.05:0)){b.sh.foul=c.d}}
function dunk(p){const b=C.ball,rx=rimX(p.team);p.s.fga++;const c=contest(p);let pm=.92;if(c.d&&c.k<2&&c.d.z>1.5)pm=.55;
  if(Math.random()<pm){score(p,2,true);SFX.dunk();C.shake=.45;say("SCHIACCIATA di "+p.sur+"!",1.6);}
  else{b.h=null;b.st="loose";b.x=rx;b.y=25;b.z=10;b.vx=(rx>47?-1:1)*rnd(4,9);b.vy=rnd(-6,6);b.vz=rnd(6,10);SFX.rim();say("Ferro!")}}
function doPass(p,a){const T=C.T[p.team].on.filter(x=>x!==p);let best=null,bs=-1e9;const m=Math.hypot(a.x,a.y);
  T.forEach(t=>{const dx=t.x-p.x,dy=t.y-p.y,dd=Math.hypot(dx,dy)||1;const g=contest(t);let s=g.k*2-dd*.15;if(m>.3)s+=((dx*a.x+dy*a.y*1.2)/dd)*25;if(s>bs){bs=s;best=t}});
  if(!best)return;passTo(p,best)}
function passTo(p,t){const b=C.ball;b.h=null;b.st="pass";b.t=0;const d=dist(p.x,p.y,t.x,t.y);b.pass={from:p,to:t,x0:p.x,y0:p.y,z0:4.5,T:clamp(d/42,.18,.9)};b.last=p.team;p.st="idle";SFX.pass();p.lastPass=C.t;C.assist={p,t:C.t}}
function dribMove(p,a){if(p.cd>0||p.st==="drib")return;p.st="drib";p.jt=0;p.cd=1.1;SFX.squeak();const m=Math.hypot(a.x,a.y);
  const rx=rimX(p.team);let dx=m>.3?a.x:(rx>p.x?1:-1),dy=m>.3?a.y:rnd(-.6,.6);const k=Math.hypot(dx,dy)||1;p.vx=dx/k*24;p.vy=dy/k*20;p.face=dx>0?1:-1;
  const g=guardOf(p);if(g&&dist(p.x,p.y,g.x,g.y)<4.2){const ch=.25+(rate(p,"drb")-rate(g,"def"))/180-(cfg.diff===2&&p.team===0?.06:0)+(cfg.diff===0&&p.team===0?.08:0);
    if(Math.random()<ch){g.stun=.95;g.vx=g.vy=0;say(p.sur+" gli rompe le caviglie!",1.3);SFX.cheer(2.2)}
    else if(Math.random()<.04+(rate(g,"stl")-rate(p,"drb"))/600){stealBy(g,p)}}}
function stealTry(p){if(p.cd>0)return;p.cd=.75;p.st="reach";p.jt=0;const b=C.ball;const h=b.h;SFX.squeak();
  if(h&&h.team!==p.team&&dist(p.x,p.y,h.x,h.y)<3.4&&h.st!=="shoot"&&h.st!=="dunk"){const ch=.13+(rate(p,"stl")-rate(h,"drb"))/250+(cfg.diff===0?.08:cfg.diff===2?-.05:0)*(p.team===0?1:-1);
    if(Math.random()<ch){stealBy(p,h);return}if(cfg.fouls&&Math.random()<.14){foul(p,h,false);return}}
  if(b.st==="pass"&&b.pass){const P=b.pass,u=clamp(b.t/P.T,0,1),bx=P.x0+(P.to.x-P.x0)*u,by=P.y0+(P.to.y-P.y0)*u;if(dist(p.x,p.y,bx,by)<3&&Math.random()<.5+rate(p,"stl")/300){b.st="held";b.pass=null;C.poss!==p.team&&(p.s.stl++,P.from.s.to++,C.T[P.from.team].to++);giveBall(p);SFX.steal();say("Intercetto di "+p.sur+"!")}}}
function stealBy(p,h){p.s.stl++;h.s.to++;C.T[h.team].to++;giveBall(p);SFX.steal();SFX.cheer(2.5);say("Palla rubata da "+p.sur+"!");h.stun=.5}
function foul(d,o,shooting){const T=C.T[d.team];T.fouls++;SFX.whistle();
  if(shooting||(T.fouls>4&&cfg.fouls)){say(shooting?"Fallo su tiro: "+(shooting)+" liberi":"Bonus: 2 tiri liberi",1.6);startFT(o,shooting||2);return}
  say("Fallo di "+d.sur+" ("+T.fouls+" di squadra)");inbound(o.team,"side",o)}
function turnover(team,where){C.T[team].to++;const b=C.ball;if(b.h)b.h.s.to++;inbound(1-team,where)}
/* (791) RIMESSE vere: chi rimette sta fuori dal campo (fondo dopo un canestro, lato o fondo dove è uscita la palla, metà campo a inizio quarto),
   i compagni si smarcano, orologi fermi finché la palla non è passata; 5 secondi per rimettere. Tu: scegli con la levetta e PASSA (o TIRO). */
function inbound(team,where,who){const b=C.ball;try{trySubs()}catch(e){}const T=C.T[team];const bxp=b.x,byp=b.y;let x0,y0;
  if(where==="base"){const ox=ownX(team);x0=ox<47?-1.4:L+1.4;y0=25+(Math.random()<.5?-6:6)}
  else if(where==="mid"){x0=47;y0=-1.4}
  else if(bxp<0||bxp>L){x0=bxp<0?-1.4:L+1.4;y0=clamp(byp,3,47);if(Math.abs(y0-25)<4)y0=25+(y0<25?-4:4)}
  else{x0=clamp(bxp,6,L-6);y0=byp<25?-1.4:W+.5}
  const cand=T.on.filter(q=>q!==who&&q!==T.on[0]);const p=(cand.length?cand:T.on).slice().sort((u,v)=>dist(u.x,u.y,x0,y0)-dist(v.x,v.y,x0,y0))[0];
  allOn().forEach(q=>{q.inb=false;if(q.z<=0&&q.st!=="idle")q.st="idle"});
  p.x=x0;p.y=y0;p.z=0;p.vx=p.vy=p.vz=0;p.st="idle";p.inb=true;p.reenter=true;p.released=false;p.face=x0<1?1:x0>L-1?-1:(rimX(team)>47?1:-1);
  b.h=p;b.st="held";b.sh=null;b.pass=null;b.last=team;b.x=p.x;b.y=p.y;b.z=3;
  if(C.poss!==team){C.poss=team;resetUser()}C.shot=24;C.phase="inb";C.inb={p,t:0,team,wait:rnd(1,1.8),x:x0,y:y0};userCtl();
  if(team===0&&!cfg.auto)say("Rimessa: scegli con la levetta e PASSA",1.8)}
function inbTick(dt){const I=C.inb,p=I.p,b=C.ball;I.t+=dt;p.vx=p.vy=0;p.x=I.x;p.y=I.y;const user=I.team===0&&!cfg.auto;
  b.h=p;b.st="held";b.x=p.x+p.face*.6;b.y=p.y+.4;b.z=3.2;
  const into={x:clamp(p.x+(p.x<1?9:p.x>L-1?-9:0),3,L-3),y:clamp(p.y+(p.y<0?10:p.y>W?-10:0),4,W-4)},side=p.x>1&&p.x<L-1;
  const M=C.T[I.team].on.filter(q=>q!==p).sort((u,v)=>dist(u.x,u.y,p.x,p.y)-dist(v.x,v.y,p.x,p.y));
  if(user){C.ctl=p;if(IN.press.b||IN.press.a){doPass(p,axis());if(b.st==="pass"){p.inb=false;C.phase="live";C.inb=null}}}
  else if(I.team===1&&!cfg.auto)userControl(dt);
  allOn().forEach(q=>{if(q===p||q.stun>0)return;if(q===C.ctl&&q.team===0&&!cfg.auto)return;
    if(q.team===I.team){const k=M.indexOf(q);if(k===0)moveTo(q,into.x,into.y,1);else if(k===1)moveTo(q,into.x+(side?(into.x<47?8:-8):0),into.y+(side?0:(into.y<25?9:-9)),1);else offBallAI(q,dt)}
    else defendAI(q,dt)});
  tickPlayers(dt);
  if(C.phase==="inb"&&!user&&I.t>I.wait){const o=M.slice().sort((u,v)=>contest(v).k-contest(u).k)[0];if(o){p.inb=false;passTo(p,o);C.phase="live";C.inb=null}}
  if(C.phase==="inb"&&I.t>5){SFX.whistle();say("5 secondi! Palla agli avversari");C.T[I.team].to++;p.inb=false;b.x=p.x;b.y=p.y;inbound(1-I.team,"side")}}
function score(p,pts,dunked){const b=C.ball;C.score[p.team]+=pts;p.s.pts+=pts;p.s.fgm++;if(pts===3)p.s.tpm++;
  if(C.assist&&C.assist.t>C.t-3.5&&C.assist.p!==p&&C.assist.p.team===p.team)C.assist.p.s.ast++;C.assist=null;
  SFX.cheer(p.team===0?4:2.5);b.h=null;b.st="net";b.t=0;b.x=rimX(p.team);b.y=25;b.z=RIM_Z;b.scorer=p.team;p.st="idle"}
function startFT(p,n){C.phase="ft";C.ft={p,n,k:0,t:1.3,made:0};const rx=rimX(p.team);p.x=rx+(rx>47?-15:15);p.y=25;p.z=0;p.st="idle";
  C.T.forEach((T,t)=>T.on.forEach((q,i)=>{if(q===p)return;const side=i%2?18:32;q.x=rx+(rx>47?-1:1)*(6+i*1.6);q.y=side+(t?3:-3);q.st="idle";q.vx=q.vy=0}));const b=C.ball;b.h=p;b.st="held"}
function ftTick(dt){const F=C.ft;F.t-=dt;const p=F.p,b=C.ball;b.x=p.x+p.face*.6;b.y=p.y;b.z=4+Math.abs(Math.sin(C.t*5))*.4;
  if(F.t<=0){F.k++;const pm=clamp(.55+rate(p,"sht3")*.0035,.4,.95);const mk=Math.random()<pm;if(mk){C.score[p.team]++;p.s.pts++;F.made++;SFX.swish();SFX.cheer(2)}else SFX.rim();say("Libero "+F.k+"/"+F.n+(mk?": dentro":": fuori"),1);F.t=1.1;
    if(F.k>=F.n){C.phase="live";if(mk)inbound(1-p.team,"base");else{const D=C.T[1-p.team].on;const r=D.slice().sort((u,v)=>v.reb-u.reb)[0];r.s.reb++;giveBall(r,.6)}}}}
function endQuarter(){SFX.buzzer();C.phase="qend";C.deadT=2.4;const b=C.ball;if(b.h)b.h.st="idle";
  if(C.q>=4&&C.score[0]!==C.score[1]){C.over=true;C.phase="over";SFX.cheer(5);return}
  say(C.q===2?"Fine primo tempo":C.q>=4?"Supplementare!":"Fine "+C.q+"° quarto",2.4)}
function nextQuarter(){C.q++;C.clock=C.q>4?300:720;C.shot=24;C.T.forEach(T=>T.fouls=0);trySubs();const t=C.arrow;C.arrow=1-C.arrow;
  allOn().forEach(p=>{p.vx=p.vy=0;p.z=0;p.st="idle"});inbound(t,"mid");say((C.q>4?"Supplementare":C.q+"° quarto"),1.6);SFX.whistle()}

function ballTick(dt){const b=C.ball;b.t+=dt;
  if(b.st==="held"&&b.h){const p=b.h;const moving=Math.hypot(p.vx,p.vy)>2;const ph=(C.t*(moving?7:5))%(Math.PI);b.x=p.x+p.face*.75;b.y=p.y+.6;
    if(p.st==="shoot"||p.st==="dunk"){b.z=p.z+7.6;b.x=p.x+p.face*.3}else{const nz=.4+Math.abs(Math.cos(ph))*2.6;if(b.z>1.2&&nz<=1.2&&moving)SFX.dribble();else if(b.z>1&&nz<=1&&!moving&&Math.random()<.5)SFX.dribble();b.z=nz}
    /* esce dal campo con la palla */
    if(p.x<.2||p.x>L-.2||p.y<.2||p.y>W-.2){SFX.whistle();say("Fuori!");turnover(p.team,"side")}
    return}
  if(b.st==="pass"&&b.pass){const P=b.pass,u=b.t/P.T;b.x=P.x0+(P.to.x-P.x0)*u;b.y=P.y0+(P.to.y-P.y0)*u;b.z=P.z0+Math.sin(u*Math.PI)*1.5;
    /* intercetto della difesa */
    C.T[1-P.from.team].on.forEach(d=>{if(b.st!=="pass")return;if(dist(d.x,d.y,b.x,b.y)<1.4&&Math.random()<dt*(.4+rate(d,"stl")/150)*(P.T>.5?1.6:1)*(d===C.ctl?1.6:1)){P.from.s.to++;C.T[P.from.team].to++;d.s.stl++;giveBall(d);SFX.steal();say("Intercetto di "+d.sur+"!")}});
    if(b.st==="pass"&&u>=1){const t=P.to;b.st="held";giveBall(t)}return}
  if(b.st==="shot"&&b.sh){const S=b.sh,u=Math.min(1,b.t/S.T);b.x=S.x0+(S.rx-S.x0)*u;b.y=S.y0+(25-S.y0)*u;b.z=S.z0+(RIM_Z-S.z0)*u+4*S.H*u*(1-u);
    if(u>=1){const p=S.p;if(S.make){const pts=S.three?3:2;score(p,pts);const sw=Math.random()<.6;sw?SFX.swish():(SFX.rim(),SFX.swish());if(S.d>30)say("Da lontanissimo! "+p.sur,1.6);else if(S.three)say("TRIPLA di "+p.sur+"!",1.3);
        if(S.foul){S.foul.s&&0;C.T[S.foul.team].fouls++;SFX.whistle();say("Canestro e fallo!",1.4);setTimeout(()=>{if(C&&!C.over&&C.phase!=="ft")startFT(p,1)},700)}}
      else{if(S.foul){C.T[S.foul.team].fouls++;b.st="dead";startFT(p,S.three?3:2);say("Fallo su tiro",1.4);return}
        b.st="loose";b.x=S.rx+(S.rx>47?-.8:.8);b.y=25;b.z=RIM_Z+.2;b.vx=(S.rx>47?-1:1)*rnd(3,11);b.vy=rnd(-8,8);b.vz=rnd(5,11);Math.random()<.35?SFX.board():SFX.rim();C.shot=Math.min(24,Math.max(C.shot,14))}
      if(C.clock<=0&&b.st!=="loose"){endQuarter()}}
    return}
  if(b.st==="net"){b.z-=dt*14;if(b.z<=1){b.st="dead";const t=1-b.scorer;if(C.clock<=0){endQuarter();return}inbound(t,"base")}return}
  if(b.st==="loose"){b.vz-=G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;if(b.z<0){b.z=0;b.vz=-b.vz*.55;b.vx*=.8;b.vy*=.8;if(Math.abs(b.vz)>2)SFX.dribble()}
    if(b.x<-1||b.x>L+1||b.y<-1||b.y>W+1){SFX.whistle();say("Fuori!");inbound(1-b.last,"side");return}
    if(C.clock<=0){endQuarter();return}
    /* rimbalzo / palla vagante */
    let best=null,bs=99;allOn().forEach(p=>{if(p.stun>0)return;const k=dist(p.x,p.y,b.x,b.y),reach=p.z+p.hgt+1.6+p.reb/120;if(k<2.3&&b.z<reach){const s=k-p.reb/90-(p.z>.5?.6:0);if(s<bs){bs=s;best=p}}});
    if(best){best.s.reb++;const off=best.team===C.poss;giveBall(best,0);if(!off)C.shot=24;C.lastShooter=null;if(best.team===0||best.team===1)say((off?"Rimbalzo offensivo ":"Rimbalzo ")+best.sur,.9)}}}

/* ===== INTELLIGENZA ARTIFICIALE ===== */
function ai(dt){const b=C.ball;const O=C.poss,D=1-O;
  allOn().forEach(p=>{if(p===C.ctl&&p.team===0&&!cfg.auto)return;if(p.stun>0)return;if(p.st==="shoot"||p.st==="dunk")return;
    if(b.st==="loose"){const T=C.T[p.team].on;const near=T.slice().sort((u,v)=>dist(u.x,u.y,b.x,b.y)-dist(v.x,v.y,b.x,b.y));if(near.indexOf(p)<2){moveTo(p,b.x+b.vx*.25,b.y+b.vy*.25,1);if(dist(p.x,p.y,b.x,b.y)<3&&b.z>p.hgt+1&&b.z<p.hgt+5&&b.vz<0&&Math.random()<.1)jump(p,12);return}}
    if(p.team===O){if(b.h===p)handlerAI(p,dt);else offBallAI(p,dt)}else defendAI(p,dt)})}
function moveTo(p,x,y,f){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);const s=(12+rate(p,"spd")*.08)*(f||1);if(d<.6){p.vx*=.5;p.vy*=.5;return}const k=Math.min(1,d/2.5);p.vx=dx/d*s*k;p.vy=dy/d*s*k*.85;if(Math.abs(dx)>.5)p.face=dx>0?1:-1}
function offBallAI(p,dt){const s=spotFor(p,p.team);const b=C.ball;let tx=s.x,ty=s.y;
  /* dopo un tiro o in transizione: corri avanti; taglio a canestro ogni tanto */
  if((p.cut||0)>0){p.cut-=dt;tx=rimX(p.team)+(rimX(p.team)>47?-3:3);ty=25+(hash(p.n)-.5)*6}else if(Math.random()<dt*.06)p.cut=1.2;
  moveTo(p,tx,ty,.85)}
function handlerAI(p,dt){const rx=rimX(p.team),dir=rx>47?-1:1,d=dist(p.x,p.y,rx,25),c=contest(p),three=isThree(p.x,p.y,rx),df=cfg.diff;p.think=(p.think||0)-dt;
  /* 1) porta su la palla: dritto verso la linea da tre */
  if(d>27){moveTo(p,rx+dir*22,25+(p.y-25)*.5,1.05);if(C.shot<2.5&&d<40)startShot(p,false);return}
  /* 2) se è ora di tirare, tira */
  const open=c.k>4.5-df*.4,inRange=d<5||(d<16&&open&&rate(p,"shtM")>62)||(three&&open&&rate(p,"sht3")>66&&d<26);
  if(d<4.2&&Math.random()<dt*6){startShot(p,false);return}
  if(C.shot<2||(C.clock<2.5&&C.clock>0&&C.shot>2)){startShot(p,false);return}
  if(p.think>0){const g=p.goal||{x:rx+dir*3,y:25};moveTo(p,g.x,g.y,1.05);if(inRange&&Math.random()<dt*1.4)startShot(p,false);return}
  p.think=rnd(.7,1.3);
  if(inRange&&Math.random()<.45){startShot(p,false);return}
  /* 3) scarico al compagno più libero se marcato stretto o dopo un po' */
  const T=C.T[p.team].on.filter(x=>x!==p),o=T.slice().sort((u,v)=>(contest(v).k-dist(v.x,v.y,rx,25)*.08)-(contest(u).k-dist(u.x,u.y,rx,25)*.08))[0];
  if(o&&contest(o).k>4&&(c.k<2.5||Math.random()<.35)){passTo(p,o);return}
  /* 4) crossover se il difensore è addosso */
  if(c.k<2.8&&p.cd<=0&&Math.random()<.35){dribMove(p,{x:-dir,y:rnd(-.6,.6)});return}
  /* 5) piano: penetrazione o tiro dal palleggio */
  p.goal=Math.random()<.65?{x:rx+dir*rnd(1.5,5),y:25+rnd(-5,5)}:{x:rx+dir*rnd(12,21),y:clamp(p.y+rnd(-10,10),6,44)};moveTo(p,p.goal.x,p.goal.y,1.05)}
function defendAI(p,dt){const b=C.ball,m=matchup(p);if(!m)return;const rx=rimX(m.team);const onBall=b.h===m;const gap=onBall?2.6:4.5+dist(m.x,m.y,rx,25)*.08;
  const dx=rx-m.x,dy=25-m.y,d=Math.hypot(dx,dy)||1;let tx=m.x+dx/d*gap,ty=m.y+dy/d*gap;
  /* aiuto sotto canestro se la palla è vicina al ferro */
  if(!onBall&&b.h&&dist(b.h.x,b.h.y,rx,25)<9&&p.role!=="G"){tx=(tx+rx+(rx>47?-3:3))/2;ty=(ty+25)/2}
  moveTo(p,tx,ty,1.02);if(Math.abs(m.x-p.x)>.3)p.face=m.x>p.x?1:-1;
  /* contesta i tiri */
  if(m.st==="shoot"&&dist(p.x,p.y,m.x,m.y)<5&&p.z<.05&&Math.random()<dt*(4+cfg.diff*2))jump(p,12.5);
  if(m.st==="dunk"&&dist(p.x,p.y,m.x,m.y)<4&&p.z<.05&&Math.random()<.5)jump(p,13);
  /* prova a rubare */
  if(onBall&&p.team===1&&p.cd<=0&&dist(p.x,p.y,m.x,m.y)<3.2&&Math.random()<dt*(.1+cfg.diff*.07))stealTry(p);
  if(onBall&&p.team===0&&p!==C.ctl&&p.cd<=0&&dist(p.x,p.y,m.x,m.y)<3.2&&Math.random()<dt*.12)stealTry(p)}

function tickPlayers(dt,frozen){const P=allOn();P.forEach(p=>{p.cd=Math.max(0,p.cd-dt);if(p.stun>0){p.stun-=dt;p.vx*=.8;p.vy*=.8}
    if(p.st==="drib"){p.jt+=dt;if(p.jt>.32)p.st="idle"}if(p.st==="reach"){p.jt+=dt;if(p.jt>.3)p.st="idle"}
    if(p.st==="dunk"){p.jt+=dt;const rx=rimX(p.team);p.x+=(rx+(rx>47?-.6:.6)-p.x)*Math.min(1,dt*6);p.y+=(25-p.y)*Math.min(1,dt*6);if(p.jt>.42&&!p.dunked){p.dunked=true;if(C.ball.h===p)dunk(p)}}
    if(p.st==="shoot"){p.jt+=dt;if(!p.released&&p.jt>(p.user?.62:10.5/G+rnd(-.08,.08)))release(p)}
    if(!frozen){p.x+=p.vx*dt;p.y+=p.vy*dt}
    if(p.z>0||p.vz>0){p.vz-=G*dt;p.z+=p.vz*dt;if(p.z<=0){p.z=0;p.vz=0;if(p.st==="jump")p.st="idle";if(p.st==="shoot"||p.st==="dunk"){if(p.st==="shoot"&&!p.released&&C.ball.h===p){/* atterrato senza tirare: passi */SFX.whistle();say("Passi!");p.st="idle";turnover(p.team,"side")}p.st="idle";p.released=false;p.dunked=false}}}
    if(p.st!=="shoot"&&p.st!=="dunk"&&p.z<=0&&!p.released)p.released=false;
    if(p.reenter){if(p.x>.5&&p.x<L-.5&&p.y>.5&&p.y<W-.5)p.reenter=false}else{p.x=clamp(p.x,.5,L-.5);p.y=clamp(p.y,.5,W-.5)}p.phase+=Math.hypot(p.vx,p.vy)*dt*.9});
  /* niente sovrapposizioni */
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=b.x-a.x,dy=(b.y-a.y)*1.4,d=Math.hypot(dx,dy);if(d<1.5&&d>0){const k=(1.5-d)/2;a.x-=dx/d*k;a.y-=dy/d*k/1.4;b.x+=dx/d*k;b.y+=dy/d*k/1.4}}}

/* ===== DISEGNO (788: pixel art, vista dall'alto di tre quarti, giocatori a testa grande) =====
   Tutta la scena si disegna su un buffer piccolo (480x270) e si ingrandisce senza sfumare: effetto pixel.
   Grafica originale (nessuna immagine di altri giochi): campo grigio a listoni, area dipinta e fasce nei colori di casa,
   logo della squadra a centrocampo, tribune con pubblico e panchine coi giocatori veri, canestri sul sostegno. */
const BW=384,BH=216,BS=8,BDY=3.36,BZ=3.9,FY0=44,CX0=-10,CWD=912,CY0=38,SPH=40,PXF=VW/BW;
let BUF=null,bctx=null;
const bx=x=>Math.round((x-C.camX)*BS+BW/2),by=(y,z)=>Math.round(FY0+y*BDY-(z||0)*BZ);
const sx=x=>((x-C.camX)*BS+BW/2)*PXF,sy=(y,z)=>(FY0+y*BDY-(z||0)*BZ)*PXF;
const HAIR=["#1a1210","#2b1a10","#3d2414","#5a3a1e","#0e0e0e","#8a6a3a","#1a1210"];
const FONT3={0:["111","101","101","101","111"],1:["010","110","010","010","111"],2:["111","001","111","100","111"],3:["111","001","011","001","111"],4:["101","101","111","001","001"],5:["111","100","111","001","111"],6:["111","100","111","101","111"],7:["111","001","010","010","010"],8:["111","101","111","101","111"],9:["111","101","111","001","111"]};
function outline(c){const g=c.getContext("2d"),w=c.width,h=c.height,d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);
  const on=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&a[(y*w+x)*4+3]>0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3])continue;if(on(x-1,y)||on(x+1,y)||on(x,y-1)||on(x,y+1)){o[i]=24;o[i+1]=16;o[i+2]=22;o[i+3]=255}}
  d.data.set(o);g.putImageData(d,0,0)}
/* sprite di un giocatore: arms = down|swA|swB|def|up|reach|hold, legs = idle|r0|r1|r2|r3|def|air; f = 1 guarda a destra, -1 a sinistra */
function sprite(p,arms,legs,f){p._sp=p._sp||{};const key=arms+legs+f;if(p._sp[key])return p._sp[key];
  const c=document.createElement("canvas");c.width=20;c.height=SPH;const g=c.getContext("2d");const col=C.T[p.team].col;
  const P=(x,y,w,h,cl)=>{w=w||1;h=h||1;g.fillStyle=cl;g.fillRect(f>0?x:20-x-w,y,w,h)};
  const sk=p.skin,skD=shade(sk,-.18),hs=Math.floor(hash(p.n+"h")*6),hc=HAIR[Math.floor(hash(p.n+"c")*HAIR.length)],beard=hash(p.n+"b")>.62,
    shoe=["#f4f4f4","#1b1b1b",col.alt,"#e23b3b","#f4f4f4"][Math.floor(hash(p.n+"s")*5)],light=lum(col.bg)>.62,jer=col.bg,trim=col.alt,shorts=col.bg;
  const Lg=4+(p.hgt>=6.95?2:p.hgt>=6.55?1:0)-(legs==="def"?1:0)-(legs==="air"?1:0),bot=SPH-1;
  /* gambe: [x, sollevata] (la prima è la gamba lontana, più scura) */
  const LG={idle:[[7,0],[11,0]],r0:[[5,2],[12,0]],r1:[[8,0],[10,1]],r2:[[12,0],[5,2]],r3:[[10,1],[8,0]],def:[[5,0],[13,0]],air:[[7,2],[11,1]]}[legs]||[[7,0],[11,0]];
  const legTop=bot-2-Lg;
  LG.forEach(([x,l],k)=>{const s=k?sk:skD;P(x,legTop-l,2,Lg,s);P(x,bot-2-l,2,1,"#f4f4f4");P(x,bot-1-l,3,2,shoe)});
  const yS=legTop-4,yJ=yS-7,yH=yJ-11;
  /* pantaloncini e canotta */
  P(6,yS,8,4,shorts);P(6,yS,1,4,trim);P(13,yS,1,4,trim);if(light){P(6,yS+3,8,1,shade(jer,-.25))}
  P(6,yJ,8,7,jer);P(6,yJ,1,2,trim);P(13,yJ,1,2,trim);P(8,yJ,1,1,trim);P(11,yJ,1,1,trim);P(9,yJ,2,1,sk);
  P(8,yJ-1,4,1,sk);/* collo */
  /* testa */
  P(6,yH,8,10,sk);P(5,yH+1,10,8,sk);P(14,yH+6,1,1,sk);
  P(6,yH+5,1,1,skD);/* orecchio */
  const hair=()=>{if(hs===0){P(6,yH,8,2,hc);P(5,yH+1,2,3,hc);P(13,yH+1,2,1,hc)}
    else if(hs===1){P(5,yH-2,10,4,hc);P(4,yH-1,12,4,hc);P(4,yH+3,3,3,hc);P(14,yH+2,1,2,hc)}
    else if(hs===2){P(7,yH,4,1,shade(sk,.25))}
    else if(hs===3){P(6,yH,8,1,hc);P(5,yH+1,2,1,hc)}
    else if(hs===4){P(6,yH-1,8,2,hc);P(5,yH,10,1,hc);P(5,yH+2,10,1,light?"#e23b3b":trim)}
    else{P(6,yH-1,8,2,hc);P(4,yH,4,8,hc);P(5,yH,10,2,hc);P(4,yH+8,2,2,hc)}};
  hair();
  /* occhi e sopracciglia (guardano verso f) */
  P(9,yH+5,1,2,"#fff");P(10,yH+5,1,2,"#141014");P(12,yH+5,1,2,"#fff");P(13,yH+5,1,2,"#141014");
  if(hs!==2){P(9,yH+4,2,1,hc);P(12,yH+4,2,1,hc)}else{P(9,yH+4,2,1,skD);P(12,yH+4,2,1,skD)}
  if(beard){P(7,yH+8,7,2,hc);P(11,yH+8,2,1,skD)}else P(11,yH+8,2,1,skD);
  /* braccia */
  const yA=yJ+1;
  const A={down:()=>{P(4,yA,2,6,skD);P(14,yA,2,6,sk)},swA:()=>{P(3,yA,2,5,skD);P(15,yA,2,5,sk)},swB:()=>{P(5,yA,2,6,skD);P(13,yA+1,2,6,sk)},
    def:()=>{P(1,yA+1,5,2,skD);P(1,yA-1,2,2,skD);P(14,yA+1,5,2,sk);P(17,yA-1,2,2,sk)},
    up:()=>{P(6,yH-6,2,yA-yH+7,skD);P(12,yH-6,2,yA-yH+7,sk)},
    reach:()=>{P(4,yA,2,6,skD);P(14,yA+1,6,2,sk)},hold:()=>{P(4,yA,2,6,skD);P(14,yA,2,4,sk);P(15,yA+3,3,3,sk)}};
  (A[arms]||A.down)();
  /* numero (non specchiato) */
  const s=String(p.num),w=s.length*4-1;let x0=10-Math.ceil(w/2);g.fillStyle=light?shade(jer,-.55):trim;
  for(const ch of s){const F=FONT3[ch];F.forEach((r,yy)=>{for(let xx=0;xx<3;xx++)if(r[xx]==="1")g.fillRect(x0+xx,yJ+2+yy,1,1)});x0+=4}
  outline(c);c.top=yH-(arms==="up"?6:hs===1?2:1)-1;p._sp[key]=c;return c}
function pellW(g,X,Y,cx,cy,r,a0,a1,cl){g.fillStyle=cl;const n=Math.ceil((a1-a0)*r*BS*1.2)+4;let lx=null,ly=null;for(let k=0;k<=n;k++){const t=a0+(a1-a0)*k/n;const x=X(cx+Math.cos(t)*r),y=Y(cy+Math.sin(t)*r);if(x!==lx||y!==ly){g.fillRect(x,y,1,1);lx=x;ly=y}}}
function buildCourt(){const H=cfg.arena==='away'?C.T[1]:C.T[0];const c=document.createElement("canvas");c.width=CWD;c.height=BH-CY0;const g=c.getContext("2d");
  const X=x=>Math.round((x-CX0)*BS),Y=y=>Math.round(FY0+y*BDY-CY0),Xf=x=>(x-CX0)*BS,Yf=y=>FY0+y*BDY-CY0;
  /* listoni grigi */
  const WD=["#d8d9dc","#d0d2d6","#dcdde0","#cdcfd3","#d4d6d9"];
  for(let r=0;r<c.height;r+=3){g.fillStyle=WD[Math.floor(hash("r"+r)*WD.length)];g.fillRect(0,r,CWD,3);g.fillStyle="#b3b6bc";let x=Math.floor(hash("o"+r)*30);while(x<CWD){g.fillRect(x,r,1,3);x+=18+Math.floor(hash(r+"s"+x)*30)}g.fillStyle="#c3c5ca";g.fillRect(0,r+2,CWD,1);
    g.fillStyle="rgba(255,255,255,.18)";g.fillRect(0,r,CWD,1)}
  /* fasce fuori campo nei colori di casa */
  g.fillStyle=H.col.dark;g.fillRect(0,0,CWD,Y(0)-3);g.fillRect(0,0,X(-4.5),c.height);g.fillRect(X(98.5),0,CWD-X(98.5),c.height);
  g.fillStyle=H.col.bg;g.fillRect(0,Y(0)-4,CWD,1);g.fillRect(X(-4.5)-1,0,1,c.height);g.fillRect(X(98.5),0,1,c.height);
  g.save();g.fillStyle=H.col.alt==="#111111"||lum(H.col.alt)<.3?"#fff":H.col.alt;g.font="bold 13px 'Courier New',monospace";g.textAlign="center";g.textBaseline="middle";
  const nm=(H.name||H.nick).toUpperCase();g.translate(X(-4.5)-18,c.height/2+6);g.rotate(Math.PI/2);g.fillText(nm,0,0);g.restore();
  g.save();g.fillStyle=lum(H.col.alt)<.3?"#fff":H.col.alt;g.font="bold 13px 'Courier New',monospace";g.textAlign="center";g.textBaseline="middle";g.translate(X(98.5)+18,c.height/2+6);g.rotate(-Math.PI/2);g.fillText(nm,0,0);g.restore();
  /* area dipinta */
  const paint=H.col.dark,inner=shade(H.col.bg,.35);
  [[0,1],[L,-1]].forEach(([b,d])=>{const x0=Math.min(X(b),X(b+d*19)),x1=Math.max(X(b),X(b+d*19));g.fillStyle=paint;g.fillRect(x0,Y(17),x1-x0,Y(33)-Y(17));
    g.fillStyle=inner;g.globalAlpha=.55;g.fillRect(x0+(d>0?0:6),Y(19),x1-x0-6,Y(31)-Y(19));g.globalAlpha=1;
    /* mezzo cerchio del tiro libero pieno */
    g.fillStyle=paint;const fx=b+d*19;for(let yy=Y(19);yy<=Y(31);yy++){const v=(yy-Yf(25))/(6*BDY);if(Math.abs(v)>1)continue;const half=Math.sqrt(1-v*v)*6*BS;const xa=Xf(fx),xb=Xf(fx)+d*half;g.fillRect(Math.round(Math.min(xa,xb)),yy,Math.round(Math.abs(xb-xa)),1)}});
  /* linee */
  const WL="#f6f7f8";g.fillStyle=WL;const hl=(x0,x1,y)=>g.fillRect(Math.min(X(x0),X(x1)),Y(y),Math.abs(X(x1)-X(x0))+1,1),vl=(x,y0,y1)=>g.fillRect(X(x),Math.min(Y(y0),Y(y1)),1,Math.abs(Y(y1)-Y(y0))+1);
  hl(0,L,0);hl(0,L,W);vl(0,0,W);vl(L,0,W);vl(47,0,W);
  pellW(g,X,Y,47,25,6,0,Math.PI*2,WL);pellW(g,X,Y,47,25,2,0,Math.PI*2,WL);
  [[0,1],[L,-1]].forEach(([b,d])=>{const fx=b+d*19;hl(b,fx,17);hl(b,fx,33);vl(fx,17,33);
    pellW(g,X,Y,fx,25,6,0,Math.PI*2,WL);
    const rx=b+d*5.25;pellW(g,X,Y,rx,25,4,d>0?-Math.PI/2:Math.PI/2,d>0?Math.PI/2:Math.PI*1.5,WL);
    const a=Math.asin(22/23.75);hl(b,rx+d*Math.cos(a)*23.75,3);hl(b,rx+d*Math.cos(a)*23.75,47);
    if(d>0)pellW(g,X,Y,rx,25,23.75,-a,a,WL);else pellW(g,X,Y,rx,25,23.75,Math.PI-a,Math.PI+a,WL);
    [7,8,11,14].forEach(k=>{g.fillRect(X(b+d*k),Y(17)-2,1,2);g.fillRect(X(b+d*k),Y(33)+1,1,2)})});
  /* logo a centrocampo */
  if(H.logo&&H.logo.complete&&H.logo.naturalWidth){const w=96,h=w*H.logo.naturalHeight/H.logo.naturalWidth*.74;g.imageSmoothingEnabled=true;g.drawImage(H.logo,Math.round(X(47)-w/2),Math.round(Y(25)-h/2),w,h);C._cl=1}
  else{g.fillStyle=H.col.bg;g.font="bold 16px 'Courier New',monospace";g.textAlign="center";g.fillText(H.nick.toUpperCase(),X(47),Y(25)+5)}
  C._court=c}
function buildCrowd(){const H=cfg.arena==='away'?C.T[1]:C.T[0],A=cfg.arena==='away'?C.T[0]:C.T[1];const SK=["#f1c9a5","#e0ac7e","#c68642","#8d5524","#5a3825"];
  const fr=[0,1].map(k=>{const c=document.createElement("canvas");c.width=CWD;c.height=CY0;const g=c.getContext("2d");
    g.fillStyle="#121a33";g.fillRect(0,0,CWD,CY0);
    for(let r=0;r<3;r++){const y0=1+r*7;g.fillStyle=r%2?"#1b2547":"#202b52";g.fillRect(0,y0+3,CWD,4);
      for(let x=(r%2)*3;x<CWD;x+=6){const h=hash(r+":"+x);if(h<.1){g.fillStyle="#2c3a6b";g.fillRect(x,y0+2,5,4);continue}
        const sh=h<.48?H.col.bg:h<.6?A.col.bg:h<.73?"#e5e7eb":h<.83?H.col.alt:"#5b6478",up=k&&hash(x+"u"+r)<.55?1:0;
        g.fillStyle=SK[Math.floor(hash(x+"k"+r)*5)];g.fillRect(x+1,y0-up,3,3);if(hash(x+"h"+r)<.7){g.fillStyle="#1a1210";g.fillRect(x+1,y0-up,3,1)}
        g.fillStyle=sh;g.fillRect(x,y0+3-up,5,3);if(up){g.fillStyle=SK[Math.floor(hash(x+"k"+r)*5)];g.fillRect(x,y0-2,1,2);g.fillRect(x+4,y0-2,1,2)}}}
    /* ringhiera, panchine e tavolo */
    g.fillStyle=H.col.bg;g.fillRect(0,22,CWD,2);g.fillStyle="#0c1124";g.fillRect(0,24,CWD,CY0-24);
    const X=x=>Math.round((x-CX0)*BS);g.fillStyle="#24305e";
    [[13,39],[55,81]].forEach(([a,b])=>{for(let x=X(a);x<X(b);x+=9){g.fillRect(x,30,7,8)}});
    g.fillStyle="#070a16";g.fillRect(X(40),27,X(54)-X(40),11);g.fillStyle=H.col.bg;g.fillRect(X(40),27,X(54)-X(40),2);
    g.fillStyle="#e5e7eb";g.font="bold 7px 'Courier New',monospace";g.textAlign="center";g.fillText((H.nick+" · "+A.nick).toUpperCase(),X(47),36);
    return c});
  C._crowd=fr}
function drawArena(g){if(!C._court||(!C._cl&&C.T.some(T=>T.logo&&T.logo.complete&&T.logo.naturalWidth)))buildCourt();if(!C._crowd)buildCrowd();
  const ox=Math.round((C.camX-CX0)*BS-BW/2);const tt=Math.abs(C.t||0),cheer=C.msgT>0||C.phase==="ft"?Math.floor(tt*7)%2:(Math.floor(tt*1.3)%5===0?1:0);
  g.drawImage(C._crowd[cheer],ox,0,BW,CY0,0,0,BW,CY0);
  /* panchine con i giocatori veri */
  const H0=cfg.arena==='away'?1:0;C.T.forEach((T,t)=>{const B=T.all.filter(p=>!T.on.includes(p)).slice(0,8);const side=t===H0?[14,38]:[56,80];
    B.forEach((p,i)=>{const x=bx(side[0]+i*(side[1]-side[0])/8+1.4);if(x<-12||x>BW+12)return;const s=sprite(p,"down","idle",t===H0?1:-1);const top=s.top;g.drawImage(s,0,top,20,18,x-10,21,20,18)})});
  g.drawImage(C._court,ox,0,BW,BH-CY0,0,CY0,BW,BH-CY0)}
function drawHoop(g,rx,front){const dir=rx<47?-1:1,H=cfg.arena==='away'?C.T[1]:C.T[0];const bl=rx+dir*5.25-dir*0;const base=(dir>0?L:0)+dir*3.2,bd=rx+dir*1.25;
  const cx=bx(rx),cy=by(25,RIM_Z);
  if(!front){/* sostegno imbottito, palo, braccio e tabellone visto di taglio */
    const X=bx(base);g.fillStyle="#141824";g.fillRect(X-6,by(25)-15,12,17);g.fillStyle=H.col.bg;g.fillRect(X-5,by(25)-14,10,15);g.fillStyle=H.col.alt;g.fillRect(X-5,by(25)-10,10,1);
    g.fillStyle="#9aa1ad";g.fillRect(X-1,by(25,13.4),3,by(25)-14-by(25,13.4));g.fillStyle="#6b7280";g.fillRect(X+1,by(25,13.4),1,by(25)-14-by(25,13.4));
    const X2=bx(bd);g.fillStyle="#9aa1ad";g.fillRect(Math.min(X,X2),by(25,12.6),Math.abs(X2-X),2);
    const t=by(22,13.6),b=by(28,9.6);g.fillStyle="#141824";g.fillRect(X2-2,t-1,5,b-t+2);g.fillStyle="#eef2f7";g.fillRect(X2-1,t,3,b-t);g.fillStyle="#e23b3b";g.fillRect(X2-1,by(25,11.4),3,4);
    /* metà dietro del ferro */g.fillStyle="#c2410c";for(let a=Math.PI;a<=Math.PI*2;a+=.12)g.fillRect(Math.round(cx+Math.cos(a)*7),Math.round(cy+Math.sin(a)*3),1,1);return}
  g.fillStyle="#f97316";for(let a=0;a<=Math.PI;a+=.1)g.fillRect(Math.round(cx+Math.cos(a)*7),Math.round(cy+Math.sin(a)*3),1,1);g.fillRect(cx-7,cy,1,1);g.fillRect(cx+7,cy,1,1);
  const sw=C.ball.st==="net"&&Math.abs(C.ball.x-rx)<1.5?Math.round(Math.sin(C.t*30)*1.5):0;g.fillStyle="rgba(255,255,255,.9)";
  for(let i=0;i<=6;i++){const x0=cx-6+i*2;for(let k=1;k<=6;k++){const x=Math.round(x0+(cx-x0)*k/9+sw*k/6);if((k+i)%2===0||k===6)g.fillRect(x,cy+1+k,1,1)}}}
function drawPlayer(g,p){const X=bx(p.x),Y=by(p.y),zz=Math.round(p.z*BZ),hasB=C.ball.h===p,run=Math.hypot(p.vx,p.vy)>1.5&&p.z<=.05,dfn=p.team!==C.poss;
  const r=["r0","r1","r2","r3"][Math.floor(p.phase*1.7)%4];
  const legs=p.z>.3?"air":run?r:dfn?"def":"idle";
  const arms=p.st==="shoot"||p.st==="dunk"?"up":p.z>.3&&dfn?"up":p.st==="reach"?"reach":hasB?"hold":dfn&&!run?"def":run?(r==="r0"?"swA":r==="r2"?"swB":"down"):"down";
  const s=sprite(p,arms,legs,p.face>=0?1:-1);
  const k=Math.max(.4,1-p.z/9);g.fillStyle="rgba(20,24,40,.28)";g.fillRect(X-Math.round(6*k),Y-1,Math.round(12*k),3);g.fillRect(X-Math.round(4*k),Y-2,Math.round(8*k),5);
  g.drawImage(s,X-10,Y-SPH+1-zz);
  const top=Y-SPH+1-zz+s.top;
  if(p.stun>0){g.fillStyle="#facc15";const a=C.t*10;for(let i=0;i<3;i++)g.fillRect(Math.round(X+Math.cos(a+i*2.1)*6),Math.round(top-2+Math.sin(a+i*2.1)*2),2,2)}
  if(p===C.ctl){g.fillStyle="#141824";g.fillRect(X-4,top-7,9,1);g.fillRect(X-3,top-6,7,1);g.fillStyle="#facc15";g.fillRect(X-3,top-7,7,1);g.fillRect(X-2,top-6,5,1);g.fillRect(X-1,top-5,3,1);g.fillRect(X,top-4,1,1)}
  if(cfg.names&&(p===C.ctl||hasB))(C._lab=C._lab||[]).push({x:X*PXF,y:(top-9)*PXF,t:p.sur.toUpperCase()})}
function drawBall(g){const b=C.ball;if(b.st==="tip"&&C.phase!=="tip")return;const X=bx(b.x),Y=by(b.y),Z=by(b.y,b.z);
  g.fillStyle="rgba(20,24,40,.3)";g.fillRect(X-2,Y-1,5,2);
  const o="#e8731a",d="#4a2410";g.fillStyle=d;g.fillRect(X-2,Z-3,5,7);g.fillRect(X-3,Z-2,7,5);g.fillStyle=o;g.fillRect(X-1,Z-2,3,5);g.fillRect(X-2,Z-1,5,3);g.fillStyle=d;g.fillRect(X-2,Z,5,1);g.fillRect(X,Z-2,1,5);g.fillStyle="#ffb36b";g.fillRect(X-1,Z-2,1,1)}
let SCB=null;function drawScore(G0){if(!SCB){SCB=document.createElement('canvas');SCB.width=248;SCB.height=27}const g=SCB.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,248,27);const A=C.T[0],B=C.T[1],x0=3,y0=3,h=17;
  g.fillStyle="#2563eb";g.fillRect(x0-2,y0-2,244,h+4);g.fillStyle="#0a1028";g.fillRect(x0-1,y0-1,242,h+2);
  g.font="bold 11px 'Courier New',monospace";g.textBaseline="middle";
  const team=(T,x,t)=>{g.fillStyle=T.col.bg;g.fillRect(x,y0,62,h);g.fillStyle="rgba(0,0,0,.25)";g.fillRect(x,y0+h-2,62,2);
    if(T.logo&&T.logo.complete&&T.logo.naturalWidth){g.imageSmoothingEnabled=true;g.drawImage(T.logo,x+2,y0+1,15,15);g.imageSmoothingEnabled=false}
    g.fillStyle=lum(T.col.bg)>.6?"#111":"#fff";g.textAlign="left";g.fillText(T.code,x+20,y0+h/2+1);
    g.fillStyle="#0f1733";g.fillRect(x+62,y0,22,h);g.fillStyle="#fff";g.textAlign="center";g.fillText(C.score[t],x+73,y0+h/2+1);
    for(let i=0;i<5;i++){g.fillStyle=i<T.fouls?(T.fouls>=5?"#ef4444":"#facc15"):"rgba(255,255,255,.18)";g.fillRect(x+21+i*7,y0+h+3,5,2)}
    if(C.poss===t){g.fillStyle="#facc15";g.fillRect(x+62+9,y0+h+3,4,2)}};
  team(A,x0,0);team(B,x0+84,1);
  const m=Math.floor(C.clock/60),s=Math.floor(C.clock%60);let x=x0+168;g.fillStyle="#fff";g.textAlign="center";g.fillText(C.q>4?"OT":C.q+"Q",x+12,y0+h/2+1);
  g.fillStyle="#1c2550";g.fillRect(x+24,y0+2,1,h-4);g.fillStyle="#fff";g.fillText(m+":"+String(s).padStart(2,"0"),x+41,y0+h/2+1);
  g.fillStyle="#1c2550";g.fillRect(x+58,y0+2,1,h-4);g.fillStyle=C.shot<5?"#ff4d4d":"#ef4444";g.fillText(Math.max(0,Math.ceil(C.shot)),x+66,y0+h/2+1);g.textBaseline="alphabetic";G0.imageSmoothingEnabled=false;G0.drawImage(SCB,VW/2-248,4,496,54);G0.imageSmoothingEnabled=true}
function drawHUD(g){const A=C.T[0],B=C.T[1];
  /* pausa */g.fillStyle="rgba(8,10,20,.7)";g.beginPath();g.arc(VW-34,32,22,0,7);g.fill();g.fillStyle="#fff";g.fillRect(VW-41,22,5,20);g.fillRect(VW-32,22,5,20);
  /* nomi sopra i giocatori */(C._lab||[]).forEach(l=>{g.font="bold 12px system-ui,sans-serif";g.textAlign="center";const w=g.measureText(l.t).width+10;g.fillStyle="rgba(10,14,30,.75)";g.fillRect(l.x-w/2,l.y-14,w,17);g.fillStyle="#fff";g.fillText(l.t,l.x,l.y-1)});C._lab=[];
  /* messaggio */if(C.msgT>0&&C.msg){g.textAlign="center";g.font="bold 26px system-ui,sans-serif";g.lineWidth=5;g.strokeStyle="rgba(0,0,0,.6)";g.strokeText(C.msg,VW/2,128);g.fillStyle="#fff";g.fillText(C.msg,VW/2,128)}
  /* indicatore di tiro */const p=C.ctl;if(p&&p.st==="shoot"&&p.user){const X=sx(p.x)+30,Y=sy(p.y)-100,apex=10.5/G,u=clamp(p.jt/.62,0,1);g.fillStyle="rgba(0,0,0,.6)";g.fillRect(X,Y,12,70);
    const ga=apex/.62;g.fillStyle="#22c55e";g.fillRect(X,Y+70*(1-ga)-5,12,10);g.fillStyle=p.released?(p.rel==="PERFETTO"?"#22c55e":"#facc15"):"#fff";g.fillRect(X,Y+70*(1-u),12,3)}
  if(p&&p.rel&&p.relT===undefined)p.relT=C.t;if(p&&p.rel&&C.t-p.relT<1.1){g.textAlign="center";g.font="bold 16px system-ui";g.fillStyle=p.rel==="PERFETTO"?"#22c55e":"#facc15";g.fillText(p.rel,sx(p.x),sy(p.y)-108)}else if(p&&p.rel&&C.t-p.relT>=1.1){p.rel=null;p.relT=undefined}
  /* comandi */if(!cfg.auto){const off=C.ball.h&&C.ball.h.team===0;const B2=BTN(),lab=off?{a:"TIRO",b:"PASSA",c:"PALLEGGIO"}:{a:"SALTO",b:"RUBA",c:"CAMBIA"};
  for(const k in B2){const b=B2[k],on=!!IN.btn[k];g.fillStyle=on?"rgba(249,115,22,.6)":"rgba(15,18,32,.22)";g.strokeStyle="rgba(255,255,255,.4)";g.lineWidth=2.5;g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill();g.stroke();g.fillStyle="rgba(255,255,255,.75)";g.font=`bold ${k==="a"?16:13}px system-ui,sans-serif`;g.textAlign="center";g.fillText(lab[k],b.x,b.y+5)}
  /* (786) JOYSTICK sempre visibile: base fissa in basso; si può toccare ovunque nella metà dello schermo e la base si sposta sotto il dito */
  {const hx=cfg.left?VW-125:125,hy=420,s=IN.stick,ox=s?s.ox:hx,oy=s?s.oy:hy;let kx=ox,ky=oy;if(s){const dx=s.x-s.ox,dy=s.y-s.oy,m=Math.hypot(dx,dy),k=m>62?62/m:1;kx=ox+dx*k;ky=oy+dy*k}
    g.fillStyle="rgba(15,18,32,.2)";g.strokeStyle="rgba(255,255,255,.45)";g.lineWidth=3;g.beginPath();g.arc(ox,oy,70,0,7);g.fill();g.stroke();
    g.strokeStyle="rgba(255,255,255,.25)";g.lineWidth=2;[[0,-1],[0,1],[-1,0],[1,0]].forEach(([a,b])=>{g.beginPath();g.moveTo(ox+a*52-b*8,oy+b*52-a*8);g.lineTo(ox+a*62,oy+b*62);g.lineTo(ox+a*52+b*8,oy+b*52+a*8);g.stroke()});
    const gr=g.createRadialGradient(kx-8,ky-8,4,kx,ky,32);gr.addColorStop(0,"#ffd2a8");gr.addColorStop(1,"#d9560b");g.globalAlpha=s?.75:.5;g.fillStyle=gr;g.beginPath();g.arc(kx,ky,30,0,7);g.fill();g.strokeStyle="rgba(255,255,255,.9)";g.lineWidth=2.5;g.stroke();g.globalAlpha=1;
    if(!s&&C.t<12){g.fillStyle="#fff";g.font="bold 13px system-ui";g.textAlign="center";g.fillText("MUOVITI",ox,oy-80)}}}
  if(C.phase==="ft"&&C.ft){g.fillStyle="#fff";g.font="bold 18px system-ui";g.textAlign="center";g.fillText("Tiri liberi: "+C.ft.p.sur+" ("+C.ft.k+"/"+C.ft.n+")",VW/2,96)}}
function drawPause(g){g.fillStyle="rgba(5,7,15,.82)";g.fillRect(0,0,VW,VH);g.fillStyle="#fff";g.textAlign="center";g.font="bold 34px system-ui";g.fillText("PAUSA",VW/2,110);
  const it=[["Riprendi","r"],["Sonoro: "+(SND.on?"sì":"no"),"s"],["Difficoltà: "+["facile","normale","difficile"][cfg.diff],"d"],["Velocità: "+["lenta","normale","veloce"][[.8,1,1.25].indexOf(cfg.speed)>=0?[.8,1,1.25].indexOf(cfg.speed):1],"v"],["Cambi automatici: "+(cfg.subs?"sì":"no"),"c"],["Statistiche partita","b"],["Esci dalla partita","x"]];
  C.pm=it.map((x,i)=>({k:x[1],x:VW/2-170,y:140+i*54,w:340,h:44}));C.pm.forEach((m,i)=>{g.fillStyle=m.k==="x"?"#b91c1c":m.k==="r"?"#d9560b":"rgba(255,255,255,.12)";g.beginPath();g.roundRect?g.roundRect(m.x,m.y,m.w,m.h,10):g.rect(m.x,m.y,m.w,m.h);g.fill();g.fillStyle="#fff";g.font="bold 18px system-ui";g.fillText(it[i][0],VW/2,m.y+29)});
  g.font="13px system-ui";g.fillStyle="#cbd5e1";g.fillText("Tastiera: frecce/WASD muovi · J tiro/salto · K passa/ruba · L palleggio/cambia · P pausa",VW/2,VH-14);
  if(C.box)drawBox(g)}
function pauseTap(p){if(C.box){C.box=false;return}const m=(C.pm||[]).find(m=>p.x>=m.x&&p.x<=m.x+m.w&&p.y>=m.y&&p.y<=m.y+m.h);if(!m)return;
  if(m.k==="r")C.paused=false;else if(m.k==="s"){SND.on=!SND.on;if(SND.on&&!SND.ctx)sndInit(true,cfg.crowd);if(SND.cg)SND.cg.gain.value=SND.on?SND.cbase:0;cfg.sound=SND.on}
  else if(m.k==="d")cfg.diff=(cfg.diff+1)%3;else if(m.k==="v"){const L2=[.8,1,1.25];cfg.speed=L2[(L2.indexOf(cfg.speed)+1)%3]}else if(m.k==="c")cfg.subs=!cfg.subs;else if(m.k==="b")C.box=true;else if(m.k==="x")close();
  savePref(cfg)}
function drawBox(g){g.fillStyle="rgba(5,7,15,.96)";g.fillRect(0,0,VW,VH);g.textAlign="left";
  C.T.forEach((T,t)=>{const x0=20+t*470;g.fillStyle=T.col.bg;g.fillRect(x0,18,450,30);g.fillStyle=T.col.alt;g.font="bold 16px system-ui";g.fillText(T.nick.toUpperCase()+"  "+C.score[t],x0+10,39);
    g.font="bold 11px system-ui";g.fillStyle="#94a3b8";["GIOCATORE","PT","RB","AS","ST","SB","TIRI","3P"].forEach((h,i)=>g.fillText(h,x0+[8,170,205,240,275,310,345,400][i],66));
    T.all.filter(p=>p.s.min>0||T.on.includes(p)).sort((a,b)=>b.s.pts-a.s.pts).slice(0,11).forEach((p,i)=>{const y=86+i*20;g.fillStyle=T.on.includes(p)?"#fff":"#cbd5e1";g.font="12px system-ui";
      g.fillText(p.sur,x0+8,y);[p.s.pts,p.s.reb,p.s.ast,p.s.stl,p.s.blk,p.s.fgm+"/"+p.s.fga,p.s.tpm+"/"+p.s.tpa].forEach((v,j)=>g.fillText(String(v),x0+[170,205,240,275,310,345,400][j],y))})});
  g.textAlign="center";g.fillStyle="#cbd5e1";g.font="13px system-ui";g.fillText("tocca per chiudere",VW/2,VH-12)}
function drawEnd(g){drawBox(g);const w=C.score[0]>C.score[1]?0:1;g.fillStyle="rgba(5,7,15,.9)";g.fillRect(VW/2-230,VH-150,460,120);g.textAlign="center";g.fillStyle="#facc15";g.font="bold 24px system-ui";
  g.fillText("VINCONO I "+C.T[w].nick.toUpperCase()+"  "+C.score[w]+"–"+C.score[1-w],VW/2,VH-118);const mvp=C.T[w].all.slice().sort((a,b)=>(b.s.pts+b.s.reb+b.s.ast)-(a.s.pts+a.s.reb+a.s.ast))[0];
  g.fillStyle="#fff";g.font="14px system-ui";g.fillText("MVP: "+mvp.n+" · "+mvp.s.pts+" pt, "+mvp.s.reb+" rb, "+mvp.s.ast+" as",VW/2,VH-94);
  C.eb=[{k:"again",x:VW/2-210,y:VH-80,w:200,h:40},{k:"exit",x:VW/2+10,y:VH-80,w:200,h:40}];C.eb.forEach(b=>{g.fillStyle=b.k==="again"?"#d9560b":"#334155";g.beginPath();g.roundRect?g.roundRect(b.x,b.y,b.w,b.h,10):g.rect(b.x,b.y,b.w,b.h);g.fill();g.fillStyle="#fff";g.font="bold 16px system-ui";g.fillText(b.k==="again"?"Rivincita":"Esci",b.x+b.w/2,b.y+26)})}
function endTap(p){const b=(C.eb||[]).find(b=>p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h);if(!b)return;if(b.k==="exit")close();else{newGame(cfg)}}
function draw(){const g=ctx;g.save();g.setTransform(1,0,0,1,0,0);g.fillStyle="#000";g.fillRect(0,0,cv.width,cv.height);
  const k=Math.min(cv.width/VW,cv.height/VH);g.translate((cv.width-VW*k)/2,(cv.height-VH*k)/2);g.scale(k,k);g.beginPath();g.rect(0,0,VW,VH);g.clip();
  if(C.shake>0){g.translate(rnd(-4,4)*C.shake*2,rnd(-3,3)*C.shake*2);C.shake-=1/60}
  if(!BUF){BUF=document.createElement("canvas");BUF.width=BW;BUF.height=BH;bctx=BUF.getContext("2d")}const b=bctx;b.imageSmoothingEnabled=false;C._lab=[];
  drawArena(b);drawHoop(b,RIMS[0],false);drawHoop(b,RIMS[1],false);
  const items=allOn().map(p=>({y:p.y,d:()=>drawPlayer(b,p)}));items.push({y:C.ball.y+.3,d:()=>drawBall(b)});items.sort((a,c)=>a.y-c.y);
  items.forEach(it=>it.d());drawHoop(b,RIMS[0],true);drawHoop(b,RIMS[1],true);if(C.ball.st==="shot"||C.ball.st==="net")drawBall(b);
  g.imageSmoothingEnabled=false;g.drawImage(BUF,0,0,VW,VH);g.imageSmoothingEnabled=true;drawScore(g);
  drawHUD(g);if(C.paused)drawPause(g);if(C.over)drawEnd(g);
  if(innerHeight>innerWidth){g.fillStyle="rgba(0,0,0,.6)";g.fillRect(0,VH-40,VW,40);g.fillStyle="#fff";g.font="bold 15px system-ui";g.textAlign="center";g.fillText("⟳ Gira il telefono in orizzontale per giocare meglio",VW/2,VH-15)}
  g.restore()}
function loop(t){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;acc+=dt;let n=0;while(acc>=1/60&&n<4){update(1/60);acc-=1/60;n++}draw()}
function resize(){const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);cv.style.width=innerWidth+"px";cv.style.height=innerHeight+"px"}
function open(c){c={...pref(),...(c||{})};savePref(c);ov=document.createElement("div");ov.id="hoopov";ov.style.cssText="position:fixed;inset:0;z-index:99999;background:#000;touch-action:none;-webkit-user-select:none;user-select:none";
  cv=document.createElement("canvas");cv.style.touchAction="none";ov.appendChild(cv);document.body.appendChild(ov);ctx=cv.getContext("2d");resize();window.addEventListener("resize",resize);
  try{ov.requestFullscreen&&ov.requestFullscreen().then(()=>{try{screen.orientation.lock("landscape").catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}
  sndInit(c.sound,c.crowd);newGame(c);bindInput();last=performance.now();raf=requestAnimationFrame(loop)}
function close(){cancelAnimationFrame(raf);sndStop();window.removeEventListener("resize",resize);window.removeEventListener("keydown",kd);window.removeEventListener("keyup",ku);try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}if(ov)ov.remove();ov=null;C=null;
  try{if(window.HOOP.onclose)window.HOOP.onclose()}catch(e){}}
window.HOOP={open,close,pref,savePref,get state(){return C},_update:update,_draw:()=>draw(),teams:mkTeam};
})();
