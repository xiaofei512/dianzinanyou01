'use client';

import { useState, useCallback } from 'react';
import { CharacterId, Message, ChatSession } from '@/types/character';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat(characterId: CharacterId) {
  const [session, setSession] = useState<ChatSession>({
    characterId,
    messages: [],
    affection: {
      value: 0,
      stage: 0,
      msgCount: 0,
    },
  });

  const [isTyping, setIsTyping] = useState(false);

  // 添加用户消息
  const addUserMessage = useCallback((content: string): Message => {
    const message: Message = {
      id: generateId(),
      role: 'user',
      content,
      type: 'text',
      timestamp: Date.now(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    return message;
  }, []);

  // 添加助手消息
  const addAssistantMessage = useCallback((
    content: string,
    type: 'text' | 'voice' | 'image' = 'text',
    audioUrl?: string,
    imageUrl?: string
  ): Message => {
    const message: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      type,
      audioUrl,
      imageUrl,
      timestamp: Date.now(),
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    return message;
  }, []);

  // 添加图片消息
  const addImageMessage = useCallback((imageUrl: string, content: string = '[图片]'): Message => {
    return addAssistantMessage(content, 'image', undefined, imageUrl);
  }, [addAssistantMessage]);

  // 获取对话历史（用于API）
  const getChatHistory = useCallback(() => {
    return session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }, [session.messages]);

  // 重置会话
  const resetSession = useCallback(() => {
    setSession({
      characterId,
      messages: [],
      affection: {
        value: 0,
        stage: 0,
        msgCount: 0,
      },
    });
    setIsTyping(false);
  }, [characterId]);

  return {
    messages: session.messages,
    isTyping,
    setIsTyping,
    addUserMessage,
    addAssistantMessage,
    addImageMessage,
    getChatHistory,
    resetSession,
  };
}
