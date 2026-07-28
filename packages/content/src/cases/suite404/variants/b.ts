import type { VariantDef } from '@meridien/engine';
import { factsWith } from '../clues.js';
import { s, t } from '../world.js';

/**
 * VARIANTE B — «L’ora spostata».
 * Colpevole: Ottavia Malaspina, la figlia. Movente: l’eredità.
 * Metodo: gli orologi. L’orologio della sala indietro di venticinque minuti,
 * la sveglia della suite avanti di altrettanti: un’ora che non è mai esistita.
 */

export const varianteOraSpostata: VariantDef = {
  id: 'var.ora-spostata',
  name: 'L’ora spostata',
  tagline: 'Tutti sanno dov’erano alle dieci e venti. Nessuno sa che ora fosse davvero, alle dieci e venti.',
  culpritRoleId: 'role.ereditiera',
  motiveKey: 'eredita',
  methodKey: 'orologio-manipolato',
  sequence: ['beat.bugia', 'beat.incontro', 'beat.gesto', 'beat.uscita', 'beat.scoperta'],
  beatDetails: {
    'beat.bugia':
      'Alle 21:20, mentre l’orchestra accorda, sposta indietro di venticinque minuti l’orologio a muro della sala da ballo.',
    'beat.incontro':
      'Alle 22:15 è nella 404, dove il padre l’aspettava: nell’agenda c’era scritto «O. — ore 22, la 404».',
    'beat.gesto':
      'Alle 22:32 la discussione sull’atto di revoca finisce. Dalla suite parte una chiamata di quaranta secondi senza parole.',
    'beat.uscita':
      'Rimette il passe-partout al gancio senza firmare, sposta avanti la sveglia sul comodino e scende dal passaggio.',
    'beat.scoperta':
      'Alle 23:26 la porta cede. Nella suite un orologio dice un’ora, in sala un altro ne dice un’altra, e nessuna delle due è vera.',
  },

  facts: factsWith(
    {
      'fact.toppa':
        'Nella serratura della 404, dalla parte della camera, non c’era nessuna chiave: quella porta poteva essere girata dal corridoio.',
      'fact.passe':
        'Il passe-partout dei piani è tornato al suo gancio senza firma di riconsegna: qualcuno lo ha preso e rimesso fuori registro.',
      'fact.registro-chiavi':
        'Sul registro non c’è nessun movimento della 404 dopo le 21:02, e la riga del passe-partout non è mai stata scritta.',
      'fact.orologio-sala':
        'L’orologio a muro della sala da ballo è indietro di venticinque minuti sul centralino: domenica il portiere lo aveva messo in orario.',
      'fact.sveglia':
        'La sveglia da viaggio della 404 è avanti di venticinque minuti sul centralino, e la corda è ancora lunga: non si è spostata da sola.',
      'fact.polaroid':
        'La polaroid mostra la signorina Malaspina davanti al buffet e, sopra le teste, l’orologio della sala sulle 22:20.',
      'fact.centralino':
        'Alle 22:32 dalla 404 è stata sollevata la cornetta e riabbassata dopo quaranta secondi, senza che partisse nessuna chiamata.',
      'fact.cuffie':
        'La centralinista ricorda che in quei quaranta secondi dalla 404 arrivava una voce di donna, e due parole soltanto.',
      'fact.notaio-telegramma':
        'Il telegramma dello studio Ravera dice: «pronto atto di revoca del legato, attendo istruzioni lunedì».',
      'fact.agenda':
        'Nell’agenda, alla riga del 12 gennaio, cancellato e riscritto: «O. — ore 22, la 404. L’ultima volta».',
      'fact.lettera':
        'Malaspina aveva scritto e non spedito: «se lunedì non firmi la rinuncia, il legato va all’ospedale di Albenga».',
      'fact.busta':
        'La busta vuota nel cestino della 404 porta sul davanti le iniziali O. M. ed è stata aperta stasera con il tagliacarte.',
      'fact.filo':
        'Il filo rimasto sul gancio del passaggio è di lamé argento: in tutta la sala, quella sera, un solo abito era d’argento.',
      'fact.impronta':
        'L’impronta nella farina è di una scarpa da sera da donna, numero 37, con il tacco sottile affondato nel bianco.',
      'fact.voci':
        'Alle 22:20 nella 404 discutevano un uomo e una donna. La donna ha detto: «non firmerai niente».',
      'fact.orchestra':
        'Il foglio del maestro segna la pausa dalle 22:35 alle 22:52 e, a matita, l’annotazione: «orologio indietro, avvisare Bramante».',
      'fact.ascensore':
        'Il fermo dell’ascensore è stato inserito alle 22:10 e tolto alle 22:44: in quei minuti la cabina è rimasta al quarto piano.',
      'fact.scarpe':
        'Le scarpe da sera asciutte lasciate in hall sono del pilota, che dice di aver firmato autografi in terrazza per mezz’ora.',
      'fact.doppione':
        'La ricevuta del doppione della 404 è intestata all’albergo: la copia serviva al mazzo di riserva del quarto piano.',
      'fact.calco':
        'Le scaglie di cera nella serratura sono vecchie di mesi: il fabbro rifece tutte le serrature del piano in ottobre.',
      'fact.cambiale':
        'La cambiale in cassaforte è firmata da un ospite e scade il 31 gennaio: Malaspina ne teneva una per quasi tutti.',
      'fact.conti-sala':
        'I saldi della saletta sono riscritti perché il croupier rifà i conti a fine mese, prima a matita e poi a penna.',
      'fact.fazzoletto':
        'Il fazzoletto ripiegato nel portacenere della 404 porta la cifra I. Z. ed è lì da giovedì, dice la governante.',
      'fact.cardini':
        'I cardini dietro l’armadio sono stati oliati a novembre dal tuttofare, insieme a quelli di tutto il piano.',
      'fact.porta-passaggio':
        'Il tovagliolo sotto la porta del passaggio lo mette ogni sera la cameriera del quarto piano, per non restare chiusa fuori.',
      'fact.leva-quadro':
        'L’unghiata sulla leva del quarto piano è del 3 gennaio, la sera in cui la linea saltò per la neve.',
      'fact.quaderno-turni':
        'Il quaderno dei turni segna due interventi: 19:40 in cucina, 23:06 al quadro generale.',
      'fact.foto-scartata':
        'La stampa scartata è mossa: si intravedono soltanto la vetrata della terrazza e la balaustra sotto la pioggia.',
      'fact.biglietto':
        'Il biglietto nello specchio del camerino dice: «stasera due pezzi in più, il maestro è d’accordo».',
      'fact.lavanderia':
        'La riga aggiunta in lavanderia riguarda due tovaglie della sala, bruciate da una candela durante la cena.',
      'fact.bicchieri':
        'Nella 404 due cognac erano stati versati: Malaspina ne versava sempre due, anche quando restava solo.',
      'fact.vassoio':
        'Il vassoio delle 21:40 non è mai entrato nella suite: fino alle 22 Malaspina non ha aperto a nessuno.',
      'fact.finestra':
        'Il fermo della finestra della 404 è arrugginito aperto da settimane e sotto ci sono quattro piani di scogliera.',
    },
    [
      {
        id: 'fact.dich-sempre-in-sala',
        text: 'Ottavia Malaspina afferma di non aver lasciato la sala da ballo fra le 22 e le 23.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-mai-al-quarto',
        text: 'Ottavia Malaspina afferma di non essere salita al quarto piano dopo cena.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.dich-terrazza',
        text: 'Bertelè afferma di aver passato mezz’ora in terrazza a firmare autografi.',
        kind: 'dichiarazione',
        common: false,
      },
    ],
  ),

  timeline: [
    t('victim', 1260, 1320, 'loc.sala-ballo', 'Riceve gli invitati e annuncia il brindisi delle 23.'),
    t('victim', 1326, 1400, 'loc.suite-404', 'Sale ad aspettare la figlia, come da agenda.', true),
    t('role.ereditiera', 1260, 1325, 'loc.sala-ballo', 'Balla poco; alle 21:20 si ferma sotto l’orologio a muro.'),
    t('role.ereditiera', 1331, 1334, 'loc.corridoio-quarto', 'Sale con la cabina e tiene il fermo inserito.', true),
    t('role.ereditiera', 1335, 1355, 'loc.suite-404', 'Nella 404: l’atto di revoca e la rinuncia da firmare.', true),
    t('role.ereditiera', 1358, 1362, 'loc.passaggio', 'Scende dalla scala di servizio, di fretta.', true),
    t('role.ereditiera', 1364, 1368, 'loc.cucina', 'Attraversa la cucina evitando i camerieri.', true),
    t('role.ereditiera', 1375, 1425, 'loc.sala-ballo', 'Rientra in sala e si fa fotografare al buffet.'),
    t('role.croupier', 1250, 1360, 'loc.hall', 'Tiene il banco della saletta fino alla chiusura.'),
    t('role.croupier', 1368, 1425, 'loc.sala-ballo', 'Balla e chiede del brindisi annunciato.'),
    t('role.cantante', 1265, 1355, 'loc.sala-ballo', 'Canta la prima parte del programma.'),
    t('role.cantante', 1362, 1378, 'loc.terrazza', 'Prende aria durante la pausa dell’orchestra.'),
    t('role.cantante', 1386, 1425, 'loc.sala-ballo', 'Riprende con la seconda parte.'),
    t('role.fotografo', 1270, 1385, 'loc.sala-ballo', 'Scatta la polaroid del buffet e le maschere migliori.'),
    t('role.fotografo', 1392, 1425, 'loc.hall', 'Cambia il rullino nel ripostiglio dietro il bancone.'),
    t('role.medico', 1260, 1350, 'loc.sala-ballo', 'Siede al tavolo dei liguri.'),
    t('role.medico', 1358, 1378, 'loc.terrazza', 'Fuma appoggiato alla balaustra.'),
    t('role.medico', 1386, 1425, 'loc.hall', 'Aspetta accanto al bancone.'),
    t('role.contessa', 1250, 1300, 'loc.hall', 'Si fa dare la posta e consegna la pelliccia.'),
    t('role.contessa', 1310, 1425, 'loc.sala-ballo', 'Non si muove dal tavolo vicino all’orchestra.'),
    t('role.campione', 1290, 1355, 'loc.sala-ballo', 'Balla e si fa fotografare con chiunque.'),
    t('role.campione', 1362, 1400, 'loc.terrazza', 'Fuma al riparo della vetrata, da solo.'),
    t('role.campione', 1408, 1425, 'loc.sala-ballo', 'Rientra quando l’orchestra ha già smesso.'),
    t('role.giornalista', 1260, 1340, 'loc.sala-ballo', 'Prende appunti in piedi, vicino alla porta.'),
    t('role.giornalista', 1348, 1425, 'loc.hall', 'Aspetta al bancone che il proprietario scenda.'),
    t('wit.bramante', 1200, 1435, 'loc.hall', 'Al bancone, come tutte le notti.'),
    t('wit.ottonello', 1200, 1435, 'loc.hall', 'Dietro la tenda del centralino, con le cuffie.'),
    t('wit.coldani', 1300, 1400, 'loc.corridoio-quarto', 'Rifà i carrelli e conta le federe.'),
    t('wit.pesce', 1200, 1420, 'loc.cucina', 'Manda in sala il servizio freddo.'),
    t('wit.bacigalupo', 1380, 1395, 'loc.quadro', 'Rimette in linea il quarto piano dopo il buio.'),
    t('wit.bacigalupo', 1402, 1420, 'loc.passaggio', 'Risale a controllare le lampadine della scala.'),
  ],

  clueSetup: [
    s('clue.toppa-libera', 'utile', 1, 'loc.corridoio-quarto', 'serratura'),
    s('clue.cera-serratura', 'falsa-pista', 2, null, null),
    s('clue.doppione-fabbro', 'falsa-pista', 2, 'loc.hall', 'casellario'),
    s('clue.passe-partout-mancante', 'utile', 1, 'loc.hall', 'quadro-chiavi'),
    s('clue.gancio-vuoto', 'falsa-pista', 1, null, null),
    s('clue.registro-chiavi', 'utile', 2, 'loc.hall', 'bancone'),
    s('clue.olio-cardine', 'falsa-pista', 2, 'loc.suite-404', 'armadio'),
    s('clue.porta-passaggio', 'falsa-pista', 2, 'loc.corridoio-quarto', 'porta-servizio'),
    s('clue.impronta-farina', 'utile', 2, 'loc.passaggio', 'scala'),
    s('clue.filo-lame', 'critico', 2, 'loc.passaggio', 'gancio'),
    s('clue.voci-nella-404', 'utile', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.pausa-orchestra', 'utile', 2, 'loc.sala-ballo', 'pedana'),
    s('clue.registro-centralino', 'utile', 2, 'loc.hall', 'centralino', {
      kind: 'orario',
      prompt: 'A che ora il brogliaccio segna l’ultima cornetta sollevata nella 404?',
      options: ['21:55', '22:32', '23:05'],
      answer: '22:32',
      hint: 'Le righe della 404 sono tre: guarda quella con durata quaranta secondi e nessun numero chiamato.',
    }),
    s('clue.cuffie-marisa', 'utile', 2, 'loc.hall', 'tenda'),
    s('clue.sveglia-avanti', 'critico', 2, 'loc.suite-404', 'comodino'),
    s('clue.orologio-sala', 'critico', 1, 'loc.sala-ballo', 'orologio'),
    s('clue.polaroid-sala', 'critico', 2, 'loc.hall', 'ripostiglio'),
    s('clue.foto-scartata', 'falsa-pista', 2, 'loc.hall', 'cestino'),
    s('clue.quaderno-quadro', 'falsa-pista', 2, null, null),
    s('clue.leva-abbassata', 'falsa-pista', 2, 'loc.quadro', 'leva'),
    s('clue.ascensore-fermo', 'contorno', 1, 'loc.hall', 'quadro-luminoso'),
    s('clue.cambiale', 'falsa-pista', 2, 'loc.suite-404', 'cassaforte'),
    s('clue.libro-conti-sala', 'falsa-pista', 2, 'loc.hall', 'scrivania-portiere'),
    s('clue.lettera-ricatto', 'critico', 2, 'loc.suite-404', 'scrivania'),
    s('clue.busta-vuota', 'utile', 1, 'loc.suite-404', 'cestino'),
    s('clue.telegramma-notaio', 'critico', 2, 'loc.suite-404', 'vassoio-te'),
    s('clue.agenda-malaspina', 'critico', 1, 'loc.suite-404', 'scrivania'),
    s('clue.scarpe-asciutte', 'falsa-pista', 1, 'loc.hall', 'guardaroba'),
    s('clue.finestra-socchiusa', 'contorno', 1, 'loc.suite-404', 'finestra'),
    s('clue.bicchiere-due', 'contorno', 2, 'loc.suite-404', 'tavolino'),
    s('clue.vassoio-intatto', 'contorno', 1, 'loc.corridoio-quarto', 'carrello'),
    s('clue.guanto-spaiato', 'falsa-pista', 1, null, null),
    s('clue.fazzoletto-cifrato', 'falsa-pista', 1, null, null),
    s('clue.ricevuta-farmacia', 'falsa-pista', 1, null, null),
    s('clue.biglietto-camerino', 'falsa-pista', 2, null, null),
    s('clue.registro-lavanderia', 'falsa-pista', 2, null, null),
  ],

  inferences: [
    {
      id: 'inf.stanza-non-chiusa',
      text: 'La 404 non è stata chiusa dall’interno: la toppa era libera e la chiave era rimasta sul comodino. Quella porta è stata girata dal corridoio.',
      concludes: 'support',
      paths: [['fact.toppa', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.porta-passe',
      text: 'Il passe-partout è tornato al gancio senza firma e sul registro non compare: la porta è stata chiusa con la chiave di servizio, da chi sapeva di poterla rimettere a posto.',
      concludes: 'support',
      paths: [['fact.passe', 'fact.registro-chiavi']],
    },
    {
      id: 'inf.metodo-ora-spostata',
      text: 'Due orologi sbagliati dello stesso quarto d’ora e in direzioni opposte non sono un guasto: sono un lavoro. L’ora del quarto piano non è quella che tutti raccontano.',
      concludes: 'method',
      paths: [
        ['fact.orologio-sala', 'fact.sveglia'],
        ['fact.centralino', 'fact.cuffie'],
      ],
    },
    {
      id: 'inf.metodo-alibi-costruito',
      text: 'La fotografia prova soltanto che cosa segnava un orologio, non che ora fosse. Chi ha spostato le lancette si è costruito venticinque minuti d’aria.',
      concludes: 'method',
      paths: [
        ['fact.polaroid', 'fact.centralino'],
        ['fact.sveglia', 'fact.cuffie'],
      ],
    },
    {
      id: 'inf.movente-eredita',
      text: 'Il notaio aveva pronto l’atto di revoca e il padre aveva fissato l’incontro per le 22. Lunedì il legato sarebbe passato all’ospedale di Albenga.',
      concludes: 'motive',
      paths: [
        ['fact.notaio-telegramma', 'fact.agenda'],
        ['fact.lettera', 'fact.busta'],
      ],
    },
    {
      id: 'inf.movente-legato',
      text: 'La rinuncia da firmare era già in busta, con le iniziali giuste sopra. Non era una minaccia generica: era una scadenza con un nome.',
      concludes: 'motive',
      paths: [
        ['fact.notaio-telegramma', 'fact.busta'],
        ['fact.agenda', 'fact.lettera'],
      ],
    },
    {
      id: 'inf.colpevole-materiale',
      text: 'Lamé argento sul gancio del passaggio e un tacco sottile numero 37 nella farina: dalla scala di servizio, quella sera, è scesa una sola persona così vestita.',
      concludes: 'culprit',
      paths: [
        ['fact.filo', 'fact.impronta'],
        ['fact.voci', 'fact.notaio-telegramma'],
      ],
    },
    {
      id: 'inf.colpevole-temporale',
      text: 'La fotografia che la mostra in sala è stata scattata su un orologio spostato indietro, e la sveglia della suite era spostata avanti dello stesso quarto d’ora. L’appuntamento delle 22 era suo.',
      concludes: 'culprit',
      paths: [
        ['fact.polaroid', 'fact.orologio-sala'],
        ['fact.sveglia', 'fact.agenda'],
      ],
    },
    {
      id: 'inf.sequenza',
      text: 'Sale alle 22:10 con la cabina bloccata al piano, discute fino alle 22:32, rimette a posto chiave e lancette e scende dal passaggio prima della pausa.',
      concludes: 'sequence',
      paths: [['fact.agenda', 'fact.voci', 'fact.ascensore', 'fact.toppa']],
    },
    {
      id: 'inf.finestra-esclusa',
      text: 'Dalla finestra non è passato nessuno: sotto ci sono quattro piani di scogliera e il fermo è arrugginito in quella posizione da settimane.',
      concludes: 'support',
      paths: [['fact.finestra', 'fact.porta-chiusa']],
    },
    {
      id: 'inf.ora-vera',
      text: 'Anche il maestro se n’era accorto: sul suo foglio, accanto alla pausa, c’è scritto a matita di avvisare il portiere che l’orologio della sala andava indietro.',
      concludes: 'support',
      paths: [['fact.orchestra', 'fact.orologio-sala']],
    },
    {
      id: 'inf.esitazione',
      text: 'Due cognac versati e uno mai toccato: chi è salito è stato ricevuto, e per un quarto d’ora la cosa somigliava ancora a una conversazione di famiglia.',
      concludes: 'support',
      paths: [['fact.bicchieri', 'fact.vassoio']],
    },
  ],

  contradictions: [
    {
      id: 'contra.orologio-fotografia',
      a: 'fact.polaroid',
      b: 'fact.dich-sempre-in-sala',
      text: 'La fotografia la mostra al buffet con l’orologio sulle 22:20. Se quell’orologio va indietro di venticinque minuti, la fotografia non prova più niente.',
      implicates: 'role.ereditiera',
    },
    {
      id: 'contra.passaggio-quarto',
      a: 'fact.impronta',
      b: 'fact.dich-mai-al-quarto',
      text: 'Nella farina della scala di servizio è rimasto un tacco sottile numero 37. Chi giura di non essere salita dovrebbe spiegare quale altra scala porta lì.',
      implicates: 'role.ereditiera',
    },
    {
      id: 'contra.terrazza-asciutta',
      a: 'fact.scarpe',
      b: 'fact.dich-terrazza',
      text: 'Mezz’ora di terrazza con questa mareggiata lascia il sale sulle suole. Un paio di scarpe asciutte in hall vale quanto una smentita.',
      implicates: 'role.campione',
    },
  ],

  roleProfiles: [
    {
      roleId: 'role.ereditiera',
      declaredAlibi:
        'In sala da ballo dalle nove alle undici passate, quasi sempre vicino al buffet. C’è anche una fotografia, se serve.',
      trueTimeline: [
        t('role.ereditiera', 1260, 1325, 'loc.sala-ballo', 'Si ferma sotto l’orologio a muro.'),
        t('role.ereditiera', 1331, 1334, 'loc.corridoio-quarto', 'Sale con la cabina.', true),
        t('role.ereditiera', 1335, 1355, 'loc.suite-404', 'Nella 404, con l’atto di revoca sul tavolo.', true),
        t('role.ereditiera', 1358, 1362, 'loc.passaggio', 'Scende dalla scala di servizio.', true),
        t('role.ereditiera', 1364, 1368, 'loc.cucina', 'Attraversa la cucina.', true),
        t('role.ereditiera', 1375, 1425, 'loc.sala-ballo', 'Rientra e si fa fotografare al buffet.'),
      ],
      secretId: 'sec.procura-falsa',
      objectiveId: 'goal.silenzio',
      exclusiveClueId: 'clue.cera-serratura',
      declarations: [
        { key: 'verita', text: 'Mio padre aspettava un atto dal notaio Ravera. Lo aspettava da lunedì e non era di buon umore.' },
        {
          key: 'omissione',
          text: 'Dopo cena non sono salita al quarto piano. Non avevo motivo di salire: ci saremmo visti al brindisi.',
          asserts: 'fact.dich-mai-al-quarto',
        },
        {
          key: 'bugia',
          text: 'Fra le dieci e le undici non ho lasciato la sala nemmeno per un ballo. Il fotografo ha una istantanea che lo dice.',
          asserts: 'fact.dich-sempre-in-sala',
        },
      ],
      shareable: [
        'Le scaglie di cera nella serratura della 404 sono vecchie di mesi: il fabbro rifece il piano in ottobre.',
        'Mio padre aveva convocato il notaio per lunedì, e non per una compravendita.',
      ],
      hidden: ['La firma di mio padre sui contratti dell’ultimo anno è la mia, e l’atto di revoca l’avrebbe dimostrato.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Sul palco fino alla pausa, poi in terrazza a prendere aria con il dottore, poi di nuovo sul palco fino alla fine.',
      trueTimeline: [
        t('role.cantante', 1265, 1355, 'loc.sala-ballo', 'Canta la prima parte.'),
        t('role.cantante', 1362, 1378, 'loc.terrazza', 'Prende aria durante la pausa.'),
        t('role.cantante', 1386, 1425, 'loc.sala-ballo', 'Riprende con la seconda parte.'),
      ],
      secretId: 'sec.matrimonio-annullato',
      objectiveId: 'goal.polaroid',
      exclusiveClueId: 'clue.biglietto-camerino',
      declarations: [
        { key: 'verita', text: 'La pausa è cominciata alle dieci e trentacinque secondo l’orologio della sala. Secondo il mio, alle undici.' },
        { key: 'omissione', text: 'Il signor Malaspina mi aveva chiesto di passare da lui. Non ci sono andata, e adesso mi conviene dirlo.' },
        { key: 'bugia', text: 'Nel camerino non c’era nessun biglietto nello specchio. Lo specchio lo guardo io per prima.' },
      ],
      shareable: [
        'Il mio orologio e quello della sala non vanno d’accordo da stasera, non da sempre.',
        'Il maestro segna sul foglio l’ora di inizio e di fine di ogni pausa.',
      ],
      hidden: ['Un matrimonio annullato a Trieste, e il documento non è più dove lo avevo lasciato.'],
    },
    {
      roleId: 'role.fotografo',
      declaredAlibi:
        'In sala per tutto il ballo, macchina al collo. Sono uscito solo alle undici passate, per cambiare il rullino in hall.',
      trueTimeline: [
        t('role.fotografo', 1270, 1385, 'loc.sala-ballo', 'Scatta la polaroid del buffet.'),
        t('role.fotografo', 1392, 1425, 'loc.hall', 'Cambia il rullino nel ripostiglio.'),
      ],
      secretId: 'sec.foto-vendute',
      objectiveId: 'goal.tre-carte',
      exclusiveClueId: 'clue.quaderno-quadro',
      declarations: [
        { key: 'verita', text: 'La polaroid del buffet l’ho scattata io. Dietro si legge l’orologio della sala: le ventidue e venti.' },
        { key: 'omissione', text: 'Scatto sempre l’ora insieme alla gente. Serve per le didascalie, e qualche volta serve ad altro.' },
        { key: 'bugia', text: 'Al Méridien non ho mai venduto niente a nessuno. Le mie stampe le brucio, quando me lo chiedono.' },
      ],
      shareable: [
        'Nella mia istantanea del buffet l’orologio della sala segna le ventidue e venti.',
        'Il quaderno dei turni segna un intervento al quadro generale alle ventitré e sei.',
      ],
      hidden: ['Due volte ho venduto a un settimanale fotografie scattate qui che avevo promesso di distruggere.'],
    },
    {
      roleId: 'role.medico',
      declaredAlibi:
        'Al tavolo dei liguri fino alle dieci e mezza, poi in terrazza a fumare con la cantante, poi in hall quando hanno cominciato a cercarlo.',
      trueTimeline: [
        t('role.medico', 1260, 1350, 'loc.sala-ballo', 'Siede al tavolo dei liguri.'),
        t('role.medico', 1358, 1378, 'loc.terrazza', 'Fuma appoggiato alla balaustra.'),
        t('role.medico', 1386, 1425, 'loc.hall', 'Aspetta accanto al bancone.'),
      ],
      secretId: 'sec.certificato-compiacente',
      objectiveId: 'goal.mai-il-guanto',
      exclusiveClueId: 'clue.ricevuta-farmacia',
      declarations: [
        { key: 'verita', text: 'Sono rientrato dalla terrazza con le scarpe fradice, e il guardaroba ne ha riso per cinque minuti.' },
        { key: 'omissione', text: 'Corrado litigava con la figlia da tre anni, e non per questioni di carattere.' },
        { key: 'bugia', text: 'Non ho mai firmato un certificato che non fosse dovuto. Trent’anni di mestiere e nessuna macchia.' },
      ],
      shareable: [
        'Chi torna dalla terrazza stanotte ha il sale sulle suole: si vede a un metro di distanza.',
        'Corrado teneva la sveglia da viaggio sul comodino e la caricava ogni sera alle otto.',
      ],
      hidden: ['Ho firmato un certificato di comodo, e Corrado ne aveva tenuto una copia.'],
    },
    {
      roleId: 'role.contessa',
      declaredAlibi:
        'In hall fino alle nove e mezza, poi al mio tavolo vicino all’orchestra, dal quale non mi sono più alzata.',
      trueTimeline: [
        t('role.contessa', 1250, 1300, 'loc.hall', 'Consegna la pelliccia e ritira la posta.'),
        t('role.contessa', 1310, 1425, 'loc.sala-ballo', 'Non si muove dal tavolo vicino all’orchestra.'),
      ],
      secretId: 'sec.gioielli-rifatti',
      objectiveId: 'goal.parola-buona',
      exclusiveClueId: 'clue.registro-lavanderia',
      declarations: [
        { key: 'verita', text: 'Quell’orologio a muro l’ho guardato tutta la sera e non tornava. Alle nostre età si guarda l’ora spesso.' },
        { key: 'omissione', text: 'Prestai del denaro a Malaspina nel Sessantadue. Non chiedetemi se me lo abbia restituito.' },
        { key: 'bugia', text: 'Questa parure è la stessa che porto da trent’anni. Mio marito la fece montare a Torino.' },
      ],
      shareable: [
        'La signorina Malaspina è mancata dalla sala per un quarto d’ora buono, verso le dieci e mezza.',
        'La lavanderia ha aggiunto una riga stasera, con un’altra penna: due tovaglie bruciate.',
      ],
      hidden: ['I gioielli veri sono stati venduti a Nizza nel Sessantaquattro: questi sono strass.'],
    },
    {
      roleId: 'role.campione',
      declaredAlibi:
        'In sala a ballare fino alle dieci e mezza, poi mezz’ora in terrazza a firmare autografi, poi di nuovo dentro.',
      trueTimeline: [
        t('role.campione', 1290, 1355, 'loc.sala-ballo', 'Balla e si fa fotografare.'),
        t('role.campione', 1362, 1400, 'loc.terrazza', 'Fuma al riparo della vetrata, da solo.'),
        t('role.campione', 1408, 1425, 'loc.sala-ballo', 'Rientra a orchestra ferma.'),
      ],
      secretId: 'sec.gara-aggiustata',
      objectiveId: 'goal.due-domande',
      exclusiveClueId: 'clue.gancio-vuoto',
      declarations: [
        { key: 'verita', text: 'In terrazza sono stato, e da solo. Con quel vento gli autografi non li chiede più nessuno.' },
        { key: 'omissione', text: 'Malaspina mi aveva anticipato dei soldi. Cose di sport, si sistemano fra uomini.' },
        {
          key: 'bugia',
          text: 'Mezz’ora buona in terrazza, a firmare autografi, e c’era gente intorno che può dirlo.',
          asserts: 'fact.dich-terrazza',
        },
      ],
      shareable: [
        'Il gancio della 404 è vuoto dalle nove e due: la chiave l’aveva lui.',
        'In terrazza, dalle dieci e mezza in poi, non c’era nessuno oltre a me e al dottore.',
      ],
      hidden: ['Il piazzamento di settembre era stato deciso il giorno prima, in un ufficio.'],
    },
    {
      roleId: 'role.giornalista',
      declaredAlibi:
        'In sala a prendere appunti fino alle dieci e venti, poi in hall al bancone, ad aspettare che il proprietario scendesse.',
      trueTimeline: [
        t('role.giornalista', 1260, 1340, 'loc.sala-ballo', 'Prende appunti in piedi.'),
        t('role.giornalista', 1348, 1425, 'loc.hall', 'Aspetta al bancone.'),
      ],
      secretId: 'sec.articolo-pronto',
      objectiveId: 'goal.indice',
      exclusiveClueId: 'clue.fazzoletto-cifrato',
      declarations: [
        { key: 'verita', text: 'Ho chiesto due volte al bancone se il proprietario fosse sceso. Due volte mi hanno risposto di no.' },
        { key: 'omissione', text: 'Scrivo un pezzo sui conti dell’albergo, non sul ballo. Malaspina lo sapeva benissimo.' },
        { key: 'bugia', text: 'Non ho mai messo le mani nella corrispondenza di nessuno, in vita mia.' },
      ],
      shareable: [
        'Il fazzoletto nel portacenere della 404 porta una cifra che non è quella del proprietario.',
        'Il telegramma delle diciotto e venti veniva da uno studio notarile di Genova.',
      ],
      hidden: ['L’articolo è già scritto: mancano due righe e una fotografia.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Al tavolo verde fino alle undici, e la chiave della saletta l’ho riportata al bancone. Poi in sala fino alla fine.',
      trueTimeline: [
        t('role.croupier', 1250, 1360, 'loc.hall', 'Tiene il banco della saletta.'),
        t('role.croupier', 1368, 1425, 'loc.sala-ballo', 'Balla e chiede del brindisi.'),
      ],
      secretId: 'sec.debito-gioco',
      objectiveId: 'goal.scudo',
      exclusiveClueId: 'clue.guanto-spaiato',
      declarations: [
        { key: 'verita', text: 'Il passe-partout dei piani non l’ha ritirato nessuno: il cartellino della firma è ancora bianco.' },
        { key: 'omissione', text: 'Devo del denaro all’albergo. Lo sanno in tre, e adesso lo sapete tutti.' },
        { key: 'bugia', text: 'I saldi di dicembre li ho riscritti soltanto perché la matita si legge male. Null’altro.' },
      ],
      shareable: [
        'Il passe-partout è al suo gancio, ma la riga della riconsegna non è mai stata scritta.',
        'Sotto la poltrona della 404 c’era un guanto da sera, spaiato e rammendato.',
      ],
      hidden: ['La cambiale in cassaforte è la mia, e scade il 31 gennaio.'],
    },
  ],

  witnessLines: {
    'wit.bramante': [
      {
        topic: 'chiavi',
        keywords: ['chiave', '404', 'passe', 'gancio'],
        text: 'La 404 l’ha ritirata lui alle nove e due. Il passe-partout dei piani, invece, è al suo gancio, ma la riga della riconsegna non l’ha scritta nessuno. Io non guardo, signore: io registro.',
        reveals: ['fact.gancio', 'fact.passe'],
        fromAct: 1,
      },
      {
        topic: 'registro',
        keywords: ['registro', 'riconsegna', 'movimento'],
        text: 'Dopo le nove e due, sul registro, la 404 non ha più un movimento. Né consegne né riconsegne. E la riga del passe-partout manca del tutto, che è una cosa che non era mai successa.',
        reveals: ['fact.registro-chiavi'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['orologio', 'sala', 'domenica'],
        text: 'L’orologio della sala lo carico io la domenica e lo metto sull’ora del centralino. Stasera va indietro di venticinque minuti, e non è un guasto: quella macchina, in sette anni, non ha mai perso un minuto.',
        reveals: ['fact.orologio-sala'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'rumori',
        keywords: ['voci', '404', 'discussione'],
        text: 'Nella 404 parlavano in due, un uomo e una donna, e non erano d’accordo. Lei ha detto: non firmerai niente. Erano le dieci e venti sul mio orologio, che è quello di mia madre e va benissimo.',
        reveals: ['fact.voci'],
        fromAct: 1,
      },
      {
        topic: 'camere',
        keywords: ['vassoio', 'carrello', 'sveglia'],
        text: 'Il vassoio delle nove e quaranta è ancora sul carrello, mai entrato. E la sveglia sul comodino della 404 è avanti di venticinque minuti: quella sveglia la regolo io la domenica. Le camere non mentono.',
        reveals: ['fact.vassoio', 'fact.sveglia'],
        fromAct: 2,
      },
      {
        topic: 'passaggio',
        keywords: ['passaggio', 'porta', 'tovagliolo'],
        text: 'Il tovagliolo sotto la porta di servizio ce lo metto io tutte le sere, sennò resto chiusa fuori con il carrello. Non è un mistero: è una pena, ed è mia.',
        reveals: ['fact.porta-passaggio'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cucina',
        keywords: ['farina', 'sacco', 'impronta'],
        text: 'Il sacco l’ha sfondato il garzone ieri sera e la striscia bianca arriva fino alla scala di servizio. Stamattina era pulita, adesso c’è sopra un tacco da signora. Io non ci passo, con quelle scarpe.',
        reveals: ['fact.impronta'],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['passaggio', 'cucina', 'fretta'],
        text: 'Verso le dieci e mezza è passata una persona in abito lungo, dal passaggio verso la sala, di fretta. Io stavo mandando fuori i freddi. Ho visto la stoffa, non la faccia.',
        reveals: [],
        fromAct: 2,
      },
      {
        topic: 'cena',
        keywords: ['orari', 'portate', 'servizio'],
        text: 'Io gli orari li ricordo per portate. Il freddo alle nove, il caldo alle dieci, il dolce quando il proprietario fa il brindisi. Il dolce, stasera, è ancora in dispensa.',
        reveals: [],
        fromAct: 1,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'linea',
        keywords: ['linea', 'telefono', 'caduta'],
        text: 'La linea è caduta alle ventidue e quaranta. L’ho scritto. Torna a pezzi, due o tre minuti per volta, e poi se ne va di nuovo.',
        reveals: ['fact.linea-caduta'],
        fromAct: 1,
      },
      {
        topic: 'telefonate',
        keywords: ['404', 'cornetta', 'quaranta secondi'],
        text: 'Alle ventidue e trentadue la 404 ha sollevato la cornetta e non ha chiesto nessun numero. Quaranta secondi, poi giù. Io i secondi li conto sempre, è il mio mestiere.',
        reveals: ['fact.centralino'],
        fromAct: 2,
      },
      {
        topic: 'centralino',
        keywords: ['cuffia', 'voce', 'ascolto'],
        text: 'Resto in ascolto finché la comunicazione non parte. In quei quaranta secondi dalla 404 arrivava una voce di donna. Due parole, non ho capito quali, e poi la cornetta.',
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
        topic: 'ascensore',
        keywords: ['fermo', 'cabina', 'quarto'],
        text: 'Il fermo era inserito dalle ventidue e dieci alle ventidue e quarantaquattro. La cabina è rimasta al quarto. Chi lo inserisce lo sa: dal basso, in quei minuti, non la chiami.',
        reveals: ['fact.ascensore'],
        fromAct: 2,
      },
    ],
  },

  falseReconstruction: {
    summary:
      'Questa è la sera che devi raccontare. Non hai mai lasciato la sala da ballo: alle 22:20 eri al buffet e c’è una istantanea che lo prova, con l’orologio a muro alle spalle. Se qualcuno osserva che quell’orologio va indietro, ricorda che il portiere lo carica la domenica e che d’inverno l’umidità fa questi scherzi. Il passe-partout, invece, sta in un quadro che chiunque raggiunge allungando un braccio dietro il bancone: il croupier ci passa venti volte a sera, ed è lui ad avere una cambiale in scadenza in quella cassaforte.',
    timeline: [
      t('role.ereditiera', 1260, 1370, 'loc.sala-ballo', 'Sempre in sala, quasi sempre al buffet.'),
      t('role.ereditiera', 1378, 1425, 'loc.hall', 'In hall a far chiamare la suite.'),
      t('role.croupier', 1330, 1360, 'loc.corridoio-quarto', 'Sale al quarto piano con il passe-partout.'),
      t('role.croupier', 1366, 1425, 'loc.sala-ballo', 'Rientra in sala come se niente fosse.'),
    ],
    scapegoatRoleId: 'role.croupier',
  },

  texts: {
    reveal:
      'Nessuno ha mentito sull’ora: hanno soltanto letto orologi diversi. Quello della sala da ballo era stato spostato indietro di venticinque minuti alle 21:20, mentre l’orchestra accordava; la sveglia da viaggio sul comodino della 404 era stata spostata avanti dello stesso quarto d’ora, dopo. Fra le due lancette si apre un intervallo che non esiste, e in quell’intervallo una persona sola aveva un appuntamento scritto sull’agenda del proprietario: «O. — ore 22, la 404. L’ultima volta».',
    explanation:
      'Ottavia Malaspina firmava da tre anni al posto del padre, e da tre anni chiedeva una procura che non arrivava. Il telegramma dello studio Ravera parlava di un atto di revoca già pronto: lunedì il legato sarebbe passato all’ospedale di Albenga, e con l’atto sarebbe venuta fuori anche la firma imitata. Sale alle 22:10 tenendo il fermo dell’ascensore inserito, discute, e alle 22:32 dalla suite parte una cornetta sollevata e riabbassata senza una parola. Poi rimette il passe-partout al gancio senza firmare e scende dal passaggio di servizio, dove un gancio da carrello le strappa dall’abito tre dita di lamé argento. La firma che non poteva evitare di lasciare è quella: in tutta la sala, quella sera, un solo abito era d’argento.',
    victoryInnocents:
      'Il commissario arriva via mare alle sei e ascolta in piedi. Due orologi, una fotografia, un telegramma e un filo argento: ci mette dieci minuti. Ottavia Malaspina chiede soltanto se l’albergo resterà aperto. Le rispondono di sì, e questa è l’unica cosa che sembra interessarle davvero.',
    victoryCulprit:
      'All’alba il verbale porta il nome del croupier, la cambiale in scadenza e un passe-partout che nessuno ha firmato. Ottavia Malaspina fa rimettere in orario l’orologio della sala da ballo alle sette e un quarto, davanti a tutti, e nessuno ci fa caso.',
    defeat:
      'L’indizio lasciato passare è la sveglia sul comodino: sembrava un dettaglio da camera, e invece era la metà mancante dell’orologio della sala. Uno indietro, l’altro avanti, dello stesso quarto d’ora. Era comprensibile ignorarla: nella 404 c’erano una lettera, un telegramma e una busta con due iniziali, e tutti guardavano quelli.',
  },
};
