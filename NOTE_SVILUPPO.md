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

## 24/10/2026 (5) — Campo a tutta larghezza
- Tolti i bordi colorati laterali (sia nel disegno SVG sia il bordo CSS a sx/dx): il parquet arriva ai lati.
- Il campo è disegnato nelle stesse coordinate di prima e scalato con `translate(-3.19,9.62) scale(1.0638)`; viewBox ora 100x128.8.
- Fascia alta più alta (16 unità): logo più grande (19x15.4) e scritte leggermente più grandi.
- Righe: centro 30,6%, ali 56,6%, guardie 83,3%.

## 24/10/2026 (6)
- Tolti dal disegno il tabellone e il ferro arancione del canestro.

## 24/10/2026 (7) — Home
- Logo Texas Ducks nella griglia Franchigie un po' più grande e più basso: regola CSS `.htile[data-team="DUC"] .hlg .badge{transform:translateY(4px) scale(1.15)}`.

## 24/10/2026 (8) — Pacchetto modifiche (Claude, account di Francesco)
- Ducks: maglia con punte nere anche su giro manica e collo; tolta la stella sotto il numero (DECO.DUC).
- Menu: "Dunkest" è un vero menu a tendina che si apre dal bottone (non ricarica la pagina). Voci: Risultati, Classifica, Roster, Trade, Regolamento. Funzione `syncMenu()`; per aggiungere voci basta un bottone dentro `#subnav` e il nome in `DK`.
- Nuova sezione "Sala Trofei" (bottone nella barra, vista `storia`): classifica competenza (8 pt al 1° … 1 pt all'8°) e classifiche finali per anno. Dati nell'array `STORIA`: per un nuovo anno aggiungere una riga con l'ordine d'arrivo.
- Pagina squadra: "Bacheca" con coppe oro/argento/bronzo, solo per chi ha fatto podio (funzione `bacheca(t)`, legge `STORIA`).
- Efficienza: aggiunta "Flop 10 lega" sotto la Top 10.
- Regolamento: testo completo del PDF ufficiale in `REGOLAMENTO` (articoli apribili) + file `regolamento.pdf` scaricabile.

## 24/10/2026 (9) — Sezione Giochi (Claude, account di Francesco)
- Bottone "Giochi" nella barra (la barra su telefono scorre a destra, bottoni più grandi).
- Tre giochi, selettore in alto (variabile `GAME`):
  - "Più o Meno" (`vGiochi`/`hlBind`, stato `HL`): chi ha l'efficienza stagionale più alta; record in localStorage `hlBest`.
  - "Tiro da 3" (`vTiro`/`tiroCanvas`, stato `TR`): arcade su canvas, 45 secondi, si tira trascinando verso l'alto; la precisione dipende dall'efficienza del giocatore (`tiroAcc`); record in `tiroBest`.
  - "Partita simulata" (`vSim`/`simRun`, stato `SIM`): partita automatica tra due franchigie con titolari + 4 riserve migliori, tiri pesati sulle efficienze.
- I giochi usano i dati `EFF`, `ROSTER` e `TITOLARI`: si aggiornano da soli quando si aggiornano quelli.
