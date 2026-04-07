import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 场景推断 API
export async function POST(request: NextRequest) {
  try {
    const { messages, character, affection, stageName } = await request.json();

    // 验证参数
    if (!messages || !Array.isArray(messages) || !character) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建场景推断 prompt
    const prompt = buildSceneInferPrompt(messages, character, affection, stageName);

    // 创建 LLM 客户端
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 调用 LLM（非流式）
    const response = await client.invoke([
      { role: 'system', content: '你是一个场景推断助手，根据对话上下文推断图片生成场景。请只返回JSON格式，不要有其他内容。' },
      { role: 'user', content: prompt },
    ], {
      temperature: 0.7,
      model: 'doubao-seed-1-8-251228',
    });

    // 解析响应
    const content = response.content || '';
    
    // 尝试提取 JSON
    let sceneData;
    try {
      // 尝试直接解析
      sceneData = JSON.parse(content);
    } catch {
      // 尝试提取 JSON 块
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          sceneData = JSON.parse(jsonMatch[0]);
        } catch {
          // 解析失败，使用默认场景
          sceneData = getDefaultScene(affection);
        }
      } else {
        sceneData = getDefaultScene(affection);
      }
    }

    return NextResponse.json({
      success: true,
      scene: sceneData,
    });
  } catch (error) {
    console.error('Scene infer API error:', error);
    return NextResponse.json(
      { error: '场景推断失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 构建场景推断 prompt
function buildSceneInferPrompt(
  messages: Array<{ role: string; content: string }>,
  character: {
    name: string;
    age: number;
    profession: string;
    type: string;
    tags: string[];
  },
  affection: number,
  stageName: string
): string {
  // 格式化消息
  const formattedMessages = messages
    .slice(-6) // 最近6条消息
    .map(m => `${m.role === 'user' ? '用户' : character.name}: ${m.content}`)
    .join('\n');

  return `你是场景推断助手。根据对话上下文和角色好感度，推断图片生成场景。

【对话上下文】
${formattedMessages}

【角色信息】
姓名：${character.name}
年龄：${character.age}
职业：${character.profession}
类型：${character.type}
性格：${character.tags.join('、')}

【好感度阶段】
当前阶段：${stageName}
好感度：${affection}/100

【好感度影响规则】
- 初识(0-29)：正式场景，礼貌距离感，职业装，表情克制
- 熟悉(30-69)：休闲场景，自然亲切，商务休闲装，表情自然
- 亲密(70-100)：私密场景，温柔亲密，休闲装/家居服，表情温柔

请根据对话上下文推断当前适合的图片生成场景，返回JSON格式（不要有其他内容）：
{
  "scene": "场景描述（如：办公室、咖啡厅、居家客厅、卧室等）",
  "clothing": "穿着描述（受好感度影响，要具体）",
  "expression": "表情描述（受好感度影响）",
  "action": "动作描述（如：坐在沙发上、倚靠窗边等）",
  "lighting": "光线描述（如：温暖柔和、自然光、夜晚灯光等）",
  "distance": "距离感描述（受好感度影响）"
}`;
}

// 获取默认场景
function getDefaultScene(affection: number): {
  scene: string;
  clothing: string;
  expression: string;
  action: string;
  lighting: string;
  distance: string;
} {
  if (affection < 30) {
    return {
      scene: '办公室',
      clothing: '正式西装',
      expression: '礼貌克制',
      action: '坐在办公桌前',
      lighting: '自然光',
      distance: '保持职业距离',
    };
  } else if (affection < 70) {
    return {
      scene: '咖啡厅',
      clothing: '商务休闲装',
      expression: '自然放松',
      action: '坐在咖啡厅座位上',
      lighting: '温暖柔和',
      distance: '自然亲近',
    };
  } else {
    return {
      scene: '居家客厅',
      clothing: '休闲家居服',
      expression: '温柔亲切',
      action: '坐在沙发上',
      lighting: '温馨暖光',
      distance: '亲密靠近',
    };
  }
}
