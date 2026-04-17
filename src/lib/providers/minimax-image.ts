import { ImageProvider, ImageGenerationOptions, ImageGenerationResult } from './types';
import { logger } from '@/lib/logger';
import { createErrorFromResponse } from '@/lib/errors/api-errors';

const PROVIDER_NAME = 'minimaxi';
const API_BASE_URL = (process.env.MINIMAX_BASE_URL || 'https://api.minimaxi.com').replace(/\/$/, '');
const IMAGE_GENERATION_URL = `${API_BASE_URL}/v1/image_generation`;
const API_KEY = process.env.MINIMAX_API_KEY;
const DEFAULT_MODEL = process.env.MINIMAX_IMAGE_MODEL || 'image-01';
const DEFAULT_ASPECT_RATIO = process.env.MINIMAX_ASPECT_RATIO || '16:9';

interface MiniMaxImageResponse {
  data?: {
    image_urls?: string[];
  };
  metadata?: {
    failed_count?: string;
    success_count?: string;
  };
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
}

function getUrlHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return 'invalid-url';
  }
}

function getErrorDetails(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { rawError: String(error) };
  }

  const details: Record<string, unknown> = {
    errorName: error.name,
  };

  const maybeCause = (error as Error & { cause?: unknown }).cause;
  if (maybeCause && typeof maybeCause === 'object') {
    const cause = maybeCause as { name?: unknown; code?: unknown; message?: unknown };

    if (typeof cause.name === 'string') {
      details.causeName = cause.name;
    }
    if (typeof cause.code === 'string') {
      details.causeCode = cause.code;
    }
    if (typeof cause.message === 'string') {
      details.causeMessage = cause.message;
    }
  }

  return details;
}

export class MiniMaxImageProvider implements ImageProvider {
  async generateImage(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const model = options?.model || DEFAULT_MODEL;
    const aspectRatio = this.resolveAspectRatio(options?.size);
    const startTime = logger.requestStart(PROVIDER_NAME, 'generateImage', {
      hasReferenceImage: !!options?.referenceImageUrl,
      model,
      aspectRatio,
      endpointHost: getUrlHost(IMAGE_GENERATION_URL),
    });

    let stage = 'prepare';
    let responseStatus: number | undefined;
    let traceId: string | null = null;
    let minimaxRequestId: string | null = null;
    let responseBodySnippet: string | undefined;

    try {
      if (!API_KEY) {
        throw new Error('MINIMAX_API_KEY is not configured');
      }

      stage = 'build_request_body';
      const requestBody = this.buildRequestBody(prompt, options);

      logger.info('minimaxi image_generation request', {
        provider: PROVIDER_NAME,
        metadata: {
          endpoint: IMAGE_GENERATION_URL,
          endpointHost: getUrlHost(IMAGE_GENERATION_URL),
          hasReferenceImage: !!options?.referenceImageUrl,
          model,
          aspectRatio,
          promptLength: prompt.length,
        },
      });

      stage = 'request_image_generation';
      const response = await fetch(IMAGE_GENERATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      responseStatus = response.status;
      traceId = response.headers.get('trace-id');
      minimaxRequestId = response.headers.get('minimax-request-id');

      if (!response.ok) {
        stage = 'handle_non_2xx_response';
        responseBodySnippet = (await response.text()).slice(0, 800);
        throw createErrorFromResponse(response, PROVIDER_NAME);
      }

      stage = 'parse_response_json';
      const data = (await response.json()) as MiniMaxImageResponse;

      const statusCode = data.base_resp?.status_code;
      if (typeof statusCode === 'number' && statusCode !== 0) {
        stage = 'validate_business_status';
        throw new Error(`MiniMax 图片生成失败: ${data.base_resp?.status_msg || `status_code=${statusCode}`}`);
      }

      stage = 'extract_image_url';
      const imageUrl = data.data?.image_urls?.[0];
      if (!imageUrl) {
        throw new Error('Image URL is missing in response');
      }

      logger.requestEnd(startTime, PROVIDER_NAME, 'generateImage', response.status, {
        imageCount: data.data?.image_urls?.length || 0,
        successCount: data.metadata?.success_count,
        failedCount: data.metadata?.failed_count,
        traceId,
        minimaxRequestId,
        imageUrlHost: getUrlHost(imageUrl),
      });

      return {
        success: true,
        imageUrl,
      };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.requestError(startTime, PROVIDER_NAME, 'generateImage', normalizedError, {
        stage,
        endpoint: IMAGE_GENERATION_URL,
        endpointHost: getUrlHost(IMAGE_GENERATION_URL),
        responseStatus,
        traceId,
        minimaxRequestId,
        responseBodySnippet,
        ...getErrorDetails(normalizedError),
      });
      throw error;
    }
  }

  private buildRequestBody(prompt: string, options?: ImageGenerationOptions): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: options?.model || DEFAULT_MODEL,
      prompt,
      aspect_ratio: this.resolveAspectRatio(options?.size),
      n: 1,
    };

    if (options?.referenceImageUrl) {
      body.subject_reference = [
        {
          type: 'character',
          image_file: options.referenceImageUrl,
        },
      ];
    }

    return body;
  }

  private resolveAspectRatio(size?: string): string {
    const normalized = size?.trim();
    if (normalized && /^\d+:\d+$/.test(normalized)) {
      return normalized;
    }

    return DEFAULT_ASPECT_RATIO;
  }
}
