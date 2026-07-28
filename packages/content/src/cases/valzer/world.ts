import type {
  AbilityDef,
  GameObjectDef,
  LocationDef,
  RoleDef,
  VictimDef,
  WitnessDef,
} from '@meridien/engine';
import { witnessesAt } from '../../shared/witnesses.js';

/**
 * «L'ultimo valzer» — mondo del caso.
 * Grand Hotel Méridien, 28 febbraio 1969, serata di gala.
 * Sette ambienti sullo stesso corpo di fabbrica: la sala e il palco al piano
 * nobile, i camerini e i servizi di scena al piano di sotto.
 */

export const victim: VictimDef = {
  id: 'ilde-ferrante',
  name: 'Ilde Ferrante',
  age: 38,
  role: 'Cantante',
  portrait: 'portrait-04',
  description:
    'Vent’anni di sale da ballo, tre dischi e una voce che il microfono non è mai riuscito a rimpicciolire. Puntuale, spiccia, poco amata dalle orchestre perché le correggeva davanti a tutti. Teneva le pastiglie per la voce nella piega dello spartito e chiamava «i miei ragazzi» musicisti che non salutava mai.',
  lastSeen:
    'Sul palco, alle 23:24, all’ottava battuta dell’ultimo valzer. Ha posato il bicchiere sul leggio e non ha ripreso a cantare.',
};

export const locations: LocationDef[] = [
  {
    id: 'loc.sala-ballo',
    name: 'Sala da ballo',
    floor: 0,
    scene: 'sala-ballo',
    description:
      'Millequattrocento gocce di vetro sopra centoventi invitati. I tavoli in ferro di cavallo attorno alla pista, le sedie dorate contate una per una dal direttore. Da qui si vede tutto il palco e nessun camerino.',
    adjacent: [
      { to: 'loc.palco', minutes: 1 },
      { to: 'loc.bar', minutes: 1 },
      { to: 'loc.corridoio-artisti', minutes: 2 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.palco',
    name: 'Palco',
    floor: 0,
    scene: 'palco',
    description:
      'Una pedana di quattro gradini, il leggio del maestro, il microfono a stelo e la buca bassa dove sta l’orchestra. Dietro il sipario, due sedie impagliate e un secchio di sabbia per le cicche.',
    adjacent: [
      { to: 'loc.sala-ballo', minutes: 1 },
      { to: 'loc.corridoio-artisti', minutes: 2 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.camerini',
    name: 'Camerini',
    floor: -1,
    scene: 'camerino',
    description:
      'Tre stanze in fila con lo specchio a lampadine. Quello di Ilde è il primo: un attaccapanni, una brocca, la boccetta di miele e limone e la cartella degli spartiti aperta sul tavolino.',
    adjacent: [{ to: 'loc.corridoio-artisti', minutes: 1 }],
    restricted: true,
    fromAct: 1,
  },
  {
    id: 'loc.cucina',
    name: 'Cucina',
    floor: -1,
    scene: 'cucina',
    description:
      'Due fuochi accesi su otto e il rumore che copre le voci. I vassoi tornano dal bar dalla porta di servizio, che stasera nessuno ha chiuso. Sul passavivande, la lista delle portate segnata a matita.',
    adjacent: [
      { to: 'loc.corridoio-artisti', minutes: 3 },
      { to: 'loc.bar', minutes: 3 },
    ],
    restricted: true,
    fromAct: 2,
  },
  {
    id: 'loc.registrazione',
    name: 'Sala di registrazione',
    floor: -1,
    scene: 'registrazione',
    description:
      'Uno sgabuzzino foderato di sughero con due registratori a bobina, un armadietto di lamiera e il contagiri che conta anche quando non c’è niente da contare. I fili salgono al palco dentro una canalina.',
    adjacent: [{ to: 'loc.corridoio-artisti', minutes: 2 }],
    restricted: true,
    fromAct: 2,
  },
  {
    id: 'loc.corridoio-artisti',
    name: 'Corridoio degli artisti',
    floor: -1,
    scene: 'corridoio',
    description:
      'Venti metri di linoleum verde fra il palco e i camerini. Tre lampade a soffitto, la seconda saltata. In fondo, la cabina del centralino di servizio e un secchio di zinco per la cenere.',
    adjacent: [
      { to: 'loc.sala-ballo', minutes: 2 },
      { to: 'loc.palco', minutes: 2 },
      { to: 'loc.camerini', minutes: 1 },
      { to: 'loc.registrazione', minutes: 2 },
      { to: 'loc.cucina', minutes: 3 },
    ],
    restricted: true,
    fromAct: 1,
  },
  {
    id: 'loc.bar',
    name: 'Bar della sala',
    floor: 0,
    scene: 'bar',
    description:
      'Sei metri di banco in mogano, lo specchio dietro le bottiglie, il registratore di cassa che segna anche gli omaggi. I calici da brindisi stanno su un ripiano a parte, contati a coppie.',
    adjacent: [
      { to: 'loc.sala-ballo', minutes: 1 },
      { to: 'loc.cucina', minutes: 3 },
    ],
    restricted: false,
    fromAct: 1,
  },
];

export const objects: GameObjectDef[] = [
  {
    id: 'obj.spartito',
    name: 'Cartella dell’ultimo valzer',
    description:
      'Cartella di cartone verde con l’elastico. Dentro, sei fogli di musica piegati in tre e l’astuccio delle pastiglie infilato nella piega.',
    icon: 'spartito',
  },
  {
    id: 'obj.calice',
    name: 'Calice da brindisi',
    description:
      'Cristallo sottile, piede segnato a smeriglio con una riga sola. Il bar ne tiene sei, sempre a coppie.',
    icon: 'calice',
  },
  {
    id: 'obj.bobina',
    name: 'Bobina della serata',
    description:
      'Nastro da un quarto di pollice su bobina di metallo, etichetta a matita: «28-II-69, gala, I e II tempo».',
    icon: 'bobina',
  },
  {
    id: 'obj.boccetta',
    name: 'Boccetta di miele e limone',
    description:
      'Vetro scuro, tappo di sughero, mezzo dito di sciroppo. Ilde la portava dal camerino al palco e non la lasciava a nessuno.',
    icon: 'boccetta',
  },
  {
    id: 'obj.registratore',
    name: 'Registratore a bobina',
    description:
      'Macchina da studio con due teste e un contagiri a tre cifre. Segna la lunghezza del nastro inciso, non l’ora.',
    icon: 'registratore',
  },
  {
    id: 'obj.locandina',
    name: 'Locandina del gala',
    description:
      'Cartoncino avorio stampato in due colori. Sotto il nome di Ilde Ferrante, una fascetta di carta incollata di fresco.',
    icon: 'locandina',
  },
  {
    id: 'obj.astuccio',
    name: 'Astuccio delle pastiglie',
    description:
      'Scatoletta di latta per pastiglie alla propoli. Ne contiene dodici quando è pieno; stasera ne conteneva dieci.',
    icon: 'astuccio',
  },
  {
    id: 'obj.chiave',
    name: 'Chiave del primo camerino',
    description:
      'Chiave di ottone con il fiocco rosso. L’albergo ne ha due: quella del bancone e quella data in consegna all’orchestra nel 1967.',
    icon: 'chiave',
  },
  {
    id: 'obj.macchina-foto',
    name: 'Macchina fotografica a soffietto',
    description:
      'Corpo nero, lastre da sei per nove, flash a lampadina. Pastorino la porta al collo anche quando mangia.',
    icon: 'macchina-foto',
  },
];

export const abilities: AbilityDef[] = [
  {
    id: 'abi.contratto-in-mano',
    name: 'Contratto in mano',
    description:
      'Bergonzi tratta come si tratta con gli editori: alza la voce e pretende una risposta davanti a tutti. Obbliga un giocatore a rispondere in pubblico a una domanda.',
    effect: 'force-answer',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.orecchio-assoluto',
    name: 'Orecchio assoluto',
    description:
      'Il maestro sente la nota falsa prima degli altri. Ottiene la lettura tecnica di un indizio che possiede già: cosa dice davvero, al di là di come è scritto.',
    effect: 'second-opinion',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.gioco-di-luci',
    name: 'Gioco di luci',
    description:
      'Chi ha lavorato in rivista sa dove mettere il riflettore. Permette di falsificare un’etichetta sulla bacheca comune: la voce resta, il nome cambia.',
    effect: 'misdirect',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.riascolto',
    name: 'Riascolto',
    description:
      'Sivori rimette il nastro sul principio e conta i giri. Verifica se due voci appuntate sulla bacheca possono stare insieme nella stessa mezz’ora.',
    effect: 'timeline-check',
    charges: 2,
    acts: [2, 3],
  },
  {
    id: 'abi.controluce',
    name: 'Controluce',
    description:
      'Pastorino guarda le mani prima delle facce. Scopre quanti indizi tiene in mano un altro invitato, senza sapere quali.',
    effect: 'peek-hand-count',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.fonte-riservata',
    name: 'Fonte riservata',
    description:
      'La Ravasio non rivela le fonti, ma sa contarle. Scopre quanti messaggi privati ha mandato un invitato dall’inizio dell’atto.',
    effect: 'listen-in',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.diritto-di-palco',
    name: 'Diritto di palco',
    description:
      'La contessa paga l’orchestra da tre stagioni e nessuno le chiede dove va. Concede un’esplorazione in più nell’atto in corso.',
    effect: 'extra-search',
    charges: 1,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.mazzo-di-chiavi',
    name: 'Mazzo di chiavi',
    description:
      'Ugolini apre ciò che l’albergo tiene chiuso. Fa emergere un indizio ambientale non ancora trovato in un ambiente a sua scelta.',
    effect: 'reveal-location-clue',
    charges: 1,
    acts: [2, 3],
  },
];

export const roles: RoleDef[] = [
  {
    id: 'role.impresario',
    name: 'Aldo Bergonzi',
    age: 54,
    profession: 'Impresario di spettacoli',
    origin: 'Milano',
    portrait: 'portrait-02',
    archetype: 'L’impresario',
    relationToVictim:
      'La rappresenta da nove anni e da nove anni le deve una percentuale che non le ha mai versata per intero. Il gala di stasera lo ha organizzato lui, con i soldi di qualcun altro.',
    traits: ['sbrigativo', 'cordiale a comando', 'in ritardo sui conti'],
    presentation:
      'Bergonzi, impresario. Il nome di Ilde su un manifesto lo ho messo io la prima volta, nel Sessanta, e da allora nessuno lo ha più tolto.',
    abilityId: 'abi.contratto-in-mano',
  },
  {
    id: 'role.maestro',
    name: 'Vittorio Lanzoni',
    age: 47,
    profession: 'Direttore d’orchestra',
    origin: 'Parma',
    portrait: 'portrait-12',
    archetype: 'Il musicista',
    relationToVictim:
      'La dirige da due stagioni. Le ha scritto sette pezzi e non ha firmato nessuno dei sette: si accordarono così, a voce, in una notte del 1966.',
    traits: ['metodico', 'permaloso', 'preciso sugli attacchi'],
    presentation:
      'Lanzoni, direttore d’orchestra. Io do gli attacchi e conto le battute. Di quello che succede in sala mi accorgo solo se sbaglia un ottone.',
    abilityId: 'abi.orecchio-assoluto',
  },
  {
    id: 'role.rivale',
    name: 'Delia Marcantonio',
    age: 29,
    profession: 'Cantante di rivista',
    origin: 'Bari',
    portrait: 'portrait-01',
    archetype: 'La vedette',
    relationToVictim:
      'Doveva aprire la serata e invece l’ha chiusa dietro le quinte: il suo nome sulla locandina è stato coperto da una fascetta di carta il pomeriggio stesso.',
    traits: ['ambiziosa', 'gentile in pubblico', 'memoria lunga'],
    presentation:
      'Delia Marcantonio. Canto quello che mi lasciano cantare. Stasera mi hanno lasciato l’applauso degli altri, e l’ho fatto anch’io.',
    abilityId: 'abi.gioco-di-luci',
  },
  {
    id: 'role.tecnico',
    name: 'Ermanno Sivori',
    age: 33,
    profession: 'Tecnico del suono',
    origin: 'Genova',
    portrait: 'portrait-06',
    archetype: 'Il tecnico del suono',
    relationToVictim:
      'Incide le serate dell’albergo da quattro anni. Ilde lo faceva chiamare per farsi riascoltare e due volte gli ha fatto rifare tutto perché «il fiato non si sente».',
    traits: ['silenzioso', 'ordinato', 'permaloso sui nastri'],
    presentation:
      'Sivori, sala di registrazione. Io incido e basta. Se una serata è venuta male non è mai colpa del nastro.',
    abilityId: 'abi.riascolto',
  },
  {
    id: 'role.fotografo',
    name: 'Nino Pastorino',
    age: 41,
    profession: 'Fotografo di rotocalco',
    origin: 'Savona',
    portrait: 'portrait-05',
    archetype: 'Il fotografo',
    relationToVictim:
      'La fotografa dal 1961 e le ha venduto più copertine di quante lei ne ricordi. Ilde gli aveva chiesto due volte di bruciare una lastra e lui una volta aveva detto di no.',
    traits: ['pratico', 'parla per elenchi', 'sempre in mezzo'],
    presentation:
      'Pastorino, fotografo. Tre lastre in sala, due sul palco, una dietro le quinte. Le facce vengono meglio quando nessuno sa che stai guardando.',
    abilityId: 'abi.controluce',
  },
  {
    id: 'role.giornalista',
    name: 'Bice Ravasio',
    age: 34,
    profession: 'Giornalista',
    origin: 'Milano',
    portrait: 'portrait-09',
    archetype: 'La giornalista',
    relationToVictim:
      'Ha stroncato il suo secondo disco nel 1965 e da allora si scrivono a Natale. Stasera doveva raccontare un ritorno e ha in borsa un articolo già battuto a macchina.',
    traits: ['rapida', 'poco sentimentale', 'prende appunti sempre'],
    presentation:
      'Ravasio, cronaca degli spettacoli. Scrivo quello che vedo. Quando non vedo abbastanza, aspetto: di solito basta mezz’ora.',
    abilityId: 'abi.fonte-riservata',
  },
  {
    id: 'role.contessa',
    name: 'Ottavia Sforza Ghirlanda',
    age: 68,
    profession: 'Mecenate',
    origin: 'Genova',
    portrait: 'portrait-07',
    archetype: 'La contessa',
    relationToVictim:
      'Paga l’orchestra da tre stagioni e i debiti di Ilde da altrettante. Stasera aveva in borsetta un assegno e l’intenzione di dire che era l’ultimo.',
    traits: ['cerimoniosa', 'informata', 'dura sui soldi'],
    presentation:
      'Sforza Ghirlanda. Sostengo questa orchestra perché senza qualcuno che la sostenga non suonerebbe. Non chiedo che mi si ringrazi in pubblico.',
    abilityId: 'abi.diritto-di-palco',
  },
  {
    id: 'role.direttore',
    name: 'Cesare Ugolini',
    age: 50,
    profession: 'Direttore del Grand Hotel Méridien',
    origin: 'Sanremo',
    portrait: 'portrait-03',
    archetype: 'Il direttore d’albergo',
    relationToVictim:
      'La ospita ogni febbraio dal 1964 e le fa sempre la stessa camera. Le doveva il cachet di due serate dell’anno scorso e sperava che il gala servisse a saldarlo.',
    traits: ['impeccabile', 'evasivo sui conti', 'conta le sedie'],
    presentation:
      'Ugolini, direzione. In questo albergo so dove sono le cose e a che ora sono state spostate. È il mio mestiere, non una virtù.',
    abilityId: 'abi.mazzo-di-chiavi',
  },
];

export const witnesses: WitnessDef[] = witnessesAt({
  'wit.bramante': 'loc.sala-ballo',
  'wit.coldani': 'loc.camerini',
  'wit.pesce': 'loc.cucina',
  'wit.ottonello': 'loc.corridoio-artisti',
  'wit.bacigalupo': 'loc.registrazione',
});
