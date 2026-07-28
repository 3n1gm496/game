import type { VariantDef } from '@meridien/engine';
import { ALL_FACTS } from '../clues.js';

/**
 * Variante C — «La bobina».
 * Colpevole: Ermanno Sivori. Movente: una registrazione del 1967 che doveva
 * essere distrutta e invece ha preso il treno per Genova.
 * Metodo: la boccetta di miele e limone del camerino, rabboccata.
 *
 * Il perno è il nastro. Tutti hanno datato la serata sulla bobina, e la bobina
 * ha due difetti: dieci minuti girati a vuoto fra le 22:05 e le 22:15, e
 * quattro minuti tagliati e giuntati a mano fra le 22:20 e le 22:24. Il primo
 * difetto è un alibi, il secondo è una cancellatura. Insieme dicono che
 * l'ordine degli eventi non è quello che la sala ha creduto: il miele viene
 * prima dell'incisione di prova, non dopo.
 */

export const varianteBobina: VariantDef = {
  id: 'var.bobina',
  name: 'La bobina',
  tagline: 'Il nastro gira anche quando non c’è nessuno. Per questo sembrava un alibi.',
  culpritRoleId: 'role.tecnico',
  motiveKey: 'ricatto-registrazione',
  methodKey: 'boccetta-camerino',
  sequence: ['beat.accordo', 'beat.preparazione', 'beat.gesto', 'beat.copertura', 'beat.ultimo-valzer'],
  beatDetails: {
    'beat.accordo':
      'Nel 1967 Ilde chiede per iscritto che una bobina venga distrutta. Non viene distrutta: viene copiata, etichettata a matita e messa in fila con le altre dieci.',
    'beat.preparazione':
      'Il 24 febbraio arriva la lettera di licenziamento, con effetto dal 1° marzo e una riga a penna in calce. Stasera il registratore resta acceso anche quando non c’è niente da incidere.',
    'beat.gesto':
      'Dalle 22:05 alle 22:15 il nastro gira sul vuoto. In quei dieci minuti il primo camerino è aperto e la boccetta di miele e limone torna più piena di come era stata lasciata.',
    'beat.copertura':
      'Quattro minuti tagliati di sbieco e rincollati con la carta gommata: quelli in cui Ilde, entrando per l’incisione, dice che il miele stasera è forte.',
    'beat.ultimo-valzer':
      'Alle 23:10 Ilde alza un bicchiere che non c’entra niente. Alle 23:24 si ferma all’ottava battuta e l’orchestra continua per quattro battute di troppo.',
  },
  facts: ALL_FACTS,
  timeline: [
    { who: 'victim', from: 1200, to: 1235, where: 'loc.camerini', note: 'Si veste e prova la voce. La chiave uno è al gancio del bancone.', hidden: false },
    { who: 'victim', from: 1238, to: 1255, where: 'loc.sala-ballo', note: 'Gira fra i tavoli, saluta la contessa, non accetta niente da bere.', hidden: false },
    { who: 'victim', from: 1258, to: 1300, where: 'loc.palco', note: 'Primo tempo. Presenta il valzer come «parole e musica mie».', hidden: false },
    { who: 'victim', from: 1303, to: 1320, where: 'loc.camerini', note: 'Intervallo. Prende due pastiglie, come tutte le sere da vent’anni.', hidden: false },
    { who: 'victim', from: 1324, to: 1332, where: 'loc.bar', note: 'Brindisi dei vent’anni. Ringrazia in due parole e non finisce il calice.', hidden: false },
    { who: 'victim', from: 1336, to: 1340, where: 'loc.camerini', note: 'Passa a bere due dita di miele e limone prima dell’incisione, alle 22:17.', hidden: true },
    { who: 'victim', from: 1343, to: 1365, where: 'loc.registrazione', note: 'Incisione di prova. Alle 22:32 la voce si incrina e lei ripete la battuta.', hidden: false },
    { who: 'victim', from: 1367, to: 1378, where: 'loc.corridoio-artisti', note: 'Si siede sulla sedia impagliata alle 22:50 e chiede un bicchiere d’acqua.', hidden: false },
    { who: 'victim', from: 1381, to: 1404, where: 'loc.palco', note: 'Secondo tempo. Alle 23:05 si siede dietro il sipario, alle 23:24 si ferma.', hidden: false },
    { who: 'role.tecnico', from: 1200, to: 1322, where: 'loc.registrazione', note: 'Monta le bobine e incide il primo tempo. Alle 22:02 lascia la macchina in moto.', hidden: false },
    { who: 'role.tecnico', from: 1325, to: 1335, where: 'loc.camerini', note: 'Riprende il microfono a filo e rabbocca la boccetta sulla mensola.', hidden: true },
    { who: 'role.tecnico', from: 1338, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti che non gli piacciono.', hidden: false },
    { who: 'role.rivale', from: 1200, to: 1250, where: 'loc.camerini', note: 'Si trucca nel terzo camerino con la locandina appoggiata allo specchio.', hidden: false },
    { who: 'role.rivale', from: 1253, to: 1310, where: 'loc.sala-ballo', note: 'Applaude il primo tempo dal fondo della sala.', hidden: false },
    { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Al posto tre del banco, di spalle alla sala, per sedici minuti.', hidden: false },
    { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Sale sul palco vuoto e posa un bicchiere d’acqua sul leggio.', hidden: false },
    { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Tavolo sette, dove la vedono tutti e nessuno la guarda.', hidden: false },
    { who: 'role.maestro', from: 1200, to: 1300, where: 'loc.palco', note: 'Accorda l’orchestra, prova gli attacchi e dirige il primo tempo.', hidden: false },
    { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale in piedi, di spalle al banco, durante l’intervallo.', hidden: false },
    { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Sul podio fino all’ottava battuta dell’ultimo valzer.', hidden: false },
    { who: 'role.impresario', from: 1200, to: 1290, where: 'loc.sala-ballo', note: 'Tavolo d’onore, con la cartella dei contratti sotto il braccio.', hidden: false },
    { who: 'role.impresario', from: 1293, to: 1332, where: 'loc.bar', note: 'Fa preparare il brindisi e alle 22:08 parla al microfono del bar.', hidden: false },
    { who: 'role.impresario', from: 1335, to: 1404, where: 'loc.sala-ballo', note: 'In sala fino alla fine, a raccogliere complimenti che non lo riguardano.', hidden: false },
    { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Conta le sedie dorate e riceve gli invitati all’ingresso.', hidden: false },
    { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Seconda portata e conto delle bottiglie con il capocuoco.', hidden: false },
    { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa preparare il brindisi dei vent’anni e conta i calici a coppie.', hidden: false },
    { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta, come fa sempre nelle sere di gala.', hidden: false },
    { who: 'role.giornalista', from: 1200, to: 1260, where: 'loc.sala-ballo', note: 'Conta gli invitati e segna i nomi che contano.', hidden: false },
    { who: 'role.giornalista', from: 1263, to: 1300, where: 'loc.corridoio-artisti', note: 'Aspetta l’intervallo seduta sulla sedia impagliata.', hidden: false },
    { who: 'role.giornalista', from: 1304, to: 1325, where: 'loc.camerini', note: 'Intervista Ilde durante l’intervallo e se ne va alle 22:05.', hidden: false },
    { who: 'role.giornalista', from: 1328, to: 1404, where: 'loc.corridoio-artisti', note: 'Rilegge gli appunti in corridoio, dove la lampada è saltata.', hidden: false },
    { who: 'role.contessa', from: 1200, to: 1330, where: 'loc.sala-ballo', note: 'Tavolo due, di fronte al palco, con la borsetta sulle ginocchia.', hidden: false },
    { who: 'role.contessa', from: 1333, to: 1350, where: 'loc.bar', note: 'Un vermut con il direttore, in piedi accanto alla cassa.', hidden: false },
    { who: 'role.contessa', from: 1353, to: 1404, where: 'loc.sala-ballo', note: 'Al tavolo fino all’ultimo valzer.', hidden: false },
    { who: 'role.fotografo', from: 1200, to: 1270, where: 'loc.sala-ballo', note: 'Fotografa i tavoli e la contessa, come da accordo con l’albergo.', hidden: false },
    { who: 'role.fotografo', from: 1273, to: 1300, where: 'loc.palco', note: 'Lastre del primo tempo, dal lato degli ottoni.', hidden: false },
    { who: 'role.fotografo', from: 1303, to: 1345, where: 'loc.corridoio-artisti', note: 'Cambia i telai e brucia due lastre nel secchio di zinco.', hidden: true },
    { who: 'role.fotografo', from: 1348, to: 1404, where: 'loc.sala-ballo', note: 'Rientra in sala per il secondo tempo.', hidden: false },
  ],
  clueSetup: [
    {
      clueId: 'clue.contagiri',
      relevance: 'critico',
      act: 2,
      locationId: 'loc.registrazione',
      hotspot: 'contagiri',
      puzzle: {
        kind: 'orario',
        prompt: 'Fra quali due orari il contagiri segna nastro consumato senza musica sopra?',
        options: ['21:40 e 22:00', '22:05 e 22:15', '22:20 e 22:24'],
        answer: '22:05 e 22:15',
        hint: 'Non confondere i minuti girati a vuoto con quelli tagliati: i primi ci sono ancora, i secondi no.',
      },
    },
    { clueId: 'clue.giunta-nastro', relevance: 'critico', act: 2, locationId: 'loc.registrazione', hotspot: 'bobina', puzzle: null },
    { clueId: 'clue.riascolto-nastro', relevance: 'critico', act: 3, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.armadietto-bobine', relevance: 'critico', act: 2, locationId: 'loc.registrazione', hotspot: 'armadietto', puzzle: null },
    { clueId: 'clue.nastro-vecchio', relevance: 'critico', act: 2, locationId: 'loc.camerini', hotspot: 'scatola-senza-etichetta', puzzle: null },
    { clueId: 'clue.lettera-licenziamento', relevance: 'critico', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'giacca', puzzle: null },
    { clueId: 'clue.registro-telefonate', relevance: 'critico', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'cabina-centralino', puzzle: null },
    { clueId: 'clue.boccetta-livello', relevance: 'critico', act: 2, locationId: 'loc.camerini', hotspot: 'mensola', puzzle: null },
    { clueId: 'clue.foglio-farmacista', relevance: 'critico', act: 2, locationId: 'loc.cucina', hotspot: 'armadietto-medicinali', puzzle: null },
    { clueId: 'clue.orlo-pulito', relevance: 'utile', act: 1, locationId: 'loc.bar', hotspot: 'lavello', puzzle: null },
    { clueId: 'clue.abitudine-voce', relevance: 'utile', act: 1, locationId: 'loc.camerini', hotspot: 'governante', puzzle: null },
    { clueId: 'clue.astuccio-pastiglie', relevance: 'utile', act: 1, locationId: 'loc.camerini', hotspot: 'specchio', puzzle: null },
    { clueId: 'clue.appunti-cameriere', relevance: 'utile', act: 2, locationId: 'loc.cucina', hotspot: 'lista-portate', puzzle: null },
    { clueId: 'clue.calice-lavato', relevance: 'utile', act: 1, locationId: 'loc.bar', hotspot: 'panno', puzzle: null },
    { clueId: 'clue.registro-chiavi', relevance: 'contorno', act: 1, locationId: 'loc.corridoio-artisti', hotspot: 'cabina-centralino', puzzle: null },
    { clueId: 'clue.lampada-saltata', relevance: 'contorno', act: 1, locationId: 'loc.corridoio-artisti', hotspot: 'lampada', puzzle: null },
    { clueId: 'clue.conta-vassoi', relevance: 'contorno', act: 2, locationId: 'loc.cucina', hotspot: 'passavivande', puzzle: null },
    { clueId: 'clue.annuncio-nastro', relevance: 'contorno', act: 1, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.spartito-copia', relevance: 'falsa-pista', act: 2, locationId: 'loc.camerini', hotspot: 'tavolino', puzzle: null },
    { clueId: 'clue.piega-terza-pagina', relevance: 'falsa-pista', act: 1, locationId: 'loc.camerini', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.deposito-diritti', relevance: 'falsa-pista', act: 2, locationId: 'loc.camerini', hotspot: 'borsetta', puzzle: null },
    { clueId: 'clue.lettera-chiusa', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'attaccapanni', puzzle: null },
    { clueId: 'clue.guanti-bianchi', relevance: 'falsa-pista', act: 2, locationId: 'loc.palco', hotspot: 'podio', puzzle: null },
    { clueId: 'clue.chiave-orchestra', relevance: 'falsa-pista', act: 3, locationId: 'loc.palco', hotspot: 'custodia-leggio', puzzle: null },
    { clueId: 'clue.calici-gemelli', relevance: 'falsa-pista', act: 2, locationId: 'loc.bar', hotspot: 'ripiano', puzzle: null },
    { clueId: 'clue.conto-del-bar', relevance: 'falsa-pista', act: 2, locationId: 'loc.bar', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.fotografia-leggio', relevance: 'falsa-pista', act: 1, locationId: 'loc.sala-ballo', hotspot: 'tavolo-fotografo', puzzle: null },
    { clueId: 'clue.locandina-fascetta', relevance: 'falsa-pista', act: 2, locationId: 'loc.sala-ballo', hotspot: 'ingresso', puzzle: null },
    { clueId: 'clue.bozza-articolo', relevance: 'falsa-pista', act: 1, locationId: 'loc.sala-ballo', hotspot: 'tavolo-stampa', puzzle: null },
    { clueId: 'clue.lastre-bruciate', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'secchio-zinco', puzzle: null },
    { clueId: 'clue.telegramma-disdetto', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.contratto-incisione', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.matrice-assegno', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.ricevuta-comodo', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.c-colpevole-macchina',
      text: 'Dieci minuti di nastro girato sul vuoto non sono un alibi: sono una macchina lasciata accesa. In quei dieci minuti lo sgabuzzino era vuoto e il camerino era aperto.',
      concludes: 'culprit',
      paths: [
        ['fact.registratore-a-vuoto', 'fact.nastro-tagliato'],
        ['fact.boccetta-rabboccata', 'fact.sivori-licenziato'],
      ],
    },
    {
      id: 'inf.c-colpevole-nastro',
      text: 'Il taglio e le undici bobine fuori registro sono la stessa mano: una che sa dove passa la giunta e una che sa dove finiscono le copie. In questa sala è una mano sola.',
      concludes: 'culprit',
      paths: [
        ['fact.voce-incrinata', 'fact.copie-non-registrate'],
        ['fact.nastro-del-sessantasette', 'fact.telefonata-genova'],
      ],
    },
    {
      id: 'inf.c-movente-ricatto',
      text: 'Una bobina del 1967 che Ilde aveva chiesto per iscritto di distruggere è ancora qui, copiata e in fila con le altre. Distruggerla adesso sarebbe stato tardi.',
      concludes: 'motive',
      paths: [
        ['fact.nastro-del-sessantasette', 'fact.copie-non-registrate'],
        ['fact.sivori-licenziato', 'fact.telefonata-genova'],
      ],
    },
    {
      id: 'inf.c-movente-licenziamento',
      text: 'La lettera del 24 febbraio chiude il rapporto dal 1° marzo, su segnalazione della signora Ferrante. Dal 1° marzo l’armadietto di lamiera sarebbe stato aperto da un altro.',
      concludes: 'motive',
      paths: [
        ['fact.sivori-licenziato', 'fact.copie-non-registrate'],
        ['fact.nastro-del-sessantasette', 'fact.telefonata-genova'],
      ],
    },
    {
      id: 'inf.c-metodo-boccetta',
      text: 'La boccetta di miele e limone è tornata più piena di come era stata lasciata, con il tappo al contrario. È l’unica cosa che Ilde beveva senza guardarla.',
      concludes: 'method',
      paths: [
        ['fact.boccetta-rabboccata', 'fact.veleno-ritardato'],
        ['fact.rossetto-assente', 'fact.pastiglie-mancanti', 'fact.pastiglie-intervallo'],
      ],
    },
    {
      id: 'inf.c-metodo-eliminazione',
      text: 'Il bicchiere del leggio non è stato bevuto e le due pastiglie mancanti sono quelle dell’intervallo, contate dalla governante. Resta una cosa sola, e sta sulla mensola del camerino.',
      concludes: 'method',
      paths: [
        ['fact.boccetta-rabboccata', 'fact.ilde-seduta-due-volte'],
        ['fact.rossetto-assente', 'fact.veleno-ritardato'],
      ],
    },
    {
      id: 'inf.c-sequenza',
      text: 'Il miele viene prima dell’incisione, non dopo: alle 22:17 nel camerino, alle 22:23 davanti al microfono, alle 23:24 sul palco. Sessantasette minuti, come dice il prontuario.',
      concludes: 'sequence',
      paths: [
        ['fact.registratore-a-vuoto', 'fact.nastro-tagliato', 'fact.veleno-ritardato'],
        ['fact.boccetta-rabboccata', 'fact.ilde-seduta-due-volte', 'fact.veleno-ritardato'],
      ],
    },
    {
      id: 'inf.c-alibi-di-nastro',
      text: 'Tutta la serata è stata incisa, e per questo tutti hanno datato la serata sul nastro. Ma il nastro certifica la macchina, non l’uomo che le sta accanto.',
      concludes: 'support',
      paths: [['fact.registratore-a-vuoto', 'fact.serata-incisa']],
    },
    {
      id: 'inf.c-taglio-mirato',
      text: 'Quattro minuti tolti fra le 22:20 e le 22:24, e subito dopo, intatta, la nota che si incrina alle 22:32. Chi ha tagliato ha tenuto il difetto e buttato le parole.',
      concludes: 'support',
      paths: [['fact.nastro-tagliato', 'fact.voce-incrinata']],
    },
    {
      id: 'inf.c-ora-falsa',
      text: 'Fra il momento in cui il preparato viene preso e il momento in cui si vede passa più di un’ora: qualunque cosa sia successa sul palco alle 23:10 è successa troppo tardi per contare.',
      concludes: 'support',
      paths: [
        ['fact.veleno-ritardato', 'fact.rossetto-assente'],
        ['fact.veleno-ritardato', 'fact.ilde-seduta-due-volte'],
      ],
    },
    {
      id: 'inf.c-spartito-innocente',
      text: 'La copia nella cartella e il deposito a un nome solo raccontano una lite vecchia di tre anni fra un direttore d’orchestra e una cantante. Vecchia, e già perduta.',
      concludes: 'support',
      paths: [['fact.spartito-sostituito', 'fact.canzone-firmata-ilde']],
    },
    {
      id: 'inf.c-bar-innocente',
      text: 'I calici gemelli sul ripiano e il bicchiere posato sul leggio alle 22:14 sono cortesie di sala: il bar prepara a coppie e chi canta porta l’acqua a chi canta.',
      concludes: 'support',
      paths: [['fact.calici-gemelli', 'fact.delia-al-leggio']],
    },
  ],
  contradictions: [
    {
      id: 'contra.c-registratore',
      a: 'fact.registratore-a-vuoto',
      b: 'fact.dich-registratore-spento',
      text: 'Il contagiri segna dieci minuti di nastro consumati fra le 22:05 e le 22:15. Una macchina spenta non consuma nastro, e chi lo dice lo sa meglio di chiunque.',
      implicates: 'role.tecnico',
    },
    {
      id: 'contra.c-camerino',
      a: 'fact.camerino-chiuso',
      b: 'fact.dich-camerino-aperto',
      text: 'Il registro dà la chiave uno ritirata alle 20:35 e resa alle 21:40, e fra le due righe non c’è scritto niente. Chi ricorda una porta sempre aperta ricorda un’altra serata.',
      implicates: 'role.direttore',
    },
    {
      id: 'contra.c-corridoio',
      a: 'fact.corridoio-al-buio',
      b: 'fact.dich-corridoio-illuminato',
      text: 'La lampada di mezzo è saltata alle 22:00 e nessuno l’ha cambiata. Chi dice di aver visto bene in corridoio dopo quell’ora ha visto qualcos’altro.',
      implicates: 'role.fotografo',
    },
    {
      id: 'contra.c-bicchiere',
      a: 'fact.calice-lavato',
      b: 'fact.dich-bicchiere-intatto',
      text: 'Il calice del leggio era già lavato e capovolto sul panno alle 23:40. Non può essere rimasto dove Ilde lo aveva posato.',
      implicates: 'role.rivale',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Sala fino alle 21:30, poi al bar perché il brindisi lo dovevo fare io, poi ancora in sala. Alle 22:08 ho parlato al microfono e mi hanno sentito in centoventi.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1290, where: 'loc.sala-ballo', note: 'Tavolo d’onore, con la cartella dei contratti sotto il braccio.', hidden: false },
        { who: 'role.impresario', from: 1293, to: 1332, where: 'loc.bar', note: 'Prepara il brindisi e parla al microfono alle 22:08.', hidden: false },
        { who: 'role.impresario', from: 1335, to: 1404, where: 'loc.sala-ballo', note: 'In sala fino alla fine.', hidden: false },
      ],
      secretId: 'sec.contratto-strappato',
      objectiveId: 'goal.spostare-i-sospetti',
      exclusiveClueId: 'clue.contratto-incisione',
      declarations: [
        { key: 'verita', text: 'L’incisione di prova del secondo tempo l’ho chiesta io, per la casa discografica. Doveva cominciare alle 22:20 e non è cominciata alle 22:20.' },
        { key: 'omissione', text: 'Di contratti stasera non si è parlato. Le quattro facciate erano una faccenda sistemata da giorni e non riguardano questa sala.' },
        { key: 'bugia', text: 'Il bicchiere sul leggio è rimasto dove Ilde lo aveva posato fino a quando è arrivata la direzione. Guardavo il palco, ne sono certo.', asserts: 'fact.dich-bicchiere-intatto' },
      ],
      shareable: [
        'L’incisione di prova era fissata per le 22:20 e sul nastro, a quell’ora, c’è una giunta di carta gommata.',
        'Ilde beveva miele e limone prima di incidere, mai prima di cantare in sala. Diceva che in sala le impastava la voce.',
      ],
      hidden: [
        'Le stesse quattro facciate le avevo firmate con Delia il 20 febbraio, e quel contratto è ancora nella mia cartella.',
      ],
    },
    {
      roleId: 'role.maestro',
      declaredAlibi:
        'Podio dalle 20:30, un’acqua minerale al bar durante l’intervallo, podio fino all’ottava battuta. Un direttore d’orchestra sta dove lo vedono quattordici professori.',
      trueTimeline: [
        { who: 'role.maestro', from: 1200, to: 1300, where: 'loc.palco', note: 'Accorda, prova gli attacchi e dirige il primo tempo.', hidden: false },
        { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale in piedi, di spalle al banco.', hidden: false },
        { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Sul podio fino all’ottava battuta.', hidden: false },
      ],
      secretId: 'sec.paternita-valzer',
      objectiveId: 'goal.condividi-tre',
      exclusiveClueId: 'clue.lettera-chiusa',
      declarations: [
        { key: 'verita', text: 'Alle 22:32 la nota tenuta le è venuta male e ha voluto rifarla. In due stagioni le era capitato due volte, e mai due volte di seguito.' },
        { key: 'omissione', text: 'Il valzer è del Sessantasei. Come sia finito depositato a gennaio con un nome solo è una faccenda fra me e un ufficio di Roma.' },
        { key: 'bugia', text: 'La copia nella cartella l’ha fatta lei la settimana scorsa: me la mostrò il martedì, e scriveva bene, per essere una cantante.', asserts: 'fact.dich-copia-di-ilde' },
      ],
      shareable: [
        'L’incisione di prova non è cominciata alle 22:20: siamo scesi tutti con dieci minuti buoni di ritardo.',
        'Quando è entrata nello sgabuzzino ha detto una frase sul miele e ha riso. Sul nastro quella frase non c’è più.',
      ],
      hidden: [
        'La lettera dell’ufficio del diritto d’autore ce l’ho in tasca dal pomeriggio e non ho avuto il coraggio di dargliela.',
      ],
    },
    {
      roleId: 'role.rivale',
      declaredAlibi:
        'Al bar dalle 21:56 alle 22:12 come cliente, poi un momento sul palco a posare un bicchiere d’acqua sul leggio, poi al tavolo sette fino alla fine della serata.',
      trueTimeline: [
        { who: 'role.rivale', from: 1200, to: 1250, where: 'loc.camerini', note: 'Si trucca nel terzo camerino con la locandina allo specchio.', hidden: false },
        { who: 'role.rivale', from: 1253, to: 1310, where: 'loc.sala-ballo', note: 'Applaude il primo tempo dal fondo.', hidden: false },
        { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Al posto tre del banco, di spalle alla sala.', hidden: false },
        { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Posa un bicchiere d’acqua sul leggio del palco vuoto.', hidden: false },
        { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Tavolo sette, davanti a tutti.', hidden: false },
      ],
      secretId: 'sec.provino-disdetto',
      objectiveId: 'goal.quattro-domande',
      exclusiveClueId: 'clue.telegramma-disdetto',
      declarations: [
        { key: 'verita', text: 'Il bicchiere sul leggio l’ho portato io alle 22:14. Lo faccio da quando canto: l’acqua sul leggio non la porta mai nessuno.' },
        { key: 'omissione', text: 'La fascetta sulla locandina non l’ho messa io e non l’ho chiesta. Me ne sono accorta all’ingresso, come tutti gli altri.' },
        { key: 'bugia', text: 'In corridoio si vedeva benissimo per tutta la serata. Ci sono passata due volte e ho letto anche i numeri sulle porte.', asserts: 'fact.dich-corridoio-illuminato' },
      ],
      shareable: [
        'Chi divide un camerino con Ilde lo impara subito: la boccetta di miele la beveva a collo, senza guardare il livello.',
        'Il mio nome sulla locandina c’era stamattina alle undici. Alle sette di sera non c’era più.',
      ],
      hidden: [
        'Il provino di Roma me l’hanno disdetto il 27 e l’ho saputo da un telegramma che non era indirizzato a me.',
      ],
    },
    {
      roleId: 'role.tecnico',
      declaredAlibi:
        'Nello sgabuzzino dalle 20:00 alle 23:24, salvo sei minuti per riprendere un microfono a filo nel primo camerino. Il nastro gira e conta al posto mio: non serve credermi.',
      trueTimeline: [
        { who: 'role.tecnico', from: 1200, to: 1322, where: 'loc.registrazione', note: 'Monta le bobine e incide il primo tempo.', hidden: false },
        { who: 'role.tecnico', from: 1325, to: 1335, where: 'loc.camerini', note: 'Riprende il microfono a filo e rabbocca la boccetta sulla mensola.', hidden: true },
        { who: 'role.tecnico', from: 1338, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti.', hidden: false },
      ],
      secretId: 'sec.bobine-vendute',
      objectiveId: 'goal.custodire-il-segreto',
      exclusiveClueId: 'clue.piega-terza-pagina',
      declarations: [
        { key: 'verita', text: 'I quattro minuti li ho tagliati io. C’era un falso attacco e una parola che in sala non si dice: si taglia di sbieco e si giunta con la gommata.' },
        { key: 'omissione', text: 'Nell’armadietto tengo il materiale mio: bobine vecchie, roba di prova. Le date non tornano con il registro perché il registro lo tiene la direzione.' },
        { key: 'bugia', text: 'Fra la fine del primo tempo e l’incisione di prova il registratore è rimasto spento. Non c’era niente da incidere e il nastro costa caro.', asserts: 'fact.dich-registratore-spento' },
      ],
      shareable: [
        'Nella piega della terza pagina dello spartito c’è una polvere bianca che nel resto della cartella non si trova.',
        'Alle 22:32 la voce si incrina su una nota tenuta. Prima di quel punto, sul nastro, non c’è niente di storto.',
      ],
      hidden: [
        'Undici bobine copiate hanno già preso il treno per Genova, e su una c’è una conversazione che doveva essere distrutta nel Sessantasette.',
      ],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'Tre lastre in sala, due sul palco durante la pausa, una dietro le quinte. Fra le 21:43 e le 22:25 ero in corridoio a cambiare i telai, dove non do fastidio a nessuno.',
      trueTimeline: [
        { who: 'role.fotografo', from: 1200, to: 1270, where: 'loc.sala-ballo', note: 'Fotografa i tavoli e la contessa.', hidden: false },
        { who: 'role.fotografo', from: 1273, to: 1300, where: 'loc.palco', note: 'Lastre del primo tempo, dal lato degli ottoni.', hidden: false },
        { who: 'role.fotografo', from: 1303, to: 1345, where: 'loc.corridoio-artisti', note: 'Cambia i telai e brucia due lastre nel secchio.', hidden: true },
        { who: 'role.fotografo', from: 1348, to: 1404, where: 'loc.sala-ballo', note: 'Rientra in sala per il secondo tempo.', hidden: false },
      ],
      secretId: 'sec.lastre-compromesse',
      objectiveId: 'goal.proteggere-la-contessa',
      exclusiveClueId: 'clue.lastre-bruciate',
      declarations: [
        { key: 'verita', text: 'Dal corridoio, verso le 22:10, ho visto uscire qualcuno dal primo camerino con un microfono a filo in mano. Non ho fotografato: non era una faccia da rotocalco.' },
        { key: 'omissione', text: 'Nel secchio di zinco butto quello che non viene. Capita tre o quattro volte a serata e non lo segno da nessuna parte.' },
        { key: 'bugia', text: 'In corridoio ho lavorato con la luce del soffitto fino alle 22:25. Per cambiare un telaio ci vuole luce, altrimenti si vela tutto.', asserts: 'fact.dich-corridoio-illuminato' },
      ],
      shareable: [
        'Fra le 22:05 e le 22:15 nel corridoio è passato qualcuno che dallo sgabuzzino andava ai camerini, e poi è tornato indietro.',
        'Alle 22:14 sul palco vuoto c’era una figura in abito lungo che posava un bicchiere sul leggio.',
      ],
      hidden: [
        'Le due lastre bruciate non erano venute male: riprendevano una cosa che a Ilde faceva comodo far sparire.',
      ],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'Corridoio fino all’intervallo, camerino di Ilde dalle 21:44 alle 22:05, poi di nuovo in corridoio a rileggere gli appunti. Il pezzo era già battuto: mi mancava la chiusa.',
      trueTimeline: [
        { who: 'role.giornalista', from: 1200, to: 1260, where: 'loc.sala-ballo', note: 'Conta gli invitati e segna i nomi che contano.', hidden: false },
        { who: 'role.giornalista', from: 1263, to: 1300, where: 'loc.corridoio-artisti', note: 'Aspetta l’intervallo sulla sedia impagliata.', hidden: false },
        { who: 'role.giornalista', from: 1304, to: 1325, where: 'loc.camerini', note: 'Intervista Ilde e se ne va alle 22:05.', hidden: false },
        { who: 'role.giornalista', from: 1328, to: 1404, where: 'loc.corridoio-artisti', note: 'Rilegge gli appunti dove la lampada è saltata.', hidden: false },
      ],
      secretId: 'sec.articolo-gia-scritto',
      objectiveId: 'goal.trovare-il-nastro',
      exclusiveClueId: 'clue.bozza-articolo',
      declarations: [
        { key: 'verita', text: 'Quando sono uscita dal camerino, alle 22:05, la boccetta sulla mensola era mezza. L’ho notata perché le avevo appena chiesto che cosa contenesse.' },
        { key: 'omissione', text: 'Il pezzo l’ho fatto timbrare in portineria alle 21:00. È prassi per la chiusura del giornale, non un giudizio dato in anticipo.' },
        { key: 'bugia', text: 'Il camerino di Ilde è rimasto aperto tutta la sera. Ci sono entrata alle 21:44 spingendo la porta, senza chiedere niente a nessuno.', asserts: 'fact.dich-camerino-aperto' },
      ],
      shareable: [
        'Alle 22:05 la boccetta era mezza. Alle 23:40 era più piena, e il tappo era rimesso al contrario.',
        'Ilde prendeva due pastiglie all’intervallo e in nessun altro momento. Me lo ha detto lei, ridendo.',
      ],
      hidden: [
        'L’articolo me lo ha dettato quasi tutto l’ufficio stampa dell’albergo, tre giorni fa.',
      ],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'Al mio tavolo fino alle 22:10, al bar fino alle 22:30 con il direttore, poi di nuovo al tavolo. Di sotto non sono mai scesa: ho settant’anni e un bastone.',
      trueTimeline: [
        { who: 'role.contessa', from: 1200, to: 1330, where: 'loc.sala-ballo', note: 'Tavolo due, di fronte al palco, con la borsetta sulle ginocchia.', hidden: false },
        { who: 'role.contessa', from: 1333, to: 1350, where: 'loc.bar', note: 'Un vermut con il direttore, accanto alla cassa.', hidden: false },
        { who: 'role.contessa', from: 1353, to: 1404, where: 'loc.sala-ballo', note: 'Al tavolo fino all’ultimo valzer.', hidden: false },
      ],
      secretId: 'sec.assegno-a-ilde',
      objectiveId: 'goal.essere-creduto',
      exclusiveClueId: 'clue.matrice-assegno',
      declarations: [
        { key: 'verita', text: 'Nel Sessantasette pagai una cosa che non avrei dovuto pagare, e quella conversazione qualcuno la registrò. Ilde chiese per iscritto che il nastro fosse distrutto.' },
        { key: 'omissione', text: 'Che l’orchestra la paghi io non è un segreto. Che la paghi da tre stagioni preferirei restasse fra me e la direzione.' },
        { key: 'bugia', text: 'Il tecnico non si è mosso dal suo sgabuzzino: si sente, quando la porta di sughero si apre, e io quella porta non l’ho sentita.' },
      ],
      shareable: [
        'Una registrazione del Sessantasette avrebbe fatto danno a due persone, e una delle due sono io.',
        'Al brindisi Ilde non ha finito il calice: l’ho vista posarlo sul banco ancora mezzo pieno.',
      ],
      hidden: [
        'Sulla matrice dell’assegno ho scritto e cancellato due volte la parola «ultimo».',
      ],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Sedie, cucina fino alle 21:20, bar per il brindisi fino alle 22:00, poi in sala accanto alla porta. In questo albergo so sempre dove sono le cose e a che ora.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Riceve gli invitati e conta le sedie dorate.', hidden: false },
        { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Seconda portata e conto delle bottiglie.', hidden: false },
        { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa contare i calici da brindisi, che escono a coppie.', hidden: false },
        { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta fino alla fine.', hidden: false },
      ],
      secretId: 'sec.cassa-scoperta',
      objectiveId: 'goal.non-mostrare-il-registro',
      exclusiveClueId: 'clue.ricevuta-comodo',
      declarations: [
        { key: 'verita', text: 'La lettera del 24 febbraio l’ho firmata io, e in calce c’è scritto su segnalazione della signora Ferrante. Non è una riga che si scriva a cuor leggero.' },
        { key: 'omissione', text: 'Del registro delle incisioni risponde la direzione. Che nell’armadietto ci siano bobine che il registro non conosce lo scoprite voi, non io.' },
        { key: 'bugia', text: 'Il primo camerino resta aperto nelle sere di gala: gli artisti entrano ed escono e nessuno ha tempo di girare una chiave.', asserts: 'fact.dich-camerino-aperto' },
      ],
      shareable: [
        'Il rapporto con il tecnico del suono si chiude il 1° marzo, e a chiederlo non è stata la direzione.',
        'La chiave del primo camerino è stata ritirata alle 20:35 e riconsegnata alle 21:40. In mezzo, niente.',
      ],
      hidden: [
        'Centomila lire mancano dalla cassa e le ho coperte con una ricevuta per servizi che l’orchestra non ha reso.',
      ],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'orari',
        keywords: ['brindisi', 'ventidue', 'orario'],
        text: 'Il brindisi era per le 22:00 ed è partito alle 22:08, perché l’impresario aspettava che la signora salisse dal camerino. Otto minuti, signore: li ho contati sull’orologio della sala.',
        reveals: ['fact.brindisi-al-bar'],
        fromAct: 1,
      },
      {
        topic: 'chiavi',
        keywords: ['chiave', 'camerino', 'gancio', 'registro'],
        text: 'La chiave uno l’ha ritirata la signora alle 20:35 e me l’ha riportata alle 21:40. Fra quelle due righe il gancio è rimasto vuoto e io ero al bancone. Non mi sono spostato.',
        reveals: ['fact.camerino-chiuso'],
        fromAct: 1,
      },
      {
        topic: 'ospiti',
        keywords: ['bar', 'banco', 'posto tre', 'signorina'],
        text: 'Al posto tre del banco, quello d’angolo, c’è stata la signorina Marcantonio dalle 21:56 alle 22:12. Le ho portato io il chinotto, signore. Di spalle alla sala, sempre.',
        reveals: ['fact.delia-al-bar'],
        fromAct: 2,
      },
    ],
    'wit.coldani': [
      {
        topic: 'pulizie',
        keywords: ['pastiglie', 'intervallo', 'abitudine', 'voce'],
        text: 'Due pastiglie all’intervallo, mai prima. Diceva che prima le seccavano la gola e che dopo non servivano più. Le teneva nella piega dello spartito, dentro la latta.',
        reveals: ['fact.pastiglie-intervallo'],
        fromAct: 1,
      },
      {
        topic: 'biancheria',
        keywords: ['boccetta', 'miele', 'limone', 'tappo'],
        text: 'La boccetta la lasciava mezza, sempre. Quando sono andata a rifare il camerino era più piena di come l’aveva lasciata e il tappo era messo al contrario. Io i tappi li rimetto tutti nello stesso verso.',
        reveals: ['fact.boccetta-rabboccata'],
        fromAct: 2,
      },
      {
        topic: 'camere',
        keywords: ['rossetto', 'orlo', 'bicchiere'],
        text: 'Quel rossetto lì lascia il segno su tutto: sulla tazza, sul tovagliolo, sul microfono. Sul bicchiere del leggio non c’era niente. Io le tazze le guardo prima di lavarle.',
        reveals: ['fact.rossetto-assente'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'servizio',
        keywords: ['lavato', 'panno', 'leggio', 'bicchiere'],
        text: 'Il ragazzo del banco me l’ha detto subito, perché gli era parso strano: il bicchiere del leggio era già lavato e capovolto sul panno prima che qualcuno pensasse a cercarlo.',
        reveals: ['fact.calice-lavato'],
        fromAct: 1,
      },
      {
        topic: 'cena',
        keywords: ['seduta', 'acqua', 'corridoio', 'sipario'],
        text: 'Il cameriere di sala si segna tutto dietro la lista: 22:50 signora seduta in corridoio che chiede acqua, 23:05 seduta dietro il sipario che non vuole niente. Lui scrive, poverino, non giudica.',
        reveals: ['fact.ilde-seduta-due-volte'],
        fromAct: 2,
      },
      {
        topic: 'bicchieri',
        keywords: ['vassoio', 'calici', 'conta', 'porta'],
        text: 'Io i vassoi li conto come le uova. Ne è rientrato uno con un calice in più di quelli usciti, e la porta di servizio è rimasta accostata tutta la sera, che di lì passa mezzo albergo.',
        reveals: ['fact.vassoio-in-piu', 'fact.porta-servizio-aperta'],
        fromAct: 2,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'orari',
        keywords: ['intervallo', 'orchestra', 'venti minuti'],
        text: 'L’intervallo è cominciato alle 21:40 e la musica è ripresa alle 22:00 spaccate. Da qui sotto si sente quando l’orchestra tace: cambia il ronzio nella cuffia, e io lo sento prima della sala.',
        reveals: ['fact.intervallo-lungo'],
        fromAct: 1,
      },
      {
        topic: 'telefonate',
        keywords: ['genova', 'chiamata', 'centralino', 'undici minuti'],
        text: 'Alle 21:05 è partita una chiamata per Genova dal centralino di servizio. Undici minuti, e non l’ho addebitata a nessuna camera perché nessuno mi ha detto a quale. È partita da qui sotto, non dalle camere.',
        reveals: ['fact.telefonata-genova'],
        fromAct: 2,
      },
      {
        topic: 'messaggi',
        keywords: ['telegramma', 'provino', 'roma', 'disdetta'],
        text: 'Il telegramma del 27 l’ho battuto io in ricezione: provino di Roma annullato, seguirà lettera. Veniva dall’ufficio dell’impresario. La signorina è passata a ritirarlo alle sette meno un quarto.',
        reveals: ['fact.delia-provino'],
        fromAct: 2,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'corrente',
        keywords: ['lampada', 'corridoio', 'luce', 'saltata'],
        text: 'Seconda lampada del corridoio, saltata alle 22:00. Non l’ho cambiata: a quell’ora di lì non passa nessuno e la scala per il soffitto sta in cantina.',
        reveals: ['fact.corridoio-al-buio'],
        fromAct: 1,
      },
      {
        topic: 'manutenzione',
        keywords: ['contagiri', 'nastro', 'vuoto', 'registratore'],
        text: 'Il contagiri l’ho letto io quando sono sceso per la presa: dieci minuti di nastro consumati fra le 22:05 e le 22:15, e sopra non c’era musica. La macchina girava, lo sgabuzzino era vuoto.',
        reveals: ['fact.registratore-a-vuoto'],
        fromAct: 2,
      },
      {
        topic: 'quadro',
        keywords: ['giunta', 'taglio', 'bobina', 'testina'],
        text: 'Quando ho rimontato la testina il nastro era già giuntato con la carta gommata, a due terzi di bobina. Taglio di sbieco, fatto bene. Non è roba che si fa per sbaglio.',
        reveals: ['fact.nastro-tagliato'],
        fromAct: 2,
      },
    ],
  },
  falseReconstruction: {
    summary:
      'La versione da sostenere è quella della macchina: lo sgabuzzino non l’ho lasciato, salvo sei minuti per un microfono a filo, e il contagiri lo dimostra perché il nastro ha girato senza interruzioni dalle 20:00 alle 23:24. I quattro minuti tagliati erano un falso attacco: si taglia e si giunta, è il mestiere di chiunque incida. Chi aveva conti aperti con Ilde era il maestro: il valzer è del Sessantasei ed è depositato a gennaio con un nome solo, ha diretto tutta la sera con i guanti bianchi che non mette mai, e nella cartella verde c’è una copia scritta di sua mano, con la piega sporca di polvere bianca.',
    timeline: [
      { who: 'role.tecnico', from: 1200, to: 1327, where: 'loc.registrazione', note: 'Allo sgabuzzino senza interruzioni, con il nastro che gira.', hidden: false },
      { who: 'role.tecnico', from: 1330, to: 1333, where: 'loc.camerini', note: 'Sei minuti per riprendere il microfono a filo, non uno di più.', hidden: false },
      { who: 'role.tecnico', from: 1337, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e chiude la bobina.', hidden: false },
      { who: 'role.maestro', from: 1239, to: 1247, where: 'loc.camerini', note: 'Nel camerino, con la cartella verde aperta sul tavolino.', hidden: false },
    ],
    scapegoatRoleId: 'role.maestro',
  },
  texts: {
    reveal:
      'Tutti hanno letto la serata sulla bobina, perché la bobina era l’unica cosa che non poteva mentire. E infatti non ha mentito: ha taciuto in due punti. Il primo sono dieci minuti di nastro consumati fra le 22:05 e le 22:15 senza musica sopra, il ronzio di uno sgabuzzino vuoto con la macchina accesa. Il secondo sono quattro minuti tagliati di sbieco e rincollati con la carta gommata, fra le 22:20 e le 22:24: quelli in cui Ilde entra per l’incisione di prova e dice, ridendo, che stasera il miele è forte. Fra i due silenzi c’è un camerino aperto e una boccetta di miele e limone tornata più piena di come era stata lasciata, con il tappo rimesso al contrario.',
    explanation:
      'Ermanno Sivori incideva le serate dell’albergo da quattro anni e ne portava via una copia. Undici bobine hanno preso il treno per Genova, e una di quelle è del 1967: contiene una conversazione che Ilde aveva chiesto per iscritto di distruggere. Il 24 febbraio la direzione gli consegna la lettera di licenziamento, con effetto dal 1° marzo e, in calce, la riga che spiega tutto: su segnalazione della signora Ferrante. Dal 1° marzo l’armadietto di lamiera lo avrebbe aperto qualcun altro. Alle 22:02 lascia il registratore in moto e sale ai camerini con la scusa di un microfono a filo. Alle 22:17 Ilde beve due dita di miele e limone prima di incidere, come faceva sempre. Alle 22:23 è davanti al microfono; alle 22:32 la voce si incrina su una nota tenuta. Alle 23:24 si ferma all’ottava battuta. Sessantasette minuti: il prontuario del farmacista dice più di un’ora, e può metterci il doppio. Il taglio serviva a togliere l’unica frase in cui la vittima nomina la cosa che aveva bevuto, e la giunta è la firma di chi sa dove passa la lama.',
    victoryInnocents:
      'Il contagiri lo avete letto prima delle facce: dieci minuti di nastro e nessuna musica sopra. Sivori non ha alzato la voce. Ha chiesto solo che la bobina della serata non venisse rimessa in moto un’altra volta, e gliel’hanno concesso. La contessa ha guardato il tavolo, perché sapeva che cosa c’era sul nastro del Sessantasette.',
    victoryCulprit:
      'Il nome scritto sui foglietti è quello del maestro: i guanti bianchi, la copia dello spartito, il deposito a un nome solo. Sivori smonta le due macchine con la calma di sempre, avvolge la bobina e la mette nella scatola giusta. Il primo autobus arriva alle sei e trentacinque e l’armadietto di lamiera parte con lui.',
    defeat:
      'Il contagiri era lì, sulla macchina, e segnava dieci minuti di nastro consumati senza musica sopra. Era comprensibile non fermarsi: un nastro che gira sembra la prova che qualcuno lo sta guardando. È il contrario. Una macchina accesa dimostra soltanto che era accesa, e in quei dieci minuti la porta di sughero è rimasta chiusa su una stanza vuota.',
  },
};
