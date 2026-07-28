import type { AiRequest } from '@meridien/engine';

/**
 * Interfaccia del Regista AI.
 *
 * Il Regista non decide nulla: riceve un contesto già ristretto dal server e
 * restituisce testo. Ogni risposta passa dal guardrail prima di entrare in
 * partita, e ogni errore ricade sul provider deterministico.
 */

export interface AiOutcome {
  text: string;
  /** argomento riconosciuto (solo per i testimoni) */
  topic?: string;
  /** true quando il testimone non ha nulla da dire su quell'argomento */
  evasive?: boolean;
  provider: string;
}

export interface AIProvider {
  readonly name: string;
  /** true se il provider è utilizzabile in questo processo */
  isAvailable(): boolean;
  respond(request: AiRequest, signal?: AbortSignal): Promise<AiOutcome>;
}

export interface ProviderConfig {
  provider: 'deterministic' | 'anthropic' | 'openai-compatible' | 'on-device-apple';
  /** letta da process.env sul server, mai dal client */
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  temperature?: number;
}

export const DEFAULT_TIMEOUT_MS = 6_000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 320;

export type AiRequestKind = AiRequest['kind'];
