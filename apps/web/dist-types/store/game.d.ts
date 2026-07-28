import type { ClientMessage, PrivateBrief, PrivateStateView, PublicCase, PublicRoomState } from '@meridien/engine';
import { MeridienClient, type ConnectionStatus } from '../net/client.js';
/**
 * Specchio in sola lettura dello stato di partita.
 * Il client non calcola nulla che conti: riceve lo stato dal server e lo
 * mostra. Le uniche cose che vivono solo qui sono le preferenze locali
 * (audio, accessibilità) e le note non ancora inviate.
 */
export type Screen = 'apertura' | 'tutorial' | 'atrio' | 'ingresso' | 'lobby' | 'dossier' | 'partita' | 'accusa' | 'verdetto' | 'epilogo' | 'punteggi';
export interface Toast {
    id: string;
    kind: 'info' | 'indizio' | 'errore' | 'evento';
    title: string;
    text: string;
    at: number;
}
export interface PuzzlePrompt {
    clueId: string;
    kind: string;
    prompt: string;
    options: string[];
    hint: string;
}
export interface WitnessExchange {
    witnessId: string;
    witnessName: string;
    question: string;
    answer: string;
    at: number;
}
export interface GameStore {
    client: MeridienClient | null;
    status: ConnectionStatus;
    latency: number;
    serverVersion: string;
    screen: Screen;
    tutorialSeen: boolean;
    playerId: string | null;
    nickname: string;
    avatar: string;
    cases: PublicCase[];
    room: PublicRoomState | null;
    brief: PrivateBrief | null;
    privateView: PrivateStateView | null;
    verdict: unknown | null;
    scores: unknown | null;
    reconstruction: unknown[];
    toasts: Toast[];
    puzzle: PuzzlePrompt | null;
    witnessLog: WitnessExchange[];
    directorLines: {
        kind: string;
        text: string;
        at: number;
    }[];
    lastError: string | null;
    currentLocationId: string | null;
    noteDraft: string;
    init(): void;
    send(msg: ClientMessage): void;
    act(msg: Omit<ClientMessage & {
        actionId: string;
    }, 'actionId'>): void;
    setScreen(screen: Screen): void;
    setProfile(nickname: string, avatar: string): void;
    createRoom(caseId: string): void;
    joinRoom(code: string, asSpectator?: boolean): void;
    leaveRoom(): void;
    dismissToast(id: string): void;
    dismissPuzzle(): void;
    setNoteDraft(text: string): void;
    setLocation(id: string): void;
    markTutorialSeen(): void;
}
export declare const useGame: import("zustand").UseBoundStore<import("zustand").StoreApi<GameStore>>;
//# sourceMappingURL=game.d.ts.map