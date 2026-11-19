// (1156) Calendario NBA (ESPN) di un periodo: per ogni data USA le squadre che giocano. Serve a scegliere le date dei turni playoff.
// Uso: node tools/nba_cal.mjs 2027-02-25 2027-04-20 → nba-calendario.json
import { writeFileSync } from "node:fs";
const [da, a] = process.argv.slice(2);
const add = (d, k) => new Date(Date.parse(d + "T12:00:00Z") + k * 864e5).toISOString().slice(0, 10);
const AB = { NY: "NYK", SA: "SAS", GS: "GSW", NO: "NOP", UTAH: "UTA", WSH: "WAS" };
const out = {};
for (let d = da; d <= a; d = add(d, 1)) {
  let j = null;
  for (let i = 0; i < 3 && !j; i++) { try { const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}&limit=50`); if (r.ok) j = await r.json() } catch { } if (!j) await new Promise(r => setTimeout(r, 1500)) }
  out[d] = j ? (j.events || []).map(e => (e.competitions[0].competitors || []).map(c => AB[c.team.abbreviation] || c.team.abbreviation)) : null;
  console.log(d, out[d] ? out[d].length + " partite" : "ERRORE");
}
writeFileSync("nba-calendario.json", JSON.stringify(out));
