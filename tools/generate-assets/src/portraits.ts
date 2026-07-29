/**
 * Passo 4 — Ritratti.
 *
 * Dodici archetipi (NARRATIVE_BIBLE §5), ciascuno con 3 pose × 4 espressioni,
 * una silhouette piena e una carta personaggio con cornice d'ottone e angoli
 * tagliati a 45°. Ogni volto è costruito con poche forme: un ovale, un naso a
 * virgola, due archi per gli occhi, una bocca essenziale. La maschera del ballo
 * è un layer separato (`<g id="maschera-ballo">`), spento di default.
 */

import path from 'node:path';

import { loadPalette, type Palette } from './engine-design.js';
import {
  ASSETS_DIR,
  alpha,
  arcPath,
  cutCornerPath,
  el,
  f,
  grainFilter,
  group,
  linear,
  polyPath,
  radial,
  random,
  setCategory,
  shade,
  svg,
  write,
  type Point,
} from './util.js';

const W = 600;
const H = 800;

export const POSES = ['neutral', 'lean', 'turn'] as const;
export const EXPRESSIONS = ['calm', 'worried', 'smug', 'caught'] as const;
export type Pose = (typeof POSES)[number];
export type Expression = (typeof EXPRESSIONS)[number];

type Hair = 'raccolti' | 'crocchia' | 'corti' | 'onde' | 'pettinati' | 'ricci' | 'rada';
type Accessory =
  | 'ventaglio'
  | 'sigaro'
  | 'chiave-al-collo'
  | 'microfono'
  | 'fotocamera'
  | 'valigetta'
  | 'occhialini'
  | 'orologio'
  | 'taccuino'
  | 'papillon'
  | 'mazzo-di-chiavi'
  | 'custodia';

interface Archetype {
  readonly id: string;
  readonly nome: string;
  readonly silhouette: string;
  readonly pelle: string;
  readonly capelli: string;
  readonly acconciatura: Hair;
  readonly abito: (p: Palette) => string;
  readonly accento: (p: Palette) => string;
  readonly accessorio: Accessory;
  /** semilarghezza delle spalle */
  readonly spalle: number;
  /** scala della testa (teste al 1/7 dell'altezza, con licenza caricaturale) */
  readonly testa: number;
  /** inclinazione di base della posa, in gradi */
  readonly postura: number;
  /** scollatura: 'scoperta' | 'chiusa' | 'frac' | 'grembiule' | 'trench' | 'pelliccia' */
  readonly abitoTaglio: 'scoperta' | 'chiusa' | 'frac' | 'grembiule' | 'trench' | 'pelliccia' | 'doppiopetto';
}

const ARCHETYPES: readonly Archetype[] = [
  {
    id: '01',
    nome: "L'ereditiera",
    silhouette: 'Abito lungo, spalle scoperte, ventaglio',
    pelle: '#E8C4A6',
    capelli: '#3B2416',
    acconciatura: 'raccolti',
    abito: (p) => p.ivory,
    accento: (p) => p.lacquer,
    accessorio: 'ventaglio',
    spalle: 132,
    testa: 1,
    postura: 0,
    abitoTaglio: 'scoperta',
  },
  {
    id: '02',
    nome: "L'impresario",
    silhouette: 'Doppiopetto, sigaro, bassa statura',
    pelle: '#D9A87C',
    capelli: '#1B1410',
    acconciatura: 'pettinati',
    abito: (p) => shade(p.night, 0.08),
    accento: (p) => p.brass,
    accessorio: 'sigaro',
    spalle: 178,
    testa: 1.12,
    postura: 2,
    abitoTaglio: 'doppiopetto',
  },
  {
    id: '03',
    nome: "Il direttore d'albergo",
    silhouette: 'Frac, chiave al collo, postura rigida',
    pelle: '#EBD0B4',
    capelli: '#8A8478',
    acconciatura: 'pettinati',
    abito: (p) => shade(p.ink, 0.1),
    accento: (p) => p.brass,
    accessorio: 'chiave-al-collo',
    spalle: 146,
    testa: 0.96,
    postura: 0,
    abitoTaglio: 'frac',
  },
  {
    id: '04',
    nome: 'La cantante',
    silhouette: 'Guanti lunghi, microfono, capelli raccolti',
    pelle: '#C68C63',
    capelli: '#14100E',
    acconciatura: 'raccolti',
    abito: (p) => p.petrolLit,
    accento: (p) => p.brassSoft,
    accessorio: 'microfono',
    spalle: 128,
    testa: 1,
    postura: -3,
    abitoTaglio: 'scoperta',
  },
  {
    id: '05',
    nome: 'Il fotografo',
    silhouette: 'Macchina al collo, giacca sformata, occhiali',
    pelle: '#DCB48C',
    capelli: '#4A3A22',
    acconciatura: 'ricci',
    abito: (p) => shade(p.rain, -0.32),
    accento: (p) => p.ivoryDim,
    accessorio: 'fotocamera',
    spalle: 158,
    testa: 1.04,
    postura: 4,
    abitoTaglio: 'chiusa',
  },
  {
    id: '06',
    nome: 'Il medico',
    silhouette: 'Valigetta, cappotto, mani in tasca',
    pelle: '#E3C1A0',
    capelli: '#2A2A2E',
    acconciatura: 'corti',
    abito: (p) => shade(p.plum, 0.05),
    accento: (p) => p.rain,
    accessorio: 'valigetta',
    spalle: 152,
    testa: 0.98,
    postura: 0,
    abitoTaglio: 'trench',
  },
  {
    id: '07',
    nome: 'La contessa',
    silhouette: 'Pelliccia, occhialini, bastone',
    pelle: '#EFDCC6',
    capelli: '#D8D2C6',
    acconciatura: 'crocchia',
    abito: (p) => shade(p.plum, 0.14),
    accento: (p) => p.brass,
    accessorio: 'occhialini',
    spalle: 168,
    testa: 0.94,
    postura: -2,
    abitoTaglio: 'pelliccia',
  },
  {
    id: '08',
    nome: 'Il campione sportivo',
    silhouette: 'Spalle larghe, blazer, orologio grande',
    pelle: '#B87A4E',
    capelli: '#241A12',
    acconciatura: 'corti',
    abito: (p) => shade(p.petrol, 0.06),
    accento: (p) => p.brassSoft,
    accessorio: 'orologio',
    spalle: 196,
    testa: 0.92,
    postura: -1,
    abitoTaglio: 'chiusa',
  },
  {
    id: '09',
    nome: 'La giornalista',
    silhouette: 'Taccuino, trench, capelli corti',
    pelle: '#DFB795',
    capelli: '#5C3A1E',
    acconciatura: 'corti',
    abito: (p) => shade(p.ivoryDim, -0.22),
    accento: (p) => p.lacquerDeep,
    accessorio: 'taccuino',
    spalle: 140,
    testa: 1.02,
    postura: 3,
    abitoTaglio: 'trench',
  },
  {
    id: '10',
    nome: 'Il croupier',
    silhouette: 'Papillon, mani in evidenza, magro',
    pelle: '#E6C7A8',
    capelli: '#171310',
    acconciatura: 'pettinati',
    abito: (p) => shade(p.ink, 0.14),
    accento: (p) => p.lacquer,
    accessorio: 'papillon',
    spalle: 118,
    testa: 0.9,
    postura: 0,
    abitoTaglio: 'frac',
  },
  {
    id: '11',
    nome: 'La governante',
    silhouette: 'Grembiule, mazzo di chiavi, crocchia',
    pelle: '#D8AE8A',
    capelli: '#3A2E28',
    acconciatura: 'crocchia',
    abito: (p) => shade(p.petrol, -0.18),
    accento: (p) => p.ivory,
    accessorio: 'mazzo-di-chiavi',
    spalle: 144,
    testa: 1,
    postura: 0,
    abitoTaglio: 'grembiule',
  },
  {
    id: '12',
    nome: 'Il musicista',
    silhouette: 'Custodia di strumento, sciarpa, curvo',
    pelle: '#C99A6E',
    capelli: '#2E2118',
    acconciatura: 'onde',
    abito: (p) => shade(p.plum, -0.1),
    accento: (p) => p.lacquerDeep,
    accessorio: 'custodia',
    spalle: 134,
    testa: 1.06,
    postura: 7,
    abitoTaglio: 'chiusa',
  },
];

/* ------------------------------------------------------------------ */
/* Geometria del volto                                                 */
/* ------------------------------------------------------------------ */

interface Ctx {
  readonly a: Archetype;
  readonly p: Palette;
  readonly pose: Pose;
  readonly expr: Expression;
  readonly mono: boolean;
  /** colore, o nero pieno in silhouette */
  c(color: string): string;
}

const HEAD_CX = 300;
const HEAD_CY = 246;

function headRadii(a: Archetype): { rx: number; ry: number } {
  return { rx: 90 * a.testa, ry: 108 * a.testa };
}

/** Spostamento orizzontale dei tratti secondo la posa. */
function turnShift(pose: Pose): number {
  return pose === 'turn' ? 20 : pose === 'lean' ? -6 : 0;
}

function face(ctx: Ctx): string {
  const { a, pose, expr, mono } = ctx;
  if (mono) return '';
  const { rx, ry } = headRadii(a);
  const s = turnShift(pose);
  const eyeY = HEAD_CY + ry * 0.06;
  const eyeGap = rx * 0.38;
  const ink = shade(ctx.p.ink, 0.05);

  const parts: string[] = [];

  // sopracciglia
  const browY = eyeY - ry * 0.24;
  const brow = (side: -1 | 1): string => {
    const cx = HEAD_CX + s + side * eyeGap;
    const width = rx * 0.3;
    let lift = 0;
    let tilt = 0;
    if (expr === 'worried') {
      lift = -6;
      tilt = side * 8;
    } else if (expr === 'smug') {
      lift = side === 1 ? -10 : 2;
      tilt = side * -4;
    } else if (expr === 'caught') {
      lift = -12;
    }
    return el('path', {
      d: arcPath(cx, browY + lift, width, ry * 0.13, 200, 340),
      fill: 'none',
      stroke: ctx.a.capelli,
      'stroke-width': f(6 * a.testa),
      'stroke-linecap': 'butt',
      transform: `rotate(${f(tilt)} ${f(cx)} ${f(browY + lift)})`,
    });
  };

  // occhi
  const eye = (side: -1 | 1): string => {
    const far = pose === 'turn' && side === -1;
    const cx = HEAD_CX + s + side * eyeGap * (far ? 0.86 : 1);
    const w = rx * 0.2 * (far ? 0.66 : 1);
    if (expr === 'caught') {
      return group({}, [
        el('ellipse', { cx, cy: eyeY, rx: w, ry: w * 0.92, fill: ctx.p.ivory }),
        el('circle', { cx, cy: eyeY, r: w * 0.48, fill: ink }),
        el('path', {
          d: arcPath(cx, eyeY, w, w * 0.95, 190, 350),
          fill: 'none',
          stroke: ink,
          'stroke-width': 3,
        }),
      ]);
    }
    if (expr === 'smug') {
      return group({}, [
        el('path', {
          d: arcPath(cx, eyeY + 2, w, w * 0.5, 185, 355),
          fill: 'none',
          stroke: ink,
          'stroke-width': 4,
        }),
        el('circle', { cx, cy: eyeY - 1, r: w * 0.3, fill: ink }),
      ]);
    }
    const openness = expr === 'worried' ? 0.78 : 0.62;
    return group({}, [
      el('path', {
        d: arcPath(cx, eyeY, w, w * openness, 180, 360),
        fill: ctx.p.ivory,
        stroke: ink,
        'stroke-width': 3,
      }),
      el('circle', { cx: cx + (pose === 'turn' ? w * 0.2 : 0), cy: eyeY - w * 0.1, r: w * 0.34, fill: ink }),
    ]);
  };

  // naso a virgola
  const noseX = HEAD_CX + s * 1.5;
  const noseTop = eyeY + ry * 0.12;
  parts.push(
    el('path', {
      d: `M ${f(noseX)} ${f(noseTop)} q ${f(rx * 0.14)} ${f(ry * 0.22)} ${f(rx * 0.02)} ${f(ry * 0.28)} q ${f(-rx * 0.1)} ${f(ry * 0.04)} ${f(-rx * 0.14)} ${f(-ry * 0.03)}`,
      fill: 'none',
      stroke: shade(a.pelle, -0.35),
      'stroke-width': f(4.5 * a.testa),
      'stroke-linecap': 'butt',
    }),
  );

  // bocca
  const mouthY = HEAD_CY + ry * 0.52;
  const mouthW = rx * 0.34;
  let mouth: string;
  if (expr === 'caught') {
    mouth = el('ellipse', {
      cx: HEAD_CX + s,
      cy: mouthY,
      rx: mouthW * 0.44,
      ry: mouthW * 0.5,
      fill: shade(ctx.p.lacquerDeep, -0.2),
    });
  } else if (expr === 'worried') {
    mouth = el('path', {
      d: arcPath(HEAD_CX + s, mouthY + 10, mouthW, mouthW * 0.4, 200, 340),
      fill: 'none',
      stroke: shade(ctx.p.lacquerDeep, 0.1),
      'stroke-width': 6,
      'stroke-linecap': 'butt',
    });
  } else if (expr === 'smug') {
    mouth = el('path', {
      d: `M ${f(HEAD_CX + s - mouthW)} ${f(mouthY)} q ${f(mouthW)} ${f(mouthW * 0.5)} ${f(mouthW * 2)} ${f(-mouthW * 0.34)}`,
      fill: 'none',
      stroke: shade(ctx.p.lacquerDeep, 0.1),
      'stroke-width': 6,
      'stroke-linecap': 'butt',
    });
  } else {
    mouth = el('path', {
      d: `M ${f(HEAD_CX + s - mouthW)} ${f(mouthY)} q ${f(mouthW)} ${f(mouthW * 0.34)} ${f(mouthW * 2)} 0`,
      fill: 'none',
      stroke: shade(ctx.p.lacquerDeep, 0.1),
      'stroke-width': 6,
      'stroke-linecap': 'butt',
    });
  }

  // guance/ombra del mento
  parts.push(
    el('ellipse', {
      cx: HEAD_CX + s,
      cy: HEAD_CY + ry * 0.72,
      rx: rx * 0.34,
      ry: ry * 0.14,
      fill: alpha(shade(a.pelle, -0.3), 0.35),
    }),
    brow(-1),
    brow(1),
    eye(-1),
    eye(1),
    mouth,
  );

  return group({ id: 'volto' }, parts);
}

function hair(ctx: Ctx): string {
  const { a, pose } = ctx;
  const { rx, ry } = headRadii(a);
  const s = turnShift(pose) * 0.5;
  const cx = HEAD_CX + s;
  const col = ctx.c(a.capelli);
  const dark = ctx.mono ? col : shade(a.capelli, -0.3);
  const parts: string[] = [];

  switch (a.acconciatura) {
    case 'raccolti':
      parts.push(
        el('ellipse', { cx, cy: HEAD_CY - ry * 0.62, rx: rx * 0.86, ry: ry * 0.44, fill: col }),
        el('circle', { cx: cx - rx * 0.05, cy: HEAD_CY - ry * 1.06, r: rx * 0.42, fill: col }),
        el('path', {
          d: `M ${f(cx - rx)} ${f(HEAD_CY - ry * 0.1)} q ${f(-rx * 0.16)} ${f(-ry * 0.75)} ${f(rx * 0.5)} ${f(-ry * 0.86)} q ${f(rx * 0.9)} ${f(-ry * 0.12)} ${f(rx * 1.4)} ${f(ry * 0.7)} q ${f(-rx * 0.5)} ${f(-ry * 0.36)} ${f(-rx * 1.3)} ${f(-ry * 0.08)} Z`,
          fill: dark,
        }),
      );
      break;
    case 'crocchia':
      parts.push(
        el('ellipse', { cx, cy: HEAD_CY - ry * 0.5, rx: rx * 0.98, ry: ry * 0.52, fill: col }),
        el('circle', { cx: cx - rx * 0.9, cy: HEAD_CY - ry * 0.2, r: rx * 0.34, fill: col }),
        el('circle', { cx: cx - rx * 0.9, cy: HEAD_CY - ry * 0.2, r: rx * 0.18, fill: dark }),
      );
      break;
    case 'corti':
      parts.push(
        el('path', {
          d: `M ${f(cx - rx * 1.02)} ${f(HEAD_CY - ry * 0.1)} q ${f(rx * 0.08)} ${f(-ry * 0.95)} ${f(rx)} ${f(-ry * 0.95)} q ${f(rx * 0.94)} 0 ${f(rx * 1.04)} ${f(ry * 0.95)} q ${f(-rx * 0.3)} ${f(-ry * 0.42)} ${f(-rx * 1.1)} ${f(-ry * 0.34)} q ${f(-rx * 0.7)} ${f(ry * 0.06)} ${f(-rx * 0.94)} ${f(ry * 0.34)} Z`,
          fill: col,
        }),
      );
      break;
    case 'onde':
      parts.push(
        el('ellipse', { cx, cy: HEAD_CY - ry * 0.42, rx: rx * 1.04, ry: ry * 0.6, fill: col }),
        el('path', {
          d: `M ${f(cx - rx * 1.02)} ${f(HEAD_CY - ry * 0.3)} q ${f(-rx * 0.3)} ${f(ry * 0.9)} ${f(rx * 0.12)} ${f(ry * 1.2)} q ${f(-rx * 0.5)} ${f(-ry * 0.5)} ${f(-rx * 0.08)} ${f(-ry * 1.1)} Z`,
          fill: col,
        }),
        el('path', {
          d: `M ${f(cx + rx * 1.02)} ${f(HEAD_CY - ry * 0.3)} q ${f(rx * 0.3)} ${f(ry * 0.9)} ${f(-rx * 0.12)} ${f(ry * 1.2)} q ${f(rx * 0.5)} ${f(-ry * 0.5)} ${f(rx * 0.08)} ${f(-ry * 1.1)} Z`,
          fill: col,
        }),
      );
      break;
    case 'pettinati':
      parts.push(
        el('path', {
          d: `M ${f(cx - rx)} ${f(HEAD_CY - ry * 0.26)} q ${f(rx * 0.1)} ${f(-ry * 0.86)} ${f(rx * 1.02)} ${f(-ry * 0.86)} q ${f(rx * 0.9)} 0 ${f(rx)} ${f(ry * 0.7)} q ${f(-rx * 0.44)} ${f(-ry * 0.3)} ${f(-rx * 1.16)} ${f(-ry * 0.16)} q ${f(-rx * 0.6)} ${f(ry * 0.12)} ${f(-rx * 0.86)} ${f(ry * 0.32)} Z`,
          fill: col,
        }),
        el('path', {
          d: `M ${f(cx - rx * 0.2)} ${f(HEAD_CY - ry * 0.92)} q ${f(rx * 0.9)} ${f(ry * 0.1)} ${f(rx * 1.06)} ${f(ry * 0.36)}`,
          fill: 'none',
          stroke: dark,
          'stroke-width': 5,
        }),
      );
      break;
    case 'ricci': {
      parts.push(el('ellipse', { cx, cy: HEAD_CY - ry * 0.44, rx: rx * 0.98, ry: ry * 0.54, fill: col }));
      const rng = random(`ricci-${a.id}`);
      for (let i = 0; i < 14; i += 1) {
        const ang = Math.PI + (Math.PI * i) / 13;
        parts.push(
          el('circle', {
            cx: f(cx + Math.cos(ang) * rx * 0.98),
            cy: f(HEAD_CY - ry * 0.24 + Math.sin(ang) * ry * 0.7),
            r: f(rx * (0.16 + rng.next() * 0.1)),
            fill: col,
          }),
        );
      }
      break;
    }
    case 'rada':
      parts.push(
        el('path', {
          d: `M ${f(cx - rx)} ${f(HEAD_CY - ry * 0.06)} q ${f(-rx * 0.04)} ${f(-ry * 0.6)} ${f(rx * 0.44)} ${f(-ry * 0.66)} q ${f(-rx * 0.2)} ${f(ry * 0.3)} ${f(-rx * 0.06)} ${f(ry * 0.66)} Z`,
          fill: col,
        }),
        el('path', {
          d: `M ${f(cx + rx)} ${f(HEAD_CY - ry * 0.06)} q ${f(rx * 0.04)} ${f(-ry * 0.6)} ${f(-rx * 0.44)} ${f(-ry * 0.66)} q ${f(rx * 0.2)} ${f(ry * 0.3)} ${f(rx * 0.06)} ${f(ry * 0.66)} Z`,
          fill: col,
        }),
      );
      break;
    default:
      break;
  }
  return group({ id: 'capelli' }, parts);
}

function head(ctx: Ctx): string {
  const { a, pose } = ctx;
  const { rx, ry } = headRadii(a);
  const s = turnShift(pose);
  const skin = ctx.c(a.pelle);
  const parts: string[] = [
    // collo
    el('path', {
      d: polyPath(
        [
          [HEAD_CX - 30 + s * 0.4, HEAD_CY + ry * 0.72],
          [HEAD_CX + 30 + s * 0.4, HEAD_CY + ry * 0.72],
          [HEAD_CX + 36 + s * 0.3, 430],
          [HEAD_CX - 36 + s * 0.3, 430],
        ],
        true,
      ),
      fill: ctx.mono ? skin : shade(a.pelle, -0.18),
    }),
    // testa
    el('ellipse', { cx: HEAD_CX + s * 0.5, cy: HEAD_CY, rx, ry, fill: skin }),
    // orecchio dal lato lontano
    el('ellipse', {
      cx: HEAD_CX + s * 0.5 - (pose === 'turn' ? rx : -rx),
      cy: HEAD_CY + ry * 0.06,
      rx: rx * 0.14,
      ry: ry * 0.18,
      fill: skin,
    }),
  ];
  if (!ctx.mono) {
    // volume: luce da sinistra
    parts.push(
      el('ellipse', {
        cx: HEAD_CX + s * 0.5 + rx * 0.42,
        cy: HEAD_CY + ry * 0.1,
        rx: rx * 0.6,
        ry: ry * 0.82,
        fill: alpha(shade(a.pelle, -0.4), 0.22),
      }),
    );
  }
  return group({ id: 'testa' }, parts);
}

function body(ctx: Ctx): string {
  const { a, p, pose } = ctx;
  const abito = ctx.c(a.abito(p));
  const scuro = ctx.mono ? abito : shade(a.abito(p), -0.3);
  const accento = ctx.c(a.accento(p));
  const sh = a.spalle;
  const shoulderY = 430;
  const parts: string[] = [];

  // busto: trapezio geometrico
  const torso: Point[] = [
    [HEAD_CX - sh * 0.42, shoulderY],
    [HEAD_CX + sh * 0.42, shoulderY],
    [HEAD_CX + sh, shoulderY + 92],
    [HEAD_CX + sh * 1.06, H],
    [HEAD_CX - sh * 1.06, H],
    [HEAD_CX - sh, shoulderY + 92],
  ];
  parts.push(el('path', { d: polyPath(torso, true), fill: abito }));

  switch (a.abitoTaglio) {
    case 'scoperta':
      parts.push(
        el('path', {
          d: `M ${f(HEAD_CX - sh * 0.72)} ${f(shoulderY + 40)} q ${f(sh * 0.72)} ${f(120)} ${f(sh * 1.44)} 0 L ${f(HEAD_CX + sh * 1.06)} ${f(H)} L ${f(HEAD_CX - sh * 1.06)} ${f(H)} Z`,
          fill: abito,
        }),
        // spalle scoperte
        el('path', {
          d: `M ${f(HEAD_CX - sh * 0.9)} ${f(shoulderY + 70)} q ${f(sh * 0.36)} ${f(-90)} ${f(sh * 0.62)} ${f(-40)} q ${f(-sh * 0.3)} ${f(70)} ${f(-sh * 0.3)} ${f(160)} Z`,
          fill: ctx.c(a.pelle),
        }),
        el('path', {
          d: `M ${f(HEAD_CX + sh * 0.9)} ${f(shoulderY + 70)} q ${f(-sh * 0.36)} ${f(-90)} ${f(-sh * 0.62)} ${f(-40)} q ${f(sh * 0.3)} ${f(70)} ${f(sh * 0.3)} ${f(160)} Z`,
          fill: ctx.c(a.pelle),
        }),
        el('path', {
          d: `M ${f(HEAD_CX - sh * 0.72)} ${f(shoulderY + 40)} q ${f(sh * 0.72)} ${f(120)} ${f(sh * 1.44)} 0`,
          fill: 'none',
          stroke: accento,
          'stroke-width': 5,
        }),
      );
      break;
    case 'doppiopetto':
      parts.push(
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 46, shoulderY],
              [HEAD_CX + 46, shoulderY],
              [HEAD_CX + 30, H],
              [HEAD_CX - 30, H],
            ],
            true,
          ),
          fill: ctx.mono ? abito : ctx.p.ivory,
        }),
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - sh * 0.42, shoulderY],
              [HEAD_CX + 66, shoulderY + 60],
              [HEAD_CX + 96, H],
              [HEAD_CX - sh * 1.06, H],
              [HEAD_CX - sh, shoulderY + 92],
            ],
            true,
          ),
          fill: scuro,
        }),
        ...[0, 1].map((i) =>
          el('circle', { cx: HEAD_CX + 30, cy: 620 + i * 70, r: 8, fill: accento }),
        ),
        ...[0, 1].map((i) =>
          el('circle', { cx: HEAD_CX + 76, cy: 620 + i * 70, r: 8, fill: accento }),
        ),
      );
      break;
    case 'frac':
      parts.push(
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 52, shoulderY],
              [HEAD_CX + 52, shoulderY],
              [HEAD_CX + 34, H],
              [HEAD_CX - 34, H],
            ],
            true,
          ),
          fill: ctx.mono ? abito : ctx.p.ivory,
        }),
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - sh * 0.42, shoulderY],
              [HEAD_CX - 20, shoulderY + 110],
              [HEAD_CX - 62, H],
              [HEAD_CX - sh * 1.06, H],
              [HEAD_CX - sh, shoulderY + 92],
            ],
            true,
          ),
          fill: scuro,
        }),
        el('path', {
          d: polyPath(
            [
              [HEAD_CX + sh * 0.42, shoulderY],
              [HEAD_CX + 20, shoulderY + 110],
              [HEAD_CX + 62, H],
              [HEAD_CX + sh * 1.06, H],
              [HEAD_CX + sh, shoulderY + 92],
            ],
            true,
          ),
          fill: scuro,
        }),
      );
      break;
    case 'trench':
      parts.push(
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - sh * 0.42, shoulderY],
              [HEAD_CX + 10, shoulderY + 70],
              [HEAD_CX + 10, H],
              [HEAD_CX - sh * 1.06, H],
              [HEAD_CX - sh, shoulderY + 92],
            ],
            true,
          ),
          fill: scuro,
        }),
        // cintura
        el('rect', { x: HEAD_CX - sh * 1.02, y: 690, width: sh * 2.04, height: 26, fill: accento }),
        el('rect', { x: HEAD_CX + 20, y: 684, width: 44, height: 38, fill: ctx.mono ? abito : ctx.p.brass }),
        // bavero
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 70, shoulderY - 6],
              [HEAD_CX, shoulderY + 90],
              [HEAD_CX - 96, shoulderY + 74],
            ],
            true,
          ),
          fill: ctx.mono ? abito : shade(a.abito(p), 0.16),
        }),
        el('path', {
          d: polyPath(
            [
              [HEAD_CX + 70, shoulderY - 6],
              [HEAD_CX, shoulderY + 90],
              [HEAD_CX + 96, shoulderY + 74],
            ],
            true,
          ),
          fill: ctx.mono ? abito : shade(a.abito(p), 0.16),
        }),
      );
      break;
    case 'pelliccia': {
      const rng = random(`pelliccia-${a.id}`);
      const puffs: string[] = [];
      for (let i = 0; i < 26; i += 1) {
        const t = i / 25;
        const x = HEAD_CX - sh * 1.06 + t * sh * 2.12;
        const y = shoulderY + 60 + Math.sin(t * Math.PI) * -40 + rng.range(-14, 14);
        puffs.push(el('circle', { cx: f(x), cy: f(y), r: f(34 + rng.next() * 22), fill: abito }));
      }
      parts.push(group({}, puffs));
      parts.push(
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 60, shoulderY + 40],
              [HEAD_CX + 60, shoulderY + 40],
              [HEAD_CX + 40, H],
              [HEAD_CX - 40, H],
            ],
            true,
          ),
          fill: ctx.mono ? abito : shade(a.abito(p), -0.35),
        }),
      );
      break;
    }
    case 'grembiule':
      parts.push(
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 74, shoulderY + 60],
              [HEAD_CX + 74, shoulderY + 60],
              [HEAD_CX + 108, H],
              [HEAD_CX - 108, H],
            ],
            true,
          ),
          fill: ctx.mono ? abito : ctx.p.ivory,
        }),
        el('rect', { x: HEAD_CX - 78, y: shoulderY + 52, width: 156, height: 14, fill: ctx.mono ? abito : ctx.p.ivory }),
        el('path', {
          d: `M ${f(HEAD_CX - 60)} ${f(shoulderY + 4)} L ${f(HEAD_CX - 74)} ${f(shoulderY + 60)} M ${f(HEAD_CX + 60)} ${f(shoulderY + 4)} L ${f(HEAD_CX + 74)} ${f(shoulderY + 60)}`,
          stroke: ctx.mono ? abito : ctx.p.ivory,
          'stroke-width': 14,
          fill: 'none',
        }),
        el('path', {
          d: `M ${f(HEAD_CX - 40)} ${f(shoulderY - 4)} q ${f(40)} ${f(46)} ${f(80)} 0`,
          fill: 'none',
          stroke: accento,
          'stroke-width': 6,
        }),
      );
      break;
    case 'chiusa':
    default:
      parts.push(
        // risvolti
        el('path', {
          d: polyPath(
            [
              [HEAD_CX - 56, shoulderY - 4],
              [HEAD_CX, shoulderY + 120],
              [HEAD_CX + 56, shoulderY - 4],
              [HEAD_CX + 20, shoulderY - 12],
              [HEAD_CX - 20, shoulderY - 12],
            ],
            true,
          ),
          fill: ctx.mono ? abito : shade(a.abito(p), 0.18),
        }),
        el('path', {
          d: `M ${f(HEAD_CX - 46)} ${f(shoulderY + 10)} L ${f(HEAD_CX)} ${f(shoulderY + 130)} L ${f(HEAD_CX + 46)} ${f(shoulderY + 10)}`,
          fill: 'none',
          stroke: accento,
          'stroke-width': 6,
        }),
      );
      break;
  }

  // ombra alla base: sfumatura in dodici passi, senza gradienti aggiuntivi
  if (!ctx.mono) {
    for (let i = 0; i < 12; i += 1) {
      parts.push(
        el('rect', {
          x: HEAD_CX - sh * 1.08,
          y: H - 130 + i * 11,
          width: sh * 2.16,
          height: 12,
          fill: alpha(ctx.p.ink, 0.03 + i * 0.022),
        }),
      );
    }
  }

  const lean = pose === 'lean' ? 4 : 0;
  return group({ id: 'busto', transform: lean ? `rotate(${f(lean)} ${HEAD_CX} ${H})` : undefined }, parts);
}

function accessory(ctx: Ctx): string {
  const { a, p, pose } = ctx;
  const accento = ctx.c(a.accento(p));
  const metal = ctx.c(p.brass);
  const dark = ctx.c(shade(p.ink, 0.12));
  const parts: string[] = [];
  const s = turnShift(pose);
  const { rx, ry } = headRadii(a);

  switch (a.accessorio) {
    case 'ventaglio': {
      const cx = 452;
      const cy = 610;
      const blades: string[] = [];
      const step = (Math.PI * 0.78) / 10;
      for (let i = 0; i < 11; i += 1) {
        const ang = -Math.PI * 0.95 + step * i;
        blades.push(
          el('path', {
            d: polyPath(
              [
                [cx, cy],
                [cx + Math.cos(ang - step * 0.62) * 158, cy + Math.sin(ang - step * 0.62) * 158],
                [cx + Math.cos(ang + step * 0.62) * 158, cy + Math.sin(ang + step * 0.62) * 158],
              ],
              true,
            ),
            fill: i % 2 === 0 ? accento : ctx.c(shade(a.accento(p), -0.25)),
          }),
        );
      }
      parts.push(
        group({}, blades),
        el('path', {
          d: arcPath(cx, cy, 150, 150, 187, 258),
          fill: 'none',
          stroke: metal,
          'stroke-width': 6,
        }),
        el('circle', { cx, cy, r: 12, fill: metal }),
        // mano
        el('ellipse', { cx: cx + 6, cy: cy + 26, rx: 30, ry: 22, fill: ctx.c(a.pelle) }),
      );
      break;
    }
    case 'sigaro': {
      const mx = HEAD_CX + s + rx * 0.5;
      const my = HEAD_CY + ry * 0.5;
      parts.push(
        el('rect', { x: mx, y: my - 7, width: 96, height: 15, rx: 3, fill: ctx.c('#6B4A2A') }),
        el('rect', { x: mx + 78, y: my - 7, width: 18, height: 15, fill: ctx.c(shade(p.ivoryDim, -0.2)) }),
        el('circle', { cx: mx + 100, cy: my, r: 6, fill: ctx.c(p.lacquer) }),
      );
      if (!ctx.mono) {
        parts.push(
          el('path', {
            d: `M ${f(mx + 106)} ${f(my - 6)} q 40 -60 6 -104 q -30 -40 10 -78`,
            fill: 'none',
            stroke: alpha(p.ivory, 0.28),
            'stroke-width': 7,
            'stroke-linecap': 'butt',
          }),
        );
      }
      break;
    }
    case 'chiave-al-collo': {
      parts.push(
        el('path', {
          d: `M ${f(HEAD_CX - 78)} ${f(438)} q ${f(78)} ${f(150)} ${f(156)} 0`,
          fill: 'none',
          stroke: metal,
          'stroke-width': 6,
        }),
        group({ transform: `translate(${HEAD_CX} 560)` }, [
          el('circle', { cx: 0, cy: 0, r: 26, fill: 'none', stroke: metal, 'stroke-width': 10 }),
          el('rect', { x: -6, y: 22, width: 12, height: 84, fill: metal }),
          el('rect', { x: 0, y: 84, width: 26, height: 10, fill: metal }),
          el('rect', { x: 0, y: 62, width: 20, height: 10, fill: metal }),
        ]),
        // avambraccio con la chiave maestra tenuta di lato: rompe la silhouette
        el('path', {
          d: `M ${f(HEAD_CX + 120)} ${f(560)} q ${f(90)} ${f(20)} ${f(126)} ${f(-6)} l ${f(6)} ${f(48)} q ${f(-60)} ${f(30)} ${f(-136)} ${f(6)} Z`,
          fill: ctx.c(shade(a.abito(p), 0.14)),
        }),
        el('ellipse', { cx: 456, cy: 578, rx: 30, ry: 24, fill: ctx.c(a.pelle) }),
        group({ transform: 'translate(486 566) rotate(24)' }, [
          el('circle', { cx: 0, cy: 0, r: 20, fill: 'none', stroke: metal, 'stroke-width': 9 }),
          el('rect', { x: 16, y: -5, width: 84, height: 10, fill: metal }),
          el('rect', { x: 84, y: 5, width: 10, height: 22, fill: metal }),
          el('rect', { x: 66, y: 5, width: 10, height: 16, fill: metal }),
        ]),
      );
      break;
    }
    case 'microfono': {
      parts.push(
        // braccia in guanti lunghi, staccate dal busto
        el('path', {
          d: `M ${f(HEAD_CX - a.spalle * 0.86)} ${f(500)} q ${f(-58)} ${f(120)} ${f(-40)} ${f(300)} l ${f(60)} 0 q ${f(-10)} ${f(-170)} ${f(34)} ${f(-286)} Z`,
          fill: ctx.c(p.ivory),
        }),
        el('path', {
          d: `M ${f(HEAD_CX + a.spalle * 0.86)} ${f(500)} q ${f(70)} ${f(90)} ${f(50)} ${f(160)} q ${f(-16)} ${f(56)} ${f(-64)} ${f(50)} l ${f(-16)} ${f(-58)} q ${f(30)} ${f(-4)} ${f(28)} ${f(-40)} q ${f(-4)} ${f(-52)} ${f(-46)} ${f(-84)} Z`,
          fill: ctx.c(p.ivory),
        }),
        // microfono
        group({ transform: 'translate(470 560) rotate(-16)' }, [
          el('rect', { x: -18, y: 0, width: 36, height: 150, rx: 10, fill: dark }),
          el('ellipse', { cx: 0, cy: -10, rx: 40, ry: 46, fill: ctx.c(shade(p.rain, -0.2)) }),
          ...Array.from({ length: 5 }, (_v, i) =>
            el('rect', { x: -34, y: -34 + i * 16, width: 68, height: 6, fill: alpha('#000000', ctx.mono ? 1 : 0.45) }),
          ),
          el('ellipse', { cx: 0, cy: -10, rx: 40, ry: 46, fill: 'none', stroke: metal, 'stroke-width': 5 }),
        ]),
      );
      break;
    }
    case 'fotocamera': {
      parts.push(
        el('path', {
          d: `M ${f(HEAD_CX - 92)} ${f(436)} q ${f(92)} ${f(190)} ${f(184)} 0`,
          fill: 'none',
          stroke: ctx.c(shade(p.ink, 0.2)),
          'stroke-width': 14,
        }),
        group({ transform: `translate(${HEAD_CX} 606)` }, [
          el('path', { d: cutCornerPath(-86, -50, 172, 108, 14), fill: dark }),
          el('circle', { cx: 0, cy: 6, r: 40, fill: ctx.c(shade(p.rain, -0.3)) }),
          el('circle', { cx: 0, cy: 6, r: 24, fill: ctx.c(shade(p.ink, 0.05)) }),
          el('circle', { cx: -8, cy: -2, r: 8, fill: ctx.mono ? dark : alpha(p.ivory, 0.5) }),
          el('rect', { x: 40, y: -44, width: 34, height: 18, rx: 4, fill: metal }),
          el('rect', { x: -74, y: -44, width: 30, height: 16, rx: 4, fill: ctx.c(p.lacquer) }),
        ]),
        // parabola del flash: sporge oltre la spalla e firma la silhouette
        group({ transform: 'translate(492 546) rotate(16)' }, [
          el('rect', { x: -46, y: -8, width: 50, height: 16, fill: dark }),
          el('path', {
            d: polyPath(
              [
                [0, -46],
                [46, -60],
                [46, 60],
                [0, 46],
              ],
              true,
            ),
            fill: ctx.c(shade(p.ivoryDim, -0.05)),
          }),
          el('circle', { cx: 22, cy: 0, r: 18, fill: ctx.mono ? dark : alpha(p.ivory, 0.85) }),
        ]),
      );
      break;
    }
    case 'valigetta': {
      parts.push(
        group({ transform: 'translate(452 660)' }, [
          el('path', { d: cutCornerPath(-10, 0, 190, 130, 18), fill: ctx.c(shade(p.plum, -0.05)) }),
          el('path', {
            d: 'M 50 -6 q 40 -46 80 0',
            fill: 'none',
            stroke: metal,
            'stroke-width': 9,
          }),
          el('rect', { x: -10, y: 46, width: 190, height: 14, fill: metal }),
          el('rect', { x: 74, y: 40, width: 32, height: 26, fill: metal }),
        ]),
        // mani in tasca: profilo delle braccia
        el('path', {
          d: `M ${f(HEAD_CX - a.spalle * 0.98)} ${f(560)} q ${f(-16)} ${f(120)} ${f(30)} ${f(180)}`,
          fill: 'none',
          stroke: ctx.c(shade(a.abito(p), -0.4)),
          'stroke-width': 10,
        }),
      );
      break;
    }
    case 'occhialini': {
      if (!ctx.mono) {
        const eyeY = HEAD_CY + ry * 0.06;
        parts.push(
          el('circle', {
            cx: HEAD_CX + s - rx * 0.38,
            cy: eyeY,
            r: rx * 0.26,
            fill: alpha(p.ivory, 0.14),
            stroke: p.brass,
            'stroke-width': 4,
          }),
          el('circle', {
            cx: HEAD_CX + s + rx * 0.38,
            cy: eyeY,
            r: rx * 0.26,
            fill: alpha(p.ivory, 0.14),
            stroke: p.brass,
            'stroke-width': 4,
          }),
          el('path', {
            d: `M ${f(HEAD_CX + s - rx * 0.12)} ${f(eyeY)} L ${f(HEAD_CX + s + rx * 0.12)} ${f(eyeY)}`,
            stroke: p.brass,
            'stroke-width': 4,
          }),
          el('path', {
            d: `M ${f(HEAD_CX + s + rx * 0.64)} ${f(eyeY)} q ${f(rx * 0.5)} ${f(ry * 0.6)} ${f(rx * 0.2)} ${f(ry * 1.4)}`,
            fill: 'none',
            stroke: alpha(p.brass, 0.8),
            'stroke-width': 3,
          }),
        );
      }
      // bastone
      parts.push(
        el('rect', { x: 462, y: 520, width: 14, height: 280, rx: 5, fill: ctx.c(shade(p.ink, 0.2)) }),
        el('path', {
          d: 'M 462 526 q -10 -40 34 -34 q 30 6 22 34 Z',
          fill: metal,
        }),
      );
      break;
    }
    case 'orologio': {
      parts.push(
        // avambraccio piegato davanti
        el('path', {
          d: `M ${f(HEAD_CX - 150)} ${f(700)} q ${f(150)} ${f(-70)} ${f(300)} ${f(10)} l 0 60 q ${f(-150)} ${f(-70)} ${f(-300)} ${f(-10)} Z`,
          fill: ctx.c(shade(a.abito(p), -0.22)),
        }),
        el('ellipse', { cx: HEAD_CX + 156, cy: 716, rx: 34, ry: 26, fill: ctx.c(a.pelle) }),
        group({ transform: `translate(${HEAD_CX + 106} 706)` }, [
          el('rect', { x: -30, y: -12, width: 60, height: 24, fill: ctx.c(shade(p.plum, 0.05)) }),
          el('circle', { cx: 0, cy: 0, r: 30, fill: metal }),
          el('circle', { cx: 0, cy: 0, r: 22, fill: ctx.c(p.ivory) }),
          el('line', { x1: 0, y1: 0, x2: 0, y2: -14, stroke: ctx.c(p.ink), 'stroke-width': 4 }),
          el('line', { x1: 0, y1: 0, x2: 11, y2: 5, stroke: ctx.c(p.ink), 'stroke-width': 3 }),
        ]),
      );
      break;
    }
    case 'taccuino': {
      parts.push(
        group({ transform: 'translate(410 610) rotate(-8)' }, [
          el('path', { d: cutCornerPath(0, 0, 130, 168, 12), fill: ctx.c(p.ivory) }),
          el('rect', { x: 0, y: 0, width: 130, height: 22, fill: ctx.c(shade(p.lacquerDeep, 0.05)) }),
          ...(ctx.mono
            ? []
            : Array.from({ length: 6 }, (_v, i) =>
                el('rect', { x: 16, y: 44 + i * 20, width: f(50 + ((i * 29) % 60)), height: 4, fill: alpha(p.ink, 0.4) }),
              )),
          el('rect', { x: 116, y: -22, width: 12, height: 60, rx: 5, fill: metal, transform: 'rotate(18 116 -22)' }),
        ]),
        el('ellipse', { cx: 396, cy: 754, rx: 34, ry: 24, fill: ctx.c(a.pelle) }),
      );
      break;
    }
    case 'papillon': {
      parts.push(
        group({ transform: `translate(${HEAD_CX} 452)` }, [
          el('path', { d: polyPath([[-58, -26], [-10, 0], [-58, 26]], true), fill: accento }),
          el('path', { d: polyPath([[58, -26], [10, 0], [58, 26]], true), fill: accento }),
          el('rect', { x: -12, y: -14, width: 24, height: 28, rx: 5, fill: ctx.c(shade(a.accento(p), -0.3)) }),
        ]),
        // mani in evidenza
        el('ellipse', { cx: HEAD_CX - 96, cy: 720, rx: 44, ry: 30, fill: ctx.c(a.pelle) }),
        el('ellipse', { cx: HEAD_CX + 96, cy: 720, rx: 44, ry: 30, fill: ctx.c(a.pelle) }),
        ...(ctx.mono
          ? []
          : [
              el('path', {
                d: `M ${f(HEAD_CX - 130)} 716 q 34 -18 68 0 M ${f(HEAD_CX + 62)} 716 q 34 -18 68 0`,
                fill: 'none',
                stroke: alpha(shade(a.pelle, -0.4), 0.6),
                'stroke-width': 3,
              }),
            ]),
      );
      break;
    }
    case 'mazzo-di-chiavi': {
      const ring: string[] = [];
      for (let i = 0; i < 5; i += 1) {
        const ang = -0.5 + i * 0.28;
        ring.push(
          el('rect', {
            x: -4,
            y: 0,
            width: 8,
            height: f(70 + (i % 3) * 16),
            fill: metal,
            transform: `rotate(${f(ang * 40)})`,
          }),
        );
      }
      parts.push(
        group({ transform: 'translate(444 688)' }, [
          el('circle', { cx: 0, cy: -14, r: 22, fill: 'none', stroke: metal, 'stroke-width': 8 }),
          group({ transform: 'translate(0 8)' }, ring),
        ]),
        el('ellipse', { cx: 444, cy: 660, rx: 32, ry: 24, fill: ctx.c(a.pelle) }),
      );
      break;
    }
    case 'custodia': {
      parts.push(
        // sciarpa
        el('path', {
          d: `M ${f(HEAD_CX - 86)} ${f(430)} q ${f(86)} ${f(70)} ${f(172)} 0 l 0 46 q ${f(-86)} ${f(60)} ${f(-172)} 0 Z`,
          fill: accento,
        }),
        el('path', {
          d: `M ${f(HEAD_CX + 50)} ${f(486)} q ${f(30)} ${f(120)} ${f(-6)} ${f(230)} l ${f(-56)} ${f(-10)} q ${f(30)} ${f(-110)} ${f(6)} ${f(-206)} Z`,
          fill: ctx.c(shade(a.accento(p), -0.2)),
        }),
        // custodia dello strumento
        group({ transform: 'translate(452 640) rotate(6)' }, [
          el('path', {
            d: 'M 0 0 q 54 -20 92 20 q 26 30 4 76 q -22 44 -70 44 q -50 0 -66 -46 q -14 -44 40 -94 Z',
            fill: ctx.c(shade(p.plum, 0.08)),
          }),
          el('rect', { x: -10, y: -34, width: 40, height: 40, rx: 8, fill: ctx.c(shade(p.plum, 0.08)) }),
          el('rect', { x: -6, y: 40, width: 116, height: 10, fill: metal }),
        ]),
      );
      break;
    }
    default:
      break;
  }
  return group({ id: 'accessorio' }, parts);
}

/** Maschera del ballo, layer separato e spento di default. */
function ballMask(ctx: Ctx): string {
  const { a, p, pose } = ctx;
  const { rx, ry } = headRadii(a);
  const s = turnShift(pose);
  const cx = HEAD_CX + s;
  const cy = HEAD_CY + ry * 0.04;
  const col = ctx.c(a.accento(p));
  return group({ id: 'maschera-ballo', display: 'none' }, [
    el('path', {
      d: `M ${f(cx - rx * 1.02)} ${f(cy - ry * 0.02)} q ${f(rx * 0.3)} ${f(-ry * 0.42)} ${f(rx * 1.02)} ${f(-ry * 0.42)} q ${f(rx * 0.72)} 0 ${f(rx * 1.02)} ${f(ry * 0.42)} q ${f(-rx * 0.24)} ${f(ry * 0.5)} ${f(-rx * 1.02)} ${f(ry * 0.5)} q ${f(-rx * 0.78)} 0 ${f(-rx * 1.02)} ${f(-ry * 0.5)} Z`,
      fill: col,
    }),
    el('ellipse', { cx: cx - rx * 0.38, cy, rx: rx * 0.24, ry: ry * 0.15, fill: ctx.c(shade(p.ink, 0.02)) }),
    el('ellipse', { cx: cx + rx * 0.38, cy, rx: rx * 0.24, ry: ry * 0.15, fill: ctx.c(shade(p.ink, 0.02)) }),
    el('path', {
      d: `M ${f(cx - rx * 1.02)} ${f(cy - ry * 0.02)} q ${f(rx * 0.3)} ${f(-ry * 0.42)} ${f(rx * 1.02)} ${f(-ry * 0.42)} q ${f(rx * 0.72)} 0 ${f(rx * 1.02)} ${f(ry * 0.42)}`,
      fill: 'none',
      stroke: ctx.c(p.brass),
      'stroke-width': 5,
    }),
    el('path', {
      d: `M ${f(cx - rx * 1.02)} ${f(cy)} l ${f(-rx * 0.5)} ${f(ry * 0.16)} M ${f(cx + rx * 1.02)} ${f(cy)} l ${f(rx * 0.5)} ${f(ry * 0.16)}`,
      stroke: ctx.c(p.brass),
      'stroke-width': 3,
      fill: 'none',
    }),
  ]);
}

function poseTransform(a: Archetype, pose: Pose): string | undefined {
  const base = a.postura;
  if (pose === 'lean') return `rotate(${f(base - 7)} ${HEAD_CX} ${H}) translate(-10 8)`;
  if (pose === 'turn') return `rotate(${f(base + 3)} ${HEAD_CX} ${H}) translate(8 0)`;
  return base ? `rotate(${f(base)} ${HEAD_CX} ${H})` : undefined;
}

interface PortraitOptions {
  readonly pose: Pose;
  readonly expr: Expression;
  readonly mono?: boolean;
  readonly withBackdrop?: boolean;
}

function portrait(a: Archetype, p: Palette, options: PortraitOptions): { defs: string; body: string } {
  const mono = options.mono ?? false;
  const ctx: Ctx = {
    a,
    p,
    pose: options.pose,
    expr: options.expr,
    mono,
    c: (color: string) => (mono ? '#000000' : color),
  };

  const defs = mono
    ? ''
    : [
        radial(`fondo-${a.id}`, [0.5, 0.34], 0.66, [
          { offset: 0, color: shade(p.night, 0.16), opacity: 0.95 },
          { offset: 1, color: p.ink, opacity: 0.9 },
        ]),
        linear(`vetro-${a.id}`, [0, 0], [0, 1], [
          { offset: 0, color: p.ivory, opacity: 0.1 },
          { offset: 1, color: p.ivory, opacity: 0 },
        ]),
        // l'ombra scivola dal basso a destra: è il lato opposto alla chiave
        linear(`ombra-${a.id}`, [0.15, 0], [1, 0.9], [
          { offset: 0, color: p.night, opacity: 0 },
          { offset: 0.45, color: p.night, opacity: 0.22 },
          { offset: 1, color: p.ink, opacity: 0.6 },
        ]),
        // la chiave calda entra dall'alto a sinistra, come nelle stanze
        linear(`chiave-${a.id}`, [0, 0], [0.75, 0.85], [
          { offset: 0, color: p.brassSoft, opacity: 0.3 },
          { offset: 0.4, color: p.brassSoft, opacity: 0.06 },
          { offset: 1, color: p.brassSoft, opacity: 0 },
        ]),
        grainFilter(`grana-${a.id}`, 0.9),
      ].join('');

  const inner = [
    body(ctx),
    head(ctx),
    hair(ctx),
    face(ctx),
    accessory(ctx),
    ballMask(ctx),
  ].join('');

  const parts: string[] = [];
  if (options.withBackdrop && !mono) {
    parts.push(
      el('rect', { x: 0, y: 0, width: W, height: H, fill: `url(#fondo-${a.id})` }),
      el('ellipse', { cx: HEAD_CX, cy: 300, rx: 250, ry: 300, fill: `url(#vetro-${a.id})` }),
      // ombra di contatto: senza, la figura galleggia
      el('ellipse', {
        cx: HEAD_CX, cy: H - 26, rx: 168, ry: 26,
        fill: alpha(p.ink, 0.5),
      }),
    );
  }

  const figura = group({ transform: poseTransform(a, options.pose) }, inner);
  parts.push(figura);

  /*
   * La modellazione della luce.
   *
   * I ritratti erano campiture piatte: nessuna faccia è piatta, e si vedeva.
   * Qui la stessa regola degli ambienti — una chiave calda in alto a sinistra,
   * un riflesso freddo dall'altro lato — viene applicata alla figura, non allo
   * sfondo, ritagliandola sulla sua stessa sagoma.
   *
   * La sagoma si ottiene ridisegnando le stesse forme in bianco: costa un po'
   * di byte e non richiede di conoscere i contorni, che cambiano con posa,
   * archetipo e accessorio. Il resto sono due velature e una grana, in ordine:
   * prima l'ombra, poi la luce, poi la superficie.
   */
  if (!mono) {
    const bianco: Ctx = { ...ctx, c: () => '#ffffff' };
    const sagoma = group(
      { transform: poseTransform(a, options.pose) },
      [body(bianco), head(bianco), hair(bianco), accessory(bianco)].join(''),
    );
    parts.push(
      el('mask', { id: `sagoma-${a.id}`, maskUnits: 'userSpaceOnUse' },
        el('rect', { x: 0, y: 0, width: W, height: H, fill: '#000000' }) + sagoma),
      group({ mask: `url(#sagoma-${a.id})` }, [
        el('rect', { x: 0, y: 0, width: W, height: H, fill: `url(#ombra-${a.id})` }),
        el('rect', { x: 0, y: 0, width: W, height: H, fill: `url(#chiave-${a.id})` }),
        el('rect', { x: 0, y: 0, width: W, height: H, fill: p.ivory, opacity: 0.05, filter: `url(#grana-${a.id})` }),
      ].join('')),
    );
  }

  return { defs, body: parts.join('') };
}

/* ------------------------------------------------------------------ */
/* Carta personaggio                                                   */
/* ------------------------------------------------------------------ */

function characterCard(a: Archetype, p: Palette, index: number): string {
  const cw = 560;
  const chh = 800;
  const cut = 26;
  const pr = portrait(a, p, { pose: 'neutral', expr: 'calm', withBackdrop: false });

  // pips: il numero dell'archetipo, senza tipografia
  const pips: string[] = [];
  for (let i = 0; i < index; i += 1) {
    const row = Math.floor(i / 6);
    const col = i % 6;
    const px = cw / 2 - 5 * 22 + col * 44;
    const py = chh - 74 + row * 26;
    pips.push(
      el('path', {
        d: polyPath(
          [
            [px, py - 9],
            [px + 9, py],
            [px, py + 9],
            [px - 9, py],
          ],
          true,
        ),
        fill: p.brassSoft,
      }),
    );
  }

  const defs = [
    pr.defs,
    linear(`carta-${a.id}`, [0, 0], [0.4, 1], [
      { offset: 0, color: shade(p.night, 0.14) },
      { offset: 0.6, color: p.night },
      { offset: 1, color: p.ink },
    ]),
    linear(`ottone-${a.id}`, [0, 0], [1, 1], [
      { offset: 0, color: p.brassSoft },
      { offset: 0.5, color: p.brass },
      { offset: 1, color: shade(p.brass, -0.35) },
    ]),
    radial(`luce-${a.id}`, [0.5, 0.3], 0.6, [
      { offset: 0, color: p.brassSoft, opacity: 0.18 },
      { offset: 1, color: p.brassSoft, opacity: 0 },
    ]),
    grainFilter(`grana-${a.id}`, 11 + index, 0.9, 4),
    el(
      'clipPath',
      { id: `ritaglio-${a.id}` },
      el('path', { d: cutCornerPath(30, 30, cw - 60, chh - 60, cut - 8) }),
    ),
  ].join('');

  const body = [
    el('path', { d: cutCornerPath(8, 8, cw - 16, chh - 16, cut + 6), fill: `url(#ottone-${a.id})` }),
    el('path', { d: cutCornerPath(18, 18, cw - 36, chh - 36, cut), fill: `url(#carta-${a.id})` }),
    group({ 'clip-path': `url(#ritaglio-${a.id})` }, [
      el('rect', { x: 0, y: 0, width: cw, height: chh, fill: `url(#luce-${a.id})` }),
      group({ transform: `translate(${f(cw / 2 - W / 2)} 60) scale(0.94)` }, pr.body),
      el('rect', {
        x: 0,
        y: 0,
        width: cw,
        height: chh,
        filter: `url(#grana-${a.id})`,
        opacity: '0.07',
        style: 'mix-blend-mode:soft-light',
      }),
    ]),
    // filetto interno
    el('path', {
      d: cutCornerPath(34, 34, cw - 68, chh - 68, cut - 10),
      fill: 'none',
      stroke: alpha(p.brass, 0.55),
      'stroke-width': 2,
    }),
    // targa inferiore
    el('path', { d: cutCornerPath(cw / 2 - 150, chh - 108, 300, 62, 12), fill: alpha(p.ink, 0.72) }),
    el('path', {
      d: cutCornerPath(cw / 2 - 150, chh - 108, 300, 62, 12),
      fill: 'none',
      stroke: alpha(p.brass, 0.7),
      'stroke-width': 2,
    }),
    group({}, pips),
  ].join('');

  return svg(
    { width: cw, height: chh, title: `${a.nome} — carta personaggio`, defs },
    body,
  );
}

/* ------------------------------------------------------------------ */
/* Scrittura                                                           */
/* ------------------------------------------------------------------ */

export interface PortraitManifestEntry {
  readonly id: string;
  readonly nome: string;
  readonly silhouette: string;
  readonly cartella: string;
  readonly file: readonly string[];
}

export async function generatePortraits(): Promise<PortraitManifestEntry[]> {
  setCategory('ritratto');
  const p = await loadPalette();
  const out: PortraitManifestEntry[] = [];

  for (let i = 0; i < ARCHETYPES.length; i += 1) {
    const a = ARCHETYPES[i]!;
    const dir = path.join(ASSETS_DIR, 'portrait', `portrait-${a.id}`);
    const files: string[] = [];

    for (const pose of POSES) {
      for (const expr of EXPRESSIONS) {
        const built = portrait(a, p, { pose, expr, withBackdrop: true });
        const name = `${pose}-${expr}.svg`;
        await write(
          path.join(dir, name),
          svg(
            {
              width: W,
              height: H,
              title: `${a.nome} — ${pose} / ${expr}`,
              defs: built.defs,
            },
            built.body,
          ),
        );
        files.push(name);
      }
    }

    const sil = portrait(a, p, { pose: 'neutral', expr: 'calm', mono: true });
    await write(
      path.join(dir, 'silhouette.svg'),
      svg({ width: W, height: H, title: `${a.nome} — silhouette` }, sil.body),
    );
    files.push('silhouette.svg');

    await write(path.join(dir, 'card.svg'), characterCard(a, p, i + 1));
    files.push('card.svg');

    out.push({
      id: `portrait-${a.id}`,
      nome: a.nome,
      silhouette: a.silhouette,
      cartella: `assets/portrait/portrait-${a.id}`,
      file: files,
    });
  }

  return out;
}

export function portraitIds(): string[] {
  return ARCHETYPES.map((a) => `portrait-${a.id}`);
}
