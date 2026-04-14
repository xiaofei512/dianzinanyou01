import { ChatProvider, ChatMessage, ChatOptions } from './types';
import { logger } from '@/lib/logger';
import { createErrorFromResponse } from '@/lib/errors/api-errors';

const PROVIDER_NAME = 'openrouter';
const API_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-3-flash-preview';

export class OpenRouterChatProvider implements ChatProvider {
  async streamChat(messages: ChatMessage[], options?: ChatOptions): Promise<ReadableStream<Uint8Array>> {
    const startTime = logger.requestStart(PROVIDER_NAME, 'streamChat', {
      messageCount: messages.length,
      model: options?.model || DEFAULT_MODEL,
    });

    try {
      if (!API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }

      const requestMessages = this.formatMessages(messages, options?.systemPrompt);

      const response = await fetch(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'https://github.com/xiaofei512/dianzinanyou01',
          'X-Title': 'YuNi - AI Companion',
        },
        body: JSON.stringify({
          model: options?.model || DEFAULT_MODEL,
          messages: requestMessages,
          temperature: options?.temperature ?? 0.8,
          stream: true,
          reasoning: {
            enabled: true,
          },
        }),
      });

      if (!response.ok) {
        const error = createErrorFromResponse(response, PROVIDER_NAME);
        logger.requestError(startTime, PROVIDER_NAME, 'streamChat', error);
        throw error;
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      logger.requestEnd(startTime, PROVIDER_NAME, 'streamChat', response.status);

      return this.transformStream(response.body);
    } catch (error) {
      if (error instanceof Error) {
        logger.requestError(startTime, PROVIDER_NAME, 'streamChat', error);
      }
      throw error;
    }
  }

  private formatMessages(messages: ChatMessage[], systemPrompt?: string): Array<{ role: string; content: string }> {
    const formatted: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      formatted.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of messages) {
      let role = msg.role;
      if (role === 'assistant') {
        role = 'assistant';
      } else if (role === 'user') {
        role = 'user';
      } else if (role === 'system' && !systemPrompt) {
        formatted.push({ role: 'system', content: msg.content });
        continue;
      }

      formatted.push({ role, content: msg.content });
    }

    return formatted;
  }

  private transformStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        const reader = source.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === 'data: [DONE]') {
                continue;
              }

              if (trimmedLine.startsWith('data: ')) {
                try {
                  const jsonStr = trimmedLine.slice(6);
                  const data = JSON.parse(jsonStr);

                  const delta = data.choices?.[0]?.delta?.content;
                  if (delta) {
                    const sseData = JSON.stringify({
                      type: 'delta',
                      content: delta,
                    });
                    controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));
                  }
                } catch (e) {
                }
              }
            }
          }

          const doneData = JSON.stringify({ type: 'done' });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : '流式传输失败',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });
  }
}
