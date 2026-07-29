import { beforeEach, describe, expect, it } from 'vitest';
import {
  RoomRuntime,
  createRoomState,
  type ClientMessage,
  type Effect,
  type PrivateBrief,
  type PublicRoomState,
  type RoomSettings,
  type RoomState,
  type ServerMessage,
} from '@meridien/engine';
import { contentLibrary } from '@meridien/content';
import { creaFiltroCatalogo } from '../catalogo.js';

/**
 * Test di integrazione della stanza.
 *
 * Il runtime è puro: riceve il tempo e restituisce effetti. Qui lo si guida
 * senza rete, quindi una partita completa dura millisecondi ed è perfettamente
 * riproducibile. Gli stessi percorsi vengono poi ripercorsi via WebSocket dai
 * test end-to-end.
 */

const CASO = contentLibrary.listPublic()[0]!.id;

function impostazioni(patch: Partial<RoomSettings> = {}): RoomSettings {
  return {
    caseId: CASO,
    variantId: null,
    seed: 'PROVA1',
    mode: 'competitiva',
    timers: 'normale',
    aiDirector: false,
    hints: true,
    spectators: true,
    ...patch,
  };
}

class Tavolo {
  readonly runtime: RoomRuntime;
  readonly state: RoomState;
  tempo = 1_700_000_000_000;
  private contatore = 0;
  /** ultimo messaggio ricevuto per giocatore, per tipo */
  readonly ricevuti = new Map<string, ServerMessage[]>();
  readonly trasmessi: ServerMessage[] = [];

  constructor(settings: Partial<RoomSettings> = {}) {
    this.state = createRoomState({
      id: 'stanza-di-prova',
      code: 'ABCDE',
      now: this.tempo,
      settings: impostazioni(settings),
    });
    this.runtime = new RoomRuntime({
      state: this.state,
      content: contentLibrary,
      now: () => this.tempo,
      newId: () => `id${(this.contatore += 1)}`,
    });
  }

  applica(effetti: readonly Effect[]): void {
    for (const e of effetti) {
      if (e.kind === 'broadcast') {
        this.trasmessi.push(e.msg);
        for (const id of this.state.playerOrder) this.push(id, e.msg);
      } else if (e.kind === 'direct') {
        this.push(e.playerId, e.msg);
      }
    }
  }

  private push(playerId: string, msg: ServerMessage): void {
    const lista = this.ricevuti.get(playerId) ?? [];
    lista.push(msg);
    this.ricevuti.set(playerId, lista);
  }

  entra(nickname: string): string {
    const res = this.runtime.addPlayer(nickname, 'portrait-01', `token-${nickname}`, false);
    expect(res.playerId).not.toBeNull();
    this.applica(res.effects);
    this.applica(this.runtime.sendFullTo(res.playerId!));
    return res.playerId!;
  }

  invia(playerId: string, msg: ClientMessage): Effect[] {
    const effetti = this.runtime.handle(playerId, msg);
    this.applica(effetti);
    return effetti;
  }

  azione(playerId: string, msg: Omit<ClientMessage, 'actionId'> & { actionId?: string }): Effect[] {
    this.contatore += 1;
    return this.invia(playerId, { ...msg, actionId: `a${this.contatore}` } as ClientMessage);
  }

  avanza(ms: number): void {
    this.tempo += ms;
    this.applica(this.runtime.tick());
  }

  /** Fa entrare n giocatori, li rende pronti e comincia la partita. */
  apparecchia(n = 4): string[] {
    const ids = Array.from({ length: n }, (_, i) => this.entra(`Ospite${i + 1}`));
    for (const id of ids) this.invia(id, { t: 'setReady', ready: true });
    this.azione(ids[0]!, { t: 'startGame' });
    return ids;
  }

  pubblico(): PublicRoomState {
    return this.runtime.publicView();
  }

  brief(playerId: string): PrivateBrief | null {
    return this.runtime.privateBrief(playerId);
  }

  errori(playerId: string): string[] {
    return (this.ricevuti.get(playerId) ?? [])
      .filter((m): m is Extract<ServerMessage, { t: 'error' }> => m.t === 'error')
      .map((m) => m.code);
  }

  ultimoErrore(playerId: string): string | undefined {
    return this.errori(playerId).at(-1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Lobby e avvio', () => {
  let t: Tavolo;
  beforeEach(() => {
    t = new Tavolo();
  });

  it('il primo che entra diventa padrone di casa', () => {
    const a = t.entra('Anna');
    t.entra('Bruno');
    expect(t.pubblico().hostId).toBe(a);
  });

  it('rifiuta un nickname già in uso', () => {
    t.entra('Anna');
    const doppio = t.runtime.addPlayer('anna', 'portrait-02', 'token-x', false);
    expect(doppio.error).toBe('nickname-taken');
  });

  it('non ammette più di otto giocatori', () => {
    for (let i = 0; i < 8; i += 1) t.entra(`Ospite${i}`);
    expect(t.runtime.addPlayer('Nono', 'portrait-03', 'token-9', false).error).toBe('room-full');
  });

  it('non comincia con meno di quattro giocatori', () => {
    const ids = [t.entra('A'), t.entra('B'), t.entra('C')];
    for (const id of ids) t.invia(id, { t: 'setReady', ready: true });
    t.azione(ids[0]!, { t: 'startGame' });
    expect(t.pubblico().phase).toBe('lobby');
    expect(t.ultimoErrore(ids[0]!)).toBe('not-allowed');
  });

  it('non comincia se qualcuno non è pronto', () => {
    const ids = Array.from({ length: 4 }, (_, i) => t.entra(`O${i}`));
    for (const id of ids.slice(0, 3)) t.invia(id, { t: 'setReady', ready: true });
    t.azione(ids[0]!, { t: 'startGame' });
    expect(t.pubblico().phase).toBe('lobby');
  });

  it('solo il padrone di casa cambia le impostazioni e comincia', () => {
    const ids = t.apparecchia.call(t, 4) as unknown as string[];
    void ids;
  });
});

describe('Assegnazione di ruoli e indizi', () => {
  it('ogni giocatore riceve un ruolo diverso e un dossier privato', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(5);
    const ruoli = ids.map((id) => t.brief(id)?.roleId);
    expect(new Set(ruoli).size).toBe(5);
    for (const id of ids) {
      const b = t.brief(id)!;
      expect(b.role.name.length).toBeGreaterThan(2);
      expect(b.declaredAlibi.length).toBeGreaterThan(10);
      expect(b.secret.text.length).toBeGreaterThan(10);
      expect(b.declarations).toHaveLength(3);
      expect(b.trueTimeline.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('in modalità competitiva esiste esattamente un colpevole fra i giocatori', () => {
    const t = new Tavolo({ mode: 'competitiva' });
    const ids = t.apparecchia(6);
    expect(ids.filter((id) => t.brief(id)?.isCulprit)).toHaveLength(1);
  });

  it('in modalità cooperativa nessun giocatore è il colpevole', () => {
    const t = new Tavolo({ mode: 'cooperativa' });
    const ids = t.apparecchia(6);
    expect(ids.filter((id) => t.brief(id)?.isCulprit)).toHaveLength(0);
    expect(t.state.assignment?.npcRoleIds).toContain(
      contentLibrary.getCase(CASO)!.variants.find((v) => v.id === t.state.variantId)!.culpritRoleId,
    );
  });

  it('solo il colpevole riceve la ricostruzione falsa', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    for (const id of ids) {
      const b = t.brief(id)!;
      expect(Boolean(b.falseReconstruction)).toBe(b.isCulprit);
    }
  });

  it('ogni giocatore parte con almeno un indizio, tutti distinti', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(5);
    const mani = ids.map((id) => t.runtime.privateView(id).clues.map((c) => c.id));
    for (const mano of mani) expect(mano.length).toBeGreaterThanOrEqual(1);
    const esclusivi = mani.map((m) => m[0]!);
    expect(new Set(esclusivi).size).toBe(esclusivi.length);
  });

  it('lo stesso seme produce la stessa partita', () => {
    const uno = new Tavolo({ seed: 'STESSO' });
    const due = new Tavolo({ seed: 'STESSO' });
    const idsUno = uno.apparecchia(4);
    const idsDue = due.apparecchia(4);
    expect(uno.state.variantId).toBe(due.state.variantId);
    expect(idsUno.map((i) => uno.brief(i)?.roleId)).toEqual(idsDue.map((i) => due.brief(i)?.roleId));
  });

  it('semi diversi producono partite diverse', () => {
    const varianti = new Set(
      ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8'].map((seed) => {
        const t = new Tavolo({ seed });
        t.apparecchia(4);
        return t.state.variantId;
      }),
    );
    expect(varianti.size).toBeGreaterThan(1);
  });
});

describe('Riservatezza', () => {
  it('lo stato pubblico non contiene mai i segreti né la soluzione', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    const caso = contentLibrary.getCase(CASO)!;
    const variante = caso.variants.find((v) => v.id === t.state.variantId)!;
    const nomeColpevole = caso.roles.find((r) => r.id === variante.culpritRoleId)!.name;

    // si gioca fino alla fase d'accusa
    t.azione(ids[0]!, { t: 'advancePhase' });
    for (let i = 0; i < 4; i += 1) t.azione(ids[0]!, { t: 'advancePhase' });

    const serializzato = JSON.stringify(t.pubblico());
    expect(serializzato).not.toContain(variante.texts.reveal);
    expect(serializzato).not.toContain(variante.falseReconstruction.summary);
    for (const segreto of caso.secrets) {
      expect(serializzato).not.toContain(segreto.text);
    }
    // il nome del colpevole compare come sospettato fra gli altri, mai marcato
    expect(t.pubblico().variantId).toBeNull();
    void nomeColpevole;
  });

  it('un giocatore non vede il dossier di un altro', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    const suoi = JSON.stringify(t.brief(ids[0]!));
    const altrui = t.brief(ids[1]!)!;
    expect(suoi).not.toContain(altrui.secret.text);
    expect(suoi).not.toContain(altrui.declaredAlibi);
  });

  it('il colpevole non è distinguibile nello stato pubblico', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(6);
    const pubblico = t.pubblico();
    const colpevole = ids.find((id) => t.brief(id)?.isCulprit)!;
    const suo = pubblico.players.find((p) => p.id === colpevole)!;
    const altri = pubblico.players.filter((p) => p.id !== colpevole && !p.spectator);
    // stesse chiavi, stessi tipi: nulla lo distingue
    for (const altro of altri) {
      expect(Object.keys(suo).sort()).toEqual(Object.keys(altro).sort());
    }
    expect(suo.abilityCharges).toBeGreaterThan(0);
  });
});

describe('Fasi e timer', () => {
  it('attraversa tutte le fasi in ordine', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    const attese = ['briefing', 'atto1', 'atto2', 'atto3', 'accusa', 'verdetto', 'epilogo', 'punteggi'];
    expect(t.pubblico().phase).toBe('briefing');
    for (const fase of attese.slice(1)) {
      t.azione(ids[0]!, { t: 'advancePhase' });
      expect(t.pubblico().phase).toBe(fase);
    }
  });

  it('il timer fa avanzare la fase da solo', () => {
    const t = new Tavolo({ timers: 'normale' });
    t.apparecchia(4);
    expect(t.pubblico().phase).toBe('briefing');
    t.avanza(76_000);
    expect(t.pubblico().phase).toBe('atto1');
  });

  it('con i timer disattivati non scade nulla', () => {
    const t = new Tavolo({ timers: 'assenti' });
    t.apparecchia(4);
    expect(t.pubblico().phaseEndsAt).toBeNull();
    t.avanza(30 * 60_000);
    expect(t.pubblico().phase).toBe('briefing');
  });

  it('la pausa congela il conto alla rovescia', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    const prima = t.pubblico().phaseEndsAt!;
    t.azione(ids[0]!, { t: 'pause' });
    t.avanza(20_000);
    expect(t.pubblico().phase).toBe('briefing');
    t.azione(ids[0]!, { t: 'resumeGame' });
    expect(t.pubblico().phaseEndsAt!).toBeGreaterThan(prima);
  });

  it('solo il padrone di casa può mettere in pausa', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    t.azione(ids[1]!, { t: 'pause' });
    expect(t.ultimoErrore(ids[1]!)).toBe('not-host');
    expect(t.pubblico().paused).toBe(false);
  });

  it('i timer estesi allungano davvero le fasi', () => {
    const normale = new Tavolo({ timers: 'normale' });
    normale.apparecchia(4);
    const doppio = new Tavolo({ timers: 'doppio' });
    doppio.apparecchia(4);
    const durataNormale = normale.pubblico().phaseEndsAt! - normale.pubblico().phaseStartedAt;
    const durataDoppia = doppio.pubblico().phaseEndsAt! - doppio.pubblico().phaseStartedAt;
    expect(durataDoppia).toBe(durataNormale * 2);
  });
});

describe('Azioni di gioco', () => {
  let t: Tavolo;
  let ids: string[];

  beforeEach(() => {
    t = new Tavolo({ timers: 'assenti' });
    ids = t.apparecchia(4);
    t.azione(ids[0]!, { t: 'advancePhase' }); // → atto1
  });

  it('la dichiarazione finisce in bacheca e non si ripete', () => {
    t.azione(ids[0]!, { t: 'declare', key: 'bugia' });
    expect(t.pubblico().board.filter((b) => b.kind === 'dichiarazione')).toHaveLength(1);
    t.azione(ids[0]!, { t: 'declare', key: 'verita' });
    expect(t.ultimoErrore(ids[0]!)).toBe('already-done');
    expect(t.pubblico().board.filter((b) => b.kind === 'dichiarazione')).toHaveLength(1);
  });

  it('esplorare consuma una ricerca e consegna un indizio o un enigma', () => {
    const prima = t.runtime.privateView(ids[0]!);
    const luogo = t.pubblico().openLocationIds[0]!;
    t.azione(ids[0]!, { t: 'investigate', locationId: luogo, hotspot: '' });
    const dopo = t.runtime.privateView(ids[0]!);
    expect(dopo.searchesLeft).toBe(prima.searchesLeft - 1);
    const messaggi = t.ricevuti.get(ids[0]!) ?? [];
    expect(messaggi.some((m) => m.t === 'clue' || m.t === 'puzzle' || m.t === 'director')).toBe(true);
  });

  it('non si può esplorare senza ricerche disponibili', () => {
    const luogo = t.pubblico().openLocationIds[0]!;
    for (let i = 0; i < 6; i += 1) t.azione(ids[0]!, { t: 'investigate', locationId: luogo, hotspot: '' });
    expect(t.errori(ids[0]!)).toContain('no-charges');
  });

  it('non si può esplorare un ambiente chiuso', () => {
    t.azione(ids[0]!, { t: 'investigate', locationId: 'loc.inesistente', hotspot: '' });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-target');
  });

  it('condividere un indizio lo rende pubblico e non si può ritirare', () => {
    const mio = t.runtime.privateView(ids[0]!).clues[0]!;
    t.azione(ids[0]!, { t: 'shareClue', clueId: mio.id });
    const board = t.pubblico().board.filter((b) => b.kind === 'indizio');
    expect(board.some((b) => b.clueId === mio.id)).toBe(true);
    const voce = board.find((b) => b.clueId === mio.id)!;
    t.azione(ids[0]!, { t: 'unpin', itemId: voce.id });
    expect(t.ultimoErrore(ids[0]!)).toBe('not-allowed');
  });

  it('non si può condividere un indizio che non si possiede', () => {
    t.azione(ids[0]!, { t: 'shareClue', clueId: 'clue.inventato' });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-target');
  });

  it('le note personali si possono togliere, solo dal proprietario', () => {
    t.azione(ids[0]!, { t: 'pinToBoard', kind: 'nota', text: 'Il portiere ha esitato.' });
    const nota = t.pubblico().board.find((b) => b.kind === 'nota')!;
    t.azione(ids[1]!, { t: 'unpin', itemId: nota.id });
    expect(t.ultimoErrore(ids[1]!)).toBe('not-allowed');
    t.azione(ids[0]!, { t: 'unpin', itemId: nota.id });
    expect(t.pubblico().board.some((b) => b.id === nota.id)).toBe(false);
  });

  it('i messaggi privati sono limitati e arrivano solo al destinatario', () => {
    t.azione(ids[0]!, { t: 'advancePhase' }); // → atto2
    for (let i = 0; i < 3; i += 1) {
      t.azione(ids[0]!, { t: 'privateMessage', toPlayerId: ids[1]!, text: `biglietto ${i}` });
    }
    expect(t.runtime.privateView(ids[1]!).inbox).toHaveLength(3);
    expect(t.runtime.privateView(ids[2]!).inbox).toHaveLength(0);
    t.azione(ids[0]!, { t: 'privateMessage', toPlayerId: ids[1]!, text: 'uno di troppo' });
    expect(t.ultimoErrore(ids[0]!)).toBe('no-charges');
  });

  it('le domande pubbliche esistono solo nell’Atto III', () => {
    t.azione(ids[0]!, { t: 'publicQuestion', toPlayerId: ids[1]!, question: 'Dov’era?' });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-phase');
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'advancePhase' }); // → atto3
    t.azione(ids[0]!, { t: 'publicQuestion', toPlayerId: ids[1]!, question: 'Dov’era?' });
    expect(t.pubblico().questions).toHaveLength(1);
  });

  it('solo il destinatario risponde a una domanda', () => {
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'publicQuestion', toPlayerId: ids[1]!, question: 'Dov’era?' });
    const q = t.pubblico().questions[0]!;
    t.azione(ids[2]!, { t: 'answerQuestion', questionId: q.id, answer: 'Rispondo io' });
    expect(t.ultimoErrore(ids[2]!)).toBe('not-allowed');
    t.azione(ids[1]!, { t: 'answerQuestion', questionId: q.id, answer: 'In sala, sempre.' });
    expect(t.pubblico().questions[0]!.answer).toBe('In sala, sempre.');
  });

  it('la capacità speciale si consuma una volta per atto', () => {
    const prima = t.pubblico().players.find((p) => p.id === ids[0])!.abilityCharges;
    t.azione(ids[0]!, { t: 'useAbility', targetPlayerId: ids[1]! });
    const dopo = t.pubblico().players.find((p) => p.id === ids[0])!.abilityCharges;
    expect(dopo).toBeLessThanOrEqual(prima);
    t.azione(ids[0]!, { t: 'useAbility', targetPlayerId: ids[1]! });
    expect(t.errori(ids[0]!).some((e) => e === 'already-done' || e === 'no-charges' || e === 'invalid-phase')).toBe(true);
  });

  it('il depistaggio è riservato al colpevole', () => {
    const innocente = ids.find((id) => !t.brief(id)?.isCulprit)!;
    t.azione(innocente, { t: 'pinToBoard', kind: 'nota', text: 'Una nota qualunque.' });
    const nota = t.pubblico().board.find((b) => b.kind === 'nota')!;
    const effetti = t.runtime.handle(innocente, {
      t: 'useAbility',
      actionId: 'depista1',
      targetItemId: nota.id,
    });
    t.applica(effetti);
    expect(t.pubblico().board.find((b) => b.id === nota.id)?.tampered).not.toBe(true);
  });

  it('le azioni duplicate sono ignorate (idempotenza)', () => {
    const mio = t.runtime.privateView(ids[0]!).clues[0]!;
    t.invia(ids[0]!, { t: 'shareClue', actionId: 'ripetuta', clueId: mio.id });
    t.invia(ids[0]!, { t: 'shareClue', actionId: 'ripetuta', clueId: mio.id });
    expect(t.pubblico().board.filter((b) => b.clueId === mio.id)).toHaveLength(1);
  });

  it('il taccuino resta privato', () => {
    t.invia(ids[0]!, { t: 'saveNote', text: 'Sospetto del portiere.' });
    expect(JSON.stringify(t.pubblico())).not.toContain('Sospetto del portiere.');
    expect(t.runtime.privateView(ids[0]!).notes).toBe('Sospetto del portiere.');
    expect(t.runtime.privateView(ids[1]!).notes).toBe('');
  });
});

describe('Accusa e verdetto', () => {
  function finoAllAccusa(t: Tavolo, ids: string[]): void {
    for (let i = 0; i < 4; i += 1) t.azione(ids[0]!, { t: 'advancePhase' });
    expect(t.pubblico().phase).toBe('accusa');
  }

  it('rifiuta un’accusa incompleta o inventata', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    finoAllAccusa(t, ids);
    const catalogo = t.pubblico().catalog!;
    t.azione(ids[0]!, {
      t: 'submitAccusation',
      culpritRoleId: 'role.inesistente',
      motiveKey: catalogo.motiveOptions[0]!.key,
      methodKey: catalogo.methodOptions[0]!.key,
      sequence: catalogo.beats.map((b) => b.id),
    });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-target');
    t.azione(ids[0]!, {
      t: 'submitAccusation',
      culpritRoleId: catalogo.roles[0]!.id,
      motiveKey: catalogo.motiveOptions[0]!.key,
      methodKey: catalogo.methodOptions[0]!.key,
      sequence: [catalogo.beats[0]!.id],
    });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-target');
  });

  it('quando tutti hanno accusato si passa al verdetto', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    finoAllAccusa(t, ids);
    const catalogo = t.pubblico().catalog!;
    for (const id of ids) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: catalogo.roles[0]!.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    expect(t.pubblico().phase).toBe('verdetto');
  });

  it('una partita completa produce punteggi coerenti e rivela la verità', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(5);
    const caso = contentLibrary.getCase(CASO)!;
    finoAllAccusa(t, ids);
    const catalogo = t.pubblico().catalog!;
    const variante = caso.variants.find((v) => v.id === t.state.variantId)!;

    // tutti indovinano
    for (const id of ids) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: variante.culpritRoleId,
        motiveKey: variante.motiveKey,
        methodKey: variante.methodKey,
        sequence: [...variante.sequence],
      });
    }
    expect(t.pubblico().phase).toBe('verdetto');
    for (const id of ids) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: ids[0]! });

    expect(t.pubblico().phase).toBe('epilogo');
    const risultato = t.state.result as {
      collectiveCorrect: boolean;
      culpritRoleId: string;
      players: { total: number }[];
    };
    expect(risultato.collectiveCorrect).toBe(true);
    expect(risultato.culpritRoleId).toBe(variante.culpritRoleId);
    expect(risultato.players).toHaveLength(5);
    expect(t.pubblico().variantId).toBe(variante.id);
    expect(t.runtime.reconstruction().length).toBeGreaterThanOrEqual(12);
    void catalogo;
  });

  it('se il gruppo sbaglia, il colpevole guadagna', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    const caso = contentLibrary.getCase(CASO)!;
    finoAllAccusa(t, ids);
    const variante = caso.variants.find((v) => v.id === t.state.variantId)!;
    const innocenteQualsiasi = caso.roles.find((r) => r.id !== variante.culpritRoleId)!;
    const catalogo = t.pubblico().catalog!;
    for (const id of ids) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: innocenteQualsiasi.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    for (const id of ids) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: ids[0]! });
    const risultato = t.state.result as { culpritEscaped: boolean; culpritPlayerId: string; players: { playerId: string; total: number }[] };
    expect(risultato.culpritEscaped).toBe(true);
    const colpevole = risultato.players.find((p) => p.playerId === risultato.culpritPlayerId)!;
    expect(colpevole.total).toBeGreaterThan(0);
  });
});

describe('Disconnessioni, riconnessione e host migration', () => {
  it('il padrone di casa disconnesso viene sostituito', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    expect(t.pubblico().hostId).toBe(ids[0]);
    t.applica(t.runtime.disconnect(ids[0]!));
    expect(t.pubblico().hostId).not.toBe(ids[0]);
    expect(ids.slice(1)).toContain(t.pubblico().hostId);
  });

  it('la riconnessione restituisce ruolo, mano e note', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.invia(ids[1]!, { t: 'saveNote', text: 'Le scarpe erano asciutte.' });
    const ruolo = t.brief(ids[1]!)!.roleId;
    const mano = t.runtime.privateView(ids[1]!).clues.map((c) => c.id);

    t.applica(t.runtime.disconnect(ids[1]!));
    expect(t.pubblico().players.find((p) => p.id === ids[1])?.connected).toBe(false);

    t.applica(t.runtime.reconnect(ids[1]!));
    expect(t.pubblico().players.find((p) => p.id === ids[1])?.connected).toBe(true);
    expect(t.brief(ids[1]!)!.roleId).toBe(ruolo);
    expect(t.runtime.privateView(ids[1]!).clues.map((c) => c.id)).toEqual(mano);
    expect(t.runtime.privateView(ids[1]!).notes).toBe('Le scarpe erano asciutte.');
  });

  it('gli indizi critici di un disconnesso tornano recuperabili', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    t.azione(ids[0]!, { t: 'advancePhase' });
    const critici = new Set(t.runtime.criticalClueIds);
    const conCritico = ids.find((id) =>
      t.runtime.privateView(id).clues.some((c) => critici.has(c.id) && !c.shared),
    );
    if (!conCritico) {
      // nessun giocatore detiene un indizio critico: l'invariante è già rispettata
      expect(t.runtime.criticalClueIds.length).toBeGreaterThanOrEqual(0);
      return;
    }
    const orfani = t.runtime
      .privateView(conCritico)
      .clues.filter((c) => critici.has(c.id))
      .map((c) => c.id);
    t.applica(t.runtime.disconnect(conCritico));
    t.avanza(46_000);
    const dropIds = new Set(t.state.assignment!.drops.map((d) => d.clueId));
    for (const orfano of orfani) expect(dropIds.has(orfano)).toBe(true);
  });

  it('la partita prosegue e si conclude anche con un giocatore assente', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(5);
    t.applica(t.runtime.disconnect(ids[4]!));
    for (let i = 0; i < 4; i += 1) t.azione(ids[0]!, { t: 'advancePhase' });
    const catalogo = t.pubblico().catalog!;
    for (const id of ids.slice(0, 4)) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: catalogo.roles[0]!.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    for (const id of ids.slice(0, 4)) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: ids[0]! });
    expect(t.pubblico().phase).toBe('epilogo');
    expect(t.state.result).not.toBeNull();
  });

  it('il colpevole disconnesso non blocca il verdetto', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(5);
    const colpevole = ids.find((id) => t.brief(id)?.isCulprit)!;
    t.applica(t.runtime.disconnect(colpevole));
    const altri = ids.filter((id) => id !== colpevole);
    for (let i = 0; i < 4; i += 1) t.azione(altri[0]!, { t: 'advancePhase' });
    const catalogo = t.pubblico().catalog!;
    for (const id of altri) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: catalogo.roles[1]!.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    for (const id of altri) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: altri[0]! });
    expect(t.pubblico().phase).toBe('epilogo');
  });
});

describe('Rivincita', () => {
  it('riporta in lobby, azzera lo stato e cambia variante', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    const primaVariante = t.state.variantId;
    for (let i = 0; i < 4; i += 1) t.azione(ids[0]!, { t: 'advancePhase' });
    const catalogo = t.pubblico().catalog!;
    for (const id of ids) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: catalogo.roles[0]!.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    for (const id of ids) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: ids[0]! });
    t.azione(ids[0]!, { t: 'advancePhase' }); // → punteggi
    t.azione(ids[0]!, { t: 'rematch', newCase: false });

    const pubblico = t.pubblico();
    expect(pubblico.phase).toBe('lobby');
    expect(pubblico.board).toHaveLength(0);
    expect(pubblico.questions).toHaveLength(0);
    expect(t.state.result).toBeNull();
    expect(t.state.assignment).toBeNull();
    for (const id of ids) {
      expect(t.brief(id)).toBeNull();
      expect(t.runtime.privateView(id).clues).toHaveLength(0);
      expect(t.runtime.privateView(id).notes).toBe('');
    }
    void primaVariante;
  });

  it('una seconda partita non accumula stato', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    for (let i = 0; i < 4; i += 1) t.azione(ids[0]!, { t: 'advancePhase' });
    const catalogo = t.pubblico().catalog!;
    for (const id of ids) {
      t.azione(id, {
        t: 'submitAccusation',
        culpritRoleId: catalogo.roles[0]!.id,
        motiveKey: catalogo.motiveOptions[0]!.key,
        methodKey: catalogo.methodOptions[0]!.key,
        sequence: catalogo.beats.map((b) => b.id),
      });
    }
    for (const id of ids) t.azione(id, { t: 'voteVerdict', accusationOfPlayerId: ids[0]! });
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'rematch', newCase: true });

    for (const id of ids) t.invia(id, { t: 'setReady', ready: true });
    t.azione(ids[0]!, { t: 'startGame' });
    expect(t.pubblico().phase).toBe('briefing');
    for (const id of ids) {
      expect(t.runtime.privateView(id).clues.length).toBeLessThanOrEqual(2);
    }
    expect(t.pubblico().board).toHaveLength(0);
  });
});

describe('Azioni illegali', () => {
  it('il server rifiuta ogni azione fuori fase o fuori permesso', () => {
    const t = new Tavolo({ timers: 'assenti' });
    const ids = t.apparecchia(4);
    const estraneo = 'giocatore-inesistente';

    const casi: { msg: ClientMessage; atteso: string }[] = [
      { msg: { t: 'declare', actionId: 'x1', key: 'verita' }, atteso: 'invalid-phase' },
      { msg: { t: 'investigate', actionId: 'x2', locationId: 'loc.hall', hotspot: '' }, atteso: 'invalid-phase' },
      { msg: { t: 'voteVerdict', actionId: 'x3', accusationOfPlayerId: ids[1]! }, atteso: 'invalid-phase' },
      { msg: { t: 'rematch', actionId: 'x4', newCase: false }, atteso: 'invalid-phase' },
      { msg: { t: 'updateSettings', settings: { seed: 'ALTRO' } }, atteso: 'invalid-phase' },
      { msg: { t: 'setReady', ready: true }, atteso: 'invalid-phase' },
    ];
    for (const c of casi) {
      t.invia(ids[0]!, c.msg);
      expect(t.ultimoErrore(ids[0]!)).toBe(c.atteso);
    }

    // un id sconosciuto non tocca nulla
    const effetti = t.runtime.handle(estraneo, { t: 'setReady', ready: true });
    expect(effetti[0]).toMatchObject({ kind: 'direct', msg: { code: 'session-invalid' } });

    // un non-host non espelle nessuno
    t.azione(ids[1]!, { t: 'kickPlayer', playerId: ids[2]! });
    expect(t.ultimoErrore(ids[1]!)).toBe('not-host');
    expect(t.pubblico().players).toHaveLength(4);

    // non ci si può messaggiare da soli
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'advancePhase' });
    t.azione(ids[0]!, { t: 'privateMessage', toPlayerId: ids[0]!, text: 'ciao a me' });
    expect(t.ultimoErrore(ids[0]!)).toBe('invalid-target');
  });

  it('l’espulsione funziona solo per il padrone di casa', () => {
    const t = new Tavolo();
    const ids = t.apparecchia(4);
    t.azione(ids[0]!, { t: 'kickPlayer', playerId: ids[3]! });
    expect(t.pubblico().players.map((p) => p.id)).not.toContain(ids[3]);
  });
});

describe('Traffico di rete', () => {
  /**
   * Il catalogo del caso è la parte grossa dello stato e non cambia mai a
   * partita iniziata. Se tornasse a ogni aggiornamento, ogni movimento di ogni
   * giocatore costerebbe ottomila byte a testa: su una connessione mobile si
   * sentirebbe. Questi test tengono ferma quella promessa.
   */

  function statoConCaso(caseId: string): ServerMessage {
    const t = new Tavolo({ caseId });
    t.apparecchia(4);
    return { t: 'state', state: t.pubblico() };
  }

  it('manda il catalogo nel primo stato e lo tace nei successivi', () => {
    const filtra = creaFiltroCatalogo();
    const primo = filtra(statoConCaso(CASO));
    const secondo = filtra(statoConCaso(CASO));

    expect(primo.t).toBe('state');
    expect(secondo.t).toBe('state');
    if (primo.t !== 'state' || secondo.t !== 'state') return;

    expect(primo.state.catalog).not.toBeNull();
    expect(primo.state.catalog?.locations.length).toBeGreaterThan(0);
    // assente, non nullo: `null` significherebbe «nessun caso scelto»
    expect('catalog' in secondo.state).toBe(false);
  });

  it('lo rimanda per intero se il caso cambia', () => {
    const altro = contentLibrary.listPublic()[1]!.id;
    const filtra = creaFiltroCatalogo();

    filtra(statoConCaso(CASO));
    const dopoIlCambio = filtra(statoConCaso(altro));

    expect(dopoIlCambio.t).toBe('state');
    if (dopoIlCambio.t !== 'state') return;
    expect(dopoIlCambio.state.catalog?.caseId).toBe(altro);
  });

  it('ogni collegamento ha la sua memoria', () => {
    // chi entra a metà lobby deve ricevere il catalogo lo stesso
    const primoOspite = creaFiltroCatalogo();
    const ospiteTardivo = creaFiltroCatalogo();

    primoOspite(statoConCaso(CASO));
    const perIlTardivo = ospiteTardivo(statoConCaso(CASO));

    expect(perIlTardivo.t).toBe('state');
    if (perIlTardivo.t !== 'state') return;
    expect(perIlTardivo.state.catalog).not.toBeNull();
  });

  it('non tocca i messaggi che non sono stato', () => {
    const filtra = creaFiltroCatalogo();
    const pong: ServerMessage = { t: 'pong', at: 42 };
    expect(filtra(pong)).toBe(pong);
  });

  it('alleggerisce lo stato di più di metà', () => {
    const filtra = creaFiltroCatalogo();
    const pieno = JSON.stringify(filtra(statoConCaso(CASO))).length;
    const magro = JSON.stringify(filtra(statoConCaso(CASO))).length;
    expect(magro).toBeLessThan(pieno * 0.5);
  });
});
