// (1143) ASSISTENTE GM – dati NBA per la sezione dell'area segreta Ducks. Gira su GitHub ogni giorno (da lì i siti sono raggiungibili).
// Fonti:
//  - Basketball Reference, contracts/players.html: tutti i contratti anno per anno, opzioni giocatore/squadra, garantito.
//  - Spotrac, free agents della prossima estate: tipo di free agent (UFA / RFA) e opzioni.
//  - Spotrac, cap: payroll, spazio nel cap, sopra/sotto la luxury tax e gli apron di ogni squadra.
//  - ESPN (API pubblica): ruoli ed età dai roster, notizie recenti per squadra (in inglese, con link).
// Scrive gm-nba.js (const GMNBA={...}). Se una fonte non risponde, tiene i dati del file precedente per quella parte.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "accept-language": "en-US,en;q=0.9" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, json = false, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return json ? await r.json() : await r.text(); console.log("HTTP", r.status, url) }
    catch (e) { console.log("ERR", url, e.message) }
    await sleep(1500 * (i + 1));
  }
  return null;
}
const strip = s => String(s || "").replace(/<!--|-->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const money = s => { const x = String(s || "").replace(/[$,\s]/g, ""); return x && !isNaN(+x) ? Math.round(+x / 1e4) / 100 : null }; // milioni con 2 decimali
const nz = n => String(n).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").replace(/\s+/g, " ").trim();

const OLD = existsSync("gm-nba.js") ? (() => { try { return JSON.parse(readFileSync("gm-nba.js", "utf8").replace(/^[\s\S]*?const GMNBA=/, "").replace(/;\s*$/, "")) } catch { return {} } })() : {};
const out = { upd: new Date().toISOString(), fonti: {}, contratti: OLD.contratti || {}, fa: OLD.fa || {}, cap: OLD.cap || {}, ruoli: OLD.ruoli || {}, news: OLD.news || {}, capLega: OLD.capLega || null };

/* Abbreviazioni: Basketball Reference / Spotrac → quelle di ESPN usate in Dynasty TV */
const AB = { BRK: "BKN", CHO: "CHA", PHO: "PHX", GSW: "GSW", NOP: "NOP", NYK: "NYK", SAS: "SAS", UTA: "UTA", WAS: "WAS", BKN: "BKN", PHX: "PHX", CHA: "CHA", NO: "NOP", NY: "NYK", SA: "SAS", GS: "GSW", UTAH: "UTA", WSH: "WAS" };
const ab = t => AB[t] || t;

/* ---------- 1) Basketball Reference: contratti ---------- */
{
  const h = await get("https://www.basketball-reference.com/contracts/players.html");
  if (h) {
    const C = {}; let n = 0;
    const tb = h.slice(h.indexOf('id="player-contracts"'));
    const head = [...tb.slice(0, tb.indexOf("</thead>")).matchAll(/data-stat="(y\d)"[^>]*>([^<]*)</g)].map(m => [m[1], m[2].trim()]);
    for (const row of tb.split("<tr").slice(1)) {
      if (!/data-stat="player"/.test(row)) continue;
      const cell = k => { const m = row.match(new RegExp(`<t[dh]([^>]*data-stat="${k}"[^>]*)>([\\s\\S]*?)</t[dh]>`)); return m ? { a: m[1], v: strip(m[2]) } : null };
      const p = cell("player"), t = cell("team_id"); if (!p || !p.v || !t) continue;
      const s = [], opt = [];
      for (let i = 1; i <= 6; i++) { const c = cell("y" + i); s.push(c ? money(c.v) : null); opt.push(c && /salary-pl/.test(c.a) ? "P" : c && /salary-tm/.test(c.a) ? "S" : c && /salary-et/.test(c.a) ? "E" : "") }
      const g = cell("remain_gtd");
      while (s.length && s[s.length - 1] == null) { s.pop(); opt.pop() }
      if (!s.length) continue;
      C[p.v] = { t: ab(t.v), s, o: opt.join("") ? opt : undefined, g: g ? money(g.v) : null }; n++;
    }
    console.log("Basketball Reference: contratti", n, "anni", head.map(x => x[1]).join(","));
    if (n > 300) { out.contratti = C; out.fonti.contratti = { src: "Basketball Reference", anni: head.map(x => x[1]), n } }
  }
}
await sleep(2000);

/* ---------- 2) Spotrac: free agent dell'estate prossima (UFA/RFA) ---------- */
{
  const y = new Date().getUTCMonth() >= 6 ? new Date().getUTCFullYear() + 1 : new Date().getUTCFullYear();
  const urls = [`https://www.spotrac.com/nba/free-agents/_/year/${y}`, `https://www.spotrac.com/nba/free-agents/_/year/${y}/view/player`];
  for (const u of urls) {
    const h = await get(u); if (!h) continue;
    const F = {}; let n = 0;
    for (const row of h.split("<tr").slice(1)) {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => strip(m[1]));
      if (tds.length < 4) continue;
      const nm = tds.find(x => /^[A-Z][A-Za-z.'\- ]+ [A-Z][A-Za-z.'\- ]+/.test(x)); if (!nm) continue;
      const ty = tds.find(x => /^(UFA|RFA|ETO|Player|Team|Club|PO|TO|CO|2-Way)/i.test(x)) || "";
      const tm = tds.find(x => /^[A-Z]{2,4}$/.test(x)) || "";
      F[nm.replace(/\s+\1$/, "")] = { y, ty: /RFA/i.test(ty) ? "RFA" : /UFA/i.test(ty) ? "UFA" : /player|PO/i.test(ty) ? "PO" : /team|club|TO|CO/i.test(ty) ? "TO" : ty.slice(0, 6), t: ab(tm) }; n++;
    }
    console.log("Spotrac FA", u, n);
    if (n > 50) { out.fa = F; out.fonti.fa = { src: "Spotrac", anno: y, n }; break }
  }
}
await sleep(2000);

/* ---------- 3) Spotrac: cap di ogni squadra ---------- */
{
  const h = await get("https://www.spotrac.com/nba/cap/");
  if (h) {
    const K = {}; let n = 0;
    for (const row of h.split("<tr").slice(1)) {
      const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => strip(m[1]));
      const lk = row.match(/\/nba\/([a-z-]+)\/cap/); if (!lk || tds.length < 5) continue;
      const nums = tds.map(money).filter(x => x != null);
      K[lk[1]] = { nome: tds.find(x => /[a-z]/.test(x) && !/\$/.test(x)) || lk[1], v: nums, raw: tds.slice(0, 12) }; n++;
    }
    console.log("Spotrac cap squadre", n, n ? JSON.stringify(Object.values(K)[0]).slice(0, 300) : "");
    if (n >= 25) { out.cap = K; out.fonti.cap = { src: "Spotrac", n } }
    const lg = h.match(/Salary Cap[^$]{0,80}\$([\d,]+)/i), tx = h.match(/Luxury Tax[^$]{0,80}\$([\d,]+)/i), a1 = h.match(/First Apron[^$]{0,80}\$([\d,]+)/i), a2 = h.match(/Second Apron[^$]{0,80}\$([\d,]+)/i);
    if (lg) out.capLega = { cap: money(lg[1]), tax: tx ? money(tx[1]) : null, apron1: a1 ? money(a1[1]) : null, apron2: a2 ? money(a2[1]) : null };
    console.log("Soglie lega", JSON.stringify(out.capLega));
  }
}

/* ---------- 3b) ripiego se Spotrac blocca: soglie del cap dalla storia del cap di Basketball Reference ---------- */
if (!out.fonti.cap) {
  const h = await get("https://www.basketball-reference.com/contracts/salary-cap-history.html");
  const sy = new Date().getUTCMonth() >= 6 ? new Date().getUTCFullYear() : new Date().getUTCFullYear() - 1, lab = `${sy}-${String(sy + 1).slice(2)}`;
  const row = h && h.split("<tr").find(r => r.includes(">" + lab + "<"));
  const v = row ? [...row.matchAll(/\$([\d,]{8,})/g)].map(m => money(m[1])) : [];
  console.log("Cap history", lab, JSON.stringify(v));
  // tax e apron: stessi rapporti col cap del contratto collettivo 2025/26 (187,9 / 195,9 / 207,8 su 154,6)
  if (v[0]) { out.capLega = { cap: v[0], tax: Math.round(v[0] * 1.215 * 10) / 10, apron1: Math.round(v[0] * 1.267 * 10) / 10, apron2: Math.round(v[0] * 1.344 * 10) / 10, stima: "tax e apron stimati dal cap" }; out.fonti.cap = { src: "Basketball Reference (cap) + stima soglie" } }
}

/* ---------- 4) ESPN: ruoli, età, numero; notizie per squadra ---------- */
{
  const T = await get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams", true);
  const teams = T ? T.sports[0].leagues[0].teams.map(x => x.team) : [];
  const R = {}, N = {}; let nr = 0, nn = 0;
  for (const tm of teams) {
    const abbr = ab(tm.abbreviation);
    const ro = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${tm.id}/roster`, true);
    for (const a of (ro && ro.athletes) || []) {
      const c = a.contract || {};
      R[a.displayName] = { t: abbr, p: (a.position || {}).abbreviation || "", e: a.age || null, j: a.jersey || "", exp: a.experience ? a.experience.years : null, sal: c.salary ? Math.round(c.salary / 1e4) / 100 : null, yr: c.yearsRemaining ?? null };
      nr++;
    }
    const nw = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news?team=${tm.id}&limit=12`, true);
    N[abbr] = ((nw && nw.articles) || []).map(x => ({ d: (x.published || "").slice(0, 10), h: x.headline, x: (x.description || "").slice(0, 280), u: ((x.links || {}).web || {}).href || "", pl: (x.categories || []).filter(c => c.type === "athlete").map(c => c.description).filter(Boolean) })).filter(x => x.h);
    nn += N[abbr].length;
    await sleep(300);
  }
  console.log("ESPN roster", nr, "notizie", nn);
  if (nr > 300) { out.ruoli = R; out.fonti.ruoli = { src: "ESPN", n: nr } }
  if (nn > 30) { out.news = N; out.fonti.news = { src: "ESPN", n: nn } }
}

/* ripiego free agent se Spotrac blocca: chi ha l'ultimo anno di contratto (o un'opzione) nella stagione in corso.
   RFA = 4 anni o meno di esperienza (fine contratto da rookie), altrimenti UFA. */
if (!out.fonti.fa && Object.keys(out.contratti).length) {
  const F = {}, y = new Date().getUTCMonth() >= 6 ? new Date().getUTCFullYear() + 1 : new Date().getUTCFullYear(), RI = {};
  for (const k in out.ruoli) RI[nz(k)] = out.ruoli[k];
  for (const k in out.contratti) { const c = out.contratti[k], r = RI[nz(k)], o1 = c.o && c.o[1];
    if (c.s.length === 1) F[k] = { y, ty: r && r.exp != null && r.exp <= 4 ? "RFA" : "UFA", t: c.t, d: 1 };
    else if (o1 === "P") F[k] = { y, ty: "PO", t: c.t, d: 1 }; else if (o1 === "S") F[k] = { y, ty: "TO", t: c.t, d: 1 } }
  out.fa = F; out.fonti.fa = { src: "dedotti dai contratti Basketball Reference", anno: y, n: Object.keys(F).length };
  console.log("FA dedotti", Object.keys(F).length);
}

/* incroci: nomi normalizzati per trovarsi tra le fonti */
out.idx = {}; for (const k of new Set([...Object.keys(out.contratti), ...Object.keys(out.ruoli), ...Object.keys(out.fa)])) out.idx[nz(k)] = k;
writeFileSync("gm-nba.js", `/* ASSISTENTE GM – generato da tools/gm_nba.mjs (GitHub, ogni giorno). Non modificare a mano. Cifre in milioni di dollari. */\nconst GMNBA=${JSON.stringify(out)};\n`);
console.log("gm-nba.js scritto:", Object.keys(out.contratti).length, "contratti,", Object.keys(out.fa).length, "free agent,", Object.keys(out.cap).length, "squadre cap,", Object.keys(out.ruoli).length, "giocatori ESPN");
