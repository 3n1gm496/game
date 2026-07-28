/**
 * Passo 1 — Token.
 *
 * Legge i token condivisi da `@meridien/engine/design` e li riversa in
 * `apps/web/src/styles/tokens.css`. Il CSS prodotto contiene:
 *  - `:root` con palette, ombre, font, spazi, raggi, durate e curve;
 *  - la variante `[data-contrast="alto"]`;
 *  - la scala tipografica e il moltiplicatore utente;
 *  - i colori di rilevanza degli indizi;
 *  - `@media (prefers-reduced-motion: reduce)` che azzera tutte le durate.
 */

import path from 'node:path';

import { loadDesign } from './engine-design.js';
import { STYLES_DIR, setCategory, write } from './util.js';

const TYPE_NAMES = [
  'micro',
  'mini',
  'base',
  'medio',
  'grande',
  'titolo',
  'display',
  'insegna',
] as const;

function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export async function generateTokens(): Promise<void> {
  setCategory('token');
  const design = await loadDesign();

  const typeScale = design.TYPE_SCALE.map((value, index) => {
    const name = TYPE_NAMES[index] ?? `s${index}`;
    return `  --text-${name}: calc(${value}rem * var(--text-scale));`;
  }).join('\n');

  const textSteps = Object.entries(design.TEXT_SCALE_STEPS)
    .map(([key, value]) => `  --text-scale-${kebab(key)}: ${value};`)
    .join('\n');

  const relevance = Object.entries(design.RELEVANCE_COLOR)
    .map(([key, value]) => `  --rilevanza-${kebab(key)}: ${value};`)
    .join('\n');

  const motionZero = Object.keys(design.MOTION)
    .map((key) => `    --motion-${kebab(key)}: 0.001ms;`)
    .join('\n');

  const highContrastPalette = design.toCssVariables(true)
    .split('\n')
    .filter((line) => line.trim().startsWith('--c-'))
    .join('\n');

  const css = `/* -------------------------------------------------------------------------
 * MÉRIDIEN — token di design.
 * File GENERATO da tools/generate-assets (passo "tokens"). Non modificare a mano:
 * la fonte di verità è packages/engine/src/design/tokens.ts.
 * ---------------------------------------------------------------------- */

:root {
  color-scheme: dark;

  /* Palette, ombre, tipi, spazi, raggi, movimento */
${design.toCssVariables(false)}

  /* Moltiplicatore della scala tipografica (impostazioni utente) */
  --text-scale: 1;
${textSteps}

  /* Scala tipografica */
${typeScale}

  /* Rilevanza degli indizi — mai usata da sola: sempre con etichetta testuale */
${relevance}

  /* Griglia */
  --griglia-colonne-mobile: 4;
  --griglia-colonne-desktop: 12;
  --griglia-gutter-mobile: 12px;
  --griglia-gutter-desktop: 20px;
  --griglia-margine: 20px;
  --contenuto-max: 1180px;
  --misura-testo: 62ch;

  /* Taglio a 45° degli angoli: firma geometrica del gioco */
  --taglio-angolo: 10px;
  --bordo-attivo: 1px;

  /* Superfici derivate */
  --superficie-pannello: color-mix(in srgb, var(--c-night) 88%, var(--c-ink));
  --superficie-carta: var(--c-ivory);
  --velo-notte: color-mix(in srgb, var(--c-ink) 72%, transparent);

  /* Interruttori d'ambiente (grana di carta in soft-light al 6%) */
  --grana-opacita: 0.06;
  --parallasse-attiva: 1;
  --pioggia-attiva: 1;
}

/* Modalità alto contrasto: colori sostituiti, bordi a 2px, texture spente. */
:root[data-contrast='alto'],
[data-contrast='alto'] {
${highContrastPalette}
  --bordo-attivo: 2px;
  --grana-opacita: 0;
  --shadow-card: 0 0 0 2px var(--c-brass);
  --shadow-lift: 0 0 0 2px var(--c-brass);
}

/* Scala tipografica scelta dall'utente */
:root[data-testo='piccolo'] { --text-scale: var(--text-scale-piccolo); }
:root[data-testo='normale'] { --text-scale: var(--text-scale-normale); }
:root[data-testo='grande'] { --text-scale: var(--text-scale-grande); }
:root[data-testo='enorme'] { --text-scale: var(--text-scale-enorme); }

/* Font ad alta leggibilità attivabile dalle impostazioni */
:root[data-leggibilita='alta'] {
  --font-body: var(--font-legible);
  --font-ui: var(--font-legible);
  --font-display: var(--font-legible);
}

/* Riduzione del movimento: nessuna durata, nessuna parallasse, nessun bagliore. */
@media (prefers-reduced-motion: reduce) {
  :root {
${motionZero}
    --parallasse-attiva: 0;
    --pioggia-attiva: 0;
  }
}

:root[data-movimento='ridotto'] {
${motionZero}
  --parallasse-attiva: 0;
  --pioggia-attiva: 0;
}
`;

  await write(path.join(STYLES_DIR, 'tokens.css'), css);
}
