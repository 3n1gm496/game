import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  ClientMessageSchema,
  ERROR_TEXT,
  PROTOCOL_VERSION,
  normalizeRoomCode,
  type ErrorCode,
  type ServerMessage,
} from '@meridien/engine';
import { contentLibrary } from '@meridien/content';
import { AiDirector, directorFromEnv } from '@meridien/ai';
import { SERVER_VERSION, loadConfig } from './config.js';
import { createLogger } from './log.js';
import { createRequestHandler } from './http.js';
import { RoomRegistry, type Connection } from './rooms.js';
import { ACTION_COST, DEFAULT_ACTION_COST, TEXT_FIELDS, TokenBucket, moderate } from './limits.js';

/**
 * Punto di ingresso del server MÉRIDIEN.
 * HTTP per health, metriche e build statica; WebSocket per la partita.
 */

const config = loadConfig();
const logger = createLogger(config.LOG_LEVEL);
const startedAt = Date.now();

const counters = { messages: 0, errors: 0, connections: 0, aiFallbacks: 0 };

const director = new AiDirector({
  ...directorFromEnv(process.env),
  onFallback: (info) => {
    counters.aiFallbacks += 1;
    logger.warn('ai-fallback', { kind: info.kind, provider: info.provider, reason: info.reason });
  },
});

const registry = new RoomRegistry({
  content: contentLibrary,
  director,
  logger,
  maxRooms: config.MAX_ROOMS,
  idleMinutes: config.ROOM_IDLE_MINUTES,
  maxHours: config.ROOM_MAX_HOURS,
});
registry.start();

const httpServer = createServer(createRequestHandler({ config, registry, startedAt, counters }));
const wss = new WebSocketServer({ server: httpServer, path: '/ws', maxPayload: 16 * 1024 });

/** Limiti per connessione e per indirizzo. */
const actionLimiter = new TokenBucket(30, 3);
const joinLimiter = new TokenBucket(10, 10 / 60);
const connectLimiter = new TokenBucket(20, 20 / 60);

setInterval(() => {
  actionLimiter.sweep();
  joinLimiter.sweep();
  connectLimiter.sweep();
}, 60_000).unref?.();

wss.on('connection', (socket: WebSocket, req) => {
  const address = normalizeAddress(req.socket.remoteAddress, req.headers['x-forwarded-for']);
  if (!connectLimiter.take(address)) {
    socket.close(4029, 'troppe connessioni');
    return;
  }

  counters.connections += 1;
  const connection: Connection = {
    id: randomUUID(),
    playerId: null,
    roomCode: null,
    remoteAddress: address,
    lastPongAt: Date.now(),
    send(msg: ServerMessage) {
      if (socket.readyState !== socket.OPEN) return;
      counters.messages += 1;
      socket.send(JSON.stringify(msg));
    },
    close(code: number, reason: string) {
      try {
        socket.close(code, reason);
      } catch {
        socket.terminate();
      }
    },
  };

  connection.send(registry.welcomeMessage());

  socket.on('pong', () => {
    connection.lastPongAt = Date.now();
  });

  socket.on('message', (raw) => {
    let parsedJson: unknown;
    try {
      const text = typeof raw === 'string' ? raw : raw.toString('utf8');
      if (text.length > 16 * 1024) throw new Error('messaggio troppo grande');
      parsedJson = JSON.parse(text);
    } catch {
      counters.errors += 1;
      fail(connection, 'bad-request');
      return;
    }

    const parsed = ClientMessageSchema.safeParse(parsedJson);
    if (!parsed.success) {
      counters.errors += 1;
      fail(connection, 'bad-request');
      return;
    }
    const msg = parsed.data;

    // frequenza
    const limiterKey = connection.playerId ?? `${address}:${connection.id}`;
    const cost = ACTION_COST[msg.t] ?? DEFAULT_ACTION_COST;
    if (cost > 0 && !actionLimiter.take(limiterKey, cost)) {
      fail(connection, 'rate-limited');
      return;
    }

    // moderazione dei campi testuali
    const fields = TEXT_FIELDS[msg.t] ?? [];
    for (const { field, max } of fields) {
      const record = msg as unknown as Record<string, unknown>;
      const value = record[field];
      if (typeof value !== 'string') continue;
      const result = moderate(value, max);
      if (!result.ok) {
        fail(connection, 'content-rejected');
        return;
      }
      record[field] = result.text;
    }

    switch (msg.t) {
      case 'hello': {
        if (msg.protocol !== PROTOCOL_VERSION) {
          connection.send({
            t: 'error',
            code: 'client-outdated',
            message: ERROR_TEXT['client-outdated'],
            fatal: true,
          });
          connection.close(4010, 'client obsoleto');
          return;
        }
        connection.send(registry.welcomeMessage());
        return;
      }

      case 'createRoom': {
        if (connection.roomCode) {
          fail(connection, 'already-done');
          return;
        }
        if (!joinLimiter.take(address, 2)) {
          fail(connection, 'rate-limited');
          return;
        }
        const created = registry.createRoom(msg.settings);
        if ('error' in created) {
          fail(connection, created.error);
          return;
        }
        const joined = registry.join(connection, created.state.code, msg.nickname, msg.avatar, false);
        if (!joined.ok) {
          fail(connection, joined.error);
          registry.closeRoom(created.state.code, 'creazione non riuscita');
        }
        return;
      }

      case 'joinRoom': {
        if (connection.roomCode) {
          fail(connection, 'already-done');
          return;
        }
        if (!joinLimiter.take(address)) {
          fail(connection, 'rate-limited');
          return;
        }
        const code = normalizeRoomCode(msg.code);
        const joined = registry.join(connection, code, msg.nickname, msg.avatar, msg.asSpectator);
        if (!joined.ok) fail(connection, joined.error);
        return;
      }

      case 'resume': {
        if (!joinLimiter.take(address)) {
          fail(connection, 'rate-limited');
          return;
        }
        const resumed = registry.resume(connection, normalizeRoomCode(msg.code), msg.sessionToken);
        if (!resumed.ok) fail(connection, resumed.error);
        return;
      }

      default:
        registry.handle(connection, msg);
    }
  });

  socket.on('close', () => {
    registry.disconnect(connection);
  });

  socket.on('error', (error) => {
    counters.errors += 1;
    logger.warn('socket-error', { message: error.message });
  });
});

/** Heartbeat: mantiene viva la connessione e rileva i socket morti. */
const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (socket.readyState !== socket.OPEN) continue;
    socket.ping();
  }
}, 25_000);
heartbeat.unref?.();

function fail(connection: Connection, code: ErrorCode): void {
  connection.send({ t: 'error', code, message: ERROR_TEXT[code], fatal: code === 'client-outdated' });
}

function normalizeAddress(remote: string | undefined, forwarded: string | string[] | undefined): string {
  const fwd = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = fwd?.split(',')[0]?.trim();
  return (first || remote || 'sconosciuto').replace(/^::ffff:/, '');
}

httpServer.listen(config.PORT, config.HOST, () => {
  logger.info('server-started', {
    version: SERVER_VERSION,
    protocol: PROTOCOL_VERSION,
    port: config.PORT,
    host: config.HOST,
    env: config.NODE_ENV,
    aiProvider: director.providerName,
    cases: contentLibrary.listPublic().length,
  });
  // riga leggibile per chi avvia a mano
  console.log(`\n  MÉRIDIEN · server pronto su http://localhost:${config.PORT}`);
  console.log(`  WebSocket: ws://localhost:${config.PORT}/ws`);
  console.log(`  Regista AI: ${director.providerName}\n`);
});

function shutdown(signal: string): void {
  logger.info('server-stopping', { signal });
  clearInterval(heartbeat);
  registry.stop();
  wss.close();
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref?.();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
