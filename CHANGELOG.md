# CHANGELOG

Le versioni seguono [Semantic Versioning](https://semver.org/lang/it/).
La versione del **protocollo** client-server è separata e cambia solo quando rompe la
compatibilità: oggi è `1`.

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
