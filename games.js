/* (1007) SALA GIOCHI DELLA MODALITÀ DREAM — giochi arcade originali (niente personaggi di altri): Serpente, Mattoni, Invasori, Labirinto degli arbitri, Dream Run, Biliardo contro il computer.
   Si carica solo entrando nella sala giochi. Ogni gioco disegna su un canvas a tutto schermo; il tasto ESCI lo mette chi apre il gioco (dream.js). Record salvati sul telefono. */
(function(){"use strict";
const rec=id=>{try{return+localStorage.getItem("dl_arc_"+id)||0}catch(e){return 0}},setRec=(id,v)=>{try{if(v>rec(id))localStorage.setItem("dl_arc_"+id,v)}catch(e){}};
const mkCanvas=(root,W,H)=>{const dpr=Math.min(2,window.devicePixelRatio||1),c=document.createElement("canvas");c.width=W*dpr;c.height=H*dpr;c.style.cssText=`position:absolute;left:0;top:0;width:${W}px;height:${H}px;touch-action:none`;root.appendChild(c);const x=c.getContext("2d");x.scale(dpr,dpr);return{c,x}};
const btn=(root,html,css,on,off)=>{const b=document.createElement("div");b.innerHTML=html;b.style.cssText="position:absolute;display:flex;align-items:center;justify-content:center;border-radius:16px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);color:#fff;font:900 22px system-ui;touch-action:none;user-select:none;-webkit-user-select:none;z-index:3;"+css;root.appendChild(b);b.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();b.style.background="rgba(255,255,255,.3)";on&&on(e)});const up=e=>{b.style.background="rgba(255,255,255,.12)";off&&off(e)};b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);b.addEventListener("pointerleave",up);return b};
const hud=(x,W,t,score,best,extra)=>{x.fillStyle="rgba(0,0,0,.45)";x.fillRect(0,0,W,34);x.fillStyle="#fff";x.font="italic 900 16px Arial Black,Arial";x.textAlign="left";x.textBaseline="middle";x.fillText(t,14,17);x.textAlign="center";x.fillStyle="#fde68a";x.fillText((typeof score==="string"?score:"PUNTI "+score)+(extra?"  ·  "+extra:""),W/2,17);x.textAlign="right";x.fillStyle="#a5b4fc";x.font="800 13px system-ui";x.fillText("RECORD "+best,W-110,17)};
const over=(x,W,H,txt,sub)=>{x.fillStyle="rgba(0,0,0,.6)";x.fillRect(0,0,W,H);x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff";x.font="italic 900 38px Arial Black,Arial";x.fillText(txt,W/2,H/2-16);x.font="800 16px system-ui";x.fillStyle="#c4b5fd";x.fillText(sub||"tocca per giocare ancora",W/2,H/2+24)};
const loopOf=f=>{let on=true,lt=performance.now();const tick=n=>{if(!on)return;const dt=Math.min(.05,(n-lt)/1000);lt=n;f(dt,n);requestAnimationFrame(tick)};requestAnimationFrame(tick);return()=>{on=false}};
const dpad=(root,H,cb)=>{const s=56,b=24,y=H-3*s-14;const d=[["▲",s+b,y,0,-1],["▼",s+b,y+2*s,0,1],["◀",b,y+s,-1,0],["▶",2*s+b,y+s,1,0]];d.forEach(([t,x,yy,dx,dy])=>btn(root,t,`left:calc(var(--msl,0px) + ${x}px);top:${yy}px;width:${s-4}px;height:${s-4}px`,()=>cb(dx,dy)))};
/* swipe sul canvas */const swipe=(c,pt,cb)=>{let s=null;c.addEventListener("pointerdown",e=>{s=pt(e)});c.addEventListener("pointerup",e=>{if(!s)return;const p=pt(e),dx=p.x-s.x,dy=p.y-s.y;if(Math.max(Math.abs(dx),Math.abs(dy))>24){if(Math.abs(dx)>Math.abs(dy))cb(Math.sign(dx),0);else cb(0,Math.sign(dy))}s=null})};

/* ===== SERPENTE ===== */
function snake(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H),CS=Math.floor(Math.min((W-40)/30,(H-60)/15)),GW=Math.floor((W-40)/CS),GH=Math.floor((H-50)/CS),ox=(W-GW*CS)/2,oy=40+(H-40-GH*CS)/2;
  let S,dir,nd,food,score,dead,acc,spd;const reset=()=>{S=[[5,Math.floor(GH/2)],[4,Math.floor(GH/2)],[3,Math.floor(GH/2)]];dir=[1,0];nd=[1,0];score=0;dead=false;acc=0;spd=.13;place()};
  const place=()=>{do{food=[Math.floor(Math.random()*GW),Math.floor(Math.random()*GH)]}while(S.some(p=>p[0]===food[0]&&p[1]===food[1]))};reset();
  const turn=(dx,dy)=>{if(dead){reset();return}if(dx===-dir[0]&&dy===-dir[1])return;nd=[dx,dy]};dpad(root,H,turn);swipe(c,o.pt,turn);c.addEventListener("pointerdown",()=>{if(dead)reset()});
  const stop=loopOf(dt=>{if(!dead){acc+=dt;while(acc>spd){acc-=spd;dir=nd;const h=[S[0][0]+dir[0],S[0][1]+dir[1]];if(h[0]<0||h[1]<0||h[0]>=GW||h[1]>=GH||S.some(p=>p[0]===h[0]&&p[1]===h[1])){dead=true;setRec("snake",score);break}S.unshift(h);if(h[0]===food[0]&&h[1]===food[1]){score+=10;spd=Math.max(.055,spd-.004);place()}else S.pop()}}
    x.fillStyle="#07140c";x.fillRect(0,0,W,H);x.fillStyle="#0c2414";for(let i=0;i<GW;i++)for(let j=0;j<GH;j++)if((i+j)%2)x.fillRect(ox+i*CS,oy+j*CS,CS,CS);x.strokeStyle="#22c55e";x.lineWidth=2;x.strokeRect(ox-1,oy-1,GW*CS+2,GH*CS+2);
    x.fillStyle="#f97316";x.beginPath();x.arc(ox+food[0]*CS+CS/2,oy+food[1]*CS+CS/2,CS*.42,0,7);x.fill();x.strokeStyle="#7c2d12";x.lineWidth=1.5;x.beginPath();x.moveTo(ox+food[0]*CS+2,oy+food[1]*CS+CS/2);x.lineTo(ox+food[0]*CS+CS-2,oy+food[1]*CS+CS/2);x.stroke();
    S.forEach((p,i)=>{x.fillStyle=i?`hsl(${140-i*2},70%,${48-i*.4}%)`:"#a3e635";x.fillRect(ox+p[0]*CS+1,oy+p[1]*CS+1,CS-2,CS-2)});
    hud(x,W,"SERPENTE",score,Math.max(rec("snake"),score));if(dead)over(x,W,H,"GAME OVER","punti "+score+" · tocca per rigiocare")});return stop}

/* ===== MATTONI ===== */
function bricks(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H);let px=W/2,B,lv,score,lives,ball,stuck,bricks_;const PW=110;
  const level=()=>{bricks_=[];const cols=12,rows=4+Math.min(3,lv),bw=(W-80)/cols;for(let r=0;r<rows;r++)for(let i=0;i<cols;i++)bricks_.push({x:40+i*bw,y:56+r*22,w:bw-4,h:18,hp:r<lv-1?2:1,c:`hsl(${r*45+lv*30},80%,55%)`});stuck=true};
  const reset=()=>{lv=1;score=0;lives=3;level()};reset();
  const mv=e=>{px=Math.max(PW/2,Math.min(W-PW/2,o.pt(e).x))};c.addEventListener("pointermove",mv);c.addEventListener("pointerdown",e=>{mv(e);if(lives<=0){reset();return}if(stuck){stuck=false;ball={x:px,y:H-50,vx:(Math.random()-.5)*200,vy:-320-lv*25}}});
  const stop=loopOf(dt=>{if(stuck||!ball)ball={x:px,y:H-50,vx:0,vy:0};else if(lives>0){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<8||ball.x>W-8){ball.vx*=-1;ball.x=Math.max(8,Math.min(W-8,ball.x))}if(ball.y<42){ball.vy=Math.abs(ball.vy)}
      if(ball.y>H-46&&ball.y<H-30&&Math.abs(ball.x-px)<PW/2+6&&ball.vy>0){ball.vy=-Math.abs(ball.vy)*1.01;ball.vx=(ball.x-px)/(PW/2)*360}
      if(ball.y>H){lives--;stuck=true;if(lives<=0)setRec("bricks",score)}
      for(const b of bricks_){if(b.hp>0&&ball.x>b.x-6&&ball.x<b.x+b.w+6&&ball.y>b.y-6&&ball.y<b.y+b.h+6){b.hp--;score+=10;const ox_=Math.min(Math.abs(ball.x-b.x),Math.abs(ball.x-b.x-b.w)),oy_=Math.min(Math.abs(ball.y-b.y),Math.abs(ball.y-b.y-b.h));if(ox_<oy_)ball.vx*=-1;else ball.vy*=-1;break}}
      if(bricks_.every(b=>b.hp<=0)){lv++;score+=100;level()}}
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#160b33");g.addColorStop(1,"#040210");x.fillStyle=g;x.fillRect(0,0,W,H);
    bricks_.forEach(b=>{if(b.hp<=0)return;x.fillStyle=b.c;x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle="rgba(255,255,255,.3)";x.fillRect(b.x,b.y,b.w,4);if(b.hp>1){x.strokeStyle="#fff";x.lineWidth=2;x.strokeRect(b.x+1,b.y+1,b.w-2,b.h-2)}});
    x.fillStyle="#a855f7";x.fillRect(px-PW/2,H-40,PW,10);x.fillStyle="#e9d5ff";x.fillRect(px-PW/2,H-40,PW,3);x.fillStyle="#f97316";x.beginPath();x.arc(ball.x,ball.y,7,0,7);x.fill();
    hud(x,W,"MATTONI",score,Math.max(rec("bricks"),score),"livello "+lv+" · "+"♥".repeat(Math.max(0,lives)));if(lives<=0)over(x,W,H,"GAME OVER","punti "+score);else if(stuck){x.fillStyle="#fff";x.font="800 16px system-ui";x.textAlign="center";x.fillText("tocca per lanciare · trascina per muovere",W/2,H/2+60)}});return stop}

/* ===== INVASORI ===== */
function invaders(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H);let px,shots,A,es,score,lives,wave,cd,dir,ecd,dead,stars=[...Array(80)].map(()=>[Math.random()*W,Math.random()*H,Math.random()*1.5+.3]);
  const wv=()=>{A=[];const cols=10,rows=4;for(let r=0;r<rows;r++)for(let i=0;i<cols;i++)A.push({x:80+i*((W-160)/cols),y:60+r*34,t:r,a:1});dir=1};
  const reset=()=>{px=W/2;shots=[];es=[];score=0;lives=3;wave=1;cd=0;ecd=1;dead=false;wv()};reset();
  const mv=e=>{px=Math.max(20,Math.min(W-20,o.pt(e).x))};c.addEventListener("pointermove",mv);c.addEventListener("pointerdown",e=>{mv(e);if(dead)reset()});
  const alien=(a,n)=>{const cx=a.x,cy=a.y,col=["#f472b6","#22d3ee","#a3e635","#facc15"][a.t];x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,13,8,0,0,7);x.fill();x.fillStyle="#0b0618";x.fillRect(cx-6,cy-2,4,4);x.fillRect(cx+2,cy-2,4,4);x.strokeStyle=col;x.lineWidth=2;const k=Math.sin(n/150)*3;x.beginPath();x.moveTo(cx-9,cy+6);x.lineTo(cx-12,cy+12+k);x.moveTo(cx+9,cy+6);x.lineTo(cx+12,cy+12-k);x.stroke()};
  const stop=loopOf((dt,n)=>{if(!dead){cd-=dt;if(cd<=0){cd=.28;shots.push({x:px,y:H-52})}shots.forEach(s=>s.y-=520*dt);shots=shots.filter(s=>s.y>30);
      let edge=false;const sp=(30+wave*12+(40-A.filter(a=>a.a).length)*2)*dt;A.forEach(a=>{if(!a.a)return;a.x+=dir*sp;if(a.x<24||a.x>W-24)edge=true});if(edge){dir*=-1;A.forEach(a=>a.y+=14)}
      for(const s of shots)for(const a of A){if(a.a&&Math.abs(s.x-a.x)<14&&Math.abs(s.y-a.y)<10){a.a=0;s.y=-99;score+=10*(4-a.t)}}
      ecd-=dt;if(ecd<=0){ecd=Math.max(.35,1.2-wave*.1);const L=A.filter(a=>a.a);if(L.length){const a=L[Math.floor(Math.random()*L.length)];es.push({x:a.x,y:a.y})}}es.forEach(e=>e.y+=(220+wave*20)*dt);
      es=es.filter(e=>{if(e.y>H-60&&e.y<H-36&&Math.abs(e.x-px)<18){lives--;if(lives<=0){dead=true;setRec("inv",score)}return false}return e.y<H});
      if(A.some(a=>a.a&&a.y>H-80)){dead=true;setRec("inv",score)}if(A.every(a=>!a.a)){wave++;score+=200;wv()}}
    x.fillStyle="#02010a";x.fillRect(0,0,W,H);stars.forEach(s=>{s[1]+=s[2]*20*dt;if(s[1]>H)s[1]=0;x.fillStyle=`rgba(255,255,255,${s[2]/2})`;x.fillRect(s[0],s[1],s[2],s[2])});
    A.forEach(a=>a.a&&alien(a,n));x.fillStyle="#fde047";shots.forEach(s=>x.fillRect(s.x-1.5,s.y-8,3,10));x.fillStyle="#f87171";es.forEach(e=>x.fillRect(e.x-2,e.y,4,10));
    x.fillStyle="#38bdf8";x.beginPath();x.moveTo(px,H-62);x.lineTo(px+18,H-38);x.lineTo(px-18,H-38);x.closePath();x.fill();x.fillStyle="#f97316";x.fillRect(px-6,H-38,12,5);
    hud(x,W,"INVASORI",score,Math.max(rec("inv"),score),"ondata "+wave+" · "+"♥".repeat(Math.max(0,lives)));if(dead)over(x,W,H,"GAME OVER","punti "+score)});return stop}

/* ===== LABIRINTO DEGLI ARBITRI: sei un pallone, raccogli i punti, scappa dagli arbitri; il fischietto li fa scappare ===== */
function maze(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H);
  const MAP=["#####################","#.........#.........#","#o##.###..#..###.##o#","#...................#","#.##.#.#######.#.##.#","#....#....#....#....#","####.###..#..###.####","#.........G.........#","#.##.#.###.###.#.##.#","#o...#....P....#...o#","#####################"];
  const GW=MAP[0].length,GH=MAP.length,CS=Math.floor(Math.min((W-200)/GW,(H-50)/GH)),ox=(W-GW*CS)/2,oy=40+(H-40-GH*CS)/2;let g,P,Gs,score,lives,fr,dead,nd,lvl;
  const wall=(i,j)=>i<0||j<0||i>=GW||j>=GH||g[j][i]==="#";
  const reset=full=>{if(full){score=0;lives=3;lvl=1}g=MAP.map(r=>r.split(""));P={x:10,y:9,dx:0,dy:0,f:0};g[9][10]=" ";g[7][10]=" ";Gs=[[9,7],[10,7],[11,7]].map(([i,j],k)=>({x:i,y:j,dx:0,dy:0,f:0,c:["#f8fafc","#fde68a","#fca5a5"][k]}));fr=0;dead=false;nd=[0,0]};reset(true);
  const turn=(dx,dy)=>{if(dead&&lives<=0){reset(true);return}nd=[dx,dy]};dpad(root,H,turn);swipe(c,o.pt,turn);c.addEventListener("pointerdown",()=>{if(dead&&lives<=0)reset(true)});
  const step=(m,sp,dt,choose)=>{m.f+=sp*dt;while(m.f>=1){m.f-=1;m.x+=m.dx;m.y+=m.dy;choose&&choose(m)}};
  const stop=loopOf((dt,n)=>{if(!dead){/* giocatore */step(P,6.5,dt,()=>{if(g[P.y][P.x]==="."){g[P.y][P.x]=" ";score+=10}else if(g[P.y][P.x]==="o"){g[P.y][P.x]=" ";score+=50;fr=7}if(!wall(P.x+nd[0],P.y+nd[1])){P.dx=nd[0];P.dy=nd[1]}if(wall(P.x+P.dx,P.y+P.dy)){P.dx=0;P.dy=0}});
      if(P.dx===0&&P.dy===0&&!wall(P.x+nd[0],P.y+nd[1])){P.dx=nd[0];P.dy=nd[1];P.f=0}fr=Math.max(0,fr-dt);
      Gs.forEach(G=>{if(G.dx===0&&G.dy===0){G.dx=0;G.dy=-1}step(G,fr>0?3.2:4.4+lvl*.4,dt,m=>{const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!(a===-m.dx&&b===-m.dy)&&!wall(m.x+a,m.y+b));if(!opts.length){m.dx*=-1;m.dy*=-1;return}opts.sort((p,q)=>{const dp=Math.hypot(m.x+p[0]-P.x,m.y+p[1]-P.y),dq=Math.hypot(m.x+q[0]-P.x,m.y+q[1]-P.y);return fr>0?dq-dp:dp-dq});const pick=Math.random()<.25?opts[Math.floor(Math.random()*opts.length)]:opts[0];m.dx=pick[0];m.dy=pick[1]});
        const gx=G.x+G.dx*G.f,gy=G.y+G.dy*G.f,px_=P.x+P.dx*P.f,py_=P.y+P.dy*P.f;if(Math.hypot(gx-px_,gy-py_)<.6){if(fr>0){score+=200;G.x=10;G.y=7;G.f=0}else{lives--;dead=true;setRec("maze",score);setTimeout(()=>{if(lives>0){const s0=score;const g0=g;reset(false);g=g0;score=s0}},900)}}});
      if(!g.some(r=>r.includes(".")||r.includes("o"))){lvl++;score+=500;const s0=score;reset(false);score=s0}}
    x.fillStyle="#05030d";x.fillRect(0,0,W,H);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){const ch=g[j][i],X=ox+i*CS,Y=oy+j*CS;if(ch==="#"){x.fillStyle="#3b1c8a";x.fillRect(X+1,Y+1,CS-2,CS-2);x.strokeStyle="#a855f7";x.lineWidth=1.5;x.strokeRect(X+2,Y+2,CS-4,CS-4)}else if(ch==="."){x.fillStyle="#fde68a";x.fillRect(X+CS/2-2,Y+CS/2-2,4,4)}else if(ch==="o"){x.fillStyle="#e5e7eb";x.beginPath();x.arc(X+CS/2,Y+CS/2,CS*.28,0,7);x.fill();x.fillStyle="#111";x.fillRect(X+CS/2-1,Y+CS/2-CS*.28,2,CS*.2)}}
    const pxp=ox+(P.x+P.dx*P.f)*CS+CS/2,pyp=oy+(P.y+P.dy*P.f)*CS+CS/2;x.fillStyle="#f97316";x.beginPath();x.arc(pxp,pyp,CS*.42,0,7);x.fill();x.strokeStyle="#431407";x.lineWidth=1.5;x.beginPath();x.moveTo(pxp-CS*.42,pyp);x.lineTo(pxp+CS*.42,pyp);x.moveTo(pxp,pyp-CS*.42);x.lineTo(pxp,pyp+CS*.42);x.stroke();
    Gs.forEach(G=>{const gx=ox+(G.x+G.dx*G.f)*CS+CS/2,gy=oy+(G.y+G.dy*G.f)*CS+CS/2,r=CS*.42;x.save();x.beginPath();x.arc(gx,gy-r*.2,r,Math.PI,0);x.lineTo(gx+r,gy+r);x.lineTo(gx-r,gy+r);x.closePath();x.clip();x.fillStyle=fr>0?(fr<2&&Math.floor(n/150)%2?"#fff":"#1d4ed8"):G.c;x.fillRect(gx-r,gy-r*1.3,2*r,2.4*r);if(fr<=0){x.fillStyle="#111";for(let k=-r;k<r;k+=r*.5)x.fillRect(gx+k,gy-r*1.3,r*.25,2.4*r)}x.restore();x.fillStyle="#fff";x.fillRect(gx-r*.45,gy-r*.35,r*.3,r*.3);x.fillRect(gx+r*.15,gy-r*.35,r*.3,r*.3)});
    hud(x,W,"LABIRINTO",score,Math.max(rec("maze"),score),"livello "+lvl+" · "+"♥".repeat(Math.max(0,lives)));if(dead&&lives<=0)over(x,W,H,"FISCHIO FINALE","punti "+score+" · tocca per rigiocare")});return stop}

/* ===== DREAM RUN: corri sui tetti della città, salta (anche doppio) gli ostacoli, prendi i palloni ===== */
function runner(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H);let P,obs,coins,spd,dist,score,dead,jumps,bgx,coinsGot=0;
  const GY=H-70;const reset=()=>{coinsGot=0;P={y:GY,vy:0};obs=[];coins=[];spd=280;dist=0;score=0;dead=false;jumps=0;bgx=0};reset();
  const jump=()=>{if(dead){reset();return}if(jumps<2){P.vy=-560;jumps++}};c.addEventListener("pointerdown",jump);btn(root,"SALTA",`right:calc(var(--msr,0px) + 24px);bottom:22px;width:120px;height:80px`,jump);
  const stop=loopOf((dt,n)=>{if(!dead){spd+=6*dt;dist+=spd*dt;score=Math.floor(dist/10)+coinsGot;P.vy+=1500*dt;P.y+=P.vy*dt;if(P.y>=GY){P.y=GY;P.vy=0;jumps=0}
      if(!obs.length||obs[obs.length-1].x<W-260-Math.random()*300){const t=Math.random();obs.push({x:W+40,w:t<.5?26:44,h:t<.5?38:26,k:t<.5?"cono":"panca"});if(Math.random()<.6)coins.push({x:W+140,y:GY-90-Math.random()*90})}
      obs.forEach(b=>b.x-=spd*dt);coins.forEach(q=>q.x-=spd*dt);obs=obs.filter(b=>b.x>-60);
      for(const b of obs){if(80+14>b.x&&80-14<b.x+b.w&&P.y>GY-b.h+4){dead=true;setRec("run",score)}}coins=coins.filter(q=>{if(Math.hypot(q.x-80,q.y-(P.y-22))<26){coinsGot+=25;return false}return q.x>-20})}
    bgx+=(dead?0:spd)*dt;const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#1e1b4b");g.addColorStop(.7,"#7c3aed");g.addColorStop(1,"#f472b6");x.fillStyle=g;x.fillRect(0,0,W,H);
    for(let l=0;l<2;l++){x.fillStyle=l?"#2e1065":"#4c1d95";const sp_=l?.5:.25,bw=70;for(let i=-1;i<W/bw+2;i++){const X=i*bw-(bgx*sp_)%bw,hh=(Math.sin(i*12.9+l*3+Math.floor(bgx*sp_/bw)*0)*.5+.5)*120+60+l*40;x.fillRect(X,GY+8-hh,bw-6,hh)}}
    x.fillStyle="#111827";x.fillRect(0,GY+8,W,H-GY);x.fillStyle="#a855f7";x.fillRect(0,GY+8,W,3);
    obs.forEach(b=>{if(b.k==="cono"){x.fillStyle="#f97316";x.beginPath();x.moveTo(b.x+b.w/2,GY+8-b.h);x.lineTo(b.x+b.w,GY+8);x.lineTo(b.x,GY+8);x.fill();x.fillStyle="#fff";x.fillRect(b.x+b.w*.3,GY+8-b.h*.5,b.w*.4,4)}else{x.fillStyle="#92400e";x.fillRect(b.x,GY+8-b.h,b.w,8);x.fillStyle="#1f2937";x.fillRect(b.x+3,GY+8-b.h+8,4,b.h-8);x.fillRect(b.x+b.w-7,GY+8-b.h+8,4,b.h-8)}});
    coins.forEach(q=>{x.fillStyle="#f97316";x.beginPath();x.arc(q.x,q.y,10,0,7);x.fill();x.strokeStyle="#431407";x.lineWidth=1.5;x.beginPath();x.moveTo(q.x-10,q.y);x.lineTo(q.x+10,q.y);x.stroke()});
    /* il nostro corridore: canotta viola e pallone */const yy=P.y,ph=dead?0:Math.sin(n/60);x.strokeStyle="#fde68a";x.lineWidth=5;x.lineCap="round";x.beginPath();x.moveTo(80,yy-20);x.lineTo(80+ph*10,yy+6);x.moveTo(80,yy-20);x.lineTo(80-ph*10,yy+6);x.stroke();x.fillStyle="#7c3aed";x.fillRect(70,yy-46,20,28);x.fillStyle="#fde68a";x.beginPath();x.arc(80,yy-54,9,0,7);x.fill();x.fillStyle="#f97316";x.beginPath();x.arc(96,yy-30+ph*6,7,0,7);x.fill();
    hud(x,W,"DREAM RUN",score,Math.max(rec("run"),score));if(dead)over(x,W,H,"CADUTO!","punti "+score)});return stop}

/* ===== BILIARDO 8 contro il computer: trascina dalla bianca per mirare (più trascini, più forza), lascia per tirare ===== */
function pool(root,o){const{W,H}=o,{c,x}=mkCanvas(root,W,H);const TW=Math.min(W-60,(H-60)*2),TH=TW/2,tx=(W-TW)/2,ty=40+(H-40-TH)/2,R=TW/56,PR=R*1.9;
  const POCK=[[0,0],[TW/2,-R*.3],[TW,0],[0,TH],[TW/2,TH+R*.3],[TW,TH]];const COLS=["#fde047","#2563eb","#dc2626","#7c3aed","#f97316","#16a34a","#7f1d1d","#111111"];
  let B,turn,groups,aim,moving,msg,potted,firstHit,over_,cpuT;
  const rack=()=>{B=[{n:0,x:TW*.25,y:TH/2,vx:0,vy:0,in:false}];const order=[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];let k=0;for(let col=0;col<5;col++)for(let r=0;r<=col;r++){B.push({n:order[k++],x:TW*.68+col*R*1.75,y:TH/2+(r-col/2)*R*2.02,vx:0,vy:0,in:false})}turn=0;groups=null;moving=false;msg="Tocca a te: trascina dalla bianca";over_=null};rack();
  const grpOf=n=>n===8?"8":n<8?"piene":"righe";const mine=p=>groups?groups[p]:null;
  const shoot=(vx,vy)=>{const q=B[0];q.vx=vx;q.vy=vy;moving=true;potted=[];firstHit=null};
  c.addEventListener("pointerdown",e=>{if(over_){rack();return}if(moving||turn!==0)return;const p=o.pt(e);aim={s:p,p}});c.addEventListener("pointermove",e=>{if(aim)aim.p=o.pt(e)});
  c.addEventListener("pointerup",()=>{if(!aim)return;const dx=aim.s.x-aim.p.x,dy=aim.s.y-aim.p.y,L=Math.hypot(dx,dy);aim=null;if(L<8)return;const pw=Math.min(1,L/(TW*.35))*TW*1.9;shoot(dx/L*pw,dy/L*pw)});
  const cpu=()=>{const q=B[0],tg=B.filter(b=>b.n&&!b.in&&(mine(1)?(grpOf(b.n)===mine(1)||(grpOf(b.n)==="8"&&B.filter(z=>z.n&&!z.in&&grpOf(z.n)===mine(1)).length===0)):b.n!==8));let best=null,bs=-1e9;
    tg.forEach(b=>POCK.forEach(pk=>{const ax=pk[0]-b.x,ay=pk[1]-b.y,al=Math.hypot(ax,ay),gx=b.x-ax/al*R*2,gy=b.y-ay/al*R*2,cx=gx-q.x,cy=gy-q.y,cl=Math.hypot(cx,cy),cos=(cx*ax+cy*ay)/(cl*al);const s=cos*2-al/TW-cl/TW;if(cos>.25&&s>bs){bs=s;best={cx,cy,cl}}}));
    if(!best){const b=tg[0]||B.find(z=>z.n&&!z.in);if(!b)return;best={cx:b.x-q.x,cy:b.y-q.y,cl:Math.hypot(b.x-q.x,b.y-q.y)}}const err=(Math.random()-.5)*.06,a=Math.atan2(best.cy,best.cx)+err,pw=TW*(.9+Math.random()*.6);shoot(Math.cos(a)*pw,Math.sin(a)*pw)};
  const endShot=()=>{const p=turn,foul=B[0].in||(!firstHit)||(groups&&firstHit&&grpOf(firstHit.n)!==groups[p]&&!(grpOf(firstHit.n)==="8"&&B.filter(z=>z.n&&!z.in&&grpOf(z.n)===groups[p]).length===0));
    const eight=potted.find(b=>b.n===8);if(eight){const left=groups?B.filter(z=>z.n&&z.n!==8&&!z.in&&grpOf(z.n)===groups[p]).length:1;over_=(left===0&&!foul)?p:1-p;setRec("pool",over_===0?rec("pool")+1:rec("pool"));msg=over_===0?"HAI VINTO!":"Ha vinto il computer";return}
    if(B[0].in){B[0].in=false;B[0].x=TW*.25;B[0].y=TH/2;B[0].vx=B[0].vy=0}
    const mineP=potted.filter(b=>b.n&&b.n!==8);if(!groups&&mineP.length){const g0=grpOf(mineP[0].n);groups=p===0?[g0,g0==="piene"?"righe":"piene"]:[g0==="piene"?"righe":"piene",g0]}
    const good=mineP.some(b=>groups&&grpOf(b.n)===groups[p]);if(foul||!good)turn=1-p;msg=(foul?"Fallo! ":"")+(turn===0?"Tocca a te":"Tocca al computer")+(groups?" · tu: "+groups[0]:"");if(turn===1)cpuT=1.1};
  const stop=loopOf(dt=>{if(moving){const sub=4,h=dt/sub;for(let s=0;s<sub;s++){B.forEach(b=>{if(b.in)return;b.x+=b.vx*h;b.y+=b.vy*h;const f=Math.exp(-1.1*h);b.vx*=f;b.vy*=f;if(Math.hypot(b.vx,b.vy)<4){b.vx=b.vy=0}
          if(b.x<R){b.x=R;b.vx=Math.abs(b.vx)*.8}if(b.x>TW-R){b.x=TW-R;b.vx=-Math.abs(b.vx)*.8}if(b.y<R){b.y=R;b.vy=Math.abs(b.vy)*.8}if(b.y>TH-R){b.y=TH-R;b.vy=-Math.abs(b.vy)*.8}
          for(const pk of POCK)if(Math.hypot(b.x-pk[0],b.y-pk[1])<PR){b.in=true;b.vx=b.vy=0;potted.push(b)}});
        for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i],b=B[j];if(a.in||b.in)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<2*R&&d>0){const nx=dx/d,ny=dy/d,ov=2*R-d;a.x-=nx*ov/2;a.y-=ny*ov/2;b.x+=nx*ov/2;b.y+=ny*ov/2;const rv=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(rv>0){a.vx-=rv*nx*.96;a.vy-=rv*ny*.96;b.vx+=rv*nx*.96;b.vy+=rv*ny*.96}if(!firstHit&&(a.n===0||b.n===0))firstHit=a.n===0?b:a}}}
        if(B.every(b=>b.in||(b.vx===0&&b.vy===0))){moving=false;endShot()}}else if(turn===1&&!over_){cpuT-=dt;if(cpuT<=0)cpu()}
    x.fillStyle="#0b0a10";x.fillRect(0,0,W,H);x.fillStyle="#5b3a1c";x.fillRect(tx-R*2,ty-R*2,TW+R*4,TH+R*4);const fg=x.createRadialGradient(tx+TW/2,ty+TH/2,10,tx+TW/2,ty+TH/2,TW*.6);fg.addColorStop(0,"#15803d");fg.addColorStop(1,"#0f5a2b");x.fillStyle=fg;x.fillRect(tx,ty,TW,TH);
    POCK.forEach(pk=>{x.fillStyle="#020202";x.beginPath();x.arc(tx+pk[0],ty+pk[1],PR,0,7);x.fill()});x.strokeStyle="rgba(255,255,255,.18)";x.beginPath();x.moveTo(tx+TW*.25,ty);x.lineTo(tx+TW*.25,ty+TH);x.stroke();
    B.forEach(b=>{if(b.in)return;const X=tx+b.x,Y=ty+b.y;x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.arc(X+2,Y+2,R,0,7);x.fill();if(b.n===0){x.fillStyle="#f8fafc"}else{x.fillStyle=b.n>8?"#f8fafc":COLS[(b.n-1)%8]}x.beginPath();x.arc(X,Y,R,0,7);x.fill();if(b.n>8){x.fillStyle=COLS[(b.n-9)%8];x.fillRect(X-R,Y-R*.5,R*2,R);}if(b.n){x.fillStyle="#fff";x.beginPath();x.arc(X,Y,R*.45,0,7);x.fill();x.fillStyle="#111";x.font=`900 ${R*.7}px system-ui`;x.textAlign="center";x.textBaseline="middle";x.fillText(b.n,X,Y+.5)}});
    if(aim){const q=B[0],dx=aim.s.x-aim.p.x,dy=aim.s.y-aim.p.y,L=Math.hypot(dx,dy)||1;x.strokeStyle="rgba(255,255,255,.6)";x.setLineDash([6,6]);x.beginPath();x.moveTo(tx+q.x,ty+q.y);x.lineTo(tx+q.x+dx/L*TW*.5,ty+q.y+dy/L*TW*.5);x.stroke();x.setLineDash([]);x.strokeStyle="#d6a76c";x.lineWidth=5;x.beginPath();x.moveTo(tx+q.x-dx/L*(R*2+Math.min(L,TW*.35)*.4),ty+q.y-dy/L*(R*2+Math.min(L,TW*.35)*.4));x.lineTo(tx+q.x-dx/L*(R*2+Math.min(L,TW*.35)*.4+TW*.4),ty+q.y-dy/L*(R*2+Math.min(L,TW*.35)*.4+TW*.4));x.stroke();x.lineWidth=1}
    hud(x,W,"BILIARDO",msg||"",rec("pool")+" vinte");if(over_!=null)over(x,W,H,msg,"tocca per una nuova partita")});return stop}

const GAMES={snake:{n:"SERPENTE",f:snake},bricks:{n:"MATTONI",f:bricks},inv:{n:"INVASORI",f:invaders},maze:{n:"LABIRINTO",f:maze},run:{n:"DREAM RUN",f:runner},pool:{n:"BILIARDO",f:pool}};
window.DreamArcade={GAMES,rec,open(id,root,o){const G=GAMES[id];if(!G)return()=>{};return G.f(root,o)}};
})();
