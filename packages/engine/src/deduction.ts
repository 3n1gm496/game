import type { ClueDef, FactDef, InferenceDef, ContradictionDef } from './schema/case.js';

/**
 * Motore di deduzione deterministico.
 *
 * Un nodo del grafo è:
 *   - `clue.*`  un indizio posseduto;
 *   - `fact.*`  un fatto, noto a tutti (`common`) oppure rivelato da un indizio;
 *   - `inf.*`   un'inferenza, derivabile se almeno uno dei suoi percorsi lo è.
 *
 * Il motore non conosce la narrativa: lavora solo su identificatori.
 * La verità del caso vive qui e non può essere toccata dal modello linguistico.
 */

export type NodeId = string;

export interface DeductionGraph {
  readonly clues: ReadonlyMap<string, ClueDef>;
  readonly facts: ReadonlyMap<string, FactDef>;
  readonly inferences: ReadonlyMap<string, InferenceDef>;
  /** fact.id → indizi che lo rivelano */
  readonly factSources: ReadonlyMap<string, string[]>;
  readonly contradictions: readonly ContradictionDef[];
}

export function buildGraph(
  clues: readonly ClueDef[],
  facts: readonly FactDef[],
  inferences: readonly InferenceDef[],
  contradictions: readonly ContradictionDef[] = [],
): DeductionGraph {
  const clueMap = new Map(clues.map((c) => [c.id, c]));
  const factMap = new Map(facts.map((f) => [f.id, f]));
  const infMap = new Map(inferences.map((i) => [i.id, i]));
  const factSources = new Map<string, string[]>();
  for (const clue of clues) {
    for (const factId of clue.reveals) {
      const list = factSources.get(factId);
      if (list) list.push(clue.id);
      else factSources.set(factId, [clue.id]);
    }
  }
  return {
    clues: clueMap,
    facts: factMap,
    inferences: infMap,
    factSources,
    contradictions,
  };
}

/**
 * Chiusura deduttiva: tutti i nodi derivabili a partire da un insieme di indizi.
 * Punto fisso, quindi indipendente dall'ordine: lo stesso insieme di indizi
 * produce sempre la stessa conoscenza.
 */
export function closure(graph: DeductionGraph, ownedClueIds: Iterable<string>): Set<NodeId> {
  const owned = new Set(ownedClueIds);
  const derived = new Set<NodeId>();

  for (const [factId, fact] of graph.facts) {
    if (fact.common) derived.add(factId);
  }

  let changed = true;
  let guard = 0;
  while (changed) {
    changed = false;
    guard += 1;
    if (guard > 200) break; // il grafo è finito: protezione contro cicli patologici

    for (const clueId of owned) {
      if (derived.has(clueId)) continue;
      const clue = graph.clues.get(clueId);
      if (!clue) continue;
      if (clue.requires.every((r) => derived.has(r))) {
        derived.add(clueId);
        for (const factId of clue.reveals) {
          if (!derived.has(factId)) {
            derived.add(factId);
            changed = true;
          }
        }
        changed = true;
      }
    }

    for (const [infId, inf] of graph.inferences) {
      if (derived.has(infId)) continue;
      if (inf.paths.some((path) => path.every((n) => derived.has(n)))) {
        derived.add(infId);
        changed = true;
      }
    }
  }

  return derived;
}

export function isDerivable(
  graph: DeductionGraph,
  ownedClueIds: Iterable<string>,
  target: NodeId,
): boolean {
  return closure(graph, ownedClueIds).has(target);
}

/** Nodi conclusivi per tipo di conclusione. */
export function conclusionNodes(
  graph: DeductionGraph,
  kind: InferenceDef['concludes'],
): string[] {
  const out: string[] = [];
  for (const [id, inf] of graph.inferences) {
    if (inf.concludes === kind) out.push(id);
  }
  return out.sort();
}

// ─────────────────────────────────────────────────────────────────────────────
// Insiemi di supporto (percorsi logici)
// ─────────────────────────────────────────────────────────────────────────────

const MAX_SETS_PER_NODE = 24;

/** Rimuove i sovrainsiemi: restano solo i supporti minimali. */
function minimalize(sets: Set<string>[]): Set<string>[] {
  const sorted = [...sets].sort((a, b) => a.size - b.size);
  const kept: Set<string>[] = [];
  for (const s of sorted) {
    if (kept.some((k) => isSubset(k, s))) continue;
    kept.push(s);
    if (kept.length >= MAX_SETS_PER_NODE) break;
  }
  return kept;
}

function isSubset(a: Set<string>, b: Set<string>): boolean {
  if (a.size > b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function keyOf(s: Set<string>): string {
  return [...s].sort().join('|');
}

/**
 * Tutti gli insiemi minimali di indizi che permettono di derivare `target`.
 * Restituisce un elenco limitato a MAX_SETS_PER_NODE per evitare esplosione
 * combinatoria: è sufficiente per contare i percorsi indipendenti.
 */
export function supportSets(
  graph: DeductionGraph,
  target: NodeId,
  visiting: Set<NodeId> = new Set(),
  memo: Map<NodeId, Set<string>[]> = new Map(),
): Set<string>[] {
  const cached = memo.get(target);
  if (cached) return cached;
  if (visiting.has(target)) return []; // ciclo: nessun supporto per questa via

  visiting.add(target);
  let result: Set<string>[] = [];

  if (target.startsWith('clue.')) {
    const clue = graph.clues.get(target);
    if (clue) {
      if (clue.requires.length === 0) {
        result = [new Set([clue.id])];
      } else {
        const combos = combineAnd(
          graph,
          clue.requires,
          visiting,
          memo,
        );
        result = combos.map((c) => new Set([...c, clue.id]));
      }
    }
  } else if (target.startsWith('fact.')) {
    const fact = graph.facts.get(target);
    if (fact?.common) {
      result = [new Set<string>()];
    } else {
      const sources = graph.factSources.get(target) ?? [];
      const collected: Set<string>[] = [];
      for (const clueId of sources) {
        for (const s of supportSets(graph, clueId, visiting, memo)) collected.push(s);
      }
      result = minimalize(collected);
    }
  } else if (target.startsWith('inf.')) {
    const inf = graph.inferences.get(target);
    if (inf) {
      const collected: Set<string>[] = [];
      for (const path of inf.paths) {
        for (const combo of combineAnd(graph, path, visiting, memo)) collected.push(combo);
      }
      result = minimalize(collected);
    }
  }

  visiting.delete(target);
  memo.set(target, result);
  return result;
}

function combineAnd(
  graph: DeductionGraph,
  nodes: readonly NodeId[],
  visiting: Set<NodeId>,
  memo: Map<NodeId, Set<string>[]>,
): Set<string>[] {
  let acc: Set<string>[] = [new Set<string>()];
  for (const node of nodes) {
    const sets = supportSets(graph, node, visiting, memo);
    if (sets.length === 0) return [];
    const next: Set<string>[] = [];
    const seen = new Set<string>();
    for (const a of acc) {
      for (const b of sets) {
        const merged = new Set([...a, ...b]);
        const k = keyOf(merged);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push(merged);
      }
    }
    acc = minimalize(next);
    if (acc.length === 0) return [];
  }
  return acc;
}

/**
 * Numero massimo di percorsi a due a due disgiunti (per indizi) verso `target`.
 * Il validatore richiede ≥ 2 per colpevole, movente e metodo: la soluzione non
 * deve mai dipendere da un unico filo logico.
 */
export function independentPathCount(graph: DeductionGraph, target: NodeId): number {
  const sets = supportSets(graph, target).filter((s) => s.size > 0);
  if (sets.length === 0) return 0;
  // greedy su insiemi ordinati per cardinalità: sufficiente e deterministico
  const ordered = [...sets].sort((a, b) => a.size - b.size || keyOf(a).localeCompare(keyOf(b)));
  const used = new Set<string>();
  let count = 0;
  for (const s of ordered) {
    let disjoint = true;
    for (const v of s) {
      if (used.has(v)) {
        disjoint = false;
        break;
      }
    }
    if (disjoint) {
      count += 1;
      for (const v of s) used.add(v);
    }
  }
  return count;
}

/**
 * Indizi senza i quali `target` non è più derivabile, dato l'universo completo.
 * Sono i punti di rottura: devono essere sempre recuperabili da un ambiente,
 * mai custoditi soltanto da un giocatore.
 */
export function criticalClues(
  graph: DeductionGraph,
  target: NodeId,
  universe: readonly string[],
): string[] {
  if (!closure(graph, universe).has(target)) return [];
  const out: string[] = [];
  for (const clueId of universe) {
    const without = universe.filter((c) => c !== clueId);
    if (!closure(graph, without).has(target)) out.push(clueId);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contraddizioni
// ─────────────────────────────────────────────────────────────────────────────

export interface DetectedContradiction {
  id: string;
  text: string;
  a: NodeId;
  b: NodeId;
  implicates?: string;
}

/**
 * Contraddizioni *già presenti* nelle affermazioni messe in bacheca.
 * Il motore non ne inventa: le riconosce fra quelle dichiarate nel caso.
 */
export function detectContradictions(
  graph: DeductionGraph,
  assertedNodes: Iterable<NodeId>,
): DetectedContradiction[] {
  const asserted = new Set(assertedNodes);
  const found: DetectedContradiction[] = [];
  for (const c of graph.contradictions) {
    if (asserted.has(c.a) && asserted.has(c.b)) {
      found.push({
        id: c.id,
        text: c.text,
        a: c.a,
        b: c.b,
        ...(c.implicates ? { implicates: c.implicates } : {}),
      });
    }
  }
  return found;
}

/**
 * Percorso leggibile (catena di inferenze) usato dall'epilogo per mostrare
 * «come si arrivava alla soluzione».
 */
export function explainPath(graph: DeductionGraph, target: NodeId, owned: Iterable<string>): NodeId[] {
  const derived = closure(graph, owned);
  if (!derived.has(target)) return [];
  const chain: NodeId[] = [];
  const seen = new Set<NodeId>();

  const walk = (node: NodeId): void => {
    if (seen.has(node)) return;
    seen.add(node);
    if (node.startsWith('inf.')) {
      const inf = graph.inferences.get(node);
      const path = inf?.paths.find((p) => p.every((n) => derived.has(n)));
      for (const child of path ?? []) walk(child);
    } else if (node.startsWith('fact.')) {
      const fact = graph.facts.get(node);
      if (!fact?.common) {
        const src = (graph.factSources.get(node) ?? []).find((c) => derived.has(c));
        if (src) walk(src);
      }
    }
    chain.push(node);
  };

  walk(target);
  return chain;
}
