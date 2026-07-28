import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { PROTOCOL_VERSION } from '@meridien/engine';
import { SERVER_VERSION, cspHeader, type ServerConfig } from './config.js';
import type { RoomRegistry } from './rooms.js';

/**
 * Servizio HTTP: health, metriche e file statici della build web.
 * Nessun endpoint espone lo stato di una partita: tutto passa dal WebSocket,
 * dove l'identità è verificata.
 */

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

export interface HttpDeps {
  config: ServerConfig;
  registry: RoomRegistry;
  startedAt: number;
  counters: { messages: number; errors: number; connections: number; aiFallbacks: number };
}

export function createRequestHandler(deps: HttpDeps) {
  const staticRoot = resolve(process.cwd(), deps.config.STATIC_DIR);
  const hasStatic = existsSync(staticRoot);

  return function handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    securityHeaders(res, deps.config);

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      send(res, 405, 'text/plain; charset=utf-8', 'Metodo non ammesso');
      return;
    }

    if (url.pathname === '/health') {
      send(
        res,
        200,
        MIME['.json']!,
        JSON.stringify({
          status: 'ok',
          version: SERVER_VERSION,
          protocol: PROTOCOL_VERSION,
          uptimeSeconds: Math.round((Date.now() - deps.startedAt) / 1000),
          rooms: deps.registry.size,
          players: deps.registry.playerCount,
          staticBuild: hasStatic,
        }),
      );
      return;
    }

    if (url.pathname === '/metrics') {
      const token = deps.config.METRICS_TOKEN;
      if (token && url.searchParams.get('token') !== token) {
        send(res, 401, 'text/plain; charset=utf-8', 'Non autorizzato');
        return;
      }
      const lines = [
        `meridien_rooms ${deps.registry.size}`,
        `meridien_players ${deps.registry.playerCount}`,
        `meridien_messages_total ${deps.counters.messages}`,
        `meridien_errors_total ${deps.counters.errors}`,
        `meridien_connections_total ${deps.counters.connections}`,
        `meridien_ai_fallbacks_total ${deps.counters.aiFallbacks}`,
        `meridien_uptime_seconds ${Math.round((Date.now() - deps.startedAt) / 1000)}`,
      ];
      send(res, 200, 'text/plain; charset=utf-8', `${lines.join('\n')}\n`);
      return;
    }

    if (!hasStatic) {
      send(
        res,
        404,
        'text/plain; charset=utf-8',
        'Build del client non presente. Esegui `pnpm build:web` e riavvia, oppure usa `pnpm dev:multiplayer`.',
      );
      return;
    }

    const filePath = safeJoin(staticRoot, decodeURIComponent(url.pathname));
    if (!filePath) {
      send(res, 403, 'text/plain; charset=utf-8', 'Percorso non ammesso');
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isFile()) {
      serveFile(res, filePath, req.method === 'HEAD');
      return;
    }

    // SPA: ogni altro percorso ricade su index.html
    const index = join(staticRoot, 'index.html');
    if (existsSync(index)) {
      serveFile(res, index, req.method === 'HEAD', 'no-cache');
      return;
    }
    send(res, 404, 'text/plain; charset=utf-8', 'Non trovato');
  };
}

function securityHeaders(res: ServerResponse, config: ServerConfig): void {
  res.setHeader('Content-Security-Policy', cspHeader(config.isProduction));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

function serveFile(res: ServerResponse, filePath: string, headOnly: boolean, cacheOverride?: string): void {
  const ext = extname(filePath).toLowerCase();
  const type = MIME[ext] ?? 'application/octet-stream';
  const immutable = /-[A-Za-z0-9_]{8,}\.(js|css|woff2|png|webp|svg)$/.test(filePath);
  res.setHeader('Content-Type', type);
  res.setHeader(
    'Cache-Control',
    cacheOverride ?? (immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300'),
  );
  if (filePath.endsWith('sw.js') || filePath.endsWith('service-worker.js')) {
    res.setHeader('Cache-Control', 'no-cache');
  }
  res.statusCode = 200;
  if (headOnly) {
    res.end();
    return;
  }
  createReadStream(filePath).pipe(res);
}

function send(res: ServerResponse, status: number, type: string, body: string): void {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

/** Impedisce l'attraversamento di percorso. */
export function safeJoin(root: string, pathname: string): string | null {
  const target = normalize(join(root, pathname));
  const rootWithSep = root.endsWith(sep) ? root : root + sep;
  if (target !== root && !target.startsWith(rootWithSep)) return null;
  return target;
}
