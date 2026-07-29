# CONTRIBUTING — MÉRIDIEN

## Cominciare

```bash
pnpm install
pnpm dev:multiplayer
pnpm verify            # lint + typecheck + test + validate:cases
```

Se `pnpm verify` passa, il tuo ambiente è a posto.

## Le regole non negoziabili

1. **Il server decide.** Nessuna logica di gioco nel client. Se una modifica richiede che
   il client calcoli qualcosa che conta, la modifica va ripensata.
2. **Nessun segnaposto.** `TODO`, `FIXME`, `placeholder`, `lorem ipsum` e pulsanti inattivi
   sono vietati dal linter, non per pignoleria: un prodotto finito non li contiene.
3. **Nessun asset esterno.** Grafica e audio si generano dal codice. Se serve un'immagine
   nuova, si aggiunge un generatore in `tools/generate-assets`.
4. **Interfaccia in italiano.** Anche i nomi delle classi CSS e dei componenti visibili.
   Gli identificatori tecnici del protocollo restano come sono per compatibilità.
5. **Un caso non è finito finché `pnpm validate:cases` non è pulito**, avvisi compresi.
6. **Nessuna chiave nel repository.** `node scripts/check-secrets.mjs` deve passare.

## Struttura e proprietà

| Cartella | Chi la tocca |
| --- | --- |
| `packages/engine` | modifiche al motore: schemi, deduzione, punteggio, stanza |
| `packages/content` | soltanto contenuti narrativi — vedi `docs/CONTENT_AUTHORING.md` |
| `packages/ai` | Regista e provider |
| `apps/server` | trasporto, limiti, health |
| `apps/web` | interfaccia, scene, audio |
| `tools/` | validatore, simulatore, generatore di asset, load test |

Il motore non dipende da nulla di specifico della piattaforma: se stai per importare
`window` o `node:fs` dentro `packages/engine`, è il segnale che il codice va altrove.

## Stile

* TypeScript in modalità `strict`, `noUncheckedIndexedAccess` incluso.
* Prettier decide la formattazione: `pnpm format`.
* I commenti spiegano **perché**, non cosa. Il codice dice già cosa fa.
* I nomi in italiano dove il dominio è italiano (`Cronometro`, `Bacheca`, `Taccuino`),
  in inglese dove il dominio è tecnico (`RoomRuntime`, `closure`, `supportSets`).

## Prima di aprire una pull request

```bash
pnpm verify
pnpm test:e2e
node scripts/check-secrets.mjs
```

E, per le modifiche all'interfaccia, `pnpm test:visual` con gli snapshot aggiornati
consapevolmente (`--update-snapshots`), non alla cieca.

## Aggiungere un caso

Segui `docs/CONTENT_AUTHORING.md` dall'inizio alla fine. Il validatore applica dieci
controlli: risolvibilità, non deducibilità precoce, due percorsi indipendenti, ridondanza
degli indizi critici, coerenza spazio-temporale, diversità reale delle varianti e
impossibilità per l'AI di introdurre fatti determinanti. Non sono suggerimenti.

## Aggiungere una scena

1. Aggiungi la scena in `tools/generate-assets/src/scenes.ts` con i suoi quattro livelli,
   le luci e almeno quattro hotspot (fra cui sempre `consegna` e `oggetto`).
2. `pnpm generate:assets`
3. Usa la nuova chiave nel campo `scene` di un ambiente del caso.

## Segnalare un problema

Indica: cosa ti aspettavi, cosa è successo, il **seme** della partita e il codice stanza se
ce l'hai. Con il seme la partita si riproduce identica, ed è il modo più rapido per
arrivare alla causa.
