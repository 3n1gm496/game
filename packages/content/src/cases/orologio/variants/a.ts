import type { VariantDef } from '@meridien/engine';
import { factsFor } from '../clues.js';

/**
 * Variante A — «Il fratello».
 * Colpevole: Ivo Barigazzi. Movente: un nome e un'impresa che non sono mai
 * stati suoi. Metodo: un appuntamento in mare, chiamato con tre lampi di
 * lampada e chiuso alla secca del Grillo.
 * Il perno: l'orologio non è di Elio. L'incisione sul fondello dice a chi
 * apparteneva dal 1962, e chi lo ha lasciato in fondo alla vasca aveva le
 * mani libere e la corona estratta.
 */

export const variantFratello: VariantDef = {
  id: 'var.fratello',
  name: 'Il fratello',
  tagline: 'Un’impresa firmata da una mano sola, e due uomini che la ricordano diversamente.',
  culpritRoleId: 'role.secondo',
  motiveKey: 'identita-rubata',
  methodKey: 'appuntamento-al-largo',
  sequence: ['beat.cena', 'beat.patto', 'beat.uscita', 'beat.gesto', 'beat.ora'],
  beatDetails: {
    'beat.cena':
      'Al bar del molo si mangia l’ultima zuppa della stagione. Elio racconta l’Aurelia per la centesima volta e non nomina mai chi teneva la cima.',
    'beat.patto':
      'Alle 22:20, al bancone della hall, i due si dicono sei parole. L’appuntamento è per le undici, alla secca, con il gozzo: si chiude la faccenda del 1962.',
    'beat.uscita':
      'Alle 22:50 Elio esce sulla terrazza, scende la scaletta del molo e slega il gozzo. Alle 23:05 tre lampi corti gli indicano il punto.',
    'beat.gesto':
      'Alla secca del Grillo l’appoggio non arriva. La cima resta a bordo della lancia, arrotolata due volte, e alle 23:10 la luce si spegne.',
    'beat.ora':
      'Alle 23:47 la corona dell’orologio viene estratta con due dita. Poi l’orologio scende nella vasca vuota, e con lui un’ora che non torna.',
  },
  facts: factsFor([
    {
      id: 'fact.a-gozzo-fermo',
      text: 'Barigazzi afferma che il gozzo di servizio non è stato slegato dal gancio per tutta la sera.',
      kind: 'dichiarazione',
      common: false,
    },
    {
      id: 'fact.a-terrazza-mai-chiusa',
      text: 'Ravano afferma di non aver girato la chiave della terrazza prima di mezzanotte.',
      kind: 'dichiarazione',
      common: false,
    },
    {
      id: 'fact.a-nessuna-interurbana',
      text: 'Pittaluga afferma di non aver chiesto nessuna interurbana dopo la cena.',
      kind: 'dichiarazione',
      common: false,
    },
    {
      id: 'fact.a-camera-oscura-chiusa',
      text: 'Corsaro afferma che la camera oscura è rimasta chiusa a chiave dalle 22:00 in poi.',
      kind: 'dichiarazione',
      common: false,
    },
  ]),
  timeline: [
    { who: 'victim', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'All’ultima cena della stagione, al tavolo sotto la tettoia.', hidden: false },
    { who: 'victim', from: 1283, to: 1345, where: 'loc.hall', note: 'Al bancone. Chiede due volte l’ora e non ordina niente.', hidden: false },
    { who: 'victim', from: 1347, to: 1370, where: 'loc.terrazza', note: 'Sotto la pensilina, cerata sulle spalle, bicchiere in mano.', hidden: false },
    { who: 'victim', from: 1376, to: 1400, where: 'loc.bar-molo', note: 'Scende la scaletta, slega il gozzo e si stacca dal gancio.', hidden: true },
    { who: 'role.secondo', from: 1200, to: 1288, where: 'loc.bar-molo', note: 'A cena e poi al banco, con i pescatori di Laigueglia.', hidden: false },
    { who: 'role.secondo', from: 1296, to: 1306, where: 'loc.passaggio', note: 'Prende la lampada a otturatore dal ripostiglio degli attrezzi.', hidden: true },
    { who: 'role.secondo', from: 1313, to: 1418, where: 'loc.bar-molo', note: 'Alle 23:05 tre lampi verso il largo, poi esce con la lancia d’appoggio.', hidden: true },
    { who: 'role.secondo', from: 1425, to: 1432, where: 'loc.passaggio', note: 'Rientra dalla porta di ferro con la cerata gialla sul braccio.', hidden: true },
    { who: 'role.secondo', from: 1434, to: 1439, where: 'loc.piscina', note: 'Scende la scaletta della vasca e appoggia l’orologio contro la griglia.', hidden: true },
    { who: 'role.fotografa', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la macchina appoggiata sul tavolo.', hidden: false },
    { who: 'role.fotografa', from: 1283, to: 1370, where: 'loc.terrazza', note: 'Sotto la pensilina: dodici pose sul temporale, l’ultima alle 23:12.', hidden: false },
    { who: 'role.fotografa', from: 1372, to: 1385, where: 'loc.hall', note: 'Rientra e chiede al portiere la chiave della vecchia stireria.', hidden: false },
    { who: 'role.fotografa', from: 1388, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppo e stampa, lampada rossa accesa.', hidden: false },
    { who: 'role.croupier', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena. Non beve e non parla di lavoro.', hidden: false },
    { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'Nella cabina di noce: alle 22:35 chiede Sanremo e resta due minuti.', hidden: false },
    { who: 'role.croupier', from: 1363, to: 1439, where: 'loc.corridoio', note: 'Sale al secondo piano e non scende più.', hidden: false },
    { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Riceve le consegne di chiusura e firma le schede del personale.', hidden: false },
    { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Chiude a chiave la porta a vetri, come ogni sera di temporale.', hidden: false },
    { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Torna dietro il bancone e riconsegna la chiave al quadro.', hidden: false },
    { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la cartella dei contratti sotto la sedia.', hidden: false },
    { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, con la porta socchiusa e la luce accesa.', hidden: false },
    { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze aperto accanto al piatto.', hidden: false },
    { who: 'role.impresario', from: 1290, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali, in attesa che torni la linea.', hidden: false },
    { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
    { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte della hall: due pezzi, poi salta la corrente.', hidden: false },
    { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, acqua minerale e nessun commento.', hidden: false },
    { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, con la valigetta aperta sul letto.', hidden: false },
    { who: 'wit.bramante', from: 1200, to: 1439, where: 'loc.hall', note: 'Dietro il bancone, come ogni notte da trentaquattro anni.', hidden: false },
    { who: 'wit.bacigalupo', from: 1200, to: 1260, where: 'loc.passaggio', note: 'Al quadro elettrico, a preparare la chiusura di stagione.', hidden: false },
    { who: 'wit.bacigalupo', from: 1265, to: 1332, where: 'loc.piscina', note: 'Fissa il telo alle 21:40, apre la linea dei fari alle 22:10.', hidden: false },
    { who: 'wit.bacigalupo', from: 1334, to: 1439, where: 'loc.passaggio', note: 'In officina, con la porta aperta sul corridoio di servizio.', hidden: false },
  ],
  clueSetup: [
    { clueId: 'clue.orologio-fondo', relevance: 'critico', act: 1, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: { kind: 'orario', prompt: 'Su quale ora si sono fermate le lancette dell’orologio ripescato dalla vasca?', options: ['22:50', '23:20', '23:47'], answer: '23:47', hint: 'Il registro della direzione segna la chiusura della terrazza ventisette minuti prima.' } },
    { clueId: 'clue.ghiera-orologio', relevance: 'utile', act: 3, locationId: 'loc.hall', hotspot: 'bancone', puzzle: null },
    { clueId: 'clue.ringhiera-terrazza', relevance: 'falsa-pista', act: 1, locationId: 'loc.terrazza', hotspot: 'parapetto', puzzle: null },
    { clueId: 'clue.porta-vetri', relevance: 'utile', act: 1, locationId: 'loc.terrazza', hotspot: 'porta-vetri', puzzle: null },
    { clueId: 'clue.impronte-bagnate', relevance: 'contorno', act: 1, locationId: 'loc.terrazza', hotspot: 'soglia', puzzle: null },
    { clueId: 'clue.telo-piscina', relevance: 'utile', act: 1, locationId: 'loc.piscina', hotspot: 'telo', puzzle: null },
    { clueId: 'clue.scala-vasca', relevance: 'critico', act: 1, locationId: 'loc.piscina', hotspot: 'scaletta', puzzle: null },
    { clueId: 'clue.giaccavento', relevance: 'critico', act: 2, locationId: 'loc.passaggio', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.incisione-orologio', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: { kind: 'codice', prompt: 'Quali iniziali sono incise sul fondello dell’orologio?', options: ['E. V.', 'I. B.', 'A. R.'], answer: 'I. B.', hint: 'Confronta con le due righe consecutive del registro degli arrivi del 2 ottobre.' } },
    { clueId: 'clue.certificato-immersione', relevance: 'critico', act: 2, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.registro-arrivi', relevance: 'critico', act: 1, locationId: 'loc.hall', hotspot: 'registro', puzzle: null },
    { clueId: 'clue.tessera-marina', relevance: 'critico', act: 3, locationId: 'loc.corridoio', hotspot: 'comodino', puzzle: null },
    { clueId: 'clue.cambiale', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.libretto-casino', relevance: 'falsa-pista', act: 2, locationId: 'loc.hall', hotspot: 'tavolino', puzzle: null },
    { clueId: 'clue.lettera-banca', relevance: 'falsa-pista', act: 3, locationId: 'loc.corridoio', hotspot: 'comodino', puzzle: null },
    { clueId: 'clue.polizza-vita', relevance: 'falsa-pista', act: 2, locationId: 'loc.hall', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.ricevuta-saldata', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.assegno-strappato', relevance: 'falsa-pista', act: 1, locationId: 'loc.hall', hotspot: 'cestino', puzzle: null },
    { clueId: 'clue.provino-contatto', relevance: 'utile', act: 2, locationId: 'loc.camera-oscura', hotspot: 'filo', puzzle: null },
    { clueId: 'clue.negativo-graffiato', relevance: 'utile', act: 3, locationId: 'loc.camera-oscura', hotspot: 'striscia', puzzle: null },
    { clueId: 'clue.fotografia-terrazza', relevance: 'falsa-pista', act: 2, locationId: 'loc.camera-oscura', hotspot: 'filo', puzzle: null },
    { clueId: 'clue.orario-flash', relevance: 'falsa-pista', act: 3, locationId: 'loc.camera-oscura', hotspot: 'taccuino', puzzle: null },
    { clueId: 'clue.bacinella-fissaggio', relevance: 'falsa-pista', act: 3, locationId: 'loc.camera-oscura', hotspot: 'bacinelle', puzzle: null },
    { clueId: 'clue.foto-vecchia', relevance: 'critico', act: 2, locationId: 'loc.camera-oscura', hotspot: 'tavolo-montaggio', puzzle: null },
    { clueId: 'clue.lampada-segnali', relevance: 'critico', act: 2, locationId: 'loc.passaggio', hotspot: 'ripostiglio', puzzle: null },
    { clueId: 'clue.quaderno-faro', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'bacheca', puzzle: { kind: 'orario', prompt: 'A che ora il guardiano di Capo Mele annota i tre lampi non regolamentari?', options: ['22:10', '23:05', '23:40'], answer: '23:05', hint: 'Sono cinque minuti prima della luce che si spegne al largo.' } },
    { clueId: 'clue.testimonianza-pescatore', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'bancone', puzzle: null },
    { clueId: 'clue.barca-molo', relevance: 'critico', act: 2, locationId: 'loc.bar-molo', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.carta-nautica', relevance: 'critico', act: 2, locationId: 'loc.bar-molo', hotspot: 'tavolo', puzzle: null },
    { clueId: 'clue.registro-chiavi', relevance: 'contorno', act: 2, locationId: 'loc.hall', hotspot: 'quadro-chiavi', puzzle: null },
    { clueId: 'clue.centralino-chiamata', relevance: 'falsa-pista', act: 2, locationId: 'loc.passaggio', hotspot: 'centralino', puzzle: null },
    { clueId: 'clue.scarpe-asciutte', relevance: 'falsa-pista', act: 1, locationId: 'loc.corridoio', hotspot: 'porta-209', puzzle: null },
    { clueId: 'clue.ombrello-corridoio', relevance: 'contorno', act: 2, locationId: 'loc.corridoio', hotspot: 'porta-214', puzzle: null },
    { clueId: 'clue.quadro-elettrico', relevance: 'falsa-pista', act: 2, locationId: 'loc.passaggio', hotspot: 'quadro', puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.a-colpevole-materiale',
      text: 'L’orologio inciso «I. B.» e il gozzo riormeggiato con un nodo veneto indicano lo stesso uomo: il secondo della squadra, che quella notte è stato in mare e poi nella vasca.',
      concludes: 'culprit',
      paths: [
        ['fact.orologio-inciso-ib', 'fact.gozzo-mosso'],
        ['fact.impresa-1962-due-uomini', 'fact.tessera-alterata'],
      ],
    },
    {
      id: 'inf.a-colpevole-temporale',
      text: 'Chi ha preso la lampada dal ripostiglio del passaggio ha anche riappeso lì la cerata asciutta: conosce il passaggio e ha usato il molo mentre gli altri erano dentro.',
      concludes: 'culprit',
      paths: [
        ['fact.lampada-usata', 'fact.cerata-asciutta'],
        ['fact.luce-in-mare-2310', 'fact.scaletta-usata'],
      ],
    },
    {
      id: 'inf.a-movente-nome',
      text: 'Il brevetto del 1962 nomina due uomini e ne firma uno solo, e la stampa di quell’anno è stata tagliata proprio dove si leggeva il numero della muta. La gloria era intestata a chi non era sceso.',
      concludes: 'motive',
      paths: [
        ['fact.impresa-1962-due-uomini', 'fact.foto-1962-ritagliata'],
        ['fact.due-vanzetti-registro', 'fact.orologio-inciso-ib'],
      ],
    },
    {
      id: 'inf.a-movente-riconoscimento',
      text: 'La tessera con la fotografia riapplicata e le pose sparite dal foglio di provini dicono la stessa cosa: qualcuno si è stancato di esistere solo come nome in seconda riga.',
      concludes: 'motive',
      paths: [
        ['fact.tessera-alterata', 'fact.posa-nove-mancante'],
        ['fact.negativo-danneggiato', 'fact.punto-segnato-secca'],
      ],
    },
    {
      id: 'inf.a-metodo-appuntamento',
      text: 'Tre lampi alle 23:05 verso un punto segnato a matita sulla secca del Grillo, e cinque minuti dopo una luce che si spegne al largo: l’appuntamento non era sulla terrazza, era in mare.',
      concludes: 'method',
      paths: [
        ['fact.segnali-2305', 'fact.punto-segnato-secca'],
        ['fact.gozzo-mosso', 'fact.luce-in-mare-2310'],
      ],
    },
    {
      id: 'inf.a-metodo-orologio-posticcio',
      text: 'Alle 23:47 la terrazza era chiusa da ventisette minuti e la corona dell’orologio era estratta: l’orologio è stato posato nella vasca dopo, per fabbricare un’ora e spostare il luogo.',
      concludes: 'method',
      paths: [
        ['fact.orologio-fermo-2347', 'fact.terrazza-chiusa-2320'],
        ['fact.orologio-manomesso', 'fact.telo-spostato'],
      ],
    },
    {
      id: 'inf.a-sequenza-uscita',
      text: 'Le impronte sulla soglia guardano dentro e la chiave della terrazza è tornata in mano a qualcuno alle 23:40: fra le 22:50 e mezzanotte quella porta è stata attraversata due volte.',
      concludes: 'sequence',
      paths: [
        ['fact.impronte-verso-interno', 'fact.chiave-terrazza-ritirata-2340'],
        ['fact.scarpe-asciutte', 'fact.qualcuno-rientrato-2350'],
      ],
    },
    {
      id: 'inf.a-sequenza-rientro',
      text: 'Dopo mezzanotte l’albergo si rimette in ordine da solo: un ombrello che gocciola, una bacinella tiepida, un telo liberato su un lato. L’ultimo movimento è verso la vasca.',
      concludes: 'sequence',
      paths: [
        ['fact.qualcuno-rientrato-2350', 'fact.camera-oscura-usata-tardi'],
        ['fact.cerata-asciutta', 'fact.telo-spostato'],
      ],
    },
    {
      id: 'inf.a-nota-debiti',
      text: 'Il pagherò in scadenza il 5 e tre serate di perdite al casinò spiegano perché Vanzetti chiedesse l’ora al bancone, non perché non sia rientrato.',
      concludes: 'support',
      paths: [['fact.debito-scadenza-5', 'fact.perdite-casino']],
    },
    {
      id: 'inf.a-nota-polizza',
      text: 'La copertura anticipata al 1° ottobre e il conto scoperto mettono una società in una posizione sgradevole, ma non la mettono sul molo.',
      concludes: 'support',
      paths: [['fact.polizza-beneficiaria', 'fact.conto-scoperto']],
    },
    {
      id: 'inf.a-nota-fotografie',
      text: 'La posa mancante è la nona e la nona è delle 23:12: mentre in mare si spegneva una luce, sulla terrazza si fotografava ancora la pioggia.',
      concludes: 'support',
      paths: [['fact.posa-nove-mancante', 'fact.posa-nove-alle-2312']],
    },
    {
      id: 'inf.a-nota-luci',
      text: 'I fari della vasca spenti a mano alle 22:10 e il telo liberato su un lato rendono la piscina il punto meno illuminato dell’albergo per due ore buone.',
      concludes: 'support',
      paths: [['fact.luci-piscina-spente-2210', 'fact.telo-spostato']],
    },
  ],
  contradictions: [
    {
      id: 'contra.a-nodo',
      a: 'fact.gozzo-mosso',
      b: 'fact.a-gozzo-fermo',
      text: 'Il gozzo è stato usato e riormeggiato con un nodo che al Méridien non fa nessuno. Chi dichiara che la cima non è mai stata sciolta dichiara qualcosa di troppo.',
      implicates: 'role.secondo',
    },
    {
      id: 'contra.a-chiave',
      a: 'fact.terrazza-chiusa-2320',
      b: 'fact.a-terrazza-mai-chiusa',
      text: 'Il registro della direzione porta la chiusura della porta a vetri alle 23:20. Sostenere di non averla girata prima di mezzanotte contraddice la propria stessa scrittura.',
      implicates: 'role.direttore',
    },
    {
      id: 'contra.a-telefono',
      a: 'fact.telefonata-sanremo-2235',
      b: 'fact.a-nessuna-interurbana',
      text: 'Il foglio delle interurbane segna Sanremo alle 22:35, due minuti, addebito alla 214. Negare la telefonata significa negare una riga scritta da un’altra mano.',
      implicates: 'role.croupier',
    },
    {
      id: 'contra.a-camera',
      a: 'fact.camera-oscura-usata-tardi',
      b: 'fact.a-camera-oscura-chiusa',
      text: 'Alle 00:30 il fissaggio è ancora a diciannove gradi e le pinze sono bagnate. Una camera oscura chiusa dalle 22:00 sarebbe fredda e asciutta.',
      implicates: 'role.fotografa',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.armatrice',
      declaredAlibi:
        'Dopo cena sono salita nella 207 con la cartella dei contratti e non sono più scesa. La porta era socchiusa: chiunque sia passato in corridoio mi ha vista alla scrivania.',
      trueTimeline: [
        { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la cartella sotto la sedia.', hidden: false },
        { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, a rileggere la polizza con la decorrenza corretta a penna.', hidden: true },
      ],
      secretId: 'sec.polizza-anticipata',
      objectiveId: 'goal.segreto-al-sicuro',
      exclusiveClueId: 'clue.polizza-vita',
      declarations: [
        { key: 'verita', text: 'Ho finanziato io la campagna di ottobre. Se la stagione si chiude così, la società perde più di quanto abbia mai guadagnato con Vanzetti.' },
        { key: 'omissione', text: 'Della polizza sulla squadra si occupa il nostro ufficio di Genova. Io firmo dove mi indicano, come chiunque abbia un consiglio d’amministrazione.' },
        { key: 'bugia', text: 'Non ho parlato con Vanzetti dopo cena. Ci siamo salutati al molo e l’ho rivisto solo nelle fotografie che qualcuno ha appeso al filo.' },
      ],
      shareable: [
        'La cambiale da quattro milioni non era intestata alla mia società: il beneficiario è stato scritto dopo, in nero.',
        'Vanzetti aveva chiesto un anticipo sulla campagna di primavera e gli è stato risposto di no per iscritto.',
      ],
      hidden: [
        'La decorrenza della polizza è stata anticipata di un mese con una sigla che è la mia.',
      ],
    },
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Sono rimasto nella hall dalle dieci e mezza in poi, al tavolino dei giornali, ad aspettare che tornasse la linea per Milano. Il portiere può confermarlo, se la memoria gli torna.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze accanto al piatto.', hidden: false },
        { who: 'role.impresario', from: 1290, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali, a rifare i conti delle quattordici serate già vendute.', hidden: false },
      ],
      secretId: 'sec.tournee-vuota',
      objectiveId: 'goal.tre-indizi',
      exclusiveClueId: 'clue.cambiale',
      declarations: [
        { key: 'verita', text: 'Vanzetti mi doveva quattordici serate e me ne aveva già fatte saltare due. Gliel’ho detto a cena, davanti a tutti, e non l’ho detto piano.' },
        { key: 'omissione', text: 'Le caparre degli organizzatori sono affari fra me e loro. Non riguardano questa notte e non riguardano nessuno di voi.' },
        { key: 'bugia', text: 'Non ho mai anticipato una lira a Vanzetti. Chi lavora con me firma prima e incassa dopo, senza eccezioni.' },
      ],
      shareable: [
        'A cena Vanzetti ha detto che il 5 ottobre avrebbe sistemato tutto in una volta sola.',
        'Il pagherò l’ho visto sul tavolo del bar: la scadenza era scritta a mano sopra la riga stampata.',
      ],
      hidden: ['Le quattordici serate sono già state pagate agli organizzatori e non ho più nessuno da mandare in vasca.'],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Sono stato dietro il bancone tutta la sera, salvo cinque minuti alle 23:20 per chiudere la porta a vetri. Con quel vento la pensilina lavora e il vetro va assicurato.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Consegne di chiusura e firme sulle schede del personale.', hidden: false },
        { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Gira la chiave della porta a vetri senza guardare fuori.', hidden: false },
        { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Riporta la chiave al quadro e non firma la riga di riconsegna.', hidden: true },
      ],
      secretId: 'sec.camere-fuori-registro',
      objectiveId: 'goal.essere-creduti',
      exclusiveClueId: 'clue.registro-chiavi',
      declarations: [
        { key: 'verita', text: 'La porta a vetri l’ho chiusa io alle 23:20. È una regola della casa: con libeccio sopra i quaranta nodi la terrazza si chiude e non si discute.' },
        { key: 'omissione', text: 'Il quadro delle chiavi è a vista, dietro il bancone. Chi lavora qui sa dove sono, e non tutti firmano quando le prendono.' },
        { key: 'bugia', text: 'Non ho girato nessuna chiave prima di mezzanotte. La terrazza è rimasta accessibile fino a quando i carabinieri non l’hanno chiusa loro.', asserts: 'fact.a-terrazza-mai-chiusa' },
      ],
      shareable: [
        'La 214 era intestata a Vanzetti ma il registro porta due nomi di seguito con lo stesso indirizzo.',
        'La chiave della terrazza risulta ritirata una seconda volta alle 23:40 e la casella della firma è vuota.',
      ],
      hidden: ['Tre camere del secondo piano sono state affittate tutta la stagione senza comparire sul registro.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Ero al pianoforte della hall. Ho fatto due pezzi e poi è saltata la corrente: chiunque fosse seduto sui divani mi ha vista, perché non c’era altro da guardare.',
      trueTimeline: [
        { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
        { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte; fra un pezzo e l’altro guarda la porta a vetri.', hidden: false },
      ],
      secretId: 'sec.matrimonio-taciuto',
      objectiveId: 'goal.proteggi-la-cantante',
      exclusiveClueId: 'clue.scarpe-asciutte',
      declarations: [
        { key: 'verita', text: 'Con Elio è finita nel ’65, in un corridoio d’albergo, e non ci siamo più scritti. Stasera ci siamo detti buonasera e nient’altro.' },
        { key: 'omissione', text: 'Ho lasciato le scarpe fuori dalla porta per la lucidatura, come si fa. Non credo che il mio tacco interessi a qualcuno.' },
        { key: 'bugia', text: 'Non sono mai stata sposata. Se qualcuno vi dice il contrario, sta confondendo una canzone con una vita.' },
      ],
      shareable: [
        'Alle 22:40 la linea è caduta e Ruffini ha battuto il pugno sul tavolino dei giornali.',
        'Vanzetti a cena ha detto una frase sola sul 1962, e poi ha cambiato discorso in fretta.',
      ],
      hidden: ['Il mio matrimonio del 1961 non è mai stato sciolto e non l’ho detto a nessuno, tanto meno a Elio.'],
    },
    {
      roleId: 'role.fotografa',
      declaredAlibi:
        'Sono stata sulla terrazza fino alle 22:50 a fare pose sul temporale, poi ho chiesto la chiave della stireria e sono scesa a sviluppare. Sono uscita dalla camera oscura verso l’una.',
      trueTimeline: [
        { who: 'role.fotografa', from: 1283, to: 1370, where: 'loc.terrazza', note: 'Dodici pose sotto la pensilina; l’ultima alle 23:12, a matita sul taccuino.', hidden: false },
        { who: 'role.fotografa', from: 1388, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppa e stampa; il negativo nove le si riga fra le dita.', hidden: true },
      ],
      secretId: 'sec.negativo-venduto',
      objectiveId: 'goal.trova-orologio',
      exclusiveClueId: 'clue.provino-contatto',
      declarations: [
        { key: 'verita', text: 'Alle 23:12 ho scattato la nona posa dalla pensilina di ponente. Il taccuino ce l’ho ancora e le ore le scrivo mentre scatto, non dopo.' },
        { key: 'omissione', text: 'Il negativo nove si è rigato. Capita, con la pellicola asciutta e le mani fredde. Non l’ho stampato e non lo stamperò.' },
        { key: 'bugia', text: 'La camera oscura è rimasta chiusa a chiave dalle dieci in poi. Nessuno vi è entrato, io compresa, fino a dopo mezzanotte.', asserts: 'fact.a-camera-oscura-chiusa' },
      ],
      shareable: [
        'Sulla terrazza, sotto la pensilina, alle 23:12 non c’era una figura sola: ce n’erano due.',
        'La stampa del 1962 sul mio tavolo è tagliata: manca la parte con le mani e il numero della muta.',
      ],
      hidden: ['Una fotografia della campagna del ’62 l’ho venduta a un settimanale senza chiedere niente a nessuno.'],
    },
    {
      roleId: 'role.medico',
      declaredAlibi:
        'Dopo cena sono salito nella 211 e ci sono rimasto. Ho la valigetta aperta sul letto e il registro delle idoneità da chiudere prima della fine della stagione.',
      trueTimeline: [
        { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, acqua minerale, nessun commento sul temporale.', hidden: false },
        { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, a retrodatare due certificati d’idoneità.', hidden: true },
      ],
      secretId: 'sec.certificato-di-comodo',
      objectiveId: 'goal.non-si-parli-del-1962',
      exclusiveClueId: 'clue.certificato-immersione',
      declarations: [
        { key: 'verita', text: 'Vanzetti scendeva ancora a quaranta metri senza batter ciglio. Se qualcuno vi racconta di un uomo malato, vi racconta una comodità.' },
        { key: 'omissione', text: 'Le idoneità della squadra le firmo io. Dove le firmo e con quale calma non è materia da verbale.' },
        { key: 'bugia', text: 'Il brevetto del ’62 non l’ho mai avuto fra le mani. Documenti di quel tipo restano al ministero, non nelle valigie dei medici.' },
      ],
      shareable: [
        'Il brevetto del 1962 porta due nominativi e una firma sola, ripassata sopra un tratto più chiaro.',
        'Barigazzi e Vanzetti hanno la stessa taglia di muta e lo stesso indirizzo a Chioggia.',
      ],
      hidden: ['Da due stagioni firmo le idoneità della squadra senza visitare nessuno.'],
    },
    {
      roleId: 'role.secondo',
      declaredAlibi:
        'Sono rimasto al bar del molo fino a mezzanotte passata, con i pescatori di Laigueglia. Il gozzo era al gancio e ci è rimasto: con quel mare non lo slega nessuno.',
      trueTimeline: [
        { who: 'role.secondo', from: 1200, to: 1288, where: 'loc.bar-molo', note: 'A cena e poi al banco; conta i minuti con il bicchiere fermo.', hidden: false },
        { who: 'role.secondo', from: 1296, to: 1306, where: 'loc.passaggio', note: 'Prende la lampada a otturatore dal ripostiglio.', hidden: true },
        { who: 'role.secondo', from: 1313, to: 1418, where: 'loc.bar-molo', note: 'Tre lampi alle 23:05, poi la lancia d’appoggio verso la secca.', hidden: true },
        { who: 'role.secondo', from: 1425, to: 1439, where: 'loc.passaggio', note: 'Rientra dalla porta di ferro, riappende la cerata, poi scende alla vasca.', hidden: true },
      ],
      secretId: 'sec.nome-prestato',
      objectiveId: 'goal.cinque-domande',
      exclusiveClueId: 'clue.carta-nautica',
      declarations: [
        { key: 'verita', text: 'Nel ’62 sull’Aurelia siamo scesi in due. Sul brevetto c’è una firma sola e non è la mia, ma non l’ho mai contestata a nessuno.' },
        { key: 'omissione', text: 'La carta nautica la tengo io. Sulle secche ci sono segni vecchi di stagioni: non tutti li ho fatti quest’anno.' },
        { key: 'bugia', text: 'Il gozzo non è stato slegato dal gancio per tutta la sera. Con il libeccio a quaranta nodi si resta a terra, anche a Chioggia.', asserts: 'fact.a-gozzo-fermo' },
      ],
      shareable: [
        'La lampada a otturatore del ripostiglio aveva la batteria carica mercoledì: l’ho provata io con Bacigalupo.',
        'Elio, a cena, ha detto che il 5 ottobre avrebbe raccontato tutto a un giornalista di Milano.',
      ],
      hidden: ['I contratti della squadra portano da dodici anni un nome che non è di chi scende.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Dopo cena sono sceso in hall, ho fatto una telefonata e sono salito in camera. Al secondo piano ci sono arrivato prima delle undici e non sono più sceso.',
      trueTimeline: [
        { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'Nella cabina di noce; alle 22:35 chiede Sanremo e resta due minuti.', hidden: false },
        { who: 'role.croupier', from: 1363, to: 1439, where: 'loc.corridoio', note: 'In camera, a rifare la somma delle tre serate coperte di tasca propria.', hidden: true },
      ],
      secretId: 'sec.cassa-del-tavolo',
      objectiveId: 'goal.sospetto-sul-croupier',
      exclusiveClueId: 'clue.libretto-casino',
      declarations: [
        { key: 'verita', text: 'Vanzetti ha perso per tre sere di fila. Non è una notizia: al tavolo lo sapevano tutti, compresi quelli che stanotte fanno finta di niente.' },
        { key: 'omissione', text: 'Il libretto con le colonne è mio e lo tengo per abitudine. Cosa ci sia scritto a matita nell’ultima riga riguarda me.' },
        { key: 'bugia', text: 'Dopo cena non ho chiesto nessuna interurbana. Con la linea che cadeva ogni dieci minuti non ci ho nemmeno provato.', asserts: 'fact.a-nessuna-interurbana' },
      ],
      shareable: [
        'Nel cestino della hall c’era un assegno di quattro milioni strappato in quattro, con scritto «no» sopra la firma.',
        'Vanzetti al tavolo dello chemin non chiedeva mai credito: se lo faceva dare da qualcun altro.',
      ],
      hidden: ['Le tre serate di perdite le ho coperte io, con denaro che non usciva dalla cassa.'],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'registro',
        keywords: ['registro', 'arrivi', 'firme', 'camera'],
        text: 'Il 2 ottobre ho scritto due righe di seguito, signore. Stesso indirizzo, cognomi diversi, una camera sola. Non è irregolare, se il conto lo paga uno. Io non guardo: io registro.',
        reveals: ['fact.due-vanzetti-registro'],
        fromAct: 1,
      },
      {
        topic: 'chiavi',
        keywords: ['chiave', 'terrazza', 'quadro', 'riconsegna'],
        text: 'La chiave della terrazza è tornata al quadro alle 23:20, con la mano del direttore. Alle 23:40 non c’era più. La riga della firma è bianca, e io non l’ho lasciata bianca.',
        reveals: ['fact.terrazza-chiusa-2320', 'fact.chiave-terrazza-ritirata-2340'],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['orario', 'ora', 'ultima volta', 'uscito'],
        text: 'Il signor Vanzetti è uscito sulla terrazza alle 22:50. Me lo ricordo perché mi ha chiesto l’ora e gliel’ho data due volte, la seconda perché non mi aveva ascoltato.',
        reveals: ['fact.uscita-2250'],
        fromAct: 1,
      },
    ],
    'wit.coldani': [
      {
        topic: 'camere',
        keywords: ['camera', '214', 'ombrello', 'porta'],
        text: 'Alle 23:50 ho trovato un ombrello che gocciolava appoggiato alla porta della 214. L’ho segnato sul quaderno perché la moquette poi si macchia. Alle 00:20 l’ombrello non c’era più.',
        reveals: ['fact.qualcuno-rientrato-2350'],
        fromAct: 2,
      },
      {
        topic: 'rumori',
        keywords: ['rumore', 'passi', 'corridoio', 'notte'],
        text: 'Con il vento non si sente niente, e chi le dice il contrario vuole farsi importante. Ho sentito una porta di ferro, giù nel passaggio, e quella sì: è l’unica che fa quel rumore.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'passaggio',
        keywords: ['passaggio', 'servizio', 'cerata', 'gancio'],
        text: 'La cerata gialla è al gancio del passaggio. L’ho toccata io: fuori bagnata, dentro asciutta come un lenzuolo stirato. Non l’aveva addosso chi l’ha portata lì. Le camere non mentono.',
        reveals: ['fact.cerata-asciutta'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cena',
        keywords: ['cena', 'tavolo', 'zuppa', 'chiusura'],
        text: 'Ultima zuppa della stagione, quarantadue coperti, servita alle otto in punto. Il signor Vanzetti ha mangiato tutto e ha raccontato l’Aurelia. Il fratello no: né mangiato né raccontato.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'personale',
        keywords: ['personale', 'molo', 'gozzo', 'cima'],
        text: 'Il gozzo lo tengo io d’occhio perché ci porto la verdura. Stamattina la cima era annodata come dico io. Adesso c’è un nodo doppio che a Punta Sestriera non usa nessuno.',
        reveals: ['fact.gozzo-mosso'],
        fromAct: 2,
      },
      {
        topic: 'servizio',
        keywords: ['servizio', 'orario', 'bar', 'chiuso'],
        text: 'Il bar del molo chiude il 4 ottobre da vent’anni. Alle undici stavo smontando la macchina del caffè e la pioggia entrava di traverso. Chi c’era, c’era. Chi non c’era, non me ne accorgo.',
        reveals: [],
        fromAct: 1,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'telefonate',
        keywords: ['telefonata', 'interurbana', 'sanremo', '214'],
        text: 'Ventidue e trentacinque, Sanremo ventuno-quattro-quaranta, due minuti, addebito alla 214. È l’ultima che ho passato: alle 22:40 la linea è caduta e non è più tornata pulita.',
        reveals: ['fact.telefonata-sanremo-2235'],
        fromAct: 2,
      },
      {
        topic: 'linea',
        keywords: ['linea', 'caduta', 'centralino', 'alassio'],
        text: 'La linea per Alassio è saltata alle 22:40. Dopo, solo ronzio. Se qualcuno vi dice di aver telefonato dopo quell’ora, ha telefonato a un ronzio.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'orari',
        keywords: ['ora', 'passaggio', 'porta di ferro', 'rumore'],
        text: 'Il centralino sta nel passaggio, e la porta di ferro è a sei passi. L’ho sentita due volte: una verso le dieci meno un quarto, una molto più tardi, quando ormai scrivevo il foglio del turno.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'manutenzione',
        keywords: ['telo', 'vasca', 'piscina', 'svuotata'],
        text: 'Vasca vuota alle 19:40, telo fissato alle 21:40, scheda firmata. Adesso il lato corto è libero e le cime pendono. Non l’ho lasciato io così.',
        reveals: ['fact.telo-spostato', 'fact.piscina-svuotata'],
        fromAct: 1,
      },
      {
        topic: 'quadro',
        keywords: ['quadro', 'fari', 'luci', 'corrente'],
        text: 'La linea dei fari della vasca è stata aperta alle 22:10. A mano, non per scatto: la levetta era alzata e il salvavita è a posto. Non l’ho aperta io.',
        reveals: ['fact.luci-piscina-spente-2210'],
        fromAct: 2,
      },
      {
        topic: 'blackout',
        keywords: ['lampada', 'ripostiglio', 'batteria', 'segnalazione'],
        text: 'La lampada a otturatore l’ho provata mercoledì: batteria buona. Stanotte era fuori posto e non fa più luce. Una batteria a secco così si scarica in venti minuti di lampi.',
        reveals: ['fact.lampada-usata'],
        fromAct: 2,
      },
    ],
  },
  falseReconstruction: {
    summary:
      'Ricostruzione da sostenere: Vanzetti è uscito sulla terrazza alle 22:50 con addosso una discussione sui debiti, e sulla terrazza qualcuno lo ha raggiunto. Alle 23:47 l’orologio si è staccato nella caduta ed è finito nella vasca, che è a un metro dal parapetto. Il croupier era sceso in hall proprio in quei minuti, ha telefonato a Sanremo alle 22:35 e nessuno lo ha più visto fino a dopo mezzanotte. Il secondo della squadra è rimasto al bar del molo con i pescatori: il gozzo era al gancio e con quel mare non lo avrebbe slegato nessuno.',
    timeline: [
      { who: 'role.secondo', from: 1200, to: 1290, where: 'loc.bar-molo', note: 'A cena e poi al banco, con i pescatori.', hidden: false },
      { who: 'role.secondo', from: 1300, to: 1439, where: 'loc.bar-molo', note: 'Sempre al bar del molo, fino a dopo mezzanotte.', hidden: false },
      { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'In cabina telefonica, poi non più visto.', hidden: false },
      { who: 'victim', from: 1347, to: 1427, where: 'loc.terrazza', note: 'Sulla terrazza fino alle 23:47, secondo l’ora dell’orologio.', hidden: false },
    ],
    scapegoatRoleId: 'role.croupier',
  },
  texts: {
    reveal:
      'L’orologio non era di Elio Vanzetti. Sul fondello c’è scritto «A I. B. — 1962», e I. B. è Ivo Barigazzi, fratello per parte di madre, cognome diverso, stessa taglia di muta. Nel 1962, sull’Aurelia, sono scesi in due e a firmare il brevetto è stato uno solo. Per dodici anni Ivo è stato l’uomo della cima: quello che resta a mezz’acqua mentre l’altro va giù e poi sale sulle copertine. Il 4 ottobre 1967, alle 23:05, tre lampi corti hanno chiamato Elio alla secca del Grillo. Alle 23:10 la luce si è spenta. Alle 23:47 la corona di un orologio è stata estratta con due dita.',
    explanation:
      'Il perno è l’incisione. Un orologio garantito duecento metri non si ferma per tre metri di vasca vuota, e alle 23:47 la porta a vetri era chiusa da ventisette minuti: l’ora e il luogo non stavano insieme. Non stavano insieme perché erano stati messi insieme apposta. Le due catene arrivano allo stesso nome per strade diverse. La prima è materiale: il fondello inciso «I. B.», il brevetto con due nomi e una firma sola, la tessera con la fotografia riapplicata. La seconda è di movimento: la lampada a otturatore presa dal ripostiglio del passaggio, il gozzo riormeggiato con un nodo doppio che in Liguria non fa nessuno, la cerata di Elio riappesa asciutta da chi non la indossava. Ivo aveva anche esitato: la cerata l’aveva presa per portargliela, e poi l’ha riappesa. La firma involontaria è quel nodo, annodato due volte come annoda lui.',
    victoryInnocents:
      'Avete letto il fondello prima dell’ora. Da lì in poi era questione di guardare due nodi e una batteria scarica. Ivo Barigazzi non ha alzato la voce nemmeno quando è stato nominato: ha detto soltanto che sull’Aurelia erano scesi in due, e che finalmente qualcuno lo scriveva.',
    victoryCulprit:
      'L’ora ha retto. Nessuno ha girato l’orologio per guardarne il rovescio, e la secca del Grillo è rimasta una croce a matita su una carta piegata in otto. All’alba Ivo Barigazzi ha preso la corriera per Chioggia con una valigia sola, e sul registro della corriera ha firmato con il proprio cognome. Per la prima volta in dodici anni.',
    defeat:
      'L’indizio ignorato è il più piccolo: quattro strisce fresche sulla vernice della scaletta della vasca. Era comprensibile lasciarlo perdere — una scaletta riverniciata a settembre si sfregia da sola — ma quelle strisce dicevano che qualcuno era sceso nella vasca vuota dopo il temporale, con le mani impegnate e la fretta di risalire.',
  },
};
