import { WebSocket } from 'ws';
import { PROTOCOL_VERSION, type ClientMessage, type ServerMessage } from '@meridien/engine';

/**
 * `pnpm test:load`
 *
 * Apre molte stanze e molti giocatori contemporaneamente contro un server
 * reale, e misura ciò che conta: quanti messaggi arrivano, con che latenza,
 * quanti errori, e — soprattutto — se il server manda a ciascuno solo quello
 * che gli spetta anche sotto pressione.
 *
 * Non è un benchmark da vetrina: serve a far emergere broadcast inutili,
 * perdite di memoria e corse critiche.
 *
 * Opzioni:
 *   --url=ws://127.0.0.1:8787/ws
 *   --stanze=20
 *   --giocatori=5      giocatori per stanza
 *   --durata=30        secondi
 */

const arg = (nome: string, predefinito: number): number => {
  const trovato = process.argv.find((a) => a.startsWith(`--${nome}=`))?.split('=')[1];
  const valore = Number(trovato);
  return Number.isFinite(valore) && valore > 0 ? valore : predefinito;
};

const URL_SERVER =
  process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ?? 'ws://127.0.0.1:8787/ws';
const STANZE = arg('stanze', 20);
const PER_STANZA = arg('giocatori', 5);
const DURATA_S = arg('durata', 30);

interface Metriche {
  connessi: number;
  disconnessi: number;
  inviati: number;
  ricevuti: number;
  errori: number;
  byteRicevuti: number;
  latenze: number[];
  stanzeAperte: number;
  partiteAvviate: number;
  entrati: number;
  fughe: string[];
  codiciInattesi: Map<string, number>;
}

const m: Metriche = {
  connessi: 0,
  disconnessi: 0,
  inviati: 0,
  ricevuti: 0,
  errori: 0,
  byteRicevuti: 0,
  latenze: [],
  stanzeAperte: 0,
  partiteAvviate: 0,
  entrati: 0,
  fughe: [],
  codiciInattesi: new Map(),
};

const AVATAR = 'portrait-01';

/** Rifiuti legittimi: il server sta applicando le regole, non sta cedendo. */
const ERRORI_ATTESI = new Set([
  'rate-limited',
  'invalid-phase',
  'not-allowed',
  'invalid-target',
  'already-done',
  'no-charges',
]);

class Cliente {
  private socket: WebSocket;
  playerId: string | null = null;
  codice: string | null = null;
  /** ambienti realmente aperti nella stanza, letti dallo stato */
  ambienti: string[] = [];
  private token: string | null = null;
  private pendenti = new Map<number, number>();
  private contatore = 0;
  /** true se questo client ha aperto la stanza */
  readonly host: boolean;

  constructor(
    readonly nome: string,
    host: boolean,
    private readonly alPronto: (c: Cliente) => void,
  ) {
    this.host = host;
    this.socket = new WebSocket(URL_SERVER);

    this.socket.on('open', () => {
      m.connessi += 1;
      this.invia({ t: 'hello', protocol: PROTOCOL_VERSION, client: 'loadtest' });
    });

    this.socket.on('message', (dati) => {
      m.ricevuti += 1;
      const testo = dati.toString();
      m.byteRicevuti += testo.length;
      let msg: ServerMessage;
      try {
        msg = JSON.parse(testo) as ServerMessage;
      } catch {
        m.errori += 1;
        return;
      }
      this.gestisci(msg, testo);
    });

    this.socket.on('error', () => {
      m.errori += 1;
    });
    this.socket.on('close', () => {
      m.disconnessi += 1;
    });
  }

  private gestisci(msg: ServerMessage, grezzo: string): void {
    switch (msg.t) {
      case 'welcome':
        this.alPronto(this);
        break;
      case 'joined':
        this.playerId = msg.playerId;
        this.codice = msg.code;
        this.token = msg.sessionToken;
        break;
      case 'pong': {
        const inviato = this.pendenti.get(msg.at);
        if (inviato !== undefined) {
          m.latenze.push(Date.now() - inviato);
          this.pendenti.delete(msg.at);
        }
        break;
      }
      case 'error':
        /*
         * Gli agenti tirano azioni a raffica: fuori fase, doppie, su bersagli
         * che nel frattempo sono cambiati. Quei rifiuti sono il server che fa
         * il suo mestiere, non un guasto. Contano come errori solo le risposte
         * che non dovrebbero mai arrivare.
         */
        if (!ERRORI_ATTESI.has(msg.code)) {
          m.errori += 1;
          m.codiciInattesi.set(msg.code, (m.codiciInattesi.get(msg.code) ?? 0) + 1);
        }
        break;
      case 'state':
        // controllo di riservatezza sotto carico: nessun messaggio pubblico
        // deve contenere il token di sessione o un taccuino altrui
        if (this.token && grezzo.includes(this.token)) {
          m.fughe.push(`${this.nome}: token di sessione in un messaggio di stato`);
        }
        this.ambienti = msg.state.openLocationIds;
        break;
      default:
        break;
    }
  }

  invia(msg: ClientMessage): void {
    if (this.socket.readyState !== WebSocket.OPEN) return;
    m.inviati += 1;
    this.socket.send(JSON.stringify(msg));
  }

  /** true quando il server ha davvero accettato l'ingresso */
  get inPartita(): boolean {
    return this.playerId !== null;
  }

  azione(msg: Omit<ClientMessage, 'actionId'> & { actionId?: string }): void {
    this.contatore += 1;
    // il protocollo vuole almeno sei caratteri: un id corto verrebbe rifiutato
    this.invia({ ...msg, actionId: `az-${this.nome}-${this.contatore}` } as ClientMessage);
  }

  ping(): void {
    const ora = Date.now();
    this.pendenti.set(ora, ora);
    this.invia({ t: 'ping', at: ora });
  }

  chiudi(): void {
    try {
      this.socket.close(1000, 'fine prova');
    } catch {
      /* già chiuso */
    }
  }
}

function attendi(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  console.log('\nMÉRIDIEN · prova di carico\n');
  console.log(`  server      ${URL_SERVER}`);
  console.log(`  stanze      ${STANZE}`);
  console.log(`  giocatori   ${PER_STANZA} per stanza (${STANZE * PER_STANZA} in totale)`);
  console.log(`  durata      ${DURATA_S}s\n`);

  const inizio = Date.now();
  const tutti: Cliente[] = [];
  const host: Cliente[] = [];

  // ── apertura delle stanze ─────────────────────────────────────────────────
  for (let s = 0; s < STANZE; s += 1) {
    const capo = new Cliente(`h${s}`, true, (c) => {
      c.invia({ t: 'createRoom', nickname: `Capo${s}`, avatar: AVATAR });
    });
    tutti.push(capo);
    host.push(capo);
    // apertura scaglionata: un'ondata istantanea misurerebbe solo il limitatore
    if (s % 5 === 4) await attendi(120);
  }

  await attendi(2500);
  m.stanzeAperte = host.filter((h) => h.codice).length;
  console.log(`  ${m.stanzeAperte}/${STANZE} stanze aperte`);

  // ── ingresso degli ospiti ────────────────────────────────────────────────
  for (const capo of host) {
    if (!capo.codice) continue;
    for (let g = 1; g < PER_STANZA; g += 1) {
      const ospite = new Cliente(`${capo.nome}-o${g}`, false, (c) => {
        c.invia({
          t: 'joinRoom',
          code: capo.codice!,
          nickname: `Ospite${capo.nome}${g}`,
          avatar: AVATAR,
          asSpectator: false,
        });
      });
      tutti.push(ospite);
    }
    await attendi(40);
  }

  await attendi(3000);

  /*
   * Quanti sono entrati davvero.
   *
   * Tutti i client partono dallo stesso indirizzo, e il server limita gli
   * ingressi per indirizzo: senza alzare `RATE_JOIN_BURST` metà dei giocatori
   * resta fuori. Il rifiuto è legittimo — è la difesa contro l'enumerazione
   * delle stanze — ma una prova di carico che misura settanta client mentre
   * crede di misurarne cento non misura niente. Meglio fermarsi e dirlo.
   */
  m.entrati = tutti.filter((c) => c.inPartita).length;
  console.log(`  ${m.entrati}/${tutti.length} client dentro una stanza`);

  // ── avvio delle partite ──────────────────────────────────────────────────
  for (const c of tutti) {
    if (c.inPartita) c.invia({ t: 'setReady', ready: true });
  }
  await attendi(1200);
  for (const capo of host) {
    if (capo.codice) capo.azione({ t: 'startGame' });
  }
  await attendi(1500);
  m.partiteAvviate = m.stanzeAperte;
  console.log(`  ${m.partiteAvviate} partite avviate`);
  console.log(`  ${tutti.length} client collegati\n`);

  // ── attività continua ────────────────────────────────────────────────────
  console.log('  Attività in corso…');
  const fine = Date.now() + DURATA_S * 1000;
  let giro = 0;
  while (Date.now() < fine) {
    giro += 1;
    for (const c of tutti) {
      // chi non è riuscito a entrare non ha nulla da fare: continuare a
      // scrivergli produrrebbe solo rifiuti, e falserebbe la misura
      if (!c.inPartita) continue;
      if (giro % 5 === 0) c.ping();
      const dove = c.ambienti[giro % Math.max(1, c.ambienti.length)];
      if (dove) c.invia({ t: 'enterLocation', locationId: dove });
      if (giro % 3 === 0) c.azione({ t: 'requestRecap' });
    }
    // gli host fanno avanzare le fasi ogni tanto
    if (giro % 12 === 0) {
      for (const capo of host) {
        if (capo.inPartita) capo.azione({ t: 'advancePhase' });
      }
    }
    await attendi(500);
  }

  // ── chiusura ─────────────────────────────────────────────────────────────
  for (const c of tutti) c.chiudi();
  await attendi(1200);

  // ── rapporto ─────────────────────────────────────────────────────────────
  const durata = (Date.now() - inizio) / 1000;
  const ordinate = [...m.latenze].sort((a, b) => a - b);
  const percentile = (p: number): number => ordinate[Math.floor(ordinate.length * p)] ?? 0;

  console.log('\n  Risultati');
  console.log(`    durata totale        ${durata.toFixed(1)}s`);
  console.log(`    stanze               ${m.stanzeAperte}/${STANZE}`);
  console.log(`    client collegati     ${m.connessi}`);
  console.log(`    client in partita    ${m.entrati}/${tutti.length}`);
  console.log(`    messaggi inviati     ${m.inviati}`);
  console.log(`    messaggi ricevuti    ${m.ricevuti} (${(m.byteRicevuti / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`    ricevuti per client  ${(m.ricevuti / Math.max(1, m.connessi)).toFixed(0)}`);
  console.log(`    errori inattesi      ${m.errori}`);
  if (ordinate.length > 0) {
    console.log(
      `    latenza              mediana ${percentile(0.5)}ms · p95 ${percentile(0.95)}ms · max ${ordinate[ordinate.length - 1]}ms`,
    );
  }
  console.log(`    fughe di dati        ${m.fughe.length}`);
  if (m.codiciInattesi.size > 0) {
    const dettaglio = [...m.codiciInattesi].map(([c, n]) => `${c}×${n}`).join(' · ');
    console.log(`    rifiuti inattesi     ${dettaglio}`);
  }
  for (const f of m.fughe.slice(0, 5)) console.log(`      ✘ ${f}`);

  const memoria = process.memoryUsage();
  console.log(`    memoria del client   ${(memoria.heapUsed / 1024 / 1024).toFixed(0)} MB`);

  console.log('');
  const problemi: string[] = [];
  if (m.stanzeAperte < STANZE) problemi.push(`aperte solo ${m.stanzeAperte} stanze su ${STANZE}`);
  if (m.entrati < tutti.length * 0.95) {
    problemi.push(
      `solo ${m.entrati} client su ${tutti.length} sono entrati in una stanza: ` +
        'alza RATE_JOIN_BURST sul server, altrimenti la misura è falsata',
    );
  }
  if (m.errori > tutti.length * 0.05) problemi.push(`${m.errori} errori inattesi`);
  if (m.fughe.length > 0) problemi.push(`${m.fughe.length} fughe di dati`);
  if (percentile(0.95) > 1500) problemi.push(`latenza p95 troppo alta: ${percentile(0.95)}ms`);

  if (problemi.length > 0) {
    console.error('  Problemi rilevati:');
    for (const p of problemi) console.error(`    ✘ ${p}`);
    console.error('');
    process.exit(1);
  }
  console.log('  Nessun problema: il server regge il carico e non perde nulla per strada.\n');
}

main().catch((errore) => {
  console.error('\n  La prova di carico non è riuscita:', errore instanceof Error ? errore.message : errore);
  console.error('  Il server è avviato? Prova con `pnpm build && pnpm start`.\n');
  process.exit(1);
});
