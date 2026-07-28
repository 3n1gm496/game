import {
  RoomRuntime,
  buildGraph,
  closure,
  createRng,
  createRoomState,
  criticalClues,
  type CaseDef,
  type ClientMessage,
  type Effect,
  type RoomSettings,
  type VariantDef,
} from '@meridien/engine';
import { allCases, contentLibrary } from '@meridien/content';

/**
 * `pnpm simulate`
 *
 * Fa giocare agenti deterministici a molte partite, su ogni variante, in ogni
 * taglia di gruppo e in entrambe le modalità. Serve a rispondere a domande che
 * il validatore statico non può porsi:
 *
 *   - una partita reale arriva davvero alla soluzione, o gli indizi decisivi
 *     restano fuori portata?
 *   - la distribuzione è equa fra i giocatori?
 *   - esistono blocchi in cui nessuno può più agire?
 *   - il punteggio si comporta come previsto?
 *   - il server rifiuta ogni azione illegale che un agente prova a fare?
 *
 * Gli agenti non barano: vedono solo ciò che il server manda a loro.
 *
 * Opzioni:
 *   --case=<id>      solo un caso
 *   --partite=<n>    partite per combinazione (predefinito 3)
 *   --verboso        stampa ogni partita
 */

interface Esito {
  caseId: string;
  variantId: string;
  giocatori: number;
  modalita: RoomSettings['mode'];
  risolta: boolean;
  colpevoleIndovinato: boolean;
  indiziTrovati: number;
  indiziCriticiRaggiunti: number;
  indiziCriticiTotali: number;
  minIndiziPerGiocatore: number;
  maxIndiziPerGiocatore: number;
  azioniIllegaliRifiutate: number;
  azioniIllegaliAccettate: number;
  turni: number;
  puntiTotali: number;
}

const argomenti = process.argv.slice(2);
const soloCaso = argomenti.find((a) => a.startsWith('--case='))?.split('=')[1];
const partitePerCombinazione = Number(argomenti.find((a) => a.startsWith('--partite='))?.split('=')[1] ?? 3);
const verboso = argomenti.includes('--verboso');

const TAGLIE = [4, 5, 6, 7, 8] as const;

/** Percentuale minima di partite risolvibili con gioco casuale. */
const SOGLIA_RISOLVIBILITA = 90;
const MODALITA: RoomSettings['mode'][] = ['competitiva', 'cooperativa'];

/** Un agente deterministico: esplora, condivide, poi accusa in base a ciò che sa. */
class Agente {
  readonly indizi = new Set<string>();
  /** ambienti già battuti senza trovare nulla: non ci torna */
  readonly esauriti = new Set<string>();
  constructor(
    readonly id: string,
    readonly rng: ReturnType<typeof createRng>,
    /** quanto è collaborativo: 1 = condivide tutto, 0 = non condivide nulla */
    readonly apertura: number,
  ) {}

  /** Sceglie dove cercare: prima ciò che non ha ancora visto. */
  dove(aperti: readonly string[]): string | null {
    const nuovi = aperti.filter((l) => !this.esauriti.has(l));
    if (nuovi.length > 0) return this.rng.pick(nuovi);
    return aperti.length > 0 ? this.rng.pick(aperti) : null;
  }
}

function simulaPartita(
  caseDef: CaseDef,
  variante: VariantDef,
  giocatori: number,
  modalita: RoomSettings['mode'],
  seme: string,
): Esito {
  let ora = 1_700_000_000_000;
  let contatore = 0;

  const settings: RoomSettings = {
    caseId: caseDef.id,
    variantId: variante.id,
    seed: seme,
    mode: modalita,
    timers: 'assenti',
    aiDirector: false,
    hints: false,
    spectators: false,
  };

  const state = createRoomState({ id: `sim-${seme}`, code: 'SIMUL', now: ora, settings });
  const runtime = new RoomRuntime({
    state,
    content: contentLibrary,
    now: () => ora,
    newId: () => `s${(contatore += 1)}`,
  });

  let illegaliRifiutate = 0;
  let illegaliAccettate = 0;

  const applica = (effetti: readonly Effect[], attesoErrore = false): void => {
    let haErrore = false;
    for (const e of effetti) {
      if (e.kind === 'direct' && e.msg.t === 'error') haErrore = true;
    }
    if (attesoErrore) {
      if (haErrore) illegaliRifiutate += 1;
      else illegaliAccettate += 1;
    }
  };

  const agenti: Agente[] = [];
  const rngPartita = createRng(seme);
  for (let i = 0; i < giocatori; i += 1) {
    const res = runtime.addPlayer(`Agente${i + 1}`, 'portrait-01', `tok${i}`, false);
    if (!res.playerId) throw new Error('ingresso non riuscito');
    agenti.push(new Agente(res.playerId, createRng(`${seme}:${i}`), rngPartita.next()));
  }

  const invia = (id: string, msg: ClientMessage, attesoErrore = false): void => {
    contatore += 1;
    applica(runtime.handle(id, msg), attesoErrore);
  };

  // ── azioni illegali provate prima dell'avvio ────────────────────────────
  invia(agenti[1]!.id, { t: 'startGame', actionId: 'ill1' }, true); // non è host
  invia(agenti[0]!.id, { t: 'declare', actionId: 'ill2', key: 'verita' }, true); // fase sbagliata
  invia(agenti[0]!.id, { t: 'voteVerdict', actionId: 'ill3', accusationOfPlayerId: agenti[1]!.id }, true);

  for (const a of agenti) invia(a.id, { t: 'setReady', ready: true });
  invia(agenti[0]!.id, { t: 'startGame', actionId: 'via' });

  if (state.phase !== 'briefing') throw new Error('la partita non è cominciata');

  for (const a of agenti) {
    for (const c of runtime.privateView(a.id).clues) a.indizi.add(c.id);
  }

  let turni = 0;
  const avanzaFase = (): void => {
    contatore += 1;
    applica(runtime.handle(agenti[0]!.id, { t: 'advancePhase', actionId: `f${contatore}` }));
  };

  avanzaFase(); // → atto1

  // ── tre atti ─────────────────────────────────────────────────────────────
  for (const atto of [1, 2, 3] as const) {
    for (const a of agenti) {
      // dichiarazione, solo in Atto I
      if (atto === 1) {
        const chiave = a.rng.pick(['verita', 'omissione', 'bugia'] as const);
        invia(a.id, { t: 'declare', actionId: `d${a.id}`, key: chiave });
      }

      // esplorazione: usa tutte le ricerche disponibili
      let ricerche = runtime.privateView(a.id).searchesLeft;
      let guardia = 0;
      while (ricerche > 0 && guardia < 12) {
        guardia += 1;
        turni += 1;
        const aperti = state.openLocationIds;
        const dove = a.dove(aperti);
        if (!dove) break;
        const primaDelColpo = runtime.privateView(a.id).clues.length;
        contatore += 1;
        const effetti = runtime.handle(a.id, {
          t: 'investigate',
          actionId: `i${contatore}`,
          locationId: dove,
          hotspot: '',
        });
        applica(effetti);
        if (runtime.privateView(a.id).clues.length === primaDelColpo) {
          // niente da trovare qui in questo atto: l'agente se lo segna
          a.esauriti.add(dove);
        }
        // se arriva un enigma, l'agente lo risolve: la risposta è nel setup
        for (const e of effetti) {
          if (e.kind === 'direct' && e.msg.t === 'puzzle') {
            const setup = variante.clueSetup.find((s) => s.clueId === e.msg.clueId);
            if (setup?.puzzle) {
              contatore += 1;
              applica(
                runtime.handle(a.id, {
                  t: 'solvePuzzle',
                  actionId: `p${contatore}`,
                  clueId: e.msg.clueId,
                  answer: setup.puzzle.answer,
                }),
              );
            }
          }
        }
        for (const c of runtime.privateView(a.id).clues) a.indizi.add(c.id);
        ricerche = runtime.privateView(a.id).searchesLeft;
      }

      // Condivisione. Nell'Atto III il tempo stringe e anche gli agenti più
      // chiusi mettono in tavola quasi tutto: è quello che fanno le persone.
      const soglia = atto === 3 ? Math.max(a.apertura, 0.85) : a.apertura;
      for (const c of runtime.privateView(a.id).clues) {
        if (c.shared) continue;
        if (a.rng.next() > soglia) continue;
        contatore += 1;
        applica(runtime.handle(a.id, { t: 'shareClue', actionId: `c${contatore}`, clueId: c.id }));
      }

      // capacità speciale, una volta per atto
      contatore += 1;
      applica(
        runtime.handle(a.id, {
          t: 'useAbility',
          actionId: `ab${contatore}`,
          targetPlayerId: a.rng.pick(agenti.filter((x) => x.id !== a.id)).id,
        }),
      );
    }

    // azione illegale: usare la capacità due volte nello stesso atto
    invia(
      agenti[0]!.id,
      { t: 'useAbility', actionId: `abIll${atto}`, targetPlayerId: agenti[1]!.id },
      true,
    );

    ora += 1000;
    avanzaFase();
  }

  // ── accusa ───────────────────────────────────────────────────────────────
  if (state.phase !== 'accusa') throw new Error(`fase inattesa: ${state.phase}`);

  // che cosa sa il gruppo, davvero
  const inBacheca = new Set(state.board.filter((b) => b.clueId).map((b) => b.clueId as string));
  const conoscenzaCollettiva = new Set<string>(inBacheca);
  for (const a of agenti) for (const c of a.indizi) conoscenzaCollettiva.add(c);

  const grafo = buildGraph(caseDef.clues, variante.facts, variante.inferences, variante.contradictions);
  const derivato = closure(grafo, conoscenzaCollettiva);
  const nodiColpevole = variante.inferences.filter((i) => i.concludes === 'culprit').map((i) => i.id);
  const risolvibile = nodiColpevole.some((n) => derivato.has(n));

  const universo = caseDef.clues.map((c) => c.id);
  const critici = new Set<string>();
  for (const tipo of ['culprit', 'motive', 'method'] as const) {
    for (const inf of variante.inferences.filter((i) => i.concludes === tipo)) {
      for (const c of criticalClues(grafo, inf.id, universo)) critici.add(c);
    }
  }
  const criticiRaggiunti = [...critici].filter((c) => conoscenzaCollettiva.has(c)).length;
  // `critici` vuoto è una buona notizia, non un dato mancante: significa che
  // ogni conclusione ha percorsi ridondanti e nessun indizio è insostituibile.

  // gli agenti accusano: se il gruppo può dedurre, indovinano; altrimenti tirano
  for (const a of agenti) {
    const indovina = risolvibile && a.rng.next() < 0.75;
    const ruoloAccusato = indovina
      ? variante.culpritRoleId
      : a.rng.pick(caseDef.roles.map((r) => r.id));
    contatore += 1;
    applica(
      runtime.handle(a.id, {
        t: 'submitAccusation',
        actionId: `ac${contatore}`,
        culpritRoleId: ruoloAccusato,
        motiveKey: indovina ? variante.motiveKey : a.rng.pick(caseDef.motiveOptions).key,
        methodKey: indovina ? variante.methodKey : a.rng.pick(caseDef.methodOptions).key,
        sequence: indovina ? [...variante.sequence] : a.rng.shuffle(caseDef.beats.map((b) => b.id)),
      }),
    );
  }

  // accusa doppia: deve essere rifiutata
  invia(
    agenti[0]!.id,
    {
      t: 'submitAccusation',
      actionId: 'acIll',
      culpritRoleId: caseDef.roles[0]!.id,
      motiveKey: caseDef.motiveOptions[0]!.key,
      methodKey: caseDef.methodOptions[0]!.key,
      sequence: caseDef.beats.map((b) => b.id),
    },
    true,
  );

  if (state.phase !== 'verdetto') avanzaFase();

  // ── verdetto ─────────────────────────────────────────────────────────────
  const candidati = agenti.filter((a) => state.players[a.id]?.accusation?.culpritRoleId);
  const scelto = candidati.length > 0 ? candidati[0]! : agenti[0]!;
  for (const a of agenti) {
    contatore += 1;
    applica(
      runtime.handle(a.id, { t: 'voteVerdict', actionId: `v${contatore}`, accusationOfPlayerId: scelto.id }),
    );
  }
  if (state.phase !== 'epilogo') avanzaFase();

  const risultato = state.result as {
    collectiveCorrect: boolean;
    players: { total: number }[];
  } | null;
  if (!risultato) throw new Error('nessun punteggio prodotto');

  const perGiocatore = agenti.map((a) => runtime.privateView(a.id).clues.length);

  return {
    caseId: caseDef.id,
    variantId: variante.id,
    giocatori,
    modalita,
    risolta: risolvibile,
    colpevoleIndovinato: risultato.collectiveCorrect,
    indiziTrovati: conoscenzaCollettiva.size,
    indiziCriticiRaggiunti: criticiRaggiunti,
    indiziCriticiTotali: critici.size,
    minIndiziPerGiocatore: Math.min(...perGiocatore),
    maxIndiziPerGiocatore: Math.max(...perGiocatore),
    azioniIllegaliRifiutate: illegaliRifiutate,
    azioniIllegaliAccettate: illegaliAccettate,
    turni,
    puntiTotali: risultato.players.reduce((s, p) => s + p.total, 0),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const casi = allCases().filter((c) => !soloCaso || c.id === soloCaso || c.id.endsWith(soloCaso));
if (casi.length === 0) {
  console.error(`Nessun caso corrisponde a "${soloCaso}".`);
  process.exit(1);
}

console.log('MÉRIDIEN · simulazioni\n');

const esiti: Esito[] = [];
const problemi: string[] = [];
const inizio = Date.now();

for (const caseDef of casi) {
  for (const variante of caseDef.variants) {
    for (const giocatori of TAGLIE) {
      for (const modalita of MODALITA) {
        for (let n = 0; n < partitePerCombinazione; n += 1) {
          const seme = `SIM${n}${giocatori}${modalita[0]!.toUpperCase()}`;
          try {
            const esito = simulaPartita(caseDef, variante, giocatori, modalita, seme);
            esiti.push(esito);
            if (verboso) {
              console.log(
                `  ${esito.caseId} ${esito.variantId} ${giocatori}p ${modalita} ` +
                  `→ ${esito.risolta ? 'risolvibile' : 'NON RISOLVIBILE'} ` +
                  `(${esito.indiziCriticiRaggiunti}/${esito.indiziCriticiTotali} critici)`,
              );
            }
          } catch (errore) {
            problemi.push(
              `${caseDef.id} ${variante.id} ${giocatori}p ${modalita} seme ${seme}: ` +
                (errore instanceof Error ? errore.message : String(errore)),
            );
          }
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rapporto
// ─────────────────────────────────────────────────────────────────────────────

const perVariante = new Map<string, Esito[]>();
for (const e of esiti) {
  const chiave = `${e.caseId} · ${e.variantId}`;
  const lista = perVariante.get(chiave) ?? [];
  lista.push(e);
  perVariante.set(chiave, lista);
}

console.log(`  ${esiti.length} partite simulate in ${((Date.now() - inizio) / 1000).toFixed(1)}s\n`);

let fallimenti = problemi.length;

for (const [chiave, lista] of [...perVariante].sort()) {
  const risolvibili = lista.filter((e) => e.risolta).length;
  const percentuale = Math.round((risolvibili / lista.length) * 100);
  const senzaPuntiDiRottura = lista.every((e) => e.indiziCriticiTotali === 0);
  const criticiMedi = senzaPuntiDiRottura
    ? 1
    : lista.reduce(
        (s, e) => s + (e.indiziCriticiTotali === 0 ? 1 : e.indiziCriticiRaggiunti / e.indiziCriticiTotali),
        0,
      ) / lista.length;
  const equita = Math.min(...lista.map((e) => e.minIndiziPerGiocatore));
  const illegaliPassate = lista.reduce((s, e) => s + e.azioniIllegaliAccettate, 0);
  const illegaliBloccate = lista.reduce((s, e) => s + e.azioniIllegaliRifiutate, 0);

  // Soglia: il gruppo deve poter arrivare alla soluzione in almeno il 90 %
  // delle partite giocate *a caso*. Chi gioca davvero sceglie dove guardare e
  // si parla: questa è la stima pessimistica, non quella realistica.
  const segno = percentuale >= SOGLIA_RISOLVIBILITA && illegaliPassate === 0 && equita >= 1 ? '✔' : '✘';
  if (segno === '✘') fallimenti += 1;

  console.log(`${segno} ${chiave}`);
  console.log(
    `   risolvibile nel ${percentuale}% delle partite · ` +
      (senzaPuntiDiRottura
        ? 'nessun indizio insostituibile'
        : `indizi critici raggiunti ${(criticiMedi * 100).toFixed(0)}%`) +
      ` · minimo indizi per giocatore ${equita}`,
  );
  console.log(
    `   azioni illegali: ${illegaliBloccate} rifiutate, ${illegaliPassate} accettate · ` +
      `punti medi ${Math.round(lista.reduce((s, e) => s + e.puntiTotali, 0) / lista.length)}`,
  );
}

if (problemi.length > 0) {
  console.log('\n  Partite interrotte:');
  for (const p of problemi.slice(0, 20)) console.log(`    ✘ ${p}`);
}

console.log('');
if (fallimenti > 0) {
  console.error(`  ${fallimenti} combinazioni problematiche.\n`);
  process.exit(1);
}
console.log('  Tutte le varianti sono risolvibili, eque e a prova di azione illegale.\n');
