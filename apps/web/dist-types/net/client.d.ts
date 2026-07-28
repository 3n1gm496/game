import { type ClientMessage, type ServerMessage } from '@meridien/engine';
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
export declare function loadSession(): StoredSession | null;
export declare function saveSession(session: Omit<StoredSession, 'at'>): void;
export declare function clearSession(): void;
export declare function serverUrl(): string;
export interface ClientEvents {
    onMessage(msg: ServerMessage): void;
    onStatus(status: ConnectionStatus): void;
    onLatency(ms: number): void;
}
export declare class MeridienClient {
    private readonly events;
    private socket;
    private queue;
    private attempt;
    private reconnectTimer;
    private pingTimer;
    private closedByUser;
    status: ConnectionStatus;
    latency: number;
    messagesReceived: number;
    messagesSent: number;
    constructor(events: ClientEvents);
    connect(): void;
    private scheduleReconnect;
    private startPing;
    private stopPing;
    send(msg: ClientMessage): void;
    private rawSend;
    /** Riporta la connessione online subito (ritorno dall'app switcher). */
    wake(): void;
    close(): void;
    private setStatus;
}
/** Identificativo d'azione per l'idempotenza lato server. */
export declare function actionId(): string;
//# sourceMappingURL=client.d.ts.map