import { useState, type ReactNode } from 'react';
import { PUBLIC_CASES } from '@meridien/content/public';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Icona, Testata } from '../components/base.js';

/**
 * Atrio: la schermata da cui si apre una nuova indagine o si entra con un
 * codice. Il catalogo dei casi arriva dal pacchetto pubblico, che non contiene
 * soluzioni né segreti.
 */

const AVATAR = Array.from({ length: 12 }, (_, i) => `portrait-${String(i + 1).padStart(2, '0')}`);

export function Atrio(): ReactNode {
  const nickname = useGame((s) => s.nickname);
  const avatar = useGame((s) => s.avatar);
  const setProfile = useGame((s) => s.setProfile);
  const createRoom = useGame((s) => s.createRoom);
  const joinRoom = useGame((s) => s.joinRoom);
  const status = useGame((s) => s.status);
  const lastError = useGame((s) => s.lastError);
  const casiDalServer = useGame((s) => s.cases);

  const casi = casiDalServer.length > 0 ? casiDalServer : PUBLIC_CASES;
  const preselezionato = new URLSearchParams(location.search).get('stanza') ?? '';

  const [modo, setModo] = useState<'scelta' | 'nuovo' | 'entra'>(preselezionato ? 'entra' : 'scelta');
  const [codice, setCodice] = useState(preselezionato.toUpperCase());
  const [casoScelto, setCasoScelto] = useState(casi[0]?.id ?? '');
  const [nome, setNome] = useState(nickname);
  const [ritratto, setRitratto] = useState(avatar);

  const connesso = status === 'aperta';

  const confermaProfilo = (): void => {
    const pulito = nome.trim().slice(0, 18) || 'Ospite';
    setProfile(pulito, ritratto);
  };

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <Testata
            occhiello="Grand Hotel Méridien"
            titolo="Atrio"
            sommario="Quattro a otto ospiti. Venti minuti. Una porta che non doveva potersi chiudere."
          />

          {lastError ? (
            <p className="avviso" role="status">
              {lastError}
            </p>
          ) : null}

          <section className="pannello" aria-label="Il tuo personaggio">
            <label htmlFor="campo-nome">Come ti presenti</label>
            <input
              id="campo-nome"
              className="campo"
              value={nome}
              maxLength={18}
              autoComplete="off"
              onChange={(e) => setNome(e.target.value)}
              onBlur={confermaProfilo}
              placeholder="Il tuo nome alla reception"
            />
            <p className="sommario" style={{ marginTop: 'var(--sp-2)' }}>
              Nessun account, nessuna e-mail. Il nome resta su questo dispositivo.
            </p>
            <ul className="scelta-ritratti" aria-label="Scegli un ritratto">
              {AVATAR.map((a) => (
                <li key={a}>
                  <button
                    type="button"
                    className={`ritratto${a === ritratto ? ' ritratto--scelto' : ''}`}
                    aria-pressed={a === ritratto}
                    aria-label={`Ritratto ${a.replace('portrait-', '')}`}
                    onClick={() => {
                      audio.play('carta');
                      setRitratto(a);
                      setProfile(nome.trim() || 'Ospite', a);
                    }}
                  >
                    <img src={`/assets/portrait/${a}/neutral-calm.svg`} alt="" width={72} height={90} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {modo === 'scelta' ? (
            <div className="griglia" style={{ gridTemplateColumns: '1fr' }}>
              <Azione
                variante="primario"
                largo
                disabled={!connesso}
                onClick={() => {
                  confermaProfilo();
                  setModo('nuovo');
                }}
              >
                <Icona nome="campanello" size={18} /> Apri una nuova indagine
              </Azione>
              <Azione
                largo
                disabled={!connesso}
                onClick={() => {
                  confermaProfilo();
                  setModo('entra');
                }}
              >
                <Icona nome="chiave" size={18} /> Entra con un codice
              </Azione>
              {!connesso ? (
                <p className="sommario" role="status">
                  {status === 'riconnessione'
                    ? 'La linea è caduta. Sto richiamando la reception…'
                    : 'Collegamento al Méridien in corso…'}
                </p>
              ) : null}
            </div>
          ) : null}

          {modo === 'nuovo' ? (
            <section className="pannello" aria-label="Scegli il caso">
              <h2>Il caso della serata</h2>
              <ul className="lista-casi">
                {casi.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`caso${c.id === casoScelto ? ' caso--scelto' : ''}`}
                      aria-pressed={c.id === casoScelto}
                      onClick={() => {
                        audio.play('carta');
                        setCasoScelto(c.id);
                      }}
                    >
                      <img
                        src={`/assets/scene/${c.coverScene}/layer-1.svg`}
                        alt=""
                        className="caso__copertina"
                        loading="lazy"
                        width={120}
                        height={80}
                      />
                      <span className="caso__testo">
                        <span className="occhiello">Caso {c.number} · {c.date}</span>
                        <strong>{c.title}</strong>
                        <span className="sommario">{c.tagline}</span>
                        <span className="caso__meta">
                          {'◆'.repeat(c.difficulty)}
                          {'◇'.repeat(3 - c.difficulty)} · {c.roleCount} sospettati ·{' '}
                          {c.clueCount} indizi · {c.variantCount} varianti
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="riga" style={{ marginTop: 'var(--sp-3)' }}>
                <Azione variante="fantasma" onClick={() => setModo('scelta')}>
                  Indietro
                </Azione>
                <Azione
                  variante="primario"
                  largo
                  disabled={!connesso || !casoScelto}
                  onClick={() => {
                    confermaProfilo();
                    createRoom(casoScelto);
                  }}
                >
                  Apri la stanza
                </Azione>
              </div>
            </section>
          ) : null}

          {modo === 'entra' ? (
            <section className="pannello" aria-label="Entra in una stanza">
              <h2>Codice della stanza</h2>
              <label htmlFor="campo-codice">Cinque lettere consegnate dalla reception</label>
              <input
                id="campo-codice"
                className="campo campo--codice"
                value={codice}
                onChange={(e) => setCodice(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={5}
                placeholder="—————"
                aria-describedby="aiuto-codice"
              />
              <p id="aiuto-codice" className="sommario">
                Il codice non contiene mai I, O, zero o uno: non c’è modo di sbagliarsi.
              </p>
              <div className="riga" style={{ marginTop: 'var(--sp-3)' }}>
                <Azione variante="fantasma" onClick={() => setModo('scelta')}>
                  Indietro
                </Azione>
                <Azione
                  variante="primario"
                  largo
                  disabled={!connesso || codice.length !== 5}
                  onClick={() => {
                    confermaProfilo();
                    joinRoom(codice);
                  }}
                >
                  Entra
                </Azione>
              </div>
            </section>
          ) : null}

          <p className="sommario piede">
            Si gioca meglio guardandosi in faccia, o in videochiamata. Il Méridien tiene i conti,
            voi tenete i segreti.
          </p>
        </div>
      </div>
    </div>
  );
}
