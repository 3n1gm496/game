import type { VariantDef } from '@meridien/engine';
import { ALL_FACTS } from '../clues.js';

/**
 * Variante B — «Il bicchiere scambiato».
 * Colpevole: Delia Marcantonio. Movente: il nome coperto sulla locandina.
 * Metodo: il calice del brindisi, servito da lei e poi rimesso a posto.
 *
 * Il momento apparente sono le 23:10, davanti a centoventi persone. Il momento
 * vero sono le 22:08, davanti a una trentina di invitati che guardavano
 * l'impresario parlare. Fra i due momenti passano settantasei minuti, e in
 * mezzo c'è un bicchiere posato sul leggio che non c'entra niente.
 */

export const variantBicchiere: VariantDef = {
  id: 'var.bicchiere-scambiato',
  name: 'Il bicchiere scambiato',
  tagline: 'Due calici uguali, un brindisi solo e un conto del bar che non torna.',
  culpritRoleId: 'role.rivale',
  motiveKey: 'nome-cancellato',
  methodKey: 'bicchiere-sostituito',
  sequence: ['beat.accordo', 'beat.preparazione', 'beat.gesto', 'beat.ultimo-valzer', 'beat.copertura'],
  beatDetails: {
    'beat.accordo':
      'Quattro facciate d’incisione firmate il 20 febbraio con un nome, promesse il 25 a un altro. Il 27 il provino di Roma viene disdetto senza avvisare nessuno.',
    'beat.preparazione':
      'Due calici identici sul ripiano del bar, piede segnato a smeriglio, che sul conto della serata non compaiono perché nessuno li ha ordinati.',
    'beat.gesto':
      'Alle 22:08 il brindisi dei vent’anni. Fra i due calici gemelli ne parte uno solo verso il palco, e a portarlo è chi era al posto tre del banco.',
    'beat.ultimo-valzer':
      'Alle 23:10 Ilde alza il bicchiere del leggio, quello posato alle 22:14, e lo posa senza berne. Alle 23:24 si ferma all’ottava battuta.',
    'beat.copertura':
      'Alle 23:30 sul panno del bar ci sono due calici capovolti e asciutti. Uno non serviva a niente. L’altro serviva a tutto, e la fretta era per quello.',
  },
  facts: ALL_FACTS,
  timeline: [
    { who: 'victim', from: 1200, to: 1235, where: 'loc.camerini', note: 'Si veste e prova la voce. La chiave uno è al gancio del bancone.', hidden: false },
    { who: 'victim', from: 1238, to: 1255, where: 'loc.sala-ballo', note: 'Gira fra i tavoli e non accetta niente da bere.', hidden: false },
    { who: 'victim', from: 1258, to: 1300, where: 'loc.palco', note: 'Primo tempo. Presenta il valzer come «parole e musica mie».', hidden: false },
    { who: 'victim', from: 1303, to: 1320, where: 'loc.camerini', note: 'Intervallo. Prende due pastiglie, come tutte le sere da vent’anni.', hidden: false },
    { who: 'victim', from: 1324, to: 1332, where: 'loc.bar', note: 'Brindisi dei vent’anni. Alle 22:08 accetta il calice che le porgono e beve.', hidden: true },
    { who: 'victim', from: 1340, to: 1365, where: 'loc.registrazione', note: 'Incisione di prova. Alle 22:32 la voce si incrina e lei ripete la battuta.', hidden: false },
    { who: 'victim', from: 1369, to: 1370, where: 'loc.camerini', note: 'Passa a riprendere lo scialle e non si siede.', hidden: false },
    { who: 'victim', from: 1372, to: 1378, where: 'loc.corridoio-artisti', note: 'Si siede sulla sedia impagliata e chiede un bicchiere d’acqua.', hidden: false },
    { who: 'victim', from: 1381, to: 1404, where: 'loc.palco', note: 'Secondo tempo. Alle 23:10 alza il bicchiere del leggio e lo posa senza berne.', hidden: false },
    { who: 'role.rivale', from: 1200, to: 1250, where: 'loc.camerini', note: 'Si trucca nel terzo camerino con la locandina appoggiata allo specchio.', hidden: false },
    { who: 'role.rivale', from: 1253, to: 1310, where: 'loc.sala-ballo', note: 'Applaude il primo tempo dal fondo della sala.', hidden: false },
    { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Al posto tre del banco. Prepara due calici gemelli e ne porge uno alle 22:08.', hidden: true },
    { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Posa sul leggio un bicchiere d’acqua che non serve a niente.', hidden: false },
    { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Tavolo sette, dove la vedono tutti e nessuno la guarda.', hidden: false },
    { who: 'role.rivale', from: 1406, to: 1409, where: 'loc.palco', note: 'Nella confusione raccoglie dal leggio il bicchiere e lo porta via.', hidden: true },
    { who: 'role.rivale', from: 1411, to: 1420, where: 'loc.bar', note: 'Lava e capovolge sul panno due calici, e ne fa sparire uno nel vassoio.', hidden: true },
    { who: 'role.maestro', from: 1200, to: 1236, where: 'loc.palco', note: 'Accorda l’orchestra e prova gli attacchi del secondo tempo.', hidden: false },
    { who: 'role.maestro', from: 1239, to: 1300, where: 'loc.palco', note: 'Dirige il primo tempo con i guanti bianchi, per via di un taglio al pollice.', hidden: false },
    { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale in piedi, di spalle al banco, durante l’intervallo.', hidden: false },
    { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Sul podio fino all’ottava battuta dell’ultimo valzer.', hidden: false },
    { who: 'role.impresario', from: 1200, to: 1290, where: 'loc.sala-ballo', note: 'Tavolo d’onore, con la cartella dei contratti sotto il braccio.', hidden: false },
    { who: 'role.impresario', from: 1293, to: 1332, where: 'loc.bar', note: 'Fa preparare il brindisi e alle 22:08 parla al microfono del bar.', hidden: false },
    { who: 'role.impresario', from: 1335, to: 1404, where: 'loc.sala-ballo', note: 'In sala fino alla fine, a raccogliere complimenti che non lo riguardano.', hidden: false },
    { who: 'role.tecnico', from: 1200, to: 1324, where: 'loc.registrazione', note: 'Monta le bobine e lascia girare il nastro anche a vuoto.', hidden: false },
    { who: 'role.tecnico', from: 1327, to: 1333, where: 'loc.camerini', note: 'Va a riprendere il microfono a filo lasciato sullo specchio.', hidden: false },
    { who: 'role.tecnico', from: 1337, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti che non gli piacciono.', hidden: false },
    { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Conta le sedie dorate e riceve gli invitati.', hidden: false },
    { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Seconda portata e conto delle bottiglie con il capocuoco.', hidden: false },
    { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa contare i calici da brindisi: escono a coppie, come sempre.', hidden: false },
    { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta fino alla fine.', hidden: false },
  ],
  clueSetup: [
    { clueId: 'clue.calici-gemelli', relevance: 'critico', act: 1, locationId: 'loc.bar', hotspot: 'ripiano', puzzle: null },
    {
      clueId: 'clue.fotografia-leggio',
      relevance: 'critico',
      act: 2,
      locationId: 'loc.sala-ballo',
      hotspot: 'tavolo-fotografo',
      puzzle: {
        kind: 'orario',
        prompt: 'Che ora segna l’orologio del fondale sulla lastra numero sette?',
        options: ['21:44', '22:14', '23:10'],
        answer: '22:14',
        hint: 'Guarda la lastra controluce: le lancette si leggono meglio del viso.',
      },
    },
    { clueId: 'clue.conto-del-bar', relevance: 'critico', act: 1, locationId: 'loc.bar', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.orlo-pulito', relevance: 'critico', act: 2, locationId: 'loc.bar', hotspot: 'lavello', puzzle: null },
    { clueId: 'clue.calice-lavato', relevance: 'critico', act: 1, locationId: 'loc.bar', hotspot: 'panno', puzzle: null },
    { clueId: 'clue.locandina-fascetta', relevance: 'critico', act: 2, locationId: 'loc.sala-ballo', hotspot: 'ingresso', puzzle: null },
    { clueId: 'clue.telegramma-disdetto', relevance: 'critico', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'cabina-centralino', puzzle: null },
    { clueId: 'clue.contratto-incisione', relevance: 'utile', act: 2, locationId: 'loc.sala-ballo', hotspot: 'cartella-impresario', puzzle: null },
    { clueId: 'clue.bozza-articolo', relevance: 'utile', act: 2, locationId: 'loc.sala-ballo', hotspot: 'tavolo-stampa', puzzle: null },
    {
      clueId: 'clue.conta-vassoi',
      relevance: 'critico',
      act: 2,
      locationId: 'loc.cucina',
      hotspot: 'passavivande',
      puzzle: {
        kind: 'confronto',
        prompt: 'Quanti calici sono rientrati in cucina rispetto a quelli usciti?',
        options: ['uno in meno', 'lo stesso numero', 'uno in più'],
        answer: 'uno in più',
        hint: 'Il capocuoco conta i vassoi come conta le uova, e la conta la fa due volte.',
      },
    },
    { clueId: 'clue.foglio-farmacista', relevance: 'critico', act: 2, locationId: 'loc.cucina', hotspot: 'armadietto-medicinali', puzzle: null },
    { clueId: 'clue.giunta-nastro', relevance: 'utile', act: 2, locationId: 'loc.registrazione', hotspot: 'bobina', puzzle: null },
    { clueId: 'clue.riascolto-nastro', relevance: 'utile', act: 3, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.abitudine-voce', relevance: 'contorno', act: 1, locationId: 'loc.camerini', hotspot: 'governante', puzzle: null },
    { clueId: 'clue.lampada-saltata', relevance: 'contorno', act: 1, locationId: 'loc.corridoio-artisti', hotspot: 'lampada', puzzle: null },
    { clueId: 'clue.appunti-cameriere', relevance: 'contorno', act: 2, locationId: 'loc.cucina', hotspot: 'lista-portate', puzzle: null },
    { clueId: 'clue.deposito-diritti', relevance: 'contorno', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.lettera-chiusa', relevance: 'contorno', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.astuccio-pastiglie', relevance: 'contorno', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.registro-telefonate', relevance: 'contorno', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.spartito-copia', relevance: 'falsa-pista', act: 1, locationId: 'loc.camerini', hotspot: 'tavolino', puzzle: null },
    { clueId: 'clue.piega-terza-pagina', relevance: 'falsa-pista', act: 2, locationId: 'loc.camerini', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.annuncio-nastro', relevance: 'falsa-pista', act: 3, locationId: 'loc.registrazione', hotspot: 'registratore', puzzle: null },
    { clueId: 'clue.guanti-bianchi', relevance: 'falsa-pista', act: 1, locationId: 'loc.palco', hotspot: 'podio', puzzle: null },
    { clueId: 'clue.chiave-orchestra', relevance: 'falsa-pista', act: 2, locationId: 'loc.palco', hotspot: 'custodia-leggio', puzzle: null },
    { clueId: 'clue.registro-chiavi', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio-artisti', hotspot: 'cabina-centralino', puzzle: null },
    { clueId: 'clue.boccetta-livello', relevance: 'falsa-pista', act: 1, locationId: 'loc.camerini', hotspot: 'mensola', puzzle: null },
    { clueId: 'clue.contagiri', relevance: 'falsa-pista', act: 3, locationId: 'loc.registrazione', hotspot: 'contagiri', puzzle: null },
    { clueId: 'clue.armadietto-bobine', relevance: 'falsa-pista', act: 2, locationId: 'loc.registrazione', hotspot: 'armadietto', puzzle: null },
    { clueId: 'clue.lettera-licenziamento', relevance: 'falsa-pista', act: 3, locationId: 'loc.registrazione', hotspot: 'giacca', puzzle: null },
    { clueId: 'clue.nastro-vecchio', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.lastre-bruciate', relevance: 'falsa-pista', act: 3, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.matrice-assegno', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
    { clueId: 'clue.ricevuta-comodo', relevance: 'falsa-pista', act: 2, locationId: null, hotspot: null, puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.b-culpability',
      text: 'I due calici gemelli non li ha ordinati nessuno e chi stava al posto tre del banco è la stessa persona che alle 22:14 saliva su un palco vuoto: Delia Marcantonio.',
      concludes: 'culprit',
      paths: [
        ['fact.calici-gemelli', 'fact.delia-al-leggio'],
        ['fact.delia-al-bar', 'fact.rossetto-assente', 'fact.calice-lavato'],
      ],
    },
    {
      id: 'inf.b-movente',
      text: 'Un nome coperto da una fascetta il pomeriggio stesso, un provino disdetto il giorno prima, quattro facciate d’incisione che cambiano intestazione: la serata era già stata tolta a qualcuno.',
      concludes: 'motive',
      paths: [
        ['fact.locandina-coperta', 'fact.delia-provino'],
        ['fact.contratto-altra-voce', 'fact.articolo-scritto'],
      ],
    },
    {
      id: 'inf.b-metodo',
      text: 'Il bicchiere del leggio non porta rossetto: Ilde lo ha alzato e posato senza berne. Ciò che ha bevuto lo ha bevuto al brindisi, da uno dei due calici gemelli.',
      concludes: 'method',
      paths: [
        ['fact.calici-gemelli', 'fact.rossetto-assente', 'fact.veleno-ritardato'],
        ['fact.calice-lavato', 'fact.vassoio-in-piu', 'fact.voce-incrinata'],
      ],
    },
    {
      id: 'inf.b-sequenza',
      text: 'Brindisi alle 22:08, voce incrinata alle 22:32, ultimo valzer alle 23:24: settantasei minuti, che è esattamente quanto serve al preparato per farsi vedere.',
      concludes: 'sequence',
      paths: [
        ['fact.veleno-ritardato', 'fact.delia-al-bar', 'fact.voce-incrinata'],
        ['fact.veleno-ritardato', 'fact.ilde-seduta-due-volte', 'fact.rossetto-assente'],
      ],
    },
    {
      id: 'inf.b-scambio',
      text: 'Centoventi persone hanno visto un bicchiere alzato alle 23:10 e nessuna ha visto se veniva bevuto. L’orlo netto risponde: non è stato bevuto.',
      concludes: 'support',
      paths: [['fact.rossetto-assente', 'fact.bicchiere-sul-leggio']],
    },
    {
      id: 'inf.b-secondo-calice',
      text: 'Il calice in più tornato in cucina è passato dalla porta di servizio, che è rimasta accostata tutta la sera: dal bar alla cucina si arriva senza attraversare la sala.',
      concludes: 'support',
      paths: [['fact.vassoio-in-piu', 'fact.porta-servizio-aperta']],
    },
    {
      id: 'inf.b-ora-falsa',
      text: 'Fra il gesto e l’effetto passa più di un’ora: qualunque cosa sia successa sul palco alle 23:10 è successa troppo tardi per contare.',
      concludes: 'support',
      paths: [
        ['fact.veleno-ritardato', 'fact.voce-incrinata'],
        ['fact.veleno-ritardato', 'fact.ilde-seduta-due-volte'],
      ],
    },
    {
      id: 'inf.b-esitazione',
      text: 'Di calici gemelli ne sono stati preparati due e uno è rimasto sul ripiano fino alla fine, pieno. Chi li ha messi lì ha tenuto aperta una via d’uscita per un’ora.',
      concludes: 'support',
      paths: [['fact.calici-gemelli']],
    },
    {
      id: 'inf.b-firma',
      text: 'Alle 22:14 un bicchiere viene posato su un leggio dove nessuno lo aveva chiesto, e alle 23:30 lo stesso bicchiere è già lavato: la premura è la firma.',
      concludes: 'support',
      paths: [['fact.delia-al-leggio', 'fact.calice-lavato']],
    },
    {
      id: 'inf.b-spartito-innocente',
      text: 'La copia nella cartella e il deposito a un nome solo raccontano una lite vecchia di tre anni fra un direttore d’orchestra e una cantante. Vecchia, e già perduta.',
      concludes: 'support',
      paths: [['fact.spartito-sostituito', 'fact.canzone-firmata-ilde']],
    },
    {
      id: 'inf.b-nastro-innocente',
      text: 'Il taglio sul nastro e i dieci minuti girati a vuoto sono il mestiere di chi incide: si taglia un falso attacco, si lascia correre la macchina per non perdere l’avvio.',
      concludes: 'support',
      paths: [['fact.nastro-tagliato', 'fact.registratore-a-vuoto']],
    },
  ],
  contradictions: [
    {
      id: 'contra.b-bicchiere',
      a: 'fact.calice-lavato',
      b: 'fact.dich-bicchiere-intatto',
      text: 'Il calice del leggio era già lavato e capovolto sul panno alle 23:40. Chi lo dà per intatto sta descrivendo un bicchiere che non esiste più.',
      implicates: 'role.rivale',
    },
    {
      id: 'contra.b-registratore',
      a: 'fact.registratore-a-vuoto',
      b: 'fact.dich-registratore-spento',
      text: 'Il contagiri segna dieci minuti di nastro consumati fra le 22:05 e le 22:15. Una macchina spenta non consuma nastro.',
      implicates: 'role.tecnico',
    },
    {
      id: 'contra.b-camerino',
      a: 'fact.camerino-chiuso',
      b: 'fact.dich-camerino-aperto',
      text: 'Il registro dà la chiave uno ritirata alle 20:35 e resa alle 21:40. Chi ricorda una porta sempre aperta ricorda un’altra serata.',
      implicates: 'role.direttore',
    },
    {
      id: 'contra.b-copia',
      a: 'fact.copista-lanzoni',
      b: 'fact.dich-copia-di-ilde',
      text: 'La copia nella cartella è vergata con la china delle parti d’orchestra. Attribuirla a Ilde vuol dire non aver mai visto le sue annotazioni a matita.',
      implicates: 'role.giornalista',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Al bar dalle 21:33 alle 22:12, perché il brindisi lo dovevo fare io. Ho parlato due minuti al microfono e ho alzato il calice come tutti gli altri, davanti a trenta persone.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1290, where: 'loc.sala-ballo', note: 'Tavolo d’onore, con la cartella dei contratti sotto il braccio.', hidden: false },
        { who: 'role.impresario', from: 1293, to: 1332, where: 'loc.bar', note: 'Prepara il brindisi e parla al microfono alle 22:08.', hidden: false },
        { who: 'role.impresario', from: 1335, to: 1404, where: 'loc.sala-ballo', note: 'In sala fino alla fine.', hidden: false },
      ],
      secretId: 'sec.contratto-strappato',
      objectiveId: 'goal.essere-creduto',
      exclusiveClueId: 'clue.deposito-diritti',
      declarations: [
        { key: 'verita', text: 'Il calice a Ilde non gliel’ho porto io. Avevo il microfono in una mano e i fogli nell’altra: mi hanno passato il mio già pieno.' },
        { key: 'omissione', text: 'Le quattro facciate erano una faccenda chiusa. Chi le incideva lo sapevano in tre e nessuno dei tre ne ha parlato stasera.' },
        { key: 'bugia', text: 'Il bicchiere del leggio è rimasto dove Ilde lo aveva posato fino a quando è arrivata la direzione. Ne sono certo: guardavo il palco.', asserts: 'fact.dich-bicchiere-intatto' },
      ],
      shareable: [
        'Il brindisi è partito alle 22:08 e Ilde ha bevuto. L’ho vista posare il calice sul banco, non riportarlo giù.',
        'Al bar, sul ripiano, c’erano due calici uguali che nessuno aveva ordinato. Li ho notati perché erano fuori posto.',
      ],
      hidden: [
        'Le stesse facciate le avevo firmate con Delia il 20 febbraio, e quel contratto è ancora nella mia cartella.',
      ],
    },
    {
      roleId: 'role.maestro',
      declaredAlibi:
        'Podio dalle 20:30, un’acqua minerale al bar durante l’intervallo, podio fino alla fine. I guanti li ho messi per un taglio al pollice che mi sono fatto lunedì.',
      trueTimeline: [
        { who: 'role.maestro', from: 1200, to: 1236, where: 'loc.palco', note: 'Accorda l’orchestra e prova gli attacchi.', hidden: false },
        { who: 'role.maestro', from: 1239, to: 1300, where: 'loc.palco', note: 'Dirige il primo tempo con i guanti bianchi.', hidden: false },
        { who: 'role.maestro', from: 1303, to: 1318, where: 'loc.bar', note: 'Acqua minerale in piedi, di spalle al banco.', hidden: false },
        { who: 'role.maestro', from: 1321, to: 1404, where: 'loc.palco', note: 'Sul podio fino all’ottava battuta.', hidden: false },
      ],
      secretId: 'sec.paternita-valzer',
      objectiveId: 'goal.condividi-tre',
      exclusiveClueId: 'clue.lettera-chiusa',
      declarations: [
        { key: 'verita', text: 'Alle 22:14 sul leggio è comparso un bicchiere che io non avevo chiesto. Alla ripresa l’ho spostato di venti centimetri per vedere la partitura.' },
        { key: 'omissione', text: 'Il valzer è del Sessantasei. Come sia finito depositato a gennaio con un nome solo è una faccenda fra me e un ufficio di Roma.' },
        { key: 'bugia', text: 'Durante l’intervallo sono rimasto in buca a rivedere gli attacchi. Al bar ci sono passato dopo, quando la sala era già piena.' },
      ],
      shareable: [
        'Il bicchiere sul leggio è comparso alle 22:14, quando il palco era vuoto e l’orchestra in pausa.',
        'Alle 22:32, nell’incisione di prova, la nota tenuta le è venuta male e lei ha voluto rifarla.',
      ],
      hidden: [
        'La lettera dell’ufficio del diritto d’autore ce l’ho in tasca dal pomeriggio e non ho avuto il coraggio di dargliela.',
      ],
    },
    {
      roleId: 'role.rivale',
      declaredAlibi:
        'Al bar dalle 21:56 alle 22:12 come cliente, poi un momento sul palco per posare un bicchiere d’acqua sul leggio, poi al tavolo sette fino alla fine. Non mi sono più alzata.',
      trueTimeline: [
        { who: 'role.rivale', from: 1200, to: 1250, where: 'loc.camerini', note: 'Si trucca con la locandina appoggiata allo specchio.', hidden: false },
        { who: 'role.rivale', from: 1253, to: 1310, where: 'loc.sala-ballo', note: 'Applaude il primo tempo dal fondo.', hidden: false },
        { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Prepara due calici gemelli e ne porge uno alle 22:08.', hidden: true },
        { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Posa sul leggio un bicchiere che non serve a niente.', hidden: false },
        { who: 'role.rivale', from: 1338, to: 1404, where: 'loc.sala-ballo', note: 'Tavolo sette, davanti a tutti.', hidden: false },
        { who: 'role.rivale', from: 1406, to: 1409, where: 'loc.palco', note: 'Raccoglie il bicchiere dal leggio nella confusione.', hidden: true },
        { who: 'role.rivale', from: 1411, to: 1420, where: 'loc.bar', note: 'Lava due calici e ne fa sparire uno nel vassoio della cucina.', hidden: true },
      ],
      secretId: 'sec.provino-disdetto',
      objectiveId: 'goal.custodire-il-segreto',
      exclusiveClueId: 'clue.astuccio-pastiglie',
      declarations: [
        { key: 'verita', text: 'Il bicchiere sul leggio l’ho portato io alle 22:14. Lo faccio da quando canto: l’acqua sul leggio non la porta mai nessuno.' },
        { key: 'omissione', text: 'Al banco ho ordinato un chinotto e l’ho pagato. Se sul ripiano c’erano dei calici già pronti, non erano roba mia.' },
        { key: 'bugia', text: 'Dopo le 23:24 al bar non ci sono più tornata. Sono rimasta al tavolo sette finché la direzione non ci ha fatti alzare tutti.', asserts: 'fact.dich-bicchiere-intatto' },
      ],
      shareable: [
        'Il mio nome sulla locandina c’era stamattina alle undici e alle sette di sera era sotto una fascetta.',
        'Ilde all’intervallo prendeva due pastiglie. Lo sapevano tutti quelli che hanno diviso un camerino con lei.',
      ],
      hidden: [
        'I due calici sul ripiano li ho preparati io, e uno l’ho lasciato lì pieno per un’ora prima di decidere.',
      ],
    },
    {
      roleId: 'role.tecnico',
      declaredAlibi:
        'Nello sgabuzzino dalle 20:00 alle 23:24, salvo sei minuti per riprendere un microfono a filo nel primo camerino. Il contagiri dice quanto nastro ho consumato, non serve credermi.',
      trueTimeline: [
        { who: 'role.tecnico', from: 1200, to: 1324, where: 'loc.registrazione', note: 'Monta le bobine e lascia girare il nastro anche a vuoto.', hidden: false },
        { who: 'role.tecnico', from: 1327, to: 1333, where: 'loc.camerini', note: 'Riprende il microfono a filo lasciato sullo specchio.', hidden: false },
        { who: 'role.tecnico', from: 1337, to: 1404, where: 'loc.registrazione', note: 'Incide il secondo tempo e taglia quattro minuti.', hidden: false },
      ],
      secretId: 'sec.bobine-vendute',
      objectiveId: 'goal.non-mostrare-il-registro',
      exclusiveClueId: 'clue.nastro-vecchio',
      declarations: [
        { key: 'verita', text: 'I quattro minuti li ho tagliati io: un falso attacco e una parola che in sala non si dice. Si taglia di sbieco e si giunta con la gommata.' },
        { key: 'omissione', text: 'Le bobine dell’armadietto sono materiale mio, di prova. Le date non corrispondono al registro perché il registro lo tiene la direzione.' },
        { key: 'bugia', text: 'Fra la fine del primo tempo e l’incisione di prova il registratore è rimasto spento: non c’era niente da incidere e il nastro costa caro.', asserts: 'fact.dich-registratore-spento' },
      ],
      shareable: [
        'Alle 22:32 la voce si incrina su una nota tenuta, e prima di quel punto sul nastro non c’è niente di storto.',
        'La bobina della serata l’ho lasciata montata. Chi l’ha portata su in sala non sono stato io.',
      ],
      hidden: [
        'Undici bobine copiate hanno già preso il treno per Genova e una di quelle non doveva uscire da qui.',
      ],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'Tre lastre in sala, due sul palco durante la pausa, una dietro le quinte. Fra le 21:43 e le 22:25 ero in corridoio a cambiare i telai, con la luce che c’era.',
      trueTimeline: [
        { who: 'role.fotografo', from: 1200, to: 1270, where: 'loc.sala-ballo', note: 'Fotografa i tavoli e la contessa.', hidden: false },
        { who: 'role.fotografo', from: 1273, to: 1300, where: 'loc.palco', note: 'Lastre del primo tempo, dal lato degli ottoni.', hidden: false },
        { who: 'role.fotografo', from: 1303, to: 1345, where: 'loc.corridoio-artisti', note: 'Cambia i telai e brucia due lastre nel secchio di zinco.', hidden: true },
        { who: 'role.fotografo', from: 1348, to: 1404, where: 'loc.sala-ballo', note: 'Rientra in sala per il secondo tempo.', hidden: false },
      ],
      secretId: 'sec.lastre-compromesse',
      objectiveId: 'goal.quattro-domande',
      exclusiveClueId: 'clue.lastre-bruciate',
      declarations: [
        { key: 'verita', text: 'La lastra numero sette è del palco vuoto alle 22:14: una figura in abito lungo, di spalle, che posa un bicchiere sul leggio.' },
        { key: 'omissione', text: 'Nel secchio di zinco butto quello che non viene. Capita tre o quattro volte a serata e non lo segno da nessuna parte.' },
        { key: 'bugia', text: 'In corridoio la luce del soffitto ha retto fino a mezzanotte. Per cambiare un telaio ci vuole luce, altrimenti si vela tutto.', asserts: 'fact.dich-corridoio-illuminato' },
      ],
      shareable: [
        'Alle 22:14 sul palco vuoto c’era una figura in abito lungo che posava un bicchiere sul leggio.',
        'Al bar, sul ripiano, i calici gemelli li ho fotografati per sbaglio nello sfondo della lastra quattro.',
      ],
      hidden: [
        'Le due lastre bruciate non erano venute male: riprendevano una cosa che a Ilde faceva comodo far sparire.',
      ],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'Corridoio fino all’intervallo, camerino di Ilde dalle 21:44 alle 22:20, poi di nuovo in corridoio a rileggere gli appunti. Al bar non ci sono stata: non bevo quando lavoro.',
      trueTimeline: [
        { who: 'role.giornalista', from: 1200, to: 1260, where: 'loc.sala-ballo', note: 'Conta gli invitati e segna i nomi che contano.', hidden: false },
        { who: 'role.giornalista', from: 1263, to: 1300, where: 'loc.corridoio-artisti', note: 'Aspetta l’intervallo sulla sedia impagliata.', hidden: false },
        { who: 'role.giornalista', from: 1304, to: 1340, where: 'loc.camerini', note: 'Intervista Ilde e le chiede della locandina.', hidden: false },
        { who: 'role.giornalista', from: 1343, to: 1404, where: 'loc.corridoio-artisti', note: 'Rilegge gli appunti al buio.', hidden: false },
      ],
      secretId: 'sec.articolo-gia-scritto',
      objectiveId: 'goal.spostare-i-sospetti',
      exclusiveClueId: 'clue.registro-telefonate',
      declarations: [
        { key: 'verita', text: 'Ho chiesto io a Ilde della fascetta sulla locandina. Mi ha risposto che di quelle cose si occupa l’impresario e ha cambiato discorso.' },
        { key: 'omissione', text: 'Il pezzo l’ho fatto timbrare in portineria alle 21:00. È prassi per la chiusura del giornale, non un giudizio anticipato.' },
        { key: 'bugia', text: 'La copia dell’ultimo valzer nella cartella l’ha scritta lei: gliel’ho vista in mano nel camerino, ancora con l’inchiostro fresco.', asserts: 'fact.dich-copia-di-ilde' },
      ],
      shareable: [
        'Alle 22:20 il corridoio era già mezzo al buio: la seconda lampada non c’era più.',
        'Nel camerino, all’intervallo, Ilde ha preso due pastiglie e ha detto che era la sua unica superstizione.',
      ],
      hidden: [
        'L’articolo me lo ha dettato quasi tutto l’ufficio stampa dell’albergo, tre giorni fa.',
      ],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'Al mio tavolo fino alle 22:10, al bar fino alle 22:30 con il direttore, poi di nuovo al tavolo. Al brindisi sono arrivata in ritardo: con un bastone non si corre.',
      trueTimeline: [
        { who: 'role.contessa', from: 1200, to: 1330, where: 'loc.sala-ballo', note: 'Tavolo due, di fronte al palco.', hidden: false },
        { who: 'role.contessa', from: 1333, to: 1350, where: 'loc.bar', note: 'Un vermut con il direttore, accanto alla cassa.', hidden: false },
        { who: 'role.contessa', from: 1353, to: 1404, where: 'loc.sala-ballo', note: 'Al tavolo fino all’ultimo valzer.', hidden: false },
      ],
      secretId: 'sec.assegno-a-ilde',
      objectiveId: 'goal.trovare-il-nastro',
      exclusiveClueId: 'clue.matrice-assegno',
      declarations: [
        { key: 'verita', text: 'Quando sono arrivata al banco, sul ripiano c’era ancora un calice gemello pieno. L’ho notato perché è un cristallo che conosco.' },
        { key: 'omissione', text: 'Ho scritto un assegno per Ilde stasera. A chi vada consegnato adesso è una questione che riguarda i notai, non voi.' },
        { key: 'bugia', text: 'La signorina Marcantonio è rimasta al tavolo sette dalle 22:16 in avanti. L’avevo di fronte e non si è mai alzata.' },
      ],
      shareable: [
        'Al brindisi Ilde ha bevuto: l’ho vista posare il calice sul banco con il segno del rossetto sull’orlo.',
        'Al bar sul ripiano c’erano due calici uguali e nessuno li aveva ordinati.',
      ],
      hidden: [
        'Sulla matrice dell’assegno ho scritto e cancellato due volte la parola «ultimo».',
      ],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Sedie, cucina fino alle 21:20, bar per il brindisi fino alle 22:00, poi in sala accanto alla porta. I calici da brindisi li ho fatti contare due volte, come sempre.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1245, where: 'loc.sala-ballo', note: 'Riceve gli invitati e conta le sedie dorate.', hidden: false },
        { who: 'role.direttore', from: 1249, to: 1280, where: 'loc.cucina', note: 'Seconda portata e conto delle bottiglie.', hidden: false },
        { who: 'role.direttore', from: 1284, to: 1320, where: 'loc.bar', note: 'Fa contare i calici da brindisi, che escono a coppie.', hidden: false },
        { who: 'role.direttore', from: 1323, to: 1404, where: 'loc.sala-ballo', note: 'In piedi accanto alla porta fino alla fine.', hidden: false },
      ],
      secretId: 'sec.cassa-scoperta',
      objectiveId: 'goal.proteggere-la-contessa',
      exclusiveClueId: 'clue.ricevuta-comodo',
      declarations: [
        { key: 'verita', text: 'Dal bar sono usciti sei calici da brindisi e ne sono rientrati cinque. Il sesto è finito in cucina dentro un vassoio, e in cucina non ci va.' },
        { key: 'omissione', text: 'La porta di servizio fra bar e cucina resta accostata ogni sera di gala. Lo scrivo ogni volta e ogni volta nessuno la chiude.' },
        { key: 'bugia', text: 'Il primo camerino resta aperto nelle sere di gala: gli artisti entrano ed escono e nessuno ha tempo di girare una chiave.', asserts: 'fact.dich-camerino-aperto' },
      ],
      shareable: [
        'Il conto del bar dà tutte le consumazioni delle 21:56 alle 22:12 battute al posto tre del banco.',
        'Il bicchiere del leggio è stato lavato prima che qualcuno pensasse a cercarlo. Non l’ho ordinato io.',
      ],
      hidden: [
        'Centomila lire mancano dalla cassa e le ho coperte con una ricevuta per servizi mai resi.',
      ],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'ospiti',
        keywords: ['bar', 'banco', 'posto tre', 'signorina'],
        text: 'Al posto tre del banco, quello d’angolo, c’è stata la signorina Marcantonio dalle 21:56 alle 22:12. Le ho portato io il chinotto, signore. Di spalle alla sala, sempre.',
        reveals: ['fact.delia-al-bar'],
        fromAct: 1,
      },
      {
        topic: 'orari',
        keywords: ['brindisi', 'ventidue', 'orario'],
        text: 'Il brindisi era per le 22:00 ed è partito alle 22:08. L’impresario ha parlato due minuti e poi hanno alzato tutti qualcosa. Otto minuti di ritardo, signore: li ho contati.',
        reveals: ['fact.brindisi-al-bar'],
        fromAct: 1,
      },
      {
        topic: 'chiavi',
        keywords: ['chiave', 'camerino', 'registro'],
        text: 'La chiave uno l’ha ritirata la signora alle 20:35 e me l’ha resa alle 21:40. Fra quelle due righe il gancio è rimasto vuoto e io ero al bancone.',
        reveals: ['fact.camerino-chiuso'],
        fromAct: 2,
      },
    ],
    'wit.coldani': [
      {
        topic: 'camere',
        keywords: ['rossetto', 'orlo', 'bicchiere'],
        text: 'Quel rossetto lì lascia il segno su tutto: sulla tazza, sul tovagliolo, sul microfono. Sul bicchiere del leggio non c’era niente. Io le tazze le guardo prima di lavarle.',
        reveals: ['fact.rossetto-assente'],
        fromAct: 2,
      },
      {
        topic: 'pulizie',
        keywords: ['pastiglie', 'intervallo', 'abitudine'],
        text: 'Due pastiglie all’intervallo, mai prima. Diceva che prima le seccavano la gola. Le teneva nella piega dello spartito, dentro la latta, e la latta non la prestava.',
        reveals: ['fact.pastiglie-intervallo'],
        fromAct: 1,
      },
      {
        topic: 'rumori',
        keywords: ['corridoio', 'buio', 'lampada'],
        text: 'Dalle dieci in poi in corridoio si camminava a memoria: la lampada di mezzo era saltata. Le camere non mentono, ma al buio non si vedono nemmeno.',
        reveals: ['fact.corridoio-al-buio'],
        fromAct: 1,
      },
    ],
    'wit.pesce': [
      {
        topic: 'bicchieri',
        keywords: ['vassoio', 'calice', 'conta', 'porta'],
        text: 'Ne è rientrato uno con un calice in più di quelli usciti. Io i vassoi li conto come le uova. E la porta di servizio è rimasta accostata tutta la sera, che di lì passa mezzo albergo.',
        reveals: ['fact.vassoio-in-piu', 'fact.porta-servizio-aperta'],
        fromAct: 1,
      },
      {
        topic: 'servizio',
        keywords: ['lavato', 'panno', 'leggio'],
        text: 'Il ragazzo del banco me l’ha detto subito, perché gli era parso strano: il bicchiere del leggio era già lavato e capovolto sul panno prima che qualcuno lo cercasse.',
        reveals: ['fact.calice-lavato'],
        fromAct: 1,
      },
      {
        topic: 'cena',
        keywords: ['seduta', 'acqua', 'sipario'],
        text: 'Il cameriere di sala si segna tutto dietro la lista: 22:50 signora seduta in corridoio che chiede acqua, 23:05 seduta dietro il sipario che non vuole niente.',
        reveals: ['fact.ilde-seduta-due-volte'],
        fromAct: 2,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'messaggi',
        keywords: ['telegramma', 'provino', 'roma'],
        text: 'Il telegramma del 27 l’ho battuto io: provino di Roma annullato, seguirà lettera. Veniva dall’ufficio dell’impresario. La signorina è passata a ritirarlo alle sette meno un quarto.',
        reveals: ['fact.delia-provino'],
        fromAct: 2,
      },
      {
        topic: 'telefonate',
        keywords: ['genova', 'chiamata', 'centralino'],
        text: 'Alle 21:05 una chiamata per Genova dal centralino di servizio, undici minuti, nessuna camera addebitata. Io i numeri me li ricordo. Le facce no, mi dispiace.',
        reveals: ['fact.telefonata-genova'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['intervallo', 'orchestra', 'ripresa'],
        text: 'Intervallo dalle 21:40 alle 22:00 spaccate. Da qui sotto si sente quando l’orchestra tace: cambia il ronzio nella cuffia, e io lo sento prima della sala.',
        reveals: ['fact.intervallo-lungo'],
        fromAct: 1,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'corrente',
        keywords: ['lampada', 'corridoio', 'saltata'],
        text: 'Seconda lampada del corridoio, saltata alle 22:00. Non l’ho cambiata: a quell’ora di lì non passa nessuno e la scala sta in cantina.',
        reveals: ['fact.corridoio-al-buio'],
        fromAct: 1,
      },
      {
        topic: 'manutenzione',
        keywords: ['contagiri', 'nastro', 'registratore'],
        text: 'Contagiri letto alle 22:20, quando sono sceso per la presa: dieci minuti di nastro consumati fra le 22:05 e le 22:15, e sopra nessuna musica.',
        reveals: ['fact.registratore-a-vuoto'],
        fromAct: 2,
      },
      {
        topic: 'quadro',
        keywords: ['giunta', 'taglio', 'bobina'],
        text: 'Il nastro era già giuntato con la carta gommata a due terzi di bobina quando ho rimontato la testina. Taglio di sbieco, fatto da chi sa farlo.',
        reveals: ['fact.nastro-tagliato'],
        fromAct: 3,
      },
    ],
  },
  falseReconstruction: {
    summary:
      'Delia racconta una serata da spettatrice: chinotto al banco pagato e scontrinato, un bicchiere d’acqua portato sul leggio per cortesia alle 22:14, tavolo sette dalle 22:16 alla fine, mai più alzata. Il brindisi lo ha fatto Bergonzi, che aveva il microfono e la parola; è lui che ha alzato per primo e lui che ha fatto passare i calici. Del resto l’impresario aveva firmato quattro facciate con un nome e le aveva promesse a un altro: chi aveva da perdere quella sera era lui, non una che non era nemmeno sulla locandina.',
    timeline: [
      { who: 'role.rivale', from: 1316, to: 1332, where: 'loc.bar', note: 'Cliente al banco: un chinotto, pagato e scontrinato.', hidden: false },
      { who: 'role.rivale', from: 1334, to: 1336, where: 'loc.palco', note: 'Porta un bicchiere d’acqua sul leggio per cortesia.', hidden: false },
      { who: 'role.rivale', from: 1338, to: 1425, where: 'loc.sala-ballo', note: 'Tavolo sette fino a quando la direzione fa alzare tutti.', hidden: false },
      { who: 'role.impresario', from: 1293, to: 1332, where: 'loc.bar', note: 'Al microfono del bar: è lui che fa passare i calici.', hidden: false },
    ],
    scapegoatRoleId: 'role.impresario',
  },
  texts: {
    reveal:
      'Il bicchiere che tutti hanno guardato non era stato bevuto. L’orlo è netto, e quel rossetto lascia il segno su qualunque cosa: sulla tazza del camerino, sul tovagliolo, sul microfono. Alle 23:10 Ilde lo ha alzato per abitudine e lo ha riposato senza toccarlo con le labbra, perché aveva già bevuto un’ora prima. Alle 22:08, al brindisi dei vent’anni, qualcuno le ha porto uno dei due calici gemelli che stavano sul ripiano del bar e che sul conto della serata non compaiono, perché nessuno li aveva ordinati e nessuno li aveva pagati. Il secondo è rimasto lì, pieno, per un’ora. Alle 23:30 sul panno c’erano due bicchieri lavati e capovolti, e un vassoio è tornato in cucina con un calice di troppo.',
    explanation:
      'Il conto del bar dà tutte le consumazioni delle 21:56 alle 22:12 battute al posto tre del banco, quello d’angolo, con le spalle alla sala. La lastra numero sette mostra alle 22:14 una figura in abito lungo che posa un bicchiere su un leggio dove nessuno lo aveva chiesto: quello serviva a costruire l’ora sbagliata, e ha funzionato per quattro ore. Il movente stava all’ingresso, sotto una fascetta di carta incollata nel pomeriggio: «con Delia Marcantonio». Il 27 il provino di Roma era stato disdetto dall’ufficio di Bergonzi; il 20 le quattro facciate d’incisione erano state firmate con lei e poi promesse a un’altra; l’articolo della Ravasio, già battuto a macchina alle 21:00, annunciava il ritorno di Ilde e non nominava nessun altro. Il preparato non dà segno prima di un’ora: bastava contare all’indietro dalle 23:24 e fermarsi al brindisi.',
    victoryInnocents:
      'Delia non ha negato il bicchiere sul leggio: quello lo aveva ammesso subito, ed era vero. Ha negato il resto finché il capocuoco non ha detto ad alta voce quanti calici erano usciti e quanti erano rientrati. Poi ha chiesto di sedersi. La contessa le ha fatto posto al tavolo due, il che, in questa sala, è una forma di pietà.',
    victoryCulprit:
      'Il nome scritto sui foglietti è quello dell’impresario, e per un momento sembra tenere: i contratti sono suoi, la voce era la sua, il microfono lo aveva in mano. Delia alza il calice del brindisi che non ha mai bevuto, dice che è una serata triste e va a prendere il cappotto. Il primo autobus arriva alle sei e trentacinque.',
    defeat:
      'Il conto del bar era sul banco, in ordine d’ora, e nessuno lo ha letto fino in fondo. Era comprensibile: alle 23:10 il bicchiere lo avevano visto in centoventi, e ciò che si vede in centoventi sembra sempre più vero di una riga battuta a macchina. Bastava però l’orlo netto di quel bicchiere per capire che non era stato bevuto, e da lì tornare indietro di settantasei minuti.',
  },
};
