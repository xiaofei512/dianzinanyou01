import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/services/image-service';

export async function POST(request: NextRequest) {
  try {
    const { prompt, referenceImageUrl, characterId } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const result = await ImageService.generateImage(prompt, {
      referenceImageUrl,
      characterId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { error: '图片生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
