// (1071) PROPOSTE DI CALENDARIO DREAMERS PER LA STAGIONE NUOVA (richiesta Francesco 17/11/2026)
// Lo lancia GitHub ogni giorno (.github/workflows/proposte-calendario.yml): nessun costo Claude.
//  1) controlla su ESPN se c'è il calendario NBA della stagione dopo quella in corso (STAGIONE_CORRENTE in index.html);
//  2) se c'è (almeno 1100 partite di regular season) divide le notti in turni con una ricerca ottima (programmazione dinamica) e scrive
//     calendario-proposte.js con più opzioni: tutti i turni da 3 notti, qualche turno da 4, anche da 5 — e per ognuna quante volte una squadra
//     NBA resta a 0 partite in un turno (il giocatore prende la media), quante ne gioca 3 o più, quanti turni di ogni lunghezza.
//  L'app mostra a tutti un banner «Calendario della stagione nuova: proposte pronte» che apre le opzioni. NON si attiva da solo:
//  la scelta la fa Francesco e poi si copia in DR_TURNI / DR_REG / DR_TOT.
// Uso: node tools/proposte_calendario.mjs            (stagione dopo quella in corso, da ESPN)
//      node tools/proposte_calendario.mjs --prova    (calcola sul calendario noto di tv-data.js, non scrive niente)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const ARG = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const OUT = "calendario-proposte.js";
const add = (d, k) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + k); return x.toISOString().slice(0, 10); };
const PLAYOFF_TURNI = 10;          // come adesso: playoff al meglio delle 5, 2 round = al massimo 10 turni
const STACCO_FINE = 10;            // i turni Dreamers finiscono 10 giorni prima della fine della regular season NBA (riposi e tank)

/* ---------- divisione ottima delle notti in turni ---------- */
// N = notti (date con partite), G[i] = Map squadra -> partite quella notte. Turno = notti consecutive i..j-1 (i giorni senza partite in mezzo sono pausa).
// Costo di un turno: 100 per ogni squadra NBA a 0 partite, 4 per ogni partita oltre la seconda, + costo della lunghezza (opzione).
export function dividi(N, G, TEAMS, opt) {
  const n = N.length, INF = 1e18, best = new Array(n + 1).fill(INF), from = new Array(n + 1).fill(-1);
  best[0] = 0;
  const costo = (i, j) => { const c = {}; for (const t of TEAMS) c[t] = 0; for (let k = i; k < j; k++) for (const [t, v] of G[k]) c[t] += v;
    let z = 0, o = 0; for (const t of TEAMS) { if (!c[t]) z++; else if (c[t] > 2) o += c[t] - 2 } return { z, o, s: 100 * z + 4 * o + (opt.len[j - i] ?? INF) } };
  for (let j = 1; j <= n; j++) for (const L of Object.keys(opt.len).map(Number)) { const i = j - L; if (i < 0 || best[i] >= INF) continue;
    const c = costo(i, j).s + best[i]; if (c < best[j]) { best[j] = c; from[j] = i } }
  if (best[n] >= INF) return null;
  const T = []; for (let j = n; j > 0; j = from[j]) T.unshift([from[j], j]);
  return T.map(([i, j]) => { const c = {}; for (const t of TEAMS) c[t] = 0; for (let k = i; k < j; k++) for (const [t, v] of G[k]) c[t] += v;
    return { a: N[i], b: N[j - 1], notti: j - i, zero: TEAMS.filter(t => !c[t]), tre: TEAMS.filter(t => c[t] > 2) } });
}
export const OPZIONI = [
  { id: "A", titolo: "Tutti da 3 notti", sub: "come quest'anno: turni da 3 notti (2 o 4 solo se non si può fare altrimenti)", len: { 3: 0, 2: 400, 4: 400 } },
  { id: "B", titolo: "Qualche turno da 4", sub: "turni da 3 notti, da 4 quando toglie squadre a 0 partite", len: { 3: 0, 4: 60, 2: 400 } },
  { id: "C", titolo: "Più turni da 4", sub: "da 4 notti appena aiuta anche di poco", len: { 3: 0, 4: 25, 2: 400 } },
  { id: "D", titolo: "Anche da 5", sub: "turni da 3–4 notti, qualcuno da 5 se serve (meglio da 4 che da 5)", len: { 3: 0, 4: 25, 5: 90, 2: 400 } }];
export function proposte(N, G, TEAMS) {
  return OPZIONI.map(o => { const T = dividi(N, G, TEAMS, o); if (!T) return null; const k = T.length, reg = Math.max(1, k - PLAYOFF_TURNI);
    const R = T, lens = {}; T.forEach(t => lens[t.notti] = (lens[t.notti] || 0) + 1);/* conti su tutti i turni (regular season e playoff) */
    const zeri = R.reduce((a, t) => a + t.zero.length, 0), tre = R.reduce((a, t) => a + t.tre.length, 0), tot = R.length * TEAMS.length;
    return { id: o.id, titolo: o.titolo, sub: o.sub, turni: T.map(t => [t.a, t.b, t.notti, t.zero, t.tre.length]), reg, tot: k,
      stat: { zeri, tre, ok: Math.round((tot - zeri - tre) / tot * 1000) / 10, lens, fineReg: T[reg - 1].b, fine: T[k - 1].b } } }).filter(Boolean)
    .filter((o, i, A) => A.findIndex(x => JSON.stringify(x.turni) === JSON.stringify(o.turni)) === i);/* opzioni uguali: si tiene la prima */
}

/* ---------- dati ---------- */
const ESPN_AB = { GS: "GSW", NY: "NYK", NO: "NOP", SA: "SAS", UTAH: "UTA", WSH: "WAS" }, ab = a => ESPN_AB[a] || a;
async function get(url) { for (let k = 0; k < 4; k++) { try { const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (DreamersCalendario)" } }); if (r.ok) return await r.json() } catch (x) {} await new Promise(r => setTimeout(r, 1500 * (k + 1))) } return null }
async function main() {
  const html = readFileSync("index.html", "utf8"), sc = (html.match(/const STAGIONE_CORRENTE="(\d\d)\/(\d\d)"/) || []);
  const y1 = 2000 + +(sc[2] || 27), nuova = `${String(y1).slice(2)}/${String(y1 + 1).slice(2)}`;
  if (!ARG.prova && existsSync(OUT)) { const o = readFileSync(OUT, "utf8"); if (o.includes(`"stagione":"${nuova}"`)) { console.log(`Proposte per la stagione ${nuova} già pronte: niente da fare`); return } }
  const G = {}; let n = 0;
  if (ARG.prova) { // calendario noto di Dynasty TV, solo per provare l'algoritmo
    const s = readFileSync("tv-data.js", "utf8"), TV = JSON.parse(s.slice(s.indexOf("{", s.indexOf("const TV=")), s.lastIndexOf("}") + 1));
    for (const [d, L] of Object.entries(TV.days)) { if (d < (ARG.da || "2026-10-25")) continue; for (const g of L) { (G[d] = G[d] || []).push([g[0], g[1]]); n++ } }
  } else {
    /* controllo veloce: se a inizio dicembre non c'è nessuna partita in calendario, il calendario non è ancora uscito */
    let pre = 0; for (const d of [`${y1}-12-01`, `${y1}-12-02`, `${y1}-12-03`]) { const J = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}`); pre += ((J && J.events) || []).filter(ev => (ev.season || {}).type === 2).length }
    if (!pre) { console.log(`Calendario NBA ${nuova} non ancora uscito su ESPN: riprovo domani`); return }
    for (let d = `${y1}-10-01`; d <= `${y1 + 1}-04-30`; d = add(d, 1)) {
      const J = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}`); if (!J) continue;
      for (const ev of J.events || []) { if ((ev.season || {}).type !== 2) continue; const c = (ev.competitions || [])[0]; if (!c) continue;
        const H = c.competitors.find(x => x.homeAway === "home"), A = c.competitors.find(x => x.homeAway === "away"); if (!H || !A) continue;
        (G[d] = G[d] || []).push([ab(A.team.abbreviation), ab(H.team.abbreviation)]); n++ } }
    if (n < 1100) { console.log(`Calendario NBA ${nuova} non ancora disponibile su ESPN (${n} partite di regular season trovate): riprovo domani`); return }
  }
  let N = Object.keys(G).sort(); const fineNBA = N[N.length - 1], stop = ARG.prova ? fineNBA : add(fineNBA, -STACCO_FINE); N = N.filter(d => d <= stop);
  const TEAMS = [...new Set(N.flatMap(d => G[d].flat()))].sort();
  const GM = N.map(d => { const m = new Map(); for (const [a, h] of G[d]) { m.set(a, (m.get(a) || 0) + 1); m.set(h, (m.get(h) || 0) + 1) } return m });
  const P = proposte(N, GM, TEAMS);
  const OUTO = { stagione: nuova, creato: new Date().toISOString().slice(0, 16).replace("T", " "), partite: n, notti: N.length, prima: N[0], ultima: N[N.length - 1], fineNBA, squadre: TEAMS.length, playoff: PLAYOFF_TURNI, opzioni: P };
  for (const o of P) console.log(`${o.id} ${o.titolo}: ${o.tot} turni (${o.reg} regular + playoff), squadre a 0 partite ${o.stat.zeri}, a 3+ ${o.stat.tre}, turni ${JSON.stringify(o.stat.lens)}`);
  if (ARG.prova) return;
  writeFileSync(OUT, "/* (1071) generato da tools/proposte_calendario.mjs (GitHub), non modificare a mano */\nwindow.CAL_PROPOSTE=" + JSON.stringify(OUTO) + ";\n");
  console.log(`Scritto ${OUT}`);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
