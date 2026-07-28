import type { QualityLevel } from '../store/settings.js';
/**
 * Renderer 2.5D.
 *
 * Ogni ambiente è una pila di livelli SVG con fattori di parallasse diversi.
 * Sopra passano pioggia, luce volumetrica e grana di carta. L'interazione non
 * avviene qui: gli hotspot sono pulsanti HTML sovrapposti, così restano
 * raggiungibili da VoiceOver e da tastiera.
 *
 * Una sola `Application` Pixi vive per tutta la sessione e viene riusata a
 * ogni cambio di scena: `swap()` distrugge esplicitamente i livelli
 * precedenti, così una rivincita non lascia texture appese.
 */
/**
 * Forma del `scene.json` prodotto da `pnpm generate:assets`.
 * Le chiavi sono in italiano come il resto del progetto.
 */
export interface SceneHotspot {
    chiave: string;
    etichetta: string;
    /** posizione e dimensione in percentuale della scena */
    x: number;
    y: number;
    larghezza: number;
    altezza: number;
}
export interface SceneManifest {
    chiave: string;
    titolo: string;
    descrizione: string;
    larghezza: number;
    altezza: number;
    atmosfera?: {
        pioggia: boolean;
        nebbia: number;
        grana: number;
        dominante: string;
    };
    layer: {
        file: string;
        profondita: number;
        parallasse: number;
        ruolo: string;
    }[];
    luci?: {
        chiave: string;
        x: number;
        y: number;
        raggio: number;
        colore: string;
        intensita: number;
    }[];
    hotspot: SceneHotspot[];
}
export interface RendererOptions {
    container: HTMLElement;
    quality: QualityLevel;
    reducedMotion: boolean;
}
export declare class SceneRenderer {
    private readonly options;
    private app;
    private world;
    private weather;
    private layers;
    private drops;
    private quality;
    private reducedMotion;
    private targetX;
    private targetY;
    private offsetX;
    private offsetY;
    private destroyed;
    private loadedUrls;
    private tickerFn;
    private pioggiaAttiva;
    constructor(options: RendererOptions);
    init(): Promise<void>;
    /** Carica una scena e sostituisce quella corrente, liberando le texture. */
    swap(manifest: SceneManifest, baseUrl: string): Promise<void>;
    private clearLayers;
    private buildWeather;
    /** Aggiorna il bersaglio della parallasse (−1…1 su entrambi gli assi). */
    setParallax(x: number, y: number): void;
    setQuality(quality: QualityLevel, reducedMotion: boolean): void;
    resize(): void;
    private layout;
    private frame;
    destroy(): void;
    get textureCount(): number;
}
/** Misura grezza delle prestazioni per scegliere il livello di qualità. */
export declare function benchmarkQuality(): Promise<QualityLevel>;
//# sourceMappingURL=renderer.d.ts.map