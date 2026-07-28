import type { CaseDef } from '@meridien/engine';
import { CLUES } from './clues.js';
import {
  BEATS,
  EVENTS,
  METHOD_OPTIONS,
  MOTIVE_OPTIONS,
  OBJECTIVES,
  SECRETS,
} from './secrets.js';
import { CASE_TEXTS } from './texts.js';
import { varianteChiaveGemella } from './variants/a.js';
import { varianteOraSpostata } from './variants/b.js';
import { variantePassaggioServizio } from './variants/c.js';
import { ABILITIES, LOCATIONS, OBJECTS, ROLES, VICTIM, WITNESSES } from './world.js';

/**
 * CASO 1 — «LA SUITE 404».
 * 12 gennaio 1968, Ballo d’Inverno al Grand Hotel Méridien.
 * Otto ruoli, otto ambienti, trentasei indizi, tre varianti validate.
 */

export const suite404: CaseDef = {
  id: 'case.suite404',
  number: 1,
  title: 'La Suite 404',
  subtitle: 'Ballo d’Inverno, 12 gennaio 1968',
  tagline: 'Una stanza chiusa dall’interno, e nessuna chiave che torni indietro.',
  date: '12 gennaio 1968',
  synopsis:
    'La mareggiata ha chiuso la strada per Alassio. Al Grand Hotel Méridien il Ballo d’Inverno prosegue mentre al quarto piano una porta resta chiusa più del dovuto. Corrado Malaspina, proprietario dell’albergo, non scende a fare il suo brindisi.',
  coverScene: 'facciata',
  difficulty: 1,
  victim: VICTIM,
  roles: ROLES,
  locations: LOCATIONS,
  objects: OBJECTS,
  witnesses: WITNESSES,
  clues: CLUES,
  secrets: SECRETS,
  objectives: OBJECTIVES,
  abilities: ABILITIES,
  events: EVENTS,
  motiveOptions: MOTIVE_OPTIONS,
  methodOptions: METHOD_OPTIONS,
  beats: BEATS,
  variants: [varianteChiaveGemella, varianteOraSpostata, variantePassaggioServizio],
  texts: CASE_TEXTS,
} satisfies CaseDef;
