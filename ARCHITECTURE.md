# ARCHITECTURE — MÉRIDIEN

## 1. Vista d'insieme

```
                     ┌────────────────────────────────────────────┐
                     │            apps/web  (browser / PWA)       │
                     │  React 19 · Vite 7 · PixiJS 8 · Zustand    │
                     │  ┌──────────┬───────────┬───────────────┐  │
                     │  │  Scene   │    UI     │  Audio engine │  │
                     │  │ 2.5D Pixi│  screens  │  WebAudio     │  │
                     │  └──────────┴───────────┴───────────────┘  │
                     │        client store (read-only mirror)     │
                     └───────────────┬────────────────────────────┘
                                     │ WebSocket (JSON, versionato)
                                     ▼
                     ┌────────────────────────────────────────────┐
                     │       apps/server  (Node 22 + ws)          │
                     │  RoomRegistry → Room (autoritativa)        │
                     │  ├ macchina a stati fasi/timer             │
                     │  ├ distribuzione indizi                    │
                     │  ├ accuse, verdetto, punteggio             │
                     │  ├ rate limit / idempotenza / auth         │
                     │  └ AI Director (server-side, sandboxed)    │
                     └───────────────┬────────────────────────────┘
                                     │
             ┌───────────────────────┼─────────────────────────┐
             ▼                       ▼                         ▼
   ┌──────────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │ packages/engine  │   │ packages/content   │   │ packages/ai        │
   │ schemi Zod       │   │ 3 casi × 3 varianti│   │ AIProvider + 4 impl│
   │ deduzione        │   │ dati puri tipizzati│   │ guardrail          │
   │ scoring, RNG     │   │                    │   │ schemi risposta    │
   │ protocollo       │   │                    │   │                    │
   └──────────────────┘   └────────────────────┘   └────────────────────┘
```

`apps/ios` è un wrapper Capacitor che incapsula la build di `apps/web` e aggiunge plugin nativi
(haptics, share, modello locale MLX).

## 2. Struttura del monorepo

```
meridien/
├── packages/
│   ├── engine/        @meridien/engine    — nessuna dipendenza runtime oltre zod
│   ├── content/       @meridien/content   — dati puri, dipende solo da engine (tipi)
│   └── ai/            @meridien/ai        — provider AI, dipende da engine
├── apps/
│   ├── server/        @meridien/server    — Node + ws
│   ├── web/           @meridien/web       — React + Vite + Pixi
│   └── ios/           progetto Capacitor + plugin Swift
├── tools/
│   ├── validate-cases/  @meridien/validate-cases
│   ├── simulate/        @meridien/simulate
│   ├── generate-assets/ @meridien/generate-assets
│   └── loadtest/        @meridien/loadtest
├── tests/             @meridien/tests     — Playwright E2E + visual
└── scripts/           script di sviluppo/deploy in Node ESM
```

### Regole di dipendenza

| Da → A | engine | content | ai | server | web |
| --- | --- | --- | --- | --- | --- |
| engine | — | ✗ | ✗ | ✗ | ✗ |
| content | ✓ | — | ✗ | ✗ | ✗ |
| ai | ✓ | ✓ | — | ✗ | ✗ |
| server | ✓ | ✓ | ✓ | — | ✗ |
| web | ✓ | ✓ | ✗ | ✗ | — |

`engine` non dipende da nulla di specifico della piattaforma: gira identico su Node e nel browser.
Il client importa `content` **solo** per testi non sensibili (titoli dei casi, nomi degli ambienti,
copertine): la soluzione e i segreti non attraversano mai il bundle client perché la distribuzione
avviene per messaggio privato dal server.

> Nota: `packages/content` esporta due entry point, `@meridien/content` (completo, server) e
> `@meridien/content/public` (catalogo non sensibile, client). Il bundle web importa solo il secondo;
> un test automatico (`packages/content/src/__tests__/client-safety.test.ts`) verifica che l'entry
> pubblico non contenga soluzioni, segreti o testi del colpevole.

## 3. Scelte tecnologiche e motivazioni

| Scelta | Alternativa suggerita | Motivazione |
| --- | --- | --- |
| **Node 22 + `ws`** per il server autoritativo | Cloudflare Workers + Durable Objects | La logica della stanza è scritta come classe pura (`Room`) indipendente dal trasporto: `RoomRuntime` riceve il tempo e invia i messaggi tramite interfacce iniettate. Questo permette (a) test unitari senza rete, (b) esecuzione locale con `pnpm dev:multiplayer` senza servizi cloud, (c) esecuzione E2E deterministica in CI. Un adattatore Durable Object è documentato in `DEPLOYMENT.md`: la stessa classe `Room` si monta su DO cambiando solo lo strato di trasporto e di storage. La scelta di Node come default è motivata dal requisito «modalità locale di sviluppo senza servizi cloud esterni» e dalla necessità che i test E2E multi-client girino in questo ambiente. |
| **TypeScript 5.9.3** invece di 7.x | ultima major | `typescript-eslint@8` dichiara `peerDependencies.typescript: ">=4.8.4 <6.1.0"`. TypeScript 7 non è ancora supportato dalla toolchain di lint. 5.9.3 è l'ultima 5.x stabile. |
| **Zustand** per lo stato client | Redux / context | Store minimale, nessun boilerplate, ottimo per un mirror read-only dello stato server. |
| **PixiJS 8** per le scene | Phaser | Serve un renderer di scene 2.5D con parallasse e filtri, non un motore di gioco con fisica e tilemap. Pixi è più leggero e si integra meglio dentro React. |
| **WebAudio nativo** invece di Howler | Howler | L'audio è **sintetizzato proceduralmente** (nessun file audio con licenza da verificare): serve accesso diretto a oscillatori, filtri e convolver, non un player di sample. |
| **Motion (framer-motion) 12** per le transizioni UI | CSS puro | Transizioni orchestrate fra schermate, `AnimatePresence` per le tendine, rispetto automatico di `prefers-reduced-motion`. |
| **Vite 7** | Vite 8 | Vite 8 richiede allineamenti di plugin ancora in corso; 7.x è la linea stabile con `vite-plugin-pwa@1` e `@vitejs/plugin-react@5`. |

## 4. Il motore (`packages/engine`)

### 4.1 Moduli

| Modulo | Responsabilità |
| --- | --- |
| `rng.ts` | `xmur3` + `sfc32`: RNG deterministico seeded, `shuffle`, `pick`, `weightedPick` |
| `schema/case.ts` | Schemi Zod per `CaseDefinition`, `Variant`, `Clue`, `Role`, `Location`, … |
| `schema/protocol.ts` | Messaggi client↔server, versione protocollo, discriminated union |
| `schema/ai.ts` | Schemi rigorosi di ogni risposta AI |
| `deduction.ts` | Grafo di inferenza, chiusura deduttiva, percorsi indipendenti, contraddizioni |
| `timeline.ts` | Intervalli, sovrapposizioni, coerenza spaziale, matrice di adiacenza |
| `distribution.ts` | Assegnazione ruoli e indizi seeded, con vincoli di equità e ridondanza |
| `scoring.ts` | Calcolo punteggi individuali/squadra, premi |
| `validator.ts` | I 10 controlli di `validate:cases` |
| `room/state.ts` | Tipo dello stato di stanza + viste pubbliche/private |
| `room/runtime.ts` | Macchina a stati autoritativa, pura, testabile senza rete |
| `room/actions.ts` | Riduttori delle azioni giocatore, con controlli di legalità |

### 4.2 Determinismo

`RoomRuntime` è **puro**: riceve `now()` dall'esterno e restituisce una lista di effetti
(`Effect[] = Broadcast | Direct | Schedule | Persist`). Il trasporto li esegue. Questo rende la
simulazione di 10 000 partite istantanea e i test riproducibili.

### 4.3 Grafo di deduzione

Ogni variante definisce `inferences: Inference[]`.

```ts
interface Inference {
  id: string;
  text: string;          // "La porta non era chiusa dall'interno"
  concludes: 'culprit' | 'motive' | 'method' | 'sequence' | 'support';
  paths: string[][];     // ogni path = insieme di nodi prerequisito (AND)
                         // più path = alternative (OR)
}
```

Un nodo è *derivabile* se è un fatto noto, un indizio posseduto o un'inferenza con almeno un path
interamente derivabile. `closure()` calcola il punto fisso. `independentPaths()` conta i path
disgiunti per i nodi conclusivi (requisito: ≥ 2 per `culprit`, `motive`, `method`).

## 5. Protocollo

Trasporto: WebSocket, JSON, un messaggio per frame.

```
PROTOCOL_VERSION = 1
```

Al `join` il client invia la propria versione. Se non combacia, il server risponde
`error/client-outdated` e il client mostra la schermata «Aggiorna il gioco» con pulsante di reload
che invalida il service worker.

### 5.1 Messaggi client → server

`hello`, `createRoom`, `joinRoom`, `setProfile`, `setReady`, `updateSettings`, `startGame`,
`advancePhase`, `declare`, `investigate`, `solveHotspot`, `askWitness`, `shareClue`, `pinToBoard`,
`unpin`, `linkOnBoard`, `privateMessage`, `publicQuestion`, `answerQuestion`, `useAbility`,
`saveNote`, `submitAccusation`, `voteVerdict`, `requestHint`, `requestRecap`, `rematch`,
`kickPlayer`, `pause`, `resume`, `heartbeat`, `resume` (riconnessione con `sessionToken`).

Ogni azione mutante porta un `actionId` (ULID client) usato per **idempotenza**: il server tiene una
finestra LRU di 256 `actionId` per giocatore e ignora i duplicati restituendo l'esito già calcolato.

### 5.2 Messaggi server → client

`welcome`, `roomSnapshot`, `roomPatch`, `privateBrief`, `privatePatch`, `clueGranted`, `boardUpdate`,
`chat`, `phaseChanged`, `tick`, `sceneEvent`, `witnessReply`, `questionAsked`, `answerGiven`,
`abilityResult`, `accusationAck`, `verdictResult`, `scoreboard`, `error`, `pong`, `kicked`,
`hostChanged`, `roomClosed`.

`roomSnapshot` è lo stato pubblico completo; `roomPatch` è un delta JSON minimale. Alla riconnessione
si riceve sempre uno snapshot completo più il `privateBrief`.

### 5.3 Separazione pubblico/privato

`RoomState` contiene `secretState` (soluzione, segreti, mano di indizi di ciascun giocatore). Il
server non serializza **mai** `secretState` verso il client: le viste sono costruite da
`publicView(state)` e `privateView(state, playerId)`. Un test di integrazione
(`no-leak.test.ts`) attraversa una partita completa e verifica che nessun messaggio in uscita
contenga il nome del colpevole prima del verdetto, né segreti altrui.

## 6. Ciclo di vita di una stanza

```
       createRoom
           │
           ▼
      ┌─────────┐  startGame   ┌────────┐  auto  ┌──────┐  auto  ┌──────┐
      │  LOBBY  │─────────────▶│ BRIEF  │───────▶│ ACT1 │───────▶│ ACT2 │
      └─────────┘              └────────┘        └──────┘        └──────┘
           ▲                                                         │
           │ rematch                                                 ▼
      ┌───────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐  ┌──────┐
      │ SCOREBOARD│◀──│EPILOGUE │◀──│ VERDICT  │◀──│ACCUSATION│◀─│ ACT3 │
      └───────────┘   └─────────┘   └──────────┘   └──────────┘  └──────┘
```

* **Timer**: ogni fase ha `endsAt`. Il server programma un `Schedule` e avanza da solo. Con i timer
  disattivati, l'avanzamento richiede il consenso della maggioranza (`advancePhase`).
* **Pausa**: solo l'host; congela `endsAt` spostandolo in avanti alla ripresa.
* **Host migration**: alla disconnessione dell'host, il server promuove il giocatore connesso da più
  tempo e invia `hostChanged`.
* **Riconnessione**: `sessionToken` (32 byte random, HMAC del roomId) valido finché la stanza vive.
  Alla `resume` il giocatore riprende il proprio ruolo, la propria mano e le proprie note.
* **Disconnessione e indizi critici**: se un giocatore che detiene un indizio *critico* resta
  disconnesso oltre 45 secondi, il server esegue `redistributeCriticalClues()` che pubblica l'indizio
  come «ritrovamento» in un ambiente coerente, con un evento scenico dedicato («La cameriera consegna
  alla reception una busta trovata nella stanza 212»). Il caso resta sempre risolvibile.
* **Chiusura**: stanza chiusa dopo 20 minuti senza connessioni, o 3 ore di vita massima.

## 7. Sicurezza applicata all'architettura

* Ogni messaggio in ingresso è parsato con Zod prima di toccare la logica; il parsing fallito
  produce `error/bad-request` e incrementa un contatore di abuso.
* Rate limit a token bucket per socket (30 azioni/10 s) e per tipo (chat 5/10 s, witness 3/30 s).
* Codici stanza da alfabeto non ambiguo (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, esclusi `I O 0 1`),
  5 caratteri → 32⁵ ≈ 33,5 M combinazioni; tentativi di join errati limitati a 10/min per IP per
  impedire l'enumerazione.
* Nessun segreto nel client. Le chiavi AI vivono solo in `process.env` del server.
* CSP restrittiva servita sia dal server sia via `<meta>` nel build statico.

Dettagli in `SECURITY.md`.

## 8. Prestazioni

* Code splitting per schermata (`React.lazy`) e per scena Pixi.
* Un solo `Application` Pixi riusato fra scene; `destroy()` esplicito dei layer alla transizione
  (test di rivincita verifica che il numero di `Texture` non cresca).
* Texture atlas generato da `pnpm generate:assets` (`atlas.png` + `atlas.json`).
* Livelli di qualità automatici: `high` (pioggia + riflessi + bloom), `medium` (pioggia ridotta),
  `low` (statico) scelti da un benchmark di 30 frame all'avvio, con override manuale.
* Nessun polling: solo WebSocket + `tick` server ogni secondo durante gli atti.
* Pannello diagnostico (`?diag=1` in sviluppo): fps, memoria stimata, RTT, messaggi/s, versione,
  seed, stato stanza.

## 9. Ambienti

| Ambiente | Web | Server | Note |
| --- | --- | --- | --- |
| development | `vite dev` :5173 | `tsx watch` :8787 | `pnpm dev:multiplayer` avvia entrambi |
| preview | build statica servita dal server Node | stesso processo | `pnpm build && pnpm start` |
| production | statico su CDN o servito dal server | Node (Docker/Fly/Render) o Durable Object | `DEPLOYMENT.md` |

`GET /health` → `{ status, version, protocol, uptime, rooms, players }`.
`GET /metrics` → metriche testuali (stanze, giocatori, messaggi, errori) protette da
`METRICS_TOKEN` se impostato.
