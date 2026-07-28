import type { VariantDef } from '@meridien/engine';
import { factsFor } from '../clues.js';

/**
 * Variante C — «La fotografia sbagliata».
 * Colpevole: Ninetta Corsaro. Movente: una fotografia del 1962 che non
 * documentava niente, perché era stata composta a tavolino. Metodo: la
 * cintura di zavorra alterata prima dell'ultima immersione della stagione.
 * Il perno: la nona posa. È l'unica che manchi dal foglio di provini, è
 * l'unico negativo rigato, ed è l'unica scattata verso il largo.
 */

export const variantFotografiaSbagliata: VariantDef = {
  id: 'var.fotografia-sbagliata',
  name: 'La fotografia sbagliata',
  tagline: 'Dodici pose, undici provini. La nona guardava dalla parte giusta.',
  culpritRoleId: 'role.fotografa',
  motiveKey: 'fotografia-compromettente',
  methodKey: 'zavorra-manomessa',
  sequence: ['beat.patto', 'beat.cena', 'beat.uscita', 'beat.gesto', 'beat.ora'],
  beatDetails: {
    'beat.patto':
      'Nel pomeriggio, sul bordo della vasca già vuota, si stabilisce l’ordine della serata: l’ultima immersione di stagione alle undici, dal molo, con il flash da terra.',
    'beat.cena':
      'A cena Elio annuncia che il 5 racconterà tutto a un settimanale di Milano: il 1962, il fratello, la campana dell’Aurelia. Lo dice ridendo, come si dice una liberazione.',
    'beat.uscita':
      'Alle 22:50 Elio esce sulla terrazza, scende la scaletta del molo e si attrezza sotto la tettoia, con la pioggia che entra di traverso.',
    'beat.gesto':
      'La cintura porta due piombi in più del solito e la fibbia a sgancio rapido è stata girata dalla parte scomoda. Alle 23:10 la torcia si spegne al largo.',
    'beat.ora':
      'Alle 23:47 la corona dell’orologio, rimasto sui vestiti asciutti del bar, viene estratta con due dita. Poi l’orologio scende nella vasca vuota.',
  },
  facts: factsFor(
    [
      {
        id: 'fact.c-nessuna-posa-dopo-2300',
        text: 'Corsaro afferma di non aver scattato nessuna fotografia dopo le 23:00.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.c-vasca-inaccessibile',
        text: 'Ravano afferma che dopo lo svuotamento nella vasca non è sceso nessuno.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.c-orologio-di-elio',
        text: 'Barigazzi afferma che l’orologio trovato nella vasca è quello che Elio portava al polso dal 1962.',
        kind: 'dichiarazione',
        common: false,
      },
      {
        id: 'fact.c-nessuna-perdita',
        text: 'Pittaluga afferma che in questa stagione Vanzetti non ha mai perso al tavolo.',
        kind: 'dichiarazione',
        common: false,
      },
    ],
    {
      'fact.posa-nove-mancante':
        'Sul foglio di provini manca la nona posa: l’unica scattata verso il largo invece che verso la pensilina.',
      'fact.foto-1962-ritagliata':
        'La stampa del 1962 è stata tagliata proprio dove il montaggio si vedeva: mani e numero cucito sulla muta.',
    },
  ),
  timeline: [
    { who: 'victim', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'All’ultima cena. Annuncia ridendo che il 5 racconterà tutto a Milano.', hidden: false },
    { who: 'victim', from: 1283, to: 1345, where: 'loc.hall', note: 'Al bancone, con l’orologio già slacciato in tasca.', hidden: false },
    { who: 'victim', from: 1347, to: 1370, where: 'loc.terrazza', note: 'Sotto la pensilina, cerata sulle spalle, guarda il mare da ponente.', hidden: false },
    { who: 'victim', from: 1376, to: 1385, where: 'loc.bar-molo', note: 'Scende la scaletta, lascia i vestiti asciutti sul tavolo e si attrezza.', hidden: false },
    { who: 'victim', from: 1385, to: 1390, where: 'loc.bar-molo', note: 'Alle 23:05 entra in acqua dalla scaletta del molo con la torcia accesa.', hidden: true },
    { who: 'role.fotografa', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la macchina appoggiata sul tavolo e il flash già carico.', hidden: false },
    { who: 'role.fotografa', from: 1283, to: 1300, where: 'loc.piscina', note: 'Sotto il telo della vasca, dove la squadra ripara l’attrezzatura.', hidden: true },
    { who: 'role.fotografa', from: 1302, to: 1395, where: 'loc.terrazza', note: 'Dodici pose sotto la pensilina; la nona alle 23:12, verso il largo.', hidden: false },
    { who: 'role.fotografa', from: 1401, to: 1412, where: 'loc.bar-molo', note: 'Raccoglie i vestiti asciutti dal tavolo del bar, e con essi l’orologio.', hidden: true },
    { who: 'role.fotografa', from: 1418, to: 1428, where: 'loc.piscina', note: 'Scende la scaletta della vasca, estrae la corona, appoggia l’orologio alla griglia.', hidden: true },
    { who: 'role.fotografa', from: 1432, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppa e riga il negativo nove con un’unghia, alla luce rossa.', hidden: true },
    { who: 'role.secondo', from: 1200, to: 1290, where: 'loc.bar-molo', note: 'A cena e poi al banco: si rifiuta di fare da appoggio con quel mare.', hidden: false },
    { who: 'role.secondo', from: 1300, to: 1439, where: 'loc.bar-molo', note: 'Resta sotto la tettoia a guardare il largo, senza scendere in acqua.', hidden: false },
    { who: 'role.croupier', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena. Non beve e non parla di lavoro.', hidden: false },
    { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'Nella cabina di noce: alle 22:35 chiede Sanremo e resta due minuti.', hidden: false },
    { who: 'role.croupier', from: 1363, to: 1439, where: 'loc.corridoio', note: 'Sale al secondo piano e non scende più.', hidden: false },
    { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Consegne di chiusura e firme sulle schede del personale.', hidden: false },
    { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Chiude a chiave la porta a vetri senza guardare fuori.', hidden: false },
    { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Riporta la chiave al quadro e resta al bancone.', hidden: false },
    { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con la cartella dei contratti sotto la sedia.', hidden: false },
    { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, a rileggere la polizza con la decorrenza corretta a penna.', hidden: false },
    { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze accanto al piatto.', hidden: false },
    { who: 'role.impresario', from: 1285, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali, ad aspettare che torni la linea per Milano.', hidden: false },
    { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
    { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte: due pezzi, poi la corrente salta.', hidden: false },
    { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena. Ha sconsigliato l’immersione notturna e non è stato ascoltato.', hidden: false },
    { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, con la valigetta aperta sul letto.', hidden: false },
    { who: 'wit.bramante', from: 1200, to: 1439, where: 'loc.hall', note: 'Dietro il bancone, con il quadro delle chiavi alle spalle.', hidden: false },
    { who: 'wit.pesce', from: 1200, to: 1439, where: 'loc.bar-molo', note: 'Smonta la cucina del bar e guarda il largo fra una cassa e l’altra.', hidden: false },
    { who: 'wit.bacigalupo', from: 1200, to: 1260, where: 'loc.passaggio', note: 'Al quadro elettrico, a preparare la chiusura di stagione.', hidden: false },
    { who: 'wit.bacigalupo', from: 1265, to: 1332, where: 'loc.piscina', note: 'Fissa il telo alle 21:40, apre la linea dei fari alle 22:10.', hidden: false },
    { who: 'wit.bacigalupo', from: 1334, to: 1439, where: 'loc.passaggio', note: 'In officina, con la porta aperta sul corridoio di servizio.', hidden: false },
  ],
  clueSetup: [
    { clueId: 'clue.orologio-fondo', relevance: 'critico', act: 1, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: null },
    { clueId: 'clue.ghiera-orologio', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: null },
    { clueId: 'clue.ringhiera-terrazza', relevance: 'falsa-pista', act: 2, locationId: 'loc.terrazza', hotspot: 'parapetto', puzzle: null },
    { clueId: 'clue.porta-vetri', relevance: 'utile', act: 1, locationId: 'loc.terrazza', hotspot: 'porta-vetri', puzzle: null },
    { clueId: 'clue.impronte-bagnate', relevance: 'contorno', act: 1, locationId: 'loc.terrazza', hotspot: 'soglia', puzzle: null },
    { clueId: 'clue.telo-piscina', relevance: 'utile', act: 2, locationId: 'loc.piscina', hotspot: 'telo', puzzle: null },
    { clueId: 'clue.scala-vasca', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'scaletta', puzzle: null },
    { clueId: 'clue.giaccavento', relevance: 'falsa-pista', act: 2, locationId: 'loc.passaggio', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.incisione-orologio', relevance: 'critico', act: 2, locationId: 'loc.piscina', hotspot: 'griglia', puzzle: null },
    { clueId: 'clue.certificato-immersione', relevance: 'critico', act: 2, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.registro-arrivi', relevance: 'utile', act: 1, locationId: 'loc.hall', hotspot: 'registro', puzzle: null },
    { clueId: 'clue.tessera-marina', relevance: 'critico', act: 3, locationId: 'loc.corridoio', hotspot: 'comodino', puzzle: null },
    { clueId: 'clue.cambiale', relevance: 'falsa-pista', act: 3, locationId: 'loc.corridoio', hotspot: 'valigia', puzzle: null },
    { clueId: 'clue.libretto-casino', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'tavolino', puzzle: null },
    { clueId: 'clue.lettera-banca', relevance: 'utile', act: 2, locationId: 'loc.corridoio', hotspot: 'comodino', puzzle: null },
    { clueId: 'clue.polizza-vita', relevance: 'falsa-pista', act: 2, locationId: 'loc.hall', hotspot: 'cartella', puzzle: null },
    { clueId: 'clue.ricevuta-saldata', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'cassa', puzzle: null },
    { clueId: 'clue.assegno-strappato', relevance: 'falsa-pista', act: 2, locationId: 'loc.hall', hotspot: 'cestino', puzzle: null },
    { clueId: 'clue.provino-contatto', relevance: 'critico', act: 1, locationId: 'loc.hall', hotspot: 'tavolino', puzzle: { kind: 'scelta', prompt: 'Sul foglio di provini quale riquadro è rimasto bianco?', options: ['Il primo', 'Il nono', 'Il dodicesimo'], answer: 'Il nono', hint: 'Confronta i numeri stampati sotto i riquadri con le righe del taccuino di posa.' } },
    { clueId: 'clue.negativo-graffiato', relevance: 'critico', act: 2, locationId: 'loc.camera-oscura', hotspot: 'striscia', puzzle: null },
    { clueId: 'clue.fotografia-terrazza', relevance: 'critico', act: 3, locationId: 'loc.camera-oscura', hotspot: 'filo', puzzle: null },
    { clueId: 'clue.orario-flash', relevance: 'critico', act: 2, locationId: 'loc.camera-oscura', hotspot: 'taccuino', puzzle: null },
    { clueId: 'clue.bacinella-fissaggio', relevance: 'critico', act: 3, locationId: 'loc.camera-oscura', hotspot: 'bacinelle', puzzle: null },
    { clueId: 'clue.foto-vecchia', relevance: 'critico', act: 2, locationId: 'loc.camera-oscura', hotspot: 'tavolo-montaggio', puzzle: null },
    { clueId: 'clue.lampada-segnali', relevance: 'falsa-pista', act: 3, locationId: 'loc.passaggio', hotspot: 'ripostiglio', puzzle: null },
    { clueId: 'clue.quaderno-faro', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'bacheca', puzzle: null },
    { clueId: 'clue.testimonianza-pescatore', relevance: 'critico', act: 2, locationId: 'loc.hall', hotspot: 'bancone', puzzle: { kind: 'orario', prompt: 'A che ora il pescatore Sciaccaluga vede spegnersi la luce al largo?', options: ['22:50', '23:10', '23:47'], answer: '23:10', hint: 'Cinque minuti dopo i tre lampi annotati dal guardiano di Capo Mele.' } },
    { clueId: 'clue.barca-molo', relevance: 'falsa-pista', act: 2, locationId: 'loc.bar-molo', hotspot: 'gancio', puzzle: null },
    { clueId: 'clue.carta-nautica', relevance: 'falsa-pista', act: 3, locationId: 'loc.bar-molo', hotspot: 'tavolo', puzzle: null },
    { clueId: 'clue.registro-chiavi', relevance: 'falsa-pista', act: 3, locationId: 'loc.hall', hotspot: 'quadro-chiavi', puzzle: null },
    { clueId: 'clue.centralino-chiamata', relevance: 'falsa-pista', act: 3, locationId: 'loc.passaggio', hotspot: 'centralino', puzzle: null },
    { clueId: 'clue.scarpe-asciutte', relevance: 'utile', act: 1, locationId: 'loc.corridoio', hotspot: 'porta-209', puzzle: null },
    { clueId: 'clue.ombrello-corridoio', relevance: 'falsa-pista', act: 2, locationId: 'loc.corridoio', hotspot: 'porta-214', puzzle: null },
    { clueId: 'clue.quadro-elettrico', relevance: 'contorno', act: 2, locationId: 'loc.passaggio', hotspot: 'quadro', puzzle: null },
  ],
  inferences: [
    {
      id: 'inf.c-colpevole-materiale',
      text: 'Manca la nona posa dal foglio di provini e il nono negativo è rigato a pellicola asciutta: l’unica persona che poteva togliere quel fotogramma è quella che lo ha sviluppato.',
      concludes: 'culprit',
      paths: [
        ['fact.posa-nove-mancante', 'fact.negativo-danneggiato'],
        ['fact.foto-1962-ritagliata', 'fact.camera-oscura-usata-tardi'],
      ],
    },
    {
      id: 'inf.c-colpevole-temporale',
      text: 'Alle 23:12 si scattava ancora, e alle 23:20 la terrazza è stata chiusa a chiave da fuori. Chi teneva la macchina in mano era fuori, e non è rientrato da quella porta.',
      concludes: 'culprit',
      paths: [
        ['fact.posa-nove-alle-2312', 'fact.terrazza-chiusa-2320'],
        ['fact.due-figure-terrazza', 'fact.scarpe-asciutte'],
      ],
    },
    {
      id: 'inf.c-movente-fotomontaggio',
      text: 'Il brevetto del 1962 nomina due uomini e la stampa di quell’anno è stata tagliata proprio dove il montaggio si vedeva: la fotografia che ha costruito una carriera non documentava niente.',
      concludes: 'motive',
      paths: [
        ['fact.foto-1962-ritagliata', 'fact.impresa-1962-due-uomini'],
        ['fact.orologio-inciso-ib', 'fact.tessera-alterata'],
      ],
    },
    {
      id: 'inf.c-movente-rotocalco',
      text: 'Con il conto scoperto, Vanzetti aveva una sola merce da vendere a un settimanale: il 1962. Raccontarlo avrebbe travolto chi quelle fotografie le aveva firmate.',
      concludes: 'motive',
      paths: [
        ['fact.posa-nove-mancante', 'fact.due-vanzetti-registro'],
        ['fact.negativo-danneggiato', 'fact.conto-scoperto'],
      ],
    },
    {
      id: 'inf.c-metodo-zavorra',
      text: 'La luce che si spegne al largo alle 23:10 e la scaletta della vasca usata dopo la riverniciatura dicono che l’attrezzatura è stata toccata prima dell’immersione, non dopo.',
      concludes: 'method',
      paths: [
        ['fact.luce-in-mare-2310', 'fact.scaletta-usata'],
        ['fact.telo-spostato', 'fact.luci-piscina-spente-2210'],
      ],
    },
    {
      id: 'inf.c-metodo-ora-spostata',
      text: 'L’orologio è stato fermato con la corona su un’ora successiva all’immersione: serviva a togliere l’immersione dal quadro e a mettere al suo posto una caduta dalla terrazza.',
      concludes: 'method',
      paths: [
        ['fact.orologio-fermo-2347', 'fact.orologio-manomesso'],
        ['fact.segnali-2305', 'fact.impronte-verso-interno'],
      ],
    },
    {
      id: 'inf.c-sequenza-immersione',
      text: 'La cerata riappesa asciutta nel passaggio e il gozzo mosso raccontano un molo affollato fino alle undici: Vanzetti è sceso in acqua da lì, non dal parapetto.',
      concludes: 'sequence',
      paths: [
        ['fact.cerata-asciutta', 'fact.gozzo-mosso'],
        ['fact.lampada-usata', 'fact.punto-segnato-secca'],
      ],
    },
    {
      id: 'inf.c-sequenza-camera',
      text: 'Fra le 23:40 e mezzanotte l’albergo si muove tutto insieme: una chiave che esce dal quadro, un ombrello che gocciola, una vernice grattata e una ricevuta che nessuno ha chiesto.',
      concludes: 'sequence',
      paths: [
        ['fact.qualcuno-rientrato-2350', 'fact.chiave-terrazza-ritirata-2340'],
        ['fact.segno-ringhiera', 'fact.debito-saldato-quel-giorno'],
      ],
    },
    {
      id: 'inf.c-nota-debiti',
      text: 'Il pagherò in scadenza il 5 e tre serate di perdite spiegano perché Vanzetti volesse vendere una storia, non perché non sia risalito.',
      concludes: 'support',
      paths: [['fact.debito-scadenza-5', 'fact.perdite-casino']],
    },
    {
      id: 'inf.c-nota-polizza',
      text: 'Una copertura anticipata al 1° ottobre e un assegno rifiutato sono due segni di una società che si preparava a perdere un uomo, non a perderlo quella notte.',
      concludes: 'support',
      paths: [['fact.polizza-beneficiaria', 'fact.assegno-rifiutato']],
    },
    {
      id: 'inf.c-nota-telefono',
      text: 'L’interurbana delle 22:35 e la chiusura della porta a vetri alle 23:20 sono le due sole ore certificate da carta d’albergo: tutto il resto va confrontato con loro.',
      concludes: 'support',
      paths: [['fact.telefonata-sanremo-2235', 'fact.terrazza-chiusa-2320']],
    },
    {
      id: 'inf.c-nota-nodo',
      text: 'Il nodo doppio sulla cima del gozzo e il brevetto con due nomi appartengono alla stessa vecchia storia di famiglia, che quella notte non ha mosso un dito.',
      concludes: 'support',
      paths: [['fact.gozzo-mosso', 'fact.impresa-1962-due-uomini']],
    },
  ],
  contradictions: [
    {
      id: 'contra.c-posa',
      a: 'fact.posa-nove-alle-2312',
      b: 'fact.c-nessuna-posa-dopo-2300',
      text: 'Il taccuino di posa data la riga nove alle 23:12, scritta a matita mentre si scattava. Sostenere di aver chiuso alle 23:00 significa smentire la propria scrittura.',
      implicates: 'role.fotografa',
    },
    {
      id: 'contra.c-vasca',
      a: 'fact.scaletta-usata',
      b: 'fact.c-vasca-inaccessibile',
      text: 'La scaletta riverniciata a settembre porta quattro strisce fresche sui montanti, all’altezza delle mani. Nella vasca vuota qualcuno è sceso, e poi è risalito.',
      implicates: 'role.direttore',
    },
    {
      id: 'contra.c-fondello',
      a: 'fact.orologio-inciso-ib',
      b: 'fact.c-orologio-di-elio',
      text: 'Sul fondello c’è inciso «A I. B. — 1962». Chi dichiara che quell’orologio era al polso di Elio dal 1962 dichiara una cosa che il fondello nega.',
      implicates: 'role.secondo',
    },
    {
      id: 'contra.c-tavolo',
      a: 'fact.perdite-casino',
      b: 'fact.c-nessuna-perdita',
      text: 'Il libretto porta tre serate consecutive con le colonne di destra che scendono e non risalgono. Dire che in stagione non si è mai perso è dire il contrario di una contabilità.',
      implicates: 'role.croupier',
    },
  ],
  roleProfiles: [
    {
      roleId: 'role.armatrice',
      declaredAlibi:
        'Nella 207 dalle dieci e mezza. L’immersione notturna non l’avevo autorizzata io: l’ho saputa a cena e ho detto che non se ne faceva niente. Poi sono salita.',
      trueTimeline: [
        { who: 'role.armatrice', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena; si oppone all’immersione notturna e non viene ascoltata.', hidden: false },
        { who: 'role.armatrice', from: 1285, to: 1439, where: 'loc.corridoio', note: 'Nella 207, con la polizza aperta sul letto.', hidden: true },
      ],
      secretId: 'sec.polizza-anticipata',
      objectiveId: 'goal.segreto-al-sicuro',
      exclusiveClueId: 'clue.assegno-strappato',
      declarations: [
        { key: 'verita', text: 'L’immersione di stagione era una posa per i giornali, non un lavoro. L’avevo detto: con quel mare non si scende per una fotografia.' },
        { key: 'omissione', text: 'La copertura della squadra è in regola. Da quando decorra è una questione di uffici e gli uffici sono a Genova.' },
        { key: 'bugia', text: 'Non sapevo che Elio avesse debiti. Se li avesse avuti, la società se ne sarebbe accorta prima di chiunque altro.' },
      ],
      shareable: [
        'L’immersione delle undici doveva servire soltanto a un servizio fotografico già venduto.',
        'Nel cestino della hall c’era un assegno di quattro milioni strappato, con «no» scritto sopra la firma.',
      ],
      hidden: ['La decorrenza della polizza è stata anticipata di un mese con una sigla che è la mia.'],
    },
    {
      roleId: 'role.impresario',
      declaredAlibi:
        'Nella hall, al tavolino dei giornali, dalle dieci e mezza in poi. Aspettavo Milano per confermare le date di novembre e Milano non è mai arrivata.',
      trueTimeline: [
        { who: 'role.impresario', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, con il taccuino delle piazze accanto al piatto.', hidden: false },
        { who: 'role.impresario', from: 1285, to: 1439, where: 'loc.hall', note: 'Al tavolino dei giornali, a rifare i conti delle serate già vendute.', hidden: false },
      ],
      secretId: 'sec.tournee-vuota',
      objectiveId: 'goal.tre-indizi',
      exclusiveClueId: 'clue.polizza-vita',
      declarations: [
        { key: 'verita', text: 'A cena Elio ha detto che il 5 avrebbe raccontato tutto a un settimanale di Milano. Ha riso, e ha riso solo lui.' },
        { key: 'omissione', text: 'Le caparre degli organizzatori sono affari fra me e loro. Che siano già state incassate non riguarda questa notte.' },
        { key: 'bugia', text: 'Il servizio fotografico di stanotte non l’avevo venduto io. Io porto uomini nelle piscine coperte, non pagine nei rotocalchi.' },
      ],
      shareable: [
        'Il servizio sull’ultima immersione era già venduto a un settimanale, con anticipo incassato.',
        'La polizza della squadra ha la decorrenza corretta a penna, dal 1° novembre al 1° ottobre.',
      ],
      hidden: ['Le quattordici serate sono già pagate e non ho più nessuno da mandare in vasca.'],
    },
    {
      roleId: 'role.direttore',
      declaredAlibi:
        'Dietro il bancone, salvo i cinque minuti delle 23:20 per chiudere la porta a vetri. La vasca era vuota e coperta: da quel momento è roba da primavera.',
      trueTimeline: [
        { who: 'role.direttore', from: 1200, to: 1290, where: 'loc.hall', note: 'Consegne di chiusura e firme sulle schede.', hidden: false },
        { who: 'role.direttore', from: 1400, to: 1405, where: 'loc.terrazza', note: 'Gira la chiave della porta a vetri senza guardare fuori.', hidden: false },
        { who: 'role.direttore', from: 1407, to: 1439, where: 'loc.hall', note: 'Riporta la chiave al quadro e resta al bancone.', hidden: false },
      ],
      secretId: 'sec.camere-fuori-registro',
      objectiveId: 'goal.essere-creduti',
      exclusiveClueId: 'clue.quadro-elettrico',
      declarations: [
        { key: 'verita', text: 'La porta a vetri l’ho chiusa alle 23:20. È una regola della casa e stanotte l’ho applicata come tutte le sere di libeccio.' },
        { key: 'omissione', text: 'Che l’attrezzatura della squadra fosse ricoverata sotto il telo della vasca lo sapevano in cinque. Sei, contando me.' },
        { key: 'bugia', text: 'Nella vasca, dopo lo svuotamento, non è sceso nessuno. È coperta e la scaletta è appena riverniciata: si vedrebbe.', asserts: 'fact.c-vasca-inaccessibile' },
      ],
      shareable: [
        'L’attrezzatura della squadra era ricoverata sotto il telo della vasca, al riparo dal temporale.',
        'La linea dei fari della piscina è stata aperta a mano alle 22:10, e non da Bacigalupo.',
      ],
      hidden: ['Tre camere del secondo piano sono state affittate tutta la stagione senza comparire sul registro.'],
    },
    {
      roleId: 'role.cantante',
      declaredAlibi:
        'Al pianoforte della hall. Due pezzi, poi la corrente. Non mi sono mossa perché con quelle scarpe, su quel marmo bagnato, non ci si muove.',
      trueTimeline: [
        { who: 'role.cantante', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena, in piedi, senza toccare il secondo.', hidden: false },
        { who: 'role.cantante', from: 1285, to: 1439, where: 'loc.hall', note: 'Al pianoforte; guarda la porta a vetri fra un pezzo e l’altro.', hidden: false },
      ],
      secretId: 'sec.matrimonio-taciuto',
      objectiveId: 'goal.proteggi-la-cantante',
      exclusiveClueId: 'clue.centralino-chiamata',
      declarations: [
        { key: 'verita', text: 'Elio a cena ha parlato di Milano e di un settimanale. Poi ha guardato la fotografa, e la fotografa ha guardato il piatto.' },
        { key: 'omissione', text: 'Con Elio è finita nel ’65. Che ci fossimo detti qualcosa quest’estate non cambia niente per stanotte.' },
        { key: 'bugia', text: 'Non ho sentito nessuna telefonata dalla cabina. Il pianoforte copre tutto, e io suonavo con il pedale premuto.' },
      ],
      shareable: [
        'Il foglio del centralino porta un’interurbana per Sanremo alle 22:35, addebitata alla 214.',
        'A cena Elio ha detto una frase sola sul 1962 e la fotografa ha smesso di mangiare.',
      ],
      hidden: ['Il mio matrimonio del 1961 non è mai stato sciolto e non l’ho detto a nessuno.'],
    },
    {
      roleId: 'role.fotografa',
      declaredAlibi:
        'Sulla terrazza fino alle 23:00 a fare pose sul temporale, poi in camera oscura a sviluppare. Non sono scesa al molo: con quella pioggia l’obiettivo lungo non serve a niente.',
      trueTimeline: [
        { who: 'role.fotografa', from: 1283, to: 1300, where: 'loc.piscina', note: 'Sotto il telo, dove è ricoverata l’attrezzatura della squadra.', hidden: true },
        { who: 'role.fotografa', from: 1302, to: 1395, where: 'loc.terrazza', note: 'Dodici pose; la nona alle 23:12, verso il largo invece che sulla pensilina.', hidden: false },
        { who: 'role.fotografa', from: 1418, to: 1428, where: 'loc.piscina', note: 'Estrae la corona dell’orologio e lo appoggia contro la griglia.', hidden: true },
        { who: 'role.fotografa', from: 1432, to: 1439, where: 'loc.camera-oscura', note: 'Sviluppa e riga il negativo nove alla luce rossa.', hidden: true },
      ],
      secretId: 'sec.negativo-venduto',
      objectiveId: 'goal.trova-orologio',
      exclusiveClueId: 'clue.foto-vecchia',
      declarations: [
        { key: 'verita', text: 'Le fotografie che hanno fatto di Elio un nome sono mie. Nessuno me ne ha mai chiesto conto e nessuno me ne ha mai pagato la metà.' },
        { key: 'omissione', text: 'La stampa del ’62 sul tavolo è tagliata perché la stavo rifilando per un formato. Capita, con le stampe vecchie.' },
        { key: 'bugia', text: 'Dopo le undici non ho più scattato. Con quella pioggia e quel vento non si tiene ferma una macchina, nemmeno appoggiata.', asserts: 'fact.c-nessuna-posa-dopo-2300' },
      ],
      shareable: [
        'Il brevetto del 1962 porta due nominativi e una firma sola: lo sapevo da cinque anni.',
        'Sulla terrazza, sotto la pensilina, non c’era una figura sola: ce n’erano due.',
      ],
      hidden: ['Il montaggio del ’62 l’ho fatto io, e il negativo nove l’ho rigato con un’unghia.'],
    },
    {
      roleId: 'role.medico',
      declaredAlibi:
        'Nella 211 dalle dieci e mezza. Avevo sconsigliato l’immersione notturna per iscritto, sul registro della squadra, e nessuno mi ha risposto.',
      trueTimeline: [
        { who: 'role.medico', from: 1200, to: 1275, where: 'loc.bar-molo', note: 'A cena; sconsiglia l’immersione e non viene ascoltato.', hidden: false },
        { who: 'role.medico', from: 1288, to: 1439, where: 'loc.corridoio', note: 'Nella 211, a chiudere il registro delle idoneità.', hidden: true },
      ],
      secretId: 'sec.certificato-di-comodo',
      objectiveId: 'goal.non-si-parli-del-1962',
      exclusiveClueId: 'clue.giaccavento',
      declarations: [
        { key: 'verita', text: 'Ho scritto sul registro che con quel mare non si scendeva. È l’unica riga di stanotte che qualcuno ha firmato e datato prima dei fatti.' },
        { key: 'omissione', text: 'Le idoneità le firmo io. Dove le firmo e con quanta calma non credo interessi a una pattuglia di Alassio.' },
        { key: 'bugia', text: 'La cerata gialla nel passaggio l’ho appesa io, rientrando dalla cucina. Non c’è niente di misterioso in un gancio.' },
      ],
      shareable: [
        'La cerata di Elio è appesa nel passaggio: bagnata fuori, asciutta dentro. Non la indossava chi l’ha portata.',
        'Avevo sconsigliato l’immersione notturna e la richiesta di farla comunque veniva dal servizio fotografico.',
      ],
      hidden: ['Da due stagioni firmo le idoneità della squadra senza visitare nessuno.'],
    },
    {
      roleId: 'role.secondo',
      declaredAlibi:
        'Al bar del molo tutta la sera. Mi sono rifiutato di fare da appoggio: con il libeccio non si scende, e gliel’ho detto davanti a tutti. È sceso lo stesso.',
      trueTimeline: [
        { who: 'role.secondo', from: 1200, to: 1290, where: 'loc.bar-molo', note: 'A cena e poi al banco; rifiuta l’appoggio per l’immersione.', hidden: false },
        { who: 'role.secondo', from: 1300, to: 1439, where: 'loc.bar-molo', note: 'Sotto la tettoia, a guardare il largo senza scendere in acqua.', hidden: false },
      ],
      secretId: 'sec.nome-prestato',
      objectiveId: 'goal.cinque-domande',
      exclusiveClueId: 'clue.incisione-orologio',
      declarations: [
        { key: 'verita', text: 'Gli ho detto che con quel mare non si scende e che una fotografia non vale una cintura di piombi. È sceso lo stesso, come sempre.' },
        { key: 'omissione', text: 'Nel ’62 sull’Aurelia siamo scesi in due. Chi ha firmato il brevetto l’ha firmato, e non sono cose che si sistemano dopo cinque anni.' },
        { key: 'bugia', text: 'L’orologio nella vasca è il suo: lo portava al polso dal ’62 e non se lo toglieva nemmeno per dormire.', asserts: 'fact.c-orologio-di-elio' },
      ],
      shareable: [
        'Dal portapiombi della squadra mancano due piombi da due chili, e la fibbia era girata dalla parte scomoda.',
        'L’attrezzatura era ricoverata sotto il telo della vasca e chiunque poteva alzarne un lato.',
      ],
      hidden: ['I contratti della squadra portano da dodici anni un nome che non è di chi scende.'],
    },
    {
      roleId: 'role.croupier',
      declaredAlibi:
        'Telefonata alle 22:35 dalla cabina della hall, poi in camera al secondo piano. Non sono sceso al molo e non capisco niente di bombole.',
      trueTimeline: [
        { who: 'role.croupier', from: 1285, to: 1360, where: 'loc.hall', note: 'In cabina; parla due minuti e riappende prima che cada la linea.', hidden: false },
        { who: 'role.croupier', from: 1363, to: 1439, where: 'loc.corridoio', note: 'In camera, a rifare la somma delle tre serate coperte di tasca propria.', hidden: true },
      ],
      secretId: 'sec.cassa-del-tavolo',
      objectiveId: 'goal.sospetto-sul-croupier',
      exclusiveClueId: 'clue.cambiale',
      declarations: [
        { key: 'verita', text: 'La cambiale scadeva il 5 e il beneficiario è stato scritto dopo, in nero. Chi l’ha scritto non ha avuto il coraggio di farlo davanti al debitore.' },
        { key: 'omissione', text: 'Alle 22:35 ho telefonato a Sanremo. Era una chiamata di lavoro e non riguarda il mare.' },
        { key: 'bugia', text: 'In questa stagione Vanzetti non ha mai perso al tavolo. Giocava piano e si fermava presto: era uno dei pochi.', asserts: 'fact.c-nessuna-perdita' },
      ],
      shareable: [
        'La cambiale da quattro milioni scadeva il 5 ottobre e il beneficiario è stato aggiunto dopo.',
        'Elio a cena ha detto che il 5 avrebbe sistemato tutto con una storia da vendere, non con del denaro.',
      ],
      hidden: ['Le tre serate di perdite le ho coperte io, con denaro che non usciva dalla cassa.'],
    },
  ],
  witnessLines: {
    'wit.bramante': [
      {
        topic: 'orari',
        keywords: ['ora', 'uscito', 'terrazza', 'ultima volta'],
        text: 'Il signor Vanzetti è uscito sulla terrazza alle 22:50 e non è rientrato da quella porta. L’orologio non ce l’aveva al polso: se l’era slacciato al bancone, davanti a me.',
        reveals: ['fact.uscita-2250'],
        fromAct: 1,
      },
      {
        topic: 'registro',
        keywords: ['registro', 'arrivi', 'chioggia', 'camera'],
        text: 'Il 2 ottobre due righe di seguito, stesso indirizzo di Chioggia, cognomi diversi, una camera sola. Io non guardo, signore: io registro. Ma due righe uguali si notano.',
        reveals: ['fact.due-vanzetti-registro'],
        fromAct: 1,
      },
      {
        topic: 'ospiti',
        keywords: ['fotografa', 'stireria', 'chiave', 'camera oscura'],
        text: 'La chiave della vecchia stireria è della signorina Corsaro da giugno. Non l’ha mai riconsegnata e io non gliel’ho mai chiesta: certe abitudini in albergo si rispettano.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.coldani': [
      {
        topic: 'pulizie',
        keywords: ['scarpe', '209', 'suole', 'lucidatura'],
        text: 'Davanti alla 209 le scarpe da sera erano fuori per la lucidatura: suole asciutte, tacco pulito. Chi le portava non è uscito. Le camere non mentono, le persone sì.',
        reveals: ['fact.scarpe-asciutte'],
        fromAct: 1,
      },
      {
        topic: 'camere',
        keywords: ['214', 'ombrello', 'porta', 'notte'],
        text: 'Alle 23:50 un ombrello gocciolava alla porta della 214. L’ho segnato per la moquette. Alle 00:20 non c’era più: qualcuno se l’è ripreso e non era il proprietario.',
        reveals: ['fact.qualcuno-rientrato-2350'],
        fromAct: 2,
      },
      {
        topic: 'passaggio',
        keywords: ['passaggio', 'cerata', 'gancio', 'servizio'],
        text: 'La cerata gialla è al gancio del passaggio. L’ho toccata io: fuori bagnata, dentro asciutta. Non l’aveva addosso chi l’ha portata lì, e questo lo dico senza fare nomi.',
        reveals: ['fact.cerata-asciutta'],
        fromAct: 2,
      },
    ],
    'wit.pesce': [
      {
        topic: 'cena',
        keywords: ['cena', 'milano', 'settimanale', 'tavolo'],
        text: 'Quarantadue coperti alle otto in punto. Al dolce il signor Vanzetti ha detto che il 5 andava a Milano a raccontare una cosa vecchia di cinque anni. Poi ha chiesto il caffè.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'servizio',
        keywords: ['molo', 'immersione', 'scaletta', 'torcia'],
        text: 'Alle undici stavo smontando la macchina del caffè. Ho visto la torcia entrare in acqua dalla scaletta del molo. Bella, da lontano: una macchia verde che scende piano.',
        reveals: [],
        fromAct: 2,
      },
      {
        topic: 'personale',
        keywords: ['bombole', 'cima', 'gozzo', 'nodo'],
        text: 'Il gozzo lo tengo d’occhio io perché ci porto la verdura. La cima adesso ha un nodo doppio che qui non usa nessuno. Il secondo della squadra annoda così, e lo fa da sempre.',
        reveals: ['fact.gozzo-mosso'],
        fromAct: 2,
      },
    ],
    'wit.ottonello': [
      {
        topic: 'linea',
        keywords: ['linea', 'caduta', 'alassio', 'centralino'],
        text: 'La linea per Alassio è caduta alle 22:40. Dopo, solo ronzio. Chi vi dice di aver telefonato più tardi ha telefonato a un ronzio, e non lo dico per essere spiritosa.',
        reveals: [],
        fromAct: 1,
      },
      {
        topic: 'messaggi',
        keywords: ['messaggio', 'milano', 'redazione', 'settimanale'],
        text: 'Nel pomeriggio ho preso un messaggio per il signor Vanzetti: una redazione di Milano confermava un appuntamento per il 6. L’ho lasciato nella casella della 214 e non c’è più.',
        reveals: [],
        fromAct: 2,
      },
      {
        topic: 'orari',
        keywords: ['ora', 'porta di ferro', 'passaggio', 'rumore'],
        text: 'Il centralino sta nel passaggio, la porta di ferro è a sei passi. Stanotte l’ho sentita una volta sola, verso le undici e venti. Poi soltanto il montacarichi.',
        reveals: [],
        fromAct: 2,
      },
    ],
    'wit.bacigalupo': [
      {
        topic: 'manutenzione',
        keywords: ['telo', 'vasca', 'attrezzatura', 'occhielli'],
        text: 'Telo fissato alle 21:40, scheda firmata. Sotto ci stava l’attrezzatura della squadra, al riparo. Adesso il lato corto è libero: chi lo ha alzato lo ha alzato dalla parte delle casse.',
        reveals: ['fact.telo-spostato', 'fact.piscina-svuotata'],
        fromAct: 1,
      },
      {
        topic: 'quadro',
        keywords: ['fari', 'quadro', 'corrente', 'levetta'],
        text: 'La linea dei fari della vasca è stata aperta alle 22:10, a mano. Levetta alzata, salvavita a posto. Non l’ho aperta io: alle 22:10 stavo fissando il telo.',
        reveals: ['fact.luci-piscina-spente-2210'],
        fromAct: 2,
      },
      {
        topic: 'ascensore',
        keywords: ['scaletta', 'vernice', 'strisce', 'vasca'],
        text: 'La scaletta della vasca l’ho riverniciata a settembre. Adesso ha quattro strisce fresche sui montanti, all’altezza delle mani. Su e giù: chi è sceso è anche risalito.',
        reveals: ['fact.scaletta-usata'],
        fromAct: 2,
      },
    ],
  },
  falseReconstruction: {
    summary:
      'Ricostruzione da sostenere: l’immersione notturna era una posa per i giornali e non doveva farsi. Chi aveva interesse a che si facesse comunque era la società armatrice, che aveva anticipato di un mese la decorrenza della polizza sulla squadra e che avrebbe incassato in caso di infortunio. La cintura di zavorra stava sotto il telo della vasca, e sotto il telo della vasca ci arrivava chiunque avesse una chiave del passaggio. La fotografa era sulla terrazza a lavorare, con dodici pose e un taccuino che segna ora e diaframma per ognuna: alle 23:12 stava fotografando la pensilina, non il molo.',
    timeline: [
      { who: 'role.fotografa', from: 1302, to: 1395, where: 'loc.terrazza', note: 'Sulla terrazza a lavorare, con il taccuino di posa aperto.', hidden: false },
      { who: 'role.fotografa', from: 1400, to: 1439, where: 'loc.camera-oscura', note: 'In camera oscura, dalle undici e venti in poi, senza uscire.', hidden: false },
      { who: 'role.armatrice', from: 1285, to: 1330, where: 'loc.corridoio', note: 'In camera, ma con la polizza corretta a penna sul letto.', hidden: false },
      { who: 'victim', from: 1376, to: 1390, where: 'loc.bar-molo', note: 'Si attrezza da solo, senza appoggio e senza controllo della cintura.', hidden: false },
    ],
    scapegoatRoleId: 'role.armatrice',
  },
  texts: {
    reveal:
      'La fotografia del 1962 non documentava niente: era un montaggio. Il volto era di Elio Vanzetti, le mani e il numero cucito sulla muta erano di suo fratello. Ninetta Corsaro l’aveva composta a Genova in una notte, e su quella stampa erano nati cinque anni di copertine, di contratti e di percentuali. Il 4 ottobre, a cena, Elio annuncia che il 5 va a Milano a raccontare tutto. Alle undici scende dal molo con una cintura che porta due piombi in più e la fibbia girata dalla parte scomoda. Alle 23:10 la torcia si spegne al largo. Alle 23:47 l’orologio, rimasto sui suoi vestiti asciutti, viene fermato con due dita.',
    explanation:
      'Il perno è la nona posa. Dodici pose sul rullino, undici sul foglio di provini: manca la nona, ed è l’unica del taccuino scritta a matita invece che a penna, alle 23:12. Il negativo corrispondente è rigato in diagonale a pellicola asciutta, cioè dopo lo sviluppo, cioè da chi lo aveva già visto. Era l’unica inquadratura rivolta verso il largo: mostrava una torcia dove a quell’ora nessuno doveva esserci. Le due catene arrivano allo stesso nome per strade diverse. La prima è di camera oscura: provino mancante, negativo rigato, stampa del ’62 tagliata dove il montaggio si vedeva, bacinella ancora tiepida alle 00:30. La seconda è di orario e di luogo: alle 23:12 si scattava ancora, alle 23:20 la terrazza è stata chiusa a chiave dall’interno, e le scarpe asciutte del secondo piano escludono chi in quei minuti era in albergo. L’esitazione è la stampa che non ha distrutto: l’ha soltanto tagliata a metà, tenendo la parte con il volto. La firma involontaria sono le quattro strisce fresche sui montanti della scaletta della vasca.',
    victoryInnocents:
      'Avete contato i provini prima di guardare le ore. Undici riquadri e dodici numeri: da lì in poi era questione di chiedersi cosa guardasse la nona. Ninetta Corsaro ha detto una cosa sola, e l’ha detta piano: che quella fotografia del ’62 era la migliore che avesse mai fatto, e che nessuno l’aveva mai guardata davvero.',
    victoryCulprit:
      'L’ora ha retto e la nona posa è rimasta un rettangolo bianco su un foglio di carta. All’alba Ninetta Corsaro è partita con due macchine, una borsa di negativi e il servizio già venduto. In redazione, a Milano, hanno pagato senza fare domande: la fotografia era buona.',
    defeat:
      'L’indizio ignorato è un numero mancante: sul foglio di provini i riquadri stampati erano undici e i numeri dodici. Era comprensibile lasciarlo perdere — un fotografo scarta, è il suo mestiere — ma quello scarto era l’unico scatto rivolto verso il largo, e l’unico che qualcuno avesse rigato a mano.',
  },
};
