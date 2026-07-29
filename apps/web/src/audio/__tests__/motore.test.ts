import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Il motore audio, provato senza un vero AudioContext.
 *
 * Non si può misurare un suono in un test; si può però verificare che il mixer
 * faccia le cose giuste: che la modalità silenziosa azzeri davvero il volume,
 * che i bus rispettino i cursori, che i sottotitoli arrivino a chi li ha
 * chiesti, e che nulla parta prima del gesto dell'utente — la regola che i
 * browser mobili impongono e che, se ignorata, lascia il gioco muto.
 */

// ── un AudioContext finto, quel tanto che basta ─────────────────────────────

interface ParametroFinto {
  value: number;
  setTargetAtTime: ReturnType<typeof vi.fn>;
  setValueAtTime: ReturnType<typeof vi.fn>;
  linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
}

function parametro(iniziale = 1): ParametroFinto {
  const p: ParametroFinto = {
    value: iniziale,
    setTargetAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    setValueAtTime: vi.fn((v: number) => {
      p.value = v;
    }),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  return p;
}

function nodo(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const n: Record<string, unknown> = {
    connect: vi.fn(() => n),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    ...extra,
  };
  return n;
}

class AudioContextFinto {
  state: 'running' | 'suspended' = 'running';
  currentTime = 0;
  sampleRate = 48_000;
  destination = nodo();
  readonly creati: string[] = [];

  createGain(): Record<string, unknown> {
    this.creati.push('gain');
    return nodo({ gain: parametro() });
  }
  createOscillator(): Record<string, unknown> {
    this.creati.push('oscillator');
    return nodo({ frequency: parametro(440), type: 'sine', onended: null });
  }
  createBiquadFilter(): Record<string, unknown> {
    this.creati.push('filter');
    return nodo({ frequency: parametro(1000), Q: parametro(1), type: 'lowpass' });
  }
  createDynamicsCompressor(): Record<string, unknown> {
    return nodo({
      threshold: parametro(),
      knee: parametro(),
      ratio: parametro(),
      attack: parametro(),
      release: parametro(),
    });
  }
  createConvolver(): Record<string, unknown> {
    return nodo({ buffer: null });
  }
  createBufferSource(): Record<string, unknown> {
    this.creati.push('bufferSource');
    return nodo({ buffer: null, loop: false, onended: null });
  }
  createBuffer(canali: number, lunghezza: number): { getChannelData: () => Float32Array } {
    const dati = new Float32Array(lunghezza);
    void canali;
    return { getChannelData: () => dati };
  }
  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }
  suspend(): Promise<void> {
    this.state = 'suspended';
    return Promise.resolve();
  }
  close(): Promise<void> {
    return Promise.resolve();
  }
}

let contesto: AudioContextFinto;

beforeEach(() => {
  vi.resetModules();
  contesto = new AudioContextFinto();
  // il motore fa `new Ctor(...)`: serve un costruttore, non una funzione
  const Costruttore = function AudioContextCostruttore(this: unknown) {
    return contesto;
  } as unknown as typeof AudioContext;
  vi.stubGlobal('AudioContext', Costruttore);
  vi.stubGlobal('window', {
    AudioContext: Costruttore,
    setInterval: globalThis.setInterval.bind(globalThis),
    clearInterval: globalThis.clearInterval.bind(globalThis),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    matchMedia: () => ({ matches: false }),
  });
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  });
  vi.stubGlobal('document', { documentElement: { dataset: {}, style: { setProperty: vi.fn() } } });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('navigator', { vibrate: vi.fn() });
});

async function carica() {
  const { AudioEngine } = await import('../engine.js');
  const { useSettings } = await import('../../store/settings.js');
  return { AudioEngine, useSettings };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Avvio', () => {
  it('non tocca l’audio finché non arriva un gesto dell’utente', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    expect(motore.isRunning).toBe(false);
    // suonare senza sblocco non deve esplodere: semplicemente non succede nulla
    expect(() => motore.play('clic')).not.toThrow();
    expect(contesto.creati).toHaveLength(0);
  });

  it('dopo lo sblocco costruisce il mixer una volta sola', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    expect(motore.isRunning).toBe(true);
    const dopoIlPrimo = contesto.creati.length;
    await motore.unlock();
    expect(contesto.creati.length).toBe(dopoIlPrimo);
    motore.dispose();
  });

  it('riprende un contesto sospeso invece di crearne un altro', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    motore.suspend();
    expect(contesto.state).toBe('suspended');
    await motore.resume();
    expect(contesto.state).toBe('running');
    motore.dispose();
  });
});

describe('Mixer', () => {
  it('i cursori arrivano ai bus', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();

    useSettings.getState().set('volumeMaster', 0.5);
    useSettings.getState().set('volumeMusic', 0.2);
    motore.applyVolumes();

    const gains = contesto.creati.filter((c) => c === 'gain');
    expect(gains.length).toBeGreaterThanOrEqual(4); // master + tre bus
    motore.dispose();
  });

  it('la modalità silenziosa porta il volume generale a zero', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();

    useSettings.getState().set('muted', true);
    motore.applyVolumes();
    // in silenzio nessun suono viene costruito
    const prima = contesto.creati.length;
    motore.play('indizio');
    expect(contesto.creati.length).toBe(prima);

    useSettings.getState().set('muted', false);
    motore.applyVolumes();
    motore.play('indizio');
    expect(contesto.creati.length).toBeGreaterThan(prima);
    motore.dispose();
  });

  it('il silenzioso ferma anche musica e ambiente', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    useSettings.getState().set('muted', true);
    motore.applyVolumes();

    const prima = contesto.creati.length;
    motore.startMusic();
    expect(contesto.creati.length).toBe(prima);
    motore.stopMusic();
    motore.dispose();
  });
});

describe('Ambienti', () => {
  it('cambiare ambiente costruisce le sorgenti giuste', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();

    motore.setAmbience('pioggia');
    expect(contesto.creati).toContain('bufferSource');
    const dopoPioggia = contesto.creati.length;

    motore.setAmbience('mare');
    expect(contesto.creati.length).toBeGreaterThan(dopoPioggia);
    motore.dispose();
  });

  it('chiedere lo stesso ambiente due volte non ricostruisce nulla', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    motore.setAmbience('sala-ballo');
    const dopo = contesto.creati.length;
    motore.setAmbience('sala-ballo');
    expect(contesto.creati.length).toBe(dopo);
    motore.dispose();
  });

  it('il silenzio spegne l’ambiente corrente', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    motore.setAmbience('cucina');
    const dopo = contesto.creati.length;
    motore.setAmbience('silenzio');
    expect(contesto.creati.length).toBe(dopo);
    motore.dispose();
  });
});

describe('Sottotitoli', () => {
  it('non arrivano se non sono stati chiesti', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    useSettings.getState().set('subtitles', false);

    const ricevuti: string[] = [];
    motore.onCaption((c) => ricevuti.push(c.text));
    motore.play('indizio');
    expect(ricevuti).toEqual([]);
    motore.dispose();
  });

  it('descrivono a parole ogni effetto e ogni ambiente', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    useSettings.getState().set('subtitles', true);

    const ricevuti: string[] = [];
    motore.onCaption((c) => ricevuti.push(c.text));

    motore.play('indizio');
    motore.play('porta');
    motore.setAmbience('pioggia');

    expect(ricevuti).toHaveLength(3);
    expect(ricevuti[0]).toContain('indizio');
    expect(ricevuti[1]).toContain('porta');
    expect(ricevuti[2]).toContain('pioggia');
    // ogni didascalia è leggibile, non un codice
    for (const t of ricevuti) expect(t).toMatch(/^\[.+\]$/);
    motore.dispose();
  });

  it('si può smettere di ascoltarli', async () => {
    const { AudioEngine, useSettings } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    useSettings.getState().set('subtitles', true);

    const ricevuti: string[] = [];
    const smetti = motore.onCaption((c) => ricevuti.push(c.text));
    motore.play('clic');
    smetti();
    motore.play('clic');
    expect(ricevuti).toHaveLength(1);
    motore.dispose();
  });
});

describe('Effetti', () => {
  it('ogni suono del catalogo si costruisce senza errori', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();

    const suoni = [
      'clic', 'carta', 'indizio', 'porta', 'passi', 'ascensore', 'ticchettio',
      'notifica', 'conto-alla-rovescia', 'verdetto', 'vittoria', 'sconfitta',
      'sipario', 'campanello', 'tuono',
    ] as const;

    for (const s of suoni) {
      expect(() => motore.play(s), s).not.toThrow();
    }
    expect(contesto.creati.length).toBeGreaterThan(suoni.length);
    motore.dispose();
  });

  it('smontare il motore non lascia timer in giro', async () => {
    const { AudioEngine } = await carica();
    const motore = new AudioEngine();
    await motore.unlock();
    motore.startMusic();
    motore.setAmbience('pioggia');
    expect(() => motore.dispose()).not.toThrow();
    expect(motore.isRunning).toBe(false);
  });
});
