/**
 * RNG deterministico e portabile (identico su Node e nel browser).
 * xmur3 per l'hash del seed, sfc32 come generatore.
 * Nessuna dipendenza da Math.random: lo stesso seed produce sempre la stessa partita.
 */

export function xmur3(str: string): () => number {
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

export function sfc32(a: number, b: number, c: number, d: number): () => number {
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

export interface Rng {
  /** float in [0,1) */
  next(): number;
  /** intero in [min, max] inclusi */
  int(min: number, max: number): number;
  /** true con probabilità p */
  chance(p: number): boolean;
  /** elemento casuale (l'array non deve essere vuoto) */
  pick<T>(items: readonly T[]): T;
  /** n elementi distinti, ordine casuale */
  sample<T>(items: readonly T[], n: number): T[];
  /** nuovo array mescolato (Fisher–Yates) */
  shuffle<T>(items: readonly T[]): T[];
  /** elemento pesato */
  weighted<T>(items: readonly { value: T; weight: number }[]): T;
  /** RNG derivato, indipendente ma deterministico */
  fork(label: string): Rng;
  readonly seed: string;
}

export function createRng(seed: string): Rng {
  const hash = xmur3(seed);
  const gen = sfc32(hash(), hash(), hash(), hash());
  // scarto iniziale: migliora la decorrelazione fra seed simili
  for (let i = 0; i < 12; i += 1) gen();

  const rng: Rng = {
    seed,
    next: gen,
    int(min, max) {
      if (max < min) throw new RangeError(`int(${min}, ${max}): intervallo non valido`);
      return min + Math.floor(gen() * (max - min + 1));
    },
    chance(p) {
      return gen() < p;
    },
    pick(items) {
      if (items.length === 0) throw new RangeError('pick su array vuoto');
      return items[Math.floor(gen() * items.length)] as (typeof items)[number];
    },
    shuffle<T>(items: readonly T[]): T[] {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(gen() * (i + 1));
        const a = out[i]!;
        out[i] = out[j]!;
        out[j] = a;
      }
      return out;
    },
    sample(items, n) {
      return rng.shuffle(items).slice(0, Math.max(0, Math.min(n, items.length)));
    },
    weighted(items) {
      const total = items.reduce((sum, it) => sum + Math.max(0, it.weight), 0);
      if (total <= 0) throw new RangeError('weighted: peso totale nullo');
      let r = gen() * total;
      for (const it of items) {
        r -= Math.max(0, it.weight);
        if (r <= 0) return it.value;
      }
      return (items[items.length - 1] as (typeof items)[number]).value;
    },
    fork(label) {
      return createRng(`${seed}::${label}`);
    },
  };
  return rng;
}

/** Codici stanza: alfabeto senza caratteri ambigui (niente I, O, 0, 1). */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;

export function isValidRoomCode(code: string): boolean {
  if (code.length !== ROOM_CODE_LENGTH) return false;
  for (const ch of code) {
    if (!ROOM_CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

/**
 * Normalizza un codice digitato dall'utente: maiuscole, rimozione di spazi e
 * trattini, correzione dei confusi più comuni (O→0 non serve perché 0 non esiste,
 * quindi si converte nella lettera legittima).
 */
export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[\s-_.]/g, '')
    .replace(/0/g, 'Q')
    .replace(/O/g, 'Q')
    .replace(/1/g, 'L')
    .replace(/I/g, 'L')
    .slice(0, ROOM_CODE_LENGTH);
}

export function generateRoomCode(random: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    out += ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)];
  }
  return out;
}

/** Seed leggibile e condivisibile, es. "MERIDIEN-7K3QF". */
export function generateSeed(random: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += ROOM_CODE_ALPHABET[Math.floor(random() * ROOM_CODE_ALPHABET.length)];
  }
  return out;
}
