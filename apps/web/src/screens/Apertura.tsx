import { useEffect, useState, type ReactNode } from 'react';
import { useGame } from '../store/game.js';
import { audio } from '../audio/engine.js';
import { Azione, Icona } from '../components/base.js';

/**
 * Apertura cinematografica e tutorial.
 * L'audio parte solo dal primo tocco: è il gesto che sblocca l'AudioContext
 * sui browser mobili, e qui è anche un gesto narrativo — si spinge la porta.
 */

export function Apertura(): ReactNode {
  const setScreen = useGame((s) => s.setScreen);
  const tutorialSeen = useGame((s) => s.tutorialSeen);
  const [fase, setFase] = useState<'insegna' | 'titolo'>('insegna');

  useEffect(() => {
    const id = window.setTimeout(() => setFase('titolo'), 1600);
    return () => window.clearTimeout(id);
  }, []);

  const entra = async (): Promise<void> => {
    await audio.unlock();
    audio.setAmbience('pioggia');
    audio.startMusic();
    audio.play('porta');
    setScreen(tutorialSeen ? 'atrio' : 'tutorial');
  };

  return (
    <div className="schermo apertura">
      <div className="apertura__cielo" aria-hidden="true" />
      {/*
        La facciata dell'albergo, in tre piani di profondità. Sono le stesse
        immagini della scena di gioco, qui montate come semplici <img>: nessun
        contesto WebGL prima del primo tocco, e la porta girevole si vede già
        dal titolo.
      */}
      <div className="apertura__facciata" aria-hidden="true">
        <img src="/assets/scene/facciata/layer-0.svg" alt="" className="apertura__strato apertura__strato--fondo" />
        <img src="/assets/scene/facciata/layer-1.svg" alt="" className="apertura__strato apertura__strato--medio" />
        <img src="/assets/scene/facciata/layer-2.svg" alt="" className="apertura__strato apertura__strato--fronte" />
      </div>
      <div className="apertura__pioggia" aria-hidden="true" />

      <div className="apertura__centro">
        <img
          src="/assets/logo-animato.svg"
          alt="MÉRIDIEN"
          className={`apertura__logo${fase === 'titolo' ? ' apertura__logo--posato' : ''}`}
          width={520}
          height={220}
        />
        <p className="apertura__sottotitolo">Delitto al Grand Hotel</p>
        <p className="apertura__didascalia">
          Riviera ligure, gennaio 1968. La strada è franata, il telefono va e viene,
          il ballo continua.
        </p>
      </div>

      <div className="apertura__base">
        <Azione variante="primario" largo onClick={() => void entra()} suono="nessuno">
          <Icona nome="porta" size={18} /> Spingi la porta girevole
        </Azione>
        <button
          type="button"
          className="bottone bottone--fantasma bottone--largo"
          onClick={() => {
            void audio.unlock();
            setScreen('atrio');
          }}
        >
          Entra senza musica
        </button>
      </div>
    </div>
  );
}

interface Scheda {
  titolo: string;
  testo: string;
  icona: string;
  esercizio: string;
}

const SCHEDE: Scheda[] = [
  {
    titolo: 'Ognuno sa qualcosa',
    testo:
      'Ricevi un personaggio, un alibi da dire ad alta voce e una cronologia vera che è solo tua. Nessuno vede le tue carte.',
    icona: 'taccuino',
    esercizio: 'Tocca per leggere il tuo dossier',
  },
  {
    titolo: 'Si cerca, si sceglie',
    testo:
      'Negli ambienti dell’albergo trovi indizi. Puoi metterli in bacheca perché li vedano tutti, oppure tenerli per te.',
    icona: 'lente',
    esercizio: 'Tocca per esaminare un oggetto',
  },
  {
    titolo: 'Mentire è permesso',
    testo:
      'Tutti hanno un segreto da proteggere, non solo il colpevole. Chi mente non è per forza chi ha ucciso.',
    icona: 'maschera',
    esercizio: 'Tocca per scegliere una dichiarazione',
  },
  {
    titolo: 'Alla fine, un nome',
    testo:
      'Ognuno deposita colpevole, movente, metodo e sequenza. Poi il gruppo decide insieme. Il Méridien confronta la vostra teoria con la verità.',
    icona: 'sigillo',
    esercizio: 'Tocca per firmare l’accusa',
  },
];

export function Tutorial(): ReactNode {
  const setScreen = useGame((s) => s.setScreen);
  const markTutorialSeen = useGame((s) => s.markTutorialSeen);
  const [indice, setIndice] = useState(0);
  const [provato, setProvato] = useState<boolean[]>([false, false, false, false]);
  const scheda = SCHEDE[indice]!;

  const chiudi = (): void => {
    markTutorialSeen();
    setScreen('atrio');
  };

  return (
    <div className="schermo">
      <div className="contenuto">
        <div className="colonna">
          <p className="occhiello">Prima di cominciare · {indice + 1} di {SCHEDE.length}</p>
          <div className="pannello pannello--tagliato tutorial__scheda">
            <Icona nome={scheda.icona} size={40} className="tutorial__icona" />
            <h2>{scheda.titolo}</h2>
            <p className="sommario">{scheda.testo}</p>
            <button
              type="button"
              className={`tutorial__prova${provato[indice] ? ' tutorial__prova--fatto' : ''}`}
              onClick={() => {
                audio.play(indice === 1 ? 'indizio' : 'carta');
                setProvato((p) => p.map((v, i) => (i === indice ? true : v)));
              }}
              aria-pressed={provato[indice]}
            >
              {provato[indice] ? 'Ecco fatto' : scheda.esercizio}
            </button>
          </div>

          <div className="riga riga--spazio">
            <button type="button" className="bottone bottone--fantasma" onClick={chiudi}>
              Salta
            </button>
            <div className="riga">
              {SCHEDE.map((s, i) => (
                <span
                  key={s.titolo}
                  className={`punto${i === indice ? ' punto--attivo' : ''}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <Azione
              variante="primario"
              onClick={() => {
                if (indice < SCHEDE.length - 1) setIndice(indice + 1);
                else chiudi();
              }}
            >
              {indice < SCHEDE.length - 1 ? 'Avanti' : 'Al Méridien'}
            </Azione>
          </div>
        </div>
      </div>
    </div>
  );
}
