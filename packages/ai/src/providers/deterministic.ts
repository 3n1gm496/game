import { createRng, type AiRequest } from '@meridien/engine';
import type { AIProvider, AiOutcome } from '../types.js';
import { BUTLER, RECAP, HINTS, EPILOGUE, WITNESS_FILLER } from '../catalog.js';

/**
 * Provider deterministico: rende il gioco completo senza alcuna API esterna.
 *
 * Per i testimoni sceglie la battuta prevalidata che meglio risponde alla
 * domanda (punteggio per parole chiave con normalizzazione italiana).
 * Per il maggiordomo e i riepiloghi compone frasi da un catalogo di frammenti:
 * le combinazioni disponibili sono oltre quattrocento, così la stessa frase
 * non ricorre nella stessa partita.
 */
export class DeterministicNarrativeProvider implements AIProvider {
  readonly name = 'deterministic';
  private recentLines = new Map<string, string[]>();

  isAvailable(): boolean {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async respond(request: AiRequest): Promise<AiOutcome> {
    switch (request.kind) {
      case 'witness':
        return this.witness(request);
      case 'butler':
        return this.butler(request);
      case 'recap':
        return this.recap(request);
      case 'hint':
        return this.hint(request);
      case 'epilogue':
        return this.epilogue(request);
      default:
        return { text: 'Il Méridien tace.', provider: this.name };
    }
  }

  private witness(req: Extract<AiRequest, { kind: 'witness' }>): AiOutcome {
    const question = normalize(req.question);
    const words = new Set(tokenize(question));

    let best: { score: number; line: (typeof req.allowedLines)[number] } | null = null;
    for (const line of req.allowedLines) {
      let score = 0;
      for (const keyword of line.keywords) {
        const k = normalize(keyword);
        if (question.includes(k)) score += 3;
        for (const w of words) {
          if (w.length > 3 && (w.startsWith(k.slice(0, 4)) || k.startsWith(w.slice(0, 4)))) score += 1;
        }
      }
      if (question.includes(normalize(line.topic))) score += 2;
      if (!best || score > best.score) best = { score, line };
    }

    if (!best || best.score === 0) {
      const filler = this.varied(`filler:${req.witnessId}`, WITNESS_FILLER, req.question + req.witnessId);
      return { text: filler, topic: 'nessuno', evasive: true, provider: this.name };
    }
    return { text: best.line.text, topic: best.line.topic, evasive: false, provider: this.name };
  }

  private butler(req: Extract<AiRequest, { kind: 'butler' }>): AiOutcome {
    const seed = `${req.occasion}:${req.playerNames.join(',')}:${req.caseTitle}`;
    const rng = createRng(seed);
    const opener = pick(BUTLER.openers, rng);
    const subject = pick(BUTLER.subjects[req.occasion], rng);
    const closer = pick(BUTLER.closers, rng);
    const guest = req.playerNames.length > 0 ? pick(req.playerNames, rng) : 'il signore appena arrivato';
    const line = `${opener} ${subject} ${closer}`
      .replace(/\{ospite\}/g, guest)
      .replace(/\{caso\}/g, req.caseTitle)
      .replace(/\{n\}/g, String(req.playerNames.length));
    return { text: this.dedupe('butler', line, seed), provider: this.name };
  }

  private recap(req: Extract<AiRequest, { kind: 'recap' }>): AiOutcome {
    const rng = createRng(`recap:${req.act}:${req.sharedClues.length}:${req.statements.length}`);
    const head = pick(RECAP.heads, rng).replace(/\{atto\}/g, roman(req.act));
    const clueLine =
      req.sharedClues.length === 0
        ? pick(RECAP.noClues, rng)
        : `In bacheca: ${req.sharedClues
            .slice(-4)
            .map((c) => c.title.toLowerCase())
            .join(', ')}.`;
    const stmtLine =
      req.statements.length === 0
        ? pick(RECAP.noStatements, rng)
        : `${req.statements.length} dichiarazioni pubbliche, di cui almeno una non regge il confronto con gli orari.`;
    const tail = pick(RECAP.tails, rng);
    return { text: `${head} ${clueLine} ${stmtLine} ${tail}`, provider: this.name };
  }

  private hint(req: Extract<AiRequest, { kind: 'hint' }>): AiOutcome {
    const rng = createRng(`hint:${req.missingCategory}:${req.act}:${req.knownClueTitles.length}`);
    const frame = pick(HINTS.frames, rng);
    const body = pick(HINTS.byCategory[req.missingCategory], rng);
    const known = req.knownClueTitles.slice(-2);
    const bridge =
      known.length > 0
        ? `Rilegga «${known[known.length - 1]}» tenendo a mente l'ora.`
        : 'Cominci da ciò che ha già in mano.';
    return { text: `${frame} ${body} ${bridge}`, provider: this.name };
  }

  private epilogue(req: Extract<AiRequest, { kind: 'epilogue' }>): AiOutcome {
    const rng = createRng(`epilogue:${req.caseTitle}:${req.groupWasRight}`);
    const head = req.groupWasRight ? pick(EPILOGUE.right, rng) : pick(EPILOGUE.wrong, rng);
    const moment = req.standoutMoments.length > 0 ? pick(req.standoutMoments, rng) : '';
    const tail = pick(EPILOGUE.tails, rng);
    const middle = moment ? `Resterà negli archivi dell'albergo una riga sola: «${trim(moment, 110)}». ` : '';
    return { text: `${head} ${middle}${tail}`, provider: this.name };
  }

  /** Evita la ripetizione della stessa frase all'interno della stessa stanza. */
  private dedupe(bucket: string, line: string, seed: string): string {
    const recent = this.recentLines.get(bucket) ?? [];
    if (!recent.includes(line)) {
      recent.push(line);
      if (recent.length > 12) recent.shift();
      this.recentLines.set(bucket, recent);
      return line;
    }
    const rng = createRng(`${seed}:alt:${recent.length}`);
    const alt = `${pick(BUTLER.openers, rng)} ${line.split(' ').slice(1).join(' ')}`;
    recent.push(alt);
    if (recent.length > 12) recent.shift();
    this.recentLines.set(bucket, recent);
    return alt;
  }

  private varied(bucket: string, pool: readonly string[], seed: string): string {
    const rng = createRng(`${bucket}:${seed}`);
    return this.dedupe(bucket, pick(pool, rng), seed);
  }
}

function pick<T>(items: readonly T[], rng: { next(): number }): T {
  if (items.length === 0) throw new RangeError('catalogo vuoto');
  return items[Math.floor(rng.next() * items.length)] as T;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'il','lo','la','i','gli','le','un','uno','una','di','a','da','in','con','su','per','tra','fra','che','chi','cosa',
  'come','dove','quando','perche','e','o','ma','se','non','ha','hai','ho','era','sono','stato','stata','del','della',
  'dei','delle','al','allo','alla','ai','agli','alle','dal','dalla','nel','nella','sul','sulla','lei','lui','mi','ti',
]);

function tokenize(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function roman(n: number): string {
  return n === 1 ? 'I' : n === 2 ? 'II' : 'III';
}

function trim(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}
