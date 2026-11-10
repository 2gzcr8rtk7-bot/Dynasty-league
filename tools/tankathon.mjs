// DREAMERS – (1563) COLLEGE: i primi 60 del big board di Tankathon per il Draft 2027 (Statistiche › College).
// Scrive college-data.js (COLDRAFT). Lo lancia GitHub ogni mattina alle 08:00 UTC e la domenica alle 17:00 UTC (college.yml), seguito da
// tools/college-espn.mjs (1564) che sostituisce il game log con le partite complete di ESPN. Prova a mano: node tools/tankathon.mjs && node tools/college-espn.mjs
// Dalla pagina del giocatore si prendono le medie a partita (G, MP, FGM-FGA, 3PM-3PA, FTM-FTA, REB, AST, BLK, STL, TO, PF, PTS),
// il game log della stagione e si aggiorna uno storico settimanale (h) per il trend ▲/▼.
// I PDK (Dunkest) si calcolano nell app con la stessa formula di questo file (pdkG / pdkS): qui servono solo per lo storico.
import { writeFileSync, readFileSync } from "node:fs";
const BASE = "https://www.tankathon.com", N = 60, UA = { "user-agent": "Mozilla/5.0" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return await r.text() } catch (e) {}
    await sleep(1500 * (i + 1));
  }
  throw new Error("Tankathon non risponde: " + url);
}
const strip = s => s.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "|").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s*\|[\s|]*/g, "|");
const num = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0 };
const MES = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
/* una stagione "2026-27" va da novembre ad aprile: i mesi dopo luglio sono del primo anno */
const isoD = (d, y0) => { const [m, g] = d.trim().split(/\s+/), mm = MES[m] || 0; return mm ? `${mm > 7 ? y0 : y0 + 1}-${String(mm).padStart(2, "0")}-${String(+g).padStart(2, "0")}` : d };
const pr = s => { const [a, b] = String(s).split("-"); return [num(a), num(b)] };
/* PDK Dunkest (come tvPdk dell app) adattato ai dati di Tankathon, che non hanno rimbalzi offensivi/difensivi, titolare e stoppate subite:
   rimbalzi × 1,075 (30% offensivi × 1,25 + 70% difensivi × 1), titolare = almeno 20 minuti, stoppate subite = 0.
   Partita (game log [data, avv, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS]): con bonus triple, doppie/triple doppie e vittoria (+5%). */
const pdkG = g => { let v = g[16] + 1.075 * g[10] + 1.5 * (g[11] + g[13] + g[12]) - 1.5 * g[14] - (g[5] - g[4]) - (g[9] - g[8]) + (g[3] >= 20 ? 1 : 0);
  const t = g[6]; v += t >= 5 ? 5 : t >= 3 ? t : 0; const c = [g[16], g[10], g[11], g[13], g[12]].filter(x => x >= 10).length; v += c >= 4 ? 50 : c === 3 ? 10 : c === 2 ? 5 : 0;
  if (g[2] === "W") v += .05 * Math.abs(v); return v };
/* medie a partita s = [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS]: senza bonus di partita (si usa solo se manca il game log) */
const pdkS = s => s[14] + 1.075 * s[8] + 1.5 * (s[9] + s[11] + s[10]) - 1.5 * s[12] - (s[3] - s[2]) - (s[7] - s[6]) + (s[1] >= 20 ? 1 : 0);
const pdkSea = (s, gl) => +(gl.length ? gl.reduce((a, g) => a + pdkG(g), 0) / gl.length : pdkS(s)).toFixed(2);
/* storico settimanale: si riparte da quello già scritto in college-data.js */
let OLD = { h: {} };
try { OLD = new Function(readFileSync(new URL("../college-data.js", import.meta.url), "utf8") + ";return COLDRAFT")() || OLD } catch (e) {}
const html = await get(BASE + "/big_board");
const rows = [...html.matchAll(/<div class="mock-row" data-pos="([^"]*)" data-year="([^"]*)">([\s\S]*?)(?=<div class="mock-row" |<\/div><\/div><\/div><div id|$)/g)];
const ent = s => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const list = [];
for (const m of rows) {
  const r = m[3], rk = +((r.match(/mock-row-pick-number">(\d+)/) || [])[1] || 0), slug = (r.match(/href="\/players\/([^"]+)"/) || [])[1];
  if (!rk || !slug || list.some(x => x.slug === slug)) continue;
  const name = ent(((r.match(/mock-row-name">([^<]*)/) || [])[1] || "").trim());
  const sp = ((r.match(/mock-row-school-position">([^<]*)/) || [])[1] || "").split("|").map(x => x.trim());
  const ya = r.match(/year-age desktop"><div>([^<]*)<\/div><div>([^<]*)/) || [];
  const hw = r.match(/height-weight"><div>([^<]*)<\/div><div>(\d+)/) || [];
  list.push({ rk, slug, n: name, pos: sp[0] || m[1], sc: ent(sp[1] || ""), yr: ya[1] || m[2], age: num(ya[2]), h: ent(hw[1] || ""), w: num(hw[2]) });
}
list.sort((a, b) => a.rk - b.rk);
const top = list.slice(0, N), out = [];
if (top.length < N / 2) throw new Error("big board incompleto: " + top.length + " giocatori");
for (const x of top) {
  await sleep(400);
  let t = "", raw = ""; try { raw = await get(`${BASE}/players/${x.slug}`); t = strip(raw) } catch (e) { console.log("salto", x.slug); }
  const i = t.indexOf("PER GAME AVERAGES"), j = t.indexOf("PER 36 MINUTES", i), blk = i >= 0 ? t.slice(i, j > i ? j : i + 600) : "";
  const v = k => { const m = blk.match(new RegExp("\\|" + k + "\\|([^|]*)")); return m ? m[1].trim() : "" };
  const [fgm, fga] = pr(v("FGM-FGA")), [tpm, tpa] = pr(v("3PM-3PA")), [ftm, fta] = pr(v("FTM-FTA"));
  /* game log della stagione in corso (tabella "GAME LOG"): con più stagioni (un div "stats" per anno) si prende la più recente */
  const gl = [], gs = raw.indexOf("GAME LOG"), ge = raw.lastIndexOf("game-log-note");
  const seg = gs >= 0 ? raw.slice(gs, ge > gs ? ge : undefined).split(/<div class="stats" /).slice(1) : [];
  const yr = z => +((z.match(/^data-year="(\d{4})/) || [])[1] || 0), cur = seg.reduce((a, z) => yr(z) > yr(a) ? z : a, seg[0] || "");
  const y0 = +((cur.match(/^data-year="(\d{4})/) || [])[1] || 2026), stag = cur ? (cur.match(/^data-year="([^"]*)"/) || [])[1] || "" : "";
  if (cur) for (const g of cur.matchAll(/<tr class="game">([\s\S]*?)<\/tr>/g)) {
    const c = [...g[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>(?=<td|$)/g)].map(z => z[1]);
    const dt = ((c[0] || "").match(/class="desktop">([^<]*)/) || [])[1] || "", opp = strip(c[1] || "").split("|").filter(Boolean);
    const [a1, b1] = pr(strip(c[4] || "").replace(/\|/g, "")), [a2, b2] = pr(strip(c[5] || "").replace(/\|/g, "")), [a3, b3] = pr(strip(c[6] || "").replace(/\|/g, ""));
    const n = k => num(strip(c[k] || "").replace(/\|/g, ""));
    /* colonne Tankathon: DATA, AVV, MIN, GS (game score), FG, 3PT, FT, REB, AST, STL, BLK, TO, PF, PTS
       → [data, avversario, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] */
    gl.push([isoD(dt, y0), opp[0] || "", opp[1] || "", n(2), a1, b1, a2, b2, a3, b3, n(7), n(8), n(10), n(9), n(11), n(12), n(13)]);
  }
  const md = t.match(/MOCK DRAFT\|Rd\|\s*(\d+)\s*\|Pick\|\s*(\d+)/) || [], bb = t.match(/BIG BOARD\|Ovr\|\s*(\d+)/) || [];
  out.push([x.n, x.pos, x.sc, x.yr, x.age, x.h, x.w, x.rk, md[1] ? +md[1] : 0, md[2] ? +md[2] : 0,
    [num(v("G")), num(v("MP")), fgm, fga, tpm, tpa, ftm, fta, num(v("REB")), num(v("AST")), num(v("BLK")), num(v("STL")), num(v("TO")), num(v("PF")), num(v("PTS"))], x.slug, gl, stag]);
}
const oggi = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date()), H = OLD.h || {};
/* snapshot della settimana: {d, G, MP, a (PDK a partita), s (medie)}; stessa data = si sovrascrive, massimo 40 settimane.
   (1564) il workflow ora gira anche ogni mattina: la foto si scrive solo la DOMENICA (ora italiana), o la prima volta per un prospetto nuovo,
   così il trend ▲/▼ resta settimana su settimana. SNAP=1 la forza (prova a mano). La ricalcola poi tools/college-espn.mjs con le partite ESPN. */
const domenica = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome", weekday: "short" }).format(new Date()) === "Sun" || process.env.SNAP === "1";
for (const r of out) {
  const s = r[10]; if (!(s[0] > 0)) continue;
  if (!domenica && (H[r[11]] || []).length) continue;
  const L = (H[r[11]] || []).filter(z => z.d !== oggi); L.push({ d: oggi, G: s[0], MP: s[1], a: pdkSea(s, r[12]), s });
  H[r[11]] = L.slice(-40);
}
const COLDRAFT = { upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), src: "Tankathon", draft: 2027,
  campi: "p: [nome, ruolo, college/squadra, anno, età al draft, altezza, peso, posto nel big board, mock giro, mock scelta, [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS], slug, game log [[data, avversario, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS]], stagione del game log]; h: {slug: [{d, G, MP, a (PDK), s}]} storico settimanale", p: out, h: H };
writeFileSync(new URL("../college-data.js", import.meta.url), "/* DREAMERS – (1563) College: prospetti del Draft 2027 da Tankathon, generato da tools/tankathon.mjs, non modificare a mano */\nconst COLDRAFT=" + JSON.stringify(COLDRAFT) + ";\n");
console.log("prospetti:", out.length, "con statistiche:", out.filter(x => x[10][0] > 0).length, "partite nel game log:", out.reduce((a, x) => a + x[12].length, 0));
