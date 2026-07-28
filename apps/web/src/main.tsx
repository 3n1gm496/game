import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { registraServiceWorker } from './pwa/registra.js';
import './styles/global.css';

const radice = document.getElementById('radice');
if (!radice) {
  throw new Error('Elemento radice non trovato');
}

createRoot(radice).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registraServiceWorker();

/**
 * Altezza reale della finestra su iOS: la barra del browser compare e scompare
 * e `100vh` mente. `100dvh` copre la maggior parte dei casi, ma la variabile
 * resta utile per i calcoli in JavaScript e per Safari meno recenti.
 */
function aggiornaAltezza(): void {
  document.documentElement.style.setProperty('--altezza-reale', `${window.innerHeight}px`);
}
aggiornaAltezza();
window.addEventListener('resize', aggiornaAltezza);
window.addEventListener('orientationchange', aggiornaAltezza);

/**
 * La tastiera virtuale non deve coprire il campo attivo. Quando la
 * `visualViewport` si restringe, si sposta il contenuto quel tanto che basta.
 */
const viewport = window.visualViewport;
if (viewport) {
  const adatta = (): void => {
    const scarto = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
    document.documentElement.style.setProperty('--tastiera', `${scarto}px`);
    document.documentElement.dataset.tastiera = scarto > 80 ? 'aperta' : 'chiusa';
  };
  viewport.addEventListener('resize', adatta);
  viewport.addEventListener('scroll', adatta);
  adatta();
}
