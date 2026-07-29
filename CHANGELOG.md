# CHANGELOG

Le versioni seguono [Semantic Versioning](https://semver.org/lang/it/).
La versione del **protocollo** client-server è separata e cambia solo quando rompe la
compatibilità: oggi è `1`.

## [1.0.1] — 2026-07-29

Correzioni emerse dall'osservazione della build di produzione: server avviato, partita vera
giocata su quattro browser, schermate guardate una per una.

### Corretto

- **Le icone non si vedevano.** Il foglio sprite portava gli attributi di tratto solo sulla
  radice, e `<use>` clona il simbolo altrove: ogni icona usciva nera e piena invece che a
  tratto. Ora gli attributi stanno su ogni `symbol`, e il foglio è incorporato nella pagina
  invece di essere richiamato come file esterno — cosa su cui WebKit non dà garanzie.
- **Gli indizi uscivano senza segno.** I casi nominano settantotto oggetti diversi; il set
  grafico ne disegna trenta. Mancava la corrispondenza fra le due cose, e la maggior parte
  delle carte restava con un buco al posto dell'icona. Aggiunte otto icone (busta,
  fotografia, boccetta, impronta, scarpa, quadro, filo) e una tabella di categorie, con un
  test che si accorge se i contenuti si allontanano dal set.
- **Testo chiaro su carta chiara.** Sommari, pillole e pulsanti dentro le carte di carta
  usavano i colori pensati per il fondo notturno: «Condividi» era praticamente invisibile.
  I token si ribaltano ora una volta sola dentro `.carta`.
- **Gli avvisi coprivano il dossier.** Un evento della tempesta poteva arrivare come
  paragrafo intero, semitrasparente, sopra il testo del proprio personaggio. Ora l'avviso
  porta un estratto, è opaco e si ferma a tre righe; il testo intero resta nella cronaca.
- **L'apertura era mezza vuota.** La facciata dell'albergo era stata generata ma nessuna
  schermata la usava: ora sta dietro il titolo, in tre piani di profondità, con la pioggia
  davanti.
- **Etichette tagliate ai bordi della scena.** I punti da esaminare vicino al margine
  perdevano metà nome; l'etichetta ora si ancora al lato.
- **La pillola «padrone di casa» si stirava** per tutta la riga nella lobby, e il pulsante
  per accompagnare un ospite all'uscita mostrava una croce al posto di un'icona.

### Rete

- Il **catalogo del caso** viaggia una volta sola per collegamento invece che a ogni
  aggiornamento di stato: erano ottomila byte su novemila, ripetuti a ogni movimento di
  ogni giocatore. Su venti stanze e cento giocatori il traffico di stato scende del 66 % e
  la latenza p95 da 109 ms a 47 ms. Nel messaggio alleggerito il campo è assente — diverso
  da `null`, che significa «nessun caso scelto».

### Strumenti

- La **prova di carico** contava come riuscita una corsa in cui solo ventidue client su
  cento erano davvero entrati in una stanza: gli altri erano stati respinti dal limite per
  indirizzo, e il rifiuto era fra quelli attesi. Ora conta chi è dentro e si ferma dicendo
  cosa alzare.
- Nuovo `pnpm test:visual:aggiorna` per riscrivere gli screenshot di riferimento.

### Documentazione

- `ARCHITECTURE.md` §5 descriveva un protocollo che non esiste (`roomSnapshot`/`roomPatch`,
  delta JSON). Ora elenca i messaggi reali e spiega perché lo stato viaggia come istantanea
  intera numerata.

## [1.0.0] — 2026-07-28

Prima versione completa. Gioco multiplayer online reale, installabile come PWA e
predisposto come applicazione iOS.

### Gioco

- Giallo sociale per 4–8 giocatori, 20–30 minuti a partita, server autoritativo.
- Flusso completo: apertura cinematografica, tutorial interattivo, creazione e ingresso in
  stanza, lobby con presenza in tempo reale, assegnazione privata dei ruoli, tre atti,
  accusa individuale, verdetto collettivo, ricostruzione animata, punteggi, rivincita.
- Modalità **competitiva** (il colpevole è un giocatore) e **cooperativa** (il colpevole è
  un personaggio non giocante).
- Dossier privato per ogni giocatore: identità, ritratto, professione, relazione con la
  vittima, carattere, alibi dichiarato, cronologia reale, segreto, indizio esclusivo,
  obiettivo secondario, capacità speciale.
- Il colpevole riceve una ricostruzione falsa già coerente e due cariche di depistaggio.
- Timer estendibili (×1.5, ×2) o disattivabili: con i timer spenti si avanza per consenso.
- Bacheca condivisa, taccuino privato, testimoni interrogabili a domanda libera,
  contraddizioni da smascherare mettendo a confronto due affermazioni.

### Contenuti

- Tre casi completi — *La Suite 404*, *L'Orologio Sommerso*, *L'Ultimo Valzer* — ciascuno
  con otto ruoli, sei o più ambienti, trenta o più indizi, dodici o più false piste,
  otto segreti, otto obiettivi, cronologia al minuto e **tre varianti** con colpevole,
  movente, metodo e distribuzione degli indizi diversi.
- Selezione della variante tramite seme deterministico: lo stesso seme produce sempre la
  stessa partita.

### Motore

- Grafo di deduzione con chiusura a punto fisso, insiemi di supporto minimali, conteggio
  dei percorsi indipendenti e individuazione degli indizi critici.
- Validatore con dieci controlli, eseguito da `pnpm validate:cases` e dalla suite di test.
- Punteggio deterministico con premi ironici; il Regista AI non può toccarlo.
- `RoomRuntime` puro: riceve il tempo, restituisce effetti. Gira identico in produzione,
  nei test e nelle simulazioni.

### Regista AI

- Interfaccia `AIProvider` con quattro implementazioni: deterministica (predefinita, senza
  rete), Claude, endpoint compatibile con l'API OpenAI, modello su dispositivo via MLX
  Swift nell'app iOS.
- Guardrail in uscita, schemi rigorosi per ogni risposta, sanificazione del testo dei
  giocatori, interruttore automatico dopo tre errori consecutivi e ricaduta immediata sul
  provider deterministico.
- Il gioco è completo e piacevole senza alcuna API esterna.

### Grafica e audio

- 289 asset originali generati da codice: logo animato, quattordici ambienti a quattro
  livelli di profondità, dodici ritratti con tre pose e quattro espressioni ciascuno,
  ventidue icone, carte, bacheca, timeline, cornice del verdetto, sipario, pianta
  dell'hotel, icone PWA e schermate di avvio. Nessuna risorsa remota, nessun asset di terzi.
- Identità sonora interamente sintetizzata: tema jazz notturno generativo, pioggia, mare,
  sala da ballo, corridoi, cucina e quindici effetti. Nessun file audio nel repository.

### Piattaforma

- PWA installabile con service worker scritto a mano, pagina offline e aggiornamenti
  controllati dall'utente: una partita non viene mai interrotta da un ricaricamento.
- Wrapper iOS Capacitor con plugin Swift per vibrazione, condivisione nativa e gestione del
  modello locale.
- Accessibilità: alto contrasto, quattro dimensioni di testo, riduzione del movimento,
  sottotitoli dei suoni, font ad alta leggibilità, navigazione completa da tastiera,
  supporto VoiceOver, timer estendibili.

### Qualità

- Lint, typecheck e test puliti; regola personalizzata che vieta segnaposti nel codice.
- Test unitari sul motore, di integrazione sulla stanza, end-to-end multi-browser,
  visual regression su quattro viewport, simulazioni e load test.
