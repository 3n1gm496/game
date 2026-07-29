/**
 * Passo 3 — Scene 2.5D.
 *
 * Ogni scena vive in `apps/web/public/assets/scene/<chiave>/` con un file SVG
 * per livello di profondità (`layer-0` fondo … `layer-3` primo piano) e un
 * `scene.json` che descrive layer, fattori di parallasse, punti luce e hotspot
 * in coordinate percentuali. Nessun testo dentro le scene.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Palette } from './engine-design.js';
import { loadPalette } from './engine-design.js';
import {
  SCENE_H,
  SCENE_W,
  archFrame,
  bottles,
  bulbMirror,
  chandelier,
  checkerFloor,
  column,
  crowd,
  diamondCarpet,
  door,
  fanlight,
  glasses,
  grainOverlay,
  halo,
  haloDefs,
  lightCone,
  palm,
  pipes,
  rain,
  rainWindow,
  railing,
  sea,
  sideDrapes,
  skyNight,
  spiralStair,
  steam,
  tilePattern,
  vignette,
  wallPanels,
} from './scene-parts.js';
import {
  ASSETS_DIR,
  alpha,
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

/* ------------------------------------------------------------------ */
/* Tipi                                                                */
/* ------------------------------------------------------------------ */

export interface Light {
  readonly chiave: string;
  /** percentuale della larghezza */
  readonly x: number;
  /** percentuale dell'altezza */
  readonly y: number;
  /** raggio in percentuale della larghezza */
  readonly raggio: number;
  readonly colore: string;
  readonly intensita: number;
  /** periodo di pulsazione in ms; 0 = fissa */
  readonly pulsazione: number;
}

export interface Hotspot {
  readonly chiave: string;
  readonly etichetta: string;
  readonly x: number;
  readonly y: number;
  readonly raggio: number;
  /** layer su cui vive l'hotspot (di norma 2). */
  readonly layer: number;
}

interface Built {
  readonly defs?: string;
  readonly body: string;
}

type LayerFn = (p: Palette, id: string) => Built;

interface SceneDef {
  readonly chiave: string;
  readonly titolo: string;
  readonly descrizione: string;
  readonly atmosfera: {
    readonly pioggia: boolean;
    readonly nebbia: number;
    readonly grana: number;
    readonly dominante: (p: Palette) => string;
  };
  readonly luci: readonly Light[];
  readonly hotspot: readonly Hotspot[];
  readonly layers: readonly [LayerFn, LayerFn, LayerFn, LayerFn];
}

export const PARALLAX = [0.15, 0.4, 1.0, 1.6] as const;
const ROLES = ['fondo', 'medio', 'principale', 'primo-piano'] as const;

const full = (color: string): string =>
  el('rect', { x: 0, y: 0, width: SCENE_W, height: SCENE_H, fill: color });

const hs = (
  chiave: string,
  etichetta: string,
  x: number,
  y: number,
  raggio = 7,
  layer = 2,
): Hotspot => ({ chiave, etichetta, x, y, raggio, layer });

const light = (
  chiave: string,
  x: number,
  y: number,
  raggio: number,
  colore: string,
  intensita = 0.6,
  pulsazione = 0,
): Light => ({ chiave, x, y, raggio, colore, intensita, pulsazione });

/* ------------------------------------------------------------------ */
/* Elementi locali riutilizzati da più scene                           */
/* ------------------------------------------------------------------ */

/** Griglia di caselle portachiavi dietro il bancone. */
function pigeonholes(p: Palette, x: number, y: number, w: number, h: number, cols = 12, rows = 5): string {
  const parts: string[] = [el('rect', { x, y, width: w, height: h, fill: shade(p.plum, -0.3) })];
  const cw = w / cols;
  const ch = h / rows;
  const rng = random('caselle');
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cx = x + c * cw + 3;
      const cy = y + r * ch + 3;
      parts.push(
        el('rect', { x: cx, y: cy, width: cw - 6, height: ch - 6, fill: alpha(p.ink, 0.72) }),
        el('rect', { x: cx, y: cy, width: cw - 6, height: 2, fill: alpha(p.brass, 0.4) }),
      );
      if (rng.chance(0.42)) {
        // chiave con fiocco appesa
        parts.push(
          el('rect', { x: cx + cw * 0.4, y: cy + ch * 0.3, width: 3, height: ch * 0.4, fill: p.brass }),
          el('circle', { cx: cx + cw * 0.42, cy: cy + ch * 0.28, r: 4, fill: alpha(p.lacquer, 0.8) }),
        );
      }
    }
  }
  return group({}, parts);
}

/** Fila di orologi delle capitali (senza testo: solo quadranti e lancette). */
function capitalClocks(p: Palette, y: number, count = 5): string {
  const parts: string[] = [];
  const gap = SCENE_W / (count + 1);
  for (let i = 0; i < count; i += 1) {
    const cx = gap * (i + 1);
    const r = 52;
    const angle = (i * 47 + 20) * (Math.PI / 180);
    parts.push(
      group({}, [
        el('circle', { cx, cy: y, r: r + 8, fill: p.brass }),
        el('circle', { cx, cy: y, r, fill: shade(p.ivory, -0.06) }),
        el('circle', { cx, cy: y, r: r - 6, fill: 'none', stroke: alpha(p.ink, 0.25), 'stroke-width': 1 }),
        el('line', {
          x1: cx,
          y1: y,
          x2: f(cx + Math.cos(angle) * r * 0.55),
          y2: f(y + Math.sin(angle) * r * 0.55),
          stroke: p.ink,
          'stroke-width': 4,
          'stroke-linecap': 'butt',
        }),
        el('line', {
          x1: cx,
          y1: y,
          x2: f(cx + Math.cos(angle * 2.7) * r * 0.78),
          y2: f(y + Math.sin(angle * 2.7) * r * 0.78),
          stroke: p.ink,
          'stroke-width': 2.4,
        }),
        el('circle', { cx, cy: y, r: 4, fill: p.lacquer }),
        el('rect', { x: cx - 34, y: y + r + 16, width: 68, height: 8, fill: alpha(p.brass, 0.7) }),
      ]),
    );
  }
  return group({}, parts);
}

/** Manometri / contatori a lancetta (quadro elettrico, registrazione). */
function gauges(p: Palette, x: number, y: number, count: number, r = 34, gap = 96): string {
  const parts: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const cx = x + i * gap;
    const a = Math.PI * (0.15 + 0.7 * ((i * 0.37) % 1));
    parts.push(
      el('circle', { cx, cy: y, r: r + 5, fill: shade(p.brass, -0.4) }),
      el('circle', { cx, cy: y, r, fill: shade(p.ivory, -0.14) }),
      el('path', {
        d: `M ${f(cx - r * 0.75)} ${f(y + r * 0.2)} A ${f(r * 0.78)} ${f(r * 0.78)} 0 0 1 ${f(cx + r * 0.75)} ${f(y + r * 0.2)}`,
        fill: 'none',
        stroke: alpha(p.ink, 0.4),
        'stroke-width': 2,
      }),
      el('line', {
        x1: cx,
        y1: f(y + r * 0.2),
        x2: f(cx - Math.cos(a) * r * 0.7),
        y2: f(y + r * 0.2 - Math.sin(a) * r * 0.7),
        stroke: p.lacquer,
        'stroke-width': 3,
      }),
      el('circle', { cx, cy: f(y + r * 0.2), r: 3.5, fill: p.ink }),
    );
  }
  return group({}, parts);
}

/** Bobina di registratore a nastro. */
function reel(p: Palette, cx: number, cy: number, r: number): string {
  const spokes: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const a = (Math.PI * 2 * i) / 3;
    spokes.push(
      el('circle', {
        cx: f(cx + Math.cos(a) * r * 0.55),
        cy: f(cy + Math.sin(a) * r * 0.55),
        r: r * 0.22,
        fill: shade(p.ink, 0.1),
      }),
    );
  }
  return group({}, [
    el('circle', { cx, cy, r, fill: shade(p.ivoryDim, -0.2) }),
    el('circle', { cx, cy, r: r * 0.82, fill: shade(p.plum, -0.1) }),
    el('circle', { cx, cy, r: r * 0.4, fill: shade(p.ivoryDim, -0.15) }),
    group({}, spokes),
    el('circle', { cx, cy, r: r * 0.1, fill: p.brass }),
  ]);
}

/** Piastrelle di un bacino di piscina in prospettiva. */
function poolBasin(p: Palette, id: string): { defs: string; body: string } {
  const topY = 430;
  const lipY = 520;
  const defs = [
    tilePattern(`${id}-piastrelle`, p.petrol, shade(p.petrol, -0.45), 54, 0.62),
    tilePattern(`${id}-piastrelle-chiare`, shade(p.petrolLit, 0.05), shade(p.petrol, -0.35), 54, 0.62),
    linear(`${id}-fondo`, [0, 0], [0, 1], [
      { offset: 0, color: shade(p.petrol, -0.25) },
      { offset: 1, color: shade(p.ink, 0.08) },
    ]),
  ].join('');

  const inner: Point[] = [
    [520, lipY + 70],
    [SCENE_W - 520, lipY + 70],
    [SCENE_W - 120, SCENE_H - 90],
    [120, SCENE_H - 90],
  ];
  const body = group({}, [
    el('rect', { x: 0, y: topY, width: SCENE_W, height: SCENE_H - topY, fill: `url(#${id}-fondo)` }),
    // bordo (coping) chiaro
    el('path', {
      d: polyPath(
        [
          [300, lipY],
          [SCENE_W - 300, lipY],
          [SCENE_W - 520, lipY + 70],
          [520, lipY + 70],
        ],
        true,
      ),
      fill: shade(p.marble, -0.2),
    }),
    // pareti interne
    el('path', {
      d: polyPath(
        [
          [520, lipY + 70],
          [120, SCENE_H - 90],
          [120, SCENE_H],
          [520, SCENE_H],
        ],
        true,
      ),
      fill: `url(#${id}-piastrelle)`,
    }),
    el('path', {
      d: polyPath(
        [
          [SCENE_W - 520, lipY + 70],
          [SCENE_W - 120, SCENE_H - 90],
          [SCENE_W - 120, SCENE_H],
          [SCENE_W - 520, SCENE_H],
        ],
        true,
      ),
      fill: `url(#${id}-piastrelle)`,
    }),
    el('path', { d: polyPath(inner, true), fill: `url(#${id}-piastrelle-chiare)`, opacity: '0.9' }),
    el('path', { d: polyPath(inner, true), fill: alpha(p.ink, 0.28) }),
    // linea di galleggiamento asciutta
    el('path', {
      d: polyPath(
        [
          [560, lipY + 130],
          [SCENE_W - 560, lipY + 130],
        ],
        false,
      ),
      stroke: alpha(p.ivoryDim, 0.4),
      'stroke-width': 4,
      fill: 'none',
    }),
  ]);
  return { defs, body };
}

/* ------------------------------------------------------------------ */
/* Definizioni delle scene                                             */
/* ------------------------------------------------------------------ */

function scenes(): readonly SceneDef[] {
  return [
    /* ---------------------------------------------------------- FACCIATA */
    {
      chiave: 'facciata',
      titolo: 'La facciata',
      descrizione:
        'Insegna sotto la pioggia obliqua, palme piegate dal vento, la porta girevole che gira per nessuno.',
      atmosfera: { pioggia: true, nebbia: 0.18, grana: 0.07, dominante: (p) => p.night },
      luci: [
        light('insegna', 50, 26, 26, '#E0C365', 0.75, 5400),
        light('pensilina', 50, 66, 18, '#C9A227', 0.5),
        light('faro-lontano', 88, 47, 10, '#5C7FA3', 0.35, 4000),
      ],
      hotspot: [
        hs('porta', 'La porta girevole', 50, 74, 9),
        hs('finestra', 'Le finestre illuminate', 22, 34, 7),
        hs('valigia', 'Un baule sotto la pensilina', 66, 82, 6),
        hs('telefono', 'La cabina telefonica', 84, 76, 6),
        hs('consegna', 'Il punto di consegna', 12, 84, 6),
        hs('oggetto', "L'oggetto fuori posto", 36, 88, 5),
      ],
      layers: [
        (p, id) => {
          const sky = skyNight(p, id, 0.58);
          const water = sea(p, id, 700);
          return {
            defs: sky.defs + water.defs,
            body: sky.body + water.body,
          };
        },
        (p, id) => {
          const rng = random(`${id}-finestre`);
          const windows: string[] = [];
          for (let r = 0; r < 5; r += 1) {
            for (let c = 0; c < 22; c += 1) {
              const x = 210 + c * 68;
              const y = 250 + r * 92;
              const on = rng.chance(0.42);
              windows.push(
                el('rect', {
                  x,
                  y,
                  width: 40,
                  height: 62,
                  fill: on ? alpha(p.brassSoft, 0.5 + rng.next() * 0.3) : alpha(p.ink, 0.6),
                }),
                el('rect', { x, y, width: 40, height: 62, fill: 'none', stroke: alpha(p.ink, 0.5), 'stroke-width': 2 }),
              );
            }
          }
          return {
            defs: haloDefs(`${id}-faro`, p.rain, 0.55),
            body: group({}, [
              // massa dell'albergo
              el('path', {
                d: polyPath(
                  [
                    [150, 700],
                    [150, 220],
                    [420, 160],
                    [SCENE_W - 420, 160],
                    [SCENE_W - 150, 220],
                    [SCENE_W - 150, 700],
                  ],
                  true,
                ),
                fill: shade(p.ink, 0.1),
              }),
              el('rect', { x: 150, y: 214, width: SCENE_W - 300, height: 14, fill: alpha(p.brass, 0.45) }),
              group({}, windows),
              halo(`${id}-faro`, 1690, 505, 130),
              palm(p, `${id}-palma-a`, { x: 120, y: 760, scale: 1.1, bend: 0.5 }),
              palm(p, `${id}-palma-b`, { x: SCENE_W - 110, y: 780, scale: 1.2, bend: -0.55 }),
            ]),
          };
        },
        (p, id) => {
          const rng = random(`${id}-asfalto`);
          const reflections: string[] = [];
          for (let i = 0; i < 40; i += 1) {
            reflections.push(
              el('rect', {
                x: rng.next() * SCENE_W,
                y: 880 + rng.next() * 190,
                width: 40 + rng.next() * 190,
                height: 2 + rng.next() * 4,
                fill: alpha(p.brassSoft, 0.06 + rng.next() * 0.14),
              }),
            );
          }
          return {
            defs: [
              haloDefs(`${id}-insegna`, p.brassSoft, 0.7),
              linear(`${id}-asfalto`, [0, 0], [0, 1], [
                { offset: 0, color: shade(p.ink, 0.12) },
                { offset: 1, color: p.ink },
              ]),
            ].join(''),
            body: group({}, [
              el('rect', { x: 0, y: 860, width: SCENE_W, height: SCENE_H - 860, fill: `url(#${id}-asfalto)` }),
              group({}, reflections),
              // pensilina
              el('path', {
                d: polyPath(
                  [
                    [640, 620],
                    [SCENE_W - 640, 620],
                    [SCENE_W - 560, 700],
                    [560, 700],
                  ],
                  true,
                ),
                fill: shade(p.petrol, -0.15),
              }),
              el('rect', { x: 560, y: 698, width: SCENE_W - 1120, height: 10, fill: p.brass }),
              el('rect', { x: 636, y: 700, width: 14, height: 260, fill: shade(p.brass, -0.25) }),
              el('rect', { x: SCENE_W - 650, y: 700, width: 14, height: 260, fill: shade(p.brass, -0.25) }),
              // insegna (cornice + alone, senza testo)
              halo(`${id}-insegna`, SCENE_W / 2, 300, 330),
              el('path', {
                d: cutCornerPath(SCENE_W / 2 - 300, 232, 600, 132, 26),
                fill: alpha(p.ink, 0.7),
                stroke: p.brass,
                'stroke-width': 5,
              }),
              el('path', {
                d: cutCornerPath(SCENE_W / 2 - 276, 250, 552, 96, 18),
                fill: 'none',
                stroke: alpha(p.brassSoft, 0.75),
                'stroke-width': 2,
              }),
              // porta girevole
              group({}, [
                el('rect', { x: SCENE_W / 2 - 130, y: 700, width: 260, height: 260, fill: alpha(p.rain, 0.16) }),
                el('rect', {
                  x: SCENE_W / 2 - 130,
                  y: 700,
                  width: 260,
                  height: 260,
                  fill: 'none',
                  stroke: p.brass,
                  'stroke-width': 6,
                }),
                el('line', {
                  x1: SCENE_W / 2,
                  y1: 700,
                  x2: SCENE_W / 2,
                  y2: 960,
                  stroke: alpha(p.brass, 0.8),
                  'stroke-width': 4,
                }),
                el('path', {
                  d: `M ${f(SCENE_W / 2 - 130)} 700 L ${f(SCENE_W / 2 + 20)} 960`,
                  stroke: alpha(p.brassSoft, 0.5),
                  'stroke-width': 3,
                }),
                fanlight(p, SCENE_W / 2, 700, 132),
              ]),
              // gradini
              el('rect', { x: SCENE_W / 2 - 240, y: 960, width: 480, height: 20, fill: shade(p.marble, -0.3) }),
              el('rect', { x: SCENE_W / 2 - 270, y: 980, width: 540, height: 22, fill: shade(p.marble, -0.4) }),
              // baule e cabina
              el('path', {
                d: cutCornerPath(1230, 880, 130, 82, 10),
                fill: shade(p.plum, -0.1),
                stroke: alpha(p.brass, 0.6),
                'stroke-width': 2,
              }),
              el('rect', { x: 1560, y: 740, width: 110, height: 230, fill: shade(p.lacquerDeep, -0.15) }),
              el('rect', { x: 1574, y: 760, width: 82, height: 120, fill: alpha(p.rain, 0.3) }),
            ]),
          };
        },
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 7, 0.9, 4),
            body: group({}, [
              rain(p, `${id}-pioggia`, { count: 320, angle: 18, opacity: 0.34, length: 150 }),
              palm(p, `${id}-fronda`, { x: -40, y: 1180, scale: 2.1, bend: 0.6 }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* -------------------------------------------------------------- HALL */
    {
      chiave: 'hall',
      titolo: 'La hall',
      descrizione: 'Marmo a scacchi, bancone di ottone, il quadro degli orologi delle capitali.',
      atmosfera: { pioggia: false, nebbia: 0.1, grana: 0.06, dominante: (p) => p.marble },
      luci: [
        light('lampadario-hall', 50, 12, 22, '#E0C365', 0.6),
        light('bancone', 32, 56, 14, '#C9A227', 0.55),
        light('ingresso', 84, 44, 12, '#5C7FA3', 0.4),
      ],
      hotspot: [
        hs('bancone', 'Il bancone della portineria', 31, 62, 10),
        hs('registro', 'Il registro degli arrivi', 25, 56, 5),
        hs('orologio', 'Gli orologi delle capitali', 50, 22, 9),
        hs('telefono', 'Il centralino', 40, 57, 5),
        hs('porta', "L'ingresso", 84, 52, 7),
        hs('valigia', 'I bagagli in attesa', 70, 74, 6),
        hs('consegna', 'Il punto di consegna', 88, 82, 6),
        hs('oggetto', "L'oggetto fuori posto", 58, 80, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-parete`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.petrol, -0.35) },
            { offset: 0.6, color: p.petrol },
            { offset: 1, color: shade(p.petrol, -0.2) },
          ]),
          body: group({}, [
            full(`url(#${id}-parete)`),
            wallPanels(p, { y: 120, height: 560, color: shade(p.petrol, -0.06), count: 11 }),
            capitalClocks(p, 240, 5),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-luce`, p.brassSoft, 0.42),
          body: group({}, [
            halo(`${id}-luce`, SCENE_W / 2, 120, 420),
            column(p, 300, 200, 74, 500),
            column(p, SCENE_W - 300, 200, 74, 500),
            pigeonholes(p, 380, 380, 620, 260, 12, 5),
            door(p, { x: 1520, y: 380, w: 210, h: 320, open: 0.18 }),
            el('rect', { x: 380, y: 356, width: 620, height: 16, fill: p.brass }),
          ]),
        }),
        (p, id) => {
          const floor = checkerFloor(p, `${id}-pav`, { horizonY: 700, rows: 15, cols: 18 });
          return {
            defs: floor.defs,
            body: group({}, [
              floor.body,
              // bancone
              el('path', {
                d: polyPath(
                  [
                    [340, 700],
                    [1060, 700],
                    [1120, 900],
                    [280, 900],
                  ],
                  true,
                ),
                fill: shade(p.plum, -0.12),
              }),
              el('path', {
                d: polyPath(
                  [
                    [330, 690],
                    [1070, 690],
                    [1080, 716],
                    [320, 716],
                  ],
                  true,
                ),
                fill: p.brass,
              }),
              el('rect', { x: 360, y: 740, width: 700, height: 6, fill: alpha(p.brassSoft, 0.6) }),
              // registro aperto
              group({ transform: 'translate(430 676)' }, [
                el('path', { d: polyPath([[-80, 0], [80, 0], [96, 26], [-96, 26]], true), fill: p.ivory }),
                el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: alpha(p.ink, 0.35), 'stroke-width': 2 }),
                el('rect', { x: -70, y: 6, width: 56, height: 2, fill: alpha(p.ink, 0.25) }),
                el('rect', { x: 14, y: 6, width: 56, height: 2, fill: alpha(p.ink, 0.25) }),
                el('rect', { x: -70, y: 14, width: 40, height: 2, fill: alpha(p.ink, 0.25) }),
              ]),
              // campanello e telefono
              el('circle', { cx: 640, cy: 686, r: 16, fill: p.brassSoft }),
              el('rect', { x: 626, y: 690, width: 28, height: 8, fill: shade(p.brass, -0.3) }),
              group({ transform: 'translate(770 660)' }, [
                el('rect', { x: 0, y: 22, width: 70, height: 26, rx: 5, fill: shade(p.ink, 0.16) }),
                el('path', { d: 'M 4 20 q 31 -26 62 0 l -10 8 q -21 -16 -42 0 Z', fill: shade(p.ink, 0.2) }),
                el('circle', { cx: 35, cy: 36, r: 8, fill: alpha(p.brass, 0.7) }),
              ]),
              // bagagli
              group({ transform: 'translate(1300 800)' }, [
                el('path', { d: cutCornerPath(0, 0, 190, 116, 14), fill: shade(p.plum, -0.05) }),
                el('rect', { x: 0, y: 44, width: 190, height: 12, fill: alpha(p.brass, 0.7) }),
                el('path', { d: cutCornerPath(40, -70, 130, 74, 10), fill: shade(p.lacquerDeep, 0.05) }),
                el('rect', { x: 84, y: -84, width: 44, height: 16, rx: 6, fill: p.brass }),
              ]),
              // oggetto fuori posto: un guanto sul marmo
              el('path', {
                d: 'M 1080 880 q 28 -18 52 -4 q 16 10 6 24 q -10 14 -34 12 q -26 -2 -30 -14 q -4 -12 6 -18 Z',
                fill: alpha(p.ivory, 0.85),
              }),
            ]),
          };
        },
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 3, 0.9, 4),
            body: group({}, [
              archFrame(p, { inset: 150 }),
              // cordone e paletti
              group({}, [
                el('rect', { x: 250, y: 830, width: 12, height: 190, fill: p.brass }),
                el('circle', { cx: 256, cy: 826, r: 12, fill: p.brassSoft }),
                el('rect', { x: SCENE_W - 262, y: 830, width: 12, height: 190, fill: p.brass }),
                el('circle', { cx: SCENE_W - 256, cy: 826, r: 12, fill: p.brassSoft }),
                el('path', {
                  d: `M 256 846 Q ${f(SCENE_W / 2)} 940 ${f(SCENE_W - 256)} 846`,
                  stroke: p.lacquerDeep,
                  'stroke-width': 10,
                  fill: 'none',
                }),
              ]),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* -------------------------------------------------------- SALA BALLO */
    {
      chiave: 'sala-ballo',
      titolo: 'La sala da ballo',
      descrizione: 'Il lampadario di millequattrocento gocce, le coppie sfocate, il palco in fondo.',
      atmosfera: { pioggia: false, nebbia: 0.22, grana: 0.06, dominante: (p) => p.plum },
      luci: [
        light('lampadario', 50, 22, 30, '#E0C365', 0.8),
        light('ribalta', 50, 58, 16, '#B5261E', 0.35),
        light('applique', 12, 40, 9, '#C9A227', 0.45),
      ],
      hotspot: [
        hs('lampadario', 'Il lampadario', 50, 24, 12),
        hs('tavolo', 'Il tavolo dei rinfreschi', 22, 74, 8),
        hs('bicchieri', 'I bicchieri', 26, 70, 5),
        hs('spartiti', "Il leggio dell'orchestra", 72, 62, 6),
        hs('porta', 'La porta della sala', 92, 56, 6),
        hs('consegna', 'Il punto di consegna', 84, 84, 6),
        hs('oggetto', "L'oggetto fuori posto", 56, 86, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-fondo`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.plum, -0.4) },
            { offset: 0.55, color: p.plum },
            { offset: 1, color: shade(p.ink, 0.1) },
          ]),
          body: group({}, [
            full(`url(#${id}-fondo)`),
            wallPanels(p, { y: 180, height: 460, color: shade(p.plum, -0.1), count: 13, trim: p.brass }),
            crowd(p, `${id}-coppie`, { y: 690, count: 11, scale: 0.9 }),
          ]),
        }),
        (p, id) => {
          const ch = chandelier(p, `${id}-lamp`, { cx: SCENE_W / 2, cy: 250, r: 250 });
          return {
            defs: ch.defs + haloDefs(`${id}-applique`, p.brassSoft, 0.5),
            body: group({}, [
              // palco in fondo
              el('rect', { x: 620, y: 470, width: 680, height: 220, fill: shade(p.ink, 0.08) }),
              el('rect', { x: 620, y: 462, width: 680, height: 14, fill: alpha(p.brass, 0.6) }),
              el('path', {
                d: polyPath([[620, 470], [1300, 470], [1300, 500], [620, 500]], true),
                fill: alpha(p.lacquerDeep, 0.5),
              }),
              ch.body,
              halo(`${id}-applique`, 210, 430, 120),
              halo(`${id}-applique`, SCENE_W - 210, 430, 120),
              el('path', { d: cutCornerPath(180, 400, 60, 92, 10), fill: alpha(p.brass, 0.8) }),
              el('path', { d: cutCornerPath(SCENE_W - 240, 400, 60, 92, 10), fill: alpha(p.brass, 0.8) }),
            ]),
          };
        },
        (p, id) => {
          const rng = random(`${id}-parquet`);
          const planks: string[] = [];
          for (let r = 0; r < 10; r += 1) {
            const y = 700 + r * 40;
            for (let c = 0; c < 16; c += 1) {
              planks.push(
                el('rect', {
                  x: c * 120 + (r % 2 ? 60 : 0),
                  y,
                  width: 118,
                  height: 38,
                  fill: alpha(shade(p.plum, r % 2 ? 0.1 : 0.02), 0.6 + rng.next() * 0.2),
                }),
              );
            }
          }
          return {
            defs: linear(`${id}-lucido`, [0, 0], [0, 1], [
              { offset: 0, color: p.brassSoft, opacity: 0.2 },
              { offset: 1, color: p.brassSoft, opacity: 0 },
            ]),
            body: group({}, [
              el('rect', { x: 0, y: 690, width: SCENE_W, height: SCENE_H - 690, fill: shade(p.plum, -0.3) }),
              group({}, planks),
              el('rect', { x: 0, y: 690, width: SCENE_W, height: 300, fill: `url(#${id}-lucido)` }),
              // tavolo dei rinfreschi
              group({ transform: 'translate(300 760)' }, [
                el('path', { d: polyPath([[-190, 0], [190, 0], [220, 40], [-220, 40]], true), fill: p.ivory }),
                el('rect', { x: -220, y: 40, width: 440, height: 150, fill: alpha(p.ivory, 0.75) }),
                el('path', { d: polyPath([[-220, 190], [220, 190], [200, 210], [-200, 210]], true), fill: alpha(p.ink, 0.4) }),
              ]),
              glasses(p, `${id}-calici`, { x: 200, y: 762, w: 190, count: 6 }),
              // leggio dell'orchestra
              group({ transform: 'translate(1380 700)' }, [
                el('rect', { x: -4, y: 0, width: 8, height: 170, fill: shade(p.ink, 0.2) }),
                el('path', { d: polyPath([[-70, -70], [70, -70], [70, 6], [-70, 6]], true), fill: shade(p.ink, 0.24), transform: 'rotate(-14)' }),
                el('path', { d: polyPath([[-56, -84], [56, -84], [56, -8], [-56, -8]], true), fill: p.ivory, transform: 'rotate(-14)' }),
                el('path', { d: polyPath([[-46, 200], [46, 200], [70, 214], [-70, 214]], true), fill: shade(p.ink, 0.2) }),
              ]),
              door(p, { x: 1730, y: 470, w: 150, h: 300, open: 0.12 }),
              // maschera caduta sul parquet
              group({ transform: 'translate(1070 930) rotate(-12)' }, [
                el('path', {
                  d: 'M -70 -6 q 20 -34 70 -34 q 50 0 70 34 q -14 40 -70 40 q -56 0 -70 -40 Z',
                  fill: alpha(p.lacquerDeep, 0.9),
                }),
                el('ellipse', { cx: -32, cy: -4, rx: 18, ry: 11, fill: shade(p.ink, 0.05) }),
                el('ellipse', { cx: 32, cy: -4, rx: 18, ry: 11, fill: shade(p.ink, 0.05) }),
                el('path', { d: 'M -70 -6 q 20 -34 70 -34 q 50 0 70 34', fill: 'none', stroke: p.brass, 'stroke-width': 3 }),
              ]),
            ]),
          };
        },
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          const d = sideDrapes(p, `${id}-tende`, 240, p.petrol);
          return {
            defs: v.defs + d.defs + grainFilter(`${id}-grana`, 9, 0.85, 4),
            body: group({}, [
              d.body,
              lightCone(alpha(p.brassSoft, 0.5), { x: SCENE_W / 2, y: 240, spread: 620, length: 840, opacity: 0.1 }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* ------------------------------------------------------------- SUITE */
    {
      chiave: 'suite',
      titolo: 'La suite 404',
      descrizione: 'Porta socchiusa, un solo abat-jour acceso, la finestra battuta dalla pioggia.',
      atmosfera: { pioggia: true, nebbia: 0.12, grana: 0.07, dominante: (p) => p.plum },
      luci: [
        light('abatjour', 72, 52, 14, '#E0C365', 0.7),
        light('spiraglio', 12, 46, 10, '#C9A227', 0.5),
        light('finestra', 36, 34, 16, '#5C7FA3', 0.3),
      ],
      hotspot: [
        hs('porta', 'La porta socchiusa', 11, 50, 8),
        hs('finestra', 'La finestra', 36, 34, 9),
        hs('armadio', "L'armadio", 88, 46, 8),
        hs('cassetto', 'Il cassetto della scrivania', 60, 72, 6),
        hs('telefono', 'Il telefono sul comodino', 72, 58, 5),
        hs('orologio', "L'orologio da viaggio", 66, 56, 4),
        hs('consegna', 'Il punto di consegna', 24, 84, 6),
        hs('oggetto', "L'oggetto fuori posto", 46, 86, 5),
      ],
      layers: [
        (p, id) => {
          const win = rainWindow(p, `${id}-fin`, { x: 560, y: 200, w: 420, h: 460 });
          return {
            defs:
              win.defs +
              linear(`${id}-carta`, [0, 0], [0, 1], [
                { offset: 0, color: shade(p.plum, -0.15) },
                { offset: 1, color: shade(p.plum, -0.42) },
              ]),
            body: group({}, [
              full(`url(#${id}-carta)`),
              // carta da parati a righe sottili
              group(
                {},
                Array.from({ length: 48 }, (_v, i) =>
                  el('rect', { x: i * 40 + 12, y: 0, width: 3, height: SCENE_H, fill: alpha(p.ivory, 0.05) }),
                ),
              ),
              win.body,
            ]),
          };
        },
        (p, id) => ({
          defs: haloDefs(`${id}-abat`, p.brassSoft, 0.72),
          body: group({}, [
            // letto
            group({ transform: 'translate(980 520)' }, [
              el('rect', { x: 0, y: -160, width: 30, height: 260, fill: shade(p.plum, 0.1) }),
              el('rect', { x: 0, y: 60, width: 640, height: 40, fill: shade(p.ivoryDim, -0.25) }),
              el('path', { d: polyPath([[0, 60], [640, 60], [660, 40], [20, 40]], true), fill: p.ivory }),
              el('rect', { x: 30, y: 20, width: 180, height: 34, rx: 12, fill: alpha(p.ivory, 0.9) }),
            ]),
            // armadio
            group({ transform: 'translate(1620 300)' }, [
              el('rect', { x: 0, y: 0, width: 250, height: 480, fill: shade(p.plum, 0.06) }),
              el('rect', { x: 10, y: 14, width: 110, height: 452, fill: alpha(p.ink, 0.35) }),
              el('rect', { x: 130, y: 14, width: 110, height: 452, fill: alpha(p.ink, 0.28) }),
              el('circle', { cx: 118, cy: 240, r: 6, fill: p.brass }),
              el('circle', { cx: 134, cy: 240, r: 6, fill: p.brass }),
            ]),
            // abat-jour
            halo(`${id}-abat`, 1390, 560, 250),
            group({ transform: 'translate(1390 560)' }, [
              el('path', { d: polyPath([[-58, -60], [58, -60], [76, 6], [-76, 6]], true), fill: alpha(p.brassSoft, 0.9) }),
              el('rect', { x: -5, y: 6, width: 10, height: 70, fill: shade(p.brass, -0.3) }),
              el('ellipse', { cx: 0, cy: 78, rx: 34, ry: 9, fill: shade(p.brass, -0.2) }),
            ]),
            lightCone(p.brassSoft, { x: 1390, y: 566, spread: 260, length: 420, opacity: 0.14 }),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-tappeto`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.lacquerDeep, -0.3) },
            { offset: 1, color: shade(p.ink, 0.1) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 760, width: SCENE_W, height: SCENE_H - 760, fill: shade(p.plum, -0.35) }),
            el('path', {
              d: polyPath([[280, 800], [1640, 800], [1780, SCENE_H], [140, SCENE_H]], true),
              fill: `url(#${id}-tappeto)`,
            }),
            door(p, { x: 90, y: 300, w: 240, h: 500, open: 0.22 }),
            // scrivania con cassetto
            group({ transform: 'translate(1010 700)' }, [
              el('rect', { x: 0, y: 0, width: 420, height: 26, fill: shade(p.plum, 0.14) }),
              el('rect', { x: 12, y: 26, width: 396, height: 70, fill: shade(p.plum, 0.04) }),
              el('rect', { x: 40, y: 42, width: 150, height: 38, fill: alpha(p.ink, 0.5) }),
              el('circle', { cx: 115, cy: 61, r: 6, fill: p.brass }),
              el('rect', { x: 30, y: 96, width: 16, height: 160, fill: shade(p.plum, -0.1) }),
              el('rect', { x: 374, y: 96, width: 16, height: 160, fill: shade(p.plum, -0.1) }),
            ]),
            // comodino con telefono e orologio da viaggio
            group({ transform: 'translate(1280 660)' }, [
              el('rect', { x: 0, y: 0, width: 150, height: 22, fill: shade(p.plum, 0.16) }),
              el('rect', { x: 10, y: 22, width: 130, height: 130, fill: shade(p.plum, 0.02) }),
              el('rect', { x: 24, y: 40, width: 102, height: 34, fill: alpha(p.ink, 0.45) }),
              el('rect', { x: 20, y: -26, width: 74, height: 26, rx: 5, fill: shade(p.ink, 0.2) }),
              el('path', { d: 'M 24 -28 q 33 -26 66 0 l -10 8 q -23 -16 -46 0 Z', fill: shade(p.ink, 0.24) }),
              el('path', { d: cutCornerPath(104, -34, 42, 34, 6), fill: p.brass }),
              el('circle', { cx: 125, cy: -17, r: 11, fill: p.ivory }),
              el('line', { x1: 125, y1: -17, x2: 125, y2: -25, stroke: p.ink, 'stroke-width': 2 }),
            ]),
            // oggetto fuori posto: una scarpa asciutta
            group({ transform: 'translate(880 960) rotate(-8)' }, [
              el('path', { d: 'M 0 0 q 10 -34 46 -34 q 24 0 40 20 q 26 8 40 22 q 6 12 -10 14 L 6 24 q -8 -8 -6 -24 Z', fill: shade(p.ink, 0.24) }),
              el('rect', { x: -2, y: 20, width: 130, height: 8, rx: 3, fill: shade(p.ink, 0.14) }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 13, 0.9, 4),
            body: group({}, [
              // stipite in primo piano a sinistra
              el('rect', { x: 0, y: 0, width: 90, height: SCENE_H, fill: shade(p.ink, 0.04) }),
              el('rect', { x: 86, y: 0, width: 8, height: SCENE_H, fill: alpha(p.brass, 0.35) }),
              rain(p, `${id}-pioggia`, { count: 90, angle: 20, opacity: 0.12, length: 90 }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* ---------------------------------------------------------- TERRAZZA */
    {
      chiave: 'terrazza',
      titolo: 'La terrazza',
      descrizione: 'Ringhiera bagnata, mare nero, il faro di Capo Mele che pulsa ogni quattro secondi.',
      atmosfera: { pioggia: true, nebbia: 0.24, grana: 0.07, dominante: (p) => p.rain },
      luci: [
        light('faro', 82, 38, 12, '#5C7FA3', 0.7, 4000),
        light('lampione', 18, 44, 10, '#C9A227', 0.5),
      ],
      hotspot: [
        hs('ringhiera', 'La ringhiera', 50, 64, 12),
        hs('tavolo', 'Il tavolino di vimini', 26, 76, 8),
        hs('bicchieri', 'Due bicchieri', 30, 71, 5),
        hs('porta', 'La portafinestra', 88, 52, 7),
        hs('orologio', "L'orologio da polso", 62, 82, 4),
        hs('consegna', 'Il punto di consegna', 12, 84, 6),
        hs('oggetto', "L'oggetto fuori posto", 68, 88, 5),
      ],
      layers: [
        (p, id) => {
          const sky = skyNight(p, id, 0.5);
          const water = sea(p, id, 560);
          return { defs: sky.defs + water.defs, body: sky.body + water.body };
        },
        (p, id) => ({
          defs: haloDefs(`${id}-faro`, p.rain, 0.72),
          body: group({}, [
            // costa lontana
            el('path', {
              d: polyPath([[1200, 560], [1420, 500], [1560, 520], [1720, 470], [SCENE_W, 505], [SCENE_W, 560]], true),
              fill: alpha(p.ink, 0.85),
            }),
            // torre del faro
            el('path', { d: polyPath([[1560, 500], [1592, 500], [1586, 380], [1566, 380]], true), fill: shade(p.ivoryDim, -0.5) }),
            halo(`${id}-faro`, 1576, 372, 150),
            el('circle', { cx: 1576, cy: 372, r: 12, fill: alpha(p.ivory, 0.9) }),
            steam(p, `${id}-nebbia`, { y: 600, count: 8, color: p.rain }),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-pavimento`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.marble, -0.5) },
            { offset: 1, color: shade(p.ink, 0.14) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 720, width: SCENE_W, height: SCENE_H - 720, fill: `url(#${id}-pavimento)` }),
            group(
              {},
              Array.from({ length: 9 }, (_v, i) =>
                el('line', {
                  x1: 0,
                  y1: 740 + i * 40,
                  x2: SCENE_W,
                  y2: 740 + i * 40,
                  stroke: alpha(p.ink, 0.3),
                  'stroke-width': 2,
                }),
              ),
            ),
            railing(p, { y: 640, height: 130, posts: 26 }),
            // tavolino e sedie di vimini
            group({ transform: 'translate(500 800)' }, [
              el('ellipse', { cx: 0, cy: 0, rx: 130, ry: 34, fill: shade(p.ivoryDim, -0.25) }),
              el('rect', { x: -8, y: 0, width: 16, height: 140, fill: shade(p.ink, 0.2) }),
              el('ellipse', { cx: 0, cy: 140, rx: 60, ry: 16, fill: shade(p.ink, 0.16) }),
              el('path', { d: polyPath([[-250, -10], [-160, -10], [-150, 130], [-260, 130]], true), fill: alpha(shade(p.ivoryDim, -0.35), 0.9) }),
              el('path', { d: polyPath([[-256, -140], [-152, -140], [-160, -10], [-250, -10]], true), fill: alpha(shade(p.ivoryDim, -0.28), 0.9) }),
            ]),
            glasses(p, `${id}-calici`, { x: 460, y: -6 + 800, w: 90, count: 2 }),
            door(p, { x: 1620, y: 420, w: 240, h: 400, open: 0.1 }),
            // orologio da polso sul pavimento
            group({ transform: 'translate(1190 890)' }, [
              el('circle', { cx: 0, cy: 0, r: 22, fill: p.brass }),
              el('circle', { cx: 0, cy: 0, r: 16, fill: p.ivory }),
              el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: p.ink, 'stroke-width': 2.5 }),
              el('line', { x1: 0, y1: 0, x2: 8, y2: 3, stroke: p.ink, 'stroke-width': 2 }),
              el('path', { d: 'M -18 -14 q -34 -8 -46 6 l 10 12 q 20 -10 40 -4 Z', fill: shade(p.plum, 0.05) }),
              el('path', { d: 'M 18 14 q 34 8 46 -6 l -10 -12 q -20 10 -40 4 Z', fill: shade(p.plum, 0.05) }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 17, 0.9, 4),
            body: group({}, [
              rain(p, `${id}-pioggia`, { count: 280, angle: 22, opacity: 0.3, length: 170 }),
              // vaso in primo piano
              group({ transform: 'translate(120 1080)' }, [
                el('path', { d: polyPath([[-110, 0], [110, 0], [80, -220], [-80, -220]], true), fill: shade(p.petrol, -0.35) }),
                el('rect', { x: -92, y: -238, width: 184, height: 24, fill: shade(p.petrol, -0.2) }),
              ]),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* ----------------------------------------------------------- PISCINA */
    {
      chiave: 'piscina',
      titolo: 'La piscina vuota',
      descrizione: 'Piastrelle verde petrolio, la scaletta, il fondo asciutto e una scarpa.',
      atmosfera: { pioggia: true, nebbia: 0.16, grana: 0.07, dominante: (p) => p.petrol },
      luci: [
        light('lampione', 22, 30, 12, '#C9A227', 0.5),
        light('riflesso-vasca', 50, 80, 20, '#1E5E58', 0.3),
      ],
      hotspot: [
        hs('scaletta', 'La scaletta', 76, 62, 8),
        hs('oggetto', 'Una scarpa sul fondo', 44, 88, 6),
        hs('orologio', 'Un orologio fra le piastrelle', 58, 84, 5),
        hs('ventilazione', 'La griglia di scarico', 30, 92, 5),
        hs('finestra', 'Le finestre della sala', 12, 34, 6),
        hs('consegna', 'Il punto di consegna', 88, 82, 6),
      ],
      layers: [
        (p, id) => {
          const sky = skyNight(p, id, 0.42);
          return {
            defs: sky.defs,
            body: group({}, [
              sky.body,
              el('rect', { x: 0, y: 300, width: SCENE_W, height: 140, fill: alpha(p.ink, 0.6) }),
              group(
                {},
                Array.from({ length: 10 }, (_v, i) =>
                  el('rect', {
                    x: 120 + i * 180,
                    y: 320,
                    width: 70,
                    height: 96,
                    fill: alpha(i % 3 === 0 ? p.brassSoft : p.ink, i % 3 === 0 ? 0.45 : 0.7),
                  }),
                ),
              ),
            ]),
          };
        },
        (p, id) => ({
          defs: haloDefs(`${id}-lampione`, p.brassSoft, 0.5),
          body: group({}, [
            halo(`${id}-lampione`, 420, 320, 200),
            el('rect', { x: 414, y: 330, width: 12, height: 260, fill: shade(p.ink, 0.2) }),
            el('path', { d: polyPath([[386, 330], [454, 330], [446, 296], [394, 296]], true), fill: p.brass }),
            el('rect', { x: 0, y: 400, width: SCENE_W, height: 40, fill: shade(p.petrol, -0.5) }),
            steam(p, `${id}-foschia`, { y: 470, count: 6, color: p.rain }),
          ]),
        }),
        (p, id) => {
          const basin = poolBasin(p, id);
          return {
            defs: basin.defs,
            body: group({}, [
              basin.body,
              // scaletta di ottone
              group({ transform: 'translate(1440 520)' }, [
                el('path', {
                  d: 'M 0 0 q -6 -60 40 -60 q 46 0 40 60 l 0 260',
                  fill: 'none',
                  stroke: p.brass,
                  'stroke-width': 12,
                  'stroke-linecap': 'butt',
                }),
                el('path', { d: 'M 0 0 l 0 260', fill: 'none', stroke: p.brass, 'stroke-width': 12 }),
                ...[0, 1, 2].map((i) =>
                  el('rect', { x: 0, y: 90 + i * 70, width: 80, height: 10, fill: shade(p.brass, -0.2) }),
                ),
              ]),
              // griglia di scarico
              group({ transform: 'translate(560 990)' }, [
                el('rect', { x: 0, y: 0, width: 120, height: 60, rx: 4, fill: shade(p.ink, 0.16) }),
                ...Array.from({ length: 6 }, (_v, i) =>
                  el('rect', { x: 8 + i * 18, y: 8, width: 8, height: 44, fill: alpha(p.ink, 0.85) }),
                ),
              ]),
              // scarpa
              group({ transform: 'translate(840 1000) rotate(6)' }, [
                el('path', { d: 'M 0 0 q 12 -38 52 -38 q 26 0 44 22 q 30 10 44 26 q 6 14 -12 16 L 8 28 q -10 -10 -8 -28 Z', fill: shade(p.ink, 0.28) }),
                el('rect', { x: -2, y: 24, width: 146, height: 9, rx: 4, fill: shade(p.ink, 0.16) }),
              ]),
              // orologio fra le piastrelle
              group({ transform: 'translate(1120 960)' }, [
                el('circle', { cx: 0, cy: 0, r: 20, fill: shade(p.brass, -0.1) }),
                el('circle', { cx: 0, cy: 0, r: 14, fill: shade(p.ivory, -0.1) }),
                el('line', { x1: 0, y1: 0, x2: -8, y2: -6, stroke: p.ink, 'stroke-width': 2.4 }),
                el('line', { x1: 0, y1: 0, x2: 4, y2: 10, stroke: p.ink, 'stroke-width': 2 }),
              ]),
            ]),
          };
        },
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 19, 0.9, 4),
            body: group({}, [
              rain(p, `${id}-pioggia`, { count: 220, angle: 15, opacity: 0.24, length: 140 }),
              el('rect', { x: 0, y: 1010, width: SCENE_W, height: 70, fill: shade(p.marble, -0.45) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* ------------------------------------------------------------ CUCINA */
    {
      chiave: 'cucina',
      titolo: 'La cucina',
      descrizione: 'Acciaio, vapore, ganci vuoti, e un orologio a muro che nessuno guarda.',
      atmosfera: { pioggia: false, nebbia: 0.3, grana: 0.06, dominante: (p) => p.rain },
      luci: [
        light('plafoniera', 34, 16, 16, '#F2E9D8', 0.6),
        light('plafoniera-2', 68, 16, 16, '#F2E9D8', 0.55),
      ],
      hotspot: [
        hs('tavolo', "Il tavolo d'acciaio", 48, 70, 11),
        hs('orologio', "L'orologio a muro", 78, 22, 6),
        hs('bicchieri', 'I bicchieri sul vassoio', 30, 64, 5),
        hs('porta', 'La porta a battente', 90, 52, 7),
        hs('ventilazione', 'La cappa', 16, 30, 7),
        hs('consegna', 'Il passavivande', 8, 66, 6),
        hs('oggetto', "L'oggetto fuori posto", 62, 78, 5),
      ],
      layers: [
        (p, id) => ({
          defs: tilePattern(`${id}-mattonelle`, shade(p.ivoryDim, -0.18), shade(p.rain, -0.5), 60, 0.7),
          body: group({}, [
            full(shade(p.rain, -0.62)),
            el('rect', { x: 0, y: 0, width: SCENE_W, height: 720, fill: `url(#${id}-mattonelle)` }),
            el('rect', { x: 0, y: 0, width: SCENE_W, height: 720, fill: alpha(p.ink, 0.35) }),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-plafo`, p.ivory, 0.45),
          body: group({}, [
            halo(`${id}-plafo`, 660, 180, 300),
            halo(`${id}-plafo`, 1310, 180, 300),
            el('rect', { x: 560, y: 120, width: 200, height: 26, rx: 6, fill: alpha(p.ivory, 0.85) }),
            el('rect', { x: 1210, y: 120, width: 200, height: 26, rx: 6, fill: alpha(p.ivory, 0.85) }),
            // cappa
            el('path', { d: polyPath([[80, 200], [520, 200], [470, 380], [130, 380]], true), fill: shade(p.rain, -0.4) }),
            el('rect', { x: 130, y: 372, width: 340, height: 14, fill: alpha(p.ivory, 0.25) }),
            // mensola con ganci
            el('rect', { x: 700, y: 300, width: 700, height: 12, fill: shade(p.rain, -0.35) }),
            group(
              {},
              Array.from({ length: 9 }, (_v, i) =>
                el('path', {
                  d: `M ${f(740 + i * 78)} 312 l 0 40 q 0 22 20 22 q 18 0 18 -18`,
                  fill: 'none',
                  stroke: alpha(p.ivoryDim, 0.6),
                  'stroke-width': 5,
                }),
              ),
            ),
            // orologio a muro
            group({ transform: 'translate(1500 240)' }, [
              el('circle', { cx: 0, cy: 0, r: 66, fill: shade(p.ivoryDim, -0.1) }),
              el('circle', { cx: 0, cy: 0, r: 56, fill: p.ivory }),
              el('line', { x1: 0, y1: 0, x2: 0, y2: -38, stroke: p.ink, 'stroke-width': 5 }),
              el('line', { x1: 0, y1: 0, x2: 26, y2: 14, stroke: p.ink, 'stroke-width': 3.5 }),
              el('circle', { cx: 0, cy: 0, r: 5, fill: p.lacquer }),
            ]),
            steam(p, `${id}-vapore`, { y: 420, count: 9 }),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-acciaio`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.ivoryDim, -0.18) },
            { offset: 0.5, color: shade(p.rain, -0.25) },
            { offset: 1, color: shade(p.rain, -0.45) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 700, width: SCENE_W, height: SCENE_H - 700, fill: shade(p.ink, 0.1) }),
            group(
              {},
              Array.from({ length: 24 }, (_v, i) =>
                el('rect', { x: i * 80, y: 700, width: 78, height: 380, fill: alpha(p.rain, i % 2 ? 0.05 : 0.02) }),
              ),
            ),
            // tavolo d'acciaio
            group({ transform: 'translate(420 700)' }, [
              el('path', { d: polyPath([[0, 0], [1100, 0], [1160, 46], [-60, 46]], true), fill: `url(#${id}-acciaio)` }),
              el('rect', { x: -60, y: 46, width: 1220, height: 16, fill: shade(p.rain, -0.55) }),
              el('rect', { x: 20, y: 62, width: 20, height: 250, fill: shade(p.rain, -0.4) }),
              el('rect', { x: 1060, y: 62, width: 20, height: 250, fill: shade(p.rain, -0.4) }),
              el('rect', { x: 0, y: 200, width: 1100, height: 14, fill: shade(p.rain, -0.45) }),
            ]),
            // pentole
            group({ transform: 'translate(700 664)' }, [
              el('path', { d: polyPath([[-70, 36], [70, 36], [56, -26], [-56, -26]], true), fill: shade(p.ivoryDim, -0.28) }),
              el('ellipse', { cx: 0, cy: -26, rx: 56, ry: 12, fill: shade(p.ivoryDim, -0.05) }),
              el('rect', { x: 56, y: -12, width: 46, height: 8, rx: 4, fill: shade(p.rain, -0.4) }),
            ]),
            glasses(p, `${id}-bicchieri`, { x: 520, y: 690, w: 120, count: 4 }),
            // passavivande
            group({ transform: 'translate(0 620)' }, [
              el('rect', { x: 0, y: 0, width: 220, height: 190, fill: shade(p.ink, 0.14) }),
              el('rect', { x: 16, y: 16, width: 188, height: 158, fill: alpha(p.brassSoft, 0.22) }),
              el('rect', { x: 0, y: 174, width: 220, height: 16, fill: p.brass }),
            ]),
            door(p, { x: 1690, y: 440, w: 220, h: 400, open: 0.14, color: shade(p.rain, -0.4) }),
            // oggetto: un tovagliolo con qualcosa dentro
            group({ transform: 'translate(1180 690)' }, [
              el('path', { d: polyPath([[-60, 0], [60, 0], [40, -46], [-40, -46]], true), fill: p.ivory }),
              el('path', { d: 'M -40 -46 l 80 46', stroke: alpha(p.ink, 0.2), 'stroke-width': 2, fill: 'none' }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 23, 0.9, 4),
            body: group({}, [
              steam(p, `${id}-vapore-fg`, { y: 760, count: 7 }),
              el('rect', { x: 0, y: 0, width: SCENE_W, height: 60, fill: shade(p.ink, 0.05) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* --------------------------------------------------------- CORRIDOIO */
    {
      chiave: 'corridoio',
      titolo: 'Il corridoio',
      descrizione: 'Prospettiva a un punto, moquette a rombi, porte numerate che non dicono niente.',
      atmosfera: { pioggia: false, nebbia: 0.14, grana: 0.06, dominante: (p) => p.lacquerDeep },
      luci: [
        light('applique-1', 30, 40, 8, '#C9A227', 0.5),
        light('applique-2', 70, 40, 8, '#C9A227', 0.5),
        light('fondo', 50, 46, 10, '#E0C365', 0.35),
      ],
      hotspot: [
        hs('porta', 'La porta 404', 50, 48, 7),
        hs('ventilazione', 'La griglia di aerazione', 82, 24, 5),
        hs('telefono', 'Il telefono di servizio', 16, 52, 6),
        hs('quadro', 'Il quadro appeso storto', 84, 42, 6),
        hs('consegna', 'Il carrello della biancheria', 26, 74, 7),
        hs('oggetto', "L'oggetto fuori posto", 62, 82, 5),
      ],
      layers: [
        (p, id) => ({
          defs: haloDefs(`${id}-fondo`, p.brassSoft, 0.45),
          body: group({}, [
            full(shade(p.plum, -0.45)),
            halo(`${id}-fondo`, SCENE_W / 2, 520, 260),
            door(p, { x: SCENE_W / 2 - 70, y: 400, w: 140, h: 250, color: shade(p.plum, -0.05) }),
            el('path', { d: cutCornerPath(SCENE_W / 2 - 26, 440, 52, 34, 6), fill: p.brass }),
          ]),
        }),
        (p, id) => {
          const vx = SCENE_W / 2;
          const walls: string[] = [];
          const depths = [0.12, 0.26, 0.44, 0.66, 0.94];
          for (let i = 0; i < depths.length - 1; i += 1) {
            const a = depths[i]!;
            const b = depths[i + 1]!;
            const xa = vx - a * vx * 1.9;
            const xb = vx - b * vx * 1.9;
            const ya = 540 - a * 480;
            const yb = 540 - b * 480;
            // porte a sinistra
            walls.push(
              el('path', {
                d: polyPath(
                  [
                    [xa, ya],
                    [xb, yb],
                    [xb, SCENE_H - yb + 200],
                    [xa, SCENE_H - ya + 200],
                  ],
                  true,
                ),
                fill: alpha(shade(p.plum, -0.1 - i * 0.05), 1),
              }),
            );
            const xa2 = vx + a * vx * 1.9;
            const xb2 = vx + b * vx * 1.9;
            walls.push(
              el('path', {
                d: polyPath(
                  [
                    [xa2, ya],
                    [xb2, yb],
                    [xb2, SCENE_H - yb + 200],
                    [xa2, SCENE_H - ya + 200],
                  ],
                  true,
                ),
                fill: alpha(shade(p.plum, -0.16 - i * 0.05), 1),
              }),
            );
          }
          return {
            defs: haloDefs(`${id}-applique`, p.brassSoft, 0.5),
            body: group({}, [
              group({}, walls),
              // soffitto
              el('path', {
                d: polyPath([[0, 0], [SCENE_W, 0], [SCENE_W, 60], [vx + 60, 400], [vx - 60, 400], [0, 60]], true),
                fill: shade(p.ink, 0.08),
              }),
              halo(`${id}-applique`, 580, 430, 130),
              halo(`${id}-applique`, SCENE_W - 580, 430, 130),
              el('path', { d: cutCornerPath(556, 400, 48, 74, 8), fill: alpha(p.brass, 0.85) }),
              el('path', { d: cutCornerPath(SCENE_W - 604, 400, 48, 74, 8), fill: alpha(p.brass, 0.85) }),
            ]),
          };
        },
        (p, _id) => ({
          defs: '',
          body: group({}, [
            diamondCarpet(p, { horizonY: 640, vanishX: SCENE_W / 2, rows: 13, cols: 5 }),
            // porte laterali con targhette d'ottone
            ...[
              { x: 120, w: 250, h: 470, y: 300 },
              { x: 430, w: 190, h: 400, y: 340 },
              { x: SCENE_W - 370, w: 250, h: 470, y: 300 },
              { x: SCENE_W - 620, w: 190, h: 400, y: 340 },
            ].map((dspec) =>
              group({}, [
                door(p, { x: dspec.x, y: dspec.y, w: dspec.w, h: dspec.h, color: shade(p.plum, 0.04) }),
                el('path', {
                  d: cutCornerPath(dspec.x + dspec.w * 0.3, dspec.y + dspec.h * 0.2, dspec.w * 0.4, 34, 6),
                  fill: p.brass,
                }),
              ]),
            ),
            // griglia di aerazione
            group({ transform: 'translate(1520 220)' }, [
              el('rect', { x: 0, y: 0, width: 130, height: 78, fill: shade(p.ink, 0.2) }),
              ...Array.from({ length: 5 }, (_v, i) =>
                el('rect', { x: 8, y: 8 + i * 14, width: 114, height: 7, fill: alpha(p.ink, 0.8) }),
              ),
              el('rect', { x: 0, y: 0, width: 130, height: 78, fill: 'none', stroke: alpha(p.brass, 0.5), 'stroke-width': 2 }),
            ]),
            // quadro storto
            group({ transform: 'translate(1600 420) rotate(-6)' }, [
              el('rect', { x: -70, y: -90, width: 140, height: 180, fill: p.brass }),
              el('rect', { x: -60, y: -80, width: 120, height: 160, fill: shade(p.petrol, -0.2) }),
              el('path', { d: polyPath([[-60, 40], [-10, -20], [20, 20], [60, -30], [60, 80], [-60, 80]], true), fill: alpha(p.plum, 0.8) }),
            ]),
            // telefono di servizio
            group({ transform: 'translate(300 540)' }, [
              el('rect', { x: 0, y: 0, width: 90, height: 130, rx: 6, fill: shade(p.ink, 0.18) }),
              el('rect', { x: 12, y: 16, width: 66, height: 20, rx: 4, fill: shade(p.ink, 0.3) }),
              el('circle', { cx: 45, cy: 78, r: 26, fill: alpha(p.brass, 0.55) }),
              el('circle', { cx: 45, cy: 78, r: 12, fill: shade(p.ink, 0.22) }),
            ]),
            // carrello della biancheria
            group({ transform: 'translate(430 830)' }, [
              el('path', { d: cutCornerPath(0, 0, 260, 150, 16), fill: shade(p.ivoryDim, -0.25) }),
              el('path', { d: 'M 10 8 q 60 -34 120 -6 q 60 28 120 4 l 0 16 L 10 22 Z', fill: p.ivory }),
              el('circle', { cx: 40, cy: 168, r: 18, fill: shade(p.ink, 0.18) }),
              el('circle', { cx: 220, cy: 168, r: 18, fill: shade(p.ink, 0.18) }),
              el('rect', { x: 0, y: 150, width: 260, height: 12, fill: shade(p.ink, 0.24) }),
            ]),
            // oggetto: una chiave con il fiocco sulla moquette
            group({ transform: 'translate(1180 900) rotate(24)' }, [
              el('rect', { x: 0, y: -4, width: 90, height: 8, rx: 3, fill: p.brass }),
              el('circle', { cx: -12, cy: 0, r: 18, fill: 'none', stroke: p.brass, 'stroke-width': 8 }),
              el('rect', { x: 74, y: 4, width: 8, height: 18, fill: p.brass }),
              el('circle', { cx: -34, cy: 0, r: 12, fill: alpha(p.lacquer, 0.9) }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 29, 0.9, 4),
            body: group({}, [
              // stipiti in primo piano che incorniciano
              el('path', { d: polyPath([[0, 0], [190, 0], [130, SCENE_H], [0, SCENE_H]], true), fill: shade(p.ink, 0.03) }),
              el('path', { d: polyPath([[SCENE_W, 0], [SCENE_W - 190, 0], [SCENE_W - 130, SCENE_H], [SCENE_W, SCENE_H]], true), fill: shade(p.ink, 0.03) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* ---------------------------------------------------------- CAMERINO */
    {
      chiave: 'camerino',
      titolo: 'Il camerino',
      descrizione: 'Specchio con lampadine, abiti su stampella, spartiti annotati a matita.',
      atmosfera: { pioggia: false, nebbia: 0.08, grana: 0.07, dominante: (p) => p.brassSoft },
      luci: [
        light('specchio', 36, 40, 22, '#E0C365', 0.85),
        light('applique', 82, 34, 10, '#C9A227', 0.4),
      ],
      hotspot: [
        hs('specchio', 'Lo specchio', 36, 40, 13),
        hs('spartiti', 'Gli spartiti', 62, 68, 7),
        hs('armadio', 'La stampella con gli abiti', 84, 52, 9),
        hs('cassetto', 'Il cassetto della toletta', 34, 70, 6),
        hs('bicchieri', "Il bicchiere d'acqua", 46, 62, 4),
        hs('consegna', 'Il punto di consegna', 12, 80, 6),
        hs('oggetto', "L'oggetto fuori posto", 66, 86, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-parete`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.plum, 0.05) },
            { offset: 1, color: shade(p.plum, -0.35) },
          ]),
          body: group({}, [
            full(`url(#${id}-parete)`),
            group(
              {},
              Array.from({ length: 32 }, (_v, i) =>
                el('rect', { x: i * 60 + 20, y: 0, width: 22, height: SCENE_H, fill: alpha(p.ivory, 0.035) }),
              ),
            ),
            el('rect', { x: 0, y: 760, width: SCENE_W, height: 24, fill: alpha(p.brass, 0.35) }),
          ]),
        }),
        (p, id) => {
          const mirror = bulbMirror(p, `${id}-specchio`, { x: 380, y: 220, w: 500, h: 420 });
          return {
            defs: mirror.defs + haloDefs(`${id}-applique`, p.brassSoft, 0.45),
            body: group({}, [
              mirror.body,
              halo(`${id}-applique`, 1580, 380, 150),
              el('path', { d: cutCornerPath(1552, 350, 56, 84, 8), fill: alpha(p.brass, 0.85) }),
            ]),
          };
        },
        (p, id) => ({
          defs: linear(`${id}-abito`, [0, 0], [0, 1], [
            { offset: 0, color: p.lacquer },
            { offset: 1, color: shade(p.lacquerDeep, -0.2) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 780, width: SCENE_W, height: SCENE_H - 780, fill: shade(p.ink, 0.12) }),
            // toletta
            group({ transform: 'translate(340 700)' }, [
              el('rect', { x: 0, y: 0, width: 580, height: 26, fill: shade(p.plum, 0.18) }),
              el('rect', { x: 14, y: 26, width: 552, height: 96, fill: shade(p.plum, 0.06) }),
              el('rect', { x: 40, y: 46, width: 200, height: 54, fill: alpha(p.ink, 0.45) }),
              el('circle', { cx: 140, cy: 73, r: 7, fill: p.brass }),
              el('rect', { x: 300, y: 46, width: 200, height: 54, fill: alpha(p.ink, 0.35) }),
              el('circle', { cx: 400, cy: 73, r: 7, fill: p.brass }),
              el('rect', { x: 20, y: 122, width: 18, height: 200, fill: shade(p.plum, -0.05) }),
              el('rect', { x: 542, y: 122, width: 18, height: 200, fill: shade(p.plum, -0.05) }),
            ]),
            // bicchiere e boccette
            glasses(p, `${id}-bicchiere`, { x: 880, y: 700, w: 10, count: 1 }),
            group({ transform: 'translate(760 700)' }, [
              el('rect', { x: 0, y: -46, width: 26, height: 46, rx: 4, fill: alpha(p.petrolLit, 0.75) }),
              el('rect', { x: 6, y: -60, width: 14, height: 16, fill: p.brass }),
            ]),
            // stampella con abiti
            group({ transform: 'translate(1500 300)' }, [
              el('rect', { x: -240, y: 0, width: 480, height: 10, rx: 5, fill: p.brass }),
              el('rect', { x: -244, y: 0, width: 10, height: 520, fill: shade(p.brass, -0.35) }),
              el('rect', { x: 234, y: 0, width: 10, height: 520, fill: shade(p.brass, -0.35) }),
              el('path', { d: 'M -120 10 l 0 40 q -60 30 -70 300 l 150 0 q -10 -270 -70 -300 l 0 -40 Z', fill: `url(#${id}-abito)` }),
              el('path', { d: 'M 40 10 l 0 40 q -50 26 -60 250 l 130 0 q -12 -224 -62 -250 l 0 -40 Z', fill: alpha(p.petrolLit, 0.9) }),
              el('path', { d: 'M -130 12 q 10 -18 26 0', fill: 'none', stroke: shade(p.brass, -0.2), 'stroke-width': 4 }),
            ]),
            // spartiti
            group({ transform: 'translate(1080 720) rotate(-5)' }, [
              el('rect', { x: 0, y: 0, width: 210, height: 270, fill: p.ivory }),
              ...Array.from({ length: 7 }, (_v, i) =>
                group(
                  {},
                  Array.from({ length: 5 }, (_w, j) =>
                    el('rect', { x: 20, y: 26 + i * 34 + j * 5, width: 170, height: 1.4, fill: alpha(p.ink, 0.55) }),
                  ),
                ),
              ),
              el('rect', { x: 20, y: 12, width: 90, height: 4, fill: alpha(p.ink, 0.35) }),
            ]),
            group({ transform: 'translate(1150 700) rotate(8)' }, [
              el('rect', { x: 0, y: 0, width: 190, height: 250, fill: shade(p.ivory, -0.05) }),
            ]),
            // oggetto: un guanto lungo caduto
            el('path', {
              d: 'M 1240 960 q 60 -30 120 -10 q 40 14 34 40 q -6 26 -60 22 l -84 -8 q -22 -18 -10 -44 Z',
              fill: alpha(p.ivory, 0.9),
            }),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 31, 0.9, 4),
            body: group({}, [
              // tenda del camerino a destra
              el('path', { d: polyPath([[SCENE_W, 0], [SCENE_W - 210, 0], [SCENE_W - 160, SCENE_H], [SCENE_W, SCENE_H]], true), fill: alpha(shade(p.petrol, -0.35), 0.95) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* --------------------------------------------------------- PASSAGGIO */
    {
      chiave: 'passaggio',
      titolo: 'Il passaggio di servizio',
      descrizione: 'Tubi, luce verde di emergenza, la scala a chiocciola che collega tutti i piani.',
      atmosfera: { pioggia: false, nebbia: 0.2, grana: 0.07, dominante: (p) => p.petrolLit },
      luci: [
        light('emergenza', 24, 26, 14, '#1E5E58', 0.8, 0),
        light('emergenza-2', 76, 30, 12, '#1E5E58', 0.6),
      ],
      hotspot: [
        hs('scaletta', 'La scala a chiocciola', 72, 56, 11),
        hs('ventilazione', 'La condotta', 20, 26, 8),
        hs('porta', 'La porta di servizio', 40, 56, 8),
        hs('cassetto', 'La cassetta degli attrezzi', 14, 80, 6),
        hs('consegna', 'Il montacarichi', 90, 62, 7),
        hs('oggetto', "L'oggetto fuori posto", 56, 86, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-muro`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.ink, 0.14) },
            { offset: 1, color: shade(p.ink, 0.02) },
          ]),
          body: group({}, [
            full(`url(#${id}-muro)`),
            group(
              {},
              Array.from({ length: 26 }, (_v, i) =>
                el('rect', {
                  x: 0,
                  y: i * 42,
                  width: SCENE_W,
                  height: 40,
                  fill: alpha(p.rain, i % 2 ? 0.03 : 0.055),
                }),
              ),
            ),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-verde`, p.petrolLit, 0.85),
          body: group({}, [
            pipes(p, `${id}-tubi`, { y: 150, count: 4 }),
            halo(`${id}-verde`, 460, 280, 260),
            halo(`${id}-verde`, 1460, 320, 220),
            el('path', { d: cutCornerPath(420, 250, 80, 60, 10), fill: alpha(p.petrolLit, 0.9) }),
            el('path', { d: cutCornerPath(1420, 290, 80, 60, 10), fill: alpha(p.petrolLit, 0.9) }),
            // condotta di ventilazione
            group({ transform: 'translate(180 220)' }, [
              el('rect', { x: 0, y: 0, width: 340, height: 130, fill: shade(p.rain, -0.5) }),
              ...Array.from({ length: 6 }, (_v, i) =>
                el('rect', { x: 12 + i * 54, y: 0, width: 10, height: 130, fill: alpha(p.ink, 0.55) }),
              ),
            ]),
          ]),
        }),
        (p, id) => ({
          defs: tilePattern(`${id}-pavimento`, shade(p.ink, 0.12), shade(p.ink, 0.02), 70, 1),
          body: group({}, [
            el('rect', { x: 0, y: 720, width: SCENE_W, height: SCENE_H - 720, fill: `url(#${id}-pavimento)` }),
            el('rect', { x: 0, y: 720, width: SCENE_W, height: SCENE_H - 720, fill: alpha(p.petrol, 0.18) }),
            spiralStair(p, { cx: 1380, top: 200, bottom: 900, r: 220 }),
            door(p, { x: 700, y: 400, w: 220, h: 400, color: shade(p.petrol, -0.3), open: 0.08, lightColor: p.petrolLit }),
            // montacarichi
            group({ transform: 'translate(1660 420)' }, [
              el('rect', { x: 0, y: 0, width: 230, height: 380, fill: shade(p.ink, 0.16) }),
              el('rect', { x: 14, y: 14, width: 202, height: 352, fill: alpha(p.ink, 0.7) }),
              ...Array.from({ length: 9 }, (_v, i) =>
                el('rect', { x: 14, y: 20 + i * 39, width: 202, height: 6, fill: alpha(p.brass, 0.3) }),
              ),
              el('rect', { x: 0, y: 380, width: 230, height: 14, fill: p.brass }),
            ]),
            // cassetta degli attrezzi
            group({ transform: 'translate(180 880)' }, [
              el('path', { d: cutCornerPath(0, 0, 190, 96, 12), fill: shade(p.lacquerDeep, -0.05) }),
              el('rect', { x: 60, y: -26, width: 70, height: 30, rx: 8, fill: 'none', stroke: shade(p.ink, 0.24), 'stroke-width': 8 }),
              el('rect', { x: 0, y: 42, width: 190, height: 8, fill: alpha(p.ink, 0.4) }),
            ]),
            // oggetto: un bottone d'ottone sul pavimento
            group({ transform: 'translate(1060 970)' }, [
              el('circle', { cx: 0, cy: 0, r: 18, fill: p.brass }),
              el('circle', { cx: 0, cy: 0, r: 11, fill: shade(p.brass, -0.3) }),
              el('circle', { cx: -3, cy: -3, r: 3, fill: p.brassSoft }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 37, 0.9, 4),
            body: group({}, [
              pipes(p, `${id}-tubi-fg`, { y: -20, count: 2 }),
              el('rect', { x: 0, y: 0, width: SCENE_W, height: SCENE_H, fill: alpha(p.petrolLit, 0.06) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* ------------------------------------------------------------ QUADRO */
    {
      chiave: 'quadro',
      titolo: 'Il quadro elettrico',
      descrizione: 'Leve, contatori, una lampadina sola e un’ombra lunga sul cemento.',
      atmosfera: { pioggia: false, nebbia: 0.1, grana: 0.07, dominante: (p) => p.ink },
      luci: [light('lampadina', 50, 14, 18, '#F2E9D8', 0.7)],
      hotspot: [
        hs('quadro', 'Il quadro elettrico', 50, 44, 14),
        hs('orologio', 'Il contatore orario', 74, 34, 6),
        hs('cassetto', 'La cassetta dei fusibili', 24, 46, 7),
        hs('porta', 'La porta blindata', 90, 56, 7),
        hs('consegna', 'Il punto di consegna', 14, 80, 6),
        hs('oggetto', "L'oggetto fuori posto", 62, 84, 5),
      ],
      layers: [
        (p, id) => ({
          defs: radial(`${id}-cemento`, [0.5, 0.2], 0.8, [
            { offset: 0, color: shade(p.ink, 0.2) },
            { offset: 1, color: p.ink },
          ]),
          body: group({}, [
            full(`url(#${id}-cemento)`),
            group(
              {},
              Array.from({ length: 14 }, (_v, i) =>
                el('rect', { x: 0, y: i * 78, width: SCENE_W, height: 2, fill: alpha(p.rain, 0.05) }),
              ),
            ),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-lampadina`, p.ivory, 0.6),
          body: group({}, [
            el('rect', { x: SCENE_W / 2 - 2, y: 0, width: 4, height: 140, fill: alpha(p.ivoryDim, 0.4) }),
            halo(`${id}-lampadina`, SCENE_W / 2, 160, 320),
            el('circle', { cx: SCENE_W / 2, cy: 160, r: 22, fill: alpha(p.ivory, 0.95) }),
            lightCone(p.ivory, { x: SCENE_W / 2, y: 170, spread: 560, length: 900, opacity: 0.1 }),
            // matasse di cavi
            ...Array.from({ length: 6 }, (_v, i) =>
              el('path', {
                d: `M 0 ${f(300 + i * 26)} q ${f(SCENE_W / 2)} ${f(120 + i * 24)} ${f(SCENE_W)} ${f(280 + i * 26)}`,
                fill: 'none',
                stroke: alpha(p.ink, 0.85),
                'stroke-width': f(5 + i),
              }),
            ),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-lamiera`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.rain, -0.4) },
            { offset: 1, color: shade(p.rain, -0.62) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 800, width: SCENE_W, height: SCENE_H - 800, fill: shade(p.ink, 0.09) }),
            // ombra lunga
            el('path', {
              d: polyPath([[820, 800], [1120, 800], [1420, SCENE_H], [560, SCENE_H]], true),
              fill: alpha(p.ink, 0.55),
            }),
            // pannello principale
            group({ transform: 'translate(640 300)' }, [
              el('rect', { x: 0, y: 0, width: 640, height: 500, fill: `url(#${id}-lamiera)` }),
              el('rect', { x: 0, y: 0, width: 640, height: 500, fill: 'none', stroke: alpha(p.brass, 0.5), 'stroke-width': 4 }),
              ...Array.from({ length: 6 }, (_v, i) =>
                group({ transform: `translate(${f(70 + i * 96)} 300)` }, [
                  el('rect', { x: -14, y: 0, width: 28, height: 120, rx: 6, fill: shade(p.ink, 0.2) }),
                  el('rect', {
                    x: -8,
                    y: i % 2 ? 10 : 60,
                    width: 16,
                    height: 52,
                    rx: 6,
                    fill: i % 2 ? p.lacquer : p.petrolLit,
                  }),
                ]),
              ),
              ...Array.from({ length: 8 }, (_v, i) =>
                el('circle', {
                  cx: 60 + (i % 4) * 160,
                  cy: 460 + Math.floor(i / 4) * 0,
                  r: 12,
                  fill: i % 3 === 0 ? alpha(p.lacquer, 0.9) : alpha(p.petrolLit, 0.8),
                }),
              ),
            ]),
            gauges(p, 720, 380, 5, 40, 130),
            // cassetta dei fusibili
            group({ transform: 'translate(330 400)' }, [
              el('rect', { x: 0, y: 0, width: 220, height: 300, fill: shade(p.plum, -0.15) }),
              el('rect', { x: 14, y: 14, width: 192, height: 272, fill: alpha(p.ink, 0.55) }),
              ...Array.from({ length: 8 }, (_v, i) =>
                el('rect', {
                  x: 30 + (i % 2) * 96,
                  y: 34 + Math.floor(i / 2) * 62,
                  width: 64,
                  height: 40,
                  fill: alpha(i % 3 === 0 ? p.brass : p.ivoryDim, 0.7),
                }),
              ),
            ]),
            door(p, { x: 1690, y: 460, w: 210, h: 380, color: shade(p.rain, -0.55) }),
            // oggetto: una torcia caduta
            group({ transform: 'translate(1180 950) rotate(-16)' }, [
              el('rect', { x: 0, y: 0, width: 120, height: 30, rx: 8, fill: shade(p.ink, 0.26) }),
              el('path', { d: polyPath([[120, -8], [160, -20], [160, 50], [120, 38]], true), fill: p.brass }),
              el('circle', { cx: 152, cy: 15, r: 22, fill: alpha(p.brassSoft, 0.6) }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 41, 0.9, 4),
            body: group({}, [
              el('path', {
                d: `M 0 60 q ${f(SCENE_W / 2)} 260 ${f(SCENE_W)} 40`,
                fill: 'none',
                stroke: alpha(p.ink, 0.9),
                'stroke-width': 16,
              }),
              v.body,
              grainOverlay(`${id}-grana`, 0.07),
            ]),
          };
        },
      ],
    },

    /* ------------------------------------------------------------- PALCO */
    {
      chiave: 'palco',
      titolo: 'Il palco',
      descrizione: 'Le luci di ribalta da dentro: sipario, microfono, un leggio e il buio in sala.',
      atmosfera: { pioggia: false, nebbia: 0.26, grana: 0.06, dominante: (p) => p.lacquerDeep },
      luci: [
        light('occhio-di-bue', 50, 30, 24, '#F2E9D8', 0.8),
        light('ribalta', 50, 86, 30, '#E0C365', 0.6),
      ],
      hotspot: [
        hs('spartiti', 'Il leggio', 62, 62, 8),
        hs('bicchieri', "Il bicchiere sullo sgabello", 34, 68, 5),
        hs('porta', 'Le quinte', 90, 48, 7),
        hs('tavolo', 'Lo sgabello', 34, 74, 6),
        hs('consegna', 'Il punto di consegna', 12, 78, 6),
        hs('oggetto', "L'oggetto fuori posto", 50, 88, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-sipario`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.lacquerDeep, -0.3) },
            { offset: 0.5, color: p.lacquerDeep },
            { offset: 1, color: shade(p.lacquerDeep, -0.5) },
          ]),
          body: group({}, [
            full(`url(#${id}-sipario)`),
            group(
              {},
              Array.from({ length: 26 }, (_v, i) =>
                el('path', {
                  d: `M ${f(i * 76)} 0 q 20 ${f(SCENE_H / 2)} 0 ${f(SCENE_H)} l 26 0 q -20 ${f(-SCENE_H / 2)} 0 ${f(-SCENE_H)} Z`,
                  fill: alpha(shade(p.lacquerDeep, -0.5), 0.5),
                }),
              ),
            ),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-occhio`, p.ivory, 0.55),
          body: group({}, [
            halo(`${id}-occhio`, SCENE_W / 2, 320, 420),
            lightCone(p.ivory, { x: SCENE_W / 2 - 260, y: 0, spread: 420, length: 900, opacity: 0.09 }),
            lightCone(p.brassSoft, { x: SCENE_W / 2 + 260, y: 0, spread: 420, length: 900, opacity: 0.08 }),
            steam(p, `${id}-fumo`, { y: 620, count: 7 }),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-assito`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.plum, 0.02) },
            { offset: 1, color: shade(p.ink, 0.1) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 760, width: SCENE_W, height: SCENE_H - 760, fill: `url(#${id}-assito)` }),
            group(
              {},
              Array.from({ length: 22 }, (_v, i) =>
                el('rect', { x: i * 88, y: 760, width: 84, height: 320, fill: alpha(p.ink, i % 2 ? 0.16 : 0.06) }),
              ),
            ),
            // asta del microfono
            group({ transform: 'translate(960 560)' }, [
              el('rect', { x: -5, y: 0, width: 10, height: 300, fill: shade(p.ink, 0.24) }),
              el('ellipse', { cx: 0, cy: 300, rx: 60, ry: 14, fill: shade(p.ink, 0.2) }),
              el('path', { d: cutCornerPath(-26, -70, 52, 78, 14), fill: shade(p.rain, -0.35) }),
              ...Array.from({ length: 5 }, (_v, i) =>
                el('rect', { x: -22, y: -62 + i * 13, width: 44, height: 5, fill: alpha(p.ink, 0.7) }),
              ),
              el('rect', { x: -14, y: 8, width: 28, height: 22, rx: 4, fill: p.brass }),
            ]),
            // leggio con spartiti
            group({ transform: 'translate(1230 640)' }, [
              el('rect', { x: -6, y: 0, width: 12, height: 240, fill: shade(p.ink, 0.22) }),
              el('path', { d: polyPath([[-96, -30], [96, -30], [96, 26], [-96, 26]], true), fill: shade(p.ink, 0.26), transform: 'rotate(-12)' }),
              el('path', { d: polyPath([[-84, -44], [84, -44], [84, 12], [-84, 12]], true), fill: p.ivory, transform: 'rotate(-12)' }),
              el('path', { d: polyPath([[-70, 240], [70, 240], [96, 258], [-96, 258]], true), fill: shade(p.ink, 0.2) }),
            ]),
            // sgabello con bicchiere
            group({ transform: 'translate(660 720)' }, [
              el('ellipse', { cx: 0, cy: 0, rx: 66, ry: 18, fill: shade(p.plum, 0.1) }),
              el('rect', { x: -8, y: 0, width: 16, height: 160, fill: shade(p.ink, 0.22) }),
              el('ellipse', { cx: 0, cy: 160, rx: 44, ry: 12, fill: shade(p.ink, 0.18) }),
            ]),
            glasses(p, `${id}-bicchiere`, { x: 660, y: -6 + 720, w: 10, count: 1 }),
            // oggetto: una rosa caduta sull'assito
            group({ transform: 'translate(960 980) rotate(18)' }, [
              el('rect', { x: 0, y: -3, width: 150, height: 6, rx: 3, fill: shade(p.petrol, -0.1) }),
              el('circle', { cx: -8, cy: 0, r: 20, fill: p.lacquer }),
              el('circle', { cx: -8, cy: 0, r: 11, fill: shade(p.lacquerDeep, -0.1) }),
              el('path', { d: 'M 60 0 q 26 -22 44 -4 q -22 18 -44 4 Z', fill: shade(p.petrol, 0.05) }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          const d = sideDrapes(p, `${id}-quinte`, 300, p.lacquerDeep);
          const rampLights: string[] = [];
          for (let i = 0; i < 16; i += 1) {
            const x = 80 + i * ((SCENE_W - 160) / 15);
            rampLights.push(
              el('circle', { cx: x, cy: 1040, r: 46, fill: `url(#${id}-ribalta)` }),
              el('path', { d: cutCornerPath(x - 26, 1022, 52, 40, 8), fill: shade(p.brass, -0.25) }),
              el('circle', { cx: x, cy: 1030, r: 14, fill: alpha(p.brassSoft, 0.95) }),
            );
          }
          return {
            defs: v.defs + d.defs + haloDefs(`${id}-ribalta`, p.brassSoft, 0.8) + grainFilter(`${id}-grana`, 43, 0.9, 4),
            body: group({}, [
              d.body,
              group({}, rampLights),
              el('rect', { x: 0, y: 1004, width: SCENE_W, height: 12, fill: alpha(p.brass, 0.6) }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* ----------------------------------------------------- REGISTRAZIONE */
    {
      chiave: 'registrazione',
      titolo: 'La sala di registrazione',
      descrizione: 'Un registratore a bobine, il banco dei livelli, il vetro che dà sulla sala.',
      atmosfera: { pioggia: false, nebbia: 0.08, grana: 0.06, dominante: (p) => p.plum },
      luci: [
        light('spia-rossa', 78, 22, 8, '#B5261E', 0.7, 2400),
        light('lampada-banco', 40, 40, 14, '#C9A227', 0.55),
      ],
      hotspot: [
        hs('bobina', 'Il registratore a bobine', 32, 54, 9),
        hs('finestra', 'Il vetro sulla sala', 68, 34, 10),
        hs('telefono', "L'interfono", 84, 62, 6),
        hs('cassetto', 'Lo schedario dei nastri', 12, 60, 7),
        hs('spartiti', 'Le note del tecnico', 52, 72, 6),
        hs('consegna', 'Il punto di consegna', 90, 82, 6),
        hs('oggetto', "L'oggetto fuori posto", 46, 86, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-parete`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.plum, -0.1) },
            { offset: 1, color: shade(p.plum, -0.45) },
          ]),
          body: group({}, [
            full(`url(#${id}-parete)`),
            // pannelli fonoassorbenti a piramidi
            group(
              {},
              Array.from({ length: 15 }, (_v, r) =>
                group(
                  {},
                  Array.from({ length: 26 }, (_w, c) =>
                    el('path', {
                      d: polyPath(
                        [
                          [c * 76, r * 52],
                          [c * 76 + 38, r * 52 + 26],
                          [c * 76, r * 52 + 52],
                        ],
                        true,
                      ),
                      fill: alpha(p.ink, (r + c) % 2 ? 0.22 : 0.12),
                    }),
                  ),
                ),
              ),
            ),
          ]),
        }),
        (p, id) => ({
          defs: [
            linear(`${id}-vetro`, [0, 0], [0.5, 1], [
              { offset: 0, color: alpha(p.rain, 0.35) },
              { offset: 1, color: alpha(p.ink, 0.7) },
            ]),
            haloDefs(`${id}-spia`, p.lacquer, 0.75),
          ].join(''),
          body: group({}, [
            // vetro sulla sala
            group({ transform: 'translate(1120 220)' }, [
              el('rect', { x: -20, y: -20, width: 640, height: 400, fill: shade(p.plum, 0.1) }),
              el('rect', { x: 0, y: 0, width: 600, height: 360, fill: `url(#${id}-vetro)` }),
              crowd(p, `${id}-sala`, { y: 320, count: 4, scale: 0.5 }),
              el('rect', { x: 0, y: 0, width: 600, height: 360, fill: 'none', stroke: alpha(p.brass, 0.5), 'stroke-width': 5 }),
              el('path', { d: 'M 0 0 L 240 360', stroke: alpha(p.ivory, 0.12), 'stroke-width': 40, fill: 'none' }),
            ]),
            halo(`${id}-spia`, 1500, 150, 130),
            el('path', { d: cutCornerPath(1440, 120, 120, 60, 12), fill: alpha(p.lacquerDeep, 0.9), stroke: p.brass, 'stroke-width': 3 }),
            el('circle', { cx: 1500, cy: 150, r: 16, fill: p.lacquer }),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-banco`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.plum, 0.16) },
            { offset: 1, color: shade(p.plum, -0.2) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 780, width: SCENE_W, height: SCENE_H - 780, fill: shade(p.ink, 0.1) }),
            // banco dei livelli
            group({ transform: 'translate(700 660)' }, [
              el('path', { d: polyPath([[0, 0], [760, 0], [820, 90], [-60, 90]], true), fill: `url(#${id}-banco)` }),
              el('rect', { x: -60, y: 90, width: 880, height: 20, fill: shade(p.plum, -0.35) }),
              ...Array.from({ length: 12 }, (_v, i) =>
                group({ transform: `translate(${f(46 + i * 60)} 30)` }, [
                  el('rect', { x: -6, y: 0, width: 12, height: 46, rx: 3, fill: shade(p.ink, 0.18) }),
                  el('rect', { x: -14, y: f(6 + (i % 5) * 7), width: 28, height: 10, rx: 3, fill: p.brassSoft }),
                ]),
              ),
              ...Array.from({ length: 4 }, (_v, i) =>
                group({ transform: `translate(${f(120 + i * 190)} -34)` }, [
                  el('rect', { x: -46, y: -26, width: 92, height: 44, rx: 4, fill: shade(p.ivory, -0.1) }),
                  el('path', {
                    d: `M -34 8 A 40 40 0 0 1 34 8`,
                    fill: 'none',
                    stroke: alpha(p.ink, 0.4),
                    'stroke-width': 2,
                  }),
                  el('line', { x1: 0, y1: 8, x2: f(-18 + i * 12), y2: -16, stroke: p.lacquer, 'stroke-width': 2.5 }),
                ]),
              ),
            ]),
            // registratore a bobine
            group({ transform: 'translate(380 620)' }, [
              el('path', { d: cutCornerPath(0, 0, 400, 250, 18), fill: shade(p.rain, -0.5) }),
              reel(p, 110, 90, 66),
              reel(p, 290, 90, 66),
              el('path', { d: 'M 110 156 q 90 44 180 -66', fill: 'none', stroke: alpha(p.ink, 0.85), 'stroke-width': 4 }),
              el('rect', { x: 60, y: 196, width: 280, height: 34, rx: 6, fill: shade(p.ink, 0.16) }),
              ...Array.from({ length: 5 }, (_v, i) =>
                el('rect', { x: 76 + i * 54, y: 204, width: 36, height: 18, rx: 4, fill: i === 2 ? p.lacquer : alpha(p.ivoryDim, 0.7) }),
              ),
            ]),
            // schedario dei nastri
            group({ transform: 'translate(90 560)' }, [
              el('rect', { x: 0, y: 0, width: 260, height: 340, fill: shade(p.plum, -0.05) }),
              ...Array.from({ length: 4 }, (_v, i) =>
                group({}, [
                  el('rect', { x: 14, y: 14 + i * 82, width: 232, height: 66, fill: alpha(p.ink, 0.6) }),
                  el('rect', { x: 96, y: 40 + i * 82, width: 68, height: 8, rx: 4, fill: p.brass }),
                ]),
              ),
            ]),
            // interfono
            group({ transform: 'translate(1560 700)' }, [
              el('path', { d: cutCornerPath(0, 0, 150, 120, 12), fill: shade(p.ink, 0.2) }),
              ...Array.from({ length: 6 }, (_v, i) =>
                el('rect', { x: 18, y: 16 + i * 15, width: 114, height: 7, fill: alpha(p.ink, 0.75) }),
              ),
              el('rect', { x: 30, y: 122, width: 90, height: 16, rx: 6, fill: p.brass }),
            ]),
            // note del tecnico
            group({ transform: 'translate(980 726) rotate(-4)' }, [
              el('rect', { x: 0, y: 0, width: 170, height: 110, fill: p.ivory }),
              ...Array.from({ length: 5 }, (_v, i) =>
                el('rect', { x: 16, y: 20 + i * 16, width: f(60 + ((i * 37) % 90)), height: 3, fill: alpha(p.ink, 0.4) }),
              ),
            ]),
            // oggetto: una bobina fuori dalla scatola
            group({ transform: 'translate(900 950)' }, [reel(p, 0, 0, 54)]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 47, 0.9, 4),
            body: group({}, [
              el('path', {
                d: `M 0 40 q 300 200 620 60 q 320 -140 640 40 q 300 170 660 -20`,
                fill: 'none',
                stroke: alpha(p.ink, 0.8),
                'stroke-width': 14,
              }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },

    /* --------------------------------------------------------------- BAR */
    {
      chiave: 'bar',
      titolo: 'Il bar',
      descrizione: 'Bancone di mogano, specchiera, bottiglie in fila e due bicchieri di troppo.',
      atmosfera: { pioggia: false, nebbia: 0.12, grana: 0.06, dominante: (p) => p.brass },
      luci: [
        light('lampade-bancone', 50, 24, 22, '#C9A227', 0.65),
        light('specchiera', 50, 40, 26, '#E0C365', 0.35),
      ],
      hotspot: [
        hs('bancone', 'Il bancone', 50, 68, 13),
        hs('bicchieri', 'Due bicchieri', 36, 60, 6),
        hs('telefono', 'Il telefono del bar', 78, 60, 5),
        hs('registro', 'Il conto delle consumazioni', 22, 62, 5),
        hs('tavolo', 'Il tavolino appartato', 88, 80, 7),
        hs('consegna', 'Il punto di consegna', 10, 80, 6),
        hs('oggetto', "L'oggetto fuori posto", 60, 76, 5),
      ],
      layers: [
        (p, id) => ({
          defs: linear(`${id}-specchiera`, [0, 0], [0.3, 1], [
            { offset: 0, color: alpha(p.brassSoft, 0.18) },
            { offset: 0.5, color: alpha(p.plum, 0.5) },
            { offset: 1, color: alpha(p.ink, 0.8) },
          ]),
          body: group({}, [
            full(shade(p.plum, -0.3)),
            el('rect', { x: 200, y: 140, width: SCENE_W - 400, height: 560, fill: `url(#${id}-specchiera)` }),
            el('rect', {
              x: 200,
              y: 140,
              width: SCENE_W - 400,
              height: 560,
              fill: 'none',
              stroke: alpha(p.brass, 0.65),
              'stroke-width': 6,
            }),
            ...Array.from({ length: 4 }, (_v, i) =>
              el('rect', { x: 200 + i * ((SCENE_W - 400) / 4), y: 140, width: 8, height: 560, fill: alpha(p.brass, 0.35) }),
            ),
          ]),
        }),
        (p, id) => ({
          defs: haloDefs(`${id}-lampade`, p.brassSoft, 0.55),
          body: group({}, [
            // mensole con bottiglie
            el('rect', { x: 260, y: 420, width: SCENE_W - 520, height: 14, fill: shade(p.brass, -0.25) }),
            bottles(p, `${id}-bott-1`, { x: 300, y: 420, w: SCENE_W - 600, count: 16 }),
            el('rect', { x: 260, y: 620, width: SCENE_W - 520, height: 14, fill: shade(p.brass, -0.25) }),
            bottles(p, `${id}-bott-2`, { x: 320, y: 620, w: SCENE_W - 640, count: 13 }),
            // lampade sospese
            ...[560, 960, 1360].map((x) =>
              group({}, [
                halo(`${id}-lampade`, x, 240, 190),
                el('rect', { x: x - 3, y: 0, width: 6, height: 180, fill: alpha(p.brass, 0.5) }),
                el('path', { d: polyPath([[x - 70, 240], [x + 70, 240], [x + 46, 180], [x - 46, 180]], true), fill: shade(p.brass, -0.15) }),
                el('circle', { cx: x, cy: 246, r: 14, fill: alpha(p.brassSoft, 0.95) }),
              ]),
            ),
          ]),
        }),
        (p, id) => ({
          defs: linear(`${id}-mogano`, [0, 0], [0, 1], [
            { offset: 0, color: shade(p.lacquerDeep, -0.1) },
            { offset: 0.4, color: shade(p.plum, 0.08) },
            { offset: 1, color: shade(p.ink, 0.12) },
          ]),
          body: group({}, [
            el('rect', { x: 0, y: 820, width: SCENE_W, height: SCENE_H - 820, fill: shade(p.ink, 0.1) }),
            // bancone
            el('path', { d: polyPath([[120, 700], [SCENE_W - 120, 700], [SCENE_W - 40, 760], [40, 760]], true), fill: shade(p.brass, -0.1) }),
            el('rect', { x: 40, y: 756, width: SCENE_W - 80, height: 220, fill: `url(#${id}-mogano)` }),
            ...Array.from({ length: 10 }, (_v, i) =>
              el('rect', { x: 90 + i * 180, y: 780, width: 120, height: 170, fill: alpha(p.ink, 0.2) }),
            ),
            el('rect', { x: 40, y: 950, width: SCENE_W - 80, height: 14, fill: alpha(p.brass, 0.5) }),
            glasses(p, `${id}-calici`, { x: 640, y: 700, w: 120, count: 2 }),
            // conto e matita
            group({ transform: 'translate(360 664)' }, [
              el('rect', { x: 0, y: 0, width: 140, height: 36, fill: p.ivory }),
              el('rect', { x: 12, y: 10, width: 90, height: 3, fill: alpha(p.ink, 0.4) }),
              el('rect', { x: 12, y: 20, width: 60, height: 3, fill: alpha(p.ink, 0.4) }),
              el('rect', { x: 150, y: 22, width: 90, height: 6, rx: 3, fill: p.brass, transform: 'rotate(-12 150 22)' }),
            ]),
            // telefono
            group({ transform: 'translate(1480 650)' }, [
              el('rect', { x: 0, y: 24, width: 96, height: 32, rx: 6, fill: shade(p.ink, 0.18) }),
              el('path', { d: 'M 6 22 q 42 -30 84 0 l -12 10 q -30 -20 -60 0 Z', fill: shade(p.ink, 0.24) }),
              el('circle', { cx: 48, cy: 42, r: 11, fill: alpha(p.brass, 0.7) }),
            ]),
            // sgabelli
            ...[420, 700, 980, 1260].map((x) =>
              group({ transform: `translate(${x} 900)` }, [
                el('ellipse', { cx: 0, cy: 0, rx: 54, ry: 16, fill: shade(p.lacquerDeep, 0.05) }),
                el('rect', { x: -7, y: 0, width: 14, height: 150, fill: shade(p.brass, -0.3) }),
                el('ellipse', { cx: 0, cy: 150, rx: 40, ry: 11, fill: shade(p.ink, 0.18) }),
              ]),
            ),
            // tavolino appartato
            group({ transform: 'translate(1740 860)' }, [
              el('ellipse', { cx: 0, cy: 0, rx: 130, ry: 34, fill: shade(p.plum, 0.12) }),
              el('rect', { x: -9, y: 0, width: 18, height: 150, fill: shade(p.ink, 0.2) }),
              el('ellipse', { cx: 0, cy: 150, rx: 62, ry: 17, fill: shade(p.ink, 0.16) }),
            ]),
            // oggetto: un portasigarette d'argento
            group({ transform: 'translate(1160 686) rotate(-6)' }, [
              el('path', { d: cutCornerPath(0, 0, 110, 70, 10), fill: shade(p.ivoryDim, -0.05) }),
              el('rect', { x: 12, y: 32, width: 86, height: 3, fill: alpha(p.ink, 0.35) }),
              el('path', { d: cutCornerPath(8, 6, 94, 24, 6), fill: 'none', stroke: alpha(p.ink, 0.25), 'stroke-width': 2 }),
            ]),
          ]),
        }),
        (p, id) => {
          const v = vignette(p, `${id}-vign`);
          return {
            defs: v.defs + grainFilter(`${id}-grana`, 53, 0.9, 4),
            body: group({}, [
              archFrame(p, { inset: 120, color: shade(p.ink, 0.02) }),
              steam(p, `${id}-fumo`, { y: 300, count: 5 }),
              v.body,
              grainOverlay(`${id}-grana`, 0.06),
            ]),
          };
        },
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Scrittura                                                           */
/* ------------------------------------------------------------------ */

export interface SceneManifestEntry {
  readonly chiave: string;
  readonly titolo: string;
  readonly cartella: string;
  readonly layer: readonly {
    readonly file: string;
    readonly profondita: number;
    readonly parallasse: number;
    readonly ruolo: string;
  }[];
  readonly luci: readonly Light[];
  readonly hotspot: readonly Hotspot[];
}

/**
 * Il manifesto di un ambiente già reso, se c'è.
 *
 * Riconoscerlo è semplice: i livelli resi sono WebP, quelli disegnati SVG.
 */
async function leggiManifestoReso(dir: string): Promise<SceneManifestEntry | null> {
  try {
    const grezzo = await readFile(path.join(dir, 'scene.json'), 'utf8');
    const meta = JSON.parse(grezzo) as SceneManifestEntry & { chiave: string };
    const layer = meta.layer ?? [];
    if (layer.length > 0 && layer.every((l) => l.file.endsWith('.webp'))) return meta;
    return null;
  } catch {
    return null;
  }
}

export async function generateScenes(): Promise<SceneManifestEntry[]> {
  setCategory('scena');
  const p = await loadPalette();
  const out: SceneManifestEntry[] = [];

  for (const scene of scenes()) {
    const dir = path.join(ASSETS_DIR, 'scene', scene.chiave);
    const layerMeta: SceneManifestEntry['layer'][number][] = [];

    /*
     * Se l'ambiente è già stato renderizzato in Blender, non si torna indietro.
     *
     * `pnpm render:scenes` sostituisce i livelli disegnati con quelli resi e
     * riscrive gli hotspot con le posizioni proiettate dal 3D. Rigenerare qui
     * gli SVG li cancellerebbe in silenzio, e la volta dopo che qualcuno lancia
     * `pnpm generate:assets` — per un'icona, per una carta — si ritroverebbe la
     * grafica vecchia senza capire perché. Qui si riconoscono i livelli resi e
     * si lascia stare l'ambiente, aggiornando solo ciò che il render non tocca.
     */
    const reso = await leggiManifestoReso(dir);
    if (reso) {
      out.push({ ...reso, chiave: scene.chiave, titolo: scene.titolo, cartella: `assets/scene/${scene.chiave}` });
      continue;
    }

    for (let i = 0; i < scene.layers.length; i += 1) {
      const build = scene.layers[i]!(p, `${scene.chiave}-l${i}`);
      const file = `layer-${i}.svg`;
      await write(
        path.join(dir, file),
        svg(
          {
            width: SCENE_W,
            height: SCENE_H,
            title: `${scene.titolo} — livello ${i} (${ROLES[i]})`,
            defs: build.defs && build.defs.length > 0 ? build.defs : undefined,
            extraAttrs: { preserveAspectRatio: 'xMidYMid slice' },
          },
          build.body,
        ),
      );
      layerMeta.push({
        file,
        profondita: i,
        parallasse: PARALLAX[i] ?? 1,
        ruolo: ROLES[i] ?? 'principale',
      });
    }

    const meta = {
      chiave: scene.chiave,
      titolo: scene.titolo,
      descrizione: scene.descrizione,
      larghezza: SCENE_W,
      altezza: SCENE_H,
      atmosfera: {
        pioggia: scene.atmosfera.pioggia,
        nebbia: scene.atmosfera.nebbia,
        grana: scene.atmosfera.grana,
        dominante: scene.atmosfera.dominante(p),
      },
      layer: layerMeta,
      luci: scene.luci,
      hotspot: scene.hotspot,
    };
    await write(path.join(dir, 'scene.json'), JSON.stringify(meta, null, 2));

    out.push({
      chiave: scene.chiave,
      titolo: scene.titolo,
      cartella: `assets/scene/${scene.chiave}`,
      layer: layerMeta,
      luci: scene.luci,
      hotspot: scene.hotspot,
    });
  }

  return out;
}

/** Elenco delle chiavi scena, usato dal manifest e dai test. */
export function sceneKeys(): string[] {
  return scenes().map((s) => s.chiave);
}
