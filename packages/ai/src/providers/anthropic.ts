import type { AiRequest } from '@meridien/engine';
import type { AIProvider, AiOutcome, ProviderConfig } from '../types.js';
import { DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_TIMEOUT_MS } from '../types.js';
import { buildPrompt, extractJson } from '../prompt.js';
import { parseOutcome } from '../parse.js';

/**
 * Provider Claude. **Funziona esclusivamente lato server.**
 *
 * La chiave vive solo in `process.env.ANTHROPIC_API_KEY`: non viene mai
 * serializzata verso il client, non compare in nessun messaggio del protocollo
 * e non finisce nei log. Il costruttore rifiuta di attivarsi in un contesto
 * che espone `window`, così un errore di bundling non può trascinare la chiave
 * dentro l'applicazione web.
 */
export class AnthropicClaudeProvider implements AIProvider {
  readonly name = 'anthropic';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey ?? '';
    this.model = config.model ?? 'claude-sonnet-5';
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com';
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxTokens = config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
  }

  isAvailable(): boolean {
    const isBrowser = typeof globalThis === 'object' && 'window' in globalThis && 'document' in globalThis;
    return !isBrowser && this.apiKey.length > 0;
  }

  async respond(request: AiRequest, signal?: AbortSignal): Promise<AiOutcome> {
    if (!this.isAvailable()) throw new Error('provider Anthropic non disponibile in questo contesto');
    const spec = buildPrompt(request);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    signal?.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      const res = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          max_tokens: Math.min(spec.maxTokens, this.maxTokens),
          temperature: 0.7,
          system: spec.system,
          messages: [
            {
              role: 'user',
              content: `${spec.user}\n\nRispondi con un solo oggetto JSON di questa forma: ${spec.jsonShape}`,
            },
            { role: 'assistant', content: '{' },
          ],
        }),
      });

      if (!res.ok) {
        throw new Error(`Anthropic ha risposto ${res.status}`);
      }
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (data.content ?? [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text ?? '')
        .join('');
      const json = extractJson(`{${text}`);
      return parseOutcome(request.kind, json, this.name);
    } finally {
      clearTimeout(timer);
    }
  }
}
