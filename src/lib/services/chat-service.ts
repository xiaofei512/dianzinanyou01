import { getChatProvider } from '@/lib/providers';
import { ChatMessage, ChatOptions } from '@/lib/providers/types';

export class ChatService {
  static async streamChat(
    messages: Array<{ role: string; content: string }>,
    options?: {
      systemPrompt?: string;
    }
  ): Promise<ReadableStream<Uint8Array>> {
    const provider = getChatProvider();

    const formattedMessages: ChatMessage[] = messages.map((msg) => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));

    const chatOptions: ChatOptions = {
      systemPrompt: options?.systemPrompt,
      temperature: 0.8,
    };

    return provider.streamChat(formattedMessages, chatOptions);
  }
}
