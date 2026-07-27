import { z } from 'zod';

/**
 * Schemi rigorosi per ogni risposta del Regista AI.
 * Nessuna risposta entra in partita senza passare da qui: se la validazione
 * fallisce, il provider deterministico prende il posto senza rompere nulla.
 */

export const WitnessAnswerSchema = z.object({
  /** argomento riconosciuto fra quelli ammessi nel contesto */
  topic: z.string().min(1).max(40),
  /** la battuta, riscritta con la voce del personaggio */
  answer: z.string().min(4).max(340),
  /** true se il testimone non sa rispondere: non deve inventare */
  evasive: z.boolean().default(false),
});
export type WitnessAnswer = z.infer<typeof WitnessAnswerSchema>;

export const ButlerLineSchema = z.object({
  line: z.string().min(4).max(240),
});
export type ButlerLine = z.infer<typeof ButlerLineSchema>;

export const RecapSchema = z.object({
  summary: z.string().min(20).max(700),
  openQuestions: z.array(z.string().min(4).max(140)).max(3).default([]),
});
export type Recap = z.infer<typeof RecapSchema>;

export const HintSchema = z.object({
  /** un suggerimento su *dove guardare*, mai la soluzione */
  hint: z.string().min(10).max(240),
});
export type Hint = z.infer<typeof HintSchema>;

export const EpilogueSchema = z.object({
  text: z.string().min(40).max(900),
  /** titoli ironici per i momenti memorabili */
  titles: z.array(z.object({ label: z.string().min(3).max(48), about: z.string().min(2).max(48) })).max(4).default([]),
});
export type Epilogue = z.infer<typeof EpilogueSchema>;

/** Termini che una risposta AI non può mai contenere: la verità non passa di qui. */
export const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bil colpevole è\b/i,
  /\bl'assassino è\b/i,
  /\bè stato lui\b/i,
  /\bè stata lei\b/i,
  /\bha ucciso\b/i,
  /\bha avvelenato\b/i,
  /\bsoluzione del caso\b/i,
  /\bsystem prompt\b/i,
  /\bistruzioni di sistema\b/i,
  /\bapi[_ ]?key\b/i,
  /\bsk-[a-z0-9-]{10,}/i,
];

export function violatesGuardrails(text: string): string | null {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) return pattern.source;
  }
  return null;
}

/**
 * Neutralizza le istruzioni contenute nel testo di un giocatore prima di
 * inserirlo in un prompt: nessuna riga può cambiare le regole del Regista.
 */
export function sanitizeUserText(raw: string, maxLength = 200): string {
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029]/g, ' ')
    .replace(/```/g, "'''")
    .replace(/<\/?[a-z_][\w-]*>/gi, ' ')
    .replace(
      /\b(ignora|dimentica|scarta)\s+(tutte\s+)?(le\s+)?(istruzioni|regole|indicazioni)\b/gi,
      '[richiesta rimossa]',
    )
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous\s+)?(instructions|rules|prompts)\b/gi, '[removed]')
    .replace(/\b(system|assistant|developer)\s*:/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}
