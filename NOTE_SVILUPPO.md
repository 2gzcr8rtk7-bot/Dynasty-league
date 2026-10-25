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

## 25/10/2026 — Cassa con registro (Claude, account di Francesco)
- Il riquadro Cassa nella pagina squadra è cliccabile e apre la vista `cassa` con 3 schede:
  - Bilancio: entrate, uscite e saldo per stagione (stagione = Draft→G64, non anno solare).
  - Entrate e uscite: registro con data, causa e importo, filtrabile per stagione. Dati in `MOVIMENTI` (per squadra).
  - Debiti e crediti: chi deve pagare a chi, senza causa. Dati in `DEBITI` (lista unica della lega: da, a, v, tipo portafoglio/post, s, saldato).
- I numeri del riquadro Cassa (crediti/debiti portafoglio e post draft) ora si calcolano da `DEBITI` (solo quelli non saldati). `CASSA` non esiste più.
- `STAGIONE_CORRENTE` = etichetta della stagione in corso.

## 25/10/2026 (2) — Tiro da 3 più difficile
- Il canestro si muove sempre fin dall'inizio. Velocità, ampiezza, margine di canestro e imprecisione dipendono in modo esponenziale dall'efficienza (`tiroPeriod`, `tiroAmp`, `tiroTol`, `tiroNoise`, `tiroE`).
- Esempi: eff 1,0 → oscillazione 2,7 s, margine 18 px; eff 0,3 → 0,58 s, margine 11 px. Accelera del 4% a ogni centro.
- Il canestro viene valutato quando la palla arriva (non al tiro): bisogna anticipare il movimento. Durata del volo leggermente casuale (650–790 ms).

## 25/10/2026 (3) — Gioco "Sfida della notte"
- Quarto gioco nel menu Giochi (`vNotte`, `ntAct`, stato `NT`). Si creano 2-3 gruppi da 1-5 giocatori presi da tutti i roster (ricerca e filtro per squadra).
- Alla creazione salva per ogni giocatore le partite già giocate (`EFF.gioc[...][2]`). Quando il numero sale, il valore è l'efficienza dell'ultima gara (`lastEff`, quindi `ULTIMA`). Punteggio gruppo = media.
- Finisce quando tutti hanno giocato una partita; "Chiudi ora" la termina contando solo chi ha giocato.
- Risultato condivisibile come immagine PNG generata su canvas (`ntShare`). Sfide salvate in localStorage `notteSfide`.
- Importante: perché funzioni, quando si aggiorna `EFF` va aggiornato anche il numero di partite e `ULTIMA` con l'efficienza dell'ultima partita di ogni giocatore che ha giocato.

## 25/10/2026 (4) — Partita simulata: merito + caso
- Esito = 60% migliori 5 per efficienza + 20% i 5 successivi + 20% caso (`SIMW`). "Migliori" = più efficienti della rosa con almeno 10 minuti, non i titolari del campo.
- Vantaggio = 0,60·tanh(Δtop/0,15) + 0,20·tanh(Δaltri/0,20); caso = 0,20·N(0,1). Scarto = 2 + |valore|·28 (max 40).
- Prima di giocare mostra le medie e il pronostico in percentuale (`simProb`). La cronaca è generata in modo coerente con il punteggio finale.

## 25/10/2026 (5) — Trade speciali
- Nuova voce "Trade speciali" nel menu Dunkest (vista `speciali`). Dati in `SPECIALI`: t, entra, esce, tipo (30/40/50), inizio (giornata), extra (giornate extra, facoltativo).
- Durata da regolamento: 30 → 20 giornate, 40 → 40, 50 → fino alla G64. Giornata corrente = ultima di `GIORNATE`.
- Mostra giornate rimaste (giornata in corso compresa) e colore per tempo rimasto: ≥80% verde chiaro, 50% giallo, 30% arancione, ≤15% rosso, sfumato in mezzo (`spColor`).
- Le 3 speciali esistenti sono inserite con inizio G1 (da verificare).

## 25/10/2026 (6) — Ritocchi vari
- G League: i Ducks (G-Ducks) hanno il logo Gotham e sfondo viola (`bg`/`trim`/`logo` facoltativi nella voce di `GLEAGUE`).
- Pagina squadra: la panchina è ordinata per efficienza dell'ultima gara (`lastEff`), quindi si riordina da sola a ogni aggiornamento dei report.
- Efficienza: Top 10 (etichetta verde) e Flop 10 (rossa) spostate sopra la sezione Giocatori, che ora ha l'etichetta gialla (classi `.hgreen`, `.hred`, `.hyellow`).

## 25/10/2026 (7) — Cassa: movimenti 26/27
- Inseriti in `MOVIMENTI` tutti i passaggi di crediti noti dalla pagina Trade (6 scambi, asta FA di Paul George, 3 trade speciali con il costo da regolamento 30/40 cr). Tutti come entrate/uscite già pagate; `DEBITI` resta vuoto.
- Alcune date mancano (campo `d` vuoto): da completare quando si conoscono.
