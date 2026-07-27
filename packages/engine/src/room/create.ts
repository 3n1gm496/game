import type { RoomSettings } from '../schema/protocol.js';
import type { RoomState } from './state.js';

export interface CreateRoomOptions {
  id: string;
  code: string;
  now: number;
  settings: RoomSettings;
}

export function createRoomState(opts: CreateRoomOptions): RoomState {
  return {
    id: opts.id,
    code: opts.code,
    createdAt: opts.now,
    lastActivityAt: opts.now,
    version: 0,
    phase: 'lobby',
    act: 1,
    phaseStartedAt: opts.now,
    phaseEndsAt: null,
    paused: false,
    pausedAt: null,
    settings: opts.settings,
    hostId: '',
    playerOrder: [],
    players: {},
    board: [],
    chat: [],
    questions: [],
    openLocationIds: [],
    appliedEvents: [],
    assignment: null,
    variantId: null,
    truthRevealed: false,
    collectiveVerdict: null,
    result: null,
    rematchVotes: [],
    advanceVotes: [],
    messageCount: 0,
  };
}
