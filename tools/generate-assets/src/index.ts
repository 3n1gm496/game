import { generateTokens } from './tokens.js';
import { generateLogo } from './logo.js';
import { generateScenes } from './scenes.js';
import { generatePortraits } from './portraits.js';
import { generateIcons } from './icons.js';
import { generateUi } from './ui.js';
import { generatePwa } from './pwa.js';
import { generateManifest } from './manifest.js';
import { writtenFiles } from './util.js';

/**
 * `pnpm generate:assets`
 *
 * Costruisce tutti gli asset grafici del gioco a partire dai token condivisi.
 * Ogni file prodotto viene committato: l'applicazione non genera nulla a
 * runtime e non dipende da nessuna risorsa remota.
 *
 * Opzioni:
 *   --only=<passo>   esegue un solo passo (token, logo, scene, ritratti,
 *                    icone, interfaccia, pwa, manifesto)
 */

type Passo = 'token' | 'logo' | 'scene' | 'ritratti' | 'icone' | 'interfaccia' | 'pwa' | 'manifesto';

const ORDINE: Passo[] = ['token', 'logo', 'scene', 'ritratti', 'icone', 'interfaccia', 'pwa', 'manifesto'];

const richiesto = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] as Passo | undefined;
if (richiesto && !ORDINE.includes(richiesto)) {
  console.error(`Passo sconosciuto: ${richiesto}. Ammessi: ${ORDINE.join(', ')}`);
  process.exit(1);
}

const passi = richiesto ? [richiesto] : ORDINE;
const esegue = (p: Passo): boolean => passi.includes(p);

console.log('MÉRIDIEN · generazione asset\n');

const inizio = Date.now();

if (esegue('token')) {
  await generateTokens();
  console.log('  token      → apps/web/src/styles/tokens.css');
}

if (esegue('logo')) {
  await generateLogo();
  console.log('  logo       → logo.svg, logo-animato.svg');
}

const scene = esegue('scene') || esegue('manifesto') ? await generateScenes() : [];
if (esegue('scene')) {
  console.log(`  scene      → ${scene.length} ambienti a livelli`);
}

const ritratti = esegue('ritratti') || esegue('manifesto') ? await generatePortraits() : [];
if (esegue('ritratti')) {
  const file = ritratti.reduce((n, r) => n + r.file.length, 0);
  console.log(`  ritratti   → ${ritratti.length} personaggi, ${file} file`);
}

const icone = esegue('icone') || esegue('manifesto') ? await generateIcons() : [];
if (esegue('icone')) {
  console.log(`  icone      → ${icone.length} icone + foglio sprite`);
}

if (esegue('interfaccia')) {
  await generateUi();
  console.log('  interfaccia→ carte, bacheca, timeline, verdetto, sipario, pianta, grana');
}

if (esegue('pwa')) {
  const { pngGenerati } = await generatePwa();
  console.log(
    `  pwa        → icone e schermate di avvio${pngGenerati ? ' (PNG inclusi)' : ' (solo SVG: sharp non disponibile)'}`,
  );
}

if (esegue('manifesto')) {
  const manifest = await generateManifest({ scene, ritratti, icone });
  console.log(`  manifesto  → ${manifest.totale.file} file, ${(manifest.totale.byte / 1024).toFixed(0)} kB`);
}

const perCategoria = new Map<string, { file: number; byte: number }>();
for (const f of writtenFiles()) {
  const voce = perCategoria.get(f.category) ?? { file: 0, byte: 0 };
  voce.file += 1;
  voce.byte += f.bytes;
  perCategoria.set(f.category, voce);
}

console.log('\n  Riepilogo');
let totaleFile = 0;
let totaleByte = 0;
for (const [categoria, voce] of [...perCategoria].sort()) {
  totaleFile += voce.file;
  totaleByte += voce.byte;
  console.log(`    ${categoria.padEnd(12)} ${String(voce.file).padStart(4)} file  ${(voce.byte / 1024).toFixed(0).padStart(6)} kB`);
}
console.log(`    ${'TOTALE'.padEnd(12)} ${String(totaleFile).padStart(4)} file  ${(totaleByte / 1024).toFixed(0).padStart(6)} kB`);
console.log(`\n  Completato in ${((Date.now() - inizio) / 1000).toFixed(1)}s.`);
