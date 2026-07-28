/**
 * Preferenze locali: audio, accessibilità, qualità grafica.
 * Vivono solo sul dispositivo, non vengono mai inviate al server e non
 * contengono nulla di identificativo.
 */
export type QualityLevel = 'alta' | 'media' | 'bassa';
export type TextScale = 'piccolo' | 'normale' | 'grande' | 'enorme';
export interface Settings {
    muted: boolean;
    volumeMaster: number;
    volumeMusic: number;
    volumeAmbience: number;
    volumeEffects: number;
    subtitles: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    textScale: TextScale;
    legibleFont: boolean;
    haptics: boolean;
    extendedTimers: boolean;
    quality: QualityLevel;
    qualityAuto: boolean;
    set<K extends keyof Settings>(key: K, value: Settings[K]): void;
    toggle(key: 'muted' | 'subtitles' | 'reducedMotion' | 'highContrast' | 'legibleFont' | 'haptics' | 'extendedTimers'): void;
    applyToDocument(): void;
}
export declare const useSettings: import("zustand").UseBoundStore<import("zustand").StoreApi<Settings>>;
/** Vibrazione breve, rispettosa dell'impostazione e della disponibilità. */
export declare function haptic(pattern?: number | number[]): void;
//# sourceMappingURL=settings.d.ts.map