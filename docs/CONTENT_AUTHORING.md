# Scrivere un caso per MÉRIDIEN

Guida operativa per chi aggiunge o modifica un caso in `packages/content/src/cases/<nome>/`.
Il contratto è `packages/engine/src/schema/case.ts`; il giudice è `pnpm validate:cases`.

---

## 1. Struttura dei file

```
packages/content/src/cases/suite404/
├── index.ts         export const suite404: CaseDef = { ... }
├── world.ts         victim, roles, locations, objects, witnesses, abilities
├── clues.ts         i 30+ indizi (definizione statica, indipendente dalla variante)
├── secrets.ts       segreti, obiettivi, beat, opzioni di movente/metodo, eventi
├── texts.ts         testi del caso (intro, atti, verdetto, maggiordomo)
└── variants/
    ├── a.ts         variante A
    ├── b.ts         variante B
    └── c.ts         variante C
```

`index.ts` compone il tutto e lo tipizza come `CaseDef` con `satisfies`.

---

## 2. Convenzioni sugli identificatori

| Prefisso | Esempio | Note |
| --- | --- | --- |
| `case.` | `case.suite404` | uno per caso |
| `role.` | `role.ereditiera` | 8 per caso, nomi parlanti in italiano |
| `loc.` | `loc.suite-404` | ≥ 6 |
| `obj.` | `obj.chiave-passe` | oggetti illustrabili |
| `wit.` | `wit.bramante` | riusa `shared/witnesses.ts` |
| `clue.` | `clue.chiave-gemella` | ≥ 30 |
| `fact.` | `fact.porta-non-chiusa` | ≥ 12 per variante |
| `inf.` | `inf.porta-forzata` | ≥ 10 per variante |
| `sec.` | `sec.debito-gioco` | ≥ 6 (ne servono 8 distinti per assegnarli agli 8 ruoli) |
| `goal.` | `goal.silenzio` | ≥ 8 distinti |
| `abi.` | `abi.passe-partout` | esattamente 8, uno per ruolo |
| `evt.` | `evt.blackout` | ≥ 6 |
| `beat.` | `beat.incontro` | 4–6, **condivisi da tutte le varianti** |
| `var.` | `var.chiave-gemella` | esattamente 3 |

Solo minuscole, cifre e trattini dopo il punto.

---

## 3. Le regole che il validatore applica

1. **Integrità referenziale.** Ogni id citato deve esistere. Ogni indizio deve avere un
   `clueSetup` in **ogni** variante. Ogni ruolo deve avere un `roleProfile` in ogni variante.
2. **Nessuna contraddizione irrisolvibile.** Per ogni `contradiction`, i nodi `a` e `b` non possono
   essere **entrambi** derivabili dall'insieme completo degli indizi. Una contraddizione mette in
   conflitto un fatto provato con una **dichiarazione** (nodo affermato da un giocatore), non due
   prove.
3. **Soluzione raggiungibile.** Con tutti gli indizi devono essere derivabili almeno un'inferenza
   `culprit`, una `motive`, una `method` e una `sequence`.
4. **Non deducibile troppo presto.** Con i soli indizi `act: 1` il colpevole **non** deve essere
   derivabile. Deve invece esserlo entro l'Atto II (altrimenti scatta un avviso).
5. **Due percorsi indipendenti.** Colpevole, movente e metodo devono avere ≥ 2 insiemi di indizi di
   supporto **disgiunti**. In pratica: scrivi due inferenze diverse che concludono `culprit`,
   oppure una sola inferenza con due `paths` che non condividono nessun indizio.
6. **Ridondanza degli indizi critici.** Un indizio senza il quale la soluzione crolla **deve** avere
   `locationId` non nullo: dev'essere ritrovabile in un ambiente, non solo nelle mani di qualcuno.
7–8. **Coerenza temporale e spaziale.** Nessuno in due luoghi insieme; gli spostamenti devono
   stare nei minuti dichiarati in `locations[].adjacent`. Vale per `variant.timeline` e per ogni
   `roleProfile.trueTimeline`.
9. **Varianti reali.** Le tre varianti devono differire per `(culprit, motive, method)`; almeno due
   colpevoli diversi **e** almeno due metodi diversi fra le tre; la distribuzione degli indizi non
   può essere identica; la ricostruzione falsa del colpevole non può coincidere con la verità.
10. **L'AI non introduce fatti.** Ogni `fact` citato in `witnessLines[].reveals` deve essere
    ottenibile anche da un indizio, oppure essere `common: true`. Nessuna testimonianza può
    dichiarare la colpevolezza.

Inoltre: **≥ 12 `clueSetup` con `relevance: 'falsa-pista'` in ogni variante**.

---

## 4. Il grafo, in pratica

I nodi sono stringhe: `clue.x`, `fact.x`, `inf.x`.

```ts
// fatti: cosa si sa
{ id: 'fact.porta-chiusa-interno', text: 'La porta della 404 era chiusa dall’interno.', kind: 'luogo', common: true }
{ id: 'fact.chiave-duplicata', text: 'Esiste una seconda chiave della 404.', kind: 'oggetto', common: false }

// indizi: come lo si scopre
{ id: 'clue.registro-chiavi', reveals: ['fact.chiave-duplicata'], ... }

// inferenze: cosa se ne conclude
{
  id: 'inf.stanza-non-chiusa',
  text: 'La stanza non era davvero chiusa: la seconda chiave permetteva di richiuderla dall’esterno.',
  concludes: 'method',
  paths: [
    ['fact.porta-chiusa-interno', 'fact.chiave-duplicata'],   // via A
    ['fact.porta-chiusa-interno', 'fact.olio-cardine'],       // via B, indizi diversi
  ],
}
```

Un'inferenza è derivabile se **almeno un `path`** è interamente derivabile (OR fra path, AND dentro
il path). Per soddisfare il controllo 5, i due path devono poggiare su indizi **disgiunti**.

Schema consigliato per il colpevole:

```
inf.culpability-a  (concludes: 'culprit')   ← catena "materiale" (oggetti, tracce)
inf.culpability-b  (concludes: 'culprit')   ← catena "temporale" (orari, testimoni)
```

Le due catene devono partire da indizi diversi e arrivare allo stesso nome.

---

## 5. Beat e sequenza

I `beats` sono **quattro o cinque momenti generici** validi per tutte e tre le varianti:

```ts
beats: [
  { id: 'beat.incontro',  label: 'Il primo incontro della sera' },
  { id: 'beat.bugia',     label: 'La bugia necessaria' },
  { id: 'beat.gesto',     label: 'Il gesto' },
  { id: 'beat.uscita',    label: 'L’uscita dalla stanza' },
  { id: 'beat.scoperta',  label: 'La scoperta' },
]
```

Ogni variante ne dà l'**ordine vero** (`sequence`) e il **dettaglio specifico** (`beatDetails`).
Poiché le etichette sono identiche in tutte le varianti, il giocatore non può dedurre la variante
dalle opzioni: è la difesa contro il metagioco.

Lo stesso vale per `motiveOptions` e `methodOptions`: **almeno 5 opzioni ciascuna**, condivise, di
cui ogni variante sceglie una.

---

## 6. Distribuzione degli indizi

```ts
{
  clueId: 'clue.registro-chiavi',
  relevance: 'critico',        // critico | utile | contorno | falsa-pista
  act: 2,                      // atto minimo in cui compare
  locationId: 'loc.hall',      // null solo per gli indizi esclusivi dei ruoli
  hotspot: 'bancone',          // chiave grafica dell'oggetto interattivo
  puzzle: {                    // opzionale
    kind: 'orario',
    prompt: 'A che ora il registro segna la riconsegna della 404?',
    options: ['22:10', '22:40', '23:05'],
    answer: '22:40',
    hint: 'Confronta la riga della 404 con quella della 402, scritta di seguito.',
  },
}
```

Regole pratiche:

* gli 8 `exclusiveClueId` dei ruoli hanno normalmente `locationId: null`;
* se uno di essi risulta **critico**, dagli un `locationId`: il validatore lo pretende;
* varia `act` e `locationId` fra le varianti, altrimenti il controllo 9 fallisce;
* i 12+ `falsa-pista` documentano **segreti innocenti**: sono veri, ma non riguardano il delitto.

---

## 7. Testi

Rispetta `NARRATIVE_BIBLE.md`. In sintesi: frasi brevi, dettagli fisici, nessun cadavere descritto,
italiano del 1968, nessun anacronismo, niente teatralità. Limiti di lunghezza imposti dallo schema:

| Campo | Max |
| --- | --- |
| `declarations[].text` | 180 |
| `witnessLines[].text` | 320 |
| `clues[].text` | 240 |
| `events[].text` | 200 |
| `secrets[].text` | 260 |
| `variant.texts.*` | 700–1200 |

---

## 8. Ciclo di lavoro

```bash
pnpm validate:cases --case=suite404   # dieci controlli sul solo caso
pnpm simulate --case=suite404         # partite simulate, risolvibilità
pnpm test packages/content            # test di struttura
```

Lavora finché `validate:cases` non stampa `Validazione superata.` **senza avvisi**.
Un caso che non passa la validazione non è finito.
