import { Application, Assets, Container, Graphics, Sprite, Texture, type TextureSource } from 'pixi.js';
/*
 * Pixi genera i programmi degli shader con `new Function`, che la nostra
 * Content Security Policy vieta: nessun `unsafe-eval`, in nessuna forma.
 * Questo modulo è la via prevista da Pixi per gli ambienti severi — sostituisce
 * la generazione dinamica con un percorso equivalente e statico. L'import va
 * prima di qualunque uso di `Application`, e per questo sta qui in testa.
 */
import 'pixi.js/unsafe-eval';
import type { QualityLevel } from '../store/settings.js';
import { Gradazione, type OpzioniGradazione } from './gradazione.js';

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
  /**
   * Centro del punto, in percentuale della scena — non l'angolo.
   *
   * Il render lo ricava proiettando la posizione 3D dell'oggetto: è il punto
   * dove l'oggetto sta davvero, e il pulsante gli va centrato sopra.
   */
  x: number;
  y: number;
  /** raggio dell'area sensibile, in percentuale del lato minore */
  raggio: number;
  /** livello di appartenenza, per la parallasse */
  layer?: number;
}

export interface SceneManifest {
  chiave: string;
  titolo: string;
  descrizione: string;
  larghezza: number;
  altezza: number;
  atmosfera?: { pioggia: boolean; nebbia: number; grana: number; dominante: string };
  layer: { file: string; profondita: number; parallasse: number; ruolo: string }[];
  luci?: {
    chiave: string;
    x: number;
    y: number;
    raggio: number;
    colore: string;
    intensita: number;
    /** millisecondi di un respiro completo; 0 = luce ferma */
    pulsazione?: number;
  }[];
  hotspot: SceneHotspot[];
}

export interface RendererOptions {
  container: HTMLElement;
  quality: QualityLevel;
  reducedMotion: boolean;
}

const RAIN_COUNT: Record<QualityLevel, number> = { alta: 220, media: 90, bassa: 0 };

/**
 * La gradazione per livello di qualità.
 *
 * Sul livello basso non viene applicata affatto: un passaggio a schermo intero
 * su un telefono lento costa più di quanto renda, e il gioco deve restare
 * giocabile prima che bello.
 */
const GRADAZIONE: Record<QualityLevel, OpzioniGradazione | null> = {
  alta: { grana: 0.055, vignetta: 0.42, aberrazione: 0.0034, forza: 0.85, saturazione: 1.03 },
  media: { grana: 0.038, vignetta: 0.36, aberrazione: 0.0018, forza: 0.78, saturazione: 1.0 },
  bassa: null,
};

/** Alone di luce: bianco al centro, trasparente al bordo, caduta morbida. */
function alone(): TextureSource {
  const lato = 256;
  const tela = document.createElement('canvas');
  tela.width = lato;
  tela.height = lato;
  const ctx = tela.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(lato / 2, lato / 2, 0, lato / 2, lato / 2, lato / 2);
    /*
     * Una caduta lineare produce un disco con il bordo visibile. Questi punti
     * disegnano una curva più vicina a come si spegne una lampadina vera:
     * ripida vicino alla sorgente, lunghissima in periferia.
     */
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.62)');
    g.addColorStop(0.42, 'rgba(255,255,255,0.24)');
    g.addColorStop(0.72, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, lato, lato);
  }
  return Texture.from(tela).source;
}

function tinta(colore: string): number {
  const pulito = colore.replace('#', '');
  const n = Number.parseInt(pulito.length === 3 ? pulito.replace(/./g, '$&$&') : pulito, 16);
  return Number.isFinite(n) ? n : 0xffffff;
}

export class SceneRenderer {
  private app: Application | null = null;
  private world = new Container();
  private lucine = new Container();
  private weather = new Container();
  private layers: { sprite: Sprite; parallax: number }[] = [];
  private fari: { sprite: Sprite; base: number; pulsazione: number; fase: number }[] = [];
  private aloneSorgente: TextureSource | null = null;
  private gradazione: Gradazione | null = null;
  private manifesto: SceneManifest | null = null;
  private drops: { g: Graphics; speed: number; len: number }[] = [];
  private pulviscolo: { sprite: Sprite; vx: number; vy: number; fase: number }[] = [];
  private lampo: Graphics | null = null;
  private lampoResiduo = 0;
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
    app.stage.addChild(this.lucine);
    app.stage.addChild(this.weather);

    /*
     * Il lampo sta sopra tutto e sotto la gradazione: un fulmine deve passare
     * dalla stessa curva del resto, altrimenti sembra un flash bianco appiccicato.
     */
    this.lampo = new Graphics();
    this.lampo.alpha = 0;
    app.stage.addChild(this.lampo);

    this.applicaGradazione();

    this.tickerFn = () => this.frame();
    app.ticker.add(this.tickerFn);
  }

  /**
   * Applica — o toglie — la gradazione all'intera scena.
   *
   * Il filtro sta sullo stage e non sui singoli livelli: pioggia e aloni
   * devono passare dalla stessa curva del fondale, altrimenti si vedrebbe che
   * sono stati aggiunti dopo.
   */
  private applicaGradazione(): void {
    if (!this.app) return;
    const opzioni = GRADAZIONE[this.quality];

    if (!opzioni) {
      this.app.stage.filters = [];
      this.gradazione?.distruggi();
      this.gradazione = null;
      return;
    }

    if (!this.gradazione) {
      this.gradazione = new Gradazione(opzioni);
      this.app.stage.filters = [this.gradazione.filtro];
    } else {
      this.gradazione.regola(opzioni);
    }
    this.gradazione.proporzione(this.app.screen.width, this.app.screen.height);
  }

  /** Carica una scena e sostituisce quella corrente, liberando le texture. */
  async swap(manifest: SceneManifest, baseUrl: string): Promise<void> {
    if (!this.app || this.destroyed) return;
    this.clearLayers();
    this.manifesto = manifest;
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

    this.costruisciLuci(manifest);
    this.costruisciPulviscolo();
    this.buildWeather();
    this.layout();
  }

  /**
   * Gli aloni delle sorgenti luminose.
   *
   * Ogni scena dichiara le proprie luci in `scene.json` — l'insegna, la
   * pensilina, il faro lontano — con posizione, raggio, colore e respiro. Erano
   * lì dall'inizio e nessuno le disegnava: la scena restava illuminata in modo
   * uniforme, che è esattamente ciò che nessun ambiente reale è.
   *
   * Sono sprite in somma additiva: la luce si aggiunge a ciò che c'è sotto,
   * come farebbe davvero, invece di coprirlo.
   */
  private costruisciLuci(manifest: SceneManifest): void {
    if (!this.app || this.quality === 'bassa') return;
    const sorgenti = manifest.luci ?? [];
    if (sorgenti.length === 0) return;

    this.aloneSorgente ??= alone();

    for (const luce of sorgenti) {
      const sprite = new Sprite(new Texture({ source: this.aloneSorgente }));
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      sprite.tint = tinta(luce.colore);
      sprite.alpha = luce.intensita;
      sprite.label = luce.chiave;
      this.lucine.addChild(sprite);
      this.fari.push({
        sprite,
        base: luce.intensita,
        pulsazione: this.reducedMotion ? 0 : (luce.pulsazione ?? 0),
        // fasi diverse: due luci che respirano all'unisono sembrano un errore
        fase: Math.random() * Math.PI * 2,
      });
    }
    this.disponiLuci(manifest);
  }

  /**
   * Il pulviscolo che galleggia nella luce.
   *
   * In una stanza illuminata da una sola lampada l'aria si vede: sono granelli
   * che salgono e scendono senza fretta, e sono ciò che distingue un ambiente
   * dal disegno di un ambiente. Riusa la texture degli aloni, ridotta a pochi
   * pixel, così non costa una texture in più.
   */
  private costruisciPulviscolo(): void {
    if (!this.app || this.quality !== 'alta' || this.reducedMotion) return;
    this.aloneSorgente ??= alone();
    const { width, height } = this.app.screen;

    for (let i = 0; i < 46; i += 1) {
      const sprite = new Sprite(new Texture({ source: this.aloneSorgente }));
      sprite.anchor.set(0.5);
      sprite.blendMode = 'add';
      const raggio = 2 + Math.random() * 5;
      sprite.width = raggio * 2;
      sprite.height = raggio * 2;
      sprite.alpha = 0.1 + Math.random() * 0.22;
      sprite.tint = 0xe0c365;
      sprite.x = Math.random() * width;
      sprite.y = Math.random() * height;
      this.lucine.addChild(sprite);
      this.pulviscolo.push({
        sprite,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.05 - Math.random() * 0.14,
        fase: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Un lampo della tempesta.
   *
   * Due battute: il bagliore vero, brevissimo, e la coda che si spegne. Un
   * lampo lineare sembra un interruttore; questo sembra un fulmine.
   */
  colpoDiLuce(intensita = 1): void {
    if (this.reducedMotion || !this.lampo || !this.app) return;
    const { width, height } = this.app.screen;
    this.lampo.clear();
    this.lampo.rect(0, 0, width, height).fill({ color: 0xdce8f5 });
    this.lampoResiduo = Math.min(0.55, 0.34 * intensita);
    this.lampo.alpha = this.lampoResiduo;
  }

  private disponiLuci(manifest: SceneManifest): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;
    const sorgenti = manifest.luci ?? [];
    this.fari.forEach((faro, i) => {
      const luce = sorgenti[i];
      if (!luce) return;
      faro.sprite.x = (luce.x / 100) * width;
      faro.sprite.y = (luce.y / 100) * height;
      // il raggio è in percentuale del lato minore, come nella scena originale
      const diametro = (luce.raggio / 100) * Math.min(width, height) * 4;
      faro.sprite.width = diametro;
      faro.sprite.height = diametro;
    });
  }

  private clearLayers(): void {
    for (const { sprite } of this.layers) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ children: true, texture: false });
    }
    this.layers = [];
    for (const { sprite } of this.fari) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ texture: false });
    }
    this.fari = [];
    for (const { sprite } of this.pulviscolo) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ texture: false });
    }
    this.pulviscolo = [];
    this.lucine.removeChildren();
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
    this.applicaGradazione();

    // gli aloni dipendono dalla qualità e dal movimento: si rifanno
    for (const { sprite } of this.fari) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ texture: false });
    }
    this.fari = [];
    for (const { sprite } of this.pulviscolo) {
      sprite.parent?.removeChild(sprite);
      sprite.destroy({ texture: false });
    }
    this.pulviscolo = [];
    this.lucine.removeChildren();
    if (this.manifesto) {
      this.costruisciLuci(this.manifesto);
      this.layout();
    }
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
    if (this.manifesto) this.disponiLuci(this.manifesto);
    this.gradazione?.proporzione(width, height);
  }

  private frame(): void {
    if (!this.app) return;
    const { width, height } = this.app.screen;
    const deltaMs = this.app.ticker.deltaMS;

    /*
     * La grana avanza anche a movimento ridotto: non è movimento, è la
     * superficie della pellicola. Quello che si ferma è il respiro delle luci,
     * che invece è animazione a tutti gli effetti.
     */
    this.gradazione?.avanza(deltaMs);

    if (this.lampo && this.lampoResiduo > 0) {
      // caduta rapida, con un rimbalzo: il secondo bagliore del fulmine
      this.lampoResiduo *= this.lampoResiduo > 0.12 ? 0.82 : 0.9;
      if (this.lampoResiduo < 0.004) this.lampoResiduo = 0;
      this.lampo.alpha = this.lampoResiduo;
    }

    for (const punto of this.pulviscolo) {
      punto.fase += deltaMs / 900;
      punto.sprite.x += punto.vx + Math.sin(punto.fase) * 0.12;
      punto.sprite.y += punto.vy;
      if (punto.sprite.y < -8) {
        punto.sprite.y = height + 8;
        punto.sprite.x = Math.random() * width;
      }
      if (punto.sprite.x < -8) punto.sprite.x = width + 8;
      if (punto.sprite.x > width + 8) punto.sprite.x = -8;
    }

    for (const faro of this.fari) {
      if (faro.pulsazione <= 0) continue;
      faro.fase += (deltaMs / faro.pulsazione) * Math.PI * 2;
      // respiro contenuto: una luce che lampeggia distrae, una che palpita vive
      faro.sprite.alpha = faro.base * (0.86 + 0.14 * Math.sin(faro.fase));
    }

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
    this.manifesto = null;
    this.gradazione?.distruggi();
    this.gradazione = null;
    this.lampo?.destroy();
    this.lampo = null;
    this.aloneSorgente?.destroy();
    this.aloneSorgente = null;
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
