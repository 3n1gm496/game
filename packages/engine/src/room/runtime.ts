import type { CaseDef, ClueDef, VariantDef } from '../schema/case.js';
import {
  ERROR_TEXT,
  PROTOCOL_VERSION,
  type CaseCatalog,
  type ChatEntry,
  type ClientMessage,
  type ErrorCode,
  type Phase,
  type PrivateBrief,
  type PrivateStateView,
  type PublicPlayer,
  type PublicRoomState,
  type RoomSettings,
  type ServerMessage,
} from '../schema/protocol.js';
import {
  buildAssignment,
  dropsFor,
  pickVariant,
  redistributeCriticalClues,
} from '../distribution.js';
import { buildGraph, closure, criticalClues, type DeductionGraph } from '../deduction.js';
import { computeScores, evaluateObjective, type Accusation, type PlayerRecord } from '../scoring.js';
import { createRng } from '../rng.js';
import { formatMinute, sortTimeline } from '../timeline.js';
import {
  PHASE_SECONDS,
  TIMER_MULTIPLIER,
  activePlayers,
  connectedPlayers,
  createEmptyPlayer,
  isPlaying,
  nextPhase,
  phaseAct,
  resetPlayerForRematch,
  type BoardItem,
  type ContentLibrary,
  type AiRequest,
  type Effect,
  type PlayerState,
  type RoomState,
} from './state.js';

const MAX_CHAT = 60;
const MAX_BOARD = 60;
const MAX_ACTION_MEMORY = 64;
/**
 * Ricerche disponibili per giocatore in ciascun atto.
 *
 * Le misure vengono dalle simulazioni (`pnpm simulate`). Due osservazioni
 * hanno deciso questi numeri:
 *
 *  1. con 1/3/1 un gruppo copriva poco più di metà del caso e la soluzione
 *     restava fuori portata in una partita su tre;
 *  2. la copertura dipende dal numero di paia d'occhi, non dal singolo: in
 *     quattro si perdevano indizi che in otto si trovavano sempre.
 *
 * Da qui la compensazione: i gruppi piccoli ricevono ricerche in più
 * nell'Atto II, che è l'atto dell'esplorazione. Il totale di ritrovamenti
 * possibili resta intorno ai quaranta in ogni taglia, e il ritmo resta quello
 * giusto — in Atto II una ricerca ogni minuto e mezzo circa.
 */
const SEARCHES_PER_ACT: Record<1 | 2 | 3, number> = { 1: 2, 2: 4, 3: 2 };

function searchesFor(act: 1 | 2 | 3, playerCount: number): number {
  const base = SEARCHES_PER_ACT[act];
  if (act !== 2) return base;
  return base + Math.max(0, 6 - playerCount);
}
const MAX_PUBLIC_QUESTIONS = 3;
const DISCONNECT_GRACE_MS = 45_000;

export interface RuntimeOptions {
  state: RoomState;
  content: ContentLibrary;
  now: () => number;
  newId: () => string;
}

export class RoomRuntime {
  readonly state: RoomState;
  private readonly content: ContentLibrary;
  private readonly now: () => number;
  private readonly newId: () => string;
  private cachedCase: CaseDef | null = null;
  private cachedVariant: VariantDef | null = null;
  private cachedGraph: DeductionGraph | null = null;
  private cachedCritical: string[] | null = null;
  private pendingAi = new Map<string, { playerId: string | null; kind: string }>();
  private disconnectDeadlines = new Map<string, number>();

  constructor(opts: RuntimeOptions) {
    this.state = opts.state;
    this.content = opts.content;
    this.now = opts.now;
    this.newId = opts.newId;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Contenuto
  // ───────────────────────────────────────────────────────────────────────────

  get caseDef(): CaseDef {
    if (!this.cachedCase || this.cachedCase.id !== this.state.settings.caseId) {
      const found = this.content.getCase(this.state.settings.caseId);
      if (!found) throw new Error(`caso sconosciuto: ${this.state.settings.caseId}`);
      this.cachedCase = found;
      this.cachedVariant = null;
      this.cachedGraph = null;
      this.cachedCritical = null;
    }
    return this.cachedCase;
  }

  get variant(): VariantDef {
    const wanted = this.state.variantId;
    if (!this.cachedVariant || (wanted && this.cachedVariant.id !== wanted)) {
      this.cachedVariant = wanted
        ? (this.caseDef.variants.find((v) => v.id === wanted) ?? pickVariant(this.caseDef, this.state.settings.seed))
        : pickVariant(this.caseDef, this.state.settings.seed, this.state.settings.variantId ?? undefined);
      this.cachedGraph = null;
      this.cachedCritical = null;
    }
    return this.cachedVariant;
  }

  get graph(): DeductionGraph {
    if (!this.cachedGraph) {
      const v = this.variant;
      this.cachedGraph = buildGraph(this.caseDef.clues, v.facts, v.inferences, v.contradictions);
    }
    return this.cachedGraph;
  }

  get criticalClueIds(): string[] {
    if (!this.cachedCritical) {
      const g = this.graph;
      const universe = this.caseDef.clues.map((c) => c.id);
      const set = new Set<string>();
      for (const kind of ['culprit', 'motive', 'method'] as const) {
        for (const inf of this.variant.inferences.filter((i) => i.concludes === kind)) {
          for (const c of criticalClues(g, inf.id, universe)) set.add(c);
        }
      }
      this.cachedCritical = [...set].sort();
    }
    return this.cachedCritical;
  }

  private clue(clueId: string): ClueDef | undefined {
    return this.caseDef.clues.find((c) => c.id === clueId);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Ingresso e uscita
  // ───────────────────────────────────────────────────────────────────────────

  addPlayer(
    nickname: string,
    avatar: string,
    sessionToken: string,
    asSpectator: boolean,
  ): { playerId: string | null; error?: ErrorCode; effects: Effect[] } {
    const s = this.state;
    const now = this.now();
    const playing = activePlayers(s);

    const spectator = asSpectator || (s.phase !== 'lobby' && s.settings.spectators);
    if (!spectator && s.phase !== 'lobby') {
      return { playerId: null, error: 'room-started', effects: [] };
    }
    if (!spectator && playing.length >= 8) {
      return { playerId: null, error: 'room-full', effects: [] };
    }
    if (Object.values(s.players).some((p) => p.nickname.toLowerCase() === nickname.toLowerCase())) {
      return { playerId: null, error: 'nickname-taken', effects: [] };
    }

    const id = this.newId();
    const player = createEmptyPlayer(id, nickname, avatar, sessionToken, now, spectator);
    s.players[id] = player;
    s.playerOrder.push(id);
    if (!s.hostId || !s.players[s.hostId]) s.hostId = id;
    s.lastActivityAt = now;

    const effects: Effect[] = [
      { kind: 'log', level: 'info', event: 'player-joined', data: { code: s.code, id, spectator } },
    ];
    this.pushChat(effects, {
      kind: 'sistema',
      text: spectator ? `${nickname} osserva dalla balconata.` : `${nickname} varca la porta girevole.`,
    });
    effects.push(...this.broadcastState());
    if (s.phase === 'lobby' && s.settings.aiDirector) {
      effects.push(this.requestAi(null, {
        kind: 'butler',
        occasion: 'lobby',
        playerNames: activePlayers(s).map((p) => p.nickname),
        caseTitle: this.caseDef.title,
      }));
    }
    return { playerId: id, effects };
  }

  findBySession(token: string): PlayerState | undefined {
    return Object.values(this.state.players).find((p) => p.sessionToken === token);
  }

  reconnect(playerId: string): Effect[] {
    const p = this.state.players[playerId];
    if (!p) return [];
    p.connected = true;
    p.lastSeen = this.now();
    this.disconnectDeadlines.delete(playerId);
    this.state.lastActivityAt = this.now();
    const effects: Effect[] = [
      { kind: 'log', level: 'info', event: 'player-reconnected', data: { code: this.state.code, playerId } },
    ];
    this.pushChat(effects, { kind: 'sistema', text: `${p.nickname} è tornato in sala.` });
    effects.push(...this.sendFullTo(playerId));
    effects.push(...this.broadcastState());
    return effects;
  }

  disconnect(playerId: string): Effect[] {
    const s = this.state;
    const p = s.players[playerId];
    if (!p) return [];
    p.connected = false;
    p.lastSeen = this.now();
    const effects: Effect[] = [
      { kind: 'log', level: 'info', event: 'player-disconnected', data: { code: s.code, playerId } },
    ];

    if (s.phase === 'lobby') {
      // in lobby si esce davvero
      delete s.players[playerId];
      s.playerOrder = s.playerOrder.filter((id) => id !== playerId);
    } else {
      this.disconnectDeadlines.set(playerId, this.now() + DISCONNECT_GRACE_MS);
    }

    this.pushChat(effects, { kind: 'sistema', text: `${p.nickname} si allontana.` });
    effects.push(...this.migrateHostIfNeeded());
    effects.push(...this.broadcastState());

    if (connectedPlayers(s).length === 0 && s.phase !== 'lobby') {
      effects.push({ kind: 'log', level: 'info', event: 'room-idle', data: { code: s.code } });
    }
    return effects;
  }

  private migrateHostIfNeeded(): Effect[] {
    const s = this.state;
    const host = s.players[s.hostId];
    if (host?.connected && !host.spectator) return [];
    const candidate = activePlayers(s)
      .filter((p) => p.connected)
      .sort((a, b) => a.joinedAt - b.joinedAt)[0];
    if (!candidate || candidate.id === s.hostId) return [];
    s.hostId = candidate.id;
    const effects: Effect[] = [
      { kind: 'broadcast', msg: { t: 'hostChanged', hostId: candidate.id } },
      { kind: 'log', level: 'info', event: 'host-migrated', data: { code: s.code, hostId: candidate.id } },
    ];
    this.pushChat(effects, { kind: 'sistema', text: `${candidate.nickname} prende in mano l'indagine.` });
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Dispatch
  // ───────────────────────────────────────────────────────────────────────────

  handle(playerId: string, msg: ClientMessage): Effect[] {
    const s = this.state;
    const p = s.players[playerId];
    if (!p) return [this.err(playerId, 'session-invalid')];
    p.lastSeen = this.now();
    s.lastActivityAt = this.now();

    if ('actionId' in msg && typeof msg.actionId === 'string') {
      if (p.recentActionIds.includes(msg.actionId)) {
        return [{ kind: 'log', level: 'info', event: 'duplicate-action', data: { playerId, actionId: msg.actionId } }];
      }
      p.recentActionIds.push(msg.actionId);
      if (p.recentActionIds.length > MAX_ACTION_MEMORY) p.recentActionIds.shift();
    }

    switch (msg.t) {
      case 'setProfile':
        return this.onSetProfile(p, msg.nickname, msg.avatar);
      case 'setReady':
        return this.onSetReady(p, msg.ready);
      case 'updateSettings':
        return this.onUpdateSettings(p, msg.settings);
      case 'startGame':
        return this.onStartGame(p);
      case 'advancePhase':
        return this.onAdvanceVote(p);
      case 'declare':
        return this.onDeclare(p, msg.key);
      case 'enterLocation':
        return this.onEnterLocation(p, msg.locationId);
      case 'investigate':
        return this.onInvestigate(p, msg.locationId, msg.hotspot);
      case 'solvePuzzle':
        return this.onSolvePuzzle(p, msg.clueId, msg.answer);
      case 'askWitness':
        return this.onAskWitness(p, msg.witnessId, msg.question);
      case 'shareClue':
        return this.onShareClue(p, msg.clueId);
      case 'pinToBoard':
        return this.onPin(p, msg.kind, msg.text);
      case 'unpin':
        return this.onUnpin(p, msg.itemId);
      case 'linkOnBoard':
        return this.onLink(p, msg.fromItemId, msg.toItemId);
      case 'flagContradiction':
        return this.onFlagContradiction(p, msg.itemA, msg.itemB);
      case 'privateMessage':
        return this.onPrivateMessage(p, msg.toPlayerId, msg.text);
      case 'publicQuestion':
        return this.onPublicQuestion(p, msg.toPlayerId, msg.question);
      case 'answerQuestion':
        return this.onAnswerQuestion(p, msg.questionId, msg.answer);
      case 'useAbility':
        return this.onUseAbility(p, msg);
      case 'saveNote':
        p.notes = msg.text.slice(0, 2000);
        return [{ kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } }];
      case 'submitAccusation':
        return this.onAccuse(p, msg);
      case 'voteVerdict':
        return this.onVoteVerdict(p, msg.accusationOfPlayerId);
      case 'requestHint':
        return this.onRequestHint(p);
      case 'requestRecap':
        return this.onRequestRecap(p);
      case 'rematch':
        return this.onRematch(p, msg.newCase);
      case 'kickPlayer':
        return this.onKick(p, msg.playerId);
      case 'pause':
        return this.onPause(p, true);
      case 'resumeGame':
        return this.onPause(p, false);
      case 'leave':
        return this.disconnect(p.id);
      case 'ping':
        return [{ kind: 'direct', playerId: p.id, msg: { t: 'pong', at: msg.at, serverTime: this.now() } }];
      default:
        return [this.err(playerId, 'bad-request')];
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Lobby
  // ───────────────────────────────────────────────────────────────────────────

  private onSetProfile(p: PlayerState, nickname: string, avatar: string): Effect[] {
    if (this.state.phase !== 'lobby') return [this.err(p.id, 'invalid-phase')];
    const taken = Object.values(this.state.players).some(
      (o) => o.id !== p.id && o.nickname.toLowerCase() === nickname.toLowerCase(),
    );
    if (taken) return [this.err(p.id, 'nickname-taken')];
    p.nickname = nickname;
    p.avatar = avatar;
    return this.broadcastState();
  }

  private onSetReady(p: PlayerState, ready: boolean): Effect[] {
    if (this.state.phase !== 'lobby') return [this.err(p.id, 'invalid-phase')];
    if (p.spectator) return [this.err(p.id, 'not-allowed')];
    p.ready = ready;
    return this.broadcastState();
  }

  private onUpdateSettings(p: PlayerState, patch: Partial<RoomSettings>): Effect[] {
    const s = this.state;
    if (p.id !== s.hostId) return [this.err(p.id, 'not-host')];
    if (s.phase !== 'lobby') return [this.err(p.id, 'invalid-phase')];
    if (patch.caseId && !this.content.getCase(patch.caseId)) return [this.err(p.id, 'invalid-target')];
    s.settings = { ...s.settings, ...patch };
    this.cachedCase = null;
    this.cachedVariant = null;
    this.cachedGraph = null;
    this.cachedCritical = null;
    for (const pl of activePlayers(s)) pl.ready = false;
    return this.broadcastState();
  }

  private onStartGame(p: PlayerState): Effect[] {
    const s = this.state;
    if (p.id !== s.hostId) return [this.err(p.id, 'not-host')];
    if (s.phase !== 'lobby') return [this.err(p.id, 'invalid-phase')];
    const players = activePlayers(s).filter((x) => x.connected);
    if (players.length < 4) return [this.err(p.id, 'not-allowed')];
    if (!players.every((x) => x.ready)) return [this.err(p.id, 'not-allowed')];
    return this.startGame();
  }

  private startGame(): Effect[] {
    const s = this.state;
    const caseDef = this.caseDef;
    const variant = pickVariant(caseDef, s.settings.seed, s.settings.variantId ?? undefined);
    s.variantId = variant.id;
    this.cachedVariant = variant;
    this.cachedGraph = null;
    this.cachedCritical = null;

    const players = activePlayers(s).filter((x) => x.connected);
    const assignment = buildAssignment(
      caseDef,
      variant,
      players.map((x) => x.id),
      s.settings.mode,
      s.settings.seed,
    );
    s.assignment = assignment;
    s.truthRevealed = false;
    s.openLocationIds = caseDef.locations.filter((l) => l.fromAct === 1).map((l) => l.id);
    s.board = [];
    s.questions = [];
    s.appliedEvents = [];
    s.collectiveVerdict = null;
    s.result = null;

    const profiles = new Map(variant.roleProfiles.map((rp) => [rp.roleId, rp]));
    const effects: Effect[] = [];

    for (const pa of assignment.players) {
      const player = s.players[pa.playerId];
      if (!player) continue;
      player.roleId = pa.roleId;
      player.isCulprit = pa.isCulprit;
      const profile = profiles.get(pa.roleId);
      player.objectiveId = profile?.objectiveId ?? null;
      const role = caseDef.roles.find((r) => r.id === pa.roleId);
      const ability = caseDef.abilities.find((a) => a.id === role?.abilityId);
      player.abilityCharges = pa.isCulprit ? 2 : (ability?.charges ?? 1);
      player.hand = pa.startingClueIds.map((clueId) => ({
        clueId,
        at: this.now(),
        foundAt: null,
        shared: false,
      }));
      player.searchesLeft = searchesFor(1, players.length);
      player.currentLocationId = s.openLocationIds[0] ?? null;
    }

    this.setPhase('briefing', effects);
    for (const player of activePlayers(s)) {
      effects.push(...this.sendFullTo(player.id));
    }
    this.pushChat(effects, {
      kind: 'evento',
      text: caseDef.texts.discovery,
    });
    effects.push({
      kind: 'log',
      level: 'info',
      event: 'game-started',
      data: { code: s.code, caseId: caseDef.id, variantId: variant.id, players: players.length, mode: s.settings.mode },
    });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Fasi e timer
  // ───────────────────────────────────────────────────────────────────────────

  private setPhase(phase: Phase, effects: Effect[]): void {
    const s = this.state;
    s.phase = phase;
    s.act = phaseAct(phase);
    s.phaseStartedAt = this.now();
    s.advanceVotes = [];
    const base = PHASE_SECONDS[phase];
    const mult = TIMER_MULTIPLIER[s.settings.timers];
    s.phaseEndsAt = base !== null && mult !== null ? this.now() + base * mult * 1000 : null;

    if (isPlaying(phase)) {
      const act = phaseAct(phase);
      const quanti = activePlayers(s).length;
      for (const p of activePlayers(s)) {
        p.searchesLeft = searchesFor(act, quanti);
      }
      // ambienti che si aprono con l'atto
      const opened = this.caseDef.locations.filter((l) => l.fromAct <= act).map((l) => l.id);
      s.openLocationIds = [...new Set([...s.openLocationIds, ...opened])];
      this.pushChat(effects, { kind: 'evento', text: this.caseDef.texts.actIntros[act] });
      effects.push(...this.fireSceneEvent(act));
    }
    if (phase === 'accusa') {
      this.pushChat(effects, { kind: 'evento', text: this.caseDef.texts.verdictIntro });
    }
    if (phase === 'epilogo') {
      effects.push(...this.resolveVerdict());
    }
    effects.push({
      kind: 'broadcast',
      msg: { t: 'tick', endsAt: s.phaseEndsAt, now: this.now(), phase },
    });
  }

  private advance(): Effect[] {
    const s = this.state;
    const effects: Effect[] = [];
    if (s.phase === 'punteggi' || s.phase === 'chiusa') return effects;
    if (s.phase === 'accusa') {
      // chi non ha accusato riceve un'accusa vuota, per non bloccare il verdetto
      for (const p of activePlayers(s)) {
        if (!p.accusation && p.connected) {
          p.accusation = {
            culpritRoleId: '',
            motiveKey: '',
            methodKey: '',
            sequence: [],
            at: this.now(),
          };
        }
      }
    }
    this.setPhase(nextPhase(s.phase), effects);
    effects.push(...this.broadcastState());
    return effects;
  }

  private onAdvanceVote(p: PlayerState): Effect[] {
    const s = this.state;
    if (s.phase === 'lobby' || s.phase === 'chiusa') return [this.err(p.id, 'invalid-phase')];
    if (p.spectator) return [this.err(p.id, 'not-allowed')];
    if (s.advanceVotes.includes(p.id)) return [this.err(p.id, 'already-done')];
    s.advanceVotes.push(p.id);
    const needed = Math.max(2, Math.ceil(connectedPlayers(s).length / 2));
    if (s.advanceVotes.length >= needed || p.id === s.hostId) {
      return this.advance();
    }
    return this.broadcastState();
  }

  tick(): Effect[] {
    const s = this.state;
    const now = this.now();
    const effects: Effect[] = [];

    // disconnessioni prolungate: gli indizi critici tornano in circolazione
    for (const [playerId, deadline] of [...this.disconnectDeadlines]) {
      if (now < deadline) continue;
      this.disconnectDeadlines.delete(playerId);
      const p = s.players[playerId];
      if (!p || p.connected || !s.assignment) continue;
      const orphans = p.hand
        .filter((h) => !h.shared && this.criticalClueIds.includes(h.clueId))
        .map((h) => h.clueId);
      if (orphans.length === 0) continue;
      const created = redistributeCriticalClues(
        s.assignment,
        this.variant,
        orphans,
        s.act,
        createRng(`${s.settings.seed}::redistribuzione::${playerId}`),
      );
      if (created.length > 0) {
        const where = this.caseDef.locations.find((l) => l.id === created[0]!.locationId);
        this.pushChat(effects, {
          kind: 'evento',
          text: `Una cameriera consegna alla reception una busta trovata in ${where?.name ?? 'albergo'}. Il suo contenuto è ora consultabile.`,
        });
        effects.push({
          kind: 'log',
          level: 'info',
          event: 'clues-redistributed',
          data: { code: s.code, playerId, clues: created.map((c) => c.clueId) },
        });
      }
    }

    if (s.paused || s.phaseEndsAt === null) {
      return effects.length ? [...effects, ...this.broadcastState()] : effects;
    }
    if (now >= s.phaseEndsAt) {
      effects.push(...this.advance());
      return effects;
    }
    return effects;
  }

  private onPause(p: PlayerState, paused: boolean): Effect[] {
    const s = this.state;
    if (p.id !== s.hostId) return [this.err(p.id, 'not-host')];
    if (s.phase === 'lobby') return [this.err(p.id, 'invalid-phase')];
    if (paused === s.paused) return [this.err(p.id, 'already-done')];
    if (paused) {
      s.paused = true;
      s.pausedAt = this.now();
    } else {
      const delta = s.pausedAt ? this.now() - s.pausedAt : 0;
      s.paused = false;
      s.pausedAt = null;
      if (s.phaseEndsAt !== null) s.phaseEndsAt += delta;
    }
    const effects: Effect[] = [];
    this.pushChat(effects, {
      kind: 'sistema',
      text: paused ? "L'orologio dell'atrio è stato fermato." : "L'orologio riprende a battere.",
    });
    effects.push({ kind: 'broadcast', msg: { t: 'tick', endsAt: s.phaseEndsAt, now: this.now(), phase: s.phase } });
    effects.push(...this.broadcastState());
    return effects;
  }

  private fireSceneEvent(act: 1 | 2 | 3): Effect[] {
    const s = this.state;
    const pool = this.caseDef.events.filter(
      (e) => e.act === act && !s.appliedEvents.some((a) => a.id === e.id),
    );
    if (pool.length === 0) return [];
    const rng = createRng(`${s.settings.seed}::evento::${act}::${s.appliedEvents.length}`);
    const event = rng.weighted(pool.map((e) => ({ value: e, weight: e.weight })));
    s.appliedEvents.push({ id: event.id, at: this.now(), act });

    const effects: Effect[] = [
      { kind: 'broadcast', msg: { t: 'event', id: event.id, title: event.title, text: event.text, act } },
    ];
    this.pushChat(effects, { kind: 'evento', text: `${event.title} — ${event.text}` });

    switch (event.effect) {
      case 'open-location':
        if (!s.openLocationIds.includes(event.param)) s.openLocationIds.push(event.param);
        break;
      case 'close-location':
        s.openLocationIds = s.openLocationIds.filter((l) => l !== event.param);
        for (const p of activePlayers(s)) {
          if (p.currentLocationId === event.param) p.currentLocationId = s.openLocationIds[0] ?? null;
        }
        break;
      case 'reveal-clue': {
        const drop = s.assignment?.drops.find((d) => d.clueId === event.param);
        if (drop) drop.act = act;
        break;
      }
      case 'shorten-timer':
        if (s.phaseEndsAt) s.phaseEndsAt -= Math.min(60_000, Number(event.param || 30) * 1000);
        break;
      case 'extend-timer':
        if (s.phaseEndsAt) s.phaseEndsAt += Math.min(120_000, Number(event.param || 30) * 1000);
        break;
      case 'blackout':
        for (const p of activePlayers(s)) p.searchesLeft = Math.max(0, p.searchesLeft - 1);
        break;
      case 'force-public-question':
      case 'none':
      default:
        break;
    }
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Atto I: dichiarazioni
  // ───────────────────────────────────────────────────────────────────────────

  private onDeclare(p: PlayerState, key: 'verita' | 'omissione' | 'bugia'): Effect[] {
    const s = this.state;
    if (s.phase !== 'atto1') return [this.err(p.id, 'invalid-phase')];
    if (p.declarationKey) return [this.err(p.id, 'already-done')];
    if (!p.roleId) return [this.err(p.id, 'not-allowed')];
    const profile = this.variant.roleProfiles.find((rp) => rp.roleId === p.roleId);
    const decl = profile?.declarations.find((d) => d.key === key);
    if (!decl) return [this.err(p.id, 'invalid-target')];
    p.declarationKey = key;

    const effects: Effect[] = [];
    const item: BoardItem = {
      id: this.newId(),
      kind: 'dichiarazione',
      clueId: null,
      title: this.roleName(p.roleId),
      text: decl.text,
      byPlayerId: p.id,
      at: this.now(),
      links: [],
      nodes: decl.asserts ? [decl.asserts] : [],
      tampered: false,
    };
    this.addBoardItem(item);
    this.pushChat(effects, { kind: 'sistema', from: p.id, text: `${p.nickname}: «${decl.text}»` });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Esplorazione
  // ───────────────────────────────────────────────────────────────────────────

  private onEnterLocation(p: PlayerState, locationId: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    if (!s.openLocationIds.includes(locationId)) return [this.err(p.id, 'invalid-target')];
    p.currentLocationId = locationId;
    if (!p.visitedLocationIds.includes(locationId)) p.visitedLocationIds.push(locationId);
    return this.broadcastState();
  }

  private onInvestigate(p: PlayerState, locationId: string, hotspot: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    if (p.spectator) return [this.err(p.id, 'not-allowed')];
    if (!s.openLocationIds.includes(locationId)) return [this.err(p.id, 'invalid-target')];
    if (p.searchesLeft <= 0) return [this.err(p.id, 'no-charges')];
    if (!s.assignment) return [this.err(p.id, 'not-allowed')];

    const owned = new Set(p.hand.map((h) => h.clueId));
    const candidates = dropsFor(s.assignment, locationId, s.act)
      .filter((d) => d.hotspot === hotspot || hotspot === '')
      .filter((d) => !owned.has(d.clueId));

    p.searchesLeft -= 1;
    p.currentLocationId = locationId;

    /*
     * Chi cerca trova prima ciò che nessuno ha ancora visto.
     *
     * Senza questa preferenza due persone che frugano nella stessa stanza
     * finiscono spesso sullo stesso oggetto, e il gruppo spreca ricerche su
     * carte già in tavola. Le simulazioni lo mostravano bene: la copertura di
     * un gruppo di quattro crollava proprio per questo. Non è un aiuto
     * gratuito — è il modo in cui una stanza si svuota davvero.
     */
    const giaInGioco = new Set<string>(s.board.map((b) => b.clueId).filter((c): c is string => Boolean(c)));
    for (const altro of activePlayers(s)) {
      for (const h of altro.hand) giaInGioco.add(h.clueId);
    }
    const inediti = candidates.filter((d) => !giaInGioco.has(d.clueId));
    const pool = inediti.length > 0 ? inediti : candidates;

    if (candidates.length === 0) {
      const effects: Effect[] = [
        {
          kind: 'direct',
          playerId: p.id,
          msg: {
            t: 'director',
            kind: 'butler',
            text: 'Qui non resta più nulla da guardare. Prova un altro angolo della stanza.',
            provider: 'deterministic',
          },
        },
      ];
      effects.push({ kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } });
      effects.push(...this.broadcastState());
      return effects;
    }

    const rng = createRng(`${s.settings.seed}::ricerca::${p.id}::${locationId}::${p.searchesLeft}`);
    const drop = rng.pick(pool);

    if (drop.puzzle) {
      return [
        {
          kind: 'direct',
          playerId: p.id,
          msg: {
            t: 'puzzle',
            clueId: drop.clueId,
            prompt: drop.puzzle.prompt,
            kind: drop.puzzle.kind,
            options: drop.puzzle.options,
            hint: drop.puzzle.hint,
          },
        },
        ...this.broadcastState(),
      ];
    }
    return this.grantClue(p, drop.clueId, locationId);
  }

  private onSolvePuzzle(p: PlayerState, clueId: string, answer: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    const drop = s.assignment?.drops.find((d) => d.clueId === clueId);
    if (!drop?.puzzle) return [this.err(p.id, 'invalid-target')];
    if (p.hand.some((h) => h.clueId === clueId)) return [this.err(p.id, 'already-done')];
    const ok = answer.trim().toLowerCase() === drop.puzzle.answer.trim().toLowerCase();
    if (!ok) {
      return [
        {
          kind: 'direct',
          playerId: p.id,
          msg: { t: 'director', kind: 'butler', text: drop.puzzle.hint, provider: 'deterministic' },
        },
      ];
    }
    return this.grantClue(p, clueId, drop.locationId);
  }

  private grantClue(p: PlayerState, clueId: string, foundAt: string | null): Effect[] {
    const clue = this.clue(clueId);
    if (!clue) return [this.err(p.id, 'invalid-target')];
    if (p.hand.some((h) => h.clueId === clueId)) return [this.err(p.id, 'already-done')];
    const missing = clue.requires.filter((r) => !p.hand.some((h) => h.clueId === r));
    if (missing.length > 0) {
      return [
        {
          kind: 'direct',
          playerId: p.id,
          msg: {
            t: 'director',
            kind: 'butler',
            text: 'Questo documento da solo non dice nulla. Serve qualcosa che lo faccia parlare.',
            provider: 'deterministic',
          },
        },
      ];
    }
    p.hand.push({ clueId, at: this.now(), foundAt, shared: false });
    const effects: Effect[] = [
      {
        kind: 'direct',
        playerId: p.id,
        msg: {
          t: 'clue',
          clueId,
          title: clue.title,
          text: clue.text,
          kind: clue.kind,
          icon: clue.icon,
          foundAt,
        },
      },
      { kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } },
    ];
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Testimoni
  // ───────────────────────────────────────────────────────────────────────────

  private onAskWitness(p: PlayerState, witnessId: string, question: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    const witness = this.caseDef.witnesses.find((w) => w.id === witnessId);
    if (!witness) return [this.err(p.id, 'invalid-target')];
    const lines = (this.variant.witnessLines[witnessId] ?? []).filter((l) => l.fromAct <= s.act);
    if (lines.length === 0) return [this.err(p.id, 'not-allowed')];

    return [
      this.requestAi(p.id, {
        kind: 'witness',
        witnessId,
        witnessName: witness.name,
        voice: witness.voice,
        question,
        act: s.act,
        allowedLines: lines.map((l) => ({ topic: l.topic, keywords: l.keywords, text: l.text })),
      }),
    ];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Bacheca
  // ───────────────────────────────────────────────────────────────────────────

  private addBoardItem(item: BoardItem): void {
    this.state.board.push(item);
    if (this.state.board.length > MAX_BOARD) this.state.board.shift();
  }

  private onShareClue(p: PlayerState, clueId: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase) && s.phase !== 'accusa') return [this.err(p.id, 'invalid-phase')];
    const held = p.hand.find((h) => h.clueId === clueId);
    if (!held) return [this.err(p.id, 'invalid-target')];
    if (held.shared) return [this.err(p.id, 'already-done')];
    const clue = this.clue(clueId);
    if (!clue) return [this.err(p.id, 'invalid-target')];
    held.shared = true;
    this.addBoardItem({
      id: this.newId(),
      kind: 'indizio',
      clueId,
      title: clue.title,
      text: clue.text,
      byPlayerId: p.id,
      at: this.now(),
      links: [],
      nodes: [clueId, ...clue.reveals],
      tampered: false,
    });
    const effects: Effect[] = [];
    this.pushChat(effects, { kind: 'sistema', from: p.id, text: `${p.nickname} mette in bacheca: ${clue.title}.` });
    effects.push({ kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } });
    effects.push(...this.broadcastState());
    return effects;
  }

  private onPin(p: PlayerState, kind: 'nota' | 'dichiarazione', text: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase) && s.phase !== 'accusa') return [this.err(p.id, 'invalid-phase')];
    this.addBoardItem({
      id: this.newId(),
      kind,
      clueId: null,
      title: p.nickname,
      text,
      byPlayerId: p.id,
      at: this.now(),
      links: [],
      nodes: [],
      tampered: false,
    });
    return this.broadcastState();
  }

  private onUnpin(p: PlayerState, itemId: string): Effect[] {
    const s = this.state;
    const idx = s.board.findIndex((b) => b.id === itemId);
    if (idx < 0) return [this.err(p.id, 'invalid-target')];
    const item = s.board[idx]!;
    if (item.byPlayerId !== p.id && p.id !== s.hostId) return [this.err(p.id, 'not-allowed')];
    if (item.kind === 'indizio') return [this.err(p.id, 'not-allowed')]; // le prove non si tolgono
    s.board.splice(idx, 1);
    return this.broadcastState();
  }

  private onLink(p: PlayerState, fromItemId: string, toItemId: string): Effect[] {
    const s = this.state;
    const from = s.board.find((b) => b.id === fromItemId);
    const to = s.board.find((b) => b.id === toItemId);
    if (!from || !to || from.id === to.id) return [this.err(p.id, 'invalid-target')];
    if (from.links.includes(to.id)) {
      from.links = from.links.filter((l) => l !== to.id);
    } else {
      from.links.push(to.id);
    }
    return this.broadcastState();
  }

  /**
   * Il giocatore indica due elementi della bacheca che non possono stare in
   * piedi insieme. Il server verifica che la coppia corrisponda a una delle
   * contraddizioni previste dal caso: il client non sa quali siano, quindi non
   * può cercarle a tentativi utili.
   */
  private onFlagContradiction(p: PlayerState, itemA: string, itemB: string): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase) && s.phase !== 'accusa') return [this.err(p.id, 'invalid-phase')];
    if (itemA === itemB) return [this.err(p.id, 'invalid-target')];
    const a = s.board.find((b) => b.id === itemA);
    const b = s.board.find((x) => x.id === itemB);
    if (!a || !b) return [this.err(p.id, 'invalid-target')];

    const nodesA = new Set(a.nodes);
    const nodesB = new Set(b.nodes);
    const contra = this.variant.contradictions.find(
      (c) => (nodesA.has(c.a) && nodesB.has(c.b)) || (nodesA.has(c.b) && nodesB.has(c.a)),
    );

    if (!contra) {
      return [
        {
          kind: 'direct',
          playerId: p.id,
          msg: {
            t: 'director',
            kind: 'butler',
            text: 'Le due cose possono benissimo stare insieme. Cerchi ancora.',
            provider: 'deterministic',
          },
        },
      ];
    }
    if (p.contradictionsFound.includes(contra.id)) return [this.err(p.id, 'already-done')];

    p.contradictionsFound.push(contra.id);
    if (contra.implicates) {
      for (const other of activePlayers(s)) {
        if (other.roleId === contra.implicates) other.declarationRefuted = true;
      }
    }
    this.addBoardItem({
      id: this.newId(),
      kind: 'contraddizione',
      clueId: null,
      title: 'Contraddizione',
      text: contra.text,
      byPlayerId: p.id,
      at: this.now(),
      links: [itemA, itemB],
      nodes: [contra.a, contra.b],
      tampered: false,
    });
    const effects: Effect[] = [];
    this.pushChat(effects, {
      kind: 'sistema',
      from: p.id,
      text: `${p.nickname} mette a confronto due affermazioni. Non reggono insieme.`,
    });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Comunicazione
  // ───────────────────────────────────────────────────────────────────────────

  private onPrivateMessage(p: PlayerState, toPlayerId: string, text: string): Effect[] {
    const s = this.state;
    if (s.phase !== 'atto2' && s.phase !== 'atto3') return [this.err(p.id, 'invalid-phase')];
    const target = s.players[toPlayerId];
    if (!target || target.id === p.id || target.spectator) return [this.err(p.id, 'invalid-target')];
    if (p.privateMessagesLeft <= 0) return [this.err(p.id, 'no-charges')];
    p.privateMessagesLeft -= 1;
    target.inbox.push({ from: p.nickname, text, at: this.now() });
    if (target.inbox.length > 30) target.inbox.shift();
    return [
      { kind: 'direct', playerId: target.id, msg: { t: 'private', view: this.privateView(target.id) } },
      {
        kind: 'direct',
        playerId: target.id,
        msg: {
          t: 'director',
          kind: 'butler',
          text: `Un biglietto da ${p.nickname}.`,
          provider: 'deterministic',
        },
      },
      { kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } },
      ...this.broadcastState(),
    ];
  }

  private onPublicQuestion(p: PlayerState, toPlayerId: string, question: string): Effect[] {
    const s = this.state;
    if (s.phase !== 'atto3') return [this.err(p.id, 'invalid-phase')];
    const target = s.players[toPlayerId];
    if (!target || target.id === p.id || target.spectator) return [this.err(p.id, 'invalid-target')];
    if (p.publicQuestionsAsked >= MAX_PUBLIC_QUESTIONS) return [this.err(p.id, 'no-charges')];
    p.publicQuestionsAsked += 1;
    s.questions.push({
      id: this.newId(),
      fromPlayerId: p.id,
      toPlayerId: target.id,
      question,
      answer: null,
      at: this.now(),
    });
    if (s.questions.length > 40) s.questions.shift();
    const effects: Effect[] = [];
    this.pushChat(effects, {
      kind: 'sistema',
      from: p.id,
      to: target.id,
      text: `${p.nickname} chiede a ${target.nickname}: «${question}»`,
    });
    effects.push(...this.broadcastState());
    return effects;
  }

  private onAnswerQuestion(p: PlayerState, questionId: string, answer: string): Effect[] {
    const s = this.state;
    const q = s.questions.find((x) => x.id === questionId);
    if (!q) return [this.err(p.id, 'invalid-target')];
    if (q.toPlayerId !== p.id) return [this.err(p.id, 'not-allowed')];
    if (q.answer !== null) return [this.err(p.id, 'already-done')];
    q.answer = answer;
    const effects: Effect[] = [];
    this.pushChat(effects, { kind: 'sistema', from: p.id, text: `${p.nickname} risponde: «${answer}»` });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Capacità speciali
  // ───────────────────────────────────────────────────────────────────────────

  private onUseAbility(
    p: PlayerState,
    msg: Extract<ClientMessage, { t: 'useAbility' }>,
  ): Effect[] {
    const s = this.state;
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    if (!p.roleId) return [this.err(p.id, 'not-allowed')];
    if (p.abilityCharges <= 0) return [this.err(p.id, 'no-charges')];
    if (p.abilityUsedInActs.includes(s.act)) return [this.err(p.id, 'already-done')];

    const role = this.caseDef.roles.find((r) => r.id === p.roleId);
    const ability = this.caseDef.abilities.find((a) => a.id === role?.abilityId);
    if (!ability) return [this.err(p.id, 'not-allowed')];
    if (!ability.acts.includes(s.act)) return [this.err(p.id, 'invalid-phase')];

    const effects: Effect[] = [];
    const say = (text: string): void => {
      effects.push({
        kind: 'direct',
        playerId: p.id,
        msg: { t: 'director', kind: 'butler', text, provider: 'deterministic' },
      });
    };

    switch (ability.effect) {
      case 'reveal-location-clue': {
        const where = msg.targetLocationId ?? p.currentLocationId;
        if (!where || !s.assignment) return [this.err(p.id, 'invalid-target')];
        const owned = new Set(p.hand.map((h) => h.clueId));
        const found = dropsFor(s.assignment, where, s.act).find((d) => !owned.has(d.clueId));
        if (!found) {
          say('Ho guardato ovunque. Qui non c\'è più niente.');
          break;
        }
        effects.push(...this.grantClue(p, found.clueId, where));
        break;
      }
      case 'extra-search':
        p.searchesLeft += 2;
        say('Ho tempo per due controlli in più.');
        break;
      case 'peek-hand-count': {
        const target = msg.targetPlayerId ? s.players[msg.targetPlayerId] : undefined;
        if (!target) return [this.err(p.id, 'invalid-target')];
        say(`${target.nickname} tiene ${target.hand.length} carte, di cui ${target.hand.filter((h) => h.shared).length} già in bacheca.`);
        break;
      }
      case 'listen-in': {
        const target = msg.targetPlayerId ? s.players[msg.targetPlayerId] : undefined;
        if (!target) return [this.err(p.id, 'invalid-target')];
        say(`${target.nickname} ha fatto passare ${3 - target.privateMessagesLeft} biglietti sotto le porte.`);
        break;
      }
      case 'force-answer': {
        const target = msg.targetPlayerId ? s.players[msg.targetPlayerId] : undefined;
        if (!target) return [this.err(p.id, 'invalid-target')];
        s.questions.push({
          id: this.newId(),
          fromPlayerId: p.id,
          toPlayerId: target.id,
          question: 'Dove si trovava esattamente al momento della scoperta? Risponda.',
          answer: null,
          at: this.now(),
        });
        this.pushChat(effects, {
          kind: 'sistema',
          text: `${p.nickname} pretende una risposta da ${target.nickname}.`,
        });
        break;
      }
      case 'protect-note': {
        const item = s.board.find((b) => b.id === msg.targetItemId);
        if (!item || item.byPlayerId !== p.id || item.kind === 'indizio') {
          return [this.err(p.id, 'invalid-target')];
        }
        s.board = s.board.filter((b) => b.id !== item.id);
        say('Quel foglio non è mai stato in bacheca.');
        break;
      }
      case 'timeline-check': {
        const asserted = new Set(s.board.flatMap((b) => b.nodes));
        const conflict = this.variant.contradictions.find((c) => asserted.has(c.a) && asserted.has(c.b));
        say(
          conflict
            ? `Due affermazioni in bacheca non stanno in piedi insieme: ${conflict.text}`
            : 'Per ora gli orari messi in bacheca reggono. Il che non vuol dire che siano veri.',
        );
        break;
      }
      case 'alibi-witness': {
        this.addBoardItem({
          id: this.newId(),
          kind: 'dichiarazione',
          clueId: null,
          title: 'Testimonianza del personale',
          text: `Il personale conferma di aver visto ${p.nickname} dove ha dichiarato di essere.`,
          byPlayerId: p.id,
          at: this.now(),
          links: [],
          nodes: [],
          tampered: false,
        });
        this.pushChat(effects, { kind: 'sistema', text: `Il personale conferma la posizione di ${p.nickname}.` });
        break;
      }
      case 'second-opinion': {
        const held = p.hand.find((h) => h.clueId === msg.targetClueId) ?? p.hand[0];
        const clue = held ? this.clue(held.clueId) : undefined;
        if (!clue) return [this.err(p.id, 'invalid-target')];
        const facts = clue.reveals
          .map((f) => this.variant.facts.find((x) => x.id === f)?.text)
          .filter((x): x is string => Boolean(x));
        say(`Lettura tecnica di «${clue.title}»: ${facts.join(' ')}`);
        break;
      }
      case 'misdirect': {
        if (!p.isCulprit) return [this.err(p.id, 'not-allowed')];
        const item = s.board.find((b) => b.id === msg.targetItemId && b.kind !== 'indizio');
        if (!item) return [this.err(p.id, 'invalid-target')];
        item.tampered = true;
        item.title = 'Annotazione anonima';
        say('Nessuno ricorderà chi ha scritto quel biglietto.');
        break;
      }
      default:
        break;
    }

    p.abilityCharges -= 1;
    p.abilityUsedInActs.push(s.act);
    effects.push({ kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Accusa e verdetto
  // ───────────────────────────────────────────────────────────────────────────

  private onAccuse(p: PlayerState, msg: Extract<ClientMessage, { t: 'submitAccusation' }>): Effect[] {
    const s = this.state;
    if (s.phase !== 'accusa') return [this.err(p.id, 'invalid-phase')];
    if (p.spectator) return [this.err(p.id, 'not-allowed')];
    if (p.accusation) return [this.err(p.id, 'already-done')];
    const roleOk = this.caseDef.roles.some((r) => r.id === msg.culpritRoleId);
    const motiveOk = this.caseDef.motiveOptions.some((m) => m.key === msg.motiveKey);
    const methodOk = this.caseDef.methodOptions.some((m) => m.key === msg.methodKey);
    const beatIds = new Set(this.caseDef.beats.map((b) => b.id));
    const seqOk =
      msg.sequence.length === this.caseDef.beats.length &&
      new Set(msg.sequence).size === msg.sequence.length &&
      msg.sequence.every((b) => beatIds.has(b));
    if (!roleOk || !motiveOk || !methodOk || !seqOk) return [this.err(p.id, 'invalid-target')];

    p.accusation = {
      culpritRoleId: msg.culpritRoleId,
      motiveKey: msg.motiveKey,
      methodKey: msg.methodKey,
      sequence: [...msg.sequence],
      at: this.now(),
    };
    const effects: Effect[] = [];
    this.pushChat(effects, { kind: 'sistema', text: `${p.nickname} ha depositato la propria scheda.` });
    effects.push({ kind: 'direct', playerId: p.id, msg: { t: 'private', view: this.privateView(p.id) } });

    const voters = connectedPlayers(s);
    if (voters.length > 0 && voters.every((x) => x.accusation)) {
      effects.push(...this.advance());
      return effects;
    }
    effects.push(...this.broadcastState());
    return effects;
  }

  private onVoteVerdict(p: PlayerState, accusationOfPlayerId: string): Effect[] {
    const s = this.state;
    if (s.phase !== 'verdetto') return [this.err(p.id, 'invalid-phase')];
    if (p.spectator) return [this.err(p.id, 'not-allowed')];
    const target = s.players[accusationOfPlayerId];
    if (!target?.accusation || !target.accusation.culpritRoleId) return [this.err(p.id, 'invalid-target')];
    p.verdictVoteFor = accusationOfPlayerId;

    const effects: Effect[] = [];
    this.pushChat(effects, { kind: 'sistema', text: `${p.nickname} appoggia la tesi di ${target.nickname}.` });

    const voters = connectedPlayers(s);
    if (voters.length > 0 && voters.every((x) => x.verdictVoteFor)) {
      effects.push(...this.advance());
      return effects;
    }
    effects.push(...this.broadcastState());
    return effects;
  }

  /** Conta i voti e produce il verdetto collettivo, poi calcola i punteggi. */
  private resolveVerdict(): Effect[] {
    const s = this.state;
    const players = activePlayers(s);
    const tally = new Map<string, number>();
    for (const p of players) {
      if (!p.verdictVoteFor) continue;
      tally.set(p.verdictVoteFor, (tally.get(p.verdictVoteFor) ?? 0) + 1);
    }
    // maggioranza; a parità vince la tesi depositata per prima
    const entries = [...tally.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      const pa = s.players[a[0]]?.accusation?.at ?? Number.MAX_SAFE_INTEGER;
      const pb = s.players[b[0]]?.accusation?.at ?? Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
    let winnerId: string | null = entries[0]?.[0] ?? null;
    if (!winnerId) {
      // nessun voto: si adotta la prima accusa depositata e valida
      const first = players
        .filter((p) => p.accusation?.culpritRoleId)
        .sort((a, b) => (a.accusation?.at ?? 0) - (b.accusation?.at ?? 0))[0];
      winnerId = first?.id ?? null;
    }
    const chosen = winnerId ? s.players[winnerId] : undefined;
    s.collectiveVerdict = chosen?.accusation
      ? {
          culpritRoleId: chosen.accusation.culpritRoleId,
          motiveKey: chosen.accusation.motiveKey,
          methodKey: chosen.accusation.methodKey,
          sequence: chosen.accusation.sequence,
          fromPlayerId: chosen.id,
        }
      : null;

    // obiettivi secondari
    const pinnedSecretIds = new Set(
      s.board.flatMap((b) => this.caseDef.secrets.filter((sec) => b.text.includes(sec.title)).map((sec) => sec.id)),
    );
    const accusations: Accusation[] = players
      .filter((p) => p.accusation?.culpritRoleId)
      .map((p) => ({
        playerId: p.id,
        culpritRoleId: p.accusation!.culpritRoleId,
        motiveKey: p.accusation!.motiveKey,
        methodKey: p.accusation!.methodKey,
        sequence: p.accusation!.sequence,
        submittedAt: p.accusation!.at,
      }));

    const records: PlayerRecord[] = players.map((p) => ({
      playerId: p.id,
      roleId: p.roleId ?? '',
      isCulprit: p.isCulprit,
      sharedClueIds: p.hand.filter((h) => h.shared).map((h) => h.clueId),
      contradictionsFound: [...p.contradictionsFound],
      declarationKey: p.declarationKey,
      declarationRefuted: p.declarationRefuted,
      objectiveId: p.objectiveId ?? '',
      objectiveCompleted: false,
      connected: p.connected,
    }));

    for (const rec of records) {
      const objective = this.caseDef.objectives.find((o) => o.id === rec.objectiveId);
      const player = s.players[rec.playerId];
      if (!objective || !player) continue;
      const profile = this.variant.roleProfiles.find((rp) => rp.roleId === player.roleId);
      rec.objectiveCompleted = evaluateObjective(objective, {
        record: rec,
        allRecords: records,
        accusations,
        pinnedSecretIds,
        publicQuestionsAsked: player.publicQuestionsAsked,
        ownedClueIds: new Set(player.hand.map((h) => h.clueId)),
        playerSecretId: profile?.secretId ?? '',
      });
      player.objectiveCompleted = rec.objectiveCompleted;
    }

    const result = computeScores({
      caseDef: this.caseDef,
      variant: this.variant,
      accusations,
      records,
      collective: s.collectiveVerdict
        ? {
            culpritRoleId: s.collectiveVerdict.culpritRoleId,
            motiveKey: s.collectiveVerdict.motiveKey,
            methodKey: s.collectiveVerdict.methodKey,
            sequence: s.collectiveVerdict.sequence,
          }
        : null,
      criticalClueIds: this.criticalClueIds,
    });
    s.result = result;
    s.truthRevealed = true;

    const effects: Effect[] = [
      { kind: 'broadcast', msg: { t: 'verdict', result } },
      { kind: 'broadcast', msg: { t: 'reconstruction', steps: this.reconstruction() } },
      { kind: 'broadcast', msg: { t: 'scores', result } },
      {
        kind: 'log',
        level: 'info',
        event: 'verdict',
        data: {
          code: s.code,
          correct: result.collectiveCorrect,
          culprit: result.culpritRoleId,
          variant: this.variant.id,
        },
      },
    ];
    this.pushChat(effects, { kind: 'evento', text: this.variant.texts.reveal });
    if (s.settings.aiDirector) {
      effects.push(
        this.requestAi(null, {
          kind: 'epilogue',
          caseTitle: this.caseDef.title,
          solutionSummary: this.variant.texts.explanation,
          groupWasRight: result.collectiveCorrect,
          standoutMoments: s.board.slice(-6).map((b) => `${b.title}: ${b.text}`),
        }),
      );
    }
    return effects;
  }

  /** Passi della ricostruzione animata mostrata nell'epilogo. */
  reconstruction(): {
    at: string;
    where: string;
    whereName: string;
    who: string;
    whoName: string;
    note: string;
    isCulprit: boolean;
  }[] {
    const v = this.variant;
    return sortTimeline(v.timeline).map((e) => ({
      at: formatMinute(e.from),
      where: e.where,
      whereName: this.caseDef.locations.find((l) => l.id === e.where)?.name ?? e.where,
      who: e.who,
      whoName: this.roleName(e.who),
      note: e.note,
      isCulprit: e.who === v.culpritRoleId,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Regista: suggerimenti e riepiloghi
  // ───────────────────────────────────────────────────────────────────────────

  private onRequestHint(p: PlayerState): Effect[] {
    const s = this.state;
    if (!s.settings.hints) return [this.err(p.id, 'not-allowed')];
    if (!isPlaying(s.phase)) return [this.err(p.id, 'invalid-phase')];
    if (p.hintsUsed >= 2) return [this.err(p.id, 'no-charges')];
    p.hintsUsed += 1;

    const known = new Set(s.board.filter((b) => b.clueId).map((b) => b.clueId as string));
    for (const h of p.hand) known.add(h.clueId);
    const derived = closure(this.graph, known);
    const missing = (['colpevole', 'movente', 'metodo', 'sequenza'] as const).find((cat) => {
      const kind = cat === 'colpevole' ? 'culprit' : cat === 'movente' ? 'motive' : cat === 'metodo' ? 'method' : 'sequence';
      return !this.variant.inferences.some((i) => i.concludes === kind && derived.has(i.id));
    });
    return [
      this.requestAi(p.id, {
        kind: 'hint',
        caseTitle: this.caseDef.title,
        knownClueTitles: [...known].map((c) => this.clue(c)?.title ?? c),
        missingCategory: missing ?? 'sequenza',
        act: s.act,
      }),
    ];
  }

  private onRequestRecap(p: PlayerState): Effect[] {
    const s = this.state;
    if (s.phase === 'lobby') return [this.err(p.id, 'invalid-phase')];
    const shared = s.board
      .filter((b) => b.kind === 'indizio')
      .map((b) => ({ title: b.title, text: b.text }));
    const statements = s.board
      .filter((b) => b.kind === 'dichiarazione')
      .map((b) => ({ player: b.title, text: b.text }));
    return [
      this.requestAi(p.id, {
        kind: 'recap',
        caseTitle: this.caseDef.title,
        sharedClues: shared,
        statements,
        act: s.act,
      }),
    ];
  }

  private requestAi(playerId: string | null, request: AiRequest): Effect {
    const requestId = this.newId();
    this.pendingAi.set(requestId, { playerId, kind: request.kind });
    if (this.pendingAi.size > 64) {
      const first = this.pendingAi.keys().next();
      if (!first.done) this.pendingAi.delete(first.value);
    }
    return { kind: 'ai', requestId, playerId, request };
  }

  /** Il trasporto reinietta la risposta AI (già validata dal provider). */
  injectAiResult(
    requestId: string,
    payload:
      | { kind: 'witness'; witnessId: string; witnessName: string; question: string; answer: string; provider: string }
      | { kind: 'butler' | 'recap' | 'hint' | 'title'; text: string; provider: string }
      | { kind: 'epilogue'; text: string; provider: string },
  ): Effect[] {
    const pending = this.pendingAi.get(requestId);
    this.pendingAi.delete(requestId);
    const effects: Effect[] = [];
    if (payload.kind === 'witness') {
      const msg: ServerMessage = {
        t: 'witness',
        witnessId: payload.witnessId,
        witnessName: payload.witnessName,
        question: payload.question,
        answer: payload.answer,
        provider: payload.provider,
      };
      if (pending?.playerId) effects.push({ kind: 'direct', playerId: pending.playerId, msg });
      else effects.push({ kind: 'broadcast', msg });
      return effects;
    }
    const kind = payload.kind === 'epilogue' ? 'recap' : payload.kind;
    const msg: ServerMessage = {
      t: 'director',
      kind: kind === 'title' ? 'title' : kind,
      text: payload.text,
      provider: payload.provider,
    };
    if (pending?.playerId) effects.push({ kind: 'direct', playerId: pending.playerId, msg });
    else {
      effects.push({ kind: 'broadcast', msg });
      this.pushChat(effects, { kind: 'regista', text: payload.text });
      effects.push(...this.broadcastState());
    }
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Rivincita, espulsione
  // ───────────────────────────────────────────────────────────────────────────

  private onRematch(p: PlayerState, newCase: boolean): Effect[] {
    const s = this.state;
    if (s.phase !== 'punteggi' && s.phase !== 'epilogo') return [this.err(p.id, 'invalid-phase')];
    if (!s.rematchVotes.includes(p.id)) s.rematchVotes.push(p.id);
    const needed = Math.max(2, Math.ceil(connectedPlayers(s).length / 2));
    if (s.rematchVotes.length < needed && p.id !== s.hostId) return this.broadcastState();

    const rng = createRng(`${s.settings.seed}::rivincita::${this.now()}`);
    const cases = this.content.listPublic();
    const nextCaseId = newCase
      ? (rng.pick(cases.filter((c) => c.id !== s.settings.caseId)).id ?? s.settings.caseId)
      : s.settings.caseId;
    const newSeed = `${rng.int(100000, 999999)}`;

    s.settings = { ...s.settings, caseId: nextCaseId, seed: newSeed, variantId: null };
    this.cachedCase = null;
    this.cachedVariant = null;
    this.cachedGraph = null;
    this.cachedCritical = null;
    s.variantId = null;
    s.assignment = null;
    s.board = [];
    s.questions = [];
    s.chat = [];
    s.appliedEvents = [];
    s.collectiveVerdict = null;
    s.result = null;
    s.rematchVotes = [];
    s.advanceVotes = [];
    s.truthRevealed = false;
    s.paused = false;
    s.pausedAt = null;
    for (const player of Object.values(s.players)) resetPlayerForRematch(player);

    const effects: Effect[] = [];
    this.setPhase('lobby', effects);
    this.pushChat(effects, {
      kind: 'sistema',
      text: newCase ? 'Un nuovo caso è stato aperto al Méridien.' : 'La stessa notte, un altro filo da tirare.',
    });
    for (const player of Object.values(s.players)) effects.push(...this.sendFullTo(player.id));
    effects.push(...this.broadcastState());
    return effects;
  }

  private onKick(p: PlayerState, targetId: string): Effect[] {
    const s = this.state;
    if (p.id !== s.hostId) return [this.err(p.id, 'not-host')];
    const target = s.players[targetId];
    if (!target || target.id === p.id) return [this.err(p.id, 'invalid-target')];
    delete s.players[targetId];
    s.playerOrder = s.playerOrder.filter((id) => id !== targetId);
    const effects: Effect[] = [
      { kind: 'direct', playerId: targetId, msg: { t: 'kicked', reason: 'Il Méridien ti ha chiesto di uscire.' } },
    ];
    this.pushChat(effects, { kind: 'sistema', text: `${target.nickname} è stato accompagnato all'uscita.` });
    effects.push(...this.broadcastState());
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Viste
  // ───────────────────────────────────────────────────────────────────────────

  publicView(): PublicRoomState {
    const s = this.state;
    const reveal = s.truthRevealed;
    const players: PublicPlayer[] = s.playerOrder
      .map((id) => s.players[id])
      .filter((p): p is PlayerState => Boolean(p))
      .map((p) => {
        const profile = p.roleId ? this.variantSafe()?.roleProfiles.find((rp) => rp.roleId === p.roleId) : undefined;
        const decl = p.declarationKey ? profile?.declarations.find((d) => d.key === p.declarationKey) : undefined;
        return {
          id: p.id,
          nickname: p.nickname,
          avatar: p.avatar,
          connected: p.connected,
          isHost: p.id === s.hostId,
          ready: p.ready,
          spectator: p.spectator,
          roleId: s.phase === 'lobby' ? null : p.roleId,
          roleName: s.phase === 'lobby' || !p.roleId ? null : this.roleName(p.roleId),
          declarationKey: p.declarationKey,
          declarationText: decl?.text ?? null,
          sharedCount: p.hand.filter((h) => h.shared).length,
          handCount: p.hand.length,
          abilityCharges: p.abilityCharges,
          hasAccused: Boolean(p.accusation?.culpritRoleId),
          currentLocationId: p.currentLocationId,
        };
      });

    return {
      code: s.code,
      protocol: PROTOCOL_VERSION,
      phase: s.phase,
      act: s.act,
      phaseStartedAt: s.phaseStartedAt,
      phaseEndsAt: s.phaseEndsAt,
      paused: s.paused,
      settings: s.settings,
      hostId: s.hostId,
      players,
      board: s.board.map((b) => ({ ...b })),
      chat: s.chat.slice(-MAX_CHAT),
      questions: s.questions,
      openLocationIds: [...s.openLocationIds],
      caseId: s.settings.caseId,
      catalog: this.catalog(),
      variantId: reveal ? s.variantId : null,
      rematchVotes: [...s.rematchVotes],
      advanceVotes: [...s.advanceVotes],
      playerCount: activePlayers(s).length,
      version: s.version,
    };
  }

  /** Dati del caso mostrabili a tutti: nessuna soluzione, nessun segreto. */
  catalog(): CaseCatalog | null {
    let c: CaseDef;
    try {
      c = this.caseDef;
    } catch {
      return null;
    }
    return {
      caseId: c.id,
      title: c.title,
      subtitle: c.subtitle,
      victim: {
        name: c.victim.name,
        role: c.victim.role,
        portrait: c.victim.portrait,
        description: c.victim.description,
        lastSeen: c.victim.lastSeen,
      },
      locations: c.locations.map((l) => ({
        id: l.id,
        name: l.name,
        scene: l.scene,
        floor: l.floor,
        description: l.description,
        restricted: l.restricted,
      })),
      roles: c.roles.map((r) => ({
        id: r.id,
        name: r.name,
        profession: r.profession,
        portrait: r.portrait,
        archetype: r.archetype,
      })),
      witnesses: c.witnesses.map((w) => ({
        id: w.id,
        name: w.name,
        role: w.role,
        portrait: w.portrait,
        locationId: w.locationId,
        topics: [...w.topics],
      })),
      motiveOptions: c.motiveOptions.map((m) => ({ ...m })),
      methodOptions: c.methodOptions.map((m) => ({ ...m })),
      beats: c.beats.map((b) => ({ ...b })),
      abilities: c.abilities.map((a) => ({ id: a.id, name: a.name, description: a.description })),
      intro: c.texts.intro,
    };
  }

  privateBrief(playerId: string): PrivateBrief | null {
    const s = this.state;
    const p = s.players[playerId];
    if (!p?.roleId || s.phase === 'lobby') return null;
    const caseDef = this.caseDef;
    const v = this.variant;
    const role = caseDef.roles.find((r) => r.id === p.roleId);
    const profile = v.roleProfiles.find((rp) => rp.roleId === p.roleId);
    if (!role || !profile) return null;
    const secret = caseDef.secrets.find((x) => x.id === profile.secretId);
    const objective = caseDef.objectives.find((x) => x.id === profile.objectiveId);
    const ability = caseDef.abilities.find((a) => a.id === role.abilityId);

    return {
      playerId,
      roleId: role.id,
      isCulprit: p.isCulprit,
      role: {
        name: role.name,
        age: role.age,
        profession: role.profession,
        origin: role.origin,
        portrait: role.portrait,
        relationToVictim: role.relationToVictim,
        traits: [...role.traits],
        presentation: role.presentation,
      },
      declaredAlibi: profile.declaredAlibi,
      trueTimeline: profile.trueTimeline.map((t) => ({
        from: t.from,
        to: t.to,
        where: caseDef.locations.find((l) => l.id === t.where)?.name ?? t.where,
        note: t.note,
      })),
      secret: { title: secret?.title ?? '', text: secret?.text ?? '' },
      objective: {
        title: objective?.title ?? '',
        text: objective?.text ?? '',
        points: objective?.points ?? 20,
      },
      ability: {
        id: ability?.id ?? '',
        name: ability?.name ?? '',
        description: ability?.description ?? '',
        charges: p.abilityCharges,
        acts: ability?.acts ?? [1, 2, 3],
      },
      declarations: profile.declarations.map((d) => ({ key: d.key, text: d.text })),
      shareable: [...profile.shareable],
      hidden: [...profile.hidden],
      falseReconstruction: p.isCulprit
        ? {
            summary: v.falseReconstruction.summary,
            timeline: v.falseReconstruction.timeline.map((t) => ({
              from: t.from,
              to: t.to,
              where: caseDef.locations.find((l) => l.id === t.where)?.name ?? t.where,
              note: t.note,
            })),
            scapegoatRoleName: this.roleName(v.falseReconstruction.scapegoatRoleId),
          }
        : null,
    };
  }

  privateView(playerId: string): PrivateStateView {
    const p = this.state.players[playerId];
    if (!p) {
      return {
        clues: [],
        notes: '',
        privateMessagesLeft: 0,
        abilityCharges: 0,
        searchesLeft: 0,
        hintsUsed: 0,
        accusation: null,
        inbox: [],
      };
    }
    return {
      clues: p.hand.map((h) => {
        const c = this.clue(h.clueId);
        return {
          id: h.clueId,
          title: c?.title ?? h.clueId,
          text: c?.text ?? '',
          kind: c?.kind ?? 'fisico',
          icon: c?.icon ?? 'lente',
          shared: h.shared,
          foundAt: h.foundAt ? (this.caseDef.locations.find((l) => l.id === h.foundAt)?.name ?? h.foundAt) : null,
          at: h.at,
        };
      }),
      notes: p.notes,
      privateMessagesLeft: p.privateMessagesLeft,
      abilityCharges: p.abilityCharges,
      searchesLeft: p.searchesLeft,
      hintsUsed: p.hintsUsed,
      accusation: p.accusation
        ? {
            culpritRoleId: p.accusation.culpritRoleId,
            motiveKey: p.accusation.motiveKey,
            methodKey: p.accusation.methodKey,
            sequence: p.accusation.sequence,
          }
        : null,
      inbox: [...p.inbox],
    };
  }

  sendFullTo(playerId: string): Effect[] {
    const effects: Effect[] = [
      { kind: 'direct', playerId, msg: { t: 'state', state: this.publicView() } },
      { kind: 'direct', playerId, msg: { t: 'private', view: this.privateView(playerId) } },
    ];
    const brief = this.privateBrief(playerId);
    if (brief) effects.push({ kind: 'direct', playerId, msg: { t: 'brief', brief } });
    return effects;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Utilità
  // ───────────────────────────────────────────────────────────────────────────

  private variantSafe(): VariantDef | null {
    try {
      return this.variant;
    } catch {
      return null;
    }
  }

  roleName(roleId: string): string {
    if (roleId === 'victim') return this.caseDef.victim.name;
    const role = this.caseDef.roles.find((r) => r.id === roleId);
    if (role) return role.name;
    const wit = this.caseDef.witnesses.find((w) => w.id === roleId);
    return wit?.name ?? roleId;
  }

  /**
   * Aggiunge una riga alla cronaca della stanza. Non emette effetti: la
   * trasmissione avviene con il `broadcastState()` che chiude l'azione, così
   * un'azione produce sempre un solo messaggio di stato.
   */
  private pushChat(
    _effects: Effect[],
    entry: { kind: ChatEntry['kind']; text: string; from?: string; to?: string; caption?: string },
  ): void {
    const full: ChatEntry = {
      id: this.newId(),
      at: this.now(),
      kind: entry.kind,
      text: entry.text,
      from: entry.from ?? null,
      to: entry.to ?? null,
      ...(entry.caption ? { caption: entry.caption } : {}),
    };
    this.state.chat.push(full);
    if (this.state.chat.length > MAX_CHAT * 2) this.state.chat.splice(0, this.state.chat.length - MAX_CHAT);
  }

  private broadcastState(): Effect[] {
    this.state.version += 1;
    this.state.messageCount += 1;
    return [{ kind: 'broadcast', msg: { t: 'state', state: this.publicView() } }];
  }

  private err(playerId: string, code: ErrorCode): Effect {
    return {
      kind: 'direct',
      playerId,
      msg: { t: 'error', code, message: ERROR_TEXT[code], fatal: code === 'client-outdated' },
    };
  }
}
