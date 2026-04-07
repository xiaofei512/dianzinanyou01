'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Stage } from '@/types/character';

interface UnlockModalProps {
  isOpen: boolean;
  stage: Stage;
  unlockMessage: string;
  onClose: () => void;
}

export function UnlockModal({ isOpen, stage, unlockMessage, onClose }: UnlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div
        className="relative bg-white rounded-[24px] p-6 max-w-sm w-full animate-scale-in"
        style={{
          boxShadow: `0 20px 60px -10px ${stage.themeColor}40`,
        }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#B0A89E] hover:text-[#1A1612] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 阶段图标 */}
        <div className="text-center mb-4">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${stage.themeColor}15` }}
          >
            {stage.icon}
          </div>
        </div>

        {/* 阶段标题 */}
        <h3
          className="text-center text-xl font-medium mb-2"
          style={{ color: stage.themeColor, fontFamily: 'Noto Serif SC, serif' }}
        >
          {stage.icon} {stage.name}
        </h3>

        {/* 解锁信息 */}
        <p className="text-center text-sm text-[#7A6E64] mb-4">
          恭喜！你们的关系更进一步了
        </p>

        {/* 解锁台词 */}
        <div
          className="rounded-[16px] p-4 text-center"
          style={{ backgroundColor: `${stage.themeColor}08` }}
        >
          <p
            className="text-sm leading-relaxed italic"
            style={{ color: stage.themeColor }}
          >
            "{unlockMessage}"
          </p>
        </div>

        {/* 确认按钮 */}
        <button
          onClick={onClose}
          className="w-full mt-5 py-3 rounded-[22px] text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: stage.themeColor }}
        >
          继续聊天
        </button>
      </div>
    </div>
  );
}
