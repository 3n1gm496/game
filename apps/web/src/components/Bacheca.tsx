import { useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Icona } from './base.js';

/**
 * Bacheca condivisa: prove, note, dichiarazioni e contraddizioni.
 * Le prove non si possono togliere — una volta che una carta è sul tavolo,
 * resta sul tavolo. Note e dichiarazioni sì.
 *
 * Il confronto fra due elementi è il gesto centrale: si selezionano due
 * cartoncini e si dichiara che non stanno in piedi insieme. Il client non sa
 * quali contraddizioni esistano: lo verifica il server.
 */

const ETICHETTA: Record<string, { testo: string; icona: string; classe: string }> = {
  indizio: { testo: 'Prova', icona: 'lente', classe: 'bacheca__voce--indizio' },
  nota: { testo: 'Nota', icona: 'taccuino', classe: 'bacheca__voce--nota' },
  dichiarazione: { testo: 'Dichiarazione', icona: 'maschera', classe: 'bacheca__voce--dichiarazione' },
  contraddizione: { testo: 'Contraddizione', icona: 'fulmine', classe: 'bacheca__voce--contraddizione' },
};

export function Bacheca(): ReactNode {
  const room = useGame((s) => s.room);
  const playerId = useGame((s) => s.playerId);
  const act = useGame((s) => s.act);
  const [nuovaNota, setNuovaNota] = useState('');
  const [selezione, setSelezione] = useState<string[]>([]);

  if (!room) return null;
  const nomi = new Map(room.players.map((p) => [p.id, p.nickname]));

  const alterna = (id: string): void => {
    audio.play('clic');
    setSelezione((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      return [...s, id].slice(-2);
    });
  };

  return (
    <div className="bacheca">
      <p className="sommario">
        Tutto quello che sta qui lo vedono tutti. Le prove non si tolgono più.
      </p>

      {room.board.length === 0 ? (
        <p className="sommario">La bacheca è vuota. Qualcuno deve cominciare.</p>
      ) : (
        <ul className="bacheca__lista">
          {room.board.map((voce) => {
            const meta = ETICHETTA[voce.kind] ?? ETICHETTA.nota!;
            const scelta = selezione.includes(voce.id);
            return (
              <li
                key={voce.id}
                className={`carta bacheca__voce ${meta.classe}${scelta ? ' bacheca__voce--scelta' : ''}`}
              >
                <div className="riga riga--spazio">
                  <span className="riga">
                    <Icona nome={meta.icona} size={16} />
                    <strong>{voce.title}</strong>
                  </span>
                  <span className="pillola">{meta.testo}</span>
                </div>
                <p>{voce.text}</p>
                <div className="riga riga--spazio bacheca__piede">
                  <span className="sommario">
                    {voce.tampered ? 'anonima' : (nomi.get(voce.byPlayerId) ?? 'ignoto')}
                    {voce.links.length > 0 ? ` · ${voce.links.length} collegamenti` : ''}
                  </span>
                  <span className="riga">
                    <button
                      type="button"
                      className="bottone bottone--fantasma"
                      onClick={() => alterna(voce.id)}
                      aria-pressed={scelta}
                      aria-label={`${scelta ? 'Togli dal' : 'Metti a'} confronto: ${voce.title}`}
                    >
                      {scelta ? 'Scelta' : 'Confronta'}
                    </button>
                    {voce.kind !== 'indizio' && voce.byPlayerId === playerId ? (
                      <button
                        type="button"
                        className="bottone bottone--fantasma"
                        onClick={() => act({ t: 'unpin', itemId: voce.id })}
                      >
                        Ritira
                      </button>
                    ) : null}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selezione.length === 2 ? (
        <div className="pannello confronto" role="region" aria-label="Confronto fra due affermazioni">
          <h3>Queste due non stanno in piedi insieme?</h3>
          <p className="sommario">
            Se hai ragione vale otto punti e la dichiarazione di qualcuno perde valore. Se ti
            sbagli, non succede nulla.
          </p>
          <div className="riga">
            <Azione variante="fantasma" onClick={() => setSelezione([])}>
              Annulla
            </Azione>
            <Azione
              variante="pericolo"
              largo
              onClick={() => {
                act({ t: 'flagContradiction', itemA: selezione[0]!, itemB: selezione[1]! });
                setSelezione([]);
              }}
            >
              Non tornano
            </Azione>
          </div>
          <div className="riga">
            <Azione
              variante="fantasma"
              largo
              onClick={() => {
                act({ t: 'linkOnBoard', fromItemId: selezione[0]!, toItemId: selezione[1]! });
                setSelezione([]);
              }}
            >
              Collega e basta
            </Azione>
          </div>
        </div>
      ) : null}

      <div className="pannello">
        <label htmlFor="nuova-nota">Appunta qualcosa per tutti</label>
        <textarea
          id="nuova-nota"
          className="campo"
          rows={2}
          maxLength={180}
          value={nuovaNota}
          onChange={(e) => setNuovaNota(e.target.value)}
          placeholder="Una riga sola, come su un cartoncino."
        />
        <Azione
          variante="primario"
          largo
          disabled={nuovaNota.trim().length < 3}
          onClick={() => {
            act({ t: 'pinToBoard', kind: 'nota', text: nuovaNota.trim() });
            setNuovaNota('');
          }}
        >
          Metti in bacheca
        </Azione>
      </div>
    </div>
  );
}
