import { getImageProvider } from '@/lib/providers';
import { ImageGenerationOptions } from '@/lib/providers/types';

export class ImageService {
  static async generateImage(
    prompt: string,
    options?: {
      referenceImageUrl?: string;
      characterId?: string;
    }
  ): Promise<{ success: true; imageUrl: string }> {
    const provider = getImageProvider();

    let finalPrompt = prompt;
    if (options?.referenceImageUrl) {
      finalPrompt = prompt;
    }

    const imageOptions: ImageGenerationOptions = {
      referenceImageUrl: options?.referenceImageUrl,
      size: '2K',
      watermark: false,
    };

    return provider.generateImage(finalPrompt, imageOptions);
  }
}
