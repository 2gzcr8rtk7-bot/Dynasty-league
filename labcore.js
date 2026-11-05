/* (1259) LABORATORIO MAGLIE · motore di disegno (Francesco 05/11).
   Una maglia è un oggetto «d» (colori, bordi, fantasia, elementi, scritte) che labSvg(d,num) trasforma in SVG 120×146,
   con la stessa forma e le stesse ombre delle maglie dell'app. Usato dal Laboratorio (lab.js) e dalla prova sul campo. */
(function(){
const BODY="M38 6 C42 27 78 27 82 6 L98 12 C97 34 104 46 114 50 L112 126 Q60 137 8 126 L6 50 C16 46 23 34 22 12 Z";
const NECK="M38 6 C42 27 78 27 82 6",ARM="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50";
const NECK_IN="M41 7 C45 24 75 24 79 7",ARM_IN="M25 13 C26 34 19 47 9 51 M95 13 C94 34 101 47 111 51";
const f=n=>Math.round(n*100)/100;
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const star=(r1,r2,n=5,rot=-90)=>{let p=[];for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=(rot+i*180/n)*Math.PI/180;p.push(f(Math.cos(a)*r)+" "+f(Math.sin(a)*r))}return"M"+p.join(" L")+"Z"};
/* numeri casuali ripetibili (stesse stelle a ogni disegno) */
const rng=s=>()=>(s=(s*16807)%2147483647)/2147483647;
/* ===== ELEMENTI (disegnati attorno a 0,0, circa da −20 a +20) · a = colore 1, b = colore 2 ===== */
const EL={
 stella:{n:"Stella",g:"Texas",d:(a,b)=>`<path d="${star(19,7.6)}" fill="${a}" stroke="${b}" stroke-width="1.4" stroke-linejoin="round"/>`},
 lonestar:{n:"Lone Star",g:"Texas",d:(a,b)=>`<circle r="19" fill="${b}"/><path d="${star(15,6)}" fill="${a}"/>`},
 sceriffo:{n:"Stella sceriffo",g:"Texas",d:(a,b)=>{let s=`<path d="${star(18,10,6)}" fill="${a}" stroke="${b}" stroke-width="1.2" stroke-linejoin="round"/>`;for(let i=0;i<6;i++){const q=(-90+i*60)*Math.PI/180;s+=`<circle cx="${f(Math.cos(q)*18)}" cy="${f(Math.sin(q)*18)}" r="2.8" fill="${a}" stroke="${b}" stroke-width="1"/>`}return s+`<circle r="7.4" fill="${b}"/><path d="${star(5.6,2.3)}" fill="${a}"/>`}},
 texas:{n:"Mappa Texas",g:"Texas",d:(a,b)=>{const P=[[18,0],[36,0],[36,30],[60,34],[72,38],[86,36],[96,42],[98,62],[94,72],[84,80],[72,86],[62,96],[60,100],[50,98],[44,88],[38,76],[30,66],[18,62],[10,54],[0,44],[18,44]];return`<path d="M${P.map(([x,y])=>f((x-50)*.4)+" "+f((y-50)*.4)).join(" L")}Z" fill="${a}" stroke="${b}" stroke-width="1.4" stroke-linejoin="round"/>`}},
 bandiera:{n:"Bandiera Texas",g:"Texas",d:(a,b)=>`<rect x="-20" y="-13" width="40" height="26" fill="#ffffff"/><rect x="-6.7" y="0" width="26.7" height="13" fill="${b}"/><rect x="-20" y="-13" width="13.3" height="26" fill="${a}"/><path d="${star(5,2)}" transform="translate(-13.3,0)" fill="#ffffff"/><rect x="-20" y="-13" width="40" height="26" fill="none" stroke="#111" stroke-width=".8"/>`},
 cappello:{n:"Cappello cowboy",g:"Cowboy",d:(a,b)=>`<path d="M-10 5 C-11 -5 -9 -13 -5 -13 C-2 -13 -1 -10 0 -10 C1 -10 2 -13 5 -13 C9 -13 11 -5 10 5 Z" fill="${a}"/><rect x="-10.4" y="0" width="20.8" height="3.6" fill="${b}"/><path d="M-21 2 Q-18 12 0 12 Q18 12 21 2 Q16 7 0 7 Q-16 7 -21 2Z" fill="${a}" stroke="${b}" stroke-width=".8"/>`},
 stivale:{n:"Stivale",g:"Cowboy",d:(a,b)=>`<path d="M-9 -19 H6 V2 C6 6 10 8 16 9 C21 10 21 17 16 17 H-9 Z" fill="${a}"/><rect x="-9" y="14" width="7" height="5" fill="${b}"/><path d="M-6 -15 C-2 -11 2 -11 3 -15 M-6 -7 C-2 -3 2 -3 3 -7 M-2 4 C2 8 8 11 14 12" stroke="${b}" stroke-width="1.2" fill="none"/>`},
 ferro:{n:"Ferro di cavallo",g:"Cowboy",d:(a,b)=>`<path d="M-11 16 C-21 0 -15 -17 0 -17 C15 -17 21 0 11 16" stroke="${a}" stroke-width="8" fill="none"/>${[[-14,8],[-16,-2],[-12,-11],[14,8],[16,-2],[12,-11]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.2" fill="${b}"/>`).join("")}`},
 sperone:{n:"Sperone",g:"Cowboy",d:(a,b)=>`<path d="M-20 -4 C-10 -8 2 -8 6 -2 C2 2 -10 2 -20 0 Z" fill="${b}"/><path d="${star(10,4,8)}" transform="translate(11,-1)" fill="${a}" stroke="${b}" stroke-width=".8"/><circle cx="11" cy="-1" r="2" fill="${b}"/>`},
 lazo:{n:"Lazo",g:"Cowboy",d:(a,b)=>`<ellipse rx="17" ry="11" fill="none" stroke="${a}" stroke-width="3.4"/><ellipse rx="17" ry="11" fill="none" stroke="${b}" stroke-width="1" stroke-dasharray="2 3"/><path d="M14 6 C20 12 16 18 8 20" stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round"/>`},
 longhorn:{n:"Teschio longhorn",g:"Cowboy",d:(a,b)=>`<path d="M-3 -6 C-9 -12 -18 -9 -23 -17 C-22 -4 -12 -1 -4 -1 Z M3 -6 C9 -12 18 -9 23 -17 C22 -4 12 -1 4 -1 Z" fill="${a}" stroke="${b}" stroke-width=".8"/><path d="M-7 -6 C-7 -10 7 -10 7 -6 L4.6 12 C2.6 17 -2.6 17 -4.6 12 Z" fill="${a}" stroke="${b}" stroke-width=".8"/><circle cx="-3" cy="0" r="2" fill="${b}"/><circle cx="3" cy="0" r="2" fill="${b}"/><path d="M-1.6 10 h1 M.6 10 h1" stroke="${b}" stroke-width="1.4"/>`},
 cactus:{n:"Cactus",g:"Deserto",d:(a,b)=>`<path d="M0 20 V-16 M0 5 H-9 V-6 M0 -2 H9 V-12" stroke="${a}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M0 18 V-14 M-9 3 V-5 M9 -4 V-11" stroke="${b}" stroke-width=".8" fill="none" opacity=".7"/>`},
 sole:{n:"Sole",g:"Deserto",d:(a,b)=>{let s="";for(let i=0;i<12;i++)s+=`<path d="M-2 -12 L0 -20 L2 -12Z" fill="${a}" transform="rotate(${i*30})"/>`;return s+`<circle r="10" fill="${a}" stroke="${b}" stroke-width="1"/>`}},
 montagne:{n:"Montagne",g:"Deserto",d:(a,b)=>`<path d="M-24 16 L-8 -6 L0 4 L9 -13 L24 16 Z" fill="${a}"/><path d="M-8 -6 L-4 0 L-8 -1 L-11 0 Z M9 -13 L13 -6 L9 -7 L5 -5 Z" fill="${b}"/>`},
 mesa:{n:"Mesa",g:"Deserto",d:(a,b)=>`<path d="M-24 16 L-17 -2 L-14 -6 H2 L5 -2 L9 -4 H14 L18 2 L24 16 Z" fill="${a}"/><path d="M-17 4 H20 M-20 10 H22" stroke="${b}" stroke-width="1.4" opacity=".6"/>`},
 tumbleweed:{n:"Rotolacampo",g:"Deserto",d:(a)=>`<g fill="none" stroke="${a}" stroke-width="1.3">${[0,35,70,105,140].map(r=>`<ellipse rx="15" ry="9" transform="rotate(${r})"/>`).join("")}<circle r="12"/></g>`},
 bluebonnet:{n:"Bluebonnet",g:"Natura",d:(a,b)=>{let s=`<path d="M0 20 C1 8 -1 -4 0 -18" stroke="${b}" stroke-width="2" fill="none"/><path d="M0 14 C-6 12 -9 8 -10 4 M0 12 C6 10 9 6 10 2" stroke="${b}" stroke-width="2.4" fill="none"/>`;for(let i=0;i<7;i++){const y=-16+i*4.4,w=2+i*1.1;s+=`<circle cx="${-w}" cy="${y}" r="${2+i*.25}" fill="${a}"/><circle cx="${w}" cy="${y}" r="${2+i*.25}" fill="${a}"/>`}return s+`<circle cx="0" cy="-18" r="2" fill="#ffffff"/>`}},
 armadillo:{n:"Armadillo",g:"Natura",d:(a,b)=>`<path d="M-14 6 C-14 -10 12 -10 14 6 Z" fill="${a}"/><path d="M-8 6 C-8 -4 -6 -7 -5 -8 M-2 6 V-9 M4 6 C4 -4 6 -7 6 -8" stroke="${b}" stroke-width="1.2" fill="none"/><path d="M14 2 L22 4 L14 6 Z" fill="${a}"/><circle cx="18" cy="3.6" r=".8" fill="${b}"/><path d="M-14 4 C-20 4 -22 8 -24 10" stroke="${a}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-10 6 v4 M8 6 v4" stroke="${a}" stroke-width="2.4"/>`},
 trivella:{n:"Pozzo di petrolio",g:"Città",d:(a,b)=>`<g stroke="${a}" stroke-width="2.2" fill="none" stroke-linejoin="round"><path d="M-10 18 L0 -18 L10 18 M-7.4 8 H7.4 M-4.6 -2 H4.6 M-8.6 13 L6 -6 M8.6 13 L-6 -6"/></g><rect x="-13" y="17" width="26" height="3" fill="${a}"/><rect x="-2.4" y="-21" width="4.8" height="4" fill="${b}"/>`},
 razzo:{n:"Razzo",g:"Città",d:(a,b)=>`<path d="M0 -22 C5 -16 7 -6 7 8 H-7 C-7 -6 -5 -16 0 -22 Z" fill="${a}" stroke="#111" stroke-width=".8"/><path d="M0 -22 C3 -18 4.6 -14 5.2 -10 H-5.2 C-4.6 -14 -3 -18 0 -22 Z" fill="${b}"/><circle cx="0" cy="-3" r="2.6" fill="#111" stroke="${b}" stroke-width=".7"/><path d="M-7 2 L-12 12 L-7 10 Z M7 2 L12 12 L7 10 Z" fill="${b}" stroke="#111" stroke-width=".6"/><rect x="-4.2" y="8" width="8.4" height="2.6" fill="#111"/><path d="M-4 10.6 C-4 18 -1.6 22 0 28 C1.6 22 4 18 4 10.6 Z" fill="#f97316"/><path d="M-2 10.6 C-2 15 -.8 18 0 22 C.8 18 2 15 2 10.6 Z" fill="#fde047"/>`},
 alamo:{n:"Alamo",g:"Città",d:(a,b)=>`<path d="M-20 18 V-2 H-12 C-12 -8 -8 -10 -6 -12 C-4 -16 4 -16 6 -12 C8 -10 12 -8 12 -2 H20 V18 Z" fill="${a}" stroke="${b}" stroke-width=".8"/><path d="M-4 18 V9 A4 4 0 0 1 4 9 V18Z M-15 4 h4 v6 h-4z M11 4 h4 v6 h-4z M-1.6 -7 h3.2 v4 h-3.2z" fill="${b}"/>`},
 skyline:{n:"Skyline",g:"Città",d:(a,b)=>{const B=[[-24,6],[-19,-4],[-13,2],[-8,-14],[-2,-6],[3,-18],[9,-2],[14,-10],[19,0]];let s="";B.forEach(([x,y])=>s+=`<rect x="${x}" y="${y}" width="5.4" height="${18-y}" fill="${a}"/>`);for(let i=0;i<14;i++)s+=`<rect x="${-23+((i*7)%44)}" y="${6+(i%3)*4}" width="1.4" height="1.6" fill="${b}"/>`;return s+`<path d="M5.7 -18 V-23" stroke="${a}" stroke-width="1"/>`}},
 mulino:{n:"Mulino a vento",g:"Città",d:(a,b)=>`<path d="M-6 20 L-1.6 -8 H1.6 L6 20 M-4.4 10 H4.4 M-3.2 2 H3.2" stroke="${a}" stroke-width="1.8" fill="none"/>${Array.from({length:12},(_,i)=>`<path d="M0 -10 L-1.6 -22 L1.6 -22Z" fill="${a}" transform="rotate(${i*30} 0 -10)"/>`).join("")}<circle cy="-10" r="2.4" fill="${b}"/><path d="M2 -10 H14 L18 -13 V-7 L14 -10" fill="${a}" stroke="${a}" stroke-width="1"/>`},
 chitarra:{n:"Chitarra",g:"Musica",d:(a,b)=>`<rect x="-1.6" y="-22" width="3.2" height="20" fill="${b}"/><rect x="-2.6" y="-25" width="5.2" height="5" rx="1" fill="${b}"/><circle cy="2" r="8" fill="${a}"/><circle cy="12" r="10" fill="${a}"/><circle cy="4" r="3" fill="${b}"/><rect x="-4" y="14" width="8" height="2" fill="${b}"/>`},
 papera:{n:"Papera",g:"Ducks",d:(a,b)=>`<path d="M-8 18 C-18 14 -18 -2 -8 -4 C-14 -10 -10 -20 -1 -19 C8 -18 10 -10 6 -5 C14 -4 20 4 16 14 C12 20 0 20 -8 18 Z" fill="${a}" stroke="#111" stroke-width="1"/><path d="M5 -11 C12 -12 18 -10 20 -8 C16 -6 10 -6 5 -7 Z" fill="${b}" stroke="#111" stroke-width=".8"/><circle cx="0" cy="-12" r="2.2" fill="#111"/><circle cx=".6" cy="-12.6" r=".7" fill="#fff"/><path d="M-4 6 C2 4 8 6 12 10" stroke="#111" stroke-width="1" fill="none"/>`},
 pallone:{n:"Pallone",g:"Ducks",d:(a,b)=>`<circle r="17" fill="${a}" stroke="${b}" stroke-width="1.4"/><path d="M-17 0 H17 M0 -17 V17 M-12 -12 C-5 -5 -5 5 -12 12 M12 -12 C5 -5 5 5 12 12" stroke="${b}" stroke-width="1.4" fill="none"/>`},
 canestro:{n:"Canestro",g:"Ducks",d:(a,b)=>`<rect x="-16" y="-18" width="32" height="20" rx="1.5" fill="none" stroke="${a}" stroke-width="2"/><rect x="-6" y="-10" width="12" height="9" fill="none" stroke="${a}" stroke-width="1.4"/><ellipse cy="2" rx="8" ry="2" fill="none" stroke="${b}" stroke-width="2"/><path d="M-8 2 L-5 16 M8 2 L5 16 M-4 2 L-2 16 M4 2 L2 16 M-6 9 H6" stroke="${a}" stroke-width=".9" fill="none"/>`},
 stelline:{n:"Stelline",g:"Forme",d:(a,b)=>[[-12,-8,7],[6,-12,5],[14,4,6],[-4,8,8],[-16,12,4]].map(([x,y,r])=>`<path d="${star(r,r*.4)}" transform="translate(${x},${y})" fill="${a}" stroke="${b}" stroke-width=".6"/>`).join("")},
 cerchio:{n:"Cerchio",g:"Forme",d:(a,b)=>`<circle r="17" fill="none" stroke="${a}" stroke-width="4"/><circle r="12.6" fill="none" stroke="${b}" stroke-width="1"/>`},
 scudo:{n:"Scudo",g:"Forme",d:(a,b)=>`<path d="M0 -20 L17 -14 C17 4 10 14 0 20 C-10 14 -17 4 -17 -14 Z" fill="${a}" stroke="${b}" stroke-width="1.6"/><path d="M0 -15 L12.6 -10.6 C12.6 2 8 10 0 15 C-8 10 -12.6 2 -12.6 -10.6 Z" fill="none" stroke="${b}" stroke-width=".8"/>`},
 fascia:{n:"Fascia",g:"Forme",d:(a,b)=>`<rect x="-70" y="-5" width="140" height="10" fill="${a}"/><path d="M-70 -5 H70 M-70 5 H70" stroke="${b}" stroke-width="1.4"/>`},
 filo:{n:"Filo spinato",g:"Forme",d:(a)=>{let s=`<path d="M-70 -1 C-60 3 -50 -3 -40 1 S-20 -3 -10 1 S10 -3 20 1 S40 -3 50 1 S70 -1 70 -1 M-70 1 C-60 -3 -50 3 -40 -1 S-20 3 -10 -1 S10 3 20 -1 S40 3 50 -1 S70 1 70 1" stroke="${a}" stroke-width="1" fill="none"/>`;for(let x=-60;x<=60;x+=15)s+=`<path d="M${x-2.4} -3 L${x+2.4} 3 M${x+2.4} -3 L${x-2.4} 3" stroke="${a}" stroke-width="1.1"/>`;return s}},
 fulmine:{n:"Fulmine",g:"Forme",d:(a,b)=>`<path d="M4 -20 L-10 2 H-1 L-5 20 L11 -4 H2 Z" fill="${a}" stroke="${b}" stroke-width="1.2" stroke-linejoin="round"/>`},
 fiamma:{n:"Fiamma",g:"Forme",d:(a,b)=>`<path d="M0 20 C-12 18 -14 6 -8 -2 C-8 4 -4 6 -4 6 C-6 -6 0 -14 4 -20 C4 -10 14 -6 12 6 C12 14 6 20 0 20 Z" fill="${a}"/><path d="M0 18 C-5 16 -6 10 -3 6 C-2 10 2 10 2 4 C6 8 6 16 0 18 Z" fill="${b}"/>`},
 testo:{n:"Scritta",g:"Scritte",d:(a,b,e)=>`<text x="0" y="6" text-anchor="middle" font-family="${FONT[e.font||"sport"]}" font-weight="800" ${(e.font||"sport")==="sport"?'font-style="italic"':""} font-size="16" fill="${a}" stroke="${b}" stroke-width="${e.st==null?1.6:e.st}" paint-order="stroke">${esc(e.txt||"TEXAS")}</text>`},
};
const FONT={sport:"Barlow Condensed,Arial Narrow,Arial,sans-serif",western:"Rye,Georgia,serif",classica:"Georgia,Times New Roman,serif",college:"Graduate,Rockwell,Georgia,serif",block:"Arial Black,Impact,Arial,sans-serif"};
/* ===== FANTASIE su tutta la maglia · c = colore, o = intensità (0–1), c2 = secondo colore ===== */
const PAT={
 nessuna:{n:"Nessuna",d:()=>""},
 righe:{n:"Righe verticali",d:(c,o)=>{let s="";for(let x=6;x<120;x+=9)s+=`<rect x="${x}" y="0" width="2.4" height="146" fill="${c}" opacity="${o}"/>`;return s}},
 gessato:{n:"Gessato",d:(c,o)=>{let s="";for(let x=5;x<120;x+=6)s+=`<rect x="${x}" y="0" width=".8" height="146" fill="${c}" opacity="${o}"/>`;return s}},
 orizz:{n:"Righe orizzontali",d:(c,o)=>{let s="";for(let y=40;y<146;y+=14)s+=`<rect x="0" y="${y}" width="120" height="5" fill="${c}" opacity="${o}"/>`;return s}},
 diag:{n:"Diagonali",d:(c,o)=>{let s="";for(let x=-146;x<120;x+=12)s+=`<path d="M${x} 146 L${x+146} 0" stroke="${c}" stroke-width="3.4" opacity="${o}"/>`;return s}},
 fasciadiag:{n:"Fascia diagonale",d:(c,o,c2)=>`<path d="M-10 120 L130 20 L130 50 L-10 150 Z" fill="${c}" opacity="${o}"/><path d="M-10 115 L130 15 M-10 155 L130 55" stroke="${c2}" stroke-width="2" opacity="${o}"/>`},
 banda:{n:"Banda centrale",d:(c,o,c2)=>`<rect x="0" y="66" width="120" height="22" fill="${c}" opacity="${o}"/><rect x="0" y="63" width="120" height="2" fill="${c2}" opacity="${o}"/><rect x="0" y="89" width="120" height="2" fill="${c2}" opacity="${o}"/>`},
 split:{n:"Metà e metà",d:(c,o)=>`<rect x="60" y="0" width="60" height="146" fill="${c}" opacity="${o}"/>`},
 lonestar:{n:"Lone Star (bandiera)",d:(c,o,c2)=>`<rect x="0" y="0" width="42" height="146" fill="${c}" opacity="${o}"/><rect x="42" y="78" width="78" height="68" fill="${c2}" opacity="${o}"/>`},
 pois:{n:"Pois",d:(c,o)=>{let s="";for(let y=6;y<146;y+=10)for(let x=(y/10%2)*5+4;x<120;x+=10)s+=`<circle cx="${x}" cy="${y}" r="1.7" fill="${c}" opacity="${o}"/>`;return s}},
 stelle:{n:"Stelle sparse",d:(c,o)=>{const r=rng(7);let s="";for(let i=0;i<34;i++){const x=r()*120,y=r()*146,z=1.6+r()*3;s+=`<path d="${star(z,z*.4)}" transform="translate(${f(x)},${f(y)})" fill="${c}" opacity="${o}"/>`}return s}},
 cielo:{n:"Cielo stellato",d:(c,o)=>{const r=rng(11);let s="";for(let i=0;i<70;i++)s+=`<circle cx="${f(r()*120)}" cy="${f(r()*146)}" r="${f(.3+r()*.9)}" fill="${c}" opacity="${f(o*(.5+r()*.5))}"/>`;return s}},
 zigzag:{n:"Zigzag",d:(c,o)=>{let s="";for(let y=50;y<146;y+=18){let d=`M0 ${y}`;for(let x=0;x<=120;x+=10)d+=` L${x} ${y+((x/10)%2?6:0)}`;s+=`<path d="${d}" stroke="${c}" stroke-width="3" fill="none" opacity="${o}"/>`}return s}},
 scacchi:{n:"Scacchi",d:(c,o)=>{let s="";for(let y=0;y<146;y+=10)for(let x=((y/10)%2)*10;x<120;x+=20)s+=`<rect x="${x}" y="${y}" width="10" height="10" fill="${c}" opacity="${o}"/>`;return s}},
 camo:{n:"Mimetica deserto",d:(c,o,c2)=>{const r=rng(5);let s="";for(let i=0;i<26;i++){const x=r()*120,y=r()*146,w=8+r()*12,h=5+r()*8;s+=`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(w)}" ry="${f(h)}" transform="rotate(${f(r()*180)} ${f(x)} ${f(y)})" fill="${i%2?c:c2}" opacity="${o}"/>`}return s}},
 mucca:{n:"Pelle di mucca",d:(c,o)=>{const r=rng(3);let s="";for(let i=0;i<12;i++){const x=r()*120,y=r()*146;let d="";for(let k=0;k<8;k++){const a=k/8*Math.PI*2,R=7+r()*7;d+=(k?"L":"M")+f(x+Math.cos(a)*R)+" "+f(y+Math.sin(a)*R)}s+=`<path d="${d}Z" fill="${c}" opacity="${o}" stroke-linejoin="round" stroke="${c}" stroke-width="3"/>`}return s}},
 dune:{n:"Dune",d:(c,o,c2)=>`<path d="M0 104 C30 92 50 110 80 98 C100 90 110 96 120 92 V146 H0Z" fill="${c}" opacity="${o}"/><path d="M0 120 C26 112 60 128 90 116 C104 110 114 114 120 112 V146 H0Z" fill="${c2}" opacity="${o}"/>`},
 tramonto:{n:"Sole al tramonto",d:(c,o,c2)=>{let s=`<circle cx="60" cy="104" r="30" fill="${c}" opacity="${o}"/>`;for(let i=0;i<5;i++)s+=`<rect x="0" y="${96+i*7}" width="120" height="${2+i*.6}" fill="${c2}" opacity="${o}"/>`;return s}},
 raggi:{n:"Raggi",d:(c,o)=>{let s="";for(let i=0;i<18;i++)s+=`<path d="M60 70 L${f(60+Math.cos(i/18*6.283)*160)} ${f(70+Math.sin(i/18*6.283)*160)} L${f(60+Math.cos((i+.5)/18*6.283)*160)} ${f(70+Math.sin((i+.5)/18*6.283)*160)}Z" fill="${c}" opacity="${o}"/>`;return s}},
 onde:{n:"Onde",d:(c,o)=>{let s="";for(let y=44;y<146;y+=12)s+=`<path d="M0 ${y} C15 ${y-6} 25 ${y+6} 40 ${y} S65 ${y+6} 80 ${y} S105 ${y-6} 120 ${y}" stroke="${c}" stroke-width="2.4" fill="none" opacity="${o}"/>`;return s}},
 montagne:{n:"Montagne in fondo",d:(c,o,c2)=>`<path d="M0 112 L18 96 L30 104 L48 86 L64 100 L80 90 L98 104 L120 92 V146 H0Z" fill="${c}" opacity="${o}"/><path d="M0 126 L22 114 L40 122 L60 110 L84 124 L104 114 L120 120 V146 H0Z" fill="${c2}" opacity="${o}"/>`},
};
/* ===== BORDI (collo e spalline) ===== */
const TR={
 classico:{n:"Classico",s:{}},sottile:{n:"Sottile",s:{nw:4,aw:4}},spesso:{n:"Spesso",s:{nw:9,aw:9}},
 doppio:{n:"Doppio filetto",s:{lines:[["b",1.6,"c"]]}},interno:{n:"Filetto interno",s:{lines:[["b",1.4,"in"]]}},
 triplo:{n:"Triplo spesso (Stella)",s:{nw:12,aw:12,lines:[["b",7,"c"],["a",3,"c"]]}},
 vintage:{n:"Vintage",s:{nw:7,aw:7,lines:[["b",3.4,"c"],["a",1.2,"c"]],hem:[[119,2,"a"],[123,2,"a"]]}},
 spalla:{n:"Spalla piena",s:{fill:12,lines:[["b",1.6,"c"]]}},
 fianchi:{n:"Fianchi",s:{side:[5,"a","b"]}},
 fondo:{n:"Fondo a riga",s:{hem:[[118,3,"a"],[123,1.5,"b"]]}},
 minimal:{n:"Minimal",s:{nw:3,aw:3}},
 nessuno:{n:"Nessuno",s:{none:1}},
};
function trims(S,a,b){const C=n=>n==="a"?a:n==="b"?b:n;const line=(d,col,w)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;let t="",l="";if(S.none)return{t,l};const nw=S.nw||6,aw=S.aw||6;
 if(S.fill)t+=`<path d="M22 12 C23 34 16 46 6 50 L6 ${50+S.fill} C${18+S.fill*.3} ${46+S.fill*.6} ${26+S.fill*.4} 32 ${27+S.fill*.4} 12 Z M98 12 C97 34 104 46 114 50 L114 ${50+S.fill} C${102-S.fill*.3} ${46+S.fill*.6} ${94-S.fill*.4} 32 ${93-S.fill*.4} 12 Z" fill="${a}"/>`;
 t+=line(NECK,a,nw)+line(ARM,a,aw);(S.lines||[]).forEach(([col,w,pos])=>{const n=pos==="in"?NECK_IN:NECK,m=pos==="in"?ARM_IN:ARM;t+=line(n,C(col),w)+line(m,C(col),w)});
 if(S.hem)S.hem.forEach(([y,h,col])=>l+=`<rect x="0" y="${y}" width="120" height="${h}" fill="${C(col)}"/>`);
 if(S.side)l+=`<path d="M6 50 C${10+S.side[0]} 62 ${10+S.side[0]} 96 ${8+S.side[0]} 146 H0 V50 Z M114 50 C${110-S.side[0]} 62 ${110-S.side[0]} 96 ${112-S.side[0]} 146 H120 V50 Z" fill="${C(S.side[1])}"/>`+(S.side[2]?`<path d="M${8+S.side[0]} 60 C${11+S.side[0]} 80 ${11+S.side[0]} 110 ${9+S.side[0]} 146 M${112-S.side[0]} 60 C${109-S.side[0]} 80 ${109-S.side[0]} 110 ${111-S.side[0]} 146" stroke="${C(S.side[2])}" stroke-width="1.4" fill="none"/>`:"");
 return{t,l}}
let N=0;
function elSvg(e,i){const D=EL[e.k];if(!D)return"";const s=e.s||1;return`<g data-li="${i}" transform="translate(${f(e.x)},${f(e.y)}) rotate(${f(e.r||0)}) scale(${f(s*(e.fx?-1:1))},${f(s*(e.fy?-1:1))})" opacity="${e.o==null?1:e.o}">${D.d(e.a||"#111111",e.b||"#ffffff",e)}</g>`}
/* d: {bg:[c1,c2,c3], gd:"v"|"h"|"d"|"r", tr:{k,a,b}, pat:{k,c,c2,o}, els:[...], w:{on,txt,font,c,st,s,y,arc}, nm:{on,c,st,s,y,font}, img:{t,code}, sh:ombre 0..1} */
function labSvg(d,num,opt){opt=opt||{};const k="lb"+(N++);d=d||{};const bg=(d.bg&&d.bg.length?d.bg:["#facc15"]);const g=bg.length>1?bg:[bg[0],bg[0]];
 const stops=g.map((c,i)=>`<stop offset="${i/(g.length-1)}" stop-color="${c}"/>`).join("");
 const gd=d.gd||"v",gx=gd==="h"?1:gd==="d"?1:0,gy=gd==="h"?0:1;
 const grad=gd==="r"?`<radialGradient id="${k}b" cx=".5" cy=".42" r=".7">${stops}</radialGradient>`:`<linearGradient id="${k}b" x1="0" y1="0" x2="${gx}" y2="${gy}">${stops}</linearGradient>`;
 const tr=d.tr||{},TS=(TR[tr.k||"classico"]||TR.classico).s,T=trims(TS,tr.a||"#111111",tr.b||"#ffffff");
 const P=d.pat&&PAT[d.pat.k]?PAT[d.pat.k].d(d.pat.c||"#111111",d.pat.o==null?.35:d.pat.o,d.pat.c2||"#ffffff"):"";
 const E=d.els||[],sotto=E.map((e,i)=>e.top?"":elSvg(e,i)).join(""),sopra=E.map((e,i)=>e.top?elSvg(e,i):"").join("");
 const w=d.w||{},nm=d.nm||{},n=num==null?"1":String(num);const sh=d.sh==null?1:d.sh;
 const wf=w.font||"sport",nf=nm.font||"sport",ital=x=>x==="sport"?' font-style="italic"':"";
 const ws=w.s||17,txt=esc(w.txt==null?"TEXAS":w.txt),wy=w.y==null?58:w.y;
 const word=w.on===false||!txt?"":w.arc?`<path id="${k}a" d="M18 ${wy+8} Q60 ${wy-16} 102 ${wy+8}" fill="none"/><text font-family="${FONT[wf]}" font-weight="800"${ital(wf)} font-size="${ws}" letter-spacing=".6" fill="${w.c||"#111111"}" stroke="${w.st||"#ffffff"}" stroke-width="${w.sw==null?2.6:w.sw}" paint-order="stroke" text-anchor="middle"><textPath href="#${k}a" startOffset="50%">${txt}</textPath></text>`
  :`<text x="60" y="${wy}" font-family="${FONT[wf]}" font-weight="800"${ital(wf)} text-anchor="middle" font-size="${ws}" letter-spacing=".6" fill="${w.c||"#111111"}" stroke="${w.st||"#ffffff"}" stroke-width="${w.sw==null?2.6:w.sw}" paint-order="stroke" textLength="${f(Math.min(74,txt.length*ws*.52))}" lengthAdjust="spacingAndGlyphs">${txt}</text>`;
 const ns=(nm.s||44)*(n.length>1?.88:1);
 const numb=nm.on===false?"":`<text x="60" y="${nm.y==null?102:nm.y}" font-family="${FONT[nf]}" font-weight="800"${ital(nf)} text-anchor="middle" font-size="${f(ns)}" fill="${nm.c||"#111111"}" stroke="${nm.st||"#ffffff"}" stroke-width="${nm.sw==null?3.4:nm.sw}" paint-order="stroke">${esc(n)}</text>`;
 let base="";if(d.img&&window.PREMI){try{base=(d.img.code>=900?"":PREMI.svg(d.img.t||"DUC",d.img.code,n))||""}catch(e){base=""}}
 /* (1260) sulle maglie scure la trama del tessuto è a puntini chiari (i puntini neri sul nero non si vedevano) */const lum=h=>{const m=/^#([0-9a-f]{6})$/i.exec(h||"");if(!m)return 1;const n=parseInt(m[1],16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};const dark=g.reduce((t,c)=>t+lum(c),0)/g.length<.3;
 const shade=sh?`<rect width="120" height="146" fill="url(#${k}m)" opacity="${sh}"/><rect width="120" height="146" fill="url(#${k}s)" opacity="${sh}"/><rect width="120" height="146" fill="url(#${k}v)" opacity="${sh}"/>`:"";
 const defs=`<defs>${grad}<linearGradient id="${k}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset=".78" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient><linearGradient id="${k}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><pattern id="${k}m" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".55" fill="${dark?"#fff":"#000"}" fill-opacity="${dark?".11":".14"}"/></pattern><clipPath id="${k}c"><path d="${BODY}"/></clipPath><filter id="${k}d"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
 const inner=base?`${base.replace(/^<svg /,'<svg width="120" height="146" ')}<g clip-path="url(#${k}c)">${sotto}${sopra}</g>`
  :`<ellipse cx="60" cy="136" rx="46" ry="5" fill="#000" opacity=".5" filter="url(#${k}d)"/><path d="${BODY}" fill="url(#${k}b)"/><g clip-path="url(#${k}c)">${P}${T.l}${sotto}${shade}</g><g clip-path="url(#${k}c)">${T.t}</g><g>${word}${numb}</g><g clip-path="url(#${k}c)">${sopra}</g>`;
 return`<svg viewBox="0 0 120 146" xmlns="http://www.w3.org/2000/svg"${opt.attr||' aria-hidden="true"'}>${defs}${inner}</svg>`}
/* ===== BASI di partenza (tutte modificabili) ===== */
const Y="#facc15",K="#111111",W="#ffffff",GOLD="#ca8a04",BLU="#1e3a8a",RED="#b91c1c";
const sky={gialla:["#fde047","#facc15","#eab308"],nera:["#000000","#0b0b0b","#1c1c1c"],bianca:["#ffffff","#f8fafc","#f1f5f9"]};
const col={gialla:{a:K,b:W,fg:K,st:W},nera:{a:Y,b:K,fg:Y,st:K},bianca:{a:K,b:Y,fg:K,st:Y}};
const base=(c,x)=>Object.assign({bg:sky[c].slice(),gd:"v",tr:{k:"classico",a:col[c].a,b:col[c].b},pat:{k:"nessuna"},els:[],w:{txt:"TEXAS",c:col[c].fg,st:col[c].st},nm:{c:col[c].fg,st:col[c].st},sh:1},x);
const BASI=[
 ["Vuota gialla",base("gialla",{})],["Vuota nera",base("nera",{})],["Vuota bianca",base("bianca",{})],
 ["Stella sceriffo gialla",base("gialla",{tr:{k:"triplo",a:K,b:W},els:[{k:"sceriffo",x:60,y:80,s:1.5,a:"#eab308",b:"#ca8a04",o:.5}]})],
 ["Stella sceriffo nera",base("nera",{tr:{k:"triplo",a:Y,b:K},els:[{k:"sceriffo",x:60,y:80,s:1.5,a:"#1c1c1c",b:"#262626",o:.9}]})],
 ["Stella sceriffo bianca",base("bianca",{tr:{k:"triplo",a:K,b:Y},els:[{k:"sceriffo",x:60,y:80,s:1.5,a:"#e5e7eb",b:"#d4d4d8",o:.9}]})],
 ["Lone Star",base("bianca",{tr:{k:"doppio",a:BLU,b:RED},pat:{k:"lonestar",c:BLU,c2:RED,o:1},els:[{k:"stella",x:21,y:62,s:.7,a:W,b:W}],w:{txt:"TEXAS",c:W,st:BLU},nm:{c:W,st:BLU}})],
 ["Rampa (razzo)",base("gialla",{pat:{k:"cielo",c:K,o:.5},els:[{k:"montagne",x:60,y:118,s:3,a:"#92400e",b:"#fde68a"},{k:"razzo",x:94,y:96,s:1,a:W,b:K}]})],
 ["Via Lattea",base("nera",{pat:{k:"cielo",c:W,o:.9},els:[{k:"razzo",x:92,y:46,s:.6,r:28,a:W,b:Y},{k:"montagne",x:60,y:124,s:3.2,a:"#3a3a3a",b:Y}]})],
 ["Deserto",base("gialla",{bg:["#fde68a","#fbbf24","#d97706"],pat:{k:"dune",c:"#b45309",c2:"#92400e",o:.7},els:[{k:"sole",x:60,y:76,s:1.4,a:"#fef3c7",b:"#f59e0b",o:.8},{k:"cactus",x:24,y:110,s:1,a:"#14532d",b:"#4ade80"},{k:"cactus",x:98,y:114,s:.8,a:"#14532d",b:"#4ade80",fx:1}]})],
 ["Rodeo",base("nera",{bg:["#3f2a14","#2a1a0b","#1c1208"],tr:{k:"vintage",a:Y,b:"#7c2d12"},pat:{k:"mucca",c:"#ffffff",o:.12},els:[{k:"ferro",x:60,y:80,s:1.4,a:Y,b:K,o:.35},{k:"cappello",x:60,y:30,s:.0001,a:Y,b:K}],w:{txt:"TEXAS",font:"western",c:Y,st:K,s:15},nm:{c:Y,st:K,font:"western"}})],
 ["Longhorn",base("bianca",{bg:["#fff7ed","#fed7aa","#fdba74"],tr:{k:"spesso",a:"#7c2d12",b:W},els:[{k:"longhorn",x:60,y:82,s:1.7,a:"#7c2d12",b:"#fff7ed",o:.35}],w:{txt:"TEXAS",c:"#7c2d12",st:W,font:"college"},nm:{c:"#7c2d12",st:W,font:"college"}})],
 ["Petrolio",base("nera",{tr:{k:"fianchi",a:Y,b:K},pat:{k:"gessato",c:Y,o:.25},els:[{k:"trivella",x:60,y:84,s:1.6,a:"#262626",b:Y,o:.9}]})],
 ["Alamo",base("bianca",{bg:["#f5f5f4","#e7e5e4","#d6d3d1"],tr:{k:"doppio",a:"#57534e",b:Y},els:[{k:"alamo",x:60,y:108,s:2,a:"#d6d3d1",b:"#a8a29e",o:.8}],w:{txt:"TEXAS",c:K,st:Y,font:"classica"}})],
 ["Bluebonnet",base("bianca",{tr:{k:"doppio",a:"#1e40af",b:Y},els:[{k:"bluebonnet",x:22,y:110,s:1.1,a:"#2563eb",b:"#15803d"},{k:"bluebonnet",x:100,y:114,s:.9,a:"#2563eb",b:"#15803d",fx:1}],w:{txt:"TEXAS",c:"#1e40af",st:Y},nm:{c:"#1e40af",st:Y}})],
 ["Mappa Texas",base("gialla",{tr:{k:"spalla",a:K,b:W},els:[{k:"texas",x:60,y:82,s:2,a:"#eab308",b:"#ca8a04",o:.7},{k:"stella",x:62,y:96,s:.3,a:K,b:K}]})],
 ["Mimetica",base("gialla",{bg:["#d6c08a","#b9a26a","#8c7a4a"],tr:{k:"spesso",a:"#3f3a24",b:Y},pat:{k:"camo",c:"#6b5d33",c2:"#e6d5a3",o:.7},w:{txt:"TEXAS",c:Y,st:K},nm:{c:Y,st:K}})],
 ["Tramonto",base("nera",{bg:["#1e1b4b","#7c2d12","#f97316"],tr:{k:"classico",a:Y,b:K},pat:{k:"tramonto",c:Y,c2:"#7c2d12",o:.8},els:[{k:"cactus",x:20,y:112,s:1.1,a:K,b:K},{k:"mulino",x:100,y:108,s:1,a:K,b:K}]})],
 ["Skyline",base("gialla",{tr:{k:"fondo",a:K,b:W},els:[{k:"skyline",x:60,y:124,s:2.6,a:K,b:Y,o:.85}]})],
 ["Retro Ducks",base("gialla",{tr:{k:"vintage",a:K,b:W},pat:{k:"righe",c:K,o:.12},els:[{k:"papera",x:60,y:84,s:1.3,a:Y,b:"#f97316",o:.25}],w:{txt:"DUCKS",font:"college",c:K,st:W}})],
];
BASI.forEach(([n,d])=>{d.els=d.els.filter(e=>e.s>.01)});
window.LAB={labSvg,EL,PAT,TR,FONT,BASI,BODY};window.labSvg=labSvg;
})();
