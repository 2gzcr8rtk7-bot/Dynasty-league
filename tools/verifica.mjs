// Controllo coerenza dei dati del report (lanciato da GitHub a ogni pubblicazione).
// Stampa avvisi visibili nella scheda "Actions" di GitHub; non blocca la pubblicazione.
import { readFileSync } from "node:fs";
const src = readFileSync("index.html", "utf8");
function getConst(name){const i=src.indexOf(`const ${name}=`);if(i<0)return;let j=src.indexOf("=",i)+1,d=0,q=null,st=j;
 for(;j<src.length;j++){const c=src[j];if(q){if(c==="\\"){j++;continue}if(c===q)q=null;continue}if(c=='"'||c=="'"||c=="`"){q=c;continue}
 if(c=="{"||c=="[")d++;else if(c=="}"||c=="]"){d--;if(!d){j++;break}}}return new Function("return "+src.slice(st,j))()}
const EFF=getConst("EFF"),ULTIMA=getConst("ULTIMA"),ROSTER=getConst("ROSTER");const w=[];
for(const[t,a]of Object.entries(EFF.gioc))for(const p of a){const u=ULTIMA.gioc[p[0]];
 if(p[5]!=null&&u!==undefined&&Math.abs(u-p[5])>0.005)w.push(`${p[0]}: efficienza della notte ${p[5]} diversa da ULTIMA ${u}`);
 if(p[2]===1&&u!=null&&Math.abs(u-p[1])>0.015)w.push(`${p[0]}: 1 partita ma media ${p[1]} diversa dall'ultima ${u}`);
 if(p[2]>0&&u===undefined)w.push(`${p[0]}: ha partite ma manca in ULTIMA`);
 if(!(ROSTER[t]||[]).some(r=>r[0]===p[0]))w.push(`${p[0]}: in EFF.gioc.${t} ma non nel roster ${t}`);}
for(const[t,a]of Object.entries(ROSTER))for(const r of a)if(!(EFF.gioc[t]||[]).some(p=>p[0]===r[0]))w.push(`${r[0]}: nel roster ${t} ma manca in EFF.gioc.${t}`);
if(EFF.agg!==ULTIMA.agg)w.push(`EFF.agg (${EFF.agg}) diverso da ULTIMA.agg (${ULTIMA.agg})`);
for(const x of w)console.log(`::warning title=Controllo dati report::${x}`);
console.log(w.length?`${w.length} avvisi`:"Dati coerenti");
