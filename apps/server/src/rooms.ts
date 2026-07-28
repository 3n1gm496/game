import { randomBytes, randomUUID } from 'node:crypto';
import {
  ERROR_TEXT,
  PROTOCOL_VERSION,
  RoomRuntime,
  createRoomState,
  generateRoomCode,
  generateSeed,
  isValidRoomCode,
  type ClientMessage,
  type ContentLibrary,
  type Effect,
  type ErrorCode,
  type RoomSettings,
  type RoomState,
  type ServerMessage,
} from '@meridien/engine';
import type { AiDirector } from '@meridien/ai';
import { SERVER_VERSION } from './config.js';
import type { Logger } from './log.js';

/**
 * Registro delle stanze e collante fra il runtime puro e la rete.
 *
 * Il runtime non sa nulla di socket: restituisce effetti, e questo modulo li
 * esegue. Così la stessa logica gira identica nei test, nelle simulazioni e
 * (con un adattatore di trasporto) su un Durable Object.
 */

export interface Connection {
  id: string;
  playerId: string | null;
  roomCode: string | null;
  send(msg: ServerMessage): void;
  close(code: number, reason: string): void;
  remoteAddress: string;
  lastPongAt: number;
}

export interface RoomEntry {
  runtime: RoomRuntime;
  state: RoomState;
  connections: Map<string, Connection>;
  timer: NodeJS.Timeout | null;
}

export interface RegistryOptions {
  content: ContentLibrary;
  director: AiDirector;
  logger: Logger;
  maxRooms: number;
  idleMinutes: number;
  maxHours: number;
  now?: () => number;
}

export const DEFAULT_SETTINGS = (caseId: string): RoomSettings => ({
  caseId,
  variantId: null,
  seed: generateSeed(),
  mode: 'competitiva',
  timers: 'normale',
  aiDirector: true,
  hints: true,
  spectators: true,
});

export class RoomRegistry {
  private rooms = new Map<string, RoomEntry>();
  private sessions = new Map<string, { code: string; playerId: string }>();
  private readonly now: () => number;
  private sweeper: NodeJS.Timeout | null = null;

  constructor(private readonly opts: RegistryOptions) {
    this.now = opts.now ?? Date.now;
  }

  get size(): number {
    return this.rooms.size;
  }

  get playerCount(): number {
    let n = 0;
    for (const room of this.rooms.values()) n += room.connections.size;
    return n;
  }

  start(): void {
    if (this.sweeper) return;
    this.sweeper = setInterval(() => this.sweep(), 15_000);
    this.sweeper.unref?.();
  }

  stop(): void {
    if (this.sweeper) clearInterval(this.sweeper);
    this.sweeper = null;
    for (const room of this.rooms.values()) {
      if (room.timer) clearInterval(room.timer);
      room.timer = null;
    }
    this.rooms.clear();
    this.sessions.clear();
  }

  get(code: string): RoomEntry | undefined {
    return this.rooms.get(code);
  }

  list(): { code: string; phase: string; players: number; createdAt: number }[] {
    return [...this.rooms.values()].map((r) => ({
      code: r.state.code,
      phase: r.state.phase,
      players: r.state.playerOrder.length,
      createdAt: r.state.createdAt,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Creazione e ingresso
  // ───────────────────────────────────────────────────────────────────────────

  createRoom(settings?: Partial<RoomSettings>): RoomEntry | { error: ErrorCode } {
    if (this.rooms.size >= this.opts.maxRooms) return { error: 'internal' };
    const defaultCase = this.opts.content.listPublic()[0]?.id;
    if (!defaultCase) throw new Error('nessun caso disponibile');

    let code = generateRoomCode();
    let attempts = 0;
    while (this.rooms.has(code)) {
      code = generateRoomCode();
      attempts += 1;
      if (attempts > 64) return { error: 'internal' };
    }

    const merged: RoomSettings = { ...DEFAULT_SETTINGS(defaultCase), ...settings };
    if (!this.opts.content.getCase(merged.caseId)) merged.caseId = defaultCase;

    const state = createRoomState({ id: randomUUID(), code, now: this.now(), settings: merged });
    const runtime = new RoomRuntime({
      state,
      content: this.opts.content,
      now: this.now,
      newId: () => randomUUID().slice(0, 12),
    });
    const entry: RoomEntry = { runtime, state, connections: new Map(), timer: null };
    entry.timer = setInterval(() => this.tickRoom(entry), 1000);
    entry.timer.unref?.();
    this.rooms.set(code, entry);
    this.opts.logger.info('room-created', { code, caseId: merged.caseId, seed: merged.seed });
    return entry;
  }

  join(
    connection: Connection,
    code: string,
    nickname: string,
    avatar: string,
    asSpectator: boolean,
  ): { ok: true; playerId: string; sessionToken: string } | { ok: false; error: ErrorCode } {
    if (!isValidRoomCode(code)) return { ok: false, error: 'room-not-found' };
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'room-not-found' };

    const sessionToken = randomBytes(24).toString('base64url');
    const result = room.runtime.addPlayer(nickname, avatar, sessionToken, asSpectator);
    if (!result.playerId) return { ok: false, error: result.error ?? 'internal' };

    connection.playerId = result.playerId;
    connection.roomCode = code;
    room.connections.set(result.playerId, connection);
    this.sessions.set(sessionToken, { code, playerId: result.playerId });

    connection.send({ t: 'joined', playerId: result.playerId, sessionToken, code });
    this.apply(room, room.runtime.sendFullTo(result.playerId));
    this.apply(room, result.effects);
    return { ok: true, playerId: result.playerId, sessionToken };
  }

  resume(
    connection: Connection,
    code: string,
    sessionToken: string,
  ): { ok: true; playerId: string } | { ok: false; error: ErrorCode } {
    const session = this.sessions.get(sessionToken);
    if (!session || session.code !== code) return { ok: false, error: 'session-invalid' };
    const room = this.rooms.get(code);
    if (!room) return { ok: false, error: 'room-not-found' };
    const player = room.state.players[session.playerId];
    if (!player) return { ok: false, error: 'session-invalid' };

    // una sola connessione per giocatore: la precedente viene chiusa
    const previous = room.connections.get(session.playerId);
    if (previous && previous.id !== connection.id) {
      previous.playerId = null;
      previous.close(4001, 'sessione ripresa da un altro dispositivo');
    }

    connection.playerId = session.playerId;
    connection.roomCode = code;
    room.connections.set(session.playerId, connection);
    connection.send({ t: 'joined', playerId: session.playerId, sessionToken, code });
    this.apply(room, room.runtime.reconnect(session.playerId));
    return { ok: true, playerId: session.playerId };
  }

  handle(connection: Connection, msg: ClientMessage): void {
    if (!connection.roomCode || !connection.playerId) {
      connection.send({ t: 'error', code: 'session-invalid', message: ERROR_TEXT['session-invalid'], fatal: false });
      return;
    }
    const room = this.rooms.get(connection.roomCode);
    if (!room) {
      connection.send({ t: 'error', code: 'room-not-found', message: ERROR_TEXT['room-not-found'], fatal: true });
      return;
    }
    try {
      this.apply(room, room.runtime.handle(connection.playerId, msg));
    } catch (error) {
      this.opts.logger.error('handler-failed', {
        code: room.state.code,
        type: msg.t,
        message: error instanceof Error ? error.message : String(error),
      });
      connection.send({ t: 'error', code: 'internal', message: ERROR_TEXT.internal, fatal: false });
    }
  }

  disconnect(connection: Connection): void {
    if (!connection.roomCode || !connection.playerId) return;
    const room = this.rooms.get(connection.roomCode);
    if (!room) return;
    const current = room.connections.get(connection.playerId);
    if (current && current.id !== connection.id) return; // sostituita da una nuova
    room.connections.delete(connection.playerId);
    this.apply(room, room.runtime.disconnect(connection.playerId));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Effetti
  // ───────────────────────────────────────────────────────────────────────────

  apply(room: RoomEntry, effects: readonly Effect[]): void {
    for (const effect of effects) {
      switch (effect.kind) {
        case 'broadcast': {
          const exclude = new Set(effect.exclude ?? []);
          for (const [playerId, conn] of room.connections) {
            if (exclude.has(playerId)) continue;
            conn.send(effect.msg);
          }
          break;
        }
        case 'direct': {
          room.connections.get(effect.playerId)?.send(effect.msg);
          break;
        }
        case 'log':
          this.opts.logger[effect.level](effect.event, effect.data);
          break;
        case 'ai':
          void this.runAi(room, effect);
          break;
        case 'close':
          this.closeRoom(room.state.code, effect.reason);
          break;
        default:
          break;
      }
    }
  }

  private async runAi(room: RoomEntry, effect: Extract<Effect, { kind: 'ai' }>): Promise<void> {
    try {
      const outcome = await this.opts.director.respond(effect.request);
      const payload =
        effect.request.kind === 'witness'
          ? {
              kind: 'witness' as const,
              witnessId: effect.request.witnessId,
              witnessName: effect.request.witnessName,
              question: effect.request.question,
              answer: outcome.text,
              provider: outcome.provider,
            }
          : effect.request.kind === 'epilogue'
            ? { kind: 'epilogue' as const, text: outcome.text, provider: outcome.provider }
            : { kind: effect.request.kind, text: outcome.text, provider: outcome.provider };
      this.apply(room, room.runtime.injectAiResult(effect.requestId, payload));
    } catch (error) {
      this.opts.logger.warn('ai-failed', {
        code: room.state.code,
        kind: effect.request.kind,
        message: error instanceof Error ? error.message : String(error),
      });
      // il Regista deterministico è già il fallback interno di AiDirector:
      // se anche quello fallisce la partita prosegue senza il commento
    }
  }

  private tickRoom(room: RoomEntry): void {
    try {
      this.apply(room, room.runtime.tick());
    } catch (error) {
      this.opts.logger.error('tick-failed', {
        code: room.state.code,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  closeRoom(code: string, reason: string): void {
    const room = this.rooms.get(code);
    if (!room) return;
    for (const conn of room.connections.values()) {
      conn.send({ t: 'roomClosed', reason });
      conn.close(4000, reason);
    }
    if (room.timer) clearInterval(room.timer);
    for (const [token, session] of this.sessions) {
      if (session.code === code) this.sessions.delete(token);
    }
    this.rooms.delete(code);
    this.opts.logger.info('room-closed', { code, reason });
  }

  /** Chiude le stanze inattive e quelle troppo vecchie. */
  sweep(): void {
    const t = this.now();
    const idleMs = this.opts.idleMinutes * 60_000;
    const maxMs = this.opts.maxHours * 3_600_000;
    for (const [code, room] of this.rooms) {
      const noConnections = room.connections.size === 0;
      const idle = t - room.state.lastActivityAt > idleMs;
      const old = t - room.state.createdAt > maxMs;
      if ((noConnections && idle) || old) {
        this.closeRoom(code, old ? 'La stanza ha raggiunto la durata massima.' : 'La stanza è rimasta vuota.');
      }
    }
  }

  welcomeMessage(): ServerMessage {
    return {
      t: 'welcome',
      protocol: PROTOCOL_VERSION,
      serverVersion: SERVER_VERSION,
      cases: this.opts.content.listPublic(),
    };
  }
}
