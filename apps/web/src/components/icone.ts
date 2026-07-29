/**
 * Dai nomi dei contenuti ai simboli del foglio sprite.
 *
 * Gli indizi sono scritti da chi scrive i casi, e nominano l'oggetto per quello
 * che è: «cambiale», «passepartout», «ricevuta della farmacia». Il set grafico
 * invece è piccolo di proposito — trenta segni coerenti valgono più di ottanta
 * disegnini diversi — e ragiona per categorie: un documento, una chiave, un
 * tempo, un suono, un'immagine.
 *
 * Questa tabella tiene insieme le due cose. Ogni nome usato nei casi trova un
 * simbolo; quello che non è in tabella ricade sul sigillo invece di lasciare un
 * buco nella carta. Un test verifica che nessun indizio resti senza segno.
 */

const ALIAS: Record<string, string> = {
  // ── documenti e scritti ───────────────────────────────────────────────────
  agenda: 'taccuino',
  assegno: 'taccuino',
  biglietto: 'taccuino',
  brevetto: 'sigillo',
  cambiale: 'taccuino',
  carta: 'taccuino',
  conto: 'taccuino',
  contratto: 'sigillo',
  lettera: 'busta',
  libretto: 'taccuino',
  libro: 'taccuino',
  locandina: 'quadro',
  polizza: 'sigillo',
  prontuario: 'taccuino',
  quaderno: 'taccuino',
  registro: 'taccuino',
  ricevuta: 'taccuino',
  'ricevuta-farmacia': 'boccetta',
  telegramma: 'busta',
  tessera: 'sigillo',
  timbro: 'sigillo',
  verbale: 'sigillo',
  incisione: 'sigillo',
  'macchina-scrivere': 'taccuino',

  // ── chiavi, serrature, passaggi ───────────────────────────────────────────
  chiavi: 'chiave',
  passepartout: 'chiave',
  serratura: 'chiave',
  gancio: 'chiave',
  armadietto: 'chiave',
  ascensore: 'porta',
  finestra: 'porta',
  ringhiera: 'scala',
  scaletta: 'scala',
  leva: 'scala',

  // ── tempo ─────────────────────────────────────────────────────────────────
  sveglia: 'orologio',

  // ── suono e voce ──────────────────────────────────────────────────────────
  registratore: 'bobina',
  provini: 'bobina',
  negativo: 'bobina',
  cuffia: 'bobina',
  voce: 'telefono',
  voci: 'telefono',
  centralino: 'telefono',
  orchestra: 'spartito',

  // ── immagini ──────────────────────────────────────────────────────────────
  'fotografia-vecchia': 'fotografia',
  polaroid: 'fotografia',
  'macchina-foto': 'macchina-fotografica',
  lastra: 'quadro',

  // ── vetro, liquidi, fiamme ────────────────────────────────────────────────
  bicchieri: 'bicchiere',
  calice: 'bicchiere',
  olio: 'boccetta',
  cera: 'candela',
  lampada: 'candela',
  bacinella: 'bicchiere',

  // ── stoffe e indumenti ────────────────────────────────────────────────────
  panno: 'guanto',
  fazzoletto: 'guanto',
  telo: 'guanto',
  cerata: 'ombrello',
  astuccio: 'valigia',
  lavanderia: 'guanto',
  scarpe: 'scarpa',

  // ── mare e tempesta ───────────────────────────────────────────────────────
  cima: 'filo',
  zavorra: 'faro',
  vassoio: 'campanello',
};

/** Il segno di riserva: neutro, mai fuori tono. */
const RIPIEGO = 'sigillo';

/** I simboli davvero presenti nel foglio sprite. */
export const ICONE_DISPONIBILI: readonly string[] = [
  'bicchiere',
  'bobina',
  'boccetta',
  'busta',
  'campanello',
  'candela',
  'chiave',
  'faro',
  'filo',
  'fotografia',
  'fulmine',
  'guanto',
  'impronta',
  'lente',
  'macchina-fotografica',
  'maschera',
  'ombrello',
  'orologio',
  'porta',
  'quadro',
  'scacchiera',
  'scala',
  'scarpa',
  'sigillo',
  'spartito',
  'taccuino',
  'telefono',
  'tempesta',
  'valigia',
];

const PRESENTI = new Set(ICONE_DISPONIBILI);

/** Il simbolo da disegnare per un nome scritto nei contenuti. */
export function simbolo(nome: string): string {
  if (PRESENTI.has(nome)) return nome;
  const alias = ALIAS[nome];
  if (alias && PRESENTI.has(alias)) return alias;
  return RIPIEGO;
}
