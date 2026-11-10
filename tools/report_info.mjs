// (1566) REPORT DEI DATI: ogni corsa del report che scrive i dati ufficiali (tools/report_espn.mjs, o tools/report_dunkest.mjs se ESPN
// non è disponibile) lascia in index.html una riga in REPORT_INFO.runs (ultime 30) e aggiorna la riga in fondo all'app (footer #updbtn).
// L'app mostra il registro toccando il footer (Cronologia modifiche › Report dei dati): quando GitHub ha salvato, notti caricate,
// fonte, anomalie ed esito dei controlli.
// Usato da entrambi i report: registraCorsa(html, {...}, getConst, setConst) → html aggiornato.
export function registraCorsa(html, c, getConst, setConst) {
  const quando = `${c.agg} · ${c.ora}`, gh = !!process.env.GITHUB_ACTIONS;
  let RI = { runs: [] }; try { RI = getConst(html, "REPORT_INFO") || RI; } catch (e) {}
  const run = { quando, fonte: c.fonte, gh: gh ? 1 : 0, notti: c.notti, fino: c.fino, esito: c.anomalie.length ? "avvisi" : "ok", anomalie: c.anomalie, info: c.info || [] };
  // errore di ESPN che ha fatto usare Dunkest (lo passa il workflow nella variabile ESPN_ERR)
  if (process.env.ESPN_ERR) run.espn = String(process.env.ESPN_ERR).slice(0, 600);
  RI.runs = [run, ...(RI.runs || [])].slice(0, 30);
  html = setConst(html, "REPORT_INFO", JSON.stringify(RI));
  // footer: data-agg conserva "GG/MM/AAAA · HH:MM" (lo leggono i controlli dell'app); il testo dice fonte e quando è stato salvato
  const foot = `<footer class="wrap upd" id="updbtn" role="button" tabindex="0" aria-label="Apri il report dei dati" data-agg="${quando}">Dati ufficiali ${c.fonte} · salvati ${gh ? "da GitHub " : ""}il ${c.agg.slice(0, 5)} alle ${c.ora}<span class="updar">›</span></footer>`;
  const re = /<footer class="wrap upd" id="updbtn"[^>]*>[\s\S]*?<\/footer>/;
  if (!re.test(html)) throw new Error("footer #updbtn non trovato in index.html");
  return html.replace(re, foot);
}
