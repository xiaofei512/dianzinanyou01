'use client';

import { CharacterSelectPage } from '@/components/character-select-page';
import { ChatPage } from '@/components/chat-page';
import { UnlockModal } from '@/components/unlock-modal';
import { MarketingHome } from '@/components/site/marketing-home';
import { useChatManager } from '@/hooks/use-chat-manager';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
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

  const quickReplies = currentCharacter?.quickReplies || [
    '你好呀',
    '你在做什么？',
    '今天心情怎么样？',
  ];

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="text-foreground/60 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <MarketingHome />;
  }

  return currentCharacter ? (
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
  );
}
