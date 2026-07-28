import { create } from 'zustand';

/**
 * Preferenze locali: audio, accessibilità, qualità grafica.
 * Vivono solo sul dispositivo, non vengono mai inviate al server e non
 * contengono nulla di identificativo.
 */

export type QualityLevel = 'alta' | 'media' | 'bassa';
export type TextScale = 'piccolo' | 'normale' | 'grande' | 'enorme';

export interface Settings {
  // audio
  muted: boolean;
  volumeMaster: number;
  volumeMusic: number;
  volumeAmbience: number;
  volumeEffects: number;
  subtitles: boolean;

  // accessibilità
  reducedMotion: boolean;
  highContrast: boolean;
  textScale: TextScale;
  legibleFont: boolean;
  haptics: boolean;
  extendedTimers: boolean;

  // grafica
  quality: QualityLevel;
  qualityAuto: boolean;

  set<K extends keyof Settings>(key: K, value: Settings[K]): void;
  toggle(key: 'muted' | 'subtitles' | 'reducedMotion' | 'highContrast' | 'legibleFont' | 'haptics' | 'extendedTimers'): void;
  applyToDocument(): void;
}

const KEY = 'meridien.impostazioni';

const DEFAULTS = {
  muted: false,
  volumeMaster: 0.8,
  volumeMusic: 0.55,
  volumeAmbience: 0.6,
  volumeEffects: 0.85,
  subtitles: false,
  reducedMotion: false,
  highContrast: false,
  textScale: 'normale' as TextScale,
  legibleFont: false,
  haptics: true,
  extendedTimers: false,
  quality: 'alta' as QualityLevel,
  qualityAuto: true,
};

function systemReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function systemHighContrast(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-contrast: more)').matches;
}

function load(): typeof DEFAULTS {
  const base = { ...DEFAULTS, reducedMotion: systemReducedMotion(), highContrast: systemHighContrast() };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<typeof DEFAULTS>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

function persist(state: Partial<Settings>): void {
  try {
    const data: Record<string, unknown> = {};
    for (const key of Object.keys(DEFAULTS)) {
      const value = (state as Record<string, unknown>)[key];
      if (value !== undefined) data[key] = value;
    }
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* archiviazione non disponibile: le impostazioni valgono per la sessione */
  }
}

const TEXT_SCALE_VALUE: Record<TextScale, string> = {
  piccolo: '0.9',
  normale: '1',
  grande: '1.15',
  enorme: '1.3',
};

export const useSettings = create<Settings>((set, get) => ({
  ...load(),

  set(key, value) {
    set({ [key]: value } as Partial<Settings>);
    persist(get());
    get().applyToDocument();
  },

  toggle(key) {
    const next = !get()[key];
    set({ [key]: next } as Partial<Settings>);
    persist(get());
    get().applyToDocument();
  },

  applyToDocument() {
    const s = get();
    const root = document.documentElement;
    root.dataset.contrast = s.highContrast ? 'alto' : 'normale';
    root.dataset.motion = s.reducedMotion ? 'ridotto' : 'pieno';
    root.dataset.font = s.legibleFont ? 'leggibile' : 'editoriale';
    root.dataset.quality = s.quality;
    root.style.setProperty('--scala-testo', TEXT_SCALE_VALUE[s.textScale]);
  },
}));

/** Vibrazione breve, rispettosa dell'impostazione e della disponibilità. */
export function haptic(pattern: number | number[] = 12): void {
  if (!useSettings.getState().haptics) return;
  const nav = navigator as Navigator & {
    vibrate?: (p: number | number[]) => boolean;
  };
  const capacitor = (globalThis as { MeridienHaptics?: { impact(o: { style: string }): void } }).MeridienHaptics;
  if (capacitor) {
    capacitor.impact({ style: Array.isArray(pattern) || pattern > 20 ? 'medium' : 'light' });
    return;
  }
  nav.vibrate?.(pattern);
}
