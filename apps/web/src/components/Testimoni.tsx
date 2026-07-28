import { useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione } from './base.js';

/**
 * Interrogatorio del personale. Le domande sono libere, le risposte no:
 * il server sceglie fra battute prevalidate e il Regista al più le riscrive
 * con la voce del personaggio. Nessun testimone può introdurre un fatto nuovo.
 */

export function Testimoni({ ambienteId }: { ambienteId: string }): ReactNode {
  const room = useGame((s) => s.room);
  const act = useGame((s) => s.act);
  const witnessLog = useGame((s) => s.witnessLog);
  const [scelto, setScelto] = useState<string | null>(null);
  const [domanda, setDomanda] = useState('');

  if (!room?.catalog) return null;
  const qui = room.catalog.witnesses.filter((w) => w.locationId === ambienteId);
  const altrove = room.catalog.witnesses.filter((w) => w.locationId !== ambienteId);
  const testimone = room.catalog.witnesses.find((w) => w.id === scelto) ?? qui[0] ?? null;

  if (!testimone) {
    return <p className="sommario">Qui non c’è nessuno del personale da fermare.</p>;
  }

  const conversazione = witnessLog.filter((w) => w.witnessId === testimone.id);

  return (
    <div className="testimoni">
      <ul className="testimoni__scelta" aria-label="Chi vuoi interrogare">
        {[...qui, ...altrove].map((w) => (
          <li key={w.id}>
            <button
              type="button"
              className={`testimone${w.id === testimone.id ? ' testimone--scelto' : ''}${
                w.locationId === ambienteId ? '' : ' testimone--lontano'
              }`}
              aria-pressed={w.id === testimone.id}
              onClick={() => {
                audio.play('clic');
                setScelto(w.id);
              }}
            >
              <img src={`/assets/portrait/${w.portrait}/neutral-calm.svg`} alt="" width={40} height={50} />
              <span>
                <strong>{w.name}</strong>
                <span className="sommario">{w.role}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <section className="carta">
        <p className="occhiello">{testimone.role}</p>
        <h3>{testimone.name}</h3>
        <p className="sommario">
          Argomenti su cui è disposto a parlare: {testimone.topics.join(', ')}.
        </p>
      </section>

      {conversazione.length > 0 ? (
        <ul className="testimoni__conversazione">
          {conversazione.map((c) => (
            <li key={c.at}>
              <p className="sommario">Tu: «{c.question}»</p>
              <p className="citazione">«{c.answer}»</p>
            </li>
          ))}
        </ul>
      ) : null}

      <label htmlFor="domanda-testimone">La tua domanda</label>
      <textarea
        id="domanda-testimone"
        className="campo"
        rows={2}
        maxLength={160}
        value={domanda}
        onChange={(e) => setDomanda(e.target.value)}
        placeholder="Chi è salito al quarto piano dopo le undici?"
      />
      <Azione
        variante="primario"
        largo
        disabled={domanda.trim().length < 4}
        onClick={() => {
          act({ t: 'askWitness', witnessId: testimone.id, question: domanda.trim() });
          setDomanda('');
        }}
      >
        Chiedi
      </Azione>
      <p className="sommario">
        Il personale risponde solo di ciò che ha visto. Le domande fuori tema ricevono una scrollata
        di spalle.
      </p>
    </div>
  );
}
