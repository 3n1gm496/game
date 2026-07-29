#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `pnpm render:scenes [--ambiente=hall] [--campioni=128] [--larghezza=1600]`
 *
 * Guida Blender ambiente per ambiente, poi porta i risultati dove il gioco li
 * cerca: `apps/web/public/assets/scene/<chiave>/`.
 *
 * Va lanciato **dopo** `pnpm generate:assets`, che scrive `scene.json` con
 * titoli, atmosfera, luci ed etichette. Qui si sostituiscono soltanto i livelli
 * — da SVG disegnati a PNG renderizzati — e le coordinate degli hotspot, che
 * ora arrivano dalla proiezione dei punti 3D invece che da percentuali scritte
 * a mano. Le etichette restano quelle dei contenuti: la posizione la detta la
 * scena, il nome lo detta chi scrive il caso.
 *
 * Blender non è una dipendenza del gioco: senza, restano gli SVG e tutto
 * funziona. È una dipendenza di chi produce gli asset.
 */

const QUI = path.dirname(fileURLToPath(import.meta.url));
const RADICE = path.resolve(QUI, '../../..');
const SCRIPT = path.join(RADICE, 'tools/render-scenes/blender/render.py');
const DESTINAZIONE = path.join(RADICE, 'apps/web/public/assets/scene');
const LAVORO = path.join(RADICE, '.render-scenes');

const AMBIENTI = [
  'hall', 'sala-ballo', 'suite', 'terrazza', 'piscina', 'cucina', 'corridoio',
  'camerino', 'passaggio', 'quadro', 'bar', 'palco', 'registrazione', 'facciata',
];

const arg = (nome, predefinito) =>
  process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1] ?? predefinito;

const BLENDER = arg('blender', process.env.BLENDER ?? 'blender42');
const CAMPIONI = arg('campioni', '128');
const LARGHEZZA = arg('larghezza', '1600');
const SOLO = arg('ambiente', null);
const SOLO_PROIEZIONE = process.argv.includes('--solo-proiezione');

function esegui(ambiente) {
  return new Promise((risolvi, rifiuta) => {
    const argomenti = [
      '-b', '--python', SCRIPT, '--',
      `--ambiente=${ambiente}`,
      `--uscita=${LAVORO}`,
      `--campioni=${CAMPIONI}`,
      `--larghezza=${LARGHEZZA}`,
    ];
    if (SOLO_PROIEZIONE) argomenti.push('--solo-proiezione');

    const processo = spawn(BLENDER, argomenti, { stdio: ['ignore', 'pipe', 'pipe'] });
    let interessante = '';
    const raccogli = (d) => {
      for (const riga of d.toString().split('\n')) {
        if (/^(COSTRUITO|RESO|SCRITTO|HOTSPOT_FUORI_QUADRO|AMBIENTE_SCONOSCIUTO)/.test(riga)) {
          interessante += `    ${riga.trim()}\n`;
        }
        if (/Error|Traceback/.test(riga)) interessante += `    ${riga.trim()}\n`;
      }
    };
    processo.stdout.on('data', raccogli);
    processo.stderr.on('data', raccogli);
    processo.on('error', rifiuta);
    processo.on('close', (codice) => {
      process.stdout.write(interessante);
      if (codice === 0) risolvi();
      else rifiuta(new Error(`Blender è uscito con codice ${codice} su ${ambiente}`));
    });
  });
}

/** Porta livelli e hotspot dove il gioco li cerca, senza toccare il resto. */
async function integra(ambiente) {
  const origine = path.join(LAVORO, ambiente);
  const destinazione = path.join(DESTINAZIONE, ambiente);
  if (!existsSync(origine)) return { livelli: 0 };

  await mkdir(destinazione, { recursive: true });
  const file = (await readdir(origine)).filter((f) => /^layer-\d+\.png$/.test(f)).sort();
  for (const f of file) await copyFile(path.join(origine, f), path.join(destinazione, f));

  const percorsoManifesto = path.join(destinazione, 'scene.json');
  if (!existsSync(percorsoManifesto)) return { livelli: file.length };
  const manifesto = JSON.parse(await readFile(percorsoManifesto, 'utf8'));

  // i fattori di parallasse restano quelli della direzione artistica
  const parallasse = [0.15, 0.4, 1.0, 1.6];
  manifesto.layer = file.map((f, i) => ({
    file: f,
    profondita: i,
    parallasse: parallasse[i] ?? 1.0,
    ruolo: ['fondo', 'medio', 'principale', 'primo-piano'][i] ?? 'principale',
  }));

  const percorsoHotspot = path.join(origine, 'hotspot.json');
  if (existsSync(percorsoHotspot)) {
    const proiezioni = JSON.parse(await readFile(percorsoHotspot, 'utf8'));
    manifesto.hotspot = manifesto.hotspot.map((h) => {
      const p = proiezioni[h.chiave];
      if (!p || !p.davanti) return h;
      // il punto proiettato è il centro; l'area resta quella dichiarata
      return { ...h, x: Math.round(p.x - h.larghezza / 2), y: Math.round(p.y - h.altezza / 2) };
    });
  }

  await writeFile(percorsoManifesto, `${JSON.stringify(manifesto, null, 2)}\n`, 'utf8');
  return { livelli: file.length };
}

async function main() {
  console.log('\nMÉRIDIEN · render degli ambienti\n');
  console.log(`  blender     ${BLENDER}`);
  console.log(`  campioni    ${CAMPIONI}`);
  console.log(`  larghezza   ${LARGHEZZA}px\n`);

  const elenco = SOLO ? [SOLO] : AMBIENTI;
  await mkdir(LAVORO, { recursive: true });

  const inizio = Date.now();
  let fatti = 0;
  for (const ambiente of elenco) {
    console.log(`  ${ambiente}`);
    try {
      await esegui(ambiente);
      if (!SOLO_PROIEZIONE) {
        const { livelli } = await integra(ambiente);
        console.log(`    integrati ${livelli} livelli`);
      }
      fatti += 1;
    } catch (errore) {
      console.error(`    ✘ ${errore instanceof Error ? errore.message : errore}`);
    }
  }

  const minuti = ((Date.now() - inizio) / 60000).toFixed(1);
  console.log(`\n  ${fatti}/${elenco.length} ambienti in ${minuti} minuti.\n`);
  if (fatti < elenco.length) process.exit(1);
}

main().catch((errore) => {
  console.error('\n  Il render non è riuscito:', errore instanceof Error ? errore.message : errore);
  console.error('  Blender è installato? Serve la build ufficiale, che include il denoiser.\n');
  process.exit(1);
});
