import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { allCases, listPublic } from '../index.js';
import { PUBLIC_CASES, publicCase } from '../public.js';

/**
 * Il confine fra ciò che il client può conoscere e ciò che non deve conoscere.
 *
 * `@meridien/content` contiene la verità dei casi ed è importato **solo** dal
 * server e dagli strumenti. Il client importa `@meridien/content/public`, che
 * deve restare un catalogo da vetrina: titoli, ambienti, conteggi. Se un
 * giorno qualcuno ci infilasse una soluzione, questi test lo fermerebbero.
 */

const SORGENTE_PUBBLICA = readFileSync(
  fileURLToPath(new URL('../public.ts', import.meta.url)),
  'utf8',
);

describe('Il catalogo pubblico non rivela nulla', () => {
  it('non contiene soluzioni, moventi o metodi delle varianti', () => {
    for (const caso of allCases()) {
      for (const variante of caso.variants) {
        expect(SORGENTE_PUBBLICA).not.toContain(variante.id);
        expect(SORGENTE_PUBBLICA).not.toContain(variante.culpritRoleId);
        expect(SORGENTE_PUBBLICA).not.toContain(variante.texts.reveal);
        expect(SORGENTE_PUBBLICA).not.toContain(variante.texts.explanation);
        expect(SORGENTE_PUBBLICA).not.toContain(variante.falseReconstruction.summary);
      }
    }
  });

  it('non contiene segreti, indizi né obiettivi', () => {
    for (const caso of allCases()) {
      for (const segreto of caso.secrets) {
        expect(SORGENTE_PUBBLICA).not.toContain(segreto.text);
      }
      for (const indizio of caso.clues) {
        expect(SORGENTE_PUBBLICA).not.toContain(indizio.text);
      }
      for (const obiettivo of caso.objectives) {
        expect(SORGENTE_PUBBLICA).not.toContain(obiettivo.text);
      }
    }
  });

  it('non nomina i sospettati: i ruoli si scoprono in partita', () => {
    for (const caso of allCases()) {
      for (const ruolo of caso.roles) {
        expect(SORGENTE_PUBBLICA, `il catalogo pubblico nomina ${ruolo.name}`).not.toContain(ruolo.name);
      }
    }
  });

  it('non importa il catalogo completo', () => {
    expect(SORGENTE_PUBBLICA).not.toMatch(/from\s+['"]\.\/index/);
    expect(SORGENTE_PUBBLICA).not.toMatch(/from\s+['"]\.\/cases/);
    // l'unica dipendenza ammessa è il tipo, che non porta dati con sé
    expect(SORGENTE_PUBBLICA).toMatch(/import type \{ PublicCase \} from '@meridien\/engine'/);
  });
});

describe('Il catalogo pubblico è però corretto', () => {
  it('elenca esattamente i casi che esistono', () => {
    const veri = listPublic();
    expect(PUBLIC_CASES).toHaveLength(veri.length);
    expect(PUBLIC_CASES.map((c) => c.id).sort()).toEqual(veri.map((c) => c.id).sort());
  });

  it('dichiara conteggi e metadati che combaciano con i contenuti reali', () => {
    for (const vero of listPublic()) {
      const dichiarato = publicCase(vero.id);
      expect(dichiarato, `manca ${vero.id} nel catalogo pubblico`).toBeDefined();
      expect(dichiarato!.title).toBe(vero.title);
      expect(dichiarato!.number).toBe(vero.number);
      expect(dichiarato!.date).toBe(vero.date);
      expect(dichiarato!.coverScene).toBe(vero.coverScene);
      expect(dichiarato!.difficulty).toBe(vero.difficulty);
      expect(dichiarato!.victimName).toBe(vero.victimName);
      expect(dichiarato!.roleCount).toBe(vero.roleCount);
      expect(dichiarato!.clueCount).toBe(vero.clueCount);
      expect(dichiarato!.variantCount).toBe(vero.variantCount);
      expect(dichiarato!.locationNames).toEqual(vero.locationNames);
    }
  });
});

describe('I contenuti rispettano i minimi di progetto', () => {
  it('ogni caso ha otto ruoli, sei ambienti, trenta indizi e tre varianti', () => {
    for (const caso of allCases()) {
      expect(caso.roles, caso.id).toHaveLength(8);
      expect(caso.abilities, caso.id).toHaveLength(8);
      expect(caso.locations.length, caso.id).toBeGreaterThanOrEqual(6);
      expect(caso.clues.length, caso.id).toBeGreaterThanOrEqual(30);
      expect(caso.secrets.length, caso.id).toBeGreaterThanOrEqual(8);
      expect(caso.objectives.length, caso.id).toBeGreaterThanOrEqual(8);
      expect(caso.events.length, caso.id).toBeGreaterThanOrEqual(6);
      expect(caso.variants, caso.id).toHaveLength(3);
    }
  });

  it('ogni variante ha almeno dodici false piste', () => {
    for (const caso of allCases()) {
      for (const v of caso.variants) {
        const falsePiste = v.clueSetup.filter((s) => s.relevance === 'falsa-pista').length;
        expect(falsePiste, `${caso.id}/${v.id}`).toBeGreaterThanOrEqual(12);
      }
    }
  });

  it('le opzioni di accusa sono identiche fra le varianti: nessun metagioco', () => {
    for (const caso of allCases()) {
      // movente, metodo e beat vivono sul caso, non sulla variante: la forma
      // della scheda d'accusa non può tradire quale variante si sta giocando
      expect(caso.motiveOptions.length).toBeGreaterThanOrEqual(5);
      expect(caso.methodOptions.length).toBeGreaterThanOrEqual(5);
      expect(caso.beats.length).toBeGreaterThanOrEqual(4);

      const moventi = new Set(caso.variants.map((v) => v.motiveKey));
      const metodi = new Set(caso.variants.map((v) => v.methodKey));
      const colpevoli = new Set(caso.variants.map((v) => v.culpritRoleId));
      // ogni variante sceglie fra le stesse opzioni, ma sceglie diversamente
      expect(colpevoli.size, `${caso.id}: colpevoli`).toBeGreaterThanOrEqual(2);
      expect(metodi.size, `${caso.id}: metodi`).toBeGreaterThanOrEqual(2);
      expect(moventi.size, `${caso.id}: moventi`).toBeGreaterThanOrEqual(2);

      // ogni variante ordina gli stessi beat, in ordine proprio
      for (const v of caso.variants) {
        expect([...v.sequence].sort()).toEqual(caso.beats.map((b) => b.id).sort());
      }
      const ordini = new Set(caso.variants.map((v) => v.sequence.join('>')));
      expect(ordini.size, `${caso.id}: sequenze`).toBeGreaterThanOrEqual(2);
    }
  });

  it('i testi sono in italiano e non contengono segnaposti', () => {
    const vietati = /\b(TODO|FIXME|lorem ipsum|placeholder)\b/i;
    for (const caso of allCases()) {
      const serializzato = JSON.stringify(caso);
      expect(serializzato, caso.id).not.toMatch(vietati);
    }
  });
});
