import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/services/image-service';
import { uploadToR2 } from '@/lib/r2';
import { createGeneratedImage } from '@/storage/database/neon-client';
import { logger } from '@/lib/logger';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getImageExtension(contentType: string): string {
  const normalizedType = contentType.split(';')[0]?.trim().toLowerCase();

  switch (normalizedType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/png':
    default:
      return 'png';
  }
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

function getCurrentUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'string') {
      return null;
    }

    const userId = (payload as JwtPayload & { userId?: number | string }).userId;
    if (typeof userId === 'number') {
      return userId;
    }

    if (typeof userId === 'string') {
      const parsedUserId = Number.parseInt(userId, 10);
      return Number.isNaN(parsedUserId) ? null : parsedUserId;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const requestStart = Date.now();

  let stage = 'parse_request';
  let promptLength: number | undefined;
  let characterId: string | null = null;
  let hasReferenceImage = false;
  let tempImageUrl: string | undefined;
  let tempImageHost: string | undefined;
  let tempImageStatus: number | undefined;
  let tempImageTraceId: string | null = null;
  let tempImageContentType: string | undefined;
  let tempImageSizeBytes: number | undefined;
  let tempImageErrorBodySnippet: string | undefined;
  let r2FileName: string | undefined;
  let permanentUrl: string | undefined;
  let userId: number | null = null;

  logger.info('image api request started', {
    metadata: {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
    },
  });

  try {
    const requestBody = await request.json();
    const prompt = requestBody?.prompt;
    const referenceImageUrl = requestBody?.referenceImageUrl;
    const rawCharacterId = requestBody?.characterId;

    characterId = typeof rawCharacterId === 'string' ? rawCharacterId : null;
    hasReferenceImage = typeof referenceImageUrl === 'string' && referenceImageUrl.length > 0;

    if (!prompt || typeof prompt !== 'string') {
      logger.warn('image api request validation failed', {
        metadata: {
          requestId,
          reason: 'invalid_prompt',
          promptType: typeof prompt,
        },
      });
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    promptLength = prompt.length;

    stage = 'generate_image_with_provider';
    logger.info('image api stage', {
      metadata: {
        requestId,
        stage,
        promptLength,
        hasReferenceImage,
        characterId,
      },
    });

    const result = await ImageService.generateImage(prompt, {
      referenceImageUrl,
      characterId: characterId ?? undefined,
    });

    tempImageUrl = result.imageUrl;
    tempImageHost = getUrlHost(tempImageUrl);

    stage = 'download_temp_image';
    logger.info('image api stage', {
      metadata: {
        requestId,
        stage,
        tempImageHost,
      },
    });

    const tempImageResponse = await fetch(result.imageUrl, { cache: 'no-store' });
    tempImageStatus = tempImageResponse.status;
    tempImageTraceId = tempImageResponse.headers.get('trace-id');

    if (!tempImageResponse.ok) {
      tempImageErrorBodySnippet = (await tempImageResponse.text()).slice(0, 600);
      throw new Error(`下载生成图片失败: ${tempImageResponse.status}`);
    }

    stage = 'normalize_temp_image';
    const rawContentType = tempImageResponse.headers.get('content-type') || 'image/png';
    const contentType = rawContentType.startsWith('image/') ? rawContentType : 'image/png';
    tempImageContentType = contentType;

    const imageBuffer = Buffer.from(await tempImageResponse.arrayBuffer());
    tempImageSizeBytes = imageBuffer.length;

    logger.info('image api temp image downloaded', {
      metadata: {
        requestId,
        tempImageHost,
        tempImageStatus,
        tempImageTraceId,
        contentType,
        sizeBytes: tempImageSizeBytes,
      },
    });

    stage = 'upload_r2';
    r2FileName = `images/${randomUUID()}.${getImageExtension(contentType)}`;
    logger.info('image api stage', {
      metadata: {
        requestId,
        stage,
        r2FileName,
      },
    });

    permanentUrl = await uploadToR2(imageBuffer, r2FileName, contentType);

    logger.info('image api uploaded to r2', {
      metadata: {
        requestId,
        r2FileName,
        permanentUrlHost: getUrlHost(permanentUrl),
      },
    });

    stage = 'save_generated_image_to_db';
    userId = getCurrentUserId(request);

    await createGeneratedImage({
      userId,
      imageUrl: permanentUrl,
      prompt,
      characterId,
    });

    logger.info('image api request completed', {
      duration: Date.now() - requestStart,
      metadata: {
        requestId,
        stage,
        userId,
        characterId,
        permanentUrlHost: getUrlHost(permanentUrl),
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl: permanentUrl,
      requestId,
    });
  } catch (error) {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    logger.error('image api request failed', {
      duration: Date.now() - requestStart,
      error: normalizedError.message,
      metadata: {
        requestId,
        stage,
        promptLength,
        hasReferenceImage,
        characterId,
        tempImageUrl,
        tempImageHost,
        tempImageStatus,
        tempImageTraceId,
        tempImageContentType,
        tempImageSizeBytes,
        tempImageErrorBodySnippet,
        r2FileName,
        permanentUrlHost: permanentUrl ? getUrlHost(permanentUrl) : undefined,
        userId,
        ...getErrorDetails(normalizedError),
      },
    });

    return NextResponse.json(
      { error: '图片生成失败，请稍后重试', requestId },
      { status: 500 }
    );
  }
}
