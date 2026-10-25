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

## 25/10/2026 (7) — Cassa automatica da Trade e Speciali
- I bilanci si aggiornano da soli: la funzione `movimenti(t)` legge `TRADES` e `SPECIALI` e crea le righe di entrate/uscite.
  - Scambio: chi riceve "N crediti" ha +N, l'altra squadra −N.
  - Asta: −N crediti per la squadra che acquista.
  - Trade speciale: −costo da regolamento (30/40/50 cr) + giornate extra (2 cr ciascuna per la 30, 1 cr per la 40). Si abbina a `SPECIALI` tramite squadra + giocatore che entra.
  - Stagione: `s` facoltativo nella voce di `TRADES`, altrimenti `STAGIONE_CORRENTE`.
- REGOLA: quando arriva una nuova trade, basta inserirla in `TRADES` (e, se speciale, anche in `SPECIALI`). Non va scritta a mano in `MOVIMENTI`, che ora serve solo per altri movimenti (premi, quote…).
- Saldi 26/27 attuali: Moose +335, Pelicans −9, Dolphins −17, Foxes −60, Ducks −370. Alcune date mancano in `TRADES`.

## 25/10/2026 (8) — Ducks: solo scritta nei loghi piccoli
- Dove il logo è piccolo (Classifica, Risultati, scelta squadra, Trade, Trade speciali, Efficienza, Sala Trofei, Giochi, Infortuni) i Ducks usano la sola scritta (`LOGO2.DUC`, la stessa del campo).
- Il logo intero resta nella casella Home (`.hlg`) e nei banner squadra (`.hlogo`, che usano `LOGO` direttamente). Regola generata nello `<style>` creato da script vicino a `LOGO2`.

## 25/10/2026 (9) — Spiders azzurro chiaro
- SPI: bg `#8cc9f5` (azzurro chiaro), fg `#0f1f3d`, trim `#1e3a8a` (blu scuro, si vede anche nei bordi della maglia, che resta bianca).

## 25/10/2026 (10) — Loghi più grandi nei riquadri
- Regola unica presa dalla classifica competenza: il logo occupa il riquadro colorato meno 2 px per lato (`.wedge` padding 2px).
- Efficienza (squadre e Top/Flop) 54 px, Classifica e Sala Trofei 50–54, Risultati 51, Infortuni e Cassa 42, Sfida della notte 38, Trade speciali e Partita simulata 46. Trade resta 30 (colonna stretta).
- Tolte le regole speciali `.wedge:has(.lg-DUC)` e `.wedge .logo.lg-DUC` (100%): ora la scritta Ducks ha lo stesso margine e la stessa misura degli altri loghi in ogni riquadro.
- Partita simulata: logo Ducks +15% (53 px invece di 46, regola `.simtm .wedge .logo.lg-DUC`).

## 25/10/2026 (11) — Sfida della notte: fino a 4 sfide in corso
- Massimo `NT_MAX` = 4 sfide non finite. Ognuna ha uno slot `c.n` (1–4) assegnato alla creazione; le sfide vecchie senza `n` lo ricevono in automatico (`ntLive`).
- Pagina iniziale: cruscotto "Sfide in corso" (`ntCard`), una sfida per riga: colore per slot (`NT_SC`), gruppi affiancati con cognome di ogni giocatore, pallino (pieno = ha giocato) ed efficienza della partita, media di ogni gruppo con il gruppo in testa in giallo, barra di avanzamento. Gli slot liberi sono riquadri tratteggiati che aprono "Nuova sfida". Le sfide finite vanno in "Archivio".
- Con 4 sfide in corso non se ne possono creare altre (bisogna aspettare o usare "Chiudi ora").
- La data della sfida ora include l'ora. Sottotitolo accorciato in "Prossima partita" (prima allargava la pagina su telefono).

## 25/10/2026 (12) — Calcolatore Scambi
- Nuovo bottone "Calcolatore Scambi" nella barra, prima di Giochi (vista `valtrade`, `vValTrade`, stato `VT`). Due schede: Calcolatore e Valori lega.
- Valori: classifica dynasty di Court Consensus (screenshot del 25/10, posizioni 1–293 con alcuni buchi, pick escluse) nell'oggetto `VALORI` (nome → [ruolo, valore, 1 se rookie]). Abbinamento ai roster con `vnz` (ignora accenti, punti, Jr./II). Wolf (2017) e Ighodaro (1700) inseriti a mano su indicazione di Francesco. Chi non è in lista vale `VAL_FALLBACK` = 1600.
- Punti trade = (valore/1000)^`VAL_EXP` (3,3), così le stelle pesano di più. Crediti: 1 cr = `VAL_CR` (1,13) punti, tarato sulle pick indicate da Francesco: pick 1 = 300 cr, 2 = 250, 3 = 200, 4 = 150, 5 = 100 (`PICK_CR`).
- Esito: differenza < 10% equilibrata, 10–25% leggermente a favore, > 25% sbilanciata; suggerisce i crediti per pareggiare.
- Per aggiornare i valori: sostituire `VALORI` e `VALORI_AGG`.
- Risultato: in alto il valore che ogni squadra RICEVE; il giudizio nomina la squadra che ci guadagna ("Sbilanciata a favore dei X", "Ci guadagnano i X del N%").
- Barra: parte sinistra = quota ricevuta dalla prima squadra, destra = dalla seconda, con le percentuali scritte e uno stacco tra i due colori (utile quando le squadre hanno colori simili).

## 25/10/2026 (13) — Sfida della notte: correzioni
- Quando un gruppo arriva a 5 giocatori la scelta passa da sola al gruppo successivo con un messaggio (`NT.msg`); se tutti i gruppi sono pieni lo dice invece di non fare niente.
- "Chiudi ora" va toccato due volte (conferma), così non si chiude una sfida per sbaglio.
- Dopo "Lancia la sfida" i tocchi vengono ignorati per 0,6 s (`ntLock`): su iPhone un doppio tocco poteva finire su "Chiudi ora" e chiudere subito la sfida.
- `ntGames` cerca il giocatore anche nelle altre squadre di `EFF.gioc` (giocatori appena scambiati).
- Riquadro risultato: resoconto di cosa riceve ogni squadra (giocatori, pick, crediti), sopra il suggerimento per pareggiare.

## 25/10/2026 (14) — Condividi risultato partita
- Risultati: piccolo bottone condividi nella fascia "Scarto" di ogni partita (`data-share="giornata|indice"`).
- `shareGame` disegna su canvas un'immagine 1080x1350 (formato storie/post): logo lega, giornata, le due squadre con logo grande, città e punteggio, vincitore con trofeo, scarto. Su telefono apre la condivisione (WhatsApp ecc.), altrimenti scarica il PNG.

## 25/10/2026 (15) — Ducks di nuovo gialli
- DUC: bg tornato `#facc15` (il giallo originale), al posto del silver `#a9afb7`. Anche le maglie sono gialle con le punte nere (override in `jersey()`).

## 25/10/2026 (16) — Efficienza Cup
- Si apre dal bottone dorato "Efficienza Cup" in cima alla pagina Efficienza, sopra la classifica squadre (`data-cupgo`); non è più nella barra. Vista `effcup` ("‹ Efficienza" per tornare; nella barra resta evidenziato Efficienza).
- "Sala" rossa con due selettori: Anno NBA (1/2/3) e Ruolo (Guardie/Ali/Centri) → 9 classifiche (`cupYear`, `cupRole`). Ruolo = quello del roster (`ROSTER[t][i][2]`).
- Classifica per efficienza stagionale con logo squadra, partite, minuti e podio; chi non ha partite va in "Senza partite".
- Tutto è calcolato al momento da `ROSTER` ed `EFF.gioc`: con un nuovo report le classifiche si aggiornano da sole.
- Anno NBA da `NBA_ANNO` (anno del Draft, verificato sulle liste Draft 2024/2025/2026): anno = `NBA_STAG` (2027) − anno draft. Se entra un giovane nuovo in un roster va aggiunto lì; a inizio stagione nuova aumentare `NBA_STAG`.

## Regola generale: tutto collegato ai dati
Ogni sezione deve leggere i dati (`EFF`, `ULTIMA`, `GIORNATE`, `ROSTER`, `TITOLARI`, `TRADES`, `SPECIALI`) al momento del disegno, senza copiare numeri a mano. Così basta aggiornare quegli oggetti con il report e si aggiornano: classifiche, efficienza, Top/Flop, panchina, Efficienza Cup, Sfida della notte, giochi, calcolatore (roster), cassa.
- Bottone "Condividi classifica" nella sala: `shareCup` crea un PNG 1080 di larghezza (sfondo rosso, titolo, anno·ruolo, classifica con medaglie, loghi ed efficienza) e apre la condivisione del telefono (o lo scarica). Usa i dati del momento.
