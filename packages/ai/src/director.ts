import type { AiRequest } from '@meridien/engine';
import type { AIProvider, AiOutcome, ProviderConfig } from './types.js';
import { DEFAULT_TIMEOUT_MS } from './types.js';
import { DeterministicNarrativeProvider } from './providers/deterministic.js';
import { AnthropicClaudeProvider } from './providers/anthropic.js';
import { OpenAICompatibleProvider } from './providers/openaiCompatible.js';
import { OnDeviceAppleProvider } from './providers/onDeviceApple.js';

/**
 * Il Regista AI.
 *
 * Tiene sempre due provider: quello scelto e quello deterministico.
 * Se il primo tarda, sbaglia forma, viola un guardrail o semplicemente non
 * c'è, il secondo risponde. Il giocatore non se ne accorge e la partita non
 * si interrompe mai per colpa di un modello.
 */

export interface DirectorOptions extends ProviderConfig {
  /** attiva/disattiva l'uso del provider esterno senza cambiare configurazione */
  enabled?: boolean;
  onFallback?: (info: { kind: string; provider: string; reason: string }) => void;
}

export interface DirectorStats {
  requests: number;
  fallbacks: number;
  failuresInARow: number;
  lastError: string | null;
  circuitOpenUntil: number;
}

/** Dopo tre errori consecutivi si smette di provare per un minuto. */
const CIRCUIT_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 60_000;

export class AiDirector {
  readonly primary: AIProvider;
  readonly fallback: AIProvider;
  private readonly enabled: boolean;
  private readonly timeoutMs: number;
  private readonly onFallback: DirectorOptions['onFallback'];
  private stats: DirectorStats = {
    requests: 0,
    fallbacks: 0,
    failuresInARow: 0,
    lastError: null,
    circuitOpenUntil: 0,
  };

  constructor(options: DirectorOptions, now: () => number = Date.now) {
    this.enabled = options.enabled !== false;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.onFallback = options.onFallback;
    this.fallback = new DeterministicNarrativeProvider();
    this.primary = createProvider(options);
    this.nowFn = now;
  }

  private readonly nowFn: () => number;

  getStats(): Readonly<DirectorStats> {
    return { ...this.stats };
  }

  get providerName(): string {
    return this.enabled && this.primary.isAvailable() ? this.primary.name : this.fallback.name;
  }

  async respond(request: AiRequest): Promise<AiOutcome> {
    this.stats.requests += 1;
    const usable =
      this.enabled &&
      this.primary.name !== this.fallback.name &&
      this.primary.isAvailable() &&
      this.nowFn() >= this.stats.circuitOpenUntil;

    if (!usable) {
      return this.fallback.respond(request);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const outcome = await this.primary.respond(request, controller.signal);
      this.stats.failuresInARow = 0;
      return outcome;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.stats.fallbacks += 1;
      this.stats.failuresInARow += 1;
      this.stats.lastError = reason;
      if (this.stats.failuresInARow >= CIRCUIT_THRESHOLD) {
        this.stats.circuitOpenUntil = this.nowFn() + CIRCUIT_COOLDOWN_MS;
        this.stats.failuresInARow = 0;
      }
      this.onFallback?.({ kind: request.kind, provider: this.primary.name, reason });
      return this.fallback.respond(request);
    } finally {
      clearTimeout(timer);
    }
  }
}

export function createProvider(config: ProviderConfig): AIProvider {
  switch (config.provider) {
    case 'anthropic':
      return new AnthropicClaudeProvider(config);
    case 'openai-compatible':
      return new OpenAICompatibleProvider(config);
    case 'on-device-apple':
      return new OnDeviceAppleProvider(config);
    case 'deterministic':
    default:
      return new DeterministicNarrativeProvider();
  }
}

/**
 * Configurazione del Regista dalle variabili d'ambiente del **server**.
 * Nessuna di queste variabili viene mai esposta al client.
 */
export function directorFromEnv(env: Record<string, string | undefined>): DirectorOptions {
  const requested = (env.MERIDIEN_AI_PROVIDER ?? 'deterministic').trim() as ProviderConfig['provider'];
  const known: ProviderConfig['provider'][] = ['deterministic', 'anthropic', 'openai-compatible', 'on-device-apple'];
  const provider = known.includes(requested) ? requested : 'deterministic';

  const apiKey =
    provider === 'anthropic' ? env.ANTHROPIC_API_KEY : provider === 'openai-compatible' ? env.MERIDIEN_AI_API_KEY : undefined;

  return {
    provider,
    ...(apiKey ? { apiKey } : {}),
    ...(env.MERIDIEN_AI_BASE_URL ? { baseUrl: env.MERIDIEN_AI_BASE_URL } : {}),
    ...(env.MERIDIEN_AI_MODEL ? { model: env.MERIDIEN_AI_MODEL } : {}),
    timeoutMs: Number(env.MERIDIEN_AI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
    enabled: env.MERIDIEN_AI_ENABLED !== 'false',
  };
}
