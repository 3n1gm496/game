/**
 * Lettering Art Déco geometrico, costruito interamente con path.
 *
 * Non è un font di sistema: ogni lettera è un insieme di sottotracciati
 * (rettangoli, parallelogrammi, smussi a 45°) disegnati su una griglia
 * normalizzata `W × H` con spessore d'asta `t`. È la forma da cui nasce la
 * famiglia «Méridien Display» descritta in ART_DIRECTION.md.
 */

import { f, polyPath, type Point } from './util.js';

export interface GlyphBox {
  /** Larghezza nominale della lettera. */
  readonly W: number;
  /** Altezza della lettera (dalla linea di base alla maiuscola). */
  readonly H: number;
  /** Spessore dell'asta verticale. */
  readonly t: number;
}

function bar(x: number, y: number, w: number, h: number): string {
  return polyPath(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    true,
  );
}

function quad(a: Point, b: Point, c: Point, d: Point): string {
  return polyPath([a, b, c, d], true);
}

type GlyphFn = (box: GlyphBox) => string[];

interface GlyphDef {
  /** Larghezza relativa rispetto a `W`. */
  readonly advance: number;
  readonly draw: GlyphFn;
}

/* Le proporzioni sono tarate a occhio sulle insegne d'albergo di fine anni '30:
   asta sottile, traverse più leggere delle verticali, traversa centrale corta. */
const GLYPHS: Record<string, GlyphDef> = {
  M: {
    advance: 1.08,
    draw: ({ W, H, t }) => {
      const w = W * 1.08;
      const mid = H * 0.68;
      return [
        bar(0, 0, t, H),
        bar(w - t, 0, t, H),
        quad([t, 0], [t + t * 1.05, 0], [w / 2 + t * 0.5, mid], [w / 2 - t * 0.5, mid]),
        quad([w - t - t * 1.05, 0], [w - t, 0], [w / 2 + t * 0.5, mid], [w / 2 - t * 0.5, mid]),
      ];
    },
  },
  E: {
    advance: 0.82,
    draw: ({ W, H, t }) => {
      const w = W * 0.82;
      const arm = t * 0.78;
      return [
        bar(0, 0, t, H),
        bar(0, 0, w, arm),
        bar(0, H / 2 - arm * 0.5, w * 0.74, arm * 0.9),
        bar(0, H - arm, w, arm),
      ];
    },
  },
  R: {
    advance: 0.92,
    draw: ({ W, H, t }) => {
      const w = W * 0.92;
      const arm = t * 0.78;
      const bowl = H * 0.46;
      return [
        bar(0, 0, t, H),
        bar(0, 0, w * 0.78, arm),
        bar(w * 0.78 - t, 0, t, bowl),
        bar(0, bowl - arm, w * 0.78, arm),
        quad(
          [w * 0.44, bowl - arm],
          [w * 0.44 + t, bowl - arm],
          [w, H],
          [w - t * 1.25, H],
        ),
      ];
    },
  },
  I: {
    advance: 0.46,
    draw: ({ W, H, t }) => {
      const w = W * 0.46;
      const serif = t * 0.55;
      return [
        bar((w - t) / 2, 0, t, H),
        bar(w * 0.06, 0, w * 0.88, serif),
        bar(w * 0.06, H - serif, w * 0.88, serif),
      ];
    },
  },
  D: {
    advance: 0.98,
    draw: ({ W, H, t }) => {
      const w = W * 0.98;
      const arm = t * 0.78;
      const sx = w * 0.58;
      // Fianco destro smussato: contorno esterno + rientro interno, un solo tracciato.
      const flank: Point[] = [
        [sx, 0],
        [w, H * 0.24],
        [w, H * 0.76],
        [sx, H],
        [sx, H - arm],
        [w - t, H * 0.74],
        [w - t, H * 0.26],
        [sx, arm],
      ];
      return [bar(0, 0, t, H), bar(0, 0, sx, arm), bar(0, H - arm, sx, arm), polyPath(flank, true)];
    },
  },
  N: {
    advance: 1.0,
    draw: ({ W, H, t }) => [
      bar(0, 0, t, H),
      bar(W - t, 0, t, H),
      quad([t, 0], [t + t * 1.1, 0], [W - t, H], [W - t - t * 1.1, H]),
    ],
  },
  A: {
    advance: 1.0,
    draw: ({ W, H, t }) => {
      const arm = t * 0.7;
      return [
        quad([W * 0.5 - t * 0.5, 0], [W * 0.5 + t * 0.5, 0], [W - t * 0.2, H], [W - t * 1.3, H]),
        quad([W * 0.5 - t * 0.5, 0], [W * 0.5 + t * 0.5, 0], [t * 1.3, H], [t * 0.2, H]),
        bar(W * 0.22, H * 0.66, W * 0.56, arm),
      ];
    },
  },
  H: {
    advance: 1.0,
    draw: ({ W, H, t }) => [
      bar(0, 0, t, H),
      bar(W - t, 0, t, H),
      bar(0, H * 0.5 - t * 0.4, W, t * 0.8),
    ],
  },
  O: {
    advance: 1.02,
    draw: ({ W, H, t }) => {
      const w = W * 1.02;
      const c = w * 0.2;
      const outer: Point[] = [
        [c, 0],
        [w - c, 0],
        [w, c],
        [w, H - c],
        [w - c, H],
        [c, H],
        [0, H - c],
        [0, c],
      ];
      const inner: Point[] = [
        [c + t * 0.4, t],
        [t, c + t * 0.4],
        [t, H - c - t * 0.4],
        [c + t * 0.4, H - t],
        [w - c - t * 0.4, H - t],
        [w - t, H - c - t * 0.4],
        [w - t, c + t * 0.4],
        [w - c - t * 0.4, t],
      ];
      return [`${polyPath(outer, true)} ${polyPath(inner, true)}`];
    },
  },
  T: {
    advance: 0.9,
    draw: ({ W, H, t }) => {
      const w = W * 0.9;
      return [bar(0, 0, w, t * 0.78), bar((w - t) / 2, 0, t, H)];
    },
  },
  L: {
    advance: 0.8,
    draw: ({ W, H, t }) => {
      const w = W * 0.8;
      return [bar(0, 0, t, H), bar(0, H - t * 0.78, w, t * 0.78)];
    },
  },
  G: {
    advance: 1.02,
    draw: ({ W, H, t }) => {
      const w = W * 1.02;
      const c = w * 0.2;
      const arm = t * 0.78;
      const shell: Point[] = [
        [c, 0],
        [w, 0],
        [w, arm],
        [c + t * 0.3, arm],
        [t, c],
        [t, H - c],
        [c + t * 0.3, H - arm],
        [w - t, H - arm],
        [w - t, H * 0.58],
        [w * 0.56, H * 0.58],
        [w * 0.56, H * 0.58 - arm],
        [w, H * 0.58 - arm],
        [w, H],
        [c, H],
        [0, H - c],
        [0, c],
      ];
      return [polyPath(shell, true)];
    },
  },
  ' ': { advance: 0.5, draw: () => [] },
  '·': {
    advance: 0.4,
    draw: ({ W, H, t }) => {
      const cx = W * 0.2;
      const cy = H * 0.5;
      const r = t * 0.42;
      return [
        polyPath(
          [
            [cx, cy - r],
            [cx + r, cy],
            [cx, cy + r],
            [cx - r, cy],
          ],
          true,
        ),
      ];
    },
  },
};

/** Accento acuto Art Déco, disegnato sopra la lettera. */
export function acutePath(x: number, y: number, box: GlyphBox): string {
  const { W, H, t } = box;
  return quad(
    [x + W * 0.30, y - H * 0.10],
    [x + W * 0.58, y - H * 0.26],
    [x + W * 0.58 + t * 0.55, y - H * 0.20],
    [x + W * 0.30 + t * 0.55, y - H * 0.04],
  );
}

export interface LetteringResult {
  /** Tracciati assoluti già posizionati sulla riga. */
  readonly paths: readonly string[];
  /** Larghezza totale della parola. */
  readonly width: number;
  /** Posizione orizzontale di ogni lettera (per accenti e animazioni). */
  readonly positions: readonly { readonly char: string; readonly x: number }[];
}

/**
 * Compone una parola in maiuscole: restituisce i tracciati già traslati,
 * con l'origine in (0,0) e la linea di base a `y = H`.
 */
export function lettering(word: string, box: GlyphBox, tracking = 0.16): LetteringResult {
  const paths: string[] = [];
  const positions: { char: string; x: number }[] = [];
  let cursor = 0;
  const gap = box.W * tracking;
  for (const rawChar of word) {
    const char = rawChar.toUpperCase();
    const glyph = GLYPHS[char];
    if (!glyph) continue;
    positions.push({ char, x: cursor });
    for (const d of glyph.draw(box)) {
      paths.push(translatePath(d, cursor, 0));
    }
    cursor += box.W * glyph.advance + gap;
  }
  return { paths, width: Math.max(0, cursor - gap), positions };
}

/** Trasla un path composto solo da comandi assoluti M/L/Z. */
export function translatePath(d: string, dx: number, dy: number): string {
  return d.replace(/([ML]) (-?[\d.]+) (-?[\d.]+)/g, (_m, cmd: string, x: string, y: string) => {
    return `${cmd} ${f(Number(x) + dx)} ${f(Number(y) + dy)}`;
  });
}

export function hasGlyph(char: string): boolean {
  return Object.prototype.hasOwnProperty.call(GLYPHS, char.toUpperCase());
}
