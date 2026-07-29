/**
 * Registrazione del service worker e aggiornamenti controllati.
 *
 * Il nuovo service worker non prende mai il posto del vecchio da solo: resta
 * in attesa finché l'utente non sceglie di aggiornare dalle impostazioni.
 * Un aggiornamento automatico durante una partita sarebbe un ricaricamento a
 * sorpresa, e il Méridien non fa sorprese di quel tipo.
 */

let registrazione: ServiceWorkerRegistration | null = null;
const ascoltatori = new Set<() => void>();
let pronto = false;

export function registraServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return; // in sviluppo il service worker intralcia il ricaricamento

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        registrazione = reg;
        if (reg.waiting) segnala();
        reg.addEventListener('updatefound', () => {
          const nuovo = reg.installing;
          if (!nuovo) return;
          nuovo.addEventListener('statechange', () => {
            if (nuovo.state === 'installed' && navigator.serviceWorker.controller) segnala();
          });
        });
        // controllo periodico, discreto
        window.setInterval(() => void reg.update(), 30 * 60_000);
      })
      .catch(() => {
        // senza service worker il gioco funziona lo stesso: si perde solo
        // la modalità offline
      });

    /*
     * Ricaricare serve solo dopo un aggiornamento accettato dall'utente.
     *
     * Alla primissima visita non c'è ancora un controller: quando il service
     * worker appena installato prende il controllo, `controllerchange` scatta
     * lo stesso. Ricaricare lì significa far lampeggiare la pagina a chiunque
     * apra il gioco per la prima volta, senza alcun motivo. Si ricarica quindi
     * solo se un controller c'era già.
     */
    const cEraUnControllore = Boolean(navigator.serviceWorker.controller);
    let ricaricato = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!cEraUnControllore || ricaricato) return;
      ricaricato = true;
      location.reload();
    });
  });
}

function segnala(): void {
  pronto = true;
  for (const l of ascoltatori) l();
}

export function aggiornaDisponibile(callback: () => void): () => void {
  ascoltatori.add(callback);
  if (pronto) callback();
  return () => ascoltatori.delete(callback);
}

export function applicaAggiornamento(): void {
  const attesa = registrazione?.waiting;
  if (!attesa) {
    location.reload();
    return;
  }
  attesa.postMessage({ tipo: 'PRENDI-IL-CONTROLLO' });
}

/** true quando il gioco gira come applicazione installata. */
export function inModalitaInstallata(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
