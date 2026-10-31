# Procedura: report dei GM → gusti, valori, formula del lunedì

Richiesta di Francesco (31/10/2026): ogni report dell'Allenamento IA va usato per **imparare** e trasformare quello che si impara in regole **automatiche**. I report di altre squadre si applicano e si pubblicano subito, poi si avvisa Francesco (non serve chiedere).

**Autonomia (Francesco, 31/10/2026 17:18):** Claude può cambiare LIBERAMENTE valori, pesi della formula del lunedì (età, infortuni, forma…) e regole, senza chiedere, quando l'INCROCIO di più GM lo giustifica (mai sul parere di un solo GM). Ogni cambio: nota in NOTE_SVILUPPO, riga nella tabella del §3, registro VAL_CORREZ se tocca i valori, pubblicazione e avviso a cose fatte.

## 1. A ogni report (subito)
1. `python3 tools/gm_fit.py vals` (valori di ADESSO: i report hanno i valori del momento in cui il GM ha risposto).
2. In base al tipo di report:
   - **Proposte**: `gm_fit.py proposte <tutti i report Proposte di quella squadra>` → `req`, `age`, `sc`, `role`. Se ci sono vecchi parametri, fare la media pesata sul numero di risposte.
   - **Confronto**: `gm_fit.py confronto <report>` → bonus `pl`. Si fonde con i vecchi `pl`: media dove ci sono entrambi, unione altrove; si tolgono i bonus sotto ±2,5.
   - **Valutazione**: `gm_fit.py valutazione <report>` → solo i giocatori nuovi: bonus ≈ Δ voto × 4 (tetto ±12). Se la risposta è su un valore poi corretto, si conta solo la parte non ancora corretta.
3. Aggiornare `GM_GUSTI[squadra]`:
   - campi `n` (≈ risposte equivalenti; 150 = peso pieno), `agg` e `fonte`;
   - nota in `NOTE_SVILUPPO.md`;
   - poi pubblicare.
4. Le sezioni FOCUS dei report (fragili, OUT, trend, rookie, ritoccati) vanno lette e annotate qui sotto nel registro.

## 2. Correzioni dei valori (quando c'è consenso)
- **Quando correggere.** Un valore si corregge solo se almeno **2 profili** concordano sul segno e la media dei loro `pl` è almeno **4 punti**.
- **Quanto correggere.** Si applica il **70%** della media, arrotondato a 5. I valori di partenza sono di Francesco: il suo è un solo parere, ma non si butta.
- **Dove scrivere.** Il nuovo numero va in `VALORI` e in `VAL_CORREZ` (registro del lunedì). `VAL_BASE` resta com'è se data e stelle non cambiano. I prezzi fissati non si toccano.
- **Niente doppio conteggio.** In ogni profilo si sottrae la correzione applicata dal `pl` di quel giocatore. La lista `AT_RIT` (giocatori «ritoccati» negli allenamenti) va aggiornata con i nuovi nomi.
- **Prima di ricorreggere** lo stesso giocatore servono risposte arrivate **dopo** la correzione: i report ora hanno data e ora per ogni risposta.

## 3. Formula automatica del lunedì (`valF`): cosa si sta imparando
F = PDKrif^1,78 × 0,93^(età−25) × `VAL_INJ_B`^max(0; 2,5 − stelle). Conta solo il rapporto F(oggi)/F(partenza): i fattori pesano quando cambiano (forma, stelle infortuni, età).

| Parametro | Valore | Fonte | Prossima verifica |
|---|---|---|---|
| `VAL_INJ_B` (stelle infortuni) | 0,80 (era 0,925) | Valutazioni Spiders+Dolphins: sconto dichiarato ~58% sotto 1,5★, ~41% 1,5–2,5★, ~5% sopra 2,5★. Si prende circa metà. | Dolphins 29 valutazioni: rischio 7–8 → 46%, 9–10 → 98% (confermano). Spiders: più bassi (35%). Se la media di 4+ GM resta sopra 40% sotto 2★, scendere a 0,75. |
| Regola RICADUTA (stelle) | −0,5 al 3° infortunio serio in 3 stagioni | Holmgren 31/10 | Spiders lo scontano ~25% dopo la notizia; noi −20% sul valore + curva OUT negli scambi. |
| Curva OUT (`INJ_PT`) + stelle | curva di Francesco (29/10); dal 31/10 il calo delle stelle per l'infortunio in INJ_STORIA aspetta il rientro (niente doppio sconto) | Foxes: OUT ricevuti accettati 8% (Δ −24%); Spiders 22% (Δ −16%); Holmgren −25% (Spiders) | Se i GM scontano gli OUT molto meno della curva (−10% a 3 settimane, −50% a 3 mesi), proporre a Francesco di ammorbidirla. |
| Età | 0,93/anno nel calcolo; valori di partenza −0,5% per anno sopra i 26 (+0,5% sotto, max ±6%) dal 31/10 | Gusti età (proposte): TUR 2,25 · SPI 1,4 · DOL 1,2 · PEA 0,75 · FOX 1,5 (media ~1,4); nei confronti: DOL +1,2 · PEA +0,3 · SPI −0,9. Applicato circa un terzo; profili ridotti di 0,5; GUSTO.age 3,5 → 1. | Se con nuovi report i profili restano tutti positivi sopra 1, aggiungere un altro −0,3%/anno. |
| Trend / forma | PDKrif pesato g/(g+15) | FOCUS trend nei report | In attesa di dati. |

## 4. Registro delle osservazioni (aggiungere in fondo)
- 31/10 · 5 profili (TUR, SPI, DOL, PEA, FOX).
- 31/10 · Consenso dopo la prima correzione ancora negativo su Quickley, Allen, Bridges, Daniels: da riguardare con risposte successive alla correzione.
- 31/10 · Rookie ricevuti poco graditi (Spiders 20%, Foxes 14%) ma ceduti volentieri (Spiders 80%): i rookie sono sopravvalutati nei valori? Servono più dati.
- 31/10 · Reaves: i Foxes non lo cedono, Spiders e Dolphins lo valutano più di noi; la correzione verso l'alto è confermata.
- 31/10 17:20 · Seconda correzione per consenso (16 valori, 5 profili): giù Allen, Wilson, Barrett, Bailey, Quickley, Porter, Ball, Queen, Okongwu; su Thompson A., Avdija, Wembanyama, Curry, Giddey, Buzelis, Mara. Holmgren escluso (il suo calo e' gia' nelle regole infortuni).
- 31/10 17:30 · Foxes Valutazione 20: sconto infortuni solo per rischio 9-10 (43%). Giddey: Foxes -8 contro Turtles/Dolphins + : disaccordo, nessuna correzione. Curry: Spiders, Foxes, Dolphins, Peacocks tutti + anche dopo la correzione: candidato a un'altra correzione con risposte nuove.
