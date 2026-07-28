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
 * Caso 2 — «L'Orologio Sommerso».
 * 4 ottobre 1967, chiusura di stagione al Grand Hotel Méridien.
 * Il mondo: la vittima, gli otto ospiti giocabili, i sette ambienti,
 * gli oggetti illustrabili, il personale interrogabile, le capacità.
 */

export const victim: VictimDef = {
  id: 'victim.vanzetti',
  name: 'Elio Vanzetti',
  age: 41,
  role: 'Sommozzatore e recuperatore di relitti',
  portrait: 'portrait-10',
  description:
    'I rotocalchi lo chiamano «il pesce d’argento» da quando, nel 1962, riportò a galla la campana del piroscafo Aurelia. Da allora firma copertine, contratti e cambiali con la stessa penna. Beve poco, ride molto, paga in ritardo. Al Méridien arriva ogni ottobre per l’ultima immersione della stagione, quella che i fotografi aspettano tutto l’anno.',
  lastSeen:
    'Sulla terrazza, alle 22:50, con la cerata sulle spalle e il bicchiere ancora in mano. Non è rientrato dalla porta a vetri.',
};

export const roles: RoleDef[] = [
  {
    id: 'role.armatrice',
    name: 'Delfina Sartorio Amoretti',
    age: 38,
    profession: 'Armatrice, socia della Sartorio Recuperi Marittimi',
    origin: 'Genova',
    portrait: 'portrait-01',
    archetype: 'L’ereditiera',
    relationToVictim:
      'Ha finanziato tre campagne di recupero di Vanzetti e ne ha viste tornare due. Le firme sui contratti sono sue, i titoli sui giornali erano suoi soltanto in coda.',
    traits: ['Cortese fino al gelo', 'Conta prima di parlare', 'Non alza mai la voce'],
    presentation:
      'Sartorio Amoretti. La società è di mio padre, la firma è mia. Se avete domande sui costi, chiedetele adesso: domattina riparto.',
    abilityId: 'abi.polizza',
  },
  {
    id: 'role.impresario',
    name: 'Ademaro Ruffini',
    age: 54,
    profession: 'Impresario di esibizioni subacquee',
    origin: 'Milano',
    portrait: 'portrait-02',
    archetype: 'L’impresario',
    relationToVictim:
      'Gli ha costruito la tournée delle piscine coperte, quattordici città in due inverni. Ha anticipato di tasca propria l’ultima caparra e non l’ha più rivista.',
    traits: ['Parla per cifre', 'Stringe la mano due volte', 'Suda anche d’ottobre'],
    presentation:
      'Ruffini, impresario. Io porto la gente dove c’è qualcosa da vedere. Se qualcosa da vedere non c’è più, il conto resta lo stesso.',
    abilityId: 'abi.contratto',
  },
  {
    id: 'role.direttore',
    name: 'Ercole Ravano',
    age: 49,
    profession: 'Direttore del Grand Hotel Méridien',
    origin: 'Savona',
    portrait: 'portrait-03',
    archetype: 'Il direttore d’albergo',
    relationToVictim:
      'Lo ospita ogni ottobre da sei stagioni, sempre nella 214, sempre a tariffa ridotta. In cambio riceve una fotografia autografata per la bacheca della hall.',
    traits: ['Postura da frac', 'Sorride con la bocca', 'Sa dove sta ogni chiave'],
    presentation:
      'Ravano, direttore. La stagione chiude stanotte. Vi chiedo soltanto di non uscire dalla terrazza: con questo vento la pensilina non tiene.',
    abilityId: 'abi.chiave-maestra',
  },
  {
    id: 'role.cantante',
    name: 'Wanda Gilardoni',
    age: 29,
    profession: 'Cantante di varietà',
    origin: 'Torino',
    portrait: 'portrait-04',
    archetype: 'La cantante',
    relationToVictim:
      'Sono stati insieme due estati e mezza. La terza si è chiusa in un corridoio d’albergo, senza urla, davanti a una governante che contava le lenzuola.',
    traits: ['Ride prima di rispondere', 'Fuma solo in piedi', 'Ricorda i motivi, non i nomi'],
    presentation:
      'Gilardoni, canto. Stasera avrei dovuto fare tre pezzi e ne ho fatti due, perché è saltata la corrente. Il terzo lo tengo per un’altra volta.',
    abilityId: 'abi.voce-di-sala',
  },
  {
    id: 'role.fotografa',
    name: 'Ninetta Corsaro',
    age: 33,
    profession: 'Fotografa di rotocalco',
    origin: 'Genova',
    portrait: 'portrait-05',
    archetype: 'Il fotografo',
    relationToVictim:
      'Le fotografie che hanno fatto di Vanzetti un nome sono sue: il volto contro il vetro della maschera, la campana dell’Aurelia che esce dall’acqua. Da cinque anni lo segue e da cinque anni discute la percentuale.',
    traits: ['Parla per elenchi', 'Guarda le mani', 'Non presta mai il rullino'],
    presentation:
      'Corsaro, fotografa. Ho la camera oscura al piano di sotto, la uso io e nessun altro. Se qualcuno ha toccato le bacinelle, lo saprò dall’odore.',
    abilityId: 'abi.obiettivo-lungo',
  },
  {
    id: 'role.medico',
    name: 'Ludovico Ferrero',
    age: 57,
    profession: 'Medico della squadra di immersione',
    origin: 'Bologna',
    portrait: 'portrait-06',
    archetype: 'Il medico',
    relationToVictim:
      'Firma da quattro anni i certificati di idoneità della squadra. Quello di Vanzetti è stato rinnovato a settembre, in albergo, senza che il paziente si togliesse la giacca.',
    traits: ['Mani sempre in tasca', 'Risponde con domande', 'Ordina acqua minerale'],
    presentation:
      'Ferrero, medico. Seguo la squadra, non l’uomo. Se volete sapere che cuore aveva Vanzetti, ve lo dico: buono. Il resto non è di mia competenza.',
    abilityId: 'abi.visita-di-controllo',
  },
  {
    id: 'role.secondo',
    name: 'Ivo Barigazzi',
    age: 36,
    profession: 'Sommozzatore di appoggio',
    origin: 'Chioggia',
    portrait: 'portrait-07',
    archetype: 'Il campione sportivo',
    relationToVictim:
      'Fratello per parte di madre, cognome diverso, stessa taglia di muta. In dodici anni di campagne è sempre stato l’uomo della cima: quello che resta a mezz’acqua mentre l’altro scende.',
    traits: ['Spalle da rematore', 'Parla poco e piano', 'Annoda tutto due volte'],
    presentation:
      'Barigazzi. Sto sulla cima. Non ho mai rilasciato un’intervista in vita mia e non comincio stanotte, con rispetto.',
    abilityId: 'abi.registro-di-bordo',
  },
  {
    id: 'role.croupier',
    name: 'Nando Pittaluga',
    age: 44,
    profession: 'Croupier del casinò municipale',
    origin: 'Sanremo',
    portrait: 'portrait-08',
    archetype: 'Il croupier',
    relationToVictim:
      'Lo ha visto perdere per tre sere di fila al tavolo dello chemin, e per tre sere ha rimandato la richiesta di copertura. È l’unico che sappia esattamente quanto Vanzetti dovesse, e a chi.',
    traits: ['Mani sempre visibili', 'Voce piatta da tavolo', 'Non tocca il denaro altrui'],
    presentation:
      'Pittaluga, croupier. Al tavolo io non ho opinioni: ho un rastrello. Fuori dal tavolo cerco di averne il meno possibile.',
    abilityId: 'abi.libretto-nero',
  },
];

export const abilities: AbilityDef[] = [
  {
    id: 'abi.polizza',
    name: 'Clausola aggiuntiva',
    description:
      'Delfina conosce i fascicoli meglio di chi li ha scritti: ottiene un’esplorazione supplementare nell’atto in corso.',
    effect: 'extra-search',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.contratto',
    name: 'Clausola penale',
    description:
      'Ademaro rilegge il contratto ad alta voce e pretende una risposta: obbliga un giocatore a rispondere in pubblico a una domanda.',
    effect: 'force-answer',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.chiave-maestra',
    name: 'Passe-partout della direzione',
    description:
      'Ercole apre ciò che nessun altro apre: rivela un indizio ambientale non ancora trovato nell’ambiente in cui si trova.',
    effect: 'reveal-location-clue',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.voce-di-sala',
    name: 'Voce di sala',
    description:
      'Wanda conosce chi la guardava mentre cantava: ottiene una testimonianza del personale a proprio favore.',
    effect: 'alibi-witness',
    charges: 1,
    acts: [1, 2],
  },
  {
    id: 'abi.obiettivo-lungo',
    name: 'Obiettivo lungo',
    description:
      'Ninetta ritaglia, ingrandisce, ricompone: sostituisce l’etichetta di un elemento sulla bacheca con un’altra a sua scelta.',
    effect: 'misdirect',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.visita-di-controllo',
    name: 'Visita di controllo',
    description:
      'Ludovico confronta due orari come confronterebbe due referti: verifica la coerenza di due voci fissate sulla bacheca.',
    effect: 'timeline-check',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.registro-di-bordo',
    name: 'Lettura di bordo',
    description:
      'Ivo legge un attrezzo come si legge un giornale di bordo: ottiene la lettura tecnica di un indizio che possiede.',
    effect: 'second-opinion',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.libretto-nero',
    name: 'Libretto nero',
    description:
      'Nando conta le carte in mano agli altri per mestiere: scopre quanti indizi possiede un giocatore a sua scelta.',
    effect: 'peek-hand-count',
    charges: 2,
    acts: [1, 2, 3],
  },
];

export const locations: LocationDef[] = [
  {
    id: 'loc.terrazza',
    name: 'Terrazza',
    floor: 0,
    scene: 'terrazza',
    description:
      'Sessanta metri di cemento sul mare, una pensilina di vetro che il vento fa cantare, un parapetto di ferro ridipinto ad aprile. Di sera si vede il faro di Capo Mele e nient’altro.',
    adjacent: [
      { to: 'loc.piscina', minutes: 1 },
      { to: 'loc.hall', minutes: 2 },
      { to: 'loc.bar-molo', minutes: 6 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.piscina',
    name: 'Piscina vuota',
    floor: 0,
    scene: 'piscina',
    description:
      'La vasca è stata svuotata nel pomeriggio per l’inverno: tre metri di piastrelle azzurre e una griglia di scarico al centro. Il telo di copertura è arrotolato lungo il bordo di levante.',
    adjacent: [
      { to: 'loc.terrazza', minutes: 1 },
      { to: 'loc.passaggio', minutes: 2 },
      { to: 'loc.bar-molo', minutes: 5 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.hall',
    name: 'Hall',
    floor: 0,
    scene: 'hall',
    description:
      'Marmo e ottone, il bancone del portiere, la bacheca delle fotografie autografate, una cabina telefonica di noce con la porta a soffietto. Il proprietario la chiama «il transatlantico».',
    adjacent: [
      { to: 'loc.terrazza', minutes: 2 },
      { to: 'loc.passaggio', minutes: 1 },
      { to: 'loc.corridoio', minutes: 3 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.camera-oscura',
    name: 'Camera oscura',
    floor: -1,
    scene: 'camerino',
    description:
      'Era la stireria. Adesso c’è una lampada rossa, tre bacinelle, un filo teso con le mollette e un odore di fissaggio che resta nei capelli. La chiave la tiene la fotografa.',
    adjacent: [{ to: 'loc.passaggio', minutes: 2 }],
    restricted: true,
    fromAct: 2,
  },
  {
    id: 'loc.bar-molo',
    name: 'Bar del molo',
    floor: -1,
    scene: 'bar',
    description:
      'Una tettoia di canne sopra sei tavoli, in fondo alla scaletta che scende dalla terrazza. Chiude il 4 ottobre di ogni anno. Al gancio di ferro è ormeggiato il gozzo di servizio.',
    adjacent: [
      { to: 'loc.terrazza', minutes: 6 },
      { to: 'loc.piscina', minutes: 5 },
      { to: 'loc.passaggio', minutes: 7 },
    ],
    restricted: false,
    fromAct: 2,
  },
  {
    id: 'loc.corridoio',
    name: 'Corridoio del secondo piano',
    floor: 2,
    scene: 'corridoio',
    description:
      'Moquette verde, dodici porte, un tavolino con il telefono interno. La 214 è in fondo, l’ultima prima della finestra che dà sulla piscina.',
    adjacent: [
      { to: 'loc.hall', minutes: 3 },
      { to: 'loc.passaggio', minutes: 3 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.passaggio',
    name: 'Passaggio di servizio',
    floor: 0,
    scene: 'passaggio',
    description:
      'Collega cucina, lavanderia, centralino e tutti i piani senza passare dai corridoi. Pareti di calce, un ripostiglio degli attrezzi, una porta di ferro che esce sul molo per le consegne.',
    adjacent: [
      { to: 'loc.piscina', minutes: 2 },
      { to: 'loc.hall', minutes: 1 },
      { to: 'loc.corridoio', minutes: 3 },
      { to: 'loc.camera-oscura', minutes: 2 },
      { to: 'loc.bar-molo', minutes: 7 },
    ],
    restricted: true,
    fromAct: 2,
  },
];

export const objects: GameObjectDef[] = [
  {
    id: 'obj.orologio',
    name: 'Orologio subacqueo',
    description:
      'Cassa d’acciaio, ghiera girevole graduata, cinturino di tela consumato sul lato del fermaglio. Garantito duecento metri.',
    icon: 'orologio',
  },
  {
    id: 'obj.macchina-foto',
    name: 'Macchina fotografica con teleobiettivo',
    description:
      'Corpo nero, obiettivo lungo un avambraccio, cinghia rammendata con filo da pesca. Dodici pose per rullino.',
    icon: 'macchina-foto',
  },
  {
    id: 'obj.registro',
    name: 'Registro degli arrivi',
    description:
      'Quarto volume della stagione, rilegato in tela. Ogni riga: nome, provenienza, camera, firma. Le firme del 4 ottobre sono nove.',
    icon: 'registro',
  },
  {
    id: 'obj.lampada',
    name: 'Lampada da segnalazione',
    description:
      'Lampada a otturatore della marina mercantile, manico di legno, batteria a secco. Sta nel ripostiglio del passaggio di servizio.',
    icon: 'lampada',
  },
  {
    id: 'obj.cambiale',
    name: 'Pagherò cambiario',
    description:
      'Modulo bollato da quattro milioni, firma in inchiostro turchino, scadenza scritta a mano sopra la riga stampata.',
    icon: 'cambiale',
  },
  {
    id: 'obj.zavorra',
    name: 'Cintura di zavorra',
    description:
      'Sei piombi da due chili su una fascia di tela, fibbia a sgancio rapido. Ne mancano due dal portapiombi della squadra.',
    icon: 'zavorra',
  },
  {
    id: 'obj.carta-nautica',
    name: 'Carta nautica della punta',
    description:
      'Foglio 921, Punta Sestriera e secca del Grillo. Piegato in otto, bordi induriti dal salino, annotazioni a matita copiativa.',
    icon: 'carta',
  },
  {
    id: 'obj.provini',
    name: 'Foglio di provini a contatto',
    description:
      'Un rullino intero stampato in dodici riquadri numerati. Si legge alla lente, si conserva nella busta di carta nera.',
    icon: 'provini',
  },
];

export const witnesses: WitnessDef[] = witnessesAt({
  'wit.bramante': 'loc.hall',
  'wit.coldani': 'loc.corridoio',
  'wit.pesce': 'loc.bar-molo',
  'wit.ottonello': 'loc.passaggio',
  'wit.bacigalupo': 'loc.piscina',
});
