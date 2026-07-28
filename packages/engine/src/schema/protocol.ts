import { z } from 'zod';
import { ROOM_CODE_LENGTH } from '../rng.js';

/**
 * Protocollo client ↔ server.
 * Ogni messaggio in ingresso è validato con questi schemi prima di toccare
 * la logica di gioco: il server non si fida mai del client.
 */

export const PROTOCOL_VERSION = 1;

const shortText = (max: number) => z.string().trim().min(1).max(max);
const actionId = z.string().min(6).max(48).regex(/^[A-Za-z0-9_-]+$/);

export const RoomCodeSchema = z
  .string()
  .length(ROOM_CODE_LENGTH)
  .regex(/^[A-HJ-NP-Z2-9]+$/, 'codice stanza non valido');

export const NicknameSchema = z
  .string()
  .trim()
  .min(2)
  .max(18)
  .regex(/^[\p{L}\p{N} '._-]+$/u, 'il nome contiene caratteri non ammessi');

export const AvatarSchema = z.string().regex(/^portrait-\d{2}$/);

export const TimerModeSchema = z.enum(['normale', 'esteso', 'doppio', 'assenti']);
export const GameModeSchema = z.enum(['competitiva', 'cooperativa']);

export const RoomSettingsSchema = z.object({
  caseId: z.string().regex(/^case\.[a-z0-9-]+$/),
  variantId: z.string().regex(/^var\.[a-z0-9-]+$/).nullable().default(null),
  seed: z.string().min(3).max(24).regex(/^[A-Z0-9-]+$/),
  mode: GameModeSchema,
  timers: TimerModeSchema,
  aiDirector: z.boolean(),
  hints: z.boolean(),
  spectators: z.boolean(),
});
export type RoomSettings = z.infer<typeof RoomSettingsSchema>;

export const PhaseSchema = z.enum([
  'lobby',
  'briefing',
  'atto1',
  'atto2',
  'atto3',
  'accusa',
  'verdetto',
  'epilogo',
  'punteggi',
  'chiusa',
]);
export type Phase = z.infer<typeof PhaseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Client → Server
// ─────────────────────────────────────────────────────────────────────────────

export const ClientMessageSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('hello'), protocol: z.number().int(), client: z.string().max(40).default('web') }),
  z.object({
    t: z.literal('createRoom'),
    nickname: NicknameSchema,
    avatar: AvatarSchema,
    settings: RoomSettingsSchema.partial().optional(),
  }),
  z.object({
    t: z.literal('joinRoom'),
    code: RoomCodeSchema,
    nickname: NicknameSchema,
    avatar: AvatarSchema,
    asSpectator: z.boolean().default(false),
  }),
  z.object({ t: z.literal('resume'), code: RoomCodeSchema, sessionToken: z.string().min(16).max(128) }),
  z.object({ t: z.literal('setProfile'), nickname: NicknameSchema, avatar: AvatarSchema }),
  z.object({ t: z.literal('setReady'), ready: z.boolean() }),
  z.object({ t: z.literal('updateSettings'), settings: RoomSettingsSchema.partial() }),
  z.object({ t: z.literal('startGame'), actionId }),
  z.object({ t: z.literal('advancePhase'), actionId }),
  z.object({ t: z.literal('declare'), actionId, key: z.enum(['verita', 'omissione', 'bugia']) }),
  z.object({ t: z.literal('enterLocation'), locationId: z.string().max(64) }),
  z.object({
    t: z.literal('investigate'),
    actionId,
    locationId: z.string().max(64),
    hotspot: z.string().max(40),
  }),
  z.object({
    t: z.literal('solvePuzzle'),
    actionId,
    clueId: z.string().max(64),
    answer: shortText(60),
  }),
  z.object({
    t: z.literal('askWitness'),
    actionId,
    witnessId: z.string().max(64),
    question: shortText(160),
  }),
  z.object({ t: z.literal('shareClue'), actionId, clueId: z.string().max(64) }),
  z.object({ t: z.literal('pinToBoard'), actionId, kind: z.enum(['nota', 'dichiarazione']), text: shortText(180) }),
  z.object({ t: z.literal('unpin'), actionId, itemId: z.string().max(48) }),
  z.object({ t: z.literal('linkOnBoard'), actionId, fromItemId: z.string().max(48), toItemId: z.string().max(48) }),
  z.object({
    t: z.literal('flagContradiction'),
    actionId,
    itemA: z.string().max(48),
    itemB: z.string().max(48),
  }),
  z.object({ t: z.literal('privateMessage'), actionId, toPlayerId: z.string().max(48), text: shortText(140) }),
  z.object({ t: z.literal('publicQuestion'), actionId, toPlayerId: z.string().max(48), question: shortText(160) }),
  z.object({ t: z.literal('answerQuestion'), actionId, questionId: z.string().max(48), answer: shortText(200) }),
  z.object({
    t: z.literal('useAbility'),
    actionId,
    targetPlayerId: z.string().max(48).optional(),
    targetLocationId: z.string().max(64).optional(),
    targetClueId: z.string().max(64).optional(),
    targetItemId: z.string().max(48).optional(),
  }),
  z.object({ t: z.literal('saveNote'), text: z.string().max(2000) }),
  z.object({
    t: z.literal('submitAccusation'),
    actionId,
    culpritRoleId: z.string().max(64),
    motiveKey: z.string().max(40),
    methodKey: z.string().max(40),
    sequence: z.array(z.string().max(64)).min(3).max(8),
  }),
  z.object({ t: z.literal('voteVerdict'), actionId, accusationOfPlayerId: z.string().max(48) }),
  z.object({ t: z.literal('requestHint'), actionId }),
  z.object({ t: z.literal('requestRecap'), actionId }),
  z.object({ t: z.literal('rematch'), actionId, newCase: z.boolean().default(false) }),
  z.object({ t: z.literal('kickPlayer'), actionId, playerId: z.string().max(48) }),
  z.object({ t: z.literal('pause'), actionId }),
  z.object({ t: z.literal('resumeGame'), actionId }),
  z.object({ t: z.literal('leave') }),
  z.object({ t: z.literal('ping'), at: z.number().int() }),
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Server → Client (tipi, non validati in ingresso ma tipizzati per il client)
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicPlayer {
  id: string;
  nickname: string;
  avatar: string;
  connected: boolean;
  isHost: boolean;
  ready: boolean;
  spectator: boolean;
  /** noto solo dopo il briefing */
  roleId: string | null;
  roleName: string | null;
  declarationKey: 'verita' | 'omissione' | 'bugia' | null;
  declarationText: string | null;
  sharedCount: number;
  handCount: number;
  abilityCharges: number;
  hasAccused: boolean;
  currentLocationId: string | null;
}

export interface PublicBoardItem {
  id: string;
  kind: 'indizio' | 'nota' | 'dichiarazione' | 'contraddizione';
  clueId: string | null;
  title: string;
  text: string;
  byPlayerId: string;
  at: number;
  links: string[];
  nodes: string[];
  /** etichetta alterata da una capacità di depistaggio */
  tampered: boolean;
}

export interface PublicQuestion {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  question: string;
  answer: string | null;
  at: number;
}

export interface ChatEntry {
  id: string;
  kind: 'sistema' | 'evento' | 'regista' | 'testimone' | 'privato';
  from: string | null;
  to: string | null;
  text: string;
  at: number;
  /** sottotitolo per l'audio associato */
  caption?: string;
}

/**
 * Catalogo del caso in corso: tutto ciò che il client deve poter mostrare
 * (ambienti, sospettati, testimoni, opzioni d'accusa) e che non rivela nulla
 * della soluzione. Le opzioni di movente, metodo e sequenza sono identiche in
 * tutte le varianti: è la difesa contro il metagioco.
 */
export interface CaseCatalog {
  caseId: string;
  title: string;
  subtitle: string;
  victim: { name: string; role: string; portrait: string; description: string; lastSeen: string };
  locations: { id: string; name: string; scene: string; floor: number; description: string; restricted: boolean }[];
  roles: { id: string; name: string; profession: string; portrait: string; archetype: string }[];
  witnesses: { id: string; name: string; role: string; portrait: string; locationId: string; topics: string[] }[];
  motiveOptions: { key: string; label: string }[];
  methodOptions: { key: string; label: string }[];
  beats: { id: string; label: string }[];
  abilities: { id: string; name: string; description: string }[];
  intro: string;
}

export interface PublicRoomState {
  code: string;
  protocol: number;
  phase: Phase;
  act: 1 | 2 | 3;
  phaseStartedAt: number;
  phaseEndsAt: number | null;
  paused: boolean;
  settings: RoomSettings;
  hostId: string;
  players: PublicPlayer[];
  board: PublicBoardItem[];
  chat: ChatEntry[];
  questions: PublicQuestion[];
  openLocationIds: string[];
  caseId: string;
  catalog: CaseCatalog | null;
  /** noto solo dall'epilogo in poi */
  variantId: string | null;
  rematchVotes: string[];
  advanceVotes: string[];
  playerCount: number;
  version: number;
}

export interface PrivateBrief {
  playerId: string;
  roleId: string;
  isCulprit: boolean;
  role: {
    name: string;
    age: number;
    profession: string;
    origin: string;
    portrait: string;
    relationToVictim: string;
    traits: string[];
    presentation: string;
  };
  declaredAlibi: string;
  trueTimeline: { from: number; to: number; where: string; note: string }[];
  secret: { title: string; text: string };
  objective: { title: string; text: string; points: number };
  ability: { id: string; name: string; description: string; charges: number; acts: number[] };
  declarations: { key: 'verita' | 'omissione' | 'bugia'; text: string }[];
  shareable: string[];
  hidden: string[];
  /** solo per il colpevole */
  falseReconstruction: {
    summary: string;
    timeline: { from: number; to: number; where: string; note: string }[];
    scapegoatRoleName: string;
  } | null;
}

export interface PrivateStateView {
  clues: {
    id: string;
    title: string;
    text: string;
    kind: string;
    icon: string;
    shared: boolean;
    foundAt: string | null;
    at: number;
  }[];
  notes: string;
  privateMessagesLeft: number;
  abilityCharges: number;
  searchesLeft: number;
  hintsUsed: number;
  accusation: {
    culpritRoleId: string;
    motiveKey: string;
    methodKey: string;
    sequence: string[];
  } | null;
  inbox: { from: string; text: string; at: number }[];
}

export type ServerMessage =
  | { t: 'welcome'; protocol: number; serverVersion: string; cases: unknown[] }
  | { t: 'joined'; playerId: string; sessionToken: string; code: string }
  | { t: 'state'; state: PublicRoomState }
  | { t: 'brief'; brief: PrivateBrief }
  | { t: 'private'; view: PrivateStateView }
  | { t: 'clue'; clueId: string; title: string; text: string; kind: string; icon: string; foundAt: string | null }
  | {
      t: 'puzzle';
      clueId: string;
      kind: 'codice' | 'orario' | 'confronto' | 'ordine' | 'scelta';
      prompt: string;
      options: string[];
      hint: string;
    }
  | { t: 'tick'; endsAt: number | null; now: number; phase: Phase }
  | { t: 'event'; id: string; title: string; text: string; act: number }
  | { t: 'witness'; witnessId: string; witnessName: string; question: string; answer: string; provider: string }
  | { t: 'director'; kind: 'recap' | 'hint' | 'butler' | 'title'; text: string; provider: string }
  | { t: 'verdict'; result: unknown }
  | { t: 'reconstruction'; steps: unknown[] }
  | { t: 'scores'; result: unknown }
  | { t: 'hostChanged'; hostId: string }
  | { t: 'kicked'; reason: string }
  | { t: 'roomClosed'; reason: string }
  | { t: 'pong'; at: number; serverTime: number }
  | { t: 'error'; code: ErrorCode; message: string; fatal: boolean };

export type ErrorCode =
  | 'bad-request'
  | 'client-outdated'
  | 'room-not-found'
  | 'room-full'
  | 'room-started'
  | 'not-host'
  | 'not-allowed'
  | 'rate-limited'
  | 'invalid-phase'
  | 'invalid-target'
  | 'already-done'
  | 'no-charges'
  | 'session-invalid'
  | 'nickname-taken'
  | 'content-rejected'
  | 'internal';

export const ERROR_TEXT: Record<ErrorCode, string> = {
  'bad-request': 'Messaggio non comprensibile.',
  'client-outdated': 'Questa versione del gioco è superata. Ricarica la pagina.',
  'room-not-found': 'Nessuna stanza con questo codice.',
  'room-full': 'La stanza è al completo.',
  'room-started': "L'indagine è già cominciata.",
  'not-host': 'Solo chi ha aperto la stanza può farlo.',
  'not-allowed': 'Non è possibile ora.',
  'rate-limited': 'Un attimo di pazienza.',
  'invalid-phase': 'Non è il momento.',
  'invalid-target': 'Destinatario non valido.',
  'already-done': 'Già fatto.',
  'no-charges': 'La capacità è esaurita.',
  'session-invalid': 'La sessione non è più valida.',
  'nickname-taken': 'Questo nome è già in uso nella stanza.',
  'content-rejected': 'Il testo contiene qualcosa che non possiamo trasmettere.',
  internal: 'Qualcosa è andato storto al Méridien.',
};
