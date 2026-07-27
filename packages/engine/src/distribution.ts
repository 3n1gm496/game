import type { CaseDef, ClueSetupDef, VariantDef } from './schema/case.js';
import { createRng, type Rng } from './rng.js';

/**
 * Assegnazione seeded di ruoli e indizi.
 * A parità di seed, caso e numero di giocatori il risultato è sempre identico.
 */

export type GameMode = 'competitiva' | 'cooperativa';

export interface PlayerAssignment {
  playerId: string;
  roleId: string;
  isCulprit: boolean;
  startingClueIds: string[];
}

export interface ClueDrop {
  clueId: string;
  locationId: string;
  hotspot: string;
  act: 1 | 2 | 3;
  relevance: ClueSetupDef['relevance'];
  puzzle: ClueSetupDef['puzzle'];
}

export interface Assignment {
  seed: string;
  caseId: string;
  variantId: string;
  mode: GameMode;
  players: PlayerAssignment[];
  /** ruoli non assegnati (in cooperativa contiene sempre il colpevole) */
  npcRoleIds: string[];
  /** indizi trovabili esplorando, per ambiente */
  drops: ClueDrop[];
  /** indizi che nessuno possiede e che nessun ambiente contiene (riserva del Regista) */
  reserve: string[];
}

export function pickVariant(caseDef: CaseDef, seed: string, forced?: string): VariantDef {
  if (forced) {
    const found = caseDef.variants.find((v) => v.id === forced);
    if (found) return found;
  }
  const rng = createRng(`${seed}::variante::${caseDef.id}`);
  return rng.pick(caseDef.variants);
}

const FALLBACK_HOTSPOT = 'oggetto';

/**
 * Distribuisce ruoli e indizi.
 *
 * Invarianti garantite:
 *  - in modalità competitiva il colpevole è sempre uno dei giocatori;
 *  - in modalità cooperativa il colpevole è sempre un personaggio non giocante;
 *  - ogni giocatore parte con l'indizio esclusivo del proprio ruolo;
 *  - gli indizi esclusivi dei ruoli non assegnati diventano ritrovamenti ambientali;
 *  - ogni indizio con un ambiente dichiarato resta trovabile in quell'ambiente,
 *    anche se un giocatore lo possiede già: la ridondanza è voluta.
 */
export function buildAssignment(
  caseDef: CaseDef,
  variant: VariantDef,
  playerIds: readonly string[],
  mode: GameMode,
  seed: string,
): Assignment {
  if (playerIds.length < 4 || playerIds.length > 8) {
    throw new RangeError(`numero di giocatori non valido: ${playerIds.length} (ammessi 4–8)`);
  }
  const rng = createRng(`${seed}::assegnazione::${variant.id}::${playerIds.length}::${mode}`);

  const allRoleIds = caseDef.roles.map((r) => r.id);
  const culpritId = variant.culpritRoleId;
  const others = allRoleIds.filter((r) => r !== culpritId);

  let chosen: string[];
  if (mode === 'competitiva') {
    const rest = rng.shuffle(others).slice(0, playerIds.length - 1);
    chosen = rng.shuffle([culpritId, ...rest]);
  } else {
    chosen = rng.shuffle(others).slice(0, playerIds.length);
  }

  const orderedPlayers = rng.shuffle([...playerIds]);
  const profileByRole = new Map(variant.roleProfiles.map((p) => [p.roleId, p]));

  const players: PlayerAssignment[] = orderedPlayers.map((playerId, i) => {
    const roleId = chosen[i]!;
    const profile = profileByRole.get(roleId);
    return {
      playerId,
      roleId,
      isCulprit: roleId === culpritId,
      startingClueIds: profile ? [profile.exclusiveClueId] : [],
    };
  });

  const npcRoleIds = allRoleIds.filter((r) => !chosen.includes(r));

  // ── indizi ambientali ──────────────────────────────────────────────────────
  const drops: ClueDrop[] = [];
  const reserve: string[] = [];
  const held = new Set(players.flatMap((p) => p.startingClueIds));

  const locationPool = caseDef.locations.map((l) => l.id);

  for (const setup of variant.clueSetup) {
    if (setup.locationId) {
      drops.push({
        clueId: setup.clueId,
        locationId: setup.locationId,
        hotspot: setup.hotspot ?? FALLBACK_HOTSPOT,
        act: setup.act,
        relevance: setup.relevance,
        puzzle: setup.puzzle,
      });
      continue;
    }
    // indizio senza ambiente: appartiene alla mano di un ruolo
    if (held.has(setup.clueId)) continue;
    const owner = variant.roleProfiles.find((p) => p.exclusiveClueId === setup.clueId);
    if (owner && npcRoleIds.includes(owner.roleId)) {
      // il ruolo non è in gioco: l'indizio diventa un ritrovamento coerente
      const where =
        owner.trueTimeline[Math.min(1, owner.trueTimeline.length - 1)]?.where ??
        rng.pick(locationPool);
      drops.push({
        clueId: setup.clueId,
        locationId: where,
        hotspot: 'consegna',
        act: setup.act === 1 ? 2 : setup.act,
        relevance: setup.relevance,
        puzzle: null,
      });
    } else if (!owner) {
      reserve.push(setup.clueId);
    }
  }

  // Distribuzione equa: ogni giocatore riceve un secondo indizio d'avvio,
  // pescato dalla riserva o dagli indizi ambientali di Atto I meno rilevanti.
  const extraPool = rng.shuffle(
    reserve.length >= players.length
      ? reserve
      : [
          ...reserve,
          ...drops
            .filter((d) => d.act === 1 && d.relevance !== 'critico')
            .map((d) => d.clueId)
            .filter((id) => !held.has(id)),
        ],
  );
  let cursor = 0;
  for (const player of players) {
    const pick = extraPool[cursor];
    cursor += 1;
    if (pick && !held.has(pick)) {
      player.startingClueIds.push(pick);
      held.add(pick);
      const idx = reserve.indexOf(pick);
      if (idx >= 0) reserve.splice(idx, 1);
    }
  }

  // Verifica di equità: nessun giocatore senza indizi.
  for (const player of players) {
    if (player.startingClueIds.length === 0) {
      const fallback = variant.clueSetup.find((s) => !held.has(s.clueId));
      if (fallback) {
        player.startingClueIds.push(fallback.clueId);
        held.add(fallback.clueId);
      }
    }
  }

  return {
    seed,
    caseId: caseDef.id,
    variantId: variant.id,
    mode,
    players,
    npcRoleIds,
    drops: sortDrops(drops),
    reserve,
  };

  function sortDrops(list: ClueDrop[]): ClueDrop[] {
    return [...list].sort((a, b) => a.act - b.act || a.locationId.localeCompare(b.locationId) || a.clueId.localeCompare(b.clueId));
  }
}

/**
 * Un giocatore si disconnette e possiede indizi indispensabili: li rende
 * recuperabili come ritrovamento ambientale, senza duplicare quelli già
 * presenti. È la garanzia che una disconnessione non blocchi mai il caso.
 */
export function redistributeCriticalClues(
  assignment: Assignment,
  variant: VariantDef,
  orphanClueIds: readonly string[],
  currentAct: 1 | 2 | 3,
  rng: Rng = createRng(`${assignment.seed}::redistribuzione`),
): ClueDrop[] {
  const already = new Set(assignment.drops.map((d) => d.clueId));
  const setupByClue = new Map(variant.clueSetup.map((s) => [s.clueId, s]));
  const created: ClueDrop[] = [];
  for (const clueId of orphanClueIds) {
    if (already.has(clueId)) continue;
    const setup = setupByClue.get(clueId);
    if (!setup) continue;
    const where =
      setup.locationId ??
      variant.timeline.find((t) => !t.hidden)?.where ??
      rng.pick(variant.clueSetup.map((s) => s.locationId).filter((l): l is string => Boolean(l)));
    const drop: ClueDrop = {
      clueId,
      locationId: where,
      hotspot: 'consegna',
      act: currentAct,
      relevance: setup.relevance,
      puzzle: null,
    };
    created.push(drop);
    assignment.drops.push(drop);
    already.add(clueId);
  }
  return created;
}

/** Indizi disponibili in un ambiente per un dato atto. */
export function dropsFor(assignment: Assignment, locationId: string, act: 1 | 2 | 3): ClueDrop[] {
  return assignment.drops.filter((d) => d.locationId === locationId && d.act <= act);
}
