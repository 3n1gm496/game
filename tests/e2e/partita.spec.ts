import { expect, test } from '@playwright/test';
import {
  apriGiocatore,
  avanza,
  chiudi,
  comincia,
  creaStanza,
  dichiaratiPronto,
  cerca,
  entraInStanza,
  erroriDiConsole,
  type Giocatore,
} from './tavolo.js';

/**
 * Partite reali. Ogni giocatore è un contesto browser separato che parla con
 * il server sulla build di produzione.
 */

test.describe('Stanza e sincronizzazione', () => {
  test('due browser distinti entrano nella stessa stanza e si vedono', async ({ browser }) => {
    const anna = await apriGiocatore(browser, 'Anna');
    const bruno = await apriGiocatore(browser, 'Bruno');

    const codice = await creaStanza(anna);
    await entraInStanza(bruno, codice);

    // ciascuno vede l'altro nell'elenco degli ospiti, senza ricaricare
    await expect(anna.pagina.locator('.lista-giocatori__nome', { hasText: 'Bruno' })).toBeVisible({
      timeout: 10_000,
    });
    await expect(bruno.pagina.locator('.lista-giocatori__nome', { hasText: 'Anna' })).toBeVisible({
      timeout: 10_000,
    });

    // lo stato «pronto» si propaga davvero via server
    await dichiaratiPronto(bruno);
    await expect(anna.pagina.getByText('1/2 pronti')).toBeVisible({ timeout: 10_000 });

    expect(erroriDiConsole([anna, bruno])).toEqual([]);
    await chiudi([anna, bruno]);
  });

  test('il codice inesistente non apre nessuna porta', async ({ browser }) => {
    const ospite = await apriGiocatore(browser, 'Ospite');
    await ospite.pagina.getByRole('button', { name: /Entra con un codice/i }).click();
    await ospite.pagina.getByLabel(/Cinque lettere/i).fill('ZZZZZ');
    await ospite.pagina.getByRole('button', { name: /^Entra$/ }).click();
    await expect(ospite.pagina.locator('.avviso')).toHaveText(/Nessuna stanza con questo codice/i);
    await chiudi([ospite]);
  });

  test('solo chi ha aperto la stanza cambia le impostazioni', async ({ browser }) => {
    const host = await apriGiocatore(browser, 'Host');
    const altro = await apriGiocatore(browser, 'Altro');
    const codice = await creaStanza(host);
    await entraInStanza(altro, codice);

    await expect(host.pagina.getByLabel('Modalità')).toBeEnabled();
    await expect(altro.pagina.getByLabel('Modalità')).toBeDisabled();
    await expect(altro.pagina.getByText(/Le impostazioni le decide chi ha aperto la stanza/i)).toBeVisible();

    await chiudi([host, altro]);
  });
});

test.describe('Partita completa', () => {
  test('quattro giocatori attraversano una partita intera fino ai punteggi', async ({ browser }) => {
    test.slow();
    const nomi = ['Vittoria', 'Corrado', 'Delia', 'Renzo'];
    const giocatori: Giocatore[] = [];
    for (const nome of nomi) giocatori.push(await apriGiocatore(browser, nome));
    const [host, ...ospiti] = giocatori as [Giocatore, ...Giocatore[]];

    const codice = await creaStanza(host);
    for (const g of ospiti) await entraInStanza(g, codice);

    // timer disattivati: la partita avanza per consenso, il test è deterministico
    await host.pagina.getByLabel('Tempo').selectOption('assenti');
    for (const g of giocatori) await dichiaratiPronto(g);
    await comincia(host);

    // ── dossier privati: ognuno il suo, tutti diversi ──────────────────────
    const ruoli: string[] = [];
    for (const g of giocatori) {
      await expect(g.pagina.getByText('Riservato · non mostrare a nessuno')).toBeVisible({ timeout: 15_000 });
      const nome = await g.pagina.locator('.dossier__intestazione h1').innerText();
      ruoli.push(nome);
      await expect(g.pagina.getByRole('button', { name: /La tua sera/i })).toBeVisible();
    }
    expect(new Set(ruoli).size).toBe(4);

    // basta il padrone di casa: il suo voto fa avanzare la fase per tutti
    await avanza(host);

    // ── Atto I ─────────────────────────────────────────────────────────────
    await expect(host.pagina.locator('.occhiello')).toContainText('Atto I ·', { timeout: 15_000 });
    for (const g of giocatori) {
      await g.pagina.getByRole('button', { name: /Verità|Omissione|Bugia/ }).first().click();
    }
    // la dichiarazione di uno compare in bacheca per tutti
    await ospiti[0]!.pagina.getByRole('button', { name: /^Bacheca/ }).click();
    await expect(ospiti[0]!.pagina.getByText('Dichiarazione').first()).toBeVisible({ timeout: 10_000 });
    await ospiti[0]!.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

    // ── esplorazione: un indizio trovato è davvero in mano ─────────────────
    expect(await cerca(host)).toBeGreaterThan(0);

    // condividere lo rende visibile agli altri: è la prova che passa dal server
    await host.pagina.getByRole('button', { name: /^Indizi/ }).click();
    const carte = host.pagina.locator('.carta-indizio');
    const titoloCarta = await carte.first().locator('strong').innerText();
    await carte.first().getByRole('button', { name: 'Condividi' }).click();
    await host.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

    await ospiti[1]!.pagina.getByRole('button', { name: /^Bacheca/ }).click();
    await expect(
      ospiti[1]!.pagina.locator('.bacheca__voce strong', { hasText: titoloCarta }),
    ).toBeVisible({ timeout: 10_000 });
    await ospiti[1]!.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

    await avanza(host);

    // ── Atto II ────────────────────────────────────────────────────────────
    await expect(host.pagina.locator('.occhiello')).toContainText('Atto II ·', { timeout: 15_000 });

    // un testimone risponde, e la risposta arriva solo a chi ha chiesto
    await host.pagina.getByRole('button', { name: /Testimoni/i }).click();
    await host.pagina.getByLabel('La tua domanda').fill('Chi è salito dopo le undici?');
    await host.pagina.getByRole('button', { name: /^Chiedi$/ }).click();
    await expect(host.pagina.locator('.testimoni__conversazione li').first()).toBeVisible({ timeout: 15_000 });
    await host.pagina.getByRole('button', { name: 'Chiudi', exact: true }).click();

    await avanza(host);

    // ── Atto III ───────────────────────────────────────────────────────────
    await expect(host.pagina.locator('.occhiello')).toContainText('Atto III ·', { timeout: 15_000 });
    await avanza(host);

    // ── Accusa ─────────────────────────────────────────────────────────────
    for (const g of giocatori) {
      await expect(g.pagina.getByRole('heading', { name: 'La tua accusa' })).toBeVisible({ timeout: 20_000 });
      await g.pagina.locator('.sospettato').first().click();
      await g.pagina.locator('.opzione').first().click();
      await g.pagina.locator('section[aria-label="Come"] .opzione').first().click();
      await g.pagina.getByRole('button', { name: /Firmo l.accusa/i }).click();
    }

    // ── Verdetto ───────────────────────────────────────────────────────────
    for (const g of giocatori) {
      await expect(g.pagina.getByRole('heading', { name: 'A chi credete' })).toBeVisible({ timeout: 20_000 });
      await g.pagina.locator('.tesi__voce').first().click();
      await g.pagina.getByRole('button', { name: /Sostengo questa tesi/i }).click();
    }

    // ── Epilogo: la verità viene rivelata ──────────────────────────────────
    for (const g of giocatori) {
      await expect(g.pagina.getByText('La verità del Méridien')).toBeVisible({ timeout: 20_000 });
      await expect(g.pagina.locator('.ricostruzione li').first()).toBeVisible();
    }

    await avanza(host);

    // ── Punteggi ───────────────────────────────────────────────────────────
    for (const g of giocatori) {
      await expect(g.pagina.getByRole('heading', { name: 'Il tabellone' })).toBeVisible({ timeout: 20_000 });
      expect(await g.pagina.locator('.classifica > li').count()).toBe(4);
    }

    expect(erroriDiConsole(giocatori)).toEqual([]);
    await chiudi(giocatori);
  });

  test('otto giocatori entrano, ricevono ruoli distinti e il nono viene respinto', async ({ browser }) => {
    test.slow();
    const giocatori: Giocatore[] = [];
    for (let i = 0; i < 8; i += 1) giocatori.push(await apriGiocatore(browser, `Ospite${i + 1}`));
    const [host, ...ospiti] = giocatori as [Giocatore, ...Giocatore[]];

    const codice = await creaStanza(host);
    for (const g of ospiti) await entraInStanza(g, codice);
    await expect(host.pagina.getByText('0/8 pronti')).toBeVisible({ timeout: 15_000 });

    // il nono trova la stanza al completo
    const nono = await apriGiocatore(browser, 'Nono');
    await nono.pagina.getByRole('button', { name: /Entra con un codice/i }).click();
    await nono.pagina.getByLabel(/Cinque lettere/i).fill(codice);
    await nono.pagina.getByRole('button', { name: /^Entra$/ }).click();
    await expect(nono.pagina.locator('.avviso')).toHaveText(/al completo/i, { timeout: 10_000 });

    await host.pagina.getByLabel('Tempo').selectOption('assenti');
    for (const g of giocatori) await dichiaratiPronto(g);
    await comincia(host);

    const ruoli: string[] = [];
    for (const g of giocatori) {
      await expect(g.pagina.getByText('Riservato · non mostrare a nessuno')).toBeVisible({ timeout: 20_000 });
      ruoli.push(await g.pagina.locator('.dossier__intestazione h1').innerText());
    }
    expect(new Set(ruoli).size).toBe(8);

    expect(erroriDiConsole(giocatori)).toEqual([]);
    await chiudi([...giocatori, nono]);
  });
});
