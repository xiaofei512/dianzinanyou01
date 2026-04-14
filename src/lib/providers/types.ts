export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  systemPrompt?: string;
  temperature?: number;
  model?: string;
}

export interface ChatProvider {
  streamChat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ReadableStream<Uint8Array>>;
}

export interface ImageGenerationOptions {
  referenceImageUrl?: string;
  size?: string;
  watermark?: boolean;
  model?: string;
}

export interface ImageGenerationResult {
  success: true;
  imageUrl: string;
}

export interface ImageProvider {
  generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageGenerationResult>;
}

export interface ProviderError extends Error {
  code?: string;
  statusCode?: number;
  provider: string;
}

export type ProviderType = 'coze' | 'openrouter' | 'ark';
