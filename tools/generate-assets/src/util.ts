/**
 * Utilità condivise della pipeline di generazione asset.
 *
 * Tutto quello che viene disegnato in questo tool è costruito qui a partire da
 * primitive testuali: nessuna immagine esterna, nessun font per il lettering
 * principale, nessuna dipendenza a runtime.
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* ------------------------------------------------------------------ */
/* Percorsi                                                            */
/* ------------------------------------------------------------------ */

/** Radice del monorepo (tools/generate-assets/src → ../../..). */
export const ROOT = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
export const WEB_DIR = path.join(ROOT, 'apps', 'web');
export const PUBLIC_DIR = path.join(WEB_DIR, 'public');
export const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
export const STYLES_DIR = path.join(WEB_DIR, 'src', 'styles');

/* ------------------------------------------------------------------ */
/* Registro dei file scritti                                           */
/* ------------------------------------------------------------------ */

export interface WrittenFile {
  /** Percorso assoluto su disco. */
  readonly absolute: string;
  /** Percorso relativo alla radice del monorepo (con separatori POSIX). */
  readonly repoPath: string;
  /** Dimensione in byte. */
  readonly bytes: number;
  /** Categoria logica (per il riepilogo finale). */
  readonly category: string;
}

const registry: WrittenFile[] = [];
let currentCategory = 'vari';

export function setCategory(name: string): void {
  currentCategory = name;
}

export function writtenFiles(): readonly WrittenFile[] {
  return registry;
}

export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/** Scrive un file creando le cartelle mancanti e lo registra. */
export async function write(absolute: string, content: string): Promise<WrittenFile> {
  await mkdir(path.dirname(absolute), { recursive: true });
  const data = content.endsWith('\n') ? content : `${content}\n`;
  await writeFile(absolute, data, 'utf8');
  const entry: WrittenFile = {
    absolute,
    repoPath: toPosix(path.relative(ROOT, absolute)),
    bytes: Buffer.byteLength(data, 'utf8'),
    category: currentCategory,
  };
  registry.push(entry);
  return entry;
}

/** Scrive un buffer binario (usato solo dai PNG opzionali di sharp). */
export async function writeBinary(absolute: string, data: Buffer): Promise<WrittenFile> {
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, data);
  const entry: WrittenFile = {
    absolute,
    repoPath: toPosix(path.relative(ROOT, absolute)),
    bytes: data.byteLength,
    category: currentCategory,
  };
  registry.push(entry);
  return entry;
}

export async function ensureDir(absolute: string): Promise<void> {
  await mkdir(absolute, { recursive: true });
}

/** Elenco ricorsivo di file (percorsi assoluti), ordinato. */
export async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    let entries: string[];
    try {
      entries = await readdir(current);
    } catch {
      return;
    }
    for (const name of entries.sort()) {
      const full = path.join(current, name);
      const info = await stat(full);
      if (info.isDirectory()) await walk(full);
      else out.push(full);
    }
  }
  await walk(dir);
  return out.sort();
}

export function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

/* ------------------------------------------------------------------ */
/* Numeri, colori, testo                                               */
/* ------------------------------------------------------------------ */

/** Formatta un numero per l'SVG: massimo 3 decimali, senza zeri inutili. */
export function f(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const rgbMatch = /^rgba?\(([^)]+)\)$/.exec(hex.trim());
  if (rgbMatch) {
    const [r, g, b] = rgbMatch[1]!.split(',').map((v) => Number(v.trim()));
    return [r ?? 0, g ?? 0, b ?? 0];
  }
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number): string =>
    Math.round(clamp(v, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Mescola due colori esadecimali. `t = 0` restituisce `a`. */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

export function shade(hex: string, amount: number): string {
  return amount >= 0 ? mix(hex, '#ffffff', amount) : mix(hex, '#000000', -amount);
}

/** Colore con canale alfa in notazione `rgba()`. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${f(clamp(a, 0, 1))})`;
}

/* ------------------------------------------------------------------ */
/* RNG deterministico (identico a packages/engine/src/rng.ts)          */
/* ------------------------------------------------------------------ */

function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function sfc32(a: number, b: number, c: number, d: number): () => number {
  let s0 = a >>> 0;
  let s1 = b >>> 0;
  let s2 = c >>> 0;
  let s3 = d >>> 0;
  return () => {
    const t = (s0 + s1) | 0;
    s0 = s1 ^ (s1 >>> 9);
    s1 = (s2 + (s2 << 3)) | 0;
    s2 = (s2 << 21) | (s2 >>> 11);
    s3 = (s3 + 1) | 0;
    const u = (t + s3) | 0;
    s2 = (s2 + u) | 0;
    return (u >>> 0) / 4294967296;
  };
}

export interface Random {
  next(): number;
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  chance(p: number): boolean;
}

export function random(seed: string): Random {
  const hash = xmur3(seed);
  const gen = sfc32(hash(), hash(), hash(), hash());
  for (let i = 0; i < 12; i += 1) gen();
  const api: Random = {
    next: gen,
    range: (min, max) => min + gen() * (max - min),
    int: (min, max) => min + Math.floor(gen() * (max - min + 1)),
    pick: <T,>(items: readonly T[]): T => items[Math.floor(gen() * items.length)] as T,
    chance: (p) => gen() < p,
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Costruzione SVG                                                     */
/* ------------------------------------------------------------------ */

export type AttrValue = string | number | undefined | null | false;
export type Attrs = Record<string, AttrValue>;

export function attrs(map: Attrs): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(map)) {
    if (value === undefined || value === null || value === false) continue;
    const rendered = typeof value === 'number' ? f(value) : value;
    parts.push(`${key}="${rendered.replace(/"/g, '&quot;')}"`);
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

export function el(name: string, map: Attrs = {}, children?: string): string {
  if (children === undefined || children === '') return `<${name}${attrs(map)}/>`;
  return `<${name}${attrs(map)}>${children}</${name}>`;
}

export function group(map: Attrs, children: string | string[]): string {
  return el('g', map, Array.isArray(children) ? children.join('') : children);
}

export interface SvgOptions {
  readonly width: number;
  readonly height: number;
  readonly viewBox?: string;
  readonly defs?: string;
  readonly title?: string;
  readonly style?: string;
  readonly extraAttrs?: Attrs;
}

/** Documento SVG completo, con intestazione XML e commento di provenienza. */
export function svg(options: SvgOptions, body: string | string[]): string {
  const {
    width,
    height,
    viewBox = `0 0 ${f(width)} ${f(height)}`,
    defs,
    title,
    style,
    extraAttrs = {},
  } = options;
  const content = Array.isArray(body) ? body.join('') : body;
  const head = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- MÉRIDIEN — asset generato da tools/generate-assets. Non modificare a mano. -->',
  ].join('\n');
  const open = `<svg${attrs({
    xmlns: 'http://www.w3.org/2000/svg',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    width,
    height,
    viewBox,
    ...extraAttrs,
  })}>`;
  const parts = [head, open];
  if (title) parts.push(el('title', {}, esc(title)));
  if (style) parts.push(`<style>${style}</style>`);
  if (defs) parts.push(el('defs', {}, defs));
  parts.push(content);
  parts.push('</svg>');
  return parts.join('\n');
}

/* ------------------------------------------------------------------ */
/* Gradienti, filtri, pattern                                          */
/* ------------------------------------------------------------------ */

export interface Stop {
  readonly offset: number;
  readonly color: string;
  readonly opacity?: number;
}

export function linear(
  id: string,
  from: readonly [number, number],
  to: readonly [number, number],
  stops: readonly Stop[],
): string {
  const body = stops
    .map((s) =>
      el('stop', {
        offset: `${f(s.offset * 100)}%`,
        'stop-color': s.color,
        'stop-opacity': s.opacity === undefined ? undefined : f(s.opacity),
      }),
    )
    .join('');
  return el(
    'linearGradient',
    { id, x1: `${f(from[0] * 100)}%`, y1: `${f(from[1] * 100)}%`, x2: `${f(to[0] * 100)}%`, y2: `${f(to[1] * 100)}%` },
    body,
  );
}

export function radial(
  id: string,
  center: readonly [number, number],
  r: number,
  stops: readonly Stop[],
  focal?: readonly [number, number],
): string {
  const body = stops
    .map((s) =>
      el('stop', {
        offset: `${f(s.offset * 100)}%`,
        'stop-color': s.color,
        'stop-opacity': s.opacity === undefined ? undefined : f(s.opacity),
      }),
    )
    .join('');
  return el(
    'radialGradient',
    {
      id,
      cx: `${f(center[0] * 100)}%`,
      cy: `${f(center[1] * 100)}%`,
      r: `${f(r * 100)}%`,
      fx: focal ? `${f(focal[0] * 100)}%` : undefined,
      fy: focal ? `${f(focal[1] * 100)}%` : undefined,
    },
    body,
  );
}

/**
 * Grana procedurale: rumore frattale desaturato, usato in `soft-light` sopra le
 * superfici. È il sostituto generato della texture di carta.
 */
export function grainFilter(id: string, seed = 3, frequency = 0.9, octaves = 4): string {
  return el('filter', { id, x: '0%', y: '0%', width: '100%', height: '100%' }, [
    el('feTurbulence', {
      type: 'fractalNoise',
      baseFrequency: f(frequency),
      numOctaves: octaves,
      seed,
      result: 'rumore',
    }),
    el('feColorMatrix', { type: 'saturate', values: '0', in: 'rumore', result: 'grigio' }),
    el(
      'feComponentTransfer',
      { in: 'grigio', result: 'contrasto' },
      el('feFuncA', { type: 'linear', slope: '0.55', intercept: '0' }),
    ),
  ].join(''));
}

/** Sfocatura gaussiana riutilizzabile. */
export function blurFilter(id: string, deviation: number, margin = 40): string {
  return el(
    'filter',
    {
      id,
      x: `-${f(margin)}%`,
      y: `-${f(margin)}%`,
      width: `${f(100 + margin * 2)}%`,
      height: `${f(100 + margin * 2)}%`,
    },
    el('feGaussianBlur', { stdDeviation: f(deviation) }),
  );
}

/** Alone caldo: sfocatura + composizione additiva. */
export function glowFilter(id: string, deviation: number, color: string): string {
  return el('filter', { id, x: '-60%', y: '-60%', width: '220%', height: '220%' }, [
    el('feGaussianBlur', { stdDeviation: f(deviation), result: 'sfocato' }),
    el('feFlood', { 'flood-color': color, 'flood-opacity': '0.85', result: 'tinta' }),
    el('feComposite', { in: 'tinta', in2: 'sfocato', operator: 'in', result: 'alone' }),
    el('feMerge', {}, [el('feMergeNode', { in: 'alone' }), el('feMergeNode', { in: 'SourceGraphic' })].join('')),
  ].join(''));
}

/** Marmo procedurale: turbolenza + spostamento, tinta chiara. */
export function marbleFilter(id: string, seed = 11): string {
  return el('filter', { id, x: '0%', y: '0%', width: '100%', height: '100%' }, [
    el('feTurbulence', {
      type: 'fractalNoise',
      baseFrequency: '0.012 0.06',
      numOctaves: 5,
      seed,
      result: 'vene',
    }),
    el('feDisplacementMap', {
      in: 'SourceGraphic',
      in2: 'vene',
      scale: '18',
      xChannelSelector: 'R',
      yChannelSelector: 'G',
    }),
  ].join(''));
}

export interface PatternOptions {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly transform?: string;
}

export function pattern(options: PatternOptions, body: string): string {
  return el(
    'pattern',
    {
      id: options.id,
      width: options.width,
      height: options.height,
      patternUnits: 'userSpaceOnUse',
      patternTransform: options.transform,
    },
    body,
  );
}

/* ------------------------------------------------------------------ */
/* Geometria                                                           */
/* ------------------------------------------------------------------ */

export type Point = readonly [number, number];

export function polyPath(points: readonly Point[], close = true): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const head = `M ${f(first![0])} ${f(first![1])}`;
  const tail = rest.map((p) => `L ${f(p[0])} ${f(p[1])}`).join(' ');
  return `${head} ${tail}${close ? ' Z' : ''}`;
}

/** Rettangolo con angoli tagliati a 45° — la firma geometrica del gioco. */
export function cutCornerPath(
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number,
  corners: { tl?: boolean; tr?: boolean; br?: boolean; bl?: boolean } = {},
): string {
  const { tl = true, tr = true, br = true, bl = true } = corners;
  const pts: Point[] = [];
  pts.push([x + (tl ? cut : 0), y]);
  pts.push([x + w - (tr ? cut : 0), y]);
  if (tr) pts.push([x + w, y + cut]);
  pts.push([x + w, y + h - (br ? cut : 0)]);
  if (br) pts.push([x + w - cut, y + h]);
  pts.push([x + (bl ? cut : 0), y + h]);
  if (bl) pts.push([x, y + h - cut]);
  pts.push([x, y + (tl ? cut : 0)]);
  return polyPath(pts, true);
}

/** Arco ellittico come path (utile per archi delle sopracciglia e bocche). */
export function arcPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startDeg: number,
  endDeg: number,
): string {
  const rad = (d: number): number => (d * Math.PI) / 180;
  const x1 = cx + rx * Math.cos(rad(startDeg));
  const y1 = cy + ry * Math.sin(rad(startDeg));
  const x2 = cx + rx * Math.cos(rad(endDeg));
  const y2 = cy + ry * Math.sin(rad(endDeg));
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${f(x1)} ${f(y1)} A ${f(rx)} ${f(ry)} 0 ${large} ${sweep} ${f(x2)} ${f(y2)}`;
}

/** Stella/raggiera a n punte, come path chiuso. */
export function starPath(cx: number, cy: number, outer: number, inner: number, points: number): string {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return polyPath(pts, true);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
