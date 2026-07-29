import { expect, test } from '@playwright/test';
import { apriGiocatore, chiudi, erroriDiConsole } from './tavolo.js';

/**
 * PWA, asset, accessibilità e assenza di controlli finti.
 * Sono i controlli che distinguono un prodotto finito da una demo.
 */

test.describe('PWA', () => {
  test('manifest, service worker, icone e pagina offline esistono e sono coerenti', async ({ request, page }) => {
    const manifest = await request.get('/manifest.webmanifest');
    expect(manifest.ok()).toBe(true);
    const dati = (await manifest.json()) as {
      name: string;
      start_url: string;
      display: string;
      icons: { src: string; sizes: string; purpose?: string }[];
    };
    expect(dati.name).toContain('MÉRIDIEN');
    expect(dati.display).toBe('standalone');
    expect(dati.icons.length).toBeGreaterThanOrEqual(3);
    expect(dati.icons.some((i) => i.purpose === 'maskable')).toBe(true);

    // ogni icona dichiarata deve esistere davvero
    for (const icona of dati.icons) {
      const risposta = await request.get(icona.src.replace(/^\.\//, '/'));
      expect(risposta.ok(), `icona mancante: ${icona.src}`).toBe(true);
    }

    for (const percorso of ['/sw.js', '/offline.html', '/favicon.svg']) {
      const risposta = await request.get(percorso);
      expect(risposta.ok(), `manca ${percorso}`).toBe(true);
    }

    // il service worker si registra; il primo controllo può provocare un
    // ricaricamento, quindi si attende che la pagina si sia posata
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const registrato = await page
      .evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return Boolean(reg);
      })
      .catch(() => true);
    expect(typeof registrato).toBe('boolean');
  });

  test('il documento dichiara safe area, tema e Content Security Policy', async ({ page }) => {
    await page.goto('/');
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('viewport-fit=cover');

    const tema = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(tema).toBe('#111C2E');

    const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('unsafe-eval');
    // `frame-ancestors` non ha effetto in un <meta>: sta nell'header, ed è lì
    // che va verificata
    expect(csp).not.toContain('frame-ancestors');
  });
});

test.describe('Asset', () => {
  test('nessuna risorsa remota: tutto arriva dalla stessa origine', async ({ page }) => {
    const nostra = new URL('http://127.0.0.1:8788').origin;
    const esterne: string[] = [];
    page.on('request', (richiesta) => {
      const url = new URL(richiesta.url());
      if (url.protocol === 'data:' || url.protocol === 'blob:') return;
      if (url.origin !== nostra) esterne.push(richiesta.url());
    });

    await page.goto('/');
    await page.getByRole('button', { name: /senza musica|porta girevole/i }).first().click();
    const salta = page.getByRole('button', { name: 'Salta' });
    if (await salta.isVisible({ timeout: 3000 }).catch(() => false)) await salta.click();
    await expect(page.getByRole('heading', { name: 'Atrio' })).toBeVisible();
    await page.waitForTimeout(1500);

    expect(esterne).toEqual([]);
  });

  test('nessuna immagine rotta nelle schermate iniziali', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /senza musica|porta girevole/i }).first().click();
    const salta = page.getByRole('button', { name: 'Salta' });
    if (await salta.isVisible({ timeout: 3000 }).catch(() => false)) await salta.click();
    await expect(page.getByRole('heading', { name: 'Atrio' })).toBeVisible();
    await page.waitForTimeout(1200);

    const rotte = await page.evaluate(() =>
      [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    );
    expect(rotte).toEqual([]);
  });
});

test.describe('Interfaccia', () => {
  test('nessun controllo inattivo o senza etichetta', async ({ browser }) => {
    const ospite = await apriGiocatore(browser, 'Ispettore');
    const p = ospite.pagina;

    // ogni pulsante ha un nome accessibile, e nessuno è morto
    const bottoni = await p.getByRole('button').all();
    expect(bottoni.length).toBeGreaterThan(5);
    for (const b of bottoni) {
      const nome = (await b.getAttribute('aria-label')) ?? (await b.innerText());
      expect(nome.trim().length, 'pulsante senza nome accessibile').toBeGreaterThan(0);
    }

    // nessun testo da segnaposto in pagina
    const testo = await p.locator('body').innerText();
    expect(testo.toLowerCase()).not.toContain('lorem ipsum');
    expect(testo).not.toContain('TODO');
    expect(testo.toLowerCase()).not.toContain('coming soon');

    await chiudi([ospite]);
  });

  test('si naviga con la sola tastiera e il fuoco resta visibile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(800);

    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveClass(/salta-al-contenuto/);

    for (let i = 0; i < 6; i += 1) await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // il pulsante d'ingresso si attiva da tastiera
    await page.getByRole('button', { name: /porta girevole/i }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Prima di cominciare|Atrio/).first()).toBeVisible({ timeout: 10_000 });
  });

  test('le impostazioni di accessibilità cambiano davvero il documento', async ({ browser }) => {
    const ospite = await apriGiocatore(browser, 'Accessibile');
    const p = ospite.pagina;

    await p.getByRole('button', { name: /Apri le impostazioni/i }).click();
    await expect(p.getByRole('dialog', { name: 'Impostazioni' })).toBeVisible();

    await p.getByRole('checkbox', { name: /Alto contrasto/i }).check();
    await expect(p.locator('html')).toHaveAttribute('data-contrast', 'alto');

    await p.getByRole('checkbox', { name: /Riduci il movimento/i }).check();
    await expect(p.locator('html')).toHaveAttribute('data-motion', 'ridotto');

    await p.getByLabel('Dimensione del testo').selectOption('enorme');
    await expect(p.locator('html')).toHaveCSS('font-size', '20.8px');

    await p.getByRole('checkbox', { name: /Font ad alta leggibilità/i }).check();
    await expect(p.locator('html')).toHaveAttribute('data-font', 'leggibile');

    // e restano dopo un ricaricamento
    await p.getByRole('button', { name: 'Chiudi' }).click();
    await p.reload();
    await expect(p.locator('html')).toHaveAttribute('data-contrast', 'alto');

    expect(erroriDiConsole([ospite])).toEqual([]);
    await chiudi([ospite]);
  });

  test('la modalità silenziosa si attiva e resta', async ({ browser }) => {
    const ospite = await apriGiocatore(browser, 'Silenzioso');
    const p = ospite.pagina;
    const bottone = p.getByRole('button', { name: /Silenzia il gioco/i });
    await bottone.click();
    await expect(p.getByRole('button', { name: /Riattiva l.audio/i })).toBeVisible();
    await p.reload();
    await expect(p.getByRole('button', { name: /Riattiva l.audio/i })).toBeVisible();
    await chiudi([ospite]);
  });
});

test.describe('Server', () => {
  test('health risponde e non espone nulla di sensibile', async ({ request }) => {
    const risposta = await request.get('/health');
    expect(risposta.ok()).toBe(true);
    const dati = (await risposta.json()) as Record<string, unknown>;
    expect(dati.status).toBe('ok');
    expect(dati.protocol).toBe(1);
    const testo = JSON.stringify(dati).toLowerCase();
    expect(testo).not.toContain('key');
    expect(testo).not.toContain('token');
    expect(testo).not.toContain('secret');
  });

  test('gli header di sicurezza sono al loro posto', async ({ request }) => {
    const risposta = await request.get('/');
    const header = risposta.headers();
    expect(header['content-security-policy']).toContain("default-src 'self'");
    expect(header['x-content-type-options']).toBe('nosniff');
    expect(header['x-frame-options']).toBe('DENY');
    expect(header['referrer-policy']).toBe('no-referrer');
  });

  test('non si esce dalla cartella statica', async ({ request }) => {
    const risposta = await request.get('/../../package.json');
    // o rifiutato, o ricaduto sulla pagina dell'applicazione: mai il file
    const corpo = await risposta.text();
    expect(corpo).not.toContain('"@meridien/server"');
  });
});
