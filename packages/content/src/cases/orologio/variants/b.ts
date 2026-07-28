import type { VariantDef } from '@meridien/engine';
import { factsFor } from '../clues.js';

/**
 * Variante B — «Il debito saldato».
 * Colpevole: Nando Pittaluga. Movente: un debito che nessuno avrebbe più
 * potuto riscuotere, e che qualcuno aveva già coperto di tasca propria.
 * Metodo: una spinta dal parapetto di ponente, alle 23:12, mentre la
 * pensilina cantava abbastanza da coprire tutto.
 * Il perno: la ricevuta di saldo del 4 ottobre porta un numero progressivo
 * che viene dopo quello del giorno 6. È stata scritta dopo, per togliere
 * un movente a chi lo aveva.
 */

export const variantDebitoSaldato: VariantDef = {
  id: 'var.debito-saldato',
  name: 'Il debito saldato',
  tagline: 'Una ricevuta datata il 4 e numerata come il 6. Il conto era chiuso, ma non quella sera.',
  culpritRoleId: 'role.croupier',
  motiveKey: 'debito-inesigibile',
  methodKey: 'spinta-dal-parapetto',
  sequence: ['beat.cena', 'beat.uscita', 'beat.patto', 'beat.gesto', 'beat.ora'],
  beatDetails: {
    'beat.cena':
      'Al bar del molo Vanzetti parla di primavera e di un relitto a Ponza. Al tavolo in fondo qualcuno fa i conti su un tovagliolo e non li dice a nessuno.',
    'beat.uscita':
      'Alle 22:50 Elio esce sulla terrazza con la cerata sulle spalle. Non sta aspettando il mare: sta aspettando una risposta.',
    'beat.patto':
      'Alle 23:00, sotto la pensilina di ponente, si tratta per l’ultima volta. Quattro milioni contro una firma su una liberatoria che non esiste ancora.',
    'beat.gesto':
      'Alle 23:12 la vernice d’aprile si gratta per una spanna sul corrimano. Dura meno di quanto duri un lampo di flash a f/2.',
    'beat.ora':
      'Alle 23:40 la chiave della terrazza esce dal quadro senza firma. L’orologio raccolto dal parapetto viene fermato sulle 23:47 e posato nella vasca.',
  },
  facts: factsFor(
    [
      {
        id: 'fact.b-mai-sulla-terrazza',
        text: 'Pittaluga afferma di non essere mai uscito sulla terrazza dopo la cena.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.b-nessun-saldo',
        text: 'Ruffini afferma che per la posizione di Vanzetti non è mai stata emessa nessuna ricevuta di saldo.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.b-nessuno-in-corridoio',
        text: 'Gilardoni afferma che dopo le 23:30 nel corridoio del secondo piano non è passato nessuno.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.b-rullino-integro',
        text: 'Corsaro afferma che il rullino della sera è arrivato allo sviluppo integro, senza fotogrammi rovinati.',
        kind: 'dichiarazione',
        common: false,
      },
    ],
    {
      'fact.debito-saldato-quel-giorno':
        'La ricevuta di saldo è datata 4 ottobre ma porta un numero progressivo successivo a quello di una ricevuta del giorno 6.',
      'fact.due-figure-terrazza':
        'Una stampa mostra due figure sotto la pensilina di ponente, riprese dall’alto con obiettivo lungo.',
    },
  ),
  timeline: [
    { who: 'victim', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'All’ultima cena della stagione. Parla di un relitto a Ponza.', hidden: false },
    { who: 'victim', from: 1283, to: 1345, where: 'loc.hall', note: 'Al bancone, con la lettera della banca ancora in tasca.', hidden: false },
    { who: 'victim', from: 1347, to: 1370, where: 'loc.terrazza', note: 'Sotto la pensilina di ponente, cerata sulle spalle.', hidden: false },
    { who: 'victim', from: 1370, to: 1392, where: 'loc.terrazza', note: 'Resta al parapetto a discutere. Alle 23:12 la vernice si gratta.', hidden: true },
    { who: 'role.croupier', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena. Fa una somma su un tovagliolo e la mette in tasca.', hidden: false },
    { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'Nella cabina di noce: alle 22:35 chiede Sanremo e resta due minuti.', hidden: false },
    { who: 'role.croupier', from: 1372, to: 1396, where: 'loc.terrazza', note: 'Raggiunge Vanzetti sotto la pensilina di ponente.', hidden: true },
    { who: 'role.croupier', from: 1398, to: 1416, where: 'loc.hall', note: 'Rientra dalla porta a vetri quattro minuti prima che venga chiusa.', hidden: true },
    { who: 'role.croupier', from: 1420, to: 1423, where: 'loc.terrazza', note: 'Ritira la chiave alle 23:40, raccoglie l’orologio dal corrimano e ne estrae la corona.', hidden: true },
    { who: 'role.croupier', from: 1424, to: 1425, where: 'loc.piscina', note: 'Appoggia l’orologio contro la griglia di scarico e risale.', hidden: true },
    { who: 'role.croupier', from: 1430, to: 1439, where: 'loc.corridoio', note: 'Al secondo piano, con l’ombrello che gocciola sulla moquette.', hidden: true },
    { who: 'role.fotografa', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la macchina appoggiata sul tavolo.', hidden: false },
    { who: 'role.fotografa', from: 1285, to: 1400, where: 'loc.corridoio', note: 'Alla finestra di fondo, obiettivo lungo puntato sulla terrazza.', hidden: false },
    { who: 'role.fotografa', from: 1406, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppa, stampa e riga il negativo nove con un’unghia.', hidden: true },
    { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Consegne di chiusura e firme sulle schede del personale.', hidden: false },
    { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Chiude a chiave la porta a vetri senza guardare fuori.', hidden: false },
    { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Riporta la chiave al quadro e va a controllare la cucina.', hidden: false },
    { who: 'role.secondo', from: 1200, to: 1288, where: 'loc.bar-molo', note: 'A cena e poi al banco, con i pescatori di Laigueglia.', hidden: false },
    { who: 'role.secondo', from: 1295, to: 1439, where: 'loc.bar-molo', note: 'Resta al bar del molo a smontare le bombole della squadra.', hidden: false },
    { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la cartella dei contratti sotto la sedia.', hidden: false },
    { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, a rileggere la polizza con la decorrenza corretta a penna.', hidden: false },
    { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze accanto al piatto.', hidden: false },
    { who: 'role.impresario', from: 1285, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali, ad aspettare che torni la linea.', hidden: false },
    { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
    { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte: due pezzi, poi la corrente salta e resta seduta al buio.', hidden: false },
    { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, acqua minerale e nessun commento.', hidden: false },
    { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, con la valigetta aperta sul letto.', hidden: false },
    { who: 'wit.bramante', from: 1200, to: 1439, where: 'loc.hall', note: 'Dietro il bancone, con il quadro delle chiavi alle spalle.', hidden: false },
    { who: 'wit.coldani', from: 1260, to: 1439, where: 'loc.corridoio', note: 'Al piano, con il quaderno delle camere e la moquette da asciugare.', hidden: false },
    { who: 'wit.bacigalupo', from: 1200, to: 1260, where: 'loc.passaggio', note: 'Al quadro elettrico, a preparare la chiusura di stagione.', hidden: false },
    { who: 'wit.bacigalupo', from: 1265, to: 1332, where: 'loc.piscina', note: 'Fissa il telo alle 21:40, apre la linea dei fari alle 22:10.', hidden: false },
    { who: 'wit.bacigalupo', from: 1334, to: 1439, where: 'loc.passaggio', note: 'In officina, con la porta aperta sul corridoio di servizio.', hidden: false },
  ],
  clueSetup: [
    { clueId: 'clue.orologio-fondo', relevance: 'critico', act: 1, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: null },
    { clueId: 'clue.ghiera-orologio', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: null },
    { clueId: 'clue.ringhiera-terrazza', relevance: 'critico', act: 1, locationId: 'loc.terrazza', hotspot: 'parapetto', puzzle: { kind: 'confronto', prompt: 'Su quale lato della terrazza la vernice del parapetto è grattata di fresco?', options: ['Lato levante', 'Lato ponente', 'Davanti alla porta a vetri'], answer: 'Lato ponente', hint: 'È lo stesso lato che compare nella stampa ancora umida appesa al filo.' } },
    { clueId: 'clue.porta-vetri', relevance: 'critico', act: 1, locationId: 'loc.terrazza', hotspot: 'porta-vetri', puzzle: null },
    { clueId: 'clue.impronte-bagnate', relevance: 'critico', act: 2, locationId: 'loc.terrazza', hotspot: 'soglia', puzzle: null },
    { clueId: 'clue.telo-piscina', relevance: 'contorno', act: 1, locationId: 'loc.piscina', hotspot: 'telo', puzzle: null },
    { clueId: 'clue.scala-vasca', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'scaletta', puzzle: null },
    { clueId: 'clue.giaccavento', relevance: 'falsa-pista', act: 3, locationId: 'loc.passaggio', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.incisione-orologio', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'bancone', puzzle: null },
    { clueId: 'clue.certificato-immersione', relevance: 'falsa-pista', act: 3, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.registro-arrivi', relevance: 'falsa-pista', act: 2, locationId: 'loc.hall', hotspot: 'registro', puzzle: null },
    { clueId: 'clue.tessera-marina', relevance: 'falsa-pista', act: 3, locationId: 'loc.corridoio', hotspot: 'comodino', puzzle: null },
    { clueId: 'clue.cambiale', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.libretto-casino', relevance: 'critico', act: 2, locationId: 'loc.corridoio', hotspot: 'porta-204', puzzle: null },
    { clueId: 'clue.lettera-banca', relevance: 'critico', act: 2, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.polizza-vita', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.ricevuta-saldata', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'cassa', puzzle: { kind: 'ordine', prompt: 'La ricevuta è datata 4 ottobre. Quale numero progressivo la precede immediatamente nel bollettario?', options: ['Quello del 3 ottobre', 'Quello del 6 ottobre', 'Nessuno: è la prima del blocco'], answer: 'Quello del 6 ottobre', hint: 'Un bollettario si riempie in ordine: la data si può scrivere, il numero no.' } },
    { clueId: 'clue.assegno-strappato', relevance: 'critico', act: 3, locationId: 'loc.hall', hotspot: 'cestino', puzzle: null },
    { clueId: 'clue.provino-contatto', relevance: 'utile', act: 2, locationId: 'loc.camera-oscura', hotspot: 'filo', puzzle: null },
    { clueId: 'clue.negativo-graffiato', relevance: 'utile', act: 2, locationId: 'loc.camera-oscura', hotspot: 'striscia', puzzle: null },
    { clueId: 'clue.fotografia-terrazza', relevance: 'critico', act: 2, locationId: 'loc.camera-oscura', hotspot: 'filo', puzzle: null },
    { clueId: 'clue.orario-flash', relevance: 'critico', act: 3, locationId: 'loc.camera-oscura', hotspot: 'taccuino', puzzle: null },
    { clueId: 'clue.bacinella-fissaggio', relevance: 'contorno', act: 3, locationId: 'loc.camera-oscura', hotspot: 'bacinelle', puzzle: null },
    { clueId: 'clue.foto-vecchia', relevance: 'falsa-pista', act: 3, locationId: 'loc.camera-oscura', hotspot: 'tavolo-montaggio', puzzle: null },
    { clueId: 'clue.lampada-segnali', relevance: 'falsa-pista', act: 2, locationId: 'loc.passaggio', hotspot: 'ripostiglio', puzzle: null },
    { clueId: 'clue.quaderno-faro', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'bacheca', puzzle: null },
    { clueId: 'clue.testimonianza-pescatore', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'bancone', puzzle: null },
    { clueId: 'clue.barca-molo', relevance: 'falsa-pista', act: 2, locationId: 'loc.bar-molo', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.carta-nautica', relevance: 'falsa-pista', act: 3, locationId: 'loc.bar-molo', hotspot: 'tavolo', puzzle: null },
    { clueId: 'clue.registro-chiavi', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'quadro-chiavi', puzzle: null },
    { clueId: 'clue.centralino-chiamata', relevance: 'critico', act: 2, locationId: 'loc.passaggio', hotspot: 'centralino', puzzle: null },
    { clueId: 'clue.scarpe-asciutte', relevance: 'utile', act: 1, locationId: 'loc.corridoio', hotspot: 'porta-209', puzzle: null },
    { clueId: 'clue.ombrello-corridoio', relevance: 'critico', act: 1, locationId: 'loc.corridoio', hotspot: 'porta-214', puzzle: null },
    { clueId: 'clue.quadro-elettrico', relevance: 'falsa-pista', act: 2, locationId: 'loc.passaggio', hotspot: 'quadro', puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.b-colpevole-materiale',
      text: 'La vernice grattata sul parapetto di ponente e la chiave uscita dal quadro alle 23:40 senza firma indicano chi è tornato sulla terrazza a raccogliere ciò che era rimasto lì.',
      concludes: 'culprit',
      paths: [
        ['fact.segno-ringhiera', 'fact.chiave-terrazza-ritirata-2340'],
        ['fact.debito-saldato-quel-giorno', 'fact.assegno-rifiutato'],
      ],
    },
    {
      id: 'inf.b-colpevole-temporale',
      text: 'Chi ha telefonato a Sanremo alle 22:35 e alle 23:50 è rientrato al secondo piano con l’ombrello che gocciolava era fuori proprio nell’ora in cui la pensilina copriva tutto.',
      concludes: 'culprit',
      paths: [
        ['fact.telefonata-sanremo-2235', 'fact.qualcuno-rientrato-2350'],
        ['fact.due-figure-terrazza', 'fact.posa-nove-alle-2312'],
      ],
    },
    {
      id: 'inf.b-movente-debito',
      text: 'Quattro milioni in scadenza il 5, tre serate di perdite e un conto già scoperto: il debitore non avrebbe pagato, e chi aveva anticipato non poteva più recuperare nulla per vie regolari.',
      concludes: 'motive',
      paths: [
        ['fact.debito-scadenza-5', 'fact.perdite-casino'],
        ['fact.conto-scoperto', 'fact.assegno-rifiutato'],
      ],
    },
    {
      id: 'inf.b-movente-copertura',
      text: 'La liberatoria datata 4 ottobre serve a cancellare un movente, non un debito: è stata scritta dopo, dalla stessa mano che alle 22:35 aveva chiamato Sanremo per sapere quanto tempo restasse.',
      concludes: 'motive',
      paths: [
        ['fact.debito-saldato-quel-giorno', 'fact.telefonata-sanremo-2235'],
        ['fact.debito-scadenza-5', 'fact.qualcuno-rientrato-2350'],
      ],
    },
    {
      id: 'inf.b-metodo-parapetto',
      text: 'Una spanna di vernice grattata all’altezza del corrimano e due impronte bagnate rivolte verso l’interno: dal parapetto di ponente è passato qualcosa e sulla soglia è rientrato qualcuno.',
      concludes: 'method',
      paths: [
        ['fact.segno-ringhiera', 'fact.impronte-verso-interno'],
        ['fact.due-figure-terrazza', 'fact.terrazza-chiusa-2320'],
      ],
    },
    {
      id: 'inf.b-metodo-orologio-raccolto',
      text: 'L’orologio non è caduto nella vasca: è stato raccolto dove si era staccato, fermato con la corona e portato giù per la scaletta appena riverniciata.',
      concludes: 'method',
      paths: [
        ['fact.orologio-fermo-2347', 'fact.chiave-terrazza-ritirata-2340'],
        ['fact.orologio-manomesso', 'fact.scaletta-usata'],
      ],
    },
    {
      id: 'inf.b-sequenza-terrazza',
      text: 'La posa che manca è la nona e il negativo nove è rigato a pellicola asciutta: qualcuno ha visto la terrazza dall’alto e ha deciso di non farla vedere a nessun altro.',
      concludes: 'sequence',
      paths: [
        ['fact.posa-nove-mancante', 'fact.negativo-danneggiato'],
        ['fact.luci-piscina-spente-2210', 'fact.telo-spostato'],
      ],
    },
    {
      id: 'inf.b-sequenza-rientro',
      text: 'Le scarpe asciutte davanti alla 209 e la cerata riappesa nel passaggio dicono chi non è uscito. La bacinella tiepida e la soglia bagnata dicono a che ora è finita la notte di chi è uscito.',
      concludes: 'sequence',
      paths: [
        ['fact.scarpe-asciutte', 'fact.cerata-asciutta'],
        ['fact.camera-oscura-usata-tardi', 'fact.impronte-verso-interno'],
      ],
    },
    {
      id: 'inf.b-nota-fratello',
      text: 'Il brevetto con due nomi e il fondello inciso «I. B.» raccontano un torto vecchio di cinque anni. I torti vecchi raramente scelgono la sera del temporale.',
      concludes: 'support',
      paths: [['fact.impresa-1962-due-uomini', 'fact.orologio-inciso-ib']],
    },
    {
      id: 'inf.b-nota-segnali',
      text: 'Tre lampi alle 23:05 e una batteria scarica nel ripostiglio: qualcuno ha chiamato qualcuno dal molo, ma nessuno è mai salito sulla terrazza da lì.',
      concludes: 'support',
      paths: [['fact.segnali-2305', 'fact.lampada-usata']],
    },
    {
      id: 'inf.b-nota-mare',
      text: 'La luce che si spegne alle 23:10 e il gozzo riormeggiato male sono due fatti veri che si riferiscono a una barca di servizio, non a un uomo.',
      concludes: 'support',
      paths: [['fact.luce-in-mare-2310', 'fact.gozzo-mosso']],
    },
    {
      id: 'inf.b-nota-carte',
      text: 'Una croce a matita sulla secca del Grillo e una tessera con la fotografia riapplicata riguardano il lavoro della squadra, non la notte del 4 ottobre.',
      concludes: 'support',
      paths: [['fact.punto-segnato-secca', 'fact.tessera-alterata']],
    },
  ],
  contradictions: [
    {
      id: 'contra.b-terrazza',
      a: 'fact.due-figure-terrazza',
      b: 'fact.b-mai-sulla-terrazza',
      text: 'Una stampa ripresa dall’alto mostra due figure sotto la pensilina di ponente. Chi dichiara di non essere mai uscito sulla terrazza deve spiegare la seconda.',
      implicates: 'role.croupier',
    },
    {
      id: 'contra.b-ricevuta',
      a: 'fact.debito-saldato-quel-giorno',
      b: 'fact.b-nessun-saldo',
      text: 'La liberatoria da quattro milioni esiste, è datata 4 ottobre e sta nella cassa della direzione. Sostenere che non sia mai stata emessa è una scelta, non una svista.',
      implicates: 'role.impresario',
    },
    {
      id: 'contra.b-ombrello',
      a: 'fact.qualcuno-rientrato-2350',
      b: 'fact.b-nessuno-in-corridoio',
      text: 'Alle 23:50 un ombrello gocciolante è comparso alla porta della 214 e alle 00:20 non c’era più. Il corridoio, quella mezz’ora, ha visto passare qualcuno.',
      implicates: 'role.cantante',
    },
    {
      id: 'contra.b-negativo',
      a: 'fact.negativo-danneggiato',
      b: 'fact.b-rullino-integro',
      text: 'Il fotogramma nove è rigato in diagonale a pellicola asciutta, gli altri undici sono intatti. Un rullino arrivato integro allo sviluppo non si riga da solo.',
      implicates: 'role.fotografa',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.armatrice',
      declaredAlibi:
        'Sono salita nella 207 subito dopo cena e ci sono rimasta. Avevo la corrispondenza di Genova da leggere e questa era l’ultima sera utile per rispondere.',
      trueTimeline: [
        { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la cartella dei contratti sotto la sedia.', hidden: false },
        { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, a rileggere la polizza corretta a penna.', hidden: true },
      ],
      secretId: 'sec.polizza-anticipata',
      objectiveId: 'goal.tre-indizi',
      exclusiveClueId: 'clue.lettera-banca',
      declarations: [
        { key: 'verita', text: 'Vanzetti aveva il conto scoperto e il fido revocato. Me lo ha detto lui stesso, a cena, come si dice una cosa che tanto si saprà.' },
        { key: 'omissione', text: 'Della polizza si occupa il nostro ufficio di Genova. Chi ha corretto la decorrenza a penna lo chieda a chi tiene i registri.' },
        { key: 'bugia', text: 'Non ho mai visto la lettera della banca. Certe carte restano nelle valigie degli altri e io nelle valigie degli altri non guardo.' },
      ],
      shareable: [
        'La lettera della banca dava a Vanzetti tempo fino al 10 e lui parlava del 5 come di una scadenza.',
        'Al bar del molo, dopo cena, qualcuno faceva una somma su un tovagliolo e non l’ha lasciata sul tavolo.',
      ],
      hidden: ['La decorrenza della polizza è stata anticipata di un mese con una sigla che è la mia.'],
    },
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Nella hall, al tavolino dei giornali, dalle dieci e mezza fino a quando è arrivata la pattuglia. Aspettavo la linea per Milano e la linea non è mai tornata.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze accanto al piatto.', hidden: false },
        { who: 'role.impresario', from: 1285, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali; alle 23:40 vede uscire qualcuno e non lo dice.', hidden: true },
      ],
      secretId: 'sec.tournee-vuota',
      objectiveId: 'goal.essere-creduti',
      exclusiveClueId: 'clue.ricevuta-saldata',
      declarations: [
        { key: 'verita', text: 'Vanzetti mi doveva quattordici serate. Se qualcuno stanotte ha perso più di me, si faccia avanti: io ho perso una stagione intera.' },
        { key: 'omissione', text: 'Nella cassa della direzione ci sono carte di tutti. Che ci sia anche una liberatoria non significa che l’abbia messa lì io.' },
        { key: 'bugia', text: 'Per la posizione di Vanzetti non è mai stata emessa nessuna ricevuta di saldo. Un debito così non si chiude con un timbro.', asserts: 'fact.b-nessun-saldo' },
      ],
      shareable: [
        'La cambiale da quattro milioni aveva il beneficiario scritto in un secondo momento, con inchiostro diverso.',
        'Alle 23:40 dalla hall è uscito qualcuno verso la terrazza, e non era il direttore.',
      ],
      hidden: ['Le quattordici serate sono già pagate e non ho più nessuno da mandare in vasca.'],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Dietro il bancone, salvo i cinque minuti delle 23:20 per chiudere la porta a vetri. Poi ho riportato la chiave al quadro e sono sceso in cucina.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Consegne di chiusura e firme sulle schede.', hidden: false },
        { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Gira la chiave della porta a vetri senza guardare fuori.', hidden: false },
        { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Riporta la chiave al quadro e si allontana verso la cucina.', hidden: true },
      ],
      secretId: 'sec.camere-fuori-registro',
      objectiveId: 'goal.segreto-al-sicuro',
      exclusiveClueId: 'clue.porta-vetri',
      declarations: [
        { key: 'verita', text: 'Alle 23:20 ho chiuso la terrazza e non ho guardato fuori. Con quel vento non si guarda fuori: si tira la maniglia e si gira la chiave.' },
        { key: 'omissione', text: 'Il quadro delle chiavi è dietro il bancone, a vista. Quando sono in cucina, dietro il bancone c’è soltanto il portiere.' },
        { key: 'bugia', text: 'Dopo le 23:20 la chiave della terrazza non è più uscita dal quadro. Ne rispondo io: la chiusura di stagione la firmo io.' },
      ],
      shareable: [
        'La chiave della terrazza risulta ritirata di nuovo alle 23:40 e la casella della firma è rimasta bianca.',
        'La liberatoria da quattro milioni è nella cassa della direzione e nessuno mi ha chiesto di metterla lì.',
      ],
      hidden: ['Tre camere del secondo piano sono state affittate tutta la stagione senza comparire sul registro.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Al pianoforte della hall fino a mezzanotte. Ho fatto due pezzi, poi è saltata la corrente e sono rimasta seduta al buio perché tanto non c’era altro da fare.',
      trueTimeline: [
        { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
        { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte; dal suo sgabello si vede la porta a vetri.', hidden: false },
      ],
      secretId: 'sec.matrimonio-taciuto',
      objectiveId: 'goal.proteggi-la-cantante',
      exclusiveClueId: 'clue.ombrello-corridoio',
      declarations: [
        { key: 'verita', text: 'Dal pianoforte si vede la porta a vetri. L’ho vista aprirsi due volte fra le undici e mezzanotte, e nessuna delle due era il direttore.' },
        { key: 'omissione', text: 'Chi sia entrato non ve lo so dire: la hall era al buio e io guardavo la tastiera, non la porta.' },
        { key: 'bugia', text: 'Dopo le undici e mezza nel corridoio del secondo piano non è passato nessuno. Ero salita e avrei sentito i passi sulla moquette.', asserts: 'fact.b-nessuno-in-corridoio' },
      ],
      shareable: [
        'La porta a vetri si è aperta due volte dopo le undici, e la seconda volta è entrata acqua sul marmo.',
        'La Coldani ha segnato sul quaderno un ombrello gocciolante alla porta della 214 alle 23:50.',
      ],
      hidden: ['Il mio matrimonio del 1961 non è mai stato sciolto e non l’ho detto a nessuno.'],
    },
    {
      roleId: 'role.fotografa',
      declaredAlibi:
        'Ho lavorato dalla finestra di fondo del secondo piano, con l’obiettivo lungo: dalla terrazza pioveva di traverso. Verso le undici e mezza sono scesa in camera oscura.',
      trueTimeline: [
        { who: 'role.fotografa', from: 1285, to: 1400, where: 'loc.corridoio', note: 'Alla finestra di fondo, obiettivo lungo puntato sulla pensilina.', hidden: false },
        { who: 'role.fotografa', from: 1406, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppa, stampa e riga il negativo nove con un’unghia.', hidden: true },
      ],
      secretId: 'sec.negativo-venduto',
      objectiveId: 'goal.cinque-domande',
      exclusiveClueId: 'clue.orario-flash',
      declarations: [
        { key: 'verita', text: 'La nona posa l’ho fatta alle 23:12, dalla finestra del corridoio, con l’obiettivo lungo. L’ora è scritta sul taccuino mentre scattavo.' },
        { key: 'omissione', text: 'Sotto la pensilina c’era più di una persona. Chi fosse la seconda, con quella pioggia e a quel diaframma, non lo direi in un verbale.' },
        { key: 'bugia', text: 'Il rullino è arrivato allo sviluppo integro. Nessun fotogramma rovinato, nessuna posa perduta: dodici pose e dodici provini.', asserts: 'fact.b-rullino-integro' },
      ],
      shareable: [
        'La stampa della pensilina di ponente mostra due figure, non una, e la pioggia in controluce.',
        'Il taccuino di posa segna la riga nove alle 23:12, a matita invece che a penna.',
      ],
      hidden: ['Ho rigato io il negativo nove, dopo averlo guardato alla lente per tre minuti.'],
    },
    {
      roleId: 'role.medico',
      declaredAlibi:
        'Nella 211 dalle dieci e mezza. Avevo il registro delle idoneità da chiudere e la valigetta da riordinare prima della fine della stagione.',
      trueTimeline: [
        { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, acqua minerale e nessun commento.', hidden: false },
        { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, a retrodatare due certificati d’idoneità.', hidden: true },
      ],
      secretId: 'sec.certificato-di-comodo',
      objectiveId: 'goal.non-si-parli-del-1962',
      exclusiveClueId: 'clue.tessera-marina',
      declarations: [
        { key: 'verita', text: 'Vanzetti era in salute. Chi vi racconta di un uomo finito lo fa perché un uomo finito spiega tutto senza bisogno di prove.' },
        { key: 'omissione', text: 'La tessera ministeriale non l’ho compilata io. Ho firmato l’idoneità, che è un’altra carta e un altro timbro.' },
        { key: 'bugia', text: 'Nella 211 non è entrato nessuno dopo le dieci e mezza. Ho lavorato solo, con la porta chiusa, fino a dopo mezzanotte.' },
      ],
      shareable: [
        'La fotografia sulla tessera ministeriale è stata scollata e riapplicata: il timbro a secco si interrompe.',
        'Vanzetti aveva chiesto a me, non alla società, se un uomo di quarantun anni potesse ancora lavorare a cinquanta metri.',
      ],
      hidden: ['Da due stagioni firmo le idoneità della squadra senza visitare nessuno.'],
    },
    {
      roleId: 'role.secondo',
      declaredAlibi:
        'Al bar del molo tutta la sera, a smontare le bombole e a metterle nelle casse. Il capocuoco mi ha visto, e mi ha anche portato del vino che non ho bevuto.',
      trueTimeline: [
        { who: 'role.secondo', from: 1200, to: 1288, where: 'loc.bar-molo', note: 'A cena e poi al banco con i pescatori.', hidden: false },
        { who: 'role.secondo', from: 1295, to: 1439, where: 'loc.bar-molo', note: 'Smonta le bombole della squadra e le incassa per l’inverno.', hidden: false },
      ],
      secretId: 'sec.nome-prestato',
      objectiveId: 'goal.sospetto-sul-croupier',
      exclusiveClueId: 'clue.barca-molo',
      declarations: [
        { key: 'verita', text: 'Nel ’62 sull’Aurelia siamo scesi in due. Sul brevetto c’è una firma sola. Non l’ho mai contestata e non comincio stanotte.' },
        { key: 'omissione', text: 'La cima del gozzo l’ho riannodata io, dopo cena, perché il libeccio la stava mangiando contro il gancio. Annodo come mi hanno insegnato a Chioggia.' },
        { key: 'bugia', text: 'Con Elio non parlavo di soldi. I soldi li teneva lui e li perdeva lui: a me bastava che le bombole fossero cariche.' },
      ],
      shareable: [
        'Elio doveva quattro milioni e ne parlava come di una faccenda già sistemata.',
        'Al tavolo dello chemin Elio non chiedeva credito: qualcuno glielo faceva avere senza che lo chiedesse.',
      ],
      hidden: ['I contratti della squadra portano da dodici anni un nome che non è di chi scende.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Ho telefonato a Sanremo alle 22:35 dalla cabina della hall, poi sono salito in camera. Sulla terrazza non ci sono mai uscito: con quel vento non ci esce nessuno.',
      trueTimeline: [
        { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'In cabina; chiede quanto tempo resti prima che la posizione diventi pubblica.', hidden: false },
        { who: 'role.croupier', from: 1372, to: 1396, where: 'loc.terrazza', note: 'Sotto la pensilina di ponente, a trattare per l’ultima volta.', hidden: true },
        { who: 'role.croupier', from: 1398, to: 1423, where: 'loc.hall', note: 'Rientra, aspetta, poi ritira la chiave alle 23:40 e torna fuori.', hidden: true },
        { who: 'role.croupier', from: 1430, to: 1439, where: 'loc.corridoio', note: 'Al secondo piano, con l’ombrello che gocciola sulla moquette.', hidden: true },
      ],
      secretId: 'sec.cassa-del-tavolo',
      objectiveId: 'goal.trova-orologio',
      exclusiveClueId: 'clue.assegno-strappato',
      declarations: [
        { key: 'verita', text: 'Vanzetti ha perso per tre sere di fila. Al tavolo lo sapevano tutti, compresi quelli che stanotte hanno la memoria corta.' },
        { key: 'omissione', text: 'Alle 22:35 ho telefonato a Sanremo. Era una chiamata di lavoro e a quest’ora non mi sembra la cosa più interessante della serata.' },
        { key: 'bugia', text: 'Sulla terrazza non sono mai uscito dopo cena. Ho la giacca asciutta e le suole pulite: guardatele, se vi serve.', asserts: 'fact.b-mai-sulla-terrazza' },
      ],
      shareable: [
        'Nel cestino della hall c’era un assegno di quattro milioni strappato in quattro, con «no» scritto sopra la firma.',
        'Il libretto delle tre serate mostra colonne che scendono e non risalgono mai.',
      ],
      hidden: ['Le tre serate le ho coperte io, e la liberatoria del 4 ottobre l’ho fatta battere dopo.'],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'chiavi',
        keywords: ['chiave', 'terrazza', 'quadro', 'firma'],
        text: 'Alle 23:20 la chiave della terrazza è tornata al quadro con la mano del direttore. Alle 23:40 non c’era più e la riga della firma è bianca. Io non guardo, signore: io registro. Ma la riga bianca la vedo.',
        reveals: ['fact.terrazza-chiusa-2320', 'fact.chiave-terrazza-ritirata-2340'],
        fromAct: 2,
      },
      {
        topic: 'telefono',
        keywords: ['telefono', 'cabina', 'interurbana', 'hall'],
        text: 'La cabina di noce è a otto passi dal bancone. Alle 22:35 è stata occupata per due minuti scarsi. Chi è uscito non ha chiesto il resto del gettone, e di solito lo chiedono tutti.',
        reveals: ['fact.telefonata-sanremo-2235'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['ora', 'uscito', 'ultima volta', 'terrazza'],
        text: 'Il signor Vanzetti è uscito sulla terrazza alle 22:50. Mi ha chiesto l’ora e gliel’ho data due volte, la seconda perché non mi aveva ascoltato la prima.',
        reveals: ['fact.uscita-2250'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'camere',
        keywords: ['214', 'ombrello', 'porta', 'moquette'],
        text: 'Alle 23:50 c’era un ombrello che gocciolava appoggiato alla porta della 214. L’ho scritto sul quaderno perché la moquette poi si macchia. Alle 00:20 non c’era più e la macchia sì.',
        reveals: ['fact.qualcuno-rientrato-2350'],
        fromAct: 1,
      },
      {
        topic: 'pulizie',
        keywords: ['scarpe', '209', 'lucidatura', 'suole'],
        text: 'Davanti alla 209 c’erano le scarpe da sera per la lucidatura. Suole asciutte, tacco pulito. Chi le portava non ha messo il piede fuori, e questo lo dico senza offesa per nessuno.',
        reveals: ['fact.scarpe-asciutte'],
        fromAct: 1,
      },
      {
        topic: 'rumori',
        keywords: ['rumore', 'corridoio', 'passi', 'finestra'],
        text: 'In fondo al corridoio c’è la finestra che dà sulla piscina. Verso le undici era aperta di un palmo e sul davanzale c’era una macchia tonda, di quelle che lascia un treppiede.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cena',
        keywords: ['cena', 'tavolo', 'coperti', 'conto'],
        text: 'Quarantadue coperti, servito alle otto in punto. Al tavolo in fondo uno faceva i conti su un tovagliolo e me l’ha messo in tasca invece che nel cestino. Peccato: era di lino.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'personale',
        keywords: ['bombole', 'molo', 'barigazzi', 'casse'],
        text: 'Il secondo della squadra è rimasto al molo fino a tardi a incassare le bombole. Gli ho portato del vino e non l’ha bevuto. Un uomo che non beve l’ultima sera è un uomo che ha da fare.',
        reveals: [],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['bar', 'chiusura', 'pioggia', 'orario'],
        text: 'Il bar del molo chiude il 4 ottobre da vent’anni. Alle undici smontavo la macchina del caffè con la pioggia che entrava di traverso. Il gozzo era al gancio e ci è rimasto tutta la sera.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'telefonate',
        keywords: ['sanremo', 'interurbana', '214', 'addebito'],
        text: 'Ventidue e trentacinque, Sanremo ventuno-quattro-quaranta, due minuti, addebito alla 214. Ho passato io la chiamata. Chi parlava non ha detto il proprio nome, e di solito lo dicono tutti.',
        reveals: ['fact.telefonata-sanremo-2235'],
        fromAct: 2,
      },
      {
        topic: 'linea',
        keywords: ['linea', 'caduta', 'alassio', 'ronzio'],
        text: 'La linea per Alassio è caduta alle 22:40. Dopo, solo ronzio. Se qualcuno vi dice di aver telefonato più tardi, ha telefonato a un ronzio.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'centralino',
        keywords: ['centralino', 'passaggio', 'porta di ferro', 'rumore'],
        text: 'Il centralino sta nel passaggio e la porta di ferro è a sei passi. Stanotte non l’ho sentita aprirsi nemmeno una volta. Ho sentito invece il montacarichi, verso mezzanotte meno dieci.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'quadro',
        keywords: ['fari', 'vasca', 'quadro', 'corrente'],
        text: 'La linea dei fari della vasca è stata aperta alle 22:10, a mano. La levetta era alzata e il salvavita è a posto. Non l’ho aperta io e non l’ho richiusa.',
        reveals: ['fact.luci-piscina-spente-2210'],
        fromAct: 2,
      },
      {
        topic: 'manutenzione',
        keywords: ['scaletta', 'vernice', 'vasca', 'strisce'],
        text: 'La scaletta della vasca l’ho riverniciata a settembre. Adesso ha quattro strisce fresche sui montanti, all’altezza delle mani. Chi è sceso è anche risalito: le strisce sono su e giù.',
        reveals: ['fact.scaletta-usata'],
        fromAct: 2,
      },
      {
        topic: 'corrente',
        keywords: ['telo', 'piscina', 'occhielli', 'fissato'],
        text: 'Telo fissato alle 21:40, scheda firmata. Adesso il lato corto è libero e le cime pendono. Se lo avesse aperto il vento, avrebbe aperto il lato lungo, non quello corto.',
        reveals: ['fact.telo-spostato', 'fact.piscina-svuotata'],
        fromAct: 1,
      },
    ],
  },
  falseReconstruction: {
    summary:
      'Ricostruzione da sostenere: la faccenda viene dal 1962 e dal mare, non dal tavolo verde. Alle 23:05 dal molo partono tre lampi verso il largo e alle 23:10 una luce si spegne al largo della punta. Il gozzo di servizio è stato usato e riormeggiato con un nodo veneto. Il secondo della squadra è l’unico che sappia annodare così, l’unico che conosca la secca del Grillo e l’unico ad avere, dal 1962, un conto aperto con il fratello. Il croupier, in quei minuti, era nella cabina di noce della hall e poi in camera: la telefonata delle 22:35 è registrata dal centralino.',
    timeline: [
      { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'In cabina telefonica, chiamata a Sanremo registrata.', hidden: false },
      { who: 'role.croupier', from: 1365, to: 1439, where: 'loc.corridoio', note: 'In camera al secondo piano, senza più scendere.', hidden: false },
      { who: 'role.secondo', from: 1300, to: 1420, where: 'loc.bar-molo', note: 'Al molo, con la lampada e il gozzo slegato.', hidden: false },
      { who: 'victim', from: 1376, to: 1400, where: 'loc.bar-molo', note: 'Sceso al molo per un appuntamento in mare.', hidden: false },
    ],
    scapegoatRoleId: 'role.secondo',
  },
  texts: {
    reveal:
      'Il conto era di quattro milioni e non lo teneva il casinò: lo teneva Nando Pittaluga, che per tre sere aveva coperto le perdite di Vanzetti con denaro proprio per non farlo allontanare dal tavolo. Il 5 ottobre la cambiale scadeva e la banca aveva già revocato il fido. Alle 23:00 del 4 ottobre, sotto la pensilina di ponente, Pittaluga ha chiesto per l’ultima volta. Alle 23:12 la vernice d’aprile si è grattata per una spanna sul corrimano. Alle 23:40 la chiave della terrazza è uscita dal quadro senza firma, e un orologio raccolto dal parapetto è stato fermato sulle 23:47 e posato in fondo alla vasca.',
    explanation:
      'Il perno è un numero, non un’ora. La liberatoria da quattro milioni è datata 4 ottobre, ma il suo progressivo viene dopo quello di una ricevuta del giorno 6: la data si può scrivere, il numero del bollettario no. Quella carta serviva a cancellare un movente, ed è stata scritta quando il movente si era già consumato. Da lì partono due catene indipendenti. La prima è materiale: la vernice grattata sul parapetto di ponente, la chiave ritirata alle 23:40 senza firma, la scaletta della vasca con quattro strisce fresche. La seconda è di orario: l’interurbana per Sanremo alle 22:35, la stampa che alle 23:12 mostra due figure sotto la pensilina, l’ombrello gocciolante alla porta della 214 alle 23:50. L’esitazione c’è stata: l’assegno da quattro milioni, strappato in quattro nel cestino della hall con «no» scritto sopra la firma, era l’ultima offerta rifiutata. La firma involontaria è l’ora: 23:47 è un orario in cui la terrazza era chiusa da ventisette minuti, e solo chi aveva la chiave poteva sbagliare così.',
    victoryInnocents:
      'Avete confrontato due numeri su due ricevute e il resto è venuto da sé. Pittaluga non ha negato a lungo: ha detto che a un tavolo si copre un cliente per tenerlo al tavolo, e che nessuno gli aveva spiegato cosa si fa quando il cliente smette di giocare.',
    victoryCulprit:
      'La liberatoria ha retto. Il conto risultava chiuso il 4 ottobre e un uomo senza debiti non ha ragioni. All’alba Nando Pittaluga ha preso la corriera per Sanremo con le mani in tasca, come al tavolo, e nessuno gli ha chiesto di mostrarle.',
    defeat:
      'L’indizio ignorato è il più noioso: il numero progressivo della ricevuta di saldo. Era comprensibile lasciarlo perdere — un bollettario non è una prova, è contabilità — ma quel numero diceva che la carta più rassicurante della serata era stata scritta dopo tutto il resto.',
  },
};
