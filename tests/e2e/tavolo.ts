import { expect, type Browser, type BrowserContext, type ConsoleMessage, type Page } from '@playwright/test';

/**
 * Utilità per condurre una partita vera con più giocatori.
 *
 * Ogni giocatore ha un contesto browser proprio: archiviazione separata,
 * sessione separata, WebSocket separato. Se la sincronizzazione fra due
 * giocatori funziona qui, funziona fra due telefoni.
 */

export interface Giocatore {
  readonly nome: string;
  readonly contesto: BrowserContext;
  readonly pagina: Page;
  readonly erroriConsole: string[];
}

/** Messaggi di console che non indicano un problema dell'applicazione. */
const RUMORE_AMMESSO = [
  /Download the React DevTools/i,
  /WebGL|WebGPU|GPU stall|Automatic fallback to software WebGL/i,
  /\[vite\]/i,
  /Failed to load resource.*favicon/i,
];

export async function apriGiocatore(browser: Browser, nome: string): Promise<Giocatore> {
  const contesto = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'it-IT',
  });
  const pagina = await contesto.newPage();
  const erroriConsole: string[] = [];

  const raccogli = (msg: ConsoleMessage): void => {
    if (msg.type() !== 'error') return;
    const testo = msg.text();
    if (RUMORE_AMMESSO.some((re) => re.test(testo))) return;
    erroriConsole.push(`${nome}: ${testo}`);
  };
  pagina.on('console', raccogli);
  pagina.on('pageerror', (errore) => {
    erroriConsole.push(`${nome}: ${errore.message}`);
  });

  await pagina.goto('/');
  await attraversaApertura(pagina, nome);
  return { nome, contesto, pagina, erroriConsole };
}

/** Apertura cinematografica + tutorial, fino all'atrio. */
export async function attraversaApertura(pagina: Page, nome: string): Promise<void> {
  await pagina.getByRole('button', { name: /senza musica|porta girevole/i }).first().click();

  // il tutorial compare solo la prima volta
  const salta = pagina.getByRole('button', { name: 'Salta' });
  if (await salta.isVisible({ timeout: 3000 }).catch(() => false)) {
    await salta.click();
  }

  await expect(pagina.getByRole('heading', { name: 'Atrio' })).toBeVisible();
  const campoNome = pagina.getByLabel('Come ti presenti');
  await campoNome.fill(nome);
  await campoNome.blur();
}

/** Crea una stanza e restituisce il codice. */
export async function creaStanza(giocatore: Giocatore, caso?: string): Promise<string> {
  const p = giocatore.pagina;
  await p.getByRole('button', { name: /Apri una nuova indagine/i }).click();
  if (caso) {
    await p.getByRole('button', { name: new RegExp(caso, 'i') }).click();
  }
  await p.getByRole('button', { name: /^Apri la stanza$/i }).click();

  await expect(p.getByRole('heading', { name: 'Il ricevimento' })).toBeVisible();
  const codice = await p.locator('.codice-stanza__valore').innerText();
  expect(codice).toMatch(/^[A-HJ-NP-Z2-9]{5}$/);
  return codice.trim();
}

export async function entraInStanza(giocatore: Giocatore, codice: string): Promise<void> {
  const p = giocatore.pagina;
  await p.getByRole('button', { name: /Entra con un codice/i }).click();
  await p.getByLabel(/Cinque lettere/i).fill(codice);
  await p.getByRole('button', { name: /^Entra$/ }).click();
  await expect(p.getByRole('heading', { name: 'Il ricevimento' })).toBeVisible();
}

export async function dichiaratiPronto(giocatore: Giocatore): Promise<void> {
  await giocatore.pagina.getByRole('button', { name: /^Sono pronto$/i }).click();
}

/** Avvia la partita: solo chi ha aperto la stanza può farlo. */
export async function comincia(host: Giocatore): Promise<void> {
  const bottone = host.pagina.getByRole('button', { name: /^Comincia$/ });
  await expect(bottone).toBeEnabled({ timeout: 15_000 });
  await bottone.click();
  await expect(host.pagina.getByText(/Riservato/i)).toBeVisible({ timeout: 15_000 });
}

/** Fa avanzare la fase con il consenso dell'host. */
export async function avanza(host: Giocatore): Promise<void> {
  const bottone = host.pagina.getByRole('button', { name: /Avanti|Ho letto|I punteggi/i }).first();
  await bottone.click();
}

/**
 * Cerca finché non trova qualcosa.
 *
 * Alcuni hotspot nascondono un enigma: il client non conosce la risposta, come
 * un giocatore vero. Se ne capita uno il test prova la prima opzione e, se non
 * basta, passa a un altro angolo della stanza. Restituisce quanti indizi ha in
 * mano alla fine.
 */
export async function cerca(giocatore: Giocatore, tentativi = 6): Promise<number> {
  const p = giocatore.pagina;
  for (let i = 0; i < tentativi; i += 1) {
    const hotspot = p.locator('.hotspot:not([disabled])');
    const quanti = await hotspot.count();
    if (quanti === 0) break;
    await hotspot.nth(i % quanti).click();
    await p.waitForTimeout(500);

    const enigma = p.getByRole('dialog', { name: 'Un piccolo enigma' });
    if (await enigma.isVisible().catch(() => false)) {
      const opzioni = enigma.locator('.opzioni-enigma button');
      if ((await opzioni.count()) > 0) {
        await opzioni.first().click();
        await enigma.getByRole('button', { name: /Provo questa/i }).click();
      } else {
        await enigma.getByRole('button', { name: /Lascia stare/i }).click();
      }
      await p.waitForTimeout(500);
    }

    await p.getByRole('button', { name: /^Indizi/ }).click();
    const carte = await p.locator('.carta-indizio').count();
    await p.getByRole('button', { name: 'Chiudi', exact: true }).click();
    if (carte > 0) return carte;
  }
  return 0;
}

export async function chiudi(giocatori: readonly Giocatore[]): Promise<void> {
  for (const g of giocatori) {
    await g.contesto.close().catch(() => undefined);
  }
}

export function erroriDiConsole(giocatori: readonly Giocatore[]): string[] {
  return giocatori.flatMap((g) => g.erroriConsole);
}
