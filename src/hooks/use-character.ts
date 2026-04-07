'use client';

import { useState, useCallback } from 'react';
import { CharacterId, Character } from '@/types/character';
import { getCharacterById } from '@/data/characters';

export function useCharacter() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentPage, setCurrentPage] = useState<'select' | 'chat'>('select');

  // 选择角色
  const selectCharacter = useCallback((id: CharacterId) => {
    const character = getCharacterById(id);
    if (character) {
      setSelectedCharacter(character);
      setCurrentPage('chat');
    }
  }, []);

  // 返回选择页
  const goBack = useCallback(() => {
    setCurrentPage('select');
  }, []);

  // 返回并重置
  const goBackAndReset = useCallback(() => {
    setCurrentPage('select');
    setSelectedCharacter(null);
  }, []);

  return {
    selectedCharacter,
    currentPage,
    selectCharacter,
    goBack,
    goBackAndReset,
  };
}
