import { CaseSchema, type CaseDef, type VariantDef } from './schema/case.js';
import { buildGraph, closure, criticalClues, independentPathCount } from './deduction.js';
import { checkTimeline } from './timeline.js';

/**
 * Validatore dei casi: dieci controlli che garantiscono che ogni caso e ogni
 * variante siano giocabili, risolvibili e non deducibili troppo presto.
 * Eseguito da `pnpm validate:cases` e dalla suite di test.
 */

export interface ValidationIssue {
  check: string;
  caseId: string;
  variantId?: string;
  severity: 'errore' | 'avviso';
  message: string;
}

export interface ValidationReport {
  caseId: string;
  ok: boolean;
  issues: ValidationIssue[];
  stats: {
    roles: number;
    locations: number;
    clues: number;
    redHerrings: number;
    secrets: number;
    objectives: number;
    events: number;
    variants: number;
    inferencesPerVariant: number[];
    timelineEntriesPerVariant: number[];
  };
}

const MIN = {
  roles: 8,
  locations: 6,
  clues: 30,
  redHerrings: 12,
  secrets: 6,
  objectives: 8,
  variants: 3,
} as const;

export function validateCase(input: unknown): ValidationReport {
  const issues: ValidationIssue[] = [];

  const parsed = CaseSchema.safeParse(input);
  if (!parsed.success) {
    const caseId =
      typeof input === 'object' && input && 'id' in input ? String((input as { id: unknown }).id) : '(sconosciuto)';
    for (const err of parsed.error.issues.slice(0, 40)) {
      issues.push({
        check: '00-schema',
        caseId,
        severity: 'errore',
        message: `${err.path.join('.')}: ${err.message}`,
      });
    }
    return {
      caseId,
      ok: false,
      issues,
      stats: {
        roles: 0,
        locations: 0,
        clues: 0,
        redHerrings: 0,
        secrets: 0,
        objectives: 0,
        events: 0,
        variants: 0,
        inferencesPerVariant: [],
        timelineEntriesPerVariant: [],
      },
    };
  }

  const c = parsed.data;
  const add = (
    check: string,
    message: string,
    variantId?: string,
    severity: ValidationIssue['severity'] = 'errore',
  ): void => {
    issues.push({ check, caseId: c.id, severity, message, ...(variantId ? { variantId } : {}) });
  };

  // ── 01 · integrità referenziale ────────────────────────────────────────────
  const roleIds = new Set(c.roles.map((r) => r.id));
  const locIds = new Set(c.locations.map((l) => l.id));
  const clueIds = new Set(c.clues.map((cl) => cl.id));
  const objIds = new Set(c.objects.map((o) => o.id));
  const witIds = new Set(c.witnesses.map((w) => w.id));
  const secretIds = new Set(c.secrets.map((s) => s.id));
  const goalIds = new Set(c.objectives.map((o) => o.id));
  const abilityIds = new Set(c.abilities.map((a) => a.id));
  const beatIds = new Set(c.beats.map((b) => b.id));
  const motiveKeys = new Set(c.motiveOptions.map((m) => m.key));
  const methodKeys = new Set(c.methodOptions.map((m) => m.key));

  const dupes = (ids: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const i of ids) {
      if (seen.has(i)) out.push(i);
      seen.add(i);
    }
    return out;
  };
  for (const [label, list] of [
    ['ruoli', c.roles.map((r) => r.id)],
    ['ambienti', c.locations.map((l) => l.id)],
    ['indizi', c.clues.map((x) => x.id)],
    ['segreti', c.secrets.map((s) => s.id)],
    ['obiettivi', c.objectives.map((o) => o.id)],
  ] as const) {
    const d = dupes([...list]);
    if (d.length) add('01-riferimenti', `id duplicati fra i ${label}: ${d.join(', ')}`);
  }

  for (const role of c.roles) {
    if (!abilityIds.has(role.abilityId)) add('01-riferimenti', `${role.id}: capacità inesistente ${role.abilityId}`);
  }
  for (const loc of c.locations) {
    for (const edge of loc.adjacent) {
      if (!locIds.has(edge.to)) add('01-riferimenti', `${loc.id}: adiacenza verso ambiente inesistente ${edge.to}`);
    }
  }
  for (const clue of c.clues) {
    for (const req of clue.requires) {
      if (!clueIds.has(req)) add('01-riferimenti', `${clue.id}: prerequisito inesistente ${req}`);
    }
    if (clue.objectId && !objIds.has(clue.objectId)) {
      add('01-riferimenti', `${clue.id}: oggetto inesistente ${clue.objectId}`);
    }
  }
  for (const w of c.witnesses) {
    if (!locIds.has(w.locationId)) add('01-riferimenti', `${w.id}: ambiente inesistente ${w.locationId}`);
  }
  for (const ev of c.events) {
    if ((ev.effect === 'open-location' || ev.effect === 'close-location') && !locIds.has(ev.param)) {
      add('01-riferimenti', `${ev.id}: evento su ambiente inesistente ${ev.param}`);
    }
    if (ev.effect === 'reveal-clue' && !clueIds.has(ev.param)) {
      add('01-riferimenti', `${ev.id}: evento su indizio inesistente ${ev.param}`);
    }
  }

  // conteggi minimi
  if (c.roles.length < MIN.roles) add('01-riferimenti', `servono ${MIN.roles} ruoli, trovati ${c.roles.length}`);
  if (c.locations.length < MIN.locations)
    add('01-riferimenti', `servono ${MIN.locations} ambienti, trovati ${c.locations.length}`);
  if (c.clues.length < MIN.clues) add('01-riferimenti', `servono ${MIN.clues} indizi, trovati ${c.clues.length}`);
  if (c.secrets.length < MIN.secrets) add('01-riferimenti', `servono ${MIN.secrets} segreti`);
  if (c.objectives.length < MIN.objectives) add('01-riferimenti', `servono ${MIN.objectives} obiettivi`);
  if (c.variants.length < MIN.variants) add('01-riferimenti', `servono ${MIN.variants} varianti`);

  const stats: ValidationReport['stats'] = {
    roles: c.roles.length,
    locations: c.locations.length,
    clues: c.clues.length,
    redHerrings: 0,
    secrets: c.secrets.length,
    objectives: c.objectives.length,
    events: c.events.length,
    variants: c.variants.length,
    inferencesPerVariant: [],
    timelineEntriesPerVariant: [],
  };

  const culprits = new Set<string>();
  const methods = new Set<string>();
  const signatures = new Set<string>();

  for (const v of c.variants) {
    validateVariant(c, v, {
      add,
      roleIds,
      locIds,
      clueIds,
      witIds,
      secretIds,
      goalIds,
      beatIds,
      motiveKeys,
      methodKeys,
      stats,
    });
    culprits.add(v.culpritRoleId);
    methods.add(v.methodKey);
    signatures.add(`${v.culpritRoleId}|${v.methodKey}|${v.motiveKey}`);
  }

  // ── 09 · diversità delle varianti ──────────────────────────────────────────
  if (signatures.size !== c.variants.length) {
    add('09-varianti', 'due varianti condividono colpevole, movente e metodo: non sono varianti reali');
  }
  if (culprits.size < 2) {
    add('09-varianti', 'le varianti devono cambiare colpevole almeno una volta');
  }
  if (methods.size < 2) {
    add('09-varianti', 'almeno una variante deve cambiare il metodo, non solo il colpevole');
  }
  // la distribuzione degli indizi deve differire
  for (let i = 0; i < c.variants.length; i += 1) {
    for (let j = i + 1; j < c.variants.length; j += 1) {
      const a = c.variants[i]!;
      const b = c.variants[j]!;
      const sigA = a.clueSetup.map((s) => `${s.clueId}:${s.relevance}:${s.locationId ?? '-'}:${s.act}`).sort().join(',');
      const sigB = b.clueSetup.map((s) => `${s.clueId}:${s.relevance}:${s.locationId ?? '-'}:${s.act}`).sort().join(',');
      if (sigA === sigB) {
        add('09-varianti', `${a.id} e ${b.id} hanno distribuzione degli indizi identica`);
      }
    }
  }

  stats.redHerrings = Math.min(
    ...c.variants.map((v) => v.clueSetup.filter((s) => s.relevance === 'falsa-pista').length),
  );
  if (stats.redHerrings < MIN.redHerrings) {
    add('01-riferimenti', `ogni variante deve avere almeno ${MIN.redHerrings} false piste (minimo trovato: ${stats.redHerrings})`);
  }

  return {
    caseId: c.id,
    ok: issues.every((i) => i.severity !== 'errore'),
    issues,
    stats,
  };
}

interface VariantCtx {
  add: (check: string, message: string, variantId?: string, severity?: ValidationIssue['severity']) => void;
  roleIds: Set<string>;
  locIds: Set<string>;
  clueIds: Set<string>;
  witIds: Set<string>;
  secretIds: Set<string>;
  goalIds: Set<string>;
  beatIds: Set<string>;
  motiveKeys: Set<string>;
  methodKeys: Set<string>;
  stats: ValidationReport['stats'];
}

function validateVariant(c: CaseDef, v: VariantDef, ctx: VariantCtx): void {
  const { add } = ctx;
  const vid = v.id;

  // riferimenti della variante
  if (!ctx.roleIds.has(v.culpritRoleId)) add('01-riferimenti', `colpevole inesistente ${v.culpritRoleId}`, vid);
  if (!ctx.motiveKeys.has(v.motiveKey)) add('01-riferimenti', `movente non fra le opzioni: ${v.motiveKey}`, vid);
  if (!ctx.methodKeys.has(v.methodKey)) add('01-riferimenti', `metodo non fra le opzioni: ${v.methodKey}`, vid);
  for (const beat of v.sequence) {
    if (!ctx.beatIds.has(beat)) add('01-riferimenti', `beat inesistente ${beat}`, vid);
  }
  if (new Set(v.sequence).size !== v.sequence.length) add('01-riferimenti', 'sequenza con beat ripetuti', vid);
  if (v.sequence.length !== c.beats.length) {
    add('01-riferimenti', `la sequenza deve ordinare tutti i ${c.beats.length} beat del caso`, vid);
  }
  for (const beat of c.beats) {
    if (!v.beatDetails[beat.id]) add('01-riferimenti', `manca il dettaglio del beat ${beat.id}`, vid);
  }

  const factIds = new Set(v.facts.map((f) => f.id));
  const setupByClue = new Map(v.clueSetup.map((s) => [s.clueId, s]));

  for (const setup of v.clueSetup) {
    if (!ctx.clueIds.has(setup.clueId)) add('01-riferimenti', `setup di indizio inesistente ${setup.clueId}`, vid);
    if (setup.locationId && !ctx.locIds.has(setup.locationId)) {
      add('01-riferimenti', `${setup.clueId}: ambiente inesistente ${setup.locationId}`, vid);
    }
    if (setup.puzzle && setup.puzzle.options.length > 0 && !setup.puzzle.options.includes(setup.puzzle.answer)) {
      add('01-riferimenti', `${setup.clueId}: la risposta dell'enigma non è fra le opzioni`, vid);
    }
  }
  for (const clue of c.clues) {
    if (!setupByClue.has(clue.id)) add('01-riferimenti', `indizio senza collocazione nella variante: ${clue.id}`, vid);
    for (const f of clue.reveals) {
      if (!factIds.has(f)) add('01-riferimenti', `${clue.id}: rivela un fatto inesistente ${f}`, vid);
    }
  }

  for (const inf of v.inferences) {
    for (const path of inf.paths) {
      for (const node of path) {
        const exists =
          (node.startsWith('clue.') && ctx.clueIds.has(node)) ||
          (node.startsWith('fact.') && factIds.has(node)) ||
          (node.startsWith('inf.') && v.inferences.some((i) => i.id === node));
        if (!exists) add('01-riferimenti', `${inf.id}: nodo inesistente ${node}`, vid);
      }
    }
  }

  const profileRoles = new Set(v.roleProfiles.map((p) => p.roleId));
  for (const role of c.roles) {
    if (!profileRoles.has(role.id)) add('01-riferimenti', `manca il profilo di ${role.id}`, vid);
  }
  for (const p of v.roleProfiles) {
    if (!ctx.secretIds.has(p.secretId)) add('01-riferimenti', `${p.roleId}: segreto inesistente ${p.secretId}`, vid);
    if (!ctx.goalIds.has(p.objectiveId)) add('01-riferimenti', `${p.roleId}: obiettivo inesistente ${p.objectiveId}`, vid);
    if (!ctx.clueIds.has(p.exclusiveClueId)) {
      add('01-riferimenti', `${p.roleId}: indizio esclusivo inesistente ${p.exclusiveClueId}`, vid);
    }
  }
  const exclusives = v.roleProfiles.map((p) => p.exclusiveClueId);
  if (new Set(exclusives).size !== exclusives.length) {
    add('01-riferimenti', 'due ruoli condividono lo stesso indizio esclusivo', vid);
  }
  const usedSecrets = new Set(v.roleProfiles.map((p) => p.secretId));
  if (usedSecrets.size !== v.roleProfiles.length) add('01-riferimenti', 'segreti ripetuti fra i ruoli', vid);
  const usedGoals = new Set(v.roleProfiles.map((p) => p.objectiveId));
  if (usedGoals.size !== v.roleProfiles.length) add('01-riferimenti', 'obiettivi ripetuti fra i ruoli', vid);

  for (const witId of Object.keys(v.witnessLines)) {
    if (!ctx.witIds.has(witId)) add('01-riferimenti', `testimonianze per testimone inesistente ${witId}`, vid);
  }
  for (const w of c.witnesses) {
    if (!v.witnessLines[w.id]) add('01-riferimenti', `mancano le battute del testimone ${w.id}`, vid);
  }

  // ── grafo ──────────────────────────────────────────────────────────────────
  const graph = buildGraph(c.clues, v.facts, v.inferences, v.contradictions);
  const universe = c.clues.map((x) => x.id);
  const full = closure(graph, universe);

  ctx.stats.inferencesPerVariant.push(v.inferences.length);
  ctx.stats.timelineEntriesPerVariant.push(v.timeline.length);

  // ── 02 · contraddizioni irrisolvibili ──────────────────────────────────────
  for (const contra of v.contradictions) {
    if (full.has(contra.a) && full.has(contra.b)) {
      add(
        '02-contraddizioni',
        `contraddizione irrisolvibile ${contra.id}: ${contra.a} e ${contra.b} sono entrambi derivabili dalle prove`,
        vid,
      );
    }
    if (contra.implicates && !ctx.roleIds.has(contra.implicates)) {
      add('01-riferimenti', `${contra.id}: implica un ruolo inesistente`, vid);
    }
  }

  // ── 03 · raggiungibilità della soluzione ───────────────────────────────────
  const targets: { kind: 'culprit' | 'motive' | 'method' | 'sequence'; nodes: string[] }[] = (
    ['culprit', 'motive', 'method', 'sequence'] as const
  ).map((kind) => ({
    kind,
    nodes: v.inferences.filter((i) => i.concludes === kind).map((i) => i.id),
  }));

  for (const t of targets) {
    if (t.nodes.length === 0) {
      add('03-soluzione', `nessuna inferenza conclusiva di tipo "${t.kind}"`, vid);
      continue;
    }
    const reachable = t.nodes.filter((n) => full.has(n));
    if (reachable.length === 0) {
      add('03-soluzione', `la conclusione "${t.kind}" non è derivabile nemmeno con tutti gli indizi`, vid);
    }
  }

  // ── 04 · non deducibile troppo presto ──────────────────────────────────────
  const act1Clues = v.clueSetup.filter((s) => s.act === 1).map((s) => s.clueId);
  const act1 = closure(graph, act1Clues);
  const culpritNodes = targets.find((t) => t.kind === 'culprit')?.nodes ?? [];
  if (culpritNodes.some((n) => act1.has(n))) {
    add('04-anticipo', 'il colpevole è deducibile già con i soli indizi dell\'Atto I', vid);
  }
  const act12 = closure(
    graph,
    v.clueSetup.filter((s) => s.act <= 2).map((s) => s.clueId),
  );
  if (culpritNodes.every((n) => !act12.has(n)) && culpritNodes.length > 0) {
    // avviso: il caso diventa risolvibile solo in Atto III, la partita rischia di essere frustrante
    add('04-anticipo', 'il colpevole non è derivabile prima dell\'Atto III', vid, 'avviso');
  }

  // ── 05 · almeno due percorsi indipendenti ──────────────────────────────────
  for (const kind of ['culprit', 'motive', 'method'] as const) {
    const nodes = targets.find((t) => t.kind === kind)?.nodes ?? [];
    const best = nodes.reduce((max, n) => Math.max(max, independentPathCount(graph, n)), 0);
    if (best < 2) {
      add('05-percorsi', `la conclusione "${kind}" ha ${best} percorso/i indipendente/i, ne servono almeno 2`, vid);
    }
  }

  // ── 06 · indizi critici recuperabili anche senza il giocatore ──────────────
  const exclusiveSet = new Set(exclusives);
  const criticalSet = new Set<string>();
  for (const kind of ['culprit', 'motive', 'method'] as const) {
    const nodes = targets.find((t) => t.kind === kind)?.nodes ?? [];
    for (const n of nodes) {
      if (!full.has(n)) continue;
      for (const cl of criticalClues(graph, n, universe)) criticalSet.add(cl);
    }
  }
  for (const clueId of criticalSet) {
    const setup = setupByClue.get(clueId);
    if (!setup) continue;
    if (setup.locationId === null) {
      add(
        '06-ridondanza',
        `l'indizio critico ${clueId} non è recuperabile da nessun ambiente: se il giocatore che lo possiede si disconnette il caso diventa irrisolvibile`,
        vid,
      );
    }
    if (exclusiveSet.has(clueId) && setup.locationId === null) {
      add('06-ridondanza', `l'indizio critico ${clueId} è assegnato in esclusiva a un solo giocatore`, vid);
    }
  }
  // segnala la relevance dichiarata incoerente con il grafo
  for (const setup of v.clueSetup) {
    if (setup.relevance === 'critico' && !criticalSet.has(setup.clueId)) {
      const stillReachable = culpritNodes.some((n) =>
        closure(
          graph,
          universe.filter((u) => u !== setup.clueId),
        ).has(n),
      );
      if (stillReachable && criticalSet.size > 0) {
        add(
          '06-ridondanza',
          `${setup.clueId} è marcato "critico" ma la soluzione resta derivabile senza di esso`,
          vid,
          'avviso',
        );
      }
    }
    if (setup.relevance === 'falsa-pista' && criticalSet.has(setup.clueId)) {
      add('06-ridondanza', `${setup.clueId} è marcato "falsa-pista" ma è indispensabile`, vid);
    }
  }

  // ── 07 e 08 · coerenza temporale e spaziale ────────────────────────────────
  for (const issue of checkTimeline(v.timeline, c.locations)) {
    add(issue.kind === 'luogo-inesistente' ? '08-spazio' : '07-tempo', issue.message, vid);
  }
  for (const p of v.roleProfiles) {
    for (const issue of checkTimeline(p.trueTimeline, c.locations)) {
      add(issue.kind === 'luogo-inesistente' ? '08-spazio' : '07-tempo', `${p.roleId} · ${issue.message}`, vid);
    }
  }
  // la cronologia principale deve coprire il momento del delitto
  if (v.timeline.length < 12) add('07-tempo', 'cronologia troppo povera: servono almeno 12 voci', vid);

  // il colpevole deve comparire nella cronologia
  if (!v.timeline.some((e) => e.who === v.culpritRoleId)) {
    add('07-tempo', 'il colpevole non compare nella cronologia reale', vid);
  }
  // la ricostruzione falsa deve differire da quella vera
  const trueSig = v.timeline
    .filter((e) => e.who === v.culpritRoleId)
    .map((e) => `${e.from}-${e.to}@${e.where}`)
    .sort()
    .join(',');
  const falseSig = v.falseReconstruction.timeline
    .filter((e) => e.who === v.culpritRoleId)
    .map((e) => `${e.from}-${e.to}@${e.where}`)
    .sort()
    .join(',');
  if (trueSig && trueSig === falseSig) {
    add('09-varianti', 'la ricostruzione falsa del colpevole coincide con quella vera', vid);
  }
  if (v.falseReconstruction.scapegoatRoleId === v.culpritRoleId) {
    add('09-varianti', 'il colpevole non può indicare se stesso come capro espiatorio', vid);
  }

  // ── 10 · l'AI non può introdurre fatti determinanti ────────────────────────
  const criticalFacts = new Set<string>();
  for (const clueId of criticalSet) {
    const clue = c.clues.find((x) => x.id === clueId);
    for (const f of clue?.reveals ?? []) criticalFacts.add(f);
  }
  for (const [witId, lines] of Object.entries(v.witnessLines)) {
    for (const line of lines) {
      for (const factId of line.reveals) {
        if (!factIds.has(factId)) {
          add('01-riferimenti', `${witId}: la battuta "${line.topic}" rivela un fatto inesistente ${factId}`, vid);
          continue;
        }
        const sources = c.clues.filter((cl) => cl.reveals.includes(factId));
        const isCommon = v.facts.find((f) => f.id === factId)?.common === true;
        if (sources.length === 0 && !isCommon) {
          add(
            '10-ai',
            `${witId}/${line.topic}: il fatto ${factId} è ottenibile solo da un testimone. Nessun fatto può dipendere unicamente dal livello narrativo.`,
            vid,
          );
        }
        if (criticalFacts.has(factId) && sources.length < 1) {
          add('10-ai', `${witId}/${line.topic}: espone il fatto determinante ${factId} senza copertura da indizio`, vid);
        }
      }
    }
  }
  // nessuna battuta può nominare direttamente il colpevole prima dell'Atto III
  const culpritRole = c.roles.find((r) => r.id === v.culpritRoleId);
  if (culpritRole) {
    for (const [witId, lines] of Object.entries(v.witnessLines)) {
      for (const line of lines) {
        const surname = culpritRole.name.split(' ').slice(-1)[0] ?? culpritRole.name;
        if (line.fromAct < 3 && /colpevol|assassin|è stat[oa] lui|è stata lei/i.test(line.text)) {
          add('10-ai', `${witId}/${line.topic}: una testimonianza non può dichiarare la colpevolezza`, vid);
        }
        if (line.fromAct < 2 && line.text.includes(surname) && /ucci|amm[aeo]zz|veleno/i.test(line.text)) {
          add('10-ai', `${witId}/${line.topic}: accusa esplicita troppo precoce`, vid, 'avviso');
        }
      }
    }
  }
}

export function validateCases(cases: readonly unknown[]): ValidationReport[] {
  return cases.map((c) => validateCase(c));
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  const mark = report.ok ? '✔' : '✘';
  lines.push(`${mark} ${report.caseId}`);
  lines.push(
    `   ruoli ${report.stats.roles} · ambienti ${report.stats.locations} · indizi ${report.stats.clues} · ` +
      `false piste ${report.stats.redHerrings} · segreti ${report.stats.secrets} · obiettivi ${report.stats.objectives} · ` +
      `eventi ${report.stats.events} · varianti ${report.stats.variants}`,
  );
  lines.push(
    `   inferenze/variante ${report.stats.inferencesPerVariant.join('/')} · ` +
      `voci cronologia ${report.stats.timelineEntriesPerVariant.join('/')}`,
  );
  for (const issue of report.issues) {
    const tag = issue.severity === 'errore' ? '  ERRORE' : '  avviso';
    lines.push(`${tag} [${issue.check}${issue.variantId ? ` · ${issue.variantId}` : ''}] ${issue.message}`);
  }
  return lines.join('\n');
}
