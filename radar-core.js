/* (1149) RADAR BREAKOUT – motore comune: lo usano l'app (gmas.js) e GitHub (tools/radar_tune.mjs, che ritara i pesi ogni giorno).
   Funzioni pure: nessuna variabile dell'app, tutto passa da TV e ctx. */
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

if(typeof module!=="undefined")module.exports={radarAt,radarEsito};
