import { z } from 'zod';

/**
 * Schemi del contenuto narrativo.
 * I contenuti sono dati puri: nessuna logica, nessuna dipendenza dal motore.
 * Il validatore (`validator.ts`) garantisce che ogni caso sia risolvibile.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitive
// ─────────────────────────────────────────────────────────────────────────────

const id = (prefix: string) =>
  z
    .string()
    .min(2)
    .max(64)
    .regex(new RegExp(`^${prefix}\\.[a-z0-9-]+$`), `id non valido: atteso prefisso "${prefix}."`);

export const LocationIdSchema = id('loc');
export const RoleIdSchema = id('role');
export const ClueIdSchema = id('clue');
export const FactIdSchema = id('fact');
export const ObjectIdSchema = id('obj');
export const WitnessIdSchema = id('wit');
export const InferenceIdSchema = id('inf');
export const SecretIdSchema = id('sec');
export const ObjectiveIdSchema = id('goal');
export const AbilityIdSchema = id('abi');
export const EventIdSchema = id('evt');
export const BeatIdSchema = id('beat');

/** Minuti dalla mezzanotte (0–1439). Le scene notturne usano 1200–1439 e 0–180. */
export const MinuteSchema = z.number().int().min(0).max(1439);

export const ActSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type Act = z.infer<typeof ActSchema>;

/** Nodo del grafo: "clue.x", "fact.x" oppure "inf.x". */
export const NodeIdSchema = z
  .string()
  .regex(/^(clue|fact|inf)\.[a-z0-9-]+$/, 'nodo non valido');

// ─────────────────────────────────────────────────────────────────────────────
// Mondo
// ─────────────────────────────────────────────────────────────────────────────

export const LocationSchema = z.object({
  id: LocationIdSchema,
  name: z.string().min(2).max(48),
  floor: z.number().int().min(-1).max(4),
  /** chiave della scena grafica (apps/web/src/scene/scenes) */
  scene: z.string().min(2).max(40),
  description: z.string().min(20).max(400),
  /** luoghi raggiungibili direttamente, con minuti di percorrenza */
  adjacent: z.array(z.object({ to: LocationIdSchema, minutes: z.number().int().min(0).max(20) })),
  /** accessibile solo al personale / con chiave */
  restricted: z.boolean().default(false),
  /** atto minimo in cui l'ambiente diventa esplorabile */
  fromAct: ActSchema.default(1),
});
export type LocationDef = z.infer<typeof LocationSchema>;

export const GameObjectSchema = z.object({
  id: ObjectIdSchema,
  name: z.string().min(2).max(48),
  description: z.string().min(10).max(300),
  icon: z.string().min(2).max(32),
});
export type GameObjectDef = z.infer<typeof GameObjectSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Personaggi
// ─────────────────────────────────────────────────────────────────────────────

export const VictimSchema = z.object({
  id: z.string().min(2).max(40),
  name: z.string().min(2).max(48),
  age: z.number().int().min(16).max(99),
  role: z.string().min(2).max(60),
  portrait: z.string().min(2).max(32),
  description: z.string().min(40).max(600),
  lastSeen: z.string().min(10).max(200),
});
export type VictimDef = z.infer<typeof VictimSchema>;

export const RoleSchema = z.object({
  id: RoleIdSchema,
  name: z.string().min(2).max(48),
  age: z.number().int().min(16).max(99),
  profession: z.string().min(2).max(60),
  origin: z.string().min(2).max(60),
  /** identificativo del ritratto generato (portrait-01 … portrait-12) */
  portrait: z.string().regex(/^portrait-\d{2}$/),
  archetype: z.string().min(2).max(40),
  relationToVictim: z.string().min(10).max(300),
  traits: z.array(z.string().min(3).max(28)).length(3),
  /** una riga con cui il personaggio si presenta in pubblico */
  presentation: z.string().min(20).max(220),
  abilityId: AbilityIdSchema,
});
export type RoleDef = z.infer<typeof RoleSchema>;

export const AbilitySchema = z.object({
  id: AbilityIdSchema,
  name: z.string().min(3).max(40),
  description: z.string().min(20).max(300),
  /** effetto meccanico applicato dal server */
  effect: z.enum([
    'reveal-location-clue', // rivela un indizio ambientale non ancora trovato
    'peek-hand-count', // mostra quanti indizi possiede un giocatore
    'force-answer', // obbliga un giocatore a rispondere pubblicamente
    'protect-note', // rende privata una nota già condivisa
    'extra-search', // un'esplorazione aggiuntiva nell'atto
    'timeline-check', // verifica la coerenza di due voci pinnate
    'misdirect', // solo colpevole: falsifica un'etichetta sulla bacheca
    'alibi-witness', // ottiene una testimonianza a proprio favore
    'second-opinion', // ottiene la lettura tecnica di un indizio posseduto
    'listen-in', // scopre quanti messaggi privati ha inviato un giocatore
  ]),
  charges: z.number().int().min(1).max(3).default(1),
  /** atti in cui la capacità è utilizzabile */
  acts: z.array(ActSchema).min(1),
});
export type AbilityDef = z.infer<typeof AbilitySchema>;

export const SecretSchema = z.object({
  id: SecretIdSchema,
  title: z.string().min(4).max(60),
  text: z.string().min(30).max(260),
  /** se scoperto, quanto rende sospetti (0-3) — non è colpevolezza */
  suspicion: z.number().int().min(0).max(3),
});
export type SecretDef = z.infer<typeof SecretSchema>;

export const ObjectiveSchema = z.object({
  id: ObjectiveIdSchema,
  title: z.string().min(4).max(60),
  text: z.string().min(20).max(260),
  kind: z.enum([
    'share-count', // condividi almeno N indizi
    'hide-secret', // arriva al verdetto senza che il tuo segreto sia pinnato
    'accuse-target', // fai accusare un bersaglio da almeno N giocatori
    'protect-target', // il bersaglio non riceve accuse
    'ask-questions', // poni almeno N domande pubbliche
    'find-object', // trova un indizio specifico
    'never-share', // non condividere mai un indizio specifico
    'be-believed', // la tua dichiarazione non viene mai contraddetta
  ]),
  /** parametro numerico o id di riferimento, secondo `kind` */
  param: z.string().min(1).max(64),
  points: z.number().int().min(5).max(30).default(20),
});
export type ObjectiveDef = z.infer<typeof ObjectiveSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Fatti, indizi, deduzione
// ─────────────────────────────────────────────────────────────────────────────

export const FactSchema = z.object({
  id: FactIdSchema,
  text: z.string().min(8).max(220),
  kind: z.enum(['persona', 'luogo', 'oggetto', 'tempo', 'relazione', 'dichiarazione']),
  /** vero per i fatti noti a tutti dall'inizio (nessun indizio necessario) */
  common: z.boolean().default(false),
});
export type FactDef = z.infer<typeof FactSchema>;

export const ClueSchema = z.object({
  id: ClueIdSchema,
  title: z.string().min(3).max(60),
  text: z.string().min(20).max(240),
  kind: z.enum(['fisico', 'testimonianza', 'documento', 'osservazione', 'sonoro']),
  icon: z.string().min(2).max(32),
  /** fatti che l'indizio mette a disposizione una volta ottenuto */
  reveals: z.array(FactIdSchema).min(1),
  /** indizi che devono già essere posseduti perché questo sia leggibile */
  requires: z.array(ClueIdSchema).default([]),
  /** oggetto d'appoggio, per l'illustrazione della carta */
  objectId: ObjectIdSchema.optional(),
});
export type ClueDef = z.infer<typeof ClueSchema>;

export const InferenceSchema = z.object({
  id: InferenceIdSchema,
  text: z.string().min(15).max(280),
  concludes: z.enum(['culprit', 'motive', 'method', 'sequence', 'support']),
  /**
   * Alternative logiche: ogni percorso è un AND di nodi prerequisito,
   * i percorsi fra loro sono in OR. Un'inferenza è derivabile se almeno un
   * percorso è interamente derivabile.
   */
  paths: z.array(z.array(NodeIdSchema).min(1)).min(1),
});
export type InferenceDef = z.infer<typeof InferenceSchema>;

export const ContradictionSchema = z.object({
  id: z.string().min(3).max(64),
  /** i due nodi che non possono essere veri insieme */
  a: NodeIdSchema,
  b: NodeIdSchema,
  text: z.string().min(15).max(240),
  /** chi viene messo in difficoltà se la contraddizione emerge */
  implicates: RoleIdSchema.optional(),
});
export type ContradictionDef = z.infer<typeof ContradictionSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────

export const TimelineEntrySchema = z
  .object({
    /** RoleId, WitnessId oppure "victim" */
    who: z.string().min(3).max(64),
    from: MinuteSchema,
    to: MinuteSchema,
    where: LocationIdSchema,
    note: z.string().min(3).max(200),
    /** non mostrato nella ricostruzione pubblica prima dell'epilogo */
    hidden: z.boolean().default(false),
  })
  .refine((e) => e.to >= e.from, { message: 'intervallo temporale invertito' });
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Testimoni ed eventi
// ─────────────────────────────────────────────────────────────────────────────

export const WitnessSchema = z.object({
  id: WitnessIdSchema,
  name: z.string().min(2).max(48),
  role: z.string().min(2).max(60),
  portrait: z.string().min(2).max(32),
  voice: z.string().min(20).max(300),
  locationId: LocationIdSchema,
  /** argomenti che il testimone può trattare; le risposte stanno nella variante */
  topics: z.array(z.string().min(2).max(32)).min(3),
});
export type WitnessDef = z.infer<typeof WitnessSchema>;

export const WitnessLineSchema = z.object({
  topic: z.string().min(2).max(32),
  /** parole chiave che attivano l'argomento in una domanda libera */
  keywords: z.array(z.string().min(2).max(30)).min(1),
  text: z.string().min(20).max(320),
  /** fatti che la risposta espone — devono già essere ammessi in quell'atto */
  reveals: z.array(FactIdSchema).default([]),
  /** atto minimo per ottenere la risposta */
  fromAct: ActSchema.default(1),
});
export type WitnessLine = z.infer<typeof WitnessLineSchema>;

export const SceneEventSchema = z.object({
  id: EventIdSchema,
  title: z.string().min(3).max(60),
  text: z.string().min(20).max(200),
  act: ActSchema,
  /** effetto meccanico, applicato dal server */
  effect: z.enum([
    'open-location',
    'close-location',
    'reveal-clue',
    'shorten-timer',
    'extend-timer',
    'force-public-question',
    'blackout',
    'none',
  ]),
  /** parametro dell'effetto (id di ambiente o indizio, secondi, …) */
  param: z.string().max(64).default(''),
  /** peso per la scelta pesata del Regista */
  weight: z.number().min(0).max(10).default(1),
});
export type SceneEventDef = z.infer<typeof SceneEventSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Accusa: opzioni condivise fra tutte le varianti (anti-metagioco)
// ─────────────────────────────────────────────────────────────────────────────

export const OptionSchema = z.object({
  key: z.string().min(2).max(40),
  label: z.string().min(4).max(120),
});
export type OptionDef = z.infer<typeof OptionSchema>;

export const BeatSchema = z.object({
  id: BeatIdSchema,
  label: z.string().min(4).max(80),
});
export type BeatDef = z.infer<typeof BeatSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Profilo di ruolo dentro una variante
// ─────────────────────────────────────────────────────────────────────────────

export const RoleProfileSchema = z.object({
  roleId: RoleIdSchema,
  /** ciò che il personaggio dichiara pubblicamente */
  declaredAlibi: z.string().min(20).max(300),
  /** dove si trovava davvero */
  trueTimeline: z.array(TimelineEntrySchema).min(2),
  secretId: SecretIdSchema,
  objectiveId: ObjectiveIdSchema,
  /** indizio che il giocatore possiede fin dall'inizio */
  exclusiveClueId: ClueIdSchema,
  /** 3 dichiarazioni iniziali fra cui scegliere in Atto I */
  declarations: z
    .array(
      z.object({
        key: z.enum(['verita', 'omissione', 'bugia']),
        text: z.string().min(20).max(180),
        /** nodo che la dichiarazione afferma; serve al rilevatore di contraddizioni */
        asserts: NodeIdSchema.optional(),
      }),
    )
    .length(3),
  shareable: z.array(z.string().min(10).max(200)).min(2),
  hidden: z.array(z.string().min(10).max(200)).min(1),
});
export type RoleProfileDef = z.infer<typeof RoleProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Variante
// ─────────────────────────────────────────────────────────────────────────────

export const ClueSetupSchema = z.object({
  clueId: ClueIdSchema,
  /** quanto conta per la soluzione */
  relevance: z.enum(['critico', 'utile', 'contorno', 'falsa-pista']),
  act: ActSchema,
  /** ambiente in cui l'indizio si può trovare esplorando (null = solo in mano) */
  locationId: LocationIdSchema.nullable(),
  /** hotspot dell'ambiente (chiave grafica) */
  hotspot: z.string().min(2).max(40).nullable(),
  /** enigma da risolvere per ottenerlo */
  puzzle: z
    .object({
      kind: z.enum(['codice', 'orario', 'confronto', 'ordine', 'scelta']),
      prompt: z.string().min(10).max(220),
      options: z.array(z.string().min(1).max(60)).default([]),
      answer: z.string().min(1).max(60),
      hint: z.string().min(5).max(160),
    })
    .nullable()
    .default(null),
});
export type ClueSetupDef = z.infer<typeof ClueSetupSchema>;

export const VariantSchema = z.object({
  id: z.string().regex(/^var\.[a-z0-9-]+$/),
  name: z.string().min(3).max(60),
  tagline: z.string().min(10).max(160),
  culpritRoleId: RoleIdSchema,
  motiveKey: z.string().min(2).max(40),
  methodKey: z.string().min(2).max(40),
  /** ordine cronologico vero dei beat del caso */
  sequence: z.array(BeatIdSchema).min(4),
  /** descrizione specifica di ogni beat in questa variante */
  beatDetails: z.record(BeatIdSchema, z.string().min(15).max(240)),
  facts: z.array(FactSchema).min(12),
  timeline: z.array(TimelineEntrySchema).min(12),
  clueSetup: z.array(ClueSetupSchema).min(30),
  inferences: z.array(InferenceSchema).min(10),
  contradictions: z.array(ContradictionSchema).min(3),
  roleProfiles: z.array(RoleProfileSchema).length(8),
  witnessLines: z.record(WitnessIdSchema, z.array(WitnessLineSchema).min(3)),
  /** ricostruzione falsa fornita al colpevole */
  falseReconstruction: z.object({
    summary: z.string().min(60).max(700),
    timeline: z.array(TimelineEntrySchema).min(3),
    /** su chi il colpevole è incoraggiato a spostare i sospetti */
    scapegoatRoleId: RoleIdSchema,
  }),
  texts: z.object({
    reveal: z.string().min(80).max(900),
    explanation: z.string().min(80).max(1200),
    victoryInnocents: z.string().min(40).max(700),
    victoryCulprit: z.string().min(40).max(700),
    defeat: z.string().min(40).max(700),
  }),
});
export type VariantDef = z.infer<typeof VariantSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Caso
// ─────────────────────────────────────────────────────────────────────────────

export const CaseTextsSchema = z.object({
  intro: z.string().min(80).max(900),
  discovery: z.string().min(60).max(700),
  actIntros: z.object({
    1: z.string().min(40).max(400),
    2: z.string().min(40).max(400),
    3: z.string().min(40).max(400),
  }),
  verdictIntro: z.string().min(40).max(400),
  butlerWelcome: z.array(z.string().min(20).max(240)).min(3),
});
export type CaseTexts = z.infer<typeof CaseTextsSchema>;

export const CaseSchema = z.object({
  id: z.string().regex(/^case\.[a-z0-9-]+$/),
  number: z.number().int().min(1).max(99),
  title: z.string().min(4).max(60),
  subtitle: z.string().min(6).max(120),
  tagline: z.string().min(10).max(180),
  date: z.string().min(6).max(60),
  synopsis: z.string().min(80).max(700),
  coverScene: z.string().min(2).max(40),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  victim: VictimSchema,
  roles: z.array(RoleSchema).length(8),
  locations: z.array(LocationSchema).min(6),
  objects: z.array(GameObjectSchema).min(6),
  witnesses: z.array(WitnessSchema).min(3),
  clues: z.array(ClueSchema).min(30),
  secrets: z.array(SecretSchema).min(6),
  objectives: z.array(ObjectiveSchema).min(8),
  abilities: z.array(AbilitySchema).length(8),
  events: z.array(SceneEventSchema).min(6),
  motiveOptions: z.array(OptionSchema).min(5),
  methodOptions: z.array(OptionSchema).min(5),
  beats: z.array(BeatSchema).min(4),
  variants: z.array(VariantSchema).length(3),
  texts: CaseTextsSchema,
});
export type CaseDef = z.infer<typeof CaseSchema>;

/** Catalogo pubblico: quanto il client può conoscere prima della partita. */
export const PublicCaseSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  subtitle: z.string(),
  tagline: z.string(),
  date: z.string(),
  synopsis: z.string(),
  coverScene: z.string(),
  difficulty: z.number(),
  victimName: z.string(),
  locationNames: z.array(z.string()),
  roleCount: z.number(),
  clueCount: z.number(),
  variantCount: z.number(),
});
export type PublicCase = z.infer<typeof PublicCaseSchema>;

export function toPublicCase(c: CaseDef): PublicCase {
  return {
    id: c.id,
    number: c.number,
    title: c.title,
    subtitle: c.subtitle,
    tagline: c.tagline,
    date: c.date,
    synopsis: c.synopsis,
    coverScene: c.coverScene,
    difficulty: c.difficulty,
    victimName: c.victim.name,
    locationNames: c.locations.map((l) => l.name),
    roleCount: c.roles.length,
    clueCount: c.clues.length,
    variantCount: c.variants.length,
  };
}
