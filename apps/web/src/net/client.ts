import { PROTOCOL_VERSION, type ClientMessage, type ServerMessage } from '@meridien/engine';

/**
 * Connessione al server.
 *
 * Riconnessione con attesa crescente, coda dei messaggi mentre la linea è
 * caduta, ripresa della sessione con il token salvato, misura della latenza.
 * Nessuna logica di gioco vive qui: il client è un terminale, non un arbitro.
 */

export type ConnectionStatus = 'chiusa' | 'in-connessione' | 'aperta' | 'riconnessione' | 'obsoleta';

export interface StoredSession {
  code: string;
  token: string;
  playerId: string;
  at: number;
}

const SESSION_KEY = 'meridien.sessione';
const SESSION_TTL_MS = 4 * 3_600_000;

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.code || !parsed.token || Date.now() - parsed.at > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: Omit<StoredSession, 'at'>): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, at: Date.now() }));
  } catch {
    /* modalità privata o quota esaurita: la partita prosegue senza ripresa */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nulla da fare */
  }
}

export function serverUrl(): string {
  const explicit = new URLSearchParams(location.search).get('server');
  if (explicit) return explicit;
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

export interface ClientEvents {
  onMessage(msg: ServerMessage): void;
  onStatus(status: ConnectionStatus): void;
  onLatency(ms: number): void;
}

const BACKOFF_MS = [500, 1000, 2000, 4000, 8000, 15_000];

export class MeridienClient {
  private socket: WebSocket | null = null;
  private queue: ClientMessage[] = [];
  private attempt = 0;
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private closedByUser = false;
  status: ConnectionStatus = 'chiusa';
  latency = 0;
  messagesReceived = 0;
  messagesSent = 0;

  constructor(private readonly events: ClientEvents) {}

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.closedByUser = false;
    this.setStatus(this.attempt === 0 ? 'in-connessione' : 'riconnessione');

    let socket: WebSocket;
    try {
      socket = new WebSocket(serverUrl());
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;

    socket.onopen = () => {
      this.attempt = 0;
      this.setStatus('aperta');
      this.rawSend({ t: 'hello', protocol: PROTOCOL_VERSION, client: 'web' });
      const pending = this.queue;
      this.queue = [];
      for (const msg of pending) this.rawSend(msg);
      this.startPing();
    };

    socket.onmessage = (event) => {
      this.messagesReceived += 1;
      let msg: ServerMessage;
      try {
        msg = JSON.parse(String(event.data)) as ServerMessage;
      } catch {
        return;
      }
      if (msg.t === 'pong') {
        this.latency = Date.now() - msg.at;
        this.events.onLatency(this.latency);
        return;
      }
      if (msg.t === 'error' && msg.code === 'client-outdated') {
        this.closedByUser = true;
        this.setStatus('obsoleta');
      }
      this.events.onMessage(msg);
    };

    socket.onclose = () => {
      this.stopPing();
      this.socket = null;
      if (this.closedByUser) {
        this.setStatus(this.status === 'obsoleta' ? 'obsoleta' : 'chiusa');
        return;
      }
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      // `onclose` arriva comunque: la riconnessione è gestita lì
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    this.setStatus('riconnessione');
    const delay = BACKOFF_MS[Math.min(this.attempt, BACKOFF_MS.length - 1)] ?? 15_000;
    this.attempt += 1;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay + Math.random() * 250);
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = window.setInterval(() => {
      this.rawSend({ t: 'ping', at: Date.now() });
    }, 10_000);
  }

  private stopPing(): void {
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  send(msg: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.rawSend(msg);
      return;
    }
    // in coda: verrà inviato alla riapertura. La coda è limitata per non
    // accumulare azioni obsolete durante una disconnessione lunga.
    this.queue.push(msg);
    if (this.queue.length > 24) this.queue.shift();
    this.connect();
  }

  private rawSend(msg: ClientMessage): void {
    try {
      this.socket?.send(JSON.stringify(msg));
      this.messagesSent += 1;
    } catch {
      this.queue.push(msg);
    }
  }

  /** Riporta la connessione online subito (ritorno dall'app switcher). */
  wake(): void {
    if (this.status === 'aperta' || this.closedByUser) return;
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.attempt = 0;
    this.connect();
  }

  close(): void {
    this.closedByUser = true;
    this.stopPing();
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.socket?.close(1000, 'uscita');
    this.socket = null;
    this.setStatus('chiusa');
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.events.onStatus(status);
  }
}

/** Identificativo d'azione per l'idempotenza lato server. */
export function actionId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 16);
}
