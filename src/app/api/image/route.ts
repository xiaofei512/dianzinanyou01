import { NextRequest, NextResponse } from 'next/server';
import { ImageGenerationClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 图像生成 API（支持图生图）
export async function POST(request: NextRequest) {
  try {
    const { prompt, referenceImageUrl, characterId } = await request.json();

    // 验证参数
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建图像生成客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new ImageGenerationClient(config, customHeaders);

    // 构建最终的 prompt
    let finalPrompt = prompt;
    
    // 如果有参考图，构建图生图 prompt
    if (referenceImageUrl) {
      finalPrompt = `Based on this reference image ${referenceImageUrl}, ${prompt}`;
    }

    // 调用图像生成 API
    const response = await client.generate({
      prompt: finalPrompt,
      size: '2K',
      watermark: false,
    });

    // 使用 helper 处理响应
    const helper = client.getResponseHelper(response);

    if (helper.success && helper.imageUrls.length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: helper.imageUrls[0],
      });
    }

    return NextResponse.json(
      { error: helper.errorMessages.join(', ') || '图片生成失败' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { error: '图片生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
