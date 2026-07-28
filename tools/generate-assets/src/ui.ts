import path from 'node:path';
import { loadPalette } from './engine-design.js';
import { ASSETS_DIR, alpha, el, esc, f, group, mix, random, setCategory, svg, write } from './util.js';

/**
 * Elementi di interfaccia: grana della carta, carte indizio, dorso, bacheca,
 * fondo della timeline, cornice del verdetto, sipario, pianta dell'hotel.
 *
 * Tutto procedurale: la grana è un campo di puntini generato da un RNG con
 * seme fisso, quindi il file è identico a ogni rigenerazione.
 */

/* ------------------------------------------------------------------ */
/* Grana della carta                                                   */
/* ------------------------------------------------------------------ */

function grana(): string {
  const rng = random('meridien::grana');
  const punti: string[] = [];
  for (let i = 0; i < 900; i += 1) {
    const x = rng.range(0, 240);
    const y = rng.range(0, 240);
    const r = rng.range(0.25, 1.15);
    const o = rng.range(0.05, 0.4);
    punti.push(el('circle', { cx: f(x), cy: f(y), r: f(r), fill: '#000', opacity: f(o) }));
  }
  // fibre lunghe: quello che distingue la carta dal rumore digitale
  const fibre: string[] = [];
  for (let i = 0; i < 60; i += 1) {
    const x = rng.range(0, 240);
    const y = rng.range(0, 240);
    const l = rng.range(6, 26);
    const a = rng.range(-0.5, 0.5);
    fibre.push(
      el('path', {
        d: `M${f(x)} ${f(y)}q${f(l / 2)} ${f(a * 3)} ${f(l)} ${f(a * 5)}`,
        stroke: '#000',
        'stroke-width': 0.35,
        fill: 'none',
        opacity: f(rng.range(0.05, 0.18)),
      }),
    );
  }
  return svg(
    { width: 240, height: 240, viewBox: '0 0 240 240', title: 'Grana della carta' },
    group({}, [...punti, ...fibre].join('')),
  );
}

/* ------------------------------------------------------------------ */
/* Carte                                                               */
/* ------------------------------------------------------------------ */

const CARTA_W = 360;
const CARTA_H = 500;
const TAGLIO = 26;

function sagomaCarta(w = CARTA_W, h = CARTA_H, t = TAGLIO): string {
  return `M${t} 0H${w}V${h - t}L${w - t} ${h}H0V${t}Z`;
}

interface BordoCarta {
  readonly chiave: string;
  readonly nome: string;
  readonly colore: (p: Awaited<ReturnType<typeof loadPalette>>) => string;
}

const BORDI: BordoCarta[] = [
  { chiave: 'critico', nome: 'Prova decisiva', colore: (p) => p.lacquer },
  { chiave: 'utile', nome: 'Prova utile', colore: (p) => p.brass },
  { chiave: 'contorno', nome: 'Dettaglio', colore: (p) => p.rain },
  { chiave: 'falsa-pista', nome: 'Falsa pista', colore: (p) => p.plum },
];

async function carte(): Promise<void> {
  const p = await loadPalette();

  for (const bordo of BORDI) {
    const c = bordo.colore(p);
    const defs = [
      el(
        'linearGradient',
        { id: 'carta', x1: '0', y1: '0', x2: '0.4', y2: '1' },
        el('stop', { offset: '0', 'stop-color': '#F6EFE0' }) + el('stop', { offset: '1', 'stop-color': '#E4D9C2' }),
      ),
      el(
        'pattern',
        { id: 'grana', width: 240, height: 240, patternUnits: 'userSpaceOnUse' },
        el('image', { href: '../paper-grain.svg', width: 240, height: 240, opacity: 0.18 }),
      ),
    ].join('');

    const corpo = [
      el('path', { d: sagomaCarta(), fill: 'url(#carta)' }),
      el('path', { d: sagomaCarta(), fill: 'url(#grana)', style: 'mix-blend-mode:multiply' }),
      // doppia cornice: filo sottile interno, banda spessa esterna
      el('path', { d: sagomaCarta(), fill: 'none', stroke: c, 'stroke-width': 6 }),
      el('path', {
        d: sagomaCarta(CARTA_W - 24, CARTA_H - 24, TAGLIO - 8),
        transform: 'translate(12 12)',
        fill: 'none',
        stroke: alpha(c, 0.55),
        'stroke-width': 1,
      }),
      // fascia dell'etichetta
      el('path', { d: `M12 12H${CARTA_W - 12}V52H12Z`, fill: alpha(c, 0.16) }),
      el('path', { d: `M12 52H${CARTA_W - 12}`, stroke: alpha(c, 0.7), 'stroke-width': 1 }),
      // raggi Art Déco nell'angolo in basso a sinistra
      group(
        { transform: `translate(28 ${CARTA_H - 28})`, stroke: alpha(c, 0.35), 'stroke-width': 1, fill: 'none' },
        [0, 1, 2, 3, 4]
          .map((i) => el('path', { d: `M0 0L${f(38 - i * 6)} ${f(-10 - i * 8)}` }))
          .join(''),
      ),
    ].join('');

    await write(
      path.join(ASSETS_DIR, 'card', `bordo-${bordo.chiave}.svg`),
      svg(
        { width: CARTA_W, height: CARTA_H, viewBox: `0 0 ${CARTA_W} ${CARTA_H}`, defs, title: bordo.nome },
        corpo,
      ),
    );
  }

  // dorso della carta: monogramma M dentro un rombo di raggi
  const raggi = Array.from({ length: 24 }, (_, i) => {
    const ang = (i / 24) * Math.PI * 2;
    const r1 = 60;
    const r2 = i % 2 === 0 ? 148 : 116;
    return el('path', {
      d: `M${f(Math.cos(ang) * r1)} ${f(Math.sin(ang) * r1)}L${f(Math.cos(ang) * r2)} ${f(Math.sin(ang) * r2)}`,
      stroke: alpha(p.brass, i % 2 === 0 ? 0.55 : 0.28),
      'stroke-width': i % 2 === 0 ? 2 : 1,
    });
  }).join('');

  const dorso = [
    el('path', { d: sagomaCarta(), fill: p.night }),
    el('path', { d: sagomaCarta(), fill: 'none', stroke: p.brass, 'stroke-width': 6 }),
    group({ transform: `translate(${CARTA_W / 2} ${CARTA_H / 2})` }, raggi),
    group(
      { transform: `translate(${CARTA_W / 2} ${CARTA_H / 2})` },
      el('path', {
        // monogramma M costruito a segmenti, non con un font
        d: 'M-38 34V-34L0 6L38 -34V34',
        fill: 'none',
        stroke: p.brassSoft,
        'stroke-width': 9,
        'stroke-linejoin': 'miter',
      }),
    ),
    el('path', {
      d: sagomaCarta(CARTA_W - 40, CARTA_H - 40, TAGLIO - 12),
      transform: 'translate(20 20)',
      fill: 'none',
      stroke: alpha(p.brass, 0.4),
      'stroke-width': 1,
    }),
  ].join('');

  await write(
    path.join(ASSETS_DIR, 'card', 'dorso.svg'),
    svg({ width: CARTA_W, height: CARTA_H, viewBox: `0 0 ${CARTA_W} ${CARTA_H}`, title: 'Dorso' }, dorso),
  );
}

/* ------------------------------------------------------------------ */
/* Bacheca, timeline, cornice del verdetto, sipario                    */
/* ------------------------------------------------------------------ */

async function superfici(): Promise<void> {
  const p = await loadPalette();

  // bacheca: velluto verde petrolio con trama diagonale e cornice d'ottone
  const rng = random('meridien::bacheca');
  const trama = Array.from({ length: 160 }, () => {
    const x = rng.range(-40, 1240);
    const y = rng.range(0, 800);
    const l = rng.range(8, 40);
    return el('path', {
      d: `M${f(x)} ${f(y)}l${f(l)} ${f(l * 0.6)}`,
      stroke: alpha(mix(p.petrolLit, '#ffffff', 0.2), rng.range(0.03, 0.1)),
      'stroke-width': f(rng.range(0.6, 2)),
    });
  }).join('');

  await write(
    path.join(ASSETS_DIR, 'ui', 'bacheca.svg'),
    svg(
      {
        width: 1200,
        height: 800,
        viewBox: '0 0 1200 800',
        title: 'Bacheca delle prove',
        defs: el(
          'radialGradient',
          { id: 'velluto', cx: '0.5', cy: '0.35', r: '0.8' },
          el('stop', { offset: '0', 'stop-color': p.petrolLit }) +
            el('stop', { offset: '1', 'stop-color': p.petrol }),
        ),
      },
      [
        el('rect', { width: 1200, height: 800, fill: 'url(#velluto)' }),
        group({}, trama),
        el('rect', {
          x: 14,
          y: 14,
          width: 1172,
          height: 772,
          fill: 'none',
          stroke: p.brass,
          'stroke-width': 8,
        }),
        el('rect', {
          x: 30,
          y: 30,
          width: 1140,
          height: 740,
          fill: 'none',
          stroke: alpha(p.brassSoft, 0.5),
          'stroke-width': 1,
        }),
      ].join(''),
    ),
  );

  // timeline: nastro con tacche ai quarti d'ora
  const tacche: string[] = [];
  for (let i = 0; i <= 48; i += 1) {
    const x = 40 + (i / 48) * 1120;
    const grande = i % 4 === 0;
    tacche.push(
      el('path', {
        d: `M${f(x)} ${grande ? 42 : 54}V78`,
        stroke: alpha(p.brass, grande ? 0.9 : 0.4),
        'stroke-width': grande ? 2 : 1,
      }),
    );
  }
  await write(
    path.join(ASSETS_DIR, 'ui', 'timeline.svg'),
    svg(
      { width: 1200, height: 120, viewBox: '0 0 1200 120', title: 'Nastro della cronologia' },
      [
        el('rect', { width: 1200, height: 120, fill: p.night }),
        el('path', { d: 'M40 78H1160', stroke: p.brass, 'stroke-width': 2 }),
        group({}, tacche.join('')),
      ].join(''),
    ),
  );

  // cornice del verdetto: arco Art Déco con raggi
  const raggiVerdetto = Array.from({ length: 17 }, (_, i) => {
    const t = i / 16;
    const x = 100 + t * 1000;
    return el('path', {
      d: `M600 700L${f(x)} 120`,
      stroke: alpha(p.lacquer, 0.1 + Math.abs(0.5 - t) * 0.12),
      'stroke-width': 2,
    });
  }).join('');

  await write(
    path.join(ASSETS_DIR, 'ui', 'verdetto.svg'),
    svg(
      { width: 1200, height: 800, viewBox: '0 0 1200 800', title: 'Cornice del verdetto' },
      [
        el('rect', { width: 1200, height: 800, fill: p.ink }),
        group({}, raggiVerdetto),
        el('path', {
          d: 'M180 720V300A420 420 0 0 1 1020 300V720',
          fill: 'none',
          stroke: p.brass,
          'stroke-width': 6,
        }),
        el('path', {
          d: 'M215 720V305A385 385 0 0 1 985 305V720',
          fill: 'none',
          stroke: alpha(p.brassSoft, 0.45),
          'stroke-width': 1.5,
        }),
      ].join(''),
    ),
  );

  // sipario: due ante di velluto con pieghe
  const pieghe = (offset: number, larghezza: number): string =>
    Array.from({ length: 9 }, (_, i) => {
      const x = offset + (i / 8) * larghezza;
      return el('path', {
        d: `M${f(x)} 0C${f(x + 14)} 260 ${f(x - 14)} 540 ${f(x)} 800`,
        stroke: alpha(p.ink, 0.35),
        'stroke-width': f(6 + (i % 3) * 3),
        fill: 'none',
      });
    }).join('');

  await write(
    path.join(ASSETS_DIR, 'ui', 'sipario.svg'),
    svg(
      {
        width: 1200,
        height: 800,
        viewBox: '0 0 1200 800',
        title: 'Sipario',
        defs: el(
          'linearGradient',
          { id: 'velluto-sipario', x1: '0', y1: '0', x2: '1', y2: '0' },
          el('stop', { offset: '0', 'stop-color': mix(p.lacquerDeep, '#000000', 0.25) }) +
            el('stop', { offset: '0.5', 'stop-color': p.lacquer }) +
            el('stop', { offset: '1', 'stop-color': mix(p.lacquerDeep, '#000000', 0.25) }),
        ),
      },
      [
        el('rect', { width: 600, height: 800, fill: 'url(#velluto-sipario)' }),
        group({}, pieghe(0, 600)),
        el('rect', { x: 600, width: 600, height: 800, fill: 'url(#velluto-sipario)' }),
        group({}, pieghe(600, 600)),
        el('rect', { x: 596, width: 8, height: 800, fill: alpha(p.ink, 0.6) }),
      ].join(''),
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Pianta dell'hotel                                                   */
/* ------------------------------------------------------------------ */

interface Stanza {
  readonly id: string;
  readonly nome: string;
  readonly piano: number;
  readonly x: number;
  readonly w: number;
}

const PIANTA: Stanza[] = [
  { id: 'suite', nome: 'Suite 404', piano: 4, x: 60, w: 240 },
  { id: 'corridoio', nome: 'Corridoio', piano: 4, x: 310, w: 420 },
  { id: 'camerino', nome: 'Camerini', piano: 4, x: 740, w: 200 },
  { id: 'corridoio-2', nome: 'Secondo piano', piano: 2, x: 60, w: 380 },
  { id: 'registrazione', nome: 'Sala di registrazione', piano: 2, x: 450, w: 300 },
  { id: 'passaggio', nome: 'Passaggio di servizio', piano: 2, x: 760, w: 180 },
  { id: 'hall', nome: 'Hall', piano: 0, x: 60, w: 300 },
  { id: 'sala-ballo', nome: 'Sala da ballo', piano: 0, x: 370, w: 300 },
  { id: 'palco', nome: 'Palco', piano: 0, x: 680, w: 120 },
  { id: 'bar', nome: 'Bar', piano: 0, x: 810, w: 130 },
  { id: 'terrazza', nome: 'Terrazza', piano: 0, x: 950, w: 190 },
  { id: 'cucina', nome: 'Cucina', piano: -1, x: 60, w: 260 },
  { id: 'quadro', nome: 'Quadro elettrico', piano: -1, x: 330, w: 200 },
  { id: 'piscina', nome: 'Piscina vuota', piano: -1, x: 540, w: 300 },
];

const ALTEZZA_PIANO = 130;
const PIANI = [4, 2, 0, -1];

async function pianta(): Promise<void> {
  const p = await loadPalette();
  const h = PIANI.length * ALTEZZA_PIANO + 80;

  const etichettePiani = PIANI.map((piano, i) => {
    const y = 50 + i * ALTEZZA_PIANO;
    const nome = piano === 0 ? 'Piano terra' : piano === -1 ? 'Interrato' : `Piano ${piano}`;
    return (
      el('path', { d: `M40 ${y + ALTEZZA_PIANO - 18}H1160`, stroke: alpha(p.brass, 0.25), 'stroke-width': 1 }) +
      el(
        'text',
        {
          x: 1150,
          y: y + 16,
          fill: alpha(p.brass, 0.7),
          'font-family': 'ui-sans-serif, sans-serif',
          'font-size': 13,
          'letter-spacing': '0.18em',
          'text-anchor': 'end',
        },
        esc(nome.toUpperCase()),
      )
    );
  }).join('');

  const stanze = PIANTA.map((s) => {
    const i = PIANI.indexOf(s.piano);
    const y = 50 + i * ALTEZZA_PIANO;
    const alt = ALTEZZA_PIANO - 48;
    return group(
      { id: `pianta-${s.id}` },
      el('path', {
        d: `M${s.x + 10} ${y}H${s.x + s.w}V${y + alt - 10}L${s.x + s.w - 10} ${y + alt}H${s.x}V${y + 10}Z`,
        fill: alpha(p.petrol, 0.5),
        stroke: p.brass,
        'stroke-width': 1.5,
      }) +
        el(
          'text',
          {
            x: s.x + s.w / 2,
            y: y + alt / 2 + 5,
            fill: p.ivory,
            'font-family': 'ui-sans-serif, sans-serif',
            'font-size': 14,
            'text-anchor': 'middle',
          },
          esc(s.nome),
        ),
    );
  }).join('');

  await write(
    path.join(ASSETS_DIR, 'ui', 'pianta.svg'),
    svg(
      { width: 1200, height: h, viewBox: `0 0 1200 ${h}`, title: 'Pianta del Grand Hotel Méridien' },
      [
        el('rect', { width: 1200, height: h, fill: p.ink }),
        group({}, etichettePiani),
        group({}, stanze),
        // vano scala e ascensore, che attraversano tutti i piani
        el('path', {
          d: `M980 50V${h - 30}`,
          stroke: alpha(p.brassSoft, 0.4),
          'stroke-width': 2,
          'stroke-dasharray': '6 6',
        }),
      ].join(''),
    ),
  );
}

/* ------------------------------------------------------------------ */

export async function generateUi(): Promise<void> {
  setCategory('interfaccia');
  await write(path.join(ASSETS_DIR, 'paper-grain.svg'), grana());
  await carte();
  await superfici();
  await pianta();
}
