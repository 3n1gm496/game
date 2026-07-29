import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { allCases } from '@meridien/content';
import { ICONE_DISPONIBILI, simbolo } from '../icone.js';

/**
 * Nessun indizio senza segno.
 *
 * I casi nominano gli oggetti liberamente; il foglio sprite contiene una
 * trentina di simboli. Se la tabella di corrispondenza resta indietro rispetto
 * ai contenuti, la carta dell'indizio esce con un buco al posto dell'icona — un
 * difetto silenzioso, che nessun errore di compilazione segnala. Questi test lo
 * rendono rumoroso.
 *
 * Il test importa `@meridien/content` per intero: è lecito qui, perché gira
 * fuori dal browser. Il client vero continua a vedere solo il catalogo
 * pubblico, e `client-safety.test.ts` sorveglia quel confine.
 */

const FOGLIO = readFileSync(
  fileURLToPath(new URL('../../../public/assets/icons.svg', import.meta.url)),
  'utf8',
);

function nomiDegliIndizi(): string[] {
  const nomi = new Set<string>();
  for (const caso of allCases()) {
    for (const indizio of caso.clues) nomi.add(indizio.icon);
  }
  return [...nomi].sort();
}

describe('Il foglio sprite', () => {
  it('contiene ogni simbolo dichiarato disponibile', () => {
    for (const nome of ICONE_DISPONIBILI) {
      expect(FOGLIO, nome).toContain(`id="icon-${nome}"`);
    }
  });

  it('porta gli attributi di tratto su ogni simbolo, non solo sulla radice', () => {
    // `<use>` clona il simbolo altrove: quello che sta sulla radice non lo segue
    const simboli = FOGLIO.match(/<symbol[^>]*>/g) ?? [];
    expect(simboli.length).toBe(ICONE_DISPONIBILI.length);
    for (const tag of simboli) {
      expect(tag, tag).toContain('stroke="currentColor"');
      expect(tag, tag).toContain('fill="none"');
    }
  });

  it('non dichiara simboli che poi non esistono', () => {
    const dichiarati = new Set(ICONE_DISPONIBILI);
    for (const trovato of FOGLIO.matchAll(/id="icon-([a-z-]+)"/g)) {
      expect(dichiarati.has(trovato[1]!), trovato[1]).toBe(true);
    }
  });
});

describe('Gli indizi dei casi', () => {
  it('trovano tutti un simbolo davvero disegnato', () => {
    const senzaSegno: string[] = [];
    for (const nome of nomiDegliIndizi()) {
      const scelto = simbolo(nome);
      if (!FOGLIO.includes(`id="icon-${scelto}"`)) senzaSegno.push(`${nome} → ${scelto}`);
    }
    expect(senzaSegno).toEqual([]);
  });

  it('non ricadono in massa sul segno di riserva', () => {
    /*
     * Il ripiego esiste per non lasciare buchi, non per fare da tappeto. Se
     * più di un indizio su otto finisce lì, la tabella è rimasta indietro e va
     * riempita: il rimedio è aggiungere una riga, non alzare questa soglia.
     */
    const nomi = nomiDegliIndizi();
    const ripiego = nomi.filter((n) => simbolo(n) === 'sigillo' && n !== 'sigillo');
    expect(ripiego.length / nomi.length).toBeLessThan(0.125);
  });

  it('mantiene i nomi che coincidono già con un simbolo', () => {
    expect(simbolo('chiave')).toBe('chiave');
    expect(simbolo('orologio')).toBe('orologio');
    expect(simbolo('taccuino')).toBe('taccuino');
  });

  it('riconduce le varianti allo stesso segno di categoria', () => {
    expect(simbolo('chiavi')).toBe('chiave');
    expect(simbolo('passepartout')).toBe('chiave');
    expect(simbolo('polaroid')).toBe('fotografia');
    expect(simbolo('sveglia')).toBe('orologio');
  });

  it('non lascia mai vuoto un nome sconosciuto', () => {
    expect(simbolo('un-oggetto-che-non-esiste')).toBe('sigillo');
  });
});
