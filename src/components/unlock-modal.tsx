'use client';

import { X } from 'lucide-react';
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
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="bg-card border-border/80 animate-scale-in relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ boxShadow: `0 24px 70px -12px ${stage.themeColor}55` }}
      >
        <button
          onClick={onClose}
          className="text-foreground/45 hover:text-foreground absolute top-3 right-3 p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl"
            style={{ backgroundColor: `${stage.themeColor}22` }}
          >
            {stage.icon}
          </div>
        </div>

        <h3
          className="mb-2 text-center text-xl font-semibold"
          style={{ color: stage.themeColor }}
        >
          {stage.icon} {stage.name}
        </h3>

        <p className="text-foreground/65 mb-4 text-center text-sm">
          关系阶段已提升，新的互动内容已解锁
        </p>

        <div
          className="rounded-xl p-4 text-center"
          style={{ backgroundColor: `${stage.themeColor}14` }}
        >
          <p className="text-sm leading-relaxed italic" style={{ color: stage.themeColor }}>
            “{unlockMessage}”
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-black py-2.5 text-sm font-medium text-white transition hover:bg-black/85"
        >
          继续聊天
        </button>
      </div>
    </div>
  );
}
