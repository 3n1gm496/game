# MÉRIDIEN — Delitto al Grand Hotel

> Riviera ligure, 1968. Una mareggiata chiude la strada, il ballo in maschera continua,
> e al quarto piano una porta resta chiusa più del dovuto.

Giallo sociale multiplayer online per **4–8 giocatori**. Una partita dura 20–30 minuti.
Si gioca dal telefono, dal tablet o dal browser; si installa come app; funziona anche
senza alcuna intelligenza artificiale esterna.

---

## Avvio rapido

Servono **Node ≥ 20.11** e **pnpm ≥ 10**. Nient'altro.

```bash
git clone <questo-repository> meridien
cd meridien
pnpm install          # 1. installa tutto
pnpm dev:multiplayer  # 2. avvia server e client insieme
```

Il terminale stampa due indirizzi:

```
 Su questo computer   http://localhost:5173
 Da un altro device   http://192.168.x.x:5173
```

Apri il primo su un dispositivo, il secondo su un altro (o semplicemente due schede del
browser), **crea una stanza** da uno ed **entra con il codice** dall'altro. Servono almeno
quattro giocatori per cominciare: per provare da solo apri quattro schede.

### Preview di produzione

```bash
pnpm build && pnpm start   →  http://localhost:8787
```

Il server serve la build statica del client e il WebSocket sulla stessa porta: è
l'artefatto che va in produzione, e gira senza alcun servizio esterno.

---

## Comandi

| Comando | Cosa fa |
| --- | --- |
| `pnpm install` | installa tutte le dipendenze del monorepo |
| `pnpm dev` | solo il client, in sviluppo (porta 5173) |
| `pnpm dev:server` | solo il server, con ricaricamento (porta 8787) |
| `pnpm dev:multiplayer` | **entrambi**, con gli indirizzi di rete pronti |
| `pnpm build` | build di client, server e pacchetti |
| `pnpm start` | avvia il server sulla build di produzione |
| `pnpm lint` | ESLint su tutto, zero warning ammessi |
| `pnpm typecheck` | TypeScript su tutti i pacchetti |
| `pnpm test` | test unitari e di integrazione (Vitest) |
| `pnpm test:e2e` | partite reali multi-browser (Playwright) |
| `pnpm test:visual` | screenshot regression su quattro viewport |
| `pnpm test:visual:aggiorna` | riscrive gli screenshot di riferimento |
| `pnpm test:load` | stanze e giocatori concorrenti (server già avviato) |
| `pnpm validate:cases` | i dieci controlli sui casi e sulle varianti |
| `pnpm simulate` | partite simulate su ogni variante |
| `pnpm generate:assets` | rigenera tutti gli asset grafici |
| `pnpm render:scenes` | rende gli ambienti in Blender (opzionale, serve Blender) |
| `pnpm verify` | lint + typecheck + test + validazione, in un colpo |
| `pnpm deploy:preview` · `pnpm deploy:production` | build verificata e pubblicazione |
| `pnpm ios:sync` · `pnpm ios:build` | wrapper iOS |

Pannello diagnostico (solo in sviluppo): `http://localhost:5173/?diag=1`.

La prova di carico vuole un server già in ascolto e i limiti per indirizzo alzati: cento client dallo
stesso IP verrebbero altrimenti respinti dalla difesa contro l'enumerazione delle stanze, e la misura
sarebbe falsata. Lo strumento se ne accorge e si ferma dicendolo.

```bash
pnpm build
RATE_JOIN_BURST=400 RATE_CONNECT_BURST=800 pnpm start   # in un terminale
pnpm test:load --stanze=20 --giocatori=5 --durata=30    # nell'altro
```

---

## Com'è fatto

```
packages/engine    motore condiviso: schemi, deduzione, punteggio, stanza (nessuna rete)
packages/content   i tre casi, dati puri tipizzati
packages/ai        il Regista AI e i suoi quattro provider
apps/server        server autoritativo WebSocket (Node + ws)
apps/web           client React 19 + PixiJS 8, PWA installabile
apps/ios           wrapper Capacitor e plugin Swift
tools/             validatore, simulatore, generatore di asset, load test
tests/             end-to-end e visual regression
```

Il **server decide tutto**: fase, timer, ruoli, indizi, capacità, accuse, verdetto,
punteggi. Il client è un terminale che mostra ciò che riceve. La logica della stanza
(`packages/engine/src/room/runtime.ts`) è pura: riceve il tempo e restituisce effetti,
quindi gira identica in produzione, nei test e nelle simulazioni.

Dettagli in [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Come si gioca

1. **Apertura** e tutorial di quaranta secondi (saltabile).
2. Un giocatore **apre una stanza** e sceglie il caso; gli altri entrano con un codice
   di cinque lettere o con il link.
3. Il server assegna a ciascuno un **personaggio privato**: identità, alibi dichiarato,
   cronologia vera, segreto, obiettivo personale, capacità speciale, un indizio esclusivo.
   Uno dei giocatori è il colpevole e lo sa. In modalità cooperativa il colpevole è un
   personaggio non giocante e si vince o si perde tutti insieme.
4. **Atto I — Il ballo interrotto** (4 min): la scoperta, le dichiarazioni pubbliche.
   Mentire è permesso a tutti, non solo a chi ha qualcosa da nascondere.
5. **Atto II — Le stanze chiuse** (8 min): esplorazione simultanea, indizi, piccoli
   enigmi, testimoni interrogabili a domanda libera, eventi della tempesta.
6. **Atto III — La mezzanotte mente** (7 min): domande pubbliche, biglietti privati,
   contraddizioni da smascherare mettendo a confronto due affermazioni in bacheca.
7. **Verdetto**: ognuno deposita colpevole, movente, metodo e sequenza; il gruppo adotta
   una tesi; il motore la confronta con il grafo logico del caso.
8. **Ricostruzione** animata, punteggi, premi ironici, rivincita.

I timer si possono estendere o disattivare del tutto.

---

## I casi

| # | Caso | Quando | Difficoltà |
| --- | --- | --- | --- |
| 1 | **La Suite 404** | 12 gennaio 1968 | ◆◇◇ |
| 2 | **L'Orologio Sommerso** | 4 ottobre 1967 | ◆◆◇ |
| 3 | **L'Ultimo Valzer** | 28 febbraio 1969 | ◆◆◆ |

Ogni caso ha **otto ruoli**, sei o più ambienti, trenta o più indizi e **tre varianti**
con colpevole, movente, metodo, cronologia e distribuzione degli indizi diversi. La
variante viene scelta dal **seme** della partita: lo stesso seme produce sempre lo stesso
caso, semi diversi producono partite diverse.

`pnpm validate:cases` verifica automaticamente che ogni variante sia risolvibile, che il
colpevole non sia deducibile troppo presto, che esistano almeno due percorsi logici
indipendenti verso ogni conclusione e che nessun indizio indispensabile dipenda da un
solo giocatore.

Per scrivere un caso nuovo: [`docs/CONTENT_AUTHORING.md`](docs/CONTENT_AUTHORING.md).

---

## Il Regista AI

Il Regista dà voce ai testimoni, riassume le teorie, propone suggerimenti e scrive la
chiusura. **Non decide nulla**: non sceglie il colpevole, non crea prove, non tocca i
punteggi, non rivela ciò che non è ancora stato sbloccato.

Il provider predefinito è **deterministico**: nessuna API, nessuna chiave, nessuna rete.
Il gioco è completo così. Chi vuole può attivare Claude, un endpoint compatibile con
l'API OpenAI (anche un modello open-source ospitato in proprio) o, nell'app iOS, un
modello su dispositivo via MLX Swift. Ogni risposta passa da uno schema rigoroso e da un
guardrail: se qualcosa non torna, risponde il provider deterministico e la partita non se
ne accorge.

Dettagli e configurazione in [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md) e in
[`.env.example`](.env.example).

---

## Documentazione

| File | Contenuto |
| --- | --- |
| [`GAME_SPEC.md`](GAME_SPEC.md) | la specifica di prodotto |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | struttura, protocollo, scelte tecniche |
| [`ART_DIRECTION.md`](ART_DIRECTION.md) | palette, tipografia, scene, movimento |
| [`NARRATIVE_BIBLE.md`](NARRATIVE_BIBLE.md) | mondo, voce, regole di scrittura |
| [`AI_ARCHITECTURE.md`](AI_ARCHITECTURE.md) | Regista AI, provider, guardrail, modello locale |
| [`SECURITY.md`](SECURITY.md) | modello di minaccia e difese |
| [`PRIVACY.md`](PRIVACY.md) | quali dati esistono e per quanto |
| [`ACCESSIBILITY.md`](ACCESSIBILITY.md) | cosa è supportato e come si prova |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | ambienti, rollback, health |
| [`IOS_SETUP.md`](IOS_SETUP.md) | build, firma, TestFlight |
| [`ACCEPTANCE_TESTS.md`](ACCEPTANCE_TESTS.md) | i trenta criteri e come verificarli |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | come lavorare sul progetto |
| [`CHANGELOG.md`](CHANGELOG.md) | storia delle versioni |

---

## Privacy in una riga

Nessun account, nessuna e-mail, nessun cookie di tracciamento, nessuna statistica
raccolta. Il nickname resta sul tuo dispositivo, le stanze si cancellano da sole.
[`PRIVACY.md`](PRIVACY.md).

---

## Licenza

Codice, testi e asset di questo repository sono originali. Vedi [`LICENSE`](LICENSE).
