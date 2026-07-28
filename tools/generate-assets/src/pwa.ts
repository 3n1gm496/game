import path from 'node:path';
import { loadPalette } from './engine-design.js';
import { PUBLIC_DIR, ASSETS_DIR, alpha, el, f, group, setCategory, svg, write, writeBinary } from './util.js';

/**
 * Icone PWA e schermate di avvio iOS.
 *
 * I PNG richiesti dal manifest vengono prodotti con `sharp` se disponibile.
 * `sharp` è opzionale di proposito: senza di lui restano gli SVG, che il
 * manifest dichiara comunque, e il gioco resta installabile.
 */

const MARCHIO_VIEWBOX = 512;

function marchio(p: Awaited<ReturnType<typeof loadPalette>>, opts: { maskable: boolean }): string {
  const c = MARCHIO_VIEWBOX / 2;
  // con `maskable` il contenuto sta nel cerchio sicuro (80% del lato)
  const scala = opts.maskable ? 0.62 : 0.8;

  const raggi = Array.from({ length: 20 }, (_, i) => {
    const ang = (i / 20) * Math.PI * 2 - Math.PI / 2;
    const r1 = 96 * scala;
    const r2 = (i % 2 === 0 ? 214 : 176) * scala;
    return el('path', {
      d: `M${f(c + Math.cos(ang) * r1)} ${f(c + Math.sin(ang) * r1)}L${f(c + Math.cos(ang) * r2)} ${f(c + Math.sin(ang) * r2)}`,
      stroke: alpha(p.brass, i % 2 === 0 ? 0.7 : 0.32),
      'stroke-width': i % 2 === 0 ? 6 : 3,
    });
  }).join('');

  return [
    el('rect', { width: MARCHIO_VIEWBOX, height: MARCHIO_VIEWBOX, fill: p.ink }),
    el('circle', { cx: c, cy: c, r: 232 * scala, fill: p.night }),
    group({}, raggi),
    el('circle', { cx: c, cy: c, r: 150 * scala, fill: 'none', stroke: p.brass, 'stroke-width': 5 }),
    // monogramma M a segmenti, coerente con il dorso delle carte
    el('path', {
      d: `M${f(c - 78 * scala)} ${f(c + 74 * scala)}V${f(c - 74 * scala)}L${f(c)} ${f(c + 12 * scala)}L${f(c + 78 * scala)} ${f(c - 74 * scala)}V${f(c + 74 * scala)}`,
      fill: 'none',
      stroke: p.brassSoft,
      'stroke-width': f(22 * scala),
      'stroke-linejoin': 'miter',
    }),
  ].join('');
}

const SPLASH = [
  { nome: 'iphone-15', w: 1179, h: 2556 },
  { nome: 'iphone-max', w: 1284, h: 2778 },
  { nome: 'iphone-standard', w: 1170, h: 2532 },
  { nome: 'iphone-piccolo', w: 828, h: 1792 },
  { nome: 'tablet', w: 1536, h: 2048 },
];

function schermataAvvio(p: Awaited<ReturnType<typeof loadPalette>>, w: number, h: number): string {
  const cx = w / 2;
  const cy = h * 0.44;
  const r = Math.min(w, h) * 0.18;

  const pioggia = Array.from({ length: 90 }, (_, i) => {
    const x = ((i * 137.5) % 100) / 100;
    return el('path', {
      d: `M${f(x * w)} ${f(((i * 61) % 100) / 100) === 0 ? 0 : f((((i * 61) % 100) / 100) * h)}l-14 46`,
      stroke: alpha(p.rain, 0.14),
      'stroke-width': 1.4,
    });
  }).join('');

  const raggi = Array.from({ length: 16 }, (_, i) => {
    const ang = (i / 16) * Math.PI * 2 - Math.PI / 2;
    return el('path', {
      d: `M${f(cx + Math.cos(ang) * r * 0.55)} ${f(cy + Math.sin(ang) * r * 0.55)}L${f(cx + Math.cos(ang) * r * (i % 2 === 0 ? 1.25 : 1))} ${f(cy + Math.sin(ang) * r * (i % 2 === 0 ? 1.25 : 1))}`,
      stroke: alpha(p.brass, i % 2 === 0 ? 0.6 : 0.28),
      'stroke-width': i % 2 === 0 ? 4 : 2,
    });
  }).join('');

  return svg(
    {
      width: w,
      height: h,
      viewBox: `0 0 ${w} ${h}`,
      title: 'MÉRIDIEN',
      defs: el(
        'radialGradient',
        { id: 'cielo', cx: '0.5', cy: '0.1', r: '1' },
        el('stop', { offset: '0', 'stop-color': p.nightSoft }) + el('stop', { offset: '1', 'stop-color': p.ink }),
      ),
    },
    [
      el('rect', { width: w, height: h, fill: 'url(#cielo)' }),
      group({}, pioggia),
      group({}, raggi),
      el('circle', { cx, cy, r: r * 0.78, fill: 'none', stroke: p.brass, 'stroke-width': 4 }),
      el('path', {
        d: `M${f(cx - r * 0.42)} ${f(cy + r * 0.4)}V${f(cy - r * 0.4)}L${f(cx)} ${f(cy + r * 0.06)}L${f(cx + r * 0.42)} ${f(cy - r * 0.4)}V${f(cy + r * 0.4)}`,
        fill: 'none',
        stroke: p.brassSoft,
        'stroke-width': f(r * 0.12),
        'stroke-linejoin': 'miter',
      }),
      el('path', {
        d: `M${f(cx - r * 0.9)} ${f(cy + r * 1.7)}H${f(cx + r * 0.9)}`,
        stroke: alpha(p.brass, 0.6),
        'stroke-width': 2,
      }),
    ].join(''),
  );
}

async function rasterizza(svgTesto: string, dimensione: number, destinazione: string): Promise<boolean> {
  try {
    const modulo = (await import('sharp').catch(() => null)) as
      | { default: (input: Buffer) => { resize(w: number, h: number): { png(): { toBuffer(): Promise<Buffer> } } } }
      | null;
    if (!modulo) return false;
    const png = await modulo
      .default(Buffer.from(svgTesto, 'utf8'))
      .resize(dimensione, dimensione)
      .png()
      .toBuffer();
    await writeBinary(destinazione, png);
    return true;
  } catch {
    return false;
  }
}

export interface RisultatoPwa {
  readonly pngGenerati: boolean;
}

export async function generatePwa(): Promise<RisultatoPwa> {
  setCategory('pwa');
  const p = await loadPalette();

  const iconaNormale = svg(
    { width: MARCHIO_VIEWBOX, height: MARCHIO_VIEWBOX, viewBox: `0 0 ${MARCHIO_VIEWBOX} ${MARCHIO_VIEWBOX}`, title: 'MÉRIDIEN' },
    marchio(p, { maskable: false }),
  );
  const iconaMaskable = svg(
    { width: MARCHIO_VIEWBOX, height: MARCHIO_VIEWBOX, viewBox: `0 0 ${MARCHIO_VIEWBOX} ${MARCHIO_VIEWBOX}`, title: 'MÉRIDIEN' },
    marchio(p, { maskable: true }),
  );

  await write(path.join(PUBLIC_DIR, 'favicon.svg'), iconaNormale);
  await write(path.join(PUBLIC_DIR, 'icon-192.svg'), iconaNormale);
  await write(path.join(PUBLIC_DIR, 'icon-512.svg'), iconaNormale);
  await write(path.join(PUBLIC_DIR, 'icon-maskable.svg'), iconaMaskable);

  const png192 = await rasterizza(iconaNormale, 192, path.join(PUBLIC_DIR, 'icon-192.png'));
  const png512 = await rasterizza(iconaNormale, 512, path.join(PUBLIC_DIR, 'icon-512.png'));
  const pngMask = await rasterizza(iconaMaskable, 512, path.join(PUBLIC_DIR, 'icon-maskable.png'));
  const pngGenerati = png192 && png512 && pngMask;

  for (const s of SPLASH) {
    await write(path.join(ASSETS_DIR, 'splash', `${s.nome}.svg`), schermataAvvio(p, s.w, s.h));
  }

  // il manifest dichiara i PNG solo se esistono davvero
  const icone: Record<string, unknown>[] = [];
  if (pngGenerati) {
    icone.push(
      { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: './icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    );
  }
  icone.push(
    { src: './icon-512.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: './icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
  );

  const manifest = {
    name: 'MÉRIDIEN — Delitto al Grand Hotel',
    short_name: 'Méridien',
    description: 'Giallo sociale multiplayer per 4-8 giocatori. Riviera ligure, 1968.',
    lang: 'it',
    dir: 'ltr',
    start_url: './',
    scope: './',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: p.ink,
    theme_color: p.night,
    categories: ['games', 'entertainment'],
    icons: icone,
    shortcuts: [
      {
        name: 'Apri una nuova indagine',
        short_name: 'Nuova indagine',
        url: './?azione=nuova',
        description: 'Crea subito una stanza',
      },
    ],
  };

  await write(path.join(PUBLIC_DIR, 'manifest.webmanifest'), `${JSON.stringify(manifest, null, 2)}`);

  return { pngGenerati };
}
