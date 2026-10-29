// Scarica i loghi ufficiali delle 30 squadre NBA (stessi file e stessa qualità già usati dall'app: primary/L/logo.svg)
// e li salva in loghi/nba/<id>.svg, così l'app li legge da sé e usa cdn.nba.com solo se un file manca.
// Si lancia da GitHub (workflow "loghi-nba"): da qui il sito NBA non è raggiungibile.
import fs from "node:fs";
const src = fs.readFileSync("tv-data.js", "utf8");
const TV = new Function(src.replace(/^const TV=/m, "return ") .replace(/;\s*$/, ""))();
fs.mkdirSync("loghi/nba", { recursive: true });
let ok = 0, ko = [];
for (const [sigla, [nome, id]] of Object.entries(TV.teams)) {
  const url = `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`;
  try {
    const r = await fetch(url);
    const t = await r.text();
    if (!r.ok || !/<svg[\s>]/i.test(t) || t.length < 500) throw new Error(`risposta non valida (${r.status}, ${t.length} byte)`);
    fs.writeFileSync(`loghi/nba/${id}.svg`, t);
    ok++; console.log("ok", sigla, nome, id, t.length);
  } catch (e) { ko.push(sigla); console.error("ERRORE", sigla, nome, e.message); }
}
console.log(`Scaricati ${ok}/30`);
if (ko.length) { console.error("Mancano:", ko.join(", ")); process.exit(1); }
