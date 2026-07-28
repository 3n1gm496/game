import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { audio, type Caption } from '../audio/engine.js';
import { useSettings } from '../store/settings.js';
import { Icona } from './base.js';

/** Notifiche discrete: indizi trovati, eventi, errori. */
export function Avvisi(): ReactNode {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);

  useEffect(() => {
    const ultimo = toasts.at(-1);
    if (!ultimo) return;
    if (ultimo.kind === 'indizio') audio.play('indizio');
    else if (ultimo.kind === 'evento') audio.play('tuono');
    else if (ultimo.kind === 'errore') audio.play('notifica');
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="avvisi" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`avviso-carta avviso-carta--${t.kind}`}>
          <Icona
            nome={t.kind === 'indizio' ? 'lente' : t.kind === 'evento' ? 'fulmine' : 'campanello'}
            size={18}
          />
          <div>
            <strong>{t.title}</strong>
            <p>{t.text}</p>
          </div>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Chiudi l'avviso">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

/** Sottotitoli dei suoni, per chi gioca senza audio o non lo sente. */
export function Sottotitoli(): ReactNode {
  const attivi = useSettings((s) => s.subtitles);
  const [correnti, setCorrenti] = useState<Caption[]>([]);

  useEffect(() => {
    if (!attivi) {
      setCorrenti([]);
      return;
    }
    return audio.onCaption((c) => {
      setCorrenti((prec) => [...prec.slice(-2), c]);
      window.setTimeout(() => {
        setCorrenti((prec) => prec.filter((x) => x.id !== c.id));
      }, 2600);
    });
  }, [attivi]);

  if (!attivi || correnti.length === 0) return null;

  return (
    <div className="sottotitoli" aria-live="polite">
      {correnti.map((c) => (
        <span key={c.id}>{c.text}</span>
      ))}
    </div>
  );
}

/**
 * Barra di stato: connessione, silenzioso, impostazioni.
 * Resta sempre raggiungibile, anche durante la partita.
 */
export function BarraStato(): ReactNode {
  const status = useGame((s) => s.status);
  const room = useGame((s) => s.room);
  const muted = useSettings((s) => s.muted);
  const toggle = useSettings((s) => s.toggle);

  const etichetta =
    status === 'aperta'
      ? 'in linea'
      : status === 'riconnessione'
        ? 'la linea è caduta'
        : status === 'obsoleta'
          ? 'versione superata'
          : status === 'in-connessione'
            ? 'in collegamento'
            : 'fuori linea';

  return (
    <div className="barra-stato">
      <span className={`spia spia--${status}`} title={etichetta} aria-hidden="true" />
      <span className="solo-lettori" role="status">
        Connessione: {etichetta}
      </span>
      {room ? <span className="mono barra-stato__codice">{room.code}</span> : null}
      <span className="barra-stato__spazio" />
      {status === 'obsoleta' ? (
        <button type="button" className="bottone bottone--pericolo" onClick={() => location.reload()}>
          Aggiorna il gioco
        </button>
      ) : null}
      <button
        type="button"
        className="barra-stato__icona"
        onClick={() => {
          toggle('muted');
          audio.applyVolumes();
        }}
        aria-pressed={muted}
        aria-label={muted ? 'Riattiva l’audio' : 'Silenzia il gioco'}
      >
        <Icona nome={muted ? 'candela' : 'campanello'} size={18} />
      </button>
      <button
        type="button"
        className="barra-stato__icona"
        onClick={() => document.dispatchEvent(new CustomEvent('meridien:impostazioni'))}
        aria-label="Apri le impostazioni"
      >
        <Icona nome="scala" size={18} />
      </button>
    </div>
  );
}
