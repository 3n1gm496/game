import { useSettings } from '../store/settings.js';

/**
 * Identità sonora del Méridien, interamente sintetizzata.
 *
 * Non esiste un solo file audio nel repository: ogni suono è costruito con
 * oscillatori, rumore filtrato e un riverbero a convoluzione generato in
 * memoria. Questo risolve alla radice la questione delle licenze e riduce il
 * peso del primo caricamento a zero byte di media.
 *
 * Bus: musica · ambiente · effetti, tutti sotto un master con compressore.
 * L'AudioContext parte solo dopo un gesto dell'utente, come richiesto dai
 * browser mobili.
 */

export type AmbienceKey = 'pioggia' | 'mare' | 'sala-ballo' | 'corridoio' | 'cucina' | 'silenzio';

export type SfxKey =
  | 'clic'
  | 'carta'
  | 'indizio'
  | 'porta'
  | 'passi'
  | 'ascensore'
  | 'ticchettio'
  | 'notifica'
  | 'conto-alla-rovescia'
  | 'verdetto'
  | 'vittoria'
  | 'sconfitta'
  | 'sipario'
  | 'campanello'
  | 'tuono';

export interface Caption {
  id: number;
  text: string;
  at: number;
}

const CAPTIONS: Record<SfxKey | AmbienceKey, string> = {
  clic: '[tocco]',
  carta: '[carta che scorre]',
  indizio: '[indizio trovato]',
  porta: '[porta che si chiude]',
  passi: '[passi sul marmo]',
  ascensore: '[campanello dell’ascensore]',
  ticchettio: '[orologio che ticchetta]',
  notifica: '[avviso discreto]',
  'conto-alla-rovescia': '[conto alla rovescia]',
  verdetto: '[rullo di tamburi]',
  vittoria: '[accordo di chiusura]',
  sconfitta: '[accordo minore]',
  sipario: '[sipario]',
  campanello: '[campanello della reception]',
  tuono: '[tuono lontano]',
  pioggia: '[pioggia sui vetri]',
  mare: '[mare in lontananza]',
  'sala-ballo': '[orchestra in sala]',
  corridoio: '[silenzio del corridoio]',
  cucina: '[rumori di cucina]',
  silenzio: '[silenzio]',
};

let captionSeq = 0;
type CaptionListener = (caption: Caption) => void;

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private busMusic: GainNode | null = null;
  private busAmbience: GainNode | null = null;
  private busEffects: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private currentAmbience: { key: AmbienceKey; nodes: AudioNode[]; gain: GainNode } | null = null;
  private musicTimer: number | null = null;
  private musicNodes: AudioNode[] = [];
  private captionListeners = new Set<CaptionListener>();
  private started = false;

  get isRunning(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  onCaption(listener: CaptionListener): () => void {
    this.captionListeners.add(listener);
    return () => this.captionListeners.delete(listener);
  }

  private emitCaption(key: SfxKey | AmbienceKey): void {
    if (!useSettings.getState().subtitles) return;
    captionSeq += 1;
    const caption: Caption = { id: captionSeq, text: CAPTIONS[key] ?? '[suono]', at: Date.now() };
    for (const listener of this.captionListeners) listener(caption);
  }

  /** Va chiamato da un gestore di evento utente (tocco, clic, tasto). */
  async unlock(): Promise<void> {
    if (this.started && this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor({ latencyHint: 'interactive' });
    this.ctx = ctx;

    const master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 24;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.006;
    compressor.release.value = 0.22;
    master.connect(compressor).connect(ctx.destination);
    this.master = master;

    this.busMusic = ctx.createGain();
    this.busAmbience = ctx.createGain();
    this.busEffects = ctx.createGain();

    this.reverb = ctx.createConvolver();
    this.reverb.buffer = makeImpulse(ctx, 2.4, 2.6);
    const reverbSend = ctx.createGain();
    reverbSend.gain.value = 0.22;
    this.reverb.connect(reverbSend).connect(master);

    for (const bus of [this.busMusic, this.busAmbience, this.busEffects]) {
      bus.connect(master);
    }
    this.busMusic.connect(this.reverb);
    this.busEffects.connect(this.reverb);

    this.started = true;
    this.applyVolumes();
    if (ctx.state === 'suspended') await ctx.resume();
  }

  applyVolumes(): void {
    const s = useSettings.getState();
    const t = this.ctx?.currentTime ?? 0;
    const m = s.muted ? 0 : s.volumeMaster;
    this.master?.gain.setTargetAtTime(m, t, 0.05);
    this.busMusic?.gain.setTargetAtTime(s.volumeMusic, t, 0.05);
    this.busAmbience?.gain.setTargetAtTime(s.volumeAmbience, t, 0.05);
    this.busEffects?.gain.setTargetAtTime(s.volumeEffects, t, 0.05);
  }

  suspend(): void {
    void this.ctx?.suspend();
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  dispose(): void {
    this.stopMusic();
    this.stopAmbience(0);
    this.captionListeners.clear();
    void this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Effetti
  // ───────────────────────────────────────────────────────────────────────────

  play(key: SfxKey): void {
    this.emitCaption(key);
    const ctx = this.ctx;
    const bus = this.busEffects;
    if (!ctx || !bus || useSettings.getState().muted) return;
    const t = ctx.currentTime;

    switch (key) {
      case 'clic':
        this.blip(220 + Math.random() * 20, 0.05, 0.16, 'triangle');
        break;
      case 'carta':
        this.noiseBurst(0.16, 2600, 0.16, 1.4);
        break;
      case 'indizio':
        this.blip(660, 0.09, 0.2, 'sine');
        this.blip(990, 0.14, 0.14, 'sine', 0.09);
        break;
      case 'porta':
        this.noiseBurst(0.3, 380, 0.3, 0.6);
        this.blip(90, 0.22, 0.22, 'sine', 0.02);
        break;
      case 'passi':
        for (let i = 0; i < 3; i += 1) this.noiseBurst(0.07, 900, 0.1, 1.2, 0.22 * i);
        break;
      case 'ascensore':
        this.blip(1320, 0.5, 0.16, 'sine');
        this.blip(880, 0.7, 0.12, 'sine', 0.12);
        break;
      case 'ticchettio':
        this.noiseBurst(0.03, 4200, 0.1, 2.4);
        break;
      case 'notifica':
        this.blip(587.33, 0.16, 0.11, 'triangle');
        this.blip(880, 0.2, 0.09, 'triangle', 0.1);
        break;
      case 'campanello':
        this.blip(1568, 0.9, 0.14, 'sine');
        break;
      case 'conto-alla-rovescia':
        this.blip(392, 0.12, 0.18, 'square');
        break;
      case 'verdetto':
        for (let i = 0; i < 10; i += 1) this.noiseBurst(0.06, 260, 0.12 + i * 0.008, 0.8, i * 0.075);
        this.chord([98, 146.83, 196], 1.4, 0.18, t + 0.8);
        break;
      case 'vittoria':
        this.chord([196, 246.94, 293.66, 392], 1.8, 0.16);
        this.chord([261.63, 329.63, 392, 523.25], 1.6, 0.14, t + 0.42);
        break;
      case 'sconfitta':
        this.chord([174.61, 207.65, 261.63], 2.2, 0.16);
        this.chord([164.81, 196, 246.94], 2.4, 0.13, t + 0.55);
        break;
      case 'sipario':
        this.noiseBurst(0.9, 700, 0.14, 0.5);
        this.blip(65, 0.9, 0.14, 'sine');
        break;
      case 'tuono':
        this.noiseBurst(1.6, 180, 0.22, 0.4);
        break;
      default:
        break;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Ambienti
  // ───────────────────────────────────────────────────────────────────────────

  setAmbience(key: AmbienceKey, fadeSeconds = 1.6): void {
    if (this.currentAmbience?.key === key) return;
    const ctx = this.ctx;
    const bus = this.busAmbience;
    this.emitCaption(key);
    if (!ctx || !bus) return;

    this.stopAmbience(fadeSeconds);
    if (key === 'silenzio') return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(bus);
    gain.gain.setTargetAtTime(0.6, ctx.currentTime, fadeSeconds / 3);

    const nodes: AudioNode[] = [];
    switch (key) {
      case 'pioggia': {
        const noise = makeNoiseSource(ctx, true);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        filter.Q.value = 0.6;
        const hiss = ctx.createBiquadFilter();
        hiss.type = 'highpass';
        hiss.frequency.value = 800;
        noise.connect(filter).connect(hiss).connect(gain);
        noise.start();
        nodes.push(noise, filter, hiss);
        // gocce irregolari sul vetro
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.13;
        lfoGain.gain.value = 420;
        lfo.connect(lfoGain).connect(filter.frequency);
        lfo.start();
        nodes.push(lfo, lfoGain);
        break;
      }
      case 'mare': {
        const noise = makeNoiseSource(ctx, true);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 420;
        const swell = ctx.createGain();
        swell.gain.value = 0.7;
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.08;
        lfoGain.gain.value = 0.28;
        lfo.connect(lfoGain).connect(swell.gain);
        lfo.start();
        noise.connect(filter).connect(swell).connect(gain);
        noise.start();
        nodes.push(noise, filter, swell, lfo, lfoGain);
        break;
      }
      case 'sala-ballo': {
        const murmur = makeNoiseSource(ctx, true);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 520;
        filter.Q.value = 1.4;
        const level = ctx.createGain();
        level.gain.value = 0.35;
        murmur.connect(filter).connect(level).connect(gain);
        murmur.start();
        nodes.push(murmur, filter, level);
        const pad = ctx.createOscillator();
        const padGain = ctx.createGain();
        pad.type = 'sawtooth';
        pad.frequency.value = 110;
        padGain.gain.value = 0.03;
        const padFilter = ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 700;
        pad.connect(padFilter).connect(padGain).connect(gain);
        pad.start();
        nodes.push(pad, padGain, padFilter);
        break;
      }
      case 'corridoio': {
        const hum = ctx.createOscillator();
        const humGain = ctx.createGain();
        hum.type = 'sine';
        hum.frequency.value = 58;
        humGain.gain.value = 0.16;
        hum.connect(humGain).connect(gain);
        hum.start();
        const air = makeNoiseSource(ctx, true);
        const airFilter = ctx.createBiquadFilter();
        airFilter.type = 'lowpass';
        airFilter.frequency.value = 260;
        const airGain = ctx.createGain();
        airGain.gain.value = 0.25;
        air.connect(airFilter).connect(airGain).connect(gain);
        air.start();
        nodes.push(hum, humGain, air, airFilter, airGain);
        break;
      }
      case 'cucina': {
        const air = makeNoiseSource(ctx, true);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 0.8;
        const level = ctx.createGain();
        level.gain.value = 0.3;
        air.connect(filter).connect(level).connect(gain);
        air.start();
        nodes.push(air, filter, level);
        break;
      }
      default:
        break;
    }

    this.currentAmbience = { key, nodes, gain };
  }

  private stopAmbience(fadeSeconds: number): void {
    const current = this.currentAmbience;
    const ctx = this.ctx;
    if (!current || !ctx) {
      this.currentAmbience = null;
      return;
    }
    current.gain.gain.setTargetAtTime(0, ctx.currentTime, Math.max(0.05, fadeSeconds / 3));
    const nodes = current.nodes;
    const gainNode = current.gain;
    window.setTimeout(
      () => {
        for (const node of nodes) {
          try {
            (node as OscillatorNode).stop?.();
          } catch {
            /* già fermato */
          }
          node.disconnect();
        }
        gainNode.disconnect();
      },
      Math.max(120, fadeSeconds * 1000 + 200),
    );
    this.currentAmbience = null;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Tema principale: jazz notturno generativo
  // ───────────────────────────────────────────────────────────────────────────

  startMusic(): void {
    if (this.musicTimer !== null) return;
    const ctx = this.ctx;
    if (!ctx || !this.busMusic) return;

    // ii–V–I in re minore, con sostituzioni: il giro non si ripete mai identico
    const progression = [
      [146.83, 174.61, 220, 261.63], // Dm7
      [196, 246.94, 293.66, 349.23], // G7
      [130.81, 164.81, 196, 246.94], // Cmaj7
      [110, 138.59, 164.81, 207.65], // A7♭9
    ];
    let bar = 0;
    const beat = 0.52;

    const step = (): void => {
      if (!this.ctx || !this.busMusic || useSettings.getState().muted) return;
      const chord = progression[bar % progression.length] ?? progression[0]!;
      const now = this.ctx.currentTime + 0.02;

      // contrabbasso: fondamentale e quinta, walking
      const root = chord[0]! / 2;
      const walk = [root, root * 1.5, root * 1.335, root * 1.26];
      walk.forEach((f, i) => {
        this.tone(f, beat * 0.9, 0.16, 'triangle', now + i * beat, this.busMusic!);
      });

      // accordo di piano, voicing rado
      const voicing = [chord[1]!, chord[2]!, chord[3]!];
      voicing.forEach((f, i) => {
        this.tone(f, beat * 1.6, 0.05, 'sine', now + beat * 0.5 + i * 0.03, this.busMusic!);
      });

      // spazzole sul rullante
      for (let i = 0; i < 4; i += 1) {
        this.noiseBurst(0.12, 5200, 0.028, 1.6, i * beat + 0.26, this.busMusic!);
      }

      // frase di sax ogni due battute, note dell'accordo
      if (bar % 2 === 1) {
        const notes = [chord[3]!, chord[2]! * 2, chord[1]! * 2, chord[2]!];
        notes.forEach((f, i) => {
          this.tone(f, beat * 0.7, 0.045, 'sawtooth', now + beat * (0.75 + i * 0.5), this.busMusic!, 1600);
        });
      }
      bar += 1;
    };

    step();
    this.musicTimer = window.setInterval(step, beat * 4 * 1000);
  }

  stopMusic(): void {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    for (const node of this.musicNodes) {
      try {
        (node as OscillatorNode).stop?.();
      } catch {
        /* già fermato */
      }
    }
    this.musicNodes = [];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Primitive
  // ───────────────────────────────────────────────────────────────────────────

  private tone(
    freq: number,
    duration: number,
    peak: number,
    type: OscillatorType,
    at: number,
    bus: GainNode,
    filterHz?: number,
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    let tail: AudioNode = gain;
    if (filterHz) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterHz;
      gain.connect(filter);
      tail = filter;
    }
    osc.connect(gain);
    tail.connect(bus);
    osc.start(at);
    osc.stop(at + duration + 0.05);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private blip(freq: number, duration: number, peak: number, type: OscillatorType, delay = 0): void {
    const ctx = this.ctx;
    if (!ctx || !this.busEffects) return;
    this.tone(freq, duration, peak, type, ctx.currentTime + delay, this.busEffects);
  }

  private chord(freqs: number[], duration: number, peak: number, at?: number): void {
    const ctx = this.ctx;
    if (!ctx || !this.busEffects) return;
    const start = at ?? ctx.currentTime;
    freqs.forEach((f, i) => this.tone(f, duration, peak, 'sine', start + i * 0.02, this.busEffects!, 3200));
  }

  private noiseBurst(
    duration: number,
    filterHz: number,
    peak: number,
    q: number,
    delay = 0,
    bus?: GainNode,
  ): void {
    const ctx = this.ctx;
    const target = bus ?? this.busEffects;
    if (!ctx || !target) return;
    const at = ctx.currentTime + delay;
    const source = makeNoiseSource(ctx, false);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterHz;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    source.connect(filter).connect(gain).connect(target);
    source.start(at);
    source.stop(at + duration + 0.05);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
}

function makeNoiseSource(ctx: AudioContext, loop: boolean): AudioBufferSourceNode {
  const seconds = loop ? 3 : 0.6;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // rumore rosa approssimato: più naturale del bianco per pioggia e mare
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  return source;
}

/** Riverbero della sala da ballo: decadimento esponenziale con code stereo. */
function makeImpulse(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return impulse;
}

export const audio = new AudioEngine();
