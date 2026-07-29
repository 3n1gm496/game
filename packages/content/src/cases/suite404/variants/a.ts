import type { VariantDef } from '@meridien/engine';
import { factsWith } from '../clues.js';
import { s, t } from '../world.js';

/**
 * VARIANTE A — «La chiave gemella».
 * Colpevole: Tancredi Lo Faro, il croupier. Movente: il debito.
 * Metodo: una copia della chiave della 404, ordinata l’8 gennaio a Laigueglia.
 * La stanza non è mai stata chiusa dall’interno: è stata chiusa dal corridoio.
 */

export const varianteChiaveGemella: VariantDef = {
  id: 'var.chiave-gemella',
  name: 'La chiave gemella',
  tagline: 'La toppa era libera. Una porta chiusa a chiave con la chiave rimasta dentro non è chiusa: è stata chiusa.',
  culpritRoleId: 'role.croupier',
  motiveKey: 'debito',
  methodKey: 'chiave-duplicata',
  sequence: [
    'beat.incontro',
    'beat.bugia',
    'beat.gesto',
    'beat.uscita',
    'beat.scoperta',
  ],
  beatDetails: {
    'beat.bugia':
      'Alle 22:12 chiude il banco della saletta, riporta la chiave al bancone e dice a Bramante che scende in terrazza a prendere aria.',
    'beat.incontro':
      'Alle 21:42 Malaspina scende in hall per un giro fra i tavoli e si ferma al banco. Parlano due minuti. Nessuno sente cosa si dicono, ma il banco chiude mezz’ora prima del solito.',
    'beat.gesto':
      'Alle 22:18 è nella 404: Malaspina lo aspettava e aveva già versato due cognac. Alle 22:33 gli mostra la lettera per la questura. La trattativa finisce, e finisce male.',
    'beat.uscita':
      'Esce nel corridoio, gira due volte la copia dell’8 gennaio e scende dal passaggio di servizio mentre l’orchestra tace.',
    'beat.scoperta':
      'Alle 23:26 il legno cede all’altezza della serratura. La chiave della suite è sul comodino, e la toppa è libera.',
  },

  facts: factsWith(
    {
      'fact.toppa':
        'Nella serratura della 404, dalla parte della camera, non c’era nessuna chiave: quella porta poteva essere girata dal corridoio.',
      'fact.calco':
        'Le scaglie di cera nella serratura della 404 sono state lasciate nei primi giorni di gennaio: qualcuno ne ha preso l’impronta.',
      'fact.doppione':
        'La ricevuta del doppione della 404 porta scritto a matita il nome dell’intestatario: T. Lo Faro, saletta da gioco.',
      'fact.passe':
        'Il passe-partout dei piani non è stato ritirato da nessuno la sera del 12: il cartellino della firma è ancora bianco.',
      'fact.registro-chiavi':
        'Il registro segna alle 22:12 la riconsegna della chiave della saletta da gioco, firmata L. F.: a quell’ora il banco era chiuso.',
      'fact.orchestra':
        'Il foglio del maestro segna la pausa dalle 22:35 alle 22:52: in quei diciassette minuti in sala non si ballava affatto.',
      'fact.voci':
        'Alle 22:18 nella 404 discutevano due uomini. Uno ha detto: «io il banco l’ho tenuto per lei».',
      'fact.filo':
        'Il filo rimasto sul gancio del passaggio è di panno verde, lo stesso che riveste i tavoli della saletta da gioco.',
      'fact.fazzoletto':
        'Il fazzoletto ripiegato nel portacenere della 404 porta la cifra T. L. F. ricamata a mano.',
      'fact.impronta':
        'L’impronta nella farina è di una scarpa da uomo, numero 44, con il tacco consumato all’esterno.',
      'fact.ascensore':
        'Il fermo dell’ascensore è stato inserito alle 22:30 e tolto alle 23:12: dal quarto piano si scendeva a piedi o dal passaggio.',
      'fact.cambiale':
        'La cambiale in cassaforte è firmata Tancredi Lo Faro: due milioni e ottocentomila lire, scadenza 31 gennaio.',
      'fact.conti-sala':
        'Nel libro della saletta i saldi di dicembre sono stati riscritti sopra: manca quasi il doppio della cambiale.',
      'fact.lettera':
        'Malaspina aveva scritto e non spedito: «lunedì porto le cambiali in questura, se prima non porti tu il denaro».',
      'fact.busta':
        'La busta vuota nel cestino della 404 porta sul davanti le iniziali T. L. F. ed è stata aperta stasera.',
      'fact.scarpe':
        'Le scarpe da sera asciutte lasciate in hall sono quelle di ricambio del croupier, che dice di aver preso aria in terrazza.',
      'fact.centralino':
        'Alle 22:50 il centralino ha collegato la 404 per undici secondi: non ha risposto nessuno.',
      'fact.bicchieri':
        'Nella 404 due cognac erano stati versati prima delle 22:20: uno è stato bevuto, l’altro no.',
      'fact.vassoio':
        'Il vassoio delle 21:40 non è mai entrato nella suite: fino alle 22 Malaspina non ha aperto a nessuno.',
      'fact.finestra':
        'Il fermo della finestra della 404 è arrugginito aperto da settimane e sotto ci sono quattro piani di scogliera.',
      'fact.sveglia': 'La sveglia della 404 è indietro di due minuti: la carica era quasi finita.',
      'fact.orologio-sala':
        'L’orologio della sala da ballo è avanti di due minuti, come da sempre, e nessuno lo tocca dal 1961.',
      'fact.polaroid':
        'La polaroid mostra il brindisi delle dieci con l’orologio della sala sulle 22:02: l’ora è quella giusta.',
      'fact.cuffie':
        'La centralinista ricorda che alle 22:50, dalla 404, arrivava soltanto il segnale di libero.',
      'fact.cardini':
        'I cardini dietro l’armadio sono stati oliati a novembre dal tuttofare, insieme a quelli di tutto il piano.',
      'fact.porta-passaggio':
        'Il tovagliolo sotto la porta del passaggio lo mette ogni sera la cameriera del quarto piano, per non restare chiusa fuori.',
      'fact.notaio-telegramma':
        'Il telegramma del notaio riguarda la vendita di un terreno a Varazze, in trattativa da un anno.',
      'fact.agenda':
        'Nell’agenda l’appuntamento cancellato e riscritto è quello con il dentista di Albenga, spostato al giovedì.',
      'fact.leva-quadro':
        'L’unghiata sulla leva del quarto piano è del 3 gennaio, la sera in cui la linea saltò per la neve.',
      'fact.quaderno-turni':
        'Il quaderno dei turni segna due interventi: 19:40 in cucina, 23:06 al quadro generale.',
      'fact.foto-scartata':
        'La stampa scartata è mossa: si riconoscono solo il corridoio del secondo piano e una porta aperta.',
      'fact.biglietto':
        'Il biglietto nello specchio del camerino dice: «stasera due pezzi in più, il maestro è d’accordo».',
      'fact.lavanderia':
        'La riga aggiunta in lavanderia riguarda due tovaglie della sala, bruciate da una candela durante la cena.',
    },
    [
      {
        id: 'fact.dich-terrazza',
        text: 'Lo Faro afferma di non essersi mosso fra la sala e la terrazza dalle 22 alle 23.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-mai-al-quarto',
        text: 'Cavassa afferma di non essere mai salita al quarto piano nel corso della serata.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-sempre-al-tavolo',
        text: 'Lo Faro afferma di aver tenuto il banco della saletta fino alle 23 passate.',
        kind: 'dichiarazione',
        common: false,
      },
    ],
  ),

  timeline: [
    t('victim', 1260, 1300, 'loc.sala-ballo', 'Riceve gli invitati accanto alla pedana e annuncia il brindisi delle 23.'),
    t('victim', 1302, 1310, 'loc.hall', 'Scende a fare un giro fra i tavoli da gioco e si ferma al banco del croupier.'),
    t('victim', 1312, 1320, 'loc.sala-ballo', 'Torna in sala di pessimo umore e non balla più.'),
    t('victim', 1326, 1400, 'loc.suite-404', 'Sale a cambiarsi la camicia e non scende più.', true),
    t('role.croupier', 1250, 1332, 'loc.hall', 'Tiene il banco nella saletta e passa dal bancone per la chiave.'),
    t('role.croupier', 1338, 1355, 'loc.suite-404', 'Sale dal corridoio: si parla di cambiali e di questura.', true),
    t('role.croupier', 1358, 1362, 'loc.passaggio', 'Scende la scala di servizio, urtando il gancio dei carrelli.', true),
    t('role.croupier', 1364, 1370, 'loc.cucina', 'Attraversa la cucina e si rifà il nodo del papillon.', true),
    t('role.croupier', 1376, 1420, 'loc.sala-ballo', 'Rientra in sala e chiede se il brindisi è già stato fatto.'),
    t('role.ereditiera', 1260, 1370, 'loc.sala-ballo', 'Balla poco e sorveglia molto il buffet.'),
    t('role.ereditiera', 1378, 1420, 'loc.hall', 'Chiede al portiere di provare a chiamare la suite.'),
    t('role.cantante', 1265, 1360, 'loc.sala-ballo', 'Canta la prima parte del programma.'),
    t('role.cantante', 1368, 1380, 'loc.terrazza', 'Prende aria al riparo della vetrata durante la pausa.'),
    t('role.cantante', 1390, 1420, 'loc.sala-ballo', 'Riprende con la seconda parte, più corta del previsto.'),
    t('role.fotografo', 1270, 1345, 'loc.sala-ballo', 'Scatta il brindisi delle dieci e le maschere migliori.'),
    t('role.fotografo', 1352, 1368, 'loc.hall', 'Cambia il rullino nel ripostiglio dietro il bancone.'),
    t('role.fotografo', 1375, 1420, 'loc.sala-ballo', 'Torna in sala e fotografa il tavolo dei liguri.'),
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
    s('clue.toppa-libera', 'critico', 1, 'loc.corridoio-quarto', 'serratura'),
    s('clue.cera-serratura', 'critico', 2, 'loc.suite-404', 'serratura'),
    s('clue.doppione-fabbro', 'critico', 2, 'loc.hall', 'casellario'),
    s('clue.passe-partout-mancante', 'utile', 1, 'loc.hall', 'quadro-chiavi'),
    s('clue.gancio-vuoto', 'falsa-pista', 1, null, null),
    s('clue.registro-chiavi', 'utile', 1, 'loc.hall', 'bancone', {
      kind: 'orario',
      prompt: 'A che ora il registro segna la riconsegna della chiave della saletta da gioco?',
      options: ['21:40', '22:12', '22:55'],
      answer: '22:12',
      hint: 'La riga della 404 è scritta sopra; quella della saletta viene subito dopo, con le stesse iniziali.',
    }),
    s('clue.olio-cardine', 'falsa-pista', 2, 'loc.suite-404', 'armadio'),
    s('clue.porta-passaggio', 'falsa-pista', 2, 'loc.corridoio-quarto', 'porta-servizio'),
    s('clue.impronta-farina', 'utile', 2, 'loc.passaggio', 'scala'),
    s('clue.filo-lame', 'critico', 2, 'loc.passaggio', 'gancio'),
    s('clue.voci-nella-404', 'utile', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.pausa-orchestra', 'utile', 2, 'loc.sala-ballo', 'pedana'),
    s('clue.registro-centralino', 'contorno', 2, 'loc.hall', 'centralino'),
    s('clue.cuffie-marisa', 'falsa-pista', 2, 'loc.hall', 'tenda'),
    s('clue.sveglia-avanti', 'falsa-pista', 1, 'loc.suite-404', 'comodino'),
    s('clue.orologio-sala', 'falsa-pista', 1, 'loc.sala-ballo', 'orologio'),
    s('clue.polaroid-sala', 'falsa-pista', 2, 'loc.sala-ballo', 'buffet'),
    s('clue.foto-scartata', 'falsa-pista', 2, null, null),
    s('clue.quaderno-quadro', 'falsa-pista', 2, null, null),
    s('clue.leva-abbassata', 'falsa-pista', 2, null, null),
    s('clue.ascensore-fermo', 'utile', 1, 'loc.hall', 'quadro-luminoso'),
    s('clue.cambiale', 'critico', 2, 'loc.suite-404', 'cassaforte'),
    s('clue.libro-conti-sala', 'utile', 2, 'loc.hall', 'scrivania-portiere'),
    s('clue.lettera-ricatto', 'critico', 2, 'loc.suite-404', 'scrivania'),
    s('clue.busta-vuota', 'utile', 1, 'loc.suite-404', 'cestino'),
    s('clue.telegramma-notaio', 'falsa-pista', 1, 'loc.suite-404', 'vassoio-te'),
    s('clue.agenda-malaspina', 'falsa-pista', 1, 'loc.suite-404', 'scrivania'),
    s('clue.scarpe-asciutte', 'contorno', 1, 'loc.hall', 'guardaroba'),
    s('clue.finestra-socchiusa', 'contorno', 1, 'loc.suite-404', 'finestra'),
    s('clue.bicchiere-due', 'contorno', 1, 'loc.suite-404', 'tavolino'),
    s('clue.vassoio-intatto', 'contorno', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.guanto-spaiato', 'falsa-pista', 1, null, null),
    s('clue.fazzoletto-cifrato', 'utile', 1, 'loc.suite-404', 'portacenere'),
    s('clue.ricevuta-farmacia', 'falsa-pista', 1, null, null),
    s('clue.biglietto-camerino', 'falsa-pista', 2, null, null),
    s('clue.registro-lavanderia', 'falsa-pista', 3, null, null),
  ],

  inferences: [
    {
      id: 'inf.stanza-non-chiusa',
      text: 'La 404 non è stata chiusa dall’interno: la toppa era libera e la chiave era sul comodino. Quella porta è stata girata dal corridoio.',
      concludes: 'support',
      paths: [['fact.toppa', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.metodo-doppione',
      text: 'Chi ha girato la chiave dal corridoio ne aveva una seconda: la serratura era stata calcata in cera e a Laigueglia ne era uscita una copia.',
      concludes: 'method',
      paths: [
        ['fact.toppa', 'fact.calco'],
        ['fact.doppione', 'fact.passe'],
      ],
    },
    {
      id: 'inf.metodo-chiusura-esterna',
      text: 'Il passe-partout dei piani non è uscito dal quadro delle chiavi. L’unica chiave in più che circolava quella notte era la copia dell’8 gennaio.',
      concludes: 'method',
      paths: [
        ['fact.toppa', 'fact.doppione'],
        ['fact.calco', 'fact.passe'],
      ],
    },
    {
      id: 'inf.movente-cambiali',
      text: 'Malaspina non voleva essere pagato: voleva un pretesto. La cambiale in scadenza e la lettera con la questura dicono che il tempo era finito.',
      concludes: 'motive',
      paths: [
        ['fact.cambiale', 'fact.lettera'],
        ['fact.conti-sala', 'fact.busta'],
      ],
    },
    {
      id: 'inf.movente-questura',
      text: 'Chi teneva il banco per conto dell’albergo non rischiava il pignoramento ma la denuncia: l’ammanco della saletta pesava più della cambiale.',
      concludes: 'motive',
      paths: [
        ['fact.cambiale', 'fact.busta'],
        ['fact.conti-sala', 'fact.lettera'],
      ],
    },
    {
      id: 'inf.colpevole-materiale',
      text: 'Il panno verde sul gancio del passaggio e la cifra sul fazzoletto della 404 portano nello stesso posto la stessa persona: chi teneva il banco della saletta.',
      concludes: 'culprit',
      paths: [
        ['fact.filo', 'fact.fazzoletto'],
        ['fact.doppione', 'fact.voci'],
      ],
    },
    {
      id: 'inf.colpevole-temporale',
      text: 'Alle 22:12 lascia il tavolo, alle 22:35 in sala non si balla e l’ascensore è fermo: nei minuti in cui dice di aver ballato era al quarto piano.',
      concludes: 'culprit',
      paths: [
        ['fact.registro-chiavi', 'fact.orchestra'],
        ['fact.impronta', 'fact.ascensore'],
      ],
    },
    {
      id: 'inf.sequenza',
      text: 'Sale alle 22:15, discute fino alle 22:35, esce nel corridoio, gira la chiave gemella e scende dal passaggio mentre l’orchestra tace.',
      concludes: 'sequence',
      paths: [['fact.registro-chiavi', 'fact.voci', 'fact.orchestra', 'fact.toppa']],
    },
    {
      id: 'inf.finestra-esclusa',
      text: 'Dalla finestra non è passato nessuno: sotto ci sono quattro piani di scogliera e il fermo è arrugginito in quella posizione da settimane.',
      concludes: 'support',
      paths: [['fact.finestra', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.alibi-falso',
      text: 'Chi rientra dalla terrazza porta il sale sulle suole. Un paio di scarpe asciutte in hall vale quanto una smentita, e cade proprio nei minuti della pausa.',
      concludes: 'support',
      paths: [['fact.scarpe', 'fact.orchestra']],
    },
    {
      id: 'inf.ora-vera',
      text: 'Alle 22:50 il telefono della 404 squillò a vuoto per undici secondi. Da quel momento in poi, nella suite, non rispondeva più nessuno.',
      concludes: 'support',
      paths: [['fact.centralino', 'fact.linea-caduta']],
    },
    {
      id: 'inf.esitazione',
      text: 'Due cognac versati e uno mai toccato: chi è salito è stato ricevuto come un ospite, e per un quarto d’ora la cosa somigliava a una trattativa.',
      concludes: 'support',
      paths: [['fact.bicchieri', 'fact.vassoio']],
    },
  ],

  contradictions: [
    {
      id: 'contra.terrazza-asciutta',
      a: 'fact.scarpe',
      b: 'fact.dich-terrazza',
      text: 'Chi rientra dalla terrazza porta il sale sulle suole per un’ora. Le scarpe asciutte in hall dicono che quella mezz’ora d’aria non c’è stata.',
      implicates: 'role.croupier',
    },
    {
      id: 'contra.quarto-piano',
      a: 'fact.voci',
      b: 'fact.dich-mai-al-quarto',
      text: 'Dietro la porta della 404 si discuteva in due, e nel corridoio, in quel momento, c’era chi giura di non esserci mai salito.',
      implicates: 'role.giornalista',
    },
    {
      id: 'contra.banco-chiuso',
      a: 'fact.registro-chiavi',
      b: 'fact.dich-sempre-al-tavolo',
      text: 'Il registro dice che alle 22:12 il banco era già chiuso. Chi afferma di aver tenuto il tavolo fino alle undici sta leggendo un altro registro.',
      implicates: 'role.croupier',
    },
  ],

  roleProfiles: [
    {
      roleId: 'role.ereditiera',
      declaredAlibi:
        'In sala da ballo dalle nove, vicino al buffet, fino a quando mio padre non è sceso per il brindisi. Poi in hall, a farlo chiamare.',
      trueTimeline: [
        t('role.ereditiera', 1260, 1370, 'loc.sala-ballo', 'Balla poco e sorveglia molto il buffet.'),
        t('role.ereditiera', 1378, 1420, 'loc.hall', 'Chiede al portiere di provare a chiamare la suite.'),
      ],
      secretId: 'sec.procura-falsa',
      objectiveId: 'goal.indice',
      exclusiveClueId: 'clue.gancio-vuoto',
      declarations: [
        { key: 'verita', text: 'Mio padre è salito alle dieci e cinque. Gliel’ho detto io che la camicia era da cambiare.' },
        { key: 'omissione', text: 'Abbiamo discusso questa mattina. Di conti, come sempre. Non è una notizia.' },
        { key: 'bugia', text: 'Non ho mai chiesto una procura a mio padre. Firmo quello che mi mette davanti, e nulla di più.' },
      ],
      shareable: [
        'Il gancio della 404 è vuoto dalle nove e due: la chiave l’ha ritirata lui.',
        'Mio padre non rimandava mai un brindisi che aveva annunciato.',
      ],
      hidden: ['Sui contratti dell’ultimo anno la firma di mio padre l’ho imitata io, e bene.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Sul palco dalle dieci, poi in terrazza durante la pausa dell’orchestra, poi di nuovo sul palco fino alla fine.',
      trueTimeline: [
        t('role.cantante', 1265, 1360, 'loc.sala-ballo', 'Canta la prima parte del programma.'),
        t('role.cantante', 1368, 1380, 'loc.terrazza', 'Prende aria al riparo della vetrata.'),
        t('role.cantante', 1390, 1420, 'loc.sala-ballo', 'Riprende con la seconda parte.'),
      ],
      secretId: 'sec.matrimonio-annullato',
      objectiveId: 'goal.parola-buona',
      exclusiveClueId: 'clue.biglietto-camerino',
      declarations: [
        { key: 'verita', text: 'La pausa è cominciata alle dieci e trentacinque. Il maestro la segna sempre sul foglio.' },
        { key: 'omissione', text: 'Il signor Malaspina mi aveva chiesto di passare da lui, sì. Dopo lo spettacolo, però.' },
        { key: 'bugia', text: 'Nel camerino non c’era nessun biglietto. Lo specchio lo guardo io per prima, e l’avrei visto.' },
      ],
      shareable: [
        'L’orchestra ha smesso alle dieci e trentacinque e ha ripreso alle dieci e cinquantadue.',
        'Dalla terrazza, quando c’è mareggiata, si rientra bagnati fino alle caviglie.',
      ],
      hidden: ['Un matrimonio annullato a Trieste, e il documento non è più dove l’avevo lasciato.'],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'In sala fino alle dieci e mezza, poi in hall a cambiare il rullino nel ripostiglio, poi ancora in sala fino alla fine.',
      trueTimeline: [
        t('role.fotografo', 1270, 1345, 'loc.sala-ballo', 'Scatta il brindisi delle dieci.'),
        t('role.fotografo', 1352, 1368, 'loc.hall', 'Cambia il rullino nel ripostiglio.'),
        t('role.fotografo', 1375, 1420, 'loc.sala-ballo', 'Fotografa il tavolo dei liguri.'),
      ],
      secretId: 'sec.foto-vendute',
      objectiveId: 'goal.polaroid',
      exclusiveClueId: 'clue.foto-scartata',
      declarations: [
        { key: 'verita', text: 'La polaroid del brindisi l’ho scattata io: dietro si legge l’orologio della sala, se avete gli occhi.' },
        { key: 'omissione', text: 'Ho scattato anche in corridoio. Roba mossa, buttata. Non fotografo le porte per mestiere.' },
        { key: 'bugia', text: 'Al Méridien non ho mai venduto niente a nessuno. Le mie stampe le brucio, quando me lo chiedono.' },
      ],
      shareable: [
        'L’orologio della sala nella mia polaroid segna le ventidue e zero due.',
        'In corridoio, al secondo piano, alle dieci e venti c’era una porta di servizio aperta.',
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
      exclusiveClueId: 'clue.ricevuta-farmacia',
      declarations: [
        { key: 'verita', text: 'Sono rientrato dalla terrazza con le scarpe fradice. Chiedetelo al guardaroba, hanno riso.' },
        { key: 'omissione', text: 'Conoscevo bene le abitudini di Corrado. Alcune non le racconterò stasera.' },
        { key: 'bugia', text: 'Non ho mai firmato un certificato che non fosse dovuto. Trent’anni di mestiere e nessuna macchia.' },
      ],
      shareable: [
        'Chi torna dalla terrazza stanotte ha il sale sulle suole: si vede a un metro.',
        'Corrado saliva a cambiarsi la camicia sempre alla stessa ora, ogni sera di ballo.',
      ],
      hidden: ['Ho firmato un certificato di comodo, e Corrado ne aveva tenuto una copia.'],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'In hall fino alle nove e mezza per la posta e la pelliccia, poi al mio tavolo vicino all’orchestra, dove sono rimasta.',
      trueTimeline: [
        t('role.contessa', 1250, 1300, 'loc.hall', 'Fa portare la pelliccia in guardaroba.'),
        t('role.contessa', 1310, 1420, 'loc.sala-ballo', 'Non si muove dal tavolo vicino all’orchestra.'),
      ],
      secretId: 'sec.gioielli-rifatti',
      objectiveId: 'goal.due-domande',
      exclusiveClueId: 'clue.registro-lavanderia',
      declarations: [
        { key: 'verita', text: 'Il croupier non era in sala durante la pausa. Il mio tavolo guarda la porta, e la porta non mente.' },
        { key: 'omissione', text: 'Prestai del denaro a Malaspina nel Sessantadue. Non chiedetemi se me lo abbia restituito.' },
        { key: 'bugia', text: 'Questa parure è la stessa che porto da trent’anni. Mio marito la fece montare a Torino.' },
      ],
      shareable: [
        'Durante la pausa dell’orchestra il tavolo verde era chiuso e il croupier non si vedeva.',
        'La lavanderia ha aggiunto una riga stasera, con un’altra penna: due tovaglie bruciate.',
      ],
      hidden: ['I gioielli veri sono stati venduti a Nizza nel Sessantaquattro: questi sono strass.'],
    },
    {
      roleId: 'role.campione',
      declaredAlibi:
        'In terrazza a firmare autografi fino alle dieci e mezza, poi in sala a ballare fino a quando non hanno chiuso le porte.',
      trueTimeline: [
        t('role.campione', 1300, 1355, 'loc.terrazza', 'Firma autografi al riparo della vetrata.'),
        t('role.campione', 1362, 1420, 'loc.sala-ballo', 'Balla con chiunque glielo chieda.'),
      ],
      secretId: 'sec.gara-aggiustata',
      objectiveId: 'goal.scudo',
      exclusiveClueId: 'clue.leva-abbassata',
      declarations: [
        { key: 'verita', text: 'In terrazza c’era il dottore, e prima di lui la cantante. Ci siamo salutati, faceva un freddo cane.' },
        { key: 'omissione', text: 'Malaspina mi aveva anticipato dei soldi. Cose di sport, si sistemano fra uomini.' },
        { key: 'bugia', text: 'Il secondo posto di settembre me lo sono guadagnato in curva, non in un ufficio.' },
      ],
      shareable: [
        'La leva del quarto piano nel quadro elettrico ha un’unghiata fresca sulla vernice.',
        'In terrazza, dalle dieci alle dieci e mezza, eravamo in quattro e ci siamo visti tutti.',
      ],
      hidden: ['Il piazzamento di settembre era stato deciso il giorno prima, in un ufficio.'],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'In sala a prendere appunti fino alle dieci e venti, poi in hall al bancone ad aspettare che Malaspina scendesse.',
      trueTimeline: [
        t('role.giornalista', 1260, 1330, 'loc.sala-ballo', 'Prende appunti in piedi.'),
        t('role.giornalista', 1340, 1352, 'loc.corridoio-quarto', 'Sale a cercare Malaspina per una domanda.', true),
        t('role.giornalista', 1360, 1420, 'loc.hall', 'Aspetta al bancone, con il cappotto sul braccio.'),
      ],
      secretId: 'sec.articolo-pronto',
      objectiveId: 'goal.tre-carte',
      exclusiveClueId: 'clue.quaderno-quadro',
      declarations: [
        { key: 'verita', text: 'Scrivo un pezzo sui conti dell’albergo. Malaspina lo sapeva e non gli faceva piacere.' },
        { key: 'omissione', text: 'Ho chiesto due volte al bancone se il proprietario fosse sceso. Due volte mi hanno detto di no.' },
        {
          key: 'bugia',
          text: 'Al quarto piano non sono mai salita. Ho aspettato in hall come tutti gli altri.',
          asserts: 'fact.dich-mai-al-quarto',
        },
      ],
      shareable: [
        'Il quaderno dei turni segna un intervento al quadro generale alle ventitré e sei.',
        'Il libro della saletta da gioco ha i saldi di dicembre riscritti sopra.',
      ],
      hidden: ['L’articolo è già scritto: mancano due righe e una fotografia.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Al tavolo verde fino alle undici passate e, quando il banco era chiuso, un quarto d’ora d’aria in terrazza. Poi di nuovo in sala.',
      trueTimeline: [
        t('role.croupier', 1250, 1332, 'loc.hall', 'Tiene il banco della saletta e passa dal bancone.'),
        t('role.croupier', 1338, 1355, 'loc.suite-404', 'Nella 404: cambiali e questura.', true),
        t('role.croupier', 1358, 1362, 'loc.passaggio', 'Scende la scala di servizio.', true),
        t('role.croupier', 1364, 1370, 'loc.cucina', 'Attraversa la cucina.', true),
        t('role.croupier', 1376, 1420, 'loc.sala-ballo', 'Rientra in sala.'),
      ],
      secretId: 'sec.debito-gioco',
      objectiveId: 'goal.silenzio',
      exclusiveClueId: 'clue.guanto-spaiato',
      declarations: [
        { key: 'verita', text: 'La chiave della saletta l’ho riportata io al bancone. Bramante ha scritto la riga davanti a me.' },
        {
          key: 'omissione',
          text: 'Ho tenuto il banco per tutta la serata, come sempre. Il tavolo verde non si lascia mai scoperto.',
          asserts: 'fact.dich-sempre-al-tavolo',
        },
        {
          key: 'bugia',
          text: 'Fra le dieci e le undici non ho lasciato la sala e la terrazza. Un po’ d’aria, e sono rientrato.',
          asserts: 'fact.dich-terrazza',
        },
      ],
      shareable: [
        'Il passe-partout dei piani è rimasto al suo gancio: il cartellino è ancora bianco.',
        'Sotto la poltrona della 404 c’era un guanto da sera, spaiato e rammendato.',
      ],
      hidden: ['La copia della chiave della 404 l’ho ordinata io l’8 gennaio, a Laigueglia.'],
    },
  ],

  witnessLines: {
    'wit.bramante': [
      {
        topic: 'chiavi',
        keywords: ['chiave', '404', 'gancio', 'passe'],
        text: 'La 404 l’ha ritirata lui alle nove e due, signore, e il gancio è rimasto vuoto tutta la sera. Il passe-partout dei piani, invece, non l’ha chiesto nessuno: il cartellino è ancora bianco.',
        reveals: ['fact.gancio', 'fact.passe'],
        fromAct: 1,
      },
      {
        topic: 'registro',
        keywords: ['registro', 'saletta', 'riconsegna'],
        text: 'Alle dieci e dodici il signor Lo Faro ha chiuso il banco e mi ha riportato la chiave della saletta. La riga l’ho scritta io, con la stessa penna di quella sopra. Io non guardo, signore: io registro.',
        reveals: ['fact.registro-chiavi'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['ascensore', 'fermo', 'scale'],
        text: 'Il fermo dell’ascensore era inserito, dalle dieci e mezza. Io non guardo chi sale: guardo la lampadina gialla del quadro, e quella era accesa fino alle undici e dodici.',
        reveals: ['fact.ascensore'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'rumori',
        keywords: ['voci', '404', 'discussione'],
        text: 'Rifacevo il carrello. Nella 404 parlavano in due e non erano contenti. Uno ha detto: io il banco l’ho tenuto per lei. Erano le dieci e diciotto: guardo l’orologio quando conto le federe.',
        reveals: ['fact.voci'],
        fromAct: 1,
      },
      {
        topic: 'camere',
        keywords: ['vassoio', 'carrello', 'tè'],
        text: 'Il vassoio delle nove e quaranta è ancora sul carrello, con il tovagliolo piegato come l’ha mandato la cucina. Nella 404 non è mai entrato. Le camere non mentono.',
        reveals: ['fact.vassoio'],
        fromAct: 1,
      },
      {
        topic: 'passaggio',
        keywords: ['passaggio', 'porta', 'tovagliolo'],
        text: 'Il tovagliolo sotto la porta di servizio ce lo metto io, tutte le sere. Sennò resto chiusa fuori con il carrello e devo fare il giro dal corridoio, che con la moquette è una pena.',
        reveals: ['fact.porta-passaggio'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cucina',
        keywords: ['farina', 'sacco', 'impronta'],
        text: 'Il sacco di farina l’ha sfondato il garzone ieri sera. Ho detto: lasciate, si pulisce domani. Domani è oggi, e la striscia bianca arriva ancora fino alla scala di servizio.',
        reveals: ['fact.impronta'],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['passaggio', 'papillon', 'cucina'],
        text: 'Alle dieci e trentotto è passato uno in papillon, dal passaggio verso la sala. Io stavo mandando fuori i freddi e non mi sono voltato: ho visto due spalle e basta.',
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
        keywords: ['404', 'chiamata', 'undici secondi'],
        text: 'Alle ventidue e cinquanta ho collegato la 404. Undici secondi: li ho contati io, come sempre. Nessuno ha alzato la cornetta e ho chiuso.',
        reveals: ['fact.centralino'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['orologio', 'ora', 'sala'],
        text: 'Il mio orologio è quello dell’ufficio postale di Alassio. Se un altro orologio dell’albergo dice un’ora diversa, l’errore non è mio: quello della sala è avanti di due minuti da sempre.',
        reveals: ['fact.orologio-sala'],
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
        topic: 'ascensore',
        keywords: ['fermo', 'cabina', 'piano'],
        text: 'Il fermo lo inserisce chi vuole tenere la cabina al piano. Non serve una chiave. Serve soltanto sapere che c’è.',
        reveals: [],
        fromAct: 2,
      },
    ],
  },

  falseReconstruction: {
    summary:
      'Questa è la sera che devi raccontare. Hai chiuso il banco alle 22:12 perché non veniva più nessuno, hai preso un quarto d’ora d’aria in terrazza con la cantante e il pilota, e alle 22:40 eri di nuovo in sala, dove la contessa può averti visto. Al quarto piano non sei salito: ci è salita la cronista, che cercava Malaspina per una domanda sui conti e che al bancone ha chiesto di lui due volte. Se qualcuno tira fuori il registro delle chiavi, ricorda che quella riga la scrisse Bramante e che riguarda la saletta, non la 404.',
    timeline: [
      t('role.croupier', 1250, 1332, 'loc.hall', 'Al banco della saletta fino alla chiusura.'),
      t('role.croupier', 1338, 1370, 'loc.sala-ballo', 'Balla e saluta il tavolo della contessa.'),
      t('role.croupier', 1376, 1390, 'loc.terrazza', 'Un quarto d’ora d’aria con gli altri.'),
      t('role.croupier', 1396, 1420, 'loc.sala-ballo', 'Rientra e chiede del brindisi.'),
      t('role.giornalista', 1340, 1360, 'loc.corridoio-quarto', 'Sale al quarto piano e resta lì venti minuti.'),
    ],
    scapegoatRoleId: 'role.giornalista',
  },

  texts: {
    reveal:
      'La chiave della 404 era sul comodino, dentro la stanza, e nella toppa non c’era niente. Una porta chiusa a chiave con la chiave rimasta dentro non è una porta chiusa dall’interno: è una porta che qualcuno ha chiuso dal corridoio. Per farlo serviva una seconda chiave, e la seconda chiave era stata ordinata l’8 gennaio alla ferramenta di Laigueglia, sull’impronta di cera presa dalla serratura. Il nome sulla ricevuta è scritto a matita, in una calligrafia che al Méridien si vede ogni sera sui registri del tavolo verde.',
    explanation:
      'Tancredi Lo Faro teneva il banco della saletta da gioco per conto dell’albergo, e per conto proprio ne teneva un secondo. Quando l’ammanco è diventato impossibile da riscrivere, Malaspina non ha chiesto il denaro: ha scritto una lettera che parlava di questura e l’ha lasciata nel cassetto perché la si trovasse. Alle 22:12 il croupier chiude il banco e sale. Alle 22:18 la governante sente due voci. Alle 22:35 esce, gira due volte la copia della chiave e scende dal passaggio di servizio, dove un gancio da carrello gli strappa dalla manica un filo del panno verde. La firma che non poteva evitare di lasciare è quella: tre dita di stoffa che al Méridien riveste un solo tavolo.',
    victoryInnocents:
      'Il commissario arriva via mare alle sei e trova il verbale già scritto: la ricevuta del fabbro, il filo verde, il registro delle chiavi e la lettera mai imbucata, in quest’ordine. Lo Faro non discute. Chiede soltanto di poter riporre le fiches nella cassetta, e lo fa con le stesse mani ferme di sempre.',
    victoryCulprit:
      'All’alba il verbale indica una cronista milanese che aveva chiesto due volte del proprietario. Lo Faro esce sulla terrazza a fumare per la prima volta in vent’anni e conta gli anni che gli restano. La ricevuta di Laigueglia è ancora nel casellario, ma nessuno la cerca più.',
    defeat:
      'L’indizio che avete lasciato passare è la toppa libera: sembrava una curiosità e invece era tutto il caso. Se la chiave era dentro e la serratura vuota, la porta l’ha girata qualcuno da fuori. Era comprensibile non fermarsi lì: quella notte c’erano una lettera, una cambiale e ottanta maschere che parlavano tutte insieme.',
  },
};
