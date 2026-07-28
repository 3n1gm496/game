#!/usr/bin/env node
/**
 * `pnpm ios:build`
 *
 * Prepara e verifica tutto ciò che si può verificare senza la toolchain Apple,
 * poi stampa i comandi esatti da eseguire su macOS. Su una macchina con Xcode
 * prosegue fino alla compilazione dell'archivio.
 *
 * Non tocca certificati né profili: quelli restano fuori dal repository.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const RADICE = process.cwd();
const suMac = process.platform === 'darwin';

function ha(comando) {
  const r = spawnSync(comando, ['--version'], { stdio: 'ignore' });
  return r.status === 0 || r.status === 1;
}

function passo(testo) {
  console.log(`\n  ${testo}`);
}

console.log('\n  MÉRIDIEN · preparazione della build iOS\n');

// 1 · build web
passo('1. Build del client…');
try {
  execFileSync('pnpm', ['build:web'], { stdio: 'inherit', cwd: RADICE });
} catch {
  console.error('\n  La build del client è fallita. Correggi e riprova.\n');
  process.exit(1);
}

const dist = path.join(RADICE, 'apps', 'web', 'dist');
if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('\n  apps/web/dist/index.html non esiste. Build incompleta.\n');
  process.exit(1);
}
console.log('     apps/web/dist pronto.');

// 2 · verifiche indipendenti dalla piattaforma
passo('2. Controlli preliminari…');
const richiesti = [
  'capacitor.config.ts',
  'apps/ios/plugin/Package.swift',
  'apps/ios/plugin/ios/Sources/MeridienPlugin/MeridienLocalModelPlugin.swift',
  'apps/ios/plugin/ios/Sources/MeridienPlugin/ModelBridge.swift',
  'apps/ios/plugin/ios/Sources/MeridienPlugin/MeridienHapticsPlugin.swift',
  'apps/web/public/manifest.webmanifest',
];
let mancanti = 0;
for (const f of richiesti) {
  const ok = existsSync(path.join(RADICE, f));
  console.log(`     ${ok ? '✔' : '✘'} ${f}`);
  if (!ok) mancanti += 1;
}
if (mancanti > 0) {
  console.error(`\n  ${mancanti} file mancanti.\n`);
  process.exit(1);
}

execFileSync('node', ['scripts/check-secrets.mjs'], { stdio: 'inherit', cwd: RADICE });

// 3 · sincronizzazione, se possibile
if (!suMac) {
  console.log('\n  ─────────────────────────────────────────────────────────────');
  console.log('   Questa non è una macchina macOS: la toolchain iOS non c’è.');
  console.log('   Tutto il resto è pronto. Su un Mac con Xcode esegui:');
  console.log('');
  console.log('     pnpm install');
  console.log('     pnpm ios:sync                  # build web + npx cap sync ios');
  console.log('     npx cap open ios               # apre il progetto in Xcode');
  console.log('');
  console.log('   Poi, per un archivio firmato:');
  console.log('     xcodebuild -workspace ios/App/App.xcworkspace \\');
  console.log('       -scheme App -configuration Release \\');
  console.log('       -archivePath build/Meridien.xcarchive archive');
  console.log('');
  console.log('   La procedura completa, firma e TestFlight, è in IOS_SETUP.md.');
  console.log('  ─────────────────────────────────────────────────────────────\n');
  process.exit(0);
}

passo('3. Sincronizzazione Capacitor…');
if (!ha('xcodebuild')) {
  console.error('     Xcode non è installato. Installa Xcode e riprova.');
  process.exit(1);
}
try {
  execFileSync('npx', ['cap', 'sync', 'ios'], { stdio: 'inherit', cwd: RADICE });
} catch {
  console.error('\n  `cap sync ios` non è riuscito. Se il progetto non esiste ancora:');
  console.error('    npx cap add ios\n');
  process.exit(1);
}

passo('4. Compilazione…');
try {
  execFileSync(
    'xcodebuild',
    [
      '-workspace', 'ios/App/App.xcworkspace',
      '-scheme', 'App',
      '-configuration', 'Release',
      '-destination', 'generic/platform=iOS',
      '-archivePath', 'build/Meridien.xcarchive',
      'archive',
    ],
    { stdio: 'inherit', cwd: RADICE },
  );
  console.log('\n  Archivio in build/Meridien.xcarchive');
  console.log('  Esportazione e caricamento su TestFlight: vedi IOS_SETUP.md § 6.\n');
} catch {
  console.error('\n  La compilazione è fallita. Con ogni probabilità manca la firma:');
  console.error('  apri il progetto in Xcode e imposta Team e Bundle Identifier.\n');
  process.exit(1);
}
