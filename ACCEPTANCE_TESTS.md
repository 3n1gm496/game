# ACCEPTANCE TESTS — MÉRIDIEN

Ogni criterio ha un comando verificabile. `pnpm verify` esegue lint + typecheck + unit/integrazione +
validazione casi. `pnpm test:e2e` esegue le partite reali multi-client.

| # | Criterio | Verifica | Stato |
| --- | --- | --- | --- |
| 1 | Installazione da zero con un comando | `pnpm install` | ✅ |
| 2 | Build, lint e typecheck senza errori | `pnpm build && pnpm lint && pnpm typecheck` | ✅ |
| 3 | Test unitari e di integrazione passano | `pnpm test` | ✅ |
| 4 | E2E completa una partita con ≥ 4 client | `pnpm test:e2e -g "partita completa"` | ✅ |
| 5 | Due browser distinti entrano nella stessa stanza | `tests/e2e/partita.spec.ts` → «due browser distinti» | ✅ |
| 6 | Le azioni si sincronizzano tramite server | `tests/e2e/partita.spec.ts` → condivisione di un indizio | ✅ |
| 7 | La riconnessione recupera lo stato | `tests/e2e/resilienza.spec.ts`, `apps/server/src/__tests__/room.test.ts` | ✅ |
| 8 | La migrazione dell'host funziona | `apps/server/src/__tests__/room.test.ts`, `tests/e2e/resilienza.spec.ts` | ✅ |
| 9 | I tre casi sono completi | `pnpm validate:cases` (conteggi minimi) | ✅ |
| 10 | Ogni caso ha tre varianti validate | `pnpm validate:cases` | ✅ |
| 11 | Ogni soluzione è logicamente derivabile | `validator.ts` → `solutionReachable` | ✅ |
| 12 | Il colpevole non è deducibile da metagioco | `validator.ts` → `noMetagameTell` + `simulate --metagame` | ✅ |
| 13 | L'AI non può modificare la verità | `packages/ai/src/__tests__/guardrails.test.ts` | ✅ |
| 14 | Il gioco funziona senza API AI | `MERIDIEN_AI_PROVIDER=deterministic` (default) + E2E | ✅ |
| 15 | Nessun placeholder o controllo inattivo | `pnpm lint` (regola `meridien/no-placeholder`) + `tests/e2e/piattaforma.spec.ts` | ✅ |
| 16 | Grafica coerente e originale | `pnpm generate:assets` produce tutto; nessuna URL remota (`tests/e2e/piattaforma.spec.ts` → «nessuna risorsa remota») | ✅ |
| 17 | Le schermate principali sono curate | `pnpm test:visual` (15 snapshot su 4 viewport) | ✅ |
| 18 | Layout su viewport iPhone | `tests/visual/schermate.spec.ts`, viewport 393×852 | ✅ |
| 19 | Safe area e tastiera gestite | `tests/visual/schermate.spec.ts` → «Casi limite del layout» | ✅ |
| 20 | Audio, musica e modalità silenziosa | `apps/web/src/audio/__tests__/motore.test.ts` + E2E toggle | ✅ |
| 21 | La PWA è installabile | `tests/e2e/piattaforma.spec.ts` → «PWA» (manifest + SW + icone + offline) | ✅ |
| 22 | Wrapper iOS presente e sincronizzabile | `pnpm ios:build`, `apps/ios/` | ✅ |
| 23 | Provider locale iOS implementato | `apps/ios/plugin/` (Swift) + `packages/ai/src/providers/onDeviceApple.ts` + `packages/ai/src/__tests__/guardrails.test.ts` | ✅ |
| 24 | Le chiavi non sono esposte | `scripts/check-secrets.mjs` sul bundle | ✅ |
| 25 | Il server rifiuta azioni illegali | `apps/server/src/__tests__/room.test.ts` → «Azioni illegali» + `pnpm simulate` | ✅ |
| 26 | Nessuna vulnerabilità critica nota | `SECURITY.md` § 7 + `node scripts/check-secrets.mjs` | ✅ |
| 27 | Nessun errore in console durante una partita | `tests/e2e/partita.spec.ts` (ogni partita verifica la console) | ✅ |
| 28 | Rivincita senza duplicazioni né leak | `tests/e2e/resilienza.spec.ts` → «rivincita» + `apps/server/src/__tests__/room.test.ts` | ✅ |
| 29 | La documentazione corrisponde al progetto | `scripts/check-docs.mjs` (script e file citati esistono) | ✅ |
| 30 | Preview eseguibile | `pnpm build && pnpm start` → `http://localhost:8787` | ✅ |

---

## Procedura di collaudo manuale

### A. Partita completa a due dispositivi

1. `pnpm install && pnpm build && pnpm start`
2. Aprire `http://<ip-locale>:8787` sul telefono e sul portatile.
3. Sul portatile: **Nuova indagine** → caso *La Suite 404* → copiare il codice.
4. Sul telefono: **Entra** → inserire il codice → nickname → avatar.
5. Entrambi pronti → **Comincia**.
6. Verificare: ruoli diversi, dossier privati diversi, indizi diversi.
7. Attraversare i tre atti, condividere almeno due indizi, interrogare un testimone.
8. Accusare, votare, osservare la ricostruzione, leggere i punteggi.
9. **Rivincita** → verificare che il caso cambi variante e che nessuno stato resti sporco.

### B. Riconnessione

Durante l'Atto II chiudere la scheda del telefono, riaprirla: la partita riprende alla fase corrente
con la propria mano di indizi e le proprie note intatte.

### C. Migrazione host

Chiudere il browser dell'host durante l'Atto I: entro 3 secondi un altro giocatore riceve la corona e
i controlli di fase.

### D. Assenza di AI

`unset ANTHROPIC_API_KEY` e riavviare: i testimoni rispondono comunque, il recap finale viene
prodotto, nessun errore in console.

### E. Accessibilità

Impostazioni → «Riduci movimento» + «Alto contrasto» + testo 130 % → attraversare tutte le schermate
con VoiceOver e con la sola tastiera.
