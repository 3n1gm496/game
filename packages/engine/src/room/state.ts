import type { CaseDef, PublicCase, VariantDef } from '../schema/case.js';
import type {
  ChatEntry,
  Phase,
  PublicBoardItem,
  PublicQuestion,
  RoomSettings,
  ServerMessage,
} from '../schema/protocol.js';
import type { Assignment } from '../distribution.js';

export interface ContentLibrary {
  getCase(id: string): CaseDef | undefined;
  listPublic(): PublicCase[];
  allCases(): CaseDef[];
}

export interface InboxEntry {
  from: string;
  text: string;
  at: number;
}

export interface HeldClue {
  clueId: string;
  at: number;
  foundAt: string | null;
  shared: boolean;
}

export interface PlayerState {
  id: string;
  nickname: string;
  avatar: string;
  sessionToken: string;
  connected: boolean;
  joinedAt: number;
  lastSeen: number;
  ready: boolean;
  spectator: boolean;
  roleId: string | null;
  isCulprit: boolean;
  hand: HeldClue[];
  notes: string;
  inbox: InboxEntry[];
  declarationKey: 'verita' | 'omissione' | 'bugia' | null;
  declarationRefuted: boolean;
  contradictionsFound: string[];
  objectiveId: string | null;
  objectiveCompleted: boolean;
  abilityCharges: number;
  abilityUsedInActs: number[];
  privateMessagesLeft: number;
  publicQuestionsAsked: number;
  searchesLeft: number;
  hintsUsed: number;
  currentLocationId: string | null;
  visitedLocationIds: string[];
  accusation: {
    culpritRoleId: string;
    motiveKey: string;
    methodKey: string;
    sequence: string[];
    at: number;
  } | null;
  verdictVoteFor: string | null;
  /** finestra di idempotenza */
  recentActionIds: string[];
}

export interface BoardItem extends PublicBoardItem {
  /** nodi del grafo affermati dall'elemento, per il rilevamento contraddizioni */
  nodes: string[];
}

export interface AppliedEvent {
  id: string;
  at: number;
  act: number;
}

export interface RoomState {
  id: string;
  code: string;
  createdAt: number;
  lastActivityAt: number;
  version: number;
  phase: Phase;
  act: 1 | 2 | 3;
  phaseStartedAt: number;
  phaseEndsAt: number | null;
  paused: boolean;
  pausedAt: number | null;
  settings: RoomSettings;
  hostId: string;
  playerOrder: string[];
  players: Record<string, PlayerState>;
  board: BoardItem[];
  chat: ChatEntry[];
  questions: PublicQuestion[];
  openLocationIds: string[];
  appliedEvents: AppliedEvent[];
  assignment: Assignment | null;
  variantId: string | null;
  /** true quando l'epilogo è stato mostrato: solo allora la verità è pubblica */
  truthRevealed: boolean;
  collectiveVerdict: {
    culpritRoleId: string;
    motiveKey: string;
    methodKey: string;
    sequence: string[];
    fromPlayerId: string;
  } | null;
  result: unknown | null;
  rematchVotes: string[];
  advanceVotes: string[];
  /** contatore dei messaggi, usato dai test e dal pannello diagnostico */
  messageCount: number;
}

export type Effect =
  | { kind: 'broadcast'; msg: ServerMessage; exclude?: string[] }
  | { kind: 'direct'; playerId: string; msg: ServerMessage }
  | { kind: 'log'; level: 'info' | 'warn' | 'error'; event: string; data?: Record<string, unknown> }
  | { kind: 'ai'; requestId: string; playerId: string | null; request: AiRequest }
  | { kind: 'close'; reason: string };

export type AiRequest =
  | {
      kind: 'witness';
      witnessId: string;
      witnessName: string;
      voice: string;
      question: string;
      allowedLines: { topic: string; keywords: string[]; text: string }[];
      act: number;
    }
  | {
      kind: 'butler';
      occasion: 'lobby' | 'attesa' | 'pronti';
      playerNames: string[];
      caseTitle: string;
    }
  | {
      kind: 'recap';
      caseTitle: string;
      sharedClues: { title: string; text: string }[];
      statements: { player: string; text: string }[];
      act: number;
    }
  | {
      kind: 'hint';
      caseTitle: string;
      knownClueTitles: string[];
      missingCategory: 'movente' | 'metodo' | 'colpevole' | 'sequenza';
      act: number;
    }
  | {
      kind: 'epilogue';
      caseTitle: string;
      solutionSummary: string;
      groupWasRight: boolean;
      standoutMoments: string[];
    };

export const PHASE_ORDER: Phase[] = [
  'lobby',
  'briefing',
  'atto1',
  'atto2',
  'atto3',
  'accusa',
  'verdetto',
  'epilogo',
  'punteggi',
];

/** Durate base in secondi. `null` = fase senza timer automatico. */
export const PHASE_SECONDS: Record<Phase, number | null> = {
  lobby: null,
  briefing: 75,
  atto1: 240,
  atto2: 480,
  atto3: 420,
  accusa: 100,
  verdetto: 70,
  epilogo: 60,
  punteggi: null,
  chiusa: null,
};

export const TIMER_MULTIPLIER: Record<RoomSettings['timers'], number | null> = {
  normale: 1,
  esteso: 1.5,
  doppio: 2,
  assenti: null,
};

export function phaseAct(phase: Phase): 1 | 2 | 3 {
  if (phase === 'atto1' || phase === 'briefing' || phase === 'lobby') return 1;
  if (phase === 'atto2') return 2;
  return 3;
}

export function nextPhase(phase: Phase): Phase {
  const i = PHASE_ORDER.indexOf(phase);
  if (i < 0 || i === PHASE_ORDER.length - 1) return phase;
  return PHASE_ORDER[i + 1] as Phase;
}

export function isPlaying(phase: Phase): boolean {
  return phase === 'atto1' || phase === 'atto2' || phase === 'atto3';
}

export function activePlayers(state: RoomState): PlayerState[] {
  return state.playerOrder
    .map((id) => state.players[id])
    .filter((p): p is PlayerState => Boolean(p) && !p!.spectator);
}

export function connectedPlayers(state: RoomState): PlayerState[] {
  return activePlayers(state).filter((p) => p.connected);
}

export function createEmptyPlayer(
  id: string,
  nickname: string,
  avatar: string,
  sessionToken: string,
  now: number,
  spectator = false,
): PlayerState {
  return {
    id,
    nickname,
    avatar,
    sessionToken,
    connected: true,
    joinedAt: now,
    lastSeen: now,
    ready: false,
    spectator,
    roleId: null,
    isCulprit: false,
    hand: [],
    notes: '',
    inbox: [],
    declarationKey: null,
    declarationRefuted: false,
    contradictionsFound: [],
    objectiveId: null,
    objectiveCompleted: false,
    abilityCharges: 0,
    abilityUsedInActs: [],
    privateMessagesLeft: 3,
    publicQuestionsAsked: 0,
    searchesLeft: 0,
    hintsUsed: 0,
    currentLocationId: null,
    visitedLocationIds: [],
    accusation: null,
    verdictVoteFor: null,
    recentActionIds: [],
  };
}

/** Reimposta lo stato di gioco di un giocatore conservando identità e sessione. */
export function resetPlayerForRematch(p: PlayerState): void {
  p.ready = false;
  p.roleId = null;
  p.isCulprit = false;
  p.hand = [];
  p.notes = '';
  p.inbox = [];
  p.declarationKey = null;
  p.declarationRefuted = false;
  p.contradictionsFound = [];
  p.objectiveId = null;
  p.objectiveCompleted = false;
  p.abilityCharges = 0;
  p.abilityUsedInActs = [];
  p.privateMessagesLeft = 3;
  p.publicQuestionsAsked = 0;
  p.searchesLeft = 0;
  p.hintsUsed = 0;
  p.currentLocationId = null;
  p.visitedLocationIds = [];
  p.accusation = null;
  p.verdictVoteFor = null;
  p.recentActionIds = [];
}

export interface RoomContext {
  caseDef: CaseDef;
  variant: VariantDef;
}
