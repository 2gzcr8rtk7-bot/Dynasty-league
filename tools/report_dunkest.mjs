// REPORT DUNKEST – aggiorna i dati dell'app con i dati UFFICIALI Dunkest (niente ESPN).
// Uso (da dentro la cartella del repository):
//   NODE_USE_ENV_PROXY=1 node tools/report_dunkest.mjs                 aggiorna fino a ieri (data USA)
//   NODE_USE_ENV_PROXY=1 node tools/report_dunkest.mjs --fino=2026-10-26   ultima notte da caricare (data USA)
//   ... --prova    calcola e stampa il riepilogo senza scrivere i file
// Aggiorna: index.html (PARTITE, EFF, ULTIMA, GL_STATS, FA, FA_AGG, data in fondo), fa-games.js (FAG), tv-data.js (TV).
// NON tocca dreamers-data.js (lo rigenera GitHub da solo).
// Fonti Dunkest:
//   /api/stats/table (mode=nba, tutta la stagione)  → chi ha giocato e il suo id Dunkest
//   /api/player/games (per giocatore)               → ogni partita: PDK ufficiale, minuti:secondi, avversario, tabellino
// Calcoli identici al report del fratello (verificati rifacendo il report del 27/10 dal 26/10):
//   minuti = min + sec/60 arrotondati a 0,1 · efficienza partita = PDK / minuti esatti (2 decimali)
//   efficienze medie (giocatori, squadre, G League, free agent) = PDK totali / minuti totali esatti
// Arrotondamenti come Python round() (es. 41:09 → 41,1).
// Scritto il 28/10/2026 da Claude (account del secondo utente).
import { readFileSync, writeFileSync } from "node:fs";

const ARG = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const SEASON = 29, SEASON_START = "2026-10-20", SEASON_LAB = "2026/27", FA_LAB = "26/27";
const API = "https://www.dunkest.com/api";
const UA = { "User-Agent": "Mozilla/5.0 (DreamersReport)", "Accept": "application/json" };

/* ---------- lettura dei dati dell'app ---------- */
let html = readFileSync("index.html", "utf8");
function constRange(src, name) {
  const i = src.indexOf(`const ${name}=`); if (i < 0) throw new Error(`manca const ${name}`);
  let j = src.indexOf("=", i) + 1, d = 0, q = null; const st = j;
  for (; j < src.length; j++) { const c = src[j];
    if (q) { if (c === "\\") { j++; continue; } if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (c === "{" || c === "[") d++; else if (c === "}" || c === "]") { d--; if (!d) { j++; break; } } }
  return [st, j];
}
const getConst = (src, name) => { const [a, b] = constRange(src, name); return new Function("return " + src.slice(a, b))(); };
const setConst = (src, name, text) => { const [a, b] = constRange(src, name); return src.slice(0, a) + text + src.slice(b); };

const ROSTER = getConst(html, "ROSTER"), PARTITE = getConst(html, "PARTITE"), GL_STATS = getConst(html, "GL_STATS"),
  FA = getConst(html, "FA"), FA_OWN = getConst(html, "FA_OWN");
const faSrc = readFileSync("fa-games.js", "utf8"), FAG = getConst(faSrc, "FAG");
const tvSrc = readFileSync("tv-data.js", "utf8"), TV = getConst(tvSrc, "TV");

/* ---------- arrotondamenti come Python round() ---------- */
// stesso risultato di Python round(statistics.mean(...), n): valore portato al decimale più vicino a 15 cifre, pareggi esatti al pari
const rnd = (x, n) => { if (x == null || !isFinite(x)) return null; 
  const neg = x < 0, s = Math.abs(x).toFixed(n + 25), dot = s.indexOf("."), keep = s.slice(0, dot) + s.slice(dot + 1, dot + 1 + n), rest = s.slice(dot + 1 + n);
  let k = BigInt(keep); const half = "5" + "0".repeat(rest.length - 1);
  if (rest > half || (rest === half && k % 2n === 1n)) k += 1n;
  const v = (neg ? -1 : 1) * Number(k) / 10 ** n; return Object.is(v, -0) ? 0 : +v.toFixed(n); };
const r1 = x => rnd(x, 1), r2 = x => rnd(x, 2);
// media esatta come statistics.mean di Python (somma senza errori di arrotondamento, poi il double più vicino)
const exact = x => { const b = new DataView(new ArrayBuffer(8)); b.setFloat64(0, x); const hi = b.getUint32(0), lo = b.getUint32(4);
  const sign = hi >>> 31 ? -1n : 1n, ex = (hi >>> 20) & 0x7ff; let man = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  if (ex) man |= 1n << 52n; return [sign * man, (ex || 1) - 1075]; };
const mean = arr => { if (!arr.length) return null; const fr = arr.map(exact), e0 = Math.min(...fr.map(f => f[1]));
  let num = 0n; for (const [m, e] of fr) num += m << BigInt(e - e0);
  const den = BigInt(arr.length) << BigInt(-Math.min(e0, 0)), mul = e0 > 0 ? 1n << BigInt(e0) : 1n; num *= mul;
  const neg = num < 0n; if (neg) num = -num; const ip = num / den; let r = num % den, dec = "";
  for (let i = 0; i < 40; i++) { r *= 10n; dec += (r / den).toString(); r %= den; }
  return (neg ? -1 : 1) * parseFloat(ip.toString() + "." + dec); };

/* ---------- date ---------- */
const nyDate = d => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const addDay = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ddmm = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const now = new Date(), rome = k => now.toLocaleString("it-IT", { timeZone: "Europe/Rome", ...k });
const AGG = rome({ day: "2-digit", month: "2-digit", year: "numeric" });
const ORA = rome({ hour: "2-digit", minute: "2-digit", hour12: false });
const isoOf = dm => { const [d, m] = dm.split("/"); return (+m >= 9 ? "2026" : "2027") + "-" + m + "-" + d; };
let lastDone = "2026-10-19";
for (const g of Object.values(PARTITE)) for (const r of g) { const iso = isoOf(r[0]); if (iso > lastDone) lastDone = iso; }
const FINO = ARG.fino || addDay(nyDate(now), -1);
const NOTTI = []; for (let d = addDay(lastDone, 1); d <= FINO; d = addDay(d, 1)) NOTTI.push(d);
console.log(`Ultima notte già caricata: ${lastDone} · notti nuove: ${NOTTI.join(", ") || "nessuna"} · dati fino al ${FINO}`);
if (!NOTTI.length && !ARG.forza) { console.log("Niente da aggiornare."); process.exit(0); }

/* ---------- rete ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url) {
  for (let t = 1; t <= 6; t++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return await r.json(); if (r.status < 500 && r.status !== 429) throw new Error(`HTTP ${r.status} ${url}`); }
    catch (e) { if (t === 6) throw e; }
    await sleep(2000 * t);
  }
}
async function pool(items, n, fn) { let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; await fn(items[k], k); } })); }
const qTeams = Array.from({ length: 30 }, (_, i) => `teams[]=${i + 1}`).join("&") + "&positions[]=1&positions[]=2&positions[]=3";
const table = (a, b) => getJSON(`${API}/stats/table?season_id=${SEASON}&mode=nba&stats_type=tot&date_from=${a}&date_to=${b}&player_search=&min_cr=0&max_cr=100&sort_by=pdk&sort_order=desc&${qTeams}`);

/* ---------- nomi: Dunkest → nome usato nell'app ---------- */
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ø/g, "o").replace(/ł/g, "l")
  .replace(/\b(jr|sr|ii|iii|iv)\b\.?/g, "").replace(/[^a-z]/g, "");
const lastOf = n => { const w = String(n).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, "").trim().split(/\s+/); return norm(w[w.length - 1]); };
const APP = new Map(), BYLAST = new Map();
const addName = (n, team) => { if (!n) return; const k = norm(n); if (!APP.has(k)) APP.set(k, n);
  if (team) { const l = lastOf(n) + "|" + team; (BYLAST.get(l) || BYLAST.set(l, new Set()).get(l)).add(n); } };
Object.values(ROSTER).flat().forEach(r => addName(r[0], r[3])); Object.values(GL_STATS).forEach(g => addName(g.n, g.nba));
FA.forEach(f => addName(f[0], f[1])); Object.keys(PARTITE).forEach(n => addName(n)); Object.keys(FA_OWN).forEach(n => addName(n));
Object.keys(FAG).forEach(n => addName(n)); Object.values(TV.box).forEach(b => [...b.a, ...b.h].forEach(r => addName(r[0])));
const appName = p => { const dk = (p.first_name + " " + p.last_name).trim(), k = norm(dk);
  if (APP.has(k)) return APP.get(k);
  const c = BYLAST.get(lastOf(dk) + "|" + p.team_code); if (c && c.size === 1) { const n = [...c][0]; console.log(`  nome: "${dk}" (Dunkest) = "${n}" (app)`); return n; }
  return dk; };

/* ---------- 1) tutti i giocatori scesi in campo nella stagione + loro partite ---------- */
const SEAS = (await table(SEASON_START, FINO)) || [];
const AVG = {}; for (const p of (await getJSON(`${API}/stats/table?season_id=${SEASON}&mode=nba&stats_type=avg&date_from=${SEASON_START}&date_to=${FINO}&player_search=&min_cr=0&max_cr=100&sort_by=pdk&sort_order=desc&${qTeams}`)) || []) AVG[p.id] = p;
const PL = SEAS.filter(p => +p.gp > 0).map(p => ({ id: p.id, name: appName(p), dk: (p.first_name + " " + p.last_name).trim(), team: p.team_code, pos: p.position }));
console.log(`Giocatori con almeno una partita: ${PL.length}`);
const LOG = {}; // nome app -> partite (fino a FINO), ordinate per data
let fatti = 0;
await pool(PL, 8, async p => { const g = (await getJSON(`${API}/player/games?player_id=${p.id}&season_id=${SEASON}`)) || [];
  const L = g.filter(x => x.gameDate >= SEASON_START && x.gameDate <= FINO).sort((a, b) => a.gameDate.localeCompare(b.gameDate));
  if (LOG[p.name]) console.log(`  ! due giocatori Dunkest con lo stesso nome nell'app: ${p.name}`);
  LOG[p.name] = { p, L }; if (++fatti % 100 === 0) console.log(`  ${fatti}/${PL.length}`); });
const minEx = g => (+g.min || 0) + (+g.sec || 0) / 60;
const rowOf = g => { const m = minEx(g), pdk = +g.pdk; return [ddmm(g.gameDate), g.opponentTeamCode, r1(m), pdk, m ? r2(pdk / m) : 0, +g.pts, +g.reb, +g.ast]; };
const rowsOf = n => (LOG[n] ? LOG[n].L.map(rowOf) : null);
// medie: PDK totali / minuti esatti totali
const effW = L => { const m = L.reduce((a, g) => a + minEx(g), 0); return m ? r2(L.reduce((a, g) => a + +g.pdk, 0) / m) : null; };
const minMed = L => L.length ? r1(mean(L.map(minEx))) : null;

/* ---------- 2) PARTITE (roster + G League), ricostruite per intero dai dati ufficiali ---------- */
const TRACK = new Set([...Object.values(ROSTER).flat().map(r => r[0]), ...Object.keys(PARTITE), ...Object.keys(FA_OWN), ...Object.values(GL_STATS).map(g => g.n)]);
let cambiate = 0;
for (const n of TRACK) { const R = rowsOf(n); if (!R) continue; if (JSON.stringify(R) !== JSON.stringify(PARTITE[n] || [])) cambiate++; PARTITE[n] = R; }
for (const n of Object.keys(PARTITE)) if (!PARTITE[n].length) delete PARTITE[n];
console.log(`PARTITE: ${Object.keys(PARTITE).length} giocatori, ${cambiate} aggiornati`);

/* ---------- 3) EFF e ULTIMA ---------- */
const NOTTE = FINO;
const gioc = {}, squadre = [];
for (const [t, ros] of Object.entries(ROSTER)) {
  const rows = ros.map(r => { const n = r[0], L = LOG[n] ? LOG[n].L : [], nt = L.find(g => g.gameDate === NOTTE), l5 = L.slice(-5);
    if (!L.length) return [n, null, 0, null, null, null, null, null, null];
    return [n, effW(L), L.length, minMed(L), nt ? Math.round(minEx(nt)) : null, nt ? rowOf(nt)[4] : null, effW(l5), minMed(l5), nt ? +nt.pdk : null]; });
  rows.sort((a, b) => (b[1] ?? -99) - (a[1] ?? -99));
  gioc[t] = rows;
  const nt = ros.map(r => LOG[r[0]] && LOG[r[0]].L.find(g => g.gameDate === NOTTE)).filter(Boolean), all = ros.flatMap(r => LOG[r[0]] ? LOG[r[0]].L : []);
  squadre.push([t, nt.length, r1(nt.reduce((a, g) => a + +g.pdk, 0)), nt.length ? effW(nt) : null, effW(all), r1(all.reduce((a, g) => a + +g.pdk, 0))]);
}
squadre.sort((a, b) => (b[4] ?? 0) - (a[4] ?? 0));
const ult = {}; for (const ros of Object.values(ROSTER)) for (const r of ros) { const L = PARTITE[r[0]]; if (L && L.length) ult[r[0]] = L[L.length - 1][4]; }

/* ---------- 4) G League (GL_STATS) ---------- */
for (const g of Object.values(GL_STATS)) { const D = LOG[g.n]; if (!D || !D.L.length) continue; const L = D.L;
  g.log = L.map(rowOf); g.g = L.length; g.m = minMed(L); g.p = r1(mean(L.map(x => +x.pdk))); g.e = effW(L); g.l5 = effW(L.slice(-5)); }

/* ---------- 5) Free agent: partite (FAG) e medie stagionali (FA) ---------- */
// i free agent si abbinano per nome "normalizzato" (es. "Hugo Gonzalez" in FA = "Hugo González" nei tabellini)
const inRoster = new Set(Object.values(ROSTER).flat().map(r => r[0]));
const LOGN = new Map(Object.entries(LOG).map(([n, D]) => [norm(n), D]));
const faByNorm = new Map(FA.map(f => [norm(f[0]), f]));
for (const [n, D] of Object.entries(LOG)) { if (inRoster.has(n) || !D.L.length || faByNorm.has(norm(n)) || TRACK.has(n)) continue;
  const f = [n, D.p.team, D.p.pos, "", {}]; FA.push(f); faByNorm.set(norm(n), f); console.log(`  nuovo free agent: ${n} (${D.p.team})`); }
const fagKey = new Map(Object.keys(FAG).map(k => [norm(k), k]));
for (const f of FA) { if (inRoster.has(f[0])) continue; const D = LOGN.get(norm(f[0])); if (!D || !D.L.length) continue;
  const k = fagKey.get(norm(f[0])) || f[0]; (FAG[k] || (FAG[k] = {}))[SEASON_LAB] = D.L.map(rowOf);
  const A = AVG[D.p.id]; f[1] = D.p.team;
  if (A) { const mn = +A.min, pk = +A.pdk; f[4][FA_LAB] = [+A.gp, mn, pk, mn ? r2(pk / mn) : null, +A.pts, +A.reb, +A.ast]; } }
const lastPdk = f => { for (const s of [FA_LAB, "25/26", "24/25"]) if (f[4][s]) return f[4][s][2]; return -999; };
const FA2 = FA.filter(f => !inRoster.has(f[0]) || FA_OWN[f[0]]);
FA2.sort((a, b) => lastPdk(b) - lastPdk(a));

const INCOMPLETE = [];
/* ---------- 6) Dynasty TV: risultati e tabellini delle notti nuove (tv-data.js) ---------- */
const mmss = m => { const s = Math.round(m * 60); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
for (const d of NOTTI) {
  const byTeam = {}, games = [];
  for (const [n, D] of Object.entries(LOG)) { const g = D.L.find(x => x.gameDate === d); if (!g) continue;
    (byTeam[D.p.team] ||= []).push({ n, g, m: minEx(g) }); games.push({ team: D.p.team, g }); }
  const day = TV.days[d] || (TV.days[d] = []), seen = new Set(), previste = day.length;
  // casa/trasferta: prima dal calendario di Dynasty TV, altrimenti dalla maggioranza dei dati Dunkest della partita
  const vote = {}; for (const { team, g } of games) { const k = [team, g.opponentTeamCode].sort().join("-"); (vote[k] ||= {})[g.opponentTeamPosition === "away" ? team : g.opponentTeamCode] = ((vote[k] || {})[g.opponentTeamPosition === "away" ? team : g.opponentTeamCode] || 0) + 1; }
  for (const { team, g } of games) { const o = g.opponentTeamCode, pair = [team, o].sort().join("-");
    if (seen.has(pair)) continue; seen.add(pair);
    const S = day.find(z => (z[0] === team && z[1] === o) || (z[0] === o && z[1] === team));
    let A, H; if (S) { A = S[0]; H = S[1]; } else { const v = vote[pair]; H = (v[team] || 0) >= (v[o] || 0) ? team : o; A = H === team ? o : team; }
    const key = `${d}_${A}${H}`;
    const side = t => (byTeam[t] || []).sort((a, b) => (b.g.starter - a.g.starter) || (Math.round(b.m * 60) - Math.round(a.m * 60)) || (b.g.pts - a.g.pts)).map(y => { const q = y.g;
      return [y.n, q.starter ? 1 : 0, mmss(y.m), +q.pts, +q.oreb, +q.dreb, +q.reb, +q.ast, +q.stl, +q.blk, +q.tov, +q.pf, +q.fgm, +q.fga, +q.tpm, +q.tpa, +q.ftm, +q.fta, +q.plusMinus, +q.pdk]; });
    const a = side(A), h = side(H);
    TV.box[key] = { a, h };
    let G = day.find(z => z[0] === A && z[1] === H); if (!G) { G = [A, H, null, null, 0, "S", "", ""]; day.push(G); }
    G[2] = a.reduce((s, r) => s + r[3], 0); G[3] = h.reduce((s, r) => s + r[3], 0); G[4] = g.gameOt ? 1 : 0; G[5] = "F"; G[6] = ""; G[7] = key; }
  console.log(`  Dynasty TV ${d}: ${seen.size} partite Dunkest su ${previste} in calendario`);
  if (seen.size < previste) INCOMPLETE.push(`${d}: ${seen.size}/${previste} partite`);
}
const rec = {}; Object.keys(TV.teams).forEach(t => rec[t] = [0, 0]);
for (const day of Object.values(TV.days)) for (const G of day) if (G[5] === "F" && G[2] != null) { const wA = G[2] > G[3];
  (rec[G[0]] ||= [0, 0])[wA ? 0 : 1]++; (rec[G[1]] ||= [0, 0])[wA ? 1 : 0]++; }
TV.rec = rec; TV.upd = `${AGG} · ${ORA}`;

/* ---------- 7) controlli e scrittura ---------- */
const J = x => JSON.stringify(x);
const effTxt = `{agg:${J(AGG)},\n squadre:${J(squadre)},\n gioc:{\n` + Object.entries(gioc).map(([t, r]) => ` ${t}:${J(r)}`).join(",\n") + `}}`;
console.log("\nEfficienza squadre:\n" + squadre.map(s => `  ${s[0]}  notte ${s[1]} gioc. ${s[2]} PDK eff ${s[3]}  ·  stagione eff ${s[4]} PDK ${s[5]}`).join("\n"));
const senza = Object.values(ROSTER).flat().filter(r => !LOG[r[0]]).map(r => r[0]);
if (senza.length) console.log(`Giocatori dei roster senza partite Dunkest (infortunati o non ancora entrati): ${senza.join(", ")}`);
if (INCOMPLETE.length && !ARG.forza) { console.log(`\nATTENZIONE: Dunkest non ha ancora tutte le partite (${INCOMPLETE.join(", ")}). Nessun file scritto: riprovare più tardi (o --forza).`); process.exit(2); }
if (ARG.prova) { console.log("\n--prova: nessun file scritto"); process.exit(0); }
html = setConst(html, "PARTITE", J(PARTITE));
html = setConst(html, "EFF", effTxt);
html = setConst(html, "ULTIMA", `{agg:${J(AGG)},gioc:${J(ult)}}`);
html = setConst(html, "GL_STATS", J(GL_STATS));
html = setConst(html, "FA", J(FA2));
html = html.replace(/const FA_AGG="[^"]*"/, `const FA_AGG=${J(AGG)}`);
html = html.replace(/Ultimo aggiornamento: [^<]*</, `Ultimo aggiornamento: ${AGG} · ${ORA}<`);
writeFileSync("index.html", html);
writeFileSync("fa-games.js", setConst(faSrc, "FAG", J(FAG)));
writeFileSync("tv-data.js", setConst(tvSrc, "TV", J(TV)));
console.log(`\nScritti index.html, fa-games.js, tv-data.js · aggiornamento ${AGG} ${ORA} · dati fino alla notte del ${FINO}`);
