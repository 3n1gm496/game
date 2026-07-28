import { useEffect, useRef, type ReactNode } from 'react';
import { formatMinute } from '@meridien/engine';
import { useGame } from '../store/game.js';

/**
 * Taccuino personale. Resta privato: il server lo conserva soltanto per
 * restituirlo dopo una riconnessione, non lo mostra mai a nessun altro.
 * Il salvataggio è differito di un secondo per non inondare la rete mentre
 * si scrive.
 */

export function Taccuino(): ReactNode {
  const noteDraft = useGame((s) => s.noteDraft);
  const setNoteDraft = useGame((s) => s.setNoteDraft);
  const send = useGame((s) => s.send);
  const brief = useGame((s) => s.brief);
  const privateView = useGame((s) => s.privateView);
  const witnessLog = useGame((s) => s.witnessLog);
  const directorLines = useGame((s) => s.directorLines);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const scrivi = (testo: string): void => {
    setNoteDraft(testo);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      send({ t: 'saveNote', text: testo });
    }, 900);
  };

  return (
    <div className="taccuino">
      {brief ? (
        <section className="carta taccuino__promemoria">
          <p className="occhiello">Promemoria</p>
          <p>
            <strong>{brief.role.name}</strong> — {brief.role.profession}
          </p>
          <p className="citazione">«{brief.declaredAlibi}»</p>
          <details>
            <summary>La tua sera, minuto per minuto</summary>
            <ol className="cronologia">
              {brief.trueTimeline.map((t) => (
                <li key={`${t.from}-${t.where}`}>
                  <span className="mono">
                    {formatMinute(t.from)}–{formatMinute(t.to)}
                  </span>
                  <strong>{t.where}</strong>
                  <span>{t.note}</span>
                </li>
              ))}
            </ol>
          </details>
        </section>
      ) : null}

      <label htmlFor="taccuino-testo">Appunti privati</label>
      <textarea
        id="taccuino-testo"
        className="campo taccuino__area"
        rows={10}
        maxLength={2000}
        value={noteDraft}
        onChange={(e) => scrivi(e.target.value)}
        placeholder={'Chi era dove.\nChi ha detto cosa.\nChi si è contraddetto.'}
      />
      <p className="sommario">
        {noteDraft.length}/2000 · Restano su questo dispositivo e nel tuo posto a tavola.
      </p>

      {privateView && privateView.clues.length > 0 ? (
        <section>
          <h3>Le tue carte</h3>
          <ul className="taccuino__indizi">
            {privateView.clues.map((c) => (
              <li key={c.id}>
                <strong>{c.title}</strong>
                <span className="sommario"> — {c.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {witnessLog.length > 0 ? (
        <section>
          <h3>Cosa ti hanno detto</h3>
          <ul className="taccuino__testimoni">
            {witnessLog.map((w) => (
              <li key={`${w.at}-${w.witnessId}`}>
                <span className="sommario">Tu: «{w.question}»</span>
                <p>
                  <strong>{w.witnessName}:</strong> «{w.answer}»
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {directorLines.length > 0 ? (
        <section>
          <h3>Il maggiordomo</h3>
          <ul className="taccuino__regista">
            {directorLines.slice(-4).map((l) => (
              <li key={l.at}>{l.text}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
