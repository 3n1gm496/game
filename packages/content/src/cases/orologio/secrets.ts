import type { BeatDef, ObjectiveDef, OptionDef, SceneEventDef, SecretDef } from '@meridien/engine';

/**
 * Segreti, obiettivi, beat, opzioni d'accusa ed eventi scenici.
 * Beat e opzioni sono identici in tutte e tre le varianti: è la difesa
 * contro il metagioco. Cambia soltanto quale opzione sia quella vera.
 */

export const secrets: SecretDef[] = [
  {
    id: 'sec.nome-prestato',
    title: 'Il nome prestato',
    text: 'Per dodici anni i contratti della squadra sono stati intestati a un uomo che a quella profondità non era mai sceso. Chi lo sa non lo ha mai scritto da nessuna parte.',
    suspicion: 3,
  },
  {
    id: 'sec.negativo-venduto',
    title: 'Il negativo venduto',
    text: 'Una fotografia della campagna del 1962 è finita in un settimanale illustrato senza il consenso di chi vi compare. Il compenso è stato incassato in contanti, a Genova, in due rate.',
    suspicion: 2,
  },
  {
    id: 'sec.cassa-del-tavolo',
    title: 'La cassa del tavolo',
    text: 'Le perdite di un cliente sono state coperte per tre sere con denaro che non usciva dalla cassa del casinò. Se la direzione lo scoprisse, sarebbe la fine di una carriera di vent’anni.',
    suspicion: 3,
  },
  {
    id: 'sec.camere-fuori-registro',
    title: 'Le camere fuori registro',
    text: 'Tre camere del secondo piano sono state affittate per l’intera stagione senza comparire sul registro. Gli incassi non hanno mai visto una ricevuta.',
    suspicion: 2,
  },
  {
    id: 'sec.polizza-anticipata',
    title: 'La decorrenza anticipata',
    text: 'La copertura assicurativa della squadra è stata fatta partire con un mese di anticipo, a penna, sopra la data stampata. La sigla di conferma è di una sola mano.',
    suspicion: 3,
  },
  {
    id: 'sec.tournee-vuota',
    title: 'La tournée già venduta',
    text: 'Quattordici serate di esibizioni sono state vendute agli organizzatori con caparra incassata. Nessuna di quelle serate ha più un uomo che possa farla.',
    suspicion: 2,
  },
  {
    id: 'sec.certificato-di-comodo',
    title: 'Il certificato di comodo',
    text: 'I certificati d’idoneità della squadra sono stati rinnovati per due stagioni senza visita, in albergo, con la firma apposta sul tavolino della hall.',
    suspicion: 2,
  },
  {
    id: 'sec.matrimonio-taciuto',
    title: 'Il matrimonio taciuto',
    text: 'Un matrimonio contratto nel 1961 non è mai stato sciolto e non è mai stato raccontato a nessuno, nemmeno a chi aveva più diritto di saperlo.',
    suspicion: 1,
  },
];

export const objectives: ObjectiveDef[] = [
  {
    id: 'goal.tre-indizi',
    title: 'Mettere in comune',
    text: 'Condividi con la bacheca almeno tre indizi prima del verdetto: vuoi passare per chi collabora.',
    kind: 'share-count',
    param: '3',
    points: 20,
  },
  {
    id: 'goal.segreto-al-sicuro',
    title: 'Che resti dov’è',
    text: 'Arriva al verdetto senza che il tuo segreto personale finisca fissato sulla bacheca.',
    kind: 'hide-secret',
    param: 'proprio',
    points: 25,
  },
  {
    id: 'goal.sospetto-sul-croupier',
    title: 'Il conto lo paghi il tavolo',
    text: 'Fai in modo che almeno due giocatori indichino il croupier nella votazione finale.',
    kind: 'accuse-target',
    param: 'role.croupier',
    points: 25,
  },
  {
    id: 'goal.proteggi-la-cantante',
    title: 'Lasciatela fuori',
    text: 'La cantante non deve ricevere nessuna accusa nella votazione finale.',
    kind: 'protect-target',
    param: 'role.cantante',
    points: 20,
  },
  {
    id: 'goal.cinque-domande',
    title: 'Domandare è mestiere',
    text: 'Poni almeno cinque domande pubbliche nel corso della partita.',
    kind: 'ask-questions',
    param: '5',
    points: 15,
  },
  {
    id: 'goal.trova-orologio',
    title: 'Vedere il fondello',
    text: 'Arriva a possedere l’indizio dell’orologio ritrovato sul fondo della vasca.',
    kind: 'find-object',
    param: 'clue.orologio-fondo',
    points: 20,
  },
  {
    id: 'goal.non-si-parli-del-1962',
    title: 'Del 1962 non si parla',
    text: 'Non condividere mai con gli altri il brevetto d’immersione del 1962.',
    kind: 'never-share',
    param: 'clue.certificato-immersione',
    points: 25,
  },
  {
    id: 'goal.essere-creduti',
    title: 'Sulla parola',
    text: 'Nessuna tua dichiarazione pubblica deve risultare contraddetta al momento del verdetto.',
    kind: 'be-believed',
    param: '1',
    points: 25,
  },
];

export const beats: BeatDef[] = [
  { id: 'beat.cena', label: 'L’ultima cena della stagione' },
  { id: 'beat.patto', label: 'L’accordo preso a mezza voce' },
  { id: 'beat.uscita', label: 'L’uscita nel temporale' },
  { id: 'beat.gesto', label: 'Il gesto' },
  { id: 'beat.ora', label: 'L’ora fabbricata' },
];

export const motiveOptions: OptionDef[] = [
  { key: 'identita-rubata', label: 'Riprendersi un nome e un’impresa attribuiti a un altro' },
  { key: 'debito-inesigibile', label: 'Cancellare un debito che nessuno avrebbe più potuto riscuotere' },
  { key: 'fotografia-compromettente', label: 'Impedire che una fotografia arrivasse in redazione' },
  { key: 'polizza-assicurativa', label: 'Incassare una copertura intestata alla società' },
  { key: 'ricatto-continuato', label: 'Chiudere un ricatto che durava da due stagioni' },
  { key: 'questione-privata', label: 'Una vecchia questione privata mai chiusa' },
];

export const methodOptions: OptionDef[] = [
  { key: 'spinta-dal-parapetto', label: 'Una spinta dal parapetto di ponente, durante il temporale' },
  { key: 'appuntamento-al-largo', label: 'Un appuntamento in mare, con il gozzo e i segnali luminosi' },
  { key: 'zavorra-manomessa', label: 'La cintura di zavorra alterata prima dell’ultima immersione' },
  { key: 'scaletta-rimossa', label: 'La scaletta tolta a chi era sceso nella vasca vuota' },
  { key: 'chiave-della-terrazza', label: 'La porta a vetri chiusa su chi era rimasto fuori' },
  { key: 'partenza-organizzata', label: 'Una partenza concordata e fatta passare per scomparsa' },
];

export const events: SceneEventDef[] = [
  {
    id: 'evt.pompa',
    title: 'La pompa riparte',
    text: 'Dal locale motori arriva un colpo secco: la pompa di svuotamento riprende e sputa gli ultimi centimetri d’acqua nella canaletta. Poi tace.',
    act: 1,
    effect: 'none',
    param: '',
    weight: 2,
  },
  {
    id: 'evt.linea-caduta',
    title: 'La linea cade',
    text: 'Il centralino smette di ronzare. Marisa Ottonello alza la cuffia e la posa sul tavolo: la linea per Alassio è muta. Chi doveva telefonare, stanotte non telefona.',
    act: 1,
    effect: 'force-public-question',
    param: '',
    weight: 3,
  },
  {
    id: 'evt.mareggiata',
    title: 'La scaletta del molo',
    text: 'Il vento gira a ponente e il mare scende di mezzo metro sotto la tettoia. La scaletta del molo torna praticabile: al bar si può arrivare a piedi asciutti, quasi.',
    act: 2,
    effect: 'open-location',
    param: 'loc.bar-molo',
    weight: 3,
  },
  {
    id: 'evt.buio-piscina',
    title: 'Buio sulla vasca',
    text: 'Il quadro scatta e i fari della vasca si spengono tutti insieme. Per un minuto la piscina vuota è un rettangolo nero con dentro il rumore della pioggia.',
    act: 2,
    effect: 'blackout',
    param: '60',
    weight: 2,
  },
  {
    id: 'evt.camera-oscura',
    title: 'La porta rossa',
    text: 'La lampada sopra la porta della vecchia stireria passa dal rosso allo spento: chi era dentro ha finito. La chiave resta nella toppa.',
    act: 2,
    effect: 'open-location',
    param: 'loc.camera-oscura',
    weight: 3,
  },
  {
    id: 'evt.carabinieri',
    title: 'La macchina dalla strada',
    text: 'Fari gialli sul tornante: la pattuglia di Alassio è passata dalla frana e sale. Ravano si aggiusta il nodo della cravatta e va incontro alla porta girevole.',
    act: 3,
    effect: 'shorten-timer',
    param: '180',
    weight: 4,
  },
  {
    id: 'evt.orologio-riparte',
    title: 'La corona rientra',
    text: 'Qualcuno, per abitudine, spinge dentro la corona dell’orologio appoggiato sul bancone. La lancetta dei secondi riparte come se non fosse successo niente.',
    act: 3,
    effect: 'reveal-clue',
    param: 'clue.ghiera-orologio',
    weight: 3,
  },
];
