/**
 * Primitive di disegno per le scene 2.5D.
 *
 * Sono le "parole" con cui vengono scritte le undici+ scene: cieli, mari,
 * pioggia obliqua, pavimenti in prospettiva, marmo a scacchi, lampadari,
 * specchi con lampadine, tubature, vapore, coni di luce, tendaggi.
 * Tutto geometria e gradienti: nessuna immagine, nessun testo.
 */

import type { Palette } from './engine-design.js';
import {
  alpha,
  arcPath,
  el,
  f,
  group,
  linear,
  polyPath,
  radial,
  random,
  shade,
  starPath,
  type Point,
} from './util.js';

export const SCENE_W = 1920;
export const SCENE_H = 1080;

/* ------------------------------------------------------------------ */
/* Fondali                                                             */
/* ------------------------------------------------------------------ */

export function skyNight(p: Palette, id: string, horizon = 0.62): { defs: string; body: string } {
  const defs = [
    linear(`${id}-cielo`, [0, 0], [0, 1], [
      { offset: 0, color: shade(p.ink, -0.25) },
      { offset: 0.45, color: p.night },
      { offset: 1, color: shade(p.rain, -0.55) },
    ]),
    radial(`${id}-bagliore`, [0.5, horizon], 0.7, [
      { offset: 0, color: p.rain, opacity: 0.3 },
      { offset: 1, color: p.rain, opacity: 0 },
    ]),
  ].join('');
  const body = [
    el('rect', { x: 0, y: 0, width: SCENE_W, height: SCENE_H, fill: `url(#${id}-cielo)` }),
    el('rect', { x: 0, y: 0, width: SCENE_W, height: SCENE_H, fill: `url(#${id}-bagliore)` }),
    cloudBands(p, `${id}-nubi`),
  ].join('');
  return { defs, body };
}

/** Bande di nuvole basse: ellissi molto larghe, appena percettibili. */
export function cloudBands(p: Palette, seed: string): string {
  const rng = random(seed);
  const parts: string[] = [];
  for (let i = 0; i < 9; i += 1) {
    const cy = 90 + rng.next() * 420;
    const rx = 380 + rng.next() * 520;
    const ry = 34 + rng.next() * 46;
    parts.push(
      el('ellipse', {
        cx: rng.next() * SCENE_W,
        cy,
        rx,
        ry,
        fill: alpha(i % 2 === 0 ? p.rain : p.plum, 0.09 + rng.next() * 0.07),
      }),
    );
  }
  return group({}, parts);
}

/** Mare nero con creste illuminate. */
export function sea(p: Palette, id: string, horizonY: number): { defs: string; body: string } {
  const defs = linear(`${id}-mare`, [0, 0], [0, 1], [
    { offset: 0, color: shade(p.rain, -0.6) },
    { offset: 0.35, color: shade(p.ink, 0.06) },
    { offset: 1, color: p.ink },
  ]);
  const rng = random(`${id}-onde`);
  const crests: string[] = [];
  for (let i = 0; i < 70; i += 1) {
    const t = rng.next();
    const y = horizonY + Math.pow(t, 1.9) * (SCENE_H - horizonY);
    const w = 30 + t * 260;
    crests.push(
      el('rect', {
        x: rng.next() * SCENE_W - w / 2,
        y,
        width: w,
        height: 1 + t * 3,
        rx: 1.5,
        fill: alpha(p.rain, 0.1 + t * 0.22),
      }),
    );
  }
  const body = [
    el('rect', {
      x: 0,
      y: horizonY,
      width: SCENE_W,
      height: SCENE_H - horizonY,
      fill: `url(#${id}-mare)`,
    }),
    group({}, crests),
  ].join('');
  return { defs, body };
}

/** Pioggia obliqua in tratti sottili. */
export function rain(
  p: Palette,
  seed: string,
  opts: { count?: number; angle?: number; opacity?: number; length?: number } = {},
): string {
  const { count = 220, angle = 16, opacity = 0.3, length = 120 } = opts;
  const rng = random(seed);
  const dx = Math.tan((angle * Math.PI) / 180);
  const strokes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = rng.next() * (SCENE_W + 400) - 200;
    const y = rng.next() * SCENE_H;
    const len = length * (0.4 + rng.next() * 0.9);
    strokes.push(
      el('line', {
        x1: f(x),
        y1: f(y),
        x2: f(x + dx * len),
        y2: f(y + len),
        stroke: alpha(p.rain, opacity * (0.3 + rng.next() * 0.7)),
        'stroke-width': f(0.7 + rng.next() * 1.4),
        'stroke-linecap': 'butt',
      }),
    );
  }
  return group({}, strokes);
}

/* ------------------------------------------------------------------ */
/* Pavimenti in prospettiva                                            */
/* ------------------------------------------------------------------ */

export interface FloorGeometry {
  /** y sullo schermo per la riga `k` (0 = orizzonte, 1 = bordo inferiore). */
  rowY(t: number): number;
  /** x sullo schermo per la colonna `j` alla riga `t`. */
  colX(j: number, t: number): number;
}

export function floorGeometry(horizonY: number, vanishX: number, spread = 2.6): FloorGeometry {
  const depth = SCENE_H - horizonY;
  return {
    rowY: (t) => horizonY + Math.pow(t, 2.1) * depth,
    colX: (j, t) => vanishX + j * (Math.pow(t, 2.1) * depth * spread) * 0.06,
  };
}

/** Marmo a scacchi in prospettiva a un punto. */
export function checkerFloor(
  p: Palette,
  id: string,
  opts: { horizonY: number; vanishX?: number; rows?: number; cols?: number; light?: string; dark?: string },
): { defs: string; body: string } {
  const {
    horizonY,
    vanishX = SCENE_W / 2,
    rows = 14,
    cols = 16,
    light = p.marble,
    dark = shade(p.ink, 0.12),
  } = opts;
  const geo = floorGeometry(horizonY, vanishX);
  const tiles: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    const t0 = (r + 1) / (rows + 1);
    const t1 = (r + 2) / (rows + 1);
    const y0 = geo.rowY(t0);
    const y1 = geo.rowY(t1);
    for (let c = -cols; c < cols; c += 1) {
      const quad: Point[] = [
        [geo.colX(c, t0), y0],
        [geo.colX(c + 1, t0), y0],
        [geo.colX(c + 1, t1), y1],
        [geo.colX(c, t1), y1],
      ];
      const even = (r + c + cols * 2) % 2 === 0;
      const fade = 0.35 + 0.65 * t0;
      tiles.push(
        el('path', {
          d: polyPath(quad, true),
          fill: even ? alpha(light, 0.62 * fade) : alpha(dark, 0.75 * fade),
        }),
      );
    }
  }
  const defs = linear(`${id}-riflesso`, [0, 0], [0, 1], [
    { offset: 0, color: p.ivory, opacity: 0.16 },
    { offset: 1, color: p.ivory, opacity: 0 },
  ]);
  const body = [
    el('rect', {
      x: 0,
      y: horizonY,
      width: SCENE_W,
      height: SCENE_H - horizonY,
      fill: shade(p.ink, 0.08),
    }),
    group({}, tiles),
    el('rect', {
      x: 0,
      y: horizonY,
      width: SCENE_W,
      height: (SCENE_H - horizonY) * 0.8,
      fill: `url(#${id}-riflesso)`,
    }),
  ].join('');
  return { defs, body };
}

/** Moquette a rombi in prospettiva (corridoi). */
export function diamondCarpet(
  p: Palette,
  opts: { horizonY: number; vanishX: number; rows?: number; cols?: number; base?: string; figure?: string },
): string {
  const { horizonY, vanishX, rows = 12, cols = 5, base = p.lacquerDeep, figure = p.plum } = opts;
  const geo = floorGeometry(horizonY, vanishX, 1.6);
  const parts: string[] = [
    el('rect', { x: 0, y: horizonY, width: SCENE_W, height: SCENE_H - horizonY, fill: shade(base, -0.35) }),
  ];
  for (let r = 0; r < rows; r += 1) {
    const t0 = (r + 1) / (rows + 1);
    const t1 = (r + 2) / (rows + 1);
    const y0 = geo.rowY(t0);
    const y1 = geo.rowY(t1);
    const ym = (y0 + y1) / 2;
    for (let c = -cols; c < cols; c += 1) {
      const cx0 = geo.colX(c + 0.5, t0);
      const cx1 = geo.colX(c + 0.5, t1);
      const half0 = (geo.colX(c + 1, t0) - geo.colX(c, t0)) / 2;
      const half1 = (geo.colX(c + 1, t1) - geo.colX(c, t1)) / 2;
      const rhomb: Point[] = [
        [(cx0 + cx1) / 2, y0],
        [((cx0 + cx1) / 2) + (half0 + half1) / 2, ym],
        [(cx0 + cx1) / 2, y1],
        [((cx0 + cx1) / 2) - (half0 + half1) / 2, ym],
      ];
      parts.push(
        el('path', {
          d: polyPath(rhomb, true),
          fill: alpha((r + c) % 2 === 0 ? figure : base, 0.28 + 0.5 * t0),
        }),
      );
    }
  }
  return group({}, parts);
}

/** Piastrelle rettangolari (piscina, cucina, passaggi). */
export function tilePattern(
  id: string,
  color: string,
  grout: string,
  size = 46,
  ratio = 0.62,
): string {
  const h = size * ratio;
  return el(
    'pattern',
    { id, width: size, height: h, patternUnits: 'userSpaceOnUse' },
    [
      el('rect', { width: size, height: h, fill: grout }),
      el('rect', { x: 1, y: 1, width: size - 2, height: h - 2, fill: color }),
      el('rect', { x: 1, y: 1, width: size - 2, height: (h - 2) * 0.34, fill: alpha('#ffffff', 0.05) }),
    ].join(''),
  );
}

/* ------------------------------------------------------------------ */
/* Architettura                                                        */
/* ------------------------------------------------------------------ */

export function wallPanels(
  p: Palette,
  opts: { y: number; height: number; color?: string; count?: number; trim?: string },
): string {
  const { y, height, color = p.petrol, count = 9, trim = p.brass } = opts;
  const parts: string[] = [
    el('rect', { x: 0, y, width: SCENE_W, height, fill: color }),
  ];
  const w = SCENE_W / count;
  for (let i = 0; i < count; i += 1) {
    const x = i * w + w * 0.12;
    parts.push(
      el('rect', {
        x,
        y: y + height * 0.1,
        width: w * 0.76,
        height: height * 0.78,
        fill: alpha(shade(color, 0.12), 0.55),
        stroke: alpha(trim, 0.22),
        'stroke-width': 1.2,
      }),
    );
  }
  parts.push(el('rect', { x: 0, y: y + height - 10, width: SCENE_W, height: 10, fill: alpha(trim, 0.35) }));
  return group({}, parts);
}

export function column(p: Palette, x: number, y: number, w: number, h: number): string {
  const cap = w * 1.35;
  return group({}, [
    el('rect', { x: x - w / 2, y, width: w, height: h, fill: shade(p.marble, -0.12) }),
    el('rect', { x: x - w / 2, y, width: w * 0.32, height: h, fill: alpha(p.ivory, 0.16) }),
    el('rect', { x: x - w / 2 + w * 0.78, y, width: w * 0.22, height: h, fill: alpha(p.ink, 0.28) }),
    el('rect', { x: x - cap / 2, y: y - 22, width: cap, height: 22, fill: p.brass }),
    el('rect', { x: x - cap / 2, y: y + h, width: cap, height: 18, fill: shade(p.brass, -0.3) }),
  ]);
}

/** Porta con architrave; `open` apre uno spiraglio di luce. */
export function door(
  p: Palette,
  opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    color?: string;
    open?: number;
    lightColor?: string;
    knob?: boolean;
  },
): string {
  const { x, y, w, h, color = shade(p.plum, -0.15), open = 0, lightColor = p.brassSoft, knob = true } = opts;
  const parts: string[] = [
    el('rect', { x: x - 8, y: y - 10, width: w + 16, height: h + 10, fill: alpha(p.brass, 0.3) }),
    el('rect', { x, y, width: w, height: h, fill: color }),
    el('rect', { x: x + w * 0.12, y: y + h * 0.08, width: w * 0.76, height: h * 0.36, fill: alpha(p.ink, 0.3) }),
    el('rect', { x: x + w * 0.12, y: y + h * 0.52, width: w * 0.76, height: h * 0.38, fill: alpha(p.ink, 0.3) }),
  ];
  if (open > 0) {
    const gap = w * open;
    parts.push(
      el('rect', { x, y, width: gap, height: h, fill: alpha(lightColor, 0.75) }),
      el('path', {
        d: polyPath(
          [
            [x + gap, y + h],
            [x + gap + 40, y + h],
            [x + gap + 190, SCENE_H],
            [x + gap - 40, SCENE_H],
          ],
          true,
        ),
        fill: alpha(lightColor, 0.14),
      }),
    );
  }
  if (knob) parts.push(el('circle', { cx: x + w * 0.88, cy: y + h * 0.54, r: 6, fill: p.brassSoft }));
  return group({}, parts);
}

/** Finestra battuta dalla pioggia: vetro, montanti, rivoli. */
export function rainWindow(
  p: Palette,
  id: string,
  opts: { x: number; y: number; w: number; h: number },
): { defs: string; body: string } {
  const { x, y, w, h } = opts;
  const defs = linear(`${id}-vetro`, [0, 0], [0.4, 1], [
    { offset: 0, color: shade(p.rain, -0.35) },
    { offset: 0.6, color: shade(p.ink, 0.1) },
    { offset: 1, color: p.ink },
  ]);
  const rng = random(`${id}-rivoli`);
  const drips: string[] = [];
  for (let i = 0; i < 46; i += 1) {
    const dx = x + 8 + rng.next() * (w - 16);
    const dy = y + rng.next() * h * 0.7;
    const len = 20 + rng.next() * (h * 0.35);
    drips.push(
      el('path', {
        d: `M ${f(dx)} ${f(dy)} q ${f(rng.range(-5, 5))} ${f(len / 2)} ${f(rng.range(-3, 3))} ${f(len)}`,
        stroke: alpha(p.ivory, 0.1 + rng.next() * 0.16),
        'stroke-width': f(0.8 + rng.next()),
        fill: 'none',
      }),
    );
  }
  const body = group({}, [
    el('rect', { x: x - 12, y: y - 12, width: w + 24, height: h + 24, fill: shade(p.plum, -0.2) }),
    el('rect', { x, y, width: w, height: h, fill: `url(#${id}-vetro)` }),
    group({}, drips),
    el('rect', { x: x + w / 2 - 5, y, width: 10, height: h, fill: shade(p.plum, -0.05) }),
    el('rect', { x, y: y + h * 0.46, width: w, height: 10, fill: shade(p.plum, -0.05) }),
    el('rect', { x, y, width: w, height: h, fill: 'none', stroke: alpha(p.brass, 0.35), 'stroke-width': 2 }),
  ]);
  return { defs, body };
}

/* ------------------------------------------------------------------ */
/* Luce                                                                */
/* ------------------------------------------------------------------ */

export function lightCone(
  color: string,
  opts: { x: number; y: number; spread: number; length: number; opacity?: number },
): string {
  const { x, y, spread, length, opacity = 0.16 } = opts;
  return el('path', {
    d: polyPath(
      [
        [x - 12, y],
        [x + 12, y],
        [x + spread, y + length],
        [x - spread, y + length],
      ],
      true,
    ),
    fill: color,
    opacity: f(opacity),
  });
}

export function haloDefs(id: string, color: string, inner = 0.55): string {
  return radial(id, [0.5, 0.5], 0.5, [
    { offset: 0, color, opacity: inner },
    { offset: 0.5, color, opacity: inner * 0.35 },
    { offset: 1, color, opacity: 0 },
  ]);
}

export function halo(id: string, cx: number, cy: number, r: number): string {
  return el('circle', { cx, cy, r, fill: `url(#${id})` });
}

/** Lampadario a cascata: anelli di gocce di vetro. */
export function chandelier(
  p: Palette,
  id: string,
  opts: { cx: number; cy: number; r: number; rings?: number },
): { defs: string; body: string } {
  const { cx, cy, r, rings = 5 } = opts;
  const rng = random(`${id}-gocce`);
  const parts: string[] = [];
  parts.push(el('rect', { x: cx - 4, y: cy - r * 2.2, width: 8, height: r * 1.1, fill: alpha(p.brass, 0.7) }));
  for (let ring = 0; ring < rings; ring += 1) {
    const rr = r * (0.34 + (ring / (rings - 1)) * 0.66);
    const yy = cy - r * 0.75 + ring * (r * 0.34);
    const count = 14 + ring * 9;
    const drops: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count;
      const px = cx + Math.cos(a) * rr;
      const py = yy + Math.sin(a) * rr * 0.26;
      const len = 12 + rng.next() * 26;
      drops.push(
        el('path', {
          d: polyPath(
            [
              [px, py],
              [px + 3.4, py + len * 0.4],
              [px, py + len],
              [px - 3.4, py + len * 0.4],
            ],
            true,
          ),
          fill: alpha(p.ivory, 0.32 + rng.next() * 0.42),
        }),
      );
    }
    parts.push(
      el('ellipse', {
        cx,
        cy: yy,
        rx: rr,
        ry: rr * 0.26,
        fill: 'none',
        stroke: alpha(p.brass, 0.6),
        'stroke-width': 2,
      }),
      group({}, drops),
    );
  }
  parts.push(el('path', { d: starPath(cx, cy + r * 0.2, r * 0.3, r * 0.1, 8), fill: alpha(p.brassSoft, 0.85) }));
  const defs = haloDefs(`${id}-alone`, p.brassSoft, 0.5);
  const body = group({}, [halo(`${id}-alone`, cx, cy, r * 2.4), group({}, parts)]);
  return { defs, body };
}

/** Cornice di specchio con lampadine (camerini). */
export function bulbMirror(
  p: Palette,
  id: string,
  opts: { x: number; y: number; w: number; h: number },
): { defs: string; body: string } {
  const { x, y, w, h } = opts;
  const defs = [
    linear(`${id}-vetro`, [0, 0], [0.6, 1], [
      { offset: 0, color: alpha(p.ivory, 0.22) },
      { offset: 0.5, color: alpha(p.rain, 0.18) },
      { offset: 1, color: alpha(p.ink, 0.5) },
    ]),
    haloDefs(`${id}-alone`, p.brassSoft, 0.55),
  ].join('');
  const bulbs: string[] = [];
  const per = 8;
  const push = (bx: number, by: number): void => {
    bulbs.push(
      el('circle', { cx: bx, cy: by, r: 26, fill: `url(#${id}-alone)` }),
      el('circle', { cx: bx, cy: by, r: 9, fill: p.brassSoft }),
      el('circle', { cx: bx - 2.5, cy: by - 2.5, r: 3.2, fill: alpha('#ffffff', 0.85) }),
    );
  };
  for (let i = 0; i <= per; i += 1) {
    push(x + (w * i) / per, y - 22);
    push(x + (w * i) / per, y + h + 22);
  }
  for (let i = 1; i < 5; i += 1) {
    push(x - 22, y + (h * i) / 5);
    push(x + w + 22, y + (h * i) / 5);
  }
  const body = group({}, [
    el('rect', { x: x - 44, y: y - 44, width: w + 88, height: h + 88, fill: shade(p.plum, -0.18) }),
    el('rect', { x, y, width: w, height: h, fill: `url(#${id}-vetro)` }),
    el('rect', { x, y, width: w, height: h, fill: 'none', stroke: alpha(p.brass, 0.6), 'stroke-width': 3 }),
    group({}, bulbs),
  ]);
  return { defs, body };
}

/* ------------------------------------------------------------------ */
/* Oggetti ricorrenti                                                  */
/* ------------------------------------------------------------------ */

export function railing(p: Palette, opts: { y: number; height: number; posts?: number }): string {
  const { y, height, posts = 22 } = opts;
  const parts: string[] = [
    el('rect', { x: 0, y, width: SCENE_W, height: 12, fill: p.brass }),
    el('rect', { x: 0, y: y + 4, width: SCENE_W, height: 3, fill: alpha(p.brassSoft, 0.8) }),
    el('rect', { x: 0, y: y + height - 8, width: SCENE_W, height: 8, fill: shade(p.brass, -0.4) }),
  ];
  for (let i = 0; i <= posts; i += 1) {
    const x = (SCENE_W * i) / posts;
    parts.push(el('rect', { x: x - 4, y: y + 10, width: 8, height: height - 16, fill: shade(p.brass, -0.2) }));
  }
  return group({}, parts);
}

export function palm(p: Palette, seed: string, opts: { x: number; y: number; scale: number; bend: number }): string {
  const { x, y, scale, bend } = opts;
  const rng = random(seed);
  const parts: string[] = [];
  const trunkTop: Point = [x + bend * 120 * scale, y - 320 * scale];
  parts.push(
    el('path', {
      d: `M ${f(x - 16 * scale)} ${f(y)} Q ${f(x + bend * 40 * scale)} ${f(y - 180 * scale)} ${f(trunkTop[0] - 9 * scale)} ${f(trunkTop[1])} L ${f(trunkTop[0] + 9 * scale)} ${f(trunkTop[1])} Q ${f(x + bend * 60 * scale + 20 * scale)} ${f(y - 180 * scale)} ${f(x + 16 * scale)} ${f(y)} Z`,
      fill: shade(p.ink, 0.14),
    }),
  );
  for (let i = 0; i < 9; i += 1) {
    const a = -Math.PI * 0.9 + (Math.PI * 1.1 * i) / 8 + rng.range(-0.08, 0.08);
    const len = (150 + rng.next() * 110) * scale;
    const ex = trunkTop[0] + Math.cos(a) * len + bend * 60 * scale;
    const ey = trunkTop[1] + Math.sin(a) * len * 0.62 + len * 0.28;
    parts.push(
      el('path', {
        d: `M ${f(trunkTop[0])} ${f(trunkTop[1])} Q ${f((trunkTop[0] + ex) / 2 + bend * 40 * scale)} ${f((trunkTop[1] + ey) / 2 - 60 * scale)} ${f(ex)} ${f(ey)} q ${f(-12 * scale)} ${f(-16 * scale)} ${f((trunkTop[0] - ex) * 0.96)} ${f((trunkTop[1] - ey) * 0.98)} Z`,
        fill: alpha(shade(p.petrol, -0.25), 0.9),
      }),
    );
  }
  return group({}, parts);
}

export function pipes(p: Palette, seed: string, opts: { y: number; count?: number }): string {
  const { y, count = 4 } = opts;
  const rng = random(seed);
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const py = y + i * 44;
    const thickness = 16 + rng.next() * 14;
    parts.push(
      el('rect', { x: 0, y: py, width: SCENE_W, height: thickness, fill: shade(p.rain, -0.5) }),
      el('rect', { x: 0, y: py + 2, width: SCENE_W, height: thickness * 0.28, fill: alpha(p.ivory, 0.1) }),
    );
    for (let j = 0; j < 7; j += 1) {
      const cx = 120 + j * 280 + rng.range(-40, 40);
      parts.push(
        el('rect', {
          x: cx,
          y: py - 4,
          width: 22,
          height: thickness + 8,
          rx: 3,
          fill: shade(p.rain, -0.62),
        }),
      );
    }
  }
  return group({}, parts);
}

/** Scala a chiocciola vista di lato: gradini come parallelogrammi sfalsati. */
export function spiralStair(p: Palette, opts: { cx: number; top: number; bottom: number; r: number }): string {
  const { cx, top, bottom, r } = opts;
  const steps = 16;
  const parts: string[] = [
    el('rect', { x: cx - 9, y: top, width: 18, height: bottom - top, fill: shade(p.rain, -0.55) }),
  ];
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const y = top + t * (bottom - top);
    const a = t * Math.PI * 2.4;
    const w = Math.cos(a) * r;
    parts.push(
      el('path', {
        d: polyPath(
          [
            [cx, y],
            [cx + w, y - 6],
            [cx + w, y + 8],
            [cx, y + 14],
          ],
          true,
        ),
        fill: alpha(shade(p.rain, -0.35), 0.75 + 0.25 * Math.abs(Math.cos(a))),
      }),
    );
  }
  return group({}, parts);
}

/** Vapore / nebbia: ellissi molto sfocate. */
export function steam(p: Palette, seed: string, opts: { y: number; count?: number; color?: string }): string {
  const { y, count = 10, color = p.ivory } = opts;
  const rng = random(seed);
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    parts.push(
      el('ellipse', {
        cx: rng.next() * SCENE_W,
        cy: y + rng.range(-120, 120),
        rx: 120 + rng.next() * 260,
        ry: 40 + rng.next() * 90,
        fill: alpha(color, 0.05 + rng.next() * 0.07),
      }),
    );
  }
  return group({}, parts);
}

/** Sagome sfocate di ballerini sul fondo. */
export function crowd(p: Palette, seed: string, opts: { y: number; count?: number; scale?: number }): string {
  const { y, count = 9, scale = 1 } = opts;
  const rng = random(seed);
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = 90 + (SCENE_W - 180) * (i / (count - 1)) + rng.range(-45, 45);
    const s = scale * (0.85 + rng.next() * 0.35);
    const h = 220 * s;
    const opacity = 0.16 + rng.next() * 0.16;
    const skirt = rng.chance(0.5);
    parts.push(
      group({ opacity: f(opacity), transform: `translate(${f(x)} ${f(y)})` }, [
        el('circle', { cx: 0, cy: -h, r: 20 * s, fill: p.ink }),
        el('path', {
          d: skirt
            ? polyPath(
                [
                  [-16 * s, -h + 16 * s],
                  [16 * s, -h + 16 * s],
                  [46 * s, 0],
                  [-46 * s, 0],
                ],
                true,
              )
            : polyPath(
                [
                  [-22 * s, -h + 16 * s],
                  [22 * s, -h + 16 * s],
                  [26 * s, 0],
                  [-26 * s, 0],
                ],
                true,
              ),
          fill: p.ink,
        }),
      ]),
    );
  }
  return group({}, parts);
}

/** Bottiglie su mensola (bar). */
export function bottles(p: Palette, seed: string, opts: { x: number; y: number; w: number; count?: number }): string {
  const { x, y, w, count = 14 } = opts;
  const rng = random(seed);
  const colors = [p.petrolLit, p.lacquerDeep, p.brass, p.plum, p.rain];
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const bx = x + (w * i) / count + rng.range(-4, 4);
    const h = 60 + rng.next() * 54;
    const bw = 16 + rng.next() * 10;
    const col = colors[i % colors.length]!;
    parts.push(
      group({ transform: `translate(${f(bx)} ${f(y)})` }, [
        el('rect', { x: -bw / 2, y: -h, width: bw, height: h, rx: 3, fill: alpha(col, 0.85) }),
        el('rect', { x: -3, y: -h - 22, width: 6, height: 24, fill: alpha(col, 0.7) }),
        el('rect', { x: -bw / 2 + 2, y: -h + 6, width: 3, height: h - 14, fill: alpha(p.ivory, 0.22) }),
        el('rect', { x: -bw / 2, y: -h * 0.55, width: bw, height: 14, fill: alpha(p.ivory, 0.5) }),
      ]),
    );
  }
  return group({}, parts);
}

/** Calici su un piano. */
export function glasses(p: Palette, seed: string, opts: { x: number; y: number; w: number; count?: number }): string {
  const { x, y, w, count = 6 } = opts;
  const rng = random(seed);
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const gx = x + (w * i) / Math.max(1, count - 1) + rng.range(-6, 6);
    const s = 0.85 + rng.next() * 0.3;
    parts.push(
      group({ transform: `translate(${f(gx)} ${f(y)}) scale(${f(s)})` }, [
        el('path', {
          d: 'M -14 -54 L 14 -54 L 9 -26 Q 0 -18 -9 -26 Z',
          fill: alpha(p.ivory, 0.28),
          stroke: alpha(p.ivory, 0.45),
          'stroke-width': 1.2,
        }),
        el('rect', { x: -1.5, y: -26, width: 3, height: 22, fill: alpha(p.ivory, 0.4) }),
        el('ellipse', { cx: 0, cy: -3, rx: 11, ry: 3.4, fill: alpha(p.ivory, 0.32) }),
        el('path', { d: 'M -14 -54 L 14 -54 L 12 -44 L -12 -44 Z', fill: alpha(p.lacquer, 0.5) }),
      ]),
    );
  }
  return group({}, parts);
}

/* ------------------------------------------------------------------ */
/* Cornici e velature di primo piano                                   */
/* ------------------------------------------------------------------ */

export function vignette(p: Palette, id: string): { defs: string; body: string } {
  const defs = radial(id, [0.5, 0.48], 0.72, [
    { offset: 0.45, color: p.ink, opacity: 0 },
    { offset: 0.82, color: p.ink, opacity: 0.34 },
    { offset: 1, color: p.ink, opacity: 0.78 },
  ]);
  const body = el('rect', { x: 0, y: 0, width: SCENE_W, height: SCENE_H, fill: `url(#${id})` });
  return { defs, body };
}

/** Tendaggi laterali di primo piano (velluto). */
export function sideDrapes(p: Palette, id: string, width = 260, color?: string): { defs: string; body: string } {
  const tone = color ?? p.petrol;
  const defs = [
    linear(`${id}-sx`, [0, 0], [1, 0], [
      { offset: 0, color: shade(tone, -0.55) },
      { offset: 0.55, color: tone },
      { offset: 1, color: shade(tone, -0.7) },
    ]),
    linear(`${id}-dx`, [1, 0], [0, 0], [
      { offset: 0, color: shade(tone, -0.55) },
      { offset: 0.55, color: tone },
      { offset: 1, color: shade(tone, -0.7) },
    ]),
  ].join('');
  const folds = (x0: number, dir: 1 | -1): string => {
    const parts: string[] = [];
    for (let i = 0; i < 6; i += 1) {
      const fx = x0 + dir * (i * (width / 6));
      parts.push(
        el('path', {
          d: `M ${f(fx)} 0 q ${f(dir * 14)} ${f(SCENE_H / 2)} 0 ${f(SCENE_H)} L ${f(fx + dir * 8)} ${f(SCENE_H)} q ${f(dir * -12)} ${f(-SCENE_H / 2)} 0 ${f(-SCENE_H)} Z`,
          fill: alpha(shade(tone, -0.6), 0.55),
        }),
      );
    }
    return group({}, parts);
  };
  const body = group({}, [
    el('rect', { x: 0, y: 0, width, height: SCENE_H, fill: `url(#${id}-sx)` }),
    folds(20, 1),
    el('rect', { x: SCENE_W - width, y: 0, width, height: SCENE_H, fill: `url(#${id}-dx)` }),
    folds(SCENE_W - 20, -1),
  ]);
  return { defs, body };
}

/** Arco architettonico che incornicia la scena (primo piano). */
export function archFrame(p: Palette, opts: { inset?: number; color?: string } = {}): string {
  const { inset = 130, color = shade(p.ink, 0.06) } = opts;
  const r = SCENE_W * 0.42;
  const d = [
    `M 0 0 L ${f(SCENE_W)} 0 L ${f(SCENE_W)} ${f(SCENE_H)} L ${f(SCENE_W - inset)} ${f(SCENE_H)}`,
    `L ${f(SCENE_W - inset)} ${f(SCENE_H * 0.42)}`,
    `A ${f(r)} ${f(r * 0.7)} 0 0 0 ${f(inset)} ${f(SCENE_H * 0.42)}`,
    `L ${f(inset)} ${f(SCENE_H)} L 0 ${f(SCENE_H)} Z`,
  ].join(' ');
  return group({}, [
    el('path', { d, fill: color }),
    el('path', { d, fill: 'none', stroke: alpha(p.brass, 0.4), 'stroke-width': 3 }),
  ]);
}

/** Grana di carta applicata sopra al layer. */
export function grainOverlay(filterId: string, opacity = 0.07): string {
  return el('rect', {
    x: 0,
    y: 0,
    width: SCENE_W,
    height: SCENE_H,
    filter: `url(#${filterId})`,
    opacity: f(opacity),
    style: 'mix-blend-mode:soft-light',
  });
}

/** Arco decorativo (usato per le insegne e i sopraluce). */
export function fanlight(p: Palette, cx: number, cy: number, r: number): string {
  const parts: string[] = [
    el('path', { d: `${arcPath(cx, cy, r, r, 180, 360)} L ${f(cx - r)} ${f(cy)} Z`, fill: alpha(p.brassSoft, 0.22) }),
  ];
  for (let i = 1; i < 7; i += 1) {
    const a = Math.PI + (Math.PI * i) / 7;
    parts.push(
      el('line', {
        x1: cx,
        y1: cy,
        x2: f(cx + Math.cos(a) * r),
        y2: f(cy + Math.sin(a) * r),
        stroke: alpha(p.brass, 0.6),
        'stroke-width': 2.5,
      }),
    );
  }
  parts.push(
    el('path', { d: arcPath(cx, cy, r, r, 180, 360), fill: 'none', stroke: p.brass, 'stroke-width': 4 }),
  );
  return group({}, parts);
}
