import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 流式聊天API
export async function POST(request: NextRequest) {
  try {
    const { messages, characterId, systemPrompt } = await request.json();

    // 验证参数
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 创建 LLM 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 构建消息列表
    const llmMessages = [
      // System Prompt
      { role: 'system' as const, content: systemPrompt || '你是一个友好的AI助手。' },
      // 历史消息
      ...messages.map((msg: { role: string; content: string }) => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 调用流式 API
          const llmStream = client.stream(llmMessages, {
            temperature: 0.8,
            model: 'doubao-seed-1-8-251228',
          });

          // 流式输出
          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              const data = JSON.stringify({
                type: 'delta',
                content: text,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 发送完成信号
          const doneData = JSON.stringify({ type: 'done' });
          controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Chat stream error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : '对话生成失败',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    // 返回 SSE 响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: '服务暂时不可用，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
