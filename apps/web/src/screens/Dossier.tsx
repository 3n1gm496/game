import { useState, type ReactNode } from 'react';
import { formatMinute } from '@meridien/engine';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Cronometro, Icona } from '../components/base.js';

/**
 * Dossier privato. Arriva per canale diretto: nessun altro giocatore riceve
 * questi dati. Il colpevole vede una scheda in più con la ricostruzione falsa
 * già pronta, così può mentire con precisione invece che improvvisare.
 */

type Scheda = 'identita' | 'cronologia' | 'segreto' | 'obiettivo' | 'copertura';

export function Dossier(): ReactNode {
  const brief = useGame((s) => s.brief);
  const room = useGame((s) => s.room);
  const act = useGame((s) => s.act);
  const [scheda, setScheda] = useState<Scheda>('identita');

  if (!brief || !room) {
    return (
      <div className="schermo">
        <div className="contenuto">
          <div className="colonna">
            <p className="sommario" role="status">
              Il portiere sta preparando il tuo dossier…
            </p>
          </div>
        </div>
      </div>
    );
  }

  const schede: { chiave: Scheda; etichetta: string; icona: string }[] = [
    { chiave: 'identita', etichetta: 'Identità', icona: 'maschera' },
    { chiave: 'cronologia', etichetta: 'La tua sera', icona: 'orologio' },
    { chiave: 'segreto', etichetta: 'Segreto', icona: 'sigillo' },
    { chiave: 'obiettivo', etichetta: 'Obiettivo', icona: 'taccuino' },
    ...(brief.falseReconstruction
      ? [{ chiave: 'copertura' as Scheda, etichetta: 'Copertura', icona: 'guanto' }]
      : []),
  ];

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <div className="riga riga--spazio">
            <p className="occhiello">Riservato · non mostrare a nessuno</p>
            <Cronometro endsAt={room.phaseEndsAt} paused={room.paused} />
          </div>

          <div className="dossier__intestazione">
            <img
              src={`/assets/portrait/${brief.role.portrait}/lean-calm.svg`}
              alt=""
              width={132}
              height={165}
              className="dossier__ritratto"
            />
            <div>
              <h1>{brief.role.name}</h1>
              <p className="sommario">
                {brief.role.age} anni · {brief.role.profession} · {brief.role.origin}
              </p>
              <ul className="tratti">
                {brief.role.traits.map((t) => (
                  <li key={t} className="pillola">
                    {t}
                  </li>
                ))}
              </ul>
              {brief.isCulprit ? (
                <p className="marchio-colpevole">
                  <Icona nome="fulmine" size={16} /> Sei tu. Nessuno lo sa.
                </p>
              ) : null}
            </div>
          </div>

          <nav className="schede" aria-label="Sezioni del dossier">
            {schede.map((s) => (
              <button
                key={s.chiave}
                type="button"
                className={`scheda${scheda === s.chiave ? ' scheda--attiva' : ''}`}
                aria-pressed={scheda === s.chiave}
                onClick={() => {
                  audio.play('carta');
                  setScheda(s.chiave);
                }}
              >
                <Icona nome={s.icona} size={16} />
                {s.etichetta}
              </button>
            ))}
          </nav>

          <div className="carta dossier__foglio">
            {scheda === 'identita' ? (
              <>
                <h2>Chi sei</h2>
                <p>{brief.role.presentation}</p>
                <h3>Con la vittima</h3>
                <p>{brief.role.relationToVictim}</p>
                <h3>Quello che dirai</h3>
                <p className="citazione">«{brief.declaredAlibi}»</p>
                <h3>La tua capacità</h3>
                <p>
                  <strong>{brief.ability.name}</strong> — {brief.ability.description} (
                  {brief.ability.charges} {brief.ability.charges === 1 ? 'carica' : 'cariche'}, atti{' '}
                  {brief.ability.acts.join(', ')})
                </p>
              </>
            ) : null}

            {scheda === 'cronologia' ? (
              <>
                <h2>Dove eri davvero</h2>
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
                <p className="sommario">
                  Questa è la verità. Quanta ne racconti è una tua scelta.
                </p>
              </>
            ) : null}

            {scheda === 'segreto' ? (
              <>
                <h2>{brief.secret.title}</h2>
                <p>{brief.secret.text}</p>
                <h3>Puoi dire</h3>
                <ul className="elenco-verde">
                  {brief.shareable.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <h3>Meglio di no</h3>
                <ul className="elenco-rosso">
                  {brief.hidden.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {scheda === 'obiettivo' ? (
              <>
                <h2>{brief.objective.title}</h2>
                <p>{brief.objective.text}</p>
                <p className="sommario">
                  Vale {brief.objective.points} punti, indipendentemente da chi sia il colpevole.
                </p>
              </>
            ) : null}

            {scheda === 'copertura' && brief.falseReconstruction ? (
              <>
                <h2>La versione che racconterai</h2>
                <p>{brief.falseReconstruction.summary}</p>
                <ol className="cronologia">
                  {brief.falseReconstruction.timeline.map((t) => (
                    <li key={`${t.from}-${t.where}-falso`}>
                      <span className="mono">
                        {formatMinute(t.from)}–{formatMinute(t.to)}
                      </span>
                      <strong>{t.where}</strong>
                      <span>{t.note}</span>
                    </li>
                  ))}
                </ol>
                <p className="sommario">
                  Se dovesse servire un colpevole, {brief.falseReconstruction.scapegoatRoleName} ha
                  la sera meno solida di tutti.
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione
          variante="primario"
          largo
          onClick={() => {
            audio.play('sipario');
            act({ t: 'advancePhase' });
          }}
        >
          Ho letto. Si comincia.
        </Azione>
      </div>
    </div>
  );
}
