import { Application, Assets, Container, Graphics, Sprite, type Texture } from 'pixi.js';
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
  atmosfera?: { pioggia: boolean; nebbia: number; grana: number; dominante: string };
  layer: { file: string; profondita: number; parallasse: number; ruolo: string }[];
  luci?: { chiave: string; x: number; y: number; raggio: number; colore: string; intensita: number }[];
  hotspot: SceneHotspot[];
}

export interface RendererOptions {
  container: HTMLElement;
  quality: QualityLevel;
  reducedMotion: boolean;
}

const RAIN_COUNT: Record<QualityLevel, number> = { alta: 220, media: 90, bassa: 0 };

export class SceneRenderer {
  private app: Application | null = null;
  private world = new Container();
  private weather = new Container();
  private layers: { sprite: Sprite; parallax: number }[] = [];
  private drops: { g: Graphics; speed: number; len: number }[] = [];
  private quality: QualityLevel;
  private reducedMotion: boolean;
  private targetX = 0;
  private targetY = 0;
  private offsetX = 0;
  private offsetY = 0;
  private destroyed = false;
  private loadedUrls = new Set<string>();
  private tickerFn: (() => void) | null = null;
  private pioggiaAttiva = true;

  constructor(private readonly options: RendererOptions) {
    this.quality = options.quality;
    this.reducedMotion = options.reducedMotion;
  }

  async init(): Promise<void> {
    if (this.app || this.destroyed) return;
    const app = new Application();
    await app.init({
      background: 0x0b1220,
      antialias: this.quality === 'alta',
      resolution: Math.min(window.devicePixelRatio || 1, this.quality === 'alta' ? 2 : 1.5),
      autoDensity: true,
      resizeTo: this.options.container,
      preference: 'webgl',
      powerPreference: 'high-performance',
    });
    if (this.destroyed) {
      app.destroy(true, { children: true });
      return;
    }
    this.app = app;
    app.canvas.setAttribute('aria-hidden', 'true');
    app.canvas.style.display = 'block';
    app.canvas.style.width = '100%';
    app.canvas.style.height = '100%';
    this.options.container.appendChild(app.canvas);
    app.stage.addChild(this.world);
    app.stage.addChild(this.weather);

    this.tickerFn = () => this.frame();
    app.ticker.add(this.tickerFn);
  }

  /** Carica una scena e sostituisce quella corrente, liberando le texture. */
  async swap(manifest: SceneManifest, baseUrl: string): Promise<void> {
    if (!this.app || this.destroyed) return;
    this.clearLayers();
    this.pioggiaAttiva = manifest.atmosfera?.pioggia !== false;

    for (const layer of manifest.layer) {
      const url = `${baseUrl}/${layer.file}`;
      let texture: Texture;
      try {
        texture = await Assets.load<Texture>(url);
        this.loadedUrls.add(url);
      } catch {
        // un livello mancante non deve interrompere la scena: si prosegue con
        // quelli disponibili, che compongono comunque un'immagine leggibile
        continue;
      }
      if (this.destroyed || !this.app) return;
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      this.world.addChild(sprite);
      this.layers.push({ sprite, parallax: layer.parallasse });
    }

    this.buildWeather();
    this.layout();
  }

  private clearLayers(): void {
    for (const { sprite } of this.layers) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ children: true, texture: false });
    }
    this.layers = [];
    for (const drop of this.drops) {
      drop.g.parent?.removeChild(drop.g);
      drop.g.destroy();
    }
    this.drops = [];
    this.weather.removeChildren();
  }

  private buildWeather(): void {
    if (!this.app) return;
    const pioggia = this.pioggiaAttiva;
    const count = this.reducedMotion || !pioggia ? 0 : RAIN_COUNT[this.quality];
    const { width, height } = this.app.screen;
    for (let i = 0; i < count; i += 1) {
      const len = 12 + Math.random() * 26;
      const g = new Graphics();
      g.moveTo(0, 0).lineTo(-3, len).stroke({ color: 0x9cc4e4, width: 1, alpha: 0.28 });
      g.x = Math.random() * width;
      g.y = Math.random() * height;
      this.weather.addChild(g);
      this.drops.push({ g, speed: 5 + Math.random() * 9, len });
    }
    if (this.reducedMotion && pioggia && this.quality !== 'bassa') {
      // pioggia ferma: alcune scie statiche mantengono l'atmosfera senza moto
      for (let i = 0; i < 40; i += 1) {
        const g = new Graphics();
        const len = 14 + Math.random() * 20;
        g.moveTo(0, 0).lineTo(-3, len).stroke({ color: 0x9cc4e4, width: 1, alpha: 0.16 });
        g.x = Math.random() * width;
        g.y = Math.random() * height;
        this.weather.addChild(g);
      }
    }
  }

  /** Aggiorna il bersaglio della parallasse (−1…1 su entrambi gli assi). */
  setParallax(x: number, y: number): void {
    this.targetX = Math.max(-1, Math.min(1, x));
    this.targetY = Math.max(-1, Math.min(1, y));
  }

  setQuality(quality: QualityLevel, reducedMotion: boolean): void {
    if (this.quality === quality && this.reducedMotion === reducedMotion) return;
    this.quality = quality;
    this.reducedMotion = reducedMotion;
    for (const drop of this.drops) {
      drop.g.parent?.removeChild(drop.g);
      drop.g.destroy();
    }
    this.drops = [];
    this.weather.removeChildren();
    this.buildWeather();
  }

  resize(): void {
    this.layout();
  }

  private layout(): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;
    for (const { sprite } of this.layers) {
      const texW = sprite.texture.width || 1;
      const texH = sprite.texture.height || 1;
      // riempimento con leggero sovradimensionamento: la parallasse non deve
      // mai scoprire i bordi
      const scale = Math.max(width / texW, height / texH) * 1.12;
      sprite.scale.set(scale);
      sprite.x = width / 2;
      sprite.y = height / 2;
    }
  }

  private frame(): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;

    if (!this.reducedMotion) {
      this.offsetX += (this.targetX - this.offsetX) * 0.06;
      this.offsetY += (this.targetY - this.offsetY) * 0.06;
      const amp = Math.min(width, height) * 0.035;
      for (const { sprite, parallax } of this.layers) {
        sprite.x = width / 2 - this.offsetX * amp * parallax;
        sprite.y = height / 2 - this.offsetY * amp * parallax * 0.6;
      }
      for (const drop of this.drops) {
        drop.g.y += drop.speed;
        drop.g.x -= drop.speed * 0.22;
        if (drop.g.y > height + drop.len) {
          drop.g.y = -drop.len;
          drop.g.x = Math.random() * (width + 80);
        }
        if (drop.g.x < -20) drop.g.x = width + 20;
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.clearLayers();
    if (this.app) {
      if (this.tickerFn) this.app.ticker.remove(this.tickerFn);
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
    // libera le texture caricate: senza questo, ogni rivincita farebbe crescere
    // la memoria della GPU
    for (const url of this.loadedUrls) {
      void Assets.unload(url).catch(() => undefined);
    }
    this.loadedUrls.clear();
    this.tickerFn = null;
  }

  get textureCount(): number {
    return this.loadedUrls.size;
  }
}

/** Misura grezza delle prestazioni per scegliere il livello di qualità. */
export async function benchmarkQuality(): Promise<QualityLevel> {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  if (memory <= 2 || cores <= 2) return 'bassa';

  return new Promise<QualityLevel>((resolve) => {
    let frames = 0;
    const start = performance.now();
    const tick = (): void => {
      frames += 1;
      const elapsed = performance.now() - start;
      if (elapsed < 500) {
        requestAnimationFrame(tick);
        return;
      }
      const fps = (frames / elapsed) * 1000;
      resolve(fps >= 50 ? 'alta' : fps >= 32 ? 'media' : 'bassa');
    };
    requestAnimationFrame(tick);
  });
}
