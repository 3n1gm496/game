import { z } from 'zod';

/**
 * Configurazione del server. Tutto arriva da variabili d'ambiente,
 * nessun segreto è mai scritto nel repository. Vedi `.env.example`.
 */

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'preview', 'production', 'test']).default('development'),
  /** cartella della build statica del client; se assente il server fa solo da API */
  STATIC_DIR: z.string().default('../web/dist'),
  /** origini ammesse; vuoto = stessa origine */
  ALLOWED_ORIGINS: z.string().default(''),
  /** token facoltativo per /metrics */
  METRICS_TOKEN: z.string().default(''),
  /** minuti di inattività dopo i quali una stanza viene chiusa */
  ROOM_IDLE_MINUTES: z.coerce.number().int().min(1).max(240).default(20),
  /** durata massima di una stanza in ore */
  ROOM_MAX_HOURS: z.coerce.number().min(0.5).max(24).default(3),
  MAX_ROOMS: z.coerce.number().int().min(1).max(10_000).default(500),
  /** disattiva il Regista esterno anche se configurato */
  MERIDIEN_AI_ENABLED: z.string().default('true'),
  MERIDIEN_AI_PROVIDER: z.string().default('deterministic'),
  MERIDIEN_AI_BASE_URL: z.string().optional(),
  MERIDIEN_AI_MODEL: z.string().optional(),
  MERIDIEN_AI_TIMEOUT_MS: z.coerce.number().int().min(500).max(30_000).default(6000),
  MERIDIEN_AI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  /** raccolta anonima disattivata per impostazione predefinita */
  ANALYTICS_ENABLED: z.string().default('false'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type ServerConfig = z.infer<typeof EnvSchema> & {
  allowedOrigins: string[];
  isProduction: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const parsed = EnvSchema.parse(env);
  return {
    ...parsed,
    allowedOrigins: parsed.ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    isProduction: parsed.NODE_ENV === 'production',
  };
}

export const SERVER_VERSION = '1.0.0';

/**
 * Content Security Policy. Nessuna risorsa remota: gli asset sono tutti nel
 * bundle, quindi la policy può essere restrittiva senza compromessi.
 */
export function cspHeader(isProduction: boolean): string {
  const scriptSrc = isProduction ? "'self'" : "'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "media-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}
