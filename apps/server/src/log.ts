/**
 * Log strutturati in JSON, senza segreti.
 * Ogni valore che assomiglia a una chiave o a un token viene oscurato prima
 * di essere scritto: è la difesa contro le fughe accidentali nei log.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SECRET_KEYS = /^(.*(key|token|secret|password|authorization|cookie).*)$/i;
const SECRET_VALUE = /(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]{8,})/g;

export interface Logger {
  debug(event: string, data?: Record<string, unknown>): void;
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
}

export function createLogger(level: LogLevel = 'info', sink: (line: string) => void = console.log): Logger {
  const min = LEVELS[level];
  const write = (lvl: LogLevel, event: string, data?: Record<string, unknown>): void => {
    if (LEVELS[lvl] < min) return;
    const payload = {
      ts: new Date().toISOString(),
      level: lvl,
      event,
      ...redact(data ?? {}),
    };
    sink(JSON.stringify(payload));
  };
  return {
    debug: (e, d) => write('debug', e, d),
    info: (e, d) => write('info', e, d),
    warn: (e, d) => write('warn', e, d),
    error: (e, d) => write('error', e, d),
  };
}

export function redact(input: Record<string, unknown>, depth = 0): Record<string, unknown> {
  if (depth > 4) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SECRET_KEYS.test(key)) {
      out[key] = '[oscurato]';
      continue;
    }
    if (typeof value === 'string') {
      out[key] = value.replace(SECRET_VALUE, '[oscurato]').slice(0, 500);
    } else if (Array.isArray(value)) {
      out[key] = value.slice(0, 20).map((v) => (typeof v === 'string' ? v.slice(0, 120) : v));
    } else if (value && typeof value === 'object') {
      out[key] = redact(value as Record<string, unknown>, depth + 1);
    } else {
      out[key] = value;
    }
  }
  return out;
}
