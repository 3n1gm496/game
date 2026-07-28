/**
 * Passo 2 — Logo.
 *
 * Insegna «MÉRIDIEN»: lettering Art Déco costruito con path (nessun font di
 * sistema), cornice a raggi, alone da insegna al neon. Due file:
 *  - `logo.svg` statico;
 *  - `logo-animato.svg` con alone pulsante lento e riflesso che scorre,
 *    entrambi disattivati da `prefers-reduced-motion`.
 */

import path from 'node:path';

import { loadPalette } from './engine-design.js';
import { acutePath, lettering, translatePath, type GlyphBox } from './lettering.js';
import {
  ASSETS_DIR,
  alpha,
  blurFilter,
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

const WIDTH = 1200;
const HEIGHT = 460;

const BOX: GlyphBox = { W: 115, H: 155, t: 19 };
const SMALL: GlyphBox = { W: 22, H: 30, t: 4.4 };

interface LogoParts {
  readonly defs: string;
  readonly body: string;
  readonly letterPaths: readonly string[];
  readonly letterBounds: { x: number; y: number; w: number; h: number };
}

function buildParts(p: Awaited<ReturnType<typeof loadPalette>>): LogoParts {
  const word = lettering('MERIDIEN', BOX, 0.17);
  const originX = (WIDTH - word.width) / 2;
  const originY = 150;
  const letterPaths = word.paths.map((d) => translatePath(d, originX, originY));

  // Accento acuto sulla E (seconda lettera).
  const ePos = word.positions[1];
  if (ePos) {
    letterPaths.push(translatePath(acutePath(ePos.x, 0, BOX), originX, originY));
  }

  const tag = lettering('GRAND HOTEL', SMALL, 0.34);
  const tagX = (WIDTH - tag.width) / 2;
  const tagY = 366;
  const tagPaths = tag.paths.map((d) => translatePath(d, tagX, tagY));

  /* --- raggiera dietro il lettering ------------------------------------ */
  const rays: string[] = [];
  const rc: Point = [WIDTH / 2, HEIGHT * 0.60];
  const rng = random('meridien-logo-raggi');
  for (let i = 0; i < 30; i += 1) {
    const a0 = (Math.PI * i) / 30 - Math.PI;
    const spread = 0.026 + rng.next() * 0.012;
    const len = 780;
    const pts: Point[] = [
      [rc[0], rc[1]],
      [rc[0] + Math.cos(a0 - spread) * len, rc[1] + Math.sin(a0 - spread) * len],
      [rc[0] + Math.cos(a0 + spread) * len, rc[1] + Math.sin(a0 + spread) * len],
    ];
    rays.push(
      el('path', {
        d: polyPath(pts, true),
        fill: i % 2 === 0 ? alpha(p.brass, 0.14) : alpha(p.rain, 0.07),
      }),
    );
  }

  /* --- cornice ---------------------------------------------------------- */
  const frameOuter = cutCornerPath(28, 28, WIDTH - 56, HEIGHT - 56, 34);
  const frameInner = cutCornerPath(44, 44, WIDTH - 88, HEIGHT - 88, 24);
  const frameHair = cutCornerPath(54, 54, WIDTH - 108, HEIGHT - 108, 18);

  const ornaments: string[] = [];
  for (const [ox, oy, sx, sy] of [
    [28, 28, 1, 1],
    [WIDTH - 28, 28, -1, 1],
    [28, HEIGHT - 28, 1, -1],
    [WIDTH - 28, HEIGHT - 28, -1, -1],
  ] as const) {
    const chevron = polyPath(
      [
        [0, 44],
        [12, 44],
        [12, 12],
        [44, 12],
        [44, 0],
        [0, 0],
      ],
      true,
    );
    ornaments.push(
      el('path', {
        d: chevron,
        fill: `url(#logo-ottone)`,
        transform: `translate(${f(ox)} ${f(oy)}) scale(${sx} ${sy})`,
      }),
    );
  }

  /* --- filetto sotto il lettering --------------------------------------- */
  const ruleY = 330;
  const rule = [
    el('rect', { x: 300, y: ruleY, width: 260, height: 2.5, fill: alpha(p.brass, 0.85) }),
    el('rect', { x: 640, y: ruleY, width: 260, height: 2.5, fill: alpha(p.brass, 0.85) }),
    el('path', {
      d: polyPath(
        [
          [600, ruleY - 11],
          [613, ruleY + 1.2],
          [600, ruleY + 13],
          [587, ruleY + 1.2],
        ],
        true,
      ),
      fill: p.brassSoft,
    }),
    el('circle', { cx: 576, cy: ruleY + 1.2, r: 3, fill: alpha(p.brass, 0.8) }),
    el('circle', { cx: 624, cy: ruleY + 1.2, r: 3, fill: alpha(p.brass, 0.8) }),
  ].join('');

  const defs = [
    linear('logo-fondo', [0, 0], [0, 1], [
      { offset: 0, color: shade(p.night, 0.1) },
      { offset: 0.55, color: p.night },
      { offset: 1, color: p.ink },
    ]),
    linear('logo-ottone', [0, 0], [0, 1], [
      { offset: 0, color: p.brassSoft },
      { offset: 0.38, color: p.brass },
      { offset: 0.62, color: shade(p.brass, -0.25) },
      { offset: 1, color: p.brassSoft },
    ]),
    linear('logo-riflesso', [0, 0], [1, 0], [
      { offset: 0, color: p.ivory, opacity: 0 },
      { offset: 0.44, color: p.ivory, opacity: 0.55 },
      { offset: 0.56, color: p.ivory, opacity: 0.55 },
      { offset: 1, color: p.ivory, opacity: 0 },
    ]),
    radial('logo-alone', [0.5, 0.5], 0.62, [
      { offset: 0, color: p.brassSoft, opacity: 0.5 },
      { offset: 0.55, color: p.brass, opacity: 0.18 },
      { offset: 1, color: p.brass, opacity: 0 },
    ]),
    radial('logo-vignetta', [0.5, 0.45], 0.75, [
      { offset: 0.6, color: p.ink, opacity: 0 },
      { offset: 1, color: p.ink, opacity: 0.72 },
    ]),
    blurFilter('logo-sfocatura', 16, 60),
    grainFilter('logo-grana', 5, 0.85, 4),
    el(
      'clipPath',
      { id: 'logo-lettere' },
      letterPaths.map((d) => el('path', { d })).join(''),
    ),
    el(
      'clipPath',
      { id: 'logo-piastra' },
      el('path', { d: cutCornerPath(28, 28, WIDTH - 56, HEIGHT - 56, 34) }),
    ),
  ].join('');

  const body = [
    el('path', { d: cutCornerPath(20, 20, WIDTH - 40, HEIGHT - 40, 40), fill: 'url(#logo-fondo)' }),
    group({ 'clip-path': 'url(#logo-piastra)' }, [
      group({ opacity: '0.9' }, rays),
      el('rect', { x: 0, y: 0, width: WIDTH, height: HEIGHT, fill: 'url(#logo-vignetta)' }),
      el('rect', {
        x: 0,
        y: 0,
        width: WIDTH,
        height: HEIGHT,
        filter: 'url(#logo-grana)',
        opacity: '0.07',
        style: 'mix-blend-mode:soft-light',
      }),
    ]),
    el('ellipse', {
      cx: WIDTH / 2,
      cy: 232,
      rx: 500,
      ry: 150,
      fill: 'url(#logo-alone)',
      id: 'alone-insegna',
    }),
    el('path', { d: frameOuter, fill: 'none', stroke: 'url(#logo-ottone)', 'stroke-width': 3 }),
    el('path', { d: frameInner, fill: 'none', stroke: alpha(p.brass, 0.55), 'stroke-width': 1.5 }),
    el('path', { d: frameHair, fill: 'none', stroke: alpha(p.ivoryDim, 0.16), 'stroke-width': 0.75 }),
    ornaments.join(''),
    // ombra portata del lettering
    group(
      { transform: 'translate(5 7)', opacity: '0.55' },
      letterPaths.map((d) => el('path', { d, fill: p.ink })).join(''),
    ),
    group(
      { id: 'lettering' },
      letterPaths.map((d) => el('path', { d, fill: 'url(#logo-ottone)' })).join(''),
    ),
    // filo di luce superiore sulle lettere
    group(
      { 'clip-path': 'url(#logo-lettere)' },
      el('rect', { x: 0, y: 148, width: WIDTH, height: 5, fill: alpha(p.ivory, 0.5) }),
    ),
    rule,
    group(
      { id: 'sottotitolo' },
      tagPaths.map((d) => el('path', { d, fill: alpha(p.ivoryDim, 0.85) })).join(''),
    ),
  ].join('');

  return {
    defs,
    body,
    letterPaths,
    letterBounds: { x: originX, y: originY, w: word.width, h: BOX.H },
  };
}

export async function generateLogo(): Promise<void> {
  setCategory('logo');
  const p = await loadPalette();
  const parts = buildParts(p);

  await write(
    path.join(ASSETS_DIR, 'logo.svg'),
    svg(
      {
        width: WIDTH,
        height: HEIGHT,
        title: 'MÉRIDIEN — insegna',
        defs: parts.defs,
      },
      parts.body,
    ),
  );

  /* --- versione animata ------------------------------------------------- */
  const style = [
    '#alone-insegna { animation: respiro 5.4s ease-in-out infinite; transform-origin: 600px 232px; }',
    '#neon { animation: neon 5.4s ease-in-out infinite; }',
    '#riflesso { animation: scorri 7.2s cubic-bezier(.4,0,.2,1) infinite; }',
    '@keyframes respiro { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: .95; transform: scale(1.035); } }',
    '@keyframes neon { 0%,100% { opacity: .30; } 50% { opacity: .68; } }',
    `@keyframes scorri { 0% { transform: translateX(${f(-WIDTH * 0.55)}px); } 60%,100% { transform: translateX(${f(WIDTH * 1.05)}px); } }`,
    '@media (prefers-reduced-motion: reduce) {',
    '  #alone-insegna, #neon, #riflesso { animation: none; }',
    '  #riflesso { opacity: 0; }',
    '}',
  ].join('\n');

  const neon = group(
    { id: 'neon', filter: 'url(#logo-sfocatura)', opacity: '0.45' },
    parts.letterPaths.map((d) => el('path', { d, fill: p.brassSoft })).join(''),
  );

  const riflesso = group(
    { 'clip-path': 'url(#logo-lettere)' },
    el('rect', {
      id: 'riflesso',
      x: parts.letterBounds.x - 120,
      y: parts.letterBounds.y - 20,
      width: 210,
      height: parts.letterBounds.h + 40,
      fill: 'url(#logo-riflesso)',
      transform: 'skewX(-18)',
    }),
  );

  const animatedBody = parts.body.replace(
    '<g id="lettering">',
    `${neon}<g id="lettering">`,
  );

  await write(
    path.join(ASSETS_DIR, 'logo-animato.svg'),
    svg(
      {
        width: WIDTH,
        height: HEIGHT,
        title: 'MÉRIDIEN — insegna animata',
        style,
        defs: parts.defs,
      },
      `${animatedBody}${riflesso}`,
    ),
  );
}
