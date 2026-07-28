/**
 * Catalogo del provider deterministico.
 *
 * Le frasi non sono liste chiuse: sono frammenti che si compongono
 * (apertura × soggetto × chiusura). Solo per il maggiordomo in lobby le
 * combinazioni possibili sono 12 × 14 × 12 = 2 016, più che sufficienti
 * perché nella stessa partita non si ripeta mai la stessa battuta.
 *
 * Tutti i testi sono originali e rispettano `NARRATIVE_BIBLE.md`:
 * ADALBERTO è formale, leggermente ironico, mai complice.
 */

export const BUTLER = {
  openers: [
    'Buonasera.',
    'Mi perdoni.',
    'Se posso permettermi.',
    'Il Méridien la accoglie.',
    'Una parola sola, signori.',
    'Con discrezione:',
    'Come da tradizione:',
    'A nome della direzione:',
    'Senza voler disturbare:',
    'Le porte sono chiuse, dunque:',
    'Fuori piove, dentro no:',
    'Prima che la sera cominci davvero:',
  ],
  subjects: {
    lobby: [
      "L'albergo ha già ospitato serate come questa. Non tutte sono finite bene.",
      'Il ballo comincia quando i signori lo decidono, non quando lo decide l\'orologio.',
      '{ospite} ha appena consegnato il cappotto. Il cappotto era asciutto.',
      'Siamo in {n} in sala. La sala ne conterrebbe il triplo, ma la strada è franata.',
      'La cucina ha preparato per tutti. Nessuno ha disdetto.',
      "L'ascensore funziona. Il quarto piano, per ora, è tranquillo.",
      'Il caso della serata si intitola «{caso}». Il titolo lo abbiamo scelto noi.',
      'Il telefono ha smesso di squillare alle dieci e quaranta. Non è un buon segno.',
      'Nel registro ci sono più nomi che ospiti. Capita, in stagione.',
      "Il vento ha portato via l'insegna del bagno Miramare. Non la nostra.",
      'Chi ha chiesto la stanza con vista sul mare l\'ha ottenuta. Chi ha chiesto silenzio, meno.',
      'La direzione ricorda che il passaggio di servizio non è aperto agli ospiti. Lo ricorda ogni anno.',
      'Ho fatto accendere il camino della hall. Non serve a scaldare, serve a far parlare.',
      'Le maschere sono sul tavolo all\'ingresso. Nessuno è obbligato a indossarle. Quasi nessuno rinuncia.',
    ],
    attesa: [
      'I signori possono prendersi il loro tempo. La tempesta non ha fretta.',
      'Manca qualcuno all\'appello. Succede, con questo mare.',
      'Il pianista sta accordando. È il momento più onesto della serata.',
      'La cucina tiene in caldo. Non all\'infinito.',
      'Chi non è ancora pronto lo dica adesso, non a mezzanotte.',
      'Ho visto serate cominciare in ritardo e finire prima del previsto.',
      'Il tempo qui si misura in portate, non in minuti.',
      'Attendiamo. Attendere fa parte del servizio.',
      'Il faro di Capo Mele batte ogni quattro secondi. Lo dico per chi contasse.',
      'Se qualcuno stesse cercando una scusa per uscire: la strada è franata.',
      'La signorina del centralino chiede se deve tenere aperta la linea.',
      'Un ospite ha chiesto di essere svegliato alle sei. Ottimismo.',
    ],
    pronti: [
      'Siamo pronti. Le luci in sala calano fra poco.',
      'La direzione dichiara aperta la serata. E chiusa la questione degli orari.',
      'Tutti presenti. Il che, statisticamente, non durerà.',
      'Il ballo può cominciare. Le maschere restano a discrezione dei signori.',
      'Da questo momento ogni parola detta in sala è pubblica. Le altre, meno.',
      'Il servizio è al completo. Anche il servizio ascolta.',
      'Signori, in sala. Il resto dell\'albergo può aspettare.',
      'Comincia. Da qui in poi non rispondo più delle coincidenze.',
      'La musica parte adesso. Gli alibi, di solito, un momento dopo.',
      'Tutto è al suo posto. È sempre così, prima.',
    ],
  },
  closers: [
    'Prego.',
    'Se avessero bisogno, sono al bancone.',
    'Buona serata.',
    'Con ogni riguardo.',
    'Al vostro servizio.',
    'Non aggiungo altro.',
    'Come sempre.',
    'Ai vostri ordini.',
    'Nulla di che preoccuparsi.',
    'Per quel che vale.',
    'Il resto lo vedranno da soli.',
    'Buon divertimento, se è la parola giusta.',
  ],
} as const;

export const RECAP = {
  heads: [
    "Riepilogo dell'Atto {atto}, per quel che si è visto.",
    "A metà dell'Atto {atto} la situazione è questa.",
    "Facciamo il punto: Atto {atto}.",
    "Chi è arrivato adesso troverà l'Atto {atto} così.",
    "Sintesi dell'Atto {atto}, senza commenti.",
  ],
  noClues: [
    'La bacheca è ancora vuota: nessuno ha voluto scoprirsi.',
    'In bacheca non c\'è nulla. Il che, di per sé, è un dato.',
    'Nessuna prova condivisa. Tutti tengono le carte coperte.',
  ],
  noStatements: [
    'Nessuno ha ancora messo per iscritto dove si trovava.',
    'Di dichiarazioni pubbliche, per ora, nemmeno l\'ombra.',
    'Le versioni circolano a voce. A voce non si possono confrontare.',
  ],
  tails: [
    'Restano più orari che spiegazioni.',
    'Manca ancora il pezzo che tiene insieme il resto.',
    'Qualcuno sta dicendo la verità. Non necessariamente tutta.',
    'Da qui in avanti si tratta di scegliere a chi credere.',
    'Gli orari, come sempre, sono più affidabili delle persone.',
  ],
} as const;

export const HINTS = {
  frames: [
    'Se posso indirizzare la ricerca:',
    'Un suggerimento, senza rovinare la serata:',
    'La direzione osserva, e osserva questo:',
    'Non le dirò la risposta, le dirò dove guardare.',
    'Da vecchio portiere:',
  ],
  byCategory: {
    colpevole: [
      'Non cerchi chi mente: mentono tutti. Cerchi chi mente su un orario verificabile.',
      'Due persone dicono di essere state nello stesso posto. Solo una può averlo attraversato in tempo.',
      'Chi ha avuto bisogno di spiegare troppo, ha spiegato una cosa sola in più del necessario.',
    ],
    movente: [
      'Il denaro lascia carta. La carta finisce in un cassetto, e i cassetti si aprono.',
      'Guardi chi perdeva qualcosa quella sera, non chi guadagnava.',
      'Un movente credibile ha sempre una data. Cerchi la data.',
    ],
    metodo: [
      "Il come si legge sugli oggetti, non sulle persone. Un oggetto fuori posto vale tre testimonianze.",
      'Si domandi cosa serviva davvero per fare quello che è stato fatto. E chi poteva averlo.',
      'La cosa più semplice è quasi sempre quella giusta. La più semplice, non la più ovvia.',
    ],
    sequenza: [
      "Metta in fila quello che sa per certo. I buchi si riempiono da soli.",
      'Parta dalla fine e torni indietro: la scoperta ha un orario, e da lì si risale.',
      'Un evento è avvenuto prima di quanto sembri. Trovi quale e la fila si ricompone.',
    ],
  },
} as const;

export const EPILOGUE = {
  right: [
    'Il gruppo ha visto giusto. Non era scontato: la sera era costruita apposta perché non lo fosse.',
    'La ricostruzione regge. Ogni orario torna, ogni oggetto è dove doveva essere.',
    'Il nome è quello. E questa volta anche la ragione.',
  ],
  wrong: [
    'La sala si è convinta di una versione elegante. Elegante non vuol dire vera.',
    'Il gruppo ha seguito il filo più visibile. Era proprio quello che doveva succedere.',
    'La risposta era in bacheca da un pezzo. Nessuno l\'ha guardata due volte.',
  ],
  tails: [
    'Domani la strada sarà sgombra e gli ospiti partiranno tutti insieme, come sempre.',
    'Il Méridien chiuderà la stagione senza scandali. Sulla carta.',
    'Il registro verrà archiviato. I registri non si buttano mai.',
    'La direzione ringrazia i signori per la discrezione.',
  ],
} as const;

export const WITNESS_FILLER = [
  'Non saprei dirle, signore. Io ho il mio posto e da lì si vede quello che si vede.',
  'Su questo non posso aiutarla. Chieda in cucina, lì si sa sempre qualcosa.',
  'Le direi una cosa per un\'altra, e non mi pare il caso.',
  'Non me ne sono accorto. Con questo tempo non ci si accorge di niente.',
  'Non è una domanda per me. Provi con il portiere di notte.',
  'Mi ricordo gli orari, non i discorsi. Mi chieda un orario.',
  'Se lo avessi visto, glielo direi. Non l\'ho visto.',
  'Ho da fare, mi scusi. Torni più tardi con una domanda più precisa.',
] as const;
