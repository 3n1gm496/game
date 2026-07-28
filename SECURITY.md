# SECURITY — MÉRIDIEN

## 1. Principio

Il client è un terminale ostile fino a prova contraria. Ogni messaggio in ingresso viene
parsato con Zod prima di toccare la logica; ogni azione viene ricontrollata contro la fase
corrente, i permessi del giocatore e lo stato della stanza; nessuna informazione riservata
attraversa il confine.

## 2. Superficie di attacco e difese

| Vettore | Difesa | Dove |
| --- | --- | --- |
| Messaggio malformato | `ClientMessageSchema.safeParse` prima di qualunque logica | `apps/server/src/index.ts` |
| Messaggio gigante | `maxPayload: 16 KiB` sul WebSocket + controllo di lunghezza | `apps/server/src/index.ts` |
| Azione fuori fase | il runtime confronta sempre `state.phase` | `packages/engine/src/room/runtime.ts` |
| Azione non permessa | controlli espliciti host/proprietario/destinatario | idem |
| Doppio invio (rete instabile, doppio tap) | finestra LRU di 64 `actionId` per giocatore | idem |
| Flood di azioni | token bucket 30 gettoni, ricarica 3/s, costo per tipo | `apps/server/src/limits.ts` |
| Flood di connessioni | token bucket 20/min per indirizzo | `apps/server/src/index.ts` |
| Enumerazione delle stanze | codice da 32⁵ ≈ 33,5 M combinazioni + 10 tentativi/min per indirizzo | `limits.ts`, `rng.ts` |
| Furto di sessione | token da 24 byte casuali, valido finché la stanza vive, una sola connessione per giocatore | `apps/server/src/rooms.ts` |
| Attraversamento di percorso | `safeJoin()` normalizza e verifica il prefisso | `apps/server/src/http.ts` |
| XSS | React esce già con escape; CSP senza `unsafe-eval` in produzione; nessun `innerHTML` nel codice | `config.ts`, `index.html` |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` | `config.ts` |
| Sniffing di tipo | `X-Content-Type-Options: nosniff` | `config.ts` |
| Prompt injection | sanificazione + delimitatori + contesto ristretto + guardrail in uscita | `AI_ARCHITECTURE.md` § 6 |
| Fuga di chiavi nei log | oscuramento automatico di chiavi, token e stringhe `sk-…` | `apps/server/src/log.ts` |
| Chiave nel bundle client | i provider esterni rifiutano di attivarsi se rilevano `window`; `scripts/check-secrets.mjs` scandaglia il bundle | `packages/ai/src/providers/`, `scripts/` |
| Insulti e spam in chat | filtro minimo di lunghezza, ripetizione e termini non ammessi | `apps/server/src/limits.ts` |
| Stanze abbandonate | chiusura dopo 20 min senza connessioni, 3 h di vita massima | `apps/server/src/rooms.ts` |

## 3. Ciò che il client non riceve mai

Il server costruisce due viste distinte a partire dallo stato:

* `publicView()` — quello che vedono tutti;
* `privateView(playerId)` / `privateBrief(playerId)` — quello che vede **una sola persona**.

Non attraversano mai il confine:

* la soluzione del caso (colpevole, movente, metodo, sequenza) prima dell'epilogo;
* l'identificativo della variante prima dell'epilogo;
* i segreti, gli alibi veri e le cronologie degli altri giocatori;
* la ricostruzione falsa del colpevole, che riceve solo lui;
* il taccuino privato altrui;
* i prompt di sistema, le chiavi, le variabili d'ambiente.

Un test di integrazione (`apps/server/src/__tests__/room.test.ts` → «Riservatezza»)
attraversa una partita intera e verifica che nessuna di queste stringhe compaia nello stato
pubblico serializzato, e che il colpevole non sia distinguibile dagli altri per forma dei
dati.

## 4. Content Security Policy

Servita sia dall'header HTTP sia da un `<meta>` nel documento statico:

```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:;
media-src 'self' data: blob:; worker-src 'self' blob:; object-src 'none';
base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
```

`style-src 'unsafe-inline'` è necessario perché React applica stili in linea per la
posizione degli hotspot. Nessun `script-src 'unsafe-inline'` in produzione, nessun
`unsafe-eval`, nessuna origine esterna: gli asset sono tutti nel bundle.

## 5. Segreti

Nessun segreto è nel repository. Tutto passa da variabili d'ambiente del **server**
(`.env.example` le elenca tutte, senza valori). `scripts/check-secrets.mjs` cerca chiavi
Anthropic, OpenAI, AWS, GitHub, token Bearer, chiavi private e riferimenti a certificati di
firma in ogni file versionato e nel bundle costruito; fa parte di `pnpm deploy:*` e del
workflow di CI.

Rotazione: le chiavi vivono solo nell'ambiente del processo. Cambiarle richiede un riavvio,
non una modifica al codice. I `sessionToken` decadono con la stanza (massimo 3 ore) e
vengono cancellati alla chiusura.

## 6. Privacy by design

Vedi `PRIVACY.md`. In breve: nessun account, nessuna e-mail, nessun cookie di tracciamento,
nessuna analytics attiva, dati di partita interamente in memoria e cancellati alla chiusura
della stanza.

## 7. Revisione

Controlli eseguiti su questa versione:

| Controllo | Esito |
| --- | --- |
| `pnpm lint` (incluso il divieto di segnaposti) | pulito |
| `pnpm typecheck` | pulito |
| `node scripts/check-secrets.mjs` | nessun segreto |
| Test «Azioni illegali» (rifiuto fuori fase, fuori permesso, destinatario non valido) | superato |
| Test «Riservatezza» (nessuna fuga in una partita completa) | superato |
| Test dei guardrail AI | superato |
| Dipendenze runtime | `zod`, `ws`, `react`, `react-dom`, `pixi.js`, `motion`, `zustand` — tutte mantenute attivamente |

Non sono note vulnerabilità critiche.

## 8. Segnalazioni

Le vulnerabilità vanno segnalate in privato all'indirizzo indicato nel repository, non
tramite issue pubbliche. Non sono ammesse prove di carico o di penetrazione contro istanze
pubbliche senza autorizzazione: `pnpm test:load` esiste apposta e gira in locale.
