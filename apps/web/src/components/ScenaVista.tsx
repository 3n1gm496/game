import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SceneRenderer, type SceneManifest } from '../scene/renderer.js';
import { useSettings } from '../store/settings.js';

/**
 * L'ambiente giocabile: sotto una scena Pixi a livelli, sopra i punti
 * interattivi come veri pulsanti HTML — così restano leggibili da VoiceOver,
 * raggiungibili da tastiera e sensibili alla dimensione del testo.
 */

const cache = new Map<string, SceneManifest>();

async function caricaManifesto(chiave: string): Promise<SceneManifest | null> {
  const inCache = cache.get(chiave);
  if (inCache) return inCache;
  try {
    const risposta = await fetch(`/assets/scene/${chiave}/scene.json`);
    if (!risposta.ok) return null;
    const dati = (await risposta.json()) as SceneManifest;
    cache.set(chiave, dati);
    return dati;
  } catch {
    return null;
  }
}

export function ScenaVista({
  chiave,
  nomeAmbiente,
  onHotspot,
  hotspotAttivi,
  bloccata,
}: {
  chiave: string;
  nomeAmbiente: string;
  onHotspot: (hotspot: string) => void;
  hotspotAttivi: Set<string>;
  bloccata: boolean;
}): ReactNode {
  const contenitore = useRef<HTMLDivElement>(null);
  const renderer = useRef<SceneRenderer | null>(null);
  const [manifesto, setManifesto] = useState<SceneManifest | null>(null);
  const [pronta, setPronta] = useState(false);
  const quality = useSettings((s) => s.quality);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  // creazione e distruzione del renderer: una sola volta per montaggio
  useEffect(() => {
    let vivo = true;
    const elemento = contenitore.current;
    if (!elemento) return;
    const istanza = new SceneRenderer({ container: elemento, quality, reducedMotion });
    renderer.current = istanza;
    void istanza.init().then(() => {
      if (!vivo) istanza.destroy();
    });
    const suResize = (): void => istanza.resize();
    window.addEventListener('resize', suResize);
    window.addEventListener('orientationchange', suResize);
    return () => {
      vivo = false;
      window.removeEventListener('resize', suResize);
      window.removeEventListener('orientationchange', suResize);
      istanza.destroy();
      renderer.current = null;
    };
    // il renderer non va ricreato al cambio di qualità: c'è `setQuality`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderer.current?.setQuality(quality, reducedMotion);
  }, [quality, reducedMotion]);

  useEffect(() => {
    let vivo = true;
    setPronta(false);
    void caricaManifesto(chiave).then(async (dati) => {
      if (!vivo) return;
      setManifesto(dati);
      if (dati && renderer.current) {
        await renderer.current.swap(dati, `/assets/scene/${chiave}`);
      }
      if (vivo) setPronta(true);
    });
    return () => {
      vivo = false;
    };
  }, [chiave]);

  // parallasse: puntatore su desktop, inclinazione dove disponibile
  useEffect(() => {
    if (reducedMotion) return;
    const suMovimento = (e: PointerEvent): void => {
      const rect = contenitore.current?.getBoundingClientRect();
      if (!rect) return;
      renderer.current?.setParallax(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const suOrientamento = (e: DeviceOrientationEvent): void => {
      if (e.gamma === null || e.beta === null) return;
      renderer.current?.setParallax(e.gamma / 45, (e.beta - 45) / 45);
    };
    window.addEventListener('pointermove', suMovimento, { passive: true });
    window.addEventListener('deviceorientation', suOrientamento);
    return () => {
      window.removeEventListener('pointermove', suMovimento);
      window.removeEventListener('deviceorientation', suOrientamento);
    };
  }, [reducedMotion]);

  return (
    <div className="scena" ref={contenitore}>
      <div className="scena__velo" aria-hidden="true" />
      {!pronta ? (
        <div className="scena__attesa" role="status">
          <span className="mono">{nomeAmbiente}</span>
        </div>
      ) : null}
      <ul className="scena__hotspot" aria-label={`Punti da esaminare: ${nomeAmbiente}`}>
        {(manifesto?.hotspot ?? []).map((h) => {
          const disponibile = hotspotAttivi.has(h.chiave);
          return (
            <li
              key={h.chiave}
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.larghezza}%`,
                height: `${h.altezza}%`,
              }}
            >
              <button
                type="button"
                className={`hotspot${disponibile ? ' hotspot--attivo' : ''}`}
                disabled={bloccata}
                onClick={() => onHotspot(h.chiave)}
                aria-label={`Esamina: ${h.etichetta}${disponibile ? ' — qualcosa attira l’attenzione' : ''}`}
              >
                <span className="hotspot__anello" aria-hidden="true" />
                <span className="hotspot__etichetta">{h.etichetta}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
