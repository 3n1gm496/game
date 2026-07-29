#!/usr/bin/env node
/**
 * Build del server.
 *
 * I pacchetti del monorepo (`@meridien/engine`, `@meridien/content`,
 * `@meridien/ai`) esportano sorgenti TypeScript: è quello che rende immediati
 * lo sviluppo, i test e gli strumenti, che girano tutti su `tsx`. A runtime,
 * però, Node non sa cosa farsene di un `.ts`.
 *
 * La soluzione è impacchettare: esbuild produce un unico file JavaScript con
 * dentro il motore, i contenuti e il Regista, lasciando fuori solo le
 * dipendenze native (`ws`). Il risultato si avvia con `node dist/index.js`,
 * senza `node_modules` del workspace, e l'immagine Docker resta minuscola.
 */
import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const radice = path.dirname(fileURLToPath(import.meta.url));
await rm(path.join(radice, 'dist'), { recursive: true, force: true });

const risultato = await build({
  entryPoints: [path.join(radice, 'src/index.ts')],
  outfile: path.join(radice, 'dist/index.js'),
  platform: 'node',
  target: 'node20',
  format: 'esm',
  bundle: true,
  sourcemap: true,
  minify: false,
  // `ws` ha binding opzionali nativi: resta fuori dal pacchetto
  external: ['ws'],
  banner: {
    js: [
      "import { createRequire as __creaRequire } from 'node:module';",
      'const require = __creaRequire(import.meta.url);',
    ].join('\n'),
  },
  logLevel: 'warning',
  metafile: true,
});

const byte = Object.values(risultato.metafile.outputs).reduce((s, o) => s + o.bytes, 0);
console.log(`  server → apps/server/dist/index.js (${(byte / 1024).toFixed(0)} kB)`);
