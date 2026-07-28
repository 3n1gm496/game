/**
 * Ponte verso i token di design del motore (`@meridien/engine/design`).
 *
 * I token sono l'unica fonte di verità dei colori: qui vengono soltanto letti,
 * mai ridefiniti. Il caricamento è dinamico per un motivo pratico: il tool deve
 * funzionare sia quando il workspace è installato (specificatore di pacchetto)
 * sia quando viene lanciato direttamente con `npx tsx` da un checkout pulito
 * (percorso relativo al sorgente). La forma del modulo è descritta qui sotto,
 * così il typecheck resta rigoroso senza dipendere dagli artefatti di build.
 */

export interface EngineDesign {
  readonly PALETTE: Readonly<Record<string, string>>;
  readonly HIGH_CONTRAST: Readonly<Record<string, string | undefined>>;
  readonly SPACING: readonly number[];
  readonly RADIUS: Readonly<Record<string, number>>;
  readonly TYPE_SCALE: readonly number[];
  readonly TEXT_SCALE_STEPS: Readonly<Record<string, number>>;
  readonly SHADOWS: Readonly<Record<string, string>>;
  readonly MOTION: Readonly<Record<string, { duration: number; easing: string }>>;
  readonly FONTS: Readonly<Record<string, string>>;
  readonly RELEVANCE_COLOR: Readonly<Record<string, string>>;
  toCssVariables(highContrast?: boolean): string;
}

const SPECIFIERS: readonly string[] = [
  '@meridien/engine/design',
  new URL('../../../packages/engine/src/design/tokens.ts', import.meta.url).href,
];

let cached: EngineDesign | undefined;

export async function loadDesign(): Promise<EngineDesign> {
  if (cached) return cached;
  const errors: string[] = [];
  for (const specifier of SPECIFIERS) {
    try {
      const mod = (await import(specifier)) as unknown as EngineDesign;
      if (typeof mod.toCssVariables !== 'function' || !mod.PALETTE) {
        throw new Error('modulo dei token incompleto');
      }
      cached = mod;
      return mod;
    } catch (error) {
      errors.push(`${specifier}: ${(error as Error).message}`);
    }
  }
  throw new Error(`Impossibile caricare i token di design.\n  ${errors.join('\n  ')}`);
}

/** Palette tipizzata per comodità dei moduli di disegno. */
export interface Palette {
  ink: string;
  night: string;
  nightSoft: string;
  petrol: string;
  petrolLit: string;
  lacquer: string;
  lacquerDeep: string;
  brass: string;
  brassSoft: string;
  ivory: string;
  ivoryDim: string;
  rain: string;
  marble: string;
  plum: string;
}

export async function loadPalette(): Promise<Palette> {
  const design = await loadDesign();
  const p = design.PALETTE;
  const need = (key: keyof Palette): string => {
    const value = p[key];
    if (!value) throw new Error(`Token colore mancante: ${key}`);
    return value;
  };
  return {
    ink: need('ink'),
    night: need('night'),
    nightSoft: need('nightSoft'),
    petrol: need('petrol'),
    petrolLit: need('petrolLit'),
    lacquer: need('lacquer'),
    lacquerDeep: need('lacquerDeep'),
    brass: need('brass'),
    brassSoft: need('brassSoft'),
    ivory: need('ivory'),
    ivoryDim: need('ivoryDim'),
    rain: need('rain'),
    marble: need('marble'),
    plum: need('plum'),
  };
}
