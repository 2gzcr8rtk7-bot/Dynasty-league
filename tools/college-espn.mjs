// DREAMERS – (1564) COLLEGE: partite COMPLETE dei prospetti da ESPN (API pubblica del basket universitario maschile).
// Si lancia DOPO tools/tankathon.mjs (stesso workflow college.yml, ogni mattina alle 09 italiane e la domenica alle 18).
// Prova a mano: node tools/college-espn.mjs
// 1) abbina ogni prospetto del college al suo id ESPN (college → squadra ESPN → roster, per nome); i giocatori delle leghe estere
//    (Baskonia, Nanterre…) non sono su ESPN college e restano con i dati di Tankathon;
// 2) dal game log ESPN dell atleta prende TUTTE le partite giocate della stagione e, per ciascuna, il tabellino della partita
//    (summary): minuti, punti, tiri, rimbalzi OFFENSIVI e DIFENSIVI, assist, recuperi, stoppate, palle perse, falli, TITOLARE e risultato;
// 3) sostituisce il game log di Tankathon (incompleto) con quello ESPN, ricalcola le medie e la foto settimanale di oggi (se c è).
// I tabellini delle partite finite non cambiano più: si tengono in tools/college-espn-cache.json così ogni giorno si scaricano solo le nuove.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
const API = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball";
const WEB = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/mens-college-basketball";
const FILE = new URL("../college-data.js", import.meta.url), CACHE = new URL("./college-espn-cache.json", import.meta.url);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function J(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }); if (r.ok) return await r.json(); if (r.status === 404) return null } catch (e) {}
    await sleep(1200 * (i + 1));
  }
  return null;
}
const nz = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\b(jr|sr|ii|iii|iv)\b\.?/g, "").replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();
const num = v => { const x = parseFloat(String(v == null ? "" : v).replace("+", "")); return Number.isFinite(x) ? x : 0 };
const pair = v => { const m = String(v || "").split("-"); return [num(m[0]), num(m[1])] };
/* PDK Dunkest ESATTO come tvPdk dell app (percorso ESPN: stoppate subite = 0, ESPN non le dà nel tabellino).
   riga ESPN [data, avv, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS, OREB, DREB, TIT, idPartita]
   (le prime 17 colonne sono le stesse del game log di Tankathon, così il resto dell app non cambia) */
export const pdkE = g => { let v = g[16] + g[18] + 1.25 * g[17] + 1.5 * (g[11] + g[13] + g[12]) - 1.5 * g[14] - (g[5] - g[4]) - (g[9] - g[8]) + (g[19] ? 1 : 0);
  const t = g[6]; v += t >= 5 ? 5 : t >= 3 ? t : 0; const c = [g[16], g[10], g[11], g[13], g[12]].filter(x => x >= 10).length; v += c >= 4 ? 50 : c === 3 ? 10 : c === 2 ? 5 : 0;
  if (g[2] === "W") v += .05 * Math.abs(v); return v };
/* ---------- dati di partenza ---------- */
const src = readFileSync(FILE, "utf8"), D = new Function(src + ";return COLDRAFT")();
let C = { ids: {}, ev: {} };
try { if (existsSync(CACHE)) C = Object.assign(C, JSON.parse(readFileSync(CACHE, "utf8"))) } catch (e) {}
/* ---------- 1) abbinamento prospetto → id ESPN ---------- */
const TJ = await J(`${API}/teams?limit=1000`);
const TEAMS = ((TJ && TJ.sports && TJ.sports[0].leagues[0].teams) || []).map(x => x.team);
const ALIAS = { "miami": "Miami", "uconn": "UConn" };/* nomi di Tankathon diversi da ESPN: si aggiungono qui */
const teamOf = sc => { const k = ALIAS[nz(sc)] || sc; return TEAMS.find(t => t.location === k) || TEAMS.find(t => nz(t.location) === nz(k)) || TEAMS.find(t => nz(t.displayName) === nz(k)) || null };
const ROST = {};
async function roster(tid) { if (!ROST[tid]) { const r = await J(`${API}/teams/${tid}/roster`); ROST[tid] = (r && r.athletes) || [] } return ROST[tid] }
let matched = 0;
for (const r of D.p) {
  const slug = r[11]; let M = C.ids[slug];
  const T = teamOf(r[2]);
  if (!T) { delete C.ids[slug]; continue }/* lega estera: niente ESPN */
  if (!M || M.t !== T.id) {
    const L = await roster(T.id), n = nz(r[0]), sur = n.split(" ").slice(-1)[0];
    const a = L.find(x => nz(x.displayName) === n) || L.find(x => nz(x.fullName) === n) ||
      L.find(x => nz(x.lastName) === sur && nz(x.firstName)[0] === n[0]) || L.find(x => nz(x.lastName) === sur && L.filter(y => nz(y.lastName) === sur).length === 1);
    if (a) M = C.ids[slug] = { a: a.id, t: T.id, n: a.displayName }; else { console.log("non trovato su ESPN:", r[0], "·", r[2]); delete C.ids[slug]; continue }
  }
  matched++; r[14] = M.a; r[15] = M.t;
}
/* ---------- 2) partite della stagione e tabellini ---------- */
function boxRow(S, aid) {
  const comp = S.header && S.header.competitions && S.header.competitions[0]; if (!comp) return null;
  for (const side of (S.boxscore && S.boxscore.players) || []) {
    const st = (side.statistics || [])[0] || {}, lab = (st.labels || st.names || []).map(x => String(x).toUpperCase()), ix = k => lab.indexOf(k);
    const p = (st.athletes || []).find(z => z.athlete && String(z.athlete.id) === String(aid)); if (!p) continue;
    if (p.didNotPlay || !p.stats || !p.stats.length) return "dnp";
    const g = k => ix(k) >= 0 ? p.stats[ix(k)] : 0, [fgm, fga] = pair(g("FG")), [tpm, tpa] = pair(g("3PT")), [ftm, fta] = pair(g("FT"));
    const me = comp.competitors.find(c => String(c.team.id) === String(side.team.id)), op = comp.competitors.find(c => c !== me) || {};
    const fin = comp.status && comp.status.type && comp.status.type.completed;
    const wl = fin ? (me && me.winner ? "W" : "L") : "";
    /* data della partita: giorno USA (ET), come Tankathon */
    const d = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/New_York" }).format(new Date(comp.date));
    const opp = (op.team || {}).location || (op.team || {}).displayName || "";
    return [d, opp, wl, Math.round(num(g("MIN"))), fgm, fga, tpm, tpa, ftm, fta, num(g("REB")), num(g("AST")), num(g("BLK")), num(g("STL")), num(g("TO")), num(g("PF")), num(g("PTS")), num(g("OREB")), num(g("DREB")), p.starter ? 1 : 0, String(comp.id)];
  }
  return null;
}
let nuove = 0, tot = 0;
for (const r of D.p) {
  const M = C.ids[r[11]]; if (!M) continue;
  const GL = await J(`${WEB}/athletes/${M.a}/gamelog`); await sleep(250);
  if (!GL) { console.log("game log ESPN assente:", r[0]); continue }
  /* ESPN dà l ultima stagione giocata, divisa in regular season e postseason ("2025-26 Season", "2025-26 Postseason"): si prendono tutte e due.
     Chi non ha ancora giocato quest anno resta con la stagione scorsa, come su Tankathon */
  const ST = GL.seasonTypes || [], stag = ((ST[0] || {}).displayName || "").split(" ")[0], evs = [];
  for (const sea of ST) if (String(sea.displayName || "").startsWith(stag + " ")) for (const cat of sea.categories || []) for (const e of cat.events || []) if (!evs.includes(String(e.eventId))) evs.push(String(e.eventId));
  const rows = [];
  for (const id of evs) {
    let E = C.ev[id];
    if (!E || !E.fin || !(M.a in (E.r || {}))) {
      const S = await J(`${API}/summary?event=${id}`); await sleep(250); nuove++;
      if (!S) continue;
      const comp = S.header && S.header.competitions && S.header.competitions[0], fin = !!(comp && comp.status && comp.status.type && comp.status.type.completed);
      E = C.ev[id] = { fin, r: Object.assign({}, (E && E.r) || {}) };
      /* nello stesso tabellino si salvano tutti i prospetti delle due squadre (un solo download per partita) */
      for (const z of D.p) { const Z = C.ids[z[11]]; if (!Z) continue; const b = boxRow(S, Z.a); if (b) E.r[Z.a] = b === "dnp" ? 0 : b }
      if (!(M.a in E.r)) E.r[M.a] = 0;
    }
    if (E.fin && E.r[M.a]) rows.push(E.r[M.a]);
  }
  if (!rows.length && evs.length) continue;
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  tot += rows.length;
  r[12] = rows; r[13] = stag || r[13];
  /* medie a partita ricalcolate dalle partite ESPN: [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] */
  if (rows.length) { const n = rows.length, av = k => +(rows.reduce((a, g) => a + g[k], 0) / n).toFixed(1); r[10] = [n, av(3), av(4), av(5), av(6), av(7), av(8), av(9), av(10), av(11), av(12), av(13), av(14), av(15), av(16)] }
}
/* ---------- 3) foto settimanale di oggi (scritta da tankathon.mjs la domenica): si ricalcola con le partite ESPN ---------- */
const oggi = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date());
for (const r of D.p) {
  const L = (D.h || {})[r[11]], z = L && L[L.length - 1];
  if (!z || z.d !== oggi || !r[12].length || r[12][0].length < 21) continue;
  z.G = r[10][0]; z.MP = r[10][1]; z.s = r[10]; z.a = +(r[12].reduce((a, g) => a + pdkE(g), 0) / r[12].length).toFixed(2);
}
D.src = "Tankathon + ESPN"; D.espn = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date());
D.campi = "p: [nome, ruolo, college/squadra, anno, età al draft, altezza, peso, posto nel big board, mock giro, mock scelta, [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS], slug, game log [[data, avversario, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] + con ESPN anche OREB, DREB, titolare 1/0, id partita], stagione, id atleta ESPN, id squadra ESPN]; h: {slug: [{d, G, MP, a (PDK), s}]} storico settimanale (domenica)";
writeFileSync(FILE, "/* DREAMERS – (1563/1564) College: prospetti del Draft 2027 da Tankathon + partite complete da ESPN, generato da tools/tankathon.mjs e tools/college-espn.mjs, non modificare a mano */\nconst COLDRAFT=" + JSON.stringify(D) + ";\n");
writeFileSync(CACHE, JSON.stringify(C));
console.log("abbinati a ESPN:", matched, "/", D.p.length, "· partite:", tot, "· tabellini scaricati:", nuove);
