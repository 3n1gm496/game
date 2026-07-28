import type { VariantDef } from '@meridien/engine';
import { ALL_FACTS } from '../clues.js';

/**
 * Variante A — «Lo spartito».
 * Colpevole: Vittorio Lanzoni. Movente: la firma sull'ultimo valzer.
 * Metodo: le due pastiglie per la voce, nella piega della terza pagina.
 *
 * Il momento apparente sono le 23:10, il bicchiere sul leggio davanti a
 * centoventi persone. Il momento vero sono le 21:47, in un camerino chiuso a
 * chiave dove non c'era nessuno da un'ora e dove qualcuno era entrato alle
 * 20:39 con la seconda chiave. Fra i due momenti passano novantasette minuti.
 */

export const variantSpartito: VariantDef = {
  id: 'var.spartito',
  name: 'Lo spartito',
  tagline: 'Sei fogli di musica che nessuno ha guardato, e una piega che non era vuota.',
  culpritRoleId: 'role.maestro',
  motiveKey: 'diritti-canzone',
  methodKey: 'pastiglie-spartito',
  sequence: ['beat.accordo', 'beat.preparazione', 'beat.gesto', 'beat.copertura', 'beat.ultimo-valzer'],
  beatDetails: {
    'beat.accordo':
      'Una notte del 1966, su un tavolo di marmo: lui scrive, lei canta, si dividono tutto a voce. Il 14 gennaio 1969 il deposito porta un nome solo.',
    'beat.preparazione':
      'Una copia nuova dell’ultimo valzer, vergata in due sere, e due pastiglie rifatte a mano che nella latta non si distinguono dalle altre dieci.',
    'beat.gesto':
      'Alle 20:39 il camerino è chiuso e vuoto. La seconda chiave lo apre, la cartella verde cambia contenuto, alle 20:47 la porta è di nuovo chiusa.',
    'beat.copertura':
      'I guanti bianchi per tutta la serata, e nessuno che chieda perché. Alle 21:47 Ilde prende le sue due pastiglie e non se ne accorge nessuno, nemmeno lei.',
    'beat.ultimo-valzer':
      'Alle 23:10 Ilde alza il bicchiere davanti a tutti. Alle 23:24 si ferma all’ottava battuta e l’orchestra continua per quattro battute di troppo.',
  },
  facts: ALL_FACTS,
  timeline: [
    { who: 'victim', from: 1200, to: 1235, where: 'loc.camerini', note: 'Si veste e prova la voce. La chiave uno è al gancio del bancone.', hidden: false },
    { who: 'victim', from: 1238, to: 1255, where: 'loc.sala-ballo', note: 'Gira fra i tavoli, saluta la contessa, non beve niente.', hidden: false },
    { who: 'victim', from: 1258, to: 1300, where: 'loc.palco', note: 'Primo tempo. Presenta il valzer come «parole e musica mie».', hidden: false },
    { who: 'victim', from: 1303, to: 1320, where: 'loc.camerini', note: 'Intervallo. Prende due pastiglie dalla piega della terza pagina, alle 21:47.', hidden: true },
    { who: 'victim', from: 1324, to: 1332, where: 'loc.bar', note: 'Brindisi dei vent’anni. Ringrazia in due parole e scende.', hidden: false },
    { who: 'victim', from: 1340, to: 1365, where: 'loc.registrazione', note: 'Incisione di prova del secondo tempo. Alle 22:32 la voce si incrina e lei ripete.', hidden: false },
    { who: 'victim', from: 1369, to: 1370, where: 'loc.camerini', note: 'Passa a riprendere la boccetta e non la apre.', hidden: false },
    { who: 'victim', from: 1372, to: 1378, where: 'loc.corridoio-artisti', note: 'Si siede sulla sedia impagliata e chiede un bicchiere d’acqua.', hidden: false },
    { who: 'victim', from: 1381, to: 1404, where: 'loc.palco', note: 'Secondo tempo. Alle 23:10 alza il bicchiere del leggio, alle 23:24 si ferma.', hidden: false },
    { who: 'role.maestro', from: 1200, to: 1236, where: 'loc.palco', note: 'Accorda l’orchestra e prova gli attacchi del secondo tempo.', hidden: false },
    { who: 'role.maestro', from: 1239, to: 1247, where: 'loc.camerini', note: 'Apre con la chiave dell’orchestra e cambia i fogli nella cartella verde.', hidden: true },
    { who: 'role.maestro', from: 1251, to: 1300, where: 'loc.palco', note: 'Dirige il primo tempo con i guanti bianchi.', hidden: false },
    { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Beve un’acqua minerale in piedi, di spalle al banco.', hidden: false },
    { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Resta sul podio fino all’ottava battuta dell’ultimo valzer.', hidden: false },
    { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Al posto tre del banco, di spalle alla sala, per sedici minuti.', hidden: false },
    { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Sale sul palco vuoto e posa un bicchiere d’acqua sul leggio.', hidden: false },
    { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Al tavolo sette, dove la vedono tutti e nessuno la guarda.', hidden: false },
    { who: 'role.tecnico', from: 1200, to: 1324, where: 'loc.registrazione', note: 'Monta le bobine e lascia girare il nastro anche a vuoto.', hidden: false },
    { who: 'role.tecnico', from: 1327, to: 1333, where: 'loc.camerini', note: 'Va a riprendere il microfono a filo lasciato sullo specchio.', hidden: false },
    { who: 'role.tecnico', from: 1337, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti che non gli piacciono.', hidden: false },
    { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Conta le sedie dorate e riceve gli invitati all’ingresso.', hidden: false },
    { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Discute con il capocuoco la seconda portata e il conto delle bottiglie.', hidden: false },
    { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa preparare il brindisi dei vent’anni e conta i calici.', hidden: false },
    { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta, come fa sempre nelle sere di gala.', hidden: false },
    { who: 'role.giornalista', from: 1263, to: 1300, where: 'loc.corridoio-artisti', note: 'Aspetta l’intervallo seduta sulla sedia impagliata, con il taccuino chiuso.', hidden: false },
    { who: 'role.giornalista', from: 1304, to: 1340, where: 'loc.camerini', note: 'Intervista Ilde durante l’intervallo e la vede prendere due pastiglie.', hidden: false },
    { who: 'role.giornalista', from: 1343, to: 1404, where: 'loc.corridoio-artisti', note: 'Rilegge gli appunti in corridoio, dove la luce è saltata.', hidden: false },
  ],
  clueSetup: [
    { clueId: 'clue.spartito-copia', relevance: 'critico', act: 2, locationId: 'loc.camerini', hotspot: 'tavolino', puzzle: null },
    { clueId: 'clue.piega-terza-pagina', relevance: 'critico', act: 1, locationId: 'loc.camerini', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.deposito-diritti', relevance: 'critico', act: 2, locationId: 'loc.camerini', hotspot: 'borsetta', puzzle: null },
    { clueId: 'clue.annuncio-nastro', relevance: 'utile', act: 2, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.lettera-chiusa', relevance: 'critico', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'attaccapanni', puzzle: null },
    {
      clueId: 'clue.guanti-bianchi',
      relevance: 'critico',
      act: 2,
      locationId: 'loc.palco',
      hotspot: 'podio',
      puzzle: {
        kind: 'scelta',
        prompt: 'In due stagioni al Méridien, quante volte il maestro Lanzoni aveva diretto con i guanti?',
        options: ['mai', 'ogni sera di gala', 'solo nel Sessantotto'],
        answer: 'mai',
        hint: 'Chiedilo ai professori d’orchestra: se ne sono detti qualcosa fra loro, prima dell’attacco.',
      },
    },
    { clueId: 'clue.chiave-orchestra', relevance: 'critico', act: 1, locationId: 'loc.palco', hotspot: 'custodia-leggio', puzzle: null },
    {
      clueId: 'clue.registro-chiavi',
      relevance: 'critico',
      act: 1,
      locationId: 'loc.corridoio-artisti',
      hotspot: 'cabina-centralino',
      puzzle: {
        kind: 'orario',
        prompt: 'A che ora il registro dà per riconsegnata la chiave del primo camerino?',
        options: ['20:35', '21:40', '22:05'],
        answer: '21:40',
        hint: 'La riga sopra è quella del ritiro. Fra le due righe non c’è scritto niente.',
      },
    },
    { clueId: 'clue.astuccio-pastiglie', relevance: 'critico', act: 1, locationId: 'loc.camerini', hotspot: 'specchio', puzzle: null },
    { clueId: 'clue.abitudine-voce', relevance: 'utile', act: 1, locationId: 'loc.camerini', hotspot: 'governante', puzzle: null },
    { clueId: 'clue.calici-gemelli', relevance: 'falsa-pista', act: 1, locationId: 'loc.bar', hotspot: 'ripiano', puzzle: null },
    { clueId: 'clue.calice-lavato', relevance: 'utile', act: 1, locationId: 'loc.bar', hotspot: 'panno', puzzle: null },
    { clueId: 'clue.orlo-pulito', relevance: 'utile', act: 2, locationId: 'loc.bar', hotspot: 'lavello', puzzle: null },
    { clueId: 'clue.conto-del-bar', relevance: 'falsa-pista', act: 1, locationId: 'loc.bar', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.conta-vassoi', relevance: 'falsa-pista', act: 2, locationId: 'loc.cucina', hotspot: 'passavivande', puzzle: null },
    { clueId: 'clue.fotografia-leggio', relevance: 'falsa-pista', act: 2, locationId: 'loc.sala-ballo', hotspot: 'tavolo-fotografo', puzzle: null },
    { clueId: 'clue.locandina-fascetta', relevance: 'falsa-pista', act: 1, locationId: 'loc.sala-ballo', hotspot: 'ingresso', puzzle: null },
    { clueId: 'clue.telegramma-disdetto', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.bozza-articolo', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.contratto-incisione', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.giunta-nastro', relevance: 'utile', act: 2, locationId: 'loc.registrazione', hotspot: 'bobina', puzzle: null },
    { clueId: 'clue.riascolto-nastro', relevance: 'critico', act: 3, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.boccetta-livello', relevance: 'falsa-pista', act: 2, locationId: 'loc.camerini', hotspot: 'mensola', puzzle: null },
    { clueId: 'clue.contagiri', relevance: 'falsa-pista', act: 2, locationId: 'loc.registrazione', hotspot: 'contagiri', puzzle: null },
    { clueId: 'clue.armadietto-bobine', relevance: 'falsa-pista', act: 3, locationId: 'loc.registrazione', hotspot: 'armadietto', puzzle: null },
    { clueId: 'clue.nastro-vecchio', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.lettera-licenziamento', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.registro-telefonate', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'cabina-centralino', puzzle: null },
    { clueId: 'clue.lampada-saltata', relevance: 'contorno', act: 1, locationId: 'loc.corridoio-artisti', hotspot: 'lampada', puzzle: null },
    { clueId: 'clue.foglio-farmacista', relevance: 'critico', act: 2, locationId: 'loc.cucina', hotspot: 'armadietto-medicinali', puzzle: null },
    { clueId: 'clue.appunti-cameriere', relevance: 'utile', act: 2, locationId: 'loc.cucina', hotspot: 'lista-portate', puzzle: null },
    { clueId: 'clue.lastre-bruciate', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.matrice-assegno', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.ricevuta-comodo', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.a-culpability',
      text: 'Chi ha messo mano alla cartella verde è la stessa persona che ha copiato i fogli, e l’unica che poteva entrare in un camerino chiuso: il maestro Lanzoni.',
      concludes: 'culprit',
      paths: [
        ['fact.spartito-sostituito', 'fact.copista-lanzoni', 'fact.piega-polverosa'],
        ['fact.chiave-duplicata', 'fact.camerino-chiuso', 'fact.lanzoni-guanti'],
      ],
    },
    {
      id: 'inf.a-movente',
      text: 'Il valzer è depositato a nome di lei sola e lei lo annuncia come suo. Nella tasca del frac c’è la lettera dell’ufficio del diritto d’autore, ancora chiusa.',
      concludes: 'motive',
      paths: [
        ['fact.canzone-firmata-ilde', 'fact.annuncio-paternita'],
        ['fact.lanzoni-lettera', 'fact.copista-lanzoni'],
      ],
    },
    {
      id: 'inf.a-metodo',
      text: 'Due pastiglie mancano dall’astuccio, la piega che le conteneva è sporca di polvere bianca, e il preparato non dà segno prima di un’ora: non è stato il bicchiere.',
      concludes: 'method',
      paths: [
        ['fact.pastiglie-mancanti', 'fact.piega-polverosa', 'fact.veleno-ritardato'],
        ['fact.pastiglie-intervallo', 'fact.voce-incrinata', 'fact.ilde-seduta-due-volte'],
      ],
    },
    {
      id: 'inf.a-sequenza',
      text: 'Camerino chiuso fino alle 21:40, pastiglie all’intervallo, più di un’ora di attesa: il gesto sta alle 21:47 e l’ultimo valzer è solo il momento in cui si vede.',
      concludes: 'sequence',
      paths: [
        ['fact.camerino-chiuso', 'fact.pastiglie-intervallo', 'fact.veleno-ritardato'],
        ['fact.voce-incrinata', 'fact.ilde-seduta-due-volte', 'fact.veleno-ritardato'],
      ],
    },
    {
      id: 'inf.a-accesso',
      text: 'Se la chiave del bancone non si è mai mossa dal gancio e il camerino era chiuso, chi è entrato aveva la seconda chiave, quella data all’orchestra nel Sessantasette.',
      concludes: 'support',
      paths: [['fact.chiave-duplicata', 'fact.camerino-chiuso']],
    },
    {
      id: 'inf.a-mano',
      text: 'La copia nella cartella non è di Ilde e non è di un copista di mestiere: la china e le stanghette sono quelle delle parti d’orchestra.',
      concludes: 'support',
      paths: [['fact.copista-lanzoni', 'fact.spartito-sostituito']],
    },
    {
      id: 'inf.a-ora-falsa',
      text: 'Il bicchiere delle 23:10 non porta il segno del rossetto e il preparato non agisce in quattordici minuti: l’ora che tutti hanno visto non è l’ora del gesto.',
      concludes: 'support',
      paths: [
        ['fact.veleno-ritardato', 'fact.rossetto-assente'],
        ['fact.veleno-ritardato', 'fact.voce-incrinata'],
      ],
    },
    {
      id: 'inf.a-esitazione',
      text: 'La lettera dell’ufficio del diritto d’autore è stata portata in tasca tutta la sera e mai consegnata: qualcuno ha provato a farla finire con la carta bollata.',
      concludes: 'support',
      paths: [['fact.lanzoni-lettera']],
    },
    {
      id: 'inf.a-firma',
      text: 'I guanti bianchi non erano eleganza: chi maneggia una polvere finissima non se la vuole trovare sulle dita mentre dà gli attacchi.',
      concludes: 'support',
      paths: [['fact.lanzoni-guanti', 'fact.piega-polverosa']],
    },
    {
      id: 'inf.a-bar-innocente',
      text: 'I due calici gemelli e il vassoio con un pezzo in più si spiegano con il brindisi: il bar ne prepara sempre a coppie e stasera ne è tornato uno solo.',
      concludes: 'support',
      paths: [['fact.calici-gemelli', 'fact.vassoio-in-piu']],
    },
    {
      id: 'inf.a-nastro-innocente',
      text: 'Il taglio sul nastro e le bobine dell’armadietto raccontano un piccolo traffico privato, non una serata: quelle date sono tutte di serate finite bene.',
      concludes: 'support',
      paths: [['fact.nastro-tagliato', 'fact.copie-non-registrate']],
    },
  ],
  contradictions: [
    {
      id: 'contra.a-camerino',
      a: 'fact.camerino-chiuso',
      b: 'fact.dich-camerino-aperto',
      text: 'Il registro segna la chiave ritirata alle 20:35 e riconsegnata alle 21:40. Chi dice che il camerino è rimasto aperto sta smentendo il proprio bancone.',
      implicates: 'role.direttore',
    },
    {
      id: 'contra.a-copia',
      a: 'fact.copista-lanzoni',
      b: 'fact.dich-copia-di-ilde',
      text: 'La copia nella cartella non è scritta dalla stessa mano che annotava i respiri a matita. Chi la attribuisce a Ilde conosce la sua scrittura meglio di così.',
      implicates: 'role.maestro',
    },
    {
      id: 'contra.a-corridoio',
      a: 'fact.corridoio-al-buio',
      b: 'fact.dich-corridoio-illuminato',
      text: 'La lampada di mezzo è saltata alle 22:00 e non l’ha cambiata nessuno. Chi dice di aver visto bene in corridoio dopo quell’ora ha visto qualcos’altro.',
      implicates: 'role.fotografo',
    },
    {
      id: 'contra.a-bicchiere',
      a: 'fact.calice-lavato',
      b: 'fact.dich-bicchiere-intatto',
      text: 'Il calice del leggio era già lavato e capovolto sul panno alle 23:40. Non può essere rimasto dove Ilde l’aveva posato.',
      implicates: 'role.rivale',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Sono stato in sala tutta la serata, a parte un quarto d’ora al bar per far preparare il brindisi. Alle 22:08 ho parlato io al microfono: lo hanno sentito in centoventi.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1290, where: 'loc.sala-ballo', note: 'Tavolo d’onore, riceve chi conta e chi paga.', hidden: false },
        { who: 'role.impresario', from: 1293, to: 1310, where: 'loc.bar', note: 'Fa mettere da parte i calici per il brindisi.', hidden: false },
        { who: 'role.impresario', from: 1313, to: 1404, where: 'loc.sala-ballo', note: 'In sala fino alla fine, con la cartella sotto il braccio.', hidden: false },
      ],
      secretId: 'sec.contratto-strappato',
      objectiveId: 'goal.condividi-tre',
      exclusiveClueId: 'clue.contratto-incisione',
      declarations: [
        { key: 'verita', text: 'Il brindisi dei vent’anni l’ho chiesto io alla direzione, e l’ho chiesto per le 22:00. Sono partiti in ritardo di otto minuti.' },
        { key: 'omissione', text: 'Di contratti stasera non si è parlato. Le quattro facciate d’incisione erano una cosa già sistemata da giorni.' },
        { key: 'bugia', text: 'Il bicchiere sul leggio ce l’ha messo il servizio di sala, come tutte le sere. Nessuno lo ha più toccato dopo.', asserts: 'fact.dich-bicchiere-intatto' },
      ],
      shareable: [
        'Ilde aveva detto di sì il 25 febbraio. Prima di quella data il gala era una serata come le altre.',
        'Il brindisi era previsto per le 22:00 e si è fatto alle 22:08: otto minuti li ho aspettati io, in piedi.',
      ],
      hidden: [
        'Le stesse quattro facciate le avevo firmate con Delia il 20 febbraio, e quel contratto non l’ho ancora strappato.',
      ],
    },
    {
      roleId: 'role.maestro',
      declaredAlibi:
        'Dalle 20:30 non ho lasciato il podio se non per un’acqua minerale al bar durante l’intervallo. Un direttore d’orchestra sta dove lo vedono quattordici professori.',
      trueTimeline: [
        { who: 'role.maestro', from: 1200, to: 1236, where: 'loc.palco', note: 'Accorda l’orchestra e prova gli attacchi.', hidden: false },
        { who: 'role.maestro', from: 1239, to: 1247, where: 'loc.camerini', note: 'Entra con la chiave dell’orchestra e cambia i fogli nella cartella.', hidden: true },
        { who: 'role.maestro', from: 1251, to: 1300, where: 'loc.palco', note: 'Dirige il primo tempo con i guanti bianchi.', hidden: false },
        { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale in piedi, di spalle al banco.', hidden: false },
        { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Sul podio fino all’ottava battuta.', hidden: false },
      ],
      secretId: 'sec.paternita-valzer',
      objectiveId: 'goal.custodire-il-segreto',
      exclusiveClueId: 'clue.nastro-vecchio',
      declarations: [
        { key: 'verita', text: 'Al secondo tempo l’ho sentito, che la voce non teneva. Gliel’ho detto dietro il sipario e mi ha risposto di badare agli ottoni.' },
        { key: 'omissione', text: 'La cartella verde la porta il servizio di scena. Io guardo la mia partitura, che è un’altra cosa e sta sul leggio del podio.' },
        { key: 'bugia', text: 'La copia nella cartella l’ha fatta lei stessa la settimana scorsa: me la mostrò il martedì, e scriveva bene, per essere una cantante.', asserts: 'fact.dich-copia-di-ilde' },
      ],
      shareable: [
        'Il valzer è del Sessantasei. Chi dice che è di gennaio non ha mai visto la prima stesura.',
        'Alle 22:32, nell’incisione di prova, la nota tenuta le è venuta male. Le è capitato due volte in due stagioni.',
      ],
      hidden: [
        'La seconda chiave del camerino è in consegna all’orchestra dal Sessantasette e sta sotto la fodera della custodia del leggio.',
      ],
    },
    {
      roleId: 'role.rivale',
      declaredAlibi:
        'Ero al bar fino alle 22:12, poi sono salita un momento sul palco a portare un bicchiere d’acqua sul leggio, e dopo sono rimasta al tavolo sette fino alla fine.',
      trueTimeline: [
        { who: 'role.rivale', from: 1200, to: 1250, where: 'loc.camerini', note: 'Si trucca nel terzo camerino e non parla con nessuno.', hidden: false },
        { who: 'role.rivale', from: 1253, to: 1310, where: 'loc.sala-ballo', note: 'In sala, applaude il primo tempo dal fondo.', hidden: false },
        { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Al posto tre del banco, di spalle alla sala.', hidden: false },
        { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Posa un bicchiere d’acqua sul leggio del palco vuoto.', hidden: false },
        { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Tavolo sette, davanti a tutti.', hidden: false },
      ],
      secretId: 'sec.provino-disdetto',
      objectiveId: 'goal.spostare-i-sospetti',
      exclusiveClueId: 'clue.telegramma-disdetto',
      declarations: [
        { key: 'verita', text: 'Il bicchiere sul leggio l’ho portato io, alle 22:14. Ilde beveva solo acqua fra un tempo e l’altro e nessuno se ne ricordava mai.' },
        { key: 'omissione', text: 'La fascetta sulla locandina non l’ho messa io e non l’ho chiesta. Me ne sono accorta all’ingresso, come tutti gli altri.' },
        { key: 'bugia', text: 'In corridoio si vedeva benissimo per tutta la serata. Ci sono passata due volte e ho letto anche i numeri sulle porte.', asserts: 'fact.dich-corridoio-illuminato' },
      ],
      shareable: [
        'Alle 22:14 sul palco non c’era nessuno: l’orchestra era in pausa e il sipario tirato a metà.',
        'Il mio nome sulla locandina c’era stamattina alle undici. Alle sette di sera non c’era più.',
      ],
      hidden: [
        'Il provino di Roma me l’hanno disdetto il 27 e l’ho saputo da un telegramma che non era indirizzato a me.',
      ],
    },
    {
      roleId: 'role.tecnico',
      declaredAlibi:
        'Sono stato nello sgabuzzino dalle 20:00 alle 23:24, salvo sei minuti per riprendere un microfono a filo nel primo camerino. Il nastro gira e conta al posto mio.',
      trueTimeline: [
        { who: 'role.tecnico', from: 1200, to: 1324, where: 'loc.registrazione', note: 'Monta le bobine, lascia girare il nastro anche a vuoto.', hidden: false },
        { who: 'role.tecnico', from: 1327, to: 1333, where: 'loc.camerini', note: 'Riprende il microfono a filo lasciato sullo specchio.', hidden: false },
        { who: 'role.tecnico', from: 1337, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti.', hidden: false },
      ],
      secretId: 'sec.bobine-vendute',
      objectiveId: 'goal.trovare-il-nastro',
      exclusiveClueId: 'clue.lettera-licenziamento',
      declarations: [
        { key: 'verita', text: 'I quattro minuti li ho tagliati io. C’era un falso attacco e una parola che non si dice in sala: si taglia e si giunta, è il mestiere.' },
        { key: 'omissione', text: 'Nell’armadietto tengo il materiale mio. Bobine vecchie, roba di prova, niente che riguardi questa serata.' },
        { key: 'bugia', text: 'Fra la fine del primo tempo e l’incisione di prova il registratore è rimasto spento. Non c’era niente da incidere e il nastro costa.', asserts: 'fact.dich-registratore-spento' },
      ],
      shareable: [
        'Alle 22:32 la voce si incrina su una nota tenuta. Prima di quel punto, sul nastro, non c’è niente di storto.',
        'Il microfono a filo del camerino l’ho ripreso io fra le 22:07 e le 22:13. È l’unica volta che sono uscito.',
      ],
      hidden: [
        'Undici bobine copiate hanno già preso il treno per Genova, e su una c’è una conversazione che non doveva esistere.',
      ],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'Tre lastre in sala, due sul palco durante la pausa, una dietro le quinte. Fra le 21:43 e le 22:25 ero in corridoio a cambiare i telai, dove non dà fastidio a nessuno.',
      trueTimeline: [
        { who: 'role.fotografo', from: 1200, to: 1270, where: 'loc.sala-ballo', note: 'Fotografa i tavoli e la contessa, come da accordo con l’albergo.', hidden: false },
        { who: 'role.fotografo', from: 1273, to: 1300, where: 'loc.palco', note: 'Lastre del primo tempo, dal lato degli ottoni.', hidden: false },
        { who: 'role.fotografo', from: 1303, to: 1345, where: 'loc.corridoio-artisti', note: 'Cambia i telai e brucia due lastre nel secchio di zinco.', hidden: true },
        { who: 'role.fotografo', from: 1348, to: 1404, where: 'loc.sala-ballo', note: 'Rientra in sala per il secondo tempo.', hidden: false },
      ],
      secretId: 'sec.lastre-compromesse',
      objectiveId: 'goal.proteggere-la-contessa',
      exclusiveClueId: 'clue.lastre-bruciate',
      declarations: [
        { key: 'verita', text: 'La lastra numero sette è del palco vuoto, alle 22:14. L’orologio del fondale si legge senza lente, se la si guarda controluce.' },
        { key: 'omissione', text: 'Nel secchio di zinco ci butto quello che non viene. Capita tre o quattro volte a serata e non lo scrivo da nessuna parte.' },
        { key: 'bugia', text: 'In corridoio ho lavorato con la luce del soffitto fino alle 22:25. Per cambiare un telaio ci vuole luce, altrimenti si vela tutto.', asserts: 'fact.dich-corridoio-illuminato' },
      ],
      shareable: [
        'Alle 22:14 sul palco c’era una figura in abito lungo, di spalle, che posava un bicchiere sul leggio.',
        'Il maestro ha diretto tutta la sera con i guanti. Nelle mie lastre del Sessantotto non li ha mai.',
      ],
      hidden: [
        'Le due lastre bruciate non erano venute male: riprendevano una cosa che a Ilde avrebbe fatto comodo far sparire.',
      ],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'Ho aspettato l’intervallo in corridoio e poi sono stata nel camerino di Ilde dalle 21:44 alle 22:20. Il pezzo era già battuto: mi mancava solo la chiusa.',
      trueTimeline: [
        { who: 'role.giornalista', from: 1200, to: 1260, where: 'loc.sala-ballo', note: 'Conta gli invitati e segna i nomi che contano.', hidden: false },
        { who: 'role.giornalista', from: 1263, to: 1300, where: 'loc.corridoio-artisti', note: 'Aspetta l’intervallo seduta sulla sedia impagliata.', hidden: false },
        { who: 'role.giornalista', from: 1304, to: 1340, where: 'loc.camerini', note: 'Intervista Ilde e la vede prendere due pastiglie.', hidden: false },
        { who: 'role.giornalista', from: 1343, to: 1404, where: 'loc.corridoio-artisti', note: 'Rilegge gli appunti dove la lampada è saltata.', hidden: false },
      ],
      secretId: 'sec.articolo-gia-scritto',
      objectiveId: 'goal.quattro-domande',
      exclusiveClueId: 'clue.bozza-articolo',
      declarations: [
        { key: 'verita', text: 'All’intervallo l’ho vista prendere due pastiglie dalla piega dello spartito. Ha detto che era l’unica superstizione che si concedeva.' },
        { key: 'omissione', text: 'Il pezzo l’ho consegnato in portineria alle 21:00 per il timbro. È una prassi, non un giudizio anticipato.' },
        { key: 'bugia', text: 'Il camerino di Ilde è rimasto aperto tutta la sera. Ci sono entrata alle 21:44 spingendo la porta, senza chiedere niente a nessuno.', asserts: 'fact.dich-camerino-aperto' },
      ],
      shareable: [
        'Ilde prendeva due pastiglie all’intervallo e mai in un altro momento. Me lo ha detto lei, ridendo.',
        'Alle 22:20 il corridoio era già mezzo al buio: la seconda lampada non c’era più.',
      ],
      hidden: [
        'L’articolo me lo ha dettato quasi tutto l’ufficio stampa dell’albergo, tre giorni fa.',
      ],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'Sono stata al mio tavolo fino alle 22:10, poi al bar fino alle 22:30 con il direttore, e di nuovo al tavolo. Non sono mai scesa di sotto: ho settant’anni e un bastone.',
      trueTimeline: [
        { who: 'role.contessa', from: 1200, to: 1330, where: 'loc.sala-ballo', note: 'Tavolo due, di fronte al palco, con la borsetta sulle ginocchia.', hidden: false },
        { who: 'role.contessa', from: 1333, to: 1350, where: 'loc.bar', note: 'Un vermut con il direttore, in piedi accanto alla cassa.', hidden: false },
        { who: 'role.contessa', from: 1353, to: 1404, where: 'loc.sala-ballo', note: 'Al tavolo fino all’ultimo valzer.', hidden: false },
      ],
      secretId: 'sec.assegno-a-ilde',
      objectiveId: 'goal.essere-creduto',
      exclusiveClueId: 'clue.matrice-assegno',
      declarations: [
        { key: 'verita', text: 'Ho scritto un assegno per Ilde stasera e non gliel’ho ancora dato. Sarebbe stato l’ultimo e volevo dirglielo di persona.' },
        { key: 'omissione', text: 'Che l’orchestra la paghi io non è un segreto. Che la paghi da tre stagioni preferirei restasse fra me e la direzione.' },
        { key: 'bugia', text: 'Il maestro non si è mosso dal podio dalle 20:30 in avanti. L’ho guardato tutta la sera: dirige come si dirigeva una volta.' },
      ],
      shareable: [
        'Il valzer nuovo l’ho sentito provare in ottobre, e non l’ha provato lei per prima.',
        'Alle 22:14 sul palco c’era qualcuno. Da dove ero seduta si vedeva solo l’abito lungo.',
      ],
      hidden: [
        'Nella matrice dell’assegno ho scritto e cancellato due volte la parola «ultimo».',
      ],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Ho contato le sedie, poi cucina fino alle 21:20, poi bar per il brindisi, poi in sala accanto alla porta. In questo albergo so sempre dove sono e a che ora.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Riceve gli invitati e conta le sedie dorate.', hidden: false },
        { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Seconda portata e conto delle bottiglie con il capocuoco.', hidden: false },
        { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa preparare il brindisi e conta i calici a coppie.', hidden: false },
        { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta fino alla fine.', hidden: false },
      ],
      secretId: 'sec.cassa-scoperta',
      objectiveId: 'goal.non-mostrare-il-registro',
      exclusiveClueId: 'clue.ricevuta-comodo',
      declarations: [
        { key: 'verita', text: 'I calici da brindisi si preparano a coppie e si contano due volte. Stasera ne sono usciti sei e ne sono rientrati cinque.' },
        { key: 'omissione', text: 'Del registro delle chiavi risponde il bancone. Se qualcuno vuole leggerlo, chieda al portiere di notte e aspetti il suo comodo.' },
        { key: 'bugia', text: 'Il primo camerino resta aperto nelle sere di gala: gli artisti entrano ed escono e nessuno ha tempo di girare una chiave.', asserts: 'fact.dich-camerino-aperto' },
      ],
      shareable: [
        'La chiave del primo camerino è stata ritirata alle 20:35 e riconsegnata alle 21:40. In mezzo, niente.',
        'La porta di servizio fra bar e cucina è rimasta accostata: succede ogni sera di gala e ogni sera lo scrivo.',
      ],
      hidden: [
        'Centomila lire mancano dalla cassa e le ho coperte con una ricevuta per servizi che l’orchestra non ha reso.',
      ],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'chiavi',
        keywords: ['chiave', 'camerino', 'gancio', 'bancone'],
        text: 'La chiave uno l’ha ritirata la signora alle 20:35 e me l’ha riportata alle 21:40. In mezzo il gancio è rimasto vuoto e io ero al bancone, signore. Non mi sono spostato.',
        reveals: ['fact.camerino-chiuso'],
        fromAct: 1,
      },
      {
        topic: 'registro',
        keywords: ['registro', 'seconda chiave', 'duplicato', 'orchestra'],
        text: 'Di chiavi del primo camerino l’albergo ne aveva due. La seconda fu data all’orchestra nel Sessantasette per la prova generale e non è più tornata al bancone. Io lo scrissi, signore. Nessuno lo lesse.',
        reveals: ['fact.chiave-duplicata'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['brindisi', 'orario', 'ventidue'],
        text: 'Il brindisi era per le 22:00. È partito alle 22:08, perché l’impresario aspettava che la signora salisse dal camerino. Otto minuti, signore: li ho contati sull’orologio della sala.',
        reveals: ['fact.brindisi-al-bar'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'camere',
        keywords: ['pastiglie', 'abitudine', 'voce', 'intervallo'],
        text: 'Due pastiglie all’intervallo, mai prima. Diceva che prima le seccavano la gola e che dopo non servivano più. Le teneva nella piega dello spartito, dentro la latta.',
        reveals: ['fact.pastiglie-intervallo'],
        fromAct: 1,
      },
      {
        topic: 'rumori',
        keywords: ['corridoio', 'buio', 'lampada'],
        text: 'Dalle dieci in poi in corridoio si camminava a memoria. La lampada di mezzo era saltata e nessuno l’ha cambiata. Io le camere le faccio con la luce, non al buio.',
        reveals: ['fact.corridoio-al-buio'],
        fromAct: 1,
      },
      {
        topic: 'biancheria',
        keywords: ['boccetta', 'miele', 'limone', 'mensola'],
        text: 'La boccetta la lasciava mezza. Quando sono andata a rifare il camerino era più piena di come l’aveva lasciata e il tappo era messo al contrario. Io i tappi li rimetto sempre nello stesso verso.',
        reveals: ['fact.boccetta-rabboccata'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'bicchieri',
        keywords: ['vassoio', 'calici', 'conta', 'porta'],
        text: 'Io i vassoi li conto come le uova. Ne è rientrato uno con un calice in più di quelli usciti, e la porta di servizio è rimasta accostata tutta la sera, che di lì passa mezzo albergo.',
        reveals: ['fact.vassoio-in-piu', 'fact.porta-servizio-aperta'],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['lavato', 'bicchiere', 'leggio', 'panno'],
        text: 'Il ragazzo del banco me l’ha detto subito: il bicchiere del leggio era già lavato e capovolto sul panno prima che qualcuno pensasse a cercarlo. Da noi si lava tutto, ma non così di corsa.',
        reveals: ['fact.calice-lavato'],
        fromAct: 1,
      },
      {
        topic: 'cucina',
        keywords: ['seduta', 'acqua', 'corridoio', 'sipario'],
        text: 'Il cameriere di sala se l’è segnato dietro la lista: alle 22:50 la signora seduta in corridoio che chiedeva acqua, alle 23:05 seduta dietro il sipario che non voleva niente. Lui scrive tutto, poverino.',
        reveals: ['fact.ilde-seduta-due-volte'],
        fromAct: 2,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'telefonate',
        keywords: ['telefono', 'genova', 'centralino', 'chiamata'],
        text: 'Alle 21:05 è partita una chiamata per Genova dal centralino di servizio. Undici minuti. Non l’ho addebitata a nessuna camera perché nessuno mi ha detto a quale. I numeri me li ricordo, le facce no.',
        reveals: ['fact.telefonata-genova'],
        fromAct: 2,
      },
      {
        topic: 'messaggi',
        keywords: ['telegramma', 'provino', 'roma', 'disdetta'],
        text: 'Il telegramma del 27 l’ho battuto io in ricezione: provino di Roma annullato, seguirà lettera. Veniva dall’ufficio dell’impresario. La signorina Marcantonio è passata a ritirarlo alle sette meno un quarto.',
        reveals: ['fact.delia-provino'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['intervallo', 'orchestra', 'venti minuti'],
        text: 'L’intervallo è cominciato alle 21:40 e la musica è ripresa alle 22:00 spaccate. Da qui sotto si sente quando l’orchestra tace: cambia il ronzio nella cuffia.',
        reveals: ['fact.intervallo-lungo'],
        fromAct: 1,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'corrente',
        keywords: ['lampada', 'corridoio', 'luce', 'saltata'],
        text: 'Seconda lampada del corridoio, saltata alle 22:00. Non l’ho cambiata. A quell’ora di lì non passa nessuno e la scala per il soffitto sta in cantina.',
        reveals: ['fact.corridoio-al-buio'],
        fromAct: 1,
      },
      {
        topic: 'manutenzione',
        keywords: ['registratore', 'contagiri', 'nastro', 'vuoto'],
        text: 'Il contagiri l’ho letto io quando sono sceso per la presa: dieci minuti di nastro consumati fra le 22:05 e le 22:15, e sopra non c’era musica. Il nastro girava e basta.',
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
      'Il maestro racconta una serata semplice: podio dalle 20:30, primo tempo, un’acqua minerale al bar, podio di nuovo. Il bicchiere sul leggio lo ha portato Delia Marcantonio alle 22:14, davanti a una lastra fotografica che lo prova; il preparato, dice, ha agito quando tutti hanno visto. Della cartella verde risponde il servizio di scena, e la chiave dell’orchestra è chiusa in una custodia che aprono in quattordici. Se qualcuno ha toccato qualcosa, lo ha toccato al bar, dove i calici gemelli non li aveva ordinati nessuno.',
    timeline: [
      { who: 'role.maestro', from: 1200, to: 1300, where: 'loc.palco', note: 'Podio senza interruzioni dalla prova al primo tempo.', hidden: false },
      { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale durante l’intervallo, davanti a testimoni.', hidden: false },
      { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Podio fino all’ultimo valzer.', hidden: false },
      { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Posa il bicchiere sul leggio: la lastra sette lo mostra.', hidden: false },
    ],
    scapegoatRoleId: 'role.rivale',
  },
  texts: {
    reveal:
      'La cartella verde è sempre stata lì, aperta sul tavolino, e nessuno l’ha guardata perché la musica si guarda solo quando si suona. Dentro non c’era lo spartito di Ilde: c’era una copia scritta due mesi fa, con la china delle parti d’orchestra e le stanghette chiuse come le chiude un solo uomo in questa sala. Nella piega della terza pagina, dove Ilde teneva la latta delle pastiglie, è rimasta una polvere bianca finissima. Alle 21:47, all’intervallo, ne ha prese due come ogni sera. Il resto è stato solo attesa: novantasette minuti, un brindisi, un’incisione di prova, una nota tenuta che alle 22:32 si è incrinata. Alle 23:10 ha alzato un bicchiere che non c’entrava niente.',
    explanation:
      'Alle 20:35 la chiave del primo camerino torna al gancio e il camerino resta chiuso fino alle 21:40: il registro non ha righe in mezzo. Ma le chiavi sono due, e la seconda è in consegna all’orchestra dal 1967, sotto la fodera della custodia del leggio. Alle 20:39 Vittorio Lanzoni scende, apre, sostituisce i fogli e risale in otto minuti. Dirige tutta la serata con i guanti bianchi, che in due stagioni non aveva mai messo. Il movente sta in due carte: la ricevuta di deposito del 14 gennaio, con un nome solo, e una lettera dell’ufficio del diritto d’autore che gli è rimasta in tasca tutta la sera, chiusa. Aveva provato per via legale, e la via legale gli aveva risposto di no. Il bicchiere sul leggio, il calice lavato in fretta, i due calici gemelli al bar: erano tutte cose vere, e nessuna riguardava il gesto. Il preparato non dà segno prima di un’ora. Bastava contare all’indietro.',
    victoryInnocents:
      'Avete contato all’indietro, e all’indietro il conto tornava soltanto in un punto. Lanzoni non ha alzato la voce: ha detto che la prima stesura era del Sessantasei e che il suo nome, su quella carta, non c’è mai stato. La contessa ha guardato il tavolo. L’orchestra è rimasta seduta, perché nessuno le aveva detto di alzarsi.',
    victoryCulprit:
      'Il nome scritto sui foglietti è un altro. Il maestro ringrazia con un piccolo inchino, come si ringrazia dopo un pezzo difficile, e chiede che l’ultimo valzer non venga più eseguito in questa sala. Nessuno gli chiede perché. Il primo autobus arriva alle sei e trentacinque.',
    defeat:
      'Il bicchiere delle 23:10 lo avete guardato tutti, e per tutta la notte. Era comprensibile: centoventi persone lo hanno visto, e ciò che vedono in centoventi sembra sempre più vero. Il foglio del farmacista diceva che il preparato non dà segno prima di un’ora, ed era in cucina, in un armadietto che nessuno ha aperto. Con quella riga, l’ora giusta sarebbe stata un’altra.',
  },
};
