# TASK LIST — MÉRIDIEN

Stato aggiornato durante lo sviluppo. `✅` fatto · `🔄` in corso · `⬜` da fare.

## Fase 0 — Progettazione

- ✅ Esame dell'ambiente (Node 22.22, pnpm 10.33, registry raggiungibile)
- ✅ Verifica versioni stabili delle dipendenze
- ✅ `GAME_SPEC.md`
- ✅ `ARCHITECTURE.md`
- ✅ `ART_DIRECTION.md`
- ✅ `NARRATIVE_BIBLE.md`
- ✅ `ACCEPTANCE_TESTS.md`
- ✅ `TASKS.md`

## Fase 1 — Scaffold

- ✅ pnpm workspace, tsconfig base, ESLint 9 flat config, Prettier
- ✅ Script npm completi (install/dev/build/lint/typecheck/test/e2e/visual/load/validate/generate/deploy/ios)
- ✅ `.env.example`

## Fase 2 — Motore condiviso (`packages/engine`)

- ✅ RNG deterministico seeded (`xmur3` + `sfc32`)
- ✅ Schemi Zod del caso, del protocollo e delle risposte AI
- ✅ Timeline e coerenza spazio-temporale
- ✅ Grafo di deduzione, chiusura, percorsi indipendenti
- ✅ Distribuzione seeded di ruoli e indizi
- ✅ Punteggio e premi
- ✅ Validatore dei casi (10 controlli)
- ✅ `RoomRuntime` puro (macchina a stati autoritativa)
- ✅ Token di design condivisi

## Fase 3 — Contenuti (`packages/content`)

- ✅ Caso 1 — La Suite 404 (8 ruoli, 8 ambienti, 36 indizi, 3 varianti)
- ✅ Caso 2 — L'Orologio Sommerso (8 ruoli, 7 ambienti, 34 indizi, 3 varianti)
- ✅ Caso 3 — L'Ultimo Valzer (8 ruoli, 7 ambienti, 34 indizi, 3 varianti)
- ✅ Testimoni, eventi scenici, testi di vittoria/sconfitta
- ✅ Entry point pubblico separato per il client (`@meridien/content/public`)

## Fase 4 — Server (`apps/server`)

- ✅ Trasporto WebSocket + registry stanze
- ✅ Codici stanza non ambigui, link d'invito
- ✅ Sessioni, heartbeat, riconnessione, host migration
- ✅ Idempotenza, rate limiting, moderazione minima
- ✅ Redistribuzione degli indizi critici
- ✅ Health, metriche, log strutturati
- ✅ Proxy AI server-side

## Fase 5 — Regista AI (`packages/ai`)

- ✅ Interfaccia `AIProvider` + schemi di risposta
- ✅ `DeterministicNarrativeProvider` (catalogo di 400+ frammenti)
- ✅ `AnthropicClaudeProvider` (solo server)
- ✅ `OpenAICompatibleProvider`
- ✅ `OnDeviceAppleProvider` (bridge Capacitor → MLX Swift)
- ✅ Guardrail: sandbox del contesto, anti prompt-injection, fallback immediato

## Fase 6 — Grafica (`tools/generate-assets`)

- ✅ Token → CSS
- ✅ Logo animato, 11 ambienti a livelli, 12 ritratti × pose × espressioni
- ✅ Carte personaggio, carte indizio, oggetti, icone
- ✅ Mappa, bacheca, timeline, schermate di verdetto
- ✅ Icone PWA, splash iOS, atlas

## Fase 7 — Client (`apps/web`)

- ✅ Design system e componenti di base
- ✅ Apertura cinematografica, tutorial, lobby, dossier
- ✅ Scene 2.5D Pixi con parallasse, pioggia, riflessi
- ✅ Atti I/II/III, taccuino, bacheca, timeline
- ✅ Verdetto, ricostruzione, punteggi, rivincita
- ✅ Audio procedurale + mixer + sottotitoli
- ✅ PWA, offline, aggiornamenti controllati
- ✅ Accessibilità completa
- ✅ Pannello diagnostico di sviluppo

## Fase 8 — iOS (`apps/ios`)

- ✅ Configurazione Capacitor, icone, splash
- ✅ Plugin Swift: haptics, share, gestione modello MLX
- ✅ Documentazione firma e TestFlight, workflow GitHub Actions

## Fase 9 — Test

- ✅ Unit: engine, RNG, timeline, deduzione, scoring, schemi, guardrail
- ✅ Integrazione: stanza, ruoli, indizi, fasi, accuse, verdetto, disconnessione, host migration
- ✅ E2E Playwright: 4 e 8 giocatori, disconnessioni, refresh, rete lenta, rivincita, PWA
- ✅ Visual regression su 4 viewport
- ✅ Simulazioni: 9 varianti × 5 taglie × 2 modalità
- ✅ Load test: stanze concorrenti, con verifica che i client entrino davvero
- ✅ Test del foglio icone e della corrispondenza fra nomi dei contenuti e simboli

## Fase 10 — Rilascio

- ✅ `README.md` e documentazione completa
- ✅ Health endpoint, versionamento protocollo, gestione client obsoleto
- ✅ Dockerfile, configurazione preview/production, rollback
- ✅ Verifica finale end-to-end su build di produzione
- ✅ Osservazione diretta del gioco avviato: partita vera su quattro browser, schermate
      guardate una per una, difetti corretti (icone, contrasto sulla carta, avvisi
      invadenti, facciata inutilizzata, catalogo ripetuto sulla rete)
