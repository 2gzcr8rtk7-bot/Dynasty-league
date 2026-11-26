// REPORT ESPN (1566) – aggiorna i dati UFFICIALI dell'app con i tabellini NBA di ESPN. È la fonte principale al posto di tools/report_dunkest.mjs,
// che resta come riserva automatica (il workflow lo lancia solo se questo script esce con errore).
// Lo lancia da solo GitHub (.github/workflows/report.yml) durante la notte e alle 07:07 italiane: nessuno deve lanciare niente a mano.
// Ogni corsa riuscita lascia il suo registro in REPORT_INFO e nella riga in fondo all'app (tools/report_info.mjs).
// Uso (da dentro la cartella del repository; nel sandbox di Claude serve NODE_USE_ENV_PROXY=1 per la rete):
//   node tools/report_espn.mjs                      carica le notti nuove fino a quella appena finita (data italiana di oggi − 1)
//   node tools/report_espn.mjs --fino=2026-11-09     ultima notte da caricare (data USA)
//   ... --prova      calcola e stampa il riepilogo senza scrivere i file
//   ... --ultima     corsa "di chiusura" (GitHub alle 07:07): se la notte ha ancora partite non finite è un ERRORE (il job fallisce e arriva la mail);
//                    senza --ultima una notte ancora in corso si salta in silenzio (riprova la corsa successiva)
//   ... --da=2026-11-03 --prova --dump=file.json     (solo prova) ricarica da ESPN notti già caricate, per confrontarle con i dati salvati
// Aggiorna gli STESSI dati, negli STESSI formati, del vecchio report Dunkest (l'app non cambia):
//   index.html (PARTITE, EFF, ULTIMA, GL_STATS, FA, FA_AGG, data in fondo), fa-games.js (FAG), tv-data.js (TV).
// NON tocca dreamers-data.js (lo rigenera tools/dreamers.mjs nello stesso job di GitHub).
// Fonti ESPN (site.api.espn.com, nessuna chiave):
//   scoreboard?dates=AAAAMMGG → partite della notte e stato (finita / in corso / rinviata)
//   summary?event=ID          → tabellino di ogni giocatore (titolare, minuti, punti, rimbalzi off/dif, assist, ecc.)
// PDK = formula tvPdk dell'app (index.html): punti + RIM dif + 1,25×RIM off + 1,5×(assist+recuperi+stoppate) − 1,5×perse
//   − 0,5×stoppate subite (ESPN non le ha: 0) − tiri sbagliati − liberi sbagliati + 1 se titolare; bonus triple (3-4 = +3/+4, 5+ = +5);
//   doppia doppia +5, tripla +10, quadrupla +50; +5% del valore assoluto se la squadra ha vinto; arrotondato a 2 decimali.
// Minuti: ESPN dà solo i minuti interi (34 = "34:00"), quindi efficienza partita = PDK / minuti interi.
// Storico: le notti già caricate NON si riscaricano. Le partite della stagione di ogni giocatore si rileggono dai tabellini di
//   Dynasty TV (tv-data.js: tutte le partite, tutti i giocatori, notti Dunkest comprese), poi si aggiungono le notti nuove da ESPN.
//   Medie, efficienze, G League e free agent si ricalcolano da lì con gli stessi calcoli del report Dunkest.
// Controlli (se uno fallisce NON scrive niente ed esce con errore, così i dati buoni restano):
//   ESPN non raggiungibile · partita del calendario mancante su ESPN · partite non finite (con --ultima) · somma punti giocatori ≠ punteggio
//   squadra · troppi giocatori dei roster non trovati nei tabellini (nomi non abbinati).
import { readFileSync, writeFileSync } from "node:fs";
import { registraCorsa } from "./report_info.mjs";

const ARG = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));
const SEASON_START = "2026-10-20", SEASON_LAB = "2026/27", FA_LAB = "26/27";
const SB = d => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}`;
const SUM = id => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${id}`;
const MAX_NON_TROVATI = 0.35;   // oltre il 35% dei giocatori dei roster (squadra in campo) non trovati nei tabellini → stop
const esci = (cod, msg) => { console.log(msg); process.exit(cod); };

/* ---------- lettura dei dati dell'app (stessi aiuti del report Dunkest) ---------- */
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

/* ---------- arrotondamenti come Python round() (copiati dal report Dunkest) ---------- */
const rnd = (x, n) => { if (x == null || !isFinite(x)) return null;
  const neg = x < 0, s = Math.abs(x).toFixed(n + 25), dot = s.indexOf("."), keep = s.slice(0, dot) + s.slice(dot + 1, dot + 1 + n), rest = s.slice(dot + 1 + n);
  let k = BigInt(keep); const half = "5" + "0".repeat(rest.length - 1);
  if (rest > half || (rest === half && k % 2n === 1n)) k += 1n;
  const v = (neg ? -1 : 1) * Number(k) / 10 ** n; return Object.is(v, -0) ? 0 : +v.toFixed(n); };
const r1 = x => rnd(x, 1), r2 = x => rnd(x, 2);
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
const ROMA_ISO = now.toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
const isoOf = dm => { const [d, m] = dm.split("/"); return (+m >= 9 ? "2026" : "2027") + "-" + m + "-" + d; };
let lastDone = "2026-10-19";
for (const g of Object.values(PARTITE)) for (const r of g) { const iso = isoOf(r[0]); if (iso > lastDone) lastDone = iso; }
// (prova) --da: ricarica da ESPN anche notti già caricate, a partire da quella data
if (ARG.da) { if (!ARG.prova) esci(1, "--da si usa solo con --prova"); lastDone = addDay(ARG.da, -1); }
// la notte da chiudere è quella USA finita stanotte = data italiana di oggi − 1 (così EFF.agg = notte + 1, come vuole tools/dreamers.mjs)
const FINO0 = ARG.fino || addDay(ROMA_ISO, -1);
let NOTTI = []; for (let d = addDay(lastDone, 1); d <= FINO0; d = addDay(d, 1)) NOTTI.push(d);
console.log(`Ultima notte già caricata: ${lastDone} · notti nuove: ${NOTTI.join(", ") || "nessuna"} · dati fino al ${FINO0}`);
if (!NOTTI.length && !ARG.forza) esci(0, "Niente da aggiornare.");

/* ---------- rete ---------- */
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url) {
  let err;
  for (let t = 1; t <= 5; t++) {
    try { const r = await fetch(url, { headers: { "User-Agent": "dreamers-report", "Accept": "application/json" }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return await r.json(); err = new Error(`HTTP ${r.status} ${url}`); if (r.status < 500 && r.status !== 429) break; }
    catch (e) { err = e; }
    await sleep(2000 * t);
  }
  throw new Error(`ESPN non raggiungibile: ${err && err.message}`);
}

/* ---------- nomi: ESPN → nome usato nell'app (stessa logica del report Dunkest) ---------- */
// norm: senza accenti, minuscolo, senza Jr./Sr./II/III/IV e senza punteggiatura (P.J. = PJ, Jones-Garcia = Jones Garcia)
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ø/g, "o").replace(/ł/g, "l")
  .replace(/\b(jr|sr|ii|iii|iv)\b\.?/g, "").replace(/[^a-z]/g, "");
const lastOf = n => { const w = String(n).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i, "").trim().split(/\s+/); return norm(w[w.length - 1]); };
// Prima i nomi "ufficiali" dell'app (roster, G League, free agent, PARTITE, diritti FA, FAG), poi quelli dei tabellini di Dynasty TV
// (che negli anni hanno varianti: "Ron Holland" / "Ronald Holland II"). Abbinamento: 1) nome normalizzato uguale; 2) stesso cognome,
// stessa squadra NBA e stessa iniziale del nome, se c'è un solo candidato (es. Ron ↔ Ronald); 3) nome dei tabellini; 4) nome ESPN così com'è.
const APP = new Map(), TVN = new Map(), BYLAST = new Map();
const firstOf = n => norm(String(n).trim().split(/\s+/)[0]).charAt(0);
const addName = (n, team) => { if (!n) return; const k = norm(n); if (!APP.has(k)) APP.set(k, n);
  if (team) { const l = lastOf(n) + "|" + team + "|" + firstOf(n); (BYLAST.get(l) || BYLAST.set(l, new Set()).get(l)).add(n); } };
Object.values(ROSTER).flat().forEach(r => addName(r[0], r[3])); Object.values(GL_STATS).forEach(g => addName(g.n, g.nba));
FA.forEach(f => addName(f[0], f[1])); Object.keys(PARTITE).forEach(n => addName(n)); Object.keys(FA_OWN).forEach(n => addName(n));
Object.keys(FAG).forEach(n => addName(n));
Object.values(TV.box).forEach(b => [...b.a, ...b.h].forEach(r => { const k = norm(r[0]); if (!TVN.has(k)) TVN.set(k, r[0]); }));
const ABBINATI = new Map();   // nomi abbinati per cognome+squadra (stampati nel riepilogo)
const appName = (n, team) => { const k = norm(n);
  if (APP.has(k)) return APP.get(k);
  const c = BYLAST.get(lastOf(n) + "|" + team + "|" + firstOf(n)); if (c && c.size === 1) { const a = [...c][0]; ABBINATI.set(n, a); return a; }
  return TVN.get(k) || n; };
const conosciuto = n => APP.has(norm(n)) || TVN.has(norm(n)) || ABBINATI.has(n);
// sigle ESPN diverse da quelle dell'app (come esAb in index.html)
const ESPN_AB = { GS: "GSW", NY: "NYK", NO: "NOP", SA: "SAS", UTAH: "UTA", WSH: "WAS" }, esAb = a => ESPN_AB[a] || a;
const ROLE = {}; Object.values(ROSTER).flat().forEach(r => ROLE[r[0]] = r[2]); FA.forEach(f => { if (f[2] && !ROLE[f[0]]) ROLE[f[0]] = f[2]; });
const roleOf = (n, espnPos) => ROLE[n] || ({ PG: "G", SG: "G", SF: "F", PF: "F" }[espnPos] || String(espnPos || "").charAt(0) || "");

/* ---------- PDK: stessa formula di tvPdk in index.html ---------- */
function tvPdk(s, starter, win) {
  let v = s.points + s.reboundsDefensive + 1.25 * s.reboundsOffensive + 1.5 * (s.assists + s.steals + s.blocks) - 1.5 * s.turnovers - .5 * (s.blocksReceived || 0)
    - (s.fieldGoalsAttempted - s.fieldGoalsMade) - (s.freeThrowsAttempted - s.freeThrowsMade) + (starter ? 1 : 0);
  const t = s.threePointersMade; v += t >= 5 ? 5 : t >= 3 ? t : 0;
  const c = [s.points, s.reboundsTotal, s.assists, s.steals, s.blocks].filter(x => x >= 10).length; v += c >= 4 ? 50 : c === 3 ? 10 : c === 2 ? 5 : 0;
  if (win) v += .05 * Math.abs(v); return Math.round(v * 100) / 100; }

/* ---------- partita di un giocatore (stessi campi che dava Dunkest) ---------- */
// g = {gameDate, team, opp, min, sec, pdk, starter, pts, oreb, dreb, reb, ast, stl, blk, tov, pf, fgm, fga, tpm, tpa, ftm, fta, plusMinus, pos}
const LOG = {};   // nome app -> {p:{team,pos}, L:[partite ordinate per data]}
const addGame = (n, g) => { const D = LOG[n] || (LOG[n] = { p: {}, L: [] }); D.L.push(g); };

// 1) storico: tabellini di Dynasty TV delle notti già caricate (dati ufficiali di allora, Dunkest compreso)
const fromRow = (d, team, opp, r) => { const [m, s] = String(r[2] || "0:00").split(":").map(Number);
  return { gameDate: d, team, opp, min: m || 0, sec: s || 0, starter: r[1], pts: +r[3], oreb: +r[4], dreb: +r[5], reb: +r[6], ast: +r[7], stl: +r[8], blk: +r[9],
    tov: +r[10], pf: +r[11], fgm: +r[12], fga: +r[13], tpm: +r[14], tpa: +r[15], ftm: +r[16], fta: +r[17], plusMinus: +r[18], pdk: +r[19] }; };
let storico = 0;
for (const d of Object.keys(TV.days).sort()) { if (d < SEASON_START || d > lastDone) continue;
  for (const G of TV.days[d]) { const B = G[7] && TV.box[G[7]]; if (!B || G[5] !== "F") continue;
    for (const [sd, team, opp] of [["a", G[0], G[1]], ["h", G[1], G[0]]]) for (const r of B[sd] || []) { addGame(appName(r[0], team), fromRow(d, team, opp, r)); storico++; } } }
console.log(`Storico dai tabellini di Dynasty TV: ${storico} partite-giocatore fino al ${lastDone}`);
ABBINATI.clear();   // nel riepilogo solo gli abbinamenti dei nomi ESPN delle notti nuove

// 2) notti nuove da ESPN
const minEx = g => (+g.min || 0) + (+g.sec || 0) / 60;
const mmss = g => g.min + ":" + String(g.sec).padStart(2, "0");
const ERR = [], AVV = [], NUOVE = {};   // NUOVE[d] = [{A,H,sa,sh,ot,a:[righe],h:[righe]}]
const NONABB = new Map();               // nome ESPN -> squadra (nomi nuovi per l'app)
const STRANI = [];                      // minuti strani (anomalie da segnalare nel report, non bloccano)
const num = v => { const x = parseFloat(String(v == null ? "" : v).replace("+", "")); return isNaN(x) ? 0 : x; };
const pair = v => { const m = String(v || "").split("-"); return [num(m[0]), num(m[1])]; };
const FINO = FINO0; let dumped = [];
const rosterCheck = { attesi: 0, trovati: 0, mancanti: [] };
for (const d of NOTTI) {
  const sb = await getJSON(SB(d));
  const evs = (sb.events || []).filter(e => nyDate(new Date(e.date)) === d);
  const fatte = [], rinviate = [], aperte = [];
  for (const e of evs) { const c = e.competitions[0], ty = (e.status || c.status || {}).type || {};
    const h = c.competitors.find(x => x.homeAway === "home"), a = c.competitors.find(x => x.homeAway === "away");
    const A = esAb(a.team.abbreviation), H = esAb(h.team.abbreviation);
    if (/POSTPONED|CANCELED|CANCELLED/.test(ty.name || "")) rinviate.push(`${A}-${H}`);
    else if (ty.completed && ty.state === "post") fatte.push({ e, A, H, a, h, per: (e.status || {}).period || 0 });
    else aperte.push(`${A}-${H} (${ty.shortDetail || ty.description || ty.state})`); }
  if (aperte.length) {
    const msg = `Notte ${d}: partite non ancora finite su ESPN: ${aperte.join(", ")}`;
    // notte ancora in corso: di notte si aspetta (esce senza scrivere niente, la prossima corsa riprova); alla corsa delle 07:07 (--ultima) è un errore.
    // Non si caricano neanche le notti precedenti da sole: EFF.agg deve essere sempre "notte caricata + 1" (lo usa tools/dreamers.mjs)
    if (d === NOTTI[NOTTI.length - 1] && !ARG.ultima) esci(0, msg + " → notte in corso: niente da scrivere, riprova la prossima corsa");
    ERR.push(msg); continue; }
  if (rinviate.length) AVV.push(`${d}: partite rinviate/annullate su ESPN: ${rinviate.join(", ")}`);
  // ogni partita del calendario di Dynasty TV deve esserci su ESPN (finita o rinviata)
  const espnPairs = new Set([...fatte.map(x => x.A + "-" + x.H), ...rinviate]);
  for (const G of TV.days[d] || []) if (!espnPairs.has(G[0] + "-" + G[1])) ERR.push(`${d}: ${G[0]}-${G[1]} è nel calendario ma non su ESPN`);
  NUOVE[d] = [];
  for (const x of fatte) {
    const S = await getJSON(SUM(x.e.id)), P = (S.boxscore && S.boxscore.players) || [];
    const sa = num(x.a.score), sh = num(x.h.score), ot = x.per > 4 ? 1 : 0, gm = { A: x.A, H: x.H, sa, sh, ot, a: [], h: [] };
    for (const [sd, team, opp, mine, their] of [["a", x.A, x.H, sa, sh], ["h", x.H, x.A, sh, sa]]) {
      const T = P.find(t => esAb(t.team.abbreviation) === team); if (!T) { ERR.push(`${d} ${x.A}-${x.H}: manca il tabellino di ${team}`); continue; }
      const St = (T.statistics || [])[0] || {}, lab = (St.labels || St.names || []).map(z => String(z).toUpperCase()), ix = z => lab.indexOf(z);
      const win = mine > their; let somma = 0, minSq = 0; const visti = new Set();
      for (const p of St.athletes || []) {
        const nomeE = (p.athlete || {}).displayName || ""; if (!nomeE) continue;
        const n = appName(nomeE, team); visti.add(n);
        if (!conosciuto(nomeE)) NONABB.set(nomeE, team);
        if (p.didNotPlay || !p.stats || !p.stats.length) continue;
        const s = p.stats, gv = z => ix(z) >= 0 ? s[ix(z)] : 0;
        const [fgm, fga] = pair(gv("FG")), [tpm, tpa] = pair(gv("3PT")), [ftm, fta] = pair(gv("FT"));
        const st = { points: num(gv("PTS")), reboundsOffensive: num(gv("OREB")), reboundsDefensive: num(gv("DREB")), reboundsTotal: num(gv("REB")), assists: num(gv("AST")),
          steals: num(gv("STL")), blocks: num(gv("BLK")), blocksReceived: 0, turnovers: num(gv("TO")), fieldGoalsMade: fgm, fieldGoalsAttempted: fga,
          threePointersMade: tpm, threePointersAttempted: tpa, freeThrowsMade: ftm, freeThrowsAttempted: fta };
        // minuti: "34" (interi) oppure "34:12" se ESPN li dà con i secondi
        const mn = String(gv("MIN") || "0"), [mm, ss] = mn.includes(":") ? mn.split(":").map(z => parseInt(z) || 0) : [parseInt(mn) || 0, 0];
        somma += st.points;
        // chi è entrato per pochi secondi ESPN lo segna "0" minuti: la partita conta lo stesso (Dunkest la contava, es. 0:19), con efficienza 0
        if (mm >= 50 && !ot) STRANI.push(`${nomeE} (${team} ${d}): ${mm} minuti senza supplementari`);
        if (!mm && !ss && (st.points || st.reboundsTotal || st.assists || fga || fta)) STRANI.push(`${nomeE} (${team} ${d}): 0 minuti ma con statistiche`);
        minSq += mm + ss / 60;
        const g = { gameDate: d, team, opp, min: mm, sec: ss, starter: p.starter ? 1 : 0, pts: st.points, oreb: st.reboundsOffensive, dreb: st.reboundsDefensive,
          reb: st.reboundsTotal, ast: st.assists, stl: st.steals, blk: st.blocks, tov: st.turnovers, pf: num(gv("PF")), fgm, fga, tpm, tpa, ftm, fta,
          plusMinus: Math.round(num(gv("+/-"))), pdk: tvPdk(st, !!p.starter, win), pos: ((p.athlete || {}).position || {}).abbreviation || "", espn: nomeE };
        if (gm[sd].some(y => y.n === n)) ERR.push(`${d} ${team}: due giocatori ESPN con lo stesso nome nell'app (${n})`);
        gm[sd].push({ n, g }); if (ARG.dump) dumped.push({ n, ...g });
      }
      if (somma !== mine) ERR.push(`${d} ${x.A}-${x.H}: somma punti giocatori ${team} ${somma} ≠ punteggio ${mine}`);
      // minuti di squadra: 240 + 25 per ogni supplementare; con i minuti interi di ESPN si sbaglia di qualche minuto (tolleranza 8)
      const att = 240 + 25 * Math.max(0, x.per - 4);
      if (Math.abs(minSq - att) > 8) STRANI.push(`${team} ${d} (${x.A}-${x.H}): minuti di squadra ${Math.round(minSq)} invece di ${att}`);
      if ((gm[sd] || []).length < 5) ERR.push(`${d} ${x.A}-${x.H}: tabellino di ${team} con meno di 5 giocatori`);
      // giocatori dei roster di questa squadra NBA: devono comparire nel tabellino ESPN (anche come "non entrato"); chi manca è
      // infortunato/inattivo oppure ha il nome non abbinato. Se mancano in troppi → stop (nomi ESPN cambiati?)
      for (const r of Object.values(ROSTER).flat()) if (r[3] === team) { rosterCheck.attesi++; if (visti.has(r[0])) rosterCheck.trovati++; else rosterCheck.mancanti.push(`${r[0]} (${team} ${d})`); }
    }
    NUOVE[d].push(gm);
  }
  console.log(`  ESPN ${d}: ${fatte.length} partite finite${rinviate.length ? `, ${rinviate.length} rinviate` : ""} (calendario Dynasty TV: ${(TV.days[d] || []).length})`);
}
if (rosterCheck.attesi) { const q = 1 - rosterCheck.trovati / rosterCheck.attesi;
  console.log(`Giocatori dei roster trovati nei tabellini ESPN: ${rosterCheck.trovati}/${rosterCheck.attesi} (non trovati ${Math.round(q * 100)}%: infortunati/inattivi o nomi diversi)`);
  if (rosterCheck.mancanti.length) console.log(`  non trovati: ${rosterCheck.mancanti.join(", ")}`);
  if (q > MAX_NON_TROVATI) ERR.push(`troppi giocatori dei roster non trovati nei tabellini ESPN (${Math.round(q * 100)}% > ${MAX_NON_TROVATI * 100}%): nomi ESPN cambiati?`); }
if (ABBINATI.size) console.log("Nomi ESPN abbinati per cognome + squadra:\n" + [...ABBINATI].map(([e, a]) => `  "${e}" (ESPN) = "${a}" (app)`).join("\n"));
if (NONABB.size) console.log(`Nomi ESPN che l'app non conosce (nuovi giocatori: entrano come free agent se giocano) ${NONABB.size}: ` + [...NONABB].map(([n, t]) => `${n} (${t})`).join(", "));
if (STRANI.length) console.log("Minuti strani:\n  " + STRANI.join("\n  "));
if (AVV.length) console.log("Avvisi:\n  " + AVV.join("\n  "));
if (ARG.dump) { writeFileSync(ARG.dump, JSON.stringify(dumped)); console.log(`(prova) partite ESPN salvate in ${ARG.dump}`); }
if (ERR.length) esci(2, `\nERRORE: dati ESPN non affidabili, nessun file scritto:\n  ${ERR.join("\n  ")}`);
if (!NOTTI.length && !ARG.forza) esci(0, "Nessuna notte completa da caricare: niente da aggiornare.");

// partite nuove nel registro dei giocatori (dopo lo storico, quindi in ordine di data)
for (const d of NOTTI) for (const gm of NUOVE[d] || []) for (const sd of ["a", "h"]) for (const { n, g } of gm[sd]) addGame(n, g);
for (const D of Object.values(LOG)) { D.L.sort((a, b) => a.gameDate.localeCompare(b.gameDate)); const u = D.L[D.L.length - 1];
  D.p.team = u.team; }
for (const [n, D] of Object.entries(LOG)) D.p.pos = roleOf(n, (D.L.findLast(g => g.pos) || {}).pos);
const L0 = Object.values(LOG).filter(D => D.L.some(g => g.gameDate > lastDone)).length;
console.log(`Giocatori con almeno una partita: ${Object.keys(LOG).length} (${L0} nelle notti nuove)`);

/* ---------- da qui in giù: stessi calcoli e stessi formati del report Dunkest ---------- */
const rowOf = g => { const m = minEx(g), pdk = +g.pdk; return [ddmm(g.gameDate), g.opp, r1(m), pdk, m ? r2(pdk / m) : 0, +g.pts, +g.reb, +g.ast]; };
const rowsOf = n => (LOG[n] ? LOG[n].L.map(rowOf) : null);
const effW = L => { const m = L.reduce((a, g) => a + minEx(g), 0); return m ? r2(L.reduce((a, g) => a + +g.pdk, 0) / m) : null; };
const minMed = L => L.length ? r1(mean(L.map(minEx))) : null;

/* PARTITE (roster + G League + diritti FA), ricostruite per intero */
const TRACK = new Set([...Object.values(ROSTER).flat().map(r => r[0]), ...Object.keys(PARTITE), ...Object.keys(FA_OWN), ...Object.values(GL_STATS).map(g => g.n)]);
let cambiate = 0;
for (const n of TRACK) { const R = rowsOf(n); if (!R) continue; if (JSON.stringify(R) !== JSON.stringify(PARTITE[n] || [])) cambiate++; PARTITE[n] = R; }
for (const n of Object.keys(PARTITE)) if (!PARTITE[n].length) delete PARTITE[n];
console.log(`PARTITE: ${Object.keys(PARTITE).length} giocatori, ${cambiate} aggiornati`);

/* EFF e ULTIMA */
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

/* G League (GL_STATS) */
for (const g of Object.values(GL_STATS)) { const D = LOG[g.n]; if (!D || !D.L.length) continue; const L = D.L;
  g.log = L.map(rowOf); g.g = L.length; g.m = minMed(L); g.p = r1(mean(L.map(x => +x.pdk))); g.e = effW(L); g.l5 = effW(L.slice(-5)); }

/* Free agent: partite (FAG) e medie stagionali (FA) */
const inRoster = new Set(Object.values(ROSTER).flat().map(r => r[0]));
const LOGN = new Map(Object.entries(LOG).map(([n, D]) => [norm(n), D]));
const faByNorm = new Map(FA.map(f => [norm(f[0]), f]));
for (const [n, D] of Object.entries(LOG)) { if (inRoster.has(n) || !D.L.length || faByNorm.has(norm(n)) || TRACK.has(n)) continue;
  const f = [n, D.p.team, D.p.pos, "", {}]; FA.push(f); faByNorm.set(norm(n), f); console.log(`  nuovo free agent: ${n} (${D.p.team})`); }
const fagKey = new Map(Object.keys(FAG).map(k => [norm(k), k]));
for (const f of FA) { if (inRoster.has(f[0])) continue; const D = LOGN.get(norm(f[0])); if (!D || !D.L.length) continue;
  const k = fagKey.get(norm(f[0])) || f[0]; (FAG[k] || (FAG[k] = {}))[SEASON_LAB] = D.L.map(rowOf);
  f[1] = D.p.team;
  // medie della stagione come le dava Dunkest: [partite, minuti medi, PDK medi, PDK medi / minuti medi, punti, rimbalzi, assist]
  // (Dunkest arrotonda queste medie con il mezzo lontano da zero: 3,25 → 3,3 e −0,25 → −0,3; verificato sui dati del 10/11)
  const L = D.L, hu = x => x == null ? null : Math.sign(x) * Math.round(+Math.abs(x * 10).toFixed(6)) / 10 + 0, mn = hu(mean(L.map(minEx))), pk = hu(mean(L.map(g => +g.pdk)));
  f[4][FA_LAB] = [L.length, mn, pk, mn ? r2(pk / mn) : null, hu(mean(L.map(g => +g.pts))), hu(mean(L.map(g => +g.reb))), hu(mean(L.map(g => +g.ast)))]; }
const lastPdk = f => { for (const s of [FA_LAB, "25/26", "24/25"]) if (f[4][s]) return f[4][s][2]; return -999; };
const FA2 = FA.filter(f => !inRoster.has(f[0]) || FA_OWN[f[0]]);
FA2.sort((a, b) => lastPdk(b) - lastPdk(a));

/* Dynasty TV: risultati e tabellini delle notti nuove (tv-data.js). src:"ESPN" = tabellino ufficiale preso da ESPN */
const riga = ({ n, g }) => [n, g.starter, mmss(g), g.pts, g.oreb, g.dreb, g.reb, g.ast, g.stl, g.blk, g.tov, g.pf, g.fgm, g.fga, g.tpm, g.tpa, g.ftm, g.fta, g.plusMinus, g.pdk];
const ord = L => L.slice().sort((a, b) => (b.g.starter - a.g.starter) || ((b.g.min * 60 + b.g.sec) - (a.g.min * 60 + a.g.sec)) || (b.g.pts - a.g.pts));
for (const d of NOTTI) {
  const day = TV.days[d] || (TV.days[d] = []);
  for (const gm of NUOVE[d] || []) { const key = `${d}_${gm.A}${gm.H}`;
    TV.box[key] = { a: ord(gm.a).map(riga), h: ord(gm.h).map(riga), src: "ESPN" };
    let G = day.find(z => z[0] === gm.A && z[1] === gm.H); if (!G) { G = [gm.A, gm.H, null, null, 0, "S", "", ""]; day.push(G); }
    G[2] = gm.sa; G[3] = gm.sh; G[4] = gm.ot; G[5] = "F"; G[6] = ""; G[7] = key; }
  console.log(`  Dynasty TV ${d}: ${(NUOVE[d] || []).length} partite ESPN su ${day.length} in calendario`);
}
const rec = {}; Object.keys(TV.teams).forEach(t => rec[t] = [0, 0]);
for (const day of Object.values(TV.days)) for (const G of day) if (G[5] === "F" && G[2] != null) { const wA = G[2] > G[3];
  (rec[G[0]] ||= [0, 0])[wA ? 0 : 1]++; (rec[G[1]] ||= [0, 0])[wA ? 1 : 0]++; }
TV.rec = rec; TV.upd = `${AGG} · ${ORA}`;
TV.src = "Risultati e tabellini: dati ufficiali ESPN (PDK con la formula Dunkest; fino al 10/11/2026 dati Dunkest). Calendario: Land of Basketball.";

/* controlli finali e scrittura */
const J = x => JSON.stringify(x);
const effTxt = `{agg:${J(AGG)},\n squadre:${J(squadre)},\n gioc:{\n` + Object.entries(gioc).map(([t, r]) => ` ${t}:${J(r)}`).join(",\n") + `}}`;
console.log("\nEfficienza squadre:\n" + squadre.map(s => `  ${s[0]}  notte ${s[1]} gioc. ${s[2]} PDK eff ${s[3]}  ·  stagione eff ${s[4]} PDK ${s[5]}`).join("\n"));
const senza = Object.values(ROSTER).flat().filter(r => !LOG[r[0]]).map(r => r[0]);
if (senza.length) console.log(`Giocatori dei roster senza partite (infortunati o non ancora entrati): ${senza.join(", ")}`);
if (ROMA_ISO !== addDay(FINO, 1) && !ARG.fino) console.log(`ATTENZIONE: dati al ${AGG} ma ultima notte ${FINO}`);
if (ARG.prova) esci(0, "\n--prova: nessun file scritto");
html = setConst(html, "PARTITE", J(PARTITE));
html = setConst(html, "EFF", effTxt);
html = setConst(html, "ULTIMA", `{agg:${J(AGG)},gioc:${J(ult)}}`);
html = setConst(html, "GL_STATS", J(GL_STATS));
html = setConst(html, "FA", J(FA2));
html = html.replace(/const FA_AGG="[^"]*"/, `const FA_AGG=${J(AGG)}`);
// registro della corsa (REPORT_INFO) e riga in fondo all'app: anomalie = cose da guardare (non bloccano), info = solo per conoscenza
const anomalie = [
  ...[...NONABB].map(([n, t]) => `Nome ESPN non abbinato a nessun giocatore dell'app: ${n} (${t})`),
  ...STRANI.map(x => `Minuti strani: ${x}`), ...AVV];
const info = [`Notti: ${NOTTI.map(ddmm).join(", ") || "nessuna"} · partite ${NOTTI.reduce((a, d) => a + (NUOVE[d] || []).length, 0)} · giocatori ${L0}`,
  `Controlli superati: ESPN raggiungibile, tutte le partite del calendario finite e presenti, somma punti = punteggio, giocatori dei roster trovati ${rosterCheck.trovati}/${rosterCheck.attesi}`,
  ...[...ABBINATI].map(([e, a]) => `Nome abbinato per cognome e squadra: ${e} (ESPN) = ${a}`),
  ...(rosterCheck.mancanti.length ? [`Giocatori dei roster non nei tabellini (infortunati o inattivi): ${rosterCheck.mancanti.join(", ")}`] : [])];
html = registraCorsa(html, { fonte: "ESPN", agg: AGG, ora: ORA, notti: NOTTI, fino: FINO, anomalie, info }, getConst, setConst);
writeFileSync("index.html", html);
writeFileSync("fa-games.js", setConst(faSrc, "FAG", J(FAG)));
writeFileSync("tv-data.js", setConst(tvSrc, "TV", J(TV)));
console.log(`\nScritti index.html, fa-games.js, tv-data.js · aggiornamento ${AGG} ${ORA} · dati fino alla notte del ${FINO}`);
