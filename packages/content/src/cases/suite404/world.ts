import type {
  AbilityDef,
  Act,
  ClueSetupDef,
  GameObjectDef,
  LocationDef,
  RoleDef,
  TimelineEntry,
  VictimDef,
  WitnessDef,
} from '@meridien/engine';
import { witnessesAt } from '../../shared/witnesses.js';

/**
 * «La Suite 404» — il mondo del caso.
 * Vittima, ruoli giocabili, capacità, ambienti, oggetti, testimoni.
 * Nessuna verità di variante vive qui: solo il luogo e le persone.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Aiuti di scrittura, usati dalle varianti
// ─────────────────────────────────────────────────────────────────────────────

/** Voce di cronologia. */
export const t = (
  who: string,
  from: number,
  to: number,
  where: string,
  note: string,
  hidden = false,
): TimelineEntry => ({ who, from, to, where, note, hidden });

/** Collocazione di un indizio dentro una variante. */
export const s = (
  clueId: string,
  relevance: ClueSetupDef['relevance'],
  act: Act,
  locationId: string | null,
  hotspot: string | null,
  puzzle: ClueSetupDef['puzzle'] = null,
): ClueSetupDef => ({ clueId, relevance, act, locationId, hotspot, puzzle });

// ─────────────────────────────────────────────────────────────────────────────
// La vittima
// ─────────────────────────────────────────────────────────────────────────────

export const VICTIM: VictimDef = {
  id: 'victim.malaspina',
  name: 'Corrado Malaspina',
  age: 58,
  role: 'Proprietario del Grand Hotel Méridien',
  portrait: 'victim-01',
  description:
    'Ha comprato il Méridien nel 1953 con i soldi di una società di navigazione e da allora lo tiene come si tiene una barca: rifacendo il ponte e lasciando marcire la chiglia. Generoso in pubblico, contabile in privato. Non presta denaro: lo colloca. Di ogni ospite conosce una cosa che l’ospite preferirebbe dimenticare, e la conserva in cassaforte insieme alle cambiali.',
  lastSeen:
    'Alle 22:04 in fondo alla hall, con il bicchiere ancora pieno, mentre chiamava l’ascensore per salire al quarto piano.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Le capacità
// ─────────────────────────────────────────────────────────────────────────────

export const ABILITIES: AbilityDef[] = [
  {
    id: 'abi.ventaglio',
    name: 'Il ventaglio',
    description:
      'Dietro il ventaglio si conta in fretta. Scopri quanti indizi tiene in mano un altro invitato, senza sapere quali siano.',
    effect: 'peek-hand-count',
    charges: 2,
    acts: [2, 3],
  },
  {
    id: 'abi.controcanto',
    name: 'Il controcanto',
    description:
      'Chi canta sa dove spostare l’orecchio di chi ascolta. Cambia l’etichetta di una voce già appuntata sulla bacheca comune.',
    effect: 'misdirect',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.mirino',
    name: 'Il mirino',
    description:
      'Un obiettivo grandangolare e la pazienza di restare fermo. Porta alla luce un indizio d’ambiente che nessuno aveva ancora raccolto.',
    effect: 'reveal-location-clue',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.secondo-parere',
    name: 'Il secondo parere',
    description:
      'Trent’anni di visite insegnano a rileggere un dettaglio. Ottieni la lettura tecnica di un indizio che possiedi già.',
    effect: 'second-opinion',
    charges: 2,
    acts: [1, 2, 3],
  },
  {
    id: 'abi.occhialini',
    name: 'Gli occhialini',
    description:
      'Un paio di occhialini alzati a mezz’aria e una domanda posta piano. L’interrogato deve rispondere davanti a tutti.',
    effect: 'force-answer',
    charges: 1,
    acts: [2, 3],
  },
  {
    id: 'abi.passo-lungo',
    name: 'Il passo lungo',
    description:
      'Arrivare prima degli altri e tornare senza fiatone. Concede una esplorazione supplementare nell’atto in corso.',
    effect: 'extra-search',
    charges: 2,
    acts: [1, 2],
  },
  {
    id: 'abi.taccuino',
    name: 'Il taccuino',
    description:
      'Le fonti si contano, non si nominano. Scopri quanti messaggi privati ha mandato un altro invitato.',
    effect: 'listen-in',
    charges: 2,
    acts: [2, 3],
  },
  {
    id: 'abi.conto-aperto',
    name: 'Il conto aperto',
    description:
      'Al tavolo verde si tiene il conto di tutto, orari compresi. Verifica se due voci appuntate sulla cronologia stanno insieme.',
    effect: 'timeline-check',
    charges: 2,
    acts: [2, 3],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// I ruoli giocabili
// ─────────────────────────────────────────────────────────────────────────────

export const ROLES: RoleDef[] = [
  {
    id: 'role.ereditiera',
    name: 'Ottavia Malaspina',
    age: 33,
    profession: 'Amministratrice dei beni di famiglia',
    origin: 'Genova',
    portrait: 'portrait-01',
    archetype: 'L’ereditiera',
    relationToVictim:
      'Unica figlia di Corrado Malaspina. Da tre anni firma per lui i contratti che lui non ha voglia di firmare, e da tre anni chiede una procura che non arriva mai.',
    traits: ['Precisa', 'Impaziente', 'Poco incline al perdono'],
    presentation:
      'Ottavia Malaspina. Mio padre dice che l’albergo è suo. Sui registri, però, la firma in fondo alla pagina è quasi sempre la mia.',
    abilityId: 'abi.ventaglio',
  },
  {
    id: 'role.cantante',
    name: 'Delia Rovere',
    age: 29,
    profession: 'Cantante di varietà',
    origin: 'Trieste',
    portrait: 'portrait-04',
    archetype: 'La cantante',
    relationToVictim:
      'Ingaggiata per il Ballo d’Inverno. Malaspina la fece esordire al Méridien nel 1961 e da allora considera quel favore un credito che non scade.',
    traits: ['Cordiale in scena', 'Diffidente fuori', 'Puntualissima'],
    presentation:
      'Delia Rovere. Canto dalle dieci, con l’intervallo in mezzo. Il resto della serata, per me, è corridoio e specchio.',
    abilityId: 'abi.controcanto',
  },
  {
    id: 'role.fotografo',
    name: 'Ivo Zanardelli',
    age: 41,
    profession: 'Fotografo di rotocalco',
    origin: 'Brescia',
    portrait: 'portrait-05',
    archetype: 'Il fotografo',
    relationToVictim:
      'Fotografa il Ballo su incarico dell’albergo. Malaspina gli deve tre serate e una volta gli ha comprato un rullino intero perché sparisse.',
    traits: ['Osservatore', 'Sbrigativo', 'Sempre a corto'],
    presentation:
      'Zanardelli. Faccio le fotografie della serata. Se vi siete voltati, ci siete dentro; se no, pazienza.',
    abilityId: 'abi.mirino',
  },
  {
    id: 'role.medico',
    name: 'Amedeo Sartori',
    age: 56,
    profession: 'Medico condotto',
    origin: 'Savona',
    portrait: 'portrait-06',
    archetype: 'Il medico',
    relationToVictim:
      'Amico di Malaspina da trent’anni e suo medico. Ha firmato certificati che non avrebbe dovuto firmare, e Malaspina ne ha tenuto copia.',
    traits: ['Cauto', 'Cortese', 'Muto sui nomi'],
    presentation:
      'Sartori, medico condotto. Stasera sono qui come ospite. Come medico spero di non servire a nessuno.',
    abilityId: 'abi.secondo-parere',
  },
  {
    id: 'role.contessa',
    name: 'Ludovica Sanfront',
    age: 71,
    profession: 'Possidente',
    origin: 'Torino',
    portrait: 'portrait-07',
    archetype: 'La contessa',
    relationToVictim:
      'Sverna al Méridien dal 1949. Nel 1962 ha prestato a Malaspina il denaro per rifare la hall in marmo e ottone; di quel denaro non ha più visto una lira.',
    traits: ['Formale', 'Memoria lunga', 'Sarcasmo pacato'],
    presentation:
      'Sanfront. Vengo qui da diciannove inverni. Conosco questo albergo meglio di chi ne possiede le chiavi.',
    abilityId: 'abi.occhialini',
  },
  {
    id: 'role.campione',
    name: 'Nino Bertelè',
    age: 31,
    profession: 'Pilota da corsa',
    origin: 'Modena',
    portrait: 'portrait-08',
    archetype: 'Il campione sportivo',
    relationToVictim:
      'Ospite d’onore della serata. Malaspina gli ha anticipato il denaro per l’iscrizione alla stagione e conserva la ricevuta firmata.',
    traits: ['Espansivo', 'Sbrigativo', 'Orgoglioso'],
    presentation:
      'Bertelè. Di mestiere corro. Stasera no: stasera ballo, stringo mani e sorrido alle macchine fotografiche.',
    abilityId: 'abi.passo-lungo',
  },
  {
    id: 'role.giornalista',
    name: 'Adele Cavassa',
    age: 37,
    profession: 'Cronista',
    origin: 'Milano',
    portrait: 'portrait-09',
    archetype: 'La giornalista',
    relationToVictim:
      'Ufficialmente scrive un pezzo di costume sul Ballo. In realtà lavora da due mesi ai conti dell’albergo, e Malaspina lo sapeva benissimo.',
    traits: ['Metodica', 'Tenace', 'Poco socievole'],
    presentation:
      'Cavassa, cronaca. Faccio domande per mestiere: non prendetela sul personale, e non aspettatevi che smetta.',
    abilityId: 'abi.taccuino',
  },
  {
    id: 'role.croupier',
    name: 'Tancredi Lo Faro',
    age: 45,
    profession: 'Croupier, responsabile della saletta da gioco',
    origin: 'Palermo',
    portrait: 'portrait-10',
    archetype: 'Il croupier',
    relationToVictim:
      'Manda avanti la saletta da gioco del primo piano per conto di Malaspina, che tiene in cassaforte le sue cambiali e gliele ricorda a ogni fine mese.',
    traits: ['Mani ferme', 'Educato', 'Insonne'],
    presentation:
      'Lo Faro. Al tavolo verde tengo il banco per l’albergo. Fuori dal tavolo, io, non gioco mai.',
    abilityId: 'abi.conto-aperto',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Gli ambienti
// ─────────────────────────────────────────────────────────────────────────────

export const LOCATIONS: LocationDef[] = [
  {
    id: 'loc.hall',
    name: 'Hall',
    floor: 0,
    scene: 'hall',
    description:
      'Marmo e ottone, il bancone lungo undici metri, il quadro delle chiavi con ottantaquattro ganci e il casellario della posta. La cabina del centralino è dietro una tenda. Fuori dalle vetrate, il faro di Capo Mele ogni quattro secondi.',
    adjacent: [
      { to: 'loc.sala-ballo', minutes: 1 },
      { to: 'loc.terrazza', minutes: 2 },
      { to: 'loc.corridoio-quarto', minutes: 3 },
      { to: 'loc.passaggio', minutes: 2 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.sala-ballo',
    name: 'Sala da ballo',
    floor: 0,
    scene: 'sala-ballo',
    description:
      'Il lampadario di millequattrocento gocce, l’orchestra sulla pedana, l’orologio a muro sopra la porta dei musicisti. Ottanta invitati in maschera e un buffet che nessuno guarda dopo mezzanotte.',
    adjacent: [
      { to: 'loc.hall', minutes: 1 },
      { to: 'loc.terrazza', minutes: 2 },
      { to: 'loc.cucina', minutes: 3 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.suite-404',
    name: 'Suite 404',
    floor: 4,
    scene: 'suite',
    description:
      'Due stanze sul mare, la scrivania di noce, la cassaforte a muro dietro il quadro della regata. Dietro l’armadio, murata dalla mobilia ma non dai cardini, la porta di servizio che dà sul passaggio.',
    adjacent: [
      { to: 'loc.corridoio-quarto', minutes: 1 },
      { to: 'loc.passaggio', minutes: 2 },
    ],
    restricted: true,
    fromAct: 1,
  },
  {
    id: 'loc.corridoio-quarto',
    name: 'Corridoio del quarto piano',
    floor: 4,
    scene: 'corridoio',
    description:
      'Moquette verde, sei porte, il carrello della biancheria in fondo e la finestra sul cortile. L’ascensore con la cancellata originale si ferma qui con un colpo che si sente in tutto il piano.',
    adjacent: [
      { to: 'loc.hall', minutes: 3 },
      { to: 'loc.suite-404', minutes: 1 },
      { to: 'loc.passaggio', minutes: 4 },
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
      'Una scala stretta di cemento che collega cucina, lavanderia e tutti i piani senza passare dai corridoi. Ganci da carrello alla altezza delle spalle, lampadine nude, e un odore fisso di sapone e brodo.',
    adjacent: [
      { to: 'loc.hall', minutes: 2 },
      { to: 'loc.cucina', minutes: 1 },
      { to: 'loc.quadro', minutes: 2 },
      { to: 'loc.corridoio-quarto', minutes: 4 },
      { to: 'loc.suite-404', minutes: 2 },
    ],
    restricted: true,
    fromAct: 2,
  },
  {
    id: 'loc.cucina',
    name: 'Cucina',
    floor: -1,
    scene: 'cucina',
    description:
      'Diciotto fuochi, due passavivande e il capocuoco che urla gli orari come se fossero portate. Un sacco di farina sfondato la sera prima ha lasciato una striscia bianca fino alla porta del passaggio.',
    adjacent: [
      { to: 'loc.sala-ballo', minutes: 3 },
      { to: 'loc.passaggio', minutes: 1 },
      { to: 'loc.quadro', minutes: 2 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.terrazza',
    name: 'Terrazza',
    floor: 0,
    scene: 'terrazza',
    description:
      'La balaustra guarda la scogliera e stanotte prende schiaffi d’acqua ogni mezzo minuto. Le sedie di vimini sono state legate insieme. Chi esce qui rientra con il sale sulle scarpe.',
    adjacent: [
      { to: 'loc.hall', minutes: 2 },
      { to: 'loc.sala-ballo', minutes: 2 },
    ],
    restricted: false,
    fromAct: 1,
  },
  {
    id: 'loc.quadro',
    name: 'Quadro elettrico',
    floor: -1,
    scene: 'quadro',
    description:
      'Uno stanzino sotto la rampa, con il quadro generale e sei leve numerate per piano. Sul muro, il quaderno dei turni appeso a uno spago e una torcia con la pila mezza scarica.',
    adjacent: [
      { to: 'loc.cucina', minutes: 2 },
      { to: 'loc.passaggio', minutes: 2 },
    ],
    restricted: true,
    fromAct: 2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Gli oggetti
// ─────────────────────────────────────────────────────────────────────────────

export const OBJECTS: GameObjectDef[] = [
  {
    id: 'obj.chiave-fiocco',
    name: 'Chiave con il fiocco',
    description:
      'Chiave a doppia mandata con targhetta di ottone numerata 404 e un fiocco di seta verde, come tutte le chiavi dei piani alti.',
    icon: 'chiave',
  },
  {
    id: 'obj.registro-chiavi',
    name: 'Registro delle chiavi',
    description:
      'Quaderno rilegato in tela, una riga per consegna: numero di camera, ora, iniziali di chi ritira e di chi riconsegna.',
    icon: 'registro',
  },
  {
    id: 'obj.sveglia-viaggio',
    name: 'Sveglia da viaggio',
    description:
      'Sveglia in astuccio di cuoio, quadrante smaltato, carica a molla che dura trenta ore. Si chiude come un libretto.',
    icon: 'sveglia',
  },
  {
    id: 'obj.polaroid',
    name: 'Polaroid del brindisi',
    description:
      'Stampa istantanea con il bordo bianco largo, ancora un po’ appiccicosa sul retro. Sul fondo si legge l’orologio della sala.',
    icon: 'polaroid',
  },
  {
    id: 'obj.cambiale',
    name: 'Cambiale',
    description:
      'Effetto cambiario in bollo, importo in cifre e lettere, firma dell’obbligato in basso a destra e nessuna girata.',
    icon: 'cambiale',
  },
  {
    id: 'obj.lettera-ricatto',
    name: 'Lettera mai imbucata',
    description:
      'Foglio di carta intestata dell’albergo, piegato in tre, con la piega già stanca. Poche righe e una data in alto.',
    icon: 'lettera',
  },
  {
    id: 'obj.taccuino-turni',
    name: 'Quaderno dei turni',
    description:
      'Quaderno a quadretti appeso a uno spago, con gli interventi dell’elettricista annotati per ora e numero di quadro.',
    icon: 'quaderno',
  },
  {
    id: 'obj.passe-partout',
    name: 'Passe-partout dei piani',
    description:
      'Chiave unica di servizio con l’anello rosso, custodita nel quadro dietro il bancone e ritirata solo dietro firma.',
    icon: 'passepartout',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// I testimoni
// ─────────────────────────────────────────────────────────────────────────────

export const WITNESSES: WitnessDef[] = witnessesAt({
  'wit.bramante': 'loc.hall',
  'wit.ottonello': 'loc.hall',
  'wit.coldani': 'loc.corridoio-quarto',
  'wit.pesce': 'loc.cucina',
  'wit.bacigalupo': 'loc.quadro',
});
