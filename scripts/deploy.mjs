#!/usr/bin/env node
/**
 * `pnpm deploy:preview` · `pnpm deploy:production`
 *
 * Costruisce l'artefatto completo (client + server) e lo pubblica se
 * l'ambiente ha le credenziali. Quando non le ha, si ferma e dice esattamente
 * quali variabili mancano e quale comando eseguire: il lavoro non si blocca,
 * resta solo il passo che richiede un segreto.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

const ambiente = process.argv[2] === 'production' ? 'production' : 'preview';
const RADICE = process.cwd();

console.log(`\n  MÉRIDIEN · deploy (${ambiente})\n`);

function esegui(comando, argomenti) {
  execFileSync(comando, argomenti, { stdio: 'inherit', cwd: RADICE });
}

// 1 · controlli di qualità, sempre
console.log('  1. Controlli…');
esegui('pnpm', ['lint']);
esegui('pnpm', ['typecheck']);
esegui('pnpm', ['test']);
esegui('pnpm', ['validate:cases']);
esegui('node', ['scripts/check-secrets.mjs']);

// 2 · build
console.log('\n  2. Build…');
esegui('pnpm', ['build']);

const dist = path.join(RADICE, 'apps', 'web', 'dist');
if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('\n  Build del client incompleta.\n');
  process.exit(1);
}
const serverDist = path.join(RADICE, 'apps', 'server', 'dist', 'index.js');
if (!existsSync(serverDist)) {
  console.error('\n  Build del server incompleta.\n');
  process.exit(1);
}
console.log(`     client  ${(statSync(path.join(dist, 'index.html')).size / 1024).toFixed(1)} kB di guscio`);
console.log('     server  apps/server/dist/index.js');

// 3 · pubblicazione
const provider = process.env.MERIDIEN_DEPLOY_PROVIDER ?? '';
const segretiRichiesti = {
  fly: ['FLY_API_TOKEN'],
  render: ['RENDER_API_KEY', 'RENDER_SERVICE_ID'],
  docker: ['MERIDIEN_REGISTRY', 'MERIDIEN_REGISTRY_USER', 'MERIDIEN_REGISTRY_PASSWORD'],
};

console.log('\n  3. Pubblicazione…');

if (!provider) {
  console.log('     Nessun provider configurato (MERIDIEN_DEPLOY_PROVIDER).');
  console.log('\n  ─────────────────────────────────────────────────────────────');
  console.log('   L’artefatto è pronto e verificato. Per pubblicarlo scegli');
  console.log('   un provider e fornisci i suoi segreti:');
  console.log('');
  console.log('     MERIDIEN_DEPLOY_PROVIDER=fly     FLY_API_TOKEN=…');
  console.log('     MERIDIEN_DEPLOY_PROVIDER=render  RENDER_API_KEY=…  RENDER_SERVICE_ID=…');
  console.log('     MERIDIEN_DEPLOY_PROVIDER=docker  MERIDIEN_REGISTRY=…  utente e password');
  console.log('');
  console.log('   Oppure, senza alcun servizio esterno:');
  console.log('     pnpm build && pnpm start        →  http://localhost:8787');
  console.log('');
  console.log('   Dettagli in DEPLOYMENT.md.');
  console.log('  ─────────────────────────────────────────────────────────────\n');
  process.exit(0);
}

const richiesti = segretiRichiesti[provider];
if (!richiesti) {
  console.error(`     Provider sconosciuto: ${provider}. Ammessi: ${Object.keys(segretiRichiesti).join(', ')}\n`);
  process.exit(1);
}
const mancanti = richiesti.filter((v) => !process.env[v]);
if (mancanti.length > 0) {
  console.error(`\n  Mancano queste variabili d'ambiente: ${mancanti.join(', ')}`);
  console.error('  Impostale e riesegui. Nessun altro passo è bloccato.\n');
  process.exit(1);
}

const tag = ambiente === 'production' ? 'latest' : 'preview';

switch (provider) {
  case 'fly':
    esegui('npx', ['--yes', 'flyctl', 'deploy', '--config', 'fly.toml', '--build-arg', `AMBIENTE=${ambiente}`]);
    break;
  case 'render':
    esegui('curl', [
      '--fail',
      '-X', 'POST',
      '-H', `Authorization: Bearer ${process.env.RENDER_API_KEY}`,
      `https://api.render.com/v1/services/${process.env.RENDER_SERVICE_ID}/deploys`,
    ]);
    break;
  case 'docker': {
    const immagine = `${process.env.MERIDIEN_REGISTRY}/meridien:${tag}`;
    esegui('docker', ['build', '-t', immagine, '.']);
    esegui('docker', ['login', String(process.env.MERIDIEN_REGISTRY), '-u', String(process.env.MERIDIEN_REGISTRY_USER), '--password-stdin']);
    esegui('docker', ['push', immagine]);
    break;
  }
  default:
    break;
}

console.log(`\n  Pubblicato su ${provider} (${ambiente}).\n`);
