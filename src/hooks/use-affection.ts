'use client';

import { useState, useCallback } from 'react';
import { StageLevel, AffectionState } from '@/types/character';
import { getStageByAffection } from '@/data/characters';

const INITIAL_AFFECTION: AffectionState = {
  value: 0,
  stage: 0,
  msgCount: 0,
};

export function useAffection() {
  const [affection, setAffection] = useState<AffectionState>(INITIAL_AFFECTION);
  const [showUnlock, setShowUnlock] = useState<StageLevel | null>(null);

  // 计算阶段
  const getStage = useCallback((value: number): StageLevel => {
    if (value < 30) return 0;
    if (value < 70) return 1;
    return 2;
  }, []);

  // 增加好感度
  const addAffection = useCallback((pts: number) => {
    setAffection((prev) => {
      const newValue = Math.min(100, prev.value + pts);
      const newStage = getStage(newValue);

      // 如果阶段变化，显示解锁弹窗
      if (newStage > prev.stage) {
        setTimeout(() => setShowUnlock(newStage), 400);
      }

      return {
        value: newValue,
        stage: newStage,
        msgCount: prev.msgCount + 1,
      };
    });
  }, [getStage]);

  // 发送消息时增加好感度
  const onSendMessage = useCallback(() => {
    let pts = 3;
    // 连续对话奖励：每5条额外+2
    if ((affection.msgCount + 1) % 5 === 0) {
      pts += 2;
    }
    addAffection(pts);
    return pts;
  }, [affection.msgCount, addAffection]);

  // 关闭解锁弹窗
  const closeUnlock = useCallback(() => {
    setShowUnlock(null);
  }, []);

  // 重置好感度
  const resetAffection = useCallback(() => {
    setAffection(INITIAL_AFFECTION);
    setShowUnlock(null);
  }, []);

  // 获取当前阶段配置
  const currentStage = getStageByAffection(affection.value);

  return {
    affection,
    currentStage,
    showUnlock,
    onSendMessage,
    closeUnlock,
    resetAffection,
    getStageByAffection,
  };
}
