import type { CaseDef, ObjectiveDef, VariantDef } from './schema/case.js';

/**
 * Punteggio deterministico. Il Regista AI non può toccarlo: riceve i risultati
 * già calcolati e ne scrive soltanto il commento.
 */

export const POINTS = {
  culprit: 40,
  motive: 15,
  method: 15,
  sequencePerPosition: 5,
  sequenceMax: 20,
  sharedClueRelevant: 4,
  sharedClueMax: 24,
  contradictionFound: 8,
  objective: 20,
  collectiveCorrect: 25,
  culpritEscapes: 70,
  lieBelieved: 10,
  wrongAccusation: -10,
} as const;

export interface Accusation {
  playerId: string;
  culpritRoleId: string;
  motiveKey: string;
  methodKey: string;
  /** ordine proposto dei beat */
  sequence: string[];
  submittedAt: number;
}

export interface PlayerRecord {
  playerId: string;
  roleId: string;
  isCulprit: boolean;
  /** indizi condivisi in bacheca */
  sharedClueIds: string[];
  /** contraddizioni valide individuate */
  contradictionsFound: string[];
  /** dichiarazione pubblica scelta in Atto I */
  declarationKey: 'verita' | 'omissione' | 'bugia' | null;
  /** la dichiarazione è stata smentita durante la partita? */
  declarationRefuted: boolean;
  /** obiettivo secondario assegnato */
  objectiveId: string;
  objectiveCompleted: boolean;
  connected: boolean;
}

export interface CollectiveVerdict {
  culpritRoleId: string;
  motiveKey: string;
  methodKey: string;
  sequence: string[];
}

export interface ScoreBreakdown {
  label: string;
  points: number;
}

export interface PlayerScore {
  playerId: string;
  roleId: string;
  total: number;
  breakdown: ScoreBreakdown[];
  awards: Award[];
}

export interface Award {
  id: string;
  title: string;
  description: string;
}

export interface ScoreResult {
  players: PlayerScore[];
  teamPoints: number;
  collectiveCorrect: boolean;
  culpritEscaped: boolean;
  /** chi era davvero il colpevole */
  culpritRoleId: string;
  culpritPlayerId: string | null;
  solution: {
    culpritRoleId: string;
    motiveKey: string;
    motiveLabel: string;
    methodKey: string;
    methodLabel: string;
    sequence: string[];
  };
  /** indizi che erano determinanti e che nessuno ha condiviso */
  ignoredCriticalClues: string[];
  /** indizi condivisi che si sono rivelati rilevanti */
  decisiveShares: { playerId: string; clueId: string }[];
}

export interface ScoreInput {
  caseDef: CaseDef;
  variant: VariantDef;
  accusations: Accusation[];
  records: PlayerRecord[];
  collective: CollectiveVerdict | null;
  /** indizi che il grafo considera indispensabili per la soluzione */
  criticalClueIds: readonly string[];
}

function sequenceScore(proposed: readonly string[], truth: readonly string[]): number {
  let pts = 0;
  for (let i = 0; i < truth.length; i += 1) {
    if (proposed[i] && proposed[i] === truth[i]) pts += POINTS.sequencePerPosition;
  }
  return Math.min(pts, POINTS.sequenceMax);
}

export function computeScores(input: ScoreInput): ScoreResult {
  const { caseDef, variant, accusations, records, collective, criticalClueIds } = input;
  const truthCulprit = variant.culpritRoleId;
  const critical = new Set(criticalClueIds);

  const culpritRecord = records.find((r) => r.isCulprit) ?? null;
  const accById = new Map(accusations.map((a) => [a.playerId, a]));

  const sharedByAnyone = new Set(records.flatMap((r) => r.sharedClueIds));
  const ignoredCriticalClues = [...critical].filter((c) => !sharedByAnyone.has(c)).sort();
  const decisiveShares: { playerId: string; clueId: string }[] = [];
  for (const r of records) {
    for (const clueId of r.sharedClueIds) {
      if (critical.has(clueId)) decisiveShares.push({ playerId: r.playerId, clueId });
    }
  }

  const collectiveCorrect =
    collective !== null &&
    collective.culpritRoleId === truthCulprit &&
    collective.motiveKey === variant.motiveKey &&
    collective.methodKey === variant.methodKey;
  const collectiveNamedCulprit = collective !== null && collective.culpritRoleId === truthCulprit;
  const culpritEscaped = !collectiveCorrect;

  const players: PlayerScore[] = records.map((r) => {
    const breakdown: ScoreBreakdown[] = [];
    const acc = accById.get(r.playerId) ?? null;

    if (acc) {
      if (acc.culpritRoleId === truthCulprit) {
        breakdown.push({ label: 'Colpevole individuato', points: POINTS.culprit });
      } else {
        breakdown.push({ label: 'Accusa a un innocente', points: POINTS.wrongAccusation });
      }
      if (acc.motiveKey === variant.motiveKey) {
        breakdown.push({ label: 'Movente esatto', points: POINTS.motive });
      }
      if (acc.methodKey === variant.methodKey) {
        breakdown.push({ label: 'Metodo esatto', points: POINTS.method });
      }
      const seq = sequenceScore(acc.sequence, variant.sequence);
      if (seq > 0) breakdown.push({ label: 'Sequenza ricostruita', points: seq });
    } else {
      breakdown.push({ label: 'Nessuna accusa depositata', points: 0 });
    }

    const relevantShares = r.sharedClueIds.filter((c) => critical.has(c)).length;
    if (relevantShares > 0) {
      breakdown.push({
        label: `Indizi decisivi condivisi (${relevantShares})`,
        points: Math.min(relevantShares * POINTS.sharedClueRelevant, POINTS.sharedClueMax),
      });
    }
    if (r.contradictionsFound.length > 0) {
      breakdown.push({
        label: `Contraddizioni smascherate (${r.contradictionsFound.length})`,
        points: r.contradictionsFound.length * POINTS.contradictionFound,
      });
    }
    if (r.objectiveCompleted) {
      const obj = caseDef.objectives.find((o) => o.id === r.objectiveId);
      breakdown.push({ label: `Obiettivo: ${obj?.title ?? 'personale'}`, points: obj?.points ?? POINTS.objective });
    }
    if (r.declarationKey === 'bugia' && !r.declarationRefuted) {
      breakdown.push({ label: 'Bugia mai smentita', points: POINTS.lieBelieved });
    }

    if (r.isCulprit) {
      if (culpritEscaped) breakdown.push({ label: 'Il colpevole è rimasto libero', points: POINTS.culpritEscapes });
    } else if (collectiveCorrect) {
      breakdown.push({ label: 'Verdetto collettivo corretto', points: POINTS.collectiveCorrect });
    }

    const total = breakdown.reduce((sum, b) => sum + b.points, 0);
    return { playerId: r.playerId, roleId: r.roleId, total, breakdown, awards: [] };
  });

  const teamPoints = players.filter((p) => !records.find((r) => r.playerId === p.playerId)?.isCulprit).reduce(
    (sum, p) => sum + p.total,
    0,
  );

  assignAwards(players, records, accById, variant, collectiveNamedCulprit);

  const motiveLabel = caseDef.motiveOptions.find((m) => m.key === variant.motiveKey)?.label ?? variant.motiveKey;
  const methodLabel = caseDef.methodOptions.find((m) => m.key === variant.methodKey)?.label ?? variant.methodKey;

  return {
    players: players.sort((a, b) => b.total - a.total || a.playerId.localeCompare(b.playerId)),
    teamPoints,
    collectiveCorrect,
    culpritEscaped,
    culpritRoleId: truthCulprit,
    culpritPlayerId: culpritRecord?.playerId ?? null,
    solution: {
      culpritRoleId: truthCulprit,
      motiveKey: variant.motiveKey,
      motiveLabel,
      methodKey: variant.methodKey,
      methodLabel,
      sequence: [...variant.sequence],
    },
    ignoredCriticalClues,
    decisiveShares,
  };
}

const AWARD_CATALOG: Record<string, { title: string; description: string }> = {
  'silenzio-oro': { title: "Il Silenzio d'Oro", description: 'Ha condiviso meno di tutti e se n\'è vantato.' },
  'lingua-lunga': { title: 'La Lingua Lunga', description: 'Ha messo in bacheca tutto quello che aveva.' },
  'occhio-vetro': { title: "L'Occhio di Vetro", description: 'Ha accusato con assoluta sicurezza la persona sbagliata.' },
  'testimone-inaffidabile': {
    title: 'Il Testimone Inaffidabile',
    description: 'La sua dichiarazione iniziale è stata smentita.',
  },
  'memoria-ferro': { title: 'La Memoria di Ferro', description: 'Ha ricostruito la sequenza senza un errore.' },
  'fantasma-corridoio': { title: 'Il Fantasma del Corridoio', description: 'Nessuno lo ha mai nominato.' },
  'mano-ferma': { title: 'La Mano Ferma', description: 'Colpevole, movente e metodo: tutto esatto.' },
  'maschera-intatta': { title: 'La Maschera Intatta', description: 'Colpevole, e nessuno se n\'è accorto.' },
  'quasi': { title: 'Il Quasi', description: 'Ha indicato il colpevole giusto per la ragione sbagliata.' },
  'archivista': { title: "L'Archivista", description: 'Ha smascherato più contraddizioni di chiunque altro.' },
};

function assignAwards(
  players: PlayerScore[],
  records: readonly PlayerRecord[],
  accById: Map<string, Accusation>,
  variant: VariantDef,
  collectiveNamedCulprit: boolean,
): void {
  const byId = new Map(players.map((p) => [p.playerId, p]));
  const give = (playerId: string, key: string): void => {
    const target = byId.get(playerId);
    const meta = AWARD_CATALOG[key];
    if (!target || !meta) return;
    if (target.awards.some((a) => a.id === key)) return;
    target.awards.push({ id: key, ...meta });
  };

  if (records.length === 0) return;

  const sortedByShare = [...records].sort((a, b) => a.sharedClueIds.length - b.sharedClueIds.length);
  const fewest = sortedByShare[0];
  const most = sortedByShare[sortedByShare.length - 1];
  if (fewest && fewest.sharedClueIds.length === 0) give(fewest.playerId, 'silenzio-oro');
  if (most && most.sharedClueIds.length >= 3) give(most.playerId, 'lingua-lunga');

  const maxContra = Math.max(...records.map((r) => r.contradictionsFound.length));
  if (maxContra >= 2) {
    for (const r of records) if (r.contradictionsFound.length === maxContra) give(r.playerId, 'archivista');
  }

  for (const r of records) {
    const acc = accById.get(r.playerId);
    if (r.declarationRefuted) give(r.playerId, 'testimone-inaffidabile');
    if (!acc) continue;
    const seqPerfect = variant.sequence.every((b, i) => acc.sequence[i] === b);
    if (seqPerfect) give(r.playerId, 'memoria-ferro');
    const right = acc.culpritRoleId === variant.culpritRoleId;
    if (right && acc.motiveKey === variant.motiveKey && acc.methodKey === variant.methodKey) {
      give(r.playerId, 'mano-ferma');
    } else if (right) {
      give(r.playerId, 'quasi');
    } else if (r.sharedClueIds.length >= 2) {
      give(r.playerId, 'occhio-vetro');
    }
    if (r.isCulprit && !collectiveNamedCulprit) give(r.playerId, 'maschera-intatta');
  }

  const accusedRoles = new Set([...accById.values()].map((a) => a.culpritRoleId));
  for (const r of records) {
    if (!accusedRoles.has(r.roleId) && !r.isCulprit) give(r.playerId, 'fantasma-corridoio');
  }
}

/** Verifica se un obiettivo secondario è stato completato. */
export function evaluateObjective(
  objective: ObjectiveDef,
  ctx: {
    record: PlayerRecord;
    allRecords: readonly PlayerRecord[];
    accusations: readonly Accusation[];
    pinnedSecretIds: ReadonlySet<string>;
    publicQuestionsAsked: number;
    ownedClueIds: ReadonlySet<string>;
    playerSecretId: string;
  },
): boolean {
  const n = Number.parseInt(objective.param, 10);
  switch (objective.kind) {
    case 'share-count':
      return ctx.record.sharedClueIds.length >= (Number.isFinite(n) ? n : 2);
    case 'hide-secret':
      return !ctx.pinnedSecretIds.has(ctx.playerSecretId);
    case 'accuse-target': {
      const target = objective.param;
      return ctx.accusations.filter((a) => a.culpritRoleId === target).length >= 2;
    }
    case 'protect-target': {
      const target = objective.param;
      return ctx.accusations.every((a) => a.culpritRoleId !== target);
    }
    case 'ask-questions':
      return ctx.publicQuestionsAsked >= (Number.isFinite(n) ? n : 2);
    case 'find-object':
      return ctx.ownedClueIds.has(objective.param);
    case 'never-share':
      return !ctx.record.sharedClueIds.includes(objective.param);
    case 'be-believed':
      return !ctx.record.declarationRefuted && ctx.record.declarationKey !== null;
    default:
      return false;
  }
}
