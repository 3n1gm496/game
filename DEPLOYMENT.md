# DEPLOYMENT — MÉRIDIEN

## 1. L'artefatto

Un solo processo Node serve **tutto**: la build statica del client, il WebSocket della
partita, `/health` e `/metrics`. Non serve un reverse proxy, non serve un database, non
serve Redis. Lo stato delle stanze vive in memoria ed è effimero per progetto.

```bash
pnpm install
pnpm build          # client + server + pacchetti
pnpm start          # → http://localhost:8787
```

Questa è già la preview di produzione, e gira ovunque ci sia Node ≥ 20.11.

## 2. Ambienti

| Ambiente | Come si avvia | `NODE_ENV` | Note |
| --- | --- | --- | --- |
| **development** | `pnpm dev:multiplayer` | `development` | Vite su 5173 con proxy verso 8787, ricaricamento del server, pannello diagnostico con `?diag=1`, service worker disattivato |
| **preview** | `pnpm build && pnpm start` | `preview` | Artefatto reale, sorgenti mappate, CSP di produzione |
| **production** | come sopra con `NODE_ENV=production` | `production` | CSP senza `unsafe-inline` sugli script, HSTS attivo, sorgenti non mappate |

## 3. Pubblicazione

```bash
pnpm deploy:preview      # lint + typecheck + test + validate + check-secrets + build
pnpm deploy:production
```

Lo script esegue **sempre** tutti i controlli e la build. Poi, se `MERIDIEN_DEPLOY_PROVIDER`
non è impostato, si ferma e stampa esattamente quali variabili servirebbero. L'artefatto
resta pronto e verificato: manca solo il passo che richiede un segreto.

| Provider | Variabili necessarie |
| --- | --- |
| `fly` | `FLY_API_TOKEN` |
| `render` | `RENDER_API_KEY`, `RENDER_SERVICE_ID` |
| `docker` | `MERIDIEN_REGISTRY`, `MERIDIEN_REGISTRY_USER`, `MERIDIEN_REGISTRY_PASSWORD` |

### Docker

```dockerfile
# Dockerfile incluso nel repository
docker build -t meridien .
docker run -p 8787:8787 -e NODE_ENV=production meridien
```

## 4. Health e metriche

`GET /health` → sempre pubblico, senza dati sensibili:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "protocol": 1,
  "uptimeSeconds": 3612,
  "rooms": 4,
  "players": 17,
  "staticBuild": true
}
```

`GET /metrics` → formato testuale, compatibile con Prometheus. Se `METRICS_TOKEN` è
valorizzato serve `?token=…`.

```
meridien_rooms 4
meridien_players 17
meridien_messages_total 128340
meridien_errors_total 3
meridien_connections_total 212
meridien_ai_fallbacks_total 0
meridien_uptime_seconds 3612
```

Un controllo di liveness ragionevole: `GET /health` ogni 30 s, soglia 3 fallimenti.

## 5. Versione del protocollo e client obsoleti

Il client dichiara `PROTOCOL_VERSION` nel primo messaggio. Se non combacia, il server
risponde `error/client-outdated` con `fatal: true` e chiude la connessione; il client mostra
una barra con «Aggiorna il gioco» e un pulsante che ricarica invalidando il service worker.

Questo permette un rilascio senza finestra di manutenzione: chi ha una partita in corso la
finisce sul processo vecchio, chi apre dopo prende il nuovo.

**Regola**: `PROTOCOL_VERSION` si incrementa solo per modifiche che rompono la
compatibilità. Aggiungere un campo facoltativo a un messaggio esistente non la rompe.

## 6. Aggiornamenti del client

Il service worker **non** si sostituisce da solo. Quando è pronta una versione nuova resta
in attesa e le impostazioni mostrano «C'è una versione nuova → Aggiorna adesso». Una partita
non viene mai interrotta da un ricaricamento a sorpresa.

La cache è versionata (`meridien-v1-*`): all'attivazione le versioni precedenti vengono
cancellate.

## 7. Rollback

Lo stato è effimero: non ci sono migrazioni da annullare e nessun dato da recuperare.

1. Ripubblicare il tag precedente (`docker run …:previous`, `flyctl releases rollback`,
   oppure il pulsante di rollback del provider).
2. Le stanze aperte sul processo vecchio si chiudono con esso; i client si riconnettono e
   trovano la stanza chiusa, con un messaggio diegetico.
3. Se il rollback attraversa un cambio di `PROTOCOL_VERSION`, i client aggiornati vedranno
   «Aggiorna il gioco» e un reload li riporta alla versione servita.

Tempo di ripristino: quanto ci mette il provider a far ripartire un container. Nessun passo
manuale.

## 8. Cloudflare Workers e Durable Objects

`ARCHITECTURE.md` § 3 spiega perché il default è Node. La classe `RoomRuntime` è pura e non
conosce il trasporto: per montarla su un Durable Object servono tre cose, e nessuna tocca la
logica di gioco.

1. **Trasporto** — sostituire `apps/server/src/rooms.ts` con un DO che tiene
   `RoomRuntime` in memoria e applica gli stessi `Effect[]` usando `WebSocketPair` e
   `state.acceptWebSocket()`.
2. **Tempo** — `now: () => Date.now()` resta valido; al posto di `setInterval` si usa
   `state.storage.setAlarm()` per far scattare `tick()`.
3. **Persistenza** — nessuna: lo stato vive nel DO per la durata della stanza, esattamente
   come oggi vive in memoria.

Il resto — motore, contenuti, provider AI, client — non cambia di una riga.

## 9. Lista di controllo prima di pubblicare

```bash
pnpm verify                 # lint + typecheck + test + validate:cases
node scripts/check-secrets.mjs
pnpm test:e2e               # partita reale con quattro client
pnpm build && pnpm start    # e giocarci davvero, due dispositivi
```

Più i trenta criteri di `ACCEPTANCE_TESTS.md`.
