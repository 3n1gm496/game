# PRIVACY — MÉRIDIEN

## In una riga

Nessun account, nessuna e-mail, nessun cookie di tracciamento, nessuna statistica
raccolta. Il nickname resta sul tuo dispositivo, le stanze si cancellano da sole.

## 1. Cosa non chiediamo

* Nessuna registrazione, nessuna password, nessun indirizzo e-mail.
* Nessun accesso tramite servizi di terze parti.
* Nessun numero di telefono, nessuna rubrica, nessuna posizione.
* Nessun accesso a fotocamera, microfono o notifiche.

Per giocare basta un nickname, che scegli tu e che puoi cambiare.

## 2. Cosa esiste, dove, per quanto

| Dato | Dove sta | Quanto dura |
| --- | --- | --- |
| Nickname e avatar scelti | `localStorage` del tuo dispositivo | finché non li cancelli |
| Preferenze (audio, accessibilità, qualità) | `localStorage` del tuo dispositivo | finché non le cancelli |
| Token di sessione della stanza | `localStorage` + memoria del server | fino a 4 ore, e comunque non oltre la vita della stanza |
| Stato della partita (ruoli, indizi, bacheca, chat) | **solo memoria del server** | fino alla chiusura della stanza |
| Taccuino personale | memoria del server, visibile solo a te | fino alla chiusura della stanza |
| Indirizzo IP | memoria del server, per la limitazione di frequenza | finestra scorrevole di 10 minuti |
| Log tecnici | uscita standard del processo | secondo la politica di chi ospita il server |

**Non esiste un database.** Lo stato di ogni partita vive in memoria e sparisce quando la
stanza si chiude: 20 minuti senza connessioni, oppure 3 ore dalla creazione, oppure il
riavvio del processo.

## 3. Cosa viene registrato nei log

Il server scrive eventi tecnici in JSON: creazione e chiusura di stanze, ingressi e uscite,
avanzamenti di fase, verdetti, errori. Ogni riga passa da un oscuratore automatico che
sostituisce chiavi, token e qualunque stringa che assomigli a un segreto
(`apps/server/src/log.ts`).

Nei log **non** finiscono: i messaggi dei giocatori, i taccuini, i nickname associati agli
indirizzi IP, i contenuti delle partite.

## 4. Analytics

**Disattivate per impostazione predefinita** (`ANALYTICS_ENABLED=false`), e non c'è alcun
codice di tracciamento nel client: nessun pixel, nessuno script di terze parti, nessun
identificatore pubblicitario. La Content Security Policy vieta qualunque connessione fuori
dall'origine del gioco, quindi anche volendo non si potrebbe.

Chi ospita un'istanza e volesse contare le partite ha `/metrics`, che espone solo numeri
aggregati (stanze aperte, giocatori collegati, messaggi, errori) e nessun dato personale.

## 5. Intelligenza artificiale

Nella configurazione predefinita **nulla esce dal server**: il Regista deterministico non
fa richieste di rete.

Se chi ospita l'istanza attiva un provider esterno (Claude o un endpoint compatibile),
allora vengono inviate al provider soltanto:

* la domanda che hai scritto a un testimone, ripulita e troncata;
* le battute prevalidate di quel testimone;
* ciò che è già pubblico in bacheca, per i riepiloghi;
* i nickname dei presenti, per le battute del maggiordomo.

Non vengono mai inviati: il tuo taccuino, i tuoi segreti, i messaggi privati, la soluzione
del caso. Il pannello impostazioni e la lobby indicano sempre se il Regista esterno è
attivo, e l'host può disattivarlo con un interruttore.

Il modello opzionale su dispositivo (app iOS) gira **interamente sul telefono**: nulla di
ciò che elabora lascia il dispositivo.

## 6. Minori

Il gioco è pensato per un pubblico dai 12 anni in su. Non raccogliendo dati personali non
c'è profilazione di minori. La chat è limitata nella lunghezza e passa da un filtro
minimo, ma resta uno spazio dove le persone scrivono: la moderazione ultima è
dell'host, che può espellere chiunque.

## 7. I tuoi dati, in pratica

* **Cancellare tutto**: svuota i dati del sito dal browser (o disinstalla l'app). Non
  resta nulla, perché non c'è nulla altrove.
* **Uscire da una partita**: il pulsante «Esci» cancella il token di sessione locale e ti
  rimuove dalla stanza.
* **Portabilità**: non ci sono dati da esportare, perché non ne conserviamo.

## 8. Chi ospita un'istanza

Questo documento descrive il software. Se ospiti un'istanza pubblica sei tu il titolare del
trattamento per i log del tuo server e per l'eventuale provider AI che configuri. Le scelte
predefinite del progetto — niente database, niente analytics, log oscurati, dati effimeri —
sono pensate per rendere quella responsabilità la più leggera possibile.
