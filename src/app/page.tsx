'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterSelectPage } from '@/components/character-select-page';
import { ChatPage } from '@/components/chat-page';
import { UnlockModal } from '@/components/unlock-modal';
import { useChatManager } from '@/hooks/use-chat-manager';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, LogOut } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const {
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
    getCachedAudioUrl,
    generateAndCacheAudio,
  } = useChatManager();

  // 检查登录状态
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // 快捷回复建议
  const quickReplies = currentCharacter?.quickReplies || [
    '你好呀',
    '你在做什么？',
    '今天心情怎么样？',
  ];

  // 加载中状态
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // 未登录时不渲染内容（等待重定向）
  if (!user) {
    return null;
  }

  // 处理退出登录
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="min-h-screen relative">
      {/* 退出登录按钮 */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center gap-1 px-3 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        退出
      </button>

      {currentCharacter ? (
        <>
          <ChatPage
            character={currentCharacter}
            messages={messages}
            isTyping={isTyping}
            stage={currentStage}
            affection={affection}
            quickReplies={quickReplies}
            onSendMessage={sendMessage}
            onGoBack={goBackToSelect}
            getCachedAudioUrl={getCachedAudioUrl}
            generateAndCacheAudio={generateAndCacheAudio}
          />
          <UnlockModal
            isOpen={showUnlock}
            stage={currentStage}
            unlockMessage={unlockMessage}
            onClose={closeUnlockModal}
          />
        </>
      ) : (
        <CharacterSelectPage onSelectCharacter={selectCharacter} />
      )}
    </main>
  );
}
