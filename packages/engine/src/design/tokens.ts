/**
 * Token di design condivisi fra client, generatore di asset e wrapper iOS.
 * Sono l'unica fonte di verità dei colori: `pnpm generate:assets` li riversa
 * in `apps/web/src/styles/tokens.css` e negli SVG.
 */

export const PALETTE = {
  ink: '#0B1220',
  night: '#111C2E',
  nightSoft: '#182740',
  petrol: '#14413F',
  petrolLit: '#1E5E58',
  lacquer: '#B5261E',
  lacquerDeep: '#7E1712',
  brass: '#C9A227',
  brassSoft: '#E0C365',
  ivory: '#F2E9D8',
  ivoryDim: '#CDC2AE',
  rain: '#5C7FA3',
  marble: '#DCD6C8',
  plum: '#3A2440',
} as const;

export type PaletteKey = keyof typeof PALETTE;

export const HIGH_CONTRAST: Partial<Record<PaletteKey, string>> = {
  ink: '#000000',
  night: '#000000',
  nightSoft: '#0A0A0A',
  ivory: '#FFFFFF',
  ivoryDim: '#E8E8E8',
  brass: '#FFD24A',
  brassSoft: '#FFE58A',
  lacquer: '#FF5A4E',
  rain: '#9CC4E4',
  marble: '#FFFFFF',
};

export const SPACING = [4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

export const RADIUS = { label: 2, card: 6, panel: 12, pill: 999 } as const;

export const TYPE_SCALE = [0.75, 0.875, 1, 1.125, 1.375, 1.75, 2.25, 3] as const;

export const TEXT_SCALE_STEPS = { piccolo: 0.9, normale: 1, grande: 1.15, enorme: 1.3 } as const;
export type TextScale = keyof typeof TEXT_SCALE_STEPS;

export const SHADOWS = {
  card: '0 2px 6px rgba(6,10,18,.45), 0 12px 28px rgba(6,10,18,.35)',
  lift: '0 6px 14px rgba(6,10,18,.5), 0 24px 60px rgba(6,10,18,.45)',
} as const;

export const MOTION = {
  micro: { duration: 120, easing: 'cubic-bezier(.2,.8,.3,1)' },
  panel: { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' },
  curtain: { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)' },
  camera: { duration: 1400, easing: 'cubic-bezier(.4,0,.2,1)' },
  card: { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' },
} as const;

export const FONTS = {
  display: '"Meridien Display", "Bodoni Moda", Didot, "Playfair Display", Georgia, serif',
  body: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  ui: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  legible: '"Atkinson Hyperlegible", Verdana, "Segoe UI", sans-serif',
} as const;

/** Colori di stato usati per gli indizi (mai soltanto il colore: sempre con etichetta). */
export const RELEVANCE_COLOR = {
  critico: PALETTE.lacquer,
  utile: PALETTE.brass,
  contorno: PALETTE.rain,
  'falsa-pista': PALETTE.plum,
} as const;

export function toCssVariables(highContrast = false): string {
  const palette = highContrast ? { ...PALETTE, ...HIGH_CONTRAST } : PALETTE;
  const lines: string[] = [];
  for (const [key, value] of Object.entries(palette)) {
    lines.push(`  --c-${kebab(key)}: ${value};`);
  }
  for (const [key, value] of Object.entries(SHADOWS)) {
    lines.push(`  --shadow-${kebab(key)}: ${value};`);
  }
  for (const [key, value] of Object.entries(FONTS)) {
    lines.push(`  --font-${kebab(key)}: ${value};`);
  }
  SPACING.forEach((v, i) => lines.push(`  --sp-${i}: ${v}px;`));
  for (const [key, value] of Object.entries(RADIUS)) {
    lines.push(`  --radius-${kebab(key)}: ${value}px;`);
  }
  for (const [key, value] of Object.entries(MOTION)) {
    lines.push(`  --motion-${kebab(key)}: ${value.duration}ms;`);
    lines.push(`  --ease-${kebab(key)}: ${value.easing};`);
  }
  return lines.join('\n');
}

function kebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
