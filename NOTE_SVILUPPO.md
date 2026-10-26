# Note di sviluppo — Dynasty League

File di passaggio tra chi lavora sull'app (due account Claude diversi).
Prima di iniziare: leggere questo file. Alla fine di ogni sessione: aggiungere cosa è cambiato.

> **IMPORTANTE – regole per chi carica i report**
> 1. **Prima di ogni push fare sempre `git pull --rebase origin main`**: dopo ogni pubblicazione GitHub aggiunge da solo un commit ("DREAMERS: archivio notti aggiornato [automatico]").
> 2. **Non modificare e non committare `dreamers-data.js`**: lo genera GitHub (workflow `.github/workflows/dreamers.yml`) leggendo la storia di index.html. Nessun comando da lanciare.
> 3. Formato di `EFF.gioc` (dal 26/10): [nome, eff. media, partite, minuti medi, MINUTI notte, eff. notte, eff. ultime 5, minuti ultime 5, PDK notte]. La colonna 9 (`p[8]`) è il PDK (Dunkest) della partita della notte, `null` per chi non ha giocato: DREAMERS la usa per archiviare ogni partita (prima leggeva per errore `p[4]`, che sono i minuti).
> 4. **Efficienza "pura"** (richiesta di Francesco): in tutta l'app conta solo il rapporto Dunkest/minuto, non il minutaggio. Quindi l'efficienza media stagionale di un giocatore (colonna 2 di `EFF.gioc`) va calcolata come **media semplice delle efficienze partita per partita** (es. 1,00 e 0,50 → 0,75), non come Dunkest totali ÷ minuti totali. Stessa regola per le efficienze di squadra in `EFF.squadre` (media semplice delle efficienze dei giocatori).
> 5. **Una sola fonte per ogni numero**: efficienza MEDIA stagionale = `EFF.gioc[...][1]` (`effMed`); efficienza dell'ULTIMA partita = `ULTIMA.gioc` (`lastEff`); PDK medi e ultima partita = da `PARTITE` (`pdkMed`, `pdkLast`). Campo e panchina mostrano i PDK; scheda, Efficienza e Cup l'efficienza. Sfida della notte usa l'efficienza dell'ultima partita.
> 6. GitHub controlla da solo la coerenza del report a ogni push (`tools/verifica.mjs`, avvisi nella scheda Actions) e l'app fa lo stesso controllo all'apertura (console). Controlla: notte ≠ ULTIMA, 1 partita con media ≠ ultima, giocatori con partite senza ULTIMA, roster ed EFF non allineati, date diverse tra EFF e ULTIMA.
> 7. **NUOVO – Spazio in squadra (richiesta di Francesco, 26/10/2026).** A ogni report aggiorna `spazio-data.js` (oggetto `SPAZIO_DATA`) con i dati Dunkest: per **ogni squadra NBA in cui c'è almeno un giocatore della lega** metti **tutti** i giocatori di quella squadra NBA (anche quelli che non sono nella lega) come `[nome, minuti medi, PDK medi, partite]`, calcolati sulle ultime 10 partite della squadra (sulla stagione se ne ha giocate meno). Chiave = sigla NBA usata in `ROSTER` (colonna 4, es. "SAS", "DAL"). Aggiorna anche `agg` con la data del report. Serve all'app per capire la gerarchia di ogni squadra (1° = 5 stelle, 2° = 4, 3° = 3, titolari/sesto uomo = 2, rotazione = 1, fondo = ½): ordine = PDK medi + 0,3 × minuti medi (`spazioStelle` in index.html). Formato di esempio dentro il file. I nomi dei giocatori della lega devono essere scritti uguali a `ROSTER`.

L'app è tutta in `index.html` (loghi squadre in base64 nell'oggetto `LOGO`).
Ogni modifica pubblicata su GitHub viene messa online da GitHub Pages in automatico (prima era Netlify).

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
- Immagine condivisa della Cup: per i Ducks usa la sola scritta (`LOGO2`), come nei loghi piccoli dell'app.

## 25/10/2026 (17) — Gioco 5: DREAMERS (fanta efficienza)
- Quinta card nel menu Giochi (`GAME="dream"`, `vDream`, `drAct`, stato `DR`). Tema viola/notte. Schede: Turno, Calendario, Classifica, Playoff; tocca una partita per vedere le due formazioni.
- Squadre: le 8 franchigie. Titolari = i 10 con valore più alto in `VALORI` (Court Consensus, come il calcolatore); gli altri sono riserve in ordine di valore.
- Turni da lunedì a domenica (date NBA USA) dal 26/10/2026: 1–21 regular season (3 gironi all'italiana, `DR_SCHED`), 22 quarti (1–8, 4–5, 2–7, 3–6), 23 semifinali, 24 finale + 3° posto (5–11/04/2027).
- Efficienza pura: efficienza settimanale di un giocatore = media semplice delle efficienze delle sue partite della settimana; punteggio di turno = media semplice delle 10. Il minutaggio non pesa.
- Durante il turno: "in corso", media dei titolari che hanno già giocato. A turno chiuso (c'è la notte della domenica): chi non ha giocato è sostituito dalla miglior riserva per valore che ha giocato; senza cambi vale 0.
- Classifica: vittorie, poi media punteggi. Playoff a 8; a parità passa la testa di serie migliore.
- Archivio: `dreamers-data.js` (`DREAM_DATA.notti` = {notte NBA: {giocatore: efficienza della partita}}, `DREAM_DATA.form` = formazione di ogni turno, bloccata alla prima notte del turno). Lo genera `tools/dreamers.mjs` leggendo tutta la storia git di index.html (notte = data del report − 1 giorno, efficienza = colonna 6 di `EFF.gioc`). Lo lancia in automatico il workflow GitHub `dreamers.yml` a ogni push di index.html e salva solo se ci sono novità. L'ultima notte del report attuale l'app la legge comunque dal vivo da `EFF`, quindi i punteggi sono aggiornati subito anche prima che il workflow finisca.
- Tolte dal repository due immagini di prova finite lì per errore (ntd1.png, ntd2.png).
- Loghi in DREAMERS: tondi con lo sfondo del colore squadra (`drLg(t, taglia)`; taglie: normale 46px, "m" 32px, "s" 26px).

## 25/10/2026 (18) — Giochi divisi: fanta + Arcade
- Menu Giochi: solo Sfida della notte e DREAMERS (giochi fanta) + pulsante "Arcade" (`GAME="arcade"`) con Più o Meno, Tiro da 3 e Partita simulata (in `GAMES` hanno `a:1`). Dai giochi arcade il tasto indietro torna all'Arcade.

## 25/10/2026 (19) — Medie coerenti in tutta l'app
- Problema: campo e panchina mostravano l'efficienza dell'ULTIMA partita (`ULTIMA`), la scheda giocatore e la pagina Efficienza la MEDIA stagionale (`EFF`), quindi i numeri sembravano non tornare (es. Edwards 0,28 in panchina, 0,96 nella scheda). I dati erano corretti, era la visualizzazione a mescolare due misure.
- Ora campo e panchina mostrano la media stagionale (`effMed`), e la panchina è ordinata per media; sotto, in piccolo, "ultima X". Scheda giocatore: nuovo riquadro "Ultima partita".
- Aggiunti i controlli automatici di coerenza (`tools/verifica.mjs` nel workflow GitHub + `checkDati` all'apertura).
- Tabellone playoff stile bracket: semifinali a metà altezza tra i due quarti, finalissima al centro con coppa dorata (e nome dei campioni a fine stagione), linee di collegamento; finale 3° posto separata in basso. Box vuoti con "Vincente"/"Perdente semifinale"; niente etichette QF/SF dentro i box.
- Coppa del tabellone viola (tema DREAMERS), senza scritta sotto; a fine stagione compare "Campioni" con la squadra vincitrice.

## 25/10/2026 (20) — Asta Peacocks: Trevon Brazile
- Spostamento G League (registrato dall'altro Claude): Brazile sale dalla G League nello slot rookie dei Peacocks, Nate Ament scende in G League (ROSTER, EFF, GLEAGUE, ROOKIE, voce "G League" in TRADES).
- Aggiunto il costo dell'asta: voce "Asta" in `TRADES` con 14 crediti (registrati come 10 commissione + 4 di lista) → la cassa Peacocks registra −14 da sola; `CREDITI.PEA` 52 → 38. `NBA_ANNO`: Brazile 2026.
- Pagina Trade: nelle aste i crediti ora si vedono come spesa (−14 cr) invece di +14.
- Calcolatore Scambi: Trevon Brazile valore 1100 (indicato da Francesco), segnato rookie.
- G League: G-Peacocks con il logo "Seattle Peacocks" (PNG con sfondo trasparente) e sfondo giallo `#fedd04`.

## 25/10/2026 (21) — Condividi cassa
- Pagina Cassa: piccolo bottone condividi in alto a destra nella testata (`.bshare.hsh`, `data-cshare`, `shareCassa`). Crea un PNG con testata nel colore della squadra (logo, città, nome), crediti disponibili con crediti/debiti portafoglio e post draft, bilancio per stagione, registro completo entrate/uscite e liste "Deve pagare"/"Deve ricevere". Legge `movimenti(t)`, `DEBITI`, `CREDITI` al momento.
- Pagina Roster (Dunkest → Roster): stesso piccolo bottone nella testata (`data-rshare`, `shareRoster`). Immagine con testata squadra e 3 colonne (Guardie, Ali, Centri) ordinate per efficienza media: cognome grande, nome · numero · squadra NBA (· R se rookie), efficienza colorata. Testata e invio in comune: `shHead`, `shSend`.
- G League: G-Turtles con il logo "Los Angeles Turtles" scontornato (PNG trasparente), sfondo viola chiaro `#9b7ad8` (diverso dai G-Ducks) e bordo oro `#f5b82e`.

## 25/10/2026 (22) — Tabella squadra partita per partita
- Efficienza → squadra (`vEffSquadra`): tolte le colonne Min notte / Eff. notte / PG / Eff. media / Forma / Min ult. 5. Ora ogni colonna è una PARTITA DEL GIOCATORE in ordine (G1 = sua prima, G2 = seconda…), da `PARTITE`; cella = efficienza di quella partita (colorata) con data e avversario sotto. Nessun buco: chi ha giocato meno ha le ultime caselle vuote. Prima colonna (nome + squadra NBA) fissa, si scorre a destra. Si allunga da sola quando il report aggiunge partite a `PARTITE`.
- Filtro per mese sopra la tabella (`esqMese`, bottoni `data-esqm`): "Stagione" o un mese (si apre sul mese più recente). Nei mesi le colonne sono 1ª, 2ª… partita del mese; nella casella solo la squadra avversaria.
- Bottone "Statistiche avanzate" (`esqAdv`, `advStats`, `advTable`): PG, minuti medi, efficienza media (media semplice delle partite), medie ultime 30/15/5 (grigie se il giocatore non ha ancora quel numero di partite), Tendenza (pendenza della retta dei minimi quadrati sulle ultime 10 partite × 5 = variazione attesa in 5 partite; servono ≥5 partite; → se sotto ±0,03), Ult. 7 vs media (verde/rosso se |differenza| ≥ 0,05, altrimenti ≈). Tutto da `PARTITE`.
- Interruttore Efficienza / PDK in cima alla tabella squadra (`esqMet`, `MET()`, `mEv`): stessa tabella partita per partita, filtro mesi e statistiche avanzate, ma con i punti Dunkest della partita (`PARTITE[..][3]`). Colori PDK: verde ≥ 35, giallo 20–35, rosso < 20; soglie tendenza ±1 PDK e ultime 7 vs media ±2 PDK. In modalità PDK i giocatori sono ordinati per PDK medio.
- Comandi della tabella squadra in un blocco ordinato (`.esqctl`): interruttore Efficienza/PDK e "Statistiche avanzate" a tutta larghezza, stessa altezza (34px); bottoni dei mesi compatti.
- Fix: i sottotitoli delle intestazioni di sezione (h2 em) ora si accorciano con "…" invece di allargare la pagina su telefono (Home, Efficienza, Infortuni, Sfida della notte).
- Filtro mesi: sempre tutti i mesi della regular season (Ottobre → Aprile), selezionabili anche se vuoti (messaggio "nessuna partita ancora"); il primo bottone si chiama "Stagione 3". All'apertura si sceglie il mese più recente con dati.
- Infortuni: per le malattie che colpiscono tutto il corpo (malattia, POTS, influenza, virus, febbre…) il manichino è colorato per intero nel colore dello stato (es. Porziņģis tutto rosso).

## 25/10/2026 (23) — Calcolatore Scambi a 3 squadre
- Nuova scheda "3 squadre" (`VT.tab="calc3"`, stato `V3`, `v3Res`, `v3Card`, `v3Act`). Ogni pezzo (giocatore, pick, crediti) ha chi lo dà e chi lo riceve (selettore "→", default squadra successiva). Saldo squadra = punti ricevuti − punti dati; barra con zero al centro (verde a destra = guadagna, rosso a sinistra = perde). Squilibrio = saldo massimo ÷ volume massimo scambiato da una squadra (soglie 10%/25%); suggerisce i crediti che il più avvantaggiato dovrebbe dare al più penalizzato. La scheda a 2 squadre è invariata.

## 25/10/2026 (24) — Valori Dynasty League nel Calcolatore Scambi
- `VALORI` ora contiene i valori della lega (formula di Francesco), non più Court Consensus: Efficienza × PDK medio ÷ (età + correzione) × 1000. Correzione età: 19-21 −4, 22-23 −3, 24-25 −2, 26 −1, 27-30 0, 31-32 +2, 33-34 +4, 35-37 +6, 38+ +11. Età calcolate al 25/10/2026 (alcune stimate, vedi CSV in chat).
- Dati: 2025/26 se ≥30 partite, altrimenti 2024/25 (≥30), altrimenti le due insieme (`STAGIONI`). Rookie 2026 con valori fissati da Francesco (Boozer 1500, Dybantsa 1200, Wilson 1150, Peterson 1000, Mara 970, Acuff 900, Brown 880, Wagler 850, Burries 830, De Larrea 770, Lendeborg 750, Flemings 700, Graves 550, Morez Johnson 550, Brazile 400; Steinbach da formula 377).
- Ricalibrato: punti trade = (valore/1000)^2 × 1000; 300 crediti ≈ giocatore da 1150 (centro di 1000-1300), quindi `VAL_CR` = 1,15²×1000/300 ≈ 4,41 punti per credito. `VAL_FALLBACK` = 400.
- Anche DREAMERS usa `VALORI` per i 10 titolari: le formazioni cambiano di conseguenza (dal turno 1, che parte il 26/10).
- I valori sono statici: a fine stagione o quando servono vanno ricalcolati con la stessa formula.

## 25/10/2026 (25) — PDK su campo, panchina e DREAMERS
- Pagina squadra (campo e panchina): al posto dell'efficienza i PDK medi a partita della stagione (`pdkMed`, `pillP`; colori verde ≥35, giallo 20–35, rosso <20); panchina ordinata per PDK medio, sotto "ultima" = PDK dell'ultima partita (`pdkLast`).
- DREAMERS: il punteggio usa i PDK. PDK settimanale di un giocatore = media dei PDK delle sue partite della settimana; punteggio di turno = media dei 10. `tools/dreamers.mjs` ora archivia i PDK della notte (colonna 5 di `EFF.gioc`), la notte live si legge dallo stesso campo.

## 25/10/2026 (26) — Nuovo logo Foxes
- `LOGO.FOX` sostituito con il nuovo logo "Detroit Foxes" (volpe in gessato, PNG trasparente). Vale ovunque: Home, testate, campo, classifiche, loghi piccoli e immagini condivise.
- Efficienza squadre: interruttore "Eff. / PDK" accanto al menu Stagione (`effMet`). In PDK: valore di squadra = media dei PDK medi a partita dei giocatori della rosa (stagione scelta, `teamPdk`), notte = media PDK di chi ha giocato (`teamPdkNight`), classifica riordinata per PDK. Il tastino cambia tutta la pagina: classifica squadre, Top 10, Flop 10 e tabella Giocatori passano ai PDK medi a partita (stessa stagione, stesso filtro min. 10 minuti); scegliendo PDK anche la tabella squadra si apre in PDK.

## 25/10/2026 (27) — Colori dei ruoli unici in tutta l'app
- Variabili CSS `--rG` (guardie, verde #a3e635), `--rF` (ali, blu #60a5fa), `--rC` (centri, giallo #fbbf24) usate da roster (`.grl`), Rookie History (`.rhrole`, ora con lettera A per le ali come nel resto dell'app), calcolatore (`.vtp .rc`) e immagine roster condivisa. Per nuove schermate usare sempre queste variabili.
- DREAMERS: a turno chiuso (dopo le sostituzioni) il giocatore con il PDK medio più alto dei 10 è capitano ×1,5 e i 4 più bassi valgono ×0,5; punteggio = media dei 10 valori finali (`drTeam`, campi `m`, `cap`, `half`, `f`). Capitano e dimezzati si applicano anche a turno in corso, tra chi ha già giocato, e cambiano a ogni report; a turno chiuso diventano definitivi.
- DREAMERS dettaglio partita ordinato a sezioni colorate: Capitano ×1,5 (oro), Punteggio pieno (verde), Panchina · ½ (rosso), In attesa (viola, solo a turno in corso), Tribuna (grigio = riserve non ancora entrate). Dentro ogni sezione ordine per punteggio.

## 25/10/2026 (28) — Condividi scambio
- Calcolatore Scambi (2 e 3 squadre): piccolo bottone condividi in alto a destra nel riquadro del risultato (`data-tshare`, `shareTrade`, `tradeModel`). Immagine: logo lega e data, per ogni squadra cosa riceve (con valore dei giocatori e, a 3 squadre, da chi), barre di equilibrio con saldo, giudizio colorato, squilibrio % e crediti suggeriti.

## 25/10/2026 (29) — DREAMERS meritocrazia
- Non ci sono più 10 titolari fissi con riserve che entrano solo per lo 0. Ogni settimana tutta la rosa concorre: i 10 con il PDK medio settimanale più alto sono titolari (1° capitano ×1,5, ultimi 4 dei 10 ×0,5, gli altri pieno), il resto va in tribuna (`drTeam`: `top`, `trib`, `wait`, `zeros`). Si aggiorna a ogni report. A turno chiuso, se hanno giocato meno di 10 giocatori, i posti mancanti valgono 0. `form` (valori) serve solo a definire la rosa del turno.

## 25/10/2026 (30) — DREAMERS a tutto schermo
- Entrando in DREAMERS la pagina diventa un'app a sé: classe `body.dreamfs` (impostata in `render()`) nasconde testata, barra e footer; bottone rosso fisso "‹ Torna all'app" (`.drexit`, `data-game="menu"`) per tornare ai Giochi.
- Look più moderno: card con angoli arrotondati e ombre, cerchi dei loghi più grandi (60px nelle partite) con logo centrato al 76% del cerchio.
- DREAMERS: il bottone "Torna all'app" ora scorre via con la pagina (in cima alla schermata). Calendario con logo + nome squadra (solo animale) per ogni partita, una per riga, vincitrice in bianco.
- DREAMERS a tutto schermo, spazio sfruttato meglio: classifica a schede grandi (posizione, logo 58px, nome, media e turni, forma ultime 5 V/P, vittorie/sconfitte grandi, distacco dalla prima); tabellone playoff più grande (quarti più larghi con nomi, semifinali e finale con logo grande e punteggio, coppa più grande).
- DREAMERS a tutto schermo: anche la zona della barra di stato (ora, batteria) è viola: `html.dreamfs` toglie il margine di sicurezza e la fascia scura (`body::before`), il colore `theme-color` diventa viola mentre si è dentro DREAMERS e torna blu uscendo.
- DREAMERS classifica: aggiunta la MEDIA punteggio accanto a V e P; a parità di vittorie si ordina per media (`drStand` → `avg`).
- Calcolatore → Valori lega: colonna "Prezzo cr" (prezzo consigliato in crediti) accanto al valore. Proporzionale al valore, tarato su Scottie Barnes (valore 1275 = 400 crediti pagati): prezzo = valore × 400 ÷ 1275, arrotondato a 5 (`PREZZO_RIF`, `prezzo`).
- Valori aggiornati a mano da Francesco (25/10 sera) per 37 giocatori (es. Flagg 1700, Banchero 1275, Hartenstein 300, Booker 790, Brazile 90, Ighodaro 90, Kuminga 170, Wolf 150, Paul George 250, Porziņģis 30, Ingram 390…). Prezzo consigliato rifatto: curva esponenziale sul valore, correzione età e ruolo (`prezzo(v,nome)`, `PR`, date di nascita in `NASCITA`, `eta`, `ruoloDi`).
- Prezzi fissati a mano (precedenza sulla curva): `PREZZO_FISSO` — Buzelis 150, Ware 200.

## 25/10/2026 (31) — Risultati in stile calendario
- Sezione Risultati rifatta: una scheda per giornata (pillola Finale/Live), ogni partita su una riga: logo tondo + nome, punteggio al centro (vincente in oro, scarto sotto), avversaria a destra, icona condividi a fine riga (stesso `data-share` → `shareGame`). CSS `.rgc/.rgh/.rgm/.rgt/.rgl/.rgs`, funzione `vRisultati`.
- Risultati: loghi quadrati a spigolo vivo e più grandi (56px), `.rgl`.
- Prezzi fissati a mano (25/10 notte) in `PREZZO_FISSO`: Jokić 1400, Flagg 1200, J. Johnson 850, Cunningham 850, Dončić 800, SGA 750, Boozer 750, Giddey 690, Duren 600, Giannis 600, Castle 420, Clingan 390, Haliburton 290, Ware 200, Buzelis 140, T. Murphy III 130, D. Daniels 125, Kyshawn George 110, Burries 99, Zion 80, Reaves 70, LeBron 50.
- Valore Jokić portato a 3150 (era 2813), ora sopra Wembanyama (3127).
- Prezzi fissi aggiunti: Sabonis 470, Trae Young 179, Anthony Davis 155; Buzelis 120.
- Risultati: loghi senza sfondo colorato (solo PNG trasparente con leggera ombra), `.rgl`.
- Classifica: loghi senza sfondo colorato (`.clf .wedge`).
- Sala Trofei: loghi senza sfondo colorato (`body[data-v=storia] .wedge`; `render()` ora scrive `body.dataset.v=cur`).

## 25/10/2026 (32) — DREAMERS: playoff al meglio delle 3
- Regular season ridotta da 21 a 15 turni (`DR_REG=15`, 2 gironi completi + 1 turno). Playoff: quarti, semifinali e finale (con finale 3° posto in parallelo) al meglio delle 3, una gara a settimana, max 9 settimane (`DR_TOT=24`, fine stagione invariata).
- Ottimizzati: un turno finisce appena tutte le sue serie sono decise (se finiscono tutte 2-0 si passa subito al turno dopo). A parità di punteggio in una gara vince la testa di serie migliore.
- Nuova `drPO(st)` sostituisce `drBracket/drWin`: restituisce serie (`R`), settimane di playoff (`W[k]={r,g,pr}`), inizio turni (`RS`), `done`, `end`, `champ`. Calendario: settimane non ancora determinate = "Playoff · solo se necessaria"; tabellone mostra le vittorie nella serie; nel turno ogni partita ha la riga "Quarto N · gara G · serie X–Y".
- Serie di piazzamento: i perdenti dei quarti giocano le semifinali 5°–8° (in parallelo alle semifinali), poi finale 5° e 7° posto (in parallelo alla finale), tutte al meglio delle 3. Il turno finisce quando sono decise tutte le serie, piazzamenti compresi. In fondo al tab Playoff: blocco "Piazzamenti 5°–8°" e "Classifica finale" 1→8 (`P.fin`).
- Tab Playoff rifatto: due tabelloni a scorrimento orizzontale (`.bkw/.bk/.bkc/.bkg/.bkm/.bkt`, connettori in CSS): "Tabellone" (quarti → semifinali → finalissima con coppa e campione, finale 3° posto sotto) e "Piazzamenti 5°–8°" (semifinali → finale 5° e 7° posto). Nomi interi, vittorie nella serie, etichetta su ogni serie. Classifica finale 1→8 su due colonne.

## 26/10/2026 (33) — Calcolatore: nuovo esito scambio
- `tradeVerdict(d,t)`: sotto 10% "Trade equilibrata", fino al 40% "Vincitore trade Squadra", oltre il 40% "Grande truffa dei Squadra" (calcolatore a 2 e a 3 squadre e immagine da condividere).
- Logo Ducks completo (papero con palla, `LOGO.DUC`) in Risultati, Classifica e Sala Trofei, cioè le sezioni con i loghi senza sfondo (selettori aggiunti alla regola `.hlg`).
- Ripristinato il logo Ducks solo scritta in Risultati, Classifica e Sala Trofei (tolto il papero completo).
- Logo Ducks +14% (`transform:scale(1.14)`) solo in Risultati e Classifica.

## 26/10/2026 (34) — Stelle giocatori in Trade Alert
- `pdkStar(n)` = PDK medio 2025/26 se ≥30 partite, altrimenti 2024/25 (≥30), altrimenti tutte le partite note. `stelle(n)`: 50+ = 5, 45 = 4½, 40 = 4, 35 = 3½, 30 = 3, 28,5 = 2½, 27 = 2, sotto 27 = 0 (stelle vuote); solo i rookie = 1. In Trade Alert ogni giocatore è su una riga con le stelle sotto (`.tstar`, mezza stella con riempimento parziale).
- 26/10 notte: tolte le caselle colorate (revert dei 3 commit di stile), DREAMERS torna con caselle scure e loghi nel cerchio. In tutte le sezioni DREAMERS ora c'è il nome completo della squadra (`TEAMS.name`, es. "Sacramento Spiders"), che va a capo invece di essere tagliato.
- DREAMERS Turno compatto: righe più basse, cerchi loghi 46px con più margine (più piccoli rispetto alla casella), nomi 18px, gap 7px: su iPhone si vedono tutte e 4 le partite quasi senza scorrere.
- DREAMERS: tolti i cerchi colorati dietro i loghi in tutte le sezioni, solo logo con ombra leggera e margine: Turno 52px, Classifica 52px, Calendario 34px, dettaglio 40px, tabelloni 30px, classifica finale 32px (Ducks ×1,14).
- DREAMERS: alone leggero del colore squadra dietro ogni logo (classe `.tint` + `--tc` nella riga: radiale sfocato + sfumatura lineare tenue), in Turno, dettaglio, Calendario (lato del logo), Classifica, tabelloni e classifica finale. Il colore è solo sfondo: loghi sopra (`z-index:2`) e sempre a piena opacità, anche per chi perde/è eliminato.
- Tabelloni: l'alone colorato ora segue esattamente gli angoli arrotondati delle caselle (`.bkm` senza padding, prima/ultima riga con raggio 13px); etichetta "Quarto N" sopra l'alone (`.bklab` z-index 5).
- Menu: il tab "Efficienza" ora si chiama "Statistiche" (stessa sezione, `data-v="efficienza"`); titolo "Statistiche squadre" (e tasto indietro dalla tabella squadra).

## 26/10/2026 (36) — Grafico andamento giocatore
- Bottone "📈 Grafico" sotto "Statistiche avanzate" (tabella squadra) e nella scheda giocatore. Apre la vista `grafico` (`vGrafico`, stato `GR`): sfondo a tinta piena col colore della squadra proprietaria e scritte nel suo colore (`TEAMS.bg`/`fg`), menu Giocatore/Stagione (3 stagioni o Tutte)/Periodo (Partite, Settimane, Mesi, Stagioni) a metà larghezza, a destra la maglia del giocatore scelto (`jersey`).
- 3 bottoni-linea attivabili insieme o da soli: PDK verde, Minuti giallo, Efficienza viola (con la media del periodo). Grafico SVG fatto a mano: linea = media mobile (8 partite, 4 settimane, 2 mesi) con curva morbida senza "overshoot"; scala adattata ai dati con margine minimo; PDK/minuti a sinistra, efficienza a destra. Dati: `PARTITE` (stagione in corso) e `STAGIONI` (passate), anno ricavato dal mese (ago-dic = primo anno).
- Stelle anche nel Calcolatore scambi: in "Valori lega" accanto alla squadra e sotto il nome dei giocatori scelti nel calcolatore a 2 squadre (`starH`). Sistemato il badge "R" dei rookie, che si allargava a tutta la riga (`.vtnn`).
- Stelle nuove regole: 24-26,9 PDK = 1 stella, sotto 24 = 0. I rookie della stagione hanno in più una stella AZZURRA che si somma alle normali (es. Boozer 29 PDK = 2½ + azzurra); `isRookie(n)`, `.tstar .trk`.
- Stelle disegnate in SVG (`STAR_P`, riempimento parziale con clipPath) invece che con caratteri ★: tutte perfettamente allineate in orizzontale, mezze stelle precise.
- Grafico più chiaro: linee spezzate (angoli sui punti, niente curve). Con pochi punti (≤12: stagioni, mesi) ogni punto ha pallino ed etichetta col valore nel colore della linea (valore più alto sopra, più basso sotto, quello in mezzo di lato) e righe verticali tratteggiate; con tanti punti (partite, settimane) etichetta solo sull'ultimo. Mesi senza media mobile. Asse "Stagione 1/2/3" con gli anni sotto. Scegliendo "Tutte" il periodo passa da solo a "Stagioni".
- Grafico a livelli: menu Giocatore / Stagione (1-2-3 o Tutte) / Mese / Settimana al posto di "Periodo". Livello automatico: Tutte → un punto per stagione; stagione → un punto per mese; mese → un punto per settimana (Sett. 1, 2… con date); settimana → un punto per partita (giorno, data, avversaria). Niente medie mobili: ogni punto è la media reale del periodo, sempre con etichetta valore. Etichette senza sovrapposizioni (cercano il primo posto libero vicino al punto), grafico più alto quando ci sono più linee.
- Grafico: tolto il livello settimana→partite. Menu "Dal mese" / "Al mese" (intervallo continuo, "Al" mostra solo i mesi dal primo in poi): nessun mese = tutta la stagione per mese; intervallo di più mesi = un punto per mese; stesso mese = un punto per settimana. "Tutte" = un punto per stagione.
- Mese singolo diviso sempre in 4 settimane fisse (1-7, 8-14, 15-21, 22-fine mese): 4 punti esatti. Regola generale: si mostra sempre l'unità più piccola sopra quella scelta (più stagioni → stagioni, più mesi → mesi, un mese → 4 settimane).
- Grafico: riquadro in alto a destra "Media e tendenza" per ogni linea accesa. Media = media dei punti del grafico (stagioni, mesi o settimane). Tendenza = retta dei minimi quadrati su tutti i punti: variazione dal primo all'ultimo punto lungo la retta, in % sulla media (`grTrend`); entro ±3% = "stabile", sopra ▲ verde, sotto ▼ rosso.

## 26/10/2026 (37) — Efficienza Cup: Confronto rookie
- Bottone "Confronto" accanto a "Rookie History" (`cupCmp`, `vRookieCmp`): due menu con tutti i rookie raggruppati per stagione (rookie attuali con partite + Rookie History), tre bottoni PDK / Minuti / Efficienza (uno alla volta), grafico mese per mese (asse continuo Ott→Apr, Mag se serve) con due linee spezzate ed etichette valore, senza media né tendenza. Colore = squadra della lega che possiede il giocatore (`TEAMS.bg`, se uguale all'altro si usa il secondo colore), altrimenti colore fisso dal nome (`CMP_PAL`).
- Dati: rookie attuali → `PARTITE`; rookie 2024/25-2025/26 in lega → `STAGIONI`; altri 46 rookie storici → `RK_MESI` (medie mensili landofbasketball.com: PDK del mese con formula Dunkest sulle medie, ricalibrato sul PDK ufficiale di stagione di `ROOKIE_HIST`; efficienza = PDK/minuti). Mancano (nessuna fonte mensile trovata): Facundo Campazzo, Terry Taylor, Jalen Williams, Jaylin Williams.
- Nuovo file `tools/CRITERI_VALORI.md`: registro dei criteri dati da Francesco per stelline, valori e prezzi (taratura in corso).

## 26/10/2026 (38) — Stelline giocatore (pagella) e Spazio in squadra
- In corso con Francesco la taratura di valori e prezzi del Calcolatore a partire da "stelline" per categoria: PDK (+ rookie), Giovinezza, Infortuni, Minutaggio, Efficienza giovani (1°-3° anno), Efficienza esperti, Spazio in squadra. Regole e voti del GM in `tools/CRITERI_VALORI.md` (da leggere prima di toccare i valori).
- Nuovo file `spazio-data.js` (`SPAZIO_DATA`, caricato da index.html e nella cache del service worker, cache `dynasty-v3`): **lo compila il Claude dei report da Dunkest**, vedi regola 7 in alto. Finché è vuoto, `spazioStelle(n)` ordina solo i giocatori della lega della stessa squadra NBA (meno preciso perché mancano i compagni non in lega).
- 26/10 mattina: valori e prezzi aggiornati a mano da Francesco per 51 giocatori (Wembanyama 3250/2500, Dončić 2500/900, Davis 1999/230, Embiid 1540/130…): valori in `VALORI`, prezzi in `PREZZO_FISSO`, `VALORI_AGG` = 26/10/2026. Servono anche come riferimenti per tarare le formule stelline → valore/prezzo.

## 26/10/2026 (39) — Nuovi valori/prezzi e Pagella nella scheda giocatore
- Valori e prezzi ritarati da Francesco (VALORI_AGG = 26/10/2026; elenco in tools/taratura-26-10.txt, criteri in
  tools/CRITERI_VALORI.md). I valori restano scelti da Francesco: la formula automatica è ancora in discussione, NON
  ricalcolarli da soli.
- Scheda giocatore: nuova sezione **Pagella** (valore, prezzo e stelline graduali: PDK + stella azzurra rookie, Giovinezza,
  Infortuni, Minutaggio, Efficienza giovani/esperti, Spazio in squadra). Funzioni `pagella(n)`, `pagellaHTML(n)`.
  Si aggiornano da sole con i report, tranne **INF_STELLE** (stelline infortuni): aggiornarle a mano se un giocatore ha un
  infortunio lungo, rientra, o entra un giocatore nuovo (regole nel commento sopra INF_STELLE).
- Valori lega: tocca una riga per aprire la scheda del giocatore (il tasto indietro torna a Valori lega).

## 26/10/2026 (40) — Campo: pulsanti "Cap" e "In arrivo"
- Sotto il campo la nota sui colori è sostituita da due pulsanti. **Cap** (view `cap`, `vCap`, stato `CAP`, salvato in
  localStorage `dl_cap_<squadra>`): il GM sceglie i candidati capitano e l'avversario NBA di ognuno; mostra media PDK
  contro quell'avversario (ultime 3 stagioni, partite, minuti, migliore, pallini partita per partita), forma (Media
  stagione, Ultimo 50%, Ultimo 15%), Indice Cap (40% vs avversario corretto verso la media + 35% ultimo 15% + 25%
  stagione) e controllo anti-tank contro il miglior altro candidato (tolleranza 3 PDK, 2/3 verdi; <15 partite = indicativo).
- Secondo pulsante **Multe** (view `multe`, `vMulte`, `mulPar`, `mulCheck`, `MUL_MIN=15`, `MUL_TOL=3`): simulatore del
  sistema anti-tank dell'Articolo 6. Il GM seleziona i possibili capitani e le alternative; per ognuno: media stagione,
  ultimo 50%, ultimo 15% (partite arrotondate per eccesso) e verdetto "Nessuna multa"/"Multa possibile" confrontandolo
  con ogni altro selezionato (2/3 verdi, tolleranza 3,00 PDK). Con meno di 15 partite o partite non paragonabili per
  infortunio (<60% dell'altro) avvisa che il calcolo non vale ufficialmente (decide la commissione). Verificato
  sull'esempio del regolamento (A 3/3, B 2/3).

## 26/10/2026 (41) — Statistiche: "Calcola il trend"
- Pulsante verde sotto Efficienza Cup → view `trend` (`vTrend`, stato `TRN`, `trKey`, `trLab`, `trCol`). Ricerca al
  contrario rispetto al Grafico: si scelgono periodo (stagioni consecutive Dalla–Alla stagione; se una sola, dal mese–al mese), squadra, misura (PDK, Minuti,
  Efficienza), direzione (crescita/calo), soglia % e partite minime; escono tutti i giocatori della lega con quel trend
  (filtro ruoli G/F/C multiplo, `TRN.ruoli`; stesso calcolo `grTrend` del Grafico; punti per stagione, mese o settimana se il periodo è un solo mese), con grafico
  a linee nei colori squadra (max 8, tratteggi diversi per giocatori della stessa squadra) e pulsante 📈 che apre il
  Grafico del giocatore sullo stesso periodo.
- (42) Grafico e Calcola il trend: al posto di "Stagione" (con "Tutte") ci sono **Dalla stagione / Alla stagione**
  (stagioni consecutive, `GR.sz`–`GR.sz2`, `TRN.sz`–`TRN.sz2`). Più stagioni = un punto per stagione e mesi disattivati;
  una stagione = come prima (mesi, o settimane se un solo mese).

## 26/10/2026 (43) — Archivio College riservato (solo Francesco)
- Nel Campo dei Ducks, a destra di "Roster completo", c'è un pulsantino "accensione" quasi invisibile (`#cpow`): chiede
  una password e apre la view `college` (archivio POT college per ruolo, con ricerca).
- I dati sono in `COL_ENC` **cifrati** (AES-GCM, chiave PBKDF2 dalla password): NON modificare, NON decifrare, NON
  rimuovere. La password non è nel codice. Lo aggiorna solo il Claude di Francesco ricifrando l'archivio.
- (44) L'archivio riservato è diventato **Scouting** (view `college`): schede Prospetti (classe draft senza dati NBA,
  proiezione = PDK/min college × tenuta tipica del ruolo, a 25'), Studio rookie (tenuta college→NBA dei giocatori al
  1°-3° anno, `colConv`, `colNbaPm`, affidabilità dei dati college `colAffid`), Mappa (usage vs PDK/min con linee POT),
  College→NBA (POT vs miglior PDK NBA, `colReg`), Archivio. Scheda giocatore al tocco (`colCard`: percentili nel ruolo,
  profilo, tenuta/proiezione, 3 profili college più simili). I dati NBA si leggono dall'app e si aggiornano da soli;
  l'archivio college resta cifrato (non toccare `COL_ENC`).
- (45) Scouting in giallo Ducks (logo Texas Ducks, "Ufficio Scouting"). Nuova scheda iniziale **Studio usage**
  (`colUsage`): profilo "Haliburton" = usage college basso + P36/USG alto (soglie regolabili), grafico usage vs
  P36/USG colorato per esito NBA, confronto profilo vs altri (30+ PDK, PDK medio, tenuta, salto da rookie),
  primo anno → migliore, candidati classe 2026, elenco dati NBA mancanti.
- (46) Scouting: l'archivio cifrato ora contiene anche la carriera Dunkest (regular season dal 2018/19) di ogni
  giocatore. Studio usage rifatto: curva di crescita per anno NBA, esplosione (+8 PDK sull'anno da rookie), confronto
  equo solo sui debutti 2018-2023.
- (47) Scouting: nuova scheda iniziale **Radar** (`colRadar`): "PDK nascosti" = resa al minuto × minuti mancanti fino a
  32' (resa NBA recente o, se manca, PDK/min college × tenuta del ruolo), validata sullo storico (debutti 2018-2023)
  e applicata ai rookie 2024-2026. Grafica dello scouting rinnovata (schede a pillola, card arrotondate).
- (48) Ufficio Scouting diviso in **College** (prima scheda "Archivio" come l'artefatto originale: tre sezioni per ruolo
  ordinate per POT, `colOrig`) e **NBA** (`vNbaSec`, `nbaTrend`): report a banner dei giocatori della lega con trend
  nelle ultime 1/2/3 settimane rispetto alla loro media solita, su PDK, minuti ed efficienza, partita per partita.
- (49) Scouting NBA con massima libertà (stato `NB`): **Report delta** (periodo = ultime N partite / ultimi N giorni /
  date a scelta; confronto = media solita / resto della stagione / 2025/26 / 2024/25; delta assoluto o %, soglia,
  partite minime, squadra, ruoli, vista banner o tabella) e **Grafici liberi** (fino a 6 giocatori, periodo con date o
  scorciatoie 7/14/30 giorni, punti per partita / media mobile 3-5 / settimana / mese, linea della media, trend).
- (50) Scouting College: nuova prima scheda **🏆 Risultati** (`colRisultati`): classifica dei prospetti (classe 2026, o
  anche rookie 2024-25) con indice 0-100 da 3 paragoni statistici (stesso ruolo, debutto NBA 2018-2024, profilo college
  più simile) e la loro carriera Dunkest: picco atteso, probabilità di esplosione, PDK nascosti.
- (51) Scheda giocatore dello Scouting: **commento tecnico** automatico (`colComment`: POT, PDK/min, P36/USG, usage,
  profilo, paragoni Dunkest `colComps`, inizio/carriera NBA) e pulsante **Condividi la scheda** (`colShare`, immagine
  1080×1350 del singolo giocatore).
- (52) Scouting: la scheda del giocatore si apre in un pannello sopra la lista (`.colsheet`) toccando qualsiasi nome
  (Archivio, Risultati, Radar, grafici…); si chiude con × o toccando fuori. Corretto il bug per cui dopo un tocco
  qualsiasi i nomi non aprivano più la scheda (listener "once" sostituito da uno permanente).
- (53) **PDK nascosti** diventa l'unità di misura dello Scouting (`colHidden`): reale con dati NBA, stima per i prospetti
  solo college (PDK/min college × tenuta del ruolo × (32' − minuti attesi = 10,6 + 0,52 × usage)). Mostrati in Archivio
  (colonna "Nasc."), Risultati (ordinamento predefinito), Radar e scheda giocatore. Riga archivio con x[7]=2 = prospetto.
- (54) Scouting: pulsante **📖 Legenda** in alto a destra (College e NBA) che apre la spiegazione di tutti i dati e i
  termini (`COL_LEG`, `colLegend`).
- (55) Risultati: tolto il "picco Dunkest atteso" (non richiesto da Francesco). Indice = 55% PDK nascosti + 45%
  probabilità di esplosione.

## 26/10/2026 (56) — Telefono in orizzontale
- Media query `(orientation:landscape) and (max-height:540px)` in fondo al `<head>`: contenuto a tutta larghezza,
  intestazione su una riga non fissa, campo e grafici entro l'altezza dello schermo, liste a 2 colonne (banner,
  Risultati, Radar…), filtri a 3-4 colonne. I grafici SVG usano `chW()` (340 in verticale, più larghi in orizzontale) e
  si ridisegnano da soli quando si gira il telefono.
- (57) Calcola il trend: toccando un giocatore si apre il suo dettaglio (`trDetail`): per PDK, minuti ed efficienza
  "partiva da" (primo punto del periodo) → "ora" (ultimo punto), differenza assoluta e %, media del periodo, trend e
  grafico personale. Il trattino a sinistra della riga mostra/nasconde la linea nel grafico comune.
  Pulsante Condividi (`trShare`): immagine 1080×1350 del dettaglio.
- (58) Grafico: con poche partite nel periodo (2-8) i punti sono le singole partite; se il periodo dà un solo punto
  (es. un solo mese) si scende a settimane e poi a partite. Calcola il trend: se nel periodo nessuno ha più di 8 partite,
  i punti sono le singole partite (prima 7 giocatori con 2-3 partite nella stessa settimana restavano esclusi).
- (59) Peacocks: `TEAMS.PEA.txt="#ffffff"` = colore delle scritte sulle intestazioni di squadra/giocatore e nel Grafico
  (caselle, numeri, etichette) al posto dell'arancione, per leggibilità. Usato come `c.txt||c.fg`.
- (60) Cap: difesa dell'avversario per ruolo (`capDef`): nelle ultime 5 partite dell'avversario (10 se pochi dati), PDK
  dei giocatori della lega dello stesso ruolo (≥10') rispetto alla loro media → "difesa morbida/nella media/dura".
  "Atteso" = Indice Cap corretto per questo delta (peso pieno da 6 prestazioni). In alto il riquadro "Consiglio
  capitano" con classifica dei candidati per atteso e alternativa.
- (61) Calcolatore scambi (2 e 3 squadre): giocatori di ogni squadra in ordine di ruolo (Guardie, Ali, Centri, con
  intestazione colorata) e dentro il ruolo per valore.
- (62) Valori lega: casella "Cerca giocatore o squadra" in testa (`#vtq`, filtra le righe mentre scrivi, ignora gli accenti).

## 26/10/2026 (63) — Nuovo gioco G-DREAMERS
- Giochi → G-DREAMERS (`vGDream`, `gdData`, stato `GD`, `GD_START`="2026-10-20"): fanta delle 8 G League. I 5
  giocatori di ogni G League sono sempre titolari, niente capitano, PDK pieni; nessuno scontro diretto né playoff:
  ogni notte i PDK si sommano e la classifica è il totale. Schede Classifica (con ultima notte e ▲▼ posizioni),
  Giornate (punti notte per notte) e Squadre (giocatori, totali e partita per partita).
- Dati letti da `GL_STATS` (log partita per partita): per aggiornarlo basta il report G League già esistente.
- (64) Home: barra "Cerca giocatore" elegante al posto di "Tocca un logo per il roster" (`#hq`, `homeSearch`): risultati con maglia, squadra e ruolo; tocco = scheda giocatore (indietro torna alla Home).
- (65) G-DREAMERS usa i colori delle G League (`GLEAGUE.bg`: Ducks viola, Peacocks giallo, Turtles lilla), per le altre quelli della prima squadra (`gdBg`).
- (66) Home: pulsantino rosso (telecamera con pallino "live" pulsante) accanto alla ricerca che apre la Dynasty TV (view `tv`).
- (67) Menu: "Giochi" rinominato **Entertainment**; Dynasty TV tolta dalla barra in alto e messa dentro Entertainment con un pulsante come Arcade (`data-tvopen`); dalla TV "‹ Entertainment" torna al menu. Il pulsante rosso in Home apre sempre la TV.
- (68) Dynasty TV, tabellino: colonna PDK spostata subito dopo il nome, in rosso; durante una partita in corso diventa "PDK live" con pallino lampeggiante.

(69) Dynasty TV, dettaglio partita: tolti i blocchi "Migliori" e "Statistiche di squadra". Restano punteggio, tab squadre e box score giocatori (con PDK live in rosso).

(70) Dynasty TV, box score: a destra del nome (vicino ai PDK) il logo della squadra Dynasty proprietaria (tvOwn, confronto nomi senza accenti/suffissi su ROSTER). Svincolati: nessun logo.

(71) Dynasty TV, box score: logo proprietario in filigrana (grande, trasparente, a destra nella casella del nome). PDK colorati per fascia: rosso <20, giallo 20-29,99, verde ≥30 (classi pr/py/pg); il totale squadra e l'intestazione PDK sono bianchi.

(72) Dynasty TV, striscia giorni (#tvweek): non più 7 giorni fissi ma tutti i giorni del calendario caricato, scorrevoli col dito (scroll-snap, 7 visibili). All'apertura si centra sul giorno scelto; la posizione di scorrimento resta durante i refresh live (tvWeekPos, TVS.wl/TVS.wd).

(73) Scambio 26/10/2026 DOL↔MOO: ai Dolphins Jaime Jaquez Jr.; ai Mooses Jalen Williams + 30 cr post-Draft (debito Dolphins, in DEBITI tipo "post"). Aggiornati ROSTER, EFF.gioc, INFORTUNI (J. Williams ora t:"MOO"), TRADES. Titolari invariati (nessuno dei due era titolare).

(74) Indietro con swipe: script prima del service worker. Swipe dal bordo sinistro o destro (26px) → navBack(): chiude il .colsheet aperto, altrimenti clicca l'ultimo .gback/.grback della pagina (anche nascosto), altrimenti torna alla sezione precedente (pila NAVH, alimentata da un wrapper di render()). Android: voce finta in history + popstate → navBack. Sui telefoni (hover:none, pointer:coarse) i tasti .gback/.grback sono nascosti, tranne "‹ Annulla" dei giochi (data-nt="back"); su PC restano visibili. NON togliere i .gback dal markup: lo swipe li usa.

(75) Box score Dynasty TV: PDK dei giocatori in riquadri colorati con angoli arrotondati (.pdkb): rosso <20, giallo 20-29,99, verde 30-39,99, viola ≥40 (classi pr/py/pg/pv). Intestazione PDK e totale squadra bianchi, senza riquadro.

(76) Swipe indietro rivisto come SUPPORTO: i tasti ‹ sono di nuovo visibili ovunque (tolto il CSS che li nascondeva). Swipe ottimizzato: zona bordo 34px, la pagina segue il dito 1:1 (requestAnimationFrame, translate3d) con ombra, freccia #swar (fissa in alto a sinistra, sotto l'intestazione) che diventa gialla oltre la soglia (25% schermo o colpo veloce >0,45 px/ms), vibrazione breve su Android, animazione d'ingresso della pagina precedente.


(77) Free Agent: i dati ora sono UFFICIALI DUNKEST (richiesta esplicita dell'utente 26/10: "i dati devono essere DUNKEST non espn"). `const FA` e `FA_AGG` sono generati da /home/claude/fa_build.py (sessione dei report) con dunkest.com/api/stats/table, medie di regular season 24/25 (id 19), 25/26 (id 25), 26/27 (id 29): [nome, squadra, ruolo, numero, {stagione:[PG, min, PDK medio ufficiale, PDK/min, pt, rb, as]}]. Si aggiornano ogni mattina con il report Dunkest. NON rimettere dati ESPN/hoopR né PDK ricalcolati. Esclusi i giocatori nel ROSTER; G League (FA_OWN) sempre inclusi. Aggiungendo giocatori al ROSTER non serve toccare FA: lo script li toglie al giro successivo.

(78) Statistiche notte (vista "statnotte", vStatNotte; attenzione: vNotte e VIEWS.notte sono del gioco "Sfida della notte"). Bottone viola .snbtn sotto "Calcola il trend". Elenca tutti i giocatori dei ROSTER con una partita in PARTITE nella notte scelta (data USA, frecce per le notti precedenti), ordinati per PDK, con wedge colorato della franchigia e PDK nei riquadri a fasce (rosso <20, giallo, verde, viola ≥40).

(79) Statistiche notte: interruttore piccolo PDK/Eff. (.snsw, SN.m). In Eff. ordina per efficienza della notte (PARTITE col. 4) con fasce rosso <0,80, giallo 0,80-1,10, verde >1,10, viola ≥1,50 (stesse soglie del lvl dell'app + viola).

(80) Stelline PDK unificate: una sola funzione stelle(n) per liste (Trade, Valori lega, roster) e pagella. Usa pdkMix(n) = PDK aggiornato (stagione in corso pesata min(60%, partite/10) + pgRef; rookie solo stagione in corso) con scala graduale 20=0 · 24=1 · 27=2 · 30=3 · 40=4 · 50=5 (quella della pagella). Prima le liste usavano solo la stagione 2025/26 a gradini (es. Flagg 1 stella fuori, 2,2 nella pagella): 52 giocatori su 115 avevano stelline diverse. pdkStar() resta ma non è più usata per le stelline.

(78) Free Agent, scheda giocatore: sezione "Partita per partita" con scelta stagione 26/27 · 25/26 · 24/25 e mesi come le schede delle franchigie (`faGames`, stato `faPS`). Dati in `fa-games.js` (`const FAG={nome:{"2026/27":[[gg/mm,avv,min,pdk,eff,pt,rb,as]],...}}`, ufficiali Dunkest, generato ogni mattina da /home/claude/fa_games.py), caricato solo quando si apre una scheda free agent (`faLoadG`). Non metterlo dentro index.html (1,4 MB).

(81) PDK a fasce in tutta l'app (grafici esclusi): pdkLvl ora ha 4 livelli r <20 · y 20-29,99 · g 30-39,99 · v ≥40 (prima verde da 35) e c'è l'helper pdkB(v,testo) → <span class="pdkx …"> (riquadro arrotondato, come il box score). Applicato a: Campo (quintetto e panchina, .cev), Statistiche squadre/Efficienza in modo PDK (anche tabella giocatori e griglia partita per partita .gv), scheda giocatore (PDK medi e colonna Dunkest), Free Agent (lista, scheda, partite), G League (colonna PDK, PDK ultima, registro partite), Dynasty TV ("Top" delle partite), Cap (Stagione/Ultimo 50%/15%, media vs, atteso, precedenti .capgl). Usare pdkB/pdkLvl per i nuovi numeri PDK di giocatore; non per totali di squadra.

(82) Niente zoom su iPhone quando si tocca un campo di ricerca/menu: sui dispositivi touch input/select/textarea hanno font-size 16px (sotto i 16px iOS zooma la pagina e lo zoom resta). Non usare font più piccoli nei campi: lo zoom tornerebbe.

(83) Scheda Free Agent: menu a tendina della stagione (#fapsz, Stagione 1/2/3, sostituisce i chip; faPS) e bottone 📈 Grafico (data-grafico="FA") che apre lo stesso grafico dei giocatori dei roster (dalla/alla stagione, mesi, PDK/Minuti/Efficienza) con i dati FAG (fa-games.js). GR.fa = nome del free agent (null per i giocatori dei roster); grGames usa FAG[n][stagione] quando GR.fa===n. Nel grafico FA niente menu giocatore né maglia; logo della franchigia G League se il giocatore ha i diritti, altrimenti "FA". Menu in alto: resta evidenziato Dunkest.

(84) Dynasty TV autonoma (nessun aggiornamento a mano necessario per calendario/risultati/tabellini): oltre a todaysScoreboard (ogni 30 s) il telefono legge scheduleLeagueV2.json (max ogni 10 min, solo con Dynasty TV aperta) → aggiunge giorni/partite mancanti (tv-data.js finisce al 30/11), segna i finali che il report non ha, ricalcola i record W-L (tvRecalcRec). tvBoxes(giorno) scarica boxscore_<gameId> delle partite finite senza tabellino del giorno scelto (anche quando si cambia giorno). I dati di tv-data.js restano la base: finali con tabellino del report non vengono toccati. Solo partite 002/004/005 (regular season + Cup, playoff, play-in). Testato con dati NBA simulati; il collegamento reale dipende dal permesso CORS di cdn.nba.com (da verificare dal telefono durante una partita: nota "Live: dati NBA.com aggiornati…" = ok, "non raggiungibili" = bloccato).
