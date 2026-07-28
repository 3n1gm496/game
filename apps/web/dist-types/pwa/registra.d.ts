/**
 * Registrazione del service worker e aggiornamenti controllati.
 *
 * Il nuovo service worker non prende mai il posto del vecchio da solo: resta
 * in attesa finché l'utente non sceglie di aggiornare dalle impostazioni.
 * Un aggiornamento automatico durante una partita sarebbe un ricaricamento a
 * sorpresa, e il Méridien non fa sorprese di quel tipo.
 */
export declare function registraServiceWorker(): void;
export declare function aggiornaDisponibile(callback: () => void): () => void;
export declare function applicaAggiornamento(): void;
/** true quando il gioco gira come applicazione installata. */
export declare function inModalitaInstallata(): boolean;
//# sourceMappingURL=registra.d.ts.map