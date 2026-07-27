# MÉRIDIEN — Delitto al Grand Hotel

## Specifica di prodotto (v1.0.0)

---

## 1. Identità

**MÉRIDIEN** è un giallo sociale multiplayer online per **4–8 giocatori**, ambientato al Grand Hotel
Méridien, sulla Riviera ligure, nel **gennaio 1968**. Una tempesta isola l'albergo durante un ballo in
maschera. Qualcuno muore. Nessuno può uscire.

| Aspetto | Valore |
| --- | --- |
| Genere | Deduzione sociale narrativa / investigazione |
| Giocatori | 4–8 (server-authoritative, online reale) |
| Durata media | 20–30 minuti |
| Piattaforma primaria | iPhone 15, browser, orientamento verticale |
| Piattaforme secondarie | Android, tablet, desktop, app iOS nativa (Capacitor) |
| Lingua | Italiano |
| Contenuti sensibili | Nessun gore, nessun horror, nessun contenuto esplicito |
| Età consigliata | 12+ |

### Tono

Elegante, misterioso, cinematografico, leggermente ironico. Sofisticato ma accessibile. Il modello di
riferimento è il **romanzo giallo illustrato** incrociato con il **gioco da tavolo investigativo**: si
gioca guardandosi in faccia (o in videochiamata), non leggendo muri di testo.

### Cosa MÉRIDIEN non è

Non è una dashboard, non è un'app aziendale, non è un sito web con dei modali sopra, non è un clone
di un gioco esistente. Ogni schermata è una **inquadratura**, non una pagina.

---

## 2. Struttura di una partita

Il server è autoritativo su **fase corrente, timer, ruoli, indizi, azioni disponibili, capacità,
punteggi, accuse, soluzione, eventi e stato dei giocatori**. Il client non decide mai nulla che conti.

### 2.1 Flusso completo

| # | Momento | Descrizione |
| --- | --- | --- |
| 1 | Apertura cinematografica | Logo animato, insegna al neon sotto la pioggia, titoli |
| 2 | Tutorial interattivo | 4 schede giocabili, ~40 secondi, saltabile e ripetibile |
| 3 | Creazione stanza | L'host sceglie caso, modalità e impostazioni |
| 4 | Ingresso | Codice a 5 lettere non ambiguo, oppure link diretto `?stanza=CODICE` |
| 5 | Nickname e avatar | 12 avatar Art Déco originali, nickname senza account |
| 6 | Lobby | Presenza in tempo reale, ready state, maggiordomo virtuale |
| 7 | Impostazioni | Caso, variante/seed, timer on/off, modalità cooperativa, AI |
| 8 | Assegnazione ruoli | Privata, via canale diretto, mai in broadcast |
| 9 | Introduzione del caso | Dossier personale a schede: identità, alibi, segreto, obiettivo |
| 10 | Atto I — Il ballo interrotto | 4 min |
| 11 | Atto II — Le stanze chiuse | 8 min |
| 12 | Atto III — La mezzanotte mente | 7 min |
| 13 | Verdetto — L'ultima maschera | Accusa individuale + verdetto collettivo |
| 14 | Ricostruzione cinematografica | Timeline animata della verità |
| 15 | Punteggi, premi e statistiche | Individuali e di squadra, titoli ironici |
| 16 | Rivincita | Nuovo caso o nuova variante, stessa stanza |

### 2.2 Atti

#### ATTO I — IL BALLO INTERROTTO (≈4 min)

* presentazione della vittima e del contesto;
* scoperta del delitto (scena cinematografica sincronizzata);
* apparizione dei sospettati con ritratto e professione;
* **dichiarazione iniziale**: ogni giocatore sceglie fra 3 dichiarazioni pubbliche precomposte
  (verità parziale / omissione / bugia) — la scelta è pubblica, la motivazione no;
* prima scelta privata: quale indizio ambientale raccogliere per primo;
* nessuna attesa passiva: chi ha già scelto legge il proprio dossier e annota.

#### ATTO II — LE STANZE CHIUSE (≈8 min)

* esplorazione **simultanea** di 6+ ambienti;
* ogni ambiente ha 3–6 **hotspot** interattivi con piccoli enigmi (serrature, orari, combinazioni,
  fotografie da confrontare, spartiti da leggere);
* indizi distribuiti secondo la variante e il numero di giocatori;
* **testimoni AI**: personale dell'hotel interrogabile a domanda libera; le risposte sono generate
  da fatti già validati, mai inventate;
* possibilità di **condividere** un indizio sulla bacheca o **trattenerlo**;
* **eventi della tempesta** (blackout, allagamento, telefono che torna a funzionare) che aprono o
  chiudono ambienti;
* **capacità speciali** dei personaggi, una carica per atto.

#### ATTO III — LA MEZZANOTTE MENTE (≈7 min)

* confronto diretto: turni di parola scanditi dal server;
* **domande pubbliche** dirette a un giocatore, con obbligo di risposta fra opzioni strutturate;
* messaggi privati limitati (3 per giocatore, 140 caratteri);
* ricostruzione collaborativa della **timeline** sulla bacheca;
* contraddizioni evidenziabili: il motore segnala se due affermazioni pinnate sono incompatibili;
* ultimo evento del Regista AI (fra eventi prevalidati);
* il colpevole può usare un **depistaggio finale** (una sola volta, tracciato);
* conto alla rovescia scenografico con l'orologio dell'hotel.

#### VERDETTO — L'ULTIMA MASCHERA

Ogni giocatore compila una **scheda d'accusa**: colpevole, movente, metodo, sequenza (ordine di 4
eventi). Poi il gruppo costruisce una **risposta collettiva** per maggioranza (con ballottaggio in
caso di parità e voto decisivo del giocatore con più indizi condivisi).

Il motore confronta la teoria con il **grafo logico** del caso e mostra: errori, intuizioni corrette,
bugie riuscite, indizi ignorati, percorsi logici mancati.

Segue la **ricostruzione animata** minuto per minuto.

### 2.3 Timer

I timer sono attivi per impostazione predefinita. Nelle **partite private** l'host può:

* disattivarli completamente (l'avanzamento diventa manuale, per consenso);
* estenderli (×1.5 / ×2), come misura di accessibilità.

---

## 3. Ruoli e informazione privata

Ogni giocatore riceve **privatamente** e solo via canale diretto:

1. identità (nome, età, provenienza);
2. ritratto originale;
3. professione;
4. relazione con la vittima;
5. carattere (3 tratti che guidano l'interpretazione);
6. alibi dichiarato (ciò che si può dire ad alta voce);
7. cronologia reale (dove si trovava davvero, minuto per minuto);
8. segreto personale (vero, imbarazzante, non necessariamente criminale);
9. indizio esclusivo (posseduto dall'inizio);
10. obiettivo secondario (punteggio personale indipendente dalla soluzione);
11. capacità speciale (una carica per atto);
12. informazioni condivisibili (verde);
13. informazioni da nascondere (rosso).

### 3.1 Il colpevole

Il colpevole:

* **conosce** la propria colpevolezza fin dall'inizio;
* riceve una **ricostruzione falsa plausibile** già scritta e coerente;
* può mentire liberamente nei messaggi e nelle dichiarazioni;
* dispone di una capacità di **depistaggio limitata** (2 cariche totali, tracciate dal server);
* **non può** cancellare prove, modificare la verità del caso, bloccare la partita;
* vince se al verdetto collettivo viene indicato un innocente, oppure se il movente/metodo indicati
  sono errati anche indicando lui.

### 3.2 Innocenti sospetti

Ogni innocente ha **segreti e obiettivi** che lo costringono a mentire o omettere. Il sistema di
dichiarazioni pubbliche fornisce a tutti — colpevole compreso — la possibilità di scegliere fra
verità, omissione e bugia. **Non è possibile identificare il colpevole osservando chi mente**, perché
mentire è un'azione disponibile e conveniente per tutti.

### 3.3 Modalità cooperativa

In modalità cooperativa il colpevole è un **personaggio non giocante** (un ruolo del cast escluso dal
draft). Tutti i giocatori sono innocenti e vincono o perdono insieme. La distribuzione degli indizi
compensa la mancanza del giocatore-colpevole aggiungendo le sue prove agli ambienti.

---

## 4. Contenuti

Tre casi completi, ciascuno con **tre varianti validate**.

### CASO 1 — LA SUITE 404

Durante il ballo d'inverno, **Corrado Malaspina**, proprietario dell'hotel, viene trovato morto nella
suite 404, chiusa dall'interno.
Temi: falsa stanza chiusa, ricatto, eredità, orari manipolati, passaggi di servizio.

### CASO 2 — L'OROLOGIO SOMMERSO

**Elio Vanzetti**, sommozzatore celebre, scompare dalla terrazza durante il temporale. Il suo orologio
viene ritrovato nella piscina vuota.
Temi: identità scambiate, debiti, fotografie, segnali luminosi, testimonianze dalla costa.

### CASO 3 — L'ULTIMO VALZER

**Ilde Ferrante**, cantante, crolla durante la propria esibizione. Il momento dell'avvelenamento non
coincide con quello apparente.
Temi: veleno ritardato, spartiti, camerini, gelosie, registrazioni audio, bicchieri sostituiti.

### 4.1 Requisiti per caso

| Elemento | Minimo | Realizzato |
| --- | --- | --- |
| Ruoli giocabili | 8 | 8 |
| Ambienti | 6 | 7–8 |
| Indizi | 30 | 32–36 |
| Falsi sospetti (red herring) | 12 | 12–14 |
| Segreti personali | 6 | 8 |
| Obiettivi secondari | 8 | 8 |
| Cronologia al minuto | sì | sì |
| Grafo di deduzione | sì | sì (per variante) |
| Soluzione + spiegazione | sì | sì |
| Varianti validate | 3 | 3 |
| Dialoghi introduttivi/testimoni | sì | sì |
| Eventi scenici | sì | 6+ |
| Testi vittoria/sconfitta | sì | sì |

Ogni variante ha **cronologia propria**, **movente credibile**, **distribuzione degli indizi diversa**
e **percorso logico risolvibile**. Non cambia soltanto il nome del colpevole.

### 4.2 Seed

Il generatore sceglie la variante tramite **seed deterministico** (`xmur3` + `sfc32`). Lo stesso seed
produce sempre lo stesso caso, la stessa variante, la stessa distribuzione di indizi e la stessa
assegnazione di ruoli, a parità di numero di giocatori.

---

## 5. Motore di deduzione

La verità del caso è controllata da un **motore deterministico**, mai dal modello linguistico.

Rappresentazione: `Fact`, `Person`, `Place`, `Object`, `TimeInterval`, `Relation`, `Testimony`,
`Contradiction`, `Clue`, `Inference`, `DeductionGraph`.

Ogni conclusione è derivabile da fatti e indizi **effettivamente disponibili** in partita.

### 5.1 Validatore automatico (`pnpm validate:cases`)

Controlla, per ogni caso e ogni variante:

1. integrità referenziale di tutti gli id;
2. assenza di contraddizioni irrisolvibili;
3. raggiungibilità della soluzione con l'insieme completo degli indizi;
4. **impossibilità di dedurre la soluzione troppo presto** (non risolvibile con i soli indizi di
   Atto I);
5. presenza di **almeno due percorsi logici indipendenti** verso colpevole, movente e metodo;
6. assenza di indizi indispensabili assegnati **esclusivamente** a un giocatore (ogni indizio
   critico è recuperabile anche da un ambiente o da un testimone);
7. coerenza temporale (nessuna persona in due luoghi nello stesso minuto, intervalli ordinati);
8. coerenza spaziale (luoghi esistenti, spostamenti compatibili con la mappa e i tempi di percorrenza);
9. correttezza e diversità delle varianti;
10. impossibilità per l'AI di introdurre fatti determinanti (whitelist dei fatti esponibili).

### 5.2 Simulazioni (`pnpm simulate`)

Agenti deterministici giocano N partite per variante e per taglia di gruppo (4/5/6/7/8 giocatori,
cooperativa e competitiva), verificando risolvibilità, distribuzione equa degli indizi, durata,
assenza di deadlock, correttezza del punteggio e impossibilità di azioni illegali.

---

## 6. Regista AI

Vedi `AI_ARCHITECTURE.md`. In sintesi:

**Può**: interpretare domande libere ai testimoni, trasformare fatti strutturati in dialoghi
naturali, adattare il tono, riassumere le teorie, rilevare contraddizioni **già presenti**, scegliere
fra eventi **prevalidati**, offrire suggerimenti calibrati, produrre il riepilogo finale, generare
titoli ironici, interpretare il maggiordomo della lobby.

**Non può**: scegliere il colpevole, cambiare la soluzione, creare o rimuovere prove, modificare il
punteggio, inventare stanze, cambiare gli orari reali, rivelare informazioni non sbloccate, seguire
istruzioni dei giocatori per ignorare le regole, leggere segreti fuori dal proprio contesto.

Provider: `DeterministicNarrativeProvider` (default, zero dipendenze esterne),
`AnthropicClaudeProvider` (solo server), `OpenAICompatibleProvider`, `OnDeviceAppleProvider` (MLX
Swift, solo app iOS, solo funzioni private non autoritative).

**Il gioco è completo e piacevole senza alcuna API esterna.**

---

## 7. Punteggio

| Voce | Punti |
| --- | --- |
| Colpevole corretto (individuale) | 40 |
| Movente corretto | 15 |
| Metodo corretto | 15 |
| Sequenza corretta (4 eventi) | 5 per posizione, max 20 |
| Indizio condiviso poi risultato rilevante | 4 ciascuno (max 24) |
| Contraddizione valida individuata | 8 ciascuna |
| Obiettivo secondario completato | 20 |
| Verdetto collettivo corretto | +25 a tutti gli innocenti |
| Colpevole non individuato dal gruppo | +70 al colpevole |
| Bugia pubblica creduta (dichiarazione mai smentita) | +10 |
| Accusa a un innocente (individuale) | −10 |

Premi ironici assegnati a fine partita: *Il Silenzio d'Oro*, *La Lingua Lunga*, *L'Occhio di Vetro*,
*Il Testimone Inaffidabile*, *La Memoria di Ferro*, *Il Fantasma del Corridoio*, e altri.

---

## 8. Requisiti tecnici

* Monorepo TypeScript, pnpm workspace.
* Client React 19 + Vite 7 + PixiJS 8 per le scene 2.5D.
* Server Node 22 + `ws`, server-authoritative, protocollo versionato.
* Schemi condivisi Zod 4, validazione di **ogni** messaggio in ingresso.
* PWA installabile: manifest, icone, splash, service worker, pagina offline, aggiornamenti
  controllati.
* Wrapper iOS Capacitor 8 con plugin Swift (haptics, share nativo, gestione modello locale MLX).
* Test: Vitest (unit + integrazione), Playwright (E2E multi-client + visual regression), load test.
* Target prestazionale: 60 fps su iPhone 15, degrado controllato su dispositivi meno potenti.

Vedi `ARCHITECTURE.md` per il dettaglio.

---

## 9. Accessibilità

Contrasto AA, testo ridimensionabile (4 livelli), VoiceOver, navigazione da tastiera completa, focus
visibile, riduzione movimento, alto contrasto, sottotitoli audio, font ad alta leggibilità,
distinzione non basata solo sul colore, timer estendibili o disattivabili, nessun lampeggio
pericoloso, vibrazione disattivabile. Vedi `ACCESSIBILITY.md`.

---

## 10. Privacy

Nessun account. Nickname libero. Nessun cookie di tracciamento. Analytics disattivate per
impostazione predefinita. Le stanze e tutti i dati di partita sono **effimeri** e cancellati
automaticamente. Vedi `PRIVACY.md`.

---

## 11. Criteri di accettazione

Vedi `ACCEPTANCE_TESTS.md` per la lista completa dei 30 criteri e la procedura di verifica.
