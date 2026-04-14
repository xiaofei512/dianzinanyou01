'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Character, Message, Stage } from '@/types/character';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, Loader2, Volume2, X } from 'lucide-react';
import { DottedSeparator } from '@/components/site/dotted-separator';
import { SiteContainer } from '@/components/site/container';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickReply = (reply: string) => {
    if (!isTyping) {
      onSendMessage(reply);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openImagePreview = useCallback((imageUrl: string) => {
    setPreviewImage(imageUrl);
  }, []);

  const closeImagePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return (
    <div className="min-h-[calc(100dvh-8rem)] py-6 md:py-8">
      <SiteContainer className="max-w-4xl">
        <div className="bg-card border-border/80 overflow-hidden rounded-2xl border shadow-sm">
          <header className="bg-theme-bg/80 border-border/75 sticky top-0 z-10 border-b backdrop-blur-sm">
            <div className="flex items-center gap-3 px-4 py-3 md:px-5">
              <button
                onClick={onGoBack}
                className="text-foreground/60 hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition"
              >
                <ArrowLeft className="size-4.5" />
              </button>

              <button
                onClick={() => openImagePreview(character.avatar)}
                className="bg-secondary hover:ring-foreground/20 size-10 cursor-pointer overflow-hidden rounded-full transition hover:ring-2"
              >
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.id}`;
                  }}
                />
              </button>

              <div className="min-w-0 flex-1">
                <h2 className="text-foreground truncate text-sm font-semibold md:text-base">{character.name}</h2>
                <p className="text-foreground/55 truncate text-xs">{character.profession}</p>
              </div>

              <span
                className="rounded-md px-2 py-1 text-xs"
                style={{
                  color: stage.themeColor,
                  backgroundColor: `${stage.themeColor}1A`,
                }}
              >
                {stage.icon} {stage.name}
              </span>
            </div>

            <div className="px-4 pb-4 md:px-5">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-foreground/55">关系进展</span>
                <span className="text-foreground/70 tabular-nums">{affection}/100</span>
              </div>

              <div className="bg-secondary relative h-1.5 overflow-hidden rounded-full">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${affection}%`,
                    backgroundColor: stage.themeColor,
                  }}
                />
              </div>
            </div>

            <DottedSeparator svgClassName="opacity-35" />
          </header>

          <div className="max-h-[56dvh] min-h-[42dvh] overflow-y-auto px-4 py-4 md:px-5">
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  characterName={character.name}
                  themeColor={stage.themeColor}
                  onImageClick={openImagePreview}
                  getCachedAudioUrl={getCachedAudioUrl}
                  generateAndCacheAudio={generateAndCacheAudio}
                />
              ))}

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {messages.length === 0 && (
            <div className="border-border/70 border-t px-4 pb-2 md:px-5">
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pt-3 pb-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="border-border bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground flex-shrink-0 rounded-full border px-3 py-1.5 text-xs transition"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-theme-bg/75 border-border/70 border-t px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="说点什么..."
                disabled={isTyping}
                className="border-border bg-background focus:border-foreground/35 h-11 flex-1 rounded-full border px-4 text-sm outline-none transition disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={cn(
                  'inline-flex size-11 items-center justify-center rounded-full transition',
                  input.trim() && !isTyping
                    ? 'bg-black text-white hover:bg-black/85'
                    : 'bg-secondary text-foreground/35 cursor-not-allowed'
                )}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </SiteContainer>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeImagePreview}
        >
          <button
            onClick={closeImagePreview}
            className="absolute top-4 right-4 p-2 text-white/80 transition-colors hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  characterName: string;
  themeColor: string;
  onImageClick: (imageUrl: string) => void;
  getCachedAudioUrl?: (messageId: string) => string | undefined;
  generateAndCacheAudio?: (messageId: string, text: string) => Promise<string | null>;
}

function MessageBubble({
  message,
  characterName,
  themeColor,
  onImageClick,
  getCachedAudioUrl,
  generateAndCacheAudio,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isImage = message.type === 'image';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayVoice = useCallback(async () => {
    if (!message.content || isUser) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    try {
      let audioUrl: string | undefined;

      if (getCachedAudioUrl) {
        audioUrl = getCachedAudioUrl(message.id);
      }

      if (!audioUrl && generateAndCacheAudio) {
        audioUrl = (await generateAndCacheAudio(message.id, message.content)) || undefined;
      }

      if (!audioUrl) {
        throw new Error('Failed to generate audio');
      }

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (isImage && message.imageUrl) {
    return (
      <div className="flex justify-start">
        <div
          className="max-w-[80%] cursor-pointer overflow-hidden rounded-xl"
          onClick={() => onImageClick(message.imageUrl!)}
        >
          <img
            src={message.imageUrl}
            alt={`${characterName} shared image`}
            className="max-h-[250px] max-w-[250px] object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-black text-white'
            : 'border-border/80 rounded-bl-md border bg-white text-[#181818]'
        )}
      >
        <p>{message.content}</p>

        {!isUser && message.content && (
          <button
            onClick={handlePlayVoice}
            disabled={isLoading}
            className="mt-2 inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: themeColor }}
          >
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isPlaying ? (
              <span className="inline-flex size-3 items-center justify-center">⏸</span>
            ) : (
              <Volume2 className="size-3" />
            )}
            {isLoading ? '生成中...' : isPlaying ? '暂停' : '播放语音'}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="border-border/80 rounded-2xl rounded-bl-md border bg-white px-4 py-3">
        <div className="flex gap-1">
          <span className="bg-foreground/35 h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
          <span className="bg-foreground/35 h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
          <span className="bg-foreground/35 h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
