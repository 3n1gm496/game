#!/usr/bin/env node
/**
 * `node scripts/check-docs.mjs`
 *
 * Verifica che la documentazione descriva il progetto che esiste davvero:
 * che ogni comando citato esista in un package.json, che ogni file nominato
 * sia sul disco, e che non siano rimasti segnaposti.
 *
 * È il controllo che impedisce alla documentazione di invecchiare in silenzio.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const RADICE = process.cwd();

const DOCUMENTI = [
  'README.md',
  'GAME_SPEC.md',
  'ARCHITECTURE.md',
  'ART_DIRECTION.md',
  'NARRATIVE_BIBLE.md',
  'AI_ARCHITECTURE.md',
  'SECURITY.md',
  'PRIVACY.md',
  'ACCESSIBILITY.md',
  'DEPLOYMENT.md',
  'IOS_SETUP.md',
  'CONTRIBUTING.md',
  'CHANGELOG.md',
  'ACCEPTANCE_TESTS.md',
  'TASKS.md',
  'docs/CONTENT_AUTHORING.md',
];

const problemi = [];
const nota = (testo) => problemi.push(testo);

// ── 1 · i documenti esistono ────────────────────────────────────────────────
for (const doc of DOCUMENTI) {
  if (!existsSync(path.join(RADICE, doc))) nota(`documento mancante: ${doc}`);
}

// ── 2 · gli script citati esistono ──────────────────────────────────────────
const scriptDisponibili = new Set();

async function raccogliScript(dir, profondita = 0) {
  if (profondita > 3) return;
  let voci;
  try {
    voci = await readdir(dir);
  } catch {
    return;
  }
  for (const nome of voci) {
    if (nome === 'node_modules' || nome === '.git' || nome === 'dist') continue;
    const completo = path.join(dir, nome);
    const info = await stat(completo);
    if (info.isDirectory()) {
      await raccogliScript(completo, profondita + 1);
    } else if (nome === 'package.json') {
      try {
        const pkg = JSON.parse(await readFile(completo, 'utf8'));
        for (const s of Object.keys(pkg.scripts ?? {})) scriptDisponibili.add(s);
      } catch {
        nota(`package.json illeggibile: ${path.relative(RADICE, completo)}`);
      }
    }
  }
}
await raccogliScript(RADICE);

// ── 3 · analisi dei documenti ───────────────────────────────────────────────
const SEGNAPOSTI = [/\bTODO\b/, /\bFIXME\b/, /lorem ipsum/i, /\bda scrivere\b/i, /\bcoming soon\b/i];

let comandiControllati = 0;
let percorsiControllati = 0;

for (const doc of DOCUMENTI) {
  const percorsoDoc = path.join(RADICE, doc);
  if (!existsSync(percorsoDoc)) continue;
  const testo = await readFile(percorsoDoc, 'utf8');

  /*
   * Per la caccia ai segnaposti si guarda solo la prosa: un documento che
   * scrive `TODO` fra apici inversi sta nominando il termine, non lasciandone
   * uno. CONTRIBUTING.md, che li vieta, deve poterli elencare.
   */
  const prosa = testo.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');

  for (const re of SEGNAPOSTI) {
    const trovato = re.exec(prosa);
    if (trovato) {
      const riga = prosa.slice(0, trovato.index).split('\n').length;
      nota(`${doc}:${riga} — segnaposto «${trovato[0]}»`);
    }
  }

  // comandi `pnpm <nome>` citati nel testo
  for (const m of testo.matchAll(/`pnpm ([a-z][a-z0-9:-]*)/g)) {
    const comando = m[1];
    if (['install', 'add', 'exec', 'view', 'licenses', 'audit', 'run', 'dlx'].includes(comando)) continue;
    // `pnpm deploy:*` e simili indicano una famiglia di comandi, non uno solo
    if (comando.endsWith(':')) continue;
    comandiControllati += 1;
    if (!scriptDisponibili.has(comando)) {
      const riga = testo.slice(0, m.index).split('\n').length;
      nota(`${doc}:${riga} — comando inesistente: pnpm ${comando}`);
    }
  }

  // percorsi di file citati fra apici inversi
  for (const m of testo.matchAll(/`((?:apps|packages|tools|tests|scripts|docs)\/[A-Za-z0-9_./-]+)`/g)) {
    const percorso = m[1];
    // i percorsi con glob o con parti variabili non si controllano
    if (/[*<>]/.test(percorso)) continue;
    percorsiControllati += 1;
    if (!existsSync(path.join(RADICE, percorso))) {
      const riga = testo.slice(0, m.index).split('\n').length;
      nota(`${doc}:${riga} — percorso inesistente: ${percorso}`);
    }
  }

  // collegamenti relativi ad altri documenti
  for (const m of testo.matchAll(/\]\(([A-Za-z0-9_./-]+\.md)\)/g)) {
    const destinazione = m[1];
    if (!existsSync(path.join(RADICE, destinazione))) {
      const riga = testo.slice(0, m.index).split('\n').length;
      nota(`${doc}:${riga} — collegamento rotto: ${destinazione}`);
    }
  }
}

// ── 4 · il catalogo pubblico combacia con i contenuti reali ─────────────────
try {
  const pubblico = await readFile(path.join(RADICE, 'packages/content/src/public.ts'), 'utf8');
  for (const id of ['case.suite404', 'case.orologio', 'case.valzer']) {
    if (!pubblico.includes(id)) nota(`public.ts non dichiara ${id}`);
    const cartella = id.replace('case.', '');
    const atteso = path.join(RADICE, 'packages/content/src/cases', cartella, 'index.ts');
    if (!existsSync(atteso)) nota(`manca il caso ${id} in packages/content/src/cases/${cartella}/`);
  }
} catch {
  nota('packages/content/src/public.ts non leggibile');
}

// ── 5 · .env.example non contiene valori ────────────────────────────────────
try {
  const env = await readFile(path.join(RADICE, '.env.example'), 'utf8');
  for (const riga of env.split('\n')) {
    const m = /^([A-Z_]+)=(.+)$/.exec(riga.trim());
    if (!m) continue;
    const [, chiave, valore] = m;
    if (/KEY|TOKEN|SECRET|PASSWORD/.test(chiave) && valore.trim().length > 0) {
      nota(`.env.example contiene un valore per ${chiave}: deve restare vuoto`);
    }
  }
} catch {
  nota('.env.example mancante');
}

// ── esito ───────────────────────────────────────────────────────────────────
console.log('\n  MÉRIDIEN · coerenza della documentazione\n');
console.log(`  ${DOCUMENTI.length} documenti · ${comandiControllati} comandi · ${percorsiControllati} percorsi`);

if (problemi.length > 0) {
  console.error(`\n  ${problemi.length} incoerenze:`);
  for (const p of problemi) console.error(`    ✘ ${p}`);
  console.error('');
  process.exit(1);
}
console.log('  La documentazione corrisponde al progetto.\n');
