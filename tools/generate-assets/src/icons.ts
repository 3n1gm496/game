import path from 'node:path';
import { ASSETS_DIR, el, f, group, setCategory, svg, write } from './util.js';

/**
 * Set di icone originali a tratto singolo.
 *
 * Regole del set: griglia 24×24, area utile 20×20 (margine 2), `stroke-width`
 * 1.5, terminali tagliati a 45° (`stroke-linecap: butt` con smussi disegnati),
 * nessun riempimento salvo i punti di enfasi. Le forme sono geometriche:
 * archi, segmenti e cerchi, come le insegne dell'albergo.
 */

const S = 24;
const TRATTO = 1.5;

interface Icona {
  readonly nome: string;
  readonly titolo: string;
  /** corpo SVG, coordinate in griglia 24×24 */
  readonly corpo: string;
}

const linea = (x1: number, y1: number, x2: number, y2: number): string =>
  el('path', { d: `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}` });

const percorso = (d: string): string => el('path', { d });

const cerchio = (cx: number, cy: number, r: number): string => el('circle', { cx, cy, r });

const rett = (x: number, y: number, w: number, h: number): string =>
  el('path', {
    d: `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`,
  });

/** Rettangolo con l'angolo in basso a destra tagliato: la firma geometrica. */
const rettTagliato = (x: number, y: number, w: number, h: number, t = 3): string =>
  el('path', {
    d:
      `M${f(x)} ${f(y)}H${f(x + w)}V${f(y + h - t)}` +
      `L${f(x + w - t)} ${f(y + h)}H${f(x)}Z`,
  });

const ICONE: Icona[] = [
  {
    nome: 'chiave',
    titolo: 'Chiave',
    corpo: [cerchio(7, 8, 3.4), linea(9.4, 10.4, 19, 20), linea(16.6, 17.6, 14.6, 19.6), linea(19, 20, 17, 22)].join(''),
  },
  {
    nome: 'orologio',
    titolo: 'Orologio',
    corpo: [cerchio(12, 12, 8.5), linea(12, 7, 12, 12), linea(12, 12, 15.5, 14)].join(''),
  },
  {
    nome: 'maschera',
    titolo: 'Maschera',
    corpo: [
      percorso('M3 9.5C3 7.5 5.5 6.5 12 6.5S21 7.5 21 9.5C21 14.5 17.5 18 12 18S3 14.5 3 9.5Z'),
      percorso('M7 10.5C7.8 9.6 9.4 9.6 10.2 10.5'),
      percorso('M13.8 10.5C14.6 9.6 16.2 9.6 17 10.5'),
      linea(12, 18, 12, 21.5),
    ].join(''),
  },
  {
    nome: 'bicchiere',
    titolo: 'Bicchiere',
    corpo: [percorso('M7 3H17L15.2 12.5A3.4 3.4 0 0 1 8.8 12.5Z'), linea(12, 16, 12, 20.5), linea(8, 20.5, 16, 20.5)].join(''),
  },
  {
    nome: 'spartito',
    titolo: 'Spartito',
    corpo: [
      linea(3.5, 6, 20.5, 6),
      linea(3.5, 9, 20.5, 9),
      linea(3.5, 12, 20.5, 12),
      cerchio(8, 17.5, 2.2),
      linea(10.2, 17.5, 10.2, 9),
      cerchio(16, 15.5, 2.2),
      linea(18.2, 15.5, 18.2, 6),
    ].join(''),
  },
  {
    nome: 'macchina-fotografica',
    titolo: 'Macchina fotografica',
    corpo: [rettTagliato(2.5, 7, 19, 13), percorso('M8.5 7L10 4.5H14L15.5 7'), cerchio(12, 13.5, 3.6)].join(''),
  },
  {
    nome: 'telefono',
    titolo: 'Telefono',
    corpo: [
      percorso('M4 5.5C4 4.7 4.7 4 5.5 4H8L9.5 8L7.6 9.6C8.7 12.3 11.7 15.3 14.4 16.4L16 14.5L20 16V18.5C20 19.3 19.3 20 18.5 20C10.5 20 4 13.5 4 5.5Z'),
    ].join(''),
  },
  {
    nome: 'ombrello',
    titolo: 'Ombrello',
    corpo: [percorso('M2.5 12A9.5 9.5 0 0 1 21.5 12Z'), linea(12, 12, 12, 18.5), percorso('M12 18.5A2.6 2.6 0 0 0 16.5 17')].join(''),
  },
  {
    nome: 'valigia',
    titolo: 'Valigia',
    corpo: [rettTagliato(2.5, 8, 19, 12), percorso('M9 8V5.5H15V8'), linea(12, 8, 12, 20)].join(''),
  },
  {
    nome: 'faro',
    titolo: 'Faro',
    corpo: [percorso('M9 20L10.5 8H13.5L15 20Z'), rett(9.6, 4.5, 4.8, 3.5), linea(4, 6.2, 9.3, 4.9), linea(20, 6.2, 14.7, 4.9), linea(6.5, 20, 17.5, 20)].join(''),
  },
  {
    nome: 'scala',
    titolo: 'Scala',
    corpo: [linea(6.5, 3.5, 6.5, 20.5), linea(17.5, 3.5, 17.5, 20.5), linea(6.5, 8, 17.5, 8), linea(6.5, 12, 17.5, 12), linea(6.5, 16, 17.5, 16)].join(''),
  },
  {
    nome: 'lente',
    titolo: 'Lente',
    corpo: [cerchio(10.5, 10.5, 6.5), linea(15.2, 15.2, 20.5, 20.5)].join(''),
  },
  {
    nome: 'taccuino',
    titolo: 'Taccuino',
    corpo: [rettTagliato(5.5, 3.5, 14, 17), linea(9, 8, 16, 8), linea(9, 12, 16, 12), linea(9, 16, 13.5, 16), linea(5.5, 6, 3, 6), linea(5.5, 11, 3, 11), linea(5.5, 16, 3, 16)].join(''),
  },
  {
    nome: 'sigillo',
    titolo: 'Sigillo',
    corpo: [cerchio(12, 9.5, 6), percorso('M9.4 14.8L8 21L12 19L16 21L14.6 14.8'), cerchio(12, 9.5, 2.4)].join(''),
  },
  {
    nome: 'campanello',
    titolo: 'Campanello',
    corpo: [percorso('M4.5 17A7.5 7.5 0 0 1 19.5 17Z'), linea(3, 17, 21, 17), linea(12, 6.5, 12, 9.5), cerchio(12, 5, 1.4), linea(3, 20, 21, 20)].join(''),
  },
  {
    nome: 'fulmine',
    titolo: 'Fulmine',
    corpo: [percorso('M13.5 2.5L6 13.5H11.5L10.5 21.5L18 10.5H12.5Z')].join(''),
  },
  {
    nome: 'porta',
    titolo: 'Porta',
    corpo: [rettTagliato(5.5, 2.5, 13, 19), cerchio(15, 12, 1.1), linea(3, 21.5, 21, 21.5)].join(''),
  },
  {
    nome: 'candela',
    titolo: 'Candela',
    corpo: [rett(9.5, 9, 5, 11), percorso('M12 3C13.6 5.2 13.6 7.2 12 8.6C10.4 7.2 10.4 5.2 12 3Z'), linea(7.5, 20, 16.5, 20)].join(''),
  },
  {
    nome: 'guanto',
    titolo: 'Guanto',
    corpo: [
      percorso('M7.5 21V11.5C7.5 10.7 8.2 10 9 10S10.5 10.7 10.5 11.5V6C10.5 5.2 11.2 4.5 12 4.5S13.5 5.2 13.5 6V11'),
      percorso('M13.5 11V7.5C13.5 6.7 14.2 6 15 6S16.5 6.7 16.5 7.5V13.5C16.5 17.6 15 21 15 21Z'),
    ].join(''),
  },
  {
    nome: 'bobina',
    titolo: 'Bobina',
    corpo: [cerchio(12, 12, 8.5), cerchio(12, 12, 2.2), linea(12, 3.5, 12, 9.8), linea(12, 14.2, 12, 20.5), linea(3.5, 12, 9.8, 12), linea(14.2, 12, 20.5, 12)].join(''),
  },
  {
    nome: 'scacchiera',
    titolo: 'Marmo a scacchi',
    corpo: [rett(3.5, 3.5, 17, 17), linea(12, 3.5, 12, 20.5), linea(3.5, 12, 20.5, 12), percorso('M3.5 3.5H12V12H3.5Z'), percorso('M12 12H20.5V20.5H12Z')].join(''),
  },
  {
    nome: 'tempesta',
    titolo: 'Tempesta',
    corpo: [percorso('M6 12.5A4 4 0 0 1 7 4.7A5.2 5.2 0 0 1 17 6.4A3.6 3.6 0 0 1 18 13.4H7'), linea(8, 17, 6.5, 21), linea(13, 17, 11.5, 21), linea(18, 17, 16.5, 21)].join(''),
  },
];

function documento(icona: Icona): string {
  return svg(
    {
      width: S,
      height: S,
      viewBox: `0 0 ${S} ${S}`,
      title: icona.titolo,
      extraAttrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': TRATTO, 'stroke-linejoin': 'miter' },
    },
    icona.corpo,
  );
}

export function iconNames(): string[] {
  return ICONE.map((i) => i.nome);
}

export async function generateIcons(): Promise<string[]> {
  setCategory('icona');

  for (const icona of ICONE) {
    await write(path.join(ASSETS_DIR, 'icon', `${icona.nome}.svg`), documento(icona));
  }

  // foglio sprite: un solo file per tutta l'interfaccia
  const simboli = ICONE.map((icona) =>
    el(
      'symbol',
      { id: `icon-${icona.nome}`, viewBox: `0 0 ${S} ${S}` },
      el('title', {}, icona.titolo) + icona.corpo,
    ),
  ).join('');

  const sprite = svg(
    {
      width: S,
      height: S,
      viewBox: `0 0 ${S} ${S}`,
      title: 'Icone MÉRIDIEN',
      extraAttrs: {
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': TRATTO,
        'stroke-linejoin': 'miter',
      },
    },
    group({}, simboli),
  );
  await write(path.join(ASSETS_DIR, 'icons.svg'), sprite);

  return iconNames();
}
