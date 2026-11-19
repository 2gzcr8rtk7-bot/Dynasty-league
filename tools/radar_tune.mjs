// (1149) RADAR BREAKOUT – miglioramento automatico. Gira su GitHub ogni giorno dopo i tabellini.
// 1) Prende tutte le date della stagione con almeno 10 giorni di partite dopo (esito completo), ogni 2 giorni.
// 2) Per ogni data calcola i segnali del radar con i SOLI dati di allora (radar-core.js) e chi è esploso nei 10 giorni dopo.
// 3) Cerca i pesi che mettono più esplosi nella top 20 (ricerca casuale + ritocchi), tarando sulle date più vecchie (70%).
// 4) Li prova sulle date più recenti (30%), mai viste in taratura: se fanno meglio dei pesi attuali li adotta a metà strada
//    (pesi attuali + 50% della differenza, per non saltare da un estremo all'altro); altrimenti tiene quelli attuali.
// 5) Ogni lunedì salva la top 20 del giorno (previsione vera, coi pesi di quel giorno): l'app la controlla nelle settimane dopo.
// Scrive radar-pesi.js (const RADAR={...}).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { radarAt, radarEsito } = require("../radar-core.js");

const load = (f, v) => { const src = readFileSync(f, "utf8"); return new Function(src + `;return ${v}`)() };
const TV = load("tv-data.js", "TV");
const G = existsSync("gm-nba.js") ? load("gm-nba.js", "GMNBA") : { ruoli: {}, contratti: {}, idx: {} };
let INFLIVE = null; try { INFLIVE = load("infortuni-data.js", "INFLIVE") } catch { }
const OLD = existsSync("radar-pesi.js") ? (() => { try { return load("radar-pesi.js", "RADAR") } catch { return null } })() : null;

const W0 = { Yoy: .5, P: 1.2, Stk: 1, Use: 1, Room: 2.5, Trend: 2, Path: 1.5, Age: 1.8, Team: .5, Coach: .5 };
const KEYS = ["Yoy", "P", "Stk", "Use", "Room", "Trend", "Path", "Age", "Team"]; // Coach non si tara qui (servono le statistiche allenatori dell'app)
const Wcur = Object.assign({}, W0, (OLD && OLD.W) || {});

const nz = n => String(n).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").replace(/\s+/g, " ").trim();
const lk = (m, n) => m && (m[n] || (G.idx && m[G.idx[nz(n)]])) || null;
const ruolo = n => { const r = lk(G.ruoli, n); const p = r && r.p || ""; return p === "C" ? "C" : /G/.test(p) ? "G" : "F" };
const IM = {}; try { (INFLIVE.injuries || []).forEach(t => (t.injuries || []).forEach(i => { if (/out/i.test(i.status || "")) IM[nz(i.athlete.displayName)] = /week|month|surgery|season|indefinitely|re-evaluated/i.test(i.shortComment || "") ? "fuori a lungo" : "infortunato" })) } catch { }
/* (1151) stagione scorsa da gm-storico.js: PDK stimati a partita e ogni 36' */
let STO = null; try { STO = load("gm-storico.js", "GMSTO") } catch { }
const YL = STO ? Object.keys(STO.stagioni).sort().pop() : null, YI = {}; if (YL) for (const k in STO.stagioni[YL]) YI[nz(k)] = STO.stagioni[YL][k];
const pe = r => r[4] + r[6] + 1.25 * r[5] + 1.5 * (r[7] + r[8] + r[9]) - 1.5 * r[10] - (r[12] - r[11]) - (r[14] - r[13]) + (r[1] ? r[2] / r[1] : 0);
const yoy = n => { const rows = YI[nz(n)]; if (!rows) return null; const t = rows.find(r => r[0] === "TOT") || rows[0], e = pe(t); return { lab: YL, g: t[1], est: e, min: t[3], e36: t[3] ? e / t[3] * 36 : 0 } };
const ctx = { nz, ruolo, eta: n => { const r = lk(G.ruoli, n); return r && r.e || null }, exp: n => { const r = lk(G.ruoli, n); return r ? r.exp : null }, contr: n => lk(G.contratti, n), yoy };
const ctxLive = Object.assign({}, ctx, { inj: n => IM[nz(n)] || null });

const add = (d, k) => new Date(Date.parse(d + "T12:00:00Z") + k * 864e5).toISOString().slice(0, 10);
const giocati = Object.keys(TV.days).filter(d => (TV.days[d] || []).some(g => g[5] !== "S" && g[7] && TV.box[g[7]])).sort();
const last = giocati[giocati.length - 1], first = giocati[0];
const OUT = 10, TOP = 20;

/* date di prova: ogni 2 giorni, da 10 giorni dopo l'inizio fino a 10 giorni prima dell'ultima partita */
const cuts = []; for (let d = add(first, 10); add(d, OUT) <= last; d = add(d, 2)) cuts.push(d);
const F = cuts.map(c => { let L = radarAt(TV, c, Wcur, ctx).filter(x => x.mR <= 26); radarEsito(TV, c, L, ctx, add(c, OUT)); L = L.filter(x => x.out); return { c, L, base: L.filter(x => x.boom).length / (L.length || 1) } }).filter(f => f.L.length >= 30);
console.log("Date di prova", F.length, F.map(f => f.c).join(","));

const sc = (x, W) => KEYS.reduce((s, k) => s + W[k] * x["f" + k], 0) + W.Coach * (x.fCoach || 0);
const prec = (W, set) => { let h = 0, n = 0; for (const f of set) { const t = f.L.map(x => [sc(x, W), x.boom]).sort((a, b) => b[0] - a[0]).slice(0, TOP); h += t.filter(t => t[1]).length; n += t.length } return n ? h / n : 0 };
const base = set => set.reduce((a, f) => a + f.base, 0) / (set.length || 1);

const R = { upd: new Date().toISOString(), W: Wcur, W0, storia: (OLD && OLD.storia) || [], prev: (OLD && OLD.prev) || [], note: "" };
if (F.length >= 4) {
  const nT = Math.max(2, Math.round(F.length * .7)), TR = F.slice(0, nT), TE = F.slice(nT);
  /* ricerca: 2500 combinazioni casuali + 600 ritocchi intorno alla migliore (seme fisso per avere risultati ripetibili) */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let best = { W: Wcur, p: prec(Wcur, TR) };
  for (let i = 0; i < 2500; i++) { const W = Object.assign({}, Wcur); KEYS.forEach(k => W[k] = Math.round(rnd() * 30) / 10); const p = prec(W, TR); if (p > best.p) best = { W, p } }
  for (let i = 0; i < 600; i++) { const W = Object.assign({}, best.W), k = KEYS[Math.floor(rnd() * KEYS.length)]; W[k] = Math.max(0, Math.min(3, Math.round((W[k] + (rnd() - .5)) * 10) / 10)); const p = prec(W, TR); if (p >= best.p) best = { W, p } }
  const pCurTe = prec(Wcur, TE), pNewTe = prec(best.W, TE);
  const nuovo = pNewTe > pCurTe;
  const W = Object.assign({}, Wcur); if (nuovo) KEYS.forEach(k => W[k] = Math.round((Wcur[k] + (best.W[k] - Wcur[k]) * .5) * 100) / 100);
  const pFin = prec(W, F);
  R.W = W;
  R.storia.push({ d: new Date().toISOString().slice(0, 10), date: F.length, prova: TE.length, prima: +pCurTe.toFixed(3), cand: +pNewTe.toFixed(3), base: +base(TE).toFixed(3), tot: +pFin.toFixed(3), baseTot: +base(F).toFixed(3), cambiati: nuovo, W });
  R.storia = R.storia.slice(-60);
  R.note = nuovo ? `Pesi aggiornati: sulle ${TE.length} date più recenti i nuovi pesi prendono il ${Math.round(pNewTe * 100)}% contro il ${Math.round(pCurTe * 100)}%.` : `Pesi confermati: i candidati non fanno meglio sulle date più recenti (${Math.round(pNewTe * 100)}% contro ${Math.round(pCurTe * 100)}%).`;
  console.log(R.note, JSON.stringify(W));
} else { R.note = "Poche date con esito completo: pesi invariati."; R.storia.push({ d: new Date().toISOString().slice(0, 10), date: F.length, cambiati: false, W: Wcur }); console.log(R.note) }

/* previsione vera del lunedì (una per settimana: la prima esecuzione dal lunedì in poi) */
const oggi = new Date().toISOString().slice(0, 10), t = new Date(oggi + "T12:00:00Z"), lun = add(oggi, -((t.getUTCDay() + 6) % 7));
if (!R.prev.some(p => (p.w || p.d) === lun)) {
  const L = radarAt(TV, add(oggi, 1), R.W, ctxLive).filter(x => x.mR <= 26).sort((a, b) => b.score - a.score).slice(0, TOP);
  R.prev.push({ d: oggi, w: lun, W: R.W, L: L.map(x => ({ k: x.k, n: x.n, tm: x.tm, mR: +x.mR.toFixed(1), pR: +x.pR.toFixed(1), e: ctx.eta(x.n) })) });
  R.prev = R.prev.slice(-40);
  console.log("Previsione salvata", oggi, L.map(x => x.n).join(", "));
}
writeFileSync("radar-pesi.js", `/* RADAR BREAKOUT – pesi ritarati e previsioni salvate da tools/radar_tune.mjs (GitHub, ogni giorno). Non modificare a mano. */\nconst RADAR=${JSON.stringify(R)};\n`);
