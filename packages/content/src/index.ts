import type { CaseDef, PublicCase } from '@meridien/engine';
import { toPublicCase } from '@meridien/engine';
import { suite404 } from './cases/suite404/index.js';
import { orologioSommerso } from './cases/orologio/index.js';
import { ultimoValzer } from './cases/valzer/index.js';

/**
 * Catalogo completo dei casi. Questo entry point contiene la verità:
 * va importato **solo dal server e dagli strumenti**, mai dal client.
 * Il client usa `@meridien/content/public`.
 */

export const CASES: CaseDef[] = [suite404, orologioSommerso, ultimoValzer];

const byId = new Map(CASES.map((c) => [c.id, c]));

export function getCase(id: string): CaseDef | undefined {
  return byId.get(id);
}

export function allCases(): CaseDef[] {
  return CASES;
}

export function listPublic(): PublicCase[] {
  return CASES.map(toPublicCase);
}

export const contentLibrary = { getCase, allCases, listPublic };

export { suite404, orologioSommerso, ultimoValzer };
export { WITNESS_CAST } from './shared/witnesses.js';
