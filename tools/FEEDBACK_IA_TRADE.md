# Feedback dei test IA Trade (Francesco) — da raccogliere e poi tradurre in una nuova versione

Ogni voce: data · cosa ha visto · cosa ci si aspetta · stato.

1. 29/10/2026 · Eagles ricevono Wilson + Wolf + 15 cr da Mooses per Brown + Lendeborg (scambio «±1%», interesse Mooses basso).
   Problema: Wilson (rookie, 20 anni, 4ª scelta 2026) è un futuro campione (come Dybantsa, Boozer, i futuri Flagg / Jalen Johnson): quasi incedibile.
   Lendeborg è rookie ma ha 24 anni e fu 11ª scelta: non vale quanto Wilson. Serve correlare valore, età e posizione al draft.
   Richiesta: archivio draft (pick di ogni giocatore); chi è stato scelto entro le prime 4-5 va pesato molto negli interessi, valutato quasi come un Duren, uno Şengün, un Kessler.
   Stato: FATTO in coda (nota 453): `DRAFT_RAW`/`draftOf`, `iaDraft` (premio dpk × scelta × età) dentro `iaP`, qualità rookie scalata per età e scelta, «Draft 2026 · scelta n. 4» nella pagella.
2. 29/10/2026 · Nella lista «Altre proposte per lo stesso scenario» la riga #2 è rovinata (testo «Mooses basso 15» sovrapposto al logo, font serif, logo mancante). Da controllare (forse logo che non carica sul telefono).
   Stato: DA FARE.
3. 29/10/2026 · Turtles ricevono Adebayo + Castle (+25 cr) da Spiders per Queen + Peterson: interesse basso GIUSTO, ma la frase «riceve centri e guardie, ruolo in cui è carente» è sbagliata: i Turtles hanno guardie giovani e promettenti, esattamente il loro percorso (ricostruzione). La carenza di ruolo va letta in base a età media e potenziale del ruolo rispetto alle intenzioni della squadra.
   Stato: FATTO in coda (nota 454): la carenza di ruolo usa il valore PERCEPITO dalla squadra (`iaMul`) e il peso del PDK nel bisogno scende per chi ricostruisce (`npr`).
4. 29/10/2026 · Richiesta generale: le frasi devono tener conto delle intenzioni della squadra, ricavate in automatico da tutti i dati (età media, classifica, media PDK recente, ultimi scambi, correlazioni utili).
   Stato: FATTO in coda (nota 455): intenzione `c` con 4 segnali (età, talento+PDK, classifica+differenza punti, ultimi scambi `iaTradeSig`), peso del PDK scalato dalle intenzioni (`pwi`), frase «intenzioni: …» + contesto sul ruolo carente.
5. 29/10/2026 · Spiders danno Boozer + Adebayo e ricevono Holmgren + Sarr + 30 cr (±6%, interesse Turtles alto). A valori è equilibrato, ma i rookie scelti in alto sono incedibili nell'anno stesso (poi, dopo 2-3 stagioni, contano i PDK veri): il primo anno vale quasi più la scelta al draft sommata a età ed efficienza che il rendimento in campo. Boozer oggi è considerato come Flagg, non verrebbe mai scambiato per quel pacchetto.
   Stato: FATTO in coda (nota 456): premio draft × anni dal draft (1º anno pieno, poi 0,6 · 0,3 · 0,1), PDK atteso dalla scelta al posto di quello reale, malus «incedibili».

6. Parere sulle trade chiuse: deve dedurre matematicamente le intenzioni (Turtles: Coward più anziano ma più forte al posto di Fears = si sentono pronti, escono dalla ricostruzione) e riconciliarle col saldo di valore; frasi decise, anche ironiche (truffa, senza senso). → fatto (458: `histVerdictSide`).
7. Aggiungere pareri tecnici: ultima partita, minutaggio (es. Murray che prende minuti a un compagno), età, media, trend, confronto con l'anno scorso, tante varianti. → fatto (`histTechLines`).

8. Condividi: solo PDK, frasi più sintetiche con scambi grossi (3-4 squadre), versione dedicata alle speciali con commento tecnico (scommessa/vincere ora/chi lasciar andare a scadenza). → fatto (459).

## Contesto di scambi storici (Francesco), da usare per tarare le formule
9. Ducks ↔ Peacocks (Jokić, Porter Jr., Quickley, Okongwu, Ingram contro Edey, Şengün, Flagg, Jaquez + annullo del debito dei Peacocks). Ducks già due volte campioni, dominanti: hanno ceduto valore per ringiovanire e per dare spazio agli altri (lega creata da lui). Peacocks in condizioni pessime, diventati da titolo. Lezione: una squadra dominante può accettare di perdere valore per equilibrare la lega; lo scambio non rispettava i crediti.
10. Turtles ↔ Foxes (Shai e Jabari Smith Jr. contro Banchero e Rollins). Banchero più giovane ma 29 di media contro i 40 di Shai: i Turtles, in ricostruzione, rinunciano al valore immediato scommettendo sul futuro. I Foxes, in corsa per il titolo, comprano rendimento. Lezione: per chi ricostruisce l'età e il potenziale pesano più della media attuale, e perdere valore nell'immediato può essere voluto.
Avvertenza: gli scambi storici vanno giudicati con i valori, gli infortuni e le intenzioni di quel momento, non con quelli di oggi.
11. Scambio a tre Peacocks / Dolphins (allora Parrots, nell'annuncio «Runners») / Ducks. Peacocks ricevono Fox, Allen, Gobert; Dolphins ricevono Daniels, Kessler, Okongwu + 40 cr dai Peacocks; Ducks ricevono 10 cr post Lottery dai Peacocks. Gobert, alla 55ª giornata, a fine trade speciale dei Ducks passa ai Dolphins in cambio di Poeltl. Peacocks: appena preso Jokić, vogliono vincere il titolo e allungare una rosa scarna. Dolphins: ringiovanire e incassare crediti. Lezione: chi punta al titolo paga in crediti e giovani per profondità, chi ringiovanisce vende veterani contro crediti.

## Questionario «Laboratorio Trade» (29/10/2026) — risposte di Francesco, 64 domande
Soglie: equilibrata ≤10%, vincitore da 20%, truffa 30%, truffa pazzesca 40%.
Pesi: vince ora → PDK 55, ruolo 20, valore 20, età 5, draft 0, costo 0. Ricostruisce → età 40, draft 30, PDK 20, ruolo 10, valore 0, costo 0.
Età (a pari rendimento, da confermare il segno): 20 anni +100% rispetto a 26; 32 anni −50%; 36 anni −65%. Bonus scelta al draft non compilato (domanda poco chiara).
Crediti: 100 pt ≈ 150 cr, 500 pt ≈ 400 cr, 1000 pt ≈ 800 cr, ma «dipende dal valore percepito e dal costo in crediti del giocatore». Dalle compensazioni chieste: Gobert contro Hartenstein ≈ +40-50 cr, Zion contro Wolf ≈ +50-60 cr.
Regole libere: infortuni lunghi/lunghissimi pesano molto, quelli corti nulla; i giocatori con età lontana dalla media della squadra sono pedine scambiabili più facilmente (es. Haliburton ai Turtles, troppo anziano per il loro progetto; vale per tutte le squadre); un centro/ruolo raro non va ceduto per pochi crediti a meno di bisogno estremo (trade speciale per sostituire un infortunato).
Intoccabili (u≥4): Flagg, Boozer, Harper (5); Dybantsa, Wilson, Peterson, Castle, Knueppel, Giddey, Şengün (4). Cedibili (u=1): Embiid, Curry, Kawhi, Amen Thompson, J. Williams, Fears.
Correzioni di valore («+» = dovrebbe valere di più, «−» = di meno, lettura da confermare): + Flagg, Boozer, Wilson, Dybantsa, Peterson, Harper, Knueppel, Castle, Queen, Mara; − Curry, LeBron, Durant, Harden, Kawhi, Porter Jr., J. Williams, Fears, Amen Thompson.
Ruoli: carenti DOL ali (5), FOX ali (3), MOO ali (3), SPI centri (5, Embiid fragile e Porziņģis fuori). Nessuna carenza per DUC, EAG, PEA, TUR. Surplus: DOL guardie, FOX e MOO centri. Il modello oggi vede MOO carente di centri ed EAG di guardie: contrario al suo giudizio. Le scommesse acerbe non coprono un ruolo; la salute conta.
Intenzioni: DOL vince ora; DUC playoff/vende; EAG playoff/ferma; FOX vince/vende; MOO ricostruisce/compra; PEA playoff/ferma; SPI vince ora/vende; TUR costruisce/ferma.
Scarti col calcolatore attuale (solo VALORI al quadrato): Giannis contro Banchero+Dybantsa → calcolatore dà +11% ai Turtles, lui dice che gli Spiders ci guadagnano molto; Harden+Lillard contro Edgecombe+Green → calcolatore pari, lui dice che ci guadagnano i Peacocks. Vecchi sopravvalutati, giovani alte scelte sottovalutati.
