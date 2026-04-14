import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type IconBoxProps = {
  children: ReactNode;
  className?: string;
};

export function IconBox({ children, className }: IconBoxProps) {
  return (
    <span
      className={cn(
        'relative inline-flex size-8 shrink-0 items-center justify-center rounded-sm',
        'bg-linear-to-b from-sky-400 to-sky-600 text-white shadow-lg',
        'ring-1 ring-white/30 ring-offset-2 ring-offset-sky-500 ring-inset',
        className,
      )}
    >
      {children}
    </span>
  );
}
