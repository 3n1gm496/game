import type { LocationDef, TimelineEntry } from './schema/case.js';

/** Formatta i minuti dalla mezzanotte in `HH:MM`. */
export function formatMinute(m: number): string {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const min = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function parseMinute(hhmm: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) throw new Error(`orario non valido: ${hhmm}`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) throw new Error(`orario fuori intervallo: ${hhmm}`);
  return h * 60 + m;
}

/**
 * La notte del delitto attraversa la mezzanotte. Per ordinare correttamente
 * gli eventi si usa un asse continuo che colloca le ore piccole dopo le grandi.
 */
export const NIGHT_PIVOT = 12 * 60; // 12:00
export function nightAxis(minute: number): number {
  return minute < NIGHT_PIVOT ? minute + 1440 : minute;
}

export function sortTimeline(entries: readonly TimelineEntry[]): TimelineEntry[] {
  return [...entries].sort((a, b) => {
    const d = nightAxis(a.from) - nightAxis(b.from);
    if (d !== 0) return d;
    const d2 = nightAxis(a.to) - nightAxis(b.to);
    if (d2 !== 0) return d2;
    return a.who.localeCompare(b.who);
  });
}

export function overlaps(a: TimelineEntry, b: TimelineEntry): boolean {
  const a0 = nightAxis(a.from);
  const a1 = a0 + duration(a);
  const b0 = nightAxis(b.from);
  const b1 = b0 + duration(b);
  return a0 < b1 && b0 < a1;
}

export function duration(e: TimelineEntry): number {
  const from = nightAxis(e.from);
  const to = nightAxis(e.to);
  return to >= from ? to - from : to + 1440 - from;
}

export interface TimelineIssue {
  kind: 'sovrapposizione' | 'salto-impossibile' | 'luogo-inesistente' | 'ordine';
  who: string;
  message: string;
}

/** Distanze minime fra ambienti, calcolate sulla mappa (Floyd–Warshall). */
export function travelMatrix(locations: readonly LocationDef[]): Map<string, Map<string, number>> {
  const ids = locations.map((l) => l.id);
  const dist = new Map<string, Map<string, number>>();
  for (const a of ids) {
    const row = new Map<string, number>();
    for (const b of ids) row.set(b, a === b ? 0 : Number.POSITIVE_INFINITY);
    dist.set(a, row);
  }
  for (const loc of locations) {
    for (const edge of loc.adjacent) {
      const row = dist.get(loc.id);
      if (!row) continue;
      const current = row.get(edge.to) ?? Number.POSITIVE_INFINITY;
      if (edge.minutes < current) row.set(edge.to, edge.minutes);
      // la mappa è percorribile nei due sensi
      const back = dist.get(edge.to);
      if (back) {
        const cur = back.get(loc.id) ?? Number.POSITIVE_INFINITY;
        if (edge.minutes < cur) back.set(loc.id, edge.minutes);
      }
    }
  }
  for (const k of ids) {
    for (const i of ids) {
      for (const j of ids) {
        const dik = dist.get(i)?.get(k) ?? Number.POSITIVE_INFINITY;
        const dkj = dist.get(k)?.get(j) ?? Number.POSITIVE_INFINITY;
        const dij = dist.get(i)?.get(j) ?? Number.POSITIVE_INFINITY;
        if (dik + dkj < dij) dist.get(i)?.set(j, dik + dkj);
      }
    }
  }
  return dist;
}

/**
 * Verifica la coerenza temporale e spaziale di una cronologia:
 * nessuno può essere in due posti insieme, né spostarsi più in fretta
 * di quanto la mappa consenta.
 */
export function checkTimeline(
  entries: readonly TimelineEntry[],
  locations: readonly LocationDef[],
): TimelineIssue[] {
  const issues: TimelineIssue[] = [];
  const known = new Set(locations.map((l) => l.id));
  const dist = travelMatrix(locations);

  for (const e of entries) {
    if (!known.has(e.where)) {
      issues.push({
        kind: 'luogo-inesistente',
        who: e.who,
        message: `${e.who}: ambiente sconosciuto "${e.where}" alle ${formatMinute(e.from)}`,
      });
    }
  }

  const byPerson = new Map<string, TimelineEntry[]>();
  for (const e of entries) {
    const list = byPerson.get(e.who);
    if (list) list.push(e);
    else byPerson.set(e.who, [e]);
  }

  for (const [who, list] of byPerson) {
    const sorted = sortTimeline(list);
    for (let i = 0; i < sorted.length; i += 1) {
      const cur = sorted[i]!;
      if (duration(cur) < 0) {
        issues.push({ kind: 'ordine', who, message: `${who}: intervallo invertito alle ${formatMinute(cur.from)}` });
      }
      const next = sorted[i + 1];
      if (!next) continue;
      if (overlaps(cur, next) && cur.where !== next.where) {
        issues.push({
          kind: 'sovrapposizione',
          who,
          message: `${who}: in due luoghi contemporaneamente (${cur.where} / ${next.where}) verso le ${formatMinute(next.from)}`,
        });
        continue;
      }
      const gap = nightAxis(next.from) - (nightAxis(cur.from) + duration(cur));
      const need = dist.get(cur.where)?.get(next.where) ?? 0;
      if (Number.isFinite(need) && gap < need - 0.001 && cur.where !== next.where) {
        issues.push({
          kind: 'salto-impossibile',
          who,
          message: `${who}: da ${cur.where} a ${next.where} servono ${need} min, disponibili ${gap} (${formatMinute(cur.to)} → ${formatMinute(next.from)})`,
        });
      }
    }
  }

  return issues;
}

/** Chi si trovava dove in un dato minuto. */
export function whoWasAt(
  entries: readonly TimelineEntry[],
  minute: number,
  locationId?: string,
): TimelineEntry[] {
  const t = nightAxis(minute);
  return entries.filter((e) => {
    const from = nightAxis(e.from);
    const to = from + duration(e);
    const inWindow = t >= from && t <= to;
    return inWindow && (!locationId || e.where === locationId);
  });
}

/** Voci pubblicabili nella ricostruzione (le `hidden` restano per l'epilogo). */
export function publicTimeline(entries: readonly TimelineEntry[]): TimelineEntry[] {
  return sortTimeline(entries.filter((e) => !e.hidden));
}
