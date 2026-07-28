import type { BeatDef, ObjectiveDef, OptionDef, SceneEventDef, SecretDef } from '@meridien/engine';

/**
 * «L'ultimo valzer» — segreti, obiettivi, opzioni d'accusa, beat ed eventi.
 * Segreti e obiettivi sono otto: uno per ruolo, distinti in ogni variante.
 * Moventi, metodi e beat sono identici nelle tre varianti: è la difesa
 * contro il metagioco, perché dalle opzioni non si deve capire quale
 * variante si sta giocando.
 */

export const secrets: SecretDef[] = [
  {
    id: 'sec.contratto-strappato',
    title: 'Il contratto firmato due volte',
    text: 'Bergonzi ha firmato le quattro facciate con Delia il 20 febbraio e ha promesso le stesse a Ilde il 25, quando lei ha detto di sì. Non lo sa nessuna delle due.',
    suspicion: 2,
  },
  {
    id: 'sec.paternita-valzer',
    title: 'La notte del Sessantasei',
    text: 'L’ultimo valzer l’ha scritto Lanzoni in una notte del 1966, su un tavolo di marmo, e si accordarono a voce. Sul deposito del diritto d’autore il suo nome non c’è.',
    suspicion: 3,
  },
  {
    id: 'sec.provino-disdetto',
    title: 'Il provino che non c’è più',
    text: 'Delia ha saputo il 27 febbraio che il provino di Roma era stato disdetto, e non da lei. Ha continuato a dire a tutti che partiva domenica.',
    suspicion: 2,
  },
  {
    id: 'sec.bobine-vendute',
    title: 'Le bobine che escono dall’albergo',
    text: 'Sivori copia le serate e le vende a un negozio di Genova. Undici bobine hanno già preso il treno e una di quelle contiene una conversazione privata.',
    suspicion: 3,
  },
  {
    id: 'sec.lastre-compromesse',
    title: 'Le due lastre bruciate',
    text: 'Su due lastre di Pastorino c’è una cosa che non doveva finire su un rotocalco. Le ha bruciate lui nel secchio del corridoio, e non erano sue da bruciare.',
    suspicion: 1,
  },
  {
    id: 'sec.articolo-gia-scritto',
    title: 'L’articolo prima del concerto',
    text: 'La Ravasio aveva il pezzo pronto alle 21:00, dettato quasi per intero dall’ufficio stampa dell’albergo. Doveva soltanto aggiungere la data e il numero degli invitati.',
    suspicion: 1,
  },
  {
    id: 'sec.assegno-a-ilde',
    title: 'L’ultimo assegno',
    text: 'La contessa paga i debiti di Ilde da tre anni. Quello di stasera doveva essere l’ultimo e glielo aveva scritto in una lettera che Ilde non ha mai risposto.',
    suspicion: 1,
  },
  {
    id: 'sec.cassa-scoperta',
    title: 'L’ammanco coperto',
    text: 'Ugolini ha tappato un buco di centomila lire con una ricevuta di comodo intestata all’orchestra. Il gala doveva servire a rimettere a posto la cassa entro marzo.',
    suspicion: 2,
  },
];

export const objectives: ObjectiveDef[] = [
  {
    id: 'goal.condividi-tre',
    title: 'Mettere le carte in tavola',
    text: 'Condividi almeno tre indizi con il tavolo prima del verdetto. Chi non mostra niente, alla fine, viene guardato.',
    kind: 'share-count',
    param: '3',
    points: 15,
  },
  {
    id: 'goal.custodire-il-segreto',
    title: 'Che resti fra noi',
    text: 'Arriva al verdetto senza che il tuo segreto personale finisca appuntato sulla bacheca.',
    kind: 'hide-secret',
    param: '1',
    points: 25,
  },
  {
    id: 'goal.spostare-i-sospetti',
    title: 'Guardate l’impresario',
    text: 'Fai in modo che almeno due invitati accusino pubblicamente Aldo Bergonzi. Non è necessario crederci.',
    kind: 'accuse-target',
    param: 'role.impresario',
    points: 25,
  },
  {
    id: 'goal.proteggere-la-contessa',
    title: 'La signora non si tocca',
    text: 'Fai in modo che la contessa Sforza Ghirlanda arrivi al verdetto senza ricevere nemmeno un’accusa.',
    kind: 'protect-target',
    param: 'role.contessa',
    points: 20,
  },
  {
    id: 'goal.quattro-domande',
    title: 'Chiedere è mestiere',
    text: 'Poni almeno quattro domande pubbliche nel corso della serata. Le domande contano anche quando nessuno risponde.',
    kind: 'ask-questions',
    param: '4',
    points: 15,
  },
  {
    id: 'goal.trovare-il-nastro',
    title: 'Il nastro della serata',
    text: 'Trova la giunta sul nastro della serata prima della fine del secondo atto. Quel taglio spiega più di un alibi.',
    kind: 'find-object',
    param: 'clue.giunta-nastro',
    points: 20,
  },
  {
    id: 'goal.non-mostrare-il-registro',
    title: 'Il registro resta al bancone',
    text: 'Non condividere mai con il tavolo il registro delle chiavi. Ci sono orari che non ti conviene spiegare.',
    kind: 'never-share',
    param: 'clue.registro-chiavi',
    points: 20,
  },
  {
    id: 'goal.essere-creduto',
    title: 'Nessuno mi ha smentito',
    text: 'Arriva al verdetto senza che una tua dichiarazione pubblica sia stata contraddetta da una prova.',
    kind: 'be-believed',
    param: '1',
    points: 25,
  },
];

export const motiveOptions: OptionDef[] = [
  { key: 'diritti-canzone', label: 'La firma su una canzone che non le apparteneva' },
  { key: 'nome-cancellato', label: 'Un nome coperto da una fascetta sulla locandina' },
  { key: 'ricatto-registrazione', label: 'Una vecchia registrazione da far sparire' },
  { key: 'contratto-perduto', label: 'Le quattro facciate d’incisione tolte all’ultimo' },
  { key: 'debito-mai-saldato', label: 'Denaro promesso da anni e mai arrivato' },
  { key: 'posto-in-orchestra', label: 'Un posto in orchestra tolto per capriccio' },
];

export const methodOptions: OptionDef[] = [
  { key: 'pastiglie-spartito', label: 'Le pastiglie per la voce, nella piega dello spartito' },
  { key: 'bicchiere-sostituito', label: 'Il calice del brindisi, servito e poi rimesso a posto' },
  { key: 'boccetta-camerino', label: 'La boccetta di miele e limone del camerino, rabboccata' },
  { key: 'caraffa-del-leggio', label: 'La caraffa lasciata sul leggio del palco' },
  { key: 'tisana-di-cucina', label: 'La tisana preparata in cucina e portata di sotto' },
  { key: 'zucchero-del-bar', label: 'Lo zucchero del bar, nella tazza dell’intervallo' },
];

export const beats: BeatDef[] = [
  { id: 'beat.accordo', label: 'L’accordo che non è stato mantenuto' },
  { id: 'beat.preparazione', label: 'La preparazione, lontano dalla sala' },
  { id: 'beat.gesto', label: 'Il gesto, in mezzo alla gente' },
  { id: 'beat.copertura', label: 'La copertura: qualcosa che torna al suo posto' },
  { id: 'beat.ultimo-valzer', label: 'L’ultimo valzer' },
];

export const events: SceneEventDef[] = [
  {
    id: 'evt.brindisi',
    title: 'Il brindisi dei vent’anni',
    text: 'Bergonzi batte il cucchiaino sul calice e chiede silenzio. Vent’anni di carriera, dice, e tutti alzano qualcosa. Ilde ringrazia in due parole e torna di sotto.',
    act: 1,
    effect: 'force-public-question',
    param: '',
    weight: 2,
  },
  {
    id: 'evt.lampada-saltata',
    title: 'La lampada di mezzo',
    text: 'Nel corridoio degli artisti la seconda lampada fa un rumore secco e si spegne. L’elettricista alza le spalle: la cambia domani, dice, a quest’ora non passa nessuno.',
    act: 1,
    effect: 'blackout',
    param: '',
    weight: 1,
  },
  {
    id: 'evt.camerini-aperti',
    title: 'I camerini restano aperti',
    text: 'La direzione fa aprire i camerini: chi vuole guardare guardi adesso, dice Ugolini, perché domattina arriva la questura e non si tocca più niente.',
    act: 2,
    effect: 'open-location',
    param: 'loc.camerini',
    weight: 3,
  },
  {
    id: 'evt.sala-registrazione',
    title: 'La porta di sughero',
    text: 'Lo sgabuzzino della registrazione viene aperto. Dentro fa caldo, il sughero attutisce le voci e sui due registratori una bobina è ancora montata.',
    act: 2,
    effect: 'open-location',
    param: 'loc.registrazione',
    weight: 3,
  },
  {
    id: 'evt.bobina-ritrovata',
    title: 'La bobina sul tavolo',
    text: 'Qualcuno posa la bobina della serata sul tavolo della sala e nessuno ammette di averla portata su. L’etichetta a matita dice: gala, primo e secondo tempo.',
    act: 2,
    effect: 'reveal-clue',
    param: 'clue.giunta-nastro',
    weight: 2,
  },
  {
    id: 'evt.cucina-chiusa',
    title: 'La cucina si spegne',
    text: 'Il capocuoco spegne i due fuochi rimasti, chiude il passavivande e mette la chiave in tasca. Da qui in avanti, dice, in cucina si entra con lui davanti.',
    act: 2,
    effect: 'close-location',
    param: 'loc.cucina',
    weight: 1,
  },
  {
    id: 'evt.riascolto-pubblico',
    title: 'Il riascolto in sala',
    text: 'Sivori porta il registratore in sala e rimette il nastro dal principio. Per dodici minuti la voce di Ilde canta sopra centoventi persone che non ballano più.',
    act: 3,
    effect: 'reveal-clue',
    param: 'clue.riascolto-nastro',
    weight: 2,
  },
  {
    id: 'evt.strada-franata',
    title: 'La strada per Alassio',
    text: 'Il portiere riattacca il telefono e lo dice piano: la strada è chiusa, la questura arriva col primo giro d’autobus. Restano poche ore e una sala sola.',
    act: 3,
    effect: 'shorten-timer',
    param: '120',
    weight: 2,
  },
];
