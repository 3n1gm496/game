import { type ReactNode } from 'react';
/** Icona dal foglio sprite generato (`/assets/icons.svg`). */
export declare function Icona({ nome, size, className, }: {
    nome: string;
    size?: number;
    className?: string;
}): ReactNode;
/** Occhiello + titolo, la testata ricorrente di ogni schermata. */
export declare function Testata({ occhiello, titolo, sommario, }: {
    occhiello: string;
    titolo: string;
    sommario?: string;
}): ReactNode;
/**
 * Conto alla rovescia della fase. Mostra minuti e secondi, diventa lacca
 * sotto i trenta secondi e annuncia le soglie ai lettori di schermo.
 */
export declare function Cronometro({ endsAt, paused }: {
    endsAt: number | null;
    paused: boolean;
}): ReactNode;
/** Foglio che sale dal basso: usato per taccuino, bacheca, impostazioni. */
export declare function FoglioInferiore({ aperto, titolo, onChiudi, children, }: {
    aperto: boolean;
    titolo: string;
    onChiudi: () => void;
    children: ReactNode;
}): ReactNode;
/** Pulsante con ritorno tattile e sonoro coerente in tutto il gioco. */
export declare function Azione({ children, onClick, variante, disabled, largo, suono, ...rest }: {
    children: ReactNode;
    onClick: () => void;
    variante?: 'normale' | 'primario' | 'pericolo' | 'fantasma';
    disabled?: boolean;
    largo?: boolean;
    suono?: 'clic' | 'carta' | 'notifica' | 'nessuno';
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'>): ReactNode;
//# sourceMappingURL=base.d.ts.map