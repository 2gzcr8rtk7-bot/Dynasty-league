// (1566) INFORTUNI NBA da ESPN salvati nell'app (infortuni-data.js, oggetto INFLIVE).
// Lo lancia GitHub ogni 5 minuti (.github/workflows/infortuni.yml, come in ESPN 16): nessuno deve farlo a mano.
// I telefoni rileggono ESPN da soli ogni 30 secondi mentre l'app è aperta; questo file serve quando il telefono non raggiunge ESPN
// e la sua ora di salvataggio (INFLIVE.upd) compare nel report dei dati (tocco sulla riga in fondo all'app).
// Scrive il file SOLO se la lista è cambiata (l'ora da sola non conta). Prova a mano: node tools/infortuni.mjs [--prova]
// Formato: INFLIVE = {upd:"GG/MM/AAAA · HH:MM" (ora italiana del salvataggio), n: quanti, injuries:[{injuries:[...]}]}
//   cioè la stessa forma della risposta ESPN (solo i campi che legge l'app), così il telefono usa lo stesso codice (injApply in index.html).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const OUT = "infortuni-data.js", URL_INJ = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries";
let J = null, err = "";
for (let i = 0; i < 4 && !J; i++) {
  try { const r = await fetch(URL_INJ, { headers: { "User-Agent": "dreamers-report" }, signal: AbortSignal.timeout(20000) }); if (r.ok) J = await r.json(); else err = "HTTP " + r.status; }
  catch (e) { err = e.message; }
  if (!J) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
}
if (!J || !Array.isArray(J.injuries)) { console.log(`ERRORE: infortuni ESPN non raggiungibili (${err}): file non toccato`); process.exit(1); }
const L = [];
for (const tm of J.injuries) for (const x of tm.injuries || []) { const a = x.athlete || {}, d = x.details || {}, fs = d.fantasyStatus || {};
  if (!a.displayName) continue;
  L.push({ athlete: { displayName: a.displayName, team: { abbreviation: (a.team && a.team.abbreviation) || "" } }, status: x.status || "", shortComment: x.shortComment || "",
    longComment: x.longComment || "", date: x.date || "",
    details: { type: d.type || "", location: d.location || "", detail: d.detail || "", side: d.side || "", returnDate: d.returnDate || "",
      fantasyStatus: { description: fs.description || "", abbreviation: fs.abbreviation || "" } } }); }
if (L.length < 5) { console.log(`ERRORE: lista infortuni ESPN troppo corta (${L.length}): file non toccato`); process.exit(1); }
L.sort((a, b) => (a.athlete.team.abbreviation + a.athlete.displayName).localeCompare(b.athlete.team.abbreviation + b.athlete.displayName));
let old = null; if (existsSync(OUT)) { try { old = new Function(readFileSync(OUT, "utf8") + ";return INFLIVE")(); } catch (e) {} }
if (old && JSON.stringify(old.injuries) === JSON.stringify([{ injuries: L }])) { console.log(`Infortuni ESPN: nessuna novità (${L.length})`); process.exit(0); }
const now = new Date(), p = k => now.toLocaleString("it-IT", { timeZone: "Europe/Rome", ...k });
const INFLIVE = { upd: `${p({ day: "2-digit", month: "2-digit", year: "numeric" })} · ${p({ hour: "2-digit", minute: "2-digit", hour12: false })}`, n: L.length, injuries: [{ injuries: L }] };
if (process.argv.includes("--prova")) { console.log(`--prova: ${L.length} infortuni letti, file non scritto`); process.exit(0); }
writeFileSync(OUT, "/* INFORTUNI NBA da ESPN – generato da tools/infortuni.mjs (GitHub ogni 5 minuti, solo se cambia), non modificare a mano */\nconst INFLIVE=" + JSON.stringify(INFLIVE) + ";\n");
console.log(`Infortuni ESPN aggiornati: ${L.length} · ${INFLIVE.upd}`);
