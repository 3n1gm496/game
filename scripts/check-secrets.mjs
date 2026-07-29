#!/usr/bin/env node
/**
 * `node scripts/check-secrets.mjs`
 *
 * Cerca chiavi, token e materiale sensibile nei file versionati e nel bundle
 * del client. Il client non deve mai contenere una chiave: se una finisse nel
 * bundle per un errore di import, questo controllo la trova.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const RADICE = process.cwd();

const SOSPETTI = [
  { nome: 'chiave Anthropic', re: /sk-ant-[A-Za-z0-9_-]{16,}/ },
  { nome: 'chiave OpenAI', re: /sk-(?!ant)[A-Za-z0-9]{20,}/ },
  { nome: 'token Bearer', re: /Bearer\s+[A-Za-z0-9._-]{24,}/ },
  { nome: 'chiave privata', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { nome: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  { nome: 'token GitHub', re: /gh[pousr]_[A-Za-z0-9]{30,}/ },
  { nome: 'ANTHROPIC_API_KEY valorizzata', re: /ANTHROPIC_API_KEY\s*[:=]\s*['"][^'"\s]{8,}/ },
  { nome: 'certificato o profilo di firma', re: /\.(p12|mobileprovision|cer)\b/ },
];

const ESCLUSI = new Set([
  'node_modules',
  '.git',
  'coverage',
  'playwright-report',
  'test-results',
  '.pnpm-store',
]);
const ESTENSIONI = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.html', '.css', '.map',
  '.svg', '.yml', '.yaml', '.swift', '.md', '.webmanifest',
]);

/**
 * File che non devono esistere nel repository, qualunque cosa contengano.
 *
 * Il controllo sul contenuto non basta: un `.p12` è binario e non rientra
 * nelle estensioni di testo, quindi passerebbe inosservato proprio il caso
 * peggiore — un certificato di firma versionato per sbaglio.
 */
const NOMI_VIETATI = /\.(p12|mobileprovision|cer|pem|keystore|jks)$/i;

async function* file(dir) {
  let voci;
  try {
    voci = await readdir(dir);
  } catch {
    return;
  }
  for (const nome of voci) {
    if (ESCLUSI.has(nome)) continue;
    const completo = path.join(dir, nome);
    const info = await stat(completo);
    if (info.isDirectory()) yield* file(completo);
    else yield completo;
  }
}

let trovati = 0;
let esaminati = 0;

for await (const percorso of file(RADICE)) {
  const base = path.basename(percorso);

  if (NOMI_VIETATI.test(base)) {
    trovati += 1;
    console.error(`  ✘ ${path.relative(RADICE, percorso)} — certificato o chiave versionata`);
    continue;
  }

  if (!ESTENSIONI.has(path.extname(base))) continue;
  // il file di controllo contiene per forza i pattern
  if (base === 'check-secrets.mjs') continue;
  // .env locale non è versionato; .env.example non contiene valori
  if (base.startsWith('.env') && !base.endsWith('.example')) continue;

  /*
   * Nominare un file di firma non è possederlo.
   *
   * La documentazione spiega come si firma, e il workflow iOS scrive davvero
   * un `.p12` — ma lo ricava da un segreto di GitHub sul runner, in una
   * cartella temporanea, e lo cancella subito dopo. Nel repository non finisce
   * nulla: a sorvegliare quello c'è `NOMI_VIETATI`, che guarda i file veri.
   * Le altre regole — chiavi, token, materiale privato — restano attive anche
   * qui, ed è quello che conta se qualcuno incollasse una chiave nel workflow.
   */
  const nominaSoltanto =
    path.extname(percorso) === '.md' || percorso.includes(path.join('.github', 'workflows'));

  esaminati += 1;
  const contenuto = await readFile(percorso, 'utf8');
  for (const sospetto of SOSPETTI) {
    if (nominaSoltanto && sospetto.nome.startsWith('certificato')) continue;
    const trovato = sospetto.re.exec(contenuto);
    if (!trovato) continue;
    trovati += 1;
    const riga = contenuto.slice(0, trovato.index).split('\n').length;
    console.error(`  ✘ ${path.relative(RADICE, percorso)}:${riga} — ${sospetto.nome}`);
  }
}

console.log(`\n  ${esaminati} file esaminati.`);
if (trovati > 0) {
  console.error(`  ${trovati} possibili segreti nel repository o nel bundle.\n`);
  process.exit(1);
}
console.log('  Nessun segreto esposto.\n');
