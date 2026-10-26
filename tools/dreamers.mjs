// DREAMERS – genera dreamers-data.js dai report già caricati.
// Lo lancia da solo GitHub (.github/workflows/dreamers.yml) a ogni pubblicazione: non serve farlo a mano.
// Uso manuale (solo per prova, senza fare commit del file):  node tools/dreamers.mjs
// Legge TUTTA la storia git di index.html + la versione attuale, quindi se qualche giorno non è stato lanciato
// recupera da solo le notti mancanti. Si può lanciare quante volte si vuole (rigenera tutto da capo).
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const START = process.env.DREAM_START || "2026-10-26";          // lunedì del turno 1
const FALLBACK = 1600;               // valore per chi non è in VALORI (come il calcolatore)

function getConst(src, name) {
  const i = src.indexOf(`const ${name}=`); if (i < 0) return undefined;
  let j = src.indexOf("=", i) + 1, depth = 0, q = null, start = j;
  for (; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === "\\") { j++; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'" || c === "`") { q = c; continue }
    if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") { depth--; if (depth === 0) { j++; break } }
  }
  try { return new Function("return " + src.slice(start, j))() } catch { return undefined }
}
const iso = d => d.toISOString().slice(0, 10);
const nightOf = agg => { const [g, m, a] = agg.split("/").map(Number); const d = new Date(Date.UTC(a, m - 1, g)); d.setUTCDate(d.getUTCDate() - 1); return iso(d) };
const weekOf = night => Math.floor((Date.parse(night) - Date.parse(START)) / 864e5 / 7) + 1;

function parse(src) {
  const EFF = getConst(src, "EFF"); if (!EFF || !EFF.agg || !EFF.gioc) return null;
  const notte = {};
  for (const a of Object.values(EFF.gioc)) for (const p of a) {
    const dk = p[8];                                // colonna 9 di EFF.gioc = PDK della notte (dal 26/10; la 5 sono i minuti)
    if (dk == null) continue;                       // non ha giocato quella notte
    notte[p[0]] = dk;                               // PDK (punti Dunkest) della partita
  }
  return { agg: EFF.agg, night: nightOf(EFF.agg), notte, ROSTER: getConst(src, "ROSTER"), VALORI: getConst(src, "VALORI") };
}

const byNight = {};
const commits = execSync('git log --reverse --format=%H -- index.html', { encoding: "utf8" }).trim().split("\n").filter(Boolean);
for (const h of commits) {
  let src; try { src = execSync(`git show ${h}:index.html`, { encoding: "utf8", maxBuffer: 64 << 20 }) } catch { continue }
  const r = parse(src); if (r && r.night >= START) byNight[r.night] = r;   // in ordine: vince l'ultima versione di quella notte
}
const cur = parse(readFileSync("index.html", "utf8")); if (cur && cur.night >= START) byNight[cur.night] = cur;
const VAL_NOW = cur?.VALORI || {};

const notti = {}, form = {};
for (const n of Object.keys(byNight).sort()) {
  notti[n] = byNight[n].notte;
  const w = weekOf(n);
  if (!form[w]) {                                       // formazione bloccata alla prima notte del turno
    const R = byNight[n].ROSTER || cur.ROSTER, V = byNight[n].VALORI || VAL_NOW;
    const nz = x => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ş/g, "s").replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").replace(/\s+/g, " ").trim();
    const VM = {}; for (const [k, v] of Object.entries({ ...VAL_NOW, ...V })) VM[nz(k)] = v;
    const val = x => (VM[nz(x)] || [0, FALLBACK])[1];
    form[w] = {};
    for (const [t, a] of Object.entries(R)) {
      const s = a.map(p => p[0]).sort((x, y) => val(y) - val(x));
      form[w][t] = { t: s.slice(0, 10), r: s.slice(10) };
    }
  }
}
const out = `/* DREAMERS – file generato da tools/dreamers.mjs, non modificare a mano. Notti = data NBA (USA). {giocatore: PDK della partita} */
const DREAM_DATA=${JSON.stringify({ notti, form })};
`;
writeFileSync("dreamers-data.js", out);
console.log(`dreamers-data.js: ${Object.keys(notti).length} notti, ${Object.keys(form).length} turni con formazione`);
