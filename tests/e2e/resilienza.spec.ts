import { expect, test } from '@playwright/test';
import {
  apriGiocatore,
  attraversaApertura,
  avanza,
  chiudi,
  comincia,
  creaStanza,
  dichiaratiPronto,
  entraInStanza,
  erroriDiConsole,
  type Giocatore,
} from './tavolo.js';

/**
 * Cosa succede quando la rete cade, la pagina si ricarica, l'host se ne va.
 * Sono i momenti in cui un multiplayer finto si rivela.
 */

async function tavoloAvviato(browser: Parameters<typeof apriGiocatore>[0], quanti = 4): Promise<Giocatore[]> {
  const giocatori: Giocatore[] = [];
  for (let i = 0; i < quanti; i += 1) giocatori.push(await apriGiocatore(browser, `Ospite${i + 1}`));
  const [host, ...ospiti] = giocatori as [Giocatore, ...Giocatore[]];
  const codice = await creaStanza(host);
  for (const g of ospiti) await entraInStanza(g, codice);
  await host.pagina.getByLabel('Tempo').selectOption('assenti');
  for (const g of giocatori) await dichiaratiPronto(g);
  await comincia(host);
  return giocatori;
}

test('un refresh della pagina riprende la partita dallo stesso punto', async ({ browser }) => {
  test.slow();
  const giocatori = await tavoloAvviato(browser);
  const [host, secondo] = giocatori as [Giocatore, Giocatore, ...Giocatore[]];

  await avanza(host);
  await expect(host.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 15_000 });

  const ruoloPrima = await secondo.pagina
    .getByRole('button', { name: /Indizi/i })
    .click()
    .then(async () => {
      const n = await secondo.pagina.locator('.carta-indizio').count();
      await secondo.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();
      return n;
    });

  // ricaricare non deve far perdere né il ruolo né la mano
  await secondo.pagina.reload();
  await expect(secondo.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 20_000 });

  await secondo.pagina.getByRole('button', { name: /Indizi/i }).click();
  expect(await secondo.pagina.locator('.carta-indizio').count()).toBe(ruoloPrima);
  await secondo.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

  expect(erroriDiConsole(giocatori)).toEqual([]);
  await chiudi(giocatori);
});

test('una disconnessione temporanea si ricuce da sola', async ({ browser }) => {
  test.slow();
  const giocatori = await tavoloAvviato(browser);
  const [host, secondo] = giocatori as [Giocatore, Giocatore, ...Giocatore[]];
  await avanza(host);
  await expect(host.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 15_000 });

  /*
   * Rete giù. `setOffline` da solo non basta: Chromium non chiude i WebSocket
   * già stabiliti, quindi il client non se ne accorgerebbe. Si chiude anche il
   * socket dal lato pagina, che è quello che succede davvero quando un
   * telefono passa dal Wi-Fi alla rete cellulare.
   */
  await secondo.contesto.setOffline(true);
  await secondo.pagina.evaluate(() => {
    // il client espone la propria connessione per la diagnostica
    const w = window as unknown as { __meridienChiudiSocket?: () => void };
    w.__meridienChiudiSocket?.();
  });
  await expect(secondo.pagina.locator('.barra-stato .spia')).not.toHaveClass(/spia--aperta/, {
    timeout: 30_000,
  });
  // gli altri lo vedono assente
  /*
   * La scheda «Sala», non una dichiarazione qualsiasi: i testi dei casi
   * nominano spesso la sala da ballo, e un selettore per sola etichetta finiva
   * per pescare due elementi a seconda di quali carte erano in gioco.
   */
  await host.pagina.locator('.partita__scheda').filter({ hasText: 'Sala' }).click();
  await expect(host.pagina.locator('.lista-giocatori li.assente')).toHaveCount(1, { timeout: 25_000 });
  await host.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

  // rete su: il client si riconnette senza intervento dell'utente
  await secondo.contesto.setOffline(false);
  await expect(secondo.pagina.locator('.spia--aperta')).toBeVisible({ timeout: 30_000 });
  await expect(secondo.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 20_000 });

  await chiudi(giocatori);
});

test("la partita cambia padrone di casa quando l'host esce", async ({ browser }) => {
  test.slow();
  const giocatori = await tavoloAvviato(browser);
  const [host, secondo, terzo] = giocatori as [Giocatore, Giocatore, Giocatore, ...Giocatore[]];
  await avanza(host);
  await expect(secondo.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 15_000 });

  await host.contesto.close();

  // qualcuno riceve la corona: lo dice la cronaca della serata
  await expect(secondo.pagina.locator('.cronaca__riga')).toContainText(/prende in mano l.indagine/i, {
    timeout: 25_000,
  });

  /*
   * «Avanti» ce l'hanno tutti: è un voto, non un privilegio. Il segno del
   * padrone di casa è il controllo che ferma l'orologio, e quello deve essere
   * comparso a una persona sola.
   */
  const conLOrologio = await Promise.all(
    [secondo, terzo].map((g) => g.pagina.getByRole('button', { name: /Sospendi l.indagine/i }).isVisible()),
  );
  expect(conLOrologio.filter(Boolean)).toHaveLength(1);

  await chiudi(giocatori.slice(1));
});

test('la rivincita riporta in lobby e riparte pulita', async ({ browser }) => {
  test.slow();
  const giocatori = await tavoloAvviato(browser);
  const [host] = giocatori as [Giocatore, ...Giocatore[]];

  // dal briefing al verdetto
  for (let i = 0; i < 4; i += 1) {
    await avanza(host);
    await host.pagina.waitForTimeout(400);
  }

  for (const g of giocatori) {
    await expect(g.pagina.getByRole('heading', { name: 'La tua accusa' })).toBeVisible({ timeout: 20_000 });
    await g.pagina.locator('.sospettato').first().click();
    await g.pagina.locator('section[aria-label="Perché"] .opzione').first().click();
    await g.pagina.locator('section[aria-label="Come"] .opzione').first().click();
    await g.pagina.getByRole('button', { name: /Firmo l.accusa/i }).click();
  }
  for (const g of giocatori) {
    await expect(g.pagina.getByRole('heading', { name: 'A chi credete' })).toBeVisible({ timeout: 20_000 });
    await g.pagina.locator('.tesi__voce').first().click();
    await g.pagina.getByRole('button', { name: /Sostengo questa tesi/i }).click();
  }
  for (const g of giocatori) {
    await expect(g.pagina.getByText('La verità del Méridien')).toBeVisible({ timeout: 20_000 });
  }
  await avanza(host);
  await expect(host.pagina.getByRole('heading', { name: 'Il tabellone' })).toBeVisible({ timeout: 20_000 });

  // rivincita
  await host.pagina.getByRole('button', { name: /Nuovo caso/i }).click();
  for (const g of giocatori) {
    await expect(g.pagina.getByRole('heading', { name: 'Il ricevimento' })).toBeVisible({ timeout: 20_000 });
    // nessuna traccia della partita precedente
    await expect(g.pagina.getByText('La verità del Méridien')).toHaveCount(0);
  }

  // e si può ricominciare davvero
  await host.pagina.getByLabel('Tempo').selectOption('assenti');
  for (const g of giocatori) await dichiaratiPronto(g);
  await comincia(host);
  for (const g of giocatori) {
    await expect(g.pagina.getByText('Riservato · non mostrare a nessuno')).toBeVisible({ timeout: 20_000 });
  }

  expect(erroriDiConsole(giocatori)).toEqual([]);
  await chiudi(giocatori);
});

test('con la rete lenta il gioco resta usabile', async ({ browser }) => {
  const ospite = await apriGiocatore(browser, 'Lento');
  const cliente = await ospite.pagina.context().newCDPSession(ospite.pagina);
  await cliente.send('Network.enable');
  await cliente.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 400,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (200 * 1024) / 8,
  });

  await ospite.pagina.reload();
  await attraversaApertura(ospite.pagina, 'Lento');
  const codice = await creaStanza(ospite);
  expect(codice).toHaveLength(5);

  expect(erroriDiConsole([ospite])).toEqual([]);
  await chiudi([ospite]);
});
