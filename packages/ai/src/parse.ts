import {
  ButlerLineSchema,
  EpilogueSchema,
  HintSchema,
  RecapSchema,
  WitnessAnswerSchema,
  violatesGuardrails,
} from '@meridien/engine';
import type { AiOutcome, AiRequestKind } from './types.js';

/**
 * Converte la risposta grezza di un modello in un `AiOutcome` valido.
 * Ogni forma ha uno schema rigoroso: se non combacia, si solleva e il
 * chiamante ricade sul provider deterministico.
 */
export function parseOutcome(kind: AiRequestKind, json: unknown, provider: string): AiOutcome {
  switch (kind) {
    case 'witness': {
      const parsed = WitnessAnswerSchema.parse(json);
      guard(parsed.answer);
      return { text: parsed.answer, topic: parsed.topic, evasive: parsed.evasive, provider };
    }
    case 'butler': {
      const parsed = ButlerLineSchema.parse(json);
      guard(parsed.line);
      return { text: parsed.line, provider };
    }
    case 'recap': {
      const parsed = RecapSchema.parse(json);
      guard(parsed.summary);
      const questions = parsed.openQuestions.slice(0, 3);
      for (const q of questions) guard(q);
      const text = questions.length > 0 ? `${parsed.summary}\n\n${questions.map((q) => `— ${q}`).join('\n')}` : parsed.summary;
      return { text, provider };
    }
    case 'hint': {
      const parsed = HintSchema.parse(json);
      guard(parsed.hint);
      return { text: parsed.hint, provider };
    }
    case 'epilogue': {
      const parsed = EpilogueSchema.parse(json);
      guard(parsed.text);
      for (const t of parsed.titles) guard(t.label);
      const titles = parsed.titles.map((t) => `«${t.label}» — ${t.about}`).join(' · ');
      return { text: titles ? `${parsed.text}\n\n${titles}` : parsed.text, provider };
    }
    default:
      throw new Error(`tipo di richiesta non gestito: ${String(kind)}`);
  }
}

function guard(text: string): void {
  const violation = violatesGuardrails(text);
  if (violation) {
    throw new Error(`risposta rifiutata dal guardrail (${violation})`);
  }
}
