import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <h2 className={cn('text-foreground/50 font-mono text-xs uppercase tracking-[0.22em]', className)}>
      {children}
    </h2>
  );
}
