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
export type SfxKey = 'clic' | 'carta' | 'indizio' | 'porta' | 'passi' | 'ascensore' | 'ticchettio' | 'notifica' | 'conto-alla-rovescia' | 'verdetto' | 'vittoria' | 'sconfitta' | 'sipario' | 'campanello' | 'tuono';
export interface Caption {
    id: number;
    text: string;
    at: number;
}
type CaptionListener = (caption: Caption) => void;
export declare class AudioEngine {
    private ctx;
    private master;
    private busMusic;
    private busAmbience;
    private busEffects;
    private reverb;
    private currentAmbience;
    private musicTimer;
    private musicNodes;
    private captionListeners;
    private started;
    get isRunning(): boolean;
    onCaption(listener: CaptionListener): () => void;
    private emitCaption;
    /** Va chiamato da un gestore di evento utente (tocco, clic, tasto). */
    unlock(): Promise<void>;
    applyVolumes(): void;
    suspend(): void;
    resume(): Promise<void>;
    dispose(): void;
    play(key: SfxKey): void;
    setAmbience(key: AmbienceKey, fadeSeconds?: number): void;
    private stopAmbience;
    startMusic(): void;
    stopMusic(): void;
    private tone;
    private blip;
    private chord;
    private noiseBurst;
}
export declare const audio: AudioEngine;
export {};
//# sourceMappingURL=engine.d.ts.map