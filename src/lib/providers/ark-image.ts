import { ImageProvider, ImageGenerationOptions, ImageGenerationResult } from './types';
import { logger } from '@/lib/logger';
import { createErrorFromResponse } from '@/lib/errors/api-errors';

const PROVIDER_NAME = 'ark';
const API_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const API_KEY = process.env.ARK_API_KEY;
const DEFAULT_MODEL = process.env.ARK_MODEL || 'doubao-seedream-4-5-251128';

export class ArkImageProvider implements ImageProvider {
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const startTime = logger.requestStart(PROVIDER_NAME, 'generateImage', {
      hasReferenceImage: !!options?.referenceImageUrl,
      size: options?.size || '2K',
      model: options?.model || DEFAULT_MODEL,
    });

    try {
      if (!API_KEY) {
        throw new Error('ARK_API_KEY is not configured');
      }

      const requestBody = this.buildRequestBody(prompt, options);

      const response = await fetch(`${API_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = createErrorFromResponse(response, PROVIDER_NAME);
        logger.requestError(startTime, PROVIDER_NAME, 'generateImage', error);
        throw error;
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        throw new Error('No image generated');
      }

      const imageUrl = data.data[0].url;

      if (!imageUrl) {
        throw new Error('Image URL is missing in response');
      }

      logger.requestEnd(startTime, PROVIDER_NAME, 'generateImage', response.status, {
        imageSize: data.data[0].size,
      });

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.requestError(startTime, PROVIDER_NAME, 'generateImage', error);
      }
      throw error;
    }
  }

  private buildRequestBody(prompt: string, options?: ImageGenerationOptions) {
    const body: Record<string, unknown> = {
      model: options?.model || DEFAULT_MODEL,
      prompt,
      size: options?.size || '2K',
      watermark: options?.watermark ?? false,
      response_format: 'url',
      stream: false,
      sequential_image_generation: 'disabled',
    };

    if (options?.referenceImageUrl) {
      body.image = [options.referenceImageUrl];
    }

    return body;
  }
}
