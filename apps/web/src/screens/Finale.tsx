import { useEffect, useState, type ReactNode } from 'react';
import type { ScoreResult } from '@meridien/engine';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Cronometro, Icona, Testata } from '../components/base.js';

/**
 * L'ultima maschera: accusa individuale, verdetto collettivo, ricostruzione,
 * punteggi. Da qui si torna in lobby con una rivincita.
 */

interface PassoRicostruzione {
  at: string;
  where: string;
  whereName: string;
  who: string;
  whoName: string;
  note: string;
  isCulprit: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export function Accusa(): ReactNode {
  const room = useGame((s) => s.room);
  const privateView = useGame((s) => s.privateView);
  const act = useGame((s) => s.act);

  const catalogo = room?.catalog ?? null;
  const [colpevole, setColpevole] = useState<string | null>(null);
  const [movente, setMovente] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<string | null>(null);
  const [sequenza, setSequenza] = useState<string[]>([]);

  useEffect(() => {
    if (catalogo && sequenza.length === 0) setSequenza(catalogo.beats.map((b) => b.id));
  }, [catalogo, sequenza.length]);

  if (!room || !catalogo) return null;
  const giaDepositata = Boolean(privateView?.accusation?.culpritRoleId);
  const completa = colpevole && movente && metodo && sequenza.length === catalogo.beats.length;

  const sposta = (indice: number, direzione: -1 | 1): void => {
    const nuovo = [...sequenza];
    const destinazione = indice + direzione;
    if (destinazione < 0 || destinazione >= nuovo.length) return;
    const tmp = nuovo[indice]!;
    nuovo[indice] = nuovo[destinazione]!;
    nuovo[destinazione] = tmp;
    audio.play('carta');
    setSequenza(nuovo);
  };

  if (giaDepositata) {
    return (
      <div className="schermo">
        <div className="contenuto">
          <div className="colonna">
            <Testata occhiello="Scheda depositata" titolo="Aspettando gli altri" />
            <p className="sommario">
              La tua accusa è nelle mani del portiere. Quando tutti avranno deposto, si confronteranno
              le tesi.
            </p>
            <ul className="lista-giocatori">
              {room.players
                .filter((p) => !p.spectator)
                .map((p) => (
                  <li key={p.id}>
                    <img src={`/assets/portrait/${p.avatar}/neutral-calm.svg`} alt="" width={40} height={50} />
                    <span className="lista-giocatori__nome">{p.nickname}</span>
                    <span className={`stato-pronto${p.hasAccused ? ' stato-pronto--si' : ''}`}>
                      {p.hasAccused ? '●' : '○'}
                    </span>
                  </li>
                ))}
            </ul>
            <Cronometro endsAt={room.phaseEndsAt} paused={room.paused} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <div className="riga riga--spazio">
            <Testata occhiello="L'ultima maschera" titolo="La tua accusa" />
            <Cronometro endsAt={room.phaseEndsAt} paused={room.paused} />
          </div>

          <section className="pannello" aria-label="Chi">
            <h2>Chi</h2>
            <ul className="griglia-sospettati">
              {catalogo.roles.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`sospettato${colpevole === r.id ? ' sospettato--scelto' : ''}`}
                    aria-pressed={colpevole === r.id}
                    onClick={() => {
                      audio.play('carta');
                      setColpevole(r.id);
                    }}
                  >
                    <img src={`/assets/portrait/${r.portrait}/turn-caught.svg`} alt="" width={72} height={90} />
                    <strong>{r.name}</strong>
                    <span className="sommario">{r.profession}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pannello" aria-label="Perché">
            <h2>Perché</h2>
            <ul className="opzioni">
              {catalogo.motiveOptions.map((m) => (
                <li key={m.key}>
                  <button
                    type="button"
                    className={`opzione${movente === m.key ? ' opzione--scelta' : ''}`}
                    aria-pressed={movente === m.key}
                    onClick={() => setMovente(m.key)}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pannello" aria-label="Come">
            <h2>Come</h2>
            <ul className="opzioni">
              {catalogo.methodOptions.map((m) => (
                <li key={m.key}>
                  <button
                    type="button"
                    className={`opzione${metodo === m.key ? ' opzione--scelta' : ''}`}
                    aria-pressed={metodo === m.key}
                    onClick={() => setMetodo(m.key)}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="pannello" aria-label="In che ordine">
            <h2>In che ordine</h2>
            <p className="sommario">Metti i momenti della serata nell’ordine in cui sono accaduti.</p>
            <ol className="sequenza">
              {sequenza.map((id, i) => {
                const beat = catalogo.beats.find((b) => b.id === id);
                return (
                  <li key={id}>
                    <span className="sequenza__numero mono">{i + 1}</span>
                    <span className="sequenza__testo">{beat?.label ?? id}</span>
                    <span className="riga">
                      <button
                        type="button"
                        className="bottone bottone--fantasma"
                        onClick={() => sposta(i, -1)}
                        disabled={i === 0}
                        aria-label={`Sposta «${beat?.label}» più in alto`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="bottone bottone--fantasma"
                        onClick={() => sposta(i, 1)}
                        disabled={i === sequenza.length - 1}
                        aria-label={`Sposta «${beat?.label}» più in basso`}
                      >
                        ↓
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione
          variante="pericolo"
          largo
          disabled={!completa}
          onClick={() => {
            audio.play('verdetto');
            act({
              t: 'submitAccusation',
              culpritRoleId: colpevole!,
              motiveKey: movente!,
              methodKey: metodo!,
              sequence: sequenza,
            });
          }}
        >
          <Icona nome="sigillo" size={18} /> Firmo l’accusa
        </Azione>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Verdetto(): ReactNode {
  const room = useGame((s) => s.room);
  const playerId = useGame((s) => s.playerId);
  const act = useGame((s) => s.act);
  const [scelto, setScelto] = useState<string | null>(null);

  if (!room?.catalog) return null;
  const catalogo = room.catalog;
  const candidati = room.players.filter((p) => !p.spectator && p.hasAccused);

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <div className="riga riga--spazio">
            <Testata
              occhiello="Verdetto collettivo"
              titolo="A chi credete"
              sommario="Il gruppo adotta una sola tesi. Vale per tutti."
            />
            <Cronometro endsAt={room.phaseEndsAt} paused={room.paused} />
          </div>

          <ul className="tesi">
            {candidati.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`tesi__voce${scelto === p.id ? ' tesi__voce--scelta' : ''}`}
                  aria-pressed={scelto === p.id}
                  onClick={() => {
                    audio.play('carta');
                    setScelto(p.id);
                  }}
                >
                  <img src={`/assets/portrait/${p.avatar}/neutral-calm.svg`} alt="" width={48} height={60} />
                  <span>
                    <strong>La tesi di {p.nickname}</strong>
                    <span className="sommario">
                      {p.id === playerId ? 'la tua scheda' : 'accusa depositata'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {candidati.length === 0 ? (
            <p className="sommario">Nessuno ha depositato una scheda. Il caso resterà aperto.</p>
          ) : null}

          <p className="sommario">
            Sospettati in gioco: {catalogo.roles.map((r) => r.name).join(', ')}.
          </p>
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione
          variante="primario"
          largo
          disabled={!scelto}
          onClick={() => {
            audio.play('verdetto');
            act({ t: 'voteVerdict', accusationOfPlayerId: scelto! });
          }}
        >
          Sostengo questa tesi
        </Azione>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Epilogo(): ReactNode {
  const room = useGame((s) => s.room);
  const reconstruction = useGame((s) => s.reconstruction) as PassoRicostruzione[];
  const verdict = useGame((s) => s.verdict) as ScoreResult | null;
  const act = useGame((s) => s.act);
  const directorLines = useGame((s) => s.directorLines);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (reconstruction.length === 0) return;
    audio.play(verdict?.collectiveCorrect ? 'vittoria' : 'sconfitta');
    const id = window.setInterval(() => {
      setPasso((p) => {
        if (p >= reconstruction.length - 1) {
          window.clearInterval(id);
          return p;
        }
        audio.play('ticchettio');
        return p + 1;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [reconstruction.length, verdict?.collectiveCorrect]);

  if (!room) return null;
  const chiusura = directorLines.filter((l) => l.kind === 'recap').at(-1);
  const nomeColpevole =
    room.catalog?.roles.find((r) => r.id === verdict?.culpritRoleId)?.name ?? '—';

  return (
    <div className="schermo epilogo">
      <div className="contenuto">
        <div className="colonna">
          <Testata
            occhiello="Ricostruzione"
            titolo={verdict?.collectiveCorrect ? 'Il nome era quello' : 'Il nome non era quello'}
          />

          {verdict ? (
            <section className="pannello soluzione">
              <p className="occhiello">La verità del Méridien</p>
              <h2>{nomeColpevole}</h2>
              <p>
                <strong>Movente:</strong> {verdict.solution.motiveLabel}
              </p>
              <p>
                <strong>Metodo:</strong> {verdict.solution.methodLabel}
              </p>
              {verdict.ignoredCriticalClues.length > 0 ? (
                <p className="sommario">
                  Prove decisive rimaste nel cassetto: {verdict.ignoredCriticalClues.length}.
                </p>
              ) : (
                <p className="sommario">Nessuna prova decisiva è rimasta nascosta.</p>
              )}
            </section>
          ) : null}

          <ol className="ricostruzione">
            {reconstruction.slice(0, passo + 1).map((r, i) => (
              <li key={`${r.at}-${r.who}-${i}`} className={r.isCulprit ? 'ricostruzione--colpevole' : ''}>
                <span className="mono">{r.at}</span>
                <div>
                  <strong>{r.whoName}</strong>
                  <span className="sommario"> · {r.whereName}</span>
                  <p>{r.note}</p>
                </div>
              </li>
            ))}
          </ol>

          {passo < reconstruction.length - 1 ? (
            <Azione variante="fantasma" largo onClick={() => setPasso(reconstruction.length - 1)}>
              Mostra tutto
            </Azione>
          ) : null}

          {chiusura ? <blockquote className="maggiordomo">{chiusura.text}</blockquote> : null}
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione variante="primario" largo onClick={() => act({ t: 'advancePhase' })}>
          I punteggi
        </Azione>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function Punteggi(): ReactNode {
  const room = useGame((s) => s.room);
  const scores = useGame((s) => s.scores) as ScoreResult | null;
  const playerId = useGame((s) => s.playerId);
  const act = useGame((s) => s.act);
  const leaveRoom = useGame((s) => s.leaveRoom);

  if (!room || !scores) return null;
  const nomi = new Map(room.players.map((p) => [p.id, p.nickname]));

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <Testata
            occhiello={scores.collectiveCorrect ? 'Caso chiuso' : 'Caso archiviato'}
            titolo="Il tabellone"
            sommario={
              scores.culpritEscaped
                ? 'Qualcuno stanotte dormirà tranquillo.'
                : 'La sala ha visto giusto.'
            }
          />

          <ol className="classifica">
            {scores.players.map((p, i) => (
              <li key={p.playerId} className={p.playerId === playerId ? 'classifica--io' : ''}>
                <div className="riga riga--spazio">
                  <span className="riga">
                    <span className="mono classifica__posto">{i + 1}</span>
                    <strong>{nomi.get(p.playerId) ?? 'Ospite'}</strong>
                    {p.playerId === scores.culpritPlayerId ? (
                      <span className="pillola pillola--critico">colpevole</span>
                    ) : null}
                  </span>
                  <span className="mono classifica__punti">{p.total}</span>
                </div>
                <ul className="classifica__dettaglio">
                  {p.breakdown.map((b) => (
                    <li key={b.label}>
                      <span>{b.label}</span>
                      <span className="mono">{b.points > 0 ? `+${b.points}` : b.points}</span>
                    </li>
                  ))}
                </ul>
                {p.awards.length > 0 ? (
                  <ul className="premi">
                    {p.awards.map((a) => (
                      <li key={a.id} className="pillola">
                        {a.title}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>

          <section className="pannello">
            <h3>Squadra</h3>
            <p>
              Punti degli innocenti: <span className="mono">{scores.teamPoints}</span>
            </p>
            <p className="sommario">
              Prove decisive condivise: {scores.decisiveShares.length} · ignorate:{' '}
              {scores.ignoredCriticalClues.length}
            </p>
          </section>
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione variante="fantasma" onClick={leaveRoom}>
          Esci
        </Azione>
        <Azione largo onClick={() => act({ t: 'rematch', newCase: false })}>
          Stesso caso, altra sera ({room.rematchVotes.length})
        </Azione>
        <Azione variante="primario" onClick={() => act({ t: 'rematch', newCase: true })}>
          Nuovo caso
        </Azione>
      </div>
    </div>
  );
}
