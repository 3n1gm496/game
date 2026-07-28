import type { AiRequest } from '@meridien/engine';
import type { AIProvider, AiOutcome, ProviderConfig } from '../types.js';
import { buildPrompt, extractJson } from '../prompt.js';
import { parseOutcome } from '../parse.js';

/**
 * Provider su dispositivo per l'app iOS.
 *
 * Il ponte è il plugin Capacitor `MeridienLocalModel` (sorgenti Swift in
 * `apps/ios/plugin/`), che usa MLX Swift LM. Il modello gira **solo** per
 * funzioni private e non autoritative del singolo giocatore:
 *
 *   - assistente personale del detective;
 *   - riscrittura delle proprie note;
 *   - riassunto dei propri indizi;
 *   - suggerimenti facoltativi;
 *   - resa cosmetica di dialoghi già validati dal server.
 *
 * Nulla di ciò che produce entra nello stato di gioco: ogni informazione
 * condivisa e ogni modifica di partita passano comunque dal server.
 * Il modello non è mai necessario per partecipare: se manca, se il download
 * non è stato fatto o se il dispositivo è in stress termico, il provider si
 * dichiara non disponibile e il gioco usa quello deterministico.
 *
 * Modello di riferimento documentato in `AI_ARCHITECTURE.md` (autore, licenza,
 * origine, versione, quantizzazione, checksum). Il download è separato dall'app.
 */

export interface LocalModelBridge {
  /** true se il plugin nativo è presente (solo build iOS) */
  isSupported(): Promise<{ supported: boolean }>;
  /** stato del modello sul dispositivo */
  status(): Promise<{
    installed: boolean;
    modelId: string;
    sizeBytes: number;
    freeDiskBytes: number;
    thermalState: 'nominal' | 'fair' | 'serious' | 'critical';
    busy: boolean;
  }>;
  generate(options: {
    system: string;
    prompt: string;
    maxTokens: number;
    temperature: number;
  }): Promise<{ text: string }>;
}

declare global {
  // eslint-disable-next-line no-var
  var MeridienLocalModel: LocalModelBridge | undefined;
}

/** Solo queste richieste possono essere servite dal modello locale. */
const PRIVATE_KINDS = new Set<AiRequest['kind']>(['recap', 'hint', 'butler']);

export class OnDeviceAppleProvider implements AIProvider {
  readonly name = 'on-device-apple';
  private readonly maxTokens: number;
  private readonly temperature: number;
  private bridgeReady: boolean | null = null;
  private inFlight = 0;

  constructor(config: ProviderConfig = { provider: 'on-device-apple' }) {
    this.maxTokens = Math.min(config.maxOutputTokens ?? 220, 320);
    this.temperature = config.temperature ?? 0.6;
  }

  private get bridge(): LocalModelBridge | undefined {
    return globalThis.MeridienLocalModel;
  }

  isAvailable(): boolean {
    // sincrono per l'interfaccia; `prepare()` fa il controllo completo
    return Boolean(this.bridge) && this.bridgeReady !== false && this.inFlight === 0;
  }

  /**
   * Controllo completo: plugin presente, modello scaricato, spazio disponibile,
   * stato termico accettabile, nessuna inferenza già in corso.
   */
  async prepare(): Promise<{ ready: boolean; reason?: string }> {
    const bridge = this.bridge;
    if (!bridge) {
      this.bridgeReady = false;
      return { ready: false, reason: 'plugin non presente (non è una build iOS)' };
    }
    try {
      const supported = await bridge.isSupported();
      if (!supported.supported) {
        this.bridgeReady = false;
        return { ready: false, reason: 'dispositivo non supportato' };
      }
      const status = await bridge.status();
      if (!status.installed) {
        this.bridgeReady = false;
        return { ready: false, reason: 'modello non scaricato' };
      }
      if (status.busy || this.inFlight > 0) {
        return { ready: false, reason: 'inferenza già in corso' };
      }
      if (status.thermalState === 'serious' || status.thermalState === 'critical') {
        return { ready: false, reason: `stato termico ${status.thermalState}` };
      }
      if (status.freeDiskBytes < 200 * 1024 * 1024) {
        return { ready: false, reason: 'spazio su disco insufficiente' };
      }
      this.bridgeReady = true;
      return { ready: true };
    } catch (error) {
      this.bridgeReady = false;
      return { ready: false, reason: error instanceof Error ? error.message : 'errore del ponte nativo' };
    }
  }

  async respond(request: AiRequest): Promise<AiOutcome> {
    if (!PRIVATE_KINDS.has(request.kind)) {
      throw new Error(`il modello locale non può servire richieste di tipo ${request.kind}`);
    }
    const bridge = this.bridge;
    if (!bridge) throw new Error('ponte nativo assente');
    const ready = await this.prepare();
    if (!ready.ready) throw new Error(ready.reason ?? 'modello locale non pronto');

    // una sola inferenza pesante alla volta
    this.inFlight += 1;
    try {
      const spec = buildPrompt(request);
      const result = await bridge.generate({
        system: spec.system,
        prompt: `${spec.user}\n\nRispondi con un solo oggetto JSON di questa forma: ${spec.jsonShape}`,
        maxTokens: Math.min(spec.maxTokens, this.maxTokens),
        temperature: this.temperature,
      });
      return parseOutcome(request.kind, extractJson(result.text), this.name);
    } finally {
      this.inFlight -= 1;
    }
  }
}
