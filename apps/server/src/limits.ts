/**
 * Limitazione di frequenza e moderazione minima.
 * Il server non si fida del client: ogni azione costa gettoni e ogni testo
 * passa da un filtro di lunghezza e di contenuto.
 */

export interface Bucket {
  tokens: number;
  updatedAt: number;
}

export class TokenBucket {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly capacity: number,
    private readonly refillPerSecond: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Consuma un gettone; false se la richiesta va rifiutata. */
  take(key: string, cost = 1): boolean {
    const t = this.now();
    const bucket = this.buckets.get(key) ?? { tokens: this.capacity, updatedAt: t };
    const elapsed = (t - bucket.updatedAt) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillPerSecond);
    bucket.updatedAt = t;
    if (bucket.tokens < cost) {
      this.buckets.set(key, bucket);
      return false;
    }
    bucket.tokens -= cost;
    this.buckets.set(key, bucket);
    return true;
  }

  forget(key: string): void {
    this.buckets.delete(key);
  }

  /** Rimuove i secchi inattivi: evita che la mappa cresca all'infinito. */
  sweep(maxAgeMs = 10 * 60_000): void {
    const t = this.now();
    for (const [key, bucket] of this.buckets) {
      if (t - bucket.updatedAt > maxAgeMs) this.buckets.delete(key);
    }
  }

  get size(): number {
    return this.buckets.size;
  }
}

/** Costo in gettoni per tipo di messaggio. */
export const ACTION_COST: Record<string, number> = {
  ping: 0,
  saveNote: 1,
  enterLocation: 1,
  privateMessage: 4,
  publicQuestion: 4,
  askWitness: 6,
  requestHint: 8,
  requestRecap: 8,
  investigate: 2,
  createRoom: 6,
  joinRoom: 3,
};

export const DEFAULT_ACTION_COST = 1;

/**
 * Filtro minimo dei contenuti: lunghezza, ripetizioni e una lista breve di
 * termini che non vogliamo trasmettere. Non è una moderazione morale: serve a
 * impedire che la chat diventi un veicolo di insulti o di spam.
 */
const BLOCKED = [
  'negr', 'froci', 'fròci', 'ricchion', 'terron', 'zingar', 'ebrei di merda',
  'nigger', 'faggot', 'retard', 'kys', 'ammazzati',
  'http://', 'https://', 'www.',
];

export interface ModerationResult {
  ok: boolean;
  text: string;
  reason?: string;
}

export function moderate(raw: string, maxLength: number): ModerationResult {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length === 0) return { ok: false, text: '', reason: 'vuoto' };
  if (text.length > maxLength) return { ok: false, text: '', reason: 'troppo lungo' };

  const lower = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const term of BLOCKED) {
    if (lower.includes(term)) return { ok: false, text: '', reason: 'termine non ammesso' };
  }
  // spam: stessa lettera ripetuta molte volte, o messaggio tutto maiuscolo e lungo
  if (/(.)\1{9,}/.test(text)) return { ok: false, text: '', reason: 'ripetizione' };
  if (text.length > 24 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return { ok: true, text: text.charAt(0) + text.slice(1).toLowerCase() };
  }
  return { ok: true, text };
}

/** Campi testuali soggetti a moderazione, con il rispettivo limite. */
export const TEXT_FIELDS: Record<string, { field: string; max: number }[]> = {
  privateMessage: [{ field: 'text', max: 140 }],
  publicQuestion: [{ field: 'question', max: 160 }],
  answerQuestion: [{ field: 'answer', max: 200 }],
  askWitness: [{ field: 'question', max: 160 }],
  pinToBoard: [{ field: 'text', max: 180 }],
  createRoom: [{ field: 'nickname', max: 18 }],
  joinRoom: [{ field: 'nickname', max: 18 }],
  setProfile: [{ field: 'nickname', max: 18 }],
};
