import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// TTS 语音生成 API
export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    // 验证参数
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建 TTS 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new TTSClient(config, customHeaders);

    // 调用 TTS API
    const response = await client.synthesize({
      uid: 'user-' + Date.now(),
      text,
      speaker: voiceId || 'zh_male_m191_uranus_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    // 获取音频数据
    const audioResponse = await fetch(response.audioUri);
    const audioBuffer = await audioResponse.arrayBuffer();

    // 返回音频文件
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: '语音生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
