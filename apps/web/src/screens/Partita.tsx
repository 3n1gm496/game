import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { audio, type AmbienceKey } from '../audio/engine.js';
import { Azione, Cronometro, FoglioInferiore, Icona } from '../components/base.js';
import { ScenaVista } from '../components/ScenaVista.js';
import { Bacheca } from '../components/Bacheca.js';
import { Taccuino } from '../components/Taccuino.js';
import { Testimoni } from '../components/Testimoni.js';

/**
 * I tre atti. Sotto c'è sempre l'ambiente; sopra si aprono i fogli:
 * indizi, bacheca, taccuino, testimoni, sala. Le azioni disponibili cambiano
 * con l'atto, ma la mappa mentale del giocatore resta la stessa.
 */

type Foglio = null | 'indizi' | 'bacheca' | 'taccuino' | 'testimoni' | 'sala' | 'mappa';

const AMBIENTE_PER_SCENA: Record<string, AmbienceKey> = {
  facciata: 'pioggia',
  terrazza: 'mare',
  piscina: 'mare',
  'sala-ballo': 'sala-ballo',
  palco: 'sala-ballo',
  bar: 'sala-ballo',
  hall: 'corridoio',
  corridoio: 'corridoio',
  suite: 'corridoio',
  camerino: 'corridoio',
  passaggio: 'corridoio',
  quadro: 'corridoio',
  registrazione: 'corridoio',
  cucina: 'cucina',
};

export function Partita(): ReactNode {
  const room = useGame((s) => s.room);
  const brief = useGame((s) => s.brief);
  const privateView = useGame((s) => s.privateView);
  const playerId = useGame((s) => s.playerId);
  const act = useGame((s) => s.act);
  const puzzle = useGame((s) => s.puzzle);
  const dismissPuzzle = useGame((s) => s.dismissPuzzle);
  const currentLocationId = useGame((s) => s.currentLocationId);
  const setLocation = useGame((s) => s.setLocation);

  const [foglio, setFoglio] = useState<Foglio>(null);
  const [rispostaEnigma, setRispostaEnigma] = useState('');

  const catalogo = room?.catalog ?? null;
  const ambiente = useMemo(
    () => catalogo?.locations.find((l) => l.id === currentLocationId) ?? catalogo?.locations[0] ?? null,
    [catalogo, currentLocationId],
  );

  useEffect(() => {
    if (!ambiente) return;
    audio.setAmbience(AMBIENTE_PER_SCENA[ambiente.scene] ?? 'corridoio');
  }, [ambiente]);

  useEffect(() => {
    setRispostaEnigma('');
  }, [puzzle?.clueId]);

  if (!room || !catalogo || !ambiente) return null;

  const io = room.players.find((p) => p.id === playerId);
  const attoCorrente = room.act;
  const ambientiAperti = catalogo.locations.filter((l) => room.openLocationIds.includes(l.id));
  const ricercheRimaste = privateView?.searchesLeft ?? 0;
  const indiziInMano = privateView?.clues ?? [];
  const testimoniQui = catalogo.witnesses.filter((w) => w.locationId === ambiente.id);

  // gli hotspot con qualcosa da trovare non sono noti al client: il server
  // decide. Qui si evidenziano solo quelli non ancora provati in questo atto.
  const hotspotAttivi = new Set<string>(ricercheRimaste > 0 ? ['oggetto', 'consegna'] : []);

  const investiga = (hotspot: string): void => {
    if (ricercheRimaste <= 0) return;
    audio.play('passi');
    act({ t: 'investigate', locationId: ambiente.id, hotspot });
  };

  return (
    <div className="schermo partita">
      <header className="partita__testata">
        <div className="riga riga--spazio">
          <div>
            <p className="occhiello">
              Atto {attoCorrente === 1 ? 'I' : attoCorrente === 2 ? 'II' : 'III'} ·{' '}
              {attoCorrente === 1 ? 'Il ballo interrotto' : attoCorrente === 2 ? 'Le stanze chiuse' : 'La mezzanotte mente'}
            </p>
            <h2 className="partita__ambiente">{ambiente.name}</h2>
          </div>
          <div className="riga">
            <Cronometro endsAt={room.phaseEndsAt} paused={room.paused} />
            {room.hostId === playerId ? (
              <button
                type="button"
                className="bottone bottone--fantasma"
                onClick={() => act(room.paused ? { t: 'resumeGame' } : { t: 'pause' })}
                aria-label={room.paused ? "Riprendi l'indagine" : "Sospendi l'indagine"}
              >
                {room.paused ? '▶' : '❚❚'}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <ScenaVista
        chiave={ambiente.scene}
        nomeAmbiente={ambiente.name}
        onHotspot={investiga}
        hotspotAttivi={hotspotAttivi}
        bloccata={room.paused || ricercheRimaste <= 0}
      />

      <Cronaca />

      <div className="partita__stato" role="status">
        <span className="pillola">
          <Icona nome="lente" size={13} /> {ricercheRimaste} ricerche
        </span>
        <span className="pillola">
          <Icona nome="taccuino" size={13} /> {indiziInMano.length} indizi
        </span>
        {io && io.abilityCharges > 0 && brief ? (
          <button
            type="button"
            className="pillola pillola--azione"
            onClick={() => {
              audio.play('notifica');
              act({ t: 'useAbility', targetLocationId: ambiente.id });
            }}
          >
            <Icona nome="fulmine" size={13} /> {brief.ability.name}
          </button>
        ) : null}
      </div>

      {attoCorrente === 1 && brief && !io?.declarationKey ? (
        <section className="pannello dichiarazioni" aria-label="La tua dichiarazione">
          <h3>Cosa dici agli altri</h3>
          <p className="sommario">
            La scelta è pubblica, la ragione no. Mentire è permesso a tutti.
          </p>
          {brief.declarations.map((d) => (
            <button
              key={d.key}
              type="button"
              className="dichiarazione"
              onClick={() => {
                audio.play('carta');
                act({ t: 'declare', key: d.key });
              }}
            >
              <span className="dichiarazione__etichetta">
                {d.key === 'verita' ? 'Verità' : d.key === 'omissione' ? 'Omissione' : 'Bugia'}
              </span>
              <span>«{d.text}»</span>
            </button>
          ))}
        </section>
      ) : null}

      <nav className="partita__barra" aria-label="Strumenti dell'indagine">
        <BottoneFoglio attivo={foglio === 'indizi'} icona="taccuino" etichetta="Indizi" conteggio={indiziInMano.length} onClick={() => setFoglio(foglio === 'indizi' ? null : 'indizi')} />
        <BottoneFoglio attivo={foglio === 'bacheca'} icona="sigillo" etichetta="Bacheca" conteggio={room.board.length} onClick={() => setFoglio(foglio === 'bacheca' ? null : 'bacheca')} />
        <BottoneFoglio attivo={foglio === 'mappa'} icona="scala" etichetta="Mappa" onClick={() => setFoglio(foglio === 'mappa' ? null : 'mappa')} />
        <BottoneFoglio attivo={foglio === 'testimoni'} icona="campanello" etichetta="Testimoni" conteggio={testimoniQui.length} onClick={() => setFoglio(foglio === 'testimoni' ? null : 'testimoni')} />
        <BottoneFoglio attivo={foglio === 'sala'} icona="maschera" etichetta="Sala" conteggio={room.players.filter((p) => !p.spectator).length} onClick={() => setFoglio(foglio === 'sala' ? null : 'sala')} />
      </nav>

      <FoglioInferiore aperto={foglio === 'indizi'} titolo="I tuoi indizi" onChiudi={() => setFoglio(null)}>
        {indiziInMano.length === 0 ? (
          <p className="sommario">Non hai ancora nulla in mano. Cerca negli ambienti.</p>
        ) : (
          <ul className="lista-indizi">
            {indiziInMano.map((c) => (
              <li key={c.id} className="carta carta-indizio">
                <div className="riga riga--spazio">
                  <span className="riga">
                    <Icona nome={c.icon} size={18} />
                    <strong>{c.title}</strong>
                  </span>
                  {c.shared ? (
                    <span className="pillola pillola--contorno">in bacheca</span>
                  ) : (
                    <button
                      type="button"
                      className="bottone bottone--fantasma"
                      onClick={() => {
                        audio.play('carta');
                        act({ t: 'shareClue', clueId: c.id });
                      }}
                    >
                      Condividi
                    </button>
                  )}
                </div>
                <p>{c.text}</p>
                {c.foundAt ? <p className="sommario">Trovato in {c.foundAt}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </FoglioInferiore>

      <FoglioInferiore aperto={foglio === 'bacheca'} titolo="Bacheca delle prove" onChiudi={() => setFoglio(null)}>
        <Bacheca />
      </FoglioInferiore>

      <FoglioInferiore aperto={foglio === 'testimoni'} titolo="Il personale" onChiudi={() => setFoglio(null)}>
        <Testimoni ambienteId={ambiente.id} />
      </FoglioInferiore>

      <FoglioInferiore aperto={foglio === 'mappa'} titolo="Il Méridien" onChiudi={() => setFoglio(null)}>
        <ul className="lista-ambienti">
          {ambientiAperti.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={`ambiente${l.id === ambiente.id ? ' ambiente--qui' : ''}`}
                onClick={() => {
                  audio.play('porta');
                  setLocation(l.id);
                  setFoglio(null);
                }}
                aria-current={l.id === ambiente.id ? 'true' : undefined}
              >
                <img src={`/assets/scene/${l.scene}/layer-1.svg`} alt="" width={84} height={56} loading="lazy" />
                <span>
                  <strong>{l.name}</strong>
                  <span className="sommario">
                    Piano {l.floor === 0 ? 'terra' : l.floor === -1 ? 'interrato' : l.floor}
                    {l.restricted ? ' · solo personale' : ''}
                  </span>
                  <span className="sommario">{l.description}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FoglioInferiore>

      <FoglioInferiore aperto={foglio === 'sala'} titolo="In sala" onChiudi={() => setFoglio(null)}>
        <Sala />
      </FoglioInferiore>

      <FoglioInferiore aperto={foglio === 'taccuino'} titolo="Taccuino" onChiudi={() => setFoglio(null)}>
        <Taccuino />
      </FoglioInferiore>

      {puzzle ? (
        <div className="foglio-sfondo">
          <div className="pannello enigma" role="dialog" aria-modal="true" aria-label="Un piccolo enigma">
            <p className="occhiello">Non è così semplice</p>
            <p>{puzzle.prompt}</p>
            {puzzle.options.length > 0 ? (
              <ul className="opzioni-enigma">
                {puzzle.options.map((o) => (
                  <li key={o}>
                    <button
                      type="button"
                      className={`bottone${rispostaEnigma === o ? ' bottone--primario' : ''}`}
                      onClick={() => setRispostaEnigma(o)}
                      aria-pressed={rispostaEnigma === o}
                    >
                      {o}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <input
                className="campo"
                value={rispostaEnigma}
                onChange={(e) => setRispostaEnigma(e.target.value)}
                aria-label="La tua risposta"
                maxLength={60}
              />
            )}
            <div className="riga" style={{ marginTop: 'var(--sp-3)' }}>
              <Azione variante="fantasma" onClick={dismissPuzzle}>
                Lascia stare
              </Azione>
              <Azione
                variante="primario"
                largo
                disabled={rispostaEnigma.trim().length === 0}
                onClick={() => {
                  act({ t: 'solvePuzzle', clueId: puzzle.clueId, answer: rispostaEnigma.trim() });
                  dismissPuzzle();
                }}
              >
                Provo questa
              </Azione>
            </div>
          </div>
        </div>
      ) : null}

      <div className="barra-inferiore partita__azioni">
        <Azione variante="fantasma" onClick={() => setFoglio('taccuino')}>
          <Icona nome="taccuino" size={16} /> Note
        </Azione>
        {room.settings.hints ? (
          <Azione
            variante="fantasma"
            disabled={(privateView?.hintsUsed ?? 0) >= 2}
            onClick={() => act({ t: 'requestHint' })}
          >
            <Icona nome="candela" size={16} /> Suggerimento
          </Azione>
        ) : null}
        <Azione variante="fantasma" onClick={() => act({ t: 'requestRecap' })}>
          <Icona nome="lente" size={16} /> Riepilogo
        </Azione>
        <Azione
          variante="primario"
          largo
          onClick={() => {
            audio.play('sipario');
            act({ t: 'advancePhase' });
          }}
          title="Serve la maggioranza, oppure il padrone di casa"
        >
          Avanti ({room.advanceVotes.length})
        </Azione>
      </div>

    </div>
  );
}

/**
 * La cronaca dell'albergo.
 *
 * Eventi della tempesta, dichiarazioni, cambi di padrone di casa, battute del
 * maggiordomo: senza questa striscia il giocatore non ha modo di sapere che
 * qualcosa è successo. Mostra le ultime righe e le annuncia ai lettori di
 * schermo, con un pannello che si apre per rileggere tutto.
 */
function Cronaca(): ReactNode {
  const room = useGame((s) => s.room);
  const [aperta, setAperta] = useState(false);
  if (!room) return null;

  const righe = room.chat.slice(-30);
  const ultima = righe.at(-1);

  return (
    <>
      <button
        type="button"
        className="cronaca"
        onClick={() => {
          audio.play('clic');
          setAperta(true);
        }}
        aria-label="Apri la cronaca della serata"
      >
        <Icona nome="taccuino" size={14} />
        <span className="cronaca__riga" aria-live="polite">
          {ultima ? ultima.text : 'La serata è appena cominciata.'}
        </span>
      </button>

      <FoglioInferiore aperto={aperta} titolo="Cronaca della serata" onChiudi={() => setAperta(false)}>
        {righe.length === 0 ? (
          <p className="sommario">Ancora nulla da annotare.</p>
        ) : (
          <ol className="cronaca__elenco">
            {righe.map((r) => (
              <li key={r.id} className={`cronaca__voce cronaca__voce--${r.kind}`}>
                {r.text}
              </li>
            ))}
          </ol>
        )}
      </FoglioInferiore>
    </>
  );
}

function BottoneFoglio({
  attivo,
  icona,
  etichetta,
  conteggio,
  onClick,
}: {
  attivo: boolean;
  icona: string;
  etichetta: string;
  conteggio?: number;
  onClick: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      className={`partita__scheda${attivo ? ' partita__scheda--attiva' : ''}`}
      onClick={() => {
        audio.play('clic');
        onClick();
      }}
      aria-pressed={attivo}
    >
      <Icona nome={icona} size={20} />
      <span>{etichetta}</span>
      {conteggio !== undefined ? <span className="partita__conteggio">{conteggio}</span> : null}
    </button>
  );
}

/** Chi è in sala, con dichiarazioni, domande pubbliche e biglietti privati. */
function Sala(): ReactNode {
  const room = useGame((s) => s.room);
  const playerId = useGame((s) => s.playerId);
  const privateView = useGame((s) => s.privateView);
  const act = useGame((s) => s.act);
  const [bersaglio, setBersaglio] = useState<string | null>(null);
  const [testo, setTesto] = useState('');
  const [modo, setModo] = useState<'privato' | 'pubblico'>('privato');

  if (!room) return null;
  const altri = room.players.filter((p) => p.id !== playerId && !p.spectator);
  const domandeAperte = room.questions.filter((q) => q.toPlayerId === playerId && q.answer === null);
  const attoTre = room.phase === 'atto3';

  return (
    <>
      {domandeAperte.length > 0 ? (
        <section className="pannello" aria-label="Domande rivolte a te">
          <h3>Ti hanno chiesto</h3>
          {domandeAperte.map((q) => (
            <RispostaDomanda key={q.id} questionId={q.id} question={q.question} />
          ))}
        </section>
      ) : null}

      <ul className="lista-giocatori lista-giocatori--sala">
        {altri.map((p) => (
          <li key={p.id} className={p.connected ? '' : 'assente'}>
            <img src={`/assets/portrait/${p.avatar}/neutral-calm.svg`} alt="" width={44} height={55} />
            <span className="lista-giocatori__nome">
              <strong>{p.nickname}</strong>
              {p.roleName ? <span className="sommario"> · {p.roleName}</span> : null}
              {p.declarationText ? <span className="citazione">«{p.declarationText}»</span> : null}
              <span className="sommario">
                {p.sharedCount} in bacheca · {p.handCount} in mano
                {!p.connected ? ' · assente' : ''}
              </span>
            </span>
            <button
              type="button"
              className="bottone bottone--fantasma"
              onClick={() => setBersaglio(bersaglio === p.id ? null : p.id)}
              aria-expanded={bersaglio === p.id}
            >
              {bersaglio === p.id ? 'Chiudi' : 'Parla'}
            </button>
          </li>
        ))}
      </ul>

      {bersaglio ? (
        <section className="pannello" aria-label="Messaggio">
          <div className="riga">
            <button
              type="button"
              className={`bottone${modo === 'privato' ? ' bottone--primario' : ''}`}
              onClick={() => setModo('privato')}
              aria-pressed={modo === 'privato'}
            >
              Biglietto ({privateView?.privateMessagesLeft ?? 0})
            </button>
            <button
              type="button"
              className={`bottone${modo === 'pubblico' ? ' bottone--primario' : ''}`}
              onClick={() => setModo('pubblico')}
              aria-pressed={modo === 'pubblico'}
              disabled={!attoTre}
              title={attoTre ? undefined : 'Le domande pubbliche si fanno nell’Atto III'}
            >
              Domanda pubblica
            </button>
          </div>
          <textarea
            className="campo"
            rows={3}
            maxLength={modo === 'privato' ? 140 : 160}
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            aria-label={modo === 'privato' ? 'Testo del biglietto' : 'Domanda pubblica'}
            placeholder={modo === 'privato' ? 'Poche righe, sotto la porta.' : 'Una domanda a cui dovrà rispondere davanti a tutti.'}
          />
          <Azione
            variante="primario"
            largo
            disabled={testo.trim().length < 2}
            onClick={() => {
              if (modo === 'privato') {
                act({ t: 'privateMessage', toPlayerId: bersaglio, text: testo.trim() });
              } else {
                act({ t: 'publicQuestion', toPlayerId: bersaglio, question: testo.trim() });
              }
              setTesto('');
              setBersaglio(null);
            }}
          >
            Invia
          </Azione>
        </section>
      ) : null}

      {(privateView?.inbox.length ?? 0) > 0 ? (
        <section className="pannello" aria-label="Biglietti ricevuti">
          <h3>Sotto la porta</h3>
          <ul className="lista-biglietti">
            {privateView!.inbox.map((m) => (
              <li key={`${m.at}-${m.from}`} className="carta">
                <strong>{m.from}</strong>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

function RispostaDomanda({ questionId, question }: { questionId: string; question: string }): ReactNode {
  const act = useGame((s) => s.act);
  const [risposta, setRisposta] = useState('');
  return (
    <div className="domanda">
      <p className="citazione">«{question}»</p>
      <textarea
        className="campo"
        rows={2}
        maxLength={200}
        value={risposta}
        onChange={(e) => setRisposta(e.target.value)}
        aria-label="La tua risposta"
      />
      <Azione
        variante="primario"
        largo
        disabled={risposta.trim().length < 2}
        onClick={() => {
          act({ t: 'answerQuestion', questionId, answer: risposta.trim() });
          setRisposta('');
        }}
      >
        Rispondo
      </Azione>
    </div>
  );
}
