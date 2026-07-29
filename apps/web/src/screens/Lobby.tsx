import { useState, type ReactNode } from 'react';
import type { RoomSettings } from '@meridien/engine';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Icona, Testata } from '../components/base.js';

/**
 * Lobby: presenza in tempo reale, impostazioni della partita, invito.
 * Solo chi ha aperto la stanza può cambiare le impostazioni; il consenso
 * necessario a cominciare è che tutti si dichiarino pronti.
 */

export function Lobby(): ReactNode {
  const room = useGame((s) => s.room);
  const playerId = useGame((s) => s.playerId);
  const send = useGame((s) => s.send);
  const act = useGame((s) => s.act);
  const leaveRoom = useGame((s) => s.leaveRoom);
  const casi = useGame((s) => s.cases);
  const directorLines = useGame((s) => s.directorLines);
  const [copiato, setCopiato] = useState(false);

  if (!room) return null;
  const io = room.players.find((p) => p.id === playerId);
  const sonoHost = room.hostId === playerId;
  const giocatori = room.players.filter((p) => !p.spectator);
  const spettatori = room.players.filter((p) => p.spectator);
  const pronti = giocatori.filter((p) => p.ready).length;
  const abbastanza = giocatori.filter((p) => p.connected).length >= 4;
  const tuttiPronti = giocatori.filter((p) => p.connected).every((p) => p.ready);
  const caso = casi.find((c) => c.id === room.settings.caseId);
  const invito = `${location.origin}${location.pathname}?stanza=${room.code}`;
  const ultimaBattuta = directorLines.filter((l) => l.kind === 'butler').at(-1);

  const condividi = async (): Promise<void> => {
    audio.play('carta');
    const dati = {
      title: 'MÉRIDIEN — Delitto al Grand Hotel',
      text: `Ti aspetto al Méridien. Il codice della stanza è ${room.code}.`,
      url: invito,
    };
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share(dati);
        return;
      } catch {
        /* condivisione annullata: si ricade sulla copia */
      }
    }
    try {
      await navigator.clipboard.writeText(invito);
      setCopiato(true);
      window.setTimeout(() => setCopiato(false), 2200);
    } catch {
      setCopiato(false);
    }
  };

  const cambia = (patch: Partial<RoomSettings>): void => {
    send({ t: 'updateSettings', settings: patch });
  };

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <Testata
            occhiello={`Stanza ${room.code}`}
            titolo="Il ricevimento"
            sommario={caso ? `${caso.title} — ${caso.subtitle}` : undefined}
          />

          {ultimaBattuta ? (
            <blockquote className="maggiordomo">
              <Icona nome="campanello" size={16} />
              <span>{ultimaBattuta.text}</span>
            </blockquote>
          ) : null}

          <section className="pannello codice-stanza" aria-label="Codice e invito">
            <div>
              <p className="occhiello">Codice</p>
              <p className="mono codice-stanza__valore">{room.code}</p>
            </div>
            <Azione onClick={() => void condividi()} suono="nessuno">
              <Icona nome="valigia" size={16} /> {copiato ? 'Copiato' : 'Invita'}
            </Azione>
          </section>

          <section className="pannello" aria-label="Ospiti">
            <div className="riga riga--spazio">
              <h2>Ospiti</h2>
              <span className="pillola">
                {pronti}/{giocatori.length} pronti
              </span>
            </div>
            <ul className="lista-giocatori">
              {giocatori.map((p) => (
                <li key={p.id} className={p.connected ? '' : 'assente'}>
                  <img src={`/assets/portrait/${p.avatar}/neutral-calm.svg`} alt="" width={44} height={55} />
                  <span className="lista-giocatori__nome">
                    {p.nickname}
                    {p.isHost ? <span className="pillola">padrone di casa</span> : null}
                    {!p.connected ? <span className="sommario"> · assente</span> : null}
                  </span>
                  <span className={`stato-pronto${p.ready ? ' stato-pronto--si' : ''}`} aria-label={p.ready ? 'pronto' : 'non pronto'}>
                    {p.ready ? '●' : '○'}
                  </span>
                  {sonoHost && p.id !== playerId ? (
                    <button
                      type="button"
                      className="bottone bottone--fantasma bottone--icona"
                      onClick={() => act({ t: 'kickPlayer', playerId: p.id })}
                      aria-label={`Accompagna ${p.nickname} all'uscita`}
                      title={`Accompagna ${p.nickname} all'uscita`}
                    >
                      <Icona nome="porta" size={18} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
            {spettatori.length > 0 ? (
              <p className="sommario">
                In balconata: {spettatori.map((s) => s.nickname).join(', ')}
              </p>
            ) : null}
            {!abbastanza ? (
              <p className="sommario">Servono almeno quattro ospiti. Ne mancano {4 - giocatori.filter((p) => p.connected).length}.</p>
            ) : null}
          </section>

          <section className="pannello" aria-label="Impostazioni della partita">
            <h2>La serata</h2>
            <fieldset disabled={!sonoHost} className="impostazioni">
              <legend className="solo-lettori">Impostazioni</legend>

              <div className="impostazione">
                <label htmlFor="sel-caso">Caso</label>
                <select
                  id="sel-caso"
                  className="campo"
                  value={room.settings.caseId}
                  onChange={(e) => cambia({ caseId: e.target.value })}
                >
                  {casi.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.number}. {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="impostazione">
                <label htmlFor="sel-modo">Modalità</label>
                <select
                  id="sel-modo"
                  className="campo"
                  value={room.settings.mode}
                  onChange={(e) => cambia({ mode: e.target.value as RoomSettings['mode'] })}
                >
                  <option value="competitiva">Competitiva — il colpevole è fra voi</option>
                  <option value="cooperativa">Cooperativa — il colpevole è un personaggio</option>
                </select>
              </div>

              <div className="impostazione">
                <label htmlFor="sel-timer">Tempo</label>
                <select
                  id="sel-timer"
                  className="campo"
                  value={room.settings.timers}
                  onChange={(e) => cambia({ timers: e.target.value as RoomSettings['timers'] })}
                >
                  <option value="normale">Normale — circa 20 minuti</option>
                  <option value="esteso">Esteso — una volta e mezza</option>
                  <option value="doppio">Doppio — con calma</option>
                  <option value="assenti">Senza timer — si avanza insieme</option>
                </select>
              </div>

              <div className="impostazione">
                <label htmlFor="campo-seed">Seme</label>
                <input
                  id="campo-seed"
                  className="campo mono"
                  value={room.settings.seed}
                  maxLength={12}
                  onChange={(e) => cambia({ seed: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })}
                />
                <p className="sommario">
                  Lo stesso seme produce sempre la stessa variante del caso.
                </p>
              </div>

              <div className="impostazione impostazione--interruttori">
                <label className="interruttore">
                  <input
                    type="checkbox"
                    checked={room.settings.aiDirector}
                    onChange={(e) => cambia({ aiDirector: e.target.checked })}
                  />
                  <span>Regista narrativo</span>
                </label>
                <label className="interruttore">
                  <input
                    type="checkbox"
                    checked={room.settings.hints}
                    onChange={(e) => cambia({ hints: e.target.checked })}
                  />
                  <span>Suggerimenti</span>
                </label>
                <label className="interruttore">
                  <input
                    type="checkbox"
                    checked={room.settings.spectators}
                    onChange={(e) => cambia({ spectators: e.target.checked })}
                  />
                  <span>Ammetti spettatori</span>
                </label>
              </div>
            </fieldset>
            {!sonoHost ? (
              <p className="sommario">Le impostazioni le decide chi ha aperto la stanza.</p>
            ) : null}
          </section>
        </div>
      </div>

      <div className="barra-inferiore">
        <Azione variante="fantasma" onClick={leaveRoom}>
          Esci
        </Azione>
        {io && !io.spectator ? (
          <Azione
            largo
            variante={io.ready ? 'normale' : 'primario'}
            onClick={() => send({ t: 'setReady', ready: !io.ready })}
          >
            {io.ready ? 'Non sono pronto' : 'Sono pronto'}
          </Azione>
        ) : null}
        {sonoHost ? (
          <Azione
            variante="primario"
            disabled={!abbastanza || !tuttiPronti}
            onClick={() => {
              audio.play('sipario');
              act({ t: 'startGame' });
            }}
          >
            Comincia
          </Azione>
        ) : null}
      </div>
    </div>
  );
}
