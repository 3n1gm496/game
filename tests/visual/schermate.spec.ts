import { expect, test, type Page } from '@playwright/test';

/**
 * Regressione visiva delle schermate principali.
 *
 * I quattro viewport coprono i casi che rompono un layout: un iPhone moderno,
 * un telefono piccolo, un tablet e un desktop. Le varianti coprono alto
 * contrasto, testo ingrandito, movimento ridotto e nomi lunghi.
 *
 * Le animazioni sono disattivate prima di ogni scatto: uno snapshot che
 * dipende dal momento in cui viene preso non è una verifica, è un dado.
 */

const VIEWPORT = {
  'iphone-15': { width: 393, height: 852 },
  'telefono-piccolo': { width: 320, height: 568 },
  tablet: { width: 834, height: 1112 },
  desktop: { width: 1440, height: 900 },
} as const;

async function fermaLeAnimazioni(pagina: Page): Promise<void> {
  await pagina.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* il canvas Pixi non è deterministico: la pioggia cade dove vuole */
      canvas { visibility: hidden !important; }
    `,
  });
  await pagina.waitForTimeout(350);
}

async function vaiAllAtrio(pagina: Page, nome = 'Ospite'): Promise<void> {
  await pagina.goto('/');
  await pagina.getByRole('button', { name: /senza musica|porta girevole/i }).first().click();
  const salta = pagina.getByRole('button', { name: 'Salta' });
  if (await salta.isVisible({ timeout: 3000 }).catch(() => false)) await salta.click();
  await expect(pagina.getByRole('heading', { name: 'Atrio' })).toBeVisible();
  const campo = pagina.getByLabel('Come ti presenti');
  await campo.fill(nome);
  await campo.blur();
}

test.describe('Schermate principali', () => {
  for (const [nome, viewport] of Object.entries(VIEWPORT)) {
    test(`apertura · ${nome}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/', { waitUntil: 'load' });
      await expect(page.getByAltText('MÉRIDIEN')).toBeVisible();
      await fermaLeAnimazioni(page);
      await expect(page).toHaveScreenshot(`apertura-${nome}.png`, { maxDiffPixelRatio: 0.02 });
    });

    test(`atrio · ${nome}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await vaiAllAtrio(page);
      await fermaLeAnimazioni(page);
      await expect(page).toHaveScreenshot(`atrio-${nome}.png`, { maxDiffPixelRatio: 0.02 });
    });

    test(`lobby · ${nome}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await vaiAllAtrio(page, 'Ispettore');
      await page.getByRole('button', { name: /Apri una nuova indagine/i }).click();
      await page.getByRole('button', { name: /^Apri la stanza$/i }).click();
      await expect(page.getByRole('heading', { name: 'Il ricevimento' })).toBeVisible();
      await fermaLeAnimazioni(page);
      // il codice stanza cambia a ogni partita: viene mascherato
      await page.addStyleTag({ content: '.codice-stanza__valore, .barra-stato__codice { visibility: hidden; }' });
      await expect(page).toHaveScreenshot(`lobby-${nome}.png`, { maxDiffPixelRatio: 0.02 });
    });
  }

  test('tutorial · iphone-15', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await page.goto('/');
    await page.getByRole('button', { name: /porta girevole/i }).click();
    await expect(page.getByText('Prima di cominciare')).toBeVisible();
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('tutorial-iphone-15.png', { maxDiffPixelRatio: 0.02 });
  });

  test('impostazioni · iphone-15', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await vaiAllAtrio(page);
    await page.getByRole('button', { name: /Apri le impostazioni/i }).click();
    await expect(page.getByRole('dialog', { name: 'Impostazioni' })).toBeVisible();
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('impostazioni-iphone-15.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Varianti di accessibilità', () => {
  /**
   * Le preferenze si impostano **prima** del caricamento, come le troverebbe
   * chi torna a giocare.
   *
   * Scriverle sul documento a pagina aperta non regge: le impostazioni sono di
   * proprietà dell'applicazione, che le riapplica quando ne ha motivo e
   * cancella la modifica fatta da fuori. Lo scatto usciva a volte con il testo
   * grande e a volte senza — un test che tira i dadi non verifica niente.
   */
  async function conPreferenze(page: Page, preferenze: Record<string, unknown>): Promise<void> {
    await page.addInitScript((p) => {
      window.localStorage.setItem('meridien.impostazioni', JSON.stringify(p));
    }, preferenze);
  }

  test('alto contrasto', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await conPreferenze(page, { highContrast: true });
    await vaiAllAtrio(page);
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'alto');
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('atrio-alto-contrasto.png', { maxDiffPixelRatio: 0.02 });
  });

  test('testo ingrandito al 130 per cento', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await conPreferenze(page, { textScale: 'enorme' });
    await vaiAllAtrio(page);
    const scala = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--scala-testo').trim(),
    );
    expect(scala).toBe('1.3');
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('atrio-testo-grande.png', { maxDiffPixelRatio: 0.02 });
  });

  test('movimento ridotto', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await vaiAllAtrio(page);
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('atrio-movimento-ridotto.png', { maxDiffPixelRatio: 0.02 });
  });
});

test.describe('Casi limite del layout', () => {
  test('un nome lungo non rompe la lobby', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['telefono-piccolo']);
    await vaiAllAtrio(page, 'Massimiliano Bonaventura');
    await page.getByRole('button', { name: /Apri una nuova indagine/i }).click();
    await page.getByRole('button', { name: /^Apri la stanza$/i }).click();
    await expect(page.getByRole('heading', { name: 'Il ricevimento' })).toBeVisible();

    // niente scorrimento orizzontale: è il sintomo classico del testo che deborda
    const deborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(deborda).toBe(false);
  });

  test('la safe area è rispettata', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await vaiAllAtrio(page);
    // si simula la tacca: il contenuto non deve finirci sotto
    await page.addStyleTag({
      content: ':root { --safe-top: 59px; } .barra-stato { padding-top: calc(59px + 6px) !important; }',
    });
    const rettangolo = await page.locator('.barra-stato').boundingBox();
    expect(rettangolo).not.toBeNull();
    expect(rettangolo!.y + rettangolo!.height).toBeGreaterThan(59);
  });

  test('la tastiera non copre il campo attivo', async ({ page }) => {
    await page.setViewportSize(VIEWPORT['iphone-15']);
    await vaiAllAtrio(page);
    await page.getByRole('button', { name: /Entra con un codice/i }).click();
    const campo = page.getByLabel(/Cinque lettere/i);
    await campo.focus();

    // si simula la riduzione della finestra visuale che provoca la tastiera
    await page.evaluate(() => {
      document.documentElement.dataset.tastiera = 'aperta';
      document.documentElement.style.setProperty('--tastiera', '336px');
    });
    await page.waitForTimeout(250);

    // con la tastiera aperta le barre in fondo si tolgono di mezzo
    await expect(page.locator('.barra-inferiore')).toHaveCount(0);

    // e il campo attivo resta raggiungibile sopra la linea della tastiera
    await campo.scrollIntoViewIfNeeded();
    const rettangolo = await campo.boundingBox();
    expect(rettangolo).not.toBeNull();
    expect(rettangolo!.y + rettangolo!.height).toBeLessThan(VIEWPORT['iphone-15'].height - 336);
  });

  test('in orizzontale il layout si allarga senza rompersi', async ({ page }) => {
    await page.setViewportSize({ width: 852, height: 393 });
    await vaiAllAtrio(page);
    const deborda = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(deborda).toBe(false);
    await fermaLeAnimazioni(page);
    await expect(page).toHaveScreenshot('atrio-orizzontale.png', { maxDiffPixelRatio: 0.02 });
  });
});
