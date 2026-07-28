import { useEffect, type ReactNode } from 'react';
import { useGame } from './store/game.js';
import { useSettings } from './store/settings.js';
import { audio } from './audio/engine.js';
import { benchmarkQuality } from './scene/renderer.js';
import { Apertura, Tutorial } from './screens/Apertura.js';
import { Atrio } from './screens/Atrio.js';
import { Lobby } from './screens/Lobby.js';
import { Dossier } from './screens/Dossier.js';
import { Partita } from './screens/Partita.js';
import { Accusa, Epilogo, Punteggi, Verdetto } from './screens/Finale.js';
import { Avvisi, BarraStato, Sottotitoli } from './components/Avvisi.js';
import { PannelloImpostazioni } from './components/Impostazioni.js';
import { PannelloDiagnostico } from './diag/Pannello.js';

export function App(): ReactNode {
  const init = useGame((s) => s.init);
  const screen = useGame((s) => s.screen);
  const applyToDocument = useSettings((s) => s.applyToDocument);
  const qualityAuto = useSettings((s) => s.qualityAuto);
  const setSetting = useSettings((s) => s.set);

  useEffect(() => {
    applyToDocument();
    init();
  }, [applyToDocument, init]);

  // qualità grafica adattiva, misurata una sola volta all'avvio
  useEffect(() => {
    if (!qualityAuto) return;
    let vivo = true;
    void benchmarkQuality().then((q) => {
      if (vivo) setSetting('quality', q);
    });
    return () => {
      vivo = false;
    };
  }, [qualityAuto, setSetting]);

  // sospensione e ripresa: l'audio non deve continuare in background
  useEffect(() => {
    const cambio = (): void => {
      if (document.visibilityState === 'hidden') audio.suspend();
      else void audio.resume();
    };
    document.addEventListener('visibilitychange', cambio);
    return () => document.removeEventListener('visibilitychange', cambio);
  }, []);

  return (
    <>
      <a className="salta-al-contenuto" href="#principale">
        Salta al contenuto
      </a>
      <BarraStato />
      <main id="principale" className="applicazione">
        {screen === 'apertura' ? <Apertura /> : null}
        {screen === 'tutorial' ? <Tutorial /> : null}
        {screen === 'atrio' || screen === 'ingresso' ? <Atrio /> : null}
        {screen === 'lobby' ? <Lobby /> : null}
        {screen === 'dossier' ? <Dossier /> : null}
        {screen === 'partita' ? <Partita /> : null}
        {screen === 'accusa' ? <Accusa /> : null}
        {screen === 'verdetto' ? <Verdetto /> : null}
        {screen === 'epilogo' ? <Epilogo /> : null}
        {screen === 'punteggi' ? <Punteggi /> : null}
      </main>
      <PannelloImpostazioni />
      <Avvisi />
      <Sottotitoli />
      <PannelloDiagnostico />
      <div className="grana" aria-hidden="true" />
    </>
  );
}
