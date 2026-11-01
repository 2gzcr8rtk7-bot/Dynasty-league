# Procedura: report dei GM → gusti, valori, formula del lunedì

Richiesta di Francesco (31/10/2026): ogni report dell'Allenamento IA va usato per **imparare** e trasformare quello che si impara in regole **automatiche**. I report di altre squadre si applicano e si pubblicano subito, poi si avvisa Francesco (non serve chiedere).

**Autonomia (Francesco, 31/10/2026 17:18):** Claude può cambiare LIBERAMENTE valori, pesi della formula del lunedì (età, infortuni, forma…) e regole, senza chiedere, quando l'INCROCIO di più GM lo giustifica (mai sul parere di un solo GM). Ogni cambio: nota in NOTE_SVILUPPO, riga nella tabella del §3, registro VAL_CORREZ se tocca i valori, pubblicazione e avviso a cose fatte.

## 0. Rifare tutti i profili da zero
`python3 tools/gm_fit.py vals` e poi `python3 tools/studio/rifai_profili.py` (aggiornare l'elenco dei file in tools/studio/common.py): rifà i profili da tutti i report con le regole di oggi (pacchetti pesati sui forti, riempitivi solo tra riempitivi). Poi riapplicare a mano le correzioni dette da Francesco (vedi rifai_profili.py, in fondo).

## 1. A ogni report (subito)
1. `python3 tools/gm_fit.py vals` (valori di ADESSO: i report hanno i valori del momento in cui il GM ha risposto).
2. In base al tipo di report:
   - **Proposte**: `gm_fit.py proposte <tutti i report Proposte di quella squadra>` → `req`, `age`, `sc`, `role`. Se ci sono vecchi parametri, fare la media pesata sul numero di risposte.
   - **Confronto**: `gm_fit.py confronto <report>` → bonus `pl`. Si fonde con i vecchi `pl`: media dove ci sono entrambi, unione altrove; si tolgono i bonus sotto ±2,5.
   - **Valutazione**: `gm_fit.py valutazione <report>` → solo i giocatori nuovi: bonus ≈ Δ voto × 4 (tetto ±12). Se la risposta è su un valore poi corretto, si conta solo la parte non ancora corretta.
     - Aggiungere TUTTI i giocatori valutati in `AV_FATTI[squadra]` (index.html): non gli ricapiteranno nei prossimi allenamenti.
     - Dal 31/10 ogni GM valuta prima i SUOI giocatori: la sezione «I SUOI GIOCATORI» del report (risposta «Se un GM lo chiede, tu…») va usata per la scheda GM_DESCR (intoccabili, ceduti volentieri) e, per gli intoccabili, per `GM_INTOCC` nell'IA Trade.
3. Aggiornare `GM_GUSTI[squadra]`:
   - campi `n` (≈ risposte equivalenti; 150 = peso pieno), `agg` e `fonte`;
   - nota in `NOTE_SVILUPPO.md`;
   - poi pubblicare.
4. Aggiornare anche `GM_DESCR[squadra]` in index.html (scheda «Scopri i gusti dei GM»: cosa cercano, come chiudono, infortuni, cosa manca) con quello che si è capito; i numeri della scheda vengono da GM_GUSTI da soli.
5. Le sezioni FOCUS dei report (fragili, OUT, trend, rookie, ritoccati) vanno lette e annotate qui sotto nel registro.

**Regola ferma 2 (Francesco, 31/10 21:14-21:27): i forti contano, i riempitivi no, e dipende dal piu' forte dello scambio.** Formula in uso: k = 3 × (valore del più forte − 1000)/300 (tra 0 e 3), ogni giocatore conta punti × (punti/migliore del suo lato)^k: fino a 1000 contano tutti, con un 1100 un 800 conta ancora, dai 1300 in su gli altri sono riempitivi. (Prima versione:) In un pacchetto il giocatore migliore pesa per intero e gli altri molto meno (valore di pacchetto: punti × (punti/punti del migliore)², usato nell'app e in gm_fit). Un sì a «Banchero + Quickley per Thompson + Buzelis» parla di Banchero contro Thompson: Quickley e Buzelis sono riempitivi e NON prendono bonus o malus. Nei residui la colpa/il merito si divide per la quota nel pacchetto; nelle Valutazioni non si danno bonus ai giocatori sotto 1000 di valore (contano i giocatori da 1000-1400 in su; gli altri sono riempitivi).

**Regola ferma (Francesco, 31/10 21:12):** un sì a uno scambio FAVOREVOLE non vuol dire che il GM vuole liberarsi del giocatore (con Jokić in cambio chiunque cede Johnson e Thompson). «Cede volentieri» / «se ne vuole liberare» si scrive SOLO da: sezione «SCAMBI ALLA PARI» del report, residui positivi del modello, o risposta «Lo cedo volentieri» del GM sui SUOI giocatori nella Valutazione. In caso di dubbio non si scrive.

**Attenzione (segnalazione dei GM, 31/10):** «ceduto volentieri» / «rifiutato da cedere» vanno SEMPRE pesati col vantaggio dello scambio. Si usa il residuo del modello (accettato − probabilità attesa dal Δ valore, età, ruoli) per ogni giocatore ceduto: solo un residuo positivo vuol dire «se ne libera volentieri». Script: tools/gm_residui.py (lista dei report da aggiornare dentro, dizionario F); nel report ora c'è il Δ medio accanto a ogni nome.

## 2. Correzioni dei valori (quando c'è consenso)
- **Quando correggere.** Un valore si corregge solo se almeno **2 profili** concordano sul segno e la media dei loro `pl` è almeno **4 punti**.
- **Quanto correggere.** Si applica il **70%** della media, arrotondato a 5. I valori di partenza sono di Francesco: il suo è un solo parere, ma non si butta.
- **Dove scrivere.** Il nuovo numero va in `VALORI` e in `VAL_CORREZ` (registro del lunedì). `VAL_BASE` resta com'è se data e stelle non cambiano. I prezzi fissati non si toccano.
- **Niente doppio conteggio.** In ogni profilo si sottrae la correzione applicata dal `pl` di quel giocatore. La lista `AT_RIT` (giocatori «ritoccati» negli allenamenti) va aggiornata con i nuovi nomi.
- **Prima di ricorreggere** lo stesso giocatore servono risposte arrivate **dopo** la correzione: i report ora hanno data e ora per ogni risposta.
- **Nel consenso non contano** (dal 31/10, report Ducks): i giocatori della squadra stessa del GM (ogni GM sopravvaluta i suoi), i fragili sotto 2 stelle (li gestiscono le regole infortuni) e i giocatori ritoccati nello stesso giorno se le risposte sono precedenti.
- **Report Proposte senza Confronto**: i bonus `pl` si ricavano dai residui del modello (vedi gm_residui.py; per i ricevuti col segno diretto, per i ceduti col segno opposto), scalati per min(1, apparizioni/8).

## 3. Formula automatica della domenica (dal 01/11/2026: ogni domenica alle 18:00, prima lunedì 12:00) (`valF`): cosa si sta imparando
F = PDKrif^1,78 × 0,93^(età−25) × `VAL_INJ_B`^max(0; 2,5 − stelle). Conta solo il rapporto F(oggi)/F(partenza): i fattori pesano quando cambiano (forma, stelle infortuni, età).

| Parametro | Valore | Fonte | Prossima verifica |
|---|---|---|---|
| `VAL_INJ_B` (stelle infortuni) | 0,75 dal 31/10 sera (prima 0,80, all'inizio 0,925) | Valutazioni Spiders+Dolphins: sconto dichiarato ~58% sotto 1,5★, ~41% 1,5–2,5★, ~5% sopra 2,5★. Si prende circa metà. | Dolphins 29 valutazioni: rischio 7–8 → 46%, 9–10 → 98% (confermano). Spiders: più bassi (35%). Se la media di 4+ GM resta sopra 40% sotto 2★, scendere a 0,75 → FATTO il 31/10 (Ducks 41%, Dolphins 46%, Foxes 43%, Spiders 35%). Prossimo passo solo se 5+ GM restano sopra 45%. |
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
- 31/10 19:15 · Foxes Confronto 85: nona correzione (Fox, Clingan, Rollins giu'; Jokic, Curry su). Foxes nei confronti preferiscono i piu' anziani (-1,1/anno; giovane scelto 42%): il gusto eta' non e' piu' positivo per tutti i GM, l'inclinazione eta' resta com'e'. In attesa: Holmgren/Embiid (regole infortuni), Mara, Castle, Morant (servono risposte dopo la correzione), Harper e Steinbach (TUR+DOL, DOL+FOX positivi).
- 31/10 20:20 · Ducks Proposte 201 (risposte del 30/10, prima delle correzioni): profilo DUC (age 2,75: il GM piu' sensibile all'eta'; req 6; ali si', guardie no). Decima correzione: Boozer, J. Brown su; Hart, K. George, Knueppel, James giu'. Ora 6 profili su 8 (mancano Eagles e Mooses).
- 31/10 20:30 · Ducks Valutazione 22: VAL_INJ_B 0,80 -> 0,75 (4 GM oltre il 40% sotto 2 stelle). Ducks apprezzano piu' di noi Quickley, Leonard, Fox, Mara (veterani in calo per noi): da riguardare se altri GM lo confermano.
- 31/10 20:40 · Ducks Confronto 130: undicesima correzione (Flemings, Murphy III, Herro giu'; Bailey giu' e Giddey su con risposte successive alle correzioni). Giddey: ormai +15% sul valore del 31/10 mattina, da non ritoccare ancora senza almeno 2 GM nuovi d'accordo.
- 01/11 15:28 · Dolphins Confronto 40 (dopo tutte le correzioni): accordo 78%; eta' quasi neutra (giovane scelto 46%). Profilo DOL aggiornato col confronto su 441 risposte (variazione rispetto al primo report): su Wembanyama, Siakam, Giddey, Brunson, Scottie Barnes, Gobert; giu' Edgecombe, Garland, Okongwu, Irving, Davis; Jalen Johnson e Curry tornano neutri. Tredicesima correzione: Peterson 1200 -> 1150 (DOL+DUC). Gli altri consensi (Flemings, Wilson, Rollins, Barrett, Wembanyama, Avdija, Brunson, K. George) c'erano gia' prima del report: lasciati com'erano. Embiid e Ball esclusi (fragili). Soglie dei Dolphins: pari ~50 cr, poco meglio ~50, meglio ~265 cr.
- 01/11 15:40 · Dolphins Proposte 279 (risposte del 30/10): primo report Proposte dei Dolphins. Profilo DOL: req 14 -> 2 (chiude facile, accetta 51%), age 0,5 (1,0 dal fit, meno 0,5 come gli altri), sc 18, ruoli G -4 / F +4 / C +2, accuratezza 0,76. Residui: cede volentieri Garland, Bridges (anche Young, Durant, Booker, Markkanen alla pari); non cede Porzingis, Clingan, Murray-Boyles (e Maxey alla pari). Nessun nuovo bonus giocatore, nessuna correzione dei valori (giocatori propri esclusi dal consenso).
- 01/11 15:45 · Peacocks Proposte 61 (31/10 sera + 01/11, molte dopo le correzioni): profilo PEA rifatto su 91 proposte: req 25, age 1,0 (1,5 meno 0,5), sc 18, ruoli G -4 / F +4 / C 0, n 116. Residui (solo giocatori propri): Murphy III -10 (cede volentieri), Sabonis -4; Mobley +4, Giddey +4 (li tiene). Pari: cede Murphy, Porter, Allen; non cede Mobley, Ball, Lillard, Zion, Rollins, Harden, Randle, Giddey. Nessuna correzione dei valori.
- 01/11 16:08 · Mooses Proposte 68 (01/11, tutte quasi alla pari): PRIMO profilo MOO (7 su 8, manca Eagles): req 14, age 2,5 (fit 4,0, limitato: Δ troppo stretti), sc 22, ruoli C -2, n 68. Residui (propri): Wilson +10, Ware +10, Knueppel +7 (li tiene); Herro -10, Flemings -10, Fears -8 (li cede). Nessuna correzione dei valori.
- 01/11 16:11 · Mooses Valutazione 23: AV_FATTI.MOO, GM_INTOCC MOO = Caleb Wilson; voti generosi (+1,6 medio, +2,4 sui bassi, -0,3 sui top). Bonus nuovi: Boozer +4, Duren -4, Morant +4 (fragile, fuori dal consenso). Infortuni: 71% a rischio 9-10, 8% a 7-8 (piu' morbido degli altri: VAL_INJ_B resta 0,75). Quattordicesima correzione: Boozer 1480 -> 1520 (MOO+DOL+DUC = +4 di media, risposte dopo la decima correzione); tolta dai profili.
- 01/11 16:20 · Mooses Confronto 151: accordo 84%, eta' neutra (-0,27/anno, giovane 54%). pl MOO fusi (media dove c'erano gia'). Quindicesima correzione (15 valori, consensi nuovi o rafforzati dalle risposte fresche dei Mooses): giu' J. Smith Jr., Mikel Brown, Dyson Daniels, Harden, Murray-Boyles, Towns, Okongwu, Quickley, Hart, Rollins; su Giannis, Edwards, Scottie Barnes, Naz Reid, Flagg. Esclusi: Zion e Ball (fragili), Booker/Knueppel/Wilson (segni discordi o propri), Flemings (proprio dei Mooses), Reaves (consenso invariato a 4).
- 01/11 16:41 · Correzione di Francesco: i Dolphins Porzingis lo vendono anche in sconto (il residuo negativo era rumore su un riempitivo da 90). GM_DESCR DOL corretta, pl DOL Porzingis -12.
- 01/11 16:50 · Francesco: i gusti vanno letti con la situazione della squadra (Turtles in ricostruzione non danno Peterson per Daniels ne' Dybantsa per Murphy+Allen) e nessuno da' una stella per 2-3 medi. Aggiunti gmSit/gmSitG/gmStarG/gmPlOwn (nota 887). A ogni report Proposte aggiornare anche GM_ACC[squadra] = [accettati, risposte].
- 01/11 17:05 · Revisione IA Trade 7 (Francesco): Dolphins, Ducks e Spiders giocano per il titolo (contano i PDK di questa stagione), Turtles e Mooses ricostruiscono: GM_OBJ + termine PDK (nota 893). «Realistico» nella revisione = la percentuale e' realistica, non che lo scambio si farebbe.
- 01/11 18:25 · Eagles Confronto 37 + Valutazione 14: accordo 81%, giovane scelto 59% (age 0 -> 0,5). Infortuni: il piu morbido (solo Davis 9/10, sconto 10%). Intoccabile Avdija; Duren e Towns solo con grosso sovrapprezzo. Diciassettesima correzione: Harper 1260 -> 1210, Jokic 3265 -> 3400. Sabonis escluso per disaccordo (DOL +10). Ora tutti gli 8 GM hanno Proposte + Confronto o Valutazione.
- 01/11 18:50 · Turtles Valutazione 15 (propri): intoccabile Harper; Dybantsa, Peterson, Queen, Miller solo con grosso sovrapprezzo; Ighodaro ceduto volentieri. Voti +1,0 (+2,6 sui bassi: giovani guardie). Infortuni: nessuno sconto sui rischi medi; sconti 85-95% su Coward e Ighodaro probabilmente tocchi sbagliati, non usati. Nessuna correzione.

## Report «REVISIONE IA TRADE» (Francesco, stanza Ducks)
Ogni proposta ha il giudizio di Francesco (REALISTICO / FORSE / IRREALISTICO) e un commento. Le irrealistiche con alta % = l'IA sbaglia: capire quale squadra non lo farebbe (commento) e correggere la regola generale (situazione squadra, stella per medi, intoccabili GM_INTOCC, gusti pl), non il singolo caso. Le realistiche con bassa % = l'IA e' troppo severa. Annotare qui e in NOTE_SVILUPPO, poi pubblicare.

## Registro valori (dal 01/11/2026) — OBBLIGATORIO
Ogni volta che cambi un valore in `VALORI` (report dei GM, consenso, correzioni di Francesco) aggiungi una riga in `VAL_LOG` (index.html, accanto a `valReg`):
`{d:"AAAA-MM-GG",n:"Nome Giocatore",da:valoreVecchio,a:valoreNuovo,why:"motivo breve (es. Report Ducks Valutazione · consenso 3 GM)"}`.
Gli aggiornamenti automatici del lunedì non vanno scritti: il registro li ricava da solo. Il registro si apre toccando un giocatore in Scambi › Valori lega.

## Free agent che entrano in squadra (907)
L app ha già il loro valore calcolato (FA_VAL, funzione valNuovo). Quando un free agent entra in un roster: aggiungerlo in VALORI con il valore di valNuovo(nome) (arrotondato), VAL_BASE con data e stelle, e una riga in VAL_LOG con why "Ingaggio dai free agent: valore calcolato dalla formula".
