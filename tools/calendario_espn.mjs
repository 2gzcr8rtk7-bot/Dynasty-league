// Calendario NBA da ESPN per Dynasty TV (tv-data.js): partite IN PROGRAMMA dei prossimi giorni.
// Lo lancia GitHub (workflow .github/workflows/calendario.yml) ogni giorno: nessun costo Claude.
//   node tools/calendario_espn.mjs            da oggi (data USA) per 45 giorni
//   node tools/calendario_espn.mjs --giorni=10 --prova
// REGOLE: tocca SOLO i giorni in cui nessuna partita è iniziata (tutte "S" e senza tabellino).
// I giorni con partite live/finite (risultati e tabellini ufficiali Dunkest) non vengono mai modificati.
import { readFileSync, writeFileSync } from "node:fs";

const ARG = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const GIORNI = +(ARG.giorni || 45);
const ESPN_AB = { GS: "GSW", NY: "NYK", NO: "NOP", SA: "SAS", UTAH: "UTA", WSH: "WAS" }, esAb = a => ESPN_AB[a] || a;

const src = readFileSync("tv-data.js", "utf8");
const i0 = src.indexOf("const TV="), j0 = src.indexOf("{", i0);
let d = 0, q = false, e = j0;
for (; e < src.length; e++) { const c = src[e]; if (q) { if (c === "\\") { e++; continue; } if (c === '"') q = false; continue; }
  if (c === '"') q = true; else if (c === "{") d++; else if (c === "}" && --d === 0) break; }
const TV = JSON.parse(src.slice(j0, e + 1));

const ymd = (dt, tz) => dt.toLocaleDateString("en-CA", { timeZone: tz });
const oraIt = iso => { const t = new Date(iso);
  const hm = t.toLocaleTimeString("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const us = ymd(t, "America/New_York"), it = ymd(t, "Europe/Rome");
  const n = Math.round((Date.parse(it) - Date.parse(us)) / 864e5); return n > 0 ? `${hm}+${n}` : hm; };

async function get(url) {
  for (let k = 0; k < 4; k++) { try { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (DreamersCalendario)" } }); if (r.ok) return await r.json(); } catch (x) {}
    await new Promise(r => setTimeout(r, 1500 * (k + 1))); }
  return null;
}

const oggi = ymd(new Date(), "America/New_York");
let cambiati = [], saltati = 0, errori = 0;
for (let k = 0; k < GIORNI; k++) {
  const dt = new Date(Date.parse(oggi + "T12:00:00Z") + k * 864e5), day = dt.toISOString().slice(0, 10);
  const old = TV.days[day] || [];
  if (old.some(g => g[5] !== "S" || g[2] != null || (g[7] && TV.box[g[7]]))) { saltati++; continue; } // giorno già iniziato: non si tocca
  const J = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${day.replace(/-/g, "")}`);
  if (!J) { errori++; continue; }
  const nuovi = [];
  if ((J.events || []).some(ev => { const st = ((ev.status || {}).type || {}).state; return st && st !== "pre"; })) { saltati++; continue; } // giornata già cominciata su ESPN
  for (const ev of J.events || []) {
    const c = (ev.competitions || [])[0]; if (!c || !c.competitors) continue;
    const H = c.competitors.find(x => x.homeAway === "home"), A = c.competitors.find(x => x.homeAway === "away"); if (!H || !A) continue;
    const a = esAb(A.team.abbreviation), h = esAb(H.team.abbreviation);
    if (!TV.teams[a] || !TV.teams[h]) continue; // All-Star, squadre non NBA, ecc.
    if (ymd(new Date(ev.date), "America/New_York") !== day) continue;
    nuovi.push([a, h, null, null, 0, "S", oraIt(ev.date), ""]);
  }
  if (!nuovi.length) continue; // ESPN vuoto: si lascia com'era (nessuna cancellazione)
  nuovi.sort((x, y) => { const v = s => { const [hm, n] = s.split("+"); return (+n || 0) * 1440 + (+hm.slice(0, 2)) * 60 + +hm.slice(3, 5); }; return v(x[6]) - v(y[6]); });
  if (JSON.stringify(nuovi) !== JSON.stringify(old)) { TV.days[day] = nuovi; cambiati.push(`${day} (${old.length}→${nuovi.length})`); }
}
// chiavi dei giorni in ordine
TV.days = Object.fromEntries(Object.entries(TV.days).sort(([x], [y]) => x < y ? -1 : 1));
console.log(`Calendario ESPN da ${oggi} per ${GIORNI} giorni · giorni già iniziati non toccati: ${saltati} · errori ESPN: ${errori}`);
console.log(cambiati.length ? "Aggiornati: " + cambiati.join(", ") : "Niente da aggiornare");
if (errori === GIORNI) { console.error("ESPN non risponde"); process.exit(1); }
if (cambiati.length && !ARG.prova) writeFileSync("tv-data.js", src.slice(0, j0) + JSON.stringify(TV) + src.slice(e + 1));
