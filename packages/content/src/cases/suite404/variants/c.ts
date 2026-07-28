import type { VariantDef } from '@meridien/engine';
import { factsWith } from '../clues.js';
import { s, t } from '../world.js';

/**
 * VARIANTE C — «Il passaggio di servizio».
 * Colpevole: Delia Rovere, la cantante. Movente: il ricatto.
 * Metodo: la scala di servizio e la porta dietro l’armadio della 404.
 * La 404 l’aveva chiusa Malaspina, dall’interno, come ogni sera. Solo che
 * quella stanza ha due porte, e la seconda non è mai stata nel registro.
 */

export const variantePassaggioServizio: VariantDef = {
  id: 'var.passaggio-servizio',
  name: 'Il passaggio di servizio',
  tagline: 'Diciassette minuti di pausa, sei di scala. Andata e ritorno, e nessuno che si volti.',
  culpritRoleId: 'role.cantante',
  motiveKey: 'ricatto',
  methodKey: 'passaggio-servizio',
  sequence: ['beat.bugia', 'beat.incontro', 'beat.gesto', 'beat.uscita', 'beat.scoperta'],
  beatDetails: {
    'beat.bugia':
      'Alle 21:50, nel camerino dietro il palco, infila nello specchio il biglietto che ha appena letto e dice al maestro che la pausa la vuole lunga.',
    'beat.incontro':
      'Alle 22:41 entra nella 404 dalla porta dietro l’armadio, che ha unto lei stessa nei giorni scorsi. Malaspina aveva già versato due cognac.',
    'beat.gesto':
      'Alle 22:44 la cornetta viene alzata e riappoggiata dopo nove secondi. In quei nove secondi si sentono due respiri e una donna che dice no.',
    'beat.uscita':
      'Alle 22:46 ridiscende la scala di servizio, urta il gancio dei carrelli e riattraversa la cucina dove hanno rovesciato la farina.',
    'beat.scoperta':
      'Alle 23:26 il legno cede all’altezza della serratura. La mandata era girata dall’interno e la chiave era sul comodino, come ogni sera.',
  },

  facts: factsWith(
    {
      'fact.toppa':
        'Nella serratura della 404, dalla parte della camera, non c’era nessuna chiave: Malaspina girava la mandata e posava la chiave sul comodino.',
      'fact.calco':
        'Le scaglie di cera nella serratura sono vecchie di mesi: il fabbro rifece tutte le serrature del quarto piano in ottobre.',
      'fact.doppione':
        'La copia della chiave della 404 ordinata l’8 gennaio non è mai stata ritirata: la ferramenta di Laigueglia la tiene ancora sul banco.',
      'fact.passe':
        'Il passe-partout dei piani non è stato ritirato da nessuno la sera del 12: il cartellino della firma è ancora bianco.',
      'fact.gancio':
        'La chiave della 404 l’ha ritirata Malaspina alle 21:02 e il gancio è rimasto vuoto tutta la sera.',
      'fact.registro-chiavi':
        'Sul registro, dopo le 21:02, la 404 non ha più un movimento: nessuno ha ritirato chiavi e nessuno ne ha riportate.',
      'fact.cardini':
        'I tre cardini della porta di servizio della 404 sono lucidi d’olio fresco: sono gli unici del quarto piano a essere stati unti quest’inverno.',
      'fact.porta-passaggio':
        'Sotto la porta del passaggio, al quarto piano, era incastrato un tovagliolo di lino da buffet piegato in quattro: quelli di servizio sono di cotone grezzo.',
      'fact.impronta':
        'L’impronta nella farina è di una scarpetta da palcoscenico numero 36, senza tacco, con la suola resa ruvida dalla pece.',
      'fact.filo':
        'Il filo rimasto sul gancio del passaggio è di tulle nero da abito di scena: in sala, quella sera, nessuna invitata portava il tulle.',
      'fact.voci':
        'Alle 22:42 nella 404 discutevano un uomo e una donna. La donna ha detto: «quella carta non è sua e non lo è mai stata».',
      'fact.orchestra':
        'Il foglio del maestro segna la pausa dalle 22:35 alle 22:52 e, a matita di fianco: «la signorina rientra all’ultimo».',
      'fact.centralino':
        'Alle 22:44 il centralino ha collegato la 404: la cornetta è stata alzata e riappoggiata dopo nove secondi, senza una parola alla linea.',
      'fact.cuffie':
        'La centralinista ricorda che in quei nove secondi, dalla 404, si sentivano due respiri e una voce di donna che diceva no.',
      'fact.sveglia':
        'La sveglia della 404 è indietro di due minuti: la carica era quasi finita e nessuno l’aveva ricaricata.',
      'fact.orologio-sala':
        'L’orologio della sala da ballo è avanti di due minuti, come da sempre, e nessuno lo tocca dal 1961.',
      'fact.polaroid':
        'La polaroid mostra il brindisi delle dieci con l’orologio della sala sulle 22:02: l’ora è quella giusta.',
      'fact.foto-scartata':
        'La stampa scartata è mossa, ma si riconoscono la porta del passaggio al quarto piano e un lembo di stoffa scura che sparisce dentro.',
      'fact.quaderno-turni':
        'Il quaderno dei turni segna due interventi: 19:40 in cucina, 23:06 al quadro generale.',
      'fact.leva-quadro':
        'L’unghiata sulla leva del quarto piano è del 3 gennaio, la sera in cui la linea saltò per la neve.',
      'fact.ascensore':
        'Il fermo dell’ascensore è stato inserito alle 22:20 e tolto alle 23:10: in quei minuti la cabina non ha risposto a nessuna chiamata.',
      'fact.cambiale':
        'La cambiale in cassaforte è firmata da un ospite e scade il 31 gennaio: Malaspina ne teneva una per quasi tutti.',
      'fact.conti-sala':
        'I saldi della saletta sono riscritti perché il croupier rifà i conti a fine mese, prima a matita e poi a penna.',
      'fact.lettera':
        'Malaspina aveva scritto e non spedito: «l’atto di Trieste resta nella mia cassaforte finché il contratto di stagione resta il mio».',
      'fact.busta':
        'La busta vuota nel cestino della 404 porta sul davanti le iniziali D. R. ed è stata aperta stasera con il tagliacarte.',
      'fact.notaio-telegramma':
        'Il telegramma dello studio Ravera chiede a Malaspina la restituzione di un atto di annullamento matrimoniale depositato nel 1961.',
      'fact.agenda':
        'Nell’agenda, alla riga del 12 gennaio, cancellato e riscritto: «D. R. — dopo il secondo pezzo. Portare l’atto».',
      'fact.scarpe':
        'Le scarpe da sera asciutte lasciate in hall sono del pilota, che dice di aver firmato autografi in terrazza per mezz’ora.',
      'fact.finestra':
        'Il fermo della finestra della 404 è arrugginito aperto da settimane e sotto ci sono quattro piani di scogliera.',
      'fact.bicchieri':
        'Nella 404 due cognac erano stati versati prima delle 22:40: uno è stato bevuto, l’altro è rimasto pieno.',
      'fact.vassoio':
        'Il vassoio delle 21:40 non è mai entrato nella suite: dal corridoio, quella porta, non l’ha aperta nessuno.',
      'fact.guanto':
        'Il guanto spaiato sotto la poltrona della 404 è da sera, taglia piccola, rammendato sul polso come si rammenda in camerino.',
      'fact.fazzoletto':
        'Il fazzoletto ripiegato nel portacenere della 404 porta la cifra D. R. ricamata a mano su lino da camerino.',
      'fact.farmacia':
        'La ricevuta della farmacia di Alassio è intestata al medico condotto, che compra quel preparato da due inverni.',
      'fact.biglietto':
        'Il biglietto nello specchio del camerino dice: «22:40, quarto piano, dalla scala di servizio. Porti lei la sua copia».',
      'fact.lavanderia':
        'La riga aggiunta in lavanderia riguarda due tovaglie della sala, bruciate da una candela durante la cena.',
    },
    [
      {
        id: 'fact.dich-mai-lasciato-palco',
        text: 'Rovere afferma di non aver lasciato il palco e il camerino fra le 22 e le 23.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-nessun-biglietto',
        text: 'Rovere afferma che nello specchio del camerino non c’era nessun biglietto.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-passaggio-sconosciuto',
        text: 'Bertelè afferma di non sapere che dal passaggio di servizio si arriva a tutti i piani.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-mai-al-quarto',
        text: 'Cavassa afferma di non essere mai salita al quarto piano nel corso della serata.',
        kind: 'dichiarazione',
        common: false,
      },
    ],
  ),

  timeline: [
    t('victim', 1260, 1320, 'loc.sala-ballo', 'Riceve gli invitati accanto alla pedana e annuncia il brindisi delle 23.'),
    t('victim', 1325, 1400, 'loc.suite-404', 'Sale a cambiarsi, gira la mandata e posa la chiave sul comodino.', true),
    t('role.cantante', 1265, 1355, 'loc.sala-ballo', 'Prima parte del programma: sei pezzi, e l’ultimo finisce alle 22:35.'),
    t('role.cantante', 1358, 1359, 'loc.cucina', 'Attraversa la cucina dalla parte del passavivande, senza voltarsi.', true),
    t('role.cantante', 1360, 1360, 'loc.passaggio', 'Sale la scala di servizio, quattro piani, senza incontrare nessuno.', true),
    t('role.cantante', 1362, 1366, 'loc.suite-404', 'Entra dalla porta dietro l’armadio: si discute di una carta del 1961.', true),
    t('role.cantante', 1368, 1368, 'loc.passaggio', 'Ridiscende la scala e urta il gancio dei carrelli all’altezza delle spalle.', true),
    t('role.cantante', 1369, 1369, 'loc.cucina', 'Riattraversa la cucina, dove ieri hanno sfondato un sacco di farina.', true),
    t('role.cantante', 1372, 1420, 'loc.sala-ballo', 'Riprende con la seconda parte, in ritardo di un minuto sull’attacco.'),
    t('role.croupier', 1250, 1360, 'loc.hall', 'Tiene il banco della saletta da gioco e passa dal bancone per la chiave.'),
    t('role.croupier', 1368, 1420, 'loc.sala-ballo', 'Rientra in sala e chiede se il brindisi è già stato fatto.'),
    t('role.ereditiera', 1260, 1370, 'loc.sala-ballo', 'Balla poco e sorveglia molto il buffet.'),
    t('role.ereditiera', 1378, 1420, 'loc.hall', 'Chiede al portiere di provare a chiamare la suite.'),
    t('role.fotografo', 1270, 1345, 'loc.sala-ballo', 'Scatta il brindisi delle dieci e le maschere migliori.'),
    t('role.fotografo', 1352, 1368, 'loc.hall', 'Cambia il rullino nel ripostiglio dietro il bancone.'),
    t('role.fotografo', 1375, 1420, 'loc.sala-ballo', 'Torna in sala e fotografa la ripresa del programma.'),
    t('role.medico', 1260, 1350, 'loc.sala-ballo', 'Siede al tavolo dei liguri e parla di pesca.'),
    t('role.medico', 1358, 1378, 'loc.terrazza', 'Fuma appoggiato alla balaustra, con il bavero alzato.'),
    t('role.medico', 1386, 1420, 'loc.hall', 'Aspetta che il portiere trovi una chiave di servizio.'),
    t('role.contessa', 1250, 1300, 'loc.hall', 'Fa portare la pelliccia in guardaroba e si fa dare la posta.'),
    t('role.contessa', 1310, 1420, 'loc.sala-ballo', 'Non si muove dal tavolo vicino all’orchestra.'),
    t('role.campione', 1300, 1355, 'loc.terrazza', 'Firma autografi al riparo della vetrata.'),
    t('role.campione', 1362, 1420, 'loc.sala-ballo', 'Balla con chiunque glielo chieda.'),
    t('role.giornalista', 1260, 1330, 'loc.sala-ballo', 'Prende appunti in piedi, vicino alla porta.'),
    t('role.giornalista', 1340, 1352, 'loc.corridoio-quarto', 'Sale a cercare Malaspina per una domanda sui conti.', true),
    t('role.giornalista', 1360, 1420, 'loc.hall', 'Aspetta al bancone, con il cappotto sul braccio.'),
    t('wit.bramante', 1200, 1435, 'loc.hall', 'Al bancone, come tutte le notti da trentaquattro anni.'),
    t('wit.ottonello', 1200, 1435, 'loc.hall', 'Dietro la tenda del centralino, con le cuffie.'),
    t('wit.coldani', 1300, 1400, 'loc.corridoio-quarto', 'Rifà i carrelli e conta le federe.'),
    t('wit.pesce', 1200, 1420, 'loc.cucina', 'Manda in sala il servizio freddo e urla gli orari.'),
    t('wit.bacigalupo', 1380, 1395, 'loc.quadro', 'Rimette in linea il quarto piano dopo il buio.'),
    t('wit.bacigalupo', 1402, 1420, 'loc.passaggio', 'Risale a controllare le lampadine della scala.'),
  ],

  clueSetup: [
    s('clue.toppa-libera', 'utile', 1, 'loc.corridoio-quarto', 'serratura'),
    s('clue.cera-serratura', 'falsa-pista', 2, 'loc.suite-404', 'serratura'),
    s('clue.doppione-fabbro', 'falsa-pista', 1, 'loc.hall', 'casellario'),
    s('clue.passe-partout-mancante', 'falsa-pista', 2, 'loc.hall', 'quadro-chiavi'),
    s('clue.gancio-vuoto', 'contorno', 1, 'loc.hall', 'quadro-chiavi'),
    s('clue.registro-chiavi', 'contorno', 1, 'loc.hall', 'bancone'),
    s('clue.olio-cardine', 'critico', 2, 'loc.suite-404', 'armadio', {
      kind: 'confronto',
      prompt: 'Quante porte di servizio del quarto piano hanno i cardini unti di fresco?',
      options: ['nessuna', 'una sola', 'tutte e sei'],
      answer: 'una sola',
      hint: 'Bacigalupo unge tutto il piano in una volta sola, e l’ultima volta è stata a novembre.',
    }),
    s('clue.porta-passaggio', 'critico', 2, 'loc.corridoio-quarto', 'porta-servizio'),
    s('clue.impronta-farina', 'critico', 2, 'loc.passaggio', 'scala'),
    s('clue.filo-lame', 'critico', 2, 'loc.passaggio', 'gancio'),
    s('clue.voci-nella-404', 'utile', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.pausa-orchestra', 'critico', 2, 'loc.sala-ballo', 'pedana', {
      kind: 'orario',
      prompt: 'Fra quali due orari il foglio del maestro segna la pausa del programma?',
      options: ['22:04 e 22:20', '22:35 e 22:52', '23:05 e 23:14'],
      answer: '22:35 e 22:52',
      hint: 'La riga vuota sta fra due ballabili, e l’annotazione a matita è di fianco, non sopra.',
    }),
    s('clue.registro-centralino', 'utile', 2, 'loc.hall', 'centralino'),
    s('clue.cuffie-marisa', 'utile', 2, 'loc.hall', 'tenda'),
    s('clue.sveglia-avanti', 'falsa-pista', 1, 'loc.suite-404', 'comodino'),
    s('clue.orologio-sala', 'falsa-pista', 2, 'loc.sala-ballo', 'orologio'),
    s('clue.polaroid-sala', 'falsa-pista', 1, 'loc.sala-ballo', 'buffet'),
    s('clue.foto-scartata', 'utile', 2, 'loc.hall', 'cestino'),
    s('clue.quaderno-quadro', 'falsa-pista', 2, 'loc.quadro', 'quaderno'),
    s('clue.leva-abbassata', 'falsa-pista', 3, 'loc.quadro', 'leva'),
    s('clue.ascensore-fermo', 'utile', 1, 'loc.hall', 'quadro-luminoso'),
    s('clue.cambiale', 'falsa-pista', 2, 'loc.suite-404', 'cassaforte'),
    s('clue.libro-conti-sala', 'falsa-pista', 3, 'loc.hall', 'scrivania-portiere'),
    s('clue.lettera-ricatto', 'critico', 2, 'loc.suite-404', 'scrivania'),
    s('clue.busta-vuota', 'critico', 1, 'loc.suite-404', 'cestino'),
    s('clue.telegramma-notaio', 'critico', 2, 'loc.suite-404', 'vassoio-te'),
    s('clue.agenda-malaspina', 'critico', 2, 'loc.suite-404', 'scrivania'),
    s('clue.scarpe-asciutte', 'falsa-pista', 1, 'loc.hall', 'guardaroba'),
    s('clue.finestra-socchiusa', 'contorno', 1, 'loc.suite-404', 'finestra'),
    s('clue.bicchiere-due', 'contorno', 2, 'loc.suite-404', 'tavolino'),
    s('clue.vassoio-intatto', 'contorno', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.guanto-spaiato', 'critico', 2, 'loc.suite-404', 'poltrona'),
    s('clue.fazzoletto-cifrato', 'critico', 2, 'loc.suite-404', 'portacenere'),
    s('clue.ricevuta-farmacia', 'falsa-pista', 1, null, null),
    s('clue.biglietto-camerino', 'critico', 2, 'loc.sala-ballo', 'specchio-camerino'),
    s('clue.registro-lavanderia', 'falsa-pista', 3, null, null),
  ],

  inferences: [
    {
      id: 'inf.c-stanza-chiusa-da-dentro',
      text: 'La mandata era girata e la chiave sul comodino: Malaspina aveva chiuso lui, come ogni sera. Chi è entrato non è passato da quella porta.',
      concludes: 'support',
      paths: [['fact.toppa', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.c-metodo-porta-servizio',
      text: 'La 404 ha una seconda porta, dietro l’armadio, e i suoi tre cardini sono gli unici del piano unti quest’inverno. Da lì si entra e si esce senza toccare la mandata.',
      concludes: 'method',
      paths: [
        ['fact.cardini', 'fact.toppa'],
        ['fact.porta-passaggio', 'fact.filo'],
      ],
    },
    {
      id: 'inf.c-metodo-scala',
      text: 'Il tovagliolo da buffet sotto la porta del passaggio e la farina sul cemento dicono la stessa cosa: quella scala è stata percorsa due volte, in salita e in discesa.',
      concludes: 'method',
      paths: [
        ['fact.cardini', 'fact.impronta'],
        ['fact.toppa', 'fact.porta-passaggio'],
      ],
    },
    {
      id: 'inf.c-movente-ricatto',
      text: 'Malaspina non voleva denaro: teneva in cassaforte un atto del 1961 e lo usava come si usa una firma in bianco. Il notaio ne chiedeva la restituzione.',
      concludes: 'motive',
      paths: [
        ['fact.lettera', 'fact.notaio-telegramma'],
        ['fact.busta', 'fact.agenda'],
      ],
    },
    {
      id: 'inf.c-movente-documento',
      text: 'Sull’agenda l’appuntamento è scritto con due iniziali e una consegna. La busta con le stesse iniziali è stata aperta stasera, ed è rimasta vuota.',
      concludes: 'motive',
      paths: [
        ['fact.lettera', 'fact.agenda'],
        ['fact.notaio-telegramma', 'fact.busta'],
      ],
    },
    {
      id: 'inf.c-colpevole-materiale',
      text: 'Tulle nero sul gancio del passaggio, una scarpetta da palcoscenico nella farina, un guanto da camerino sotto la poltrona: tre oggetti di scena in tre stanze diverse.',
      concludes: 'culprit',
      paths: [
        ['fact.filo', 'fact.guanto'],
        ['fact.impronta', 'fact.fazzoletto'],
      ],
    },
    {
      id: 'inf.c-colpevole-temporale',
      text: 'La pausa è di diciassette minuti e la scala di servizio ne chiede sei per parte. In quei diciassette minuti, nella 404, discutevano un uomo e una donna.',
      concludes: 'culprit',
      paths: [
        ['fact.orchestra', 'fact.voci'],
        ['fact.biglietto', 'fact.centralino'],
      ],
    },
    {
      id: 'inf.c-sequenza',
      text: 'Legge il biglietto prima della pausa, scende dalla cucina alle 22:38, entra dietro l’armadio alle 22:41, e alle 22:52 è di nuovo davanti al microfono.',
      concludes: 'sequence',
      paths: [['fact.orchestra', 'fact.biglietto', 'fact.cardini', 'fact.voci']],
    },
    {
      id: 'inf.c-finestra-esclusa',
      text: 'Dalla finestra non è passato nessuno: sotto ci sono quattro piani di scogliera e il fermo è arrugginito in quella posizione da settimane.',
      concludes: 'support',
      paths: [['fact.finestra', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.c-due-persone',
      text: 'Due cognac versati, uno solo bevuto, e nove secondi di cornetta aperta con due respiri dentro: nella 404, alle 22:44, non c’era una persona sola.',
      concludes: 'support',
      paths: [['fact.cuffie', 'fact.bicchieri']],
    },
    {
      id: 'inf.c-ascensore-inutile',
      text: 'Il fermo dell’ascensore era inserito e la cabina non rispondeva. Chi è salito al quarto piano nei minuti della pausa è salito a piedi, e non dal corridoio.',
      concludes: 'support',
      paths: [['fact.ascensore', 'fact.orchestra']],
    },
    {
      id: 'inf.c-vassoio',
      text: 'Il vassoio delle 21:40 è rimasto sul carrello: da fuori quella porta non l’ha aperta nessuno, eppure alle 22:42 lì dentro si parlava in due.',
      concludes: 'support',
      paths: [['fact.vassoio', 'fact.voci']],
    },
  ],

  contradictions: [
    {
      id: 'contra.c-pausa',
      a: 'fact.orchestra',
      b: 'fact.dich-mai-lasciato-palco',
      text: 'Il foglio del maestro segna diciassette minuti di pausa e, a matita, che la signorina rientra all’ultimo. Chi dice di non essersi mossa smentisce una riga scritta prima dei fatti.',
      implicates: 'role.cantante',
    },
    {
      id: 'contra.c-biglietto',
      a: 'fact.biglietto',
      b: 'fact.dich-nessun-biglietto',
      text: 'Nello specchio del camerino c’era un biglietto con un’ora, un piano e una scala. Chi dice che lo specchio era vuoto è l’unica persona che quello specchio lo guarda.',
      implicates: 'role.cantante',
    },
    {
      id: 'contra.c-passaggio',
      a: 'fact.impronta',
      b: 'fact.dich-passaggio-sconosciuto',
      text: 'Nella farina della scala di servizio è rimasta una suola stampata netta. Sostenere che quella scala non porta ai piani vuol dire non averla mai salita, o averla salita troppo bene.',
      implicates: 'role.campione',
    },
    {
      id: 'contra.c-quarto-piano',
      a: 'fact.voci',
      b: 'fact.dich-mai-al-quarto',
      text: 'Dietro la porta della 404 si discuteva in due, e nel corridoio, in quei minuti, c’era chi giura di non esserci mai salito.',
      implicates: 'role.giornalista',
    },
  ],

  roleProfiles: [
    {
      roleId: 'role.ereditiera',
      declaredAlibi:
        'In sala da ballo dalle nove, vicino al buffet, fino a quando mio padre non è sceso per il brindisi. Poi in hall, a farlo chiamare due volte.',
      trueTimeline: [
        t('role.ereditiera', 1260, 1370, 'loc.sala-ballo', 'Balla poco e sorveglia molto il buffet.'),
        t('role.ereditiera', 1378, 1420, 'loc.hall', 'Chiede al portiere di provare a chiamare la suite.'),
      ],
      secretId: 'sec.procura-falsa',
      objectiveId: 'goal.due-domande',
      exclusiveClueId: 'clue.doppione-fabbro',
      declarations: [
        { key: 'verita', text: 'Mio padre in cassaforte non teneva soltanto denaro. Teneva carte che riguardavano altre persone, e le teneva in ordine alfabetico.' },
        { key: 'omissione', text: 'Abbiamo discusso questa mattina. Di contratti di stagione, come sempre. Non è una notizia e non lo era neanche ieri.' },
        { key: 'bugia', text: 'Non ho mai chiesto una procura a mio padre. Firmo quello che mi mette davanti, e nulla di più.' },
      ],
      shareable: [
        'La copia della chiave ordinata l’8 gennaio è ancora sul banco della ferramenta: nessuno è andato a ritirarla.',
        'Mio padre non rimandava mai un brindisi che aveva annunciato lui stesso agli invitati.',
      ],
      hidden: ['Sui contratti dell’ultimo anno la firma di mio padre l’ho imitata io, e bene.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Sul palco dalle dieci, poi in camerino durante la pausa dell’orchestra, poi di nuovo sul palco fino alla fine. Diciassette minuti seduta davanti a uno specchio.',
      trueTimeline: [
        t('role.cantante', 1265, 1355, 'loc.sala-ballo', 'Prima parte del programma: l’ultimo pezzo finisce alle 22:35.'),
        t('role.cantante', 1358, 1359, 'loc.cucina', 'Attraversa la cucina dalla parte del passavivande.', true),
        t('role.cantante', 1360, 1360, 'loc.passaggio', 'Sale la scala di servizio senza incontrare nessuno.', true),
        t('role.cantante', 1362, 1366, 'loc.suite-404', 'Entra dalla porta dietro l’armadio: si discute di una carta del 1961.', true),
        t('role.cantante', 1368, 1368, 'loc.passaggio', 'Ridiscende e urta il gancio dei carrelli.', true),
        t('role.cantante', 1369, 1369, 'loc.cucina', 'Riattraversa la cucina, dove è stata rovesciata la farina.', true),
        t('role.cantante', 1372, 1420, 'loc.sala-ballo', 'Riprende con la seconda parte, in ritardo di un minuto.'),
      ],
      secretId: 'sec.matrimonio-annullato',
      objectiveId: 'goal.silenzio',
      exclusiveClueId: 'clue.ricevuta-farmacia',
      declarations: [
        { key: 'verita', text: 'La pausa è cominciata alle dieci e trentacinque. Il maestro la segna sempre sul foglio, e la segna al minuto.' },
        {
          key: 'omissione',
          text: 'Il signor Malaspina mi aveva chiesto di passare da lui. Dopo lo spettacolo, però, e io dopo lo spettacolo non ci sono andata.',
          asserts: 'fact.dich-nessun-biglietto',
        },
        {
          key: 'bugia',
          text: 'Fra le dieci e le undici non ho lasciato il palco e il camerino. Con quel vestito, per le scale, non si va da nessuna parte.',
          asserts: 'fact.dich-mai-lasciato-palco',
        },
      ],
      shareable: [
        'L’orchestra ha smesso alle dieci e trentacinque e ha ripreso alle dieci e cinquantadue: diciassette minuti.',
        'La ricevuta della farmacia di Alassio non è intestata a un artista: è intestata a un medico.',
      ],
      hidden: ['Un matrimonio annullato a Trieste, e l’atto è in una cassaforte che non è la mia.'],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'In sala fino alle dieci e mezza, poi in hall a cambiare il rullino nel ripostiglio, poi ancora in sala fino a quando hanno chiuso le porte.',
      trueTimeline: [
        t('role.fotografo', 1270, 1345, 'loc.sala-ballo', 'Scatta il brindisi delle dieci.'),
        t('role.fotografo', 1352, 1368, 'loc.hall', 'Cambia il rullino nel ripostiglio.'),
        t('role.fotografo', 1375, 1420, 'loc.sala-ballo', 'Fotografa la ripresa del programma.'),
      ],
      secretId: 'sec.foto-vendute',
      objectiveId: 'goal.polaroid',
      exclusiveClueId: 'clue.foto-scartata',
      declarations: [
        { key: 'verita', text: 'Una stampa mi è venuta mossa e l’ho buttata. Si riconosce una porta di servizio al quarto piano e una stoffa scura che entra.' },
        { key: 'omissione', text: 'Fotografo anche i corridoi, quando la sala è ferma. Non è educazione, è mestiere: le sale vuote vendono più delle maschere.' },
        { key: 'bugia', text: 'Al Méridien non ho mai venduto niente a nessuno. Le mie stampe le brucio, quando me lo chiedono.' },
      ],
      shareable: [
        'L’orologio della sala nella mia polaroid segna le ventidue e zero due: quella è l’ora giusta.',
        'Nella stampa scartata si vede la porta del passaggio al quarto piano, e non è chiusa.',
      ],
      hidden: ['Due volte ho venduto a un settimanale fotografie scattate qui che avevo promesso di distruggere.'],
    },
    {
      roleId: 'role.medico',
      declaredAlibi:
        'Al tavolo dei liguri fino alle dieci e mezza, poi in terrazza a fumare, poi in hall quando hanno cominciato a cercare Corrado.',
      trueTimeline: [
        t('role.medico', 1260, 1350, 'loc.sala-ballo', 'Siede al tavolo dei liguri.'),
        t('role.medico', 1358, 1378, 'loc.terrazza', 'Fuma appoggiato alla balaustra.'),
        t('role.medico', 1386, 1420, 'loc.hall', 'Aspetta accanto al bancone.'),
      ],
      secretId: 'sec.certificato-compiacente',
      objectiveId: 'goal.mai-il-guanto',
      exclusiveClueId: 'clue.cera-serratura',
      declarations: [
        { key: 'verita', text: 'La cera nella serratura è vecchia di mesi. Il fabbro rifece tutte le porte del quarto piano in ottobre, e lo ricordo perché mi svegliò.' },
        { key: 'omissione', text: 'Conoscevo bene le abitudini di Corrado. Alcune non le racconterò stasera, e non per delicatezza.' },
        { key: 'bugia', text: 'Non ho mai firmato un certificato che non fosse dovuto. Trent’anni di mestiere e nessuna macchia.' },
      ],
      shareable: [
        'Corrado chiudeva la mandata dall’interno e posava la chiave sul comodino: lo faceva da quindici anni.',
        'La ricevuta della farmacia dell’undici gennaio è intestata a me, ed è un preparato che compro da due inverni.',
      ],
      hidden: ['Ho firmato un certificato di comodo, e Corrado ne aveva tenuto una copia.'],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'In hall fino alle nove e mezza per la posta e la pelliccia, poi al mio tavolo vicino all’orchestra, dal quale non mi sono più alzata.',
      trueTimeline: [
        t('role.contessa', 1250, 1300, 'loc.hall', 'Fa portare la pelliccia in guardaroba.'),
        t('role.contessa', 1310, 1420, 'loc.sala-ballo', 'Non si muove dal tavolo vicino all’orchestra.'),
      ],
      secretId: 'sec.gioielli-rifatti',
      objectiveId: 'goal.parola-buona',
      exclusiveClueId: 'clue.registro-lavanderia',
      declarations: [
        { key: 'verita', text: 'Il mio tavolo guarda il palco. Durante la pausa il camerino era chiuso e la tenda del fondo si è mossa una volta sola.' },
        { key: 'omissione', text: 'Prestai del denaro a Malaspina nel Sessantadue. Non chiedetemi se me lo abbia restituito.' },
        { key: 'bugia', text: 'Questa parure è la stessa che porto da trent’anni. Mio marito la fece montare a Torino, da Musy.' },
      ],
      shareable: [
        'La pausa dell’orchestra è durata diciassette minuti e la signorina è rientrata all’ultimo momento.',
        'La lavanderia ha aggiunto una riga stasera, con un’altra penna: due tovaglie bruciate a cena.',
      ],
      hidden: ['I gioielli veri sono stati venduti a Nizza nel Sessantaquattro: questi sono strass.'],
    },
    {
      roleId: 'role.campione',
      declaredAlibi:
        'In terrazza a firmare autografi fino alle dieci e mezza, poi in sala a ballare fino a quando non hanno chiuso le porte della sala.',
      trueTimeline: [
        t('role.campione', 1300, 1355, 'loc.terrazza', 'Firma autografi al riparo della vetrata.'),
        t('role.campione', 1362, 1420, 'loc.sala-ballo', 'Balla con chiunque glielo chieda.'),
      ],
      secretId: 'sec.gara-aggiustata',
      objectiveId: 'goal.scudo',
      exclusiveClueId: 'clue.leva-abbassata',
      declarations: [
        { key: 'verita', text: 'In terrazza c’era il dottore, e prima di lui altra gente. Ci siamo salutati e faceva un freddo che tagliava.' },
        { key: 'omissione', text: 'Malaspina mi aveva anticipato dei soldi. Cose di sport, si sistemano fra uomini e non davanti a una sala.' },
        {
          key: 'bugia',
          text: 'La scala di servizio non so nemmeno dove sia. Io salgo in ascensore come tutti gli ospiti che pagano la camera.',
          asserts: 'fact.dich-passaggio-sconosciuto',
        },
      ],
      shareable: [
        'La leva del quarto piano nel quadro elettrico ha un’unghiata sulla vernice, ma è vecchia di nove giorni.',
        'Il fermo dell’ascensore era inserito: dalle dieci e venti la cabina non rispondeva più.',
      ],
      hidden: ['Il piazzamento di settembre era stato deciso il giorno prima, in un ufficio.'],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'In sala a prendere appunti fino alle dieci e venti, poi in hall al bancone ad aspettare che Malaspina scendesse per il brindisi.',
      trueTimeline: [
        t('role.giornalista', 1260, 1330, 'loc.sala-ballo', 'Prende appunti in piedi.'),
        t('role.giornalista', 1340, 1352, 'loc.corridoio-quarto', 'Sale a cercare Malaspina per una domanda.', true),
        t('role.giornalista', 1360, 1420, 'loc.hall', 'Aspetta al bancone, con il cappotto sul braccio.'),
      ],
      secretId: 'sec.articolo-pronto',
      objectiveId: 'goal.tre-carte',
      exclusiveClueId: 'clue.quaderno-quadro',
      declarations: [
        { key: 'verita', text: 'Scrivo un pezzo sui conti dell’albergo. Malaspina lo sapeva e non gli faceva nessun piacere.' },
        { key: 'omissione', text: 'Ho chiesto due volte al bancone se il proprietario fosse sceso. Due volte mi hanno risposto di no.' },
        {
          key: 'bugia',
          text: 'Al quarto piano non sono mai salita. Ho aspettato in hall come tutti gli altri, con il cappotto sul braccio.',
          asserts: 'fact.dich-mai-al-quarto',
        },
      ],
      shareable: [
        'Il telegramma delle diciotto e venti veniva dallo studio Ravera e chiedeva indietro un atto del Sessantuno.',
        'Il quaderno dei turni segna un intervento al quadro generale alle ventitré e sei.',
      ],
      hidden: ['L’articolo è già scritto: mancano due righe e una fotografia.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Al tavolo verde fino alle undici passate, poi in sala. La chiave della saletta l’ho riportata al bancone e Bramante ha scritto la riga davanti a me.',
      trueTimeline: [
        t('role.croupier', 1250, 1360, 'loc.hall', 'Tiene il banco della saletta da gioco.'),
        t('role.croupier', 1368, 1420, 'loc.sala-ballo', 'Rientra in sala e chiede del brindisi.'),
      ],
      secretId: 'sec.debito-gioco',
      objectiveId: 'goal.indice',
      exclusiveClueId: 'clue.libro-conti-sala',
      declarations: [
        { key: 'verita', text: 'Il passe-partout dei piani non l’ha ritirato nessuno stasera: il cartellino della firma è ancora bianco.' },
        { key: 'omissione', text: 'Devo del denaro all’albergo e la cambiale scade a fine mese. Lo sapevano in tre, e adesso lo sapete tutti.' },
        { key: 'bugia', text: 'I saldi di dicembre li ho riscritti soltanto perché la matita si legge male. Null’altro, e chiunque tenga un banco lo fa.' },
      ],
      shareable: [
        'Dal quadro delle chiavi, stasera, non è uscito nulla: né il passe-partout né una chiave dei piani.',
        'Il libro della saletta ha i saldi di dicembre riscritti sopra, e la mano è la mia.',
      ],
      hidden: ['La cambiale in cassaforte è la mia, e scade il 31 gennaio.'],
    },
  ],

  witnessLines: {
    'wit.bramante': [
      {
        topic: 'chiavi',
        keywords: ['chiave', '404', 'gancio', 'passe'],
        text: 'La 404 l’ha ritirata lui alle nove e due, signore, e il gancio è rimasto vuoto tutta la sera. Il passe-partout dei piani non l’ha chiesto nessuno: il cartellino è ancora bianco.',
        reveals: ['fact.gancio', 'fact.passe'],
        fromAct: 1,
      },
      {
        topic: 'registro',
        keywords: ['registro', 'movimento', 'riconsegna'],
        text: 'Dopo le nove e due, sul registro, la 404 non ha più un movimento. Né consegne né riconsegne. Io non guardo, signore: io registro. E quando non c’è niente da registrare, non scrivo.',
        reveals: ['fact.registro-chiavi'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['ascensore', 'fermo', 'cabina'],
        text: 'Il fermo dell’ascensore è stato inserito alle dieci e venti e tolto alle undici e dieci. Io non guardo chi sale: guardo la lampadina gialla del quadro, e quella è rimasta accesa.',
        reveals: ['fact.ascensore'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'rumori',
        keywords: ['voci', '404', 'discussione', 'carta'],
        text: 'Rifacevo il carrello. Nella 404 parlavano in due, un uomo e una donna. Lei ha detto: quella carta non è sua. Erano le dieci e quarantadue: guardo l’orologio quando conto le federe.',
        reveals: ['fact.voci'],
        fromAct: 1,
      },
      {
        topic: 'camere',
        keywords: ['vassoio', 'carrello', 'tè'],
        text: 'Il vassoio delle nove e quaranta è ancora sul carrello, con il tovagliolo piegato come l’ha mandato la cucina. Da fuori quella porta non l’ha aperta nessuno. Le camere non mentono.',
        reveals: ['fact.vassoio'],
        fromAct: 1,
      },
      {
        topic: 'passaggio',
        keywords: ['passaggio', 'porta', 'tovagliolo', 'lino'],
        text: 'Il tovagliolo sotto la porta di servizio non è dei miei. I miei sono di cotone grezzo, si lavano a novanta. Quello è lino da buffet, piegato in quattro come si piega in sala.',
        reveals: ['fact.porta-passaggio'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cucina',
        keywords: ['farina', 'sacco', 'impronta', 'suola'],
        text: 'Il sacco di farina l’ha sfondato il garzone ieri sera e la striscia bianca arriva ancora fino alla scala. Sopra c’è una suola senza tacco, ruvida come quelle da palcoscenico.',
        reveals: ['fact.impronta'],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['passaggio', 'cucina', 'fretta'],
        text: 'Fra le dieci e mezza e le undici meno dieci qualcuno mi ha attraversato la cucina due volte, all’andata e al ritorno. Io mandavo fuori i freddi e non mi volto per nessuno.',
        reveals: [],
        fromAct: 2,
      },
      {
        topic: 'personale',
        keywords: ['scala', 'lavanderia', 'piani'],
        text: 'Dalla mia porta si va in lavanderia, al quadro e a tutti i piani senza incontrare un’anima. Gli ospiti dicono di non saperlo. Il personale sa benissimo che non è vero.',
        reveals: [],
        fromAct: 1,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'linea',
        keywords: ['linea', 'telefono', 'caduta'],
        text: 'La linea è caduta alle ventidue e quaranta. L’ho scritto. Torna a pezzi, due o tre minuti per volta, e poi se ne va di nuovo. Con questo vento è sempre così.',
        reveals: ['fact.linea-caduta'],
        fromAct: 1,
      },
      {
        topic: 'telefonate',
        keywords: ['404', 'cornetta', 'nove secondi'],
        text: 'Alle ventidue e quarantaquattro la 404 ha alzato la cornetta e l’ha riappoggiata dopo nove secondi. Nessun numero chiesto. Io i secondi li conto sempre: è il mio mestiere.',
        reveals: ['fact.centralino'],
        fromAct: 2,
      },
      {
        topic: 'centralino',
        keywords: ['cuffia', 'respiri', 'voce'],
        text: 'Resto in ascolto finché la comunicazione non parte. In quei nove secondi dalla 404 arrivavano due respiri e una voce di donna che diceva no. Una volta sola, e piano.',
        reveals: ['fact.cuffie'],
        fromAct: 2,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'quadro',
        keywords: ['quadro', 'turni', 'intervento'],
        text: 'Ventitré e sei, quadro generale, linea del quarto piano. Rimessa in due minuti. Prima, alle diciannove e quaranta, in cucina. Sono le uniche due righe della pagina.',
        reveals: ['fact.quaderno-turni'],
        fromAct: 2,
      },
      {
        topic: 'corrente',
        keywords: ['leva', 'unghiata', 'vernice'],
        text: 'L’unghiata sulla leva è del tre gennaio. Quella sera nevicava e la linea del quarto è saltata da sola. L’ho segnata sul quaderno, come segno tutto.',
        reveals: ['fact.leva-quadro'],
        fromAct: 2,
      },
      {
        topic: 'manutenzione',
        keywords: ['cardini', 'olio', 'armadio', 'porta di servizio'],
        text: 'Le porte di servizio dei piani le ungo tutte insieme, a novembre, e poi non le tocco più. Quella della 404 adesso ha i cardini bagnati d’olio. Le altre cinque no.',
        reveals: ['fact.cardini'],
        fromAct: 2,
      },
    ],
  },

  falseReconstruction: {
    summary:
      'Questa è la sera che devi raccontare. La pausa l’hai passata in camerino, seduta davanti allo specchio, come tutte le sere di ballo: diciassette minuti sono pochi anche per rifarsi la bocca. Al quarto piano non sei salita, e del resto la 404 era chiusa a mandata dall’interno con la chiave sul comodino: da fuori non ci entrava nessuno. Chi ci è salito per davvero è la cronista milanese, che al bancone ha chiesto due volte del proprietario e che scrive un pezzo sui conti dell’albergo. Se qualcuno tira fuori il tovagliolo sotto la porta del passaggio, ricorda che quello ce lo mette ogni sera la governante.',
    timeline: [
      t('role.cantante', 1265, 1355, 'loc.sala-ballo', 'Prima parte del programma, senza interruzioni.'),
      t('role.cantante', 1357, 1370, 'loc.sala-ballo', 'In camerino dietro il palco, sola, per tutta la pausa.'),
      t('role.cantante', 1372, 1420, 'loc.sala-ballo', 'Seconda parte, dall’attacco alla fine.'),
      t('role.giornalista', 1340, 1365, 'loc.corridoio-quarto', 'Sale al quarto piano e vi resta venticinque minuti.'),
    ],
    scapegoatRoleId: 'role.giornalista',
  },

  texts: {
    reveal:
      'La 404 l’aveva chiusa Corrado Malaspina, dall’interno, girando la mandata e posando la chiave sul comodino, come faceva ogni sera da quindici anni. Nessuno l’ha aperta e nessuno l’ha richiusa: quella stanza ha una seconda porta, dietro l’armadio, che dà sul passaggio di servizio. È murata dalla mobilia, non dai cardini, e i suoi tre cardini sono gli unici del quarto piano a essere stati unti quest’inverno. Dalla sala da ballo alla scala di servizio ci sono tre minuti di cucina; dalla scala alla 404 altri tre. Andata e ritorno: dodici. La pausa dell’orchestra, quella sera, è durata diciassette minuti.',
    explanation:
      'Il biglietto nello specchio del camerino fissava l’ora e la strada: «22:40, quarto piano, dalla scala di servizio». Delia Rovere aveva un matrimonio annullato a Trieste nel 1961 e Malaspina ne teneva l’atto in cassaforte, come teneva le cambiali degli altri: non per incassarlo, ma per rinnovare ogni anno un contratto di stagione alle sue condizioni. Lo studio Ravera, quel pomeriggio, gli aveva telegrafato per riavere quella carta. Alle 22:35 il maestro segna la pausa. Alle 22:41 la porta dietro l’armadio si apre senza rumore. Alle 22:44 la cornetta viene alzata e riappoggiata dopo nove secondi: la centralinista sente due respiri e una donna che dice no. Alle 22:52 il programma riprende con un minuto di ritardo. Le tracce sono tutte di scena e nessuna da ballo: tulle nero sul gancio del passaggio, una scarpetta senza tacco stampata nella farina, un guanto rammendato come si rammenda in camerino e un fazzoletto di lino con due iniziali ricamate a mano.',
    victoryInnocents:
      'Avete guardato il foglio del maestro prima delle facce. Diciassette minuti scritti a penna, e a matita di fianco una riga che nessuno aveva letto: la signorina rientra all’ultimo. Delia Rovere non ha alzato la voce. Ha chiesto soltanto se l’orchestra poteva restare, e le hanno detto di sì.',
    victoryCulprit:
      'All’alba il verbale porta il nome di una cronista milanese che aveva chiesto due volte del proprietario. Delia Rovere canta ancora due pezzi mentre si aspetta il commissario, perché qualcuno lo chiede e perché rifiutare sarebbe strano. L’atto del 1961 è ancora in cassaforte, e in cassaforte nessuno guarda prima di lunedì.',
    defeat:
      'L’indizio lasciato passare sono i cardini dietro l’armadio: sembravano manutenzione ordinaria e invece erano l’unica porta della 404 che quella notte si è mossa. Era comprensibile ignorarli — l’albergo è vecchio e tutto cigola — ma Bacigalupo unge le porte di servizio tutte insieme, una volta l’anno, e quella era l’unica bagnata.',
  },
};
