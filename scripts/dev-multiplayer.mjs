#!/usr/bin/env node
/**
 * `pnpm dev:multiplayer`
 *
 * Avvia server e client insieme, senza alcun servizio cloud.
 * Stampa gli indirizzi da aprire su due dispositivi diversi della stessa rete:
 * è il modo più rapido per provare il multiplayer vero.
 */
import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';

const ESC = String.fromCharCode(27);
const colore = (codice, testo) => `${ESC}[${codice}m${testo}${ESC}[0m`;

const processi = [];
let chiusura = false;

function avvia(nome, comando, argomenti, codiceColore) {
  const p = spawn(comando, argomenti, { stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  const prefisso = `${colore(codiceColore, nome.padEnd(7))} │ `;
  const stampa = (flusso) => (dati) => {
    for (const riga of String(dati).split('\n')) {
      if (riga.trim()) flusso.write(`${prefisso}${riga}\n`);
    }
  };
  p.stdout.on('data', stampa(process.stdout));
  p.stderr.on('data', stampa(process.stderr));
  p.on('exit', (codice) => {
    if (chiusura) return;
    console.error(`\n${prefisso}terminato con codice ${codice}. Chiudo tutto.`);
    ferma(codice ?? 1);
  });
  processi.push(p);
  return p;
}

function ferma(codice) {
  chiusura = true;
  for (const p of processi) {
    try {
      p.kill('SIGTERM');
    } catch {
      /* già terminato */
    }
  }
  setTimeout(() => process.exit(codice), 300);
}

process.on('SIGINT', () => ferma(0));
process.on('SIGTERM', () => ferma(0));

function indirizzoLocale() {
  for (const schede of Object.values(networkInterfaces())) {
    for (const scheda of schede ?? []) {
      if (scheda.family === 'IPv4' && !scheda.internal) return scheda.address;
    }
  }
  return 'localhost';
}

console.log('\n  MÉRIDIEN · sviluppo multigiocatore locale\n');

avvia('server', 'pnpm', ['--filter', '@meridien/server', 'dev'], '36');
avvia('client', 'pnpm', ['--filter', '@meridien/web', 'dev'], '33');

const ip = indirizzoLocale();
setTimeout(() => {
  console.log('\n  ─────────────────────────────────────────────');
  console.log('   Su questo computer   http://localhost:5173');
  console.log(`   Da un altro device   http://${ip}:5173`);
  console.log('   Server e WebSocket   http://localhost:8787');
  console.log('   Pannello diagnostico http://localhost:5173/?diag=1');
  console.log('  ─────────────────────────────────────────────\n');
  console.log('  Apri due schede o due dispositivi, crea una stanza da uno');
  console.log("  ed entra con il codice dall'altro. Ctrl+C per fermare.\n");
}, 2500);
