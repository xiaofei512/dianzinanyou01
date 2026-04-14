import { ChatProvider, ImageProvider, ProviderType } from './types';
import { OpenRouterChatProvider } from './openrouter-chat';
import { ArkImageProvider } from './ark-image';

const USE_FALLBACK = process.env.USE_FALLBACK_PROVIDER === 'true';

let chatProviderInstance: ChatProvider | null = null;
let imageProviderInstance: ImageProvider | null = null;

export function getChatProvider(): ChatProvider {
  if (!chatProviderInstance) {
    chatProviderInstance = new OpenRouterChatProvider();
  }
  return chatProviderInstance;
}

export function getImageProvider(): ImageProvider {
  if (!imageProviderInstance) {
    imageProviderInstance = new ArkImageProvider();
  }
  return imageProviderInstance;
}

export function setChatProvider(provider: ChatProvider) {
  chatProviderInstance = provider;
}

export function setImageProvider(provider: ImageProvider) {
  imageProviderInstance = provider;
}

export type { ChatProvider, ImageProvider, ProviderType };
export * from './types';
