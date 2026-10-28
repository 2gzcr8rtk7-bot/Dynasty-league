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
> 8. **PUBBLICAZIONE SOLO SU ORDINE (regola dell'utente, 27/10/2026).** Non pubblicare MAI su `main` (= sito online) senza un ordine esplicito ("pubblica"). Le modifiche si mettono in coda sul branch `coda` (commit + push su `coda`, mai su `main`), anche più richieste una dopo l'altra; prima si manda sempre un rendering (screenshot). Solo quando arriva l'ordine: `git pull --rebase origin main` sul branch, poi merge di `coda` in `main` e push. Così si possono pubblicare più contenuti insieme.

> 9. **REPORT AUTOMATICO DUNKEST (28/10/2026).** Il report del mattino ora si fa con `tools/report_dunkest.mjs` (nel repository, non più script nella sessione di qualcuno). Da dentro la cartella del repo: `NODE_USE_ENV_PROXY=1 node tools/report_dunkest.mjs` (carica tutte le notti dopo l'ultima in PARTITE fino a ieri, data USA). Opzioni: `--prova` (non scrive), `--fino=AAAA-MM-GG`, `--forza`. Fonti solo Dunkest: `/api/stats/table` (chi ha giocato, id) + `/api/player/games` (PDK ufficiale, min:sec, avversario, tabellino). Aggiorna PARTITE, EFF, ULTIMA, GL_STATS, FA, FA_AGG, data in fondo, fa-games.js, tv-data.js (risultati, tabellini, record). Collaudato rifacendo il report del 27/10 dallo stato del 26/10: identico a quello del fratello (unica differenza: 1 minutaggio medio a 0,1). Se Dunkest non ha ancora tutte le partite della notte si ferma senza scrivere (exit 2): riprovare dopo. Poi `node tools/verifica.mjs`, commit su main con `git pull --rebase origin main` prima del push.
> 10. **ESPN SOLO PER IL LIVE (regola dell'utente, 28/10/2026).** I dati ESPN (tabellini live, PDK ricalcolati con la formula) servono SOLO durante la notte in corso e restano provvisori. Tutti i punteggi ufficiali (PARTITE, EFF, ULTIMA, Dreamers, G League, free agent, tabellini di Dynasty TV delle notti chiuse) devono venire da Dunkest, tramite il report del mattino (`tools/report_dunkest.mjs`), che sovrascrive i provvisori.

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

(85) Studio formula valori/prezzi (solo analisi, l'app non è cambiata): risultati in tools/CRITERI_VALORI.md, sezione "Formula appresa". Script di analisi fuori dal repo.

(86) VALORI AUTOMATICI SETTIMANALI (attivi da lunedì 2/11/2026). Blocco dopo prezzo(): VAL_MAN/PREZZO_MAN = copie dei valori/prezzi scritti a mano (la PARTENZA), valApply() al caricamento ricalcola VALORI[n][1] e PREZZO_FISSO[n] settimana per settimana dal lunedì di partenza (VAL_BASE[n] = [data, stelle infortuni alla partenza]; default 26/10/2026). Formula: valore × F(oggi)/F(partenza), F = PDKrif^1,78 × 0,93^(età−25) × 0,925^max(0; 2,5−inf); ±15% massimo a settimana (prima 10%); partite fino alla domenica (data USA). Rookie e senza storia NBA fermi fino a 20 partite. Prezzi fissati = stessa % del valore. Arrotondamento 5 (10 sopra 1000). In Valori lega e nella pagella compare la variazione dalla partenza (valDelta, "partenza X"). VALORI_AGG mostra l'ultimo lunedì "(automatico)".
REGOLA per chi aggiorna: quando Francesco dà un nuovo valore/prezzo, scriverlo in VALORI/PREZZO_FISSO come sempre E mettere in VAL_BASE[nome] ["AAAA-MM-GG" del lunedì di quella settimana, INF_STELLE attuale]. Nuovi giocatori senza VAL_BASE partono da VAL_ORIGINE: per loro aggiungere sempre la riga in VAL_BASE con la data del lunedì in cui entrano. A fine stagione (stagione nuova) valDt/valBaseStorica vanno aggiornati (anni e stagioni di riferimento).

(87) Freno dei valori automatici portato al 15% a settimana (richiesta di Francesco 26/10).

(88) Free Agent: stagioni scritte come "Stagione 1/2/3" (FA_SZL: 24/25=1, 25/26=2, 26/27=3) nei bottoni della lista e nella tabella della scheda ("Stag. 3" con sotto 26/27).

(89) Scheda giocatore: griglia di 6 caselle come prima, ma "In squadra" (efficienza) sostituita da "Lega · PDK" (posizione per PDK medi a partita tra tutti i giocatori della lega con partite nella stagione scelta) e "Nella lega" rinominata "Lega · efficienza". Nota in fondo spiega le due classifiche.

(90) Loghi G League: glBadge(t,cls) = logo della squadra G League se GLEAGUE ne ha uno (oggi DUC, PEA, TUR), altrimenti logo della franchigia con la "G" gialla. Usato per i giocatori G League in: Calcola il trend (lista), Free Agent (lista e scheda), box score Dynasty TV (filigrana, anche per i free agent con diritti G League: TVGL), grafico. Grafico: ora apre davvero il giocatore G League scelto (prima tornava al primo del roster), con colori e logo G League e "(G League)" nel menu giocatore.

(91) Swipe indietro solo dove si può tornare indietro: parte solo se nella pagina c'è un tasto ‹ visibile o un foglio aperto (navTarget(1)/navBack(1)); niente swipe sulle sezioni principali senza tasto (prima tornava alla sezione precedente e la pagina si muoveva male). Escluso anche "‹ Annulla" dei giochi. Il tasto/gesto indietro di Android continua a usare anche la pila NAVH.

(79) Calendario lega G1-G64: `const CALENDARIO` (dopo CHIUSE) = giornate 1-7 di Dunkest ripetute in ciclo fino alla 64 (casa/trasferta invariate); Rhynos = Spiders (SPI). In Risultati, sotto i risultati: "Prossime giornate" (3) + tendina "Calendario completo"; riga dei Dolphins evidenziata. Le giornate in GIORNATE (con punteggi) hanno la precedenza: il calendario mostra solo quelle con n > ultima giornata in GIORNATE. Aggiunta la G3 live con i parziali delle 21:37 del 26/10 (screenshot dell'utente): da aggiornare a fine giornata.

(80) Risultati: una giornata alla volta con frecce ‹ › stile DREAMERS (`.drnav.rgnav`, `data-rgnav`, stato `rgN`), da G1 a G64; apre sulla giornata in corso. Giornate in GIORNATE = punteggi; le altre = sfide di CALENDARIO. Tolte la lista "Prossime giornate" e la tendina.

(81) Dynasty TV live: cdn.nba.com risponde solo a www.nba.com (CORS), quindi dal telefono non funziona. Fonte live = ESPN (site.api.espn.com scoreboard + summary, `tvEspn`, `esSide`, sigle ESPN→NBA in ESPN_AB), deciso con l utente il 27/10: ESPN SOLO per il live, PDK provvisorio con formula Dunkest; i dati ufficiali restano Dunkest (report del mattino). NBA resta come tentativo di riserva.

(92) DREAMERS LIVE: Dreamers legge i PDK dai tabellini di DYNASTY TV (TV.box) per le notti che il report Dunkest non ha ancora (dal giorno dopo l'ultima notte ufficiale fino a oggi, data USA). Con Dreamers aperto, ogni 60 s fa aggiornare a Dynasty TV quelle notti (tvEspn(data): ESPN, formula Dunkest) → stessi numeri del box score e un solo scaricamento; anche Dynasty TV si ritrova i risultati. drNotti() usa i dati live (DRL) SOLO per le notti senza dati ufficiali (DRD.notti o EFF.agg) e le segna in DR_PROV → banner rosso "Live · notte gg/mm: PDK provvisori". Appena il report porta quella notte, i dati Dunkest la sostituiscono da soli. Niente di live viene salvato nell'archivio (dreamers-data.js resta solo dai report). tvEspn accetta una data (YYYY-MM-DD) opzionale.

(93) PDK LIVE PER TUTTI I FANTA (sostituisce il meccanismo DRL della 92). Provider comune dopo drNotti(): fantaLiveNotte(data) legge i tabellini di DYNASTY TV (TV.box: ufficiali del report se ci sono, altrimenti live ESPN con formula Dunkest) e dà {tvNm(nome): {p,min,opp,nm}}; fantaLiveNotti(da) = notti da "da" a oggi (data USA); fantaLiveScarica/fantaLiveAvvia: ogni 60 s, con un fanta aperto, fa aggiornare a Dynasty TV (tvEspn(data)) le notti mancanti. REGOLA DEI FANTA: dati ufficiali Dunkest prima; live solo per le notti DOPO l'ultima notte ufficiale del fanta, segnate come provvisorie (banner rosso "Live"); il report le sostituisce da solo; il live non va mai negli archivi.
- Dreamers: drNotti() (ufficiali = DREAM_DATA + EFF.agg).
- G-Dreamers: gdData() (ufficiali = GL_STATS; GD_LASTOFF = ultima notte ufficiale; D.prov = notti provvisorie).
- NUOVO FANTA NBA: chiamare fantaLiveAvvia() nella vista, aggiungere {attivo,da} a FANTA_LIVE, e per le notti fantaLiveNotti(giorno dopo l'ultima ufficiale) leggere fantaLiveNotte(d)[tvNm(nome)].

(94) Dynasty TV, in fondo al giorno: sezione "Dreamers" (tvDreamers) con le 4 sfide del turno che contiene quella data, con la grafica delle partite NBA (.tvg + .drtvg viola): punteggi di Dreamers (ufficiali + live provvisorio), stato Finale/Live/In corso/Da giocare, capitani con PDK. Tocca una sfida → apre Dreamers su quel turno e quella sfida. Con Dynasty TV aperta anche FANTA_LIVE scarica le notti mancanti per i fanta.

(95) Dreamers in Dynasty TV: loghi senza sfondo (come quelli NBA). Toccando una sfida si apre il suo "box score" dentro Dynasty TV (TVS.dr = "turno|squadraA|squadraB", tvDrGame): punteggio in alto, tab delle due squadre, tabella In campo (capitano C ×1,5 + 5 a punteggio pieno), Panchina · vale ½ (ultimi 4 dei 10), eventuali posti vuoti, Tribuna, In attesa; colonne PDK (riquadro colorato), Molt., Punti; riga Punteggio squadra; tasto "Apri in Dreamers ›". Classe .drmo (NON .drm, già usata dalle card di Dreamers).

(96) Dynasty TV: dentro una partita o una sfida Dreamers non c'è più "‹ Entertainment"; resta solo "‹ Partite del …" a sinistra (vTV).

(97) Dreamers, correzione: i moltiplicatori sono a posti fissi (1° capitano ×1,5, 2°-6° pieno, 7°-10° metà). Prima "metà" toccava agli ultimi 4 di chi aveva già giocato, quindi a settimana in corso con meno di 10 giocatori finivano a metà giocatori che dovevano essere a punteggio pieno.

(98) Dreamers/G-Dreamers: punteggi squadra (.drr em, .drch em) con lo stesso stile dei punteggi di Dynasty TV (.tvsc): var(--display) corsivo 800, 26px.

(99) Box score sfida Dreamers in Dynasty TV: nel riquadro rosso solo lo stato (Live / In corso / Da giocare / Finale) come le partite NBA; sotto, in piccolo, "Dreamers" (+ "PDK provvisori" se live). Punteggio con lo stesso stile delle partite NBA (.tvsb .tmid).

(100) DREAMERS: punteggio squadra = SOMMA dei punti dei titolari (capitano ×1,5, 2°-6° pieni, 7°-10° ×½), non più la media (richiesta Francesco 27/10/2026). In corso = somma di chi ha già giocato; a turno chiuso i posti vuoti valgono 0. Testi delle note aggiornati.

(101) Sfide Dreamers in Dynasty TV: punteggi a 22px (le partite NBA 26px) perché i numeri sono più lunghi (es. 243,7) e a 26px sembravano più grandi.

(102) Campo di ogni squadra, sotto la panchina: "Live stanotte" (campoLive) = box score della notte con SOLO dati di Dynasty TV (TV.box: live ESPN / tabellini), non Dunkest. Notte = oggi USA se almeno una partita è iniziata, altrimenti la notte prima (campoNotte): alla prima partita di una nuova notte si azzera. Righe = giocatori della franchigia (anche G League, "G") scesi in campo, ordinati per PDK, con stato Live (rosso, tempo) o Finale; colonne PDK (riquadro), Min, Pt, Rim, Ass; Totale notte. Con il Campo aperto FANTA_LIVE fa aggiornare Dynasty TV ogni 60 s.

(103) REGOLA: la G League è una squadra DIVERSA dalla franchigia principale (richiesta di Francesco 27/10). Nelle sezioni della squadra principale NON vanno i giocatori G League: tolti dal Cap (candidati capitano; erano stati aggiunti nel commit 4560bbe), dal box "Live stanotte" del Campo e dal menu giocatori del grafico della squadra (lì compare solo il giocatore G League aperto dal Trend). La G League resta nelle sue sezioni (G League, G-Dreamers, Trend con logo G League, Free Agent con diritti). La difesa per ruolo del Cap continua a usare i dati di tutta la lega.

(104) Fix "Live stanotte" del Campo: dopo mezzanotte (ora di New York, cioè dalle 6 italiane… e già dalle 5 con l'ora solare) la notte in corso è "ieri" in data USA, ma il Campo scaricava solo "oggi" → box vuoto. Ora FANTA_LIVE per il Campo scarica ieri + oggi. fantaLiveAvvia scarica subito a ogni apertura (se l'ultimo giro è di più di 15 s fa) e poi ogni 45 s.

(105) Campo: il tasto "Roster completo ›" (con il tasto nascosto dei Ducks) sta sopra il box "Live stanotte", subito dopo la panchina.

(106) DREAMERS · DUELLO (sfida aperta, scelta da Francesco tra 3 proposte): drDuel(). Testata con punteggi, proiezione (chi deve ancora giocare vale il suo pdkMix) e barra % vittoria; poi i giocatori uno contro uno per posto (capitano, 2°-6° pieni, 7°-10° metà, Tribuna, In attesa), carte di altezza uguale per riga: maglia (jersey), nome, ruolo · squadra NBA, PDK colorato, moltiplicatore (= punti), caselle delle partite della settimana (drSettimana: dal calendario di Dynasty TV; colorata = giocata con PDK, contorno = da giocare con avversario, rosso = in corso, NG = non ha giocato), "x/y partite giocate". Classi du*/duw* (attenzione: .pl, .up esistono già nel CSS globale).

(107) Campo: più spazio tra "Roster completo" e "Live stanotte" (.clwrap margin-top 34px).

(108) Campo · MODALITÀ NOTTE: tastino con la luna accanto a "Quintetto" (#cntbtn, CNT). Acceso: campo e panchina diventano scuri con i colori della squadra (.cdark) e usano SOLO i PDK della notte di Dynasty TV (campoNotteMap, stessa notte del box "Live stanotte": si azzera alla prima partita della notte successiva). Meritocrazia senza capitano: i 5 con il PDK più alto in campo, gli altri in panchina in ordine di punteggio (chi non ha giocato in fondo, "non ha giocato"); sotto ogni panchinaro avversario e stato (● = in corso). Spento: tutto come prima (Dunkest).

(109) Modalità notte: il titolo diventa "Modalità notte" (al posto di "Quintetto"); maglie "black edition" (jersey: nero + bianco + accento notte NOTTE_ACC: Ducks grigio, le altre il colore della squadra); campo in scala di grigi scuro con bordo e alone del colore notte; se nessuno ha giocato "Nessuno in campo stanotte".

(110) Modalità notte: nascosti i bottoni Cap e Multe (.ctools); tornano spegnendo la modalità.

(111) Modalità notte: pallino rosso lampeggiante (.cnlv) accanto al PDK (non sulla maglia) di chi ha la partita ancora in corso, in campo e in panchina.

(112) Modalità notte, campo: il bordo (fascia con il nome della squadra e cornice) resta del colore della squadra; solo i Ducks diventano argento (gradiente metallico "mtl", cornice grigia) al posto del giallo. Il parquet interno diventa grigio scuro per tutte (gradiente "wood" scuro, niente più filtro grigio su tutto il campo).

(113) Modalità notte Ducks: maglie argento con dettagli e numeri neri (come la loro maglia alternativa), bordo del campo argento.

(114) Pallino LIVE sul tasto Entertainment del menu (#t-gi.navlive): controllo leggero del tabellone ESPN ogni 2 minuti (solo con app visibile) + stato di Dynasty TV; acceso se c'è almeno una partita NBA in corso.

(115) Menu: Entertainment spostato tra Statistiche e Calcolatore Trade.

(116) Modalità notte Ducks: anche il banner della squadra in alto (.teamhead) diventa argento con scritte nere (solo Ducks, solo nella pagina Campo).

(117) Campo (anche modalità normale): massimo 2 giocatori per fila; chi è in più va nella fila vicina meno piena (C↔F↔G), spostando il giocatore con il punteggio più basso della fila. Caselle dei nomi tutte della stessa larghezza, nomi lunghi con i puntini.

(118) Campo più largo: niente più limite di 380px (ora fino a 560px, cioè tutta la larghezza del telefono come gli altri riquadri); maglie, nomi e PDK in proporzione alla larghezza del campo (container query, unità cqw). Vale per modalità normale e notte.

(119) Modalità notte Ducks: argento chiaro OPACO (come la loro grafica alternativa) al posto dell'argento metallico: banner #9ca1a8 con sfumatura leggera, bordo campo #90959b piatto (niente gradiente mtl), cornice #7d8288, maglie #a2a6ac con dettagli neri.

(120) Modalità notte Ducks (scelta definitiva 27/10): restano gialli (banner, bordo campo); maglie con base nera e lo stesso disegno originale a zig-zag ma in giallo (DECO DUC ora usa c.trim al posto del nero fisso; in modalità normale trim resta nero, quindi invariato). Tolto l'argento.

(121) Entertainment: la Sfida della notte è passata nell'Arcade (a:1; dalla sfida "‹ Arcade"); il tasto Dynasty TV è grande (.tvbig), rosso pieno, icona telecamera e pastiglia "● LIVE" (pallino lampeggiante quando ci sono partite in corso, come il pallino del menu).

(122) Tasto Dynasty TV in Entertainment rifatto nello stile delle card Dreamers (.gmc .tvgmc, rosso smorzato #c2414b, riquadro inclinato con telecamera, pastiglia LIVE).

(123) Hub Entertainment: in alto sezione "Entertainment" con Dynasty TV, sotto sezione "Fanta Dreamers" con DREAMERS e G-DREAMERS, poi Arcade.

(124) Pallino rosso sul tasto Entertainment del menu sempre presente; lampeggia solo quando ci sono partite in corso (.navlive).

(125) Tolto il pallino rosso dal tasto Entertainment del menu (resta solo il controllo .navlive che fa lampeggiare la pastiglia LIVE della card Dynasty TV).

(126) Dreamers duello, carta del capitano: nel riquadro grande i punti del capitano già moltiplicati, sempre in oro (.pdkx.dugold); a destra il PDK di partenza "×1,5" senza grassetto.

(127) Dynasty TV, sfide Dreamers: logo Ducks alzato di 4px per allinearlo al nome (.drtvg .drtvl .lg-DUC).

(128) Home: tolto il titolo "Franchigie"; al suo posto una barra (.hbar) con ricerca "Cerca giocatore", tasto Dynasty TV, tasto Dreamers viola con stellina (#hdrm → GAME=dream) e interruttore on/off della modalità notte (#hnt, role=switch, accende/spegne CNT: entrando in una squadra si vede già in modalità notte).

(129) Modalità notte "Notte viola" (opzione 4 scelta da Francesco): con CNT acceso render() mette body.notte; tile della Home con cielo viola stellato e loghi scuriti con alone viola; stesso filtro sul logo del banner squadra. Alternative mostrate: Ombra, Sangue, Spettro (in /tmp, non nel repo).

(130) Modalità notte: stile cambiato da "Notte viola" a "Spettro" (verde fantasma: sfondo verde-nero, loghi in verde luminoso con alone, testi verde chiaro) su richiesta di Francesco.

(131) Modalità notte: tornati a "Notte viola" ma SOLO sullo sfondo delle caselle; i loghi restano originali (nessun filtro su colori/luminosità), solo un leggero alone viola dietro (drop-shadow).

(132) Modalità notte: stile "Dreamers neon" con cielo stellato leggero (scelta Francesco 27/10): sfondo della Home come Dreamers con qualche stella in alto; carte arrotondate viola-blu con bordo e alone neon e una decina di stelline di grandezze diverse; loghi originali con alone rosa-viola.

(133) Modalità notte: anche header e menu in alto (sfondo viola Dreamers con stelline, bordo viola, tasto selezionato viola) e lo sfondo di tutte le pagine; html.notte e theme-color #2a1260 per la barra di stato.

(134) Modalità notte: stelle nello stile di Dreamers (.drroom::before): 8 sullo sfondo della Home (opacità .6), 2 per carta (.8), 5 nella fascia in alto.

(135) 27/10/2026 — Modalità notte v4: viola più scuro (velo rgba(6,2,18,.54) sul cielo Dreamers), UN UNICO cielo fisso (html.notte::before) che parte dalla barra di stato dell'iPhone e arriva fino in fondo; la fascia della barra di stato (body::before) e l'header usano lo stesso cielo allineato al viewport, quindi niente stacchi né linee (tolto il bordo sotto l'header). Loghi della Home liberi, senza riquadri, con alone viola; tab selezionato viola. theme-color #2a1260 anche in notte (prima tornava #0a1330).

(136) 27/10/2026 — Modalità notte: tolta la linea leggera sopra i loghi della Home. Era l'alone viola (drop-shadow) dei loghi tagliato dal bordo del riquadro (.htile overflow:hidden): in notte ora .htile ha overflow:visible, così l'alone sfuma nel cielo senza stacchi.

(137) 27/10/2026 — Modalità notte: header e menu tornano come la versione precedente (sfumatura viola più chiara, stelline, linea viola di stacco sotto il menu), mentre il resto della pagina resta il cielo unico scuro con i loghi liberi. In notte l'header sale fino sotto l'orario dell'iPhone (padding-top safe-area, :root senza padding, body::before nascosto), così la barra di stato ha lo stesso colore dell'header. Modalità giorno e Dreamers a schermo intero invariati.

(138) 27/10/2026 — Su richiesta dell'utente la Home in modalità notte torna all'estetica della v69 (riquadri dei loghi in stile Dreamers neon, sfondo viola più chiaro, fascia di stato blu scura). Tolto il blocco "MODALITÀ NOTTE v4" (note 135–137) e ripristinato il theme-color di prima: index.html è identico alla v69.

(139) 27/10/2026 — Modalità notte (estetica v69): tolta la fascia blu sotto l'orario dell'iPhone. In notte l'header viola Dreamers sale fino in cima allo schermo (padding-top safe-area, :root senza padding, body::before nascosto) e theme-color #2a1260. Giorno e Dreamers a schermo intero invariati.

(140) 27/10/2026 — Modalità notte più scura: velo rgba(6,2,18,k) davanti agli sfondi viola (body, header, #main, riquadri loghi, ricerca, tasti menu non selezionati). Home = livello 1 (k .30); tutte le altre sezioni = livello 3 (k .68). Tab selezionato e Dreamers a schermo intero invariati. È un blocco CSS a parte ("(140) MODALITÀ NOTTE più scura"): l'utente lo prova e, se non va bene, per la Home si torna a quella di prima togliendo le regole [data-v=home].
    Aggiornato: la parte alta (header + menu, fino alla linea viola) resta al livello 1 in tutte le schermate; il livello 3 vale solo sotto la linea viola, fuori dalla Home.

(141) 27/10/2026 — Dreamers/G-Dreamers, scheda Turno: colore dei punteggi delle sfide. Turno in corso: chi è avanti verde, chi è dietro rosso (parità o punteggio assente: colore normale). A fine turno (W.closed): vincitore giallo/oro, sconfitto bianco. Classi .slead/.strail/.sgold/.slost sulle righe .drr (solo lista .drms; le card Dreamers dentro Dynasty TV non cambiano).
    Aggiornato: niente verde/rosso/oro. Solo chi è avanti (turno in corso) o ha vinto (fine turno) ha il punteggio viola acceso con alone; l'altro resta normale.

(142) 27/10/2026 — Tasto Condividi (icona tonda nel titolo) su "Live stanotte" del Campo e su "Dreamers" dentro Dynasty TV. Crea un'immagine PNG 1080px in stile Dreamers (cielo viola stellato, logo Dynasty League, loghi squadre, pillole PDK colorate) con tutte le info: Live = giocatori, partita/stato, PDK, MIN/PT/RIM/ASS e totale notte; Dreamers = sfide del turno con titolari, punteggi (viola acceso per chi è avanti), stato LIVE/FINALE e capitani. Si apre un foglio di anteprima con Chiudi / Salva / Condividi (share sheet di iPhone con il file; serve il foglio perché iOS vuole il tocco subito prima di navigator.share). Dati presi da SHR_CAMPO / SHR_DR, riempiti da campoLive() e tvDreamers().

(144) 27/10/2026 — Modalità notte: la Home sotto la linea viola torna alla colorazione chiara di prima (tolti i veli su body/#main/riquadri/ricerca della Home). Header e menu restano al livello 1 ovunque; le altre sezioni restano al livello 3 sotto la linea viola.

(145) 27/10/2026 — Condividi anche la SFIDA Dreamers (vista duello): tasto tondo accanto a "‹ Turno N". Immagine 1080px con punteggi delle due squadre (chi è avanti in viola acceso), proiezioni, barra % vittoria, e i 10 titolari di entrambe affiancati per posto (Capitano ×1,5, Punteggio pieno 2–6, Panchina ½ 7–10): nome, ruolo · squadra NBA · partite giocate, PDK medio colorato e punti (×1,5 / ×½). Dati da SHR_DUEL (riempito da drDuel), disegno in shDuel().

(146) 27/10/2026 — Sfida Dreamers (vista duello): nel riquadro in alto il punteggio di chi è avanti (o ha vinto) è viola acceso con alone, come nella lista del Turno.

(147) 27/10/2026 — Modalità notte: in Statistiche il bottone "Statistiche notte" diventa "Statistiche live", rosso che pulsa. La sezione (vStatLive) mostra la notte in corso (data USA, campoNotte) dai tabellini live di Dynasty TV: tutti i giocatori delle 8 franchigie principali (niente G League) con PDK live o Eff. (PDK/min), minuti, pt/rb/as e pallino rosso se la partita è in corso. Si aggiorna da sola (voce FANTA_LIVE per cur==="statnotte"&&CNT). Dati live mai salvati negli archivi. Spenta la modalità notte torna la sezione ufficiale delle notti passate.

(148) 27/10/2026 — Condividi il tabellone playoff Dreamers: tasto tondo nel titolo "Tabellone" della scheda Playoff. Immagine ORIZZONTALE 1920×1270 stile Dreamers con il tabellone a "conference": EAST a sinistra (Quarto 1 = 1ª–8ª, Quarto 2 = 4ª–5ª → Semifinale East), WEST a destra (Quarto 3 = 2ª–7ª, Quarto 4 = 3ª–6ª → Semifinale West), al centro coppa, Finalissima (bordo oro), Campioni e Finale 3° posto; sotto i Piazzamenti 5°–8°. Teste di serie, loghi, vittorie nella serie (vincente in viola acceso, perdente sbiadito), segnaposto "Vincente Q1" ecc. se non ancora decisi. shBase ora accetta la larghezza.
    Aggiornato: niente logo né scritta Dynasty League nell'immagine (shBase noBrand); i Piazzamenti 5°–8° sono riquadri piccoli (scala 0,62) centrati in basso.
    Aggiornato: anche la Finale 3° posto è nei riquadri piccoli ("Piazzamenti 3°–8°", 5 riquadri); immagine 1920×1040.

(149) 27/10/2026 — Dreamers: regular season di 14 turni (DR_REG=14, andata e ritorno: ognuno affronta tutti esattamente 2 volte, verificato sul calendario) e playoff al meglio delle 3 (chi vince 2 gare passa, max 9 settimane). DR_TOT=23: regular season 26/10/2026–31/01/2027, playoff dal 01/02/2027, al massimo fino al 04/04/2027. Simulate 200 stagioni: finiscono tutte tra la settimana 21 e la 23.

(150) 27/10/2026 — Immagine condivisa della sfida Dreamers allineata all'app: capitano con pillola ORO e punti calcolati (×1,5) e sotto "PDK ×1,5"; panchina con bordo rosa e "×½ = punti"; punteggio di chi è avanti viola acceso (#d8b4fe), l'altro bianco.

(151) 27/10/2026 — Immagini condivise (cielo stile Dreamers): niente più logo e scritta Dynasty League. Al loro posto il logo Dreamers (quadrato viola con stella bianca, come il tasto della Home, disegnato da shDrLogo) con la scritta DREAMERS / FANTA PDK (Live stanotte). Dove c'è già il grande titolo DREAMERS (sfide in Dynasty TV, sfida singola, tabellone playoff) il logo sta accanto al titolo e la fascia in alto è tolta (immagine più compatta).

(152) 27/10/2026 — Immagine condivisa "Live stanotte": logo squadra grande al centro (220px, alone viola), sotto "LIVE STANOTTE" e il nome completo della squadra in viola fluo (#d8b4fe con alone fucsia); tolte data e "in campo ora". Logo e scritta DREAMERS in alto più piccoli (76px / 48px).

(82) DREAMERS: punteggio del giocatore nel turno = MIGLIOR PDK tra le sue partite della settimana (acc[p].b, drEff), non più la media (richiesta utente 27/10). Tasto "Regolamento" sotto il logo (data-dr="rules", DR.rules, drRules()) con tutte le regole per punti. Se cambiano le regole, aggiorna anche drRules().

(153) 27/10/2026 (Claude, account del secondo utente) — DREAMERS: RUOLI, regola invalicabile. I 10 titolari sono SEMPRE 4 guardie, 4 ali e 2 centri; tra capitano + punteggio pieno (primi 6) almeno 1 centro, 1 ala e 1 guardia. Vale prima della meritocrazia: dentro ogni ruolo entrano i migliori PDK (quote in `DR_QUOTE`); se tra i primi 6 manca un ruolo sale il migliore di quel ruolo e scende in panchina il peggiore dei primi 6 (di un ruolo che ne ha almeno 2). Entrano anche giocatori a 0 o che non hanno giocato (occupano il posto, a turno chiuso valgono 0). Ruolo da `ruoloDi()` (colonna 3 di ROSTER). Codice in `drTeam`; regola aggiunta in `drRules()` (sezione "Ruoli: regola invalicabile"). Nella lista del turno "X/10 · Y a zero" ora conta i titolari che non hanno giocato.
    Ruoli in tutta l'app: trattino colorato accanto al nome (helper `RTR(nome)`, classe `.rtr G/F/C`, stessi colori `--rG/--rF/--rC` dei badge ruolo): sfida Dreamers, tabellino Dreamers in Dynasty TV, panchina del Campo, Statistiche (notte e live), Efficienza, Trade, Free agent, Capitano, ricerca. Nell'immagine condivisa della sfida c'è una barretta colorata a sinistra di ogni giocatore.

(154) 27/10/2026 (Claude, account del secondo utente) — Pagina squadra (vCampo), fuori dalla modalità notte: mostra la FORMAZIONE DREAMERS del turno in corso (drTeam, stessi dati live di Dynasty TV poi report Dunkest). In campo i primi 5 (capitano con pallino "C"), sotto "6° uomo · 100% PDK" (6° titolare) e "Panchina · 50% PDK" (7°–10°) in stile Dunkest con le maglie (funzione drPanca, classi .dpan/.dpc), poi Tribuna sbiadita. Senza PDK nel turno: "In attesa" e ordine per PDK medio (drTeam ordina chi non ha punteggio per pdkMed), sempre con i ruoli. Il live del Campo (FANTA_LIVE[0]) scarica anche tutta la settimana Dreamers. Tasti Cap/Multe spostati sotto la tribuna. Modalità notte invariata.
    Aggiornato: maglie tutte uguali (58×70) in campo, 6° uomo e panchina; stesso blocco giocatore ovunque (drGioc: maglia + targhetta nera "ruolo cognome" + cartellino PDK .pcd largo 86px colorato con pdkLvl, capitano con bordo oro e pallino C sulla maglia, panchina mostra i punti ×½ e sotto il PDK pieno). Toccando il cartellino (data-drwk) si apre un foglio (drWkOpen) con le partite del giocatore nel turno: giorno, avversario, PDK o Da giocare/Live/Non ha giocato, evidenziato il miglior PDK che conta. Righe del campo un po' più distanti in formazione Dreamers (ROWY). Poi: cartellino staccato dalla maglia come un bottone (70px, tondo, margine 5px), circa 20% più piccolo.

(155) 27/10/2026 (Claude, account del secondo utente) — Pagina squadra: ridotto lo spazio sopra le maglie nei riquadri "6° uomo" e "Panchina" (tolte le scritte "6° uomo" e "Panchina", restano solo "100% PDK" e "50% PDK"; padding 6px), così le maglie stanno più vicine al campo. IN CODA sul branch `coda`, non ancora pubblicato.

(156) 27/10/2026 (Claude, account del secondo utente) — DREAMERS: tasto "Regolamento" spostato in basso, sotto le sfide/contenuto della scheda (classe .drrulb, dentro .drroom dopo il body); in alto resta solo "‹ Torna al gioco" quando il regolamento è aperto. Nota sotto le sfide aggiornata con la regola dei ruoli. Immagine condivisa del tabellone playoff (shPlayoff): lato WEST speculare all'EAST (parametro `mir` di box: testa di serie e logo a destra del nome, vittorie a sinistra, etichette e segnaposto allineati a destra). IN CODA sul branch `coda`.

(157) 27/10/2026 (Claude, account del secondo utente) — Pagina squadra, fuori dalla modalità notte: al posto della scritta rossa "Quintetto" c'è un PICCOLO tabellone elettronico nella stessa riga del titolo (drTabellone, classe .lbm): punteggio Dreamers della squadra nel turno (DT.score = 10 titolari con capitano ×1,5, pieni ×1, panchina ×½), cifre a 7 segmenti arancioni (SEG/SEGP/segD), pallino di stato (grigio attesa, arancio in corso, rosso lampeggiante live, verde finale). Restano invariati sottotitolo "Dreamers · Turno N", tasto modalità notte (#cntbtn), cassa e tutto il resto. In modalità notte resta il titolo di prima. IN CODA sul branch `coda`.
    Aggiornato: tolta la parola "Dreamers" (resta "Turno N"); tabellone più lungo con logo della mia squadra, punteggio mio – punteggio avversario e logo dell'avversaria del turno (drPairs), entrambi live da drTeam; chi è dietro ha le cifre più spente. Tocco sul tabellone = apre la sfida in Dreamers. Riga del titolo con 4px in più sopra, nient'altro spostato.
    Aggiornato: tolta anche la scritta "Turno N"; riga titolo a 3 colonne (h2.lbmh grid 1fr auto 1fr): tabellone esattamente al centro, tasto notte tutto a destra, niente linea rossa. Sotto i punteggi, dentro il tabellone: "X/10 hanno giocato" a sinistra per la mia squadra e a destra per l'avversaria (titolari con punteggio, drTeam.played).

(158) 27/10/2026 (Claude, account del secondo utente) — Tabellone della pagina squadra rifatto in stile NEUTRO "vetro" (scelto dall'utente tra 6 prove): una sola riga sottile (34px) e lunga, pillola semitrasparente: pallino stato, logo, "X/10 giocato", punteggio | punteggio, "X/10 giocato", logo avversaria. Chi è avanti in bianco, chi è dietro in grigio. Niente cifre LED (SEG/segD restano definiti ma non usati qui). Sempre esattamente al centro, tasto notte a destra. IN CODA sul branch `coda`.
    Aggiornato: tolto il pallino di stato; angoli arrotondati come il tasto notte (9px); punteggi nel colore della squadra padrona della pagina (TEAMS[t].bg, oppure il secondo colore / versione schiarita se troppo scuro sul fondo: es. Eagles in oro, Dolphins in blu chiaro), chi è dietro allo stesso colore ma spento (opacità 50%).

(159) 27/10/2026 (Claude, account del secondo utente) — Pagina squadra: maglie IN CAMPO +10% (64×77, regola .court .cpl.dr .pj); cartellini PDK, targhette e maglie di 6° uomo/panchina invariati. IN CODA sul branch `coda`.
    Poi (stesso giorno): PROPORZIONI STILE DUNKEST su campo, 6° uomo e panchina: maglie 64×77 ovunque, targhetta e cartellino larghi uguali (112px) e attaccati come un unico blocco (targhetta sopra, cartellino colorato sotto), maglia che entra un po' dietro la targhetta; posizioni in campo C 33/67, A 21/79, G 33/67 e righe 26,2 / 54,6 / 83,2% (solo formazione Dreamers). Blocco CSS "PROPORZIONI STILE DUNKEST". IN CODA.
    Poi: tolte le scritte piccole sotto i numeri dei cartellini (né "PDK", né il calcolo ×1,5 / ×½, né "partite ›"): resta solo il numero (o "In attesa"). IN CODA.

(160) 27/10/2026 (Claude, account del secondo utente) — RICERCA dalla Home (homeSearch) collegata a tutte le sezioni, risultati divisi in "Squadre", "G League", "Free agent". Squadre → scheda giocatore; G League (GLEAGUE + nome completo da GL_STATS, cerca anche per cognome abbreviato) → apre la sezione G League con il giocatore aperto ed evidenziato (glVai, attributo data-glk sulle righe details.glp); Free agent (FA, esclusi quelli già nelle squadre G League) → scheda free agent (prima il clic finiva anche nel gestore della scheda giocatore, ora no). IN CODA.

(161) 27/10/2026 (Claude, account del secondo utente) — MODALITÀ NOTTE della pagina squadra con lo stesso stile della formazione Dreamers: in campo stesso blocco giocatore (drGiocN: maglia 64×77 + targhetta + cartellino colorato con il PDK della notte, pallino rosso lampeggiante nel cartellino se è in campo ora), stesse posizioni (ROWY/XS unici). Panchina notte = griglia a 3 colonne degli stessi blocchi (.dpan.notte), "Non gioca" per chi non ha partita, "—" per chi ha la partita ma non ha ancora punteggio. Funzionamento invariato (5 migliori della notte in campo, gli altri in panchina per punteggio). IN CODA.
    Corretto: in modalità notte la PANCHINA resta la lista classica di prima (non la griglia); in campo maglie, targhette e cartellini identici alla modalità normale (verificato: maglia 64×77, targhetta 112×23, cartellino 112×42 in entrambe).
    Scelta finale: targhetta + cartellino ridotti del 20% (90px, cartellino solo numero alto 27px), maglie 64×77 invariate; uguale in modalità normale e notte (5 titolari). IN CODA.

(162) 27/10/2026 (Claude, account del secondo utente) — DIVISE: nella pagina squadra, tastino con una maglietta a SINISTRA (speculare al tasto notte, stessa misura, #kitbtn/.kitbtn, presente anche in modalità notte accanto al tasto luna). Ogni tocco cambia la maglia: Casa (quella di sempre) → Notte (base scura, la stessa della modalità notte) → Alternativa (base bianca con dettagli nel colore della squadra; se la casa è già chiara, come Dolphins e Spiders, base nel colore della squadra). Funzioni KIT/kitDi/kitC/kitIco, jersey() usa kitC. La scelta vale per tutta la pagina squadra (campo, panchina, tribuna), è per squadra e resta salvata sul telefono di chi la fa (localStorage "dl_kit"); senza scelta: casa di giorno, notte in modalità notte. IN CODA.

(163) 27/10/2026 (Claude, account del secondo utente) — PERIODO A CALENDARIO in tutte le sezioni con grafici: Grafico (GR.da/GR.a), Trend (TRN.da/TRN.a), Scouting → Grafici liberi (NB.g.from/to) e Report "Date a scelta" (NB.from/to). Un bottone "Periodo" apre un solo calendario: frecce per anno e mese, 1° tocco = inizio, 2° tocco = fine (se è prima si scambiano), poi il grafico si aggiorna da solo; scorciatoie Stagione 1/2/3 e Tutto. Limiti: dal 22/10/2024 a oggi. Le stagioni toccate dal periodo (perSzr) decidono i dati; il livello dei punti viene dalle partite nel periodo (perBy: più stagioni → stagioni, oltre 45 giorni → mesi, altrimenti settimane; poche partite → singole partite come prima). Funzioni per*: perBtn, perApri, perDisegna, PER_CB. I vecchi menu Dalla/Alla stagione e Dal/Al mese sono stati tolti (GR.sz/TRN.sz restano solo come stagione di partenza). IN CODA.
    Aggiunto: scelta "Media per" Stagioni / Mesi / Giorni (perGranBtns, GR.gran / TRN.gran) sotto il Periodo nel Grafico e nel Trend. Un bottone si disattiva (barrato) se il periodo non lo permette: Stagioni solo se le partite toccano più stagioni, Mesi solo se toccano più mesi, Giorni con almeno 2 partite (perOk). Senza scelta resta il livello automatico. Etichette dell asse x del grafico diradate in base alla larghezza (prima con 9-16 punti si sovrapponevano).
    Poi: nel Grafico il bottone Periodo ha la stessa larghezza e lo stesso stile del menu Giocatore sopra (non va più sopra la maglia).

(164) 27/10/2026 (Claude, account del secondo utente) — GRAFICO CONDIVISO: tasto Condividi tondo in alto a sinistra nel riquadro del Grafico (shBtn("gr")). Crea un immagine ORIZZONTALE larga quanto serve (shGrafico: circa 74px per punto, minimo 1600px, massimo 20000px, alta 1040px) con logo, giocatore, periodo, numero partite, media di ogni misura accesa, linea tratteggiata della media, ogni punto con il suo valore e sotto data e avversario (in "Giorni"), separatori e nomi dei mesi. Dati da SHR_GR riempito da vGrafico. shBase ha un 4° parametro noSz per non scrivere "Stagione 26/27". Si apre il solito foglio Chiudi/Salva/Condividi. IN CODA.
    Poi: tasto Condividi su OGNI grafico dell app (shChartBtns, aggiunto dopo ogni render a ogni riquadro con svg.grsvg: Trend, dettaglio Trend, confronto rookie, scouting, Grafici liberi...). shCardImg ridisegna il grafico più largo (CHW_X forza chW) in base al numero di punti, lo copia con gli stili (shSvgInline) su sfondo Dreamers con il titolo della sezione. Il Grafico del giocatore tiene la sua immagine dedicata (shGrafico).

(165) 27/10/2026 (Claude, account del secondo utente) — Scheda giocatore (vGiocatore): subito sotto la testata c'è "PDK ed efficienza" (prima si chiamava "Efficienza"), con PDK medi a partita a sinistra ed efficienza media a destra (invertiti). La "Pagella" con le stelline è stata spostata in fondo, dopo "Partita per partita". IN CODA.

(166) 27/10/2026 (Claude, account del secondo utente) — Sfida Dreamers (drDuel): in cima a ogni card c'è una fascia piena del colore del ruolo con scritto GUARDIA / ALA / CENTRO (classe .du.ru-G/F/C, data-rn), scelta dell'utente tra 5 prove (opzione 4). Tolto il trattino ruolo accanto al nome nelle card (ridondante).

(167) 27/10/2026 (Claude, account del secondo utente) — Divise: Peacocks "Notte" verde pavone (#0f6b3f, nome/numero bianchi con bordo blu) invece che nera, anche in modalità notte; Ducks "Alternativa" solo bianco e giallo (nome e numero gialli con contorno oro, niente bordi neri). Codice in kitC. IN CODA.
    Poi: Ducks Alternativa con un bordino nero sottilissimo su nome e numero (parametro jsw della divisa = spessore del contorno, qui 1,1 invece di 3,2).

(168) 27/10/2026 (Claude, account del secondo utente) — DIVISE: 4ª maglia "Originale NBA" nel tastino della pagina squadra (giro Casa → Notte → Alternativa → Originale NBA, KIT_N ha 4 voci, `KIT[t]=(kitDi(t)+1)%4`). Con questa maglia OGNI giocatore veste la maglia della SUA squadra NBA (colonna 4 di ROSTER, es. Flagg → DAL, Şengün → HOU): jersey() cerca il giocatore in ROSTER[t] per nome e prende i colori da NBA_KIT[sigla]; se non lo trova usa la maglia Casa. NBA_KIT ha le 30 squadre (bg maglia, fg numero, jstroke contorno numero, nf/ns colore e contorno del nome se diversi, trim collo/giromanica, p2 dettagli, d = motivo) ricalcate sugli screenshot Dunkest dell'utente; nbaDeco(c) disegna i motivi (was = fasce Wizards, tor = diagonale nera Raptors, uta = montagne Jazz, sun = righe Suns, por = strisce Blazers, pin = gessato Magic, mil = doppie righe Bucks, plain = filetto laterale, default = fasce laterali). Al posto delle decorazioni DECO della squadra. Solo colori e motivi, niente loghi: sulla maglia restano cognome e numero. Tastino: maglietta a tre colori quando è attiva. BKN e SAC non erano negli screenshot: colori classici, da ritoccare se arriva uno screenshot. PUBBLICATO.

(169) 27/10/2026 (Claude, account del secondo utente) — Maglia Originale NBA dei Bulls (NBA_KIT.CHI): rosso ricalcato su uno screenshot Dunkest dell utente, bg #d4101d (prima #ce1141, tendeva al lampone). Approvata, IN CODA: si pubblica insieme alle altre maglie da ritoccare.

(170) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA ricalcate su screenshot Dunkest dell utente, tutte APPROVATE e IN CODA: Celtics (BOS bg #0a6c33), Rockets (HOU bg #d02a1c, collo/giromanica gialli #edc630, motivo "pind" = gessato scuro appena visibile), Bucks (MIL bg #21472c, crema #e0dccb, motivo "mil" = filetto crema sui fianchi + due fasce crema ai lati ALL ALTEZZA DELLA PANCIA), Mavericks (DAL bg #0a6bd0, numero argento #c9cccb bordato di bianco, motivo "dal" = blu notte #052e5c SOLO sulle spalline, spessore medio-sottile). Si pubblicano insieme a Bulls (169) e alle prossime squadre, solo su ordine dell utente.

(171) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA IN CODA: Raptors APPROVATA (TOR bg #52297a viola, motivo "torc" = righe verticali con piccoli dentini alternate nere #141414 e argento #a9a6a8, collo/giromanica neri con filetto rosso: nuovo campo tline #c8323a disegnato sopra trim in jersey(); nome argento #b0aeb2, numero bianco bordato di nero; NIENTE dinosauro: è il logo, non va messo). Nuggets APPROVATA (DEN bg #1c3f98, collo giallo #f2c230, motivo "den" = fascia arcobaleno a 6 strisce sotto il numero; niente montagne né scritta). Niente loghi o scritte delle squadre NBA su nessuna maglia.

(172) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA APPROVATE e IN CODA: Timberwolves (MIN bg #14191d nera, collo/giromanica con bordo verde ad alberelli = tline #2f9a5c tratteggiato: nuovi campi tlw spessore e tld dasharray della tline; nome/numero bianchi bordo azzurro #8fb0d8 + outer #1d2f56; motivo "none" = nessun disegno) e Hawks (ATL bg #f5bd22 gialla, collo/giromanica neri con filetto rosso #cd1d24, nome/numero neri bordati di rosso, jsw 2.2; niente aquila/ali: è il logo).

(173) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA APPROVATE e IN CODA: Spurs (SAS bg #4bb7a6 verde acqua, collo nero, giromanica diverse per lato = nuovo campo arm:[sinistra,destra] arancio #f39a3a / rosa #ee6f8f; motivo "sas" = fianchi neri con zig-zag bianco, triangolini arancioni e filetto bianco) e Rockets CLASSICA che SOSTITUISCE la rossa della (170): HOU bg #1f2540 blu notte, motivo "houc" = gessato bianco + righe azzurre tratteggiate in alto, collo/giromanica rossi #c0282c con filetto bianco, nome/numero bianchi bordati di rosso (jsw 2.4). Niente loghi, scritte o sponsor.

(174) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA IN CODA: Pistons APPROVATA (DET bg #1279a3 verde petrolio, collo/giromanica neri con filetto giallo #e6a422 tline + filetto rosso #b52a1c: nuovo campo tline2 disegnato appena all interno; motivo "det" = fianchi neri con riga gialla e rossa; nome/numero bianchi bordati di nero; niente cavallo/scritta). Bulls: SENZA gessato (sostituisce la rossa della 169), CHI bg #d00a20, motivo "none", nome/numero neri bordati di bianco, collo nero con filetto bianco — in prova, da confermare. Pacers gessata APPROVATA (IND bg #ffd914, gessato blu notte #1b2440, nome/numero blu bordati di bianco).

(175) 27/10/2026 (Claude, account del secondo utente) — Maglie Originale NBA APPROVATE e IN CODA: Bulls CLASSICA, sostituisce le versioni precedenti (169 e quella senza gessato della 174): CHI bg #d6150f, collo/giromanica bianchi #f4f1ea con righe nero-rosso-nero al centro (nuovo campo tstr = lista [colore, spessore] disegnate sopra trim), nome/numero neri bordati di bianco, motivo "none". Bucks NERA, sostituisce la verde della (170): MIL bg #1c1d1c, collo/giromanica neri con filetto crema #e8d9a8, motivo "milb" = fascia sul petto blu #3a66d6, verde #2e6b3f, bianco, crema, verde, abbassata SOTTO il nome (y 63-85); numero crema #eee1c6 bordato di verde, nome crema bordato di nero (nf/ns). Niente cervo/scritte. Pacers gessata APPROVATA.

(176) 27/10/2026 (Claude, account del secondo utente) — [PUBBLICATO insieme a 169-175] DIVISE A 5 CATEGORIE (tastino maglietta, giro di 5: KIT_N = Casa, Notte, Alternativa, NBA 2026, Anni 90; `KIT[t]=(kitDi(t)+1)%5`). 4 = "NBA 2026": NBA_KIT = maglie attuali delle 30 squadre NBA (quella pubblicata nella 168 + ritocchi approvati oggi: Bulls rosso #d4101d, Celtics, Rockets rossa con gessato leggero, Bucks verde con fasce crema alla pancia, Mavericks blu notte sulle spalline, Nuggets 2026 blu notte con collo bianco/rosso, nome oro, numero bianco bordato di rosso). 5 = "Anni 90": NBA_KIT_90 con 10 squadre (Bulls nera gessata rossa, Rockets blu notte gessata, Bucks nera con fasce, Raptors viola, Nuggets arcobaleno, Timberwolves nera, Hawks gialla, Spurs verde acqua, Pacers gessata, Pistons verde petrolio); le altre squadre vestono NBA_BIANCA (maglia bianca, numero nero) finché non vengono fatte. jersey(): kd 3 → NBA_KIT, kd 4 → NBA_KIT_90 o NBA_BIANCA. Tastino: tricolore per la 4, nero gessato rosso con "90" per la 5. PUBBLICATO il 27/10 sera.

(177) 27/10/2026 (Claude, account del secondo utente) — La maglia scelta col tastino (le 5 categorie: Casa, Notte, Alternativa, NBA 2026, Anni 90) ora vale in TUTTE le sezioni (pagina giocatore, scontri Dreamers, trade, ecc.), non solo nella pagina squadra: `kitDi(t)` legge sempre `KIT[t]`. Senza scelta resta casa (notte solo in modalità notte sul campo). PUBBLICATO con la (178).

(178) 27/10/2026 (Claude, account del secondo utente) — Maglia ANNI 90 dei Cavaliers aggiunta a NBA_KIT_90 (CLE bg #b02a2c vinaccia, collo/giromanica blu notte #1f2a5c con oro #d4b066 al centro via tstr, motivo "cle" = fianchi oro con due righe bianche, nome/numero bianchi bordati d oro). PUBBLICATO insieme alla (177).

(178) 27/10/2026 (Claude, account del secondo utente) — Maglie Anni 90: sul petto ora c'è il NOME DELLA SQUADRA NBA (BULLS, CAVALIERS, ROCKETS... mappa `NBA_NOME`, tutte e 30) al posto del cognome del giocatore; solo categoria Anni 90 (kd===4), le altre categorie invariate. Codice in `jersey()`. IN CODA (rendering inviato).

(179) 27/10/2026 (Claude, account del secondo utente) — Su TUTTE le maglie di ogni categoria il nome sul petto è quello della squadra, mai il cognome: divise NBA 2026 / Anni 90 → squadra NBA (`NBA_NOME`); Casa/Notte/Alternativa → la nostra franchigia (nick: DUCKS, EAGLES...). Se la squadra non ha nick (FA, G League) resta il cognome. Codice in `jersey()`. PUBBLICATO.

(180) 27/10/2026 (Claude, account del secondo utente) — Nome del giocatore sulla targhetta (.pnm) più leggibile: 13px (era 10,4), targhetta sempre larga 90px; i cognomi lunghi si rimpiccioliscono da soli (`pnmFs`: 64/(lettere×0,7), tra 6,4 e 13px) così nessun cognome del roster viene tagliato (verificato su tutti). Vale in formazione Dreamers e modalità notte (stessa classe). PUBBLICATO.

(181) 27/10/2026 (Claude, account del secondo utente) — Maglie Anni 90 ricalcate sulle foto dell'utente, PUBBLICATE: Knicks (NYK blu/arancio, spalline nere), Lakers (viola/oro, collo giallo-bianco), Celtics (verde/bianco), Hornets (CHA acqua con 5 righe verticali, motivo "cha"; versione viola alternativa pronta in `NBA_KIT_90_ALT`, non collegata), Clippers (rosso con fianchi blu), Thunder (azzurro con fianchi blu notte, collo arancio/giallo), Wizards (oro con spalline bianche e fascia nera, motivo "wasg"), Mavericks (verde, collo blu/bianco), Magic (nera gessata bianca, scritte blu). Aggiunti i motivi "cha", "wasg", "default" in `nbaDeco`. Nessun logo/scritta di terzi (il "Wu York" dei Knicks NON riprodotto: maglia classica).

(182) 27/10/2026 (Claude, account del secondo utente) — Nomi sulle targhette TUTTI alla stessa altezza (13px): niente più font ridotto per i cognomi lunghi (tolto `pnmFs`). Se il cognome non entra si stringe solo in larghezza (`scaleX`, funzione `pnmFit()` chiamata dopo ogni `render()` e a font caricati; nome dentro `<b class="pn">`). Vale in formazione Dreamers e modalità notte. PUBBLICATO.

(183) 27/10/2026 (Claude, account del secondo utente) — Maglie Anni 90 PUBBLICATE, ricalcate sulle foto: Warriors (GSW blu, fianchi arancio, riga gialla), Pelicans (NOP "NOLA city": fasce viola/verde/oro), Nets (BKN blu con righe argento/rosse e rombi laterali; la foto era New Jersey → assegnata a Brooklyn), Jazz (UTA viola con montagne bianche sfumate), Grizzlies (MEM acqua, collo nero a puntini), Blazers (POR nera con banda diagonale rossa/bianca), 76ers (PHI nera, bordi rossi), Suns (PHX viola con raggi arancio e sole). Nuovi motivi in `nbaDeco`: nop, bkn, utm, por90, phx. Nessun logo di terzi.

(184) 27/10/2026 (Claude, account del secondo utente) — Maglie Anni 90 di Heat (MIA rossa, collo e fianchi nero/bianchi, scritte nere bordate di bianco; senza il camouflage/scimmia della foto, che è un marchio di terzi) e Kings (SAC nera, collo viola/bianco). Con queste TUTTE le 30 squadre NBA hanno la loro maglia Anni 90. PUBBLICATE.

(185) 27/10/2026 (Claude, account del secondo utente) — Maglia Anni 90 Hawks: scritta HAWKS +7% (nuovo campo opzionale `ws` = fattore scala del nome sulla maglia, vale per ogni kit NBA_KIT_90/NBA_KIT; ATL ws:1.07). PUBBLICATO.

(186) 27/10/2026 (Claude, account del secondo utente) — Il nome "Dynasty League" è diventato "Dreamers" ovunque sia scritto (intestazione, titolo scheda, meta, manifest/icona telefono "Dreamers", immagini condivise e piè di pagina, testo di condivisione "Più o Meno", note sui Valori). Restano "Dynasty TV" e le parole "Dynasty" del regolamento (modalità di gioco). L'URL del sito e il nome del repo non cambiano. PUBBLICATO.

(187) 27/10/2026 (Claude, account del secondo utente) — Il tastino della maglia ora è GLOBALE: una sola scelta (Casa/Notte/Alternativa/NBA 2026/Anni 90) per TUTTE le squadre e TUTTE le sezioni, salvata sul telefono (`dl_kitg`, variabile `KITG`); prima c'era una scelta per squadra (`KIT[t]`/`dl_kit`, ora non più usati). Senza scelta resta automatica (casa; notte in modalità notte). PUBBLICATO.

(188) 27/10/2026 (Claude, account del secondo utente) — REGOLA "turno senza partite per calendario" (IN CODA su `coda`, NON pubblicata): se la squadra NBA del giocatore non ha nessuna partita nel turno per via del calendario, il giocatore vale la sua MEDIA STAGIONALE PDK (`pdkMed`), segnata «media stagione» (duello, tabella squadra, foglio giocatore). Infortunio/non gioca con squadra in campo = resta 0 (distinzione netta). Dati: `DR_ZERO` in index.html (con il calendario del prospetto A: turno 5 ATL, turno 8 MIA) (calcolato dal calendario NBA ufficiale fino al 17/3/2027; unico turno a 0 partite = turno 7, 7–13 dic). Se si cambiano i turni (es. unione 6+7) rigenerare `DR_ZERO`. Aggiunta alle regole `drRules()`.

(189) 27/10/2026 (Claude, account del secondo utente) — CALENDARIO TURNI CORTI = PROSPETTO A (IN CODA su `coda`, NON pubblicato): i turni non sono più settimane ma finestre `DR_TURNI[k-1]=[primo,ultimo]` in index.html (turno 1 = settimana già in corso 26/10–1/11, 7 giorni; poi 22 turni da 2-4 giorni dal 2/11 al 14/1, ognuno con 1-2 partite per squadra NBA, pausa NBA Cup 4-11/12 saltata). Struttura invariata: 14 turni regular season (2 gironi) + playoff fino a 9 turni (tot 23, DR_TOT) → la lega finirebbe a metà gennaio; se si vuole più lunga basta DR_REG=21 (DR_SCHED ha già 3 gironi) e più finestre. Adattati: `drWeekStart/drWeekEnd`, `drWeek` (len variabile), `drCurWeek`, `drSettimana`, caselle giorno con giorno della settimana reale, `tvDreamers`, testi del regolamento, `tools/dreamers.mjs` (weekOf legge DR_TURNI). `DR_ZERO` rigenerato dalle stesse finestre. Calendario NBA noto solo fino al 17/3/2027. Per cambiare date: rigenerare DR_TURNI e DR_ZERO insieme.

(190) 27/10/2026 (Claude, account del secondo utente) — PASSAGGIO DA DUNKEST A DREAMERS (IN CODA su `coda`, NON pubblicato). Decisioni dell'utente: playoff al meglio delle 3; regular season lunga in modo che i playoff finiscano verso fine marzo; classifica (vittorie e punti) delle giornate 1-2 di Dunkest mantenuta; il turno in corso di Dunkest (giornata 3, in corso) va ricreato su Dreamers e giocato qui (NON copiati punteggi né vittoria); calendario scontri uguale a Dunkest.
- Calendario scontri = `DR_DK` (14 giornate lette dalle foto GM League di Dunkest; la 15ª = la 1ª, quindi si ripete). `DR_SCHED[k-1]=DR_DK[(k-1+DR_OFF)%14]`, `DR_OFF=2`: turno Dreamers 1 = giornata 3 Dunkest (CAL-DAK, TX-SAC, SD-ALA, SL-DET). Le etichette "Turno N" mostrano la numerazione Dunkest (k+2); i playoff hanno le loro etichette.
- Classifica di partenza `DR_BASE` (da risultati g1-g2 Dunkest): Foxes 2-0 (542,68), Ducks 2-0 (527,99), Peacocks 1-1 (536,75), Eagles 1-1 (511,98), Dolphins 1-1 (511,49), Spiders 1-1 (502,16), Turtles 0-2 (376,80), Mooses 0-2 (337,59) + forma V/P; contano nella media punti e nei turni giocati.
- Lunghezza: `DR_REG=40` turni Dreamers (= giornate 3-42, 6 gironi) + playoff max 9 turni, `DR_TOT=49`. `DR_TURNI` esteso a 49 finestre (prospetto A fino al 17/3; dal turno 44 PROVVISORIE da 3 giorni, 18/3-4/4, da rigenerare quando esce il calendario NBA di fine stagione). Regular season finisce il 9/3, playoff dal 10/3: tipicamente chiudono a fine marzo, caso peggiore 4/4. `DR_ZERO`: turno 5 ATL, 8 MIA, 29 LAC, 34 LAL, 38 CLE, 39 DEN, 40 TOR (media stagionale PDK).
- Regolamento aggiornato. Alternativa valutata: 5 gironi/35 giornate (playoff finiscono ~14/3).
- Regola: il giocatore con media stagionale (squadra NBA a 0 partite) può diventare capitano ×1,5 se è il migliore (già così nel codice, aggiunto al regolamento).
- (190) ora PUBBLICATO su main.

(191) 27/10/2026 (Claude, account del secondo utente) — PLAYOFF AL MEGLIO DELLE 5 + REGULAR SEASON ACCORCIATA (IN CODA su `coda`, NON pubblicato): serie a 3 vittorie (`drPO`), `DR_REG=33` turni Dreamers (= giornate Dunkest 3-35, 5 gironi in tutto), `DR_TOT=48` (33+15 playoff). Regular season finisce il 12/2/2027, playoff dal 13/2 (pausa All-Star 19-24/2 già nelle finestre); caso peggiore (tutte le serie alla gara 5) chiude l'1/4, tipicamente circa 20-25/3. DR_TURNI ha 49 finestre (l'ultima inutilizzata); turni dal 44 provvisori. Regolamento e note aggiornati.

(192) 27/10/2026 (Claude, account del secondo utente) — Su richiesta: tutto finito PRIMA del 17/3 (fine del calendario NBA noto). `DR_REG=26` (= giornate Dunkest 3-28, 4 gironi), `DR_TOT=41` (26+15 playoff al meglio delle 5). Regular season finisce il 23/1/2027, playoff dal 24/1; caso peggiore chiude l'11/3. (IN CODA su `coda`, NON pubblicato). Sostituisce i numeri di (191).

(193) 27/10/2026 (Claude, account del secondo utente) — Il logo in alto (aggiorna pagina) ora RESTA nella schermata in cui sei: prima del reload salva in sessionStorage lo stato di navigazione (lista `V` nello script del logo: cur, curTeam, GAME, DR, curPlayer, ecc. + scroll) e al riavvio lo ripristina (valido 30 s); i dati si ricaricano freschi. Se si aggiungono nuove variabili di navigazione, aggiungerle a `V`. PUBBLICATO insieme a (190)-(192).

(194) 27/10/2026 (Claude, account del secondo utente) — Barra di navigazione riordinata (IN CODA su `coda`, NON pubblicato): Home · Dreamers · Dynasty TV · Statistiche · Dunkest(▾) · Calcolo Trade · G Dreamers · Sala Trofei · Giochi. Sparisce il tasto "Entertainment" (hub GAME="menu" non più raggiungibile: "Torna all'app"/"‹ Home" riportano alla home). Tasti virtuali: `data-v="dreamers"`→cur giochi+GAME dream, `gdreamers`→gdream, `giochi`→arcade (Arcade), `tv`→cur tv. Pallino LIVE ora sul tasto Dynasty TV (id t-gi). Il tasto attivo scorre in vista nella barra (che scorre in orizzontale).
- (194) ora PUBBLICATO su main.

(195) 27/10/2026 (Claude, account del secondo utente) — Le GUARDIE sono ROSSE ovunque (prima verdi/lime): `--rG:#ef4444` (chip G, strisce, duelli Dreamers, roster, trade), tasti ruolo del Calcolo Trade e del College (`.trrl`, `.colrl`, `COL_RL`, `.vtrh.G`), canvas di condivisione (4203 e 4482). Ali blu e centri gialli invariati. IN CODA su `coda`, NON pubblicato.
- (195) ora PUBBLICATO su main. Per tornare indietro: --rG:#a3e635 (lime) e i verdi #22c55e nei punti elencati sopra.

(196) 27/10/2026 (Claude, account del secondo utente) — IMPOSTAZIONI GRAFICHE (IN CODA su `coda`, NON pubblicato). Al posto del badge "Stagione 26/27" in alto c'è l'ingranaggio (#setbtn) → vista `cur="impostazioni"` (`vImpostazioni`, script "VISTA IMPOSTAZIONI"). Stato `DLS` (default `DLS_DEF`, salvato in localStorage "dl_set", per dispositivo; NON condiviso via GitHub). `dlsApply()` imposta le variabili CSS `--sj` (maglia), `--sn` (larghezza tabellino+PDK), `--st` (testo nome), `--sp` (PDK), `--sov` (sovrapposizione) e le classi `dls-norole/dls-nocap/dls-nosh/dls-sq/noanim` su <html>; le regole CSS sono scopate a `.court .cpl.dr` e `.dpan` (campo + 6° uomo/panchina). Il campo (SVG in `vCampo`) legge DLS: parquet (auto, classico, acero, noce, ebano, blu, cemento, viola, verde, colori squadra), colore/spessore linee, bordo (squadra/scuro/chiaro), venature, lucidatura, area colorata, nome squadra, logo. Anteprima sticky con zoom (.62) del vero `vCampo()` (giorno/notte, squadra a scelta). Look rapidi: Classico, Grande, Compatto, Arena notte, Street. Per aggiungere un'impostazione: campo in `DLS_DEF`, controllo in `SL`/`CH`/`TG`, effetto in `dlsApply` o nel codice del campo. L'immagine di condivisione del campo (canvas) NON usa ancora queste impostazioni.

(197) 27/10/2026 (Claude, account del secondo utente) — Campi a tema nelle impostazioni (IN CODA su `coda`, NON pubblicato): parquet "🎄 Natale" (verde, bordo a bastoncino di zucchero, fiocchi di neve, ghirlanda con lucine, agrifoglio) e "🎃 Halloween" (viola scuro, ragnatele agli angoli, zucche, pipistrelli, alone arancione); look rapidi omonimi che impostano anche linee e bordo (nuovi bordi: rosso/arancione/verde `DLS_AP`; nuova linea arancione). Decorazioni in `dlsDecor()` (disattivabili con "Decorazioni delle feste", `DLS.decor`). Per un'altra festa: aggiungere una voce a `DLS_FL`, un ramo in `dlsDecor`, un look in `LOOK`.

(198) 27/10/2026 (Claude, account del secondo utente) — Stili dell'app nelle impostazioni (IN CODA su `coda`, NON pubblicato): sezione "Stile dell'app" con temi colore `DLT` (Classico, Sole/giallo, Smeraldo/verde, Fuoco/arancione, Oceano/blu, Neon/viola, Carbone e oro) e "Personalizzato" (3 selettori colore base/accento/dettaglio → `dlThemeVars()` deriva il resto con `dlMix`). I colori passano da variabili CSS su :root (`--bg --panel --panel2 --line --muted --glow --hd1 --hd2 --red --red2 --gold --onred --pn1 --pn2`); `dlsApply()` le imposta/rimuove su documentElement e anche la meta theme-color (`TH_BAR`). Interruttori: strisce header (`hs`), bordo sottile (`ht`), nav a pillola (`np`) → classi `dlt-nostripe/dlt-thin/dlt-pill`. Limiti: salvataggio per dispositivo (localStorage "dl_set"); la modalità notte (viola) mantiene il suo aspetto sopra i temi. Per un nuovo tema: voce in `DLT` con tutte le variabili + chip in impostazioni.

(199) 27/10/2026 (Claude, account del secondo utente) — Personalizzazione PER SQUADRA nelle impostazioni (IN CODA su `coda`, NON pubblicato): sotto l'anteprima ci sono i tasti delle squadre; la sezione "Personalizza <squadra>" modifica solo quella: banner (colore 1/2, scritte, bordo, grandezza logo ×0,5–1,8) e campo (parquet, linee, fascia col nome, grandezza logo ×0,6–1,6). Dati in `DLS.tm[T]` = {b1,b2,bt,bb,bl,fc,lc,ac,cl} (localStorage "dl_set"). Helper: `dlTm`, `dlHeadSty`, `dlHeadLogo`, `dlShade`; usati nei 3 `.teamhead` (campo, roster, cassa) e in `vCampo()` (parquet/linee/fascia/logo; le scritte della fascia si spostano col logo). Tasti "Ripristina <squadra>" e "Copia su tutte". L'anteprima ora mostra banner + campo. Le impostazioni generali restano valide per le squadre senza personalizzazione.

(200) 27/10/2026 (Claude, account del secondo utente) — Turno 1 Dreamers parte dal 25/10 (IN CODA su `coda`, NON pubblicato): su Dunkest la partita Lakers–Jazz (25/10 USA, notte tra 25 e 26 in Italia) e le altre del 25/10 contano nel turno corrente, quindi `DR_START` = "2026-10-25" e `DR_TURNI[0]` = ["2026-10-25","2026-11-01"] (8 notti). I PDK del 25/10 non sono nel report Dunkest (che parte dal 26/10): `drNotti()` li prende dai tabellini finali di Dynasty TV (`fantaLiveNotte`) per ogni notte del turno senza report; sono "provvisori" solo se una partita non è finita. `tools/dreamers.mjs` resta con START 26/10 (il file generato non contiene il 25/10, che arriva dai tabellini TV). I punteggi dei turni si ricalcolano da soli. Attenzione: se `tv-data.js` perde i tabellini del 25/10 il punteggio del turno 1 scende.

(201) 27/10/2026 (Claude, account del secondo utente) — Fix anteprima impostazioni (IN CODA su `coda`, NON pubblicato): l'anteprima sticky finiva sotto l'intestazione (stesso z-index, top:0). Ora `.setprev` è sticky sotto l'header (`top = safe-area + --hh`, `--hh` = altezza dell'header misurata da JS con ResizeObserver), z-index 4 < header 5, più piccola (zoom .5) e con tasto "Nascondi/Mostra anteprima" (`DLS.pvHide`). I tasti delle squadre sono in una sezione propria sotto l'anteprima.

(202) 27/10/2026 (Claude, account del secondo utente) — Giocatori "sotto speciale" FUORI dalle sfide Dreamers (IN CODA su `coda`, NON pubblicato): chi esce da una trade speciale ancora attiva (Rollins, Ingram, Burries; `SPECIALI[].esce` con `spInfo(x).left>0`) non entra nei 10 titolari né in tribuna delle partite dirette del Dreamers (campionato ufficiale). Resta invece visibile in roster, statistiche della notte e modalità notte del campo (richiesta dell'utente). Funzione `spFuori(nome)` accanto a `SPECIALI`, usata solo nel pool di `drTeam`. Alla scadenza della speciale rientrano da soli.

**REGOLA PER I FUTURI CLAUDE — "Trade speciale in corso" (27/10/2026, chiarita dall'utente).** Un giocatore con l'avviso "Trade Speciale in corso" (es. Rollins, Ingram, Burries; è il giocatore che *esce* in `SPECIALI`) APPARTIENE ancora alla squadra proprietaria (resta in `ROSTER`, nelle statistiche della notte, nella modalità notte del campo, nella pagina Roster con l'avviso, negli scambi e nel conteggio crediti) ma NON PUÒ ESSERE UTILIZZATO finché la speciale è attiva: non entra nei 10 titolari né in tribuna delle sfide dirette Dreamers (campionato ufficiale). Nel codice: `spFuori(nome)` (vicino a `SPECIALI`), oggi applicata solo nel pool di `drTeam`. Qualsiasi nuova funzione che sceglie la formazione/i punteggi del campionato ufficiale (anche G-Dreamers o futuri fanta) deve escluderli con `spFuori`; le viste puramente informative no. Alla scadenza (`spInfo(x).left` = 0) tornano utilizzabili da soli. Il giocatore che *entra* (es. Lillard, De Larrea, K. George) è invece normalmente utilizzabile.

(203) 27/10/2026 (Claude, account del secondo utente) — Avatar "personaggio" al posto della maglia (IN CODA su `coda`, NON pubblicato): impostazione "Giocatori → Maglia / Personaggio (cartone)" (`DLS.pj` = "jersey" | "avatar", default maglia). `jersey(t,num,name)` ritorna `avatarSvg()` se `DLS.pj==="avatar"` e c'è un nome (stesso viewBox 120×146, quindi funziona ovunque: campo, panchina, tribuna, liste, schede). Non sono ritratti: tratti scelti a mano per i 115 giocatori in rosa nella tabella `AVD` ("pelle 1-6|capelli|colore|barba|fascia"; capelli bald/buzz/short/fade/curly/afro/long/bun/braids/cornrows; colore black/brown/lbrown/blond/gray; barba none/stub/short/full/goatee). Chi non è in `AVD` (G League, nuovi arrivi) ottiene un avatar generico da hash del nome. DA CORREGGERE con l'utente: molti tratti sono stime (soprattutto matricole e giocatori meno noti). Per correggere un giocatore basta cambiare la sua riga in `AVD`. Divisa e numero dell'avatar seguono i colori della maglia scelta della squadra.

(204) 27/10/2026 (Claude, account del secondo utente) — Icone scherzo al posto della maglia (IN CODA su `coda`, NON pubblicato): nel selettore "Giocatori" delle impostazioni, accanto a Maglia e Personaggio, ci sono 🗑️ Bidone, 🚽 Cesso, 💩 Cacca (`DLS.pj` = "bin" | "wc" | "poop"). Stessa icona per tutti i giocatori, cambia solo il numero. Funzione `iconeSvg(kind,n,k)`, richiamata da `jersey()` quando c'è un nome (stesso viewBox 120×146 delle maglie).

(205) 27/10/2026 (Claude, account del secondo utente) — Icona per singoli giocatori (IN CODA su `coda`, NON pubblicato): sezione "Icona di singoli giocatori" nelle impostazioni, sotto la scelta generale (Maglia/Personaggio/Bidone/Cesso/Cacca). Si sceglie la squadra con i tasti sotto l'anteprima (`DLS.pvTeam`) e per ogni giocatore c'è un menu: "Come la scelta generale" oppure una delle 5 icone. Dati in `DLS.pjp` = {nome: "jersey|avatar|bin|wc|poop"}; `jersey()` usa `DLS.pjp[nome]` se presente, altrimenti `DLS.pj`. Tasto "Azzera tutte le eccezioni".

(206) 27/10/2026 (Claude, account del secondo utente) — Modalità notte: tabellone della sfida al posto della scritta (IN CODA su `coda`, NON pubblicato): in `vCampo()` con `CNT` attivo, al posto dell'intestazione "Modalità notte · data" compare lo stesso tabellone live di `drTabellone` (mia squadra vs avversario del turno Dreamers, punteggi e "x/10 giocato"), con tasto luna acceso (`drTabellone(t,T,k,P,on)`). I dati (`DT2/DK2/DP2`) sono calcolati solo per il tabellone; formazione e punteggi in campo restano quelli della notte (`campoNotteMap`). Se il calcolo fallisce si torna alla vecchia intestazione. Il tabellone è quello del turno intero (non solo della notte) e si aggiorna col live di Dynasty TV come la modalità normale.

(207) 27/10/2026 (Claude, account del secondo utente) — Live del Campo: tasto Notte / Turno e condivisione (IN CODA su `coda`, NON pubblicato): sotto il titolo di "Live stanotte" (Campo) c'è un selettore `Notte | Turno` (`CLM` = "notte"|"turno", `data-clm`, il click rigenera solo `.clwrap` con `campoLive`). "Turno" = "Migliori del turno": per ogni giocatore del roster la partita col PDK più alto del turno Dreamers in corso (dal primo giorno del turno a oggi, tabellini di Dynasty TV, quindi include anche le partite prima di stanotte, es. 25/10), con data accanto all'avversario e "Somma migliori" in fondo (è la somma semplice, NON il punteggio Dreamers che ha capitano ×1,5, ruoli e panchina ½). Il tasto condividi (`SHR_CAMPO`, campo `turno`) condivide quello che si sta guardando: titolo "MIGLIORI DEL TURNO"/"LIVE STANOTTE", totale, nome file e titolo dello share cambiano di conseguenza (`shCampo`).

(208) 27/10/2026 (Claude, account del secondo utente) — Impostazioni riorganizzate in 5 schede (IN CODA su `coda`, NON pubblicato): sotto anteprima e tasti squadra c'è la barra schede `App | Campo | Giocatori | Squadra | Altro` (`STAB`, `data-stab`; ogni scheda è fatta di riquadri `.setcard`). App = stile e colori personalizzati, intestazione/tasti. Campo = look rapidi, parquet, linee (+ spessore), bordo, lucidatura. Giocatori = icona generale (maglia/personaggio/bidone/cesso/cacca), DIMENSIONI (maglia, larghezza tabellino, scritta nome, PDK, sovrapposizione: erano sepolte in fondo e l'utente non le trovava) e icona dei singoli giocatori. Squadra = banner e campo della squadra scelta. Altro = interruttori di dettaglio e "Ripristina tutto". Per aggiungere un controllo: metterlo nella scheda giusta dentro `PAG` in `vImpostazioni`.

(209) 27/10/2026 (Claude, account del secondo utente) — Modalità notte: linee del campo rosse lampeggianti durante le partite live (IN CODA su `coda`, NON pubblicato): in `vCampo()` il div `.court` prende la classe `clive` quando `CNT` è attivo e almeno una partita della notte attiva (`campoNotte()`) ha stato "L" in `TV.days`; il CSS (`.court.clive .cln`) forza linee rosse `#ff1f3d` con animazione `clblink` (1 s). Si spegne da sola a fine partite; rispetta "Riduci le animazioni" (`.noanim`) e `prefers-reduced-motion` (in quel caso restano rosse fisse). Sovrascrive il colore linee scelto nelle impostazioni solo mentre c'è il live.

(210) 28/10/2026 (Claude, account del secondo utente) — Dynasty TV: partite reali ordinate per stato (IN CODA su `coda`, NON pubblicato): nella lista del giorno (`vTV0`) le partite LIVE stanno in alto, poi quelle in programma, in fondo le FINITE (`rkG`: L=0, altre=1, F=2; a parità resta l'ordine d'inizio, sort stabile). Quando una partita live finisce scende da sola al rinnovo dei dati. Le sfide Dreamers restano nella loro sezione sotto, non vengono toccate.

(211) **Osservatorio (giocatori seguiti)** — Home: barra di ricerca ridotta + pulsante giallo `#hseg` (subito accanto alla ricerca, prima del tasto rosso Dynasty TV) (segnalibro + contatore) che apre la vista `osserv` (`vOsserv`). Segui/Non segui con `segBtn(nome)` (`.segi[data-seg]`) in: risultati ricerca home, righe roster, pagina giocatore. Lista in `SEGUI`, salvata in localStorage `dl_seg` (per dispositivo; `navigator.storage.persist()` al primo segui). Stato vista in `OSV={per:"live|notte|gen", m:"pdk|eff"}`. Live/Notte usano `osNight()` (box Dynasty TV di `campoNotte()`); Generale usa `PARTITE` (PDK medio/Eff/Gare/Min/Ultima; chi non è in PARTITE mostra "—"). Mostra squadra proprietaria (o G League/FA). Backup lista: copia/incolla JSON (`<details class="osbk">`, azioni `data-osc`). Il pulsante Dynasty TV live segue la vista (FANTA_LIVE).

(212) **Tab "Scambi" a tendina** — la voce "Calcolo Trade" (`#t-cs`) ora si chiama "Scambi" ed è un menu a tendina identico a quello di Dunkest (`data-menu="subnav2"`, pannello `#subnav2`, stesse classi `.subnav`) con due voci: Calcolatore trade (`valtrade`) e Osservatorio (`osserv`). `dkOpen` ora contiene l'id del menu aperto (`"subnav"`/`"subnav2"`/false). Il tasto giallo in Home apre comunque l'Osservatorio.

(213) **Pallino live = in campo adesso** — nel tabellino Dynasty TV il pallino rosso (`.lvd`) compare solo per chi è in campo. ESPN non dà questo dato, lo dà il boxscore NBA (`players[].oncourt==="1"`, cdn.nba.com). `tvOnCourt()` (chiamata a ogni `tvLiveTick` se ESPN ha risposto) legge i boxscore NBA delle partite live e salva `TV.box[key].oc` (nomi normalizzati con `tvNm`); nel percorso NBA di fallback lo salva `tvOcNames(B)`. Se `oc` manca o è vuoto (NBA non raggiungibile) i pallini restano su tutti come prima. Testato solo con dati simulati: da verificare con una partita live vera.

(214) **Partita live evidenziata nel turno (caselle: lampeggio `lvbl` del riquadro, colore invariato)** — nelle caselle giorno della sfida Dreamers (`.duw`, in `drDuel`) e nelle righe del foglio "partite del turno" (`.dwr`, in `drWkOpen`) la partita in corso (`y.lv` da `drSettimana`) ha il bordo rosso lampeggiante (`@keyframes lvbd`, classi `.duw.dug.lv`, `.duw.duu.lv`, `.dwr.lv`); con "riduci animazioni" resta un bordo rosso fisso.

(215) **Swipe tra le franchigie nel Campo** — in `cur==="campo"` la pagina segue il dito (drag con `translate3d`, blocco su intento orizzontale, `touchmove` non passivo come il gesto "indietro"); al rilascio (soglia 28% larghezza o velocità) esce di lato e la nuova squadra entra dal lato opposto (render a pagina fuori schermo, poi transizione). Ordine della Home (`Object.keys(TEAMS)`: DOL, DUC, FOX, PEA, SPI, TUR, EAG, MOO), giro continuo; dito verso destra = precedente, verso sinistra = successiva. Sotto soglia la pagina rientra. Bordo 40px riservato al gesto "indietro"; ignorato su input/fogli aperti; flag `busy` evita doppi swipe durante l'animazione. Scrive anche `localStorage "team"`.

(216) **Tasti barra Home uniformi** — `.hseg` (Osservatorio), `.tvgo` (Dynasty TV) e `.hdrm` (Dreamers) in `.hbar` hanno tutti 40×38 px (regola `.hbar .tvgo,.hbar .hseg,.hbar .hdrm`).

(217) **Notifica Osservatorio = seguiti in partita** — il badge sul tasto giallo (`segStato`, `segBadgeHtml`, `segBadge`) non conta più i seguiti: conta quelli che stanno giocando live (badge che lampeggia, `.lvb`) oppure hanno giocato la notte (badge fisso, solo fino alle 12:00 ora del telefono; dopo sparisce). Dati da `osNight()`. In Home, con almeno un seguito, `fantaLiveAvvia()` scarica i dati (voce FANTA_LIVE con `soft:true`: aggiorna solo il badge, senza ridisegnare la Home) e il badge si riaggiorna ogni 60 s.

(218) **Campo = formazione Dreamers, senza limite di 2 per fila** — nella formazione Dreamers (fuori modalità notte) i 5 in campo restano nella fila del loro vero ruolo (C alto, A centro, G basso): tolta la regola "max 2 per fila" (rimane solo in modalità notte). Con 3 affiancati posizioni 18/50/82% a grandezza piena (entrano su 430 px); con 4 o 5 maglie ridotte con `--k` (0,7 / 0,55, `scale` su `.court .cpl.dr`). Nel codice: `KS`, `XN` accanto a `FILA`.

(219) **Regola ruoli corretta: C, A e G tra i 5 IN CAMPO** — prima l'obbligo "almeno 1 centro, 1 ala, 1 guardia" valeva sui primi 6 (capitano + pieni), quindi un centro poteva finire 6° uomo (fuori dal campo). Ora vale sui primi 5 (`drTeam`: `A=sel.slice(0,5)`): se manca un ruolo, sale il migliore di quel ruolo e scende il peggiore dei 5 di un ruolo che ne ha almeno 2. Il 6° uomo è libero (punteggio pieno). Valido per Campo e Dreamers (stessa funzione). Aggiornati commenti e testi del regolamento in-app (sezione "Ruoli: regola invalicabile"). Sostituisce la regola dei "primi 6" della (153).

(220) **Tasto Dynasty TV in Home** — stessa altezza (38 px) degli altri due ma larghezza propria (56 px): pallino tondo e icona videocamera non più schiacciati (`.hbar .tvgo`). La ricerca cede lo spazio.

(221) **Fix Roster (errore `t is not defined`)** — `vRoster` usava `dlHeadSty(t)` con `t` non definita (nella funzione la squadra è `curTeam`): la pagina Roster andava in errore e il tasto "‹ Roster …" dalla scheda giocatore non faceva nulla. Ora `dlHeadSty(curTeam)`. Verificato che tutte le viste di `VIEWS` si disegnano senza errori.

(222) **Condividi: cursore "fino a dove"** — nel foglio di condivisione di "Migliori del turno" / "Live stanotte" (`shOpen("campo")`) c'è un cursore (`.shcut`, 1…N righe, default tutte) che ridisegna l'immagine con le sole prime N righe (`shCampo(n)`; si condivide sempre dall'alto). Con meno righe il totale diventa "SOMMA PRIME N" (somma delle righe mostrate). Cursore e pulsanti sono in un blocco fisso in basso (`.shfoot`, sticky). Il file da condividere/salvare viene rigenerato a ogni spostamento (`mk`).

(223) **Tasto indietro semplice = schermata precedente** — i "‹" di scheda giocatore (`#gback`), scheda Free Agent (`#faback`), Cap/Multe/Scouting (`#capback/#mulback/#colback`), Cassa (`#cassaback`) e Osservatorio (`#osback`) ora tornano sempre alla vista da cui si è arrivati, usando la pila `NAVH` (la stessa del gesto/bottone indietro di Android), e la loro scritta dice dove portano (`backLabel`, `fixBackLabels`, aggiornata a ogni `render`). Gestore in cattura su `document` (`BK_IDS`); con pila vuota restano i vecchi comportamenti. Non toccati i "‹" interni a una sezione (Statistiche, Efficienza coppa, Classifica, Arcade, sfide Dreamers…). Esempio: Campo → giocatore → ‹ Campo Ducks.

(224) **Statistiche squadra Dreamers** — in Dreamers › Classifica ogni riga è un pulsante (`data-dr="cteam"`) che apre `drTeamPage(t)` (stato `DR.team`; ‹ Classifica = `data-dr="tclose"`). Sezioni: Bilancio (V/P) · PDK fatti (totale, media, record in un turno, record del capitano con maglia e nome) · PDK subiti (totale, media) · Scontri diretti (V–P e PDK fatti/subiti per ogni avversario) · Trend PDK squadra (grafico SVG fatti/subiti con scelta "Dal turno X al turno Y", `data-drsel="tf|tt"`). Dati da `drTeamData(t)`: giornate 1–2 = Dunkest (`DR_BASE`: solo totali e V/P, quindi nel trend sono la media delle due giornate, pallino vuoto), poi turni Dreamers (`drTeam`); turni in corso marcati live (pallino vuoto), esclusi da record e scontri. Playoff non ancora inclusi. Totali/medie = `drStand()` (comprendono la base Dunkest).

(225) **Stili grafici Dreamers** — in fondo alla sezione Dreamers, accanto a "Regolamento", tasto "🎨 Stile" (`data-dr="theme"`) che fa ruotare lo stile di tutta la sezione tra 4 voci (`DR_THS=[0,1,3,5]`): Galassia (attuale, default), App (blu notte/rosso/oro, come l'app senza modalità notte), Parquet (legno e crema), Tabellone (grigio e ambra). Scelto dall'utente tra 5 proposte: Neon e Carta eliminati (CSS rimosso). Lo stile è per dispositivo (`localStorage "dl_drth"`, `DR.th`). Solo CSS: l'attributo `data-th` su `.drroom` (assente per Galassia) attiva i blocchi `.drroom[data-th="N"]` (colori, sfondo/texture, raggio, ombre, font via `--display`); posizioni e informazioni invariate. Il Parquet (chiaro) ha regole in più per testi/riquadri scuri. Non rifiniti: tabellone playoff e regolamento negli stili alternativi.

(226) **Stili Dreamers: numero in vantaggio colorato per stile** — il punteggio della squadra in vantaggio nel turno (`.drr.w em`, `.slead/.sgold`) non è più viola: Parquet = arancione, App = oro, Tabellone = giallo (Galassia resta viola).

(227) **Stili Dreamers "App colori" e "Tabellone colori"** — aggiunti (non sostituiscono) al ciclo del tasto 🎨: `DR_TH` ha 8 nomi, `DR_THS=[0,1,3,5,6,7]`, `DR_BASE_TH=[0,1,2,3,4,5,1,5]` mappa lo stile 6/7 sul CSS base 1/5; la room riceve `data-col="1"` e le righe Turno (`.drr`) e Classifica (`.drcr`) si riempiono col colore squadra (`--tc`) + righe diagonali come le card Home; colore testo `--tf` calcolato da `drTf(t)` (nero su colori chiari, bianco altrimenti). Punteggio in vantaggio: oro (App) / giallo (Tabellone) su fondino scuro. Verificati solo Turno e Classifica.

(228) **Stile Dreamers predefinito (App)** — `DR.th` ora è un getter: se l'utente non ha mai scelto uno stile col tasto 🎨 (nessun `dl_drth` in localStorage) vale **App (1)** (corretto dopo la prima versione che usava Tabellone), tranne in modalità notte (`CNT`) dove resta Galassia (0). La scelta manuale (`DR._th`, salvata in `dl_drth`) ha sempre la precedenza.

(229) **Immagini condivise nello stile scelto** — tutte le immagini del tasto Condividi (Dreamers, sfida, Campo, grafico, playoff: tutte passano da `shBase`) seguono lo stile Dreamers di chi condivide (`DR.th` effettivo → `DR_BASE_TH`). `SH_THEMES` (1 App, 3 Parquet, 5 Tabellone; i colori-variante 6/7 usano la base 1/5) + `shTheme()`, `shThemeBg()` (sfondo con strisce) e `shThemeCtx()`, che avvolge `fillStyle/strokeStyle/shadowColor/addColorStop` del canvas e rimappa ogni viola/indaco fisso per luminosità (chiaro = colore evidenza, medio = accento, scuro = pannelli). Restano invariati rossi/verdi/oro/colori squadra e il viola semantico `#8b5cf6` (PDK top). Galassia = disegno originale. Parquet nell'immagine usa pannelli marrone scuro (non crema) per tenere il testo bianco leggibile. Verificata solo l'immagine "Dreamers" (turno); sfida/Campo/grafico/playoff passano dalla stessa funzione ma non ancora controllate a occhio.

(230) **Punteggi Turno allineati** — `.drr em` (punteggi nelle righe del Turno Dreamers) ora ha cifre tabulari (`font-variant-numeric:tabular-nums`, `"tnum"`), larghezza minima 84px e allineamento a destra, così la virgola cade sempre nello stesso punto in tutte le squadre e in tutti gli stili. Verificato in browser di prova (posizione della virgola identica); sul telefono dipende dal supporto `tnum` del font Barlow Condensed.

(231) **Allineamento punteggi valido per ogni turno e stile** — la regola di (230) è globale su `.drr em` (nessun filtro per turno o tema). Negli stili "colori" il fondino scuro del punteggio in vantaggio aggiungeva un padding solo al vincitore e spostava la colonna: ora il padding (8px) è su TUTTI i punteggi `.drroom[data-col] .drr.tint em`. Test automatico: tutti i 26 turni × 6 stili (Galassia, App, Parquet, Tabellone, App colori, Tabellone colori), virgola e bordo destro identici (solo i turni con punteggi hanno celle da confrontare). Se si aggiunge uno stile nuovo, non dare padding/margini diversi a `.drr.w em`.

(232) **Sfida Dreamers: zone In campo / Panchina / Tribuna (grafica B)** — la pagina sfida è raggruppata in `<section class="duz z-campo|z-panch|z-trib">` con targhetta `.duzt` sul bordo: riquadro tinto (verde = In campo con capitano + punteggio pieno; rosa = Panchina 7°–10°; grigio tratteggiato = Tribuna con "Fuori dai 10" e "In attesa"). CSS generico su tutti gli stili (`.duz`, `.z-*`, `.duzt span` usano `var(--display)` quindi seguono il font di ogni stile) + ritocco colori per Parquet (tinte più scure per il fondo chiaro). Verificato a occhio su Galassia, App, Parquet, Tabellone, Tabellone colori. Scartata l'alternativa A (titoli grandi centrati con linee).

(233) **Tabellone Campo: bordino rosso lampeggiante, niente riempimento rosso** — il tabellone (`.lbm`, `drTabellone`) con classe `live` ereditava il fondo rosso della regola generica `.live`; ora `.lbm.live` ha fondo "vetro" invariato e solo bordo rosso 2px che pulsa (`@keyframes lbbr`, spento con prefers-reduced-motion). Il lampeggio vale solo di notte: `lvNotte()` (ora di Roma via Intl) è vero prima delle 08:30 e dopo le 18:00, falso tra le 08:30 e le 18:00; il tabellone ha `data-lv="1"` quando lo stato è live e un `setInterval` ogni 20 s alterna `live`/`run`, quindi si spegne alle 08:30 anche con la pagina aperta. Provato in browser: orari 08:29 acceso, 08:31 spento, 10:00 spento, 18:30 e 23:00 acceso.

(234) **Parquet: loghi senza ombra in tutta Dreamers** — nello stile Parquet (`data-th="3"`) tutti i loghi squadra (`.badge`, `.logo`, `.drlg`, `.bklg`, `.dulg`, `.hlogo`, `.tvlw`) hanno `filter:none!important` e niente box/text-shadow, in ogni sezione (Turno, Calendario, Classifica, Playoff, sfida, statistiche squadra). Verificato: 0 loghi con filtro in Playoff, Turno, Classifica, sfida. Nel tabellone playoff Parquet nomi e numeri ora sono scuri sul crema (prima bianchi, illeggibili). Resta da migliorare il contrasto dei titoli colonna lilla ("QUARTI", "SEMIFINALI") sul fondo legno.

(235) **Punteggi del Turno più a destra** — `.drms .drr{padding-right:36px!important}` (prima 76px): la linguetta di stato (IN CORSO / DA GIOCARE…) è larga 22px, quindi i punteggi si avvicinano al bordo. Il padding è identico su tutte le righe e il punteggio ha larghezza fissa a destra, quindi restano incolonnati (test allineamento: 26 turni × 6 stili, 0 disallineamenti).

(236) **Centro gestione + G-Dreamers fusi** — nella barra la voce "Dunkest" ora si chiama **Centro gestione** (sempre menu a tendina `#subnav`); la voce "G League" nel menu è diventata **G-Dreamers** e la scheda "G Dreamers" è stata tolta dalla barra principale (resta la carta G-DREAMERS nell'hub Giochi). La vista `gleague` è ora `vGLeagueM()`: interruttore **Squadre** (la vecchia pagina G League con classifica efficienza e satelliti, `vGLeague()`, titolo "G-Dreamers") / **Campionato** (`vGDream(true)`: classifica, giornate, squadre del fanta; `GLM` = "squadre"|"camp"). Il Campionato usa gli stessi stili grafici di Dreamers (`DR.th`, tasto 🎨 `data-gdth`, stessa scelta salvata in `dl_drth`; stile predefinito App/Galassia di notte): `.drroom.gdroom.gdemb` con `data-th`/`data-col`; le regole `body.dreamfs .drroom[data-th=N]` sono duplicate per `.drroom.gdemb[data-th=N]` perché qui l'app non è a schermo intero. I click della vista `gleague` sono gestiti nel listener di `#main` (`data-gdm`, `data-gdth`, `data-gd`); `drThemeNext()` è il cambio stile condiviso. Etichette ‹ Indietro: dunkest="Centro gestione", gleague/gdreamers="G-Dreamers". Verificati a occhio Squadre, Campionato in 5 stili e pagina squadra.

(237) **Classifica del Centro gestione = classifica Dreamers** — `vClassifica()` non usa più `standings()` (dati Dunkest) ma `drClassArr()` (basato su `drStand()`): V/P per turno (turni 1–2 da `DR_BASE`, poi i turni Dreamers chiusi), % vittorie, GB, PF/PS = PDK fatti/subiti, Serie = ultimi risultati (`drFormT`, funzione globale uguale al `form` della Classifica Dreamers). Ordine identico alla Classifica in Dreamers (vittorie, poi media PDK). Titolo "Dreamers · turno N" (N = turni chiusi). Si aggiorna da sola quando un turno Dreamers si chiude. `standings()` resta per altri usi (Home ecc.).

(238) **Stile predefinito di G-Dreamers** — `drThG()`: se l'utente non ha mai scelto uno stile col tasto 🎨 (`DR._th` nullo) il Campionato G-Dreamers parte in **App colori (6)** di giorno e in **Galassia (0, quella verde)** con la modalità notte attiva (`CNT`). Il Dreamers resta App (1) / Galassia di notte (nota 228). La scelta manuale vale per entrambe le sezioni (stesso `dl_drth`); `drThemeNext(1)` cicla partendo dallo stile effettivo della sezione G-Dreamers.

(239) **Risultati (Centro gestione) = turni Dreamers** — `vRisultati()` ora scorre i turni Dreamers invece delle giornate Dunkest 1–64: indice `rgN` = numero turno mostrato (1–2 = giornate Dunkest 1–2 di partenza da `GIORNATE`, 3–28 = `DR_SCHED` con `k=rgN-DR_OFF`, poi i playoff `drPO`/`drPairs` fino a `P.end+DR_OFF`). Passato = "Finale" con punteggi reali, presente = "Live/In corso" con parziali (stessi `drTeam` del Dreamers, `pdkF` 1 decimale), futuro = "Da giocare" con gli accoppiamenti (`vs`); playoff non ancora definiti = "Da definire". Tocco su una partita (`data-rgo`) apre la sfida in Dreamers. Tolto il tasto condividi per partita (era legato alle giornate Dunkest; la sfida Dreamers ha il suo). Frecce con limite dinamico.

(240) **Stile app: Tabellone + pulsante Stile** — nuovo tema `DLT.tabellone` (nero/ambra: bg #0b0d10, pannelli #1b2027, accento #ffb000; compare anche nella lista temi di Impostazioni) con sfondo a righe diagonali (`html.dlt-tabellone body`). Nell'header, accanto all'ingranaggio, pulsante piccolo `#stylebtn` (🎨, 34px, dentro `.topbtns`): alterna Classico ↔ Tabellone (`DLS.th`, salvato in `dl_set`). I loghi squadra restano pieni di colore. In arrivo: versione chiara arancione/crema (Parquet) con loghi senza sfondo colorato.

(241) **Tema Parquet dell'app + collegamento con Dreamers** — nuovo tema `DLT.parquet` (arancione/crema, `html.dlt-parquet`) con testi scuri forzati sulle superfici chiare, card squadra e testata Roster color crema con il colore squadra solo come filo (loghi senza sfondo colorato), chip selezionato arancione, e **logo Dreamers arancione** (`.lglogo{filter:hue-rotate(128deg)…}`). Il pulsante Stile cicla Tabellone → Parquet → Classico. `dlSyncDr(th)`: scegliere Tabellone/Parquet/Classico (dal pulsante o dalle Impostazioni) imposta in automatico anche lo stile di Dreamers e G-Dreamers (Tabellone=5, Parquet=3, Classico=predefinito, `dl_drth`); il contrario (cambiare stile dentro Dreamers) non cambia l'app. Pagine controllate: Home, Roster, Classifica, Dynasty TV; altre pagine (Statistiche, Free Agent, Trade, Regolamento…) da rivedere con il tema chiaro.

(242) **Statistiche live ESPN nelle stats dei giocatori (dalle 07:30)** — `liveSync()` (in `index.html`, chiamata all'inizio di `render()`) aggiunge in coda a `PARTITE[nome]` la riga della notte appena giocata, calcolata dai tabellini ESPN di Dynasty TV con la formula Dunkest (`fantaLiveNotte`, che ora restituisce anche `pts/reb/ast`). Parte **dalle 07:30 ora italiana** del giorno dopo la notte (Intl Europe/Rome); prima restano solo le viste live. Poiché medie (`pdkMed`, `pagella`, `capDati`, `mulPar`), grafici (`grGames`), pagina giocatore, trend e tabella squadra leggono tutti `PARTITE`, le righe live compaiono ovunque senza altro codice. La riga ha un 9° valore: `"L"` (partita in corso) o `"P"` (finita, provvisoria); nella tabella squadra la cella pulsa viola (`.gv.gvlive`). A ogni render le righe live precedenti vengono tolte e ricalcolate; appena arrivano i dati ufficiali Dunkest (~10:30, `EFF.agg` avanza oltre quella notte) la riga live non viene più aggiunta, quindi nessun doppione: restano quelle ufficiali. Nuova voce `FANTA_LIVE` che scarica i dati live anche nelle viste statistiche. Limiti: gli aggregati basati su `EFF` (efficienza stagionale, "Notte · in campo") non includono il live; il PDK parziale di partite in corso incide sulle medie finché non finiscono; la sostituzione ufficiale avviene quando la pagina carica il nuovo file dati.

(243) **Live ESPN anche in efficienza stagionale e "Notte · in campo"** — estende (242): `liveEff()` (chiamata da `liveSync()`, dalle 07:30) ripristina da una copia (`EFF0`) `EFF.gioc` e `ULTIMA.gioc` ai valori ufficiali e poi applica la notte live per ogni giocatore: efficienza media = media semplice delle efficienze partita (regola Francesco), partite +1, minuti medi, minuti/efficienza/PDK della notte (colonne 4, 5, 8) e ULTIMA. Idempotente a ogni render; quando `EFF.agg` avanza (dati ufficiali Dunkest) la notte live non viene più applicata e tornano i valori ufficiali. Non toccato: `EFF.squadre` (medie di squadra, colonna non documentata) e `DRD.notti`.

(244) **Rimossa la sezione Giochi (Arcade)** — tolta la scheda "Giochi" dalla barra (`#t-ar`) e il pulsante Arcade dalla Home dei giochi; `GAME==="arcade"` ora ricade nel menu. Il codice dei passatempi (Più o meno, Tiro da 3, Sfida della notte, Partita simulata: `vGiochi`, `vTiro`, `vNotte`, `vSim`) resta nel file ma non è più raggiungibile dall'interfaccia. Dreamers e G-Dreamers invariati (scheda Dreamers).

(245) **Impostazioni: anteprima campo che sale fino in cima** — nella pagina Impostazioni (`cur==="impostazioni"`) `render()` mette `html.setpg`: l'header diventa `position:relative` (scorre via con la pagina) e `.setprev` resta sticky a `top:env(safe-area-inset-top)`. Così scorrendo verso il basso il campo sale il più possibile e poi resta fermo. La classe dipende solo dalla pagina (non dalla posizione di scroll), quindi niente tremolio; le modifiche usano `full()` che conserva lo scroll (verificato: scrollY e posizione anteprima invariati).

(246) **Tasto "↺ Ripristina" rosso nelle Impostazioni** — nella riga fissa sopra l'anteprima (accanto a Giorno/Notte/Nascondi; "Nascondi anteprima" accorciato in "Nascondi"/"Mostra" per stare su una riga). Doppio tocco: il primo diventa "Confermi?" (rosso scuro pulsante, si disarma dopo 4 s), il secondo chiama `dlsResetAll()`: `DLS` torna a `DLS_DEF` (campo, maglie, colori e personalizzazioni per squadra, tema app → Classico) e lo stile Dreamers/G-Dreamers torna al predefinito (`dlSyncDr("classico")`). Restano solo squadra e giorno/notte dell'anteprima. Anche "Ripristina tutto" nella scheda Altro usa la stessa funzione.

(247) **Trade + Trade speciali unite** — tolta la voce "Trade speciali" dal menu Centro gestione; `vTrade()` ora mostra due schede (stile `.gdmsw`, variabile `TRS`, `data-trs`): "Tutte le trade" (`vTradeAll()`, la lista Trade Alert di prima) e "Trade speciale" (`vSpeciali()`, le schede con barra del tempo rimasto). La vista `speciali` resta registrata in `VIEWS` ma non ha più voce di menu.

(248) **Contrasto automatico nel tema Parquet (arancione)** — blocco `<script>` finale: `pqFix()` gira dopo ogni `render()`, `syncMenu()` e al cambio tema; per ogni testo calcola il contrasto col suo sfondo (sale gli antenati, primo colore dei gradienti) e se è < 3,4 lo corregge con `color` inline `!important`: bianco su fondi scuri/arancioni, arancione scuro `#b8410a` (o la stessa tinta scurita se è un colore semantico: verde/rosso/blu/giallo) su fondi chiari. Le stelle vuote (`.tstar`) diventano marroni su fondi chiari (`.stl`). Uscendo dal tema (`dlsApply`) i colori inline vengono rimossi (`pqClean`). In CSS: menu a tendina `.subnav` arancione su crema, voce selezionata bianca su arancione; arancione dell'intestazione leggermente più scuro (`#e85a0c`) per avere bianco leggibile. Verificato con una scansione automatica su 14 pagine (0 testi sotto 3,2). Nota: se aggiungi nuove pagine con sfondi particolari (immagini) il controllo usa solo i colori CSS.

(249) **Parquet: scritte dell'intestazione sempre bianche** — `pqFix()` forza `#fff` su tutti i testi dentro `header` (prima sceglieva il marrone sulle schede della barra); le schede non selezionate hanno anche una leggera ombra del testo.

(250) **Parquet: caselle squadra della Home a doghe di parquet** — `html.dlt-parquet .htile` non è più crema: doghe di legno, cornice chiara interna (come le linee del campo), barra col colore squadra in basso al centro, loghi con ombra morbida, sottotitoli marrone scuro. Toccata solo la casella Home (`.htile`); testata squadra (`.teamhead`) e altre card restano crema.

(251) **Parquet: nomi squadra bianchi nelle caselle Home** — `.htile b/small` bianchi con contorno marrone sottile (text-shadow) per leggersi sul legno; il record `.hrec` resta senza ombra. `pqFix()` salta gli elementi dentro `.htile` per non riscurirli.

(252) **Parquet: niente scritte nere** — `pqFix()` ora gira anche dentro Dreamers/G-Dreamers con stile Parquet (`.drroom[data-th="3"]`), non solo col tema app Parquet, e oltre al contrasto bassa ogni testo nero/marrone scurissimo (luminanza < .07): arancione `#b8410a` su fondi chiari, bianco su fondi scuri, bianco con contorno marrone sul legno. I marroni medi (`#7a5632`, colore parquet) restano. Si salta il testo trasparente (loghi a gradiente) e le caselle `.htile`.

(253) **Fix menu a tendina Parquet** — la regola "tutto bianco nell'intestazione" di (249) colpiva anche le voci dei menu `.subnav` (che stanno dentro `header`), rendendole bianco su crema. Ora `pqFix()` esclude `.subnav`: le voci restano arancioni su crema (selezionata bianca su arancione).

(254) **Parquet: controllo generale contrasto** — `pqFix()` su fondi vivaci non-legno (verde, giallo, viola, rosa: chip PDK, tab, badge) usa arancione bruciato `#7c2d05` invece di bianco; sul legno resta bianco con contorno marrone; i colori semantici (crediti/debiti) si scuriscono solo fino a contrasto 3,4 (non quasi neri). Scansione di ~25 pagine del tema app e delle schede Dreamers/G-Dreamers in stile Parquet: nessun testo nero, nessun bianco su chiaro.

(255) **Pulsante Stile spostato nelle Impostazioni → App** — tolto il tasto tavolozza dall'intestazione (resta solo l'ingranaggio). Nel pannello "Stile dell'app" c'è ora un pulsante a tutta larghezza "🎨 Cambia stile · <stile attuale>" (`#stylebtn`, classe `.stylecyc`) che cicla Tabellone → Parquet → Classico come prima (con `dlSyncDr`) mantenendo lo scroll. Le chip dei temi restano sotto.

(256) **Dreamers Parquet: via le sfumature/aloni sui numeri** — in `.drroom[data-th="3"]` ogni `text-shadow` di `b/em/span/i/small/div` è azzerato (restano solo i contorni marroni messi da `pqFix` sul legno); il numero del leader della sfida (`.duhd .dut.lead b`), `.drtop>b` e i punteggi vincenti `.drr.w em`/`.slead`/`.sgold` sono arancione pieno `#c2410c` senza alone viola né arancione.

(257) **Dynasty TV · sfide Dreamers: vantaggio come nelle partite NBA** — in `tvDreamers()` la classe `win` ora va a chi è avanti anche a turno in corso (prima solo a turno chiuso): punteggio bianco candido per chi è avanti, attenuato (`#8e98b8`) per l'altro. Il CSS `.tvg.live .tvsc{color:#fff}` colorava di bianco entrambi nelle sfide live: aggiunta la regola `.tvg.drtvg.live` per ripristinare l'attenuazione.

(258) **Registro aggiornamenti (Ufficio Scouting → 🔄 Aggiornamenti)** — terza sezione accanto a College e NBA (`COL.sec==="log"`, `vUpdLog()` nel blocco `<script>` finale). In alto due riquadri di stato (dati ufficiali Dunkest: "dati al" + orario del file letto dal footer; ESPN: in uso/non in uso con notti e n. giocatori). Sotto il registro, salvato su questo telefono (`dl_updlog`, ultimi 80 eventi, pulsante Cancella): scrive (1) "Dati ufficiali Dunkest in uso" alla prima apertura, (2) "⚡ Statistiche ESPN caricate per la notte DD/MM: N giocatori" quando `liveSync()` inserisce la notte (dalle 07:30), (3) "📥 Caricati i dati ufficiali Dunkest" quando cambia `EFF.agg` o l'orario "Ultimo aggiornamento", (4) "🔁 Sostituzione completata" quando la notte ESPN è coperta dai dati ufficiali. `ulCheck()` gira a ogni render. Limite: si scrive solo quando l'app è aperta su quel telefono (l'orario è quello del rilevamento, ora italiana).

(259) **Animazioni live: partono con la partita, finiscono alle 07:30** — `lvAnim()` (usata da `lvNotte()` e da `lvSync()` → `html.lvoff`) è vera solo se c'è una partita davvero in corso *iniziata dopo l'ultimo 07:30 italiano*: dai dati Dynasty TV (`g[5]==="L"`, orario d'inizio `g[6]` "HH:MM+N" in ora italiana) oppure dal tabellone ESPN (`window.LVS` = inizio della prima partita "in" nel controllo ogni 2 min). Così le animazioni partono anche a mezzogiorno se c'è una partita, e alle 07:30 si spengono a prescindere (una partita iniziata prima delle 07:30 non conta più). Il CSS `html.lvoff` azzera puntini LIVE, bordo lampeggiante del tabellone (`.lbm.live`, tornato `run`), linee del campo, pulsante LIVE, celle `gvlive`, ecc. Verificato con orari/partite simulati (06:00 notturna → on; 07:31 stessa partita → off; 12:00 con partita → on; senza partita → off; ESPN LVS recente → on, vecchio → off). Limite: l'aggiornamento è al ritmo dei controlli (30 s su Dynasty TV/vista live, 2 min ESPN).

(260) **Cronologia modifiche cliccabile** — il footer "Ultimo aggiornamento: … ›" (`#updbtn`) apre la vista `novita` (`vNovita()`, array `NV_LOG` nel `<script>` finale): elenco per data, dal più recente, con titolo e mini specifica di ogni modifica; "‹ Indietro" torna alla pagina di provenienza. **REGOLA: ogni nuova modifica pubblicata va aggiunta in CIMA a `NV_LOG`** (data, titolo, una frase), oltre alla voce numerata in questo file.

(report) 28/10/2026 — report Dunkest automatico caricato: notti 27/10 (4 partite)
(261) **Cronologia modifiche: niente area segreta** — tolta da `NV_LOG` la voce sul registro aggiornamenti dell'Ufficio Scouting (area riservata Ducks). REGOLA: le modifiche dell'Ufficio Scouting non vanno mai scritte nella cronologia pubblica.

(262) **Eventi dati colorati nella cronologia pubblica** — la pagina Cronologia (footer cliccabile) ha in cima "Eventi dati": 🔴 rosso = dati ufficiali Dunkest caricati (con l'orario del file, riga fissa "Ultimo caricamento" + eventi rilevati), 🟢 verde = statistiche ESPN ufficiali nell'app dalle 07:30 (notte, n. giocatori), 🟣 viola = inizio modalità live (partita, orario d'inizio). Stessi eventi (`dl_updlog`, `ulCheck()`, chiavi `dk:`/`espn:`/`live:`) e stessi colori anche nel registro dell'Ufficio Scouting. REGOLA (Francesco): le modifiche dell'area segreta Scouting Ducks NON vanno mai in `NV_LOG`.

(263) **Controllo dati + registro tolto dallo Scouting** — `dataCheck()` (script del registro) fa 6 controlli a ogni apertura della Cronologia: giocatori delle rose presenti in `EFF.gioc`, nessun estraneo, ULTIMA coerente con la notte di EFF, partite del riepilogo (`EFF.gioc[..][2]`) = righe di `PARTITE`, nessuna riga ESPN rimasta dopo i dati ufficiali, freschezza del file Dunkest (se dopo le 11:30 non è arrivato quello di oggi → avviso). Esito ✅/⚠️ in cima alla Cronologia (`.nvck`). Nota: la media di `EFF` NON è la media semplice di `PARTITE` (Dunkest tratta diversamente le partite con pochi minuti), quindi non si confrontano. La sezione "🔄 Aggiornamenti" è stata **tolta dall'Ufficio Scouting** (resta il motore `ulCheck()` che alimenta gli eventi della Cronologia pubblica). Questa rimozione NON va in `NV_LOG`.

## (264) Eventi dati uguali per tutti
- Il registro "Eventi dati" (Cronologia modifiche) non usa più il rilevamento locale del telefono: `window.sharedEvents()` calcola gli eventi da fonti condivise, quindi tutti vedono lo stesso elenco.
- Rosso: caricamenti Dunkest = commit "[automatico]" del bot su `dreamers-data.js` (API GitHub, cache 10 min).
- Verde: 07:30 italiane del giorno dopo la notte (ora legale corretta per ogni data, `romeAt`), solo per notti con partite finite.
- Viola: orario della prima partita della notte dal tabellone ESPN (`tipFetch`), salvato in `dl_tipev` (le notti finite non cambiano).
- Nessuna menzione di Scouting Ducks nel registro pubblico.

## (265) Controllo dati con orario del telefono
- Nel riquadro "Controllo dati" l'esito riporta l'ora in cui QUESTO telefono ha fatto il controllo: "Aggiornamenti ok · controllo di questo telefono alle HH:MM" oppure "Problema tecnico" con elenco di cosa non torna. Gli eventi sotto restano identici per tutti.

## (266) Centro Medico collegato a campo e duelli
- `injSync()` ricostruisce `INJ` a ogni render: un giocatore "out" porta la X rossa (`injX`, classe `.injx`) in campo/panchina (`drGioc`, `drGiocN`) e nelle carte del duello (`drDuel`). Vale 0 e non viene più proiettato a media in `drProiez`.
- Rientro automatico: se in `PARTITE` c'è una partita con minuti>0 dalla data del bollettino (`INFORTUNI.agg`) in poi (dati ufficiali o live ESPN) il giocatore esce dal Centro Medico (sezione "Rientrati · tolti in automatico") e la X sparisce.
- Solo stato "out" ha la X. Resta da aggiornare a mano `INFORTUNI.lista` come prima.

## (267) Confronto Dunkest ↔ ESPN notte per notte (+ regola per chi carica Dunkest)
- Due controlli distinti nella Cronologia: "Controllo di coerenza" (`dataCheck`, invariato) e sezione "Confronto Dunkest ↔ ESPN" (`cfBlock`, script (267) in fondo a `index.html`, oggetto `window.CF`).
- Ogni telefono rilegge da ESPN i tabelloni/tabellini delle ultime 6 notti dell'era Dreamers e la lista infortuni, e li confronta con le righe ufficiali di `PARTITE` (quelle senza 9° valore). Chip per notte (✅ o numero di differenze), poi cinque sezioni: Giocatori che hanno giocato, Punti PDK (±2), Minuti (±1,5'), Statistiche punti/rimbalzi/assist, Infortunati (su ESPN non da noi / da noi non su ESPN / stato diverso).
- Solo per l'ULTIMA notte: se un giocatore ha giocato per ESPN ma non è nei dati Dunkest, `liveSync` aggiunge una riga in `PARTITE` con 9° valore "E" e `liveEff` la conta (partite, minuti, efficienza, notte): ESPN è dato ufficiale finché Dunkest non viene corretto. Le righe "E" sono escluse dal controllo doppioni.
- Non provato con ESPN reale (rete bloccata nel sandbox), solo con risposte simulate. Endpoint infortuni: `.../basketball/nba/injuries`; se non risponde la sezione dice "non raggiungibile".
- REGOLA PER CHI CARICA I DATI DUNKEST (altro Claude / amico): dopo il report aprire Cronologia modifiche → "Confronto Dunkest ↔ ESPN". Se un giocatore "manca su Dunkest", correggere il report e scrivere nel messaggio di aggiornamento che ESPN era stato usato in sostituzione; verificare PDK/minuti/statistiche diversi; aggiornare `INFORTUNI.lista` allineandola alla lista ESPN (gli infortunati si prendono da ESPN).

## (268) Confronto diviso in Squadre / Free agent / G-League + ESPN ufficiale per FA e G-League
- Il confronto (267) ora ha tab Squadre · Free agent · G-League (con numero di differenze) oltre alle chip per notte. Fonti Dunkest: squadre = `PARTITE`; G-League = `GL_STATS[team|nome].log` (poi `PARTITE`); free agent = `FAG[nome]["2026/27"]` (fa-games.js, caricato con `faLoadG`) (poi `PARTITE`). Gruppo di un giocatore: ROSTER > G-League > FA (`grp()`).
- `cfApplyOther()` (chiamata da `liveSync` a ogni render): dalle 07:30 italiane ESPN diventa ufficiale per FA e G-League per la notte dell'ultimo report e le successive: aggiunge una riga con 9° valore "E" nel log (`GL_STATS.log` / `FAG`) e ricalcola le medie (G-League: g, m, p, e, l5; FA: `FA[i][4]["26/27"]` = [partite, min, pdk, eff, pts, reb, ast]). Tutto viene annullato e rifatto a ogni render: appena Dunkest porta la riga di quella data, la riga "E" non viene più aggiunta (le medie tornano ufficiali). Notti precedenti all'ultimo report: solo confronto, nessuna modifica.
- Caveat: se Dunkest non registra giocatori con pochissimi minuti, ESPN potrebbe aggiungerli in più (ben visibile nel confronto come "Mancano su Dunkest"). Pagine G-League che leggono `glPlayers()` da PARTITE non sono toccate.
- Non provato con ESPN reale (rete bloccata nel sandbox): provato con risposte simulate.

## (269) Infortunati automatici da ESPN (e tolto il confronto infortuni)
- Tolto il confronto infortuni ESPN↔nostra lista dal Confronto Dunkest ↔ ESPN: da ora gli infortunati vengono SOLO da ESPN.
- `injFetch()` (script (267), in fondo): legge `site.api.espn.com/.../basketball/nba/injuries` all'apertura, ogni 5 minuti (solo se l'app è aperta) e quando si torna sull'app; per i giocatori delle 8 rose ricostruisce `INFORTUNI.lista` (stato out/dubbio/quest/dtd da status + fantasyStatus, tipo = parte del corpo + lato + natura tradotti in italiano, rientro da `details.returnDate`, nota = commento ESPN in inglese), aggiorna `INFORTUNI.agg` e `fonti`. Poi `injSync()` e il resto (Centro Medico, X rossa, rientro automatico quando il giocatore gioca) seguono da soli. La lista scritta a mano nel codice resta solo come ripiego se ESPN non risponde.
- Non è una vera notifica push: l'app si aggiorna quando è aperta. Per avvisi a app chiusa servirebbe un backend.
- Non provato con ESPN reale (rete bloccata nel sandbox): formato dell'endpoint assunto (injuries[].injuries[] con athlete, status, details.returnDate/side/detail/type, fantasyStatus) e provato con risposta simulata; se il formato fosse diverso la lista resta quella manuale.

## (270) OUT anche in tribuna/panchina
- `injTag(nome)` aggiunge dopo "Ruolo · SQUADRA" una pillola rossa "OUT" (solo "OUT", senza data) nelle righe tribuna (`drPanca`) e nella panchina modalità notte; la maglia ha lo stesso alone rosso del campo. Solo stato "out".

## (271) OUT nelle carte del duello
- Nel duello Dreamers l'etichetta OUT è una pillola rossa in alto a destra della carta (riga del nome), identica in entrambe le squadre (`.duo`); la maglia ha l'alone rosso. Il nome si accorcia con "…" se serve spazio.

## (272) Cap e Multe solo nell'Ufficio Scouting
- Tolti i tasti Cap e Multe dal campo; ora sono (stessi id `#ccap`/`#cmul`) in cima all'Ufficio Scouting (`vCollege`, sotto "Legenda"). Le pagine Cap/Multe tornano con "‹ Ufficio Scouting" (`cur="college"`). Come da regola, nessuna voce nel registro pubblico (`NV_LOG`).

## (273) Segno infortunato leggero sul campo
- Sul campo e in panchina gli "out" hanno un quadratino rosso con croce bianca (`.injx`, 24px) in basso a sinistra della maglia, appoggiato al tagliandino nome/PDK (dietro di esso, z-index 1). Tolto l'alone rosso sulla maglia. Resta: pillola OUT nel duello (`.duo`) e in tribuna (`.injo`).

## (274) Partite future degli infortunati = NG rosso
- Nel duello (`drDuel`, caselle della settimana) le partite non ancora giocate di un giocatore "out" (`injOut`) mostrano "NG" in rosso (`.duw.dung`) invece dell'avversario. Se il giocatore gioca, `injSync` lo toglie dagli infortunati e le caselle tornano normali con i PDK registrati.

## (275) Lucchetto "punteggio definitivo" nel duello
- Nella carta del duello (`drDuel`, classe `.du.fin`) un lucchetto giallo (26px, `.fin-b`) accanto al "×1" segna che il giocatore ha concluso tutte le partite del turno e nessuna è in corso: punteggio definitivo.

## (276) Linea di stato tra cartellino nome e PDK sul campo
- Sul campo e in panchina (`.cpl`, `.dpc`) l'attributo `data-ist` (`injSt`: out / dub / ok) colora una linea di 3px tra tagliandino nome e tagliandino PDK: rosso = out (con la croce), arancione = dubbio/in forse/giorno per giorno, verde = disponibile.
