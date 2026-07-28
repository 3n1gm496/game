import type { CaseDef } from '@meridien/engine';
import { abilities, locations, objects, roles, victim, witnesses } from './world.js';
import { clues } from './clues.js';
import { beats, events, methodOptions, motiveOptions, objectives, secrets } from './secrets.js';
import { texts } from './texts.js';
import { variantSpartito } from './variants/a.js';
import { variantBicchiere } from './variants/b.js';
import { varianteBobina } from './variants/c.js';

/**
 * Caso 3 — «L'Ultimo Valzer».
 * 28 febbraio 1969, serata di gala al Grand Hotel Méridien.
 * Ilde Ferrante attacca l'ultimo pezzo della serata e non lo finisce.
 * Sette ambienti, trentaquattro indizi, tre varianti: in tutte e tre il
 * momento in cui il veleno si vede non è il momento in cui è stato dato.
 */

export const ultimoValzer = {
  id: 'case.valzer',
  number: 3,
  title: 'L’Ultimo Valzer',
  subtitle: 'Serata di gala, 28 febbraio 1969',
  tagline: 'Il veleno è arrivato in orario. L’orario, però, non è quello che sembra.',
  date: '28 febbraio 1969',
  synopsis:
    'Ilde Ferrante attacca l’ultimo pezzo della serata e non lo finisce. Tutti guardavano il palco: nessuno guardava il bicchiere. E il momento in cui il veleno è stato somministrato non coincide con quello in cui ha agito.',
  coverScene: 'sala-ballo',
  difficulty: 3,
  victim,
  roles,
  locations,
  objects,
  witnesses,
  clues,
  secrets,
  objectives,
  abilities,
  events,
  motiveOptions,
  methodOptions,
  beats,
  variants: [variantSpartito, variantBicchiere, varianteBobina],
  texts,
} satisfies CaseDef;
