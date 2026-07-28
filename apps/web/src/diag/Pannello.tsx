import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { useSettings } from '../store/settings.js';

/**
 * Pannello diagnostico. Compare solo in sviluppo e solo con `?diag=1`:
 * nella build di produzione l'intero componente viene eliminato dal bundle
 * perché `__DEV_TOOLS__` è una costante falsa.
 */

declare const __DEV_TOOLS__: boolean;
declare const __APP_VERSION__: string;

interface MemoriaPerformance extends Performance {
  memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
}

export function PannelloDiagnostico(): ReactNode {
  const abilitato =
    typeof __DEV_TOOLS__ !== 'undefined' &&
    __DEV_TOOLS__ &&
    new URLSearchParams(location.search).get('diag') === '1';

  const [fps, setFps] = useState(0);
  const [memoria, setMemoria] = useState(0);
  const room = useGame((s) => s.room);
  const status = useGame((s) => s.status);
  const latency = useGame((s) => s.latency);
  const client = useGame((s) => s.client);
  const quality = useSettings((s) => s.quality);

  useEffect(() => {
    if (!abilitato) return;
    let frame = 0;
    let ultimo = performance.now();
    let id = 0;
    const conta = (): void => {
      frame += 1;
      const ora = performance.now();
      if (ora - ultimo >= 1000) {
        setFps(Math.round((frame * 1000) / (ora - ultimo)));
        frame = 0;
        ultimo = ora;
        const perf = performance as MemoriaPerformance;
        if (perf.memory) setMemoria(Math.round(perf.memory.usedJSHeapSize / 1048576));
      }
      id = requestAnimationFrame(conta);
    };
    id = requestAnimationFrame(conta);
    return () => cancelAnimationFrame(id);
  }, [abilitato]);

  if (!abilitato) return null;

  return (
    <aside className="diagnostica" aria-label="Pannello diagnostico">
      <dl>
        <dt>fps</dt>
        <dd className={fps < 45 ? 'diagnostica--allarme' : ''}>{fps}</dd>
        <dt>memoria</dt>
        <dd>{memoria ? `${memoria} MB` : 'n.d.'}</dd>
        <dt>latenza</dt>
        <dd>{latency} ms</dd>
        <dt>ws</dt>
        <dd>
          {status} · ↑{client?.messagesSent ?? 0} ↓{client?.messagesReceived ?? 0}
        </dd>
        <dt>versione</dt>
        <dd>{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}</dd>
        <dt>qualità</dt>
        <dd>{quality}</dd>
        <dt>stanza</dt>
        <dd>{room ? `${room.code} · ${room.phase} · v${room.version}` : '—'}</dd>
        <dt>seme</dt>
        <dd>{room?.settings.seed ?? '—'}</dd>
        <dt>caso</dt>
        <dd>
          {room?.settings.caseId ?? '—'}
          {room?.variantId ? ` · ${room.variantId}` : ''}
        </dd>
      </dl>
    </aside>
  );
}
