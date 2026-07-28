import { useEffect, useState, type ReactNode } from 'react';
import { useSettings, type QualityLevel, type TextScale } from '../store/settings.js';
import { audio } from '../audio/engine.js';
import { FoglioInferiore } from './base.js';
import { aggiornaDisponibile, applicaAggiornamento } from '../pwa/registra.js';

/**
 * Impostazioni: audio, accessibilità, grafica, installazione.
 * Si apre da qualunque schermata con l'evento `meridien:impostazioni`.
 */

export function PannelloImpostazioni(): ReactNode {
  const [aperto, setAperto] = useState(false);
  const s = useSettings();
  const [installabile, setInstallabile] = useState<Event | null>(null);
  const [aggiornamento, setAggiornamento] = useState(false);

  useEffect(() => {
    const apri = (): void => setAperto(true);
    document.addEventListener('meridien:impostazioni', apri);
    const prompt = (e: Event): void => {
      e.preventDefault();
      setInstallabile(e);
    };
    window.addEventListener('beforeinstallprompt', prompt);
    const off = aggiornaDisponibile(() => setAggiornamento(true));
    return () => {
      document.removeEventListener('meridien:impostazioni', apri);
      window.removeEventListener('beforeinstallprompt', prompt);
      off();
    };
  }, []);

  const cursore = (
    etichetta: string,
    chiave: 'volumeMaster' | 'volumeMusic' | 'volumeAmbience' | 'volumeEffects',
  ): ReactNode => (
    <div className="impostazione">
      <label htmlFor={`vol-${chiave}`}>{etichetta}</label>
      <input
        id={`vol-${chiave}`}
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={s[chiave]}
        onChange={(e) => {
          s.set(chiave, Number(e.target.value));
          audio.applyVolumes();
        }}
      />
    </div>
  );

  const interruttore = (
    etichetta: string,
    chiave: 'muted' | 'subtitles' | 'reducedMotion' | 'highContrast' | 'legibleFont' | 'haptics' | 'extendedTimers',
    nota?: string,
  ): ReactNode => (
    <label className="interruttore">
      <input
        type="checkbox"
        checked={s[chiave]}
        onChange={() => {
          s.toggle(chiave);
          if (chiave === 'muted') audio.applyVolumes();
        }}
      />
      <span>
        {etichetta}
        {nota ? <span className="sommario"> — {nota}</span> : null}
      </span>
    </label>
  );

  return (
    <FoglioInferiore aperto={aperto} titolo="Impostazioni" onChiudi={() => setAperto(false)}>
      {aggiornamento ? (
        <div className="pannello">
          <h3>C’è una versione nuova</h3>
          <p className="sommario">
            Il gioco si aggiorna solo quando lo decidi tu: una partita in corso non viene mai
            interrotta.
          </p>
          <button type="button" className="bottone bottone--primario bottone--largo" onClick={applicaAggiornamento}>
            Aggiorna adesso
          </button>
        </div>
      ) : null}

      <section className="pannello">
        <h3>Suono</h3>
        {interruttore('Modalità silenziosa', 'muted')}
        {interruttore('Sottotitoli dei suoni', 'subtitles', 'utile senza audio')}
        {cursore('Volume generale', 'volumeMaster')}
        {cursore('Musica', 'volumeMusic')}
        {cursore('Ambiente', 'volumeAmbience')}
        {cursore('Effetti', 'volumeEffects')}
      </section>

      <section className="pannello">
        <h3>Leggibilità</h3>
        <div className="impostazione">
          <label htmlFor="scala-testo">Dimensione del testo</label>
          <select
            id="scala-testo"
            className="campo"
            value={s.textScale}
            onChange={(e) => s.set('textScale', e.target.value as TextScale)}
          >
            <option value="piccolo">Piccolo</option>
            <option value="normale">Normale</option>
            <option value="grande">Grande</option>
            <option value="enorme">Molto grande</option>
          </select>
        </div>
        {interruttore('Alto contrasto', 'highContrast')}
        {interruttore('Font ad alta leggibilità', 'legibleFont')}
        {interruttore('Riduci il movimento', 'reducedMotion', 'niente parallasse né pioggia animata')}
        {interruttore('Vibrazione', 'haptics')}
        {interruttore('Tempi estesi', 'extendedTimers', 'suggerisce timer più lunghi a chi apre la stanza')}
      </section>

      <section className="pannello">
        <h3>Grafica</h3>
        <div className="impostazione">
          <label htmlFor="qualita">Livello di dettaglio</label>
          <select
            id="qualita"
            className="campo"
            value={s.quality}
            onChange={(e) => {
              s.set('qualityAuto', false);
              s.set('quality', e.target.value as QualityLevel);
            }}
          >
            <option value="alta">Alta — pioggia, riflessi, parallasse</option>
            <option value="media">Media</option>
            <option value="bassa">Bassa — scena ferma</option>
          </select>
          <p className="sommario">
            {s.qualityAuto
              ? 'Scelto automaticamente in base alle prestazioni del dispositivo.'
              : 'Impostato a mano.'}
          </p>
        </div>
      </section>

      {installabile ? (
        <section className="pannello">
          <h3>Installa il Méridien</h3>
          <p className="sommario">
            Aggiunge l’icona alla schermata principale e permette di aprire il gioco anche a schermo
            intero.
          </p>
          <button
            type="button"
            className="bottone bottone--primario bottone--largo"
            onClick={() => {
              const evento = installabile as Event & { prompt?: () => Promise<void> };
              void evento.prompt?.();
              setInstallabile(null);
            }}
          >
            Aggiungi alla schermata principale
          </button>
        </section>
      ) : null}

      <section className="pannello">
        <h3>Privacy</h3>
        <p className="sommario">
          Nessun account, nessun cookie di tracciamento, nessuna statistica raccolta. Nickname e
          preferenze restano su questo dispositivo; le stanze si cancellano da sole.
        </p>
      </section>
    </FoglioInferiore>
  );
}
