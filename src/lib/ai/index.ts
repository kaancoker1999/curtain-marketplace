// Provider-agnostic AI abstraction layer.
// Both OpenAI and Anthropic are supported behind one interface; the active
// provider is chosen via AI_PROVIDER ("anthropic" | "openai" | "none").
// Every feature that uses AI must degrade gracefully when no provider is
// configured — callers receive null and fall back to deterministic output.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export interface CompletionRequest {
  system?: string
  prompt: string
  maxTokens?: number
}

export interface AiProvider {
  readonly name: string
  complete(req: CompletionRequest): Promise<string>
}

class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic'
  private client = new Anthropic()
  private model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8'

  async complete(req: CompletionRequest): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 1024,
      system: req.system,
      messages: [{ role: 'user', content: req.prompt }],
    })
    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
  }
}

class OpenAiProvider implements AiProvider {
  readonly name = 'openai'
  private client = new OpenAI()
  private model = process.env.OPENAI_MODEL ?? 'gpt-4o'

  async complete(req: CompletionRequest): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: req.maxTokens ?? 1024,
      messages: [
        ...(req.system ? [{ role: 'system' as const, content: req.system }] : []),
        { role: 'user' as const, content: req.prompt },
      ],
    })
    return response.choices[0]?.message?.content ?? ''
  }
}

let cachedProvider: AiProvider | null | undefined

export function getAiProvider(): AiProvider | null {
  if (cachedProvider !== undefined) return cachedProvider
  const which = (process.env.AI_PROVIDER ?? 'none').toLowerCase()
  if (which === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    cachedProvider = new AnthropicProvider()
  } else if (which === 'openai' && process.env.OPENAI_API_KEY) {
    cachedProvider = new OpenAiProvider()
  } else {
    cachedProvider = null
  }
  return cachedProvider
}
