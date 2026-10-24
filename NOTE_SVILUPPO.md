# Note di sviluppo — Dynasty League

File di passaggio tra chi lavora sull'app (due account Claude diversi).
Prima di iniziare: leggere questo file. Alla fine di ogni sessione: aggiungere cosa è cambiato.

L'app è tutta in `index.html` (loghi squadre in base64 nell'oggetto `LOGO`).
Ogni modifica pubblicata su GitHub viene messa online da Netlify in automatico.

## 24/10/2026 — Campo del quintetto (pagina squadra, funzione `vCampo`)
- Campo ribaltato stile Dunkest: canestro in alto, centro sotto canestro, ali in mezzo, guardie in basso.
- Coppie dello stesso ruolo più larghe: ali a 22%/78%, guardie a 28%/72% (`ROWY` e `XS` in `vCampo`).
- Tolte le etichette G/F/C sul bordo sinistro del campo.
- Campo personalizzato per squadra: bordo e area colorati con il colore della squadra, nome squadra sulla fascia in alto con due mini-loghi, logo grande sul parquet tra le guardie, cerchio di metà campo colorato.

## 24/10/2026 (2) — Ritocchi al campo
- Campo più alto (proporzione 100/112) per separare le tre file: i numeri di efficienza non toccano più le maglie della fila sotto.
- Colore squadra solo sul bordo del campo; area del tiro libero e cerchio di metà campo tornati in parquet.
- Logo squadra spostato nell'angolo in alto a destra del campo.
- Targhette col nome tutte della stessa larghezza; i cognomi lunghi usano un testo più piccolo.
- Posizioni: centro 25%, ali 19%/81% a 53%, guardie 30%/70% a 82%.

## 24/10/2026 (3) — Logo sul bordo alto
- Tolto il logo dal parquet. Ora sta al centro della fascia alta del campo, con città a sinistra e nome squadra a destra.
- Fascia alta più spessa (viewBox 100x120, campo spostato di 8 unità); bordi laterali sottili come prima.
- Posizioni righe aggiornate: centro 30%, ali 56,2%, guardie 83,2%.

## 24/10/2026 (4) — Scritte sul bordo stile NBA
- Città e nome squadra sul bordo alto scritti con il font Anton (blocco condensato tipo parquet NBA), incluso nell'index.html come @font-face "CourtBlock" (base64, solo caratteri latini) così funziona anche offline.
- Colore delle scritte: secondo colore della squadra se si legge bene sul bordo, altrimenti bianco/nero; contorno scuro e leggera lucidatura per l'effetto "dipinto".
- Dimensione del testo adattata alla lunghezza (es. SACRAMENTO, CALIFORNIA).
