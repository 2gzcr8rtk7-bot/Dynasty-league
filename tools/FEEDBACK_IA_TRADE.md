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
