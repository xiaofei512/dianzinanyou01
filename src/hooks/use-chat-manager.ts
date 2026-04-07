'use client';

import { useState, useCallback, useEffect } from 'react';
import { CharacterId, Character, Message, Stage } from '@/types/character';
import { getCharacterById, getStageByAffection } from '@/data/characters';

// 聊天状态管理 Hook
export function useChatManager() {
  const [currentCharacterId, setCurrentCharacterId] = useState<CharacterId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [affection, setAffection] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());

  // 生成语音并缓存
  const generateAndCacheAudio = useCallback(async (messageId: string, text: string) => {
    // 检查是否已缓存
    if (audioCache.has(messageId)) {
      return audioCache.get(messageId)!;
    }

    try {
      // 清理文本用于 TTS
      const cleanText = cleanTextForTTS(text);
      if (!cleanText.trim()) return null;

      // 调用 TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) return null;

      // 获取音频 blob 并创建本地 URL
      const audioBlob = await response.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      
      // 缓存 blob URL
      setAudioCache((prev) => new Map(prev).set(messageId, blobUrl));
      return blobUrl;
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
    return null;
  }, []);

  // 预生成短消息语音
  const preGenerateAudioForShortMessage = useCallback((messageId: string, text: string) => {
    const cleanText = cleanTextForTTS(text);
    if (cleanText.length > 0 && cleanText.length <= 50) {
      // 后台预生成，不阻塞 UI
      setTimeout(() => {
        generateAndCacheAudio(messageId, text);
      }, 100);
    }
  }, [generateAndCacheAudio]);

  // 清理语音缓存
  const clearAudioCache = useCallback(() => {
    setAudioCache(new Map());
  }, []);

  // 获取缓存的语音 URL
  const getCachedAudioUrl = useCallback((messageId: string): string | undefined => {
    return audioCache.get(messageId);
  }, [audioCache]);
  
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState('');

  // 获取当前角色
  const currentCharacter: Character | null = currentCharacterId
    ? getCharacterById(currentCharacterId)
    : null;

  // 角色切换时清理缓存
  useEffect(() => {
    clearAudioCache();
  }, [currentCharacterId]);

  // 获取当前阶段
  const currentStage: Stage = currentCharacter
    ? getStageByAffection(affection)
    : { level: 0, name: '初识', minAffection: 0, maxAffection: 29, themeColor: '#B0A89E', icon: '🌱', delay: 800, delayRandom: 900 };

  // 选择角色
  const selectCharacter = useCallback((id: CharacterId) => {
    setCurrentCharacterId(id);
    setMessages([]);
    setAffection(0);
    setShowUnlock(false);
  }, []);

  // 返回角色选择页
  const goBackToSelect = useCallback(() => {
    setCurrentCharacterId(null);
    setMessages([]);
    setAffection(0);
    setShowUnlock(false);
  }, []);

  // 检测是否要求发送图片
  const checkImageRequest = useCallback((content: string): boolean => {
    const imageKeywords = [
      '发张照片', '发照片', '发图片', '发张图片',
      '给我照片', '给我看看', '看看你的照片', '你的照片',
      '发个自拍', '发自拍', '自拍', '照片呢', '照片给我',
      '想看你', '让我看看你', '看看你长什么样', '你长什么样',
      '发一张照片', '来张照片', '来张自拍', '发一张自拍',
      '给我发张', '发给我看看', '想看照片', '想看你的照片'
    ];
    const lowerContent = content.toLowerCase();
    return imageKeywords.some(keyword => lowerContent.includes(keyword));
  }, []);

  // 清理回复内容中的括号内容、图片URL和异常代码片段
  const cleanContent = useCallback((content: string): { text: string; imageUrl: string | null } => {
    let cleaned = content;
    let imageUrl: string | null = null;

    // 提取 URL: [xxx] 中的图片URL
    const urlMatch = cleaned.match(/URL:\s*\[([^\]]+)\]/i);
    if (urlMatch && urlMatch[1]) {
      const url = urlMatch[1];
      // 检查是否是图片URL
      if (url.match(/\.(png|jpg|jpeg|gif|webp)/i) || url.includes('image')) {
        imageUrl = url;
      }
    }

    // 移除 File: [xxx] 格式
    cleaned = cleaned.replace(/File:\s*\[[^\]]*\]/gi, '');
    // 移除 URL: [xxx] 格式
    cleaned = cleaned.replace(/URL:\s*\[[^\]]*\]/gi, '');
    // 移除其他类似的括号内容
    cleaned = cleaned.replace(/\([^)]*\.(png|jpg|jpeg|gif|webp|mp3|mp4)[^)]*\)/gi, '');
    
    // 清理异常代码片段
    cleaned = cleaned.replace(/\bnever_used\b/gi, '');
    cleaned = cleaned.replace(/\bundefined\b/gi, '');
    cleaned = cleaned.replace(/\bnull\b/gi, '');
    // 移除函数调用格式（如 function_name()）
    cleaned = cleaned.replace(/\b[a-z_]+\([^)]*\)/gi, '');
    // 移除 JSON 格式片段
    cleaned = cleaned.replace(/\{[^}]*"[^"]*"[^}]*\}/g, '');
    // 移除代码块标记
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`[^`]+`/g, '');
    
    // 清理多余空格
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return { text: cleaned, imageUrl };
  }, []);

  // 清理 TTS 文本（过滤动作描述）
  const cleanTextForTTS = useCallback((text: string): string => {
    let cleaned = text;
    
    // 移除中文括号内的动作描述
    cleaned = cleaned.replace(/（[^）]+）/g, '');
    // 移除【】内的内容
    cleaned = cleaned.replace(/【[^】]+】/g, '');
    // 移除 *动作* 格式
    cleaned = cleaned.replace(/\*[^*]+\*/g, '');
    // 移除英文括号内的动作描述（如 (smiles)）
    cleaned = cleaned.replace(/\([^)]*[a-z][^)]*\)/gi, '');
    
    // 清理多余空格
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }, []);

  // 生成图片（集成场景推断和图生图）
  const generateImage = useCallback(async (
    character: Character,
    recentMessages: Message[],
    stage: Stage,
    affection: number
  ): Promise<string | null> => {
    try {
      // Step 1: 调用场景推断 API
      const sceneResponse = await fetch('/api/scene-infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          })),
          character: {
            name: character.name,
            age: character.age,
            profession: character.profession,
            type: character.type,
            tags: character.tags,
          },
          affection,
          stageName: stage.name,
        }),
      });

      const sceneData = await sceneResponse.json();
      const scene = sceneData.success ? sceneData.scene : null;

      // Step 2: 构建图生图 prompt
      const prompt = buildImagePrompt(character, scene);

      // Step 3: 调用图片生成 API
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          referenceImageUrl: character.referenceImage,
          characterId: character.id,
        }),
      });

      const data = await response.json();
      return data.success ? data.imageUrl : null;
    } catch (error) {
      console.error('Image generation error:', error);
      return null;
    }
  }, []);

  // 发送消息（流式）
  const sendMessage = useCallback(async (content: string) => {
    if (!currentCharacter || isTyping) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      type: 'text',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // 检测是否要求发送图片
    const isImageRequest = checkImageRequest(content);

    try {
      // 如果用户要求发图片，先生成图片并发送图片消息
      let imageUrl: string | null = null;
      if (isImageRequest) {
        imageUrl = await generateImage(currentCharacter, messages, currentStage, affection);
        
        // 如果图片生成成功，先发送一个图片消息
        if (imageUrl) {
          const imageMessage: Message = {
            id: (Date.now() + 0.5).toString(),
            role: 'assistant',
            content: '',
            type: 'image',
            imageUrl: imageUrl,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, imageMessage]);
        }
      }

      // 构建历史消息
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 动态构建 systemPrompt
      let systemPrompt = buildDynamicSystemPrompt(
        currentCharacter,
        currentStage,
        messages
      );

      // 如果是图片请求，在system prompt中提示
      if (isImageRequest && imageUrl) {
        systemPrompt += `\n\n用户要求看你的照片，你已经发了一张照片给用户。请用符合角色性格的方式简单回应，比如"给你看看我的照片"或"发给你了"之类的话。回复要简短自然。不要在文字中描述照片内容，不要提及File或URL。`;
      }

      // 调用流式 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content }],
          characterId: currentCharacter.id,
          systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessageId = (Date.now() + 1).toString();
      let fullContent = '';

      // 创建空的 AI 消息（纯文字消息）
      const aiMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 读取流
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'delta') {
                fullContent += data.content;
                // 清理内容并更新消息
                const { text: cleanedContent } = cleanContent(fullContent);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: cleanedContent }
                      : msg
                  )
                );
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 最终清理
      const { text: finalContent } = cleanContent(fullContent);
      
      // 如果清理后内容为空，删除这条消息
      if (!finalContent) {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: finalContent }
              : msg
          )
        );
        
        // 预生成短消息语音（后台执行，不阻塞）
        const cleanText = cleanTextForTTS(finalContent);
        if (cleanText.length > 0 && cleanText.length <= 50) {
          setTimeout(() => {
            generateAndCacheAudio(assistantMessageId, finalContent);
          }, 100);
        }
      }

      // 计算好感度增量
      const affectionIncrease = calculateAffectionIncrease(content, finalContent);
      setAffection((prev) => {
        const newAffection = Math.min(100, prev + affectionIncrease);
        
        // 检查阶段变化
        const newStage = getStageByAffection(newAffection);
        const prevStage = getStageByAffection(prev);
        
        if (prevStage.name !== newStage.name && currentCharacter) {
          const unlockIndex = newStage.level - 1;
          if (unlockIndex >= 0 && unlockIndex < currentCharacter.unlockMsg.length) {
            setTimeout(() => {
              setUnlockMessage(currentCharacter.unlockMsg[unlockIndex]);
              setShowUnlock(true);
            }, 500);
          }
        }
        
        return newAffection;
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回复，请稍后再试...',
        type: 'text',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [currentCharacter, messages, isTyping, currentStage, affection, checkImageRequest, generateImage, cleanContent]);

  // 关闭解锁弹窗
  const closeUnlockModal = useCallback(() => {
    setShowUnlock(false);
  }, []);

  return {
    currentCharacter,
    currentStage,
    messages,
    affection,
    isTyping,
    showUnlock,
    unlockMessage,
    selectCharacter,
    goBackToSelect,
    sendMessage,
    closeUnlockModal,
    generateAndCacheAudio,
    getCachedAudioUrl,
    clearAudioCache,
  };
}

// 动态构建 System Prompt（注入阶段语料库和去重提示）
function buildDynamicSystemPrompt(
  character: Character,
  stage: Stage,
  recentMessages: Message[]
): string {
  let prompt = character.systemPrompt;

  // 1. 添加当前阶段信息
  prompt += `\n\n【当前关系阶段】`;
  prompt += `\n你现在和用户的关系是"${stage.name}"阶段。`;
  
  // 根据阶段添加语气指导
  if (stage.level === 0) {
    prompt += ` 你们刚刚认识，保持礼貌距离，回复简短克制。`;
  } else if (stage.level === 1) {
    prompt += ` 你们已经熟悉，可以更自然地表达关心，语气亲切一些。`;
  } else {
    prompt += ` 你们关系亲密，可以表达更深的情感，语气温柔专一。`;
  }

  // 2. 注入阶段语料库
  const stagePool = character.stages[stage.level]?.pool || [];
  if (stagePool.length > 0) {
    prompt += `\n\n【这个阶段你会说的话（风格参考）】`;
    prompt += `\n${stagePool.join('、')}`;
    prompt += `\n请参考这些示例的风格和语气，但不要直接复制，要根据上下文灵活调整。`;
  }

  // 3. 添加去重提示
  const recentAiReplies = recentMessages
    .filter(m => m.role === 'assistant' && m.type === 'text' && m.content)
    .map(m => m.content)
    .slice(-5); // 最近5条AI回复

  if (recentAiReplies.length > 0) {
    prompt += `\n\n【避免重复】`;
    prompt += `\n你最近说过的话：${recentAiReplies.join('、')}`;
    prompt += `\n请避免重复相同的表达，尝试用新的方式回复，但保持角色风格一致。`;
  }

  return prompt;
}

// 计算好感度增量
function calculateAffectionIncrease(userContent: string, aiContent: string): number {
  let increase = 2;

  if (userContent.length > 20) increase += 1;
  if (userContent.length > 50) increase += 2;

  const positiveKeywords = ['喜欢', '想', '开心', '高兴', '谢谢', '感动', '爱'];
  const hasPositive = positiveKeywords.some(keyword => 
    userContent.includes(keyword) || aiContent.includes(keyword)
  );
  if (hasPositive) increase += 2;

  return Math.min(10, increase);
}

// 构建图片生成 prompt
function buildImagePrompt(
  character: Character,
  scene: {
    scene?: string;
    clothing?: string;
    expression?: string;
    action?: string;
    lighting?: string;
    distance?: string;
  } | null
): string {
  // 基础角色信息
  const parts: string[] = [
    `generate a portrait photo of ${character.name}`,
    `${character.age} years old Asian man`,
    character.profession,
    `${character.type} personality`,
    `traits: ${character.tags.join(', ')}`,
  ];

  // 添加场景信息
  if (scene) {
    if (scene.scene) parts.push(`scene: ${scene.scene}`);
    if (scene.clothing) parts.push(`wearing ${scene.clothing}`);
    if (scene.expression) parts.push(`expression: ${scene.expression}`);
    if (scene.action) parts.push(`${scene.action}`);
    if (scene.lighting) parts.push(`${scene.lighting}`);
    if (scene.distance) parts.push(`${scene.distance}`);
  } else {
    // 默认场景
    parts.push('professional portrait setting');
    parts.push('natural lighting');
  }

  // 添加质量要求
  parts.push('maintaining the same facial features as the reference image');
  parts.push('high quality realistic portrait style');

  return parts.join(', ');
}
