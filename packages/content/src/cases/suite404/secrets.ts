import type { BeatDef, ObjectiveDef, OptionDef, SceneEventDef, SecretDef } from '@meridien/engine';

/**
 * Segreti, obiettivi, beat, opzioni di accusa ed eventi scenici.
 * Tutto quanto è condiviso dalle tre varianti: è la difesa contro il metagioco.
 * Otto segreti e otto obiettivi, uno per ruolo, senza ripetizioni.
 */

export const SECRETS: SecretDef[] = [
  {
    id: 'sec.debito-gioco',
    title: 'Il conto aperto',
    text: 'Deve al Méridien più di quanto guadagni in tre anni. La cambiale in cassaforte non è l’unica, ed è la sola che porti una scadenza vicina.',
    suspicion: 2,
  },
  {
    id: 'sec.matrimonio-annullato',
    title: 'Il matrimonio annullato',
    text: 'Un matrimonio celebrato a vent’anni e annullato in fretta a Trieste. Il documento esiste ancora, e non è più nel cassetto in cui era stato lasciato.',
    suspicion: 1,
  },
  {
    id: 'sec.certificato-compiacente',
    title: 'Il certificato di comodo',
    text: 'Ha firmato un certificato che non avrebbe dovuto firmare, per fare un favore a chi non lo meritava. Da allora dorme male e compra rimedi in farmacia.',
    suspicion: 2,
  },
  {
    id: 'sec.articolo-pronto',
    title: 'L’articolo già scritto',
    text: 'Il pezzo sui conti dell’albergo è finito da una settimana: mancano solo due righe e una fotografia. Il direttore lo tiene in cassetto e aspetta un pretesto.',
    suspicion: 1,
  },
  {
    id: 'sec.gioielli-rifatti',
    title: 'I gioielli rifatti',
    text: 'La parure che porta al collo è una copia in strass: gli originali sono stati venduti a Nizza nel 1964 per pagare una imposta di successione.',
    suspicion: 1,
  },
  {
    id: 'sec.foto-vendute',
    title: 'Le fotografie vendute',
    text: 'Due volte ha venduto a un settimanale immagini scattate al Méridien che aveva promesso di distruggere. Una riguardava la famiglia del proprietario.',
    suspicion: 2,
  },
  {
    id: 'sec.gara-aggiustata',
    title: 'La gara aggiustata',
    text: 'Il secondo posto di settembre era stato deciso il giorno prima, in un ufficio, con una stretta di mano. Non ha ancora restituito quel denaro.',
    suspicion: 2,
  },
  {
    id: 'sec.procura-falsa',
    title: 'La firma imitata',
    text: 'Sui contratti dell’ultimo anno la firma del proprietario è stata imitata bene, ma imitata. Bastano due atti per capirlo, e uno è in cassaforte.',
    suspicion: 2,
  },
];

export const OBJECTIVES: ObjectiveDef[] = [
  {
    id: 'goal.silenzio',
    title: 'Arrivare in fondo senza rumore',
    text: 'Il tuo segreto non deve finire appuntato sulla bacheca prima del verdetto. Che se ne parli è già una perdita.',
    kind: 'hide-secret',
    param: '1',
    points: 20,
  },
  {
    id: 'goal.tre-carte',
    title: 'Mettere sul tavolo',
    text: 'Condividi almeno tre indizi in bacheca. Chi non mette niente non ottiene niente, e stanotte si vede.',
    kind: 'share-count',
    param: '3',
    points: 15,
  },
  {
    id: 'goal.due-domande',
    title: 'Domandare in pubblico',
    text: 'Poni almeno tre domande davanti a tutti. Le cose dette a bassa voce, stanotte, non contano.',
    kind: 'ask-questions',
    param: '3',
    points: 15,
  },
  {
    id: 'goal.scudo',
    title: 'Tenere qualcuno fuori',
    text: 'La persona che ti sta a cuore non deve ricevere accuse al verdetto finale. Nemmeno una.',
    kind: 'protect-target',
    param: 'role.medico',
    points: 25,
  },
  {
    id: 'goal.indice',
    title: 'Puntare il dito',
    text: 'Fai in modo che almeno due invitati accusino la persona che hai in mente. Non serve che abbiano ragione.',
    kind: 'accuse-target',
    param: 'role.croupier',
    points: 25,
  },
  {
    id: 'goal.polaroid',
    title: 'Mettere le mani su una prova',
    text: 'Devi arrivare a possedere la polaroid del brindisi prima della fine dell’Atto III.',
    kind: 'find-object',
    param: 'clue.polaroid-sala',
    points: 20,
  },
  {
    id: 'goal.mai-il-guanto',
    title: 'Non nominare il guanto',
    text: 'Il guanto spaiato non deve mai finire in bacheca per mano tua. Se lo trovi, resti l’unico a saperlo.',
    kind: 'never-share',
    param: 'clue.guanto-spaiato',
    points: 20,
  },
  {
    id: 'goal.parola-buona',
    title: 'Essere creduti',
    text: 'Nessuna delle tue dichiarazioni deve essere smentita in bacheca da qui al verdetto.',
    kind: 'be-believed',
    param: '1',
    points: 25,
  },
];

export const EVENTS: SceneEventDef[] = [
  {
    id: 'evt.mareggiata',
    title: 'La mareggiata',
    text: 'Un’onda arriva fin sopra la balaustra e la terrazza resta al buio per un istante. In sala nessuno se ne accorge: l’orchestra copre tutto.',
    act: 1,
    effect: 'none',
    param: '',
    weight: 2,
  },
  {
    id: 'evt.linea-caduta',
    title: 'La linea cade',
    text: 'Il centralino perde la linea con l’esterno. Marisa Ottonello annota l’ora sul brogliaccio e continua a ripetere: pronto, pronto.',
    act: 1,
    effect: 'force-public-question',
    param: '',
    weight: 2,
  },
  {
    id: 'evt.passaggio-aperto',
    title: 'La porta di servizio',
    text: 'Una cameriera lascia aperta la porta del passaggio. Da lì si va in cucina, in lavanderia e a tutti i piani senza incontrare nessuno.',
    act: 2,
    effect: 'open-location',
    param: 'loc.passaggio',
    weight: 3,
  },
  {
    id: 'evt.blackout',
    title: 'Il buio delle 23:05',
    text: 'Il lampadario si spegne. Quattro minuti di candele e di risate nervose, poi la luce torna e qualcuno non è più dove era prima.',
    act: 2,
    effect: 'blackout',
    param: '',
    weight: 3,
  },
  {
    id: 'evt.stanzino-quadro',
    title: 'Lo stanzino del quadro',
    text: 'Bacigalupo scende a rimettere in linea il quarto piano e lascia lo stanzino aperto. Il quaderno dei turni è appeso allo spago.',
    act: 2,
    effect: 'open-location',
    param: 'loc.quadro',
    weight: 2,
  },
  {
    id: 'evt.registro-lavanderia',
    title: 'La riga aggiunta',
    text: 'Dalla lavanderia sale il registro dei capi. C’è una riga scritta a sera, con un’altra penna, che nessuno rivendica.',
    act: 3,
    effect: 'reveal-clue',
    param: 'clue.registro-lavanderia',
    weight: 2,
  },
  {
    id: 'evt.ultimo-giro',
    title: 'L’ultimo giro di sala',
    text: 'ADALBERTO passa fra i tavoli e spegne due candelabri su tre. Il tempo per parlare, dice, si è accorciato.',
    act: 3,
    effect: 'shorten-timer',
    param: '60',
    weight: 2,
  },
];

export const MOTIVE_OPTIONS: OptionDef[] = [
  { key: 'eredita', label: 'L’eredità: il testamento stava per cambiare' },
  { key: 'debito', label: 'Il debito: una cambiale in scadenza e nessun modo di pagarla' },
  { key: 'ricatto', label: 'Il ricatto: un documento che valeva più di un contratto' },
  { key: 'reputazione', label: 'La reputazione: una notizia che non doveva uscire' },
  { key: 'vendetta', label: 'La vendetta: un torto vecchio di anni, mai rimediato' },
  { key: 'gelosia', label: 'La gelosia: un affetto conteso in pubblico' },
];

export const METHOD_OPTIONS: OptionDef[] = [
  { key: 'chiave-duplicata', label: 'Una seconda chiave, e la porta richiusa dal corridoio' },
  { key: 'orologio-manipolato', label: 'Gli orari spostati, e un’ora che non è mai esistita' },
  { key: 'passaggio-servizio', label: 'Il passaggio di servizio e la porta dietro l’armadio' },
  { key: 'passe-partout', label: 'Il passe-partout dei piani, ritirato e rimesso al gancio' },
  { key: 'blackout-programmato', label: 'Il buio delle 23:05, preparato al quadro elettrico' },
  { key: 'finestra-terrazza', label: 'La finestra della suite e il ballatoio sul mare' },
];

export const BEATS: BeatDef[] = [
  { id: 'beat.incontro', label: 'Il primo incontro della sera' },
  { id: 'beat.bugia', label: 'La bugia necessaria' },
  { id: 'beat.gesto', label: 'Il gesto' },
  { id: 'beat.uscita', label: 'L’uscita dalla stanza' },
  { id: 'beat.scoperta', label: 'La scoperta' },
];
