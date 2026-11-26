/* SPAZIO IN SQUADRA — dati Dunkest, aggiornati dal Claude che carica i report.
   Per OGNI squadra NBA in cui c'è almeno un giocatore della lega: TUTTI i giocatori di quella squadra NBA
   (anche quelli che non sono nella lega) con [nome, minuti medi, PDK medi, partite giocate],
   presi da Dunkest sulle ultime 10 partite della squadra (o sulla stagione se ne ha giocate meno).
   L'app ordina la squadra e assegna le stelline "Spazio in squadra" (funzione spazioStelle in index.html).
   Se una squadra manca, l'app usa solo i giocatori della lega (meno preciso). */
const SPAZIO_DATA={agg:null,fonte:"Dunkest",squadre:{
  /* esempio di formato:
  "SAS":[["Victor Wembanyama",33.1,40.2,10],["De'Aaron Fox",32.0,27.5,10],["Stephon Castle",30.4,25.1,10],["Devin Vassell",28.0,18.3,9],["Dylan Harper",22.6,16.2,10]]
  */
}};
