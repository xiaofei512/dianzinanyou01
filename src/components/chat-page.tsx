'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Character, Message, Stage } from '@/types/character';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, Loader2, Volume2, X } from 'lucide-react';

interface ChatPageProps {
  character: Character;
  messages: Message[];
  isTyping: boolean;
  stage: Stage;
  affection: number;
  quickReplies: string[];
  onSendMessage: (content: string) => void;
  onGoBack: () => void;
  getCachedAudioUrl?: (messageId: string) => string | undefined;
  generateAndCacheAudio?: (messageId: string, text: string) => Promise<string | null>;
}

export function ChatPage({
  character,
  messages,
  isTyping,
  stage,
  affection,
  quickReplies,
  onSendMessage,
  onGoBack,
  getCachedAudioUrl,
  generateAndCacheAudio,
}: ChatPageProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 发送消息
  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // 点击快捷回复
  const handleQuickReply = (reply: string) => {
    if (!isTyping) {
      onSendMessage(reply);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 打开图片预览
  const openImagePreview = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
  }, []);

  // 关闭图片预览
  const closeImagePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#EDE5D8]">
        <div className="flex items-center px-4 py-3">
          {/* 返回按钮 */}
          <button
            onClick={onGoBack}
            className="p-2 -ml-2 text-[#7A6E64] hover:text-[#1A1612] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* 角色信息 */}
          <div className="flex items-center flex-1 ml-2">
            <button
              onClick={() => openImagePreview(character.avatar)}
              className="w-10 h-10 rounded-full overflow-hidden bg-[#F4EFE6] cursor-pointer hover:ring-2 hover:ring-[#C9A96E]/50 transition-all"
            >
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`;
                }}
              />
            </button>
            <div className="ml-3">
              <h2
                className="text-base font-medium text-[#1A1612]"
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              >
                {character.name}
              </h2>
              <p className="text-xs text-[#B0A89E]">{character.profession}</p>
            </div>
          </div>
        </div>

        {/* 好感度进度条 */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3">
            {/* 阶段文字 */}
            <span
              className="text-xs w-10 text-center"
              style={{ color: stage.themeColor }}
            >
              {stage.icon} {stage.name}
            </span>

            {/* 进度条 */}
            <div className="flex-1 h-1 bg-[#EDE5D8] rounded-full relative overflow-hidden">
              {/* 填充 */}
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-600"
                style={{
                  width: `${affection}%`,
                  backgroundColor: stage.themeColor,
                  transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
              {/* 里程碑节点 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{
                  left: '30%',
                  backgroundColor: affection >= 30 ? stage.themeColor : '#B0A89E',
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-white"
                style={{
                  left: '70%',
                  backgroundColor: affection >= 70 ? stage.themeColor : '#B0A89E',
                }}
              />
            </div>

            {/* 数值 */}
            <span
              className="text-xs w-12 text-right tabular-nums"
              style={{ color: stage.themeColor }}
            >
              {affection}/100
            </span>
          </div>
        </div>
      </header>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              characterName={character.name}
              themeColor={stage.themeColor}
              voiceId={character.voiceId}
              onImageClick={openImagePreview}
              getCachedAudioUrl={getCachedAudioUrl}
              generateAndCacheAudio={generateAndCacheAudio}
            />
          ))}

          {/* 打字指示器 */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 快捷回复建议 */}
      {messages.length === 0 && (
        <div className="px-4 pb-2">
          <div className="max-w-lg mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs text-[#7A6E64] bg-white border border-[#C9A96E] rounded-full hover:bg-[#C9A96E]/10 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 输入区 */}
      <div className="sticky bottom-0 bg-[#FAF7F2] border-t border-[#EDE5D8] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说点什么..."
            disabled={isTyping}
            className="flex-1 h-11 px-4 bg-white border border-[#EDE5D8] rounded-[22px] text-sm text-[#1A1612] placeholder-[#B0A89E] focus:outline-none focus:border-[#C9A96E] focus:shadow-sm transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-all',
              input.trim() && !isTyping
                ? 'bg-[#C9A96E] text-white hover:bg-[#B89A5E]'
                : 'bg-[#EDE5D8] text-[#B0A89E] cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 图片全屏预览 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeImagePreview}
        >
          <button
            onClick={closeImagePreview}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

// 消息气泡组件
interface MessageBubbleProps {
  message: Message;
  characterName: string;
  themeColor: string;
  voiceId: string;
  onImageClick: (imageUrl: string) => void;
  getCachedAudioUrl?: (messageId: string) => string | undefined;
  generateAndCacheAudio?: (messageId: string, text: string) => Promise<string | null>;
}

function MessageBubble({ 
  message, 
  characterName, 
  themeColor, 
  voiceId, 
  onImageClick,
  getCachedAudioUrl,
  generateAndCacheAudio
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isImage = message.type === 'image';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 播放语音
  const handlePlayVoice = useCallback(async () => {
    if (!message.content || isUser) return;

    // 如果正在播放，停止
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      let audioUrl: string | undefined;
      
      // 1. 优先使用缓存
      if (getCachedAudioUrl) {
        audioUrl = getCachedAudioUrl(message.id);
      }
      
      // 2. 如果没有缓存，生成新音频
      if (!audioUrl && generateAndCacheAudio) {
        // 使用统一的生成函数，避免重复请求
        audioUrl = await generateAndCacheAudio(message.id, message.content) || undefined;
      }

      if (!audioUrl) {
        throw new Error('Failed to generate audio');
      }

      // 创建并播放音频
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message.content, message.id, isUser, isPlaying, getCachedAudioUrl, generateAndCacheAudio]);

  // 清理音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 图片消息（不显示播放按钮）
  if (isImage && message.imageUrl) {
    return (
      <div className="flex justify-start">
        <div
          className="max-w-[80%] rounded-[18px] rounded-bl-[4px] overflow-hidden cursor-pointer"
          onClick={() => onImageClick(message.imageUrl!)}
        >
          <img
            src={message.imageUrl}
            alt="shared image"
            className="max-w-[250px] max-h-[250px] object-cover"
          />
        </div>
      </div>
    );
  }

  // 文字消息
  return (
    <div
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-[#C9A96E] text-white rounded-[18px] rounded-br-[4px]'
            : 'bg-white border border-[#EDE5D8] text-[#1A1612] rounded-[18px] rounded-bl-[4px]'
        )}
      >
        {/* 文字内容 */}
        <p>{message.content}</p>

        {/* 语音播放按钮 - 仅AI文字消息显示 */}
        {!isUser && message.content && (
          <button
            onClick={handlePlayVoice}
            disabled={isLoading}
            className="mt-2 flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: themeColor }}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isPlaying ? (
              <span className="w-3 h-3 flex items-center justify-center">⏸</span>
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
            {isLoading ? '生成中...' : isPlaying ? '暂停' : '播放语音'}
          </button>
        )}
      </div>
    </div>
  );
}

// 打字指示器
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-[#EDE5D8] rounded-[18px] rounded-bl-[4px] px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#B0A89E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[#B0A89E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[#B0A89E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
