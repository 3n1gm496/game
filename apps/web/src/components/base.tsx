import { useEffect, useRef, useState, type ReactNode } from 'react';
import { audio } from '../audio/engine.js';
import { haptic } from '../store/settings.js';
import { simbolo } from './icone.js';

/**
 * Icona dal foglio sprite generato da `tools/generate-assets`.
 *
 * Il riferimento è interno (`#icon-…`), non al file: `installaSprite()` inietta
 * il foglio nel documento all'avvio. Un `<use>` che punta a un file esterno non
 * è affidabile su WebKit, e il foglio pesa cinque kilobyte: conviene averlo
 * dentro la pagina e risparmiare anche la richiesta.
 */
export function Icona({
  nome,
  size = 20,
  className,
}: {
  nome: string;
  size?: number;
  className?: string;
}): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ flex: '0 0 auto' }}
    >
      <use href={`#icon-${simbolo(nome)}`} />
    </svg>
  );
}

/** Occhiello + titolo, la testata ricorrente di ogni schermata. */
export function Testata({
  occhiello,
  titolo,
  sommario,
}: {
  occhiello: string;
  titolo: string;
  sommario?: string;
}): ReactNode {
  return (
    <header style={{ marginBottom: 'var(--sp-3)' }}>
      <p className="occhiello">{occhiello}</p>
      <h1>{titolo}</h1>
      {sommario ? <p className="sommario">{sommario}</p> : null}
    </header>
  );
}

/**
 * Conto alla rovescia della fase. Mostra minuti e secondi, diventa lacca
 * sotto i trenta secondi e annuncia le soglie ai lettori di schermo.
 */
export function Cronometro({ endsAt, paused }: { endsAt: number | null; paused: boolean }): ReactNode {
  const [rimasti, setRimasti] = useState<number | null>(null);
  const ultimoBeep = useRef<number>(-1);

  useEffect(() => {
    if (endsAt === null) {
      setRimasti(null);
      return;
    }
    const aggiorna = (): void => {
      const secondi = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setRimasti(secondi);
      if (secondi <= 10 && secondi > 0 && secondi !== ultimoBeep.current && !paused) {
        ultimoBeep.current = secondi;
        audio.play('conto-alla-rovescia');
      }
    };
    aggiorna();
    const id = window.setInterval(aggiorna, 500);
    return () => window.clearInterval(id);
  }, [endsAt, paused]);

  if (endsAt === null) {
    return (
      <span className="pillola" title="I timer sono disattivati in questa partita">
        <Icona nome="orologio" size={14} /> senza tempo
      </span>
    );
  }
  if (rimasti === null) return null;

  const minuti = Math.floor(rimasti / 60);
  const secondi = rimasti % 60;
  const urgente = rimasti <= 30;

  return (
    <span
      className="mono"
      role="timer"
      aria-live={rimasti <= 10 ? 'assertive' : 'off'}
      aria-label={`Tempo rimasto: ${minuti} minuti e ${secondi} secondi`}
      style={{
        fontSize: '1.125rem',
        color: urgente ? 'var(--c-lacquer)' : 'var(--c-brass)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {paused ? '⏸ ' : ''}
      {String(minuti).padStart(2, '0')}:{String(secondi).padStart(2, '0')}
    </span>
  );
}

/** Foglio che sale dal basso: usato per taccuino, bacheca, impostazioni. */
export function FoglioInferiore({
  aperto,
  titolo,
  onChiudi,
  children,
}: {
  aperto: boolean;
  titolo: string;
  onChiudi: () => void;
  children: ReactNode;
}): ReactNode {
  const riferimento = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const precedente = document.activeElement as HTMLElement | null;
    riferimento.current?.focus();
    const suTasto = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onChiudi();
      if (e.key !== 'Tab' || !riferimento.current) return;
      const focusabili = riferimento.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusabili.length === 0) return;
      const primo = focusabili[0]!;
      const ultimo = focusabili[focusabili.length - 1]!;
      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primo.focus();
      }
    };
    document.addEventListener('keydown', suTasto);
    return () => {
      document.removeEventListener('keydown', suTasto);
      precedente?.focus?.();
    };
  }, [aperto, onChiudi]);

  if (!aperto) return null;

  return (
    <div
      className="foglio-sfondo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div
        className="foglio"
        role="dialog"
        aria-modal="true"
        aria-label={titolo}
        tabIndex={-1}
        ref={riferimento}
      >
        <div className="foglio__testata">
          <h2>{titolo}</h2>
          <button type="button" className="bottone bottone--fantasma" onClick={onChiudi}>
            Chiudi
          </button>
        </div>
        <div className="foglio__corpo">{children}</div>
      </div>
    </div>
  );
}

/** Pulsante con ritorno tattile e sonoro coerente in tutto il gioco. */
export function Azione({
  children,
  onClick,
  variante = 'normale',
  disabled,
  largo,
  suono = 'clic',
  ...rest
}: {
  children: ReactNode;
  onClick: () => void;
  variante?: 'normale' | 'primario' | 'pericolo' | 'fantasma';
  disabled?: boolean;
  largo?: boolean;
  suono?: 'clic' | 'carta' | 'notifica' | 'nessuno';
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'>): ReactNode {
  const classi = [
    'bottone',
    variante !== 'normale' ? `bottone--${variante}` : '',
    largo ? 'bottone--largo' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classi}
      disabled={disabled}
      onClick={() => {
        if (suono !== 'nessuno') audio.play(suono);
        haptic(10);
        onClick();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
