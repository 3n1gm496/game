import foglio from '../../public/assets/icons.svg?raw';

/**
 * Il foglio sprite delle icone, incorporato nella pagina.
 *
 * Viene inserito una volta sola, nascosto, prima che React disegni qualsiasi
 * cosa: da quel momento ogni `<use href="#icon-…">` trova il proprio simbolo
 * nello stesso documento. È l'unico modo affidabile su WebKit, dove i
 * riferimenti a file esterni dentro `<use>` non sono garantiti, e toglie di
 * mezzo una richiesta di rete al primo disegno dell'interfaccia.
 */
export function installaSprite(): void {
  if (document.getElementById('sprite-icone')) return;

  const contenitore = document.createElement('div');
  contenitore.id = 'sprite-icone';
  contenitore.setAttribute('aria-hidden', 'true');
  // `display:none` toglierebbe i simboli anche a `<use>` su alcuni motori:
  // si nasconde senza rimuovere dal rendering.
  contenitore.style.cssText =
    'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  contenitore.innerHTML = foglio;

  const radice = contenitore.querySelector('svg');
  if (radice) {
    radice.setAttribute('width', '0');
    radice.setAttribute('height', '0');
  }

  document.body.insertBefore(contenitore, document.body.firstChild);
}
