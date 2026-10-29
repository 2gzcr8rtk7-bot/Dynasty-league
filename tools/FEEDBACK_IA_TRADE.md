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
