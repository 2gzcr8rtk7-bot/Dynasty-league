/* (927) MODALITÀ DREAM — lo stadio 3D di ogni squadra.
   Si apre dal tasto viola «D» accanto al campo (pagina squadra). Palazzetto con i colori e il logo della squadra, striscioni dei trofei,
   maxischermo con lo scontro diretto Dreamers del turno; le maglie dei giocatori che giocano stanotte fluttuano sul parquet con le
   statistiche live, e ogni azione nuova (punti, rimbalzo, assist, stoppata, recupero, palla persa, tiro sbagliato) compare accanto alla maglia
   con il suo suono. Audio dei tifosi sintetizzato (niente file da scaricare).
   LEGGEREZZA (lezione della sala trofei): motore Three.js caricato solo qui (vendor/three.min.js), risoluzione limitata, niente ombre,
   poche luci, pubblico e sedili in un'unica istanza, disegno solo quando serve (movimento, animazioni, dati nuovi), tutto liberato all'uscita. */
(function(){
"use strict";
let ST=null;/* stato della sessione aperta */
const $=(h)=>{const d=document.createElement("div");d.innerHTML=h;return d.firstElementChild};
function loadThree(){return new Promise((res,rej)=>{if(window.THREE)return res(window.THREE);const s=document.createElement("script");s.src="vendor/three.min.js";s.onload=()=>res(window.THREE);s.onerror=rej;document.head.appendChild(s)})}
const img=src=>new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
function rr(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
const fmt=v=>v==null?"—":(typeof pdkF==="function"?pdkF(v):String(Math.round(v*10)/10).replace(".",","));
const PK={r:["#ef4444","#fff"],y:["#f5b400","#111"],g:["#22c55e","#06240f"],v:["#8b5cf6","#fff"],na:["#334155","#cbd5e1"]};

/* ---------------- AUDIO (Web Audio, tutto sintetizzato) ---------------- */
function audioInit(){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;const ac=new A(),master=ac.createGain();master.gain.value=1;master.connect(ac.destination);
  const len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);let b=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b=(b+.02*w)/1.02;d[i]=b*3.2}/* rumore marrone = brusio */
  const wb=ac.createBuffer(1,len,ac.sampleRate),wd=wb.getChannelData(0);for(let i=0;i<len;i++)wd[i]=Math.random()*2-1;/* rumore bianco = applausi/boato */
  /* brusio continuo del pubblico, con onde lente */
  const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=700;const bp=ac.createBiquadFilter();bp.type="peaking";bp.frequency.value=450;bp.gain.value=6;
  const g=ac.createGain();g.gain.value=.16;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.13;lg.gain.value=.05;lfo.connect(lg);lg.connect(g.gain);
  src.connect(lp);lp.connect(bp);bp.connect(g);g.connect(master);src.start();lfo.start();
  const noise=(t0,dur,f,q,peak,att)=>{const s=ac.createBufferSource();s.buffer=wb;const f1=ac.createBiquadFilter();f1.type="bandpass";f1.frequency.value=f;f1.Q.value=q;const gg=ac.createGain();gg.gain.setValueAtTime(0,t0);gg.gain.linearRampToValueAtTime(peak,t0+(att||.06));gg.gain.exponentialRampToValueAtTime(.001,t0+dur);s.connect(f1);f1.connect(gg);gg.connect(master);s.start(t0,Math.random()*1.5);s.stop(t0+dur+.05)};
  const tone=(t0,f,dur,type,peak,f2)=>{const o=ac.createOscillator();o.type=type||"triangle";o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);const gg=ac.createGain();gg.gain.setValueAtTime(0,t0);gg.gain.linearRampToValueAtTime(peak,t0+.015);gg.gain.exponentialRampToValueAtTime(.001,t0+dur);o.connect(gg);gg.connect(master);o.start(t0);o.stop(t0+dur+.05)};
  /* coro «DE-FENSE! DE-FENSE!» come all'NBA: tante voci (dente di sega a altezze diverse) filtrate sulle vocali «i» ed «e», la «s» finale e due battiti di mani */
  const syl=(t0,dur,F,peak)=>{const out=ac.createGain();out.gain.setValueAtTime(0,t0);out.gain.linearRampToValueAtTime(peak,t0+.04);out.gain.setValueAtTime(peak,t0+dur*.7);out.gain.exponentialRampToValueAtTime(.001,t0+dur);
    const f1=ac.createBiquadFilter();f1.type="bandpass";f1.frequency.value=F[0];f1.Q.value=5;const f2=ac.createBiquadFilter();f2.type="bandpass";f2.frequency.value=F[1];f2.Q.value=7;const m=ac.createGain();m.gain.value=.5;
    f1.connect(out);f2.connect(m);m.connect(out);out.connect(master);
    for(let i=0;i<14;i++){const o=ac.createOscillator();o.type="sawtooth";o.frequency.value=(i<7?105:190)*(1+(Math.random()-.5)*.12);const g=ac.createGain();g.gain.value=.06;o.connect(g);g.connect(f1);g.connect(f2);o.start(t0+Math.random()*.03);o.stop(t0+dur+.05)}};
  const chant=(n)=>{let t=ac.currentTime+.05;for(let i=0;i<(n||4);i++){syl(t,.26,[400,2100],.55);syl(t+.33,.42,[560,1750],.6);noise(t+.66,.16,5200,1.2,.18,.02);noise(t+.86,.09,1600,.8,.5,.005);noise(t+1.02,.09,1600,.8,.5,.005);t+=1.25}};
  return{ac,master,play(k,big){const t=ac.currentTime+.02;
    if(k==="pt"){tone(t,880,.18,"triangle",.22);tone(t+.09,1318,.32,"triangle",.2);noise(t,big?2.6:1.8,1300,.6,big?.55:.38,.08);noise(t+.05,big?2.2:1.4,2600,.9,big?.25:.15,.1)}
    else if(k==="ft"){tone(t,1046,.2,"sine",.16);noise(t,1.1,1200,.7,.18)}
    else if(k==="reb"||k==="ast"){tone(t,k==="reb"?587:784,.16,"sine",.2);tone(t+.07,k==="reb"?784:1046,.22,"sine",.16);noise(t,.9,1100,.7,.12)}
    else if(k==="blk"||k==="stl"){tone(t,180,.2,"sine",.35,90);noise(t,1.4,1000,.6,.32,.04)}
    else if(k==="miss"){tone(t,330,.5,"sine",.12,220);noise(t,1.2,500,.8,.16,.2)}
    else if(k==="def"){chant(big||4)}
    else if(k==="tov"){tone(t,262,.35,"square",.05,196);noise(t,.8,450,.8,.1,.15)}}}}

/* ---------------- SCENA ---------------- */
async function build(t,cv,T3){const THREE=T3,TM=TEAMS[t];
  const C=s=>new THREE.Color(s),mix=(a,b,k)=>C(a).lerp(C(b),k),lum=h=>{const c=C(h);return .2126*c.r+.7152*c.g+.0722*c.b};
  /* (937) giallo Ducks più caldo (quello dorato del logo e del banner): la luce 3D schiarisce i gialli, quindi si parte da un oro più carico *//* (955) giallo parquet Ducks più caldo, scelto da Francesco (versione B) */const BG=({DUC:"#ea9a00"})[t]||TM.bg,ACC=lum(BG)<.18?(TM.fg===TM.bg?"#ffffff":TM.fg):BG,INK=lum(BG)>.55?(lum(TM.trim)<.4?TM.trim:"#111"):"#ffffff";
  const mob=Math.min(screen.width,screen.height)<700;
  /* (932) qualità alta: antialias sempre, risoluzione fino a 2× (si abbassa da sola se il telefono fatica, vedi il ciclo) */
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:"high-performance"});R.setPixelRatio(Math.min(2,devicePixelRatio||1));const ANI=R.capabilities.getMaxAnisotropy();R.setSize(innerWidth,innerHeight,false);
  R.toneMapping=THREE.ACESFilmicToneMapping;/* (940) LOOK = luce e atmosfera (prove di colori caldi stile NBA) */const LK=Object.assign({exp:1.02,bg:"#060509",fog:0x08070c,hue:30,sat:50,lig:48,sky:0xfff1df,gnd:null,hemi:1.0,dir:0xffe6c4,dirI:.5,spot:0xfff2dc,spotI:250,lamp:"#fff4dc",roof:"#3b3a44",roofK:.86,warm:0},window.DREAM_LOOK||{});
  R.toneMappingExposure=LK.exp;R.outputColorSpace=THREE.SRGBColorSpace;
  const S=new THREE.Scene();S.background=C(LK.bg);S.fog=new THREE.FogExp2(LK.fog,.010);
  const cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,220);
  const TX=[],own=o=>{TX.push(o);return o};
  const tex=(w,h,f,q)=>{q=q||1;const c=document.createElement("canvas");c.width=w*q;c.height=h*q;const g=c.getContext("2d");g.scale(q,q);f(g,w,h);const x=new THREE.CanvasTexture(c);x.colorSpace=THREE.SRGBColorSpace;x.anisotropy=ANI;x.minFilter=THREE.LinearMipmapLinearFilter;x.generateMipmaps=true;own(x);x.userData.c=c;x.userData.q=q;return x};
  const LG=await img((t==="DUC"&&typeof ducBan==="function"&&(ducBan()||window.DUC_CURL))||LOGO[t]);
  let GLW=null;const K_GLOW=()=>GLW||(GLW=tex(256,256,(x,W,H)=>{const g=x.createRadialGradient(W/2,H/2,8,W/2,H/2,W/2);g.addColorStop(0,"rgba(196,140,255,.9)");g.addColorStop(.45,"rgba(139,92,246,.45)");g.addColorStop(1,"rgba(139,92,246,0)");x.fillStyle=g;x.fillRect(0,0,W,H)}));
  const CW=28,CH=15,RA=5.6/* (930) bordo campo più largo: ci si allontana dai giocatori */;
  const rrPath=(rx,rz,cr,step)=>{const out=[],segs=[["l",-rx+cr,-rz,rx-cr,-rz],["c",rx-cr,-rz+cr,-Math.PI/2,0],["l",rx,-rz+cr,rx,rz-cr],["c",rx-cr,rz-cr,0,Math.PI/2],["l",rx-cr,rz,-rx+cr,rz],["c",-rx+cr,rz-cr,Math.PI/2,Math.PI],["l",-rx,rz-cr,-rx,-rz+cr],["c",-rx+cr,-rz+cr,Math.PI,Math.PI*1.5]];
    for(const s of segs){const len=s[0]==="l"?Math.hypot(s[3]-s[1],s[4]-s[2]):Math.PI*cr/2,n=Math.max(1,Math.round(len/step));for(let i=0;i<n;i++){const k=i/n;if(s[0]==="l")out.push([s[1]+(s[3]-s[1])*k,s[2]+(s[4]-s[2])*k]);else{const a=s[3]+(s[4]-s[3])*k;out.push([s[1]+Math.cos(a)*cr,s[2]+Math.sin(a)*cr])}}}return out};
  /* parquet */
  const court=tex(3072,1646,(x,W,H)=>{const ph=Math.round(H/75);
    /* (946) parquet di qualità: listelli con tono proprio, venature, nodi, fughe sottili e vernice */
    for(let y=0;y<H;y+=ph){const off=((y/ph)%5)*W*.062;for(let xx=-off;xx<W;xx+=W*.25){const hh=LK.hue+Math.random()*7,ss=LK.sat+Math.random()*12,ll=LK.lig+Math.random()*9;const gr=x.createLinearGradient(0,y,0,y+ph);gr.addColorStop(0,`hsl(${hh},${ss}%,${ll+3}%)`);gr.addColorStop(1,`hsl(${hh},${ss}%,${ll-3}%)`);x.fillStyle=gr;x.fillRect(xx,y,W*.25,ph);
        for(let k=0;k<5;k++){x.strokeStyle=`hsla(${hh-4},${ss+8}%,${ll-14}%,${.08+Math.random()*.1})`;x.lineWidth=.8+Math.random();x.beginPath();const yy=y+Math.random()*ph;x.moveTo(xx,yy);for(let q=1;q<=6;q++)x.lineTo(xx+q*W*.25/6,yy+(Math.random()-.5)*ph*.25);x.stroke()}
        if(Math.random()<.18){x.fillStyle=`hsla(${hh-6},${ss}%,${ll-18}%,.35)`;x.beginPath();x.ellipse(xx+Math.random()*W*.25,y+ph/2,ph*.35,ph*.2,0,0,7);x.fill()}
        x.fillStyle="rgba(50,25,8,.35)";x.fillRect(xx,y,1.6,ph)}x.fillStyle="rgba(55,28,8,.28)";x.fillRect(0,y,W,1)}
    const sc=W/28,L=m=>m*sc,cx=W/2,cy=H/2;
    x.fillStyle=BG;x.globalAlpha=.95;[0,1].forEach(s=>x.fillRect(s?W-L(5.8):0,cy-L(2.45),L(5.8),L(4.9)));x.beginPath();x.arc(cx,cy,L(1.8),0,7);x.fill();x.globalAlpha=1;x.fillRect(0,0,W,L(.5));x.fillRect(0,H-L(.5),W,L(.5));
    x.strokeStyle="#fff";x.lineWidth=L(.055);x.strokeRect(L(.05),L(.55),W-L(.1),H-L(1.1));x.beginPath();x.moveTo(cx,L(.55));x.lineTo(cx,H-L(.55));x.stroke();x.beginPath();x.arc(cx,cy,L(1.8),0,7);x.stroke();
    [0,1].forEach(s=>{const bx=s?W-L(1.575):L(1.575),dir=s?-1:1;x.strokeRect(s?W-L(5.8):L(.05),cy-L(2.45),L(5.75),L(4.9));x.beginPath();x.arc(s?W-L(5.8):L(5.8),cy,L(1.8),0,7);x.stroke();
      x.beginPath();x.moveTo(s?W:0,cy-L(6.6));x.lineTo(bx+dir*L(1.4),cy-L(6.6));x.arc(bx,cy,L(6.75),s?Math.PI+1.35:-1.35,s?Math.PI-1.35:1.35,!!s);x.lineTo(s?W:0,cy+L(6.6));x.stroke()});
    x.fillStyle=INK;x.font=`italic 900 ${L(.9)}px Arial Black,Arial`;x.textAlign="center";x.textBaseline="middle";[0,1].forEach(s=>{x.save();x.translate(s?W-L(.9):L(.9),cy);x.rotate(s?-Math.PI/2:Math.PI/2);x.fillText(TM.nick.toUpperCase(),0,0);x.restore()});
    x.fillStyle=lum(BG)>.55?INK:"#fff";x.font=`800 ${L(.3)}px Arial`;x.fillText("DREAMERS LEAGUE",cx,L(.27));x.fillText(TM.name.toUpperCase(),cx,H-L(.27));
    /* (955) logo a centrocampo +16% */const lg=L(3.5*1.16);if(LG){x.save();x.shadowColor="rgba(0,0,0,.55)";x.shadowBlur=L(.18);x.shadowOffsetY=L(.05);x.drawImage(LG,cx-lg/2,cy-lg/2,lg,lg);x.restore()}
    /* vernice: riflesso morbido lungo il campo e bordi più scuri */const g=x.createRadialGradient(cx,cy,10,cx,cy,W*.62);g.addColorStop(0,"rgba(255,248,232,.06)");g.addColorStop(1,"rgba(0,0,0,.2)");x.fillStyle=g;x.fillRect(0,0,W,H);
    const g2=x.createLinearGradient(0,0,0,H);g2.addColorStop(0,"rgba(255,255,255,.05)");g2.addColorStop(.5,"rgba(255,255,255,0)");g2.addColorStop(1,"rgba(255,255,255,.04)");x.fillStyle=g2;x.fillRect(0,0,W,H)});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(CW+2*RA+8,CH+2*RA+8),new THREE.MeshStandardMaterial({color:mix(BG,"#000",.18),roughness:.45}));/* (930) bordo campo nel colore della squadra */floor.rotation.x=-Math.PI/2;S.add(floor);
  const ct=new THREE.Mesh(new THREE.PlaneGeometry(CW,CH),new THREE.MeshLambertMaterial({map:court})/* (941) parquet opaco: niente riflessi che coprono legno e logo */);ct.rotation.x=-Math.PI/2;ct.position.y=.01;S.add(ct);
  /* canestri */
  const steel=new THREE.MeshLambertMaterial({color:"#22222a"});
  [-1,1].forEach(s=>{const g=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.1,1.7),new THREE.MeshLambertMaterial({color:BG}));base.position.y=.55;g.add(base);
    const pad=new THREE.Mesh(new THREE.BoxGeometry(.2,3,.3),steel);pad.position.set(-s*.2,2.6,0);pad.rotation.z=s*.25;g.add(pad);const arm=new THREE.Mesh(new THREE.BoxGeometry(1.5,.16,.16),steel);arm.position.set(-s*.95,3.95,0);g.add(arm);
    const glass=new THREE.Mesh(new THREE.BoxGeometry(.05,1.05,1.8),new THREE.MeshBasicMaterial({color:"#dfefff",transparent:true,opacity:.22}));glass.position.set(-s*1.65,3.55,0);g.add(glass);
    const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.06,1.05,1.8)),new THREE.LineBasicMaterial({color:"#ffffff"}));edge.position.copy(glass.position);g.add(edge);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.23,.022,8,24),new THREE.MeshBasicMaterial({color:"#ff5a1f"}));rim.rotation.x=Math.PI/2;rim.position.set(-s*1.9,3.05,0);g.add(rim);
    const net=new THREE.Mesh(new THREE.CylinderGeometry(.23,.13,.42,12,2,true),new THREE.MeshBasicMaterial({color:"#ffffff",wireframe:true,transparent:true,opacity:.7}));net.position.set(-s*1.9,2.83,0);g.add(net);
    g.position.set(s*(CW/2+.35),0,0);S.add(g)});
  /* fascia LED (anche sul tavolo) */
  const ribbon=()=>{const x=tex(2048,64,(c,W,H)=>{c.fillStyle="#030305";c.fillRect(0,0,W,H);c.font="italic 900 40px Arial Black,Arial";c.textBaseline="middle";let xx=14,k=0;while(xx<W){const s=k%3===2?"★":k%3?"DREAMERS LEAGUE":TM.name.toUpperCase();c.fillStyle=k%3===1?"#ffffff":ACC;c.fillText(s,xx,H/2+2);xx+=c.measureText(s).width+50;k++}});x.wrapS=THREE.RepeatWrapping;return x};
  /* (936) tavolo nero a bordo campo tolto (Francesco) */
  /* tribune */
  /* (931) gradoni definiti: pedata chiara che richiama il colore squadra (alternata riga per riga), alzata scura con riflesso del colore */
  const STEPLED=new THREE.LineBasicMaterial({color:"#ffd9a0",toneMapped:false,transparent:true,opacity:.75});/* (946) filo di luce sul bordo di ogni gradone */const tread=[new THREE.MeshLambertMaterial({color:mix(BG,LK.tr1||"#4a4852",.78)}),new THREE.MeshLambertMaterial({color:mix(BG,LK.tr2||"#3c3a44",.8)})],riser=new THREE.MeshLambertMaterial({color:mix(BG,"#16151b",.72),emissive:mix(BG,"#000",.55),emissiveIntensity:.25});let bandK=0;
  const WALK=[],BOWLS=[];const seatP=[],seatC=[],fanP=[],fanC=[],headC=[];
  const shirts=["#20202a","#2e2e38","#e9e4da","#d6d3cc","#44444e",ACC,"#3a2a22","#5b1d1d","#1d2f5b","#6b6b75"],skins=["#f1c7a4","#d9a57f","#a8714f","#6e4630","#3f2a1e"];
  const band=(rx,rz,cr,y,h,o)=>{const sh=new THREE.Shape(),X=rx+o,Z=rz+o,c1=cr+o;sh.moveTo(-X+c1,-Z);sh.lineTo(X-c1,-Z);sh.quadraticCurveTo(X,-Z,X,-Z+c1);sh.lineTo(X,Z-c1);sh.quadraticCurveTo(X,Z,X-c1,Z);sh.lineTo(-X+c1,Z);sh.quadraticCurveTo(-X,Z,-X,Z-c1);sh.lineTo(-X,-Z+c1);sh.quadraticCurveTo(-X,-Z,-X+c1,-Z);
    const ho=new THREE.Path();ho.moveTo(-rx+cr,-rz);ho.lineTo(rx-cr,-rz);ho.quadraticCurveTo(rx,-rz,rx,-rz+cr);ho.lineTo(rx,rz-cr);ho.quadraticCurveTo(rx,rz,rx-cr,rz);ho.lineTo(-rx+cr,rz);ho.quadraticCurveTo(-rx,rz,-rx,rz-cr);ho.lineTo(-rx,-rz+cr);ho.quadraticCurveTo(-rx,-rz,-rx+cr,-rz);sh.holes.push(ho);
    const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:mob?6:10}),[tread[(bandK++)%2],riser]);m.rotation.x=-Math.PI/2;m.position.y=y-h;S.add(m);WALK.push(m)};
  const bowl=(r0,rows,y0,dy,dr,occ,step)=>{BOWLS.push({r0,rows,y0,dy,dr});for(let r=0;r<rows;r++){const rx=CW/2+r0+r*dr,rz=CH/2+r0+r*dr,cr=3.5+r*dr,y=y0+r*dy;band(rx,rz,cr,y,y,dr);{const pts=rrPath(rx,rz,cr,.8).map(([px,pz])=>new THREE.Vector3(px,y+.015,pz));pts.push(pts[0].clone());S.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),STEPLED))}
    rrPath(rx+dr*.55,rz+dr*.55,cr+dr*.55,step).forEach(([px,pz])=>{if(pz>CH/2&&Math.abs(px)<1.2)return;if(inP(px,pz))return;const a=Math.atan2(-px,-pz),sec=Math.floor((Math.atan2(pz,px)+Math.PI)/(Math.PI/6))%3===0;
      seatP.push([px,y+.22,pz,a]);seatC.push(sec?mix(BG,"#000",.12).getStyle():mix(BG,"#3a3944",.75).getStyle());if(Math.random()<occ){fanP.push([px,y+.62,pz,a]);fanC.push(Math.random()<.18?BG:shirts[(Math.random()*shirts.length)|0]);headC.push(skins[(Math.random()*skins.length)|0])}})}};
  /* (957) SALA TROFEI: corridoio nell'angolo tra le tribune (lato lontano, a destra): portale con scritta luminosa; dentro si passa nella sala */
  const PC={x:CW/2-3.5,z:-(CH/2-3.5),ux:Math.SQRT1_2,uz:-Math.SQRT1_2,W:3.8,H:3.4,D:6.3,DW:2.2,DH:2.6};
  const pLoc=(px,pz)=>{const rx=px-PC.x,rz=pz-PC.z;return{a:rx*PC.ux+rz*PC.uz-3.5,l:rx*PC.ux-rz*PC.uz}};
  const inP=(px,pz)=>{const q=pLoc(px,pz);return q.a>RA-1.2&&q.a<RA-.3+PC.D+.25&&Math.abs(q.l)<PC.W/2+.3};
  const DOOR=[];{const g=new THREE.Group(),a0=3.5+RA-.3;g.position.set(PC.x+PC.ux*a0,0,PC.z+PC.uz*a0);g.rotation.y=-Math.PI/4;S.add(g);
    const shellT=tex(512,512,(x,W,H)=>{const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#25222c");gr.addColorStop(1,"#121016");x.fillStyle=gr;x.fillRect(0,0,W,H);for(let i=0;i<W;i+=64){x.fillStyle="rgba(255,255,255,.05)";x.fillRect(i,0,3,H)}});
    const shM=new THREE.MeshLambertMaterial({map:shellT,side:THREE.DoubleSide});
    const fs=new THREE.Shape();fs.moveTo(-PC.W/2,0);fs.lineTo(PC.W/2,0);fs.lineTo(PC.W/2,PC.H);fs.lineTo(-PC.W/2,PC.H);fs.closePath();const dh=new THREE.Path();dh.moveTo(-PC.DW/2,0);dh.lineTo(-PC.DW/2,PC.DH);dh.lineTo(PC.DW/2,PC.DH);dh.lineTo(PC.DW/2,0);dh.closePath();fs.holes.push(dh);
    const fac=new THREE.Mesh(new THREE.ShapeGeometry(fs),shM);g.add(fac);
    [-1,1].forEach(sg=>{const sd=new THREE.Mesh(new THREE.PlaneGeometry(PC.D,PC.H),shM);sd.rotation.y=Math.PI/2;sd.position.set(sg*PC.W/2,PC.H/2,-PC.D/2);g.add(sd);
      const iw=new THREE.Mesh(new THREE.PlaneGeometry(.3,PC.DH),shM);iw.rotation.y=Math.PI/2;iw.position.set(sg*PC.DW/2,PC.DH/2,-.14);g.add(iw)});
    const top=new THREE.Mesh(new THREE.BoxGeometry(PC.W,.12,PC.D),new THREE.MeshLambertMaterial({color:mix(BG,"#2a2833",.8)}));top.position.set(0,PC.H-.06,-PC.D/2);g.add(top);WALK.push(top);
    const lin=new THREE.Mesh(new THREE.PlaneGeometry(PC.DW,.3),shM);lin.rotation.x=Math.PI/2;lin.position.set(0,PC.DH,-.14);g.add(lin);
    /* dentro la porta: il corridoio illuminato che porta alla sala */
    const dT=tex(440,520,(x,W,H)=>{x.fillStyle="#0b0a0e";x.fillRect(0,0,W,H);const vx=W/2,vy=H*.47,ew=W*.2,eh=H*.3;const P=(a,b,c,d,f)=>{x.fillStyle=f;x.beginPath();x.moveTo(...a);x.lineTo(...b);x.lineTo(...c);x.lineTo(...d);x.closePath();x.fill()};
      P([0,0],[W,0],[vx+ew/2,vy-eh/2],[vx-ew/2,vy-eh/2],"#17151c");P([0,H],[W,H],[vx+ew/2,vy+eh/2],[vx-ew/2,vy+eh/2],"#1d1a22");P([0,0],[vx-ew/2,vy-eh/2],[vx-ew/2,vy+eh/2],[0,H],"#211e27");P([W,0],[vx+ew/2,vy-eh/2],[vx+ew/2,vy+eh/2],[W,H],"#211e27");
      const end=x.createRadialGradient(vx,vy,4,vx,vy,ew*1.4);end.addColorStop(0,"#fff4cf");end.addColorStop(.35,ACC);end.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=end;x.fillRect(vx-ew*1.5,vy-eh,ew*3,eh*2);
      x.strokeStyle=ACC;x.lineWidth=5;[[0,H*.06],[0,H*.94]].forEach(([a,b])=>{x.beginPath();x.moveTo(0,b);x.lineTo(vx-ew/2,vy+(b<H/2?-eh/2:eh/2));x.stroke();x.beginPath();x.moveTo(W,b);x.lineTo(vx+ew/2,vy+(b<H/2?-eh/2:eh/2));x.stroke()});
      x.fillStyle=ACC;x.globalAlpha=.8;x.beginPath();x.moveTo(W/2-10,H);x.lineTo(W/2+10,H);x.lineTo(vx+2,vy+eh/2);x.lineTo(vx-2,vy+eh/2);x.fill();x.globalAlpha=1});
    const door=new THREE.Mesh(new THREE.PlaneGeometry(PC.DW,PC.DH),new THREE.MeshBasicMaterial({map:dT,toneMapped:false}));door.position.set(0,PC.DH/2,-.28);g.add(door);DOOR.push(door);
    /* cornice LED e insegna */
    const led=new THREE.MeshBasicMaterial({color:ACC,toneMapped:false});[[0,PC.DH+.05,PC.DW+.2,.08],[-PC.DW/2-.06,PC.DH/2,.08,PC.DH],[PC.DW/2+.06,PC.DH/2,.08,PC.DH]].forEach(([x,y,w,h])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.06),led);b.position.set(x,y,.03);g.add(b)});
    const sT=tex(1024,190,(x,W,H)=>{x.fillStyle="#0c0a10";x.fillRect(0,0,W,H);x.strokeStyle=ACC;x.lineWidth=8;x.strokeRect(6,6,W-12,H-12);x.textAlign="center";x.textBaseline="middle";x.fillStyle=ACC;x.font="italic 900 92px Arial Black,Arial";x.fillText("SALA TROFEI",W/2,H*.42);x.font="800 34px Arial";x.fillStyle="#fff";x.fillText(TM.nick.toUpperCase()+" · HALL OF FAME",W/2,H*.8)},2);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(PC.W-.3,(PC.W-.3)*190/1024),new THREE.MeshBasicMaterial({map:sT,toneMapped:false}));sg.position.set(0,PC.DH+.08+(PC.W-.3)*95/1024+.05,.03);g.add(sg);DOOR.push(sg);
    const pool=new THREE.Mesh(new THREE.PlaneGeometry(4,3),new THREE.MeshBasicMaterial({map:K_GLOW(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.35,toneMapped:false}));pool.rotation.x=-Math.PI/2;pool.position.set(0,.03,1.2);g.add(pool)}
  const stp=mob?.78:.62;bowl(RA,13,.45,.42,.85,.82,stp);const R1=CW/2+RA+13*.85,Y1=.45+13*.42;
  {const pts=rrPath(R1+.2,R1-CW/2+CH/2+.2,3.5+13*.85+.2,.6);pts.push(pts[0]);const g=new THREE.BufferGeometry(),P=[],U=[],I=[];let acc=0;
    pts.forEach((p,i)=>{if(i)acc+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]);P.push(p[0],Y1+1.3,p[1],p[0],Y1+.35,p[1]);U.push(acc/14,1,acc/14,0);const gap=q=>q[1]>0&&Math.abs(q[0])<1.5;/* (950) la fascia si interrompe sulle scale centrali */if(i&&!gap(p)&&!gap(pts[i-1])){const k=i*2;I.push(k-2,k,k-1,k-1,k,k+1)}});
    g.setAttribute("position",new THREE.Float32BufferAttribute(P,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(U,2));g.setIndex(I);S.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:ribbon(),toneMapped:false})));
    /* (935) retro della fascia (visto dall'anello alto): stesso nastro con il testo nel verso giusto */const g2=g.clone(),U2=U.map((u,i)=>i%2===0?-u:u);g.setAttribute("uv",new THREE.Float32BufferAttribute(U2,2));/* faccia esterna: testo raddrizzato */S.add(new THREE.Mesh(g2,new THREE.MeshBasicMaterial({map:ribbon(),toneMapped:false,side:THREE.BackSide})))}
  /* corridoio tra anello basso e alto: si può camminare */band(R1,R1-CW/2+CH/2,3.5+13*.85,Y1,Y1,1.8);bowl(RA+13*.85+1.8,11,Y1+1.6,.55,.8,.7,stp);const R2=CW/2+RA+13*.85+1.8+11*.8,Y2=Y1+1.6+11*.55;
  const M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),one=new THREE.Vector3(1,1,1);
  const inst=(geo,mat,P,Cs,dy)=>{const m=new THREE.InstancedMesh(geo,mat,P.length),orig=[];P.forEach((p,i)=>{e.set(0,p[3],0);q.setFromEuler(e);v.set(p[0],p[1]+(dy||0),p[2]);M.compose(v,q,one);m.setMatrixAt(i,M);orig.push(M.clone());m.setColorAt(i,C(Cs[i]))});m.instanceColor.needsUpdate=true;m.frustumCulled=false;S.add(m);return{m,orig,pos:P}};
  inst(new THREE.BoxGeometry(.48,.14,.44),new THREE.MeshLambertMaterial(),seatP,seatC);/* (931) seduta + schienale */inst(new THREE.BoxGeometry(.48,.5,.07),new THREE.MeshLambertMaterial(),seatP.map(p=>[p[0]-Math.sin(p[3])*.22,p[1]+.22,p[2]-Math.cos(p[3])*.22,p[3]]),seatC);const FANS=[inst(new THREE.CylinderGeometry(.17,.2,.62,6),new THREE.MeshLambertMaterial(),fanP,fanC),inst(new THREE.SphereGeometry(.13,6,4),new THREE.MeshLambertMaterial(),fanP,headC,.43)];
  /* muri, tetto, luci del soffitto */
  const WX=R2+2,WZ=R2-CW/2+CH/2+2;
  const wallT=tex(1024,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,mix(BG,LK.w1||"#2c2a33",.82).getStyle());g.addColorStop(1,mix(BG,LK.w2||"#121117",.85).getStyle());x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<W;i+=64){x.fillStyle="rgba(255,255,255,.05)";x.fillRect(i,0,3,H)}x.fillStyle=mix(BG,"#000",.2).getStyle();x.globalAlpha=.55;x.fillRect(0,H*.62,W,6);x.globalAlpha=1});wallT.wrapS=THREE.RepeatWrapping;wallT.repeat.set(8,1);
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,30,48,1,true),new THREE.MeshLambertMaterial({map:wallT,side:THREE.BackSide}));wall.scale.set(WX*1.08,1,WZ*1.08);wall.position.y=15;S.add(wall);
  /* (931) tetto visibile: pannelli chiari con griglia e leggero colore squadra */
  /* (956) pannelli del tetto viola Dreamers, ognuno con un leggero velo più chiaro al centro */const roofT=tex(1024,1024,(x,W,H)=>{x.fillStyle="#3b1a72";x.fillRect(0,0,W,H);for(let i=0;i<W;i+=64)for(let j=0;j<H;j+=64){const g=x.createRadialGradient(i+32,j+32,2,i+32,j+32,44);g.addColorStop(0,"rgba(168,85,247,.7)");g.addColorStop(1,"rgba(88,28,135,0)");x.fillStyle=g;x.fillRect(i,j,64,64)}for(let i=0;i<=W;i+=64){x.fillStyle="rgba(10,4,20,.6)";x.fillRect(i,0,4,H);x.fillRect(0,i,W,4)}const g=x.createRadialGradient(W/2,H/2,20,W/2,H/2,W*.55);g.addColorStop(0,"rgba(233,213,255,.18)");g.addColorStop(1,"rgba(0,0,0,.35)");x.fillStyle=g;x.fillRect(0,0,W,H)});
  const roof=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshLambertMaterial({map:roofT,side:THREE.DoubleSide,emissive:"#ffffff",emissiveMap:roofT,emissiveIntensity:.35}));roof.scale.set(WX*1.08,WZ*1.08,1);roof.rotation.x=Math.PI/2;roof.position.y=27;S.add(roof);
  const trm=new THREE.MeshLambertMaterial({color:"#8a8996",emissive:"#22212a"});for(let i=-4;i<=4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.7,WZ*2),trm);b.position.set(i*6,25.5,0);S.add(b)}for(let i=-3;i<=3;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(WX*2,.5,.3),trm);b.position.set(0,25,i*6);S.add(b)}
  const lampM=new THREE.MeshBasicMaterial({color:LK.lamp,toneMapped:false});for(let i=-4;i<=4;i++)for(let j=-3;j<=3;j++){if(Math.abs(i)<2&&Math.abs(j)<2)continue;const l=new THREE.Mesh(new THREE.BoxGeometry(.6,.12,.6),lampM);l.position.set(i*6,24.6,j*6);S.add(l)}
  /* (942) LED DREAMERS sulle pareti: montanti verticali viola, anelli luminosi a più altezze, pannelli viola sulle pareti (solo materiali che brillano: nessuna luce in più, leggero) */
  {const V1=new THREE.MeshBasicMaterial({color:"#a855f7",toneMapped:false}),V2=new THREE.MeshBasicMaterial({color:"#e9d5ff",toneMapped:false}),V3=new THREE.MeshBasicMaterial({color:"#7c3aed",toneMapped:false,transparent:true,opacity:.55});
    const ex=WX*1.06,ez=WZ*1.06,N=mob?36:56;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,x=Math.cos(a)*ex,z=Math.sin(a)*ez;
      const bar=new THREE.Mesh(new THREE.BoxGeometry(.18,26-Y2-2,.18),i%2?V1:V2);bar.position.set(x,(Y2+2+26)/2,z);S.add(bar);
      const pan=new THREE.Mesh(new THREE.PlaneGeometry(2*Math.PI*ex/N*.7,26-Y2-3),V3);pan.position.set(Math.cos(a+Math.PI/N)*ex*.997,(Y2+2+26)/2,Math.sin(a+Math.PI/N)*ez*.997);pan.lookAt(0,pan.position.y,0);S.add(pan)}
    [[Y2+2.2,"#c084fc",.09],[Y2+7,"#8b5cf6",.07],[20.5,"#e879f9",.07],[24.2,"#a855f7",.1]].forEach(([y,c,t])=>{const r=new THREE.Mesh(new THREE.TorusGeometry(1,t,5,128),new THREE.MeshBasicMaterial({color:c,toneMapped:false}));r.rotation.x=Math.PI/2;r.scale.set(ex*.995,ez*.995,1);r.position.y=y;S.add(r)});
    /* anello viola sul soffitto attorno al maxischermo */const cr=new THREE.Mesh(new THREE.TorusGeometry(1,.12,5,96),V1);cr.rotation.x=Math.PI/2;cr.scale.set(9,7,1);cr.position.y=26.3;S.add(cr)}
  const glow=new THREE.Mesh(new THREE.TorusGeometry(1,.07,5,96),new THREE.MeshBasicMaterial({color:ACC,toneMapped:false}));glow.rotation.x=Math.PI/2;glow.scale.set(WX*1.03,WZ*1.03,1);glow.position.y=Y2+1.2;S.add(glow);
  /* maxischermo con lo scontro diretto */
  const scr=tex(1024,600,()=>{},2);
  const scrM=[],jb=new THREE.Group();jb.add(new THREE.Mesh(new THREE.BoxGeometry(8,4.6,5.2),new THREE.MeshLambertMaterial({color:"#0e0e14"})));
  [[0,0,2.61,7.6],[Math.PI,0,-2.61,7.6],[Math.PI/2,4.01,0,5],[-Math.PI/2,-4.01,0,5]].forEach(([r,x,z,w])=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(w,4.2),new THREE.MeshBasicMaterial({map:scr,toneMapped:false}));p.rotation.y=r;p.position.set(x,0,z);jb.add(p);scrM.push(p)});
  [-2.45,2.45].forEach(y=>{const r=new THREE.Mesh(new THREE.TorusGeometry(1,.06,5,48),new THREE.MeshBasicMaterial({color:ACC,toneMapped:false}));r.rotation.x=Math.PI/2;r.scale.set(4.6,3.1,1);r.position.y=y;jb.add(r)});
  jb.position.y=15.5;S.add(jb);
  /* striscioni dei trofei */
  const AS=window.ALLSTAR||window.ALLSTAR_WIN||[],B=[];(STORIA||[]).forEach(st=>{const p=st.ordine.indexOf(t);if(p===0)B.push({l1:"CAMPIONI",l2:"ANNO "+st.anno,l3:"DREAMERS LEAGUE",bg:mix(BG,"#000",.15).getStyle(),edge:"#ffd36b",txt:lum(BG)>.6?"#111":"#fff"});else if(p===1)B.push({l1:"FINALISTI",l2:"ANNO "+st.anno,l3:"2° POSTO",bg:"#343a46",edge:"#e6edf7",txt:"#fff"});else if(p===2)B.push({l1:"PODIO",l2:"ANNO "+st.anno,l3:"3° POSTO",bg:"#4a2e1c",edge:"#e0a070",txt:"#fff"})});
  AS.forEach(a=>{if((a.vinc||[]).includes(t))B.push({l1:"ALL-STAR",l2:"ANNO "+a.anno,l3:"VINCITORI",bg:"#1b2c6b",edge:"#8cc8ff",txt:"#fff"})});
  if(!B.length)B.push({l1:"STAGIONE",l2:"26/27",l3:"IL PRIMO È VICINO",bg:mix(BG,"#000",.3).getStyle(),edge:"#ffffff",txt:"#fff"});
  const bw=3,gap=.9,x0=-(B.length-1)*(bw+gap)/2,bz=-(CH/2+RA+13*.85+3);
  B.forEach((b,i)=>{const bt=tex(512,1100,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,b.bg);g.addColorStop(1,mix(b.bg,"#000",.4).getStyle());x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*.9);x.lineTo(W/2,H);x.lineTo(0,H*.9);x.closePath();x.fill();
      x.strokeStyle=b.edge;x.lineWidth=14;x.beginPath();x.moveTo(24,24);x.lineTo(W-24,24);x.lineTo(W-24,H*.885);x.lineTo(W/2,H-26);x.lineTo(24,H*.885);x.closePath();x.stroke();
      x.fillStyle=b.edge;const cx=W/2,cy=320;x.beginPath();x.moveTo(cx-95,cy-125);x.lineTo(cx+95,cy-125);x.quadraticCurveTo(cx+85,cy+20,cx+22,cy+55);x.lineTo(cx+22,cy+105);x.lineTo(cx+60,cy+135);x.lineTo(cx-60,cy+135);x.lineTo(cx-22,cy+105);x.lineTo(cx-22,cy+55);x.quadraticCurveTo(cx-85,cy+20,cx-95,cy-125);x.fill();
      x.lineWidth=15;x.beginPath();x.arc(cx-98,cy-62,40,Math.PI*.5,Math.PI*1.5);x.stroke();x.beginPath();x.arc(cx+98,cy-62,40,-Math.PI*.5,Math.PI*.5);x.stroke();
      x.textAlign="center";x.fillStyle=b.txt;x.font="italic 900 64px Arial Black,Arial";x.fillText(b.l1,cx,585);x.font="900 112px Arial Black,Arial";x.fillText(b.l2,cx,720);x.font="700 36px Arial";x.fillStyle=b.edge;x.fillText(b.l3,cx,800);x.font="800 30px Arial";x.fillStyle="rgba(255,255,255,.75)";x.fillText(TM.nick.toUpperCase(),cx,880)});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(bw,bw*1100/512),new THREE.MeshBasicMaterial({map:bt,side:THREE.DoubleSide,color:"#ffffff",toneMapped:false}));m.position.set(x0+i*(bw+gap),Y2+1.6,bz);
    /* (942) striscione illuminato: alone viola dietro e cornice LED */const bh=bw*1100/512,halo=new THREE.Mesh(new THREE.PlaneGeometry(bw*1.9,bh*1.35),new THREE.MeshBasicMaterial({map:K_GLOW(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));halo.position.set(m.position.x,m.position.y,bz-.08);S.add(halo);
    const fr=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(bw+.12,bh+.12)),new THREE.LineBasicMaterial({color:b.edge,toneMapped:false}));fr.position.set(m.position.x,m.position.y,bz+.02);S.add(fr);S.add(m)});
  /* luci: poche e senza ombre */
  S.add(new THREE.HemisphereLight(LK.sky,LK.gnd??mix(BG,"#1a1620",.8).getHex(),LK.hemi));const dl=new THREE.DirectionalLight(LK.dir,LK.dirI);dl.position.set(0,30,0);S.add(dl);
  /* (946) fasci di luce visibili dai fari del tetto (coni trasparenti, leggerissimi) e pozze di luce calda sul parquet */
  {const bt=tex(64,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(255,236,200,.0)");g.addColorStop(.15,"rgba(255,236,200,.55)");g.addColorStop(1,"rgba(255,236,200,0)");x.fillStyle=g;x.fillRect(0,0,W,H)});
   const bm=new THREE.MeshBasicMaterial({map:bt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:.22,toneMapped:false});
   [[-11.2,-6.4],[-11.2,6.4],[11.2,-6.4],[11.2,6.4],[0,-7],[0,7],[-5.6,0],[5.6,0]].forEach(([x,z])=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.35,3.6,23,20,1,true),bm);const tx=x*.55,tz=z*.45;c.position.set((x+tx)/2,12.3,(z+tz)/2);c.lookAt(tx,0,tz);c.rotateX(-Math.PI/2);S.add(c);
     const f=new THREE.Mesh(new THREE.CylinderGeometry(.55,.45,.35,16),new THREE.MeshBasicMaterial({color:"#fff4e0",toneMapped:false}));f.position.set(x,24.2,z);S.add(f)});
   const pt=tex(256,256,(x,W,H)=>{const g=x.createRadialGradient(W/2,H/2,4,W/2,H/2,W/2);g.addColorStop(0,"rgba(255,240,210,.55)");g.addColorStop(1,"rgba(255,240,210,0)");x.fillStyle=g;x.fillRect(0,0,W,H)});
   const pm=new THREE.MeshBasicMaterial({map:pt,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.09,toneMapped:false});
   [[-6.2,-2.9],[-6.2,2.9],[6.2,-2.9],[6.2,2.9],[0,-3.2],[0,3.2],[-3,0],[3,0]].forEach(([x,z])=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(9,9),pm);p.rotation.x=-Math.PI/2;p.position.set(x,.03,z);S.add(p)})}
  [[-9,0],[0,-4],[0,4],[9,0]].forEach(([x,z])=>{const sp=new THREE.SpotLight(LK.spot,LK.spotI,48,.62,.6,1.35);sp.position.set(x*1.25,24,z*1.6);sp.target.position.set(x,0,z);S.add(sp,sp.target)});
  return{PL:pLoc,PC,DOOR,GLOW:K_GLOW,THREE,R,S,cam,FANS,CW,CH,RA,ACC,BG,TM,scr,scrM,tex,LG,mob,WALK,BOWLS,Y1,DMAX:RA+13*.85+1.8+11*.8-.3}}

/* ---------------- DATI LIVE ---------------- */
function liveRows(t){let NM={};try{NM=campoNotteMap(t)||{}}catch(e){}const out=[];
  for(const n in NM){const x=NM[n],B=TV.box[x.k];if(!B)continue;const r=(B[x.sd]||[]).find(r=>tvNm(r[0])===tvNm(n));if(!r)continue;
    const p=(ROSTER[t]||[]).find(y=>y[0]===n);const oc=(B.oc||[]).includes(tvNm(r[0]));
    out.push({n,num:p?p[1]:"",live:x.lv,oc,st:x.st,opp:x.opp,k:x.k,pdk:+r[19]||0,min:r[2],pt:+r[3]||0,rb:+r[6]||0,as:+r[7]||0,stl:+r[8]||0,blk:+r[9]||0,tov:+r[10]||0,fgm:+r[12]||0,fga:+r[13]||0,tpm:+r[14]||0,ftm:+r[16]||0,fta:+r[17]||0})}
  /* (933) come il campo della modalità notte: i 5 migliori della notte per PDK (stessa scelta di campoNotteMap + slice(0,5)) */
  return out.sort((a,b)=>b.pdk-a.pdk).slice(0,5)}
function duel(t){try{const P=drPO(drStand()),k=drCurWeek(P),W=drWeek(k),pr=(drPairs(k,null,P)||[]).find(x=>x.includes(t)),o=pr?(pr[0]===t?pr[1]:pr[0]):null;return{k,me:drTeam(k,t,W).score,o,os:o?drTeam(k,o,W).score:null}}catch(e){return null}}

/* ---------------- APERTURA ---------------- */
async function open(t){if(ST)return;const TM=TEAMS[t];if(!TM)return;
  const ov=$(`<div class="drm3"><canvas></canvas><div class="drm3top"><button class="drm3x" aria-label="Esci">✕</button><div class="drm3t">MODALITÀ DREAM<small>${TM.nick.toUpperCase()} ARENA</small></div><button class="drm3a" aria-label="Voce">🔊</button></div>
    <div class="drm3msg">Entro nell'arena…</div><div class="drm3fade" style="position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .35s"></div><div class="drm3hint">Trascina per guardarti intorno · tocca dove vuoi andare (parquet o tribune) · tocca una maglia per avvicinarti · due dita per ingrandire · nell'angolo in fondo a destra c'è la sala trofei</div></div>`);
  document.body.appendChild(ov);document.body.classList.add("drm3on");
  /* (939) i gesti dentro lo stadio non arrivano all'app: prima lo scorrimento a dito cambiava squadra nella pagina sotto */
  ["touchstart","touchmove","touchend","touchcancel","pointerdown","pointermove","pointerup","wheel","keydown"].forEach(k=>ov.addEventListener(k,e=>e.stopPropagation(),{passive:true}));const msg=ov.querySelector(".drm3msg");
  ST={t,ov,stop:false,anim:[],prev:{},audioOn:(()=>{try{return localStorage.getItem("dl_drm_audio")!=="0"}catch(e){return true}})()};const st=ST;
  /* (951) TELECRONISTA: la voce italiana del telefono (sintesi vocale di sistema, funziona anche senza rete) annuncia le azioni live.
     Tasto 🔊/🔇 in alto a destra (ricordato). Al massimo 3 frasi in coda, così resta puntuale. */
  const SY=window.speechSynthesis;let VO=null;const pickV=()=>{try{const L=SY.getVoices();VO=L.find(v=>/^it/i.test(v.lang)&&/premium|enhanced|alice|federica|luca/i.test(v.name))||L.find(v=>/^it/i.test(v.lang))||null}catch(e){}};if(SY){pickV();try{SY.onvoiceschanged=pickV}catch(e){}}
  st.voice=(()=>{try{return localStorage.getItem("dl_drm_voce")!=="0"}catch(e){return true}})();
  const say=(txt)=>{if(!SY||!st.voice||st.stop)return;try{if(SY.pending&&st.q>=4)return;const u=new SpeechSynthesisUtterance(txt);u.lang="it-IT";if(VO)u.voice=VO;u.rate=.92;u.pitch=1;u.volume=1;st.q=(st.q||0)+1;u.onend=u.onerror=()=>{st.q=Math.max(0,(st.q||1)-1)};SY.speak(u)}catch(e){}};st.say=say;
  const vb=ov.querySelector(".drm3a");vb.textContent=st.voice?"🔊":"🔇";vb.onclick=()=>{st.voice=!st.voice;try{localStorage.setItem("dl_drm_voce",st.voice?"1":"0")}catch(e){}vb.textContent=st.voice?"🔊":"🔇";if(st.A)st.A.mute(st.voice);if(!st.voice&&SY)SY.cancel();else say("Voce attiva")};
  if(SY&&st.voice){try{SY.cancel();say("Benvenuti alla "+TM.nick+" Arena")}catch(e){}}
  /* (01/11) AUDIO VERO (file scelti dall'utente, cartella aud/): sottofondo del palazzetto in loop senza stacchi, «punto segnato» a ogni canestro o libero segnato,
   «tiro sbagliato» a ogni tiro o libero sbagliato. Web Audio; si scaricano solo qui; il tasto 🔊/🔇 spegne voce e suoni; tutto si ferma all'uscita. */
st.A=null;try{const AC=window.AudioContext||window.webkitAudioContext;if(AC&&st.audioOn){const ac=new AC(),m=ac.createGain();m.gain.value=st.voice?1:0;m.connect(ac.destination);const B={};let bg=null;
  const ld=n=>fetch("aud/"+n+".mp3").then(r=>r.arrayBuffer()).then(b=>new Promise((ok,ko)=>ac.decodeAudioData(b,ok,ko))).then(x=>{B[n]=x}).catch(()=>{});
  const startBg=()=>{if(bg||!B["dream-sottofondo"]||st.stop)return;bg=ac.createBufferSource();bg.buffer=B["dream-sottofondo"];bg.loop=true;const g=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(.38,ac.currentTime+1.5);bg.connect(g);g.connect(m);bg.start()};
  const fx=(n,v)=>{const b=B[n];if(!b||st.stop)return;const s=ac.createBufferSource();s.buffer=b;const g=ac.createGain();g.gain.value=v;s.connect(g);g.connect(m);s.start()};
  Promise.all(["dream-sottofondo","dream-segnato","dream-sbagliato"].map(ld)).then(()=>{if(ac.state==="suspended")ac.resume().catch(()=>{});startBg()});
  st.A={ac,play(k){if(k==="pt"||k==="ft")fx("dream-segnato",.9);else if(k==="miss")fx("dream-sbagliato",.8)},mute(on){m.gain.setTargetAtTime(on?1:0,ac.currentTime,.08)},
    close(){try{bg&&bg.stop()}catch(e){}}/* il contesto lo chiude già close() più sotto */};
  const unl=()=>{if(ac.state==="suspended")ac.resume().catch(()=>{})};ov.addEventListener("pointerdown",unl);ov.addEventListener("touchend",unl);
  st.vis=()=>{if(st.stop)return;if(document.hidden)ac.suspend().catch(()=>{});else ac.resume().catch(()=>{})};document.addEventListener("visibilitychange",st.vis)}}catch(e){st.A=null}
const A=st.A;
  ov.querySelector(".drm3x").onclick=close;
  let T3;try{T3=await loadThree()}catch(e){msg.textContent="Non riesco a caricare lo stadio 3D: controlla la connessione e riprova.";return}
  if(st.stop)return;
  let K;try{K=await build(t,ov.querySelector("canvas"),T3)}catch(e){console.error(e);msg.textContent="Lo stadio non si è caricato su questo telefono.";return}
  if(st.stop){disposeAll(K);return}st.K=K;const{THREE,R,S,cam}=K;
  /* ---- maxischermo ---- */
  const drawScreen=()=>{const c=K.scr.userData.c,x=c.getContext("2d"),W=c.width/(K.scr.userData.q||1),H=c.height/(K.scr.userData.q||1),D=duel(t),O=D&&D.o?TEAMS[D.o]:null;
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,new THREE.Color(K.BG).lerp(new THREE.Color("#000"),.4).getStyle());g.addColorStop(1,"#05030a");x.fillStyle=g;x.fillRect(0,0,W,H);
    x.textAlign="center";x.textBaseline="middle";
    if(O){if(K.LG)x.drawImage(K.LG,40,70,230,230);if(st.oLG)x.drawImage(st.oLG,W-270,70,230,230);
      x.fillStyle="#fff";x.font="italic 900 46px Arial Black,Arial";x.fillText(TM.nick.toUpperCase(),155,345);x.fillText(O.nick.toUpperCase(),W-155,345);
      x.font="900 108px Arial Black,Arial";x.fillStyle=(D.me??0)>=(D.os??0)?"#facc15":"#fff";x.fillText(fmt(D.me),W/2,140);x.fillStyle=(D.os??0)>(D.me??0)?"#facc15":"#fff";x.fillText(fmt(D.os),W/2,265);
      x.font="700 30px Arial";x.fillStyle="#cbd5e1";x.fillText("TURNO "+(D.k+(window.DR_OFF||0))+" · SCONTRO DIRETTO",W/2,365)}
    else{if(K.LG)x.drawImage(K.LG,W/2-160,30,320,320);x.fillStyle="#fff";x.font="italic 900 80px Arial Black,Arial";x.fillText(TM.nick.toUpperCase(),W/2,420)}
    const L=st.rows||[],lv=L.some(r=>r.live);x.font="800 34px Arial";x.fillStyle=lv?"#f87171":"#cbd5e1";if(L.length)x.fillText(lv?"● LIVE · "+L.filter(r=>r.live).length+" IN CAMPO STANOTTE":"PARTITE DI STANOTTE FINITE",W/2,H-60)/* (947) campo vuoto: nessuna scritta */;K.scr.needsUpdate=true};
  try{const D=duel(t);if(D&&D.o)st.oLG=await img(LOGO[D.o])}catch(e){}
  /* ---- maglie ---- */
  /* (945) cinque posti simmetrici su tutto il campo: il migliore al centro in fondo, due a metà campo vicino, due ai lati verso i canestri */const slots=[[0,-4.8],[-6,3.9],[6,3.9],[-10.6,-3],[10.6,-3],[0,5],[-11.8,4.4],[11.8,4.4]];
  const J={},grp=new THREE.Group();S.add(grp);
  const sprite=(lines,o)=>{const h=o.h||160,x=K.tex(512,h,(c,W,H)=>{rr(c,6,6,W-12,H-12,26);c.fillStyle=o.bg||"rgba(8,6,16,.84)";c.fill();c.lineWidth=6;c.strokeStyle=o.edge||K.ACC;c.stroke();c.textAlign="center";c.textBaseline="middle";lines.forEach((l,i)=>{c.fillStyle=l.c||"#fff";c.font=l.f||"800 44px Arial";c.fillText(l.t,W/2,H/(lines.length+1)*(i+1))})},o.q||3);/* (953) cartellini a 3× (prima 2×): testo nitido */
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:x,transparent:true,depthWrite:false,toneMapped:false,fog:false}));s.scale.set(o.w||2.4,(o.w||2.4)*h/512,1);return s};
  const tagLines=r=>[{t:(r.n.split(" ")[0][0]+". "+r.n.split(" ").slice(1).join(" ")).toUpperCase(),f:"italic 900 48px Arial Black,Arial"},{t:`${fmt(r.pdk)} PDK · ${r.pt} PT · ${r.rb} RIM · ${r.as} AST`,f:"800 33px Arial",c:"#ffffff"},{t:r.live?(r.oc?"● IN CAMPO · ":"PANCHINA · ")+(r.st||"LIVE"):"FINALE · vs "+(r.opp||""),f:"800 28px Arial",c:r.live?"#fecaca":"#d1d5db"}];
  async function addJersey(r){const used=new Set(Object.values(J).map(o=>o.si));let si=0;while(used.has(si))si++;const g=new THREE.Group(),[x,z]=slots[si%slots.length];g.position.set(x,0,z);
    let svg="";try{svg=jersey(t,r.num,"")}catch(e){}svg=svg.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="730" ');
    const im=await img("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)),jt=K.tex(600,730,c=>{if(im)c.drawImage(im,0,0,600,730)});
    const jm=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.82),new THREE.MeshBasicMaterial({map:jt,transparent:true,side:THREE.DoubleSide,alphaTest:.05,toneMapped:false,fog:false})/* (944) colori pieni, non smorzati dalla luce */);jm.position.y=2.25;g.add(jm);
    const halo=new THREE.Mesh(new THREE.CircleGeometry(.8,24),new THREE.MeshBasicMaterial({color:K.ACC,transparent:true,opacity:r.live?.45:.18,toneMapped:false}));halo.rotation.x=-Math.PI/2;halo.position.y=.02;g.add(halo);
    const lv=PK[pdkLvl(r.pdk)]||PK.na,tag=sprite(tagLines(r),{w:2.7,h:200,edge:lv[0]});tag.position.y=1.0;g.add(tag);
    grp.add(g);J[r.n]={g,jm,tag,halo,r,si,ph:Math.random()*6};if(!r.live)jm.material.color.set("#e6e6ea")}
  function updTag(o){const old=o.tag;const lv=PK[pdkLvl(o.r.pdk)]||PK.na;o.tag=sprite(tagLines(o.r),{w:2.7,h:200,edge:lv[0]});o.tag.position.y=1.0;o.g.add(o.tag);o.g.remove(old);old.material.map.dispose();old.material.dispose();o.halo.material.opacity=o.r.live?.45:.18;o.jm.material.color.set(o.r.live?"#ffffff":"#e6e6ea")}
  const EVC={pt3:["+3 PUNTI","#22c55e","pt",1],pt2:["+2 PUNTI","#4ade80","pt",0],ft:["+1 LIBERO","#86efac","ft",0],reb:["RIMBALZO","#60a5fa","reb",0],ast:["ASSIST","#c084fc","ast",0],blk:["STOPPATA","#38bdf8","blk",0],stl:["RECUPERO","#2dd4bf","stl",0],tov:["PALLA PERSA","#fb923c","tov",0],miss:["TIRO SBAGLIATO","#f87171","miss",0],ftm:["LIBERO SBAGLIATO","#fca5a5","miss",0]};
  const SUR=n=>{const p=n.split(" ").filter(w=>!/^(jr\.?|sr\.?|ii|iii|iv)$/i.test(w));return p.length>1?p.slice(1).join(" "):p[0]};
  const FR={pt3:"%, tripla!",pt2:"%, due punti!",ft:"%, libero",reb:"%, rimbalzo",ast:"%, assist",blk:"%, stoppata!",stl:"%, recupero!",tov:"%, palla persa",miss:"%, tiro sbagliato",ftm:"%, libero sbagliato"};/* (952) prima il nome, poi l'azione, breve */
  function pop(n,kind,delay){const o=J[n];if(!o)return;const E=EVC[kind];setTimeout(()=>{if(st.stop)return;if(st.say&&FR[kind])st.say(FR[kind].replace("%",SUR(n)));const s=sprite([{t:E[0],f:"italic 900 62px Arial Black,Arial",c:"#fff"}],{w:2.1,h:120,bg:E[1],edge:"#ffffff"});s.userData.s0=s.scale.clone();s.position.set(0,3.45,0);o.g.add(s);st.anim.push({s,o,t0:performance.now()});if(st.A&&st.audioOn)st.A.play(E[2],E[3]);st.dirty=true},delay||0)}
  function diff(r){const p=st.prev[r.n];st.prev[r.n]=r;if(!p)return;let d=0;const q=(k,n)=>{for(let i=0;i<Math.min(n,3);i++)pop(r.n,k,(d++)*5200)};
    const fg2=(r.fgm-r.tpm)-(p.fgm-p.tpm),fg3=r.tpm-p.tpm,ft=r.ftm-p.ftm,miss=(r.fga-r.fgm)-(p.fga-p.fgm),ftmiss=(r.fta-r.ftm)-(p.fta-p.ftm);
    if(fg3>0)q("pt3",fg3);if(fg2>0)q("pt2",fg2);if(ft>0)q("ft",ft);if(r.rb>p.rb)q("reb",r.rb-p.rb);if(r.as>p.as)q("ast",r.as-p.as);if(r.blk>p.blk)q("blk",r.blk-p.blk);if(r.stl>p.stl)q("stl",r.stl-p.stl);if(r.tov>p.tov)q("tov",r.tov-p.tov);if(miss>0)q("miss",miss);if(ftmiss>0)q("ftm",ftmiss)}
  const emptyS=sprite([{t:"NESSUNO IN CAMPO STANOTTE",f:"italic 900 40px Arial Black,Arial"},{t:"le maglie arrivano quando giocano i tuoi",f:"700 28px Arial",c:"#cbd5e1"}],{w:6,h:150});emptyS.position.set(0,2.4,0);
  async function refresh(first){st.rows=liveRows(t);const have=new Set(st.rows.map(r=>r.n));
    for(const n in J)if(!have.has(n)){grp.remove(J[n].g);delete J[n]}
    let i=0;for(const r of st.rows){if(!J[r.n])await addJersey(r);else{J[r.n].r=r;updTag(J[r.n])}if(!first)diff(r);else st.prev[r.n]=r;i++}
    /* (947) se non gioca nessuno il campo resta vuoto, senza scritte */
    drawScreen();st.dirty=true}
  await refresh(true);
  /* aggiornamento live: ogni 20 secondi (ESPN), solo se c'è qualcuno live o una partita in corso */
  const tick=async()=>{if(st.stop||document.hidden)return;try{try{await tvEspn()}catch(e){}/* dati live dell'app (ESPN, come Dynasty TV) */try{await tvOnCourt()}catch(e){}await refresh(false)}catch(e){}};
  st.iv=setInterval(tick,20000);setTimeout(tick,300);
  /* coro DE-FENSE: all'ingresso se c'è qualcuno live, poi ogni 50–80 secondi mentre i tuoi giocano */
  const chantNext=()=>{st.ch=setTimeout(()=>{if(st.stop)return;if(st.A&&st.audioOn&&(st.rows||[]).some(r=>r.live)&&!document.hidden)st.A.play("def",4);chantNext()},50000+Math.random()*30000)};chantNext();
  setTimeout(()=>{if(!st.stop&&st.A&&st.audioOn&&(st.rows||[]).some(r=>r.live))st.A.play("def",3)},2500);
  /* ---- movimento ---- */
  const V={x:0,z:K.CH/2+K.RA+13*.85+1.8+10*.8+.4,yaw:0,pitch:-27};/* (953) 5 gradini più in alto (11ª fila dell'anello alto) *//* (950) partenza sulle scale centrali dell'anello alto, all'altezza indicata da Francesco *//* (935) si parte dall'anello alto (5ª fila) */V.yaw=Math.atan2(V.x,V.z)*180/Math.PI;st.V=V;/* (930) si parte dall'alto, sopra i gradini */let walk=0,dr=null;const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  /* (929) CAMMINARE OVUNQUE (Francesco 20:42): si sale sui gradoni, si guarda dall'alto, si scende e si entra in campo.
     dOut = distanza fuori dal rettangolo arrotondato del campo (come le tribune); l'altezza dei piedi segue il gradone su cui si è. */
  const dOut=(x,z)=>{const ax=Math.max(0,Math.abs(x)-(K.CW/2-3.5)),az=Math.max(0,Math.abs(z)-(K.CH/2-3.5));return Math.hypot(ax,az)-3.5};
  const terr=(x,z)=>{if(st.room)return 0;{const q=K.PL(x,z);if(q.a>K.RA-.35&&q.a<K.RA-.3+K.PC.D&&Math.abs(q.l)<K.PC.W/2)return footY<1.5?0:K.PC.H}const d=dOut(x,z);let y=0;for(const b of K.BOWLS){const r=Math.floor((d-b.r0)/b.dr);if(r>=0&&r<b.rows)y=b.y0+r*b.dy}if(d>=K.RA+13*.85&&d<K.RA+13*.85+1.8)y=K.Y1;return y};
  const clampP=()=>{/* (957) nella sala trofei: corridoio largo 2,5 m e sala 15×12 m */if(st.room){if(V.z>-12.3){V.x=cl(V.x,-1.25,1.25);V.z=Math.min(V.z,.4)}else{V.x=cl(V.x,-7.2,7.2);V.z=Math.max(V.z,-23.9)}return}
    /* (957) contro il portale si passa solo dalla porta */{const q=K.PL(V.x,V.z);if(footY<1.5&&q.a>K.RA-.4&&q.a<K.RA-.3+K.PC.D&&Math.abs(q.l)<K.PC.W/2+.2&&Math.abs(q.l)>=K.PC.DW/2-.25){const a=3.5+K.RA-.4;V.x=K.PC.x+K.PC.ux*a+K.PC.ux*q.l;V.z=K.PC.z+K.PC.uz*a-K.PC.uz*q.l}}
    let d=dOut(V.x,V.z);if(d>K.DMAX){const k=.98;for(let i=0;i<30&&dOut(V.x,V.z)>K.DMAX;i++){V.x*=k;V.z*=k}}};
  let footY=0;
  /* tifosi troppo vicini a chi guarda: si nascondono (solo quando ti fermi, per non pesare) */
  const hideAt={x:1e9,z:1e9};let hidden=[];const Mx=new THREE.Matrix4(),Z0=new THREE.Matrix4().makeScale(0,0,0);
  const hideNear=()=>{hideAt.x=V.x;hideAt.z=V.z;const F=K.FANS;if(!F)return;hidden.forEach(i=>{F.forEach(f=>f.m.setMatrixAt(i,f.orig[i]))});hidden=[];
    F[0].pos.forEach((p,i)=>{if(Math.hypot(p[0]-V.x,p[2]-V.z)<1.3){hidden.push(i);F.forEach(f=>f.m.setMatrixAt(i,Z0))}});F.forEach(f=>f.m.instanceMatrix.needsUpdate=true);st.dirty=true};
  const cv=ov.querySelector("canvas");
  /* (928) TUTTO A TOCCO, come la sala trofei: trascina = guarda; tocco sul parquet = cammina fin lì; tocco su una maglia = ti porta davanti;
     tocco sul maxischermo = coro DE-FENSE; due dita (pizzico) = avanti/indietro; rotella o WASD sul computer. */
  let ZM=1;const applyZ=()=>{cam.zoom=ZM;cam.updateProjectionMatrix();st.dirty=true};
  const P=new Map();let pinch=null,tap=null,tw=null;const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
  const MK=new THREE.Mesh(new THREE.RingGeometry(.35,.5,40),new THREE.MeshBasicMaterial({color:"#c4b5fd",transparent:true,opacity:0,depthWrite:false,toneMapped:false}));MK.rotation.x=-Math.PI/2;S.add(MK);
  const fly=(x,z,yaw)=>{if(ZM>1){ZM=1;applyZ()}MK.position.set(x,(typeof terr==="function"?terr(x,z):0)+.04,z);MK.userData.t0=performance.now();const d=yaw==null?0:((yaw-V.yaw+540)%360)-180;tw={t0:performance.now(),dur:Math.min(1600,450+Math.hypot(x-V.x,z-V.z)*90),x0:V.x,z0:V.z,x1:x,z1:z,y0:V.yaw,dy:d}};
  cv.addEventListener("pointerdown",e=>{P.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}tw=null;if(A)A.ac.resume();ov.querySelector(".drm3hint").style.opacity=0;
    if(P.size===1){dr={x:e.clientX,y:e.clientY};tap={x:e.clientX,y:e.clientY,t:performance.now(),m:0}}else{dr=null;tap=null;const[a,b]=[...P.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y)}});
  cv.addEventListener("pointermove",e=>{if(!P.has(e.pointerId))return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(P.size>=2&&pinch!=null){const[a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y);ZM=cl(ZM*d/Math.max(1,pinch),1,5);pinch=d;applyZ();return}/* (938) due dita = zoom come sulle foto (fino a 5×), senza muoversi */
    if(!dr)return;const dx=e.clientX-dr.x,dy=e.clientY-dr.y;dr.x=e.clientX;dr.y=e.clientY;if(tap)tap.m+=Math.abs(dx)+Math.abs(dy);if(!tap||tap.m>8){V.yaw+=dx*.25/ZM;V.pitch=cl(V.pitch+dy*.2/ZM,-60,60);st.dirty=true}});
  const up=e=>{P.delete(e.pointerId);if(P.size<2)pinch=null;if(P.size===0)dr=null;const q=tap;tap=null;if(!q||q.m>10||performance.now()-q.t>450||e.type==="pointercancel")return;
    const rc=cv.getBoundingClientRect();ndc.set((e.clientX-rc.left)/rc.width*2-1,-(e.clientY-rc.top)/rc.height*2+1);ray.setFromCamera(ndc,cam);
    if(st.room){roomTap();return}
    const hits=ray.intersectObjects([...Object.values(J).map(o=>o.jm),...K.scrM,...K.DOOR],false);if(hits.length&&K.DOOR.includes(hits[0].object)){enterRoom();return}
    if(hits.length){const h=hits[0].object;if(K.scrM.includes(h)){if(st.A&&st.audioOn)st.A.play("def",4);return}
      const o=Object.values(J).find(o=>o.jm===h);if(o){const gx=o.g.position.x,gz=o.g.position.z,dx=V.x-gx,dz=V.z-gz,L=Math.hypot(dx,dz)||1,tx=gx+dx/L*3.2,tz=gz+dz/L*3.2;fly(tx,tz,Math.atan2(tx-gx,tz-gz)*180/Math.PI);V.pitch=0;return}}
    const sh=ray.intersectObjects(K.WALK,false);if(sh.length&&(!ray.ray.intersectPlane(plane,hit)||sh[0].distance<hit.distanceTo(cam.position))){fly(sh[0].point.x,sh[0].point.z,null);return}
    if(ray.ray.intersectPlane(plane,hit)){fly(hit.x,hit.z,null)}};
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",e=>{e.preventDefault();ZM=cl(ZM*Math.exp(-e.deltaY*.0015),1,5);applyZ()},{passive:false});
  const keys={},kd=e=>{keys[e.key.toLowerCase()]=e.type==="keydown";if(e.key==="Escape")close()};document.addEventListener("keydown",kd);document.addEventListener("keyup",kd);st.kd=kd;
  /* (934) anche in orizzontale: campo visivo adattato (più stretto in verticale, così l'orizzontale non deforma) */const rs=()=>{const land=innerWidth>innerHeight;cam.aspect=innerWidth/innerHeight;cam.fov=land?46:62;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight,false);st.dirty=true};rs();try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){};addEventListener("resize",rs);addEventListener("orientationchange",()=>setTimeout(rs,250));st.rs=rs;
  if(A)A.ac.resume();
  msg.style.display="none";st.dirty=true;
  /* ---- (957) SALA TROFEI: corridoio (12 m) e sala (16×14 m, alta 6 m) in una scena a parte, costruita solo al primo ingresso ---- */
  let RM=null;const fade=ov.querySelector(".drm3fade");
  async function buildRoom(){const RS=new THREE.Scene();RS.background=new THREE.Color("#07060a");const BG=K.BG,ACC=K.ACC,tex=K.tex,C=c=>new THREE.Color(c),mix=(a,b,k)=>C(a).lerp(C(b),k),lum=h=>{const c=C(h);return .2126*c.r+.7152*c.g+.0722*c.b};
    const add=(geo,mat,x,y,z,ry,rx)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;RS.add(m);return m};
    const HC=3.2,HR=6,Z0=-12,Z1=-26,X1=8,taps=[],JF=[];
    RS.add(new THREE.HemisphereLight("#fff3dd",mix(BG,"#140f08",.7).getHex(),.7));
    const GL=K.GLOW(),glowM=(o,c)=>new THREE.MeshBasicMaterial({map:GL,color:c||"#ffd9a0",transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:o,toneMapped:false});
    const warm=new THREE.MeshBasicMaterial({color:"#fff4dc",toneMapped:false}),led=new THREE.MeshBasicMaterial({color:ACC,toneMapped:false});
    /* corridoio: pavimento scuro lucido con linea del colore squadra, pareti grafite, strisce LED, plafoniere */
    const flT=tex(256,1024,(x,W,H)=>{x.fillStyle="#151318";x.fillRect(0,0,W,H);for(let i=0;i<H;i+=64){x.fillStyle="rgba(255,255,255,.04)";x.fillRect(0,i,W,2)}x.fillStyle=ACC;x.fillRect(W/2-7,0,14,H)});
    add(new THREE.PlaneGeometry(3.2,12.6),new THREE.MeshPhongMaterial({map:flT,shininess:70,specular:"#3a3a3a"}),0,0,-5.9,0,-Math.PI/2);
    const cwT=tex(1024,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#2a2730");g.addColorStop(1,"#17151b");x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<W;i+=128){x.fillStyle="rgba(0,0,0,.35)";x.fillRect(i,0,4,H)}});
    const cwM=new THREE.MeshLambertMaterial({map:cwT,emissive:"#ffffff",emissiveMap:cwT,emissiveIntensity:.55,side:THREE.DoubleSide});
    [-1.6,1.6].forEach(xx=>{add(new THREE.PlaneGeometry(12.4,HC),cwM,xx,HC/2,-5.8,Math.PI/2);[.08,HC-.12].forEach(y=>add(new THREE.BoxGeometry(.04,.05,12.4),led,xx-Math.sign(xx)*.03,y,-5.8))});
    add(new THREE.PlaneGeometry(3.2,12.4),new THREE.MeshLambertMaterial({color:"#141217",side:THREE.DoubleSide}),0,HC,-5.8,0,Math.PI/2);
    for(let z=-1.5;z>-12;z-=2.5){add(new THREE.BoxGeometry(.9,.03,.28),warm,0,HC-.02,z);if(Math.abs(z+6.5)%5>.1)continue;const p=new THREE.PointLight("#ffe7c2",14,8,2);p.position.set(0,HC-.3,z);RS.add(p)}
    /* loghi incorniciati lungo il corridoio */
    const LGT=K.LG?tex(512,512,(x,W,H)=>{x.fillStyle="#0e0c12";x.fillRect(0,0,W,H);const r=Math.min(W/K.LG.width,H/K.LG.height)*.8,w=K.LG.width*r,h=K.LG.height*r;x.drawImage(K.LG,(W-w)/2,(H-h)/2,w,h);x.strokeStyle=ACC;x.lineWidth=14;x.strokeRect(7,7,W-14,H-14)}):null;
    if(LGT)[-3.5,-8.5].forEach(z=>[-1,1].forEach(sg=>{add(new THREE.PlaneGeometry(1.3,1.3),new THREE.MeshBasicMaterial({map:LGT,toneMapped:false}),sg*1.58,1.75,z,-sg*Math.PI/2);add(new THREE.PlaneGeometry(2.2,2.2),glowM(.25),sg*1.57,1.75,z,-sg*Math.PI/2)}));
    /* uscita verso l'arena (in fondo al corridoio, alle spalle) */
    const exT=tex(512,600,(x,W,H)=>{x.fillStyle="#0b0a0e";x.fillRect(0,0,W,H);const g=x.createRadialGradient(W/2,H*.55,10,W/2,H*.55,W*.7);g.addColorStop(0,"rgba(167,139,250,.55)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(0,0,W,H);x.strokeStyle="#a78bfa";x.lineWidth=10;x.strokeRect(5,5,W-10,H-10);x.textAlign="center";x.fillStyle="#fff";x.font="italic 900 70px Arial Black,Arial";x.fillText("ARENA",W/2,H*.45);x.font="700 34px Arial";x.fillStyle="#ddd6fe";x.fillText("tocca per tornare",W/2,H*.56)});
    const exD=add(new THREE.PlaneGeometry(2.2,2.6),new THREE.MeshBasicMaterial({map:exT,toneMapped:false}),0,1.3,.55,Math.PI);exD.userData.exit=1;taps.push(exD);
    add(new THREE.PlaneGeometry(3.2,HC),cwM,0,HC/2,.6,Math.PI);
    /* insegna in fondo al corridoio */
    const snT=tex(1024,150,(x,W,H)=>{x.fillStyle="rgba(10,8,14,.92)";x.fillRect(0,0,W,H);x.fillStyle=ACC;x.fillRect(0,H-10,W,10);x.textAlign="center";x.textBaseline="middle";x.font="italic 900 76px Arial Black,Arial";x.fillStyle="#fff";x.fillText("SALA TROFEI "+TM.nick.toUpperCase(),W/2,H*.47)},2);
    add(new THREE.PlaneGeometry(3,3*150/1024),new THREE.MeshBasicMaterial({map:snT,toneMapped:false}),0,HC-.3,-11.7);
    /* sala: pavimento in legno scuro con il logo al centro */
    const rfT=tex(1024,896,(x,W,H)=>{for(let j=0;j<H;j+=28)for(let i=-((j/28)%4)*60;i<W;i+=240){const t=18+Math.random()*12;x.fillStyle=`rgb(${t+22},${t+10},${t})`;x.fillRect(i,j,238,26)}x.fillStyle="rgba(0,0,0,.4)";for(let j=0;j<H;j+=28)x.fillRect(0,j+26,W,2);
      const cx=W/2,cy=H/2;x.beginPath();x.arc(cx,cy,230,0,7);x.fillStyle=mix(BG,"#000",.55).getStyle();x.fill();x.lineWidth=12;x.strokeStyle=ACC;x.stroke();if(K.LG){const r=Math.min(380/K.LG.width,380/K.LG.height),w=K.LG.width*r,h=K.LG.height*r;x.drawImage(K.LG,cx-w/2,cy-h/2,w,h)}});
    add(new THREE.PlaneGeometry(2*X1,14),new THREE.MeshPhongMaterial({map:rfT,shininess:45,specular:"#2a2a2a"}),0,0,(Z0+Z1)/2,0,-Math.PI/2);
    /* pareti nel colore squadra, a pannelli, con zoccolo scuro e cornice LED */
    const rwT=tex(1024,512,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,mix(BG,"#fff",.06).getStyle());g.addColorStop(1,mix(BG,"#000",.38).getStyle());x.fillStyle=g;x.fillRect(0,0,W,H);for(let i=0;i<W;i+=170){x.fillStyle="rgba(0,0,0,.16)";x.fillRect(i,0,6,H);x.fillStyle="rgba(255,255,255,.08)";x.fillRect(i+6,0,3,H)}});
    const rwM=new THREE.MeshLambertMaterial({map:rwT,emissive:"#ffffff",emissiveMap:rwT,emissiveIntensity:.18,side:THREE.DoubleSide});
    add(new THREE.PlaneGeometry(2*X1,HR),rwM,0,HR/2,Z1);[-X1,X1].forEach(xx=>add(new THREE.PlaneGeometry(14,HR),rwM,xx,HR/2,(Z0+Z1)/2,Math.PI/2));
    [[-X1,-1.6],[1.6,X1]].forEach(([a,b])=>add(new THREE.PlaneGeometry(b-a,HR),rwM,(a+b)/2,HR/2,Z0));add(new THREE.PlaneGeometry(3.2,HR-HC),rwM,0,(HR+HC)/2,Z0);
    const dark=new THREE.MeshLambertMaterial({color:"#17120c"});
    add(new THREE.BoxGeometry(2*X1,.3,.06),dark,0,.15,Z1+.03);[-X1,X1].forEach(xx=>add(new THREE.BoxGeometry(.06,.3,14),dark,xx-Math.sign(xx)*.03,.15,(Z0+Z1)/2));
    add(new THREE.BoxGeometry(2*X1,.05,.05),led,0,HR-.35,Z1+.05);[-X1,X1].forEach(xx=>add(new THREE.BoxGeometry(.05,.05,14),led,xx-Math.sign(xx)*.05,HR-.35,(Z0+Z1)/2));
    add(new THREE.PlaneGeometry(2*X1,14),new THREE.MeshLambertMaterial({color:"#120f15",side:THREE.DoubleSide}),0,HR,(Z0+Z1)/2,0,Math.PI/2);
    /* scritta grande sulla parete di fondo */
    const ink=lum(BG)>.5?"#16100a":"#ffffff";const tiT=tex(1400,300,(x,W,H)=>{x.textAlign="center";x.textBaseline="middle";x.font="italic 900 150px Arial Black,Arial";x.fillStyle=ink;x.fillText("HALL OF FAME",W/2,H*.4);x.font="900 64px Arial Black,Arial";x.fillText(TM.nick.toUpperCase(),W/2,H*.85)},2);
    add(new THREE.PlaneGeometry(9,9*300/1400),new THREE.MeshBasicMaterial({map:tiT,transparent:true,toneMapped:false}),0,4.65,Z1+.02);
    /* faretti: corpi luminosi sul soffitto, coni di luce leggeri, pochi fari veri */
    const coneT=tex(64,256,(x,W,H)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(255,236,200,0)");g.addColorStop(.12,"rgba(255,236,200,.6)");g.addColorStop(1,"rgba(255,236,200,0)");x.fillStyle=g;x.fillRect(0,0,W,H)});
    const coneM=new THREE.MeshBasicMaterial({map:coneT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,opacity:.16,toneMapped:false});
    const spot=(x,z,tx,ty,tz,real,I)=>{add(new THREE.CylinderGeometry(.16,.12,.22,14),warm,x,HR-.12,z);const L=Math.hypot(tx-x,ty-HR,tz-z),c=new THREE.Mesh(new THREE.CylinderGeometry(.1,.85,L,16,1,true),coneM);c.position.set((x+tx)/2,(HR+ty)/2,(z+tz)/2);c.lookAt(tx,ty,tz);c.rotateX(-Math.PI/2);RS.add(c);
      if(real){const s=new THREE.SpotLight("#fff1d6",I||60,16,.5,.6,1.6);s.position.set(x,HR-.2,z);s.target.position.set(tx,ty,tz);RS.add(s,s.target)}};
    /* BACHECA DEI TROFEI */
    const AS=window.ALLSTAR||window.ALLSTAR_WIN||[],B=[];(STORIA||[]).forEach(h=>{const p=h.ordine.indexOf(t);if(p===0)B.push({k:"gold",l1:"CAMPIONI",l2:"ANNO "+h.anno});else if(p===1)B.push({k:"silver",l1:"FINALISTI",l2:"ANNO "+h.anno});else if(p===2)B.push({k:"bronze",l1:"3° POSTO",l2:"ANNO "+h.anno})});
    AS.forEach(a=>{if((a.vinc||[]).includes(t))B.push({k:"star",l1:"ALL-STAR",l2:"ANNO "+a.anno})});
    const cz=Z1+.7,cw=10,wood=new THREE.MeshPhongMaterial({color:"#1e150d",shininess:30});
    add(new THREE.BoxGeometry(cw,.9,1.2),wood,0,.45,cz);add(new THREE.BoxGeometry(cw,.22,1.2),wood,0,3.5,cz);add(new THREE.PlaneGeometry(cw-.1,1.1),warm,0,3.385,cz,0,Math.PI/2);
    add(new THREE.PlaneGeometry(cw,2.5),new THREE.MeshLambertMaterial({color:"#140d09"}),0,2.15,Z1+.12);
    const shelf=()=>{add(new THREE.BoxGeometry(cw,.04,1.1),new THREE.MeshPhongMaterial({color:"#cfe8ff",transparent:true,opacity:.25,shininess:100,depthWrite:false}),0,2.35,cz);add(new THREE.BoxGeometry(cw,.03,.03),led,0,2.35,cz+.56)};add(new THREE.BoxGeometry(cw,.03,.03),led,0,.91,cz+.6);
    const glass=add(new THREE.BoxGeometry(cw,2.38,1.2),new THREE.MeshPhongMaterial({color:"#d8ecff",transparent:true,opacity:.09,shininess:120,specular:"#ffffff",depthWrite:false}),0,2.1,cz);glass.userData.caseT=1;taps.push(glass);
    [-cw/2,cw/2].forEach(xx=>add(new THREE.BoxGeometry(.08,2.38,.08),wood,xx,2.1,cz+.58));
    const MAT={gold:new THREE.MeshPhongMaterial({color:"#e0aa1c",specular:"#fff3b8",shininess:95,emissive:"#3a2600"}),silver:new THREE.MeshPhongMaterial({color:"#c8ced8",specular:"#ffffff",shininess:100,emissive:"#202228"}),bronze:new THREE.MeshPhongMaterial({color:"#b5713d",specular:"#ffd9b0",shininess:80,emissive:"#2a1405"}),star:new THREE.MeshPhongMaterial({color:"#9cc8ff",specular:"#ffffff",shininess:100,emissive:"#0e2448"}),base:new THREE.MeshPhongMaterial({color:"#0d0b0a",shininess:60}),ball:new THREE.MeshPhongMaterial({color:"#e0702a",shininess:30})};
    const trophy=(b,sc)=>{const g=new THREE.Group(),m=MAT[b.k];const b1=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,.16,24),MAT.base);b1.position.y=.08;g.add(b1);const b2=new THREE.Mesh(new THREE.CylinderGeometry(.17,.21,.1,24),MAT.base);b2.position.y=.21;g.add(b2);const bnd=new THREE.Mesh(new THREE.CylinderGeometry(.285,.285,.03,24),m);bnd.position.y=.13;g.add(bnd);
      if(b.k==="star"){const sh=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.11:.26,a=i*Math.PI/5+Math.PI/2;i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r)}sh.closePath();const st_=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.06,bevelEnabled:true,bevelSize:.015,bevelThickness:.015,bevelSegments:2}),m);st_.position.set(0,.78,-.03);g.add(st_);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.025,.04,.32,12),m);pole.position.y=.42;g.add(pole)}
      else{const P=[[0,0],[.1,0],[.085,.04],[.04,.09],[.035,.3],[.06,.36],[.15,.44],[.21,.6],[.23,.78],[.215,.8],[.2,.78],[0,.74]].map(([a,c])=>new THREE.Vector2(a,c));const cup=new THREE.Mesh(new THREE.LatheGeometry(P,32),m);cup.position.y=.26;g.add(cup);
        [-1,1].forEach(sg=>{const h=new THREE.Mesh(new THREE.TorusGeometry(.09,.017,8,20,Math.PI),m);h.rotation.z=-sg*Math.PI/2;h.position.set(sg*.2,.26+.6,0);g.add(h)});
        if(b.k==="gold"){const bl=new THREE.Mesh(new THREE.SphereGeometry(.1,20,14),MAT.ball);bl.position.y=.26+.86;g.add(bl)}}
      const pT=tex(400,120,(x,W,H)=>{x.fillStyle="#1a1410";x.fillRect(0,0,W,H);x.strokeStyle={gold:"#f0c44c",silver:"#e6edf7",bronze:"#e0a070",star:"#8cc8ff"}[b.k];x.lineWidth=6;x.strokeRect(3,3,W-6,H-6);x.textAlign="center";x.textBaseline="middle";x.fillStyle=x.strokeStyle;x.font="italic 900 46px Arial Black,Arial";x.fillText(b.l1,W/2,H*.38);x.font="800 30px Arial";x.fillStyle="#fff";x.fillText(b.l2,W/2,H*.76)},2);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(.62,.186),new THREE.MeshBasicMaterial({map:pT,toneMapped:false}));pl.position.set(0,.09,.3);pl.rotation.x=-.35;g.add(pl);g.scale.setScalar(sc);return g};
    if(B.length){const main=B.filter(b=>b.k==="gold"),rest=B.filter(b=>b.k!=="gold");const row=(L,y,sc)=>L.forEach((b,i)=>{const g=trophy(b,sc);g.position.set((i-(L.length-1)/2)*Math.min(2.2,(cw-1)/L.length),y,cz+.05);RS.add(g)});
      if(main.length&&rest.length){shelf();row(main,.9,1.12);row(rest,2.37,.82)}else if(B.length>5){shelf();row(B.slice(0,Math.ceil(B.length/2)),.9,1.12);row(B.slice(Math.ceil(B.length/2)),2.37,.82)}else row(B,.9,1.3)}
    else{const eT=tex(800,200,(x,W,H)=>{x.textAlign="center";x.textBaseline="middle";x.fillStyle=ACC;x.font="italic 900 64px Arial Black,Arial";x.fillText("IL PRIMO TROFEO",W/2,H*.35);x.fillStyle="#fff";x.font="800 46px Arial";x.fillText("È VICINO",W/2,H*.75)},2);add(new THREE.PlaneGeometry(4,1),new THREE.MeshBasicMaterial({map:eT,transparent:true,toneMapped:false}),0,1.5,cz)}
    {const p=new THREE.PointLight("#ffe9c4",9,6,2);p.position.set(0,3.2,cz+.1);RS.add(p)}
    [-3.3,0,3.3].forEach(x=>spot(x,Z1+4.2,x,1.3,cz,true,55));add(new THREE.PlaneGeometry(13,5),glowM(.22),0,2.4,Z1+.05);
    /* MAGLIE DI TUTTI I GIOCATORI appese alle pareti, in cornice, ognuna col suo faretto */
    const RO=(ROSTER[t]||[]).slice(),N=RO.length,perW=Math.ceil(N/2),rows=perW>6?2:1,perR=Math.ceil(perW/rows),zA=Z0-1.6,zB=Z1+2.4,stepZ=perR>1?(zA-zB)/(perR-1):0;
    const fw=rows>1?1.3:1.55,fh=fw*1.32,ys=rows>1?[1.75,3.95]:[2.6],frM=new THREE.MeshPhongMaterial({color:"#120d08",shininess:50}),bkM=new THREE.MeshLambertMaterial({color:mix(BG,"#000",.78)});
    const tasks=RO.map(async(p,i)=>{const side=i<perW?-1:1,k=i<perW?i:i-perW,r=Math.floor(k/perR),c=k%perR,z=perR>1?zA-c*stepZ:(zA+zB)/2,y=ys[rows>1?(rows-1-r):0],xx=side*X1-side*.06,ry=-side*Math.PI/2;
      let svg="";try{svg=jersey(t,p[1],"")}catch(e){}svg=svg.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="730" ');const im=await img("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg));
      const jt=tex(600,730,cx=>{if(im)cx.drawImage(im,0,0,600,730)});
      add(new THREE.BoxGeometry(fw+.14,fh+.14,.07),frM,xx,y,z,ry);add(new THREE.PlaneGeometry(fw,fh),bkM,xx-side*.04,y,z,ry);
      const jm=add(new THREE.PlaneGeometry(fw*.86,fw*.86*730/600),new THREE.MeshBasicMaterial({map:jt,transparent:true,alphaTest:.05,toneMapped:false}),xx-side*.05,y+.04,z,ry);jm.userData.jf={x:side*(X1-2.6),z,yaw:-side*90};taps.push(jm);
      const nm=p[0].split(" "),sur=nm.slice(1).join(" ")||nm[0];const nT=tex(512,110,(x,W,H)=>{x.fillStyle="#1a1410";x.fillRect(0,0,W,H);x.strokeStyle=ACC;x.lineWidth=5;x.strokeRect(3,3,W-6,H-6);x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff";x.font="italic 900 "+(sur.length>14?32:40)+"px Arial Black,Arial";x.fillText(sur.toUpperCase(),W/2,H*.4);x.font="800 26px Arial";x.fillStyle=ACC;x.fillText((nm.length>1?nm[0]+" · ":"")+"#"+p[1]+" · "+(p[2]||""),W/2,H*.78)},2);
      add(new THREE.PlaneGeometry(fw*.9,fw*.9*110/512),new THREE.MeshBasicMaterial({map:nT,toneMapped:false}),xx-side*.05,y-fh/2-.2,z,ry);
      add(new THREE.PlaneGeometry(fw*2,fh*1.7),glowM(.2),xx-side*.01,y+.15,z,ry);spot(side*(X1-1.6),z,xx,y,z,false)});
    await Promise.all(tasks);
    [-1,1].forEach(sd=>{const s=new THREE.SpotLight("#fff1d6",40,14,.9,.7,1.6);s.position.set(sd*2,HR-.2,(Z0+Z1)/2);s.target.position.set(sd*X1,2.5,(Z0+Z1)/2);RS.add(s,s.target)});
    return{S:RS,taps}}
  async function enterRoom(){if(st.busy||st.room)return;st.busy=true;tw=null;walk=0;fade.style.opacity=1;await new Promise(r=>setTimeout(r,380));if(st.stop)return;
    if(!RM){msg.textContent="Entro nella sala trofei…";msg.style.display="";try{RM=await buildRoom();K.RS=RM.S}catch(e){console.error(e);RM=null}msg.style.display="none";
      if(!RM){const a=3.5+K.RA-1.6;V.x=K.PC.x+K.PC.ux*a;V.z=K.PC.z+K.PC.uz*a;fade.style.opacity=0;st.busy=false;return}}
    st.room=true;V.x=0;V.z=-.4;V.yaw=0;V.pitch=-3;footY=0;if(ZM>1){ZM=1;applyZ()}st.dirty=true;fade.style.opacity=0;st.busy=false;const h=ov.querySelector(".drm3hint");if(h){h.textContent="Sala trofei · tocca una maglia o la bacheca per avvicinarti · torna in fondo al corridoio per l'arena";h.style.opacity=1;setTimeout(()=>{h.style.opacity=0},5000)}
    if(st.say)st.say("Sala trofei dei "+TM.nick)}
  async function exitRoom(){if(st.busy||!st.room)return;st.busy=true;tw=null;fade.style.opacity=1;await new Promise(r=>setTimeout(r,380));if(st.stop)return;
    st.room=false;const a=3.5+K.RA-1.8;V.x=K.PC.x+K.PC.ux*a;V.z=K.PC.z+K.PC.uz*a;V.yaw=135;V.pitch=-4;footY=0;st.dirty=true;fade.style.opacity=0;st.busy=false}
  function roomTap(){const h=ray.intersectObjects(RM.taps,false)[0];if(h){const u=h.object.userData;if(u.exit){exitRoom();return}if(u.jf){fly(u.jf.x,u.jf.z,u.jf.yaw);V.pitch=u.jf.x?0:0;return}if(u.caseT){fly(0,-20.4,0);V.pitch=-6;return}}
    if(ray.ray.intersectPlane(plane,hit))fly(hit.x,hit.z,null)}
  /* ---- ciclo: si disegna solo quando serve; le maglie ondeggiano piano (10 fotogrammi al secondo da ferme) ---- */
  let last=performance.now(),lastDraw=0;
  const loop=now=>{if(st.stop)return;st.raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
    if(tw){const k=Math.min(1,(now-tw.t0)/tw.dur),q=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;V.x=tw.x0+(tw.x1-tw.x0)*q;V.z=tw.z0+(tw.z1-tw.z0)*q;V.yaw=tw.y0+tw.dy*q;st.dirty=true;if(k>=1)tw=null}
    let mv=walk;if(keys.w||keys.arrowup)mv=1;if(keys.s||keys.arrowdown)mv=-1;if(keys.a||keys.arrowleft){V.yaw+=80*dt;st.dirty=true}if(keys.d||keys.arrowright){V.yaw-=80*dt;st.dirty=true}
    if(mv){const r=V.yaw*Math.PI/180;V.x-=Math.sin(r)*mv*5.5*dt;V.z-=Math.cos(r)*mv*5.5*dt;st.dirty=true}
    clampP();if(!st.busy){if(st.room){if(V.z>.15)exitRoom()}else{const q=K.PL(V.x,V.z);if(q.a>K.RA-.62&&q.a<K.RA+1&&Math.abs(q.l)<K.PC.DW/2&&footY<1)enterRoom()}}{const ty=terr(V.x,V.z);footY+=(ty-footY)*Math.min(1,dt*9);if(Math.abs(ty-footY)>.01)st.dirty=true;if(!st.room&&!tw&&!mv&&(Math.abs(V.x-hideAt.x)>.5||Math.abs(V.z-hideAt.z)>.5))hideNear()}
    const animating=st.anim.length>0;if(!st.dirty&&!animating&&now-lastDraw<100)return;
    const ey=footY+(footY>.2?2.05:1.7);cam.position.set(V.x,ey,V.z);const yr=V.yaw*Math.PI/180,pr=V.pitch*Math.PI/180;cam.lookAt(V.x-Math.sin(yr)*Math.cos(pr),ey+Math.sin(pr),V.z-Math.cos(yr)*Math.cos(pr));
    for(const n in J){const o=J[n];o.g.rotation.y=Math.atan2(cam.position.x-o.g.position.x,cam.position.z-o.g.position.z);/* (942) da lontano maglia e targhetta si ingrandiscono (fino a 1,8×) così restano leggibili */const dd=Math.hypot(cam.position.x-o.g.position.x,cam.position.y-2,cam.position.z-o.g.position.z)/(cam.zoom||1),sc=Math.max(1,Math.min(1.8,dd/13));/* si ingrandiscono maglia e targhetta, ma restano alla stessa altezza dal parquet (non salgono e non si sovrappongono) *//* (948) targhetta sotto e maglia sopra, sempre staccate (prima la maglia copriva la parte alta della targhetta) */if(!o.tag.userData.s0)o.tag.userData.s0=o.tag.scale.clone();o.tag.scale.copy(o.tag.userData.s0).multiplyScalar(sc);const th=o.tag.scale.y;o.tag.position.y=.35+th/2;o.jm.scale.setScalar(sc);o.jm.position.y=.35+th+.12+.91*sc+Math.sin(now/900+o.ph)*.05}
    if(MK.userData.t0){const k=(now-MK.userData.t0)/1600;if(k>=1){MK.material.opacity=0;MK.userData.t0=0}else{MK.material.opacity=.9*(1-k);MK.scale.setScalar(1+k*.8);st.dirty=true}}
    /* (954) l'azione resta ferma sopra la maglia 4,5 s, poi sale e svanisce in 1,5 s (prima spariva in 2,8 s) */st.anim=st.anim.filter(a=>{const T=now-a.t0;if(T>=6000){a.o.g.remove(a.s);a.s.material.map.dispose();a.s.material.dispose();return false}const base=(a.o.jm.position.y||2.25)+.91*(a.o.jm.scale.y||1)+.45;if(T<300){const k=T/300;a.s.position.y=base;a.s.scale.copy(a.s.userData.s0).multiplyScalar(.6+.4*k);a.s.material.opacity=k}else if(T<4500){a.s.position.y=base;a.s.scale.copy(a.s.userData.s0);a.s.material.opacity=1}else{const k=(T-4500)/1500;a.s.position.y=base+k*1.2;a.s.material.opacity=1-k}return true});
    const gap=now-lastDraw;R.render(st.room&&RM?RM.S:S,cam);st.dirty=false;lastDraw=now;
    /* (932) se il telefono fatica (in movimento sotto i 22 fotogrammi al secondo), la risoluzione scende da sola di un gradino (mai sotto 1×): niente blocchi */
    st.fr=(st.fr||[]);if(gap<95)st.fr.push(gap);/* solo fotogrammi di fila (in movimento) */if(st.fr.length>=30){const avg=st.fr.reduce((a,b)=>a+b,0)/st.fr.length;st.fr=[];const pr=R.getPixelRatio();if(avg>45&&pr>1.01){R.setPixelRatio(Math.max(1,pr-.5));R.setSize(innerWidth,innerHeight,false);st.dirty=true}}};
  st.raf=requestAnimationFrame(loop);setTimeout(()=>{const h=ov.querySelector(".drm3hint");if(h)h.style.opacity=0},6000);
}
function disposeAll(K){try{[K.S,K.RS].forEach(SC=>SC&&SC.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})}}));K.R.dispose();K.R.forceContextLoss&&K.R.forceContextLoss()}catch(e){}}
function close(){const st=ST;if(!st)return;st.stop=true;ST=null;cancelAnimationFrame(st.raf);clearInterval(st.iv);clearTimeout(st.ch);if(st.kd){document.removeEventListener("keydown",st.kd);document.removeEventListener("keyup",st.kd)}if(st.rs)removeEventListener("resize",st.rs);
  try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}
  try{if(st.A)st.A.close();if(st.vis)document.removeEventListener("visibilitychange",st.vis)}catch(e){}
  if(st.K)disposeAll(st.K);
  /* (939) si torna sempre alla squadra da cui si è entrati */try{if(window.curTeam!==undefined||typeof curTeam!=="undefined"){if(curTeam!==st.t){curTeam=st.t;render()}}}catch(e){}try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock("portrait").catch(()=>{})}catch(e){}try{st.A&&st.A.ac.close()}catch(e){}st.ov.remove();document.body.classList.remove("drm3on")}
window.dreamOpen=open;window.dreamClose=close;window.dreamDbg=()=>ST;
})();
