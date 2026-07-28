import type { AiRequest } from '@meridien/engine';
import type { AIProvider, AiOutcome, ProviderConfig } from '../types.js';
import { DEFAULT_MAX_OUTPUT_TOKENS, DEFAULT_TIMEOUT_MS } from '../types.js';
import { buildPrompt, extractJson } from '../prompt.js';
import { parseOutcome } from '../parse.js';

/**
 * Provider per qualunque endpoint compatibile con l'API OpenAI Chat Completions:
 * vLLM, llama.cpp server, Ollama, LM Studio, TGI, o un servizio gestito.
 *
 * Pensato per far girare un modello open-source ospitato privatamente:
 * `MERIDIEN_AI_BASE_URL=http://localhost:8000/v1` e via.
 * Come per Anthropic, gira solo lato server.
 */
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'openai-compatible';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(config: ProviderConfig) {
    this.apiKey = config.apiKey ?? '';
    this.model = config.model ?? 'qwen2.5-7b-instruct';
    this.baseUrl = (config.baseUrl ?? 'http://127.0.0.1:8000/v1').replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxTokens = config.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS;
    this.temperature = config.temperature ?? 0.7;
  }

  isAvailable(): boolean {
    const isBrowser = typeof globalThis === 'object' && 'window' in globalThis && 'document' in globalThis;
    return !isBrowser && this.baseUrl.length > 0;
  }

  async respond(request: AiRequest, signal?: AbortSignal): Promise<AiOutcome> {
    if (!this.isAvailable()) throw new Error('provider OpenAI-compatibile non disponibile in questo contesto');
    const spec = buildPrompt(request);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    signal?.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          max_tokens: Math.min(spec.maxTokens, this.maxTokens),
          temperature: this.temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: spec.system },
            {
              role: 'user',
              content: `${spec.user}\n\nRispondi con un solo oggetto JSON di questa forma: ${spec.jsonShape}`,
            },
          ],
        }),
      });

      if (!res.ok) throw new Error(`endpoint compatibile ha risposto ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content ?? '';
      return parseOutcome(request.kind, extractJson(text), this.name);
    } finally {
      clearTimeout(timer);
    }
  }
}
