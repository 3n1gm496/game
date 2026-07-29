import { create } from 'zustand';
import type {
  ChatEntry,
  ClientMessage,
  PrivateBrief,
  PrivateStateView,
  PublicCase,
  PublicRoomState,
  ServerMessage,
} from '@meridien/engine';
import {
  MeridienClient,
  actionId,
  clearSession,
  loadSession,
  saveSession,
  type ConnectionStatus,
} from '../net/client.js';

/**
 * Specchio in sola lettura dello stato di partita.
 * Il client non calcola nulla che conti: riceve lo stato dal server e lo
 * mostra. Le uniche cose che vivono solo qui sono le preferenze locali
 * (audio, accessibilità) e le note non ancora inviate.
 */

export type Screen =
  | 'apertura'
  | 'tutorial'
  | 'atrio'
  | 'ingresso'
  | 'lobby'
  | 'dossier'
  | 'partita'
  | 'accusa'
  | 'verdetto'
  | 'epilogo'
  | 'punteggi';

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

/**
 * Un'azione senza il proprio `actionId`: il tipo si distribuisce sull'unione
 * dei messaggi, così ogni variante conserva i suoi campi. Senza la
 * distribuzione TypeScript collasserebbe l'unione e rifiuterebbe tutto.
 */
export type AzioneSenzaId = ClientMessage extends infer M
  ? M extends { actionId: string }
    ? Omit<M, 'actionId'>
    : never
  : never;

export interface GameStore {
  // rete
  client: MeridienClient | null;
  status: ConnectionStatus;
  latency: number;
  serverVersion: string;

  // navigazione
  screen: Screen;
  tutorialSeen: boolean;

  // identità
  playerId: string | null;
  nickname: string;
  avatar: string;

  // dati di partita
  cases: PublicCase[];
  room: PublicRoomState | null;
  brief: PrivateBrief | null;
  privateView: PrivateStateView | null;
  verdict: unknown | null;
  scores: unknown | null;
  reconstruction: unknown[];

  // interfaccia
  toasts: Toast[];
  puzzle: PuzzlePrompt | null;
  witnessLog: WitnessExchange[];
  directorLines: { kind: string; text: string; at: number }[];
  lastError: string | null;
  currentLocationId: string | null;
  noteDraft: string;

  // azioni
  init(): void;
  send(msg: ClientMessage): void;
  act(msg: AzioneSenzaId): void;
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

const NICK_KEY = 'meridien.nome';
const AVATAR_KEY = 'meridien.avatar';
const TUTORIAL_KEY = 'meridien.tutorial';

function randomAvatar(): string {
  return `portrait-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}`;
}

const NAME_POOL = [
  'Ospite discreto', 'Il Viaggiatore', 'Signora in verde', 'Il Cronista', 'Ospite 404',
  'La Contessa', 'Il Distinto', 'Passeggero notturno',
];

function initialNickname(): string {
  try {
    const saved = localStorage.getItem(NICK_KEY);
    if (saved) return saved;
  } catch {
    /* archiviazione non disponibile */
  }
  return NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)] ?? 'Ospite';
}

function initialAvatar(): string {
  try {
    return localStorage.getItem(AVATAR_KEY) ?? randomAvatar();
  } catch {
    return randomAvatar();
  }
}

function screenForPhase(phase: PublicRoomState['phase']): Screen {
  switch (phase) {
    case 'lobby':
      return 'lobby';
    case 'briefing':
      return 'dossier';
    case 'atto1':
    case 'atto2':
    case 'atto3':
      return 'partita';
    case 'accusa':
      return 'accusa';
    case 'verdetto':
      return 'verdetto';
    case 'epilogo':
      return 'epilogo';
    case 'punteggi':
      return 'punteggi';
    default:
      return 'atrio';
  }
}

let toastCounter = 0;

export const useGame = create<GameStore>((set, get) => ({
  client: null,
  status: 'chiusa',
  latency: 0,
  serverVersion: '',
  screen: 'apertura',
  tutorialSeen: (() => {
    try {
      return localStorage.getItem(TUTORIAL_KEY) === 'si';
    } catch {
      return false;
    }
  })(),
  playerId: null,
  nickname: initialNickname(),
  avatar: initialAvatar(),
  cases: [],
  room: null,
  brief: null,
  privateView: null,
  verdict: null,
  scores: null,
  reconstruction: [],
  toasts: [],
  puzzle: null,
  witnessLog: [],
  directorLines: [],
  lastError: null,
  currentLocationId: null,
  noteDraft: '',

  init() {
    if (get().client) return;
    const client = new MeridienClient({
      onStatus: (status) => set({ status }),
      onLatency: (latency) => set({ latency }),
      onMessage: (msg) => handleMessage(msg, set, get),
    });
    set({ client });
    client.connect();

    const stored = loadSession();
    if (stored) {
      client.send({ t: 'resume', code: stored.code, sessionToken: stored.token });
    }

    // appiglio diagnostico per i test end-to-end e per l'indagine sui problemi
    // di rete: vedi `MeridienClient.simulaCaduta`
    (window as unknown as { __meridienChiudiSocket?: () => void }).__meridienChiudiSocket = () =>
      client.simulaCaduta();

    // ritorno dall'app switcher o riattivazione dello schermo
    const wake = (): void => {
      if (document.visibilityState === 'visible') client.wake();
    };
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', () => client.wake());
    window.addEventListener('pageshow', wake);
  },

  send(msg) {
    get().client?.send(msg);
  },

  act(msg) {
    get().client?.send({ ...msg, actionId: actionId() } as ClientMessage);
  },

  setScreen(screen) {
    set({ screen });
  },

  setProfile(nickname, avatar) {
    try {
      localStorage.setItem(NICK_KEY, nickname);
      localStorage.setItem(AVATAR_KEY, avatar);
    } catch {
      /* archiviazione non disponibile */
    }
    set({ nickname, avatar });
    if (get().room) get().send({ t: 'setProfile', nickname, avatar });
  },

  createRoom(caseId) {
    const { nickname, avatar } = get();
    get().send({ t: 'createRoom', nickname, avatar, settings: { caseId } });
  },

  joinRoom(code, asSpectator = false) {
    const { nickname, avatar } = get();
    get().send({ t: 'joinRoom', code: code.toUpperCase(), nickname, avatar, asSpectator });
  },

  leaveRoom() {
    get().send({ t: 'leave' });
    clearSession();
    set({
      room: null,
      brief: null,
      privateView: null,
      verdict: null,
      scores: null,
      reconstruction: [],
      witnessLog: [],
      directorLines: [],
      playerId: null,
      screen: 'atrio',
      currentLocationId: null,
      noteDraft: '',
    });
  },

  dismissToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  dismissPuzzle() {
    set({ puzzle: null });
  },

  setNoteDraft(text) {
    set({ noteDraft: text });
  },

  setLocation(id) {
    set({ currentLocationId: id });
    get().send({ t: 'enterLocation', locationId: id });
  },

  markTutorialSeen() {
    try {
      localStorage.setItem(TUTORIAL_KEY, 'si');
    } catch {
      /* archiviazione non disponibile */
    }
    set({ tutorialSeen: true });
  },
}));

type SetState = (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void;
type GetState = () => GameStore;

function pushToast(set: SetState, toast: Omit<Toast, 'id' | 'at'>): void {
  toastCounter += 1;
  const full: Toast = { ...toast, id: `t${toastCounter}`, at: Date.now() };
  set((s) => ({ toasts: [...s.toasts.slice(-3), full] }));
  window.setTimeout(() => {
    useGame.getState().dismissToast(full.id);
  }, 5200);
}

function handleMessage(msg: ServerMessage, set: SetState, get: GetState): void {
  switch (msg.t) {
    case 'welcome':
      set({ serverVersion: msg.serverVersion, cases: msg.cases as PublicCase[] });
      break;

    case 'joined':
      saveSession({ code: msg.code, token: msg.sessionToken, playerId: msg.playerId });
      set({ playerId: msg.playerId, lastError: null });
      break;

    case 'state': {
      const previous = get().room;
      /*
       * Il catalogo del caso arriva una volta sola: nei messaggi successivi il
       * campo è assente, e va ripreso da quello che avevamo già. Assente e
       * `null` non sono la stessa cosa — `null` significa che nessun caso è
       * stato scelto, e in quel caso il catalogo va davvero azzerato.
       */
      const room: PublicRoomState =
        'catalog' in msg.state ? msg.state : { ...msg.state, catalog: previous?.catalog ?? null };
      const nextScreen = screenForPhase(room.phase);
      const patch: Partial<GameStore> = { room };
      if (!previous || previous.phase !== room.phase) {
        patch.screen = nextScreen;
        if (room.phase === 'lobby') {
          patch.brief = null;
          patch.verdict = null;
          patch.scores = null;
          patch.reconstruction = [];
          patch.witnessLog = [];
          patch.directorLines = [];
          patch.currentLocationId = null;
          patch.noteDraft = '';
        }
      } else if (get().screen === 'atrio' || get().screen === 'ingresso') {
        patch.screen = nextScreen;
      }
      if (!get().currentLocationId && room.openLocationIds.length > 0) {
        patch.currentLocationId = room.openLocationIds[0] ?? null;
      }
      set(patch);
      announceNewChat(previous?.chat ?? [], room.chat, set);
      break;
    }

    case 'brief':
      set({ brief: msg.brief });
      break;

    case 'private':
      set({ privateView: msg.view, noteDraft: get().noteDraft || msg.view.notes });
      break;

    case 'clue':
      pushToast(set, {
        kind: 'indizio',
        title: msg.title,
        text: msg.foundAt ? `${msg.text} — ${msg.foundAt}` : msg.text,
      });
      break;

    case 'puzzle':
      set({
        puzzle: {
          clueId: msg.clueId,
          kind: msg.kind,
          prompt: msg.prompt,
          options: msg.options,
          hint: msg.hint,
        },
      });
      break;

    case 'event':
      pushToast(set, { kind: 'evento', title: msg.title, text: msg.text });
      break;

    case 'witness':
      set((s) => ({
        witnessLog: [
          ...s.witnessLog.slice(-11),
          {
            witnessId: msg.witnessId,
            witnessName: msg.witnessName,
            question: msg.question,
            answer: msg.answer,
            at: Date.now(),
          },
        ],
      }));
      break;

    case 'director':
      set((s) => ({
        directorLines: [...s.directorLines.slice(-9), { kind: msg.kind, text: msg.text, at: Date.now() }],
      }));
      if (msg.kind === 'hint' || msg.kind === 'recap') {
        pushToast(set, {
          kind: 'info',
          title: msg.kind === 'hint' ? 'Il maggiordomo suggerisce' : 'Riepilogo',
          text: msg.text,
        });
      }
      break;

    case 'verdict':
      set({ verdict: msg.result });
      break;

    case 'reconstruction':
      set({ reconstruction: msg.steps });
      break;

    case 'scores':
      set({ scores: msg.result });
      break;

    case 'hostChanged':
      pushToast(set, { kind: 'info', title: 'Nuovo padrone di casa', text: "L'indagine passa di mano." });
      break;

    case 'kicked':
      clearSession();
      set({ room: null, brief: null, screen: 'atrio', lastError: msg.reason });
      break;

    case 'roomClosed':
      clearSession();
      set({ room: null, brief: null, screen: 'atrio', lastError: msg.reason });
      break;

    case 'error':
      set({ lastError: msg.message });
      pushToast(set, { kind: 'errore', title: 'Un momento', text: msg.message });
      break;

    case 'tick':
      set((s) => (s.room ? { room: { ...s.room, phaseEndsAt: msg.endsAt } } : {}));
      break;

    default:
      break;
  }
}

/**
 * Un avviso è un colpetto sulla spalla, non una pagina da leggere.
 *
 * Certi eventi della tempesta arrivano con un paragrafo intero: riversato in
 * un avviso coprirebbe mezzo schermo proprio mentre si legge il dossier. Qui
 * resta l'inizio; il testo completo è nella cronaca, che non scade.
 */
const LUNGHEZZA_AVVISO = 130;

function estratto(testo: string): string {
  if (testo.length <= LUNGHEZZA_AVVISO) return testo;
  const taglio = testo.slice(0, LUNGHEZZA_AVVISO);
  const spazio = taglio.lastIndexOf(' ');
  return `${(spazio > 60 ? taglio.slice(0, spazio) : taglio).trimEnd()}…`;
}

function announceNewChat(previous: ChatEntry[], next: ChatEntry[], set: SetState): void {
  if (previous.length === 0) return;
  const known = new Set(previous.map((c) => c.id));
  for (const entry of next) {
    if (known.has(entry.id)) continue;
    if (entry.kind === 'evento') {
      pushToast(set, { kind: 'evento', title: 'Al Méridien', text: estratto(entry.text) });
    }
  }
}
